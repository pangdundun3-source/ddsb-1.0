import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { SpeedReport, UserProfile } from '../types';
import { IdentificationBadge } from './IdentificationBadge';
import {
  CheckSquare,
  CheckCircle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertCircle,
  Layers,
  Filter,
  Search,
  ArrowRight,
  Link as LinkIcon,
  MapPin,
  X,
  Send,
  Check,
} from 'lucide-react';

interface AuditViewProps {
  reports: SpeedReport[];
  user: UserProfile;
  onSelectReport: (report: SpeedReport) => void;
  onBatchApproveSameLocation: (targetIds?: string[], score?: number, remarks?: string) => void;
  onBatchReject?: (ids: string[], reason: string) => void;
  onResetDemoData?: () => void;
  showAllStatuses?: boolean;
  onToast: (msg: string) => void;
}

const TRANSFER_STATUSES = new Set(['pending_transfer', 'transferred']);

const isTransferRelatedReport = (report: SpeedReport) =>
  TRANSFER_STATUSES.has(report.status) || Boolean(report.transferredDept);

const getLinkHost = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0] || url;
  }
};

const getLinkHeroImage = (url: string) => {
  if (url.includes('water')) {
    return 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80';
  }
  if (url.includes('douyin') || url.includes('video')) {
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80';
  }
  if (url.includes('road')) {
    return 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=80';
  }
  return 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80';
};

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
  user,
  onSelectReport,
  onBatchApproveSameLocation,
  onBatchReject,
  onResetDemoData,
  showAllStatuses = false,
  onToast,
}) => {
  const [activeFilter, setActiveFilter] = useState<'pending' | 'audited' | 'completed'>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showBatchGroups, setShowBatchGroups] = useState<boolean>(false);

  // Batch Audit Modal State
  const [batchModalData, setBatchModalData] = useState<{
    key: string;
    isUrl: boolean;
    reports: SpeedReport[];
  } | null>(null);
  const [linkPreviewData, setLinkPreviewData] = useState<{
    key: string;
    reports: SpeedReport[];
  } | null>(null);

  const [batchSheetMode, setBatchSheetMode] = useState<'approve' | 'reject' | null>(null);
  const [batchApproveRemarks, setBatchApproveRemarks] = useState<string>('');
  const [batchRejectCategory, setBatchRejectCategory] = useState<string>('内容重复/同源');
  const [batchRejectDetail, setBatchRejectDetail] = useState<string>(
    '属于相同来源链接/同地址重复表达，要素存在遗漏，批量予以驳回。'
  );
  const phoneScreen = typeof document !== 'undefined' ? document.getElementById('wechat-phone-screen') : null;
  const batchModalPortalTarget = typeof document !== 'undefined' ? phoneScreen ?? document.body : null;

  // Filter out drafts and transfer-related reports.
  const auditReports = reports.filter((r) => r.status !== 'draft' && !isTransferRelatedReport(r));

  // Filter pending reports (strictly pending_audit)
  const pendingReports = auditReports.filter((r) => r.status === 'pending_audit');

  // Filter audited reports (reviewing or rejected)
  const auditedReports = auditReports.filter((r) => r.status === 'auditing' || r.status === 'rejected');
  const rejectedReports = auditReports.filter((r) => r.status === 'rejected');
  const completedReports = auditReports.filter((r) => r.status === 'approved');

  const filteredReports = auditReports.filter((r) => {
    if (!showAllStatuses) {
      return r.status === 'pending_audit';
    }
    if (activeFilter === 'pending') {
      return r.status === 'pending_audit';
    }
    if (activeFilter === 'audited') {
      return r.status === 'auditing' || r.status === 'rejected';
    }
    if (activeFilter === 'completed') {
      return r.status === 'approved';
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
  const auditApprovedCount = reports.filter((r) => r.status === 'approved').length;
  const auditRejectedCount = reports.filter((r) => r.status === 'rejected').length;
  const auditHandledCount = auditApprovedCount + auditRejectedCount;
  const auditTotalCount = auditHandledCount + auditPendingCount;
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
    setShowBatchGroups(false);
  }, [showAllStatuses]);

  // Group current visible pending reports by matchedLink or address.
  const sameLinkGroups: { [key: string]: SpeedReport[] } = {};
  filteredReports
    .filter((r) => r.status === 'pending_audit')
    .forEach((r) => {
      const key = r.matchedLink || r.address || '';
      if (key) {
        if (!sameLinkGroups[key]) {
          sameLinkGroups[key] = [];
        }
        sameLinkGroups[key].push(r);
      }
    });

  // Filter groups with at least 2 reports or flagged same location.
  const multiReportGroups = Object.entries(sameLinkGroups).filter(
    ([_, group]) => group.length >= 2 || group.some((r) => r.isSameLocationGroup)
  );

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
            已通过
          </span>
        );
      case 'approved':
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
            已采纳
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

  const handleOpenBatchModal = (key: string, isUrl: boolean, group: SpeedReport[]) => {
    setBatchModalData({ key, isUrl, reports: group });
    setBatchSheetMode(null);
    setBatchApproveRemarks('');
    setBatchRejectCategory('内容重复/同源');
    setBatchRejectDetail('属于相同来源链接/同地址重复表达，要素存在遗漏，批量予以驳回。');
  };

  const handleSubmitBatchAudit = (decision: 'approve' | 'reject') => {
    if (!batchModalData) return;
    const ids = batchModalData.reports.map((r) => r.id);

    if (decision === 'approve') {
      onBatchApproveSameLocation(ids, undefined, batchApproveRemarks);
    } else {
      const fullReason = `[${batchRejectCategory}] ${batchRejectDetail}`;
      if (onBatchReject) {
        onBatchReject(ids, fullReason);
      } else {
        onToast(`已批量驳回 ${ids.length} 条速报`);
      }
    }
    setBatchSheetMode(null);
    setBatchModalData(null);
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
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          待审核 ({pendingReports.length})
        </button>

        <button
          onClick={() => {
            setActiveFilter('audited');
            setShowBatchGroups(false);
          }}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-all text-center ${
            activeFilter === 'audited'
              ? 'bg-blue-600 text-white font-semibold shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          已审核 ({auditedReports.length})
        </button>

        <button
          onClick={() => {
            setActiveFilter('completed');
            setShowBatchGroups(false);
          }}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-all text-center ${
            activeFilter === 'completed'
              ? 'bg-blue-600 text-white font-semibold shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          已采纳 ({completedReports.length})
        </button>
      </div>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowBatchGroups(false);
            }}
            placeholder="搜索上报标题、上报人姓名、下级机构"
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setShowBatchGroups(false);
              }}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            if (showBatchGroups) {
              setShowBatchGroups(false);
              return;
            }
            if (multiReportGroups.length === 0) {
              setShowBatchGroups(false);
              onToast('当前列表暂无可批量匹配的同地址/同链接数据');
              return;
            }
            setShowBatchGroups(true);
          }}
          className="h-9 px-3 bg-white border border-amber-200 hover:bg-amber-50 active:bg-amber-100 rounded-xl text-[11px] font-bold text-amber-800 shadow-2xs flex items-center justify-center gap-1.5 transition-all shrink-0"
        >
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          <span>{showBatchGroups ? '取消匹配' : '批量匹配'}</span>
        </button>
      </div>

      {/* Same Address / Same Link Batch Approval Banner */}
      {showBatchGroups && multiReportGroups.map(([key, group], idx) => {
        const isUrl = key.startsWith('http://') || key.startsWith('https://');

        return (
          <div
            key={idx}
            className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-3 space-y-2 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="p-1 bg-amber-500 text-white rounded-lg">
                  {isUrl ? <LinkIcon className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                </span>
                <div>
                  <div className="text-xs font-bold text-amber-950 flex items-center space-x-1">
                    <span>相同上报链接</span>
                    <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-full font-mono text-[10px] font-bold">
                      {group.length}条关联
                    </span>
                  </div>
                  {isUrl ? (
                    <button
                      type="button"
                      onClick={() => setLinkPreviewData({ key, reports: group })}
                      className="block text-[10px] text-amber-800 hover:text-amber-950 active:text-amber-950 font-mono truncate max-w-[190px] pt-0.5 underline decoration-amber-400/70 underline-offset-2 text-left"
                    >
                      链接: {key}
                    </button>
                  ) : (
                    <p className="text-[10px] text-amber-800 font-mono truncate max-w-[190px] pt-0.5">
                      地址: {key}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleOpenBatchModal(key, isUrl, group)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center space-x-1"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>批量审核</span>
                </button>
              </div>
            </div>

            {/* List included reports in this group */}
            <div className="bg-white/80 rounded-xl p-2 space-y-1 text-[11px] text-slate-700 border border-amber-100">
              {group.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-0.5">
                  <button
                    type="button"
                    onClick={() => onSelectReport(r)}
                    className="truncate max-w-[210px] text-left font-semibold text-blue-700 hover:text-blue-800 active:text-blue-900 cursor-pointer"
                  >
                    • {r.title}
                  </button>
                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    <span className="max-w-[128px] truncate text-[10px] text-slate-400 font-mono">
                      {r.authorDept} · {r.author}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

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

      {/* Batch Audit Operation Popup Modal (Adapted for Mobile Simulator) */}
      {batchModalData && batchModalPortalTarget && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setBatchModalData(null);
          }}
          className="absolute inset-0 bg-slate-900/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-3 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90%] sm:max-h-[88%] border border-slate-100 animate-in slide-in-from-bottom duration-250 relative">
            {/* Modal Drag Handle for Mobile */}
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-white/20 rounded-xl">
                  <Layers className="w-4 h-4 text-white" />
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold leading-none">批量审核</h3>
                </div>
              </div>
              <button
                onClick={() => setBatchModalData(null)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Content Body */}
            <div className="p-3.5 space-y-3 overflow-y-auto text-xs flex-1">
              {/* Matched Source Info Card */}
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 space-y-2 text-amber-900">
                <div className="flex items-center space-x-1 font-bold text-amber-950 text-[11px] min-w-0 whitespace-nowrap">
                  {batchModalData.isUrl ? (
                    <LinkIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  )}
                  <span className="shrink-0">
                    相同{batchModalData.isUrl ? '上报链接' : '地理位置'}:
                  </span>
                  <span className="font-mono text-amber-800 truncate min-w-0">{batchModalData.key}</span>
                </div>
                <p className="text-[10px] text-amber-700">
                  统一处理下列 {batchModalData.reports.length} 条由不同网格员提交的相关速报：
                </p>

                <div className="space-y-1 max-h-[110px] overflow-y-auto">
                  {batchModalData.reports.map((r, i) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between bg-white/90 p-1.5 rounded-lg border border-amber-100 text-[11px]"
                    >
                      <div className="flex items-center gap-1.5 min-w-0 max-w-[210px]">
                        {r.identificationTag && (
                          <IdentificationBadge tag={r.identificationTag} size="xs" />
                        )}
                        <span className="font-semibold text-slate-800 truncate">
                          {i + 1}. {r.title}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono shrink-0 ml-1 max-w-[118px] truncate">
                        {r.authorDept} · {r.author}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {batchSheetMode && (
                <div
                  className={`space-y-3 rounded-2xl border p-3.5 ${
                    batchSheetMode === 'approve'
                      ? 'bg-emerald-50/60 border-emerald-100'
                      : 'bg-red-50/60 border-red-100'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center space-x-1.5">
                      {batchSheetMode === 'approve' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-xs font-bold text-slate-900">
                        {batchSheetMode === 'approve'
                          ? '审核通过'
                          : '驳回重修'}
                      </span>
                    </div>
                  </div>

                  {batchSheetMode === 'approve' ? (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 text-[11px] leading-relaxed text-emerald-800">
                      确认后将批量审核通过并进入下一处理节点。
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                          驳回原因
                        </label>
                        <select
                          value={batchRejectCategory}
                          onChange={(e) => setBatchRejectCategory(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-red-500"
                        >
                          <option value="内容重复/同源">内容重复/同源</option>
                          <option value="信息不完整">信息不完整</option>
                          <option value="事实核对不符">事实核对不符</option>
                          <option value="不属于本网格/部门">不属于本网格/部门</option>
                          <option value="需要补充佐证材料">需要补充佐证材料</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                          详细驳回意见及修改指引
                        </label>
                        <textarea
                          rows={3}
                          value={batchRejectDetail}
                          onChange={(e) => setBatchRejectDetail(e.target.value)}
                          placeholder="请输入具体的驳回理由与修改指示..."
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-red-500 resize-none"
                        />
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Modal Footer Actions */}
            <div className="p-3 bg-white border-t border-slate-200 grid grid-cols-2 gap-2 shrink-0 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  if (batchSheetMode === 'reject') {
                    handleSubmitBatchAudit('reject');
                    return;
                  }
                  setBatchSheetMode('reject');
                }}
                className={`py-3 px-4 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all active:scale-[0.99] ${
                  batchSheetMode === 'approve'
                    ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                    : 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-md'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>
                  {batchSheetMode === 'reject'
                    ? `确认驳回（${batchModalData.reports.length}条）`
                    : batchSheetMode === 'approve'
                      ? '改为驳回'
                      : `选择驳回（${batchModalData.reports.length}条）`}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (batchSheetMode === 'approve') {
                    handleSubmitBatchAudit('approve');
                    return;
                  }
                  setBatchSheetMode('approve');
                }}
                className={`py-3 px-4 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all active:scale-[0.99] ${
                  batchSheetMode === 'reject'
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {batchSheetMode === 'approve'
                    ? `确认通过（${batchModalData.reports.length}条）`
                    : batchSheetMode === 'reject'
                      ? '改为通过'
                      : `选择通过（${batchModalData.reports.length}条）`}
                </span>
              </button>
            </div>
          </div>
        </div>,
        batchModalPortalTarget
      )}
      {linkPreviewData && batchModalPortalTarget && createPortal(
        <div
          className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setLinkPreviewData(null)}
        >
          <div
            className="bg-white w-full max-w-[330px] max-h-[74vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3.5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1.5 bg-white/20 rounded-xl shrink-0">
                  <LinkIcon className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold leading-none">链接跳转详情页</h3>
                  <p className="text-[10px] text-white/80 font-mono truncate mt-1">
                    {linkPreviewData.key}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLinkPreviewData(null)}
                className="p-1.5 rounded-lg text-white/85 hover:text-white hover:bg-white/10 active:scale-95 transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 space-y-3 overflow-y-auto flex-1 bg-slate-50">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="relative h-36 bg-slate-200">
                  <img
                    src={getLinkHeroImage(linkPreviewData.key)}
                    alt={`${linkPreviewData.reports[0]?.title || '链接详情'}配图`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                  <div className="absolute left-3 right-3 bottom-2 flex items-center justify-between gap-2 text-white">
                    <span className="px-2 py-0.5 rounded-full bg-white/90 text-orange-700 text-[10px] font-extrabold">
                      跳转链接
                    </span>
                    <span className="text-[10px] font-mono bg-black/35 rounded-full px-2 py-0.5">
                      {getLinkHost(linkPreviewData.key)}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
                      <span className="font-bold text-orange-600">{getLinkHost(linkPreviewData.key)}</span>
                      <span className="font-mono shrink-0">{linkPreviewData.reports[0]?.createTime}</span>
                    </div>
                    <h2 className="text-base font-black leading-snug text-slate-950">
                      {linkPreviewData.reports[0]?.title}
                    </h2>
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      {linkPreviewData.reports[0]?.authorDept} · {linkPreviewData.reports[0]?.author}
                    </p>
                  </div>

                  <article className="space-y-2.5 text-[12px] leading-6 text-slate-700">
                    <p>{linkPreviewData.reports[0]?.summary}</p>
                    {linkPreviewData.reports[0]?.coreDemand && (
                      <p>{linkPreviewData.reports[0].coreDemand}</p>
                    )}
                    {linkPreviewData.reports[0]?.sentimentTrend && (
                      <p>{linkPreviewData.reports[0].sentimentTrend}</p>
                    )}
                  </article>

                </div>
              </div>
            </div>

          </div>
        </div>,
        batchModalPortalTarget
      )}
    </div>
  );
};
