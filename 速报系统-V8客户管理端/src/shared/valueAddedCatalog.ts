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
    names: ['首发查重', '报送首发重复识别'],
  },
  {
    ids: ['va_7', 'vas-ai-text-extract'],
    dictCodes: ['VA_AI_TEXT_EXTRACT'],
    names: ['文本提取', 'AI文本提取', 'AI基础文本提取'],
  },
  {
    ids: ['va_8', 'vas-ocr-recognize'],
    dictCodes: ['VA_OCR_RECOGNIZE'],
    names: ['图片OCR提取', 'OCR识别', '图文OCR识别'],
  },
  {
    ids: ['va_9', 'vas-ai-multimodal-deep'],
    dictCodes: ['VA_AI_MULTIMODAL_DEEP'],
    names: ['多模态提取', 'AI多模态提取', 'AI多模态深度解析', '多模态深度解析'],
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

const sanitizeCatalogItems = (items: ValueAddedCatalogItem[]): ValueAddedCatalogItem[] =>
  items
    .filter(
      (i) =>
        i.id !== 'vas-link-multimodal-ai' &&
        i.dictCode !== 'VA_LINK_MULTIMODAL_AI' &&
        !(i.name || '').includes('AI链接多模态识别')
    )
    .map((i) => {
      if (
        i.dictCode === 'VA_REPORT_DUPLICATE_IDENTIFICATION' ||
        i.dictCode === 'VA_FIRST_DUPLICATE_IDENTIFY' ||
        i.id === 'va_5' ||
        i.id === 'va_dup' ||
        i.name === '报送首发重复识别' ||
        i.name === '首发查重'
      ) {
        return {
          ...i,
          name: '首发查重',
        };
      }
      if (
        i.dictCode === 'VA_AI_TEXT_EXTRACT' ||
        i.id === 'va_7' ||
        i.id === 'vas-ai-text-extract' ||
        i.name === 'AI基础文本提取' ||
        i.name === '文本提取' || i.name === 'AI文本提取'
      ) {
        return {
          ...i,
          id: i.id || 'va_7',
          dictCode: 'VA_AI_TEXT_EXTRACT',
          name: '文本提取',
          description:
            i.description && !i.description.includes('链接后一键')
              ? i.description
              : '从粘贴正文或附件文本中抽取标题、摘要、属地、时间等并回填模板字段，提升结构化录入效率',
        };
      }
      return i;
    });

export const readValueAddedCatalog = (): ValueAddedCatalogItem[] =>
  sanitizeCatalogItems(readStore().items);

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
    // 目录若仍残留旧「链接多模态」名称，不覆盖本地已对齐项
    if ((matched.name || '').includes('AI链接多模态识别')) return item;
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
