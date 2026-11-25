import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  User,
  ExternalLink,
  Mic,
  Smile,
  PlusCircle,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileText,
  CheckSquare,
  LogIn,
  Layers,
  ArrowRight,
  Info,
  X,
  Camera,
  Image as ImageIcon,
  MapPin,
  BellRing,
  ChevronRight,
  Video,
  File,
  Search,
  MoreHorizontal,
  BadgeCheck,
  Bell,
  MessageSquare,
} from 'lucide-react';
import { confirmDialog } from './ConfirmDialog';
import { SpeedReport, UserProfile, UserRole } from '../types';
import {
  GUIDE_AFTER_KEYWORD,
  GUIDE_AFTER_MENU,
  LIGHT_TIP,
  MEDIA_NEED_TEXT_TIP,
  QUICK_REPORT_SESSION_MS,
  QuickAttachment,
  QuickReportDraft,
  QuickReportPhase,
  buildClueFromUserText,
  buildQuickReportDraft,
  buildSoftExtraValues,
  extractFreeformTitle,
  finalizeDraftWithOrg,
  formatAutoSubmitPrompt,
  formatOrgPrompt,
  formatSuccessPrompt,
  hasHttpLink,
  isCancelKeyword,
  isEntryKeyword,
  isFormKeyword,
  looksLikeQuickClue,
  looksLikeStructuredClue,
  makeQuickAttachment,
  mergeAttachments,
  mergeClueWithLinkResult,
  toReportAttachments,
} from '../utils/quickReportChat';
import {
  LINK_ANALYZING_TEXT,
  formatLinkParseSuccessNotice,
  parseLinkMultimodal,
} from '../utils/linkMultimodalMock';
import {
  makeFileAttachmentMock,
  makeVideoAttachmentMock,
} from '../utils/multimodalClueMock';
import { getAuditAssignmentStatus, getAuditBlockTip } from '../utils/submitGuard';

const OA_AVATAR_SRC = `${import.meta.env.BASE_URL}oa-avatar.jpg`;

/** 关注后欢迎/激活引导文案（默认会话与再次关注共用） */
const FOLLOW_WELCOME_TEXT =
  '欢迎关注【点点速豹】\n请您完成账号激活与实名认证，验证通过后即可开通平台使用权限。';

const OfficialAccountAvatar: React.FC<{ className?: string }> = ({
  className = 'w-10 h-10 rounded-[8px]',
}) => (
  <div className={`${className} overflow-hidden shrink-0 shadow-xs bg-white`}>
    <img src={OA_AVATAR_SRC} alt="点点速豹" className="w-full h-full object-cover" />
  </div>
);

interface OfficialAccountEntryViewProps {
  onEnterReport: () => void;
  onEnterReportList: () => void;
  onEnterWorkbench: (role?: UserRole) => void;
  onEnterAuditList: (kind?: 'external' | 'v8_org') => void;
  onEnterProfile: () => void;
  onEnterLogin: () => void;
  onEnterActivationH5?: () => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  /** 当前登录/绑定用户，用于多机构与提交署名 */
  user?: UserProfile;
  /** 快捷上报直接提交 */
  onQuickReportSubmit?: (payload: Partial<SpeedReport>) => string;
  /** 去完善：打开 H5 预填表单 */
  onQuickReportRefine?: (payload: Partial<SpeedReport>) => void;
}

/** 可序列化的消息卡片动作（跳转后会话可恢复） */
type CardActionKind =
  | 'activation'
  | 'workbench'
  | 'report_list'
  | 'audit_external'
  | 'profile';

interface ChatMessage {
  id: string;
  sender: 'account' | 'user';
  text: string;
  time?: string;
  cardAction?: {
    kind: CardActionKind;
    label: string;
  };
}

const OA_CHAT_STORAGE_KEY = 'wechat_v8_oa_chat_messages';
const OA_CHAT_MAX_MESSAGES = 200;
const OA_QUICK_ORG_DEMO_KEY = 'wechat_v8_oa_quick_org_demo';

/** 演示视角：单机构跳过选机构；多机构走选机构确认 */
type QuickOrgDemoMode = 'single' | 'multi';

const loadQuickOrgDemoMode = (): QuickOrgDemoMode => {
  try {
    const raw = localStorage.getItem(OA_QUICK_ORG_DEMO_KEY);
    return raw === 'single' ? 'single' : 'multi';
  } catch {
    return 'multi';
  }
};

const buildDefaultOaMessages = (): ChatMessage[] => [
  {
    id: 'msg_follow_welcome',
    sender: 'account',
    text: FOLLOW_WELCOME_TEXT,
    cardAction: { kind: 'activation', label: '前往验证激活' },
  },
  {
    id: 'msg_welcome',
    sender: 'account',
    text: '您好，点点速豹助手为您服务。\n发送【报送】、点菜单「快捷报送」，或直接粘贴原文链接/抖音分享口令即可快速报送。\n也可按模板填写：\n\n报送标题：\n报送描述：\n涉事属地：\n相关链接：\n\n✅ 60 秒内支持补充附件，超时自动完成提交；\n⚠️ 若发送新报送模板，系统会先提交当前这条待报送内容。\n回复【取消】退出快捷报送。',
  },
];

const loadOaMessages = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(OA_CHAT_STORAGE_KEY);
    if (!raw) return buildDefaultOaMessages();
    const parsed = JSON.parse(raw) as ChatMessage[];
    if (!Array.isArray(parsed) || parsed.length === 0) return buildDefaultOaMessages();
    return parsed
      .filter(
        (m) =>
          m &&
          typeof m.id === 'string' &&
          (m.sender === 'account' || m.sender === 'user') &&
          typeof m.text === 'string'
      )
      .map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        time: m.time,
        cardAction:
          m.cardAction &&
          typeof m.cardAction.kind === 'string' &&
          typeof m.cardAction.label === 'string'
            ? { kind: m.cardAction.kind, label: m.cardAction.label }
            : undefined,
      }));
  } catch {
    return buildDefaultOaMessages();
  }
};

