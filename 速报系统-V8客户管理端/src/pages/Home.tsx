import React, { useState, useMemo } from 'react';
import { PageId, ReportItem, OrgItem } from '../types';
import { IdentificationBadge } from '../components/IdentificationBadge';
import { resolveIdentification } from '../services/identificationService';
import { Building2, ChevronRight, RotateCcw, ArrowUpDown, Inbox } from 'lucide-react';
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
  onNavigate: (page: PageId) => void;
  onSelectReport: (report: ReportItem) => void;
  onSelectAudit: (report: ReportItem) => void;
  currentUser?: string;
  currentOrg?: string;
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
  pending: '待审核量',
  submitted: '今日上报',
  avgTime: '平均耗时'
} as const;
type SortKey = keyof typeof SORT_OPTIONS;

const TODO_LIMIT = 6;

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
  onSelectAudit,
  currentUser = '张三',
  currentOrg = '台中市网信办'
}) => {
  const [currentTime, setCurrentTime] = useState('2026-09-04 17:25');
  const [sortKey, setSortKey] = useState<SortKey>('pending');

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
    if (sortKey === 'pending') list.sort((a, b) => b.pendingAudit - a.pendingAudit);
    if (sortKey === 'submitted') list.sort((a, b) => b.todaySubmitted - a.todaySubmitted);
    if (sortKey === 'avgTime') list.sort((a, b) => b.avgMinutes - a.avgMinutes);
    return list;
  }, [sortKey]);

  const sortKeys = Object.keys(SORT_OPTIONS) as SortKey[];
  const nextSortKey = sortKeys[(sortKeys.indexOf(sortKey) + 1) % sortKeys.length];

  const totals = bottomChartData.reduce(
    (acc, d) => ({ submitted: acc.submitted + d.submitted, passed: acc.passed + d.passed }),
    { submitted: 0, passed: 0 }
  );
  const avgPassRate = bottomChartData.reduce((sum, d) => sum + d.passRate, 0) / bottomChartData.length;
  const avgDirectRate = bottomChartData.reduce((sum, d) => sum + d.directRate, 0) / bottomChartData.length;

  const handleQuickAudit = (report: ReportItem) => {
    onSelectAudit(report);
    onNavigate('audit-detail');
  };

  const displayName = currentUser.replace(/\s*\(.*\)$/, '');
  const hour = Number(currentTime.slice(11, 13));

  const stats: { label: string; value: number; unit: string; tone: string; page: PageId }[] = [
    { label: '待审核', value: pendingAudits.length, unit: '件', tone: 'text-[#1E5ABB]', page: 'report-audit' },
    { label: '驳回待重报', value: rejectedCount, unit: '件', tone: 'text-amber-600', page: 'report-records' },
    { label: '已采纳待转办', value: toTransferCount, unit: '件', tone: 'text-violet-600', page: 'negative-info' },
    { label: '今日上报', value: todaySubmitted, unit: '件', tone: 'text-slate-900', page: 'statistics' }
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      <section className="bg-white rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div>
            <h1 className="text-base font-bold text-slate-900">
              {getGreeting(hour)}，{displayName}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{currentOrg} · 全域速报运行概况</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 tabular-nums">
            <span>数据更新于 {currentTime}</span>
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
          {stats.map((s) => (
            <button
              key={s.label}
              onClick={() => onNavigate(s.page)}
              className="group text-left px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span className="flex items-center justify-between text-xs text-slate-500">
                {s.label}
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#1E5ABB] transition-colors" />
              </span>
              <span className="mt-1.5 block">
                <span className={`text-2xl font-bold tabular-nums ${s.tone}`}>{s.value}</span>
                <span className="ml-1 text-xs text-slate-400">{s.unit}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
      <Card
        className="xl:col-span-5 flex flex-col"
        title={
          <>
            待审核
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
            暂无待审核速报
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pendingAudits.slice(0, TODO_LIMIT).map((item) => {
              const ident = resolveIdentification(item, reports);
              return (
                <li key={item.id}>
                  <div
                    onClick={() => handleQuickAudit(item)}
                    className="group flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[13px] font-semibold text-slate-900 truncate group-hover:text-[#1E5ABB]">
                          {item.title}
                        </span>
                        <IdentificationBadge status={ident.status} size="xs" showIcon />
                      </div>
                      <p className="mt-1 text-xs text-slate-500 truncate">
                        {item.organization} · {item.author}
                        <span className="text-slate-400 tabular-nums"> · 提交于 {(item.submitTime || '').slice(5, 16)}</span>
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAudit(item);
                      }}
                      className="shrink-0 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-[#1E5ABB] hover:bg-[#1E5ABB] hover:text-white hover:border-[#1E5ABB] transition-colors cursor-pointer"
                    >
                      去审核
                    </button>
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
            还有 {pendingAudits.length - TODO_LIMIT} 条待审核，去审核管理处理
          </button>
        )}
      </Card>

      <Card
        className="xl:col-span-7 flex flex-col min-w-0"
        title={
          <>
            子机构运行矩阵
            <span className="text-xs font-normal text-slate-400">{subOrgMatrixData.length} 个机构</span>
          </>
        }
        extra={
          <button
            onClick={() => setSortKey(nextSortKey)}
            className="text-xs text-slate-600 hover:text-[#1E5ABB] flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-[#1E5ABB]/40 cursor-pointer"
            title={`切换为按${SORT_OPTIONS[nextSortKey]}排序`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            按{SORT_OPTIONS[sortKey]}排序
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 border-b border-slate-100 whitespace-nowrap">
              <tr>
                <th className="py-2.5 px-5 font-medium">机构名称</th>
                <th className="py-2.5 px-2.5 font-medium text-right">今日上报</th>
                <th className="py-2.5 px-2.5 font-medium text-right">待审核</th>
                <th className="py-2.5 px-2.5 font-medium text-right">驳回待重报</th>
                <th className="py-2.5 px-2.5 font-medium text-right">上报员活跃</th>
                <th className="py-2.5 px-2.5 font-medium text-right">审核员活跃</th>
                <th className="py-2.5 px-5 font-medium text-right">平均审核耗时</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 tabular-nums">
              {sortedOrgs.map((org) => (
                <tr key={org.name} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-5">
                    <span className="flex items-center gap-2 font-medium text-slate-900 whitespace-nowrap">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {org.name}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 text-right">{org.todaySubmitted}</td>
                  <td className={`py-2.5 px-2.5 text-right ${org.pendingAudit >= PENDING_ALERT ? 'text-rose-600 font-semibold' : ''}`}>
                    {org.pendingAudit}
                  </td>
                  <td className="py-2.5 px-2.5 text-right">{org.rejectedResend}</td>
                  <td className="py-2.5 px-2.5 text-right">{org.reporterActive}</td>
                  <td className="py-2.5 px-2.5 text-right">{org.auditorActive}</td>
                  <td
                    className={`py-2.5 px-5 text-right whitespace-nowrap ${
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
        <p className="mt-auto px-5 py-2.5 border-t border-slate-100 text-[11px] text-slate-400">
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
    </div>
  );
};
