import { NoticeGroup, NoticePerson } from '../types';

export const NOTICE_AVAILABLE_ORGS = [
  '台中市网信办',
  '中共台中市委宣传部',
  '西屯区宣传部',
  '北屯区宣传部',
  '南屯区宣传部',
  '东湖区宣传处',
  '高新区管委会舆情室',
  '市公安局网安支队',
  '市应急管理局',
  '市卫健委宣传处',
  '市教育局宣教科',
  '市融媒体中心',
  '广域传媒主机构'
];

export const NOTICE_GROUPS: NoticeGroup[] = [
  {
    id: 'grp-emergency',
    name: '突发舆情应急响应专班',
    description: '跨部门紧急协同工作组，处置高危、特急敏感舆情速报与研判',
    memberCount: 8,
    tag: '应急联动'
  },
  {
    id: 'grp-cybersecurity',
    name: '重点网络安全联络员组',
    description: '负责属地网络安全巡查、技术防线排查及网络防护通报接收',
    memberCount: 6,
    tag: '网络安全'
  },
  {
    id: 'grp-districts',
    name: '区县宣传舆情快报群',
    description: '汇聚各区县委宣传部信息骨干，负责属地区域动态速报与核实反馈',
    memberCount: 9,
    tag: '属地直报'
  },
  {
    id: 'grp-duty',
    name: '节假日24小时值守专班',
    description: '重点保障期、节假日全天候轮值及突发信息中枢交接责任人员',
    memberCount: 7,
    tag: '全天值班'
  },
  {
    id: 'grp-media',
    name: '融媒联合宣发协同群',
    description: '融媒体中心及主流党媒多渠道权威辟谣与正面引导发布团队',
    memberCount: 6,
    tag: '融媒发布'
  },
  {
    id: 'grp-hotspot',
    name: '政务民生热点导控专班',
    description: '教育、卫健、应急等民生焦点事件多部门联动处置与网民回应专班',
    memberCount: 5,
    tag: '民生协同'
  }
];

