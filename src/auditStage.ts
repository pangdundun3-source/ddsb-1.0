import { AuditStage, ReportItem } from './types';

const getStageText = (report: Pick<ReportItem, 'auditStage' | 'auditStatus' | 'timeline'>) => {
  if (report.auditStage) return report.auditStage;

  const currentNode = [...(report.timeline || [])]
    .reverse()
    .find((node) => node.status === 'current');
  return `${currentNode?.title || ''} ${currentNode?.operator || ''} ${currentNode?.note || ''}`;
};

export const getCurrentAuditStage = (
  report: Pick<ReportItem, 'auditStage' | 'auditStatus' | 'timeline'>
): AuditStage => {
  const stageText = getStageText(report);
  if (stageText.includes('终审')) return '终审';
  if (stageText.includes('复核') || stageText.includes('二级')) return '复核';
  if (report.auditStatus === '审核中') return '复核';
  return '初审';
};

export const isFinalAuditStage = (
  report: Pick<ReportItem, 'auditStage' | 'auditStatus' | 'timeline'>
) => getCurrentAuditStage(report) === '终审';

/**
 * 评分只随“评审流程最后一个环节(终审完成)”出现：
 * - 优先取时间线中最后一个已完成且带分的审核节点分数；
 * - 若速报已终审采纳/进入转办但时间线未细分，则取速报自身 score；
 * - 未走到最后环节(或没有终审评分)时返回 undefined，调用方不展示评分。
 */
export const getFinalAuditScore = (
  report: Pick<ReportItem, 'auditStatus' | 'score' | 'timeline'>
): number | string | undefined => {
  const completedScoredNodes = (report.timeline || []).filter(
    (node) => node.status === 'completed' && node.score !== undefined && node.score !== null
  );
  if (completedScoredNodes.length > 0) {
    return completedScoredNodes[completedScoredNodes.length - 1].score;
  }

  const reachedFinalAdoption =
    report.auditStatus === '已采纳' ||
    report.auditStatus === '待转办' ||
    report.auditStatus === '已转办';
  if (!reachedFinalAdoption) return undefined;

  const reportScore = report.score;
  return reportScore !== undefined && reportScore !== null && reportScore !== '--'
    ? reportScore
    : undefined;
};
