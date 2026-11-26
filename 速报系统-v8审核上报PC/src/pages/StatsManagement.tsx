import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Clock,
  Download,
  FileText,
  PieChart as PieChartIcon,
  RefreshCw,
  RotateCcw,
  Search,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DateRangeField } from '../components/DateRangeField';
import { OrgTreeFilterPanel } from '../components/OrgTreeFilterPanel';
import {
  buildTrendSeries,
  chartColors,
  formatTrendNumber,
  type StatsPeriod,
} from '../utils/statsTrend';
import type { AuditRecordItem, ReportItem } from '../types';
import { getOrgById, getOrgSubtreeIds, INITIAL_ORG_NODES } from '../data/externalOrgTree';
import { HOME_ORG_ID } from '../data/userOrgShared';

type RangePreset = 'd7' | 'd30' | 'd90' | 'custom';

interface StatsManagementProps {
  reports: ReportItem[];
  auditRecords?: AuditRecordItem[];
  currentOrgName: string;
}

const STATS_MAX_DATE = '2026-11-09';

const shiftDateKey = (dateKey: string, days: number) => {
  const base = new Date(`${dateKey.replace(/-/g, '/')} 00:00:00`);
  if (Number.isNaN(base.getTime())) return dateKey;
  base.setDate(base.getDate() + days);
  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, '0');
  const d = String(base.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const PRESET_RANGES: Record<Exclude<RangePreset, 'custom'>, { start: string; end: string }> = {
  d7: { start: shiftDateKey(STATS_MAX_DATE, -6), end: STATS_MAX_DATE },
  d30: { start: shiftDateKey(STATS_MAX_DATE, -29), end: STATS_MAX_DATE },
  d90: { start: shiftDateKey(STATS_MAX_DATE, -89), end: STATS_MAX_DATE },
};

const formatStatsClock = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
};

type FilterDraft = {
  rangePreset: RangePreset;
  period: StatsPeriod;
  startDate: string;
  endDate: string;
  orgNodeId: string | null;
};

const PERIOD_DEFAULTS: Record<StatsPeriod, { start: string; end: string }> = {
  day: PRESET_RANGES.d7,
  week: { start: '2026-09-28', end: '2026-11-09' },
  month: { start: '2026-05-01', end: '2026-11-09' },
  quarter: { start: '2026-01-01', end: '2026-11-09' },
  year: { start: '2024-01-01', end: '2026-11-09' },
};

const PERIOD_MAX_POINTS: Record<StatsPeriod, number> = {
  day: 90,
  week: 52,
  month: 36,
  quarter: 16,
  year: 10,
};

const TREND_TOOLTIP_ORDER = [
  '累计报送量',
  '累计采纳量',
  '驳回整改量',
  '首审直通率',
  '整体采纳率',
  '审核处理率',
  '平均审核耗时',
] as const;

/** 本机构统计管理演示基准（对齐客户管理端统计参考页口径） */
const BASE = {
  totalSubmit: 10480,
  adopted: 9370,
  auditing: 280,
  pending: 380,
  rejected: 450,
  overallAdoptRate: 87.1,
  firstPassRate: 76.3,
  reporters: 486,
  auditTotal: 9980,
  auditPassed: 9240,
  auditRejected: 620,
  auditTodo: 120,
  avgAuditMinutes: 13.5,
  auditProcessRate: 96.2,
  auditors: 168,
};

const scaleByNode = (orgId: string | null) => {
  if (!orgId) return 1;
  const node = getOrgById(INITIAL_ORG_NODES, orgId);
  if (!node) return 0.42;
  let depth = 0;
  let cur: typeof node | undefined = node;
  while (cur?.parentId) {
    depth += 1;
    cur = getOrgById(INITIAL_ORG_NODES, cur.parentId);
  }
  return Math.max(0.18, 1 - depth * 0.22);
};

