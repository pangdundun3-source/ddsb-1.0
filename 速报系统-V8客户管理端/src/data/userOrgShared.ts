import { useState, type Dispatch, type SetStateAction } from 'react';
import type { CategoryItem, OrgNode, PersonnelItem } from '../pages/OrgManagement';

export type UserOrgModule = 'account' | 'org' | 'role' | 'group' | 'invite';

export const USER_ORG_MODULES: UserOrgModule[] = ['account', 'org', 'role', 'group', 'invite'];

/** 本机构最大可用用户数，由 MT 应用管理端授权 */
export const ORG_MAX_USER_COUNT = 200;

/** 外部系统全部可邀请角色（含历史「上报员」） */
export const ACCOUNT_ROLE_OPTIONS = ['网格员', '上报员', '审核员', '节点负责人', '系统管理员'];

/** 组织节点默认可邀请角色 */
export const DEFAULT_INVITE_ROLES = ['网格员', '上报员'];

/** 读取节点可邀请角色：本节点未配置时向上继承，最终回落到默认 */
export const getOrgInviteRoles = (
  orgNodes: { id: string; parentId: string | null; inviteRoles?: string[] }[],
  orgId?: string | null
): string[] => {
  let currentId = orgId || null;
  while (currentId) {
    const node = orgNodes.find((item) => item.id === currentId);
    if (!node) break;
    if (node.inviteRoles?.length) {
      return node.inviteRoles.filter((role) => ACCOUNT_ROLE_OPTIONS.includes(role));
    }
    currentId = node.parentId;
  }
  return [...DEFAULT_INVITE_ROLES];
};

export interface PersonnelGroup {
  id: string;
  name: string;
  description: string;
}

export type InviteCodeStatus = '未使用' | '已使用' | '已过期';
export type InviteChannel = 'activation_code' | 'official_account' | 'qrcode' | 'link';

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
  usedAt?: string;
  remark?: string;
  createdBy?: string;
  sentToName?: string;
  sentToWechat?: string;
  sentToPhone?: string;
  sentToFollowerId?: string;
  /** 手动失效时间与原因（自然过期可不填） */
  invalidatedAt?: string;
  invalidateReason?: string;
  invalidatedBy?: string;
  /** 二维码邀请：扫码上限人数与已扫码加入人数 */
  qrLimit?: number;
  scannedCount?: number;
  /** 二维码 / 链接邀请：已通过本次邀请激活的人员 */
  joinedMembers?: InviteJoinedMember[];
}

export interface InviteJoinedMember {
  id: string;
  name: string;
  phone: string;
  joinedAt: string;
}

const JOINED_MEMBER_SURNAMES = ['林', '陈', '黄', '张', '李', '王', '吴', '刘', '蔡', '杨', '许', '郑', '谢', '洪', '曾', '邱', '周', '赵', '徐', '孙', '胡', '朱', '高', '何'];
const JOINED_MEMBER_GIVEN_NAMES = [
  '雅婷', '志豪', '冠宇', '雅琪', '承恩', '怡君', '俊杰', '佳蓉', '明哲', '淑芬', '家豪', '宜蓁', '宗翰', '静怡', '柏翰', '诗涵',
  '子轩', '欣怡', '浩然', '梓涵', '宇航', '思远', '嘉欣', '文博', '晓雯', '建华', '海燕', '立伟', '晨阳', '雨桐'
];

