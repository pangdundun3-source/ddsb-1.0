import React, { useState } from 'react';
import { Calendar, Bell, Headphones, ChevronDown, User, LogOut, Settings, Building2, CheckCircle2, ArrowLeftRight, Check, X } from 'lucide-react';
import { Logo } from './Logo';

export interface OrgAccount {
  id: string;
  name: string;
  role: string;
  code: string;
  type: string;
}

interface HeaderProps {
  onNewReportClick: () => void;
  currentUser: string;
  currentOrg?: OrgAccount;
  onSwitchOrg?: (org: OrgAccount) => void;
  onNavigate?: (page: any) => void;
}

export const AVAILABLE_ORGS: OrgAccount[] = [
  { id: '1', name: '台中市网信办', role: '超级管理员', code: 'WX-001', type: '网安指挥' },
  { id: '2', name: '市委宣传部', role: '舆情审核专员', code: 'XC-002', type: '市级部门' },
  { id: '3', name: '西区网络网信局', role: '综合填报员', code: 'XQ-003', type: '区县机构' },
  { id: '4', name: '北区网络网信局', role: '专职审核员', code: 'BQ-004', type: '区县机构' },
  { id: '5', name: '市发展改革委', role: '直属上报员', code: 'FG-005', type: '直属部门' }
];

export const Header: React.FC<HeaderProps> = ({
  onNewReportClick,
  currentUser,
  currentOrg: propCurrentOrg,
  onSwitchOrg: propOnSwitchOrg,
  onNavigate
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [internalOrg, setInternalOrg] = useState(AVAILABLE_ORGS[0]);
  const currentOrg = propCurrentOrg || internalOrg;
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [switchToast, setSwitchToast] = useState<string | null>(null);

  const handleSwitchOrg = (org: OrgAccount) => {
    if (propOnSwitchOrg) {
      propOnSwitchOrg(org);
    } else {
      setInternalOrg(org);
    }
    setShowOrgModal(false);
    setShowUserMenu(false);
    setSwitchToast(`已成功切换当前管理机构为：${org.name}（身份：${org.role}）`);
    setTimeout(() => {
      setSwitchToast(null);
    }, 3000);
  };

  return (
    <header className="bg-white border-b border-gray-200/90 px-5 sm:px-8 py-2 flex items-center justify-between text-sm shadow-2xs relative z-30">
      {/* Toast Notification */}
      {switchToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{switchToast}</span>
        </div>
      )}

      {/* Left Logo Section - 点点速豹 System Branding */}
      <Logo variant="header" />

      {/* Right Top Bar Tools & Avatar - Simplified */}
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

        {/* User Profile Avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-1.5 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-[11px]">
              {currentUser.slice(0, 1)}
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-gray-700 block leading-tight">{currentUser}</span>
              <span className="text-[10px] text-gray-400 block leading-none">{currentOrg.name}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                <p className="font-bold text-gray-800">{currentUser}</p>
                <p className="text-blue-700 font-medium text-[10px]">{currentOrg.name} · {currentOrg.role}</p>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  if (onNavigate) {
                    onNavigate('personal-info');
                  }
                }}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center space-x-2 text-gray-700 hover:text-[#1E5ABB] cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-gray-500" />
                <span>个人中心</span>
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  setShowOrgModal(true);
                }}
                className="w-full text-left px-3 py-2 hover:bg-blue-50/60 flex items-center justify-between text-gray-700 cursor-pointer group"
              >
                <div className="flex items-center space-x-2 text-gray-700 group-hover:text-[#1E5ABB] font-medium">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>切换机构</span>
                </div>
                <span className="text-[10px] bg-blue-100 text-[#1E5ABB] px-1.5 py-0.2 rounded font-bold">
                  {currentOrg.code}
                </span>
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  alert('退出登录成功，已清除当前登录凭证。');
                }}
                className="w-full text-left px-3 py-2 hover:bg-rose-50 flex items-center space-x-2 text-red-600 border-t border-gray-100 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>退出登录</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Switch Organization Modal */}
      {showOrgModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-600 rounded-lg">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">切换工作机构</h3>
                  <p className="text-[11px] text-slate-300">选择要切换到的直属或辖区机构管理身份</p>
                </div>
              </div>
              <button
                onClick={() => setShowOrgModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {AVAILABLE_ORGS.map((org) => {
                const isSelected = org.id === currentOrg.id;
                return (
                  <div
                    key={org.id}
                    onClick={() => handleSwitchOrg(org)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 border-[#1E5ABB] ring-1 ring-[#1E5ABB]/30 shadow-2xs'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-gray-900">{org.name}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {org.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        当前身份: <span className="font-medium text-gray-700">{org.role}</span> (编号: {org.code})
                      </p>
                    </div>

                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-[#1E5ABB] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 font-bold rounded-lg transition-colors flex items-center space-x-1 shrink-0">
                        <ArrowLeftRight className="w-3 h-3" />
                        <span>切换</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-right flex justify-between items-center text-xs">
              <span className="text-gray-400">切换后将即时更新页面数据权限范围</span>
              <button
                onClick={() => setShowOrgModal(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};


