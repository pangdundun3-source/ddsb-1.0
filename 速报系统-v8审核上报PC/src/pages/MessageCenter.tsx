import React, { useEffect, useMemo, useState } from 'react';
import { CheckCheck, ChevronLeft, ChevronRight, Inbox, RotateCcw, Search } from 'lucide-react';
import type { NotificationItem, NotificationType } from '../types';
import { NOTIFICATION_TYPE_META, isWithinRetention } from '../data/notifications';
import { AnnouncementModal } from '../components/AnnouncementModal';
import { ReportOriginBadge } from '../components/ReportOriginBadge';

type ReadTab = 'unread' | 'read';
/** 已读列表类型筛选（未读不做类型筛） */
type TypeFilter = 'all' | 'platform_notice' | 'todo' | 'result';

const PAGE_SIZE = 10;

const TYPE_FILTERS: { id: TypeFilter; label: string; match: (t: NotificationType) => boolean }[] = [
  { id: 'all', label: '全部', match: () => true },
  { id: 'platform_notice', label: '平台公告', match: (t) => t === 'platform_notice' },
  { id: 'todo', label: '待办通知', match: (t) => t === 'todo' },
  { id: 'result', label: '结果通知', match: (t) => t === 'result' }
];

interface MessageCenterProps {
  notifications: NotificationItem[];
  tab: ReadTab;
  onTabChange: (tab: ReadTab) => void;
  onMarkRead: (ids: string[]) => void;
  onOpenTarget: (item: NotificationItem) => void;
  onToast: (message: string, type?: 'success' | 'reject' | 'error' | 'info') => void;
}

