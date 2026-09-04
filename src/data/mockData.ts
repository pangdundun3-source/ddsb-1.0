import { ReportItem, AuditRecordItem, OrgItem, OrgUser, OrgNode, TemplateItem, LogItem, EvaluationItem, ReportTemplateDef } from '../types';

export const PRESET_REPORT_TEMPLATES: ReportTemplateDef[] = [
  {
    id: 'emergency',
    name: '突发事件急报模板',
    badge: '紧急快报',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    iconName: 'zap',
    description: '适用于自然灾害、安全事故、公共卫生及突发社会治安事件的紧急快速报送',
    recommendedFor: '第一发现人 / 网格员 / 应急指挥',
    defaultSource: '网格巡查',
    defaultRegion: '西屯区',
    defaultInfoType: '突发事件',
    defaultTitle: '【紧急】关于某路段突发管网故障抢修进展的快报',
    summaryTemplate: `【突发时间】：${new Date().toLocaleDateString('zh-CN')} ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
【事发精准地点】：西屯区XX路与XX街交叉口
【事件简述】：现场因市政施工突发管网渗漏，造成路面局部积水并影响早高峰通行。
【伤亡及损失情况】：现场无人员伤亡，周边已设立安全警戒线。
【当前处置进展】：抢修工程车辆及应急处置组已进场作业，正在进行分流抢修。`,
    demandsTemplate: '周边居民及过往车主高度关注积水排除与恢复通行的预计时间。',
    recommendationsTemplate: '1. 联动交警支队实施临时交通分流与道路交通疏导。\n2. 属地融媒体中心通过微信公众号发布临时通行提示，回应群众关切。'
  },
  {
    id: 'standard',
    name: '标准图文报送模板',
    badge: '常用推荐',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    iconName: 'file-text',
    description: '适用于日常综合舆情、社情民意核查及一般性事件的标准图文规范上报',
    recommendedFor: '各区县信息员 / 直属部门报送员',
    defaultSource: '群众举报',
    defaultRegion: '西屯区',
    defaultInfoType: '舆情动态',
    defaultTitle: '关于某社区居民集中反映公共设施老化问题的舆情动态',
    summaryTemplate: `一、基本事实概述：
近期多名市民在社交平台及微信群反映西屯区部分老旧住宅楼公共排污管道破损老化问题。

二、网络舆情发酵态势：
目前主要在社区业主群内传播讨论，暂无大规模负面舆情外溢。

三、部门初步核实：
属地街道与物业管理处已完成现场踏勘与登记。`,
    demandsTemplate: '业主普遍希望明确排污管网彻底维修翻新的时间节点与出资方案。',
    recommendationsTemplate: '1. 建议街道城管科联合物业召开现场业主代表沟通会。\n2. 在单元宣传栏公示维修进度与联系人电话。'
  },
  {
    id: 'livelihood',
    name: '民生诉求保障模板',
    badge: '民生专报',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    iconName: 'help',
    description: '针对教育、医疗、物业纠纷、交通出行等民生急难愁盼诉求的专项分析上报',
    recommendedFor: '12345热线对接 / 综合服务专员',
    defaultSource: '热线12345',
    defaultRegion: '北屯区',
    defaultInfoType: '民生诉求',
    defaultTitle: '关于某小区业主反映物业擅自调高公摊费用的诉求专报',
    summaryTemplate: `一、诉求来源与规模：
12345热线近3日内累计收到相关工单12件，涉及业主超过50户。

二、诉求核心事实：
业主反映物业管理处未履行公示与表决程序，直接在月度物业费账单中增列地下车库公共能耗费用。

三、初步调解情况：
社区居委会已介入搭建沟通平台，督促物业做好账目核算。`,
    demandsTemplate: '业主诉求要求暂缓收费、退回多扣费用，并公开公摊电量明细台账。',
    recommendationsTemplate: '1. 建议住建局物业监管科指导街道综治办介入监督。\n2. 督促物业公司严格按《物业管理条例》进行账务核算与公示。'
  },
  {
    id: 'rumor',
    name: '网络辟谣与核查模板',
    badge: '辟谣专报',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    iconName: 'shield',
    description: '针对短视频、微信群恶意摆拍、造谣传谣及虚假宣传的信息取证与官方辟谣',
    recommendedFor: '网信网安 / 辟谣专班',
    defaultSource: '社交媒体',
    defaultRegion: '全市',
    defaultInfoType: '网络谣言',
    defaultTitle: '关于短视频平台流传“某地突发重大事故”不实视频的核查与辟谣建议',
    summaryTemplate: `【谣言核查情况】：
1. 传播源头：抖音/快手个别账号发布标注为“本地突发大火”的短视频，引发部分网民点赞转发。
2. 权威核实：经向市应急管理局及消防救援支队核实，当日全市无此类险情，视频实为外省数年前旧闻拼接剪辑。
3. 危害评估：评论区存在误导性言论，容易引发公众恐慌。`,
    demandsTemplate: '广大网民期待官方查明真相，澄清事实，并对恶意造谣账号依法处置。',
    recommendationsTemplate: '1. 联合公安网安部门依法对首发账号及恶意推流者进行溯源固定证据。\n2. 由市网信办联合网警巡查执法账号发布权威辟谣声明。\n3. 协调各大平台对相关不实违规短视频进行限流与下架标记。'
  },
  {
    id: 'policy',
    name: '政策解读反馈模板',
    badge: '政策调研',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconName: 'book',
    description: '用于重大政策法规或惠民措施发布后，跟踪社会反响、焦点疑问与释疑引导',
    recommendedFor: '宣传部 / 政策研究室',
    defaultSource: '新闻网站',
    defaultRegion: '全市',
    defaultInfoType: '政策解读',
    defaultTitle: '关于《新一轮老旧小区改造补贴政策》发布后的社会反响与舆情专报',
    summaryTemplate: `一、政策发布背景与传播面：
自政策正式公布以来，各级主流媒体及政务发布平台累计转载报道30余篇次。

二、各方反馈焦点：
1. 赞成声音占比约70%，普遍认可政府改善人居环境的普惠举措。
2. 关切焦点集中在加装电梯出资比例及低楼层采光补偿指导标准（占比22%）。
3. 申报具体流程及办理时效咨询占8%。`,
    demandsTemplate: '希望出台更加细致的实操指引和问答手册（Q&A）。',
    recommendationsTemplate: '1. 组织专家和政策起草人开展线上“一图读懂”宣传解读。\n2. 设置区级政策咨询专窗，专人专岗解答群众疑惑。'
  }
];

