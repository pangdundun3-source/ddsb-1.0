import React, { useState } from 'react';
import {
  Bell,
  Megaphone,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  X,
  FileText
} from 'lucide-react';
import type { PageId } from '../types';

export interface NotificationItem {
  id: string;
  type: 'platform_notice' | 'audit_pending' | 'audit_approved' | 'audit_rejected';
  badge: string;
  title: string;
  content: string;
  contentHighlight?: boolean;
  time: string;
  actionText: string;
  targetPage?: PageId;
  isUnread: boolean;
  announcementContent?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'platform_notice',
    badge: '平台公告',
    title: '深化突发舆情“即报即审”与首发定标机制通知',
    content: '全面推行“1小时内初审、同源同地址线索首发标记”制度，请各网格员与审核员按规范及时填报核验。',
    time: '2026-08-13 10:00',
    actionText: '查看公告',
    isUnread: true,
    announcementContent:
      '为进一步提升网络综合治理效能与基层舆情响应敏捷度，平台现全面推行突发舆情“1小时内初审响应、同源同地址线索首发智能比对定标”机制。\n\n一、初审时限要求：各直属网信部门与镇街网格员上报线索后，值班审核员须在1小时内完成首轮真实性核验与研判分类。\n二、首发定标机制：依托速豹自研智能去重比对算法，对全网首报同类风险线索的基层网格单位打上“疑似首发/首发件”权威标记，并在季度考核评价中给予积分倾斜与表扬。\n三、规范核验流程：请各级网格员严格对照事实要素、源头链接和核实凭证，确保舆情信息查证详实、链条闭环。'
  },
  {
    id: 'notif-2',
    type: 'audit_pending',
    badge: '待审核',
    title: '关于某社区突发停水事件的舆情上报',
    content: '张三 · 台中市网信办',
    time: '2026-08-13 09:30',
    actionText: '进入审核处理',
    targetPage: 'report-audit',
    isUnread: true
  },
  {
    id: 'notif-3',
    type: 'audit_approved',
    badge: '审核通过',
    title: '智慧停车 App 升级引发市民集中反馈',
    content: '终审采纳 · 评分 95分（首发件）',
    time: '2026-08-12 18:00',
    actionText: '查看速报详情',
    targetPage: 'report-summary',
    isUnread: true
  },
  {
    id: 'notif-4',
    type: 'audit_rejected',
    badge: '审核驳回',
    title: '老旧小区改造政策解读及反馈收集',
    content: '驳回原因：信息不完整。请补充政策原文链接和群众反馈截图后重新提交。',
    contentHighlight: true,
    time: '2026-08-12 11:10',
    actionText: '查看速报详情',
    targetPage: 'report-records',
    isUnread: false
  }
];

interface NotificationPopoverProps {
  onNavigate?: (page: PageId) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [selectedNotice, setSelectedNotice] = useState<NotificationItem | null>(null);

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const handleItemClick = (item: NotificationItem) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isUnread: false } : n))
    );

    if (item.type === 'platform_notice') {
      setSelectedNotice(item);
      setIsOpen(false);
    } else if (item.targetPage && onNavigate) {
      onNavigate(item.targetPage);
      setIsOpen(false);
    }
  };

  const renderBadge = (item: NotificationItem) => {
    switch (item.type) {
      case 'platform_notice':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF]/80">
            <Megaphone className="w-3 h-3" />
            <span>{item.badge}</span>
          </span>
        );
      case 'audit_pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]/80">
            <Clock className="w-3 h-3" />
            <span>{item.badge}</span>
          </span>
        );
      case 'audit_approved':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]/80">
            <CheckCircle2 className="w-3 h-3" />
            <span>{item.badge}</span>
          </span>
        );
      case 'audit_rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]/80">
            <XCircle className="w-3 h-3" />
            <span>{item.badge}</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getCardBorderClass = (type: NotificationItem['type']) => {
    switch (type) {
      case 'platform_notice':
        return 'border-[#E9D5FF] hover:border-[#D8B4FE]';
      case 'audit_pending':
        return 'border-[#FDE68A] hover:border-[#FCD34D]';
      case 'audit_approved':
        return 'border-[#A7F3D0] hover:border-[#6EE7B7]';
      case 'audit_rejected':
        return 'border-[#FECDD3] hover:border-[#FDA4AF]';
      default:
        return 'border-slate-200';
    }
  };

  return (
    <div className="relative">
      {/* Top Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all relative cursor-pointer shadow-2xs ${
          isOpen
            ? 'bg-blue-50/80 border-[#1E5ABB]/40 text-[#1E5ABB]'
            : 'border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600'
        }`}
        title="消息通知"
      >
        <Bell className="w-4 h-4 stroke-[1.8]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white leading-none shadow-2xs">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Click outside overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Notification Dropdown Popover (Format 1:1 with reference Image 2) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[390px] sm:w-[418px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.15)] border border-slate-200/90 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#1E5ABB]" />
              <h3 className="font-bold text-sm text-slate-800 tracking-tight">消息通知</h3>
            </div>
            <span className="text-xs text-slate-400 font-normal">
              {unreadCount > 0 ? `${unreadCount}条未读待办` : '暂无未读待办'}
            </span>
          </div>

          {/* Body: Notifications List (1:1 with reference Image 1 content) */}
          <div className="max-h-[440px] overflow-y-auto p-3 space-y-2.5 bg-slate-50/40">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`bg-white rounded-xl p-3 border transition-all cursor-pointer shadow-2xs hover:shadow-xs group ${getCardBorderClass(
                  item.type
                )}`}
              >
                {/* Top Row: Badge + Title + Unread Blue Dot */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {renderBadge(item)}
                    <h4 className="font-bold text-xs text-slate-800 truncate group-hover:text-[#1E5ABB] transition-colors">
                      {item.title}
                    </h4>
                  </div>
                  {item.isUnread && (
                    <span
                      className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0 mt-1"
                      title="未读"
                    />
                  )}
                </div>

                {/* Content description */}
                <p
                  className={`text-xs leading-relaxed mb-2.5 line-clamp-2 ${
                    item.contentHighlight ? 'text-[#DC2626] font-medium' : 'text-slate-600'
                  }`}
                >
                  {item.content}
                </p>

                {/* Bottom Row: Time on left, Action link on right */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100/70 text-[11px]">
                  <span className="text-slate-400 font-mono">{item.time}</span>
                  <div className="flex items-center space-x-0.5 text-[#1E5ABB] font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>{item.actionText}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer: 全部标为已读 */}
          <div className="border-t border-slate-100 bg-white">
            <button
              onClick={handleMarkAllAsRead}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-[#1E5ABB] hover:bg-slate-50 font-medium transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <span>全部标为已读</span>
            </button>
          </div>
        </div>
      )}

      {/* Announcement Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF]">
                  <Megaphone className="w-3 h-3" />
                  <span>平台公告</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">{selectedNotice.time}</span>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <h3 className="font-bold text-base text-slate-900 leading-snug">
                {selectedNotice.title}
              </h3>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/80 text-xs text-slate-700 leading-relaxed space-y-2 whitespace-pre-line">
                {selectedNotice.announcementContent || selectedNotice.content}
              </div>

              <div className="pt-2 text-right">
                <p className="text-xs font-medium text-slate-500">
                  发布单位：市委网信办 · 舆情速报协同指挥中心
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{selectedNotice.time}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50/60 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-5 py-2 bg-[#1E5ABB] hover:bg-[#15386a] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
