import React from 'react';
import { IdentificationStatus } from '../types';
import { Copy, Sparkles, Loader2, CircleDot, Layers } from 'lucide-react';

interface IdentificationBadgeProps {
  status?: IdentificationStatus | string | null;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
  title?: string;
}

export const IdentificationBadge: React.FC<IdentificationBadgeProps> = ({
  status,
  size = 'sm',
  showIcon = true,
  className = '',
  title
}) => {
  if (!status) return null;

  const normalized = status.trim();

  // 区分 预判状态 与 终审正式定标状态
  const isFormalFirst = normalized === '首发' || normalized === '首发报送';
  const isFormalDuplicate = normalized === '重复' || normalized === '重复报送';
  const isSuspectedFirst = normalized === '疑似首发';
  const isSuspectedDuplicate = normalized === '疑似重复' || normalized === '疑似重复识别';
  const isAnalyzing = normalized === '识别中' || normalized === '正在识别' || normalized === '比对中';
  const isPredicting = normalized === '预判' || normalized === '智能预判';

  // Size styling - 优化内边距与留白，避免字框紧挨
  let sizeClasses = 'text-[11px] px-2.5 py-0.5 rounded-[5px] gap-1.5';
  let iconSizeClass = 'w-3 h-3';
  if (size === 'xs') {
    sizeClasses = 'text-[10px] px-2 py-0.5 rounded-[4px] gap-1';
    iconSizeClass = 'w-2.5 h-2.5';
  } else if (size === 'md') {
    sizeClasses = 'text-xs px-3 py-1 rounded-md gap-1.5 font-bold';
    iconSizeClass = 'w-3.5 h-3.5';
  }

  let badgeStyle = '';
  let defaultTitle = '';
  let iconElement: React.ReactNode = null;

  if (isFormalFirst) {
    // 正式状态：首发（实心深蓝背景、白色文字与靶圆图标）
    badgeStyle = 'bg-[#185BEB] text-white font-bold shadow-2xs';
    defaultTitle = '经审核正式定标：首发';
    iconElement = <CircleDot className={`${iconSizeClass} shrink-0 text-white stroke-[2.2]`} />;
  } else if (isFormalDuplicate) {
    // 正式状态：重复（实心橙红背景、白色文字与图层图标）
    badgeStyle = 'bg-[#F95700] text-white font-bold shadow-2xs';
    defaultTitle = '经审核正式定标：重复';
    iconElement = <Layers className={`${iconSizeClass} shrink-0 text-white stroke-[2.2]`} />;
  } else if (isSuspectedDuplicate) {
    // 疑似重复：浅橙背景、橙色线框、橙色复制图标与文字，增加内间距
    badgeStyle = 'bg-[#FFF9F2] text-[#C2410C] border border-[#FB923C] font-semibold';
    defaultTitle = '系统研判：疑似重复事件';
    iconElement = <Copy className={`${iconSizeClass} shrink-0 text-[#EA580C] stroke-[1.8]`} />;
  } else if (isSuspectedFirst) {
    // 疑似首发：浅蓝背景、浅蓝线框、蓝色星芒图标与文字，增加内间距
    badgeStyle = 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#93C5FD] font-semibold';
    defaultTitle = '系统研判：疑似首发事件';
    iconElement = <Sparkles className={`${iconSizeClass} shrink-0 text-[#2563EB] stroke-[1.8]`} />;
  } else if (isAnalyzing) {
    // 识别中（紫色标识）：浅紫背景、浅紫线框、紫色旋转加载图标与文字
    badgeStyle = 'bg-[#FAF5FF] text-[#9333EA] border border-[#D8B4FE] font-semibold';
    defaultTitle = '系统识别计算中...';
    iconElement = <Loader2 className={`${iconSizeClass} shrink-0 text-[#9333EA] animate-spin stroke-[2]`} />;
  } else if (isPredicting) {
    // 预判：浅紫背景、浅紫线框、紫色星芒
    badgeStyle = 'bg-[#FAF5FF] text-[#9333EA] border border-[#D8B4FE] font-semibold';
    defaultTitle = '系统预判中';
    iconElement = <Sparkles className={`${iconSizeClass} shrink-0 text-[#9333EA] stroke-[1.8]`} />;
  } else {
    badgeStyle = 'bg-gray-50 text-gray-700 border border-gray-200 font-medium';
    iconElement = <Sparkles className={`${iconSizeClass} shrink-0 text-gray-500`} />;
  }

  return (
    <span
      className={`inline-flex items-center leading-none shrink-0 transition-all select-none ${sizeClasses} ${badgeStyle} ${className}`}
      title={title || defaultTitle}
    >
      {showIcon && iconElement}
      <span className="tracking-normal whitespace-nowrap font-medium">{normalized}</span>
    </span>
  );
};
