import React, { useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  Clock,
  Download,
  FileText,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { jsPDF } from 'jspdf';
import { PageId } from '../types';
import { DateRangeField } from '../components/DateRangeField';
import { OrgFilterSelect } from '../components/OrgFilterSelect';
import { getOrgById, INITIAL_ORG_NODES } from '../data/userOrgShared';

interface StatisticsReferenceProps {
  onNavigate?: (page: PageId) => void;
}

type Period = 'day' | 'week' | 'month' | 'quarter' | 'year';

type DonutItem = { name: string; value: number; color: string };

const STATS_MAX_DATE = '2026-11-09';

/** 各周期默认区间：按日近7日、按周近7周、按月近7月、按季近4季、按年近3年 */
const PERIOD_DEFAULTS: Record<Period, { start: string; end: string }> = {
  day: { start: '2026-11-03', end: '2026-11-09' }, // 近 7 日
  week: { start: '2026-09-28', end: '2026-11-09' }, // 近 7 周（周一起点）
  month: { start: '2026-05-01', end: '2026-11-09' }, // 近 7 个月
  quarter: { start: '2026-01-01', end: '2026-11-09' }, // 近 4 个季度
  year: { start: '2024-01-01', end: '2026-11-09' }, // 近 3 年
};

/** 统计控件可选区间硬上限（按统计单位点数） */
const PERIOD_MAX_POINTS: Record<Period, number> = {
  day: 90,
  week: 52,
  month: 36,
  quarter: 16,
  year: 10,
};

/** 与图例按钮顺序一致，供 Tooltip 条目排序 */
const TREND_TOOLTIP_ORDER = [
  '累计报送量',
  '累计采纳量',
  '驳回整改量',
  '首审直通率',
  '整体采纳率',
  '审核处理率',
  '转办闭环率',
  '平均审核耗时',
] as const;

type TrendRow = {
  label: string;
  total: number;
  passed: number;
  rejected: number;
  directRate: number;
  passRate: number;
  score: number;
  processRate: number;
  closedRate: number;
  avgTime: number;
  audited: number;
};

const WEEKDAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const parseDateInput = (value: string) => {
  const normalized = value.replaceAll('/', '-');
  const [y, m, d] = normalized.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

const formatMd = (date: Date) =>
  `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const dayDiffInclusive = (start: Date, end: Date) => {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.round(ms / 86400000) + 1);
};

const seeded = (n: number) => {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const round1 = (n: number) => Math.round(n * 10) / 10;

const startOfWeekMon = (date: Date) => {
  const start = new Date(date);
  const day = start.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + offset);
  start.setHours(0, 0, 0, 0);
  return start;
};

/** ISO 周序号（周一为一周起始，与日期控件一致） */
const getISOWeek = (date: Date) => {
  const tmp = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNum = tmp.getDay() || 7;
  tmp.setDate(tmp.getDate() + 4 - dayNum);
  const yearStart = new Date(tmp.getFullYear(), 0, 1);
  return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

const quarterOf = (date: Date) => Math.floor(date.getMonth() / 3) + 1;

/** 按统计单位（日/周/月/季/年）生成趋势点 */
const buildTrendSeries = (startValue: string, endValue: string, grain: Period): TrendRow[] => {
  const start = parseDateInput(startValue);
  const end = parseDateInput(endValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return buildTrendSeries(PERIOD_DEFAULTS.day.start, PERIOD_DEFAULTS.day.end, 'day');
  }

  const buckets: Array<{ label: string; seed: number; spanDays: number }> = [];

  if (grain === 'day') {
    const days = dayDiffInclusive(start, end);
    for (let i = 0; i < days; i += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      buckets.push({
        label: `${WEEKDAY_LABELS[date.getDay()]} (${formatMd(date)})`,
        seed: date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate(),
        spanDays: 1,
      });
    }
  } else if (grain === 'week') {
    let cursor = startOfWeekMon(start);
    while (cursor <= end) {
      const weekEnd = new Date(cursor);
      weekEnd.setDate(cursor.getDate() + 6);
      const actualStart = cursor < start ? start : cursor;
      const actualEnd = weekEnd > end ? end : weekEnd;
      const weekNo = getISOWeek(cursor);
      buckets.push({
        label: `第${weekNo}周 (${formatMd(actualStart)}~${formatMd(actualEnd)})`,
        seed: cursor.getFullYear() * 10000 + (cursor.getMonth() + 1) * 100 + cursor.getDate() + weekNo * 17,
        spanDays: dayDiffInclusive(actualStart, actualEnd),
      });
      cursor = new Date(weekEnd);
      cursor.setDate(cursor.getDate() + 1);
    }
  } else if (grain === 'month') {
    let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= end) {
      const monthStart = cursor < start ? start : cursor;
      const monthEndCandidate = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      const monthEnd = monthEndCandidate > end ? end : monthEndCandidate;
      buckets.push({
        label: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`,
        seed: cursor.getFullYear() * 100 + (cursor.getMonth() + 1),
        spanDays: dayDiffInclusive(monthStart, monthEnd),
      });
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
  } else if (grain === 'quarter') {
    let cursor = new Date(start.getFullYear(), Math.floor(start.getMonth() / 3) * 3, 1);
    while (cursor <= end) {
      const q = quarterOf(cursor);
      const qStart = cursor < start ? start : cursor;
      const qEndCandidate = new Date(cursor.getFullYear(), cursor.getMonth() + 3, 0);
      const qEnd = qEndCandidate > end ? end : qEndCandidate;
      buckets.push({
        label: `${cursor.getFullYear()} Q${q}`,
        seed: cursor.getFullYear() * 10 + q,
        spanDays: dayDiffInclusive(qStart, qEnd),
      });
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 3, 1);
    }
  } else {
    let year = start.getFullYear();
    while (year <= end.getFullYear()) {
      const yStart = year === start.getFullYear() ? start : new Date(year, 0, 1);
      const yEndCandidate = new Date(year, 11, 31);
      const yEnd = yEndCandidate > end ? end : yEndCandidate;
      buckets.push({
        label: `${year}年`,
        seed: year,
        spanDays: dayDiffInclusive(yStart, yEnd),
      });
      year += 1;
    }
  }

  return buckets.map((bucket, index) => {
    const r = seeded(bucket.seed);
    const dailyBase = 1380 + Math.round(r * 420) + (index % 3) * 40;
    const total = Math.max(20, Math.round(dailyBase * bucket.spanDays * (0.92 + r * 0.16)));
    const directRate = round1(74 + r * 6 + (index % 4) * 0.4);
    const passRate = round1(Math.min(99, directRate + 10 + r * 3));
    const processRate = round1(95 + r * 4);
    const closedRate = round1(91 + r * 6);
    const rejected = Math.max(1, Math.round(total * (0.05 + r * 0.04)));
    const passed = Math.max(1, Math.round((total * passRate) / 100));
    const audited = Math.max(passed, Math.round(total * (0.9 + r * 0.08)));
    return {
      label: bucket.label,
      total,
      passed,
      rejected,
      directRate,
      passRate,
      score: round1(86 + r * 6),
      processRate,
      closedRate,
      avgTime: round1(12.5 + r * 3.5),
      audited,
    };
  });
};

