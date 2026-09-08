import React, { useState } from 'react';
import { AppNotification, SpeedReport } from '../types';
import {
  Bell,
  Megaphone,
  CheckCircle2,
  Clock,
  XCircle,
  CheckCheck,
  ChevronRight,
  X,
  Share2,
} from 'lucide-react';

interface NotificationViewProps {
  notifications: AppNotification[];
  reports?: SpeedReport[];
  onMarkAllRead: () => void;
  onSelectNotification: (notif: AppNotification) => void;
}

type CategoryFilter = '全部' | '平台公告' | '审核结果' | '待审核';

export const NotificationView: React.FC<NotificationViewProps> = ({
  notifications,
  reports = [],
  onMarkAllRead,
  onSelectNotification,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('全部');
  const [onlyUnread, setOnlyUnread] = useState<boolean>(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const announcementCount = notifications.filter((n) => n.type === '平台公告').length;
  const auditResultCount = notifications.filter((n) => n.type === '审核结果通知').length;
  const pendingAuditCount = notifications.filter(
    (n) => n.type === '待审核通知' || n.type === '审核中通知'
  ).length;

  const filteredNotifs = notifications.filter((n) => {
    if (onlyUnread && n.isRead) return false;

    if (categoryFilter === '平台公告' && n.type !== '平台公告') return false;
    if (categoryFilter === '审核结果' && n.type !== '审核结果通知') return false;
    if (categoryFilter === '待审核' && n.type !== '待审核通知' && n.type !== '审核中通知') return false;

    return true;
  });

  const handleCardClick = (notif: AppNotification) => {
    onSelectNotification(notif);
  };

  // Extract clean summary data for Audit Results
  const getAuditResultData = (notif: AppNotification, relatedReport?: SpeedReport) => {
    if (relatedReport?.status === 'rejected') {
      return {
        badgeText: '审核驳回',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
        decision: relatedReport.rejectReason || '信息不完整，需补充修改',
        decisionLabel: '驳回原因',
        decisionColor: 'text-rose-600',
        reviewer: notif.publisher || '审核员',
      };
    }

    if (relatedReport?.status === 'transferred') {
      return {
        badgeText: '部门转办',
        badgeClass: 'bg-sky-50 text-sky-700 border-sky-200/80',
        decision: `已转办至 ${relatedReport.transferredDept || '相关职能部门'}`,
        decisionLabel: '流转状态',
        decisionColor: 'text-sky-700',
        reviewer: notif.publisher || '审核员',
      };
    }

    // Default Approved
    const scoreText = relatedReport?.score ? ` · 评分 ${relatedReport.score}分` : '';
    const isFirst = relatedReport?.identificationTag === 'official_first' ? '（首发件）' : '';
    return {
      badgeText: '审核通过',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      decision: `终审采纳${scoreText}${isFirst}`,
      decisionLabel: '审核结论',
      decisionColor: 'text-emerald-700',
      reviewer: notif.publisher || '市委宣传部舆情科',
    };
  };

  return (
    <div className="flex-1 p-3 space-y-2.5 overflow-y-auto flex flex-col bg-slate-50/60">
      {/* Filter & Action Tool Bar */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyUnread}
            onChange={(e) => setOnlyUnread(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
          />
          <span className="text-[11px] text-slate-600">
            仅看未读 ({unreadCount})
          </span>
        </label>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 active:scale-95 transition-all cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>全部标为已读</span>
          </button>
        )}
      </div>

      {/* Message Cards List */}
      <div className="space-y-2 pb-6 flex-1">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200/80 space-y-1.5">
            <Bell className="w-7 h-7 mx-auto opacity-30 text-slate-400" />
            <p className="text-xs font-semibold text-slate-600">
              暂无{categoryFilter !== '全部' ? `【${categoryFilter}】` : ''}
              {onlyUnread ? '未读' : ''}消息
            </p>
          </div>
        ) : (
          filteredNotifs.map((notif) => {
            const relatedReport = reports.find((r) => r.id === notif.relatedReportId);

            // 1. 平台公告卡片 (Platform Announcement)
            if (notif.type === '平台公告') {
              return (
                <div
                  key={notif.id}
                  onClick={() => handleCardClick(notif)}
                  className={`rounded-xl p-3 bg-white border transition-all cursor-pointer relative space-y-2 shadow-2xs hover:border-violet-300 active:scale-[0.99] ${
                    notif.isRead ? 'border-slate-200/80 text-slate-700' : 'border-violet-200 text-slate-800'
                  }`}
                >
                  {/* Row 1: Badge + Title + Unread Indicator */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200/80">
                      <Megaphone className="w-3 h-3 text-violet-600" />
                      <span>平台公告</span>
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug truncate flex-1">
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="shrink-0 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-100" />
                    )}
                  </div>

                  {/* Row 2: Content Summary */}
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {notif.content}
                  </p>

                  {/* Row 3: Time at bottom-left + Action link at bottom-right */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                    <span className="text-slate-400 font-mono">{notif.time}</span>
                    <span className="text-violet-600 font-medium flex items-center gap-0.5">
                      查看公告 <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            }

            // 2. 报送审核结果通知 (Audit Result Notification)
            if (notif.type === '审核结果通知') {
              const auditData = getAuditResultData(notif, relatedReport);
              const cleanTitle = relatedReport?.title || notif.title;

              return (
                <div
                  key={notif.id}
                  onClick={() => handleCardClick(notif)}
                  className={`rounded-xl p-3 bg-white border transition-all cursor-pointer relative space-y-2 shadow-2xs hover:border-blue-300 active:scale-[0.99] ${
                    notif.isRead ? 'border-slate-200/80 text-slate-700' : 'border-emerald-200 text-slate-800'
                  }`}
                >
                  {/* Row 1: Badge + Title + Unread Indicator */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${auditData.badgeClass}`}
                    >
                      {auditData.badgeText.includes('驳回') || auditData.badgeText.includes('退回') ? (
                        <XCircle className="w-3 h-3" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      <span>{auditData.badgeText}</span>
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug truncate flex-1">
                      {cleanTitle}
                    </h4>
                    {!notif.isRead && (
                      <span className="shrink-0 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-100" />
                    )}
                  </div>

                  {/* Row 2: Decision summary */}
                  <div className="text-[11px]">
                    <span className={`font-medium ${auditData.decisionColor}`}>
                      {auditData.decision}
                    </span>
                  </div>

                  {/* Row 3: Time at bottom-left + Action link at bottom-right */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                    <span className="text-slate-400 font-mono">{notif.time}</span>
                    <span className="text-blue-600 font-medium flex items-center gap-0.5">
                      查看速报详情 <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            }

            // 3. 报送待审核通知 (Pending Audit Notification for Auditor)
            const reporterInfo = relatedReport
              ? `${relatedReport.author} · ${relatedReport.authorDept}`
              : notif.publisher || '网格报送员';
            const cleanReportTitle = relatedReport?.title || notif.title;

            return (
              <div
                key={notif.id}
                onClick={() => handleCardClick(notif)}
                className={`rounded-xl p-3 bg-white border transition-all cursor-pointer relative space-y-2 shadow-2xs hover:border-amber-300 active:scale-[0.99] ${
                  notif.isRead ? 'border-slate-200/80 text-slate-700' : 'border-amber-200 text-slate-800'
                }`}
              >
                {/* Row 1: Badge + Title + Unread Indicator */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>待审核</span>
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug truncate flex-1">
                    {cleanReportTitle}
                  </h4>
                  {!notif.isRead && (
                    <span className="shrink-0 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-100" />
                  )}
                </div>

                {/* Row 2: Reporter info */}
                <div className="text-[11px] text-slate-500">
                  <span>{reporterInfo}</span>
                </div>

                {/* Row 3: Time at bottom-left + Action link at bottom-right */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                  <span className="text-slate-400 font-mono">{notif.time}</span>
                  <span className="text-amber-700 font-medium flex items-center gap-0.5">
                    进入审核处理 <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