/** 未记录明细的邀请按已加入人数生成稳定的示例名单 */
export const getInviteJoinedMembers = (invite: InviteCode): InviteJoinedMember[] => {
  if (invite.joinedMembers?.length) return invite.joinedMembers;
  const count = invite.scannedCount || 0;
  if (!count) return [];
  const seed = Array.from(invite.id).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const start = new Date(invite.createdAt || Date.now()).getTime();
  const end = Math.min(Date.now(), invite.expiresAt ? new Date(invite.expiresAt).getTime() : Date.now());
  const step = Math.max(end - start, 60 * 60 * 1000) / (count + 1);
  return Array.from({ length: count }, (_, index) => {
    const name =
      JOINED_MEMBER_SURNAMES[(seed + index * 7) % JOINED_MEMBER_SURNAMES.length] +
      JOINED_MEMBER_GIVEN_NAMES[(seed * 3 + index * 11) % JOINED_MEMBER_GIVEN_NAMES.length];
    const tail = String((seed * 37 + index * 731) % 10000).padStart(4, '0');
    const jitter = (((seed * 13 + index * 29) % 100) / 100 - 0.5) * step * 0.6;
    const joined = new Date(start + (index + 1) * step + jitter);
    const pad = (n: number) => String(n).padStart(2, '0');
    return {
      id: `${invite.id}-m${index + 1}`,
      name,
      phone: `13${(seed + index) % 10}${String(5100 + index * 13).padStart(4, '0')}${tail}`.slice(0, 11),
      joinedAt: `${joined.getFullYear()}-${pad(joined.getMonth() + 1)}-${pad(joined.getDate())} ${pad(joined.getHours())}:${pad(joined.getMinutes())}`,
    };
  }).reverse();
};

export interface OfficialAccountFollower {
  id: string;
  nickname: string;
  avatarUrl: string;
  wechatAlias: string;
  phone?: string;
  followTime: string;
  city?: string;
}

/** 外部用户所属应用及其关联的微信服务号 */
export const EXTERNAL_APP = { name: '点点速豹', officialAccount: '点点速豹' };

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
    gender: '男',
    nickname: '风清扬',
    openId: 'wx_openid_v8_10001',
    followStatus: '已关注',
    wechat: 'zjg1980',
    phone: '13812340001',
    roles: ['节点负责人', '审核员'],
    labels: ['一级审核员'],
    registerDate: '2023-10-01',
    status: '启用',
    isLeader: true,
    primaryOrgId: 'org-1',
    groupIds: ['grp-emergency', 'grp-duty', 'grp-hotspot'],
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
    gender: '女',
    nickname: '山水清晖',
    openId: 'wx_openid_v8_10002',
    followStatus: '已关注',
    wechat: 'lihua_work',
    phone: '13912348822',
    roles: ['网格员'],
    labels: ['骨干网格员'],
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
    gender: '男',
    nickname: '晨曦微光',
    openId: 'wx_openid_v8_10003',
    followStatus: '已取消关注',
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
    gender: '男',
    nickname: '追风少年',
    openId: 'wx_openid_v8_10004',
    followStatus: '已关注',
    wechat: 'zq_work88',
    phone: '13712349911',
    roles: ['网格员'],
    labels: ['核心网格员'],
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
    gender: '男',
    nickname: '静水流深',
    openId: 'wx_openid_v8_10005',
    followStatus: '已关注',
    wechat: 'cy_wxb',
    phone: '13812341133',
    roles: ['审核员'],
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
    gender: '女',
    nickname: '云卷云舒',
    openId: 'wx_openid_v8_10006',
    followStatus: '已关注',
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
    gender: '男',
    nickname: '吴越春秋',
    openId: 'wx_openid_v8_10007',
    followStatus: '已关注',
    locked: true,
    wechat: 'wuc_ssq',
    phone: '13912340033',
    roles: ['网格员'],
    labels: ['普通网格员'],
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
    gender: '女',
    nickname: '日报梁编',
    openId: 'wx_openid_v8_10008',
    followStatus: '已关注',
    wechat: 'll_media',
    phone: '13912342244',
    roles: ['网格员'],
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
  },
  {
    id: 'grp-xb-env',
    name: '西坝区环保舆情联动组',
    description: '西坝区环保局属地环境类舆情监测、核实与联合处置专班'
  },
  {
    id: 'grp-xb-river',
    name: '河长制速报联络群',
    description: '河道断面、排污口与水质异动类信息快速上报与跨部门协同'
  },
  {
    id: 'grp-xb-night',
    name: '西坝夜间值班备勤组',
    description: '夜间及非工作时段值班席位、备勤网格员与信息接报人员'
  }
];

