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
  /** 加入后默认归属的用户群组（可选） */
  groupIds?: string[];
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
    id: 'org-2-2',
    categoryId: 'cat-1',
    parentId: 'org-2',
    name: '西坝区环保局',
    code: 'WXB-XB-HB',
    leaderName: '张三',
    leaderPhone: '13888889210',
    systemVersion: '正式版',
    expireDate: '2026-12-31',
    sortOrder: 95,
    allowSubOrgCreation: true
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
    activationFields: {
      idCardNo: '3401041986****1133',
      bankCardNo: '6222 **** **** 1133',
      bankName: '中国银行台中支行',
      emergencyContact: '陈静',
      emergencyPhone: '138****1133'
    }
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
    activationFields: {
      idCardNo: '3401041990****6688',
      bankCardNo: '6217 **** **** 6688',
      bankName: '中国建设银行台中支行',
      emergencyContact: '唐磊',
      emergencyPhone: '138****6688'
    }
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
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&h=128&fit=crop&crop=face',
    activationFields: {
      idCardNo: '3401041994****2244',
      bankCardNo: '6228 **** **** 2244',
      bankName: '中国工商银行台中支行',
      emergencyContact: '梁峰',
      emergencyPhone: '139****2244'
    }
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

/** 激活码管理三态实验数据：待激活 / 已激活 / 已失效 */
export const INITIAL_INVITE_CODES: InviteCode[] = [
  // —— 待激活 ——
  {
    id: 'inv-pending-code-1',
    code: 'SB-2026-P001A',
    batchId: 'batch-pending-code',
    batchName: '邀请批次-20261024-01',
    orgIds: ['org-1-1'],
    roles: ['网格员'],
    groupIds: ['grp-emergency'],
    expiresAt: '2026-10-25T09:12',
    createdAt: '2026-10-24T09:12',
    status: '未使用',
    channel: 'activation_code',
    createdBy: '系统管理员'
  },
  {
    id: 'inv-pending-code-2',
    code: 'SB-2026-P001B',
    batchId: 'batch-pending-code',
    batchName: '邀请批次-20261024-01',
    orgIds: ['org-1-1'],
    roles: ['网格员'],
    groupIds: ['grp-emergency'],
    expiresAt: '2026-10-25T09:12',
    createdAt: '2026-10-24T09:12',
    status: '未使用',
    channel: 'activation_code',
    createdBy: '系统管理员'
  },
  {
    id: 'inv-pending-code-3',
    code: 'SB-2026-P001C',
    batchId: 'batch-pending-code',
    batchName: '邀请批次-20261024-01',
    orgIds: ['org-1-1'],
    roles: ['网格员'],
    groupIds: ['grp-emergency'],
    expiresAt: '2026-10-25T09:12',
    createdAt: '2026-10-24T09:12',
    status: '未使用',
    channel: 'activation_code',
    createdBy: '系统管理员'
  },
  {
    id: 'inv-pending-qr',
    code: 'QR-2026-PENDING',
    batchId: 'batch-pending-qr',
    batchName: '西坝街道扫码邀请',
    orgIds: ['org-2-1'],
    roles: ['网格员', '上报员'],
    groupIds: ['grp-xb-env'],
    expiresAt: '2026-10-26T14:30',
    createdAt: '2026-10-23T14:30',
    status: '未使用',
    channel: 'qrcode',
    createdBy: '系统管理员',
    qrLimit: 8,
    scannedCount: 2
  },
  {
    id: 'inv-pending-link',
    code: 'LK-2026-PENDING',
    batchId: 'batch-pending-link',
    batchName: '河长制链接邀请',
    orgIds: ['org-2-2'],
    roles: ['网格员'],
    groupIds: ['grp-xb-river'],
    expiresAt: '2026-10-31T08:05',
    createdAt: '2026-10-24T08:05',
    status: '未使用',
    channel: 'link',
    createdBy: '系统管理员',
    qrLimit: 5,
    scannedCount: 0
  },

  // —— 已激活 ——
  {
    id: 'inv-done-code-1',
    code: 'SB-2026-D002A',
    batchId: 'batch-done-code',
    batchName: '邀请批次-20261020-03',
    orgIds: ['org-1-2'],
    roles: ['审核员'],
    groupIds: ['grp-duty'],
    expiresAt: '2026-10-23T10:40',
    createdAt: '2026-10-20T10:40',
    status: '已使用',
    channel: 'activation_code',
    createdBy: '系统管理员',
    usedByName: '林雅婷',
    usedByPhone: '13851001234',
    usedAt: '2026-10-21T09:18'
  },
  {
    id: 'inv-done-code-2',
    code: 'SB-2026-D002B',
    batchId: 'batch-done-code',
    batchName: '邀请批次-20261020-03',
    orgIds: ['org-1-2'],
    roles: ['审核员'],
    groupIds: ['grp-duty'],
    expiresAt: '2026-10-23T10:40',
    createdAt: '2026-10-20T10:40',
    status: '已使用',
    channel: 'activation_code',
    createdBy: '系统管理员',
    usedByName: '陈志豪',
    usedByPhone: '13952002345',
    usedAt: '2026-10-21T11:02'
  },
  {
    id: 'inv-done-qr',
    code: 'QR-2026-DONE',
    batchId: 'batch-done-qr',
    batchName: '融媒协同扫码邀请',
    orgIds: ['org-3'],
    roles: ['网格员'],
    groupIds: ['grp-media'],
    expiresAt: '2026-10-25T16:20',
    createdAt: '2026-10-18T16:20',
    status: '已使用',
    channel: 'qrcode',
    createdBy: '系统管理员',
    qrLimit: 3,
    scannedCount: 3
  },
  {
    id: 'inv-done-link',
    code: 'LK-2026-DONE',
    batchId: 'batch-done-link',
    batchName: '热点导控链接邀请',
    orgIds: ['org-1'],
    roles: ['上报员'],
    groupIds: ['grp-hotspot'],
    expiresAt: '2026-10-20T11:05',
    createdAt: '2026-10-19T11:05',
    status: '已使用',
    channel: 'link',
    createdBy: '系统管理员',
    qrLimit: 2,
    scannedCount: 2
  },

  // —— 已失效 ——
  {
    id: 'inv-expired-code-1',
    code: 'SB-2026-E003A',
    batchId: 'batch-expired-code',
    batchName: '邀请批次-20261010-02',
    orgIds: ['org-4'],
    roles: ['网格员'],
    expiresAt: '2026-10-11T09:00',
    createdAt: '2026-10-10T09:00',
    status: '已过期',
    channel: 'activation_code',
    createdBy: '系统管理员'
  },
  {
    id: 'inv-expired-code-2',
    code: 'SB-2026-E003B',
    batchId: 'batch-expired-code',
    batchName: '邀请批次-20261010-02',
    orgIds: ['org-4'],
    roles: ['网格员'],
    expiresAt: '2026-10-11T09:00',
    createdAt: '2026-10-10T09:00',
    status: '已过期',
    channel: 'activation_code',
    createdBy: '系统管理员'
  },
  {
    id: 'inv-expired-qr',
    code: 'QR-2026-EXPIRED',
    batchId: 'batch-expired-qr',
    batchName: '夜间值班扫码邀请',
    orgIds: ['org-2'],
    roles: ['网格员'],
    groupIds: ['grp-xb-night'],
    expiresAt: '2026-10-15T20:10',
    createdAt: '2026-10-12T20:10',
    status: '未使用',
    channel: 'qrcode',
    createdBy: '系统管理员',
    qrLimit: 6,
    scannedCount: 1
  },
  {
    id: 'inv-invalid-link',
    code: 'LK-2026-INVALID',
    batchId: 'batch-invalid-link',
    batchName: '已作废链接邀请',
    orgIds: ['org-1-1-1'],
    roles: ['审核员'],
    groupIds: ['grp-cybersecurity'],
    expiresAt: '2026-10-29T13:40',
    createdAt: '2026-10-22T13:40',
    status: '未使用',
    channel: 'link',
    createdBy: '系统管理员',
    qrLimit: 4,
    scannedCount: 0,
    invalidatedAt: '2026-10-23T10:15',
    invalidateReason: '邀请配置调整，手动作废',
    invalidatedBy: '系统管理员'
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
  // 邀请用户历史记录默认从空状态开始；后续邀请在当前会话中正常累计。
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
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

/** 组织树根配额上限（与外部组织管理一致） */
export const ORG_TREE_QUOTA_LIMIT = 500;

/** 节点人员配额：本节点未设置时向上继承，最终回落根配额 */
export const getOrgNodeCapacity = (orgNodes: OrgNode[], orgId?: string | null): number => {
  if (!orgId) return ORG_TREE_QUOTA_LIMIT;
  const node = getOrgById(orgNodes, orgId);
  if (!node) return ORG_TREE_QUOTA_LIMIT;
  return node.quota ?? getOrgNodeCapacity(orgNodes, node.parentId);
};

/** 各节点人数（含下级，挂到祖先链） */
export const buildOrgHeadcount = (
  orgNodes: OrgNode[],
  personnel: Array<Pick<PersonnelItem, 'orgIds' | 'primaryOrgId' | 'recycled'>>
): Record<string, number> => {
  const acc: Record<string, number> = {};
  for (const person of personnel) {
    if (person.recycled) continue;
    const personOrgId = getDeepestOrgId(orgNodes, person.orgIds, person.primaryOrgId);
    if (!personOrgId) continue;
    for (const id of buildOrgIdPath(orgNodes, personOrgId)) {
      acc[id] = (acc[id] || 0) + 1;
    }
  }
  return acc;
};

/** 组织节点剩余可用额度 */
export const getOrgNodeRemainingSeats = (
  orgNodes: OrgNode[],
  orgHeadcount: Record<string, number>,
  orgId: string
) => Math.max(0, getOrgNodeCapacity(orgNodes, orgId) - (orgHeadcount[orgId] || 0));

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
