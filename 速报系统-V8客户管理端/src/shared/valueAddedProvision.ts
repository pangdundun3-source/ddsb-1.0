/** 应用端机构增值业务「开通」状态 → 客户管理端联动
 * 同域用 localStorage；本地多端口 suite 用 cookie（localhost 跨端口共享）
 */

import {
  LinkMultimodalMode,
  LINK_MULTIMODAL_DICT_CODE,
  isLinkMultimodalValueAdded,
  normalizeLinkMultimodalModes,
} from './linkMultimodalModes';

export const VALUE_ADDED_PROVISION_STORAGE_KEY = 'ddsb_value_added_provision';
export const VALUE_ADDED_PROVISION_COOKIE_KEY = 'ddsb_va_prov';
export const VALUE_ADDED_PROVISION_EVENT = 'ddsb-value-added-provision-updated';

export type ValueAddedProvisionItem = {
  id?: string;
  name?: string;
  dictCode?: string;
  status?: string;
  activatedStatus?: string;
  linkMultimodalModes?: LinkMultimodalMode[];
};

type OrgProvisionMap = Record<string, boolean>;
type OrgProvisionExtras = Record<string, { linkMultimodalModes?: LinkMultimodalMode[] }>;

type ProvisionStore = {
  byOrg: Record<string, OrgProvisionMap>;
  latest: OrgProvisionMap;
  byOrgExtras?: Record<string, OrgProvisionExtras>;
  latestExtras?: OrgProvisionExtras;
};

const emptyStore = (): ProvisionStore => ({ byOrg: {}, latest: {}, byOrgExtras: {}, latestExtras: {} });

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

export const readValueAddedProvisionMap = (orgName?: string | null): OrgProvisionMap => {
  const store = readStore();
  const key = (orgName || '').trim();
  if (key && store.byOrg[key]) return store.byOrg[key];
  return store.latest || {};
};

export const readValueAddedProvisionExtras = (orgName?: string | null): OrgProvisionExtras => {
  const store = readStore();
  const key = (orgName || '').trim();
  if (key && store.byOrgExtras?.[key]) return store.byOrgExtras[key];
  return store.latestExtras || {};
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

const lookupLinkMultimodalModes = (
  extras: OrgProvisionExtras,
  item: Pick<ValueAddedProvisionItem, 'dictCode' | 'name'>
): LinkMultimodalMode[] | undefined => {
  if (!extras || Object.keys(extras).length === 0) return undefined;
  if (item.dictCode && extras[item.dictCode]?.linkMultimodalModes) {
    return extras[item.dictCode].linkMultimodalModes;
  }
  if (item.name && extras[`name:${item.name}`]?.linkMultimodalModes) {
    return extras[`name:${item.name}`].linkMultimodalModes;
  }
  if (extras[LINK_MULTIMODAL_DICT_CODE]?.linkMultimodalModes) {
    return extras[LINK_MULTIMODAL_DICT_CODE].linkMultimodalModes;
  }
  return undefined;
};

export const applyValueAddedProvision = <
  T extends {
    name: string;
    dictCode?: string;
    status: '启用' | '停用';
    activatedStatus?: '已开通' | '未开通';
    linkMultimodalModes?: LinkMultimodalMode[];
  }
>(
  list: T[],
  orgName?: string | null
): T[] => {
  const map = readValueAddedProvisionMap(orgName);
  const extras = readValueAddedProvisionExtras(orgName);
  if ((!map || Object.keys(map).length === 0) && (!extras || Object.keys(extras).length === 0)) {
    return list;
  }

  return list.map((item) => {
    let next: T = item;
    const activated = lookupValueAddedActivated(map, item);
    if (activated !== undefined) {
      if (!activated) {
        next = {
          ...next,
          activatedStatus: '未开通' as const,
          status: '停用' as const,
        };
      } else if (item.activatedStatus !== '已开通') {
        next = {
          ...next,
          activatedStatus: '已开通' as const,
          status: '启用' as const,
        };
      }
    }

    if (isLinkMultimodalValueAdded(item)) {
      const modes = lookupLinkMultimodalModes(extras, item);
      if (modes) {
        next = {
          ...next,
          linkMultimodalModes: normalizeLinkMultimodalModes(modes),
        };
      } else if (!next.linkMultimodalModes?.length) {
        next = {
          ...next,
          linkMultimodalModes: ['basic'],
        };
      }
    }

    return next;
  });
};

export const readCurrentOrgName = () => {
  try {
    return localStorage.getItem('ddsb_current_org') || '';
  } catch {
    return '';
  }
};
