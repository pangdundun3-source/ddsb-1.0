import React from 'react';
import {
  Institution,
  InstitutionBusinessRules,
  TemplateConfigItem,
  TemplateFieldItem,
  TemplateFieldType,
  ScoringDimension,
  DictItem,
  MetricFormulaConfig,
  ReviewLevelNode,
  LoginAuthConfig,
  ValueAddedServiceItem,
  OtherBusinessConfig,
  QrCodeUsageConfig,
  WechatMpConfig,
  MpMigrationConfig,
  GlobalMpControlConfig,
} from '../types';
import {
  OtherBusinessConfigTab,
  defaultOtherBusinessConfig,
} from './OtherBusinessConfigTab';
import {
  BusinessModuleId,
  V8BusinessConfigBoard,
} from './business/V8BusinessConfigBoard';
import { QrQuotaSection } from './other-config/QrQuotaSection';
import { GlobalQrDefaultsSection } from './other-config/GlobalQrDefaultsSection';
import { GlobalOtherConfigDefaultsSection } from './other-config/GlobalOtherConfigDefaultsSection';
import {
  mergeInstitutionRulesWithGlobal,
} from '../data/globalBusinessRules';
import { businessRuleStorage } from '../services/businessRuleStorage';
import { useBusinessRulesViewModel } from '../viewmodels/useBusinessRulesViewModel';

export const defaultValueAddedServices: ValueAddedServiceItem[] = [
  {
    id: 'vas-batch-review',
    name: '批量审核',
    isPurchased: true,
    isEnabled: true,
    tag: '增值扩展功能',
    description: '支持批量勾选多条报送线索与事项目录、快捷批量审核通过、批量驳回与一键签发转办，大幅提升处置效率',
    icon: 'auto_awesome',
  },
  {
    id: 'vas-screenshot-evidence',
    name: '截图取证',
    isPurchased: true,
    isEnabled: false,
    tag: '增值扩展功能',
    description: '自动化对涉事网页及社交媒体内容进行全屏快照截屏存证，生成区块链与防篡改水文可信取证包',
    icon: 'auto_awesome',
  },
  {
    id: 'vas-instruction-flow',
    name: '指令流转',
    isPurchased: true,
    isEnabled: true,
    tag: '增值扩展功能',
    description: '跨部门与下级节点指令下发、时限催办、督查跟进、反馈回复与闭环归档全流程协作引擎',
    icon: 'auto_awesome',
  },
  {
    id: 'vas-system-announcement',
    name: '系统公告',
    isPurchased: true,
    isEnabled: true,
    tag: '增值扩展功能',
    description: '支撑全网节点重大通知广播、突发风险预警弹窗强提醒及全局公告消息穿透推送',
    icon: 'auto_awesome',
  },
  {
    id: 'vas-first-publish-duplicate',
    name: '报送首发重复识别',
    isPurchased: true,
    isEnabled: true,
    tag: '增值扩展功能',
    description: '通过抓取报送链接的文章原文比对判断内容是否重复，并结合提交时间线智能判定首发，避免多头报送与重复审核计分。',
    icon: 'auto_awesome',
  },
];

export const standardReportFields: TemplateFieldItem[] = [
  {
    id: 'f-1',
    name: '报送主题/事件标题',
    type: 'text',
    required: true,
    placeholder: '请输入具体报送的主题或事件全称',
  },
  {
    id: 'f-2',
    name: '事件发生/发现时间',
    type: 'time',
    required: true,
    placeholder: '年/月/日 --:--',
  },
  {
    id: 'f-3',
    name: '涉事热度/影响数据',
    type: 'number',
    required: false,
    placeholder: '请输入传播量/阅读量等数据',
  },
  {
    id: 'f-4',
    name: '来源网址/文章出处',
    type: 'link',
    required: false,
    placeholder: 'https://...',
  },
  {
    id: 'f-5',
    name: '现场图片/证据附件',
    type: 'attachment',
    required: true,
    placeholder: '上传图片、视频或证明材料 / 支持图片、视频、PDF证明文档',
  },
  {
    id: 'f-6',
    name: '事件分类',
    type: 'select',
    required: true,
    placeholder: '请选择事件分类',
    options: ['时政要闻', '社会民生', '网络安全', '突发事件', '舆情线索'],
  },
];

export const standardActivationFields: TemplateFieldItem[] = [
  {
    id: 'fa-1',
    name: '真实姓名',
    type: 'text',
    required: true,
    placeholder: '请输入真实姓名',
  },
  {
    id: 'fa-2',
    name: '身份角色',
    type: 'role',
    required: true,
    placeholder: '请选择身份角色',
    options: ['超级管理员', '机构管理员', '上报员', '审核员', '运营管理员', '临时审核员'],
  },
  {
    id: 'fa-3',
    name: '手机号码',
    type: 'phone',
    required: true,
    placeholder: '请输入 11 位手机号码',
  },
  {
    id: 'fa-4',
    name: '性别',
    type: 'gender',
    required: false,
    placeholder: '请选择性别',
    options: ['男', '女'],
  },
  {
    id: 'fa-5',
    name: '身份证号',
    type: 'idcard',
    required: true,
    placeholder: '请输入身份证号码',
  },
  {
    id: 'fa-6',
    name: '银行卡号',
    type: 'bankcard',
    required: false,
    placeholder: '请输入银行卡号',
  },
  {
    id: 'fa-7',
    name: '身份证照片/证明附件',
    type: 'attachment',
    required: true,
    placeholder: '请上传身份证照片或授权证明材料',
  },
];

