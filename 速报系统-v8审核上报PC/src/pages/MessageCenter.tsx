import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox, Search } from 'lucide-react';
import type { NotificationItem } from '../types';
import { NOTIFICATION_TYPE_META, isWithinRetention } from '../data/notifications';
import { AnnouncementModal } from '../components/AnnouncementModal';

type ReadTab = 'unread' | 'read';

const PAGE_SIZE = 10;

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
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [selectedNotice, setSelectedNotice] = useState<NotificationItem | null>(null);

  const unreadAll = notifications.filter((n) => n.isUnread);
  const readAll = notifications.filter((n) => !n.isUnread && isWithinRetention(n));

  const list = useMemo(() => {
    const source = tab === 'unread' ? unreadAll : readAll;
    const q = keyword.trim();
    return source
      .filter((n) => !q || n.title.includes(q) || n.content.includes(q))
      .sort((a, b) =>
        tab === 'read'
          ? (b.readAt || b.time).localeCompare(a.readAt || a.time)
          : b.time.localeCompare(a.time)
      );
  }, [notifications, tab, keyword]);

  useEffect(() => setPage(1), [tab, keyword]);

  const totalPages = Math.ceil(list.length / PAGE_SIZE) || 1;
  const safePage = Math.min(page, totalPages);
  const paged = list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
        <span className="text-xs text-slate-400">已读消息保留近三个月</span>
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
            <label className="relative py-2.5">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索标题或内容"
                className="w-56 pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/20 focus:border-[#1E5ABB]"
              />
            </label>
          </div>

          <div className="flex-1">
            {paged.length === 0 ? (
              <div className="py-24 text-center text-xs text-slate-400">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                {keyword.trim() ? (
                  <p>没有找到包含“{keyword.trim()}”的消息</p>
                ) : tab === 'unread' ? (
                  <>
                    <p>没有未读消息</p>
                    <button onClick={() => onTabChange('read')} className="mt-2 text-[#1E5ABB] hover:underline cursor-pointer">
                      查看已读消息
                    </button>
                  </>
                ) : (
                  <p>近三个月没有已读消息</p>
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
                        </span>
                        <span
                          className={`mt-1 block text-xs truncate ${
                            item.contentHighlight && item.isUnread ? 'text-[#DC2626]' : 'text-slate-500'
                          }`}
                          title={item.content}
                        >
                          {item.content}
                        </span>
                      </button>
                      <div className="shrink-0 flex flex-col items-end gap-1.5 text-[11px]">
                        <span className="text-slate-400 tabular-nums">
                          {item.time}
                        </span>
                        {!item.isUnread && item.readAt && (
                          <span className="text-slate-400 tabular-nums">已读于 {item.readAt.slice(5)}</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            {tab === 'unread' ? (
              <button
                onClick={() => {
                  onMarkRead(list.map((n) => n.id));
                  onToast(`已将 ${list.length} 条消息标为已读`);
                }}
                disabled={list.length === 0}
                className="text-xs text-slate-600 hover:text-[#1E5ABB] cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                {!keyword.trim() ? '全部标为已读' : '将搜索结果标为已读'}
              </button>
            ) : (
              <span />
            )}

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

      <AnnouncementModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
    </div>
  );
};
