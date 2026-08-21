import { ReportItem, AuditRecordItem, OrgItem, OrgUser, OrgNode, TemplateItem, LogItem, EvaluationItem } from '../types';

export const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 1,
    title: '关于某社区突发停水事件的舆情上报',
    source: '群众举报',
    region: '西坝区',
    infoType: '突发事件',
    author: '张三',
    organization: '台中市网信办',
    submitTime: '2026-08-13 09:30',
    occurAddress: '西坝区阳光花园一期、明月居等小区',
    auditStatus: '待审核',
    score: '--',
    matchUrl: 'https://news.example.com/water-outage',
    detailContent: {
      summary: '今日（10月24日）上午8时许，多名网民在微博、微信群反映XX区XX街道辖区内多个大型居民小区突发停水。经初步核查，受影响范围包括阳光花园、明月居等5个小区，涉及居民约3万人。',
      coreDemands: '网民普遍反映未接到停水通知，早高峰期间停水严重影响正常生活，部分网民情绪急躁，质疑供水部门应急处置能力。',
      publicOpinionTrend: '目前相关话题在本地微博同城榜排名呈上升趋势，阅读量已突破10万。暂未发现大规模聚集性负面言论，但个别自媒体账号开始发布未经证实的“管道大面积破裂需要停水数日”的言论。',
      recommendations: [
        '建议区政府立即协调水务集团查明停水原因，并明确预计恢复供水时间。',
        '通过官方渠道（微博、微信公众号）紧急发布停水情况说明，澄清不实传言。',
        '若短时间内无法恢复，建议安排应急送水车前往受影响小区，保障居民基本用水需求。'
      ]
    },
    attachments: [
      { id: 'a1', name: '微博截图1.png', size: '1.2 MB', type: 'image', thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&auto=format&fit=crop' },
      { id: 'a2', name: '微信群截图.jpg', size: '850 KB', type: 'image', thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop' },
      { id: 'a3', name: '停水核查简报.pdf', size: '1.8 MB', type: 'pdf' }
    ],
    timeline: [
      { title: '提交上报', operator: '张三 · 台中市网信办', time: '2026-08-13 09:30', status: 'completed' },
      { title: '审核处理', operator: '市委宣传部舆情科', time: '待审核', status: 'current', note: '待审核' },
      { title: '审核处理', operator: '市网信办复核组', status: 'pending', note: '等待处理' },
      { title: '审核处理', operator: '市网信办终审组', status: 'pending', note: '等待处理' },
      { title: '结束', operator: '流程结束', status: 'pending' }
    ]
  },
  {
    id: 2,
    title: '智慧停车 App 升级引发市民集中反馈',
    source: '热线12345',
    region: '全市',
    infoType: '舆情动态',
    author: '王五',
    organization: '市大数据中心',
    submitTime: '2026-08-12 16:45',
    occurAddress: '全市范围',
    auditStatus: '已采纳',
    score: 95,
    matchUrl: 'https://news.example.com/smart-parking',
    detailContent: {
      summary: '智慧停车 App 升级后，市民对找车位效率提升评价较好，同时反馈老年人使用门槛偏高。',
      coreDemands: '优化界面交互，增加适老关怀模式与线下辅助寻车指引。',
      publicOpinionTrend: '总体评价积极正面，优化建议占30%。',
      recommendations: [
        '开发团队已采纳建议，预计下周推出“关怀版”适老化更新。'
      ]
    },
    attachments: [
      { id: 'b1', name: '智慧停车用户反馈统计表.pdf', size: '3.5 MB', type: 'pdf' }
    ],
    timeline: [
      { title: '提交上报', operator: '王五 · 市大数据中心', time: '2026-08-12 16:45', status: 'completed' },
      { title: '提交上报', operator: '王五 · 市大数据中心', time: '2026-08-12 17:15', status: 'completed' },
      { title: '审核处理', operator: '王主任 · 市委宣传部舆情科', time: '2026-08-12 18:00', score: 95, status: 'completed', note: '已通过' },
      { title: '审核处理', operator: '李明 · 市网信办复核组', time: '2026-08-12 18:00', status: 'completed', note: '已通过' },
      { title: '审核处理', operator: '赵宁 · 市网信办终审组', time: '2026-08-12 18:00', score: 95, status: 'completed', note: '已通过' },
      { title: '结束', operator: '流程结束', time: '2026-08-12 18:05', status: 'completed', note: '已采纳' }
    ]
  },
  {
    id: 3,
    title: '老旧小区改造政策解读及反馈收集',
    source: '网格巡查',
    region: '南坝区',
    infoType: '政策解读',
    author: '张三',
    organization: '南坝区宣传部',
    submitTime: '2026-08-12 10:20',
    occurAddress: '南坝区建设路38号',
    auditStatus: '已驳回',
    rejectReason: '信息不完整。请补充政策原文链接和群众反馈截图后重新提交。',
    score: '--',
    detailContent: {
      summary: '老旧小区加装电梯政策解读发布后，居民对出资比例和采光补偿提出疑问。',
      coreDemands: '希望出台细化的采光补偿指导意见和费用分摊公式。',
      publicOpinionTrend: '低楼层与高楼层居民意见存在分歧。',
      recommendations: [
        '建立网格协商议事会，一楼一策推动共识。'
      ]
    },
    timeline: [
      { title: '提交上报', operator: '张三 · 南坝区宣传部', time: '2026-08-12 10:20', status: 'completed' },
      { title: '审核处理', operator: '王主任 · 市委宣传部舆情科', time: '2026-08-12 11:10', status: 'rejected', note: '已驳回' },
      { title: '审核处理', operator: '市网信办复核组', status: 'pending', note: '等待处理' },
      { title: '审核处理', operator: '市网信办终审组', status: 'pending', note: '等待处理' },
      { title: '结束', operator: '流程结束', status: 'pending' }
    ]
  },
  {
    id: 4,
    title: '公办幼儿园托育服务收费民意调查',
    source: '社交媒体',
    region: '西坝区',
    infoType: '民生诉求',
    author: '张三',
    organization: '西坝区教育局',
    submitTime: '2026-08-13 07:50',
    occurAddress: '西坝区实验幼儿园',
    auditStatus: '草稿',
    score: '--',
    detailContent: {
      summary: '家长群中出现关于托育服务收费标准的咨询和争议，正在补充政策依据与周边私立园对比数据。',
      coreDemands: '明确收费标准、退费规则和服务内容。',
      publicOpinionTrend: '讨论集中在家长群，暂未外溢。',
      recommendations: [
        '建议教育部门准备统一答复口径，并由园方在家长会集中宣讲。'
      ]
    },
    timeline: [
      { title: '草稿保存', operator: '张三 · 西坝区教育局', time: '2026-08-13 07:50', status: 'current', note: '草稿' }
    ]
  },
  {
    id: 5,
    title: '关于辖区内老旧电梯故障频发的专项排查草稿',
    source: '网格巡查',
    region: '北屯区',
    infoType: '突发事件',
    author: '李雷',
    organization: '北屯区住建局',
    submitTime: '2026-08-13 10:40',
    occurAddress: '金地家园4号楼',
    auditStatus: '草稿',
    score: '--',
    detailContent: {
      summary: '金地家园居民反映4号楼客梯近一月困人3次，物业维修后仍频繁停运，正在补充特种设备安检报告。',
      coreDemands: '督促原厂维保单位进场彻查并更换老化部件。',
      publicOpinionTrend: '居民业主群反映强烈，已向物业服务处递交联名信。',
      recommendations: [
        '特种设备安全监察科介入协调，限期整改排查。'
      ]
    },
    timeline: [
      { title: '草稿保存', operator: '李雷 · 北屯区住建局', time: '2026-08-13 10:40', status: 'current', note: '草稿' }
    ]
  },
  {
    id: 6,
    title: '短视频平台涉及虚假宣传的群众举报核查',
    source: '群众举报',
    region: '西坝区',
    infoType: '网络谣言',
    author: '张三',
    organization: '台中市网信办',
    submitTime: '2026-08-13 08:45',
    occurAddress: '短视频带货直播间',
    auditStatus: '待审核',
    score: '--',
    matchUrl: 'https://news.example.com/water-outage',
    detailContent: {
      summary: '网民举报某直播账号夸大保健产品疗效，评论区存在集中投诉与维权诉求。',
      coreDemands: '查处违规账号，规范带货宣传用语。',
      publicOpinionTrend: '投诉量有增多迹象。',
      recommendations: ['移交市场监管综合执法支队查实取证。']
    }
  },
  {
    id: 7,
    title: '某万达广场商户集体维权引发网络关注',
    source: '社交媒体',
    region: '南坝区',
    infoType: '舆情动态',
    author: '王强',
    organization: '南坝区商务局',
    submitTime: '2026-08-13 09:15',
    occurAddress: '南坝区万达广场',
    auditStatus: '待审核',
    score: '--',
    matchUrl: 'https://v.douyin.com/i892Xkz/',
    detailContent: {
      summary: '多名商户在抖音发布视频，反映万达广场管理方擅自调高租金及公摊水电费，现场有拉横幅现象。',
      coreDemands: '协商租金优惠与透明公摊收费。',
      publicOpinionTrend: '视频点赞量破千，有本地同城网民转发。',
      recommendations: ['街道办事处搭建商户与商管协商平台。']
    }
  },
  {
    id: 8,
    title: '万达广场物业拉横幅纠纷核查速报',
    source: '网格巡查',
    region: '南坝区',
    infoType: '突发事件',
    author: '刘洋',
    organization: '南坝区公安分局',
    submitTime: '2026-08-13 09:20',
    occurAddress: '南坝区万达广场1号门',
    auditStatus: '待审核',
    score: '--',
    matchUrl: 'https://v.douyin.com/i892Xkz/',
    detailContent: {
      summary: '网格员巡查发现万达广场门口聚集约15名商户，现场民警已在维持秩序，无肢体冲突。',
      coreDemands: '快速平息舆情，落实稳控措施。',
      publicOpinionTrend: '线下秩序受控，现场围观人员陆续散去。',
      recommendations: ['保持现场警戒，密切关注网上二次发酵。']
    }
  },
  {
    id: 9,
    title: '西坝区某生鲜超市蔬菜农残超标网络投诉',
    source: '社交媒体',
    region: '西坝区',
    infoType: '民生诉求',
    author: '张三',
    organization: '西坝区市场监管局',
    submitTime: '2026-08-12 14:10',
    occurAddress: '西坝区人民路生鲜店',
    auditStatus: '待审核',
    score: '--'
  },
  {
    id: 10,
    title: '市属高新区产业政策落地效果专项舆情报告',
    source: '新闻网站',
    region: '全市',
    infoType: '政策解读',
    author: '钱十三',
    organization: '高新区管委会',
    submitTime: '2026-08-11 16:20',
    occurAddress: '高新区科技园区',
    auditStatus: '已采纳',
    score: 88
  },
  {
    id: 11,
    title: '全市中小学后勤膳食安全专项监督舆情',
    source: '群众举报',
    region: '南坝区',
    infoType: '突发事件',
    author: '郑十八',
    organization: '市教育局',
    submitTime: '2026-08-11 08:45',
    occurAddress: '南坝区实验中学食堂',
    auditStatus: '待审核',
    score: '--'
  }
];

