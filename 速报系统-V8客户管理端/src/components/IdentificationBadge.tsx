import React from 'react';
import { IdentificationStatus } from '../types';
import { Copy, Sparkles, Loader2, CheckCircle2, Layers } from 'lucide-react';

interface IdentificationBadgeProps {
  status?: IdentificationStatus | string | null;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
  title?: string;
}

/** 样式对齐审核上报 PC 端 ReportOriginBadge */
export const IdentificationBadge: React.FC<IdentificationBadgeProps> = ({
  status,
  size = 'sm',
  showIcon = true,
  className = '',
  title
}) => {
  if (!status) return null;

  const normalized = status.trim();

  const isFormalFirst = normalized === '首发' || normalized === '首发报送';
  const isFormalDuplicate = normalized === '重复' || normalized === '重复报送';
  const isSuspectedFirst = normalized === '疑似首发';
  const isSuspectedDuplicate = normalized === '疑似重复' || normalized === '疑似重复识别';
  const isAnalyzing = normalized === '识别中' || normalized === '正在识别' || normalized === '比对中';
  const isPredicting = normalized === '预判' || normalized === '智能预判';

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold',
  }[size];

  const iconSizeClass = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  }[size];

  let badgeStyle = '';
  let defaultTitle = '';
  let iconElement: React.ReactNode = null;
  let weightClass = 'font-semibold';

  if (isFormalFirst) {
    badgeStyle = 'bg-blue-600 text-white border border-blue-700 shadow-2xs';
    weightClass = 'font-bold';
    defaultTitle = '正式定标：首发报送（已通过终审并正式归档）';
    iconElement = <CheckCircle2 className={`${iconSizeClass} shrink-0 text-white`} />;
  } else if (isFormalDuplicate) {
    badgeStyle = 'bg-orange-500 text-white border border-orange-600 shadow-2xs';
    weightClass = 'font-bold';
    defaultTitle = '正式定标：重复报送（经核验为同源/重复信息）';
    iconElement = <Layers className={`${iconSizeClass} shrink-0 text-white`} />;
  } else if (isSuspectedDuplicate) {
    badgeStyle = 'bg-orange-50 text-orange-700 border border-orange-300/90 shadow-2xs';
    defaultTitle = '智能识别：疑似重复（已比对到相似线索或同源地址）';
    iconElement = <Copy className={`${iconSizeClass} shrink-0 text-orange-600`} />;
  } else if (isSuspectedFirst) {
    badgeStyle = 'bg-blue-50 text-blue-700 border border-blue-300/90 shadow-2xs';
    defaultTitle = '智能识别：疑似首发（审核过程标识，待最终审核通过定标）';
    iconElement = <Sparkles className={`${iconSizeClass} shrink-0 text-blue-600`} />;
  } else if (isAnalyzing || isPredicting) {
    badgeStyle = 'bg-purple-50 text-purple-700 border border-purple-300/80 shadow-2xs';
    defaultTitle = isAnalyzing
      ? '系统智能识别中：正在自动比对不良信息库与在审数据...'
      : '系统预判中';
    iconElement = isAnalyzing ? (
      <Loader2 className={`${iconSizeClass} shrink-0 text-purple-600 animate-spin`} />
    ) : (
      <Sparkles className={`${iconSizeClass} shrink-0 text-purple-600`} />
    );
  } else {
    badgeStyle = 'bg-gray-50 text-gray-700 border border-gray-200 shadow-2xs';
    weightClass = 'font-medium';
    iconElement = <Sparkles className={`${iconSizeClass} shrink-0 text-gray-500`} />;
  }

  return (
    <span
      className={`inline-flex items-center rounded-md leading-none shrink-0 select-none ${weightClass} ${sizeClasses} ${badgeStyle} ${className}`}
      title={title || defaultTitle}
    >
      {showIcon && iconElement}
      <span className="whitespace-nowrap">{normalized}</span>
    </span>
  );
};
