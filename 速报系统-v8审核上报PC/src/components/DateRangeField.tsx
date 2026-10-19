import React from 'react';
import { Calendar } from 'lucide-react';

export interface DateRangeFieldProps {
  startValue: string;
  endValue: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  /** 整个区间框的 title */
  title?: string;
  startTitle?: string;
  endTitle?: string;
  className?: string;
  /** 起止输入框额外 class（宽度等） */
  inputClassName?: string;
  /** 窄栏表单：输入框均分宽度 */
  fullWidth?: boolean;
}

const dateInputClass =
  'relative min-w-0 flex-1 h-full border-0 bg-transparent px-0.5 text-xs text-gray-700 focus:outline-none focus:ring-0 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0';

/**
 * 时间区间筛选：起止日期合并在同一框内操作（开始 至 结束 + 日历图标）
 */
export const DateRangeField: React.FC<DateRangeFieldProps> = ({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  title = '时间区间',
  startTitle = '开始日期',
  endTitle = '结束日期',
  className = '',
  inputClassName,
  fullWidth = false
}) => {
  const resolvedInputClass =
    inputClassName ?? (fullWidth ? 'min-w-0 flex-1' : 'w-[118px] flex-none');

  return (
    <div
      className={`flex items-center gap-1 h-[34px] pl-2 pr-2.5 rounded-lg border border-gray-300 bg-white shadow-2xs hover:border-gray-400 focus-within:border-[#1E5ABB] focus-within:ring-2 focus-within:ring-[#1E5ABB]/15 transition-all ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      title={title}
    >
      <input
        type="date"
        value={startValue}
        onChange={(e) => onStartChange(e.target.value)}
        title={startTitle}
        aria-label={startTitle}
        className={`${dateInputClass} ${resolvedInputClass}`}
      />
      <span className="text-gray-300 select-none shrink-0 text-xs">至</span>
      <input
        type="date"
        value={endValue}
        onChange={(e) => onEndChange(e.target.value)}
        title={endTitle}
        aria-label={endTitle}
        className={`${dateInputClass} ${resolvedInputClass}`}
      />
      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0 pointer-events-none" />
    </div>
  );
};
