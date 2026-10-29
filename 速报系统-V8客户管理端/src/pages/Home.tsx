import React, { useState, useMemo } from 'react';
import { PageId, ReportItem, OrgItem } from '../types';
import { IdentificationBadge } from '../components/IdentificationBadge';
import { getOrganizationPathText } from '../components/OrgPathDisplay';
import { resolveIdentification } from '../services/identificationService';
import { getAuditArrivedAt } from '../services/reportWorkflowService';
import { AuditDetail } from './AuditDetail';
import { Building2, ChevronRight, RotateCcw, Inbox } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface HomeProps {
  reports: ReportItem[];
  orgs: OrgItem[];
  onNavigate: (page: PageId, extra?: string) => void;
  onApproveAudit?: (
    id: number,
    score?: number,
    isBatch?: boolean,
    manualIdentification?: '首发' | '重复',
    batchIds?: number[],
    scoreMap?: Record<number, number>,
    identMap?: Record<number, '首发' | '重复'>
  ) => void;
  onRejectAudit?: (id: number, reason: string, detail: string) => void;
  currentUser?: string;
}

const bottomChartData = [
  { day: '08-28', submitted: 64, passed: 53, passRate: 92.8, directRate: 76.5 },
  { day: '08-29', submitted: 71, passed: 63, passRate: 93.5, directRate: 77.2 },
  { day: '08-30', submitted: 76, passed: 70, passRate: 94.1, directRate: 78.0 },
  { day: '08-31', submitted: 54, passed: 49, passRate: 92.2, directRate: 75.8 },
  { day: '09-01', submitted: 79, passed: 73, passRate: 93.8, directRate: 79.1 },
  { day: '09-02', submitted: 75, passed: 69, passRate: 93.0, directRate: 78.4 },
  { day: '09-03', submitted: 78, passed: 72, passRate: 93.3, directRate: 78.6 }
];

const subOrgMatrixData = [
  { name: '北屯区宣传部', todaySubmitted: 2, pendingAudit: 11, rejectedResend: 4, reporterActive: '3/9', auditorActive: '1/3', avgMinutes: 135 },
  { name: '市市场监管局宣教科', todaySubmitted: 4, pendingAudit: 6, rejectedResend: 2, reporterActive: '4/6', auditorActive: '1/2', avgMinutes: 70 },
  { name: '中共台中市委宣传部(本级)', todaySubmitted: 14, pendingAudit: 5, rejectedResend: 0, reporterActive: '6/6', auditorActive: '3/3', avgMinutes: 9 },
  { name: '南屯区宣传部', todaySubmitted: 8, pendingAudit: 4, rejectedResend: 2, reporterActive: '5/7', auditorActive: '2/2', avgMinutes: 56 },
  { name: '西区宣传部', todaySubmitted: 12, pendingAudit: 3, rejectedResend: 1, reporterActive: '8/10', auditorActive: '2/2', avgMinutes: 18 },
  { name: '高新区管委会舆情室', todaySubmitted: 6, pendingAudit: 3, rejectedResend: 1, reporterActive: '2/5', auditorActive: '1/2', avgMinutes: 35 },
  { name: '台中市网信办直属队', todaySubmitted: 9, pendingAudit: 2, rejectedResend: 1, reporterActive: '7/8', auditorActive: '2/2', avgMinutes: 14 },
  { name: '市卫健委宣传处', todaySubmitted: 2, pendingAudit: 2, rejectedResend: 1, reporterActive: '2/5', auditorActive: '1/2', avgMinutes: 40 },
  { name: '东湖区宣传处', todaySubmitted: 7, pendingAudit: 1, rejectedResend: 0, reporterActive: '6/6', auditorActive: '2/2', avgMinutes: 22 },
  { name: '市教育局宣教科', todaySubmitted: 3, pendingAudit: 1, rejectedResend: 0, reporterActive: '3/4', auditorActive: '2/2', avgMinutes: 25 },
  { name: '市政务服务局', todaySubmitted: 1, pendingAudit: 1, rejectedResend: 0, reporterActive: '1/3', auditorActive: '1/1', avgMinutes: 30 }
];

/** 待审核积压和平均审核耗时超过这两个阈值时标红提醒 */
const PENDING_ALERT = 5;
const AVG_MINUTES_ALERT = 60;

const SORT_OPTIONS = {
  submitted: '今日上报',
  pending: '待审核',
  rejected: '驳回待重报',
  reporterActive: '上报员活跃',
  auditorActive: '审核员活跃',
  avgTime: '平均审核耗时'
} as const;
type SortKey = keyof typeof SORT_OPTIONS;

