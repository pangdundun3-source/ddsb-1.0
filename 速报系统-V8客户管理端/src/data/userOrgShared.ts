import { useState, type Dispatch, type SetStateAction } from 'react';
import type { CategoryItem, OrgNode, PersonnelItem } from '../pages/OrgManagement';

export type UserOrgModule = 'account' | 'org' | 'role' | 'group';

export const USER_ORG_MODULES: UserOrgModule[] = ['account', 'org', 'role', 'group'];

export const ACCOUNT_ROLE_OPTIONS = [
  '超级管理员',
  '机构管理员',
  '管理员',
  '上报员',
  '审核员',
  '运营管理员',
  '临时审核员'
];

export interface PersonnelGroup {
  id: string;
  name: string;
  description: string;
}

export type InviteCodeStatus = '未使用' | '已使用' | '已过期';
export type InviteChannel = 'activation_code' | 'official_account';

export interface InviteCode {
  id: string;
  code: string;
  batchId: string;
  batchName: string;
  orgIds: string[];
  roles: string[];
  expiresAt: string;
  createdAt: string;
  status: InviteCodeStatus;
  channel?: InviteChannel;
  usedByName?: string;
  usedByPhone?: string;
  sentToName?: string;
  sentToWechat?: string;
  sentToPhone?: string;
  sentToFollowerId?: string;
}

export interface OfficialAccountFollower {
  id: string;
  nickname: string;
  avatarUrl: string;
  wechatAlias: string;
  phone?: string;
  followTime: string;
  city?: string;
}

export const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name: '市级党政机关' },
  { id: 'cat-2', name: '区县级单位' },
  { id: 'cat-3', name: '市属新闻媒体' },
  { id: 'cat-4', name: '企事业单位' }
];

export const INITIAL_ORG_NODES: OrgNode[] = [
  {
    id: 'org-1',
    categoryId: 'cat-1',
    parentId: null,
    name: '中共台中市委宣传部',
    code: 'XCB-340100',
    leaderName: '陈建国',
    leaderPhone: '13812345678',
    systemVersion: '正式版',
    expireDate: '2026-12-31',
    sortOrder: 100,
    allowSubOrgCreation: true
  },
  {
    id: 'org-1-1',
    categoryId: 'cat-1',
    parentId: 'org-1',
    name: '办公室',
    code: 'XCB-OFFICE',
    leaderName: '张主任',
    leaderPhone: '13800001111',
    systemVersion: '正式版',
    expireDate: '2026-12-31',
    sortOrder: 100,
    allowSubOrgCreation: true
  },
  {
    id: 'org-1-1-1',
    categoryId: 'cat-1',
    parentId: 'org-1-1',
    name: '综合科',
    code: 'XCB-OFFICE-ZH',
    leaderName: '刘科长',
    leaderPhone: '13800001121',
    systemVersion: '正式版',
    expireDate: '2026-12-31',
    sortOrder: 100,
    allowSubOrgCreation: true
  },
  {
    id: 'org-1-1-1-1',
    categoryId: 'cat-1',
    parentId: 'org-1-1-1',
    name: '文秘组',
    code: 'XCB-OFFICE-ZH-WM',
    leaderName: '周组长',
    leaderPhone: '13800001131',
    systemVersion: '正式版',
    expireDate: '2026-12-31',
    sortOrder: 100,
    allowSubOrgCreation: true
  },
  {
    id: 'org-1-1-1-1-1',
    categoryId: 'cat-1',
    parentId: 'org-1-1-1-1',
    name: '值班席',
    code: 'XCB-OFFICE-ZH-WM-DUTY',
    leaderName: '值班员',
    leaderPhone: '13800001141',
    systemVersion: '正式版',
    expireDate: '2026-12-31',
    sortOrder: 100,
    allowSubOrgCreation: false
  },
  {
    id: 'org-1-2',
    categoryId: 'cat-1',
    parentId: 'org-1',
    name: '网信指导处',
    code: 'XCB-WX',
    leaderName: '李处长',
    leaderPhone: '13800002222',
    systemVersion: '正式版',
    expireDate: '2026-12-31',
    sortOrder: 90,
    allowSubOrgCreation: true
  },
  {
    id: 'org-1-2-1',
    categoryId: 'cat-1',
    parentId: 'org-1-2',
    name: '网络安全应急响应组',
    code: 'XCB-WX-CERT',
    leaderName: '王组长',
    leaderPhone: '13800003333',
    systemVersion: '正式版',
    expireDate: '2026-12-31',
    sortOrder: 100,
    allowSubOrgCreation: true
  },
  {
    id: 'org-1-2-1-1',
    categoryId: 'cat-1',
    parentId: 'org-1-2-1',
    name: '应急值守班',
    code: 'XCB-WX-CERT-DUTY',
    leaderName: '值班班长',
    leaderPhone: '13800003343',
    systemVersion: '正式版',
    expireDate: '2026-12-31',
    sortOrder: 100,
    allowSubOrgCreation: true
  },
  {
    id: 'org-1-2-1-1-1',
    categoryId: 'cat-1',
    parentId: 'org-1-2-1-1',
    name: '夜班席',
    code: 'XCB-WX-CERT-DUTY-NIGHT',
    leaderName: '夜班席长',
    leaderPhone: '13800003353',
    systemVersion: '正式版',
    expireDate: '2026-12-31',
    sortOrder: 100,
    allowSubOrgCreation: false
  },
  {
    id: 'org-2',
    categoryId: 'cat-1',
    parentId: null,
    name: '台中市网信办',
    code: 'WXB-340100',
    leaderName: '刘立业',
    leaderPhone: '13988889999',
    systemVersion: '正式版',
    expireDate: '2026-12-31',
    sortOrder: 90,
    allowSubOrgCreation: true
  },
  {
    id: 'org-2-1',
    categoryId: 'cat-1',
    parentId: 'org-2',
    name: '舆情监测科',
    code: 'WXB-YQ',
    leaderName: '赵科长',
    leaderPhone: '13977776666',
    systemVersion: '正式版',
    expireDate: '2026-12-31',
    sortOrder: 100,
    allowSubOrgCreation: false
  },
  {
    id: 'org-3',
    categoryId: 'cat-2',
    parentId: null,
    name: '蜀山区委网信办',
    code: 'SSQ-340104',
    leaderName: '周局长',
    leaderPhone: '13655554444',
    systemVersion: '正式版',
    expireDate: '2026-12-31',
    sortOrder: 100,
    allowSubOrgCreation: true
  },
  {
    id: 'org-4',
    categoryId: 'cat-3',
    parentId: null,
    name: '台中日报社',
    code: 'RBS-340100',
    leaderName: '钱总编',
    leaderPhone: '13533332222',
    systemVersion: '正式版',
    expireDate: '2026-12-31',
    sortOrder: 100,
    allowSubOrgCreation: false
  }
];

