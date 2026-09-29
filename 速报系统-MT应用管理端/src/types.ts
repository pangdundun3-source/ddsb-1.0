export type ActiveTab = 'home' | 'institutions' | 'config' | 'monitoring' | 'system';

export interface ExpiringInstitution {
  id: number;
  name: string;
  status: '试用' | '正式';
  region: string;
  category: string;
  industry: string;
  salesName: string;
  salesPhone: string;
  startDate?: string;
  endDate?: string;
  expireTime: string;
  daysRemaining: number;
  countdownText?: string;
  isExpired: boolean;
}

export type TemplateFieldType =
  | 'text'
  | 'textarea'
  | 'phone'
  | 'gender'
  | 'idcard'
  | 'bankcard'
  | 'role'
  | 'time'
  | 'number'
  | 'link'
  | 'attachment'
  | 'select'
  | string;

export interface TemplateFieldItem {
  id: string;
  name: string;
  type: TemplateFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface TemplateConfigItem {
  id: string;
  name: string;
  type: '报送' | '处置' | '研判' | '核查' | '激活' | string;
  status: boolean; // 启用 / 停用
  isSystem: boolean; // 是否系统默认
  isGlobal?: boolean; // 是否平台全局统一配置
  isCustom?: boolean; // 是否机构自定义
  description: string;
  updatedAt: string;
  fields: TemplateFieldItem[];
  // 保持原有字段向后兼容
  category?: string;
  themeColor?: string;
  isDefault?: boolean;
  coverStyle?: 'standard' | 'minimal' | 'banner' | 'card';
  headerText?: string;
  footerText?: string;
  watermarkText?: string;
  enableWatermark?: boolean;
}

export interface ScoringLevelItem {
  id: string;
  name: string;
  score: number;
  description: string;
}

export interface ScoringRuleGroup {
  id: string;
  name: string;
  scope: string;
  totalScore: number;
  levelCount: number;
  status: boolean; // 启用 / 停用
  isSystem: boolean; // 是否系统默认
  isGlobal?: boolean; // 是否平台全局统一配置
  isCustom?: boolean; // 是否机构自定义
  isCurrentActive?: boolean; // 是否当前生效
  description: string;
  updatedAt: string;
  levels: ScoringLevelItem[];
}

export interface ScoringDimension {
  id: string;
  name: string;
  maxScore: number;
  weight: number; // percentage e.g. 30
  description: string;
  deductionRules: string[];
  isGlobal?: boolean;
  isCustom?: boolean;
}

export interface DictItem {
  id: string;
  dictType: string;
  label: string;
  value: string;
  sortOrder: number;
  isSystem: boolean;
  isGlobal?: boolean; // 是否平台全局统一配置
  isCustom?: boolean; // 是否机构自定义
  status: boolean;
  description?: string;
  updatedAt?: string;
}

export interface AssessmentRuleItem {
  id: string;
  metricName: string;
  targetValue: number;
  unit: string;
  cycle: 'monthly' | 'quarterly' | 'yearly';
  weight: number;
  rewardPoints: number;
  penaltyPoints: number;
  isGlobal?: boolean; // 是否平台全局统一配置
  isCustom?: boolean; // 是否机构自定义
  status?: boolean; // 是否启用
}

export interface MetricFormulaConfig {
  readWeight: number;
  likeWeight: number;
  shareWeight: number;
  commentWeight: number;
  originalBonus: number;
  activeThreshold: number;
  statDimensions: string[];
  isGlobal?: boolean;
}

export interface ReviewLevelNode {
  id?: string;
  level: number;
  title: string;
  role: string;
  approvers: string[];
  timeoutHours: number;
  allowTransfer: boolean;
  allowDirectPublish: boolean;
  isGlobal?: boolean; // 是否平台全局统一配置
  isCustom?: boolean; // 是否机构自定义
  status?: boolean; // 是否启用
}

export interface LoginAuthConfig {
  allowPasswordLogin: boolean;
  allowSmsLogin: boolean;
  allowQyWechatQr: boolean;
  allowDingTalkSso: boolean;
  allowFeishuSso: boolean;
  requireMfa: boolean;
  passwordExpireDays: number;
  sessionTimeoutMinutes: number;
  ipWhitelistEnabled: boolean;
  ipWhitelist: string;
}

export interface ValueAddedServiceItem {
  id: string;
  name: string; // e.g. "批量审核", "截图取证", "指令流转", "系统公告"
  isPurchased: boolean; // 是否已开通
  isEnabled: boolean; // 是否已启用 (仅在已开通时可操作)
  tag: string; // "增值扩展功能"
  description: string;
  contactSalesTip?: string;
  icon?: string;
  isGlobal?: boolean;
  isCustom?: boolean;
}

export interface QrQuotaAddRecord {
  id: string;
  addAmount: number;
  previousLimit: number;
  newLimit: number;
  reason: string;
  operator: string;
  createdAt: string;
}

export interface QrCodeUsageConfig {
  initialQuota?: number; // 初始化配置名额 (如: 20)
  totalLimit: number; // 二维码当前总名额 (如: 50)
  usedCount: number; // 已用数量 (如: 18)
  historyRecords?: QrQuotaAddRecord[];
  allowSelfApply?: boolean;
  warningThreshold?: number;
}

// 微信公众号类型: 机构默认「点点速报」 vs 支持使用机构自有公众号
export type WechatMpMode = 'platform_default' | 'custom_official';

export interface WechatMpTemplateConfig {
  warningTemplateId: string; // 预警速报通知模板ID
  dispatchTemplateId: string; // 处置流转催办模板ID
  reviewCompleteTemplateId: string; // 审签办结通报模板ID
  dailyReportTemplateId: string; // 每日舆情晨报模板ID
}

export interface CustomWechatMpItem {
  id: string;
  mpName: string; // 公众号名称，如 "随州融媒发布"
  wechatAccount: string; // 微信号，如 "suizhou_mt_news"
  appId: string; // 开发者 AppID
  appSecret?: string; // 开发者 AppSecret
  originalId: string; // 微信原始ID，如 "gh_88392104bf71"
  authStatus: 'authorized' | 'unauthorized' | 'verifying' | 'abnormal';
  isBound: boolean; // 是否为当前生效换绑的自有公众号 (多个中只能启用1个)
  boundTime?: string; // 换绑启用时间
  createdAt: string; // 创建添加时间
  remark?: string;
}

export interface WechatMpConfig {
  mode: WechatMpMode; // 'platform_default' | 'custom_official'
  mpName: string; // 当前生效公众号名称，如 "随州融媒发布" 或 "点点速报"
  wechatAccount: string; // 微信号，如 "suizhou_mt_news"
  originalId: string; // 微信原始ID，如 "gh_a87293b610c4"
  appId: string; // 开发者 AppID
  appSecret: string; // 开发者 AppSecret
  serverUrl: string; // 服务器接入 URL
  token: string; // Token 令牌
  encodingAesKey: string; // 消息加解密密钥 EncodingAESKey
  encryptMode: 'secure' | 'compatible' | 'plain'; // 消息加解密模式
  authStatus: 'authorized' | 'unauthorized' | 'verifying' | 'abnormal'; // 接口授权与连通状态
  lastVerifyTime?: string;
  qrCodeUrl?: string; // 关注带参二维码图片
  templates: WechatMpTemplateConfig;
  jsSafeDomains?: string[]; // JS 接口安全域名
  ipWhitelist?: string; // 白名单 IP
  remark?: string;
  // 自有公众号列表管理与换绑状态控制
  customMps?: CustomWechatMpItem[];
  activeCustomMpId?: string; // 当前启用的自有公众号ID
  sourceMpName?: string; // 换绑来源公众号（如 平台默认：点点速报）
  lastBoundTime?: string; // 最近成功换绑时间
  isCustomBound?: boolean; // 是否已完成自有公众号换绑（为 true 方可开启人员迁移）
}

// 公众号人员迁移状态
export type MpMigrationStatus = 'completed' | 'pending_scan' | 'migrating' | 'failed' | 'not_started';

export interface MpPersonnelMigrationItem {
  id: string;
  avatar: string;
  name: string;
  nickname?: string;
  department: string;
  role: string;
  phone: string;
  sourceMp: string; // 源公众号, 如 "点点速报"
  sourceOpenId: string; // 原公众号 OpenID
  targetMp: string; // 目标公众号, 如 "随州融媒发布"
  targetOpenId?: string; // 目标公众号 OpenID
  unionId?: string; // 微信 UnionID (如打通同一开放平台)
  status: MpMigrationStatus;
  matchedVia?: 'union_id' | 'wechat_template_card' | 'sms_invite' | 'qr_scan' | 'manual';
  invitationSentTime?: string;
  migratedTime?: string;
  remindCount: number;
  inheritedRoles?: string[];
  inheritedDraftsCount: number;
  inheritedPoints: number;
  lastRemindTime?: string;
}

export interface MpMigrationTask {
  id: string;
  taskBatchNo: string;
  taskName: string;
  sourceMpName: string;
  targetMpName: string;
  totalPersonnel: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  channels: ('wechat_card' | 'sms' | 'qr_poster')[];
  status: 'in_progress' | 'completed' | 'paused';
  createdAt: string;
  completedAt?: string;
  operator: string;
  progressPercentage: number;
  remark?: string;
}

export interface MpMigrationConfig {
  currentTaskId?: string;
  enableAutoUnionIdSync: boolean; // 是否开启 UnionID 静默自动匹配
  enableSmsNotify: boolean; // 是否开启短信提醒
  enableWechatCardNotify: boolean; // 是否通过原公众号推送换绑卡片
  personnelList: MpPersonnelMigrationItem[];
  taskHistory: MpMigrationTask[];
}

export interface GlobalMpMigrationMethods {
  autoUnionId: {
    enabled: boolean;
    title: string;
    description: string;
    requireSameOpenPlatform: boolean;
  };
  wechatCard: {
    enabled: boolean;
    title: string;
    description: string;
    templateTitle: string;
    pushFrequencyLimit: number;
  };
  smsVerify: {
    enabled: boolean;
    title: string;
    description: string;
    codeExpireMinutes: number;
    smsSignature: string;
  };
  workspaceQr: {
    enabled: boolean;
    title: string;
    description: string;
    forceOnLogin: boolean;
  };
}

/** 全平台换绑生效门槛（对齐机构侧「确认换绑」与微信服务号真实约束） */
export interface GlobalMpRebindConditions {
  /** 仅允许认证微信服务号作为自有发稿通道（订阅号不可用模板/客服能力） */
  requireServiceAccount: boolean;
  /** 须完成公众号后台开发者配置与接口授权连通后才可换绑生效 */
  requireAuthorizedApi: boolean;
  /** 自有号须挂载至与平台相同的微信开放平台主体（UnionID 静默匹配前提） */
  requireSameOpenPlatform: boolean;
  /** 是否允许机构「换绑回平台默认号」 */
  allowRevertToPlatform: boolean;
  /** 同时仅允许 1 个自有号生效（与机构侧互斥规则一致，只读策略） */
  singleActiveCustomMp: boolean;
}

export interface GlobalMpControlConfig {
  // —— 阶段1：平台接入与授权 ——
  allowDefaultPlatformMp: boolean; // (a) 使用机构默认的“点点速报”
  allowCustomOfficialMp: boolean; // (b) 支持使用机构自有的公众号
  defaultPreferredMode: WechatMpMode; // 新建机构默认选用方式
  platformMpAppId?: string; // 平台统配「点点速报」母版 AppID
  platformOpenPlatformSubject?: string; // 微信开放平台主体名称

