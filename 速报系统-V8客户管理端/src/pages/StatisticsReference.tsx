import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Clock,
  Download,
  TrendingUp,
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
import { DateRangeField } from '../components/DateRangeField';
import { OrgFilterSelect } from '../components/OrgFilterSelect';
import { getOrgFullPath, INITIAL_ORG_NODES } from '../data/userOrgShared';

interface StatisticsReferenceProps {
  onNavigate?: (page: PageId) => void;
}

type TimeRange = 'day' | 'week' | 'month' | 'custom';

type DonutItem = { name: string; value: number; color: string };

const reportTrendBase = [
  { label: '周一 (08-04)', total: 1280, passed: 1150, rejected: 85, directRate: 75.2, passRate: 89.8, score: 86.5, processRate: 96.2, closedRate: 92.4, avgTime: 14.8, audited: 1180 },
  { label: '周二 (08-05)', total: 1420, passed: 1280, rejected: 92, directRate: 76, passRate: 90.1, score: 87.2, processRate: 96.8, closedRate: 93.1, avgTime: 14.2, audited: 1310 },
  { label: '周三 (08-06)', total: 1650, passed: 1490, rejected: 110, directRate: 78.4, passRate: 90.3, score: 88.6, processRate: 97.4, closedRate: 94.0, avgTime: 13.5, audited: 1520 },
  { label: '周四 (08-07)', total: 1560, passed: 1410, rejected: 98, directRate: 77.8, passRate: 90.4, score: 88.2, processRate: 97.8, closedRate: 93.6, avgTime: 13.6, audited: 1440 },
  { label: '周五 (08-08)', total: 1820, passed: 1650, rejected: 125, directRate: 79.5, passRate: 90.7, score: 89.5, processRate: 98.5, closedRate: 95.2, avgTime: 12.9, audited: 1690 },
  { label: '周六 (08-09)', total: 1320, passed: 1180, rejected: 90, directRate: 76.5, passRate: 89.4, score: 87.8, processRate: 98.2, closedRate: 92.8, avgTime: 14.5, audited: 1210 },
  { label: '周日 (08-10)', total: 1430, passed: 1210, rejected: 180, directRate: 77.4, passRate: 89.4, score: 88.5, processRate: 98.8, closedRate: 94.5, avgTime: 13.8, audited: 1320 },
];

const reportDonutBase: DonutItem[] = [
  { name: '一次性通过', value: 8110, color: '#08B889' },
  { name: '返修通过', value: 1260, color: '#2C6BE0' },
  { name: '审核中', value: 280, color: '#0284C7' },
  { name: '待审核', value: 380, color: '#9BA9BB' },
  { name: '被驳回', value: 450, color: '#F04453' },
];

const auditDonutBase: DonutItem[] = [
  { name: '审核通过', value: 9240, color: '#08B889' },
  { name: '审核驳回', value: 620, color: '#F04453' },
  { name: '待审核', value: 120, color: '#9BA9BB' },
];

const scaleCount = (value: number, factor: number) => Math.max(1, Math.round(value * factor));

