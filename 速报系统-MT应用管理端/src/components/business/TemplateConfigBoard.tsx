import React, { useState, useEffect, useRef } from 'react';
import { alertDialog, confirmDialog } from '../common/ConfirmDialog';
import { ControlNoticeTip } from './ControlNoticeTip';
import {
  FileText,
  Zap,
  Plus,
  Lock,
  Sparkles,
  Edit3,
  Trash2,
  Copy,
  ChevronRight,
  ArrowRight,
  Smartphone,
  Monitor,
  Check,
  Calendar as CalendarIcon,
  Paperclip,
  Link as LinkIcon,
  Hash,
  Type,
  ListFilter,
  UserCheck,
  User,
  Eye,
  RotateCcw,
  MoveHorizontal,
  Undo2,
  Save,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Shield,
  CreditCard,
  Phone,
  Info,
  Award,
  GitBranch,
  Wand2,
  ExternalLink,
  ChevronDown,
  ArrowUpDown,
  Clock,
  X,
  Layers,
  MoreHorizontal,
  Loader2,
  Camera,
  RefreshCw,
  AlertCircle,
  AlignLeft,
  CircleDot,
  CheckSquare,
  ListChecks,
  Square
} from 'lucide-react';

export type TemplateType = '报送' | '激活';
export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'file'
  | 'link'
  | 'select'
  | 'multi_select'
  | 'radio'
  | 'checkbox'
  | 'static_text'
  | 'identity'
  | 'phone'
  | 'gender'
  | 'id_card'
  | 'bank_card'
  | 'email'
  | 'address';

export interface TemplateFieldItem {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  /** 来自全局固定字段规则：true 锁定不可改，false 默认带入可改；未设置时按旧版固定字段判断 */
  locked?: boolean;
  /** 文本字段以多行输入框展示 */
  multiline?: boolean;
  /** 单行 / 多行文本的字数上限，未设置表示不限制 */
  maxLength?: number;
  /** PC 端手动指定的宽度，未设置时按字段类型自动排布；H5 端不受影响 */
  pcWidth?: PcFieldWidth;
}

export type PcFieldWidth = 'full' | 'half';

export const isAutoWideOnPc = (field: TemplateFieldItem) =>
  isLockedField(field) ||
  !!field.multiline ||
  ['file', 'identity', 'address', 'link', 'radio', 'checkbox', 'multi_select', 'static_text'].includes(field.type) ||
  (field.type === 'text' && /内容|摘要|简述|说明|情况|描述|详情/.test(field.name));

export const TEXT_MAX_LENGTH_DEFAULT = 20;
export const TEXTAREA_MAX_LENGTH_DEFAULT = 500;
export const TEXT_MAX_LENGTH_LIMIT = 5000;

export const defaultMaxLengthOf = (multiline?: boolean) =>
  multiline ? TEXTAREA_MAX_LENGTH_DEFAULT : TEXT_MAX_LENGTH_DEFAULT;

/** 单行 / 多行互切时，仍为原默认值的上限随之切换到新默认值，自定义值保留 */
export const switchMaxLength = (current: number | undefined, fromMultiline: boolean, toMultiline: boolean) =>
  current === defaultMaxLengthOf(fromMultiline) ? defaultMaxLengthOf(toMultiline) : current;

export const isValidMaxLength = (value?: number) =>
  value === undefined || (Number.isInteger(value) && value >= 1 && value <= TEXT_MAX_LENGTH_LIMIT);

export const parseMaxLengthInput = (raw: string): number | undefined => (raw.trim() === '' ? undefined : Number(raw));

/** 设计器中的字段控件：多行文本以 text + multiline 存储，兼容固定字段规则的「输入方式」 */
export type FieldControl = FieldType | 'textarea';

export const OPTION_FIELD_TYPES: FieldType[] = ['radio', 'checkbox', 'select', 'multi_select'];

export const fieldControlOf = (field: TemplateFieldItem): FieldControl =>
  field.type === 'text' && field.multiline ? 'textarea' : field.type;

export interface BusinessTemplateItem {
  id: string;
  name: string;
  templateType: TemplateType;
  isDefault: boolean;
  /** 平台全局设为标准模板后，全局与机构新增模板时可直接调用 */
  isPreset?: boolean;
  status: '启用' | '停用';
  updateTime: string;
  description: string;
  fields: TemplateFieldItem[];
  // Other business rules attached to template
  scoreRuleId?: string;
  scoreTiming?: '初审打分' | '终审打分';
  includeInEvaluation?: boolean;
  auditFlowId?: string;
  // Verification options for activation
  verificationOptions?: {
    phoneVerify: boolean;
    idCardVerify: boolean;
    bankCardVerify: boolean;
  };
  adaptedRoles?: string[];
}

interface TemplateConfigBoardProps {
  institutionId?: number | string | null;
  isGlobalScope?: boolean;
  onSaveNotice?: (msg: string) => void;
  onNavigateToWorkflow?: () => void;
  onNavigateToScoring?: () => void;
  titleMode?: 'card' | 'plain' | 'hidden';
  titleExtra?: React.ReactNode;
}

export interface ScoringRuleOptionItem {
  id: string;
  name: string;
  maxScore: number;
  grades: { name: string; score: number }[];
}

export const SCORING_RULE_OPTIONS: ScoringRuleOptionItem[] = [
  {
    id: 'sr_100_standard',
    name: '标准五级百分制打分规则组',
    maxScore: 100,
    grades: [
      { name: '一等', score: 100 },
      { name: '二等', score: 90 },
      { name: '三等', score: 80 },
      { name: '四等', score: 70 },
      { name: '五等', score: 60 }
    ]
  },
  {
    id: 'sr_30_simple',
    name: '三级简易打分规则组',
    maxScore: 30,
    grades: [
      { name: '一等（采用）', score: 30 },
      { name: '二等（存留）', score: 20 },
      { name: '三等（参考）', score: 10 }
    ]
  },
  {
    id: 'sr_custom_score',
    name: '自定义加减分评价规则组',
    maxScore: 100,
    grades: [
      { name: '重特大正面', score: 100 },
      { name: '常规正面', score: 80 },
      { name: '一般动态', score: 60 },
      { name: '瑕疵需整改', score: 30 }
    ]
  }
];

export interface AuditFlowNodePreview {
  order: number;
  name: string;
  role: string;
  duration: string;
}

export interface AuditFlowOptionItem {
  id: string;
  name: string;
  depth: number;
  fallbackText: string;
  applyScopeText: string;
  nodes: AuditFlowNodePreview[];
}

export const AUDIT_FLOW_PRESET_OPTIONS: AuditFlowOptionItem[] = [
  {
    id: 'flow_adaptive_tree_3',
    name: '逐级审核流程（组织树自适应）（3级）',
    depth: 3,
    fallbackText: '兜底: 直转上级',
    applyScopeText: '全辖机构适用',
    nodes: [
      { order: 1, name: '本级机构初审', role: '本级机构负责人', duration: '15m' },
      { order: 2, name: '上级机构逐级复核', role: '上级机构负责人', duration: '30m' },
      { order: 3, name: '总机构终审并评分', role: '总机构管理员', duration: '60m' }
    ]
  },
  {
    id: 'flow_max_3_fast',
    name: '最多3级快速审核流程（2级/3级）',
    depth: 3,
    fallbackText: '兜底: 越级送审',
    applyScopeText: '直报模板适用',
    nodes: [
      { order: 1, name: '本级机构初审', role: '本级机构负责人', duration: '15m' },
      { order: 2, name: '中继机构复核（至多3级）', role: '归属机构负责人', duration: '20m' },
      { order: 3, name: '总机构终审并评分', role: '总机构管理员', duration: '60m' }
    ]
  },
  {
    id: 'flow_direct_2_fast',
    name: '两级极速直签研判流程（2级）',
    depth: 2,
    fallbackText: '兜底: 超时默认签发',
    applyScopeText: '应急模板适用',
    nodes: [
      { order: 1, name: '应急初审与研判', role: '归属机构负责人', duration: '10m' },
      { order: 2, name: '总机构终审并评分', role: '总机构管理员', duration: '30m' }
    ]
  },
  {
    id: 'flow_multi_4_level',
    name: '四级跨层级全辖联审流程（4级）',
    depth: 4,
    fallbackText: '兜底: 联合会商转办',
    applyScopeText: '重点事件模板适用',
    nodes: [
      { order: 1, name: '本级机构初审', role: '本级机构负责人', duration: '15m' },
      { order: 2, name: '区县中心复核', role: '区县级网信负责人', duration: '30m' },
      { order: 3, name: '市级应急指挥中心初核', role: '市级值班负责人', duration: '45m' },
      { order: 4, name: '总机构终审并评分', role: '总机构管理员', duration: '60m' }
    ]
  }
];

// 报送模板固定字段：第 1 行锁定单行文本（必填不可改）、第 2 行锁定多行文本（必填可改）；名称 / 提示 / 字数可改，不可删除或排序
export const TITLE_FIELD_ID = 'fixed_event_title';
export const DETAIL_FIELD_ID = 'fixed_event_detail';

export const fixedReportFields: TemplateFieldItem[] = [
  {
    id: TITLE_FIELD_ID,
    name: '上报标题',
    type: 'text',
    required: true,
    placeholder: '请输入上报标题',
    maxLength: TEXT_MAX_LENGTH_DEFAULT,
    locked: true,
  },
  {
    id: DETAIL_FIELD_ID,
    name: '上报内容描述',
    type: 'text',
    required: true,
    placeholder: '请输入上报内容描述',
    maxLength: TEXTAREA_MAX_LENGTH_DEFAULT,
    multiline: true,
    locked: true,
  },
];

export const isFixedReportField = (id?: string) => fixedReportFields.some(f => f.id === id);

export const withFixedReportFields = (fields: TemplateFieldItem[]): TemplateFieldItem[] => [
  ...fixedReportFields.map(f => ({ ...f })),
  ...fields.filter(f => !isFixedReportField(f.id) && !/事件标题|事件详情|上报标题|上报内容描述/.test(f.name))
];

export const isLockedField = (field?: TemplateFieldItem) =>
  !!field && (field.locked ?? isFixedReportField(field.id));

/** 上报标题必填开关锁定；上报内容描述必填可改 */
export const isRequiredLockedField = (field?: TemplateFieldItem) => !!field && field.id === TITLE_FIELD_ID;

/** 固定字段结构约束：第 1 行单行文本且必填，第 2 行多行文本；旧默认字数 50 迁移为 20 */
export const normalizeFixedFieldConstraints = (fields: TemplateFieldItem[]): TemplateFieldItem[] =>
  fields.map(f => {
    if (f.id === TITLE_FIELD_ID) {
      const maxLength =
        f.maxLength === undefined || f.maxLength === 50 ? TEXT_MAX_LENGTH_DEFAULT : f.maxLength;
      return {
        ...f,
        type: 'text' as const,
        multiline: false,
        required: true,
        locked: true,
        maxLength,
      };
    }
    if (f.id === DETAIL_FIELD_ID) {
      return {
        ...f,
        type: 'text' as const,
        multiline: true,
        locked: true,
        required: f.required ?? true,
        maxLength: f.maxLength === undefined ? TEXTAREA_MAX_LENGTH_DEFAULT : f.maxLength,
      };
    }
    return f;
  });

const usesFixedFieldRule = (fields: TemplateFieldItem[] = []) => fields.some(f => f.locked !== undefined);

const normalizeTemplateFields = (list: BusinessTemplateItem[]): BusinessTemplateItem[] =>
  list.map(t => {
    if (t.templateType !== '报送') return t;
    const fields = usesFixedFieldRule(t.fields)
      ? normalizeFixedFieldConstraints(t.fields || [])
      : withFixedReportFields(t.fields || []);
    return { ...t, fields };
  });

// 全局固定字段规则：控制全平台（含全局与各机构）之后新建报送模板时带入的前置字段，已创建的模板不受影响
export const FIXED_FIELD_RULE_STORAGE_KEY = 'mt_global_fixed_report_field_rule';
export const FIXED_FIELD_RULE_MAX = 5;

export const defaultFixedFieldRule: TemplateFieldItem[] = fixedReportFields.map(f => ({ ...f }));

/** 存储中 maxLength 为 null 表示不限制；旧规则没有该字段时按输入方式补默认上限 */
type StoredRuleField = Omit<TemplateFieldItem, 'maxLength'> & { maxLength?: number | null };

const fromStoredRule = (list: StoredRuleField[]): TemplateFieldItem[] =>
  normalizeFixedFieldConstraints(
    list.map(f => ({
      ...f,
      locked: true,
      // 规则侧多行固定字段统一默认必填（模板内仍可改为选填）
      required: f.id === DETAIL_FIELD_ID ? true : f.required,
      maxLength: f.maxLength === undefined ? defaultMaxLengthOf(f.multiline) : f.maxLength ?? undefined,
    }))
  );

const toStoredRule = (rule: TemplateFieldItem[]): StoredRuleField[] =>
  rule.map(f => ({ ...f, maxLength: f.maxLength ?? null }));

export const readFixedFieldRule = (): TemplateFieldItem[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(FIXED_FIELD_RULE_STORAGE_KEY) || 'null');
    if (Array.isArray(parsed) && parsed.some((f: TemplateFieldItem) => f.id === TITLE_FIELD_ID)) {
      return fromStoredRule(parsed);
    }
  } catch {
    // ignore malformed rule
  }
  return defaultFixedFieldRule.map(f => ({ ...f }));
};

export const writeFixedFieldRule = (rule: TemplateFieldItem[]) => {
  localStorage.setItem(FIXED_FIELD_RULE_STORAGE_KEY, JSON.stringify(toStoredRule(rule)));
};

const institutionFixedFieldRuleKey = (institutionId: string | number) => `mt_inst_fixed_field_rule_${institutionId}`;

/** 机构自行维护的固定字段规则；未设置时沿用全局规则 */
export const readInstitutionFixedFieldRule = (institutionId?: string | number): TemplateFieldItem[] | null => {
  if (institutionId === undefined || institutionId === '') return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(institutionFixedFieldRuleKey(institutionId)) || 'null');
    if (Array.isArray(parsed) && parsed.some((f: TemplateFieldItem) => f.id === TITLE_FIELD_ID)) {
      return fromStoredRule(parsed);
    }
  } catch {
    // ignore malformed rule
  }
  return null;
};

export const writeInstitutionFixedFieldRule = (institutionId: string | number, rule: TemplateFieldItem[]) => {
  localStorage.setItem(institutionFixedFieldRuleKey(institutionId), JSON.stringify(toStoredRule(rule)));
};

export const readEffectiveFixedFieldRule = (institutionId?: string | number): TemplateFieldItem[] =>
  readInstitutionFixedFieldRule(institutionId) ?? readFixedFieldRule();

/** 固定字段按规则重建时，保留模板中该字段已设置的 PC 宽度 */
const withPcWidthFrom = (fields: TemplateFieldItem[], ruleField: TemplateFieldItem): TemplateFieldItem => {
  const pcWidth = fields.find(f => f.id === ruleField.id)?.pcWidth;
  return pcWidth ? { ...ruleField, pcWidth } : ruleField;
};