export const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 1,
    title: '关于某社区突发停水事件的舆情上报',
    source: '群众举报',
    region: '西屯区',
    infoType: '突发事件',
    author: '张三',
    organization: '台中市网信办',
    submitTime: '2023-10-24 14:30',
    auditStatus: '被驳回',
    score: '--',
    matchUrl: 'https://news.example.com/water-outage',
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
      { id: 'a1', name: '微博截图1.png', size: '1.2 MB', type: 'image', thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&auto=format&fit=crop' },
      { id: 'a2', name: '微信群截图.jpg', size: '850 KB', type: 'image', thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop' },
      { id: 'a3', name: '应急预案初稿.pdf', size: '2.4 MB', type: 'pdf' },
      { id: 'a4', name: '相关舆情专题网页', size: '网址', type: 'link', url: 'https://news.example.com/topic-water' }
    ],
    timeline: [
      { title: '提交上报', operator: '张三·市委宣传部舆情科', time: '2023-10-24 09:30', status: 'completed' },
      { title: '主任审核', operator: '王主任·市委宣传部舆情科', time: '2023-10-24 10:15', status: 'completed' },
      { title: '部门转办', operator: '等待处理', status: 'current', note: '进行中' }
    ]
  },
  {
    id: 2,
    title: '台中市秋季旅游推广媒体传播分析',
    source: '新闻网站',
    region: '全市',
    infoType: '舆情动态',
    author: '李四',
    organization: '台中市网信办',
    submitTime: '2023-10-23 09:15',
    auditStatus: '已转办',
    score: 85,
    matchUrl: 'https://news.example.com/tour-autumn',
    detailContent: {
      summary: '全网各主渠道对台中市秋季赏枫与特色文旅路线进行大篇幅报道，整体口碑向好。',
      coreDemands: '提升景区交通接驳便利性，建议增加临时班次。',
      publicOpinionTrend: '各大旅游博主纷纷转发打卡，全网传播量累计达1200万次。',
      recommendations: [
        '加大大中型主流媒体针对文旅惠民政策的二次宣发。',
        '配合市交通局保障国庆旅游高峰交通运力。'
      ]
    },
    attachments: [
      { id: 'b1', name: '秋季旅游数据报告.pdf', size: '4.1 MB', type: 'pdf' }
    ],
    timeline: [
      { title: '提交上报', operator: '李四·台中市网信办', time: '2023-10-23 09:15', status: 'completed' },
      { title: '主任审核', operator: '王主任·台中市网信办', time: '2023-10-23 10:30', status: 'completed' }
    ]
  },
  {
    id: 3,
    title: '微信平台关于智慧城市建设的讨论热度分析',
    source: '社交媒体',
    region: '北屯区',
    infoType: '舆情动态',
    author: '王五',
    organization: '台中市网信办',
    submitTime: '2023-10-22 16:45',
    auditStatus: '已通过',
    detailContent: {
      summary: '智慧停车与便民服务App升级引起市民热烈讨论，正面评价占比88%。',
      coreDemands: '希望优化老年人便民UI与大字号关怀模式。',
      publicOpinionTrend: '互动量近3万次，总体趋势平稳向上。',
      recommendations: ['增加针对无障碍功能普及的图解指南。']
    }
  },
  {
    id: 4,
    title: '南屯区老旧小区改造政策解读及反馈收集',
    source: '政府官网',
    region: '南屯区',
    infoType: '政策解读',
    author: '赵六',
    organization: '台中市网信办',
    submitTime: '2023-10-22 10:20',
    auditStatus: '已转办',
    score: 78,
    detailContent: {
      summary: '收集到老旧小区加装电梯与绿化占地相关民意留言140余条。',
      coreDemands: '对出资比例和低层采光补偿标准表达关切。',
      publicOpinionTrend: '社区微信群讨论较为激烈。',
      recommendations: ['安排街道办组织线下听证会释疑解惑。']
    }
  },
  {
    id: 5,
    title: '某短视频平台涉及虚假宣传的群众举报核查',
    source: '群众举报',
    region: '西屯区',
    infoType: '突发事件',
    author: '孙七',
    organization: '台中市网信办',
    submitTime: '2023-10-21 15:55',
    auditStatus: '被驳回',
    score: '--',
    detailContent: {
      summary: '核查举报某带货主播夸大保健产品疗效的舆情线索。',
      coreDemands: '请求市场监管部门查处封停。',
      publicOpinionTrend: '已被视频平台清理违规视频。',
      recommendations: ['将违规账号移交市监局依法处理。']
    }
  },
  {
    id: 6,
    title: '全市双智协同系统运行情况月度分析报告',
    source: '内部系统',
    region: '全市',
    infoType: '舆情动态',
    author: '周八',
    organization: '台中市网信办',
    submitTime: '2023-10-21 09:00',
    auditStatus: '已通过'
  },
  {
    id: 7,
    title: '关于北屯区某路段交通拥堵的社交媒体热议',
    source: '社交媒体',
    region: '北屯区',
    infoType: '突发事件',
    author: '吴九',
    organization: '台中市网信办',
    submitTime: '2023-10-20 17:30',
    auditStatus: '已转办',
    score: 75
  },
  {
    id: 8,
    title: '全媒体传播环境下青少年网络安全教育调研',
    source: '新闻网站',
    region: '全市',
    infoType: '舆情动态',
    author: '郑十',
    organization: '台中市网信办',
    submitTime: '2023-10-20 11:15',
    auditStatus: '已通过'
  },
  {
    id: 9,
    title: '南屯区文化艺术节活动传播效果实时监测',
    source: '社交媒体',
    region: '南屯区',
    infoType: '舆情动态',
    author: '陈十一',
    organization: '台中市网信办',
    submitTime: '2023-10-19 14:40',
    auditStatus: '被驳回',
    score: '--'
  },
  {
    id: 10,
    title: '关于智慧交通系统升级的市民意见汇总',
    source: '群众举报',
    region: '全市',
    infoType: '政策解读',
    author: '林十二',
    organization: '台中市网信办',
    submitTime: '2023-10-19 09:30',
    auditStatus: '已转办',
    score: 82
  },
  {
    id: 11,
    title: '市属高新区产业政策落地效果专项舆情报告',
    source: '新闻网站',
    region: '高新区',
    infoType: '政策解读',
    author: '钱十三',
    organization: '高新区管委会',
    submitTime: '2023-10-18 16:20',
    auditStatus: '已通过'
  },
  {
    id: 12,
    title: '网民关于公共卫生应急体系建设的意见与建议',
    source: '群众举报',
    region: '全市',
    infoType: '民生诉求',
    author: '孙十四',
    organization: '市卫健委',
    submitTime: '2023-10-18 11:05',
    auditStatus: '已转办',
    score: 91
  },
  {
    id: 13,
    title: '某食品加工厂违规排放废气舆情快报',
    source: '社交媒体',
    region: '西屯区',
    infoType: '突发事件',
    author: '李十五',
    organization: '西屯区环保局',
    submitTime: '2023-10-17 17:40',
    auditStatus: '待转办',
    score: '--'
  },
  {
    id: 14,
    title: '关于优化政务服务大厅窗口办事情况监测',
    source: '政府官网',
    region: '全市',
    infoType: '民生诉求',
    author: '周十六',
    organization: '市政务服务局',
    submitTime: '2023-10-17 10:12',
    auditStatus: '已转办',
    score: 84
  },
  {
    id: 15,
    title: '网络直播带货虚假宣传防范警示舆情速报',
    source: '社交媒体',
    region: '北屯区',
    infoType: '舆情动态',
    author: '吴十七',
    organization: '市市场监管局',
    submitTime: '2023-10-16 15:30',
    auditStatus: '已转办',
    score: 89
  },
  {
    id: 16,
    title: '全市中小学后勤膳食安全专项监督舆情',
    source: '群众举报',
    region: '南屯区',
    infoType: '突发事件',
    author: '郑十八',
    organization: '市教育局',
    submitTime: '2023-10-16 08:45',
    auditStatus: '已通过'
  },
  {
    id: 17,
    title: '市文旅局关于中秋国庆假期文化活动总结速报',
    source: '新闻网站',
    region: '全市',
    infoType: '舆情动态',
    author: '王十九',
    organization: '市文旅局',
    submitTime: '2023-10-15 14:10',
    auditStatus: '已通过'
  },
  {
    id: 18,
    title: '某公办幼儿园托育服务收费民意调查',
    source: '社交媒体',
    region: '西屯区',
    infoType: '民生诉求',
    author: '陈二十',
    organization: '西屯区教育局',
    submitTime: '2023-10-15 09:20',
    auditStatus: '已通过'
  },
  {
    id: 19,
    title: '市交警大队关于智能交通信号灯优化反馈',
    source: '政府官网',
    region: '全市',
    infoType: '政策解读',
    author: '刘二十一',
    organization: '市公安交警支队',
    submitTime: '2023-10-14 16:50',
    auditStatus: '已通过'
  },
  {
    id: 20,
    title: '关于某地产项目延期交房引发业主维权舆情',
    source: '群众举报',
    region: '北屯区',
    infoType: '突发事件',
    author: '赵二十二',
    organization: '北屯区住建局',
    submitTime: '2023-10-14 11:30',
    auditStatus: '待转办',
    score: '--'
  },
  {
    id: 21,
    title: '关于老旧小区加装电梯政策宣传的舆情素材整理（草稿）',
    source: '网格巡查',
    region: '西屯区',
    infoType: '民生诉求',
    author: '张三',
    organization: '台中市网信办',
    submitTime: '2023-10-24 09:20',
    auditStatus: '草稿',
    detailContent: {
      summary: '近期多个老旧小区业主群讨论加装电梯政策，暂未形成统一诉求口径，待补充具体小区案例与居民反馈截图后再送审。',
      coreDemands: '待进一步收集居民关于加装电梯流程、费用分摊与采光影响的具体意见。',
      publicOpinionTrend: '相关讨论热度温和上升，暂未出现集中负面舆情。',
      recommendations: [
        '1. 走访重点小区收集具体案例素材。',
        '2. 整理政策问答口径后补充佐证材料再提交送审。'
      ]
    }
  },
  {
    id: 22,
    title: '秋季文旅消费惠民活动传播效果评估（草稿）',
    source: '内部系统',
    region: '全市',
    infoType: '舆情动态',
    author: '张三',
    organization: '台中市网信办',
    submitTime: '2023-10-23 17:40',
    auditStatus: '草稿',
    detailContent: {
      summary: '活动开展一周以来各平台阅读量稳步上升，正面评价占比较高，待补充各渠道传播数据报表后再提交送审。',
      coreDemands: '建议追加惠民活动第二批宣传排期，并汇总市民参与反馈。',
      publicOpinionTrend: '整体态势正面可控，暂未发现明显负面话题。',
      recommendations: [
        '1. 汇总抖音、微博、微信等渠道传播数据。',
        '2. 补充现场活动照片后重新提交送审。'
      ]
    }
  },
  {
    id: 25,
    title: '西屯区老旧小区加装电梯政策反馈汇总',
    source: '网格巡查',
    region: '西屯区',
    infoType: '民生诉求',
    author: '张三',
    organization: '广域传媒主机构 / 台中市网信办 / 西屯区宣传部',
    submitTime: '2026-08-27 16:20',
    auditStatus: '已采纳',
    score: 92,
    detailContent: {
      summary: '汇总西屯区 6 个老旧小区居民对加装电梯费用分摊、施工周期和采光影响的意见，共收集有效反馈 186 条。',
      coreDemands: '居民希望公开费用测算依据，明确低楼层补偿标准，并提供统一办理流程。',
      publicOpinionTrend: '讨论整体理性，政策解释发布后正向反馈有所增加。',
      recommendations: ['建议住建部门发布标准化政策问答，并安排街道开展现场咨询。']
    }
  },
  {
    id: 26,
    title: '北屯区校园周边早高峰交通疏导成效评估',
    source: '社交媒体',
    region: '北屯区',
    infoType: '舆情动态',
    author: '张三',
    organization: '广域传媒主机构 / 台中市网信办 / 北屯区宣传部',
    submitTime: '2026-08-26 14:05',
    auditStatus: '已采纳',
    score: 95,
    detailContent: {
      summary: '跟踪北屯区 4 所学校周边早高峰通行情况，新增临时接送区后，拥堵持续时间平均减少 18 分钟。',
      coreDemands: '家长建议继续优化人车分流标识，并延长重点路口执勤时间。',
      publicOpinionTrend: '相关话题正向评价占比提升，投诉量较上周下降。',
      recommendations: ['建议交警和学校建立高峰时段联动巡查机制。']
    }
  },
  {
    id: 27,
    title: '市民服务热线集中诉求办理情况专题速报',
    source: '热线12345',
    region: '全市',
    infoType: '民生诉求',
    author: '张三',
    organization: '广域传媒主机构 / 台中市网信办 / 舆情监测中心',
    submitTime: '2026-08-25 11:40',
    auditStatus: '已采纳',
    score: 88,
    detailContent: {
      summary: '对近期市民服务热线高频诉求进行聚类分析，主要集中在停车管理、公共设施维护和物业服务三个方面。',
      coreDemands: '市民希望提高跨部门工单流转效率，并及时公开办理进展。',
      publicOpinionTrend: '诉求数量总体平稳，个别热点事项存在二次传播风险。',
      recommendations: ['建议对重复来电和高频区域建立专项督办清单。']
    }
  },
  {
    id: 28,
    title: '南屯区文化惠民活动网络传播效果分析',
    source: '新闻网站',
    region: '南屯区',
    infoType: '舆情动态',
    author: '张三',
    organization: '广域传媒主机构 / 台中市网信办 / 南屯区宣传部',
    submitTime: '2026-08-24 09:35',
    auditStatus: '已采纳',
    score: 90,
    detailContent: {
      summary: '南屯区文化惠民活动在主流媒体和短视频平台形成协同传播，累计曝光量约 520 万次。',
      coreDemands: '群众建议增加公益演出场次，并扩大基层社区参与范围。',
      publicOpinionTrend: '整体口碑良好，活动信息转发和报名热度持续上升。',
      recommendations: ['建议保留线上预约入口，并同步发布无障碍参与指引。']
    }
  },
  {
    id: 29,
    title: '全市防汛排涝工作舆情监测快报',
    source: '政府官网',
    region: '全市',
    infoType: '突发事件',
    author: '张三',
    organization: '广域传媒主机构 / 台中市网信办 / 应急联络组',
    submitTime: '2026-08-23 18:10',
    auditStatus: '已采纳',
    score: 96,
    detailContent: {
      summary: '针对连续强降雨期间积水点、排水设施和应急响应情况开展网络舆情监测，未发现大范围负面扩散。',
      coreDemands: '居民关注重点路段积水处置时效和临时交通管制信息发布。',
      publicOpinionTrend: '权威部门及时回应后，相关讨论热度明显回落。',
      recommendations: ['建议持续发布积水点动态和道路通行提示。']
    }
  },
  {
    id: 30,
    title: '政务服务大厅窗口服务体验调查报告',
    source: '群众举报',
    region: '全市',
    infoType: '民生诉求',
    author: '张三',
    organization: '广域传媒主机构 / 台中市网信办 / 政务服务联络组',
    submitTime: '2026-08-22 15:25',
    auditStatus: '已采纳',
    score: 86,
    detailContent: {
      summary: '收集市民对政务服务大厅窗口办理效率、材料一次性告知和线上预约体验的评价，共回收问卷 420 份。',
      coreDemands: '群众希望减少重复提交材料，并加强老年人线下帮办服务。',
      publicOpinionTrend: '总体评价稳定，个别窗口排队问题受到短时关注。',
      recommendations: ['建议优化高峰期窗口排班，增加帮办导办人员。']
    }
  },
  {
    id: 31,
    title: '公共停车资源优化调整政策解读反馈',
    source: '政府官网',
    region: '西屯区',
    infoType: '政策解读',
    author: '张三',
    organization: '广域传媒主机构 / 台中市网信办 / 西屯区交通科',
    submitTime: '2026-08-21 10:50',
    auditStatus: '已采纳',
    score: 91,
    detailContent: {
      summary: '围绕公共停车资源优化调整方案开展政策解读和民意收集，重点关注收费标准、夜间停车和共享车位安排。',
      coreDemands: '居民希望提前公布收费规则，并保留一定数量的短时免费车位。',
      publicOpinionTrend: '政策说明发布后疑问量下降，整体舆情可控。',
      recommendations: ['建议公布停车资源分布图和分时段收费明细。']
    }
  },
  {
    id: 32,
    title: '青少年网络安全教育活动阶段性总结',
    source: '内部系统',
    region: '北屯区',
    infoType: '舆情动态',
    author: '张三',
    organization: '广域传媒主机构 / 台中市网信办 / 北屯区教育科',
    submitTime: '2026-08-20 13:15',
    auditStatus: '已采纳',
    score: 94,
    detailContent: {
      summary: '网络安全教育活动覆盖 12 所中小学，累计参与师生超过 8600 人，线上专题页面互动积极。',
      coreDemands: '学校建议增加家长端安全教育材料，并提供常见风险案例库。',
      publicOpinionTrend: '活动相关内容正向传播明显，未发现争议性舆情。',
      recommendations: ['建议将优秀课程纳入常态化校园宣传安排。']
    }
  },
  {
    id: 33,
    title: '西屯区供水保障舆情快报',
    source: '群众举报',
    region: '西屯区',
    infoType: '突发事件',
    author: '张三',
    organization: '广域传媒主机构 / 台中市网信办 / 西屯区宣传部 / 西屯区水务科',
    submitTime: '2026-08-18 09:20',
    auditStatus: '已采纳',
    score: 93,
    auditor: '赵宁',
    auditTime: '2026-08-18 16:40',
    detailContent: {
      summary: '围绕西屯区部分小区供水压力不足问题开展连续跟踪，经过多轮补充核查后形成最终舆情快报。',
      coreDemands: '居民希望公开抢修进度、临时供水安排和恢复时间。',
      publicOpinionTrend: '初期讨论热度较高，官方发布处置进展后逐步回落。',
      recommendations: ['建议水务部门完善突发供水事件的信息发布和居民沟通机制。']
    },
    timeline: [
      { title: '提交上报', operator: '张三·西屯区水务科', time: '2026-08-18 09:20', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-08-18 10:00', status: 'rejected', note: '信息不完整，请补充停水范围、影响人数和现场核查记录。' },
      { title: '提交上报（重新提交）', operator: '张三·西屯区水务科', time: '2026-08-18 11:10', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-08-18 13:30', status: 'rejected', note: '佐证不足，请补充水务部门通报和居民反馈截图。' },
      { title: '提交上报（重新提交）', operator: '张三·西屯区水务科', time: '2026-08-18 14:20', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-08-18 15:00', status: 'completed', note: '初审通过，进入复核。' },
      { title: '审核处理', operator: '李明·市网信办复核组', time: '2026-08-18 15:50', status: 'completed', note: '复核通过。' },
      { title: '审核处理', operator: '赵宁·市网信办终审组', time: '2026-08-18 16:40', score: 93, status: 'completed', note: '终审通过。' },
      { title: '结束', operator: '流程结束·责任单位转办台账', time: '2026-08-18 17:10', status: 'completed', note: '已采纳。' }
    ]
  },
  {
    id: 34,
    title: '北屯区校园周边交通治理专题',
    source: '网格巡查',
    region: '北屯区',
    infoType: '民生诉求',
    author: '张三',
    organization: '广域传媒主机构 / 台中市网信办 / 北屯区宣传部 / 北屯区教育科',
    submitTime: '2026-08-17 08:45',
    auditStatus: '已采纳',
    score: 90,
    auditor: '赵宁',
    auditTime: '2026-08-17 18:20',
    detailContent: {
      summary: '针对开学阶段校园周边拥堵、临时停车和接送秩序问题进行多轮补充调查，形成综合治理建议。',
      coreDemands: '家长希望优化接送区、增加高峰执勤力量并明确绕行路线。',
      publicOpinionTrend: '多次现场核查后，相关讨论从投诉表达转为方案建议。',
      recommendations: ['建议交警、学校和街道共同完善校园周边高峰交通组织方案。']
    },
    timeline: [
      { title: '提交上报', operator: '张三·北屯区教育科', time: '2026-08-17 08:45', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-08-17 09:30', status: 'rejected', note: '非本辖区职责，请明确学校、道路和责任单位归属。' },
      { title: '提交上报（重新提交）', operator: '张三·北屯区教育科', time: '2026-08-17 10:15', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-08-17 11:40', status: 'rejected', note: '内容重复，请合并同一路段的重复反馈并补充现场时段。' },
      { title: '提交上报（重新提交）', operator: '张三·北屯区教育科', time: '2026-08-17 13:05', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-08-17 14:10', status: 'completed', note: '初审通过。' },
      { title: '审核处理', operator: '李明·市网信办复核组', time: '2026-08-17 16:30', status: 'rejected', note: '数据口径不一致，请统一拥堵时段、车流量和现场统计口径。' },
      { title: '提交上报（重新提交）', operator: '张三·北屯区教育科', time: '2026-08-17 17:05', status: 'completed' },
      { title: '审核处理', operator: '李明·市网信办复核组', time: '2026-08-17 17:40', status: 'completed', note: '复核通过。' },
      { title: '审核处理', operator: '赵宁·市网信办终审组', time: '2026-08-17 18:20', score: 90, status: 'completed', note: '终审通过。' },
      { title: '结束', operator: '流程结束·责任单位转办台账', time: '2026-08-17 18:50', status: 'completed', note: '已采纳。' }
    ]
  },
  {
    id: 35,
    title: '南屯区公共停车资源调整反馈',
    source: '政府官网',
    region: '南屯区',
    infoType: '政策解读',
    author: '张三',
    organization: '广域传媒主机构 / 台中市网信办 / 南屯区宣传部 / 南屯区交通科',
    submitTime: '2026-08-16 10:05',
    auditStatus: '已采纳',
    score: 87,
    auditor: '赵宁',
    auditTime: '2026-08-16 17:25',
    detailContent: {
      summary: '围绕公共停车收费、夜间停车和共享车位政策收集居民反馈，经过多次退回补充后完成最终报送。',
      coreDemands: '居民希望提前公示收费规则，保留短时停车优惠并优化重点区域停车指引。',
      publicOpinionTrend: '政策解读发布后疑问量逐步减少，整体舆情保持平稳。',
      recommendations: ['建议同步发布停车资源分布图、收费明细和咨询办理渠道。']
    },
    timeline: [
      { title: '提交上报', operator: '张三·南屯区交通科', time: '2026-08-16 10:05', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-08-16 10:50', status: 'rejected', note: '政策依据不充分，请补充正式发布的政策文件和条款出处。' },
      { title: '提交上报（重新提交）', operator: '张三·南屯区交通科', time: '2026-08-16 12:10', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-08-16 13:20', status: 'rejected', note: '信息不完整，请补充不同群体对收费调整方案的具体反馈。' },
      { title: '提交上报（重新提交）', operator: '张三·南屯区交通科', time: '2026-08-16 14:00', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-08-16 14:45', status: 'completed', note: '初审通过。' },
      { title: '审核处理', operator: '李明·市网信办复核组', time: '2026-08-16 16:10', status: 'rejected', note: '建议表述过于笼统，请补充可执行的分时停车和信息公开措施。' },
      { title: '提交上报（重新提交）', operator: '张三·南屯区交通科', time: '2026-08-16 16:45', status: 'completed' },
      { title: '审核处理', operator: '李明·市网信办复核组', time: '2026-08-16 17:00', status: 'completed', note: '复核通过。' },
      { title: '审核处理', operator: '赵宁·市网信办终审组', time: '2026-08-16 17:25', score: 87, status: 'completed', note: '终审通过。' },
      { title: '结束', operator: '流程结束·责任单位转办台账', time: '2026-08-16 17:50', status: 'completed', note: '已采纳。' }
    ]
  },
  {
    id: 23,
    title: '老旧小区供水保障舆情专题',
    source: '群众举报',
    region: '西屯区',
    infoType: '突发事件',
    author: '王五',
    organization: '广域传媒主机构 / 台中市网信办 / 西屯区宣传部 / 西屯区水务科',
    submitTime: '2026-08-12 16:45',
    auditStatus: '已采纳',
    score: 95,
    rejectReason: '信息不完整',
    rejectDetail: '请补充权威媒体报道链接与现场核查截图。',
    auditor: '赵宁',
    auditTime: '2026-08-12 18:00',
    transferTime: '2026-08-12 19:00',
    transferOpinion: '已转责任单位跟进处置并反馈结果。',
    detailContent: {
      summary: '西屯区多个老旧小区出现阶段性供水压力不足，居民通过微博和社区群集中反馈，相关话题热度在本地持续上升。',
      coreDemands: '居民希望尽快明确恢复时间，并公开应急供水安排和后续保障措施。',
      publicOpinionTrend: '舆情以诉求表达为主，暂未出现线下聚集，建议持续关注权威通报和居民反馈。',
      recommendations: [
        '协调水务部门核实管网和供水压力情况。',
        '通过官方渠道发布处置进展和恢复时间。',
        '建立责任单位跟进台账，按节点反馈办理结果。'
      ]
    },
    timeline: [
      { title: '提交上报', operator: '王五·西屯区宣传部', time: '2026-08-12 16:45', status: 'completed' },
      { title: '提交上报（重新提交）', operator: '王五·西屯区宣传部', time: '2026-08-12 17:15', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-08-12 17:22', status: 'rejected', note: '信息不完整：请补充权威媒体报道链接与现场核查截图。' },
      { title: '提交上报（重新提交）', operator: '王五·西屯区宣传部', time: '2026-08-12 17:35', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-08-12 17:45', status: 'completed', note: '初审通过，进入市网信办复核组。' },
      { title: '审核处理', operator: '李明·市网信办复核组', time: '2026-08-12 17:52', status: 'completed', note: '复核通过。' },
      { title: '审核处理', operator: '赵宁·市网信办终审组', time: '2026-08-12 18:00', score: 95, status: 'completed', note: '终审通过。' },
      { title: '结束', operator: '流程结束·责任单位转办台账', time: '2026-08-12 19:00', status: 'completed', note: '已采纳，已转责任单位跟进。' }
    ]
  },
  {
    id: 36,
    title: '西屯区应急供水舆情补充报送',
    source: '群众举报',
    region: '西屯区',
    infoType: '突发事件',
    author: '张三',
    organization: '广域传媒主机构 / 台中市网信办 / 西屯区宣传部 / 西屯区水务科',
    submitTime: '2026-09-02 09:10',
    auditStatus: '已采纳',
    score: 94,
    auditor: '赵宁',
    auditTime: '2026-09-02 15:00',
    detailContent: {
      summary: '围绕西屯区应急供水安排、居民反馈和抢修进度开展连续核查，经过多次补充修改后形成最终报送。',
      coreDemands: '居民希望公开临时供水点、抢修时间表和恢复供水进度。',
      publicOpinionTrend: '初期讨论热度较高，官方发布处置进展后逐步回落，未形成持续扩散。',
      recommendations: [
        '建议水务部门按小时更新抢修进度和临时供水安排。',
        '建议街道同步收集重点小区居民反馈并形成闭环记录。'
      ]
    },
    timeline: [
      { title: '提交上报', operator: '张三·西屯区水务科', time: '2026-09-02 09:10', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-09-02 09:35', status: 'rejected', note: '信息不完整，请补充受影响小区清单、影响人数和现场核查记录。' },
      { title: '提交上报（重新提交）', operator: '张三·西屯区水务科', time: '2026-09-02 10:20', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-09-02 11:00', status: 'rejected', note: '佐证不足，请补充水务部门通报、抢修工单和居民反馈截图。' },
      { title: '提交上报（重新提交）', operator: '张三·西屯区水务科', time: '2026-09-02 12:05', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-09-02 12:30', status: 'completed', note: '初审通过，进入市网信办复核组。' },
      { title: '审核处理', operator: '李明·市网信办复核组', time: '2026-09-02 13:10', status: 'rejected', note: '数据口径不一致，请统一受影响小区数量、居民人数和恢复时间。' },
      { title: '提交上报（重新提交）', operator: '张三·西屯区水务科', time: '2026-09-02 14:00', status: 'completed' },
      { title: '审核处理', operator: '李明·市网信办复核组', time: '2026-09-02 14:30', status: 'completed', note: '复核通过，提交终审。' },
      { title: '审核处理', operator: '赵宁·市网信办终审组', time: '2026-09-02 15:00', score: 94, status: 'completed', note: '终审通过。' },
      { title: '结束', operator: '流程结束·责任单位转办台账', time: '2026-09-02 15:20', status: 'completed', note: '已采纳。' }
    ]
  },
  {
    id: 37,
    title: '南屯区停车政策反馈汇总',
    source: '政府官网',
    region: '南屯区',
    infoType: '政策解读',
    author: '张三',
    organization: '广域传媒主机构 / 台中市网信办 / 南屯区宣传部 / 南屯区交通科',
    submitTime: '2026-09-01 10:00',
    auditStatus: '已采纳',
    score: 89,
    auditor: '赵宁',
    auditTime: '2026-09-01 16:10',
    detailContent: {
      summary: '汇总南屯区停车收费、夜间停车和共享车位政策反馈，经过初审和复核阶段多次退回补充后完成报送。',
      coreDemands: '居民希望明确收费标准、短时停车优惠和重点区域停车引导方案。',
      publicOpinionTrend: '政策发布初期咨询量明显增加，补充说明发布后相关讨论逐步趋于平稳。',
      recommendations: [
        '建议同步公开分时收费明细、停车资源分布图和咨询渠道。',
        '建议对重点商圈设置短时停车缓冲区并持续评估。'
      ]
    },
    timeline: [
      { title: '提交上报', operator: '张三·南屯区交通科', time: '2026-09-01 10:00', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-09-01 10:30', status: 'rejected', note: '政策依据不充分，请补充正式发布的政策文件和条款出处。' },
      { title: '提交上报（重新提交）', operator: '张三·南屯区交通科', time: '2026-09-01 11:20', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-09-01 12:00', status: 'completed', note: '初审通过，进入复核。' },
      { title: '审核处理', operator: '李明·市网信办复核组', time: '2026-09-01 13:20', status: 'rejected', note: '建议表述过于笼统，请补充不同群体反馈和可执行的分时停车措施。' },
      { title: '提交上报（重新提交）', operator: '张三·南屯区交通科', time: '2026-09-01 14:10', status: 'completed' },
      { title: '审核处理', operator: '李明·市网信办复核组', time: '2026-09-01 15:00', status: 'completed', note: '复核通过，提交终审。' },
      { title: '审核处理', operator: '赵宁·市网信办终审组', time: '2026-09-01 16:10', score: 89, status: 'completed', note: '终审通过。' },
      { title: '结束', operator: '流程结束·责任单位转办台账', time: '2026-09-01 16:30', status: 'completed', note: '已采纳。' }
    ]
  },
  {
    id: 24,
    title: '北屯区校园周边交通疏导',
    source: '网格巡查',
    region: '北屯区',
    infoType: '民生诉求',
    author: '李华',
    organization: '广域传媒主机构 / 台中市网信办 / 北屯区宣传部 / 北屯区教育科',
    submitTime: '2026-08-13 09:10',
    auditStatus: '待审核',
    score: '--',
    detailContent: {
      summary: '开学后校园周边早高峰拥堵加剧，家长和周边居民集中反映接送车辆临时停靠影响通行。',
      coreDemands: '建议增加早高峰执勤力量，优化临时停车和人车分流安排。',
      publicOpinionTrend: '相关讨论热度温和上升，暂未出现明显负面扩散。',
      recommendations: ['建议交警、教育和街道联合核查并发布疏导安排。']
    },
    timeline: [
      { title: '提交上报', operator: '李华·北屯区教育科', time: '2026-08-13 09:10', status: 'completed' },
      { title: '审核处理', operator: '待审核·市委宣传部舆情科', status: 'current', note: '待审核' },
      { title: '审核处理', operator: '李明·市网信办复核组', status: 'pending', note: '等待处理' },
      { title: '审核处理', operator: '赵宁·市网信办终审组', status: 'pending', note: '等待处理' },
      { title: '结束', operator: '流程结束', status: 'pending', note: '等待结论' }
    ]
  },
  {
    id: 25,
    title: '关于西坝区某在建工地夜间施工噪声扰民的核查专报',
    source: '热线12345',
    region: '西坝区',
    infoType: '民生诉求',
    author: '周婷',
    organization: '台中市网信办',
    submitTime: '2026-08-20 09:10',
    auditStatus: '已转办',
    score: 87,
    auditor: '赵宁',
    auditTime: '2026-08-22 09:30',
    transferTime: '2026-08-22 10:40',
    transferOpinion: '移交市生态环境局噪声执法专班跟进处置。',
    detailContent: {
      summary: '西坝区多个住宅小区业主集中反映附近在建工地连续多晚超时施工，噪声影响夜间休息，12345热线累计收到工单16件。',
      coreDemands: '要求住建、生态环境部门核查夜间施工许可，并加强现场巡查和处罚公示。',
      publicOpinionTrend: '业主群内讨论热度较高，暂未出现线下聚集，个别短视频账号开始转发未经核实的施工现场视频。',
      recommendations: [
        '1. 联合住建、生态环境部门开展夜间施工专项核查。',
        '2. 通过官方渠道通报核查结果与整改时限，回应群众关切。'
      ]
    },
    timeline: [
      { title: '提交上报', operator: '周婷·台中市网信办', time: '2026-08-20 09:10', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-08-20 11:00', status: 'rejected', note: '佐证不足：缺少夜间施工时间截图与现场噪音分贝记录，请补充后重新提交。' },
      { title: '提交上报（重新提交）', operator: '周婷·台中市网信办', time: '2026-08-21 10:20', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-08-21 15:40', status: 'completed', note: '初审通过，进入复核。' },
      { title: '审核处理', operator: '李明·市网信办复核组', time: '2026-08-21 17:10', status: 'completed', note: '复核通过，提交终审。' },
      { title: '审核处理', operator: '赵宁·市网信办终审组', time: '2026-08-22 09:30', score: 87, status: 'completed', note: '终审通过。' },
      { title: '结束', operator: '流程结束·责任单位转办台账', time: '2026-08-22 10:40', status: 'completed', note: '已采纳，已转责任单位跟进。' }
    ]
  },
  {
    id: 26,
    title: '关于短视频平台流传“某景区缆车故障”不实视频的辟谣专报',
    source: '社交媒体',
    region: '全市',
    infoType: '网络谣言',
    author: '吴倩',
    organization: '台中市网信办',
    submitTime: '2026-08-25 14:20',
    auditStatus: '待转办',
    score: 91,
    auditor: '赵宁',
    auditTime: '2026-08-26 16:10',
    detailContent: {
      summary: '短视频平台多个账号转发标注为“本地某景区缆车突发故障致游客滞留”的视频，经景区管理方与市场监管部门核实系外省旧闻拼接剪辑。',
      coreDemands: '希望官方尽快发布辟谣声明，并对造谣引流账号依法处置。',
      publicOpinionTrend: '相关话题在本地同城榜热度上升，评论区已出现恐慌情绪与不实猜测。',
      recommendations: [
        '1. 联合网安部门固定证据并处置首发造谣账号。',
        '2. 由景区和文旅部门发布权威辟谣说明。'
      ]
    },
    timeline: [
      { title: '提交上报', operator: '吴倩·台中市网信办', time: '2026-08-25 14:20', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-08-25 16:00', status: 'rejected', note: '信息要素不完整：未附景区官方核实回执与原始视频比对链接，请补充后重新提交。' },
      { title: '提交上报（重新提交）', operator: '吴倩·台中市网信办', time: '2026-08-26 09:30', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-08-26 11:20', status: 'completed', note: '初审通过，进入复核。' },
      { title: '审核处理', operator: '李明·市网信办复核组', time: '2026-08-26 14:00', status: 'completed', note: '复核通过，提交终审。' },
      { title: '审核处理', operator: '赵宁·市网信办终审组', time: '2026-08-26 16:10', score: 91, status: 'completed', note: '终审通过。' },
      { title: '结束', operator: '流程结束·责任单位转办台账', time: '2026-08-26 16:40', status: 'completed', note: '已采纳，进入不良信息库待转办。' }
    ]
  },
  {
    id: 27,
    title: '关于某直播间夸大保健品功效涉嫌虚假宣传的舆情专报',
    source: '群众举报',
    region: '西屯区',
    infoType: '舆情动态',
    author: '郑凯',
    organization: '台中市网信办',
    submitTime: '2026-08-28 10:00',
    auditStatus: '已转办',
    score: 84,
    auditor: '赵宁',
    auditTime: '2026-08-29 15:50',
    transferTime: '2026-08-29 17:00',
    transferOpinion: '移交市市场监督管理局网络交易监管科依法处置。',
    detailContent: {
      summary: '多名消费者举报某直播间宣称“降压降糖特效”保健品，涉嫌夸大功效与虚假宣传，涉事账号粉丝量较大。',
      coreDemands: '要求市场监管部门核查产品资质与宣传内容，并对违规直播间依法处理。',
      publicOpinionTrend: '举报信息在消费者维权群扩散，部分老人家属表达担忧，舆情风险中等。',
      recommendations: [
        '1. 市场监管部门固定直播回放与商品链接证据。',
        '2. 指导平台对涉事账号限流或下架。'
      ]
    },
    timeline: [
      { title: '提交上报', operator: '郑凯·台中市网信办', time: '2026-08-28 10:00', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-08-28 14:30', status: 'rejected', note: '举报要素不全：缺少直播回放链接与购买凭证截图，请补充后重新提交。' },
      { title: '提交上报（重新提交）', operator: '郑凯·台中市网信办', time: '2026-08-29 09:00', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-08-29 11:10', status: 'completed', note: '初审通过，进入复核。' },
      { title: '审核处理', operator: '李明·市网信办复核组', time: '2026-08-29 13:40', status: 'completed', note: '复核通过，提交终审。' },
      { title: '审核处理', operator: '赵宁·市网信办终审组', time: '2026-08-29 15:50', score: 84, status: 'completed', note: '终审通过。' },
      { title: '结束', operator: '流程结束·责任单位转办台账', time: '2026-08-29 17:00', status: 'completed', note: '已采纳，已转责任单位跟进。' }
    ]
  },
  {
    id: 28,
    title: '关于南屯区某商圈违规占道经营被集中投诉的舆情专报',
    source: '网格巡查',
    region: '南屯区',
    infoType: '舆情动态',
    author: '孙悦',
    organization: '台中市网信办',
    submitTime: '2026-09-01 09:00',
    auditStatus: '待转办',
    score: 86,
    auditor: '赵宁',
    auditTime: '2026-09-03 15:20',
    detailContent: {
      summary: '南屯区某商圈周边商户与居民集中反映摊贩违规占道经营，造成人行道拥堵与卫生问题，相关投诉一周内达20余件。',
      coreDemands: '希望城管、市场监管部门联合整治，并明确疏导安置方案。',
      publicOpinionTrend: '市民在政务留言平台持续跟帖，个别自媒体开始剪辑现场视频扩大传播，舆情热度中等偏高。',
      recommendations: [
        '1. 由城管部门开展联合巡查并公布整治安排。',
        '2. 对疏导点位和经营时段进行公示，减少反复投诉。'
      ]
    },
    timeline: [
      { title: '提交上报', operator: '孙悦·台中市网信办', time: '2026-09-01 09:00', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-09-01 11:10', status: 'completed', note: '初审通过，进入复核。' },
      { title: '审核处理', operator: '李明·市网信办复核组', time: '2026-09-01 15:30', status: 'rejected', note: '责任主体与处置建议不匹配：需明确城管、市场监管具体分工并补充现场图片，请修改后重新提交。' },
      { title: '提交上报（重新提交）', operator: '孙悦·台中市网信办', time: '2026-09-02 10:00', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-09-02 14:20', status: 'completed', note: '初审通过，进入复核。' },
      { title: '审核处理', operator: '李明·市网信办复核组', time: '2026-09-03 10:40', status: 'completed', note: '复核通过，提交终审。' },
      { title: '审核处理', operator: '赵宁·市网信办终审组', time: '2026-09-03 15:20', score: 86, status: 'completed', note: '终审通过。' },
      { title: '结束', operator: '流程结束·责任单位转办台账', time: '2026-09-03 16:00', status: 'completed', note: '已采纳，进入不良信息库待转办。' }
    ]
  },
  {
    id: 29,
    title: '关于某学校周边售卖“三无”文具被曝光的核查专报',
    source: '群众举报',
    region: '西屯区',
    infoType: '突发事件',
    author: '林峰',
    organization: '台中市网信办',
    submitTime: '2026-09-02 08:40',
    auditStatus: '已转办',
    score: 89,
    auditor: '赵宁',
    auditTime: '2026-09-04 16:30',
    transferTime: '2026-09-04 17:20',
    transferOpinion: '移交市市场监督管理局与市教育局联合核查处置。',
    detailContent: {
      summary: '家长举报学校周边多家文具店销售无生产日期、无厂名厂址的“三无”文具，部分产品疑似含邻苯二甲酸酯等有害物质。',
      coreDemands: '要求市场监管部门抽检商品并公布结果，同时加强校园周边经营秩序整治。',
      publicOpinionTrend: '家长群内广泛传播，短视频平台出现相关曝光内容，公众关注度高，需尽快权威回应。',
      recommendations: [
        '1. 市场监管部门对涉事门店开展抽检并依法处置。',
        '2. 教育部门联合学校发布消费提示，稳定家长情绪。'
      ]
    },
    timeline: [
      { title: '提交上报', operator: '林峰·台中市网信办', time: '2026-09-02 08:40', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-09-02 10:30', status: 'rejected', note: '缺少商品实物照片与购买凭证，请补充后重新提交。' },
      { title: '提交上报（重新提交）', operator: '林峰·台中市网信办', time: '2026-09-02 15:00', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-09-02 17:20', status: 'completed', note: '初审通过，进入复核。' },
      { title: '审核处理', operator: '李明·市网信办复核组', time: '2026-09-03 09:10', status: 'rejected', note: '涉及多部门职责，需补充市场监管抽检委托说明与教育部门联动意见，请补充后重新提交。' },
      { title: '提交上报（重新提交）', operator: '林峰·台中市网信办', time: '2026-09-03 14:00', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2026-09-03 16:40', status: 'completed', note: '初审通过，进入复核。' },
      { title: '审核处理', operator: '李明·市网信办复核组', time: '2026-09-04 10:10', status: 'completed', note: '复核通过，提交终审。' },
      { title: '审核处理', operator: '赵宁·市网信办终审组', time: '2026-09-04 16:30', score: 89, status: 'completed', note: '终审通过。' },
      { title: '结束', operator: '流程结束·责任单位转办台账', time: '2026-09-04 17:20', status: 'completed', note: '已采纳，已转责任单位跟进。' }
    ]
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
    auditStatus: '审核中',
    auditStage: '复核',
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
      { id: 'a3', name: '应急预案初稿.pdf', size: '2.4 MB', type: 'pdf' },
      { id: 'a4', name: '相关舆情专题网页', size: '网址', type: 'link', url: 'https://news.example.com/topic-water' }
    ],
    timeline: [
      { title: '提交上报', operator: '张三·市委宣传部舆情科', time: '2023-10-24 09:30', status: 'completed' },
      { title: '主任审核', operator: '王主任·市委宣传部舆情科', time: '2023-10-24 10:15', status: 'completed', note: '初审通过，进入复核。' },
      { title: '二级审核', operator: '复核员·市网信办复核组', status: 'current', note: '审核中，补充核查停水范围和居民反馈。' },
      { title: '终审审核', operator: '赵宁·市网信办终审组', status: 'pending', note: '等待处理' },
      { title: '结束', operator: '流程结束', status: 'pending', note: '等待结论' }
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
    auditStatus: '被驳回',
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
    auditStatus: '审核中',
    auditStage: '复核',
    detailContent: {
      summary: '北屯区某路段在晚高峰时段出现持续拥堵，网民集中反映临停车辆较多、通行效率偏低。',
      coreDemands: '希望增加高峰时段疏导力量，优化学校和商圈周边停车管理。',
      publicOpinionTrend: '讨论量稳定上升，已进入跨部门复核阶段。',
      recommendations: [
        '建议交警部门与街道联动核实拥堵时段和原因。',
        '建议先行完善临停管理和高峰绕行提示。'
      ]
    },
    timeline: [
      { title: '提交上报', operator: '吴九·台中市网信办', time: '2023-10-20 17:30', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2023-10-20 18:05', status: 'completed', note: '初审通过，进入复核。' },
      { title: '审核处理', operator: '李明·市网信办复核组', status: 'current', note: '复核中，待补充现场疏导记录。' },
      { title: '审核处理', operator: '赵宁·市网信办终审组', status: 'pending', note: '等待处理' },
      { title: '结束', operator: '流程结束', status: 'pending', note: '等待结论' }
    ]
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
    auditStatus: '已通过'
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
    auditStatus: '审核中',
    auditStage: '复核',
    score: '--',
    detailContent: {
      summary: '围绕南屯区文化艺术节传播效果开展复核，汇总主流媒体、短视频平台和群众反馈数据。',
      coreDemands: '重点关注活动传播覆盖面、群众参与度和现场秩序反馈。',
      publicOpinionTrend: '整体传播声量平稳上升，正向内容占比较高，暂未发现明显负面舆情。',
      recommendations: ['建议持续跟踪活动后续传播效果，并沉淀可复用的宣传推广经验。']
    },
    timeline: [
      { title: '提交上报', operator: '陈十一·台中市网信办', time: '2023-10-19 14:40', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2023-10-19 15:10', status: 'completed', note: '初审通过。' },
      { title: '审核处理', operator: '李明·市网信办复核组', status: 'current', note: '复核中，等待补充活动传播明细。' },
      { title: '审核处理', operator: '赵宁·市网信办终审组', status: 'pending', note: '等待处理' },
      { title: '结束', operator: '流程结束', status: 'pending', note: '等待结论' }
    ]
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
    auditStatus: '审核中',
    auditStage: '复核',
    detailContent: {
      summary: '针对网络直播带货虚假宣传线索进行初审后复核，已收集平台截图和举报来源信息。',
      coreDemands: '要求尽快核实主播宣传话术、商品资质和平台处置结果。',
      publicOpinionTrend: '目前处于持续复核状态，投诉量尚未扩散。',
      recommendations: [
        '建议补充平台后台处置记录和商品资质核验信息。',
        '建议对高热直播间进行进一步核查。'
      ]
    },
    timeline: [
      { title: '提交上报', operator: '吴十七·市市场监管局', time: '2023-10-18 14:15', status: 'completed' },
      { title: '审核处理', operator: '王主任·市委宣传部舆情科', time: '2023-10-18 15:00', status: 'completed', note: '初审通过，进入复核。' },
      { title: '审核处理', operator: '李明·市网信办复核组', status: 'current', note: '复核中，待补充平台取证材料。' },
      { title: '审核处理', operator: '赵宁·市网信办终审组', status: 'pending', note: '等待处理' },
      { title: '结束', operator: '流程结束', status: 'pending', note: '等待结论' }
    ]
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
    auditStatus: '被驳回'
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
    auditStatus: '已通过'
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
  { id: 1, title: '关于某社区突发停水事件的舆情上报', organization: '台中市网信办', auditor: '李审核', auditResult: '已通过', auditTime: '2023-10-24 15:00', reportId: 1, score: 92 },
  { id: 2, title: '台中市秋季旅游推广媒体传播分析', organization: '台中市网信办', auditor: '王审核', auditResult: '被驳回', auditTime: '2023-10-23 10:30', reportId: 2, rejectReason: '信息不完整', rejectDetail: '请补充权威媒体报道链接与传播数据截图等佐证材料后重新提交。' },
  { id: 3, title: '关于城市交通拥堵治理的市民建议汇总', organization: '台中市交通局', auditor: '张审核', auditResult: '已通过', auditTime: '2023-10-22 09:15', reportId: 3, score: 90 },
  { id: 4, title: '某大型商场消防安全隐患排查报告', organization: '台中市消防支队', auditor: '刘审核', auditResult: '被驳回', auditTime: '2023-10-21 16:45', reportId: 4, rejectReason: '非本辖区职责', rejectDetail: '该事项管辖权属于住建部门，请转对口单位报送。' },
  { id: 5, title: '年度文化惠民工程进展情况通报', organization: '台中市文化局', auditor: '陈审核', auditResult: '已通过', auditTime: '2023-10-20 11:20', reportId: 5, score: 88 },
  { id: 6, title: '关于冬季供暖保障工作的舆情监测', organization: '台中市住建局', auditor: '赵审核', auditResult: '已通过', auditTime: '2023-10-19 14:30', reportId: 6, score: 85 },
  { id: 7, title: '食品安全周宣传活动效果评估', organization: '台中市食药监', auditor: '孙审核', auditResult: '被驳回', auditTime: '2023-10-18 10:00', reportId: 7, rejectReason: '佐证不足', rejectDetail: '需补充现场活动照片与宣传物料投放记录等佐证材料。' },
  { id: 8, title: '关于智慧城市建设二期工程的公示', organization: '台中市发改委', auditor: '周审核', auditResult: '已通过', auditTime: '2023-10-17 15:40', reportId: 8, score: 93 },
  { id: 9, title: '全市中小学心理健康教育调研报告', organization: '台中市教育局', auditor: '吴审核', auditResult: '已通过', auditTime: '2023-10-16 09:50', reportId: 9, score: 87 },
  { id: 10, title: '关于加强老旧小区改造监管的通知', organization: '台中市房管局', auditor: '郑审核', auditResult: '被驳回', auditTime: '2023-10-15 13:20', reportId: 10, rejectReason: '重复上报', rejectDetail: '与历史已采纳速报内容重复，请核对后合并报送。' }
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
  { id: 'u2', subOrg: '中共台中市委宣传部', account: 'lihua_bs', realName: '李华', wechat: 'lihua_work', phone: '139****8822', role: '上报员', registerTime: '2023-10-15', status: '启用' },
  { id: 'u3', subOrg: '中共台中市委宣传部', account: 'wangwei_old', realName: '王伟', wechat: 'ww_123', phone: '135****4455', role: '审核员', registerTime: '2023-11-02', status: '禁用' },
  { id: 'u4', subOrg: '中共台中市委宣传部', account: 'zhao_q', realName: '赵强', wechat: 'zq_work88', phone: '137****9911', role: '上报员', registerTime: '2023-12-05', status: '启用' }
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