export const INITIAL_AUDIT_PENDING: ReportItem[] = [
  {
    id: 101,
    title: '关于某社区突发停水事件的舆情上报',
    source: '群众举报',
    region: '西屯区',
    infoType: '突发事件',
    author: '张三',
    organization: '台中市网信办',
    submitTime: '2023-10-24 14:30',
    auditStatus: '待审核',
    matchUrl: 'https://news.example.com/',
    detailContent: {
      summary: '今日（10月24日）上午8时许，多名网民在微博、微信群反映XX区XX街道辖区内多个大型居民小区突发停水。经初步核查，受影响范围包括阳光花园、明月居等5个小区，涉及居民约3万人。',
      coreDemands: '网民普遍反映未接到停水通知，早高峰期间停水严重影响正常生活，部分网民情绪急躁，质疑供水部门应急处置能力。',
      publicOpinionTrend: '目前相关话题在本地区微博同城榜排名呈上升趋势，阅读量已突破10万。暂未发现大规模聚集性负面言论，但个别自媒体账号开始发布未经证实的“管道大面积破裂需要停水数日”的言论。',
      recommendations: [
        '建议区政府立即协调水务集团查明停水原因，并明确预计恢复供水时间。',
        '通过官方渠道（微博、微信公众号）紧急发布停水情况说明，澄清不实传言。',
        '若短时间内无法恢复，建议安排应急送水车前往受影响小区，保障居民基本用水需求。'
      ]
    },
    attachments: [
      { id: 'a1', name: '微博截图1.png', size: '1.2 MB', type: 'image' },
      { id: 'a2', name: '微信群截图.jpg', size: '850 KB', type: 'image' },
      { id: 'a3', name: '应急预案初稿.pdf', size: '2.4 MB', type: 'pdf' }
    ],
    timeline: [
      { title: '提交上报', operator: '张三·市委宣传部舆情科', time: '2023-10-24 09:30', status: 'completed' },
      { title: '主任审核', operator: '王主任·市委宣传部舆情科', status: 'current', note: '待审核' },
      { title: '部门转办', operator: '等待处理', status: 'pending' }
    ]
  },
  {
    id: 102,
    title: '台中市秋季旅游推广媒体传播分析',
    source: '新闻网站',
    region: '全市',
    infoType: '舆情动态',
    author: '李四',
    organization: '台中市网信办',
    submitTime: '2023-10-23 09:15',
    auditStatus: '待审核',
    matchUrl: 'https://news.example.com/'
  },
  {
    id: 103,
    title: '微信平台关于智慧城市建设的讨论热度分析',
    source: '社交媒体',
    region: '北屯区',
    infoType: '舆情动态',
    author: '王五',
    organization: '台中市网信办',
    submitTime: '2023-10-22 16:45',
    auditStatus: '待审核',
    matchUrl: 'https://news.example.com/'
  },
  {
    id: 104,
    title: '南屯区老旧小区改造政策解读及反馈收集',
    source: '政府官网',
    region: '南屯区',
    infoType: '政策解读',
    author: '赵六',
    organization: '台中市网信办',
    submitTime: '2023-10-22 10:20',
    auditStatus: '待审核',
    matchUrl: 'https://news.example.com/'
  },
  {
    id: 105,
    title: '某短视频平台涉及虚假宣传的群众举报核查',
    source: '群众举报',
    region: '西屯区',
    infoType: '突发事件',
    author: '孙七',
    organization: '台中市网信办',
    submitTime: '2023-10-21 15:55',
    auditStatus: '待审核',
    matchUrl: 'https://news.example.com/'
  },
  {
    id: 106,
    title: '全市双智协同系统运行情况月度分析报告',
    source: '内部系统',
    region: '全市',
    infoType: '舆情动态',
    author: '周八',
    organization: '台中市网信办',
    submitTime: '2023-10-21 09:00',
    auditStatus: '待审核'
  },
  {
    id: 107,
    title: '关于北屯区某路段交通拥堵的社交媒体热议',
    source: '社交媒体',
    region: '北屯区',
    infoType: '突发事件',
    author: '吴九',
    organization: '台中市网信办',
    submitTime: '2023-10-20 17:30',
    auditStatus: '待审核'
  },
  {
    id: 108,
    title: '全媒体传播环境下青少年网络安全教育调研',
    source: '新闻网站',
    region: '全市',
    infoType: '舆情动态',
    author: '郑十',
    organization: '台中市网信办',
    submitTime: '2023-10-20 11:15',
    auditStatus: '待审核'
  },
  {
    id: 109,
    title: '南屯区文化艺术节活动传播效果实时监测',
    source: '社交媒体',
    region: '南屯区',
    infoType: '舆情动态',
    author: '陈十一',
    organization: '台中市网信办',
    submitTime: '2023-10-19 14:40',
    auditStatus: '待审核'
  },
  {
    id: 110,
    title: '关于智慧交通系统升级的市民意见汇总',
    source: '群众举报',
    region: '全市',
    infoType: '政策解读',
    author: '林十二',
    organization: '台中市网信办',
    submitTime: '2023-10-19 09:30',
    auditStatus: '待审核'
  },
  {
    id: 111,
    title: '市属高新区产业政策落地效果专项舆情',
    source: '新闻网站',
    region: '高新区',
    infoType: '政策解读',
    author: '钱十三',
    organization: '高新区管委会',
    submitTime: '2023-10-18 16:20',
    auditStatus: '待审核'
  },
  {
    id: 112,
    title: '网络直播带货虚假宣传防范警示舆情线索',
    source: '社交媒体',
    region: '北屯区',
    infoType: '突发事件',
    author: '吴十七',
    organization: '市市场监管局',
    submitTime: '2023-10-18 14:15',
    auditStatus: '待审核'
  },
  {
    id: 113,
    title: '关于优化政务服务大厅窗口办事效率意见线索',
    source: '政府官网',
    region: '全市',
    infoType: '民生诉求',
    author: '周十六',
    organization: '市政务服务局',
    submitTime: '2023-10-17 11:30',
    auditStatus: '待审核'
  },
  {
    id: 114,
    title: '全市中小学后勤膳食安全专项监督紧急速报',
    source: '群众举报',
    region: '南屯区',
    infoType: '突发事件',
    author: '郑十八',
    organization: '市教育局',
    submitTime: '2023-10-16 09:20',
    auditStatus: '待审核'
  },
  {
    id: 115,
    title: '某公办幼儿园托育服务收费民意调查快报',
    source: '社交媒体',
    region: '西屯区',
    infoType: '民生诉求',
    author: '陈二十',
    organization: '西屯区教育局',
    submitTime: '2023-10-15 15:45',
    auditStatus: '待审核'
  }
];

