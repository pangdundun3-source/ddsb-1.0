/** 读取客户管理端/应用端发布的增值业务开通与启禁状态（跨端口 cookie） */

export const VALUE_ADDED_PROVISION_STORAGE_KEY = 'ddsb_value_added_provision';
export const VALUE_ADDED_PROVISION_COOKIE_KEY = 'ddsb_va_prov';
export const VALUE_ADDED_CLIENT_STATUS_KEY = 'ddsb_va_client_status';
export const VALUE_ADDED_CLIENT_STATUS_COOKIE_KEY = 'ddsb_va_client';

type OrgProvisionMap = Record<string, boolean>;
type ProvisionStore = { byOrg: Record<string, OrgProvisionMap>; latest: OrgProvisionMap };

type ClientStatusItem = {
  id?: string;
  dictCode?: string;
  name?: string;
  status?: string;
  activatedStatus?: string;
};

type ClientStatusStore = { items: ClientStatusItem[]; updatedAt: string };

const readCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const parseProvision = (raw: string | null | undefined): ProvisionStore | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ProvisionStore;
    return {
      byOrg: parsed?.byOrg && typeof parsed.byOrg === 'object' ? parsed.byOrg : {},
      latest: parsed?.latest && typeof parsed.latest === 'object' ? parsed.latest : {},
    };
  } catch {
    return null;
  }
};

const hasProvision = (store: ProvisionStore | null) =>
  Boolean(
    store &&
      ((store.latest && Object.keys(store.latest).length > 0) ||
        (store.byOrg && Object.keys(store.byOrg).length > 0))
  );

const readProvisionStore = (): ProvisionStore => {
  try {
    const fromLs = parseProvision(localStorage.getItem(VALUE_ADDED_PROVISION_STORAGE_KEY));
    if (hasProvision(fromLs)) return fromLs!;
  } catch {
    // ignore
  }
  return parseProvision(readCookie(VALUE_ADDED_PROVISION_COOKIE_KEY)) || { byOrg: {}, latest: {} };
};

const parseClient = (raw: string | null | undefined): ClientStatusStore | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ClientStatusStore;
    if (!parsed || !Array.isArray(parsed.items)) return null;
    return { items: parsed.items, updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '' };
  } catch {
    return null;
  }
};

const readClientStore = (): ClientStatusStore | null => {
  let fromLs: ClientStatusStore | null = null;
  try {
    fromLs = parseClient(localStorage.getItem(VALUE_ADDED_CLIENT_STATUS_KEY));
  } catch {
    // ignore
  }
  const fromCookie = parseClient(readCookie(VALUE_ADDED_CLIENT_STATUS_COOKIE_KEY));
  // 多端口 suite：cookie 跨端口共享，localStorage 按端口隔离。取 updatedAt 更新的一份，避免旧 LS 盖住客户管理端最新启禁态。
  if (fromLs?.items?.length && fromCookie?.items?.length) {
    return (fromCookie.updatedAt || '') >= (fromLs.updatedAt || '') ? fromCookie : fromLs;
  }
  if (fromLs?.items?.length) return fromLs;
  return fromCookie;
};

const readCurrentOrgName = () => {
  try {
    return localStorage.getItem('ddsb_current_org') || '';
  } catch {
    return '';
  }
};

const lookupActivated = (
  map: OrgProvisionMap,
  item: { dictCode?: string; name?: string }
): boolean | undefined => {
  if (!map || Object.keys(map).length === 0) return undefined;
  if (item.dictCode && item.dictCode in map) return map[item.dictCode];
  if (item.name && `name:${item.name}` in map) return map[`name:${item.name}`];
  return undefined;
};

const matchClientItem = (
  items: ClientStatusItem[],
  opts: { dictCode?: string; nameIncludes?: string }
) =>
  items.find(
    (item) =>
      (opts.dictCode && item.dictCode === opts.dictCode) ||
      (opts.nameIncludes && (item.name || '').includes(opts.nameIncludes))
  );

export const isValueAddedServiceEnabled = (opts: {
  dictCode?: string;
  nameIncludes?: string;
}): boolean => {
  const provision = readProvisionStore();
  const orgName = readCurrentOrgName().trim();
  const map = (orgName && provision.byOrg[orgName]) || provision.latest || {};
  const provisionActivated = lookupActivated(map, {
    dictCode: opts.dictCode,
    name: opts.nameIncludes,
  });
  // 应用端明确未开通时，以开通态为准（避免客户端缓存仍为启用）
  if (provisionActivated === false) return false;

  const store = readClientStore();
  if (store && store.items.length > 0) {
    const item = matchClientItem(store.items, opts);
    if (item) {
      return item.activatedStatus === '已开通' && item.status === '启用';
    }
  }

  // 无客户启禁快照时：跟随应用端开通态（开通后默认启用）
  return provisionActivated === true;
};

export const isExternalAuditEnabled = () =>
  isValueAddedServiceEnabled({
    dictCode: 'VA_EXTERNAL_CONTACT_AUDIT',
    nameIncludes: '外部审核',
  });

export const EXTERNAL_AUDIT_MODULE_TIP =
  '审核管理属于增值业务「外部审核」，暂未开通或已停用，请先联系相关人员开通后使用。';
