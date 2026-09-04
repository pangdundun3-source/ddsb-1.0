import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  Globe2,
  RefreshCw,
  TrendingUp,
  UserRound,
  UsersRound,
  Zap,
} from 'lucide-react';
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageId } from '../types';

interface StatisticsReferenceProps {
  onNavigate?: (page: PageId) => void;
}

type Scope = 'all' | 'mine';
type TimeRange = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

const reportTrend = [
  { label: '周一 (08-04)', total: 1280, passed: 1150, rejected: 85, directRate: 75.2, passRate: 89.8, score: 86.5, processRate: 96.2, avgTime: 14.8 },
  { label: '周二 (08-05)', total: 1420, passed: 1280, rejected: 92, directRate: 76, passRate: 90.1, score: 87.2, processRate: 96.8, avgTime: 14.2 },
  { label: '周三 (08-06)', total: 1650, passed: 1490, rejected: 110, directRate: 78.4, passRate: 90.3, score: 88.6, processRate: 97.4, avgTime: 13.5 },
  { label: '周四 (08-07)', total: 1560, passed: 1410, rejected: 98, directRate: 77.8, passRate: 90.4, score: 88.2, processRate: 97.8, avgTime: 13.6 },
  { label: '周五 (08-08)', total: 1820, passed: 1650, rejected: 125, directRate: 79.5, passRate: 90.7, score: 89.5, processRate: 98.5, avgTime: 12.9 },
  { label: '周六 (08-09)', total: 1320, passed: 1180, rejected: 90, directRate: 76.5, passRate: 89.4, score: 87.8, processRate: 98.2, avgTime: 14.5 },
  { label: '周日 (08-10)', total: 1430, passed: 1210, rejected: 180, directRate: 77.4, passRate: 89.4, score: 88.5, processRate: 98.8, avgTime: 13.8 },
];

const reporterTrend = [
  { label: '周一', total: 2, passed: 2, rejected: 0, directRate: 100, passRate: 100, score: 98 },
  { label: '周二', total: 4, passed: 3, rejected: 1, directRate: 76, passRate: 75, score: 95 },
  { label: '周三', total: 6, passed: 5, rejected: 1, directRate: 82, passRate: 83, score: 96 },
  { label: '周四', total: 8, passed: 7, rejected: 1, directRate: 88, passRate: 88, score: 97 },
  { label: '周五', total: 9, passed: 8, rejected: 1, directRate: 93, passRate: 89, score: 98 },
  { label: '周六', total: 10, passed: 9, rejected: 1, directRate: 97, passRate: 90, score: 98 },
  { label: '周日', total: 11, passed: 10, rejected: 2, directRate: 94, passRate: 91, score: 97 },
];

const auditorTrend = [
  { label: '周一', total: 11, passed: 10, rejected: 0, avgTime: 6.2, processRate: 96 },
  { label: '周二', total: 14, passed: 13, rejected: 0, avgTime: 6.5, processRate: 95 },
  { label: '周三', total: 16, passed: 15, rejected: 0, avgTime: 6.8, processRate: 94 },
  { label: '周四', total: 9, passed: 9, rejected: 0, avgTime: 6.7, processRate: 93 },
  { label: '周五', total: 18, passed: 16, rejected: 2, avgTime: 6.9, processRate: 92 },
  { label: '周六', total: 7, passed: 6, rejected: 0, avgTime: 6.6, processRate: 91 },
  { label: '周日', total: 10, passed: 9, rejected: 0, avgTime: 6.8, processRate: 90 },
];

const reportDonut = [
  { name: '一次性通过', value: 8110, color: '#08B889' },
  { name: '返修通过', value: 1260, color: '#2C6BE0' },
  { name: '待审核', value: 660, color: '#9BA9BB' },
  { name: '驳回', value: 450, color: '#F04453' },
];

const auditDonut = [
  { name: '审核通过', value: 9240, color: '#08B889' },
  { name: '审核驳回', value: 620, color: '#F04453' },
  { name: '待审核', value: 120, color: '#9BA9BB' },
];

const personalReportDonut = [
  { name: '一次性通过', value: 0, color: '#08B889' },
  { name: '返修通过', value: 1, color: '#2C6BE0' },
  { name: '待审核', value: 9, color: '#9BA9BB' },
  { name: '驳回', value: 1, color: '#F04453' },
];