const buildBatchActivationCodes = (
  batch: Pick<InviteCode, 'batchId' | 'batchName' | 'orgIds' | 'roles' | 'expiresAt' | 'createdAt'> &
    Partial<Pick<InviteCode, 'createdBy'>>,
  codes: string[],
  usedBy: Array<{ name: string; phone: string; usedAt?: string }>
): InviteCode[] =>
  codes.map((code, index) => ({
    ...batch,
    id: `${batch.batchId}-${index + 1}`,
    code,
    channel: 'activation_code' as const,
    status: index < usedBy.length ? ('已使用' as const) : ('未使用' as const),
    usedByName: usedBy[index]?.name,
    usedByPhone: usedBy[index]?.phone,
    usedAt: usedBy[index]?.usedAt,
    createdBy: batch.createdBy || '系统'
  }));

const buildShareInvite = (
  channel: 'qrcode' | 'link',
  invite: Pick<InviteCode, 'id' | 'code' | 'batchName' | 'orgIds' | 'roles' | 'expiresAt' | 'createdAt' | 'qrLimit' | 'scannedCount'>
): InviteCode => ({
  ...invite,
  batchId: `batch-${invite.id}`,
  status: '未使用',
  channel
});

const buildOfficialAccountInvite = (
  invite: Pick<InviteCode, 'id' | 'code' | 'orgIds' | 'roles' | 'expiresAt' | 'createdAt' | 'sentToName' | 'sentToWechat' | 'sentToFollowerId'> &
    Partial<Pick<InviteCode, 'status' | 'usedByName' | 'usedByPhone'>>
): InviteCode => ({
  status: '未使用',
  ...invite,
  batchId: `batch-${invite.id}`,
  batchName: `公众号主动邀请-${invite.createdAt.slice(0, 10).replace(/-/g, '')}`,
  channel: 'official_account'
});