export const INITIAL_AUDIT_RECORDS: AuditRecordItem[] = [
  { id: 1, title: '关于某社区突发停水事件的舆情上报', organization: '台中市网信办', submitter: '张三', submitTime: '2023-10-24 14:30', auditor: '李审核', auditorOrg: '市委网信办', auditResult: '已通过', auditTime: '2023-10-24 15:00', reportId: 1 },
  { id: 2, title: '台中市秋季旅游推广媒体传播分析', organization: '台中市网信办', submitter: '李四', submitTime: '2023-10-23 09:15', auditor: '王审核', auditorOrg: '市委宣传部舆情科', auditResult: '被驳回', auditTime: '2023-10-23 10:30', reportId: 2, rejectReason: '内容分析维度不全', rejectDetail: '缺少主流平台对比数据' },
  { id: 3, title: '关于城市交通拥堵治理的市民建议汇总', organization: '台中市交通局', submitter: '王五', submitTime: '2023-10-22 08:30', auditor: '张审核', auditorOrg: '市委网信办', auditResult: '已通过', auditTime: '2023-10-22 09:15', reportId: 3 },
  { id: 4, title: '某大型商场消防安全隐患排查报告', organization: '台中市消防支队', submitter: '赵六', submitTime: '2023-10-21 15:20', auditor: '刘审核', auditorOrg: '市委宣传部舆情科', auditResult: '被驳回', auditTime: '2023-10-21 16:45', reportId: 4, rejectReason: '佐证材料不足', rejectDetail: '需附现场整改通知单' },
  { id: 5, title: '年度文化惠民工程进展情况通报', organization: '台中市文化局', submitter: '孙七', submitTime: '2023-10-20 10:00', auditor: '陈审核', auditorOrg: '市委网信办', auditResult: '已通过', auditTime: '2023-10-20 11:20', reportId: 5 },
  { id: 6, title: '关于冬季供暖保障工作的舆情监测', organization: '台中市住建局', submitter: '周八', submitTime: '2023-10-19 13:45', auditor: '赵审核', auditorOrg: '市委网信办', auditResult: '已通过', auditTime: '2023-10-19 14:30', reportId: 6 },
  { id: 7, title: '食品安全周宣传活动效果评估', organization: '台中市食药监', submitter: '吴九', submitTime: '2023-10-18 09:10', auditor: '孙审核', auditorOrg: '市委宣传部舆情科', auditResult: '被驳回', auditTime: '2023-10-18 10:00', reportId: 7, rejectReason: '格式不规范', rejectDetail: '未按舆情专报模版排版' },
  { id: 8, title: '关于智慧城市建设二期工程的公示', organization: '台中市发改委', submitter: '郑十', submitTime: '2023-10-17 14:20', auditor: '周审核', auditorOrg: '市委网信办', auditResult: '已通过', auditTime: '2023-10-17 15:40', reportId: 8 },
  { id: 9, title: '全市中小学心理健康教育调研报告', organization: '台中市教育局', submitter: '陈十一', submitTime: '2023-10-16 08:50', auditor: '吴审核', auditorOrg: '市委网信办', auditResult: '已通过', auditTime: '2023-10-16 09:50', reportId: 9 },
  { id: 10, title: '关于加强老旧小区改造监管的通知', organization: '台中市房管局', submitter: '林十二', submitTime: '2023-10-15 11:30', auditor: '郑审核', auditorOrg: '市委宣传部舆情科', auditResult: '被驳回', auditTime: '2023-10-15 13:20', reportId: 10, rejectReason: '内容重复', rejectDetail: '与上周第089号专报内容雷同' }
];

