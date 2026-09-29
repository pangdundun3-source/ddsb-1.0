import {
  InstitutionBusinessRules,
  TemplateConfigItem,
  TemplateFieldItem,
  ScoringRuleGroup,
  ScoringDimension,
  DictItem,
  AssessmentRuleItem,
  MetricFormulaConfig,
  ReviewLevelNode,
  ValueAddedServiceItem,
  OtherBusinessConfig,
  QrCodeUsageConfig,
} from '../types';
import { defaultGlobalMpControlConfig } from '../components/other-config/GlobalOtherConfigDefaultsSection';

export const defaultValueAddedServices: ValueAddedServiceItem[] = [
  {
    id: 'vas-batch-review',
    name: '批量审核',
    isPurchased: true,
    isEnabled: true,
    tag: '增值扩展功能',
    description: '支持批量勾选多条报送线索与事项目录、快捷批量审核通过、批量驳回与一键签发转办，大幅提升处置效率',
    icon: 'auto_awesome',
    isGlobal: true,
  },
  {
    id: 'vas-screenshot-evidence',
    name: '截图取证',
    isPurchased: true,
    isEnabled: false,
    tag: '增值扩展功能',
    description: '自动化对涉事网页及社交媒体内容进行全屏快照截屏存证，生成区块链与防篡改水文可信取证包',
    icon: 'auto_awesome',
    isGlobal: true,
  },
  {
    id: 'vas-instruction-flow',
    name: '指令流转',
    isPurchased: true,
    isEnabled: true,
    tag: '增值扩展功能',
    description: '跨部门与下级节点指令下发、时限催办、督查跟进、反馈回复与闭环归档全流程协作引擎',
    icon: 'auto_awesome',
    isGlobal: true,
  },
  {
    id: 'vas-system-announcement',
    name: '系统公告',
    isPurchased: true,
    isEnabled: true,
    tag: '增值扩展功能',
    description: '支撑全网节点重大通知广播、突发风险预警弹窗强提醒及全局公告消息穿透推送',
    icon: 'auto_awesome',
    isGlobal: true,
  },
  {
    id: 'vas-first-publish-duplicate',
    name: '报送首发重复识别',
    isPurchased: true,
    isEnabled: true,
    tag: '增值扩展功能',
    description: '通过抓取报送链接的文章原文比对判断内容是否重复，并结合提交时间线智能判定首发，避免多头报送与重复审核计分。',
    icon: 'auto_awesome',
    isGlobal: true,
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

export const initialGlobalBusinessRules: InstitutionBusinessRules = {
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
      isGlobal: true,
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
      isGlobal: true,
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
      isGlobal: true,
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
      isGlobal: true,
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
      isGlobal: true,
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
      isGlobal: true,
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
      isGlobal: true,
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
      isGlobal: true,
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
      isGlobal: true,
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
      isGlobal: true,
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
      isGlobal: true,
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
      isGlobal: true,
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
      isGlobal: true,
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
      isGlobal: true,
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
      isGlobal: true,
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
      isGlobal: true,
      status: true,
      description: '超出当前所属职能管辖范围，应转交相应条线',
      updatedAt: '2023-10-22 14:00:00',
    },
    {
      id: 'd-rr-5',
      dictType: 'reject_reason',
      label: '敏感词或涉密信息违规',
      value: 'confidential_violation',
      sortOrder: 5,
      isSystem: true,
      isGlobal: true,
      status: true,
      description: '包含未经脱敏的敏感涉密数据或未公开通报内容',
      updatedAt: '2023-10-25 16:30:00',
    },

    // 研判等级 (judgment_level)
    {
      id: 'd-jl-1',
      dictType: 'judgment_level',
      label: 'Ⅰ级（特别重大/极高危）',
      value: 'level_1',
      sortOrder: 1,
      isSystem: true,
      isGlobal: true,
      status: true,
      description: '全网性重大突发危机，需启动应急专报与领导直通车',
      updatedAt: '2023-10-15 09:00:00',
    },
    {
      id: 'd-jl-2',
      dictType: 'judgment_level',
      label: 'Ⅱ级（重大/高危）',
      value: 'level_2',
      sortOrder: 2,
      isSystem: true,
      isGlobal: true,
      status: true,
      description: '跨市域广泛传播或涉及重要部门核心业务的重大舆情',
      updatedAt: '2023-10-15 09:00:00',
    },
    {
      id: 'd-jl-3',
      dictType: 'judgment_level',
      label: 'Ⅲ级（较大/中度）',
      value: 'level_3',
      sortOrder: 3,
      isSystem: true,
      isGlobal: true,
      status: true,
      description: '局部区域热议发酵，存在一定升温外溢风险',
      updatedAt: '2023-10-15 09:00:00',
    },
    {
      id: 'd-jl-4',
      dictType: 'judgment_level',
      label: 'Ⅳ级（一般/低危）',
      value: 'level_4',
      sortOrder: 4,
      isSystem: false,
      isGlobal: true,
      status: true,
      description: '普通民生咨询诉求或低热度个案线索',
      updatedAt: '2023-10-18 10:20:00',
    },

    // 事件分类 (event_category)
    {
      id: 'd-ec-1',
      dictType: 'event_category',
      label: '时政要闻与政务发布',
      value: 'politics_gov',
      sortOrder: 1,
      isSystem: true,
      isGlobal: true,
      status: true,
      description: '政策宣贯、重要会议部署及政务公开权威通报',
      updatedAt: '2023-10-15 09:00:00',
    },
    {
      id: 'd-ec-2',
      dictType: 'event_category',
      label: '社会民生与公众热点',
      value: 'livelihood_hotspot',
      sortOrder: 2,
      isSystem: true,
      isGlobal: true,
      status: true,
      description: '群众关切、民生诉求、城市治理及交通医疗热点',
      updatedAt: '2023-10-15 09:00:00',
    },
    {
      id: 'd-ec-3',
      dictType: 'event_category',
      label: '网络安全与应急风险',
      value: 'cyber_security',
      sortOrder: 3,
      isSystem: true,
      isGlobal: true,
      status: true,
      description: '涉网攻击威胁、漏洞通报、谣言阻断及安全处置',
      updatedAt: '2023-10-15 09:00:00',
    },
    {
      id: 'd-ec-4',
      dictType: 'event_category',
      label: '经济与产业发展',
      value: 'economy_industry',
      sortOrder: 4,
      isSystem: false,
      isGlobal: true,
      status: true,
      description: '重点工程招商、企业营商环境及金融物价态势',
      updatedAt: '2023-10-20 11:30:00',
    },

    // 处置状态 (handling_status)
    {
      id: 'd-hs-1',
      dictType: 'handling_status',
      label: '待研判分流',
      value: 'pending_triage',
      sortOrder: 1,
      isSystem: true,
      isGlobal: true,
      status: true,
      description: '线索已接收，等待调度中心分配承办单位',
      updatedAt: '2023-10-15 09:00:00',
    },
    {
      id: 'd-hs-2',
      dictType: 'handling_status',
      label: '处置核查中',
      value: 'in_progress',
      sortOrder: 2,
      isSystem: true,
      isGlobal: true,
      status: true,
      description: '承办单位正在组织现场调查、溯源取证或舆论引导',
      updatedAt: '2023-10-15 09:00:00',
    },
    {
      id: 'd-hs-3',
      dictType: 'handling_status',
      label: '已办结归档',
      value: 'completed',
      sortOrder: 3,
      isSystem: true,
      isGlobal: true,
      status: true,
      description: '核查处置完毕，反馈报告已通过审核并入库归档',
      updatedAt: '2023-10-15 09:00:00',
    },
  ],

  // 4. 考核规则
  assessmentCycle: 'monthly',
  enablePenalty: true,
  assessmentRules: [
    {
      id: 'ar-1',
      metricName: '月度报送采纳基准篇数',
      targetValue: 20,
      unit: '篇/月',
      cycle: 'monthly',
      weight: 35,
      rewardPoints: 5,
      penaltyPoints: 2,
      isGlobal: true,
      status: true,
    },
    {
      id: 'ar-2',
      metricName: '突发事件响应首报时效',
      targetValue: 30,
      unit: '分钟内',
      cycle: 'monthly',
      weight: 25,
      rewardPoints: 8,
      penaltyPoints: 5,
      isGlobal: true,
      status: true,
    },
    {
      id: 'ar-3',
      metricName: '深度研判专报采纳率',
      targetValue: 80,
      unit: '%',
      cycle: 'monthly',
      weight: 20,
      rewardPoints: 10,
      penaltyPoints: 3,
      isGlobal: true,
      status: true,
    },
    {
      id: 'ar-4',
      metricName: '文字零错情率（红线指标）',
      targetValue: 99,
      unit: '%',
      cycle: 'monthly',
      weight: 20,
      rewardPoints: 5,
      penaltyPoints: 15,
      isGlobal: true,
      status: true,
    },
  ],

  // 5. 统计指标配置
  metricsFormula: {
    readWeight: 1.0,
    likeWeight: 2.0,
    shareWeight: 5.0,
    commentWeight: 3.0,
    originalBonus: 20,
    activeThreshold: 100,
    isGlobal: true,
    statDimensions: [
      '机构上报总量统计',
      '跨级采纳转化率分析',
      '审签处置平均耗时',
      '各级直通车批示率',
      '舆情态势平息周期',
    ],
  },

  // 6. 审核流程配置
  workflowType: 'two_level',
  enableFastTrack: true,
  autoApproveKeywords: ['【例行公开】', '【天气早报】', '【节气海报】', '【科普专栏】'],
  reviewNodes: [
    {
      id: 'rn-1',
      level: 1,
      title: '一审 · 格式校核与敏感词筛查',
      role: '初审编辑岗',
      approvers: ['李晓霞 (采编组)', '张凯 (校对岗)'],
      timeoutHours: 2,
      allowTransfer: true,
      allowDirectPublish: false,
      isGlobal: true,
      status: true,
    },
    {
      id: 'rn-2',
      level: 2,
      title: '二审 · 事实准确性与研判定级',
      role: '主编/值班组长',
      approvers: ['王飞飞 (主编)', '刘立强 (值班副总编)'],
      timeoutHours: 4,
      allowTransfer: true,
      allowDirectPublish: true,
      isGlobal: true,
      status: true,
    },
    {
      id: 'rn-3',
      level: 3,
      title: '三审 · 终审签发与推送下达 (重大专项)',
      role: '分管主任/总编辑',
      approvers: ['张宏 (总编辑)', '赵建国 (中心主任)'],
      timeoutHours: 8,
      allowTransfer: false,
      allowDirectPublish: true,
      isGlobal: true,
      status: true,
    },
  ],

  // 7. 增值业务
  valueAddedServices: defaultValueAddedServices,

  // 8. 其他配置
  otherConfig: {
    qrUsage: {
      totalLimit: 50,
      usedCount: 18,
      warningThreshold: 10,
      allowSelfApply: true,
    },
    globalMpControl: defaultGlobalMpControlConfig,
  } satisfies OtherBusinessConfig,

  // 登录鉴权
  loginAuth: {
    allowPasswordLogin: true,
    allowSmsLogin: true,
    allowQyWechatQr: true,
    allowDingTalkSso: false,
    allowFeishuSso: false,
    requireMfa: false,
    passwordExpireDays: 90,
    sessionTimeoutMinutes: 120,
    ipWhitelistEnabled: false,
    ipWhitelist: '127.0.0.1\n192.168.1.0/24',
  },
};

