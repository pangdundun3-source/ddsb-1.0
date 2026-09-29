import React from 'react';
import { TerminalItem, UserProfile } from '../types';
import { 
  Monitor, 
  Smartphone, 
  LayoutGrid, 
  Server, 
  ArrowRight, 
  QrCode, 
  Shield, 
  Activity, 
  Lock, 
  Sparkles,
  Info,
  ExternalLink,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface TerminalCardProps {
  terminal: TerminalItem;
  currentUser: UserProfile;
  onEnter: (terminal: TerminalItem, subLinkId?: string) => void;
  onOpenQR: (terminal: TerminalItem) => void;
  onOpenDetail: (terminal: TerminalItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const TerminalCard: React.FC<TerminalCardProps> = ({
  terminal,
  currentUser,
  onEnter,
  onOpenQR,
  onOpenDetail,
}) => {
  const hasAccess = currentUser.allowedTerminals.includes(terminal.id);

  const getPlatformIcon = () => {
    switch (terminal.platformIcon) {
      case 'smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'layout-grid':
        return <LayoutGrid className="w-5 h-5" />;
      case 'server':
        return <Server className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <div 
      className={`group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${
        hasAccess ? '' : 'opacity-85'
      }`}
    >
      {/* Top Gradient Accent Bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${terminal.accentColor}`} />

      {/* Main Content Area */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${terminal.badgeColor}`}>
              {getPlatformIcon()}
              <span>{terminal.terminalType}</span>
            </span>

            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {terminal.code}
            </span>

            <span className="text-[11px] text-slate-400 font-mono">
              {terminal.version}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onOpenDetail(terminal)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="查看端详细规格与接口参数"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & English Subtitle */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
              <span>{terminal.title}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-tight mt-0.5">
            {terminal.englishTitle}
          </p>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 mb-4">
          {terminal.description}
        </p>

        {/* Core Capabilities Checklist */}
        <div className="space-y-2 mb-5 flex-1">
          {terminal.features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="leading-tight">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{feat.title}：</span>
                <span className="text-slate-500 dark:text-slate-400">{feat.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 mb-5">
          <div>
            <div className="text-[10px] text-slate-400 font-medium">今日吞吐</div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {terminal.metrics.todayThroughput}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium">平均延迟</div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {terminal.metrics.avgLatency}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium">当前在线</div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {terminal.metrics.onlineUsers} 人
            </div>
          </div>
        </div>

        {/* Quick Links Sub-modules (Chips) */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-2 flex items-center justify-between">
            <span>核心业务快速直达：</span>
            <span className="text-[10px] text-slate-400 font-normal">点击模块秒级穿透</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {terminal.quickLinks.slice(0, 4).map((sub) => (
              <button
                key={sub.id}
                onClick={() => onEnter(terminal, sub.id)}
                className="p-2 rounded-lg bg-slate-100/70 hover:bg-blue-50 dark:bg-slate-800/50 dark:hover:bg-blue-950/40 text-left transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800 flex items-center justify-between group/chip"
              >
                <div className="truncate">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover/chip:text-blue-600 dark:group-hover/chip:text-blue-400 truncate">
                    {sub.title}
                  </div>
                </div>
                {sub.badge && (
                  <span className="ml-1 px-1 py-0.2 rounded text-[9px] font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
                    {sub.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Access Status & Audience */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-4">
          <div className="flex items-center gap-1.5 truncate max-w-[240px]">
            <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{terminal.permissionLevel}</span>
          </div>
          {hasAccess ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 text-[11px] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              已获权限
            </span>
          ) : (
            <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 text-[11px] shrink-0">
              <Lock className="w-3.5 h-3.5" />
              需切换角色
            </span>
          )}
        </div>

        {/* Main Action Buttons */}
        <div className="flex items-center gap-2">
          {terminal.id === 'v8-audit-h5' ? (
            <>
              <button
                onClick={() => onOpenQR(terminal)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-slate-200/80 dark:border-slate-700"
              >
                <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>手机扫码</span>
              </button>
              <button
                onClick={() => onEnter(terminal)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold shadow-md shadow-emerald-500/15 transition-all flex items-center justify-center gap-1.5 group/btn"
              >
                <span>模拟进入H5</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onEnter(terminal)}
              className={`w-full py-2.5 px-4 rounded-xl bg-gradient-to-r ${terminal.accentColor} text-white text-xs font-semibold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 group/btn`}
            >
              <span>立即进入{terminal.title.split('-')[1]}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
