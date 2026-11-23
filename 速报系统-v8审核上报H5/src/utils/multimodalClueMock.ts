/** 快捷报送：图片 OCR / 语音 ASR Mock（可替换为真实服务） */

export type ClueSourceKind = 'text' | 'link' | 'image' | 'video' | 'voice' | 'location';

export type MultimodalClueFields = {
  title: string;
  summary: string;
  timeText: string;
  district?: string;
  link?: string;
  sourceKind: ClueSourceKind;
  sourceLabel: string;
  attachmentHint?: string;
  /** 语音转写原文（仅 voice） */
  transcript?: string;
};

export type MultimodalClueSuccess = { ok: true } & MultimodalClueFields;

export type MultimodalClueFailure = {
  ok: false;
  sourceKind: ClueSourceKind;
  reason: string;
};

export type MultimodalClueResult = MultimodalClueSuccess | MultimodalClueFailure;

const pad = (n: number) => String(n).padStart(2, '0');

const mockTime = (hoursAgo = 2) => {
  const d = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
};

export type ImageCaptureSource = 'album' | 'camera' | 'blur_demo';

export const IMAGE_ANALYZING_TEXT = '正在识别图片文字与事件信息…';
export const VOICE_ANALYZING_TEXT = '正在转写语音…';

export const formatMultimodalSuccessNotice = (result: MultimodalClueSuccess) => {
  const lines = [
    `【${result.sourceLabel}】`,
    `标题：${result.title}`,
    `摘要：${result.summary}`,
    `时间：${result.timeText}`,
  ];
  if (result.district) lines.push(`属地：${result.district}`);
  if (result.link) lines.push(`链接：${result.link}`);
  if (result.transcript) lines.push(`转写：${result.transcript}`);
  if (result.attachmentHint) lines.push(`附件：${result.attachmentHint}`);
  return lines.join('\n');
};

/** 相册 / 拍照 Mock OCR；blur_demo 用于失败演示 */
export const parseImageOcrMock = (source: ImageCaptureSource): MultimodalClueResult => {
  if (source === 'blur_demo') {
    return {
      ok: false,
      sourceKind: 'image',
      reason:
        '图片过于模糊，未能识别有效文字。\n请换一张更清晰的截图/现场图，或改发原文链接、文字线索；也可回复【表单】页面填写。',
    };
  }

  if (source === 'camera') {
    return {
      ok: true,
      sourceKind: 'image',
      sourceLabel: '现场拍照 OCR',
      title: '路口积水影响车辆通行（现场拍照）',
      summary: '现场照片可见路口积水较深，过往车辆缓行，周边有警戒锥摆放痕迹。',
      timeText: mockTime(0),
      district: '台中市西坝区',
      attachmentHint: '现场照片×1',
    };
  }

  // album：默认按「聊天/公众号截图」演示
  return {
    ok: true,
    sourceKind: 'image',
    sourceLabel: '相册截图 OCR',
    title: '微信群讨论：夜间施工噪音扰民',
    summary: '截图识别到群聊多条发言反映夜间施工噪音大，呼吁核查作业时段与审批情况。',
    timeText: mockTime(5),
    district: '台中市',
    attachmentHint: '聊天截图×1',
  };
};

export type VoiceDemoVariant = 'default' | 'noise';

/** 麦克风语音 Mock ASR */
export const parseVoiceAsrMock = (variant: VoiceDemoVariant = 'default'): MultimodalClueResult => {
  if (variant === 'noise') {
    return {
      ok: false,
      sourceKind: 'voice',
      reason:
        '环境噪音过大，语音转写失败。\n请到安静处重录，或改发文字/链接/图片；也可回复【表单】页面填写。',
    };
  }

  const transcript =
    '西坝区阳光花园门口有积水，车子过不去，大概今天下午两点多开始的，请帮忙上报一下。';

  return {
    ok: true,
    sourceKind: 'voice',
    sourceLabel: '语音转写',
    title: '阳光花园门口积水影响通行',
    summary: transcript,
    timeText: mockTime(1),
    district: '台中市西坝区',
    transcript,
    attachmentHint: '语音 15″',
  };
};

/** awaiting_body 下位置上报样例 */
export const parseLocationClueMock = (): MultimodalClueSuccess => ({
  ok: true,
  sourceKind: 'location',
  sourceLabel: '当前位置',
  title: '当前位置线索上报',
  summary: '上报员基于当前网格定位发起线索，请补充事件详情后提交或去完善。',
  timeText: mockTime(0),
  district: '台中市西坝区阳光花园',
  attachmentHint: '定位：台中市西坝区阳光花园',
});

/** 视频作为附件入报送（本期不做内容解析，仅挂附件） */
export const makeVideoAttachmentMock = () => ({
  ok: true as const,
  sourceKind: 'video' as const,
  sourceLabel: '现场视频',
  title: '',
  summary: '',
  timeText: mockTime(0),
  attachmentHint: '现场视频_路口积水.mp4',
});

/** 文档作为附件入报送 */
export const makeFileAttachmentMock = () => ({
  ok: true as const,
  sourceKind: 'text' as const,
  sourceLabel: '文档附件',
  title: '',
  summary: '',
  timeText: mockTime(0),
  attachmentHint: '情况说明.pdf',
});

export const sourceKindToTag = (kind: ClueSourceKind): string => {
  switch (kind) {
    case 'link':
      return '链接识别';
    case 'image':
      return '图片OCR';
    case 'video':
      return '视频附件';
    case 'voice':
      return '语音转写';
    case 'location':
      return '位置上报';
    default:
      return '文字线索';
  }
};