export const defaultInstitutionBusinessRules: InstitutionBusinessRules = {
  // 1. 模版配置 (Template Configuration)
  selectedTemplateId: 'tpl-3',
  globalWatermarkText: '融媒体速报·内部审阅件',
  defaultHeaderLogoUrl: '',
  templates: [
    {
      id: 'tpl-1',
      name: '标准图文报送模板',
      type: '报送',
      status: true,
      isSystem: true,
      updatedAt: '2023-10-24 10:00:00',
      description: '适用于日常标准文字、图片及证明材料的合规上报',
      fields: standardReportFields,
      category: '时政要闻',
      themeColor: '#1890ff',
      isDefault: true,
      coverStyle: 'standard',
      headerText: '【融媒体速报】政务信息公开专刊',
      footerText: '本报告由融媒体系统自动汇聚生成，未经许可请勿外传。',
      watermarkText: '融媒体速报·政务专版',
      enableWatermark: true,
    },
    {
      id: 'tpl-2',
      name: '突发事件快速上报',
      type: '报送',
      status: true,
      isSystem: false,
      updatedAt: '2023-11-02 14:30:22',
      description: '精简版快速通道，优先确保事件核心要素第一时间到达',
      fields: [
        {
          id: 'f-2-1',
          name: '突发事件核心简述',
          type: 'text',
          required: true,
          placeholder: '简述突发情况及影响范围',
        },
        {
          id: 'f-2-2',
          name: '发生精准时间',
          type: 'time',
          required: true,
          placeholder: '年/月/日 --:--',
        },
        {
          id: 'f-2-3',
          name: '现场第一手视频/照片',
          type: 'attachment',
          required: true,
          placeholder: '上传事发现场清晰佐证照片或视频',
        },
        {
          id: 'f-2-4',
          name: '紧急联络人及电话',
          type: 'phone',
          required: false,
          placeholder: '输入现场值守或报告人员手机号',
        },
      ],
      category: '应急指挥',
      themeColor: '#ff4d4f',
      isDefault: false,
      coverStyle: 'banner',
      headerText: '【突发应急通报】网安与应急指挥中心专报',
      footerText: '应急指挥专用通道，信息已加密校验。',
      watermarkText: '应急指挥·特级密件',
      enableWatermark: true,
    },
    {
      id: 'tpl-3',
      name: '登录验证激活模板',
      type: '激活',
      status: true,
      isSystem: true,
      updatedAt: '2023-10-25 11:20:00',
      description: '触发高等级舆情时自动激活全员推屏通知及大屏研判流程',
      fields: standardActivationFields,
      category: '账号激活',
      themeColor: '#722ed1',
      isDefault: false,
      coverStyle: 'standard',
      headerText: '【账号激活】全员认证授权',
      footerText: '账号信息已完成实名鉴权加密。',
      watermarkText: '实名认证·保密专件',
      enableWatermark: false,
    },
    {
      id: 'tpl-4',
      name: '登录验证激活模板-01',
      type: '激活',
      status: true,
      isSystem: false,
      updatedAt: '2023-11-01 09:40:15',
      description: '大容量音视频流媒体智能分流与自动化激活规则',
      fields: [
        {
          id: 'f-4-1',
          name: '视频音轨关键帧摘要',
          type: 'text',
          required: true,
          placeholder: '提取音视频关键帧及涉案音轨特征摘要',
        },
        {
          id: 'f-4-2',
          name: '流媒体链接',
          type: 'link',
          required: true,
          placeholder: '输入 RTMP / HLS 或网页音视频流媒体直链',
        },
      ],
      category: '流媒体激活',
      themeColor: '#13c2c2',
      isDefault: false,
      coverStyle: 'card',
      headerText: '【流媒体通道】智能分流激活',
      footerText: '流媒体推流通道已开启硬件加速。',
      watermarkText: '流媒体·智能调度',
      enableWatermark: true,
    },
  ],

  // 2. 审核打分规则 (Review Scoring Rules)
  passScore: 60,
  excellentScore: 90,
  zeroToleranceViolation: true,
  scoringRuleGroups: [
    {
      id: 'srg-1',
      name: '标准五级百分制打分规则组',
      scope: '全部上报统一适用',
      totalScore: 100,
      levelCount: 5,
      status: true,
      isSystem: true,
      isCurrentActive: true,
      description: '适用于标准报送事件的五级梯次打分，规则总分为 100 分',
      updatedAt: '2023-10-20 08:30:00',
      levels: [
        { id: 'lvl-1', name: '一等（特优）', score: 100, description: '省级以上领导批示或极高价值采纳' },
        { id: 'lvl-2', name: '二等（优秀）', score: 90, description: '市级领导批示或形成深度专报' },
        { id: 'lvl-3', name: '三等（良好）', score: 80, description: '研判要素齐全且上报迅速及时' },
        { id: 'lvl-4', name: '四等（合格）', score: 70, description: '基础提报符合规范与事实' },
        { id: 'lvl-5', name: '五等（基本）', score: 60, description: '提供线索参考价值' },
      ],
    },
    {
      id: 'srg-2',
      name: '精简三级考核打分规则组',
      scope: '全部上报统一适用',
      totalScore: 10,
      levelCount: 3,
      status: false,
      isSystem: false,
      isCurrentActive: false,
      description: '适用于突发事件快速处置阶段的三级简易评定',
      updatedAt: '2023-10-28 14:22:00',
      levels: [
        { id: 'lvl-21', name: '一级（优）', score: 10, description: '快速响应且事实要素完备清晰' },
        { id: 'lvl-22', name: '二级（良）', score: 8, description: '按时报送，事实核实准确' },
        { id: 'lvl-23', name: '三级（合）', score: 6, description: '基本符合报送处置规范要求' },
      ],
    },
    {
      id: 'srg-3',
      name: '四级专项引导打分组',
      scope: '全部上报统一适用',
      totalScore: 50,
      levelCount: 4,
      status: false,
      isSystem: false,
      isCurrentActive: false,
      description: '专项舆情引导行动评分规则，设4个互斥评分等级，规则总分为 50 分',
      updatedAt: '2023-11-05 16:10:00',
      levels: [
        { id: 'lvl-31', name: 'A级（卓越）', score: 50, description: '引导成效显著，舆情态势明显平息' },
        { id: 'lvl-32', name: 'B级（优良）', score: 40, description: '有效引导主流声音，网民反馈正面' },
        { id: 'lvl-33', name: 'C级（合格）', score: 30, description: '完成指定跟帖与发声动作' },
        { id: 'lvl-34', name: 'D级（基础）', score: 20, description: '基础参与，符合最低引导指标' },
      ],
    },
  ],
  scoringDimensions: [
    {
      id: 'dim-1',
      name: '政治导向与政策合规',
      maxScore: 30,
      weight: 30,
      description: '严格遵循意识形态红线、法律法规及国家政策导向。',
      deductionRules: [
        '涉及严重违规导向偏差，一票否决直接判定 0 分',
        '政策引用表述不规范，每处扣 5 分',
        '未标注权威消息来源出处，扣 3 分',
      ],
    },
    {
      id: 'dim-2',
      name: '事实准确性与信息溯源',
      maxScore: 25,
      weight: 25,
      description: '时间、地点、人物、数据等核心新闻要素真实准确。',
      deductionRules: [
        '关键统计数据出现误差，扣 10 分',
        '事件发生地或当事人职务出现差错，扣 8 分',
        '图片/视频素材与主题不符，扣 5 分',
      ],
    },
    {
      id: 'dim-3',
      name: '文字规范与错别字控制',
      maxScore: 20,
      weight: 20,
      description: '标点符号、领导人姓名职务、易混淆词及错别字审核。',
      deductionRules: [
        '领导人姓名或重要职务书写错误，一票否决直接 0 分',
        '一般字词差错或病句，每处扣 2 分',
        '标点符号及格式排版错误，每处扣 1 分',
      ],
    },
    {
      id: 'dim-4',
      name: '时效性与传播价值',
      maxScore: 15,
      weight: 15,
      description: '突发事件首发响应时间、内容深度与传播引导价值。',
      deductionRules: [
        '事件发生后超过 2 小时未完成首发，扣 5 分',
        '同质化炒作或严重滞后，扣 8 分',
      ],
    },
    {
      id: 'dim-5',
      name: '多媒体质量与视觉呈现',
      maxScore: 10,
      weight: 10,
      description: '配图分辨率、音视频清晰度、封面图美观度及排版布局。',
      deductionRules: [
        '配图存在水印模糊或拉伸变形，扣 3 分',
        '排版字体过小或对比度不足，扣 2 分',
      ],
    },
  ],

  // 3. 数据字典管理
  dictItems: [
    // 审核驳回理由 (reject_reason)
    {
      id: 'd-rr-1',
      dictType: 'reject_reason',
      label: '信息真实性核查不通过',
      value: 'fake_info',
      sortOrder: 1,
      isSystem: true,
      status: true,
      description: '缺乏实质性事实依据或为虚假流言',
      updatedAt: '2023-10-15 09:00:00',
    },
    {
      id: 'd-rr-2',
      dictType: 'reject_reason',
      label: '内容重复提交',
      value: 'duplicate_report',
      sortOrder: 2,
      isSystem: true,
      status: true,
      description: '同一事件或舆情线索已由其他部门先行报送',
      updatedAt: '2023-10-15 09:00:00',
    },
    {
      id: 'd-rr-3',
      dictType: 'reject_reason',
      label: '格式要素不健全',
      value: 'missing_elements',
      sortOrder: 3,
      isSystem: false,
      status: true,
      description: '缺少时间、地点或核心事实等关键佐证材料',
      updatedAt: '2023-10-22 13:45:00',
    },
    {
      id: 'd-rr-4',
      dictType: 'reject_reason',
      label: '跨管辖范围报送',
      value: 'out_of_jurisdiction',
      sortOrder: 4,
      isSystem: false,
      status: true,
      description: '不属于本辖区或本部门职责处理范畴，需退回重拟',
      updatedAt: '2023-11-02 11:10:00',
    },
    {
      id: 'd-rr-5',
      dictType: 'reject_reason',
      label: '凭证图片模糊不符',
      value: 'invalid_attachment',
      sortOrder: 5,
      isSystem: false,
      status: true,
      description: '上传的现场截图或说明文件无法有效佐证主张',
      updatedAt: '2023-11-05 14:00:00',
    },

    // 人员标签 (person_tag)
    {
      id: 'd-pt-1',
      dictType: 'person_tag',
      label: '骨干采编员',
      value: 'core_reporter',
      sortOrder: 1,
      isSystem: true,
      status: true,
      description: '具备高级独立采写与专题舆情报送权限的业务骨干',
      updatedAt: '2023-10-15 09:00:00',
    },
    {
      id: 'd-pt-2',
      dictType: 'person_tag',
      label: '资深审核专家',
      value: 'senior_reviewer',
      sortOrder: 2,
      isSystem: true,
      status: true,
      description: '具备全类别稿件初审、复审及终审签发资质的高级人员',
      updatedAt: '2023-10-15 09:00:00',
    },
    {
      id: 'd-pt-3',
      dictType: 'person_tag',
      label: '基层网格专员',
      value: 'grid_specialist',
      sortOrder: 3,
      isSystem: false,
      status: true,
      description: '负责一线网格突发事件速报与现场佐证核查的人员',
      updatedAt: '2023-10-20 10:30:00',
    },
    {
      id: 'd-pt-4',
      dictType: 'person_tag',
      label: '舆情分析师',
      value: 'opinion_analyst',
      sortOrder: 4,
      isSystem: false,
      status: true,
      description: '专注于负面舆情走势研判、转办督办及综合报告撰写',
      updatedAt: '2023-10-25 15:20:00',
    },
    {
      id: 'd-pt-5',
      dictType: 'person_tag',
      label: '值班应急员',
      value: 'emergency_duty',
      sortOrder: 5,
      isSystem: false,
      status: true,
      description: '参与7×24小时应急值守与特急密件快速流转响应',
      updatedAt: '2023-11-01 08:30:00',
    },
    {
      id: 'd-pt-6',
      dictType: 'person_tag',
      label: '特约通讯员',
      value: 'special_correspondent',
      sortOrder: 6,
      isSystem: false,
      status: true,
      description: '行业外部特约稿源与协作单位信息报送专员',
      updatedAt: '2023-11-10 16:45:00',
    },

    // 稿件分类 (article_category)
    { id: 'd-1', dictType: 'article_category', label: '时政要闻', value: 'politics', sortOrder: 1, isSystem: true, status: true, description: '涉及国家重大政策、时政要闻及公报速报', updatedAt: '2023-10-15 09:00:00' },
    { id: 'd-2', dictType: 'article_category', label: '应急预警', value: 'emergency', sortOrder: 2, isSystem: true, status: true, description: '突发防汛、防火、气象地质及重大应急响应', updatedAt: '2023-10-15 09:00:00' },
    { id: 'd-3', dictType: 'article_category', label: '民生服务', value: 'livelihood', sortOrder: 3, isSystem: true, status: true, description: '交通、水电、医疗教育等市民关切热点', updatedAt: '2023-10-15 09:00:00' },
    { id: 'd-4', dictType: 'article_category', label: '经济产业', value: 'economy', sortOrder: 4, isSystem: false, status: true, description: '重大项目投产、产业升级与招商引资动态', updatedAt: '2023-10-15 09:00:00' },
    { id: 'd-5', dictType: 'article_category', label: '科教文卫', value: 'culture_edu', sortOrder: 5, isSystem: false, status: true, description: '科技创新、文化活动与高校科研成果', updatedAt: '2023-10-15 09:00:00' },
    { id: 'd-6', dictType: 'article_category', label: '网安舆情', value: 'cyber_security', sortOrder: 6, isSystem: false, status: true, description: '网络空间安全事件、负面舆情监控与辟谣', updatedAt: '2023-10-15 09:00:00' },

    // 敏感等级 (sensitivity_level)
    { id: 'd-7', dictType: 'sensitivity_level', label: '公开通报 (全网可见)', value: 'public', sortOrder: 1, isSystem: true, status: true, description: '无需脱敏，可直接全网发布并对外公开', updatedAt: '2023-10-15 09:00:00' },
    { id: 'd-8', dictType: 'sensitivity_level', label: '内部审阅 (机构内可见)', value: 'internal', sortOrder: 2, isSystem: true, status: true, description: '仅限本机构及所属采编人员内部交流审阅', updatedAt: '2023-10-15 09:00:00' },
    { id: 'd-9', dictType: 'sensitivity_level', label: '机密研判 (权限可见)', value: 'confidential', sortOrder: 3, isSystem: true, status: true, description: '需具备审核权限或领导批示后方可查阅', updatedAt: '2023-10-15 09:00:00' },
    { id: 'd-10', dictType: 'sensitivity_level', label: '特急密件 (专人专阅)', value: 'top_secret', sortOrder: 4, isSystem: true, status: true, description: '最高敏感等级，专人专办并全程审计追踪', updatedAt: '2023-10-15 09:00:00' },
  ],

  // 4. 考核规则
  assessmentCycle: 'monthly',
  enablePenalty: true,
  assessmentRules: [
    {
      id: 'ar-1',
      metricName: '月度速报发稿基准量',
      targetValue: 60,
      unit: '篇/月',
      cycle: 'monthly',
      weight: 25,
      rewardPoints: 10,
      penaltyPoints: 15,
    },
    {
      id: 'ar-2',
      metricName: '原创独家稿件占比',
      targetValue: 40,
      unit: '%',
      cycle: 'monthly',
      weight: 20,
      rewardPoints: 15,
      penaltyPoints: 10,
    },
    {
      id: 'ar-3',
      metricName: '突发事件响应首报时效',
      targetValue: 30,
      unit: '分钟内',
      cycle: 'monthly',
      weight: 25,
      rewardPoints: 20,
      penaltyPoints: 25,
    },
    {
      id: 'ar-4',
      metricName: '稿件审核综合采纳率',
      targetValue: 85,
      unit: '%',
      cycle: 'monthly',
      weight: 15,
      rewardPoints: 10,
      penaltyPoints: 10,
    },
    {
      id: 'ar-5',
      metricName: '严重差错/错情率上限',
      targetValue: 0,
      unit: '次/月',
      cycle: 'monthly',
      weight: 15,
      rewardPoints: 5,
      penaltyPoints: 50,
    },
  ],

  // 5. 统计指标
  metricsFormula: {
    readWeight: 0.3,
    likeWeight: 0.15,
    shareWeight: 0.35,
    commentWeight: 0.2,
    originalBonus: 1.2,
    activeThreshold: 3,
    statDimensions: [
      'publish_count',
      'read_count',
      'share_count',
      'mpi_index',
      'avg_review_hours',
      'error_rate',
    ],
  },

  // 6. 审核流程配置
  workflowType: 'two_level',
  enableFastTrack: true,
  autoApproveKeywords: ['例行日常晨报', '每日天气快讯', '节假日温馨提示'],
  reviewNodes: [
    {
      level: 1,
      title: '初审·内容采编校对',
      role: '采编初审员',
      approvers: ['王飞飞', '李晓燕', '张海峰'],
      timeoutHours: 2,
      allowTransfer: true,
      allowDirectPublish: false,
    },
    {
      level: 2,
      title: '复审·部门负责人/责任编辑',
      role: '栏目主编 / 责任编辑',
      approvers: ['廖伟', '陈建国'],
      timeoutHours: 4,
      allowTransfer: true,
      allowDirectPublish: true,
    },
    {
      level: 3,
      title: '终审·分管领导签发 (特级流程)',
      role: '分管副局长 / 宣传部长',
      approvers: ['张锐（部长）'],
      timeoutHours: 12,
      allowTransfer: false,
      allowDirectPublish: true,
    },
  ],

  // 7. 增值业务
  valueAddedServices: defaultValueAddedServices,

  // 8. 其他配置 (二维码使用情况及额度管理)
  otherConfig: defaultOtherBusinessConfig,

  // 登录验证方式 (保留兼容)
  loginAuth: {
    allowPasswordLogin: true,
    allowSmsLogin: true,
    allowQyWechatQr: true,
    allowDingTalkSso: true,
    allowFeishuSso: false,
    requireMfa: false,
    passwordExpireDays: 90,
    sessionTimeoutMinutes: 30,
    ipWhitelistEnabled: false,
    ipWhitelist: '192.168.1.0/24\n10.10.0.0/16\n221.178.102.50',
  },
};

export interface StatMetricItem {
  id: string;
  name: string;
  unit: string;
  category: string;
  description: string;
  calculation: string;
}

