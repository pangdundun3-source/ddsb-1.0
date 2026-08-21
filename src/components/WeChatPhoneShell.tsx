import React, { useState } from 'react';
import {
  ChevronLeft,
  MoreHorizontal,
  Home,
  FileText,
  CheckSquare,
  User,
  Smartphone,
  Maximize2,
  Minimize2,
  RefreshCw,
  ShieldCheck,
  Wifi,
  Battery,
  Signal,
  X,
} from 'lucide-react';
import { AppTab } from '../types';

interface WeChatPhoneShellProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  auditPendingCount: number;
  reportPendingCount: number;
  onOpenActionSheet: () => void;
  onResetDemoData?: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
  pageTitle?: string;
  isLoggedIn: boolean;
  hideTabBar?: boolean;
  hideFAB?: boolean;
  overlay?: React.ReactNode;
  children: React.ReactNode;
}

export const WeChatPhoneShell: React.FC<WeChatPhoneShellProps> = ({
  currentTab,
  onSelectTab,
  auditPendingCount,
  reportPendingCount,
  onOpenActionSheet,
  onResetDemoData,
  onBack,
  canGoBack = false,
  pageTitle = '台中市网信办工作台',
  isLoggedIn,
  hideTabBar = false,
  hideFAB = false,
  overlay,
  children,
}) => {
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);
  const currentTime = '09:41';

  return (
    <div className="min-h-screen bg-slate-200/80 text-slate-800 flex flex-col items-center justify-start p-2 sm:p-6 font-sans">
      {/* Desktop Shell Control Toolbar */}
      <header className="w-full max-w-5xl mb-4 flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-xs border border-slate-200/80 text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-semibold text-slate-800">微信公众号 H5 预览</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500">{isMobileFrame ? 'iPhone 外壳模拟器' : '全屏体验'}</span>
        </div>

        <div className="flex items-center space-x-2">
          {onResetDemoData && (
            <button
              onClick={onResetDemoData}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold transition-all shadow-xs"
              title="恢复/重置 5 条待审核实验数据"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>恢复实验数据</span>
            </button>
          )}

          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            title="切换视图模式"
          >
            {isMobileFrame ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>全屏展开</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>手机框架</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container - Mobile Frame or Full Screen */}
      <div className={`transition-all duration-300 w-full ${
        isMobileFrame 
          ? 'max-w-[420px] h-[850px] my-auto bg-slate-900 p-3 rounded-[50px] shadow-2xl border-4 border-slate-700 relative flex flex-col' 
          : 'max-w-4xl min-h-[800px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col'
      }`}>
        
        {/* Dynamic Island / Speaker Notch (only in mobile frame mode) */}
        {isMobileFrame && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-40 flex items-center justify-end px-3">
            <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800"></div>
          </div>
        )}

        {/* Inner Phone Screen Content */}
        <div id="wechat-phone-screen" className={`w-full h-full bg-slate-50 flex flex-col overflow-hidden relative ${
          isMobileFrame ? 'rounded-[38px]' : 'rounded-none'
        }`}>
          
          {/* iOS Status Bar */}
          <div className="bg-slate-50 pt-2.5 px-6 pb-1 flex justify-between items-center text-[11px] font-semibold text-slate-800 select-none z-30">
            <span>{currentTime}</span>
            <div className="flex items-center space-x-1.5 text-slate-700">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4 text-slate-800" />
            </div>
          </div>

          {/* WeChat H5 Top Navigation Bar */}
          <div className="bg-slate-50 border-b border-slate-200/70 px-3 py-2 z-30 select-none">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 justify-start shrink-0">
                <button
                  type="button"
                  className="p-0.5 text-slate-700/90 hover:text-slate-900 transition-colors flex items-center justify-center"
                  aria-label="关闭"
                  title="关闭"
                >
                  <X className="w-4.5 h-4.5 stroke-[2.3]" />
                </button>
              </div>

              <div className="text-center font-bold text-slate-800 text-sm tracking-tight truncate flex-1">
                {pageTitle}
              </div>

              <div className="flex items-center justify-end space-x-1 shrink-0">
                <button
                  onClick={onOpenActionSheet}
                  className="p-1.5 hover:bg-slate-200/60 rounded-full text-slate-700 transition-colors"
                  title="微信菜单"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Page Body Viewport */}
          <div className="flex-1 overflow-y-auto relative bg-slate-100/70 flex flex-col">
            {children}
          </div>

          {/* Bottom WeChat Tab Bar (Only when logged in) */}
          {isLoggedIn && !hideTabBar && (
            <nav className="bg-white border-t border-slate-200 px-2 py-1 flex items-center justify-around z-30 select-none shadow-xs relative">
              <button
                onClick={() => onSelectTab('home')}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                  currentTab === 'home' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Home className="w-5 h-5 mb-0.5" />
                <span className="text-[10px]">首页</span>
              </button>

              <button
                onClick={() => onSelectTab('report')}
                className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
                  currentTab === 'report' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileText className="w-5 h-5 mb-0.5" />
                <span className="text-[10px]">报送</span>
                {reportPendingCount > 0 && (
                  <span className="absolute top-0 right-3.5 min-w-[14px] h-[14px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {reportPendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectTab('audit')}
                className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
                  currentTab === 'audit' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <CheckSquare className="w-5 h-5 mb-0.5" />
                <span className="text-[10px]">审核</span>
                {auditPendingCount > 0 && (
                  <span className="absolute top-0 right-3.5 min-w-[14px] h-[14px] px-1 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {auditPendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectTab('profile')}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                  currentTab === 'profile' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <User className="w-5 h-5 mb-0.5" />
                <span className="text-[10px]">我的</span>
              </button>
            </nav>
          )}

          {overlay}

        </div>
      </div>
    </div>
  );
};
