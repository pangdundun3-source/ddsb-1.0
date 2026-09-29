import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TemplateConfigBoard } from './TemplateConfigBoard';
import {
  Search,
  Plus,
  PlusCircle,
  Edit3,
  Trash2,
  Eye,
  Lock,
  Check,
  Type,
  Hash,
  Calendar,
  Paperclip,
  Link as LinkIcon,
  ListFilter,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Info,
  Layers,
  FileText,
  Zap,
  Award,
  Building2,
  GitBranch,
  UserCheck,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  CheckSquare,
  Square,
  GripVertical,
  X,
  ArrowRight,
  Settings2,
  ChevronDown
} from 'lucide-react';

export type FieldType = 'text' | 'number' | 'date' | 'file' | 'link' | 'select' | 'phone' | 'gender' | 'id_card' | 'bank_card' | 'email' | 'address' | 'identity';

export interface TemplateField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface ScoreLevel {
  id: string;
  levelName: string;
  score: number;
  description?: string;
}

export interface AuditNode {
  id: string;
  nodeName: string;
  approverRole: string;
  assigneeSource?: 'role' | 'user' | 'org_owner' | 'direct_admin';
  assigneeUserName?: string;
  rejectStrategy?: 'return_submitter' | 'return_previous' | 'cancel_report';
  timeLimitMinutes?: number;
  dynamicMechanism?: string;
  missingRule?: 'skip' | 'transfer_admin' | 'terminate_error' | 'block';
  isFinalScoreNode?: boolean;
  timeoutReminderEnabled?: boolean;
}

export interface OrgScopeSetting {
  orgId: string;
  orgName: string;
  enabled: boolean;
}

type AuditTemplateApplyMode = 'single_template' | 'all_report_templates';
type AuditOwnerMissingStrategy = 'block_submit' | 'skip_to_next' | 'fallback_role' | 'fallback_user';

export interface EvaluationIndicator {
  id: string;
  name: string;
  calcType: '基础分' | '通过率/采纳率' | '时效响应' | '参与率' | '加分项' | '扣分项';
  basePoints: number;
  weightPercent: number;
  unitRule: string;
}

type EvaluationTarget = 'person' | 'org' | 'category';
type EvaluationPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';
type EvaluationScoreMode = 'ratio' | 'fixed';

interface EvaluationScoreSegment {
  id: string;
  label: string;
  minValue?: number;
  maxValue?: number;
  scoreRatio: number;
  fixedScore: number;
}

interface EvaluationMetricRule {
  id: string;
  metricId: string;
  metricName: string;
  metricUnit: string;
  metricFormula: string;
  enabled: boolean;
  weight: number;
  scoreMode: EvaluationScoreMode;
  scoreType: 'achievement' | 'lower_better';
  segments: EvaluationScoreSegment[];
}

interface EvaluationGrade {
  id: string;
  name: string;
  minScore: number;
  maxScore: number;
}

export type MetricDisplayPage = 'home_kpi' | 'stats_kpi' | 'trend_chart' | 'ranking_panel' | 'distribution_panel';
export type MetricCalcType = 'count' | 'rate' | 'average' | 'trend' | 'ranking' | 'distribution';
export type MetricCategory = 'scale' | 'quality' | 'efficiency' | 'closure' | 'coverage' | 'trend' | 'distribution' | 'ranking';

export interface MetricDisplayBinding {
  page: MetricDisplayPage;
  pageName: string;
  slotName: string;
  metricId: string;
  metricName: string;
}

