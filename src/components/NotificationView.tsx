import React, { useState } from 'react';
import { AppNotification, NotificationType, SpeedReport } from '../types';
import { Bell } from 'lucide-react';

interface NotificationViewProps {
  notifications: AppNotification[];
  reports?: SpeedReport[];
  onMarkAllRead: () => void;
  onSelectNotification: (notif: AppNotification) => void;
}

export const NotificationView: React.FC<NotificationViewProps> = ({
  notifications,
  reports = [],
  onSelectNotification,
}) => {
  const [statusFilter, setStatusFilter] = useState<'全部' | '未读' | '已读'>('全部');

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;
  const totalCount = notifications.length;

  const filteredNotifs = notifications.filter((n) => {
    // Status Filter
    if (statusFilter === '未读' && n.isRead) return false;
    if (statusFilter === '已读' && !n.isRead) return false;

    return true;
  });

  const formatNotificationTitle = (notif: AppNotification) => {
    const relatedReport = reports.find((report) => report.id === notif.relatedReportId);
    if (relatedReport) return relatedReport.title;

    return notif.title
      .replace(/^【(?:待审核提醒|审核结果通知)】\s*/, '')
      .replace(/^新(?:提交)?速报待审核[:：]\s*/, '');
  };

  const formatNotificationContent = (notif: AppNotification) => {
    const relatedReport = reports.find((report) => report.id === notif.relatedReportId);
    if (notif.type === '待审核通知' && relatedReport) {
      return `上报人：${relatedReport.author} · ${relatedReport.authorDept}`;
    }
    if (notif.type === '审核结果通知' && relatedReport) {
      const reviewerPrefix = '审核人：王主任 · 市委宣传部舆情科';

      if (relatedReport.status === 'rejected' && relatedReport.rejectReason) {
        const reason = relatedReport.rejectReason.replace(/^驳回原因[:：]\s*/, '');
        return `${reviewerPrefix}。上报被驳回：${reason}`;
      }

      if (relatedReport.status === 'approved' || relatedReport.status === 'auditing') {
        return `${reviewerPrefix}。上报已通过，进入下一审核节点`;
      }

      if (relatedReport.status === 'transferred' && relatedReport.transferredDept) {
        return `${reviewerPrefix}。上报已转办至 ${relatedReport.transferredDept}，进入后续处置流程`;
      }
    }

    return notif.content;
  };

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case '待审核通知':
        return (
          <span className="text-amber-800 font-bold text-[11px] bg-amber-50 border border-amber-200/90 px-2 py-0.5 rounded-md">
            待审核通知
          </span>
        );
      case '审核结果通知':
        return (
          <span className="text-blue-800 font-bold text-[11px] bg-blue-50 border border-blue-200/90 px-2 py-0.5 rounded-md">
            审核结果通知
          </span>
        );
      default:
        return (
          <span className="text-slate-800 font-bold text-[11px] bg-slate-50 border border-slate-200/90 px-2 py-0.5 rounded-md">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 p-3 space-y-3 overflow-y-auto">
      {/* Primary Navigation Tabs: 全部、未读、已读 */}
      <div className="flex items-center space-x-1.5 text-xs">
        <button
          onClick={() => setStatusFilter('全部')}
          className={`flex-1 py-2 rounded-xl font-bold transition-all text-center flex items-center justify-center space-x-1 ${
            statusFilter === '全部'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>全部</span>
          <span
            className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
              statusFilter === '全部' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {totalCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('未读')}
          className={`flex-1 py-2 rounded-xl font-bold transition-all text-center flex items-center justify-center space-x-1 ${
            statusFilter === '未读'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>未读</span>
          {unreadCount > 0 ? (
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                statusFilter === '未读' ? 'bg-amber-400 text-slate-900' : 'bg-amber-500 text-white'
              }`}
            >
              {unreadCount}
            </span>
          ) : (
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
                statusFilter === '未读' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              0
            </span>
          )}
        </button>

        <button
          onClick={() => setStatusFilter('已读')}
          className={`flex-1 py-2 rounded-xl font-bold transition-all text-center flex items-center justify-center space-x-1 ${
            statusFilter === '已读'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>已读</span>
          <span
            className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
              statusFilter === '已读' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {readCount}
          </span>
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-2.5 pb-4">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200 space-y-1">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-xs font-semibold text-slate-600">暂无{statusFilter !== '全部' ? statusFilter : ''}消息通知</p>
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onSelectNotification(notif)}
              className={`rounded-xl p-3.5 border transition-all cursor-pointer space-y-1.5 relative ${
                notif.isRead
                  ? 'bg-white border-slate-200/90 text-slate-700 opacity-90 hover:border-slate-300'
                  : 'bg-blue-50/50 border-blue-200 shadow-2xs text-slate-800 hover:border-blue-300'
              }`}
            >
              {!notif.isRead && (
                <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-100"></span>
              )}

              <div className="flex items-center justify-between pr-4">
                {getTypeBadge(notif.type)}
                <span className="text-[10px] text-slate-400 font-mono">{notif.time}</span>
              </div>

              <h4 className="text-xs font-bold text-slate-800 leading-snug">
                {formatNotificationTitle(notif)}
              </h4>

              <p className="text-[11px] leading-relaxed text-slate-600">
                {formatNotificationContent(notif)}
              </p>
            </div>
          ))
        )}
        <p className="text-center text-[10px] text-slate-400 py-2">
          默认显示近三个月的数据
        </p>
      </div>
    </div>
  );
};
