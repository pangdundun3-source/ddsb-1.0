import { Attachment, ReportItem } from '../types';

export const DEFAULT_REJECT_REASON = '信息不完整，请补充政策原文链接和现场排查核实依据后重新提交。';

const FALLBACK_DETAIL: NonNullable<ReportItem['detailContent']> = {
  summary: '多名网民在微信群和短视频平台反映西坝区阳光花园一期、明月居等小区突发停水。经初步核查，受影响范围涉及居民约3万人。',
  coreDemands: '建议区政府协调水务集团查明原因并公布预计恢复时间，保障居民基本用水。',
  publicOpinionTrend: '本地同城话题阅读量持续上升，暂未发现线下聚集，但个别自媒体开始传播未经核实的停水范围。',
  recommendations: [
    '1. 建议区政府立即协调水务集团查明停水原因，并明确预计恢复供水时间。',
    '2. 通过官方渠道（微博、微信公众号）紧急发布停水情况说明，澄清不实传言。',
    '3. 若短时间内无法恢复，建议安排应急送水车前往受影响小区，保障居民基本用水需求。'
  ]
};

const FALLBACK_ATTACHMENTS: Attachment[] = [
  { id: 'a1', name: '现场网民留言截图1.png', size: '1.2 MB', type: 'image', thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&auto=format&fit=crop' },
  { id: 'a2', name: '网格巡查记录单.pdf', size: '2.4 MB', type: 'pdf' }
];

export const getReportDetailContent = (report: ReportItem) => report.detailContent || FALLBACK_DETAIL;

export const getReportAttachments = (report: ReportItem) => report.attachments || FALLBACK_ATTACHMENTS;

export const getRejectReasonText = (report: ReportItem) => report.rejectReason || DEFAULT_REJECT_REASON;
