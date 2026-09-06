import React from 'react';
import { Attachment, ReportItem } from '../types';
import { getFinalAuditScore } from '../auditStage';
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
} from 'lucide-react';

const fallbackDetail = {
  summary:
    '多名网民在微信群和短视频平台反映西屯区阳光花园一期、明月居等小区突发停水。经初步核查，受影响范围涉及居民约3万人。',
  coreDemands:
    '建议区政府协调水务集团查明原因并公布预计恢复时间，保障居民基本用水。',
  publicOpinionTrend:
    '本地网民话题阅读量持续上升，暂未发现线下聚集，但个别自媒体开始传播未经核实的停水范围。',
  recommendations: [
    '建议区政府立即协调水务集团查明停水原因，并明确预计恢复供水时间。',
    '通过官方渠道（微博、微信公众号）紧急发布停水情况说明，澄清不实传言。',
    '若短时间内无法恢复，建议安排应急送水车前往受影响小区，保障居民基本用水需求。',
  ],
};

const fallbackAttachments: Attachment[] = [
  {
    id: 'fallback-image',
    name: '现场网民留言截图1.png',
    size: '1.2 MB',
    type: 'image',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=640&auto=format&fit=crop',
  },
  {
    id: 'fallback-pdf',
    name: '网络巡查记录单.pdf',
    size: '2.4 MB',
    type: 'pdf',
  },
];