export const STAT_METRICS_LIST: StatMetricItem[] = [
  {
    id: 'm-1',
    name: '速报上报总量',
    unit: '件',
    category: '规模类',
    description: '衡量平台整体报送规模的基础指标',
    calculation: '统计所有已提交的速报记录总数',
  },
  {
    id: 'm-2',
    name: '采纳通过数',
    unit: '件',
    category: '规模类',
    description: '衡量经过审核并被正式采纳录用的速报总量',
    calculation: '统计审核状态为“已采纳/已通过”的速报数量',
  },
  {
    id: 'm-3',
    name: '今日新增上报',
    unit: '件',
    category: '规模类',
    description: '反映当天实时上报活跃度及动态增量',
    calculation: '统计当日 00:00 至当前时刻提交的上报数量',
  },
  {
    id: 'm-4',
    name: '审核总量',
    unit: '次',
    category: '规模类',
    description: '反映审核人员与编辑流程的处理负荷',
    calculation: '统计所有经初审、复审或终审处理的审核记录总次数',
  },
  {
    id: 'm-5',
    name: '负面舆情转办数',
    unit: '条',
    category: '处置类',
    description: '反映需要跨部门协同或属地处置的负面舆情线索量',
    calculation: '统计状态为“已转办”及流转至责任部门的负面线索总数',
  },
  {
    id: 'm-6',
    name: '审核通过率',
    unit: '%',
    category: '质量类',
    description: '评估稿件初审与复审的整体内容合规及采纳质量',
    calculation: '(审核通过数 / 审核总提交数) × 100%',
  },
  {
    id: 'm-7',
    name: '驳回率',
    unit: '%',
    category: '质量类',
    description: '反映报送内容因不合规、要素不全被退回修改的比例',
    calculation: '(驳回退回数 / 审核总提交数) × 100%',
  },
  {
    id: 'm-8',
    name: '采纳转化率',
    unit: '%',
    category: '质量类',
    description: '衡量报送线索最终转化为正式速报、通报的高价值转化效能',
    calculation: '(最终采纳发稿数 / 上报线索总数) × 100%',
  },
  {
    id: 'm-9',
    name: '重复上报率',
    unit: '%',
    category: '质量类',
    description: '检测同类事件多机构重复多头上报的冗余程度',
    calculation: '(同事件重复上报记录数 / 上报记录总数) × 100%',
  },
  {
    id: 'm-10',
    name: '信息要素完整率',
    unit: '%',
    category: '质量类',
    description: '评估上报内容在时间、地点、主体、事实、佐证等维度的完备性',
    calculation: '(五要素齐备合格上报数 / 上报总记录数) × 100%',
  },
  {
    id: 'm-11',
    name: '平均审核响应',
    unit: '分钟',
    category: '效率类',
    description: '从稿件提交到审核员认领并给出初审意见的平均等待时间',
    calculation: '∑(首次审核时间 - 提交时间) / 审核总件数',
  },
  {
    id: 'm-12',
    name: '首审平均耗时',
    unit: '分钟',
    category: '效率类',
    description: '初级审核节点从开始处理到完成一审决定的平均时长',
    calculation: '∑(一审完成时间 - 一审认领时间) / 一审总件数',
  },
  {
    id: 'm-13',
    name: '转办平均耗时',
    unit: '小时',
    category: '效率类',
    description: '从研判确认需要转办到责任部门正式接收的时长',
    calculation: '∑(部门接收时间 - 发起转办时间) / 转办总件数',
  },
  {
    id: 'm-14',
    name: '超时处置率',
    unit: '%',
    category: '效率类',
    description: '超出系统或业务规定预警处置SLA时限的事件占比',
    calculation: '(超时处置完成及未完成数 / 应处置事件总数) × 100%',
  },
  {
    id: 'm-15',
    name: '负面舆情已办结数',
    unit: '条',
    category: '处置类',
    description: '反映已完成核查、回应、处置并闭环归档的负面舆情总量',
    calculation: '统计处置状态为“已办结/归档”的负面舆情数量',
  },
  {
    id: 'm-16',
    name: '按时办结率',
    unit: '%',
    category: '效率类',
    description: '在规定处置时限内完成闭环处置并反馈的工单比例',
    calculation: '(在SLA时限内办结数 / 已办结事件总数) × 100%',
  },
  {
    id: 'm-17',
    name: '待办转办数',
    unit: '条',
    category: '处置类',
    description: '当前处于流转中、等待责任单位签收处置的在途事件数',
    calculation: '统计处于“待签收/转办中”状态的未完结任务数',
  },
  {
    id: 'm-18',
    name: '高风险待处置数',
    unit: '条',
    category: '处置类',
    description: '敏感等级为红色特急或高风险且尚未闭环处置的重点事件数',
    calculation: '统计敏感等级为“特急密件/高风险”且未办结的记录数',
  },
  {
    id: 'm-19',
    name: '子机构总数',
    unit: '个',
    category: '机构与人员',
    description: '当前机构体系下辖的二级、三级所有直属与关联分支机构数',
    calculation: '统计机构层级树中状态为正常的所有下级机构总数',
  },
  {
    id: 'm-20',
    name: '平台人员总数',
    unit: '人',
    category: '机构与人员',
    description: '已开通并正常在册的采编员、审核员、管理员总账号数',
    calculation: '统计系统内有效激活状态的用户账号总数',
  },
  {
    id: 'm-21',
    name: '活跃机构数',
    unit: '个',
    category: '机构与人员',
    description: '指定统计周期内至少提交或处理过1次业务的有效机构数',
    calculation: '统计周期内有上报或审核日志记录的去重机构数',
  },
  {
    id: 'm-22',
    name: '人员参与率',
    unit: '%',
    category: '机构与人员',
    description: '在册人员在统计周期内实际参与速报报送与审核的比例',
    calculation: '(周期内产生操作的人员数 / 平台人员总数) × 100%',
  },
  {
    id: 'm-23',
    name: '上报趋势',
    unit: '折线/柱状',
    category: '趋势类',
    description: '按日/周/月时间轴展示速报上报总量的动态波动走势',
    calculation: '按时间维度聚合各时间节点的提交上报总量',
  },
  {
    id: 'm-24',
    name: '审核通过趋势',
    unit: '折线',
    category: '趋势类',
    description: '展示不同周期内审核通过量的发展变化趋势',
    calculation: '按时间周期聚合审核状态为通过的记录数量',
  },
  {
    id: 'm-25',
    name: '负面舆情趋势',
    unit: '折线/面积',
    category: '趋势类',
    description: '反映各时段负面舆情热度升降与预警走势',
    calculation: '按时间维度聚合负面与高风险等级的舆情条数',
  },
  {
    id: 'm-26',
    name: '舆情分类分布',
    unit: '饼图/环形',
    category: '分布类',
    description: '展示时政、民生、应急、网安等各类别的结构占比分布',
    calculation: '按事件分类字典聚合统计各类别的占比百分比',
  },
  {
    id: 'm-27',
    name: '来源渠道分布',
    unit: '雷达/饼图',
    category: '分布类',
    description: '统计各信息采集通道（PC端、移动端、接口同步等）来源占比',
    calculation: '按上报入口渠道统计各渠道的记录数与占比',
  },
  {
    id: 'm-28',
    name: '审核状态分布',
    unit: '柱图/饼图',
    category: '分布类',
    description: '统计待初审、待复审、已通过、已驳回等各状态的整体分布',
    calculation: '按审核状态枚举值汇总各状态下的稿件存量',
  },
  {
    id: 'm-29',
    name: '机构上报排行',
    unit: '榜单',
    category: '排行类',
    description: '对各直属及下辖机构的上报总量、采纳量进行降序排名',
    calculation: '按机构分组统计上报有效总量并降序排列 TOP 榜',
  },
  {
    id: 'm-30',
    name: '人员报送排行',
    unit: '榜单',
    category: '排行类',
    description: '对采编工作人员的发稿量、采纳得分进行个人贡献排名',
    calculation: '按采编人员账号聚合发稿量与积分并降序排列',
  },
  {
    id: 'm-31',
    name: '响应效率排行',
    unit: '榜单',
    category: '排行类',
    description: '对各机构与审核人员的平均处理时效进行效率排行榜',
    calculation: '按平均处置响应时间升序排列，耗时越短排名越靠前',
  },
];

// Business Rules Sub-Tabs Configuration
export type BusinessRuleNavKey =
  | 'templates'
  | 'scoring'
  | 'dictionary'
  | 'workflow'
  | 'value_added'
  | 'qr_code'
  | 'other';

interface NavItem {
  key: BusinessRuleNavKey;
  label: string;
  icon: string;
  description: string;
  badge?: string;
}

const RULE_NAV_ITEMS: NavItem[] = [
  {
    key: 'templates',
    label: '模板配置',
    icon: 'dashboard_customize',
    description: '速报样式模板、封面排版风格与水印设置',
    badge: '4套',
  },
  {
    key: 'workflow',
    label: '审核流程配置',
    icon: 'account_tree',
    description: '一审/二审/三审流程节点、审批人与绿色通道',
    badge: '两级',
  },
  {
    key: 'scoring',
    label: '审核打分规则',
    icon: 'fact_check',
    description: '审核打分规则组、互斥等级方案与适用范围',
    badge: '规则组',
  },
  {
    key: 'qr_code',
    label: '激活码配置',
    icon: 'qr_code_2',
    description: '当前机构专属激活码名额额度管理、增发记录与绑定人员名单',
    badge: '名额',
  },
  {
    key: 'value_added',
    label: '增值业务',
    icon: 'auto_awesome',
    description: '批量审核、截图取证、指令流转、系统公告与首发重复识别增值扩展',
    badge: '5项',
  },
  {
    key: 'dictionary',
    label: '数据字典管理',
    icon: 'menu_book',
    description: '稿件分类、敏感等级、处置状态与部门枚举',
    badge: '4类',
  },
  {
    key: 'other',
    label: '公众号换绑',
    icon: 'sync_alt',
    description: '微信公众号接入通道与采编人员一键换绑迁移',
    badge: '公众号',
  },
];

