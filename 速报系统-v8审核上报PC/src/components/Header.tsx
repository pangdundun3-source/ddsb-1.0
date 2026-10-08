import React, { useState } from 'react';
import { Bell, ChevronDown, LogOut, UserRound } from 'lucide-react';
import { Logo } from './Logo';
import type { OrgAccount, PageId } from '../types';

interface HeaderProps {
  onNewReportClick: () => void;
  currentUser: string;
  currentOrg: OrgAccount;
  onSwitchOrg: (org: OrgAccount) => void;
  onNavigate?: (page: PageId) => void;
  onOpenMessageCenter?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onOpenMessageCenter, unreadCount = 0 }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200/90 shadow-2xs relative z-30">
      <div className="lg:w-[90%] mx-auto px-4 sm:px-6 lg:px-0 py-2.5 sm:py-3 flex items-center justify-between text-sm">
        {/* Left Logo Section - 点点速豹 System Branding */}
        <Logo variant="header" />

        {/* Right Top Bar Tools & Avatar */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* User Profile Avatar dropdown - 1:1 Match with screenshot */}
        <div className="relative pl-1">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-1.5 py-1 px-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            {/* User Avatar Image */}
            <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-slate-200/80 shrink-0 shadow-2xs">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=120&q=80"
                alt="用户头像"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.classList.add('bg-gradient-to-tr', 'from-amber-600', 'to-orange-400', 'flex', 'items-center', 'justify-center', 'text-white', 'text-[11px]', 'font-bold');
                    target.parentElement.innerText = '.w.';
                  }
                }}
              />
            </div>

            {/* Username . w . */}
            <span className="text-[13px] font-medium text-slate-800 tracking-wide font-sans">
              . w .
            </span>

            {/* Caret icon */}
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                showUserMenu ? 'rotate-180 text-slate-600' : ''
              }`}
            />
          </button>

          {/* Click outside overlay for user menu */}
          {showUserMenu && (
            <div
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setShowUserMenu(false)}
            />
          )}

          {/* Popover Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100/90 py-1.5 px-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              {onNavigate && (
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onNavigate('personal-info');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 hover:text-[#1E5ABB] rounded-lg flex items-center space-x-2.5 transition-colors cursor-pointer group/item"
                >
                  <UserRound className="w-4 h-4 text-slate-500 group-hover/item:text-[#1E5ABB] transition-colors stroke-[1.75]" />
                  <span className="text-[13px] font-normal tracking-wide">个人资料</span>
                </button>
              )}
              {onOpenMessageCenter && (
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenMessageCenter();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 hover:text-[#1E5ABB] rounded-lg flex items-center space-x-2.5 transition-colors cursor-pointer group/item"
                >
                  <Bell className="w-4 h-4 text-slate-500 group-hover/item:text-[#1E5ABB] transition-colors stroke-[1.75]" />
                  <span className="text-[13px] font-normal tracking-wide flex-1">消息中心</span>
                  {unreadCount > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-semibold leading-[18px] text-center tabular-nums">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  if (onNavigate) {
                    onNavigate('login');
                  }
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 hover:text-red-600 rounded-lg flex items-center space-x-2.5 transition-colors cursor-pointer group/item"
              >
                <LogOut className="w-4 h-4 text-slate-500 group-hover/item:text-red-500 transition-colors stroke-[1.75]" />
                <span className="text-[13px] font-normal tracking-wide">退出登录</span>
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </header>
  );
};
