import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Root, RootContent } from 'mdast';
import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  FileCode,
  FileDown,
  FileText,
  ListTree,
  Loader2,
  LocateFixed,
  Pencil,
  RefreshCw,
  Save,
  X,
} from 'lucide-react';
import {
  DOCS_EDITABLE,
  buildSyncInstruction,
  docLabel,
  exportMarkdownFile,
  getDocSyncState,
  getExternalDocUrl,
  resolveDocAssetUrl,
  saveTerminalDoc,
  updateSyncRequest,
  useTerminalDocs,
} from '../data/terminalDocs';
import { extractDocHeadings, findActiveModuleLine, type DocHeading } from '../data/docModules';
import type { DocReadingPosition, DocRichEditorHandle } from './DocRichEditor';

const DocRichEditor = lazy(() => import('./DocRichEditor'));

const TOC_STORAGE_KEY = 'portal_doc_toc_';
const TOC_MAX_LEVEL = 4;

/**
 * Outline entries with their index in `headings`. Sections nested in a prototype-linked module
 * (功能描述/界面原型/业务规则…) repeat in every module, so only linked headings are kept there.
 */
function buildTocItems(headings: DocHeading[]) {
  const ancestors: DocHeading[] = [];
  return headings.flatMap((heading, index) => {
    while (ancestors.length && ancestors[ancestors.length - 1].level >= heading.level) ancestors.pop();
    const insideModule = ancestors.some((ancestor) => ancestor.route);
    ancestors.push(heading);
    return heading.level <= TOC_MAX_LEVEL && (!insideModule || heading.route) ? [{ ...heading, index }] : [];
  });
}

/** The rich editor writes line breaks inside table cells as `<br>`; render them without enabling raw HTML */
function remarkBreakTags() {
  const visit = (node: Root | RootContent) => {
    if (!('children' in node)) return;
    node.children = node.children.map((child) =>
      child.type === 'html' && /^<br\s*\/?>$/i.test(child.value.trim()) ? { type: 'break' } : child,
    ) as typeof node.children;
    node.children.forEach(visit);
  };
  return (tree: Root) => visit(tree);
}

const REMARK_PLUGINS = [remarkGfm, remarkBreakTags];

interface TerminalDocViewerProps {
  variant: 'modal' | 'panel';
  terminalId: string;
  terminalName: string;
  accent: string;
  docName: string;
  /** Replaces the default "端名 · 文档名" title, e.g. with doc tabs */
  title?: React.ReactNode;
  /** Hash (without origin) used by「复制链接」 */
  shareHash: string;
  onClose: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  /** When set, PRD modules with「对应页面」become clickable and navigate the prototype */
  onRouteClick?: (route: string) => void;
  /** Current prototype hash, used to highlight the matching module */
  frameHash?: string;
}

const proseComponents: Components = {
  p: ({ node, ...props }) => <p className="text-sm text-slate-700 leading-7 my-2" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-2 space-y-1 text-sm text-slate-700" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-2 space-y-1 text-sm text-slate-700" {...props} />,
  li: ({ node, ...props }) => <li className="leading-7" {...props} />,
  a: ({ node, href, children, ...props }) =>
    href === '#prd-new' ? (
      <mark className="bg-blue-100 text-blue-700 rounded px-0.5">{children}</mark>
    ) : (
      <a className="text-[#1d61d6] hover:underline" href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    ),
  blockquote: ({ node, ...props }) => (
    <blockquote className="my-3 pl-4 border-l-4 border-slate-200 text-slate-500 [&_p]:text-slate-500" {...props} />
  ),
  code: ({ node, className, ...props }) =>
    className ? (
      <code className={`${className} text-xs`} {...props} />
    ) : (
      <code className="px-1.5 py-0.5 rounded bg-slate-100 text-[13px] text-rose-600" {...props} />
    ),
  pre: ({ node, ...props }) => (
    <pre className="my-3 p-4 rounded-lg bg-slate-900 text-slate-100 text-xs leading-6 overflow-x-auto" {...props} />
  ),
  table: ({ node, ...props }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: ({ node, ...props }) => (
    <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-700" {...props} />
  ),
  td: ({ node, ...props }) => <td className="border border-slate-200 px-3 py-2 text-slate-700 align-top" {...props} />,
  hr: () => <hr className="my-5 border-slate-200" />,
};

const HEADING_CLASSES: Record<number, string> = {
  1: 'text-xl font-bold text-slate-900 mt-6 mb-3',
  2: 'text-lg font-bold text-slate-900 mt-6 mb-3 pb-1.5 border-b border-slate-100',
  3: 'text-base font-bold text-slate-800 mt-5 mb-2',
  4: 'text-sm font-bold text-slate-800 mt-4 mb-2',
};

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) throw new Error('复制失败，请手动复制');
  }
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', { hour12: false });
}

