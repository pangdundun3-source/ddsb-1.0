import React from 'react';
import { Share2, RefreshCw, Copy, Info, X, MessageSquare, Compass, Smartphone } from 'lucide-react';

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onResetData?: () => void;
  onToast: (msg: string) => void;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  isOpen,
  onClose,
  onRefresh,
  onResetData,
  onToast,
}) => {
  if (!isOpen) return null;

  const handleShare = (target: string) => {
    onToast(`已触发微信${target}`);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(window.location.href);
    onToast('已复制网页链接到剪贴板');
    onClose();
  };

  const handleAbout = () => {
    onToast('台中市网信办网格员上报审核端 V8.5');
    onClose();
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center bg-black/45 pb-0 backdrop-blur-xs transition-opacity animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-h-[72%] overflow-y-auto bg-slate-900 text-slate-100 rounded-t-3xl p-4 border-t border-slate-800 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="mx-auto h-1 w-10 rounded-full bg-slate-700" />

        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs text-slate-400 font-medium">网页由 台中市网信办 提供</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <p className="text-xs text-slate-400 mb-3 font-medium">发送给</p>
          <div className="grid grid-cols-4 gap-2.5">
            <button
              onClick={() => handleShare('发送给朋友')}
              className="min-h-[88px] flex flex-col items-center justify-center px-1.5 py-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-active:scale-95 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="text-[11px] leading-tight text-center text-slate-300">发送给朋友</span>
            </button>

            <button
              onClick={() => handleShare('分享到朋友圈')}
              className="min-h-[88px] flex flex-col items-center justify-center px-1.5 py-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-active:scale-95 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-[11px] leading-tight text-center text-slate-300">分享到朋友圈</span>
            </button>

            <button
              onClick={handleCopy}
              className="min-h-[88px] flex flex-col items-center justify-center px-1.5 py-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-active:scale-95 transition-transform">
                <Copy className="w-5 h-5" />
              </div>
              <span className="text-[11px] leading-tight text-center text-slate-300">复制链接</span>
            </button>

            <button
              onClick={() => {
                if (onResetData) onResetData();
                onClose();
              }}
              className="min-h-[88px] flex flex-col items-center justify-center px-1.5 py-3 bg-amber-950/40 hover:bg-amber-900/60 rounded-xl transition-colors space-y-2 group border border-amber-800/40"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-active:scale-95 transition-transform">
                <RefreshCw className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-[11px] leading-tight text-center text-amber-300 font-bold">恢复实验数据</span>
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center text-xs text-slate-400">
          <button
            onClick={handleAbout}
            className="flex items-center space-x-1.5 hover:text-white py-2"
          >
            <Info className="w-4 h-4 text-slate-400" />
            <span>关于台中市速报系统</span>
          </button>

          <span className="text-[10px] text-slate-500">微信 H5 浏览器适配核心 V8</span>
        </div>
      </div>
    </div>
  );
};