export const INITIAL_INVITE_CODES: InviteCode[] = [
  /** 西坝区环保局实验数据：待激活 / 已激活 / 已失效（审核上报端当前机构 org-2-2 可见） */
  {
    ...buildShareInvite('qrcode', {
      id: 'inv-qr-demo-pending',
      code: 'QR-2026-XBHP1',
      batchName: '西坝区环保局网格员扫码邀请',
      orgIds: ['org-2-2'],
      roles: ['网格员'],
      expiresAt: '2026-11-22T23:59',
      createdAt: '2026-10-20T09:30',
      qrLimit: 20,
      scannedCount: 3
    }),
    createdBy: '张三',
    joinedMembers: [
      { id: 'jm-xb-1', name: '刘芳', phone: '13820001001', joinedAt: '2026-10-20 10:12' },
      { id: 'jm-xb-2', name: '陈刚', phone: '13920001002', joinedAt: '2026-10-20 11:05' },
      { id: 'jm-xb-3', name: '王雪', phone: '13620001003', joinedAt: '2026-10-21 09:40' }
    ]
  },
  {
    ...buildShareInvite('link', {
      id: 'inv-lk-demo-pending',
      code: 'LK-2026-XBHP2',
      batchName: '西坝区环保局外部协作链接邀请',
      orgIds: ['org-2-2'],
      roles: ['外部协作专员'],
      expiresAt: '2026-10-29T23:59',
      createdAt: '2026-10-21T14:20',
      qrLimit: 30,
      scannedCount: 5
    }),
    createdBy: '张三'
  },
  ...buildBatchActivationCodes(
    {
      batchId: 'batch-ac-demo-pending',
      batchName: '西坝区环保局激活码-待激活样例',
      orgIds: ['org-2-2'],
      roles: ['网格员', '审核员'],
      expiresAt: '2026-11-05T23:59',
      createdAt: '2026-10-21T16:00',
      createdBy: '张三'
    },
    ['XB-2026-A1001', 'XB-2026-A1002', 'XB-2026-A1003', 'XB-2026-A1004', 'XB-2026-A1005', 'XB-2026-A1006'],
    [
      { name: '赵敏', phone: '13720002001', usedAt: '2026-10-21 17:10' },
      { name: '孙磊', phone: '13820002002', usedAt: '2026-10-22 08:25' }
    ]
  ),
  ...buildBatchActivationCodes(
    {
      batchId: 'batch-ac-demo-activated',
      batchName: '西坝区环保局激活码-已激活样例',
      orgIds: ['org-2-2'],
      roles: ['网格员'],
      expiresAt: '2026-12-01T23:59',
      createdAt: '2026-10-18T10:00',
      createdBy: '张三'
    },
    ['XB-2026-B2001', 'XB-2026-B2002', 'XB-2026-B2003', 'XB-2026-B2004'],
    [
      { name: '周倩', phone: '13920003001', usedAt: '2026-10-18 11:20' },
      { name: '吴昊', phone: '13620003002', usedAt: '2026-10-18 14:05' },
      { name: '郑悦', phone: '13720003003', usedAt: '2026-10-19 09:33' },
      { name: '冯超', phone: '13820003004', usedAt: '2026-10-19 16:48' }
    ]
  ),
  {
    ...buildShareInvite('qrcode', {
      id: 'inv-qr-demo-activated',
      code: 'QR-2026-XBHP3',
      batchName: '西坝区环保局节假日值守扫码',
      orgIds: ['org-2-2'],
      roles: ['审核员'],
      expiresAt: '2026-12-15T23:59',
      createdAt: '2026-10-15T08:00',
      qrLimit: 10,
      scannedCount: 10
    }),
    createdBy: '张三',
    status: '已使用'
  },
  {
    ...buildShareInvite('link', {
      id: 'inv-lk-demo-expired',
      code: 'LK-2026-XBHP4',
      batchName: '西坝区环保局临时链接邀请-已失效',
      orgIds: ['org-2-2'],
      roles: ['网格员'],
      expiresAt: '2026-10-18T23:59',
      createdAt: '2026-10-10T09:00',
      qrLimit: 15,
      scannedCount: 4
    }),
    createdBy: '张三',
    status: '已过期'
  },
  ...buildBatchActivationCodes(
    {
      batchId: 'batch-ac-demo-expired',
      batchName: '西坝区环保局激活码-已失效样例',
      orgIds: ['org-2-2'],
      roles: ['网格员'],
      expiresAt: '2026-10-12T23:59',
      createdAt: '2026-10-05T11:30',
      createdBy: '张三'
    },
    ['XB-2026-C3001', 'XB-2026-C3002', 'XB-2026-C3003', 'XB-2026-C3004', 'XB-2026-C3005'],
    [
      { name: '曹阳', phone: '13520004001', usedAt: '2026-10-06 10:00' },
      { name: '邓丽', phone: '13920004002', usedAt: '2026-10-07 15:22' }
    ]
  ),
  {
    ...buildShareInvite('qrcode', {
      id: 'inv-qr-1014',
      code: 'QR-2026-B8N4W',
      batchName: '综合协调处批量邀请',
      orgIds: ['org-1-2-1-1-1'],
      roles: ['外部协作专员', '调研分析员'],
      expiresAt: '2026-12-31T23:59',
      createdAt: '2026-10-14T08:40',
      qrLimit: 50,
      scannedCount: 4
    }),
    createdBy: '张云昭',
    joinedMembers: [
      { id: 'jm-1', name: '周启明', phone: '13800001001', joinedAt: '2026-10-14 09:12' },
      { id: 'jm-2', name: '李婉清', phone: '13900001002', joinedAt: '2026-10-14 10:05' },
      { id: 'jm-3', name: '陈思远', phone: '13600001003', joinedAt: '2026-10-15 11:20' },
      { id: 'jm-4', name: '赵若彤', phone: '13700001004', joinedAt: '2026-10-15 14:33' }
    ]
  },
  buildOfficialAccountInvite({
    id: 'inv-oa-1013',
    code: 'SB-2026-ZK7P3',
    orgIds: ['org-2-1'],
    roles: ['网格员'],
    expiresAt: '2026-10-27T23:59',
    createdAt: '2026-10-13T16:20',
    sentToName: '郑凯',
    sentToWechat: 'zhengkai88',
    sentToFollowerId: 'flw-5'
  }),
  ...buildBatchActivationCodes(
    {
      batchId: 'batch-ac-1013',
      batchName: '应急联络组激活码',
      orgIds: ['org-2-1'],
      roles: ['外部协作专员'],
      expiresAt: '2026-11-20T23:59',
      createdAt: '2026-10-13T10:30',
      createdBy: '张云昭'
    },
    ['3847291560', '5829147360', '7193652840', '9264815730', '1582739460', '6471928350', '8350174620', '2739486150'],
    [
      { name: '周启明', phone: '13856781203', usedAt: '2026-10-13 14:22' },
      { name: '韩雨桐', phone: '13987654321', usedAt: '2026-10-14 09:08' }
    ]
  ),
  {
    ...buildShareInvite('qrcode', {
      id: 'inv-qr-1013',
      code: 'QR-2026-D4M9S',
      batchName: '台中日报社融媒通讯员',
      orgIds: ['org-4'],
      roles: ['网格员'],
      expiresAt: '2026-11-15T23:59',
      createdAt: '2026-10-13T09:00',
      qrLimit: 30,
      scannedCount: 30
    }),
    createdBy: '王主任',
    status: '已使用'
  },
  ...buildBatchActivationCodes(
    {
      batchId: 'batch-ac-1012',
      batchName: '网信指导处批量邀请',
      orgIds: ['org-1-2'],
      roles: ['调研分析员', '网格员'],
      expiresAt: '2026-11-30T23:59',
      createdAt: '2026-10-12T14:05',
      createdBy: '李科长'
    },
    ['SB-2026-K4P2A', 'SB-2026-M7Q9B', 'SB-2026-R2T6C', 'SB-2026-W8X3D', 'SB-2026-H5J1E', 'SB-2026-N9L4F', 'SB-2026-Z3V7G', 'SB-2026-E6Y2H'],
    [
      { name: '林雅婷', phone: '13812345170', usedAt: '2026-10-12 16:10' },
      { name: '陈志豪', phone: '13987654321', usedAt: '2026-10-12 17:02' },
      { name: '黄冠宇', phone: '13655553904', usedAt: '2026-10-13 08:45' }
    ]
  ),
  {
    ...buildShareInvite('link', {
      id: 'inv-lk-1012',
      code: 'LK-2026-H2Q6E',
      batchName: '网信指导处联络员链接邀请',
      orgIds: ['org-1-2'],
      roles: ['网格员'],
      expiresAt: '2026-12-12T23:59',
      createdAt: '2026-10-12T15:30',
      qrLimit: 80,
      scannedCount: 41
    }),
    createdBy: '李科长'
  },
  buildOfficialAccountInvite({
    id: 'inv-oa-1011',
    code: 'SB-2026-SB4M2',
    orgIds: ['org-1-1-1-1-1'],
    roles: ['网格员'],
    expiresAt: '2026-10-25T23:59',
    createdAt: '2026-10-11T11:05',
    sentToName: '孙博',
    sentToWechat: 'sunbo_tz',
    sentToFollowerId: 'flw-2'
  }),
  buildShareInvite('qrcode', {
    id: 'inv-qr-1',
    code: 'QR-2026-T7K3M',
    batchName: '办公室扫码入组-20261010',
    orgIds: ['org-1-1'],
    roles: ['网格员'],
    expiresAt: '2026-12-31T23:59',
    createdAt: '2026-10-10T09:30',
    qrLimit: 100,
    scannedCount: 12
  }),
  buildShareInvite('link', {
    id: 'inv-lk-1009',
    code: 'LK-2026-P5V1J',
    batchName: '蜀山区网信联络员链接邀请-20261009',
    orgIds: ['org-3'],
    roles: ['网格员'],
    expiresAt: '2026-11-09T23:59',
    createdAt: '2026-10-09T10:10',
    qrLimit: 50,
    scannedCount: 23
  }),
  ...buildBatchActivationCodes(
    {
      batchId: 'batch-ac-1008',
      batchName: '蜀山区委网信办批量邀请-20261008',
      orgIds: ['org-3'],
      roles: ['网格员'],
      expiresAt: '2026-10-31T23:59',
      createdAt: '2026-10-08T09:15'
    },
    ['SB-2026-P1A8K', 'SB-2026-Q6C3M', 'SB-2026-S9D5N', 'SB-2026-U2F7R', 'SB-2026-Y4G1T'],
    [
      { name: '张雅琪', phone: '13722221711' },
      { name: '李承恩', phone: '13599990249' }
    ]
  ),
  {
    ...buildOfficialAccountInvite({
      id: 'inv-oa-1003',
      code: 'SB-2026-LL6Q8',
      orgIds: ['org-4'],
      roles: ['网格员'],
      expiresAt: '2026-10-17T23:59',
      createdAt: '2026-10-03T14:45',
      sentToName: '日报梁编',
      sentToWechat: 'll_media',
      sentToFollowerId: 'flw-6',
      status: '已使用',
      usedByName: '梁琳',
      usedByPhone: '13912342244'
    }),
    usedAt: '2026-10-05 09:18:22',
    createdBy: '王主任'
  },
  buildOfficialAccountInvite({
    id: 'inv-oa-0920',
    code: 'SB-2026-FH2D7',
    orgIds: ['org-1-2-1-1-1'],
    roles: ['网格员'],
    expiresAt: '2026-10-04T23:59',
    createdAt: '2026-09-20T09:35',
    sentToName: '傅浩',
    sentToWechat: 'fuhao_work',
    sentToFollowerId: 'flw-8'
  }),
  ...buildBatchActivationCodes(
    {
      batchId: 'batch-seed',
      batchName: '办公室邀请-20260917',
      orgIds: ['org-1-1'],
      roles: ['网格员'],
      expiresAt: '2026-09-30T23:59',
      createdAt: '2026-09-17T10:20'
    },
    ['SB-2026-3B22C', 'SB-2026-8A91F', 'SB-2026-7C11D', 'SB-2026-9E40E'],
    [{ name: '周敏', phone: '13900006621' }]
  ),
  {
    ...buildOfficialAccountInvite({
      id: 'inv-5',
      code: 'SB-2026-HX91A',
      orgIds: ['org-1-1'],
      roles: ['网格员'],
      expiresAt: '2026-09-30T23:59',
      createdAt: '2026-09-16T15:40',
      sentToName: '何岚',
      sentToWechat: 'helan_wx',
      sentToFollowerId: 'flw-1'
    }),
    status: '已过期',
    invalidatedAt: '2026-09-22 11:06:18',
    invalidateReason: '管理员手动失效',
    invalidatedBy: '张云昭',
    createdBy: '张云昭',
    remark: '何岚'
  },
  {
    ...buildShareInvite('link', {
      id: 'inv-lk-0915',
      code: 'LK-2026-Y7C3U',
      batchName: '值班席链接邀请-20260915',
      orgIds: ['org-1-1-1-1-1'],
      roles: ['网格员'],
      expiresAt: '2026-09-25T23:59',
      createdAt: '2026-09-15T08:50',
      qrLimit: 20,
      scannedCount: 8
    }),
    status: '已过期',
    createdBy: '系统'
  },
  buildShareInvite('qrcode', {
    id: 'inv-qr-0901',
    code: 'QR-2026-G6E1R',
    batchName: '舆情监测科扫码入组-20260901',
    orgIds: ['org-2-1'],
    roles: ['网格员'],
    expiresAt: '2026-09-30T23:59',
    createdAt: '2026-09-01T09:00',
    qrLimit: 50,
    scannedCount: 37
  }),
  ...buildBatchActivationCodes(
    {
      batchId: 'batch-ac-0825',
      batchName: '应急值守班批量邀请-20260825',
      orgIds: ['org-1-2-1'],
      roles: ['网格员'],
      expiresAt: '2026-09-10T23:59',
      createdAt: '2026-08-25T16:00'
    },
    ['SB-2026-J2K8L', 'SB-2026-T4N6P', 'SB-2026-V9B3Q', 'SB-2026-X1D5R', 'SB-2026-B6F2S', 'SB-2026-G8H4T'],
    [
      { name: '徐晨阳', phone: '13611208842' },
      { name: '胡海燕', phone: '13798763315' },
      { name: '朱立伟', phone: '13566017729' },
      { name: '高嘉欣', phone: '13843215568' },
      { name: '何文博', phone: '13955890174' }
    ]
  )
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
  followers: OfficialAccountFollower[];
  setFollowers: Dispatch<SetStateAction<OfficialAccountFollower[]>>;
}

