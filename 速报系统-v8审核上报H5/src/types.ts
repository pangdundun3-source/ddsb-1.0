export type ReportStatus =
  | 'pending_audit'    // 待审核
  | 'auditing'         // 审核中
  | 'approved'         // 已通过
  | 'rejected'         // 被驳回
  | 'pending_transfer' // 待转办
  | 'transferred';     // 已转办

export type ReportType = 
  | '突发事件'
  | '舆情动态'
  | '政策解读'
  | '民生诉求'
  | '网络谣言';

export type ReportSource = 
  | '群众举报'
  | '社交媒体'
  | '网格巡查'
  | '部门转办'
  | '热线12345';

export type IdentificationTag =
  | 'identifying'      // 识别中
  | 'suspected_first'  // 疑似首发 (预判)
  | 'suspected_repeat' // 疑似重复 (预判)
  | 'official_first'   // 首发报送 (正式定标)
  | 'official_repeat'; // 重复报送 (正式定标)

export interface SpeedReport {
  id: string;
  title: string;
  status: ReportStatus;
  createTime: string;
  updateTime: string;
  author: string;
  authorDept: string;
  source: ReportSource;
  district: string;       // 例如：西坝区, 南坝区, 市大数据中心
  address: string;        // 发生地址，例如：西坝区阳光花园一期
  type: ReportType;
  gridNo: string;         // 网格编号，例如：XBA-03-018
  matchedLink?: string;   // 匹配链接
  summary: string;        // 内容摘要
  coreDemand: string;     // 核心诉求
  sentimentTrend: string; // 舆情态势
  disposalAdvice: string; // 处置建议
  rejectReason?: string;  // 驳回原因
  score?: number;         // 审核评分
  auditRemarks?: string;  // 审核意见
  transferredDept?: string; // 转办部门
  sameLocationCount?: number; // 同地址关联数
  isSameLocationGroup?: boolean; // 是否被标记为同地址
  identificationTag?: IdentificationTag; // 预判断/正式定标标识（草稿不算，不打标）
  identificationReason?: string;        // 判定比对依据/关联线索
  identificationTime?: string;          // 预判或正式定标时间
  templateId?: TemplateType;
  templateFieldValues?: Record<string, TemplateFieldValue>;
  tags: string[];
}

export type TemplateType =
  | '突发事件速报模板'
  | '民生诉求核查模板'
  | '网络谣言线索模板'
  | '专项风险线索模板';

export type TemplateFieldType =
  | 'number'
  | 'date'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'multi_select'
  | 'link'
  | 'attachment'
  | 'static_text';

export interface TemplateFieldOption {
  label: string;
  value: string;
}

export type TemplateFieldValue = string | string[] | number | null;

export interface TemplateExtraField {
  id: string;
  label: string;
  type: TemplateFieldType;
  required?: boolean;
  placeholder?: string;
  options?: TemplateFieldOption[];
  content?: string;
  accept?: string;
  multiple?: boolean;
  min?: number;
  max?: number;
  defaultValue?: TemplateFieldValue;
}

export interface ReportTemplate {
  id: TemplateType;
  name: string;
  defaultType: ReportType;
  defaultSource: ReportSource;
  titlePlaceholder: string;
  summaryPlaceholder: string;
  coreDemandPlaceholder: string;
  advicePlaceholder: string;
  extraFields: TemplateExtraField[];
}

export type NotificationType =
  | '平台公告'
  | '审核结果通知'
  | '待审核通知'
  | '审核中通知';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  time: string;
  isRead: boolean;
  readAt?: string;
  relatedReportId?: string;
  publisher?: string;
  priority?: 'normal' | 'urgent' | 'important';
}

export type UserRole = '上报员' | '审核员';

export interface UserProfile {
  id: string;
  name: string;
  account: string;
  role: UserRole;
  department: string;
  associatedDepts?: string[];
  subDepartment: string;
  gridCode: string;
  ticketNo: string;
  phone: string;
  avatarUrl: string;
  idCard?: string;
  bankCard?: string;
  bankName?: string;
}

export type AppTab = 'home' | 'message' | 'report' | 'audit' | 'profile';