/**
 * 趋势图各统计单位「一屏不滚动」最大容纳点数；超出后横向滚动。
 * PDF 导出时按同一上限切片分页。
 * 按日 14｜按周 8｜按月 12｜按季度 8｜按年 6
 */
const TREND_VISIBLE_BY_PERIOD: Record<Period, number> = {
  day: 14,
  week: 8,
  month: 12,
  quarter: 8,
  year: 6,
};

const chunkTrendRows = <T,>(rows: T[], size: number): T[][] => {
  if (size <= 0 || rows.length === 0) return [rows];
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += size) {
    chunks.push(rows.slice(i, i + size));
  }
  return chunks;
};

/** 超出可视上限时，每个横轴点占用宽度（用于算出可滚动总宽） */
const TREND_POINT_WIDTH_BY_PERIOD: Record<Period, number> = {
  day: 88,
  week: 120,
  month: 96,
  quarter: 110,
  year: 100,
};

/** 近 7 日量级基准（与按日默认一致），用于按周期天数放大环图 */
const DONUT_BASE_DAYS = 7;
const reportDonutBase: DonutItem[] = [
  { name: '累计采纳量', value: 9370, color: '#08B889' },
  { name: '审核中', value: 280, color: '#0284C7' },
  { name: '待审核', value: 380, color: '#9BA9BB' },
  { name: '被驳回', value: 450, color: '#F04453' },
];

/** 审核员环图按「审核动作」计次（一件上报多人处理可重复计数） */
const auditDonutBase: DonutItem[] = [
  { name: '通过处理', value: 9240, color: '#08B889' },
  { name: '驳回处理', value: 620, color: '#F04453' },
  { name: '待办处理', value: 120, color: '#9BA9BB' },
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

const escapeCsvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

const formatExportDate = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
};

const PDF_FONT = '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif';

type TrendLineFlags = {
  total: boolean;
  passed: boolean;
  rejected: boolean;
  directRate: boolean;
  passRate: boolean;
  processRate: boolean;
  closedRate: boolean;
  avgTime: boolean;
};