const chartColors = {
  blue: '#1B5BD6',
  green: '#08B889',
  red: '#F04453',
  purple: '#8656F4',
  teal: '#11A8A1',
  cyan: '#1BA9D4',
  amber: '#EA580C',
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
  data: DonutItem[];
  total: number;
  centerLabel: string;
  footer: Array<{ label: string; value: string; color: string }>;
}> = ({ title, iconColor, data, total, centerLabel, footer }) => (
  <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <div className="flex items-center gap-2">
        <PieChart className="h-4 w-4" style={{ color: iconColor }} />
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      </div>
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

    <div
      className={`grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 ${
        footer.length === 5 ? 'sm:grid-cols-5' : 'sm:grid-cols-4'
      }`}
    >
      {footer.map((item, index) => (
        <div
          key={item.label}
          className={`rounded-md bg-slate-50 px-2 py-2 text-center ${
            footer.length === 5 && index === 4 ? 'col-span-2 sm:col-span-1' : ''
          }`}
        >
          <div className="text-[10px] text-slate-400">{item.label}</div>
          <div className="mt-0.5 text-xs font-bold" style={{ color: item.color }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export const StatisticsReference: React.FC<StatisticsReferenceProps> = ({ onNavigate: _onNavigate }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [startDate, setStartDate] = useState('2026-08-04');
  const [endDate, setEndDate] = useState('2026-08-11');
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [reportLines, setReportLines] = useState({
    total: true,
    passed: true,
    rejected: true,
    directRate: true,
    passRate: true,
    processRate: true,
    closedRate: true,
    avgTime: true,
  });

  const scopeFactor = useMemo(() => (selectedOrg ? 0.28 : 1), [selectedOrg]);

  const reportTrend = useMemo(
    () =>
      reportTrendBase.map((row) => ({
        ...row,
        total: scaleCount(row.total, scopeFactor),
        passed: scaleCount(row.passed, scopeFactor),
        rejected: scaleCount(row.rejected, scopeFactor),
        audited: scaleCount(row.audited, scopeFactor),
      })),
    [scopeFactor],
  );

  const reportDonut = useMemo(
    () => reportDonutBase.map((item) => ({ ...item, value: scaleCount(item.value, scopeFactor) })),
    [scopeFactor],
  );

  const auditDonut = useMemo(
    () => auditDonutBase.map((item) => ({ ...item, value: scaleCount(item.value, scopeFactor) })),
    [scopeFactor],
  );

  const reportTotal = reportDonut.reduce((sum, item) => sum + item.value, 0);
  const auditTotal = auditDonut.reduce((sum, item) => sum + item.value, 0);

  const scopeBadge = selectedOrg
    ? getOrgFullPath(INITIAL_ORG_NODES, selectedOrg, ' / ') || '组织节点'
    : '全部组织节点';

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
    }
  };

  const resetFilters = () => {
    setTimeRange('week');
    setStartDate('2026-08-04');
    setEndDate('2026-08-11');
    setSelectedOrg(null);
  };

  const toggleLine = (key: keyof typeof reportLines) => {
    setReportLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
            <button
              type="button"
              onClick={() => showToast('统计报表已导出')}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white"
            >
              <Download className="h-3.5 w-3.5" />
              导出数据
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-[#E4EDF7] bg-[#F0F5FA] p-1 text-xs">
              <div className="flex items-center gap-1.5 pl-2.5 pr-1.5 text-slate-500">
                <Clock className="h-3.5 w-3.5 text-[#2F74FF] shrink-0" />
                <span className="font-normal text-slate-500">统计周期:</span>
              </div>
              {[
                ['day', '今日'],
                ['week', '本周'],
                ['month', '本月'],
                ['custom', '自定义'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => changeTimeRange(key as TimeRange)}
                  className={`min-h-7 cursor-pointer rounded-xl px-3 py-1 text-xs transition select-none ${
                    timeRange === key
                      ? 'bg-white font-semibold text-[#1B5BD6] shadow-xs'
                      : 'font-normal text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <DateRangeField
              startValue={startDate}
              endValue={endDate}
              readOnly={timeRange !== 'custom'}
              onRequestEdit={() => setTimeRange('custom')}
              onStartChange={(value) => {
                setStartDate(value);
                setTimeRange('custom');
              }}
              onEndChange={(value) => {
                setEndDate(value);
                setTimeRange('custom');
              }}
              title="统计时间区间"
              startTitle="开始日期"
              endTitle="结束日期"
              inputClassName="w-24 flex-none font-mono text-[11px]"
            />

            <OrgFilterSelect
              value={selectedOrg}
              onChange={setSelectedOrg}
              allLabel="全部组织节点"
              title="按组织树穿透筛选"
            />
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex min-h-8 cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-xs transition hover:text-slate-800"
            title="重置筛选"
          >
            重置
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
        <PanelTitle
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          title="指标趋势图"
          badge={scopeBadge}
        />

        <div className="flex flex-wrap gap-1.5 py-3">
          <ChartLegendButton label="上报量" color={chartColors.blue} active={reportLines.total} onClick={() => toggleLine('total')} />
          <ChartLegendButton label="有效采纳量" color={chartColors.green} active={reportLines.passed} onClick={() => toggleLine('passed')} />
          <ChartLegendButton label="驳回整改量" color={chartColors.red} active={reportLines.rejected} onClick={() => toggleLine('rejected')} />
          <ChartLegendButton label="首审直通率(%)" color={chartColors.purple} active={reportLines.directRate} onClick={() => toggleLine('directRate')} />
          <ChartLegendButton label="整体采纳率(%)" color={chartColors.teal} active={reportLines.passRate} onClick={() => toggleLine('passRate')} />
          <ChartLegendButton label="审核处理率(%)" color={chartColors.cyan} active={reportLines.processRate} onClick={() => toggleLine('processRate')} />
          <ChartLegendButton label="转办闭环率(%)" color={chartColors.amber} active={reportLines.closedRate} onClick={() => toggleLine('closedRate')} />
          <ChartLegendButton label="平均审核响应" color="#EC4899" active={reportLines.avgTime} onClick={() => toggleLine('avgTime')} />
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
                    : name.includes('耗时') || name.includes('响应')
                      ? `${value} 分钟`
                      : `${formatNumber(value)} 件`,
                  name,
                ]}
              />
              {reportLines.total && <Line yAxisId="count" type="monotone" dataKey="total" name="上报量" stroke={chartColors.blue} strokeWidth={2.2} dot={{ r: 3, fill: chartColors.blue }} />}
              {reportLines.passed && <Line yAxisId="count" type="monotone" dataKey="passed" name="有效采纳量" stroke={chartColors.green} strokeWidth={2.2} dot={{ r: 3, fill: chartColors.green }} />}
              {reportLines.rejected && <Line yAxisId="count" type="monotone" dataKey="rejected" name="驳回整改量" stroke={chartColors.red} strokeWidth={1.6} dot={{ r: 2, fill: chartColors.red }} />}
              {reportLines.directRate && <Line yAxisId="rate" type="monotone" dataKey="directRate" name="首审直通率" stroke={chartColors.purple} strokeDasharray="4 4" strokeWidth={1.6} dot={{ r: 2, fill: chartColors.purple }} />}
              {reportLines.passRate && <Line yAxisId="rate" type="monotone" dataKey="passRate" name="整体采纳率" stroke={chartColors.teal} strokeWidth={1.6} dot={{ r: 2, fill: chartColors.teal }} />}
              {reportLines.processRate && <Line yAxisId="rate" type="monotone" dataKey="processRate" name="审核处理率" stroke={chartColors.cyan} strokeDasharray="3 3" strokeWidth={1.6} dot={{ r: 2, fill: chartColors.cyan }} />}
              {reportLines.closedRate && <Line yAxisId="rate" type="monotone" dataKey="closedRate" name="转办闭环率" stroke={chartColors.amber} strokeDasharray="5 3" strokeWidth={1.6} dot={{ r: 2, fill: chartColors.amber }} />}
              {reportLines.avgTime && <Line yAxisId="time" type="monotone" dataKey="avgTime" name="平均审核响应" stroke="#EC4899" strokeWidth={1.6} dot={{ r: 2, fill: '#EC4899' }} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DonutPanel
          title="网格员报送统计"
          iconColor="#1D58C9"
          data={reportDonut}
          total={reportTotal}
          centerLabel="累计上报"
          footer={[
            { label: '整体采纳率', value: '89.4%', color: '#08B889' },
            { label: '首审直通率', value: '77.4%', color: '#1D58C9' },
            { label: '在册网格员', value: scopeFactor < 1 ? `${Math.max(8, Math.round(486 * scopeFactor))}人` : '486人', color: '#8656F4' },
            { label: '人均上报量', value: '21.6件', color: '#F5A400' },
          ]}
        />
        <DonutPanel
          title="审核员审核统计"
          iconColor="#08B889"
          data={auditDonut}
          total={auditTotal}
          centerLabel="累计审核"
          footer={[
            { label: '平均审核响应', value: '13.8分钟', color: '#08B889' },
            { label: '审核处理率', value: '98.8%', color: '#1D58C9' },
            { label: '在册审核员', value: scopeFactor < 1 ? `${Math.max(4, Math.round(168 * scopeFactor))}人` : '168人', color: '#8656F4' },
            { label: '人均负荷', value: '58.7件', color: '#F5A400' },
          ]}
        />
      </div>
    </div>
  );
};
