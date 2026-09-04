export type PageId =
  | 'home'
  | 'report-summary'
  | 'report-records'
  | 'report-detail'
  | 'report-audit'
  | 'audit-detail'
  | 'audit-records'
  | 'audit-record-detail'
  | 'negative-info'
  | 'negative-detail'
  | 'statistics'
  | 'evaluation'
  | 'org-management'
  | 'role-permission'
  | 'business-config'
  | 'system-logs';

export type AuditStatus = '待审核' | '审核中' | '已通过' | '已采纳' | '被驳回' | '已驳回' | '待转办' | '已转办' | '草稿';
export type AuditStage = '初审' | '复核' | '终审';

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'pdf' | 'link';
  url?: string;
  thumbnailUrl?: string;
}

export interface TimelineNode {
  title: string;
  operator: string;
  time?: string;
  status: 'completed' | 'current' | 'pending' | 'rejected';
  score?: number;
  note?: string;
}

export interface DraftReport {
  id: string;
  title: string;
  source: string;
  region: string;
  infoType: string;
  author: string;
  organization: string;
  summary: string;
  demands: string;
  recommendations: string;
  saveTime: string;
}

export interface NewReportFormData {
  title: string;
  source: string;
  region: string;
  occurAddress?: string;
  infoType: string;
  author: string;
  organization: string;
  summary: string;
  demands: string;
  recommendations: string;
  attachments?: Attachment[];
}

export interface ReportTemplateDef {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  iconName: 'zap' | 'file-text' | 'shield' | 'help' | 'book';
  description: string;
  recommendedFor: string;
  defaultSource: string;
  defaultRegion: string;
  defaultInfoType: string;
  defaultTitle: string;
  summaryTemplate: string;
  demandsTemplate: string;
  recommendationsTemplate: string;
}

export interface ReportTemplateInput {
  title?: string;
  source?: string;
  region?: string;
  infoType?: string;
  occurAddress?: string;
  summary?: string;
  demands?: string;
  recommendations?: string;
}

export interface ReportItem {
  id: number;
  title: string;
  source: string; // e.g. 群众举报, 新闻网站, 社交媒体, 政府官网, 内部系统, 新浪微博
  region: string; // e.g. 西屯区, 全市, 北屯区, 南屯区
  infoType: string; // e.g. 突发事件, 舆情动态, 政策解读, 民生诉求
  author: string; // e.g. 张三, 李四, 王五
  organization: string; // e.g. 台中市网信办, XX市委宣传部舆情科
  submitTime: string; // e.g. 2023-10-24 14:30
  auditStatus: AuditStatus;
  auditStage?: AuditStage;
  score?: number | string; // e.g. 85, 92, '--'
  templateId?: string;
  templateName?: string;
  occurAddress?: string; // 发生地址
  rejectReason?: string; // 驳回原因
  rejectDetail?: string; // 详细驳回意见
  matchUrl?: string;
  detailContent?: {
    summary: string;
    coreDemands: string;
    publicOpinionTrend: string;
    recommendations: string[];
  };
  attachments?: Attachment[];
  timeline?: TimelineNode[];
  transferOpinion?: string;
  transferTime?: string;
  auditor?: string;
  auditTime?: string;
}

export interface AuditRecordItem {
  id: number;
  title: string;
  organization: string;
  submitter?: string;
  submitTime?: string;
  auditor: string;
  auditorOrg?: string;
  auditResult: '已通过' | '被驳回';
  auditTime: string;
  reportId: number;
  score?: number;
  rejectReason?: string;
  rejectDetail?: string;
}

export interface OrgItem {
  id: number;
  code: string;
  name: string;
  parentOrg: string;
  contactPerson: string;
  phone: string;
  status: '启用' | '禁用';
}

export interface OrgUser {
  id: string;
  subOrg: string;
  account: string;
  realName: string;
  wechat: string;
  phone: string;
  role: '管理员' | '上报员' | '审核员' | '超级管理员';
  registerTime: string;
  status: '启用' | '禁用';
}

export interface OrgNode {
  id: string;
  name: string;
  children?: OrgNode[];
  level: string; // e.g. 市级党政机关
  version?: string;
  expireDate?: string;
  subOrgCount?: number;
  totalMembers?: number;
}

export interface TemplateItem {
  id: string;
  name: string;
  isSystemDefault?: boolean;
  status: '启用' | '停用';
  updateTime: string;
}

export interface LogItem {
  id: number;
  operator: string;
  logType?: '登录日志' | '操作日志';
  actionType: string;
  content?: string;
  details?: string;
  result?: '成功' | '失败';
  time?: string;
  timestamp?: string;
  organization?: string;
  ipAddress?: string;
}

export interface EvaluationItem {
  rank: number;
  name: string;
  totalReports: number;
  passedReports: number;
  passRate: string;
  participants: number;
  participationRate: string;
  totalScore: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
