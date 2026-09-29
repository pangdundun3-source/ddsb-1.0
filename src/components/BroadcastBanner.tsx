import React, { useState } from 'react';
import { SystemBroadcast } from '../types';
import { Bell, ChevronRight, X, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface BroadcastBannerProps {
  broadcasts: SystemBroadcast[];
}

export const BroadcastBanner: React.FC<BroadcastBannerProps> = ({ broadcasts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || broadcasts.length === 0) return null;

  const current = broadcasts[currentIndex];

  const getIcon = (level: SystemBroadcast['level']) => {
    switch (level) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <>
      <div className="w-full bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 dark:from-blue-950/40 dark:via-slate-900/40 dark:to-purple-950/40 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-xs gap-3">
          <div 
            onClick={() => setShowDrawer(true)}
            className="flex-1 flex items-center gap-2.5 cursor-pointer group overflow-hidden"
          >
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-600/10 dark:bg-blue-400/10 text-blue-700 dark:text-blue-300 font-semibold shrink-0">
              <Bell className="w-3.5 h-3.5" />
              <span>系统速报</span>
            </div>
            {getIcon(current.level)}
            <p className="truncate font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {current.title}
            </p>
            <span className="text-slate-400 dark:text-slate-500 shrink-0 text-[11px] hidden sm:inline">
              {current.time}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {broadcasts.length > 1 && (
              <div className="flex items-center gap-1">
                {broadcasts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      idx === currentIndex 
                        ? 'bg-blue-600 dark:bg-blue-400 w-3' 
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    aria-label={`Broadcast ${idx + 1}`}
                  />
                ))}
              </div>
            )}
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
              title="关闭通知条"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Broadcast History Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-slate-900 dark:text-white">系统公告与运行动态</h3>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {broadcasts.map((item) => (
                <div 
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 hover:border-blue-500/30 transition-all space-y-2"
                >
                  <div className="flex items-start gap-2.5">
                    {getIcon(item.level)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {item.title}
                        </h4>
                        <span className="text-[11px] text-slate-400">{item.time}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
              <button
                onClick={() => setShowDrawer(false)}
                className="w-full py-2 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
