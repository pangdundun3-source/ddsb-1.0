import React, { useCallback, useEffect, useState, useRef } from 'react';
import { BrandLogo } from './components/BrandLogo';
import {
  getTerminalUrl,
  FRAME_HASH_MESSAGE,
  OPEN_TERMINAL_MESSAGE,
  STATIC_APPS_MANIFEST,
  type TerminalId,
  type TerminalMode,
} from './data/terminalUrls';
import {
  docLabel,
  getExternalDocUrl,
  getHomeTerminalDocs,
  getTerminalDocs,
  isPortalDoc,
  useTerminalDocs,
} from './data/terminalDocs';
import { TerminalDocsModal } from './components/TerminalDocsModal';
import { TerminalDocViewer } from './components/TerminalDocViewer';
import {
  Smartphone,
  Monitor,
  ArrowRight,
  Megaphone,
  Sparkles,
  X,
  ArrowLeft,
  RotateCw,
  ExternalLink,
  Layers,
  CheckCircle2,
  FileText,
} from 'lucide-react';

type TerminalStatus = 'checking' | 'online' | 'offline' | 'not-started';

interface Terminal {
  id: TerminalId;
  name: string;
  enName: string;
  badge: string;
  desc: string;
  accent: string;
  action: 'enter' | 'qr';
  icon: React.ReactNode;
}

interface TerminalStatusResponse {
  terminals?: Record<string, TerminalStatus>;
}

interface StaticAppsManifest {
  apps?: string[];
}

