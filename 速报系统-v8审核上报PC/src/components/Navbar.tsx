import React from 'react';
import { PageId } from '../types';
import { Home, FileText, ClipboardCheck, Bell, User, LayoutGrid, type LucideIcon } from 'lucide-react';
import { getSideNavGroup } from './SideSubNav';

interface NavbarProps {
  activePage: PageId;
  reportDetailSourcePage?: PageId;
  onNavigate: (page: PageId, extra?: string) => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  reportDetailSourcePage = 'report-summary',
  onNavigate,
  unreadCount = 0
}) => {
  const group = getSideNavGroup(activePage, reportDetailSourcePage);

  const items: { page: PageId; label: string; icon: LucideIcon; active: boolean; badge?: number }[] = [
    { page: 'home', label: '首页', icon: Home, active: activePage === 'home' },
    { page: 'report-summary', label: '报送管理', icon: FileText, active: group === 'report' },
    { page: 'report-audit', label: '审核管理', icon: ClipboardCheck, active: group === 'audit' },
    { page: 'messages', label: '消息中心', icon: Bell, active: activePage === 'messages', badge: unreadCount },
    { page: 'personal-info', label: '个人中心', icon: User, active: activePage === 'personal-info' }
  ];

  return (
    <nav className="bg-[#1E5ABB] text-white shadow-sm relative z-20 border-t border-white/15">
      <div className="lg:w-[90%] mx-auto px-4 sm:px-6 lg:px-0 flex items-center h-12 text-[14px] sm:text-[15px] font-medium sm:font-semibold">
        {/* Navigation Items Bar */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 h-full py-1">
          {/* Grid Quick App Switcher Icon */}
          <button
            onClick={() => onNavigate('home')}
            className="px-2.5 h-9 rounded flex items-center justify-center hover:bg-white/12 text-white/90 hover:text-white transition-colors cursor-pointer mr-0.5"
            title="功能导航"
          >
            <LayoutGrid className="w-4.5 h-4.5" />
          </button>

          {items.map(({ page, label, icon: Icon, active, badge }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`px-4 sm:px-4.5 h-9 transition-all cursor-pointer rounded flex items-center space-x-2 ${
                active
                  ? 'bg-blue-600 font-bold text-white shadow-xs'
                  : 'hover:bg-white/12 text-white/90 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {!!badge && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-[18px] text-center tabular-nums">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
