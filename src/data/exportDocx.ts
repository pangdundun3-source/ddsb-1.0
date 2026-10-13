import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  type IRunOptions,
  type ParagraphChild,
} from 'docx';
import type { BlockContent, List, ListItem, PhrasingContent, Root, RootContent, Table as MdTable } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { downloadBlob, resolveDocAssetUrl, stripPortalOnlyLines } from './terminalDocs';

const BODY_FONT = '微软雅黑';
const CODE_FONT = 'Consolas';
/** Usable width of an A4 page with default margins, in pixels at 96 dpi */
const MAX_IMAGE_WIDTH = 600;
const HEADINGS = [
  HeadingLevel.HEADING_1,
  HeadingLevel.HEADING_2,
  HeadingLevel.HEADING_3,
  HeadingLevel.HEADING_4,
  HeadingLevel.HEADING_5,
  HeadingLevel.HEADING_6,
];
const BULLET_REF = 'doc-bullet';
const ORDERED_REF = 'doc-ordered';
const CELL_BORDER = { style: BorderStyle.SINGLE, size: 4, color: 'D0D7E2' };

interface RunStyle {
  bold?: boolean;
  italics?: boolean;
  strike?: boolean;
  code?: boolean;
}

interface ImageData {
  data: Uint8Array;
  width: number;
  height: number;
}

interface ExportContext {
  terminalId: string;
  images: Map<string, ImageData | null>;
  orderedInstance: number;
}

function loadImage(url: string): Promise<ImageData | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_WIDTH / image.naturalWidth);
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) {
        resolve(null);
        return;
      }
      context.drawImage(image, 0, 0);
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        resolve({ data: new Uint8Array(await blob.arrayBuffer()), width, height });
      }, 'image/png');
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

function collectImageUrls(node: Root | RootContent, urls: Set<string>) {
  if (node.type === 'image') urls.add(node.url);
  if ('children' in node) node.children.forEach((child) => collectImageUrls(child, urls));
}

function inlineRuns(nodes: PhrasingContent[], ctx: ExportContext, style: RunStyle = {}): ParagraphChild[] {
  const runOptions = (text: string): IRunOptions => ({
    text,
    bold: style.bold,
    italics: style.italics,
    strike: style.strike,
    font: style.code ? CODE_FONT : undefined,
    shading: style.code ? { type: ShadingType.CLEAR, color: 'auto', fill: 'F1F5F9' } : undefined,
  });

  return nodes.flatMap((node): ParagraphChild[] => {
    switch (node.type) {
      case 'text':
        return [new TextRun(runOptions(node.value))];
      case 'inlineCode':
        return inlineRuns([{ type: 'text', value: node.value }], ctx, { ...style, code: true });
      case 'strong':
        return inlineRuns(node.children, ctx, { ...style, bold: true });
      case 'emphasis':
        return inlineRuns(node.children, ctx, { ...style, italics: true });
      case 'delete':
        return inlineRuns(node.children, ctx, { ...style, strike: true });
      case 'break':
        return [new TextRun({ text: '', break: 1 })];
      case 'html':
        return /^<br\s*\/?>$/i.test(node.value.trim()) ? [new TextRun({ text: '', break: 1 })] : [];
      case 'link':
        return [
          new ExternalHyperlink({
            link: node.url,
            children: inlineRuns(node.children, ctx, style).map((child) =>
              child instanceof TextRun ? child : new TextRun({ text: '' }),
            ),
          }),
        ];
      case 'image': {
        const image = ctx.images.get(node.url);
        if (!image) return [new TextRun(runOptions(`[图片：${node.alt || node.url}]`))];
        return [
          new ImageRun({
            type: 'png',
            data: image.data,
            transformation: { width: image.width, height: image.height },
            altText: { name: node.alt || 'image', description: node.alt || '', title: node.alt || '' },
          }),
        ];
      }
      default:
        return 'children' in node ? inlineRuns(node.children as PhrasingContent[], ctx, style) : [];
    }
  });
}

function listParagraphs(list: List, ctx: ExportContext, level: number): (Paragraph | Table)[] {
  const instance = list.ordered ? ++ctx.orderedInstance : 0;
  return list.children.flatMap((item: ListItem) =>
    item.children.flatMap((child, index): (Paragraph | Table)[] => {
      if (child.type === 'list') return listParagraphs(child, ctx, Math.min(level + 1, 8));
      if (index === 0 && child.type === 'paragraph') {
        return [
          new Paragraph({
            children: inlineRuns(child.children, ctx),
            numbering: list.ordered
              ? { reference: ORDERED_REF, level, instance }
              : { reference: BULLET_REF, level },
          }),
        ];
      }
      return blockToDocx(child, ctx, { indentLevel: level + 1 });
    }),
  );
}