interface Props {
  institution?: Institution | null;
  isCreateMode?: boolean;
  isGlobalScope?: boolean; // 是否全平台全局配置模式
  initialNav?: BusinessRuleNavKey;
  hideSubNav?: boolean;
  onSaveRules: (rules: InstitutionBusinessRules) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const InstitutionBusinessRulesTab: React.FC<Props> = ({
  institution,
  isCreateMode,
  isGlobalScope = false,
  initialNav,
  hideSubNav = false,
  onSaveRules,
  showToast,
}) => {
  const { state, actions } = useBusinessRulesViewModel({
    institution,
    isGlobalScope,
    initialNav,
    defaultRules: defaultInstitutionBusinessRules,
    defaultOtherBusinessConfig,
    defaultValueAddedServices,
    statMetrics: STAT_METRICS_LIST,
    readGlobalRules: businessRuleStorage.readGlobalRules,
    mergeWithGlobal: mergeInstitutionRulesWithGlobal,
    onSaveRules,
    showToast,
  });
  const {
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
    allTemplatesCount,
    reportTemplatesCount,
    activeTemplatesCount,
    totalScoringWeight,
  } = state;
  const {
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
    handleSaveCurrentRules,
    handleResetToDefault,
  } = actions;

  // 将 MT 模块导航映射到 V8 业务配置维护的模块，右侧内容由 V8 同款面板承载
  const V8_NAV_TO_MODULE: Partial<Record<BusinessRuleNavKey, BusinessModuleId>> = {
    templates: 'report_template',
    scoring: 'audit_score',
    dictionary: 'data_dict',
    workflow: 'audit_flow',
    value_added: 'value_added',
  };
  const activeV8Module = V8_NAV_TO_MODULE[activeNav];
  const [showValueAddedBanner, setShowValueAddedBanner] = React.useState(true);
  const [draggingFieldIdx, setDraggingFieldIdx] = React.useState<number | null>(null);
  const [draggingLevelIdx, setDraggingLevelIdx] = React.useState<number | null>(null);

  const handleDropField = (targetIdx: number) => {
    if (draggingFieldIdx === null || draggingFieldIdx === targetIdx || !editingTemplate) {
      setDraggingFieldIdx(null);
      return;
    }
    const currentFields = [...(editingTemplate.fields || [])];
    const [moved] = currentFields.splice(draggingFieldIdx, 1);
    currentFields.splice(targetIdx, 0, moved);
    setEditingTemplate({ ...editingTemplate, fields: currentFields });
    setDraggingFieldIdx(null);
  };

  const handleDropLevel = (targetIdx: number) => {
    if (draggingLevelIdx === null || draggingLevelIdx === targetIdx || !editingScoringRuleGroup) {
      setDraggingLevelIdx(null);
      return;
    }
    const currentLevels = [...editingScoringRuleGroup.levels];
    const [moved] = currentLevels.splice(draggingLevelIdx, 1);
    currentLevels.splice(targetIdx, 0, moved);
    setEditingScoringRuleGroup({ ...editingScoringRuleGroup, levels: currentLevels });
    setDraggingLevelIdx(null);
  };
  const v8StorageKey = isGlobalScope
    ? 'mt_global_v8_business_config'
    : `mt_inst_v8_business_config_${institution?.id ?? 'new'}`;
  const v8FallbackStorageKey = isGlobalScope ? undefined : 'mt_global_v8_business_config';

  const handleSaveGlobalMpDefaults = (mpConfig: WechatMpConfig) => {
    const updated: InstitutionBusinessRules = {
      ...rules,
      otherConfig: {
        ...defaultOtherBusinessConfig,
        ...(rules.otherConfig || {}),
        wechatMp: mpConfig,
      },
    };
    setRules(updated);
    onSaveRules(updated);
  };

  const handleSaveGlobalMigrationDefaults = (migration: MpMigrationConfig) => {
    const updated: InstitutionBusinessRules = {
      ...rules,
      otherConfig: {
        ...defaultOtherBusinessConfig,
        ...(rules.otherConfig || {}),
        migration,
      },
    };
    setRules(updated);
    onSaveRules(updated);
  };

  const handleSaveGlobalOtherConfig = (
    control: GlobalMpControlConfig,
    mpConfig?: WechatMpConfig,
    migration?: MpMigrationConfig
  ) => {
    const updated: InstitutionBusinessRules = {
      ...rules,
      otherConfig: {
        ...defaultOtherBusinessConfig,
        ...(rules.otherConfig || {}),
        globalMpControl: control,
        ...(mpConfig ? { wechatMp: mpConfig } : {}),
        ...(migration ? { migration } : {}),
      },
    };
    setRules(updated);
    onSaveRules(updated);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Main Layout: Either Two-Column with Left Sub-Nav or Full-Width Panel */}
      <div className={hideSubNav ? 'space-y-6 w-full' : 'flex flex-col lg:flex-row gap-5 items-start'}>
        {/* Left Vertical Sub-Nav */}
        {!hideSubNav && (
          <div className="w-full lg:w-48 shrink-0 bg-white rounded-lg border border-gray-200/80 shadow-2xs overflow-hidden sticky top-4">
            <div className="p-1.5 space-y-1">
              {RULE_NAV_ITEMS.map((item) => {
                const isActive = activeNav === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavChange(item.key)}
                    className={`w-full text-left px-3 py-2.5 rounded-md transition-all cursor-pointer flex items-center group ${
                      isActive
                        ? 'bg-blue-50 text-[#1890ff] font-bold shadow-2xs border border-blue-200/80'
                        : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`material-symbols-outlined text-[19px] shrink-0 transition-colors ${
                          isActive ? 'text-[#1890ff]' : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="text-xs truncate font-medium">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Configuration Content Panel */}
        <div className={hideSubNav ? 'space-y-6 w-full' : 'flex-1 min-w-0 space-y-6'}>
          {/* 与 V8 业务配置维护 1:1 对齐的模块右侧内容（模板配置/审核打分/字典/审核流程/增值业务） */}
          {activeV8Module && (
            <V8BusinessConfigBoard
              key={activeV8Module}
              embedded
              initialModule={activeV8Module}
              storageKey={v8StorageKey}
              fallbackStorageKey={v8FallbackStorageKey}
              valueAddedAllOperable
              hideValueAddedStatusBadge={isGlobalScope}
              isGlobalScope={isGlobalScope}
              onModuleChange={(mod) => {
                const MODULE_TO_V8_NAV: Record<string, BusinessRuleNavKey> = {
                  report_template: 'templates',
                  audit_score: 'scoring',
                  data_dict: 'dictionary',
                  audit_flow: 'workflow',
                  value_added: 'value_added',
                };
                const targetNav = MODULE_TO_V8_NAV[mod];
                if (targetNav) {
                  setActiveNav(targetNav);
                }
              }}
            />
          )}

          {/* ========================================================= */}
          {/* 1. 模版配置 (Template Configuration) - Redesigned */}
          {/* ========================================================= */}
          {activeNav === '__v8_1' && (
            <div className="space-y-4">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#1677ff] text-[22px]">
                      dashboard_customize
                    </span>
                    <span>模板配置</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    根据业务场景灵活配置上报、处置与研判表单字段，支持可视化动态表单定制与实时预览。
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto">
                  {/* Search Input */}
                  <div className="relative flex-1 sm:w-64">
                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={templateSearchKeyword}
                      onChange={(e) => setTemplateSearchKeyword(e.target.value)}
                      placeholder="搜索模板配置名称/编码/描述..."
                      className="w-full pl-8 pr-7 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff]/30 bg-white"
                    />
                    {templateSearchKeyword && (
                      <button
                        type="button"
                        onClick={() => setTemplateSearchKeyword('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    )}
                  </div>

                  {/* Add New Template Button */}
                  <button
                    type="button"
                    onClick={createNewTemplate}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#1677ff] text-white hover:bg-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>新增</span>
                  </button>
                </div>
              </div>

              {/* Sub Navigation Filter Bar */}
              <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* 全部模板 */}
                  <button
                    type="button"
                    onClick={() => setTemplateFilterType('all')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      templateFilterType === 'all'
                        ? 'bg-blue-50 text-[#1677ff] font-bold border border-blue-200 shadow-2xs'
                        : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">layers</span>
                    <span>全部模板</span>
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                        templateFilterType === 'all'
                          ? 'bg-blue-100 text-[#1677ff]'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {allTemplatesCount}
                    </span>
                  </button>

                  {/* 报送模板 */}
                  <button
                    type="button"
                    onClick={() => setTemplateFilterType('report')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      templateFilterType === 'report'
                        ? 'bg-blue-50 text-[#1677ff] font-bold border border-blue-200 shadow-2xs'
                        : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">description</span>
                    <span>报送模板</span>
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                        templateFilterType === 'report'
                          ? 'bg-blue-100 text-[#1677ff]'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {reportTemplatesCount}
                    </span>
                  </button>

                  {/* 激活模板 */}
                  <button
                    type="button"
                    onClick={() => setTemplateFilterType('active')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      templateFilterType === 'active'
                        ? 'bg-blue-50 text-[#1677ff] font-bold border border-blue-200 shadow-2xs'
                        : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                    <span>激活模板</span>
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                        templateFilterType === 'active'
                          ? 'bg-blue-100 text-[#1677ff]'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {activeTemplatesCount}
                    </span>
                  </button>
                </div>

                <div className="text-xs text-gray-400 font-medium px-2">
                  当前显示 {filteredTemplates.length} 个
                </div>
              </div>

              {/* Template Cards Grid */}
              {filteredTemplates.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-2xs">
                  <span className="material-symbols-outlined text-gray-300 text-[48px] mb-2 block">
                    inventory_2
                  </span>
                  <div className="text-sm font-semibold text-gray-700">未找到匹配的模板配置</div>
                  <p className="text-xs text-gray-400 mt-1">
                    请尝试更换筛选条件或清空搜索关键词后重试
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((tpl) => {
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => setViewingTemplate(tpl)}
                        className={`rounded-xl border transition-all p-4.5 bg-white shadow-2xs flex flex-col justify-between cursor-pointer group hover:shadow-md ${
                          tpl.status
                            ? 'border-[#87e8de] ring-1 ring-[#52c41a]/30'
                            : 'border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <div>
                          {/* Card Top: Title & Status Switch */}
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#1677ff] transition-colors truncate">
                              {tpl.name}
                            </h4>

                            <div
                              className="flex items-center gap-1.5 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span
                                className={`text-[11px] font-medium ${
                                  tpl.status ? 'text-green-600' : 'text-gray-400'
                                }`}
                              >
                                {tpl.status ? '启用' : '停用'}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleTemplateStatus(tpl)}
                                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                                  tpl.status ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                              >
                                <div
                                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                    tpl.status ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          {/* Attribute Tags & Update Time */}
                          <div className="flex items-center justify-between gap-2 text-[11px] mb-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {isGlobalImmutable(tpl) ? (
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[12px]">
                                    public
                                  </span>
                                  平台全局
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[12px]">
                                    auto_awesome
                                  </span>
                                  {isGlobalScope ? '全局模板' : '机构自定义'}
                                </span>
                              )}

                              {tpl.type === '激活' && (
                                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-medium flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[12px]">bolt</span>
                                  激活
                                </span>
                              )}
                              {tpl.type === '报送' && (
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-[#1677ff] border border-blue-200 font-medium flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[12px]">
                                    description
                                  </span>
                                  报送
                                </span>
                              )}
                              {tpl.type === '处置' && (
                                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[12px]">build</span>
                                  处置
                                </span>
                              )}
                              {tpl.type === '研判' && (
                                <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 font-medium flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[12px]">analytics</span>
                                  研判
                                </span>
                              )}
                              {tpl.type !== '激活' &&
                                tpl.type !== '报送' &&
                                tpl.type !== '处置' &&
                                tpl.type !== '研判' && (
                                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200 font-medium flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[12px]">feed</span>
                                    {tpl.type}
                                  </span>
                                )}
                            </div>

                            <span className="text-[11px] text-gray-400 font-mono shrink-0">
                              📅 {tpl.updatedAt?.substring(0, 10) || '2023-10-24'}
                            </span>
                          </div>

                          {/* Field Overview Pills */}
                          <div className="flex items-center gap-1.5 flex-wrap mb-3">
                            {(tpl.fields || []).slice(0, 3).map((f) => (
                              <span
                                key={f.id}
                                className="text-[11px] px-2 py-0.5 rounded bg-gray-100/90 text-gray-600 border border-gray-200/80 truncate max-w-[110px]"
                                title={f.name}
                              >
                                {f.required && <span className="text-red-500 mr-0.5">*</span>}
                                {f.name}
                              </span>
                            ))}
                            {(tpl.fields || []).length > 3 && (
                              <span className="text-[11px] px-1.5 py-0.5 rounded bg-blue-50 text-[#1677ff] border border-blue-100 font-medium shrink-0">
                                +{tpl.fields.length - 3} 个字段
                              </span>
                            )}
                          </div>

                          {/* Description Box */}
                          <div className="bg-[#fafbfc] border border-gray-100 rounded-lg p-2.5 text-xs text-gray-600 leading-relaxed mb-3 line-clamp-2 min-h-[44px]">
                            {tpl.description || '适用于日常标准文字、图片及证明材料的合规上报'}
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div
                          className="flex items-center justify-between pt-2.5 border-t border-gray-100 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-[11px] text-gray-400 group-hover:text-gray-500 transition-colors">
                            点击卡片查看配置详情
                          </span>

                          <div className="flex items-center gap-2">
                            {/* View Detail Icon */}
                            <button
                              type="button"
                              onClick={() => setViewingTemplate(tpl)}
                              title="查看详情"
                              className="p-1 rounded text-gray-400 hover:text-[#1677ff] hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[17px]">
                                visibility
                              </span>
                            </button>

                            {/* Edit Icon */}
                            <button
                              type="button"
                              onClick={() => setEditingTemplate(tpl)}
                              title="编辑配置"
                              className="p-1 rounded text-gray-400 hover:text-[#1677ff] hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[17px]">edit</span>
                            </button>

                            {/* Delete Icon */}
                            {isGlobalImmutable(tpl) ? (
                              <button
                                type="button"
                                onClick={() => {
                                  showToast('平台全局配置项受统一基准保护，不支持删除。如不使用可直接切换右上角开关停用。', 'warning');
                                }}
                                title="平台全局配置模板受统一基准保护不可删除（可切换开关停用）"
                                className="p-1 rounded text-gray-300 hover:text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[17px]">
                                  lock
                                </span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => removeTemplate(tpl)}
                                title="删除模板"
                                className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[17px]">
                                  delete
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. 审核打分规则 (Review Scoring Rules) - Redesigned */}
          {/* ========================================================= */}
          {activeNav === '__v8_2' && (
            <div className="space-y-4">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-base font-bold text-gray-900">审核打分规则</h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={createNewScoringRuleGroup}
                    className="bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-2xs cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>新增</span>
                  </button>
                </div>
              </div>

              {/* Scoring Rule Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(rules.scoringRuleGroups || defaultInstitutionBusinessRules.scoringRuleGroups || [])
                  .filter((group) => {
                    if (!scoringSearchKeyword.trim()) return true;
                    const kw = scoringSearchKeyword.trim().toLowerCase();
                    return (
                      group.name.toLowerCase().includes(kw) ||
                      group.description.toLowerCase().includes(kw) ||
                      group.scope.toLowerCase().includes(kw)
                    );
                  })
                  .map((group) => {
                    const isCardActive = !!group.status;
                    const isImmutable = isGlobalImmutable(group);
                    return (
                      <div
                        key={group.id}
                        onClick={() => setViewingScoringRuleGroup(group)}
                        className={`group bg-white rounded-xl border p-4 transition-all duration-150 shadow-2xs flex flex-col justify-between cursor-pointer hover:shadow-xs ${
                          isCardActive
                            ? 'border-[#1890ff]/40 ring-1 ring-[#1890ff]/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div>
                          {/* Card Top: Name, Default Badge & Switch */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#1890ff] transition-colors truncate">
                                {group.name}
                              </h3>
                              {isImmutable && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-normal shrink-0">
                                  平台全局
                                </span>
                              )}
                            </div>

                            <div
                              className="shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                role="switch"
                                aria-checked={isCardActive}
                                onClick={() => toggleScoringRuleGroup(group)}
                                className={`relative inline-flex h-6 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer select-none text-[11px] font-medium ${
                                  isCardActive
                                    ? 'bg-[#1890ff] text-white pl-2.5 pr-6.5'
                                    : 'bg-gray-200 text-gray-500 pl-6.5 pr-2.5 hover:bg-gray-300'
                                }`}
                                title={isCardActive ? '当前已生效，点击禁用' : '点击启用此规则'}
                              >
                                <span
                                  className={`pointer-events-none absolute top-0.5 bottom-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-all duration-200 ease-in-out ${
                                    isCardActive ? 'right-0.5' : 'left-0.5'
                                  }`}
                                />
                                <span className="leading-none whitespace-nowrap">
                                  {isCardActive ? '启用' : '禁用'}
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Core Summary: Score & Level Count */}
                          <div className="mt-2.5 flex items-center gap-2 text-xs text-gray-500">
                            <span>总分 <strong className="font-semibold text-gray-900">{group.totalScore || 100}</strong> 分</span>
                            <span className="text-gray-300">·</span>
                            <span>{group.levels.length} 个打分等级</span>
                            <span className="text-[11px] text-gray-400 font-mono tracking-tight ml-auto shrink-0">
                              {group.updateTime || '2023-10-24 10:00:00'}
                            </span>
                          </div>

                          {/* 1-line Description */}
                          {group.description && (
                            <p className="mt-2 text-xs text-gray-400 line-clamp-1" title={group.description}>
                              {group.description}
                            </p>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="mt-3.5 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-gray-400 group-hover:text-[#1890ff] transition-colors">
                            查看规则详情 →
                          </span>

                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {!isImmutable ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setEditingScoringRuleGroup(group)}
                                  title="编辑规则"
                                  className="p-1.5 text-gray-400 hover:text-[#1890ff] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[16px]">edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeScoringRuleGroup(group)}
                                  title="删除规则"
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] text-gray-300 pr-1 select-none">
                                全局基准
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. 数据字典管理 (Data Dictionary Management) */}
          {/* ========================================================= */}
          {activeNav === '__v8_3' && (
            <div className="space-y-4">
              {/* Header: Title on Left */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-base font-bold text-gray-900">数据字典管理</h2>
              </div>

              {/* Sub Tabs Bar and Add Action Button */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {[
                    { key: 'reject_reason', name: '审核驳回理由', singular: '驳回理由' },
                    { key: 'person_tag', name: '人员标签', singular: '人员标签' },
                  ].map((tab) => {
                    const isSelected = selectedDictType === tab.key;
                    const count = rules.dictItems.filter((d) => d.dictType === tab.key).length;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setSelectedDictType(tab.key)}
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-white text-[#1890ff] font-bold border border-blue-200 shadow-2xs'
                            : 'bg-white/80 text-gray-600 border border-transparent hover:bg-white hover:text-gray-900'
                        }`}
                      >
                        <span>{tab.name}</span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                            isSelected
                              ? 'bg-blue-50 text-[#1890ff] font-bold'
                              : 'text-gray-400'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => createNewDictItem(selectedDictType)}
                  className="px-4 py-1.5 rounded text-xs font-semibold bg-[#1677ff] hover:bg-blue-600 text-white transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>{selectedDictType === 'reject_reason' ? '新增驳回理由' : '新增人员标签'}</span>
                </button>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-2xs overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fafbfc] text-gray-600 border-b border-gray-200 font-medium">
                    <tr>
                      <th className="py-3.5 px-6 w-16 text-center">序号</th>
                      <th className="py-3.5 px-6 w-72">
                        {selectedDictType === 'reject_reason' ? '驳回理由' : '标签名称'}
                      </th>
                      <th className="py-3.5 px-6">
                        {selectedDictType === 'reject_reason' ? '审核员提示说明' : '标签说明'}
                      </th>
                      <th className="py-3.5 px-6 w-32">状态</th>
                      <th className="py-3.5 px-6 w-48 font-mono">更新时间</th>
                      <th className="py-3.5 px-6 w-28 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {rules.dictItems
                      .filter((d) => d.dictType === selectedDictType)
                      .filter(
                        (d) =>
                          !dictSearchKeyword.trim() ||
                          d.label.toLowerCase().includes(dictSearchKeyword.trim().toLowerCase()) ||
                          d.value.toLowerCase().includes(dictSearchKeyword.trim().toLowerCase()) ||
                          (d.description && d.description.toLowerCase().includes(dictSearchKeyword.trim().toLowerCase()))
                      )
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((item, idx) => (
                        <tr
                          key={item.id}
                          className="hover:bg-blue-50/20 transition-colors"
                        >
                          {/* 序号 */}
                          <td className="py-4 px-6 text-center font-mono text-gray-500">
                            {idx + 1}
                          </td>

                          {/* 驳回理由 / 标签名称 + 徽章 */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 text-xs">
                                {item.label}
                              </span>
                              {isGlobalImmutable(item) ? (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] border border-blue-200 select-none">
                                  <span className="material-symbols-outlined text-[13px]">public</span>
                                  <span>平台全局</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#f6ffed] text-[#52c41a] text-[11px] border border-[#b7eb8f] font-medium select-none">
                                  <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                                  <span>{isGlobalScope ? '全局字典' : '机构自定义'}</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 审核员提示说明 / 标签说明 */}
                          <td className="py-4 px-6 text-xs text-gray-600 leading-relaxed">
                            {item.description || '—'}
                          </td>

                          {/* 状态 Switch */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleDictItem(item)}
                                className={`relative inline-flex h-[20px] w-[38px] items-center rounded-full transition-colors cursor-pointer select-none px-[2px] ${
                                  item.status ? 'bg-[#52c41a]' : 'bg-gray-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-[16px] w-[16px] rounded-full bg-white transition-transform ${
                                    item.status ? 'translate-x-[18px]' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                              <span className={`text-xs ${item.status ? 'text-gray-800' : 'text-gray-400'}`}>
                                {item.status ? '启用' : '停用'}
                              </span>
                            </div>
                          </td>

                          {/* 更新时间 */}
                          <td className="py-4 px-6 text-xs text-gray-500 font-mono">
                            {item.updatedAt || '2023-10-15 09:00:00'}
                          </td>

                          {/* 操作 */}
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2.5">
                              {/* 查看详情 */}
                              <button
                                type="button"
                                title="查看详情"
                                onClick={() => setViewingDictItem(item)}
                                className="text-gray-400 hover:text-[#1890ff] transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[17px]">
                                  visibility
                                </span>
                              </button>

                              {/* 编辑 */}
                              <button
                                type="button"
                                title="编辑"
                                onClick={() => setEditingDictItem(item)}
                                className="text-gray-400 hover:text-[#1890ff] transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[17px]">
                                  edit
                                </span>
                              </button>

                              {/* 删除 */}
                              {isGlobalImmutable(item) ? (
                                <button
                                  type="button"
                                  title="平台全局数据字典项受统一基准保护不可删除（可切换开关停用）"
                                  onClick={() => {
                                    showToast('平台全局配置项受统一基准保护，不支持删除。如不使用可直接切换开关停用。', 'warning');
                                  }}
                                  className="text-gray-300 hover:text-amber-500 transition-colors cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[17px]">
                                    lock
                                  </span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  title="删除"
                                  onClick={() => removeDictItem(item)}
                                  className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[17px]">
                                    delete
                                  </span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}

                    {rules.dictItems.filter((d) => d.dictType === selectedDictType).length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-xs text-gray-400">
                          暂无字典数据，请点击右上角新增
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 6. 审核流程配置 (Review Process Configuration) */}
          {/* ========================================================= */}
          {activeNav === '__v8_6' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#1890ff] text-[20px]">
                      account_tree
                    </span>
                    <span>审核流程配置</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    设定机构采编发布的初审、复审、终审签发层级与转审退回、应急加急流转规则。
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {[
                    { key: 'one_level', label: '一级直发' },
                    { key: 'two_level', label: '两级审核 (标准)' },
                    { key: 'three_level', label: '三级终审 (严格)' },
                  ].map((wf) => (
                    <button
                      key={wf.key}
                      type="button"
                      onClick={() => setWorkflowType(wf.key as any, wf.label)}
                      className={`px-3 py-1.5 rounded text-xs transition-colors cursor-pointer border ${
                        rules.workflowType === wf.key
                          ? 'bg-[#1890ff] text-white border-[#1890ff] font-semibold'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {wf.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Workflow Pipeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#1890ff]">
                    conversion_path
                  </span>
                  <span>审核流程节点流水线</span>
                </h4>

                <div className="space-y-3">
                  {rules.reviewNodes
                    .filter((_, idx) => {
                      if (rules.workflowType === 'one_level') return idx === 0;
                      if (rules.workflowType === 'two_level') return idx < 2;
                      return true;
                    })
                    .map((node, idx) => (
                      <div
                        key={node.level}
                        className="bg-[#f8fafd] rounded-lg border border-blue-100 p-4 relative"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#1890ff] text-white flex items-center justify-center font-bold text-xs font-mono shadow-2xs">
                              {node.level}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-bold text-gray-900">{node.title}</h5>
                                <span className="text-[11px] px-2 py-0.2 rounded bg-blue-50 text-[#1890ff] border border-blue-200">
                                  {node.role}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                审核人员范围：{node.approvers.join('、')}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <span className="material-symbols-outlined text-[16px] text-orange-500">
                                timer
                              </span>
                              <span>时限：{node.timeoutHours} 小时</span>
                            </div>

                            <div className="flex items-center gap-1 text-gray-600">
                              <input
                                type="checkbox"
                                checked={node.allowTransfer}
                                onChange={(e) =>
                                  setReviewNodeOption(
                                    node.level,
                                    'allowTransfer',
                                    e.target.checked
                                  )
                                }
                                className="rounded text-[#1890ff]"
                              />
                              <span>支持转审</span>
                            </div>

                            <div className="flex items-center gap-1 text-gray-600">
                              <input
                                type="checkbox"
                                checked={node.allowDirectPublish}
                                onChange={(e) =>
                                  setReviewNodeOption(
                                    node.level,
                                    'allowDirectPublish',
                                    e.target.checked
                                  )
                                }
                                className="rounded text-[#1890ff]"
                              />
                              <span>允许签发</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Fast Track & Whitelist */}
              <div className="bg-gray-50/80 rounded-lg p-4 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600 text-[18px]">
                      bolt
                    </span>
                    <span className="text-xs font-bold text-gray-800">
                      应急绿色通道与免审关键词白名单
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={rules.enableFastTrack}
                    onChange={(e) => setFastTrackEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#1890ff] rounded border-gray-300 focus:ring-[#1890ff] cursor-pointer"
                  />
                </div>

                <div className="text-xs text-gray-600">
                  <span className="text-gray-400 block mb-1.5">
                    匹配以下关键词的常规日常稿件可免审快速直发：
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {rules.autoApproveKeywords.map((kw, kwIdx) => (
                      <span
                        key={kwIdx}
                        className="bg-white border border-gray-300 rounded px-2.5 py-1 text-xs flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>{kw}</span>
                        <button
                          type="button"
                          onClick={() => removeAutoApproveKeyword(kwIdx)}
                          className="text-gray-400 hover:text-red-500 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 7. 增值业务 (Value Added Services) */}
          {/* ========================================================= */}
          {activeNav === '__v8_7' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-2xs space-y-5">
              {/* Header Title */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-[22px]">
                      auto_awesome
                    </span>
                    <span>增值业务</span>
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">verified</span>
                    已开通 {
                      (rules.valueAddedServices || defaultValueAddedServices).filter(
                        (s) => s.isPurchased
                      ).length
                    } 项 / 共 {(rules.valueAddedServices || defaultValueAddedServices).length} 项
                  </span>
                </div>
              </div>

              {/* Yellow Banner with Dismiss/Delete Button */}
              {showValueAddedBanner && (
                <div className="bg-[#fffbe6] border border-[#ffe58f] rounded-lg p-3.5 flex items-start justify-between gap-2.5 shadow-2xs">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="material-symbols-outlined text-[#faad14] text-[19px] shrink-0 mt-0.5">
                      info
                    </span>
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-bold text-[#d48806]">
                        增值业务运营管控说明
                      </div>
                      <div className="text-xs text-gray-700 leading-relaxed">
                        本模块面向平台运营人员统一管控。在全局配置中开启增值业务后，机构在添加或编辑时才能进行管理与开通；如果在此处未开启该增值业务，机构端将不会出现对应业务选项。
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowValueAddedBanner(false)}
                    className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-amber-100/70 transition-colors cursor-pointer shrink-0"
                    title="关闭说明"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              )}

              {/* Responsive Grid for Value-Added Services (Auto-expands to 4 cols on wide screens) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {(rules.valueAddedServices || defaultValueAddedServices).map((service) => {
                  const isPurchased = service.isPurchased;
                  const isEnabled = service.isEnabled;

                  return (
                    <div
                      key={service.id}
                      className={`rounded-lg p-3.5 transition-all space-y-2 relative overflow-hidden flex flex-col justify-between ${
                        isPurchased && isEnabled
                          ? 'bg-gradient-to-b from-blue-50/70 via-blue-50/30 to-white border-2 border-blue-400/80 shadow-xs hover:shadow-sm hover:border-blue-500'
                          : 'bg-gray-50/90 border border-gray-200 hover:border-gray-300 opacity-90'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Card Header Top */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <span className={`text-xs font-bold truncate block ${isPurchased && isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>
                              {service.name}
                            </span>
                          </div>

                          {/* Right: Toggle Switch or Disabled Badge */}
                          {isPurchased ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleValueAddedService(service)}
                                className={`relative inline-flex h-[20px] w-[38px] shrink-0 items-center rounded-full transition-colors cursor-pointer select-none px-[2px] ${
                                  isEnabled ? 'bg-[#10b981]' : 'bg-gray-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-[16px] w-[16px] rounded-full bg-white shadow-xs transition-transform ${
                                    isEnabled ? 'translate-x-[18px]' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                              <span
                                className={`text-[10px] font-bold select-none ${
                                  isEnabled ? 'text-emerald-700' : 'text-gray-500'
                                }`}
                              >
                                {isEnabled ? '已开通' : '未开通'}
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-400 border border-gray-200 select-none shrink-0">
                              <span className="material-symbols-outlined text-[13px]">
                                lock
                              </span>
                              <span>未开通</span>
                            </div>
                          )}
                        </div>

                        {/* Product Intro Label */}
                        <div
                          className={`text-[10px] font-bold flex items-center gap-1 ${
                            isPurchased && isEnabled ? 'text-blue-600' : 'text-gray-400'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            description
                          </span>
                          <span>产品功能介绍</span>
                        </div>

                        {/* Description Box */}
                        <div className={`rounded-md p-2 border text-[11px] leading-relaxed ${
                          isPurchased && isEnabled ? 'bg-white text-gray-700 border-blue-200/60 shadow-2xs' : 'bg-gray-100/70 text-gray-400 border-gray-200'
                        }`}>
                          {service.name === '报送首发重复识别'
                            ? '通过抓取报送链接的文章原文比对判断内容是否重复，并结合提交时间线智能判定首发，避免多头报送与重复审核计分。'
                            : service.description}
                        </div>
                      </div>

                      {/* Bottom Info Banner for Unpurchased Services */}
                      {!isPurchased && (
                        <div className="mt-1 bg-amber-50/90 border border-amber-200/80 rounded-md px-2.5 py-1 text-[10px] text-amber-800 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-amber-600">
                              info
                            </span>
                            <span>{service.contactSalesTip || '如需开通请联系对应的销售人员'}</span>
                          </div>
                          {(institution?.salesName || institution?.salesPhone) && (
                            <button
                              type="button"
                              onClick={() => {
                                const info = `销售专员: ${institution.salesName || '商务经理'} (${institution.salesPhone || '400-888-9999'})`;
                                navigator.clipboard?.writeText?.(info);
                                showToast(`已复制销售顾问联系信息：${info}`, 'success');
                              }}
                              className="text-[10px] text-[#1677ff] hover:underline cursor-pointer flex items-center gap-0.5 ml-1 shrink-0 font-medium"
                            >
                              <span>
                                {institution.salesName} ({institution.salesPhone})
                              </span>
                              <span className="material-symbols-outlined text-[11px]">
                                content_copy
                              </span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 8. 二维码配置 (QR Code Quota & Bound Personnel Management) */}
          {/* ========================================================= */}
          {activeNav === 'qr_code' && (
            isGlobalScope ? (
              /* 全局维度：全平台二维码通用项配置（机构初始化默认额度母版） */
              <GlobalQrDefaultsSection
                qrDefaults={rules.otherConfig?.qrUsage || defaultOtherBusinessConfig.qrUsage}
                onSaveDefaults={handleUpdateQrConfig}
                showToast={showToast}
              />
            ) : (
              <QrQuotaSection
                institution={institution}
                qrConfig={rules.otherConfig?.qrUsage || defaultOtherBusinessConfig.qrUsage}
                onChangeQrConfig={handleUpdateQrConfig}
                showToast={showToast}
              />
            )
          )}

          {/* ========================================================= */}
          {/* 9. 其他配置 (Other Configurations - 微信公众号配置 & 人员迁移) */}
          {/* ========================================================= */}
          {activeNav === 'other' && (
            isGlobalScope ? (
              /* 全局维度：全平台公众号使用方式与人员一键迁移全局通用项配置 */
              <GlobalOtherConfigDefaultsSection
                mpConfig={rules.otherConfig?.wechatMp}
                migrationConfig={rules.otherConfig?.migration}
                globalMpControl={rules.otherConfig?.globalMpControl}
                onSaveMpDefaults={handleSaveGlobalMpDefaults}
                onSaveMigrationDefaults={handleSaveGlobalMigrationDefaults}
                onSaveGlobalControl={handleSaveGlobalOtherConfig}
                showToast={showToast}
              />
            ) : (
              <OtherBusinessConfigTab
                institution={institution}
                rules={rules}
                setRules={setRules}
                onSaveRules={onSaveRules}
                showToast={showToast}
              />
            )
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* Modal 1: 模板配置详情 (View Template Detail - Screenshot 2) */}
      {/* ========================================================= */}
      {viewingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 animate-scale-in flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <h3 className="text-base font-bold text-gray-900">模板配置详情</h3>
              <button
                type="button"
                onClick={() => setViewingTemplate(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Template Name Header */}
              <h2 className="text-xl font-bold text-gray-900">{viewingTemplate.name}</h2>

              {/* Two-Column Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#f8fafd] rounded-xl p-4 border border-blue-50/80">
                  <div className="text-xs text-gray-400 mb-1">模板类型</div>
                  <div className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#1677ff] text-[18px]">
                      description
                    </span>
                    <span>{viewingTemplate.type || '报送'}</span>
                  </div>
                </div>

                <div className="bg-[#f8fafd] rounded-xl p-4 border border-blue-50/80">
                  <div className="text-xs text-gray-400 mb-1">说明描述</div>
                  <div className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                    {viewingTemplate.description || '适用于日常标准文字、图片及证明材料的合规上报'}
                  </div>
                </div>
              </div>

              {/* Configured Fields Section */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <span>配置字段</span>
                    <span className="text-xs font-normal text-gray-400">
                      ({viewingTemplate.fields?.length || 0} 项)
                    </span>
                  </h4>
                  <span className="text-xs text-gray-400">按用户填写界面展示</span>
                </div>

                {/* Form Simulated Container */}
                <div className="border border-blue-100 rounded-xl overflow-hidden shadow-2xs">
                  {/* Top Bar Header */}
                  <div className="bg-[#1677ff] text-white py-2.5 px-4 text-center font-bold text-sm tracking-wide shadow-2xs">
                    {viewingTemplate.type === '激活'
                      ? '账号激活'
                      : viewingTemplate.type === '报送'
                      ? '快速上报'
                      : viewingTemplate.type === '处置'
                      ? '处置跟进'
                      : viewingTemplate.type === '研判'
                      ? '研判专报'
                      : `${viewingTemplate.type || '模板'}详情`}
                  </div>

                  {/* Form Body Preview */}
                  <div className="bg-[#f5f7fa] p-4 space-y-3.5">
                    {(viewingTemplate.fields || []).map((field) => {
                      return (
                        <div
                          key={field.id}
                          className="bg-white rounded-lg p-3.5 border border-gray-200/80 shadow-2xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                            <div className="flex items-center gap-1.5">
                              {field.type === 'text' && (
                                <span className="material-symbols-outlined text-gray-500 text-[16px]">
                                  text_fields
                                </span>
                              )}
                              {field.type === 'role' && (
                                <span className="material-symbols-outlined text-purple-600 text-[16px]">
                                  groups
                                </span>
                              )}
                              {field.type === 'phone' && (
                                <span className="material-symbols-outlined text-blue-600 text-[16px]">
                                  phone_iphone
                                </span>
                              )}
                              {field.type === 'gender' && (
                                <span className="material-symbols-outlined text-pink-600 text-[16px]">
                                  wc
                                </span>
                              )}
                              {field.type === 'idcard' && (
                                <span className="material-symbols-outlined text-indigo-600 text-[16px]">
                                  badge
                                </span>
                              )}
                              {field.type === 'bankcard' && (
                                <span className="material-symbols-outlined text-emerald-600 text-[16px]">
                                  credit_card
                                </span>
                              )}
                              {field.type === 'textarea' && (
                                <span className="material-symbols-outlined text-gray-500 text-[16px]">
                                  notes
                                </span>
                              )}
                              {field.type === 'time' && (
                                <span className="material-symbols-outlined text-gray-500 text-[16px]">
                                  calendar_month
                                </span>
                              )}
                              {field.type === 'number' && (
                                <span className="material-symbols-outlined text-gray-500 text-[16px]">
                                  tag
                                </span>
                              )}
                              {field.type === 'link' && (
                                <span className="material-symbols-outlined text-gray-500 text-[16px]">
                                  link
                                </span>
                              )}
                              {field.type === 'attachment' && (
                                <span className="material-symbols-outlined text-gray-500 text-[16px]">
                                  attach_file
                                </span>
                              )}
                              {field.type === 'select' && (
                                <span className="material-symbols-outlined text-gray-500 text-[16px]">
                                  list_alt
                                </span>
                              )}
                              <span>{field.name}</span>
                              {field.required && (
                                <span className="text-red-500 font-bold ml-0.5">*</span>
                              )}
                            </div>
                          </div>

                          {/* Control Visual */}
                          {field.type === 'text' && (
                            <input
                              type="text"
                              disabled
                              placeholder={field.placeholder || '请输入内容'}
                              className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-xs bg-gray-50/50 text-gray-400 placeholder:text-gray-400 cursor-not-allowed"
                            />
                          )}

                          {field.type === 'role' && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                              {(
                                field.options || [
                                  '超级管理员',
                                  '机构管理员',
                                  '上报员',
                                  '审核员',
                                  '运营管理员',
                                  '临时审核员',
                                ]
                              ).map((r, i) => (
                                <span
                                  key={r}
                                  className={`px-2.5 py-1 rounded-full text-xs font-medium border cursor-not-allowed ${
                                    i === 0
                                      ? 'bg-blue-50 text-[#1677ff] border-blue-200 shadow-2xs'
                                      : 'bg-gray-50 text-gray-500 border-gray-200'
                                  }`}
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          )}

                          {field.type === 'phone' && (
                            <div className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-xs bg-gray-50/50 text-gray-400 flex items-center justify-between cursor-not-allowed">
                              <span>{field.placeholder || '请输入 11 位手机号码'}</span>
                              <span className="material-symbols-outlined text-gray-400 text-[16px]">
                                smartphone
                              </span>
                            </div>
                          )}

                          {field.type === 'gender' && (
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="px-4 py-1 rounded-md text-xs font-semibold bg-blue-50 text-[#1677ff] border border-blue-200 cursor-not-allowed">
                                男
                              </span>
                              <span className="px-4 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200 cursor-not-allowed">
                                女
                              </span>
                            </div>
                          )}

                          {field.type === 'idcard' && (
                            <input
                              type="text"
                              disabled
                              placeholder={field.placeholder || '请输入身份证号码'}
                              className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-xs bg-gray-50/50 text-gray-400 placeholder:text-gray-400 cursor-not-allowed"
                            />
                          )}

                          {field.type === 'bankcard' && (
                            <input
                              type="text"
                              disabled
                              placeholder={field.placeholder || '请输入银行卡号'}
                              className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-xs bg-gray-50/50 text-gray-400 placeholder:text-gray-400 cursor-not-allowed"
                            />
                          )}

                          {field.type === 'textarea' && (
                            <textarea
                              disabled
                              rows={2}
                              placeholder={field.placeholder || '请输入详细描述...'}
                              className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-xs bg-gray-50/50 text-gray-400 placeholder:text-gray-400 cursor-not-allowed resize-none"
                            />
                          )}

                          {field.type === 'time' && (
                            <div className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-xs bg-gray-50/50 text-gray-400 flex items-center justify-between cursor-not-allowed">
                              <span>{field.placeholder || '年/月/日 --:--'}</span>
                              <span className="material-symbols-outlined text-gray-400 text-[16px]">
                                schedule
                              </span>
                            </div>
                          )}

                          {field.type === 'number' && (
                            <input
                              type="text"
                              disabled
                              placeholder={field.placeholder || '请输入传播量/阅读量等数据'}
                              className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-xs bg-gray-50/50 text-gray-400 placeholder:text-gray-400 cursor-not-allowed"
                            />
                          )}

                          {field.type === 'link' && (
                            <div className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-xs bg-gray-50/50 text-gray-400 flex items-center gap-1.5 cursor-not-allowed">
                              <span className="text-gray-300">🔗</span>
                              <span>{field.placeholder || 'https://...'}</span>
                            </div>
                          )}

                          {field.type === 'attachment' && (
                            <div className="border border-dashed border-gray-300 rounded-lg p-3 text-center bg-gray-50/60 cursor-not-allowed">
                              <span className="material-symbols-outlined text-gray-400 text-[20px] mx-auto block mb-0.5">
                                cloud_upload
                              </span>
                              <span className="text-xs text-gray-600 font-medium block">
                                {field.placeholder || '上传图片、视频或证明材料'}
                              </span>
                              <span className="text-[10px] text-gray-400 block mt-0.5">
                                支持图片、视频、PDF证明文档
                              </span>
                            </div>
                          )}

                          {field.type === 'select' && (
                            <div className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-xs bg-gray-50/50 text-gray-400 flex items-center justify-between cursor-not-allowed">
                              <span>{field.placeholder || '请选择分类'}</span>
                              <span className="material-symbols-outlined text-gray-400 text-[16px]">
                                expand_more
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const target = viewingTemplate;
                  setViewingTemplate(null);
                  setEditingTemplate(target);
                }}
                className="px-5 py-1.5 rounded-lg text-xs font-semibold bg-[#1677ff] text-white hover:bg-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-[15px]">edit</span>
                <span>编辑</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Modal 2: 新增/编辑模板配置 (Add/Edit Template Config - Screenshot 3) */}
      {/* ========================================================= */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-200 animate-scale-in flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <h3 className="text-base font-bold text-gray-900">
                {rules.templates.some((t) => t.id === editingTemplate.id)
                  ? '编辑模板配置'
                  : '新增模板配置'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Top 4 Configuration Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#f8fafd] p-4 rounded-xl border border-blue-50">
                {/* 模板/配置名称 */}
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">
                    模板/配置名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, name: e.target.value })
                    }
                    placeholder="请输入模板配置名称…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff]/30 bg-white"
                  />
                </div>

                {/* 模板类型 */}
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">
                    模板类型 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingTemplate.type || '报送'}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, type: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#1677ff] bg-white cursor-pointer"
                  >
                    <option value="报送">报送</option>
                    <option value="激活">激活</option>
                    <option value="处置">处置</option>
                    <option value="研判">研判</option>
                    <option value="核查">核查</option>
                  </select>
                </div>

                {/* 启用状态 */}
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">
                    启用状态 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-gray-200/80 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setEditingTemplate({ ...editingTemplate, status: true })}
                      className={`py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        editingTemplate.status
                          ? 'bg-green-600 text-white shadow-2xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      启用
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTemplate({ ...editingTemplate, status: false })}
                      className={`py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        !editingTemplate.status
                          ? 'bg-gray-600 text-white shadow-2xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      停用
                    </button>
                  </div>
                </div>

                {/* 说明描述 */}
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">说明描述</label>
                  <input
                    type="text"
                    value={editingTemplate.description}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, description: e.target.value })
                    }
                    placeholder="请输入适用场景说明…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff]/30 bg-white"
                  />
                </div>
              </div>

              {/* Main Content Area: Left Field Config, Right Live Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left: Field Config List (7 cols) */}
                <div className="lg:col-span-7 space-y-3.5">
                  {/* Quick Add Bar */}
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[#1677ff] text-[16px]">
                          add_circle
                        </span>
                        快速添加字段
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          if (editingTemplate.type === '激活') {
                            setEditingTemplate({
                              ...editingTemplate,
                              fields: JSON.parse(JSON.stringify(standardActivationFields)),
                            });
                            showToast('已套用系统标准 7 项激活认证模板！', 'success');
                          } else {
                            setEditingTemplate({
                              ...editingTemplate,
                              fields: JSON.parse(JSON.stringify(standardReportFields)),
                            });
                            showToast('已套用系统标准 6 字段报送模板！', 'success');
                          }
                        }}
                        className="text-[11px] text-[#1677ff] hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <span className="material-symbols-outlined text-[13px]">replay</span>
                        使用标准模板
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={quickAddFieldType}
                        onChange={(e) =>
                          setQuickAddFieldType(e.target.value as TemplateFieldType)
                        }
                        className="flex-1 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-[#1677ff]"
                      >
                        <option value="text">📝 文本字段 (单行)</option>
                        <option value="role">👤 身份角色 (多角色胶囊)</option>
                        <option value="phone">📱 手机号码 (11位手机号)</option>
                        <option value="gender">👥 性别 (男/女单选)</option>
                        <option value="idcard">🪪 身份证号 (证件校验)</option>
                        <option value="bankcard">💳 银行卡号 (银行卡号)</option>
                        <option value="attachment">📎 附件字段 (佐证材料/图片/文档)</option>
                        <option value="textarea">📄 多行文本 (详细说明)</option>
                        <option value="time">📅 时间字段 (精确时点)</option>
                        <option value="number">🔢 数据字段 (传播热度/数值)</option>
                        <option value="link">🔗 链接字段 (出处网址)</option>
                        <option value="select">☰ 选择字段 (分类下拉)</option>
                      </select>

                      <button
                        type="button"
                        onClick={addTemplateField}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1677ff] text-white hover:bg-blue-600 transition-colors flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">add</span>
                        <span>添加字段</span>
                      </button>
                    </div>
                  </div>

                  {/* Field Items Header */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-gray-900 flex items-center gap-1.5">
                      <span>字段配置</span>
                      <span className="text-gray-400 font-normal">
                        ({editingTemplate.fields?.length || 0} 项)
                      </span>
                    </span>
                    <span className="text-[11px] text-gray-400">
                      支持调整字段属性、必填项与排序
                    </span>
                  </div>

                  {/* Field Item Cards */}
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {(editingTemplate.fields || []).map((field, idx) => {
                      return (
                        <div
                          key={field.id}
                          draggable
                          onDragStart={(e) => {
                            setDraggingFieldIdx(idx);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={() => handleDropField(idx)}
                          onDragEnd={() => setDraggingFieldIdx(null)}
                          className={`rounded-lg p-3 border shadow-2xs transition-all space-y-2 group ${
                            draggingFieldIdx === idx
                              ? 'border-blue-400 bg-blue-50/70 opacity-60 scale-[0.99]'
                              : 'bg-white border-gray-200 hover:border-blue-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span
                                className="material-symbols-outlined text-gray-400 hover:text-blue-600 text-[18px] cursor-grab active:cursor-grabbing select-none"
                                title="按住拖拽以调整字段排序"
                              >
                                drag_indicator
                              </span>
                              <span className="text-[11px] font-mono text-gray-400">
                                #{idx + 1}
                              </span>

                              {/* Field Type Select */}
                              <select
                                value={field.type}
                                onChange={(e) => {
                                  const newType = e.target.value as TemplateFieldType;
                                  const updated = (editingTemplate.fields || []).map((f, i) =>
                                    i === idx ? { ...f, type: newType } : f
                                  );
                                  setEditingTemplate({ ...editingTemplate, fields: updated });
                                }}
                                className="border border-gray-200 rounded px-1.5 py-1 text-xs bg-gray-50 text-gray-700"
                              >
                                <option value="text">文本</option>
                                <option value="role">角色</option>
                                <option value="phone">手机号</option>
                                <option value="gender">性别</option>
                                <option value="idcard">身份证号</option>
                                <option value="bankcard">银行卡号</option>
                                <option value="attachment">附件</option>
                                <option value="textarea">多行文本</option>
                                <option value="time">时间</option>
                                <option value="number">数据</option>
                                <option value="link">链接</option>
                                <option value="select">选择</option>
                              </select>

                              {/* Field Name Input */}
                              <input
                                type="text"
                                value={field.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = (editingTemplate.fields || []).map((f, i) =>
                                    i === idx ? { ...f, name: val } : f
                                  );
                                  setEditingTemplate({ ...editingTemplate, fields: updated });
                                }}
                                placeholder="字段名称"
                                className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#1677ff]"
                              />
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Required Toggle Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (editingTemplate.fields || []).map((f, i) =>
                                    i === idx ? { ...f, required: !f.required } : f
                                  );
                                  setEditingTemplate({ ...editingTemplate, fields: updated });
                                }}
                                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                                  field.required
                                    ? 'bg-red-500 text-white shadow-2xs'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                                title={field.required ? '必填项' : '选填项'}
                              >
                                {field.required ? '必填' : '选填'}
                              </button>

                              {/* Move Up */}
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = [...(editingTemplate.fields || [])];
                                    const temp = list[idx - 1];
                                    list[idx - 1] = list[idx];
                                    list[idx] = temp;
                                    setEditingTemplate({ ...editingTemplate, fields: list });
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-500 cursor-pointer"
                                  title="上移"
                                >
                                  <span className="material-symbols-outlined text-[16px]">
                                    arrow_upward
                                  </span>
                                </button>
                              )}

                              {/* Move Down */}
                              {idx < (editingTemplate.fields || []).length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = [...(editingTemplate.fields || [])];
                                    const temp = list[idx + 1];
                                    list[idx + 1] = list[idx];
                                    list[idx] = temp;
                                    setEditingTemplate({ ...editingTemplate, fields: list });
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-500 cursor-pointer"
                                  title="下移"
                                >
                                  <span className="material-symbols-outlined text-[16px]">
                                    arrow_downward
                                  </span>
                                </button>
                              )}

                              {/* Delete Field */}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (editingTemplate.fields || []).filter(
                                    (_, i) => i !== idx
                                  );
                                  setEditingTemplate({ ...editingTemplate, fields: updated });
                                }}
                                className="p-1 text-gray-400 hover:text-red-500 cursor-pointer"
                                title="删除该字段"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  delete
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Sub-row options or placeholder */}
                          {field.type === 'role' ? (
                            <div className="pl-6 space-y-1.5">
                              <div className="text-[11px] text-gray-500 flex items-center justify-between">
                                <span>身份角色选项列表 (点击勾选或添加)：</span>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {(
                                  field.options || [
                                    '超级管理员',
                                    '机构管理员',
                                    '上报员',
                                    '审核员',
                                    '运营管理员',
                                    '临时审核员',
                                  ]
                                ).map((roleTag) => (
                                  <span
                                    key={roleTag}
                                    className="px-2 py-0.5 rounded-full text-[11px] bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1"
                                  >
                                    <span>{roleTag}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : field.type === 'gender' ? (
                            <div className="pl-6 flex items-center gap-2 text-[11px] text-gray-500">
                              <span>选项值：</span>
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-[#1677ff] border border-blue-200">
                                男
                              </span>
                              <span className="px-2 py-0.5 rounded bg-pink-50 text-pink-600 border border-pink-200">
                                女
                              </span>
                            </div>
                          ) : (
                            <div className="pl-6">
                              <input
                                type="text"
                                value={field.placeholder || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = (editingTemplate.fields || []).map((f, i) =>
                                    i === idx ? { ...f, placeholder: val } : f
                                  );
                                  setEditingTemplate({ ...editingTemplate, fields: updated });
                                }}
                                placeholder="输入提示文字/占位符 (placeholder)"
                                className="w-full border border-gray-200 rounded px-2 py-1 text-[11px] text-gray-500 placeholder:text-gray-300 focus:outline-none focus:border-[#1677ff] bg-gray-50/40"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Live Preview Panel (5 cols) */}
                <div className="lg:col-span-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 flex items-center gap-1">
                      <span className="material-symbols-outlined text-green-600 text-[16px]">
                        visibility
                      </span>
                      实时预览
                    </span>
                    <span className="text-[11px] text-gray-400">模拟用户真实填写界面</span>
                  </div>

                  {/* Form Mock Phone/Card */}
                  <div className="border border-blue-100 rounded-xl overflow-hidden shadow-sm bg-white">
                    {/* Header */}
                    <div className="bg-[#1677ff] text-white py-2.5 px-3 text-center font-bold text-xs tracking-wide shadow-2xs">
                      {editingTemplate.type === '激活'
                        ? '账号激活'
                        : editingTemplate.type === '报送'
                        ? '快速上报'
                        : editingTemplate.type === '处置'
                        ? '处置跟进'
                        : editingTemplate.type === '研判'
                        ? '研判专报'
                        : `${editingTemplate.type || '模板'}详情`}
                    </div>

                    {/* Body */}
                    <div className="bg-[#f5f7fa] p-3 space-y-2.5 max-h-[380px] overflow-y-auto">
                      {(editingTemplate.fields || []).length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                          暂无字段，请在左侧添加
                        </div>
                      ) : (
                        (editingTemplate.fields || []).map((field) => (
                          <div
                            key={field.id}
                            className="bg-white rounded-lg p-2.5 border border-gray-200 shadow-2xs space-y-1"
                          >
                            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700">
                              <div className="flex items-center gap-1">
                                <span>{field.name || '未命名'}</span>
                                {field.required && (
                                  <span className="text-red-500 font-bold">*</span>
                                )}
                              </div>
                            </div>

                            {field.type === 'text' && (
                              <input
                                type="text"
                                disabled
                                placeholder={field.placeholder || '请输入内容'}
                                className="w-full border border-gray-200 rounded px-2 py-1 text-[11px] bg-gray-50/50 text-gray-400 cursor-not-allowed"
                              />
                            )}

                            {field.type === 'role' && (
                              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                {(
                                  field.options || [
                                    '超级管理员',
                                    '机构管理员',
                                    '上报员',
                                    '审核员',
                                    '运营管理员',
                                    '临时审核员',
                                  ]
                                ).map((r, i) => (
                                  <span
                                    key={r}
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium border cursor-not-allowed ${
                                      i === 0
                                        ? 'bg-blue-50 text-[#1677ff] border-blue-200'
                                        : 'bg-gray-50 text-gray-500 border-gray-200'
                                    }`}
                                  >
                                    {r}
                                  </span>
                                ))}
                              </div>
                            )}

                            {field.type === 'phone' && (
                              <div className="w-full border border-gray-200 rounded px-2 py-1 text-[11px] bg-gray-50/50 text-gray-400 flex items-center justify-between cursor-not-allowed">
                                <span>{field.placeholder || '请输入 11 位手机号码'}</span>
                                <span className="material-symbols-outlined text-gray-400 text-[14px]">
                                  smartphone
                                </span>
                              </div>
                            )}

                            {field.type === 'gender' && (
                              <div className="flex items-center gap-1.5 pt-0.5">
                                <span className="px-3 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-[#1677ff] border border-blue-200 cursor-not-allowed">
                                  男
                                </span>
                                <span className="px-3 py-0.5 rounded text-[11px] font-medium bg-gray-50 text-gray-500 border border-gray-200 cursor-not-allowed">
                                  女
                                </span>
                              </div>
                            )}

                            {field.type === 'idcard' && (
                              <input
                                type="text"
                                disabled
                                placeholder={field.placeholder || '请输入身份证号码'}
                                className="w-full border border-gray-200 rounded px-2 py-1 text-[11px] bg-gray-50/50 text-gray-400 cursor-not-allowed"
                              />
                            )}

                            {field.type === 'bankcard' && (
                              <input
                                type="text"
                                disabled
                                placeholder={field.placeholder || '请输入银行卡号'}
                                className="w-full border border-gray-200 rounded px-2 py-1 text-[11px] bg-gray-50/50 text-gray-400 cursor-not-allowed"
                              />
                            )}

                            {field.type === 'textarea' && (
                              <textarea
                                disabled
                                rows={2}
                                placeholder={field.placeholder || '请输入详细内容...'}
                                className="w-full border border-gray-200 rounded px-2 py-1 text-[11px] bg-gray-50/50 text-gray-400 cursor-not-allowed resize-none"
                              />
                            )}

                            {field.type === 'time' && (
                              <div className="w-full border border-gray-200 rounded px-2 py-1 text-[11px] bg-gray-50/50 text-gray-400 flex items-center justify-between cursor-not-allowed">
                                <span>{field.placeholder || '年/月/日 --:--'}</span>
                                <span className="material-symbols-outlined text-gray-400 text-[14px]">
                                  schedule
                                </span>
                              </div>
                            )}

                            {field.type === 'number' && (
                              <input
                                type="text"
                                disabled
                                placeholder={field.placeholder || '请输入数值'}
                                className="w-full border border-gray-200 rounded px-2 py-1 text-[11px] bg-gray-50/50 text-gray-400 cursor-not-allowed"
                              />
                            )}

                            {field.type === 'link' && (
                              <div className="w-full border border-gray-200 rounded px-2 py-1 text-[11px] bg-gray-50/50 text-gray-400 flex items-center gap-1 cursor-not-allowed">
                                <span>🔗</span>
                                <span className="truncate">
                                  {field.placeholder || 'https://...'}
                                </span>
                              </div>
                            )}

                            {field.type === 'attachment' && (
                              <div className="border border-dashed border-gray-300 rounded p-2 text-center bg-gray-50/60 cursor-not-allowed">
                                <span className="material-symbols-outlined text-gray-400 text-[16px] mx-auto block">
                                  cloud_upload
                                </span>
                                <span className="text-[10px] text-gray-500 font-medium block">
                                  {field.placeholder || '上传图片、视频或证明材料'}
                                </span>
                              </div>
                            )}

                            {field.type === 'select' && (
                              <div className="w-full border border-gray-200 rounded px-2 py-1 text-[11px] bg-gray-50/50 text-gray-400 flex items-center justify-between cursor-not-allowed">
                                <span>{field.placeholder || '请选择分类'}</span>
                                <span className="material-symbols-outlined text-gray-400 text-[14px]">
                                  expand_more
                                </span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => saveTemplate(editingTemplate)}
                className="px-5 py-1.5 rounded-lg text-xs font-semibold bg-[#1677ff] text-white hover:bg-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>保存模板配置</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Modal 2: 审核打分规则详情 (View Scoring Rule Group) */}
      {/* ========================================================= */}
      {viewingScoringRuleGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 animate-scale-in">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <h3 className="text-base font-bold text-gray-900">审核打分规则详情</h3>
              <button
                type="button"
                onClick={() => setViewingScoringRuleGroup(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Title */}
              <h2 className="text-base font-bold text-gray-900">
                {viewingScoringRuleGroup.name}
              </h2>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#fafbfc] border border-gray-100 rounded-lg p-3.5">
                  <span className="text-gray-400 text-xs block mb-1">适用范围</span>
                  <span className="text-sm font-bold text-[#1890ff]">
                    {viewingScoringRuleGroup.scope}
                  </span>
                </div>
                <div className="bg-[#fafbfc] border border-gray-100 rounded-lg p-3.5">
                  <span className="text-gray-400 text-xs block mb-1">规则总分</span>
                  <span className="text-sm font-bold text-[#fa8c16]">
                    {viewingScoringRuleGroup.totalScore} 分 / {viewingScoringRuleGroup.levels.length} 等级
                  </span>
                </div>
                <div className="bg-[#fafbfc] border border-gray-100 rounded-lg p-3.5">
                  <span className="text-gray-400 text-xs block mb-1">规则状态</span>
                  <span
                    className={`text-sm font-bold ${
                      viewingScoringRuleGroup.status ? 'text-[#52c41a]' : 'text-gray-500'
                    }`}
                  >
                    {viewingScoringRuleGroup.status ? '启用（当前生效）' : '停用（备用规则）'}
                  </span>
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-[#fafbfc] border border-gray-100 rounded-lg p-3.5 text-xs">
                <span className="text-gray-400 block mb-1">说明描述</span>
                <p className="text-gray-700 leading-relaxed">
                  {viewingScoringRuleGroup.description || '暂无说明描述'}
                </p>
              </div>

              {/* Scoring Levels Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900">等级评分方案</h4>
                  <span className="text-xs text-gray-400">互斥命中一个等级得分</span>
                </div>

                <div className="space-y-2.5">
                  {viewingScoringRuleGroup.levels.map((lvl, idx) => (
                    <div
                      key={lvl.id}
                      className="bg-white border border-gray-200 rounded-lg p-3.5 flex items-center justify-between gap-4 hover:border-blue-200 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-blue-50 text-[#1890ff] font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-gray-900 truncate">
                            {lvl.name}
                          </div>
                          <div className="text-[11px] text-gray-500 truncate mt-0.5">
                            {lvl.description || '—'}
                          </div>
                        </div>
                      </div>
                      <div className="text-base font-bold text-[#fa8c16] shrink-0 font-mono">
                        {lvl.score} <span className="text-xs font-normal text-gray-600">分</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with Edit button */}
            <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const current = viewingScoringRuleGroup;
                  setViewingScoringRuleGroup(null);
                  setEditingScoringRuleGroup(current);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[15px]">edit</span>
                <span>编辑</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Modal 3: 新增 / 编辑审核打分规则 (Add / Edit Scoring Rule Group) */}
      {/* ========================================================= */}
      {editingScoringRuleGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 animate-scale-in">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <h3 className="text-base font-bold text-gray-900">
                {(rules.scoringRuleGroups || defaultInstitutionBusinessRules.scoringRuleGroups || []).some(
                  (g) => g.id === editingScoringRuleGroup.id
                )
                  ? '编辑审核打分规则'
                  : '新增审核打分规则'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingScoringRuleGroup(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto text-xs">
              {/* Row 1: 规则名称 & 适用范围 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">规则名称</label>
                  <input
                    type="text"
                    value={editingScoringRuleGroup.name}
                    onChange={(e) =>
                      setEditingScoringRuleGroup({
                        ...editingScoringRuleGroup,
                        name: e.target.value,
                      })
                    }
                    placeholder="请输入打分规则名称，如：标准五级百分制打分规则组"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1890ff]"
                  />
                </div>
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">适用范围</label>
                  <input
                    type="text"
                    value={editingScoringRuleGroup.scope}
                    onChange={(e) =>
                      setEditingScoringRuleGroup({
                        ...editingScoringRuleGroup,
                        scope: e.target.value,
                      })
                    }
                    placeholder="如：全部上报统一适用"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1890ff]"
                  />
                </div>
              </div>

              {/* Row 2: 总分、等级数、启用状态、说明 */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="text-gray-700 font-semibold block mb-1">总分</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={editingScoringRuleGroup.totalScore}
                      onChange={(e) =>
                        setEditingScoringRuleGroup({
                          ...editingScoringRuleGroup,
                          totalScore: Number(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#1890ff]"
                    />
                    <span className="text-gray-500 text-xs shrink-0">分</span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-gray-700 font-semibold block mb-1">等级</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={editingScoringRuleGroup.levels.length}
                      readOnly
                      className="w-full border border-gray-200 bg-gray-50 rounded-lg px-2.5 py-2 text-xs font-mono font-bold text-gray-700"
                    />
                    <span className="text-gray-500 text-xs shrink-0">个</span>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="text-gray-700 font-semibold block mb-1">
                    启用状态 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded-lg border border-gray-300 p-0.5 bg-gray-100">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingScoringRuleGroup({
                          ...editingScoringRuleGroup,
                          status: true,
                        })
                      }
                      className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        editingScoringRuleGroup.status
                          ? 'bg-white text-gray-900 shadow-2xs font-bold'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      启用
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingScoringRuleGroup({
                          ...editingScoringRuleGroup,
                          status: false,
                        })
                      }
                      className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        !editingScoringRuleGroup.status
                          ? 'bg-white text-gray-900 shadow-2xs font-bold'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      停用
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-5">
                  <label className="text-gray-700 font-semibold block mb-1">说明</label>
                  <input
                    type="text"
                    value={editingScoringRuleGroup.description}
                    onChange={(e) =>
                      setEditingScoringRuleGroup({
                        ...editingScoringRuleGroup,
                        description: e.target.value,
                      })
                    }
                    placeholder="按审核结果命中一个评分等级，设为启用后生效"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1890ff]"
                  />
                </div>
              </div>

              {/* Section 3: 等级评分列表 */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900">等级评分</h4>
                    <span className="px-1.5 py-0.5 rounded bg-[#f6ffed] text-[#52c41a] text-[11px] border border-[#b7eb8f] font-medium">
                      互斥命中
                    </span>
                    <span className="text-xs text-gray-400">
                      {editingScoringRuleGroup.totalScore} 分满分，审核时只选一个等级
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addScoringLevel}
                    className="text-xs font-semibold text-[#1890ff] hover:bg-blue-50 border border-blue-200 px-3 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    <span>新增等级</span>
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/40 space-y-2.5">
                  {editingScoringRuleGroup.levels.map((lvl, idx) => (
                    <div
                      key={lvl.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggingLevelIdx(idx);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={() => handleDropLevel(idx)}
                      onDragEnd={() => setDraggingLevelIdx(null)}
                      className={`border rounded-lg p-2.5 flex items-center gap-3 shadow-2xs transition-all ${
                        draggingLevelIdx === idx
                          ? 'border-blue-400 bg-blue-50/70 opacity-60 scale-[0.99]'
                          : 'bg-white border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      {/* Drag handle & Index */}
                      <div
                        className="flex items-center gap-1 text-gray-400 hover:text-blue-600 select-none pl-1 cursor-grab active:cursor-grabbing"
                        title="按住拖拽以调整等级排序"
                      >
                        <span className="material-symbols-outlined text-[16px] text-gray-400">
                          drag_indicator
                        </span>
                        <span className="font-mono text-xs text-gray-400 w-6">#{idx + 1}</span>
                      </div>

                      {/* Level Name */}
                      <div className="w-44 shrink-0">
                        <input
                          type="text"
                          value={lvl.name}
                          onChange={(e) => {
                            const updated = [...editingScoringRuleGroup.levels];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            setEditingScoringRuleGroup({ ...editingScoringRuleGroup, levels: updated });
                          }}
                          placeholder="等级名称 (如: 一等（特优）)"
                          className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#1890ff]"
                        />
                      </div>

                      {/* Score */}
                      <div className="flex items-center gap-1 w-24 shrink-0">
                        <input
                          type="number"
                          value={lvl.score}
                          onChange={(e) => {
                            const updated = [...editingScoringRuleGroup.levels];
                            updated[idx] = { ...updated[idx], score: Number(e.target.value) };
                            setEditingScoringRuleGroup({ ...editingScoringRuleGroup, levels: updated });
                          }}
                          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs text-center font-mono font-bold text-[#fa8c16] focus:outline-none focus:border-[#1890ff]"
                        />
                        <span className="text-gray-500 text-xs shrink-0">分</span>
                      </div>

                      {/* Description */}
                      <div className="flex-1">
                        <input
                          type="text"
                          value={lvl.description}
                          onChange={(e) => {
                            const updated = [...editingScoringRuleGroup.levels];
                            updated[idx] = { ...updated[idx], description: e.target.value };
                            setEditingScoringRuleGroup({ ...editingScoringRuleGroup, levels: updated });
                          }}
                          placeholder="输入该等级评定标准与佐证要求..."
                          className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-[#1890ff]"
                        />
                      </div>

                      {/* Delete button */}
                      <div className="pr-1">
                        {editingScoringRuleGroup.levels.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editingScoringRuleGroup.levels.filter((_, i) => i !== idx);
                              setEditingScoringRuleGroup({
                                ...editingScoringRuleGroup,
                                levels: updated,
                                levelCount: updated.length,
                              });
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[17px]">delete</span>
                          </button>
                        ) : (
                          <span className="text-gray-300 p-1 cursor-not-allowed">
                            <span className="material-symbols-outlined text-[17px]">delete</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingScoringRuleGroup(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 cursor-pointer shadow-2xs"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => saveScoringRuleGroup(editingScoringRuleGroup)}
                className="px-5 py-1.5 rounded-lg text-xs font-semibold bg-[#1677ff] hover:bg-blue-600 text-white cursor-pointer shadow-2xs"
              >
                保存模板配置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Modal 4: View Dict Item Modal (只读查看) */}
      {/* ========================================================= */}
      {viewingDictItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-scale-in">
            <div className="bg-[#f8fafd] px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1890ff] text-[20px]">
                  visibility
                </span>
                <span>查看数据字典详情</span>
              </h3>
              <button
                type="button"
                onClick={() => setViewingDictItem(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-gray-50/80 p-3.5 rounded-lg border border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[11px] mb-0.5">所属类别</span>
                  <span className="font-semibold text-gray-800">
                    {viewingDictItem.dictType === 'reject_reason' ? '审核驳回理由' : '人员标签'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px] mb-0.5">系统属性</span>
                  <div>
                    {viewingDictItem.isSystem ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[11px] border border-gray-200">
                        <span className="material-symbols-outlined text-[12px]">lock</span>
                        系统默认
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-50 text-green-600 text-[11px] border border-green-200">
                        <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                        自定义
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px] mb-1">
                  {viewingDictItem.dictType === 'reject_reason' ? '驳回理由名称' : '标签名称'}
                </span>
                <div className="text-sm font-bold text-gray-900 bg-white border border-gray-200 rounded-md px-3 py-2">
                  {viewingDictItem.label}
                </div>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px] mb-1">
                  {viewingDictItem.dictType === 'reject_reason' ? '审核员提示说明' : '标签说明'}
                </span>
                <div className="text-xs text-gray-700 bg-gray-50/50 border border-gray-200 rounded-md px-3 py-2.5 leading-relaxed min-h-[60px]">
                  {viewingDictItem.description || '暂无说明'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-400 block text-[11px] mb-1">数据编码 (Value)</span>
                  <div className="text-xs font-mono text-gray-700 bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5">
                    {viewingDictItem.value}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px] mb-1">排序号</span>
                  <div className="text-xs font-mono text-gray-700 bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5">
                    {viewingDictItem.sortOrder}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-400 block text-[11px] mb-1">当前状态</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        viewingDictItem.status ? 'bg-[#52c41a]' : 'bg-gray-300'
                      }`}
                    />
                    <span className="font-semibold text-gray-800">
                      {viewingDictItem.status ? '启用中' : '已停用'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px] mb-1">最后更新时间</span>
                  <div className="text-xs font-mono text-gray-600">
                    {viewingDictItem.updatedAt || '2023-10-15 09:00:00'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const item = viewingDictItem;
                  setViewingDictItem(null);
                  setEditingDictItem(item);
                }}
                className="px-4 py-1.5 rounded text-xs font-medium text-[#1890ff] hover:bg-blue-50 border border-blue-200 cursor-pointer"
              >
                去编辑
              </button>
              <button
                type="button"
                onClick={() => setViewingDictItem(null)}
                className="px-5 py-1.5 rounded text-xs font-medium bg-gray-800 text-white hover:bg-gray-900 cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Modal 4: Edit/Add Dict Item Modal */}
      {/* ========================================================= */}
      {editingDictItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-scale-in">
            <div className="bg-[#f8fafd] px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">
                {rules.dictItems.some((d) => d.id === editingDictItem.id) ? '编辑' : '新增'}
                {editingDictItem.dictType === 'reject_reason' ? '驳回理由' : '人员标签'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingDictItem(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-gray-700 font-semibold block mb-1">
                  {editingDictItem.dictType === 'reject_reason' ? '驳回理由名称' : '人员标签名称'}
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={editingDictItem.label}
                  onChange={(e) =>
                    setEditingDictItem({ ...editingDictItem, label: e.target.value })
                  }
                  placeholder="例如：信息真实性核查不通过"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#1890ff]"
                />
              </div>

              <div>
                <label className="text-gray-700 font-semibold block mb-1">
                  {editingDictItem.dictType === 'reject_reason' ? '审核员提示说明' : '标签业务职能说明'}
                </label>
                <textarea
                  rows={3}
                  value={editingDictItem.description || ''}
                  onChange={(e) =>
                    setEditingDictItem({ ...editingDictItem, description: e.target.value })
                  }
                  placeholder="请输入该字典项的具体提示或审核规范..."
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#1890ff] leading-relaxed resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">数据编码值 (Value)</label>
                  <input
                    type="text"
                    value={editingDictItem.value}
                    onChange={(e) =>
                      setEditingDictItem({ ...editingDictItem, value: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-xs focus:outline-none focus:border-[#1890ff]"
                  />
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">排序号</label>
                  <input
                    type="number"
                    value={editingDictItem.sortOrder}
                    onChange={(e) =>
                      setEditingDictItem({ ...editingDictItem, sortOrder: Number(e.target.value) })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-xs focus:outline-none focus:border-[#1890ff]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <span className="text-gray-700 font-semibold">启用状态</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingDictItem({
                        ...editingDictItem,
                        status: !editingDictItem.status,
                      })
                    }
                    className={`relative inline-flex h-[20px] w-[38px] items-center rounded-full transition-colors cursor-pointer select-none px-[2px] ${
                      editingDictItem.status ? 'bg-[#52c41a]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-[16px] w-[16px] rounded-full bg-white transition-transform ${
                        editingDictItem.status ? 'translate-x-[18px]' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-xs ${editingDictItem.status ? 'text-gray-800' : 'text-gray-400'}`}>
                    {editingDictItem.status ? '启用' : '停用'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingDictItem(null)}
                className="px-4 py-1.5 rounded text-xs text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => saveDictItem(editingDictItem)}
                className="px-5 py-1.5 rounded text-xs font-medium bg-[#1890ff] text-white hover:bg-blue-600 cursor-pointer"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Modal 5: Edit Assessment Modal */}
      {/* ========================================================= */}
      {editingAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-scale-in">
            <div className="bg-[#f8fafd] px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">编辑考核指标</h3>
              <button
                type="button"
                onClick={() => setEditingAssessment(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-gray-700 font-semibold block mb-1">指标名称</label>
                <input
                  type="text"
                  value={editingAssessment.metricName}
                  onChange={(e) =>
                    setEditingAssessment({ ...editingAssessment, metricName: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">基准目标值</label>
                  <input
                    type="number"
                    value={editingAssessment.targetValue}
                    onChange={(e) =>
                      setEditingAssessment({
                        ...editingAssessment,
                        targetValue: Number(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">单位</label>
                  <input
                    type="text"
                    value={editingAssessment.unit}
                    onChange={(e) =>
                      setEditingAssessment({ ...editingAssessment, unit: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">权重 (%)</label>
                  <input
                    type="number"
                    value={editingAssessment.weight}
                    onChange={(e) =>
                      setEditingAssessment({
                        ...editingAssessment,
                        weight: Number(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">奖励积分 (+)</label>
                  <input
                    type="number"
                    value={editingAssessment.rewardPoints}
                    onChange={(e) =>
                      setEditingAssessment({
                        ...editingAssessment,
                        rewardPoints: Number(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">惩罚扣分 (-)</label>
                  <input
                    type="number"
                    value={editingAssessment.penaltyPoints}
                    onChange={(e) =>
                      setEditingAssessment({
                        ...editingAssessment,
                        penaltyPoints: Number(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingAssessment(null)}
                className="px-4 py-1.5 rounded text-xs text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => saveAssessmentRule(editingAssessment)}
                className="px-5 py-1.5 rounded text-xs font-medium bg-[#1890ff] text-white hover:bg-blue-600 cursor-pointer"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
