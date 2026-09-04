import React, { useState } from 'react';
import {
  Bell,
  ChevronDown,
  User,
  LogOut,
  Building2,
  CheckCircle2,
  ArrowLeftRight,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import { Logo } from './Logo';
import sunsetBg from '../assets/images/sunset_grassland.jpg';

interface HeaderProps {
  currentUser: string;
  onLogout?: () => void;
  onNavigate?: (page: any) => void;
}

const ORG_OPTIONS = [
  { name: '台中市网信办', code: 'TC-WXB-01', desc: '直属综合网信治理中枢 · 指令流转总调中心' },
  { name: '市委宣传部舆情监测科', code: 'TC-XCB-04', desc: '新闻舆情监测预警与网络研判分析' },
  { name: '市公安局网安支队', code: 'TC-GA-WA02', desc: '涉网违法犯罪线索协查与处置打击' },
  { name: '市网络应急指挥中心', code: 'TC-YJ-ZH01', desc: '重大网络舆情与安全突发事件应急联调' },
  { name: '市互联网辟谣联动中心', code: 'TC-PY-001', desc: '涉台辟谣科普与涉假网络谣言溯源' },
];

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onNavigate }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [currentOrg, setCurrentOrg] = useState('台中市网信办');
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showSwitchOrgModal, setShowSwitchOrgModal] = useState(false);
  const [switchToast, setSwitchToast] = useState<string | null>(null);

  const handleSelectOrg = (orgName: string) => {
    setCurrentOrg(orgName);
    setShowSwitchOrgModal(false);
    setShowUserMenu(false);
    setSwitchToast(`已成功切换当前管理机构为：${orgName}`);
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

      {/* Right Top Bar Tools & Avatar - Unified with Portal */}
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

        {/* User Profile Avatar dropdown (1:1 matching screenshot and PortalHome) */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-1.5 px-2 py-1 rounded-md hover:bg-gray-100 transition-all cursor-pointer select-none"
          >
            {/* Circular Avatar matching sunset photo in screenshot */}
            <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-300 shadow-xs shrink-0">
              <img
                src={sunsetBg}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[13px] font-bold text-gray-700 tracking-wider">
              . w .
            </span>
            <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu (1:1 with screenshot) */}
          {showUserMenu && (
            <>
              {/* Backdrop to close on outside click */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />

              <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-md shadow-2xl border border-gray-100 py-1 z-50 text-slate-700 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* 1. 个人中心 */}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setShowUserProfileModal(true);
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
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 hover:text-rose-600 flex items-center space-x-3 text-[13px] font-normal transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-slate-500 stroke-[1.8]" />
                  <span>退出登录</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL: 个人中心 */}
      {showUserProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 text-slate-800">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#193B67] to-[#255594] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">个人中心</h3>
                  <p className="text-[11px] text-white/70 mt-1">管理员账号档案与安全鉴权凭据</p>
                </div>
              </div>
              <button
                onClick={() => setShowUserProfileModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-5 text-xs">
              {/* Profile Card Summary */}
              <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0">
                  <img src={sunsetBg} alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">. w .</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded-full text-[10px]">
                      超级管理员
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-1 flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentOrg}</span>
                  </div>
                  <div className="text-slate-400 text-[10px] mt-0.5">
                    工号：WX-20260904 · 职务：网信应急研判总调度
                  </div>
                </div>
              </div>

              {/* Detail fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[10px]">绑定微信</div>
                  <div className="font-bold text-slate-700 mt-0.5 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>wxid_2991024</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[10px]">联系手机</div>
                  <div className="font-bold text-slate-700 mt-0.5">138****8899</div>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[10px]">上次登录时间</div>
                  <div className="font-bold text-slate-700 mt-0.5">2026-09-04 16:52</div>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[10px]">安全等级</div>
                  <div className="font-bold text-emerald-600 mt-0.5 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>国密三级鉴权已启用</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">系统已全面开启防泄露水印审计</span>
              <button
                onClick={() => setShowUserProfileModal(false)}
                className="px-4 py-1.5 bg-[#193B67] hover:bg-[#204a80] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: 切换机构 */}
      {showSwitchOrgModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 text-slate-800">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#193B67] to-[#255594] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                  <ArrowLeftRight className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">切换机构</h3>
                  <p className="text-[11px] text-white/70 mt-1">选择您需协同办公的网信与治理业务主体</p>
                </div>
              </div>
              <button
                onClick={() => setShowSwitchOrgModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Organization Options List */}
            <div className="p-6 space-y-2.5 text-xs">
              {ORG_OPTIONS.map((org) => {
                const isSelected = currentOrg === org.name;
                return (
                  <div
                    key={org.code}
                    onClick={() => handleSelectOrg(org.name)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${isSelected ? 'text-[#193B67]' : 'text-slate-800'}`}>
                            {org.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">({org.code})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{org.desc}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold shrink-0">
                        当前
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                当前选中：<strong className="text-slate-800">{currentOrg}</strong>
              </span>
              <button
                onClick={() => setShowSwitchOrgModal(false)}
                className="px-5 py-1.5 bg-[#193B67] hover:bg-[#204a80] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                确认切换
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