function tableToDocx(table: MdTable, ctx: ExportContext): Table {
  const columnCount = Math.max(...table.children.map((row) => row.children.length));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: table.children.map(
      (row, rowIndex) =>
        new TableRow({
          tableHeader: rowIndex === 0,
          children: Array.from({ length: columnCount }, (_, cellIndex) => {
            const cell = row.children[cellIndex];
            const align = table.align?.[cellIndex];
            return new TableCell({
              borders: { top: CELL_BORDER, bottom: CELL_BORDER, left: CELL_BORDER, right: CELL_BORDER },
              shading: rowIndex === 0 ? { type: ShadingType.CLEAR, color: 'auto', fill: 'EEF3FB' } : undefined,
              margins: { top: 60, bottom: 60, left: 100, right: 100 },
              children: [
                new Paragraph({
                  alignment: align === 'center' ? AlignmentType.CENTER : align === 'right' ? AlignmentType.RIGHT : undefined,
                  children: cell ? inlineRuns(cell.children, ctx, { bold: rowIndex === 0 }) : [],
                }),
              ],
            });
          }),
        }),
    ),
  });
}

function blockToDocx(
  node: RootContent | BlockContent,
  ctx: ExportContext,
  options: { indentLevel?: number; quote?: boolean } = {},
): (Paragraph | Table)[] {
  const indent = options.indentLevel ? { left: 420 * options.indentLevel } : undefined;
  const quoteBorder = options.quote
    ? { left: { style: BorderStyle.SINGLE, size: 12, color: 'CBD5E1', space: 8 } }
    : undefined;

  switch (node.type) {
    case 'heading':
      return [new Paragraph({ heading: HEADINGS[node.depth - 1], children: inlineRuns(node.children, ctx) })];
    case 'paragraph':
      return [new Paragraph({ indent, border: quoteBorder, children: inlineRuns(node.children, ctx) })];
    case 'list':
      return listParagraphs(node, ctx, options.indentLevel ?? 0);
    case 'table':
      return [tableToDocx(node, ctx), new Paragraph({ children: [] })];
    case 'blockquote':
      return node.children.flatMap((child) => blockToDocx(child, ctx, { ...options, quote: true }));
    case 'code':
      return node.value.split('\n').map(
        (line) =>
          new Paragraph({
            indent,
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F1F5F9' },
            spacing: { before: 0, after: 0 },
            children: [new TextRun({ text: line || ' ', font: CODE_FONT, size: 18 })],
          }),
      );
    case 'thematicBreak':
      return [
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D0D7E2', space: 1 } },
          children: [],
        }),
      ];
    case 'html':
      return [];
    default:
      return 'children' in node
        ? (node.children as RootContent[]).flatMap((child) => blockToDocx(child, ctx, options))
        : [];
  }
}

function levels(format: (typeof LevelFormat)[keyof typeof LevelFormat], textFor: (level: number) => string) {
  return Array.from({ length: 9 }, (_, level) => ({
    level,
    format,
    text: textFor(level),
    alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 420 * (level + 1), hanging: 300 } } },
  }));
}

export async function exportMarkdownToDocx(options: {
  terminalId: string;
  title: string;
  markdown: string;
  fileName: string;
}) {
  const markdown = stripPortalOnlyLines(options.markdown);
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;

  const urls = new Set<string>();
  collectImageUrls(tree, urls);
  const images = new Map<string, ImageData | null>();
  await Promise.all(
    [...urls].map(async (url) => images.set(url, await loadImage(resolveDocAssetUrl(options.terminalId, url)))),
  );

  const ctx: ExportContext = { terminalId: options.terminalId, images, orderedInstance: 0 };
  const children = tree.children.flatMap((node) => blockToDocx(node, ctx));

  const headingStyle = (id: string, name: string, size: number) => ({
    id,
    name,
    basedOn: 'Normal',
    next: 'Normal',
    quickFormat: true,
    run: { font: BODY_FONT, size, bold: true, color: '000000' },
    paragraph: { spacing: { before: 240, after: 120 } },
  });

  const document = new Document({
    title: options.title,
    creator: '速报系统门户',
    styles: {
      default: {
        document: { run: { font: BODY_FONT, size: 21 }, paragraph: { spacing: { line: 360, after: 80 } } },
      },
      paragraphStyles: [
        headingStyle('Heading1', 'Heading 1', 32),
        headingStyle('Heading2', 'Heading 2', 28),
        headingStyle('Heading3', 'Heading 3', 24),
        headingStyle('Heading4', 'Heading 4', 22),
      ],
    },
    numbering: {
      config: [
        { reference: BULLET_REF, levels: levels(LevelFormat.BULLET, (level) => ['●', '○', '■'][level % 3]) },
        { reference: ORDERED_REF, levels: levels(LevelFormat.DECIMAL, (level) => `%${level + 1}.`) },
      ],
    },
    sections: [{ children }],
  });

  downloadBlob(await Packer.toBlob(document), options.fileName);
}
