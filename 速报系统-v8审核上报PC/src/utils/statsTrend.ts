/** 统计管理 / 报送·审核统计共用的趋势序列与样式常量 */

export type StatsPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

export type TrendRow = {
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

export const TREND_VISIBLE_BY_PERIOD: Record<StatsPeriod, number> = {
  day: 14,
  week: 8,
  month: 12,
  quarter: 8,
  year: 6,
};

export const TREND_POINT_WIDTH_BY_PERIOD: Record<StatsPeriod, number> = {
  day: 88,
  week: 120,
  month: 96,
  quarter: 110,
  year: 100,
};

export const chartColors = {
  blue: '#1B5BD6',
  green: '#08B889',
  red: '#F04453',
  purple: '#8656F4',
  teal: '#11A8A1',
  cyan: '#1BA9D4',
  amber: '#EA580C',
  pink: '#EC4899',
};

export const formatTrendNumber = (value: number) => value.toLocaleString('zh-CN');

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

const getISOWeek = (date: Date) => {
  const tmp = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNum = tmp.getDay() || 7;
  tmp.setDate(tmp.getDate() + 4 - dayNum);
  const yearStart = new Date(tmp.getFullYear(), 0, 1);
  return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

const quarterOf = (date: Date) => Math.floor(date.getMonth() / 3) + 1;

/** 按统计单位（日/周/月/季/年）生成趋势点，与统计管理一致 */
export const buildTrendSeries = (
  startValue: string,
  endValue: string,
  grain: StatsPeriod,
  fallback: { start: string; end: string } = { start: '2026-11-03', end: '2026-11-09' },
): TrendRow[] => {
  const start = parseDateInput(startValue);
  const end = parseDateInput(endValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return buildTrendSeries(fallback.start, fallback.end, 'day', fallback);
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