export const INITIAL_NEGATIVE_INFO: ReportItem[] = [
  {
    id: 201,
    title: '关于某社区突发停水事件的舆情上报',
    source: '群众举报',
    region: '西屯区',
    infoType: '突发事件',
    author: '张三',
    organization: '台中市网信办',
    submitTime: '2023-10-24 14:30',
    auditStatus: '待转办',
    detailContent: {
      summary: '今日（10月24日）上午8时许，多名网民在微博、微信群反映XX区XX街道辖区内多个大型居民小区突发停水。经初步核查，受影响范围包括阳光花园、明月居等5个小区，涉及居民约3万人。',
      coreDemands: '网民普遍反映未接到停水通知，早高峰期间停水严重影响正常生活，部分网民情绪急躁，质疑供水部门应急处置能力。',
      publicOpinionTrend: '目前相关话题在本地区微博同城榜排名呈上升趋势，阅读量已突破10万。暂未发现大规模聚集性负面言论，但个别自媒体账号开始发布未经证实的“管道大面积破裂需要停水数日”的言论。',
      recommendations: [
        '建议区政府立即协调水务集团查明停水原因，并明确预计恢复供水时间。',
        '通过官方渠道（微博、微信公众号）紧急发布停水情况说明，澄清不实传言。',
        '若短时间内无法恢复，建议安排应急送水车前往受影响小区，保障居民基本用水需求。'
      ]
    },
    attachments: [
      { id: 'a1', name: '微博截图1.png', size: '1.2 MB', type: 'image' },
      { id: 'a2', name: '微信群截图.jpg', size: '850 KB', type: 'image' },
      { id: 'a3', name: '应急预案初稿.pdf', size: '2.4 MB', type: 'pdf' },
      { id: 'a4', name: '相关舆情专题网页', size: '网址', type: 'link', url: 'https://news.example.com/topic-water' }
    ],
    timeline: [
      { title: '提交上报', operator: '张三·市委宣传部舆情科', time: '2023-10-24 09:30', status: 'completed' },
      { title: '主任审核', operator: '王主任·市委宣传部舆情科', time: '2023-10-24 10:15', status: 'completed' },
      { title: '总部驳回', operator: '内容描述不详，请补充相关证明材料', time: '2023-10-24 14:00', status: 'rejected' },
      { title: '提交上报（重新提交）', operator: '张三·市委宣传部舆情科', time: '2023-10-24 15:30', status: 'completed' },
      { title: '主任审核', operator: '王主任·市委宣传部舆情科', time: '2023-10-24 16:10', status: 'completed' },
      { title: '总部审核', operator: '总部审核组', time: '2023-10-24 17:00', status: 'completed' },
      { title: '转办', operator: '处理中', time: '2023-10-24 17:30', status: 'current' }
    ]
  },
  {
    id: 202,
    title: '台中市秋季旅游推广媒体传播分析',
    source: '新闻网站',
    region: '全市',
    infoType: '舆情动态',
    author: '李四',
    organization: '台中市网信办',
    submitTime: '2023-10-23 09:15',
    auditStatus: '已转办'
  },
  {
    id: 203,
    title: '微信平台关于智慧城市建设的讨论热度分析',
    source: '社交媒体',
    region: '北屯区',
    infoType: '舆情动态',
    author: '王五',
    organization: '台中市网信办',
    submitTime: '2023-10-22 16:45',
    auditStatus: '待转办'
  },
  {
    id: 204,
    title: '南屯区老旧小区改造政策解读及反馈收集',
    source: '政府官网',
    region: '南屯区',
    infoType: '政策解读',
    author: '赵六',
    organization: '台中市网信办',
    submitTime: '2023-10-22 10:20',
    auditStatus: '已转办'
  },
  {
    id: 205,
    title: '某短视频平台涉及虚假宣传的群众举报核查',
    source: '群众举报',
    region: '西屯区',
    infoType: '突发事件',
    author: '孙七',
    organization: '台中市网信办',
    submitTime: '2023-10-21 15:55',
    auditStatus: '待转办'
  },
  {
    id: 206,
    title: '全市双智协同系统运行情况月度分析报告',
    source: '内部系统',
    region: '全市',
    infoType: '舆情动态',
    author: '周八',
    organization: '台中市网信办',
    submitTime: '2023-10-21 09:00',
    auditStatus: '已转办'
  },
  {
    id: 207,
    title: '关于北屯区某路段交通拥堵的社交媒体热议',
    source: '社交媒体',
    region: '北屯区',
    infoType: '突发事件',
    author: '吴九',
    organization: '台中市网信办',
    submitTime: '2023-10-20 17:30',
    auditStatus: '待转办'
  },
  {
    id: 208,
    title: '全媒体传播环境下青少年网络安全教育调研',
    source: '新闻网站',
    region: '全市',
    infoType: '舆情动态',
    author: '郑十',
    organization: '台中市网信办',
    submitTime: '2023-10-20 11:15',
    auditStatus: '已转办'
  },
  {
    id: 209,
    title: '南屯区文化艺术节活动传播效果实时监测',
    source: '社交媒体',
    region: '南屯区',
    infoType: '舆情动态',
    author: '陈十一',
    organization: '台中市网信办',
    submitTime: '2023-10-19 14:40',
    auditStatus: '待转办'
  },
  {
    id: 210,
    title: '关于智慧交通系统升级的市民意见汇总',
    source: '群众举报',
    region: '全市',
    infoType: '政策解读',
    author: '林十二',
    organization: '台中市网信办',
    submitTime: '2023-10-19 09:30',
    auditStatus: '已转办'
  }
];

