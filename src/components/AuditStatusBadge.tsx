import React from 'react';
import { AuditStatus } from '../types';

interface AuditStatusBadgeProps {
  status: AuditStatus;
  className?: string;
}

const STATUS_STYLES: Record<AuditStatus, string> = {
  待审核: 'bg-amber-50 text-amber-700 border-amber-200',
  审核中: 'bg-blue-50 text-blue-700 border-blue-200',
  被驳回: 'bg-rose-50 text-rose-700 border-rose-200',
  已驳回: 'bg-rose-50 text-rose-700 border-rose-200',
  已通过: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  已采纳: 'bg-teal-50 text-teal-700 border-teal-200',
  待转办: 'bg-orange-50 text-orange-700 border-orange-200',
  已转办: 'bg-indigo-50 text-indigo-700 border-indigo-200'
};

const DOT_STYLES: Record<AuditStatus, string> = {
  待审核: 'bg-amber-500',
  审核中: 'bg-blue-500',
  被驳回: 'bg-rose-500',
  已驳回: 'bg-rose-500',
  已通过: 'bg-emerald-500',
  已采纳: 'bg-teal-500',
  待转办: 'bg-orange-500',
  已转办: 'bg-indigo-500'
};

export const getAuditStatusLabel = (status: AuditStatus) => (status === '被驳回' ? '已驳回' : status);

export const AuditStatusBadge: React.FC<AuditStatusBadgeProps> = ({ status, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold shadow-2xs ${STATUS_STYLES[status]} ${className}`}
  >
    <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[status]}`} />
    {getAuditStatusLabel(status)}
  </span>
);
