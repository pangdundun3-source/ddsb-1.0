import { isFinalAuditStage } from '../auditStage';
import { AuditRecordItem, LogItem, NewReportFormData, ReportItem, TimelineNode } from '../types';

export const getNowText = () => new Date().toLocaleString('zh-CN', { hour12: false });

export const appendTimeline = (report: ReportItem, nodes: TimelineNode[]): ReportItem => ({
  ...report,
  timeline: [...(report.timeline || []), ...nodes]
});

export const createSubmitNode = (
  report: ReportItem,
  time: string,
  title = '提交上报'
): TimelineNode => ({
  title,
  operator: `${report.author}·${report.organization}`,
  time,
  status: 'completed'
});

export const createWaitingAuditNode = (): TimelineNode => ({
  title: '审核处理',
  operator: '市委宣传部舆情科',
  status: 'current',
  note: '待审核'
});

const createReportFromForm = (
  input: NewReportFormData,
  id: number,
  submitTime: string
): ReportItem => ({
  id,
  title: input.title,
  source: input.source,
  region: input.region,
  infoType: input.infoType,
  author: input.author,
  organization: input.organization,
  submitTime,
  auditStatus: '待审核',
  score: '--',
  occurAddress: input.occurAddress || `${input.region}相关涉事区域`,
  detailContent: {
    summary: input.summary || '暂无详细摘要描述。',
    coreDemands: input.demands || '网民核心诉求正在整理核实中。',
    publicOpinionTrend: '话题关注度一般，总体舆情可控。',
    recommendations: input.recommendations
      ? input.recommendations.split('\n')
      : ['建议相关责任部门持续监测关注。']
  },
  attachments:
    input.attachments && input.attachments.length > 0
      ? input.attachments
      : [{ id: 'att-1', name: '速报凭证材料.jpg', size: '1.5 MB', type: 'image' }]
});

export const createSubmittedReport = (
  input: NewReportFormData,
  id = Date.now(),
  submitTime = getNowText()
): ReportItem => {
  const report = createReportFromForm(input, id, submitTime);

  return appendTimeline(report, [
    createSubmitNode(report, submitTime),
    createWaitingAuditNode()
  ]);
};

export const resubmitReport = (report: ReportItem, now = getNowText()): ReportItem => {
  const resubmittedReport: ReportItem = {
    ...report,
    auditStatus: '待审核',
    submitTime: now,
    rejectReason: undefined,
    rejectDetail: undefined,
    score: '--'
  };

  return appendTimeline(resubmittedReport, [
    createSubmitNode(
      resubmittedReport,
      now,
      report.rejectReason ? '提交上报（重新提交）' : '提交上报'
    ),
    createWaitingAuditNode()
  ]);
};

export const approveReport = (
  report: ReportItem,
  score?: number,
  now = getNowText()
): ReportItem => {
  const finalAudit = isFinalAuditStage(report);
  const appliedScore = finalAudit ? score : undefined;
  const approveNode: TimelineNode = {
    title: '审核处理',
    operator: '王主任·市委宣传部舆情科',
    time: now,
    status: 'completed',
    ...(appliedScore !== undefined ? { score: appliedScore } : {}),
    note: finalAudit ? '终审通过，流程结束并已采纳。' : '审核通过，进入下一审核节点。'
  };

  return appendTimeline(
    {
      ...report,
      auditStatus: finalAudit ? '已采纳' : '已通过',
      score: appliedScore ?? '--',
      auditor: '王主任',
      auditTime: now
    },
    [
      approveNode,
      ...(finalAudit
        ? [
            {
              title: '结束',
              operator: '流程结束',
              status: 'completed' as const,
              note: '已采纳。'
            }
          ]
        : [
            {
              title: '结束',
              operator: '流程结束',
              status: 'current' as const,
              note: '待采纳'
            }
          ])
    ]
  );
};

export const rejectReport = (
  report: ReportItem,
  reason: string,
  detail: string,
  now = getNowText()
): ReportItem => {
  const fullReason = `${reason}${detail ? ` (${detail})` : ''}`;
  return appendTimeline(
    {
      ...report,
      auditStatus: '被驳回',
      rejectReason: fullReason,
      rejectDetail: detail,
      auditor: '王主任',
      auditTime: now
    },
    [
      {
        title: '审核处理',
        operator: '王主任·市委宣传部舆情科',
        time: now,
        status: 'rejected',
        note: fullReason
      }
    ]
  );
};

export const transferReport = (
  report: ReportItem,
  opinion: string,
  now = getNowText()
): ReportItem =>
  appendTimeline(
    {
      ...report,
      auditStatus: '已转办',
      transferTime: now,
      transferOpinion: opinion
    },
    [
      {
        title: '结束',
        operator: '市委宣传部舆情科',
        time: now,
        status: 'completed',
        note: opinion || '已提交责任单位转办。'
      }
    ]
  );

export const createAuditRecord = (
  report: ReportItem,
  result: AuditRecordItem['auditResult'],
  now: string,
  score?: number,
  reason?: string,
  detail?: string
): AuditRecordItem => ({
  id: Date.now(),
  reportId: report.id,
  title: report.title,
  organization: report.organization,
  auditor: '王主任',
  auditResult: result,
  auditTime: now,
  ...(score !== undefined && isFinalAuditStage(report) ? { score } : {}),
  ...(reason ? { rejectReason: reason } : {}),
  ...(detail ? { rejectDetail: detail } : {})
});

export const createOperationLog = (
  actionType: string,
  details: string,
  now: string,
  operator = '王主任',
  organization = '市委宣传部舆情科'
): LogItem => ({
  id: Date.now(),
  operator,
  organization,
  actionType,
  details,
  timestamp: now,
  ipAddress: '192.168.1.12'
});
