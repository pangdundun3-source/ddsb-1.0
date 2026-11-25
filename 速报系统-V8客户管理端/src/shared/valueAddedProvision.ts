/** 应用端机构增值业务「开通」状态 → 客户管理端联动
 * 同域用 localStorage；本地多端口 suite 用 cookie（localhost 跨端口共享）
 */

import {
  LINK_EXTRACT_PACKAGE_ANCHOR,
  LINK_EXTRACT_PACKAGES,
  resolveLinkExtractCapability,
  syncLinkExtractCapabilitiesFromPackages,
  type LinkExtractPackageId,
} from './valueAddedAiAlign';

export const VALUE_ADDED_PROVISION_STORAGE_KEY = 'ddsb_value_added_provision';
export const VALUE_ADDED_PROVISION_COOKIE_KEY = 'ddsb_va_prov';
export const VALUE_ADDED_PROVISION_EVENT = 'ddsb-value-added-provision-updated';

export type ValueAddedProvisionItem = {
  id?: string;
  name?: string;
  dictCode?: string;
  status?: string;
  activatedStatus?: string;
  linkPackageEnabled?: boolean;
};

type OrgProvisionMap = Record<string, boolean>;

type ProvisionStore = {
  byOrg: Record<string, OrgProvisionMap>;
  latest: OrgProvisionMap;
  byOrgExtras?: Record<string, unknown>;
  latestExtras?: Record<string, unknown>;
};

const emptyStore = (): ProvisionStore => ({
  byOrg: {},
  latest: {},
});

const parseStore = (raw: string | null | undefined): ProvisionStore | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ProvisionStore;
    return {
      byOrg: parsed?.byOrg && typeof parsed.byOrg === 'object' ? parsed.byOrg : {},
      latest: parsed?.latest && typeof parsed.latest === 'object' ? parsed.latest : {},
      byOrgExtras:
        parsed?.byOrgExtras && typeof parsed.byOrgExtras === 'object' ? parsed.byOrgExtras : {},
      latestExtras:
        parsed?.latestExtras && typeof parsed.latestExtras === 'object' ? parsed.latestExtras : {},
    };
  } catch {
    return null;
  }
};

const hasProvisionData = (store: ProvisionStore | null) =>
  Boolean(
    store &&
      ((store.latest && Object.keys(store.latest).length > 0) ||
        (store.byOrg && Object.keys(store.byOrg).length > 0))
  );

const readCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const writeCookie = (name: string, value: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
};

const readStore = (): ProvisionStore => {
  try {
    const fromLs = parseStore(localStorage.getItem(VALUE_ADDED_PROVISION_STORAGE_KEY));
    if (hasProvisionData(fromLs)) return fromLs!;
  } catch {
    // ignore
  }
  const fromCookie = parseStore(readCookie(VALUE_ADDED_PROVISION_COOKIE_KEY));
  return fromCookie || emptyStore();
};

export const readCurrentOrgName = () => {
  try {
    return localStorage.getItem('ddsb_current_org') || '';
  } catch {
    return '';
  }
};

export const readValueAddedProvisionMap = (orgName?: string | null): OrgProvisionMap => {
  const store = readStore();
  const key = (orgName || '').trim();
  if (key && store.byOrg[key]) return store.byOrg[key];
  return store.latest || {};
};

export const lookupValueAddedActivated = (
  map: OrgProvisionMap,
  item: Pick<ValueAddedProvisionItem, 'dictCode' | 'name'>
): boolean | undefined => {
  if (!map || Object.keys(map).length === 0) return undefined;
  if (item.dictCode && item.dictCode in map) return map[item.dictCode];
  if (item.name && `name:${item.name}` in map) return map[`name:${item.name}`];
  return undefined;
};

export const applyValueAddedProvision = <
  T extends {
    name: string;
    dictCode?: string;
    status: '启用' | '停用';
    activatedStatus?: '已开通' | '未开通';
    linkPackageEnabled?: boolean;
  }
>(
  list: T[],
  orgName?: string | null
): T[] => {
  const map = readValueAddedProvisionMap(orgName);
  if (!map || Object.keys(map).length === 0) {
    return list;
  }

  const withFlags = list.map((item) => {
    const activated = lookupValueAddedActivated(map, item);
    let next: T = item;
    if (activated === false) {
      next = {
        ...item,
        activatedStatus: '未开通' as const,
        status: '停用' as const,
        linkPackageEnabled: false,
      };
    } else if (activated === true && item.activatedStatus !== '已开通') {
      next = {
        ...item,
        activatedStatus: '已开通' as const,
        status: '启用' as const,
      };
    }

    const cap = resolveLinkExtractCapability(item);
    if (cap) {
      const pkgId = (Object.keys(LINK_EXTRACT_PACKAGE_ANCHOR) as LinkExtractPackageId[]).find(
        (id) => LINK_EXTRACT_PACKAGE_ANCHOR[id] === cap
      );
      if (pkgId && `pkg:${pkgId}` in map) {
        next = { ...next, linkPackageEnabled: Boolean(map[`pkg:${pkgId}`]) };
      }
    }
    return next;
  });

  // 有套餐开关时按并集回写能力开通态，保证链接「提取能力」可选
  const hasPkgFlags = LINK_EXTRACT_PACKAGES.some((pkg) => `pkg:${pkg.id}` in map);
  if (!hasPkgFlags) return withFlags;
  return syncLinkExtractCapabilitiesFromPackages(withFlags, undefined, {
    preserveEnableStatus: true,
  });
};
