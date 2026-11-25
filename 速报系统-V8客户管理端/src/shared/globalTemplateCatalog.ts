/** 应用端全局模板 → 客户管理端「使用全局标准模板」
 * - 同域 localStorage
 * - 本地 suite：门户 http://127.0.0.1:3000/api/suite-sync/global-templates 文件同步
 * - 门户 iframe：postMessage 中转
 * 不写大体积 cookie（会 431）
 */

export const GLOBAL_TEMPLATE_CATALOG_STORAGE_KEY = 'v8_template_board_data_global';
export const GLOBAL_TEMPLATE_CATALOG_EVENT = 'ddsb-global-template-catalog-updated';

export const SUITE_GLOBAL_TEMPLATE_PUBLISH = 'suite:global-template-catalog-publish';
export const SUITE_GLOBAL_TEMPLATE_REQUEST = 'suite:global-template-catalog-request';
export const SUITE_GLOBAL_TEMPLATE_RESPONSE = 'suite:global-template-catalog-response';

const LEGACY_COOKIE_META = 'ddsb_gtpl_meta';
const LEGACY_COOKIE_PREFIX = 'ddsb_gtpl_';

const SUITE_SYNC_URLS = [
  'http://127.0.0.1:3000/api/suite-sync/global-templates',
  'http://localhost:3000/api/suite-sync/global-templates',
];

export type GlobalTemplateCatalogItem = {
  id: string;
  name: string;
  templateType?: '报送' | '激活';
  status?: '启用' | '停用' | string;
  description?: string;
  fields?: unknown[];
  [key: string]: unknown;
};

let memoryCache: GlobalTemplateCatalogItem[] | null = null;
let parentBridgeBound = false;
let legacyCookiesCleared = false;
let apiRefreshInFlight: Promise<void> | null = null;

const clearCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