export const OfficialAccountEntryView: React.FC<OfficialAccountEntryViewProps> = ({
  onEnterReport,
  onEnterReportList,
  onEnterWorkbench,
  onEnterAuditList,
  onEnterProfile,
  onEnterLogin,
  onEnterActivationH5,
  onToast,
  user,
  onQuickReportSubmit,
  onQuickReportRefine,
}) => {
  // Mode: custom menu vs text chat input（有历史对话时回到聊天输入，便于接着聊）
  const [inputMode, setInputMode] = useState<'menu' | 'chat'>(() => {
    try {
      const raw = localStorage.getItem(OA_CHAT_STORAGE_KEY);
      if (!raw) return 'menu';
      const parsed = JSON.parse(raw) as ChatMessage[];
      return Array.isArray(parsed) && parsed.some((m) => m.sender === 'user') ? 'chat' : 'menu';
    } catch {
      return 'menu';
    }
  });
  const [inputText, setInputText] = useState<string>('');
  const [showServiceProfile, setShowServiceProfile] = useState<boolean>(false);
  const [showPlusDrawer, setShowPlusDrawer] = useState<boolean>(false);
  const [showActivationModal, setShowActivationModal] = useState<boolean>(false);
  const [showWorkbenchMenu, setShowWorkbenchMenu] = useState(false);
  const [serviceProfileTab, setServiceProfileTab] = useState<'all' | 'service'>('all');

  const closeFlyoutMenus = () => {
    setShowWorkbenchMenu(false);
  };
  const [quickPhase, setQuickPhase] = useState<QuickReportPhase>('idle');
  const [quickDraft, setQuickDraft] = useState<QuickReportDraft | null>(null);
  /** 演示入口：单机构 / 多机构（点击「快捷报送」选择） */
  const [quickOrgDemoMode, setQuickOrgDemoMode] = useState<QuickOrgDemoMode>(loadQuickOrgDemoMode);
  const [showQuickDemoPicker, setShowQuickDemoPicker] = useState(false);
  /** 上一条用户消息时间戳：用于会话关联判定（不预挂倒计时） */
  const lastUserMsgAtRef = useRef<number>(0);
  const autoSubmitTimerRef = useRef<number | null>(null);
  const quickDraftRef = useRef<QuickReportDraft | null>(null);
  const quickPhaseRef = useRef<QuickReportPhase>('idle');
  const linkParseSeqRef = useRef(0);

  useEffect(() => {
    quickDraftRef.current = quickDraft;
  }, [quickDraft]);
  useEffect(() => {
    quickPhaseRef.current = quickPhase;
  }, [quickPhase]);
  useEffect(() => {
    try {
      localStorage.setItem(OA_QUICK_ORG_DEMO_KEY, quickOrgDemoMode);
    } catch {
      /* ignore */
    }
  }, [quickOrgDemoMode]);

  // New follower activation state (User must activate after following before using platform functions)
  const [isActivated, setIsActivated] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('wechat_v8_user_activated');
      return raw == null ? true : JSON.parse(raw) === true;
    } catch {
      return true;
    }
  });
  /** 是否已关注该服务号 */
  const [isFollowing, setIsFollowing] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('wechat_v8_oa_following');
      return raw == null ? true : JSON.parse(raw) === true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    localStorage.setItem('wechat_v8_user_activated', JSON.stringify(isActivated));
  }, [isActivated]);

  useEffect(() => {
    localStorage.setItem('wechat_v8_oa_following', JSON.stringify(isFollowing));
  }, [isFollowing]);

  const orgOptions = React.useMemo(() => {
    const primary = user?.department || '牡丹江东宁市网信办';
    const extras = user?.associatedDepts?.length
      ? user.associatedDepts
      : ['绥化市网信办'];
    if (quickOrgDemoMode === 'single') {
      return [primary];
    }
    return Array.from(new Set([primary, ...extras]));
  }, [user, quickOrgDemoMode]);

  const openActivationRef = useRef<() => void>(() => {});

  // Open H5 Activation flow
  const handleOpenActivation = () => {
    if (onEnterActivationH5) {
      onEnterActivationH5();
    } else {
      setShowActivationModal(true);
    }
  };
  openActivationRef.current = handleOpenActivation;

  const runCardAction = (kind: CardActionKind) => {
    switch (kind) {
      case 'activation':
        handleOpenActivation();
        break;
      case 'workbench':
        onEnterWorkbench();
        break;
      case 'report_list':
        onEnterReportList();
        break;
      case 'audit_external':
        onEnterAuditList('external');
        break;
      case 'profile':
        onEnterProfile();
        break;
      default:
        break;
    }
  };

  const pushAccountReply = (
    text: string,
    cardAction?: ChatMessage['cardAction'],
    delay = 350
  ) => {
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `reply_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          sender: 'account',
          text,
          cardAction,
        },
      ]);
    }, delay);
  };

  /** 关注后推送欢迎消息（含前往验证激活） */
  const handleToggleFollow = async () => {
    if (isFollowing) {
      const ok = await confirmDialog('取消关注后将无法接收该服务号消息，确定取消关注？', {
        title: '取消关注',
        okText: '不再关注',
        cancelText: '再想想',
        danger: true,
      });
      if (!ok) return;
      setIsFollowing(false);
      resetQuickFlow();
      setMessages([]);
      try {
        localStorage.removeItem(OA_CHAT_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      onToast('已取消关注，对话已清空', 'info');
      return;
    }
    setIsFollowing(true);
    setIsActivated(false);
    setShowServiceProfile(false);
    setInputMode('chat');
    onToast('已关注服务号', 'success');
    pushAccountReply(
      FOLLOW_WELCOME_TEXT,
      { kind: 'activation', label: '前往验证激活' },
      450
    );
  };

  const clearAutoSubmitTimer = () => {
    if (autoSubmitTimerRef.current != null) {
      window.clearTimeout(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = null;
    }
  };

  const resetQuickFlow = () => {
    linkParseSeqRef.current += 1;
    clearAutoSubmitTimer();
    setQuickPhase('idle');
    setQuickDraft(null);
    lastUserMsgAtRef.current = 0;
  };

  /** 是否仍归属当前快捷上报会话（与上一条用户消息时间差 ≤ 约定时长） */
  const isWithinSessionWindow = (now = Date.now()) => {
    const last = lastUserMsgAtRef.current;
    if (!last) return false;
    return now - last <= QUICK_REPORT_SESSION_MS;
  };

  const markUserMessage = (now = Date.now()) => {
    lastUserMsgAtRef.current = now;
  };

  /** 底部菜单/快捷报送不做激活拦截；激活仅作关注后消息引导 */
  const ensureQuickReportReady = (): boolean => true;

  const openQuickDemoPicker = () => {
    closeFlyoutMenus();
    setShowPlusDrawer(false);
    setShowQuickDemoPicker(true);
  };

  const startQuickReportMode = (
    from: 'menu' | 'keyword',
    mode: QuickOrgDemoMode = quickOrgDemoMode
  ) => {
    clearAutoSubmitTimer();
    setQuickOrgDemoMode(mode);
    setShowQuickDemoPicker(false);
    setQuickPhase('awaiting_body');
    setQuickDraft(null);
    setInputMode('chat');
    closeFlyoutMenus();
    setShowPlusDrawer(false);
    pushAccountReply(from === 'menu' ? GUIDE_AFTER_MENU : GUIDE_AFTER_KEYWORD, undefined, 200);
  };

  /** 与页面「新建报送模板」表单字段对齐，供直接提交 / 去完善预填 */
  const buildReportPayload = (draft: QuickReportDraft): Partial<SpeedReport> => {
    const tpl = draft.matched!.template;
    const stamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const title = (draft.clue.title || '').trim() || '未命名线索';
    const summary = (draft.clue.summary || draft.clue.title || '').trim();
    const district = draft.clue.district || '全市';
    const authorDept = draft.selectedOrg || user?.department || '';
    const type = tpl.defaultType;
    return {
      id: `rep_${Date.now()}`,
      title,
      address: draft.clue.district || '',
      source: tpl.defaultSource,
      district,
      type,
      summary,
      coreDemand: summary,
      disposalAdvice: '待审核部门研判处置。',
      matchedLink: draft.clue.link || '',
      templateId: tpl.id,
      templateFieldValues: buildSoftExtraValues(draft),
      attachments: toReportAttachments(draft.attachments),
      author: user?.name || '上报员',
      authorDept,
      gridNo: user?.gridCode || '',
      sentimentTrend: '',
      updateTime: stamp,
      createTime: stamp,
      tags: [district, type, authorDept, '快捷上报'].filter(Boolean),
    };
  };

  /**
   * 提交一条快捷草稿。
   * softReset：连续发下一条模板时先交上一条，保留会话时间戳，不清成全新 idle 会话。
   */
  const submitQuickDraft = (
    draft: QuickReportDraft,
    options?: { softReset?: boolean }
  ): boolean => {
    if (!draft.matched) return false;
    const auditOrg = draft.selectedOrg || user?.department || '';
    const blockTip = getAuditBlockTip(
      getAuditAssignmentStatus(auditOrg, draft.matched.template.id)
    );
    if (blockTip) {
      pushAccountReply(`${blockTip}\n也可回复【取消】退出。`);
      setQuickPhase('awaiting_auto_submit');
      setQuickDraft(draft);
      scheduleAutoSubmit();
      return false;
    }
    const payload = buildReportPayload(draft);
    const reportId = onQuickReportSubmit?.(payload) || payload.id || '';
    pushAccountReply(
      formatSuccessPrompt({
        title: payload.title || '',
        org: payload.authorDept || '',
        templateName: draft.matched.template.name,
        reportId,
      }),
      {
        kind: 'report_list',
        label: '查看我的报送',
      },
      options?.softReset ? 120 : 350
    );
    clearAutoSubmitTimer();
    setQuickDraft(null);
    setQuickPhase('idle');
    if (!options?.softReset) {
      lastUserMsgAtRef.current = 0;
    }
    return true;
  };

  /** 连续发新模板前：若上一条已进入自动提交等待，先提交再开新草稿 */
  const flushPendingAutoSubmitDraft = () => {
    const draft = quickDraftRef.current;
    const phase = quickPhaseRef.current;
    if (phase !== 'awaiting_auto_submit' || !draft?.matched) return;
    submitQuickDraft(draft, { softReset: true });
  };

  const scheduleAutoSubmit = () => {
    clearAutoSubmitTimer();
    autoSubmitTimerRef.current = window.setTimeout(() => {
      autoSubmitTimerRef.current = null;
      const draft = quickDraftRef.current;
      const phase = quickPhaseRef.current;
      if (phase !== 'awaiting_auto_submit' || !draft?.matched) return;
      submitQuickDraft(draft);
    }, QUICK_REPORT_SESSION_MS);
  };

  /** 机构已确认：合并「已收到 + 待自动提交」为一条，进入静默等待 */
  const goAwaitAutoSubmit = (
    draft: QuickReportDraft,
    options?: { showSummary?: boolean }
  ) => {
    setQuickDraft(draft);
    setQuickPhase('awaiting_auto_submit');
    if (options?.showSummary !== false) {
      pushAccountReply(formatAutoSubmitPrompt(draft), undefined, 200);
    }
    scheduleAutoSubmit();
  };

  const goConfirmWithOrg = (draft: QuickReportDraft, org: string) => {
    const finalized = finalizeDraftWithOrg(draft, org);
    goAwaitAutoSubmit(finalized, { showSummary: true });
  };

  const handleDraftReady = (draft: QuickReportDraft) => {
    setQuickDraft(draft);
    if (draft.orgOptions.length > 1) {
      // 多机构：先确认机构，暂不提示继续上传
      setQuickPhase('awaiting_org');
      pushAccountReply(formatOrgPrompt(draft), undefined, 200);
      return;
    }
    const org = draft.selectedOrg || draft.orgOptions[0];
    if (!org) {
      pushAccountReply('未找到可用报送机构，请先完成账号激活绑定。');
      resetQuickFlow();
      return;
    }
    const finalized = finalizeDraftWithOrg(draft, org);
    goAwaitAutoSubmit(finalized, { showSummary: true });
  };

  const appendAttachmentsToDraft = (
    extras: QuickAttachment[],
    options?: { notice?: string; reschedule?: boolean }
  ) => {
    // 副作用必须在 updater 外：StrictMode 会双调 updater，否则会重复回复
    const prev = quickDraftRef.current;
    if (!prev) return;
    const next: QuickReportDraft = {
      ...prev,
      attachments: mergeAttachments(prev.attachments, extras),
    };
    quickDraftRef.current = next;
    setQuickDraft(next);
    if (options?.notice) pushAccountReply(options.notice, undefined, 120);
    if (options?.reschedule && quickPhaseRef.current === 'awaiting_auto_submit') {
      scheduleAutoSubmit();
    }
  };

  /** 规定时间内补充的文字：归档为上一条附件，不新开模板 */
  const archiveSupplementaryTextToDraft = (raw: string) => {
    const short = raw.replace(/\s+/g, ' ').trim().slice(0, 16) || '补充文字';
    appendAttachmentsToDraft([makeQuickAttachment('text', `${short}.txt`)], {
      notice: `已归档到本条报送：${short}${raw.trim().length > 16 ? '…' : ''}`,
      reschedule: quickPhaseRef.current === 'awaiting_auto_submit',
    });
  };

  const finishDraftFromClue = (raw: string, clue: ReturnType<typeof buildClueFromUserText>) => {
    const built = buildQuickReportDraft(raw, orgOptions, clue);
    if ('error' in built) {
      setQuickPhase('awaiting_body');
      pushAccountReply(built.error, undefined, 200);
      return;
    }
    handleDraftReady(built);
  };

  /** 含链接时先解析（Mock 多模态），再进选机构 / 自动提交；纯文字仍走标签抽取 */
  const processBodyAsDraft = (raw: string) => {
    // 新模板文字到来：上一条待自动提交的草稿先落单
    flushPendingAutoSubmitDraft();

    if (hasHttpLink(raw)) {
      const seq = ++linkParseSeqRef.current;
      setQuickPhase('awaiting_body');
      pushAccountReply(LINK_ANALYZING_TEXT, undefined, 80);
      window.setTimeout(() => {
        if (seq !== linkParseSeqRef.current) return;
        const textClue = buildClueFromUserText(raw);
        const freeTitle = extractFreeformTitle(raw);
        const linkResult = parseLinkMultimodal(raw);
        if (!linkResult.ok) {
          pushAccountReply(linkResult.reason, undefined, 160);
          return;
        }
        const merged = mergeClueWithLinkResult(
          {
            ...textClue,
            title: textClue.title || freeTitle,
            summary: textClue.summary || freeTitle || textClue.title,
          },
          linkResult
        );
        // 分享口令里已有可读标题时优先用用户文案
        if (freeTitle) merged.title = freeTitle;
        pushAccountReply(formatLinkParseSuccessNotice(linkResult), undefined, 120);
        finishDraftFromClue(raw, merged);
      }, 720);
      return;
    }

    const clue = buildClueFromUserText(raw);
    finishDraftFromClue(raw, clue);
  };

  const pushUserBubble = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        sender: 'user',
        text,
        time: '刚刚',
      },
    ]);
  };

  /**
   * 图片/视频/文档：
   * - 规定时间内且已有上一条草稿 → 直接归档到上一条，并重置自动提交等待
   * - 超时新会话 / 尚无模板文字 → 若上一条待交则先落单，再提示先发模板文字
   */
  const addMediaAsAttachment = (
    kind: 'image' | 'video' | 'file',
    name: string,
    userLabel: string
  ) => {
    if (!ensureQuickReportReady()) return;
    setShowPlusDrawer(false);
    setInputMode('chat');
    closeFlyoutMenus();
    pushUserBubble(userLabel);

    const now = Date.now();
    const within = isWithinSessionWindow(now);
    const draft = quickDraftRef.current;
    const phase = quickPhaseRef.current;
    markUserMessage(now);

    const canAttachToPrevious =
      Boolean(draft) &&
      within &&
      (phase === 'awaiting_org' ||
        phase === 'awaiting_auto_submit' ||
        (phase === 'awaiting_body' && Boolean(draft.clue?.title)));

    if (canAttachToPrevious && draft) {
      appendAttachmentsToDraft([makeQuickAttachment(kind, name)], {
        notice: `已归档到本条报送：${name}`,
        reschedule: phase === 'awaiting_auto_submit',
      });
      if (phase === 'awaiting_org') {
        pushAccountReply('附件已加入本条报送，请继续回复数字选择机构。', undefined, 280);
      }
      return;
    }

    // 超时或无上一条：先交掉待提交草稿，再要求新模板文字
    if (phase === 'awaiting_auto_submit' && draft?.matched) {
      flushPendingAutoSubmitDraft();
    } else {
      clearAutoSubmitTimer();
      setQuickDraft(null);
    }
    setQuickPhase('awaiting_body');
    pushAccountReply(MEDIA_NEED_TEXT_TIP, undefined, 200);
  };

  const uploadAlbumPhoto = () =>
    addMediaAsAttachment('image', '相册截图_凭证.jpg', '[图片] 相册截图');
  const uploadCameraPhoto = () =>
    addMediaAsAttachment('image', '现场照片_路口积水.jpg', '[图片] 现场拍照');
  const uploadVideo = () => {
    const mock = makeVideoAttachmentMock();
    addMediaAsAttachment('video', mock.attachmentHint || '现场视频.mp4', '[视频] 现场视频');
  };
  const uploadFile = () => {
    const mock = makeFileAttachmentMock();
    addMediaAsAttachment('file', mock.attachmentHint || '情况说明.pdf', '[文件] 情况说明');
  };

  // 会话本地持久化：跳转工作台/列表后再回公众号，对话内容仍保留
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadOaMessages());
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const toSave = messages.slice(-OA_CHAT_MAX_MESSAGES);
      localStorage.setItem(OA_CHAT_STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      /* ignore quota */
    }
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [messages]);

  // 卸载时清掉自动提交定时器
  useEffect(() => () => clearAutoSubmitTimer(), []);

  // Handle send chat message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsgText = inputText.trim();
    const now = Date.now();
    const withinSession = isWithinSessionWindow(now);
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      time: '刚刚',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    markUserMessage(now);

    // —— 快捷上报状态机 ——
    if (isCancelKeyword(userMsgText)) {
      if (quickPhase !== 'idle') {
        resetQuickFlow();
        pushAccountReply('已取消快捷上报。');
      } else {
        pushAccountReply('当前没有进行中的快捷上报。');
      }
      return;
    }

    if (isFormKeyword(userMsgText)) {
      resetQuickFlow();
      pushAccountReply('已为您打开手动报送入口：', {
        kind: 'workbench',
        label: '进入首页',
      });
      return;
    }

    if (quickPhase === 'awaiting_org' && quickDraft) {
      const index = Number(userMsgText) - 1;
      if (Number.isInteger(index) && index >= 0 && index < quickDraft.orgOptions.length) {
        goConfirmWithOrg(quickDraft, quickDraft.orgOptions[index]);
        return;
      }
      // 选机构前、规定时间内的补充文字 → 先归档到本条
      if (withinSession && !looksLikeQuickClue(userMsgText)) {
        archiveSupplementaryTextToDraft(userMsgText);
        pushAccountReply(
          `请继续回复 1～${quickDraft.orgOptions.length} 选择报送机构，或回复【取消】退出。`,
          undefined,
          320
        );
        return;
      }
      pushAccountReply(`请回复 1～${quickDraft.orgOptions.length} 选择报送机构，或回复【取消】退出。`);
      return;
    }

    // 自动提交等待中：
    // - 规定时间内的图文视频/补充文字 → 归档上一条并重置计时
    // - 新结构化模板 / 新链接线索 → 先交上一条再开新单
    if (quickPhase === 'awaiting_auto_submit' && quickDraft) {
      if (withinSession && !looksLikeQuickClue(userMsgText)) {
        archiveSupplementaryTextToDraft(userMsgText);
        return;
      }
      if (looksLikeQuickClue(userMsgText)) {
        // 新模板（含超时后重发模板）：processBodyAsDraft 内 flush 上一条
        processBodyAsDraft(userMsgText);
        return;
      }
      // 超时且非新模板：先交上一条，再引导
      flushPendingAutoSubmitDraft();
      setQuickPhase('awaiting_body');
      pushAccountReply(GUIDE_AFTER_KEYWORD, undefined, 200);
      return;
    }

    // 已在快捷报送，或直接粘贴结构化正文 / 原文链接（含抖音分享口令）
    if (quickPhase === 'awaiting_body' || looksLikeQuickClue(userMsgText)) {
      if (!ensureQuickReportReady()) return;
      processBodyAsDraft(userMsgText);
      return;
    }

    if (isEntryKeyword(userMsgText)) {
      // 与菜单「快捷报送」一致：先选单/多机构演示，再下发同一套填写模板
      openQuickDemoPicker();
      return;
    }

    // 原有轻量导航 + 低频引导
    setTimeout(() => {
      let replyText = LIGHT_TIP;
      let cardAction: ChatMessage['cardAction'] | undefined;

      if (userMsgText.includes('工作台') || userMsgText.includes('首页') || userMsgText.includes('瞭望')) {
        replyText = '您可以直接进入工作台首页：';
        cardAction = { kind: 'workbench', label: '进入 工作台首页' };
      } else if (userMsgText.includes('审核') || userMsgText.includes('审查') || userMsgText.includes('批复')) {
        replyText = '请选择审核身份：可点击菜单「报送审核」。';
        cardAction = { kind: 'audit_external', label: '进入 外部组织审核' };
      } else if (
        userMsgText.includes('个人') ||
        userMsgText.includes('中心') ||
        userMsgText.includes('我的') ||
        userMsgText.includes('资料')
      ) {
        replyText = '已为您匹配个人中心入口：';
        cardAction = { kind: 'profile', label: '进入 个人中心' };
      } else if (userMsgText.includes('激活') || userMsgText.includes('开通') || userMsgText.includes('认证')) {
        replyText = '请完成账号激活与实名认证，验证通过后即可开通平台使用权限。';
        cardAction = { kind: 'activation', label: '前往验证激活' };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `reply_${Date.now()}`,
          sender: 'account',
          text: replyText,
          cardAction,
        },
      ]);
    }, 450);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#ededed] relative overflow-hidden select-none font-sans">
      {/* 1. iOS Status Bar - 1:1 Pixel Match */}
      <div className="bg-[#ededed] pt-2 px-6 pb-1 flex justify-between items-center text-[11.5px] font-semibold text-black select-none z-30 shrink-0">
        <span className="font-bold tracking-tight text-[13px]">09:31</span>
        <div className="flex items-center space-x-1.5 text-black">
          {/* 4 Signal bars */}
          <div className="flex items-end space-x-[2px] h-[11px] pb-[0.5px]">
            <div className="w-[3px] h-[4px] bg-black rounded-[0.5px]"></div>
            <div className="w-[3px] h-[6px] bg-black rounded-[0.5px]"></div>
            <div className="w-[3px] h-[8.5px] bg-black rounded-[0.5px]"></div>
            <div className="w-[3px] h-[11px] bg-black rounded-[0.5px]"></div>
          </div>
          {/* Wifi icon */}
          <svg className="w-[15px] h-[15px] text-black fill-current ml-0.5" viewBox="0 0 24 24">
            <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 3.5c3.8 0 7.23 1.54 9.72 4.03L12 19.34 2.28 11.53C4.77 9.04 8.2 7.5 12 7.5z" />
          </svg>
          {/* Battery 80% with yellow fill and black 80 text */}
          <div className="flex items-center ml-0.5">
            <div className="w-[25px] h-[12.5px] rounded-[4px] border border-black p-[0.8px] flex items-center justify-center relative bg-[#facc15] shadow-xs">
              <span className="text-[9px] font-black text-black leading-none font-sans scale-90 tracking-tighter">80</span>
            </div>
            <div className="w-[1.2px] h-[4.5px] bg-black rounded-r-[1px] -ml-[0.5px]"></div>
          </div>
        </div>
      </div>

      {/* 2. WeChat Official Account Top Navigation Bar */}
      <div className="bg-[#ededed] px-3 py-2 flex items-center justify-between z-20 shrink-0 border-b border-black/[0.04]">
        {/* Left: Back chevron button */}
        <button
          onClick={() => onToast('您已在“点点速豹”公众号主会话窗口', 'info')}
          className="p-1 -ml-1 text-slate-800 hover:text-black active:opacity-60 transition-opacity"
          title="返回微信"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>

        {/* Center: Official Account Title */}
        <div className="text-center font-medium text-slate-900 text-[17px] tracking-tight">
          点点速豹
        </div>

        {/* Right: 进入服务号资料页（关注/取关） */}
        <button
          onClick={() => {
            closeFlyoutMenus();
            setServiceProfileTab('all');
            setShowServiceProfile(true);
          }}
          className="p-1 -mr-1 text-slate-800 hover:text-black active:opacity-60 transition-opacity"
          title="服务号资料"
        >
          <User className="w-6 h-6 stroke-[1.7]" />
        </button>
      </div>

      {/* 3. Chat Messages Content Area */}
      <div
        className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4"
        onClick={() => {
          if (showPlusDrawer) setShowPlusDrawer(false);
        }}
      >
        {/* Centered Timestamp */}
        <div className="text-center">
          <span className="text-[12px] text-[#9c9c9c] tracking-tight font-normal">
            09:23
          </span>
        </div>

        {/* Conversation List */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* Account Avatar */}
            {msg.sender === 'account' && <OfficialAccountAvatar />}

            {/* Speech Bubble */}
            <div
              className={`relative max-w-[76%] rounded-[6px] px-3.5 py-2.5 text-[15px] leading-relaxed shadow-xs ${
                msg.sender === 'account'
                  ? 'bg-white text-slate-900 border border-black/[0.04]'
                  : 'bg-[#95ec69] text-slate-900'
              }`}
            >
              {/* Triangular Pointer Tail */}
              {msg.sender === 'account' ? (
                <div
                  className="absolute top-3 -left-[6px] w-0 h-0 border-t-[5px] border-t-transparent border-r-[6px] border-r-white border-b-[5px] border-b-transparent"
                />
              ) : (
                <div
                  className="absolute top-3 -right-[6px] w-0 h-0 border-t-[5px] border-t-transparent border-l-[6px] border-l-[#95ec69] border-b-[5px] border-b-transparent"
                />
              )}

              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Action Card Button if present */}
              {msg.cardAction && (
                <div className="mt-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => runCardAction(msg.cardAction!.kind)}
                    className="w-full flex items-center justify-between px-3 py-1.5 bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-md transition-colors"
                  >
                    <span>{msg.cardAction.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* User Avatar */}
            {msg.sender === 'user' && (
              <div className="w-10 h-10 rounded-[8px] bg-slate-400 text-white flex items-center justify-center shrink-0 font-medium text-xs shadow-xs">
                我
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} className="h-px w-full shrink-0" aria-hidden />

      </div>

      {/* 4. WeChat Bottom Bar - Custom Menu or Chat Input Mode */}
      {inputMode === 'menu' ? (
        /* 菜单：快捷报送｜工作台（手动报送/报送审核）｜个人中心 */
        <div className="relative bg-[#f7f7f7] border-t border-[#dcdcdc] h-[52px] flex items-stretch z-30 shrink-0 select-none">
          <button
            onClick={() => {
              closeFlyoutMenus();
              setInputMode('chat');
            }}
            className="w-[42px] flex items-center justify-center text-slate-700 hover:bg-black/5 active:bg-black/10 transition-colors shrink-0"
            title="切换为输入法键盘"
          >
            <div className="w-[28px] h-[28px] rounded-full border-[1.5px] border-slate-800 flex items-center justify-center">
              <svg className="w-[15px] h-[15px] text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <circle cx="7" cy="9" r="0.8" fill="currentColor" />
                <circle cx="12" cy="9" r="0.8" fill="currentColor" />
                <circle cx="17" cy="9" r="0.8" fill="currentColor" />
                <circle cx="7" cy="13" r="0.8" fill="currentColor" />
                <circle cx="12" cy="13" r="0.8" fill="currentColor" />
                <circle cx="17" cy="13" r="0.8" fill="currentColor" />
                <path d="M7 16h10" />
              </svg>
            </div>
          </button>

          <button
            id="menu-btn-quick-report"
            onClick={openQuickDemoPicker}
            className="flex-1 flex items-center justify-center border-l border-[#e5e5e5] text-[#222222] text-[12px] font-normal hover:bg-black/5 active:bg-black/10 transition-colors px-0.5 whitespace-nowrap overflow-hidden"
            title="快捷报送（可切换单机构/多机构演示）"
          >
            <span>快捷报送</span>
          </button>

          <div className="relative flex-1 flex items-stretch border-l border-[#e5e5e5]">
            {showWorkbenchMenu && (
              <div className="absolute bottom-[56px] left-0 right-0 z-40 rounded-lg bg-[#4c4c4c] text-white shadow-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    closeFlyoutMenus();
                    // 手动报送 → 首页，默认外部组织视角
                    onEnterWorkbench();
                  }}
                  className="w-full px-3 py-3 text-[13px] text-left flex items-center justify-between border-b border-white/10 active:bg-white/10"
                >
                  <span>手动报送</span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/60 shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeFlyoutMenus();
                    // 报送审核 → 审核列表，默认外部组织
                    onEnterAuditList('external');
                  }}
                  className="w-full px-3 py-3 text-[13px] text-left flex items-center justify-between active:bg-white/10"
                >
                  <span>报送审核</span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/60 shrink-0" />
                </button>
              </div>
            )}

            <button
              id="menu-btn-workbench"
              onClick={() => setShowWorkbenchMenu((prev) => !prev)}
              className="w-full flex items-center justify-center space-x-0.5 text-[#222222] text-[12px] font-normal hover:bg-black/5 active:bg-black/10 transition-colors px-0.5 whitespace-nowrap overflow-hidden"
              title="工作台（手动报送 / 报送审核）"
            >
              <span>工作台</span>
              <ChevronRight className="w-3 h-3 text-[#9e9e9e] -rotate-90 shrink-0" />
            </button>
          </div>

          <button
            id="menu-btn-profile"
            onClick={() => {
              closeFlyoutMenus();
              onEnterProfile();
            }}
            className="flex-1 flex items-center justify-center border-l border-[#e5e5e5] text-[#222222] text-[12px] font-normal hover:bg-black/5 active:bg-black/10 transition-colors px-0.5 whitespace-nowrap overflow-hidden"
            title="进入个人中心"
          >
            <span>个人中心</span>
          </button>
        </div>
      ) : (
        /* WeChat Chat Input Bar Mode */
        <div className="bg-[#f7f7f7] border-t border-[#dcdcdc] p-2 flex items-center space-x-2 z-30 shrink-0">
          {/* Switch back to Menu */}
          <button
            onClick={() => setInputMode('menu')}
            className="p-1.5 text-slate-700 hover:text-black rounded-full hover:bg-black/5 transition-colors"
            title="返回公众号菜单"
          >
            <div className="w-[28px] h-[28px] rounded-full border-[1.5px] border-slate-800 flex items-center justify-center">
              <span className="text-[10px] font-bold">菜单</span>
            </div>
          </button>

          {/* Mic：引导用微信转文字后再发结构化文字 */}
          <button
            onClick={() =>
              onToast('请用微信「按住说话 → 转文字」后，粘贴结构化文字发送', 'info')
            }
            className="p-1 text-slate-700 hover:text-black"
            title="语音请先转文字"
          >
            <Mic className="w-6 h-6 stroke-[1.8]" />
          </button>

          {/* Text Input（支持粘贴多行线索） */}
          <form onSubmit={handleSendMessage} className="flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                quickPhase === 'awaiting_body'
                  ? '粘贴结构化文字线索...'
                  : quickPhase === 'awaiting_org'
                    ? '回复数字选择机构...'
                    : quickPhase === 'awaiting_auto_submit'
                      ? '可继续补充文字或附件...'
                      : '发消息...'
              }
              rows={quickPhase === 'awaiting_body' ? 2 : 1}
              className="w-full bg-white border border-[#e0e0e0] rounded-md px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
            />
          </form>

          {/* Smile / Emoji */}
          <button
            onClick={() => onToast('表情面板', 'info')}
            className="p-1 text-slate-700 hover:text-black"
          >
            <Smile className="w-6 h-6 stroke-[1.8]" />
          </button>

          {/* Send or Plus */}
          {inputText.trim() ? (
            <button
              onClick={handleSendMessage}
              className="px-3 py-1 bg-[#07c160] hover:bg-[#06ad56] text-white text-xs font-medium rounded-md transition-colors"
            >
              发送
            </button>
          ) : (
            <button
              onClick={() => setShowPlusDrawer(!showPlusDrawer)}
              className="p-1 text-slate-700 hover:text-black"
              title="更多功能"
            >
              <PlusCircle className="w-6 h-6 stroke-[1.8]" />
            </button>
          )}
        </div>
      )}

      {/* Drawer for Plus button in chat mode：图/视频/文档仅作附件 */}
      {showPlusDrawer && inputMode === 'chat' && (
        <div className="bg-[#f0f0f0] border-t border-[#dcdcdc] p-4 grid grid-cols-4 gap-4 z-30 animate-in slide-in-from-bottom duration-150">
          <button
            onClick={onEnterReport}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-xs border border-slate-200">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-slate-600">吹哨速报</span>
          </button>
          <button
            onClick={uploadAlbumPhoto}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-xs border border-slate-200">
              <ImageIcon className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-slate-600">照片</span>
          </button>
          <button
            onClick={uploadCameraPhoto}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-xs border border-slate-200">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-slate-600">拍照</span>
          </button>
          <button
            onClick={uploadVideo}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-violet-600 shadow-xs border border-slate-200">
              <Video className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-slate-600">视频</span>
          </button>
          <button
            onClick={uploadFile}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-sky-600 shadow-xs border border-slate-200">
              <File className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-slate-600">文件</span>
          </button>
          <button
            onClick={() => {
              setShowPlusDrawer(false);
              onToast('已获取当前网格位置：台中市西坝区阳光花园', 'success');
            }}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-xs border border-slate-200">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-slate-600">位置</span>
          </button>
        </div>
      )}

      {/* 6. 服务号资料页（白色主题，关注/取关） */}
      {showServiceProfile && (
        <div className="absolute inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-right duration-200">
          {/* iOS Status Bar */}
          <div className="bg-white pt-2 px-6 pb-1 flex justify-between items-center text-[11.5px] font-semibold text-black select-none shrink-0">
            <span className="font-bold tracking-tight text-[13px]">09:31</span>
            <div className="flex items-center space-x-1.5 text-black">
              <div className="flex items-end space-x-[2px] h-[11px] pb-[0.5px]">
                <div className="w-[3px] h-[4px] bg-black rounded-[0.5px]"></div>
                <div className="w-[3px] h-[6px] bg-black rounded-[0.5px]"></div>
                <div className="w-[3px] h-[8.5px] bg-black rounded-[0.5px]"></div>
                <div className="w-[3px] h-[11px] bg-black rounded-[0.5px]"></div>
              </div>
              <svg className="w-[15px] h-[15px] text-black fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 3.5c3.8 0 7.23 1.54 9.72 4.03L12 19.34 2.28 11.53C4.77 9.04 8.2 7.5 12 7.5z" />
              </svg>
              <div className="flex items-center ml-0.5">
                <div className="w-[25px] h-[12.5px] rounded-[4px] border border-black p-[0.8px] flex items-center justify-center relative bg-[#facc15]">
                  <span className="text-[9px] font-black text-black leading-none scale-90 tracking-tighter">80</span>
                </div>
                <div className="w-[1.2px] h-[4.5px] bg-black rounded-r-[1px] -ml-[0.5px]"></div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <div className="bg-white px-3 py-2 flex items-center justify-between border-b border-black/[0.04] shrink-0">
            <button
              type="button"
              onClick={() => setShowServiceProfile(false)}
              className="p-1 -ml-1 text-slate-800 active:opacity-60"
              title="返回会话"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            <div className="text-[17px] font-medium text-slate-900">服务号</div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => onToast('搜索', 'info')}
                className="p-1.5 text-slate-800 active:opacity-60"
                title="搜索"
              >
                <Search className="w-5 h-5 stroke-[1.8]" />
              </button>
              <button
                type="button"
                onClick={() => onToast('更多设置', 'info')}
                className="p-1.5 -mr-1 text-slate-800 active:opacity-60"
                title="更多"
              >
                <MoreHorizontal className="w-5 h-5 stroke-[1.8]" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            {/* Profile header */}
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-start gap-3.5">
                <OfficialAccountAvatar className="w-[64px] h-[64px] rounded-full" />
                <div className="min-w-0 flex-1 pt-0.5">
                  <h2 className="text-[22px] font-bold text-slate-900 leading-tight tracking-tight">点点速豹</h2>
                  <div className="mt-1.5 flex items-center gap-1 text-[13px] text-slate-600">
                    <span className="truncate">西安康奈网络科技有限公司</span>
                    <BadgeCheck className="w-4 h-4 text-[#10aeff] shrink-0 fill-[#10aeff]/15" />
                  </div>
                  <p className="mt-1 text-[12px] text-slate-400">陕西 西安</p>
                </div>
              </div>

              <p className="mt-4 text-[14px] text-slate-700 leading-relaxed">
                察微于阡陌，防患于未然
              </p>
              <button
                type="button"
                onClick={() => onToast('已复制官网地址 subao.cn', 'success')}
                className="mt-1 text-[13px] text-[#576b95] active:opacity-70"
              >
                subao.cn
              </button>
              <p className="mt-2 text-[12px] text-slate-400">2个朋友关注</p>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => void handleToggleFollow()}
                  className={`py-2.5 rounded-lg text-[14px] font-medium transition-colors active:scale-[0.98] ${
                    isFollowing
                      ? 'bg-[#f2f2f2] text-slate-800 hover:bg-[#ebebeb]'
                      : 'bg-[#07c160] text-white hover:bg-[#06ad56]'
                  }`}
                >
                  {isFollowing ? '已关注服务号' : '关注服务号'}
                </button>
                <button
                  type="button"
                  onClick={() => onToast('私信功能演示中', 'info')}
                  className="py-2.5 rounded-lg bg-[#f2f2f2] hover:bg-[#ebebeb] text-slate-800 text-[14px] font-medium transition-colors active:scale-[0.98] flex items-center justify-center gap-1"
                >
                  <MessageSquare className="w-4 h-4" />
                  私信
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-5 flex items-center gap-6 border-b border-slate-100">
              {(
                [
                  { id: 'all' as const, label: '全部' },
                  { id: 'service' as const, label: '服务' },
                ]
              ).map((tab) => {
                const active = serviceProfileTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setServiceProfileTab(tab.id)}
                    className={`relative py-2.5 text-[15px] transition-colors ${
                      active ? 'text-slate-900 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {tab.label}
                    {active && (
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-5 h-[2px] rounded-full bg-slate-900" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="px-5 py-16 flex flex-col items-center text-center">
              {serviceProfileTab === 'all' ? (
                <>
                  <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                    <Bell className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-[14px] text-slate-500">作者还没有发表过内容</p>
                  <p className="text-[12px] text-slate-300 mt-1">期待更新</p>
                </>
              ) : (
                <div className="w-full space-y-2.5 text-left">
                  <button
                    type="button"
                    onClick={() => {
                      setShowServiceProfile(false);
                      onEnterWorkbench();
                    }}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between active:bg-slate-100"
                  >
                    <span className="text-[14px] text-slate-800 font-medium">进入工作台</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowServiceProfile(false);
                      openQuickDemoPicker();
                    }}
                    disabled={!isFollowing}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between active:bg-slate-100 disabled:opacity-40"
                  >
                    <span className="text-[14px] text-slate-800 font-medium">快捷报送</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  {!isFollowing && (
                    <p className="text-[11px] text-amber-600 px-1">取关后需重新关注方可使用服务能力</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 快捷报送 · 演示视角切换 */}
      {showQuickDemoPicker && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/45 animate-in fade-in duration-150">
          <button
            type="button"
            className="flex-1 w-full cursor-default"
            aria-label="关闭演示选择"
            onClick={() => setShowQuickDemoPicker(false)}
          />
          <div className="bg-[#f2f2f2] rounded-t-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="px-4 pt-3 pb-2 text-center">
              <p className="text-[13px] font-bold text-slate-800">快捷报送 · 演示入口</p>
            </div>
            <div className="mx-3 mb-2 rounded-xl bg-white overflow-hidden divide-y divide-slate-100">
              <button
                type="button"
                onClick={() => startQuickReportMode('menu', 'single')}
                className="w-full px-4 py-3.5 text-left active:bg-slate-50 flex items-center gap-3"
              >
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    quickOrgDemoMode === 'single'
                      ? 'border-[#07c160] bg-[#07c160]'
                      : 'border-slate-300'
                  }`}
                >
                  {quickOrgDemoMode === 'single' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
                <span className="text-[15px] font-medium text-slate-900">单机构演示</span>
              </button>
              <button
                type="button"
                onClick={() => startQuickReportMode('menu', 'multi')}
                className="w-full px-4 py-3.5 text-left active:bg-slate-50 flex items-center gap-3"
              >
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    quickOrgDemoMode === 'multi'
                      ? 'border-[#07c160] bg-[#07c160]'
                      : 'border-slate-300'
                  }`}
                >
                  {quickOrgDemoMode === 'multi' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
                <span className="text-[15px] font-medium text-slate-900">多机构演示</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowQuickDemoPicker(false)}
              className="w-full bg-white mt-1 py-3.5 text-[16px] font-medium text-slate-800 active:bg-slate-50"
            >
              取消
            </button>
            <div className="h-[env(safe-area-inset-bottom,8px)] bg-white" />
          </div>
        </div>
      )}

      {/* 7. New Follower WeChat Activation Modal */}
      {showActivationModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-[310px] p-5 shadow-2xl border border-slate-100 flex flex-col items-center text-center">
            {/* Header Icon */}
            <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 border border-blue-100">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>

            <h4 className="text-[16px] font-bold text-slate-900 mb-1 tracking-tight">
              欢迎关注【点点速豹】
            </h4>
            <p className="text-[12px] text-slate-500 mb-4 px-1 leading-relaxed">
              请您完成账号激活与实名认证，验证通过后即可开通平台使用权限。
            </p>

            {/* Unlocked Capabilities Preview */}
            <div className="w-full bg-slate-50 rounded-xl p-3 text-left space-y-2 mb-4 text-[11.5px] border border-slate-100">
              <div className="flex items-center space-x-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>开通「快捷报送」对话转报送通道</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>查询历史速报记录及流转处置进度</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>解锁上报员 / 瞭望员协同工作台</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex w-full space-x-2.5">
              <button
                onClick={() => setShowActivationModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs transition-colors"
              >
                稍后激活
              </button>
              <button
                onClick={() => {
                  setShowActivationModal(false);
                  handleOpenActivation();
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-1"
              >
                <span>前往验证激活</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reset toggle for development convenience */}
            {isActivated && (
              <button
                onClick={() => {
                  setIsActivated(false);
                  setShowActivationModal(false);
                  onToast('已重置为“未激活”状态以供演示', 'info');
                }}
                className="mt-3 text-[11px] text-slate-400 hover:text-slate-600 underline"
              >
                重置为未激活状态（演示）
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
