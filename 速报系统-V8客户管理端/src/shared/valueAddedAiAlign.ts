/** 增值业务 · 链接提取能力（与 MT 应用端套餐展示对齐） */

export type LinkExtractCapabilityId =
  | 'ai_text_extract'
  | 'ocr'
  | 'ai_multimodal_deep';

export const AI_VALUE_ADDED_CANONICAL = [
  {
    id: 'va_7',
    name: 'AI文本提取',
    dictCode: 'VA_AI_TEXT_EXTRACT',
    capability: 'ai_text_extract' as const,
    description:
      '从链接正文中抽取相关字段，并自动回填至报送表单，提升结构化录入效率。',
  },
  {
    id: 'va_8',
    name: 'OCR识别',
    dictCode: 'VA_OCR_RECOGNIZE',
    capability: 'ocr' as const,
    description:
      '在文本提取基础上，叠加图片 OCR 识别，将视觉素材转成可编辑文本并辅助回填报送表单；',
  },
  {
    id: 'va_9',
    name: 'AI多模态深度解析',
    dictCode: 'VA_AI_MULTIMODAL_DEEP',
    capability: 'ai_multimodal_deep' as const,
    description:
      '在文本提取与 OCR 之上，叠加多模态深度解析，对图文、视频等复杂素材做深度结构化解析并回填关键字段。适用于需解析外链、富媒体与视频的深度报送场景。',
  },
] as const;

export type LinkExtractPackageId = 'basic' | 'enhanced' | 'full';

export const LINK_EXTRACT_PACKAGES = [
  {
    id: 'basic' as const,
    order: 1,
    title: 'AI 文本提取套餐',
    shortTitle: '套餐一 · 基础档',
    badge: '基础档·机构标配',
    capabilities: ['ai_text_extract'] as LinkExtractCapabilityId[],
    capabilityLabels: ['AI文本提取'],
    selectableTiers: '① 文本提取',
    customers: '只录入正文 / 文本附件',
    description:
      '从链接正文中抽取相关字段，并自动回填至报送表单，提升结构化录入效率。',
  },
  {
    id: 'enhanced' as const,
    order: 2,
    title: '文本 + OCR 识别套餐',
    shortTitle: '套餐二 · 增强档',
    badge: '增强档·加购升级',
    capabilities: ['ai_text_extract', 'ocr'] as LinkExtractCapabilityId[],
    capabilityLabels: ['AI文本提取', 'OCR识别'],
    selectableTiers: '①② 文本 + OCR',
    customers: '有图片 / 截图录入场景',
    description:
      '在文本提取基础上，叠加图片 OCR 识别，将视觉素材转成可编辑文本并辅助回填报送表单；',
  },
  {
    id: 'full' as const,
    order: 3,
    title: '多模态深度解析套餐',
    shortTitle: '套餐三 · 多模态档',
    badge: '多模态档·高阶解析',
    capabilities: ['ai_text_extract', 'ocr', 'ai_multimodal_deep'] as LinkExtractCapabilityId[],
    capabilityLabels: ['AI文本提取', 'OCR识别', 'AI多模态深度解析'],
    selectableTiers: '①②③ 多模态深度解析',
    customers: '需解析链接、图文、视频',
    description:
      '在文本提取与 OCR 之上，叠加多模态深度解析，对图文、视频等复杂素材做深度结构化解析并回填关键字段。适用于需解析外链、富媒体与视频的深度报送场景。',
  },
] as const;

export const LINK_EXTRACT_PACKAGE_ANCHOR: Record<
  LinkExtractPackageId,
  LinkExtractCapabilityId
> = {
  basic: 'ai_text_extract',
  enhanced: 'ocr',
  full: 'ai_multimodal_deep',
};

export const isLegacyLinkMultimodalValueAdded = (item: {
  id?: string;
  dictCode?: string;
  name?: string;
}) =>
  item.id === 'vas-link-multimodal-ai' ||
  item.dictCode === 'VA_LINK_MULTIMODAL_AI' ||
  (item.name || '').includes('AI链接多模态识别');

const AI_TEXT_IDS = new Set(['va_7', 'vas-ai-text-extract']);
const AI_TEXT_CODES = new Set(['VA_AI_TEXT_EXTRACT', 'VA_LINK_MULTIMODAL_AI']);
const AI_TEXT_NAMES = ['AI文本提取', 'AI基础文本提取', 'AI链接多模态识别'];

