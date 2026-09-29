import { useEffect, useMemo, useState } from 'react';
import {
  AssessmentRuleItem,
  DictItem,
  Institution,
  InstitutionBusinessRules,
  OtherBusinessConfig,
  QrCodeUsageConfig,
  ScoringDimension,
  ScoringLevelItem,
  ScoringRuleGroup,
  TemplateConfigItem,
  TemplateFieldItem,
  TemplateFieldType,
  ValueAddedServiceItem,
} from '../types';
import { formatDateTime } from '../shared/date';

export type BusinessRuleNavKey =
  | 'templates'
  | 'scoring'
  | 'dictionary'
  | 'workflow'
  | 'value_added'
  | 'qr_code'
  | 'other';

interface MetricItem {
  id: string;
  name: string;
  unit: string;
  category: string;
  description: string;
  calculation: string;
}

interface UseBusinessRulesViewModelOptions {
  institution?: Institution | null;
  isGlobalScope: boolean;
  initialNav?: BusinessRuleNavKey;
  defaultRules: InstitutionBusinessRules;
  defaultOtherBusinessConfig: OtherBusinessConfig;
  defaultValueAddedServices: ValueAddedServiceItem[];
  statMetrics: MetricItem[];
  readGlobalRules: () => InstitutionBusinessRules;
  mergeWithGlobal: (
    rules: InstitutionBusinessRules | null | undefined,
    globalRules: InstitutionBusinessRules
  ) => InstitutionBusinessRules;
  onSaveRules: (rules: InstitutionBusinessRules) => void;
  showToast: (message: string, type?: 'success' | 'warning' | 'info') => void;
}

