/** 外部联系人组织树（与客户管理端种子数据对齐，供上报机构筛选下钻） */
export interface OrgNode {
  id: string;
  categoryId: string;
  parentId?: string | null;
  name: string;
  code?: string;
  leaderName?: string;
  leaderPhone?: string;
  systemVersion?: string;
  expireDate?: string;
  sortOrder?: number;
  allowSubOrgCreation?: boolean;
}

export const INITIAL_ORG_NODES = [
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

export const getOrgFullPath = (orgNodes: OrgNode[], orgId?: string, separator = ' / ') =>
  buildOrgIdPath(orgNodes, orgId)
    .map((id) => getOrgById(orgNodes, id)?.name || id)
    .join(separator);

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

export const matchOrganizationByFilter = (
  organization: string | undefined,
  selectedOrgId: string | null | undefined,
  orgNodes: OrgNode[]
): boolean => {
  if (!selectedOrgId) return true;
  const org = (organization || '').trim();
  if (!org) return false;
  const names = getOrgSubtreeNames(orgNodes, selectedOrgId);
  return names.some((name) => name === org || org.includes(name));
};
