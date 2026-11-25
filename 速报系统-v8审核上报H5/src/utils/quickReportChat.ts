import { REPORT_TEMPLATES } from '../data/mockData';
import { isTemplateBlockedByExternalAudit } from '../shared/valueAddedAccess';
import { ReportTemplate, TemplateType } from '../types';
import {
  LinkMultimodalSuccess,
  extractHttpUrl,
  hasHttpLink,
} from './linkMultimodalMock';
import {
  ClueSourceKind,
  MultimodalClueSuccess,
  sourceKindToTag,
} from './multimodalClueMock';

export { sourceKindToTag } from './multimodalClueMock';
export type { ClueSourceKind } from './multimodalClueMock';
export { hasHttpLink, extractHttpUrl } from './linkMultimodalMock';

export type QuickReportPhase =
  | 'idle'
  | 'awaiting_body'
  | 'awaiting_org'
  /** 已具备可提交草稿，静默等待约定时长后自动提交 */
  | 'awaiting_auto_submit';

/** 会话关联与无确认自动提交的约定时长（毫秒） */
export const QUICK_REPORT_SESSION_MS = 60_000;

export const TEXT_RECEIVED_CONTINUE_TIP =
  `已收到。✅ ${Math.round(QUICK_REPORT_SESSION_MS / 1000)} 秒内支持补充附件，超时自动完成提交。`;

export const MEDIA_NEED_TEXT_TIP =
  '请先发送模板文字，再补图片或附件。';

/** 会话中补充图片/视频/文件后的短提示 */
export const ATTACHMENT_ADDED_TIP = '已补充到当前模板中';

export type QuickAttachmentKind = 'text' | 'image' | 'video' | 'file' | 'link';

export interface QuickAttachment {
  id: string;
  name: string;
  kind: QuickAttachmentKind;
}

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
  /** 当次报送附件（文本/图/视频/文档/链接） */
  attachments: QuickAttachment[];
}

export const makeQuickAttachment = (
  kind: QuickAttachmentKind,
  name: string
): QuickAttachment => ({
  id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  kind,
  name,
});

export const mergeAttachments = (
  current: QuickAttachment[] | undefined,
  extras: QuickAttachment[]
) => [...(current || []), ...extras];

export const formatAttachmentLines = (attachments: QuickAttachment[]) => {
  if (!attachments.length) return ['（暂无附件，可补充图片、视频或文件）'];
  return attachments.map((item, index) => {
    const kindLabel =
      item.kind === 'image'
        ? '图片'
        : item.kind === 'video'
          ? '视频'
          : item.kind === 'file'
            ? '文件'
            : item.kind === 'link'
              ? '链接'
              : '文本';
    return `${index + 1}. [${kindLabel}] ${item.name}`;
  });
};

/** 当次可上传附件：图片 / 视频 / 文件 */
export const mediaAttachmentsOnly = (attachments: QuickAttachment[] | undefined) =>
  (attachments || []).filter(
    (item) => item.kind === 'image' || item.kind === 'video' || item.kind === 'file'
  );

/** 写入报送 attachments（链接走 matchedLink，文本种子不单独挂附件） */
export const toReportAttachments = (attachments: QuickAttachment[] | undefined) =>
  mediaAttachmentsOnly(attachments).map((item) => ({
    id: item.id,
    name: item.name,
    type:
      item.kind === 'image'
        ? ('image' as const)
        : item.kind === 'video'
          ? ('video' as const)
          : /\.pdf$/i.test(item.name)
            ? ('pdf' as const)
            : ('file' as const),
    size: '—',
  }));

const ENTRY_KEYWORDS = ['快捷报送', '快捷上报', '报送', '线索', '转报送', '消息报送'];
const CANCEL_KEYWORDS = ['取消', '0'];
const FORM_KEYWORDS = ['表单', '页面上报'];

