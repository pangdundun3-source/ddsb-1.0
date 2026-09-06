import React from 'react';
import { Sparkles, Copy, Loader2, CheckCircle2, Layers } from 'lucide-react';
import { OriginTypeLabel } from '../types';

export function getEffectiveOriginLabel(
  label?: OriginTypeLabel,
  auditStatus?: string
): OriginTypeLabel | undefined {
  if (auditStatus === '草稿') return undefined;

  const isPostAdoption = ['已通过', '已采纳', '已转办', '待转办'].includes(auditStatus || '');

  if (label) {
    if (isPostAdoption) {
      if (label === '疑似首发' || label === '识别中' || label === '预判') return '首发';
      if (label === '疑似重复') return '重复';
      return label;
    } else {
      // 待审核、审核中、被驳回 / 已驳回
      if (label === '首发') return '疑似首发';
      if (label === '重复') return '疑似重复';
      return label;
    }
  }

  if (auditStatus) {
    if (isPostAdoption) return '首发';
    return '疑似首发';
  }

  return undefined;
}

interface ReportOriginBadgeProps {
  label?: OriginTypeLabel;
  report?: {
    originLabel?: OriginTypeLabel;
    auditStatus?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  fullText?: boolean;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export const ReportOriginBadge: React.FC<ReportOriginBadgeProps> = ({
  label,
  report,
  size = 'md',
  showIcon = true,
  fullText = false,
  className = '',
  interactive = false,
  onClick
}) => {
  const activeLabel = report ? getEffectiveOriginLabel(report.originLabel, report.auditStatus) : label;
  if (!activeLabel) return null;

  // Determine display text
  let displayText = activeLabel;
  if (fullText) {
    if (activeLabel === '首发') displayText = '首发报送';
    if (activeLabel === '重复') displayText = '重复报送';
  }

  // Size styles
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-[11px] px-2 py-0.5 gap-1',
    lg: 'text-xs px-2.5 py-1 gap-1.5 font-bold'
  }[size];

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5'
  }[size];

  // Specific style configurations according to requirements
  switch (activeLabel) {
    case '疑似首发':
      return (
        <span
          id={`origin-badge-${activeLabel}`}
          onClick={onClick}
          className={`inline-flex items-center font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-300/90 shadow-2xs ${sizeClasses} ${
            interactive ? 'cursor-pointer hover:bg-blue-100 transition-colors' : ''
          } ${className}`}
          title="系统预判：疑似首发（审核过程标识，待最终审核通过定标）"
        >
          {showIcon && <Sparkles className={`${iconSizes} text-blue-600 shrink-0`} />}
          <span className="whitespace-nowrap">{displayText}</span>
        </span>
      );

    case '疑似重复':
      return (
        <span
          id={`origin-badge-${activeLabel}`}
          onClick={onClick}
          className={`inline-flex items-center font-semibold rounded-md bg-orange-50 text-orange-700 border border-orange-300/90 shadow-2xs ${sizeClasses} ${
            interactive ? 'cursor-pointer hover:bg-orange-100 transition-colors' : ''
          } ${className}`}
          title="系统预判：疑似重复（已比对到相似线索或同源地址）"
        >
          {showIcon && <Copy className={`${iconSizes} text-orange-600 shrink-0`} />}
          <span className="whitespace-nowrap">{displayText}</span>
        </span>
      );

    case '识别中':
      return (
        <span
          id={`origin-badge-${activeLabel}`}
          onClick={onClick}
          className={`inline-flex items-center font-semibold rounded-md bg-purple-50 text-purple-700 border border-purple-300/80 shadow-2xs ${sizeClasses} ${
            interactive ? 'cursor-pointer hover:bg-purple-100 transition-colors' : ''
          } ${className}`}
          title="系统智能识别预判中：正在自动比对不良信息库与在审数据..."
        >
          {showIcon && <Loader2 className={`${iconSizes} text-purple-600 animate-spin shrink-0`} />}
          <span className="whitespace-nowrap">{displayText}</span>
        </span>
      );

    case '预判':
      return (
        <span
          id={`origin-badge-${activeLabel}`}
          onClick={onClick}
          className={`inline-flex items-center font-semibold rounded-md bg-purple-50 text-purple-700 border border-purple-300/80 shadow-2xs ${sizeClasses} ${
            interactive ? 'cursor-pointer hover:bg-purple-100 transition-colors' : ''
          } ${className}`}
          title="系统智能预判状态（审核中过程标识，终审通过后正式定标）"
        >
          {showIcon && <Sparkles className={`${iconSizes} text-purple-600 shrink-0`} />}
          <span className="whitespace-nowrap">{displayText}</span>
        </span>
      );

    case '首发':
      return (
        <span
          id={`origin-badge-${activeLabel}`}
          onClick={onClick}
          className={`inline-flex items-center font-bold rounded-md bg-blue-600 text-white border border-blue-700 shadow-2xs ${sizeClasses} ${
            interactive ? 'cursor-pointer hover:bg-blue-700 transition-colors' : ''
          } ${className}`}
          title="正式定标：首发报送（已通过终审并正式归档）"
        >
          {showIcon && <CheckCircle2 className={`${iconSizes} text-white shrink-0`} />}
          <span className="whitespace-nowrap">{displayText}</span>
        </span>
      );

    case '重复':
      return (
        <span
          id={`origin-badge-${activeLabel}`}
          onClick={onClick}
          className={`inline-flex items-center font-bold rounded-md bg-orange-500 text-white border border-orange-600 shadow-2xs ${sizeClasses} ${
            interactive ? 'cursor-pointer hover:bg-orange-600 transition-colors' : ''
          } ${className}`}
          title="正式定标：重复报送（经核验为同源/重复信息）"
        >
          {showIcon && <Layers className={`${iconSizes} text-white shrink-0`} />}
          <span className="whitespace-nowrap">{displayText}</span>
        </span>
      );

    default:
      return null;
  }
};
