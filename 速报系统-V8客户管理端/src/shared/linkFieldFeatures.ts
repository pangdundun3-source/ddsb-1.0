/** 链接字段「配置」：链接截图 与 VIP 互斥；VIP（文本/图片OCR/多模态）可多选；均可取消为纯链接 */

import {
  LINK_EXTRACT_PACKAGES,
  findLinkExtractAnchorItem,
  isLinkExtractPackageEnabled,
  resolveLinkExtractCapability,
} from './valueAddedAiAlign';

export type LinkFieldFeature =
  | 'ai_text_extract'
  | 'ocr'
  | 'ai_multimodal_deep'
  | 'screenshot';

/** @deprecated 展示/兼容用档位；配置交互已改为截图↔VIP 互斥 + VIP 多选 */
export type LinkExtractTier = 'text' | 'text_ocr' | 'full' | 'screenshot';

export const LINK_FIELD_FEATURE_OPTIONS: Array<{
  id: LinkFieldFeature;
  label: string;
}> = [
  { id: 'screenshot', label: '链接截图' },
  { id: 'ai_text_extract', label: '文本提取' },
  { id: 'ocr', label: '图片OCR提取' },
  { id: 'ai_multimodal_deep', label: '多模态提取' },
];

export const LINK_FIELD_FEATURE_VAS: Record<
  Exclude<LinkFieldFeature, 'screenshot'>,
  { dictCodes: string[]; ids: string[]; names: string[] }
> = {
  ai_text_extract: {
    dictCodes: ['VA_AI_TEXT_EXTRACT'],
    ids: ['va_7', 'vas-ai-text-extract'],
    names: ['文本提取', 'AI文本提取', 'AI基础文本提取'],
  },
  ocr: {
    dictCodes: ['VA_OCR_RECOGNIZE'],
    ids: ['va_8', 'vas-ocr-recognize'],
    names: ['图片OCR提取', '图片提取', 'AI图片提取', 'AI图文提取', 'OCR识别', '图文OCR识别'],
  },
  ai_multimodal_deep: {
    dictCodes: ['VA_AI_MULTIMODAL_DEEP'],
    ids: ['va_9', 'vas-ai-multimodal-deep'],
    names: ['多模态提取', 'AI多模态提取', 'AI多模态深度解析', '多模态深度解析'],
  },
};

/** 三个 AI 能力（不含截图） */
export const LINK_AI_EXTRACT_FEATURES: LinkFieldFeature[] = [
  'ai_text_extract',
  'ocr',
  'ai_multimodal_deep',
];

/** 档位 → 写入字段的能力集合 */
export const LINK_EXTRACT_TIER_FEATURES: Record<LinkExtractTier, LinkFieldFeature[]> = {
  text: ['ai_text_extract'],
  text_ocr: ['ai_text_extract', 'ocr'],
  full: ['ai_text_extract', 'ocr', 'ai_multimodal_deep'],
  screenshot: ['screenshot'],
};

export const LINK_EXTRACT_TIER_OPTIONS: Array<{
  id: LinkExtractTier;
  label: string;
  /** 该档位依赖的增值能力（链接截图为基础能力，无依赖） */
  requires: Array<Exclude<LinkFieldFeature, 'screenshot'>>;
  /** 是否展示 VIP 角标 */
  vip: boolean;
}> = [
  {
    id: 'screenshot',
    label: '链接截图',
    requires: [],
    vip: false,
  },
  {
    id: 'text',
    label: '文本提取',
    requires: ['ai_text_extract'],
    vip: true,
  },
  {
    id: 'text_ocr',
    label: '图片OCR提取',
    requires: ['ai_text_extract', 'ocr'],
    vip: true,
  },
  {
    id: 'full',
    label: '多模态提取',
    requires: ['ai_text_extract', 'ocr', 'ai_multimodal_deep'],
    vip: true,
  },
];

/** 新建链接字段默认不配置任何功能（纯链接字段） */
export const DEFAULT_LINK_FIELD_FEATURES: LinkFieldFeature[] = [];

const ALLOWED = new Set<LinkFieldFeature>(LINK_FIELD_FEATURE_OPTIONS.map((o) => o.id));

