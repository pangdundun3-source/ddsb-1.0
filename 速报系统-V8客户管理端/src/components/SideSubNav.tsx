import React from 'react';
import { Clock, CheckCircle2, BarChart3, ShieldAlert, Warehouse, type LucideIcon } from 'lucide-react';
import type { PageId } from '../types';

export type SideNavGroup = 'audit' | 'negative';

interface SideNavItem {
  page: PageId;
  label: string;
  desc: string;
  icon: LucideIcon;
  iconClass: string;
  activePages: PageId[];
}

const GROUPS: Record<SideNavGroup, { items: SideNavItem[] }> = {
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
  },
  negative: {
    items: [
      {
        page: 'negative-info',
        label: '不良信息库',
        desc: '按仓库查看已通过线索',
        icon: ShieldAlert,
        iconClass: 'text-rose-500',
        activePages: ['negative-info', 'negative-detail']
      },
      {
        page: 'warehouse-manage',
        label: '仓库管理',
        desc: '分类、可见范围与迁移',
        icon: Warehouse,
        iconClass: 'text-amber-500',
        activePages: ['warehouse-manage']
      }
    ]
  }
};

const AUDIT_PAGES: PageId[] = [
  'report-audit',
  'audit-detail',
  'audit-records',
  'audit-record-detail',
  'audit-statistics'
];

const NEGATIVE_PAGES: PageId[] = ['negative-info', 'negative-detail', 'warehouse-manage'];

export const getSideNavGroup = (activePage: PageId): SideNavGroup | null => {
  if (AUDIT_PAGES.includes(activePage)) return 'audit';
  if (NEGATIVE_PAGES.includes(activePage)) return 'negative';
  return null;
};

interface SideSubNavProps {
  group: SideNavGroup;
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

export const SideSubNav: React.FC<SideSubNavProps> = ({ group, activePage, onNavigate }) => {
  const { items } = GROUPS[group];

  return (
    <aside className="hidden md:block w-44 shrink-0 sticky top-5 self-start">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-2">
        <nav className="space-y-1">
          {items.map((item) => {
            const active = item.activePages.includes(activePage);
            const Icon = item.icon;
            return (
              <button
                key={item.page}
                onClick={() => {
                  if (item.page === 'negative-info') {
                    window.dispatchEvent(new Event('ddsb-negative-library-home'));
                  }
                  onNavigate(item.page);
                }}
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
                <span className="min-w-0">
                  <span className={`block text-[13px] ${active ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-0.5 truncate">{item.desc}</span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