const personalAuditDonut = [
  { name: '审核通过', value: 78, color: '#08B889' },
  { name: '审核驳回', value: 8, color: '#F04453' },
  { name: '待审核', value: 5, color: '#9BA9BB' },
];

const orgOptions = [
  '统计主体: 全平台所有机构 (28家)',
  '机构穿透: 中共台中市委宣传部',
  '机构穿透: 台中市网信办',
  '机构穿透: 西屯区网信办',
];

const chartColors = {
  blue: '#1B5BD6',
  green: '#08B889',
  red: '#F04453',
  purple: '#8656F4',
  teal: '#11A8A1',
  amber: '#F5A400',
  cyan: '#1BA9D4',
};

const formatNumber = (value: number) => value.toLocaleString('zh-CN');

const ChartLegendButton: React.FC<{
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, color, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex min-h-7 items-center gap-1.5 rounded-md border px-2 text-[11px] font-medium transition ${
      active
        ? 'border-slate-300 bg-white text-slate-700 shadow-sm'
        : 'border-slate-200 bg-slate-50 text-slate-400 line-through'
    }`}
  >
    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
    {label}
  </button>
);

const PanelTitle: React.FC<{
  icon: React.ReactNode;
  title: string;
  badge?: string;
  right?: React.ReactNode;
}> = ({ icon, title, badge, right }) => (
  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
        {icon}
      </span>
      <h2 className="truncate text-sm font-bold text-slate-900">{title}</h2>
      {badge && (
        <span className="shrink-0 rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
          {badge}
        </span>
      )}
    </div>
    {right}
  </div>
);

const DonutPanel: React.FC<{
  title: string;
  iconColor: string;
  data: typeof reportDonut;
  total: number;
  centerLabel: string;
  footer: Array<{ label: string; value: string; color: string }>;
  periodLabel: string;
}> = ({ title, iconColor, data, total, centerLabel, footer, periodLabel }) => (
  <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <div className="flex items-center gap-2">
        <PieChart className="h-4 w-4" style={{ color: iconColor }} />
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      </div>
      <span className="text-[10px] text-slate-400">统计时间范围 {periodLabel}</span>
    </div>

    <div className="flex min-h-[176px] items-center gap-4 py-3">
      <div className="relative h-32 w-32 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={39}
              outerRadius={58}
              paddingAngle={3}
              stroke="#fff"
              strokeWidth={2}
            >
              {data.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`${formatNumber(value)} 件`, '数量']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-400">{centerLabel}</span>
          <strong className="text-lg leading-5 text-slate-900">{formatNumber(total)}</strong>
          <span className="text-[10px] text-slate-400">件</span>
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-2 text-[11px]">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-1.5 text-slate-500">
              <i className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="truncate">{item.name}</span>
            </span>
            <strong className="shrink-0 font-mono text-slate-800">{formatNumber(item.value)} 件</strong>
          </div>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-4">
      {footer.map((item) => (
        <div key={item.label} className="rounded-md bg-slate-50 px-2 py-2 text-center">
          <div className="text-[10px] text-slate-400">{item.label}</div>
          <div className="mt-0.5 text-xs font-bold" style={{ color: item.color }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export const StatisticsReference: React.FC<StatisticsReferenceProps> = ({ onNavigate }) => {
  const [scope, setScope] = useState<Scope>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [startDate, setStartDate] = useState('2026-08-04');
  const [endDate, setEndDate] = useState('2026-08-11');
  const [selectedOrg, setSelectedOrg] = useState(orgOptions[0]);
  const [toast, setToast] = useState<string | null>(null);
  const [reportLines, setReportLines] = useState({
    total: true,
    passed: true,
    rejected: true,
    directRate: true,
    passRate: true,
    score: false,
    processRate: true,
    avgTime: true,
  });
  const [auditorLines, setAuditorLines] = useState({
    total: true,
    passed: true,
    rejected: true,
    avgTime: true,
    processRate: false,
  });

  const periodLabel = `${startDate.replaceAll('-', '/')} - ${endDate.replaceAll('-', '/')}`;
  const personal = scope === 'mine';

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const changeTimeRange = (next: TimeRange) => {
    setTimeRange(next);
    if (next === 'day') {
      setStartDate('2026-08-11');
      setEndDate('2026-08-11');
    } else if (next === 'week') {
      setStartDate('2026-08-04');
      setEndDate('2026-08-11');
    } else if (next === 'month') {
      setStartDate('2026-08-01');
      setEndDate('2026-08-31');
    } else if (next === 'quarter') {
      setStartDate('2026-07-01');
      setEndDate('2026-09-30');
    } else if (next === 'year') {
      setStartDate('2026-01-01');
      setEndDate('2026-12-31');
    }
  };

  const resetFilters = () => {
    setScope('all');
    setTimeRange('week');
    setStartDate('2026-08-04');
    setEndDate('2026-08-11');
    setSelectedOrg(orgOptions[0]);
  };

  const personalReportTotal = useMemo(
    () => personalReportDonut.reduce((sum, item) => sum + item.value, 0),
    [],
  );
  const personalAuditTotal = useMemo(
    () => personalAuditDonut.reduce((sum, item) => sum + item.value, 0),
    [],
  );

  return (
    <div className="relative min-w-0 space-y-4 pb-10 text-slate-700">
      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-5">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1D58C9] text-white">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-900">统计管理与效能分析</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => {
                  setScope('all');
                  setSelectedOrg(orgOptions[0]);
                }}
                className={`inline-flex min-h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold ${
                  scope === 'all' ? 'bg-[#1D58C9] text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                <Globe2 className="h-3.5 w-3.5" />
                全域
              </button>
              <button
                type="button"
                onClick={() => {
                  setScope('mine');
                  setSelectedOrg(orgOptions[0]);
                }}
                className={`inline-flex min-h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold ${
                  scope === 'mine' ? 'bg-[#1D58C9] text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                <UserRound className="h-3.5 w-3.5" />
                我的
              </button>
            </div>
            <button
              type="button"
              onClick={() => showToast('统计数据已刷新')}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600"
              title="刷新统计"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              刷新
            </button>
            <button
              type="button"
              onClick={() => showToast('统计报表已导出')}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white"
            >
              <Download className="h-3.5 w-3.5" />
              导出报表
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-50 p-0.5 text-[11px]">
            {[
              ['day', '日(今日)'],
              ['week', '周(本周)'],
              ['month', '月(本月)'],
              ['quarter', '季度'],
              ['year', '年度'],
              ['custom', '自定义'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => changeTimeRange(key as TimeRange)}
                className={`min-h-7 rounded-md px-2.5 font-medium ${
                  timeRange === key ? 'bg-[#1D58C9] text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex min-h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-500">
              <CalendarDays className="h-3.5 w-3.5 text-[#1D58C9]" />
              <input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setTimeRange('custom');
                }}
                className="w-[104px] bg-transparent font-mono text-[11px] outline-none"
              />
              <span>至</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setTimeRange('custom');
                }}
                className="w-[104px] bg-transparent font-mono text-[11px] outline-none"
              />
            </label>
            {personal ? (
              <span className="inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-2.5 text-[11px] font-semibold text-blue-800">
                <UsersRound className="h-3.5 w-3.5 shrink-0" />
                统计主体: 本人 (在册上报/审核)
              </span>
            ) : (
              <select
                value={selectedOrg}
                onChange={(event) => {
                  const next = event.target.value;
                  setSelectedOrg(next);
                  setScope(next === orgOptions[0] ? 'all' : 'mine');
                }}
                className="min-h-8 max-w-full rounded-lg border border-blue-200 bg-white px-2.5 text-[11px] font-semibold text-blue-800 outline-none"
              >
                {orgOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={resetFilters}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500"
              title="重置筛选"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {!personal ? (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { title: '全域累计报送', value: '10,480', unit: '件', note: '环比 +6.8%', sub: '采纳率 89.4%', icon: TrendingUp, color: '#1D58C9', tone: 'blue' },
              { title: '全域有效采纳', value: '9,370', unit: '件', note: '通过率 89.4%', sub: '驳回 780件', icon: FileCheck2, color: '#08B889', tone: 'green' },
              { title: '首审直通率', value: '77.4', unit: '%', note: '88.6%', sub: '直通标兵: 市委宣传部', icon: Zap, color: '#8656F4', tone: 'purple' },
              { title: '全域审核响应', value: '13.8', unit: '分钟', note: '6.8分', sub: '最快响应: 市委宣传部', icon: Clock3, color: '#F5A400', tone: 'amber' },
              { title: '综合考核均分', value: '88.5', unit: '分', note: '28家全评', sub: '达标率 100%', icon: CheckCircle2, color: '#5C6FE7', tone: 'indigo' },
            ].map((item) => {
              const Icon = item.icon;
              const backgrounds: Record<string, string> = {
                blue: 'from-blue-50/80',
                green: 'from-emerald-50/80',
                purple: 'from-purple-50/80',
                amber: 'from-amber-50/80',
                indigo: 'from-indigo-50/80',
              };
              return (
                <div
                  key={item.title}
                  className={`min-w-0 rounded-xl border border-slate-200 bg-gradient-to-br ${backgrounds[item.tone]} to-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5 truncate text-[11px] font-bold text-slate-600">
                      <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: item.color }} />
                      {item.title}
                    </span>
                    <span className="shrink-0 rounded bg-white/80 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                      {item.title === '全域累计报送' ? '28家' : item.title === '首审直通率' ? '质效高地' : item.title === '全域审核响应' ? '流转时效' : item.title === '综合考核均分' ? '全域考评' : '采纳率'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <strong className="font-mono text-xl tracking-tight" style={{ color: item.title === '全域累计报送' ? '#0f172a' : item.color }}>
                      {item.value}
                    </strong>
                    <span className="text-[10px] text-slate-400">{item.unit}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 border-t border-white/80 pt-1.5 text-[10px]">
                    <span className="truncate text-slate-500">{item.sub}</span>
                    <strong className="shrink-0" style={{ color: item.color }}>{item.note}</strong>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
            <PanelTitle
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              title="全域机构指标趋势图"
              badge="全域 28 家机构全量走势"
              right={<span className="text-[10px] text-slate-400">数据更新于 2026/08/11 09:00</span>}
            />
            <div className="flex flex-wrap gap-1.5 py-3">
              <ChartLegendButton label="全域上报量" color={chartColors.blue} active={reportLines.total} onClick={() => setReportLines((prev) => ({ ...prev, total: !prev.total }))} />
              <ChartLegendButton label="有效采纳量" color={chartColors.green} active={reportLines.passed} onClick={() => setReportLines((prev) => ({ ...prev, passed: !prev.passed }))} />
              <ChartLegendButton label="驳回整改量" color={chartColors.red} active={reportLines.rejected} onClick={() => setReportLines((prev) => ({ ...prev, rejected: !prev.rejected }))} />
              <ChartLegendButton label="首审直通率(%)" color={chartColors.purple} active={reportLines.directRate} onClick={() => setReportLines((prev) => ({ ...prev, directRate: !prev.directRate }))} />
              <ChartLegendButton label="整体采纳率(%)" color={chartColors.teal} active={reportLines.passRate} onClick={() => setReportLines((prev) => ({ ...prev, passRate: !prev.passRate }))} />
              <ChartLegendButton label="综合考核均分" color={chartColors.amber} active={reportLines.score} onClick={() => setReportLines((prev) => ({ ...prev, score: !prev.score }))} />
              <ChartLegendButton label="审核处理率(%)" color={chartColors.cyan} active={reportLines.processRate} onClick={() => setReportLines((prev) => ({ ...prev, processRate: !prev.processRate }))} />
              <ChartLegendButton label="审核响应平均耗时(分钟)" color="#EC4899" active={reportLines.avgTime} onClick={() => setReportLines((prev) => ({ ...prev, avgTime: !prev.avgTime }))} />
            </div>
            <div className="h-[270px] w-full sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportTrend} margin={{ top: 8, right: 18, left: -12, bottom: 6 }}>
                  <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="count" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} unit="件" />
                  <YAxis yAxisId="rate" orientation="right" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} unit="%" />
                  <YAxis yAxisId="time" orientation="right" domain={[0, 30]} tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} unit="分" hide />
                  <Tooltip
                    contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11 }}
                    formatter={(value: number, name: string) => [
                      name.includes('率') || name.includes('均分')
                        ? `${value}%`
                        : name.includes('耗时')
                          ? `${value} 分钟`
                          : `${formatNumber(value)} 件`,
                      name,
                    ]}
                  />
                  {reportLines.total && <Line yAxisId="count" type="monotone" dataKey="total" name="全域上报量" stroke={chartColors.blue} strokeWidth={2.2} dot={{ r: 3, fill: chartColors.blue }} />}
                  {reportLines.passed && <Line yAxisId="count" type="monotone" dataKey="passed" name="有效采纳量" stroke={chartColors.green} strokeWidth={2.2} dot={{ r: 3, fill: chartColors.green }} />}
                  {reportLines.rejected && <Line yAxisId="count" type="monotone" dataKey="rejected" name="驳回整改量" stroke={chartColors.red} strokeWidth={1.6} dot={{ r: 2, fill: chartColors.red }} />}
                  {reportLines.directRate && <Line yAxisId="rate" type="monotone" dataKey="directRate" name="首审直通率" stroke={chartColors.purple} strokeDasharray="4 4" strokeWidth={1.6} dot={{ r: 2, fill: chartColors.purple }} />}
                  {reportLines.passRate && <Line yAxisId="rate" type="monotone" dataKey="passRate" name="整体采纳率" stroke={chartColors.teal} strokeWidth={1.6} dot={{ r: 2, fill: chartColors.teal }} />}
                  {reportLines.score && <Line yAxisId="rate" type="monotone" dataKey="score" name="综合考核均分" stroke={chartColors.amber} strokeDasharray="3 3" strokeWidth={1.6} dot={{ r: 2, fill: chartColors.amber }} />}
                  {reportLines.processRate && <Line yAxisId="rate" type="monotone" dataKey="processRate" name="审核处理率" stroke={chartColors.cyan} strokeDasharray="3 3" strokeWidth={1.6} dot={{ r: 2, fill: chartColors.cyan }} />}
                  {reportLines.avgTime && <Line yAxisId="time" type="monotone" dataKey="avgTime" name="审核响应平均耗时" stroke="#EC4899" strokeWidth={1.6} dot={{ r: 2, fill: '#EC4899' }} />}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DonutPanel
              title="全域上报员报送统计"
              iconColor="#1D58C9"
              data={reportDonut}
              total={10480}
              centerLabel="累计上报"
              periodLabel={periodLabel}
              footer={[
                { label: '整体通过率', value: '89.4%', color: '#08B889' },
                { label: '一次性通过率', value: '77.4%', color: '#1D58C9' },
                { label: '在册上报员', value: '486人', color: '#8656F4' },
                { label: '人均上报量', value: '21.6件', color: '#F5A400' },
              ]}
            />
            <DonutPanel
              title="全域审核员审核统计"
              iconColor="#08B889"
              data={auditDonut}
              total={9860}
              centerLabel="累计审核"
              periodLabel={periodLabel}
              footer={[
                { label: '平均耗时', value: '13.8分', color: '#08B889' },
                { label: '审核处理率', value: '98.8%', color: '#1D58C9' },
                { label: '在册审核员', value: '168人', color: '#8656F4' },
                { label: '人均负荷', value: '58.7件', color: '#F5A400' },
              ]}
            />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
            <TrendPanel
              title="上报员趋势图"
              badge="统计主体: 本人在此机构上报"
              icon={<FileText className="h-3.5 w-3.5" />}
              lines={reportLines}
              data={reporterTrend}
              type="reporter"
              onToggle={(key) => setReportLines((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
            />
            <DonutPanel
              title="上报员报送统计"
              iconColor="#1D58C9"
              data={personalReportDonut}
              total={personalReportTotal}
              centerLabel="累计上报"
              periodLabel={periodLabel}
              footer={[
                { label: '整体通过率', value: '90.9%', color: '#08B889' },
                { label: '一次性通过率', value: '81.8%', color: '#1D58C9' },
                { label: '综合总分', value: '1,020.8分', color: '#8656F4' },
                { label: '平均得分', value: '92.8分', color: '#F5A400' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
            <TrendPanel
              title="审核员趋势图"
              badge="统计主体: 本人在此机构审核"
              icon={<UsersRound className="h-3.5 w-3.5" />}
              lines={auditorLines}
              data={auditorTrend}
              type="auditor"
              onToggle={(key) => setAuditorLines((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
            />
            <DonutPanel
              title="审核员审核统计"
              iconColor="#08B889"
              data={personalAuditDonut}
              total={personalAuditTotal}
              centerLabel="累计审核"
              periodLabel={periodLabel}
              footer={[
                { label: '平均审核响应时间', value: '6.8分钟', color: '#08B889' },
                { label: '审核处理率', value: '94.5%', color: '#1D58C9' },
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
};

const TrendPanel: React.FC<{
  title: string;
  badge: string;
  icon: React.ReactNode;
  type: 'reporter' | 'auditor';
  data: Array<Record<string, number | string>>;
  lines: Record<string, boolean>;
  onToggle: (key: string) => void;
}> = ({ title, badge, icon, type, data, lines, onToggle }) => {
  const isReporter = type === 'reporter';
  const legend = isReporter
    ? [
        ['total', '上报总量', chartColors.blue],
        ['passed', '通过量', chartColors.green],
        ['rejected', '驳回量', chartColors.red],
        ['directRate', '一次性通过率', chartColors.purple],
        ['passRate', '整体通过率', chartColors.teal],
        ['score', '综合得分', chartColors.amber],
      ]
    : [
        ['total', '审核总量', chartColors.green],
        ['passed', '通过量', chartColors.blue],
        ['rejected', '驳回量', chartColors.red],
        ['avgTime', '平均时长', chartColors.purple],
        ['processRate', '审核处理率', chartColors.cyan],
      ];

  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
      <PanelTitle icon={icon} title={title} badge={badge} right={<span className="text-[10px] text-blue-600">统计范围: 本机构</span>} />
      <div className="flex flex-wrap gap-1.5 py-3">
        {legend.map(([key, label, color]) => (
          <ChartLegendButton key={key} label={label} color={color} active={Boolean(lines[key])} onClick={() => onToggle(key)} />
        ))}
      </div>
      <div className="h-[230px] w-full sm:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 14, left: -12, bottom: 4 }}>
            <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="count" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="rate" orientation="right" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip
              contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11 }}
              formatter={(value: number, name: string) => [
                name.includes('率') || name.includes('得分') || name.includes('时长') ? `${value}${name.includes('时长') ? ' 分钟' : '%'}` : `${value} 件`,
                name,
              ]}
            />
            {lines.total && <Line yAxisId="count" type="monotone" dataKey="total" name={isReporter ? '上报总量' : '审核总量'} stroke={isReporter ? chartColors.blue : chartColors.green} strokeWidth={2} dot={{ r: 2.5 }} />}
            {lines.passed && <Line yAxisId="count" type="monotone" dataKey="passed" name="通过量" stroke={isReporter ? chartColors.green : chartColors.blue} strokeWidth={2} dot={{ r: 2.5 }} />}
            {lines.rejected && <Line yAxisId="count" type="monotone" dataKey="rejected" name="驳回量" stroke={chartColors.red} strokeWidth={1.5} dot={{ r: 2 }} />}
            {isReporter && lines.directRate && <Line yAxisId="rate" type="monotone" dataKey="directRate" name="一次性通过率" stroke={chartColors.purple} strokeDasharray="4 4" strokeWidth={1.5} dot={{ r: 2 }} />}
            {isReporter && lines.passRate && <Line yAxisId="rate" type="monotone" dataKey="passRate" name="整体通过率" stroke={chartColors.teal} strokeWidth={1.5} dot={{ r: 2 }} />}
            {isReporter && lines.score && <Line yAxisId="rate" type="monotone" dataKey="score" name="综合得分" stroke={chartColors.amber} strokeDasharray="3 3" strokeWidth={1.5} dot={{ r: 2 }} />}
            {!isReporter && lines.avgTime && <Line yAxisId="rate" type="monotone" dataKey="avgTime" name="平均时长" stroke={chartColors.purple} strokeDasharray="4 4" strokeWidth={1.5} dot={{ r: 2 }} />}
            {!isReporter && lines.processRate && <Line yAxisId="rate" type="monotone" dataKey="processRate" name="审核处理率" stroke={chartColors.cyan} strokeDasharray="3 3" strokeWidth={1.5} dot={{ r: 2 }} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