/** 新建报送模板时按规则重排前置固定字段，其余字段保留为自定义字段 */
export const applyFixedFieldRule = (fields: TemplateFieldItem[], institutionId?: string | number): TemplateFieldItem[] => {
  const rule = readEffectiveFixedFieldRule(institutionId);
  const ruleIds = new Set(rule.map(f => f.id));
  const ruleNames = new Set([...rule, ...readFixedFieldRule()].map(f => f.name));
  return normalizeFixedFieldConstraints([
    ...rule.map(f => withPcWidthFrom(fields, { ...f, locked: true })),
    ...fields.filter(
      f =>
        !ruleIds.has(f.id) &&
        !isFixedReportField(f.id) &&
        !isLockedField(f) &&
        !ruleNames.has(f.name) &&
        !/事件标题|事件详情|上报标题|上报内容描述/.test(f.name)
    ),
  ]);
};

/** 已创建模板按规则替换前置固定字段；不再属于规则的原固定字段转为普通字段保留 */
export const rebaseOnFixedFieldRule = (fields: TemplateFieldItem[], rule: TemplateFieldItem[]): TemplateFieldItem[] => {
  const ruleIds = new Set(rule.map(f => f.id));
  const ruleNames = new Set(rule.map(f => f.name));
  return [
    ...rule.map(f => withPcWidthFrom(fields, { ...f, locked: true })),
    ...fields
      .filter(f => !ruleIds.has(f.id) && !ruleNames.has(f.name))
      .map(f => (isLockedField(f) ? { ...f, locked: false } : f)),
  ];
};

const readGlobalTemplateStore = (): BusinessTemplateItem[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(GLOBAL_TEMPLATE_STORAGE_KEY) || 'null');
    if (Array.isArray(parsed) && parsed.length > 0) return normalizeTemplateFields(parsed);
  } catch {
    // ignore malformed store
  }
  return initialDefaultTemplates;
};

export const countGlobalReportTemplates = () => readGlobalTemplateStore().filter(t => t.templateType === '报送').length;

/** 全局规则保存后同步全局系统默认模板，以及各机构沿用的系统默认模板；机构自定义模板不受影响 */
export const applyFixedFieldRuleToGlobalTemplates = (): number => {
  const rule = readFixedFieldRule();
  let count = 0;
  const next = readGlobalTemplateStore().map(t => {
    if (t.templateType !== '报送') return t;
    count++;
    return { ...t, fields: rebaseOnFixedFieldRule(t.fields || [], rule) };
  });
  localStorage.setItem(GLOBAL_TEMPLATE_STORAGE_KEY, JSON.stringify(next));

  Object.keys(localStorage)
    .filter(key => key.startsWith('v8_template_board_data_') && key !== GLOBAL_TEMPLATE_STORAGE_KEY)
    .forEach(key => {
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || 'null');
        if (!Array.isArray(parsed)) return;
        const synced = normalizeTemplateFields(parsed).map(t =>
          t.templateType === '报送' && t.isDefault ? { ...t, fields: rebaseOnFixedFieldRule(t.fields || [], rule) } : t
        );
        localStorage.setItem(key, JSON.stringify(synced));
      } catch {
        // ignore malformed stores
      }
    });
  return count;
};

// System standard preset fields for 报送模板
export const standardReportFields: TemplateFieldItem[] = [
  ...fixedReportFields,
  { id: 'rf_2', name: '事件发生/发现时间', type: 'date', required: true, placeholder: '请选择事件发生或传播时间' },
  { id: 'rf_3', name: '涉事热度/影响数据', type: 'number', required: false, placeholder: '请输入传播量/阅读量等数据' },
  { id: 'rf_4', name: '来源网址/文章出处', type: 'link', required: false, placeholder: 'https://...' },
  { id: 'rf_5', name: '现场图片/证据附件', type: 'file', required: true, placeholder: '支持图片、视频、PDF证明文档' },
  { id: 'rf_6', name: '事件分类', type: 'select', required: true, placeholder: '请选择事件分类', options: ['突发敏感事件', '网络舆情动态', '民生诉求建议'] }
];

// System standard preset fields for 激活模板
export const standardActivationFields: TemplateFieldItem[] = [
  { id: 'af_1', name: '真实姓名', type: 'text', required: true, placeholder: '请输入真实姓名' },
  {
    id: 'af_2',
    name: '身份角色',
    type: 'identity',
    required: true,
    placeholder: '请选择身份角色',
    options: ['超级管理员', '机构管理员', '上报员', '审核员', '运营管理员', '临时审核员']
  },
  { id: 'af_3', name: '手机号码', type: 'phone', required: true, placeholder: '请输入 11 位手机号码' },
  { id: 'af_4', name: '性别', type: 'gender', required: false, placeholder: '请选择性别' },
  { id: 'af_5', name: '身份证号', type: 'id_card', required: true, placeholder: '请输入身份证号码' },
  { id: 'af_6', name: '银行卡号', type: 'bank_card', required: false, placeholder: '请输入银行卡号' },
  { id: 'af_7', name: '身份证照片/证明附件', type: 'file', required: true, placeholder: '请上传身份证照片或授权证明材料' }
];

// Initial default templates
const initialDefaultTemplates: BusinessTemplateItem[] = [
  {
    id: 'tpl_report_std',
    name: '标准图文报送模板',
    templateType: '报送',
    isDefault: true,
    status: '启用',
    updateTime: '2023-10-24 10:00:00',
    description: '适用于日常标准文字、图片、附件类线索报送场景',
    fields: standardReportFields,
    scoreRuleId: 'sr_100_standard',
    scoreTiming: '终审打分',
    includeInEvaluation: true,
    auditFlowId: 'flow_adaptive_tree_3'
  },
  {
    id: 'tpl_report_quick',
    name: '突发事件快速上报',
    templateType: '报送',
    isDefault: false,
    status: '启用',
    updateTime: '2023-11-02 14:30:22',
    description: '精简版快速通道，优先确保应急态势快速流转',
    fields: [
      ...fixedReportFields,
      { id: 'qf_2', name: '事件发生/发现时间', type: 'date', required: true, placeholder: '请选择事件发生或传播时间' },
      { id: 'qf_3', name: '现场图片/证据附件', type: 'file', required: true, placeholder: '支持图片、视频、PDF证明文档' },
      { id: 'qf_4', name: '事件分类', type: 'select', required: true, placeholder: '请选择事件分类', options: ['突发敏感事件', '网络舆情动态', '民生诉求建议'] }
    ],
    scoreRuleId: 'sr_100_standard',
    scoreTiming: '初审打分',
    includeInEvaluation: true,
    auditFlowId: 'flow_max_3_fast'
  },
  {
    id: 'tpl_act_std',
    name: '登录验证激活模板',
    templateType: '激活',
    isDefault: true,
    status: '启用',
    updateTime: '2023-10-25 11:20:00',
    description: '新用户与网格人员入驻时统一采用的实名核验与激活标准表单',
    fields: standardActivationFields,
    verificationOptions: {
      phoneVerify: true,
      idCardVerify: true,
      bankCardVerify: false
    },
    adaptedRoles: ['上报员', '审核员']
  },
  {
    id: 'tpl_act_sub',
    name: '登录验证激活模板-01',
    templateType: '激活',
    isDefault: false,
    status: '启用',
    updateTime: '2023-11-01 09:40:15',
    description: '专用于一线直报员与特约网格员的快速身份激活通道',
    fields: [
      { id: 'eaf_1', name: '真实姓名', type: 'text', required: true, placeholder: '请输入真实姓名' },
      { id: 'eaf_2', name: '身份角色', type: 'identity', required: true, placeholder: '请选择身份角色', options: ['上报员', '审核员', '临时审核员'] },
      { id: 'eaf_3', name: '手机号码', type: 'phone', required: true, placeholder: '请输入 11 位手机号码' },
      { id: 'eaf_4', name: '性别', type: 'gender', required: false, placeholder: '请选择性别' },
      { id: 'eaf_5', name: '银行卡号', type: 'bank_card', required: false, placeholder: '请输入银行卡号' },
      { id: 'eaf_6', name: '身份证照片/证明附件', type: 'file', required: true, placeholder: '请上传身份证照片或授权证明材料' }
    ],
    verificationOptions: {
      phoneVerify: true,
      idCardVerify: true,
      bankCardVerify: false
    },
    adaptedRoles: ['上报员']
  }
];

const GLOBAL_TEMPLATE_STORAGE_KEY = 'v8_template_board_data_global';

const readGlobalTemplates = (): BusinessTemplateItem[] => {
  try {
    const saved = localStorage.getItem(GLOBAL_TEMPLATE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return normalizeTemplateFields(parsed);
    }
  } catch {
    // ignore storage failures
  }
  return initialDefaultTemplates;
};

const COLUMN_WIDTH_STORAGE_KEY = 'v8_template_board_column_widths';
const LEFT_COL_DEFAULT = 260;
const RIGHT_COL_DEFAULT = 310;
const LEFT_COL_MIN = 200;
const LEFT_COL_MAX = 420;
const RIGHT_COL_MIN = 260;
const RIGHT_COL_MAX = 480;
const CENTER_COL_MIN = 320;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const readStoredColumnWidths = (): { left: number; right: number } => {
  try {
    const raw = localStorage.getItem(COLUMN_WIDTH_STORAGE_KEY);
    if (!raw) return { left: LEFT_COL_DEFAULT, right: RIGHT_COL_DEFAULT };
    const parsed = JSON.parse(raw) as { left?: number; right?: number };
    return {
      left: clamp(Number(parsed.left) || LEFT_COL_DEFAULT, LEFT_COL_MIN, LEFT_COL_MAX),
      right: clamp(Number(parsed.right) || RIGHT_COL_DEFAULT, RIGHT_COL_MIN, RIGHT_COL_MAX),
    };
  } catch {
    return { left: LEFT_COL_DEFAULT, right: RIGHT_COL_DEFAULT };
  }
};