/** 按数据段直接绘制趋势图，PDF 分页不依赖页面 Recharts 重绘 */
const drawTrendChartCanvas = (
  rows: TrendRow[],
  lines: TrendLineFlags,
  width = 960,
  height = 320,
) => {
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建画布');
  ctx.scale(scale, scale);

  const pad = { top: 18, right: 48, bottom: 52, left: 52 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  if (rows.length === 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = `400 12px ${PDF_FONT}`;
    ctx.fillText('暂无数据', pad.left, pad.top + 20);
    return canvas;
  }

  const maxCount = Math.max(
    1,
    ...rows.map((row) => Math.max(row.total, row.passed, row.rejected)),
  );
  const countTop = Math.ceil(maxCount * 1.15);
  const xStep = plotW / Math.max(rows.length, 1);
  const barGroup = Math.min(28, xStep * 0.7);
  const barW = Math.max(3, barGroup / 3 - 1);

  const yCount = (value: number) => pad.top + plotH - (value / countTop) * plotH;
  const yRate = (value: number) => pad.top + plotH - (Math.min(100, Math.max(0, value)) / 100) * plotH;
  const yTime = (value: number) => pad.top + plotH - (Math.min(30, Math.max(0, value)) / 30) * plotH;
  const xAt = (index: number) => pad.left + xStep * index + xStep / 2;

  ctx.strokeStyle = '#eef2f7';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + (plotH * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + plotW, y);
    ctx.stroke();
  }

  rows.forEach((row, index) => {
    const cx = xAt(index);
    const bars = [
      lines.total ? { value: row.total, color: chartColors.blue, offset: -barW - 1 } : null,
      lines.passed ? { value: row.passed, color: chartColors.green, offset: 0 } : null,
      lines.rejected ? { value: row.rejected, color: chartColors.red, offset: barW + 1 } : null,
    ].filter(Boolean) as Array<{ value: number; color: string; offset: number }>;
    bars.forEach((bar) => {
      const top = yCount(bar.value);
      const h = Math.max(1, pad.top + plotH - top);
      ctx.fillStyle = bar.color;
      ctx.fillRect(cx + bar.offset - barW / 2, top, barW, h);
    });
  });

  const drawLine = (
    getter: (row: TrendRow) => number,
    color: string,
    dashed: number[] | null,
    yMapper: (v: number) => number,
  ) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.setLineDash(dashed || []);
    rows.forEach((row, index) => {
      const x = xAt(index);
      const y = yMapper(getter(row));
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
    rows.forEach((row, index) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(xAt(index), yMapper(getter(row)), 2, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  if (lines.directRate) drawLine((r) => r.directRate, chartColors.purple, [4, 4], yRate);
  if (lines.passRate) drawLine((r) => r.passRate, chartColors.teal, null, yRate);
  if (lines.processRate) drawLine((r) => r.processRate, chartColors.cyan, [3, 3], yRate);
  if (lines.closedRate) drawLine((r) => r.closedRate, chartColors.amber, [5, 3], yRate);
  if (lines.avgTime) drawLine((r) => r.avgTime, '#EC4899', null, yTime);

  ctx.fillStyle = '#64748b';
  ctx.font = `400 10px ${PDF_FONT}`;
  ctx.textAlign = 'center';
  rows.forEach((row, index) => {
    const label = row.label.length > 12 ? `${row.label.slice(0, 11)}…` : row.label;
    ctx.save();
    ctx.translate(xAt(index), pad.top + plotH + 14);
    if (rows.length > 8) {
      ctx.rotate((-28 * Math.PI) / 180);
      ctx.textAlign = 'right';
      ctx.fillText(label, 0, 0);
    } else {
      ctx.fillText(label, 0, 0);
    }
    ctx.restore();
  });

  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i += 1) {
    const value = Math.round((countTop * (4 - i)) / 4);
    ctx.fillText(`${value}`, pad.left - 8, pad.top + (plotH * i) / 4 + 3);
  }
  ctx.textAlign = 'left';
  for (let i = 0; i <= 4; i += 1) {
    const value = Math.round((100 * (4 - i)) / 4);
    ctx.fillText(`${value}%`, pad.left + plotW + 8, pad.top + (plotH * i) / 4 + 3);
  }

  return canvas;
};

const drawPdfTextBlock = (
  lines: Array<{ text: string; size?: number; color?: string; weight?: string }>,
  width: number,
  padding = 16,
  lineHeight = 22,
) => {
  const canvas = document.createElement('canvas');
  const scale = 2;
  const height = padding * 2 + lines.length * lineHeight;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建画布');
  ctx.scale(scale, scale);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  lines.forEach((line, index) => {
    ctx.fillStyle = line.color || '#0f172a';
    ctx.font = `${line.weight || '600'} ${line.size || 13}px ${PDF_FONT}`;
    ctx.fillText(line.text, padding, padding + Math.min(14, lineHeight - 4) + index * lineHeight);
  });
  return canvas;
};

/** 彩色字段图例（默认单行，节省纵向空间） */
const drawPdfColorLegend = (
  items: Array<{ label: string; color: string }>,
  width: number,
) => {
  const scale = 2;
  const paddingX = 8;
  const paddingY = 4;
  const rowH = 18;
  // 优先单行排布，首页可再塞下第二段趋势图
  const cols = Math.min(Math.max(items.length, 1), items.length <= 8 ? items.length : 4);
  const rows = Math.ceil(Math.max(items.length, 1) / cols);
  const height = paddingY * 2 + rows * rowH;
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建画布');
  ctx.scale(scale, scale);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  const colW = (width - paddingX * 2) / cols;
  items.forEach((item, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = paddingX + col * colW;
    const y = paddingY + row * rowH + 10;
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(x + 4, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#334155';
    ctx.font = `500 10px ${PDF_FONT}`;
    const labelMax = colW - 16;
    let label = item.label;
    while (label.length > 1 && ctx.measureText(label).width > labelMax) {
      label = `${label.slice(0, -2)}…`;
    }
    ctx.fillText(label, x + 12, y + 3);
  });
  return canvas;
};

/** 估算 canvas 写入 PDF 后的点高度 */
const estimatePdfImageHeight = (
  source: HTMLCanvasElement,
  pageW: number,
  margin: number,
) => {
  const usableW = pageW - margin * 2;
  const cssWidth = source.width / 2;
  const imgW = Math.min(usableW, Math.max(120, cssWidth));
  return (source.height * imgW) / source.width;
};

const TREND_TABLE_TITLE_H = 28;
const TREND_TABLE_HEADER_H = 26;
const TREND_TABLE_ROW_H = 22;
const TREND_TABLE_PAD_BOTTOM = 12;

/** 趋势图数据标注表：行=统计点，列=当前勾选指标 */
const drawTrendDataTableCanvas = (
  rows: TrendRow[],
  lines: TrendLineFlags,
  title: string,
  width = 960,
) => {
  const columns = [
    { key: 'label', header: '时间', align: 'left' as const, get: (row: TrendRow) => row.label, active: true },
    {
      key: 'total',
      header: '累计报送量(件)',
      align: 'right' as const,
      get: (row: TrendRow) => formatNumber(row.total),
      active: lines.total,
    },
    {
      key: 'passed',
      header: '累计采纳量(件)',
      align: 'right' as const,
      get: (row: TrendRow) => formatNumber(row.passed),
      active: lines.passed,
    },
    {
      key: 'rejected',
      header: '驳回整改量(件)',
      align: 'right' as const,
      get: (row: TrendRow) => formatNumber(row.rejected),
      active: lines.rejected,
    },
    {
      key: 'directRate',
      header: '首审直通率(%)',
      align: 'right' as const,
      get: (row: TrendRow) => `${row.directRate}`,
      active: lines.directRate,
    },
    {
      key: 'passRate',
      header: '整体采纳率(%)',
      align: 'right' as const,
      get: (row: TrendRow) => `${row.passRate}`,
      active: lines.passRate,
    },
    {
      key: 'processRate',
      header: '审核处理率(%)',
      align: 'right' as const,
      get: (row: TrendRow) => `${row.processRate}`,
      active: lines.processRate,
    },
    {
      key: 'closedRate',
      header: '转办闭环率(%)',
      align: 'right' as const,
      get: (row: TrendRow) => `${row.closedRate}`,
      active: lines.closedRate,
    },
    {
      key: 'avgTime',
      header: '平均审核耗时(分)',
      align: 'right' as const,
      get: (row: TrendRow) => `${row.avgTime}`,
      active: lines.avgTime,
    },
  ].filter((col) => col.active);

  const scale = 2;
  const paddingX = 12;
  const titleH = TREND_TABLE_TITLE_H;
  const rowH = TREND_TABLE_ROW_H;
  const headerH = TREND_TABLE_HEADER_H;
  const height = titleH + headerH + Math.max(rows.length, 1) * rowH + TREND_TABLE_PAD_BOTTOM;
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建画布');
  ctx.scale(scale, scale);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#0f172a';
  ctx.font = `700 12px ${PDF_FONT}`;
  ctx.textAlign = 'left';
  ctx.fillText(title, paddingX, 18);

  const tableTop = titleH;
  const tableW = width - paddingX * 2;
  const labelColW = Math.min(220, Math.max(120, tableW * 0.22));
  const metricCount = Math.max(columns.length - 1, 1);
  const metricColW = (tableW - labelColW) / metricCount;
  const colWidths = columns.map((col, index) => (index === 0 ? labelColW : metricColW));

  const colLeft = (index: number) => {
    let x = paddingX;
    for (let i = 0; i < index; i += 1) x += colWidths[i];
    return x;
  };

  // header
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(paddingX, tableTop, tableW, headerH);
  ctx.strokeStyle = '#e2e8f0';
  ctx.strokeRect(paddingX + 0.5, tableTop + 0.5, tableW - 1, headerH - 1);
  ctx.fillStyle = '#334155';
  ctx.font = `700 9px ${PDF_FONT}`;
  columns.forEach((col, index) => {
    const x = colLeft(index);
    const y = tableTop + 17;
    if (col.align === 'right') {
      ctx.textAlign = 'right';
      ctx.fillText(col.header, x + colWidths[index] - 6, y);
    } else {
      ctx.textAlign = 'left';
      ctx.fillText(col.header, x + 6, y);
    }
  });

  if (rows.length === 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = `400 10px ${PDF_FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText('暂无数据', paddingX + 6, tableTop + headerH + 16);
    return canvas;
  }

  rows.forEach((row, rowIndex) => {
    const y0 = tableTop + headerH + rowIndex * rowH;
    if (rowIndex % 2 === 1) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(paddingX, y0, tableW, rowH);
    }
    ctx.strokeStyle = '#eef2f7';
    ctx.beginPath();
    ctx.moveTo(paddingX, y0 + rowH);
    ctx.lineTo(paddingX + tableW, y0 + rowH);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = `400 9px ${PDF_FONT}`;
    columns.forEach((col, index) => {
      const text = col.get(row);
      const x = colLeft(index);
      const y = y0 + 15;
      if (col.align === 'right') {
        ctx.textAlign = 'right';
        ctx.fillText(text, x + colWidths[index] - 6, y);
      } else {
        ctx.textAlign = 'left';
        const maxW = colWidths[index] - 12;
        let draw = text;
        while (draw.length > 1 && ctx.measureText(draw).width > maxW) {
          draw = `${draw.slice(0, -2)}…`;
        }
        ctx.fillText(draw, x + 6, y);
      }
    });
  });

  ctx.strokeStyle = '#e2e8f0';
  ctx.strokeRect(paddingX + 0.5, tableTop + 0.5, tableW - 1, headerH + rows.length * rowH - 1);

  return canvas;
};

const trendTableChromeH = () =>
  TREND_TABLE_TITLE_H + TREND_TABLE_HEADER_H + TREND_TABLE_PAD_BOTTOM;

const maxTrendTableRowsForHeight = (maxCssHeight: number) =>
  Math.max(0, Math.floor((maxCssHeight - trendTableChromeH()) / TREND_TABLE_ROW_H));

/** 按整行分页生成数据标注表；可指定首页最大高度，方便接在末段趋势图后面 */
const buildTrendDataTableCanvases = (
  rows: TrendRow[],
  lines: TrendLineFlags,
  width: number,
  maxCssHeight: number,
  firstPageMaxCssHeight?: number,
) => {
  if (rows.length === 0) {
    return [drawTrendDataTableCanvas([], lines, '数据标注', width)];
  }

  const fullRowsPerPage = Math.max(1, maxTrendTableRowsForHeight(maxCssHeight));
  const firstBudget = firstPageMaxCssHeight ?? maxCssHeight;
  const firstRows = Math.min(rows.length, maxTrendTableRowsForHeight(firstBudget));

  const slices: TrendRow[][] = [];
  let offset = 0;
  if (firstRows > 0) {
    slices.push(rows.slice(0, firstRows));
    offset = firstRows;
  }
  while (offset < rows.length) {
    slices.push(rows.slice(offset, offset + fullRowsPerPage));
    offset += fullRowsPerPage;
  }
  // 首页空间不够塞任何行时，整表从下一页满页开始
  if (slices.length === 0) {
    for (let start = 0; start < rows.length; start += fullRowsPerPage) {
      slices.push(rows.slice(start, start + fullRowsPerPage));
    }
  }

  return slices.map((slice, index) => {
    const title =
      slices.length > 1 ? `数据标注（第 ${index + 1}/${slices.length} 页）` : '数据标注';
    return drawTrendDataTableCanvas(slice, lines, title, width);
  });
};

/** 纵向拼接多块 canvas（按 CSS 像素高度） */
const stackCanvases = (parts: HTMLCanvasElement[], width: number, gap = 8) => {
  const scale = 2;
  const cssHeights = parts.map((part) => part.height / scale);
  const totalH = cssHeights.reduce((sum, h) => sum + h, 0) + gap * Math.max(parts.length - 1, 0);
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = Math.max(1, totalH) * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建画布');
  ctx.scale(scale, scale);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);
  let y = 0;
  parts.forEach((part, index) => {
    ctx.drawImage(part, 0, 0, part.width, part.height, 0, y, width, cssHeights[index]);
    y += cssHeights[index] + (index < parts.length - 1 ? gap : 0);
  });
  return canvas;
};

/** 整块写入 PDF：放不下就整页换页，禁止像素级横切（避免表格行被切断） */
const appendCanvasWholeToPdf = (
  pdf: InstanceType<typeof jsPDF>,
  source: HTMLCanvasElement,
  margin: number,
  startY: number,
  opts?: { forceNewPage?: boolean },
) => {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const usableW = pageW - margin * 2;
  const cssWidth = source.width / 2;
  const imgW = Math.min(usableW, Math.max(120, cssWidth));
  const imgH = (source.height * imgW) / source.width;
  let cursorY = startY;

  if (opts?.forceNewPage || (cursorY > margin && cursorY + imgH > pageH - margin)) {
    pdf.addPage();
    cursorY = margin;
  }

  // 单块高度超过一页时才按页切片，但按整块高度缩放适应一页（保内容完整）
  const maxH = pageH - margin * 2;
  const drawH = Math.min(imgH, maxH);
  const drawW = imgH > maxH ? (imgW * maxH) / imgH : imgW;
  pdf.addImage(source.toDataURL('image/jpeg', 0.92), 'JPEG', margin, cursorY, drawW, drawH);
  return cursorY + drawH + 10;
};

const drawDonutRing = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  data: DonutItem[],
) => {
  const sum = data.reduce((acc, item) => acc + item.value, 0) || 1;
  let angle = -Math.PI / 2;
  data.forEach((item) => {
    const slice = (item.value / sum) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
    ctx.arc(cx, cy, outerR, angle, angle + slice);
    ctx.arc(cx, cy, innerR, angle + slice, angle, true);
    ctx.closePath();
    ctx.fillStyle = item.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    angle += slice;
  });
};

/** 用数据重绘完整环图面板，避免只导出 128px SVG 被拉伸后花屏 */
const composeDonutPanelCanvas = (options: {
  title: string;
  data: DonutItem[];
  total: number;
  centerLabel: string;
  unit: string;
  footer: Array<{ label: string; value: string; color: string }>;
  width?: number;
}) => {
  const width = options.width ?? 470;
  const scale = 2;
  const padding = 16;
  const pieSize = 120;
  const legendTop = 48;
  const footerTop = legendTop + Math.max(pieSize, options.data.length * 22) + 18;
  const footerRows = Math.ceil(options.footer.length / 2);
  const height = footerTop + footerRows * 44 + padding;
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建画布');
  ctx.scale(scale, scale);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

  ctx.fillStyle = '#0f172a';
  ctx.font = `700 14px ${PDF_FONT}`;
  ctx.fillText(options.title, padding, 28);

  const cx = padding + pieSize / 2;
  const cy = legendTop + pieSize / 2;
  drawDonutRing(ctx, cx, cy, 52, 34, options.data);

  ctx.fillStyle = '#94a3b8';
  ctx.font = `400 10px ${PDF_FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText(options.centerLabel, cx, cy - 10);
  ctx.fillStyle = '#0f172a';
  ctx.font = `700 16px ${PDF_FONT}`;
  ctx.fillText(formatNumber(options.total), cx, cy + 8);
  ctx.fillStyle = '#94a3b8';
  ctx.font = `400 10px ${PDF_FONT}`;
  ctx.fillText(options.unit, cx, cy + 22);
  ctx.textAlign = 'left';

  options.data.forEach((item, index) => {
    const y = legendTop + 10 + index * 22;
    const x = padding + pieSize + 18;
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.font = `400 11px ${PDF_FONT}`;
    ctx.fillText(item.name, x + 12, y + 4);
    ctx.fillStyle = '#0f172a';
    ctx.font = `700 11px ${PDF_FONT}`;
    const valueText = `${formatNumber(item.value)} ${options.unit}`;
    const valueWidth = ctx.measureText(valueText).width;
    ctx.fillText(valueText, width - padding - valueWidth, y + 4);
  });

  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(padding, footerTop - 8);
  ctx.lineTo(width - padding, footerTop - 8);
  ctx.stroke();

  options.footer.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const boxW = (width - padding * 2 - 8) / 2;
    const x = padding + col * (boxW + 8);
    const y = footerTop + row * 44;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x, y, boxW, 38);
    ctx.fillStyle = '#94a3b8';
    ctx.font = `400 10px ${PDF_FONT}`;
    ctx.fillText(item.label, x + 10, y + 14);
    ctx.fillStyle = item.color;
    ctx.font = `700 12px ${PDF_FONT}`;
    ctx.fillText(item.value, x + 10, y + 30);
  });

  return canvas;
};

/** 统计圆环：有空位就接在数据标注后；可并排则并排，否则拆开逐个追加 */
const appendStatPanelsToPdf = (
  pdf: InstanceType<typeof jsPDF>,
  left: HTMLCanvasElement,
  right: HTMLCanvasElement,
  margin: number,
  startY: number,
) => {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const gap = 12;
  const usableW = pageW - margin * 2;
  const colW = (usableW - gap) / 2;
  const leftH = (left.height * colW) / left.width;
  const rightH = (right.height * colW) / right.width;
  const blockH = Math.max(leftH, rightH);
  const bottom = pageH - margin;
  let cursorY = startY;

  const drawPair = (y: number) => {
    pdf.addImage(left.toDataURL('image/jpeg', 0.92), 'JPEG', margin, y, colW, leftH);
    pdf.addImage(right.toDataURL('image/jpeg', 0.92), 'JPEG', margin + colW + gap, y, colW, rightH);
    return y + blockH + 10;
  };

  const drawOne = (source: HTMLCanvasElement, y: number, height: number) => {
    pdf.addImage(source.toDataURL('image/jpeg', 0.92), 'JPEG', margin, y, colW, height);
    return y + height + 10;
  };

  // 1) 剩余高度够并排 → 紧接追加
  if (cursorY + blockH <= bottom + 0.5) {
    return drawPair(cursorY);
  }

  // 2) 够放其中一个 → 拆开，先占当前页空白，另一个换页
  if (cursorY + leftH <= bottom + 0.5) {
    cursorY = drawOne(left, cursorY, leftH);
    if (cursorY + rightH > bottom + 0.5) {
      pdf.addPage();
      cursorY = margin;
    }
    return drawOne(right, cursorY, rightH);
  }

  // 3) 当前页完全放不下 → 换页后并排
  pdf.addPage();
  return drawPair(margin);
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
  /** 网格员结果用「件」，审核员动作量用「次」 */
  unit?: '件' | '次';
  footer: Array<{ label: string; value: string; color: string }>;
}> = ({ title, iconColor, data, total, centerLabel, unit = '件', footer }) => (
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
            <Tooltip formatter={(value: number) => [`${formatNumber(value)} ${unit}`, unit === '次' ? '审核动作' : '数量']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-400">{centerLabel}</span>
          <strong className="text-lg leading-5 text-slate-900">{formatNumber(total)}</strong>
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
            <strong className="shrink-0 font-mono text-slate-800">{formatNumber(item.value)} {unit}</strong>
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
  const [period, setPeriod] = useState<Period>('day');
  const [startDate, setStartDate] = useState(PERIOD_DEFAULTS.day.start);
  const [endDate, setEndDate] = useState(PERIOD_DEFAULTS.day.end);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const chartsExportRef = useRef<HTMLDivElement>(null);
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

  const periodDays = useMemo(
    () => dayDiffInclusive(parseDateInput(startDate), parseDateInput(endDate)),
    [startDate, endDate],
  );
  const periodFactor = periodDays / DONUT_BASE_DAYS;

  const reportTrend = useMemo(
    () =>
      buildTrendSeries(startDate, endDate, period).map((row) => ({
        ...row,
        total: scaleCount(row.total, scopeFactor),
        passed: scaleCount(row.passed, scopeFactor),
        rejected: scaleCount(row.rejected, scopeFactor),
        audited: scaleCount(row.audited, scopeFactor),
      })),
    [startDate, endDate, period, scopeFactor],
  );

  const trendNeedsHScroll = reportTrend.length > TREND_VISIBLE_BY_PERIOD[period];
  const trendChartMinWidth = trendNeedsHScroll
    ? reportTrend.length * TREND_POINT_WIDTH_BY_PERIOD[period]
    : undefined;

  const reportDonut = useMemo(
    () =>
      reportDonutBase.map((item) => ({
        ...item,
        value: scaleCount(item.value * periodFactor, scopeFactor),
      })),
    [periodFactor, scopeFactor],
  );

  const auditDonut = useMemo(
    () =>
      auditDonutBase.map((item) => ({
        ...item,
        value: scaleCount(item.value * periodFactor, scopeFactor),
      })),
    [periodFactor, scopeFactor],
  );

  const reportTotal = reportDonut.reduce((sum, item) => sum + item.value, 0);
  const auditTotal = auditDonut.reduce((sum, item) => sum + item.value, 0);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const handlePeriodChange = (next: Period) => {
    setPeriod(next);
    const defaults = PERIOD_DEFAULTS[next];
    setStartDate(defaults.start);
    setEndDate(defaults.end);
  };

  const resetFilters = () => {
    setPeriod('day');
    setStartDate(PERIOD_DEFAULTS.day.start);
    setEndDate(PERIOD_DEFAULTS.day.end);
    setSelectedOrg(null);
  };

  const toggleLine = (key: keyof typeof reportLines) => {
    setReportLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const reporterCount = scopeFactor < 1 ? Math.max(8, Math.round(486 * scopeFactor)) : 486;
  const auditorCount = scopeFactor < 1 ? Math.max(4, Math.round(168 * scopeFactor)) : 168;
  const orgScopeLabel = selectedOrg
    ? getOrgById(INITIAL_ORG_NODES, selectedOrg)?.name || '指定组织节点'
    : '全部组织节点';
  const periodPresetLabel =
    period === 'day'
      ? '按日'
      : period === 'week'
        ? '按周'
        : period === 'month'
          ? '按月'
          : period === 'quarter'
            ? '按季度'
            : '按年';
  const trendAgg = useMemo(() => {
    if (reportTrend.length === 0) {
      return { passRate: 0, directRate: 0, processRate: 0, avgTime: 0, total: 0 };
    }
    const sum = reportTrend.reduce(
      (acc, row) => ({
        passRate: acc.passRate + row.passRate,
        directRate: acc.directRate + row.directRate,
        processRate: acc.processRate + row.processRate,
        avgTime: acc.avgTime + row.avgTime,
        total: acc.total + row.total,
      }),
      { passRate: 0, directRate: 0, processRate: 0, avgTime: 0, total: 0 },
    );
    const n = reportTrend.length;
    return {
      passRate: round1(sum.passRate / n),
      directRate: round1(sum.directRate / n),
      processRate: round1(sum.processRate / n),
      avgTime: round1(sum.avgTime / n),
      total: sum.total,
    };
  }, [reportTrend]);
  const perCapitaReport = round1(trendAgg.total / Math.max(reporterCount, 1));
  const perCapitaAudit = round1(auditTotal / Math.max(auditorCount, 1));

  const handleExportData = () => {
    const stamp = formatExportDate();
    const periodLabel = `${periodPresetLabel}（${startDate.replaceAll('/', '-')}~${endDate.replaceAll('/', '-')}）`;
    const sheet: Array<Array<string | number>> = [
      ['统计管理导出'],
      ['统计周期', periodLabel],
      ['组织范围', orgScopeLabel],
      [],
      ['一、指标趋势明细'],
      [
        '时间',
        '累计报送量',
        '累计采纳量',
        '驳回整改量',
        '首审直通率',
        '整体采纳率',
        '审核处理率',
        '转办闭环率',
        '平均审核耗时',
      ],
      ...reportTrend.map((row) => [
        row.label,
        `${formatNumber(row.total)} 件`,
        `${formatNumber(row.passed)} 件`,
        `${formatNumber(row.rejected)} 件`,
        `${row.directRate}%`,
        `${row.passRate}%`,
        `${row.processRate}%`,
        `${row.closedRate}%`,
        `${row.avgTime} 分钟`,
      ]),
      [],
      ['二、报送结构汇总'],
      ['状态', '件数'],
      ...reportDonut.map((item) => [item.name, `${formatNumber(item.value)} 件`]),
      ['累计上报合计', `${formatNumber(reportTotal)} 件`],
      ['整体采纳率', `${trendAgg.passRate}%`],
      ['首审直通率', `${trendAgg.directRate}%`],
      ['在册网格员', `${reporterCount} 人`],
      ['人均累计报送量', `${perCapitaReport} 件`],
      [],
      ['三、审核结构汇总'],
      ['处理类型', '次数'],
      ...auditDonut.map((item) => [item.name, `${formatNumber(item.value)} 次`]),
      ['累计处理合计', `${formatNumber(auditTotal)} 次`],
      ['平均审核耗时', `${trendAgg.avgTime} 分钟`],
      ['审核处理率', `${trendAgg.processRate}%`],
      ['在册审核员', `${auditorCount} 人`],
      ['人均负荷', `${perCapitaAudit} 次`],
    ];

    const csv = sheet.map((row) => row.map(escapeCsvCell).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `统计管理_${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('导出成功');
  };

  const handleExportPdf = async () => {
    if (exportingPdf) return;

    setExportingPdf(true);
    showToast('正在导出…');

    try {
      const pagePointLimit = TREND_VISIBLE_BY_PERIOD[period];
      const trendChunks = chunkTrendRows(reportTrend, pagePointLimit);
      const contentWidth = 960;

      const legendItems = [
        reportLines.total ? { label: '累计报送量', color: chartColors.blue } : null,
        reportLines.passed ? { label: '累计采纳量', color: chartColors.green } : null,
        reportLines.rejected ? { label: '驳回整改量', color: chartColors.red } : null,
        reportLines.directRate ? { label: '首审直通率', color: chartColors.purple } : null,
        reportLines.passRate ? { label: '整体采纳率', color: chartColors.teal } : null,
        reportLines.processRate ? { label: '审核处理率', color: chartColors.cyan } : null,
        reportLines.closedRate ? { label: '转办闭环率', color: chartColors.amber } : null,
        reportLines.avgTime ? { label: '平均审核耗时', color: '#EC4899' } : null,
      ].filter(Boolean) as Array<{ label: string; color: string }>;

      const headerCanvas = drawPdfTextBlock(
        [
          { text: '统计管理图表', size: 14, weight: '700' },
          {
            text: `统计周期：${periodPresetLabel}（${startDate.replaceAll('/', '-')} ~ ${endDate.replaceAll('/', '-')}）  |  组织范围：${orgScopeLabel}`,
            size: 10,
            color: '#64748b',
            weight: '400',
          },
        ],
        contentWidth,
        8,
        18,
      );

      const reportPanelCanvas = composeDonutPanelCanvas({
        title: '网格员报送统计',
        data: reportDonut,
        total: reportTotal,
        centerLabel: '累计上报',
        unit: '件',
        footer: [
          { label: '整体采纳率', value: `${trendAgg.passRate}%`, color: '#08B889' },
          { label: '首审直通率', value: `${trendAgg.directRate}%`, color: '#1D58C9' },
          { label: '在册网格员', value: `${reporterCount}人`, color: '#8656F4' },
          { label: '人均累计报送量', value: `${perCapitaReport}件`, color: '#F5A400' },
        ],
      });

      const auditPanelCanvas = composeDonutPanelCanvas({
        title: '审核员审核统计',
        data: auditDonut,
        total: auditTotal,
        centerLabel: '累计处理',
        unit: '次',
        footer: [
          { label: '平均审核耗时', value: `${trendAgg.avgTime}分钟`, color: '#08B889' },
          { label: '审核处理率', value: `${trendAgg.processRate}%`, color: '#1D58C9' },
          { label: '在册审核员', value: `${auditorCount}人`, color: '#8656F4' },
          { label: '人均负荷', value: `${perCapitaAudit}次`, color: '#F5A400' },
        ],
      });

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const margin = 24;
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const usableH = pageH - margin * 2;
      let cursorY = margin;
      const chartGap = 6;
      const chartDrawH = 168;

      // 1) 先生成各段趋势图，再按页尽量塞两段（首页含标题+图例也能放下两段）
      const segmentBlocks = trendChunks.map((chunk, index) => {
        const rangeHint =
          chunk.length > 0 ? `${chunk[0].label} ~ ${chunk[chunk.length - 1].label}` : '';
        const trendTitleText =
          trendChunks.length > 1
            ? `指标趋势图（第 ${index + 1}/${trendChunks.length} 段${rangeHint ? `：${rangeHint}` : ''}）`
            : '指标趋势图';
        return stackCanvases(
          [
            drawPdfTextBlock([{ text: trendTitleText, size: 12, weight: '700' }], contentWidth, 6, 16),
            drawTrendChartCanvas(chunk, reportLines, contentWidth, chartDrawH),
          ],
          contentWidth,
          4,
        );
      });

      const legendCanvas = drawPdfColorLegend(legendItems, contentWidth);
      let segmentIndex = 0;
      let pageIndex = 0;

      while (segmentIndex < segmentBlocks.length) {
        const pageParts: HTMLCanvasElement[] = [];
        if (pageIndex === 0) {
          pageParts.push(headerCanvas, legendCanvas);
        }

        // 至少放一段；若还有空间再塞第二段
        pageParts.push(segmentBlocks[segmentIndex]);
        segmentIndex += 1;

        if (segmentIndex < segmentBlocks.length) {
          const withNext = stackCanvases(
            [...pageParts, segmentBlocks[segmentIndex]],
            contentWidth,
            chartGap,
          );
          if (estimatePdfImageHeight(withNext, pageW, margin) <= usableH) {
            pageParts.push(segmentBlocks[segmentIndex]);
            segmentIndex += 1;
          }
        }

        const pageBlock = stackCanvases(pageParts, contentWidth, chartGap);
        cursorY = appendCanvasWholeToPdf(pdf, pageBlock, margin, cursorY, {
          forceNewPage: pageIndex > 0,
        });
        pageIndex += 1;
      }

      // 2) 数据标注接在末段趋势图后：首页有空位就紧接着排，不够再换页
      const cssPerPt = contentWidth / (pageW - margin * 2);
      const remainPt = Math.max(0, pageH - margin - cursorY);
      const firstTableCssH = remainPt * cssPerPt;
      const tablePages = buildTrendDataTableCanvases(
        reportTrend,
        reportLines,
        contentWidth,
        usableH * cssPerPt,
        firstTableCssH,
      );
      tablePages.forEach((tableBlock, index) => {
        // 仅当本块放不下当前页剩余空间时才换页（首块尽量紧跟图表）
        cursorY = appendCanvasWholeToPdf(pdf, tableBlock, margin, cursorY, {
          forceNewPage: false,
        });
        void index;
      });

      // 3) 统计圆环：接在数据标注后的空白处，放不下再分开/换页
      appendStatPanelsToPdf(pdf, reportPanelCanvas, auditPanelCanvas, margin, cursorY);

      pdf.save(`统计管理图表_${formatExportDate()}.pdf`);
      showToast('导出成功');
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : '导出失败，请重试';
      showToast(message);
    } finally {
      setExportingPdf(false);
    }
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
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-[#1D58C9] px-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              title="导出当前图表为 PDF"
            >
              <FileText className="h-3.5 w-3.5" />
              {exportingPdf ? '导出中…' : '导出PDF'}
            </button>
            <button
              type="button"
              onClick={handleExportData}
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
              {(
                [
                  ['day', '按日'],
                  ['week', '按周'],
                  ['month', '按月'],
                  ['quarter', '按季度'],
                  ['year', '按年'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePeriodChange(key)}
                  className={`min-h-7 cursor-pointer rounded-xl px-3 py-1 text-xs transition select-none ${
                    period === key
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
              lockedMode={period === 'day' ? 'range' : period}
              unitRangeSelect={period !== 'day'}
              maxDate={STATS_MAX_DATE}
              maxUnitSpan={PERIOD_MAX_POINTS[period]}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
              title={
                period === 'day'
                  ? '选择起止日期'
                  : period === 'week'
                    ? '选择起止自然周'
                    : period === 'month'
                      ? '选择起止自然月'
                      : period === 'quarter'
                        ? '选择起止自然季度'
                        : '选择起止自然年'
              }
              className="min-w-[320px]"
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

      <div ref={chartsExportRef} className="space-y-4">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
          <PanelTitle
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            title="指标趋势图"
          />

          <div className="flex flex-wrap gap-1.5 py-3">
            <ChartLegendButton label="累计报送量" color={chartColors.blue} active={reportLines.total} onClick={() => toggleLine('total')} />
            <ChartLegendButton label="累计采纳量" color={chartColors.green} active={reportLines.passed} onClick={() => toggleLine('passed')} />
            <ChartLegendButton label="驳回整改量" color={chartColors.red} active={reportLines.rejected} onClick={() => toggleLine('rejected')} />
            <ChartLegendButton label="首审直通率(%)" color={chartColors.purple} active={reportLines.directRate} onClick={() => toggleLine('directRate')} />
            <ChartLegendButton label="整体采纳率(%)" color={chartColors.teal} active={reportLines.passRate} onClick={() => toggleLine('passRate')} />
            <ChartLegendButton label="审核处理率(%)" color={chartColors.cyan} active={reportLines.processRate} onClick={() => toggleLine('processRate')} />
            <ChartLegendButton label="转办闭环率(%)" color={chartColors.amber} active={reportLines.closedRate} onClick={() => toggleLine('closedRate')} />
            <ChartLegendButton label="平均审核耗时" color="#EC4899" active={reportLines.avgTime} onClick={() => toggleLine('avgTime')} />
          </div>

          <div
            data-chart-scroll
            className={`h-[270px] w-full sm:h-[300px] ${
              trendNeedsHScroll ? 'overflow-x-scroll overflow-y-hidden' : 'overflow-hidden'
            }`}
            style={trendNeedsHScroll ? { scrollbarGutter: 'stable' } : undefined}
          >
            <div
              data-chart-inner
              className="h-full"
              style={{
                width: trendNeedsHScroll ? trendChartMinWidth : '100%',
                minWidth: trendChartMinWidth,
                // 预留横向滚动条高度，避免悬停出现滚动条时高度抖动触发坐标轴重绘
                height: trendNeedsHScroll ? 'calc(100% - 14px)' : '100%',
              }}
            >
              <ResponsiveContainer width="100%" height="100%" debounce={80}>
                <ComposedChart data={reportTrend} margin={{ top: 8, right: 18, left: -12, bottom: 6 }}>
                  <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis yAxisId="count" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} unit="件" />
                  <YAxis yAxisId="rate" orientation="right" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} unit="%" />
                  <YAxis yAxisId="time" orientation="right" domain={[0, 30]} tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} unit="分" hide />
                  <Tooltip
                    contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11 }}
                    wrapperStyle={{ outline: 'none', zIndex: 20 }}
                    itemSorter={(item) => {
                      const idx = TREND_TOOLTIP_ORDER.indexOf(String(item.name) as (typeof TREND_TOOLTIP_ORDER)[number]);
                      return idx === -1 ? TREND_TOOLTIP_ORDER.length : idx;
                    }}
                    formatter={(value: number, name: string) => [
                      name.includes('率') || name.includes('均分')
                        ? `${value}%`
                        : name.includes('耗时') || name.includes('响应')
                          ? `${value} 分钟`
                          : `${formatNumber(value)} 件`,
                      name,
                    ]}
                  />
                  {reportLines.total && (
                    <Bar yAxisId="count" dataKey="total" name="累计报送量" fill={chartColors.blue} barSize={14} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                  )}
                  {reportLines.passed && (
                    <Bar yAxisId="count" dataKey="passed" name="累计采纳量" fill={chartColors.green} barSize={14} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                  )}
                  {reportLines.rejected && (
                    <Bar yAxisId="count" dataKey="rejected" name="驳回整改量" fill={chartColors.red} barSize={14} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                  )}
                  {reportLines.directRate && <Line yAxisId="rate" type="monotone" dataKey="directRate" name="首审直通率" stroke={chartColors.purple} strokeDasharray="4 4" strokeWidth={1.6} dot={{ r: 2, fill: chartColors.purple }} isAnimationActive={false} />}
                  {reportLines.passRate && <Line yAxisId="rate" type="monotone" dataKey="passRate" name="整体采纳率" stroke={chartColors.teal} strokeWidth={1.6} dot={{ r: 2, fill: chartColors.teal }} isAnimationActive={false} />}
                  {reportLines.processRate && <Line yAxisId="rate" type="monotone" dataKey="processRate" name="审核处理率" stroke={chartColors.cyan} strokeDasharray="3 3" strokeWidth={1.6} dot={{ r: 2, fill: chartColors.cyan }} isAnimationActive={false} />}
                  {reportLines.closedRate && <Line yAxisId="rate" type="monotone" dataKey="closedRate" name="转办闭环率" stroke={chartColors.amber} strokeDasharray="5 3" strokeWidth={1.6} dot={{ r: 2, fill: chartColors.amber }} isAnimationActive={false} />}
                  {reportLines.avgTime && <Line yAxisId="time" type="monotone" dataKey="avgTime" name="平均审核耗时" stroke="#EC4899" strokeWidth={1.6} dot={{ r: 2, fill: '#EC4899' }} isAnimationActive={false} />}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
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
              { label: '整体采纳率', value: `${trendAgg.passRate}%`, color: '#08B889' },
              { label: '首审直通率', value: `${trendAgg.directRate}%`, color: '#1D58C9' },
              { label: '在册网格员', value: `${reporterCount}人`, color: '#8656F4' },
              { label: '人均累计报送量', value: `${perCapitaReport}件`, color: '#F5A400' },
            ]}
          />
          <DonutPanel
            title="审核员审核统计"
            iconColor="#08B889"
            data={auditDonut}
            total={auditTotal}
            centerLabel="累计处理"
            unit="次"
            footer={[
              { label: '平均审核耗时', value: `${trendAgg.avgTime}分钟`, color: '#08B889' },
              { label: '审核处理率', value: `${trendAgg.processRate}%`, color: '#1D58C9' },
              { label: '在册审核员', value: `${auditorCount}人`, color: '#8656F4' },
              { label: '人均负荷', value: `${perCapitaAudit}次`, color: '#F5A400' },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