const isSameWechatUser = (follower: OfficialAccountFollower, person: PersonnelItem) =>
  Boolean(
    (follower.wechatAlias && person.wechat === follower.wechatAlias) ||
      (follower.phone && person.phone === follower.phone)
  );

/** 账号删除后：仍关注公众号则回到「已关注未激活」，已取消关注则不再显示 */
export const syncFollowersAfterDelete = (
  person: PersonnelItem,
  setFollowers: Dispatch<SetStateAction<OfficialAccountFollower[]>>
) => {
  const stillFollowing = (person.followStatus || '已关注') === '已关注';
  setFollowers((prev) => {
    const rest = prev.filter((follower) => !isSameWechatUser(follower, person));
    if (!stillFollowing) return rest;
    const existing = prev.find((follower) => isSameWechatUser(follower, person));
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    return [
      existing || {
        id: `flw-p${person.id}-${now.getTime()}`,
        nickname: person.nickname || person.realName,
        avatarUrl: person.avatarUrl || '',
        wechatAlias: person.wechat,
        phone: person.phone || undefined,
        followTime: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
      },
      ...rest
    ];
  });
};

export const useUserOrgSharedState = (): UserOrgSharedState => {
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [orgNodes, setOrgNodes] = useState<OrgNode[]>(INITIAL_ORG_NODES);
  const [personnelList, setPersonnelList] = useState<PersonnelItem[]>(INITIAL_PERSONNEL);
  const [groups, setGroups] = useState<PersonnelGroup[]>(INITIAL_GROUPS);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>(INITIAL_INVITE_CODES);
  const [followers, setFollowers] = useState<OfficialAccountFollower[]>(INITIAL_FOLLOWERS);

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
    setInviteCodes,
    followers,
    setFollowers
  };
};

