import React from 'react';
import { ChevronRight, FileText, Sparkles, Megaphone, Clock, CheckCircle2, XCircle, Bell, X } from 'lucide-react';
import { REPORT_TEMPLATES } from '../data/mockData';
import { UserProfile, AppNotification } from '../types';

interface DashboardViewProps {
  user: UserProfile;
  onNewReport: (templateId: string) => void;
  latestNotification?: AppNotification;
  notifications?: AppNotification[];
  onNavigateToMessages?: () => void;
  onSelectNotification?: (notif: AppNotification) => void;
  onDismissNotification?: (notifId: string) => void;
}

const cardToneClasses = [
  'from-blue-50 via-sky-50 to-cyan-50 border-blue-100 text-blue-700',
  'from-amber-50 via-orange-50 to-rose-50 border-amber-100 text-amber-700',
  'from-emerald-50 via-teal-50 to-cyan-50 border-emerald-100 text-emerald-700',
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onNewReport,
  latestNotification,
  notifications = [],
  onNavigateToMessages,
  onSelectNotification,
  onDismissNotification,
}) => {
  const displayRole = user.role === '审核员' ? '审核员' : '上报员';

  const getNoticeMeta = (notif: AppNotification) => {
    if (notif.type === '平台公告') {
      return {
        badgeText: '平台公告',
        badgeClass: 'bg-violet-50 text-violet-700 border-violet-200/80',
        iconBg: 'bg-violet-50 border-violet-100 text-violet-600',
        icon: <Megaphone className="w-3 h-3 text-violet-600" />,
        actionText: '查看公告',
        actionColor: 'text-violet-600',
        hoverBorder: 'hover:border-violet-300',
      };
    }
    if (notif.type === '待审核通知') {
      return {
        badgeText: '待审核',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
        iconBg: 'bg-amber-50 border-amber-100 text-amber-600',
        icon: <Clock className="w-3.5 h-3.5" />,
        actionText: '查看详情',
        actionColor: 'text-amber-600',
        hoverBorder: 'hover:border-amber-300',
      };
    }
    if (notif.title.includes('驳回') || notif.content?.includes('驳回') || notif.content?.includes('退回')) {
      return {
        badgeText: '审核驳回',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
        iconBg: 'bg-rose-50 border-rose-100 text-rose-600',
        icon: <XCircle className="w-3.5 h-3.5" />,
        actionText: '查看详情',
        actionColor: 'text-rose-600',
        hoverBorder: 'hover:border-rose-300',
      };
    }
    return {
      badgeText: '审核通过',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      iconBg: 'bg-emerald-50 border-emerald-100 text-emerald-600',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      actionText: '查看详情',
      actionColor: 'text-emerald-600',
      hoverBorder: 'hover:border-emerald-300',
    };
  };

  return (
    <div className="flex-1 p-3 space-y-3 overflow-y-auto">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 p-4 text-white shadow-md shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute -right-6 -top-8 w-24 h-24 rounded-full border border-white/15" />
        <div className="absolute right-8 -bottom-10 w-20 h-20 rounded-full bg-white/10" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-100 shrink-0" />
              <h2 className="text-sm font-black tracking-tight truncate">选择上报模板</h2>
            </div>
            <p className="text-[11px] text-blue-50/90 mt-1 leading-relaxed">
              先选模板，再进入填报。不同场景一键直达，减少重复填写。
            </p>
          </div>
          <div className="shrink-0 rounded-full bg-white/18 border border-white/20 px-2.5 py-1">
            <span className="text-[10px] font-bold text-white/90">{displayRole}</span>
          </div>
        </div>
      </div>

      {/* Optimized Home Message Card (Aligned with NotificationView Design + Dismiss) */}
      {latestNotification && (() => {
        const meta = getNoticeMeta(latestNotification);
        return (
          <div
            onClick={() => {
              if (onSelectNotification) {
                onSelectNotification(latestNotification);
              } else if (onNavigateToMessages) {
                onNavigateToMessages();
              }
            }}
            className={`rounded-xl p-3 bg-white border transition-all cursor-pointer relative space-y-2 shadow-2xs ${meta.hoverBorder} active:scale-[0.99] ${
              latestNotification.isRead ? 'border-slate-200/80 text-slate-700' : 'border-blue-200 text-slate-800'
            }`}
          >
            {/* Row 1: Badge + Title + Unread Indicator + Close Button */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${meta.badgeClass}`}>
                {meta.icon}
                <span>{meta.badgeText}</span>
              </span>
              <h4 className="text-xs font-bold text-slate-900 leading-snug truncate flex-1">
                {latestNotification.title}
              </h4>
              {!latestNotification.isRead && (
                <span className="shrink-0 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-100" />
              )}
              {onDismissNotification && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismissNotification(latestNotification.id);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                  title="关闭此条通知"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Row 2: Content Summary */}
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
              {latestNotification.content}
            </p>

            {/* Row 3: Time at bottom-left + Action link at bottom-right */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
              <span className="text-slate-400 font-mono">{latestNotification.time}</span>
              <span className={`font-medium flex items-center gap-0.5 ${meta.actionColor}`}>
                {meta.actionText} <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 gap-2.5">
        {REPORT_TEMPLATES.map((tpl, index) => {
          const tone = cardToneClasses[index % cardToneClasses.length];
          return (
            <div
              key={tpl.id}
              onClick={() => onNewReport(tpl.id)}
              className={`rounded-2xl border bg-gradient-to-r p-3.5 shadow-2xs hover:shadow-xs hover:border-blue-400 transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99] ${tone}`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white shadow-2xs border border-slate-200/60 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {tpl.name}
                    </h3>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-600 font-semibold shrink-0">
                      {tpl.defaultType}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {tpl.titlePlaceholder}
                  </p>
                </div>
              </div>

              <div className="w-7 h-7 rounded-full bg-white/80 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-2">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
