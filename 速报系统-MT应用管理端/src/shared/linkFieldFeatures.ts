/** 链接字段「提取」档位配置（截图固定开启；三档互斥，按增值开通态灰显） */

import {
  LINK_EXTRACT_PACKAGES,
  findLinkExtractAnchorItem,
  isLinkExtractPackageEnabled,
  resolveLinkExtractCapability,
} from './valueAddedAiAlign';

export type LinkFieldFeature =
  | 'ai_text_extract'
  | 'ocr'
  | 'ai_multimodal_deep';

/** 互斥档位：文本提取 / 文本+OCR / 多模态深度解析 */
export type LinkExtractTier = 'text' | 'text_ocr' | 'full';

export const LINK_FIELD_FEATURE_OPTIONS: Array<{
  id: LinkFieldFeature;
  label: string;
}> = [
  { id: 'ai_text_extract', label: '文本' },
  { id: 'ocr', label: 'OCR' },
  { id: 'ai_multimodal_deep', label: '多模态深度解析' }
];

export const LINK_FIELD_FEATURE_VAS: Record<
  LinkFieldFeature,
  { dictCodes: string[]; ids: string[]; names: string[] }
> = {
  ai_text_extract: {
    dictCodes: ['VA_AI_TEXT_EXTRACT'],
    ids: ['va_7', 'vas-ai-text-extract'],
    names: ['AI文本提取', 'AI基础文本提取']
  },
  ocr: {
    dictCodes: ['VA_OCR_RECOGNIZE'],
    ids: ['va_8', 'vas-ocr-recognize'],
    names: ['OCR识别']
  },
  ai_multimodal_deep: {
    dictCodes: ['VA_AI_MULTIMODAL_DEEP'],
    ids: ['va_9', 'vas-ai-multimodal-deep'],
    names: ['AI多模态深度解析']
  }
};

export const LINK_AI_EXTRACT_FEATURES: LinkFieldFeature[] = LINK_FIELD_FEATURE_OPTIONS.map(
  (o) => o.id
);

/** 档位 → 写入字段的能力集合 */
export const LINK_EXTRACT_TIER_FEATURES: Record<LinkExtractTier, LinkFieldFeature[]> = {
  text: ['ai_text_extract'],
  text_ocr: ['ai_text_extract', 'ocr'],
  full: ['ai_text_extract', 'ocr', 'ai_multimodal_deep']
};

export const LINK_EXTRACT_TIER_OPTIONS: Array<{
  id: LinkExtractTier;
  label: string;
  /** 该档位依赖的增值能力（须全部开通） */
  requires: LinkFieldFeature[];
}> = [
  {
    id: 'text',
    label: '文本提取',
    requires: ['ai_text_extract']
  },
  {
    id: 'text_ocr',
    label: '文本 + OCR 识别',
    requires: ['ai_text_extract', 'ocr']
  },
  {
    id: 'full',
    label: '多模态深度解析',
    requires: ['ai_text_extract', 'ocr', 'ai_multimodal_deep']
  }
];

/** 新建链接字段默认不选档位；截图始终可用 */
export const DEFAULT_LINK_FIELD_FEATURES: LinkFieldFeature[] = [];

const ALLOWED = new Set<LinkFieldFeature>(LINK_FIELD_FEATURE_OPTIONS.map((o) => o.id));

export const normalizeLinkFieldFeatures = (
  features?: string[] | null
): LinkFieldFeature[] => {
  if (features == null) return [...DEFAULT_LINK_FIELD_FEATURES];
  return Array.from(
    new Set(
      features.filter((f): f is LinkFieldFeature => ALLOWED.has(f as LinkFieldFeature))
    )
  );
};

export const hasLinkFieldFeature = (
  field: { linkFeatures?: string[] | null },
  feature: LinkFieldFeature
) => normalizeLinkFieldFeatures(field.linkFeatures).includes(feature);

export const hasLinkAiExtract = (field: { linkFeatures?: string[] | null }) =>
  LINK_AI_EXTRACT_FEATURES.some((f) => hasLinkFieldFeature(field, f));

export type ValueAddedProvisionLike = {
  id?: string;
  dictCode?: string;
  name?: string;
  status?: string;
  activatedStatus?: string;
  linkPackageEnabled?: boolean;
};

