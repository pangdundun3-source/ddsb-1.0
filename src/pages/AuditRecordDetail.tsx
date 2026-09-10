import React, { useState } from 'react';
import { AuditRecordItem, ReportItem, PageId, Attachment, TimelineNode } from '../types';
import { IdentificationBadge } from '../components/IdentificationBadge';
import { resolveIdentification } from '../services/identificationService';
import {
  FileText,
  Paperclip,
  CheckCircle2,
  Clock,
  CheckSquare,
  ExternalLink,
  FileSpreadsheet,
  Copy,
  Check,
  Undo2,
  FileEdit,
  Trash2,
  AlertCircle,
  User,
  Download,
  History,
  Eye,
  X
} from 'lucide-react';
import { AttachmentPreviewModal } from '../components/AttachmentPreviewModal';
import { AuditFlowTimeline } from '../components/AuditFlowTimeline';
import { getFinalAuditScore } from '../auditStage';
import { getOrganizationPathText } from '../components/OrgPathDisplay';

interface AuditRecordDetailProps {
  record: AuditRecordItem | null;
  allReports?: ReportItem[];
  sourcePage?: PageId;
  onNavigate: (page: PageId) => void;
  onWithdrawReport?: (id: number) => void;
  onResubmitReport?: (report: ReportItem) => void;
  onDeleteReport?: (id: number) => void;
}