export const INITIAL_PERSONNEL: PersonnelItem[] = [
  {
    id: 1,
    orgIds: ['org-1'],
    username: 'admin_xcb',
    realName: '张建国',
    wechat: 'zjg1980',
    phone: '13812340001',
    roles: ['管理员', '审核员'],
    labels: ['一级审核员'],
    registerDate: '2023-10-01',
    status: '启用',
    isLeader: true,
    primaryOrgId: 'org-1',
    groupIds: ['grp-emergency', 'grp-duty'],
    jobTitle: '应急指挥科科长',
    lastLogin: '2026-09-14 09:45',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face',
    activationFields: {
      idCardNo: '3401041980****0018',
      bankCardNo: '6222 **** **** 1028',
      bankName: '台中市政务服务银行',
      emergencyContact: '王敏',
      emergencyPhone: '136****9211'
    }
  },
  {
    id: 2,
    orgIds: ['org-1-2-1-1-1'],
    username: 'lihua_bs',
    realName: '李华',
    wechat: 'lihua_work',
    phone: '13912348822',
    roles: ['上报员'],
    labels: ['骨干上报员'],
    registerDate: '2023-10-15',
    status: '启用',
    primaryOrgId: 'org-1-2-1-1-1',
    groupIds: ['grp-emergency', 'grp-cybersecurity'],
    jobTitle: '网络巡查骨干员',
    lastLogin: '2026-09-14 10:12',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=face',
    activationFields: {
      idCardNo: '3401041991****2236',
      bankCardNo: '6217 **** **** 8830',
      bankName: '台中市建设银行',
      emergencyContact: '李明',
      emergencyPhone: '139****0216'
    }
  },
  {
    id: 3,
    orgIds: ['org-1-1'],
    username: 'wangwei_old',
    realName: '王伟',
    wechat: 'ww_123',
    phone: '13512344455',
    roles: ['审核员'],
    labels: ['二级审核员'],
    registerDate: '2023-11-02',
    status: '禁用',
    primaryOrgId: 'org-1-1',
    groupIds: [],
    jobTitle: '办公室审核员',
    lastLogin: '2026-08-20 16:18',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face',
    activationFields: {
      idCardNo: '3401041988****4455',
      bankCardNo: '6228 **** **** 4412',
      bankName: '台中市工商银行',
      emergencyContact: '刘婷',
      emergencyPhone: '135****8702'
    }
  },
  {
    id: 4,
    orgIds: ['org-1'],
    username: 'zhao_q',
    realName: '赵强',
    wechat: 'zq_work88',
    phone: '13712349911',
    roles: ['上报员'],
    labels: ['核心上报员'],
    registerDate: '2023-12-05',
    status: '启用',
    primaryOrgId: 'org-1',
    groupIds: ['grp-districts'],
    jobTitle: '信息上报联络员',
    lastLogin: '2026-09-14 10:04',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=128&h=128&fit=crop&crop=face',
    activationFields: {
      idCardNo: '3401041993****9911',
      bankCardNo: '6214 **** **** 6609',
      bankName: '台中市农业银行',
      emergencyContact: '赵宁',
      emergencyPhone: '137****3488'
    }
  },
  {
    id: 5,
    orgIds: ['org-2'],
    username: 'chen_yuan',
    realName: '陈远',
    wechat: 'cy_wxb',
    phone: '13812341133',
    roles: ['机构管理员'],
    labels: [],
    registerDate: '2024-01-12',
    status: '启用',
    primaryOrgId: 'org-2',
    groupIds: ['grp-duty', 'grp-hotspot'],
    jobTitle: '舆情监测科科长',
    lastLogin: '2026-09-14 08:38',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=128&h=128&fit=crop&crop=face',
  },
  {
    id: 6,
    orgIds: ['org-1-2'],
    username: 'tang_xin',
    realName: '唐欣',
    wechat: 'tangxin_wx',
    phone: '13812346688',
    roles: ['审核员'],
    labels: ['一级审核员'],
    registerDate: '2024-02-08',
    status: '启用',
    primaryOrgId: 'org-1-2',
    groupIds: ['grp-emergency', 'grp-hotspot'],
    jobTitle: '网信指导处审核员',
    lastLogin: '2026-09-14 09:15',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=face',
  },
  {
    id: 7,
    orgIds: ['org-3'],
    username: 'wu_cong',
    realName: '吴聪',
    wechat: 'wuc_ssq',
    phone: '13912340033',
    roles: ['上报员'],
    labels: ['普通上报员'],
    registerDate: '2024-03-18',
    status: '启用',
    primaryOrgId: 'org-3',
    groupIds: ['grp-districts', 'grp-cybersecurity'],
    jobTitle: '区县信息骨干',
    lastLogin: '2026-09-13 18:22',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=128&h=128&fit=crop&crop=face',
  },
  {
    id: 8,
    orgIds: ['org-4'],
    username: 'liang_lin',
    realName: '梁琳',
    wechat: 'll_media',
    phone: '13912342244',
    roles: ['运营管理员'],
    labels: [],
    registerDate: '2024-04-02',
    status: '启用',
    primaryOrgId: 'org-4',
    groupIds: ['grp-media'],
    jobTitle: '融媒宣发编辑',
    lastLogin: '2026-09-14 11:06',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&h=128&fit=crop&crop=face'
  }
];