export const INITIAL_EVALUATION: EvaluationItem[] = [
  { rank: 1, name: '政务部门', totalReports: 1240, passedReports: 1180, passRate: '95.2%', participants: 150, participationRate: '98%', totalScore: 5800 },
  { rank: 2, name: '医疗卫生', totalReports: 860, passedReports: 750, passRate: '87.2%', participants: 80, participationRate: '85%', totalScore: 3200 },
  { rank: 3, name: '教育机构', totalReports: 1100, passedReports: 980, passRate: '89.1%', participants: 120, participationRate: '92%', totalScore: 4500 },
  { rank: 4, name: '交通运输', totalReports: 650, passedReports: 580, passRate: '89.2%', participants: 60, participationRate: '80%', totalScore: 2600 },
  { rank: 5, name: '企业单位', totalReports: 420, passedReports: 350, passRate: '83.3%', participants: 45, participationRate: '75%', totalScore: 1500 }
];

export const INITIAL_ORG_USERS: OrgUser[] = [
  { id: 'u1', subOrg: '中共台中市委宣传部', account: 'admin_xcb', realName: '张建国', wechat: 'zjg1980', phone: '138****0001', role: '管理员', registerTime: '2023-10-01', status: '启用' },
  { id: 'u2', subOrg: '中共台中市委宣传部', account: 'lihua_bs', realName: '李华', wechat: 'lihua_work', phone: '139****8822', role: '报送员', registerTime: '2023-10-15', status: '启用' },
  { id: 'u3', subOrg: '中共台中市委宣传部', account: 'wangwei_old', realName: '王伟', wechat: 'ww_123', phone: '135****4455', role: '审核员', registerTime: '2023-11-02', status: '禁用' },
  { id: 'u4', subOrg: '中共台中市委宣传部', account: 'zhao_q', realName: '赵强', wechat: 'zq_work88', phone: '137****9911', role: '数据分析员', registerTime: '2023-12-05', status: '启用' }
];