export const useBusinessRulesViewModel = ({
  institution,
  isGlobalScope,
  initialNav,
  defaultRules,
  defaultOtherBusinessConfig,
  defaultValueAddedServices,
  statMetrics,
  readGlobalRules,
  mergeWithGlobal,
  onSaveRules,
  showToast,
}: UseBusinessRulesViewModelOptions) => {
  const [rules, setRules] = useState<InstitutionBusinessRules>(() =>
    isGlobalScope
      ? readGlobalRules()
      : mergeWithGlobal(institution?.businessRules, readGlobalRules())
  );
  const [activeNav, setActiveNav] = useState<BusinessRuleNavKey>(() => {
    if (initialNav) return initialNav;
    const saved = localStorage.getItem('admin_business_rule_active_subnav');
    const validKeys: BusinessRuleNavKey[] = [
      'templates',
      'scoring',
      'workflow',
      'qr_code',
      'value_added',
      'dictionary',
      'other',
    ];
    return saved && validKeys.includes(saved as BusinessRuleNavKey)
      ? (saved as BusinessRuleNavKey)
      : 'workflow';
  });

  useEffect(() => {
    if (initialNav) {
      setActiveNav(initialNav);
    }
  }, [initialNav]);

  const [templateFilterType, setTemplateFilterType] = useState<'all' | 'report' | 'active'>('active');
  const [templateSearchKeyword, setTemplateSearchKeyword] = useState('');
  const [viewingTemplate, setViewingTemplate] = useState<TemplateConfigItem | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<TemplateConfigItem | null>(null);
  const [quickAddFieldType, setQuickAddFieldType] = useState<TemplateFieldType>('text');
  const [scoringSearchKeyword, setScoringSearchKeyword] = useState('');
  const [viewingScoringRuleGroup, setViewingScoringRuleGroup] = useState<ScoringRuleGroup | null>(null);
  const [editingScoringRuleGroup, setEditingScoringRuleGroup] = useState<ScoringRuleGroup | null>(null);
  const [editingDimension, setEditingDimension] = useState<ScoringDimension | null>(null);
  const [selectedDictType, setSelectedDictType] = useState('reject_reason');
  const [editingDictItem, setEditingDictItem] = useState<DictItem | null>(null);
  const [viewingDictItem, setViewingDictItem] = useState<DictItem | null>(null);
  const [dictSearchKeyword, setDictSearchKeyword] = useState('');
  const [editingAssessment, setEditingAssessment] = useState<AssessmentRuleItem | null>(null);
  const [metricSearchName, setMetricSearchName] = useState('');
  const [metricCategoryFilter, setMetricCategoryFilter] = useState('全部');
  const [metricSearchQuery, setMetricSearchQuery] = useState({ name: '', category: '全部' });
  const [selectedMetric, setSelectedMetric] = useState<MetricItem>(statMetrics[0]);
  const [simulatorInputs, setSimulatorInputs] = useState({
    reads: 12500,
    likes: 680,
    shares: 2400,
    comments: 310,
    isOriginal: true,
  });

  const handleSyncFromGlobal = () => {
    const merged = mergeWithGlobal(rules, readGlobalRules());
    setRules(merged);
    showToast('已成功从平台全局业务规则库拉取并同步最新基准配置！', 'success');
  };

  const isGlobalImmutable = (item: {
    isGlobal?: boolean;
    isSystem?: boolean;
    isCustom?: boolean;
  }) => !isGlobalScope && Boolean((item.isGlobal || item.isSystem) && !item.isCustom);

  const handleNavChange = (key: BusinessRuleNavKey) => {
    setActiveNav(key);
    localStorage.setItem('admin_business_rule_active_subnav', key);
  };

  const handleUpdateQrConfig = (qrUsage: QrCodeUsageConfig) => {
    const updated = {
      ...rules,
      otherConfig: { ...defaultOtherBusinessConfig, ...(rules.otherConfig || {}), qrUsage },
    };
    setRules(updated);
    onSaveRules(updated);
  };

  const filteredTemplates = useMemo(() => {
    const keyword = templateSearchKeyword.trim().toLowerCase();
    return (rules.templates || []).filter((template) => {
      if (templateFilterType === 'report' && template.type !== '报送') return false;
      if (templateFilterType === 'active' && template.type !== '激活') return false;
      if (!keyword) return true;
      return (
        template.name.toLowerCase().includes(keyword) ||
        (template.description || '').toLowerCase().includes(keyword) ||
        (template.type || '').toLowerCase().includes(keyword) ||
        (template.fields || []).some((field) => field.name.toLowerCase().includes(keyword))
      );
    });
  }, [rules.templates, templateFilterType, templateSearchKeyword]);

  const filteredMetrics = useMemo(
    () =>
      statMetrics.filter((metric) => {
        const matchesName =
          !metricSearchQuery.name.trim() ||
          metric.name.toLowerCase().includes(metricSearchQuery.name.trim().toLowerCase());
        const matchesCategory =
          metricSearchQuery.category === '全部' || metric.category === metricSearchQuery.category;
        return matchesName && matchesCategory;
      }),
    [metricSearchQuery, statMetrics]
  );

  const simulatedMPI = useMemo(() => {
    const formula = rules.metricsFormula;
    const base =
      simulatorInputs.reads * formula.readWeight * 0.05 +
      simulatorInputs.likes * formula.likeWeight * 0.5 +
      simulatorInputs.shares * formula.shareWeight +
      simulatorInputs.comments * formula.commentWeight * 1.5;
    return Math.round(base * (simulatorInputs.isOriginal ? formula.originalBonus : 1));
  }, [rules.metricsFormula, simulatorInputs]);

  const handleMetricSearch = () =>
    setMetricSearchQuery({ name: metricSearchName, category: metricCategoryFilter });

  const handleMetricReset = () => {
    setMetricSearchName('');
    setMetricCategoryFilter('全部');
    setMetricSearchQuery({ name: '', category: '全部' });
  };

  const createNewTemplate = () => {
    const timestamp = Date.now();
    setEditingTemplate({
      id: `tpl-${timestamp}`,
      name: '自定义事件上报模板',
      type: '报送',
      status: true,
      isSystem: false,
      updatedAt: formatDateTime(),
      description: '用于特定业务条线的定制化信息采报通道',
      fields: [
        {
          id: `f-${timestamp}-1`,
          name: '事件主题/标题',
          type: 'text',
          required: true,
          placeholder: '请输入事件主题',
        },
        {
          id: `f-${timestamp}-2`,
          name: '发现时间',
          type: 'time',
          required: true,
          placeholder: '年/月/日 --:--',
        },
        {
          id: `f-${timestamp}-3`,
          name: '现场佐证材料',
          type: 'attachment',
          required: true,
          placeholder: '上传图片或视频证据',
        },
      ],
    });
  };

  const addTemplateField = () => {
    if (!editingTemplate) return;
    const typeLabelMap: Record<TemplateFieldType, string> = {
      text: '新建文本项',
      role: '身份角色',
      phone: '手机号码',
      gender: '性别',
      idcard: '身份证号',
      bankcard: '银行卡号',
      attachment: '证明附件',
      textarea: '新建详细说明',
      time: '新建时间节点',
      number: '新建数据指标',
      link: '新建来源链接',
      select: '新建下拉选项',
    };
    const placeholderMap: Record<TemplateFieldType, string> = {
      text: '请输入具体内容',
      role: '请选择身份角色',
      phone: '请输入 11 位手机号码',
      gender: '请选择性别',
      idcard: '请输入身份证号码',
      bankcard: '请输入银行卡号',
      attachment: '上传图片、视频或证明材料',
      textarea: '请输入详细描述说明',
      time: '年/月/日 --:--',
      number: '请输入数值数据',
      link: 'https://...',
      select: '请选择分类选项',
    };
    const newField: TemplateFieldItem = {
      id: `f-${Date.now()}`,
      name: typeLabelMap[quickAddFieldType] || '自定义字段',
      type: quickAddFieldType,
      required: false,
      placeholder: placeholderMap[quickAddFieldType] || '',
      options:
        quickAddFieldType === 'select'
          ? ['选项一', '选项二', '选项三']
          : quickAddFieldType === 'role'
          ? ['超级管理员', '机构管理员', '上报员', '审核员', '运营管理员', '临时审核员']
          : quickAddFieldType === 'gender'
          ? ['男', '女']
          : undefined,
    };
    setEditingTemplate({ ...editingTemplate, fields: [...(editingTemplate.fields || []), newField] });
    showToast(`已追加【${typeLabelMap[quickAddFieldType]}】字段！`);
  };

  const addScoringLevel = () => {
    if (!editingScoringRuleGroup) return;
    const nextOrder = editingScoringRuleGroup.levels.length + 1;
    const newLevel: ScoringLevelItem = {
      id: `lvl-${Date.now()}`,
      name: `等级 ${nextOrder}`,
      score: Math.max(0, editingScoringRuleGroup.totalScore - (nextOrder - 1) * 10),
      description: `等级 ${nextOrder} 标准说明`,
    };
    setEditingScoringRuleGroup({
      ...editingScoringRuleGroup,
      levels: [...editingScoringRuleGroup.levels, newLevel],
      levelCount: nextOrder,
    });
  };

  const toggleTemplateStatus = (template: TemplateConfigItem) => {
    setRules((previous) => ({
      ...previous,
      templates: previous.templates.map((item) =>
        item.id === template.id ? { ...item, status: !item.status } : item
      ),
    }));
    showToast(`已${template.status ? '停用' : '启用'}模板【${template.name}】！`, template.status ? 'info' : 'success');
  };

  const removeTemplate = (template: TemplateConfigItem) => {
    setRules((previous) => ({
      ...previous,
      templates: previous.templates.filter((item) => item.id !== template.id),
    }));
    showToast(`已删除模板【${template.name}】！`, 'success');
  };

  const createNewScoringRuleGroup = () => {
    const timestamp = Date.now();
    setEditingScoringRuleGroup({
      id: `srg-${timestamp}`,
      name: '自定义百分制打分规则组',
      scope: '全部上报统一适用',
      totalScore: 100,
      levelCount: 5,
      status: false,
      isSystem: false,
      isCurrentActive: false,
      description: '按审核结果命中一个评分等级，设为启用后替换当前规则',
      updatedAt: formatDateTime(),
      levels: [
        { id: `lvl-${timestamp}-1`, name: '一等（特优）', score: 100, description: '特优级标准' },
        { id: `lvl-${timestamp}-2`, name: '二等（优秀）', score: 90, description: '优秀级标准' },
        { id: `lvl-${timestamp}-3`, name: '三等（良好）', score: 80, description: '良好级标准' },
        { id: `lvl-${timestamp}-4`, name: '四等（合格）', score: 70, description: '合格级标准' },
        { id: `lvl-${timestamp}-5`, name: '五等（基本）', score: 60, description: '基本级标准' },
      ],
    });
  };

  const toggleScoringRuleGroup = (group: ScoringRuleGroup) => {
    const groups = rules.scoringRuleGroups || defaultRules.scoringRuleGroups || [];
    setRules({
      ...rules,
      scoringRuleGroups: groups.map((item) =>
        item.id === group.id
          ? { ...item, status: !item.status, isCurrentActive: !item.status }
          : item
      ),
    });
    showToast(`已${group.status ? '停用' : '启用'}【${group.name}】！`, 'success');
  };

  const removeScoringRuleGroup = (group: ScoringRuleGroup) => {
    const groups = rules.scoringRuleGroups || defaultRules.scoringRuleGroups || [];
    setRules({ ...rules, scoringRuleGroups: groups.filter((item) => item.id !== group.id) });
    showToast(`已删除【${group.name}】！`, 'success');
  };

  const createNewDictItem = (dictType: string) => {
    const timestamp = Date.now();
    const isRejectReason = dictType === 'reject_reason';
    setEditingDictItem({
      id: `d-${timestamp}`,
      dictType,
      label: isRejectReason ? '新驳回原因' : '新人员标签',
      value: `custom_${timestamp.toString().slice(-4)}`,
      sortOrder: rules.dictItems.filter((item) => item.dictType === dictType).length + 1,
      isSystem: false,
      status: true,
      description: isRejectReason ? '请填写该驳回原因对应的审核员提示说明' : '请填写该人员标签对应的业务职能说明',
      updatedAt: formatDateTime(),
    });
  };

  const toggleDictItem = (item: DictItem) => {
    setRules({
      ...rules,
      dictItems: rules.dictItems.map((dictItem) =>
        dictItem.id === item.id ? { ...dictItem, status: !dictItem.status } : dictItem
      ),
    });
    showToast(`【${item.label}】已切换为${item.status ? '停用' : '启用'}！`);
  };

  const removeDictItem = (item: DictItem) => {
    setRules({ ...rules, dictItems: rules.dictItems.filter((dictItem) => dictItem.id !== item.id) });
    showToast(`已删除【${item.label}】！`, 'success');
  };

  const createAssessmentRule = () => {
    const newRule: AssessmentRuleItem = {
      id: `ar-${Date.now()}`,
      metricName: '自定义考核指标',
      targetValue: 100,
      unit: '次',
      cycle: rules.assessmentCycle,
      weight: 20,
      rewardPoints: 10,
      penaltyPoints: 10,
    };
    setRules({ ...rules, assessmentRules: [...rules.assessmentRules, newRule] });
    setEditingAssessment(newRule);
    showToast('已新增考核指标！', 'success');
  };

  const setAssessmentCycle = (
    cycle: InstitutionBusinessRules['assessmentCycle'],
    label: string
  ) => {
    setRules({ ...rules, assessmentCycle: cycle });
    showToast(`考评周期已切换为：${label}`);
  };

  const removeAssessmentRule = (rule: AssessmentRuleItem) => {
    setRules({
      ...rules,
      assessmentRules: rules.assessmentRules.filter((item) => item.id !== rule.id),
    });
    showToast(`已删除考核项【${rule.metricName}】！`);
  };

  const setWorkflowType = (workflowType: InstitutionBusinessRules['workflowType'], label: string) => {
    setRules({ ...rules, workflowType });
    showToast(`已切换为【${label}】工作流！`);
  };

  const setReviewNodeOption = (
    level: number,
    field: 'allowTransfer' | 'allowDirectPublish',
    value: boolean
  ) => {
    setRules({
      ...rules,
      reviewNodes: rules.reviewNodes.map((node) =>
        node.level === level ? { ...node, [field]: value } : node
      ),
    });
  };

  const removeAutoApproveKeyword = (index: number) => {
    setRules({
      ...rules,
      autoApproveKeywords: rules.autoApproveKeywords.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const setPenaltyEnabled = (enabled: boolean) => {
    setRules({ ...rules, enablePenalty: enabled });
  };

  const setFastTrackEnabled = (enabled: boolean) => {
    setRules({ ...rules, enableFastTrack: enabled });
  };

  const toggleValueAddedService = (service: ValueAddedServiceItem) => {
    const services = rules.valueAddedServices || defaultValueAddedServices;
    setRules({
      ...rules,
      valueAddedServices: services.map((item) =>
        item.id === service.id ? { ...item, isEnabled: !item.isEnabled } : item
      ),
    });
    showToast(
      `已${service.isEnabled ? '停用' : '启用'}「${service.name}」增值扩展功能`,
      service.isEnabled ? 'info' : 'success'
    );
  };

  const saveTemplate = (template: TemplateConfigItem) => {
    if (!template.name.trim()) {
      showToast('请输入模板配置名称！', 'warning');
      return;
    }
    const updatedTemplate = { ...template, updatedAt: formatDateTime() };
    const updatedTemplates = rules.templates.some((item) => item.id === template.id)
      ? rules.templates.map((item) => (item.id === template.id ? updatedTemplate : item))
      : [...rules.templates, updatedTemplate];
    setRules({ ...rules, templates: updatedTemplates });
    setEditingTemplate(null);
    showToast('模板配置已成功保存并立即生效！', 'success');
  };

  const saveScoringRuleGroup = (group: ScoringRuleGroup) => {
    const updatedGroup = { ...group, updatedAt: formatDateTime(), levelCount: group.levels.length };
    const groups = rules.scoringRuleGroups || defaultRules.scoringRuleGroups || [];
    const updatedGroups = groups.some((item) => item.id === group.id)
      ? groups.map((item) => (item.id === group.id ? updatedGroup : item))
      : [...groups, updatedGroup];
    setRules({ ...rules, scoringRuleGroups: updatedGroups });
    setEditingScoringRuleGroup(null);
    showToast(`【${updatedGroup.name}】配置已保存！`, 'success');
  };

  const saveDictItem = (item: DictItem) => {
    const updatedItem = { ...item, updatedAt: formatDateTime() };
    const updatedItems = rules.dictItems.some((dictItem) => dictItem.id === item.id)
      ? rules.dictItems.map((dictItem) => (dictItem.id === item.id ? updatedItem : dictItem))
      : [...rules.dictItems, updatedItem];
    setRules({ ...rules, dictItems: updatedItems });
    setEditingDictItem(null);
    showToast(`【${updatedItem.label}】已保存！`, 'success');
  };

  const saveAssessmentRule = (rule: AssessmentRuleItem) => {
    setRules({
      ...rules,
      assessmentRules: rules.assessmentRules.map((item) => (item.id === rule.id ? rule : item)),
    });
    setEditingAssessment(null);
    showToast('考核指标已更新！', 'success');
  };

  return {
    state: {
      rules,
      activeNav,
      templateFilterType,
      templateSearchKeyword,
      viewingTemplate,
      editingTemplate,
      quickAddFieldType,
      scoringSearchKeyword,
      viewingScoringRuleGroup,
      editingScoringRuleGroup,
      editingDimension,
      selectedDictType,
      editingDictItem,
      viewingDictItem,
      dictSearchKeyword,
      editingAssessment,
      metricSearchName,
      metricCategoryFilter,
      metricSearchQuery,
      selectedMetric,
      simulatorInputs,
      filteredTemplates,
      filteredMetrics,
      simulatedMPI,
      allTemplatesCount: rules.templates?.length || 0,
      reportTemplatesCount: (rules.templates || []).filter((item) => item.type === '报送').length,
      activeTemplatesCount: (rules.templates || []).filter((item) => item.type === '激活').length,
      totalScoringWeight: rules.scoringDimensions.reduce((total, item) => total + item.weight, 0),
    },
    actions: {
      setRules,
      setActiveNav,
      setTemplateFilterType,
      setTemplateSearchKeyword,
      setViewingTemplate,
      setEditingTemplate,
      setQuickAddFieldType,
      setScoringSearchKeyword,
      setViewingScoringRuleGroup,
      setEditingScoringRuleGroup,
      setEditingDimension,
      setSelectedDictType,
      setEditingDictItem,
      setViewingDictItem,
      setDictSearchKeyword,
      setEditingAssessment,
      setMetricSearchName,
      setMetricCategoryFilter,
      setMetricSearchQuery,
      setSelectedMetric,
      setSimulatorInputs,
      handleSyncFromGlobal,
      isGlobalImmutable,
      handleNavChange,
      handleUpdateQrConfig,
      handleMetricSearch,
      handleMetricReset,
      createNewTemplate,
      addTemplateField,
      toggleTemplateStatus,
      removeTemplate,
      createNewScoringRuleGroup,
      addScoringLevel,
      toggleScoringRuleGroup,
      removeScoringRuleGroup,
      createNewDictItem,
      toggleDictItem,
      removeDictItem,
      createAssessmentRule,
      setAssessmentCycle,
      removeAssessmentRule,
      setWorkflowType,
      setReviewNodeOption,
      removeAutoApproveKeyword,
      setPenaltyEnabled,
      setFastTrackEnabled,
      toggleValueAddedService,
      saveTemplate,
      saveScoringRuleGroup,
      saveDictItem,
      saveAssessmentRule,
      handleSaveCurrentRules: () => {
        onSaveRules(rules);
        showToast('该机构业务规则已成功保存并立即生效！', 'success');
      },
      handleResetToDefault: () => {
        setRules(defaultRules);
        showToast('已重置为系统标准预设业务规则！', 'info');
      },
    },
  };
};