  // —— 阶段2：换绑生效条件 ——
  rebindConditions?: GlobalMpRebindConditions;

  // —— 阶段3：人员迁移通路 ——
  migrationMethods: GlobalMpMigrationMethods;
  dataInheritance: {
    inheritDrafts: boolean;
    inheritAuditLogs: boolean;
    inheritPoints: boolean;
    inheritRoles: boolean;
  };
  migrationGracePeriodDays: number;
  maxDailyRemindCount: number;
  updatedAt?: string;
  updatedBy?: string;
}

export interface OtherBusinessConfig {
  qrUsage: QrCodeUsageConfig;
  wechatMp?: WechatMpConfig;
  migration?: MpMigrationConfig;
  globalMpControl?: GlobalMpControlConfig;
}

export interface InstitutionBusinessRules {
  // 1. 模版配置 (Template Configuration)
  templates: TemplateConfigItem[];
  selectedTemplateId: string;
  globalWatermarkText: string;
  defaultHeaderLogoUrl?: string;

  // 2. 审核打分规则 (Review Scoring Rules)
  passScore: number;
  excellentScore: number;
  scoringDimensions: ScoringDimension[];
  zeroToleranceViolation: boolean;
  scoringRuleGroups?: ScoringRuleGroup[];

  // 3. 数据字典管理 (Data Dictionary Management)
  dictItems: DictItem[];