export const INITIAL_TEMPLATES: TemplateItem[] = [
  { id: 't1', name: '标准图文报送模板', isSystemDefault: true, status: '启用', updateTime: '2023-10-24 10:00:00' },
  { id: 't2', name: '标准视频报送模板', isSystemDefault: true, status: '启用', updateTime: '2023-10-24 10:05:00' },
  { id: 't3', name: '突发事件快速上报', isSystemDefault: false, status: '启用', updateTime: '2023-11-02 14:30:22' },
  { id: 't4', name: '测试模板A', isSystemDefault: false, status: '停用', updateTime: '2023-11-10 09:15:00' }
];

export const INITIAL_ORGS: OrgItem[] = [
  { id: 1, code: 'ORG-101', name: '广域传媒主机构', parentOrg: '无', contactPerson: '张三', phone: '138****0001', status: '启用' },
  { id: 2, code: 'ORG-102', name: '台中市网信办', parentOrg: '广域传媒主机构', contactPerson: '李华', phone: '139****8822', status: '启用' },
  { id: 3, code: 'ORG-103', name: '西屯区宣传部', parentOrg: '台中市网信办', contactPerson: '王伟', phone: '135****4455', status: '启用' },
  { id: 4, code: 'ORG-104', name: '北屯区宣传部', parentOrg: '台中市网信办', contactPerson: '赵强', phone: '137****9911', status: '启用' },
  { id: 5, code: 'ORG-105', name: '南屯区宣传部', parentOrg: '台中市网信办', contactPerson: '陈明', phone: '136****2233', status: '启用' }
];