export const TemplateConfigBoard: React.FC<TemplateConfigBoardProps> = ({
  institutionId,
  isGlobalScope = false,
  onSaveNotice,
  onNavigateToWorkflow,
  onNavigateToScoring,
  titleMode = 'card',
  titleExtra,
}) => {
  const storageKey = `v8_template_board_data_${institutionId ?? 'global'}`;

  // State: Templates data store
  const [templates, setTemplates] = useState<BusinessTemplateItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return normalizeTemplateFields(parsed);
      }
    } catch (e) {
      console.error(e);
    }
    return isGlobalScope || storageKey === GLOBAL_TEMPLATE_STORAGE_KEY ? initialDefaultTemplates : readGlobalTemplates();
  });

  // Save to local storage
  const saveTemplates = (newTemplates: BusinessTemplateItem[]) => {
    setTemplates(newTemplates);
    localStorage.setItem(storageKey, JSON.stringify(newTemplates));
  };

  useEffect(() => {
    const syncFromOtherWindow = (event: StorageEvent) => {
      if (event.key !== storageKey || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue);
        if (Array.isArray(parsed)) setTemplates(normalizeTemplateFields(parsed));
      } catch {
        // ignore malformed payloads
      }
    };
    window.addEventListener('storage', syncFromOtherWindow);
    return () => window.removeEventListener('storage', syncFromOtherWindow);
  }, [storageKey]);

  // Desktop 3-column widths (mouse-draggable)
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
        setLeftColWidth(clamp(x, LEFT_COL_MIN, Math.max(LEFT_COL_MIN, maxLeft)));
        return;
      }

      const fromRight = rect.width - x;
      const maxRight = Math.min(
        RIGHT_COL_MAX,
        rect.width - leftColWidthRef.current - CENTER_COL_MIN - 16
      );
      setRightColWidth(clamp(fromRight, RIGHT_COL_MIN, Math.max(RIGHT_COL_MIN, maxRight)));
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

  // Active top tab: 报送模板 vs 激活模板
  const [topTab] = useState<TemplateType>('报送');
  const [moreMenuId, setMoreMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!moreMenuId) return;
    const close = () => setMoreMenuId(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [moreMenuId]);

  // Currently previewed template ID
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    const list = templates.filter(t => t.templateType === '报送');
    return list[0]?.id || 'tpl_report_std';
  });

  // Designer Mode State (null means in 3-column view; item means editing / creating in designer view)
  const [designerItem, setDesignerItem] = useState<{
    mode: 'add' | 'edit' | 'copy';
    template: BusinessTemplateItem;
  } | null>(null);

  // Designer Form fields
  const [designerName, setDesignerName] = useState('');
  const [designerDesc, setDesignerDesc] = useState('');
  const [designerFields, setDesignerFields] = useState<TemplateFieldItem[]>([]);
  const [designerBaseline, setDesignerBaseline] = useState('');
  const [draggingFieldIndex, setDraggingFieldIndex] = useState<number | null>(null);

  // Drag and drop sorting for template designer fields
  const handleDropDesignerField = (targetIndex: number) => {
    if (draggingFieldIndex === null || draggingFieldIndex === targetIndex) {
      setDraggingFieldIndex(null);
      return;
    }
    setDesignerFields(prev => {
      if (isLockedField(prev[draggingFieldIndex]) || isLockedField(prev[targetIndex])) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(draggingFieldIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDraggingFieldIndex(null);
  };
  // Right column sub-tab for 报送模板: 'score' | 'flow' (Default to 'flow' per user audit flow optimization)
  const [rightSubTab, setRightSubTab] = useState<'score' | 'flow'>('flow');

  // Pending changes for right side other config (规则打分 / 审核流程 / 实名核验 / 适配角色)
  const [pendingOtherConfig, setPendingOtherConfig] = useState<{
    templateId: string;
    scoreRuleId?: string;
    scoreTiming?: '初审打分' | '终审打分';
    includeInEvaluation?: boolean;
    auditFlowId?: string;
    verificationOptions?: {
      phoneVerify: boolean;
      idCardVerify: boolean;
      bankCardVerify: boolean;
    };
    adaptedRoles?: string[];
  } | null>(null);

  // When selectedTemplateId or topTab changes, reset pending changes
  useEffect(() => {
    setPendingOtherConfig(null);
  }, [selectedTemplateId, topTab]);

  // Interactive phone preview input states
  const [phoneFormValues, setPhoneFormValues] = useState<Record<string, any>>({});
  const [previewDevice, setPreviewDevice] = useState<'h5' | 'pc'>(() => {
    try {
      return localStorage.getItem('mt_template_preview_device') === 'pc' ? 'pc' : 'h5';
    } catch {
      return 'h5';
    }
  });
  const [submittedSimulate, setSubmittedSimulate] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [linkShots, setLinkShots] = useState<
    Record<
      string,
      { status: 'loading' | 'done' | 'error' | 'empty' | 'invalid'; url: string; shotAt?: string; reason?: string }
    >
  >({});
  const [linkShotViewer, setLinkShotViewer] = useState<{ url: string; shotAt?: string } | null>(null);

  const isValidLinkUrl = (value: string) => {
    try {
      const parsed = new URL(value.trim());
      return /^https?:$/.test(parsed.protocol) && /\.[a-z]{2,}$/i.test(parsed.hostname);
    } catch {
      return false;
    }
  };

  // 原型内模拟访问结果：域名含 404 / error / unreachable 或以 .invalid 结尾时视为无法访问，并返回网站的访问反馈
  const simulateUnreachableReason = (value: string): string | null => {
    try {
      const host = new URL(value.trim()).hostname;
      if (/404/.test(host)) return '页面不存在（404）';
      if (/error/i.test(host)) return '网站服务器错误（500）';
      if (/unreachable/i.test(host) || host.endsWith('.invalid')) return '无法连接到该网站，请求超时';
      return null;
    } catch {
      return '网址无法解析';
    }
  };

  const captureLinkShot = (fieldId: string, url: string) => {
    setLinkShots(prev => ({ ...prev, [fieldId]: { status: 'loading', url } }));
    window.setTimeout(() => {
      setLinkShots(prev => {
        if (prev[fieldId]?.url !== url) return prev;
        const reason = simulateUnreachableReason(url);
        if (reason) {
          return { ...prev, [fieldId]: { status: 'error', url, reason } };
        }
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const shotAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
        return { ...prev, [fieldId]: { status: 'done', url, shotAt } };
      });
    }, 1200);
  };

  const removeLinkShot = (fieldId: string) => {
    setLinkShots(prev => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const renderLinkShotMock = (url: string, large = false) => {
    let host = url;
    try {
      host = new URL(url).hostname;
    } catch {}
    return (
      <div className="w-full h-full bg-white flex flex-col overflow-hidden">
        <div className={`flex items-center gap-1 bg-slate-100 border-b border-slate-200 ${large ? 'px-3 py-2' : 'px-1.5 py-1'}`}>
          <span className={`${large ? 'w-2 h-2' : 'w-1 h-1'} rounded-full bg-rose-300`} />
          <span className={`${large ? 'w-2 h-2' : 'w-1 h-1'} rounded-full bg-amber-300`} />
          <span className={`${large ? 'w-2 h-2' : 'w-1 h-1'} rounded-full bg-emerald-300`} />
          <span className={`ml-1 flex-1 truncate bg-white rounded text-slate-400 ${large ? 'text-xs px-2 py-0.5' : 'text-[7px] px-1'}`}>
            {host}
          </span>
        </div>
        <div className={`flex-1 flex flex-col ${large ? 'p-6 gap-3' : 'p-2 gap-1'}`}>
          <div className={`bg-slate-700 rounded-sm ${large ? 'h-4 w-3/4' : 'h-1.5 w-3/4'}`} />
          <div className={`bg-slate-300 rounded-sm ${large ? 'h-2.5 w-1/3' : 'h-1 w-1/3'}`} />
          <div className={`bg-blue-100 rounded-sm ${large ? 'h-40 mt-2' : 'h-6 mt-0.5'}`} />
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`bg-slate-200 rounded-sm ${large ? 'h-2.5' : 'h-1'}`}
              style={{ width: `${[96, 88, 92, 60][i]}%` }}
            />
          ))}
        </div>
      </div>
    );
  };

  // Trigger Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (onSaveNotice) onSaveNotice(msg);
    setTimeout(() => setToastMessage(null), 2600);
  };

  // Filter templates by current top tab
  const currentCategoryTemplates = templates.filter(t => t.templateType === topTab);

  // Active preview template object
  const activeTemplate =
    currentCategoryTemplates.find(t => t.id === selectedTemplateId) ||
    currentCategoryTemplates[0] ||
    templates[0];

  // Active scoreRuleId with pending state fallback
  const currentScoreRuleId =
    pendingOtherConfig?.templateId === activeTemplate?.id && pendingOtherConfig.scoreRuleId !== undefined
      ? pendingOtherConfig.scoreRuleId
      : activeTemplate?.scoreRuleId || '';

  // Active scoreTiming with pending state fallback
  const currentScoreTiming =
    pendingOtherConfig?.templateId === activeTemplate?.id && pendingOtherConfig.scoreTiming !== undefined
      ? pendingOtherConfig.scoreTiming
      : activeTemplate?.scoreTiming || '终审打分';

  // Active includeInEvaluation with pending state fallback
  const currentIncludeInEvaluation =
    pendingOtherConfig?.templateId === activeTemplate?.id && pendingOtherConfig.includeInEvaluation !== undefined
      ? pendingOtherConfig.includeInEvaluation
      : activeTemplate?.includeInEvaluation ?? true;

  // Active auditFlowId with pending state fallback
  const currentAuditFlowId =
    pendingOtherConfig?.templateId === activeTemplate?.id && pendingOtherConfig.auditFlowId !== undefined
      ? pendingOtherConfig.auditFlowId
      : activeTemplate?.auditFlowId || '';

  // Default verification options fallback
  const defaultVerificationOptions = {
    phoneVerify: true,
    idCardVerify: true,
    bankCardVerify: false
  };

  // Active verification options with pending state fallback
  const currentVerificationOptions =
    pendingOtherConfig?.templateId === activeTemplate?.id && pendingOtherConfig.verificationOptions !== undefined
      ? pendingOtherConfig.verificationOptions
      : activeTemplate?.verificationOptions || defaultVerificationOptions;

  // Default adapted roles fallback
  const defaultAdaptedRoles = ['上报员', '审核员'];

  // Active adapted roles with pending state fallback
  const currentAdaptedRoles =
    pendingOtherConfig?.templateId === activeTemplate?.id && pendingOtherConfig.adaptedRoles !== undefined
      ? pendingOtherConfig.adaptedRoles
      : activeTemplate?.adaptedRoles || defaultAdaptedRoles;

  // Check if there are unsaved pending changes compared to activeTemplate
  const isOtherConfigDirty = Boolean(
    pendingOtherConfig &&
    pendingOtherConfig.templateId === activeTemplate?.id &&
    (
      (pendingOtherConfig.scoreRuleId !== undefined && pendingOtherConfig.scoreRuleId !== activeTemplate?.scoreRuleId) ||
      (pendingOtherConfig.scoreTiming !== undefined && pendingOtherConfig.scoreTiming !== (activeTemplate?.scoreTiming || '终审打分')) ||
      (pendingOtherConfig.includeInEvaluation !== undefined && pendingOtherConfig.includeInEvaluation !== (activeTemplate?.includeInEvaluation ?? true)) ||
      (pendingOtherConfig.auditFlowId !== undefined && pendingOtherConfig.auditFlowId !== activeTemplate?.auditFlowId) ||
      (pendingOtherConfig.verificationOptions !== undefined && (
        pendingOtherConfig.verificationOptions.phoneVerify !== (activeTemplate?.verificationOptions?.phoneVerify ?? defaultVerificationOptions.phoneVerify) ||
        pendingOtherConfig.verificationOptions.idCardVerify !== (activeTemplate?.verificationOptions?.idCardVerify ?? defaultVerificationOptions.idCardVerify) ||
        pendingOtherConfig.verificationOptions.bankCardVerify !== (activeTemplate?.verificationOptions?.bankCardVerify ?? defaultVerificationOptions.bankCardVerify)
      )) ||
      (pendingOtherConfig.adaptedRoles !== undefined && (
        pendingOtherConfig.adaptedRoles.length !== (activeTemplate?.adaptedRoles || defaultAdaptedRoles).length ||
        pendingOtherConfig.adaptedRoles.some(r => !(activeTemplate?.adaptedRoles || defaultAdaptedRoles).includes(r))
      ))
    )
  );

  const confirmDiscardPending = async () =>
    !isOtherConfigDirty ||
    (await confirmDialog('右侧「其他业务配置」有未保存的修改，切换后将丢失，确认继续吗？', { okText: '继续切换' }));

  const handleSelectTemplate = async (id: string) => {
    if (id === activeTemplate?.id || !(await confirmDiscardPending())) return;
    setSelectedTemplateId(id);
  };

  const templateSortRank = (t: BusinessTemplateItem) =>
    t.status !== '启用' ? 2 : isGlobalScope && t.isPreset ? 0 : 1;
  const visibleTemplates = [...currentCategoryTemplates].sort((a, b) => templateSortRank(a) - templateSortRank(b));
  const [presetTipClosed, setPresetTipClosed] = useState(false);
  const showPresetTip =
    isGlobalScope && !presetTipClosed && !currentCategoryTemplates.some(t => t.isPreset && t.status === '启用');

  // Auto ensure valid selectedTemplateId on topTab change
  useEffect(() => {
    const matched = templates.filter(t => t.templateType === topTab);
    if (!matched.some(t => t.id === selectedTemplateId)) {
      if (matched.length > 0) {
        setSelectedTemplateId(matched[0].id);
      }
    }
  }, [topTab, templates]);

  // Toggle template enabled status
  const handleToggleTemplateStatus = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = templates.find(t => t.id === id);
    if (!target) return;
    const nextStatus: '启用' | '停用' = target.status === '启用' ? '停用' : '启用';
    if (nextStatus === '启用' && target.templateType === '报送' && (!target.scoreRuleId || !target.auditFlowId)) {
      const missing =
        !target.scoreRuleId && !target.auditFlowId
          ? '打分规则和审核流程'
          : !target.scoreRuleId
            ? '打分规则'
            : '审核流程';
      alertDialog(`请先在右侧「其他业务配置」关联${missing}并保存，再启用该模板`);
      return;
    }
    const dropPreset = isGlobalScope && target.isPreset && nextStatus === '停用';
    if (
      dropPreset &&
      !(await confirmDialog(
        `「${target.name}」是当前的标准模板，停用后将同时取消标准模板，各机构新增模板时将无法再调用。确认停用吗？`,
        { okText: '确认停用' }
      ))
    ) {
      return;
    }
    const updated = templates.map(t =>
      t.id === id ? { ...t, status: nextStatus, ...(dropPreset ? { isPreset: false } : {}) } : t
    );
    saveTemplates(updated);
    showToast(dropPreset ? `「${target.name}」已停用，并取消标准模板` : `模板已${nextStatus}`);
  };

  const isTemplateNameTaken = (name: string, type: BusinessTemplateItem['templateType'], excludeId?: string) =>
    templates.some(t => t.id !== excludeId && t.templateType === type && t.name.trim() === name);

  /** 「{原名} - 副本」已存在时依次追加数字：副本2、副本3… */
  const nextCopyName = (tpl: BusinessTemplateItem) => {
    const base = `${tpl.name.replace(/ - 副本\d*$/, '')} - 副本`;
    let name = base;
    for (let n = 2; isTemplateNameTaken(name, tpl.templateType); n++) name = `${base}${n}`;
    return name;
  };

  // Duplicate a template
  const handleCopyTemplate = (tpl: BusinessTemplateItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newId = `tpl_${Date.now()}`;
    const newTpl: BusinessTemplateItem = {
      ...tpl,
      id: newId,
      name: nextCopyName(tpl),
      isDefault: false,
      isPreset: false,
      updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      fields: tpl.fields.map(f => ({ ...f, id: `f_${Date.now()}_${Math.random().toString(36).substring(2, 6)}` }))
    };
    const updated = [...templates, newTpl];
    saveTemplates(updated);
    setSelectedTemplateId(newId);
    showToast(`已成功复制模板「${tpl.name}」`);
  };

  // Delete a template
  const handleDeleteTemplate = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = templates.find(t => t.id === id);
    if (!isGlobalScope && target?.isDefault) {
      alertDialog('系统默认模板受平台全局统一管控，机构端不支持删除！');
      return;
    }
    const deleteMessage =
      isGlobalScope && target?.isPreset
        ? `「${target.name}」是当前的标准模板，删除后各机构新增模板时将无法再调用。确认删除吗？`
        : `确认删除模板「${target?.name}」吗？`;
    if (await confirmDialog(deleteMessage, { title: '删除模板', okText: '确认删除', danger: true })) {
      const updated = templates.filter(t => t.id !== id);
      saveTemplates(updated);
      showToast('模板已删除');
    }
  };

  const designerSnapshot = (name: string, description: string, fields: TemplateFieldItem[]) =>
    JSON.stringify({
      name,
      description,
      fields: fields.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        required: !!f.required,
        placeholder: f.placeholder ?? '',
        options: f.options ?? [],
        multiline: !!f.multiline,
        maxLength: f.maxLength ?? null,
        pcWidth: f.pcWidth ?? null,
        locked: f.locked ?? null,
      })),
    });

  // Open Designer
  const handleOpenDesigner = (mode: 'add' | 'edit' | 'copy', tpl?: BusinessTemplateItem) => {
    if (!isGlobalScope && mode === 'edit' && tpl?.isDefault) {
      alertDialog('系统默认模板受平台全局统一管控，机构端不支持编辑。如需个性化，请复制为新模板或新建自定义模板。');
      return;
    }
    if (mode === 'add') {
      const newTpl: BusinessTemplateItem = {
        id: `tpl_${Date.now()}`,
        name: topTab === '报送' ? '重点应急事件处置报送' : '重点应急目标快速激活',
        templateType: topTab,
        isDefault: false,
        status: '停用',
        updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        description: '',
        fields:
          topTab === '报送'
            ? normalizeFixedFieldConstraints(applyFixedFieldRule(standardReportFields, institutionId))
            : [...standardActivationFields],
      };
      setDesignerItem({ mode: 'add', template: newTpl });
      setDesignerName('');
      setDesignerDesc('');
      setDesignerFields(newTpl.fields);
      setDesignerBaseline(designerSnapshot('', '', newTpl.fields));
    } else if (tpl) {
      setDesignerItem({ mode, template: tpl });
      const nextName = tpl.name;
      const nextDesc = tpl.description || '';
      setDesignerName(nextName);
      setDesignerDesc(nextDesc);
      const copied = tpl.fields.map(f => ({ ...f }));
      const nextFields =
        tpl.templateType === '报送'
          ? normalizeFixedFieldConstraints(
              mode === 'copy' ? applyFixedFieldRule(copied, institutionId) : copied
            )
          : copied;
      setDesignerFields(nextFields);
      setDesignerBaseline(designerSnapshot(nextName, nextDesc, nextFields));
    }
  };

  const handleLeaveDesigner = async () => {
    if (!designerItem) return;
    const dirty = designerSnapshot(designerName, designerDesc, designerFields) !== designerBaseline;
    if (dirty) {
      const leavingNew = designerItem.mode !== 'edit';
      const confirmed = await confirmDialog(
        leavingNew
          ? '当前填写的内容尚未保存，退出后将不会保留。确认退出吗？'
          : '已修改的内容尚未保存，退出后将不会保留。确认退出吗？',
        { okText: '确认退出', cancelText: '继续编辑' }
      );
      if (!confirmed) return;
    }
    setDesignerItem(null);
  };

  // 标准模板：平台全局设置，全局与机构新增模板时可调用
  const handleTogglePreset = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = templates.find(t => t.id === id);
    if (!target) return;
    const nextPreset = !target.isPreset;
    if (nextPreset && target.status !== '启用') {
      showToast('停用的模板不能设为标准模板，请先启用');
      return;
    }
    if (
      !nextPreset &&
      !(await confirmDialog(
        `确认取消「${target.name}」的标准模板吗？取消后，各机构新增模板时将无法「使用标准模板」，直至重新设置标准模板。`,
        { okText: '确认取消', cancelText: '暂不取消' }
      ))
    ) {
      return;
    }
    const replaced = nextPreset
      ? templates.find(t => t.id !== id && t.isPreset && t.templateType === target.templateType)
      : undefined;
    saveTemplates(
      templates.map(t => {
        if (t.id === id) return { ...t, isPreset: nextPreset };
        if (nextPreset && t.templateType === target.templateType && t.isPreset) return { ...t, isPreset: false };
        return t;
      })
    );
    showToast(
      nextPreset
        ? `「${target.name}」已设为标准模板${replaced ? `，原标准模板「${replaced.name}」已取消` : ''}`
        : `「${target.name}」已取消标准模板，当前暂无标准模板`
    );
  };

  const presetSource = isGlobalScope ? templates : readGlobalTemplates();

  // Save in Designer
  const handleSaveDesigner = () => {
    if (!isGlobalScope && designerItem?.mode === 'edit' && designerItem.template.isDefault) {
      alertDialog('系统默认模板受平台全局统一管控，机构端不支持编辑。如需个性化，请复制为新模板或新建自定义模板。');
      return;
    }
    if (!designerName.trim()) {
      alertDialog('请输入模板名称');
      return;
    }
    if (designerFields.length === 0) {
      alertDialog('至少需要配置一个表单字段');
      return;
    }

    if (!designerItem) return;
    const emptyOptionField = designerFields.find(
      f => OPTION_FIELD_TYPES.includes(f.type) && !(f.options || []).some(o => o.trim())
    );
    if (emptyOptionField) {
      alertDialog(`字段「${emptyOptionField.name || '未命名字段'}」至少需要配置一个选项`);
      return;
    }
    if (designerFields.some(f => f.type === 'static_text' && !(f.placeholder || '').trim())) {
      alertDialog('请填写静态提示文本的内容');
      return;
    }
    const badLengthField = designerFields.find(f => f.type === 'text' && !isValidMaxLength(f.maxLength));
    if (badLengthField) {
      alertDialog(`字段「${badLengthField.name || '未命名字段'}」的字数上限需为 1–${TEXT_MAX_LENGTH_LIMIT} 的整数`);
      return;
    }
    if (
      isTemplateNameTaken(
        designerName.trim(),
        designerItem.template.templateType,
        designerItem.mode === 'edit' ? designerItem.template.id : undefined
      )
    ) {
      alertDialog(`模板名称「${designerName.trim()}」已存在，请更换名称`);
      return;
    }
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const fieldsToSave =
      designerItem.template.templateType === '报送'
        ? normalizeFixedFieldConstraints(designerFields)
        : designerFields;

    if (designerItem.mode === 'add') {
      const newItem: BusinessTemplateItem = {
        ...designerItem.template,
        name: designerName.trim(),
        description: designerDesc.trim(),
        fields: fieldsToSave,
        updateTime: nowStr
      };
      const updated = [...templates, newItem];
      saveTemplates(updated);
      setSelectedTemplateId(newItem.id);
      showToast(
        newItem.templateType === '报送'
          ? `新增模板「${newItem.name}」已保存，当前为停用。请关联打分规则和审核流程后再启用`
          : `新增模板「${newItem.name}」已成功保存，当前为停用状态`
      );
    } else {
      const updated = templates.map(t => {
        if (t.id === designerItem.template.id) {
          return {
            ...t,
            name: designerName.trim(),
            description: designerDesc.trim(),
            fields: fieldsToSave,
            updateTime: nowStr
          };
        }
        return t;
      });
      saveTemplates(updated);
      showToast(`模板「${designerName}」配置已成功保存！`);
    }
    setDesignerItem(null);
  };

  // Add a new blank field in designer
  const handleAddField = () => {
    const newField: TemplateFieldItem = {
      id: `fld_${Date.now()}`,
      name: '自定义字段',
      type: 'text',
      required: true,
      placeholder: '请输入相关信息',
      maxLength: TEXT_MAX_LENGTH_DEFAULT
    };
    setDesignerFields([...designerFields, newField]);
  };

  // Field type options for designer dropdown
  const getFieldTypeOptions = (tType: TemplateType): { value: FieldControl; label: string }[] => {
    if (tType === '激活') {
      return [
        { value: 'text', label: '文本字段' },
        { value: 'identity', label: '身份选择' },
        { value: 'phone', label: '手机号' },
        { value: 'gender', label: '性别' },
        { value: 'id_card', label: '身份证号' },
        { value: 'bank_card', label: '银行卡号' },
        { value: 'file', label: '附件字段' },
        { value: 'date', label: '时间字段' },
        { value: 'select', label: '选择字段' }
      ];
    }
    return [
      { value: 'text', label: '单行文本' },
      { value: 'textarea', label: '多行文本' },
      { value: 'number', label: '数据字段' },
      { value: 'date', label: '日期选择字段' },
      { value: 'radio', label: '单选框组' },
      { value: 'checkbox', label: '多选框组' },
      { value: 'select', label: '下拉单选' },
      { value: 'multi_select', label: '下拉多选' },
      { value: 'link', label: '链接字段' },
      { value: 'file', label: '附件字段' },
      { value: 'static_text', label: '静态提示文本' }
    ];
  };

  const changeFieldControl = (field: TemplateFieldItem, control: FieldControl): TemplateFieldItem => {
    const type: FieldType = control === 'textarea' ? 'text' : control;
    return {
      ...field,
      type,
      multiline: control === 'textarea' ? true : undefined,
      maxLength:
        type !== 'text'
          ? undefined
          : field.type === 'text'
          ? switchMaxLength(field.maxLength, !!field.multiline, control === 'textarea')
          : defaultMaxLengthOf(control === 'textarea'),
      options: OPTION_FIELD_TYPES.includes(type)
        ? field.options?.length
          ? field.options
          : ['选项一', '选项二', '选项三']
        : type === 'identity'
        ? field.options || ['超级管理员', '机构管理员', '上报员', '审核员']
        : undefined,
      ...(type === 'static_text' ? { required: false } : {}),
      ...((type === 'static_text') !== (field.type === 'static_text')
        ? { placeholder: '', name: type === 'static_text' ? '' : field.name || '自定义字段' }
        : {})
    };
  };

  // Update right side business config (score rules / verification switches / adapted roles)
  const handleSaveOtherConfig = () => {
    if (!activeTemplate) return;
    const updatedTpl: BusinessTemplateItem = {
      ...activeTemplate,
      scoreRuleId: currentScoreRuleId || undefined,
      scoreTiming: currentScoreTiming,
      includeInEvaluation: currentIncludeInEvaluation,
      auditFlowId: currentAuditFlowId || undefined,
      verificationOptions: currentVerificationOptions,
      adaptedRoles: currentAdaptedRoles
    };
    const updatedList = templates.map(t => (t.id === activeTemplate.id ? updatedTpl : t));
    saveTemplates(updatedList);
    setPendingOtherConfig(null);
    showToast('其他业务配置已成功保存并实时生效！');
  };

  // Revert / Undo pending changes in right side business config
  const handleUndoOtherConfig = () => {
    if (!isOtherConfigDirty) return;
    setPendingOtherConfig(null);
    showToast('已撤回更改，恢复为已保存配置');
  };

  // Select score rule (pending modification)
  const handleSelectScoreRule = (ruleId: string) => {
    if (!activeTemplate) return;
    setPendingOtherConfig(prev => ({
      templateId: activeTemplate.id,
      scoreRuleId: ruleId,
      scoreTiming: prev?.templateId === activeTemplate.id && prev.scoreTiming !== undefined ? prev.scoreTiming : (activeTemplate.scoreTiming || '终审打分'),
      includeInEvaluation: prev?.templateId === activeTemplate.id && prev.includeInEvaluation !== undefined ? prev.includeInEvaluation : (activeTemplate.includeInEvaluation ?? true),
      auditFlowId: prev?.templateId === activeTemplate.id && prev.auditFlowId !== undefined ? prev.auditFlowId : (activeTemplate.auditFlowId),
      verificationOptions: prev?.templateId === activeTemplate.id && prev.verificationOptions !== undefined ? prev.verificationOptions : (activeTemplate.verificationOptions || defaultVerificationOptions),
      adaptedRoles: prev?.templateId === activeTemplate.id && prev.adaptedRoles !== undefined ? prev.adaptedRoles : (activeTemplate.adaptedRoles || defaultAdaptedRoles)
    }));
  };

  // Select score timing (pending modification)
  const handleSelectScoreTiming = (timing: '初审打分' | '终审打分') => {
    if (!activeTemplate) return;
    setPendingOtherConfig(prev => ({
      templateId: activeTemplate.id,
      scoreRuleId: prev?.templateId === activeTemplate.id && prev.scoreRuleId !== undefined ? prev.scoreRuleId : (activeTemplate.scoreRuleId),
      scoreTiming: timing,
      includeInEvaluation: prev?.templateId === activeTemplate.id && prev.includeInEvaluation !== undefined ? prev.includeInEvaluation : (activeTemplate.includeInEvaluation ?? true),
      auditFlowId: prev?.templateId === activeTemplate.id && prev.auditFlowId !== undefined ? prev.auditFlowId : (activeTemplate.auditFlowId),
      verificationOptions: prev?.templateId === activeTemplate.id && prev.verificationOptions !== undefined ? prev.verificationOptions : (activeTemplate.verificationOptions || defaultVerificationOptions),
      adaptedRoles: prev?.templateId === activeTemplate.id && prev.adaptedRoles !== undefined ? prev.adaptedRoles : (activeTemplate.adaptedRoles || defaultAdaptedRoles)
    }));
  };

  // Toggle include in evaluation (pending modification)
  const handleToggleIncludeInEvaluation = () => {
    if (!activeTemplate) return;
    setPendingOtherConfig(prev => ({
      templateId: activeTemplate.id,
      scoreRuleId: prev?.templateId === activeTemplate.id && prev.scoreRuleId !== undefined ? prev.scoreRuleId : (activeTemplate.scoreRuleId),
      scoreTiming: prev?.templateId === activeTemplate.id && prev.scoreTiming !== undefined ? prev.scoreTiming : (activeTemplate.scoreTiming || '终审打分'),
      includeInEvaluation: !currentIncludeInEvaluation,
      auditFlowId: prev?.templateId === activeTemplate.id && prev.auditFlowId !== undefined ? prev.auditFlowId : (activeTemplate.auditFlowId),
      verificationOptions: prev?.templateId === activeTemplate.id && prev.verificationOptions !== undefined ? prev.verificationOptions : (activeTemplate.verificationOptions || defaultVerificationOptions),
      adaptedRoles: prev?.templateId === activeTemplate.id && prev.adaptedRoles !== undefined ? prev.adaptedRoles : (activeTemplate.adaptedRoles || defaultAdaptedRoles)
    }));
  };

  // Switch and select audit flow (pending modification)
  const handleSelectAuditFlow = (flowId: string) => {
    if (!activeTemplate) return;
    setPendingOtherConfig(prev => ({
      templateId: activeTemplate.id,
      scoreRuleId: prev?.templateId === activeTemplate.id && prev.scoreRuleId !== undefined ? prev.scoreRuleId : (activeTemplate.scoreRuleId),
      scoreTiming: prev?.templateId === activeTemplate.id && prev.scoreTiming !== undefined ? prev.scoreTiming : (activeTemplate.scoreTiming || '终审打分'),
      includeInEvaluation: prev?.templateId === activeTemplate.id && prev.includeInEvaluation !== undefined ? prev.includeInEvaluation : (activeTemplate.includeInEvaluation ?? true),
      auditFlowId: flowId,
      verificationOptions: prev?.templateId === activeTemplate.id && prev.verificationOptions !== undefined ? prev.verificationOptions : (activeTemplate.verificationOptions || defaultVerificationOptions),
      adaptedRoles: prev?.templateId === activeTemplate.id && prev.adaptedRoles !== undefined ? prev.adaptedRoles : (activeTemplate.adaptedRoles || defaultAdaptedRoles)
    }));
  };

  // Jump to workflow management model
  const handleManageWorkflowModel = () => {
    if (onNavigateToWorkflow) {
      onNavigateToWorkflow();
    } else {
      showToast('已直达审核流程配置维护模块');
    }
  };

  // Jump to scoring rules management model
  const handleManageScoringRules = () => {
    if (onNavigateToScoring) {
      onNavigateToScoring();
    } else {
      showToast('已直达审核打分规则维护模块');
    }
  };

  // Update active template verification option (pending modification)
  const handleToggleVerificationOption = (key: 'phoneVerify' | 'idCardVerify' | 'bankCardVerify') => {
    if (!activeTemplate) return;
    const nextVerification = {
      ...currentVerificationOptions,
      [key]: !currentVerificationOptions[key]
    };
    setPendingOtherConfig(prev => ({
      templateId: activeTemplate.id,
      scoreRuleId: prev?.templateId === activeTemplate.id && prev.scoreRuleId !== undefined ? prev.scoreRuleId : (activeTemplate.scoreRuleId),
      scoreTiming: prev?.templateId === activeTemplate.id && prev.scoreTiming !== undefined ? prev.scoreTiming : (activeTemplate.scoreTiming || '终审打分'),
      includeInEvaluation: prev?.templateId === activeTemplate.id && prev.includeInEvaluation !== undefined ? prev.includeInEvaluation : (activeTemplate.includeInEvaluation ?? true),
      auditFlowId: prev?.templateId === activeTemplate.id && prev.auditFlowId !== undefined ? prev.auditFlowId : (activeTemplate.auditFlowId),
      verificationOptions: nextVerification,
      adaptedRoles: prev?.templateId === activeTemplate.id && prev.adaptedRoles !== undefined ? prev.adaptedRoles : (activeTemplate.adaptedRoles || defaultAdaptedRoles)
    }));
  };

  // Update active template adapted roles (pending modification)
  const handleToggleAdaptedRole = (role: string) => {
    if (!activeTemplate) return;
    const nextRoles = currentAdaptedRoles.includes(role)
      ? currentAdaptedRoles.filter(r => r !== role)
      : [...currentAdaptedRoles, role];
    setPendingOtherConfig(prev => ({
      templateId: activeTemplate.id,
      scoreRuleId: prev?.templateId === activeTemplate.id && prev.scoreRuleId !== undefined ? prev.scoreRuleId : (activeTemplate.scoreRuleId),
      scoreTiming: prev?.templateId === activeTemplate.id && prev.scoreTiming !== undefined ? prev.scoreTiming : (activeTemplate.scoreTiming || '终审打分'),
      includeInEvaluation: prev?.templateId === activeTemplate.id && prev.includeInEvaluation !== undefined ? prev.includeInEvaluation : (activeTemplate.includeInEvaluation ?? true),
      auditFlowId: prev?.templateId === activeTemplate.id && prev.auditFlowId !== undefined ? prev.auditFlowId : (activeTemplate.auditFlowId),
      verificationOptions: prev?.templateId === activeTemplate.id && prev.verificationOptions !== undefined ? prev.verificationOptions : (activeTemplate.verificationOptions || defaultVerificationOptions),
      adaptedRoles: nextRoles
    }));
  };

  // Helper: Get icon for field type in mobile preview & designer (1:1 with design)
  const renderFieldIcon = (type: FieldControl) => {
    switch (type) {
      case 'textarea':
        return <AlignLeft className="w-3.5 h-3.5 text-[#1E5ABB]" />;
      case 'radio':
        return <CircleDot className="w-3.5 h-3.5 text-[#1E5ABB]" />;
      case 'checkbox':
        return <CheckSquare className="w-3.5 h-3.5 text-[#1E5ABB]" />;
      case 'multi_select':
        return <ListChecks className="w-3.5 h-3.5 text-[#1E5ABB]" />;
      case 'static_text':
        return <Info className="w-3.5 h-3.5 text-[#1E5ABB]" />;
      case 'text':
      case 'phone':
        return (
          <span className="inline-flex items-center justify-center w-3.5 h-3.5 text-[#1E5ABB] font-serif font-bold text-xs select-none">
            T
          </span>
        );
      case 'number':
      case 'id_card':
      case 'bank_card':
        return (
          <span className="inline-flex items-center justify-center w-3.5 h-3.5 text-[#1E5ABB] font-sans font-bold text-xs select-none">
            #
          </span>
        );
      case 'date':
        return <CalendarIcon className="w-3.5 h-3.5 text-[#1E5ABB]" />;
      case 'file':
        return <Paperclip className="w-3.5 h-3.5 text-[#1E5ABB]" />;
      case 'link':
        return <LinkIcon className="w-3.5 h-3.5 text-[#1E5ABB]" />;
      case 'select':
        return <ListFilter className="w-3.5 h-3.5 text-[#1E5ABB]" />;
      case 'identity':
      case 'gender':
        return <User className="w-3.5 h-3.5 text-[#1E5ABB]" />;
      default:
        return (
          <span className="inline-flex items-center justify-center w-3.5 h-3.5 text-[#1E5ABB] font-serif font-bold text-xs select-none">
            T
          </span>
        );
    }
  };

  // Interactive Form Preview Simulator Control Renderer (1:1 Restoration with Screenshot)
  const renderPhoneSimulator = (
    fields: TemplateFieldItem[],
    headerTitle: string,
    isActivation: boolean,
    onChangePcWidth?: (fieldId: string, width: PcFieldWidth | undefined) => void
  ) => {
    const isPc = previewDevice === 'pc';
    const titleText = headerTitle || (isActivation ? '账号激活' : '快速上报');
    const fieldBox = isPc ? 'py-2 bg-white rounded-lg text-xs' : 'py-2.5 bg-[#F7F9FC] rounded-xl text-[13px]';
    return (
      <div
        className={`w-full mx-auto transition-all ${
          isPc
            ? 'max-w-[720px]'
            : 'max-w-[460px] bg-white rounded-2xl border border-gray-200/90 p-3 shadow-2xs'
        }`}
      >
        {/* Inner Container */}
        <div
          className={`overflow-hidden flex flex-col ${
            isPc
              ? 'bg-white rounded-lg border border-gray-200 w-full max-w-[720px] mx-auto'
              : 'rounded-xl border bg-[#EEF2F7] border-slate-200/60'
          }`}
        >
          {isPc ? (
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3 select-none">
              <div className="min-w-0 flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800 truncate">{titleText}</span>
                {onChangePcWidth && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[11px] text-[#1E5ABB] shrink-0">
                    鼠标悬停字段，可切换整行 / 半行布局
                  </span>
                )}
              </div>
              <span className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </span>
            </div>
          ) : (
            <div className="bg-[#1E5ABB] text-white py-3 px-4 text-center select-none shadow-xs">
              <div className="font-bold text-sm tracking-wide">{titleText}</div>
            </div>
          )}

          <div className={isPc ? 'p-6 grid grid-cols-2 gap-x-5 gap-y-4 bg-white' : 'm-3 p-4 space-y-4 bg-white rounded-2xl border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)]'}>
            {/* Submission Result Notice */}
            {submittedSimulate && (
              <div className={`bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-800 animate-in fade-in slide-in-from-top-2 ${isPc ? 'col-span-2' : ''}`}>
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>模拟填报已成功提交！</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmittedSimulate(false)}
                  className="text-emerald-700 hover:underline text-[11px] font-medium cursor-pointer shrink-0 ml-1"
                >
                  继续模拟
                </button>
              </div>
            )}

            {fields.length === 0 ? (
              <div className={`py-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-dashed border-slate-200 ${isPc ? 'col-span-2' : ''}`}>
                请在左侧添加表单字段以实时预览
              </div>
            ) : (
              fields.map(field => {
                const currentValue = phoneFormValues[field.id];
                const selectedRole = phoneFormValues[`${field.id}_role`] || '超级管理员';
                const selectedGender = phoneFormValues[`${field.id}_gender`] || '男';
                const autoWideOnPc = isAutoWideOnPc(field);
                const isWideOnPc = field.pcWidth ? field.pcWidth === 'full' : autoWideOnPc;
                const canSetPcWidth = isPc && !!onChangePcWidth;

                return (
                  <div
                    key={field.id}
                    className={
                      isPc
                        ? `space-y-1.5 min-w-0 ${isWideOnPc ? 'col-span-2' : ''} ${
                            canSetPcWidth
                              ? 'relative group/pcw rounded-md outline-1 outline-dashed outline-offset-4 outline-transparent hover:outline-blue-300 transition-[outline-color]'
                              : ''
                          }`
                        : 'space-y-2'
                    }
                  >
                    {canSetPcWidth && (
                      <div className="absolute -top-1 right-0 z-10 flex items-center gap-1 opacity-0 pointer-events-none group-hover/pcw:opacity-100 group-hover/pcw:pointer-events-auto transition-opacity">
                        {field.pcWidth && (
                          <button
                            type="button"
                            onClick={() => onChangePcWidth(field.id, undefined)}
                            title="恢复按字段类型自动排布"
                            className="h-5 px-1.5 flex items-center gap-0.5 rounded border border-gray-200 bg-white text-[11px] text-gray-500 hover:text-[#1E5ABB] hover:border-blue-200 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            恢复自动
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const nextWide = !isWideOnPc;
                            onChangePcWidth(field.id, nextWide === autoWideOnPc ? undefined : nextWide ? 'full' : 'half');
                          }}
                          title="切换该字段在 PC 端占整行或半行，H5 端不受影响"
                          className="h-5 px-1.5 flex items-center gap-0.5 rounded border border-blue-200 bg-blue-50 text-[11px] font-medium text-[#1E5ABB] hover:bg-blue-100 cursor-pointer"
                        >
                          <MoveHorizontal className="w-3 h-3" />
                          {isWideOnPc ? '改为半行' : '改为整行'}
                        </button>
                      </div>
                    )}
                    {/* Card Header: Icon + Label + Asterisk */}
                    {field.type !== 'static_text' && (
                    <div className={`flex items-center gap-1.5 text-slate-800 font-bold ${isPc ? 'text-xs' : 'text-[13px]'}`}>
                      {isPc && renderFieldIcon(fieldControlOf(field))}
                      <span>{field.name}</span>
                      {field.required && <span className="text-rose-500 font-bold ml-0.5">*</span>}
                    </div>
                    )}

                    {/* Card Body by Field Type */}
                    {field.type === 'static_text' ? (
                      <div className="flex items-start gap-1.5 px-3 py-2 rounded-lg bg-blue-50/70 border border-blue-100 text-xs leading-5 text-[#1E5ABB]">
                        <Info className="w-3.5 h-3.5 mt-[3px] shrink-0" />
                        <span className="whitespace-pre-wrap break-words min-w-0">{field.placeholder || '提示文本内容'}</span>
                      </div>
                    ) : field.type === 'radio' || field.type === 'checkbox' ? (
                      (() => {
                        const isMulti = field.type === 'checkbox';
                        const picked: string[] = isMulti ? currentValue || [] : currentValue ? [currentValue] : [];
                        return (
                          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-0.5">
                            {(field.options?.length ? field.options : ['选项一', '选项二']).map((opt, oIdx) => {
                              const checked = picked.includes(opt);
                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={() => {
                                    setPhoneFormValues(prev => ({
                                      ...prev,
                                      [field.id]: isMulti
                                        ? checked
                                          ? picked.filter(p => p !== opt)
                                          : [...picked, opt]
                                        : opt
                                    }));
                                    setSubmittedSimulate(false);
                                  }}
                                  className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer"
                                >
                                  {isMulti ? (
                                    checked ? (
                                      <CheckSquare className="w-4 h-4 text-[#1E5ABB]" />
                                    ) : (
                                      <Square className="w-4 h-4 text-slate-300" />
                                    )
                                  ) : (
                                    <span
                                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                        checked ? 'border-[#1E5ABB]' : 'border-slate-300'
                                      }`}
                                    >
                                      {checked && <span className="w-2 h-2 rounded-full bg-[#1E5ABB]" />}
                                    </span>
                                  )}
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()
                    ) : field.type === 'multi_select' ? (
                      (() => {
                        const picked: string[] = currentValue || [];
                        const open = !!phoneFormValues[`${field.id}_open`];
                        const toggle = (opt: string) => {
                          setPhoneFormValues(prev => ({
                            ...prev,
                            [field.id]: picked.includes(opt) ? picked.filter(p => p !== opt) : [...picked, opt]
                          }));
                          setSubmittedSimulate(false);
                        };
                        return (
                          <div className="relative">
                            <div
                              onClick={() => setPhoneFormValues(prev => ({ ...prev, [`${field.id}_open`]: !open }))}
                              className={`relative min-h-[34px] w-full flex items-center gap-1.5 flex-wrap pl-2 pr-8 ${fieldBox} border cursor-pointer transition-colors ${
                                open ? 'border-[#1E5ABB]' : 'border-slate-200'
                              }`}
                            >
                              {picked.length === 0 ? (
                                <span className="pl-1 min-w-0 max-w-full truncate text-slate-400">{field.placeholder || '请选择（可多选）'}</span>
                              ) : (
                                picked.map(p => (
                                  <span
                                    key={p}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-[#1E5ABB] text-[11px]"
                                  >
                                    {p}
                                    <X
                                      className="w-3 h-3 cursor-pointer hover:text-rose-500"
                                      onClick={e => {
                                        e.stopPropagation();
                                        toggle(p);
                                      }}
                                    />
                                  </span>
                                ))
                              )}
                              <ChevronDown
                                className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800 transition-transform ${open ? 'rotate-180' : ''}`}
                              />
                            </div>
                            {open && (
                              <div className="mt-1 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                                {(field.options?.length ? field.options : ['选项一', '选项二']).map((opt, oIdx) => {
                                  const checked = picked.includes(opt);
                                  return (
                                    <button
                                      key={oIdx}
                                      type="button"
                                      onClick={() => toggle(opt)}
                                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer hover:bg-slate-50 ${
                                        checked ? 'text-[#1E5ABB] font-medium' : 'text-slate-700'
                                      }`}
                                    >
                                      <span>{opt}</span>
                                      {checked && <Check className="w-3.5 h-3.5" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()
                    ) : field.type === 'identity' ? (
                      <div className="flex flex-wrap gap-2 pt-0.5">
                        {(field.options && field.options.length > 0
                          ? field.options
                          : ['超级管理员', '机构管理员', '上报员', '审核员', '运营管理员', '临时审核员']
                        ).map((role, rIdx) => {
                          const isRoleSelected = selectedRole === role;
                          return (
                            <button
                              key={rIdx}
                              type="button"
                              onClick={() => {
                                setPhoneFormValues(prev => ({
                                  ...prev,
                                  [`${field.id}_role`]: role
                                }));
                                setSubmittedSimulate(false);
                              }}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                                isRoleSelected
                                  ? 'bg-blue-50/80 border-[#1E5ABB] text-[#1E5ABB] font-bold shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:text-[#1E5ABB]'
                              }`}
                            >
                              {role}
                            </button>
                          );
                        })}
                      </div>
                    ) : field.type === 'gender' ? (
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        {['男', '女'].map(g => {
                          const isGenderSelected = selectedGender === g;
                          return (
                            <button
                              key={g}
                              type="button"
                              onClick={() => {
                                setPhoneFormValues(prev => ({
                                  ...prev,
                                  [`${field.id}_gender`]: g
                                }));
                                setSubmittedSimulate(false);
                              }}
                              className={`py-2 text-center rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                                isGenderSelected
                                  ? 'bg-blue-50/80 border-[#1E5ABB] text-[#1E5ABB] font-bold shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:text-[#1E5ABB]'
                              }`}
                            >
                              {g}
                            </button>
                          );
                        })}
                      </div>
                    ) : field.type === 'file' ? (
                      <div
                        onClick={() => showToast('已模拟唤起文件选择器')}
                        className="border border-dashed border-slate-300 bg-white rounded-xl p-5 text-center flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer hover:border-blue-400 group"
                      >
                        <Paperclip className="w-7 h-7 text-slate-400 -rotate-45 group-hover:text-[#1E5ABB] transition-colors stroke-[1.5]" />
                        <span className="text-xs font-medium text-slate-700">
                          上传图片、视频或证明材料
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {field.placeholder || '支持图片、视频、PDF证明文档'}
                        </span>
                      </div>
                    ) : field.type === 'date' ? (
                      <div className={`flex items-center justify-between px-3 ${fieldBox} border border-slate-200 text-slate-400`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <CalendarIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{currentValue || field.placeholder || '年 /月/日 --:--'}</span>
                        </div>
                        <CalendarIcon className="w-3.5 h-3.5 shrink-0 ml-2 text-slate-700" />
                      </div>
                    ) : field.type === 'select' ? (
                      <div className="relative">
                        <select
                          value={currentValue ?? ''}
                          onChange={e => {
                            setPhoneFormValues(prev => ({
                              ...prev,
                              [field.id]: e.target.value
                            }));
                            setSubmittedSimulate(false);
                          }}
                          className={`w-full appearance-none px-3 ${fieldBox} border border-slate-200 text-slate-700 focus:outline-none focus:border-[#1E5ABB] transition-colors pr-8 cursor-pointer`}
                        >
                          <option value="" disabled hidden>
                            {field.placeholder || '请选择'}
                          </option>
                          {(field.options && field.options.length > 0
                            ? field.options
                            : ['重大突发', '网络舆情', '安全隐患', '民生诉求', '日常报送']
                          ).map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none text-slate-700">
                          <ChevronDown className="w-4 h-4 text-slate-800" />
                        </div>
                      </div>
                    ) : field.type === 'link' ? (
                      (() => {
                        const linkValue = String(currentValue ?? '').trim();
                        const linkValid = linkValue !== '' && isValidLinkUrl(linkValue);
                        const linkInvalid = linkValue !== '' && !linkValid;
                        const shot = linkShots[field.id];
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1 min-w-0">
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                  <LinkIcon className={`w-3.5 h-3.5 ${linkInvalid ? 'text-rose-400' : 'text-slate-400'}`} />
                                </div>
                                <input
                                  type="url"
                                  value={currentValue ?? ''}
                                  onChange={e => {
                                    setPhoneFormValues(prev => ({
                                      ...prev,
                                      [field.id]: e.target.value
                                    }));
                                    removeLinkShot(field.id);
                                    setSubmittedSimulate(false);
                                  }}
                                  placeholder={field.placeholder || 'https://...'}
                                  className={`w-full pl-8 pr-3 ${fieldBox} border text-slate-700 placeholder:text-slate-400 focus:outline-none transition-colors ${
                                    linkInvalid ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-[#1E5ABB]'
                                  }`}
                                />
                              </div>
                              {shot?.status !== 'done' && (
                                <button
                                  type="button"
                                  disabled={shot?.status === 'loading'}
                                  onClick={() => {
                                    if (!linkValue) {
                                      setLinkShots(prev => ({ ...prev, [field.id]: { status: 'empty', url: '' } }));
                                      return;
                                    }
                                    if (linkInvalid) {
                                      setLinkShots(prev => ({ ...prev, [field.id]: { status: 'invalid', url: linkValue } }));
                                      return;
                                    }
                                    captureLinkShot(field.id, linkValue);
                                  }}
                                  className="shrink-0 self-stretch px-3 flex items-center gap-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer border-[#1E5ABB] text-[#1E5ABB] bg-white hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 disabled:bg-slate-50"
                                >
                                  {shot?.status === 'loading' ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      <span>截图中</span>
                                    </>
                                  ) : (
                                    <>
                                      <Camera className="w-3.5 h-3.5" />
                                      <span>截图</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>

                            {linkInvalid &&
                              (shot?.status === 'invalid' ? (
                                <p className="flex items-center gap-1 text-[11px] text-rose-500">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span>网址格式不正确，无法截图，请修改为以 http:// 或 https:// 开头的正确网址</span>
                                </p>
                              ) : (
                                <p className="text-[11px] text-rose-500">请输入正确的网址，需以 http:// 或 https:// 开头</p>
                              ))}

                            {shot?.status === 'empty' && !linkValue && (
                              <p className="flex items-center gap-1 text-[11px] text-amber-600">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>原文地址为空，请先输入原文链接再截图</span>
                              </p>
                            )}

                            {shot?.status === 'error' && (
                              <div className="flex items-start justify-between gap-2 px-2.5 py-2 rounded-lg bg-rose-50 border border-rose-100 text-[11px] text-rose-600">
                                <div className="flex items-start gap-1.5 min-w-0">
                                  <AlertCircle className="w-3.5 h-3.5 mt-px shrink-0" />
                                  <div className="min-w-0">
                                    <div className="font-medium">原文地址不可访问</div>
                                    {shot.reason && <div className="truncate text-rose-500/90">访问反馈：{shot.reason}</div>}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => captureLinkShot(field.id, linkValue)}
                                  className="shrink-0 font-medium hover:underline cursor-pointer"
                                >
                                  重试
                                </button>
                              </div>
                            )}

                            {shot?.status === 'done' && (
                              <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-50 border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => setLinkShotViewer({ url: shot.url, shotAt: shot.shotAt })}
                                  className="w-28 h-[72px] shrink-0 rounded-md overflow-hidden border border-slate-200 cursor-zoom-in hover:border-[#1E5ABB] transition-colors"
                                  title="查看原图"
                                >
                                  {renderLinkShotMock(shot.url)}
                                </button>
                                <div className="flex-1 min-w-0 space-y-1.5">
                                  <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>已截取原文</span>
                                  </div>
                                  <div className="text-[11px] text-slate-400">{shot.shotAt}</div>
                                  <div className="flex items-center gap-3 text-[11px]">
                                    <button
                                      type="button"
                                      onClick={() => captureLinkShot(field.id, shot.url)}
                                      className="flex items-center gap-0.5 text-[#1E5ABB] hover:underline cursor-pointer"
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                      <span>重新截图</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeLinkShot(field.id)}
                                      className="flex items-center gap-0.5 text-slate-500 hover:text-rose-500 cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>删除</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()
                    ) : field.type === 'number' ? (
                      <input
                        type="number"
                        value={currentValue ?? ''}
                        onChange={e => {
                          setPhoneFormValues(prev => ({
                            ...prev,
                            [field.id]: e.target.value
                          }));
                          setSubmittedSimulate(false);
                        }}
                        placeholder={field.placeholder || '请输入传播量/阅读量等数据'}
                        className={`w-full px-3 ${fieldBox} border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1E5ABB] transition-colors`}
                      />
                    ) : (
                      (() => {
                        const isTextarea = field.multiline || (field.id === 'fixed_event_detail' && field.locked === undefined);
                        const limit = field.type === 'text' && isValidMaxLength(field.maxLength) ? field.maxLength : undefined;
                        const textValue = String(currentValue ?? '');
                        const counter = limit !== undefined && (
                          <span
                            className={`pointer-events-none absolute right-3 text-[11px] ${isTextarea ? 'bottom-2' : 'top-1/2 -translate-y-1/2'} ${
                              textValue.length >= limit ? 'text-rose-500' : 'text-slate-400'
                            }`}
                          >
                            {textValue.length}/{limit}
                          </span>
                        );
                        const handleTextChange = (value: string) => {
                          setPhoneFormValues(prev => ({ ...prev, [field.id]: value }));
                          setSubmittedSimulate(false);
                        };
                        return (
                          <div className="relative">
                            {isTextarea ? (
                              <textarea
                                rows={3}
                                value={textValue}
                                maxLength={limit}
                                onChange={e => handleTextChange(e.target.value)}
                                placeholder={field.placeholder || '请输入上报内容描述'}
                                className={`w-full px-3 ${limit !== undefined ? 'pb-6' : ''} ${fieldBox} border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1E5ABB] transition-colors resize-none`}
                              />
                            ) : (
                              <input
                                type="text"
                                value={textValue}
                                maxLength={limit}
                                onChange={e => handleTextChange(e.target.value)}
                                placeholder={field.placeholder || `请输入${field.name}`}
                                className={`w-full pl-3 ${limit !== undefined ? 'pr-16' : 'pr-3'} ${fieldBox} border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1E5ABB] transition-colors`}
                              />
                            )}
                            {counter}
                          </div>
                        );
                      })()
                    )}
                  </div>
                );
              })
            )}
          </div>

          {!isPc && (
            <div className="px-3.5 py-3 border-t border-slate-200/80 bg-white grid grid-cols-2 gap-2.5">
              <button type="button" className="py-2.5 text-xs border border-gray-300 rounded-lg text-gray-600 bg-white font-bold cursor-default">
                取消
              </button>
              <button type="button" className="py-2.5 text-xs rounded-lg bg-[#1E5ABB] text-white font-bold cursor-default">
                提交审核
              </button>
            </div>
          )}

          {isPc && (
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button type="button" className="px-4 py-1.5 text-xs border border-gray-300 rounded text-gray-600 bg-white cursor-default">
                取消
              </button>
              <button type="button" className="px-4 py-1.5 text-xs rounded bg-[#1E5ABB] text-white font-bold cursor-default">
                提交审核
              </button>
            </div>
          )}
        </div>

        {linkShotViewer && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6"
            onClick={() => setLinkShotViewer(null)}
          >
            <div
              className="w-full max-w-[640px] bg-white rounded-xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-gray-800">原文截图</div>
                  <div className="text-[11px] text-gray-400 truncate">
                    {linkShotViewer.url}
                    {linkShotViewer.shotAt ? ` · ${linkShotViewer.shotAt}` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLinkShotViewer(null)}
                  className="w-7 h-7 shrink-0 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 bg-gray-50">
                <div className="h-[380px] rounded-lg overflow-hidden border border-gray-200">
                  {renderLinkShotMock(linkShotViewer.url, true)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const changePreviewDevice = (device: 'h5' | 'pc') => {
    setPreviewDevice(device);
    try {
      localStorage.setItem('mt_template_preview_device', device);
    } catch {
      // ignore storage failures
    }
  };

  const renderPreviewDeviceToggle = () => (
    <div className="inline-flex items-center rounded-md border border-gray-200 bg-white p-0.5">
      {([
        { id: 'h5', label: 'H5', icon: Smartphone },
        { id: 'pc', label: 'PC', icon: Monitor },
      ] as const).map(option => {
        const active = previewDevice === option.id;
        const OptionIcon = option.icon;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => changePreviewDevice(option.id)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
              active ? 'bg-[#1E5ABB] text-white' : 'text-gray-500 hover:text-[#1E5ABB]'
            }`}
          >
            <OptionIcon className="w-3.5 h-3.5" />
            {option.label}
          </button>
        );
      })}
    </div>
  );

  // =========================================================================
  // VIEW B: Full Designer View (Screenshots 3 & 4)
  // =========================================================================
  if (designerItem) {
    const isActivation = designerItem.template.templateType === '激活';

    return (
      <div className="bg-white space-y-7">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={handleLeaveDesigner}
              className="flex items-center gap-1 shrink-0 text-xs text-gray-500 hover:text-[#1890ff] transition-colors cursor-pointer"
              title="返回模板列表"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回</span>
            </button>
            <span className="w-px h-3.5 bg-gray-200 shrink-0" />
            <span className="text-[15px] font-bold text-gray-900 truncate">
              {designerItem.mode === 'add' ? '新增模板' : designerName || '编辑模板'}
            </span>
            <span className="shrink-0 px-2 py-0.5 rounded bg-blue-50 text-[#1890ff] text-[11px] font-medium">
              {isActivation ? '激活模板' : '报送模板'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleLeaveDesigner}
              className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSaveDesigner}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1890ff] hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>保存模板配置</span>
            </button>
          </div>
        </div>

        {/* Section 1: 基本属性设置 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
            <span className="w-1 h-3.5 rounded-full bg-[#1890ff]" />
            <span>基本属性设置</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                模板名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={designerName}
                onChange={e => setDesignerName(e.target.value)}
                placeholder={isActivation ? '例如：重点应急目标快速激活' : '例如：重大突发事件应急处置报送'}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-blue-100 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                说明描述
              </label>
              <input
                type="text"
                value={designerDesc}
                onChange={e => setDesignerDesc(e.target.value)}
                placeholder="请输入适用业务场景与填报说明..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-blue-100 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: 表单字段设计与用户端交互预览 */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-gray-800 font-bold text-sm flex items-center gap-2">
                <span className="w-1 h-3.5 rounded-full bg-[#1890ff]" />
                <span>表单字段设计与用户端交互预览</span>
              </span>
            </div>
            <span className="text-xs text-gray-400">
              左侧自由调整表单字段，右侧实时体验上报用户的填报界面
            </span>
          </div>

          {/* 2-Column Split: Left Editor, Right Live Phone Mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Field Editor */}
            <div className="lg:col-span-7 flex flex-col bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                  <span>已配置字段</span>
                  <span className="text-[11px] font-medium text-gray-400">{designerFields.length}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const standard = presetSource.find(
                      t => t.isPreset && t.status === '启用' && t.templateType === designerItem.template.templateType
                    );
                    if (standard) {
                      const stamp = Date.now();
                      const copied = standard.fields.map((f, index) =>
                        isLockedField(f) ? { ...f } : { ...f, id: `fld_${stamp}_${index}` }
                      );
                      setDesignerFields(isActivation ? copied : applyFixedFieldRule(copied, institutionId));
                      showToast(`已调用标准模板「${standard.name}」的字段`);
                      return;
                    }
                    setDesignerFields(
                      isActivation ? [...standardActivationFields] : applyFixedFieldRule(standardReportFields, institutionId)
                    );
                    showToast('平台暂未设置标准模板，已使用系统默认字段');
                  }}
                  className="flex items-center gap-1.5 text-xs text-[#1E5ABB] hover:bg-blue-50 font-medium px-2 py-1 rounded-md transition-colors cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>使用标准模板</span>
                </button>
              </div>

              {/* Field Rows */}
              <div className="mt-3 space-y-2">
                {designerFields.map((field, idx) => {
                  const isFixed = isLockedField(field);
                  return (
                  <div
                    key={field.id}
                    draggable={!isFixed}
                    onDragStart={e => {
                      setDraggingFieldIndex(idx);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={e => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={() => handleDropDesignerField(idx)}
                    onDragEnd={() => setDraggingFieldIndex(null)}
                    className={`group flex items-start gap-2.5 py-3 px-3 rounded-lg transition-shadow ${
                      draggingFieldIndex === idx ? 'bg-blue-50 opacity-60' : 'bg-white hover:shadow-sm'
                    }`}
                  >
                    {isFixed ? (
                      <div
                        className="mt-1.5 w-8 h-6 flex items-center justify-center gap-0.5 rounded-md bg-gray-50 text-gray-400 font-mono text-[11px] select-none shrink-0 cursor-not-allowed"
                        title="固定字段，不可调整排序"
                      >
                        <Lock className="w-3 h-3" />
                        <span>{idx + 1}</span>
                      </div>
                    ) : (
                      <div
                        className="mt-1.5 w-8 h-6 flex items-center justify-center gap-0.5 rounded-md bg-gray-50 text-gray-400 font-mono text-[11px] select-none shrink-0 cursor-grab active:cursor-grabbing hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="按住拖拽以调整字段排序"
                      >
                        <ArrowUpDown className="w-3 h-3" />
                        <span>{idx + 1}</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-2">
                    {/* Row 1: Label & Type */}
                    <div className="flex items-center gap-2">
                      {field.type === 'static_text' ? (
                        <span className="flex-1 min-w-0 text-[12px] text-gray-400">仅展示下方文本内容，不显示标题</span>
                      ) : (
                      <div className="relative flex-1 min-w-0">
                        <input
                          type="text"
                          value={field.name}
                          onChange={e => {
                            const nextName = e.target.value;
                            setDesignerFields(
                              designerFields.map(f => (f.id === field.id ? { ...f, name: nextName } : f))
                            );
                          }}
                          placeholder="字段标题"
                          className="w-full px-3 py-2 border border-gray-200 rounded-md text-[13px] font-medium focus:outline-none bg-white text-gray-800 hover:border-gray-300 focus:border-[#1890ff]"
                        />
                      </div>
                      )}

                      {/* Field Type Chip */}
                      {(() => {
                        const typeOptions = getFieldTypeOptions(designerItem.template.templateType);
                        const control = fieldControlOf(field);
                        const typeLabel = typeOptions.find(opt => opt.value === control)?.label ?? control;
                        return (
                          <div
                            className={`relative shrink-0 w-[142px] inline-flex items-center gap-1.5 py-2 px-2.5 rounded-md border text-[13px] font-medium transition-colors ${
                              isFixed
                                ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 focus-within:border-[#1890ff]'
                            }`}
                            title={isFixed ? '系统固定字段，类型不可修改' : '点击切换字段类型'}
                          >
                            <span className="flex items-center [&_svg]:w-3.5 [&_svg]:h-3.5">{renderFieldIcon(control)}</span>
                            <span className="flex-1 min-w-0 truncate">{typeLabel}</span>
                            {!isFixed && <ChevronDown className="w-3 h-3 shrink-0 opacity-60" />}
                            <select
                              value={control}
                              onChange={e => {
                                const nextControl = e.target.value as FieldControl;
                                setDesignerFields(
                                  designerFields.map(f => (f.id === field.id ? changeFieldControl(f, nextControl) : f))
                                );
                              }}
                              disabled={isFixed}
                              aria-label="字段类型"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            >
                              {typeOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Row 2: Placeholder Input */}
                    {field.type === 'static_text' ? (
                      <textarea
                        rows={2}
                        value={field.placeholder || ''}
                        onChange={e => {
                          const nextPh = e.target.value;
                          setDesignerFields(
                            designerFields.map(f => (f.id === field.id ? { ...f, placeholder: nextPh } : f))
                          );
                        }}
                        placeholder="设置展示给填报人的提示文本内容..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-[13px] text-gray-600 bg-gray-50/70 resize-none hover:border-gray-300 focus:outline-none focus:border-[#1890ff] focus:bg-white focus:text-gray-700"
                      />
                    ) : (
                    <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={e => {
                        const nextPh = e.target.value;
                        setDesignerFields(
                          designerFields.map(f =>
                            f.id === field.id ? { ...f, placeholder: nextPh } : f
                          )
                        );
                      }}
                      placeholder="设置填报提示引导词 (Placeholder)..."
                      className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-md text-[13px] text-gray-500 bg-gray-50/70 focus:outline-none hover:border-gray-300 focus:border-[#1890ff] focus:bg-white focus:text-gray-700"
                    />
                    {field.type === 'text' && (
                      <label
                        className={`w-[142px] shrink-0 flex items-center gap-1 px-2.5 py-2 border rounded-md text-[13px] ${
                          !isValidMaxLength(field.maxLength)
                            ? 'border-rose-300 bg-white text-gray-500'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 focus-within:border-[#1890ff]'
                        }`}
                        title={`填报内容的最大字数，留空表示不限制（1–${TEXT_MAX_LENGTH_LIMIT}）`}
                      >
                        <span className="shrink-0">最多</span>
                        <input
                          type="number"
                          min={1}
                          max={TEXT_MAX_LENGTH_LIMIT}
                          value={field.maxLength ?? ''}
                          onChange={e => {
                            const next = parseMaxLengthInput(e.target.value);
                            setDesignerFields(
                              designerFields.map(f => (f.id === field.id ? { ...f, maxLength: next } : f))
                            );
                          }}
                          placeholder="不限"
                          className="w-full min-w-0 text-center bg-transparent focus:outline-none text-gray-800 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <span className="shrink-0">字</span>
                      </label>
                    )}
                    </div>
                    )}

                    {/* Sub-box: Options for radio / checkbox / dropdown fields */}
                    {OPTION_FIELD_TYPES.includes(field.type) && (
                      <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 space-y-2">
                        <div className="text-xs font-bold text-[#1890ff]">选择项配置</div>
                        <div className="space-y-2">
                          {(field.options || []).map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={opt}
                                onChange={e => {
                                  const nextOpts = [...(field.options || [])];
                                  nextOpts[optIdx] = e.target.value;
                                  setDesignerFields(
                                    designerFields.map(f =>
                                      f.id === field.id ? { ...f, options: nextOpts } : f
                                    )
                                  );
                                }}
                                className="flex-1 px-3 py-1.5 text-[13px] text-gray-700 border border-gray-200 rounded-md bg-white hover:border-gray-300 focus:outline-none focus:border-[#1890ff]"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const nextOpts = (field.options || []).filter((_, i) => i !== optIdx);
                                  setDesignerFields(
                                    designerFields.map(f =>
                                      f.id === field.id ? { ...f, options: nextOpts } : f
                                    )
                                  );
                                }}
                                className="text-gray-400 hover:text-rose-600 p-1.5 cursor-pointer"
                                title="删除该选项"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const nextOpts = [...(field.options || []), `新选项 ${(field.options || []).length + 1}`];
                              setDesignerFields(
                                designerFields.map(f =>
                                  f.id === field.id ? { ...f, options: nextOpts } : f
                                )
                              );
                            }}
                            className="px-2.5 py-1 text-xs text-[#1890ff] font-bold bg-white border border-blue-200 hover:bg-blue-50 rounded-md inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>新增选项</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Sub-box: Role tags for Identity field */}
                    {field.type === 'identity' && (
                      <div className="pt-1 space-y-1.5">
                        <div className="text-[11px] font-medium text-gray-400">角色列表 (可多选)</div>
                        <div className="flex flex-wrap gap-1.5">
                          {['超级管理员', '机构管理员', '上报员', '审核员', '运营管理员', '临时审核员'].map(r => (
                            <span
                              key={r}
                              className="px-2.5 py-1 rounded bg-[#1890ff] text-white text-[11px] font-medium"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    </div>

                    <div className="flex flex-col items-center gap-2 shrink-0 pt-1">
                      {field.type === 'static_text' ? (
                        <span
                          className="w-7 h-7 rounded-md border border-dashed border-gray-200 text-[11px] text-gray-300 flex items-center justify-center cursor-not-allowed"
                          title="静态提示文本仅作展示，无需填写"
                        >
                          —
                        </span>
                      ) : isRequiredLockedField(field) ? (
                        <span
                          className="w-7 h-7 rounded-md border text-xs font-bold flex items-center justify-center cursor-not-allowed bg-rose-50 text-rose-400 border-rose-100"
                          title="单行文本固定字段默认必填，不可修改"
                        >
                          必
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setDesignerFields(
                              designerFields.map(f =>
                                f.id === field.id ? { ...f, required: !f.required } : f
                              )
                            );
                          }}
                          className={`w-7 h-7 rounded-md border text-xs font-bold transition-colors cursor-pointer ${
                            field.required
                              ? 'bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-100'
                              : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                          }`}
                          title={field.required ? '必填项 (点击改为选填)' : '选填项 (点击改为必填)'}
                        >
                          {field.required ? '必' : '选'}
                        </button>
                      )}
                      {isFixed ? (
                        <span
                          className="p-1 text-gray-300 cursor-not-allowed"
                          title="固定字段不可删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (designerFields.length <= 1) {
                              alertDialog('模板至少需要保留一个表单字段');
                              return;
                            }
                            setDesignerFields(designerFields.filter(f => f.id !== field.id));
                          }}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="删除该字段"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* Add Field Button */}
              <button
                type="button"
                onClick={handleAddField}
                className="w-full mt-2 py-2.5 border border-dashed border-blue-300 bg-white/60 hover:bg-blue-50/60 hover:border-[#1890ff] text-[#1E5ABB] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>添加字段</span>
              </button>
            </div>

            {/* Right Column: Live Form Mockup (1:1 Restoration with Screenshot) */}
            <div className="lg:col-span-5 bg-gray-50 rounded-xl p-4 lg:sticky lg:top-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                  <Eye className="w-3.5 h-3.5 text-[#1E5ABB]" />
                  <span>用户填报界面实时交互预览</span>
                  {renderPreviewDeviceToggle()}
                </div>
                <span className="text-[11px] text-gray-400">
                  {isActivation ? '激活填报模式' : '报送填报模式'}
                </span>
              </div>

              {/* Phone Mockup 1:1 Restoration */}
              {renderPhoneSimulator(
                designerFields,
                isActivation ? '账号激活' : designerName || '快速上报',
                isActivation,
                (fieldId, width) =>
                  setDesignerFields(prev => prev.map(f => (f.id === fieldId ? { ...f, pcWidth: width } : f)))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW A: 3-Column Main Dashboard (Screenshots 1 & 2)
  // =========================================================================
  const isActivationMode = topTab === '激活';

  return (
    <div className="space-y-4">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {titleMode !== 'hidden' && (
        <div
          className={`flex items-center justify-between gap-3 ${
            titleMode === 'card' ? 'bg-white px-5 py-4 rounded-lg border border-gray-200/80 shadow-2xs' : ''
          }`}
        >
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-gray-800">模板配置</h3>
            {isGlobalScope && (
              <ControlNoticeTip
                title="全平台系统默认模板管控说明"
                content={`此处新建的${topTab}模板为全平台所有机构初始化的系统默认模板。机构端仅支持启用、停用，不支持编辑和删除；如需个性化，机构可另建自定义模板。`}
              />
            )}
          </div>
          <div className="flex items-center gap-3">
            {titleExtra}
            <button
              type="button"
              onClick={() => handleOpenDesigner('add')}
              className="px-3.5 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold rounded shadow-2xs flex items-center gap-1 cursor-pointer whitespace-nowrap"
              title={isActivationMode ? '新增激活模板' : '新增报送模板'}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增</span>
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* UNIFIED 3-COLUMN WORKBENCH CONTAINER (Figma / Axure Prototype)    */}
      {/* ================================================================= */}
      <div
        ref={workbenchRef}
        className={`bg-white rounded-xl border border-gray-200/80 shadow-2xs flex flex-col lg:flex-row min-h-[760px] overflow-hidden ${
          resizingSide ? 'select-none' : ''
        }`}
      >
        <style>{`
          @media (min-width: 1024px) {
            .tpl-board-col-left { width: ${leftColWidth}px !important; max-width: ${leftColWidth}px !important; }
            .tpl-board-col-right { width: ${rightColWidth}px !important; max-width: ${rightColWidth}px !important; }
          }
        `}</style>

        {/* ================================================================= */}
        {/* COLUMN 1: 模板目录 (Left Column, ~260px) */}
        {/* ================================================================= */}
        <div className="tpl-board-col-left w-full shrink-0 border-b lg:border-b-0 flex flex-col bg-white">
          {/* Header */}
          <div className="h-[52px] px-3.5 border-b border-gray-200/80 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#1890ff]" />
              <span className="text-xs font-bold text-gray-800">模板目录</span>
              <span className="w-4.5 h-4.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-medium flex items-center justify-center border border-gray-200">
                {currentCategoryTemplates.length}
              </span>
            </div>
            {titleMode === 'hidden' && (
              <button
                type="button"
                onClick={() => handleOpenDesigner('add')}
                className="w-6 h-6 rounded-md flex items-center justify-center text-[#1890ff] hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors cursor-pointer"
                title={isActivationMode ? '新增激活模板' : '新增报送模板'}
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Template Cards List */}
          <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto bg-white">
            {showPresetTip && (
              <div className="flex items-start gap-1.5 px-2.5 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] leading-[18px] text-amber-700">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span className="flex-1 min-w-0">
                  尚未设置标准模板，请在模板预览区点击「设为标准模板」。
                </span>
                <button
                  type="button"
                  onClick={() => setPresetTipClosed(true)}
                  title="关闭提示"
                  className="w-4 h-4 mt-px shrink-0 rounded flex items-center justify-center text-amber-500 hover:text-amber-700 hover:bg-amber-100 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {visibleTemplates.length === 0 && (
              <div className="py-10 text-center text-[11px] text-gray-400 border border-dashed border-gray-200 rounded-xl">
                暂无{topTab}模板
              </div>
            )}
            {visibleTemplates.map(tpl => {
              const isSelected = activeTemplate?.id === tpl.id;
              const isEnabled = tpl.status === '启用';
              const canDelete = isGlobalScope || !tpl.isDefault;

              return (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className={`rounded-xl border p-3 space-y-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#1890ff] bg-blue-50/20 shadow-xs'
                      : 'border-gray-200/90 hover:border-blue-200 bg-white'
                  }`}
                >
                  {/* Row 1: Title & Status Switch */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 text-xs font-bold text-gray-900 truncate" title={tpl.name}>
                      {tpl.name}
                    </span>

                    {/* Enable Toggle Switch */}
                    <button
                      type="button"
                      onClick={e => handleToggleTemplateStatus(tpl.id, e)}
                      className={`flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap pl-2 pr-1 py-0.5 rounded-full border transition-colors ${
                        isEnabled ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'
                      }`}
                      title={isEnabled ? '点击停用' : '点击启用'}
                    >
                      <span className={`text-[11px] font-bold ${isEnabled ? 'text-emerald-700' : 'text-gray-500'}`}>
                        {isEnabled ? '启用' : '停用'}
                      </span>
                      <div
                        className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                          isEnabled ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'
                        }`}
                      >
                        <div className="w-3 h-3 bg-white rounded-full shadow-2xs" />
                      </div>
                    </button>
                  </div>

                  {/* Row 2: Tag (系统默认/自定义) & Update Time */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {!isGlobalScope && (
                      tpl.isDefault ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded border border-gray-200 shrink-0 whitespace-nowrap">
                          <Lock className="w-2.5 h-2.5 text-gray-400" />
                          系统默认
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200 shrink-0 whitespace-nowrap">
                          <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                          自定义
                        </span>
                      )
                    )}
                    {isGlobalScope && tpl.isPreset && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded border border-amber-200 shrink-0 whitespace-nowrap">
                        <Award className="w-2.5 h-2.5 text-amber-500" />
                        标准模板
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 font-mono">
                      {tpl.updateTime}
                    </span>
                  </div>

                  {/* Row 3: Description */}
                  <div>
                    <p className="text-[11px] text-gray-500 line-clamp-1 leading-relaxed" title={tpl.description}>
                      {tpl.description || '暂无描述信息'}
                    </p>
                  </div>

                  {/* Row 4: Footer Actions */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    {isSelected ? (
                      <span className="text-[#1890ff] text-[11px] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1890ff]" />
                        <span>正在预览</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[11px] hover:text-gray-600 transition-colors">
                        点击预览
                      </span>
                    )}

                    <div className="flex items-center gap-2 text-gray-500">
                      {(isGlobalScope || !tpl.isDefault) && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleOpenDesigner('edit', tpl);
                          }}
                          className="hover:text-[#1890ff] flex items-center gap-0.5 text-[11px] cursor-pointer"
                          title="编辑模板"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>编辑</span>
                        </button>
                      )}
                      {!isGlobalScope && tpl.isDefault && (
                        <span
                          className="p-0.5 text-gray-300 select-none inline-flex items-center"
                          title="系统默认"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}

                      <div className="relative">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setMoreMenuId(moreMenuId === tpl.id ? null : tpl.id);
                          }}
                          className={`p-0.5 rounded hover:text-[#1890ff] hover:bg-blue-50 cursor-pointer ${moreMenuId === tpl.id ? 'text-[#1890ff] bg-blue-50' : ''}`}
                          title="更多操作"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                        {moreMenuId === tpl.id && (
                          <div
                            className="absolute right-0 top-full mt-1 z-20 w-32 py-1 bg-white rounded-lg border border-gray-200 shadow-lg text-[11px]"
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={e => {
                                setMoreMenuId(null);
                                handleCopyTemplate(tpl, e);
                              }}
                              className="w-full flex items-center gap-1.5 px-3 py-1.5 text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              复制为新模板
                            </button>
                            {isGlobalScope && (
                              <button
                                type="button"
                                onClick={e => {
                                  setMoreMenuId(null);
                                  handleTogglePreset(tpl.id, e);
                                }}
                                className="w-full flex items-center gap-1.5 px-3 py-1.5 text-gray-700 hover:bg-amber-50 hover:text-amber-700 cursor-pointer"
                              >
                                <Award className="w-3 h-3" />
                                {tpl.isPreset ? '取消标准模板' : '设为标准模板'}
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={e => {
                                  setMoreMenuId(null);
                                  handleDeleteTemplate(tpl.id, e);
                                }}
                                className="w-full flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:bg-rose-50 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                删除
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resize handle: left | center */}
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

        {/* ================================================================= */}
        {/* COLUMN 2: 移动端填报实时模拟 (Center Column, flex-1) */}
        {/* ================================================================= */}
        <div className="flex-1 min-w-0 flex flex-col bg-white lg:min-w-[320px]">
          {/* Top Info Header */}
          <div className="h-[52px] px-4 border-b border-gray-200/80 flex items-center justify-between shrink-0 bg-white gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-xs font-bold text-gray-800 truncate">
                当前预览: {activeTemplate?.name}
              </span>
              <span
                className={`px-1.5 py-0.2 text-[10px] font-bold rounded border shrink-0 ${
                  activeTemplate?.status === '启用'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}
              >
                {activeTemplate?.status}
              </span>
              {!isGlobalScope && activeTemplate?.isDefault && (
                <span className="px-1.5 py-0.2 bg-gray-100 text-gray-600 text-[10px] font-bold rounded border border-gray-200 shrink-0">
                  系统默认
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
            {isGlobalScope && activeTemplate && (
              <button
                type="button"
                onClick={() => handleTogglePreset(activeTemplate.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  activeTemplate.isPreset
                    ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700'
                }`}
                title={
                  activeTemplate.isPreset
                    ? '取消后，新增模板时不再提供复用'
                    : `每类模板只能有一个标准模板，设置后将替换当前的${topTab}标准模板`
                }
              >
                <Award className="w-3.5 h-3.5" />
                <span>{activeTemplate.isPreset ? '已设为标准模板' : '设为标准模板'}</span>
              </button>
            )}

            {(isGlobalScope || !activeTemplate?.isDefault) && (
              <button
                type="button"
                onClick={() => handleOpenDesigner('edit', activeTemplate)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1890ff] hover:bg-blue-600 text-white rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer shrink-0"
                title="编辑当前模板"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>编辑</span>
              </button>
            )}
            </div>
          </div>

          {/* Center Body: Preview Area */}
          <div className="p-4 flex-1 flex flex-col bg-[#F8FAFC]/60 overflow-y-auto">
            {/* Sub-header */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3 shrink-0">
              <div className="flex items-center gap-2 font-bold text-gray-700">
                {previewDevice === 'pc' ? (
                  <Monitor className="w-3.5 h-3.5 text-[#1890ff]" />
                ) : (
                  <Smartphone className="w-3.5 h-3.5 text-[#1890ff]" />
                )}
                <span>{previewDevice === 'pc' ? 'PC 端填报实时模拟' : '移动端填报实时模拟'}</span>
                {renderPreviewDeviceToggle()}
              </div>
              <span className="text-[11px] text-gray-400">
                共 {activeTemplate?.fields.length || 0} 个表单项 · 可直接体验输入
              </span>
            </div>

            {/* Phone Mockup in Center */}
            <div className="flex-1 flex items-start justify-center pb-2">
              {renderPhoneSimulator(
                activeTemplate?.fields || [],
                isActivationMode ? '账号激活' : activeTemplate?.name || '快速上报',
                isActivationMode
              )}
            </div>
          </div>
        </div>

        {/* Resize handle: center | right */}
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

        {/* ================================================================= */}
        {/* COLUMN 3: 其他业务配置 (Right Column, ~310px) */}
        {/* ================================================================= */}
        <div className="tpl-board-col-right w-full shrink-0 border-t lg:border-t-0 flex flex-col bg-white">
          {/* Header */}
          <div className="h-[52px] px-4 border-b border-gray-200/80 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
              <span className="material-symbols-outlined text-[#1890ff] text-[18px]">
                tune
              </span>
              <span>其他业务配置</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Revert / Undo Changes Button - Display only when changes exist */}
              {isOtherConfigDirty && (
                <button
                  type="button"
                  onClick={handleUndoOtherConfig}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors flex items-center justify-center"
                  title="一键撤回未保存的更改"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Dynamic Save Configuration Button */}
              <button
                type="button"
                onClick={handleSaveOtherConfig}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isOtherConfigDirty
                    ? 'bg-[#1890ff] hover:bg-blue-600 text-white shadow-2xs'
                    : 'border border-gray-200 hover:bg-gray-50 text-gray-600 bg-white'
                }`}
                title={isOtherConfigDirty ? '配置已修改，点击保存生效' : '配置已是最新状态'}
              >
                <Save className={`w-3.5 h-3.5 ${isOtherConfigDirty ? 'text-white' : 'text-gray-400'}`} />
                <span>保存配置</span>
              </button>
            </div>
          </div>

          {/* Right Body */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-white">
            {!isActivationMode && (() => {
              const selectedFlow = AUDIT_FLOW_PRESET_OPTIONS.find(
                f => f.id === currentAuditFlowId || f.name === currentAuditFlowId
              );
              const selectedScoreRule = SCORING_RULE_OPTIONS.find(r => r.id === currentScoreRuleId);

              return (
                <div className="space-y-3.5">
                  {/* Segmented Sub-Tabs (Consistent Font Size) */}
                  <div className="grid grid-cols-2 gap-1 p-1 bg-[#f0f2f5] rounded-xl border border-gray-200/50">
                    <button
                      type="button"
                      onClick={() => setRightSubTab('score')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                        rightSubTab === 'score'
                          ? 'bg-white text-gray-800 font-semibold shadow-2xs'
                          : 'text-gray-500 hover:text-gray-700 font-medium'
                      }`}
                    >
                      <Award className={`w-3.5 h-3.5 ${rightSubTab === 'score' ? 'text-gray-700' : 'text-gray-400'}`} />
                      <span>规则打分</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRightSubTab('flow')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                        rightSubTab === 'flow'
                          ? 'bg-white text-[#873bf5] font-semibold shadow-2xs'
                          : 'text-gray-500 hover:text-gray-700 font-medium'
                      }`}
                    >
                      <GitBranch className={`w-3.5 h-3.5 ${rightSubTab === 'flow' ? 'text-[#873bf5]' : 'text-gray-400'}`} />
                      <span>审核流程</span>
                    </button>
                  </div>

                  {/* Tab 1: 规则打分 Content */}
                  {rightSubTab === 'score' && (
                    <div className="space-y-3">
                      {/* Select Rule */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          关联打分规则
                        </label>
                        <div className="relative">
                          <select
                            value={selectedScoreRule?.id || ''}
                            onChange={(e) => handleSelectScoreRule(e.target.value)}
                            className="w-full appearance-none px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 focus:border-[#1890ff] rounded-lg text-xs font-medium text-gray-800 pr-8 focus:outline-none transition-colors cursor-pointer shadow-2xs"
                          >
                            <option value="" disabled>
                              请选择打分规则
                            </option>
                            {SCORING_RULE_OPTIONS.map((rule) => (
                              <option key={rule.id} value={rule.id}>
                                {rule.name} ({rule.maxScore}分)
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Rule Card Box */}
                      {selectedScoreRule ? (
                      <div className="border border-amber-200/90 rounded-xl p-3.5 bg-amber-50/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900">
                            {selectedScoreRule.name}
                          </span>
                          <span className="text-xs font-bold text-amber-600">
                            满分 {selectedScoreRule.maxScore} 分
                          </span>
                        </div>

                        {/* Score Breakdown Standard Badges */}
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-medium text-gray-500">分级得分标准</div>
                          <div className="grid grid-cols-2 gap-1.5">
                            {selectedScoreRule.grades.map((g, idx) => (
                              <div
                                key={idx}
                                className="px-2 py-1 bg-amber-50 text-amber-900 border border-amber-200/90 rounded text-[11px] font-medium text-center truncate"
                              >
                                {g.name}：{g.score}分
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 打分时机 */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-gray-600 font-medium">打分时机</span>
                          <div className="inline-flex">
                            <button
                              type="button"
                              onClick={() => handleSelectScoreTiming('终审打分')}
                              className="px-2.5 py-1 text-[11px] rounded transition-colors cursor-pointer bg-amber-50 text-amber-800 font-bold border border-amber-200"
                            >
                              终审打分
                            </button>
                          </div>
                        </div>
                      </div>
                      ) : (
                        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                          尚未关联打分规则。关联并保存后，才可启用该模板。
                        </p>
                      )}

                      {/* Bottom Link */}
                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={handleManageScoringRules}
                          className="text-xs text-[#1890ff] hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer font-medium group"
                        >
                          <span>管理打分规则库</span>
                          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: 审核流程 Content (Consistent Font Size) */}
                  {rightSubTab === 'flow' && (
                    <div className="space-y-3.5">
                      {/* 关联审核流程 Dropdown */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          关联审核流程
                        </label>
                        <div className="relative">
                          <select
                            value={selectedFlow?.id || ''}
                            onChange={(e) => handleSelectAuditFlow(e.target.value)}
                            className="w-full appearance-none px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 focus:border-[#873bf5] rounded-lg text-xs font-medium text-gray-800 pr-8 focus:outline-none transition-colors cursor-pointer shadow-2xs"
                          >
                            <option value="" disabled>
                              请选择审核流程
                            </option>
                            {AUDIT_FLOW_PRESET_OPTIONS.map((flow) => (
                              <option key={flow.id} value={flow.id}>
                                {flow.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {selectedFlow ? (
                      <div className="border border-[#f0e6ff] rounded-xl p-3 bg-[#fbf9fe] space-y-2">
                        {/* Header */}
                        <div className="text-xs font-medium text-gray-400">
                          审批节点链路
                        </div>

                        {/* Nodes List */}
                        <div className="space-y-1.5">
                          {selectedFlow.nodes.map((node) => (
                            <div
                              key={node.order}
                              className="bg-white rounded-lg border border-[#efe7fa] px-2.5 py-2 shadow-2xs space-y-1"
                            >
                              <div className="flex items-start gap-1.5 min-w-0">
                                <span className="w-4 h-4 mt-px rounded-full bg-[#873bf5] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {node.order}
                                </span>
                                <span className="font-semibold text-xs text-gray-800 leading-snug break-all">
                                  {node.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 pl-5.5 flex-wrap">
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#fbf7ff] text-[#873bf5] border border-[#f0e4ff] text-[10px] font-medium whitespace-nowrap">
                                  <User className="w-2.5 h-2.5 text-[#873bf5]" />
                                  <span>{node.role}</span>
                                </span>

                                <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 font-normal whitespace-nowrap">
                                  <Clock className="w-2.5 h-2.5 text-gray-400 stroke-[1.75]" />
                                  <span>{node.duration}</span>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Card Footer: 兜底 & 适用范围 */}
                        <div className="pt-2 mt-2 border-t border-[#f5ecff] flex items-center justify-between text-[11px] text-gray-400 font-normal">
                          <span>{selectedFlow.fallbackText}</span>
                          <span>{selectedFlow.applyScopeText}</span>
                        </div>
                      </div>
                      ) : (
                        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                          尚未关联审核流程。关联并保存后，才可启用该模板。
                        </p>
                      )}

                      {/* Bottom Link: 管理审核流程模型 */}
                      <div className="text-center pt-1.5">
                        <button
                          type="button"
                          onClick={handleManageWorkflowModel}
                          className="inline-flex items-center justify-center gap-1 text-xs font-medium text-[#1890ff] hover:text-blue-700 transition-colors cursor-pointer group"
                        >
                          <span>管理审核流程模型</span>
                          <ExternalLink className="w-3 h-3 text-[#1890ff] group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* FOR 激活模板 (Screenshot 2: 实名核验开关 & 适配注册角色) */}
            {isActivationMode && (
              <div className="space-y-5">
                {/* Section 1: 实名核验开关 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                      <Shield className="w-3.5 h-3.5 text-[#1890ff]" />
                      <span>实名核验开关</span>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      已开启{' '}
                      {
                        [
                          currentVerificationOptions.phoneVerify,
                          currentVerificationOptions.idCardVerify,
                          currentVerificationOptions.bankCardVerify
                        ].filter(Boolean).length
                      }
                      /3 项
                    </span>
                  </div>

                  {/* Verification Item 1: Phone */}
                  <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1890ff] flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-800">手机号码验证</div>
                        <div className="text-[11px] text-gray-500 truncate">
                          填写并校验 11 位有效手机号码
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleVerificationOption('phoneVerify')}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                        currentVerificationOptions.phoneVerify
                          ? 'bg-[#1890ff] justify-end'
                          : 'bg-gray-300 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow-2xs" />
                    </button>
                  </div>

                  {/* Verification Item 2: ID Card */}
                  <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1890ff] flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-800">身份证号码验证</div>
                        <div className="text-[11px] text-gray-500 truncate">
                          核验 18 位身份证号码与校验位
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleVerificationOption('idCardVerify')}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                        currentVerificationOptions.idCardVerify
                          ? 'bg-[#1890ff] justify-end'
                          : 'bg-gray-300 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow-2xs" />
                    </button>
                  </div>

                  {/* Verification Item 3: Bank Card */}
                  <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-800">银行卡号验证</div>
                        <div className="text-[11px] text-gray-500 truncate">
                          校验银联 16-19 位卡号 (用于补贴结算)
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleVerificationOption('bankCardVerify')}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                        currentVerificationOptions.bankCardVerify
                          ? 'bg-[#1890ff] justify-end'
                          : 'bg-gray-300 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow-2xs" />
                    </button>
                  </div>
                </div>

                {/* Section 2: 适配注册角色 */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                      <UserCheck className="w-3.5 h-3.5 text-[#1890ff]" />
                      <span>适配注册角色</span>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      已选 {currentAdaptedRoles.length} 个
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Role 1: 上报员 */}
                    <div
                      onClick={() => handleToggleAdaptedRole('上报员')}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        currentAdaptedRoles.includes('上报员')
                          ? 'bg-purple-50/40 border-purple-200'
                          : 'bg-gray-50/50 border-gray-200'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-purple-900">上报员</div>
                        <div className="text-[10px] text-gray-400">填报岗</div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center ${
                          currentAdaptedRoles.includes('上报员')
                            ? 'bg-[#873bf5] text-white'
                            : 'border border-gray-300'
                        }`}
                      >
                        {currentAdaptedRoles.includes('上报员') && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                    </div>

                    {/* Role 2: 审核员 */}
                    <div
                      onClick={() => handleToggleAdaptedRole('审核员')}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        currentAdaptedRoles.includes('审核员')
                          ? 'bg-purple-50/40 border-purple-200'
                          : 'bg-gray-50/50 border-gray-200'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-purple-900">审核员</div>
                        <div className="text-[10px] text-gray-400">审核岗</div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center ${
                          currentAdaptedRoles.includes('审核员')
                            ? 'bg-[#873bf5] text-white'
                            : 'border border-gray-300'
                        }`}
                      >
                        {currentAdaptedRoles.includes('审核员') && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer notice */}
                <div className="pt-2 text-[11px] text-gray-400 flex items-start gap-1.5 leading-relaxed">
                  <Info className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <span>配置直接生效于新人员实名核验与角色注册。</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
