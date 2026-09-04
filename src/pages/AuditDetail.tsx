import React, { useState } from 'react';
import { ReportItem, PageId, Attachment } from '../types';
import {
  Info,
  FileText,
  Paperclip,
  CheckCircle2,
  Clock,
  ChevronRight,
  Send,
  AlertCircle,
  ExternalLink,
  FileSpreadsheet,
  Check,
  X,
  TrendingUp,
  User,
  Link as LinkIcon,
  MapPin,
  Building2,
  Copy,
  Layers,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  History,
  Download,
  Eye
} from 'lucide-react';
import { AttachmentPreviewModal } from '../components/AttachmentPreviewModal';
import { AuditFlowTimeline } from '../components/AuditFlowTimeline';
import { getFinalAuditScore, isFinalAuditStage } from '../auditStage';

interface AuditDetailProps {
  report: ReportItem | null;
  allReports?: ReportItem[];
  onApprove: (id: number, score?: number, isBatch?: boolean) => void;
  onReject: (id: number, reason: string, detail: string) => void;
  onNavigate: (page: PageId) => void;
}

export const AuditDetail: React.FC<AuditDetailProps> = ({
  report,
  allReports = [],
  onApprove,
  onReject,
  onNavigate
}) => {
  const defaultUrl = report?.matchUrl || 'https://m.weibo.cn/detail/4960324859124501';
  const [matchUrl, setMatchUrl] = useState(defaultUrl);
  const [isUrlMatched, setIsUrlMatched] = useState(true);
  const [auditMode, setAuditMode] = useState<'pass' | 'reject'>('pass');
  const [selectedScore, setSelectedScore] = useState<number>(5);
  const [rejectReason, setRejectReason] = useState('信息不完整');
  const [rejectDetail, setRejectDetail] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<any | null>(null);

  if (!report) {
    return (
      <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-4">
        <p className="text-sm font-medium">未选择待审核记录，请返回审核列表。</p>
        <button
          onClick={() => onNavigate('report-audit')}
          className="px-4 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
        >
          返回报送审核
        </button>
      </div>
    );
  }

  // Find co-reports with the same matchUrl for cluster matching
  const matchedCoReports = allReports.filter(
    (r) => r.id !== report.id && r.matchUrl && matchUrl && r.matchUrl.trim() === matchUrl.trim()
  );
  const canScore = isFinalAuditStage(report);
  const finalScore = getFinalAuditScore(report);

  const handleSubmitAudit = () => {
    const shouldBatch = isUrlMatched && matchedCoReports.length > 0;
    if (auditMode === 'pass') {
      onApprove(report.id, canScore ? selectedScore : undefined, shouldBatch);
    } else {
      onReject(report.id, rejectReason, rejectDetail);
    }
    onNavigate('report-audit');
  };

  const detail = report.detailContent || {
    summary: '今日（8月13日）上午8时许，多名网民在微博、微信群反映西坝区阳光花园一期、明月居等5个小区突发停水，早高峰生活用水受到影响，涉及居民约3万人。',
    coreDemands: '网民普遍反映未接到停水通知，早高峰期间停水严重影响正常生活，部分网民情绪急躁，质疑供水部门应急处置能力。',
    publicOpinionTrend: '目前相关话题在本地区微博同城榜排名呈上升趋势，阅读量已突破10万。暂未发现大规模聚集性负面言论，但个别自媒体账号开始发布未经证实的“管道大面积破裂需要停水数日”的言论。',
    recommendations: [
      '1. 建议区政府立即协调水务集团查明停水原因，并明确预计恢复供水时间。',
      '2. 通过官方渠道（微博、微信公众号）紧急发布停水情况说明，澄清不实传言。',
      '3. 若短时间内无法恢复，建议安排应急送水车前往受影响小区，保障居民基本用水需求。'
    ]
  };

  const attachments = report.attachments || [
    { id: 'a1', name: '微博热点截图.png', size: '1.2 MB', type: 'image', thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&auto=format&fit=crop' },
    { id: 'a2', name: '现场微信群反馈.jpg', size: '850 KB', type: 'image', thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop' },
    { id: 'a3', name: '应急供水保障预案.pdf', size: '2.4 MB', type: 'pdf' }
  ];

  const handleCopySummary = () => {
    const text = `【舆情速报】${report.title}\n报送时间：${report.submitTime}\n上报单位：${report.organization}（${report.author}）\n所属区域：${report.region} | 类型：${report.infoType}\n发生地址：${report.occurAddress || '未填'}\n\n【内容摘要】\n${detail.summary}\n\n【核心诉求】\n${detail.coreDemands || '无'}\n\n【处置建议】\n${Array.isArray(detail.recommendations) ? detail.recommendations.join('\n') : detail.recommendations || '暂无'}`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const isPending = report.auditStatus === '待审核';
  const isInReview = report.auditStatus === '审核中';
  const isRejected = report.auditStatus === '被驳回' || report.auditStatus === '已驳回';
  const isAdopted = report.auditStatus === '已采纳' || report.auditStatus === '已通过';
  const isWaitingTransfer = report.auditStatus === '待转办';
  const isTransferred = report.auditStatus === '已转办';

  return (
    <div className="space-y-4" id="audit-detail-view">
      {/* 1. Top Breadcrumbs & Back Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-2xs">
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-500 font-medium">审核管理</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <button
            onClick={() => onNavigate('report-audit')}
            className="text-gray-600 hover:text-[#1E5ABB] hover:underline font-medium flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <span>审核待办</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-gray-900 font-bold">审核详情</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopySummary}
            className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium transition-colors shadow-2xs flex items-center space-x-1 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-gray-500" />
            <span>{copySuccess ? '已复制汇报文稿' : '复制速报全文'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Layout Grid (2 Columns: Left 65%, Right 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Report Contents & Attachments */}
        <div className="lg:col-span-2 space-y-5">
          {/* Main Content Card (Matches the Screenshot Layout Exactly) */}
          <div className="bg-white rounded-xl p-6 border border-gray-200/80 shadow-2xs space-y-5">
            {/* Title & Status Row */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                {report.title}
              </h1>
              {/* Event Final Overall Result */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-gray-400 font-normal">事件结果</span>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-md border ${
                    report.auditStatus === '已采纳' || report.auditStatus === '已通过' || report.auditStatus === '待转办' || report.auditStatus === '已转办'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      : report.auditStatus === '被驳回' || report.auditStatus === '已驳回'
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : 'bg-amber-50 text-amber-600 border-amber-200'
                  }`}
                >
                  {report.auditStatus}
                </span>
              </div>
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
                      detail.recommendations.map((rec, i) => (
                        <p key={i} className="leading-relaxed">
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

        {/* Right Column: Audit Action Panel & Workflow Timeline */}
        <div className="space-y-5">
          {/* Audit Action Card */}
          <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-4" id="audit-action-panel">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-900">审核操作</h3>
            </div>

            {isPending ? (
              <>
            {/* Precision Match by URL Section (1:1 with reference screenshot) */}
            <div className="bg-[#F4F8FD] border border-[#E2EEF9] rounded-2xl p-3.5 space-y-2.5">
              {/* Header */}
              <div className="flex items-center space-x-1.5 text-gray-900 font-bold text-xs">
                <LinkIcon className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                <span>按链接地址精准匹配</span>
              </div>

              {/* URL Field */}
              <div className="bg-white border border-[#D5E1EF] rounded-lg px-3 py-2 text-xs font-mono text-gray-700 shadow-2xs select-all flex items-center justify-between gap-2">
                <span className="truncate flex-1" title={matchUrl}>
                  {matchUrl}
                </span>
                {matchUrl && (
                  <a
                    href={matchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2563EB] hover:text-[#1d4ed8] p-0.5 hover:bg-blue-50 rounded transition-colors shrink-0"
                    title="访问链接"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Matched Notice Box (Amber Container) */}
              {isUrlMatched && (
                <div className="bg-[#FEF9EE] border border-[#FBE3B5] rounded-xl p-3 space-y-2.5">
                  {/* Warning Header Line */}
                  <div className="flex items-center space-x-1.5 text-gray-800 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
                    <span>已匹配 {matchedCoReports.length > 0 ? matchedCoReports.length : 1} 条待审核内容，可进行批量处理。</span>
                  </div>

                  {/* Matched Content Item Card(s) */}
                  <div className="space-y-2">
                    {matchedCoReports.length > 0 ? (
                      matchedCoReports.map((c) => (
                        <div
                          key={c.id}
                          className="bg-white rounded-lg p-2.5 border border-[#F5E5CD] shadow-2xs space-y-1"
                        >
                          <div className="font-bold text-gray-800 text-xs leading-snug">
                            {c.title}
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center space-x-1.5">
                            <span>{c.organization}</span>
                            <span className="text-gray-300">·</span>
                            <span>{c.author}</span>
                            <span className="text-gray-300">·</span>
                            <span className="font-mono">{c.submitTime}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white rounded-lg p-2.5 border border-[#F5E5CD] shadow-2xs space-y-1">
                        <div className="font-bold text-gray-800 text-xs leading-snug">
                          短视频平台涉及虚假宣传的群众举报核查
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center space-x-1.5">
                          <span>台中市网信办</span>
                          <span className="text-gray-300">·</span>
                          <span>张三</span>
                          <span className="text-gray-300">·</span>
                          <span className="font-mono">2026-08-13 08:45</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Audit Conclusion Selection Buttons */}
            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-gray-700 font-semibold">
                  审核结论 <span className="text-gray-400 font-normal">（当前账号操作）</span>
                </label>
                {report.auditor && (
                  <span className="text-[11px] text-gray-400 font-mono">
                    经办人: {report.auditor}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setAuditMode('pass')}
                  className={`flex items-center space-x-2 p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                    auditMode === 'pass'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500/30'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    auditMode === 'pass' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300 bg-white'
                  }`}>
                    {auditMode === 'pass' && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                  </span>
                  <div className="flex items-center space-x-1 min-w-0">
                    <Check className={`w-3.5 h-3.5 shrink-0 ${auditMode === 'pass' ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <span className="truncate">批量通过</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAuditMode('reject')}
                  className={`flex items-center space-x-2 p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                    auditMode === 'reject'
                      ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold ring-1 ring-rose-500/30'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    auditMode === 'reject' ? 'border-rose-600 bg-rose-600 text-white' : 'border-gray-300 bg-white'
                  }`}>
                    {auditMode === 'reject' && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                  </span>
                  <div className="flex items-center space-x-1 min-w-0">
                    <X className={`w-3.5 h-3.5 shrink-0 ${auditMode === 'reject' ? 'text-rose-600' : 'text-gray-400'}`} />
                    <span className="truncate">批量驳回</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Dynamic Form for Pass or Reject */}
            {auditMode === 'pass' ? (
              <div className="space-y-3 text-xs pt-1">
                {canScore && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="block text-gray-700 font-semibold">终审评分</label>
                      <span className="text-[11px] text-amber-700">仅终审可评分</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[5, 3, 1, 0.5, 0].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setSelectedScore(score)}
                          className={`min-w-12 px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                            selectedScore === score
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-gray-700 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {score}分
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSubmitAudit}
                  className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isUrlMatched && matchedCoReports.length > 0
                      ? `${canScore ? '确认批量通过并评分' : '确认批量通过'} (${matchedCoReports.length + 1} 条)`
                      : canScore ? '确认通过并评分' : '确认通过'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs pt-1 animate-in fade-in">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">驳回原因分类</label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-700 text-xs focus:outline-none"
                  >
                    <option value="信息不完整">信息不完整</option>
                    <option value="内容重复/同源">内容重复/同源</option>
                    <option value="属虚假误报">属虚假误报</option>
                    <option value="非本辖区职责">非本辖区职责</option>
                    <option value="佐证不足">佐证不足</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">详细驳回意见与指引</label>
                  <textarea
                    rows={3}
                    value={rejectDetail}
                    onChange={(e) => setRejectDetail(e.target.value)}
                    placeholder="请输入具体的修改建议和退回说明..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmitAudit}
                  className="w-full py-2.5 mt-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isUrlMatched && matchedCoReports.length > 0
                      ? `确认批量驳回 (${matchedCoReports.length + 1} 条)`
                      : '确认批量驳回'}
                  </span>
                </button>
              </div>
            )}
              </>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
                <div className="flex items-start space-x-2">
                  {isRejected ? (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900">
                      {isRejected
                        ? '当前记录已驳回'
                        : isAdopted
                          ? report.auditStatus === '已通过'
                            ? '当前记录已通过初审'
                            : '当前记录已完成审核'
                          : isWaitingTransfer
                            ? '当前记录待转办'
                            : isTransferred
                              ? '当前记录已转办'
                              : isInReview
                                ? '当前记录正在复核'
                                : '当前记录正在流转中'}
                    </p>
                    <p className="leading-relaxed">
                      该状态不需要当前账号继续审核。请在下方流转状态中查看具体处理节点、评分和驳回意见。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Workflow Status Timeline (1:1 with reference screenshot) */}
          <AuditFlowTimeline report={report} />

          {false && (
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-gray-900">流转状态</h3>
              </div>
              <span className="text-[11px] text-gray-400 font-normal">完整审核链路</span>
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

                  {/* First Submission Item */}
                  <div className="bg-[#F8FAFC] border border-[#EDF2F7] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs gap-2">
                    <span className="text-gray-600 truncate">
                      {report.author} · {report.organization} · {report.submitTime}
                    </span>
                    <span className="text-[#059669] font-bold text-xs shrink-0">已提交</span>
                  </div>

                  {/* Resubmission Item (if report had multiple submissions/modifications) */}
                  <div className="bg-[#F8FAFC] border border-[#EDF2F7] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs gap-2">
                    <span className="text-gray-600 truncate">
                      {report.author} · {report.organization} · 2026-08-12 17:15
                    </span>
                    <span className="text-[#059669] font-bold text-xs shrink-0">已提交</span>
                  </div>
                </div>
              </div>

              {/* Step 2: 审核处理 (包含历史驳回与当前账号审核通过) */}
              <div className="relative pl-6 pb-4">
                {/* Connecting Line */}
                <div className="absolute left-[7px] top-4.5 bottom-0 w-[1.5px] bg-[#E2E8F0]" />
                {/* Icon */}
                <div className="absolute left-0 top-0.5 w-4 h-4 rounded-full border-2 border-[#10B981] bg-white flex items-center justify-center text-[#10B981]">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                {/* Content */}
                <div className="space-y-2">
                  <div className="font-bold text-gray-900 text-xs">审核处理</div>

                  {/* History Rejected Card */}
                  <div className="bg-[#F8FAFC] border border-[#EDF2F7] rounded-xl p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-gray-700 font-medium truncate">
                        王主任 · 市委宣传部舆情科 · 2026-08-12 16:30
                      </span>
                      <span className="text-[#E11D48] font-bold text-xs shrink-0">已驳回</span>
                    </div>
                    <div className="bg-[#FFF1F2] border border-[#FFE4E6] text-[#BE123C] rounded-lg p-2.5 text-xs leading-relaxed">
                      <strong>驳回原因：</strong>信息不完整。请补充政策原文链接和群众反馈截图后重新提交。
                    </div>
                  </div>

                  {/* Current Account Approved Card */}
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
                </div>
              </div>

              {/* Step 3: 审核处理 (复核组) */}
              <div className="relative pl-6 pb-4">
                {/* Connecting Line */}
                <div className="absolute left-[7px] top-4.5 bottom-0 w-[1.5px] bg-[#E2E8F0]" />
                {/* Icon */}
                <div className="absolute left-0 top-0.5 w-4 h-4 rounded-full border-2 border-[#10B981] bg-white flex items-center justify-center text-[#10B981]">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                {/* Content */}
                <div className="space-y-1.5">
                  <div className="font-bold text-gray-900 text-xs">审核处理</div>
                  <div className="bg-[#F8FAFC] border border-[#EDF2F7] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs gap-2">
                    <span className="text-gray-700 font-medium truncate">
                      李明 · 市网信办复核组 · 2026-08-12 18:00
                    </span>
                    <span className="text-[#059669] font-bold text-xs shrink-0">已通过</span>
                  </div>
                </div>
              </div>

              {/* Step 4: 审核处理 (终审组) */}
              <div className="relative pl-6 pb-4">
                {/* Connecting Line */}
                <div className="absolute left-[7px] top-4.5 bottom-0 w-[1.5px] bg-[#E2E8F0]" />
                {/* Icon */}
                <div className="absolute left-0 top-0.5 w-4 h-4 rounded-full border-2 border-[#10B981] bg-white flex items-center justify-center text-[#10B981]">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                {/* Content */}
                <div className="space-y-2">
                  <div className="font-bold text-gray-900 text-xs">审核处理</div>
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
                </div>
              </div>

              {/* Step 5: 结束 (已采纳) */}
              <div className="relative pl-6">
                {/* Icon */}
                <div className="absolute left-0 top-0.5 w-4 h-4 rounded-full border-2 border-[#10B981] bg-white flex items-center justify-center text-[#10B981]">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                {/* Content */}
                <div className="space-y-1.5">
                  <div className="font-bold text-gray-900 text-xs">结束</div>
                  <div className="bg-[#F8FAFC] border border-[#EDF2F7] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs gap-2">
                    <span className="text-gray-600 truncate">流程结束</span>
                    <span className="text-[#059669] font-bold text-xs shrink-0">已采纳</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

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
