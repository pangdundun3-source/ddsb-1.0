import React from 'react';
import { Sparkles, Copy, Loader2, CheckCircle2, CheckCheck } from 'lucide-react';
import { IdentificationTag } from '../types';
import { IDENTIFICATION_CONFIG } from '../utils/identification';

interface IdentificationBadgeProps {
  tag?: IdentificationTag;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
}

export const IdentificationBadge: React.FC<IdentificationBadgeProps> = ({
  tag,
  size = 'sm',
  className = '',
  showIcon = true,
}) => {
  if (!tag) return null;

  const config = IDENTIFICATION_CONFIG[tag];
  if (!config) return null;

  const sizeClass =
    size === 'xs'
      ? 'px-1.5 py-0.5 text-[9px] gap-0.5'
      : size === 'sm'
      ? 'px-2 py-0.5 text-[10px] gap-1'
      : 'px-2.5 py-1 text-[11px] gap-1';

  const iconClass =
    size === 'xs'
      ? 'w-2.5 h-2.5 shrink-0'
      : size === 'sm'
      ? 'w-3 h-3 shrink-0'
      : 'w-3.5 h-3.5 shrink-0';

  const renderIcon = () => {
    if (!showIcon) return null;
    switch (tag) {
      case 'suspected_first':
        return <Sparkles className={iconClass} />;
      case 'suspected_repeat':
        return <Copy className={iconClass} />;
      case 'identifying':
        return <Loader2 className={`${iconClass} animate-spin`} />;
      case 'official_first':
        return <CheckCircle2 className={iconClass} />;
      case 'official_repeat':
        return <CheckCheck className={iconClass} />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border font-semibold select-none leading-none ${config.badgeClass} ${sizeClass} ${className}`}
      title={config.summaryTitle}
    >
      {renderIcon()}
      <span className="whitespace-nowrap">{config.label}</span>
    </span>
  );
};
