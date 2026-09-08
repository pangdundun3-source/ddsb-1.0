import React, { useState } from 'react';
import {
  ChevronLeft,
  MoreHorizontal,
  Home,
  Bell,
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
  unreadNotifCount?: number;
  onOpenActionSheet: () => void;
  onResetDemoData?: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
  pageTitle?: string;
  pageSubtitle?: string;
  isLoggedIn: boolean;
  hideTabBar?: boolean;
  hideFAB?: boolean;
  isOfficialAccount?: boolean;
  onToggleOfficialAccount?: () => void;
  onCloseH5?: () => void;
  overlay?: React.ReactNode;
  children: React.ReactNode;
}

export const WeChatPhoneShell: React.FC<WeChatPhoneShellProps> = ({
  currentTab,
  onSelectTab,
  auditPendingCount,
  reportPendingCount,
  unreadNotifCount = 0,
  onOpenActionSheet,
  onResetDemoData,
  onBack,
  canGoBack = false,
  pageTitle = '台中市网信办工作台',
  pageSubtitle,
  isLoggedIn,
  hideTabBar = false,
  hideFAB = false,
  isOfficialAccount = false,
  onToggleOfficialAccount,
  onCloseH5,
  overlay,
  children,
}) => {
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);
  const currentTime = '09:31';

  return (
    <div className="min-h-screen bg-slate-200/80 text-slate-800 flex flex-col items-center justify-start p-2 sm:p-6 font-sans">
      {/* Desktop Shell Control Toolbar */}
      <header className="w-full max-w-5xl mb-4 flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-xs border border-slate-200/80 text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-semibold text-slate-800">微信公众号与 H5 模拟器</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500">{isMobileFrame ? 'iPhone 容器' : '全屏体验'}</span>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-2">
          {/* View mode toggle: Official Account Chat vs H5 Webview */}
          {onToggleOfficialAccount && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  if (!isOfficialAccount) onToggleOfficialAccount();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  isOfficialAccount
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>💬 点点速报公众号 (1:1)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isOfficialAccount) onToggleOfficialAccount();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  !isOfficialAccount
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>📱 H5 审核工作台</span>
              </button>
            </div>
          )}

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
          
          {/* iOS Status Bar (rendered for H5 views) */}
          {!isOfficialAccount && (
            <div className="bg-slate-50 pt-2 px-6 pb-1 flex justify-between items-center text-[11.5px] font-semibold text-black select-none z-30 shrink-0">
              <span className="font-bold tracking-tight text-[13px]">{currentTime}</span>
              <div className="flex items-center space-x-1.5 text-black">
                <div className="flex items-end space-x-[2px] h-[11px] pb-[0.5px]">
                  <div className="w-[3px] h-[4px] bg-black rounded-[0.5px]"></div>
                  <div className="w-[3px] h-[6px] bg-black rounded-[0.5px]"></div>
                  <div className="w-[3px] h-[8.5px] bg-black rounded-[0.5px]"></div>
                  <div className="w-[3px] h-[11px] bg-black rounded-[0.5px]"></div>
                </div>
                <svg className="w-[15px] h-[15px] text-black fill-current ml-0.5" viewBox="0 0 24 24">
                  <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 3.5c3.8 0 7.23 1.54 9.72 4.03L12 19.34 2.28 11.53C4.77 9.04 8.2 7.5 12 7.5z" />
                </svg>
                <div className="flex items-center ml-0.5">
                  <div className="w-[25px] h-[12.5px] rounded-[4px] border border-black p-[0.8px] flex items-center justify-center relative bg-[#facc15] shadow-xs">
                    <span className="text-[9px] font-black text-black leading-none font-sans scale-90 tracking-tighter">80</span>
                  </div>
                  <div className="w-[1.2px] h-[4.5px] bg-black rounded-r-[1px] -ml-[0.5px]"></div>
                </div>
              </div>
            </div>
          )}

          {/* WeChat H5 Top Navigation Bar */}
          {!isOfficialAccount && (
            <div className="bg-slate-50 border-b border-slate-200/70 px-3 py-2 z-30 select-none shrink-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 justify-start shrink-0">
                  {canGoBack && onBack && (
                    <button
                      type="button"
                      onClick={onBack}
                      className="p-1 -ml-1 text-slate-700/90 hover:text-slate-900 transition-colors flex items-center justify-center"
                      aria-label="返回上一页"
                      title="返回上一页"
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2.3]" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onCloseH5}
                    className="p-1 text-slate-700/90 hover:text-slate-900 transition-colors flex items-center justify-center"
                    aria-label="关闭H5返回公众号"
                    title="关闭H5返回“点点速报”公众号"
                  >
                    <X className="w-4.5 h-4.5 stroke-[2.3]" />
                  </button>
                </div>

                <div className="text-center min-w-0 flex-1 flex flex-col items-center justify-center px-1">
                  <div className="font-bold text-slate-900 text-[14px] leading-tight tracking-tight truncate max-w-[220px]">
                    {pageTitle}
                  </div>
                  {pageSubtitle && (
                    <div className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5 truncate max-w-[250px] select-text">
                      {pageSubtitle}
                    </div>
                  )}
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
          )}

          {/* Page Body Viewport */}
          <div className="flex-1 overflow-y-auto relative bg-slate-100/70 flex flex-col">
            {children}
          </div>

          {/* Bottom WeChat Tab Bar (Only when logged in and in H5 mode) */}
          {isLoggedIn && !hideTabBar && !isOfficialAccount && (
            <nav className="bg-white border-t border-slate-200 px-1 py-1 flex items-center justify-around z-30 select-none shadow-xs relative">
              {/* 首页 */}
              <button
                onClick={() => onSelectTab('home')}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                  currentTab === 'home' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Home className="w-5 h-5 mb-0.5" />
                <span className="text-[10px]">首页</span>
              </button>

              {/* 消息 */}
              <button
                onClick={() => onSelectTab('message')}
                className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
                  currentTab === 'message' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Bell className="w-5 h-5 mb-0.5" />
                <span className="text-[10px]">消息</span>
                {unreadNotifCount > 0 && (
                  <span className="absolute top-0 right-3.5 min-w-[14px] h-[14px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                  </span>
                )}
              </button>

              {/* 报送 */}
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
