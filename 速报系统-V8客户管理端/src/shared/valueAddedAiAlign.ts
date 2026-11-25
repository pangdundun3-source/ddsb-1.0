/** 增值业务 AI 三项与应用端对齐（迁移旧「AI链接多模态识别」） */

export const AI_VALUE_ADDED_CANONICAL = [
  {
    id: 'va_7',
    name: 'AI文本提取',
    dictCode: 'VA_AI_TEXT_EXTRACT',
    description:
      '从粘贴正文或附件文本中抽取标题、摘要、属地、时间等并回填模板字段，提升结构化录入效率',
  },
  {
    id: 'va_8',
    name: 'OCR识别',
    dictCode: 'VA_OCR_RECOGNIZE',
    description: '对图片/截图做文字识别，生成可编辑文本并辅助填入报送字段',
  },
  {
    id: 'va_9',
    name: 'AI多模态深度解析',
    dictCode: 'VA_AI_MULTIMODAL_DEEP',
    description: '对链接、图文、视频等多模态素材做深度结构化解析并回填关键字段',
  },
] as const;

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

export const isAiTextExtractSlot = (item: { id?: string; dictCode?: string; name?: string }) =>
  (item.id && AI_TEXT_IDS.has(item.id)) ||
  (item.dictCode && AI_TEXT_CODES.has(item.dictCode)) ||
  AI_TEXT_NAMES.some((n) => (item.name || '') === n || (item.name || '').includes(n));

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
    // 旧 va_7 / 旧名占位 → 对齐为 AI文本提取
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
      const created = {
        ...(next[0] || ({} as T)),
        id: canon.id,
        name: canon.name,
        dictCode: canon.dictCode,
        description: canon.description,
        dictCategoryName: '增值业务',
        status: (next[0]?.status || '启用') as T['status'],
        activatedStatus: (next[0]?.activatedStatus || '已开通') as T['activatedStatus'],
        isDefault: true,
        updateTime: stamp,
      } as T;
      next.push(created);
      byCode.set(canon.dictCode, next.length - 1);
      byId.set(canon.id, next.length - 1);
      byName.set(canon.name, next.length - 1);
    }
  }

  // 再次去掉残留旧名
  return next.filter((i) => !isLegacyLinkMultimodalValueAdded(i));
};
