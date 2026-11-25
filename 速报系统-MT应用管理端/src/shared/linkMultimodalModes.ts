/** AI 链接多模态识别：机构开通的提取能力档位 */

export type LinkMultimodalMode = 'basic' | 'deep';

export const LINK_MULTIMODAL_DICT_CODE = 'VA_LINK_MULTIMODAL_AI';

export const LINK_MULTIMODAL_MODE_OPTIONS: Array<{
  id: LinkMultimodalMode;
  label: string;
  desc: string;
}> = [
  {
    id: 'basic',
    label: '基础链接内容提取',
    desc: '提取标题、摘要、属地、发布时间等文本要素并回填表单',
  },
  {
    id: 'deep',
    label: '图文视频深度提取',
    desc: '解析链接页面内图片、视频与正文等多模态内容，做深度识别',
  },
];

export const normalizeLinkMultimodalModes = (
  modes?: LinkMultimodalMode[] | null
): LinkMultimodalMode[] => {
  const next = Array.from(new Set((modes || []).filter((m) => m === 'basic' || m === 'deep')));
  return next.length > 0 ? next : ['basic'];
};

export const formatLinkMultimodalModesLabel = (modes?: LinkMultimodalMode[] | null) => {
  const normalized = normalizeLinkMultimodalModes(modes);
  return LINK_MULTIMODAL_MODE_OPTIONS.filter((opt) => normalized.includes(opt.id))
    .map((opt) => opt.label)
    .join(' + ');
};

export const isLinkMultimodalValueAdded = (item: {
  dictCode?: string;
  name?: string;
  id?: string;
}) =>
  item.dictCode === LINK_MULTIMODAL_DICT_CODE ||
  item.id === 'vas-link-multimodal-ai' ||
  (item.name || '').includes('AI链接多模态识别');