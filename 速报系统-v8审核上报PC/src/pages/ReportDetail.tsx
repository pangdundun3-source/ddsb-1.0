import React, { useState } from 'react';
import { ReportItem, PageId, Attachment } from '../types';
import { getFinalAuditScore } from '../auditStage';
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
  Sparkles,
  X
} from 'lucide-react';
import { AttachmentPreviewModal } from '../components/AttachmentPreviewModal';
import { AuditFlowTimeline } from '../components/AuditFlowTimeline';
import { ReportOriginBadge } from '../components/ReportOriginBadge';

interface ReportDetailProps {
  report: ReportItem | null;
  sourcePage?: PageId;
  onNavigate: (page: PageId) => void;
  onWithdrawReport?: (id: number) => void;
  onOpenEditReport?: (report: ReportItem) => void;
  onDeleteReport?: (id: number) => void;
  isDrawer?: boolean;
  onClose?: () => void;
}

export const ReportDetail: React.FC<ReportDetailProps> = ({
  report,
  sourcePage = 'report-summary',
  onNavigate,
  onWithdrawReport,
  onOpenEditReport,
  onDeleteReport,
  isDrawer = false,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [drawerActiveTab, setDrawerActiveTab] = useState<'detail' | 'flow'>('detail');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      onNavigate(sourcePage === 'report-records' ? 'report-records' : 'report-summary');
    }
  };

  if (!report) {
    if (isDrawer) return null;
    return (
      <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
        <p className="text-sm">未选择速报记录，请返回报送管理列表选择。</p>
        <button
          onClick={() => onNavigate(sourcePage === 'report-records' ? 'report-records' : 'report-summary')}
          className="mt-4 px-4 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          返回{sourcePage === 'report-records' ? '报送记录' : '报送管理'}
        </button>
      </div>
    );
  }

  const isDraft = report.auditStatus === '草稿';
  const isPending = report.auditStatus === '待审核';
  const isInReview = report.auditStatus === '审核中';
  const isRejected = report.auditStatus === '被驳回' || report.auditStatus === '已驳回';
  const isAdopted = report.auditStatus === '已采纳' || report.auditStatus === '已通过';
  const isWaitingTransfer = report.auditStatus === '待转办';
  const isTransferred = report.auditStatus === '已转办';
  const rejectReasonText = report.rejectReason || '信息不完整，请补充政策原文链接和现场排查核实依据后重新提交。';
  const rejectFollowUpText = '请点击右上角【修改补充并重新提交】按钮补充修正后再次送审。';
  const finalScore = getFinalAuditScore(report);

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

  // Drawer Mode
  if (isDrawer) {
    return (
      <div
        className="fixed inset-0 z-50 overflow-hidden"
        id="report-detail-drawer"
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 cursor-pointer"
          onClick={handleClose}
        />

        {/* 50% Right Drawer Panel */}
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[90vw] md:w-[75vw] lg:w-1/2 xl:w-1/2 bg-[#F8FAFC] shadow-2xl flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-250">
          {/* Header */}
          <div className="bg-white px-5 border-b border-gray-200 flex items-center justify-between shrink-0 shadow-2xs">
            {/* Tabs */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setDrawerActiveTab('detail')}
                className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  drawerActiveTab === 'detail'
                    ? 'border-[#1E5ABB] text-[#1E5ABB]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>详情信息</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawerActiveTab('flow')}
                className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  drawerActiveTab === 'flow'
                    ? 'border-[#1E5ABB] text-[#1E5ABB]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <History className="w-4 h-4" />
                <span>流转状态</span>
              </button>
            </div>

            {/* Right: Close */}
            <div className="flex items-center space-x-2 py-2">
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
                title="关闭抽屉"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {drawerActiveTab === 'detail' ? (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Rejection Alert if Rejected */}
                {isRejected && (
                  <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-bold text-rose-900 text-xs">报送被驳回</p>
                      <p className="text-[11px] text-rose-700 mt-1 leading-normal">
                        <strong>驳回原因：</strong>{rejectReasonText}
                      </p>
                      <p className="text-[11px] text-rose-500 mt-0.5 leading-normal">
                        {rejectFollowUpText}
                      </p>
                    </div>
                  </div>
                )}

                {/* Main Content Card */}
                <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
                  {/* Title & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center flex-wrap gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                        {report.title}
                      </h2>
                      <ReportOriginBadge report={report} size="md" />
                    </div>
                    <span
                      className={`shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                        isDraft
                          ? 'bg-gray-100 text-gray-700 border-gray-300'
                          : isPending
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : isRejected
                          ? 'bg-rose-50 text-rose-600 border-rose-200'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}
                    >
                      {report.auditStatus}
                    </span>
                  </div>

                  {/* Sub-meta */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
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
                      <div className="flex items-center space-x-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-bold font-mono text-[11px]">
                        <span>评分：{finalScore} 分</span>
                      </div>
                    )}
                    {report.templateName && (
                      <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-semibold text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>模板：{report.templateName}</span>
                      </div>
                    )}
                  </div>

                  {/* Basic Attributes Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 bg-[#F8FAFC] rounded-lg border border-gray-100 text-xs text-gray-600">
                    <div>
                      <span className="text-gray-400 block text-[10px]">信息类型</span>
                      <span className="font-semibold text-gray-800">{report.infoType || '民生服务'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">来源渠道</span>
                      <span className="font-semibold text-gray-800">{report.source || '网格上报'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">所属区域</span>
                      <span className="font-semibold text-gray-800">{report.region || '西坝区'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">涉及人数</span>
                      <span className="font-semibold text-gray-800">{report.involvedCount || 50} 人</span>
                    </div>
                  </div>

                  {/* Structured Sections */}
                  <div className="space-y-3.5 text-xs text-gray-700 pt-1">
                    <div className="space-y-1.5">
                      <div className="font-bold text-gray-900 text-xs">【内容摘要】</div>
                      <div className="bg-[#F8F9FA] border border-gray-100 rounded-lg p-3 text-xs text-gray-700 leading-relaxed">
                        {detail.summary}
                      </div>
                    </div>

                    {detail.coreDemands && (
                      <div className="space-y-1.5">
                        <div className="font-bold text-gray-900 text-xs">【核心诉求】</div>
                        <div className="bg-[#F8F9FA] border border-gray-100 rounded-lg p-3 text-xs text-gray-700 leading-relaxed">
                          {detail.coreDemands}
                        </div>
                      </div>
                    )}

                    {detail.publicOpinionTrend && (
                      <div className="space-y-1.5">
                        <div className="font-bold text-gray-900 text-xs">【舆情态势】</div>
                        <div className="bg-[#F8F9FA] border border-gray-100 rounded-lg p-3 text-xs text-gray-700 leading-relaxed">
                          {detail.publicOpinionTrend}
                        </div>
                      </div>
                    )}

                    {detail.recommendations && (
                      <div className="space-y-1.5">
                        <div className="font-bold text-gray-900 text-xs">【建议举措 / 处置建议】</div>
                        <div className="bg-[#F8F9FA] border border-gray-100 rounded-lg p-3 text-xs text-gray-700 space-y-1 leading-relaxed">
                          {Array.isArray(detail.recommendations) ? (
                            detail.recommendations.map((rec, idx) => (
                              <p key={idx}>{rec}</p>
                            ))
                          ) : (
                            <p className="whitespace-pre-line">{detail.recommendations}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="font-bold text-gray-900 text-xs">【同源地址】</div>
                      <div className="bg-[#F4F8FF] border border-[#D9E7FD] rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs">
                        <a
                          href={report.matchUrl || 'https://news.example.com/'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1E5ABB] font-mono truncate text-xs hover:underline"
                          title={report.matchUrl || 'https://news.example.com/'}
                        >
                          {report.matchUrl || 'https://news.example.com/'}
                        </a>
                        <a
                          href={report.matchUrl || 'https://news.example.com/'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-white hover:bg-blue-50 text-[#1E5ABB] border border-[#BFD7FE] rounded font-medium text-xs shrink-0 flex items-center space-x-1 shadow-2xs cursor-pointer transition-colors"
                        >
                          <span>访问</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attachments Card */}
                <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center space-x-2 text-sm font-bold text-gray-900">
                      <Paperclip className="w-4 h-4 text-[#1E5ABB]" />
                      <span>附件证据材料</span>
                    </div>
                    <span className="text-xs text-gray-400">共 {attachments.length} 份佐证材料</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
                            <img
                              src={att.thumbnailUrl || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&auto=format&fit=crop'}
                              alt={att.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-full h-28 bg-rose-50/60 p-3 flex flex-col items-center justify-center space-y-1.5 cursor-pointer group hover:bg-rose-100/60 transition-colors"
                            onClick={() => setPreviewAttachment(att)}
                            title="点击在线查阅 PDF 文档"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white border border-rose-200 flex items-center justify-center text-rose-600 shadow-2xs">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span className="text-[11px] font-bold text-gray-800 line-clamp-1 text-center px-1">
                              {att.name}
                            </span>
                            <span className="text-[10px] text-rose-600 font-semibold bg-white/80 px-2 py-0.5 rounded border border-rose-200">
                              PDF · {att.size}
                            </span>
                          </div>
                        )}

                        <div className="p-2 bg-white border-t border-gray-100 flex items-center justify-between text-xs">
                          <span className="text-gray-500 font-mono text-[11px]">{att.size}</span>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => setPreviewAttachment(att)}
                              className="text-gray-600 hover:text-[#1E5ABB] hover:underline cursor-pointer flex items-center space-x-0.5 font-medium"
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
              <div className="space-y-4 animate-in fade-in duration-150 pb-2">
                <AuditFlowTimeline report={report} headerNote="实时 · 整体流程" />
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div
            className="shrink-0 bg-white/98 backdrop-blur-md border-t border-slate-200/90 px-5 sm:px-6 py-4 sm:py-4.5 min-h-[76px] sm:min-h-[80px] shadow-[0_-8px_24px_rgba(15,23,42,0.06)] z-20 flex items-center justify-between gap-4"
            id="report-detail-drawer-bottom-bar"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isAdopted
                    ? 'bg-emerald-100 text-emerald-600'
                    : isPending
                    ? 'bg-amber-100 text-amber-600'
                    : isRejected
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isAdopted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isPending ? (
                  <Clock className="w-5 h-5" />
                ) : isRejected ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-800 text-xs">
                    报送状态：{report.auditStatus}
                  </span>
                  {finalScore !== undefined && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                      终审评分：{finalScore} 分
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5 truncate">
                  报送人：{report.author} · {report.organization || '网格中心'} · {report.submitTime}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {(isPending || isDraft || isRejected) && onDeleteReport && (
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                  title="删除记录"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>删除报送</span>
                </button>
              )}

              {(isDraft || isRejected) && onOpenEditReport && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenEditReport(report);
                    handleClose();
                  }}
                  className="px-3.5 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg text-xs font-semibold shadow-2xs flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>{isRejected ? '修改补充并重新提交' : '编辑草稿'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
              >
                关闭
              </button>
            </div>
          </div>
        </div>

        {/* Modals inside drawer */}
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
                    handleClose();
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
                >
                  确认撤回
                </button>
              </div>
            </div>
          </div>
        )}

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
          ) : sourcePage === 'report-records' ? (
            <>
              <span className="text-gray-500 font-medium">报送管理</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              <button
                onClick={() => onNavigate('report-records')}
                className="text-gray-600 hover:text-[#1E5ABB] hover:underline font-medium flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <span>报送记录</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              <span className="text-gray-900 font-bold">速报详情</span>
            </>
          ) : (
            <>
              <span className="text-gray-500 font-medium">报送管理</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              <button
                onClick={() => onNavigate('report-summary')}
                className="text-gray-600 hover:text-[#1E5ABB] hover:underline font-medium flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <span>报送待办</span>
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
              onClick={() => onOpenEditReport && onOpenEditReport(report)}
              className="px-3.5 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg text-xs font-semibold shadow-2xs flex items-center space-x-1 cursor-pointer"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>{isRejected ? '修改补充并重新提交' : '编辑草稿'}</span>
            </button>
          )}

          {/* If from Report Management and Pending, Draft or Rejected: Delete */}
          {sourcePage !== 'audit-records' && (isPending || isDraft || isRejected) && onDeleteReport && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer"
              title="删除记录"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>删除</span>
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
        </div>
      </div>

      {/* 2. Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Columns: Information & Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Main Content Card (Matches the Screenshot Layout Exactly) */}
          <div className="bg-white rounded-xl p-6 border border-gray-200/80 shadow-2xs space-y-5">
            {/* Title & Status Row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center flex-wrap gap-2.5">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                  {report.title}
                </h1>
                <ReportOriginBadge report={report} size="md" />
              </div>
              <span
                className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-md border ${
                  isDraft
                    ? 'bg-gray-100 text-gray-700 border-gray-300'
                    : isPending
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : isRejected
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}
              >
                {report.auditStatus}
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
              {report.templateName && (
                <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>模板：{report.templateName}</span>
                </div>
              )}
            </div>

            {/* Structured Content Sections */}
            <div className="space-y-4 text-xs text-gray-700 pt-2">
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
                    className="text-[#1E5ABB] font-mono truncate text-xs hover:underline"
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

          {/* Attachments Card (Matches Screenshot bottom card) */}
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
                      className="w-full h-32 bg-gray-100 overflow-hidden relative flex items-center justify-center cursor-pointer group"
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
                      className="w-full h-32 bg-rose-50/40 flex flex-col items-center justify-center text-rose-600 relative p-4 cursor-pointer group border-b border-gray-100"
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
                      <FileText className="w-10 h-10 text-rose-500 group-hover:scale-110 transition-transform" />
                      <span className="mt-2 text-xs font-medium text-gray-800 truncate w-full text-center">
                        {att.name}
                      </span>
                    </div>
                  ) : (
                    <div
                      className="w-full h-32 bg-blue-50/40 flex flex-col items-center justify-center text-[#1E5ABB] relative p-4 cursor-pointer group border-b border-gray-100"
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
                      <FileSpreadsheet className="w-10 h-10 text-[#1E5ABB] group-hover:scale-110 transition-transform" />
                      <span className="mt-2 text-xs font-medium text-gray-700 truncate w-full text-center">
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

        {/* Right 1 Column: Audit Workflow & Timeline (5-Stage Lifecycle from mobile design) */}
        <div className="space-y-5">
          {/* Audit Status Summary */}
          <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <CheckSquare className="w-4 h-4 text-[#1E5ABB]" />
              <h3 className="text-sm font-bold text-gray-800">审核结论</h3>
            </div>

            {isAdopted ? (
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900 text-xs">
                    {report.auditStatus === '已通过' ? '审核通过 · 待采纳' : '审核通过 · 已采纳'}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-1 leading-normal">
                    {report.auditStatus === '已通过'
                      ? '初审已通过，等待后续复核和采纳节点完成。'
                      : '本条速报已完成全部三级审核流转，已进入全市速报汇编库。'}
                  </p>
                </div>
              </div>
            ) : isRejected ? (
              <div className="relative p-3.5 pr-10 bg-rose-50 rounded-xl border border-rose-200 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-900 text-xs">被驳回</p>
                  <p className="text-[11px] text-rose-700 mt-1 leading-normal">
                    <strong>驳回原因：</strong>{rejectReasonText}
                  </p>
                  <p className="text-[11px] text-rose-500 mt-1 leading-normal">
                    {rejectFollowUpText}
                  </p>
                </div>
              </div>
            ) : isPending ? (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start space-x-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900 text-xs">审核中 · 待宣传部/网信办初审</p>
                  <p className="text-[11px] text-amber-700 mt-1 leading-normal">
                    材料已提交送审，审核人员正在核验信息真实性与处置建议。
                  </p>
                </div>
              </div>
            ) : isInReview ? (
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-900 text-xs">审核中 · 正在复核</p>
                  <p className="text-[11px] text-blue-700 mt-1 leading-normal">
                    初审已完成，当前由复核组继续处理，暂不可编辑或撤回。
                  </p>
                </div>
              </div>
            ) : isWaitingTransfer ? (
              <div className="p-3.5 bg-orange-50 rounded-xl border border-orange-200 flex items-start space-x-3">
                <Share2 className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-orange-900 text-xs">待转办 · 已进入不良信息库</p>
                  <p className="text-[11px] text-orange-700 mt-1 leading-normal">
                    审核链路已完成，等待责任单位确认并提交转办意见。
                  </p>
                </div>
              </div>
            ) : isTransferred ? (
              <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-200 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-indigo-900 text-xs">已转办 · 流程结束</p>
                  <p className="text-[11px] text-indigo-700 mt-1 leading-normal">
                    已提交责任单位处理，当前无需重复操作。
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-start space-x-3">
                <FileEdit className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900 text-xs">草稿保存</p>
                  <p className="text-[11px] text-gray-600 mt-1 leading-normal">
                    尚未提交送审，随时可继续补充编辑。
                  </p>
                </div>
              </div>
            )}
          </div>

          <AuditFlowTimeline report={report} />

          {false && (
          /* Streamlined Flow Timeline (Aligned with AuditDetail & Screenshot) */
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-gray-900">流转状态</h3>
              </div>
              {isAdopted && (
                <span className="text-[11px] text-gray-400 font-normal">完整审核链路</span>
              )}
            </div>

            {/* Timeline List */}
            <div className="relative space-y-0 text-xs">
              {/* Step 1: 提交上报 */}
              <div className="relative pl-6 pb-4">
                {/* Connecting Line */}
                <div className="absolute left-[7px] top-4.5 bottom-0 w-[1.5px] bg-[#E2E8F0]" />
                {/* Icon */}
                <div className="absolute left-0 top-0.5 w-4 h-4 rounded-full border-2 border-[#10B981] bg-white flex items-center justify-center text-[#10B981]">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                {/* Content */}
                <div className="space-y-2">
                  <div className="font-bold text-gray-900 text-xs">提交上报</div>

                  {/* Submission Card */}
                  <div className="bg-[#F8FAFC] border border-[#EDF2F7] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs gap-2">
                    <span className="text-gray-600 truncate">
                      {isAdopted ? '王五 · 市大数据中心 · 2026-08-12 16:45' : `${report.author} · ${report.organization} · ${report.submitTime}`}
                    </span>
                    <span className="text-[#059669] font-bold text-xs shrink-0">已提交</span>
                  </div>
                </div>
              </div>

              {/* Step 2: 审核处理 */}
              <div className="relative pl-6 pb-4">
                {/* Connecting Line */}
                <div className="absolute left-[7px] top-4.5 bottom-0 w-[1.5px] bg-[#E2E8F0]" />
                {/* Icon */}
                <div
                  className={`absolute left-0 top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                    isPending
                      ? 'border-[#F59E0B] text-[#F59E0B]'
                      : isRejected
                      ? 'border-[#E11D48] text-[#E11D48]'
                      : 'border-[#10B981] text-[#10B981]'
                  }`}
                >
                  {isPending ? (
                    <Clock className="w-2.5 h-2.5 stroke-[2.5]" />
                  ) : isRejected ? (
                    <AlertCircle className="w-2.5 h-2.5 stroke-[2.5]" />
                  ) : (
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  )}
                </div>
                {/* Content */}
                <div className="space-y-2">
                  <div className="font-bold text-gray-900 text-xs">审核处理</div>

                  {isAdopted ? (
                    /* Approved Card with Score */
                    <div className="bg-[#F8FAFC] border border-[#EDF2F7] rounded-xl p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-700 font-medium truncate">
                          王主任 · 市委宣传部舆情科 · 2026-08-12 18:00
                        </span>
                        <span className="text-[#059669] font-bold text-xs shrink-0">已通过</span>
                      </div>
                      <div className="bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D] rounded-lg px-3 py-2 text-xs font-bold font-mono">
                        评分：95分
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#F8FAFC] border border-[#EDF2F7] rounded-xl p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-700 font-medium truncate">
                          王主任 · 市委宣传部舆情科
                        </span>
                        {isPending ? (
                          <span className="bg-[#FEF3C7]/90 text-[#D97706] font-bold text-[11px] px-2 py-0.5 rounded-md border border-[#FDE68A] shrink-0">
                            待审核
                          </span>
                        ) : isRejected ? (
                          <span className="text-[#E11D48] font-bold text-xs shrink-0">已驳回</span>
                        ) : (
                          <span className="text-[#059669] font-bold text-xs shrink-0">已通过</span>
                        )}
                      </div>
                      {isRejected && report.rejectReason && (
                        <div className="bg-[#FFF1F2] border border-[#FFE4E6] text-[#BE123C] rounded-lg p-2.5 text-xs leading-relaxed">
                          <strong>驳回原因：</strong>{report.rejectReason}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: 审核处理 (复核组) */}
              <div className="relative pl-6 pb-4">
                {/* Connecting Line */}
                <div className="absolute left-[7px] top-4.5 bottom-0 w-[1.5px] bg-[#E2E8F0]" />
                {/* Icon */}
                <div
                  className={`absolute left-0 top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                    isAdopted ? 'border-[#10B981] text-[#10B981]' : 'border-[#CBD5E1]'
                  }`}
                >
                  {isAdopted ? (
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
                  )}
                </div>
                {/* Content */}
                <div className="space-y-1.5">
                  <div className="font-bold text-gray-900 text-xs">审核处理</div>
                  <div className="bg-[#F8FAFC] border border-[#EDF2F7] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs gap-2">
                    <span className="text-gray-700 font-medium truncate">
                      {isAdopted ? '李明 · 市网信办复核组 · 2026-08-12 18:00' : '市网信办复核组'}
                    </span>
                    <span className={`${isAdopted ? 'text-[#059669] font-bold' : 'text-gray-400 font-medium'} text-xs shrink-0`}>
                      {isAdopted ? '已通过' : '等待处理'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 4: 审核处理 (终审组) */}
              <div className="relative pl-6 pb-4">
                {/* Connecting Line */}
                <div className="absolute left-[7px] top-4.5 bottom-0 w-[1.5px] bg-[#E2E8F0]" />
                {/* Icon */}
                <div
                  className={`absolute left-0 top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                    isAdopted ? 'border-[#10B981] text-[#10B981]' : 'border-[#CBD5E1]'
                  }`}
                >
                  {isAdopted ? (
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
                  )}
                </div>
                {/* Content */}
                <div className="space-y-2">
                  <div className="font-bold text-gray-900 text-xs">审核处理</div>
                  {isAdopted ? (
                    <div className="bg-[#F8FAFC] border border-[#EDF2F7] rounded-xl p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-700 font-medium truncate">
                          赵宁 · 市网信办终审组 · 2026-08-12 18:00
                        </span>
                        <span className="text-[#059669] font-bold text-xs shrink-0">已通过</span>
                      </div>
                      <div className="bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D] rounded-lg px-3 py-2 text-xs font-bold font-mono">
                        评分：95分
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#F8FAFC] border border-[#EDF2F7] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs gap-2">
                      <span className="text-gray-700 font-medium truncate">市网信办终审组</span>
                      <span className="text-gray-400 font-medium text-xs shrink-0">
                        等待处理
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 5: 结束 (已采纳) */}
              <div className="relative pl-6">
                {/* Icon */}
                <div
                  className={`absolute left-0 top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                    isAdopted ? 'border-[#10B981] text-[#10B981]' : 'border-[#CBD5E1]'
                  }`}
                >
                  {isAdopted ? (
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
                  )}
                </div>
                {/* Content */}
                <div className="space-y-1.5">
                  <div className="font-bold text-gray-900 text-xs">结束</div>
                  <div className="bg-[#F8FAFC] border border-[#EDF2F7] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs gap-2">
                    <span className="text-gray-600 truncate">流程结束</span>
                    {isAdopted && (
                      <span className="text-[#059669] font-bold text-xs shrink-0">已采纳</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
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
