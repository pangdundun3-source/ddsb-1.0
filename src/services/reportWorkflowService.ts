import { isFinalAuditStage } from '../auditStage';
import { AuditRecordItem, LogItem, NewReportFormData, ReportItem, TimelineNode, OriginTypeLabel, SimilarReportMatch } from '../types';

export const getNowText = () => new Date().toLocaleString('zh-CN', { hour12: false });

/**
 * 智能比对预判算法：
 * 比对不良信息库与在审/历史数据，自动给出预判结果（疑似首发 / 疑似重复）
 */
export const evaluateOriginPreJudgment = (
  input: { title: string; occurAddress?: string; region?: string; matchUrl?: string; summary?: string },
  existingReports: ReportItem[] = []
): { originLabel: OriginTypeLabel; originReason: string; similarReports: SimilarReportMatch[] } => {
  const title = (input.title || '').trim();
  const summary = (input.summary || '').trim();
  const matchUrl = (input.matchUrl || '').trim();
  const region = (input.region || '').trim();

  // 1. URL 完全相同比对
  if (matchUrl) {
    const urlMatched = existingReports.find(
      (r) => r.matchUrl && r.matchUrl.trim() === matchUrl
    );
    if (urlMatched) {
      return {
        originLabel: '疑似重复',
        originReason: `系统智能比对：检测到与《${urlMatched.title}》（报送时间: ${urlMatched.submitTime}）存在完全一致的同源线索地址，初判为重复报送。`,
        similarReports: [
          {
            id: urlMatched.id,
            title: urlMatched.title,
            submitTime: urlMatched.submitTime,
            organization: urlMatched.organization,
            similarity: 98,
            matchReason: '同源监测链接完全重合'
          }
        ]
      };
    }
  }

  // 2. 标题和关键词相似度比对
  const similarList: SimilarReportMatch[] = [];
  const cleanTitle = title.replace(/[【】\[\]()（）·,，。]/g, '');

  for (const item of existingReports) {
    if (!item.title) continue;
    const existingClean = item.title.replace(/[【】\[\]()（）·,，。]/g, '');

    // 计算标题或摘要重合度
    let matchScore = 0;
    const reasonParts: string[] = [];

    // 同源 URL 重合
    if (matchUrl && item.matchUrl && matchUrl === item.matchUrl) {
      matchScore = 95;
      reasonParts.push('同源URL一致');
    }

    // 核心关键词匹配
    const keywords = ['停水', '燃气', '施工', '火灾', '噪音', '废气', '排污', '断网', '坍塌', '交通', '抢修', '积水', '维权', '投诉', '退费'];
    let sharedKeywordsCount = 0;
    for (const kw of keywords) {
      if (cleanTitle.includes(kw) && existingClean.includes(kw)) {
        sharedKeywordsCount++;
      }
    }

    if (cleanTitle === existingClean) {
      matchScore = 100;
      reasonParts.push('标题完全相同');
    } else if (cleanTitle.includes(existingClean) || existingClean.includes(cleanTitle)) {
      matchScore = Math.max(matchScore, 85);
      reasonParts.push('标题高度包含');
    } else if (sharedKeywordsCount >= 2 || (sharedKeywordsCount >= 1 && region && item.region === region)) {
      matchScore = Math.max(matchScore, 70 + sharedKeywordsCount * 8);
      reasonParts.push(`同区域(${region})且共现关键词`);
    }

    if (matchScore >= 60) {
      similarList.push({
        id: item.id,
        title: item.title,
        submitTime: item.submitTime,
        organization: item.organization,
        similarity: Math.min(matchScore, 99),
        matchReason: reasonParts.join('、') || '涉事地点及事件要素高度相近'
      });
    }
  }

  if (similarList.length > 0) {
    similarList.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
    const topMatch = similarList[0];
    return {
      originLabel: '疑似重复',
      originReason: `系统智能比对：比对发现与在审/历史报送《${topMatch.title}》（相似度 ${topMatch.similarity}%，匹配点: ${topMatch.matchReason}）事件要素重叠，预判为疑似重复。`,
      similarReports: similarList.slice(0, 3)
    };
  }

  return {
    originLabel: '疑似首发',
    originReason: '系统智能比对：自动比对不良信息库与在审历史库，未发现重合线索及同源链接，初判为首发报送。',
    similarReports: []
  };
};

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
  submitTime: string,
  existingReports: ReportItem[] = []
): ReportItem => {
  const preJudge = evaluateOriginPreJudgment(
    {
      title: input.title,
      region: input.region,
      occurAddress: input.occurAddress,
      matchUrl: input.matchUrl || (input as any).sourceUrl,
      summary: input.summary
    },
    existingReports
  );

  return {
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
    originLabel: preJudge.originLabel,
    originReason: preJudge.originReason,
    originSimilarReports: preJudge.similarReports,
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
  };
};

