import React, { useEffect, useMemo, useState } from 'react';
import { AppNotification, IdentificationTag, SpeedReport } from '../types';
import {
  Bell,
  Megaphone,
  CheckCircle2,
  Clock,
  CheckCheck,
  ChevronRight,
} from 'lucide-react';
import { IdentificationBadge } from './IdentificationBadge';

interface NotificationViewProps {
  notifications: AppNotification[];
  reports?: SpeedReport[];
  onMarkRead: (ids: string[]) => void;
  onSelectNotification: (notif: AppNotification) => void;
}

type ReadTab = 'unread' | 'read';

const PAGE_SIZE = 10;
/** 已读消息仅展示近 1 年 */
const READ_RETENTION_MS = 365 * 24 * 60 * 60 * 1000;

const parseTime = (text: string) => Date.parse(text.replace(' ', 'T'));

const isWithinRetention = (n: AppNotification) => {
  const stamp = parseTime(n.time);
  return Number.isNaN(stamp) || Date.now() - stamp <= READ_RETENTION_MS;
};

const getDayLabel = (text: string) => {
  const date = new Date(parseTime(text));
  if (Number.isNaN(date.getTime())) return '更早';
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const diffDays = Math.floor(
    (startOfToday - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / 86400000
  );
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

type ResultKind = NonNullable<AppNotification['resultKind']>;

const resolveResultKind = (notif: AppNotification, relatedReport?: SpeedReport): ResultKind | undefined => {
  if (notif.resultKind) return notif.resultKind;
  if (relatedReport?.status === 'rejected') return 'rejected';
  if (relatedReport?.status === 'transferred') return 'transferred';
  if (
    relatedReport?.status === 'approved' &&
    (relatedReport.identificationTag === 'official_first' || relatedReport.identificationTag === 'official_repeat')
  ) {
    return 'adopted';
  }
  if (notif.content.includes('驳回')) return 'rejected';
  if (notif.content.includes('已采纳') || notif.content.includes('终审')) return 'adopted';
  if (notif.content.includes('转办')) return 'transferred';
  if (notif.content.includes('下一审核节点') || notif.content.includes('已通过')) return 'mid_pass';
  return undefined;
};

const defaultResultSummary = (kind: ResultKind | undefined, relatedReport?: SpeedReport, fallback = '') => {
  if (kind === 'rejected') {
    const reason = (relatedReport?.rejectReason || fallback || '信息不完整，需补充修改').replace(
      /^驳回原因[:：]\s*/,
      ''
    );
    return `审核已驳回，驳回原因：${reason}`;
  }
  if (kind === 'adopted') {
    const scoreText = relatedReport?.score != null ? `，评分 ${relatedReport.score} 分` : '';
    return `已采纳${scoreText}` || fallback;
  }
  if (kind === 'transferred') {
    return `已转办至 ${relatedReport?.transferredDept || '相关职能部门'}`;
  }
  if (kind === 'mid_pass') {
    return '审核已通过，进入下一审核节点';
  }
  return fallback;
};

interface CardView {
  badgeText: string;
  badgeClass: string;
  badgeIcon: React.ReactNode;
  title: string;
  identificationTag?: IdentificationTag;
  summary: string;
  summaryClass: string;
  actionText: string;
  actionClass: string;
  unreadBorder: string;
}

/** 类型标签只保留三类：平台公告 / 待办通知 / 审核结果通知 */
const getCardView = (notif: AppNotification, relatedReport?: SpeedReport): CardView => {
  if (notif.type === '平台公告') {
    return {
      badgeText: '平台公告',
      badgeClass: 'bg-violet-50 text-violet-700 border-violet-200/80',
      badgeIcon: <Megaphone className="w-3 h-3" />,
      title: notif.title,
      summary: notif.content,
      summaryClass: 'text-slate-500',
      actionText: '查看公告',
      actionClass: 'text-violet-600',
      unreadBorder: 'border-violet-200',
    };
  }

  if (notif.type === '审核结果通知') {
    const kind = resolveResultKind(notif, relatedReport);
    const summary = notif.content?.trim()
      ? notif.content
      : defaultResultSummary(kind, relatedReport, notif.content);
    const isReject = kind === 'rejected';
    return {
      badgeText: '审核结果通知',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      badgeIcon: <CheckCircle2 className="w-3 h-3" />,
      title: relatedReport?.title || notif.title,
      identificationTag: relatedReport?.identificationTag,
      summary,
      summaryClass: isReject ? 'text-rose-600 font-medium' : 'text-slate-600',
      actionText: '查看速报详情',
      actionClass: 'text-blue-600',
      unreadBorder: isReject ? 'border-rose-200' : 'border-emerald-200',
    };
  }

  // 待办通知（待审核数据）
  return {
    badgeText: '待办通知',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
    badgeIcon: <Clock className="w-3 h-3" />,
    title: relatedReport?.title || notif.title,
    identificationTag: relatedReport?.identificationTag,
    summary:
      notif.content?.trim() ||
      (relatedReport ? `${relatedReport.author} · ${relatedReport.authorDept}` : notif.publisher || '待审核速报'),
    summaryClass: 'text-slate-500',
    actionText: '进入审核处理',
    actionClass: 'text-amber-700',
    unreadBorder: 'border-amber-200',
  };
};

export const NotificationView: React.FC<NotificationViewProps> = ({
  notifications,
  reports = [],
  onMarkRead,
  onSelectNotification,
}) => {
  const [tab, setTab] = useState<ReadTab>('unread');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const unreadAll = notifications.filter((n) => !n.isRead);
  const readAll = notifications.filter((n) => n.isRead && isWithinRetention(n));

  const list = useMemo(() => {
    const source = tab === 'unread' ? unreadAll : readAll;
    return [...source].sort((a, b) => b.time.localeCompare(a.time));
  }, [notifications, tab]);

  useEffect(() => setVisibleCount(PAGE_SIZE), [tab]);

  const visible = list.slice(0, visibleCount);

  const renderCard = (notif: AppNotification) => {
    const view = getCardView(notif, reports.find((r) => r.id === notif.relatedReportId));
    return (
      <div
        key={notif.id}
        className={`rounded-xl p-3 bg-white border transition-all space-y-2 shadow-2xs ${
          notif.isRead ? 'border-slate-200/80' : view.unreadBorder
        }`}
      >
        <button
          type="button"
          onClick={() => onSelectNotification(notif)}
          className="w-full text-left space-y-2 cursor-pointer active:opacity-80"
        >
          <span className="flex items-start gap-1.5 min-w-0">
            <span
              className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${view.badgeClass}`}
            >
              {view.badgeIcon}
              <span>{view.badgeText}</span>
            </span>
            <span
              className={`text-xs leading-snug truncate min-w-0 flex-1 ${
                notif.isRead ? 'font-medium text-slate-600' : 'font-bold text-slate-900'
              }`}
            >
              {view.title}
            </span>
            {view.identificationTag && (
              <IdentificationBadge tag={view.identificationTag} size="xs" className="shrink-0" />
            )}
            {notif.isRead ? (
              <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200/80">
                已读
              </span>
            ) : (
              <span className="shrink-0 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-100 mt-1" aria-label="未读" />
            )}
          </span>
          <span
            className={`block text-[11px] leading-relaxed line-clamp-2 ${
              notif.isRead ? 'text-slate-500' : view.summaryClass
            }`}
          >
            {view.summary}
          </span>
        </button>

        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100 text-[10px]">
          <span className="text-slate-400 tabular-nums truncate">{notif.time}</span>
          <button
            type="button"
            onClick={() => onSelectNotification(notif)}
            className={`shrink-0 font-medium inline-flex items-center gap-0.5 cursor-pointer ${view.actionClass}`}
          >
            {view.actionText}
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  const renderDayGroups = (mode: ReadTab) => {
    const groups: { label: string; items: AppNotification[] }[] = [];
    visible.forEach((n) => {
      const label = getDayLabel(n.time);
      const last = groups[groups.length - 1];
      if (last && last.label === label) last.items.push(n);
      else groups.push({ label, items: [n] });
    });
    return groups.map((g) => (
      <div key={`${mode}-${g.label}`} className="space-y-2">
        <p className="px-1 pt-1 text-[11px] font-semibold text-slate-400">{g.label}</p>
        {g.items.map(renderCard)}
      </div>
    ));
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col bg-slate-50/60">
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200/80">
        <div className="flex px-3" role="tablist">
          {(
            [
              { id: 'unread', label: '未读', count: unreadAll.length },
              { id: 'read', label: '已读', count: readAll.length },
            ] as const
          ).map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`relative flex-1 py-2.5 text-xs transition-colors cursor-pointer ${
                  active ? 'font-bold text-slate-900' : 'font-medium text-slate-500'
                }`}
              >
                {t.label}
                <span className={`ml-1 tabular-nums ${active ? 'text-blue-600' : 'text-slate-400'}`}>{t.count}</span>
                {active && (
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-0 h-0.5 w-8 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 space-y-2.5 flex-1 flex flex-col">
        {tab === 'unread' ? (
          <div className="flex items-center justify-between gap-2 px-1 min-h-[28px]">
            <span className="text-[11px] text-slate-400">共 {list.length} 条未读</span>
            {list.length > 0 && (
              <button
                type="button"
                onClick={() => onMarkRead(list.map((n) => n.id))}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-lg active:scale-95 transition-all cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>一键已读</span>
              </button>
            )}
          </div>
        ) : null}

        {list.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200/80 space-y-1.5">
            <Bell className="w-7 h-7 mx-auto opacity-30" />
            <p className="text-xs font-semibold text-slate-600">
              {tab === 'unread' ? '没有未读消息' : '近 1 年内暂无已读消息'}
            </p>
            {tab === 'unread' && (
              <button type="button" onClick={() => setTab('read')} className="text-[11px] text-blue-600 cursor-pointer">
                查看已读消息
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2 flex-1">
            {renderDayGroups(tab)}
            {list.length > visibleCount && (
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="w-full py-2.5 text-[11px] text-slate-500 bg-white rounded-xl border border-slate-200/80 active:bg-slate-50 cursor-pointer"
              >
                加载更多（还有 {list.length - visibleCount} 条）
              </button>
            )}
          </div>
        )}

        <p className="pt-2 pb-4 text-center text-[11px] text-slate-400">已读消息仅展示近 1 年</p>
      </div>
    </div>
  );
};
