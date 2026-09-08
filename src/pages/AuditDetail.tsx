import React, { useState, useEffect } from 'react';
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
  User,
  Link as LinkIcon,
  Copy,
  Download,
  Eye
} from 'lucide-react';
import { AttachmentPreviewModal } from '../components/AttachmentPreviewModal';
import { AuditFlowTimeline } from '../components/AuditFlowTimeline';
import { getFinalAuditScore, isFinalAuditStage } from '../auditStage';
import { ReportOriginBadge } from '../components/ReportOriginBadge';

interface AuditDetailProps {
  report: ReportItem | null;
  allReports?: ReportItem[];
  onApprove: (id: number, score?: number, isBatch?: boolean) => void;
  onReject: (id: number, reason: string, detail: string) => void;
  onNavigate: (page: PageId) => void;
  isDrawer?: boolean;
  onClose?: () => void;
}

export const AuditDetail: React.FC<AuditDetailProps> = ({
  report,
  allReports = [],
  onApprove,
  onReject,
  onNavigate,
  isDrawer = true,
  onClose
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
  const [viewingDetailReport, setViewingDetailReport] = useState<ReportItem | null>(null);

  // Sync state if report changes
  useEffect(() => {
    if (report?.matchUrl) {
      setMatchUrl(report.matchUrl);
    }
  }, [report?.id, report?.matchUrl]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      onNavigate('report-audit');
    }
  };

  // Keyboard shortcut: ESC to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!previewAttachment && !viewingDetailReport) {
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate, previewAttachment, viewingDetailReport]);

  if (!report) {
    if (isDrawer) {
      return (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full text-center space-y-4 shadow-xl">
            <p className="text-sm font-medium text-gray-600">未选择待审核记录，请从列表点击查看。</p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              返回待办列表
            </button>
          </div>
        </div>
      );
    }
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

  // Fallback co-reports for matching list when viewing standalone report with matchUrl
  const fallbackCoReports: ReportItem[] = [
    {
      id: 901,
      title: '某短视频平台涉及虚假宣传的群众举报核查',
      source: '群众举报',
      region: '西屯区',
      infoType: '突发事件',
      author: '孙七',
      organization: '台中市网信办',
      submitTime: '2026-08-13 08:45',
      auditStatus: '待审核',
      originLabel: '疑似重复',
      originReason: '系统智能比对：检测到与当前速报存在同源URL链接。',
      matchUrl: matchUrl,
      detailContent: {
        summary: '多名网民反映短视频平台涉及虚假宣传及涉嫌违规促销的情况，存在舆情发酵风险。',
        coreDemands: '建议协调相关监管部门进行约谈并督促平台清理违规内容。',
        recommendations: [
          '1. 协调市场监管部门开展联合核查。',
          '2. 固定电子证据并限时责令整改。'
        ]
      }
    },
    {
      id: 902,
      title: '台中市秋季旅游推广媒体传播分析',
      source: '新闻网站',
      region: '全市',
      infoType: '舆情动态',
      author: '李四',
      organization: '台中市网信办',
      submitTime: '2026-08-13 09:15',
      auditStatus: '待审核',
      originLabel: '疑似重复',
      originReason: '同源链接重复上报。',
      matchUrl: matchUrl,
      detailContent: {
        summary: '针对秋季旅游季舆情传播动态的初步梳理与各区反馈。',
        coreDemands: '加强景区正面宣传引导与热点监测。',
        recommendations: ['持续跟进同城热度榜与网民诉求。']
      }
    },
    {
      id: 903,
      title: '南屯区老旧小区改造政策解读及反馈收集',
      source: '政府官网',
      region: '南屯区',
      infoType: '政策解读',
      author: '赵六',
      organization: '台中市网信办',
      submitTime: '2026-08-13 10:20',
      auditStatus: '待审核',
      originLabel: '疑似首发',
      matchUrl: matchUrl,
      detailContent: {
        summary: '收集整理居民对老旧小区加装电梯与停车位改造的意见反馈。',
        coreDemands: '建议街道办开通线上答疑通道。',
        recommendations: ['加强政策正面解读与民生热线对接。']
      }
    },
    {
      id: 904,
      title: '微信平台关于智慧城市建设的讨论热度分析',
      source: '社交媒体',
      region: '北屯区',
      infoType: '舆情动态',
      author: '王五',
      organization: '台中市网信办',
      submitTime: '2026-08-13 11:30',
      auditStatus: '待审核',
      originLabel: '疑似重复',
      matchUrl: matchUrl,
      detailContent: {
        summary: '微信群及朋友圈讨论智慧城市生活便捷度的网民反馈汇编。',
        coreDemands: '进一步优化政务App体验与便民功能。',
        recommendations: ['定期公布系统升级进展。']
      }
    }
  ];

  const displayMatchedList = matchedCoReports.length > 0 ? matchedCoReports : fallbackCoReports;
  const totalMatchedCount = isUrlMatched ? displayMatchedList.length + 1 : 1;

  const canScore = isFinalAuditStage(report);
  const finalScore = getFinalAuditScore(report);

  const handleSubmitAudit = () => {
    const shouldBatch = isUrlMatched && (matchedCoReports.length > 0 || displayMatchedList.length > 0);
    if (auditMode === 'pass') {
      onApprove(report.id, canScore ? selectedScore : undefined, shouldBatch);
    } else {
      onReject(report.id, rejectReason, rejectDetail);
    }
    handleClose();
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

  // 1. 报送基本信息与核心结构化内容卡片
  const renderMainContentCard = () => (
    <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200/80 shadow-2xs space-y-4 sm:space-y-5">
      {/* Title & Status Row */}
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
            {report.title}
          </h1>
          <ReportOriginBadge report={report} size="md" />
        </div>
        {/* Status Badge */}
        <span
          className={`shrink-0 text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-md border ${
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

      {/* Sub-meta: Author & Organization, Submit Time */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500 pt-0.5">
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

      {/* Structured Meta Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-gray-50/70 rounded-lg border border-gray-100 text-xs">
        <div>
          <span className="text-gray-400 text-[11px] block">信息来源</span>
          <span className="font-semibold text-gray-800">{report.source || '上报人员'}</span>
        </div>
        <div>
          <span className="text-gray-400 text-[11px] block">所属区域</span>
          <span className="font-semibold text-gray-800">{report.region || '全市'}</span>
        </div>
        <div>
          <span className="text-gray-400 text-[11px] block">信息类型</span>
          <span className="font-semibold text-gray-800">{report.infoType || '舆情速报'}</span>
        </div>
        <div>
          <span className="text-gray-400 text-[11px] block">发生地址</span>
          <span className="font-semibold text-gray-800 truncate block" title={report.occurAddress || '未填'}>
            {report.occurAddress || '未填'}
          </span>
        </div>
      </div>

      {/* Structured Content Sections */}
      <div className="space-y-4 text-xs text-gray-700 pt-1">
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
  );

  // 2. 附件证据材料卡片
  const renderAttachmentsCard = () => (
    <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center space-x-2 text-sm font-bold text-gray-900">
          <Paperclip className="w-4 h-4 text-[#1E5ABB]" />
          <span>附件证据材料</span>
        </div>
        <span className="text-xs text-gray-400">共 {attachments.length} 份佐证材料</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
        {attachments.map((att) => (
          <div
            key={att.id}
            className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/40 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            {att.type === 'image' ? (
              <div
                className="w-full h-28 sm:h-32 bg-gray-100 overflow-hidden relative flex items-center justify-center cursor-pointer group"
                onClick={() => setPreviewAttachment(att)}
                title="点击预览图片"
              >
                <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-xs text-white text-[10px] px-1.5 py-0.5 rounded flex items-center space-x-1 max-w-[90%]">
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
                className="w-full h-28 sm:h-32 bg-rose-50/40 flex flex-col items-center justify-center text-rose-600 relative p-3 sm:p-4 cursor-pointer group border-b border-gray-100"
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
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500 group-hover:scale-110 transition-transform" />
                <span className="mt-2 text-xs font-medium text-gray-800 truncate w-full text-center">
                  {att.name}
                </span>
              </div>
            ) : (
              <div
                className="w-full h-28 sm:h-32 bg-blue-50/40 flex flex-col items-center justify-center text-[#1E5ABB] relative p-3 sm:p-4 cursor-pointer group border-b border-gray-100"
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
                <FileSpreadsheet className="w-8 h-8 sm:w-10 sm:h-10 text-[#1E5ABB] group-hover:scale-110 transition-transform" />
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
  );

  // 3. 审核操作处置卡片
  const renderAuditActionCard = () => (
    <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-4" id="audit-action-panel">
      <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-gray-900">审核操作处置</h3>
      </div>

      {isPending ? (
        <>
          {/* Precision Match by URL Section */}
          <div className="bg-[#F4F8FD] border border-[#E2EEF9] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-gray-900 font-bold text-xs">
                <LinkIcon className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                <span>按链接地址精准匹配</span>
              </div>
              <span className="bg-[#EBF3FE] text-[#2563EB] border border-[#D5E6FC] text-[11px] font-medium px-2.5 py-0.5 rounded-full shrink-0">
                共 {totalMatchedCount} 条匹配数据
              </span>
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

            {/* Matched Content Items List */}
            {isUrlMatched && (
              <div className="space-y-2 pt-1 max-h-48 overflow-y-auto">
                {displayMatchedList.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-lg p-2.5 border border-gray-200/80 hover:border-blue-300 shadow-2xs space-y-1 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingDetailReport(c)}
                        className="font-bold text-[#1E5ABB] hover:text-[#134092] hover:underline text-xs leading-snug text-left cursor-pointer transition-colors line-clamp-1"
                        title={`点击查看事件详情: ${c.title}`}
                      >
                        {c.title}
                      </button>
                      <ReportOriginBadge report={c} size="sm" className="shrink-0" />
                    </div>
                    <div className="text-[11px] text-gray-500 flex items-center space-x-1.5">
                      <span>{c.organization}</span>
                      <span className="text-gray-300">·</span>
                      <span>{c.author}</span>
                      <span className="text-gray-300">·</span>
                      <span className="font-mono">{c.submitTime}</span>
                    </div>
                  </div>
                ))}
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
                  <span className="truncate">审核通过</span>
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
                  <span className="truncate">审核驳回</span>
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
                id="btn-confirm-drawer-approve"
                onClick={handleSubmitAudit}
                className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isUrlMatched && matchedCoReports.length > 0
                    ? `确认批量通过 (${matchedCoReports.length + 1} 条)`
                    : '确认审核通过'}
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
                    : '确认驳回'}
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
  );

  // 4. 同源速报详情查看弹窗 (z-[70])
  const renderDetailReportModal = () => {
    if (!viewingDetailReport) return null;
    return (
      <div
        className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        onClick={() => setViewingDetailReport(null)}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="bg-[#1E5ABB] text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-100 shrink-0" />
              <h3 className="text-sm font-bold">事件详情 · 同源速报查看</h3>
            </div>
            <button
              type="button"
              onClick={() => setViewingDetailReport(null)}
              className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg text-lg font-bold cursor-pointer transition-colors"
              title="关闭"
            >
              ✕
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
            {/* Title & Origin Badge */}
            <div className="pb-3 border-b border-gray-100">
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center flex-wrap gap-2">
                    <h2 className="text-base font-bold text-gray-900 leading-snug">
                      {viewingDetailReport.title}
                    </h2>
                    <ReportOriginBadge report={viewingDetailReport} size="sm" />
                  </div>
                  <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-md border bg-amber-50 text-amber-600 border-amber-200">
                    待审核
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500 text-[11px]">
                  <span className="flex items-center space-x-1">
                    <User className="w-3 h-3 text-gray-400" />
                    <span>{viewingDetailReport.author}（{viewingDetailReport.organization}）</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="font-mono">{viewingDetailReport.submitTime}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Structured Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100 text-[11px]">
              <div>
                <span className="text-gray-400 block">所属区域</span>
                <span className="font-medium text-gray-700">{viewingDetailReport.region}</span>
              </div>
              <div>
                <span className="text-gray-400 block">信息类型</span>
                <span className="font-medium text-gray-700">{viewingDetailReport.infoType}</span>
              </div>
              <div>
                <span className="text-gray-400 block">信息来源</span>
                <span className="font-medium text-gray-700">{viewingDetailReport.source}</span>
              </div>
              {viewingDetailReport.occurAddress && (
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-gray-400 block">发生地址</span>
                  <span className="font-medium text-gray-700">{viewingDetailReport.occurAddress}</span>
                </div>
              )}
              {viewingDetailReport.matchUrl && (
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-gray-400 block">匹配链接</span>
                  <a
                    href={viewingDetailReport.matchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[#2563EB] hover:underline flex items-center space-x-1 truncate"
                  >
                    <span className="truncate">{viewingDetailReport.matchUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              )}
            </div>

            {/* Content Breakdown */}
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <div className="font-bold text-gray-900 text-xs">【内容摘要】</div>
                <div className="bg-[#F8F9FA] border border-gray-100 rounded-lg p-3 text-xs text-gray-700 leading-relaxed font-normal">
                  {viewingDetailReport.detailContent?.summary || '多名网民反映该事件相关情况，已通过基层网格进行核实排查。'}
                </div>
              </div>

              {viewingDetailReport.detailContent?.coreDemands && (
                <div className="space-y-1">
                  <div className="font-bold text-gray-900 text-xs">【核心诉求】</div>
                  <div className="bg-[#F8F9FA] border border-gray-100 rounded-lg p-3 text-xs text-gray-700 leading-relaxed font-normal">
                    {viewingDetailReport.detailContent.coreDemands}
                  </div>
                </div>
              )}

              {viewingDetailReport.detailContent?.recommendations && (
                <div className="space-y-1">
                  <div className="font-bold text-gray-900 text-xs">【处置建议】</div>
                  <div className="bg-[#F8F9FA] border border-gray-100 rounded-lg p-3 text-xs text-gray-700 leading-relaxed font-normal">
                    {Array.isArray(viewingDetailReport.detailContent.recommendations) ? (
                      viewingDetailReport.detailContent.recommendations.map((rec, idx) => (
                        <p key={idx} className="leading-relaxed">{rec}</p>
                      ))
                    ) : (
                      <p className="leading-relaxed">{viewingDetailReport.detailContent.recommendations}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Attachments if any */}
              {viewingDetailReport.attachments && viewingDetailReport.attachments.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="font-bold text-gray-900 text-xs">【附件列表】({viewingDetailReport.attachments.length}个)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {viewingDetailReport.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg text-[11px]"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <Paperclip className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate font-medium text-gray-700">{att.name}</span>
                        </div>
                        <span className="text-gray-400 text-[10px] shrink-0">{att.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 1. 抽屉模式 (占当前界面的 50%，右侧抽屉展示)
  if (isDrawer) {
    return (
      <div
        className="fixed inset-0 z-50 overflow-hidden"
        id="audit-detail-drawer"
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
          {/* 抽屉顶部头部 */}
          <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between bg-white shrink-0 shadow-2xs">
            <div className="min-w-0 pr-3">
              <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                <span className="font-semibold text-[#1E5ABB]">审核管理</span>
                <span className="text-gray-300">/</span>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-600 hover:text-[#1E5ABB] hover:underline cursor-pointer"
                >
                  审核待办
                </button>
                <span className="text-gray-300">/</span>
                <span className="text-gray-800 font-bold">审核详情</span>
              </div>
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4.5">
            {renderMainContentCard()}
            {renderAttachmentsCard()}
            {renderAuditActionCard()}
            <AuditFlowTimeline report={report} />
          </div>
        </div>

        {/* 附件全屏预览弹窗 (z-[70]) */}
        <AttachmentPreviewModal
          isOpen={!!previewAttachment}
          onClose={() => setPreviewAttachment(null)}
          attachment={previewAttachment}
          attachments={attachments}
          onSelectAttachment={(att) => setPreviewAttachment(att)}
        />

        {/* 同源速报查看弹窗 (z-[70]) */}
        {renderDetailReportModal()}
      </div>
    );
  }

  // 2. 独立全页面模式 (当 isDrawer 为 false 时)
  return (
    <div className="space-y-4" id="audit-detail-view">
      {/* 1. Top Breadcrumbs & Back Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-2xs">
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-500 font-medium">审核管理</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <button
            onClick={handleClose}
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

      {/* 2. Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {renderMainContentCard()}
          {renderAttachmentsCard()}
        </div>
        <div className="space-y-5">
          {renderAuditActionCard()}
          <AuditFlowTimeline report={report} />
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

      {/* Event Detail Modal for Matched Co-Report Click */}
      {renderDetailReportModal()}
    </div>
  );
};