  // 4. 考核规则 (Assessment Rules)
  assessmentCycle: 'monthly' | 'quarterly' | 'yearly';
  assessmentRules: AssessmentRuleItem[];
  enablePenalty: boolean;

  // 5. 统计指标 (Statistical Metrics)
  metricsFormula: MetricFormulaConfig;

  // 6. 审核流程配置 (Review Process Configuration)
  workflowType: 'one_level' | 'two_level' | 'three_level' | 'custom';
  reviewNodes: ReviewLevelNode[];
  enableFastTrack: boolean;
  autoApproveKeywords: string[];

  // 7. 增值业务 (Value Added Services)
  valueAddedServices?: ValueAddedServiceItem[];

  // 8. 其他配置 (Other Business Config)
  otherConfig?: OtherBusinessConfig;

  // 登录验证方式 (Login Verification Method - 保留兼容)
  loginAuth?: LoginAuthConfig;

  // Legacy/Compatibility fields
  monitoringFrequency?: 'realtime' | '5min' | '15min' | '30min' | '60min';
  crawlChannels?: string[];
  focusKeywords?: string[];
  excludedKeywords?: string[];
  historyRetentionDays?: number;
  alertLevelThreshold?: 'level1' | 'level2' | 'level3' | 'level4';
  alertChannels?: string[];
}

export interface Institution {
  id: number;
  name: string;
  status: '试用' | '正式';
  location: string; // e.g. "甘肃", "陕西/西安"
  category: string; // e.g. "一类", "二类", "三类"
  industry: string; // e.g. "电力", "网信部门", "职校高校", "网安部门"
  salesName: string;
  salesPhone: string;
  enabled: boolean; // toggle switch state
  startDate: string;
  endDate: string;
  createdAt?: string;
  daysRemaining: number;
  unitName?: string;
  businessRules?: InstitutionBusinessRules;
}

export interface SystemConfig {
  siteName: string;
  autoNoticeDays: number;
  maxTrialDays: number;
  enableApiGateway: boolean;
  enableSmsAlerts: boolean;
  systemMaintenanceMode: boolean;
  dataRetentionMonths: number;
}

export interface AuditLog {
  id: string;
  operator: string;
  department: string;
  action: string;
  target: string;
  ip: string;
  time: string;
  status: '成功' | '失败';
}

export type SystemSubModule = 'accounts' | 'logs';

export type SystemRoleType =
  | 'super_admin'
  | 'ops_admin'
  | 'audit_admin'
  | 'config_admin'
  | 'business_lead'
  | 'sales_rep';

export interface SystemAccountUser {
  id: string;
  name: string;
  username: string;
  wechat?: string;
  jobNumber?: string;
  avatar?: string;
  gender: 'male' | 'female';
  phone: string;
  email: string;
  dept: string;
  roleId: SystemRoleType;
  roleName: string;
  roleBadgeColor: string;
  dataScope: 'all' | 'formal_only' | 'regional' | 'custom';
  dataScopeDesc: string;
  status: 'active' | 'disabled' | 'locked';
  mfaEnabled: boolean;
  ipWhitelist?: string;
  lastLoginTime: string;
  lastLoginIp: string;
  lastLoginLocation: string;
  createdAt: string;
  permissions?: string[];
  remarks?: string;
}

export type SystemLogCategory = 'login' | 'audit' | 'security' | 'data_change' | 'system_runtime';

export type DetailTab =
  | 'basic'
  | 'business_rules'
  | 'templates'
  | 'scoring'
  | 'dictionary'
  | 'workflow'
  | 'value_added'
  | 'qr_code'
  | 'other';

export interface SystemLogItem {
  id: string;
  category: SystemLogCategory;
  operator: string;
  operatorUsername?: string;
  operatorJobNo?: string;
  department: string;
  role: string;
  action: string;
  module: string;
  target: string;
  targetId?: string;
  ip: string;
  location: string;
  browser?: string;
  os?: string;
  time: string;
  status: '成功' | '失败' | '警告' | '拦截';
  durationMs?: number;
  httpMethod?: string;
  apiUrl?: string;
  requestPayload?: Record<string, any> | string;
  responseSummary?: string;
  beforeChange?: Record<string, any> | string;
  afterChange?: Record<string, any> | string;
  errorCode?: string;
  errorMessage?: string;
}