const TODO_LIMIT = 6;

const parseActiveRatio = (value: string) => {
  const [active, total] = value.split('/').map(Number);
  return total > 0 ? active / total : 0;
};

const formatMinutes = (minutes: number) =>
  minutes >= 60 ? `${Math.floor(minutes / 60)}小时${minutes % 60 ? `${minutes % 60}分` : ''}` : `${minutes}分钟`;

const getGreeting = (hour: number) => (hour < 12 ? '上午好' : hour < 18 ? '下午好' : '晚上好');

const Card: React.FC<{ title: React.ReactNode; extra?: React.ReactNode; children: React.ReactNode; className?: string }> = ({
  title,
  extra,
  children,
  className = ''
}) => (
  <section className={`bg-white rounded-xl border border-slate-200 ${className}`}>
    <header className="flex items-center justify-between gap-3 px-5 h-12 border-b border-slate-100">
      <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">{title}</h2>
      {extra}
    </header>
    {children}
  </section>
);

export const Home: React.FC<HomeProps> = ({
  reports,
  onNavigate,
  onApproveAudit,
  onRejectAudit,
  currentUser = '张三'
}) => {
  const [currentTime, setCurrentTime] = useState('2026-09-04 17:25');
  const [sortKey, setSortKey] = useState<SortKey>('submitted');
  const [drawerAuditReport, setDrawerAuditReport] = useState<ReportItem | null>(null);

  const pendingAudits = useMemo(
    () =>
      reports
        .filter((r) => r.auditStatus === '待审核')
        .sort((a, b) => (a.submitTime || '').localeCompare(b.submitTime || '')),
    [reports]
  );
  const rejectedCount = reports.filter((r) => r.auditStatus === '被驳回' || r.auditStatus === '已驳回').length;
  const toTransferCount = reports.filter((r) => r.auditStatus === '待转办').length;
  const todaySubmitted = subOrgMatrixData.reduce((sum, org) => sum + org.todaySubmitted, 0);

  const sortedOrgs = useMemo(() => {
    const list = [...subOrgMatrixData];
    if (sortKey === 'submitted') list.sort((a, b) => b.todaySubmitted - a.todaySubmitted);
    if (sortKey === 'pending') list.sort((a, b) => b.pendingAudit - a.pendingAudit);
    if (sortKey === 'rejected') list.sort((a, b) => b.rejectedResend - a.rejectedResend);
    if (sortKey === 'reporterActive') {
      list.sort((a, b) => parseActiveRatio(b.reporterActive) - parseActiveRatio(a.reporterActive));
    }
    if (sortKey === 'auditorActive') {
      list.sort((a, b) => parseActiveRatio(b.auditorActive) - parseActiveRatio(a.auditorActive));
    }
    if (sortKey === 'avgTime') list.sort((a, b) => b.avgMinutes - a.avgMinutes);
    return list;
  }, [sortKey]);

  const sortKeys = Object.keys(SORT_OPTIONS) as SortKey[];

  const totals = bottomChartData.reduce(
    (acc, d) => ({ submitted: acc.submitted + d.submitted, passed: acc.passed + d.passed }),
    { submitted: 0, passed: 0 }
  );
  const avgPassRate = bottomChartData.reduce((sum, d) => sum + d.passRate, 0) / bottomChartData.length;
  const avgDirectRate = bottomChartData.reduce((sum, d) => sum + d.directRate, 0) / bottomChartData.length;

  const handleQuickAudit = (report: ReportItem) => {
    setDrawerAuditReport(report);
  };

  const displayName = currentUser.replace(/\s*\(.*\)$/, '');
  const hour = Number(currentTime.slice(11, 13));

  const stats: {
    label: string;
    value: number;
    unit: string;
    tone: string;
    onClick?: () => void;
  }[] = [
    {
      label: '待我审核',
      value: pendingAudits.length,
      unit: '件',
      tone: 'text-[#1E5ABB]',
      onClick: () => onNavigate('report-audit')
    },
    {
      label: '已驳回待重报',
      value: rejectedCount,
      unit: '件',
      tone: 'text-amber-600',
      onClick: () => onNavigate('report-audit', 'rejected')
    },
    {
      label: '已采纳待转办',
      value: toTransferCount,
      unit: '件',
      tone: 'text-violet-600',
      onClick: () => onNavigate('audit-records')
    },
    { label: '今日上报', value: todaySubmitted, unit: '件', tone: 'text-slate-900' }
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      <section className="bg-white rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div>
            <h1 className="text-base font-bold text-slate-900">
              {getGreeting(hour)}，{displayName}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 tabular-nums">
            <span>统计更新 {currentTime}</span>
            <button
              onClick={() => {
                const now = new Date();
                const pad = (n: number) => String(n).padStart(2, '0');
                setCurrentTime(
                  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
                );
              }}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="刷新"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
          {stats.map((s) => {
            const content = (
              <>
                <span className="flex items-center justify-between text-xs text-slate-500">
                  {s.label}
                  {s.onClick && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#1E5ABB] transition-colors" />
                  )}
                </span>
                <span className="mt-1.5 block">
                  <span className={`text-2xl font-bold tabular-nums ${s.tone}`}>{s.value}</span>
                  <span className="ml-1 text-xs text-slate-400">{s.unit}</span>
                </span>
              </>
            );
            return s.onClick ? (
              <button
                key={s.label}
                onClick={s.onClick}
                className="group text-left px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {content}
              </button>
            ) : (
              <div key={s.label} className="px-5 py-4 text-left">
                {content}
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
      <Card
        className="xl:col-span-5 flex flex-col"
        title={
          <>
            待我审核
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-px rounded tabular-nums">
              {pendingAudits.length}
            </span>
          </>
        }
        extra={
          <button
            onClick={() => onNavigate('report-audit')}
            className="text-xs text-slate-500 hover:text-[#1E5ABB] flex items-center gap-0.5 cursor-pointer"
          >
            查看全部
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        {pendingAudits.length === 0 ? (
          <div className="py-14 text-center text-xs text-slate-400">
            <Inbox className="w-7 h-7 mx-auto mb-2 opacity-40" />
            暂无待我审核速报
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pendingAudits.slice(0, TODO_LIMIT).map((item, index) => {
              const ident = resolveIdentification(item, reports);
              return (
                <li key={item.id}>
                  <div className="flex gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50/70">
                    <span className="mt-0.5 w-6 shrink-0 text-center font-mono text-xs text-gray-400">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="shrink-0 rounded bg-amber-50 px-1.5 py-px text-[11px] font-medium text-amber-700">
                            待审核
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickAudit(item)}
                            title={item.title}
                            className="min-w-0 cursor-pointer truncate text-left text-sm font-semibold text-gray-900 hover:text-[#1E5ABB]"
                          >
                            {item.title}
                          </button>
                          <IdentificationBadge status={ident.status} size="xs" className="shrink-0" />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQuickAudit(item)}
                          className="shrink-0 cursor-pointer text-xs font-semibold text-[#1E5ABB] hover:underline"
                        >
                          审核
                        </button>
                      </div>
                      <p className="truncate text-xs text-gray-500" title={item.detailContent?.summary || item.title}>
                        {item.detailContent?.summary || '暂无内容描述'}
                      </p>
                      <div className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[11px] text-gray-400">
                        <span className="shrink-0 rounded bg-gray-100 px-1 text-gray-500">报送人</span>
                        <span className="shrink-0 text-gray-600">{item.author || '—'}</span>
                        <span className="shrink-0 text-gray-300">·</span>
                        <span title={getOrganizationPathText(item.organization)} className="truncate">
                          {item.organization}
                        </span>
                        <span className="shrink-0 text-gray-300">·</span>
                        <span className="shrink-0 font-mono text-gray-500">{item.submitTime}</span>
                        <span className="shrink-0 text-gray-300">·</span>
                        <span className="shrink-0">
                          提交时间 <span className="font-mono text-gray-500">{getAuditArrivedAt(item)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {pendingAudits.length > TODO_LIMIT && (
          <button
            onClick={() => onNavigate('report-audit')}
            className="mt-auto w-full py-2.5 border-t border-slate-100 text-xs text-slate-500 hover:text-[#1E5ABB] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            还有 {pendingAudits.length - TODO_LIMIT} 条待我审核，去审核管理处理
          </button>
        )}
      </Card>

      <Card
        className="xl:col-span-7 flex h-full min-h-0 flex-col min-w-0"
        title={
          <>
            组织节点运行矩阵
            <span className="text-xs font-normal text-slate-400">{subOrgMatrixData.length} 个组织节点</span>
          </>
        }
        extra={
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <span className="whitespace-nowrap">排序字段</span>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="min-w-[132px] px-2.5 py-1 bg-white border border-slate-200 hover:border-[#1E5ABB]/40 focus:border-[#1E5ABB] rounded-lg text-xs text-slate-700 outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 cursor-pointer"
            >
              {sortKeys.map((key) => (
                <option key={key} value={key}>
                  {SORT_OPTIONS[key]}
                </option>
              ))}
            </select>
          </label>
        }
      >
        <div className="min-h-0 flex-1 overflow-x-auto">
          <table className="w-full min-w-[600px] table-fixed text-left text-xs">
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[12%]" />
              <col className="w-[13%]" />
              <col className="w-[13%]" />
              <col className="w-[16%]" />
            </colgroup>
            <thead className="text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-2 font-medium leading-tight">组织节点名称</th>
                <th className="py-2.5 px-1.5 font-medium text-right leading-tight">今日上报</th>
                <th className="py-2.5 px-1.5 font-medium text-right leading-tight">待审核</th>
                <th className="py-2.5 px-1.5 font-medium text-right leading-tight">驳回待重报</th>
                <th className="py-2.5 px-1.5 font-medium text-right leading-tight">上报员活跃</th>
                <th className="py-2.5 px-1.5 font-medium text-right leading-tight">审核员活跃</th>
                <th className="py-2.5 px-2 font-medium text-right leading-tight">平均审核耗时</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 tabular-nums">
              {sortedOrgs.map((org) => (
                <tr key={org.name} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-2">
                    <span className="flex items-start gap-1.5 font-medium text-slate-900 leading-tight break-words">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {org.name}
                    </span>
                  </td>
                  <td className="py-2.5 px-1.5 text-right">{org.todaySubmitted}</td>
                  <td className={`py-2.5 px-1.5 text-right ${org.pendingAudit >= PENDING_ALERT ? 'text-rose-600 font-semibold' : ''}`}>
                    {org.pendingAudit}
                  </td>
                  <td className="py-2.5 px-1.5 text-right">{org.rejectedResend}</td>
                  <td className="py-2.5 px-1.5 text-right">{org.reporterActive}</td>
                  <td className="py-2.5 px-1.5 text-right">{org.auditorActive}</td>
                  <td
                    className={`py-2.5 px-2 text-right leading-tight ${
                      org.avgMinutes >= AVG_MINUTES_ALERT ? 'text-rose-600 font-semibold' : ''
                    }`}
                  >
                    {formatMinutes(org.avgMinutes)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="shrink-0 px-5 py-2.5 border-t border-slate-100 text-[11px] text-slate-400">
          待审核 ≥ {PENDING_ALERT} 件或平均审核耗时超过 1 小时标红提示
        </p>
      </Card>
      </div>

      <Card
        title="近 7 日业务走势"
        extra={
          <div className="hidden md:flex items-center gap-5 text-xs text-slate-500">
            <span>
              上报 <strong className="text-slate-900 tabular-nums">{totals.submitted}</strong>
            </span>
            <span>
              采纳 <strong className="text-emerald-700 tabular-nums">{totals.passed}</strong>
            </span>
            <span>
              通过率 <strong className="text-[#1E5ABB] tabular-nums">{avgPassRate.toFixed(1)}%</strong>
            </span>
            <span>
              一次通过率 <strong className="text-amber-600 tabular-nums">{avgDirectRate.toFixed(1)}%</strong>
            </span>
          </div>
        }
      >
        <div className="px-5 pt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#1E5ABB]" />
            上报量
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]" />
            采纳量
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-[#1E5ABB]" />
            整体通过率
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed border-amber-500" />
            一次通过率
          </span>
        </div>
        <div className="h-72 w-full px-2 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={bottomChartData} margin={{ top: 16, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" domain={[60, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar yAxisId="left" dataKey="submitted" name="上报量" fill="#1E5ABB" barSize={18} radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="passed" name="采纳量" fill="#10B981" barSize={18} radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="passRate" name="整体通过率" stroke="#1E5ABB" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="directRate" name="一次通过率" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {drawerAuditReport && (
        <AuditDetail
          report={drawerAuditReport}
          allReports={reports}
          onNavigate={onNavigate}
          onClose={() => setDrawerAuditReport(null)}
          onApprove={(id, score, isBatch, manualIdentification, batchIds, scoreMap, identMap) => {
            onApproveAudit?.(
              id,
              score,
              isBatch,
              manualIdentification,
              batchIds,
              scoreMap,
              identMap
            );
            setDrawerAuditReport(null);
          }}
          onReject={(id, reason, detail) => {
            onRejectAudit?.(id, reason, detail);
            setDrawerAuditReport(null);
          }}
        />
      )}
    </div>
  );
};
