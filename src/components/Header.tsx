import React, { useState, useEffect } from 'react';
import {
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
import { NotificationPopover } from './NotificationPopover';
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
  const [showSupportModal, setShowSupportModal] = useState(false);
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
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between text-sm">
        {/* Toast Notification */}
        {switchToast && (
          <div className="fixed top-4 right-4 z-50 bg-[#1E5ABB] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 border border-white/20">
            <Check className="w-4 h-4 text-sky-200" />
            <span>{switchToast}</span>
          </div>
        )}

        {/* Left Logo Section - 点点速豹 System Branding */}
        <Logo variant="header" />

        {/* Right Top Bar Tools & Avatar */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* 1. Bell Notifications Entrance Popover */}
        <NotificationPopover onNavigate={onNavigate} />

        {/* 2. Headphones / Support Hotline Icon Button */}
        <div className="relative">
          <button
            onClick={() => setShowSupportModal(!showSupportModal)}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all relative cursor-pointer shadow-2xs ${
              showSupportModal
                ? 'bg-blue-50/80 border-[#1E5ABB]/40 text-[#1E5ABB]'
                : 'border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600'
            }`}
            title="客服与技术支持热线"
          >
            <Headphones className="w-4 h-4 stroke-[1.8]" />
          </button>

          {/* Click outside transparent overlay (No mask / backdrop) */}
          {showSupportModal && (
            <div
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setShowSupportModal(false)}
            />
          )}

          {/* Support Hotline Dropdown Popover (Same popover effect as notification) */}
          {showSupportModal && (
            <div className="absolute right-0 mt-2 w-[340px] sm:w-[360px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.15)] border border-slate-200/90 p-6 sm:p-7 text-center z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Circular Phone Icon */}
              <div className="w-14 h-14 rounded-full bg-blue-50 text-[#1E5ABB] flex items-center justify-center mx-auto mb-3.5 border border-blue-100/80">
                <Phone className="w-6 h-6 text-[#1E5ABB] stroke-[2]" />
              </div>

              {/* Title */}
              <h4 className="font-bold text-base text-slate-800 tracking-tight mb-1.5">
                技术支持热线
              </h4>

              {/* Phone Number */}
              <p className="text-2xl sm:text-[26px] font-black text-[#1E5ABB] tracking-wide mb-2.5 font-sans">
                4000-999-363
              </p>

              {/* Service Hours */}
              <p className="text-xs text-slate-600 font-normal mb-1">
                服务时间：工作日 08:30 - 18:00
              </p>

              {/* Description */}
              <p className="text-[11px] text-slate-400 font-normal mb-5 leading-relaxed">
                提供系统运维、突发舆情应急支援与技术指导
              </p>

              {/* "我知道了" Button */}
              <button
                onClick={() => setShowSupportModal(false)}
                className="w-full py-2.5 bg-[#1E5ABB] hover:bg-[#15386a] text-white text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-[0.99]"
              >
                我知道了
              </button>
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