export const MessageCenter: React.FC<MessageCenterProps> = ({
  notifications,
  tab,
  onTabChange,
  onMarkRead,
  onOpenTarget,
  onToast
}) => {
  const [draftKeyword, setDraftKeyword] = useState('');
  const [draftTypeFilter, setDraftTypeFilter] = useState<TypeFilter>('all');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [appliedTypeFilter, setAppliedTypeFilter] = useState<TypeFilter>('all');
  const [page, setPage] = useState(1);
  const [selectedNotice, setSelectedNotice] = useState<NotificationItem | null>(null);

  const unreadAll = notifications.filter((n) => n.isUnread);
  const readAll = notifications.filter((n) => !n.isUnread && isWithinRetention(n));

  const list = useMemo(() => {
    // 未读：不做关键词/类型筛选；已读：点「查询」后按条件过滤
    if (tab === 'unread') {
      return notifications
        .filter((n) => n.isUnread)
        .sort((a, b) => b.time.localeCompare(a.time));
    }
    const q = appliedKeyword.trim();
    const typeMatcher = TYPE_FILTERS.find((f) => f.id === appliedTypeFilter)?.match ?? (() => true);
    return notifications
      .filter((n) => !n.isUnread && isWithinRetention(n))
      .filter((n) => typeMatcher(n.type))
      .filter((n) => !q || n.title.includes(q) || n.content.includes(q))
      .sort((a, b) => b.time.localeCompare(a.time));
  }, [notifications, tab, appliedKeyword, appliedTypeFilter]);

  useEffect(() => {
    setPage(1);
    if (tab === 'unread') {
      setDraftTypeFilter('all');
      setDraftKeyword('');
      setAppliedTypeFilter('all');
      setAppliedKeyword('');
    }
  }, [tab]);

  useEffect(() => setPage(1), [appliedKeyword, appliedTypeFilter]);

  const totalPages = Math.ceil(list.length / PAGE_SIZE) || 1;
  const safePage = Math.min(page, totalPages);
  const paged = list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = () => {
    setAppliedKeyword(draftKeyword);
    setAppliedTypeFilter(draftTypeFilter);
    setPage(1);
  };

  const handleReset = () => {
    setDraftKeyword('');
    setDraftTypeFilter('all');
    setAppliedKeyword('');
    setAppliedTypeFilter('all');
    setPage(1);
  };

  const handleOpen = (item: NotificationItem) => {
    if (item.type === 'platform_notice') {
      onMarkRead([item.id]);
      setSelectedNotice(item);
    } else {
      onOpenTarget(item);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">消息中心</h2>
      </div>

        <section className="bg-white rounded-xl border border-slate-200 flex flex-col min-h-[560px]">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 border-b border-slate-100">
            <div className="flex items-center gap-6" role="tablist">
              {([
                { id: 'unread', label: '未读', count: unreadAll.length },
                { id: 'read', label: '已读', count: readAll.length }
              ] as const).map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => onTabChange(t.id)}
                    className={`relative py-3.5 text-sm transition-colors cursor-pointer ${
                      active ? 'font-bold text-slate-900' : 'font-medium text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t.label}
                    <span className={`ml-1.5 text-xs tabular-nums ${active ? 'text-[#1E5ABB]' : 'text-slate-400'}`}>
                      {t.count}
                    </span>
                    {active && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#1E5ABB] rounded-full" />}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 py-2.5 flex-wrap justify-end">
              {tab === 'read' ? (
                <>
                  <select
                    value={draftTypeFilter}
                    onChange={(e) => setDraftTypeFilter(e.target.value as TypeFilter)}
                    aria-label="消息类型筛选"
                    className="h-[30px] px-2.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB] cursor-pointer"
                  >
                    {TYPE_FILTERS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <label className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      value={draftKeyword}
                      onChange={(e) => setDraftKeyword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                      }}
                      placeholder="搜索标题或内容"
                      className="w-56 pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB]"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="px-3.5 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center space-x-1.5 cursor-pointer transition-colors"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>查询</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg border border-gray-200 flex items-center space-x-1.5 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>重置</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onMarkRead(list.map((n) => n.id));
                    onToast(`已将 ${list.length} 条消息标为已读`);
                  }}
                  disabled={list.length === 0}
                  className="inline-flex items-center gap-1 shrink-0 px-2.5 py-1.5 text-xs font-medium text-[#1E5ABB] bg-[#1E5ABB]/8 hover:bg-[#1E5ABB]/12 border border-[#1E5ABB]/20 rounded-lg cursor-pointer disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  title="一键已读"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  一键已读
                </button>
              )}
            </div>
          </div>

          <div className="flex-1">
            {paged.length === 0 ? (
              <div className="py-24 text-center text-xs text-slate-400">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                {tab === 'read' && (appliedKeyword.trim() || appliedTypeFilter !== 'all') ? (
                  <p>没有符合条件的消息</p>
                ) : tab === 'unread' ? (
                  <>
                    <p>没有未读消息</p>
                    <button onClick={() => onTabChange('read')} className="mt-2 text-[#1E5ABB] hover:underline cursor-pointer">
                      查看已读消息
                    </button>
                  </>
                ) : (
                  <p>近 1 年内暂无已读消息</p>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {paged.map((item) => {
                  const meta = NOTIFICATION_TYPE_META[item.type];
                  return (
                    <li key={item.id} className="group flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${item.isUnread ? 'bg-[#2563EB]' : 'bg-transparent'}`}
                        aria-label={item.isUnread ? '未读' : undefined}
                      />
                      <button onClick={() => handleOpen(item)} className="min-w-0 flex-1 text-left cursor-pointer">
                        <span className="flex items-center gap-2 min-w-0">
                          <span className={`text-[11px] font-semibold px-1.5 py-px rounded shrink-0 ${meta.tone}`}>
                            {meta.label}
                          </span>
                          <span
                            className={`text-sm truncate group-hover:text-[#1E5ABB] transition-colors ${
                              item.isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-600'
                            }`}
                          >
                            {item.title}
                          </span>
                          {item.originLabel && item.originLabel !== '识别中' && (
                            <ReportOriginBadge label={item.originLabel} size="sm" className="shrink-0" />
                          )}
                          {!item.isUnread && (
                            <span className="shrink-0 px-1.5 py-px rounded text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200/80">
                              已读
                            </span>
                          )}
                        </span>
                        <span
                          className={`mt-1 block text-xs truncate ${
                            (item.contentHighlight || item.resultKind === 'rejected') && item.isUnread
                              ? 'text-[#DC2626] font-medium'
                              : 'text-slate-500'
                          }`}
                          title={item.content}
                        >
                          {item.content}
                        </span>
                      </button>
                      <div className="shrink-0 flex flex-col items-end gap-1.5 text-[11px]">
                        <span className="text-slate-400 tabular-nums">{item.time}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-end px-5 py-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="tabular-nums">
                第 {safePage}/{totalPages} 页，共 {list.length} 条
              </span>
              <button
                onClick={() => setPage(Math.max(1, safePage - 1))}
                disabled={safePage <= 1}
                className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="上一页"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage >= totalPages}
                className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="下一页"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>
          </div>
        </section>

      <p className="text-center text-xs text-slate-400 pt-1">已读消息仅展示近 1 年</p>

      <AnnouncementModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
    </div>
  );
};
