import React, { useState, useEffect } from 'react';
import { AuditRecordItem, ReportItem, PageId, Attachment, TimelineNode, OriginTypeLabel } from '../types';
import {
  Info,
  FileText,
  Paperclip,
  CheckCircle2,
  Clock,
  ChevronRight,
  CheckSquare,
  TrendingUp,
  ExternalLink,
  FileSpreadsheet,
  ArrowLeft,
  Copy,
  Check,
  Undo2,
  FileEdit,
  Trash2,
  AlertCircle,
  MapPin,
  Building,
  User,
  Share2,
  Download,
  History,
  Eye,
  X
} from 'lucide-react';
import { AttachmentPreviewModal } from '../components/AttachmentPreviewModal';
import { AuditFlowTimeline } from '../components/AuditFlowTimeline';
import { getFinalAuditScore } from '../auditStage';
import { ReportOriginBadge } from '../components/ReportOriginBadge';

export interface AuditRecordDetailProps {
  record: AuditRecordItem | null;
  allReports?: ReportItem[];
  sourcePage?: PageId;
  onNavigate: (page: PageId) => void;
  onWithdrawReport?: (id: number) => void;
  onResubmitReport?: (report: ReportItem) => void;
  onDeleteReport?: (id: number) => void;
  isDrawer?: boolean;
  onClose?: () => void;
}

