import React from 'react';
import { IdentificationTag } from '../types';
import { IDENTIFICATION_CONFIG } from '../utils/identification';

interface IdentificationBadgeProps {
  tag?: IdentificationTag;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const IdentificationBadge: React.FC<IdentificationBadgeProps> = ({
  tag,
  size = 'sm',
  className = '',
}) => {
  if (!tag) return null;

  const config = IDENTIFICATION_CONFIG[tag];
  if (!config) return null;

  const sizeClass =
    size === 'xs'
      ? 'px-1.5 py-0.5 text-[9px]'
      : size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : 'px-2.5 py-1 text-[11px]';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border font-semibold select-none leading-none ${config.badgeClass} ${sizeClass} ${className}`}
      title={config.summaryTitle}
    >
      <span className="whitespace-nowrap">{config.label}</span>
    </span>
  );
};
