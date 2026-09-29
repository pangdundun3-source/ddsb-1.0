import React, { useEffect, useState } from 'react';
import { BrandLogo } from './components/BrandLogo';
import { TERMINAL_URLS } from './data/terminalUrls';
import {
  Smartphone,
  Monitor,
  ArrowRight,
  Megaphone,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

type TerminalStatus = 'checking' | 'online' | 'offline' | 'not-started';

interface Terminal {
  id: string;
  name: string;
  enName: string;
  badge: string;
  desc: string;
  url: string;
  accent: string;
  action: 'enter' | 'qr';
  icon: React.ReactNode;
}

interface TerminalStatusResponse {
  terminals?: Record<string, TerminalStatus>;
}

const TERMINALS: Terminal[] = [
  {
    id: 'v8-client',
    name: 'V8-客户管理端',
    enName: 'V8 CRM & Operations',
    badge: '客户运营',
    desc: '面向租户管理员（V8客户身份）的PC端管理应用，具备全机构范围的管理和配置能力，是租户运营的核心管理工具。',
    url: TERMINAL_URLS.v8Client,
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
    url: TERMINAL_URLS.v8AuditPC,
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
    url: TERMINAL_URLS.v8AuditH5,
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
    url: TERMINAL_URLS.mtApp,
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
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
  const [recentTerminals, setRecentTerminals] = useState<Terminal[]>([]);
  const [announcementVisible, setAnnouncementVisible] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const refreshTerminalStatuses = async () => {
      try {
        const response = await fetch(`/api/terminal-status?ts=${Date.now()}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Status check failed');
        }

        const data = (await response.json()) as TerminalStatusResponse;
        if (!isMounted || !data.terminals) {
          return;
        }

        setTerminalStatuses((currentStatuses) => ({
          ...currentStatuses,
          ...data.terminals,
        }));
      } catch {
        if (!isMounted) {
          return;
        }

        setTerminalStatuses(
          Object.fromEntries(TERMINALS.map((terminal) => [terminal.id, 'not-started'])),
        );
      }
    };

    void refreshTerminalStatuses();
    const refreshTimer = window.setInterval(refreshTerminalStatuses, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  const openTerminal = (terminal: Terminal) => {
    setSelectedTerminal(terminal);
    setRecentTerminals((prev) => [terminal, ...prev.filter((t) => t.id !== terminal.id)].slice(0, 3));
  };

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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold tabular-nums">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              测试环境
            </div>
          </div>
        </div>
      </header>

      {/* 主体 */}
      <main className="w-full max-w-6xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="space-y-10">
          {/* 问候区:三步引导 */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1d61d6]/10 border border-[#1d61d6]/20 text-[#1d61d6] text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>点点速豹 · 统一入口导航</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 text-balance">
              点点速豹系统
            </h1>

          </div>

          {/* 终端卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TERMINALS.map((terminal, index) => {
              const isSelected = selectedTerminal?.id === terminal.id;
              const terminalStatus = terminalStatuses[terminal.id] ?? 'checking';
              const status = STATUS_META[terminalStatus];
              return (
                <a
                  key={terminal.id}
                  id={terminal.id}
                  href={terminal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => openTerminal(terminal)}
                  title={`${terminal.enName} · 新标签页打开`}
                  aria-label={`${terminal.name}:${status.label},${terminal.desc}`}
                  style={{
                    '--terminal-accent': terminal.accent,
                    animation: 'portal-rise 0.45s cubic-bezier(0.2, 0, 0, 1) backwards',
                    animationDelay: `${index * 100}ms`,
                    borderColor: isSelected ? terminal.accent : undefined,
                    boxShadow: isSelected ? `0 0 0 4px ${terminal.accent}26` : undefined,
                  } as React.CSSProperties}
                  className="group relative rounded-2xl bg-white border-2 border-[#e2ecf9] transition-[border-color,box-shadow,transform,opacity] duration-200 cursor-pointer flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl hover:border-[var(--terminal-accent)] focus-visible:ring-2 focus-visible:ring-[#1d61d6]/40 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.96]"
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

                    {/* 单一主动作条 */}
                    <div className="pt-4 border-t border-[#f0f4fa] flex items-center justify-between gap-2">
                      <span
                        className="text-[11px] font-mono text-slate-400 truncate min-w-0"
                        title={terminal.url}
                      >
                        {terminal.url}
                      </span>
                      <div className="w-10 h-10 rounded-lg bg-[#f0f4fa] border border-[#e2ecf9] text-slate-500 group-hover:bg-[#f7faff] group-hover:border-[#d6e5fa] flex items-center justify-center transition-[background-color,border-color] duration-200">
                        <ArrowRight
                          className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200"
                          style={{ color: terminal.accent }}
                        />
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* 系统公告 */}
          {announcementVisible && (
            <div className="relative flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#e2ecf9] shadow-sm overflow-hidden">
              {/* 左侧状态色条 */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />

              {/* 图标徽标 */}
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5 text-amber-700" />
              </div>

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">系统公告</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                      维护通知
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline">8/28 22:00-23:00</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnnouncementVisible(false)}
                    aria-label="关闭公告"
                    className="w-10 h-10 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-150 flex items-center justify-center shrink-0 focus-visible:ring-2 focus-visible:ring-[#1d61d6]/40 focus-visible:outline-none"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mt-2">
                  MT 应用管理端将于 8/28 22:00-23:00 升级,期间短暂不可用,请避开该时段操作。
                </p>
              </div>
            </div>
          )}

          {/* 最近使用 */}
          {recentTerminals.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold text-slate-400">最近使用</span>
              {recentTerminals.map((terminal) => (
                <a
                  key={terminal.id}
                  href={terminal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e2ecf9] text-xs font-semibold text-slate-600 hover:border-[#1d61d6] hover:text-[#1d61d6] transition-colors duration-150"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: terminal.accent }} />
                  {terminal.name.replace('V8-', '').replace('MT-', '')}
                </a>
              ))}
            </div>
          )}

          {/* 选中反馈提示 */}
          {selectedTerminal && (
            <div className="p-4 rounded-xl bg-[#eef4fd] border border-[#d6e5fa] text-center flex items-center justify-center gap-2.5 text-sm text-[#1d61d6] font-semibold">
              <ShieldCheck className="w-5 h-5 text-[#1d61d6]" />
              <span>
                已新标签页打开:<strong className="text-slate-900">{selectedTerminal.name}</strong>
              </span>
            </div>
          )}
        </div>
      </main>

      {/* 底部栏 */}
      <footer className="w-full border-t border-[#e2ecf9] bg-white py-5 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-slate-700 font-bold">点点速豹</span>
            <span>·</span>
            <span>v1.0 · 测试环境</span>
          </div>
          <div className="text-slate-400">四端协同统一入口门户</div>
        </div>
      </footer>
    </div>
  );
}
