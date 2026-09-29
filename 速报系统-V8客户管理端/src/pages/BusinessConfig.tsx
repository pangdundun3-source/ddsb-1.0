import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PageId } from '../types';
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
  ArrowLeft,
  Save,
  Sparkles,
  Info,
  Layers,
  FileText,
  Zap,
  Award,
  Building2,
  GitBranch,
  GitCommit,
  UserCheck,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  CheckSquare,
  Square,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Smartphone,
  ArrowRight,
  Copy,
  RotateCcw,
  Sliders,
  SlidersHorizontal,
  Workflow
} from 'lucide-react';
import { TemplateOtherConfigPanel } from '../components/TemplateOtherConfigPanel';

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

export type AuditFlowMode = 'step_by_step' | 'max_n_steps' | 'direct_headquarters';

export interface AuditNode {
  id: string;
  nodeName: string;
  approverRole: string;
  assigneeSource?: 'role' | 'user' | 'org_owner';
  assigneeUserName?: string;
  rejectStrategy?: 'return_submitter' | 'return_previous';
  timeLimitMinutes?: number;
  enableTimeout?: boolean;
  isUnifiedFinalNode?: boolean;
  ownerMissingStrategy?: AuditOwnerMissingStrategy;
  ownerMissingFallbackRole?: string;
  ownerMissingFallbackUserName?: string;
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
  auditFlowMode?: AuditFlowMode;
  maxIntermediateNodes?: number;
  flowDepth?: number;
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
  verifyPhone?: boolean;
  verifyIdCard?: boolean;
  verifyBankCard?: boolean;
  adaptedRoles?: string[];
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

const COLUMN_WIDTH_STORAGE_KEY = 'v8_template_board_column_widths';
const LEFT_COL_DEFAULT = 260;
const RIGHT_COL_DEFAULT = 310;
const LEFT_COL_MIN = 200;
const LEFT_COL_MAX = 420;
const RIGHT_COL_MIN = 260;
const RIGHT_COL_MAX = 480;
const CENTER_COL_MIN = 320;

const clampColumnWidth = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const readStoredColumnWidths = (): { left: number; right: number } => {
  try {
    const raw = localStorage.getItem(COLUMN_WIDTH_STORAGE_KEY);
    if (!raw) return { left: LEFT_COL_DEFAULT, right: RIGHT_COL_DEFAULT };
    const parsed = JSON.parse(raw) as { left?: number; right?: number };
    return {
      left: clampColumnWidth(Number(parsed.left) || LEFT_COL_DEFAULT, LEFT_COL_MIN, LEFT_COL_MAX),
      right: clampColumnWidth(Number(parsed.right) || RIGHT_COL_DEFAULT, RIGHT_COL_MIN, RIGHT_COL_MAX),
    };
  } catch {
    return { left: LEFT_COL_DEFAULT, right: RIGHT_COL_DEFAULT };
  }
};

interface BusinessConfigProps {
  initialModule?: string;
  standaloneTitle?: string;
  standaloneDescription?: string;
  onNavigatePage?: (page: PageId, extraModule?: string) => void;
}

export const BusinessConfig: React.FC<BusinessConfigProps> = ({
  initialModule,
  standaloneTitle,
  standaloneDescription,
  onNavigatePage
}) => {
  // Currently active configuration module in the left column
  const [activeModule, setActiveModule] = useState<string>(initialModule || 'report_template');

  React.useEffect(() => {
    if (initialModule) {
      setActiveModule(initialModule);
    }
  }, [initialModule]);

  // Module items list definition - matching the 5 sub-modules for 其他业务配置
  const moduleList = [
    {
      id: 'report_template',
      label: '模板配置',
      icon: FileText,
      desc: '报送/激活模版与动态表单'
    },
    {
      id: 'audit_flow',
      label: '审核流程配置',
      icon: GitBranch,
      desc: '多级流转节点与审批链路'
    },
    {
      id: 'audit_score',
      label: '审核打分规则',
      icon: Award,
      desc: '五级打分标准与评分规则'
    },
    {
      id: 'data_dict',
      label: '数据字典管理',
      icon: ListFilter,
      desc: '驳回原由/信息分类/来源渠道'
    },
    {
      id: 'value_added',
      label: '增值业务申请',
      icon: Sparkles,
      desc: '扩展服务能力与业务开通'
    }
  ];

  // Data state for each configuration module
  const [dataStore, setDataStore] = useState<Record<string, ConfigModuleItem[]>>({
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
        description: '新用户与网格人员入驻时的手机号与身份证实名核验与角色分配',
        fields: standardActivationFields,
        verifyPhone: true,
        verifyIdCard: true,
        verifyBankCard: false,
        adaptedRoles: ['上报员', '审核员']
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
        description: '专用于一线直报员与特约上报员的手机/身份证/银行卡全要素实名认证激活',
        fields: [
          { id: 'f401', name: '手机号码', type: 'phone', required: true, placeholder: '请输入有效手机号' },
          { id: 'f402', name: '身份证号', type: 'id_card', required: true, placeholder: '请输入18位身份证号' },
          { id: 'f403', name: '银行卡号', type: 'bank_card', required: true, placeholder: '请输入稿酬补贴结算卡号' }
        ],
        verifyPhone: true,
        verifyIdCard: true,
        verifyBankCard: true,
        adaptedRoles: ['上报员']
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
        isDefault: true,
        status: '启用',
        updateTime: '2023-10-05 10:00:00',
        description: '本级机构提报后沿组织树逐级向上传递审核，最终由总机构终审并评分。管理员无需配置上1级、上2级、上3级，系统根据实际组织树动态解析并自动自适应任意组织深度。',
        relatedTemplateId: 'all_report_templates',
        relatedTemplateName: '全部报送模板通用',
        templateApplyMode: 'all_report_templates',
        auditFlowMode: 'step_by_step',
        flowDepth: 3,
        orgApplyMode: 'all_orgs',
        ownerMissingStrategy: 'skip_to_next',
        auditNodes: [
          { id: 'an1', nodeName: '本级机构初审', approverRole: '本级机构负责人', assigneeSource: 'org_owner', rejectStrategy: 'return_submitter', timeLimitMinutes: 15 },
          { id: 'an2', nodeName: '上级机构逐级复核', approverRole: '上级机构负责人', assigneeSource: 'org_owner', rejectStrategy: 'return_previous', timeLimitMinutes: 30 },
          { id: 'an3', nodeName: '总机构终审并评分', approverRole: '总机构管理员', assigneeSource: 'role', rejectStrategy: 'return_previous', timeLimitMinutes: 60, isUnifiedFinalNode: true }
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
        isDefault: false,
        status: '启用',
        updateTime: '2023-11-04 17:30:00',
        description: '最多经过3个中间机构审核后直达总机构终审并评分。注意：这是“最多”，不是“必须”。组织实际不足3级时按实际存在机构审核，不报错、不卡单、不强制补齐。',
        relatedTemplateId: '3',
        relatedTemplateName: '突发事件快速上报',
        templateApplyMode: 'single_template',
        auditFlowMode: 'max_n_steps',
        maxIntermediateNodes: 3,
        flowDepth: 3,
        orgApplyMode: 'all_orgs',
        ownerMissingStrategy: 'skip_to_next',
        auditNodes: [
          { id: 'an201', nodeName: '基层机构初审', approverRole: '基层机构负责人', assigneeSource: 'org_owner', rejectStrategy: 'return_submitter', timeLimitMinutes: 10 },
          { id: 'an202', nodeName: '中间机构流转 (最多3个)', approverRole: '各级审核负责人', assigneeSource: 'org_owner', rejectStrategy: 'return_previous', timeLimitMinutes: 20 },
          { id: 'an203', nodeName: '总机构终审并评分', approverRole: '总机构管理员', assigneeSource: 'role', rejectStrategy: 'return_previous', timeLimitMinutes: 60, isUnifiedFinalNode: true }
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
        id: '603',
        name: '直接总机构审核通道',
        isDefault: false,
        status: '启用',
        updateTime: '2023-11-08 09:15:00',
        description: '适用于无需基层/中间机构审核的业务。上报人提报后直接流转至总机构管理员，进行终审并评分。',
        relatedTemplateId: '1',
        relatedTemplateName: '标准图文报送模板',
        templateApplyMode: 'single_template',
        auditFlowMode: 'direct_headquarters',
        flowDepth: 2,
        orgApplyMode: 'all_orgs',
        ownerMissingStrategy: 'skip_to_next',
        auditNodes: [
          { id: 'an301', nodeName: '上报人直报', approverRole: '提报人员', assigneeSource: 'role', rejectStrategy: 'return_submitter', timeLimitMinutes: 10 },
          { id: 'an302', nodeName: '总机构终审并评分', approverRole: '总机构管理员', assigneeSource: 'role', rejectStrategy: 'return_submitter', timeLimitMinutes: 60, isUnifiedFinalNode: true }
        ],
        orgSettings: [
          { orgId: 'org1', orgName: '市委宣传部', enabled: true },
          { orgId: 'org2', orgName: '市公安局网安支队', enabled: true }
        ]
      }
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
        id: 'va_dup',
        name: '报送首发重复识别',
        dictCategoryName: '增值业务',
        dictCode: 'VA_FIRST_DUPLICATE_IDENTIFY',
        status: '启用',
        activatedStatus: '已开通',
        updateTime: '2023-11-10 10:00:00',
        description: '通过抓取报送链接的文章原文比对判断内容是否重复，并结合提交时间线智能判定首发，避免多头报送与重复审核计分。',
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
      }
    ]
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [templateTypeFilter, setTemplateTypeFilter] = useState<'报送' | '激活'>('报送');
  const [auditFlowModeFilter, setAuditFlowModeFilter] = useState<'all' | 'step_by_step' | 'direct_headquarters' | 'max_n_steps'>('all');
  const [auditScoreStatusFilter, setAuditScoreStatusFilter] = useState<'all' | 'active' | 'backup'>('all');
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
  const [draggingFieldIndex, setDraggingFieldIndex] = useState<number | null>(null);
  const [fieldAddNotice, setFieldAddNotice] = useState('');
  const latestFieldRef = useRef<HTMLDivElement | null>(null);
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({});

  // Audit Score Rule Modal States
  const [formTotalScore, setFormTotalScore] = useState<number>(100);
  const [formLevelCount, setFormLevelCount] = useState<number>(5);
  const [formScoreLevels, setFormScoreLevels] = useState<ScoreLevel[]>([]);
  const [formScoreStatus, setFormScoreStatus] = useState<'启用' | '停用'>('停用');
  const [formRelatedTemplateId, setFormRelatedTemplateId] = useState<string>('');
  const [formTemplateApplyMode, setFormTemplateApplyMode] = useState<AuditTemplateApplyMode>('single_template');

  // Audit Flow / Hierarchy Modal States
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

  // Audit Flow Hierarchy Enhanced States
  const [formAuditFlowMode, setFormAuditFlowMode] = useState<AuditFlowMode>('step_by_step');
  const [formMaxIntermediateNodes, setFormMaxIntermediateNodes] = useState<number>(3);
  const [formSimulatorScenario, setFormSimulatorScenario] = useState<'depth_5' | 'depth_3' | 'depth_2'>('depth_5');
  const [detailSimulatorScenario, setDetailSimulatorScenario] = useState<'depth_5' | 'depth_3' | 'depth_2'>('depth_5');
  const [simFinalScore, setSimFinalScore] = useState<number>(5);
  const [simFinalRemark, setSimFinalRemark] = useState<string>('经综合研判，该舆情线索要素完整真实，现场处置核实属实，符合首发入库标准，同意终审通过并赋分。');
  const [simResultStatus, setSimResultStatus] = useState<'idle' | 'approved' | 'rejected'>('idle');

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
  const [isTemplateDetailPageOpen, setIsTemplateDetailPageOpen] = useState(false);
  const [templateDetailMode, setTemplateDetailMode] = useState<'create' | 'edit' | 'view'>('create');

  // Desktop 3-column widths for template workbench (mouse-draggable, synced with MT)
  const [leftColWidth, setLeftColWidth] = useState(() => readStoredColumnWidths().left);
  const [rightColWidth, setRightColWidth] = useState(() => readStoredColumnWidths().right);
  const [resizingSide, setResizingSide] = useState<'left' | 'right' | null>(null);
  const workbenchRef = useRef<HTMLDivElement | null>(null);
  const leftColWidthRef = useRef(leftColWidth);
  const rightColWidthRef = useRef(rightColWidth);

  useEffect(() => {
    leftColWidthRef.current = leftColWidth;
  }, [leftColWidth]);

  useEffect(() => {
    rightColWidthRef.current = rightColWidth;
  }, [rightColWidth]);

  useEffect(() => {
    try {
      localStorage.setItem(
        COLUMN_WIDTH_STORAGE_KEY,
        JSON.stringify({ left: leftColWidth, right: rightColWidth })
      );
    } catch {
      // ignore storage failures
    }
  }, [leftColWidth, rightColWidth]);

  useEffect(() => {
    if (!resizingSide) return;

    const handlePointerMove = (event: PointerEvent) => {
      const container = workbenchRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;

      if (resizingSide === 'left') {
        const maxLeft = Math.min(
          LEFT_COL_MAX,
          rect.width - rightColWidthRef.current - CENTER_COL_MIN - 16
        );
        setLeftColWidth(clampColumnWidth(x, LEFT_COL_MIN, Math.max(LEFT_COL_MIN, maxLeft)));
        return;
      }

      const fromRight = rect.width - x;
      const maxRight = Math.min(
        RIGHT_COL_MAX,
        rect.width - leftColWidthRef.current - CENTER_COL_MIN - 16
      );
      setRightColWidth(clampColumnWidth(fromRight, RIGHT_COL_MIN, Math.max(RIGHT_COL_MIN, maxRight)));
    };

    const stopResize = () => setResizingSide(null);

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopResize);
    window.addEventListener('pointercancel', stopResize);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopResize);
      window.removeEventListener('pointercancel', stopResize);
    };
  }, [resizingSide]);

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

  // Dynamic Audit Flow Scenarios for Live Tree Path Resolution & Testing
  const scenarioOrgDefinitions = {
    depth_5: {
      id: 'depth_5',
      name: '五级深层组织（网格基层上报）',
      hierarchyPath: '总机构 ↓ A (市级) ↓ B (区县) ↓ C (街道) ↓ D (社区网格)',
      submitter: '中建三局社区网格员 (李明)',
      submitterOrg: '中建三局社区网格站 D',
      nodes: [
        { id: 'd', name: '中建三局社区网格 D', levelTitle: '基层网格', role: '网格站站长', operator: '赵志刚', action: '就地核实与初审' },
        { id: 'c', name: '中南路街道工作站 C', levelTitle: '街道综治', role: '街道综治主任', operator: '孙建国', action: '属地研判与复审' },
        { id: 'b', name: '武昌区网信中心 B', levelTitle: '区县主管', role: '区网信中心科长', operator: '周小波', action: '区级综合核验' },
        { id: 'a', name: '市委宣传部舆情科 A', levelTitle: '市级统筹', role: '市舆情科科长', operator: '陈立群', action: '市级统筹复核' },
        { id: 'root', name: '台中市网信办 (总机构)', levelTitle: '总机构指挥中心', role: '总机构管理员', operator: '高主任', action: '终审并评分（一体化闭环）' }
      ]
    },
    depth_3: {
      id: 'depth_3',
      name: '三级常规组织（直属大队上报）',
      hierarchyPath: '总机构 ↓ A (市公安局网安支队) ↓ B (网安直属一大队)',
      submitter: '网安直属一大队值班员 (王警官)',
      submitterOrg: '网安直属一大队 B',
      nodes: [
        { id: 'b', name: '网安直属一大队 B', levelTitle: '直属大队', role: '大队长', operator: '张建军', action: '机构初审' },
        { id: 'a', name: '市公安局网安支队 A', levelTitle: '市局支队', role: '支队长', operator: '李副局长', action: '上级机构复核' },
        { id: 'root', name: '台中市网信办 (总机构)', levelTitle: '总机构指挥中心', role: '总机构管理员', operator: '高主任', action: '终审并评分（一体化闭环）' }
      ]
    },
    depth_2: {
      id: 'depth_2',
      name: '两级直属组织（直属处室上报）',
      hierarchyPath: '总机构 ↓ A (市应急管理局直属办)',
      submitter: '应急值班处室人员 (刘工)',
      submitterOrg: '市应急管理局直属办 A',
      nodes: [
        { id: 'a', name: '市应急管理局直属办 A', levelTitle: '直属处室', role: '处室主任', operator: '钱主任', action: '本级机构审核' },
        { id: 'root', name: '台中市网信办 (总机构)', levelTitle: '总机构指挥中心', role: '总机构管理员', operator: '高主任', action: '终审并评分（一体化闭环）' }
      ]
    }
  };

  const resolveDynamicAuditScenario = (
    mode: AuditFlowMode = 'step_by_step',
    scenarioKey: 'depth_5' | 'depth_3' | 'depth_2' = 'depth_5',
    maxNodes: number = 3
  ) => {
    const scenario = scenarioOrgDefinitions[scenarioKey] || scenarioOrgDefinitions.depth_5;
    const allNodes = scenario.nodes;
    const rootNode = allNodes[allNodes.length - 1];
    const intermediateAndBase = allNodes.slice(0, allNodes.length - 1);

    if (mode === 'direct_headquarters') {
      return {
        scenarioName: scenario.name,
        hierarchyPath: scenario.hierarchyPath,
        submitter: scenario.submitter,
        submitterOrg: scenario.submitterOrg,
        steps: [
          {
            index: 1,
            nodeName: '上报人直报',
            orgName: scenario.submitterOrg,
            levelTitle: '业务发起人',
            role: '提报员',
            operator: scenario.submitter,
            action: '发起舆情直报',
            isFinal: false,
            note: '无需基层与中间机构审核，直达总机构'
          },
          {
            index: 2,
            nodeName: '总机构终审并评分',
            orgName: rootNode.name,
            levelTitle: rootNode.levelTitle,
            role: rootNode.role,
            operator: rootNode.operator,
            action: '终审并评分（一体化统一节点）',
            isFinal: true,
            note: '查看上报内容 / 前序记录 / 填写意见 / 按模板评分 / 驳回或通过评分完成'
          }
        ],
        ruleExplanation: '【模式三：直接总机构审核】：无需任何基层或中间机构复核，直接流转至总机构管理员终审并评分，扁平极速直达。'
      };
    }

    if (mode === 'max_n_steps') {
      const actualAvailable = intermediateAndBase.length;
      const takenNodes = intermediateAndBase.slice(0, maxNodes);
      const skippedNodes = intermediateAndBase.slice(maxNodes);

      const steps = [
        ...takenNodes.map((item, idx) => ({
          index: idx + 1,
          nodeName: idx === 0 ? `${item.name}（本级初审）` : `${item.name}（中间流转）`,
          orgName: item.name,
          levelTitle: item.levelTitle,
          role: item.role,
          operator: item.operator,
          action: item.action,
          isFinal: false,
          note: idx === 0 ? '提报单位负责人就地审核' : `中间审核机构（最多第 ${idx} 级）`
        })),
        {
          index: takenNodes.length + 1,
          nodeName: '总机构终审并评分',
          orgName: rootNode.name,
          levelTitle: rootNode.levelTitle,
          role: rootNode.role,
          operator: rootNode.operator,
          action: '终审并评分（一体化统一节点）',
          isFinal: true,
          note: '查看上报内容 / 前序记录 / 填写意见 / 按模板评分 / 驳回或通过评分完成'
        }
      ];

      const ruleExplanation = actualAvailable > maxNodes
        ? `当前组织实际深度为 ${actualAvailable} 级中间层，管理员配置“最多审核 ${maxNodes} 个中间机构”，系统动态截取前 ${maxNodes} 个机构（${takenNodes.map(n => n.name).join(' → ')}），更高层级机构（${skippedNodes.map(n => n.name).join('、')}）自动平滑穿透，直接提交总机构终审并评分。`
        : `组织实际只有 ${actualAvailable} 个机构（小于配置的最多 ${maxNodes} 级上限），系统自动取实际存在的 ${actualAvailable} 个机构审核。这是“最多”，不是“必须”，系统不报错、不阻止提交、不强制补齐三级。`;

      return {
        scenarioName: scenario.name,
        hierarchyPath: scenario.hierarchyPath,
        submitter: scenario.submitter,
        submitterOrg: scenario.submitterOrg,
        steps,
        ruleExplanation
      };
    }

    // Default: step_by_step
    const steps = [
      ...intermediateAndBase.map((item, idx) => ({
        index: idx + 1,
        nodeName: idx === 0 ? `${item.name}（本级机构审核）` : `${item.name}（上级机构审核）`,
        orgName: item.name,
        levelTitle: item.levelTitle,
        role: item.role,
        operator: item.operator,
        action: item.action,
        isFinal: false,
        note: idx === 0 ? '本级机构负责人初核' : '沿组织树逐级向上传递审核'
      })),
      {
        index: intermediateAndBase.length + 1,
        nodeName: '总机构终审并评分',
        orgName: rootNode.name,
        levelTitle: rootNode.levelTitle,
        role: rootNode.role,
        operator: rootNode.operator,
        action: '终审并评分（一体化统一节点）',
        isFinal: true,
        note: '查看上报内容 / 前序记录 / 填写意见 / 按模板评分 / 驳回或通过评分完成'
      }
    ];

    return {
      scenarioName: scenario.name,
      hierarchyPath: scenario.hierarchyPath,
      submitter: scenario.submitter,
      submitterOrg: scenario.submitterOrg,
      steps,
      ruleExplanation: `【模式一：逐级审核】：管理员无需人工配置上1级、上2级、上3级；系统根据实际组织树动态解析审核路径（当前深度为 ${intermediateAndBase.length} 级中间层），自动自适应，不要求组织必须存在三级。`
    };
  };

  const auditAssigneeSourceOptions = [
    { id: 'role', label: '按角色', description: '从人员角色中匹配可审核人员' },
    { id: 'user', label: '指定人员', description: '固定由某个具体人员处理' },
    { id: 'org_owner', label: '归属机构负责人', description: '按上报人归属机构自动匹配负责人' }
  ] as const;

  const auditFlowModeOptions: Array<{
    id: AuditFlowMode;
    title: string;
    subtitle: string;
    badge: string;
    badgeStyle: string;
    summary: string;
    description: string;
    features: string[];
  }> = [
    {
      id: 'step_by_step',
      title: '模式一：逐级审核',
      subtitle: '组织树自适应解析',
      badge: '自适应',
      badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      summary: '本级机构提报 → 上级机构逐级审核 → 总机构终审并评分',
      description: '系统根据实际组织树动态解析审核路径。管理员无需配置上1级、上2级、上3级，无论组织深度是5级、3级还是2级均自动适配流转，不需要必须有三级。',
      features: [
        '组织树自适应向上推演路径',
        '无需人工配置上1/2/3级',
        '支持任意组织深度(5级/3级/2级)',
        '总机构终审与评分一体化结案'
      ]
    },
    {
      id: 'max_n_steps',
      title: '模式二：最多N级审核',
      subtitle: '中间机构层级上限截断',
      badge: '上限截断',
      badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200',
      summary: '下级机构提报后，至多经过 N 个中间机构审核后直达总机构',
      description: '满足特殊业务审批效率需求，限制中间机构审核最多为 N 级。若中间机构不足 N 级，按实际层级审核后直接进入总机构，不需要必须有 N 级。',
      features: [
        '可配置最多中间审核机构数 N',
        '不足N级按实际审核，不强制补齐',
        '超出N级自动平滑穿透直达总机构',
        '杜绝层级过深审批延误'
      ]
    },
    {
      id: 'direct_headquarters',
      title: '模式三：直接总机构审核',
      subtitle: '扁平极速直达通道',
      badge: '极速直审',
      badgeStyle: 'bg-purple-50 text-purple-700 border-purple-200',
      summary: '无需下级或中间机构审核，直接由总机构管理员终审并评分',
      description: '跳过所有基层和中间机构，上报人提报后直接流转至总机构待审池，总机构终审通过并评分结案。适用于特急舆情直报。',
      features: [
        '两步极速直通闭环',
        '跳过所有下级中间层',
        '适用于特急重大舆情直报',
        '总机构终审与评分一步到位'
      ]
    }
  ];

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

  const getNodeOwnerMissingStrategyText = (node?: AuditNode, fallbackItem?: ConfigModuleItem) => {
    const strategy = node?.ownerMissingStrategy || fallbackItem?.ownerMissingStrategy || 'block_submit';
    const option = ownerMissingStrategyOptions.find(entry => entry.id === strategy);
    const fallbackRole = node?.ownerMissingFallbackRole || fallbackItem?.ownerMissingFallbackRole || '机构管理员';
    const fallbackUser = node?.ownerMissingFallbackUserName || fallbackItem?.ownerMissingFallbackUserName || '未指定';
    if (strategy === 'fallback_role') return `${option?.label || '转交兜底角色'} (${fallbackRole})`;
    if (strategy === 'fallback_user') return `${option?.label || '转交指定人员'} (${fallbackUser})`;
    return option?.label || '阻止提交并提示';
  };

  const buildAuditFlowLinearPreviewData = (item: ConfigModuleItem, preferredStepsPerRow = 4, singleRowLimit = 5) => {
    const mode = item.auditFlowMode || 'step_by_step';
    let flowSteps: Array<{
      id: string;
      type: 'start' | 'node' | 'end';
      title: string;
      description: string;
      ruleDescription?: string;
      isFinalNode?: boolean;
      enableTimeout?: boolean;
      timeLimitMinutes?: number;
      assigneeSource?: string;
      approverRole?: string;
      assigneeUserName?: string;
      ownerMissingStrategy?: string;
      rejectStrategy?: string;
    }> = [];

    if (item.auditNodes && item.auditNodes.length > 0) {
      flowSteps = [
        { id: 'start', type: 'start' as const, title: '开始', description: '发起上报' },
        ...item.auditNodes.map((node, index) => {
          const isFinalNode = Boolean(node.isUnifiedFinalNode || index === item.auditNodes!.length - 1);
          const assigneeText = node.assigneeSource === 'org_owner'
            ? '归属机构负责人'
            : node.assigneeSource === 'user'
            ? (node.assigneeUserName || '指定人员')
            : (node.approverRole || '审核员');

          const isTimeoutOn = node.enableTimeout !== false && (node.timeLimitMinutes ?? 0) > 0;
          const timeoutText = isTimeoutOn
            ? (node.timeLimitMinutes! >= 60 && node.timeLimitMinutes! % 60 === 0
                ? `限时${node.timeLimitMinutes! / 60}小时`
                : `限时${node.timeLimitMinutes}分`)
            : '无提醒';

          const rejectText = node.rejectStrategy === 'return_previous' ? '退回上一节点' : '退回上报人';

          return {
            id: node.id || `node_${index}`,
            type: 'node' as const,
            title: node.nodeName,
            description: assigneeText,
            ruleDescription: `${timeoutText} · ${rejectText}`,
            isFinalNode,
            enableTimeout: isTimeoutOn,
            timeLimitMinutes: node.timeLimitMinutes,
            assigneeSource: node.assigneeSource,
            approverRole: node.approverRole,
            assigneeUserName: node.assigneeUserName,
            ownerMissingStrategy: node.ownerMissingStrategy,
            rejectStrategy: node.rejectStrategy
          };
        }),
        { id: 'end', type: 'end' as const, title: '结束', description: '审核+评分+流程全完成' }
      ];
    } else if (mode === 'direct_headquarters') {
      flowSteps = [
        { id: 'start', type: 'start' as const, title: '开始', description: '发起上报' },
        { id: 'node_submitter', type: 'node' as const, title: '上报人直报', description: '业务/网格提报员', ruleDescription: '无需基层与中间机构流转，直达总机构' },
        { id: 'node_final', type: 'node' as const, title: '总机构终审并评分', description: '总机构管理员', ruleDescription: '终审与评分一体化完成，不拆分流程节点', isFinalNode: true },
        { id: 'end', type: 'end' as const, title: '结束', description: '审核+评分+流程全完成' }
      ];
    } else if (mode === 'max_n_steps') {
      const maxN = item.maxIntermediateNodes || 3;
      flowSteps = [
        { id: 'start', type: 'start' as const, title: '开始', description: '发起上报' },
        { id: 'node_base', type: 'node' as const, title: '基层机构初审', description: '提交机构负责人', ruleDescription: '就地初核，时效15分钟' },
        { id: 'node_inter', type: 'node' as const, title: `中间机构 (最多${maxN}级)`, description: '各级审核负责人', ruleDescription: '最多N级自适应流转，不足不报错不强制补齐' },
        { id: 'node_final', type: 'node' as const, title: '总机构终审并评分', description: '总机构管理员', ruleDescription: '终审与评分一体化完成，不拆分流程节点', isFinalNode: true },
        { id: 'end', type: 'end' as const, title: '结束', description: '审核+评分+流程全完成' }
      ];
    } else {
      // step_by_step
      flowSteps = [
        { id: 'start', type: 'start' as const, title: '开始', description: '发起上报' },
        { id: 'node_base', type: 'node' as const, title: '本级机构初审', description: '归属机构负责人', ruleDescription: '提报机构就地核实初审' },
        { id: 'node_inter', type: 'node' as const, title: '上级机构逐级复核', description: '组织树向上回溯', ruleDescription: '系统根据组织树动态解析，无需配置上N级' },
        { id: 'node_final', type: 'node' as const, title: '总机构终审并评分', description: '总机构管理员', ruleDescription: '终审与评分一体化完成，不拆分流程节点', isFinalNode: true },
        { id: 'end', type: 'end' as const, title: '结束', description: '审核+评分+流程全完成' }
      ];
    }

    const stepsPerRow = flowSteps.length <= singleRowLimit ? flowSteps.length : preferredStepsPerRow;
    const flowRows = flowSteps.reduce<Array<typeof flowSteps>>((rows, step, index) => {
      if (index % stepsPerRow === 0) rows.push([]);
      rows[rows.length - 1].push(step);
      return rows;
    }, []);
    const longestRowLength = Math.max(...flowRows.map(row => row.length), 1);
    const panelWidth = Math.min(960, Math.max(560, longestRowLength * 135 + (longestRowLength - 1) * 44 + 40));

    const modeLabel = mode === 'step_by_step'
      ? '模式一：逐级审核（组织树自适应）'
      : mode === 'max_n_steps'
        ? `模式二：最多${item.maxIntermediateNodes || 3}级审核`
        : '模式三：直接总机构审核（极速直达）';

    const enabledTimeoutCount = (item.auditNodes || []).filter(n => n.enableTimeout !== false && (n.timeLimitMinutes ?? 0) > 0).length;
    const totalNodesCount = item.auditNodes?.length || (mode === 'direct_headquarters' ? 2 : 3);

    const timeoutSummary = totalNodesCount > 0
      ? enabledTimeoutCount === 0
        ? '全节点关停超时提醒'
        : enabledTimeoutCount === totalNodesCount
          ? `全部节点开启提醒 (${enabledTimeoutCount}个)`
          : `${enabledTimeoutCount}/${totalNodesCount} 节点开启提醒`
      : '按节点规则配置';

    return {
      flowSteps,
      flowRows,
      stepsPerRow,
      panelWidth,
      summaryItems: [
        { label: '流程模式', value: modeLabel },
        { label: '启用状态', value: item.status || '启用' },
        { label: '审批阶段', value: `${totalNodesCount} 级阶段（标准固定）` },
        { label: '终审评分机制', value: '总机构终审并评分（一体化统一节点）' },
        { label: '超时提醒配置', value: timeoutSummary },
        { label: '无负责人策略', value: getOwnerMissingStrategyText(item) },
      ],
    };
  };

  const renderAuditFlowLinearRows = (
    flowSteps: ReturnType<typeof buildAuditFlowLinearPreviewData>['flowSteps'],
    flowRows: ReturnType<typeof buildAuditFlowLinearPreviewData>['flowRows'],
    stepsPerRow: number,
    compact = false
  ) => {
    const stepWidthClass = compact ? 'w-[110px]' : 'w-[130px]';
    const connectorWidthClass = compact ? 'w-6' : 'w-10';

    return (
    <div className="space-y-5 max-w-full overflow-hidden">
      {flowRows.map((row, rowIndex) => {
        const isReversedRow = flowRows.length > 1 && rowIndex % 2 === 1;
        const displayRow = isReversedRow ? [...row].reverse() : row;

        return (
        <React.Fragment key={`row-${rowIndex}`}>
          <div className="flex items-start justify-center max-w-full">
            {displayRow.map((step, stepIndex) => {
              const absoluteIndex = flowSteps.findIndex(item => item.id === step.id);
              const isStart = step.type === 'start';
              const isEnd = step.type === 'end';
              const isFinalNode = ('isFinalNode' in step && step.isFinalNode) || step.title.includes('终审并评分');

              const circleClassName = isStart
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : isEnd
                  ? 'bg-gray-100 border-gray-300 text-gray-600'
                  : isFinalNode
                    ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/30 font-bold'
                    : 'bg-blue-50 border-blue-200 text-[#1E5ABB]';
              const dotClassName = isStart
                ? 'bg-emerald-500'
                : isEnd
                  ? 'bg-gray-400'
                  : isFinalNode
                    ? 'bg-amber-500'
                    : 'bg-[#1E5ABB]';
              const detailText = [
                step.description,
                'ruleDescription' in step ? step.ruleDescription : '',
              ].filter(Boolean).join('；');

              return (
                <React.Fragment key={step.id}>
                  <div className={`${stepWidthClass} shrink-0 text-center`}>
                    <div className={`mx-auto w-9 h-9 rounded-full border flex items-center justify-center ${circleClassName}`}>
                      {isStart ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isEnd ? (
                        <Check className="w-4 h-4" />
                      ) : isFinalNode ? (
                        <Award className="w-4 h-4 text-amber-600" />
                      ) : (
                        <span className="text-xs font-bold">{absoluteIndex}</span>
                      )}
                    </div>
                    {isFinalNode && (
                      <span className="inline-block mt-1 px-1.5 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-800 rounded border border-amber-200">
                        终审+评分一体
                      </span>
                    )}
                    <div className="mt-1.5 text-xs font-bold text-gray-900 truncate" title={step.title}>
                      {step.title}
                    </div>
                    <div className="mt-1 text-[10px] text-gray-500 leading-relaxed break-words line-clamp-2" title={detailText}>
                      {detailText}
                    </div>
                  </div>
                  {stepIndex < displayRow.length - 1 && (
                    <div className={`${connectorWidthClass} shrink-0 pt-[18px] flex items-center`}>
                      <div className="h-px bg-gray-200 flex-1 rounded-full" />
                      <div className={`w-1.5 h-1.5 rounded-full ${dotClassName}`} />
                      <div className="h-px bg-gray-200 flex-1 rounded-full" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {rowIndex < flowRows.length - 1 && (
            <div
              className={`mx-auto h-7 w-24 border-b border-gray-200 ${
                rowIndex % 2 === 0
                  ? 'border-r rounded-br-3xl'
                  : 'border-l rounded-bl-3xl'
              }`}
            />
          )}
        </React.Fragment>
        );
      })}
    </div>
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

  // Field element handlers
  const handleAddField = (type: FieldType = 'text') => {
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
    if (activeModule === 'report_template' && (item.templateType || '报送') !== templateTypeFilter) {
      return false;
    }

    if (activeModule === 'audit_flow') {
      return true;
    }

    if (activeModule === 'audit_score') {
      return true;
    }

    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    variant: 'compact' | 'full' = 'compact',
    customTitle?: string
  ) => {
    const titleText = customTitle || (templateType === '激活' ? '账号激活' : '标准图文报送模板');

    return (
      <div className="bg-[#F8FAFC] rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden w-full">
        <div className="h-11 bg-[#1E5ABB] text-white flex items-center justify-center px-4 select-none">
          <span className="text-sm font-bold tracking-wide truncate max-w-[90%]">{titleText}</span>
        </div>

        <div className={`p-3.5 sm:p-4 ${variant === 'full' ? 'space-y-3' : 'space-y-2.5'}`}>
          {fields.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs bg-white rounded-xl border border-dashed border-gray-200">
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
                : ['突发敏感事件', '网络舆情动态', '民生诉求建议'];

              return (
                <div key={field.id || idx} className="bg-white rounded-xl border border-gray-200/80 p-3 sm:p-3.5 space-y-2 shadow-2xs">
                  <label className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5 min-w-0">
                      {field.type === 'text' ? (
                        <span className="w-4 h-4 text-blue-600 font-bold font-serif text-sm flex items-center justify-center shrink-0">T</span>
                      ) : field.type === 'number' ? (
                        <span className="w-4 h-4 text-[#1E5ABB] font-bold text-sm flex items-center justify-center shrink-0">#</span>
                      ) : (
                        <IconComp className="w-3.5 h-3.5 text-[#1E5ABB] shrink-0" />
                      )}
                      <span className="truncate">{field.name}</span>
                      {field.required && <span className="text-rose-500 font-bold ml-0.5 shrink-0">*</span>}
                    </span>
                  </label>

                  {field.type === 'text' && (
                    isLongText ? (
                      <textarea
                        rows={4}
                        value={fieldValue}
                        onChange={(e) => handlePreviewValueChange(field.id, e.target.value)}
                        placeholder={field.placeholder || '请输入相关内容'}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] resize-none bg-white placeholder:text-gray-400"
                      />
                    ) : (
                      <input
                        type="text"
                        value={fieldValue}
                        onChange={(e) => handlePreviewValueChange(field.id, e.target.value)}
                        placeholder={field.placeholder || '请输入相关内容'}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white placeholder:text-gray-400"
                      />
                    )
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      value={fieldValue}
                      onChange={(e) => handlePreviewValueChange(field.id, e.target.value)}
                      placeholder={field.placeholder || '请输入数值'}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white placeholder:text-gray-400"
                    />
                  )}

                  {['phone', 'id_card', 'bank_card', 'email'].includes(field.type) && (
                    <input
                      type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                      value={fieldValue}
                      onChange={(e) => handlePreviewValueChange(field.id, e.target.value)}
                      placeholder={field.placeholder || getDefaultFieldPlaceholder(field.type)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white placeholder:text-gray-400"
                    />
                  )}

                  {field.type === 'address' && (
                    <textarea
                      rows={3}
                      value={fieldValue}
                      onChange={(e) => handlePreviewValueChange(field.id, e.target.value)}
                      placeholder={field.placeholder || getDefaultFieldPlaceholder(field.type)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] resize-none bg-white placeholder:text-gray-400"
                    />
                  )}

                  {field.type === 'gender' && (
                    <div className="grid grid-cols-2 gap-2">
                      {['男', '女'].map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handlePreviewValueChange(field.id, option)}
                          className={`px-3 py-2 text-xs rounded-md border font-bold ${
                            fieldValue === option
                              ? 'bg-blue-50 text-[#1E5ABB] border-blue-200'
                              : 'bg-white text-gray-600 border-gray-200'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {field.type === 'date' && (
                    <div className="relative flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-white focus-within:ring-1 focus-within:ring-[#1E5ABB] focus-within:border-[#1E5ABB]">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2 shrink-0 pointer-events-none" />
                      <input
                        type={fieldValue ? 'datetime-local' : 'text'}
                        onFocus={(e) => { e.currentTarget.type = 'datetime-local'; }}
                        onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.type = 'text'; }}
                        value={fieldValue}
                        onChange={(e) => handlePreviewValueChange(field.id, e.target.value)}
                        placeholder={field.placeholder || '请选择事件发生或传播时间'}
                        className="w-full text-xs text-gray-700 bg-transparent focus:outline-none placeholder:text-gray-400 cursor-pointer"
                      />
                      <Calendar className="w-4 h-4 text-gray-400 ml-2 shrink-0 pointer-events-none" />
                    </div>
                  )}

                  {field.type === 'file' && (
                    <label className="block border border-dashed border-blue-200/90 rounded-xl p-5 text-center hover:border-[#1E5ABB] hover:bg-blue-50/20 transition-colors cursor-pointer bg-white">
                      <input
                        type="file"
                        className="sr-only"
                        onChange={(e) => handlePreviewValueChange(field.id, e.target.files?.[0]?.name || '')}
                      />
                      <Paperclip className="w-7 h-7 text-gray-400 mx-auto mb-1.5" />
                      <p className="text-xs text-gray-800 font-medium break-words">
                        {fieldValue || '上传图片、视频或证明材料'}
                      </p>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        {field.placeholder || '支持图片、视频、PDF证明文档'}
                      </p>
                    </label>
                  )}

                  {field.type === 'link' && (
                    <div className="relative flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-white focus-within:ring-1 focus-within:ring-[#1E5ABB] focus-within:border-[#1E5ABB]">
                      <LinkIcon className="w-4 h-4 text-gray-400 mr-2 shrink-0 pointer-events-none" />
                      <input
                        type="url"
                        value={fieldValue}
                        onChange={(e) => handlePreviewValueChange(field.id, e.target.value)}
                        placeholder={field.placeholder || 'https://...'}
                        className="w-full text-xs text-gray-700 bg-transparent focus:outline-none placeholder:text-gray-400"
                      />
                    </div>
                  )}

                  {field.type === 'select' && (
                    <div className="relative">
                      <select
                        value={fieldValue}
                        onChange={(e) => handlePreviewValueChange(field.id, e.target.value)}
                        className="w-full appearance-none px-3.5 py-2.5 text-xs text-gray-700 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#1E5ABB] focus:ring-1 focus:ring-[#1E5ABB] cursor-pointer"
                      >
                        <option value="">{field.placeholder || '请选择事件分类'}</option>
                        {selectOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  )}

                  {field.type === 'identity' && (
                    <div className="flex flex-wrap gap-1.5">
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
                            className={`px-2.5 py-1.5 text-[11px] rounded-md border font-bold ${
                              checked
                                ? 'bg-blue-50 text-[#1E5ABB] border-blue-200'
                                : 'bg-white text-gray-600 border-gray-200'
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
    );
  };

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

    setDataStore(prev => ({
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
    setDataStore(prev => {
      const list = prev[activeModule] || [];
      const targetItem = list.find(i => i.id === id);
      if (!targetItem) return prev;

      // Special constraint for value_added: Cannot toggle if not activated (未开通)
      if (activeModule === 'value_added' && targetItem.activatedStatus === '未开通') {
        alert('该增值业务属于“未开通”状态，无法进行启禁操作。如需开通请联系对应的销售人员！');
        return prev;
      }

      const newStatus = targetItem.status === '启用' ? '停用' : '启用';

      if (activeModule === 'audit_score' && newStatus === '停用' && list.filter(item => item.status === '启用').length <= 1) {
        alert('至少需要保留一组启用中的审核打分规则');
        return prev;
      }

      // Special constraint for audit_score: Only 1 rule group can be enabled at a time!
      if (activeModule === 'audit_score' && newStatus === '启用') {
        return {
          ...prev,
          audit_score: list.map(item => ({
            ...item,
            status: item.id === id ? '启用' : '停用',
            updateTime: item.id === id ? new Date().toISOString().replace('T', ' ').substring(0, 19) : item.updateTime
          }))
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
    if (item.isDefault) {
      alert('系统默认配置项不可删除！');
      return;
    }
    if (confirm(`确定要删除配置项“${item.name}”吗？`)) {
      setDataStore(prev => ({
        ...prev,
        [activeModule]: prev[activeModule].filter(i => i.id !== item.id)
      }));
    }
  };

  // Template Detail Page Handlers
  const openAddTemplatePage = () => {
    const targetType = templateTypeFilter === '激活' ? '激活' : '报送';
    setEditingItem(null);
    setFormName('');
    setFormTemplateType(targetType);
    setFormDesc('');
    setFormScoreStatus('启用');
    setPreviewValues({});
    setFormFields((targetType === '激活' ? standardActivationFields : standardReportFields).map(field => ({
      ...field,
      options: field.options ? [...field.options] : undefined
    })));
    setTemplateDetailMode('create');
    setIsTemplateDetailPageOpen(true);
  };

  const openEditTemplatePage = (item: ConfigModuleItem) => {
    if (item.isDefault) {
      setEditingItem(item);
      setFormName(item.name);
      setFormTemplateType(item.templateType || '报送');
      setFormDesc(item.description || '');
      setFormScoreStatus(item.status);
      setPreviewValues({});
      setFormFields(item.fields && item.fields.length > 0 ? item.fields : []);
      setTemplateDetailMode('view');
      setIsTemplateDetailPageOpen(true);
      return;
    }
    setEditingItem(item);
    setFormName(item.name);
    setFormTemplateType(item.templateType || '报送');
    setFormDesc(item.description || '');
    setFormScoreStatus(item.status);
    setPreviewValues({});
    if (item.fields && item.fields.length > 0) {
      setFormFields(item.fields);
    } else {
      handleLoadStandardPreset();
    }
    setTemplateDetailMode('edit');
    setIsTemplateDetailPageOpen(true);
  };

  const openViewTemplatePage = (item: ConfigModuleItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormTemplateType(item.templateType || '报送');
    setFormDesc(item.description || '');
    setFormScoreStatus(item.status);
    setPreviewValues({});
    setFormFields(item.fields && item.fields.length > 0 ? item.fields : []);
    setTemplateDetailMode(item.isDefault ? 'view' : 'edit');
    setIsTemplateDetailPageOpen(true);
  };

  const handleCloneDefaultTemplate = () => {
    setEditingItem(null);
    setFormName(`${formName} (自定义副本)`);
    setFormFields(formFields.map(f => ({ ...f, id: `f_${Date.now()}_${Math.random().toString(36).substring(2, 7)}` })));
    setTemplateDetailMode('create');
    showConfigToast('已基于该模板复制生成副本，您可自由调整字段并保存');
  };

  const handleDuplicateTemplate = (item: ConfigModuleItem) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const duplicatedFields = (item.fields || []).map(f => ({
      ...f,
      id: `f_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    }));
    const newItem: ConfigModuleItem = {
      id: String(Date.now()),
      name: `${item.name} (副本)`,
      templateType: item.templateType || '报送',
      isDefault: false,
      status: '启用',
      updateTime: nowStr,
      description: item.description ? `${item.description} (副本)` : '基于模板复制生成',
      fields: duplicatedFields
    };
    setDataStore(prev => ({
      ...prev,
      report_template: [
        ...(prev.report_template || []),
        newItem
      ]
    }));
    setSelectedTemplateId(newItem.id);
    showConfigToast(`已成功复制并生成新模板「${newItem.name}」`);
  };

  const handleSaveTemplateDetailPage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formName.trim()) {
      alert('请输入模板名称');
      return;
    }
    if (formFields.length === 0) {
      alert('请至少配置一个表单字段');
      return;
    }
    const emptyField = formFields.find(f => !f.name.trim());
    if (emptyField) {
      alert('存在未命名的表单字段，请完善字段名称');
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (editingItem && !editingItem.isDefault) {
      setDataStore(prev => ({
        ...prev,
        report_template: (prev.report_template || []).map(item =>
          item.id === editingItem.id
            ? {
                ...item,
                name: formName.trim(),
                templateType: formTemplateType,
                status: formScoreStatus,
                description: formDesc.trim(),
                updateTime: nowStr,
                fields: formFields
              }
            : item
        )
      }));
      showConfigToast(`已成功保存模板「${formName.trim()}」`);
    } else {
      const newItem: ConfigModuleItem = {
        id: String(Date.now()),
        name: formName.trim(),
        templateType: formTemplateType,
        isDefault: false,
        status: formScoreStatus,
        updateTime: nowStr,
        description: formDesc.trim() || `${formTemplateType}模板配置`,
        fields: formFields
      };
      setDataStore(prev => ({
        ...prev,
        report_template: [
          ...(prev.report_template || []),
          newItem
        ]
      }));
      showConfigToast(`已成功创建模板「${formName.trim()}」`);
    }
    setIsTemplateDetailPageOpen(false);
    setEditingItem(null);
  };

  const handleSwitchAuditFlowMode = (mode: AuditFlowMode) => {
    setFormAuditFlowMode(mode);
    setFormSimulatorScenario('depth_5');
    setSimResultStatus('idle');

    if (mode === 'direct_headquarters') {
      if (!editingItem || formName.includes('逐级') || formName.includes('最多')) {
        setFormName('直接总机构审核通道');
        setFormDesc('【扁平直审】无需下级或中间机构审核，上报人提报后直接由总机构终审并评分。');
      }
      const directNodes: AuditNode[] = [
        { id: 'an_dir_1', nodeName: '发起上报直报', approverRole: '提报人员', assigneeSource: 'role' as const, rejectStrategy: 'return_submitter' as const, timeLimitMinutes: 10 },
        { id: 'an_dir_final', nodeName: '总机构终审并评分', approverRole: '总机构管理员', assigneeSource: 'role' as const, rejectStrategy: 'return_submitter' as const, timeLimitMinutes: 60, isUnifiedFinalNode: true }
      ];
      setFormAuditNodes(directNodes);
      setSelectedAuditNodeId(directNodes[1].id);
      setFormFlowDepth(2);
    } else if (mode === 'max_n_steps') {
      if (!editingItem || formName.includes('逐级') || formName.includes('直接')) {
        setFormName(`最多${formMaxIntermediateNodes}级快速审核流程`);
        setFormDesc(`【上限截断】下级机构提报后最多经过${formMaxIntermediateNodes}个中间机构审核后直达总机构终审并评分。不足${formMaxIntermediateNodes}级按实际层级自适应审核，不强制补齐。`);
      }
      const maxNNodes: AuditNode[] = [
        { id: 'an_max_1', nodeName: '基层机构初审', approverRole: '基层机构负责人', assigneeSource: 'org_owner' as const, rejectStrategy: 'return_submitter' as const, timeLimitMinutes: 15 },
        { id: 'an_max_2', nodeName: `中间机构流转 (最多${formMaxIntermediateNodes}级)`, approverRole: '各级审核负责人', assigneeSource: 'org_owner' as const, rejectStrategy: 'return_previous' as const, timeLimitMinutes: 30 },
        { id: 'an_max_final', nodeName: '总机构终审并评分', approverRole: '总机构管理员', assigneeSource: 'role' as const, rejectStrategy: 'return_previous' as const, timeLimitMinutes: 60, isUnifiedFinalNode: true }
      ];
      setFormAuditNodes(maxNNodes);
      setSelectedAuditNodeId(maxNNodes[0].id);
      setFormFlowDepth(3);
    } else {
      // step_by_step
      if (!editingItem || formName.includes('最多') || formName.includes('直接')) {
        setFormName('逐级审核流程（组织树自适应）');
        setFormDesc('本级机构提报后沿组织树逐级向上传递审核，最终由总机构终审并评分。系统动态解析审核路径，自动适配任意组织深度。');
      }
      const stepNodes: AuditNode[] = [
        { ...createDefaultAuditNode(1), id: 'an_1', nodeName: '本级机构初审', approverRole: '本级机构负责人', assigneeSource: 'org_owner' as const, timeLimitMinutes: 15 },
        { ...createDefaultAuditNode(2), id: 'an_2', nodeName: '上级机构逐级复核', approverRole: '上级机构负责人', assigneeSource: 'org_owner' as const, timeLimitMinutes: 30 },
        { ...createDefaultAuditNode(3), id: 'an_3', nodeName: '总机构终审并评分', approverRole: '总机构管理员', assigneeSource: 'role' as const, timeLimitMinutes: 60, isUnifiedFinalNode: true }
      ];
      setFormAuditNodes(stepNodes);
      setSelectedAuditNodeId(stepNodes[0].id);
      setFormFlowDepth(3);
    }
  };

  const handleMaxIntermediateNodesChange = (newCount: number) => {
    const val = Math.max(1, Math.min(5, newCount));
    setFormMaxIntermediateNodes(val);
    if (formAuditFlowMode === 'max_n_steps') {
      setFormAuditNodes(prev => prev.map(n => {
        if (n.id.includes('max_2') || n.nodeName.includes('中间机构')) {
          return { ...n, nodeName: `中间机构流转 (最多${val}级)` };
        }
        return n;
      }));
      if (!editingItem || formName.includes('最多')) {
        setFormName(`最多${val}级快速审核流程`);
      }
    }
  };

  // Handle Open Modal for Add / Edit
  const openAddModal = () => {
    if (activeModule === 'report_template') {
      openAddTemplatePage();
      return;
    }
    setEditingItem(null);
    setFormName('');
    setFormTemplateType('报送');
    setFormDesc('');
    setModalActiveTab('build');
    setPreviewValues({});

    if (activeModule === 'data_dict' || activeModule === 'reject_reason') {
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
      setFormName('自定义百分制打分规则组');
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
      setFormDesc('本级机构提报后沿组织树逐级向上传递审核，最终由总机构终审并评分。系统动态解析审核路径，自动适配任意组织深度。');
      setFormScoreStatus('启用');
      const defaultTpl = enabledReportTemplates[0];
      setFormRelatedTemplateId(defaultTpl ? defaultTpl.id : '1');
      setFormTemplateApplyMode('all_report_templates');
      setFormAuditFlowMode('step_by_step');
      setFormMaxIntermediateNodes(3);
      setFormSimulatorScenario('depth_5');
      setSimResultStatus('idle');
      setFormFlowDepth(3);
      setFormOrgApplyMode('all_orgs');
      setFormOrgSettings(defaultOrgList);
      setFormOwnerMissingStrategy('skip_to_next');
      setFormOwnerMissingFallbackRole('机构管理员');
      setFormOwnerMissingFallbackUserName('');
      resetOrgPickerState();
      const defaultFlowNodes = [
        { ...createDefaultAuditNode(1), id: 'an_1', nodeName: '本级机构初审', approverRole: '本级机构负责人', assigneeSource: 'org_owner' as const, timeLimitMinutes: 15 },
        { ...createDefaultAuditNode(2), id: 'an_2', nodeName: '上级机构逐级复核', approverRole: '上级机构负责人', assigneeSource: 'org_owner' as const, timeLimitMinutes: 30 },
        { ...createDefaultAuditNode(3), id: 'an_3', nodeName: '总机构终审并评分', approverRole: '总机构管理员', assigneeSource: 'role' as const, timeLimitMinutes: 60, isUnifiedFinalNode: true }
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
    if (activeModule === 'report_template') {
      openEditTemplatePage(item);
      return;
    }
    if (item.isDefault && activeModule !== 'evaluation_rule') {
      alert('系统默认模板不支持删除和修改！仅提供查看功能。如需个性化格式，请新建“自定义”模板。');
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
      const defaultTpl = enabledReportTemplates[0];
      setFormRelatedTemplateId(item.relatedTemplateId || (defaultTpl ? defaultTpl.id : '1'));
      setFormTemplateApplyMode(item.templateApplyMode || (item.relatedTemplateId === 'all_report_templates' ? 'all_report_templates' : 'single_template'));
      setFormAuditFlowMode(item.auditFlowMode || 'step_by_step');
      setFormMaxIntermediateNodes(item.maxIntermediateNodes || 3);
      setFormSimulatorScenario('depth_5');
      setSimResultStatus('idle');
      setFormFlowDepth(item.flowDepth || (item.auditNodes ? item.auditNodes.length : 3));
      setFormOrgApplyMode(item.orgApplyMode || 'all_orgs');
      setFormOrgSettings(item.orgSettings && item.orgSettings.length > 0 ? item.orgSettings : defaultOrgList);
      setFormOwnerMissingStrategy(item.ownerMissingStrategy || 'skip_to_next');
      setFormOwnerMissingFallbackRole(item.ownerMissingFallbackRole || '机构管理员');
      setFormOwnerMissingFallbackUserName(item.ownerMissingFallbackUserName || '');
      resetOrgPickerState();
      const editFlowNodes = item.auditNodes && item.auditNodes.length > 0
        ? item.auditNodes.map((node, idx) => ({
            ...node,
            assigneeSource: node.assigneeSource || 'role',
            rejectStrategy: node.rejectStrategy || (idx === item.auditNodes!.length - 1 ? 'return_previous' : 'return_submitter'),
            isUnifiedFinalNode: node.isUnifiedFinalNode || idx === item.auditNodes!.length - 1
          }))
        : [
            { ...createDefaultAuditNode(1), id: 'an_1', nodeName: '本级机构初审', approverRole: '本级机构负责人', assigneeSource: 'org_owner', timeLimitMinutes: 15 },
            { ...createDefaultAuditNode(2), id: 'an_2', nodeName: '上级机构逐级复核', approverRole: '上级机构负责人', assigneeSource: 'org_owner', timeLimitMinutes: 30 },
            { ...createDefaultAuditNode(3), id: 'an_3', nodeName: '总机构终审并评分', approverRole: '总机构管理员', assigneeSource: 'role', timeLimitMinutes: 60, isUnifiedFinalNode: true }
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

      setDataStore(prev => ({
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

      setDataStore(prev => ({
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
        setDataStore(prev => ({
          ...prev,
          evaluation_rule: prev.evaluation_rule.map(i => (i.id === editingItem.id ? evalItem : i))
        }));
      } else {
        setDataStore(prev => ({
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

      setDataStore(prev => ({
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

      if (editingItem?.status === '启用' && formScoreStatus === '停用' && enabledScoreCount <= 1) {
        alert('至少需要保留一组启用中的审核打分规则');
        return;
      }

      if (editingItem) {
        setDataStore(prev => ({
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
            return isEnabled ? { ...item, status: '停用' as const } : item;
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
        setDataStore(prev => ({
          ...prev,
          audit_score: [
            ...(isEnabled ? prev.audit_score.map(item => ({ ...item, status: '停用' as const })) : prev.audit_score),
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

      let effectiveNodes: AuditNode[] = [];
      if (formAuditFlowMode === 'direct_headquarters') {
        effectiveNodes = formAuditNodes.length >= 2
          ? formAuditNodes.map((n, idx) => ({
              ...n,
              isUnifiedFinalNode: idx === formAuditNodes.length - 1 ? true : n.isUnifiedFinalNode
            }))
          : [
              { id: 'an_direct_1', nodeName: '发起上报直报', approverRole: '提报人员', assigneeSource: 'role', rejectStrategy: 'return_submitter', timeLimitMinutes: 10 },
              { id: 'an_direct_final', nodeName: '总机构终审并评分', approverRole: '总机构管理员', assigneeSource: 'role', rejectStrategy: 'return_submitter', timeLimitMinutes: 60, isUnifiedFinalNode: true }
            ];
      } else if (formAuditFlowMode === 'max_n_steps') {
        effectiveNodes = formAuditNodes.length >= 2
          ? formAuditNodes.map((n, idx) => ({
              ...n,
              isUnifiedFinalNode: idx === formAuditNodes.length - 1 ? true : n.isUnifiedFinalNode
            }))
          : [
              { id: 'an_maxn_1', nodeName: '基层机构初审', approverRole: '基层机构负责人', assigneeSource: 'org_owner', rejectStrategy: 'return_submitter', timeLimitMinutes: 15 },
              { id: 'an_maxn_2', nodeName: `中间机构流转 (最多${formMaxIntermediateNodes}级)`, approverRole: '各级审核负责人', assigneeSource: 'org_owner', rejectStrategy: 'return_previous', timeLimitMinutes: 30 },
              { id: 'an_maxn_final', nodeName: '总机构终审并评分', approverRole: '总机构管理员', assigneeSource: 'role', rejectStrategy: 'return_previous', timeLimitMinutes: 60, isUnifiedFinalNode: true }
            ];
      } else {
        effectiveNodes = formAuditNodes.length >= 2
          ? formAuditNodes.map((n, idx) => ({
              ...n,
              isUnifiedFinalNode: idx === formAuditNodes.length - 1 ? true : n.isUnifiedFinalNode
            }))
          : [
              { ...createDefaultAuditNode(1), id: 'an_1', nodeName: '本级机构初审', approverRole: '本级机构负责人', assigneeSource: 'org_owner', timeLimitMinutes: 15 },
              { ...createDefaultAuditNode(2), id: 'an_2', nodeName: '上级机构逐级复核', approverRole: '上级机构负责人', assigneeSource: 'org_owner', timeLimitMinutes: 30 },
              { ...createDefaultAuditNode(3), id: 'an_3', nodeName: '总机构终审并评分', approverRole: '总机构管理员', assigneeSource: 'role', timeLimitMinutes: 60, isUnifiedFinalNode: true }
            ];
      }

      const flowItem: ConfigModuleItem = {
        id: editingItem ? editingItem.id : String(Date.now()),
        name: formName.trim(),
        isDefault: editingItem ? editingItem.isDefault : false,
        status: formScoreStatus,
        updateTime: nowStr,
        description: formDesc.trim() || '自定义审核流程层级规则',
        relatedTemplateId: relTplId,
        relatedTemplateName: relTplName,
        templateApplyMode: formTemplateApplyMode,
        auditFlowMode: formAuditFlowMode,
        maxIntermediateNodes: formMaxIntermediateNodes,
        flowDepth: effectiveNodes.length,
        auditNodes: effectiveNodes,
        orgApplyMode: formOrgApplyMode,
        orgSettings: formOrgSettings,
        ownerMissingStrategy: formOwnerMissingStrategy,
        ownerMissingFallbackRole: formOwnerMissingStrategy === 'fallback_role' ? formOwnerMissingFallbackRole : undefined,
        ownerMissingFallbackUserName: formOwnerMissingStrategy === 'fallback_user' ? formOwnerMissingFallbackUserName : undefined
      };

      if (editingItem) {
        setDataStore(prev => ({
          ...prev,
          audit_flow: (prev.audit_flow || []).map(i => (i.id === editingItem.id ? flowItem : i))
        }));
      } else {
        setDataStore(prev => ({
          ...prev,
          audit_flow: [...(prev.audit_flow || []), flowItem]
        }));
      }
      setIsModalOpen(false);
      return;
    }

    if (editingItem) {
      setDataStore(prev => ({
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
      setDataStore(prev => ({
        ...prev,
        [activeModule]: [...prev[activeModule], newItem]
      }));
    }

    setIsModalOpen(false);
  };

  const currentModuleDesc =
    activeModule === 'report_template'
      ? '管理各业务报送模版、验证激活模版与动态表单字段'
      : activeModule === 'audit_flow'
      ? '可视化设计多级审核流程链路、审批节点、责任人缺失兜底与适用机构范围'
      : activeModule === 'audit_score'
      ? '维护审核评分等级、各级分值标准、考核权重与打分触发时机规则'
      : activeModule === 'data_dict'
      ? '维护系统标准数据字典、驳回原由、信息分类、来源渠道与紧急程度代码'
      : activeModule === 'value_added'
      ? '展示系统当前支持的各项增值扩展功能及其详细功能介绍与开通申请'
      : '管理系统内的各类业务规则与数据配置';

  return (
    <div className="space-y-4">
      {/* Top Page Title - aligns with system-wide page layout */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">其他业务配置</h2>
        <p className="text-xs text-gray-400 mt-0.5">管理系统内的各类业务配置</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Navigation (切换导航放在左侧) */}
        <aside className="w-full lg:w-56 shrink-0 sticky top-4">
          {/* Sidebar Navigation Card - top aligned with right side card */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3 space-y-1.5">
            {moduleList.map(mod => {
              const isActive = activeModule === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => {
                    setActiveModule(mod.id);
                    setSearchQuery('');
                    setIsTemplateDetailPageOpen(false);
                    if (onNavigatePage) {
                      onNavigatePage('business-config', mod.id);
                    }
                  }}
                  className={`w-full text-left px-5 py-3 rounded-xl relative flex items-center transition-all duration-150 cursor-pointer text-sm ${
                    isActive
                      ? 'bg-[#F0F5FF] text-[#1E5ABB] font-bold'
                      : 'text-slate-700 font-normal hover:text-[#1E5ABB] hover:bg-slate-50'
                  }`}
                >
                  {/* Left Active Indicator Bar */}
                  {isActive && (
                    <span className="absolute left-2.5 top-2.5 bottom-2.5 w-1 bg-[#1E5ABB] rounded-full" />
                  )}
                  <span>{mod.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Content Area */}
        <section className="flex-1 min-w-0 w-full space-y-4">
          {/* Top Header */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-gray-800 tracking-tight">
                  {isTemplateDetailPageOpen ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span>{currentModuleLabel}</span>
                      <span className="text-gray-300 font-normal">/</span>
                      <span className="text-[#1E5ABB]">
                        {editingItem?.id
                          ? (editingItem.isDefault ? '查看模板详情' : '编辑模板')
                          : (templateTypeFilter === '激活' ? '新增激活模板' : '新增报送模板')}
                      </span>
                    </span>
                  ) : (
                    currentModuleLabel
                  )}
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-[#1E5ABB] font-medium border border-blue-100">
                  其他业务配置
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {isTemplateDetailPageOpen
                  ? (templateTypeFilter === '激活'
                      ? '配置验证激活模板字段结构、上报规则及关联流程'
                      : '配置报送模板字段结构、移动端组件、关联审核流程与考核评分规则')
                  : currentModuleDesc}
              </p>
            </div>

            {/* Right: Actions in Header */}
            {(activeModule === 'audit_score' || activeModule === 'audit_flow' || activeModule === 'data_dict') && !isTemplateDetailPageOpen && (
              <button
                type="button"
                onClick={openAddModal}
                className="px-3.5 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold rounded shadow-2xs flex items-center space-x-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  {activeModule === 'audit_flow'
                    ? '新增审核流程'
                    : activeModule === 'audit_score'
                    ? '新增打分规则'
                    : dictSubCategoryFilter === 'reject_reason'
                    ? '新增驳回理由'
                    : dictSubCategoryFilter === 'info_category'
                    ? '新增人员标签'
                    : '新增字典项'}
                </span>
              </button>
            )}
          </div>

          {/* Main Card: Dynamic Detail View */}
          <div className="w-full bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between min-h-[460px] space-y-4">
          <div className="space-y-4">
            {/* Action Bar / Search & Add Toolbar for Modules (hidden when editing/viewing template detail page) */}
            {!isTemplateDetailPageOpen && (
              activeModule === 'report_template' ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                  {/* Left: Template Type Switcher */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="inline-flex items-center gap-1 p-1 bg-gray-100 border border-gray-200 rounded-lg">
                      {([
                        {
                          id: '报送' as const,
                          label: '报送模板',
                          icon: FileText,
                          count: (dataStore.report_template || []).filter(t => (t.templateType || '报送') === '报送').length
                        },
                        {
                          id: '激活' as const,
                          label: '激活模板',
                          icon: Zap,
                          count: (dataStore.report_template || []).filter(t => t.templateType === '激活').length
                        }
                      ]).map(tab => {
                        const TabIcon = tab.icon;
                        const isActive = templateTypeFilter === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => setTemplateTypeFilter(tab.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-white text-[#1E5ABB] shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <TabIcon className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Add Template Button */}
                  <button
                    type="button"
                    onClick={openAddTemplatePage}
                    className="px-3.5 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold rounded shadow-2xs flex items-center space-x-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{templateTypeFilter === '激活' ? '新增激活模板' : '新增报送模板'}</span>
                  </button>
                </div>
              ) : activeModule === 'audit_flow' ? null : activeModule === 'audit_score' ? null : activeModule === 'data_dict' ? (
                <div className="pb-1">
                  {/* Sub-category Tabs */}
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
                </div>
              ) : (
              /* Fallback Action Bar for other modules */
              activeModule !== 'value_added' && activeModule !== 'stats_metric' && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={`搜索${currentModuleLabel}名称/编码/描述...`}
                        className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md w-56 sm:w-64 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-gray-50/50 text-gray-700 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {activeModule !== 'evaluation_rule' && (
                    <button
                      type="button"
                      onClick={openAddModal}
                      className="px-3.5 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold rounded shadow-2xs flex items-center space-x-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新增{currentModuleLabel}</span>
                    </button>
                  )}
                </div>
              )
            ))}

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
                    <div className="overflow-x-auto border border-gray-200/80 rounded-lg bg-white shadow-2xs">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-gray-50/80 text-gray-500 border-b border-gray-200 font-medium">
                            <th className="py-2.5 px-4 font-medium whitespace-nowrap w-14 text-center">序号</th>
                            <th className="py-2.5 px-4 font-medium whitespace-nowrap min-w-36">
                              {isRejectReasonView ? '驳回理由' : '字典项名称'}
                            </th>
                            <th className="py-2.5 px-4 font-medium whitespace-nowrap min-w-28 font-mono">字典编码</th>
                            {!isRejectReasonView && (
                              <th className="py-2.5 px-4 font-medium whitespace-nowrap">所属分类</th>
                            )}
                            <th className="py-2.5 px-4 font-medium min-w-56">
                              {isRejectReasonView ? '审核员提示说明' : isPersonnelRoleView ? '角色分类' : '业务说明'}
                            </th>
                            <th className="py-2.5 px-4 font-medium whitespace-nowrap text-center w-16">排序号</th>
                            <th className="py-2.5 px-4 font-medium whitespace-nowrap w-24">状态</th>
                            <th className="py-2.5 px-4 font-medium whitespace-nowrap w-28">更新时间</th>
                            <th className="py-2.5 px-4 font-medium text-center whitespace-nowrap w-24">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                          {sortedDictList.length === 0 ? (
                            <tr>
                              <td colSpan={isRejectReasonView ? 8 : 9} className="py-12 text-center text-gray-400 text-xs">
                                暂无相关字典条目
                              </td>
                            </tr>
                          ) : (
                            sortedDictList.map((item, index) => {
                              const itemCategory = item.dictCategory || 'reject_reason';
                              const itemMeta = getDictCategoryMeta(itemCategory);
                              return (
                                <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                                  <td className="py-3 px-4 align-middle text-center whitespace-nowrap text-gray-400 font-mono">
                                    {index + 1}
                                  </td>
                                  <td className="py-3 px-4 align-middle">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="font-bold text-gray-900 truncate" title={item.name}>{item.name}</span>
                                      {item.isDefault ? (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 font-bold rounded border border-gray-200 shrink-0">
                                          <Lock className="w-2.5 h-2.5 text-gray-400" />
                                          系统默认
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200 shrink-0">
                                          <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                          自定义
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 align-middle whitespace-nowrap font-mono text-gray-500 text-[11px]">
                                    {item.dictCode || buildDictCode(itemCategory, item.sortOrder || index + 1)}
                                  </td>
                                  {!isRejectReasonView && (
                                    <td className="py-3 px-4 align-middle whitespace-nowrap">
                                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border ${getDictCategoryBadge(itemCategory)}`}>
                                        {itemMeta.label}
                                      </span>
                                    </td>
                                  )}
                                  <td className="py-3 px-4 align-middle">
                                    <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2" title={item.description || ''}>
                                      {isPersonnelRoleView && itemCategory === 'info_category'
                                        ? getPersonnelRoleGroupLabel(item)
                                        : item.description || (isRejectReasonView ? '审核员选择该理由后，将作为本次驳回说明同步给上报人。' : itemMeta.description)}
                                    </p>
                                  </td>
                                  <td className="py-3 px-4 align-middle text-center whitespace-nowrap font-mono text-gray-500">
                                    {item.sortOrder || index + 1}
                                  </td>
                                  <td className="py-3 px-4 align-middle whitespace-nowrap">
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
                                  <td className="py-3 px-4 align-middle whitespace-nowrap font-mono text-gray-400 text-[11px]">
                                    {item.updateTime}
                                  </td>
                                  <td className="py-3 px-4 align-middle text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => openPreviewItem(item)}
                                        title="查看详情"
                                        className="p-1 text-gray-400 hover:text-[#1E5ABB] rounded hover:bg-blue-50 cursor-pointer"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                      {item.isDefault ? (
                                        <span className="p-1 text-gray-300 cursor-not-allowed" title="系统默认字典项暂不支持编辑">
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </span>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => openEditModal(item)}
                                          title="编辑"
                                          className="p-1 text-[#1E5ABB] hover:bg-blue-50 rounded cursor-pointer"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      {item.isDefault ? (
                                        <span className="p-1 text-gray-300 cursor-not-allowed" title="系统默认字典项不可删除">
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </span>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleDelete(item)}
                                          title="删除"
                                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
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
                  );
                })()}
              </div>
            ) : activeModule === 'audit_score' ? (
              <div className="space-y-3">
                {filteredList.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs bg-white rounded-lg border border-gray-100">
                    暂无相关审核打分规则配置
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredList.map(item => {
                      const isEnabled = item.status === '启用';
                      const levelCount = item.levelCount || (item.scoreLevels || []).length || 5;
                      const totalScore = item.totalScore ?? ((item.scoreLevels && item.scoreLevels[0]?.score) || 100);
                      const desc = item.description || '自定义审核打分规则组';

                      return (
                        <div
                          key={item.id}
                          className={`rounded-xl border transition-all flex flex-col justify-between overflow-hidden bg-white ${
                            isEnabled
                              ? 'border-blue-200/90 shadow-2xs hover:shadow-md hover:border-blue-300'
                              : 'border-gray-200/80 shadow-2xs hover:shadow-md hover:border-gray-300'
                          }`}
                        >
                          <div className="p-4 space-y-3 min-w-0">
                            {/* Top Title + Badge + Status Toggle */}
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                                <h3 className="font-bold text-sm text-gray-900 truncate" title={item.name}>
                                  {item.name}
                                </h3>
                                {item.isDefault ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-500 font-medium rounded border border-gray-200 shrink-0 whitespace-nowrap">
                                    <Lock className="w-3 h-3 text-gray-400" />
                                    系统默认
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-blue-50 text-[#1E5ABB] font-medium rounded border border-blue-200 shrink-0 whitespace-nowrap">
                                    <Sparkles className="w-3 h-3 text-[#1E5ABB]" />
                                    自定义
                                  </span>
                                )}
                              </div>

                              <div className="shrink-0">
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleToggleStatus(item.id);
                                  }}
                                  className={`flex items-center gap-1.5 py-1 rounded-full cursor-pointer transition-colors shadow-2xs ${
                                    isEnabled
                                      ? 'pl-2.5 pr-1 bg-[#1E5ABB] text-white'
                                      : 'pl-1 pr-2.5 bg-gray-200 text-gray-500'
                                  }`}
                                  title={isEnabled ? '点击禁用' : '点击启用'}
                                >
                                  {isEnabled ? (
                                    <>
                                      <span className="text-xs font-bold whitespace-nowrap">启用</span>
                                      <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm shrink-0" />
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm shrink-0" />
                                      <span className="text-xs font-bold whitespace-nowrap">禁用</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Tags & Meta */}
                            <div className="flex items-center justify-between gap-2 text-xs pt-0.5 min-w-0 overflow-hidden">
                              <div className="flex items-center gap-2 shrink min-w-0 overflow-hidden">
                                <span className="px-2 py-0.5 text-xs text-gray-700 bg-gray-100/80 rounded border border-gray-200 shrink-0 whitespace-nowrap">
                                  总分 <strong className="font-bold text-gray-900">{totalScore} 分</strong>
                                </span>
                                <span className="px-2 py-0.5 text-xs font-medium rounded border border-blue-300 text-[#1E5ABB] bg-blue-50/50 shrink-0 whitespace-nowrap">
                                  {levelCount} 个打分等级
                                </span>
                              </div>
                              <span className="text-xs text-gray-400 font-mono shrink-0 ml-auto whitespace-nowrap">{item.updateTime}</span>
                            </div>

                            {/* Description Box: Single line truncated */}
                            <div className="rounded-lg bg-gray-50/80 border border-gray-100 px-3 py-2 text-xs text-gray-600">
                              <p className="truncate text-gray-600" title={desc}>
                                {desc}
                              </p>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                openPreviewItem(item);
                              }}
                              className="text-xs text-gray-500 hover:text-[#1E5ABB] flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap truncate"
                            >
                              <Eye className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate">查看打分规则详情 →</span>
                            </button>

                            <div className="flex items-center gap-2 shrink-0">
                              {item.isDefault ? (
                                <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                                  <Lock className="w-3.5 h-3.5 shrink-0" />
                                  <span>内置</span>
                                </div>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      openEditModal(item);
                                    }}
                                    className="p-1 text-gray-400 hover:text-[#1E5ABB] rounded cursor-pointer transition-colors"
                                    title="编辑"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleDelete(item);
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-600 rounded cursor-pointer transition-colors"
                                    title="删除"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
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
              isTemplateDetailPageOpen ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* 1. Header Navigation & Breadcrumb */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200/80">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setIsTemplateDetailPageOpen(false);
                          setEditingItem(null);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 bg-white hover:text-[#1E5ABB] hover:bg-blue-50/70 rounded-md border border-gray-200 transition-colors shadow-2xs cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>返回模板列表</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsTemplateDetailPageOpen(false);
                          setEditingItem(null);
                        }}
                        className="px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded text-xs font-medium cursor-pointer"
                      >
                        取消返回
                      </button>
                      {editingItem?.isDefault ? (
                        <button
                          type="button"
                          onClick={handleCloneDefaultTemplate}
                          className="px-3.5 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>基于此模板新建</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSaveTemplateDetailPage()}
                          className="px-4 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>保存模板配置</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {editingItem?.isDefault && (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold">系统内置默认模板</span>
                        <span className="text-amber-700 ml-1">
                          系统默认模板为基础统一规范，不支持直接修改和删除。如需自定义字段，可点击右上角「基于此模板新建」创建专属版本。
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 2. Basic Configuration Card */}
                  <div className="bg-white rounded-lg border border-gray-200/80 p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-gray-800">
                        <FileText className="w-4 h-4 text-[#1E5ABB]" />
                        <span>基本属性设置</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          模板名称 <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          disabled={editingItem?.isDefault}
                          value={formName}
                          onChange={e => setFormName(e.target.value)}
                          placeholder={formTemplateType === '激活' ? '例如：重点应急目标快速激活' : '例如：重大突发事件应急处置报送'}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] font-bold text-gray-800 disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-1">说明描述</label>
                        <input
                          type="text"
                          disabled={editingItem?.isDefault}
                          value={formDesc}
                          onChange={e => setFormDesc(e.target.value)}
                          placeholder="请输入适用业务场景与填报说明..."
                          className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Form Fields Designer & Interactive Live Preview */}
                  <div className="bg-white rounded-lg border border-gray-200/80 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-gray-800">
                        <Layers className="w-4 h-4 text-[#1E5ABB]" />
                        <span>表单字段设计与用户端交互预览</span>
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100">
                          共 {formFields.length} 个字段
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        左侧自由调整表单字段，右侧实时体验上报用户的填报界面
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,1fr)] xl:grid-cols-[minmax(0,1.3fr)_minmax(400px,1fr)] gap-5 items-start">
                      {/* Left Column: Field Builder */}
                      <div className="space-y-3 min-w-0">
                        <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden">
                          {fieldAddNotice && (
                            <div className="absolute left-1/2 top-2 z-20 -translate-x-1/2 px-3 py-1.5 bg-gray-900/90 text-white rounded-md shadow-lg text-xs font-bold flex items-center gap-1.5 animate-in fade-in zoom-in-95 pointer-events-none">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                              <span>{fieldAddNotice}</span>
                            </div>
                          )}

                          <div className="px-3 py-2 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                            <span className="font-bold text-gray-800 text-xs">已配置字段列表 ({formFields.length})</span>
                            {editingItem?.isDefault ? (
                              <span className="text-[11px] text-gray-400">系统默认字段（只读展示）</span>
                            ) : (
                              <button
                                type="button"
                                onClick={handleLoadStandardPreset}
                                className="px-2.5 py-1 text-xs font-bold text-[#1E5ABB] hover:text-white bg-blue-50 hover:bg-[#1E5ABB] border border-blue-200 hover:border-[#1E5ABB] rounded transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>使用标准模板预设</span>
                              </button>
                            )}
                          </div>

                          {formFields.length === 0 ? (
                            <div className="p-8 text-center bg-gray-50 text-gray-400 space-y-3">
                              <Layers className="w-8 h-8 text-gray-300 mx-auto" />
                              <p className="text-xs">暂未添加字段，请点击下方“添加字段”或右上角“使用标准模板预设”。</p>
                              {!editingItem?.isDefault && (
                                <div className="pt-2 flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => handleAddField('text')}
                                    className="w-full max-w-xs py-2 px-4 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>添加字段</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-3 space-y-2">
                              {formFields.map((field, index) => {
                                const meta = getFieldTypeMeta(field.type);
                                const IconComp = meta.icon;
                                const isReadOnly = Boolean(editingItem?.isDefault);

                                return (
                                  <div
                                    key={field.id}
                                    ref={index === formFields.length - 1 ? latestFieldRef : null}
                                    draggable={!isReadOnly}
                                    onDragStart={() => !isReadOnly && setDraggingFieldIndex(index)}
                                    onDragOver={e => !isReadOnly && e.preventDefault()}
                                    onDrop={() => !isReadOnly && handleDropField(index)}
                                    onDragEnd={() => !isReadOnly && setDraggingFieldIndex(null)}
                                    className={`bg-white p-3 rounded-lg border shadow-2xs transition-colors space-y-2 ${
                                      !isReadOnly ? 'hover:border-blue-200 cursor-move' : ''
                                    } ${
                                      draggingFieldIndex === index
                                        ? 'border-blue-300 bg-blue-50/50 opacity-70'
                                        : 'border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <span className="w-6 h-6 rounded bg-gray-100 text-gray-500 text-[10px] font-mono flex items-center justify-center gap-0.5 shrink-0 mt-0.5" title={isReadOnly ? `第 ${index + 1} 个字段` : '拖拽调整字段顺序'}>
                                        {!isReadOnly && <GripVertical className="w-2.5 h-2.5 text-gray-300" aria-hidden="true" />}
                                        <span>{index + 1}</span>
                                      </span>
                                      <div className="flex-1 min-w-0 space-y-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-2">
                                          <div className="relative">
                                            <select
                                              disabled={isReadOnly}
                                              value={field.type}
                                              onChange={e => handleUpdateField(index, { type: e.target.value as FieldType })}
                                              className="w-full pl-7 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                            disabled={isReadOnly}
                                            value={field.name}
                                            onChange={e => handleUpdateField(index, { name: e.target.value })}
                                            placeholder="字段名称，例如: 事件主题"
                                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] text-xs font-medium text-gray-800 disabled:bg-gray-50 disabled:text-gray-600"
                                          />
                                        </div>

                                        <input
                                          type="text"
                                          disabled={isReadOnly}
                                          value={field.placeholder || ''}
                                          onChange={e => handleUpdateField(index, { placeholder: e.target.value })}
                                          placeholder="给填报人员看的填写提示，例如：请简要说明事件经过"
                                          className="w-full px-2.5 py-1.5 text-xs bg-gray-50/60 border border-gray-200 rounded text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] disabled:bg-gray-100 disabled:text-gray-500"
                                        />

                                        {field.type === 'select' && (
                                          <div className="p-2 bg-rose-50/40 border border-rose-100 rounded space-y-1.5">
                                            <div className="text-[10px] text-rose-700 font-bold">选择项配置</div>
                                            <div className="space-y-1.5">
                                              {(field.options && field.options.length > 0 ? field.options : ['']).map((option, optionIndex) => (
                                                <div key={optionIndex} className="flex items-center gap-1.5">
                                                  <input
                                                    type="text"
                                                    disabled={isReadOnly}
                                                    value={option}
                                                    onChange={e => {
                                                      const next = [...(field.options && field.options.length > 0 ? field.options : [''])];
                                                      next[optionIndex] = e.target.value;
                                                      handleUpdateField(index, { options: next });
                                                    }}
                                                    placeholder={`选项${optionIndex + 1}`}
                                                    className="flex-1 px-2 py-1 text-[11px] bg-white border border-rose-100 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] disabled:bg-gray-50"
                                                  />
                                                  {!isReadOnly && (
                                                    <button
                                                      type="button"
                                                      onClick={() => handleUpdateField(index, { options: (field.options || []).filter((_, idx) => idx !== optionIndex) })}
                                                      className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                                      title="删除选项"
                                                    >
                                                      <Trash2 className="w-3 h-3" />
                                                    </button>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                            {!isReadOnly && (
                                              <button
                                                type="button"
                                                onClick={() => handleUpdateField(index, { options: [...(field.options || []), `选项${(field.options || []).length + 1}`] })}
                                                className="px-2 py-1 text-[10px] font-bold text-rose-700 bg-white border border-rose-100 rounded hover:border-rose-300 cursor-pointer"
                                              >
                                                + 新增选项
                                              </button>
                                            )}
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
                                                    disabled={isReadOnly}
                                                    onClick={() => !isReadOnly && handleUpdateField(index, {
                                                      options: selected
                                                        ? (field.options || []).filter(option => option !== role)
                                                        : [...(field.options || []), role]
                                                    })}
                                                    className={`px-2 py-1 rounded border text-[10px] font-bold transition-colors ${
                                                      selected
                                                        ? 'bg-[#1E5ABB] text-white border-[#1E5ABB]'
                                                        : 'bg-white text-blue-700 border-blue-100 hover:border-blue-300'
                                                    } ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
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
                                          disabled={isReadOnly}
                                          onClick={() => !isReadOnly && handleUpdateField(index, { required: !field.required })}
                                          className={`h-6 px-1.5 rounded text-[10px] font-bold transition-colors ${
                                            field.required
                                              ? 'bg-red-50 text-red-600 border border-red-200'
                                              : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                                          } ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
                                          title={field.required ? '必填字段' : '选填字段'}
                                        >
                                          {field.required ? '必' : '选'}
                                        </button>
                                        {!isReadOnly && (
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteField(index)}
                                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                            title="删除字段"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                              {!editingItem?.isDefault && (
                                <div className="pt-2">
                                  <button
                                    type="button"
                                    onClick={() => handleAddField('text')}
                                    className="w-full py-2.5 px-3 border-2 border-dashed border-[#1E5ABB]/30 hover:border-[#1E5ABB] bg-blue-50/40 hover:bg-blue-50/80 text-[#1E5ABB] hover:text-[#134092] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs group"
                                  >
                                    <Plus className="w-4 h-4 transition-transform group-hover:scale-110 text-[#1E5ABB]" />
                                    <span>添加字段</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Column: Live User Preview */}
                      <div className="bg-gray-50/80 rounded-lg border border-gray-200/80 p-4 space-y-3">
                        <div className="w-full flex items-center justify-between text-xs pb-1">
                          <div className="inline-flex items-center gap-1.5 font-bold text-xs text-gray-800">
                            <Smartphone className="w-3.5 h-3.5 text-[#1E5ABB]" />
                            <span>移动端填报实时模拟</span>
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            共 {formFields.length} 个表单项 · 可直接体验输入
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <div className="w-[375px] max-w-full bg-white rounded-lg p-3.5 border border-gray-200/70 shadow-2xs">
                            {renderUserReportPreview(
                              formFields,
                              '请先在左侧添加表单字段，即可在此处实时体验用户填报效果',
                              formTemplateType,
                              'full'
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const activeSelectedTemplate = filteredList.find(item => item.id === selectedTemplateId) || filteredList[0] || null;

                    if (filteredList.length === 0) {
                      return (
                        <div className="py-16 text-center text-gray-400 text-xs bg-white rounded-lg border border-gray-100 space-y-2">
                          <Layers className="w-8 h-8 text-gray-300 mx-auto" />
                          <p>暂无匹配的模板配置</p>
                          <button
                            type="button"
                            onClick={openAddTemplatePage}
                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold rounded cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>立即新增模板</span>
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        ref={workbenchRef}
                        className={`bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden flex flex-col lg:flex-row min-h-[760px] ${
                          resizingSide ? 'select-none' : ''
                        }`}
                      >
                        <style>{`
                          @media (min-width: 1024px) {
                            .tpl-board-col-left { width: ${leftColWidth}px !important; max-width: ${leftColWidth}px !important; }
                            .tpl-board-col-right { width: ${rightColWidth}px !important; max-width: ${rightColWidth}px !important; }
                          }
                        `}</style>

                          {/* Left Master Column: Template directory with key essential information */}
                          <div className="tpl-board-col-left w-full shrink-0 border-b lg:border-b-0 flex flex-col min-h-0 bg-white">
                            <div className="h-12 px-3.5 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between shrink-0 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Layers className="w-3.5 h-3.5 text-[#1E5ABB] shrink-0" />
                                <span className="font-bold text-xs text-gray-800 shrink-0">模板目录</span>
                                <span className="px-1.5 py-0.5 text-[10px] bg-white border border-gray-200 text-gray-600 rounded-full font-mono font-medium shrink-0">
                                  {filteredList.length}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-400 shrink-0">切换预览</span>
                            </div>

                            <div className="p-3 space-y-2 bg-gray-50/20 flex-1 max-h-[750px] overflow-y-auto">
                              {filteredList.map(item => {
                                const isSelected = activeSelectedTemplate?.id === item.id;
                                const isEnabled = item.status === '启用';

                                return (
                                  <div
                                    key={item.id}
                                    onClick={() => setSelectedTemplateId(item.id)}
                                    className={`p-3 rounded-lg border transition-all cursor-pointer relative group ${
                                      isSelected
                                        ? 'border-l-4 border-l-[#1E5ABB] border-t-blue-200 border-r-blue-200 border-b-blue-200 bg-blue-50/50 shadow-xs ring-1 ring-[#1E5ABB]/20'
                                        : 'border-gray-200/80 bg-white hover:border-blue-200 hover:bg-gray-50/50 hover:shadow-2xs'
                                    }`}
                                  >
                                    {/* Row 1: Template Name + Status Switch */}
                                    <div className="flex items-center justify-between gap-2">
                                      <h3 className={`font-bold text-xs truncate flex-1 ${isSelected ? 'text-[#1E5ABB]' : 'text-gray-900'}`} title={item.name}>
                                        {item.name}
                                      </h3>

                                      {/* Status Toggle */}
                                      <button
                                        type="button"
                                        onClick={e => {
                                          e.stopPropagation();
                                          handleToggleStatus(item.id);
                                        }}
                                        className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${
                                          isEnabled
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-[#1E5ABB]'
                                        }`}
                                        title={isEnabled ? '点击停用' : '点击启用'}
                                      >
                                        <span className="text-[10px] font-bold">{item.status}</span>
                                        <div className={`w-5 h-2.5 flex items-center rounded-full p-0.5 transition-colors ${isEnabled ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                                          <div className="w-1.5 h-1.5 bg-white rounded-full shadow-2xs" />
                                        </div>
                                      </button>
                                    </div>

                                    {/* Row 2: Badge (系统默认/自定义) + Update Time */}
                                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                                      {item.isDefault ? (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 font-bold rounded border border-gray-200 shrink-0 whitespace-nowrap">
                                          <Lock className="w-2.5 h-2.5 text-gray-400" />
                                          系统默认
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200 shrink-0 whitespace-nowrap">
                                          <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                          自定义
                                        </span>
                                      )}

                                      {item.updateTime && (
                                        <span className="text-[10px] text-gray-400 font-mono">
                                          {item.updateTime}
                                        </span>
                                      )}
                                    </div>

                                    {/* Row 3: Description */}
                                    <div className="mt-1.5 text-[11px] text-gray-500">
                                      <p className="truncate text-gray-500" title={item.description || ''}>
                                        {item.description || '暂无模板说明'}
                                      </p>
                                    </div>

                                    {/* Card bottom bar: selection state + actions */}
                                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between gap-x-2 gap-y-1.5 flex-wrap text-xs">
                                      {isSelected ? (
                                        <span className="text-[#1E5ABB] text-[11px] font-bold flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#1E5ABB]" />
                                          <span>正在预览</span>
                                        </span>
                                      ) : (
                                        <span className="text-[11px] text-gray-400 group-hover:text-gray-600 transition-colors">
                                          点击预览
                                        </span>
                                      )}

                                      <div className="flex items-center gap-2 text-gray-500">
                                        <button
                                          type="button"
                                          onClick={e => {
                                            e.stopPropagation();
                                            handleDuplicateTemplate(item);
                                          }}
                                          className="hover:text-[#1E5ABB] flex items-center gap-0.5 text-[11px] cursor-pointer"
                                          title="复制并生成新模板"
                                        >
                                          <Copy className="w-3 h-3" />
                                          <span>复制</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={e => {
                                            e.stopPropagation();
                                            openEditTemplatePage(item);
                                          }}
                                          className="hover:text-[#1E5ABB] flex items-center gap-0.5 text-[11px] cursor-pointer"
                                          title={item.isDefault ? '查看详情' : '编辑模板'}
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                          <span>{item.isDefault ? '详情' : '编辑'}</span>
                                        </button>
                                        {!item.isDefault && (
                                          <button
                                            type="button"
                                            onClick={e => {
                                              e.stopPropagation();
                                              handleDelete(item);
                                            }}
                                            className="hover:text-rose-600 p-0.5 cursor-pointer"
                                            title="删除模板"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Resize handle: left | center */}
                          {activeSelectedTemplate && (
                            <div
                              role="separator"
                              aria-orientation="vertical"
                              aria-label="调整模板目录宽度"
                              title="拖动调整宽度"
                              onPointerDown={e => {
                                e.preventDefault();
                                setResizingSide('left');
                              }}
                              className={`hidden lg:flex w-1.5 shrink-0 cursor-col-resize items-center justify-center border-x border-gray-200/80 bg-gray-50 hover:bg-blue-50 transition-colors ${
                                resizingSide === 'left' ? 'bg-blue-100' : ''
                              }`}
                            >
                              <span className="w-px h-8 rounded-full bg-gray-300" />
                            </div>
                          )}

                          {/* Right Detail & Simulation Column: Synchronized Preview Studio */}
                          {activeSelectedTemplate && (
                            <div className="flex-1 min-w-0 flex flex-col min-h-0 bg-white lg:min-w-[320px]">
                              {/* Preview Header & Edit Entry */}
                              <div className="h-12 px-4 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between gap-2.5 shrink-0 whitespace-nowrap">
                                <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                                  <span className="text-xs text-gray-500 font-medium shrink-0">当前预览:</span>
                                  <span className="text-xs font-bold text-gray-900 truncate max-w-[140px] sm:max-w-[200px] md:max-w-[260px]" title={activeSelectedTemplate.name}>
                                    {activeSelectedTemplate.name}
                                  </span>
                                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border shrink-0 ${
                                    activeSelectedTemplate.status === '启用'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-gray-100 text-gray-500 border-gray-200'
                                  }`}>
                                    {activeSelectedTemplate.status}
                                  </span>
                                  {activeSelectedTemplate.isDefault && (
                                    <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 border border-gray-200 font-bold rounded shrink-0">
                                      系统默认
                                    </span>
                                  )}
                                </div>

                                {/* Action Buttons: Edit into Detail Page */}
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => openEditTemplatePage(activeSelectedTemplate)}
                                    className="px-3 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold rounded shadow-2xs flex items-center gap-1 cursor-pointer transition-colors shrink-0 whitespace-nowrap"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 shrink-0" />
                                    <span>编辑</span>
                                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                                  </button>
                                </div>
                              </div>

                              {/* Simulation Stage Canvas matching Add/Edit Detail Page Style */}
                              <div className="bg-gray-50/80 rounded-lg border border-gray-200/80 p-4 space-y-3 m-4 flex flex-col items-center flex-1 overflow-y-auto">
                                {/* Preview Toolbar: Left and Right Aligned */}
                                <div className="w-full flex items-center justify-between text-xs pb-1">
                                  <div className="inline-flex items-center gap-1.5 font-bold text-xs text-gray-800">
                                    <Smartphone className="w-3.5 h-3.5 text-[#1E5ABB]" />
                                    <span>移动端填报实时模拟</span>
                                  </div>
                                  <div className="text-xs text-gray-500 font-medium">
                                    共 {(activeSelectedTemplate.fields || []).length} 个表单项 · 可直接体验输入
                                  </div>
                                </div>

                                {/* 375px Width Preview Container matching detail page */}
                                <div className="w-[375px] max-w-full bg-white rounded-lg p-3.5 border border-gray-200/70 shadow-2xs">
                                  {renderUserReportPreview(
                                    activeSelectedTemplate.fields || [],
                                    '当前模板暂未配置表单字段，请点击右上角“编辑”添加',
                                    activeSelectedTemplate.templateType || '报送',
                                    'full',
                                    activeSelectedTemplate.name
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Resize handle: center | right */}
                          {activeSelectedTemplate && (
                            <div
                              role="separator"
                              aria-orientation="vertical"
                              aria-label="调整其他业务配置宽度"
                              title="拖动调整宽度"
                              onPointerDown={e => {
                                e.preventDefault();
                                setResizingSide('right');
                              }}
                              className={`hidden lg:flex w-1.5 shrink-0 cursor-col-resize items-center justify-center border-x border-gray-200/80 bg-gray-50 hover:bg-blue-50 transition-colors ${
                                resizingSide === 'right' ? 'bg-blue-100' : ''
                              }`}
                            >
                              <span className="w-px h-8 rounded-full bg-gray-300" />
                            </div>
                          )}

                          {/* Right Column: Other configurations for this template (Scoring rule & Audit flow associations only) */}
                          {activeSelectedTemplate && (
                            <div className="tpl-board-col-right w-full shrink-0 border-t lg:border-t-0 flex flex-col min-h-0 bg-white">
                              <TemplateOtherConfigPanel
                                template={activeSelectedTemplate}
                                scoreRules={dataStore.audit_score || []}
                                auditFlows={dataStore.audit_flow || []}
                                onSave={(updatedConfig) => {
                                  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
                                  setDataStore(prev => ({
                                    ...prev,
                                    report_template: (prev.report_template || []).map(item => {
                                      if (item.id === activeSelectedTemplate.id) {
                                        return {
                                          ...item,
                                          ...updatedConfig,
                                          updateTime: nowStr
                                        };
                                      }
                                      return item;
                                    })
                                  }));
                                  showConfigToast(
                                    activeSelectedTemplate.templateType === '激活'
                                      ? `已成功保存激活模板「${activeSelectedTemplate.name}」的验证与人员角色配置`
                                      : `已成功保存模板「${activeSelectedTemplate.name}」的打分与流程关联`
                                  );
                                }}
                                onNavigateToModule={(moduleId) => setActiveModule(moduleId)}
                              />
                            </div>
                          )}
                      </div>
                    );
                  })()}
                </div>
              )
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
              <div className="space-y-3">
                {filteredList.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs bg-white rounded-lg border border-gray-100">
                    暂无相关审核流程配置
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredList.map(item => {
                      const isSelected = selectedAuditFlowId === item.id;
                      const isEnabled = item.status === '启用';

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedAuditFlowId(item.id)}
                          className={`rounded-xl border transition-all flex flex-col justify-between overflow-hidden bg-white ${
                            isSelected
                              ? 'border-[#1E5ABB] ring-2 ring-[#1E5ABB]/20 shadow-sm'
                              : isEnabled
                                ? 'border-blue-200/90 shadow-2xs hover:shadow-md hover:border-blue-300'
                                : 'border-gray-200/80 shadow-2xs hover:shadow-md hover:border-gray-300'
                          }`}
                        >
                          <div className="p-4 space-y-3 min-w-0">
                            {/* Top Title + Badge + Status Toggle */}
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                                <h3 className="font-bold text-sm text-gray-900 truncate" title={item.name.replace(/【默认推荐】/g, '').replace(/默认推荐/g, '').trim()}>
                                  {item.name.replace(/【默认推荐】/g, '').replace(/默认推荐/g, '').trim()}
                                </h3>
                                {item.isDefault ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-500 font-medium rounded border border-gray-200 shrink-0 whitespace-nowrap">
                                    <Lock className="w-3 h-3 text-gray-400" />
                                    系统默认
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-blue-50 text-[#1E5ABB] font-medium rounded border border-blue-200 shrink-0 whitespace-nowrap">
                                    <Sparkles className="w-3 h-3 text-[#1E5ABB]" />
                                    自定义
                                  </span>
                                )}
                              </div>

                              <div className="shrink-0">
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleToggleStatus(item.id);
                                  }}
                                  className={`flex items-center gap-1.5 py-1 rounded-full cursor-pointer transition-colors shadow-2xs ${
                                    isEnabled
                                      ? 'pl-2.5 pr-1 bg-[#1E5ABB] text-white'
                                      : 'pl-1 pr-2.5 bg-gray-200 text-gray-500'
                                  }`}
                                  title={isEnabled ? '点击禁用' : '点击启用'}
                                >
                                  {isEnabled ? (
                                    <>
                                      <span className="text-xs font-bold whitespace-nowrap">启用</span>
                                      <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm shrink-0" />
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm shrink-0" />
                                      <span className="text-xs font-bold whitespace-nowrap">禁用</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Tags & Meta */}
                            <div className="flex items-center justify-between gap-2 text-xs pt-0.5 min-w-0 overflow-hidden">
                              <div className="flex items-center gap-2 shrink min-w-0 overflow-hidden">
                                {item.auditFlowMode === 'max_n_steps' ? (
                                  <span className="px-2 py-0.5 text-xs font-medium rounded border border-amber-300 text-amber-600 bg-amber-50/50 shrink-0 whitespace-nowrap">
                                    最多{item.maxIntermediateNodes || 3}级
                                  </span>
                                ) : item.auditFlowMode === 'direct_headquarters' ? (
                                  <span className="px-2 py-0.5 text-xs font-medium rounded border border-purple-300 text-purple-600 bg-purple-50/50 shrink-0 whitespace-nowrap">
                                    直达总机构
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 text-xs font-medium rounded border border-blue-300 text-[#1E5ABB] bg-blue-50/50 shrink-0 whitespace-nowrap">
                                    逐级审核
                                  </span>
                                )}
                                <span className="px-2 py-0.5 text-xs text-gray-600 bg-gray-100/80 rounded border border-gray-200 shrink-0 whitespace-nowrap">
                                  {(item.auditNodes || []).length || (item.auditFlowMode === 'direct_headquarters' ? 2 : 3)} 级审核节点
                                </span>
                              </div>
                              <span className="text-xs text-gray-400 font-mono shrink-0 ml-auto whitespace-nowrap">{item.updateTime}</span>
                            </div>

                            {/* Description Box: Single line truncated */}
                            <div className="rounded-lg bg-gray-50/80 border border-gray-100 px-3 py-2 text-xs text-gray-600">
                              <p className="truncate text-gray-600" title={(item.description || '按节点顺序完成通过、驳回和退回修改').replace(/【默认推荐】/g, '').replace(/默认推荐/g, '').trim()}>
                                {(item.description || '按节点顺序完成通过、驳回和退回修改').replace(/【默认推荐】/g, '').replace(/默认推荐/g, '').trim()}
                              </p>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                openPreviewItem(item);
                              }}
                              className="text-xs text-gray-500 hover:text-[#1E5ABB] flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap truncate"
                            >
                              <Eye className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate">查看流程节点设计 →</span>
                            </button>

                            <div className="flex items-center gap-2 shrink-0">
                              {item.isDefault ? (
                                <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                                  <Lock className="w-3.5 h-3.5 shrink-0" />
                                  <span>内置</span>
                                </div>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      openEditModal(item);
                                    }}
                                    className="p-1 text-gray-400 hover:text-[#1E5ABB] rounded cursor-pointer transition-colors"
                                    title="编辑"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleDelete(item);
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-600 rounded cursor-pointer transition-colors"
                                    title="删除"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : activeModule === 'value_added' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredList.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-gray-400 text-xs bg-white rounded-lg border border-gray-100">
                    暂无相关增值业务模块数据
                  </div>
                ) : (
                  filteredList.map(item => {
                    const isActivated = item.activatedStatus === '已开通';
                    const isEnabled = isActivated && item.status === '启用';
                    const isDisabled = isActivated && item.status === '停用';

                    const IconComp = item.name.includes('首发') || item.name.includes('重复') || item.dictCode === 'VA_FIRST_DUPLICATE_IDENTIFY'
                      ? Layers
                      : item.name.includes('批量')
                      ? CheckSquare
                      : item.name.includes('截图') || item.name.includes('取证')
                      ? Paperclip
                      : item.name.includes('指令')
                      ? GitBranch
                      : item.name.includes('公告')
                      ? Info
                      : Sparkles;

                    let cardClass = '';
                    if (isEnabled) {
                      cardClass = 'bg-white border-gray-200/80 hover:shadow-md hover:border-amber-300';
                    } else if (!isActivated) {
                      cardClass = 'bg-white border-gray-200/90 hover:shadow-sm hover:border-amber-200/60';
                    } else {
                      // 已开通但停用（禁用）：深度置灰，不透明度设为95%
                      cardClass = 'bg-slate-100/90 border-slate-300/80 opacity-95 grayscale-[75%]';
                    }

                    return (
                      <div
                        key={item.id}
                        className={`border rounded-xl p-5 transition-all flex flex-col justify-between space-y-3 relative overflow-hidden group ${cardClass}`}
                      >
                        {/* Decorative subtle background tint */}
                        <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />

                        <div className="space-y-3">
                          {/* Header: Product Name & Direct Top-Right Control */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center space-x-3">
                              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${
                                isEnabled || !isActivated
                                  ? 'bg-[#FFFDF5] border-[#FDE68A]'
                                  : 'bg-gray-200 border-gray-300'
                              }`}>
                                <IconComp className={`w-5 h-5 ${isEnabled || !isActivated ? 'text-amber-600' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <h3 className={`font-bold text-sm flex items-center space-x-2 ${
                                  isEnabled || !isActivated ? 'text-gray-900 group-hover:text-[#1E5ABB]' : 'text-gray-500'
                                }`}>
                                  <span>{item.name}</span>
                                </h3>
                              </div>
                            </div>

                            {/* Enable / Disable Toggle Switch in Top Right */}
                            {isActivated ? (
                              <button
                                onClick={() => handleToggleStatus(item.id)}
                                title={item.status === '启用' ? '点击停用该增值业务' : '点击启用该增值业务'}
                                className="cursor-pointer focus:outline-none flex items-center space-x-2 bg-white/90 hover:bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-2xs shrink-0 transition-all hover:scale-102"
                              >
                                <div
                                  className={`w-7 h-3.5 flex items-center rounded-full p-0.5 transition-colors ${
                                    item.status === '启用' ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'
                                  }`}
                                >
                                  <div className="w-2.5 h-2.5 bg-white rounded-full shadow-2xs"></div>
                                </div>
                                <span className={`text-[11px] font-bold ${item.status === '启用' ? 'text-emerald-700' : 'text-gray-500'}`}>
                                  {item.status === '启用' ? '已启用' : '已停用'}
                                </span>
                              </button>
                            ) : (
                              <div
                                className="flex items-center space-x-1.5 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 text-[11px] font-medium cursor-not-allowed shrink-0"
                                title="未开通业务不可进行启禁操作"
                              >
                                <Lock className="w-3 h-3 text-gray-400" />
                                <span>未开通 (不可启禁)</span>
                              </div>
                            )}
                          </div>

                          {/* Product Function Introduction */}
                          <div className="space-y-1.5 pt-1">
                            <div className="text-[11px] font-bold text-gray-700 flex items-center space-x-1">
                              <FileText className={`w-3.5 h-3.5 ${isEnabled || !isActivated ? 'text-amber-600' : 'text-gray-400'}`} />
                              <span>产品功能介绍</span>
                            </div>
                            <p className={`text-xs leading-relaxed p-3 rounded-lg border font-sans ${
                              isEnabled || !isActivated ? 'bg-slate-50/80 text-gray-700 border-slate-200/60' : 'bg-gray-200/50 text-gray-500 border-gray-200'
                            }`}>
                              {item.description || '暂无产品功能介绍说明'}
                            </p>

                            {/* Contact Sales Notice - Only shown for non-activated products */}
                            {!isActivated && (
                              <div className="mt-2 text-[11px] text-amber-800 font-medium flex items-center space-x-1.5 bg-amber-50/90 px-3 py-1.5 rounded-md border border-amber-200/80">
                                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>如需开通请联系对应的销售人员</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
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

                                {item.isDefault ? (
                                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 font-bold rounded border border-gray-200 shrink-0">
                                    <Lock className="w-2.5 h-2.5 text-gray-400" />
                                    <span>系统默认</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200 shrink-0">
                                    <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                    <span>自定义</span>
                                  </span>
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
      </section>
    </div>


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
                        {selectedAuditFlow.name.replace(/【默认推荐】/g, '').replace(/默认推荐/g, '').trim()}
                      </div>
                      {selectedAuditFlow.isDefault ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 font-bold rounded border border-gray-200 shrink-0 whitespace-nowrap">
                          <Lock className="w-2.5 h-2.5 text-gray-400" />
                          <span>系统默认</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200 shrink-0 whitespace-nowrap">
                          <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                          <span>自定义</span>
                        </span>
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
                        {(selectedAuditFlow.description || '暂无说明描述').replace(/【默认推荐】/g, '').replace(/默认推荐/g, '').trim()}
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
                      disabled={selectedAuditFlow.isDefault}
                      onClick={() => {
                        const item = selectedAuditFlow;
                        setSelectedAuditFlowId(null);
                        openEditModal(item);
                      }}
                      className={selectedAuditFlow.isDefault
                        ? 'inline-flex items-center gap-1 px-3 py-1.5 text-xs text-gray-300 bg-gray-50 border border-gray-200 cursor-not-allowed rounded'
                        : 'inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[#1E5ABB] border border-blue-200 hover:bg-blue-50 rounded cursor-pointer'}
                      title={selectedAuditFlow.isDefault ? '系统默认流程仅支持查看' : '编辑审核流程'}
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
                  {auditFlowPreviewItem.isDefault ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 font-bold rounded border border-gray-200 shrink-0 whitespace-nowrap">
                      <Lock className="w-2.5 h-2.5 text-gray-400" />
                      <span>系统默认</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200 shrink-0 whitespace-nowrap">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                      <span>自定义</span>
                    </span>
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
                {activeModule === 'audit_score' ? '审核打分规则详情' : activeModule === 'stats_metric' ? '指标详情' : activeModule === 'data_dict' ? '数据字典详情' : '配置详情'}{activeModule === 'audit_score' ? '' : ` - ${previewItem.name}`}
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

              {activeModule !== 'report_template' && activeModule !== 'stats_metric' && activeModule !== 'data_dict' && activeModule !== 'audit_score' && (
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

              {activeModule !== 'report_template' && activeModule !== 'stats_metric' && activeModule !== 'data_dict' && activeModule !== 'audit_score' && (
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

              {activeModule !== 'report_template' && activeModule !== 'stats_metric' && activeModule !== 'data_dict' && activeModule !== 'audit_score' && (
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
              {activeModule === 'audit_score' ? (
                <button
                  type="button"
                  disabled={previewItem.isDefault}
                  onClick={() => {
                    const item = previewItem;
                    setPreviewItem(null);
                    openEditModal(item);
                  }}
                  className={previewItem.isDefault
                    ? 'inline-flex items-center gap-1 px-3 py-1.5 text-xs text-gray-300 bg-gray-50 border border-gray-200 cursor-not-allowed rounded'
                    : 'inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[#1E5ABB] border border-blue-200 hover:bg-blue-50 rounded cursor-pointer'}
                  title={previewItem.isDefault ? '系统默认规则仅支持查看' : '编辑审核打分规则'}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>编辑</span>
                </button>
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
                  {editingItem ? `编辑${currentModuleLabel}` : `新增${currentModuleLabel}`}
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
              ) : activeModule === 'audit_flow' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">审核流程名称 *</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        placeholder="请输入审核流程规则名称..."
                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                      />
                    </div>

                    {renderFormStatusSegment('启用状态 *')}

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">说明描述</label>
                      <input
                        type="text"
                        value={formDesc}
                        onChange={e => setFormDesc(e.target.value)}
                        placeholder="请输入适用场景与责任主体说明..."
                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                      />
                    </div>
                  </div>

                  {/* 审核流程核心模式选择器（精简三模式卡片） */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Workflow className="w-4 h-4 text-[#1E5ABB]" />
                        <span className="font-bold text-gray-800 text-xs">审核流程模式 *</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#1E5ABB] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        当前选中：{formAuditFlowMode === 'step_by_step' ? '逐级审核' : formAuditFlowMode === 'max_n_steps' ? `最多${formMaxIntermediateNodes}级审核` : '直接总机构审核'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {[
                        {
                          id: 'step_by_step' as const,
                          title: '模式一：逐级审核',
                          badge: '推荐',
                          badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          desc: '沿组织树逐级向上传递复核，最终由总机构终审并评分（自适应组织深度）。'
                        },
                        {
                          id: 'max_n_steps' as const,
                          title: '模式二：最多N级审核',
                          badge: '上限截断',
                          badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200',
                          desc: `下级提报后至多经过 ${formMaxIntermediateNodes} 级中间机构审核，超出部分直接穿透至总机构。`
                        },
                        {
                          id: 'direct_headquarters' as const,
                          title: '模式三：直接总机构审核',
                          badge: '极速直达',
                          badgeStyle: 'bg-purple-50 text-purple-700 border-purple-200',
                          desc: '跳过所有下级中间机构，提报后直接由总机构管理员终审并评分结案。'
                        }
                      ].map(modeOpt => {
                        const isSelected = formAuditFlowMode === modeOpt.id;
                        return (
                          <div
                            key={modeOpt.id}
                            onClick={() => handleSwitchAuditFlowMode(modeOpt.id)}
                            className={`rounded-lg border p-3 cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'border-[#1E5ABB] bg-blue-50/50 shadow-2xs ring-1 ring-[#1E5ABB]'
                                : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={`text-xs font-bold ${isSelected ? 'text-[#1E5ABB]' : 'text-gray-800'}`}>
                                {modeOpt.title}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${modeOpt.badgeStyle}`}>
                                {modeOpt.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                              {modeOpt.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* 最多N级模式下的档位微调 */}
                    {formAuditFlowMode === 'max_n_steps' && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-xs">
                        <div className="flex items-center space-x-2">
                          <Sliders className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span className="font-bold text-amber-900">中间机构审核上限：</span>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map(cnt => (
                              <button
                                key={cnt}
                                type="button"
                                onClick={() => handleMaxIntermediateNodesChange(cnt)}
                                className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer transition-colors ${
                                  formMaxIntermediateNodes === cnt
                                    ? 'bg-amber-600 text-white shadow-2xs'
                                    : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-100'
                                }`}
                              >
                                {cnt} 级
                              </button>
                            ))}
                          </div>
                        </div>
                        <span className="text-[11px] text-amber-700 hidden sm:inline">
                          （不足 {formMaxIntermediateNodes} 级时按实际层级流转，超出则直达总机构）
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
                          <div key={lvl.id} className="bg-white p-2.5 rounded-md border border-gray-200 shadow-2xs grid grid-cols-1 sm:grid-cols-[42px_130px_90px_1fr_28px] items-center gap-2">
                            <div className="flex items-center gap-1 text-gray-400 font-mono text-[11px]">
                              <GripVertical className="w-3.5 h-3.5 text-gray-300" />
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

              {/* Audit Flow Builder */}
              {activeModule === 'audit_flow' && (() => {
                const selectedIndex = Math.max(
                  0,
                  formAuditNodes.findIndex(node => node.id === selectedAuditNodeId)
                );
                const selectedNode = formAuditNodes[selectedIndex] || formAuditNodes[0];
                return (
                  <div className="space-y-4 pt-3 border-t border-gray-200">
                    {/* 节点配置与流转主区域：左右平衡响应式双列布局 (50% : 50%) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                      {/* 左侧：节点链可视化 (6列) */}
                      <div className="lg:col-span-6 min-w-0 bg-gray-50/80 p-3.5 rounded-xl border border-gray-200 space-y-3 flex flex-col">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center space-x-2">
                            <GitBranch className="w-4 h-4 text-[#1E5ABB]" />
                            <span className="font-bold text-gray-800 text-xs">
                              审核节点流转链（共 {formAuditNodes.length} 个阶段）
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-400">
                            点击节点在右侧编辑
                          </span>
                        </div>

                        {/* 节点卡片流转网格 */}
                        <div className="w-full min-w-0 bg-white rounded-xl border border-gray-200/80 p-3 shadow-2xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                            {formAuditNodes.map((node, index) => {
                              const isSelected = selectedNode?.id === node.id;
                              const isFinalNode = Boolean(node.isUnifiedFinalNode || index === formAuditNodes.length - 1);
                              return (
                                <div
                                  key={node.id || index}
                                  draggable={!isFinalNode}
                                  onDragStart={e => e.dataTransfer.setData('text/plain', String(index))}
                                  onDragOver={e => e.preventDefault()}
                                  onDrop={e => {
                                    e.preventDefault();
                                    handleDragAuditNode(Number(e.dataTransfer.getData('text/plain')), index);
                                  }}
                                  onClick={() => setSelectedAuditNodeId(node.id)}
                                  className={`relative p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between min-h-[148px] ${
                                    isFinalNode
                                      ? isSelected
                                        ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50/60 shadow-xs ring-2 ring-amber-400/30'
                                        : 'border-amber-300 bg-gradient-to-br from-amber-50/40 to-yellow-50/20 hover:border-amber-400'
                                      : isSelected
                                      ? 'border-[#1E5ABB] bg-blue-50/70 shadow-xs ring-2 ring-[#1E5ABB]/20'
                                      : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-gray-50/80'
                                  }`}
                                >
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-1.5">
                                      <div className="flex items-center space-x-1.5">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                          isFinalNode
                                            ? 'bg-amber-500 text-white'
                                            : isSelected
                                            ? 'bg-[#1E5ABB] text-white'
                                            : 'bg-gray-100 text-gray-700'
                                        }`}>
                                          {index + 1}
                                        </span>
                                        {isFinalNode ? (
                                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-0.5">
                                            <Award className="w-2.5 h-2.5" />
                                            终审评分
                                          </span>
                                        ) : (
                                          <span className="text-[10px] text-gray-500 font-medium">
                                            第 {index + 1} 阶段
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        {!isFinalNode ? (
                                          <span
                                            className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-50 text-[#1E5ABB] border border-blue-200"
                                            title={`流向第 ${index + 2} 阶段：${formAuditNodes[index + 1]?.nodeName || '下级审核'}`}
                                          >
                                            <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                            终点
                                          </span>
                                        )}

                                        <span
                                          title="流程模式标准节点已固定"
                                          className={`p-0.5 flex items-center justify-center ${
                                            isFinalNode ? 'text-amber-500/80' : 'text-gray-400'
                                          }`}
                                        >
                                          <Lock className="w-3 h-3" />
                                        </span>
                                      </div>
                                    </div>

                                    <div>
                                      <div className="font-bold text-gray-900 text-xs truncate">
                                        {node.nodeName}
                                      </div>
                                      <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                                        {getAuditAssigneeSourceLabel(node.assigneeSource)}
                                      </div>
                                    </div>

                                    <div className={`text-[10px] p-1.5 rounded border leading-tight ${
                                      isFinalNode
                                        ? 'bg-amber-100/50 border-amber-200/80 text-amber-900 font-bold'
                                        : 'bg-gray-50 border-gray-100 text-gray-600'
                                    }`}>
                                      {node.assigneeSource === 'org_owner'
                                        ? '归属机构负责人'
                                        : node.assigneeSource === 'user'
                                        ? node.assigneeUserName || node.approverRole
                                        : node.approverRole}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                                    {node.enableTimeout !== false && (node.timeLimitMinutes ?? 0) > 0 ? (
                                      <span className="text-[10px] text-blue-600 font-mono flex items-center gap-1 font-medium" title={`超时提醒时限：${node.timeLimitMinutes}分钟`}>
                                        <Clock className="w-2.5 h-2.5 text-blue-600" />
                                        {node.timeLimitMinutes >= 60 && node.timeLimitMinutes % 60 === 0
                                          ? `${node.timeLimitMinutes / 60}小时`
                                          : `${node.timeLimitMinutes}分`}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-gray-400 flex items-center gap-1" title="未开启超时提醒">
                                        <Clock className="w-2.5 h-2.5 text-gray-300" />
                                        无提醒
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* 右侧：选中节点属性面板 (6列，宽敞紧凑) */}
                      <div className="lg:col-span-6 min-w-0 bg-white p-3.5 rounded-xl border border-gray-200 space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                          <span className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-[#1E5ABB]" />
                            <span>节点属性编辑（第 {selectedIndex + 1} 阶段：{selectedNode?.nodeName}）</span>
                          </span>
                          {selectedNode && (
                            <span className="text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 font-medium flex items-center gap-1" title="流程模式标准节点已固定，不可删除">
                              <Lock className="w-2.5 h-2.5 text-gray-400" />
                              <span>流程固定节点</span>
                            </span>
                          )}
                        </div>

                        {selectedNode ? (
                          <div className="space-y-3">
                            {(selectedNode.isUnifiedFinalNode || selectedIndex === formAuditNodes.length - 1) && (
                              <div className="p-2 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>总机构终审通过并完成评分后结案入库</span>
                              </div>
                            )}

                            {/* Row 1: 节点名称 & 处理人来源 (双列并排) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] text-gray-600 font-medium mb-1">节点名称 *</label>
                                <input
                                  type="text"
                                  required
                                  value={selectedNode.nodeName}
                                  onChange={e => handleUpdateAuditNode(selectedIndex, { nodeName: e.target.value })}
                                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] font-medium"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] text-gray-600 font-medium mb-1">处理人来源 *</label>
                                <select
                                  value={selectedNode.assigneeSource || 'role'}
                                  onChange={e => {
                                    const source = e.target.value as AuditNode['assigneeSource'];
                                    handleUpdateAuditNode(selectedIndex, {
                                      assigneeSource: source,
                                      approverRole: source === 'org_owner' ? '归属机构负责人' : selectedNode.approverRole
                                    });
                                  }}
                                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                                >
                                  {auditAssigneeSourceOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Row 2: 处理人角色/指定人 & 退回规则 (双列并排) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {selectedNode.assigneeSource === 'user' ? (
                                <div>
                                  <label className="block text-[11px] text-gray-600 font-medium mb-1">指定人员 *</label>
                                  <select
                                    value={selectedNode.assigneeUserName || ''}
                                    onChange={e => handleUpdateAuditNode(selectedIndex, { assigneeUserName: e.target.value, approverRole: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                                  >
                                    <option value="">请选择人员</option>
                                    {auditUserOptions.map(user => (
                                      <option key={user} value={user}>{user}</option>
                                    ))}
                                  </select>
                                </div>
                              ) : selectedNode.assigneeSource === 'org_owner' ? (
                                <div>
                                  <label className="block text-[11px] text-gray-600 font-medium mb-1">动态处理机制</label>
                                  <div className="px-2.5 py-1.5 rounded-lg border border-emerald-100 bg-emerald-50/50 text-[11px] text-emerald-800 flex items-center h-[34px]">
                                    动态匹配归属机构负责人
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <label className="block text-[11px] text-gray-600 font-medium mb-1">处理角色 *</label>
                                  <select
                                    value={selectedNode.approverRole}
                                    onChange={e => handleUpdateAuditNode(selectedIndex, { approverRole: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                                  >
                                    {auditRoleOptions.map(role => (
                                      <option key={role} value={role}>{role}</option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              <div>
                                <label className="block text-[11px] text-gray-600 font-medium mb-1">退回规则 *</label>
                                <select
                                  value={selectedNode.rejectStrategy || 'return_submitter'}
                                  onChange={e => handleUpdateAuditNode(selectedIndex, { rejectStrategy: e.target.value as AuditNode['rejectStrategy'] })}
                                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                                >
                                  <option value="return_submitter">退回上报人修改</option>
                                  <option value="return_previous">退回上一节点</option>
                                </select>
                              </div>
                            </div>

                            {/* Row 3: 无负责人处理规则 (紧凑双列结构) */}
                            <div className="rounded-lg border border-amber-200/80 bg-amber-50/30 p-2.5 space-y-2">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
                                <div>
                                  <label className="block text-[11px] text-amber-900 font-bold mb-1">无负责人处理规则</label>
                                  <select
                                    value={selectedNode.ownerMissingStrategy || formOwnerMissingStrategy}
                                    onChange={e => {
                                      const strat = e.target.value as AuditOwnerMissingStrategy;
                                      handleUpdateAuditNode(selectedIndex, { ownerMissingStrategy: strat });
                                      setFormOwnerMissingStrategy(strat);
                                    }}
                                    className="w-full px-2.5 py-1.5 border border-amber-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                                  >
                                    {ownerMissingStrategyOptions.map(option => (
                                      <option key={option.id} value={option.id}>{option.label}</option>
                                    ))}
                                  </select>
                                </div>

                                {(selectedNode.ownerMissingStrategy || formOwnerMissingStrategy) === 'fallback_role' && (
                                  <div>
                                    <label className="block text-[11px] text-gray-700 font-medium mb-1">指定兜底角色 *</label>
                                    <select
                                      value={selectedNode.ownerMissingFallbackRole || formOwnerMissingFallbackRole}
                                      onChange={e => {
                                        const role = e.target.value;
                                        handleUpdateAuditNode(selectedIndex, { ownerMissingFallbackRole: role });
                                        setFormOwnerMissingFallbackRole(role);
                                      }}
                                      className="w-full px-2.5 py-1.5 border border-amber-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                                    >
                                      {auditRoleOptions.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                      ))}
                                    </select>
                                  </div>
                                )}

                                {(selectedNode.ownerMissingStrategy || formOwnerMissingStrategy) === 'fallback_user' && (
                                  <div>
                                    <label className="block text-[11px] text-gray-700 font-medium mb-1">指定兜底人员 *</label>
                                    <select
                                      value={selectedNode.ownerMissingFallbackUserName || formOwnerMissingFallbackUserName}
                                      onChange={e => {
                                        const user = e.target.value;
                                        handleUpdateAuditNode(selectedIndex, { ownerMissingFallbackUserName: user });
                                        setFormOwnerMissingFallbackUserName(user);
                                      }}
                                      className="w-full px-2.5 py-1.5 border border-amber-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                                    >
                                      <option value="">请选择人员</option>
                                      {auditUserOptions.map(user => (
                                        <option key={user} value={user}>{user}</option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 leading-tight">
                                {ownerMissingStrategyOptions.find(option => option.id === (selectedNode.ownerMissingStrategy || formOwnerMissingStrategy))?.description}
                              </p>
                            </div>

                            {/* Row 4: 审核超时提醒开关与配置 (水平紧凑排布) */}
                            <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-2.5 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Clock className={`w-3.5 h-3.5 ${selectedNode.enableTimeout !== false ? 'text-[#1E5ABB]' : 'text-gray-400'}`} />
                                  <span className="text-[11px] font-bold text-gray-800">审核超时提醒</span>
                                </div>
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={selectedNode.enableTimeout !== false}
                                  onClick={() => {
                                    const nextState = selectedNode.enableTimeout === false ? true : false;
                                    handleUpdateAuditNode(selectedIndex, {
                                      enableTimeout: nextState,
                                      timeLimitMinutes: nextState ? (selectedNode.timeLimitMinutes && selectedNode.timeLimitMinutes > 0 ? selectedNode.timeLimitMinutes : 15) : 0
                                    });
                                  }}
                                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    selectedNode.enableTimeout !== false ? 'bg-[#1E5ABB]' : 'bg-gray-300'
                                  }`}
                                  title={selectedNode.enableTimeout !== false ? '点击关闭超时提醒' : '点击开启超时配置'}
                                >
                                  <span
                                    aria-hidden="true"
                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                      selectedNode.enableTimeout !== false ? 'translate-x-4' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                              </div>

                              {selectedNode.enableTimeout !== false ? (
                                <div className="pt-2 border-t border-gray-200/80 space-y-1.5">
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center space-x-1">
                                      {[15, 30, 60, 120].map(mins => (
                                        <button
                                          key={mins}
                                          type="button"
                                          onClick={() => handleUpdateAuditNode(selectedIndex, { timeLimitMinutes: mins, enableTimeout: true })}
                                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                                            (selectedNode.timeLimitMinutes || 15) === mins
                                              ? 'bg-blue-100 text-[#1E5ABB] font-bold border border-blue-200'
                                              : 'text-gray-500 hover:text-gray-700 bg-white border border-gray-200'
                                          }`}
                                        >
                                          {mins === 60 ? '1小时' : mins === 120 ? '2小时' : `${mins}分`}
                                        </button>
                                      ))}
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        min="1"
                                        value={selectedNode.timeLimitMinutes || 15}
                                        onChange={e => handleUpdateAuditNode(selectedIndex, { timeLimitMinutes: Math.max(1, Number(e.target.value) || 1), enableTimeout: true })}
                                        className="w-20 px-2 py-1 border border-gray-200 rounded text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] text-center"
                                        placeholder="分钟"
                                      />
                                      <span className="text-[11px] text-gray-500 shrink-0">分钟</span>
                                    </div>
                                  </div>
                                  <p className="text-[10px] text-gray-400 leading-tight">
                                    超过设定时限未处理将自动触发超时催办通知。
                                  </p>
                                </div>
                              ) : (
                                <div className="text-[11px] text-gray-400 bg-white p-1.5 rounded border border-gray-100">
                                  未开启超时提醒，审批不设时限。
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="py-10 text-center text-gray-400 text-xs">请选择一个节点</div>
                        )}
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
                        <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden">
                          {fieldAddNotice && (
                            <div className="absolute left-1/2 top-2 z-20 -translate-x-1/2 px-3 py-1.5 bg-gray-900/90 text-white rounded-md shadow-lg text-xs font-bold flex items-center gap-1.5 animate-in fade-in zoom-in-95 pointer-events-none">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                              <span>{fieldAddNotice}</span>
                            </div>
                          )}

                          <div className="px-3 py-2 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                            <span className="font-bold text-gray-800 text-xs">字段配置 ({formFields.length} 项)</span>
                            <button
                              type="button"
                              onClick={handleLoadStandardPreset}
                              className="px-2.5 py-1 text-xs font-bold text-[#1E5ABB] hover:text-white bg-blue-50 hover:bg-[#1E5ABB] border border-blue-200 hover:border-[#1E5ABB] rounded transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>使用标准模板预设</span>
                            </button>
                          </div>

                          {formFields.length === 0 ? (
                            <div className="p-8 text-center bg-gray-50 text-gray-400 space-y-3">
                              <Layers className="w-8 h-8 text-gray-300 mx-auto" />
                              <p className="text-xs">暂未添加字段，请点击下方“添加字段”或右上角“使用标准模板预设”。</p>
                              <div className="pt-2 flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleAddField('text')}
                                  className="w-full max-w-xs py-2 px-4 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>添加字段</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 space-y-2">
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
                                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] text-xs font-medium text-gray-800"
                                          />
                                        </div>

                                        <input
                                          type="text"
                                          value={field.placeholder || ''}
                                          onChange={e => handleUpdateField(index, { placeholder: e.target.value })}
                                          placeholder="给提报人员看的填写提示，例如：请简要说明事件经过"
                                          className="w-full px-2.5 py-1.5 text-xs bg-gray-50/60 border border-gray-200 rounded text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
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

                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={() => handleAddField('text')}
                                  className="w-full py-2.5 px-3 border-2 border-dashed border-[#1E5ABB]/30 hover:border-[#1E5ABB] bg-blue-50/40 hover:bg-blue-50/80 text-[#1E5ABB] hover:text-[#134092] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs group"
                                >
                                  <Plus className="w-4 h-4 transition-transform group-hover:scale-110 text-[#1E5ABB]" />
                                  <span>添加字段</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="block">
                        <div className="space-y-2">
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