export interface MetricRule {
  id: string;
  name: string;
  displayName: string;
  metricCategory?: MetricCategory;
  calcType: MetricCalcType;
  unit: string;
  formulaText?: string;
  supportsDerived?: boolean;
  period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  pages: MetricDisplayPage[];
  status: '启用' | '停用';
  isDefault: boolean;
  updateTime: string;
  description: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

interface ConfigModuleItem {
  id: string;
  name: string;
  templateType?: '报送' | '激活';
  displayName?: string;
  metricCategory?: MetricCategory;
  calcType?: MetricCalcType;
  unit?: string;
  formulaText?: string;
  supportsDerived?: boolean;
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  pages?: MetricDisplayPage[];
  isDefault?: boolean;
  status: '启用' | '停用';
  activatedStatus?: '已开通' | '未开通';
  updateTime: string;
  description?: string;
  fields?: TemplateField[];
  totalScore?: number;
  levelCount?: number;
  scoreLevels?: ScoreLevel[];
  relatedTemplateId?: string;
  relatedTemplateName?: string;
  templateApplyMode?: AuditTemplateApplyMode;
  flowDepth?: number;
  flowMode?: 'adaptive' | 'max_n' | 'direct';
  auditNodes?: AuditNode[];
  orgApplyMode?: 'all_orgs' | 'specific_orgs';
  orgSettings?: OrgScopeSetting[];
  ownerMissingStrategy?: AuditOwnerMissingStrategy;
  ownerMissingFallbackRole?: string;
  ownerMissingFallbackUserName?: string;
  evalDimension?: 'category' | 'org' | 'person' | 'comprehensive';
  evalTarget?: EvaluationTarget;
  targetDay?: number;
  targetWeek?: number;
  targetMonth?: number;
  targetQuarter?: number;
  targetYear?: number;
  customTargetPeriods?: Array<'week' | 'month' | 'quarter' | 'year'>;
  targetValue?: number;
  coverageTarget?: number;
  quantityWeight?: number;
  qualityWeight?: number;
  coverageWeight?: number;
  enabledPeriods?: EvaluationPeriod[];
  fixedFormula?: string;
  parameterDescription?: string;
  evalTotalScore?: number;
  evalMetricRules?: EvaluationMetricRule[];
  evalGrades?: EvaluationGrade[];
  indicators?: EvaluationIndicator[];
  dictCategory?: string;
  dictCategoryName?: string;
  dictCode?: string;
  sortOrder?: number;
  personnelRoleGroup?: '上报员' | '审核员';
  loginType?: 'password' | 'sms' | 'wechat';
  loginTypeName?: string;
  configStatus?: '已配置' | '待配置';
  isFallback?: boolean;
}

const getFieldTypeMeta = (type: FieldType) => {
  switch (type) {
    case 'text':
      return { label: '文本字段', icon: Type, color: 'text-blue-600 bg-blue-50 border-blue-200' };
    case 'number':
      return { label: '数据字段', icon: Hash, color: 'text-purple-600 bg-purple-50 border-purple-200' };
    case 'date':
      return { label: '时间字段', icon: Calendar, color: 'text-amber-600 bg-amber-50 border-amber-200' };
    case 'file':
      return { label: '附件字段', icon: Paperclip, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    case 'link':
      return { label: '链接字段', icon: LinkIcon, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
    case 'select':
      return { label: '选择字段', icon: ListFilter, color: 'text-rose-600 bg-rose-50 border-rose-200' };
    case 'phone':
      return { label: '手机号', icon: Type, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    case 'gender':
      return { label: '性别', icon: UserCheck, color: 'text-pink-600 bg-pink-50 border-pink-200' };
    case 'id_card':
      return { label: '身份证号', icon: Hash, color: 'text-orange-600 bg-orange-50 border-orange-200' };
    case 'bank_card':
      return { label: '银行卡号', icon: Hash, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' };
    case 'email':
      return { label: '邮箱', icon: LinkIcon, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
    case 'address':
      return { label: '地址', icon: Type, color: 'text-slate-600 bg-slate-50 border-slate-200' };
    case 'identity':
      return { label: '身份选择', icon: UserCheck, color: 'text-blue-600 bg-blue-50 border-blue-200' };
    default:
      return { label: '文本字段', icon: Type, color: 'text-gray-600 bg-gray-50 border-gray-200' };
  }
};

const reportFieldTypeOptions: FieldType[] = ['text', 'number', 'date', 'file', 'link', 'select'];
const activationFieldTypeOptions: FieldType[] = ['text', 'identity', 'phone', 'gender', 'id_card', 'bank_card', 'email', 'address', 'date', 'file', 'select'];
const systemRoleOptions = ['超级管理员', '机构管理员', '上报员', '审核员', '运营管理员', '临时审核员'];

const getDefaultFieldPlaceholder = (type: FieldType) => {
  switch (type) {
    case 'phone':
      return '请输入 11 位手机号码';
    case 'gender':
      return '请选择性别';
    case 'id_card':
      return '请输入身份证号码';
    case 'bank_card':
      return '请输入银行卡号';
    case 'email':
      return '请输入邮箱地址';
    case 'address':
      return '请输入联系地址';
    case 'identity':
      return '请选择身份角色';
    case 'date':
      return '请选择日期';
    case 'file':
      return '请上传相关证明材料';
    case 'link':
      return '请输入链接地址';
    case 'select':
      return '请选择选项';
    default:
      return '请输入相关信息';
  }
};

const standardReportFields: TemplateField[] = [
  { id: 'p_1', name: '报送主题/事件标题', type: 'text', required: true, placeholder: '请输入具体报送的主题或事件全称' },
  { id: 'p_2', name: '事件发生/发现时间', type: 'date', required: true, placeholder: '请选择事件发生或传播时间' },
  { id: 'p_3', name: '涉事热度/影响数据', type: 'number', required: false, placeholder: '请输入传播量/阅读量等数据' },
  { id: 'p_4', name: '来源网址/文章出处', type: 'link', required: false, placeholder: 'https://...' },
  { id: 'p_5', name: '现场图片/证据附件', type: 'file', required: true, placeholder: '支持图片、视频、PDF证明文档' },
  { id: 'p_6', name: '事件分类', type: 'select', required: true, placeholder: '请选择事件分类', options: ['突发敏感事件', '网络舆情动态', '民生诉求建议'] }
];

const standardActivationFields: TemplateField[] = [
  { id: 'ap_1', name: '真实姓名', type: 'text', required: true, placeholder: '请输入真实姓名' },
  { id: 'ap_2', name: '身份角色', type: 'identity', required: true, placeholder: '请选择身份角色', options: [...systemRoleOptions] },
  { id: 'ap_3', name: '手机号码', type: 'phone', required: true, placeholder: '请输入 11 位手机号码' },
  { id: 'ap_4', name: '性别', type: 'gender', required: false, placeholder: '请选择性别' },
  { id: 'ap_5', name: '身份证号', type: 'id_card', required: true, placeholder: '请输入身份证号码' },
  { id: 'ap_6', name: '银行卡号', type: 'bank_card', required: false, placeholder: '请输入银行卡号' },
  { id: 'ap_7', name: '身份证照片/证明附件', type: 'file', required: true, placeholder: '请上传身份证照片或授权证明材料' }
];

const buildTargetsFromDay = (day: number) => ({
  targetDay: day,
  targetWeek: day * 7,
  targetMonth: day * 30,
  targetQuarter: day * 90,
  targetYear: day * 365
});

const defaultAchievementSegments: EvaluationScoreSegment[] = [
  { id: 'seg_full', label: '达标及以上', minValue: 100, scoreRatio: 100, fixedScore: 0 },
  { id: 'seg_good', label: '基本达标', minValue: 80, maxValue: 99, scoreRatio: 80, fixedScore: 0 },
  { id: 'seg_pass', label: '部分达标', minValue: 60, maxValue: 79, scoreRatio: 60, fixedScore: 0 },
  { id: 'seg_zero', label: '未达标', maxValue: 59, scoreRatio: 0, fixedScore: 0 }
];

const defaultEfficiencySegments: EvaluationScoreSegment[] = [
  { id: 'seg_fast', label: '响应优秀', maxValue: 15, scoreRatio: 100, fixedScore: 0 },
  { id: 'seg_normal', label: '响应良好', minValue: 16, maxValue: 30, scoreRatio: 80, fixedScore: 0 },
  { id: 'seg_slow', label: '响应一般', minValue: 31, maxValue: 60, scoreRatio: 60, fixedScore: 0 },
  { id: 'seg_timeout', label: '响应超时', minValue: 61, scoreRatio: 0, fixedScore: 0 }
];

const cloneSegments = (segments: EvaluationScoreSegment[]) => segments.map(segment => ({ ...segment }));

const defaultEvaluationGrades: EvaluationGrade[] = [
  { id: 'grade_1', name: '优秀', minScore: 90, maxScore: 100 },
  { id: 'grade_2', name: '良好', minScore: 80, maxScore: 89 },
  { id: 'grade_3', name: '合格', minScore: 60, maxScore: 79 },
  { id: 'grade_4', name: '不合格', minScore: 0, maxScore: 59 }
];

const defaultEvaluationMetricLibrary: Array<{
  metricId: string;
  metricName: string;
  metricUnit: string;
  metricFormula: string;
  scoreType: EvaluationMetricRule['scoreType'];
}> = [
  { metricId: '501', metricName: '上报总数', metricUnit: '件', metricFormula: '统计周期内已提交的速报记录总数', scoreType: 'achievement' },
  { metricId: '531', metricName: '采纳通过数', metricUnit: '件', metricFormula: '统计周期内审核通过且被采纳的报送记录数', scoreType: 'achievement' },
  { metricId: '505', metricName: '审核通过率', metricUnit: '%', metricFormula: '审核通过数 ÷ 审核总数 × 100%', scoreType: 'achievement' },
  { metricId: '510', metricName: '平均响应时效', metricUnit: '分钟', metricFormula: '审核总耗时 ÷ 审核件数', scoreType: 'lower_better' },
  { metricId: '521', metricName: '全员参与率', metricUnit: '%', metricFormula: '活跃人员数 ÷ 在册人员总数 × 100%', scoreType: 'achievement' }
];

const getDefaultEvaluationMetricRules = (target: EvaluationTarget): EvaluationMetricRule[] => {
  const weights: Record<EvaluationTarget, Record<string, number>> = {
    person: { '501': 35, '531': 30, '505': 25, '510': 10 },
    org: { '501': 30, '531': 25, '505': 20, '510': 10, '521': 15 },
    category: { '501': 30, '531': 25, '505': 20, '510': 10, '521': 15 }
  };

  return defaultEvaluationMetricLibrary
    .filter(metric => target !== 'person' || metric.metricId !== '521')
    .map(metric => ({
      id: `erm_${target}_${metric.metricId}`,
      metricId: metric.metricId,
      metricName: metric.metricName,
      metricUnit: metric.metricUnit,
      metricFormula: metric.metricFormula,
      enabled: true,
      weight: weights[target][metric.metricId] || 0,
      scoreMode: 'ratio',
      scoreType: metric.scoreType,
      segments: cloneSegments(metric.scoreType === 'lower_better' ? defaultEfficiencySegments : defaultAchievementSegments)
    }));
};

function loadPersistedDataStore(
  storageKey?: string,
  fallbackStorageKey?: string,
  defaults?: Record<string, ConfigModuleItem[]>,
  forceValueAddedActivated = false
): Record<string, ConfigModuleItem[]> {
  const readKey = (key?: string): Record<string, ConfigModuleItem[]> | null => {
    if (!key) return null;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as Record<string, ConfigModuleItem[]>) : null;
    } catch {
      return null;
    }
  };
  const saved = readKey(storageKey) || readKey(fallbackStorageKey);
  if (!saved) return defaults || {};
  // 逐模块浅合并：历史数据缺少某模块时使用默认数据兜底
  const merged: Record<string, ConfigModuleItem[]> = {
    ...(defaults || {}),
    ...saved,
  };
  // 增值业务：确保新增的默认增值业务项能够并入已持久化的数据，并同步最新系统文案
  if (Array.isArray(defaults?.value_added)) {
    const existingList = Array.isArray(saved?.value_added) ? [...saved.value_added] : [...defaults.value_added];
    const existingNames = new Set(existingList.map(i => i.name));
    for (const defaultItem of defaults.value_added) {
      if (!existingNames.has(defaultItem.name)) {
        existingList.push(defaultItem);
      } else if (defaultItem.name === '报送首发重复识别') {
        const targetIndex = existingList.findIndex(i => i.name === '报送首发重复识别');
        if (targetIndex !== -1) {
          existingList[targetIndex] = {
            ...existingList[targetIndex],
            description: defaultItem.description,
          };
        }
      }
    }
    merged.value_added = existingList;
  }
  // 增值业务状态兜底：未记录开通状态的一律视为“未开通”，且未开通不可处于启用态
  if (Array.isArray(merged.value_added)) {
    merged.value_added = merged.value_added.map((item) => {
      if (forceValueAddedActivated) {
        // 全开放启禁模式：启禁开关直接驱动开通状态（启用=已开通 / 停用=未开通）
        return {
          ...item,
          activatedStatus: item.status === '启用' ? '已开通' : '未开通',
        };
      }
      const activated = item.activatedStatus === '已开通';
      return {
        ...item,
        activatedStatus: activated ? '已开通' : '未开通',
        status: activated ? item.status : '停用',
      };
    });
  }
  return merged;
}

export type BusinessModuleId =
  | 'report_template'
  | 'audit_score'
  | 'data_dict'
  | 'evaluation_rule'
  | 'stats_metric'
  | 'audit_flow'
  | 'login_method'
  | 'value_added';

interface BusinessConfigProps {
  initialModule?: string;
  /** 嵌入模式：隐藏页面标题与左侧模块导航，仅渲染当前模块的右侧内容面板 */
  embedded?: boolean;
  /** 本地持久化键；写入该键以保存本作用域（全局/机构）的模块数据 */
  storageKey?: string;
  /** 回退持久化键；当本作用域无保存数据时，从此键读取（用于机构继承全局母版） */
  fallbackStorageKey?: string;
  /** 增值业务全部开放启禁：隐藏“未开通(不可启禁)”及联系销售提示，所有服务可直接启禁，且启禁状态与开通状态联动 */
  valueAddedAllOperable?: boolean;
  /** 隐藏增值业务卡片上的“已开通/未开通”状态徽标（全局配置维度不需要该状态展示） */
  hideValueAddedStatusBadge?: boolean;
  /** 是否为平台全局配置作用域 */
  isGlobalScope?: boolean;
  /** 模块切换回调（供外部父级导航联动） */
  onModuleChange?: (moduleId: string) => void;
}

export const V8BusinessConfigBoard: React.FC<BusinessConfigProps> = ({
  initialModule,
  embedded = false,
  storageKey,
  fallbackStorageKey,
  valueAddedAllOperable = false,
  hideValueAddedStatusBadge = false,
  isGlobalScope: propIsGlobalScope,
  onModuleChange,
}) => {
  const isGlobalScope = propIsGlobalScope ?? hideValueAddedStatusBadge;
  // Currently active configuration module in the left column
  const [activeModule, setActiveModule] = useState<string>(() => {
    if (initialModule && initialModule !== 'evaluation_rule' && initialModule !== 'stats_metric') {
      return initialModule;
    }
    return 'report_template';
  });

  React.useEffect(() => {
    if (initialModule) {
      if (initialModule === 'evaluation_rule' || initialModule === 'stats_metric') {
        setActiveModule('report_template');
      } else {
        setActiveModule(initialModule);
      }
    }
  }, [initialModule]);

  // Module items list definition (Renamed reject_reason to data_dict: 数据字典管理)
  const moduleList = [
    { id: 'report_template', label: '模版配置' },
    { id: 'audit_flow', label: '审核流程配置' },
    { id: 'audit_score', label: '审核打分规则' },
    { id: 'data_dict', label: '数据字典管理' },
    { id: 'login_method', label: '登录验证方式' },
    { id: 'value_added', label: '增值业务配置' }
  ];

  // Data state for each configuration module
  const [dataStore, setDataStore] = useState<Record<string, ConfigModuleItem[]>>(() =>
    loadPersistedDataStore(storageKey, fallbackStorageKey, {
      report_template: [
      {
        id: '1',
        name: '标准图文报送模板',
        templateType: '报送',
        isDefault: true,
        status: '启用',
        updateTime: '2023-10-24 10:00:00',
        description: '适用于日常标准文字、图片及证明材料的合规上报',
        fields: standardReportFields
      },
      {
        id: '2',
        name: '登录验证激活模板',
        templateType: '激活',
        isDefault: true,
        status: '启用',
        updateTime: '2023-10-25 11:20:00',
        description: '触发高等级舆情时自动激活全员推屏通知及大屏研判流程',
        fields: standardActivationFields
      },
      {
        id: '3',
        name: '突发事件快速上报',
        templateType: '报送',
        isDefault: false,
        status: '启用',
        updateTime: '2023-11-02 14:30:22',
        description: '精简版快速通道，优先确保事件核心要素第一时间到达',
        fields: [
          { id: 'f301', name: '突发事件简述', type: 'text', required: true, placeholder: '请一句话描述突发情况' },
          { id: 'f302', name: '发生精准时间', type: 'date', required: true, placeholder: '时间选择' },
          { id: 'f303', name: '现场第一手图片凭证', type: 'file', required: true, placeholder: '即时拍照或图片凭证' },
          { id: 'f304', name: '紧急线索网址链接', type: 'link', required: false, placeholder: '来源链接' }
        ]
      },
      {
        id: '4',
        name: '登录验证激活模板-01',
        templateType: '激活',
        isDefault: false,
        status: '启用',
        updateTime: '2023-11-01 09:40:15',
        description: '大容量音视频流媒体智能分流与自动化激活规则',
        fields: [
          { id: 'f401', name: '视频音轨关键帧摘要', type: 'text', required: true, placeholder: '请输入关键帧说明' },
          { id: 'f402', name: '流媒体链接', type: 'link', required: true, placeholder: 'https://...' }
        ]
      }
    ],
    audit_score: [
      {
        id: '201',
        name: '标准五级百分制打分规则组',
        isDefault: true,
        status: '启用',
        updateTime: '2023-10-20 08:30:00',
        description: '适用于标准报送事件的五级梯次打分，规则总分为 100 分',
        totalScore: 100,
        levelCount: 5,
        relatedTemplateId: '1',
        relatedTemplateName: '标准图文报送模板',
        scoreLevels: [
          { id: 'sl_1', levelName: '一等（特优）', score: 100, description: '省级以上领导批示或极高价值采纳' },
          { id: 'sl_2', levelName: '二等（优秀）', score: 90, description: '市级领导批示或形成深度专报' },
          { id: 'sl_3', levelName: '三等（良好）', score: 80, description: '研判要素齐全且上报迅速及时' },
          { id: 'sl_4', levelName: '四等（合格）', score: 70, description: '基础提报符合规范与事实' },
          { id: 'sl_5', levelName: '五等（基本）', score: 60, description: '提供线索参考价值' }
        ]
      },
      {
        id: '202',
        name: '精简三级考核打分规则组',
        isDefault: false,
        status: '停用',
        updateTime: '2023-10-28 14:22:00',
        description: '适用于突发事件快速处置阶段的三级简易评定',
        totalScore: 10,
        levelCount: 3,
        relatedTemplateId: '3',
        relatedTemplateName: '突发事件快速上报',
        scoreLevels: [
          { id: 'sl_201', levelName: '一级（优秀）', score: 10, description: '快速高效且要素极其精准' },
          { id: 'sl_202', levelName: '二级（良好）', score: 8, description: '基本要素完整无缺失' },
          { id: 'sl_203', levelName: '三级（合格）', score: 6, description: '仅提供初始简报线索' }
        ]
      },
      {
        id: '203',
        name: '四级专项引导打分组',
        isDefault: false,
        status: '停用',
        updateTime: '2023-11-05 16:10:00',
        description: '专项舆情引导行动评分规则，设4个互斥评分等级，规则总分为50分',
        totalScore: 50,
        levelCount: 4,
        relatedTemplateId: '1',
        relatedTemplateName: '标准图文报送模板',
        scoreLevels: [
          { id: 'sl_301', levelName: 'A级（特级）', score: 50, description: '关键引导节点起到决定性效果' },
          { id: 'sl_302', levelName: 'B级（高级）', score: 40, description: '有效正向引导并扭转态势' },
          { id: 'sl_303', levelName: 'C级（中级）', score: 30, description: '按指令要求完成跟进' },
          { id: 'sl_304', levelName: 'D级（初级）', score: 20, description: '参与协同排查' }
        ]
      }
    ],
    data_dict: [
      { id: '301', name: '信息真实性核查不通过', dictCategory: 'reject_reason', dictCategoryName: '拒绝理由', dictCode: 'REJECT_001', sortOrder: 1, isDefault: true, status: '启用', updateTime: '2023-10-15 09:00:00', description: '缺乏实质性事实依据或为虚假流言' },
      { id: '302', name: '内容重复提交', dictCategory: 'reject_reason', dictCategoryName: '拒绝理由', dictCode: 'REJECT_002', sortOrder: 2, isDefault: true, status: '启用', updateTime: '2023-10-15 09:00:00', description: '同一事件或舆情线索已由其他部门先行报送' },
      { id: '303', name: '格式要素不健全', dictCategory: 'reject_reason', dictCategoryName: '拒绝理由', dictCode: 'REJECT_003', sortOrder: 3, isDefault: false, status: '启用', updateTime: '2023-10-22 13:45:00', description: '缺少时间、地点或核心事实等关键佐证材料' },
      { id: '304', name: '跨管辖范围报送', dictCategory: 'reject_reason', dictCategoryName: '拒绝理由', dictCode: 'REJECT_004', sortOrder: 4, isDefault: false, status: '启用', updateTime: '2023-11-02 11:10:00', description: '不属于本辖区或本部门职责处理范畴，需退回重拟' },
      { id: '305', name: '凭证图片模糊不符', dictCategory: 'reject_reason', dictCategoryName: '拒绝理由', dictCode: 'REJECT_005', sortOrder: 5, isDefault: false, status: '启用', updateTime: '2023-11-05 14:00:00', description: '上传的现场截图或说明文件无法有效佐证主张' },

      { id: 'd201', name: '骨干上报员', dictCategory: 'info_category', dictCategoryName: '人员标签', dictCode: 'INFO_001', sortOrder: 1, personnelRoleGroup: '上报员', isDefault: true, status: '启用', updateTime: '2023-10-01 08:00:00', description: '上报员角色标签' },
      { id: 'd202', name: '普通上报员', dictCategory: 'info_category', dictCategoryName: '人员标签', dictCode: 'INFO_002', sortOrder: 2, personnelRoleGroup: '上报员', isDefault: false, status: '启用', updateTime: '2023-10-01 08:00:00', description: '上报员角色标签' },
      { id: 'd203', name: '核心上报员', dictCategory: 'info_category', dictCategoryName: '人员标签', dictCode: 'INFO_003', sortOrder: 3, personnelRoleGroup: '上报员', isDefault: false, status: '启用', updateTime: '2023-10-10 10:00:00', description: '上报员角色标签' },
      { id: 'd204', name: '一级审核员', dictCategory: 'info_category', dictCategoryName: '人员标签', dictCode: 'INFO_004', sortOrder: 4, personnelRoleGroup: '审核员', isDefault: false, status: '启用', updateTime: '2023-10-12 09:00:00', description: '审核员角色标签' },
      { id: 'd205', name: '二级审核员', dictCategory: 'info_category', dictCategoryName: '人员标签', dictCode: 'INFO_005', sortOrder: 5, personnelRoleGroup: '审核员', isDefault: false, status: '启用', updateTime: '2023-10-12 09:00:00', description: '审核员角色标签' },
      { id: 'd206', name: '三级审核员', dictCategory: 'info_category', dictCategoryName: '人员标签', dictCode: 'INFO_006', sortOrder: 6, personnelRoleGroup: '审核员', isDefault: false, status: '启用', updateTime: '2023-10-12 09:00:00', description: '审核员角色标签' },

      { id: 'd301', name: '网格员现场提报', dictCategory: 'source_channel', dictCategoryName: '来源渠道', dictCode: 'CHANNEL_001', sortOrder: 1, isDefault: true, status: '启用', updateTime: '2023-10-01 08:00:00', description: '基层网格人员实地巡查采集上报' },
      { id: 'd302', name: '全网自动化爬虫捕获', dictCategory: 'source_channel', dictCategoryName: '来源渠道', dictCode: 'CHANNEL_002', sortOrder: 2, isDefault: false, status: '启用', updateTime: '2023-10-05 11:30:00', description: '舆情监测系统自动预警推送' },
      { id: 'd303', name: '12345热线协同转办', dictCategory: 'source_channel', dictCategoryName: '来源渠道', dictCode: 'CHANNEL_003', sortOrder: 3, isDefault: false, status: '启用', updateTime: '2023-10-12 16:20:00', description: '市民热线平台跨部门流转单据' },

      { id: 'd401', name: '特急 (15分钟内首报)', dictCategory: 'urgency_level', dictCategoryName: '紧急程度', dictCode: 'URGENT_001', sortOrder: 1, isDefault: true, status: '启用', updateTime: '2023-10-01 08:00:00', description: '涉及重大安全风险或突发重大事件' },
      { id: 'd402', name: '加急 (1小时内处置)', dictCategory: 'urgency_level', dictCategoryName: '紧急程度', dictCode: 'URGENT_002', sortOrder: 2, isDefault: false, status: '启用', updateTime: '2023-10-01 08:00:00', description: '热点舆情快速发酵期需要跟进' },
      { id: 'd403', name: '常规 (24小时内流转)', dictCategory: 'urgency_level', dictCategoryName: '紧急程度', dictCode: 'URGENT_003', sortOrder: 3, isDefault: false, status: '启用', updateTime: '2023-10-01 08:00:00', description: '日常普通报送信息' }
    ],
    evaluation_rule: [
      {
        id: '401',
        name: '人员考核配置',
        isDefault: true,
        status: '启用',
        updateTime: '2023-10-10 16:00:00',
        description: '用于配置人员月度目标上报量和数量、质量评分权重，考核页面按周期自动计算人员得分、等级和排名。',
        evalDimension: 'person',
        evalTarget: 'person',
        ...buildTargetsFromDay(1),
        customTargetPeriods: [],
        targetValue: 5,
        enabledPeriods: ['day', 'week', 'month', 'quarter', 'year'],
        fixedFormula: '最终得分 = Σ（各启用统计指标按分段规则折算后的得分）',
        parameterDescription: '目标值可按日设置，系统自动汇总周、月、季度和年度目标；统计指标的计算方式沿用统计指标库。',
        evalTotalScore: 100,
        evalMetricRules: getDefaultEvaluationMetricRules('person'),
        evalGrades: defaultEvaluationGrades
      },
      {
        id: '402',
        name: '机构考核配置',
        isDefault: true,
        status: '启用',
        updateTime: '2023-10-18 10:30:00',
        description: '用于配置机构人均目标、覆盖率目标和数量、质量、覆盖评分权重，考核页面自动计算机构综合得分。',
        evalDimension: 'org',
        evalTarget: 'org',
        ...buildTargetsFromDay(1),
        customTargetPeriods: [],
        targetValue: 5,
        coverageTarget: 80,
        enabledPeriods: ['day', 'week', 'month', 'quarter', 'year'],
        fixedFormula: '最终得分 = Σ（各启用统计指标按分段规则折算后的得分）',
        parameterDescription: '目标值可按日设置，系统自动汇总周、月、季度和年度目标；统计指标的计算方式沿用统计指标库。',
        evalTotalScore: 100,
        evalMetricRules: getDefaultEvaluationMetricRules('org'),
        evalGrades: defaultEvaluationGrades
      },
      {
        id: '403',
        name: '大分类考核配置',
        isDefault: true,
        status: '启用',
        updateTime: '2023-11-01 15:20:00',
        description: '用于配置每个信息大分类的月度目标上报量和数量、质量评分权重，考核页面按分类自动计算达标情况。',
        evalDimension: 'category',
        evalTarget: 'category',
        ...buildTargetsFromDay(1),
        customTargetPeriods: [],
        targetValue: 5,
        enabledPeriods: ['day', 'week', 'month', 'quarter', 'year'],
        fixedFormula: '最终得分 = Σ（各启用统计指标按分段规则折算后的得分）',
        parameterDescription: '目标值可按日设置，系统自动汇总周、月、季度和年度目标；统计指标的计算方式沿用统计指标库。',
        evalTotalScore: 100,
        evalMetricRules: getDefaultEvaluationMetricRules('category'),
        evalGrades: defaultEvaluationGrades
      }
    ],
    stats_metric: [
      { id: '501', name: '速报上报总量', displayName: '速报上报总量', metricCategory: 'scale', calcType: 'count', unit: '件', formulaText: '统计所有已提交的速报记录总数', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '衡量平台整体报送规模的基础指标' },
      { id: '531', name: '采纳通过数', displayName: '采纳通过数', metricCategory: 'quality', calcType: 'count', unit: '件', formulaText: '统计审核通过且被采纳的报送记录数', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '衡量有效报送被采纳的数量' },
      { id: '502', name: '今日新增上报', displayName: '今日新增上报', metricCategory: 'scale', calcType: 'count', unit: '件', formulaText: '统计当天新增提交的速报记录数', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '用于观察实时上报活跃度' },
      { id: '503', name: '审核总量', displayName: '审核总量', metricCategory: 'scale', calcType: 'count', unit: '件', formulaText: '统计已进入审核流程的报送记录数', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '衡量审核工作规模的基础指标' },
      { id: '504', name: '负面舆情转办数', displayName: '负面舆情转办数', metricCategory: 'scale', calcType: 'count', unit: '件', formulaText: '统计被判定为负面舆情并进入转办流程的记录数', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '反映风险事项转办规模' },
      { id: '505', name: '审核通过率', displayName: '审核通过率', metricCategory: 'quality', calcType: 'rate', unit: '%', formulaText: '审核通过数 ÷ 审核总数 × 100%', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '衡量报送内容审核质量与合规程度' },
      { id: '506', name: '驳回率', displayName: '驳回率', metricCategory: 'quality', calcType: 'rate', unit: '%', formulaText: '审核驳回数 ÷ 审核总数 × 100%', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '反映低质量或不合规报送占比' },
      { id: '507', name: '采纳转化率', displayName: '采纳转化率', metricCategory: 'quality', calcType: 'rate', unit: '%', formulaText: '被采纳件数 ÷ 审核通过数 × 100%', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '反映有效报送被处置或采用的转化能力' },
      { id: '508', name: '重复上报率', displayName: '重复上报率', metricCategory: 'quality', calcType: 'rate', unit: '%', formulaText: '重复上报件数 ÷ 上报总量 × 100%', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '用于识别重复线索和协同去重压力' },
      { id: '509', name: '信息要素完整率', displayName: '信息要素完整率', metricCategory: 'quality', calcType: 'rate', unit: '%', formulaText: '要素完整报送数 ÷ 上报总量 × 100%', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '衡量报送内容是否包含时间、地点、主体、证据等关键要素' },
      { id: '510', name: '平均审核响应', displayName: '平均审核响应', metricCategory: 'efficiency', calcType: 'average', unit: '分钟', formulaText: '审核总耗时 ÷ 审核件数', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '衡量从提交到完成审核的平均响应速度' },
      { id: '511', name: '首审平均耗时', displayName: '首审平均耗时', metricCategory: 'efficiency', calcType: 'average', unit: '分钟', formulaText: '首审环节总耗时 ÷ 首审件数', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '衡量初审环节响应效率' },
      { id: '512', name: '转办平均耗时', displayName: '转办平均耗时', metricCategory: 'efficiency', calcType: 'average', unit: '分钟', formulaText: '转办处理总耗时 ÷ 转办件数', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '衡量转办派发和处理效率' },
      { id: '513', name: '超时处置率', displayName: '超时处置率', metricCategory: 'efficiency', calcType: 'rate', unit: '%', formulaText: '超时处置件数 ÷ 应处置件数 × 100%', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '反映时限管控风险' },
      { id: '514', name: '负面舆情已办结数', displayName: '负面舆情已办结数', metricCategory: 'closure', calcType: 'count', unit: '件', formulaText: '统计负面舆情转办中已完成办结的记录数', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '衡量风险处置闭环成果' },
      { id: '515', name: '按时办结率', displayName: '按时办结率', metricCategory: 'closure', calcType: 'rate', unit: '%', formulaText: '按时办结数 ÷ 应办结数 × 100%', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '衡量闭环处置是否满足时限要求' },
      { id: '516', name: '待办转办数', displayName: '待办转办数', metricCategory: 'closure', calcType: 'count', unit: '件', formulaText: '统计仍处于待处理状态的转办记录数', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '反映当前处置压力' },
      { id: '517', name: '高风险待处置数', displayName: '高风险待处置数', metricCategory: 'closure', calcType: 'count', unit: '件', formulaText: '统计风险等级较高且尚未办结的事件数量', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '用于突出当前需要优先关注的风险事项' },
      { id: '518', name: '子机构总数', displayName: '子机构总数', metricCategory: 'coverage', calcType: 'count', unit: '个', formulaText: '统计当前机构树中的子机构节点总数', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '平台组织覆盖规模指标' },
      { id: '519', name: '平台人员总数', displayName: '平台人员总数', metricCategory: 'coverage', calcType: 'count', unit: '人', formulaText: '统计平台在册人员账号总数', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '平台人员覆盖规模指标' },
      { id: '520', name: '活跃机构数', displayName: '活跃机构数', metricCategory: 'coverage', calcType: 'count', unit: '个', formulaText: '统计周期内存在上报或审核行为的机构数量', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '衡量机构参与活跃度' },
      { id: '521', name: '人员参与率', displayName: '人员参与率', metricCategory: 'coverage', calcType: 'rate', unit: '%', formulaText: '活跃人员数 ÷ 在册人员总数 × 100%', supportsDerived: true, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '衡量人员参与覆盖程度' },
      { id: '522', name: '上报趋势', displayName: '上报趋势', metricCategory: 'trend', calcType: 'trend', unit: '件', formulaText: '按时间序列聚合上报数量形成趋势', supportsDerived: false, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '用于趋势图展示上报变化' },
      { id: '523', name: '审核通过趋势', displayName: '审核通过趋势', metricCategory: 'trend', calcType: 'trend', unit: '件', formulaText: '按时间序列聚合审核通过数量形成趋势', supportsDerived: false, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '用于观察审核通过变化趋势' },
      { id: '524', name: '负面舆情趋势', displayName: '负面舆情趋势', metricCategory: 'trend', calcType: 'trend', unit: '件', formulaText: '按时间序列聚合负面舆情转办数量形成趋势', supportsDerived: false, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '用于观察负面事件发展变化' },
      { id: '525', name: '舆情分类分布', displayName: '舆情分类分布', metricCategory: 'distribution', calcType: 'distribution', unit: '件/%', formulaText: '按舆情分类聚合数量并计算占比', supportsDerived: false, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '用于展示不同舆情分类构成' },
      { id: '526', name: '来源渠道分布', displayName: '来源渠道分布', metricCategory: 'distribution', calcType: 'distribution', unit: '件/%', formulaText: '按来源渠道聚合数量并计算占比', supportsDerived: false, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '用于分析不同来源渠道贡献' },
      { id: '527', name: '审核状态分布', displayName: '审核状态分布', metricCategory: 'distribution', calcType: 'distribution', unit: '件/%', formulaText: '按待审、通过、驳回等审核状态聚合数量并计算占比', supportsDerived: false, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '用于分析审核结构和处理阶段' },
      { id: '528', name: '机构上报排行', displayName: '机构上报排行', metricCategory: 'ranking', calcType: 'ranking', unit: '名次/件', formulaText: '按机构上报总量从高到低排序', supportsDerived: false, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '用于展示机构报送绩效排名' },
      { id: '529', name: '人员报送排行', displayName: '人员报送排行', metricCategory: 'ranking', calcType: 'ranking', unit: '名次/件', formulaText: '按人员上报总量从高到低排序', supportsDerived: false, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '用于展示人员报送活跃排名' },
      { id: '530', name: '响应效率排行', displayName: '响应效率排行', metricCategory: 'ranking', calcType: 'ranking', unit: '名次/分钟', formulaText: '按平均响应耗时从低到高排序', supportsDerived: false, period: 'custom', pages: [], isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '用于展示机构或人员处置效率排名' }
    ],
    audit_flow: [
      {
        id: '601',
        name: '逐级审核流程（组织树自适应）',
        flowMode: 'adaptive',
        isDefault: true,
        status: '启用',
        updateTime: '2023-10-05 10:00:00',
        description: '本级机构提报后沿组织树逐级向上传递审核，最终由总机构终审并评分。管理员无需配置上1级、上2级、上3级...',
        relatedTemplateId: 'all_report_templates',
        relatedTemplateName: '全部报送模板通用',
        templateApplyMode: 'all_report_templates',
        flowDepth: 3,
        orgApplyMode: 'all_orgs',
        ownerMissingStrategy: 'skip_to_next',
        auditNodes: [
          { id: 'an1', nodeName: '本级机构初审', approverRole: '归属机构负责人', assigneeSource: 'org_owner', rejectStrategy: 'return_submitter', timeLimitMinutes: 15, dynamicMechanism: '动态匹配归属机构负责人', missingRule: 'skip', timeoutReminderEnabled: true },
          { id: 'an2', nodeName: '上级机构逐级复核', approverRole: '归属机构负责人', assigneeSource: 'org_owner', rejectStrategy: 'return_submitter', timeLimitMinutes: 30, dynamicMechanism: '动态匹配上级机构负责人', missingRule: 'skip', timeoutReminderEnabled: true },
          { id: 'an3', nodeName: '总机构终审并评分', approverRole: '总机构管理员', assigneeSource: 'role', rejectStrategy: 'return_submitter', timeLimitMinutes: 60, dynamicMechanism: '固定总机构管理员终审+评分', missingRule: 'transfer_admin', isFinalScoreNode: true, timeoutReminderEnabled: true }
        ],
        orgSettings: [
          { orgId: 'org1', orgName: '市委宣传部', enabled: true },
          { orgId: 'org2', orgName: '市公安局网安支队', enabled: true },
          { orgId: 'org3', orgName: '市应急管理局', enabled: true },
          { orgId: 'org4', orgName: '区县级网信中心', enabled: true },
          { orgId: 'org5', orgName: '市场监督管理局', enabled: true }
        ]
      },
      {
        id: '602',
        name: '最多3级快速审核流程',
        flowMode: 'max_n',
        isDefault: false,
        status: '启用',
        updateTime: '2023-11-04 17:30:00',
        description: '最多经过3个中间机构审核后直达总机构终审并评分。注意：这是“最多”，不是“必须”。组织实际不足3级时按实...',
        relatedTemplateId: '3',
        relatedTemplateName: '突发事件快速上报',
        templateApplyMode: 'single_template',
        flowDepth: 3,
        orgApplyMode: 'all_orgs',
        ownerMissingStrategy: 'skip_to_next',
        auditNodes: [
          { id: 'an201', nodeName: '本级机构初审', approverRole: '归属机构负责人', assigneeSource: 'org_owner', rejectStrategy: 'return_submitter', timeLimitMinutes: 15, dynamicMechanism: '动态匹配归属机构负责人', missingRule: 'skip', timeoutReminderEnabled: true },
          { id: 'an202', nodeName: '中继机构复核（至多3级）', approverRole: '归属机构负责人', assigneeSource: 'org_owner', rejectStrategy: 'return_previous', timeLimitMinutes: 20, dynamicMechanism: '自适应中间机构链，超出截断直达总机构', missingRule: 'skip', timeoutReminderEnabled: true },
          { id: 'an203', nodeName: '总机构终审并评分', approverRole: '总机构管理员', assigneeSource: 'role', rejectStrategy: 'return_submitter', timeLimitMinutes: 60, dynamicMechanism: '固定总机构管理员终审+评分', missingRule: 'transfer_admin', isFinalScoreNode: true, timeoutReminderEnabled: true }
        ],
        orgSettings: [
          { orgId: 'org1', orgName: '市委宣传部', enabled: true },
          { orgId: 'org2', orgName: '市公安局网安支队', enabled: true },
          { orgId: 'org3', orgName: '市应急管理局', enabled: true }
        ]
      },
      {
        id: '603',
        name: '直接总机构审核通道',
        flowMode: 'direct',
        isDefault: false,
        status: '启用',
        updateTime: '2023-11-08 09:15:00',
        description: '适用于无需基层/中间机构审核的业务。上报人提报后直接流转至总机构管理员，进行终审并评分。',
        relatedTemplateId: '1',
        relatedTemplateName: '标准图文报送模板',
        templateApplyMode: 'single_template',
        flowDepth: 2,
        orgApplyMode: 'all_orgs',
        ownerMissingStrategy: 'skip_to_next',
        auditNodes: [
          { id: 'an301', nodeName: '上报人直报', approverRole: '提报人员', assigneeSource: 'user', rejectStrategy: 'return_submitter', timeLimitMinutes: 10, dynamicMechanism: '上报人提交即进入终审通道', missingRule: 'skip', timeoutReminderEnabled: true },
          { id: 'an302', nodeName: '总机构终审并评分', approverRole: '总机构管理员', assigneeSource: 'role', rejectStrategy: 'return_submitter', timeLimitMinutes: 60, dynamicMechanism: '总机构直审并打分一体化', missingRule: 'transfer_admin', isFinalScoreNode: true, timeoutReminderEnabled: true }
        ],
        orgSettings: [
          { orgId: 'org1', orgName: '市委宣传部', enabled: true }
        ]
      }
    ],
    login_method: [
      { id: '701', name: '账号密码登录', loginType: 'password', loginTypeName: '系统默认', configStatus: '已配置', isFallback: true, isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '基于加密数据库的基础密码鉴权，作为系统默认兜底登录方式' },
      { id: '702', name: '手机短信验证码', loginType: 'sms', loginTypeName: '短信服务', configStatus: '已配置', isFallback: false, isDefault: false, status: '启用', updateTime: '2023-10-15 12:00:00', description: '支持手机号动态一次性口令登录，需要配置短信服务商、签名、模板和验证码有效期' },
      { id: '703', name: '微信扫码登录', loginType: 'wechat', loginTypeName: '第三方授权', configStatus: '待配置', isFallback: false, isDefault: false, status: '停用', updateTime: '2023-10-20 15:40:00', description: '支持通过微信扫码完成身份认证，需要配置授权应用参数和回调地址' }
    ],
    value_added: [
      {
        id: 'va_1',
        name: '批量审核',
        dictCategoryName: '增值业务',
        dictCode: 'VA_BATCH_AUDIT',
        status: '启用',
        activatedStatus: '已开通',
        updateTime: '2023-11-10 10:00:00',
        description: '支持批量勾选多条报送线索与事项目录、快捷批量审核通过、批量驳回与一键签发转办，大幅提升处置效率',
        isDefault: true
      },
      {
        id: 'va_2',
        name: '截图取证',
        dictCategoryName: '增值业务',
        dictCode: 'VA_SCREENSHOT_EVIDENCE',
        status: '停用',
        activatedStatus: '已开通',
        updateTime: '2023-11-10 10:00:00',
        description: '自动化对涉事网页及社交媒体内容进行全屏快照截屏存证，生成区块链与防篡改水文可信取证包',
        isDefault: true
      },
      {
        id: 'va_3',
        name: '指令流转',
        dictCategoryName: '增值业务',
        dictCode: 'VA_INSTRUCTION_FLOW',
        status: '停用',
        activatedStatus: '未开通',
        updateTime: '2023-11-10 10:00:00',
        description: '跨部门与下级节点指令下发、时限催办、督查跟进、反馈回复与闭环归档全流程协作引擎',
        isDefault: true
      },
      {
        id: 'va_4',
        name: '系统公告',
        dictCategoryName: '增值业务',
        dictCode: 'VA_SYSTEM_ANNOUNCEMENT',
        status: '停用',
        activatedStatus: '未开通',
        updateTime: '2023-11-10 10:00:00',
        description: '支撑全网节点重大通知广播、突发风险预警弹窗强提醒及全局公告消息穿透推送',
        isDefault: true
      },
      {
        id: 'va_5',
        name: '报送首发重复识别',
        dictCategoryName: '增值业务',
        dictCode: 'VA_REPORT_DUPLICATE_IDENTIFICATION',
        status: '启用',
        activatedStatus: '已开通',
        updateTime: '2023-11-10 10:00:00',
        description: '通过抓取报送链接的文章原文比对判断内容是否重复，并结合提交时间线智能判定首发，避免多头报送与重复审核计分。',
        isDefault: true
      }
    ]
    }, valueAddedAllOperable)
  );

  const commitDataStore = (
    updater: (prev: Record<string, ConfigModuleItem[]>) => Record<string, ConfigModuleItem[]>
  ) => {
    setDataStore(prev => {
      const next = updater(prev);
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // 忽略持久化写入异常，预览态不阻塞交互
        }
      }
      return next;
    });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [showValueAddedBanner, setShowValueAddedBanner] = useState(true);
  const [showAuditSyncNotice, setShowAuditSyncNotice] = useState(true);
  const [showDictSyncNotice, setShowDictSyncNotice] = useState(true);
  const [templateTypeFilter, setTemplateTypeFilter] = useState<'all' | '报送' | '激活'>('报送');
  const [metricNameInput, setMetricNameInput] = useState('');
  const [metricNameQuery, setMetricNameQuery] = useState('');
  const [metricBindings, setMetricBindings] = useState<MetricDisplayBinding[]>(() => getDefaultMetricBindings());
  const [configToastMessage, setConfigToastMessage] = useState<string | null>(null);
  const configToastTimerRef = useRef<number | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ConfigModuleItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formTemplateType, setFormTemplateType] = useState<'报送' | '激活'>('报送');
  const [formDesc, setFormDesc] = useState('');
  const [formFields, setFormFields] = useState<TemplateField[]>([]);
  const [modalActiveTab, setModalActiveTab] = useState<'build' | 'preview'>('build');
  const [quickFieldType, setQuickFieldType] = useState<FieldType>('text');
  const [draggingFieldIndex, setDraggingFieldIndex] = useState<number | null>(null);
  const [fieldAddNotice, setFieldAddNotice] = useState('');
  const latestFieldRef = useRef<HTMLDivElement | null>(null);
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({});

  // Audit Score Rule Modal States
  const [formTotalScore, setFormTotalScore] = useState<number>(100);
  const [formLevelCount, setFormLevelCount] = useState<number>(5);
  const [formScoreLevels, setFormScoreLevels] = useState<ScoreLevel[]>([]);
  const [draggingScoreLevelIndex, setDraggingScoreLevelIndex] = useState<number | null>(null);
  const [formScoreStatus, setFormScoreStatus] = useState<'启用' | '停用'>('停用');
  const [formRelatedTemplateId, setFormRelatedTemplateId] = useState<string>('');
  const [formTemplateApplyMode, setFormTemplateApplyMode] = useState<AuditTemplateApplyMode>('single_template');

  // Audit Flow / Hierarchy Modal States
  const [formFlowMode, setFormFlowMode] = useState<'adaptive' | 'max_n' | 'direct'>('adaptive');
  const [formFlowDepth, setFormFlowDepth] = useState<number>(2);
  const [formAuditNodes, setFormAuditNodes] = useState<AuditNode[]>([]);
  const [selectedAuditNodeId, setSelectedAuditNodeId] = useState<string | null>(null);
  const [formOrgApplyMode, setFormOrgApplyMode] = useState<'all_orgs' | 'specific_orgs'>('all_orgs');
  const [formOrgSettings, setFormOrgSettings] = useState<OrgScopeSetting[]>([]);
  const [formOwnerMissingStrategy, setFormOwnerMissingStrategy] = useState<AuditOwnerMissingStrategy>('skip_to_next');
  const [formOwnerMissingFallbackRole, setFormOwnerMissingFallbackRole] = useState<string>('机构管理员');
  const [formOwnerMissingFallbackUserName, setFormOwnerMissingFallbackUserName] = useState<string>('');
  const [orgPickerSearch, setOrgPickerSearch] = useState<string>('');
  const [isOrgPickerOpen, setIsOrgPickerOpen] = useState(false);
  const [orgPickerRootId, setOrgPickerRootId] = useState<string>('root_city');
  const [orgPickerGroupId, setOrgPickerGroupId] = useState<string>('city_units');
  const [orgPickerPosition, setOrgPickerPosition] = useState({ top: 0, left: 0 });
  const orgPickerAnchorRef = useRef<HTMLDivElement | null>(null);
  const orgPickerPanelRef = useRef<HTMLDivElement | null>(null);
  const [newCustomOrgName, setNewCustomOrgName] = useState<string>('');

  // Evaluation Rule Modal States
  const [formEvalDimension, setFormEvalDimension] = useState<'category' | 'org' | 'person' | 'comprehensive'>('category');
  const [formIndicators, setFormIndicators] = useState<EvaluationIndicator[]>([]);
  const [formEvalTarget, setFormEvalTarget] = useState<EvaluationTarget>('person');
  const [formCoverageTarget, setFormCoverageTarget] = useState<number>(80);
  const [formEnabledPeriods, setFormEnabledPeriods] = useState<EvaluationPeriod[]>(['month', 'quarter', 'year']);
  const [formTargetDay, setFormTargetDay] = useState<number>(1);
  const [formTargetWeek, setFormTargetWeek] = useState<number>(7);
  const [formTargetMonth, setFormTargetMonth] = useState<number>(30);
  const [formTargetQuarter, setFormTargetQuarter] = useState<number>(90);
  const [formTargetYear, setFormTargetYear] = useState<number>(365);
  const [formCustomTargetPeriods, setFormCustomTargetPeriods] = useState<Array<'week' | 'month' | 'quarter' | 'year'>>([]);
  const [formEvalTotalScore, setFormEvalTotalScore] = useState<number>(100);
  const [formEvalMetricRules, setFormEvalMetricRules] = useState<EvaluationMetricRule[]>([]);
  const [formEvalGrades, setFormEvalGrades] = useState<EvaluationGrade[]>([]);

  // Data Dictionary Maintenance Sub-Category & Form States
  const [dictSubCategoryFilter, setDictSubCategoryFilter] = useState<string>('reject_reason');
  const [formDictCategory, setFormDictCategory] = useState<string>('reject_reason');
  const [formDictCategoryName, setFormDictCategoryName] = useState<string>('拒绝理由');
  const [formDictCode, setFormDictCode] = useState<string>('');
  const [formSortOrder, setFormSortOrder] = useState<number>(1);
  const [formPersonnelRoleGroup, setFormPersonnelRoleGroup] = useState<'上报员' | '审核员'>('上报员');
  const [formLoginConfigStatus, setFormLoginConfigStatus] = useState<'已配置' | '待配置'>('已配置');

  // Stats metric module states
  const [metricModalOpen, setMetricModalOpen] = useState(false);
  const [metricEditingItem, setMetricEditingItem] = useState<ConfigModuleItem | null>(null);
  const [metricName, setMetricName] = useState('');
  const [metricDisplayName, setMetricDisplayName] = useState('');
  const [metricCalcType, setMetricCalcType] = useState<MetricCalcType>('count');
  const [metricUnit, setMetricUnit] = useState('件');
  const [metricPeriod, setMetricPeriod] = useState<MetricRule['period']>('today');
  const [metricPages, setMetricPages] = useState<MetricDisplayPage[]>(['home_kpi']);
  const [metricDesc, setMetricDesc] = useState('');
  const [restoreTargetPage, setRestoreTargetPage] = useState<'home_kpi' | 'stats_kpi' | 'trend_chart' | 'ranking_panel' | 'distribution_panel' | 'all'>('home_kpi');
  const [metricCategoryFilter, setMetricCategoryFilter] = useState<MetricCategory | 'all'>('all');
  const [metricCategoryInput, setMetricCategoryInput] = useState<MetricCategory | 'all'>('all');
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);
  const [hoveredMetricId, setHoveredMetricId] = useState<string | null>(null);
  const [selectedAuditFlowId, setSelectedAuditFlowId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  useEffect(() => {
    if (!fieldAddNotice) return;
    latestFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const timer = window.setTimeout(() => setFieldAddNotice(''), 1800);
    return () => window.clearTimeout(timer);
  }, [fieldAddNotice, formFields.length]);

  const showConfigToast = (message: string) => {
    if (configToastTimerRef.current) {
      window.clearTimeout(configToastTimerRef.current);
    }
    setConfigToastMessage(message);
    configToastTimerRef.current = window.setTimeout(() => {
      setConfigToastMessage(null);
      configToastTimerRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    const options = formTemplateType === '激活' ? activationFieldTypeOptions : reportFieldTypeOptions;
    if (!options.includes(quickFieldType)) {
      setQuickFieldType(options[0]);
    }
  }, [formTemplateType, quickFieldType]);

  const metricPageOptions: Array<{ id: MetricDisplayPage; label: string; description: string }> = [
    { id: 'home_kpi', label: '首页核心指标', description: '首页顶部 7 大核心数据卡片' },
    { id: 'stats_kpi', label: '统计管理KPI', description: '统计管理大屏顶部 KPI 卡片' },
    { id: 'trend_chart', label: '趋势图指标', description: '上报趋势与通过趋势图表' },
    { id: 'ranking_panel', label: '排行面板指标', description: '机构、人员、区域排行表' },
    { id: 'distribution_panel', label: '分布面板指标', description: '分类、区域、来源渠道分布' }
  ];

  const metricCalcOptions: Array<{ id: MetricCalcType; label: string; description: string; unit: string }> = [
    { id: 'count', label: '计数统计', description: '按上报件数、机构数、人员数等总量汇总', unit: '件' },
    { id: 'rate', label: '比率统计', description: '通过数 / 总审核数、办结数 / 转办数等比例', unit: '%' },
    { id: 'average', label: '均值统计', description: '总耗时 / 审核件数等平均值', unit: '分钟' },
    { id: 'trend', label: '趋势统计', description: '当前周期与历史周期形成时间序列', unit: '件' },
    { id: 'ranking', label: '排名统计', description: '按机构、区域、人员排序输出 Top 列表', unit: '名次' },
    { id: 'distribution', label: '分布统计', description: '按分类、区域、渠道切分占比', unit: '%' }
  ];

  const metricCategoryOptions: Array<{ id: MetricCategory; label: string }> = [
    { id: 'scale', label: '规模类' },
    { id: 'quality', label: '质量类' },
    { id: 'efficiency', label: '效率类' },
    { id: 'closure', label: '处置闭环类' },
    { id: 'coverage', label: '覆盖参与类' },
    { id: 'trend', label: '趋势类' },
    { id: 'distribution', label: '分布类' },
    { id: 'ranking', label: '排行类' }
  ];

  const dictCategoryOptions = [
    {
      id: 'reject_reason',
      label: '拒绝理由',
      fullLabel: '审核驳回理由',
      codePrefix: 'REJECT_',
      tone: 'rose',
      description: '审核驳回时给审核人员快速选择，并同步给上报人作为退回原因。'
    },
    {
      id: 'info_category',
      label: '人员标签',
      fullLabel: '人员标签',
      codePrefix: 'INFO_',
      tone: 'purple',
      description: '用于报送内容分类、统计分析和后续字段扩展。'
    },
    {
      id: 'source_channel',
      label: '来源渠道',
      fullLabel: '来源渠道',
      codePrefix: 'CHANNEL_',
      tone: 'blue',
      description: '用于区分线索来源、采集方式和渠道统计。'
    },
    {
      id: 'urgency_level',
      label: '紧急程度',
      fullLabel: '紧急程度',
      codePrefix: 'URGENT_',
      tone: 'amber',
      description: '用于流转优先级、响应要求和处置提醒扩展。'
    }
  ];
  const dictCategoryTabOptions = dictCategoryOptions.filter(
    option => option.id !== 'source_channel' && option.id !== 'urgency_level'
  );

  const metricPeriodOptions = [
    { id: 'today', label: '今日' },
    { id: 'week', label: '本周' },
    { id: 'month', label: '本月' },
    { id: 'quarter', label: '本季度' },
    { id: 'year', label: '本年' },
    { id: 'custom', label: '自定义周期' }
  ] as const;

  const evaluationPeriodOptions: Array<{ id: EvaluationPeriod; label: string }> = [
    { id: 'day', label: '日度' },
    { id: 'week', label: '周度' },
    { id: 'month', label: '月度' },
    { id: 'quarter', label: '季度' },
    { id: 'year', label: '年度' }
  ];

  const evaluationTargetPeriodOptions: Array<{ id: 'day' | 'week' | 'month' | 'quarter' | 'year'; label: string; suffix: string }> = [
    { id: 'day', label: '日目标', suffix: '条/日' },
    { id: 'week', label: '周目标', suffix: '条/周' },
    { id: 'month', label: '月目标', suffix: '条/月' },
    { id: 'quarter', label: '季度目标', suffix: '条/季度' },
    { id: 'year', label: '年目标', suffix: '条/年' }
  ];

  const getEvaluationTargetLabel = (target?: EvaluationTarget) => {
    if (target === 'org') return '机构考核';
    if (target === 'category') return '大分类考核';
    return '人员考核';
  };

  const getEvaluationTargetBadge = (target?: EvaluationTarget) => {
    if (target === 'org') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (target === 'category') return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  const getEvaluationTargetName = (target?: EvaluationTarget) => {
    if (target === 'org') return '机构目标上报量';
    if (target === 'category') return '大分类目标上报量';
    return '人员目标上报量';
  };

  const getEvaluationParameterDescription = (target?: EvaluationTarget) => {
    if (target === 'org') {
      return '人均月目标上报量用于衡量机构数量达标；覆盖率目标用于衡量机构成员参与覆盖。';
    }
    if (target === 'category') {
      return '每分类月目标上报量用于衡量分类上报规模；质量分来自该分类下报送审核质量和采纳结果。';
    }
    return '每人每月目标上报量为数量分达标基准；质量分来自审核打分、通过率和采纳情况。';
  };

  const getEvaluationPeriodText = (periods?: EvaluationPeriod[]) => {
    const enabled = periods && periods.length > 0 ? periods : [];
    return enabled.length > 0
      ? evaluationPeriodOptions.filter(option => enabled.includes(option.id)).map(option => option.label).join('、')
      : '未配置';
  };

  const getEvaluationWeightTotal = (item?: Partial<ConfigModuleItem>) => {
    if (item?.evalMetricRules && item.evalMetricRules.length > 0) {
      return item.evalMetricRules.filter(rule => rule.enabled).reduce((sum, rule) => sum + (Number(rule.weight) || 0), 0);
    }
    return (item?.quantityWeight || 0) + (item?.qualityWeight || 0) + (item?.evalTarget === 'org' ? (item?.coverageWeight || 0) : 0);
  };

  const toggleEvaluationPeriod = (period: EvaluationPeriod) => {
    setFormEnabledPeriods(prev =>
      prev.includes(period) ? prev.filter(item => item !== period) : [...prev, period]
    );
  };

  const getEvaluationTargetSummary = (item: ConfigModuleItem) => {
    const day = item.targetDay ?? item.targetValue ?? 0;
    const week = item.targetWeek ?? day * 7;
    const month = item.targetMonth ?? day * 30;
    const quarter = item.targetQuarter ?? day * 90;
    const year = item.targetYear ?? day * 365;
    return `日 ${day} / 周 ${week} / 月 ${month} / 季 ${quarter} / 年 ${year}`;
  };

  const applyEvaluationDayTarget = (day: number) => {
    const targets = buildTargetsFromDay(day);
    setFormTargetDay(targets.targetDay);
    setFormTargetWeek(targets.targetWeek);
    setFormTargetMonth(targets.targetMonth);
    setFormTargetQuarter(targets.targetQuarter);
    setFormTargetYear(targets.targetYear);
    setFormCustomTargetPeriods([]);
  };

  const markCustomTargetPeriod = (period: 'week' | 'month' | 'quarter' | 'year') => {
    setFormCustomTargetPeriods(prev => (prev.includes(period) ? prev : [...prev, period]));
  };

  const updateEvaluationMetricRule = (index: number, updates: Partial<EvaluationMetricRule>) => {
    setFormEvalMetricRules(prev => prev.map((rule, idx) => (idx === index ? { ...rule, ...updates } : rule)));
  };

  const deleteEvaluationMetricRule = (index: number) => {
    setFormEvalMetricRules(prev => prev.filter((_, idx) => idx !== index));
  };

  const addEvaluationMetricRule = (metricId?: string) => {
    const existingIds = new Set(formEvalMetricRules.map(rule => rule.metricId));
    const candidate = defaultEvaluationMetricLibrary.find(metric => {
      if (metricId && metric.metricId !== metricId) return false;
      if (existingIds.has(metric.metricId)) return false;
      if (formEvalTarget === 'person' && metric.metricId === '521') return false;
      return true;
    });
    if (!candidate) {
      alert('当前考核对象暂无可继续添加的统计指标');
      return;
    }
    setFormEvalMetricRules(prev => [
      ...prev,
      {
        id: `erm_${formEvalTarget}_${candidate.metricId}_${Date.now()}`,
        metricId: candidate.metricId,
        metricName: candidate.metricName,
        metricUnit: candidate.metricUnit,
        metricFormula: candidate.metricFormula,
        enabled: true,
        weight: 0,
        scoreMode: 'ratio',
        scoreType: candidate.scoreType,
        segments: cloneSegments(candidate.scoreType === 'lower_better' ? defaultEfficiencySegments : defaultAchievementSegments)
      }
    ]);
  };

  const updateEvaluationMetricSegment = (ruleIndex: number, segmentIndex: number, updates: Partial<EvaluationScoreSegment>) => {
    setFormEvalMetricRules(prev => prev.map((rule, idx) => {
      if (idx !== ruleIndex) return rule;
      return {
        ...rule,
        segments: rule.segments.map((segment, sIdx) => (sIdx === segmentIndex ? { ...segment, ...updates } : segment))
      };
    }));
  };

  const addEvaluationMetricSegment = (ruleIndex: number) => {
    setFormEvalMetricRules(prev => prev.map((rule, idx) => {
      if (idx !== ruleIndex) return rule;
      return {
        ...rule,
        segments: [
          ...rule.segments,
          { id: `seg_${Date.now()}`, label: '自定义分段', minValue: 0, maxValue: 0, scoreRatio: 0, fixedScore: 0 }
        ]
      };
    }));
  };

  const deleteEvaluationMetricSegment = (ruleIndex: number, segmentIndex: number) => {
    setFormEvalMetricRules(prev => prev.map((rule, idx) => {
      if (idx !== ruleIndex) return rule;
      return { ...rule, segments: rule.segments.filter((_, sIdx) => sIdx !== segmentIndex) };
    }));
  };

  const updateEvaluationGrade = (index: number, updates: Partial<EvaluationGrade>) => {
    setFormEvalGrades(prev => prev.map((grade, idx) => (idx === index ? { ...grade, ...updates } : grade)));
  };

  const addEvaluationGrade = () => {
    setFormEvalGrades(prev => [
      ...prev,
      { id: `grade_${Date.now()}`, name: '自定义等次', minScore: 0, maxScore: 0 }
    ]);
  };

  const deleteEvaluationGrade = (index: number) => {
    setFormEvalGrades(prev => prev.filter((_, idx) => idx !== index));
  };

  function getDefaultMetricBindings(): MetricDisplayBinding[] {
    return [
    { page: 'home_kpi', pageName: '首页', slotName: '核心指标卡1', metricId: '501', metricName: '上报总量统计指标' },
    { page: 'home_kpi', pageName: '首页', slotName: '核心指标卡2', metricId: '502', metricName: '采纳率转化指标' },
    { page: 'home_kpi', pageName: '首页', slotName: '核心指标卡3', metricId: '503', metricName: '审核平均耗时' },
    { page: 'stats_kpi', pageName: '统计管理', slotName: 'KPI卡1', metricId: '501', metricName: '上报总量统计指标' },
    { page: 'stats_kpi', pageName: '统计管理', slotName: 'KPI卡2', metricId: '502', metricName: '采纳率转化指标' },
    { page: 'stats_kpi', pageName: '统计管理', slotName: 'KPI卡3', metricId: '503', metricName: '审核平均耗时' },
    { page: 'trend_chart', pageName: '趋势图', slotName: '趋势主指标', metricId: '505', metricName: '区域上报趋势' },
    { page: 'ranking_panel', pageName: '排行面板', slotName: '排行主指标', metricId: '506', metricName: '机构上报排行' },
    { page: 'distribution_panel', pageName: '分布面板', slotName: '分布主指标', metricId: '507', metricName: '分类分布指标' }
    ];
  }

  const defaultOrgList: OrgScopeSetting[] = [
    { orgId: 'org1', orgName: '市委宣传部', enabled: true },
    { orgId: 'org2', orgName: '市公安局网安支队', enabled: true },
    { orgId: 'org3', orgName: '市应急管理局', enabled: true },
    { orgId: 'org4', orgName: '区县级网信中心', enabled: true },
    { orgId: 'org5', orgName: '市场监督管理局', enabled: true },
    { orgId: 'org6', orgName: '卫健委应急办', enabled: true }
  ];

  const orgTreeGroups = [
    {
      id: 'root_city',
      name: '台中市网信办',
      children: [
        {
          id: 'city_units',
          name: '市级联动部门',
          children: ['org1', 'org2', 'org3', 'org5', 'org6']
        },
        {
          id: 'district_units',
          name: '区县网信节点',
          children: ['org4']
        }
      ]
    }
  ];

  const auditAssigneeSourceOptions = [
    { id: 'role', label: '按角色', description: '从人员角色中匹配可审核人员' },
    { id: 'user', label: '指定人员', description: '固定由某个具体人员处理' },
    { id: 'org_owner', label: '归属机构负责人', description: '按上报人归属机构自动匹配负责人' }
  ] as const;

  const auditRoleOptions = ['初审员', '网格员', '值班员', '科室负责人', '舆情专员', '主管领导', '平台管理员'];
  const auditUserOptions = ['张三', '李娜', '王强', '赵敏', '陈主任'];
  const auditTemplateApplyOptions: Array<{ id: AuditTemplateApplyMode; label: string; description: string }> = [
    { id: 'single_template', label: '指定模板', description: '仅绑定一个上报模板，适合专项流程' },
    { id: 'all_report_templates', label: '全部报送模板通用', description: '所有报送类模板统一使用该审核流程' }
  ];
  const ownerMissingStrategyOptions: Array<{ id: AuditOwnerMissingStrategy; label: string; description: string }> = [
    { id: 'fallback_role', label: '转交兜底角色', description: '自动分配给指定兜底角色，保障流程继续流转' },
    { id: 'block_submit', label: '阻止提交并提示', description: '提交前提示当前机构未配置负责人，需先补全组织负责人' },
    { id: 'skip_to_next', label: '跳过该节点', description: '无负责人时跳过当前节点，流转到下一审核节点' },
    { id: 'fallback_user', label: '转交指定人员', description: '自动分配给固定人员临时代办' }
  ];

  const getAuditAssigneeSourceLabel = (source?: AuditNode['assigneeSource']) =>
    auditAssigneeSourceOptions.find(item => item.id === source)?.label || '按角色';

  const getAuditTemplateScopeText = (item: ConfigModuleItem) => {
    if (item.templateApplyMode === 'all_report_templates' || item.relatedTemplateId === 'all_report_templates') return '全部报送模板通用';
    return item.relatedTemplateName || '标准图文报送模板';
  };

  const getOwnerMissingStrategyText = (item: ConfigModuleItem) => {
    const strategy = item.ownerMissingStrategy || 'block_submit';
    const option = ownerMissingStrategyOptions.find(entry => entry.id === strategy);
    if (strategy === 'fallback_role') return `${option?.label || '转交兜底角色'}：${item.ownerMissingFallbackRole || '机构管理员'}`;
    if (strategy === 'fallback_user') return `${option?.label || '转交指定人员'}：${item.ownerMissingFallbackUserName || '未指定'}`;
    return option?.label || '阻止提交并提示';
  };

  const buildAuditFlowLinearPreviewData = (item: ConfigModuleItem, preferredStepsPerRow = 6, singleRowLimit = 6) => {
    const nodes = item.auditNodes || [];
    const flowSteps = [
      { id: 'start', type: 'start' as const, title: '开始', description: '发起上报' },
      ...nodes.map((node, index) => {
        const isFinal = node.isFinalScoreNode || index === nodes.length - 1;
        const roleText = node.approverRole || (node.assigneeSource === 'org_owner' ? '归属机构负责人' : '指定角色');
        const timeText = node.timeLimitMinutes ? (node.timeLimitMinutes >= 60 ? `${node.timeLimitMinutes / 60}小时` : `${node.timeLimitMinutes}分`) : '15分';
        const rejectText = node.rejectStrategy === 'return_previous' ? '退回上一节点' : '退回上报人';
        return {
          id: node.id || `node-${index}`,
          type: 'node' as const,
          isFinalScoreNode: isFinal,
          title: node.nodeName || `审核节点 ${index + 1}`,
          description: `${roleText}；限时${timeText} · ${rejectText}`,
          ruleDescription: '',
        };
      }),
      { id: 'end', type: 'end' as const, title: '结束', description: '审核+评分+流程全完成' },
    ];
    const stepsPerRow = flowSteps.length;
    const flowRows = [flowSteps];
    const panelWidth = Math.min(960, Math.max(680, flowSteps.length * 150 + 60));

    const modeText = item.flowMode === 'direct' || item.name.includes('直接') || item.name.includes('直达')
      ? '模式三：直接总机构审核（极速直达）'
      : item.flowMode === 'max_n' || item.name.includes('最多')
      ? '模式二：最多N级审核（上限截断）'
      : '模式一：逐级审核（组织树自适应）';

    const stageText = item.flowMode === 'direct' || item.name.includes('直接') || item.name.includes('直达')
      ? '2 级阶段（标准固定）'
      : item.flowMode === 'max_n' || item.name.includes('最多')
      ? '3 级阶段（上限3级截断）'
      : `${nodes.length} 级阶段（组织树自适应）`;

    const missingText = item.auditNodes?.[0]?.missingRule === 'terminate_error'
      ? '终止流程并报错'
      : item.auditNodes?.[0]?.missingRule === 'transfer_admin'
      ? '转交总机构管理员'
      : '跳过该节点';

    return {
      flowSteps,
      flowRows,
      stepsPerRow,
      panelWidth,
      summaryItems: [
        { label: '流程模式', value: modeText },
        { label: '启用状态', value: item.status, isStatus: true },
        { label: '审批阶段', value: stageText },
        { label: '终审评分机制', value: '总机构终审并评分（一体化统一节点）' },
        { label: '超时提醒配置', value: `全部节点开启提醒（${nodes.length} 个）` },
        { label: '无负责人策略', value: missingText },
      ],
    };
  };

  const renderAuditFlowLinearRows = (
    flowSteps: ReturnType<typeof buildAuditFlowLinearPreviewData>['flowSteps'],
    _flowRows: ReturnType<typeof buildAuditFlowLinearPreviewData>['flowRows'],
    _stepsPerRow: number,
    compact = false
  ) => {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-200/80 p-5 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[580px] gap-2">
          {flowSteps.map((step, index) => {
            const isStart = step.type === 'start';
            const isEnd = step.type === 'end';
            const isFinal = 'isFinalScoreNode' in step && Boolean(step.isFinalScoreNode);

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center text-center shrink-0 w-36">
                  {/* Step Circle */}
                  {isStart ? (
                    <div className="w-9 h-9 rounded-full bg-[#f6ffed] border border-[#b7eb8f] text-[#52c41a] flex items-center justify-center shadow-2xs">
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  ) : isEnd ? (
                    <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-300 text-gray-500 flex items-center justify-center shadow-2xs">
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  ) : isFinal ? (
                    <div className="relative flex flex-col items-center">
                      <span className="absolute -top-3.5 bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-300 whitespace-nowrap shadow-2xs z-10">
                        终审+评分一体
                      </span>
                      <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-300 text-amber-600 flex items-center justify-center shadow-2xs">
                        <Award className="w-5 h-5" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 text-[#1890ff] flex items-center justify-center font-bold text-xs shadow-2xs">
                      {index}
                    </div>
                  )}

                  {/* Step Title */}
                  <div className="mt-2 text-xs font-bold text-gray-900 leading-snug">
                    {step.title}
                  </div>

                  {/* Step Description */}
                  <div className="mt-1 text-[11px] text-gray-500 leading-normal px-1 break-words">
                    {step.description}
                  </div>
                </div>

                {/* Step Connector */}
                {index < flowSteps.length - 1 && (
                  <div className="flex-1 min-w-[24px] max-w-[60px] h-[2px] bg-gray-200 self-center -mt-6 rounded-full" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const handleSelectFlowMode = (mode: 'adaptive' | 'max_n' | 'direct', keepCurrentNameAndDesc = false) => {
    setFormFlowMode(mode);
    if (!keepCurrentNameAndDesc) {
      if (mode === 'adaptive') {
        setFormName('逐级审核流程（组织树自适应）');
        setFormDesc('本级机构提报后沿组织树逐级向上传递审核，最终由总机构终审');
      } else if (mode === 'max_n') {
        setFormName('最多3级快速审核流程');
        setFormDesc('【上限截断】下级机构提报后最多经过3个中间机构审核后直达');
      } else if (mode === 'direct') {
        setFormName('直接总机构审核通道');
        setFormDesc('【扁平直审】无需下级或中间机构审核，上报人提报后直接由总');
      }
    }

    if (mode === 'adaptive') {
      const nodes: AuditNode[] = [
        { id: 'an_1', nodeName: '本级机构初审', approverRole: '归属机构负责人', assigneeSource: 'org_owner', rejectStrategy: 'return_submitter', timeLimitMinutes: 15, dynamicMechanism: '动态匹配归属机构负责人', missingRule: 'skip', timeoutReminderEnabled: true },
        { id: 'an_2', nodeName: '上级机构逐级复核', approverRole: '归属机构负责人', assigneeSource: 'org_owner', rejectStrategy: 'return_submitter', timeLimitMinutes: 30, dynamicMechanism: '动态匹配归属机构负责人', missingRule: 'skip', timeoutReminderEnabled: true },
        { id: 'an_3', nodeName: '总机构终审并评分', approverRole: '总机构管理员', assigneeSource: 'role', rejectStrategy: 'return_submitter', timeLimitMinutes: 60, dynamicMechanism: '固定总机构管理员终审+评分', missingRule: 'skip', isFinalScoreNode: true, timeoutReminderEnabled: true }
      ];
      setFormAuditNodes(nodes);
      setSelectedAuditNodeId('an_1');
    } else if (mode === 'max_n') {
      const depth = formFlowDepth || 3;
      const nodes: AuditNode[] = [
        { id: 'an_201', nodeName: '基层机构初审', approverRole: '归属机构负责人', assigneeSource: 'org_owner', rejectStrategy: 'return_submitter', timeLimitMinutes: 15, dynamicMechanism: '动态匹配归属机构负责人', missingRule: 'skip', timeoutReminderEnabled: true },
        { id: 'an_202', nodeName: `中间机构流转 (最多${depth}级)`, approverRole: '归属机构负责人', assigneeSource: 'org_owner', rejectStrategy: 'return_submitter', timeLimitMinutes: 30, dynamicMechanism: '动态匹配归属机构负责人', missingRule: 'skip', timeoutReminderEnabled: true },
        { id: 'an_203', nodeName: '总机构终审并评分', approverRole: '总机构管理员', assigneeSource: 'role', rejectStrategy: 'return_submitter', timeLimitMinutes: 60, dynamicMechanism: '固定总机构管理员终审+评分', missingRule: 'skip', isFinalScoreNode: true, timeoutReminderEnabled: true }
      ];
      setFormAuditNodes(nodes);
      setSelectedAuditNodeId('an_201');
    } else if (mode === 'direct') {
      const nodes: AuditNode[] = [
        { id: 'an_301', nodeName: '发起上报直报', approverRole: '提报人员', assigneeSource: 'role', rejectStrategy: 'return_submitter', timeLimitMinutes: 10, dynamicMechanism: '上报人提交即进入终审通道', missingRule: 'skip', timeoutReminderEnabled: true },
        { id: 'an_302', nodeName: '总机构终审并评分', approverRole: '总机构管理员', assigneeSource: 'role', rejectStrategy: 'return_submitter', timeLimitMinutes: 60, dynamicMechanism: '总机构直审并打分一体化', missingRule: 'skip', isFinalScoreNode: true, timeoutReminderEnabled: true }
      ];
      setFormAuditNodes(nodes);
      setSelectedAuditNodeId('an_301');
    }
  };

  const handleMaxNDepthChange = (depth: number) => {
    setFormFlowDepth(depth);
    setFormAuditNodes(prev =>
      prev.map(node => {
        if (node.id === 'an_202' || node.nodeName.includes('中间机构')) {
          return { ...node, nodeName: `中间机构流转 (最多${depth}级)` };
        }
        return node;
      })
    );
  };

  const createDefaultAuditNode = (level: number): AuditNode => ({
    id: 'an_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    nodeName: level === 1 ? '一级初审' : level === 2 ? '二级复核' : `${level}级签发`,
    approverRole: level === 1 ? '初审员' : level === 2 ? '科室负责人' : '主管领导',
    assigneeSource: level === 2 ? 'org_owner' : 'role',
    assigneeUserName: '',
    rejectStrategy: 'return_submitter',
    timeLimitMinutes: level === 1 ? 15 : level === 2 ? 30 : 45
  });

  // Audit Flow Handlers
  const handleFlowDepthChange = (depth: number) => {
    const newDepth = Math.max(1, Math.min(10, depth));
    setFormFlowDepth(newDepth);
    setFormAuditNodes(prev => {
      if (newDepth === prev.length) return prev;
      if (newDepth > prev.length) {
        const added: AuditNode[] = [];
        for (let i = prev.length; i < newDepth; i++) {
          added.push(createDefaultAuditNode(i + 1));
        }
        return [...prev, ...added];
      } else {
        return prev.slice(0, newDepth);
      }
    });
    setSelectedAuditNodeId(prev => prev || formAuditNodes[0]?.id || null);
  };

  const handleUpdateAuditNode = (index: number, updates: Partial<AuditNode>) => {
    setFormAuditNodes(prev => prev.map((node, i) => (i === index ? { ...node, ...updates } : node)));
  };

  const handleAddAuditNode = () => {
    const nextLevel = formAuditNodes.length + 1;
    const newNode = createDefaultAuditNode(nextLevel);
    setFormAuditNodes(prev => [...prev, newNode]);
    setSelectedAuditNodeId(newNode.id);
    setFormFlowDepth(prev => prev + 1);
  };

  const handleDeleteAuditNode = (index: number) => {
    if (formAuditNodes.length <= 1) {
      alert('至少需要保留 1 个审批节点');
      return;
    }
    setFormAuditNodes(prev => {
      const next = prev.filter((_, i) => i !== index);
      setSelectedAuditNodeId(current => current === prev[index]?.id ? next[0]?.id || null : current);
      return next;
    });
    setFormFlowDepth(prev => prev - 1);
  };

  const handleMoveAuditNode = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= formAuditNodes.length) return;
    setFormAuditNodes(prev => {
      const next = [...prev];
      const current = next[index];
      next[index] = next[target];
      next[target] = current;
      return next;
    });
  };

  const handleDragAuditNode = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setFormAuditNodes(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleToggleOrgSetting = (orgId: string) => {
    setFormOrgSettings(prev =>
      prev.map(org => (org.orgId === orgId ? { ...org, enabled: !org.enabled } : org))
    );
  };

  const handleBatchToggleOrgSettings = (enabled: boolean) => {
    setFormOrgSettings(prev => prev.map(org => ({ ...org, enabled })));
  };

  const resetOrgPickerState = () => {
    setOrgPickerSearch('');
    setIsOrgPickerOpen(false);
    setOrgPickerRootId('root_city');
    setOrgPickerGroupId('city_units');
  };

  useEffect(() => {
    if (!isOrgPickerOpen) return;

    const syncOrgPickerPosition = () => {
      const anchor = orgPickerAnchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const panelWidth = Math.min(560, window.innerWidth - 96);
      const left = Math.min(Math.max(24, rect.left), Math.max(24, window.innerWidth - panelWidth - 24));
      const top = Math.min(rect.bottom + 8, Math.max(24, window.innerHeight - 24));
      setOrgPickerPosition({ top, left });
    };

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (orgPickerAnchorRef.current?.contains(target)) return;
      if (orgPickerPanelRef.current?.contains(target)) return;
      setIsOrgPickerOpen(false);
    };

    syncOrgPickerPosition();
    window.addEventListener('resize', syncOrgPickerPosition);
    window.addEventListener('scroll', syncOrgPickerPosition, true);
    document.addEventListener('mousedown', handlePointerDown, true);
    document.addEventListener('touchstart', handlePointerDown, true);

    return () => {
      window.removeEventListener('resize', syncOrgPickerPosition);
      window.removeEventListener('scroll', syncOrgPickerPosition, true);
      document.removeEventListener('mousedown', handlePointerDown, true);
      document.removeEventListener('touchstart', handlePointerDown, true);
    };
  }, [isOrgPickerOpen]);

  const selectedOrgSettings = formOrgSettings.filter(org => org.enabled);
  const orgPickerQuery = orgPickerSearch.trim().toLowerCase();
  const isOrgMatchedInPicker = (org?: OrgScopeSetting) =>
    !orgPickerQuery || !!org?.orgName.toLowerCase().includes(orgPickerQuery);

  const handleAddCustomOrg = () => {
    if (!newCustomOrgName.trim()) return;
    const newOrg: OrgScopeSetting = {
      orgId: 'org_' + Date.now(),
      orgName: newCustomOrgName.trim(),
      enabled: true
    };
    setFormOrgSettings(prev => [...prev, newOrg]);
    setNewCustomOrgName('');
  };

  const renderFormStatusSegment = (label = '启用状态 *') => (
    <div>
      <label className="block text-gray-700 font-medium mb-1">{label}</label>
      <div className="grid h-[31px] grid-cols-2 gap-1 rounded border border-gray-200 bg-gray-50 p-0.5">
        {(['启用', '停用'] as const).map(status => {
          const isActive = formScoreStatus === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setFormScoreStatus(status)}
              className={`rounded-[3px] border text-xs font-bold transition-colors cursor-pointer ${
                isActive
                  ? status === '启用'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-300 shadow-sm'
                  : 'bg-transparent text-gray-500 border-transparent hover:bg-white hover:border-blue-200 hover:text-[#1E5ABB]'
              }`}
            >
              {status}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Dynamically query enabled report templates from 'report_template' module
  const enabledReportTemplates = (dataStore.report_template || []).filter(
    t => t.status === '启用' && (t.templateType === '报送' || !t.templateType)
  );

  // Preview Modal State
  const [previewItem, setPreviewItem] = useState<ConfigModuleItem | null>(null);
  const [auditFlowPreviewItem, setAuditFlowPreviewItem] = useState<ConfigModuleItem | null>(null);

  // Score level helper handlers
  const getDefaultScoreForLevel = (index: number, totalScore = formTotalScore) => {
    const step = totalScore >= 100 ? 10 : Math.max(1, Math.round(totalScore * 0.2));
    return Math.max(0, totalScore - index * step);
  };

  const handleLevelCountChange = (count: number) => {
    const newCount = Math.max(2, Math.min(10, count));
    setFormLevelCount(newCount);
    setFormScoreLevels(prev => {
      if (newCount === prev.length) return prev;
      if (newCount > prev.length) {
        const added: ScoreLevel[] = [];
        for (let i = prev.length; i < newCount; i++) {
          added.push({
            id: 'sl_' + Date.now() + '_' + i,
            levelName: `${i + 1}等`,
            score: getDefaultScoreForLevel(i),
            description: '请填写该等级的评定说明'
          });
        }
        return [...prev, ...added];
      } else {
        return prev.slice(0, newCount);
      }
    });
  };

  const handleUpdateScoreLevel = (index: number, updates: Partial<ScoreLevel>) => {
    setFormScoreLevels(prev => prev.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  };

  const handleAddScoreLevel = () => {
    const nextIdx = formScoreLevels.length + 1;
    setFormScoreLevels(prev => [
      ...prev,
      {
        id: 'sl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        levelName: `${nextIdx}等`,
        score: getDefaultScoreForLevel(nextIdx - 1),
        description: '请填写该等级的评定说明'
      }
    ]);
    setFormLevelCount(prev => prev + 1);
  };

  const handleDeleteScoreLevel = (index: number) => {
    if (formScoreLevels.length <= 2) {
      alert('至少需要保留 2 个得分等级');
      return;
    }
    setFormScoreLevels(prev => prev.filter((_, i) => i !== index));
    setFormLevelCount(prev => prev - 1);
  };

  const handleDropScoreLevel = (targetIndex: number) => {
    if (draggingScoreLevelIndex === null || draggingScoreLevelIndex === targetIndex) {
      setDraggingScoreLevelIndex(null);
      return;
    }
    setFormScoreLevels(prev => {
      const next = [...prev];
      const [moved] = next.splice(draggingScoreLevelIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDraggingScoreLevelIndex(null);
  };

  // Field element handlers
  const handleAddField = (type: FieldType) => {
    const meta = getFieldTypeMeta(type);
    const newField: TemplateField = {
      id: 'f_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: `${meta.label}${formFields.length + 1}`,
      type: type,
      required: true,
      placeholder: getDefaultFieldPlaceholder(type),
      options: type === 'identity'
        ? [...systemRoleOptions]
        : type === 'select'
        ? ['选项一', '选项二', '选项三']
        : undefined
    };
    setFormFields(prev => [...prev, newField]);
    setFieldAddNotice(`${meta.label}添加成功`);
  };

  const handleUpdateField = (index: number, updates: Partial<TemplateField>) => {
    setFormFields(prev => prev.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  };

  const handleDeleteField = (index: number) => {
    const removedFieldId = formFields[index]?.id;
    setFormFields(prev => prev.filter((_, i) => i !== index));
    if (removedFieldId) {
      setPreviewValues(prev => {
        const next = { ...prev };
        delete next[removedFieldId];
        return next;
      });
    }
  };

  const handlePreviewValueChange = (fieldId: string, value: string) => {
    setPreviewValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const openPreviewItem = (item: ConfigModuleItem) => {
    setPreviewValues({});
    setPreviewItem(item);
  };

  const handleDropField = (targetIndex: number) => {
    if (draggingFieldIndex === null || draggingFieldIndex === targetIndex) {
      setDraggingFieldIndex(null);
      return;
    }
    setFormFields(prev => {
      const next = [...prev];
      const [moved] = next.splice(draggingFieldIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDraggingFieldIndex(null);
  };

  const handleLoadStandardPreset = () => {
    setFormFields((formTemplateType === '激活' ? standardActivationFields : standardReportFields).map(field => ({
      ...field,
      options: field.options ? [...field.options] : undefined
    })));
    setFieldAddNotice('已使用标准模板');
  };

  // Get active module title
  const currentModuleLabel = moduleList.find(m => m.id === activeModule)?.label || '配置项';

  // Current list for active module
  const currentList = dataStore[activeModule] || (activeModule === 'data_dict' ? (dataStore.data_dict || []) : []);

  // Filtered list
  const filteredList = currentList.filter(item => {
    if (activeModule === 'report_template' && templateTypeFilter !== 'all' && (item.templateType || '报送') !== templateTypeFilter) {
      return false;
    }

    const matchesQuery =
      ['audit_score', 'data_dict', 'audit_flow'].includes(activeModule)
        ? true
        : item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.dictCode && item.dictCode.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeModule === 'data_dict' && dictSubCategoryFilter !== 'all') {
      const cat = item.dictCategory || 'reject_reason';
      return matchesQuery && cat === dictSubCategoryFilter;
    }
    return matchesQuery;
  });

  const statsMetrics = (dataStore.stats_metric || []).filter(item => {
    if (metricCategoryFilter !== 'all' && item.metricCategory !== metricCategoryFilter) return false;
    if (!metricNameQuery) return true;
    const q = metricNameQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.displayName || '').toLowerCase().includes(q)
    );
  });
  const activeMetricDetail = statsMetrics.find(item => item.id === selectedMetricId);
  const selectedAuditFlow = (dataStore.audit_flow || []).find(item => item.id === selectedAuditFlowId);
  const selectedAuditFlowPreviewData = selectedAuditFlow ? buildAuditFlowLinearPreviewData(selectedAuditFlow) : null;
  const selectedTemplate = (dataStore.report_template || []).find(item => item.id === selectedTemplateId);
  const auditFlowItems = dataStore.audit_flow || [];
  const enabledAuditFlows = auditFlowItems.filter(item => item.status === '启用');
  const defaultAuditFlow = enabledAuditFlows.find(item => item.isDefault);
  const orgCoverageUniverse = [{ orgId: 'root_city', orgName: '台中市网信办', enabled: true }, ...defaultOrgList];
  const configuredOrgIds = new Set(
    enabledAuditFlows
      .filter(item => item.orgApplyMode === 'specific_orgs')
      .flatMap(item => (item.orgSettings || []).filter(org => org.enabled).map(org => org.orgId))
  );
  const auditFlowCoverageSummary = {
    enabledFlowCount: enabledAuditFlows.length,
    specificOrgCount: configuredOrgIds.size,
    fallbackOrgCount: defaultAuditFlow ? Math.max(0, orgCoverageUniverse.length - configuredOrgIds.size) : 0,
    missingOrgCount: defaultAuditFlow ? 0 : Math.max(0, orgCoverageUniverse.length - configuredOrgIds.size),
  };

  const renderUserReportPreview = (
    fields: TemplateField[],
    emptyText = '请先配置表单字段',
    templateType: ConfigModuleItem['templateType'] = formTemplateType,
    variant: 'compact' | 'full' = 'compact'
  ) => (
    <div className="w-full max-w-[420px] mx-auto bg-white rounded-2xl border border-gray-200/90 p-3 shadow-2xs transition-all">
      <div className="rounded-xl overflow-hidden bg-[#EEF2F7] flex flex-col border border-slate-200/60">
        <div className="bg-[#1E5ABB] text-white py-3 px-4 text-center select-none shadow-xs">
          <span className="text-sm font-bold tracking-wide">{templateType === '激活' ? '账号激活' : (formName.trim() || '快速上报')}</span>
        </div>

        <div className="p-3.5 space-y-3 bg-[#EEF2F7]">
          {fields.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-dashed border-slate-200">
              {emptyText}
            </div>
          ) : (
            fields.map((field, idx) => {
              const fieldValue = previewValues[field.id] || '';
              const meta = getFieldTypeMeta(field.type);
              const IconComp = meta.icon;
              const isLongText = field.type === 'text' && /内容|摘要|简述|说明|情况|描述|详情/.test(field.name);
              const selectOptions = field.options && field.options.length > 0
                ? field.options.filter(option => option.trim())
                : ['一般信息', '重点关注', '紧急处置'];

              return (
                <div key={field.id || idx} className="bg-white rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-100 space-y-2.5 transition-all">
                  <div className="flex items-center gap-1.5 text-xs text-slate-800 font-bold">
                    <IconComp className="w-3.5 h-3.5 text-[#1E5ABB] shrink-0" />
                    <span className="truncate">{field.name}</span>
                    {field.required && <span className="text-rose-500 font-bold ml-0.5">*</span>}
                  </div>

                  {field.type === 'text' && (
                    isLongText ? (
                      <textarea
                        rows={3}
                        value={fieldValue}
                        onChange={(e) => handlePreviewValueChange(field.id, e.target.value)}
                        placeholder={field.placeholder || `请输入${field.name}`}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E5ABB] resize-none bg-white placeholder:text-slate-400"
                      />
                    ) : (
                      <input
                        type="text"
                        value={fieldValue}
                        onChange={(e) => handlePreviewValueChange(field.id, e.target.value)}
                        placeholder={field.placeholder || `请输入${field.name}`}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E5ABB] bg-white placeholder:text-slate-400"
                      />
                    )
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      value={fieldValue}
                      onChange={(e) => handlePreviewValueChange(field.id, e.target.value)}
                      placeholder={field.placeholder || '请输入传播量/阅读量等数据'}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E5ABB] bg-white placeholder:text-slate-400"
                    />
                  )}

                  {['phone', 'id_card', 'bank_card', 'email'].includes(field.type) && (
                    <input
                      type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                      value={fieldValue}
                      onChange={(e) => handlePreviewValueChange(field.id, e.target.value)}
                      placeholder={field.placeholder || getDefaultFieldPlaceholder(field.type)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E5ABB] bg-white placeholder:text-slate-400"
                    />
                  )}

                  {field.type === 'address' && (
                    <textarea
                      rows={2}
                      value={fieldValue}
                      onChange={(e) => handlePreviewValueChange(field.id, e.target.value)}
                      placeholder={field.placeholder || getDefaultFieldPlaceholder(field.type)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E5ABB] resize-none bg-white placeholder:text-slate-400"
                    />
                  )}

                  {field.type === 'gender' && (
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      {['男', '女'].map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handlePreviewValueChange(field.id, option)}
                          className={`py-2 text-center rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                            fieldValue === option
                              ? 'bg-blue-50/80 border-[#1E5ABB] text-[#1E5ABB] font-bold shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:text-[#1E5ABB]'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {field.type === 'date' && (
                    <div className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{fieldValue || field.placeholder || '年 /月/日 --:--'}</span>
                      </div>
                      <Calendar className="w-3.5 h-3.5 text-slate-700" />
                    </div>
                  )}

                  {field.type === 'file' && (
                    <div className="border border-dashed border-slate-300 bg-white rounded-xl p-5 text-center flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer hover:border-blue-400 group">
                      <Paperclip className="w-7 h-7 text-slate-400 -rotate-45 group-hover:text-[#1E5ABB] transition-colors stroke-[1.5]" />
                      <span className="text-xs font-medium text-slate-700">
                        上传图片、视频或证明材料
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {field.placeholder || '支持图片、视频、PDF证明文档'}
                      </span>
                    </div>
                  )}

                  {field.type === 'link' && (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <input
                        type="url"
                        value={fieldValue}
                        onChange={(e) => handlePreviewValueChange(field.id, e.target.value)}
                        placeholder={field.placeholder || 'https://...'}
                        className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E5ABB] bg-white placeholder:text-slate-400"
                      />
                    </div>
                  )}

                  {field.type === 'select' && (
                    <div className="relative">
                      <select
                        value={fieldValue}
                        onChange={(e) => handlePreviewValueChange(field.id, e.target.value)}
                        className="w-full appearance-none px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-[#1E5ABB] transition-colors pr-8 cursor-pointer"
                      >
                        <option value="" disabled hidden>{field.placeholder || '请选择事件分类'}</option>
                        {selectOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none text-slate-700">
                        <ChevronDown className="w-4 h-4 text-slate-800" />
                      </div>
                    </div>
                  )}

                  {field.type === 'identity' && (
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {(field.options && field.options.length > 0 ? field.options : systemRoleOptions).map(option => {
                        const selectedRoles = fieldValue ? fieldValue.split('、').filter(Boolean) : [];
                        const checked = selectedRoles.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              const next = checked
                                ? selectedRoles.filter(role => role !== option)
                                : [...selectedRoles, option];
                              handlePreviewValueChange(field.id, next.join('、'));
                            }}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                              checked
                                ? 'bg-blue-50/80 border-[#1E5ABB] text-[#1E5ABB] font-bold shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:text-[#1E5ABB]'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  const enabledStatsMetrics = (dataStore.stats_metric || []).filter(item => item.status === '启用');
  const getMetricPageLabel = (page: MetricDisplayPage) => metricPageOptions.find(item => item.id === page)?.label || page;
  const getMetricCalcMeta = (calcType?: MetricCalcType) => metricCalcOptions.find(item => item.id === calcType) || metricCalcOptions[0];
  const getMetricCategoryLabel = (category?: MetricCategory) => metricCategoryOptions.find(item => item.id === category)?.label || '未分类';
  const getMetricPeriodLabel = (period?: ConfigModuleItem['period']) => metricPeriodOptions.find(item => item.id === period)?.label || '今日';
  const getDictCategoryMeta = (category?: string) => dictCategoryOptions.find(item => item.id === (category || 'reject_reason')) || dictCategoryOptions[0];
  const getPersonnelRoleGroup = (item: Partial<ConfigModuleItem>): '上报员' | '审核员' => {
    if (item.personnelRoleGroup === '上报员' || item.personnelRoleGroup === '审核员') return item.personnelRoleGroup;
    const text = `${item.name} ${item.description || ''}`;
    return text.includes('审核员') ? '审核员' : '上报员';
  };
  const getPersonnelRoleGroupLabel = (item: ConfigModuleItem) => {
    return getPersonnelRoleGroup(item);
  };
  const getDictCategoryBadge = (category?: string) => {
    const tone = getDictCategoryMeta(category).tone;
    if (tone === 'rose') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (tone === 'purple') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (tone === 'blue') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-amber-50 text-amber-800 border-amber-200';
  };
  const buildDictCode = (category: string, order?: number) => {
    const meta = getDictCategoryMeta(category);
    const nextOrder = order || ((dataStore.data_dict || []).filter(item => (item.dictCategory || 'reject_reason') === category).length + 1);
    return `${meta.codePrefix}${String(nextOrder).padStart(3, '0')}`;
  };

  const toggleMetricPage = (page: MetricDisplayPage) => {
    setMetricPages(prev =>
      prev.includes(page) ? prev.filter(item => item !== page) : [...prev, page]
    );
  };

  const openMetricModal = () => {
    setMetricEditingItem(null);
    setMetricName('');
    setMetricDisplayName('');
    setMetricCalcType('count');
    setMetricUnit('件');
    setMetricPeriod('today');
    setMetricPages(['home_kpi']);
    setMetricDesc('');
    setMetricModalOpen(true);
  };

  const handleSaveMetric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metricName.trim() || metricPages.length === 0) return;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const metricItem: ConfigModuleItem = {
      id: metricEditingItem?.id || String(Date.now()),
      name: metricName.trim(),
      displayName: metricDisplayName.trim() || metricName.trim(),
      calcType: metricCalcType,
      unit: metricUnit,
      period: metricPeriod,
      pages: metricPages,
      isDefault: metricEditingItem?.isDefault || false,
      status: '启用',
      updateTime: nowStr,
      description: metricDesc.trim() || getMetricCalcMeta(metricCalcType).description
    };

    commitDataStore(prev => ({
      ...prev,
      stats_metric: metricEditingItem
        ? (prev.stats_metric || []).map(item => (item.id === metricEditingItem.id ? metricItem : item))
        : [...(prev.stats_metric || []), metricItem]
    }));
    setMetricModalOpen(false);
  };

  const handleMetricBindingChange = (binding: MetricDisplayBinding, metricId: string) => {
    const metric = (dataStore.stats_metric || []).find(item => item.id === metricId);
    if (!metric) return;
    setMetricBindings(prev =>
      prev.map(item =>
        item.page === binding.page && item.slotName === binding.slotName
          ? { ...item, metricId, metricName: metric.name }
          : item
      )
    );
  };

  const handleRestoreMetricDefaults = () => {
    const defaults = getDefaultMetricBindings();
    setMetricBindings(prev =>
      restoreTargetPage === 'all'
        ? defaults
        : [
            ...prev.filter(item => item.page !== restoreTargetPage),
            ...defaults.filter(item => item.page === restoreTargetPage)
          ]
    );
  };

  // Handle Toggle Status
  const handleToggleStatus = (id: string) => {
    commitDataStore(prev => {
      const list = prev[activeModule] || [];
      const targetItem = list.find(i => i.id === id);
      if (!targetItem) return prev;

      // Special constraint for value_added: Cannot toggle if not activated (未开通)
      // 全开放启禁模式（valueAddedAllOperable）下所有增值业务均可直接启禁
      if (!valueAddedAllOperable && activeModule === 'value_added' && targetItem.activatedStatus === '未开通') {
        alert('该增值业务属于“未开通”状态，无法进行启禁操作。如需开通请联系对应的销售人员！');
        return prev;
      }

      const newStatus = targetItem.status === '启用' ? '停用' : '启用';

      if (activeModule === 'login_method' && newStatus === '停用' && list.filter(item => item.status === '启用').length <= 1) {
        alert('至少需要保留一种启用中的登录方式');
        return prev;
      }

      // 全开放启禁模式增值业务：启禁开关与开通状态联动（启用=已开通 / 停用=未开通）
      if (activeModule === 'value_added' && valueAddedAllOperable) {
        return {
          ...prev,
          value_added: list.map(item =>
            item.id === id
              ? {
                  ...item,
                  status: newStatus,
                  activatedStatus: newStatus === '启用' ? '已开通' : '未开通',
                  updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
                }
              : item
          )
        };
      }

      return {
        ...prev,
        [activeModule]: list.map(item =>
          item.id === id
            ? {
                ...item,
                status: newStatus,
                updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
              }
            : item
        )
      };
    });
  };

  // Handle Delete
  const handleDelete = (item: ConfigModuleItem) => {
    if (!isGlobalScope && item.isDefault) {
      alert('系统默认配置项受平台全局管控，机构端不可删除！');
      return;
    }
    if (confirm(`确定要删除配置项“${item.name}”吗？`)) {
      commitDataStore(prev => ({
        ...prev,
        [activeModule]: prev[activeModule].filter(i => i.id !== item.id)
      }));
    }
  };

  // Handle Open Modal for Add / Edit
  const openAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormTemplateType('报送');
    setFormDesc('');
    setModalActiveTab('build');
    setPreviewValues({});

    if (activeModule === 'report_template') {
      setFormScoreStatus('启用');
      handleLoadStandardPreset();
    } else if (activeModule === 'data_dict' || activeModule === 'reject_reason') {
      const targetCat = dictSubCategoryFilter !== 'all' ? dictSubCategoryFilter : 'reject_reason';
      const targetMeta = getDictCategoryMeta(targetCat);
      const count = (dataStore.data_dict || []).filter(i => (i.dictCategory || 'reject_reason') === targetCat).length + 1;
      const nextPersonnelRoleGroup: '上报员' | '审核员' = '上报员';
      setFormName('');
      setFormDictCategory(targetCat);
      setFormDictCategoryName(targetMeta.label);
      setFormDictCode(buildDictCode(targetCat, count));
      setFormSortOrder(count);
      setFormScoreStatus('启用');
      setFormPersonnelRoleGroup(nextPersonnelRoleGroup);
      setFormDesc(
        targetCat === 'reject_reason'
          ? '审核驳回时展示给审核员选择，并作为退回原因同步给上报人。'
          : targetCat === 'info_category'
            ? `${nextPersonnelRoleGroup}角色标签`
            : targetMeta.description
      );
    } else if (activeModule === 'audit_score') {
      setFormName(isGlobalScope ? '百分制打分规则组' : '自定义百分制打分规则组');
      setFormDesc('按审核结果命中一个评分等级，设为启用后替代现有打分标准');
      setFormTotalScore(100);
      setFormLevelCount(5);
      setFormScoreStatus('停用');
      const defaultTpl = enabledReportTemplates[0];
      setFormRelatedTemplateId(defaultTpl ? defaultTpl.id : '1');
      setFormScoreLevels([
        { id: 'sl_1', levelName: '一等（特优）', score: 100, description: '特优级标准' },
        { id: 'sl_2', levelName: '二等（优秀）', score: 90, description: '优秀级标准' },
        { id: 'sl_3', levelName: '三等（良好）', score: 80, description: '良好级标准' },
        { id: 'sl_4', levelName: '四等（合格）', score: 70, description: '合格级标准' },
        { id: 'sl_5', levelName: '五等（基本）', score: 60, description: '基本级标准' }
      ]);
    } else if (activeModule === 'audit_flow') {
      setFormName('逐级审核流程（组织树自适应）');
      setFormDesc('本级机构提报后沿组织树逐级向上传递审核，最终由总机构终审');
      setFormScoreStatus('启用');
      setFormFlowMode('adaptive');
      const defaultTpl = enabledReportTemplates[0];
      setFormRelatedTemplateId(defaultTpl ? defaultTpl.id : '1');
      setFormTemplateApplyMode('all_report_templates');
      setFormFlowDepth(3);
      setFormOrgApplyMode('all_orgs');
      setFormOrgSettings(defaultOrgList);
      setFormOwnerMissingStrategy('skip_to_next');
      setFormOwnerMissingFallbackRole('机构管理员');
      setFormOwnerMissingFallbackUserName('');
      resetOrgPickerState();
      const defaultFlowNodes: AuditNode[] = [
        { id: 'an_1', nodeName: '本级机构初审', approverRole: '归属机构负责人', assigneeSource: 'org_owner', rejectStrategy: 'return_submitter', timeLimitMinutes: 15, dynamicMechanism: '动态匹配归属机构负责人', missingRule: 'skip', timeoutReminderEnabled: true },
        { id: 'an_2', nodeName: '上级机构逐级复核', approverRole: '归属机构负责人', assigneeSource: 'org_owner', rejectStrategy: 'return_submitter', timeLimitMinutes: 30, dynamicMechanism: '动态匹配归属机构负责人', missingRule: 'skip', timeoutReminderEnabled: true },
        { id: 'an_3', nodeName: '总机构终审并评分', approverRole: '总机构管理员', assigneeSource: 'role', rejectStrategy: 'return_submitter', timeLimitMinutes: 60, dynamicMechanism: '固定总机构管理员终审+评分', missingRule: 'skip', isFinalScoreNode: true, timeoutReminderEnabled: true }
      ];
      setFormAuditNodes(defaultFlowNodes);
      setSelectedAuditNodeId(defaultFlowNodes[0].id);
    } else if (activeModule === 'evaluation_rule') {
      setFormName('人员考核配置');
      setFormDesc('用于配置人员月度目标上报量和数量、质量评分权重，考核页面按周期自动计算人员得分、等级和排名。');
      setFormEvalDimension('person');
      setFormEvalTarget('person');
      setFormCoverageTarget(80);
      setFormEnabledPeriods(['day', 'week', 'month', 'quarter', 'year']);
      applyEvaluationDayTarget(1);
      setFormEvalTotalScore(100);
      setFormEvalMetricRules(getDefaultEvaluationMetricRules('person'));
      setFormEvalGrades(defaultEvaluationGrades);
      setFormScoreStatus('启用');
      setFormIndicators([]);
    } else if (activeModule === 'value_added') {
      setFormName('');
      setFormDictCode(`VA_00${((dataStore.value_added || []).length + 1)}`);
      setFormDesc('请填写增值扩展业务功能介绍与申请条件说明...');
    } else {
      setFormFields([]);
    }
    setIsModalOpen(true);
  };

  const openEditModal = (item: ConfigModuleItem) => {
    if (!isGlobalScope && item.isDefault && activeModule !== 'evaluation_rule' && activeModule !== 'login_method') {
      alert('系统默认配置受平台全局统一管控，机构端仅提供查看功能。如需个性化格式，请新建“自定义”规则。');
      openPreviewItem(item);
      return;
    }
    setEditingItem(item);
    setFormName(item.name);
    setFormTemplateType(item.templateType || '报送');
    setFormDesc(item.description || '');
    setModalActiveTab('build');
    setPreviewValues({});

    if (activeModule === 'data_dict' || activeModule === 'reject_reason') {
      setFormDictCategory(item.dictCategory || 'reject_reason');
      setFormDictCategoryName(item.dictCategoryName || '拒绝理由');
      setFormDictCode(item.dictCode || `DICT_${item.id}`);
      setFormSortOrder(item.sortOrder || 1);
      setFormScoreStatus(item.status);
      setFormPersonnelRoleGroup(getPersonnelRoleGroup(item));
    } else if (activeModule === 'login_method') {
      setFormScoreStatus(item.status);
      setFormLoginConfigStatus(item.configStatus || '待配置');
    } else if (activeModule === 'value_added') {
      setFormDictCode(item.dictCode || `VA_${item.id}`);
    } else if (activeModule === 'report_template') {
      setFormScoreStatus(item.status);
      if (item.fields && item.fields.length > 0) {
        setFormFields(item.fields);
      } else {
        handleLoadStandardPreset();
      }
    } else if (activeModule === 'audit_score') {
      setFormTotalScore(item.totalScore || 100);
      setFormLevelCount(item.levelCount || (item.scoreLevels ? item.scoreLevels.length : 5));
      setFormScoreStatus(item.status);
      const defaultTpl = enabledReportTemplates[0];
      setFormRelatedTemplateId(item.relatedTemplateId || (defaultTpl ? defaultTpl.id : '1'));
      setFormScoreLevels(item.scoreLevels && item.scoreLevels.length > 0 ? item.scoreLevels : [
        { id: 'sl_1', levelName: '一等', score: 30, description: '' },
        { id: 'sl_2', levelName: '二等', score: 25, description: '' },
        { id: 'sl_3', levelName: '三等', score: 20, description: '' },
        { id: 'sl_4', levelName: '四等', score: 15, description: '' },
        { id: 'sl_5', levelName: '五等', score: 10, description: '' }
      ]);
    } else if (activeModule === 'audit_flow') {
      setFormScoreStatus(item.status);
      const mode = item.flowMode || (item.name.includes('直接') || item.name.includes('直达') ? 'direct' : item.name.includes('最多') ? 'max_n' : 'adaptive');
      setFormFlowMode(mode);
      const defaultTpl = enabledReportTemplates[0];
      setFormRelatedTemplateId(item.relatedTemplateId || (defaultTpl ? defaultTpl.id : '1'));
      setFormTemplateApplyMode(item.templateApplyMode || (item.relatedTemplateId === 'all_report_templates' ? 'all_report_templates' : 'single_template'));
      setFormFlowDepth(item.flowDepth || (item.auditNodes ? item.auditNodes.length : 3));
      setFormOrgApplyMode(item.orgApplyMode || 'all_orgs');
      setFormOrgSettings(item.orgSettings && item.orgSettings.length > 0 ? item.orgSettings : defaultOrgList);
      setFormOwnerMissingStrategy(item.ownerMissingStrategy || 'skip_to_next');
      setFormOwnerMissingFallbackRole(item.ownerMissingFallbackRole || '机构管理员');
      setFormOwnerMissingFallbackUserName(item.ownerMissingFallbackUserName || '');
      resetOrgPickerState();
      const editFlowNodes = item.auditNodes && item.auditNodes.length > 0
        ? item.auditNodes.map(node => ({
            ...node,
            assigneeSource: node.assigneeSource || 'role',
            rejectStrategy: node.rejectStrategy || 'return_submitter'
          }))
        : [
            { id: 'an_1', nodeName: '本级机构初审', approverRole: '归属机构负责人', assigneeSource: 'org_owner' as const, rejectStrategy: 'return_submitter' as const, timeLimitMinutes: 15, dynamicMechanism: '动态匹配归属机构负责人', missingRule: 'skip' as const, timeoutReminderEnabled: true },
            { id: 'an_2', nodeName: '上级机构逐级复核', approverRole: '归属机构负责人', assigneeSource: 'org_owner' as const, rejectStrategy: 'return_submitter' as const, timeLimitMinutes: 30, dynamicMechanism: '动态匹配上级机构负责人', missingRule: 'skip' as const, timeoutReminderEnabled: true },
            { id: 'an_3', nodeName: '总机构终审并评分', approverRole: '总机构管理员', assigneeSource: 'role' as const, rejectStrategy: 'return_submitter' as const, timeLimitMinutes: 60, dynamicMechanism: '固定总机构管理员终审+评分', missingRule: 'transfer_admin' as const, isFinalScoreNode: true, timeoutReminderEnabled: true }
          ];
      setFormAuditNodes(editFlowNodes);
      setSelectedAuditNodeId(editFlowNodes[0]?.id || null);
    } else if (activeModule === 'evaluation_rule') {
      const dim = item.evalDimension || 'category';
      setFormEvalDimension(dim);
      const target = item.evalTarget || (dim === 'org' ? 'org' : dim === 'category' ? 'category' : 'person');
      setFormEvalTarget(target);
      setFormCoverageTarget(item.coverageTarget || 80);
      setFormEnabledPeriods(item.enabledPeriods && item.enabledPeriods.length > 0 ? item.enabledPeriods : ['day', 'week', 'month', 'quarter', 'year']);
      const dayTarget = item.targetDay ?? item.targetValue ?? 1;
      setFormTargetDay(dayTarget);
      setFormTargetWeek(item.targetWeek ?? dayTarget * 7);
      setFormTargetMonth(item.targetMonth ?? dayTarget * 30);
      setFormTargetQuarter(item.targetQuarter ?? dayTarget * 90);
      setFormTargetYear(item.targetYear ?? dayTarget * 365);
      setFormCustomTargetPeriods(item.customTargetPeriods || []);
      setFormEvalTotalScore(item.evalTotalScore || 100);
      setFormEvalMetricRules(item.evalMetricRules && item.evalMetricRules.length > 0 ? item.evalMetricRules : getDefaultEvaluationMetricRules(target));
      setFormEvalGrades(item.evalGrades && item.evalGrades.length > 0 ? item.evalGrades : defaultEvaluationGrades);
      setFormScoreStatus(item.status);
      setFormIndicators([]);
    } else {
      setFormFields([]);
    }
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (activeModule === 'login_method' && editingItem) {
      const nextStatus = formScoreStatus;
      const enabledCount = (dataStore.login_method || []).filter(item => item.status === '启用').length;
      if (editingItem.status === '启用' && nextStatus === '停用' && enabledCount <= 1) {
        alert('至少需要保留一种启用中的登录方式');
        return;
      }

      commitDataStore(prev => ({
        ...prev,
        login_method: (prev.login_method || []).map(item =>
          item.id === editingItem.id
            ? {
                ...item,
                name: formName.trim(),
                status: nextStatus,
                configStatus: formLoginConfigStatus,
                updateTime: nowStr,
                description: formDesc.trim() || item.description
              }
            : item
        )
      }));
      setIsModalOpen(false);
      return;
    }

    if (activeModule === 'value_added') {
      const vaItem: ConfigModuleItem = {
        id: editingItem ? editingItem.id : String(Date.now()),
        name: formName.trim(),
        dictCategoryName: '增值业务',
        dictCode: formDictCode.trim() || `VA_${Date.now()}`,
        isDefault: editingItem ? editingItem.isDefault : false,
        status: editingItem ? editingItem.status : '启用',
        updateTime: nowStr,
        description: formDesc.trim() || '自定义增值扩展业务配置与申请条件'
      };

      commitDataStore(prev => ({
        ...prev,
        value_added: editingItem
          ? (prev.value_added || []).map(i => (i.id === editingItem.id ? vaItem : i))
          : [...(prev.value_added || []), vaItem]
      }));
      setIsModalOpen(false);
      return;
    }

    if (activeModule === 'data_dict' || activeModule === 'reject_reason') {
      const catMeta = getDictCategoryMeta(formDictCategory);
      const catName = catMeta.label || formDictCategoryName || '拒绝理由';
      const personnelRoleGroup = formDictCategory === 'info_category' ? getPersonnelRoleGroup({ id: '', name: formName, description: formDesc, personnelRoleGroup: formPersonnelRoleGroup }) : undefined;

      const dictItem: ConfigModuleItem = {
        id: editingItem ? editingItem.id : String(Date.now()),
        name: formName.trim(),
        dictCategory: formDictCategory,
        dictCategoryName: catName,
        dictCode: formDictCode.trim() || buildDictCode(formDictCategory, formSortOrder),
        sortOrder: formSortOrder,
        personnelRoleGroup,
        isDefault: editingItem ? editingItem.isDefault : false,
        status: formScoreStatus,
        updateTime: nowStr,
        description: formDesc.trim() || (personnelRoleGroup ? `${personnelRoleGroup}角色标签` : '自定义数据字典条目配置')
      };

      commitDataStore(prev => ({
        ...prev,
        data_dict: editingItem
          ? (prev.data_dict || []).map(i => (i.id === editingItem.id ? dictItem : i))
          : [...(prev.data_dict || []), dictItem]
      }));
      setIsModalOpen(false);
      return;
    }

    if (activeModule === 'evaluation_rule') {
      const weightTotal = formEvalMetricRules.filter(rule => rule.enabled).reduce((sum, rule) => sum + (Number(rule.weight) || 0), 0);
      if (weightTotal !== 100) {
        alert('启用统计指标的权重合计需要等于 100%');
        return;
      }
      if (formEnabledPeriods.length === 0) {
        alert('请至少选择一个启用周期');
        return;
      }
      if (formEvalMetricRules.filter(rule => rule.enabled).length === 0) {
        alert('请至少启用一个统计指标');
        return;
      }
      const invalidGrade = formEvalGrades.some(grade => grade.minScore < 0 || grade.maxScore > formEvalTotalScore || grade.minScore > grade.maxScore);
      if (invalidGrade) {
        alert('考核等次分值区间需在 0 到总分值之间，且最小分不能大于最大分');
        return;
      }
      const evalDimensionMap: Record<EvaluationTarget, 'person' | 'org' | 'category'> = {
        person: 'person',
        org: 'org',
        category: 'category'
      };
      const evalItem: ConfigModuleItem = {
        id: editingItem ? editingItem.id : String(Date.now()),
        name: formName.trim(),
        isDefault: editingItem ? editingItem.isDefault : true,
        status: formScoreStatus,
        updateTime: nowStr,
        description: formDesc.trim() || '用于配置考核目标值和评分权重，考核管理页面按周期自动计算得分。',
        evalDimension: evalDimensionMap[formEvalTarget],
        evalTarget: formEvalTarget,
        targetDay: formTargetDay,
        targetWeek: formTargetWeek,
        targetMonth: formTargetMonth,
        targetQuarter: formTargetQuarter,
        targetYear: formTargetYear,
        customTargetPeriods: formCustomTargetPeriods,
        targetValue: formTargetMonth,
        coverageTarget: formEvalTarget === 'org' ? formCoverageTarget : undefined,
        quantityWeight: undefined,
        qualityWeight: undefined,
        coverageWeight: undefined,
        enabledPeriods: formEnabledPeriods,
        fixedFormula: '最终得分 = Σ（各启用统计指标按分段规则折算后的得分）',
        parameterDescription: '统计指标的原始计算方式来自统计指标库；考核配置页只维护目标、权重、评分分段和等次。',
        evalTotalScore: formEvalTotalScore,
        evalMetricRules: formEvalMetricRules,
        evalGrades: formEvalGrades,
        indicators: []
      };

      if (editingItem) {
        commitDataStore(prev => ({
          ...prev,
          evaluation_rule: prev.evaluation_rule.map(i => (i.id === editingItem.id ? evalItem : i))
        }));
      } else {
        commitDataStore(prev => ({
          ...prev,
          evaluation_rule: [...prev.evaluation_rule, evalItem]
        }));
      }
      setIsModalOpen(false);
      return;
    }

    if (activeModule === 'stats_metric') {
      const metricItem: ConfigModuleItem = {
        id: metricEditingItem ? metricEditingItem.id : String(Date.now()),
        name: metricName.trim(),
        displayName: metricDisplayName.trim() || metricName.trim(),
        calcType: metricCalcType,
        unit: metricUnit,
        period: metricPeriod,
        pages: metricPages,
        isDefault: metricEditingItem ? metricEditingItem.isDefault : false,
        status: '启用',
        updateTime: nowStr,
        description: metricDesc.trim() || getMetricCalcMeta(metricCalcType).description
      };

      commitDataStore(prev => ({
        ...prev,
        stats_metric: metricEditingItem
          ? (prev.stats_metric || []).map(item => (item.id === metricEditingItem.id ? metricItem : item))
          : [...(prev.stats_metric || []), metricItem]
      }));
      setMetricModalOpen(false);
      return;
    }

    if (activeModule === 'audit_score') {
      const isEnabled = formScoreStatus === '启用';
      const relTplId = 'all_report_templates';
      const relTplName = '全部上报统一适用';
      const normalizedScoreLevels = formScoreLevels.map(level => ({
        ...level,
        levelName: level.levelName.trim(),
        description: level.description?.trim()
      }));
      const enabledScoreCount = (dataStore.audit_score || []).filter(item => item.status === '启用').length;

      if (formTotalScore <= 0) {
        alert('规则总分值必须大于 0');
        return;
      }

      if (normalizedScoreLevels.length < 2) {
        alert('至少需要配置 2 个互斥评分等级');
        return;
      }

      if (normalizedScoreLevels.some(level => !level.levelName)) {
        alert('评分等级名称不能为空');
        return;
      }

      if (normalizedScoreLevels.some(level => level.score < 0 || level.score > formTotalScore)) {
        alert(`每个评分等级的分值必须在 0 到 ${formTotalScore} 分之间`);
        return;
      }

      if (editingItem) {
        commitDataStore(prev => ({
          ...prev,
          audit_score: prev.audit_score.map(item => {
            if (item.id === editingItem.id) {
              return {
                ...item,
                name: formName.trim(),
                description: formDesc.trim(),
                status: formScoreStatus,
                totalScore: formTotalScore,
                levelCount: normalizedScoreLevels.length,
                scoreLevels: normalizedScoreLevels,
                relatedTemplateId: relTplId,
                relatedTemplateName: relTplName,
                updateTime: nowStr
              };
            }
            return item;
          })
        }));
      } else {
        const newItem: ConfigModuleItem = {
          id: String(Date.now()),
          name: formName.trim(),
          isDefault: false,
          status: formScoreStatus,
          updateTime: nowStr,
          description: formDesc.trim() || '自定义打分规则组',
          totalScore: formTotalScore,
          levelCount: normalizedScoreLevels.length,
          scoreLevels: normalizedScoreLevels,
          relatedTemplateId: relTplId,
          relatedTemplateName: relTplName
        };
        commitDataStore(prev => ({
          ...prev,
          audit_score: [
            ...prev.audit_score,
            newItem
          ]
        }));
      }
      setIsModalOpen(false);
      return;
    }

    if (activeModule === 'audit_flow') {
      const selTpl = (dataStore.report_template || []).find(t => t.id === formRelatedTemplateId);
      const relTplId = formTemplateApplyMode === 'all_report_templates'
        ? 'all_report_templates'
        : formRelatedTemplateId || (selTpl ? selTpl.id : '');
      const relTplName = formTemplateApplyMode === 'all_report_templates'
        ? '全部报送模板通用'
        : selTpl ? selTpl.name : (formRelatedTemplateId ? '关联上报模版' : '标准图文报送模板');

      const flowItem: ConfigModuleItem = {
        id: editingItem ? editingItem.id : String(Date.now()),
        name: formName.trim(),
        flowMode: formFlowMode,
        isDefault: editingItem ? editingItem.isDefault : false,
        status: formScoreStatus,
        updateTime: nowStr,
        description: formDesc.trim() || '自定义多级审核流程规则',
        relatedTemplateId: relTplId,
        relatedTemplateName: relTplName,
        templateApplyMode: formTemplateApplyMode,
        flowDepth: formAuditNodes.length,
        auditNodes: formAuditNodes,
        orgApplyMode: formOrgApplyMode,
        orgSettings: formOrgSettings,
        ownerMissingStrategy: formOwnerMissingStrategy,
        ownerMissingFallbackRole: formOwnerMissingStrategy === 'fallback_role' ? formOwnerMissingFallbackRole : undefined,
        ownerMissingFallbackUserName: formOwnerMissingStrategy === 'fallback_user' ? formOwnerMissingFallbackUserName : undefined
      };

      if (editingItem) {
        commitDataStore(prev => ({
          ...prev,
          audit_flow: (prev.audit_flow || []).map(i => (i.id === editingItem.id ? flowItem : i))
        }));
      } else {
        commitDataStore(prev => ({
          ...prev,
          audit_flow: [...(prev.audit_flow || []), flowItem]
        }));
      }
      setIsModalOpen(false);
      return;
    }

    if (editingItem) {
      commitDataStore(prev => ({
        ...prev,
        [activeModule]: prev[activeModule].map(item =>
          item.id === editingItem.id
            ? {
                ...item,
                name: formName.trim(),
                templateType: activeModule === 'report_template' ? formTemplateType : item.templateType,
                status: activeModule === 'report_template' ? formScoreStatus : item.status,
                description: formDesc.trim(),
                updateTime: nowStr,
                fields: activeModule === 'report_template' ? formFields : item.fields
              }
            : item
        )
      }));
    } else {
      const newItem: ConfigModuleItem = {
        id: String(Date.now()),
        name: formName.trim(),
        templateType: activeModule === 'report_template' ? formTemplateType : undefined,
        isDefault: false,
        status: activeModule === 'report_template' ? formScoreStatus : '启用',
        updateTime: nowStr,
        description: formDesc.trim() || '自定义模版配置',
        fields: activeModule === 'report_template' ? formFields : undefined
      };
      commitDataStore(prev => ({
        ...prev,
        [activeModule]: [...prev[activeModule], newItem]
      }));
    }

    setIsModalOpen(false);
  };

  return (
    <div className={embedded ? '' : 'space-y-4'}>
      {/* Top Header */}
      <div className={embedded ? 'hidden' : ''}>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">业务配置维护</h2>
        <p className="text-xs text-gray-400 mt-0.5">管理系统内的各类数据字典</p>
      </div>

      {/* Main Container - Two-Column Layout */}
      <div className={embedded ? '' : 'flex flex-col lg:flex-row gap-5 items-start'}>
        {/* Left Card: 配置模块 */}
        <div className={embedded ? 'hidden' : 'w-full lg:w-56 bg-white rounded-lg border border-gray-200/80 shadow-2xs p-4 flex flex-col space-y-2 shrink-0'}>
          <div className="space-y-1">
            {moduleList.map(mod => {
              const isActive = activeModule === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => {
                    setActiveModule(mod.id);
                    setSearchQuery('');
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50/80 text-[#1E5ABB] font-bold border-l-2 border-[#1E5ABB]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {mod.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Card: Dynamic Detail View */}
        <div className={
          activeModule === 'report_template'
            ? (embedded ? 'w-full' : 'flex-1 w-full')
            : embedded
              ? 'w-full bg-white rounded-lg border border-gray-200/80 shadow-2xs p-5 flex flex-col justify-between min-h-[460px] space-y-4'
              : 'flex-1 w-full bg-white rounded-lg border border-gray-200/80 shadow-2xs p-5 flex flex-col justify-between min-h-[460px] space-y-4'
        }>
          <div className={activeModule === 'report_template' ? '' : 'space-y-4'}>
            {/* Action Bar Header */}
            {activeModule !== 'report_template' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 relative">
                  <h3 className="text-sm font-bold text-gray-800">{currentModuleLabel}</h3>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Search input (Hidden in value_added, stats_metric, login_method, audit_score, data_dict, audit_flow) */}
                  {activeModule !== 'value_added' &&
                    activeModule !== 'stats_metric' &&
                    activeModule !== 'login_method' &&
                    activeModule !== 'audit_score' &&
                    activeModule !== 'data_dict' &&
                    activeModule !== 'audit_flow' && (
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={`搜索${currentModuleLabel}名称/编码/描述...`}
                        className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md w-52 sm:w-64 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-gray-50/50 text-gray-700 placeholder:text-gray-400"
                      />
                    </div>
                  )}

                  {/* + 新增 button */}
                  {activeModule !== 'value_added' && activeModule !== 'stats_metric' && activeModule !== 'evaluation_rule' && activeModule !== 'login_method' && activeModule !== 'data_dict' && (
                    <button
                      onClick={openAddModal}
                      className="px-3.5 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold rounded shadow-2xs flex items-center space-x-1 cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新增</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Value Added Info Banner */}
            {activeModule === 'value_added' && showValueAddedBanner && (
              isGlobalScope ? (
                <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 flex items-start justify-between gap-2.5 text-xs shadow-2xs">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Info className="w-4 h-4 text-[#1890ff] shrink-0 mt-0.5" />
                    <div className="space-y-0.5 min-w-0">
                      <span className="font-bold text-blue-900 block">
                        全平台增值业务运营管控提示
                      </span>
                      <p className="text-gray-700 text-[11px] leading-relaxed">
                        本模块面向平台运营人员统一管控。在全局配置中启用增值业务后，机构在添加或编辑时才能进行管理与开通；如果在此处禁用该增值业务，机构端将不会出现对应业务选项。
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowValueAddedBanner(false)}
                    className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-blue-100/70 transition-colors cursor-pointer shrink-0"
                    title="关闭提示"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="bg-[#fffbe6] border border-[#ffe58f] rounded-lg p-3.5 flex items-start justify-between gap-3 text-xs shadow-2xs">
                  <div className="flex items-start space-x-2.5 min-w-0">
                    <Info className="w-4 h-4 text-[#faad14] shrink-0 mt-0.5" />
                    <div className="space-y-0.5 min-w-0">
                      <span className="font-bold text-[#d48806] block">
                        增值业务运营管控说明
                      </span>
                      <p className="text-gray-700 text-[11px] leading-relaxed">
                        本模块面向平台运营人员统一管控。在全局配置中开启增值业务后，机构在添加或编辑时才能进行管理与开通；如果在此处未开启该增值业务，机构端将不会出现对应业务选项。
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowValueAddedBanner(false)}
                    className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-amber-100/70 transition-colors cursor-pointer shrink-0"
                    title="关闭说明"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )
            )}

            {/* Global Scope Sync Notice for Audit Score / Audit Flow */}
            {isGlobalScope && showAuditSyncNotice && (activeModule === 'audit_score' || activeModule === 'audit_flow') && (
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 flex items-start justify-between gap-2.5 text-xs shadow-2xs">
                <div className="flex items-start gap-2.5 min-w-0">
                  <Info className="w-4 h-4 text-[#1890ff] shrink-0 mt-0.5" />
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-bold text-blue-900 block">
                      全平台内置{activeModule === 'audit_score' ? '打分规则' : '审核流程'}母版管控提示
                    </span>
                    <p className="text-gray-700 text-[11px] leading-relaxed">
                      此处配置并启用的{activeModule === 'audit_score' ? '审核打分规则' : '审核流程配置'}将作为系统内置规则直接同步至全平台所有机构的内置规则库中。受平台全局统一管控，各机构端仅可调用生效，不支持自行修改或删除。
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuditSyncNotice(false)}
                  className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-blue-100/70 transition-colors cursor-pointer shrink-0"
                  title="关闭提示"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Global Scope Sync Notice for Data Dict */}
            {isGlobalScope && showDictSyncNotice && activeModule === 'data_dict' && (
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 flex items-start justify-between gap-2.5 text-xs shadow-2xs">
                <div className="flex items-start gap-2.5 min-w-0">
                  <Info className="w-4 h-4 text-[#1890ff] shrink-0 mt-0.5" />
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-bold text-blue-900 block">
                      全平台内置数据字典母版管控提示
                    </span>
                    <p className="text-gray-700 text-[11px] leading-relaxed">
                      此处配置并启用的数据字典项（驳回原因、人员标签、预警类型等）将作为系统内置母版标准同步至全平台所有机构。受平台全局统一管控，各机构端仅可引用生效，不支持自行修改或删除系统内置字典项。
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDictSyncNotice(false)}
                  className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-blue-100/70 transition-colors cursor-pointer shrink-0"
                  title="关闭提示"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Data Dictionary Sub-category Tabs (Only visible in data_dict module) */}
            {activeModule === 'data_dict' && (
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-1 p-1 bg-gray-100 border border-gray-200 rounded-lg flex-wrap">
                  {dictCategoryTabOptions.map(option => {
                    const tab = {
                      ...option,
                      count: (dataStore.data_dict || []).filter(i => (i.dictCategory || 'reject_reason') === option.id).length,
                      isHighlight: option.id === 'reject_reason'
                    };
                    const isActive = dictSubCategoryFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setDictSubCategoryFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-colors flex items-center space-x-1.5 ${
                          isActive
                            ? 'bg-white text-[#1E5ABB] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <span>{tab.fullLabel || tab.label}</span>
                        <span className={`text-[10px] ${isActive ? 'text-[#1E5ABB]' : 'text-gray-400'}`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="px-3 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold rounded shadow-2xs flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {dictSubCategoryFilter === 'reject_reason'
                      ? '新增驳回理由'
                      : dictSubCategoryFilter === 'info_category'
                      ? '新增人员标签'
                      : '新增字典项'}
                  </span>
                </button>
                </div>
            )}

            {/* Content Display Area (Stats Metric Builder / Value Added Cards / Standard Table) */}
            {activeModule === 'stats_metric' ? (
              <div className="space-y-3">
                <div className="border border-gray-100 rounded-lg bg-gray-50/50 px-4 py-3">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="w-64">
                      <label className="block text-gray-600 font-medium text-xs mb-1">指标名称</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={metricNameInput}
                          onChange={e => setMetricNameInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              setMetricNameQuery(metricNameInput);
                              setMetricCategoryFilter(metricCategoryInput);
                              setSelectedMetricId(null);
                              setHoveredMetricId(null);
                            }
                          }}
                          placeholder="请输入系统默认指标名称"
                          className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white text-gray-700 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                    <div className="w-44">
                      <label className="block text-gray-600 font-medium text-xs mb-1">指标分类</label>
                      <select
                        value={metricCategoryInput}
                        onChange={e => setMetricCategoryInput(e.target.value as MetricCategory | 'all')}
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white text-gray-700"
                      >
                        <option value="all">全部分类</option>
                        {metricCategoryOptions.map(option => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 pb-0">
                      <button
                        onClick={() => {
                          setMetricNameQuery(metricNameInput);
                          setMetricCategoryFilter(metricCategoryInput);
                          setSelectedMetricId(null);
                          setHoveredMetricId(null);
                        }}
                        className="px-3.5 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold rounded shadow-2xs flex items-center space-x-1 cursor-pointer whitespace-nowrap"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>查询</span>
                      </button>
                      <button
                        onClick={() => {
                          setMetricNameInput('');
                          setMetricNameQuery('');
                          setMetricCategoryInput('all');
                          setMetricCategoryFilter('all');
                          setSelectedMetricId(null);
                          setHoveredMetricId(null);
                        }}
                        className="px-3.5 py-1.5 border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 text-xs font-bold rounded cursor-pointer whitespace-nowrap"
                      >
                        重置
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`grid grid-cols-1 ${activeMetricDetail ? 'lg:grid-cols-[1fr_340px]' : ''} gap-3`}>
                  <div className="border border-gray-100 rounded-lg bg-white overflow-hidden">
                    <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">指标名称</span>
                      <span className="text-[11px] text-gray-400">共 {statsMetrics.length} 项</span>
                    </div>
                    {statsMetrics.length === 0 ? (
                      <div className="py-12 text-center text-gray-400 text-xs">
                        暂无匹配的统计指标
                      </div>
                    ) : (
                      <div className="p-4 flex flex-wrap gap-2 content-start min-h-[260px]">
                        {statsMetrics.map(metric => {
                          const isActive = activeMetricDetail?.id === metric.id;
                          return (
                            <button
                              key={metric.id}
                              type="button"
                              onClick={() => setSelectedMetricId(current => (current === metric.id ? null : metric.id))}
                              className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-blue-50 text-[#1E5ABB] border-[#1E5ABB] shadow-2xs'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-[#1E5ABB] hover:border-blue-200'
                              }`}
                              title="请点击查看更多详情"
                            >
                              {metric.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {activeMetricDetail && (
                  <div className="border border-gray-100 rounded-lg bg-white overflow-hidden min-h-[260px]">
                    <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">指标信息</span>
                        <span className="text-[11px] text-gray-400">
                          已选中
                        </span>
                    </div>
                      <div className="p-4 space-y-3 text-xs">
                        <div>
                          <span className="text-gray-400 block mb-1">指标名称</span>
                          <span className="font-bold text-gray-900 text-sm">{activeMetricDetail.name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-gray-400 block mb-1">单位</span>
                            <span className="font-bold text-gray-700">{activeMetricDetail.unit || '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block mb-1">分类</span>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] rounded border border-indigo-100 font-bold">
                              {getMetricCategoryLabel(activeMetricDetail.metricCategory)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400 block mb-1">指标描述</span>
                          <p className="p-2.5 bg-gray-50 rounded border border-gray-100 text-gray-700 leading-relaxed">
                            {activeMetricDetail.description || '-'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400 block mb-1">指标计算方式</span>
                          <p className="p-2.5 bg-blue-50/40 rounded border border-blue-100 text-gray-700 leading-relaxed">
                            {activeMetricDetail.formulaText || getMetricCalcMeta(activeMetricDetail.calcType).description}
                          </p>
                        </div>
                      </div>
                  </div>
                  )}
                </div>
              </div>
            ) : activeModule === 'data_dict' ? (
              <div className="space-y-3">
                {(() => {
                  const isRejectReasonView = dictSubCategoryFilter === 'reject_reason';
                  const isPersonnelRoleView = dictSubCategoryFilter === 'info_category';
                  const sortedDictList = [...filteredList].sort((a, b) => {
                    const aCat = a.dictCategory || 'reject_reason';
                    const bCat = b.dictCategory || 'reject_reason';
                    if (aCat !== bCat) return aCat.localeCompare(bCat);
                    return (a.sortOrder || 999) - (b.sortOrder || 999);
                  });

                  return (
                    <>
                      <div className="overflow-x-auto border border-gray-100 rounded-lg">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-gray-50/80 text-gray-500 border-b border-gray-200 font-medium">
                              <th className="py-2.5 px-4 font-medium whitespace-nowrap">序号</th>
                              <th className="py-2.5 px-4 font-medium whitespace-nowrap">
                                {isRejectReasonView ? '驳回理由' : '字典项名称'}
                              </th>
                              {!isRejectReasonView && (
                                <th className="py-2.5 px-4 font-medium whitespace-nowrap">所属分类</th>
                              )}
                              <th className="py-2.5 px-4 font-medium">
                                {isRejectReasonView ? '审核员提示说明' : isPersonnelRoleView ? '角色分类' : '业务说明'}
                              </th>
                              <th className="py-2.5 px-4 font-medium whitespace-nowrap">状态</th>
                              <th className="py-2.5 px-4 font-medium whitespace-nowrap">更新时间</th>
                              <th className="py-2.5 px-4 font-medium text-center whitespace-nowrap">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-gray-700">
                            {sortedDictList.length === 0 ? (
                              <tr>
                                <td colSpan={isRejectReasonView ? 6 : 7} className="py-10 text-center text-gray-400 text-xs">
                                  暂无相关字典条目
                                </td>
                              </tr>
                            ) : (
                              sortedDictList.map((item, index) => {
                                const itemCategory = item.dictCategory || 'reject_reason';
                                const itemMeta = getDictCategoryMeta(itemCategory);
                                return (
                                  <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                                    <td className="py-3 px-4 align-top whitespace-nowrap text-gray-500 font-mono">
                                      {index + 1}
                                    </td>
                                    <td className="py-3 px-4 align-top max-w-44">
                                      <div className="flex flex-col gap-1 min-w-0">
                                         <div className="flex items-center gap-2 min-w-0">
                                          <span className="font-bold text-gray-900 truncate min-w-0" title={item.name}>{item.name}</span>
                                          {!isGlobalScope && (
                                            item.isDefault ? (
                                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 font-bold rounded border border-gray-200 shrink-0 whitespace-nowrap">
                                                <Lock className="w-2.5 h-2.5 text-gray-400" />
                                                系统默认
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200 shrink-0 whitespace-nowrap">
                                                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                                自定义
                                              </span>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    {!isRejectReasonView && (
                                      <td className="py-3 px-4 align-top whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border ${getDictCategoryBadge(itemCategory)}`}>
                                          {itemMeta.label}
                                        </span>
                                      </td>
                                    )}
                                    <td className="py-3 px-4 align-top min-w-64">
                                      <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2">
                                        {isPersonnelRoleView && itemCategory === 'info_category'
                                          ? getPersonnelRoleGroupLabel(item)
                                          : item.description || (isRejectReasonView ? '审核员选择该理由后，将作为本次驳回说明同步给上报人。' : itemMeta.description)}
                                      </p>
                                    </td>
                                    <td className="py-3 px-4 align-top whitespace-nowrap">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleStatus(item.id)}
                                        title={item.status === '启用' ? '点击停用' : '点击启用'}
                                        className="flex items-center gap-1.5 cursor-pointer"
                                      >
                                        <div className={`w-7 h-3.5 flex items-center rounded-full p-0.5 transition-colors ${item.status === '启用' ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                                          <div className="w-2.5 h-2.5 bg-white rounded-full shadow-2xs" />
                                        </div>
                                        <span className={`text-[11px] font-bold ${item.status === '启用' ? 'text-emerald-700' : 'text-gray-500'}`}>
                                          {item.status}
                                        </span>
                                      </button>
                                    </td>
                                    <td className="py-3 px-4 align-top whitespace-nowrap font-mono text-gray-500">
                                      {item.updateTime}
                                    </td>
                                    <td className="py-3 px-4 align-top text-center whitespace-nowrap">
                                      <div className="flex items-center justify-center gap-3">
                                        <button
                                          type="button"
                                          onClick={() => openPreviewItem(item)}
                                          title="查看详情"
                                          className="text-gray-400 hover:text-[#1E5ABB] cursor-pointer"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>
                                         {!isGlobalScope && item.isDefault ? (
                                          <button
                                            type="button"
                                            disabled
                                            title="系统默认字典项暂不支持编辑"
                                            className="text-gray-300 cursor-not-allowed opacity-50"
                                          >
                                            <Edit3 className="w-3.5 h-3.5" />
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => openEditModal(item)}
                                            title="编辑"
                                            className="text-[#1E5ABB] hover:text-blue-700 cursor-pointer"
                                          >
                                            <Edit3 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                        {!isGlobalScope && item.isDefault ? (
                                          <button
                                            type="button"
                                            disabled
                                            title="系统默认字典项不可删除"
                                            className="text-gray-300 cursor-not-allowed opacity-50"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handleDelete(item)}
                                            title="删除"
                                            className="text-gray-400 hover:text-red-600 cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : activeModule === 'audit_score' ? (
              <div className="space-y-4">
                {filteredList.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs bg-white rounded-xl border border-gray-100 shadow-2xs">
                    暂无匹配的审核打分规则
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredList.map(item => {
                      const isEnabled = item.status === '启用';
                      const levels = item.scoreLevels || [];
                      return (
                        <div
                          key={item.id}
                          onClick={() => openPreviewItem(item)}
                          className={`bg-white rounded-xl border transition-all duration-200 p-4 flex flex-col justify-between group shadow-2xs hover:shadow-md cursor-pointer relative overflow-hidden ${
                            isEnabled
                              ? 'border-blue-200/90 ring-1 ring-blue-500/10 hover:border-[#1890ff]'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div>
                            {/* Card Top: Title, Badges & Switch */}
                            <div className="flex items-center justify-between gap-2.5 pb-3 border-b border-gray-100/90">
                              <div className="flex items-center gap-2 min-w-0">
                                <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#1890ff] transition-colors truncate">
                                  {item.name}
                                </h3>
                                {!isGlobalScope && (
                                  item.isDefault ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] bg-gray-100 text-gray-600 font-medium rounded border border-gray-200/80 shrink-0">
                                      <Lock className="w-3 h-3 text-gray-400" />
                                      <span>系统默认</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] bg-blue-50 text-[#1890ff] font-medium rounded border border-blue-200/80 shrink-0">
                                      <Sparkles className="w-3 h-3 text-[#1890ff]" />
                                      <span>自定义</span>
                                    </span>
                                  )
                                )}
                              </div>

                              <div
                                className="shrink-0 flex items-center gap-1.5"
                                onClick={e => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={isEnabled}
                                  onClick={() => handleToggleStatus(item.id)}
                                  className={`relative inline-flex h-6 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer select-none text-[11px] font-medium ${
                                    isEnabled
                                      ? 'bg-[#1890ff] text-white pl-2.5 pr-6.5'
                                      : 'bg-gray-200 text-gray-500 pl-6.5 pr-2.5 hover:bg-gray-300'
                                  }`}
                                  title={isEnabled ? '当前已生效，点击禁用' : '点击启用此打分规则'}
                                >
                                  <span
                                    className={`pointer-events-none absolute top-0.5 bottom-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-all duration-200 ease-in-out ${
                                      isEnabled ? 'right-0.5' : 'left-0.5'
                                    }`}
                                  />
                                  <span className="leading-none whitespace-nowrap">
                                    {isEnabled ? '启用' : '禁用'}
                                  </span>
                                </button>
                              </div>
                            </div>

                            {/* Key Meta Tag Pills */}
                            <div className="mt-3 flex items-center flex-wrap gap-2 text-xs">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 text-[11px] font-medium">
                                总分 <strong className="font-bold text-gray-900">{item.totalScore || 100}</strong> 分
                              </span>
                              <span className="px-2 py-0.5 bg-blue-50 text-[#1890ff] rounded border border-blue-200 text-[11px] font-medium">
                                {levels.length || item.levelCount || 0} 个打分等级
                              </span>
                              <span className="text-[11px] text-gray-400 font-mono tracking-tight ml-auto shrink-0">
                                {item.createTime || item.updateTime || '2023-10-24 10:00:00'}
                              </span>
                            </div>

                            {/* Structured Description Box */}
                            <div className="mt-2.5 rounded-lg bg-gray-50/80 p-3 text-xs text-gray-600 leading-relaxed border border-gray-100 min-h-[66px] flex flex-col justify-center">
                              <p className="line-clamp-2 text-xs text-gray-600" title={item.description || '暂无规则说明描述'}>
                                {item.description || '依据预设维度与打分等级进行标准化互斥打分研判。'}
                              </p>
                            </div>
                          </div>

                          {/* Card Footer Action Bar */}
                          <div className="mt-3.5 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-gray-400 group-hover:text-[#1890ff] transition-colors flex items-center gap-1 font-medium">
                              <Eye className="w-3.5 h-3.5" />
                              <span>查看打分规则详情 →</span>
                            </span>

                            <div
                              className="flex items-center gap-1"
                              onClick={e => e.stopPropagation()}
                            >
                              {isGlobalScope || !item.isDefault ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(item)}
                                    className="p-1.5 text-gray-400 hover:text-[#1890ff] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                    title="编辑规则"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(item)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                    title="删除规则"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-[11px] text-gray-300 px-1 select-none flex items-center gap-0.5">
                                  <Lock className="w-3 h-3 text-gray-300" />
                                  内置
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : activeModule === 'report_template' ? (
              <TemplateConfigBoard
                isGlobalScope={isGlobalScope}
                onSaveNotice={(msg) => showConfigToast(msg)}
                onNavigateToWorkflow={() => {
                  setActiveModule('audit_flow');
                  onModuleChange?.('audit_flow');
                }}
                onNavigateToScoring={() => {
                  setActiveModule('audit_score');
                  onModuleChange?.('audit_score');
                }}
              />
            ) : activeModule === 'evaluation_rule' ? (
              <div className="space-y-3">
                <div className="bg-blue-50/60 border border-blue-100 rounded-lg px-3.5 py-3 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#1E5ABB] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-[#1E5ABB]">考核规则配置</p>
                    <p className="text-[11px] text-gray-600 leading-relaxed mt-0.5">
                      本页面只配置目标值、评分权重、考核周期和启用状态；系统统一计算公式，实际得分、等级和排名由考核管理页面自动生成。
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto border border-gray-100 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs min-w-[980px]">
                    <thead>
                      <tr className="bg-gray-50/80 text-gray-500 border-b border-gray-200 font-medium">
                        <th className="py-2.5 px-4 font-medium">考核方案</th>
                        <th className="py-2.5 px-4 font-medium">考核对象</th>
                        <th className="py-2.5 px-4 font-medium">目标配置</th>
                        <th className="py-2.5 px-4 font-medium">指标 / 总分</th>
                        <th className="py-2.5 px-4 font-medium">启用周期</th>
                        <th className="py-2.5 px-4 font-medium">状态</th>
                        <th className="py-2.5 px-4 font-medium text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {filteredList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-10 text-center text-gray-400 text-xs">暂无考核规则配置</td>
                        </tr>
                      ) : (
                        filteredList.map(item => {
                          const target = item.evalTarget || (item.evalDimension === 'org' ? 'org' : item.evalDimension === 'category' ? 'category' : 'person');
                          return (
                            <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                              <td className="py-3 px-4 align-top">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900 whitespace-nowrap">{item.name}</span>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 font-bold rounded border border-gray-200 shrink-0">
                                      <Lock className="w-2.5 h-2.5 text-gray-400" />
                                      系统默认
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-gray-400 max-w-[280px] truncate" title={item.description}>
                                    {item.description}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 align-top">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded border ${getEvaluationTargetBadge(target)}`}>
                                  {target === 'org' ? <Building2 className="w-3 h-3" /> : target === 'category' ? <Layers className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                                  {getEvaluationTargetLabel(target)}
                                </span>
                              </td>
                              <td className="py-3 px-4 align-top">
                                <div className="text-[11px] text-gray-600 leading-relaxed whitespace-nowrap">
                                  {getEvaluationTargetSummary(item)}
                                </div>
                              </td>
                              <td className="py-3 px-4 align-top whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 text-[10px] font-bold">
                                    {item.evalMetricRules?.filter(rule => rule.enabled).length || 0} 个指标
                                  </span>
                                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200 text-[10px] font-bold">
                                    总分 {item.evalTotalScore || 100}
                                  </span>
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 text-[10px] font-bold">
                                    {item.evalGrades?.length || 0} 个等次
                                  </span>
                                </div>
                                <div className={`text-[10px] mt-1 ${getEvaluationWeightTotal(item) === 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  启用指标权重合计 {getEvaluationWeightTotal(item)}%
                                </div>
                              </td>
                              <td className="py-3 px-4 align-top whitespace-nowrap text-[11px] text-gray-600">
                                {getEvaluationPeriodText(item.enabledPeriods)}
                              </td>
                              <td className="py-3 px-4 align-top">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(item.id)}
                                  title={item.status === '启用' ? '点击停用' : '点击启用'}
                                  className="flex items-center gap-1.5 cursor-pointer"
                                >
                                  <div className={`w-7 h-3.5 flex items-center rounded-full p-0.5 transition-colors ${item.status === '启用' ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                                    <div className="w-2.5 h-2.5 bg-white rounded-full shadow-2xs" />
                                  </div>
                                  <span className={`text-[11px] font-bold ${item.status === '启用' ? 'text-emerald-700' : 'text-gray-500'}`}>
                                    {item.status === '启用' ? '已启用' : '已停用'}
                                  </span>
                                </button>
                              </td>
                              <td className="py-3 px-4 align-top">
                                <div className="flex items-center justify-center gap-3">
                                  <button type="button" onClick={() => openPreviewItem(item)} title="查看详情" className="text-gray-400 hover:text-gray-700 cursor-pointer">
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button type="button" onClick={() => openEditModal(item)} title="编辑考核参数" className="text-[#1E5ABB] hover:text-blue-600 cursor-pointer">
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeModule === 'audit_flow' ? (
              <div className="space-y-4">
                {filteredList.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs bg-white rounded-xl border border-gray-100 shadow-2xs">
                    暂无相关审核流程配置
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredList.map(item => {
                      const isSelected = selectedAuditFlowId === item.id;
                      const isEnabled = item.status === '启用';

                      // Mode Badge Helper
                      const getModeBadge = () => {
                        if (item.flowMode === 'adaptive' || item.name.includes('逐级')) {
                          return {
                            label: '逐级审核',
                            className: 'bg-blue-50 text-[#1677ff] border-blue-200',
                          };
                        }
                        if (item.flowMode === 'max_n' || item.name.includes('最多')) {
                          const depthMatch = item.name.match(/\d+/);
                          const depth = item.flowDepth || (depthMatch ? depthMatch[0] : 3);
                          return {
                            label: `最多${depth}级`,
                            className: 'bg-amber-50 text-[#fa8c16] border-amber-200',
                          };
                        }
                        if (item.flowMode === 'direct' || item.name.includes('总机构') || item.name.includes('直达')) {
                          return {
                            label: '直达总机构',
                            className: 'bg-purple-50 text-[#722ed1] border-purple-200',
                          };
                        }
                        return {
                          label: item.flowMode === 'custom' ? '自定义审核' : '标准审核',
                          className: 'bg-indigo-50 text-[#1E5ABB] border-indigo-200',
                        };
                      };

                      const modeBadge = getModeBadge();

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedAuditFlowId(item.id)}
                          className={`bg-white rounded-xl border transition-all duration-200 p-4 flex flex-col justify-between group shadow-2xs hover:shadow-md cursor-pointer relative overflow-hidden ${
                            isSelected
                              ? 'border-[#1890ff] ring-2 ring-[#1890ff]/20 shadow-md'
                              : isEnabled
                                ? 'border-blue-200/90 ring-1 ring-blue-500/10 hover:border-[#1890ff]'
                                : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div>
                            {/* Card Top: Title, Badges & Switch */}
                            <div className="flex items-center justify-between gap-2.5 pb-3 border-b border-gray-100/90">
                              <div className="flex items-center gap-2 min-w-0">
                                <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#1890ff] transition-colors truncate" title={item.name}>
                                  {item.name}
                                </h3>
                                {!isGlobalScope && (
                                  item.isDefault ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] bg-gray-100 text-gray-600 font-medium rounded border border-gray-200/80 shrink-0">
                                      <Lock className="w-3 h-3 text-gray-400" />
                                      <span>系统默认</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] bg-blue-50 text-[#1890ff] font-medium rounded border border-blue-200/80 shrink-0">
                                      <Sparkles className="w-3 h-3 text-[#1890ff]" />
                                      <span>自定义</span>
                                    </span>
                                  )
                                )}
                              </div>

                              <div
                                className="shrink-0 flex items-center gap-1.5"
                                onClick={e => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={isEnabled}
                                  onClick={() => handleToggleStatus(item.id)}
                                  className={`relative inline-flex h-6 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer select-none text-[11px] font-medium ${
                                    isEnabled
                                      ? 'bg-[#1890ff] text-white pl-2.5 pr-6.5'
                                      : 'bg-gray-200 text-gray-500 pl-6.5 pr-2.5 hover:bg-gray-300'
                                  }`}
                                  title={isEnabled ? '当前已生效，点击禁用' : '点击启用此审核流程'}
                                >
                                  <span
                                    className={`pointer-events-none absolute top-0.5 bottom-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-all duration-200 ease-in-out ${
                                      isEnabled ? 'right-0.5' : 'left-0.5'
                                    }`}
                                  />
                                  <span className="leading-none whitespace-nowrap">
                                    {isEnabled ? '启用' : '禁用'}
                                  </span>
                                </button>
                              </div>
                            </div>

                            {/* Key Meta Tag Pills */}
                            <div className="mt-3 flex items-center flex-wrap gap-2 text-xs">
                              <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded border shrink-0 ${modeBadge.className}`}>
                                {modeBadge.label}
                              </span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 text-[11px] font-medium">
                                {(item.auditNodes || []).length || (item.name.includes('三') ? 3 : item.name.includes('两') ? 2 : 1)} 级审核节点
                              </span>
                              <span className="text-[11px] text-gray-400 font-mono tracking-tight ml-auto shrink-0">
                                {item.updateTime || '2023-10-05 10:00:00'}
                              </span>
                            </div>

                            {/* Structured Description Box */}
                            <div className="mt-2.5 rounded-lg bg-gray-50/80 p-3 text-xs text-gray-600 leading-relaxed border border-gray-100 min-h-[66px] flex flex-col justify-center">
                              <p className="line-clamp-2 text-xs text-gray-600" title={item.description || '本级机构提报后沿组织树逐级向上传递审核，最终由总机构终审并评分。'}>
                                {item.description || '本级机构提报后沿组织树逐级向上传递审核，最终由总机构终审并评分。'}
                              </p>
                            </div>
                          </div>

                          {/* Card Footer Action Bar */}
                          <div className="mt-3.5 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-gray-400 group-hover:text-[#1890ff] transition-colors flex items-center gap-1 font-medium">
                              <Eye className="w-3.5 h-3.5" />
                              <span>查看流程节点设计 →</span>
                            </span>

                            <div
                              className="flex items-center gap-1"
                              onClick={e => e.stopPropagation()}
                            >
                              {isGlobalScope || !item.isDefault ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(item)}
                                    className="p-1.5 text-gray-400 hover:text-[#1890ff] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                    title="编辑流程"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(item)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                    title="删除流程"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-[11px] text-gray-300 px-1 select-none flex items-center gap-0.5">
                                  <Lock className="w-3 h-3 text-gray-300" />
                                  内置
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : activeModule === 'login_method' ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-blue-100 bg-blue-50/30 flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#1E5ABB] shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <div className="font-bold text-gray-800">登录入口配置规则</div>
                    <p className="text-gray-500 text-[11px] mt-0.5">
                      账号密码为系统默认兜底登录方式；微信扫码、手机短信验证码为可选扩展入口。系统允许启用一种或多种方式，但至少保留一种启用。
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto border border-gray-100 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50/80 text-gray-500 border-b border-gray-200 font-medium">
                        <th className="py-2.5 px-4 font-medium">登录方式</th>
                        <th className="py-2.5 px-4 font-medium whitespace-nowrap">类型/来源</th>
                        <th className="py-2.5 px-4 font-medium whitespace-nowrap">配置状态</th>
                        <th className="py-2.5 px-4 font-medium whitespace-nowrap">启用状态</th>
                        <th className="py-2.5 px-4 font-medium whitespace-nowrap">更新时间</th>
                        <th className="py-2.5 px-4 font-medium text-center whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {filteredList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-400 text-xs">
                            暂无相关登录方式
                          </td>
                        </tr>
                      ) : (
                        filteredList.map(item => (
                          <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex flex-col space-y-1">
                                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                  <span className="font-bold text-gray-900">{item.name}</span>
                                  {item.isDefault && (
                                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 font-bold rounded border border-gray-200 shrink-0">
                                      <Lock className="w-2.5 h-2.5 text-gray-400" />
                                      <span>系统默认</span>
                                    </span>
                                  )}
                                  {item.isFallback && (
                                    <span className="px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-700 border border-blue-100 font-bold rounded">
                                      兜底入口
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-400 line-clamp-1">{item.description}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] bg-slate-50 text-slate-700 font-bold rounded border border-slate-200">
                                <UserCheck className="w-2.5 h-2.5 text-slate-500" />
                                <span>{item.loginTypeName || '系统登录'}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                item.configStatus === '已配置' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-800'
                              }`}>
                                {item.configStatus || '待配置'}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                item.status === '启用' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap font-mono text-gray-500">{item.updateTime}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center space-x-3">
                                <button
                                  onClick={() => openPreviewItem(item)}
                                  className="text-gray-400 hover:text-[#1E5ABB] cursor-pointer"
                                  title="查看详情"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="text-[#1E5ABB] hover:text-[#134092] cursor-pointer"
                                  title="配置"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(item.id)}
                                  className="cursor-pointer"
                                  title={item.status === '启用' ? '点击停用' : '点击启用'}
                                >
                                  <div className={`w-7 h-3.5 flex items-center rounded-full p-0.5 transition-colors ${item.status === '启用' ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                                    <div className="w-2.5 h-2.5 bg-white rounded-full shadow-2xs"></div>
                                  </div>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeModule === 'value_added' ? (
              <div className="space-y-4">
                {filteredList.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs bg-white rounded-xl border border-gray-100 shadow-2xs">
                    暂无相关增值业务模块数据
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredList.map(item => {
                      const isActivated = valueAddedAllOperable
                        ? item.status === '启用'
                        : item.activatedStatus === '已开通';
                      const isEnabled = isActivated && item.status === '启用';

                      return (
                        <div
                          key={item.id}
                          onClick={() => openPreviewItem(item)}
                          className={`bg-white rounded-xl border transition-all duration-200 p-4 flex flex-col justify-between group shadow-2xs hover:shadow-md cursor-pointer relative overflow-hidden ${
                            isActivated
                              ? isEnabled
                                ? 'border-blue-200/90 ring-1 ring-blue-500/10 hover:border-[#1890ff]'
                                : 'border-gray-200 hover:border-gray-300'
                              : 'border-gray-200 bg-gray-50/70 opacity-90 hover:border-gray-300'
                          }`}
                        >
                          <div>
                            {/* Card Top: Title & Switch */}
                            <div className="flex items-center justify-between gap-2.5 pb-3 border-b border-gray-100/90">
                              <div className="flex items-center gap-2 min-w-0">
                                <h3 className={`font-bold text-sm truncate transition-colors ${
                                  isActivated ? 'text-gray-900 group-hover:text-[#1890ff]' : 'text-gray-600'
                                }`}>
                                  {item.name}
                                </h3>
                              </div>

                              {/* Switch or Lock Badge */}
                              <div
                                className="shrink-0 flex items-center gap-1.5"
                                onClick={e => e.stopPropagation()}
                              >
                                {valueAddedAllOperable || isActivated ? (
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={item.status === '启用'}
                                    onClick={() => handleToggleStatus(item.id)}
                                    className={`relative inline-flex h-6 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer select-none text-[11px] font-medium ${
                                      item.status === '启用'
                                        ? 'bg-[#1890ff] text-white pl-2.5 pr-6.5'
                                        : 'bg-gray-200 text-gray-500 pl-6.5 pr-2.5 hover:bg-gray-300'
                                    }`}
                                    title={
                                      isGlobalScope
                                        ? (item.status === '启用' ? '点击切换为禁用' : '点击切换为启用')
                                        : (item.status === '启用' ? '点击切换为未开通' : '点击切换为已开通')
                                    }
                                  >
                                    <span
                                      className={`pointer-events-none absolute top-0.5 bottom-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-all duration-200 ease-in-out ${
                                        item.status === '启用' ? 'right-0.5' : 'left-0.5'
                                      }`}
                                    />
                                    <span className="leading-none whitespace-nowrap">
                                      {isGlobalScope
                                        ? (item.status === '启用' ? '启用' : '禁用')
                                        : (item.status === '启用' ? '已开通' : '未开通')}
                                    </span>
                                  </button>
                                ) : (
                                  <div
                                    className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 text-gray-400 text-[11px] font-medium cursor-not-allowed shrink-0"
                                    title="未开通业务不可进行启禁操作"
                                  >
                                    <Lock className="w-3 h-3 text-gray-400" />
                                    <span>未开通</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Structured Description Box */}
                            <div className="mt-2.5 rounded-lg bg-gray-50/80 p-3 text-xs text-gray-600 leading-relaxed border border-gray-100 min-h-[66px] flex flex-col justify-center">
                              <p className="line-clamp-2 text-xs text-gray-600" title={
                                item.name === '报送首发重复识别'
                                  ? '通过抓取报送链接的文章原文比对判断内容是否重复，并结合提交时间线智能判定首发，避免多头报送与重复审核计分。'
                                  : (item.description || '暂无产品功能介绍说明')
                              }>
                                {item.name === '报送首发重复识别'
                                  ? '通过抓取报送链接的文章原文比对判断内容是否重复，并结合提交时间线智能判定首发，避免多头报送与重复审核计分。'
                                  : (item.description || '暂无产品功能介绍说明')}
                              </p>

                              {/* Contact Sales Notice - Only shown for non-activated products */}
                              {!isActivated && !valueAddedAllOperable && (
                                <div className="mt-1.5 text-[10px] text-amber-800 font-medium flex items-center gap-1 bg-amber-50/90 px-2 py-0.5 rounded border border-amber-200/80">
                                  <Info className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>如需开通请联系对应商务/销售人员</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Standard Table Area */
              <div className="overflow-x-auto border border-gray-100 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-500 border-b border-gray-200 font-medium">
                      <th className="py-2.5 px-4 font-medium">
                        {activeModule === 'data_dict' ? '字典项名称 / 类别与描述' : ['audit_score', 'evaluation_rule'].includes(activeModule) ? '规则名称' : '模板名称'}
                      </th>
                      <th className="py-2.5 px-4 font-medium whitespace-nowrap">
                        {activeModule === 'data_dict' ? '字典编码 & 排序号' : activeModule === 'report_template' ? '模板类型' : activeModule === 'audit_score' ? '适用范围与打分参数' : activeModule === 'audit_flow' ? '关联模版 / 层级节点 / 机构规则' : '属性类型'}
                      </th>
                      <th className="py-2.5 px-4 font-medium whitespace-nowrap">状态</th>
                      <th className="py-2.5 px-4 font-medium whitespace-nowrap">更新时间</th>
                      <th className="py-2.5 px-4 font-medium text-center whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400 text-xs">
                          暂无相关配置项数据
                        </td>
                      </tr>
                    ) : (
                      filteredList.map(item => (
                        <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                          {/* Name Column with System Default / Custom Tag right next to name */}
                          <td className="py-3 px-4">
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <span className="font-bold text-gray-900">{item.name}</span>

                                {/* Data Dict Sub Category Badge */}
                                {activeModule === 'data_dict' && (
                                  <span className={`px-2 py-0.2 text-[10px] font-bold rounded border shrink-0 ${
                                    (item.dictCategory || 'reject_reason') === 'reject_reason'
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : item.dictCategory === 'info_category'
                                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                                      : item.dictCategory === 'source_channel'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}>
                                    {item.dictCategoryName || ((item.dictCategory || 'reject_reason') === 'reject_reason' ? '拒绝理由' : '字典分类')}
                                  </span>
                                )}

                                {!isGlobalScope && (
                                  item.isDefault ? (
                                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 font-bold rounded border border-gray-200 shrink-0">
                                      <Lock className="w-2.5 h-2.5 text-gray-400" />
                                      <span>系统默认</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200 shrink-0">
                                      <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                      <span>自定义</span>
                                    </span>
                                  )
                                )}
                              </div>
                              {item.description && (
                                <p className="text-[11px] text-gray-400 line-clamp-1">{item.description}</p>
                              )}
                              {activeModule === 'report_template' && item.fields && item.fields.length > 0 && (
                                <div className="flex items-center space-x-1 pt-0.5">
                                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 text-[10px] bg-blue-50 text-blue-700 border border-blue-100 rounded font-medium">
                                    <Layers className="w-2.5 h-2.5 text-blue-600" />
                                    <span>{item.fields.length} 个自定义字段</span>
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    ({item.fields.filter(f => f.required).length} 必填)
                                  </span>
                                </div>
                              )}

                              {activeModule === 'audit_score' && item.scoreLevels && item.scoreLevels.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                  {item.scoreLevels.map((lvl, lIdx) => (
                                    <span key={lvl.id || lIdx} className="px-1.5 py-0.2 bg-amber-50 text-amber-800 text-[10px] font-mono rounded border border-amber-200/60">
                                      {lvl.levelName}: {lvl.score}分
                                    </span>
                                  ))}
                                </div>
                              )}

                              {activeModule === 'audit_flow' && item.auditNodes && item.auditNodes.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                  {item.auditNodes.map((node, nIdx) => (
                                    <React.Fragment key={node.id || nIdx}>
                                      <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-800 text-[10px] font-medium rounded border border-indigo-200/60 flex items-center space-x-1">
                                        <span className="font-bold">{nIdx + 1}. {node.nodeName}</span>
                                        <span className="text-gray-400">({node.approverRole})</span>
                                      </span>
                                      {nIdx < item.auditNodes!.length - 1 && (
                                        <span className="text-gray-300 text-[10px]">?</span>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              )}

                              {activeModule === 'evaluation_rule' && item.indicators && item.indicators.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                  {item.indicators.slice(0, 3).map((ind, iIdx) => (
                                    <span key={ind.id || iIdx} className="px-1.5 py-0.2 bg-purple-50 text-purple-800 text-[10px] font-medium rounded border border-purple-200/60">
                                      {ind.name}: {ind.basePoints > 0 ? `${ind.basePoints}分` : ind.calcType}
                                    </span>
                                  ))}
                                  {item.indicators.length > 3 && (
                                    <span className="text-[10px] text-purple-400 font-mono">+{item.indicators.length - 3}项指标</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Column 2 */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {activeModule === 'data_dict' ? (
                              <div className="flex flex-col space-y-1 items-start">
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] bg-slate-100 text-slate-800 font-mono font-bold rounded border border-slate-300">
                                  <Hash className="w-2.5 h-2.5 text-slate-500" />
                                  <span>编码: {item.dictCode || `DICT_${item.id}`}</span>
                                </span>
                                <span className="text-[10px] text-gray-500 font-medium">
                                  优先级排序号: <strong className="font-mono font-bold text-gray-700">{item.sortOrder || 1}</strong>
                                </span>
                              </div>
                            ) : activeModule === 'report_template' ? (
                              item.templateType === '激活' ? (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] bg-purple-50 text-purple-700 font-bold rounded border border-purple-200">
                                  <Zap className="w-2.5 h-2.5 text-purple-600" />
                                  <span>激活</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] bg-blue-50 text-blue-700 font-bold rounded border border-blue-200">
                                  <FileText className="w-2.5 h-2.5 text-blue-600" />
                                  <span>报送</span>
                                </span>
                              )
                            ) : activeModule === 'audit_score' ? (
                              <div className="flex flex-col space-y-1 items-start">
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] bg-blue-50 text-blue-700 font-bold rounded border border-blue-200">
                                  <FileText className="w-2.5 h-2.5 text-blue-600" />
                                  <span>关联模版：{item.relatedTemplateName || '标准图文报送模板'}</span>
                                </span>
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] bg-amber-50 text-amber-800 font-bold rounded border border-amber-200">
                                  <Award className="w-2.5 h-2.5 text-amber-600" />
                                  <span>总分 {item.totalScore || 100}分 / {item.levelCount || item.scoreLevels?.length || 5}等级</span>
                                </span>
                              </div>
                            ) : activeModule === 'audit_flow' ? (
                              <div className="flex flex-col space-y-1 items-start">
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] bg-blue-50 text-blue-700 font-bold rounded border border-blue-200">
                                  <FileText className="w-2.5 h-2.5 text-blue-600" />
                                  <span>关联模版：{item.relatedTemplateName || '标准图文报送模板'}</span>
                                </span>
                                <div className="flex items-center space-x-1">
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 font-bold rounded border border-indigo-200">
                                    <GitBranch className="w-2.5 h-2.5 text-indigo-600" />
                                    <span>{item.flowDepth || item.auditNodes?.length || 2}层深度审批</span>
                                  </span>
                                  {item.orgApplyMode === 'all_orgs' ? (
                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200">
                                      <Building2 className="w-2.5 h-2.5 text-emerald-600" />
                                      <span>所有机构同时生效</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] bg-amber-50 text-amber-800 font-bold rounded border border-amber-200">
                                      <Building2 className="w-2.5 h-2.5 text-amber-600" />
                                      <span>单机构使能管控 ({item.orgSettings?.filter(o=>!o.enabled).length || 0}个机构失效)</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : activeModule === 'evaluation_rule' ? (
                              <div className="flex flex-col space-y-1 items-start">
                                {item.evalDimension === 'category' ? (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] bg-purple-50 text-purple-700 font-bold rounded border border-purple-200">
                                    <Layers className="w-2.5 h-2.5 text-purple-600" />
                                    <span>分类考核维度 (关联分类考核)</span>
                                  </span>
                                ) : item.evalDimension === 'org' ? (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] bg-blue-50 text-blue-700 font-bold rounded border border-blue-200">
                                    <Building2 className="w-2.5 h-2.5 text-blue-600" />
                                    <span>机构考核维度 (关联机构考核)</span>
                                  </span>
                                ) : item.evalDimension === 'person' ? (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200">
                                    <UserCheck className="w-2.5 h-2.5 text-emerald-600" />
                                    <span>人员考核维度 (关联人员考核)</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 font-bold rounded border border-indigo-200">
                                    <Award className="w-2.5 h-2.5 text-indigo-600" />
                                    <span>综合全维度考核</span>
                                  </span>
                                )}
                                <span className="text-[10px] text-gray-500 font-medium">
                                  包含 {item.indicators?.length || 0} 项具体考核指标
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 font-mono text-[11px]">-</span>
                            )}
                          </td>

                          {/* Status Column */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {item.status === '启用' ? (
                              <span className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-600 font-bold rounded-full">
                                {activeModule === 'audit_score' ? '启用 (当前生效)' : '启用'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-500 font-bold rounded-full">
                                {activeModule === 'audit_score' ? '停用 (备用)' : '停用'}
                              </span>
                            )}
                          </td>

                          {/* Update Time Column */}
                          <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">
                            {item.updateTime}
                          </td>

                          {/* Actions Column */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center space-x-3">
                              {/* Eye View Button */}
                              <button
                                onClick={() => openPreviewItem(item)}
                                title="查看详情"
                                className="text-gray-400 hover:text-gray-700 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Status Toggle Switch */}
                              <button
                                onClick={() => handleToggleStatus(item.id)}
                                title={item.status === '启用' ? '点击停用' : '点击启用'}
                                className="cursor-pointer"
                              >
                                <div
                                  className={`w-7 h-3.5 flex items-center rounded-full p-0.5 transition-colors ${
                                    item.status === '启用'
                                      ? 'bg-emerald-500 justify-end'
                                      : 'bg-gray-300 justify-start'
                                  }`}
                                >
                                  <div className="w-2.5 h-2.5 bg-white rounded-full shadow-2xs"></div>
                                </div>
                              </button>

                              {/* Edit Button */}
                              {item.isDefault ? (
                                <button
                                  disabled
                                  title="系统默认模板不支持修改"
                                  className="text-gray-300 cursor-not-allowed opacity-50"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => openEditModal(item)}
                                  title="编辑修改模板"
                                  className="text-[#1E5ABB] hover:text-blue-600 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete Button */}
                              {item.isDefault ? (
                                <button
                                  disabled
                                  title="系统默认模板不支持删除"
                                  className="text-gray-300 cursor-not-allowed opacity-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleDelete(item)}
                                  title="删除模板"
                                  className="text-gray-400 hover:text-red-600 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Template Detail Modal */}
      {activeModule === 'report_template' && selectedTemplate && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTemplateId(null)}
        >
          <div
            className="bg-white w-full max-w-2xl max-h-[86vh] rounded-lg shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-gray-800">模板配置详情</h3>
              <button
                type="button"
                onClick={() => setSelectedTemplateId(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="text-sm font-bold text-gray-800 break-words">
                {selectedTemplate.name}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2">
                <div className="rounded-md border border-gray-100 bg-gray-50/70 px-2.5 py-2 min-w-0">
                  <div className="text-[10px] text-gray-400 mb-0.5">模板类型</div>
                  <div className="text-[11px] font-bold text-gray-700 break-words">
                    {selectedTemplate.templateType || '报送'}
                  </div>
                </div>
                <div className="rounded-md border border-gray-100 bg-gray-50/70 px-2.5 py-2 min-w-0">
                  <div className="text-[10px] text-gray-400 mb-0.5">说明描述</div>
                  <div className="text-[11px] text-gray-600 leading-relaxed break-words">
                    {selectedTemplate.description || '暂无模板说明'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">配置字段</span>
                  <span className="text-[11px] text-gray-400">按用户填写界面展示</span>
                </div>

                {renderUserReportPreview(
                  selectedTemplate.fields || [],
                  '当前模板暂未配置字段',
                  selectedTemplate.templateType,
                  'full'
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                disabled={selectedTemplate.isDefault}
                onClick={() => {
                  const item = selectedTemplate;
                  setSelectedTemplateId(null);
                  openEditModal(item);
                }}
                className={selectedTemplate.isDefault ? 'px-3 py-1.5 bg-gray-100 text-gray-400 text-xs font-bold rounded cursor-not-allowed' : 'px-3 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold rounded cursor-pointer'}
              >
                编辑
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Flow Detail Modal */}
      {activeModule === 'audit_flow' && selectedAuditFlow && selectedAuditFlowPreviewData && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAuditFlowId(null)}
        >
          <div
            className="bg-white max-w-[calc(100vw-32px)] max-h-[86vh] rounded-lg shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col overflow-hidden"
            style={{ width: selectedAuditFlowPreviewData.panelWidth }}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-gray-800">审核流程详情</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAuditFlowId(null)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            {(() => {
              const previewData = selectedAuditFlowPreviewData;

              return (
                <>
                  <div className="p-5 space-y-4 text-xs overflow-y-auto overflow-x-hidden">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="text-sm font-bold text-gray-800 break-words">
                        {selectedAuditFlow.name}
                      </div>
                      {!isGlobalScope && (
                        selectedAuditFlow.isDefault ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 font-bold rounded border border-gray-200 shrink-0 whitespace-nowrap">
                            <Lock className="w-2.5 h-2.5 text-gray-400" />
                            <span>系统默认</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200 shrink-0 whitespace-nowrap">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                            <span>自定义</span>
                          </span>
                        )
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {previewData.summaryItems.map(item => (
                        <div key={item.label} className="rounded-md border border-gray-100 bg-gray-50/70 px-2.5 py-2 min-w-0">
                          <div className="text-[10px] text-gray-400 mb-0.5">{item.label}</div>
                          <div className="text-[11px] font-bold text-gray-700 break-words" title={item.value}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-md border border-gray-100 bg-gray-50/70 px-2.5 py-2">
                      <div className="text-[10px] text-gray-400 mb-0.5">说明描述</div>
                      <div className="text-[11px] text-gray-600 leading-relaxed break-words">
                        {selectedAuditFlow.description || '暂无说明描述'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-gray-400 block">审核节点</span>
                      {renderAuditFlowLinearRows(previewData.flowSteps, previewData.flowRows, previewData.stepsPerRow)}
                    </div>
                  </div>

                  <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-end shrink-0">
                    <button
                      type="button"
                      disabled={!isGlobalScope && selectedAuditFlow.isDefault}
                      onClick={() => {
                        const item = selectedAuditFlow;
                        setSelectedAuditFlowId(null);
                        openEditModal(item);
                      }}
                      className={(!isGlobalScope && selectedAuditFlow.isDefault)
                        ? 'inline-flex items-center gap-1 px-3 py-1.5 text-xs text-gray-300 bg-gray-50 border border-gray-200 cursor-not-allowed rounded'
                        : 'inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[#1E5ABB] border border-blue-200 hover:bg-blue-50 rounded cursor-pointer'}
                      title={(!isGlobalScope && selectedAuditFlow.isDefault) ? '系统默认流程仅支持查看' : '编辑审核流程'}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>编辑</span>
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Audit Flow Linear Preview Modal */}
      {auditFlowPreviewItem && (() => {
        const previewData = buildAuditFlowLinearPreviewData(auditFlowPreviewItem);

        return (
          <div
            className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
            onClick={() => setAuditFlowPreviewItem(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-[calc(100vw-32px)] overflow-hidden animate-in fade-in zoom-in-95"
              style={{ width: previewData.panelWidth }}
              onClick={e => e.stopPropagation()}
            >
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <GitBranch className="w-4 h-4 text-[#1E5ABB] shrink-0" />
                  <span className="text-sm font-bold text-gray-800 truncate">{auditFlowPreviewItem.name}</span>
                  {!isGlobalScope && (
                    auditFlowPreviewItem.isDefault ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 font-bold rounded border border-gray-200 shrink-0 whitespace-nowrap">
                        <Lock className="w-2.5 h-2.5 text-gray-400" />
                        <span>系统默认</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200 shrink-0 whitespace-nowrap">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        <span>自定义</span>
                      </span>
                    )
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setAuditFlowPreviewItem(null)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  title="关闭"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {previewData.summaryItems.map(item => (
                    <div key={item.label} className="rounded-md border border-gray-100 bg-gray-50/70 px-2.5 py-2 min-w-0">
                      <div className="text-[10px] text-gray-400 mb-0.5">{item.label}</div>
                      <div className="text-[11px] font-bold text-gray-700 break-words" title={item.value}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 rounded-md border border-gray-100 bg-gray-50/70 px-2.5 py-2">
                  <div className="text-[10px] text-gray-400 mb-0.5">说明描述</div>
                  <div
                    className="text-[11px] text-gray-600 leading-relaxed line-clamp-2"
                    title={auditFlowPreviewItem.description || '暂无说明描述'}
                  >
                    {auditFlowPreviewItem.description || '暂无说明描述'}
                  </div>
                </div>
              </div>

              <div className="px-5 py-5">
                {renderAuditFlowLinearRows(previewData.flowSteps, previewData.flowRows, previewData.stepsPerRow)}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Detail Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`bg-white rounded-lg shadow-xl w-full ${activeModule === 'report_template' ? 'max-w-4xl' : activeModule === 'audit_score' ? 'max-w-2xl' : 'max-w-lg'} overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col`}>
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0">
              <h3 className="text-sm font-bold text-gray-800">
                {activeModule === 'audit_score' ? '审核打分规则详情' : activeModule === 'stats_metric' ? '指标详情' : activeModule === 'login_method' ? '登录方式详情' : activeModule === 'data_dict' ? '数据字典详情' : '配置详情'}{activeModule === 'audit_score' ? '' : ` - ${previewItem.name}`}
              </h3>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs flex-1 overflow-y-auto">
              {activeModule === 'stats_metric' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400 block mb-1">指标名称:</span>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-bold text-gray-800 text-sm">{previewItem.name}</span>
                      <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 font-bold rounded border border-gray-200">
                        <Lock className="w-2.5 h-2.5 text-gray-400" />
                        <span>系统默认</span>
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 rounded border border-indigo-100 font-bold">
                        {getMetricCategoryLabel(previewItem.metricCategory)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-400 block mb-1">指标分类:</span>
                      <span className="font-bold text-gray-800">{getMetricCategoryLabel(previewItem.metricCategory)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">展示名称:</span>
                      <span className="font-bold text-gray-800">{previewItem.displayName || previewItem.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">单位:</span>
                      <span className="font-bold text-gray-800">{previewItem.unit || getMetricCalcMeta(previewItem.calcType).unit}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">未来二次计算:</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border inline-block ${
                        previewItem.supportsDerived
                          ? 'bg-violet-50 text-violet-700 border-violet-100'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {previewItem.supportsDerived ? '支持' : '不支持'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 block mb-1">计算方式:</span>
                    <p className="p-2.5 bg-blue-50/40 rounded border border-blue-100 text-gray-700 leading-relaxed">
                      {previewItem.formulaText || getMetricCalcMeta(previewItem.calcType).description}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-400 block mb-1">指标说明:</span>
                    <p className="p-2.5 bg-gray-50 rounded border border-gray-100 text-gray-700 leading-relaxed">
                      {previewItem.description || '暂无详细补充说明'}
                    </p>
                  </div>
                </div>
              )}

              {activeModule === 'login_method' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400 block mb-1">登录方式:</span>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-bold text-gray-800 text-sm">{previewItem.name}</span>
                      {previewItem.isDefault && (
                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 font-bold rounded border border-gray-200">
                          <Lock className="w-2.5 h-2.5 text-gray-400" />
                          <span>系统默认</span>
                        </span>
                      )}
                      {previewItem.isFallback && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-700 border border-blue-100 font-bold rounded">
                          兜底入口
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-400 block mb-1">类型/来源:</span>
                      <span className="font-bold text-gray-800">{previewItem.loginTypeName || '系统登录'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">配置状态:</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        previewItem.configStatus === '已配置' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {previewItem.configStatus || '待配置'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">启用状态:</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        previewItem.status === '启用' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {previewItem.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">更新时间:</span>
                      <span className="font-mono text-gray-600">{previewItem.updateTime}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 block mb-1">配置说明:</span>
                    <p className="p-2.5 bg-gray-50 rounded border border-gray-100 text-gray-700 leading-relaxed">
                      {previewItem.description || '暂无详细补充说明'}
                    </p>
                  </div>
                </div>
              )}

              {activeModule === 'data_dict' && (
                <div className="space-y-4">
                  {(() => {
                    const dictMeta = getDictCategoryMeta(previewItem.dictCategory);
                    return (
                      <>
                        <div>
                          <span className="text-gray-400 block mb-1">
                            {(previewItem.dictCategory || 'reject_reason') === 'reject_reason' ? '驳回理由名称:' : '字典项名称:'}
                          </span>
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="font-bold text-gray-800 text-sm">{previewItem.name}</span>
                            <span className={`px-1.5 py-0.5 text-[10px] rounded border font-bold ${getDictCategoryBadge(previewItem.dictCategory)}`}>
                              {dictMeta.fullLabel}
                            </span>
                            {!isGlobalScope && (
                              previewItem.isDefault ? (
                                <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 font-bold rounded border border-gray-200">
                                  <Lock className="w-2.5 h-2.5 text-gray-400" />
                                  <span>系统默认</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200">
                                  <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>自定义</span>
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-gray-400 block mb-1">所属分类:</span>
                            <span className="font-bold text-gray-800">{dictMeta.label}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block mb-1">状态:</span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              previewItem.status === '启用' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {previewItem.status}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 block mb-1">更新时间:</span>
                            <span className="font-mono text-gray-600">{previewItem.updateTime}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-gray-400 block mb-1">字典编码:</span>
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] bg-slate-100 text-slate-800 font-mono font-bold rounded border border-slate-300">
                            <Hash className="w-2.5 h-2.5 text-slate-500" />
                            <span>{previewItem.dictCode || buildDictCode(previewItem.dictCategory || 'reject_reason', previewItem.sortOrder)}</span>
                          </span>
                        </div>

                        <div>
                          <span className="text-gray-400 block mb-1">
                            {(previewItem.dictCategory || 'reject_reason') === 'reject_reason' ? '审核员提示说明:' : '业务说明:'}
                          </span>
                          <p className="p-2.5 bg-gray-50 rounded border border-gray-100 text-gray-700 leading-relaxed">
                            {previewItem.description || dictMeta.description}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {activeModule === 'audit_score' && (() => {
                const levels = previewItem.scoreLevels || [];
                const isEnabled = previewItem.status === '启用';
                const levelCount = previewItem.levelCount || levels.length || 0;

                return (
                  <div className="space-y-4">
                    <div className="text-sm font-bold text-gray-800 break-words">
                      {previewItem.name}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="rounded-md border border-gray-100 bg-gray-50/70 px-2.5 py-2 min-w-0">
                        <div className="text-[10px] text-gray-400 mb-0.5">适用范围</div>
                        <div className="text-[11px] font-bold text-blue-700 truncate">全部上报统一适用</div>
                      </div>
                      <div className="rounded-md border border-gray-100 bg-gray-50/70 px-2.5 py-2 min-w-0">
                        <div className="text-[10px] text-gray-400 mb-0.5">规则总分</div>
                        <div className="text-[11px] font-bold text-amber-700">{previewItem.totalScore || 100} 分 / {levelCount} 等级</div>
                      </div>
                      <div className="rounded-md border border-gray-100 bg-gray-50/70 px-2.5 py-2 min-w-0">
                        <div className="text-[10px] text-gray-400 mb-0.5">规则状态</div>
                        <div className={`text-[11px] font-bold ${isEnabled ? 'text-emerald-700' : 'text-gray-500'}`}>
                          {isEnabled ? '启用（当前生效）' : '停用（备用规则）'}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border border-gray-100 bg-gray-50/70 px-2.5 py-2">
                      <div className="text-[10px] text-gray-400 mb-0.5">说明描述</div>
                      <div className="text-[11px] text-gray-600 leading-relaxed break-words">
                        {previewItem.description || '暂无规则说明'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-gray-800">等级评分方案</span>
                        <span className="text-[11px] text-gray-400">互斥命中一个等级得分</span>
                      </div>

                      <div className="rounded-md border border-gray-100 bg-gray-50/70 p-2.5 space-y-2">
                        {levels.length > 0 ? levels.map((level, index) => (
                          <div key={level.id || index} className="flex items-center justify-between gap-3 rounded border border-gray-100 bg-white px-3 py-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-50 px-1 text-[10px] font-bold text-[#1E5ABB]">
                                  {index + 1}
                                </span>
                                <span className="font-bold text-gray-800 truncate">{level.levelName}</span>
                              </div>
                              {level.description && (
                                <div className="mt-1 pl-7 text-[10px] text-gray-400 truncate" title={level.description}>
                                  {level.description}
                                </div>
                              )}
                            </div>
                            <span className="shrink-0 font-mono text-sm font-bold text-amber-700">{level.score} 分</span>
                          </div>
                        )) : (
                          <div className="py-6 text-center text-[11px] text-gray-400">暂未配置等级评分方案</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {activeModule !== 'report_template' && activeModule !== 'stats_metric' && activeModule !== 'login_method' && activeModule !== 'data_dict' && activeModule !== 'audit_score' && (
              <div>
                <span className="text-gray-400 block mb-1">配置项名称:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-800 text-sm">{previewItem.name}</span>
                  {previewItem.isDefault ? (
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 font-bold rounded border border-gray-200">
                      <Lock className="w-2.5 h-2.5 text-gray-400" />
                      <span>系统默认</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                      <span>自定义</span>
                    </span>
                  )}
                </div>
              </div>
              )}

              {activeModule !== 'report_template' && activeModule !== 'stats_metric' && activeModule !== 'login_method' && activeModule !== 'data_dict' && activeModule !== 'audit_score' && (
              <div className="grid grid-cols-2 gap-3">
                {activeModule === 'report_template' && (
                  <div>
                    <span className="text-gray-400 block mb-1">模板类型:</span>
                    {previewItem.templateType === '激活' ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] bg-purple-50 text-purple-700 font-bold rounded border border-purple-200">
                        <Zap className="w-2.5 h-2.5 text-purple-600" />
                        <span>激活模板</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] bg-blue-50 text-blue-700 font-bold rounded border border-blue-200">
                        <FileText className="w-2.5 h-2.5 text-blue-600" />
                        <span>模版配置</span>
                      </span>
                    )}
                  </div>
                )}

                {activeModule === 'audit_score' && (
                  <>
                    <div>
                      <span className="text-gray-400 block mb-1">适用范围:</span>
                      <span className="font-bold text-blue-900 text-xs flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>全部上报统一适用</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">规则总分 / 等级数:</span>
                      <span className="font-bold text-[#1E5ABB] text-xs">
                        {previewItem.totalScore || 100} 分（分 {previewItem.levelCount || previewItem.scoreLevels?.length || 5} 个等级）
                      </span>
                    </div>
                  </>
                )}

                {activeModule === 'audit_flow' && (
                  <>
                    <div>
                      <span className="text-gray-400 block mb-1">关联上报模版:</span>
                      <span className="font-bold text-blue-900 text-xs flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>{previewItem.relatedTemplateName || '标准图文报送模板'}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">流程深度 / 机构生效模式:</span>
                      <span className="font-bold text-indigo-900 text-xs flex items-center space-x-1">
                        <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{previewItem.flowDepth || previewItem.auditNodes?.length || 2} 层审批 ({previewItem.orgApplyMode === 'all_orgs' ? '所有机构同时生效' : '针对单机构使能管控'})</span>
                      </span>
                    </div>
                  </>
                )}

                <div>
                  <span className="text-gray-400 block mb-1">属性状态:</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full inline-block ${
                      previewItem.status === '启用'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {previewItem.status} {previewItem.status === '启用' ? '(当前生效)' : '(未启用)'}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block mb-1">最后更新时间:</span>
                  <span className="font-mono text-gray-600">{previewItem.updateTime}</span>
                </div>
              </div>
              )}

              {activeModule !== 'report_template' && activeModule !== 'stats_metric' && activeModule !== 'login_method' && activeModule !== 'data_dict' && activeModule !== 'audit_score' && (
              <div>
                <span className="text-gray-400 block mb-1">业务说明:</span>
                <p className="p-2.5 bg-gray-50 rounded border border-gray-100 text-gray-700 leading-relaxed">
                  {previewItem.description || '暂无详细补充说明'}
                </p>
              </div>
              )}

              {/* Evaluation Rule Reference & Indicator Breakdown Preview */}
              {activeModule === 'evaluation_rule' && (
                (() => {
                  const target = previewItem.evalTarget || (previewItem.evalDimension === 'org' ? 'org' : previewItem.evalDimension === 'category' ? 'category' : 'person');
                  return (
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-900 space-y-1.5">
                        <div className="font-bold flex items-center space-x-1.5 text-xs">
                          <Award className="w-4 h-4 text-[#1E5ABB]" />
                          <span>考核评分规则</span>
                        </div>
                        <p className="text-[11px] text-blue-800 leading-relaxed">
                          统计指标的原始计算方式来自统计指标库，考核配置页只维护目标、权重、评分分段和考核等次。
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-800 flex items-center gap-1.5 text-xs">
                            <FileText className="w-3.5 h-3.5 text-[#1E5ABB]" />
                            得分口径
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getEvaluationTargetBadge(target)}`}>
                            {getEvaluationTargetLabel(target)}
                          </span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs font-mono font-bold text-gray-800 leading-relaxed">
                          {previewItem.fixedFormula || '最终得分 = Σ（各启用统计指标按分段规则折算后的得分）'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2.5 rounded border border-gray-100 bg-white">
                          <span className="text-[11px] text-gray-400 block mb-1">目标配置</span>
                          <span className="font-bold text-gray-800 text-[11px]">{getEvaluationTargetSummary(previewItem)}</span>
                        </div>
                        <div className="p-2.5 rounded border border-gray-100 bg-white">
                          <span className="text-[11px] text-gray-400 block mb-1">启用周期</span>
                          <span className="font-bold text-gray-800">{getEvaluationPeriodText(previewItem.enabledPeriods)}</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded border border-gray-100 bg-white">
                        <span className="text-[11px] text-gray-400 block mb-1">统计指标评分</span>
                        <div className="space-y-2">
                          {(previewItem.evalMetricRules || []).map(rule => (
                            <div key={rule.id} className="p-2 rounded border border-gray-100 bg-gray-50/60">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-gray-800">{rule.metricName}</span>
                                <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded font-bold">
                                  {rule.enabled ? `${rule.weight}%` : '停用'}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1">{rule.metricFormula}</p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {rule.scoreMode === 'ratio' ? '得分比例' : '固定分值'} / {rule.segments.length} 个分段
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-2.5 rounded border border-gray-100 bg-white">
                        <span className="text-[11px] text-gray-400 block mb-1">考核等次</span>
                        <div className="flex flex-wrap gap-2">
                          {(previewItem.evalGrades || []).map(grade => (
                            <span key={grade.id} className="px-2 py-1 rounded border border-emerald-100 bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                              {grade.name}: {grade.minScore}-{grade.maxScore}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-2.5 rounded border border-gray-100 bg-gray-50">
                        <span className="text-[11px] text-gray-400 block mb-1">配置说明</span>
                        <p className="text-[11px] text-gray-600 leading-relaxed">
                          {previewItem.parameterDescription || getEvaluationParameterDescription(target)}
                        </p>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Audit Flow Breakdown Preview */}
              {activeModule === 'audit_flow' && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  {/* Nodes breakdown */}
                  {previewItem.auditNodes && previewItem.auditNodes.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800 flex items-center space-x-1 text-xs">
                          <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
                          <span>审批流程节点及责任人 ({previewItem.auditNodes.length} 级深度)</span>
                        </span>
                      </div>
                      <div className="bg-indigo-50/40 p-3 rounded-lg border border-indigo-200/60 space-y-2">
                        {previewItem.auditNodes.map((node, idx) => (
                          <div key={node.id || idx} className="bg-white p-2.5 rounded border border-indigo-100 shadow-2xs flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <div>
                                <div className="font-bold text-gray-800 text-xs">{node.nodeName}</div>
                                <div className="text-[11px] text-gray-500 flex items-center space-x-1 mt-0.5">
                                  <UserCheck className="w-3 h-3 text-indigo-500" />
                                  <span>审批角色: <strong className="text-indigo-900 font-semibold">{node.approverRole}</strong></span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-mono rounded border border-indigo-200">
                              <Clock className="w-3 h-3 text-indigo-500" />
                              <span>限时 {node.timeLimitMinutes || 15} 分钟</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Organization Scope Breakdown */}
                  <div className="space-y-2">
                    <span className="font-bold text-gray-800 flex items-center space-x-1 text-xs">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>机构适用范围与使能状态</span>
                    </span>
                    {previewItem.orgApplyMode === 'all_orgs' ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-medium flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>全域生效模式：系统内部全部注册机构/部门均同时统一运行此审核流程。</span>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2">
                        <p className="text-[11px] text-gray-500 font-medium">单机构使能管控列表:</p>
                        <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                          {(previewItem.orgSettings || []).map(org => (
                            <div key={org.orgId} className={`p-1.5 rounded border text-[11px] flex items-center justify-between ${
                              org.enabled ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-rose-50/80 border-rose-200 text-rose-900'
                            }`}>
                              <span className="truncate">{org.orgName}</span>
                              <span className={`px-1 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                                org.enabled ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                              }`}>
                                {org.enabled ? '生效' : '失效'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Value Added Module Feature Introduction */}
              {activeModule === 'value_added' && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-lg space-y-2">
                    <div className="font-bold text-amber-900 flex items-center space-x-1.5 text-xs">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>增值业务【{previewItem.name}】功能说明与开通指导</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      本增值业务通过底层算力与高级权限管控引擎深度集成，旨在提高线索处置、数据分析与跨部门协同处置效能。
                    </p>
                    <div className="bg-white p-2.5 rounded border border-amber-200/80 text-[11px] text-gray-700 space-y-1">
                      <div className="font-bold text-gray-800">· 在线申请开通步骤说明：</div>
                      <p className="text-gray-600">1. 由所在单位/部门系统管理员向运营维护统筹部门提交《增值扩展业务申请表》；</p>
                      <p className="text-gray-600">2. 审核通过后，管理员将在系统后台进行对应节点功能标识 (<strong>{previewItem.dictCode || `VA_${previewItem.id}`}</strong>) 授权；</p>
                      <p className="text-gray-600">3. 授权生效后全网即刻解锁相应业务功能模块与组件界面。</p>
                    </div>
                  </div>
                </div>
              )}

              {activeModule === 'report_template' && previewItem.fields && (
                <div className="space-y-3">
                  <div className="bg-blue-50/30 p-2.5 rounded border border-blue-100 flex items-center justify-between">
                    <span className="font-bold text-[#1E5ABB] flex items-center space-x-1">
                      <Layers className="w-3.5 h-3.5 text-[#1E5ABB]" />
                      <span>用户真实上报界面预览</span>
                    </span>
                    <span className="text-[11px] text-gray-500">
                      当前模板包含 {previewItem.fields.length} 个字段
                    </span>
                  </div>
                  {renderUserReportPreview(
                    previewItem.fields,
                    '当前模板暂未配置字段',
                    previewItem.templateType,
                    'full'
                  )}
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60 flex items-center justify-end gap-2 shrink-0">
              {activeModule === 'audit_score' || activeModule === 'data_dict' ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(null)}
                    className="px-4 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-pointer text-xs"
                  >
                    关闭
                  </button>
                  <button
                    type="button"
                    disabled={!isGlobalScope && previewItem.isDefault}
                    onClick={() => {
                      const item = previewItem;
                      setPreviewItem(null);
                      openEditModal(item);
                    }}
                    className={(!isGlobalScope && previewItem.isDefault)
                      ? 'inline-flex items-center gap-1 px-3 py-1.5 text-xs text-gray-300 bg-gray-50 border border-gray-200 cursor-not-allowed rounded'
                      : 'inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[#1E5ABB] border border-blue-200 hover:bg-blue-50 rounded cursor-pointer font-bold'}
                    title={(!isGlobalScope && previewItem.isDefault) ? '系统默认项仅支持查看' : '编辑此配置项'}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>编辑</span>
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setPreviewItem(null)}
                    className="px-4 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewItem(null)}
                    className="px-4 py-1.5 bg-[#1E5ABB] text-white rounded font-bold hover:bg-[#134092] cursor-pointer"
                  >
                    保存配置
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Metric Rule Modal */}
      {metricModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0">
              <h3 className="text-sm font-bold text-gray-800">
                新增统计指标规则
              </h3>
              <button
                onClick={() => setMetricModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveMetric} className="p-5 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">规则名称 *</label>
                  <input
                    type="text"
                    required
                    value={metricName}
                    onChange={(e) => {
                      setMetricName(e.target.value);
                      if (!metricDisplayName) setMetricDisplayName(e.target.value);
                    }}
                    placeholder="如: 今日新增上报指标"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">前台展示名称</label>
                  <input
                    type="text"
                    value={metricDisplayName}
                    onChange={(e) => setMetricDisplayName(e.target.value)}
                    placeholder="如: 今日新增上报"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">系统支持计算口径 *</label>
                  <select
                    value={metricCalcType}
                    onChange={(e) => {
                      const next = e.target.value as MetricCalcType;
                      const meta = getMetricCalcMeta(next);
                      setMetricCalcType(next);
                      setMetricUnit(meta.unit);
                    }}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white"
                  >
                    {metricCalcOptions.map(option => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">统计周期 *</label>
                  <select
                    value={metricPeriod}
                    onChange={(e) => setMetricPeriod(e.target.value as MetricRule['period'])}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white"
                  >
                    {metricPeriodOptions.map(option => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">单位</label>
                  <input
                    type="text"
                    value={metricUnit}
                    onChange={(e) => setMetricUnit(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">说明描述</label>
                  <input
                    type="text"
                    value={metricDesc}
                    onChange={(e) => setMetricDesc(e.target.value)}
                    placeholder={getMetricCalcMeta(metricCalcType).description}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">绑定展示位置 * <span className="text-gray-400 font-normal">可多选，保存后可在页面绑定区继续换绑</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {metricPageOptions.map(page => {
                    const checked = metricPages.includes(page.id);
                    return (
                      <button
                        type="button"
                        key={page.id}
                        onClick={() => toggleMetricPage(page.id)}
                        className={`p-2.5 rounded border text-left cursor-pointer transition-colors ${
                          checked
                            ? 'bg-blue-50 border-blue-300 text-[#1E5ABB]'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {checked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 text-gray-300" />}
                          <span className="font-bold">{page.label}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 pl-5">{page.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800">
                新建规则仅允许选择系统内置计算口径，不支持编辑底层计算公式。保存后可在“展示位置绑定”中换绑到首页或统计管理页面点位。
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setMetricModalOpen(false)}
                  className="px-4 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1E5ABB] text-white rounded font-bold hover:bg-[#134092] cursor-pointer"
                >
                  保存指标规则
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`relative bg-white rounded-lg shadow-xl w-full ${activeModule === 'audit_flow' ? 'max-w-6xl' : activeModule === 'report_template' ? 'max-w-6xl' : activeModule === 'audit_score' || activeModule === 'evaluation_rule' ? 'max-w-3xl' : 'max-w-md'} overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col`}>
            {/* Header */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <h3 className="text-sm font-bold text-gray-800">
                  {editingItem ? (activeModule === 'audit_flow' ? '编辑审核流程层级设计' : `编辑${currentModuleLabel}`) : (activeModule === 'audit_flow' ? '新增审核流程层级设计' : `新增${currentModuleLabel}`)}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveModal} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Basic Fields */}
              {activeModule === 'audit_score' ? (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">规则名称</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        placeholder="如：标准五级百分制打分规则组"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                      />
                    </div>

                    <div className="flex items-end">
                      <div className="w-full px-3 py-1.5 border border-gray-200 rounded bg-gray-50 text-gray-600 font-bold">
                        全部上报统一适用
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[120px_120px_180px_1fr] gap-3 items-end">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">总分</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min={1}
                          max={1000}
                          required
                          value={formTotalScore}
                          onChange={e => setFormTotalScore(Number(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] font-mono text-sm font-bold text-gray-800"
                        />
                        <span className="text-gray-500 font-bold shrink-0">分</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">等级</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min={2}
                          max={10}
                          required
                          value={formLevelCount}
                          onChange={e => handleLevelCountChange(Number(e.target.value) || 2)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] font-mono text-sm font-bold text-gray-800"
                        />
                        <span className="text-gray-500 font-bold shrink-0">个</span>
                      </div>
                    </div>

                    {renderFormStatusSegment('启用状态 *')}

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">说明</label>
                      <input
                        type="text"
                        value={formDesc}
                        onChange={e => setFormDesc(e.target.value)}
                        placeholder="请输入适用场景..."
                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                      />
                    </div>
                  </div>
                </div>
              ) : activeModule === 'login_method' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">登录方式名称</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-gray-50 text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">类型/来源</label>
                      <div className="px-3 py-1.5 border border-gray-200 rounded bg-gray-50 text-gray-700 font-bold">
                        {editingItem?.loginTypeName || '系统登录'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">配置状态 *</label>
                      <select
                        value={formLoginConfigStatus}
                        onChange={e => setFormLoginConfigStatus(e.target.value as '已配置' | '待配置')}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white cursor-pointer font-bold text-gray-800"
                      >
                        <option value="已配置">已配置</option>
                        <option value="待配置">待配置</option>
                      </select>
                    </div>

                    {renderFormStatusSegment('启用状态 *')}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">配置说明</label>
                    <textarea
                      rows={3}
                      value={formDesc}
                      onChange={e => setFormDesc(e.target.value)}
                      placeholder="请输入该登录方式的配置说明..."
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] text-xs"
                    />
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-100 rounded text-[11px] text-blue-800 leading-relaxed">
                    账号密码为系统默认兜底方式，不可删除；微信扫码和手机短信验证码为系统内置扩展登录入口。MFA 等二次认证能力建议后续放入安全策略配置。
                  </div>
                </div>
              ) : activeModule === 'audit_flow' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1 text-xs">审核流程名称 *</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        placeholder="请输入审核流程规则名称..."
                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] text-xs"
                      />
                    </div>

                    {renderFormStatusSegment('启用状态 *')}

                    <div>
                      <label className="block text-gray-700 font-medium mb-1 text-xs">说明描述</label>
                      <input
                        type="text"
                        value={formDesc}
                        onChange={e => setFormDesc(e.target.value)}
                        placeholder="请输入适用场景与责任主体说明..."
                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] text-xs"
                      />
                    </div>
                  </div>

                  {/* Flow Mode Selection Segment */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-gray-500" />
                        <span>审核流程模式 *</span>
                      </span>
                      <span className="text-xs font-semibold text-[#1677ff] bg-[#e6f4ff] px-2.5 py-0.5 rounded-full">
                        当前选中: {formFlowMode === 'adaptive' ? '逐级审核' : formFlowMode === 'max_n' ? `最多${formFlowDepth || 3}级审核` : '直接总机构审核'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Card 1: 模式一: 逐级审核 */}
                      <button
                        type="button"
                        onClick={() => handleSelectFlowMode('adaptive')}
                        className={`rounded-xl p-3.5 text-left cursor-pointer transition-all flex flex-col justify-between bg-white ${
                          formFlowMode === 'adaptive'
                            ? 'border-2 border-[#1677ff] shadow-xs'
                            : 'border border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-gray-900">模式一: 逐级审核</span>
                          <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                            推荐
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          沿组织树逐级向上传递复核，最终由总机构终审并评分（自适应组织深度）。
                        </p>
                      </button>

                      {/* Card 2: 模式二: 最多N级审核 */}
                      <button
                        type="button"
                        onClick={() => handleSelectFlowMode('max_n')}
                        className={`rounded-xl p-3.5 text-left cursor-pointer transition-all flex flex-col justify-between bg-white ${
                          formFlowMode === 'max_n'
                            ? 'border-2 border-[#1677ff] shadow-xs'
                            : 'border border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-gray-900">模式二: 最多N级审核</span>
                          <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-amber-50 text-amber-600 border border-amber-200">
                            上限截断
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          下级提报后至多经过 {formFlowDepth || 3} 级中间机构审核，超出部分直接穿透至总机构。
                        </p>
                      </button>

                      {/* Card 3: 模式三: 直接总机构审核 */}
                      <button
                        type="button"
                        onClick={() => handleSelectFlowMode('direct')}
                        className={`rounded-xl p-3.5 text-left cursor-pointer transition-all flex flex-col justify-between bg-white ${
                          formFlowMode === 'direct'
                            ? 'border-2 border-[#1677ff] shadow-xs'
                            : 'border border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-gray-900">模式三: 直接总机构审核</span>
                          <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-purple-50 text-purple-600 border border-purple-200">
                            极速直达
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          跳过所有下级中间机构，提报后直接由总机构管理员终审并评分结案。
                        </p>
                      </button>
                    </div>

                    {/* If Mode 2 is selected: display the Depth bar */}
                    {formFlowMode === 'max_n' && (
                      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 mt-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                            <span>🎚️</span>
                            <span>中间机构审核上限:</span>
                          </span>
                          <div className="flex items-center space-x-1.5">
                            {[1, 2, 3, 4, 5].map(depth => (
                              <button
                                key={depth}
                                type="button"
                                onClick={() => handleMaxNDepthChange(depth)}
                                className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                                  (formFlowDepth || 3) === depth
                                    ? 'bg-amber-500 text-white font-bold shadow-xs'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-amber-100/50'
                                }`}
                              >
                                {depth} 级
                              </button>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-amber-700 font-medium">
                          (不足 {formFlowDepth || 3} 级时按实际层级流转，超出则直达总机构)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : activeModule === 'data_dict' ? (
                <div className="space-y-3">
                  {(() => {
                    const currentDictMeta = getDictCategoryMeta(formDictCategory);
                    const isRejectReasonForm = formDictCategory === 'reject_reason';
                    const isPersonnelRoleForm = formDictCategory === 'info_category';
                    return (
                      <>
                  <div className={isPersonnelRoleForm ? 'grid grid-cols-1 sm:grid-cols-3 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'}>
                    {isPersonnelRoleForm && (
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">角色分类 *</label>
                        <div className="inline-flex w-full rounded border border-gray-300 bg-white p-1">
                          {(['上报员', '审核员'] as const).map((role) => {
                            const selected = formPersonnelRoleGroup === role;
                            return (
                              <button
                                key={role}
                                type="button"
                                onClick={() => {
                                  setFormPersonnelRoleGroup(role);
                                  setFormDesc(prev => {
                                    if (!prev.trim() || prev.includes('角色标签')) {
                                      return `${role}角色标签`;
                                    }
                                    return prev;
                                  });
                                }}
                                className={`flex-1 rounded px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors ${
                                  selected
                                    ? 'bg-[#1E5ABB] text-white shadow-2xs'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                {role}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        {isRejectReasonForm ? '驳回理由名称 *' : '字典项名称 *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        placeholder={isRejectReasonForm ? '如: 信息真实性核查不通过' : `请输入${currentDictMeta.label}名称`}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                      />
                    </div>

                    {renderFormStatusSegment('启用状态 *')}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      {isRejectReasonForm ? '驳回说明' : '字典说明'}
                    </label>
                    <textarea
                      rows={2}
                      value={formDesc}
                      onChange={e => setFormDesc(e.target.value)}
                      placeholder={isRejectReasonForm ? '如: 缺乏实质性事实依据或为虚假流言，审核人选择此项将触发退回修改提示...' : '请输入该字典项的业务说明...'}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] text-xs"
                    />
                  </div>
                      </>
                    );
                  })()}
                </div>
              ) : activeModule === 'value_added' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">增值业务名称 *</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        placeholder="如: 批量审核 / 截图取证"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">业务编码 *</label>
                      <input
                        type="text"
                        required
                        value={formDictCode}
                        onChange={e => setFormDictCode(e.target.value)}
                        placeholder="如: VA_BATCH_AUDIT"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] font-mono font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">业务使用说明与申请条件</label>
                    <textarea
                      rows={2}
                      value={formDesc}
                      onChange={e => setFormDesc(e.target.value)}
                      placeholder="请输入增值扩展业务功能介绍与申请条件说明..."
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] text-xs"
                    />
                  </div>
                </div>
              ) : activeModule === 'evaluation_rule' ? null : (
                <div className={`grid grid-cols-1 sm:grid-cols-4 gap-3 ${
                  activeModule === 'report_template' && modalActiveTab === 'preview' ? 'hidden' : ''
                }`}>
                  <div className="sm:col-span-1">
                    <label className="block text-gray-700 font-medium mb-1">模板/配置名称 *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder={`请输入${currentModuleLabel}名称...`}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                    />
                  </div>

                  {activeModule === 'report_template' && (
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">模板类型 *</label>
                      <select
                        value={formTemplateType}
                        onChange={e => setFormTemplateType(e.target.value as '报送' | '激活')}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white cursor-pointer font-bold text-gray-800"
                      >
                        <option value="报送">报送</option>
                        <option value="激活">激活</option>
                      </select>
                    </div>
                  )}

                  {activeModule === 'report_template' && renderFormStatusSegment('启用状态 *')}

                  <div className={activeModule === 'report_template' ? 'sm:col-span-1' : 'sm:col-span-2'}>
                    <label className="block text-gray-700 font-medium mb-1">说明描述</label>
                    <input
                      type="text"
                      value={formDesc}
                      onChange={e => setFormDesc(e.target.value)}
                      placeholder="请输入适用场景说明..."
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                    />
                  </div>
                </div>
              )}

              {/* Audit Score Rule Group Builder */}
              {activeModule === 'audit_score' && (() => {
                const invalidScoreCount = formScoreLevels.filter(lvl => lvl.score < 0 || lvl.score > formTotalScore).length;
                const isDescending = formScoreLevels.every((lvl, idx) => idx === 0 || formScoreLevels[idx - 1].score >= lvl.score);
                return (
                  <div className="space-y-3 pt-3 border-t border-gray-200">
                    {/* Score Levels Table */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1 gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold text-gray-800 text-xs">等级评分</span>
                          <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${
                            invalidScoreCount > 0
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : isDescending
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {invalidScoreCount > 0 ? `${invalidScoreCount} 项异常` : isDescending ? '互斥命中' : '建议降序'}
                          </span>
                          <span className="text-[11px] text-gray-400 truncate">
                            {formTotalScore} 分满分，审核时只选一个等级
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddScoreLevel}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>新增等级</span>
                        </button>
                      </div>

                      <div className="bg-gray-50/70 p-3 rounded-lg border border-gray-200 space-y-2 max-h-[300px] overflow-y-auto">
                        {formScoreLevels.map((lvl, index) => (
                          <div
                            key={lvl.id}
                            draggable
                            onDragStart={e => {
                              setDraggingScoreLevelIndex(index);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={e => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                            }}
                            onDrop={() => handleDropScoreLevel(index)}
                            onDragEnd={() => setDraggingScoreLevelIndex(null)}
                            className={`p-2.5 rounded-md border shadow-2xs grid grid-cols-1 sm:grid-cols-[42px_130px_90px_1fr_28px] items-center gap-2 transition-all ${
                              draggingScoreLevelIndex === index
                                ? 'border-blue-400 bg-blue-50/70 opacity-60 scale-[0.99]'
                                : 'bg-white border-gray-200 hover:border-blue-200'
                            }`}
                          >
                            <div
                              className="flex items-center gap-1 text-gray-400 hover:text-blue-600 font-mono text-[11px] cursor-grab active:cursor-grabbing select-none p-1 -m-1 rounded hover:bg-gray-100"
                              title="按住拖拽以调整等级顺序"
                            >
                              <GripVertical className="w-3.5 h-3.5 text-gray-400" />
                              <span>#{index + 1}</span>
                            </div>

                            {/* Level Name */}
                            <div className="w-full">
                              <input
                                type="text"
                                required
                                value={lvl.levelName}
                                onChange={e => handleUpdateScoreLevel(index, { levelName: e.target.value })}
                                placeholder="等级名称(如: 一等)"
                                className="w-full px-2.5 py-1 border border-gray-300 rounded text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                              />
                            </div>

                            {/* Level Score */}
                            <div className="w-full flex items-center space-x-1">
                              <input
                                type="number"
                                min={0}
                                max={formTotalScore}
                                required
                                value={lvl.score}
                                onChange={e => handleUpdateScoreLevel(index, { score: Number(e.target.value) || 0 })}
                                placeholder="分值"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-mono font-bold text-amber-700 text-right focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                              />
                              <span className="text-gray-500 font-bold text-xs shrink-0">分</span>
                            </div>

                            {/* Description */}
                            <div className="w-full">
                              <input
                                type="text"
                                value={lvl.description || ''}
                                onChange={e => handleUpdateScoreLevel(index, { description: e.target.value })}
                                placeholder="评定说明或达标要求..."
                                className="w-full px-2.5 py-1 border border-gray-200 rounded text-xs text-gray-600 placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                              />
                            </div>

                            {/* Delete Level */}
                            <button
                              type="button"
                              onClick={() => handleDeleteScoreLevel(index)}
                              className="p-1 text-gray-400 hover:text-red-600 cursor-pointer justify-self-end"
                              title="删除等级"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Audit Flow Builder (1:1 Restoration) */}
              {activeModule === 'audit_flow' && (() => {
                const selectedIndex = Math.max(
                  0,
                  formAuditNodes.findIndex(node => node.id === selectedAuditNodeId)
                );
                const selectedNode = formAuditNodes[selectedIndex] || formAuditNodes[0];
                return (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Left: 审核节点流转链（共 N 个阶段） */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <LinkIcon className="w-3.5 h-3.5 text-gray-500" />
                            <span>审核节点流转链（共 {formAuditNodes.length} 个阶段）</span>
                          </span>
                          <span className="text-xs text-gray-400 font-normal">
                            点击节点在右侧编辑
                          </span>
                        </div>

                        <div className="border border-gray-200 rounded-xl p-4 bg-white min-h-[420px]">
                          <div className="grid grid-cols-2 gap-3">
                            {formAuditNodes.map((node, index) => {
                              const isSelected = (selectedNode?.id || formAuditNodes[0]?.id) === node.id;
                              const isFinalScore = !!node.isFinalScoreNode;

                              return (
                                <div
                                  key={node.id || index}
                                  onClick={() => setSelectedAuditNodeId(node.id)}
                                  className={`rounded-xl p-3.5 cursor-pointer transition-all flex flex-col justify-between ${
                                    isSelected
                                      ? 'border-2 border-[#1677ff] bg-blue-50/20 shadow-xs'
                                      : 'border border-gray-200 bg-white hover:border-blue-300'
                                  }`}
                                >
                                  <div>
                                    {/* Top Row */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                                          isFinalScore ? 'bg-[#fa8c16]' : 'bg-[#1677ff]'
                                        }`}>
                                          {index + 1}
                                        </span>
                                        {isFinalScore ? (
                                          <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[11px] px-1.5 py-0.5 rounded font-medium ml-1.5 flex items-center gap-0.5">
                                            <span>🎗️</span>
                                            <span>终审评分</span>
                                          </span>
                                        ) : (
                                          <span className="text-xs font-medium text-gray-500 ml-1.5">
                                            第 {index + 1} 阶段
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center space-x-1 text-gray-400">
                                        {isFinalScore ? (
                                          <span className="bg-gray-100 border border-gray-200 text-gray-500 text-[11px] px-1.5 py-0.5 rounded font-normal">
                                            终点
                                          </span>
                                        ) : (
                                          <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xs font-bold">
                                            →
                                          </span>
                                        )}
                                        <Lock className="w-3 h-3 text-gray-400" />
                                      </div>
                                    </div>

                                    {/* Title & Subtitle */}
                                    <div className="mt-2.5">
                                      <h4 className="text-sm font-bold text-gray-900 truncate">
                                        {node.nodeName}
                                      </h4>
                                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                                        {node.assigneeSource === 'org_owner' ? '归属机构负责人' : node.assigneeSource === 'role' ? '按角色' : '指定人员'}
                                      </p>
                                    </div>

                                    {/* Inner Approver Box */}
                                    <div className={`rounded-lg p-2 text-xs font-medium mt-2.5 truncate ${
                                      isFinalScore
                                        ? 'bg-amber-50/70 border border-amber-200 text-amber-900'
                                        : 'bg-gray-50 border border-gray-100 text-gray-600'
                                    }`}>
                                      {isFinalScore
                                        ? (node.approverRole || '总机构管理员')
                                        : (node.assigneeSource === 'org_owner' ? '归属机构负责人' : node.approverRole || '机构管理员')}
                                    </div>
                                  </div>

                                  {/* Bottom Time limit */}
                                  <div className="text-xs text-[#1677ff] font-medium flex items-center gap-1 mt-3">
                                    <Clock className="w-3.5 h-3.5 text-[#1677ff]" />
                                    <span>{node.timeLimitMinutes >= 60 ? `${node.timeLimitMinutes / 60}小时` : `${node.timeLimitMinutes || 15}分`}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Right: 节点属性编辑 (第 X 阶段: XXX) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <span>🎛️</span>
                            <span>节点属性编辑 (第 {selectedIndex + 1} 阶段: {selectedNode?.nodeName})</span>
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-normal flex items-center gap-1">
                            <Lock className="w-3 h-3 text-gray-400" />
                            <span>流程固定节点</span>
                          </span>
                        </div>

                        <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3.5 min-h-[420px]">
                          {selectedNode && (
                            <>
                              {/* If final score node, show notice banner */}
                              {selectedNode.isFinalScoreNode && (
                                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
                                  <span>🎗️</span>
                                  <span>总机构终审通过并完成评分后结案入库</span>
                                </div>
                              )}

                              {/* Row 1: 节点名称 & 处理人来源 */}
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-bold text-gray-800 mb-1">节点名称 *</label>
                                  <input
                                    type="text"
                                    required
                                    value={selectedNode.nodeName}
                                    onChange={e => handleUpdateAuditNode(selectedIndex, { nodeName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-gray-800 mb-1">处理人来源 *</label>
                                  <select
                                    value={selectedNode.assigneeSource || 'role'}
                                    onChange={e => {
                                      const source = e.target.value as AuditNode['assigneeSource'];
                                      handleUpdateAuditNode(selectedIndex, {
                                        assigneeSource: source,
                                        approverRole: source === 'org_owner' ? '归属机构负责人' : source === 'role' ? '总机构管理员' : selectedNode.approverRole
                                      });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    <option value="org_owner">归属机构负责人</option>
                                    <option value="role">按角色</option>
                                    <option value="user">指定人员</option>
                                  </select>
                                </div>
                              </div>

                              {/* Row 2: 动态处理机制 / 角色 / 人员 + 退回规则 */}
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  {selectedNode.assigneeSource === 'org_owner' ? (
                                    <>
                                      <label className="block text-xs font-bold text-gray-800 mb-1">动态处理机制</label>
                                      <div className="bg-emerald-50/70 border border-emerald-200 text-emerald-700 font-medium text-xs px-3 py-2 rounded-lg truncate">
                                        动态匹配归属机构负责人
                                      </div>
                                    </>
                                  ) : selectedNode.assigneeSource === 'user' ? (
                                    <>
                                      <label className="block text-xs font-bold text-gray-800 mb-1">指定审核人员 *</label>
                                      <select
                                        value={selectedNode.assigneeUserName || ''}
                                        onChange={e => handleUpdateAuditNode(selectedIndex, { assigneeUserName: e.target.value, approverRole: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      >
                                        <option value="">请选择人员</option>
                                        {auditUserOptions.map(user => (
                                          <option key={user} value={user}>{user}</option>
                                        ))}
                                      </select>
                                    </>
                                  ) : (
                                    <>
                                      <label className="block text-xs font-bold text-gray-800 mb-1">处理角色 *</label>
                                      <select
                                        value={selectedNode.approverRole || '总机构管理员'}
                                        onChange={e => handleUpdateAuditNode(selectedIndex, { approverRole: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      >
                                        {auditRoleOptions.map(role => (
                                          <option key={role} value={role}>{role}</option>
                                        ))}
                                      </select>
                                    </>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-gray-800 mb-1">退回规则 *</label>
                                  <select
                                    value={selectedNode.rejectStrategy || 'return_submitter'}
                                    onChange={e => handleUpdateAuditNode(selectedIndex, { rejectStrategy: e.target.value as AuditNode['rejectStrategy'] })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    <option value="return_submitter">退回上报人修改</option>
                                    <option value="return_previous">退回上一节点</option>
                                  </select>
                                </div>
                              </div>

                              {/* Row 3: 无负责人处理规则 Box */}
                              <div className="border border-amber-200 bg-amber-50/30 rounded-xl p-3.5 space-y-2">
                                <label className="block text-xs font-bold text-gray-800">无负责人处理规则</label>
                                <select
                                  value={selectedNode.missingRule || 'skip'}
                                  onChange={e => handleUpdateAuditNode(selectedIndex, { missingRule: e.target.value as 'skip' | 'transfer_admin' | 'block' })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="skip">跳过该节点</option>
                                  <option value="transfer_admin">转交总机构管理员</option>
                                  <option value="block">阻断提报</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                  {selectedNode.missingRule === 'transfer_admin'
                                    ? '无负责人时自动转交总机构管理员审核'
                                    : selectedNode.missingRule === 'block'
                                    ? '无负责人时阻断流程提报并提示联系管理员'
                                    : '无负责人时跳过当前节点，流转到下一审核节点'}
                                </p>
                              </div>

                              {/* Row 4: 审核超时提醒 Box */}
                              <div className="border border-gray-200 rounded-xl p-3.5 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                                    <span>审核超时提醒</span>
                                  </span>
                                  {/* Toggle switch */}
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateAuditNode(selectedIndex, { timeoutReminderEnabled: !(selectedNode.timeoutReminderEnabled ?? true) })}
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                      (selectedNode.timeoutReminderEnabled ?? true) ? 'bg-[#1677ff]' : 'bg-gray-200'
                                    }`}
                                  >
                                    <span
                                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                        (selectedNode.timeoutReminderEnabled ?? true) ? 'translate-x-4' : 'translate-x-0'
                                      }`}
                                    />
                                  </button>
                                </div>

                                {(selectedNode.timeoutReminderEnabled ?? true) && (
                                  <>
                                    <div className="flex items-center justify-between gap-2 pt-1">
                                      <div className="flex items-center space-x-2">
                                        {[
                                          { label: '15分', val: 15 },
                                          { label: '30分', val: 30 },
                                          { label: '1小时', val: 60 },
                                          { label: '2小时', val: 120 }
                                        ].map(preset => (
                                          <button
                                            key={preset.val}
                                            type="button"
                                            onClick={() => handleUpdateAuditNode(selectedIndex, { timeLimitMinutes: preset.val })}
                                            className={`px-3 py-1 text-xs rounded-lg font-medium cursor-pointer transition-colors ${
                                              selectedNode.timeLimitMinutes === preset.val
                                                ? 'bg-blue-50 text-[#1677ff] border border-blue-300 font-bold'
                                                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                          >
                                            {preset.label}
                                          </button>
                                        ))}
                                      </div>

                                      <div className="flex items-center space-x-1.5">
                                        <input
                                          type="number"
                                          min="1"
                                          value={selectedNode.timeLimitMinutes || 15}
                                          onChange={e => handleUpdateAuditNode(selectedIndex, { timeLimitMinutes: Number(e.target.value) || 15 })}
                                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded-lg text-center font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                        <span className="text-xs text-gray-500">分钟</span>
                                      </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                      超过设定时限未处理将自动触发超时催办通知。
                                    </p>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Evaluation Rule Builder */}
              {activeModule === 'evaluation_rule' && (
                <div className="space-y-4 pt-3 border-t border-gray-200">
                  <div className="bg-blue-50/60 p-3.5 rounded-lg border border-blue-200/80 space-y-2">
                    <div className="font-bold text-[#1E5ABB] flex items-center gap-1.5 text-xs">
                      <Award className="w-4 h-4" />
                      <span>1. 基础信息</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-md border border-blue-100">
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">方案名称</label>
                        <input type="text" value={formName} disabled className="w-full px-3 py-1.5 border border-gray-200 rounded bg-gray-50 text-gray-500 cursor-not-allowed" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">考核对象</label>
                        <div className={`w-full px-3 py-1.5 border rounded bg-white font-bold ${getEvaluationTargetBadge(formEvalTarget)}`}>
                          {getEvaluationTargetLabel(formEvalTarget)}
                        </div>
                      </div>
                      {renderFormStatusSegment('启用状态')}
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] text-gray-500 mb-1">说明</label>
                        <textarea
                          rows={2}
                          value={formDesc}
                          onChange={e => setFormDesc(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50/40 p-3.5 rounded-lg border border-emerald-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span>2. 目标设置</span>
                      </span>
                      <button type="button" onClick={() => applyEvaluationDayTarget(formTargetDay)} className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer">
                        按日目标重新生成
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {evaluationTargetPeriodOptions.map(option => {
                        const valueMap = {
                          day: formTargetDay,
                          week: formTargetWeek,
                          month: formTargetMonth,
                          quarter: formTargetQuarter,
                          year: formTargetYear
                        };
                        const setterMap = {
                          day: (value: number) => applyEvaluationDayTarget(value),
                          week: (value: number) => { setFormTargetWeek(value); markCustomTargetPeriod('week'); },
                          month: (value: number) => { setFormTargetMonth(value); markCustomTargetPeriod('month'); },
                          quarter: (value: number) => { setFormTargetQuarter(value); markCustomTargetPeriod('quarter'); },
                          year: (value: number) => { setFormTargetYear(value); markCustomTargetPeriod('year'); }
                        };
                        const customized = option.id !== 'day' && formCustomTargetPeriods.includes(option.id);
                        return (
                          <div key={option.id} className="bg-white rounded-md border border-emerald-100 p-2">
                            <label className="text-[11px] text-gray-500 mb-1 flex items-center justify-between">
                              <span>{option.label}</span>
                              {customized && <span className="text-[10px] text-amber-700 font-bold">已自定义</span>}
                            </label>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                value={valueMap[option.id]}
                                onChange={e => setterMap[option.id](Number(e.target.value) || 0)}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                              />
                              <span className="text-[10px] text-gray-400 shrink-0">{option.suffix}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-[11px] text-gray-500 font-bold">启用周期</span>
                      {evaluationPeriodOptions.map(option => {
                        const checked = formEnabledPeriods.includes(option.id);
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => toggleEvaluationPeriod(option.id)}
                            className={`px-2.5 py-1 rounded border text-[11px] font-bold cursor-pointer transition-all ${
                              checked ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-gray-50/70 p-3.5 rounded-lg border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800 flex items-center gap-1.5 text-xs">
                        <ListFilter className="w-4 h-4 text-[#1E5ABB]" />
                        <span>3. 统计指标评分</span>
                      </span>
                      <span className={`text-[11px] font-bold ${formEvalMetricRules.filter(rule => rule.enabled).reduce((sum, rule) => sum + (Number(rule.weight) || 0), 0) === 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        启用权重合计 {formEvalMetricRules.filter(rule => rule.enabled).reduce((sum, rule) => sum + (Number(rule.weight) || 0), 0)}%
                      </span>
                    </div>

                    <div className="bg-white rounded-md border border-gray-200 p-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-500 font-bold">从统计指标库添加</span>
                        <span className="text-[10px] text-gray-400">指标计算方式沿用统计指标库</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {defaultEvaluationMetricLibrary
                          .filter(metric => formEvalTarget !== 'person' || metric.metricId !== '521')
                          .map(metric => {
                            const selected = formEvalMetricRules.some(rule => rule.metricId === metric.metricId);
                            return (
                              <button
                                key={metric.metricId}
                                type="button"
                                disabled={selected}
                                onClick={() => addEvaluationMetricRule(metric.metricId)}
                                className={`px-2.5 py-1 rounded border text-[11px] font-bold ${
                                  selected ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-blue-50 text-[#1E5ABB] border-blue-200 hover:bg-blue-100 cursor-pointer'
                                }`}
                              >
                                {selected ? '已添加 ' : '+ '}{metric.metricName}
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                      {formEvalMetricRules.map((rule, ruleIndex) => (
                        <div key={rule.id} className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{rule.metricName}</span>
                                <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{rule.metricUnit}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${rule.scoreType === 'lower_better' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                  {rule.scoreType === 'lower_better' ? '越低越好' : '越高越好'}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1">{rule.metricFormula}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateEvaluationMetricRule(ruleIndex, { enabled: !rule.enabled })}
                                className={`px-2 py-1 rounded-full border text-[10px] font-bold cursor-pointer ${rule.enabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                              >
                                {rule.enabled ? '已启用' : '已停用'}
                              </button>
                              <button type="button" onClick={() => deleteEvaluationMetricRule(ruleIndex)} className="p-1 text-gray-400 hover:text-red-600 cursor-pointer" title="删除指标绑定">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] text-gray-500 mb-1">权重</label>
                              <div className="flex items-center gap-1">
                                <input type="number" min={0} max={100} value={rule.weight} onChange={e => updateEvaluationMetricRule(ruleIndex, { weight: Number(e.target.value) || 0 })} className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]" />
                                <span className="text-[11px] text-gray-500">%</span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-500 mb-1">得分模式</label>
                              <select value={rule.scoreMode} onChange={e => updateEvaluationMetricRule(ruleIndex, { scoreMode: e.target.value as EvaluationScoreMode })} className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]">
                                <option value="ratio">得分比例</option>
                                <option value="fixed">固定分值</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-500 mb-1">评分方式</label>
                              <div className="px-2 py-1.5 border border-gray-100 rounded bg-gray-50 text-xs font-bold text-gray-700">
                                {rule.scoreType === 'lower_better' ? '时效型分段' : '达成率型分段'}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-gray-500 font-bold">评分分段</span>
                              <button type="button" onClick={() => addEvaluationMetricSegment(ruleIndex)} className="text-[11px] text-[#1E5ABB] hover:underline font-bold cursor-pointer">
                                + 新增分段
                              </button>
                            </div>
                            {rule.segments.map((segment, segmentIndex) => (
                              <div key={segment.id} className="grid grid-cols-12 gap-1.5 items-center">
                                <input value={segment.label} onChange={e => updateEvaluationMetricSegment(ruleIndex, segmentIndex, { label: e.target.value })} className="col-span-3 px-2 py-1.5 border border-gray-200 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]" />
                                <input type="number" value={segment.minValue ?? ''} onChange={e => updateEvaluationMetricSegment(ruleIndex, segmentIndex, { minValue: e.target.value === '' ? undefined : Number(e.target.value) })} placeholder="最小" className="col-span-2 px-2 py-1.5 border border-gray-200 rounded text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]" />
                                <input type="number" value={segment.maxValue ?? ''} onChange={e => updateEvaluationMetricSegment(ruleIndex, segmentIndex, { maxValue: e.target.value === '' ? undefined : Number(e.target.value) })} placeholder="最大" className="col-span-2 px-2 py-1.5 border border-gray-200 rounded text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]" />
                                <input type="number" value={rule.scoreMode === 'ratio' ? segment.scoreRatio : segment.fixedScore} onChange={e => updateEvaluationMetricSegment(ruleIndex, segmentIndex, rule.scoreMode === 'ratio' ? { scoreRatio: Number(e.target.value) || 0 } : { fixedScore: Number(e.target.value) || 0 })} className="col-span-2 px-2 py-1.5 border border-gray-200 rounded text-[11px] font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]" />
                                <span className="col-span-2 text-[10px] text-gray-400">{rule.scoreMode === 'ratio' ? '得分比例%' : '固定分值'}</span>
                                <button type="button" onClick={() => deleteEvaluationMetricSegment(ruleIndex, segmentIndex)} className="col-span-1 text-gray-400 hover:text-red-600 cursor-pointer" title="删除分段">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-amber-50/50 p-3.5 rounded-lg border border-amber-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                        <Award className="w-4 h-4 text-amber-600" />
                        <span>4. 考核等次</span>
                      </span>
                      <button type="button" onClick={addEvaluationGrade} className="text-[11px] text-amber-800 hover:underline font-bold cursor-pointer">+ 新增等次</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">总分值</label>
                        <input type="number" min={1} value={formEvalTotalScore} onChange={e => setFormEvalTotalScore(Number(e.target.value) || 100)} className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] font-mono font-bold" />
                      </div>
                      <div className="sm:col-span-2 flex items-end text-[11px] text-amber-800 leading-relaxed">
                        等次只定义最终得分区间，不参与统计指标原始计算。
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {formEvalGrades.map((grade, index) => (
                        <div key={grade.id} className="grid grid-cols-12 gap-1.5 items-center bg-white rounded border border-amber-100 p-2">
                          <input value={grade.name} onChange={e => updateEvaluationGrade(index, { name: e.target.value })} className="col-span-4 px-2 py-1.5 border border-gray-200 rounded text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]" />
                          <input type="number" value={grade.minScore} onChange={e => updateEvaluationGrade(index, { minScore: Number(e.target.value) || 0 })} className="col-span-3 px-2 py-1.5 border border-gray-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]" />
                          <span className="col-span-1 text-center text-gray-400">至</span>
                          <input type="number" value={grade.maxScore} onChange={e => updateEvaluationGrade(index, { maxScore: Number(e.target.value) || 0 })} className="col-span-3 px-2 py-1.5 border border-gray-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]" />
                          <button type="button" onClick={() => deleteEvaluationGrade(index)} className="col-span-1 text-gray-400 hover:text-red-600 cursor-pointer" title="删除等次">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Field Elements Configuration for report_template */}
              {activeModule === 'report_template' && (
                <div className="pt-2 border-t border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_390px] gap-4">
                      <div className="space-y-3 min-w-0">
                        <div className="relative bg-blue-50/40 p-3 rounded-lg border border-blue-100/80 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-[#1E5ABB] flex items-center space-x-1">
                              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                              <span>快速添加字段</span>
                            </span>
                            <button
                              type="button"
                              onClick={handleLoadStandardPreset}
                              className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-white border border-blue-200 rounded hover:bg-blue-50 cursor-pointer"
                            >
                              使用标准模板
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={quickFieldType}
                              onChange={e => setQuickFieldType(e.target.value as FieldType)}
                              className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] cursor-pointer"
                            >
                              {(formTemplateType === '激活' ? activationFieldTypeOptions : reportFieldTypeOptions).map(type => (
                                <option key={type} value={type}>{getFieldTypeMeta(type).label}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleAddField(quickFieldType)}
                              className="px-3 py-1.5 bg-[#1E5ABB] text-white text-xs font-bold rounded hover:bg-[#134092] cursor-pointer flex items-center gap-1 shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              添加字段
                            </button>
                          </div>
                          {fieldAddNotice && (
                            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900/90 text-white rounded-md shadow-lg text-xs font-bold flex items-center gap-1.5 animate-in fade-in zoom-in-95 pointer-events-none">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                              <span>{fieldAddNotice}</span>
                            </div>
                          )}
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <div className="px-3 py-2 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                            <span className="font-bold text-gray-800 text-xs">字段配置 ({formFields.length} 项)</span>
                            <span className="text-[11px] text-gray-400">拖拽字段卡片可调整排序</span>
                          </div>

                          {formFields.length === 0 ? (
                            <div className="p-8 text-center bg-gray-50 text-gray-400 space-y-2">
                              <Layers className="w-8 h-8 text-gray-300 mx-auto" />
                              <p>暂未添加字段，请先选择上方字段类型。</p>
                            </div>
                          ) : (
                            <div className="p-3 space-y-2 max-h-[560px] overflow-y-auto scroll-smooth">
                              {formFields.map((field, index) => {
                                const meta = getFieldTypeMeta(field.type);
                                const IconComp = meta.icon;
                                return (
                                  <div
                                    key={field.id}
                                    ref={index === formFields.length - 1 ? latestFieldRef : null}
                                    draggable
                                    onDragStart={() => setDraggingFieldIndex(index)}
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={() => handleDropField(index)}
                                    onDragEnd={() => setDraggingFieldIndex(null)}
                                    className={`bg-white p-3 rounded-lg border shadow-2xs hover:border-blue-200 transition-colors space-y-2 cursor-move ${
                                      draggingFieldIndex === index
                                        ? 'border-blue-300 bg-blue-50/50 opacity-70'
                                        : 'border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <span className="w-6 h-6 rounded bg-gray-100 text-gray-500 text-[10px] font-mono flex items-center justify-center gap-0.5 shrink-0 mt-0.5" title="拖拽调整字段顺序">
                                        <GripVertical className="w-2.5 h-2.5 text-gray-300" aria-hidden="true" />
                                        <span>{index + 1}</span>
                                      </span>
                                      <div className="flex-1 min-w-0 space-y-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-2">
                                          <div className="relative">
                                            <select
                                              value={field.type}
                                              onChange={e => handleUpdateField(index, { type: e.target.value as FieldType })}
                                              className="w-full pl-7 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] cursor-pointer"
                                            >
                                              {(formTemplateType === '激活' ? activationFieldTypeOptions : reportFieldTypeOptions).map(type => (
                                                <option key={type} value={type}>{getFieldTypeMeta(type).label}</option>
                                              ))}
                                            </select>
                                            <IconComp className="w-3.5 h-3.5 text-blue-600 absolute left-2 top-2 pointer-events-none" />
                                          </div>
                                          <input
                                            type="text"
                                            required
                                            value={field.name}
                                            onChange={e => handleUpdateField(index, { name: e.target.value })}
                                            placeholder="字段名称，例如: 事件主题"
                                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] font-bold text-gray-800"
                                          />
                                        </div>

                                        <input
                                          type="text"
                                          value={field.placeholder || ''}
                                          onChange={e => handleUpdateField(index, { placeholder: e.target.value })}
                                          placeholder="给提报人员看的填写提示，例如：请简要说明事件经过"
                                          className="w-full px-2.5 py-1.5 text-[11px] bg-gray-50/60 border border-gray-200 rounded text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                                        />
                                        {field.type === 'select' && (
                                          <div className="p-2 bg-rose-50/40 border border-rose-100 rounded space-y-1.5">
                                            <div className="text-[10px] text-rose-700 font-bold">选择项配置</div>
                                            <div className="space-y-1.5">
                                              {(field.options && field.options.length > 0 ? field.options : ['']).map((option, optionIndex) => (
                                                <div key={optionIndex} className="flex items-center gap-1.5">
                                                  <input
                                                    type="text"
                                                    value={option}
                                                    onChange={e => {
                                                      const next = [...(field.options && field.options.length > 0 ? field.options : [''])];
                                                      next[optionIndex] = e.target.value;
                                                      handleUpdateField(index, { options: next });
                                                    }}
                                                    placeholder={`选项${optionIndex + 1}`}
                                                    className="flex-1 px-2 py-1 text-[11px] bg-white border border-rose-100 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                                                  />
                                                  <button
                                                    type="button"
                                                    onClick={() => handleUpdateField(index, { options: (field.options || []).filter((_, idx) => idx !== optionIndex) })}
                                                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                                    title="删除选项"
                                                  >
                                                    <Trash2 className="w-3 h-3" />
                                                  </button>
                                                </div>
                                              ))}
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => handleUpdateField(index, { options: [...(field.options || []), `选项${(field.options || []).length + 1}`] })}
                                              className="px-2 py-1 text-[10px] font-bold text-rose-700 bg-white border border-rose-100 rounded hover:border-rose-300 cursor-pointer"
                                            >
                                              新增选项
                                            </button>
                                          </div>
                                        )}
                                        {field.type === 'identity' && (
                                          <div className="p-2 bg-blue-50/50 border border-blue-100 rounded space-y-1.5">
                                            <div className="text-[10px] text-blue-700 font-bold">角色列表（可多选）</div>
                                            <div className="flex flex-wrap gap-1.5">
                                              {systemRoleOptions.map(role => {
                                                const selected = (field.options || []).includes(role);
                                                return (
                                                  <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => handleUpdateField(index, {
                                                      options: selected
                                                        ? (field.options || []).filter(option => option !== role)
                                                        : [...(field.options || []), role]
                                                    })}
                                                    className={`px-2 py-1 rounded border text-[10px] font-bold cursor-pointer ${
                                                      selected
                                                        ? 'bg-[#1E5ABB] text-white border-[#1E5ABB]'
                                                        : 'bg-white text-blue-700 border-blue-100 hover:border-blue-300'
                                                    }`}
                                                  >
                                                    {role}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateField(index, { required: !field.required })}
                                          className={`h-6 px-1.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                            field.required
                                              ? 'bg-red-50 text-red-600 border border-red-200'
                                              : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                                          }`}
                                          title={field.required ? '点击设为选填' : '点击设为必填'}
                                        >
                                          {field.required ? '必' : '选'}
                                        </button>
                                        <button type="button" onClick={() => handleDeleteField(index)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer" title="删除字段">
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="block">
                        <div className="sticky top-0 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-gray-800">实时预览</span>
                            <span className="text-[11px] text-gray-400">模拟用户真实上报界面</span>
                          </div>
                          {renderUserReportPreview(
                            formFields,
                            '请先在左侧添加表单字段'
                          )}
                        </div>
                      </div>
                    </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="sticky -bottom-5 z-10 -mx-5 -mb-5 mt-3 flex justify-end space-x-2 border-t border-gray-100 bg-white px-5 py-3 shadow-[0_-4px_12px_rgba(15,23,42,0.04)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1E5ABB] text-white rounded font-bold hover:bg-[#134092] cursor-pointer"
                >
                  保存模板配置
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
