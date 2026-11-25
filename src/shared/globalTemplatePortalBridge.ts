/** 门户中转：应用端 iframe 发布全局模板 → 客户管理端 iframe 拉取
 * 仅用门户 localStorage，不写大体积 cookie（避免 Vite 431）
 */

export const GLOBAL_TEMPLATE_CATALOG_STORAGE_KEY = 'v8_template_board_data_global';

export const SUITE_GLOBAL_TEMPLATE_PUBLISH = 'suite:global-template-catalog-publish';
export const SUITE_GLOBAL_TEMPLATE_REQUEST = 'suite:global-template-catalog-request';
export const SUITE_GLOBAL_TEMPLATE_RESPONSE = 'suite:global-template-catalog-response';

const LEGACY_COOKIE_META = 'ddsb_gtpl_meta';
const LEGACY_COOKIE_PREFIX = 'ddsb_gtpl_';

export type PortalGlobalTemplateItem = {
  id: string;
  name: string;
  templateType?: string;
  status?: string;
  description?: string;
  fields?: unknown[];
  [key: string]: unknown;
};

let legacyCookiesCleared = false;

const clearCookie = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

export const clearLegacyGlobalTemplateCookies = () => {
  if (legacyCookiesCleared) return;
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

const parseList = (raw: string | null | undefined): PortalGlobalTemplateItem[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PortalGlobalTemplateItem[]) : [];
  } catch {
    return [];
  }
};

export const readPortalGlobalTemplateCatalog = (): PortalGlobalTemplateItem[] => {
  clearLegacyGlobalTemplateCookies();
  try {
    return parseList(localStorage.getItem(GLOBAL_TEMPLATE_CATALOG_STORAGE_KEY));
  } catch {
    return [];
  }
};

export const storePortalGlobalTemplateCatalog = (items: PortalGlobalTemplateItem[]) => {
  clearLegacyGlobalTemplateCookies();
  const list = Array.isArray(items) ? items : [];
  try {
    localStorage.setItem(GLOBAL_TEMPLATE_CATALOG_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
  return list;
};