export const INITIAL_GROUPS: PersonnelGroup[] = [
  {
    id: 'grp-emergency',
    name: '突发舆情应急响应专班',
    description: '跨部门紧急协同工作组，处置高危、特急敏感舆情速报与研判'
  },
  {
    id: 'grp-cybersecurity',
    name: '重点网络安全联络员组',
    description: '负责属地网络安全巡查、技术防线排查及网络防护通报接收'
  },
  {
    id: 'grp-districts',
    name: '区县宣传舆情快报群',
    description: '汇聚各区县委宣传部信息骨干，负责属地区域动态速报与核实反馈'
  },
  {
    id: 'grp-duty',
    name: '节假日24小时值守专班',
    description: '重点保障期、节假日全天候轮值及突发信息中枢交接责任人员'
  },
  {
    id: 'grp-media',
    name: '融媒联合宣发协同群',
    description: '融媒体中心及主流党媒多渠道权威辟谣与正面引导发布团队'
  },
  {
    id: 'grp-hotspot',
    name: '政务民生热点导控专班',
    description: '教育、卫健、应急等民生焦点事件多部门联动处置与网民回应专班'
  }
];

export const INITIAL_INVITE_CODES: InviteCode[] = [
  {
    id: 'inv-1',
    code: 'SB-2026-8A91F',
    batchId: 'batch-seed',
    batchName: '办公室邀请-20260917',
    orgIds: ['org-1-1'],
    roles: ['上报员'],
    expiresAt: '2026-09-30T23:59',
    createdAt: '2026-09-17T10:20',
    status: '未使用'
  },
  {
    id: 'inv-2',
    code: 'SB-2026-3B22C',
    batchId: 'batch-seed',
    batchName: '办公室邀请-20260917',
    orgIds: ['org-1-1'],
    roles: ['上报员'],
    expiresAt: '2026-09-30T23:59',
    createdAt: '2026-09-17T10:20',
    status: '已使用',
    usedByName: '周敏',
    usedByPhone: '13900006621'
  },
  {
    id: 'inv-3',
    code: 'SB-2026-7C11D',
    batchId: 'batch-seed',
    batchName: '办公室邀请-20260917',
    orgIds: ['org-1-1'],
    roles: ['上报员'],
    expiresAt: '2026-09-30T23:59',
    createdAt: '2026-09-17T10:20',
    status: '未使用'
  },
  {
    id: 'inv-4',
    code: 'SB-2026-9E40E',
    batchId: 'batch-seed',
    batchName: '办公室邀请-20260917',
    orgIds: ['org-1-1'],
    roles: ['上报员'],
    expiresAt: '2026-09-30T23:59',
    createdAt: '2026-09-17T10:20',
    status: '未使用'
  },
  {
    id: 'inv-5',
    code: 'SB-2026-HX91A',
    batchId: 'batch-oa-seed',
    batchName: '公众号主动邀请-20260916',
    orgIds: ['org-1-1'],
    roles: ['上报员'],
    expiresAt: '2026-09-30T23:59',
    createdAt: '2026-09-16T15:40',
    status: '未使用',
    channel: 'official_account',
    sentToName: '何岚',
    sentToWechat: 'helan_wx',
    sentToFollowerId: 'flw-1'
  }
];

