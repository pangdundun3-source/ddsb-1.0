import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/i18n/zh-cn';
import { fromEditorMarkdown, resolveDocAssetUrl, toEditorMarkdown, uploadDocAsset } from '../data/terminalDocs';

export interface DocRichEditorHandle {
  /** Index into the document's headings (levels 1–4, as returned by extractDocHeadings) */
  scrollToHeading: (index: number, options?: { offset?: number; instant?: boolean }) => void;
  /** Heading at the top of the viewport and how far the view has scrolled past it */
  getReadingPosition: () => DocReadingPosition | null;
}

export interface DocReadingPosition {
  index: number;
  offset: number;
}

interface DocRichEditorProps {
  ref?: Ref<DocRichEditorHandle>;
  terminalId: string;
  initialValue: string;
  compact: boolean;
  /** Source lines of the current headings, needed to locate them in markdown mode */
  headingLines: number[];
  /** Called once with the editor's normalized markdown, used as the "unchanged" baseline */
  onReady: (markdown: string) => void;
  onChange: (markdown: string) => void;
  onSave: () => void;
  onError: (message: string) => void;
  /** Index of the heading at the top of the viewport, -1 when above the first heading */
  onActiveHeading: (index: number) => void;
}

const TOOLBAR_ITEMS = [
  ['heading', 'bold', 'italic', 'strike'],
  ['hr', 'quote'],
  ['ul', 'ol', 'indent', 'outdent'],
  ['table', 'image', 'link'],
  ['code', 'codeblock'],
];
const HEADING_TOP_OFFSET = 8;

export default function DocRichEditor({
  ref,
  terminalId,
  initialValue,
  compact,
  headingLines,
  onReady,
  onChange,
  onSave,
  onError,
  onActiveHeading,
}: DocRichEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const callbacksRef = useRef({ onChange, onSave, onError, onActiveHeading });
  callbacksRef.current = { onChange, onSave, onError, onActiveHeading };
  const headingLinesRef = useRef(headingLines);
  headingLinesRef.current = headingLines;

  const headingElements = (): (HTMLElement | undefined)[] => {
    const editor = editorRef.current;
    const root = containerRef.current;
    if (!editor || !root) return [];
    if (editor.isMarkdownMode()) {
      // Markdown mode renders one child element per source line
      const lines = root.querySelector('.toastui-editor-md-container .ProseMirror')?.children;
      return headingLinesRef.current.map((line) => lines?.[line - 1] as HTMLElement | undefined);
    }
    return [...root.querySelectorAll<HTMLElement>('.toastui-editor-ww-container .ProseMirror :is(h1, h2, h3, h4)')];
  };

  const offsetInScroller = (element: HTMLElement) => {
    const scroller = element.closest<HTMLElement>('.ProseMirror');
    if (!scroller) return null;
    return { scroller, top: element.getBoundingClientRect().top - scroller.getBoundingClientRect().top };
  };

  const reportActiveHeading = () => {
    let active = -1;
    headingElements().forEach((element, index) => {
      const offset = element && offsetInScroller(element);
      if (offset && offset.top <= HEADING_TOP_OFFSET * 3) active = index;
    });
    callbacksRef.current.onActiveHeading(active);
  };

  useImperativeHandle(ref, () => ({
    scrollToHeading: (index, options) => {
      const element = headingElements()[index];
      const offset = element && offsetInScroller(element);
      if (!offset) return;
      offset.scroller.scrollTo({
        top: offset.scroller.scrollTop + offset.top - HEADING_TOP_OFFSET + (options?.offset ?? 0),
        behavior: options?.instant ? 'instant' : 'smooth',
      });
    },
    getReadingPosition: () => {
      let position: DocReadingPosition | null = null;
      headingElements().forEach((element, index) => {
        const offset = element && offsetInScroller(element);
        if (offset && offset.top <= HEADING_TOP_OFFSET) position = { index, offset: HEADING_TOP_OFFSET - offset.top };
      });
      return position;
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;
    const root = containerRef.current;
    const readMarkdown = () => fromEditorMarkdown(terminalId, editor.getMarkdown());
    const editor = new Editor({
      el: root,
      height: '100%',
      initialEditType: 'wysiwyg',
      previewStyle: compact ? 'tab' : 'vertical',
      initialValue: toEditorMarkdown(terminalId, initialValue),
      language: 'zh-CN',
      usageStatistics: false,
      autofocus: false,
      toolbarItems: TOOLBAR_ITEMS,
      hooks: {
        addImageBlobHook: (blob, callback) => {
          uploadDocAsset(terminalId, blob)
            .then((assetPath) => callback(resolveDocAssetUrl(terminalId, assetPath), ''))
            .catch((error: unknown) => callbacksRef.current.onError(error instanceof Error ? error.message : '图片上传失败'));
        },
      },
    });
    editorRef.current = editor;
    onReady(readMarkdown());
    editor.on('change', () => callbacksRef.current.onChange(readMarkdown()));

    let frame = 0;
    const scheduleReport = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(reportActiveHeading);
    };
    // Scroll events do not bubble; capture them from the editor's inner scrollers
    root.addEventListener('scroll', scheduleReport, true);
    editor.on('changeMode', scheduleReport);
    scheduleReport();

    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener('scroll', scheduleReport, true);
      editorRef.current = null;
      editor.destroy();
    };
    // Recreate only when switching documents; onReady is read once per editor instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminalId, initialValue, compact]);

  return (
    <div
      className="doc-rich-editor h-full"
      onKeyDownCapture={(event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
          event.preventDefault();
          event.stopPropagation();
          callbacksRef.current.onSave();
        }
      }}
    >
      <div ref={containerRef} className="h-full" />
    </div>
  );
}
