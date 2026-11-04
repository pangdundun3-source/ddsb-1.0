/** 客户管理端增值业务启禁状态（供审核转办、上报端审核菜单等跨页面/跨端口能力读取）
 * 同域用 localStorage；本地多端口 suite 用 cookie（localhost 跨端口共享）
 */

import {
  lookupValueAddedActivated,
  readValueAddedProvisionMap,
  readCurrentOrgName,
} from './valueAddedProvision';

export const VALUE_ADDED_CLIENT_STATUS_KEY = 'ddsb_va_client_status';
export const VALUE_ADDED_CLIENT_STATUS_COOKIE_KEY = 'ddsb_va_client';
export const VALUE_ADDED_CLIENT_STATUS_EVENT = 'ddsb-va-client-status-updated';

export type ValueAddedClientStatusItem = {
  id?: string;
  dictCode?: string;
  name?: string;
  status?: string;
  activatedStatus?: string;
};

type ClientStatusStore = {
  items: ValueAddedClientStatusItem[];
  updatedAt: string;
};

const parseStore = (raw: string | null | undefined): ClientStatusStore | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ClientStatusStore;
    if (!parsed || !Array.isArray(parsed.items)) return null;
    return {
      items: parsed.items,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
    };
  } catch {
    return null;
  }
};

const hasStoreData = (store: ClientStatusStore | null) => Boolean(store && store.items.length > 0);

const readCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const writeCookie = (name: string, value: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
};

const readStore = (): ClientStatusStore | null => {
  let fromLs: ClientStatusStore | null = null;
  try {
    fromLs = parseStore(localStorage.getItem(VALUE_ADDED_CLIENT_STATUS_KEY));
  } catch {
    // ignore
  }
  const fromCookie = parseStore(readCookie(VALUE_ADDED_CLIENT_STATUS_COOKIE_KEY));
  // 多端口 suite：cookie 跨端口共享，localStorage 按端口隔离。取 updatedAt 更新的一份。
  if (hasStoreData(fromLs) && hasStoreData(fromCookie)) {
    return (fromCookie!.updatedAt || '') >= (fromLs!.updatedAt || '') ? fromCookie : fromLs;
  }
  if (hasStoreData(fromLs)) return fromLs;
  return fromCookie;
};

export const publishValueAddedClientStatus = (items: ValueAddedClientStatusItem[]) => {
  const store: ClientStatusStore = {
    items: (items || []).map((i) => ({
      id: i.id,
      dictCode: i.dictCode,
      name: i.name,
      status: i.status,
      activatedStatus: i.activatedStatus,
    })),
    updatedAt: new Date().toISOString(),
  };
  const raw = JSON.stringify(store);
  try {
    localStorage.setItem(VALUE_ADDED_CLIENT_STATUS_KEY, raw);
  } catch {
    // ignore
  }
  try {
    writeCookie(VALUE_ADDED_CLIENT_STATUS_COOKIE_KEY, raw);
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(VALUE_ADDED_CLIENT_STATUS_EVENT));
  }
};

const matchItem = (
  items: ValueAddedClientStatusItem[],
  opts: { dictCode?: string; nameIncludes?: string }
) =>
  items.find(
    (item) =>
      (opts.dictCode && item.dictCode === opts.dictCode) ||
      (opts.nameIncludes && (item.name || '').includes(opts.nameIncludes))
  );

/** 增值业务是否对业务功能可用：已开通且启用 */
export const isValueAddedServiceEnabled = (opts: {
  dictCode?: string;
  nameIncludes?: string;
}): boolean => {
  const map = readValueAddedProvisionMap(readCurrentOrgName());
  const provisionActivated = lookupValueAddedActivated(map, {
    dictCode: opts.dictCode,
    name: opts.nameIncludes,
  });
  // 应用端明确未开通时，以开通态为准（避免客户端缓存仍为启用）
  if (provisionActivated === false) return false;

  const store = readStore();
  if (store && store.items.length > 0) {
    const item = matchItem(store.items, opts);
    if (item) {
      return item.activatedStatus === '已开通' && item.status === '启用';
    }
  }

  // 尚未写入客户启禁快照时：跟随应用端开通态（开通后默认启用）
  return provisionActivated === true;
};

export const isInstructionFlowEnabled = () =>
  isValueAddedServiceEnabled({
    dictCode: 'VA_INSTRUCTION_FLOW',
    nameIncludes: '指令流转',
  });

export const isExternalAuditEnabled = () =>
  isValueAddedServiceEnabled({
    dictCode: 'VA_EXTERNAL_CONTACT_AUDIT',
    nameIncludes: '外部审核',
  });

export const INSTRUCTION_FLOW_TRANSFER_TIP =
  '转办属于增值业务「指令流转」，暂未开通或已停用，请先联系相关人员开通后使用。';

export const EXTERNAL_AUDIT_MODULE_TIP =
  '审核管理属于增值业务「外部审核」，暂未开通或已停用，请先联系相关人员开通后使用。';
