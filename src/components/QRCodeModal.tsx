import React, { useState } from 'react';
import { TerminalItem } from '../types';
import { X, Smartphone, Copy, Check, ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';

interface QRCodeModalProps {
  terminal: TerminalItem;
  isOpen: boolean;
  onClose: () => void;
  onLaunchSimulator: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  terminal,
  isOpen,
  onClose,
  onLaunchSimulator,
}) => {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const url = terminal.h5Url || 'https://h5.speedreport.internal/v8-audit?token=sso_temp_8849';

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                {terminal.title} 移动端接入
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                支持 微信 / 企业微信 / 钉钉 / 手机浏览器扫码直达
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* QR Code Container */}
          <div className="relative group p-4 bg-white dark:bg-white rounded-2xl border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/5 mb-4">
            <div className="w-52 h-52 relative flex items-center justify-center bg-white rounded-xl">
              {/* Crisp SVG QR Code Vector */}
              <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
                {/* QR Background & Positioning Marks */}
                <rect width="200" height="200" fill="white" />
                
                {/* Top-Left Finder */}
                <rect x="16" y="16" width="52" height="52" rx="8" fill="#0f172a" />
                <rect x="24" y="24" width="36" height="36" rx="4" fill="white" />
                <rect x="32" y="32" width="20" height="20" rx="3" fill="#059669" />

                {/* Top-Right Finder */}
                <rect x="132" y="16" width="52" height="52" rx="8" fill="#0f172a" />
                <rect x="140" y="24" width="36" height="36" rx="4" fill="white" />
                <rect x="148" y="32" width="20" height="20" rx="3" fill="#059669" />

                {/* Bottom-Left Finder */}
                <rect x="16" y="132" width="52" height="52" rx="8" fill="#0f172a" />
                <rect x="24" y="140" width="36" height="36" rx="4" fill="white" />
                <rect x="32" y="148" width="20" height="20" rx="3" fill="#059669" />

                {/* QR Matrix Elements */}
                <rect x="80" y="20" width="10" height="10" rx="2" fill="#0f172a" />
                <rect x="100" y="20" width="10" height="10" rx="2" fill="#0f172a" />
                <rect x="90" y="36" width="12" height="10" rx="2" fill="#059669" />
                <rect x="110" y="44" width="10" height="12" rx="2" fill="#0f172a" />

                <rect x="24" y="80" width="10" height="10" rx="2" fill="#0f172a" />
                <rect x="44" y="94" width="12" height="12" rx="2" fill="#0f172a" />
                <rect x="20" y="110" width="10" height="10" rx="2" fill="#059669" />
                <rect x="52" y="110" width="10" height="10" rx="2" fill="#0f172a" />

                <rect x="76" y="76" width="48" height="48" rx="8" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" />
                
                <rect x="140" y="80" width="10" height="10" rx="2" fill="#0f172a" />
                <rect x="160" y="90" width="12" height="10" rx="2" fill="#059669" />
                <rect x="134" y="104" width="14" height="10" rx="2" fill="#0f172a" />
                <rect x="170" y="110" width="10" height="12" rx="2" fill="#0f172a" />

                <rect x="80" y="140" width="10" height="10" rx="2" fill="#0f172a" />
                <rect x="100" y="134" width="10" height="14" rx="2" fill="#059669" />
                <rect x="90" y="160" width="12" height="12" rx="2" fill="#0f172a" />
                <rect x="114" y="154" width="10" height="10" rx="2" fill="#0f172a" />
                <rect x="140" y="144" width="14" height="10" rx="2" fill="#0f172a" />
                <rect x="164" y="140" width="10" height="10" rx="2" fill="#059669" />
                <rect x="144" y="166" width="10" height="12" rx="2" fill="#0f172a" />
                <rect x="164" y="164" width="12" height="12" rx="2" fill="#0f172a" />

                {/* Center Badge Icon */}
                <circle cx="100" cy="100" r="16" fill="#059669" />
                <path d="M93 100L98 105L108 95" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            
            {/* Status Pill */}
            <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>动态安全令牌 · 5分钟内有效</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              当前网络环境：企业专线内网通道 (SSL/TLS 1.3)
            </span>
            <button 
              onClick={handleRefresh}
              className={`p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded ${isRefreshing ? 'animate-spin' : ''}`}
              title="刷新二维码令牌"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* URL Copy Bar */}
          <div className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 mb-5">
            <span className="flex-1 truncate text-left font-mono px-1 select-all">{url}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 text-xs font-medium shadow-sm transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制链接</span>
                </>
              )}
            </button>
          </div>

          {/* Actions */}
          <div className="w-full flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              关闭窗口
            </button>
            <button
              onClick={() => {
                onClose();
                onLaunchSimulator();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-medium shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>直接在浏览器模拟体验</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
