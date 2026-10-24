import React, { useState } from 'react';
import { Attachment, ReportItem } from '../types';
import { IdentificationBadge } from './IdentificationBadge';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';
import { toPreAdoptionIdentLabel } from '../services/identificationService';
import {
  User,
  Clock,
  Paperclip,
  FileText,
  ArrowRightLeft,
  ExternalLink,
  Eye,
  Download,
} from 'lucide-react';

interface MatchedReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedReport: ReportItem | null;
  currentReport: ReportItem | null;
  currentScore?: number;
  onScoreChange?: (score: number) => void;
  isSelectedForBatch?: boolean;
  onToggleBatchSelect?: (selected: boolean) => void;
  onSetAsPrimary?: (report: ReportItem) => void;
}

export const MatchedReportDetailModal: React.FC<MatchedReportDetailModalProps> = ({
  isOpen,
  onClose,
  matchedReport,
  currentReport,
  currentScore = 3,
  onScoreChange,
  isSelectedForBatch = true,
  onToggleBatchSelect,
  onSetAsPrimary
}) => {
  const [viewMode, setViewMode] = useState<'detail' | 'compare'>('detail');
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  if (!isOpen || !matchedReport) return null;

  const detail = matchedReport.detailContent || {
    summary: '暂无摘要描述。',
    coreDemands: '暂无核心诉求记录。',
    publicOpinionTrend: '暂无舆情态势研判。',
    recommendations: ['建议持续关注事件发展。']
  };

  const currentDetail = currentReport?.detailContent || {
    summary: '暂无摘要描述。',
    coreDemands: '暂无核心诉求记录。',
    publicOpinionTrend: '暂无舆情态势研判。',
    recommendations: ['建议持续关注事件发展。']
  };

  const attachments: Attachment[] =
    matchedReport.attachments && matchedReport.attachments.length > 0
      ? matchedReport.attachments
      : [
          {
            id: 'm-att-1',
            name: '现场核查抢修照片.jpg',
            size: '1.4 MB',
            type: 'image',
            thumbnailUrl:
              'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop',
            url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&auto=format&fit=crop',
          },
          {
            id: 'm-att-2',
            name: '供水调度与送水车台账.pdf',
            size: '2.1 MB',
            type: 'pdf',
          },
        ];

  const handleDownloadAttachment = (att: Attachment) => {
    if (att.url || att.thumbnailUrl) {
      const link = document.createElement('a');
      link.href = att.url || att.thumbnailUrl || '#';
      link.download = att.name;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    const blob = new Blob(
      [
        `【附件材料】${att.name}\n文件大小：${att.size}\n关联事件：${matchedReport.title}\n上报单位：${matchedReport.organization}\n报送时间：${matchedReport.submitTime}`,
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = att.name.endsWith('.pdf') ? att.name : `${att.name}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
    <div
      className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      id="matched-report-detail-modal"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header — 对齐审核上报端同源详情弹窗 */}
        <div className="bg-[#1E5ABB] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            <FileText className="w-5 h-5 text-blue-100 shrink-0" />
            <h3 className="text-sm font-bold truncate">事件详情 · 同源速报查看</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg text-lg font-bold cursor-pointer transition-colors shrink-0"
            title="关闭"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs text-gray-700">
          {viewMode === 'detail' ? (
            <div className="space-y-4">
              {/* Title & Origin Badge — 对齐上报端 */}
              <div className="pb-3 border-b border-gray-100">
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center flex-wrap gap-2 min-w-0">
                      <h2 className="text-base font-bold text-gray-900 leading-snug">
                        {matchedReport.title}
                      </h2>
                      <IdentificationBadge
                        status={toPreAdoptionIdentLabel(matchedReport.identificationStatus)}
                        size="sm"
                        showIcon
                        title="系统打标（未采纳入库前为疑似标识，不支持人工修改）"
                      />
                    </div>
                    <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-md border bg-amber-50 text-amber-600 border-amber-200">
                      {matchedReport.auditStatus || '待审核'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500 text-[11px]">
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-gray-400" />
                      <span>
                        {matchedReport.author}
                        {matchedReport.organization ? `（${matchedReport.organization}）` : ''}
                      </span>
                    </span>
                    {matchedReport.submitTime && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="font-mono">{matchedReport.submitTime}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Structured Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100 text-[11px]">
                <div>
                  <span className="text-gray-400 block">所属区域</span>
                  <span className="font-medium text-gray-700">{matchedReport.region || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">信息类型</span>
                  <span className="font-medium text-gray-700">{matchedReport.infoType || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">信息来源</span>
                  <span className="font-medium text-gray-700">{matchedReport.source || '—'}</span>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-gray-400 block">发生地址</span>
                  <span className="font-medium text-gray-700">
                    {matchedReport.occurAddress || '西屯区管网涉事街道'}
                  </span>
                </div>
                {matchedReport.matchUrl && (
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-gray-400 block">匹配链接</span>
                    <a
                      href={matchedReport.matchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[#2563EB] hover:underline flex items-center space-x-1 truncate"
                    >
                      <span className="truncate">{matchedReport.matchUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>

              {/* Detail Sections */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <div className="font-bold text-gray-900 text-xs">【内容摘要】</div>
                  <div className="bg-[#F8F9FA] border border-gray-100 rounded-lg p-3 text-xs text-gray-700 leading-relaxed font-normal">
                    {detail.summary}
                  </div>
                </div>

                {detail.coreDemands && (
                  <div className="space-y-1">
                    <div className="font-bold text-gray-900 text-xs">【核心诉求】</div>
                    <div className="bg-[#F8F9FA] border border-gray-100 rounded-lg p-3 text-xs text-gray-700 leading-relaxed font-normal">
                      {detail.coreDemands}
                    </div>
                  </div>
                )}

                {detail.recommendations && (
                  <div className="space-y-1">
                    <div className="font-bold text-gray-900 text-xs">【处置建议】</div>
                    <div className="bg-[#F8F9FA] border border-gray-100 rounded-lg p-3 text-xs text-gray-700 leading-relaxed font-normal space-y-1">
                      {Array.isArray(detail.recommendations) ? (
                        detail.recommendations.map((r, idx) => (
                          <p key={idx} className="leading-relaxed">{r}</p>
                        ))
                      ) : (
                        <p className="leading-relaxed">{detail.recommendations}</p>
                      )}
                    </div>
                  </div>
                )}

                {attachments.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="font-bold text-gray-900 text-xs">
                      【附件列表】({attachments.length}个)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {attachments.map((att) => {
                        const isImage = att.type === 'image';
                        return (
                          <div
                            key={att.id}
                            className="flex items-center justify-between gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg text-[11px]"
                          >
                            <div className="flex items-center space-x-2 truncate min-w-0">
                              <Paperclip className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <div className="min-w-0">
                                <span className="truncate font-medium text-gray-700 block" title={att.name}>
                                  {att.name}
                                </span>
                                <span className="text-gray-400 text-[10px]">{att.size}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {isImage && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewAttachment(att)}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[#1E5ABB] hover:bg-blue-50 font-medium cursor-pointer"
                                  title="预览图片"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>预览</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDownloadAttachment(att)}
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-gray-600 hover:text-[#1E5ABB] hover:bg-blue-50 font-medium cursor-pointer"
                                title="下载附件"
                              >
                                <Download className="w-3 h-3" />
                                <span>下载</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Comparison Mode (Side by Side) */
            <div className="space-y-5">
              {/* Comparative Matrix Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Current Report */}
                <div className="bg-blue-50/40 border border-blue-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                    <span className="font-bold text-blue-900 text-xs flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span>当前审核主件（首发报送）</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      首发
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 text-xs leading-snug">
                      {currentReport?.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {currentReport?.author} · {currentReport?.organization}（{currentReport?.submitTime}）
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-600">【内容摘要】</span>
                    <div className="bg-white border border-blue-100 rounded-lg p-2.5 text-xs text-gray-700 leading-relaxed max-h-36 overflow-y-auto">
                      {currentDetail.summary}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-600">【核心诉求】</span>
                    <div className="bg-white border border-blue-100 rounded-lg p-2.5 text-xs text-gray-700 leading-relaxed">
                      {currentDetail.coreDemands}
                    </div>
                  </div>

                  <div className="text-[11px] bg-blue-100/60 text-blue-900 p-2 rounded-lg font-medium">
                    评定依据: 首发预警，受影响居民面广（3万人），建议评分 5.0 分
                  </div>
                </div>

                {/* Right: Matched Report */}
                <div className="bg-amber-50/40 border border-amber-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                    <span className="font-bold text-amber-900 text-xs flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span>匹配到的同省报送（疑似重复件）</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      疑似重复 94%
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 text-xs leading-snug">
                      {matchedReport.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {matchedReport.author} · {matchedReport.organization}（{matchedReport.submitTime}）
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-600">【内容摘要】</span>
                    <div className="bg-white border border-amber-100 rounded-lg p-2.5 text-xs text-gray-700 leading-relaxed max-h-36 overflow-y-auto">
                      {detail.summary}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-600">【核心诉求】</span>
                    <div className="bg-white border border-amber-100 rounded-lg p-2.5 text-xs text-gray-700 leading-relaxed">
                      {detail.coreDemands}
                    </div>
                  </div>

                  <div className="text-[11px] bg-amber-100/60 text-amber-900 p-2 rounded-lg font-medium">
                    评定依据: 补充现场阀门抢修与送水车调度数据，建议评分 3.0 分
                  </div>
                </div>
              </div>

              {/* Comparative Highlights Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <span className="font-bold text-gray-900 text-xs flex items-center space-x-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#1E5ABB]" />
                  <span>同省同一事件 · 差异对比深度研判</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                    <span className="text-gray-400 block text-[11px] font-medium">报送时序差异</span>
                    <span className="font-bold text-gray-800">晚 25~45 分钟</span>
                    <p className="text-[11px] text-gray-500">
                      首发件先达预警；本件为辖区单位跟进调查
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                    <span className="text-gray-400 block text-[11px] font-medium">共同反映事实</span>
                    <span className="font-bold text-emerald-700">突发供水管网故障</span>
                    <p className="text-[11px] text-gray-500">
                      均反映阳光花园明月居等小区停水及生活影响
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                    <span className="text-gray-400 block text-[11px] font-medium">差异化增量价值</span>
                    <span className="font-bold text-amber-700">含现场抢修及通水时间</span>
                    <p className="text-[11px] text-gray-500">
                      补充了抢修工单与4台临时送水车调度信息
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    <AttachmentPreviewModal
      isOpen={!!previewAttachment}
      onClose={() => setPreviewAttachment(null)}
      attachment={previewAttachment}
      attachments={attachments}
      onSelectAttachment={(att) => setPreviewAttachment(att)}
    />
    </>
  );
};
