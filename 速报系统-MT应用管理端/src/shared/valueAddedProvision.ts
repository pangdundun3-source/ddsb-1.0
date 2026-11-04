/** 应用端机构增值业务「开通」状态 → 客户管理端联动
 * 同域用 localStorage；本地多端口 suite 用 cookie（localhost 跨端口共享）
 */

export const VALUE_ADDED_PROVISION_STORAGE_KEY = 'ddsb_value_added_provision';
export const VALUE_ADDED_PROVISION_COOKIE_KEY = 'ddsb_va_prov';
export const VALUE_ADDED_PROVISION_EVENT = 'ddsb-value-added-provision-updated';

export type ValueAddedProvisionItem = {
  id?: string;
  name?: string;
  dictCode?: string;
  status?: string;
  activatedStatus?: string;
};

type OrgProvisionMap = Record<string, boolean>;

type ProvisionStore = {
  byOrg: Record<string, OrgProvisionMap>;
  latest: OrgProvisionMap;
};

const emptyStore = (): ProvisionStore => ({ byOrg: {}, latest: {} });

const parseStore = (raw: string | null | undefined): ProvisionStore | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ProvisionStore;
    return {
      byOrg: parsed?.byOrg && typeof parsed.byOrg === 'object' ? parsed.byOrg : {},
      latest: parsed?.latest && typeof parsed.latest === 'object' ? parsed.latest : {}
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

const writeStore = (store: ProvisionStore) => {
  const raw = JSON.stringify(store);
  try {
    localStorage.setItem(VALUE_ADDED_PROVISION_STORAGE_KEY, raw);
  } catch {
    // ignore
  }
  try {
    writeCookie(VALUE_ADDED_PROVISION_COOKIE_KEY, raw);
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(VALUE_ADDED_PROVISION_EVENT));
  }
};

const toProvisionMap = (items: ValueAddedProvisionItem[]): OrgProvisionMap => {
  const map: OrgProvisionMap = {};
  items.forEach((item) => {
    const activated =
      item.activatedStatus === '已开通' ||
      (item.activatedStatus !== '未开通' && item.status === '启用');
    if (item.dictCode) map[item.dictCode] = activated;
    if (item.name) map[`name:${item.name}`] = activated;
  });
  return map;
};

/** 应用端机构侧开通/关闭后发布，供客户管理端同步 */
export const publishValueAddedProvision = (
  institutionName: string | undefined | null,
  items: ValueAddedProvisionItem[]
) => {
  const map = toProvisionMap(items);
  const store = readStore();
  store.latest = map;
  const orgName = (institutionName || '').trim();
  if (orgName) {
    store.byOrg[orgName] = map;
  }
  writeStore(store);
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
  }
>(
  list: T[],
  orgName?: string | null
): T[] => {
  const map = readValueAddedProvisionMap(orgName);
  if (!map || Object.keys(map).length === 0) return list;

  return list.map((item) => {
    const activated = lookupValueAddedActivated(map, item);
    if (activated === undefined) return item;
    if (!activated) {
      return {
        ...item,
        activatedStatus: '未开通' as const,
        status: '停用' as const
      };
    }
    // 应用端刚开通：机构端默认启用；已开通过的保留机构端启禁选择
    if (item.activatedStatus === '已开通') return item;
    return {
      ...item,
      activatedStatus: '已开通' as const,
      status: '启用' as const
    };
  });
};