const ChartLegendButton: React.FC<{
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, color, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex min-h-7 cursor-pointer items-center gap-1.5 rounded-md border px-2 text-[11px] font-medium transition ${
      active
        ? 'border-slate-300 bg-white text-slate-700 shadow-sm'
        : 'border-slate-200 bg-slate-50 text-slate-400 line-through'
    }`}
  >
    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
    {label}
  </button>
);

const DonutPanel: React.FC<{
  title: string;
  iconColor: string;
  data: Array<{ name: string; value: number; color: string }>;
  total: number;
  centerLabel: string;
  unit?: '件' | '次';
  footer: Array<{ label: string; value: string; color: string }>;
}> = ({ title, iconColor, data, total, centerLabel, unit = '件', footer }) => (
  <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <div className="flex items-center gap-2">
        <PieChartIcon className="h-4 w-4" style={{ color: iconColor }} />
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
            <Tooltip
              formatter={(value: number) => [
                `${formatTrendNumber(value)} ${unit}`,
                unit === '次' ? '审核动作' : '数量',
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-400">{centerLabel}</span>
          <strong className="text-lg leading-5 text-slate-900">{formatTrendNumber(total)}</strong>
          <span className="text-[10px] text-slate-400">{unit}</span>
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-2 text-[11px]">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-1.5 text-slate-500">
              <i className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="truncate">{item.name}</span>
            </span>
            <strong className="shrink-0 font-mono text-slate-800">
              {formatTrendNumber(item.value)} {unit}
            </strong>
          </div>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-4">
      {footer.map((item) => (
        <div key={item.label} className="rounded-md bg-slate-50 px-2 py-2 text-center">
          <div className="text-[10px] text-slate-500">{item.label}</div>
          <div className="mt-0.5 text-xs font-black font-mono" style={{ color: item.color }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export const StatsManagement: React.FC<StatsManagementProps> = ({
  reports,
  auditRecords = [],
  currentOrgName,
}) => {
  /** 标题仍为「台中市网信办」；树内仅保留当前用户所属「西坝区环保局」及其子节点 */
  const homeOrg = useMemo(() => {
    return (
      INITIAL_ORG_NODES.find((node) => node.id === HOME_ORG_ID) ||
      INITIAL_ORG_NODES.find((node) => node.name === '西坝区环保局') ||
      INITIAL_ORG_NODES.find((node) => node.name === currentOrgName) ||
      INITIAL_ORG_NODES[0]
    );
  }, [currentOrgName]);

  const headerOrgName = '台中市网信办';

  const scopedOrgNodes = useMemo(() => {
    const scopeIds = new Set(getOrgSubtreeIds(INITIAL_ORG_NODES, homeOrg.id));
    return INITIAL_ORG_NODES.filter((node) => scopeIds.has(node.id)).map((node) =>
      node.id === homeOrg.id ? { ...node, parentId: null } : { ...node }
    );
  }, [homeOrg]);

  const initialFilter: FilterDraft = {
    rangePreset: 'd7',
    period: 'day',
    startDate: PRESET_RANGES.d7.start,
    endDate: PRESET_RANGES.d7.end,
    orgNodeId: null,
  };
  const [draft, setDraft] = useState<FilterDraft>(initialFilter);
  const [applied, setApplied] = useState<FilterDraft>(initialFilter);
  const [customFieldKey, setCustomFieldKey] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [statsUpdatedAt, setStatsUpdatedAt] = useState(() => formatStatsClock());
  const [refreshingStats, setRefreshingStats] = useState(false);
  const [reportLines, setReportLines] = useState({
    total: true,
    passed: true,
    rejected: true,
    directRate: true,
    passRate: true,
    processRate: true,
    avgTime: true,
  });

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  /** 切换登录机构后，清空不在当前所属范围内的组织筛选 */
  useEffect(() => {
    const scopeIds = new Set(scopedOrgNodes.map((node) => node.id));
    setDraft((prev) =>
      prev.orgNodeId && !scopeIds.has(prev.orgNodeId) ? { ...prev, orgNodeId: null } : prev
    );
    setApplied((prev) =>
      prev.orgNodeId && !scopeIds.has(prev.orgNodeId) ? { ...prev, orgNodeId: null } : prev
    );
  }, [scopedOrgNodes]);

  const showToast = (text: string) => setToast(text);

  const handleRangePresetChange = (preset: RangePreset) => {
    if (preset !== 'custom') {
      setDraft((prev) => ({
        ...prev,
        rangePreset: preset,
        period: 'day',
        startDate: PRESET_RANGES[preset].start,
        endDate: PRESET_RANGES[preset].end,
      }));
    } else {
      setDraft((prev) => ({ ...prev, rangePreset: 'custom' }));
      setCustomFieldKey((k) => k + 1);
    }
  };

  const handleCustomModeChange = (mode: 'range' | 'week' | 'month' | 'quarter' | 'year') => {
    const nextPeriod: StatsPeriod = mode === 'range' ? 'day' : mode;
    const defaults = PERIOD_DEFAULTS[nextPeriod];
    setDraft((prev) => ({
      ...prev,
      rangePreset: 'custom',
      period: nextPeriod,
      startDate: defaults.start,
      endDate: defaults.end,
    }));
  };

  const applyFilters = (message: string) => {
    setApplied({ ...draft });
    setStatsUpdatedAt(formatStatsClock());
    showToast(message);
  };

  const handleQuery = () => applyFilters('查询完成，统计结果已更新');

  const handleReset = () => {
    setDraft(initialFilter);
    setApplied(initialFilter);
    setCustomFieldKey((k) => k + 1);
    setStatsUpdatedAt(formatStatsClock());
    showToast('已重置筛选条件');
  };

  const handleRefreshStats = () => {
    setRefreshingStats(true);
    window.setTimeout(() => {
      setApplied({ ...draft });
      setStatsUpdatedAt(formatStatsClock());
      setRefreshingStats(false);
      showToast('统计数据已刷新');
    }, 450);
  };

  const toggleLine = (key: keyof typeof reportLines) => {
    setReportLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const factor = scaleByNode(applied.orgNodeId || homeOrg.id);

  const liveBoost = useMemo(() => {
    const scopeRootId = applied.orgNodeId || homeOrg.id;
    const orgReports = reports.filter((r) => {
      const ids = getOrgSubtreeIds(INITIAL_ORG_NODES, scopeRootId);
      const node = getOrgById(INITIAL_ORG_NODES, scopeRootId);
      const names = ids
        .map((id) => getOrgById(INITIAL_ORG_NODES, id)?.name || '')
        .concat(node?.name || '');
      return names.some((n) => n && (r.organization.includes(n) || n.includes(r.organization)));
    });
    return {
      reportCount: orgReports.length,
      adopted: orgReports.filter((r) => r.auditStatus === '已通过' || r.auditStatus === '已采纳').length,
      pending: orgReports.filter((r) => r.auditStatus === '待审核').length,
      auditing: orgReports.filter((r) => r.auditStatus === '审核中').length,
      rejected: orgReports.filter((r) => r.auditStatus === '已驳回' || r.auditStatus === '被驳回').length,
      auditCount: auditRecords.length,
    };
  }, [reports, auditRecords, applied.orgNodeId, homeOrg.id]);

  const stats = useMemo(() => {
    const totalSubmit = Math.max(Math.round(BASE.totalSubmit * factor), liveBoost.reportCount || 1);
    const adopted = Math.max(Math.round(BASE.adopted * factor), liveBoost.adopted);
    const auditing = Math.max(Math.round(BASE.auditing * factor), liveBoost.auditing);
    const pending = Math.max(Math.round(BASE.pending * factor), liveBoost.pending);
    const rejected = Math.max(Math.round(BASE.rejected * factor), liveBoost.rejected);
    const reporters = Math.max(Math.round(BASE.reporters * factor), 1);
    const auditors = Math.max(Math.round(BASE.auditors * factor), 1);
    const auditTotal = Math.max(Math.round(BASE.auditTotal * factor), liveBoost.auditCount || 1);
    const auditPassed = Math.max(Math.round(BASE.auditPassed * factor), 1);
    const auditRejected = Math.max(Math.round(BASE.auditRejected * factor), 0);
    const auditTodo = Math.max(Math.round(BASE.auditTodo * factor), 0);
    return {
      totalSubmit,
      adopted,
      auditing,
      pending,
      rejected,
      overallAdoptRate: BASE.overallAdoptRate,
      firstPassRate: BASE.firstPassRate,
      reporters,
      perCapitaSubmit: Number((totalSubmit / reporters).toFixed(1)),
      auditTotal,
      auditPassed,
      auditRejected,
      auditTodo,
      avgAuditMinutes: BASE.avgAuditMinutes,
      auditProcessRate: BASE.auditProcessRate,
      auditors,
      perCapitaLoad: Number((auditTotal / auditors).toFixed(1)),
    };
  }, [factor, liveBoost]);

  const trendData = useMemo(() => {
    const rows = buildTrendSeries(
      applied.startDate,
      applied.endDate,
      applied.period,
      PRESET_RANGES.d7
    );
    return rows.map((row) => ({
      ...row,
      total: Math.max(1, Math.round(row.total * factor)),
      passed: Math.max(0, Math.round(row.passed * factor)),
      rejected: Math.max(0, Math.round(row.rejected * factor)),
    }));
  }, [applied.startDate, applied.endDate, applied.period, factor]);

  const customModeDefaultRanges = useMemo(
    () => ({
      range: PERIOD_DEFAULTS.day,
      week: PERIOD_DEFAULTS.week,
      month: PERIOD_DEFAULTS.month,
      quarter: PERIOD_DEFAULTS.quarter,
      year: PERIOD_DEFAULTS.year,
    }),
    []
  );

  const submitDist = [
    { name: '累计采纳量', value: stats.adopted, color: '#08B889' },
    { name: '审核中', value: stats.auditing, color: '#3B82F6' },
    { name: '待审核', value: stats.pending, color: '#94A3B8' },
    { name: '被驳回', value: stats.rejected, color: '#F04453' },
  ];

  const auditDist = [
    { name: '通过处理', value: stats.auditPassed, color: '#08B889' },
    { name: '驳回处理', value: stats.auditRejected, color: '#F04453' },
    { name: '待办处理', value: stats.auditTodo, color: '#94A3B8' },
  ];

  return (
    <div className="relative space-y-4 animate-in fade-in duration-200 pb-10">
      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-5">
        {/* 标题区 */}
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1D58C9] text-white">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-900">统计效能分析</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 tabular-nums">
              <span>统计更新</span>
              <span>{statsUpdatedAt}</span>
              <button
                type="button"
                onClick={handleRefreshStats}
                title="刷新统计数据"
                aria-label="刷新统计数据"
                className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-slate-400 transition hover:text-[#2F74FF] disabled:cursor-wait"
                disabled={refreshingStats}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshingStats ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => showToast('已导出统计效能分析 PDF（演示）')}
              className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-[#1D58C9] px-3 text-xs font-semibold text-white"
            >
              <FileText className="h-3.5 w-3.5" />
              导出PDF
            </button>
            <button
              type="button"
              onClick={() => showToast('已成功导出【统计效能分析报表.xlsx】！')}
              className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white"
            >
              <Download className="h-3.5 w-3.5" />
              导出数据
            </button>
          </div>
        </div>

        {/* 筛选条 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-[#E4EDF7] bg-[#F0F5FA] p-1">
              <div className="flex items-center gap-1.5 pl-2.5 pr-1.5 text-slate-500">
                <Clock className="h-3.5 w-3.5 shrink-0 text-[#2F74FF]" />
                <span className="font-normal text-slate-500">统计周期:</span>
              </div>
              {(
                [
                  ['d7', '近7日'],
                  ['d30', '近30日'],
                  ['d90', '近90日'],
                  ['custom', '自定义'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleRangePresetChange(key)}
                  className={`min-h-7 cursor-pointer rounded-xl px-3 py-1 text-xs transition select-none ${
                    draft.rangePreset === key
                      ? 'bg-white font-semibold text-[#1B5BD6] shadow-xs'
                      : 'font-normal text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {draft.rangePreset === 'custom' ? (
              <DateRangeField
                key={customFieldKey}
                startValue={draft.startDate}
                endValue={draft.endDate}
                unitRangeSelect
                maxDate={STATS_MAX_DATE}
                maxUnitSpan={PERIOD_MAX_POINTS[draft.period]}
                onStartChange={(value) => {
                  setDraft((prev) => ({ ...prev, startDate: value, rangePreset: 'custom' }));
                }}
                onEndChange={(value) => {
                  setDraft((prev) => ({ ...prev, endDate: value, rangePreset: 'custom' }));
                }}
                onModeChange={handleCustomModeChange}
                modeDefaultRanges={customModeDefaultRanges}
                activeMode={draft.period === 'day' ? 'range' : draft.period}
                rangeModeLabel="按日"
                title="自定义统计周期"
                className="min-w-[320px]"
              />
            ) : (
              <span className="inline-flex min-h-8 items-center rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs text-slate-600 tabular-nums">
                {draft.startDate.replaceAll('-', '/')} ~ {draft.endDate.replaceAll('-', '/')}
              </span>
            )}

          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleQuery}
              className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-[#1E5ABB] px-3.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#134092]"
              title="按当前条件查询"
            >
              <Search className="h-3.5 w-3.5" />
              查询
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-xs transition hover:text-slate-800"
              title="重置筛选"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              重置
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
      <OrgTreeFilterPanel
        value={draft.orgNodeId}
        onChange={(orgId) => setDraft((prev) => ({ ...prev, orgNodeId: orgId }))}
        orgNodes={scopedOrgNodes}
        rootOrgName={headerOrgName}
        className="xl:self-stretch"
      />
      <div className="min-w-0 flex-1 space-y-4">
      {/* 指标趋势图 */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
              <TrendingUp className="h-3.5 w-3.5" />
            </span>
            <h2 className="truncate text-sm font-bold text-slate-900">指标趋势图</h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 py-3">
          <ChartLegendButton
            label="累计报送量"
            color={chartColors.blue}
            active={reportLines.total}
            onClick={() => toggleLine('total')}
          />
          <ChartLegendButton
            label="累计采纳量"
            color={chartColors.green}
            active={reportLines.passed}
            onClick={() => toggleLine('passed')}
          />
          <ChartLegendButton
            label="驳回整改量"
            color={chartColors.red}
            active={reportLines.rejected}
            onClick={() => toggleLine('rejected')}
          />
          <ChartLegendButton
            label="首审直通率(%)"
            color={chartColors.purple}
            active={reportLines.directRate}
            onClick={() => toggleLine('directRate')}
          />
          <ChartLegendButton
            label="整体采纳率(%)"
            color={chartColors.teal}
            active={reportLines.passRate}
            onClick={() => toggleLine('passRate')}
          />
          <ChartLegendButton
            label="审核处理率(%)"
            color={chartColors.cyan}
            active={reportLines.processRate}
            onClick={() => toggleLine('processRate')}
          />
          <ChartLegendButton
            label="平均审核耗时"
            color="#EC4899"
            active={reportLines.avgTime}
            onClick={() => toggleLine('avgTime')}
          />
        </div>

        <div className="h-[270px] w-full sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%" debounce={80}>
            <ComposedChart data={trendData} margin={{ top: 8, right: 18, left: -12, bottom: 4 }}>
              <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="count"
                tick={{ fill: '#64748b', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                unit="件"
              />
              <YAxis
                yAxisId="rate"
                orientation="right"
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <YAxis
                yAxisId="time"
                orientation="right"
                domain={[0, 30]}
                tick={{ fill: '#64748b', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                unit="分"
                hide
              />
              <Tooltip
                contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11 }}
                wrapperStyle={{ outline: 'none', zIndex: 20 }}
                itemSorter={(item) => {
                  const idx = TREND_TOOLTIP_ORDER.indexOf(
                    String(item.name) as (typeof TREND_TOOLTIP_ORDER)[number]
                  );
                  return idx === -1 ? TREND_TOOLTIP_ORDER.length : idx;
                }}
                formatter={(value: number, name: string) => [
                  name.includes('率')
                    ? `${value}%`
                    : name.includes('耗时')
                      ? `${value} 分钟`
                      : `${formatTrendNumber(value)} 件`,
                  name,
                ]}
              />
              {reportLines.total && (
                <Bar
                  yAxisId="count"
                  dataKey="total"
                  name="累计报送量"
                  fill={chartColors.blue}
                  barSize={14}
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={false}
                />
              )}
              {reportLines.passed && (
                <Bar
                  yAxisId="count"
                  dataKey="passed"
                  name="累计采纳量"
                  fill={chartColors.green}
                  barSize={14}
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={false}
                />
              )}
              {reportLines.rejected && (
                <Bar
                  yAxisId="count"
                  dataKey="rejected"
                  name="驳回整改量"
                  fill={chartColors.red}
                  barSize={14}
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={false}
                />
              )}
              {reportLines.directRate && (
                <Line
                  yAxisId="rate"
                  type="monotone"
                  dataKey="directRate"
                  name="首审直通率"
                  stroke={chartColors.purple}
                  strokeDasharray="4 4"
                  strokeWidth={1.6}
                  dot={{ r: 2, fill: chartColors.purple }}
                  isAnimationActive={false}
                />
              )}
              {reportLines.passRate && (
                <Line
                  yAxisId="rate"
                  type="monotone"
                  dataKey="passRate"
                  name="整体采纳率"
                  stroke={chartColors.teal}
                  strokeWidth={1.6}
                  dot={{ r: 2, fill: chartColors.teal }}
                  isAnimationActive={false}
                />
              )}
              {reportLines.processRate && (
                <Line
                  yAxisId="rate"
                  type="monotone"
                  dataKey="processRate"
                  name="审核处理率"
                  stroke={chartColors.cyan}
                  strokeDasharray="3 3"
                  strokeWidth={1.6}
                  dot={{ r: 2, fill: chartColors.cyan }}
                  isAnimationActive={false}
                />
              )}
              {reportLines.avgTime && (
                <Line
                  yAxisId="time"
                  type="monotone"
                  dataKey="avgTime"
                  name="平均审核耗时"
                  stroke="#EC4899"
                  strokeWidth={1.6}
                  dot={{ r: 2, fill: '#EC4899' }}
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 报送统计 | 审核统计 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DonutPanel
          title="报送统计"
          iconColor="#1D58C9"
          data={submitDist}
          total={stats.totalSubmit}
          centerLabel="累计上报"
          footer={[
            { label: '整体采纳率', value: `${stats.overallAdoptRate}%`, color: '#08B889' },
            { label: '首审直通率', value: `${stats.firstPassRate}%`, color: '#1D58C9' },
            { label: '报送人员', value: `${stats.reporters}人`, color: '#8656F4' },
            { label: '人均累计报送量', value: `${stats.perCapitaSubmit}件`, color: '#F5A400' },
          ]}
        />
        <DonutPanel
          title="审核统计"
          iconColor="#08B889"
          data={auditDist}
          total={stats.auditTotal}
          centerLabel="累计处理"
          unit="次"
          footer={[
            { label: '平均审核耗时', value: `${stats.avgAuditMinutes}分钟`, color: '#08B889' },
            { label: '审核处理率', value: `${stats.auditProcessRate}%`, color: '#1D58C9' },
            { label: '审核人员', value: `${stats.auditors}人`, color: '#8656F4' },
            { label: '人均负荷', value: `${stats.perCapitaLoad}次`, color: '#F5A400' },
          ]}
        />
      </div>
      </div>
      </div>
    </div>
  );
};