function FeishuDocPanel({
  variant,
  terminalName,
  accent,
  docName,
  title,
  onClose,
  url,
}: Pick<TerminalDocViewerProps, 'variant' | 'terminalName' | 'accent' | 'docName' | 'title' | 'onClose'> & {
  url: string;
}) {
  const isPanel = variant === 'panel';
  return (
    <section className="flex-1 min-w-0 h-full flex flex-col bg-white">
      <header
        className={`${isPanel ? 'px-3 gap-2' : 'px-5 gap-3'} h-14 border-b border-slate-100 flex items-center justify-between shrink-0`}
      >
        <div className="flex items-center gap-2.5 min-w-0">{title ?? (
          <>
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
            <span className="text-sm font-bold text-slate-900 truncate">
              {terminalName} · {docLabel(docName)}
            </span>
          </>
        )}</div>
        <div className="flex items-center gap-1 shrink-0">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#1d61d6] hover:bg-slate-100 transition-colors"
            title="在新标签页打开飞书文档"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">新窗口打开</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>
      <div className="flex-1 min-h-0 relative bg-slate-50">
        <iframe
          key={url}
          src={url}
          title={`${terminalName} ${docLabel(docName)}`}
          className="absolute inset-0 w-full h-full border-0 bg-white"
          allow="clipboard-read; clipboard-write"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}

/** 有飞书链接时直接打开飞书 Wiki（隐藏「原生 PRD」切换入口） */
export function TerminalDocViewer(props: TerminalDocViewerProps) {
  const externalUrl = getExternalDocUrl(props.terminalId, props.docName);
  if (externalUrl) {
    return (
      <FeishuDocPanel
        variant={props.variant}
        terminalName={props.terminalName}
        accent={props.accent}
        docName={props.docName}
        title={props.title}
        onClose={props.onClose}
        url={externalUrl}
      />
    );
  }
  return <LocalTerminalDocViewer {...props} />;
}

function LocalTerminalDocViewer({
  variant,
  terminalId,
  terminalName,
  accent,
  docName,
  title,
  shareHash,
  onClose,
  onDirtyChange,
  onRouteClick,
  frameHash,
}: TerminalDocViewerProps) {
  const isPanel = variant === 'panel';
  const bundle = useTerminalDocs();
  const doc = bundle.docs.find((item) => item.terminalId === terminalId && item.name === docName);
  const content = doc?.content ?? '';
  const syncState = getDocSyncState(bundle, terminalId, docName);

  const [isEditing, setIsEditing] = useState(false);
  /** Content handed to the editor when editing starts; kept stable so saving does not remount the editor */
  const [editorSource, setEditorSource] = useState('');
  const [draft, setDraft] = useState('');
  /** The editor normalizes markdown on load, so dirty state compares against its first output */
  const [editorBaseline, setEditorBaseline] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isRequestingSync, setIsRequestingSync] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showToc, setShowToc] = useState(() => {
    const saved = localStorage.getItem(`${TOC_STORAGE_KEY}${variant}`);
    return saved === null ? !isPanel : saved === '1';
  });
  /** Index into the current headings of the one at the top of the reading/editing area */
  const [activeHeadingIndex, setActiveHeadingIndex] = useState(-1);
  const contentRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<DocRichEditorHandle>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLElement>(null);
  /** Reading position carried across switching between reading and editing */
  const pendingPositionRef = useRef<DocReadingPosition | null>(null);

  const idPrefix = `${variant}-doc-line-`;
  const headingId = (line: number | undefined) => `${idPrefix}${line ?? 0}`;
  const headings = useMemo(() => extractDocHeadings(content), [content]);
  const editorHeadings = useMemo(() => (isEditing ? extractDocHeadings(draft) : []), [isEditing, draft]);
  const editorHeadingLines = useMemo(() => editorHeadings.map((heading) => heading.line), [editorHeadings]);
  const tocItems = useMemo(() => buildTocItems(isEditing ? editorHeadings : headings), [isEditing, editorHeadings, headings]);
  const activeTocIndex = tocItems.reduce((active, item) => (item.index <= activeHeadingIndex ? item.index : active), -1);
  const routeByLine = useMemo(
    () => new Map(headings.filter((heading) => heading.route).map((heading) => [heading.line, heading.route as string])),
    [headings],
  );
  const activeLine = onRouteClick && frameHash !== undefined ? findActiveModuleLine(headings, frameHash) : null;
  const isDirty = isEditing && editorBaseline !== null && draft !== editorBaseline;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    setIsEditing(false);
    setNotice(null);
    pendingPositionRef.current = null;
    contentRef.current?.scrollTo({ top: 0 });
  }, [terminalId, docName]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (activeLine === null || isEditing || pendingPositionRef.current) return;
    document.getElementById(`${idPrefix}${activeLine}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeLine, isEditing, idPrefix]);

  useEffect(() => {
    const position = pendingPositionRef.current;
    const scroller = contentRef.current;
    if (isEditing || !position || !scroller) return;
    pendingPositionRef.current = null;
    // Only h1–h4 are rendered with ids; fall back to the nearest preceding one
    for (let index = position.index; index >= 0; index--) {
      const element = document.getElementById(`${idPrefix}${headings[index]?.line ?? 0}`);
      if (!element) continue;
      const top = element.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
      scroller.scrollTo({ top: top + (index === position.index ? position.offset : 0) });
      return;
    }
  }, [isEditing, headings, idPrefix]);

  useEffect(() => {
    localStorage.setItem(`${TOC_STORAGE_KEY}${variant}`, showToc ? '1' : '0');
  }, [showToc, variant]);

  useEffect(() => {
    setActiveHeadingIndex(-1);
    if (isEditing) return;
    const scroller = contentRef.current;
    if (!scroller) return;
    let frame = 0;
    const update = () => {
      const scrollerTop = scroller.getBoundingClientRect().top;
      let active = -1;
      headings.forEach((heading, index) => {
        if (heading.level > TOC_MAX_LEVEL) return;
        const element = document.getElementById(`${idPrefix}${heading.line}`);
        if (element && element.getBoundingClientRect().top - scrollerTop <= 24) active = index;
      });
      setActiveHeadingIndex(active);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    scroller.addEventListener('scroll', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener('scroll', schedule);
    };
  }, [isEditing, headings, idPrefix]);

  useEffect(() => {
    const nav = tocRef.current;
    const item = nav?.querySelector<HTMLElement>('[data-active="true"]');
    if (!nav || !item) return;
    const navRect = nav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    if (itemRect.top < navRect.top) nav.scrollTop -= navRect.top - itemRect.top + 8;
    else if (itemRect.bottom > navRect.bottom) nav.scrollTop += itemRect.bottom - navRect.bottom + 8;
  }, [activeTocIndex]);

  useEffect(() => {
    if (!isExportMenuOpen) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !exportMenuRef.current?.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [isExportMenuOpen]);

  const confirmDiscard = () => !isDirty || window.confirm('当前文档有未保存的修改，确定放弃吗？');

  const handleClose = () => {
    if (confirmDiscard()) onClose();
  };

  const readViewPosition = (): DocReadingPosition | null => {
    const scroller = contentRef.current;
    if (!scroller) return null;
    const scrollerTop = scroller.getBoundingClientRect().top;
    let position: DocReadingPosition | null = null;
    headings.forEach((heading, index) => {
      const element = document.getElementById(`${idPrefix}${heading.line}`);
      const top = element && element.getBoundingClientRect().top - scrollerTop;
      if (top !== null && top !== undefined && top <= 1) position = { index, offset: -top };
    });
    return position;
  };

  const stopEditing = () => {
    pendingPositionRef.current = editorRef.current?.getReadingPosition() ?? null;
    setIsEditing(false);
  };

  const startEditing = () => {
    pendingPositionRef.current = readViewPosition();
    setEditorSource(content);
    setDraft(content);
    setEditorBaseline(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!isDirty || isSaving) return;
    setIsSaving(true);
    try {
      await saveTerminalDoc(terminalId, docName, draft);
      stopEditing();
      setNotice({ type: 'success', text: '已保存到文档文件' });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : '保存失败' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestSync = async () => {
    setIsRequestingSync(true);
    try {
      if (DOCS_EDITABLE) {
        await updateSyncRequest(terminalId, docName, 'request');
      }
      await copyText(buildSyncInstruction(terminalName, terminalId, docName));
      setNotice({ type: 'success', text: '已复制同步指令，请粘贴到 Cursor 对话中执行' });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : '同步请求失败' });
    } finally {
      setIsRequestingSync(false);
    }
  };

  const handleCancelSync = async () => {
    try {
      await updateSyncRequest(terminalId, docName, 'cancel');
      setNotice({ type: 'success', text: '已取消同步请求' });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : '取消失败' });
    }
  };

  const handleExport = async (format: 'docx' | 'md') => {
    setIsExportMenuOpen(false);
    setIsExporting(true);
    try {
      const date = new Date().toLocaleDateString('sv-SE').replace(/-/g, '');
      const title = `${terminalName}-${docLabel(docName)}`;
      const fileName = `${title}-${date}.${format}`;
      if (format === 'md') {
        await exportMarkdownFile({ terminalId, markdown: content, fileName });
      } else {
        const { exportMarkdownToDocx } = await import('../data/exportDocx');
        await exportMarkdownToDocx({ terminalId, title, markdown: content, fileName });
      }
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? `导出失败：${error.message}` : '导出失败，请重试' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await copyText(`${window.location.origin}${window.location.pathname}${shareHash}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setNotice({ type: 'error', text: '复制失败，请手动复制地址栏链接' });
    }
  };

  const markdownComponents = useMemo<Components>(() => {
    const renderHeading =
      (level: 1 | 2 | 3 | 4) =>
      ({ node, children }: { node?: { position?: { start: { line: number } } }; children?: React.ReactNode }) => {
        const line = node?.position?.start.line;
        const route = line !== undefined ? routeByLine.get(line) : undefined;
        const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4';
        const isActive = line !== undefined && line === activeLine;
        const clickable = !!route && !!onRouteClick;
        return (
          <Tag
            id={headingId(line)}
            onClick={clickable ? () => onRouteClick(route) : undefined}
            title={clickable ? `点击在左侧原型中打开：${route}` : undefined}
            className={`${HEADING_CLASSES[level]} first:mt-0 scroll-mt-4 flex items-center gap-2 rounded-md transition-colors ${
              clickable ? 'cursor-pointer hover:text-[#1d61d6] group' : ''
            } ${isActive ? 'bg-amber-50 ring-1 ring-amber-200 px-2 -mx-2' : ''}`}
          >
            <span className="min-w-0">{children}</span>
            {clickable && (
              <LocateFixed
                className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-600' : 'text-slate-300 group-hover:text-[#1d61d6]'}`}
              />
            )}
          </Tag>
        );
      };
    return {
      ...proseComponents,
      h1: renderHeading(1),
      h2: renderHeading(2),
      h3: renderHeading(3),
      h4: renderHeading(4),
      img: ({ node, src, alt, ...props }) => (
        <img
          src={typeof src === 'string' ? resolveDocAssetUrl(terminalId, src) : undefined}
          alt={alt ?? ''}
          className="my-3 max-w-full rounded-lg border border-slate-200"
          {...props}
        />
      ),
    };
    // headingId only depends on idPrefix
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeByLine, activeLine, onRouteClick, idPrefix, terminalId]);

  const emptyState = (
    <div className="h-full min-h-[16rem] flex flex-col items-center justify-center text-center gap-2 text-slate-400">
      <FileText className="w-10 h-10 text-slate-300" />
      <p className="text-sm font-semibold text-slate-500">暂无内容，待补充</p>
      {DOCS_EDITABLE && <p className="text-xs">点击上方「编辑」开始填写</p>}
    </div>
  );

  return (
    <section className="flex-1 min-w-0 h-full flex flex-col bg-white">
      <header
        className={`${isPanel ? 'px-3 gap-2' : 'px-5 gap-3'} h-14 border-b border-slate-100 flex items-center justify-between shrink-0`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {title ?? (
            <>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
              <span className="text-sm font-bold text-slate-900 truncate">
                {terminalName} · {docLabel(docName)}
              </span>
            </>
          )}
          {syncState.requestedAt ? (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold pl-2 pr-1 py-0.5 rounded-full border whitespace-nowrap bg-amber-50 text-amber-700 border-amber-200"
              title={`请求时间 ${formatTime(syncState.requestedAt)}`}
            >
              待同步
              {DOCS_EDITABLE && (
                <button
                  type="button"
                  onClick={() => void handleCancelSync()}
                  aria-label="取消同步请求"
                  title="取消同步请求"
                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-amber-100"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ) : (
            !isPanel &&
            syncState.lastSyncedAt && (
              <span className="hidden lg:inline text-xs text-slate-400 whitespace-nowrap">
                上次同步 {formatTime(syncState.lastSyncedAt)}
              </span>
            )
          )}
          {!isPanel && doc?.updatedAt && (
            <span className="hidden lg:inline text-xs text-slate-400 whitespace-nowrap">更新于 {formatTime(doc.updatedAt)}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {notice && !isPanel && (
            <span className={`text-xs font-semibold mr-1 ${notice.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {notice.text}
            </span>
          )}
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => confirmDiscard() && stopEditing()}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving || !isDirty}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1d61d6] hover:bg-[#174fb0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                保存
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => void handleRequestSync()}
                disabled={isRequestingSync}
                title="按最新功能同步此文档：复制同步指令，粘贴到 Cursor 对话中执行"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1d61d6] bg-[#1d61d6]/10 hover:bg-[#1d61d6]/15 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRequestingSync ? 'animate-spin' : ''}`} />
                同步
              </button>
              <div ref={exportMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsExportMenuOpen((open) => !open)}
                  disabled={isExporting || !content.trim()}
                  title={content.trim() ? '导出为 Word 或 Markdown 文件' : '文档为空，暂无可导出内容'}
                  aria-haspopup="menu"
                  aria-expanded={isExportMenuOpen}
                  className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    isExportMenuOpen ? 'bg-slate-100' : ''
                  }`}
                >
                  {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                  {!isPanel && '导出'}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {isExportMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-1 z-20 w-56 py-1 rounded-lg border border-slate-200 bg-white shadow-lg"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => void handleExport('docx')}
                      className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-slate-50"
                    >
                      <FileText className="w-4 h-4 mt-0.5 shrink-0 text-[#1d61d6]" />
                      <span>
                        <span className="block text-xs font-semibold text-slate-800">Word 文档（.docx）</span>
                        <span className="block text-[11px] text-slate-400">带标题样式，可在 Word 中生成目录</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => void handleExport('md')}
                      className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-slate-50"
                    >
                      <FileCode className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                      <span>
                        <span className="block text-xs font-semibold text-slate-800">Markdown（.md）</span>
                        <span className="block text-[11px] text-slate-400">可直接导入飞书云文档</span>
                      </span>
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                title="复制链接"
                className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {!isPanel && (copied ? '已复制' : '复制链接')}
              </button>
              <button
                type="button"
                onClick={startEditing}
                disabled={!DOCS_EDITABLE || !doc}
                title={DOCS_EDITABLE ? '编辑文档' : '静态部署版仅可查看，请在本地开发模式下编辑'}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                编辑
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setShowToc((show) => !show)}
            title={showToc ? '隐藏目录' : '显示目录，快速定位章节'}
            aria-pressed={showToc}
            className={`inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showToc ? 'text-[#1d61d6] bg-[#1d61d6]/10 hover:bg-[#1d61d6]/15' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ListTree className="w-3.5 h-3.5" />
            {!isPanel && '目录'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            aria-label="关闭"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {notice && isPanel && (
        <div
          className={`px-4 py-2 text-xs font-semibold border-b ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : 'bg-rose-50 text-rose-700 border-rose-100'
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="flex-1 min-h-0 flex">
        {isEditing ? (
          <div className="flex-1 min-w-0">
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center gap-2 text-sm text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  编辑器加载中…
                </div>
              }
            >
              <DocRichEditor
                ref={editorRef}
                terminalId={terminalId}
                initialValue={editorSource}
                compact={isPanel}
                headingLines={editorHeadingLines}
                onReady={(markdown) => {
                  setEditorBaseline(markdown);
                  setDraft(markdown);
                  const position = pendingPositionRef.current;
                  pendingPositionRef.current = null;
                  if (position) {
                    requestAnimationFrame(() =>
                      editorRef.current?.scrollToHeading(position.index, { offset: position.offset, instant: true }),
                    );
                  }
                }}
                onChange={setDraft}
                onSave={() => void handleSave()}
                onError={(message) => setNotice({ type: 'error', text: message })}
                onActiveHeading={setActiveHeadingIndex}
              />
            </Suspense>
          </div>
        ) : (
          <div ref={contentRef} className={`flex-1 min-w-0 overflow-y-auto ${isPanel ? 'px-5 py-4' : 'px-8 py-6'}`}>
            {content.trim() ? (
              <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={markdownComponents}>
                {content.replace(/==([^=\n]+)==/g, '[$1](#prd-new)')}
              </ReactMarkdown>
            ) : (
              emptyState
            )}
          </div>
        )}
        {showToc && (
          <nav
            ref={tocRef}
            aria-label="本文目录"
            className={`${isPanel ? 'w-44 px-2' : 'w-56 px-3'} shrink-0 border-l border-slate-100 bg-slate-50/60 overflow-y-auto py-3`}
          >
            <div className="px-2 mb-1.5 text-xs font-bold text-slate-500">本文目录</div>
            {tocItems.length > 0 ? (
              <ul className="space-y-px">
                {tocItems.map((heading) => {
                  const isActive = heading.index === activeTocIndex;
                  return (
                    <li key={`${heading.index}-${heading.line}`}>
                      <button
                        type="button"
                        data-active={isActive}
                        onClick={() =>
                          isEditing
                            ? editorRef.current?.scrollToHeading(heading.index)
                            : document
                                .getElementById(headingId(heading.line))
                                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }
                        className={`w-full text-left truncate rounded-md py-1 pr-2 transition-colors ${
                          heading.level === 1 ? 'text-xs font-semibold' : 'text-xs'
                        } ${
                          isActive
                            ? 'bg-[#1d61d6]/10 text-[#1d61d6] font-semibold'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                        style={{ paddingLeft: `${8 + (heading.level - 1) * 12}px` }}
                        title={heading.text}
                      >
                        {heading.text}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-2 text-xs text-slate-400 leading-5">暂无标题。用工具栏「标题」或 # 开头添加章节后会出现在这里。</p>
            )}
          </nav>
        )}
      </div>
    </section>
  );
}
