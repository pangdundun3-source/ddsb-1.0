import React, { useState } from 'react';
import { Attachment, ReportItem } from '../types';
import { IdentificationBadge } from './IdentificationBadge';
import { resolveIdentification } from '../services/identificationService';
import {
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Paperclip,
  User,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';

const defaultSummary =
  '今日（8月13日）上午8时许，多名网民在微博、微信群反映西坝区阳光花园一期、明月居等5个小区突发停水，早高峰生活用水受到影响，涉及居民约3万人。';
const defaultCoreDemands =
  '网民普遍反映未接到停水通知，早高峰期间停水严重影响正常生活，部分网民情绪急躁，质疑供水部门应急处置能力。';
const defaultPublicOpinionTrend =
  '目前相关话题在本地区微博同城榜排名呈上升趋势，阅读量已突破10万。暂未发现大规模聚集性负面言论，但个别自媒体账号开始发布未经证实的“管道大面积破裂需要停水数日”的言论。';
const defaultRecommendations = [
  '1. 建议区政府立即协调水务集团查明停水原因，并明确预计恢复供水时间。',
  '2. 通过官方渠道（微博、微信公众号）紧急发布停水情况说明，澄清不实传言。',
  '3. 若短时间内无法恢复，建议安排应急送水车前往受影响小区，保障居民基本用水需求。',
];

export const defaultReportAttachments: Attachment[] = [
  {
    id: 'a1',
    name: '微博热点截图.png',
    size: '1.2 MB',
    type: 'image',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&auto=format&fit=crop',
  },
  {
    id: 'a2',
    name: '现场微信群反馈.jpg',
    size: '850 KB',
    type: 'image',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop',
  },
  {
    id: 'a3',
    name: '应急供水保障预案.pdf',
    size: '2.4 MB',
    type: 'pdf',
  },
];

interface ReportDetailCardProps {
  report: ReportItem;
  allReports?: ReportItem[];
  matchUrl?: string;
  onPreviewAttachment?: (attachment: Attachment) => void;
}

export const ReportDetailCard: React.FC<ReportDetailCardProps> = ({
  report,
  allReports = [],
  matchUrl,
  onPreviewAttachment,
}) => {
  const [internalPreviewAttachment, setInternalPreviewAttachment] = useState<Attachment | null>(
    null
  );

  const detail = report.detailContent || {
    summary: defaultSummary,
    coreDemands: defaultCoreDemands,
    publicOpinionTrend: defaultPublicOpinionTrend,
    recommendations: defaultRecommendations,
  };

  const currentMatchUrl =
    matchUrl || report.matchUrl || 'https://news.example.com/';

  const rawAttachments = report.attachments && report.attachments.length > 0
    ? report.attachments.filter((a) => a.type !== 'link')
    : defaultReportAttachments;

  const attachments = rawAttachments.length > 0 ? rawAttachments : defaultReportAttachments;

  const ident = resolveIdentification(report, allReports);
  // Default to 疑似首发 if undefined or match screenshot
  const displayStatus = ident.status || '疑似首发';

  const handlePreview = (att: Attachment) => {
    if (onPreviewAttachment) {
      onPreviewAttachment(att);
    } else {
      setInternalPreviewAttachment(att);
    }
  };

  const handleDownload = (att: Attachment) => {
    if (att.url || att.thumbnailUrl) {
      const link = document.createElement('a');
      link.href = att.url || att.thumbnailUrl || '#';
      link.download = att.name;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const blob = new Blob(
        [
          `【附件材料】${att.name}\n文件大小：${att.size}\n关联事件：${report.title}\n上报单位：${report.organization}\n报送时间：${report.submitTime}`,
        ],
        { type: 'text/plain;charset=utf-8' }
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = att.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Status badge styling
  const isPending = report.auditStatus === '待审核';
  const isAdopted = report.auditStatus === '已采纳' || report.auditStatus === '已通过';
  const isRejected = report.auditStatus === '被驳回' || report.auditStatus === '已驳回';

  let statusBadgeClasses = 'bg-[#FEF9EE] text-[#D97706] border border-[#FDE68A]';
  if (isAdopted) {
    statusBadgeClasses = 'bg-emerald-50 text-emerald-600 border border-emerald-200';
  } else if (isRejected) {
    statusBadgeClasses = 'bg-rose-50 text-rose-600 border border-rose-200';
  } else if (report.auditStatus === '审核中') {
    statusBadgeClasses = 'bg-blue-50 text-blue-600 border border-blue-200';
  } else if (report.auditStatus === '已转办' || report.auditStatus === '待转办') {
    statusBadgeClasses = 'bg-indigo-50 text-indigo-600 border border-indigo-200';
  }

  // Recommendations parsing
  const recommendationsList = Array.isArray(detail.recommendations)
    ? detail.recommendations
    : typeof detail.recommendations === 'string'
    ? (detail.recommendations as string).split('\n').filter(Boolean)
    : defaultRecommendations;

  return (
    <div className="space-y-4" id="report-detail-card-container">
      {/* 1. Main Article Information Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-6 sm:p-7 space-y-4">
        {/* Title & Status Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug tracking-tight">
              {report.title}
            </h1>
            {/* Identification Badge: e.g. ✨ 疑似首发 */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded-full text-xs font-medium shadow-2xs">
              <Sparkles className="w-3 h-3 text-[#2563EB] stroke-[2]" />
              <span>{displayStatus}</span>
            </span>
          </div>

          {/* Right Status Badge: 待审核 */}
          <div className="shrink-0">
            <span
              className={`text-xs font-medium px-3.5 py-1 rounded-md shadow-2xs ${statusBadgeClasses}`}
            >
              {report.auditStatus || '待审核'}
            </span>
          </div>
        </div>

        {/* Sub-meta: Author + Org & Submit Time */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500 pt-0.5">
          <div className="flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-gray-700 font-normal">
              {report.author}{' '}
              {report.organization ? `(${report.organization})` : ''}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 font-mono text-gray-500">
            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{report.submitTime || '2023-10-22 10:20'}</span>
          </div>
        </div>

        {/* 4-Column Meta Box matching the user screenshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 text-xs">
          <div>
            <div className="text-gray-400 text-[11px]">信息来源</div>
            <div className="font-semibold text-gray-800 mt-0.5">{report.source || '政府官网'}</div>
          </div>
          <div>
            <div className="text-gray-400 text-[11px]">所属区域</div>
            <div className="font-semibold text-gray-800 mt-0.5">{report.region || '南屯区'}</div>
          </div>
          <div>
            <div className="text-gray-400 text-[11px]">信息类型</div>
            <div className="font-semibold text-gray-800 mt-0.5">{report.infoType || '政策解读'}</div>
          </div>
          <div>
            <div className="text-gray-400 text-[11px]">发生地址</div>
            <div className="font-semibold text-gray-800 mt-0.5">{report.occurAddress || '未填'}</div>
          </div>
        </div>

        {/* 5 Structured Content Blocks */}
        <div className="space-y-4 pt-1 text-xs text-gray-800">
          {/* 【内容摘要】 */}
          <div className="space-y-1.5">
            <div className="font-bold text-gray-900 text-xs">【内容摘要】</div>
            <div className="bg-[#F8F9FA] border border-gray-100 rounded-lg p-3.5 text-xs text-gray-700 leading-relaxed font-normal">
              {detail.summary || defaultSummary}
            </div>
          </div>

          {/* 【核心诉求】 */}
          <div className="space-y-1.5">
            <div className="font-bold text-gray-900 text-xs">【核心诉求】</div>
            <div className="bg-[#F8F9FA] border border-gray-100 rounded-lg p-3.5 text-xs text-gray-700 leading-relaxed font-normal">
              {detail.coreDemands || defaultCoreDemands}
            </div>
          </div>

          {/* 【舆情态势】 */}
          <div className="space-y-1.5">
            <div className="font-bold text-gray-900 text-xs">【舆情态势】</div>
            <div className="bg-[#F8F9FA] border border-gray-100 rounded-lg p-3.5 text-xs text-gray-700 leading-relaxed font-normal">
              {detail.publicOpinionTrend || defaultPublicOpinionTrend}
            </div>
          </div>

          {/* 【建议举措 / 处置建议】 */}
          <div className="space-y-1.5">
            <div className="font-bold text-gray-900 text-xs">
              【建议举措 / 处置建议】
            </div>
            <div className="bg-[#F8F9FA] border border-gray-100 rounded-lg p-3.5 text-xs text-gray-700 space-y-1.5 leading-relaxed font-normal">
              {recommendationsList.map((rec, i) => (
                <p key={i} className="leading-relaxed">
                  {rec.startsWith(`${i + 1}.`) ? rec : `${i + 1}. ${rec}`}
                </p>
              ))}
            </div>
          </div>

          {/* 【同源地址】 */}
          <div className="space-y-1.5">
            <div className="font-bold text-gray-900 text-xs">【同源地址】</div>
            <div className="bg-[#F8F9FA] border border-gray-100 rounded-lg p-2.5 px-3.5 flex items-center justify-between gap-3">
              <span
                className="font-mono text-xs text-[#2563EB] truncate flex-1"
                title={currentMatchUrl}
              >
                {currentMatchUrl}
              </span>
              <a
                href={currentMatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EFF6FF] hover:bg-blue-100 text-[#2563EB] border border-[#BFDBFE] rounded-lg text-xs font-medium transition-colors shrink-0 shadow-2xs"
                title="在新窗口查看源网页"
              >
                <span>访问链接</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#2563EB]" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Attachment Evidence Materials Card (1:1 with Screenshot) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-6 sm:p-7 space-y-4">
        {/* Header: 📎 附件证据材料 & 共 3 份佐证材料 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Paperclip className="w-4 h-4 text-[#2563EB] -rotate-45 shrink-0" />
            <h3 className="text-sm font-bold text-gray-900">附件证据材料</h3>
          </div>
          <span className="text-xs text-gray-400 font-normal">
            共 {attachments.length} 份佐证材料
          </span>
        </div>

        {/* 3-Column Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {attachments.map((file, idx) => {
            const isImage = file.type === 'image';
            const isPdf = file.type === 'pdf' || file.name.endsWith('.pdf');

            return (
              <div
                key={file.id || idx}
                className="rounded-xl border border-gray-200/80 bg-white overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col group"
              >
                {/* Visual Area (h-36) */}
                {isImage ? (
                  <div className="relative h-36 bg-gray-100 overflow-hidden">
                    <img
                      src={
                        file.thumbnailUrl ||
                        (idx === 0
                          ? 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop'
                          : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop')
                      }
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Dark Filename Badge on Top-Left */}
                    <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-0.5 rounded-md max-w-[85%] truncate shadow-2xs">
                      {file.name}
                    </div>
                  </div>
                ) : (
                  <div className="relative h-36 bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
                    {/* Red PDF 文档 Badge on Top-Left */}
                    <span className="absolute top-2.5 left-2.5 bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
                      {isPdf ? 'PDF 文档' : '文档'}
                    </span>
                    {/* Large Red File Icon */}
                    <FileText className="w-10 h-10 text-[#EF4444] stroke-[1.75] mb-2" />
                    {/* Filename below icon */}
                    <p
                      className="text-xs font-bold text-gray-800 text-center max-w-[90%] truncate"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                  </div>
                )}

                {/* Bottom Footer: File Size on Left, 👁 预览 | ⬇ 下载 on Right */}
                <div className="p-3 px-3.5 bg-white flex items-center justify-between text-xs border-t border-gray-100 mt-auto">
                  <span className="text-gray-400 text-xs font-normal">
                    {file.size}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handlePreview(file)}
                      className="text-[#2563EB] hover:text-blue-700 font-medium flex items-center space-x-1 cursor-pointer transition-colors"
                      title="预览该附件"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>预览</span>
                    </button>
                    <span className="text-gray-300 font-light select-none">|</span>
                    <button
                      type="button"
                      onClick={() => handleDownload(file)}
                      className="text-gray-500 hover:text-gray-800 font-medium flex items-center space-x-1 cursor-pointer transition-colors"
                      title="下载该附件"
                    >
                      <Download className="w-3.5 h-3.5 text-gray-500" />
                      <span>下载</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Embedded Attachment Preview Modal */}
      <AttachmentPreviewModal
        isOpen={!!internalPreviewAttachment}
        onClose={() => setInternalPreviewAttachment(null)}
        attachment={internalPreviewAttachment}
        attachments={attachments}
        onSelectAttachment={(att) => setInternalPreviewAttachment(att)}
      />
    </div>
  );
};