export const normalizeLinkFieldFeatures = (
  features?: string[] | null
): LinkFieldFeature[] => {
  if (features == null) return [];
  const list = Array.from(
    new Set(
      features.filter((f): f is LinkFieldFeature => ALLOWED.has(f as LinkFieldFeature))
    )
  );
  const hasAi = list.some((f) => f !== 'screenshot');
  const hasShot = list.includes('screenshot');
  // 截图与 VIP 互斥：同时存在时保留 VIP
  if (hasAi && hasShot) return list.filter((f) => f !== 'screenshot');
  return list;
};

export const hasLinkFieldFeature = (
  field: { linkFeatures?: string[] | null },
  feature: LinkFieldFeature
) => normalizeLinkFieldFeatures(field.linkFeatures).includes(feature);

/** 配置了任一 VIP 能力 → 填报端显示「AI识别」 */
export const hasLinkAiExtract = (field: { linkFeatures?: string[] | null }) =>
  LINK_AI_EXTRACT_FEATURES.some((f) => hasLinkFieldFeature(field, f));

/** 选了链接截图 → 填报端显示「截图」按钮；未配置则无按钮 */
export const hasLinkScreenshot = (field: { linkFeatures?: string[] | null }) =>
  hasLinkFieldFeature(field, 'screenshot');

export type ValueAddedProvisionLike = {
  id?: string;
  dictCode?: string;
  name?: string;
  status?: string;
  activatedStatus?: string;
  linkPackageEnabled?: boolean;
};

const matchVasItem = (
  feature: Exclude<LinkFieldFeature, 'screenshot'>,
  items: ValueAddedProvisionLike[]
): ValueAddedProvisionLike | undefined => {
  const meta = LINK_FIELD_FEATURE_VAS[feature];
  return items.find((item) => {
    if (item.dictCode && meta.dictCodes.includes(item.dictCode)) return true;
    if (item.id && meta.ids.includes(item.id)) return true;
    const name = (item.name || '').trim();
    return Boolean(name && meta.names.some((n) => name === n || name.includes(n)));
  });
};

const hasExplicitLinkPackageFlags = (items: ValueAddedProvisionLike[]) =>
  items.some(
    (item) =>
      resolveLinkExtractCapability(item) && typeof item.linkPackageEnabled === 'boolean'
  );

/** 已开通且未停用的套餐能力并集 */
const getCapabilitiesFromOpenPackages = (
  items: ValueAddedProvisionLike[]
): Set<LinkFieldFeature> => {
  const caps = new Set<LinkFieldFeature>();
  for (const pkg of LINK_EXTRACT_PACKAGES) {
    if (!isLinkExtractPackageEnabled(pkg.id, items)) continue;
    const anchor = findLinkExtractAnchorItem(items, pkg.id);
    if (anchor?.activatedStatus === '已开通' && anchor.status === '停用') continue;
    pkg.capabilities.forEach((cap) => caps.add(cap));
  }
  return caps;
};

export const isLinkFeatureProvisioned = (
  feature: LinkFieldFeature,
  valueAddedItems?: ValueAddedProvisionLike[] | null
): boolean => {
  if (feature === 'screenshot') return true;
  if (!valueAddedItems || valueAddedItems.length === 0) return false;
  if (getCapabilitiesFromOpenPackages(valueAddedItems).has(feature)) return true;
  if (hasExplicitLinkPackageFlags(valueAddedItems)) return false;
  const item = matchVasItem(feature, valueAddedItems);
  if (!item) return false;
  return item.activatedStatus === '已开通';
};

export const getLinkProvisionedFeatures = (
  valueAddedItems?: ValueAddedProvisionLike[] | null
): LinkFieldFeature[] =>
  LINK_AI_EXTRACT_FEATURES.filter((f) => isLinkFeatureProvisioned(f, valueAddedItems));