const OCR_IDS = new Set(['va_8', 'vas-ocr-recognize']);
const OCR_CODES = new Set(['VA_OCR_RECOGNIZE']);
const OCR_NAMES = ['OCR识别'];

const DEEP_IDS = new Set(['va_9', 'vas-ai-multimodal-deep']);
const DEEP_CODES = new Set(['VA_AI_MULTIMODAL_DEEP']);
const DEEP_NAMES = ['AI多模态深度解析'];

export const isAiTextExtractSlot = (item: { id?: string; dictCode?: string; name?: string }) =>
  (item.id && AI_TEXT_IDS.has(item.id)) ||
  (item.dictCode && AI_TEXT_CODES.has(item.dictCode)) ||
  AI_TEXT_NAMES.some((n) => (item.name || '') === n || (item.name || '').includes(n));

export const isAiOcrSlot = (item: { id?: string; dictCode?: string; name?: string }) =>
  (item.id && OCR_IDS.has(item.id)) ||
  (item.dictCode && OCR_CODES.has(item.dictCode)) ||
  OCR_NAMES.some((n) => (item.name || '') === n);

export const isAiMultimodalDeepSlot = (item: {
  id?: string;
  dictCode?: string;
  name?: string;
}) =>
  (item.id && DEEP_IDS.has(item.id)) ||
  (item.dictCode && DEEP_CODES.has(item.dictCode)) ||
  DEEP_NAMES.some((n) => (item.name || '') === n);

export const isLinkExtractCapabilityItem = (item: {
  id?: string;
  dictCode?: string;
  name?: string;
}) => isAiTextExtractSlot(item) || isAiOcrSlot(item) || isAiMultimodalDeepSlot(item);

export const resolveLinkExtractCapability = (item: {
  id?: string;
  dictCode?: string;
  name?: string;
}): LinkExtractCapabilityId | null => {
  if (isAiTextExtractSlot(item)) return 'ai_text_extract';
  if (isAiOcrSlot(item)) return 'ocr';
  if (isAiMultimodalDeepSlot(item)) return 'ai_multimodal_deep';
  return null;
};

export const isValueAddedOpen = (item: {
  status?: string;
  activatedStatus?: string;
}) => item.activatedStatus === '已开通' || item.status === '启用';

type LinkPackageItem = {
  id?: string;
  dictCode?: string;
  name?: string;
  status?: string;
  activatedStatus?: string;
  linkPackageEnabled?: boolean;
};

const findItemByCapability = <T extends LinkPackageItem>(
  items: T[],
  capability: LinkExtractCapabilityId
) =>
  items.find((item) => {
    if (capability === 'ai_text_extract') return isAiTextExtractSlot(item);
    if (capability === 'ocr') return isAiOcrSlot(item);
    return isAiMultimodalDeepSlot(item);
  });

const hasExplicitPackageFlags = (items: LinkPackageItem[]) =>
  items.some(
    (item) =>
      resolveLinkExtractCapability(item) && typeof item.linkPackageEnabled === 'boolean'
  );

/** 套餐是否已由应用端开通（优先 linkPackageEnabled，兼容旧数据） */
export const isLinkExtractPackageEnabled = (
  packageId: LinkExtractPackageId,
  items: LinkPackageItem[]
): boolean => {
  const anchorCap = LINK_EXTRACT_PACKAGE_ANCHOR[packageId];
  const anchor = findItemByCapability(items, anchorCap);
  if (!anchor) return false;
  if (typeof anchor.linkPackageEnabled === 'boolean') return anchor.linkPackageEnabled;
  // 已有任一显式套餐开关后，未标记的套餐视为未开，避免「开增强档却点亮基础档」
  if (hasExplicitPackageFlags(items)) return false;
  return anchor.activatedStatus === '已开通';
};

export const findLinkExtractAnchorItem = <T extends LinkPackageItem>(
  items: T[],
  packageId: LinkExtractPackageId
) => findItemByCapability(items, LINK_EXTRACT_PACKAGE_ANCHOR[packageId]);

/** 客户管理端展示用：套餐开关打开且能力已开通（避免残留 flag 误显「已停用」） */
export const isLinkExtractPackageActivatedForDisplay = (
  packageId: LinkExtractPackageId,
  items: LinkPackageItem[]
): boolean => {
  if (!isLinkExtractPackageEnabled(packageId, items)) return false;
  const anchor = findLinkExtractAnchorItem(items, packageId);
  return !anchor || anchor.activatedStatus === '已开通';
};

