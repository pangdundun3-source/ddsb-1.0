import React, { useState, useEffect } from 'react';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Megaphone,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  LogOut,
  ArrowLeftRight,
  Check,
  X,
  Headphones,
  Phone
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
  reports?: any[];
  onSelectReport?: (report: any) => void;
  onSelectAudit?: (report: any) => void;
}

interface NotificationItem {
  id: string;
  type: 'announcement' | 'audit_pending' | 'audit_approved' | 'audit_rejected';
  badge: string;
  badgeBg: string;
  borderColor: string;
  title: string;
  desc: string;
  time: string;
  actionText: string;
  isUnread?: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'announcement',
    badge: '平台公告',
    badgeBg: 'bg-purple-100 text-purple-700',
    borderColor: 'border-purple-200',
    title: '深化突发舆情“即报即审”与首发定标机制通知',
    desc: '全面推行“1小时内核审、同源同地址线索首发标记”制度，请各网格员与审核员按规范及时填报核验。',
    time: '2026-08-13 10:00',
    actionText: '查看公告',
    isUnread: false
  },
  {
    id: 'notif-2',
    type: 'audit_pending',
    badge: '待审核',
    badgeBg: 'bg-amber-100 text-amber-700',
    borderColor: 'border-amber-200',
    title: '关于某社区突发停水事件的舆情上报',
    desc: '张三 · 台中市网信办',
    time: '2026-08-13 09:30',
    actionText: '进入审核处理',
    isUnread: false
  },
  {
    id: 'notif-3',
    type: 'audit_approved',
    badge: '审核通过',
    badgeBg: 'bg-emerald-100 text-emerald-700',
    borderColor: 'border-emerald-200',
    title: '智慧停车 App 升级引发市民集中反馈',
    desc: '终审采纳 · 评分 95分（首发件）',
    time: '2026-08-12 18:00',
    actionText: '查看速报详情',
    isUnread: true // 1:1 matching the screenshot's unread blue dot
  },
  {
    id: 'notif-4',
    type: 'audit_rejected',
    badge: '审核驳回',
    badgeBg: 'bg-rose-100 text-rose-700',
    borderColor: 'border-rose-200',
    title: '老旧小区改造政策解读及反馈收集',
    desc: '驳回原因：信息不完整。请补充政策原文链接和群众反馈截图后重新提交。',
    time: '2026-08-12 15:20',
    actionText: '重新编辑上报',
    isUnread: false
  }
];

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
  onNavigateToProfile,
  reports = [],
  onSelectReport,
  onSelectAudit
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showHotline, setShowHotline] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [selectedTempOrg, setSelectedTempOrg] = useState(currentOrg);
  const [showSwitchOrgModal, setShowSwitchOrgModal] = useState(false);
  const [switchToast, setSwitchToast] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrg) {
      setSelectedTempOrg(currentOrg);
    }
  }, [currentOrg]);

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, isUnread: false })));
    setSwitchToast('已将所有待办与消息标记为已读');
    setTimeout(() => {
      setSwitchToast(null);
    }, 2500);
  };

  const handleActionClick = (item: NotificationItem) => {
    // If it's announcement, open the 1:1 Announcement modal
    if (item.type === 'announcement') {
      setShowAnnouncementModal(true);
      setShowNotif(false);
      return;
    }

    // If it's pending audit, navigate to report audit
    if (item.type === 'audit_pending') {
      if (onNavigate) {
        onNavigate('report-audit');
      }
      setShowNotif(false);
      return;
    }

    // If it's audit approved (has unread blue dot in screenshot), clear unread and view report
    if (item.type === 'audit_approved') {
      setNotifications(prev => prev.map(n => (n.id === item.id ? { ...n, isUnread: false } : n)));
      if (onSelectReport && reports.length > 0) {
        const found = reports.find(r => r.title.includes('智慧停车') || r.id === 101) || reports[0];
        onSelectReport(found);
      }
      if (onNavigate) {
        onNavigate('report-records');
      }
      setShowNotif(false);
      return;
    }

    // If it's audit rejected, navigate to report records / edit
    if (item.type === 'audit_rejected') {
      if (onSelectReport && reports.length > 0) {
        const found = reports.find(r => r.title.includes('老旧小区') || r.id === 102) || reports[0];
        onSelectReport(found);
      }
      if (onNavigate) {
        onNavigate('report-records');
      }
      setShowNotif(false);
      return;
    }
  };

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

        {/* Right Top Bar Tools & Avatar - Exact 1:1 Unified with Portal & Screenshot */}
        <div className="flex items-center space-x-3.5">
          {/* Notification Bell Icon Button with Red Badge 1 */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotif(!showNotif);
                setShowHotline(false);
                setShowUserMenu(false);
              }}
              className={`relative w-8 h-8 rounded-full border transition-all cursor-pointer shadow-2xs flex items-center justify-center ${
                showNotif
                  ? 'border-blue-400 bg-blue-50 text-[#1E5ABB]'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
              title="消息通知"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover Dropdown - Exact 1:1 matching Image 1 */}
            {showNotif && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotif(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-[390px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden text-slate-800">
                  {/* Top Header: Blue dot + 消息通知 + 1条未读待办 */}
                  <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-[#1E5ABB]" />
                      <span className="font-bold text-slate-800 text-sm">消息通知</span>
                    </div>
                    <span className="text-xs text-slate-400 font-normal">
                      {unreadCount > 0 ? `${unreadCount}条未读待办` : '全部已读'}
                    </span>
                  </div>

                  {/* Notification List (Scrollable, 4 items from screenshot) */}
                  <div className="max-h-[460px] overflow-y-auto px-4 py-3 space-y-3">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-xl border ${item.borderColor} bg-white p-3.5 hover:shadow-xs transition-shadow`}
                      >
                        {/* Top line: Badge + Title + (Optional Unread Dot) */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center flex-1 min-w-0">
                            {/* Pill Badge with Icon */}
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold inline-flex items-center gap-1 shrink-0 ${item.badgeBg}`}
                            >
                              {item.type === 'announcement' && <Megaphone className="w-3 h-3" />}
                              {item.type === 'audit_pending' && <Clock className="w-3 h-3" />}
                              {item.type === 'audit_approved' && <CheckCircle2 className="w-3 h-3" />}
                              {item.type === 'audit_rejected' && <XCircle className="w-3 h-3" />}
                              <span>{item.badge}</span>
                            </span>

                            {/* Title */}
                            <h4
                              className="font-bold text-slate-800 text-[13px] leading-snug ml-2 flex-1 truncate"
                              title={item.title}
                            >
                              {item.title}
                            </h4>
                          </div>

                          {/* Unread Blue Dot (shown on 审核通过 item) */}
                          {item.isUnread && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 ml-1.5 mt-1" />
                          )}
                        </div>

                        {/* Description / Detail text */}
                        <p
                          className={`text-xs mt-2 leading-relaxed ${
                            item.type === 'audit_rejected' ? 'text-rose-600' : 'text-slate-600'
                          }`}
                        >
                          {item.desc}
                        </p>

                        {/* Bottom line: Date & Action button */}
                        <div className="flex items-center justify-between mt-3 text-xs">
                          <span className="text-[11px] text-slate-400 font-mono">
                            {item.time}
                          </span>
                          <button
                            onClick={() => handleActionClick(item)}
                            className="text-[#1E5ABB] font-medium inline-flex items-center gap-0.5 hover:underline cursor-pointer"
                          >
                            <span>{item.actionText}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Footer: 全部标为已读 */}
                  <div
                    onClick={handleMarkAllAsRead}
                    className="py-3 border-t border-slate-100 text-center text-xs text-slate-500 hover:text-[#1E5ABB] font-medium cursor-pointer transition-colors bg-white select-none"
                  >
                    全部标为已读
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 3. Hotline Support Button (Headphones - 1:1 with Screenshot Image 1 & 2) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowHotline(!showHotline);
                setShowNotif(false);
                setShowUserMenu(false);
              }}
              className={`w-8 h-8 rounded-full border transition-all cursor-pointer shadow-2xs flex items-center justify-center ${
                showHotline
                  ? 'border-blue-400 bg-blue-50 text-[#1E5ABB]'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
              title="技术支持热线"
            >
              <Headphones className="w-4 h-4" />
            </button>

            {/* Hotline Popover Dropdown - Exact 1:1 matching Image 2 */}
            {showHotline && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowHotline(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-[330px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-100/90 pt-7 pb-6 px-6 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-center text-slate-800">
                  {/* Circular Phone Icon with Light Blue Background */}
                  <div className="w-14 h-14 bg-[#EEF5FD] rounded-full flex items-center justify-center mx-auto mb-3.5">
                    <Phone className="w-6 h-6 text-[#1A457D] stroke-[2.2]" />
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-800 tracking-tight">
                    技术支持热线
                  </h3>

                  {/* Phone Number */}
                  <div className="text-[25px] font-extrabold text-[#173F80] tracking-wide my-2.5 font-sans">
                    4000-999-363
                  </div>

                  {/* Service Hours */}
                  <div className="text-xs text-slate-500 font-normal">
                    服务时间：工作日 08:30 - 18:00
                  </div>

                  {/* Description */}
                  <div className="text-[11px] text-slate-400 mt-1 mb-5 leading-relaxed">
                    提供系统运维、突发舆情应急支援与技术指导
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => setShowHotline(false)}
                    className="w-full py-2.5 px-4 bg-[#1E4E8C] hover:bg-[#163E72] active:bg-[#12315B] text-white font-medium text-sm rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    我知道了
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="h-4 w-[1px] bg-gray-200 hidden sm:block"></div>

          {/* User Profile Avatar dropdown (1:1 with Portal: sunset circular avatar + .w. + ChevronDown) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotif(false);
                setShowHotline(false);
              }}
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

      {/* 1:1 Announcement Detail Modal (Image 2) */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="fixed inset-0"
            onClick={() => setShowAnnouncementModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[620px] p-6 sm:p-7 border border-slate-100 text-slate-800 z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Top row: Badge + Date + Close button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-100 text-purple-700 text-xs font-semibold">
                  <Megaphone className="w-3.5 h-3.5 text-purple-600" />
                  平台公告
                </span>
                <span className="text-xs text-slate-400 font-mono">2026-08-13 10:00</span>
              </div>

              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="关闭"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Title */}
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-4 tracking-tight leading-snug">
              深化突发舆情“即报即审”与首发定标机制通知
            </h3>

            {/* Content Box (Light Blue) */}
            <div className="bg-[#F4F8FD] rounded-xl p-5 border border-blue-100/90 my-5 text-[13px] text-slate-700 leading-relaxed space-y-3.5">
              <p>
                为进一步提升网络综合治理效能与基层舆情响应敏捷度，平台现全面推行突发舆情“1小时内核审响应、同源同地址线索首发智能比对定标”机制。
              </p>
              <p>
                一、初审时限要求：各直属网信部门与镇街网格员上报线索后，值班审核员须在1小时内完成首轮真实性核验与研判分类。
              </p>
              <p>
                二、首发定标机制：依托速豹自研智能去重比对算法，对全网首报同类风险线索的基层网格单位打上“疑似首发/首发件”权威标记，并在季度考核评价中给予积分倾斜与表扬。
              </p>
              <p>
                三、规范核验流程：请各级网格员严格对照事实要素、源头链接和核实验证，确保舆情信息查证详实、链条闭环。
              </p>
            </div>

            {/* Department Signature */}
            <div className="text-right text-xs text-slate-600 space-y-1 mb-6">
              <div>发布单位：市委网信办 · 舆情速报协同指挥中心</div>
              <div className="text-slate-400 font-mono">2026-08-13 10:00</div>
            </div>

            {/* Confirm Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="px-6 py-2 bg-[#1E5ABB] hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs cursor-pointer"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

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
