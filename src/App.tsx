import React, { useEffect, useState, useRef } from 'react';
import { BrandLogo } from './components/BrandLogo';
import {
  getTerminalUrl,
  STATIC_APPS_MANIFEST,
  type TerminalId,
  type TerminalMode,
} from './data/terminalUrls';
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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const getUrl = (terminal: Terminal) =>
    getTerminalUrl(terminal.id, terminalModes[terminal.id] ?? 'static');

  // Sync initial terminal from hash if present (standard #/path format)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '';
      // Support standard #/terminal/:id, #/:id, and legacy #terminal=:id
      const match = hash.match(/^#\/?(?:terminal\/)?([a-z0-9-]+)/) || hash.match(/terminal=([a-z0-9-]+)/);
      if (match) {
        const found = TERMINALS.find((t) => t.id === match[1]);
        if (found) {
          setActiveTerminal(found);
          setRecentTerminals((prev) => [found, ...prev.filter((t) => t.id !== found.id)].slice(0, 4));
          return;
        }
      }
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

  const openTerminal = (terminal: Terminal) => {
    setActiveTerminal(terminal);
    setIframeKey((prev) => prev + 1);
    setRecentTerminals((prev) => [terminal, ...prev.filter((t) => t.id !== terminal.id)].slice(0, 4));
    window.location.hash = `#/terminal/${terminal.id}`;
  };

  const closeTerminal = () => {
    setActiveTerminal(null);
    window.location.hash = '#/';
  };

  const refreshIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  // If a terminal is active, render the embedded workbench view
  if (activeTerminal) {
    const url = getUrl(activeTerminal);

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

        {/* Embedded Application Frame */}
        <main className="flex-1 w-full h-[calc(100vh-56px)] bg-[#f5f7fa] overflow-hidden relative">
          <iframe
            key={`${activeTerminal.id}-${iframeKey}`}
            ref={iframeRef}
            src={url}
            title={activeTerminal.name}
            className="w-full h-full border-0"
          />
        </main>
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
    </div>
  );
}
