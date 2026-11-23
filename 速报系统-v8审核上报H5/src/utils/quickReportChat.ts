import { REPORT_TEMPLATES } from '../data/mockData';
import { isTemplateBlockedByExternalAudit } from '../shared/valueAddedAccess';
import { ReportTemplate, TemplateType } from '../types';
import {
  LinkMultimodalSuccess,
  extractHttpUrl,
  hasHttpLink,
  parseLinkMultimodal,
} from './linkMultimodalMock';
import {
  ClueSourceKind,
  MultimodalClueSuccess,
  sourceKindToTag,
} from './multimodalClueMock';

export { hasHttpLink, extractHttpUrl } from './linkMultimodalMock';
export { sourceKindToTag } from './multimodalClueMock';
export type { ClueSourceKind } from './multimodalClueMock';

export type QuickReportPhase =
  | 'idle'
  | 'awaiting_body'
  | 'awaiting_org'
  | 'awaiting_confirm';

export interface ParsedClue {
  reporterHint?: string;
  district?: string;
  timeText?: string;
  title?: string;
  link?: string;
  summary?: string;
  raw: string;
  sourceKind?: ClueSourceKind;
  sourceLabel?: string;
  attachmentHint?: string;
}

export interface MatchedTemplate {
  template: ReportTemplate;
  isDefault: boolean;
  reason: string;
}

export interface QuickReportDraft {
  clue: ParsedClue;
  /** 确认机构后再匹配；选机构前为空 */
  matched?: MatchedTemplate;
  orgOptions: string[];
  selectedOrg?: string;
  missingLabels: string[];
  canDirectSubmit: boolean;
}

const ENTRY_KEYWORDS = ['快捷报送', '快捷上报', '报送', '线索', '转报送', '消息报送'];
const CANCEL_KEYWORDS = ['取消', '0'];
const FORM_KEYWORDS = ['表单', '页面上报'];

const RUMOR_WORDS = ['谣言', '不实', '辟谣', '虚假', '造谣'];
const APPEAL_WORDS = ['诉求', '投诉', '民生', '反映', '办理'];
const RISK_WORDS = ['隐患', '专项', '协查', '风险线索', '联合核查'];
const INCIDENT_WORDS = ['火灾', '爆炸', '事故', '伤亡', '警情', '突发事件', '浓烟', '救援', '消防车'];

export const isEntryKeyword = (text: string) =>
  ENTRY_KEYWORDS.some((word) => text === word || text.startsWith(word));

export const isCancelKeyword = (text: string) =>
  CANCEL_KEYWORDS.some((word) => text.trim() === word);

export const isFormKeyword = (text: string) =>
  FORM_KEYWORDS.some((word) => text.trim() === word);

