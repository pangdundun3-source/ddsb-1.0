/** 应用端全局增值业务「名称/描述」→ 机构配置 & 客户管理端同步
 * 同域用 localStorage；本地多端口 suite 用 cookie（localhost 跨端口共享）
 */

export const VALUE_ADDED_CATALOG_STORAGE_KEY = 'ddsb_value_added_catalog';
export const VALUE_ADDED_CATALOG_COOKIE_KEY = 'ddsb_va_catalog';
export const VALUE_ADDED_CATALOG_EVENT = 'ddsb-value-added-catalog-updated';

export type ValueAddedCatalogItem = {
  id?: string;
  dictCode?: string;
  name: string;
  description?: string;
};

type CatalogStore = {
  items: ValueAddedCatalogItem[];
  updatedAt: string;
};

/** 历史数据中同一业务的多套稳定键，便于跨端匹配 */
const CATALOG_ALIASES: Array<{ ids: string[]; dictCodes: string[]; names: string[] }> = [
  {
    ids: ['va_5', 'va_dup'],
    dictCodes: ['VA_REPORT_DUPLICATE_IDENTIFICATION', 'VA_FIRST_DUPLICATE_IDENTIFY'],
    names: ['报送首发重复识别'],
  },
];

const emptyStore = (): CatalogStore => ({ items: [], updatedAt: '' });

const parseStore = (raw: string | null | undefined): CatalogStore | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CatalogStore;
    if (!parsed || !Array.isArray(parsed.items)) return null;
    return {
      items: parsed.items.filter((i) => i && typeof i.name === 'string' && i.name.trim()),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
    };
  } catch {
    return null;
  }
};

const hasCatalogData = (store: CatalogStore | null) => Boolean(store && store.items.length > 0);

const readCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const writeCookie = (name: string, value: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
};

const readStore = (): CatalogStore => {
  try {
    const fromLs = parseStore(localStorage.getItem(VALUE_ADDED_CATALOG_STORAGE_KEY));
    if (hasCatalogData(fromLs)) return fromLs!;
  } catch {
    // ignore
  }
  const fromCookie = parseStore(readCookie(VALUE_ADDED_CATALOG_COOKIE_KEY));
  return fromCookie || emptyStore();
};

const writeStore = (store: CatalogStore) => {
  const raw = JSON.stringify(store);
  try {
    localStorage.setItem(VALUE_ADDED_CATALOG_STORAGE_KEY, raw);
  } catch {
    // ignore
  }
  try {
    writeCookie(VALUE_ADDED_CATALOG_COOKIE_KEY, raw);
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(VALUE_ADDED_CATALOG_EVENT));
  }
};

const findAliasGroup = (item: Pick<ValueAddedCatalogItem, 'id' | 'dictCode' | 'name'>) =>
  CATALOG_ALIASES.find(
    (g) =>
      (item.id && g.ids.includes(item.id)) ||
      (item.dictCode && g.dictCodes.includes(item.dictCode)) ||
      (item.name && g.names.includes(item.name))
  );

export const matchValueAddedCatalogItem = <T extends Pick<ValueAddedCatalogItem, 'id' | 'dictCode' | 'name'>>(
  catalog: ValueAddedCatalogItem[],
  item: T
): ValueAddedCatalogItem | undefined => {
  if (!catalog.length) return undefined;
  if (item.dictCode) {
    const byCode = catalog.find((c) => c.dictCode && c.dictCode === item.dictCode);
    if (byCode) return byCode;
  }
  if (item.id) {
    const byId = catalog.find((c) => c.id && c.id === item.id);
    if (byId) return byId;
  }
  const alias = findAliasGroup(item);
  if (alias) {
    const byAlias = catalog.find(
      (c) =>
        (c.id && alias.ids.includes(c.id)) ||
        (c.dictCode && alias.dictCodes.includes(c.dictCode)) ||
        (c.name && alias.names.includes(c.name))
    );
    if (byAlias) return byAlias;
  }
  if (item.name) {
    return catalog.find((c) => c.name === item.name);
  }
  return undefined;
};

/** 全局配置保存增值名称/描述后发布，供机构端与客户管理端同步 */
export const publishValueAddedCatalog = (items: ValueAddedCatalogItem[]) => {
  const nextItems = (items || [])
    .filter((i) => i && typeof i.name === 'string' && i.name.trim())
    .map((i) => ({
      id: i.id,
      dictCode: i.dictCode,
      name: i.name.trim(),
      description: (i.description || '').trim(),
    }));
  writeStore({
    items: nextItems,
    updatedAt: new Date().toISOString(),
  });
};

export const readValueAddedCatalog = (): ValueAddedCatalogItem[] => readStore().items;

export const applyValueAddedCatalog = <
  T extends { id?: string; dictCode?: string; name: string; description?: string }
>(
  list: T[]
): T[] => {
  const catalog = readValueAddedCatalog();
  if (!catalog.length) return list;

  return list.map((item) => {
    const matched = matchValueAddedCatalogItem(catalog, item);
    if (!matched) return item;
    const nextName = matched.name;
    const nextDesc = matched.description ?? '';
    if (item.name === nextName && (item.description || '') === nextDesc) return item;
    return {
      ...item,
      name: nextName,
      description: nextDesc,
    };
  });
};

/** 判断两份列表在名称/描述层面是否一致（用于避免无意义 setState） */
export const isValueAddedCatalogApplied = <
  T extends { id?: string; name: string; description?: string }
>(
  prev: T[],
  next: T[]
) =>
  prev.length === next.length &&
  prev.every(
    (item, idx) =>
      item.id === next[idx]?.id &&
      item.name === next[idx]?.name &&
      (item.description || '') === (next[idx]?.description || '')
  );
