import React, { useState } from 'react';
import { SpeedReport, UserProfile } from '../types';
import { IdentificationBadge } from './IdentificationBadge';
import {
  CheckSquare,
  Search,
  ArrowRight,
  X,
} from 'lucide-react';

interface AuditViewProps {
  reports: SpeedReport[];
  user: UserProfile;
  onSelectReport: (report: SpeedReport) => void;
  onBatchApproveSameLocation?: (targetIds?: string[], score?: number, remarks?: string) => void;
  onBatchReject?: (ids: string[], reason: string) => void;
  onResetDemoData?: () => void;
  showAllStatuses?: boolean;
  onToast?: (msg: string) => void;
}

const TRANSFER_STATUSES = new Set(['pending_transfer', 'transferred']);

const isTransferRelatedReport = (report: SpeedReport) =>
  TRANSFER_STATUSES.has(report.status) || Boolean(report.transferredDept);

const formatAuditDuration = (minutes: number) => {
  const formatNumber = (value: number) => {
    const rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
  };
  const hours = minutes / 60;
  if (hours < 24) {
    return `${formatNumber(hours)} h`;
  }
  const days = hours / 24;
  if (days < 7) {
    return `${formatNumber(days)} 天`;
  }
  return `${formatNumber(days / 7)} 周`;
};