// 机构初始化二维码名额库：以平台通用默认总额度为上限，占用/台账从零开始
const buildDefaultInstitutionQrUsage = (
  globalQr?: QrCodeUsageConfig
): QrCodeUsageConfig => ({
  totalLimit: globalQr?.totalLimit ?? 50,
  usedCount: globalQr?.usedCount ?? 18,
  historyRecords: globalQr?.historyRecords ?? [],
  warningThreshold: globalQr?.warningThreshold ?? 10,
  allowSelfApply: globalQr?.allowSelfApply ?? true,
});

// Merge an institution's custom rules with global rules
// Rule inheritance principle:
// 1. Global rules are non-deletable in institution view, but can be enabled/disabled or customized.
// 2. Custom rules created by the institution are fully editable and deletable.
export const mergeInstitutionRulesWithGlobal = (
  instRules?: InstitutionBusinessRules | null,
  globalRules: InstitutionBusinessRules = initialGlobalBusinessRules
): InstitutionBusinessRules => {
  if (!instRules) {
    // If no institution rules exist, start with cloned global rules
    return {
      ...globalRules,
      templates: globalRules.templates.map((t) => ({ ...t, isGlobal: true })),
      scoringRuleGroups: globalRules.scoringRuleGroups?.map((g) => ({ ...g, isGlobal: true })),
      scoringDimensions: globalRules.scoringDimensions.map((d) => ({ ...d, isGlobal: true })),
      dictItems: globalRules.dictItems.map((d) => ({ ...d, isGlobal: true })),
      assessmentRules: globalRules.assessmentRules.map((a) => ({ ...a, isGlobal: true })),
      reviewNodes: globalRules.reviewNodes.map((n) => ({ ...n, isGlobal: true })),
      valueAddedServices: globalRules.valueAddedServices?.map((v) => ({ ...v, isGlobal: true })),
      otherConfig: {
        ...(globalRules.otherConfig || {}),
        qrUsage: buildDefaultInstitutionQrUsage(globalRules.otherConfig?.qrUsage),
      },
    };
  }

  // 1. Merge templates: include all global templates + any custom templates
  const globalTemplateIds = new Set(globalRules.templates.map((t) => t.id));
  const mergedTemplates: TemplateConfigItem[] = [];

  // Add all global templates (preserving institution's toggle state / customizations if modified)
  globalRules.templates.forEach((gt) => {
    const instOverride = instRules.templates?.find((t) => t.id === gt.id);
    if (instOverride) {
      mergedTemplates.push({
        ...gt,
        ...instOverride,
        isGlobal: true,
        isCustom: false,
      });
    } else {
      mergedTemplates.push({
        ...gt,
        isGlobal: true,
        isCustom: false,
      });
    }
  });

  // Add institution's own custom templates
  (instRules.templates || []).forEach((t) => {
    if (!globalTemplateIds.has(t.id)) {
      mergedTemplates.push({
        ...t,
        isGlobal: false,
        isCustom: true,
      });
    }
  });

  // 2. Merge scoring rule groups
  const globalGroupIds = new Set((globalRules.scoringRuleGroups || []).map((g) => g.id));
  const mergedGroups: ScoringRuleGroup[] = [];

  (globalRules.scoringRuleGroups || []).forEach((gg) => {
    const instOverride = (instRules.scoringRuleGroups || []).find((g) => g.id === gg.id);
    if (instOverride) {
      mergedGroups.push({
        ...gg,
        ...instOverride,
        isGlobal: true,
        isCustom: false,
      });
    } else {
      mergedGroups.push({
        ...gg,
        isGlobal: true,
        isCustom: false,
      });
    }
  });

  (instRules.scoringRuleGroups || []).forEach((g) => {
    if (!globalGroupIds.has(g.id)) {
      mergedGroups.push({
        ...g,
        isGlobal: false,
        isCustom: true,
      });
    }
  });

  // 3. Merge dictionary items
  const globalDictIds = new Set(globalRules.dictItems.map((d) => d.id));
  const mergedDicts: DictItem[] = [];

  globalRules.dictItems.forEach((gd) => {
    const instOverride = (instRules.dictItems || []).find((d) => d.id === gd.id);
    if (instOverride) {
      mergedDicts.push({
        ...gd,
        ...instOverride,
        isGlobal: true,
        isCustom: false,
      });
    } else {
      mergedDicts.push({
        ...gd,
        isGlobal: true,
        isCustom: false,
      });
    }
  });

  (instRules.dictItems || []).forEach((d) => {
    if (!globalDictIds.has(d.id)) {
      mergedDicts.push({
        ...d,
        isGlobal: false,
        isCustom: true,
      });
    }
  });

  // 4. Merge assessment rules
  const globalAssessIds = new Set(globalRules.assessmentRules.map((a) => a.id));
  const mergedAssess: AssessmentRuleItem[] = [];

  globalRules.assessmentRules.forEach((ga) => {
    const instOverride = (instRules.assessmentRules || []).find((a) => a.id === ga.id);
    if (instOverride) {
      mergedAssess.push({
        ...ga,
        ...instOverride,
        isGlobal: true,
        isCustom: false,
      });
    } else {
      mergedAssess.push({
        ...ga,
        isGlobal: true,
        isCustom: false,
      });
    }
  });

  (instRules.assessmentRules || []).forEach((a) => {
    if (!globalAssessIds.has(a.id)) {
      mergedAssess.push({
        ...a,
        isGlobal: false,
        isCustom: true,
      });
    }
  });

  // 5. Merge review nodes
  const globalReviewLevels = new Set(globalRules.reviewNodes.map((r) => r.level));
  const mergedNodes: ReviewLevelNode[] = [];

  globalRules.reviewNodes.forEach((gn) => {
    const instOverride = (instRules.reviewNodes || []).find((n) => n.level === gn.level);
    if (instOverride) {
      mergedNodes.push({
        ...gn,
        ...instOverride,
        isGlobal: true,
        isCustom: false,
      });
    } else {
      mergedNodes.push({
        ...gn,
        isGlobal: true,
        isCustom: false,
      });
    }
  });

  (instRules.reviewNodes || []).forEach((n) => {
    if (!globalReviewLevels.has(n.level)) {
      mergedNodes.push({
        ...n,
        isGlobal: false,
        isCustom: true,
      });
    }
  });

  // 6. Merge value added services
  const globalVasIds = new Set((globalRules.valueAddedServices || []).map((v) => v.id));
  const mergedVas: ValueAddedServiceItem[] = [];

  (globalRules.valueAddedServices || []).forEach((gv) => {
    const instOverride = (instRules.valueAddedServices || []).find((v) => v.id === gv.id);
    if (instOverride) {
      mergedVas.push({
        ...gv,
        ...instOverride,
        isGlobal: true,
      });
    } else {
      mergedVas.push({
        ...gv,
        isGlobal: true,
      });
    }
  });

  (instRules.valueAddedServices || []).forEach((v) => {
    if (!globalVasIds.has(v.id)) {
      mergedVas.push({
        ...v,
        isGlobal: false,
      });
    }
  });

  return {
    ...globalRules,
    ...instRules,
    templates: mergedTemplates,
    scoringRuleGroups: mergedGroups,
    dictItems: mergedDicts,
    assessmentRules: mergedAssess,
    reviewNodes: mergedNodes,
    valueAddedServices: mergedVas,
    otherConfig: {
      ...(globalRules.otherConfig || {}),
      ...(instRules.otherConfig || {}),
      qrUsage: instRules.otherConfig?.qrUsage
        ? instRules.otherConfig.qrUsage
        : buildDefaultInstitutionQrUsage(globalRules.otherConfig?.qrUsage),
    },
    metricsFormula: instRules.metricsFormula || globalRules.metricsFormula,
    passScore: instRules.passScore ?? globalRules.passScore,
    excellentScore: instRules.excellentScore ?? globalRules.excellentScore,
    zeroToleranceViolation: instRules.zeroToleranceViolation ?? globalRules.zeroToleranceViolation,
    assessmentCycle: instRules.assessmentCycle || globalRules.assessmentCycle,
    enablePenalty: instRules.enablePenalty ?? globalRules.enablePenalty,
    workflowType: instRules.workflowType || globalRules.workflowType,
    enableFastTrack: instRules.enableFastTrack ?? globalRules.enableFastTrack,
    autoApproveKeywords: instRules.autoApproveKeywords || globalRules.autoApproveKeywords,
  };
};
