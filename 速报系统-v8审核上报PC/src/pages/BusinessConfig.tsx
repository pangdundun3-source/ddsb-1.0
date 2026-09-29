import React, { useState } from 'react';
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
  CheckCircle2,
  XCircle,
  BarChart3
} from 'lucide-react';

export type FieldType = 'text' | 'number' | 'date' | 'file' | 'link' | 'select';

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
  timeLimitMinutes?: number;
}

export interface OrgScopeSetting {
  orgId: string;
  orgName: string;
  enabled: boolean;
}

export interface EvaluationIndicator {
  id: string;
  name: string;
  calcType: '基础分' | '通过率/采纳率' | '时效响应' | '参与率' | '加分项' | '扣分项';
  basePoints: number;
  weightPercent: number;
  unitRule: string;
}

interface ConfigModuleItem {
  id: string;
  name: string;
  templateType?: '报送' | '激活';
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
  flowDepth?: number;
  auditNodes?: AuditNode[];
  orgApplyMode?: 'all_orgs' | 'specific_orgs';
  orgSettings?: OrgScopeSetting[];
  evalDimension?: 'category' | 'org' | 'person' | 'comprehensive';
  indicators?: EvaluationIndicator[];
  dictCategory?: string;
  dictCategoryName?: string;
  dictCode?: string;
  sortOrder?: number;
  metricScope?: 'home' | 'stats' | 'both';
  calcFormula?: string;
  timeDimension?: 'realtime' | 'daily' | 'weekly' | 'monthly' | 'multi';
  unit?: string;
  precision?: 'integer' | 'decimal_1' | 'decimal_2';
  targetBenchmark?: string;
  calcType?: 'count' | 'rate' | 'avg' | 'trend' | 'distribution';
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
    default:
      return { label: '文本字段', icon: Type, color: 'text-gray-600 bg-gray-50 border-gray-200' };
  }
};

interface BusinessConfigProps {
  initialModule?: string;
}