export const clearLegacyGlobalTemplateCookies = () => {
  if (typeof document === 'undefined' || legacyCookiesCleared) return;
  legacyCookiesCleared = true;
  let count = 0;
  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${LEGACY_COOKIE_META}=([^;]*)`)
    );
    if (match) {
      const meta = JSON.parse(decodeURIComponent(match[1])) as { count?: number };
      count = Number(meta?.count) || 0;
    }
  } catch {
    count = 0;
  }
  for (let i = 0; i < Math.max(count, 64); i++) {
    clearCookie(`${LEGACY_COOKIE_PREFIX}${i}`);
  }
  clearCookie(LEGACY_COOKIE_META);
};

const slimField = (field: unknown): unknown => {
  if (!field || typeof field !== 'object') return field;
  const f = field as Record<string, unknown>;
  const next: Record<string, unknown> = {
    id: f.id,
    name: f.name,
    type: f.type,
    required: f.required,
  };
  if (f.placeholder != null) next.placeholder = f.placeholder;
  if (Array.isArray(f.options)) next.options = f.options;
  if (f.linkFeatures != null) next.linkFeatures = f.linkFeatures;
  if (f.features != null) next.features = f.features;
  if (f.locked != null) next.locked = f.locked;
  if (f.isFixed != null) next.isFixed = f.isFixed;
  if (f.fixedKey != null) next.fixedKey = f.fixedKey;
  return next;
};

export const slimGlobalTemplateCatalog = (
  templates: GlobalTemplateCatalogItem[]
): GlobalTemplateCatalogItem[] =>
  (Array.isArray(templates) ? templates : [])
    .filter((t) => t && typeof t.id === 'string' && typeof t.name === 'string')
    .map((t) => ({
      id: t.id,
      name: t.name,
      templateType: (t.templateType || '报送') as '报送' | '激活',
      status: (t.status || '启用') as '启用' | '停用' | string,
      description: typeof t.description === 'string' ? t.description : '',
      fields: Array.isArray(t.fields) ? t.fields.map(slimField) : [],
    }));

const parseList = (raw: string | null | undefined): GlobalTemplateCatalogItem[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is GlobalTemplateCatalogItem =>
        !!item && typeof item === 'object' && typeof item.id === 'string' && typeof item.name === 'string'
    );
  } catch {
    return [];
  }
};

const applyCatalog = (list: GlobalTemplateCatalogItem[]) => {
  const slim = slimGlobalTemplateCatalog(list);
  memoryCache = slim;
  try {
    localStorage.setItem(GLOBAL_TEMPLATE_CATALOG_STORAGE_KEY, JSON.stringify(slim));
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(GLOBAL_TEMPLATE_CATALOG_EVENT));
  }
  return slim;
};

const isEmbeddedInPortal = () => {
  try {
    return typeof window !== 'undefined' && window.parent != null && window.parent !== window;
  } catch {
    return false;
  }
};

const publishToPortalParent = (templates: GlobalTemplateCatalogItem[]) => {
  if (!isEmbeddedInPortal()) return;
  try {
    window.parent.postMessage({ type: SUITE_GLOBAL_TEMPLATE_PUBLISH, items: templates }, '*');
  } catch {
    // ignore
  }
};

const requestFromPortalParent = () => {
  if (!isEmbeddedInPortal()) return;
  try {
    window.parent.postMessage({ type: SUITE_GLOBAL_TEMPLATE_REQUEST }, '*');
  } catch {
    // ignore
  }
};

const publishToSuiteApi = async (templates: GlobalTemplateCatalogItem[]) => {
  const body = JSON.stringify({ items: templates });
  for (const url of SUITE_SYNC_URLS) {
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (res.ok) return;
    } catch {
      // try next
    }
  }
};

export const refreshGlobalTemplateCatalogFromApi = async (): Promise<GlobalTemplateCatalogItem[]> => {
  for (const url of SUITE_SYNC_URLS) {
    try {
      const res = await fetch(url, { method: 'GET', cache: 'no-store' });
      if (!res.ok) continue;
      const data = (await res.json()) as { items?: GlobalTemplateCatalogItem[] };
      const items = Array.isArray(data.items) ? data.items : [];
      if (items.length > 0) {
        return applyCatalog(items);
      }
    } catch {
      // try next
    }
  }
  return memoryCache || [];
};

const scheduleApiRefresh = () => {
  if (apiRefreshInFlight) return apiRefreshInFlight;
  apiRefreshInFlight = refreshGlobalTemplateCatalogFromApi().finally(() => {
    apiRefreshInFlight = null;
  });
  return apiRefreshInFlight;
};

export const bindGlobalTemplatePortalBridge = () => {
  if (typeof window === 'undefined' || parentBridgeBound) return;
  parentBridgeBound = true;
  clearLegacyGlobalTemplateCookies();
  window.addEventListener('message', (event: MessageEvent) => {
    const data = event.data;
    if (!data || data.type !== SUITE_GLOBAL_TEMPLATE_RESPONSE) return;
    const items = Array.isArray(data.items) ? (data.items as GlobalTemplateCatalogItem[]) : [];
    if (items.length === 0) return;
    applyCatalog(items);
  });
};

export const readGlobalTemplateCatalog = (): GlobalTemplateCatalogItem[] => {
  clearLegacyGlobalTemplateCookies();
  bindGlobalTemplatePortalBridge();
  requestFromPortalParent();
  void scheduleApiRefresh();

  if (memoryCache && memoryCache.length > 0) return memoryCache;

  try {
    const fromLs = parseList(localStorage.getItem(GLOBAL_TEMPLATE_CATALOG_STORAGE_KEY));
    if (fromLs.length > 0) {
      memoryCache = fromLs;
      return fromLs;
    }
  } catch {
    // ignore
  }

  return [];
};

export const readEnabledGlobalTemplates = (
  templateType: '报送' | '激活'
): GlobalTemplateCatalogItem[] =>
  readGlobalTemplateCatalog().filter(
    (t) => t.status === '启用' && (t.templateType || '报送') === templateType && Array.isArray(t.fields)
  );

export const publishGlobalTemplateCatalog = (templates: GlobalTemplateCatalogItem[]) => {
  clearLegacyGlobalTemplateCookies();
  const slim = applyCatalog(templates);
  publishToPortalParent(slim);
  void publishToSuiteApi(slim);
};
