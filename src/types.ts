export type PageId =
  | 'home'
  | 'report-summary'
  | 'report-records'
  | 'report-detail'
  | 'report-audit'
  | 'audit-detail'
  | 'audit-records'
  | 'negative-info'
  | 'negative-detail'
  | 'statistics'
  | 'evaluation'
  | 'personal-info'
  | 'org-management'
  | 'role-permission'
  | 'business-config'
  | 'system-logs';

export interface UserProfileData {
  name: string;
  username: string;
  avatarText?: string;
  roles: string[];
  associatedOrgs: string[];
  phone: string;
  rawPhone?: string;
  realName: string;
  idCard: string;
  rawIdCard?: string;
  bankCard: string;
  rawBankCard?: string;
  bankName: string;
  verifiedStatus?: '已实名认证' | '未认证';
  updateTime: string;
}

export type AuditStatus = '待审核' | '已通过' | '已采纳' | '已驳回' | '被驳回' | '草稿' | '待转办' | '已转办';

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

export interface ReportItem {
  id: number;
  title: string;
  source: string; // e.g. 群众举报, 新闻网站, 社交媒体, 政府官网, 内部系统, 热线12345, 网格巡查
  region: string; // e.g. 西屯区, 西坝区, 全市, 北屯区, 南屯区, 南坝区
  infoType: string; // e.g. 突发事件, 舆情动态, 政策解读, 民生诉求, 网络谣言
  author: string; // e.g. 张三, 李四, 王五
  organization: string; // e.g. 台中市网信办, XX市委宣传部舆情科, 西坝区教育局
  submitTime: string; // e.g. 2026-08-13 14:30
  auditStatus: AuditStatus;
  score?: number | string; // e.g. 85, 95, '--'
  occurAddress?: string; // 发生地址
  rejectReason?: string; // 驳回原因
  rejectDetail?: string; // 详细驳回意见
  matchUrl?: string;
  detailContent?: {
    summary: string;
    coreDemands?: string;
    publicOpinionTrend?: string;
    recommendations?: string[] | string;
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
  role: '管理员' | '报送员' | '审核员' | '数据分析员' | '超级管理员';
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
