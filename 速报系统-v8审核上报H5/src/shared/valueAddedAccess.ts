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
      // 历史「未开通」快照：应用端未明确关闭时，按默认已开通且启用
      if (item.activatedStatus !== '已开通') return true;
      return item.status === '启用';
    }
  }

  // 无客户启禁快照、应用端也未明确关闭时：默认开通启用
  return true;
};

export const isExternalAuditEnabled = () =>
  isValueAddedServiceEnabled({
    dictCode: 'VA_EXTERNAL_CONTACT_AUDIT',
    nameIncludes: '外部审核',
  });

/** 外部审核不可用时的原因：应用端未开通 / 机构侧停用 */
export const getExternalAuditBlockReason = (): '未开通' | '已停用' => {
  const opts = { dictCode: 'VA_EXTERNAL_CONTACT_AUDIT', nameIncludes: '外部审核' };
  const provision = readProvisionStore();
  const orgName = readCurrentOrgName().trim();
  const map = (orgName && provision.byOrg[orgName]) || provision.latest || {};
  const provisionActivated = lookupActivated(map, {
    dictCode: opts.dictCode,
    name: opts.nameIncludes,
  });
  if (provisionActivated === false) return '未开通';

  const store = readClientStore();
  const item = store?.items?.length ? matchClientItem(store.items, opts) : undefined;
  if (item && item.activatedStatus === '已开通' && item.status !== '启用') return '已停用';
  return '未开通';
};

export const EXTERNAL_AUDIT_MODULE_TIP =
  '本机构的「外部审核」暂不可用，审核管理入口已关闭。如需使用，请联系相关人员开通或启用后再试。';

export const EXTERNAL_AUDIT_REPORT_TIP =
  '本机构的「外部审核」暂不可用，关联外部审核流程的报送模板暂时无法选用。';

export const getExternalAuditModuleTip = () => {
  const reason = getExternalAuditBlockReason();
  if (reason === '已停用') {
    return '本机构已停用增值业务「外部审核」，因此无法进入审核管理。如需使用，请联系本机构管理员在客户管理端重新启用。';
  }
  return '本机构尚未开通增值业务「外部审核」，因此无法进入审核管理。如需使用，请联系平台相关人员开通。';
};

/** 选用依赖外部审核流程的模板时的拦截文案 */
export const getExternalAuditTemplateTip = () => {
  const reason = getExternalAuditBlockReason();
  if (reason === '已停用') {
    return '本机构已停用增值业务「外部审核」，该模板关联的审核流程依赖外部审核，暂时无法选用。如需使用，请联系本机构管理员在客户管理端重新启用。';
  }
  return '本机构尚未开通增值业务「外部审核」，该模板关联的审核流程依赖外部审核，暂时无法选用。如需使用，请联系平台相关人员开通。';
};

/** 兼容旧命名 */
export const getExternalAuditReportTip = getExternalAuditTemplateTip;

/** 模板是否因外部审核未开通/停用而不可选 */
export const isTemplateBlockedByExternalAudit = (requiresExternalAudit?: boolean) =>
  Boolean(requiresExternalAudit) && !isExternalAuditEnabled();
