import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export type DateRangeLockedMode = 'week' | 'month' | 'quarter' | 'year' | 'range';

export interface DateRangeFieldProps {
  startValue: string;
  endValue: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  title?: string;
  startTitle?: string;
  endTitle?: string;
  className?: string;
  inputClassName?: string;
  fullWidth?: boolean;
  readOnly?: boolean;
  onRequestEdit?: () => void;
  /**
   * native：筛选栏双日期输入（报送/审核管理还原样式）
   * panel：统计/考核用弹层面板（起止/周/月/季/年）
   */
  variant?: 'native' | 'panel';
  showNaturalPresets?: boolean;
  /**
   * 锁定为单一选择模式（不展示左侧快捷切换）。未传时行为与原来一致。
   * 考核管理等场景可按「本周/本月/本季度/本年」拆开对应控件。
   */
  lockedMode?: DateRangeLockedMode;
  /**
   * 周/月/季/年模式下允许点选起止单位形成区间（统计管理默认近 N 周等）。
   * 未开启时仍为单点选择。
   */
  unitRangeSelect?: boolean;
  /**
   * 可选日期上限（含当天）。不传则用系统当天。
   * 原型统计页可传数据最新日，避免选到无数据的未来区间。
   */
  maxDate?: string;
  /**
   * 确认前校验区间。返回错误文案则禁止提交并在面板内提示。
   */
  validateRange?: (start: string, end: string) => string | null;
  /**
   * 已选起点后，按当前模式单位限制可选跨度（含起点）。
   * 超出跨度的日期/周期自动置灰不可选，替代事后校验提示。
   */
  maxUnitSpan?: number;
}

type PanelMode = 'range' | 'week' | 'month' | 'quarter' | 'year';

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

const nativeDateInputClass =
  'relative min-w-0 flex-1 h-full border-0 bg-transparent px-0.5 text-xs text-gray-700 focus:outline-none focus:ring-0 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0';

const toDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseDateKey = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(`${value.replace(/-/g, '/')} 00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const startOfWeekSun = (date: Date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
};

const startOfWeekMon = (date: Date) => {
  const start = new Date(date);
  const day = start.getDay();
  const offsetToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + offsetToMonday);
  start.setHours(0, 0, 0, 0);
  return start;
};

const endOfWeekMon = (date: Date) => {
  const end = startOfWeekMon(date);
  end.setDate(end.getDate() + 6);
  return end;
};

const getISOWeek = (date: Date) => {
  const tmp = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNum = tmp.getDay() || 7;
  tmp.setDate(tmp.getDate() + 4 - dayNum);
  const yearStart = new Date(tmp.getFullYear(), 0, 1);
  return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

const getMonthMatrixSun = (year: number, month: number) => {
  const first = new Date(year, month, 1);
  const start = startOfWeekSun(first);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    const cell = new Date(start);
    cell.setDate(start.getDate() + i);
    cells.push(cell);
  }
  return cells;
};

/** 按 ISO 周列出整年自然周（可跨月），用于按周全量选择 */
const getWeeksInYear = (year: number) => {
  const weeks: { start: string; end: string; weekNo: number; label: string }[] = [];
  const seen = new Set<string>();
  // 从该年 1 月 4 日所在周起扫到次年 1 月，覆盖该年全部 ISO 周
  let cursor = startOfWeekMon(new Date(year, 0, 4));
  const limit = new Date(year + 1, 0, 7);

  while (cursor < limit) {
    const start = startOfWeekMon(cursor);
    const end = endOfWeekMon(cursor);
    const weekNo = getISOWeek(start);
    const startKey = toDateKey(start);
    // 仅收录「周四落在当年」的 ISO 周，避免首尾重复
    const thursday = new Date(start);
    thursday.setDate(start.getDate() + 3);
    if (thursday.getFullYear() === year && !seen.has(startKey)) {
      seen.add(startKey);
      weeks.push({
        start: startKey,
        end: toDateKey(end),
        weekNo,
        label: `${formatSlash(startKey)} 至 ${formatSlash(toDateKey(end))}`,
      });
    }
    cursor = new Date(start);
    cursor.setDate(cursor.getDate() + 7);
    if (weeks.length >= 60) break;
  }
  return weeks.sort((a, b) => a.weekNo - b.weekNo);
};

const formatSlash = (value?: string) => {
  if (!value) return '----/--/--';
  return value.replace(/-/g, '/');
};

const addMonths = (date: Date, delta: number) => new Date(date.getFullYear(), date.getMonth() + delta, 1);

const monthIndexOf = (date: Date) => date.getFullYear() * 12 + date.getMonth();

const shiftDateKey = (dateKey: string, days: number) => {
  const base = parseDateKey(dateKey);
  if (!base) return dateKey;
  base.setDate(base.getDate() + days);
  return toDateKey(base);
};

/** 最近 7 日（含锚定日） */
const getRecentSevenDays = (maxKey: string) => ({
  start: shiftDateKey(maxKey, -6),
  end: maxKey,
});

const clampPeriodEnd = (endKey: string, maxKey: string) => (endKey > maxKey ? maxKey : endKey);

/** 默认：锚定日所在自然周（当前周可选；结束日不超过锚定日） */
const getLatestSelectableWeek = (maxKey: string) => {
  const cursor = parseDateKey(maxKey) || new Date();
  const start = startOfWeekMon(cursor);
  const end = endOfWeekMon(cursor);
  return { start: toDateKey(start), end: clampPeriodEnd(toDateKey(end), maxKey) };
};

/** 默认：锚定日所在自然月（当前月可选；结束日不超过锚定日） */
const getLatestSelectableMonth = (maxKey: string) => {
  const max = parseDateKey(maxKey) || new Date();
  const y = max.getFullYear();
  const m = max.getMonth();
  const start = toDateKey(new Date(y, m, 1));
  const end = toDateKey(new Date(y, m + 1, 0));
  return { start, end: clampPeriodEnd(end, maxKey) };
};

/** 默认：锚定日所在自然季度（当前季可选；结束日不超过锚定日） */
const getLatestSelectableQuarter = (maxKey: string) => {
  const max = parseDateKey(maxKey) || new Date();
  const y = max.getFullYear();
  const startMonth = Math.floor(max.getMonth() / 3) * 3;
  const start = toDateKey(new Date(y, startMonth, 1));
  const end = toDateKey(new Date(y, startMonth + 3, 0));
  return { start, end: clampPeriodEnd(end, maxKey) };
};

/** 默认：锚定日所在自然年（本年可选；结束日不超过锚定日） */
const getLatestSelectableYear = (maxKey: string) => {
  const max = parseDateKey(maxKey) || new Date();
  const y = max.getFullYear();
  return { start: `${y}-01-01`, end: clampPeriodEnd(`${y}-12-31`, maxKey) };
};

/**
 * 时间区间：起止为双月历；左侧可切按周/按月/按季度/按年；禁止选择超过 maxDate 的未来区间
 */
const QUARTER_CN = ['一', '二', '三', '四'] as const;

const formatWeekUnitLabel = (date: Date, withYear = false) =>
  withYear ? `${date.getFullYear()}年第${getISOWeek(date)}周` : `第${getISOWeek(date)}周`;

const formatMonthUnitLabel = (date: Date) => `${date.getFullYear()}年${date.getMonth() + 1}月`;

const formatQuarterUnitLabel = (date: Date) => {
  const q = Math.floor(date.getMonth() / 3) + 1;
  return `${date.getFullYear()}年${QUARTER_CN[q - 1]}季度`;
};

const formatYearUnitLabel = (date: Date) => `${date.getFullYear()}年`;

const joinUnitRangeLabel = (startLabel: string, endLabel: string) =>
  startLabel === endLabel ? startLabel : `${startLabel} ~ ${endLabel}`;

/** 按模式计算起止之间的单位点数（含两端） */
const countUnitSpan = (mode: PanelMode, a: string, b: string) => {
  const startKey = a <= b ? a : b;
  const endKey = a <= b ? b : a;
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  if (!start || !end) return 1;
  if (mode === 'range') {
    return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  }
  if (mode === 'week') {
    const weekStart = startOfWeekMon(start);
    const weekEnd = startOfWeekMon(end);
    return Math.round((weekEnd.getTime() - weekStart.getTime()) / (7 * 86400000)) + 1;
  }
  if (mode === 'month') {
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  }
  if (mode === 'quarter') {
    const startQ = start.getFullYear() * 4 + Math.floor(start.getMonth() / 3);
    const endQ = end.getFullYear() * 4 + Math.floor(end.getMonth() / 3);
    return endQ - startQ + 1;
  }
  if (mode === 'year') {
    return end.getFullYear() - start.getFullYear() + 1;
  }
  return 1;
};

/** 筛选栏还原样式：起止合并在同一框内的双原生日期输入 */
const NativeDateRangeField: React.FC<DateRangeFieldProps> = ({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  title = '时间区间',
  startTitle = '开始日期',
  endTitle = '结束日期',
  className = '',
  inputClassName,
  fullWidth = false,
  readOnly = false,
  onRequestEdit,
}) => {
  const resolvedInputClass =
    inputClassName ?? (fullWidth ? 'min-w-0 flex-1' : 'w-[118px] flex-none');
  const requestEdit = () => {
    if (readOnly) onRequestEdit?.();
  };
  return (
    <div
      className={`flex items-center gap-1 h-[34px] pl-2 pr-2.5 rounded-lg border border-gray-300 bg-white shadow-2xs hover:border-gray-400 focus-within:border-[#1E5ABB] focus-within:ring-2 focus-within:ring-[#1E5ABB]/15 transition-all ${
        fullWidth ? 'w-full' : ''
      } ${readOnly ? 'cursor-pointer bg-slate-50' : ''} ${className}`}
      title={readOnly ? `${title}（点击可自定义）` : title}
      onClick={requestEdit}
    >
      <input
        type="date"
        value={startValue}
        readOnly={readOnly}
        onChange={(e) => onStartChange(e.target.value)}
        onFocus={requestEdit}
        title={startTitle}
        aria-label={startTitle}
        className={`${nativeDateInputClass} ${resolvedInputClass} ${readOnly ? 'pointer-events-none text-slate-500' : ''}`}
      />
      <span className="text-gray-300 select-none shrink-0 text-xs">至</span>
      <input
        type="date"
        value={endValue}
        readOnly={readOnly}
        onChange={(e) => onEndChange(e.target.value)}
        onFocus={requestEdit}
        title={endTitle}
        aria-label={endTitle}
        className={`${nativeDateInputClass} ${resolvedInputClass} ${readOnly ? 'pointer-events-none text-slate-500' : ''}`}
      />
      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0 pointer-events-none" />
    </div>
  );
};

const PanelDateRangeField: React.FC<DateRangeFieldProps> = ({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  title = '时间区间',
  className = '',
  fullWidth = false,
  readOnly = false,
  onRequestEdit,
  showNaturalPresets = true,
  lockedMode,
  unitRangeSelect = false,
  maxDate,
  validateRange,
  maxUnitSpan,
}) => {
  const maxDateKey = useMemo(() => {
    const fromProp = parseDateKey(maxDate);
    return fromProp ? toDateKey(fromProp) : toDateKey(new Date());
  }, [maxDate]);
  const maxMonthDate = useMemo(() => {
    const d = parseDateKey(maxDateKey) || new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }, [maxDateKey]);

  const isAfterMax = (key?: string | null) => Boolean(key && key > maxDateKey);
  /** 未来周期不可选：开始日晚于锚定日；当前未结束周期可选 */
  const isPeriodDisabled = (startKey: string) => startKey > maxDateKey;

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<PanelMode>(lockedMode || 'range');

  useEffect(() => {
    if (lockedMode) setMode(lockedMode);
  }, [lockedMode]);
  const [leftMonth, setLeftMonth] = useState(() => {
    const anchor = parseDateKey(startValue) || parseDateKey(endValue) || parseDateKey(maxDateKey) || new Date();
    const month = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    return monthIndexOf(month) > monthIndexOf(maxMonthDate) ? maxMonthDate : month;
  });
  const [viewYear, setViewYear] = useState(() => {
    const anchor = parseDateKey(endValue) || parseDateKey(startValue) || parseDateKey(maxDateKey) || new Date();
    return Math.min(anchor.getFullYear(), maxMonthDate.getFullYear());
  });
  const [draftStart, setDraftStart] = useState<string>(startValue);
  const [draftEnd, setDraftEnd] = useState<string>(endValue);
  const [pickingEnd, setPickingEnd] = useState(false);
  const [hoverDay, setHoverDay] = useState<string | null>(null);

  /** 已选起点后，超出 maxUnitSpan 的候选不可选 */
  const isOutsideSelectableSpan = (candidateKey: string) => {
    if (!maxUnitSpan || maxUnitSpan < 1 || !pickingEnd || !draftStart) return false;
    return countUnitSpan(mode, draftStart, candidateKey) > maxUnitSpan;
  };
  const rootRef = useRef<HTMLDivElement>(null);
  const weekListRef = useRef<HTMLDivElement>(null);
  const selectedWeekBtnRef = useRef<HTMLButtonElement>(null);

  const rightMonth = useMemo(() => addMonths(leftMonth, 1), [leftMonth]);
  const canNextMonth = monthIndexOf(leftMonth) < monthIndexOf(maxMonthDate);
  const canNextYear =
    leftMonth.getFullYear() < maxMonthDate.getFullYear() ||
    (leftMonth.getFullYear() === maxMonthDate.getFullYear() && leftMonth.getMonth() < maxMonthDate.getMonth());

  const applyDefaultForMode = (nextMode: PanelMode) => {
    setPickingEnd(false);
    setHoverDay(null);
    if (nextMode === 'range') {
      const range = getRecentSevenDays(maxDateKey);
      setDraftStart(range.start);
      setDraftEnd(range.end);
      const endDate = parseDateKey(range.end) || new Date();
      const month = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
      setLeftMonth(monthIndexOf(month) > monthIndexOf(maxMonthDate) ? maxMonthDate : month);
      setViewYear(Math.min(endDate.getFullYear(), maxMonthDate.getFullYear()));
      return;
    }
    if (nextMode === 'week') {
      const week = getLatestSelectableWeek(maxDateKey);
      setDraftStart(week.start);
      setDraftEnd(week.end);
      const startDate = parseDateKey(week.start) || new Date();
      setViewYear(Math.min(startDate.getFullYear(), maxMonthDate.getFullYear()));
      return;
    }
    if (nextMode === 'month') {
      const month = getLatestSelectableMonth(maxDateKey);
      setDraftStart(month.start);
      setDraftEnd(month.end);
      const startDate = parseDateKey(month.start) || new Date();
      setViewYear(Math.min(startDate.getFullYear(), maxMonthDate.getFullYear()));
      return;
    }
    if (nextMode === 'quarter') {
      const quarter = getLatestSelectableQuarter(maxDateKey);
      setDraftStart(quarter.start);
      setDraftEnd(quarter.end);
      const startDate = parseDateKey(quarter.start) || new Date();
      setViewYear(Math.min(startDate.getFullYear(), maxMonthDate.getFullYear()));
      return;
    }
    if (nextMode === 'year') {
      const year = getLatestSelectableYear(maxDateKey);
      setDraftStart(year.start);
      setDraftEnd(year.end);
      const startDate = parseDateKey(year.start) || new Date();
      setViewYear(startDate.getFullYear());
    }
  };

  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      if (lockedMode) {
        // 锁定模式：打开时带入当前已选区间，仅展示对应控件
        setMode(lockedMode);
        setDraftStart(startValue);
        setDraftEnd(endValue);
        setPickingEnd(false);
        setHoverDay(null);
        const anchor = parseDateKey(endValue) || parseDateKey(startValue) || parseDateKey(maxDateKey) || new Date();
        setViewYear(Math.min(anchor.getFullYear(), maxMonthDate.getFullYear()));
        const month = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
        setLeftMonth(monthIndexOf(month) > monthIndexOf(maxMonthDate) ? maxMonthDate : month);
      } else {
        // 打开面板时：起止默认最近一周
        setMode('range');
        applyDefaultForMode('range');
      }
    }
    wasOpenRef.current = open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, maxDateKey, lockedMode]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const openEditor = () => {
    if (readOnly) onRequestEdit?.();
    if (showNaturalPresets) {
      setOpen(true);
    }
  };

  const switchMode = (nextMode: PanelMode) => {
    setMode(nextMode);
    applyDefaultForMode(nextMode);
  };

  const commitRange = (start: string, end: string) => {
    if (isAfterMax(end) || isAfterMax(start)) return;
    onStartChange(start);
    onEndChange(end);
    setOpen(false);
  };

  const clearDraft = () => {
    setDraftStart('');
    setDraftEnd('');
    setPickingEnd(false);
    setHoverDay(null);
  };

  const normalizedDraft =
    draftStart && draftEnd
      ? {
          start: draftStart <= draftEnd ? draftStart : draftEnd,
          end: draftStart <= draftEnd ? draftEnd : draftStart,
        }
      : null;

  const rangeValidationError = useMemo(() => {
    if (!normalizedDraft || !validateRange) return null;
    if (isPeriodDisabled(normalizedDraft.start) || isAfterMax(normalizedDraft.end)) return null;
    return validateRange(normalizedDraft.start, normalizedDraft.end);
  }, [normalizedDraft, validateRange, maxDateKey]);

  const confirmDisabled =
    !normalizedDraft ||
    isPeriodDisabled(normalizedDraft.start) ||
    isAfterMax(normalizedDraft.end) ||
    Boolean(rangeValidationError);

  const confirmDraft = () => {
    if (!normalizedDraft || isPeriodDisabled(normalizedDraft.start) || isAfterMax(normalizedDraft.end)) return;
    const error = validateRange?.(normalizedDraft.start, normalizedDraft.end) ?? null;
    if (error) return;
    commitRange(normalizedDraft.start, normalizedDraft.end);
  };

  const onPickRangeDay = (day: Date) => {
    const key = toDateKey(day);
    if (isAfterMax(key) || isOutsideSelectableSpan(key)) return;
    if (!pickingEnd || !draftStart) {
      setDraftStart(key);
      setDraftEnd('');
      setPickingEnd(true);
      return;
    }
    setDraftEnd(key);
    setPickingEnd(false);
  };

  const previewEnd =
    pickingEnd && draftStart
      ? mode === 'range'
        ? hoverDay && !isAfterMax(hoverDay) && !isOutsideSelectableSpan(hoverDay)
          ? hoverDay
          : null
        : draftEnd || null
      : draftEnd;

  const rangeStart =
    draftStart && previewEnd ? (draftStart <= previewEnd ? draftStart : previewEnd) : draftStart;
  const rangeEnd =
    draftStart && previewEnd ? (draftStart <= previewEnd ? previewEnd : draftStart) : '';

  const isInDraftRange = (day: Date) => {
    if (!rangeStart || !rangeEnd) return false;
    const key = toDateKey(day);
    return key >= rangeStart && key <= rangeEnd;
  };

  const isDraftEdge = (day: Date) => {
    const key = toDateKey(day);
    return key === rangeStart || key === rangeEnd;
  };

  const leftCells = useMemo(
    () => getMonthMatrixSun(leftMonth.getFullYear(), leftMonth.getMonth()),
    [leftMonth]
  );
  const rightCells = useMemo(
    () => getMonthMatrixSun(rightMonth.getFullYear(), rightMonth.getMonth()),
    [rightMonth]
  );

  const yearWeeks = useMemo(() => getWeeksInYear(viewYear), [viewYear]);

  useEffect(() => {
    if (!open || mode !== 'week') return;
    // 选中后自动定位到当前周
    const timer = window.setTimeout(() => {
      selectedWeekBtnRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 40);
    return () => window.clearTimeout(timer);
  }, [open, mode, draftStart, draftEnd, viewYear, yearWeeks]);

  const clampLeftMonth = (next: Date) => {
    if (monthIndexOf(next) > monthIndexOf(maxMonthDate)) return maxMonthDate;
    return next;
  };

  const shiftLeftMonth = (delta: number) =>
    setLeftMonth((prev) => clampLeftMonth(addMonths(prev, delta)));
  const shiftLeftYear = (delta: number) =>
    setLeftMonth((prev) => clampLeftMonth(new Date(prev.getFullYear() + delta, prev.getMonth(), 1)));

  const selectWeek = (start: string, end: string) => {
    if (isPeriodDisabled(start) || isOutsideSelectableSpan(start)) return;
    const clampedEnd = clampPeriodEnd(end, maxDateKey);
    if (!unitRangeSelect) {
      setDraftStart(start);
      setDraftEnd(clampedEnd);
      setPickingEnd(false);
      return;
    }
    if (!pickingEnd || !draftStart) {
      setDraftStart(start);
      setDraftEnd(clampedEnd);
      setPickingEnd(true);
      return;
    }
    const anchorStart = draftStart;
    const anchorEnd = draftEnd || draftStart;
    setDraftStart(start <= anchorStart ? start : anchorStart);
    setDraftEnd(clampPeriodEnd(clampedEnd >= anchorEnd ? clampedEnd : anchorEnd, maxDateKey));
    setPickingEnd(false);
  };

  const selectMonth = (monthIndex: number) => {
    const startKey = toDateKey(new Date(viewYear, monthIndex, 1));
    const endKey = toDateKey(new Date(viewYear, monthIndex + 1, 0));
    if (isPeriodDisabled(startKey) || isOutsideSelectableSpan(startKey)) return;
    const clampedEnd = clampPeriodEnd(endKey, maxDateKey);
    if (!unitRangeSelect) {
      setDraftStart(startKey);
      setDraftEnd(clampedEnd);
      setPickingEnd(false);
      return;
    }
    if (!pickingEnd || !draftStart) {
      setDraftStart(startKey);
      setDraftEnd(clampedEnd);
      setPickingEnd(true);
      return;
    }
    const anchorStart = draftStart;
    const anchorEnd = draftEnd || draftStart;
    setDraftStart(startKey <= anchorStart ? startKey : anchorStart);
    setDraftEnd(clampPeriodEnd(clampedEnd >= anchorEnd ? clampedEnd : anchorEnd, maxDateKey));
    setPickingEnd(false);
  };

  const selectQuarter = (quarterIndex: number) => {
    const startMonth = quarterIndex * 3;
    const startKey = toDateKey(new Date(viewYear, startMonth, 1));
    const endKey = toDateKey(new Date(viewYear, startMonth + 3, 0));
    if (isPeriodDisabled(startKey) || isOutsideSelectableSpan(startKey)) return;
    const clampedEnd = clampPeriodEnd(endKey, maxDateKey);
    if (!unitRangeSelect) {
      setDraftStart(startKey);
      setDraftEnd(clampedEnd);
      setPickingEnd(false);
      return;
    }
    if (!pickingEnd || !draftStart) {
      setDraftStart(startKey);
      setDraftEnd(clampedEnd);
      setPickingEnd(true);
      return;
    }
    const anchorStart = draftStart;
    const anchorEnd = draftEnd || draftStart;
    setDraftStart(startKey <= anchorStart ? startKey : anchorStart);
    setDraftEnd(clampPeriodEnd(clampedEnd >= anchorEnd ? clampedEnd : anchorEnd, maxDateKey));
    setPickingEnd(false);
  };

  const selectYear = (year: number) => {
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;
    if (isPeriodDisabled(start) || isOutsideSelectableSpan(start)) return;
    const clampedEnd = clampPeriodEnd(end, maxDateKey);
    if (!unitRangeSelect) {
      setDraftStart(start);
      setDraftEnd(clampedEnd);
      setPickingEnd(false);
      setViewYear(year);
      return;
    }
    if (!pickingEnd || !draftStart) {
      setDraftStart(start);
      setDraftEnd(clampedEnd);
      setPickingEnd(true);
      setViewYear(year);
      return;
    }
    const anchorStart = draftStart;
    const anchorEnd = draftEnd || draftStart;
    setDraftStart(start <= anchorStart ? start : anchorStart);
    setDraftEnd(clampPeriodEnd(clampedEnd >= anchorEnd ? clampedEnd : anchorEnd, maxDateKey));
    setPickingEnd(false);
    setViewYear(year);
  };

  /** 周/月/季/年卡片是否落在当前草稿区间内 */
  const isUnitInDraftRange = (unitStart: string, unitEnd: string) => {
    if (!rangeStart || !rangeEnd) return false;
    return unitStart <= rangeEnd && unitEnd >= rangeStart;
  };

  const isUnitDraftEdge = (unitStart: string, unitEnd: string) => {
    if (!rangeStart || !rangeEnd) return false;
    const touchesStart = unitStart <= rangeStart && unitEnd >= rangeStart;
    const touchesEnd = unitStart <= rangeEnd && unitEnd >= rangeEnd;
    return touchesStart || touchesEnd;
  };

  const decadeStart = Math.floor(viewYear / 10) * 10;
  const decadeYears = Array.from({ length: 12 }, (_, i) => decadeStart - 1 + i);

  const selectionSummary = useMemo(() => {
    if (!normalizedDraft) {
      return {
        title:
          mode === 'week'
            ? unitRangeSelect
              ? '请选择起止自然周'
              : '请选择自然周'
            : mode === 'month'
              ? unitRangeSelect
                ? '请选择起止自然月'
                : '请选择自然月'
              : mode === 'quarter'
                ? unitRangeSelect
                  ? '请选择起止自然季度'
                  : '请选择自然季度'
                : mode === 'year'
                  ? unitRangeSelect
                    ? '请选择起止自然年'
                    : '请选择自然年'
                  : '请选择起止日期',
        range: '',
      };
    }
    const { start, end } = normalizedDraft;
    const startDate = parseDateKey(start);
    const endDate = parseDateKey(end);
    if (mode === 'week' && startDate && endDate) {
      const withYear = startDate.getFullYear() !== endDate.getFullYear();
      return {
        title: joinUnitRangeLabel(
          formatWeekUnitLabel(startDate, withYear),
          formatWeekUnitLabel(endDate, withYear),
        ),
        range: `${formatSlash(start)} 至 ${formatSlash(end)}`,
      };
    }
    if (mode === 'month' && startDate && endDate) {
      return {
        title: joinUnitRangeLabel(formatMonthUnitLabel(startDate), formatMonthUnitLabel(endDate)),
        range: `${formatSlash(start)} 至 ${formatSlash(end)}`,
      };
    }
    if (mode === 'quarter' && startDate && endDate) {
      return {
        title: joinUnitRangeLabel(formatQuarterUnitLabel(startDate), formatQuarterUnitLabel(endDate)),
        range: `${formatSlash(start)} 至 ${formatSlash(end)}`,
      };
    }
    if (mode === 'year' && startDate && endDate) {
      return {
        title: joinUnitRangeLabel(formatYearUnitLabel(startDate), formatYearUnitLabel(endDate)),
        range: `${formatSlash(start)} 至 ${formatSlash(end)}`,
      };
    }
    return {
      title: '自定义起止',
      range: `${formatSlash(start)} 至 ${formatSlash(end)}`,
    };
  }, [normalizedDraft, mode, unitRangeSelect]);

  const footerActions = (
    <div className="space-y-2 border-t border-slate-100 px-3 py-2.5">
      {rangeValidationError && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-medium text-amber-700">
          {rangeValidationError}
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-xs font-bold text-[#409EFF]">{selectionSummary.title}</span>
            {selectionSummary.range ? (
              <span className="font-mono text-[11px] font-semibold text-[#409EFF]">{selectionSummary.range}</span>
            ) : (
              <span className="text-[11px] text-slate-400">选择后将显示具体时间区间</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={clearDraft}
            className="px-2 py-1 text-xs font-semibold text-[#409EFF] hover:opacity-80"
          >
            清空
          </button>
          <button
            type="button"
            disabled={confirmDisabled}
            onClick={confirmDraft}
            title={rangeValidationError || undefined}
            className="rounded border border-[#DCDFE6] bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-[#409EFF] hover:text-[#409EFF] disabled:cursor-not-allowed disabled:opacity-40"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );

  const modeButtons: { id: PanelMode; label: string }[] = [
    { id: 'range', label: '起止' },
    { id: 'week', label: '按周' },
    { id: 'month', label: '按月' },
    { id: 'quarter', label: '按季度' },
    { id: 'year', label: '按年' },
  ];

  /** 右侧标题随左侧快捷切换；锁定模式用对应文案 */
  const panelTitle = lockedMode
    ? ({ week: '按周', month: '按月', quarter: '按季度', year: '按年', range: '起止' } as const)[lockedMode]
    : modeButtons.find((item) => item.id === mode)?.label ?? '起止';

  /** 锁定模式下触发器展示已选周期标题（跨多单位时展示区间） */
  const lockedTriggerLabel = useMemo(() => {
    if (!lockedMode || lockedMode === 'range' || !startValue || !endValue) return null;
    const start = parseDateKey(startValue);
    const end = parseDateKey(endValue);
    if (!start || !end) return null;
    if (lockedMode === 'week') {
      const withYear = start.getFullYear() !== end.getFullYear();
      return joinUnitRangeLabel(formatWeekUnitLabel(start, withYear), formatWeekUnitLabel(end, withYear));
    }
    if (lockedMode === 'month') {
      return joinUnitRangeLabel(formatMonthUnitLabel(start), formatMonthUnitLabel(end));
    }
    if (lockedMode === 'quarter') {
      return joinUnitRangeLabel(formatQuarterUnitLabel(start), formatQuarterUnitLabel(end));
    }
    return joinUnitRangeLabel(formatYearUnitLabel(start), formatYearUnitLabel(end));
  }, [lockedMode, startValue, endValue]);

  const renderMonthPane = (
    monthDate: Date,
    cells: Date[],
    options: {
      showPrevYear?: boolean;
      showPrevMonth?: boolean;
      showNextYear?: boolean;
      showNextMonth?: boolean;
    }
  ) => (
    <div className="min-w-0 flex-1 px-2">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          {options.showPrevYear && (
            <button type="button" className="rounded p-1 text-slate-500 hover:bg-slate-100" onClick={() => shiftLeftYear(-1)}>
              <ChevronsLeft className="h-3.5 w-3.5" />
            </button>
          )}
          {options.showPrevMonth && (
            <button type="button" className="rounded p-1 text-slate-500 hover:bg-slate-100" onClick={() => shiftLeftMonth(-1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="text-xs font-semibold text-slate-700">
          {monthDate.getFullYear()}年{monthDate.getMonth() + 1}月
        </div>
        <div className="flex items-center gap-0.5">
          {options.showNextMonth && (
            <button
              type="button"
              disabled={!canNextMonth}
              className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
              onClick={() => shiftLeftMonth(1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
          {options.showNextYear && (
            <button
              type="button"
              disabled={!canNextYear}
              className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
              onClick={() => shiftLeftYear(1)}
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="mb-1 grid grid-cols-7">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1 text-center text-[11px] text-slate-400">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day) => {
          const key = toDateKey(day);
          const inMonth = day.getMonth() === monthDate.getMonth();
          const disabled = isAfterMax(key) || isOutsideSelectableSpan(key);
          const edge = !disabled && isDraftEdge(day);
          const inRange = !disabled && isInDraftRange(day);
          return (
            <button
              key={`${monthDate.getMonth()}-${key}`}
              type="button"
              disabled={disabled}
              onMouseEnter={() => !disabled && setHoverDay(key)}
              onMouseLeave={() => setHoverDay(null)}
              onClick={() => onPickRangeDay(day)}
              className={`relative h-8 text-xs transition ${
                disabled
                  ? 'cursor-not-allowed text-slate-200'
                  : edge
                    ? 'z-[1] rounded-full bg-[#409EFF] font-semibold text-white'
                    : inRange
                      ? 'bg-[#F2F6FC] text-[#409EFF]'
                      : inMonth
                        ? 'text-slate-700 hover:text-[#409EFF]'
                        : 'text-slate-300'
              }`}
            >
              {inRange && !edge && <span className="absolute inset-y-1 inset-x-0 bg-[#F2F6FC]" />}
              <span className="relative z-[1]">{day.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div ref={rootRef} className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <div
        className={`flex h-[34px] cursor-pointer items-center gap-1 rounded-lg border border-gray-300 bg-white pl-2 pr-2.5 shadow-2xs transition-all hover:border-gray-400 ${
          open ? 'border-[#1E5ABB] ring-2 ring-[#1E5ABB]/15' : ''
        } ${fullWidth ? 'w-full' : ''} ${readOnly ? 'bg-slate-50' : ''} ${className}`}
        title={readOnly ? `${title}（点击可自定义）` : title}
        onClick={openEditor}
      >
        {lockedMode && lockedTriggerLabel ? (
          <>
            <span className={`min-w-0 flex-1 truncate text-xs font-semibold ${readOnly ? 'text-slate-500' : 'text-gray-700'}`}>
              {lockedTriggerLabel}
            </span>
            <span className={`shrink-0 font-mono text-[11px] ${readOnly ? 'text-slate-400' : 'text-slate-500'}`}>
              {formatSlash(startValue)} 至 {formatSlash(endValue)}
            </span>
          </>
        ) : (
          <>
            <span className={`min-w-0 flex-1 truncate font-mono text-xs ${readOnly ? 'text-slate-500' : 'text-gray-700'}`}>
              {formatSlash(startValue)}
            </span>
            <span className="shrink-0 select-none text-xs text-gray-300">至</span>
            <span className={`min-w-0 flex-1 truncate font-mono text-xs ${readOnly ? 'text-slate-500' : 'text-gray-700'}`}>
              {formatSlash(endValue)}
            </span>
          </>
        )}
        <Calendar className="h-3.5 w-3.5 shrink-0 pointer-events-none text-gray-400" />
      </div>

      {open && showNaturalPresets && !readOnly && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex">
            {!lockedMode && (
            <div className="w-[88px] shrink-0 border-r border-slate-100 p-3">
              <div className="mb-2 text-[11px] font-semibold text-slate-500">快捷</div>
              <div className="flex flex-col gap-1.5">
                {modeButtons.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => switchMode(item.id)}
                    className={`rounded-lg border px-2.5 py-1.5 text-left text-xs font-semibold transition ${
                      mode === item.id
                        ? 'border-[#409EFF] bg-[#ECF5FF] text-[#409EFF]'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#A0CFFF] hover:bg-[#ECF5FF]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            )}

            <div className="min-w-0">
              {mode === 'range' && (
                <div className="w-[560px]">
                  <div className="border-b border-slate-100 px-3 pt-3">
                    <div className="mb-2 text-[11px] font-semibold text-slate-500">{panelTitle}</div>
                  </div>
                  <div className="flex border-b border-slate-100 py-3" onMouseLeave={() => setHoverDay(null)}>
                    {renderMonthPane(leftMonth, leftCells, {
                      showPrevYear: true,
                      showPrevMonth: true,
                    })}
                    <div className="w-px self-stretch bg-slate-100" />
                    {renderMonthPane(rightMonth, rightCells, {
                      showNextMonth: true,
                      showNextYear: true,
                    })}
                  </div>
                  {footerActions}
                </div>
              )}

              {mode === 'week' && (
                <div className="w-[480px]">
                  <div className="p-3 pb-2">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-slate-500">{panelTitle}</div>
                      <div className="flex items-center gap-1">
                        <button type="button" className="rounded-md p-1 text-slate-500 hover:bg-slate-100" onClick={() => setViewYear((y) => y - 1)}>
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[52px] text-center text-xs font-semibold text-slate-700">{viewYear}年</span>
                        <button
                          type="button"
                          disabled={viewYear >= maxMonthDate.getFullYear()}
                          className="rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                          onClick={() => setViewYear((y) => Math.min(y + 1, maxMonthDate.getFullYear()))}
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div ref={weekListRef} className="grid max-h-[240px] grid-cols-4 gap-2 overflow-y-auto pr-0.5">
                      {yearWeeks.map((week) => {
                        const disabled = isPeriodDisabled(week.start) || isOutsideSelectableSpan(week.start);
                        const edge = !disabled && isUnitDraftEdge(week.start, week.end);
                        const inRange = !disabled && isUnitInDraftRange(week.start, week.end);
                        const active = edge || (!unitRangeSelect && draftStart === week.start);
                        return (
                          <button
                            key={week.start}
                            ref={active || (inRange && week.start === draftStart) ? selectedWeekBtnRef : undefined}
                            type="button"
                            disabled={disabled}
                            title={week.label}
                            onClick={() => selectWeek(week.start, week.end)}
                            className={`rounded-lg border px-2 py-2.5 text-center text-xs font-semibold transition ${
                              disabled
                                ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
                                : active
                                  ? 'border-[#409EFF] bg-[#ECF5FF] text-[#409EFF]'
                                  : inRange
                                    ? 'border-[#A0CFFF] bg-[#F2F6FC] text-[#409EFF]'
                                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#A0CFFF] hover:bg-[#ECF5FF]'
                            }`}
                          >
                            第{week.weekNo}周
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {footerActions}
                </div>
              )}

              {mode === 'month' && (
                <div className="w-[320px]">
                  <div className="p-3 pb-2">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-slate-500">{panelTitle}</div>
                      <div className="flex items-center gap-1">
                        <button type="button" className="rounded-md p-1 text-slate-500 hover:bg-slate-100" onClick={() => setViewYear((y) => y - 1)}>
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[52px] text-center text-xs font-semibold text-slate-700">{viewYear}年</span>
                        <button
                          type="button"
                          disabled={viewYear >= maxMonthDate.getFullYear()}
                          className="rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                          onClick={() => setViewYear((y) => Math.min(y + 1, maxMonthDate.getFullYear()))}
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 12 }, (_, monthIndex) => {
                        const startKey = toDateKey(new Date(viewYear, monthIndex, 1));
                        const endKey = toDateKey(new Date(viewYear, monthIndex + 1, 0));
                        const disabled = isPeriodDisabled(startKey) || isOutsideSelectableSpan(startKey);
                        const edge = !disabled && isUnitDraftEdge(startKey, endKey);
                        const inRange = !disabled && isUnitInDraftRange(startKey, endKey);
                        const active = edge || (!unitRangeSelect && draftStart === startKey);
                        return (
                          <button
                            key={monthIndex}
                            type="button"
                            disabled={disabled}
                            onClick={() => selectMonth(monthIndex)}
                            className={`rounded-lg border px-2 py-2.5 text-xs font-semibold transition ${
                              disabled
                                ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
                                : active
                                  ? 'border-[#409EFF] bg-[#ECF5FF] text-[#409EFF]'
                                  : inRange
                                    ? 'border-[#A0CFFF] bg-[#F2F6FC] text-[#409EFF]'
                                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#A0CFFF] hover:bg-[#ECF5FF]'
                            }`}
                          >
                            {monthIndex + 1}月
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {footerActions}
                </div>
              )}

              {mode === 'quarter' && (
                <div className="w-[320px]">
                  <div className="p-3 pb-2">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-slate-500">{panelTitle}</div>
                      <div className="flex items-center gap-1">
                        <button type="button" className="rounded-md p-1 text-slate-500 hover:bg-slate-100" onClick={() => setViewYear((y) => y - 1)}>
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[52px] text-center text-xs font-semibold text-slate-700">{viewYear}年</span>
                        <button
                          type="button"
                          disabled={viewYear >= maxMonthDate.getFullYear()}
                          className="rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                          onClick={() => setViewYear((y) => Math.min(y + 1, maxMonthDate.getFullYear()))}
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {['一季度', '二季度', '三季度', '四季度'].map((label, quarterIndex) => {
                        const startMonth = quarterIndex * 3;
                        const startKey = toDateKey(new Date(viewYear, startMonth, 1));
                        const endKey = toDateKey(new Date(viewYear, startMonth + 3, 0));
                        const disabled = isPeriodDisabled(startKey) || isOutsideSelectableSpan(startKey);
                        const edge = !disabled && isUnitDraftEdge(startKey, endKey);
                        const inRange = !disabled && isUnitInDraftRange(startKey, endKey);
                        const active = edge || (!unitRangeSelect && draftStart === startKey);
                        return (
                          <button
                            key={label}
                            type="button"
                            disabled={disabled}
                            onClick={() => selectQuarter(quarterIndex)}
                            className={`rounded-lg border px-3 py-4 text-xs font-semibold transition ${
                              disabled
                                ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
                                : active
                                  ? 'border-[#409EFF] bg-[#ECF5FF] text-[#409EFF]'
                                  : inRange
                                    ? 'border-[#A0CFFF] bg-[#F2F6FC] text-[#409EFF]'
                                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#A0CFFF] hover:bg-[#ECF5FF]'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {footerActions}
                </div>
              )}

              {mode === 'year' && (
                <div className="w-[320px]">
                  <div className="p-3 pb-2">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-slate-500">{panelTitle}</div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                          onClick={() => setViewYear((y) => y - 10)}
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[88px] text-center text-xs font-semibold text-slate-700">
                          {decadeStart}-{decadeStart + 9}
                        </span>
                        <button
                          type="button"
                          disabled={decadeStart + 10 > maxMonthDate.getFullYear()}
                          className="rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                          onClick={() => setViewYear((y) => Math.min(y + 10, maxMonthDate.getFullYear()))}
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {decadeYears.map((year) => {
                        const startKey = `${year}-01-01`;
                        const endKey = `${year}-12-31`;
                        const disabled = isPeriodDisabled(startKey) || isOutsideSelectableSpan(startKey);
                        const edge = !disabled && isUnitDraftEdge(startKey, endKey);
                        const inRange = !disabled && isUnitInDraftRange(startKey, endKey);
                        const active = edge || (!unitRangeSelect && draftStart === startKey);
                        const outOfDecade = year < decadeStart || year > decadeStart + 9;
                        return (
                          <button
                            key={year}
                            type="button"
                            disabled={disabled}
                            onClick={() => selectYear(year)}
                            className={`rounded-lg border px-2 py-2.5 text-center text-xs font-semibold transition ${
                              disabled
                                ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
                                : active
                                  ? 'border-[#409EFF] bg-[#ECF5FF] text-[#409EFF]'
                                  : inRange
                                    ? 'border-[#A0CFFF] bg-[#F2F6FC] text-[#409EFF]'
                                  : outOfDecade
                                    ? 'border-slate-100 bg-white text-slate-400 hover:border-[#A0CFFF] hover:bg-[#ECF5FF]'
                                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#A0CFFF] hover:bg-[#ECF5FF]'
                            }`}
                          >
                            {year}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {footerActions}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const DateRangeField: React.FC<DateRangeFieldProps> = (props) => {
  if (props.variant === 'native') {
    return <NativeDateRangeField {...props} />;
  }
  return <PanelDateRangeField {...props} />;
};
