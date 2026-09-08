import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Bell,
  Headphones,
  ChevronDown,
  User,
  LogOut,
  ArrowLeftRight,
  Check,
  X,
  Phone
} from 'lucide-react';
import { Logo } from './Logo';
import { AVAILABLE_ORGS } from '../data/mockData';
import type { OrgAccount, PageId } from '../types';

interface HeaderProps {
  onNewReportClick: () => void;
  currentUser: string;
  currentOrg: OrgAccount;
  onSwitchOrg: (org: OrgAccount) => void;
  onNavigate?: (page: PageId) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewReportClick,
  currentUser,
  currentOrg,
  onSwitchOrg,
  onNavigate
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>(currentOrg.id);
  const [switchToast, setSwitchToast] = useState<string | null>(null);

  // Sync selectedOrgId when currentOrg changes or when modal opens
  useEffect(() => {
    if (showOrgModal) {
      setSelectedOrgId(currentOrg.id);
    }
  }, [showOrgModal, currentOrg.id]);

  const handleConfirmSwitch = () => {
    const targetOrg = AVAILABLE_ORGS.find((o) => o.id === selectedOrgId);
    if (targetOrg) {
      onSwitchOrg(targetOrg);
      setSwitchToast(`已成功切换工作机构为：${targetOrg.name}`);
      setTimeout(() => {
        setSwitchToast(null);
      }, 3000);
    }
    setShowOrgModal(false);
  };