export const BusinessConfig: React.FC<BusinessConfigProps> = ({ initialModule }) => {
  // Currently active configuration module in the left column
  const [activeModule, setActiveModule] = useState<string>(initialModule || 'report_template');

  React.useEffect(() => {
    if (initialModule) {
      setActiveModule(initialModule);
    }
  }, [initialModule]);

  // Module items list definition (Renamed reject_reason to data_dict: 数据字典维护)
  const moduleList = [
    { id: 'report_template', label: '模版配置' },
    { id: 'audit_score', label: '审核打分规则' },
    { id: 'data_dict', label: '数据字典维护' },
    { id: 'evaluation_rule', label: '考核规则' },
    { id: 'stats_metric', label: '统计指标' },
    { id: 'audit_flow', label: '审核层级/流程' },
    { id: 'login_method', label: '登录验证方式' },
    { id: 'value_added', label: '增值业务申请' }
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
        fields: [
          { id: 'f1', name: '报送主题/事件标题', type: 'text', required: true, placeholder: '请输入具体报送的主题或事件摘要' },
          { id: 'f2', name: '事件发生时间', type: 'date', required: true, placeholder: '请选择事件发生或发现的时间' },
          { id: 'f3', name: '涉事传播数据量', type: 'number', required: false, placeholder: '输入阅读/点赞/转发估算量' },
          { id: 'f4', name: '来源网址/文章链接', type: 'link', required: false, placeholder: 'https://...' },
          { id: 'f5', name: '现场图片/证据附件', type: 'file', required: true, placeholder: '支持上传JPG, PNG, PDF' }
        ]
      },
      {
        id: '2',
        name: '图文急报激活规则模板',
        templateType: '激活',
        isDefault: true,
        status: '启用',
        updateTime: '2023-10-25 11:20:00',
        description: '触发高等级舆情时自动激活全员推屏通知及大屏研判流程',
        fields: [
          { id: 'f201', name: '激活规则名称/主题', type: 'text', required: true, placeholder: '例如: 一级舆情突发响应' },
          { id: 'f202', name: '激活触发时间点', type: 'date', required: true, placeholder: '自动或手动触发时间' },
          { id: 'f203', name: '关联预警编号', type: 'number', required: false, placeholder: '输入对应预警工单ID' },
          { id: 'f204', name: '紧急处理链接/通道', type: 'link', required: true, placeholder: 'https://...' }
        ]
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
        name: '视频多媒体激活机制',
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
          { id: 'sl_1', levelName: '一等（特优）', score: 30, description: '省级以上领导批示或极高价值采纳' },
          { id: 'sl_2', levelName: '二等（优秀）', score: 25, description: '市级领导批示或形成深度专报' },
          { id: 'sl_3', levelName: '三等（良好）', score: 20, description: '研判要素齐全且上报迅速及时' },
          { id: 'sl_4', levelName: '四等（合格）', score: 15, description: '基础提报符合规范与事实' },
          { id: 'sl_5', levelName: '五等（基本）', score: 10, description: '提供线索参考价值' }
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
          { id: 'sl_201', levelName: '一级（优秀）', score: 5, description: '快速高效且要素极其精准' },
          { id: 'sl_202', levelName: '二级（良好）', score: 3, description: '基本要素完整无缺失' },
          { id: 'sl_203', levelName: '三级（合格）', score: 2, description: '仅提供初始简报线索' }
        ]
      },
      {
        id: '203',
        name: '四级专项引导打分组',
        isDefault: false,
        status: '停用',
        updateTime: '2023-11-05 16:10:00',
        description: '专项舆情引导行动评分规则，设4个等级共50分',
        totalScore: 50,
        levelCount: 4,
        relatedTemplateId: '1',
        relatedTemplateName: '标准图文报送模板',
        scoreLevels: [
          { id: 'sl_301', levelName: 'A级（特级）', score: 20, description: '关键引导节点起到决定性效果' },
          { id: 'sl_302', levelName: 'B级（高级）', score: 15, description: '有效正向引导并扭转态势' },
          { id: 'sl_303', levelName: 'C级（中级）', score: 10, description: '按指令要求完成跟进' },
          { id: 'sl_304', levelName: 'D级（初级）', score: 5, description: '参与协同排查' }
        ]
      }
    ],
    data_dict: [
      { id: '301', name: '信息真实性核查不通过', dictCategory: 'reject_reason', dictCategoryName: '拒绝理由', dictCode: 'REJECT_001', sortOrder: 1, isDefault: true, status: '启用', updateTime: '2023-10-15 09:00:00', description: '缺乏实质性事实依据或为虚假流言' },
      { id: '302', name: '内容重复提交', dictCategory: 'reject_reason', dictCategoryName: '拒绝理由', dictCode: 'REJECT_002', sortOrder: 2, isDefault: true, status: '启用', updateTime: '2023-10-15 09:00:00', description: '同一事件或舆情线索已由其他部门先行报送' },
      { id: '303', name: '格式要素不健全', dictCategory: 'reject_reason', dictCategoryName: '拒绝理由', dictCode: 'REJECT_003', sortOrder: 3, isDefault: false, status: '启用', updateTime: '2023-10-22 13:45:00', description: '缺少时间、地点或核心事实等关键佐证材料' },
      { id: '304', name: '跨管辖范围报送', dictCategory: 'reject_reason', dictCategoryName: '拒绝理由', dictCode: 'REJECT_004', sortOrder: 4, isDefault: false, status: '启用', updateTime: '2023-11-02 11:10:00', description: '不属于本辖区或本部门职责处理范畴，需退回重拟' },
      { id: '305', name: '凭证图片模糊不符', dictCategory: 'reject_reason', dictCategoryName: '拒绝理由', dictCode: 'REJECT_005', sortOrder: 5, isDefault: false, status: '启用', updateTime: '2023-11-05 14:00:00', description: '上传的现场截图或说明文件无法有效佐证主张' },

      { id: 'd201', name: '突发敏感事件', dictCategory: 'info_category', dictCategoryName: '信息分类', dictCode: 'INFO_001', sortOrder: 1, isDefault: true, status: '启用', updateTime: '2023-10-01 08:00:00', description: '重大安全隐患、突发公共安全事件等线索' },
      { id: 'd202', name: '网络舆情动态', dictCategory: 'info_category', dictCategoryName: '信息分类', dictCode: 'INFO_002', sortOrder: 2, isDefault: true, status: '启用', updateTime: '2023-10-01 08:00:00', description: '社交平台、论坛微博等热点舆情关注' },
      { id: 'd203', name: '民生诉求建议', dictCategory: 'info_category', dictCategoryName: '信息分类', dictCode: 'INFO_003', sortOrder: 3, isDefault: false, status: '启用', updateTime: '2023-10-10 10:00:00', description: '市民关注的民生痛点与政策落地建议' },

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
        name: '分类考核维度计分细则',
        isDefault: true,
        status: '启用',
        updateTime: '2023-10-10 16:00:00',
        description: '参考【考核管理-分类考核】，针对突发事件、舆情动态、政策解读与民生诉求的分类上报量、通过率及采纳精度计分规则',
        evalDimension: 'category',
        indicators: [
          { id: 'ei_101', name: '分类上报达标基础分', calcType: '基础分', basePoints: 20, weightPercent: 20, unitRule: '月度分类提交量达到基础配额即得满分' },
          { id: 'ei_102', name: '分类审核通过率/采纳率', calcType: '通过率/采纳率', basePoints: 30, weightPercent: 30, unitRule: '折算公式：实际通过率 * 30分' },
          { id: 'ei_103', name: '突发事件速报率', calcType: '时效响应', basePoints: 25, weightPercent: 25, unitRule: '15分钟内完成首报，每件 +5分' },
          { id: 'ei_104', name: '舆情处置转办回应率', calcType: '参与率', basePoints: 25, weightPercent: 25, unitRule: '转办工单按时闭环回应率 100% 得满分' },
          { id: 'ei_105', name: '分类信息虚假驳回扣分', calcType: '扣分项', basePoints: 0, weightPercent: 0, unitRule: '查实虚假或违规上报，单件 -5分' }
        ]
      },
      {
        id: '402',
        name: '机构考核维度综合评估规则',
        isDefault: true,
        status: '启用',
        updateTime: '2023-10-18 10:30:00',
        description: '参考【考核管理-机构考核】，评估下属各机构（宣传部、网安、应急办等）协同配合力、全员参与率与重大贡献分',
        evalDimension: 'org',
        indicators: [
          { id: 'ei_201', name: '机构履职基础分', calcType: '基础分', basePoints: 30, weightPercent: 25, unitRule: '月度机构基础上报总量达标得分' },
          { id: 'ei_202', name: '机构在册人员参与率', calcType: '参与率', basePoints: 25, weightPercent: 25, unitRule: '机构坐席全员月参与率 > 85% 得满分' },
          { id: 'ei_203', name: '综合上报通过率', calcType: '通过率/采纳率', basePoints: 25, weightPercent: 25, unitRule: '通过件数 / 总上报件数 * 25分' },
          { id: 'ei_204', name: '省市领导批示与专报采用加分', calcType: '加分项', basePoints: 20, weightPercent: 25, unitRule: '一等/特优采纳专报 +10分/件 (上限30分)' },
          { id: 'ei_205', name: '重大舆情迟报漏报扣分', calcType: '扣分项', basePoints: 0, weightPercent: 0, unitRule: '严重迟报或漏报单次扣 -10分' }
        ]
      },
      {
        id: '403',
        name: '人员考核维度绩效加减分规则',
        isDefault: true,
        status: '启用',
        updateTime: '2023-11-01 15:20:00',
        description: '参考【考核管理-人员考核】，针对信息员与审核员个人上报质量、响应时效与月度勤勉度的量化考核指标',
        evalDimension: 'person',
        indicators: [
          { id: 'ei_301', name: '个人履职基础分', calcType: '基础分', basePoints: 20, weightPercent: 20, unitRule: '个人月度有效提报不低于10件' },
          { id: 'ei_302', name: '个人上报质量得分', calcType: '基础分', basePoints: 40, weightPercent: 40, unitRule: '依据每次审核打分等级累加，一等+30，二等+25' },
          { id: 'ei_303', name: '个人应急响应时效', calcType: '时效响应', basePoints: 20, weightPercent: 20, unitRule: '15分钟极速处置上报 +3分/件' },
          { id: 'ei_304', name: '月度勤勉标兵奖励加分', calcType: '加分项', basePoints: 20, weightPercent: 20, unitRule: '月度通过件数排名前 10 额外 +10分' },
          { id: 'ei_305', name: '抄袭/虚假凭证严惩扣分', calcType: '扣分项', basePoints: 0, weightPercent: 0, unitRule: '查实抄袭或提供虚假凭证，单次 -10分' }
        ]
      },
      {
        id: '404',
        name: '三位一体综合统筹考评规则',
        isDefault: false,
        status: '停用',
        updateTime: '2023-11-05 09:10:00',
        description: '融合分类考核(30%)、机构考核(40%)与人员考核(30%)的季度统筹全维度考评模型',
        evalDimension: 'comprehensive',
        indicators: [
          { id: 'ei_401', name: '分类覆盖率与精度得分', calcType: '基础分', basePoints: 30, weightPercent: 30, unitRule: '分类考核得分 * 30% 权重折算' },
          { id: 'ei_402', name: '机构协同与参与度得分', calcType: '参与率', basePoints: 40, weightPercent: 40, unitRule: '机构考核得分 * 40% 权重折算' },
          { id: 'ei_403', name: '人员质量与积极度得分', calcType: '基础分', basePoints: 30, weightPercent: 30, unitRule: '人员考核得分 * 30% 权重折算' }
        ]
      }
    ],
    stats_metric: [
      {
        id: 'sm_101',
        name: '子机构总数与覆盖率',
        isDefault: true,
        status: '启用',
        updateTime: '2023-10-01 00:00:00',
        description: '对应首页核心指标与统计页机构大屏，统计当前平台在册激活及纳入监管的下属子机构总量与覆盖比例',
        metricScope: 'both',
        calcType: 'count',
        calcFormula: 'COUNT(DISTINCT org_id) 全域激活机构数',
        timeDimension: 'realtime',
        unit: '个',
        precision: 'integer',
        targetBenchmark: '100% 辖区机构全覆盖'
      },
      {
        id: 'sm_102',
        name: '平台人员总数与坐席活跃率',
        isDefault: true,
        status: '启用',
        updateTime: '2023-10-01 00:00:00',
        description: '对应首页与统计管理页面，实时计算平台注册网格员、信息员及各级审核人员总数与当日/当月在线活跃率',
        metricScope: 'both',
        calcType: 'count',
        calcFormula: 'COUNT(user_id) 在册激活人员总数',
        timeDimension: 'realtime',
        unit: '名',
        precision: 'integer',
        targetBenchmark: '月活跃率 ≥ 85%'
      },
      {
        id: 'sm_103',
        name: '舆情速报上报总量与趋势',
        isDefault: true,
        status: '启用',
        updateTime: '2023-10-01 00:00:00',
        description: '核心基础指标，统计全网各渠道（网格员、爬虫、热线等）提报的舆情速报与事件总量，支持环比/同比趋势分析',
        metricScope: 'both',
        calcType: 'count',
        calcFormula: 'SUM(report_count) 按时间维度（日/周/月/季/年）聚合统计',
        timeDimension: 'multi',
        unit: '件',
        precision: 'integer',
        targetBenchmark: '月度提报配额 1000 件'
      },
      {
        id: 'sm_104',
        name: '负面舆情转办件数及办结率',
        isDefault: true,
        status: '启用',
        updateTime: '2023-10-01 00:00:00',
        description: '对应首页与统计管理负面舆情板块，监测高风险负面事件流转交办至各专业部门后的处置与闭环回应效率',
        metricScope: 'both',
        calcType: 'rate',
        calcFormula: '转办数 = SUM(is_negative = true)；办结率 = (已闭环件数 / 转办总件数) * 100%',
        timeDimension: 'multi',
        unit: '件 / %',
        precision: 'decimal_1',
        targetBenchmark: '转办办结率 ≥ 95%'
      },
      {
        id: 'sm_105',
        name: '审核通过率与专报采纳转化率',
        isDefault: true,
        status: '启用',
        updateTime: '2023-10-01 00:00:00',
        description: '对应首页与统计管理质量分析，反映各部门上报信息的精准度与最终被领导批示或专报采纳的转化比例',
        metricScope: 'both',
        calcType: 'rate',
        calcFormula: '通过率 = (终审通过件数 / 总上报件数) * 100%；采纳率 = (被采用专报数 / 终审件数) * 100%',
        timeDimension: 'multi',
        unit: '%',
        precision: 'decimal_1',
        targetBenchmark: '终审通过率 ≥ 90%'
      },
      {
        id: 'sm_106',
        name: '今日新增速报上报量',
        isDefault: true,
        status: '启用',
        updateTime: '2023-10-01 00:00:00',
        description: '首页控制台核心实时卡片，显示当日0点起截至目前的最新上报件数及较昨日同时段的增减变动（日环比）',
        metricScope: 'home',
        calcType: 'trend',
        calcFormula: 'COUNT(id) WHERE created_at >= TODAY_START()',
        timeDimension: 'daily',
        unit: '件',
        precision: 'integer',
        targetBenchmark: '日均平稳峰值 < 50 件'
      },
      {
        id: 'sm_107',
        name: '平均审核响应与流转处置耗时',
        isDefault: true,
        status: '启用',
        updateTime: '2023-10-01 00:00:00',
        description: '对应首页与统计管理时效分析，衡量从信息员提交提报到审核员完成一、二级审签的平均时间间隔',
        metricScope: 'both',
        calcType: 'avg',
        calcFormula: 'AVG(audit_completed_time - report_submitted_time) 换算为分钟数',
        timeDimension: 'multi',
        unit: '分钟',
        precision: 'decimal_1',
        targetBenchmark: '平均审核响应 ≤ 15 分钟'
      },
      {
        id: 'sm_108',
        name: '分类与来源渠道分布构成比例',
        isDefault: false,
        status: '启用',
        updateTime: '2023-10-15 10:00:00',
        description: '统计管理大屏专属多维饼图与柱状图指标，深入剖析舆情来源结构与主要聚焦的业务分类占比',
        metricScope: 'stats',
        calcType: 'distribution',
        calcFormula: 'GROUP BY category_id, channel_id 计算相对占比及绝对件数',
        timeDimension: 'multi',
        unit: '%',
        precision: 'decimal_1',
        targetBenchmark: '结构分布均衡度分析'
      }
    ],
    audit_flow: [
      {
        id: '601',
        name: '标准二级复核流程',
        isDefault: true,
        status: '启用',
        updateTime: '2023-10-05 10:00:00',
        description: '常规报送由网格员基础初审后提交科室负责人研判复核',
        relatedTemplateId: '1',
        relatedTemplateName: '标准图文报送模板',
        flowDepth: 2,
        orgApplyMode: 'all_orgs',
        auditNodes: [
          { id: 'an1', nodeName: '一级基础初审', approverRole: '值班员 / 网格员', timeLimitMinutes: 15 },
          { id: 'an2', nodeName: '二级研判复核', approverRole: '科室负责人 / 舆情专员', timeLimitMinutes: 30 }
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
        name: '突发事件三级特快签发流程',
        isDefault: false,
        status: '启用',
        updateTime: '2023-11-04 17:30:00',
        description: '适用于紧急事件提报的三级联动，允许针对指定单机构设置使能或失效规则',
        relatedTemplateId: '3',
        relatedTemplateName: '突发事件快速上报',
        flowDepth: 3,
        orgApplyMode: 'specific_orgs',
        auditNodes: [
          { id: 'an201', nodeName: '初审快速响应', approverRole: '应急值班员', timeLimitMinutes: 10 },
          { id: 'an202', nodeName: '专报会商审核', approverRole: '研判专家组', timeLimitMinutes: 20 },
          { id: 'an203', nodeName: '指挥中心签发', approverRole: '指挥部主管领导', timeLimitMinutes: 30 }
        ],
        orgSettings: [
          { orgId: 'org1', orgName: '市委宣传部', enabled: true },
          { orgId: 'org2', orgName: '市公安局网安支队', enabled: true },
          { orgId: 'org3', orgName: '市应急管理局', enabled: true },
          { orgId: 'org4', orgName: '区县级网信中心', enabled: false },
          { orgId: 'org5', orgName: '市场监督管理局', enabled: true }
        ]
      },
      {
        id: '603',
        name: '一级极速直审归档通道',
        isDefault: false,
        status: '停用',
        updateTime: '2023-11-08 09:15:00',
        description: '轻量级常规快速审批，经单一步骤极速校验后直接结案',
        relatedTemplateId: '1',
        relatedTemplateName: '标准图文报送模板',
        flowDepth: 1,
        orgApplyMode: 'all_orgs',
        auditNodes: [
          { id: 'an301', nodeName: '直审归档岗', approverRole: '系统AI / 部门值班长', timeLimitMinutes: 5 }
        ],
        orgSettings: [
          { orgId: 'org1', orgName: '市委宣传部', enabled: true },
          { orgId: 'org2', orgName: '市公安局网安支队', enabled: true }
        ]
      }
    ],
    login_method: [
      { id: '701', name: '账号密码登录', isDefault: true, status: '启用', updateTime: '2023-10-01 00:00:00', description: '基于加密数据库的基础密码鉴权' },
      { id: '702', name: '手机短信验证码', isDefault: false, status: '启用', updateTime: '2023-10-15 12:00:00', description: '支持手机动态一次性口令登录' },
      { id: '703', name: '政务微信扫码授权', isDefault: false, status: '启用', updateTime: '2023-10-20 15:40:00', description: '绑定政务微信直接扫码身份认证' },
      { id: '704', name: '双因素安全认证 (MFA)', isDefault: false, status: '停用', updateTime: '2023-11-09 11:00:00', description: '管理员账号强制启用多因素认证' }
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
      }
    ]
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ConfigModuleItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formTemplateType, setFormTemplateType] = useState<'报送' | '激活'>('报送');
  const [formDesc, setFormDesc] = useState('');
  const [formFields, setFormFields] = useState<TemplateField[]>([]);
  const [modalActiveTab, setModalActiveTab] = useState<'build' | 'preview'>('build');

  // Audit Score Rule Modal States
  const [formTotalScore, setFormTotalScore] = useState<number>(100);
  const [formLevelCount, setFormLevelCount] = useState<number>(5);
  const [formScoreLevels, setFormScoreLevels] = useState<ScoreLevel[]>([]);
  const [formScoreStatus, setFormScoreStatus] = useState<'启用' | '停用'>('停用');
  const [formRelatedTemplateId, setFormRelatedTemplateId] = useState<string>('');

  // Audit Flow / Hierarchy Modal States
  const [formFlowDepth, setFormFlowDepth] = useState<number>(2);
  const [formAuditNodes, setFormAuditNodes] = useState<AuditNode[]>([]);
  const [formOrgApplyMode, setFormOrgApplyMode] = useState<'all_orgs' | 'specific_orgs'>('all_orgs');
  const [formOrgSettings, setFormOrgSettings] = useState<OrgScopeSetting[]>([]);
  const [newCustomOrgName, setNewCustomOrgName] = useState<string>('');

  // Evaluation Rule Modal States
  const [formEvalDimension, setFormEvalDimension] = useState<'category' | 'org' | 'person' | 'comprehensive'>('category');
  const [formIndicators, setFormIndicators] = useState<EvaluationIndicator[]>([]);

  // Data Dictionary Maintenance Sub-Category & Form States
  const [dictSubCategoryFilter, setDictSubCategoryFilter] = useState<string>('all');
  const [formDictCategory, setFormDictCategory] = useState<string>('reject_reason');
  const [formDictCategoryName, setFormDictCategoryName] = useState<string>('拒绝理由');
  const [formDictCode, setFormDictCode] = useState<string>('');
  const [formSortOrder, setFormSortOrder] = useState<number>(1);

  // Statistics Metric Modal States
  const [formMetricScope, setFormMetricScope] = useState<'home' | 'stats' | 'both'>('both');
  const [formMetricCalcType, setFormMetricCalcType] = useState<'count' | 'rate' | 'avg' | 'trend' | 'distribution'>('count');
  const [formMetricFormula, setFormMetricFormula] = useState<string>('');
  const [formMetricTimeDim, setFormMetricTimeDim] = useState<'realtime' | 'daily' | 'weekly' | 'monthly' | 'multi'>('multi');
  const [formMetricUnit, setFormMetricUnit] = useState<string>('件');
  const [formMetricPrecision, setFormMetricPrecision] = useState<'integer' | 'decimal_1' | 'decimal_2'>('integer');
  const [formMetricBenchmark, setFormMetricBenchmark] = useState<string>('');

  const handleLoadPresetIndicators = (dim: 'category' | 'org' | 'person' | 'comprehensive') => {
    if (dim === 'category') {
      setFormIndicators([
        { id: 'ei_101', name: '分类上报达标基础分', calcType: '基础分', basePoints: 20, weightPercent: 20, unitRule: '月度分类提交量达到基础配额即得满分' },
        { id: 'ei_102', name: '分类审核通过率/采纳率', calcType: '通过率/采纳率', basePoints: 30, weightPercent: 30, unitRule: '折算公式：实际通过率 * 30分' },
        { id: 'ei_103', name: '突发事件速报率', calcType: '时效响应', basePoints: 25, weightPercent: 25, unitRule: '15分钟内完成首报，每件 +5分' },
        { id: 'ei_104', name: '舆情处置转办回应率', calcType: '参与率', basePoints: 25, weightPercent: 25, unitRule: '转办工单按时闭环回应率 100% 得满分' },
        { id: 'ei_105', name: '分类信息虚假驳回扣分', calcType: '扣分项', basePoints: 0, weightPercent: 0, unitRule: '查实虚假或违规上报，单件 -5分' }
      ]);
    } else if (dim === 'org') {
      setFormIndicators([
        { id: 'ei_201', name: '机构履职基础分', calcType: '基础分', basePoints: 30, weightPercent: 25, unitRule: '月度机构基础上报总量达标得分' },
        { id: 'ei_202', name: '机构在册人员参与率', calcType: '参与率', basePoints: 25, weightPercent: 25, unitRule: '机构坐席全员月参与率 > 85% 得满分' },
        { id: 'ei_203', name: '综合上报通过率', calcType: '通过率/采纳率', basePoints: 25, weightPercent: 25, unitRule: '通过件数 / 总上报件数 * 25分' },
        { id: 'ei_204', name: '省市领导批示与专报采用加分', calcType: '加分项', basePoints: 20, weightPercent: 25, unitRule: '一等/特优采纳专报 +10分/件 (上限30分)' },
        { id: 'ei_205', name: '重大舆情迟报漏报扣分', calcType: '扣分项', basePoints: 0, weightPercent: 0, unitRule: '严重迟报或漏报单次扣 -10分' }
      ]);
    } else if (dim === 'person') {
      setFormIndicators([
        { id: 'ei_301', name: '个人履职基础分', calcType: '基础分', basePoints: 20, weightPercent: 20, unitRule: '个人月度有效提报不低于10件' },
        { id: 'ei_302', name: '个人上报质量得分', calcType: '基础分', basePoints: 40, weightPercent: 40, unitRule: '依据每次审核打分等级累加，一等+30，二等+25' },
        { id: 'ei_303', name: '个人应急响应时效', calcType: '时效响应', basePoints: 20, weightPercent: 20, unitRule: '15分钟极速处置上报 +3分/件' },
        { id: 'ei_304', name: '月度勤勉标兵奖励加分', calcType: '加分项', basePoints: 20, weightPercent: 20, unitRule: '月度通过件数排名前 10 额外 +10分' },
        { id: 'ei_305', name: '抄袭/虚假凭证严惩扣分', calcType: '扣分项', basePoints: 0, weightPercent: 0, unitRule: '查实抄袭或提供虚假凭证，单次 -10分' }
      ]);
    } else {
      setFormIndicators([
        { id: 'ei_401', name: '分类覆盖率与精度得分', calcType: '基础分', basePoints: 30, weightPercent: 30, unitRule: '分类考核得分 * 30% 权重折算' },
        { id: 'ei_402', name: '机构协同与参与度得分', calcType: '参与率', basePoints: 40, weightPercent: 40, unitRule: '机构考核得分 * 40% 权重折算' },
        { id: 'ei_403', name: '人员质量与积极度得分', calcType: '基础分', basePoints: 30, weightPercent: 30, unitRule: '人员考核得分 * 30% 权重折算' }
      ]);
    }
  };

  const handleAddIndicator = () => {
    const newInd: EvaluationIndicator = {
      id: 'ei_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: `自定义考核指标${formIndicators.length + 1}`,
      calcType: '基础分',
      basePoints: 10,
      weightPercent: 10,
      unitRule: '请填写具体考核计分规则与衡量依据...'
    };
    setFormIndicators(prev => [...prev, newInd]);
  };

  const handleUpdateIndicator = (index: number, updates: Partial<EvaluationIndicator>) => {
    setFormIndicators(prev => prev.map((ind, i) => (i === index ? { ...ind, ...updates } : ind)));
  };

  const handleDeleteIndicator = (index: number) => {
    if (formIndicators.length <= 1) {
      alert('至少需要保留 1 项考核指标');
      return;
    }
    setFormIndicators(prev => prev.filter((_, i) => i !== index));
  };

  const defaultOrgList: OrgScopeSetting[] = [
    { orgId: 'org1', orgName: '市委宣传部', enabled: true },
    { orgId: 'org2', orgName: '市公安局网安支队', enabled: true },
    { orgId: 'org3', orgName: '市应急管理局', enabled: true },
    { orgId: 'org4', orgName: '区县级网信中心', enabled: true },
    { orgId: 'org5', orgName: '市场监督管理局', enabled: true },
    { orgId: 'org6', orgName: '卫健委应急办', enabled: true }
  ];

  // Audit Flow Handlers
  const handleFlowDepthChange = (depth: number) => {
    const newDepth = Math.max(1, Math.min(10, depth));
    setFormFlowDepth(newDepth);
    setFormAuditNodes(prev => {
      if (newDepth === prev.length) return prev;
      if (newDepth > prev.length) {
        const added: AuditNode[] = [];
        for (let i = prev.length; i < newDepth; i++) {
          added.push({
            id: 'an_' + Date.now() + '_' + i,
            nodeName: i === 0 ? '一级初审' : i === 1 ? '二级复核' : `${i + 1}级签发`,
            approverRole: i === 0 ? '网格员 / 初审员' : i === 1 ? '科室负责人' : '主管领导',
            timeLimitMinutes: 15 * (i + 1)
          });
        }
        return [...prev, ...added];
      } else {
        return prev.slice(0, newDepth);
      }
    });
  };

  const handleUpdateAuditNode = (index: number, updates: Partial<AuditNode>) => {
    setFormAuditNodes(prev => prev.map((node, i) => (i === index ? { ...node, ...updates } : node)));
  };

  const handleAddAuditNode = () => {
    const nextLevel = formAuditNodes.length + 1;
    setFormAuditNodes(prev => [
      ...prev,
      {
        id: 'an_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        nodeName: `${nextLevel}级审批`,
        approverRole: '审批责任人',
        timeLimitMinutes: 30
      }
    ]);
    setFormFlowDepth(prev => prev + 1);
  };

  const handleDeleteAuditNode = (index: number) => {
    if (formAuditNodes.length <= 1) {
      alert('至少需要保留 1 个审批节点');
      return;
    }
    setFormAuditNodes(prev => prev.filter((_, i) => i !== index));
    setFormFlowDepth(prev => prev - 1);
  };

  const handleToggleOrgSetting = (orgId: string) => {
    setFormOrgSettings(prev =>
      prev.map(org => (org.orgId === orgId ? { ...org, enabled: !org.enabled } : org))
    );
  };

  const handleBatchToggleOrgSettings = (enabled: boolean) => {
    setFormOrgSettings(prev => prev.map(org => ({ ...org, enabled })));
  };

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

  // Dynamically query enabled report templates from 'report_template' module
  const enabledReportTemplates = (dataStore.report_template || []).filter(
    t => t.status === '启用' && (t.templateType === '报送' || !t.templateType)
  );

  // Preview Modal State
  const [previewItem, setPreviewItem] = useState<ConfigModuleItem | null>(null);

  // Score level helper handlers
  const handleLevelCountChange = (count: number) => {
    const newCount = Math.max(1, Math.min(10, count));
    setFormLevelCount(newCount);
    setFormScoreLevels(prev => {
      if (newCount === prev.length) return prev;
      if (newCount > prev.length) {
        const added: ScoreLevel[] = [];
        for (let i = prev.length; i < newCount; i++) {
          added.push({
            id: 'sl_' + Date.now() + '_' + i,
            levelName: `${i + 1}等`,
            score: 0,
            description: ''
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
        score: 0,
        description: ''
      }
    ]);
    setFormLevelCount(prev => prev + 1);
  };

  const handleDeleteScoreLevel = (index: number) => {
    if (formScoreLevels.length <= 1) {
      alert('至少需要保留 1 个得分等级');
      return;
    }
    setFormScoreLevels(prev => prev.filter((_, i) => i !== index));
    setFormLevelCount(prev => prev - 1);
  };

  // Field element handlers
  const handleAddField = (type: FieldType) => {
    const meta = getFieldTypeMeta(type);
    const newField: TemplateField = {
      id: 'f_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: `${meta.label}${formFields.length + 1}`,
      type: type,
      required: true,
      placeholder: `请输入${meta.label}相关信息`
    };
    setFormFields(prev => [...prev, newField]);
  };

  const handleUpdateField = (index: number, updates: Partial<TemplateField>) => {
    setFormFields(prev => prev.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  };

  const handleDeleteField = (index: number) => {
    setFormFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveField = (index: number, dir: 'up' | 'down') => {
    if ((dir === 'up' && index === 0) || (dir === 'down' && index === formFields.length - 1)) return;
    const target = dir === 'up' ? index - 1 : index + 1;
    const list = [...formFields];
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setFormFields(list);
  };

  const handleLoadStandardPreset = () => {
    setFormFields([
      { id: 'p_1', name: '报送主题/事件标题', type: 'text', required: true, placeholder: '请输入具体报送的主题或事件全称' },
      { id: 'p_2', name: '事件发生/发现时间', type: 'date', required: true, placeholder: '请选择事件发生或传播时间' },
      { id: 'p_3', name: '涉事热度/影响数据', type: 'number', required: false, placeholder: '请输入传播量/阅读量等数据' },
      { id: 'p_4', name: '来源网址/文章出处', type: 'link', required: false, placeholder: 'https://...' },
      { id: 'p_5', name: '现场图片/证据附件', type: 'file', required: true, placeholder: '支持图片、视频、PDF证明文档' }
    ]);
  };

  // Get active module title
  const currentModuleLabel = moduleList.find(m => m.id === activeModule)?.label || '配置项';

  // Current list for active module
  const currentList = dataStore[activeModule] || (activeModule === 'data_dict' ? (dataStore.data_dict || []) : []);

  // Filtered list
  const filteredList = currentList.filter(item => {
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

  // Handle Open Modal for Add / Edit
  const openAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormTemplateType('报送');
    setFormDesc('');
    setModalActiveTab('build');

    if (activeModule === 'report_template') {
      handleLoadStandardPreset();
    } else if (activeModule === 'data_dict' || activeModule === 'reject_reason') {
      const targetCat = dictSubCategoryFilter !== 'all' ? dictSubCategoryFilter : 'reject_reason';
      setFormName('');
      setFormDictCategory(targetCat);
      setFormDictCategoryName(
        targetCat === 'reject_reason'
          ? '拒绝理由'
          : targetCat === 'info_category'
          ? '信息分类'
          : targetCat === 'source_channel'
          ? '来源渠道'
          : targetCat === 'urgency_level'
          ? '紧急程度'
          : '数据字典'
      );
      const categoryPrefixMap: Record<string, string> = {
        reject_reason: 'REJECT_',
        info_category: 'INFO_',
        source_channel: 'CHANNEL_',
        urgency_level: 'URGENT_'
      };
      const prefix = categoryPrefixMap[targetCat] || 'DICT_';
      const count = (dataStore.data_dict || []).filter(i => (i.dictCategory || 'reject_reason') === targetCat).length + 1;
      setFormDictCode(`${prefix}00${count}`);
      setFormSortOrder(count);
      setFormDesc('用于系统数据字典枚举维保，联动全流程业务标准');
    } else if (activeModule === 'audit_score') {
      setFormName('自定义百分制打分规则组');
      setFormDesc('按级别指派相应得分，设为启用后替代现有打分标准');
      setFormTotalScore(100);
      setFormLevelCount(5);
      setFormScoreStatus('停用');
      const defaultTpl = enabledReportTemplates[0];
      setFormRelatedTemplateId(defaultTpl ? defaultTpl.id : '1');
      setFormScoreLevels([
        { id: 'sl_1', levelName: '一等（特优）', score: 30, description: '特优级标准' },
        { id: 'sl_2', levelName: '二等（优秀）', score: 25, description: '优秀级标准' },
        { id: 'sl_3', levelName: '三等（良好）', score: 20, description: '良好级标准' },
        { id: 'sl_4', levelName: '四等（合格）', score: 15, description: '合格级标准' },
        { id: 'sl_5', levelName: '五等（基本）', score: 10, description: '基本级标准' }
      ]);
    } else if (activeModule === 'audit_flow') {
      setFormName('自定义多级审核流程');
      setFormDesc('关联上报模版，设置各层级审批节点与机构效能状态规则');
      setFormScoreStatus('启用');
      const defaultTpl = enabledReportTemplates[0];
      setFormRelatedTemplateId(defaultTpl ? defaultTpl.id : '1');
      setFormFlowDepth(2);
      setFormOrgApplyMode('all_orgs');
      setFormOrgSettings(defaultOrgList);
      setFormAuditNodes([
        { id: 'an_1', nodeName: '一级基础初审', approverRole: '网格员 / 初审员', timeLimitMinutes: 15 },
        { id: 'an_2', nodeName: '二级研判复核', approverRole: '科室负责人 / 舆情专员', timeLimitMinutes: 30 }
      ]);
    } else if (activeModule === 'evaluation_rule') {
      setFormName('分类考核维度计分细则');
      setFormDesc('参考【考核管理-分类考核】，针对不同分类信息上报量、通过率及采纳精度设定量化指标');
      setFormEvalDimension('category');
      handleLoadPresetIndicators('category');
    } else if (activeModule === 'stats_metric') {
      setFormName('自定义统计指标规则');
      setFormDesc('定义基于首页或统计管理页面的数据指标计算规则与统计口径');
      setFormMetricScope('both');
      setFormMetricCalcType('count');
      setFormMetricFormula('SUM(report_count) 按指定时间维度聚合统计件数');
      setFormMetricTimeDim('multi');
      setFormMetricUnit('件');
      setFormMetricPrecision('integer');
      setFormMetricBenchmark('配额达标线 ≥ 1000 件');
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
    if (item.isDefault) {
      alert('系统默认模板不支持删除和修改！仅提供查看功能。如需个性化格式，请新建“自定义”模板。');
      setPreviewItem(item);
      return;
    }
    setEditingItem(item);
    setFormName(item.name);
    setFormTemplateType(item.templateType || '报送');
    setFormDesc(item.description || '');
    setModalActiveTab('build');

    if (activeModule === 'data_dict' || activeModule === 'reject_reason') {
      setFormDictCategory(item.dictCategory || 'reject_reason');
      setFormDictCategoryName(item.dictCategoryName || '拒绝理由');
      setFormDictCode(item.dictCode || `DICT_${item.id}`);
      setFormSortOrder(item.sortOrder || 1);
    } else if (activeModule === 'value_added') {
      setFormDictCode(item.dictCode || `VA_${item.id}`);
    } else if (activeModule === 'report_template') {
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
      setFormFlowDepth(item.flowDepth || (item.auditNodes ? item.auditNodes.length : 2));
      setFormOrgApplyMode(item.orgApplyMode || 'all_orgs');
      setFormOrgSettings(item.orgSettings && item.orgSettings.length > 0 ? item.orgSettings : defaultOrgList);
      setFormAuditNodes(item.auditNodes && item.auditNodes.length > 0 ? item.auditNodes : [
        { id: 'an_1', nodeName: '一级基础初审', approverRole: '初审员', timeLimitMinutes: 15 },
        { id: 'an_2', nodeName: '二级复核签发', approverRole: '主管领导', timeLimitMinutes: 30 }
      ]);
    } else if (activeModule === 'evaluation_rule') {
      const dim = item.evalDimension || 'category';
      setFormEvalDimension(dim);
      setFormIndicators(item.indicators && item.indicators.length > 0 ? item.indicators : [
        { id: 'ei_1', name: '分类上报达标基础分', calcType: '基础分', basePoints: 20, weightPercent: 20, unitRule: '月度分类提交量达到基础配额即得满分' },
        { id: 'ei_2', name: '分类审核通过率/采纳率', calcType: '通过率/采纳率', basePoints: 30, weightPercent: 30, unitRule: '折算公式：实际通过率 * 30分' },
        { id: 'ei_3', name: '突发事件速报率', calcType: '时效响应', basePoints: 25, weightPercent: 25, unitRule: '15分钟内完成首报，每件 +5分' }
      ]);
    } else if (activeModule === 'stats_metric') {
      setFormMetricScope(item.metricScope || 'both');
      setFormMetricCalcType(item.calcType || 'count');
      setFormMetricFormula(item.calcFormula || '');
      setFormMetricTimeDim(item.timeDimension || 'multi');
      setFormMetricUnit(item.unit || '件');
      setFormMetricPrecision(item.precision || 'integer');
      setFormMetricBenchmark(item.targetBenchmark || '');
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
      const categoryNameMap: Record<string, string> = {
        reject_reason: '拒绝理由',
        info_category: '信息分类',
        source_channel: '来源渠道',
        urgency_level: '紧急程度'
      };
      const catName = categoryNameMap[formDictCategory] || formDictCategoryName || '拒绝理由';

      const dictItem: ConfigModuleItem = {
        id: editingItem ? editingItem.id : String(Date.now()),
        name: formName.trim(),
        dictCategory: formDictCategory,
        dictCategoryName: catName,
        dictCode: formDictCode.trim() || `DICT_${Date.now()}`,
        sortOrder: formSortOrder,
        isDefault: editingItem ? editingItem.isDefault : false,
        status: editingItem ? editingItem.status : '启用',
        updateTime: nowStr,
        description: formDesc.trim() || '自定义数据字典条目配置'
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
      const evalItem: ConfigModuleItem = {
        id: editingItem ? editingItem.id : String(Date.now()),
        name: formName.trim(),
        isDefault: editingItem ? editingItem.isDefault : false,
        status: editingItem ? editingItem.status : '启用',
        updateTime: nowStr,
        description: formDesc.trim() || '自定义考核规则配置',
        evalDimension: formEvalDimension,
        indicators: formIndicators
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
        id: editingItem ? editingItem.id : String(Date.now()),
        name: formName.trim(),
        isDefault: editingItem ? editingItem.isDefault : false,
        status: editingItem ? editingItem.status : '启用',
        updateTime: nowStr,
        description: formDesc.trim() || '自定义统计指标配置',
        metricScope: formMetricScope,
        calcType: formMetricCalcType,
        calcFormula: formMetricFormula.trim(),
        timeDimension: formMetricTimeDim,
        unit: formMetricUnit.trim() || '件',
        precision: formMetricPrecision,
        targetBenchmark: formMetricBenchmark.trim()
      };

      if (editingItem) {
        setDataStore(prev => ({
          ...prev,
          stats_metric: (prev.stats_metric || []).map(i => (i.id === editingItem.id ? metricItem : i))
        }));
      } else {
        setDataStore(prev => ({
          ...prev,
          stats_metric: [...(prev.stats_metric || []), metricItem]
        }));
      }
      setIsModalOpen(false);
      return;
    }

    if (activeModule === 'audit_score') {
      const isEnabled = formScoreStatus === '启用';
      const selTpl = (dataStore.report_template || []).find(t => t.id === formRelatedTemplateId);
      const relTplId = formRelatedTemplateId || (selTpl ? selTpl.id : '');
      const relTplName = selTpl ? selTpl.name : (formRelatedTemplateId ? '关联上报模版' : '标准图文报送模板');

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
                levelCount: formScoreLevels.length,
                scoreLevels: formScoreLevels,
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
          levelCount: formScoreLevels.length,
          scoreLevels: formScoreLevels,
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
      const relTplId = formRelatedTemplateId || (selTpl ? selTpl.id : '');
      const relTplName = selTpl ? selTpl.name : (formRelatedTemplateId ? '关联上报模版' : '标准图文报送模板');

      const flowItem: ConfigModuleItem = {
        id: editingItem ? editingItem.id : String(Date.now()),
        name: formName.trim(),
        isDefault: editingItem ? editingItem.isDefault : false,
        status: formScoreStatus,
        updateTime: nowStr,
        description: formDesc.trim() || '自定义多级审核流程规则',
        relatedTemplateId: relTplId,
        relatedTemplateName: relTplName,
        flowDepth: formAuditNodes.length,
        auditNodes: formAuditNodes,
        orgApplyMode: formOrgApplyMode,
        orgSettings: formOrgSettings
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

    if (activeModule === 'evaluation_rule') {
      const evalItem: ConfigModuleItem = {
        id: editingItem ? editingItem.id : String(Date.now()),
        name: formName.trim() || '自定义考核规则细则',
        isDefault: editingItem ? editingItem.isDefault : false,
        status: editingItem ? editingItem.status : '启用',
        updateTime: nowStr,
        description: formDesc.trim() || '依据考核管理三大维度制定的量化评估与考评标准',
        evalDimension: formEvalDimension,
        indicators: formIndicators
      };

      if (editingItem) {
        setDataStore(prev => ({
          ...prev,
          evaluation_rule: (prev.evaluation_rule || []).map(i => (i.id === editingItem.id ? evalItem : i))
        }));
      } else {
        setDataStore(prev => ({
          ...prev,
          evaluation_rule: [...(prev.evaluation_rule || []), evalItem]
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
        status: '启用',
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

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">业务配置维护</h2>
        <p className="text-xs text-gray-400 mt-0.5">管理系统内的各类数据字典</p>
      </div>

      {/* Main Container - Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Card: 配置模块 */}
        <div className="w-full lg:w-56 bg-white rounded-lg border border-gray-200/80 shadow-2xs p-4 flex flex-col space-y-2 shrink-0">
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
        <div className="flex-1 w-full bg-white rounded-lg border border-gray-200/80 shadow-2xs p-5 flex flex-col justify-between min-h-[460px] space-y-4">
          <div className="space-y-4">
            {/* Action Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-gray-800">{currentModuleLabel}</h3>

              <div className="flex items-center space-x-3">
                {/* Search input (Hidden in value_added) */}
                {activeModule !== 'value_added' && (
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
                {activeModule !== 'value_added' && (
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

            {/* Value Added Read-Only Info Banner */}
            {activeModule === 'value_added' && (
              <div className="bg-gradient-to-r from-amber-50/80 to-blue-50/80 p-3.5 rounded-lg border border-amber-200/80 flex items-start space-x-3 text-xs shadow-2xs">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-[#1E5ABB] block">
                    系统增值业务列表与功能介绍
                  </span>
                  <p className="text-gray-600 text-[11px] leading-relaxed">
                    本模块展示系统当前支持的各项增值扩展功能及其详细功能介绍。
                  </p>
                </div>
              </div>
            )}

            {/* Data Dictionary Sub-category Tabs (Only visible in data_dict module) */}
            {activeModule === 'data_dict' && (
              <div className="flex items-center space-x-1.5 bg-gray-50/80 p-1.5 rounded-lg border border-gray-200/80 flex-wrap gap-y-1">
                <span className="text-gray-500 font-bold text-[11px] px-2 shrink-0">字典分类子项:</span>
                {[
                  { id: 'all', label: '全部字典条目', count: (dataStore.data_dict || []).length },
                  { id: 'reject_reason', label: '拒绝理由 / 审核驳回原由', count: (dataStore.data_dict || []).filter(i => (i.dictCategory || 'reject_reason') === 'reject_reason').length, isHighlight: true },
                  { id: 'info_category', label: '信息分类', count: (dataStore.data_dict || []).filter(i => i.dictCategory === 'info_category').length },
                  { id: 'source_channel', label: '来源渠道', count: (dataStore.data_dict || []).filter(i => i.dictCategory === 'source_channel').length },
                  { id: 'urgency_level', label: '紧急程度', count: (dataStore.data_dict || []).filter(i => i.dictCategory === 'urgency_level').length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDictSubCategoryFilter(tab.id)}
                    className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-all flex items-center space-x-1 ${
                      dictSubCategoryFilter === tab.id
                        ? tab.isHighlight
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-[#1E5ABB] text-white shadow-2xs'
                        : tab.isHighlight
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      dictSubCategoryFilter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Content Display Area (Value Added Product Cards vs Standard Table) */}
            {activeModule === 'value_added' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredList.length === 0 ? (
                  <div className="col-span-2 py-12 text-center text-gray-400 text-xs bg-white rounded-lg border border-gray-100">
                    暂无相关增值业务模块数据
                  </div>
                ) : (
                  filteredList.map(item => {
                    const isActivated = item.activatedStatus === '已开通';
                    const isEnabled = isActivated && item.status === '启用';
                    const isDisabled = isActivated && item.status === '停用';

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
                              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 shadow-2xs ${
                                isEnabled || !isActivated
                                  ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/80'
                                  : 'bg-gray-200 border-gray-300'
                              }`}>
                                <Sparkles className={`w-5 h-5 ${isEnabled || !isActivated ? 'text-amber-600' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <h3 className={`font-bold text-sm flex items-center space-x-2 ${
                                  isEnabled || !isActivated ? 'text-gray-900 group-hover:text-[#1E5ABB]' : 'text-gray-500'
                                }`}>
                                  <span>{item.name}</span>
                                </h3>
                                <div className="flex items-center space-x-1.5 mt-1">
                                  {/* 开通状态 Badge */}
                                  <span className={`inline-flex items-center space-x-1 text-[10px] px-2 py-0.2 rounded border font-semibold ${
                                    isActivated
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}>
                                    {isActivated ? (
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                    ) : (
                                      <Lock className="w-2.5 h-2.5 text-slate-500" />
                                    )}
                                    <span>{item.activatedStatus || '未开通'}</span>
                                  </span>

                                  <span className={`inline-block text-[10px] px-2 py-0.2 rounded border font-medium ${
                                    isEnabled || !isActivated
                                      ? 'text-amber-700 bg-amber-50 border-amber-200/60'
                                      : 'text-gray-500 bg-gray-200/60 border-gray-300'
                                  }`}>
                                    增值扩展功能
                                  </span>
                                </div>
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
                        {activeModule === 'data_dict' ? '字典项名称 / 类别与描述' : activeModule === 'stats_metric' ? '统计指标名称 / 生效页面与达标线' : '配置项 / 规则组名称'}
                      </th>
                      <th className="py-2.5 px-4 font-medium whitespace-nowrap">
                        {activeModule === 'data_dict' ? '字典编码 & 排序号' : activeModule === 'report_template' ? '模板类型' : activeModule === 'audit_score' ? '关联上报模版与打分参数' : activeModule === 'audit_flow' ? '关联模版 / 层级节点 / 机构规则' : activeModule === 'stats_metric' ? '指标类型 / 计算公式 / 统计粒度' : '属性类型'}
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
                                        <span className="text-gray-300 text-[10px]">➔</span>
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

                              {activeModule === 'stats_metric' && (
                                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                  <span className={`px-2 py-0.2 text-[10px] font-bold rounded border shrink-0 ${
                                    (item.metricScope || 'both') === 'home'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : (item.metricScope || 'both') === 'stats'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  }`}>
                                    {(item.metricScope || 'both') === 'home' ? '首页控制台' : (item.metricScope || 'both') === 'stats' ? '统计管理页' : '首页&统计通用'}
                                  </span>
                                  {item.unit && (
                                    <span className="px-1.5 py-0.2 bg-gray-100 text-gray-700 font-mono text-[10px] rounded border border-gray-200">
                                      单位: {item.unit}
                                    </span>
                                  )}
                                  {item.targetBenchmark && (
                                    <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 font-medium text-[10px] rounded border border-emerald-200">
                                      达标线: {item.targetBenchmark}
                                    </span>
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
                            ) : activeModule === 'stats_metric' ? (
                              <div className="flex flex-col space-y-1 items-start max-w-xs">
                                <div className="flex items-center space-x-1">
                                  <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 font-bold text-[10px] rounded border border-blue-200">
                                    {item.calcType === 'rate' ? '比例转化' : item.calcType === 'avg' ? '均值耗时' : item.calcType === 'trend' ? '趋势对比' : item.calcType === 'distribution' ? '占比分布' : '计数累加'}
                                  </span>
                                  <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 font-bold text-[10px] rounded border border-purple-200">
                                    {item.timeDimension === 'realtime' ? '实时刷新' : item.timeDimension === 'daily' ? '日度' : item.timeDimension === 'weekly' ? '周度' : item.timeDimension === 'monthly' ? '月度' : '多维可切'}
                                  </span>
                                </div>
                                <span className="text-[11px] text-gray-600 font-mono line-clamp-1" title={item.calcFormula}>
                                  公式: {item.calcFormula || '无'}
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
                                onClick={() => setPreviewItem(item)}
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

          {/* Table Footer */}
          {activeModule !== 'value_added' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100 gap-2">
              <span>共 {filteredList.length} 条记录</span>

              <div className="flex items-center space-x-1 font-mono">
                <button className="px-2 py-1 border border-gray-200 rounded text-gray-400 hover:bg-gray-50 disabled:opacity-40">
                  &lt;
                </button>
                <button className="px-2.5 py-1 bg-[#1E5ABB] text-white font-bold rounded">
                  1
                </button>
                <button className="px-2 py-1 border border-gray-200 rounded text-gray-400 hover:bg-gray-50">
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0">
              <h3 className="text-sm font-bold text-gray-800">
                配置详情 - {previewItem.name}
              </h3>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto">
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
                      <span className="text-gray-400 block mb-1">关联上报模版:</span>
                      <span className="font-bold text-blue-900 text-xs flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>{previewItem.relatedTemplateName || '标准图文报送模板'}</span>
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

              <div>
                <span className="text-gray-400 block mb-1">业务说明:</span>
                <p className="p-2.5 bg-gray-50 rounded border border-gray-100 text-gray-700 leading-relaxed">
                  {previewItem.description || '暂无详细补充说明'}
                </p>
              </div>

              {/* Evaluation Rule Reference & Indicator Breakdown Preview */}
              {activeModule === 'evaluation_rule' && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-purple-900 space-y-1">
                    <div className="font-bold flex items-center space-x-1.5 text-xs">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span>考核规则对照：联动【考核管理】三大统筹维度</span>
                    </div>
                    <p className="text-[11px] text-purple-700">
                      本规则已绑定至【考核管理】中的 <strong>分类考核统计</strong>、<strong>机构考核统计</strong> 与 <strong>人员考核统计</strong> 页面，作为计算排名与分值的核心支撑算法。
                    </p>
                  </div>

                  {previewItem.indicators && previewItem.indicators.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800 flex items-center space-x-1 text-xs">
                          <Award className="w-3.5 h-3.5 text-purple-600" />
                          <span>考核指标及衡量计算规则 ({previewItem.indicators.length} 项)</span>
                        </span>
                        <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {previewItem.evalDimension === 'category' ? '分类考核维度' : previewItem.evalDimension === 'org' ? '机构考核维度' : previewItem.evalDimension === 'person' ? '人员考核维度' : '综合全维度'}
                        </span>
                      </div>

                      <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-200 space-y-2 max-h-64 overflow-y-auto">
                        {previewItem.indicators.map((ind, idx) => (
                          <div key={ind.id || idx} className="bg-white p-2.5 rounded border border-gray-200 shadow-2xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-800 text-xs flex items-center space-x-2">
                                <span className="text-purple-600 font-mono">#{idx + 1}</span>
                                <span>{ind.name}</span>
                              </span>
                              <div className="flex items-center space-x-1.5">
                                <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 font-bold text-[10px] rounded">
                                  {ind.calcType}
                                </span>
                                <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px] rounded border border-emerald-200">
                                  基准: {ind.basePoints}分 ({ind.weightPercent}%权重)
                                </span>
                              </div>
                            </div>
                            <p className="text-[11px] text-gray-500 pl-4">{ind.unitRule}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Audit Score Breakdown Preview */}
              {activeModule === 'audit_score' && previewItem.scoreLevels && previewItem.scoreLevels.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800 flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>等级分值分配方案明细 ({previewItem.scoreLevels.length} 个等级)</span>
                    </span>
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      规则总分: {previewItem.totalScore || 100} 分
                    </span>
                  </div>

                  <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-200/80 space-y-2 max-h-64 overflow-y-auto">
                    {previewItem.scoreLevels.map((lvl, idx) => (
                      <div key={lvl.id || idx} className="bg-white p-2.5 rounded border border-gray-200 shadow-2xs flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-bold text-gray-800 flex items-center space-x-2">
                            <span className="text-xs text-blue-700">#{idx + 1}</span>
                            <span>{lvl.levelName}</span>
                          </div>
                          {lvl.description && <p className="text-[11px] text-gray-400">{lvl.description}</p>}
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-amber-600 font-mono">+{lvl.score} 分</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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

              {/* Statistics Metric Preview Detail */}
              {activeModule === 'stats_metric' && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3.5 rounded-xl border border-blue-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 flex items-center space-x-1.5 text-xs">
                        <BarChart3 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>统计指标规则定义与业务口径</span>
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                        (previewItem.metricScope || 'both') === 'home'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : (previewItem.metricScope || 'both') === 'stats'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                      }`}>
                        {(previewItem.metricScope || 'both') === 'home' ? '首页控制台卡片' : (previewItem.metricScope || 'both') === 'stats' ? '统计管理大屏' : '首页&统计全域通用'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2.5 rounded-lg border border-blue-100 space-y-1">
                        <span className="text-gray-400 text-[10px] block">计算公式 / 算法口径</span>
                        <p className="font-mono font-bold text-gray-800 text-[11px]">{previewItem.calcFormula || '未设置'}</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-blue-100 space-y-1">
                        <span className="text-gray-400 text-[10px] block">目标达标线 / 参考基准</span>
                        <p className="font-bold text-emerald-700 text-[11px]">{previewItem.targetBenchmark || '无基准限制'}</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-blue-100 space-y-1">
                        <span className="text-gray-400 text-[10px] block">时间统计粒度</span>
                        <p className="font-bold text-purple-700 text-[11px]">
                          {previewItem.timeDimension === 'realtime' ? '实时刷新' : previewItem.timeDimension === 'daily' ? '日度聚合' : previewItem.timeDimension === 'weekly' ? '周度聚合' : previewItem.timeDimension === 'monthly' ? '月度聚合' : '多维可切换(日/周/月/季/年)'}
                        </p>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-blue-100 space-y-1">
                        <span className="text-gray-400 text-[10px] block">单位与显示精度</span>
                        <p className="font-bold text-gray-800 text-[11px]">
                          单位: {previewItem.unit || '件'} | 精度: {previewItem.precision === 'decimal_1' ? '1位小数' : previewItem.precision === 'decimal_2' ? '2位小数' : '整数'}
                        </p>
                      </div>
                    </div>

                    {previewItem.description && (
                      <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100 text-[11px] text-gray-700">
                        <span className="font-bold text-gray-800 block mb-0.5">业务口径说明：</span>
                        {previewItem.description}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {previewItem.fields && previewItem.fields.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800 flex items-center space-x-1">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>表单元件配置 ({previewItem.fields.length})</span>
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {previewItem.fields.filter(f => f.required).length} 个必填，
                      {previewItem.fields.filter(f => !f.required).length} 个选填
                    </span>
                  </div>

                  <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-200/80 space-y-2.5 max-h-64 overflow-y-auto">
                    {previewItem.fields.map((field, idx) => {
                      const meta = getFieldTypeMeta(field.type);
                      const IconComp = meta.icon;
                      return (
                        <div key={field.id || idx} className="bg-white p-2.5 rounded border border-gray-200 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <span className={`p-1 rounded text-[10px] font-medium flex items-center space-x-1 ${meta.color}`}>
                                <IconComp className="w-3 h-3" />
                                <span>{meta.label}</span>
                              </span>
                              <span className="font-bold text-gray-800">{field.name}</span>
                            </div>
                            {field.required ? (
                              <span className="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.2 rounded">必填</span>
                            ) : (
                              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.2 rounded">选填</span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400 pl-1 font-mono">
                            提示说明: {field.placeholder || '无'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-gray-100">
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-4 py-1.5 bg-[#1E5ABB] text-white rounded font-bold hover:bg-[#134092] cursor-pointer"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`bg-white rounded-lg shadow-xl w-full ${activeModule === 'report_template' || activeModule === 'audit_score' || activeModule === 'audit_flow' ? 'max-w-3xl' : 'max-w-md'} overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col`}>
            {/* Header */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <h3 className="text-sm font-bold text-gray-800">
                  {editingItem ? `编辑${currentModuleLabel}` : `新增${currentModuleLabel}`}
                </h3>
                {activeModule === 'report_template' && (
                  <div className="flex items-center bg-gray-200/80 p-0.5 rounded text-[11px]">
                    <button
                      type="button"
                      onClick={() => setModalActiveTab('build')}
                      className={`px-2.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                        modalActiveTab === 'build' ? 'bg-white text-[#1E5ABB] shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      元件字段配置
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalActiveTab('preview')}
                      className={`px-2.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                        modalActiveTab === 'preview' ? 'bg-white text-[#1E5ABB] shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      表单效果预览
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveModal} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Basic Fields */}
              {activeModule === 'audit_score' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">规则组名称 *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="请输入打分规则组名称..."
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1 flex items-center justify-between">
                      <span>关联上报模版 *</span>
                      <span className="text-[10px] text-blue-600 font-normal">来源于【模版配置】</span>
                    </label>
                    <select
                      required
                      value={formRelatedTemplateId}
                      onChange={e => setFormRelatedTemplateId(e.target.value)}
                      className="w-full px-3 py-1.5 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-blue-50/30 cursor-pointer font-bold text-blue-900"
                    >
                      {enabledReportTemplates.length === 0 ? (
                        <option value="">暂无已启用的上报模版(请先至【模版配置】中启用模版)</option>
                      ) : (
                        enabledReportTemplates.map(tpl => (
                          <option key={tpl.id} value={tpl.id}>
                            {tpl.name} ({tpl.templateType || '报送'})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">规则生效状态 *</label>
                    <select
                      value={formScoreStatus}
                      onChange={e => setFormScoreStatus(e.target.value as '启用' | '停用')}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white cursor-pointer font-bold text-gray-800"
                    >
                      <option value="启用">启用 (设为当前唯一生效规则组)</option>
                      <option value="停用">停用 (保存为备用规则组)</option>
                    </select>
                  </div>

                  <div>
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
              ) : activeModule === 'audit_flow' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                  <div>
                    <label className="block text-gray-700 font-medium mb-1 flex items-center justify-between">
                      <span>关联上报模版 *</span>
                      <span className="text-[10px] text-blue-600 font-normal">来源于【模版配置】</span>
                    </label>
                    <select
                      required
                      value={formRelatedTemplateId}
                      onChange={e => setFormRelatedTemplateId(e.target.value)}
                      className="w-full px-3 py-1.5 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-blue-50/30 cursor-pointer font-bold text-blue-900"
                    >
                      {enabledReportTemplates.length === 0 ? (
                        <option value="">暂无已启用的上报模版(请先至【模版配置】中启用模版)</option>
                      ) : (
                        enabledReportTemplates.map(tpl => (
                          <option key={tpl.id} value={tpl.id}>
                            {tpl.name} ({tpl.templateType || '报送'})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">流程使能状态 *</label>
                    <select
                      value={formScoreStatus}
                      onChange={e => setFormScoreStatus(e.target.value as '启用' | '停用')}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white cursor-pointer font-bold text-gray-800"
                    >
                      <option value="启用">启用 (立即对所选机构生效)</option>
                      <option value="停用">停用 (暂停本流程规则)</option>
                    </select>
                  </div>

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
              ) : activeModule === 'data_dict' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1 flex items-center justify-between">
                        <span>字典分类子项 *</span>
                        <span className="text-[10px] text-rose-600 font-bold">包含【拒绝理由】</span>
                      </label>
                      <select
                        required
                        value={formDictCategory}
                        onChange={e => setFormDictCategory(e.target.value)}
                        className="w-full px-3 py-1.5 border border-rose-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-rose-50/20 font-bold text-gray-800 cursor-pointer"
                      >
                        <option value="reject_reason">拒绝理由 / 审核驳回原由 (对应系统管理)</option>
                        <option value="info_category">信息分类 (对应信息报送分类)</option>
                        <option value="source_channel">来源渠道 (对应数据采集来源)</option>
                        <option value="urgency_level">紧急程度 (对应信息流转等级)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">字典项名称 / 拒绝原因条目 *</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        placeholder="如: 信息真实性核查不通过"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">字典编码 *</label>
                      <input
                        type="text"
                        required
                        value={formDictCode}
                        onChange={e => setFormDictCode(e.target.value)}
                        placeholder="如: REJECT_001"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] font-mono font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">排序优先级</label>
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={formSortOrder}
                        onChange={e => setFormSortOrder(Number(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">业务使用说明与详细定义</label>
                    <textarea
                      rows={2}
                      value={formDesc}
                      onChange={e => setFormDesc(e.target.value)}
                      placeholder="如: 缺乏实质性事实依据或为虚假流言，审核人选择此项将触发退回初稿通知..."
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] text-xs"
                    />
                  </div>
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
              ) : activeModule === 'stats_metric' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-gray-700 font-medium mb-1">指标名称 *</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        placeholder="如: 舆情速报上报总量"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">应用页面/范围 *</label>
                      <select
                        value={formMetricScope}
                        onChange={e => setFormMetricScope(e.target.value as 'home' | 'stats' | 'both')}
                        className="w-full px-3 py-1.5 border border-indigo-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-indigo-50/30 cursor-pointer font-bold text-indigo-900"
                      >
                        <option value="both">首页控制台 & 统计管理页通用</option>
                        <option value="home">仅首页控制台 (Home Dashboard)</option>
                        <option value="stats">仅统计管理页 (Statistics Page)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">计算类型 *</label>
                      <select
                        value={formMetricCalcType}
                        onChange={e => setFormMetricCalcType(e.target.value as 'count' | 'rate' | 'avg' | 'trend' | 'distribution')}
                        className="w-full px-3 py-1.5 border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-blue-50/30 cursor-pointer font-bold text-blue-900"
                      >
                        <option value="count">基础计数 (COUNT / SUM 累加)</option>
                        <option value="rate">比例转化 (通过率 / 办结率 / 采纳率 %)</option>
                        <option value="avg">均值耗时 (AVG 审核响应 / 处置时长)</option>
                        <option value="trend">趋势对比 (日/月/年 环比与同比增幅)</option>
                        <option value="distribution">多维结构分布 (分类/渠道/机构构成占比)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">时间统计维度 *</label>
                      <select
                        value={formMetricTimeDim}
                        onChange={e => setFormMetricTimeDim(e.target.value as 'realtime' | 'daily' | 'weekly' | 'monthly' | 'multi')}
                        className="w-full px-3 py-1.5 border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-purple-50/30 cursor-pointer font-bold text-purple-900"
                      >
                        <option value="multi">多维可切 (支持日/周/月/季/年)</option>
                        <option value="realtime">实时刷新 (当日前时段)</option>
                        <option value="daily">日度聚合 (按日统计)</option>
                        <option value="weekly">周度聚合 (按周统计)</option>
                        <option value="monthly">月度聚合 (按月统计)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">计量单位 *</label>
                      <input
                        type="text"
                        required
                        value={formMetricUnit}
                        onChange={e => setFormMetricUnit(e.target.value)}
                        placeholder="如: 件 / 个 / 名 / % / 分钟"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">数值精度显示 *</label>
                      <select
                        value={formMetricPrecision}
                        onChange={e => setFormMetricPrecision(e.target.value as 'integer' | 'decimal_1' | 'decimal_2')}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white cursor-pointer"
                      >
                        <option value="integer">整数 (0 位小数，如: 120)</option>
                        <option value="decimal_1">1 位小数 (如: 98.5%)</option>
                        <option value="decimal_2">2 位小数 (如: 14.25)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">计算公式 / 算法口径 *</label>
                      <input
                        type="text"
                        required
                        value={formMetricFormula}
                        onChange={e => setFormMetricFormula(e.target.value)}
                        placeholder="如: SUM(report_count) 按指定时间维度聚合"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">目标达标线 / 参考基准</label>
                      <input
                        type="text"
                        value={formMetricBenchmark}
                        onChange={e => setFormMetricBenchmark(e.target.value)}
                        placeholder="如: 月度配额 1000 件 / 办结率 ≥ 95%"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">指标业务口径与用途说明</label>
                    <textarea
                      rows={2}
                      value={formDesc}
                      onChange={e => setFormDesc(e.target.value)}
                      placeholder="请详细说明该统计指标在首页控制台或统计管理大屏中的计算逻辑、展示位置与业务价值..."
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                const totalAssigned = formScoreLevels.reduce((sum, lvl) => sum + (Number(lvl.score) || 0), 0);
                const isMatched = totalAssigned === formTotalScore;
                return (
                  <div className="space-y-4 pt-3 border-t border-gray-200">
                    {/* Top Parameters */}
                    <div className="bg-amber-50/50 p-3.5 rounded-lg border border-amber-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 flex items-center space-x-1.5 text-xs">
                          <Award className="w-4 h-4 text-amber-600" />
                          <span>审核打分规则组 - 核心参数配置</span>
                        </span>
                        <span className="text-[11px] text-amber-800 font-medium">
                          说明：打分规则目前系统仅支持同时【开启一组】
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-md border border-amber-100 shadow-2xs">
                        <div>
                          <label className="block text-gray-700 font-bold mb-1">规则总分值 *</label>
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
                          <label className="block text-gray-700 font-bold mb-1">划分为几个等级 *</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min={1}
                              max={10}
                              required
                              value={formLevelCount}
                              onChange={e => handleLevelCountChange(Number(e.target.value) || 1)}
                              className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] font-mono text-sm font-bold text-gray-800"
                            />
                            <span className="text-gray-500 font-bold shrink-0">个等级</span>
                          </div>
                        </div>
                      </div>

                      {/* Total Score Match Status Banner */}
                      <div className={`p-2.5 rounded-md border text-xs font-bold flex items-center justify-between ${
                        isMatched
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : totalAssigned < formTotalScore
                          ? 'bg-amber-100/80 text-amber-800 border-amber-300'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        <span>
                          {isMatched
                            ? `✓ 各等级分值合计 (${totalAssigned} 分) 恰好等于总分值 (${formTotalScore} 分)`
                            : totalAssigned < formTotalScore
                            ? `⚠️ 各等级分值合计 (${totalAssigned} 分) 尚未达到总分值 (${formTotalScore} 分)，还差 ${formTotalScore - totalAssigned} 分`
                            : `✕ 各等级分值合计 (${totalAssigned} 分) 已超出总分值 (${formTotalScore} 分)，超出 ${totalAssigned - formTotalScore} 分`}
                        </span>
                        <span className="font-mono text-[11px] underline">
                          当前分配比例: {formTotalScore > 0 ? Math.round((totalAssigned / formTotalScore) * 100) : 0}%
                        </span>
                      </div>
                    </div>

                    {/* Score Levels Table */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="font-bold text-gray-800 text-xs">
                          各等级分值分配明细 ({formScoreLevels.length} 项)
                        </span>
                        <button
                          type="button"
                          onClick={handleAddScoreLevel}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>新增一个得分等级</span>
                        </button>
                      </div>

                      <div className="bg-gray-50/70 p-3 rounded-lg border border-gray-200 space-y-2 max-h-[280px] overflow-y-auto">
                        {formScoreLevels.map((lvl, index) => (
                          <div key={lvl.id} className="bg-white p-2.5 rounded-md border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <span className="text-gray-400 font-mono text-[11px] w-5 shrink-0">
                              #{index + 1}
                            </span>

                            {/* Level Name */}
                            <div className="w-full sm:w-36 shrink-0">
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
                            <div className="w-full sm:w-28 shrink-0 flex items-center space-x-1">
                              <input
                                type="number"
                                min={0}
                                required
                                value={lvl.score}
                                onChange={e => handleUpdateScoreLevel(index, { score: Number(e.target.value) || 0 })}
                                placeholder="分值"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-mono font-bold text-amber-700 text-right focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                              />
                              <span className="text-gray-500 font-bold text-xs shrink-0">分</span>
                            </div>

                            {/* Description */}
                            <div className="flex-1 w-full">
                              <input
                                type="text"
                                value={lvl.description || ''}
                                onChange={e => handleUpdateScoreLevel(index, { description: e.target.value })}
                                placeholder="分值说明或评审达标要求..."
                                className="w-full px-2.5 py-1 border border-gray-200 rounded text-xs text-gray-600 placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                              />
                            </div>

                            {/* Delete Level */}
                            <button
                              type="button"
                              onClick={() => handleDeleteScoreLevel(index)}
                              className="p-1 text-gray-400 hover:text-red-600 cursor-pointer shrink-0 self-end sm:self-center"
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
              {activeModule === 'audit_flow' && (
                <div className="space-y-4 pt-3 border-t border-gray-200">
                  {/* Section 1: Hierarchy Depth and Node Configurator */}
                  <div className="bg-indigo-50/50 p-3.5 rounded-lg border border-indigo-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900 flex items-center space-x-1.5 text-xs">
                        <GitBranch className="w-4 h-4 text-indigo-600" />
                        <span>1. 审核层级深度与节点审批人配置</span>
                      </span>
                      <span className="text-[10px] text-indigo-700 bg-indigo-100/70 font-bold px-2 py-0.5 rounded">
                        当前配置: {formAuditNodes.length} 层审批
                      </span>
                    </div>

                    {/* Hierarchy Depth Selector Quick Buttons */}
                    <div className="flex items-center space-x-2 bg-white p-2 rounded border border-indigo-100">
                      <span className="text-gray-600 font-medium shrink-0">快捷层级深度:</span>
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        {[1, 2, 3, 4, 5].map(depth => (
                          <button
                            key={depth}
                            type="button"
                            onClick={() => handleFlowDepthChange(depth)}
                            className={`px-2.5 py-1 rounded font-bold text-[11px] cursor-pointer transition-colors ${
                              formFlowDepth === depth
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
                            }`}
                          >
                            {depth} 层审批
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Nodes Configurator List */}
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {formAuditNodes.map((node, index) => (
                        <div key={node.id || index} className="bg-white p-2.5 rounded-lg border border-indigo-200 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center space-x-1 font-bold text-indigo-900 text-xs">
                              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                                {index + 1}
                              </span>
                              <span>第 {index + 1} 级节点设置</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteAuditNode(index)}
                              className="text-gray-400 hover:text-red-600 text-[11px] flex items-center space-x-0.5 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>删除此节点</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] text-gray-500 mb-0.5">节点名称 *</label>
                              <input
                                type="text"
                                required
                                value={node.nodeName}
                                onChange={e => handleUpdateAuditNode(index, { nodeName: e.target.value })}
                                placeholder="如: 一级初审"
                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-500 mb-0.5">审核角色 / 审批人 *</label>
                              <input
                                type="text"
                                required
                                value={node.approverRole}
                                onChange={e => handleUpdateAuditNode(index, { approverRole: e.target.value })}
                                placeholder="如: 网格员 / 科长"
                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-500 mb-0.5">限制处理时长 (分钟)</label>
                              <input
                                type="number"
                                min="1"
                                value={node.timeLimitMinutes || 15}
                                onChange={e => handleUpdateAuditNode(index, { timeLimitMinutes: Number(e.target.value) || 15 })}
                                placeholder="15"
                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddAuditNode}
                      className="w-full py-1.5 bg-white border border-dashed border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-bold rounded flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新增一层审批节点</span>
                    </button>
                  </div>

                  {/* Section 2: Organization Application Scope & Enable/Disable per Org */}
                  <div className="bg-emerald-50/50 p-3.5 rounded-lg border border-emerald-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900 flex items-center space-x-1.5 text-xs">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span>2. 机构适用范围与单机构使能/失效管控</span>
                      </span>
                    </div>

                    {/* Mode Toggle */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormOrgApplyMode('all_orgs')}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          formOrgApplyMode === 'all_orgs'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="font-bold flex items-center space-x-1 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>所有机构同时生效</span>
                        </div>
                        <p className={`text-[10px] mt-1 ${formOrgApplyMode === 'all_orgs' ? 'text-emerald-100' : 'text-gray-400'}`}>
                          系统内所有下属部门与机构均统一使用此审批流程架构
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormOrgApplyMode('specific_orgs')}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          formOrgApplyMode === 'specific_orgs'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="font-bold flex items-center space-x-1 text-xs">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>针对单机构使能/失效管控</span>
                        </div>
                        <p className={`text-[10px] mt-1 ${formOrgApplyMode === 'specific_orgs' ? 'text-emerald-100' : 'text-gray-400'}`}>
                          允许针对特定单机构独立开启（生效）或关闭（失效）本流程
                        </p>
                      </button>
                    </div>

                    {/* Individual Org Control List */}
                    {formOrgApplyMode === 'specific_orgs' && (
                      <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                          <span className="font-bold text-gray-800 text-xs">下属机构生效/失效状态控制清单:</span>
                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleBatchToggleOrgSettings(true)}
                              className="text-[10px] text-emerald-700 hover:underline font-bold"
                            >
                              一键全部生效
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              type="button"
                              onClick={() => handleBatchToggleOrgSettings(false)}
                              className="text-[10px] text-rose-600 hover:underline font-bold"
                            >
                              一键全部失效
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                          {formOrgSettings.map(org => (
                            <div
                              key={org.orgId}
                              onClick={() => handleToggleOrgSetting(org.orgId)}
                              className={`p-2 rounded border flex items-center justify-between cursor-pointer transition-all ${
                                org.enabled
                                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950 hover:bg-emerald-100/60'
                                  : 'bg-rose-50/60 border-rose-200 text-rose-900 opacity-80 hover:bg-rose-100/60'
                              }`}
                            >
                              <div className="flex items-center space-x-2 overflow-hidden">
                                <Building2 className={`w-3.5 h-3.5 shrink-0 ${org.enabled ? 'text-emerald-600' : 'text-rose-500'}`} />
                                <span className="font-medium text-xs truncate">{org.orgName}</span>
                              </div>
                              <div className="shrink-0 flex items-center space-x-1.5">
                                {org.enabled ? (
                                  <span className="px-1.5 py-0.5 bg-emerald-600 text-white font-bold text-[9px] rounded">已生效</span>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-rose-600 text-white font-bold text-[9px] rounded">单机构失效</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Quick Add Org Field */}
                        <div className="flex items-center space-x-2 pt-1">
                          <input
                            type="text"
                            value={newCustomOrgName}
                            onChange={e => setNewCustomOrgName(e.target.value)}
                            placeholder="输入新机构节点全称..."
                            className="flex-1 px-2.5 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomOrg}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs shrink-0 cursor-pointer"
                          >
                            + 添加机构
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Evaluation Rule Builder */}
              {activeModule === 'evaluation_rule' && (
                <div className="space-y-4 pt-3 border-t border-gray-200">
                  {/* Section 1: Dimension Selector */}
                  <div className="bg-purple-50/50 p-3.5 rounded-lg border border-purple-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-900 flex items-center space-x-1.5 text-xs">
                        <Award className="w-4 h-4 text-purple-600" />
                        <span>1. 关联考核管理三大维度</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleLoadPresetIndicators(formEvalDimension)}
                        className="text-[11px] text-purple-700 hover:text-purple-900 font-bold underline cursor-pointer flex items-center space-x-1"
                      >
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        <span>一键重置该维度标准考核指标</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormEvalDimension('category');
                          if (!editingItem) {
                            setFormName('分类考核维度计分细则');
                            setFormDesc('参考【考核管理-分类考核】，针对突发事件、舆情动态、政策解读与民生诉求的分类上报量、通过率及采纳精度计分规则');
                          }
                          handleLoadPresetIndicators('category');
                        }}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          formEvalDimension === 'category'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="font-bold flex items-center space-x-1 text-xs">
                          <Layers className="w-3.5 h-3.5" />
                          <span>分类考核维度</span>
                        </div>
                        <p className={`text-[10px] mt-1 ${formEvalDimension === 'category' ? 'text-purple-100' : 'text-gray-400'}`}>
                          对应分类考核：突发、舆情、政策、民生
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormEvalDimension('org');
                          if (!editingItem) {
                            setFormName('机构考核维度综合评估规则');
                            setFormDesc('参考【考核管理-机构考核】，评估下属各机构（宣传部、网安、应急办等）协同配合力、全员参与率与重大贡献分');
                          }
                          handleLoadPresetIndicators('org');
                        }}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          formEvalDimension === 'org'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-bold flex items-center space-x-1 text-xs">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>机构考核维度</span>
                        </div>
                        <p className={`text-[10px] mt-1 ${formEvalDimension === 'org' ? 'text-blue-100' : 'text-gray-400'}`}>
                          对应机构考核：宣传部、网安、应急办
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormEvalDimension('person');
                          if (!editingItem) {
                            setFormName('人员考核维度绩效加减分规则');
                            setFormDesc('参考【考核管理-人员考核】，针对信息员与审核员个人上报质量、响应时效与月度勤勉度的量化考核指标');
                          }
                          handleLoadPresetIndicators('person');
                        }}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          formEvalDimension === 'person'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="font-bold flex items-center space-x-1 text-xs">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>人员考核维度</span>
                        </div>
                        <p className={`text-[10px] mt-1 ${formEvalDimension === 'person' ? 'text-emerald-100' : 'text-gray-400'}`}>
                          对应人员考核：信息员、审核员等
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormEvalDimension('comprehensive');
                          if (!editingItem) {
                            setFormName('三位一体综合统筹考评规则');
                            setFormDesc('融合分类考核(30%)、机构考核(40%)与人员考核(30%)的季度统筹全维度考评模型');
                          }
                          handleLoadPresetIndicators('comprehensive');
                        }}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          formEvalDimension === 'comprehensive'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="font-bold flex items-center space-x-1 text-xs">
                          <Award className="w-3.5 h-3.5" />
                          <span>综合统筹考核</span>
                        </div>
                        <p className={`text-[10px] mt-1 ${formEvalDimension === 'comprehensive' ? 'text-indigo-100' : 'text-gray-400'}`}>
                          融合分类、机构与人员的三位一体规则
                        </p>
                      </button>
                    </div>

                    {/* Indicators Summary Banner */}
                    {(() => {
                      const totalBase = formIndicators.reduce((s, i) => s + (Number(i.basePoints) || 0), 0);
                      const totalWeight = formIndicators.reduce((s, i) => s + (Number(i.weightPercent) || 0), 0);
                      return (
                        <div className={`p-2.5 rounded-md border text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                          totalWeight === 100
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="text-gray-700 font-bold">指标权重基准校验:</span>
                            <span className="bg-white px-2 py-0.5 rounded border border-purple-200 font-mono text-purple-900">
                              基准分合计: <strong>{totalBase}</strong> 分
                            </span>
                            <span className="bg-white px-2 py-0.5 rounded border border-purple-200 font-mono text-purple-900">
                              权重占比合计: <strong>{totalWeight}</strong> %
                            </span>
                          </div>
                          <div>
                            {totalWeight === 100 ? (
                              <span className="text-emerald-600 font-bold flex items-center space-x-1">
                                <span>✓ 权重已配平 (100%)</span>
                              </span>
                            ) : (
                              <span className="text-amber-700 font-bold flex items-center space-x-1">
                                <span>⚠️ 权重合计为 {totalWeight}% (建议调整至 100%)</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Section 2: Specific Indicators Editor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="font-bold text-gray-800 text-xs">
                        2. 配置【{formEvalDimension === 'category' ? '分类考核' : formEvalDimension === 'org' ? '机构考核' : formEvalDimension === 'person' ? '人员考核' : '综合统筹'}】具体量化指标 ({formIndicators.length} 项)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddIndicator}
                        className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded border border-purple-200 font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>新增一项考核指标</span>
                      </button>
                    </div>

                    <div className="bg-gray-50/70 p-3 rounded-lg border border-gray-200 space-y-2.5 max-h-[280px] overflow-y-auto">
                      {formIndicators.map((ind, index) => (
                        <div key={ind.id || index} className="bg-white p-2.5 rounded-md border border-gray-200 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-purple-600 font-mono text-[11px] font-bold shrink-0">
                              #{index + 1}
                            </span>

                            {/* Indicator Name */}
                            <input
                              type="text"
                              required
                              value={ind.name}
                              onChange={e => handleUpdateIndicator(index, { name: e.target.value })}
                              placeholder="指标名称 (如: 突发事件速报率)"
                              className="flex-1 px-2.5 py-1 border border-gray-300 rounded text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />

                            {/* Calc Type */}
                            <select
                              value={ind.calcType}
                              onChange={e => handleUpdateIndicator(index, { calcType: e.target.value as any })}
                              className="px-2 py-1 bg-purple-50 border border-purple-200 rounded text-xs font-bold text-purple-900 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                            >
                              <option value="基础分">基础分</option>
                              <option value="通过率/采纳率">通过率/采纳率</option>
                              <option value="时效响应">时效响应</option>
                              <option value="参与率">参与率</option>
                              <option value="加分项">加分项</option>
                              <option value="扣分项">扣分项</option>
                            </select>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteIndicator(index)}
                              className="p-1 text-gray-400 hover:text-red-600 cursor-pointer shrink-0"
                              title="删除指标"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] text-gray-500 mb-0.5">基准分值 (分)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={ind.basePoints}
                                onChange={e => handleUpdateIndicator(index, { basePoints: Number(e.target.value) || 0 })}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs font-mono font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-gray-500 mb-0.5">权重占比 (%)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={ind.weightPercent}
                                onChange={e => handleUpdateIndicator(index, { weightPercent: Number(e.target.value) || 0 })}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs font-mono font-bold text-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-gray-500 mb-0.5">计分公式与计算规则说明</label>
                              <input
                                type="text"
                                value={ind.unitRule}
                                onChange={e => handleUpdateIndicator(index, { unitRule: e.target.value })}
                                placeholder="如: 实际通过率 * 30分"
                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Field Elements Configuration for report_template */}
              {activeModule === 'report_template' && (
                <>
                  {modalActiveTab === 'build' ? (
                    <div className="space-y-3 pt-2 border-t border-gray-200">
                      {/* Field Types Palette */}
                      <div className="bg-blue-50/40 p-3 rounded-lg border border-blue-100/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1E5ABB] flex items-center space-x-1">
                            <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                            <span>选择元件格式添加到模板 (点击添加)</span>
                          </span>
                          <button
                            type="button"
                            onClick={handleLoadStandardPreset}
                            className="text-[11px] text-blue-700 hover:text-blue-900 underline font-medium cursor-pointer"
                          >
                            ⚡ 重置加载标准预设元件
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
                          {(['text', 'number', 'date', 'file', 'link', 'select'] as FieldType[]).map(type => {
                            const meta = getFieldTypeMeta(type);
                            const IconComp = meta.icon;
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => handleAddField(type)}
                                className="flex items-center justify-center space-x-1 p-2 bg-white hover:bg-blue-50/80 border border-gray-200 hover:border-blue-300 rounded text-gray-700 hover:text-blue-700 transition-all cursor-pointer shadow-2xs group"
                              >
                                <IconComp className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                                <span className="font-medium text-[11px]">{meta.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Fields List */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="font-bold text-gray-800 text-xs">
                            已配置字段元件 ({formFields.length} 项)
                          </span>
                          <span className="text-[11px] text-gray-400">
                            支持自定义字段名称、必填/选填及提示文案，可拖拽上下排序
                          </span>
                        </div>

                        {formFields.length === 0 ? (
                          <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-400 space-y-2">
                            <Layers className="w-8 h-8 text-gray-300 mx-auto" />
                            <p>暂未添加任何元件字段，请点击上方按钮添加文本、时间、附件等字段。</p>
                          </div>
                        ) : (
                          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                            {formFields.map((field, index) => {
                              const meta = getFieldTypeMeta(field.type);
                              const IconComp = meta.icon;
                              return (
                                <div
                                  key={field.id}
                                  className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs hover:border-blue-200 transition-colors space-y-2"
                                >
                                  {/* Field Header Row */}
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center space-x-2 flex-1">
                                      <span className="text-gray-400 font-mono text-[11px] w-4">
                                        #{index + 1}
                                      </span>

                                      {/* Type selector */}
                                      <div className="relative">
                                        <select
                                          value={field.type}
                                          onChange={e => handleUpdateField(index, { type: e.target.value as FieldType })}
                                          className="pl-7 pr-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] cursor-pointer"
                                        >
                                          <option value="text">文本字段</option>
                                          <option value="number">数据字段</option>
                                          <option value="date">时间字段</option>
                                          <option value="file">附件字段</option>
                                          <option value="link">链接字段</option>
                                          <option value="select">选择字段</option>
                                        </select>
                                        <IconComp className="w-3.5 h-3.5 text-blue-600 absolute left-2 top-2 pointer-events-none" />
                                      </div>

                                      {/* Field Name Input */}
                                      <input
                                        type="text"
                                        required
                                        value={field.name}
                                        onChange={e => handleUpdateField(index, { name: e.target.value })}
                                        placeholder="字段名称，例如: 事件主题"
                                        className="flex-1 px-2.5 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] font-bold text-gray-800"
                                      />
                                    </div>

                                    {/* Required / Optional Toggle & Actions */}
                                    <div className="flex items-center space-x-2 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateField(index, { required: !field.required })}
                                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                                          field.required
                                            ? 'bg-red-50 text-red-600 border border-red-200'
                                            : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                                        }`}
                                      >
                                        {field.required ? '* 必填项' : '选填项'}
                                      </button>

                                      {/* Move up / down */}
                                      <div className="flex items-center space-x-1 border-l border-gray-200 pl-2">
                                        <button
                                          type="button"
                                          disabled={index === 0}
                                          onClick={() => handleMoveField(index, 'up')}
                                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 cursor-pointer"
                                          title="向上移动"
                                        >
                                          ▲
                                        </button>
                                        <button
                                          type="button"
                                          disabled={index === formFields.length - 1}
                                          onClick={() => handleMoveField(index, 'down')}
                                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 cursor-pointer"
                                          title="向下移动"
                                        >
                                          ▼
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteField(index)}
                                          className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                                          title="删除字段"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Placeholder input */}
                                  <div>
                                    <input
                                      type="text"
                                      value={field.placeholder || ''}
                                      onChange={e => handleUpdateField(index, { placeholder: e.target.value })}
                                      placeholder="请输入给提报人员的占位或引导提示文案..."
                                      className="w-full px-2.5 py-1 text-[11px] bg-gray-50/60 border border-gray-200 rounded text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Tab 2: Live Form Preview */
                    <div className="space-y-3 pt-2 border-t border-gray-200">
                      <div className="bg-blue-50/30 p-2.5 rounded border border-blue-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-[#1E5ABB]">表单渲染实时模拟预览 (用户提报端呈现效果)</span>
                        <span className="text-[11px] text-gray-500">根据当前包含的 {formFields.length} 个字段实时呈现</span>
                      </div>

                      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-200 space-y-4 max-h-[380px] overflow-y-auto">
                        <div className="text-center pb-2 border-b border-gray-200">
                          <h4 className="text-sm font-bold text-gray-800">{formName || '示例自定义报送单'}</h4>
                          <p className="text-[11px] text-gray-400 mt-0.5">{formDesc || '请按提示填写下表并提交审批'}</p>
                        </div>

                        {formFields.map((field, i) => {
                          const meta = getFieldTypeMeta(field.type);
                          const IconComp = meta.icon;
                          return (
                            <div key={field.id || i} className="space-y-1 bg-white p-3 rounded-lg border border-gray-200/80 shadow-2xs">
                              <label className="block font-bold text-gray-800 flex items-center justify-between">
                                <span className="flex items-center space-x-1.5">
                                  <IconComp className="w-3.5 h-3.5 text-blue-600" />
                                  <span>{field.name}</span>
                                  {field.required && <span className="text-red-500">*</span>}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${meta.color}`}>
                                  {meta.label}
                                </span>
                              </label>

                              {field.type === 'text' && (
                                <input
                                  type="text"
                                  readOnly
                                  placeholder={field.placeholder || '请填写字段内容...'}
                                  className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded text-gray-400 cursor-not-allowed"
                                />
                              )}

                              {field.type === 'number' && (
                                <input
                                  type="number"
                                  readOnly
                                  placeholder={field.placeholder || '请输入数值数据...'}
                                  className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded text-gray-400 cursor-not-allowed"
                                />
                              )}

                              {field.type === 'date' && (
                                <div className="relative">
                                  <input
                                    type="text"
                                    readOnly
                                    placeholder={field.placeholder || '请选择日期与精准时间'}
                                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded text-gray-400 cursor-not-allowed"
                                  />
                                  <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                                </div>
                              )}

                              {field.type === 'file' && (
                                <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 text-center bg-gray-50/50 text-gray-400 space-y-1">
                                  <Paperclip className="w-5 h-5 mx-auto text-gray-300" />
                                  <p className="text-[11px] font-medium text-gray-500">点击或将凭证文件拖拽至此处上传</p>
                                  <p className="text-[10px] text-gray-400">{field.placeholder || '支持格式: JPG, PNG, PDF, MP4, ZIP'}</p>
                                </div>
                              )}

                              {field.type === 'link' && (
                                <div className="relative">
                                  <input
                                    type="text"
                                    readOnly
                                    placeholder={field.placeholder || 'https://example.com/...'}
                                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded text-gray-400 cursor-not-allowed"
                                  />
                                  <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                                </div>
                              )}

                              {field.type === 'select' && (
                                <select disabled className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded text-gray-400 cursor-not-allowed">
                                  <option>{field.placeholder || '请选择选项...'}</option>
                                </select>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Modal Buttons */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 shrink-0">
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
