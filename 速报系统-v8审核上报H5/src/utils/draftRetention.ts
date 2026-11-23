import { SpeedReport } from '../types';

/** 草稿箱默认保留时长：24 小时（按 updateTime，无则 createTime） */
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

const parseReportTime = (value: string) => {
  const normalized = value.trim().replace(' ', 'T');
  const withSeconds = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)
    ? `${normalized}:00`
    : normalized;
  const ts = Date.parse(withSeconds);
  return Number.isNaN(ts) ? NaN : ts;
};

export const getDraftReferenceTime = (report: Pick<SpeedReport, 'updateTime' | 'createTime'>) =>
  parseReportTime(report.updateTime || report.createTime);

export const isDraftExpired = (report: SpeedReport, now = Date.now()) => {
  if (report.status !== 'draft') return false;
  const ts = getDraftReferenceTime(report);
  if (Number.isNaN(ts)) return true;
  return now - ts > DRAFT_TTL_MS;
};

export const purgeExpiredDrafts = (reports: SpeedReport[], now = Date.now()) =>
  reports.filter((report) => !isDraftExpired(report, now));
