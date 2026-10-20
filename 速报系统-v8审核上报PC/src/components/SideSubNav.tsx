import React from 'react';
import {
  Clock,
  CheckCircle2,
  BarChart3,
  Plus,
  type LucideIcon
} from 'lucide-react';
import type { PageId } from '../types';

export type SideNavGroup = 'report' | 'audit';

interface SideNavItem {
  page: PageId;
  label: string;
  desc: string;
  icon: LucideIcon;
  iconClass: string;
  activePages: PageId[];
}

const GROUPS: Record<SideNavGroup, { items: SideNavItem[] }> = {
  report: {
    items: [
      {
        page: 'report-summary',
        label: '我的报送',
        desc: '待审核、审核中、被驳回',
        icon: Clock,
        iconClass: 'text-amber-500',
        activePages: ['report-summary']
      },
      {
        page: 'report-records',
        label: '报送记录',
        desc: '全部报送台账',
        icon: CheckCircle2,
        iconClass: 'text-emerald-500',
        activePages: ['report-records']
      },
      {
        page: 'report-statistics',
        label: '报送统计',
        desc: '上报趋势与通过率',
        icon: BarChart3,
        iconClass: 'text-blue-500',
        activePages: ['report-statistics']
      }
    ]
  },
  audit: {
    items: [
      {
        page: 'report-audit',
        label: '我的审核',
        desc: '待审批线索处理',
        icon: Clock,
        iconClass: 'text-amber-500',
        activePages: ['report-audit', 'audit-detail']
      },
      {
        page: 'audit-records',
        label: '审核记录',
        desc: '已审核台账',
        icon: CheckCircle2,
        iconClass: 'text-emerald-500',
        activePages: ['audit-records', 'audit-record-detail']
      },
      {
        page: 'audit-statistics',
        label: '审核统计',
        desc: '审核趋势与处理率',
        icon: BarChart3,
        iconClass: 'text-blue-500',
        activePages: ['audit-statistics']
      }
    ]
  }
};

const REPORT_PAGES: PageId[] = ['report-summary', 'report-records', 'report-statistics'];
const AUDIT_PAGES: PageId[] = [
  'report-audit',
  'audit-detail',
  'audit-records',
  'audit-record-detail',
  'audit-statistics'
];
export const getSideNavGroup = (
  activePage: PageId,
  reportDetailSourcePage?: PageId
): SideNavGroup | null => {
  if (activePage === 'report-detail') {
    return reportDetailSourcePage === 'audit-records' ? 'audit' : 'report';
  }
  if (REPORT_PAGES.includes(activePage)) return 'report';
  if (AUDIT_PAGES.includes(activePage)) return 'audit';
  return null;
};

interface SideSubNavProps {
  group: SideNavGroup;
  activePage: PageId;
  reportDetailSourcePage?: PageId;
  onNavigate: (page: PageId) => void;
  onNewReport?: () => void;
  badges?: Partial<Record<PageId, number>>;
}

export const SideSubNav: React.FC<SideSubNavProps> = ({
  group,
  activePage,
  reportDetailSourcePage = 'report-summary',
  onNavigate,
  onNewReport,
  badges = {}
}) => {
  const { items } = GROUPS[group];

  const isItemActive = (item: SideNavItem) =>
    item.activePages.includes(activePage) ||
    (activePage === 'report-detail' &&
      item.page === (reportDetailSourcePage === 'audit-records' ? 'audit-records' : reportDetailSourcePage));

  return (
    <aside className="hidden md:block w-44 shrink-0 sticky top-[134px] self-start">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-2">
        <nav className="space-y-1">
          {items.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;
            return (
              <button
                key={item.page}
                type="button"
                onClick={() => onNavigate(item.page)}
                className={`relative w-full text-left px-2.5 py-2.5 rounded-xl flex items-start space-x-2.5 transition-all cursor-pointer ${
                  active
                    ? 'bg-blue-50 text-[#1E5ABB]'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-[#1E5ABB]" />
                )}
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${active ? 'text-[#1E5ABB]' : item.iconClass}`} />
                <span className="min-w-0 flex-1">
                  <span className={`flex items-center justify-between gap-2 text-[13px] ${active ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                    {!!badges[item.page] && (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-[18px] text-center tabular-nums">
                        {badges[item.page]! > 99 ? '99+' : badges[item.page]}
                      </span>
                    )}
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-0.5 truncate" title={item.desc}>
                    {item.desc}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        {group === 'report' && onNewReport && (
          <button
            onClick={onNewReport}
            className="mt-3 w-full py-2 rounded-xl bg-[#1E5ABB] hover:bg-[#184996] text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建速报</span>
          </button>
        )}
      </div>
    </aside>
  );
};
