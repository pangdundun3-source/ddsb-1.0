/** 链接字段「配置」：截图↔VIP 互斥；VIP（文本/图片OCR/多模态）可多选；均可取消为纯链接 */

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

export const LINK_AI_EXTRACT_FEATURES: LinkFieldFeature[] = [
  'ai_text_extract',
  'ocr',
  'ai_multimodal_deep',
];

export const LINK_EXTRACT_TIER_FEATURES: Record<LinkExtractTier, LinkFieldFeature[]> = {
  text: ['ai_text_extract'],
  text_ocr: ['ai_text_extract', 'ocr'],
  full: ['ai_text_extract', 'ocr', 'ai_multimodal_deep'],
  screenshot: ['screenshot'],
};

export const LINK_EXTRACT_TIER_OPTIONS: Array<{
  id: LinkExtractTier;
  label: string;
  requires: Array<Exclude<LinkFieldFeature, 'screenshot'>>;
  vip: boolean;
}> = [
  { id: 'screenshot', label: '链接截图', requires: [], vip: false },
  { id: 'text', label: '文本提取', requires: ['ai_text_extract'], vip: true },
  { id: 'text_ocr', label: '图片OCR提取', requires: ['ai_text_extract', 'ocr'], vip: true },
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
  if (hasAi && hasShot) return list.filter((f) => f !== 'screenshot');
  return list;
};

export const hasLinkFieldFeature = (
  field: { linkFeatures?: string[] | null },
  feature: LinkFieldFeature
) => normalizeLinkFieldFeatures(field.linkFeatures).includes(feature);

/** 配置了任一 VIP 能力 → 显示「AI识别」 */
export const hasLinkAiExtract = (field: { linkFeatures?: string[] | null }) =>
  LINK_AI_EXTRACT_FEATURES.some((f) => hasLinkFieldFeature(field, f));

/** 选了链接截图 → 显示「截图」按钮；未配置则无按钮 */
export const hasLinkScreenshot = (field: { linkFeatures?: string[] | null }) =>
  hasLinkFieldFeature(field, 'screenshot');

export type ValueAddedProvisionLike = {
  id?: string;
  dictCode?: string;
  name?: string;
  status?: string;
  activatedStatus?: string;
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

export const isLinkFeatureProvisioned = (
  feature: LinkFieldFeature,
  valueAddedItems?: ValueAddedProvisionLike[] | null
): boolean => {
  if (feature === 'screenshot') return true;
  if (!valueAddedItems || valueAddedItems.length === 0) return false;
  const item = matchVasItem(feature, valueAddedItems);
  if (!item) return false;
  return item.activatedStatus === '已开通';
};

export const getLinkProvisionedFeatures = (
  valueAddedItems?: ValueAddedProvisionLike[] | null
): LinkFieldFeature[] =>
  LINK_AI_EXTRACT_FEATURES.filter((f) => isLinkFeatureProvisioned(f, valueAddedItems));

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

export const enabledLinkExtractLabels = (field: { linkFeatures?: string[] | null }) => {
  const features = new Set(normalizeLinkFieldFeatures(field.linkFeatures));
  return LINK_FIELD_FEATURE_OPTIONS.filter((o) => features.has(o.id)).map((o) => o.label);
};

/** AI识别旁展示的短能力胶囊：按字段已配置能力逐个显示 */
const LINK_AI_CAPABILITY_PILL_LABELS: Array<{
  id: Exclude<LinkFieldFeature, 'screenshot'>;
  label: string;
}> = [
  { id: 'ai_text_extract', label: '文本' },
  { id: 'ocr', label: '图片' },
  { id: 'ai_multimodal_deep', label: '多模态' },
];

export const linkAiCapabilityPills = (field: {
  linkFeatures?: string[] | null;
}): Array<{ id: string; label: string }> => {
  const features = new Set(normalizeLinkFieldFeatures(field.linkFeatures));
  return LINK_AI_CAPABILITY_PILL_LABELS.filter((p) => features.has(p.id)).map((p) => ({
    id: p.id,
    label: p.label,
  }));
};

/** 截图↔VIP 互斥；VIP 可多选 */
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

export const toggleLinkFieldFeature = toggleLinkConfigFeature;