/** 快捷报送推荐填写模板（引导文案与识别失败提示共用） */
export const STRUCTURED_CLUE_TEMPLATE = ['报送标题：', '报送描述：', '涉事属地：', '相关链接：'].join(
  '\n'
);

const RUMOR_WORDS = ['谣言', '不实', '辟谣', '虚假', '造谣'];
const APPEAL_WORDS = ['诉求', '投诉', '民生', '反映', '办理'];
const RISK_WORDS = ['隐患', '专项', '协查', '风险线索', '联合核查'];
const INCIDENT_WORDS = ['火灾', '爆炸', '事故', '伤亡', '警情', '突发事件', '浓烟', '救援', '消防车'];

/** 下一字段标签：用于截取可跨行的「报送描述」 */
const NEXT_FIELD_LOOKAHEAD =
  '(?=\\n\\s*(?:报送标题|报送描述|涉事属地|相关链接|信息标题|信息发布时间|报送人|属地|链接)[:：]|$)';

export const isEntryKeyword = (text: string) =>
  ENTRY_KEYWORDS.some((word) => text === word || text.startsWith(word));

export const isCancelKeyword = (text: string) =>
  CANCEL_KEYWORDS.some((word) => text.trim() === word);

export const isFormKeyword = (text: string) =>
  FORM_KEYWORDS.some((word) => text.trim() === word);

/** 结构化线索特征：标签命中 ≥ 2 或标题+链接即可被动识别 */
export const looksLikeStructuredClue = (text: string) => {
  const tags = [
    '报送标题',
    '报送描述',
    '涉事属地',
    '相关链接',
    '报送人',
    '属地',
    '信息发布时间',
    '发布时间',
    '信息标题',
    '标题',
    '链接',
  ];
  const hit = tags.filter((tag) => text.includes(tag)).length;
  return (
    hit >= 2 ||
    (Boolean(extractLabeled(text, ['报送标题', '信息标题', '标题'])) && /https?:\/\//i.test(text))
  );
};

/** 可直接进入快捷报送：结构化正文，或含 http(s) 原文链接（含抖音分享口令） */
export const looksLikeQuickClue = (text: string) =>
  looksLikeStructuredClue(text) || hasHttpLink(text);

/**
 * 从非模板自由文本推断标题（抖音「复制打开」口令、括号作品名、去链后正文）
 */
export const extractFreeformTitle = (raw: string): string | undefined => {
  const bracket = raw.match(/【([^】]{2,48})】\s*([^\n]{0,120})/);
  if (bracket) {
    const after = bracket[2]
      .replace(/https?:\/\/\S+/gi, '')
      .replace(/[a-zA-Z0-9._\-]+\/[^\s]*/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[.…]+$/g, '');
    if (after.length >= 4) return after.slice(0, 72);
    if (bracket[1].trim().length >= 2) return bracket[1].trim().slice(0, 72);
  }
  const cleaned = raw
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/\d+(\.\d+)?\s*复制打开抖音[，,]?[^\n]{0,40}看看/gi, ' ')
    .replace(/[a-zA-Z]{1,4}@[a-zA-Z0-9.]+/g, ' ')
    .replace(/[A-Za-z0-9]{2,}\/[\:：][^\s]*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length >= 4) return cleaned.slice(0, 72);
  return undefined;
};

/** 文案字段优先，空缺用链接多模态结果补全 */
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
  sourceKind: 'link',
  sourceLabel: `链接·${linkResult.sourceHost}`,
  raw: base.raw || linkResult.link,
});