const getStatusMeta = (status: ReportItem['auditStatus']) => {
  if (status === '被驳回' || status === '已驳回') return { label: '已驳回', className: 'bg-rose-50 text-rose-700 border-rose-200' };
  if (status === '待审核') return { label: '待审核', className: 'bg-amber-50 text-amber-700 border-amber-200' };
  if (status === '审核中') return { label: '审核中', className: 'bg-blue-50 text-blue-700 border-blue-200' };
  if (status === '已通过') return { label: '已通过', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (status === '待转办') return { label: '待转办', className: 'bg-orange-50 text-orange-700 border-orange-200' };
  if (status === '已转办') return { label: '已转办', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
  if (status === '草稿') return { label: '草稿', className: 'bg-slate-100 text-slate-600 border-slate-200' };
  return { label: '已采纳', className: 'bg-teal-50 text-teal-700 border-teal-200' };
};

const getAttachmentUrl = (attachment: Attachment) => attachment.url || attachment.thumbnailUrl || '';

const createFallbackAttachmentBlob = (attachment: Attachment, mode: 'preview' | 'download') => {
  const content =
    mode === 'preview'
      ? `<!doctype html><html><head><meta charset="utf-8"><title>${attachment.name}</title></head><body style="font-family:Arial,sans-serif;padding:32px;background:#f8fafc;color:#0f172a;"><h1 style="font-size:20px;">${attachment.name}</h1><p>附件类型：${attachment.type}</p><p>文件大小：${attachment.size}</p><p>当前演示数据未配置真实文件地址，此页面用于完成附件预览操作。</p></body></html>`
      : [
          'Attachment evidence placeholder',
          `Name: ${attachment.name}`,
          `Type: ${attachment.type}`,
          `Size: ${attachment.size}`,
          '',
          'This local file is generated for demo download when no file URL is configured.',
        ].join('\n');

  return URL.createObjectURL(
    new Blob([content], {
      type: mode === 'preview' ? 'text/html;charset=utf-8' : 'text/plain;charset=utf-8',
    })
  );
};

interface ReportContentDisplayProps {
  report: ReportItem;
}

export const ReportContentDisplay: React.FC<ReportContentDisplayProps> = ({ report }) => {
  const detail = report.detailContent || fallbackDetail;
  const evidenceAttachments = (report.attachments || fallbackAttachments).filter((attachment) => attachment.type !== 'link');
  const attachments = evidenceAttachments.length ? evidenceAttachments : fallbackAttachments;
  const sourceUrl =
    report.matchUrl ||
    report.attachments?.find((attachment) => attachment.type === 'link')?.url ||
    'https://news.example.com/';
  const statusMeta = getStatusMeta(report.auditStatus);
  const finalScore = getFinalAuditScore(report);

  const handlePreviewAttachment = (attachment: Attachment) => {
    const url = getAttachmentUrl(attachment) || createFallbackAttachmentBlob(attachment, 'preview');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadAttachment = (attachment: Attachment) => {
    const url = getAttachmentUrl(attachment) || createFallbackAttachmentBlob(attachment, 'download');

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = attachment.name;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.click();
  };

  const ident = resolveIdentification(report);

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-2xs">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-extrabold leading-6 text-slate-950">
                {report.title}
              </h1>
              {ident.status && (
                <IdentificationBadge status={ident.status} size="xs" showIcon />
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                {report.author}（{report.organization}）
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {report.submitTime}
              </span>
              {finalScore !== undefined && (
                <span className="inline-flex items-center rounded border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                  评分：{finalScore} 分
                </span>
              )}
            </div>
          </div>
          <span className={`shrink-0 rounded border px-2.5 py-1 text-[11px] font-bold ${statusMeta.className}`}>
            {statusMeta.label}
          </span>
        </div>

        <div className="mt-6 space-y-4 text-xs leading-relaxed text-slate-700">
          <div>
            <h2 className="mb-1.5 text-xs font-extrabold text-slate-900">【内容摘要】</h2>
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5">{detail.summary}</div>
          </div>
          <div>
            <h2 className="mb-1.5 text-xs font-extrabold text-slate-900">【核心诉求】</h2>
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5">{detail.coreDemands}</div>
          </div>
          <div>
            <h2 className="mb-1.5 text-xs font-extrabold text-slate-900">【舆情态势】</h2>
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5">{detail.publicOpinionTrend}</div>
          </div>
          <div>
            <h2 className="mb-1.5 text-xs font-extrabold text-slate-900">【建议详情 / 处置建议】</h2>
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5">
              <ol className="space-y-1">
                {detail.recommendations.map((recommendation, index) => (
                  <li key={`${recommendation}-${index}`}>
                    {recommendation.startsWith(`${index + 1}.`)
                      ? recommendation
                      : `${index + 1}. ${recommendation}`}
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div>
            <h2 className="mb-1.5 text-xs font-extrabold text-slate-900">【问题地址】</h2>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2.5">
              <span className="min-w-0 truncate font-mono text-[11px] text-blue-700">{sourceUrl}</span>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1 rounded border border-blue-300 bg-white px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-50"
              >
                访问链接
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-[#1E5ABB]" />
            <h2 className="text-sm font-extrabold text-slate-900">附件证明材料</h2>
          </div>
          <span className="text-xs text-slate-400">共 {attachments.length} 份佐证材料</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {attachments.map((attachment) => {
            return (
              <div key={attachment.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                {attachment.type === 'image' ? (
                  <div className="relative h-20 bg-slate-100">
                    <img
                      src={attachment.thumbnailUrl || fallbackAttachments[0].thumbnailUrl}
                      alt={attachment.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative flex h-20 items-center justify-center bg-rose-50 text-rose-500">
                    <span className="absolute left-2 top-2 rounded bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      PDF 文档
                    </span>
                    <div className="text-center">
                      <FileText className="mx-auto mb-1.5 h-6 w-6" />
                      <div className="max-w-[150px] truncate text-[11px] font-bold text-slate-700">{attachment.name}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-[10px] text-slate-500">
                  <div className="min-w-0">
                    <div className="truncate font-semibold leading-4 text-slate-700" title={attachment.name}>
                      {attachment.name}
                    </div>
                    <div className="leading-4">{attachment.size}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePreviewAttachment(attachment)}
                      className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800"
                    >
                      <Eye className="h-3 w-3" />
                      预览
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadAttachment(attachment)}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
                    >
                      <Download className="h-3 w-3" />
                      下载
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
