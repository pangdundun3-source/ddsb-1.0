import React, { useState, useEffect } from 'react';
import {
  Bell,
  ChevronDown,
  User,
  LogOut,
  ArrowLeftRight,
  Check,
  X
} from 'lucide-react';
import { Logo } from './Logo';
import sunsetBg from '../assets/images/sunset_grassland.jpg';

interface HeaderProps {
  currentUser: string;
  currentOrg?: string;
  onSwitchOrg?: (orgName: string) => void;
  userName?: string;
  onLogout?: () => void;
  onNavigate?: (page: any) => void;
  onNavigateToProfile?: () => void;
}

const ORG_OPTIONS = [
  { name: '禁用-测试机构 (台湾省)', code: 'TEST-TW-01' },
  { name: '台中市网信办', code: 'TC-WXB-01' },
  { name: '西区网络网信局', code: 'TC-XQ-01' },
];

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentOrg = '台中市网信办',
  onSwitchOrg,
  userName = '. w .',
  onLogout,
  onNavigate,
  onNavigateToProfile
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [selectedTempOrg, setSelectedTempOrg] = useState(currentOrg);
  const [showSwitchOrgModal, setShowSwitchOrgModal] = useState(false);
  const [switchToast, setSwitchToast] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrg) {
      setSelectedTempOrg(currentOrg);
    }
  }, [currentOrg]);

  const handleConfirmSwitch = () => {
    if (onSwitchOrg) {
      onSwitchOrg(selectedTempOrg);
    }
    setShowSwitchOrgModal(false);
    setShowUserMenu(false);
    setSwitchToast(`已成功切换当前管理机构为：${selectedTempOrg}`);
    setTimeout(() => {
      setSwitchToast(null);
    }, 3000);
  };

  return (
    <header className="bg-white border-b border-gray-200/90 text-sm shadow-2xs relative z-30">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
        {/* Toast Notification */}
        {switchToast && (
          <div className="fixed top-4 right-4 z-50 bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
            <Check className="w-4 h-4 text-emerald-300" />
            <span>{switchToast}</span>
          </div>
        )}

        {/* Left Logo Section - 点点速豹 System Branding */}
        <Logo variant="header" />

        {/* Right Top Bar Tools & Avatar - Exact 1:1 Unified with Portal */}
        <div className="flex items-center space-x-3.5">
        {/* Bell Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 relative cursor-pointer"
            title="系统消息"
          >
            <Bell className="w-4 h-4 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-3 text-xs z-50">
              <div className="font-bold border-b pb-2 mb-2 text-gray-700 flex justify-between items-center">
                <span>未读消息通知</span>
                <span className="bg-blue-100 text-[#1E5ABB] px-1.5 py-0.5 rounded text-[10px] font-bold">3 条未读</span>
              </div>
              <div className="space-y-2">
                <div className="p-2 bg-blue-50/60 rounded border border-blue-100">
                  <p className="font-bold text-gray-800">[待审核] 社区突发停水事件舆情</p>
                  <span className="text-[10px] text-gray-400">10分钟前</span>
                </div>
                <div className="p-2 bg-gray-50 rounded border border-gray-100">
                  <p className="font-medium text-gray-800">[系统提醒] 业务配置与数据字典已更新</p>
                  <span className="text-[10px] text-gray-400">1小时前</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-gray-200 hidden sm:block"></div>

        {/* User Profile Avatar dropdown (1:1 with Portal: sunset circular avatar + .w. + ChevronDown) */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-1.5 px-2 py-1 rounded-md hover:bg-slate-100 text-slate-800 transition-all cursor-pointer select-none"
            title="点击查看个人中心与操作菜单"
          >
            {/* Circular Avatar matching sunset photo in screenshot */}
            <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-300/80 shadow-2xs shrink-0">
              <img
                src={sunsetBg}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[14px] font-bold tracking-wider">
              {userName}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 opacity-75 text-slate-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu (Exact 1:1 with Portal) */}
          {showUserMenu && (
            <>
              {/* Backdrop to close on outside click */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />

              <div className="absolute right-0 top-full mt-1.5 w-40 bg-white rounded-md shadow-2xl border border-gray-100 py-1 z-50 text-slate-700 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* 1. 个人中心 */}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onNavigateToProfile) {
                      onNavigateToProfile();
                    } else if (onNavigate) {
                      onNavigate('portal');
                    }
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 hover:text-blue-600 flex items-center space-x-3 text-[13px] font-normal transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-500 stroke-[1.8]" />
                  <span>个人中心</span>
                </button>

                {/* 2. 切换机构 */}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setSelectedTempOrg(currentOrg);
                    setShowSwitchOrgModal(true);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 hover:text-blue-600 flex items-center space-x-3 text-[13px] font-normal transition-colors cursor-pointer"
                >
                  <ArrowLeftRight className="w-4 h-4 text-slate-500 stroke-[1.8]" />
                  <span>切换机构</span>
                </button>

                {/* 3. 退出登录 */}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onLogout) {
                      onLogout();
                    }
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 hover:text-rose-600 flex items-center space-x-3 text-[13px] font-normal transition-colors cursor-pointer border-t border-slate-100"
                >
                  <LogOut className="w-4 h-4 text-slate-500 stroke-[1.8]" />
                  <span>退出登录</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      </div>

      {/* SWITCH ORG POPOVER (1:1 identical to PortalHome switch modal) */}
      {showSwitchOrgModal && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowSwitchOrgModal(false)}
          />
          <div className="absolute right-4 top-full mt-2 w-[310px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 text-slate-800 animate-in fade-in zoom-in-95 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">切换机构</h3>
              <button
                onClick={() => setShowSwitchOrgModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Organization Options List */}
            <div className="p-5 space-y-2.5">
              {ORG_OPTIONS.map((org) => {
                const isSelected = selectedTempOrg === org.name;
                return (
                  <div
                    key={org.code}
                    onClick={() => setSelectedTempOrg(org.name)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-[#1E5ABB] bg-blue-50/10 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">{org.name}</div>
                    
                    {/* Bottom-right blue checkmark badge */}
                    {isSelected && (
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#1E5ABB] text-white rounded-tl-xl flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Buttons */}
            <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end space-x-2.5">
              <button
                onClick={() => setShowSwitchOrgModal(false)}
                className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmSwitch}
                className="px-4 py-1.5 bg-[#1E5ABB] hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs"
              >
                确定
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