/**
 * 已开启套餐的能力并集 → 写入能力项开通态。
 * preserveEnableStatus：已开通项保留机构启禁，避免同步冲掉「已停用」。
 */
export const syncLinkExtractCapabilitiesFromPackages = <T extends LinkPackageItem>(
  items: T[],
  stamp?: string,
  opts?: { preserveEnableStatus?: boolean }
): T[] => {
  const now = stamp || new Date().toISOString().replace('T', ' ').substring(0, 19);
  const enabledCaps = new Set<LinkExtractCapabilityId>();
  for (const pkg of LINK_EXTRACT_PACKAGES) {
    if (!isLinkExtractPackageEnabled(pkg.id, items)) continue;
    pkg.capabilities.forEach((cap) => enabledCaps.add(cap));
  }

  return items.map((item) => {
    const cap = resolveLinkExtractCapability(item);
    if (!cap) return item;
    const open = enabledCaps.has(cap);
    if (opts?.preserveEnableStatus && open && item.activatedStatus === '已开通') {
      return item;
    }
    return {
      ...item,
      status: (open ? '启用' : '停用') as T['status'],
      activatedStatus: (open ? '已开通' : '未开通') as T['activatedStatus'],
      updateTime: now,
    };
  });
};

/** 过滤旧项、按 dictCode/id 对齐名称与描述，并补齐缺失的 AI 三项 */
export const alignAiValueAddedList = <
  T extends {
    id: string;
    name: string;
    dictCode?: string;
    description?: string;
    dictCategoryName?: string;
    status?: string;
    activatedStatus?: string;
    isDefault?: boolean;
    updateTime?: string;
  }
>(
  list: T[]
): T[] => {
  const stamp = '2026-11-25 10:00:00';
  const cleaned = (list || [])
    .filter((i) => !isLegacyLinkMultimodalValueAdded(i))
    .map((i) =>
      i.name === '报送首发重复识别' ||
      i.dictCode === 'VA_FIRST_DUPLICATE_IDENTIFY' ||
      i.dictCode === 'VA_REPORT_DUPLICATE_IDENTIFICATION' ||
      i.id === 'va_dup' ||
      i.id === 'va_5'
        ? { ...i, name: '首发查重' }
        : i
    );

  const byCode = new Map<string, number>();
  const byId = new Map<string, number>();
  const byName = new Map<string, number>();
  cleaned.forEach((item, idx) => {
    if (item.dictCode) byCode.set(item.dictCode, idx);
    byId.set(item.id, idx);
    byName.set(item.name, idx);
  });

  const next = [...cleaned];

  for (const canon of AI_VALUE_ADDED_CANONICAL) {
    let idx = -1;
    if (canon.dictCode && byCode.has(canon.dictCode)) idx = byCode.get(canon.dictCode)!;
    if (idx < 0 && byId.has(canon.id)) idx = byId.get(canon.id)!;
    if (idx < 0 && byName.has(canon.name)) idx = byName.get(canon.name)!;
    if (idx < 0 && canon.dictCode === 'VA_AI_TEXT_EXTRACT') {
      idx = next.findIndex((i) => isAiTextExtractSlot(i));
    }

    if (idx >= 0) {
      const prev = next[idx];
      next[idx] = {
        ...prev,
        id: canon.id,
        name: canon.name,
        dictCode: canon.dictCode,
        description: canon.description,
        dictCategoryName: prev.dictCategoryName || '增值业务',
      };
      byCode.set(canon.dictCode, idx);
      byId.set(canon.id, idx);
      byName.set(canon.name, idx);
    } else {
      const isBase = canon.dictCode === 'VA_AI_TEXT_EXTRACT';
      const created = {
        ...(next[0] || ({} as T)),
        id: canon.id,
        name: canon.name,
        dictCode: canon.dictCode,
        description: canon.description,
        dictCategoryName: '增值业务',
        status: (isBase ? '启用' : '停用') as T['status'],
        activatedStatus: (isBase ? '已开通' : '未开通') as T['activatedStatus'],
        isDefault: true,
        updateTime: stamp,
      } as T;
      next.push(created);
      byCode.set(canon.dictCode, next.length - 1);
      byId.set(canon.id, next.length - 1);
      byName.set(canon.name, next.length - 1);
    }
  }

  return next.filter((i) => !isLegacyLinkMultimodalValueAdded(i));
};