const matchVasItem = (
  feature: LinkFieldFeature,
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
  if (!valueAddedItems || valueAddedItems.length === 0) return false;
  // 套餐并集优先：例如只开了 OCR 锚点/增强档，也视为文本+OCR 可用
  if (getCapabilitiesFromOpenPackages(valueAddedItems).has(feature)) return true;
  // 兼容未走套餐开关的单项开通（全局配置等）
  if (hasExplicitLinkPackageFlags(valueAddedItems)) return false;
  const item = matchVasItem(feature, valueAddedItems);
  if (!item) return false;
  return item.activatedStatus === '已开通';
};

export const getLinkProvisionedFeatures = (
  valueAddedItems?: ValueAddedProvisionLike[] | null
): LinkFieldFeature[] =>
  LINK_AI_EXTRACT_FEATURES.filter((f) => isLinkFeatureProvisioned(f, valueAddedItems));

/** 将已存 linkFeatures 归一到最近档位（高档优先） */
export const resolveLinkExtractTier = (
  features?: string[] | null
): LinkExtractTier | null => {
  const set = new Set(normalizeLinkFieldFeatures(features));
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
  // 历史脏数据：仅 OCR / 仅多模态 → 尽量落到可解释档位
  if (set.has('ocr')) return 'text_ocr';
  if (set.has('ai_multimodal_deep')) return 'full';
  return null;
};

export const featuresOfLinkExtractTier = (tier: LinkExtractTier | null): LinkFieldFeature[] =>
  tier ? [...LINK_EXTRACT_TIER_FEATURES[tier]] : [];

export const isLinkExtractTierAvailable = (
  tier: LinkExtractTier,
  valueAddedItems?: ValueAddedProvisionLike[] | null
): boolean => {
  const opt = LINK_EXTRACT_TIER_OPTIONS.find((o) => o.id === tier);
  if (!opt) return false;
  // 文本为底座：未开通文本时任何档位都不可用
  if (!isLinkFeatureProvisioned('ai_text_extract', valueAddedItems)) return false;
  return opt.requires.every((f) => isLinkFeatureProvisioned(f, valueAddedItems));
};

/** 灰显档位的悬停说明 */
export const getLinkExtractTierDisabledHint = (
  tier: LinkExtractTier,
  valueAddedItems?: ValueAddedProvisionLike[] | null
): string => {
  if (isLinkExtractTierAvailable(tier, valueAddedItems)) return '';

  const hasText = isLinkFeatureProvisioned('ai_text_extract', valueAddedItems);
  const hasOcr = isLinkFeatureProvisioned('ocr', valueAddedItems);
  const hasDeep = isLinkFeatureProvisioned('ai_multimodal_deep', valueAddedItems);

  if (!hasText) {
    return '请先开通「AI文本提取」套餐（可选档位①）';
  }
  if (tier === 'text_ocr') {
    return '请开通「文本 + OCR 识别」套餐（可选档位①②）';
  }
  if (tier === 'full') {
    if (!hasOcr && !hasDeep) {
      return '请开通「多模态深度解析」套餐（可选档位①②③）';
    }
    if (!hasOcr) return '还需开通含 OCR 的增强档/多模态档套餐';
    if (!hasDeep) return '请开通「多模态深度解析」套餐（可选档位①②③）';
  }
  return '当前开通套餐不足，该档位暂不可用';
};

export const linkExtractTierLabel = (tier: LinkExtractTier | null) =>
  tier ? LINK_EXTRACT_TIER_OPTIONS.find((o) => o.id === tier)?.label || '' : '';

/** 预览条展示用：当前档位名称 */
export const enabledLinkExtractLabels = (field: { linkFeatures?: string[] | null }) => {
  const tier = resolveLinkExtractTier(field.linkFeatures);
  const label = linkExtractTierLabel(tier);
  return label ? [label] : [];
};

/** @deprecated 档位互斥后请用 resolveLinkExtractTier + featuresOfLinkExtractTier */
export const toggleLinkFieldFeature = (
  features: string[] | null | undefined,
  feature: LinkFieldFeature
): LinkFieldFeature[] => {
  const current = normalizeLinkFieldFeatures(features);
  return current.includes(feature)
    ? current.filter((f) => f !== feature)
    : [...current, feature];
};
