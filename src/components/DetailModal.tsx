import React, { useState } from 'react';
import { SpeedReport, UserRole } from '../types';
import { DEPARTMENT_OPTIONS } from '../data/mockData';
import { IdentificationBadge } from './IdentificationBadge';
import { IDENTIFICATION_CONFIG } from '../utils/identification';
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Edit3,
  Building2,
  MessageSquare,
  AlertTriangle,
  Layers,
  MapPin,
  Clock,
  UserCheck,
  History,
  FileCheck2,
  Link2
} from 'lucide-react';
import { BackNavigationBar } from './BackNavigationBar';
import { RecallConfirmDialog } from './RecallConfirmDialog';

interface DetailModalProps {
  report: SpeedReport | null;
  allReports?: SpeedReport[];
  onClose: () => void;
  userRole: UserRole;
  allowAuditActions?: boolean;
  auditOnlyPreview?: boolean;
  onApprove: (id: string, score?: number) => void;
  onReject: (id: string, reason: string) => void;
  onTransfer: (id: string, dept: string) => void;
  onBatchApprove?: (ids: string[], score?: number) => void;
  onBatchReject?: (ids: string[], reason: string) => void;
  onEditDraft: (report: SpeedReport) => void;
  onRecallReport?: (id: string) => void;
  onSelectRelatedReport?: (report: SpeedReport) => void;
  onToast: (msg: string) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  report,
  allReports = [],
  onClose,
  userRole,
  allowAuditActions = false,
  auditOnlyPreview = false,
  onApprove,
  onReject,
  onTransfer,
  onBatchApprove,
  onBatchReject,
  onEditDraft,
  onRecallReport,
  onSelectRelatedReport,
  onToast,
}) => {
  const [showRejectInput, setShowRejectInput] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('信息不完整。请补充政策原文链接和群众反馈截图后重新提交。');

  const [showTransferPicker, setShowTransferPicker] = useState<boolean>(false);
  const [showRecallConfirm, setShowRecallConfirm] = useState<boolean>(false);
  const [selectedDept, setSelectedDept] = useState<string>(DEPARTMENT_OPTIONS[0]);

  // Mobile Audit Operations State (Matching PC layout)
  const [matchLinkInput, setMatchLinkInput] = useState<string>('');
  const [hasMatched, setHasMatched] = useState<boolean>(false);
  const [auditSheetMode, setAuditSheetMode] = useState<'pass' | 'reject' | null>(null);
  const [rejectReasonCategory, setRejectReasonCategory] = useState<string>('信息不完整');
  const [rejectDetailText, setRejectDetailText] = useState<string>('信息不完整，请补充政策原文链接和群众反馈截图后重新提交。');
  const canAudit = allowAuditActions && !auditOnlyPreview && report?.status === 'pending_audit';
  const canEdit = !auditOnlyPreview && (report?.status === 'draft' || report?.status === 'rejected');

  React.useEffect(() => {
    if (report) {
      const initialMatchLink = report.matchedLink?.trim() || '';
      setMatchLinkInput(initialMatchLink);
      setHasMatched(Boolean(initialMatchLink));
      setAuditSheetMode(null);
      setShowRecallConfirm(false);
    }
  }, [report?.id, report?.matchedLink]);

  if (!report) return null;

  // Link precision matching reports
  const normalizedMatchLink = matchLinkInput.trim();
  const matchedPendingReports = allReports.filter((r) => {
    if (r.status !== 'pending_audit') return false;
    if (!normalizedMatchLink) return false;
    return r.matchedLink === normalizedMatchLink || r.address === normalizedMatchLink;
  });
  const sameLinkRelatedReports = allReports.filter((r) => {
    if (r.id === report.id) return false;
    if (!normalizedMatchLink) return false;
    return r.matchedLink === normalizedMatchLink || r.address === report.address;
  });
  const visibleMatchReports =
    Array.from(
      new Map(
        [...matchedPendingReports, ...sameLinkRelatedReports]
          .filter((item) => item.id !== report.id)
          .map((item) => [item.id, item])
      ).values()
    ).slice(0, 3);
  const displayMatchCount = visibleMatchReports.length;
  const matchedCount = matchedPendingReports.length;
  const matchedIds = matchedPendingReports.map((r) => r.id);
  const isBatchMode = hasMatched && matchedCount > 1;
  const targetBatchIds = isBatchMode ? matchedIds : [report.id];
  const showMatchedResults = hasMatched && Boolean(normalizedMatchLink);
  const approvalScore = report.score ?? 92;

  const handleSubmitAudit = (conclusion: 'pass' | 'reject') => {
    if (!canAudit) return;
    if (conclusion === 'pass') {
      if (isBatchMode && onBatchApprove) {
        onBatchApprove(targetBatchIds, approvalScore);
      } else {
        onApprove(report.id, approvalScore);
      }
      onToast(`已提交审核通过${isBatchMode ? ` (${matchedCount}条)` : ''}`);
      setAuditSheetMode(null);
      onClose();
    } else {
      const fullReason = `${rejectReasonCategory}: ${rejectDetailText}`;
      if (isBatchMode && onBatchReject) {
        onBatchReject(targetBatchIds, fullReason);
      } else {
        onReject(report.id, fullReason);
      }
      onToast(`已提交驳回${isBatchMode ? ` (${matchedCount}条)` : ''}`);
      setAuditSheetMode(null);
      onClose();
    }
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      onToast('请输入驳回修改的原因');
      return;
    }
    onReject(report.id, rejectReason);
    setShowRejectInput(false);
    onClose();
  };

  const handleConfirmTransfer = () => {
    onTransfer(report.id, selectedDept);
    setShowTransferPicker(false);
    onClose();
  };

  const handleCopySummaryText = () => {
    const text = `【速报卡片】\n标题：${report.title}\n来源：${report.source} | 区域：${report.district}\n地址：${report.address}\n摘要：${report.summary}\n诉求：${report.coreDemand}\n处置建议：${report.disposalAdvice}`;
    navigator.clipboard.writeText(text);
    onToast('已复制速报摘要文本至剪贴板');
  };

  const handleRecall = () => {
    if (!onRecallReport) return;
    setShowRecallConfirm(true);
  };

  const handleConfirmRecall = () => {
    if (!onRecallReport) return;
    onRecallReport(report.id);
    setShowRecallConfirm(false);
    onClose();
  };

  const getStatusBadge = () => {
    switch (report.status) {
      case 'draft':
        return <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold">草稿</span>;
      case 'pending_audit':
        return <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold shadow-xs">待审核</span>;
      case 'auditing':
        return <span className="px-2.5 py-1 rounded-lg bg-sky-500 text-white text-xs font-bold shadow-xs">审核中</span>;
      case 'approved':
        return <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold shadow-xs">已采纳</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-bold shadow-xs">已驳回</span>;
      case 'pending_transfer':
        return <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold shadow-xs">待转办</span>;
      case 'transferred':
        return <span className="px-2.5 py-1 rounded-lg bg-blue-500 text-white text-xs font-bold shadow-xs">已转办</span>;
    }
  };

  const currentRejectReason = report.rejectReason?.replace(/^驳回原因[:：]\s*/, '');
  const fallbackRejectReason = currentRejectReason || '信息不完整。请补充政策原文链接和群众反馈截图后重新提交。';
  const shiftTime = (time: string, minutes: number) => {
    const matched = time.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/);
    if (!matched) return time;

    const [, year, month, day, hour, minute] = matched;
    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute) + minutes
    );
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };
  const hasFullReviewHistory = report.status === 'approved';
  const firstRejectTime = shiftTime(report.updateTime, -90);
  const resubmitTime = shiftTime(report.updateTime, -45);
  const showHandledAuditor = (auditor: string, org: string, handled: boolean) =>
    handled ? `${auditor} · ${org}` : org;
  const firstAuditHandled = !['draft', 'pending_audit'].includes(report.status);
  const secondAuditHandled = report.status === 'approved';
  const thirdAuditHandled = report.status === 'approved';
  const finalReviewScore = report.score ?? (report.status === 'approved' ? 92 : undefined);
  const flowNodes: Array<{
    title: string;
    actor: string;
    status: string;
    state: string;
    time?: string;
    rejectReason?: string;
    scoreText?: string;
    records?: Array<{
      label: string;
      actor: string;
      time?: string;
      status?: string;
      state?: string;
      reason?: string;
      scoreText?: string;
    }>;
  }> = [
    {
      title: '提交上报',
      actor: `${report.author} · ${report.authorDept}`,
      status: hasFullReviewHistory ? '' : report.status === 'draft' ? '草稿' : '已提交',
      state: report.status === 'draft' ? 'active' : 'done',
      time: report.createTime,
      records: hasFullReviewHistory
        ? [
            {
              label: '',
              actor: `${report.author} · ${report.authorDept}`,
              time: report.createTime,
              status: '已提交',
              state: 'done',
            },
            {
              label: '',
              actor: `${report.author} · ${report.authorDept}`,
              time: resubmitTime,
              status: '已提交',
              state: 'done',
            },
          ]
        : undefined,
    },
    {
      title: '审核处理',
      actor: showHandledAuditor('王主任', '市委宣传部舆情科', firstAuditHandled),
      status: hasFullReviewHistory
        ? ''
        : report.status === 'pending_audit'
        ? '待审核'
        : report.status === 'rejected'
        ? '已驳回'
        : report.status === 'draft'
        ? '等待处理'
        : '已通过',
      state:
        report.status === 'pending_audit'
          ? 'active'
          : report.status === 'rejected'
          ? 'rejected'
          : report.status === 'draft'
          ? 'waiting'
          : 'done',
      time: report.status === 'draft' || report.status === 'pending_audit' ? undefined : report.updateTime,
      rejectReason: report.status === 'rejected' ? currentRejectReason : undefined,
      records: hasFullReviewHistory
        ? [
            {
              label: '',
              actor: showHandledAuditor('王主任', '市委宣传部舆情科', true),
              time: firstRejectTime,
              status: '已驳回',
              state: 'rejected',
              reason: fallbackRejectReason,
            },
            {
              label: '',
              actor: showHandledAuditor('王主任', '市委宣传部舆情科', true),
              time: report.updateTime,
              status: '已通过',
              state: 'done',
              scoreText: report.status === 'approved' ? `评分：${finalReviewScore}分` : undefined,
            },
          ]
        : undefined,
    },
    {
      title: '审核处理',
      actor: showHandledAuditor('李明', '市网信办复核组', secondAuditHandled),
      status:
        report.status === 'auditing'
          ? '待审核'
          : report.status === 'approved'
          ? '已通过'
          : '等待处理',
      state:
        report.status === 'auditing'
          ? 'active'
          : report.status === 'approved'
          ? 'done'
          : 'waiting',
      time: report.status === 'approved' ? report.updateTime : undefined,
    },
    {
      title: '审核处理',
      actor: showHandledAuditor('赵宁', '市网信办终审组', thirdAuditHandled),
      status: report.status === 'approved' ? '已通过' : '等待处理',
      state: report.status === 'approved' ? 'done' : 'waiting',
      time: report.status === 'approved' ? report.updateTime : undefined,
      scoreText: report.status === 'approved' ? `评分：${finalReviewScore}分` : undefined,
    },
    {
      title: '结束',
      actor: '流程结束',
      status: report.status === 'approved' ? '已采纳' : '',
      state: report.status === 'approved' ? 'done' : 'waiting',
    },
  ];

  const getFlowStatusClass = (state: string) => {
    if (state === 'done') return 'text-emerald-600 font-bold';
    if (state === 'rejected') return 'text-red-600 font-bold';
    if (state === 'active') return 'text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-bold';
    return 'text-slate-400 font-bold';
  };

  const renderFlowIcon = (state: string) => {
    if (state === 'done') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 z-10 bg-white" />;
    if (state === 'rejected') return <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 z-10 bg-white" />;
    if (state === 'active') return <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 z-10 bg-white" />;
    return (
      <span className="w-3.5 h-3.5 shrink-0 z-10 bg-white flex items-center justify-center">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
      </span>
    );
  };
  return (
    <div className="absolute inset-0 z-40 bg-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
      
      {/* Scrollable Modal Content Body */}
      <div className="p-3 overflow-y-auto space-y-3 flex-1 text-xs">

        <BackNavigationBar onBack={onClose} />
        
        {/* Header Banner Card */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-3.5 shadow-md space-y-2">
          <h2 className="text-sm font-bold leading-snug text-slate-100 flex flex-wrap items-center gap-1.5">
            <span>{report.title}</span>
            {report.status !== 'draft' && report.identificationTag && (
              <IdentificationBadge tag={report.identificationTag} size="sm" />
            )}
            {getStatusBadge()}
          </h2>

          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px] text-sky-200/90">
            <span>{report.authorDept} · {report.author}</span>
            <span className="font-mono text-[10px] text-slate-400">{report.createTime}</span>
          </div>

          {report.status === 'rejected' && currentRejectReason && (
            <div className="rounded-xl border border-red-200 bg-red-50/95 p-2 text-red-700">
              <div className="flex items-start space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <span className="font-bold">驳回原因：</span>
                  <span>{currentRejectReason}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 查重识别与定标状态卡片 */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center space-x-1.5">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800">查重识别状态</h3>
            </div>
            {report.status !== 'draft' && report.identificationTag ? (
              <IdentificationBadge tag={report.identificationTag} size="md" />
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">草稿未打标</span>
            )}
          </div>

          {report.status === 'draft' ? (
            <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              当前为草稿拟定状态，不触发系统查重打标。提交上报后，系统将自动比对不良信息库与在审件，生成预判断标识。
            </p>
          ) : (
            <div className="space-y-2">
              {/* 普通提交人视图 (只展示简化提示) */}
              {userRole !== '审核员' && !allowAuditActions ? (
                <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>识别范围：不良信息全库比对</span>
                    {report.identificationTime && (
                      <span className="font-mono">{report.identificationTime}</span>
                    )}
                  </div>
                  <p className="font-medium text-slate-700">
                    {report.identificationTag && IDENTIFICATION_CONFIG[report.identificationTag]?.submitterTip}
                  </p>
                </div>
              ) : (
                /* 审核员视图 (专业审核详情与比对依据) */
                <div className="space-y-2 text-[11px]">
                  <div className="bg-blue-50/50 rounded-xl p-2.5 border border-blue-100/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 text-xs">
                        {report.identificationTag && IDENTIFICATION_CONFIG[report.identificationTag]?.summaryTitle}
                      </span>
                      <span className="text-[10px] text-blue-600 bg-blue-100/70 px-1.5 py-0.5 rounded font-mono">
                        比对库：不良信息库 + 在审件
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {report.identificationTag && IDENTIFICATION_CONFIG[report.identificationTag]?.auditorTip}
                    </p>
                  </div>

                  {report.identificationReason && (
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block">判定比对依据 / 关联线索</span>
                      <p className="text-slate-700 leading-relaxed font-mono text-[11px]">
                        {report.identificationReason}
                      </p>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5 px-0.5">
                    <span>
                      {report.status === 'approved'
                        ? '定标节点：终审采纳已正式生效'
                        : '定标规则：此环节仅打标供审核参考，采纳后即为正式标识'}
                    </span>
                    {report.identificationTime && (
                      <span className="font-mono">{report.identificationTime}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Detail Information */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              <span>详情信息</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-slate-600">
            <div className="bg-slate-50/70 p-2 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block">事件来源</span>
              <span className="font-semibold text-slate-800 text-xs">{report.source}</span>
            </div>
            <div className="bg-slate-50/70 p-2 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block">所属区域</span>
              <span className="font-semibold text-slate-800 text-xs">{report.district}</span>
            </div>
            <div className="bg-slate-50/70 p-2 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block">信息类型</span>
              <span className="font-semibold text-slate-800 text-xs">{report.type}</span>
            </div>
            <div className="bg-slate-50/70 p-2 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block">发生地址</span>
              <span className="font-semibold text-slate-800 text-xs truncate block">{report.address}</span>
            </div>
          </div>

          {report.matchedLink && (
            <div className="bg-blue-50/60 p-2 rounded-xl border border-blue-100 flex items-center justify-between">
              <div className="flex items-center space-x-1.5 truncate pr-2">
                <Link2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-[11px] text-slate-600 font-mono truncate">{report.matchedLink}</span>
              </div>
              <a
                href={report.matchedLink}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-0.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold shrink-0 flex items-center shadow-2xs"
              >
                访问 <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </a>
            </div>
          )}

          <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
            <h3 className="text-xs font-bold text-slate-800">内容摘要</h3>
            <p className="text-slate-700 leading-relaxed text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {report.summary}
            </p>
          </div>

          <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
            <h3 className="text-xs font-bold text-slate-800">核心诉求</h3>
            <p className="text-slate-700 leading-relaxed text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {report.coreDemand}
            </p>
          </div>

          {report.sentimentTrend && (
            <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
              <h3 className="text-xs font-bold text-slate-800">舆情态势</h3>
              <p className="text-slate-700 leading-relaxed text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {report.sentimentTrend}
              </p>
            </div>
          )}

          <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
            <h3 className="text-xs font-bold text-slate-800">处置建议</h3>
            <p className="text-slate-700 leading-relaxed text-[11px] whitespace-pre-line bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {report.disposalAdvice}
            </p>
          </div>
        </div>

        {/* Transferred notice if transferred */}
        {report.status === 'transferred' && report.transferredDept && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-blue-800 space-y-1">
            <div className="font-bold flex items-center space-x-1">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>已成功转办至专班部门处置</span>
            </div>
            <p className="text-[11px] text-blue-700">接收部门：<span className="font-bold">{report.transferredDept}</span></p>
          </div>
        )}

        {/* ========================================================= */}
        {/* Mobile Audit Operations Card (审核操作) - Derived from PC layout */}
        {/* ========================================================= */}
        {canAudit && (
          <div className="bg-white rounded-2xl p-3.5 border border-amber-200/90 shadow-xs space-y-3">
            
            {/* Header Notice Banner */}
            <div className="space-y-2">
            </div>

            {/* 按链接地址精准匹配 */}
            <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                <Link2 className="w-3.5 h-3.5 text-blue-600" />
                <span>按链接地址精准匹配</span>
              </label>

              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  value={matchLinkInput}
                  onChange={(e) => {
                    setMatchLinkInput(e.target.value);
                    setHasMatched(false);
                  }}
                  placeholder="请输入或复制上报链接地址..."
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Match Detection Notice (Matching PC screenshot alert) */}
              {showMatchedResults && (
                <div
                  className={`rounded-xl p-2.5 text-[11px] space-y-2 animate-in fade-in ${
                    isBatchMode
                      ? 'bg-amber-50 border border-amber-200 text-amber-950'
                      : 'bg-blue-50 border border-blue-100 text-blue-950'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-1.5 min-w-0">
                      {isBatchMode ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      )}
                      <span>
                        已匹配 <strong className="font-mono font-bold">{displayMatchCount}</strong> 条待审核内容
                        {isBatchMode ? '，可进行批量处理。' : '。'}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-100 bg-white/90 overflow-hidden">
                    {visibleMatchReports.length > 0 ? (
                      visibleMatchReports.map((item) => {
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              if (onSelectRelatedReport) {
                                onSelectRelatedReport(item);
                              }
                            }}
                            className="w-full text-left px-2.5 py-2 border-b border-amber-50 last:border-b-0 transition-colors hover:bg-amber-50/60 active:bg-amber-100/50"
                            >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="text-[11px] font-bold text-slate-800 line-clamp-2">
                                  {item.title}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-500">
                                  <span className="truncate">{item.authorDept}</span>
                                  <span className="text-slate-300">·</span>
                                  <span className="truncate">{item.author}</span>
                                  <span className="text-slate-300">·</span>
                                  <span className="font-mono">{item.createTime}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-2.5 text-[11px] text-slate-500">
                        暂未匹配到待审核内容。
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* Flow Status Timeline Card (流转状态) - Matching PC layout */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
              <History className="w-3.5 h-3.5 text-blue-600" />
              <span>流转状态</span>
            </h3>
          </div>

          <div className="space-y-3 pl-2 pt-1 relative">
            {flowNodes.map((node, index) => (
              <div
                key={`${node.title}-${index}`}
                className={`flex items-start space-x-2.5 relative ${
                  index < flowNodes.length - 1
                    ? "after:absolute after:left-[7px] after:top-4 after:bottom-[-12px] after:w-0.5 after:bg-slate-200"
                    : ''
                }`}
              >
                <div className="mt-0.5">
                  {renderFlowIcon(node.state)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-800">
                    <span>{node.title}</span>
                    {node.status && node.records && (
                      <span className={`text-[10px] shrink-0 ${getFlowStatusClass(node.state)}`}>
                        {node.status}
                      </span>
                    )}
                  </div>
                  {node.records ? (
                    <div className="mt-1.5 space-y-1.5">
                      {node.records.map((record, index) => (
                        <div
                          key={`${node.title}-${record.label}-${index}`}
                          className="rounded-xl border border-slate-100 bg-slate-50/80 p-2"
                        >
                          {record.label ? (
                            <>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold text-slate-700">{record.label}</span>
                                {record.status && (
                                  <span className={`text-[10px] shrink-0 ${getFlowStatusClass(record.state || node.state)}`}>
                                    {record.status}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 pt-0.5 truncate">
                                {record.time ? `${record.actor} · ${record.time}` : record.actor}
                              </p>
                            </>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[10px] text-slate-500 truncate">
                                {record.time ? `${record.actor} · ${record.time}` : record.actor}
                              </p>
                              {record.status && (
                                <span className={`text-[10px] shrink-0 ${getFlowStatusClass(record.state || node.state)}`}>
                                  {record.status}
                                </span>
                              )}
                            </div>
                          )}
                          {record.reason && (
                            <div className="mt-1.5 rounded-lg border border-red-200 bg-red-50 p-2 text-[10px] leading-relaxed text-red-700">
                              <span className="font-bold">驳回原因：</span>
                              <span>{record.reason}</span>
                            </div>
                          )}
                          {record.scoreText && (
                            <div className="mt-1.5 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-[10px] leading-relaxed text-emerald-700">
                              <span className="font-bold">{record.scoreText}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1.5 rounded-xl border border-slate-100 bg-slate-50/80 p-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-slate-500 truncate">
                          {node.time ? `${node.actor} · ${node.time}` : node.actor}
                        </p>
                        {node.status && (
                          <span className={`text-[10px] shrink-0 ${getFlowStatusClass(node.state)}`}>
                            {node.status}
                          </span>
                        )}
                      </div>
                      {node.rejectReason && (
                        <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-2 text-[11px] leading-relaxed text-red-700">
                          <span className="font-bold">驳回原因：</span>
                          <span>{node.rejectReason}</span>
                        </div>
                      )}
                      {node.scoreText && (
                        <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-[11px] leading-relaxed text-emerald-700">
                          <span className="font-bold">{node.scoreText}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Bottom Actions Bar */}
      <div className="bg-white p-3 border-t border-slate-200 shrink-0 shadow-lg">
        {canAudit ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAuditSheetMode('reject')}
              className="py-3 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-all active:scale-[0.99]"
            >
              <XCircle className="w-4 h-4" />
              <span>{isBatchMode ? '批量驳回' : '驳回'}</span>
            </button>
            <button
              type="button"
              onClick={() => setAuditSheetMode('pass')}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-all active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isBatchMode ? '批量通过' : '通过'}</span>
            </button>
          </div>
        ) : canEdit ? (
          <button
            onClick={() => {
              onEditDraft(report);
              onClose();
            }}
            className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>修改补充并重新提交</span>
          </button>
        ) : report.status === 'pending_audit' && onRecallReport ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRecall}
              className="flex-1 py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1 transition-colors border border-amber-200"
            >
              <span>撤回</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-black text-white font-semibold text-xs rounded-xl transition-colors"
            >
              关闭详情
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopySummaryText}
              className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1 transition-colors"
            >
              <span>复制汇报摘要</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-black text-white font-semibold text-xs rounded-xl transition-colors"
            >
              关闭详情
            </button>
          </div>
        )}
      </div>

      {showRecallConfirm && (
        <RecallConfirmDialog
          title="确认撤回这条待审核速报？"
          message="撤回后将回到草稿箱，仍可继续修改后重新提交。"
          onCancel={() => setShowRecallConfirm(false)}
          onConfirm={handleConfirmRecall}
        />
      )}

      {auditSheetMode && (
        <div
          className="absolute inset-0 z-50 bg-slate-900/55 backdrop-blur-xs flex items-end animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAuditSheetMode(null);
          }}
        >
          <div className="bg-white w-full rounded-t-3xl p-3.5 border-t border-slate-200 shadow-2xl space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-1.5">
                {auditSheetMode === 'pass' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-xs font-bold text-slate-900">
                  {auditSheetMode === 'pass' ? '审核通过' : '驳回重修'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAuditSheetMode(null)}
                className="px-2 py-1 text-[11px] font-semibold text-slate-500 rounded-lg hover:bg-slate-100"
              >
                取消
              </button>
            </div>

            {auditSheetMode === 'pass' ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 text-[11px] leading-relaxed text-emerald-800">
                确认后将审核通过并进入下一处理节点。
              </div>
            ) : (
              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">驳回原因</label>
                  <select
                    value={rejectReasonCategory}
                    onChange={(e) => setRejectReasonCategory(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-red-500 font-medium"
                  >
                    <option value="信息不完整">信息不完整</option>
                    <option value="事实核对不符">事实核对不符</option>
                    <option value="内容重复/同源">内容重复/同源</option>
                    <option value="不属于本网格/部门">不属于本网格/部门</option>
                    <option value="需要补充佐证材料">需要补充佐证材料</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">详细修改指引说明</label>
                  <textarea
                    rows={3}
                    value={rejectDetailText}
                    onChange={(e) => setRejectDetailText(e.target.value)}
                    placeholder="请输入具体的驳回理由及修改意见..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleSubmitAudit(auditSheetMode)}
              className={`w-full py-3 px-4 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-all active:scale-[0.99] ${
                auditSheetMode === 'pass'
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                  : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
              }`}
            >
              {auditSheetMode === 'pass' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isBatchMode ? `确认批量审核通过 (${matchedCount}条)` : '确认审核通过'}</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>{isBatchMode ? `确认批量驳回重修 (${matchedCount}条)` : '确认驳回重修'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