export const INITIAL_LOGS: LogItem[] = [
  { id: 1, operator: '.w.', organization: '市委宣传部舆情科', actionType: '登录系统', details: '用户登录系统', timestamp: '2023-11-24 09:00:12', ipAddress: '192.168.1.100', logType: '登录日志', content: '用户登录系统', result: '成功', time: '2023-11-24 09:00:12' },
  { id: 2, operator: '管理员', organization: '台中市网信办', actionType: '修改配置', details: '更新了“标准图文报送模板”', timestamp: '2023-11-24 10:15:45', ipAddress: '192.168.1.102', logType: '操作日志', content: '更新了“标准图文报送模板”', result: '成功', time: '2023-11-24 10:15:45' },
  { id: 3, operator: '.w.', organization: '市委宣传部舆情科', actionType: '删除数据', details: '尝试删除系统默认模板', timestamp: '2023-11-24 11:20:05', ipAddress: '192.168.1.100', logType: '操作日志', content: '尝试删除系统默认模板', result: '失败', time: '2023-11-24 11:20:05' },
  { id: 4, operator: '张三', organization: '西屯区宣传部', actionType: '登录系统', details: '用户主动退出登录', timestamp: '2023-11-24 14:45:30', ipAddress: '192.168.1.108', logType: '登录日志', content: '用户主动退出登录', result: '成功', time: '2023-11-24 14:45:30' }
];

export const initialReports = INITIAL_REPORTS;
export const initialAuditPending = INITIAL_AUDIT_PENDING;
export const initialAuditRecords = INITIAL_AUDIT_RECORDS;
export const initialNegativeInfo = INITIAL_NEGATIVE_INFO;
export const initialEvaluations = INITIAL_EVALUATION;
export const initialOrgs = INITIAL_ORGS;
export const initialOrgUsers = INITIAL_ORG_USERS;
export const initialTemplates = INITIAL_TEMPLATES;
export const initialLogs = INITIAL_LOGS;