export const INITIAL_FOLLOWERS: OfficialAccountFollower[] = [
  {
    id: 'flw-1',
    nickname: '何岚',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&h=128&fit=crop&crop=face',
    wechatAlias: 'helan_wx',
    phone: '13800007101',
    followTime: '2026-03-12 09:18',
    city: '台中市'
  },
  {
    id: 'flw-2',
    nickname: '孙博',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=face',
    wechatAlias: 'sunbo_tz',
    phone: '13900007202',
    followTime: '2026-04-02 14:26',
    city: '台中市'
  },
  {
    id: 'flw-3',
    nickname: '马晓雯',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=face',
    wechatAlias: 'mxw_office',
    phone: '13700007303',
    followTime: '2026-05-18 11:05',
    city: '蜀山区'
  },
  {
    id: 'flw-4',
    nickname: '网信张工',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face',
    wechatAlias: 'zjg1980',
    phone: '13812340001',
    followTime: '2026-06-01 08:42',
    city: '台中市'
  },
  {
    id: 'flw-5',
    nickname: '郑凯',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=128&h=128&fit=crop&crop=face',
    wechatAlias: 'zhengkai88',
    phone: '13600007505',
    followTime: '2026-06-21 16:33',
    city: '西屯区'
  },
  {
    id: 'flw-6',
    nickname: '日报梁编',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&h=128&fit=crop&crop=face',
    wechatAlias: 'll_media',
    phone: '13912342244',
    followTime: '2026-07-08 10:12',
    city: '台中市'
  },
  {
    id: 'flw-7',
    nickname: '曹宁',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=128&h=128&fit=crop&crop=face',
    wechatAlias: 'caoning',
    followTime: '2026-07-19 19:48',
    city: '南屯区'
  },
  {
    id: 'flw-8',
    nickname: '傅浩',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face',
    wechatAlias: 'fuhao_work',
    phone: '13300007808',
    followTime: '2026-08-04 13:27',
    city: '台中市'
  },
  {
    id: 'flw-9',
    nickname: '邓丽',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=face',
    wechatAlias: 'dengli_wx',
    phone: '13200007909',
    followTime: '2026-08-22 09:55',
    city: '蜀山区'
  },
  {
    id: 'flw-10',
    nickname: '彭宇',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=128&h=128&fit=crop&crop=face',
    wechatAlias: 'pengyu_tz',
    followTime: '2026-09-02 17:16',
    city: '台中市'
  },
  {
    id: 'flw-11',
    nickname: '蒋薇',
    avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=128&h=128&fit=crop&crop=face',
    wechatAlias: 'jiangwei',
    phone: '13100007111',
    followTime: '2026-09-09 08:03',
    city: '西屯区'
  },
  {
    id: 'flw-12',
    nickname: '韩磊',
    avatarUrl: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=128&h=128&fit=crop&crop=face',
    wechatAlias: 'hanlei_wx',
    followTime: '2026-09-14 12:41',
    city: '台中市'
  }
];

