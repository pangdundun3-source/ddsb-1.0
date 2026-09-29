import React from 'react';
import { TerminalItem } from '../types';
import { X, CheckCircle2, Shield, Activity, Users, FileCode, ExternalLink, QrCode } from 'lucide-react';

interface TerminalDetailDrawerProps {
  terminal: TerminalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEnter: (terminal: TerminalItem) => void;
  onOpenQR: (terminal: TerminalItem) => void;
}

export const TerminalDetailDrawer: React.FC<TerminalDetailDrawerProps> = ({
  terminal,
  isOpen,
  onClose,
  onEnter,
  onOpenQR,
}) => {
  if (!isOpen || !terminal) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${terminal.badgeColor}`}>
              {terminal.terminalType}
            </span>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {terminal.title}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {terminal.code} · {terminal.version}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-600 dark:text-slate-300">
          {/* Summary */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              端定位与业务定位
            </h4>
            <p className="leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              {terminal.description}
            </p>
          </div>

          {/* Key Metrics */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              实时运行指标
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400">今日吞吐</div>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">{terminal.metrics.todayThroughput}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400">网络延迟</div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{terminal.metrics.avgLatency}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400">在线会话</div>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">{terminal.metrics.onlineUsers} 人</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400">健康度</div>
                <div className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">{terminal.metrics.healthRate}</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              核心功能与技术特性
            </h4>
            <div className="space-y-2">
              {terminal.features.map((feat, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{feat.title}</div>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5">{feat.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audience & Security */}
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 space-y-2">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-semibold">
              <Users className="w-4 h-4" />
              <span>适用人员角色：{terminal.targetAudience}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-[11px]">
              <Shield className="w-4 h-4 text-slate-400" />
              <span>访问控制要求：{terminal.permissionLevel}</span>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
          {terminal.id === 'v8-audit-h5' && (
            <button
              onClick={() => {
                onClose();
                onOpenQR(terminal);
              }}
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>扫码接入</span>
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              onEnter(terminal);
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r ${terminal.accentColor} text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2`}
          >
            <span>立即进入该端工作台</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
