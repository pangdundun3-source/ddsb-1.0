import React, { useState, useEffect, useRef } from 'react';
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
  Undo2,
  Save,
  CheckCircle2,
  XCircle,
  GripVertical,
  Shield,
  CreditCard,
  Phone,
  Info,
  Award,
  GitBranch,
  Wand2,
  ExternalLink,
  ChevronDown,
  Clock,
  X,
  Layers
} from 'lucide-react';

export type TemplateType = '报送' | '激活';
export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'file'
  | 'link'
  | 'select'
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
}

export interface BusinessTemplateItem {
  id: string;
  name: string;
  templateType: TemplateType;
  isDefault: boolean;
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
      { name: '一等（特优）', score: 100 },
      { name: '二等（优秀）', score: 90 },
      { name: '三等（良好）', score: 80 },
      { name: '四等（合格）', score: 70 },
      { name: '五等（基本）', score: 60 }
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

// System standard preset fields for 报送模板
export const standardReportFields: TemplateFieldItem[] = [
  { id: 'rf_1', name: '报送主题/事件标题', type: 'text', required: true, placeholder: '请输入具体报送的主题或事件全称' },
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
      { id: 'qf_1', name: '报送主题/事件标题', type: 'text', required: true, placeholder: '请输入具体报送的主题或事件全称' },
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
  onNavigateToScoring
}) => {
  const storageKey = `v8_template_board_data_${institutionId ?? 'global'}`;

  // State: Templates data store
  const [templates, setTemplates] = useState<BusinessTemplateItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialDefaultTemplates;
  });

  // Save to local storage
  const saveTemplates = (newTemplates: BusinessTemplateItem[]) => {
    setTemplates(newTemplates);
    localStorage.setItem(storageKey, JSON.stringify(newTemplates));
  };

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
  const [topTab, setTopTab] = useState<TemplateType>('报送');
  const [showSyncNotice, setShowSyncNotice] = useState(true);

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
  const [draggingFieldIndex, setDraggingFieldIndex] = useState<number | null>(null);

  // Drag and drop sorting for template designer fields
  const handleDropDesignerField = (targetIndex: number) => {
    if (draggingFieldIndex === null || draggingFieldIndex === targetIndex) {
      setDraggingFieldIndex(null);
      return;
    }
    setDesignerFields(prev => {
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
  const [submittedSimulate, setSubmittedSimulate] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      : activeTemplate?.scoreRuleId || 'sr_100_standard';

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
      : activeTemplate?.auditFlowId || 'flow_adaptive_tree_3';

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
      (pendingOtherConfig.scoreRuleId !== undefined && pendingOtherConfig.scoreRuleId !== (activeTemplate?.scoreRuleId || 'sr_100_standard')) ||
      (pendingOtherConfig.scoreTiming !== undefined && pendingOtherConfig.scoreTiming !== (activeTemplate?.scoreTiming || '终审打分')) ||
      (pendingOtherConfig.includeInEvaluation !== undefined && pendingOtherConfig.includeInEvaluation !== (activeTemplate?.includeInEvaluation ?? true)) ||
      (pendingOtherConfig.auditFlowId !== undefined && pendingOtherConfig.auditFlowId !== (activeTemplate?.auditFlowId || 'flow_adaptive_tree_3')) ||
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
  const handleToggleTemplateStatus = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = templates.map(t => {
      if (t.id === id) {
        const nextStatus: '启用' | '停用' = t.status === '启用' ? '停用' : '启用';
        return { ...t, status: nextStatus };
      }
      return t;
    });
    saveTemplates(updated);
    showToast(`模板状态已更新`);
  };

  // Duplicate a template
  const handleCopyTemplate = (tpl: BusinessTemplateItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newId = `tpl_${Date.now()}`;
    const newTpl: BusinessTemplateItem = {
      ...tpl,
      id: newId,
      name: `${tpl.name} - 副本`,
      isDefault: false,
      updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      fields: tpl.fields.map(f => ({ ...f, id: `f_${Date.now()}_${Math.random().toString(36).substring(2, 6)}` }))
    };
    const updated = [...templates, newTpl];
    saveTemplates(updated);
    setSelectedTemplateId(newId);
    showToast(`已成功复制模板「${tpl.name}」`);
  };

  // Delete a template
  const handleDeleteTemplate = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = templates.find(t => t.id === id);
    if (!isGlobalScope && target?.isDefault) {
      alert('系统默认模板受平台全局统一管控，机构端不支持删除！');
      return;
    }
    if (confirm(`确认删除模板「${target?.name}」吗？`)) {
      const updated = templates.filter(t => t.id !== id);
      saveTemplates(updated);
      showToast('模板已删除');
    }
  };

  // Open Designer
  const handleOpenDesigner = (mode: 'add' | 'edit' | 'copy', tpl?: BusinessTemplateItem) => {
    if (mode === 'add') {
      const newTpl: BusinessTemplateItem = {
        id: `tpl_${Date.now()}`,
        name: topTab === '报送' ? '重点应急事件处置报送' : '重点应急目标快速激活',
        templateType: topTab,
        isDefault: false,
        status: '启用',
        updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        description: '',
        fields: topTab === '报送' ? [...standardReportFields] : [...standardActivationFields]
      };
      setDesignerItem({ mode: 'add', template: newTpl });
      setDesignerName('');
      setDesignerDesc('');
      setDesignerFields(topTab === '报送' ? [...standardReportFields] : [...standardActivationFields]);
    } else if (tpl) {
      setDesignerItem({ mode, template: tpl });
      setDesignerName(tpl.name);
      setDesignerDesc(tpl.description || '');
      setDesignerFields(tpl.fields.map(f => ({ ...f })));
    }
  };

  // Save in Designer
  const handleSaveDesigner = () => {
    if (!designerName.trim()) {
      alert('请输入模板名称');
      return;
    }
    if (designerFields.length === 0) {
      alert('至少需要配置一个表单字段');
      return;
    }

    if (!designerItem) return;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (designerItem.mode === 'add') {
      const newItem: BusinessTemplateItem = {
        ...designerItem.template,
        name: designerName.trim(),
        description: designerDesc.trim(),
        fields: designerFields,
        updateTime: nowStr
      };
      const updated = [...templates, newItem];
      saveTemplates(updated);
      setSelectedTemplateId(newItem.id);
      showToast(`新增模板「${newItem.name}」已成功保存！`);
    } else {
      const updated = templates.map(t => {
        if (t.id === designerItem.template.id) {
          return {
            ...t,
            name: designerName.trim(),
            description: designerDesc.trim(),
            fields: designerFields,
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
      placeholder: '请输入相关信息'
    };
    setDesignerFields([...designerFields, newField]);
  };

  // Field type options for designer dropdown
  const getFieldTypeOptions = (tType: TemplateType): { value: FieldType; label: string }[] => {
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
      { value: 'text', label: '文本字段' },
      { value: 'date', label: '时间字段' },
      { value: 'number', label: '数据字段' },
      { value: 'link', label: '链接字段' },
      { value: 'file', label: '附件字段' },
      { value: 'select', label: '选择字段' }
    ];
  };

  // Update right side business config (score rules / verification switches / adapted roles)
  const handleSaveOtherConfig = () => {
    if (!activeTemplate) return;
    const updatedTpl: BusinessTemplateItem = {
      ...activeTemplate,
      scoreRuleId: currentScoreRuleId,
      scoreTiming: currentScoreTiming,
      includeInEvaluation: currentIncludeInEvaluation,
      auditFlowId: currentAuditFlowId,
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
      auditFlowId: prev?.templateId === activeTemplate.id && prev.auditFlowId !== undefined ? prev.auditFlowId : (activeTemplate.auditFlowId || 'flow_adaptive_tree_3'),
      verificationOptions: prev?.templateId === activeTemplate.id && prev.verificationOptions !== undefined ? prev.verificationOptions : (activeTemplate.verificationOptions || defaultVerificationOptions),
      adaptedRoles: prev?.templateId === activeTemplate.id && prev.adaptedRoles !== undefined ? prev.adaptedRoles : (activeTemplate.adaptedRoles || defaultAdaptedRoles)
    }));
  };

  // Select score timing (pending modification)
  const handleSelectScoreTiming = (timing: '初审打分' | '终审打分') => {
    if (!activeTemplate) return;
    setPendingOtherConfig(prev => ({
      templateId: activeTemplate.id,
      scoreRuleId: prev?.templateId === activeTemplate.id && prev.scoreRuleId !== undefined ? prev.scoreRuleId : (activeTemplate.scoreRuleId || 'sr_100_standard'),
      scoreTiming: timing,
      includeInEvaluation: prev?.templateId === activeTemplate.id && prev.includeInEvaluation !== undefined ? prev.includeInEvaluation : (activeTemplate.includeInEvaluation ?? true),
      auditFlowId: prev?.templateId === activeTemplate.id && prev.auditFlowId !== undefined ? prev.auditFlowId : (activeTemplate.auditFlowId || 'flow_adaptive_tree_3'),
      verificationOptions: prev?.templateId === activeTemplate.id && prev.verificationOptions !== undefined ? prev.verificationOptions : (activeTemplate.verificationOptions || defaultVerificationOptions),
      adaptedRoles: prev?.templateId === activeTemplate.id && prev.adaptedRoles !== undefined ? prev.adaptedRoles : (activeTemplate.adaptedRoles || defaultAdaptedRoles)
    }));
  };

  // Toggle include in evaluation (pending modification)
  const handleToggleIncludeInEvaluation = () => {
    if (!activeTemplate) return;
    setPendingOtherConfig(prev => ({
      templateId: activeTemplate.id,
      scoreRuleId: prev?.templateId === activeTemplate.id && prev.scoreRuleId !== undefined ? prev.scoreRuleId : (activeTemplate.scoreRuleId || 'sr_100_standard'),
      scoreTiming: prev?.templateId === activeTemplate.id && prev.scoreTiming !== undefined ? prev.scoreTiming : (activeTemplate.scoreTiming || '终审打分'),
      includeInEvaluation: !currentIncludeInEvaluation,
      auditFlowId: prev?.templateId === activeTemplate.id && prev.auditFlowId !== undefined ? prev.auditFlowId : (activeTemplate.auditFlowId || 'flow_adaptive_tree_3'),
      verificationOptions: prev?.templateId === activeTemplate.id && prev.verificationOptions !== undefined ? prev.verificationOptions : (activeTemplate.verificationOptions || defaultVerificationOptions),
      adaptedRoles: prev?.templateId === activeTemplate.id && prev.adaptedRoles !== undefined ? prev.adaptedRoles : (activeTemplate.adaptedRoles || defaultAdaptedRoles)
    }));
  };

  // Switch and select audit flow (pending modification)
  const handleSelectAuditFlow = (flowId: string) => {
    if (!activeTemplate) return;
    setPendingOtherConfig(prev => ({
      templateId: activeTemplate.id,
      scoreRuleId: prev?.templateId === activeTemplate.id && prev.scoreRuleId !== undefined ? prev.scoreRuleId : (activeTemplate.scoreRuleId || 'sr_100_standard'),
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
      scoreRuleId: prev?.templateId === activeTemplate.id && prev.scoreRuleId !== undefined ? prev.scoreRuleId : (activeTemplate.scoreRuleId || 'sr_100_standard'),
      scoreTiming: prev?.templateId === activeTemplate.id && prev.scoreTiming !== undefined ? prev.scoreTiming : (activeTemplate.scoreTiming || '终审打分'),
      includeInEvaluation: prev?.templateId === activeTemplate.id && prev.includeInEvaluation !== undefined ? prev.includeInEvaluation : (activeTemplate.includeInEvaluation ?? true),
      auditFlowId: prev?.templateId === activeTemplate.id && prev.auditFlowId !== undefined ? prev.auditFlowId : (activeTemplate.auditFlowId || 'flow_adaptive_tree_3'),
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
      scoreRuleId: prev?.templateId === activeTemplate.id && prev.scoreRuleId !== undefined ? prev.scoreRuleId : (activeTemplate.scoreRuleId || 'sr_100_standard'),
      scoreTiming: prev?.templateId === activeTemplate.id && prev.scoreTiming !== undefined ? prev.scoreTiming : (activeTemplate.scoreTiming || '终审打分'),
      includeInEvaluation: prev?.templateId === activeTemplate.id && prev.includeInEvaluation !== undefined ? prev.includeInEvaluation : (activeTemplate.includeInEvaluation ?? true),
      auditFlowId: prev?.templateId === activeTemplate.id && prev.auditFlowId !== undefined ? prev.auditFlowId : (activeTemplate.auditFlowId || 'flow_adaptive_tree_3'),
      verificationOptions: prev?.templateId === activeTemplate.id && prev.verificationOptions !== undefined ? prev.verificationOptions : (activeTemplate.verificationOptions || defaultVerificationOptions),
      adaptedRoles: nextRoles
    }));
  };

  // Helper: Get icon for field type in mobile preview & designer (1:1 with design)
  const renderFieldIcon = (type: FieldType) => {
    switch (type) {
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
    isActivation: boolean
  ) => {
    return (
      <div className="w-full max-w-[460px] mx-auto bg-white rounded-2xl border border-gray-200/90 p-3 shadow-2xs transition-all">
        {/* Inner Container */}
        <div className="rounded-xl overflow-hidden bg-[#EEF2F7] flex flex-col border border-slate-200/60">
          {/* Top Banner (Solid Royal Blue #1E5ABB) */}
          <div className="bg-[#1E5ABB] text-white py-3 px-4 text-center select-none shadow-xs">
            <div className="font-bold text-sm tracking-wide">{headerTitle || (isActivation ? '账号激活' : '快速上报')}</div>
          </div>

          {/* Form Body (Soft Light Background #EEF2F7, Individual White Cards) */}
          <div className="p-3.5 space-y-3 bg-[#EEF2F7]">
            {/* Submission Result Notice */}
            {submittedSimulate && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-800 animate-in fade-in slide-in-from-top-2">
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
              <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-dashed border-slate-200">
                请在左侧添加表单字段以实时预览
              </div>
            ) : (
              fields.map(field => {
                const currentValue = phoneFormValues[field.id];
                const selectedRole = phoneFormValues[`${field.id}_role`] || '超级管理员';
                const selectedGender = phoneFormValues[`${field.id}_gender`] || '男';

                return (
                  <div
                    key={field.id}
                    className="bg-white rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-100 space-y-2.5 transition-all"
                  >
                    {/* Card Header: Icon + Label + Asterisk */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-800 font-bold">
                      {renderFieldIcon(field.type)}
                      <span>{field.name}</span>
                      {field.required && <span className="text-rose-500 font-bold ml-0.5">*</span>}
                    </div>

                    {/* Card Body by Field Type */}
                    {field.type === 'identity' ? (
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
                      <div className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{currentValue || field.placeholder || '年 /月/日 --:--'}</span>
                        </div>
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-700" />
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
                          className="w-full appearance-none px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-[#1E5ABB] transition-colors pr-8 cursor-pointer"
                        >
                          <option value="" disabled hidden>
                            {field.placeholder || '请选择事件分类'}
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
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <input
                          type="url"
                          value={currentValue ?? ''}
                          onChange={e => {
                            setPhoneFormValues(prev => ({
                              ...prev,
                              [field.id]: e.target.value
                            }));
                            setSubmittedSimulate(false);
                          }}
                          placeholder={field.placeholder || 'https://...'}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1E5ABB] transition-colors"
                        />
                      </div>
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
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1E5ABB] transition-colors"
                      />
                    ) : (
                      <input
                        type="text"
                        value={currentValue ?? ''}
                        onChange={e => {
                          setPhoneFormValues(prev => ({
                            ...prev,
                            [field.id]: e.target.value
                          }));
                          setSubmittedSimulate(false);
                        }}
                        placeholder={field.placeholder || `请输入${field.name}`}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1E5ABB] transition-colors"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // VIEW B: Full Designer View (Screenshots 3 & 4)
  // =========================================================================
  if (designerItem) {
    const isActivation = designerItem.template.templateType === '激活';

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 space-y-6">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <button
            type="button"
            onClick={() => setDesignerItem(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span>&larr;</span>
            <span>返回模板列表</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDesignerItem(null)}
              className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              取消返回
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
        <div className="border border-gray-200/90 rounded-xl p-5 bg-white space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
            <FileText className="w-4 h-4 text-[#1890ff]" />
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
        <div className="border border-gray-200/90 rounded-xl p-5 bg-white space-y-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-gray-800 font-bold text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1890ff] text-[18px]">
                  dashboard_customize
                </span>
                <span>表单字段设计与用户端交互预览</span>
              </span>
              <span className="px-2 py-0.5 bg-blue-50 text-[#1890ff] text-[11px] font-bold rounded-md border border-blue-200">
                共 {designerFields.length} 个字段
              </span>
            </div>
            <span className="text-xs text-gray-400">
              左侧自由调整表单字段，右侧实时体验上报用户的填报界面
            </span>
          </div>

          {/* 2-Column Split: Left Editor, Right Live Phone Mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Field Editor in Enclosed Card Container */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs flex flex-col">
              {/* Header aligned with right column */}
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  <Layers className="w-3.5 h-3.5 text-[#1E5ABB]" />
                  <span>已配置字段列表</span>
                  <span className="px-1.5 py-0.5 bg-blue-50 text-[#1E5ABB] text-[10px] font-bold rounded border border-blue-200">
                    {designerFields.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDesignerFields(isActivation ? [...standardActivationFields] : [...standardReportFields]);
                    showToast('已恢复为标准模板预设字段');
                  }}
                  className="flex items-center gap-1.5 text-xs text-[#1E5ABB] hover:text-blue-700 font-medium px-2.5 py-1 rounded-md bg-blue-50/80 border border-blue-200/80 transition-colors cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>使用标准模板预设</span>
                </button>
              </div>

              {/* Field Cards */}
              <div className="space-y-3">
                {designerFields.map((field, idx) => (
                  <div
                    key={field.id}
                    draggable
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
                    className={`border rounded-xl p-3.5 bg-white space-y-3 shadow-2xs hover:border-blue-300 transition-all ${
                      draggingFieldIndex === idx
                        ? 'border-blue-400 bg-blue-50/60 opacity-60 scale-[0.99]'
                        : 'border-gray-200'
                    }`}
                  >
                    {/* Row 1: Drag & Type & Label & Required & Delete */}
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center text-gray-400 hover:text-blue-600 font-mono text-[11px] select-none shrink-0 cursor-grab active:cursor-grabbing p-1 -m-1 rounded hover:bg-gray-100 transition-colors"
                        title="按住拖拽以调整字段排序"
                      >
                        <GripVertical className="w-3.5 h-3.5 text-gray-400" />
                        <span>{idx + 1}</span>
                      </div>

                      {/* Field Type Select */}
                      <select
                        value={field.type}
                        onChange={e => {
                          const nextType = e.target.value as FieldType;
                          const updated = designerFields.map(f =>
                            f.id === field.id
                              ? {
                                  ...f,
                                  type: nextType,
                                  options:
                                    nextType === 'select'
                                      ? f.options || ['选项一', '选项二', '选项三']
                                      : nextType === 'identity'
                                      ? f.options || ['超级管理员', '机构管理员', '上报员', '审核员']
                                      : undefined
                                }
                              : f
                          );
                          setDesignerFields(updated);
                        }}
                        className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-gray-50/60 focus:outline-none focus:border-[#1890ff] shrink-0"
                      >
                        {getFieldTypeOptions(designerItem.template.templateType).map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      {/* Field Name Input */}
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
                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-800 font-bold focus:outline-none focus:border-[#1890ff]"
                      />

                      {/* Required Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          setDesignerFields(
                            designerFields.map(f =>
                              f.id === field.id ? { ...f, required: !f.required } : f
                            )
                          );
                        }}
                        className={`px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                          field.required
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}
                        title={field.required ? '必填项 (点击改为选填)' : '选填项 (点击改为必填)'}
                      >
                        {field.required ? '必' : '选'}
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (designerFields.length <= 1) {
                            alert('模板至少需要保留一个表单字段');
                            return;
                          }
                          setDesignerFields(designerFields.filter(f => f.id !== field.id));
                        }}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded transition-colors cursor-pointer shrink-0"
                        title="删除该字段"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Row 2: Placeholder Input */}
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
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 bg-gray-50/40 focus:outline-none focus:border-[#1890ff]"
                    />

                    {/* Sub-box: Options for Select field */}
                    {field.type === 'select' && (
                      <div className="p-3 bg-rose-50/30 border border-rose-100 rounded-lg space-y-2">
                        <div className="text-[11px] font-bold text-rose-700">选择项配置</div>
                        <div className="space-y-1.5">
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
                                className="flex-1 px-2.5 py-1 text-xs border border-gray-200 rounded bg-white"
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
                                className="text-gray-400 hover:text-rose-600 p-1"
                              >
                                <Trash2 className="w-3 h-3" />
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
                            className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 cursor-pointer pt-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>新增选项</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Sub-box: Role tags for Identity field */}
                    {field.type === 'identity' && (
                      <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-lg space-y-2">
                        <div className="text-[11px] font-bold text-[#1890ff]">角色列表 (可多选)</div>
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
                ))}
              </div>

              {/* Add Field Button */}
              <button
                type="button"
                onClick={handleAddField}
                className="w-full mt-3 py-2.5 border-2 border-dashed border-blue-200 hover:border-blue-400 text-[#1E5ABB] hover:bg-blue-50/50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>添加字段</span>
              </button>
            </div>

            {/* Right Column: Live Form Mockup (1:1 Restoration with Screenshot) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs">
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  <Eye className="w-3.5 h-3.5 text-[#1E5ABB]" />
                  <span>用户填报界面实时交互预览</span>
                </div>
                <span className="px-2.5 py-0.5 bg-blue-50/80 text-[#1E5ABB] text-[11px] font-medium rounded border border-blue-200">
                  {isActivation ? '激活填报模式' : '报送填报模式'}
                </span>
              </div>

              {/* Phone Mockup 1:1 Restoration */}
              {renderPhoneSimulator(
                designerFields,
                isActivation ? '账号激活' : designerName || '快速上报',
                isActivation
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

      {/* Top Segmented Tabs, Action Button & Notice Block */}
      <div className="bg-white p-2.5 rounded-xl border border-gray-200/80 shadow-2xs space-y-2.5">
        {/* Navigation Tabs and Add Button Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left Segmented Pill Tabs */}
          <div className="inline-flex items-center gap-1 p-1 bg-gray-100/90 rounded-lg border border-gray-200/60">
            <button
              type="button"
              onClick={() => setTopTab('报送')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                topTab === '报送'
                  ? 'bg-white text-[#1890ff] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className={`w-3.5 h-3.5 ${topTab === '报送' ? 'text-[#1890ff]' : 'text-gray-500'}`} />
              <span>报送模板</span>
            </button>

            <button
              type="button"
              onClick={() => setTopTab('激活')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                topTab === '激活'
                  ? 'bg-white text-[#1890ff] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${topTab === '激活' ? 'text-[#1890ff]' : 'text-gray-500'}`} />
              <span>激活模板</span>
            </button>
          </div>

          {/* Right Action Button */}
          <button
            type="button"
            onClick={() => handleOpenDesigner('add')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1890ff] hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isActivationMode ? '新增激活模板' : '新增报送模板'}</span>
          </button>
        </div>

        {/* Global Scope Sync Notice */}
        {isGlobalScope && showSyncNotice && (
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-3 flex items-start justify-between gap-2.5 text-xs">
            <div className="flex items-start gap-2.5 min-w-0">
              <Info className="w-4 h-4 text-[#1890ff] shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-blue-900 block text-xs">
                  全平台内置模板母版管控提示
                </span>
                <p className="text-gray-700 text-[11px] leading-relaxed">
                  此处新增、配置并启用的{topTab}模板将自动作为系统内置母版同步至全平台所有机构的内置模板库中。受平台全局统一管控，各机构端仅可调用与选用，不支持机构端自行修改或删除。
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSyncNotice(false)}
              className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-blue-100/70 transition-colors cursor-pointer shrink-0"
              title="关闭提示"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

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
            <span className="text-[11px] text-gray-400">切换预览</span>
          </div>

          {/* Template Cards List */}
          <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto bg-white">
            {currentCategoryTemplates.map(tpl => {
              const isSelected = activeTemplate?.id === tpl.id;
              const isEnabled = tpl.status === '启用';

              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`rounded-xl border p-3 space-y-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#1890ff] bg-blue-50/20 shadow-xs'
                      : 'border-gray-200/90 hover:border-blue-200 bg-white'
                  }`}
                >
                  {/* Row 1: Title & Status Switch */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-gray-900 truncate" title={tpl.name}>
                      {tpl.name}
                    </span>

                    {/* Enable Toggle Switch */}
                    <button
                      type="button"
                      onClick={e => handleToggleTemplateStatus(tpl.id, e)}
                      className="flex items-center gap-1 shrink-0 cursor-pointer whitespace-nowrap"
                      title={isEnabled ? '点击停用' : '点击启用'}
                    >
                      <span className={`text-[10px] font-bold ${isEnabled ? 'text-emerald-600' : 'text-gray-400'}`}>
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
                      <button
                        type="button"
                        onClick={e => handleCopyTemplate(tpl, e)}
                        className="hover:text-[#1890ff] flex items-center gap-0.5 text-[11px] cursor-pointer"
                        title="复制为新模板"
                      >
                        <Copy className="w-3 h-3" />
                        <span>复制</span>
                      </button>

                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleOpenDesigner('edit', tpl);
                        }}
                        className="hover:text-[#1890ff] flex items-center gap-0.5 text-[11px] cursor-pointer"
                        title={!isGlobalScope && tpl.isDefault ? '查看详情' : '编辑模板'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{!isGlobalScope && tpl.isDefault ? '详情' : '编辑'}</span>
                      </button>

                      {(isGlobalScope || !tpl.isDefault) && (
                        <button
                          type="button"
                          onClick={e => handleDeleteTemplate(tpl.id, e)}
                          className="hover:text-rose-600 p-0.5 cursor-pointer"
                          title="删除"
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
              <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200 shrink-0">
                {activeTemplate?.status}
              </span>
              {!isGlobalScope && activeTemplate?.isDefault && (
                <span className="px-1.5 py-0.2 bg-gray-100 text-gray-600 text-[10px] font-bold rounded border border-gray-200 shrink-0">
                  系统默认
                </span>
              )}
            </div>

            {/* Edit Button */}
            <button
              type="button"
              onClick={() => handleOpenDesigner('edit', activeTemplate)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1890ff] hover:bg-blue-600 text-white rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer shrink-0"
              title="编辑当前模板"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>编辑</span>
            </button>
          </div>

          {/* Center Body: Preview Area */}
          <div className="p-4 flex-1 flex flex-col bg-[#F8FAFC]/60 overflow-y-auto">
            {/* Sub-header */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3 shrink-0">
              <div className="flex items-center gap-1.5 font-bold text-gray-700">
                <Smartphone className="w-3.5 h-3.5 text-[#1890ff]" />
                <span>移动端填报实时模拟</span>
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
                  className="p-1.5 rounded-lg text-xs text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 cursor-pointer shadow-2xs transition-all flex items-center justify-center animate-in fade-in zoom-in-95 duration-150"
                  title="一键撤回未保存的更改"
                >
                  <Undo2 className="w-3.5 h-3.5" />
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
              const selectedFlow =
                AUDIT_FLOW_PRESET_OPTIONS.find(
                  f => f.id === currentAuditFlowId || f.name === currentAuditFlowId
                ) || AUDIT_FLOW_PRESET_OPTIONS[0];

              const selectedScoreRule =
                SCORING_RULE_OPTIONS.find(r => r.id === currentScoreRuleId) ||
                SCORING_RULE_OPTIONS[0];

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
                            value={selectedScoreRule.id}
                            onChange={(e) => handleSelectScoreRule(e.target.value)}
                            className="w-full appearance-none px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 focus:border-[#1890ff] rounded-lg text-xs font-medium text-gray-800 pr-8 focus:outline-none transition-colors cursor-pointer shadow-2xs"
                          >
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
                          <div className="inline-flex rounded-md border border-gray-200 p-0.5 bg-white">
                            <button
                              type="button"
                              onClick={() => handleSelectScoreTiming('初审打分')}
                              className={`px-2.5 py-1 text-[11px] rounded transition-colors cursor-pointer ${
                                currentScoreTiming === '初审打分'
                                  ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              初审打分
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectScoreTiming('终审打分')}
                              className={`px-2.5 py-1 text-[11px] rounded transition-colors cursor-pointer ${
                                currentScoreTiming === '终审打分'
                                  ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              终审打分
                            </button>
                          </div>
                        </div>

                        {/* 计入考核绩效 */}
                        <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
                          <span className="text-xs text-gray-600 font-medium">计入考核绩效</span>
                          <div
                            onClick={handleToggleIncludeInEvaluation}
                            className={`w-8 h-4.5 rounded-full p-0.5 flex items-center cursor-pointer transition-colors ${
                              currentIncludeInEvaluation ? 'bg-amber-500 justify-end' : 'bg-gray-300 justify-start'
                            }`}
                          >
                            <div className="w-3.5 h-3.5 bg-white rounded-full shadow-2xs" />
                          </div>
                        </div>
                      </div>

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
                            value={selectedFlow.id}
                            onChange={(e) => handleSelectAuditFlow(e.target.value)}
                            className="w-full appearance-none px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 focus:border-[#873bf5] rounded-lg text-xs font-medium text-gray-800 pr-8 focus:outline-none transition-colors cursor-pointer shadow-2xs"
                          >
                            {AUDIT_FLOW_PRESET_OPTIONS.map((flow) => (
                              <option key={flow.id} value={flow.id}>
                                {flow.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* 审批节点链路 Card Box */}
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
                              className="bg-white rounded-lg border border-[#efe7fa] px-2.5 py-1.5 flex items-center justify-between shadow-2xs gap-2"
                            >
                              {/* Left: Number circle & node name */}
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="w-4 h-4 rounded-full bg-[#873bf5] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {node.order}
                                </span>
                                <span className="font-semibold text-xs text-gray-800 truncate tracking-tight">
                                  {node.name}
                                </span>
                              </div>

                              {/* Right: Role pill & duration */}
                              <div className="flex items-center gap-1 shrink-0">
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
