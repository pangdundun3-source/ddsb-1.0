import React, { useState } from 'react';
import { ChevronRight, Inbox } from 'lucide-react';
import type { NotificationItem } from '../types';
import { NOTIFICATION_TYPE_META } from '../data/notifications';
import { AnnouncementModal } from './AnnouncementModal';

const MAX_VISIBLE = 4;

interface HomeNotificationPanelProps {
  notifications: NotificationItem[];
  onMarkRead: (ids: string[]) => void;
  onOpenTarget: (item: NotificationItem) => void;
  onViewAll: (tab?: 'unread' | 'read') => void;
  className?: string;
}

export const HomeNotificationPanel: React.FC<HomeNotificationPanelProps> = ({
  notifications,
  onMarkRead,
  onOpenTarget,
  onViewAll,
  className = ''
}) => {
  const [selectedNotice, setSelectedNotice] = useState<NotificationItem | null>(null);

  const unread = notifications.filter((n) => n.isUnread);
  const visible = unread.slice(0, MAX_VISIBLE);

  const handleItemClick = (item: NotificationItem) => {
    if (item.type === 'platform_notice') {
      onMarkRead([item.id]);
      setSelectedNotice(item);
    } else {
      onOpenTarget(item);
    }
  };

  return (
    <section
      id="home-notification-section"
      className={`bg-white rounded-xl border border-slate-200 flex flex-col ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-baseline gap-2">
          <h3 className="font-bold text-sm text-slate-900">消息通知</h3>
          {unread.length > 0 && (
            <span className="text-xs text-rose-600 font-semibold">{unread.length} 条未读</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => onMarkRead(unread.map((n) => n.id))}
            disabled={unread.length === 0}
            className="text-slate-500 hover:text-[#1E5ABB] transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            全部标为已读
          </button>
          <button
            onClick={() => onViewAll()}
            className="text-slate-500 hover:text-[#1E5ABB] inline-flex items-center cursor-pointer"
          >
            查看全部
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-xs text-slate-400">
          <Inbox className="w-8 h-8 mb-2 opacity-40" />
          <p>没有未读消息</p>
          <button
            onClick={() => onViewAll('read')}
            className="mt-2 text-[#1E5ABB] hover:underline cursor-pointer"
          >
            查看已读消息
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {visible.map((item) => {
            const meta = NOTIFICATION_TYPE_META[item.type];
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item)}
                  title={meta.actionText}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer group flex gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-[#2563EB]" aria-label="未读" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[11px] font-semibold px-1.5 py-px rounded shrink-0 ${meta.tone}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs truncate font-bold text-slate-900 group-hover:text-[#1E5ABB] transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs">
                      <span
                        className={`truncate flex-1 ${item.contentHighlight ? 'text-[#DC2626]' : 'text-slate-500'}`}
                        title={item.content}
                      >
                        {item.content}
                      </span>
                      <span className="shrink-0 text-[11px] text-slate-400 tabular-nums">{item.time.slice(5)}</span>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <AnnouncementModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
    </section>
  );
};