export const NOTICE_PERSONNEL: NoticePerson[] = [
  {
    id: 'p-01',
    name: '张建国',
    org: '台中市网信办',
    role: '应急指挥科科长',
    phone: '138****0001',
    groups: ['突发舆情应急响应专班', '节假日24小时值守专班'],
    avatarColor: 'bg-blue-600'
  },
  {
    id: 'p-02',
    name: '李华',
    org: '台中市网信办',
    role: '网络巡查骨干员',
    phone: '139****8822',
    groups: ['突发舆情应急响应专班', '重点网络安全联络员组'],
    avatarColor: 'bg-indigo-600'
  },
  {
    id: 'p-03',
    name: '王敏',
    org: '台中市网信办',
    role: '综合协调科副科长',
    phone: '136****9211',
    groups: ['节假日24小时值守专班', '政务民生热点导控专班'],
    avatarColor: 'bg-cyan-600'
  },
  {
    id: 'p-04',
    name: '赵强',
    org: '中共台中市委宣传部',
    role: '舆情信息科科长',
    phone: '137****9911',
    groups: ['突发舆情应急响应专班', '区县宣传舆情快报群'],
    avatarColor: 'bg-rose-600'
  },
  {
    id: 'p-05',
    name: '孙燕',
    org: '中共台中市委宣传部',
    role: '外宣协调室主任',
    phone: '135****6677',
    groups: ['融媒联合宣发协同群', '政务民生热点导控专班'],
    avatarColor: 'bg-pink-600'
  },
  {
    id: 'p-06',
    name: '周海',
    org: '西屯区宣传部',
    role: '分管副部长',
    phone: '136****5544',
    groups: ['区县宣传舆情快报群', '突发舆情应急响应专班'],
    avatarColor: 'bg-amber-600'
  },
  {
    id: 'p-07',
    name: '钱志刚',
    org: '西屯区宣传部',
    role: '网信办主任',
    phone: '138****3321',
    groups: ['区县宣传舆情快报群', '节假日24小时值守专班'],
    avatarColor: 'bg-orange-600'
  },
  {
    id: 'p-08',
    name: '刘欣',
    org: '西屯区宣传部',
    role: '一线信息报送员',
    phone: '135****4412',
    groups: ['区县宣传舆情快报群'],
    avatarColor: 'bg-emerald-600'
  },
  {
    id: 'p-09',
    name: '陈丽',
    org: '北屯区宣传部',
    role: '网信科科长',
    phone: '139****1122',
    groups: ['区县宣传舆情快报群', '重点网络安全联络员组'],
    avatarColor: 'bg-purple-600'
  },
  {
    id: 'p-10',
    name: '吴凯',
    org: '北屯区宣传部',
    role: '舆情监测员',
    phone: '137****4433',
    groups: ['区县宣传舆情快报群'],
    avatarColor: 'bg-teal-600'
  },
  {
    id: 'p-11',
    name: '郑伟',
    org: '南屯区宣传部',
    role: '宣传科科长',
    phone: '135****8899',
    groups: ['区县宣传舆情快报群', '节假日24小时值守专班'],
    avatarColor: 'bg-blue-700'
  },
  {
    id: 'p-12',
    name: '刘涛',
    org: '南屯区宣传部',
    role: '网络舆情信息员',
    phone: '138****7766',
    groups: ['区县宣传舆情快报群'],
    avatarColor: 'bg-sky-600'
  },
  {
    id: 'p-13',
    name: '马晓芳',
    org: '东湖区宣传处',
    role: '宣传处干事',
    phone: '136****2233',
    groups: ['区县宣传舆情快报群', '融媒联合宣发协同群'],
    avatarColor: 'bg-violet-600'
  },
  {
    id: 'p-14',
    name: '黄明',
    org: '高新区管委会舆情室',
    role: '舆情主管',
    phone: '139****4455',
    groups: ['突发舆情应急响应专班', '重点网络安全联络员组'],
    avatarColor: 'bg-emerald-700'
  },
  {
    id: 'p-15',
    name: '杨光',
    org: '市公安局网安支队',
    role: '一大队副大队长',
    phone: '138****9988',
    groups: ['重点网络安全联络员组', '突发舆情应急响应专班'],
    avatarColor: 'bg-slate-700'
  },
  {
    id: 'p-16',
    name: '林峰',
    org: '市公安局网安支队',
    role: '网络安防技术员',
    phone: '137****2211',
    groups: ['重点网络安全联络员组'],
    avatarColor: 'bg-slate-600'
  },
  {
    id: 'p-17',
    name: '何建国',
    org: '市应急管理局',
    role: '指挥中心副主任',
    phone: '135****1100',
    groups: ['突发舆情应急响应专班', '节假日24小时值守专班'],
    avatarColor: 'bg-amber-700'
  },
  {
    id: 'p-18',
    name: '宋文',
    org: '市应急管理局',
    role: '信息联络专员',
    phone: '136****8800',
    groups: ['政务民生热点导控专班'],
    avatarColor: 'bg-red-600'
  },
  {
    id: 'p-19',
    name: '郭敏',
    org: '市卫健委宣传处',
    role: '宣传处副处长',
    phone: '139****6611',
    groups: ['政务民生热点导控专班', '融媒联合宣发协同群'],
    avatarColor: 'bg-green-600'
  },
  {
    id: 'p-20',
    name: '邓超',
    org: '市教育局宣教科',
    role: '宣教科科长',
    phone: '138****5522',
    groups: ['政务民生热点导控专班'],
    avatarColor: 'bg-yellow-700'
  },
  {
    id: 'p-21',
    name: '徐晓东',
    org: '市融媒体中心',
    role: '编发部主任',
    phone: '137****3344',
    groups: ['融媒联合宣发协同群', '突发舆情应急响应专班'],
    avatarColor: 'bg-fuchsia-600'
  },
  {
    id: 'p-22',
    name: '苏雅琴',
    org: '市融媒体中心',
    role: '全媒体采编主管',
    phone: '135****7788',
    groups: ['融媒联合宣发协同群'],
    avatarColor: 'bg-rose-700'
  },
  {
    id: 'p-23',
    name: '罗文',
    org: '广域传媒主机构',
    role: '中枢运维工程师',
    phone: '139****0099',
    groups: ['重点网络安全联络员组', '节假日24小时值守专班'],
    avatarColor: 'bg-blue-800'
  }
];

// Helper functions
export const getPersonnelByOrg = (orgName: string): NoticePerson[] => {
  return NOTICE_PERSONNEL.filter((p) => p.org === orgName);
};

export const getPersonnelByGroup = (groupName: string): NoticePerson[] => {
  return NOTICE_PERSONNEL.filter((p) => p.groups.includes(groupName));
};

export const getPersonnelByIds = (ids: string[]): NoticePerson[] => {
  const idSet = new Set(ids);
  return NOTICE_PERSONNEL.filter((p) => idSet.has(p.id));
};

export const getOrgsFromPersonnelIds = (ids: string[]): string[] => {
  const selected = getPersonnelByIds(ids);
  return Array.from(new Set(selected.map((p) => p.org)));
};

export const getGroupsFromPersonnelIds = (ids: string[]): string[] => {
  const selected = getPersonnelByIds(ids);
  const groups = new Set<string>();
  selected.forEach((p) => {
    p.groups.forEach((g) => groups.add(g));
  });
  return Array.from(groups);
};

export const getDefaultPersonnelForOrgs = (orgs: string[]): string[] => {
  const orgSet = new Set(orgs);
  return NOTICE_PERSONNEL.filter((p) => orgSet.has(p.org)).map((p) => p.id);
};