export const ORG_PATH_SEPARATOR = '/';

export const getOrgById = (orgNodes: OrgNode[], orgId?: string | null) =>
  orgId ? orgNodes.find((node) => node.id === orgId) : undefined;

export const getOrgChildrenOf = (orgNodes: OrgNode[], parentId: string | null) =>
  orgNodes
    .filter((node) => (node.parentId ?? null) === parentId)
    .sort((a, b) => (b.sortOrder || 0) - (a.sortOrder || 0) || a.name.localeCompare(b.name, 'zh-CN'));

/** 选中节点及其全部下级（含自身） */
export const getOrgSubtreeIds = (orgNodes: OrgNode[], orgId: string): string[] => {
  const ids: string[] = [];
  const walk = (id: string) => {
    ids.push(id);
    getOrgChildrenOf(orgNodes, id).forEach((child) => walk(child.id));
  };
  walk(orgId);
  return ids;
};

export const getOrgSubtreeNames = (orgNodes: OrgNode[], orgId: string): string[] =>
  getOrgSubtreeIds(orgNodes, orgId)
    .map((id) => getOrgById(orgNodes, id)?.name)
    .filter((name): name is string => Boolean(name));

/**
 * 上报机构筛选：未选=全部；选中某节点时匹配该节点及子级机构名称
 * （数据来源：外部联系人 - 外部组织管理）
 */