/** 将已存 linkFeatures 归一到档位；未配置任何功能 → null（纯链接） */
export const resolveLinkExtractTier = (
  features?: string[] | null
): LinkExtractTier | null => {
  const raw = Array.isArray(features) ? features : [];
  const set = new Set(
    raw.filter((f): f is LinkFieldFeature => ALLOWED.has(f as LinkFieldFeature))
  );
  if (set.size === 0) return null;
  if (
    set.has('ai_text_extract') &&
    set.has('ocr') &&
    set.has('ai_multimodal_deep')
  ) {
    return 'full';
  }
  if (set.has('ai_text_extract') && set.has('ocr')) return 'text_ocr';
  if (set.has('ai_text_extract')) return 'text';
  if (set.has('ocr')) return 'text_ocr';
  if (set.has('ai_multimodal_deep')) return 'full';
  if (set.has('screenshot')) return 'screenshot';
  return null;
};

export const featuresOfLinkExtractTier = (tier: LinkExtractTier | null): LinkFieldFeature[] =>
  tier ? [...LINK_EXTRACT_TIER_FEATURES[tier]] : [];

export const isLinkExtractTierAvailable = (
  tier: LinkExtractTier,
  valueAddedItems?: ValueAddedProvisionLike[] | null
): boolean => {
  if (tier === 'screenshot') return true;
  const opt = LINK_EXTRACT_TIER_OPTIONS.find((o) => o.id === tier);
  if (!opt) return false;
  if (!isLinkFeatureProvisioned('ai_text_extract', valueAddedItems)) return false;
  return opt.requires.every((f) => isLinkFeatureProvisioned(f, valueAddedItems));
};

/** 灰显档位的悬停说明 */
export const getLinkExtractTierDisabledHint = (
  tier: LinkExtractTier,
  valueAddedItems?: ValueAddedProvisionLike[] | null
): string => {
  if (isLinkExtractTierAvailable(tier, valueAddedItems)) return '';
  if (tier === 'screenshot') return '';

  const hasText = isLinkFeatureProvisioned('ai_text_extract', valueAddedItems);
  const hasOcr = isLinkFeatureProvisioned('ocr', valueAddedItems);
  const hasDeep = isLinkFeatureProvisioned('ai_multimodal_deep', valueAddedItems);

  if (!hasText) {
    return '请先开通「文本提取」套餐';
  }
  if (tier === 'text_ocr') {
    return '请开通「图片OCR提取」套餐';
  }
  if (tier === 'full') {
    if (!hasOcr && !hasDeep) {
      return '请开通「多模态提取」套餐';
    }
    if (!hasOcr) return '还需开通含 OCR 的增强档/多模态档套餐';
    if (!hasDeep) return '请开通「多模态提取」套餐';
  }
  return '当前开通套餐不足，该功能暂不可用';
};

export const linkExtractTierLabel = (tier: LinkExtractTier | null) =>
  tier ? LINK_EXTRACT_TIER_OPTIONS.find((o) => o.id === tier)?.label || '' : '';

/** 预览/只读展示：已选配置项名称（截图或 VIP 多选） */
export const enabledLinkExtractLabels = (field: { linkFeatures?: string[] | null }) => {
  const features = new Set(normalizeLinkFieldFeatures(field.linkFeatures));
  return LINK_FIELD_FEATURE_OPTIONS.filter((o) => features.has(o.id)).map((o) => o.label);
};

/**
 * 配置交互：
 * - 点「链接截图」：开→仅截图；关→清空
 * - 点 VIP 项：去掉截图后多选开关该项
 */
export const toggleLinkConfigFeature = (
  features: string[] | null | undefined,
  feature: LinkFieldFeature
): LinkFieldFeature[] => {
  const current = normalizeLinkFieldFeatures(features);
  if (feature === 'screenshot') {
    return current.includes('screenshot') ? [] : ['screenshot'];
  }
  const withoutShot = current.filter((f) => f !== 'screenshot');
  if (withoutShot.includes(feature)) {
    return withoutShot.filter((f) => f !== feature);
  }
  return [...withoutShot, feature];
};

/** @deprecated 请用 toggleLinkConfigFeature */
export const toggleLinkFieldFeature = toggleLinkConfigFeature;

export const getLinkVipFeatureDisabledHint = (
  feature: Exclude<LinkFieldFeature, 'screenshot'>
): string => {
  const label =
    LINK_FIELD_FEATURE_OPTIONS.find((o) => o.id === feature)?.label || '该能力';
  return `请开通「${label}」套餐`;
};