export const AuditRecordDetail: React.FC<AuditRecordDetailProps> = ({
  record,
  allReports = [],
  sourcePage = 'audit-records',
  onNavigate,
  onWithdrawReport,
  onResubmitReport,
  onDeleteReport,
  isDrawer = false,
  onClose
}) => {
  const report: ReportItem | null = record
    ? (() => {
        const found = allReports.find((r) => r.id === record.reportId || r.title === record.title);

        // 优先使用速报实时对象：整体状态与流转时间线随速报当前进度展示。
        // 本条审核记录只代表“某个审核节点当时”的结论，不覆盖速报整体状态。
        if (found) {
          const finalOrigin: OriginTypeLabel =
            record.originLabel === '重复' ||
            found.originLabel === '重复' ||
            record.originLabel === '疑似重复' ||
            found.originLabel === '疑似重复'
              ? '重复'
              : '首发';
          return {
            ...found,
            originLabel: finalOrigin,
            auditor: record.auditor || found.auditor,
            auditTime: record.auditTime || found.auditTime,
            rejectReason: record.rejectReason ?? found.rejectReason,
            rejectDetail: record.rejectDetail ?? found.rejectDetail
          };
        }

        const baseOrigin: OriginTypeLabel =
          record.originLabel === '重复' || record.originLabel === '疑似重复' ? '重复' : '首发';

        const base: ReportItem = {
          id: record.reportId || record.id,
          title: record.title,
          source: '群众举报',
          region: '全市',
          infoType: '舆情动态',
          author: record.submitter || '王五',
          organization: record.organization || '市大数据中心',
          submitTime: record.submitTime || record.auditTime,
          occurAddress: '全市范围',
          auditStatus: record.auditResult === '已通过' ? '已采纳' : '已驳回',
          originLabel: baseOrigin,
          ...(record.score !== undefined ? { score: record.score } : {}),
          matchUrl: 'https://news.example.com/',
          detailContent: {
            summary: `${record.title}的相关情况核查与市民诉求反馈。`,
            coreDemands: '建议优化相关流程，加强联动响应与便民服务。',
            publicOpinionTrend: '整体态势平稳可控。',
            recommendations: [
              '1. 持续关注舆情动向，落实整改措施。',
              '2. 针对群众反馈诉求及时答复处置，形成闭环管理。'
            ]
          }
        };
        return {
          ...base,
          ...(record.score !== undefined ? { score: record.score } : { score: undefined }),
          rejectReason: record.rejectReason ?? base.rejectReason,
          rejectDetail: record.rejectDetail ?? base.rejectDetail,
          auditor: record.auditor || base.auditor,
          auditTime: record.auditTime || base.auditTime,
          // 未找到实时速报对象时，退化为按记录结论渲染完整流程
          timeline: undefined
        };
      })()
    : null;

  const [copied, setCopied] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState(report?.title || '');
  const [editAddress, setEditAddress] = useState(report?.occurAddress || '');
  const [editSummary, setEditSummary] = useState(report?.detailContent?.summary || '');
  const [editCoreDemands, setEditCoreDemands] = useState(report?.detailContent?.coreDemands || '');
  const [editSource, setEditSource] = useState(report?.source || '群众举报');
  const [editRegion, setEditRegion] = useState(report?.region || '西坝区');
  const [editInfoType, setEditInfoType] = useState(report?.infoType || '突发事件');

  const [drawerActiveTab, setDrawerActiveTab] = useState<'detail' | 'flow'>('detail');

  // Listen for Escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawer && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawer, onClose]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      onNavigate(sourcePage === 'audit-records' ? 'audit-records' : 'report-summary');
    }
  };

  if (!report) {
    if (isDrawer) {
      return (
        <div
          className="fixed inset-0 z-50 overflow-hidden"
          id="audit-record-detail-drawer"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={handleClose}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white p-6 shadow-2xl flex flex-col justify-center items-center text-center space-y-4">
            <p className="text-sm text-gray-500">未选择审核记录</p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-[#1E5ABB] text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              关闭抽屉
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
        <p className="text-sm">未选择审核记录，请返回审核记录列表选择。</p>
        <button
          onClick={() => onNavigate(sourcePage === 'audit-records' ? 'audit-records' : 'report-summary')}
          className="mt-4 px-4 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          返回{sourcePage === 'audit-records' ? '审核记录' : '报送管理'}
        </button>
      </div>
    );
  }

  const isDraft = report.auditStatus === '草稿';
  const isPending = report.auditStatus === '待审核';
  const isRejected = report.auditStatus === '被驳回' || report.auditStatus === '已驳回';
  const isAdopted = report.auditStatus === '已采纳' || report.auditStatus === '已通过';
  const isFinalPassedRecord =
    record?.auditResult === '已通过' && record.score !== undefined && record.score !== null;
  const auditCompletedStatuses = ['已通过', '已采纳', '待转办', '已转办'];
  // 指定演示记录：台中市秋季旅游推广媒体传播分析
  const isTourismFlowRecord = record.title === '台中市秋季旅游推广媒体传播分析';
  const tourismFlowTimeline: TimelineNode[] = [
    { title: '提交上报', operator: '李四·台中市网信办', time: '2026-08-12 09:15', status: 'completed' },
    {
      title: '审核处理',
      operator: '王主任·市委宣传部舆情科',
      time: '2026-08-12 10:30',
      status: 'rejected',
      note: '材料不完整：缺少权威媒体报道链接与传播数据截图，请补充后重新提交。'
    },
    { title: '提交上报（重新提交）', operator: '李四·台中市网信办', time: '2026-08-13 09:10', status: 'completed' },
    {
      title: '审核处理',
      operator: '王主任·市委宣传部舆情科',
      time: '2026-08-13 11:20',
      status: 'completed',
      note: '补充材料符合要求，审核通过，进入下一节点。'
    },
    { title: '审核处理', operator: '李明·市网信办复核组', status: 'current', note: '待审核' },
    { title: '审核处理', operator: '赵宁·市网信办终审组', status: 'pending', note: '等待处理' },
    { title: '结束', operator: '流程结束', status: 'pending', note: '等待结论' }
  ];
  // 右侧流转状态展示所使用的“实时状态”
  const flowAuditStatus =
    isTourismFlowRecord
      ? '审核中'
      : isFinalPassedRecord || auditCompletedStatuses.includes(report.auditStatus)
        ? '已采纳'
        : report.auditStatus;
  // 本条记录即终审通过记录时，流转按“完整审核 → 已采纳”展示，保证最后一个审核环节带评分
  // 速报审核已完成（已通过/已采纳/待转办/已转办）时，状态统一收口为“已采纳”
  // 标题旁状态与右侧流转状态保持一致：
  // 流转收口为“已采纳”则显示已采纳；驳回显示“已驳回”；其余按流转实时状态显示
  const titleStatusText = (() => {
    if (flowAuditStatus === '被驳回') return '已驳回';
    return flowAuditStatus;
  })();
  const conclusionScore = record?.score ?? '--';
  // 评分以“终审/最后一轮审核”为准：优先取流程真实终审分，
  // 若速报实时对象暂无分，则取本条审核记录自带的通过评分（保证流转末环节显示评分）。
  const resolvedFinalScore =
    getFinalAuditScore(report) ??
    (record?.auditResult === '已通过' && record.score !== undefined ? record.score : undefined);
  const finalScore = resolvedFinalScore;
  // 流转状态固定按“提交 → 各级审核 → 结束”的完整节点链展示，
  // 以速报当前实时状态推导，避免残缺历史时间线导致节点缺失。
  const flowReport: ReportItem = {
    ...report,
    timeline: isTourismFlowRecord ? tourismFlowTimeline : undefined,
    auditStatus: flowAuditStatus,
    score: resolvedFinalScore !== undefined ? resolvedFinalScore : report.score
  };

  const detail = report.detailContent || {
    summary: '多名网民在微信群和短视频平台反映西坝区阳光花园一期、明月居等小区突发停水。经初步核查，受影响范围涉及居民约3万人。',
    coreDemands: '建议区政府协调水务集团查明原因并公布预计恢复时间，保障居民基本用水。',
    publicOpinionTrend: '本地同城话题阅读量持续上升，暂未发现线下聚集，但个别自媒体开始传播未经核实的停水范围。',
    recommendations: [
      '1. 建议区政府立即协调水务集团查明停水原因，并明确预计恢复供水时间。',
      '2. 通过官方渠道（微博、微信公众号）紧急发布停水情况说明，澄清不实传言。',
      '3. 若短时间内无法恢复，建议安排应急送水车前往受影响小区，保障居民基本用水需求。'
    ]
  };

  const attachments = report.attachments || [
    { id: 'a1', name: '现场网民留言截图1.png', size: '1.2 MB', type: 'image', thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&auto=format&fit=crop' },
    { id: 'a2', name: '网格巡查记录单.pdf', size: '2.4 MB', type: 'pdf' }
  ];

  const handleCopySummary = () => {
    const text = `【速报标题】${report.title}\n【发生地址】${report.occurAddress || report.region}\n【信息类型】${report.infoType}（${report.source}）\n【上报机构】${report.organization} · ${report.author}\n【报送时间】${report.submitTime}\n【内容摘要】${detail.summary}\n【核心诉求】${detail.coreDemands}\n【处置建议】\n${Array.isArray(detail.recommendations) ? detail.recommendations.join('\n') : detail.recommendations}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveAndResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ReportItem = {
      ...report,
      title: editTitle,
      occurAddress: editAddress,
      source: editSource,
      region: editRegion,
      infoType: editInfoType,
      detailContent: {
        ...report.detailContent,
        summary: editSummary,
        coreDemands: editCoreDemands,
        publicOpinionTrend: report.detailContent?.publicOpinionTrend || '平稳',
        recommendations: report.detailContent?.recommendations || []
      }
    };

    if (onResubmitReport) {
      onResubmitReport(updated);
    }
    setIsEditModalOpen(false);
  };

  const renderMainContentCard = () => (
    <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200/80 shadow-2xs space-y-5">
      {/* Title & Status Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center flex-wrap gap-2.5">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
            {report.title}
          </h1>
          <ReportOriginBadge label={report.originLabel === '重复' ? '重复' : report.originLabel === '识别中' ? '识别中' : '首发'} size="md" />
        </div>
        <span
          className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-md border ${
            titleStatusText === '已驳回'
              ? 'bg-rose-50 text-rose-600 border-rose-200'
              : titleStatusText === '已采纳'
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : titleStatusText === '待审核' || titleStatusText === '审核中'
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200'
          }`}
        >
          {titleStatusText}
        </span>
      </div>

      {/* Sub-meta: Author & Organization, Submit Time */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500 pt-0.5">
        <div className="flex items-center space-x-1.5">
          <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-gray-700 font-normal">
            {report.author} {report.organization && <span>({report.organization})</span>}
          </span>
        </div>
        <div className="flex items-center space-x-1.5 font-mono text-gray-500">
          <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{report.submitTime}</span>
        </div>
        {finalScore !== undefined && (
          <div className="flex items-center space-x-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-bold font-mono">
            <span>评分：{finalScore} 分</span>
          </div>
        )}
      </div>

      {/* 4-Item Meta Grid (Matching screenshot layout) */}
      <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-gray-400 font-normal block mb-1">信息来源</span>
          <span className="text-gray-900 font-bold block">{report.source || '群众举报'}</span>
        </div>
        <div>
          <span className="text-gray-400 font-normal block mb-1">所属区域</span>
          <span className="text-gray-900 font-bold block">{report.region || '西屯区'}</span>
        </div>
        <div>
          <span className="text-gray-400 font-normal block mb-1">信息类型</span>
          <span className="text-gray-900 font-bold block">{report.infoType || '突发事件'}</span>
        </div>
        <div>
          <span className="text-gray-400 font-normal block mb-1">发生地址</span>
          <span className="text-gray-900 font-bold block">{report.occurAddress || '未填'}</span>
        </div>
      </div>

      {/* Structured Content Sections */}
      <div className="space-y-4 text-xs text-gray-700 pt-1">
        {/* 【内容摘要】 */}
        <div className="space-y-1.5">
          <div className="font-bold text-gray-900 text-xs">【内容摘要】</div>
          <div className="bg-[#F8F9FA] border border-gray-100 rounded-xl p-3.5 sm:p-4 text-xs text-gray-700 leading-relaxed font-normal">
            {detail.summary}
          </div>
        </div>

        {/* 【核心诉求】 */}
        {detail.coreDemands && (
          <div className="space-y-1.5">
            <div className="font-bold text-gray-900 text-xs">【核心诉求】</div>
            <div className="bg-[#F8F9FA] border border-gray-100 rounded-xl p-3.5 sm:p-4 text-xs text-gray-700 leading-relaxed font-normal">
              {detail.coreDemands}
            </div>
          </div>
        )}

        {/* 【舆情态势】 */}
        {detail.publicOpinionTrend && (
          <div className="space-y-1.5">
            <div className="font-bold text-gray-900 text-xs">【舆情态势】</div>
            <div className="bg-[#F8F9FA] border border-gray-100 rounded-xl p-3.5 sm:p-4 text-xs text-gray-700 leading-relaxed font-normal">
              {detail.publicOpinionTrend}
            </div>
          </div>
        )}

        {/* 【建议举措 / 处置建议】 */}
        {detail.recommendations && (
          <div className="space-y-1.5">
            <div className="font-bold text-gray-900 text-xs">【建议举措 / 处置建议】</div>
            <div className="bg-[#F8F9FA] border border-gray-100 rounded-xl p-3.5 sm:p-4 text-xs text-gray-700 space-y-2 leading-relaxed font-normal">
              {Array.isArray(detail.recommendations) ? (
                detail.recommendations.map((rec, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {rec}
                  </p>
                ))
              ) : (
                <p className="leading-relaxed whitespace-pre-line">{detail.recommendations}</p>
              )}
            </div>
          </div>
        )}

        {/* 【同源地址】 */}
        <div className="space-y-1.5">
          <div className="font-bold text-gray-900 text-xs">【同源地址】</div>
          <div className="bg-[#F8F9FA] border border-gray-100 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <a
              href={report.matchUrl || 'https://news.example.com/'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs font-mono text-[#1E5ABB] hover:text-[#134092] transition-colors truncate min-w-0 max-w-[460px] group cursor-pointer"
              title={report.matchUrl || 'https://news.example.com/'}
            >
              <span className="truncate underline underline-offset-2 decoration-blue-300 group-hover:decoration-blue-600">
                {report.matchUrl || 'https://news.example.com/'}
              </span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAttachmentsCard = () => (
    <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center space-x-2 text-sm font-bold text-gray-900">
          <Paperclip className="w-4 h-4 text-[#1E5ABB]" />
          <span>附件证据材料</span>
        </div>
        <span className="text-xs text-gray-400">共 {attachments.length} 份佐证材料</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
        {attachments.map((att) => (
          <div
            key={att.id}
            className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/40 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            {att.type === 'image' ? (
              <div
                className="w-full h-28 bg-gray-100 overflow-hidden relative flex items-center justify-center cursor-pointer group"
                onClick={() => setPreviewAttachment(att)}
                title="点击预览图片"
              >
                <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded flex items-center space-x-1 max-w-[90%]">
                  <span className="truncate">{att.name}</span>
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                  <span className="px-3 py-1 bg-black/70 text-white rounded-full text-xs font-medium flex items-center space-x-1 backdrop-blur-xs">
                    <Eye className="w-3.5 h-3.5" />
                    <span>点击预览</span>
                  </span>
                </div>
                <img
                  src={att.thumbnailUrl || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&auto=format&fit=crop'}
                  alt={att.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            ) : att.type === 'pdf' || att.name.toLowerCase().endsWith('.pdf') ? (
              <div
                className="w-full h-28 bg-rose-50/40 flex flex-col items-center justify-center text-rose-600 relative p-4 cursor-pointer group border-b border-gray-100"
                onClick={() => setPreviewAttachment(att)}
                title="点击在线预览 PDF 专报"
              >
                <div className="absolute top-2 left-2 z-10 bg-rose-600/90 backdrop-blur-xs text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                  PDF 文档
                </div>
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                  <span className="px-3 py-1 bg-black/70 text-white rounded-full text-xs font-medium flex items-center space-x-1 backdrop-blur-xs">
                    <Eye className="w-3.5 h-3.5" />
                    <span>在线阅读</span>
                  </span>
                </div>
                <FileText className="w-9 h-9 text-rose-500 group-hover:scale-110 transition-transform" />
                <span className="mt-1.5 text-xs font-medium text-gray-800 truncate w-full text-center">
                  {att.name}
                </span>
              </div>
            ) : (
              <div
                className="w-full h-28 bg-blue-50/40 flex flex-col items-center justify-center text-[#1E5ABB] relative p-4 cursor-pointer group border-b border-gray-100"
                onClick={() => setPreviewAttachment(att)}
                title="点击在线预览数据表格"
              >
                <div className="absolute top-2 left-2 z-10 bg-[#1E5ABB]/90 backdrop-blur-xs text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                  数据表格
                </div>
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                  <span className="px-3 py-1 bg-black/70 text-white rounded-full text-xs font-medium flex items-center space-x-1 backdrop-blur-xs">
                    <Eye className="w-3.5 h-3.5" />
                    <span>查看表格</span>
                  </span>
                </div>
                <FileSpreadsheet className="w-9 h-9 text-[#1E5ABB] group-hover:scale-110 transition-transform" />
                <span className="mt-1.5 text-xs font-medium text-gray-700 truncate w-full text-center">
                  {att.name}
                </span>
              </div>
            )}

            <div className="p-2.5 bg-white border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span className="truncate pr-2">{att.size}</span>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(att)}
                  className="text-[#1E5ABB] hover:underline cursor-pointer flex items-center space-x-0.5 font-medium"
                >
                  <Eye className="w-3 h-3" />
                  <span>预览</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCurrentNodeConclusionCard = () => (
    <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center space-x-2">
          <CheckSquare className="w-4 h-4 text-[#1E5ABB]" />
          <h3 className="text-sm font-bold text-gray-800">本节点审核结论</h3>
        </div>
        <span className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
          节点记录
        </span>
      </div>

      {record?.auditResult === '已通过' ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>已通过</span>
            </p>
            {record.score !== undefined && record.score !== null && (
              <span className="shrink-0 rounded-lg border border-emerald-200 bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-700">
                评分：{record.score}分
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] text-emerald-700">
            审核人：{record.auditor || '—'} · {record.auditTime || '—'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5">
          <p className="flex items-center space-x-1.5 text-xs font-bold text-rose-900">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>已驳回</span>
          </p>
          <p className="mt-2 text-[11px] text-rose-700">
            审核人：{record.auditor || '—'} · {record.auditTime || '—'}
          </p>
          <div className="mt-2 rounded-lg border border-rose-200/80 bg-white/70 px-3 py-2 text-[11px] leading-relaxed text-rose-800">
            <strong>驳回原因：</strong>{record.rejectReason || '信息不完整，请补充相关证明材料后重新提交。'}
            {record.rejectDetail && (
              <p className="mt-1 text-rose-700">{record.rejectDetail}</p>
            )}
          </div>
        </div>
      )}

      <p className="text-[10px] leading-relaxed text-gray-400">
        仅代表该审核节点当时的结论；速报当前的实时整体进度请见下方流转状态。
      </p>
    </div>
  );

  const renderDrawerActionBar = () => (
    <div
      id="audit-record-drawer-bottom-bar"
      className="shrink-0 bg-white/98 backdrop-blur-md border-t border-slate-200/90 px-6 py-5 min-h-[84px] shadow-[0_-8px_24px_rgba(15,23,42,0.06)] z-20 flex items-center justify-between gap-5"
    >
      {/* 左侧：本节点审核结论记录 */}
      <div className="flex items-center space-x-3.5 text-xs min-w-0">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${
            record?.auditResult === '已通过'
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : 'bg-rose-50 text-rose-600 border-rose-200'
          }`}
        >
          {record?.auditResult === '已通过' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
        </div>
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center flex-wrap gap-2.5">
            <span className="text-xs font-bold text-slate-800 tracking-tight">
              本节点审核结论记录：
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-md text-xs font-bold shrink-0 ${
                record?.auditResult === '已通过'
                  ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-100/90 text-rose-800 border border-rose-200'
              }`}
            >
              {record?.auditResult === '已通过' ? '已通过' : '已驳回'}
            </span>
            {record?.auditResult === '已通过' && record?.score !== undefined && record?.score !== null && (
              <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold font-mono shrink-0">
                评分：{record.score}分
              </span>
            )}
            {record?.auditResult !== '已通过' && (
              <span className="text-xs text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200 truncate max-w-[320px]">
                驳回原因：{record?.rejectReason || '信息不完整'}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 truncate">
            <span>审核人：<strong className="text-slate-700 font-medium">{record?.auditor || '王主任'}</strong></span>
            <span className="text-slate-300">|</span>
            <span>审核机构：<strong className="text-slate-700 font-medium">{record?.auditorOrg || record?.organization || '市委网信办'}</strong></span>
            <span className="text-slate-300">|</span>
            <span>审核时间：<span className="font-mono text-slate-600">{record?.auditTime || report?.auditTime || '—'}</span></span>
          </div>
        </div>
      </div>

      {/* 右侧：关闭操作按钮 */}
      <div className="flex items-center space-x-3 shrink-0">
        <button
          type="button"
          onClick={handleClose}
          className="px-5 py-2.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold rounded-lg shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          关闭
        </button>
      </div>
    </div>
  );

  // 1. 抽屉模式展示 (占当前界面的 50%，右侧抽屉展示)
  if (isDrawer) {
    return (
      <div
        className="fixed inset-0 z-50 overflow-hidden"
        id="audit-record-detail-drawer"
        role="dialog"
        aria-modal="true"
      >
        {/* 遮罩背景 (点击快速关闭抽屉) */}
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 cursor-pointer"
          onClick={handleClose}
        />

        {/* 50% 宽度右侧抽屉主体容器 */}
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[90vw] md:w-[75vw] lg:w-1/2 xl:w-1/2 bg-[#F8FAFC] shadow-2xl flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-250">
          {/* 抽屉顶部 Tab 导航 (详情信息 vs 流转状态) 与关闭按钮 */}
          <div className="bg-white px-5 border-b border-gray-200 flex items-center justify-between shrink-0 shadow-2xs">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                id="tab-drawer-record-detail"
                onClick={() => setDrawerActiveTab('detail')}
                className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
                  drawerActiveTab === 'detail'
                    ? 'border-[#1E5ABB] text-[#1E5ABB]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>详情信息</span>
              </button>
              <button
                type="button"
                id="tab-drawer-record-flow"
                onClick={() => setDrawerActiveTab('flow')}
                className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
                  drawerActiveTab === 'flow'
                    ? 'border-[#1E5ABB] text-[#1E5ABB]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <History className="w-4 h-4" />
                <span>流转状态</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
                title="关闭抽屉 (Esc)"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* 抽屉内部滚动区域 */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {drawerActiveTab === 'detail' ? (
              <div className="space-y-4 animate-in fade-in duration-150 pb-2">
                {renderMainContentCard()}
                {renderAttachmentsCard()}
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-150 pb-2">
                <AuditFlowTimeline
                  report={flowReport}
                  headerNote="实时 · 整体流程"
                  rejectedLabel="已驳回"
                  myRejectedNode={
                    record?.auditResult === '被驳回'
                      ? {
                          auditor: record.auditor || '—',
                          org: record.auditorOrg || record.organization || '—',
                          time: record.auditTime,
                          comment: record.rejectDetail || record.rejectReason || ''
                        }
                      : null
                  }
                />
              </div>
            )}
          </div>

          {/* 抽屉底部固定操作栏 */}
          {renderDrawerActionBar()}
        </div>

        {/* 附件全屏预览弹窗 (z-[70]) */}
        <AttachmentPreviewModal
          isOpen={!!previewAttachment}
          onClose={() => setPreviewAttachment(null)}
          attachment={previewAttachment}
          attachments={attachments}
          onSelectAttachment={(att) => setPreviewAttachment(att)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full" id="report-detail-view">
      {/* 1. Breadcrumbs & Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-2xs">
        <div className="flex items-center space-x-2 text-xs">
          {sourcePage === 'audit-records' ? (
            <>
              <span className="text-gray-500 font-medium">审核管理</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              <button
                onClick={() => onNavigate('audit-records')}
                className="text-gray-600 hover:text-[#1E5ABB] hover:underline font-medium flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <span>审核记录</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              <span className="text-gray-900 font-bold">审核详情</span>
            </>
          ) : (
            <>
              <span className="text-gray-500 font-medium">报送管理</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              <button
                onClick={() => onNavigate('report-summary')}
                className="text-gray-600 hover:text-[#1E5ABB] hover:underline font-medium flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <span>报送记录</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              <span className="text-gray-900 font-bold">报送详情</span>
            </>
          )}
        </div>

        {/* Dynamic Action Buttons according to Status & Entry Source */}
        <div className="flex items-center space-x-2">
          {/* If from Report Management and Draft or Rejected: Edit / Resubmit */}
          {sourcePage !== 'audit-records' && (isDraft || isRejected) && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg text-xs font-semibold shadow-2xs flex items-center space-x-1 cursor-pointer"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>{isRejected ? '修改补充并重新提交' : '编辑草稿'}</span>
            </button>
          )}

          {/* If from Report Management and Pending: Withdraw (Hidden in Audit Records) */}
          {sourcePage !== 'audit-records' && isPending && onWithdrawReport && (
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>撤回报送</span>
            </button>
          )}

          {/* Copy Standardized Summary */}
          <button
            onClick={handleCopySummary}
            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium flex items-center space-x-1 cursor-pointer"
            title="一键复制标准化汇报文稿"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '已复制文稿' : '复制文稿'}</span>
          </button>

          {/* If from Report Management and Draft or Rejected: Delete */}
          {sourcePage !== 'audit-records' && (isDraft || isRejected) && onDeleteReport && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-medium cursor-pointer"
              title="删除记录"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Columns: Information & Content */}
        <div className="lg:col-span-2 space-y-5">
          {renderMainContentCard()}
          {renderAttachmentsCard()}
        </div>

        {/* Right 1 Column: Audit Workflow & Timeline */}
        <div className="space-y-5">
          {renderCurrentNodeConclusionCard()}

          {/* 2. 实时整体流转状态 */}
          <AuditFlowTimeline
            report={flowReport}
            headerNote="实时 · 整体流程"
            rejectedLabel="已驳回"
            myRejectedNode={
              record?.auditResult === '被驳回'
                ? {
                    auditor: record.auditor || '—',
                    org: record.auditorOrg || record.organization || '—',
                    time: record.auditTime,
                    comment: record.rejectDetail || record.rejectReason || ''
                  }
                : null
            }
          />
        </div>
      </div>

      {/* Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-gray-200">
            <div className="flex items-center space-x-3 text-amber-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-gray-900">确认撤回报送？</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              撤回后该速报将转为<strong>草稿</strong>状态，审核人员将暂停审核。您可以继续完善内容后再重新送审。
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (onWithdrawReport) {
                    onWithdrawReport(report.id);
                  }
                  setIsWithdrawModalOpen(false);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                确认撤回
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-gray-200">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-gray-900">确认删除？</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              确定要删除此条报送记录吗？删除后数据无法找回。
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (onDeleteReport) {
                    onDeleteReport(report.id);
                  }
                  setIsDeleteModalOpen(false);
                  onNavigate('report-summary');
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <FileEdit className="w-5 h-5 text-[#1E5ABB]" />
                <h3 className="text-base font-bold text-gray-900">
                  {isRejected ? '修改补充并重新提交' : '编辑草稿速报'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer font-mono"
              >
                ✕
              </button>
            </div>

            {report.rejectReason && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                <p className="font-bold flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>原审核驳回意见：</span>
                </p>
                <p className="mt-1 pl-4.5">{report.rejectReason}</p>
              </div>
            )}

            <form onSubmit={handleSaveAndResubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">事件标题 *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1E5ABB] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">发生地址 *</label>
                  <input
                    type="text"
                    required
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1E5ABB] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">涉及区域 *</label>
                  <select
                    value={editRegion}
                    onChange={(e) => setEditRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none"
                  >
                    <option value="西坝区">西坝区</option>
                    <option value="南坝区">南坝区</option>
                    <option value="北屯区">北屯区</option>
                    <option value="全市">全市</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">信息类型 *</label>
                  <select
                    value={editInfoType}
                    onChange={(e) => setEditInfoType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none"
                  >
                    <option value="突发事件">突发事件</option>
                    <option value="舆情动态">舆情动态</option>
                    <option value="政策解读">政策解读</option>
                    <option value="民生诉求">民生诉求</option>
                    <option value="网络谣言">网络谣言</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">内容摘要 *</label>
                <textarea
                  rows={3}
                  required
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1E5ABB] outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">核心诉求</label>
                <textarea
                  rows={2}
                  value={editCoreDemands}
                  onChange={(e) => setEditCoreDemands(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1E5ABB] outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg font-semibold shadow-sm flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>提交重新送审</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rich Attachment Preview Modal */}
      <AttachmentPreviewModal
        isOpen={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
        attachment={previewAttachment}
        attachments={attachments}
        onSelectAttachment={(att) => setPreviewAttachment(att)}
      />
    </div>
  );
};