export const matchOrganizationByFilter = (
  organization: string | undefined,
  selectedOrgId: string | null | undefined,
  orgNodes: OrgNode[]
): boolean => {
  if (!selectedOrgId) return true;
  const org = (organization || '').trim();
  if (!org) return false;
  const names = getOrgSubtreeNames(orgNodes, selectedOrgId);
  if (names.some((name) => name === org || org.includes(name))) return true;
  return false;
};

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

/** 历史角色名兼容：上报员 → 网格员 */
export const normalizeAccountRole = (role: string) => (role === '上报员' ? '网格员' : role);

export const normalizeAccountRoles = (roles?: string[]) =>
  (roles || []).map(normalizeAccountRole).filter(Boolean);

export const getRoleBadgeClass = (role: string) => {
  switch (normalizeAccountRole(role)) {
    case '超级管理员':
    case '机构管理员':
    case '管理员':
      return 'bg-blue-100/80 text-blue-700 border border-blue-200';
    case '审核员':
    case '临时审核员':
      return 'bg-amber-100/80 text-amber-700 border border-amber-200';
    case '网格员':
      return 'bg-emerald-100/80 text-emerald-700 border border-emerald-200';
    case '节点负责人':
      return 'bg-violet-100/80 text-violet-700 border border-violet-200';
    case '系统管理员':
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
