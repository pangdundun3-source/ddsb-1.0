import React, { useState } from 'react';
import { ReportItem, PageId, Attachment } from '../types';
import { getFinalAuditScore } from '../auditStage';
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
  Share2,
  Download,
  History,
  Eye,
  Sparkles,
  X
} from 'lucide-react';
import { AttachmentPreviewModal } from '../components/AttachmentPreviewModal';
import { AuditFlowTimeline } from '../components/AuditFlowTimeline';
import { getOrganizationPathText } from '../components/OrgPathDisplay';

interface ReportDetailProps {
  report: ReportItem | null;
  sourcePage?: PageId;
  onNavigate: (page: PageId) => void;
  onWithdrawReport?: (id: number) => void;
  onOpenEditReport?: (report: ReportItem) => void;
  onDeleteReport?: (id: number) => void;
}

export const ReportDetail: React.FC<ReportDetailProps> = ({
  report,
  sourcePage = 'report-summary',
  onNavigate,
  onWithdrawReport,
  onOpenEditReport,
  onDeleteReport
}) => {
  const [activeTab, setActiveTab] = useState<'detail' | 'timeline'>('detail');
  const [copied, setCopied] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  const handleClose = () => {
    onNavigate(sourcePage === 'report-records' ? 'report-records' : 'report-summary');
  };

  if (!report) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden" id="report-detail-drawer-root">
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity cursor-pointer"
          onClick={handleClose}
        />
        <div className="fixed inset-y-0 right-0 z-50 w-full md:w-1/2 lg:w-1/2 bg-white shadow-2xl flex flex-col border-l border-gray-200 p-8 text-center justify-center text-gray-500">
          <p className="text-sm">未选择速报记录，请返回报送管理列表选择。</p>
          <button
            onClick={handleClose}
            className="mt-4 px-4 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg text-xs font-semibold cursor-pointer mx-auto"
          >
            返回{sourcePage === 'report-records' ? '报送记录' : '报送管理'}
          </button>
        </div>
      </div>
    );
  }

  const isPending = report.auditStatus === '待审核';
  const isInReview = report.auditStatus === '审核中';
  const isRejected = report.auditStatus === '被驳回' || report.auditStatus === '已驳回';
  const isAdopted = report.auditStatus === '已采纳' || report.auditStatus === '已通过';
  const isWaitingTransfer = report.auditStatus === '待转办';
  const isTransferred = report.auditStatus === '已转办';
  const rejectReasonText = report.rejectReason || '信息不完整，请补充政策原文链接和现场排查核实依据后重新提交。';
  const rejectFollowUpText = '请点击下方【修改补充并重新提交】按钮补充修正后再次送审。';
  const finalScore = getFinalAuditScore(report);
  const ident = resolveIdentification(report);

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="report-detail-drawer-root">
      {/* 1. Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* 2. 50% Right-side Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full lg:w-1/2 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out border-l border-gray-200 animate-in slide-in-from-right duration-300"
        id="report-detail-drawer"
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
              title="关闭详情"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8FAFC] space-y-4">
          {activeTab === 'detail' ? (
            <div className="space-y-4">
              {/* 速报主要信息卡片 */}
              <div className="bg-white rounded-2xl border border-gray-100/90 shadow-2xs p-5 sm:p-6 space-y-4">
                {/* Title & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                        {report.title}
                      </h1>
                      <IdentificationBadge status={ident.status} size="sm" showIcon />
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-lg border ${
                      isPending
                        ? 'bg-[#FEF6E8] text-[#D97706] border-[#FDE68A]'
                        : isRejected
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}
                  >
                    {report.auditStatus}
                  </span>
                </div>

                {/* Sub-meta: Author, Org, Submit Time, Score, Template */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-gray-700 font-normal">
                      {report.author} {report.organization && <span className="text-gray-500">({report.organization})</span>}
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
                  {report.templateName && (
                    <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>模板：{report.templateName}</span>
                    </div>
                  )}
                </div>

                {/* 4-Column Structured Summary Box */}
                <div className="bg-[#F8FAFC] rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <div className="text-[11px] text-gray-400 font-medium">信息类型</div>
                    <div className="text-sm font-bold text-gray-900 mt-1">{report.infoType || report.opinionType || '舆情动态'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400 font-medium">来源渠道</div>
                    <div className="text-sm font-bold text-gray-900 mt-1">{report.channel || report.sourceChannel || '新闻网站'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400 font-medium">所属区域</div>
                    <div className="text-sm font-bold text-gray-900 mt-1">{report.region || report.occurArea || '全市'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400 font-medium">涉及人数</div>
                    <div className="text-sm font-bold text-gray-900 mt-1">{report.involvedCount || report.peopleCount || '50 人'}</div>
                  </div>
                </div>

                {/* Structured Content Sections */}
                <div className="space-y-4 text-xs text-gray-700 pt-1">
                  {/* 【内容摘要】 */}
                  <div className="space-y-1.5">
                    <div className="font-bold text-gray-900 text-xs">【内容摘要】</div>
                    <div className="bg-[#F8FAFC] rounded-xl p-3.5 text-xs text-gray-700 leading-relaxed font-normal">
                      {detail.summary}
                    </div>
                  </div>

                  {/* 【核心诉求】 */}
                  <div className="space-y-1.5">
                    <div className="font-bold text-gray-900 text-xs">【核心诉求】</div>
                    <div className="bg-[#F8FAFC] rounded-xl p-3.5 text-xs text-gray-700 leading-relaxed font-normal">
                      {detail.coreDemands || '建议区政府协调水务集团查明原因并公布预计恢复时间，保障居民基本用水。'}
                    </div>
                  </div>

                  {/* 【舆情态势】 */}
                  <div className="space-y-1.5">
                    <div className="font-bold text-gray-900 text-xs">【舆情态势】</div>
                    <div className="bg-[#F8FAFC] rounded-xl p-3.5 text-xs text-gray-700 leading-relaxed font-normal">
                      {detail.publicOpinionTrend || '本地同城话题阅读量持续上升，暂未发现线下聚集，但个别自媒体开始传播未经核实的停水范围。'}
                    </div>
                  </div>

                  {/* 【建议举措 / 处置建议】 */}
                  <div className="space-y-1.5">
                    <div className="font-bold text-gray-900 text-xs">【建议举措 / 处置建议】</div>
                    <div className="bg-[#F8FAFC] rounded-xl p-3.5 text-xs text-gray-700 space-y-1.5 leading-relaxed font-normal">
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

                  {/* 【同源地址】 */}
                  <div className="space-y-1.5">
                    <div className="font-bold text-gray-900 text-xs">【同源地址】</div>
                    <div className="bg-[#F0F6FF] border border-blue-100/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                      <a
                        href={report.matchUrl || 'https://news.example.com/'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-mono truncate text-xs hover:underline flex-1"
                        title={report.matchUrl || 'https://news.example.com/'}
                      >
                        {report.matchUrl || 'https://news.example.com/'}
                      </a>
                      <a
                        href={report.matchUrl || 'https://news.example.com/'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1 bg-white hover:bg-blue-50 text-[#1E5ABB] border border-blue-200 rounded-lg font-medium text-xs shrink-0 flex items-center space-x-1 shadow-2xs cursor-pointer transition-colors"
                      >
                        <span>访问</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* 附件证据材料卡片 */}
              <div className="bg-white rounded-2xl border border-gray-100/90 shadow-2xs p-5 sm:p-6 space-y-4">
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
            <AuditFlowTimeline report={report} headerNote="实时 · 整体流程" />
          )}
        </div>

        {/* Drawer Bottom Action Bar */}
        <div className="shrink-0 bg-white border-t border-gray-200 px-5 sm:px-6 py-3.5 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] z-20 flex items-center justify-between gap-3">
          {/* Left info badge and submitter metadata */}
          <div className="flex items-center space-x-3 min-w-0">
            {/* Status Icon */}
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                isAdopted || report.auditStatus === '已采纳' || report.auditStatus === '已通过'
                  ? 'bg-[#E8F8F0] border-[#BDEBD0] text-[#10B981]'
                  : isPending
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : isRejected
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-blue-50 border-blue-200 text-blue-600'
              }`}
            >
              {isAdopted || report.auditStatus === '已采纳' || report.auditStatus === '已通过' ? (
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
                  报送状态：{report.auditStatus}
                </span>
                {(isAdopted || report.score !== undefined) && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold">
                    终审评分：{finalScore ?? report.score ?? 94} 分
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5 max-w-[480px]">
                报送人：{report.author} · {getOrganizationPathText(report.organization)} · {report.submitTime || '2023-10-23 09:15'}
              </div>
            </div>
          </div>

          {/* Right action buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            {isRejected && onOpenEditReport && (
              <button
                type="button"
                onClick={() => onOpenEditReport(report)}
                className="px-3.5 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 cursor-pointer transition-colors shadow-xs"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>修改补充并重新提交</span>
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
        </div>
      </div>

      {/* Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-gray-200">
            <div className="flex items-center space-x-3 text-amber-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-gray-900">确认撤回报送？</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              撤回后，该速报将转为驳回/待修改状态，审核流程将暂停。您可以补充修正后再次报送。
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer"
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
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
              >
                确认撤回
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/40 flex items-center justify-center p-4">
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
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (onDeleteReport) {
                    onDeleteReport(report.id);
                  }
                  setIsDeleteModalOpen(false);
                  handleClose();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
              >
                确认删除
              </button>
            </div>
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
