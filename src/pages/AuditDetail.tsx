import React, { useRef, useState } from 'react';
import { ReportItem, PageId, TimelineNode } from '../types';
import {
  CheckCircle2,
  Clock,
  ChevronRight,
  Send,
  AlertCircle,
  ExternalLink,
  Check,
  X,
  TrendingUp,
  Link as LinkIcon
} from 'lucide-react';
import { ReportContentDisplay } from '../components/ReportContentDisplay';

interface AuditDetailProps {
  report: ReportItem | null;
  onApprove: (id: number, score: number, isBatch?: boolean) => void;
  onReject: (id: number, reason: string, detail: string) => void;
  onNavigate: (page: PageId) => void;
}

type FlowTone = 'done' | 'current' | 'rejected' | 'waiting';

interface FlowRecord {
  actor: string;
  organization?: string;
  time?: string;
  status?: string;
  tone: FlowTone;
  reason?: string;
}

interface FlowGroup {
  title: string;
  tone: FlowTone;
  records: FlowRecord[];
}

export const AuditDetail: React.FC<AuditDetailProps> = ({
  report,
  onApprove,
  onReject,
  onNavigate
}) => {
  const defaultMatchUrl = report?.matchUrl || 'https://news.example.com/';
  const matchToastTimerRef = useRef<number | null>(null);
  const [matchUrl, setMatchUrl] = useState(defaultMatchUrl);
  const [isUrlMatched, setIsUrlMatched] = useState(false);
  const [showMatchToast, setShowMatchToast] = useState(false);
  const [matchToastMessage, setMatchToastMessage] = useState('');
  const [auditMode, setAuditMode] = useState<'pass' | 'reject'>('pass');
  const [selectedScore, setSelectedScore] = useState<number>(5);
  const [rejectReason, setRejectReason] = useState('信息不完整');
  const [rejectDetail, setRejectDetail] = useState('');

  const formatScoreText = (score?: number | string) => {
    if (score === undefined || score === '--') return '';
    return `${score}`.includes('分') ? `${score}` : `${score}分`;
  };

  if (!report) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>未选择待审核记录，请返回审核列表。</p>
        <button
          onClick={() => onNavigate('report-audit')}
          className="mt-4 px-4 py-2 bg-[#1E5ABB] text-white rounded text-xs cursor-pointer"
        >
          返回报送审核
        </button>
      </div>
    );
  }

  const showMatchOperationToast = (message: string) => {
    setMatchToastMessage(message);
    setShowMatchToast(true);
    if (matchToastTimerRef.current) {
      window.clearTimeout(matchToastTimerRef.current);
    }
    matchToastTimerRef.current = window.setTimeout(() => {
      setShowMatchToast(false);
      matchToastTimerRef.current = null;
    }, 2600);
  };

  const handleMatchUrl = () => {
    if (matchUrl.trim()) {
      setIsUrlMatched(true);
      showMatchOperationToast('已精准匹配同链上报 2 条');
    }
  };

  const handleResetUrl = () => {
    setMatchUrl(defaultMatchUrl);
    setIsUrlMatched(false);
    if (matchToastTimerRef.current) {
      window.clearTimeout(matchToastTimerRef.current);
      matchToastTimerRef.current = null;
    }
    showMatchOperationToast('已重置匹配条件');
  };

  const handleSubmitAudit = () => {
    if (auditMode === 'pass') {
      onApprove(report.id, selectedScore, isUrlMatched);
    } else {
      onReject(report.id, rejectReason, rejectDetail);
    }
    onNavigate('report-audit');
  };

  const detail = report.detailContent || {
    summary: '今日（10月24日）上午8时许，多名网民在微博、微信群反映XX区XX街道辖区内多个大型居民小区突发停水。经初步核查，受影响范围包括阳光花园、明月居等5个小区，涉及居民约3万人。',
    coreDemands: '网民普遍反映未接到停水通知，早高峰期间停水严重影响正常生活，部分网民情绪急躁，质疑供水部门应急处置能力。',
    publicOpinionTrend: '目前相关话题在本地区微博同城榜排名呈上升趋势，阅读量已突破10万。暂未发现大规模聚集性负面言论，但个别自媒体账号开始发布未经证实的“管道大面积破裂需要停水数日”的言论。',
    recommendations: [
      '1. 建议区政府立即协调水务集团查明停水原因，并明确预计恢复供水时间。',
      '2. 通过官方渠道（微博、微信公众号）紧急发布停水情况说明，澄清不实传言。',
      '3. 若短时间内无法恢复，建议安排应急送水车前往受影响小区，保障居民基本用水需求。'
    ]
  };

  const attachments = report.attachments || [
    { id: 'a1', name: '微博截图1.png', size: '1.2 MB', type: 'image', thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&auto=format&fit=crop' },
    { id: 'a2', name: '微信群截图.jpg', size: '850 KB', type: 'image', thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop' },
    { id: 'a3', name: '应急预案初稿.pdf', size: '2.4 MB', type: 'pdf' },
    { id: 'a4', name: '相关舆情专题网页', size: '网址', type: 'link', url: 'https://news.example.com/topic-water' }
  ];
  const timeline = report.timeline || [];
  const isRejected = report.auditStatus === '被驳回';
  const isPending = report.auditStatus === '待审核';
  const isInReview = report.auditStatus === '审核中';
  const isCompleted =
    report.auditStatus === '已通过' || report.auditStatus === '待转办' || report.auditStatus === '已转办';
  const scoreText = formatScoreText(report.score);
  const findTimelineNode = (predicate: (node: TimelineNode) => boolean) => timeline.find(predicate);
  const submitTimelineNodes = timeline.filter((node) => node.title.includes('提交上报'));
  const approvedAuditNode = findTimelineNode(
    (node) => node.status === 'completed' && (node.title.includes('主任审核') || node.title.includes('一级审核') || node.title.includes('总部审核'))
  );
  const rejectedAuditNode = findTimelineNode(
    (node) => node.status === 'rejected' || node.title.includes('驳回')
  );
  const firstAuditTime = report.auditTime || approvedAuditNode?.time || rejectedAuditNode?.time || report.submitTime;
  const secondAuditTime = approvedAuditNode?.time || report.auditTime || report.submitTime;
  const thirdAuditTime = report.timeline?.find((node) => node.title.includes('终审') || node.title.includes('三级审核'))?.time || report.auditTime || report.submitTime;

  const submitRecords: FlowRecord[] = submitTimelineNodes.length
    ? submitTimelineNodes.map((node) => ({
        actor: node.operator.replace('·', ' · '),
        time: node.time || report.submitTime,
        status: '已提交',
        tone: 'done' as const,
      }))
    : [
        {
          actor: `${report.author} · ${report.organization}`,
          time: report.submitTime,
          status: '已提交',
          tone: 'done',
        },
      ];

  const firstAuditRecords: FlowRecord[] = (() => {
    if (isRejected) {
      return [
        {
          actor: report.auditor || '王主任 · 市委宣传部舆情科',
          time: rejectedAuditNode?.time || report.auditTime || report.submitTime,
          status: '已驳回',
          tone: 'rejected',
          reason: rejectedAuditNode?.note || rejectReason,
        },
      ];
    }

    if (isPending) {
      return [
        {
          actor: report.auditor || '王主任 · 市委宣传部舆情科',
          organization: '市委宣传部舆情科',
          status: '待审核',
          tone: 'current',
        },
      ];
    }

    if (isInReview) {
      return [
        {
          actor: report.auditor || '王主任 · 市委宣传部舆情科',
          time: firstAuditTime,
          status: `已通过${scoreText}`,
          tone: 'done',
        },
      ];
    }

    if (isCompleted) {
      const records: FlowRecord[] = [];
      if (rejectedAuditNode) {
        records.push({
          actor: report.auditor || '王主任 · 市委宣传部舆情科',
          time: rejectedAuditNode.time || report.auditTime || report.submitTime,
          status: '已驳回',
          tone: 'rejected',
          reason: rejectedAuditNode.note || rejectReason,
        });
      }

      records.push({
        actor: report.auditor || '王主任 · 市委宣传部舆情科',
        time: firstAuditTime,
        status: `已通过${scoreText}`,
        tone: 'done',
      });

      return records;
    }

    return [
      {
        actor: report.auditor || '王主任 · 市委宣传部舆情科',
        organization: '市委宣传部舆情科',
        time: firstAuditTime,
        status: '待审核',
        tone: 'current',
      },
    ];
  })();

  const secondAuditRecords: FlowRecord[] = [
    {
      actor: '复核员 · 市网信办复核组',
      organization: '市网信办复核组',
      time: isCompleted ? secondAuditTime : undefined,
      status: isCompleted ? `已通过${scoreText}` : isInReview ? '待审核' : '等待处理',
      tone: isCompleted ? 'done' : isInReview ? 'current' : 'waiting',
    }
  ];

  const thirdAuditRecords: FlowRecord[] = [
    {
      actor: '终审员 · 市网信办终审组',
      organization: '市网信办终审组',
      time: isCompleted ? thirdAuditTime : undefined,
      status: isCompleted ? `已通过${scoreText}` : '等待处理',
      tone: isCompleted ? 'done' : 'waiting',
    }
  ];

  const endRecords: FlowRecord[] = [
    {
      actor: '流程结束',
      status: isCompleted ? '已完成' : undefined,
      tone: isCompleted ? 'done' : 'waiting',
    }
  ];

  const auditReviewFlow: FlowGroup[] = [
    { title: '提交上报', tone: 'done', records: submitRecords },
    {
      title: '审核处理',
      tone: isRejected ? 'rejected' : isPending ? 'current' : 'done',
      records: firstAuditRecords,
    },
    {
      title: '审核处理',
      tone: isCompleted ? 'done' : isInReview ? 'current' : 'waiting',
      records: secondAuditRecords,
    },
    {
      title: '审核处理',
      tone: isCompleted ? 'done' : 'waiting',
      records: thirdAuditRecords,
    },
    { title: '结束', tone: isCompleted ? 'done' : 'waiting', records: endRecords }
  ];
  const getFlowBadgeClass = (tone: string) => {
    if (tone === 'done') return 'text-emerald-600';
    if (tone === 'rejected') return 'px-1.5 py-0.5 rounded border border-red-200 bg-red-50 text-red-600';
    if (tone === 'current') return 'px-1.5 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-700';
    return 'text-gray-400';
  };

  const getFlowActorText = (record: FlowRecord) => {
    if (record.tone === 'done' || record.tone === 'rejected') return record.actor;
    return record.organization || record.actor.split('·').map((part) => part.trim()).pop() || record.actor;
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <div className="flex w-full items-center space-x-1.5 rounded-lg border border-gray-200 bg-white px-5 py-3 text-xs text-gray-500 shadow-2xs">
        <button onClick={() => onNavigate('report-audit')} className="hover:text-[#1E5ABB] cursor-pointer">
          报送管理
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
        <button onClick={() => onNavigate('report-audit')} className="hover:text-[#1E5ABB] cursor-pointer">
          报送审核
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
        <span className="text-gray-800 font-bold">审核详情</span>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (Basic Info, Details, Attachments) */}
        <div className="lg:col-span-2 space-y-5">
          <ReportContentDisplay report={report} />
        </div>

        {/* Right Column: Audit Action Panel & Timeline */}
        <div className="space-y-5">
          {/* 审核操作 Card */}
          <div className="bg-white rounded-lg p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <CheckCircle2 className="w-4 h-4 text-rose-700 shrink-0" />
              <h3 className="text-sm font-bold text-gray-800">审核操作</h3>
            </div>

            {/* URL Precision Match Section */}
            <div className="relative">
              <div className="rounded-lg border border-gray-200 bg-white/90 p-3 text-xs shadow-2xs">
                <label className="mb-2 flex items-center space-x-1.5 font-bold text-gray-700">
                  <LinkIcon className="h-3.5 w-3.5 text-[#1E5ABB]" />
                  <span>点击链接地址精准匹配</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={matchUrl}
                    onChange={(e) => setMatchUrl(e.target.value)}
                    placeholder="https://news.example.com/"
                    className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                  />
                  <button
                    type="button"
                    onClick={handleMatchUrl}
                    disabled={!matchUrl.trim()}
                    className="shrink-0 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-slate-900 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
                  >
                    匹配
                  </button>
                  <button
                    type="button"
                    onClick={handleResetUrl}
                    className="shrink-0 rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 cursor-pointer"
                  >
                    重置
                  </button>
                </div>

                {isUrlMatched && (
                  <div className="mt-2 space-y-2 rounded-md border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-900 animate-in fade-in">
                    <div className="flex items-start space-x-1.5">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <span>系统检测到有2条来自相同链接的报送内容，可进行批量处理。</span>
                    </div>
                    <div className="rounded-lg border border-amber-200 bg-white/85 px-3 py-2 text-gray-700">
                      <p className="font-bold text-gray-900 truncate">万达广场物业涉嫌虚假宣传投诉</p>
                      <p className="mt-0.5 text-[11px] text-gray-500">张三 · 2026-08-13 08:45</p>
                    </div>
                  </div>
                )}
              </div>

              {showMatchToast && (
                <div className="absolute left-1/2 bottom-4 z-10 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white shadow-lg">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="whitespace-nowrap">{matchToastMessage}</span>
                  <button
                    type="button"
                    onClick={() => setShowMatchToast(false)}
                    className="ml-1 text-white/70 hover:text-white"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* 审核结论 Option Buttons */}
            <div className="space-y-2 text-xs pt-2">
              <label className="block text-gray-600 font-medium">审核结论</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAuditMode('pass')}
                  className={`rounded-lg border px-3 py-2.5 text-left transition-all cursor-pointer ${
                    auditMode === 'pass'
                      ? 'border-emerald-300 bg-emerald-50 shadow-[0_0_0_1px_rgba(16,185,129,0.12)]'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                        auditMode === 'pass'
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-gray-300 bg-white text-transparent'
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    <span className={`font-bold ${auditMode === 'pass' ? 'text-emerald-700' : 'text-gray-700'}`}>
                      {isUrlMatched ? '批量通过' : '通过'}
                    </span>
                  </div>
                  <p className="mt-1 pl-6 text-[11px] text-gray-400">通过后进入下一审核节点</p>
                </button>

                <button
                  type="button"
                  onClick={() => setAuditMode('reject')}
                  className={`rounded-lg border px-3 py-2.5 text-left transition-all cursor-pointer ${
                    auditMode === 'reject'
                      ? 'border-rose-300 bg-rose-50 shadow-[0_0_0_1px_rgba(244,63,94,0.12)]'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                        auditMode === 'reject'
                          ? 'border-rose-500 bg-rose-500 text-white'
                          : 'border-gray-300 bg-white text-transparent'
                      }`}
                    >
                      <X className="h-3 w-3" />
                    </span>
                    <span className={`font-bold ${auditMode === 'reject' ? 'text-rose-700' : 'text-gray-700'}`}>
                      {isUrlMatched ? '批量驳回' : '驳回'}
                    </span>
                  </div>
                  <p className="mt-1 pl-6 text-[11px] text-gray-400">退回后需补充说明再提交</p>
                </button>
              </div>
            </div>

            {/* Sub-form based on Pass or Reject */}
            {auditMode === 'pass' ? (
              <div className="space-y-3 text-xs pt-1">
                <label className="block text-gray-600 font-medium">评分</label>
                <div className="flex flex-wrap gap-2">
                  {[5, 3, 1, 0.5, 0].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedScore(s)}
                      className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                        selectedScore === s
                          ? 'bg-[#1E5ABB] text-white shadow-2xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200/60'
                      }`}
                    >
                      {s}分
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleSubmitAudit}
                  className="w-full py-2.5 mt-3 bg-[#1E5ABB] hover:bg-[#134092] text-white font-bold text-xs rounded-md shadow-2xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isUrlMatched ? '提交批量审核' : '提交审核'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs pt-1 animate-in fade-in">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">驳回原因</label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-gray-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                  >
                    <option value="信息不完整">信息不完整</option>
                    <option value="属虚假误报">属虚假误报</option>
                    <option value="重复上报">重复上报</option>
                    <option value="不符合退回标准">不符合退回标准</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 font-medium mb-1">详细说明</label>
                  <textarea
                    rows={3}
                    value={rejectDetail}
                    onChange={(e) => setRejectDetail(e.target.value)}
                    placeholder="请输入具体的驳回理由..."
                    className="w-full px-3 py-2 border border-gray-300 rounded text-gray-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmitAudit}
                  className="w-full py-2.5 mt-2 bg-[#1E5ABB] hover:bg-[#134092] text-white font-bold text-xs rounded-md shadow-2xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isUrlMatched ? '提交批量驳回' : '提交驳回'}</span>
                </button>
              </div>
            )}
          </div>

          {/* 流转状态 Card */}
          <div className="bg-white rounded-lg p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <TrendingUp className="w-4 h-4 text-rose-700 shrink-0" />
              <h3 className="text-sm font-bold text-gray-800">流转状态</h3>
            </div>

            <div className="space-y-0 text-xs">
              {auditReviewFlow.map((node, nodeIndex) => (
                <div key={`${node.title}-${nodeIndex}`} className="relative flex gap-3 pb-4 last:pb-0">
                  {nodeIndex < auditReviewFlow.length - 1 && (
                    <div className="absolute left-[7px] top-4 bottom-0 w-px bg-gray-200" />
                  )}
                  <div className="relative z-10 mt-0.5 h-4 w-4 shrink-0 rounded-full bg-white flex items-center justify-center">
                    {node.tone === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {node.tone === 'current' && <span className="h-3 w-3 rounded-full border-2 border-orange-500 bg-orange-100" />}
                    {node.tone === 'rejected' && <X className="w-4 h-4 rounded-full bg-red-500 p-0.5 text-white" />}
                    {node.tone === 'waiting' && <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className={node.tone === 'waiting' ? 'font-bold text-gray-400' : 'font-bold text-gray-900'}>
                      {node.title}
                    </div>
                    {node.records.map((record, index) => (
                      <div key={`${node.title}-${index}`} className="rounded-xl border border-gray-100 bg-white px-2.5 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-gray-500 truncate">
                            {getFlowActorText(record)}{record.time ? ` · ${record.time}` : ''}
                          </span>
                          {record.status && (
                            <span className={`text-[11px] font-bold shrink-0 ${getFlowBadgeClass(record.tone)}`}>
                              {record.status}
                            </span>
                          )}
                        </div>
                        {record.reason && (
                          <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-[11px] leading-relaxed text-red-700">
                            <span className="font-bold">驳回原因：</span>
                            <span>{record.reason}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