export const AuditView: React.FC<AuditViewProps> = ({
  reports,
  onSelectReport,
  onResetDemoData,
  showAllStatuses = false,
}) => {
  const [activeFilter, setActiveFilter] = useState<'pending' | 'completed' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter out drafts and transfer-related reports.
  const auditReports = reports.filter((r) => r.status !== 'draft' && !isTransferRelatedReport(r));

  // Filter pending reports (strictly pending_audit - 刚提交且还没有人审核)
  const pendingReports = auditReports.filter((r) => r.status === 'pending_audit');
  const rejectedReports = auditReports.filter((r) => r.status === 'rejected');
  const completedReports = auditReports.filter((r) => r.status === 'approved');

  const filteredReports = auditReports.filter((r) => {
    if (!showAllStatuses) {
      return r.status === 'pending_audit';
    }
    if (activeFilter === 'pending') {
      return r.status === 'pending_audit';
    }
    if (activeFilter === 'completed') {
      return r.status === 'approved';
    }
    if (activeFilter === 'rejected') {
      return r.status === 'rejected';
    }
    return r.status === 'pending_audit';
  }).filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.author.toLowerCase().includes(q) ||
      r.authorDept.toLowerCase().includes(q)
    );
  });

  const getElapsedMinutes = (report: SpeedReport) => {
    const cTime = new Date(report.createTime.replace(' ', 'T')).getTime();
    const uTime = new Date(report.updateTime.replace(' ', 'T')).getTime();
    if (isNaN(cTime) || isNaN(uTime) || uTime < cTime) return 0;
    return (uTime - cTime) / (1000 * 60);
  };
  const auditPendingCount = reports.filter((r) => r.status === 'pending_audit').length;
  const auditAuditingCount = reports.filter((r) => r.status === 'auditing').length;
  const auditApprovedCount = reports.filter((r) => r.status === 'approved').length;
  const auditRejectedCount = reports.filter((r) => r.status === 'rejected').length;
  const auditHandledCount = auditApprovedCount + auditRejectedCount;
  const auditTotalCount = auditHandledCount + auditPendingCount + auditAuditingCount;
  const auditProcessRate = auditTotalCount > 0 ? Math.round((auditHandledCount / auditTotalCount) * 100) : 0;
  const auditHandledReports = reports.filter((r) => r.status === 'approved' || r.status === 'rejected');
  const auditAvgResponseMinutes =
    auditHandledReports.length > 0
      ? Math.round(
          (auditHandledReports.reduce((total, report) => total + getElapsedMinutes(report), 0) /
            auditHandledReports.length) *
            10
        ) / 10
      : 0;
  const auditAvgResponseTimeStr = formatAuditDuration(auditAvgResponseMinutes);

  React.useEffect(() => {
    setActiveFilter('pending');
  }, [showAllStatuses]);

  const getStatusBadge = (report: SpeedReport) => {
    switch (report.status) {
      case 'pending_audit':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
            待审核
          </span>
        );
      case 'pending_transfer':
        return null;
      case 'auditing':
        return (
          <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold">
            审核中
          </span>
        );
      case 'approved':
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
            已通过
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[10px] font-bold">
            已驳回
          </span>
        );
      case 'transferred':
        return null;
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
            处理中
          </span>
        );
    }
  };

  return (
    <div className="flex-1 p-3 space-y-3 overflow-y-auto relative">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 p-2.5 space-y-2 overflow-hidden shadow-md shadow-blue-500/20 text-white relative">
        <div className="absolute -right-7 -top-10 w-28 h-28 rounded-full border border-white/20" />
        <div className="absolute right-10 -bottom-12 w-24 h-24 rounded-full bg-white/10" />
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <h2 className="text-xs font-extrabold truncate">【审核员】审核数据统计</h2>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-[1fr_1fr_1fr_1.25fr] gap-1.5">
          <div className="rounded-xl bg-white/15 border border-white/20 p-2 min-w-0 overflow-hidden">
            <p className="text-[9px] text-slate-200 font-bold truncate">审核待办</p>
            <p className="text-xl leading-none font-black font-mono text-amber-300 mt-1.5">{auditPendingCount}</p>
            <p className="text-[8px] text-slate-300 truncate mt-1.5">待审核</p>
          </div>
          <div className="rounded-xl bg-white/15 border border-white/20 p-2 min-w-0 overflow-hidden">
            <p className="text-[9px] text-slate-200 font-bold truncate">累计审核</p>
            <p className="text-xl leading-none font-black font-mono text-white mt-1.5">{auditHandledCount}</p>
            <div className="mt-1.5 flex items-center gap-1.5 text-[8px] leading-none">
              <p className="truncate text-emerald-300">
                通过: <span>{auditApprovedCount}</span>
              </p>
              <p className="truncate text-rose-300">
                驳回: <span>{auditRejectedCount}</span>
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-white/15 border border-white/20 p-2 min-w-0 overflow-hidden">
            <p className="text-[9px] text-slate-200 font-bold truncate">审核处理率</p>
            <p className="text-lg leading-none font-black font-mono text-white mt-1.5">{auditProcessRate}%</p>
            <p className="text-[8px] text-slate-300 truncate mt-1.5">{auditHandledCount}/{auditTotalCount}</p>
          </div>
          <div className="rounded-xl bg-white/15 border border-white/20 p-2 min-w-0 overflow-hidden">
            <p className="text-[9px] text-slate-200 font-bold truncate">平均响应</p>
            <p className="text-[15px] leading-none font-black font-mono text-cyan-300 mt-1.5 whitespace-nowrap">
              {auditAvgResponseTimeStr}
            </p>
            <p className="text-[8px] text-slate-300 truncate mt-1.5">审核耗时</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      {showAllStatuses && (
      <div className="grid grid-cols-3 gap-1.5 text-[11px]">
        <button
          onClick={() => {
            setActiveFilter('pending');
            setShowBatchGroups(false);
          }}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-all text-center ${
            activeFilter === 'pending'
              ? 'bg-blue-600 text-white font-semibold shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          待审核 ({pendingReports.length})
        </button>

        <button
          onClick={() => {
            setActiveFilter('completed');
            setShowBatchGroups(false);
          }}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-all text-center ${
            activeFilter === 'completed'
              ? 'bg-blue-600 text-white font-semibold shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          已通过 ({completedReports.length})
        </button>

        <button
          onClick={() => {
            setActiveFilter('rejected');
            setShowBatchGroups(false);
          }}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-all text-center ${
            activeFilter === 'rejected'
              ? 'bg-blue-600 text-white font-semibold shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          已驳回 ({rejectedReports.length})
        </button>
      </div>
      )}

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索上报标题、上报人姓名、下级机构"
          className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Audit List */}
      <div className="space-y-2.5 pb-4 min-h-[280px]">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-slate-500 border border-slate-200 space-y-3">
            <CheckSquare className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
            <div>
              <p className="text-xs font-bold text-slate-700">暂无符合条件的速报项</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                您可以刷新页面或点击下方按钮恢复初始待审核测试数据
              </p>
            </div>
            {onResetDemoData && (
              <button
                onClick={onResetDemoData}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center space-x-1.5"
              >
                <span>恢复系统初始实验数据</span>
              </button>
            )}
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => onSelectReport(report)}
              className="bg-white rounded-xl p-3.5 shadow-2xs border border-slate-200 hover:border-blue-300 active:bg-slate-50 transition-all cursor-pointer space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2 flex-1">
                  {report.title}
                </h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  {report.identificationTag && (
                    <IdentificationBadge tag={report.identificationTag} size="xs" />
                  )}
                  {getStatusBadge(report)}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                {report.summary}
              </p>

              <div className="pt-1 border-t border-slate-100 flex items-center justify-between gap-2 overflow-hidden whitespace-nowrap">
                <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-[10px] text-slate-600 whitespace-nowrap">
                  <span className="font-medium text-slate-700 truncate">{report.authorDept}</span>
                  <span className="text-slate-300 shrink-0">·</span>
                  <span className="font-medium text-slate-700 shrink-0">{report.author}</span>
                  <span className="text-slate-300 shrink-0">·</span>
                  <span className="font-mono font-medium text-slate-700 shrink-0">{report.createTime}</span>
                </div>
                <span className="shrink-0 text-blue-600 font-medium flex items-center text-[10px] whitespace-nowrap">
                  详情 <ArrowRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          ))
        )}
        <p className="text-center text-[10px] text-slate-400 py-2">
          默认显示近三个月的数据
        </p>
      </div>

    </div>
  );
};