export interface UserOrgSharedState {
  categories: CategoryItem[];
  setCategories: Dispatch<SetStateAction<CategoryItem[]>>;
  orgNodes: OrgNode[];
  setOrgNodes: Dispatch<SetStateAction<OrgNode[]>>;
  personnelList: PersonnelItem[];
  setPersonnelList: Dispatch<SetStateAction<PersonnelItem[]>>;
  groups: PersonnelGroup[];
  setGroups: Dispatch<SetStateAction<PersonnelGroup[]>>;
  inviteCodes: InviteCode[];
  setInviteCodes: Dispatch<SetStateAction<InviteCode[]>>;
}

export const useUserOrgSharedState = (): UserOrgSharedState => {
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [orgNodes, setOrgNodes] = useState<OrgNode[]>(INITIAL_ORG_NODES);
  const [personnelList, setPersonnelList] = useState<PersonnelItem[]>(INITIAL_PERSONNEL);
  const [groups, setGroups] = useState<PersonnelGroup[]>(INITIAL_GROUPS);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>(INITIAL_INVITE_CODES);

  return {
    categories,
    setCategories,
    orgNodes,
    setOrgNodes,
    personnelList,
    setPersonnelList,
    groups,
    setGroups,
    inviteCodes,
    setInviteCodes
  };
};

export const ORG_PATH_SEPARATOR = '/';

export const getOrgById = (orgNodes: OrgNode[], orgId?: string | null) =>
  orgId ? orgNodes.find((node) => node.id === orgId) : undefined;

export const getOrgChildrenOf = (orgNodes: OrgNode[], parentId: string | null) =>
  orgNodes
    .filter((node) => (node.parentId ?? null) === parentId)
    .sort((a, b) => (b.sortOrder || 0) - (a.sortOrder || 0) || a.name.localeCompare(b.name, 'zh-CN'));

export const buildOrgIdPath = (orgNodes: OrgNode[], orgId?: string) => {
  if (!orgId) return [] as string[];
  const path: string[] = [];
  let current = getOrgById(orgNodes, orgId);
  while (current) {
    path.unshift(current.id);
    current = current.parentId ? getOrgById(orgNodes, current.parentId) : undefined;
  }
  return path;
};

export const getOrgFullPath = (
  orgNodes: OrgNode[],
  orgId?: string,
  separator = ORG_PATH_SEPARATOR
) =>
  buildOrgIdPath(orgNodes, orgId)
    .map((id) => getOrgById(orgNodes, id)?.name || id)
    .join(separator);

export const getLeafOrgIds = (orgNodes: OrgNode[], orgIds: string[]) =>
  orgIds.filter(
    (id) => !orgIds.some((other) => other !== id && buildOrgIdPath(orgNodes, other).includes(id))
  );

export const getDeepestOrgId = (orgNodes: OrgNode[], orgIds: string[], primaryOrgId?: string) => {
  if (primaryOrgId && orgIds.includes(primaryOrgId)) return primaryOrgId;
  const leaves = getLeafOrgIds(orgNodes, orgIds);
  if (!leaves.length) return orgIds[0];
  return [...leaves].sort(
    (a, b) => buildOrgIdPath(orgNodes, b).length - buildOrgIdPath(orgNodes, a).length
  )[0];
};

export const formatPersonOrgPaths = (
  orgNodes: OrgNode[],
  orgIds: string[],
  separator = ORG_PATH_SEPARATOR,
  primaryOrgId?: string
) => {
  const orgId = getDeepestOrgId(orgNodes, orgIds, primaryOrgId);
  return orgId ? getOrgFullPath(orgNodes, orgId, separator) : '未分配机构';
};

export const parseUserOrgModule = (value?: string): UserOrgModule => {
  if (value && USER_ORG_MODULES.includes(value as UserOrgModule)) {
    return value as UserOrgModule;
  }
  return 'account';
};

export const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case '超级管理员':
    case '机构管理员':
    case '管理员':
      return 'bg-blue-100/80 text-blue-700 border border-blue-200';
    case '审核员':
    case '临时审核员':
      return 'bg-amber-100/80 text-amber-700 border border-amber-200';
    case '上报员':
      return 'bg-emerald-100/80 text-emerald-700 border border-emerald-200';
    case '运营管理员':
      return 'bg-indigo-100/80 text-indigo-700 border border-indigo-200';
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-200';
  }
};

export const generateAccountPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export const generateActivationCode = (year = new Date().getFullYear()) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const suffix = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `SB-${year}-${suffix}`;
};