export const AuditRecordDetail: React.FC<AuditRecordDetailProps> = ({
  record,
  allReports = [],
  sourcePage = 'audit-records',
  onNavigate,
  onWithdrawReport,
  onResubmitReport,
  onDeleteReport
}) => {
  const [activeTab, setActiveTab] = useState<'detail' | 'timeline'>('detail');
  const [copied, setCopied] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  const report: ReportItem | null = record
    ? (() => {
        const found = allReports.find((r) => r.id === record.reportId || r.title === record.title);

        // 优先使用速报实时对象：整体状态与流转时间线随速报当前进度展示。
        // 本条审核记录只代表“某个审核节点当时”的结论，不覆盖速报整体状态。
        if (found) {
          return {
            ...found,
            identificationStatus: record.identificationStatus || found.identificationStatus,
            auditor: record.auditor || found.auditor,
            auditTime: record.auditTime || found.auditTime,
            rejectReason: record.rejectReason ?? found.rejectReason,
            rejectDetail: record.rejectDetail ?? found.rejectDetail
          };
        }

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
          identificationStatus: record.identificationStatus || '首发',
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
          timeline: undefined
        };
      })()
    : null;

  // Edit form state
  const [editTitle, setEditTitle] = useState(report?.title || '');
  const [editAddress, setEditAddress] = useState(report?.occurAddress || '');
  const [editSummary, setEditSummary] = useState(report?.detailContent?.summary || '');
  const [editCoreDemands, setEditCoreDemands] = useState(report?.detailContent?.coreDemands || '');
  const [editSource, setEditSource] = useState(report?.source || '群众举报');
  const [editRegion, setEditRegion] = useState(report?.region || '西坝区');
  const [editInfoType, setEditInfoType] = useState(report?.infoType || '突发事件');

  if (!report || !record) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden" id="audit-record-detail-drawer-root">
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity cursor-pointer"
          onClick={() => onNavigate(sourcePage === 'audit-records' ? 'audit-records' : 'report-summary')}
        />
        <div className="fixed inset-y-0 right-0 z-50 w-full md:w-1/2 lg:w-1/2 bg-white shadow-2xl flex flex-col border-l border-gray-200 p-8 text-center justify-center text-gray-500">
          <p className="text-sm">未选择审核记录，请返回审核记录列表选择。</p>
          <button
            onClick={() => onNavigate(sourcePage === 'audit-records' ? 'audit-records' : 'report-summary')}
            className="mt-4 px-4 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg text-xs font-semibold cursor-pointer mx-auto"
          >
            返回{sourcePage === 'audit-records' ? '审核记录' : '报送管理'}
          </button>
        </div>
      </div>
    );
  }

  const isPending = report.auditStatus === '待审核';
  const isRejected = report.auditStatus === '被驳回' || report.auditStatus === '已驳回';
  const isAdopted = report.auditStatus === '已采纳' || report.auditStatus === '已通过';
  const isFinalPassedRecord =
    record.auditResult === '已通过' && record.score !== undefined && record.score !== null;
  const auditCompletedStatuses = ['已通过', '已采纳', '待转办', '已转办'];

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

  const flowAuditStatus =
    isTourismFlowRecord
      ? '审核中'
      : isFinalPassedRecord || auditCompletedStatuses.includes(report.auditStatus)
        ? '已采纳'
        : report.auditStatus;

  const titleStatusText = (() => {
    if (flowAuditStatus === '被驳回') return '已驳回';
    return flowAuditStatus;
  })();

  const resolvedFinalScore =
    getFinalAuditScore(report) ??
    (record.auditResult === '已通过' && record.score !== undefined ? record.score : undefined);
  const finalScore = resolvedFinalScore;

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

  const handleClose = () => {
    onNavigate(sourcePage === 'audit-records' ? 'audit-records' : 'report-summary');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="audit-record-detail-drawer-root">
      {/* 1. Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* 2. 50% Right-side Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full lg:w-1/2 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out border-l border-gray-200 animate-in slide-in-from-right duration-300"
        id="audit-record-detail-drawer"
      >
        {/* Drawer Top Header with Tabs & Actions */}
        <div className="h-14 px-5 sm:px-6 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-6 h-full">
            <button
              type="button"
              onClick={() => setActiveTab('detail')}
              className={`h-full flex items-center space-x-1.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'detail'
                  ? 'text-[#1E5ABB] border-[#1E5ABB]'
                  : 'text-gray-500 hover:text-gray-800 border-transparent'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>详情信息</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`h-full flex items-center space-x-1.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'timeline'
                  ? 'text-[#1E5ABB] border-[#1E5ABB]'
                  : 'text-gray-500 hover:text-gray-800 border-transparent'
              }`}
            >
              <History className="w-4 h-4" />
              <span>流转状态</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="关闭详情 (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8FAFC] space-y-4">
          {activeTab === 'detail' ? (
            <div className="space-y-4">
              {/* 1. 速报主要信息卡片 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100/90 shadow-2xs space-y-4">
                {/* Title & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                        {report.title}
                      </h1>
                      <IdentificationBadge
                        status={record.identificationStatus || report.identificationStatus || resolveIdentification(report).status || '首发'}
                        size="sm"
                        showIcon
                      />
                    </div>
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

                {/* Sub-meta: Author, Organization, Time */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 pt-0.5 border-t border-gray-100 pt-3">
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-gray-700 font-normal">
                      {report.author} {report.organization && <span className="text-gray-500">({report.organization})</span>}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-mono text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>报送时间：{report.submitTime}</span>
                  </div>
                  {finalScore !== undefined && (
                    <div className="flex items-center space-x-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-bold font-mono">
                      <span>终审分：{finalScore} 分</span>
                    </div>
                  )}
                </div>

                {/* Structured Content Sections */}
                <div className="space-y-3.5 text-xs text-gray-700 pt-1">
                  {/* 【内容摘要】 */}
                  <div className="space-y-1.5">
                    <div className="font-bold text-gray-900 text-xs">【内容摘要】</div>
                    <div className="bg-[#F8F9FA] border border-gray-100 rounded-lg p-3.5 text-xs text-gray-700 leading-relaxed font-normal">
                      {detail.summary}
                    </div>
                  </div>

                  {/* 【核心诉求】 */}
                  {detail.coreDemands && (
                    <div className="space-y-1.5">
                      <div className="font-bold text-gray-900 text-xs">【核心诉求】</div>
                      <div className="bg-[#F8F9FA] border border-gray-100 rounded-lg p-3.5 text-xs text-gray-700 leading-relaxed font-normal">
                        {detail.coreDemands}
                      </div>
                    </div>
                  )}

                  {/* 【舆情态势】 */}
                  {detail.publicOpinionTrend && (
                    <div className="space-y-1.5">
                      <div className="font-bold text-gray-900 text-xs">【舆情态势】</div>
                      <div className="bg-[#F8F9FA] border border-gray-100 rounded-lg p-3.5 text-xs text-gray-700 leading-relaxed font-normal">
                        {detail.publicOpinionTrend}
                      </div>
                    </div>
                  )}

                  {/* 【建议举措 / 处置建议】 */}
                  {detail.recommendations && (
                    <div className="space-y-1.5">
                      <div className="font-bold text-gray-900 text-xs">【建议举措 / 处置建议】</div>
                      <div className="bg-[#F8F9FA] border border-gray-100 rounded-lg p-3.5 text-xs text-gray-700 space-y-1.5 leading-relaxed font-normal">
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
                    <div className="bg-[#F4F8FF] border border-[#D9E7FD] rounded-lg p-3 flex items-center justify-between gap-3 text-xs">
                      <a
                        href={report.matchUrl || 'https://news.example.com/'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1E5ABB] font-mono truncate text-xs hover:underline flex-1"
                        title={report.matchUrl || 'https://news.example.com/'}
                      >
                        {report.matchUrl || 'https://news.example.com/'}
                      </a>
                      <a
                        href={report.matchUrl || 'https://news.example.com/'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-white hover:bg-blue-50 text-[#1E5ABB] border border-[#BFD7FE] rounded-md font-medium text-xs shrink-0 flex items-center space-x-1 shadow-2xs cursor-pointer transition-colors"
                      >
                        <span>访问链接</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. 附件证据材料卡片 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-gray-900">
                    <Paperclip className="w-4 h-4 text-[#1E5ABB]" />
                    <span>附件证据材料</span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">共 {attachments.length} 份佐证材料</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/40 hover:border-blue-400 hover:shadow-xs transition-all group flex flex-col justify-between"
                    >
                      {att.type === 'image' ? (
                        <div
                          className="w-full h-28 bg-gray-100 overflow-hidden relative flex items-center justify-center cursor-pointer group"
                          onClick={() => setPreviewAttachment(att)}
                          title="点击预览图片"
                        >
                          <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded flex items-center space-x-1 max-w-[90%]">
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
                          className="w-full h-28 bg-rose-50/40 flex flex-col items-center justify-center text-rose-600 relative p-3 cursor-pointer group border-b border-gray-100"
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
                          <FileText className="w-8 h-8 text-rose-500 group-hover:scale-110 transition-transform" />
                          <span className="mt-1.5 text-xs font-medium text-gray-800 truncate w-full text-center">
                            {att.name}
                          </span>
                        </div>
                      ) : (
                        <div
                          className="w-full h-28 bg-blue-50/40 flex flex-col items-center justify-center text-[#1E5ABB] relative p-3 cursor-pointer group border-b border-gray-100"
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
                          <FileSpreadsheet className="w-8 h-8 text-[#1E5ABB] group-hover:scale-110 transition-transform" />
                          <span className="mt-1.5 text-xs font-medium text-gray-700 truncate w-full text-center">
                            {att.name}
                          </span>
                        </div>
                      )}

                      <div className="p-2 bg-white border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
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
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={() => alert(`正在下载附件：${att.name}`)}
                            className="text-gray-600 hover:text-[#1E5ABB] hover:underline cursor-pointer flex items-center space-x-0.5 font-medium"
                          >
                            <Download className="w-3 h-3" />
                            <span>下载</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* 流转状态 Timeline View */
            <AuditFlowTimeline
              report={flowReport}
              headerNote="实时 · 整体流程"
              rejectedLabel="已驳回"
              myRejectedNode={
                record.auditResult === '被驳回'
                  ? {
                      auditor: record.auditor || '—',
                      org: record.auditorOrg || record.organization || '—',
                      time: record.auditTime,
                      comment: record.rejectDetail || record.rejectReason || ''
                    }
                  : null
              }
            />
          )}
        </div>

        {/* Drawer Bottom Action Bar */}
        <div className="shrink-0 bg-white border-t border-gray-200 px-5 sm:px-6 py-3.5 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] z-20 flex items-center justify-between gap-3">
          {sourcePage === 'audit-records' ? (
            /* Audit records node conclusion style (Screenshot 1) */
            <>
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isRejected
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  }`}
                >
                  {isRejected ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-sm font-bold text-gray-900">
                      本节点审核结论记录：
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                        isRejected
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isRejected ? '已驳回' : '已通过'}
                    </span>
                    {!isRejected && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold">
                        评分：{finalScore !== undefined ? finalScore : (record.score || 92)}分
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    审核人：{record.auditor || '李审核'} &nbsp;|&nbsp; 审核机构：{record.auditOrg || '台中市网信办'} &nbsp;|&nbsp; 审核时间：{record.auditTime || '2023-10-24 15:00'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg text-sm font-medium cursor-pointer shadow-xs transition-colors"
                >
                  关闭
                </button>
              </div>
            </>
          ) : (
            /* Submitter view style (Screenshots 2 & 3) */
            <>
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isAdopted || record.auditStatus === '已采纳' || record.auditStatus === '已通过'
                      ? 'bg-[#E8F8F0] border-[#BDEBD0] text-[#10B981]'
                      : isPending
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : isRejected
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-blue-50 border-blue-200 text-blue-600'
                  }`}
                >
                  {isAdopted || record.auditStatus === '已采纳' || record.auditStatus === '已通过' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isPending ? (
                    <Clock className="w-5 h-5" />
                  ) : isRejected ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-sm font-bold text-gray-900">
                      报送状态：{titleStatusText}
                    </span>
                    {(isAdopted || record.score !== undefined) && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold">
                        终审评分：{finalScore ?? record.score ?? 94} 分
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-0.5 max-w-[480px]">
                    报送人：{record.author} · {getOrganizationPathText(record.organization)} · {record.submitTime || '2023-10-23 09:15'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {isRejected && (
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-3.5 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>修改补充并重新送审</span>
                  </button>
                )}

                {(isPending || isRejected) && onDeleteReport && (
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-medium flex items-center space-x-1.5 cursor-pointer transition-colors"
                    title="删除记录"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>删除报送</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-xs sm:text-sm font-normal cursor-pointer transition-colors shadow-2xs"
                >
                  关闭
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit & Resubmit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900 border-b pb-3">
              修改补充并重新送审
            </h3>
            <form onSubmit={handleSaveAndResubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">速报标题 *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1E5ABB] outline-none text-xs"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1E5ABB] outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">涉及区域 *</label>
                  <select
                    value={editRegion}
                    onChange={(e) => setEditRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none text-xs"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none text-xs"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1E5ABB] outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">核心诉求</label>
                <textarea
                  rows={2}
                  value={editCoreDemands}
                  onChange={(e) => setEditCoreDemands(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1E5ABB] outline-none text-xs"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg font-semibold shadow-sm flex items-center space-x-1.5 cursor-pointer"
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