export const createSubmittedReport = (
  input: NewReportFormData,
  id = Date.now(),
  submitTime = getNowText(),
  existingReports: ReportItem[] = []
): ReportItem => {
  const report = createReportFromForm(input, id, submitTime, existingReports);

  return appendTimeline(report, [
    createSubmitNode(report, submitTime),
    createWaitingAuditNode()
  ]);
};

export const resubmitReport = (
  report: ReportItem,
  now = getNowText(),
  existingReports: ReportItem[] = []
): ReportItem => {
  // 重新提交时，重新计算过程预判标识（不落最终库）
  const preJudge = evaluateOriginPreJudgment(
    {
      title: report.title,
      region: report.region,
      occurAddress: report.occurAddress,
      matchUrl: report.matchUrl,
      summary: report.detailContent?.summary
    },
    existingReports.filter((r) => r.id !== report.id)
  );

  const resubmittedReport: ReportItem = {
    ...report,
    auditStatus: '待审核',
    submitTime: now,
    rejectReason: undefined,
    rejectDetail: undefined,
    score: '--',
    originLabel: preJudge.originLabel,
    originReason: preJudge.originReason,
    originSimilarReports: preJudge.similarReports
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

  // 采纳环节 / 终审通过时正式定标：首发 或 重复（人工不需要做任何操作，系统自动将预判转为正式标识并入库）
  let finalOriginLabel: OriginTypeLabel | undefined = report.originLabel;
  let finalOriginReason: string | undefined = report.originReason;

  if (finalAudit) {
    if (report.originLabel === '疑似首发' || report.originLabel === '识别中' || !report.originLabel) {
      finalOriginLabel = '首发';
      finalOriginReason = '经终审审核定标确认：首发报送，已正式归档入库。';
    } else if (report.originLabel === '疑似重复') {
      finalOriginLabel = '重复';
      finalOriginReason = '经终审审核定标确认：重复报送，已正式归档并关联同源线索。';
    } else if (report.originLabel === '首发' || report.originLabel === '重复') {
      finalOriginLabel = report.originLabel;
    }
  }

  const approveNode: TimelineNode = {
    title: '审核处理',
    operator: '王主任·市委宣传部舆情科',
    time: now,
    status: 'completed',
    ...(appliedScore !== undefined ? { score: appliedScore } : {}),
    note: finalAudit
      ? `终审通过，流程结束并已采纳（定标结论：${finalOriginLabel || '首发'}）。`
      : '审核通过，进入下一审核节点。'
  };

  return appendTimeline(
    {
      ...report,
      auditStatus: finalAudit ? '已采纳' : '已通过',
      score: appliedScore ?? '--',
      auditor: '王主任',
      auditTime: now,
      originLabel: finalOriginLabel,
      originReason: finalOriginReason
    },
    [
      approveNode,
      ...(finalAudit
        ? [
            {
              title: '结束',
              operator: '流程结束',
              status: 'completed' as const,
              note: `已采纳入库（定标：${finalOriginLabel || '首发'}报送）。`
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
): AuditRecordItem => {
  const finalOriginLabel: OriginTypeLabel =
    report.originLabel === '重复' || report.originLabel === '疑似重复' ? '重复' : '首发';
  const finalOriginReason =
    report.originReason ||
    (finalOriginLabel === '首发'
      ? '系统定标：经审核确认为首发报送'
      : '系统定标：经审核确认为重复报送');

  return {
    id: Date.now(),
    reportId: report.id,
    title: report.title,
    organization: report.organization,
    auditor: '王主任',
    auditResult: result,
    auditTime: now,
    originLabel: finalOriginLabel,
    originReason: finalOriginReason,
    ...(score !== undefined && isFinalAuditStage(report) ? { score } : {}),
    ...(reason ? { rejectReason: reason } : {})
  };
};

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