const extractLabeled = (text: string, labels: string[]) => {
  for (const label of labels) {
    const re = new RegExp(`${label}[:：]?\\s*([^\\n]+)`, 'i');
    const match = text.match(re);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return undefined;
};

/** 可跨行取值（到下一标签或文末） */
const extractLabeledBlock = (text: string, labels: string[]) => {
  for (const label of labels) {
    const re = new RegExp(`${label}[:：]?\\s*([\\s\\S]*?)${NEXT_FIELD_LOOKAHEAD}`, 'i');
    const match = text.match(re);
    const value = match?.[1]?.trim();
    if (value) return value;
  }
  return undefined;
};

const extractLink = (text: string) => {
  const labeled = extractLabeled(text, ['相关链接', '链接']);
  if (labeled && /https?:\/\//i.test(labeled)) {
    const url = labeled.match(/https?:\/\/\S+/i);
    return url?.[0];
  }
  if (labeled && labeled.trim()) return labeled.trim();
  const bare = text.match(/https?:\/\/\S+/i);
  return bare?.[0];
};

export const parseClueText = (raw: string): ParsedClue => {
  const title = extractLabeled(raw, ['报送标题', '信息标题', '标题']);
  const description = extractLabeledBlock(raw, ['报送描述', '内容描述', '描述']);
  const district = extractLabeled(raw, ['涉事属地', '属地']);
  const timeText = extractLabeled(raw, ['信息发布时间', '发布时间', '时间']);
  const link = extractLink(raw);
  const reporterLine = raw.match(/报送人[：:]?\s*([^\n]+)/);
  const reporterHint = reporterLine?.[1]?.trim();

  const summary = description || title;

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

/** 从用户文字抽取字段；无标签时尝试自由文本标题，并带出裸链 */
export const buildClueFromUserText = (raw: string): ParsedClue => {
  const textClue = parseClueText(raw);
  const freeTitle = textClue.title || extractFreeformTitle(raw);
  const link = textClue.link || extractHttpUrl(raw);
  return {
    ...textClue,
    title: freeTitle,
    summary: textClue.summary || freeTitle,
    link,
    sourceKind: textClue.sourceKind || (link ? 'link' : 'text'),
    sourceLabel: textClue.sourceLabel || (link ? '链接线索' : '文字线索'),
  };
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
  if (!clue.title?.trim()) missing.push('报送标题');

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
      values[field.id] = mediaAttachmentsOnly(draft.attachments).map((item) => item.name);
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
  clue = clueOverride || buildClueFromUserText(raw);

  if (!clue.title?.trim()) {
    if (hasHttpLink(raw)) {
      return { error: GUIDE_NEED_SUPPLEMENT };
    }
    if (!looksLikeStructuredClue(raw)) {
      return { error: GUIDE_UNRECOGNIZED_CHAT };
    }
    return { error: GUIDE_NEED_SUPPLEMENT };
  }

  const uniqueOrgs = Array.from(new Set(orgOptions.filter(Boolean)));

  const seedAttachments: QuickAttachment[] = [];
  if (clue.link) {
    seedAttachments.push(makeQuickAttachment('link', clue.link));
  }
  if ((clue.raw || raw).trim()) {
    const short = (clue.title || '线索正文').slice(0, 16);
    seedAttachments.push(makeQuickAttachment('text', `${short}.txt`));
  }
  if (clue.attachmentHint && (clue.sourceKind === 'image' || clue.sourceKind === 'video')) {
    seedAttachments.push(
      makeQuickAttachment(clue.sourceKind === 'video' ? 'video' : 'image', clue.attachmentHint)
    );
  }

  return {
    clue: { ...clue, raw: clue.raw || raw },
    orgOptions: uniqueOrgs,
    selectedOrg: uniqueOrgs.length === 1 ? uniqueOrgs[0] : undefined,
    missingLabels: [],
    canDirectSubmit: false,
    attachments: seedAttachments,
  };
};

export const formatOrgPrompt = (draft: QuickReportDraft) => {
  const lines = [
    '已识别线索，请先确认报送机构：',
    '',
    `报送标题：${draft.clue.title}`,
  ];
  if (draft.clue.sourceLabel) {
    lines.push(`来源：${draft.clue.sourceLabel}`);
  }
  if (draft.clue.summary && draft.clue.summary !== draft.clue.title) {
    lines.push(`报送描述：${draft.clue.summary}`);
  }
  lines.push(
    `涉事属地：${draft.clue.district || '未识别'}`,
    `相关链接：${draft.clue.link || '未识别'}`,
    '',
    '请选择报送机构（选定后将自动匹配模板）：',
    ...draft.orgOptions.map((org, index) => `${index + 1} ${org}`),
    '回复数字｜【取消】退出'
  );
  return lines.join('\n');
};

/** 进入自动提交等待：已收到 + 摘要合为一条 */
export const formatAutoSubmitPrompt = (draft: QuickReportDraft) => {
  const matched = draft.matched;
  const matchNote = matched
    ? matched.isDefault
      ? `${matched.template.name}（默认匹配）`
      : matched.template.name
    : '未匹配';
  const waitSec = Math.round(QUICK_REPORT_SESSION_MS / 1000);
  const mediaAtts = mediaAttachmentsOnly(draft.attachments);
  const lines = [
    `已收到。✅ ${waitSec} 秒内支持补充附件，超时自动完成提交。`,
    '',
    '【待自动提交】',
    `报送机构：${draft.selectedOrg || '未选择'}`,
    `匹配模板：${matchNote}`,
    `报送标题：${draft.clue.title}`,
  ];
  if (draft.clue.summary && draft.clue.summary !== draft.clue.title) {
    lines.push(`报送描述：${draft.clue.summary}`);
  }
  lines.push(
    `涉事属地：${draft.clue.district || '未识别'}`,
    `相关链接：${draft.clue.link || '未识别'}`,
    '',
    mediaAtts.length
      ? `当次附件：\n${formatAttachmentLines(mediaAtts).join('\n')}`
      : '当次附件：暂无（可继续上传）',
    '',
    '⚠️ 若发送新报送模板，系统会先提交当前这条待报送内容。',
    '回复【取消】退出快捷报送。'
  );
  return lines.join('\n');
};

/** @deprecated 已改为无确认自动提交，保留别名以免旧引用报错 */
export const formatConfirmPrompt = formatAutoSubmitPrompt;

export const formatSuccessPrompt = (params: {
  title: string;
  org: string;
  templateName: string;
  reportId?: string;
}) =>
  [
    '已提交审核。',
    `模板：${params.templateName}｜机构：${params.org}`,
    `标题：${params.title}`,
    '可在「我的报送」查看进度。',
  ].join('\n');

const QUICK_SESSION_TIP = `✅ ${Math.round(QUICK_REPORT_SESSION_MS / 1000)} 秒内支持补充附件，超时自动完成提交；
⚠️ 若发送新报送模板，系统会先提交当前这条待报送内容。
回复【取消】退出快捷报送。`;

export const GUIDE_AFTER_MENU = `【快捷报送】
直接发送原文链接或分享口令，也可按以下模板进行填报：

${STRUCTURED_CLUE_TEMPLATE}

${QUICK_SESSION_TIP}`;

export const GUIDE_AFTER_KEYWORD = `已进入快捷报送。
直接发送原文链接或分享口令，也可按以下模板进行填报：

${STRUCTURED_CLUE_TEMPLATE}

${QUICK_SESSION_TIP}`;

/** 闲聊 / 无法识别有效线索时，下发与快捷报送一致的填写模板 */
export const GUIDE_UNRECOGNIZED_CHAT = `【未能识别有效报送信息】
直接发送原文链接或分享口令，也可按以下模板进行填报：

${STRUCTURED_CLUE_TEMPLATE}

${QUICK_SESSION_TIP}`;

/** 未开通多模态时直接发链接/图文视频，或有链接却无标题 → 引导继续补充 */
export const GUIDE_NEED_SUPPLEMENT = `【请继续补充】
直接发送原文链接或分享口令，也可按以下模板进行填报：

${STRUCTURED_CLUE_TEMPLATE}

${QUICK_SESSION_TIP}`;

export const LIGHT_TIP = GUIDE_UNRECOGNIZED_CHAT;