/** 结构化线索特征：标签命中 ≥ 3 才被动识别 */
export const looksLikeStructuredClue = (text: string) => {
  const tags = ['报送人', '涉事属地', '属地', '信息发布时间', '发布时间', '信息标题', '标题', '链接'];
  const hit = tags.filter((tag) => text.includes(tag)).length;
  return hit >= 3 || (Boolean(extractLabeled(text, ['信息标题', '标题'])) && /https?:\/\//i.test(text));
};

const extractLabeled = (text: string, labels: string[]) => {
  for (const label of labels) {
    const re = new RegExp(`${label}[:：]?\\s*([^\\n]+)`, 'i');
    const match = text.match(re);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return undefined;
};

const extractLink = (text: string) => {
  const labeled = extractLabeled(text, ['链接']);
  if (labeled && /https?:\/\//i.test(labeled)) {
    const url = labeled.match(/https?:\/\/\S+/i);
    return url?.[0];
  }
  const bare = text.match(/https?:\/\/\S+/i);
  return bare?.[0];
};

export const parseClueText = (raw: string): ParsedClue => {
  const title = extractLabeled(raw, ['信息标题', '标题']);
  const district = extractLabeled(raw, ['涉事属地', '属地']);
  const timeText = extractLabeled(raw, ['信息发布时间', '发布时间', '时间']);
  const link = extractLink(raw);
  const reporterLine = raw.match(/报送人[：:]?\s*([^\n]+)/);
  const reporterHint = reporterLine?.[1]?.trim();

  let summary = title;
  if (title && raw.includes(title)) {
    // 标题行后的长描述已在标题里时，用标题作摘要初稿
    summary = title;
  }

  return {
    reporterHint,
    district,
    timeText,
    title,
    link,
    summary,
    raw,
  };
};

/** 文案字段优先，空缺项用链接多模态结果补全 */
export const mergeClueWithLinkResult = (
  base: ParsedClue,
  linkResult: LinkMultimodalSuccess
): ParsedClue => ({
  ...base,
  link: base.link || linkResult.link,
  title: base.title || linkResult.title,
  summary: base.summary || linkResult.summary || linkResult.title,
  timeText: base.timeText || linkResult.timeText,
  district: base.district || linkResult.district,
  sourceKind: base.sourceKind || 'link',
  sourceLabel: base.sourceLabel || `链接识别·${linkResult.sourceHost}`,
});

/** 文案字段优先，空缺项用图片/语音/位置多模态结果补全 */
export const mergeClueWithMultimodal = (
  base: ParsedClue,
  mm: MultimodalClueSuccess
): ParsedClue => ({
  ...base,
  link: base.link || mm.link,
  title: base.title || mm.title,
  summary: base.summary || mm.summary || mm.title,
  timeText: base.timeText || mm.timeText,
  district: base.district || mm.district,
  sourceKind: mm.sourceKind,
  sourceLabel: mm.sourceLabel,
  attachmentHint: mm.attachmentHint || base.attachmentHint,
  raw: base.raw || mm.transcript || mm.title,
});

/** 由图片/语音/位置 Mock 成功结果直接生成线索 */
export const clueFromMultimodalSuccess = (
  mm: MultimodalClueSuccess,
  rawFallback = ''
): ParsedClue => ({
  title: mm.title,
  summary: mm.summary,
  timeText: mm.timeText,
  district: mm.district,
  link: mm.link,
  sourceKind: mm.sourceKind,
  sourceLabel: mm.sourceLabel,
  attachmentHint: mm.attachmentHint,
  raw: mm.transcript || rawFallback || mm.title,
});

/**
 * 同步构建线索：结构化文案优先；若含链接则用 Mock 多模态补全空缺。
 * 对话侧「解析中」动效可先展示，再调用本函数。
 */
export const buildClueFromUserText = (raw: string): ParsedClue | { error: string } => {
  const textClue = parseClueText(raw);
  const url = extractHttpUrl(raw) || textClue.link;

  if (!url) {
    return {
      ...textClue,
      sourceKind: textClue.sourceKind || 'text',
      sourceLabel: textClue.sourceLabel || '文字线索',
    };
  }

  const linkResult = parseLinkMultimodal(url);
  if (!linkResult.ok) {
    // 文案已有标题时，链接失败不阻断，仅保留文案抽取结果
    if (textClue.title?.trim()) {
      return {
        ...textClue,
        link: textClue.link || url,
        sourceKind: 'text',
        sourceLabel: '文字线索',
      };
    }
    return { error: linkResult.reason };
  }

  return mergeClueWithLinkResult({ ...textClue, link: textClue.link || url }, linkResult);
};

const findTemplate = (id: TemplateType) =>
  REPORT_TEMPLATES.find((item) => item.id === id) || REPORT_TEMPLATES[0];

const isTemplateUsableForOrg = (template: ReportTemplate, _org?: string) =>
  !isTemplateBlockedByExternalAudit(template.requiresExternalAudit);

/**
 * 先确认机构后调用：按线索内容匹配，并过滤该机构当前不可用的模板。
 */
export const matchTemplateByClue = (
  clue: ParsedClue,
  options?: { org?: string }
): MatchedTemplate => {
  const blob = `${clue.title || ''} ${clue.summary || ''} ${clue.raw}`;
  const org = options?.org;
  const pick = (id: TemplateType, isDefault: boolean, reason: string): MatchedTemplate | null => {
    const template = findTemplate(id);
    if (!isTemplateUsableForOrg(template, org)) return null;
    return { template, isDefault, reason };
  };

  const candidates: Array<() => MatchedTemplate | null> = [
    () =>
      RUMOR_WORDS.some((w) => blob.includes(w))
        ? pick('网络谣言线索模板', false, '命中谣言/不实类关键词')
        : null,
    () =>
      APPEAL_WORDS.some((w) => blob.includes(w)) && !INCIDENT_WORDS.some((w) => blob.includes(w))
        ? pick('民生诉求核查模板', false, '命中民生诉求类关键词')
        : null,
    () =>
      RISK_WORDS.some((w) => blob.includes(w))
        ? pick('专项风险线索模板', false, '命中专项风险类关键词')
        : null,
    () =>
      INCIDENT_WORDS.some((w) => blob.includes(w))
        ? pick('突发事件速报模板', false, '命中突发事件类关键词')
        : null,
  ];

  for (const tryPick of candidates) {
    const hit = tryPick();
    if (hit) return hit;
  }

  // 默认：优先突发事件；机构不可用则降级专项风险（不依赖外部审核）
  const fallbackIncident = pick(
    '突发事件速报模板',
    true,
    org ? `机构「${org}」下未命中明确类型，按默认模板匹配` : '未命中明确类型，按默认模板匹配'
  );
  if (fallbackIncident) return fallbackIncident;

  const fallbackRisk = pick(
    '专项风险线索模板',
    true,
    org
      ? `机构「${org}」暂不可用外部审核类模板，已匹配专项风险线索模板`
      : '已降级匹配专项风险线索模板'
  );
  if (fallbackRisk) return fallbackRisk;

  return {
    template: REPORT_TEMPLATES[0],
    isDefault: true,
    reason: '已匹配可用模板',
  };
};

/**
 * 对话侧「能否直接提交」只卡核心字段：标题必填；
 * 谣言模板若配置了必填链接则链接必填。
 * 其余模板细项由提交时初填/去完善补全（原型演示用）。
 */
export const getMissingCoreLabels = (clue: ParsedClue, matched: MatchedTemplate) => {
  const missing: string[] = [];
  if (!clue.title?.trim()) missing.push('信息标题');

  const requiredLink = matched.template.extraFields.find((f) => f.required && f.type === 'link');
  if (requiredLink && !clue.link) missing.push(requiredLink.label);

  return Array.from(new Set(missing));
};

/** 机构确认后：匹配模板并计算是否可直接提交 */
export const finalizeDraftWithOrg = (
  draft: QuickReportDraft,
  selectedOrg: string
): QuickReportDraft => {
  const matched = matchTemplateByClue(draft.clue, { org: selectedOrg });
  const missingLabels = getMissingCoreLabels(draft.clue, matched);
  return {
    ...draft,
    selectedOrg,
    matched,
    missingLabels,
    canDirectSubmit: missingLabels.length === 0,
  };
};

/** 提交/预填时给出模板细项初值（可在 H5 再改） */
export const buildSoftExtraValues = (draft: QuickReportDraft) => {
  const values: Record<string, string | string[] | number | null> = {};
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  if (!draft.matched) return values;

  draft.matched.template.extraFields.forEach((field) => {
    if (field.type === 'static_text') return;
    if (field.type === 'link') {
      values[field.id] = draft.clue.link || '';
      return;
    }
    if (field.type === 'date') {
      values[field.id] = todayStr;
      return;
    }
    if (field.type === 'number') {
      values[field.id] = field.required ? 0 : null;
      return;
    }
    if (field.type === 'radio' || field.type === 'select') {
      values[field.id] = field.options?.[0]?.value || '';
      return;
    }
    if (field.type === 'checkbox' || field.type === 'multi_select') {
      values[field.id] = field.required && field.options?.[0] ? [field.options[0].value] : [];
      return;
    }
    if (field.type === 'attachment') {
      values[field.id] = [];
      return;
    }
    values[field.id] = '';
  });
  return values;
};

/** 解析线索；此时尚未匹配模板，先走选机构。可传入已合并的 clue（链接多模态后）。 */
export const buildQuickReportDraft = (
  raw: string,
  orgOptions: string[],
  clueOverride?: ParsedClue
): QuickReportDraft | { error: string } => {
  let clue: ParsedClue;
  if (clueOverride) {
    clue = clueOverride;
  } else {
    const built = buildClueFromUserText(raw);
    if ('error' in built) return built;
    clue = built;
  }

  if (!clue.title?.trim()) {
    if (hasHttpLink(raw) || clue.link) {
      return {
        error:
          '未能从链接识别出标题。请换一条可访问的原文链接，或按下列格式补充后重发：\n\n涉事属地：\n信息发布时间：\n信息标题：\n链接：',
      };
    }
    if (!looksLikeStructuredClue(raw)) {
      return {
        error:
          '已进入快捷上报，但未能稳定识别标题/属地等关键信息。\n可直接发送原文链接，或按下列格式重发；也可回复【表单】改为页面填写：\n\n涉事属地：\n信息发布时间：\n信息标题：\n链接：',
      };
    }
    return {
      error:
        '未能识别「信息标题」。请补充标题后重发，或回复【表单】在页面中填写。',
    };
  }

  const uniqueOrgs = Array.from(new Set(orgOptions.filter(Boolean)));

  return {
    clue: { ...clue, raw: clue.raw || raw },
    orgOptions: uniqueOrgs,
    selectedOrg: uniqueOrgs.length === 1 ? uniqueOrgs[0] : undefined,
    missingLabels: [],
    canDirectSubmit: false,
  };
};

export const formatOrgPrompt = (draft: QuickReportDraft) => {
  const lines = [
    '已识别线索，请先确认报送机构：',
    '',
    `标题：${draft.clue.title}`,
  ];
  if (draft.clue.sourceLabel) {
    lines.push(`来源：${draft.clue.sourceLabel}`);
  }
  if (draft.clue.summary && draft.clue.summary !== draft.clue.title) {
    lines.push(`摘要：${draft.clue.summary}`);
  }
  lines.push(
    `属地：${draft.clue.district || '未识别'}｜时间：${draft.clue.timeText || '未识别'}｜链接：${
      draft.clue.link ? '已识别' : '未识别'
    }`,
    '',
    '请选择报送机构（选定后将自动匹配模板）：',
    ...draft.orgOptions.map((org, index) => `${index + 1} ${org}`),
    '回复数字｜【取消】退出'
  );
  return lines.join('\n');
};

export const formatConfirmPrompt = (draft: QuickReportDraft) => {
  const matched = draft.matched;
  const matchNote = matched
    ? matched.isDefault
      ? `${matched.template.name}（默认匹配）`
      : matched.template.name
    : '未匹配';
  const header = draft.canDirectSubmit ? '【待提交】' : '【待完善】';
  const lines = [
    header,
    `报送机构：${draft.selectedOrg || '未选择'}`,
    `匹配模板：${matchNote}`,
  ];
  if (matched?.reason) {
    lines.push(`匹配说明：${matched.reason}`);
  }
  lines.push(
    `标题：${draft.clue.title}`,
    `属地：${draft.clue.district || '未识别'}｜时间：${draft.clue.timeText || '未识别'}`,
    `链接：${draft.clue.link || '未识别'}`
  );

  if (draft.clue.reporterHint) {
    lines.push(`文案报送人：${draft.clue.reporterHint}（仅核对，以绑定账号为准）`);
  }

  if (!draft.canDirectSubmit) {
    lines.push(
      '',
      `缺少：${draft.missingLabels.slice(0, 6).join('、')}${draft.missingLabels.length > 6 ? '…' : ''}`
    );
    lines.push('', '模板如需更换，请回复【2】在页面中修改。', '2 去完善', '0 取消');
  } else {
    lines.push('', '说明：模板细项将按初值提交，可点「去完善」修改。');
    lines.push('', '1 确认提交', '2 去完善（可改模板或补全信息）', '0 取消');
  }
  return lines.join('\n');
};

export const formatSuccessPrompt = (params: {
  title: string;
  org: string;
  templateName: string;
  reportId: string;
}) =>
  [
    '已提交审核。',
    `模板：${params.templateName}｜机构：${params.org}`,
    `标题：${params.title}`,
    `单号：${params.reportId}`,
    '可在「我的报送」查看进度。',
  ].join('\n');

export const GUIDE_AFTER_MENU =
  '【快捷报送】\n支持四种输入：\n1）原文链接（自动识标题）\n2）结构化文字（属地/时间/标题/链接）\n3）图片截图或现场拍照（OCR）\n4）语音口述（转写）\n\n也可点「+」选照片/拍照，或点麦克风发语音。\n流程：解析线索 → 确认报送机构 → 按该机构自动匹配模板。\n完整表单请走菜单「手动报送」。\n回复【取消】退出。';

export const GUIDE_AFTER_KEYWORD =
  '已进入快捷报送。\n请发送原文链接、文字线索、图片或语音。\n将先解析并请您确认机构，再自动匹配模板。\n点「+」可传图；点麦克风可口述。\n回复【取消】退出；回复【表单】改为页面填写。';

export const LIGHT_TIP =
  '如需快速报送：点击菜单「快捷报送」，或发送【报送】后发链接/文字/图片/语音。\n完整填写请使用「手动报送」。';