async function fetchDevStatuses(): Promise<Record<string, TerminalStatus> | null> {
  try {
    const response = await fetch(`./api/terminal-status?ts=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as TerminalStatusResponse;
    return data.terminals ?? null;
  } catch {
    return null;
  }
}

async function fetchStaticApps(): Promise<Set<string>> {
  try {
    const response = await fetch(STATIC_APPS_MANIFEST, { cache: 'no-store' });
    if (!response.ok) {
      return new Set();
    }
    const data = (await response.json()) as StaticAppsManifest;
    return new Set(data.apps ?? []);
  } catch {
    return new Set();
  }
}

const TERMINALS: Terminal[] = [
  {
    id: 'v8-client',
    name: 'V8-客户管理端',
    enName: 'V8 CRM & Operations',
    badge: '客户运营',
    desc: '面向租户管理员（V8客户身份）的PC端管理应用，具备全机构范围的管理和配置能力，是租户运营的核心管理工具。',
    accent: '#1d61d6',
    action: 'enter',
    icon: <Monitor className="w-7 h-7" />,
  },
  {
    id: 'v8-audit-pc',
    name: 'V8-审核上报PC',
    enName: 'V8 Risk Control PC',
    badge: '专职风控',
    desc: '面向子机构管理员（V8网格员身份）的PC端管理应用，以应用内嵌微信身份登录，聚焦子机构范围内的报送管理和统计考核，是连接一线上报与租户管理的中间枢纽',
    accent: '#7c3aed',
    action: 'enter',
    icon: <Monitor className="w-7 h-7" />,
  },
  {
    id: 'v8-audit-h5',
    name: 'V8-审核上报H5',
    enName: 'V8 Mobile Field Audit',
    badge: '移动现场',
    desc: '面向一线上报员和基层审核员的移动端应用，以H5形式提供，支持微信内嵌访问，无需下载安装，即开即用',
    accent: '#059669',
    action: 'enter',
    icon: <Smartphone className="w-7 h-7" />,
  },
  {
    id: 'mt-app',
    name: 'MT-应用管理端',
    enName: 'MT Master Ops Center',
    badge: '底层运维',
    desc: '面向平台运营方（MT身份）的PC端管理应用，负责多租户运营管理和全局配置，是速报系统平台化运营的核心管理工具',
    accent: '#d97706',
    action: 'enter',
    icon: <Monitor className="w-7 h-7" />,
  },
];

const terminalHash = (terminalId: string, docName?: string | null) =>
  docName ? `#/terminal/${terminalId}?doc=${encodeURIComponent(docName)}` : `#/terminal/${terminalId}`;

const DOC_PANEL_WIDTH_KEY = 'portal_doc_panel_width';
const DOC_PANEL_MIN_WIDTH = 360;
/** 原型区最小适配宽度；PRD 分栏挤占后不足时保持该宽度并横向滚动，避免布局变形 */
const PROTOTYPE_FRAME_MIN_WIDTH = 1280;

const STATUS_META: Record<TerminalStatus, { label: string; dot: string; chip: string }> = {
  checking: {
    label: '检测中',
    dot: 'bg-sky-500 animate-pulse',
    chip: 'bg-sky-50 text-sky-600 border-sky-100',
  },
  online: {
    label: '在线',
    dot: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  offline: {
    label: '离线',
    dot: 'bg-rose-500',
    chip: 'bg-rose-50 text-rose-600 border-rose-100',
  },
  'not-started': {
    label: '未启动',
    dot: 'bg-slate-400',
    chip: 'bg-slate-100 text-slate-500 border-slate-200',
  },
};

export default function App() {
  const [terminalStatuses, setTerminalStatuses] = useState<Record<string, TerminalStatus>>(() =>
    Object.fromEntries(TERMINALS.map((terminal) => [terminal.id, 'checking'])),
  );
  const [terminalModes, setTerminalModes] = useState<Record<string, TerminalMode>>({});
  const [activeTerminal, setActiveTerminal] = useState<Terminal | null>(null);
  const [recentTerminals, setRecentTerminals] = useState<Terminal[]>([]);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [entryHash, setEntryHash] = useState<{ terminalId: TerminalId; hash: string } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [docView, setDocView] = useState<{ terminalId: TerminalId; docName: string } | null>(null);
  const docReturnHash = useRef('#/');
  const docsBundle = useTerminalDocs();
  const [panelDoc, setPanelDoc] = useState<string | null>(null);
  const [frameHash, setFrameHash] = useState('');
  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = Number(localStorage.getItem(DOC_PANEL_WIDTH_KEY));
    return Number.isFinite(saved) && saved >= DOC_PANEL_MIN_WIDTH ? saved : 480;
  });
  const [isResizingPanel, setIsResizingPanel] = useState(false);
  const panelDirtyRef = useRef(false);
  const handlePanelDirtyChange = useCallback((dirty: boolean) => {
    panelDirtyRef.current = dirty;
  }, []);

  const getUrl = (terminal: Terminal, hash?: string) =>
    getTerminalUrl(terminal.id, terminalModes[terminal.id] ?? 'static', hash);

  // Sync initial terminal from hash if present (standard #/path format)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '';
      const docMatch = hash.match(/^#\/docs\/([a-z0-9-]+)\/([^/?#]+)/);
      const docTerminal = docMatch && TERMINALS.find((t) => t.id === docMatch[1]);
      if (docMatch && docTerminal) {
        const docName = decodeURIComponent(docMatch[2]);
        if (isPortalDoc(docName)) {
          // 外链 PRD 在原型右侧分栏展示，不进文档中心弹窗
          if (getExternalDocUrl(docTerminal.id, docName)) {
            setDocView(null);
            widenPanelForExternalDoc(docTerminal.id, docName);
            window.history.replaceState(
              null,
              '',
              `${window.location.pathname}${window.location.search}${terminalHash(docTerminal.id, docName)}`,
            );
            setPanelDoc(docName);
            setActiveTerminal(docTerminal);
            setRecentTerminals((prev) => [docTerminal, ...prev.filter((t) => t.id !== docTerminal.id)].slice(0, 4));
            return;
          }
          setDocView({ terminalId: docTerminal.id, docName });
          return;
        }
      }
      setDocView(null);
      // Support standard #/terminal/:id, #/:id, and legacy #terminal=:id
      const match = hash.match(/^#\/?(?:terminal\/)?([a-z0-9-]+)/) || hash.match(/terminal=([a-z0-9-]+)/);
      if (match) {
        const found = TERMINALS.find((t) => t.id === match[1]);
        if (found) {
          const docName = new URLSearchParams(hash.split('?')[1] ?? '').get('doc');
          const nextPanelDoc = docName && isPortalDoc(docName) ? docName : null;
          if (nextPanelDoc) widenPanelForExternalDoc(found.id, nextPanelDoc);
          setPanelDoc(nextPanelDoc);
          setActiveTerminal(found);
          setRecentTerminals((prev) => [found, ...prev.filter((t) => t.id !== found.id)].slice(0, 4));
          return;
        }
      }
      setPanelDoc(null);
      if (!hash || hash === '#' || hash === '#/') {
        setActiveTerminal(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const staticAppsPromise = fetchStaticApps();

    const refreshTerminalStatuses = async () => {
      const [devStatuses, staticApps] = await Promise.all([fetchDevStatuses(), staticAppsPromise]);
      if (!isMounted) {
        return;
      }

      const statuses: Record<string, TerminalStatus> = {};
      const modes: Record<string, TerminalMode> = {};
      for (const terminal of TERMINALS) {
        const devStatus = devStatuses?.[terminal.id];
        if (devStatus === 'online') {
          statuses[terminal.id] = 'online';
          modes[terminal.id] = 'dev';
        } else if (staticApps.has(terminal.id)) {
          statuses[terminal.id] = 'online';
          modes[terminal.id] = 'static';
        } else {
          statuses[terminal.id] = devStatus ?? 'not-started';
          modes[terminal.id] = 'static';
        }
      }

      setTerminalStatuses(statuses);
      setTerminalModes(modes);
    };

    void refreshTerminalStatuses();
    const refreshTimer = window.setInterval(refreshTerminalStatuses, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  const openTerminal = (terminal: Terminal, hash?: string) => {
    setActiveTerminal(terminal);
    setEntryHash(hash ? { terminalId: terminal.id, hash } : null);
    setIframeKey((prev) => prev + 1);
    setRecentTerminals((prev) => [terminal, ...prev.filter((t) => t.id !== terminal.id)].slice(0, 4));
    setFrameHash('');
    const currentDoc = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('doc');
    window.location.hash = terminalHash(terminal.id, currentDoc);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || event.source !== iframeRef.current?.contentWindow) return;
      if (data.type === FRAME_HASH_MESSAGE && typeof data.hash === 'string') {
        setFrameHash(data.hash);
        return;
      }
      if (data.type !== OPEN_TERMINAL_MESSAGE) return;
      const target = TERMINALS.find((t) => t.id === data.terminalId);
      if (target) {
        openTerminal(target, typeof data.hash === 'string' ? data.hash : undefined);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const closeTerminal = () => {
    setActiveTerminal(null);
    setEntryHash(null);
    window.location.hash = '#/';
  };

  const refreshIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  const confirmPanelDiscard = () =>
    !panelDirtyRef.current || window.confirm('当前文档有未保存的修改，确定放弃吗？');

  const widenPanelForExternalDoc = (terminalId: string, docName: string) => {
    if (!getExternalDocUrl(terminalId, docName)) return;
    const half = Math.round(window.innerWidth * 0.5);
    setPanelWidth((width) =>
      width >= half * 0.9 ? width : Math.min(Math.max(half, DOC_PANEL_MIN_WIDTH), Math.round(window.innerWidth * 0.7)),
    );
  };

  const openDocPanel = (docName: string) => {
    if (!activeTerminal || docName === panelDoc) return;
    if (!confirmPanelDiscard()) return;
    widenPanelForExternalDoc(activeTerminal.id, docName);
    // 同步写入状态：hash 未变时不会触发 hashchange（例如恢复 PRD 入口前 URL 已带 ?doc=）
    setPanelDoc(docName);
    const nextHash = terminalHash(activeTerminal.id, docName);
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  };

  const closeDocPanel = () => {
    setPanelDoc(null);
    if (activeTerminal) {
      const nextHash = terminalHash(activeTerminal.id);
      if (window.location.hash !== nextHash) {
        window.location.hash = nextHash;
      }
    }
  };

  /** Same-origin builds expose the frame's location; dev servers on other ports report via FRAME_HASH_MESSAGE */
  const handleFrameLoad = () => {
    try {
      const frameWindow = iframeRef.current?.contentWindow;
      if (!frameWindow) return;
      const update = () => setFrameHash(frameWindow.location.hash);
      update();
      frameWindow.addEventListener('hashchange', update);
      (['pushState', 'replaceState'] as const).forEach((method) => {
        const original = frameWindow.history[method];
        frameWindow.history[method] = function (...args: Parameters<History['pushState']>) {
          original.apply(this, args);
          update();
        };
      });
    } catch {
      // cross-origin frame
    }
  };

  const navigateFrame = (route: string) => {
    const frameWindow = iframeRef.current?.contentWindow;
    if (!frameWindow || !activeTerminal) return;
    const hash = route.startsWith('#') ? route : `#${route}`;
    frameWindow.location.href = new URL(getUrl(activeTerminal, hash), window.location.href).href;
    setFrameHash(hash);
  };

  const startPanelResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    setIsResizingPanel(true);

    let width = panelWidth;
    let raf = 0;
    const maxWidth = () => Math.round(window.innerWidth * 0.7);
    const clampWidth = (clientX: number) =>
      Math.min(Math.max(window.innerWidth - clientX, DOC_PANEL_MIN_WIDTH), maxWidth());

    const handleMove = (moveEvent: PointerEvent) => {
      const next = clampWidth(moveEvent.clientX);
      width = next;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setPanelWidth(next));
    };

    const handleUp = (upEvent: PointerEvent) => {
      cancelAnimationFrame(raf);
      const next = clampWidth(upEvent.clientX);
      width = next;
      setPanelWidth(next);
      setIsResizingPanel(false);
      localStorage.setItem(DOC_PANEL_WIDTH_KEY, String(Math.round(next)));
      try {
        handle.releasePointerCapture(upEvent.pointerId);
      } catch {
        // already released
      }
      handle.removeEventListener('pointermove', handleMove);
      handle.removeEventListener('pointerup', handleUp);
      handle.removeEventListener('pointercancel', handleUp);
    };

    handle.addEventListener('pointermove', handleMove);
    handle.addEventListener('pointerup', handleUp);
    handle.addEventListener('pointercancel', handleUp);
    handleMove(event.nativeEvent);
  };

  const docHash = (terminalId: string, docName: string) => `#/docs/${terminalId}/${encodeURIComponent(docName)}`;

  const openDocs = (terminalId: TerminalId, docName = 'PRD') => {
    // 外链文档进入对应端原型，并在右侧半屏分栏内嵌展示
    if (getExternalDocUrl(terminalId, docName)) {
      window.location.hash = terminalHash(terminalId, docName);
      return;
    }
    const currentHash = window.location.hash || '#/';
    if (!currentHash.startsWith('#/docs/')) {
      docReturnHash.current = currentHash;
    }
    window.location.hash = docHash(terminalId, docName);
  };

  const closeDocs = () => {
    window.location.hash = activeTerminal ? `#/terminal/${activeTerminal.id}` : docReturnHash.current;
  };

  const docsModal = docView ? (
    <TerminalDocsModal
      terminals={TERMINALS.map(({ id, name, accent }) => ({ id, name, accent }))}
      terminalId={docView.terminalId}
      docName={docView.docName}
      onNavigate={(terminalId, docName) => {
        if (getExternalDocUrl(terminalId, docName)) {
          window.location.hash = terminalHash(terminalId, docName);
          return;
        }
        window.location.hash = docHash(terminalId, docName);
      }}
      onClose={closeDocs}
    />
  ) : null;

  // If a terminal is active, render the embedded workbench view
  if (activeTerminal) {
    const url = getUrl(
      activeTerminal,
      entryHash?.terminalId === activeTerminal.id ? entryHash.hash : undefined,
    );

    return (
      <div className="h-screen w-screen flex flex-col bg-[#f0f4f8] text-slate-800 antialiased overflow-hidden">
        {/* Top Workspace Navigation Bar */}
        <header className="h-14 bg-white border-b border-[#e2ecf9] shadow-xs px-4 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={closeTerminal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-[#1d61d6] hover:text-white transition-colors duration-150 shadow-2xs"
              title="返回统一入口门户"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回门户</span>
            </button>

            <div className="h-5 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: activeTerminal.accent }}
              />
              <span className="font-bold text-sm text-slate-900">{activeTerminal.name}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {activeTerminal.badge}
              </span>
            </div>
          </div>

          {/* Quick Terminal Switcher Tabs */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {TERMINALS.map((t) => {
              const isActive = t.id === activeTerminal.id;
              return (
                <button
                  key={t.id}
                  onClick={() => openTerminal(t)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {t.name.replace('V8-', '').replace('MT-', '')}
                </button>
              );
            })}
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {getTerminalDocs(docsBundle, activeTerminal.id).map((doc) => {
              const isOpen = panelDoc === doc.name;
              return (
                <button
                  key={doc.name}
                  onClick={() => {
                    if (!isOpen) openDocPanel(doc.name);
                    else if (confirmPanelDiscard()) closeDocPanel();
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isOpen
                      ? 'bg-[#1d61d6]/10 text-[#1d61d6]'
                      : 'text-slate-600 hover:text-[#1d61d6] hover:bg-slate-100'
                  }`}
                  title={
                    isOpen
                      ? `收起${docLabel(doc.name)}`
                      : getExternalDocUrl(activeTerminal.id, doc.name)
                        ? `在右侧分栏打开飞书${docLabel(doc.name)}`
                        : `在右侧对照查看${docLabel(doc.name)}`
                  }
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{docLabel(doc.name)}</span>
                </button>
              );
            })}

            {getTerminalDocs(docsBundle, activeTerminal.id).length > 0 && (
              <div className="h-5 w-px bg-slate-200" />
            )}

            <button
              onClick={refreshIframe}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="刷新当前终端"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="在新标签页独立打开"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">新标签打开</span>
            </a>
          </div>
        </header>

        {/* Embedded Application Frame：PRD 拖宽不压缩原型，不足最小宽度时横向滚动 */}
        <main className="flex-1 min-h-0 w-full bg-[#f5f7fa] overflow-hidden flex relative">
          {/* 拖拽时遮罩两侧 iframe，避免指针事件被抢走导致不灵敏 */}
          {isResizingPanel && <div className="fixed inset-0 z-40 cursor-col-resize" />}

          <div className="flex-1 min-w-0 relative overflow-x-auto overflow-y-hidden">
            <div className="h-full w-full" style={{ minWidth: PROTOTYPE_FRAME_MIN_WIDTH }}>
              <iframe
                key={`${activeTerminal.id}-${iframeKey}`}
                ref={iframeRef}
                src={url}
                title={activeTerminal.name}
                onLoad={handleFrameLoad}
                className="block w-full h-full border-0"
              />
            </div>
          </div>

          {panelDoc && (
            <>
              <div
                onPointerDown={startPanelResize}
                title="拖动调整宽度"
                className={`relative z-50 shrink-0 w-1 touch-none select-none cursor-col-resize transition-colors ${
                  isResizingPanel ? 'bg-[#1d61d6]' : 'bg-slate-200 hover:bg-[#1d61d6]/70'
                }`}
              >
                {/* 加宽热区，更容易抓取 */}
                <div className="absolute inset-y-0 -left-2 -right-2" />
              </div>
              <aside style={{ width: panelWidth }} className="shrink-0 min-w-0 flex relative z-0">
                <TerminalDocViewer
                  variant="panel"
                  terminalId={activeTerminal.id}
                  terminalName={activeTerminal.name}
                  accent={activeTerminal.accent}
                  docName={panelDoc}
                  shareHash={terminalHash(activeTerminal.id, panelDoc)}
                  title={
                    <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg shrink-0">
                      {getTerminalDocs(docsBundle, activeTerminal.id).map((doc) => (
                        <button
                          key={doc.name}
                          type="button"
                          onClick={() => openDocPanel(doc.name)}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                            doc.name === panelDoc ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {docLabel(doc.name)}
                        </button>
                      ))}
                    </div>
                  }
                  onClose={closeDocPanel}
                  onDirtyChange={handlePanelDirtyChange}
                  onRouteClick={navigateFrame}
                  frameHash={frameHash}
                />
              </aside>
            </>
          )}
        </main>
        {docsModal}
      </div>
    );
  }

  // Portal Landing Page
  return (
    <div className="min-h-screen bg-[#f3f7fd] text-slate-800 flex flex-col justify-between relative selection:bg-[#1d61d6] selection:text-white antialiased">
      <style>{`@keyframes portal-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* 顶部栏:品牌 + 环境标识 + 系统健康度 */}
      <header className="w-full bg-white border-b border-[#e2ecf9] shadow-xs">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BrandLogo className="h-11" />
            <div className="hidden sm:block pl-4 border-l border-slate-200">
              <span className="text-xs font-semibold text-slate-400 tracking-wider">
                多端协同业务统一入口门户
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold tabular-nums">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              系统服务就绪
            </div>
          </div>
        </div>
      </header>

      {/* 主体 */}
      <main className="w-full max-w-6xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="space-y-10">
          {/* 问候区 */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1d61d6]/10 border border-[#1d61d6]/20 text-[#1d61d6] text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>点点速豹 · 统一入口导航</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 text-balance">
              点点速豹多端协同工作台
            </h1>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              集成客户运营中心、基层审核上报移动现场端、专职风控PC及底层运维管理端，点击下方卡片即刻进入体验。
            </p>
          </div>

          {/* 终端卡片列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TERMINALS.map((terminal, index) => {
              const terminalStatus = terminalStatuses[terminal.id] ?? 'online';
              const status = STATUS_META[terminalStatus];
              const url = getUrl(terminal);

              return (
                <div
                  key={terminal.id}
                  id={terminal.id}
                  onClick={() => openTerminal(terminal)}
                  style={{
                    animation: 'portal-rise 0.45s cubic-bezier(0.2, 0, 0, 1) backwards',
                    animationDelay: `${index * 100}ms`,
                  }}
                  className="group relative rounded-2xl bg-white border-2 border-[#e2ecf9] transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl hover:border-slate-300 active:scale-[0.98]"
                >
                  {/* 语义色强调线 */}
                  <div className="h-1.5 w-full" style={{ backgroundColor: terminal.accent }} />

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    {/* 图标 + 弱化分类徽标 */}
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-xl bg-[#eef4fd] border border-[#d6e5fa] group-hover:scale-105 group-hover:shadow-md transition-[transform,box-shadow] duration-200">
                        {React.cloneElement(terminal.icon as React.ReactElement, {
                          style: { color: terminal.accent },
                        })}
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        {terminal.badge}
                      </span>
                    </div>

                    {/* 名称 + 状态徽标 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-lg font-bold text-slate-900 leading-snug">{terminal.name}</h2>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold whitespace-nowrap ${status.chip}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </div>
                      <p
                        className="min-h-[3.75rem] overflow-hidden text-xs text-slate-500 leading-relaxed [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]"
                        title={terminal.desc}
                      >
                        {terminal.desc}
                      </p>
                    </div>

                    {/* 文档入口 */}
                    <div className="flex items-center gap-1.5 flex-wrap empty:hidden">
                      {getHomeTerminalDocs(docsBundle, terminal.id).map((doc) => {
                        const externalUrl = getExternalDocUrl(terminal.id, doc.name);
                        const isEmpty = !externalUrl && !doc.content.trim();
                        return (
                          <button
                            key={doc.name}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openDocs(terminal.id, doc.name);
                            }}
                            title={
                              externalUrl
                                ? `进入原型并在右侧分栏打开飞书${docLabel(doc.name)}`
                                : isEmpty
                                  ? `${docLabel(doc.name)}（待补充）`
                                  : `查看${docLabel(doc.name)}`
                            }
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-semibold transition-colors ${
                              isEmpty
                                ? 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'
                                : 'bg-[#f0f4fa] border-[#e2ecf9] text-slate-600 hover:text-[#1d61d6] hover:border-[#1d61d6]/40'
                            }`}
                          >
                            <FileText className="w-3 h-3" />
                            {docLabel(doc.name)}
                          </button>
                        );
                      })}
                    </div>

                    {/* 动作区 */}
                    <div className="pt-4 border-t border-[#f0f4fa] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 group-hover:text-[#1d61d6] transition-colors">
                        <span>立即进入</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>

                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="在新标签页独立打开"
                        className="w-8 h-8 rounded-lg bg-[#f0f4fa] hover:bg-slate-200 border border-[#e2ecf9] text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 系统公告 */}
          {announcementVisible && (
            <div className="relative flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#e2ecf9] shadow-xs overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">系统就绪公告</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                      全端在线
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnnouncementVisible(false)}
                    aria-label="关闭公告"
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mt-2">
                  速报系统4端（V8客户管理端、V8审核上报PC端、V8移动H5端及MT运维管理端）均已就绪。点击各终端卡片即可在当前环境无缝工作体验。
                </p>
              </div>
            </div>
          )}

          {/* 最近使用 */}
          {recentTerminals.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold text-slate-400">最近使用</span>
              {recentTerminals.map((terminal) => (
                <button
                  key={terminal.id}
                  onClick={() => openTerminal(terminal)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e2ecf9] text-xs font-semibold text-slate-600 hover:border-[#1d61d6] hover:text-[#1d61d6] transition-colors duration-150 shadow-2xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: terminal.accent }} />
                  {terminal.name.replace('V8-', '').replace('MT-', '')}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 底部栏 */}
      <footer className="w-full border-t border-[#e2ecf9] bg-white py-5 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-slate-700 font-bold">点点速豹系统</span>
            <span>·</span>
            <span>v1.0 · 四端协同统一入口门户</span>
          </div>
          <div className="text-slate-400">统一管控 · 协同处置 · 移动现场</div>
        </div>
      </footer>
      {docsModal}
    </div>
  );
}
