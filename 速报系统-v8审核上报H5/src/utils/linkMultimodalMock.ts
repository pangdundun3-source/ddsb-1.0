/** 快捷报送：链接多模态解析（原型 Mock，可替换为真实抓取/LLM 服务） */

export type LinkMultimodalSuccess = {
  ok: true;
  link: string;
  title: string;
  summary: string;
  timeText: string;
  district?: string;
  sourceHost: string;
};

export type LinkMultimodalFailure = {
  ok: false;
  link?: string;
  reason: string;
};

export type LinkMultimodalResult = LinkMultimodalSuccess | LinkMultimodalFailure;

const URL_RE = /https?:\/\/[^\s<>"']+/i;

/** 从文本中抽取首个 http(s) 链接（去掉常见尾部标点） */
export const extractHttpUrl = (text: string): string | undefined => {
  const match = text.match(URL_RE);
  if (!match?.[0]) return undefined;
  return match[0].replace(/[)，。；;,.!?）]+$/g, '');
};

export const hasHttpLink = (text: string) => Boolean(extractHttpUrl(text));

const pad = (n: number) => String(n).padStart(2, '0');

/** 相对当前时间的模拟发布时间 */
const mockPublishTime = (hoursAgo = 3) => {
  const d = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
};

const getHost = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const pathHint = (url: string) => {
  try {
    const { pathname } = new URL(url);
    const seg = pathname.split('/').filter(Boolean).pop() || '';
    return decodeURIComponent(seg).slice(0, 24) || '公开页面';
  } catch {
    return '公开页面';
  }
};

/**
 * 按域名规则生成可读标题/摘要等。
 * 失败样例：https://fail.example.com/...
 */
export const parseLinkMultimodal = (rawOrUrl: string): LinkMultimodalResult => {
  const link = extractHttpUrl(rawOrUrl);
  if (!link) {
    return { ok: false, reason: '未检测到有效链接，请发送以 http/https 开头的原文地址。' };
  }

  const host = getHost(link);
  if (!host) {
    return { ok: false, link, reason: '链接格式无效，请检查后重发。' };
  }

  if (host === 'fail.example.com' || host.endsWith('.fail.example.com')) {
    return {
      ok: false,
      link,
      reason:
        '无法访问原文（模拟失败）。\n请改发结构化线索正文，或回复【表单】在页面中填写。\n\n报送标题：\n报送描述：\n涉事属地：\n相关链接：',
    };
  }

  const timeText = mockPublishTime(host.includes('douyin') ? 1 : 4);

  if (host.includes('mp.weixin.qq.com') || host.includes('weixin.qq.com')) {
    return {
      ok: true,
      link,
      sourceHost: host,
      title: '某社区停水通知引发居民讨论（公众号原文）',
      summary: '公众号发文提及局部区域临时停水及供水恢复安排，评论区出现催促与质疑声。',
      timeText,
      district: '台中市',
    };
  }

  if (host.includes('douyin.com') || host.includes('iesdouyin.com')) {
    return {
      ok: true,
      link,
      sourceHost: host,
      title: '短视频反映路口积水影响通行',
      summary: '抖音视频画面显示路口积水较深，过往车辆缓行，评论呼吁尽快排水处置。',
      timeText,
      district: '台中市',
    };
  }

  if (host.includes('kuaishou.com') || host.includes('chenzhongtech.com')) {
    return {
      ok: true,
      link,
      sourceHost: host,
      title: '绥化市一处厂房发生火灾，现场火势较大浓烟滚滚，多辆消防车已赶到现场，人员伤亡情况不明。',
      summary:
        '快手视频显示绥化市某厂房起火，现场浓烟较大，多辆消防车到场处置，人员伤亡情况尚不明，建议属地核实。',
      timeText,
      district: '绥化市',
    };
  }

  if (host.includes('weibo.com') || host.includes('weibo.cn')) {
    return {
      ok: true,
      link,
      sourceHost: host,
      title: '微博热议：夜间施工噪音扰民',
      summary: '网民发帖反映夜间施工噪音较大，希望相关部门核查并规范作业时段。',
      timeText,
      district: '台中市',
    };
  }

  if (host.includes('toutiao.com') || host.includes('thepaper.cn') || host.includes('news')) {
    return {
      ok: true,
      link,
      sourceHost: host,
      title: `媒体报道：${pathHint(link)}相关事件动态`,
      summary: '新闻页面披露事件进展与属地回应要点，建议核对发布时间与原文表述后报送。',
      timeText,
      district: '台中市',
    };
  }

  return {
    ok: true,
    link,
    sourceHost: host,
    title: `网络公开信息：${pathHint(link)}`,
    summary: `已从 ${host} 页面提取标题与摘要初稿，请核对后确认报送机构。`,
    timeText,
  };
};

export const LINK_ANALYZING_TEXT = '正在解析链接，提取标题与事件信息…';

/** 解析完成后的识别摘要（选机构前展示） */
export const formatLinkParseSuccessNotice = (result: LinkMultimodalSuccess) =>
  [
    '【链接多模态识别】',
    `来源：${result.sourceHost}`,
    `标题：${result.title}`,
    `摘要：${result.summary}`,
    `发布时间：${result.timeText}`,
    result.district ? `属地推断：${result.district}` : '属地：未能从链接稳定推断',
    `链接：${result.link}`,
  ].join('\n');