  return (
    <header className="bg-white border-b border-gray-200/90 shadow-2xs relative z-30">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-sm">
        {/* Toast Notification */}
        {switchToast && (
          <div className="fixed top-4 right-4 z-50 bg-[#1E5ABB] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 border border-white/20">
            <Check className="w-4 h-4 text-sky-200" />
            <span>{switchToast}</span>
          </div>
        )}

        {/* Left Logo Section - 点点速豹 System Branding */}
        <Logo variant="header" />

        {/* Right Top Bar Tools & Avatar - 1:1 match with header screenshot */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* 1. Calendar / Daily Schedule Icon Button */}
        <div className="relative">
          <button
            onClick={() => setShowCalendarModal(true)}
            className="w-8 h-8 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shadow-2xs"
            title="工作日历 / 排班"
          >
            <Calendar className="w-4 h-4 text-slate-600 stroke-[1.8]" />
          </button>

          {/* Calendar Quick Modal */}
          {showCalendarModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-[#15386a]" />
                    <h4 className="font-bold text-sm text-slate-800">今日工作排班与提醒</h4>
                  </div>
                  <button
                    onClick={() => setShowCalendarModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#15386a] mt-1 shrink-0" />
                    <div>
                      <p className="font-bold text-[#15386a]">全网巡查值班中</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">当班机构：{currentOrg.name}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-700">重点舆情研判例会</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">今日 16:30 · 线上协同研判室</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCalendarModal(false)}
                  className="mt-4 w-full py-2 bg-[#15386a] text-white text-xs font-bold rounded-xl hover:bg-[#1f4b8a] transition-colors cursor-pointer"
                >
                  确定
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Bell Notifications Icon Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="w-8 h-8 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center text-slate-600 transition-colors relative cursor-pointer shadow-2xs"
            title="系统消息"
          >
            <Bell className="w-4 h-4 text-slate-600 stroke-[1.8]" />
            <span className="absolute 0.5 0.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-3.5 text-xs z-50 animate-in fade-in zoom-in-95">
              <div className="font-bold border-b border-slate-100 pb-2 mb-2 text-slate-800 flex justify-between items-center">
                <span>未读消息通知</span>
                <span className="bg-blue-100 text-[#15386a] px-2 py-0.5 rounded-full text-[10px] font-bold">
                  2 条待办
                </span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100">
                  <p className="font-bold text-slate-800">[待审核] 社区突发停水事件舆情</p>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">10分钟前</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="font-medium text-slate-700">[系统提醒] 业务配置与数据字典已更新</p>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">1小时前</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Headphones / Support Hotline Icon Button */}
        <div className="relative">
          <button
            onClick={() => setShowSupportModal(true)}
            className="w-8 h-8 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shadow-2xs"
            title="客服与技术支持"
          >
            <Headphones className="w-4 h-4 text-slate-600 stroke-[1.8]" />
          </button>

          {/* Support Modal */}
          {showSupportModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#15386a] flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-slate-800">技术支持热线</h4>
                <p className="text-xl font-black text-[#15386a] mt-2 tracking-wider">4000-999-363</p>
                <p className="text-xs text-slate-500 mt-2">服务时间：工作日 08:30 - 18:00</p>
                <p className="text-[11px] text-slate-400 mt-0.5">提供系统运维、突发舆情应急支援与技术指导</p>
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="mt-5 w-full py-2 bg-[#15386a] text-white text-xs font-bold rounded-xl hover:bg-[#1f4b8a] transition-colors cursor-pointer"
                >
                  我知道了
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. User Profile Avatar dropdown - 1:1 Match with screenshot */}
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
              {/* Item 1: 个人中心 */}
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  if (onNavigate) {
                    onNavigate('personal-info');
                  }
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 hover:text-[#15386a] rounded-lg flex items-center space-x-2.5 transition-colors cursor-pointer group/item"
              >
                <User className="w-4 h-4 text-slate-500 group-hover/item:text-[#15386a] transition-colors stroke-[1.75]" />
                <span className="text-[13px] font-normal tracking-wide">个人中心</span>
              </button>

              {/* Item 2: 切换机构 */}
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  setShowOrgModal(true);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 hover:text-[#15386a] rounded-lg flex items-center space-x-2.5 transition-colors cursor-pointer group/item"
              >
                <ArrowLeftRight className="w-4 h-4 text-slate-500 group-hover/item:text-[#15386a] transition-colors stroke-[1.75]" />
                <span className="text-[13px] font-normal tracking-wide">切换机构</span>
              </button>

              {/* Item 3: 退出登录 */}
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

      {/* ========================================================
          1:1 Switch Organization Popover (Top-Right Popover Format with System Blue Theme)
          ======================================================== */}
      {showOrgModal && (
        <>
          {/* Transparent click-outside overlay (No dark backdrop so page stays clear) */}
          <div
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={() => setShowOrgModal(false)}
          />

          {/* Top-Right Floating Popover Panel - Exactly matching the screenshot position & appearance */}
          <div className="absolute right-4 sm:right-8 top-full mt-2 z-50 w-[330px] bg-white rounded-2xl shadow-[0_16px_48px_rgba(15,35,65,0.18)] border border-slate-100 p-5 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header: 切换机构 + Close Icon */}
            <div className="flex items-center justify-between pb-3.5">
              <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">
                切换机构
              </h3>
              <button
                onClick={() => setShowOrgModal(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>

            {/* Modal Body: List of Org Selection Cards (1:1 with Reference Image) */}
            <div className="space-y-2.5 my-1 max-h-[300px] overflow-y-auto pr-0.5">
              {AVAILABLE_ORGS.map((org) => {
                const isSelected = org.id === selectedOrgId;
                return (
                  <div
                    key={org.id}
                    onClick={() => setSelectedOrgId(org.id)}
                    className={`relative p-3.5 rounded-lg border transition-all cursor-pointer select-none overflow-hidden ${
                      isSelected
                        ? 'border-[#1E5ABB] bg-blue-50/20 text-[#1E5ABB] font-medium shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    {/* Org Name */}
                    <span className="text-[13px] font-normal block pr-6">
                      {org.name}
                    </span>

                    {/* Top Navbar Theme Blue Bottom-Right Corner Triangle with Checkmark */}
                    {isSelected && (
                      <div className="absolute bottom-0 right-0 w-5 h-5 overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-0 h-0 border-t-[20px] border-t-transparent border-l-[20px] border-l-transparent border-r-[20px] border-r-[#1E5ABB] border-b-[20px] border-b-[#1E5ABB]" />
                        <Check className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 text-white stroke-[3.5]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer: 取消 / 确定 Buttons */}
            <div className="flex items-center justify-end space-x-2.5 pt-4 mt-2">
              <button
                type="button"
                onClick={() => setShowOrgModal(false)}
                className="px-4 py-1.5 rounded-md bg-[#f1f5f9] hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                取消
              </button>

              <button
                type="button"
                onClick={handleConfirmSwitch}
                className="px-5 py-1.5 rounded-md bg-[#1E5ABB] hover:bg-[#184996] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs active:scale-[0.98]"
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
