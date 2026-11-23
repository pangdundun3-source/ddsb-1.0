import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { SpeedReport, UserProfile, UserRole } from '../types';
import {
  GUIDE_AFTER_KEYWORD,
  GUIDE_AFTER_MENU,
  LIGHT_TIP,
  QuickAttachment,
  QuickReportDraft,
  QuickReportPhase,
  buildClueFromUserText,
  buildQuickReportDraft,
  buildSoftExtraValues,
  finalizeDraftWithOrg,
  formatConfirmPrompt,
  formatDraftSavedPrompt,
  formatOrgPrompt,
  formatSuccessPrompt,
  isCancelKeyword,
  isEntryKeyword,
  isFormKeyword,
  looksLikeStructuredClue,
  makeQuickAttachment,
  mergeAttachments,
  toReportAttachments,
} from '../utils/quickReportChat';
import {
  makeFileAttachmentMock,
  makeVideoAttachmentMock,
} from '../utils/multimodalClueMock';
import { getAuditAssignmentStatus, getAuditBlockTip } from '../utils/submitGuard';

const OA_AVATAR_SRC = `${import.meta.env.BASE_URL}oa-avatar.jpg`;

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
  onEnterProfile: (kind?: 'external' | 'v8_org') => void;
  onEnterLogin: () => void;
  onEnterActivationH5?: () => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  /** 当前登录/绑定用户，用于多机构与提交署名 */
  user?: UserProfile;
  /** 快捷上报直接提交 */
  onQuickReportSubmit?: (payload: Partial<SpeedReport>) => string;
  /** 快捷上报保存草稿 */
  onQuickReportSaveDraft?: (payload: Partial<SpeedReport>) => string;
  /** 去完善：打开 H5 预填表单 */
  onQuickReportRefine?: (payload: Partial<SpeedReport>) => void;
}

interface ChatMessage {
  id: string;
  sender: 'account' | 'user';
  text: string;
  time?: string;
  cardAction?: {
    label: string;
    action: () => void;
  };
}

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
  onQuickReportSaveDraft,
  onQuickReportRefine,
}) => {
  // Mode: custom menu vs text chat input
  const [inputMode, setInputMode] = useState<'menu' | 'chat'>('menu');
  const [inputText, setInputText] = useState<string>('');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showPlusDrawer, setShowPlusDrawer] = useState<boolean>(false);
  const [showActivationModal, setShowActivationModal] = useState<boolean>(false);
  const [showAuditMenu, setShowAuditMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const closeFlyoutMenus = () => {
    setShowAuditMenu(false);
    setShowProfileMenu(false);
  };
  const [quickPhase, setQuickPhase] = useState<QuickReportPhase>('idle');
  const [quickDraft, setQuickDraft] = useState<QuickReportDraft | null>(null);

  // New follower activation state (User must activate after following before using platform functions)
  const [isActivated, setIsActivated] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem('wechat_v8_user_activated', JSON.stringify(isActivated));
  }, [isActivated]);

  const orgOptions = React.useMemo(() => {
    const primary = user?.department || '台中市网信办';
    const extras = user?.associatedDepts || [];
    return Array.from(new Set([primary, ...extras]));
  }, [user]);

  // Open H5 Activation flow
  const handleOpenActivation = () => {
    if (onEnterActivationH5) {
      onEnterActivationH5();
    } else {
      setShowActivationModal(true);
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

  const resetQuickFlow = () => {
    setQuickPhase('idle');
    setQuickDraft(null);
  };

  const ensureQuickReportReady = (): boolean => {
    if (!isActivated) {
      pushAccountReply(
        '您的微信尚未绑定速豹账号，暂无法报送。\n请先完成激活绑定后再试。',
        { label: '前往验证激活', action: () => handleOpenActivation() }
      );
      return false;
    }
    return true;
  };

  const startQuickReportMode = (from: 'menu' | 'keyword') => {
    setQuickPhase('awaiting_body');
    setQuickDraft(null);
    setInputMode('chat');
    closeFlyoutMenus();
    setShowPlusDrawer(false);
    pushAccountReply(from === 'menu' ? GUIDE_AFTER_MENU : GUIDE_AFTER_KEYWORD, undefined, 200);
  };

  /** 与页面「新建报送模板」表单字段对齐，供直接提交 / 保存草稿 / 去完善共用 */
  const buildReportPayload = (
    draft: QuickReportDraft,
    status: 'pending_audit' | 'draft'
  ): Partial<SpeedReport> => {
    const tpl = draft.matched!.template;
    const stamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const title = (draft.clue.title || '').trim() || (status === 'draft' ? '未命名草稿' : '未命名线索');
    const summary = (draft.clue.summary || draft.clue.title || '').trim();
    const district = draft.clue.district || '全市';
    const authorDept = draft.selectedOrg || user?.department || '';
    const type = tpl.defaultType;
    return {
      id: `rep_${status === 'draft' ? 'draft_' : ''}${Date.now()}`,
      title,
      address: draft.clue.district || '',
      source: tpl.defaultSource,
      district,
      type,
      summary,
      coreDemand: summary,
      disposalAdvice: status === 'draft' ? '' : '待审核部门研判处置。',
      matchedLink: draft.clue.link || '',
      templateId: tpl.id,
      templateFieldValues: buildSoftExtraValues(draft),
      attachments: toReportAttachments(draft.attachments),
      author: user?.name || '上报员',
      authorDept,
      gridNo: user?.gridCode || '',
      sentimentTrend: '',
      status,
      updateTime: stamp,
      createTime: stamp,
      tags:
        status === 'draft'
          ? ['草稿', '快捷上报', type, authorDept].filter(Boolean)
          : [district, type, authorDept, '快捷上报'].filter(Boolean),
    };
  };

  const goFinalConfirm = (draft: QuickReportDraft) => {
    setQuickDraft(draft);
    setQuickPhase('awaiting_confirm');
    pushAccountReply(formatConfirmPrompt(draft));
  };

  const goConfirmWithOrg = (draft: QuickReportDraft, org: string) => {
    const finalized = finalizeDraftWithOrg(draft, org);
    goFinalConfirm(finalized);
  };

  const handleDraftReady = (draft: QuickReportDraft) => {
    setQuickDraft(draft);
    if (draft.orgOptions.length > 1) {
      setQuickPhase('awaiting_org');
      pushAccountReply(formatOrgPrompt(draft));
      return;
    }
    const org = draft.selectedOrg || draft.orgOptions[0];
    if (!org) {
      pushAccountReply('未找到可用报送机构，请先完成账号激活绑定。');
      resetQuickFlow();
      return;
    }
    goConfirmWithOrg(draft, org);
  };

  const appendAttachmentsToDraft = (
    extras: QuickAttachment[],
    options?: { notice?: string; rePromptConfirm?: boolean }
  ) => {
    setQuickDraft((prev) => {
      if (!prev) return prev;
      const next: QuickReportDraft = {
        ...prev,
        attachments: mergeAttachments(prev.attachments, extras),
      };
      window.setTimeout(() => {
        if (options?.notice) pushAccountReply(options.notice, undefined, 120);
        if (options?.rePromptConfirm) {
          pushAccountReply(formatConfirmPrompt(next), undefined, 380);
        }
      }, 0);
      return next;
    });
  };

  const processBodyAsDraft = (raw: string) => {
    const clueOrError = buildClueFromUserText(raw);
    if ('error' in clueOrError) {
      setQuickPhase('awaiting_body');
      pushAccountReply(clueOrError.error, undefined, 200);
      return;
    }
    const built = buildQuickReportDraft(raw, orgOptions, clueOrError);
    if ('error' in built) {
      setQuickPhase('awaiting_body');
      pushAccountReply(built.error, undefined, 200);
      return;
    }
    handleDraftReady(built);
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

  /** 图片/视频/文档：仅挂到当次报送附件，不做内容识别 */
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

    if (!quickDraft) {
      if (quickPhase === 'idle') setQuickPhase('awaiting_body');
      pushAccountReply(
        '图片、视频仅作为当次报送的附件上传，不参与线索识别。\n请先发送结构化文字生成线索，再点「+」补充附件。',
        undefined,
        200
      );
      return;
    }

    const inConfirm = quickPhase === 'awaiting_confirm';
    appendAttachmentsToDraft([makeQuickAttachment(kind, name)], {
      notice: `已添加附件：${name}`,
      rePromptConfirm: inConfirm,
    });
    if (!inConfirm && quickPhase === 'awaiting_org') {
      pushAccountReply('附件已加入本条报送，可继续选择机构。', undefined, 280);
    }
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

  // Chat conversation messages（日常会话不重复推「欢迎关注 / 激活」；激活卡仅未激活时展示）
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'account',
      text: '您好，点点速豹助手为您服务。\n发送【报送】或点击菜单「快捷报送」，粘贴结构化文字即可生成线索；图片、视频、文件可作为当次附件上传。',
    },
  ]);

  // Handle send chat message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsgText = inputText.trim();
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      time: '刚刚',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // —— 快捷上报状态机 ——
    if (isCancelKeyword(userMsgText)) {
      if (quickPhase !== 'idle') {
        resetQuickFlow();
        pushAccountReply('已取消快捷上报，草稿已清除。');
      } else {
        pushAccountReply('当前没有进行中的快捷上报。');
      }
      return;
    }

    if (isFormKeyword(userMsgText)) {
      resetQuickFlow();
      pushAccountReply('已为您打开手动报送入口：', {
        label: '进入首页',
        action: () => onEnterWorkbench(),
      });
      return;
    }

    if (quickPhase === 'awaiting_org' && quickDraft) {
      const index = Number(userMsgText) - 1;
      if (Number.isInteger(index) && index >= 0 && index < quickDraft.orgOptions.length) {
        goConfirmWithOrg(quickDraft, quickDraft.orgOptions[index]);
        return;
      }
      pushAccountReply(`请回复 1～${quickDraft.orgOptions.length} 选择报送机构，或回复【取消】退出。`);
      return;
    }

    if (quickPhase === 'awaiting_confirm' && quickDraft?.matched) {
      if (userMsgText === '1') {
        if (!quickDraft.canDirectSubmit) {
          pushAccountReply('当前缺少必填项，无法直接提交。请回复【2】保存草稿，或【3】去完善。');
          return;
        }
        const auditOrg = quickDraft.selectedOrg || user?.department || '';
        const blockTip = getAuditBlockTip(
          getAuditAssignmentStatus(auditOrg, quickDraft.matched.template.id)
        );
        if (blockTip) {
          pushAccountReply(`${blockTip}\n也可回复【2】保存为草稿，或【3】去完善。`);
          return;
        }
        const payload = buildReportPayload(quickDraft, 'pending_audit');
        const reportId = onQuickReportSubmit?.(payload) || payload.id || '';
        pushAccountReply(
          formatSuccessPrompt({
            title: payload.title || '',
            org: payload.authorDept || '',
            templateName: quickDraft.matched.template.name,
            reportId,
          }),
          {
            label: '查看我的报送',
            action: () => onEnterReportList(),
          }
        );
        resetQuickFlow();
        return;
      }
      if (userMsgText === '2') {
        const payload = buildReportPayload(quickDraft, 'draft');
        if (!payload.title?.trim() && !payload.summary?.trim()) {
          pushAccountReply('请至少有标题或内容后再保存草稿。');
          return;
        }
        const reportId = onQuickReportSaveDraft?.(payload) || payload.id || '';
        pushAccountReply(
          formatDraftSavedPrompt({
            title: payload.title || '',
            org: payload.authorDept || '',
            templateName: quickDraft.matched.template.name,
            reportId,
          }),
          {
            label: '查看草稿箱',
            action: () => onEnterReportList(),
          }
        );
        resetQuickFlow();
        return;
      }
      if (userMsgText === '3') {
        const payload = buildReportPayload(quickDraft, 'draft');
        onQuickReportRefine?.(payload);
        pushAccountReply('已为您打开完善页面，可按新建报送模板继续编辑后提交或存草稿。');
        resetQuickFlow();
        return;
      }
      if (userMsgText === '0') {
        resetQuickFlow();
        pushAccountReply('已取消快捷上报，草稿已清除。');
        return;
      }
      pushAccountReply(
        quickDraft.canDirectSubmit
          ? '请回复【1】直接提交、【2】保存为草稿、【3】去完善，或【0】取消。'
          : '当前缺少必填项，请回复【2】保存为草稿、【3】去完善，或【0】取消。'
      );
      return;
    }

    if (quickPhase === 'awaiting_body' || looksLikeStructuredClue(userMsgText)) {
      if (!ensureQuickReportReady()) return;
      processBodyAsDraft(userMsgText);
      return;
    }

    if (isEntryKeyword(userMsgText)) {
      if (!isActivated) {
        pushAccountReply(
          '您的微信尚未绑定速豹账号，暂无法报送。\n请先完成激活绑定后再试。',
          { label: '前往验证激活', action: () => handleOpenActivation() }
        );
        return;
      }
      startQuickReportMode('keyword');
      return;
    }

    // 原有轻量导航 + 低频引导
    setTimeout(() => {
      let replyText = LIGHT_TIP;
      let cardAction: ChatMessage['cardAction'] | undefined;

      if (userMsgText.includes('工作台') || userMsgText.includes('首页') || userMsgText.includes('瞭望')) {
        replyText = '您可以直接进入工作台首页：';
        cardAction = { label: '进入 工作台首页', action: () => onEnterWorkbench() };
      } else if (userMsgText.includes('审核') || userMsgText.includes('审查') || userMsgText.includes('批复')) {
        replyText = '请选择审核身份：可点击菜单「报送审核」。';
        cardAction = {
          label: '进入 外部组织审核',
          action: () => onEnterAuditList('external'),
        };
      } else if (
        userMsgText.includes('个人') ||
        userMsgText.includes('中心') ||
        userMsgText.includes('我的') ||
        userMsgText.includes('资料')
      ) {
        replyText = '已为您匹配个人中心入口：';
        cardAction = { label: '进入 个人中心', action: () => onEnterProfile() };
      } else if (userMsgText.includes('激活') || userMsgText.includes('开通') || userMsgText.includes('认证')) {
        replyText = '请完成账号激活与实名认证，验证通过后即可开通平台使用权限。';
        cardAction = { label: '前往验证激活', action: () => handleOpenActivation() };
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

        {/* Right: Contact / Official Account Profile Icon */}
        <button
          onClick={() => setShowProfileModal(true)}
          className="p-1 -mr-1 text-slate-800 hover:text-black active:opacity-60 transition-opacity"
          title="公众号信息"
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
                    onClick={msg.cardAction.action}
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

        {/* 激活通知：仅「刚关注且未激活」时出现一次；已激活日常会话不再推送 */}
        {!isActivated && (
          <div className="flex items-start gap-2.5 justify-start">
            <OfficialAccountAvatar />

            <div className="relative max-w-[82%]">
              <div className="absolute top-3 -left-[6px] w-0 h-0 border-t-[5px] border-t-transparent border-r-[6px] border-r-white border-b-[5px] border-b-transparent z-10" />
              <div
                id="activation-login-notification-card"
                className="bg-white rounded-xl p-3.5 border border-black/[0.06] shadow-xs text-xs text-slate-700 cursor-pointer hover:shadow-md transition-all active:scale-[0.99] group"
                onClick={() => handleOpenActivation()}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    <h3 className="text-[14.5px] font-bold text-slate-900 tracking-tight">
                      账号激活与实名认证通知
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 text-amber-700 bg-amber-50 border-amber-300">
                    待激活认证
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2 font-normal">关注后推送</p>
                <p className="text-[12.5px] text-slate-700 leading-relaxed mb-3 whitespace-pre-line">
                  欢迎关注【点点速豹】
                  {'\n'}
                  请您完成账号激活与实名认证，验证通过后即可开通平台使用权限。
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-800 font-medium text-[12px]">
                  <span className="font-semibold flex items-center text-blue-600 group-hover:text-blue-700">
                    前往验证激活
                  </span>
                  <div className="flex items-center text-slate-400 text-xs group-hover:text-blue-600 transition-colors">
                    <span className="mr-0.5">前往验证激活</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. WeChat Bottom Bar - Custom Menu or Chat Input Mode */}
      {inputMode === 'menu' ? (
        /* 菜单：快捷报送｜手动报送｜报送审核｜个人中心 */
        <div className="relative bg-[#f7f7f7] border-t border-[#dcdcdc] h-[52px] flex items-stretch z-30 shrink-0 select-none">
          {showAuditMenu && (
            <div className="absolute bottom-[56px] left-[36%] right-[18%] z-40 rounded-lg bg-[#4c4c4c] text-white shadow-lg overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  closeFlyoutMenus();
                  onEnterAuditList('external');
                }}
                className="w-full px-3 py-3 text-[13px] border-b border-white/10 active:bg-white/10"
              >
                外部组织审核
              </button>
              <button
                type="button"
                onClick={() => {
                  closeFlyoutMenus();
                  onEnterAuditList('v8_org');
                }}
                className="w-full px-3 py-3 text-[13px] active:bg-white/10"
              >
                V8机构审核
              </button>
            </div>
          )}

          {showProfileMenu && (
            <div className="absolute bottom-[56px] right-1 left-[48%] z-40 rounded-lg bg-[#4c4c4c] text-white shadow-lg overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  closeFlyoutMenus();
                  onEnterProfile('v8_org');
                }}
                className="w-full px-3 py-3 text-[13px] border-b border-white/10 active:bg-white/10"
              >
                V8机构用户
              </button>
              <button
                type="button"
                onClick={() => {
                  closeFlyoutMenus();
                  onEnterProfile('external');
                }}
                className="w-full px-3 py-3 text-[13px] active:bg-white/10"
              >
                外部组织用户
              </button>
            </div>
          )}

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
            onClick={() => {
              if (!isActivated) {
                setInputMode('chat');
                pushAccountReply(
                  '您的微信尚未绑定速豹账号，暂无法报送。\n请先完成激活绑定后再试。',
                  { label: '前往验证激活', action: () => handleOpenActivation() },
                  100
                );
                return;
              }
              startQuickReportMode('menu');
            }}
            className="flex-1 flex items-center justify-center border-l border-[#e5e5e5] text-[#222222] text-[12px] font-normal hover:bg-black/5 active:bg-black/10 transition-colors px-0.5 whitespace-nowrap overflow-hidden"
            title="快捷报送（对话转报送）"
          >
            <span>快捷报送</span>
          </button>

          <button
            id="menu-btn-manual-report"
            onClick={() => {
              closeFlyoutMenus();
              onEnterWorkbench();
            }}
            className="flex-1 flex items-center justify-center border-l border-[#e5e5e5] text-[#222222] text-[12px] font-normal hover:bg-black/5 active:bg-black/10 transition-colors px-0.5 whitespace-nowrap overflow-hidden"
            title="手动报送（进入首页）"
          >
            <span>手动报送</span>
          </button>

          <button
            id="menu-btn-audit"
            onClick={() => {
              setShowProfileMenu(false);
              setShowAuditMenu((prev) => !prev);
            }}
            className="flex-1 flex items-center justify-center space-x-0.5 border-l border-[#e5e5e5] text-[#222222] text-[12px] font-normal hover:bg-black/5 active:bg-black/10 transition-colors px-0.5 whitespace-nowrap overflow-hidden"
            title="报送审核"
          >
            <span>报送审核</span>
            <ChevronRight className="w-3 h-3 text-[#9e9e9e] -rotate-90 shrink-0" />
          </button>

          <button
            id="menu-btn-profile"
            onClick={() => {
              setShowAuditMenu(false);
              setShowProfileMenu((prev) => !prev);
            }}
            className="flex-1 flex items-center justify-center space-x-0.5 border-l border-[#e5e5e5] text-[#222222] text-[12px] font-normal hover:bg-black/5 active:bg-black/10 transition-colors px-0.5 whitespace-nowrap overflow-hidden"
            title="选择用户身份进入个人中心"
          >
            <span>个人中心</span>
            <ChevronRight className="w-3 h-3 text-[#9e9e9e] -rotate-90 shrink-0" />
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
                  : quickPhase === 'awaiting_org' || quickPhase === 'awaiting_confirm'
                    ? '回复数字...'
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

      {/* 6. Official Account Profile Card Modal */}
      {showProfileModal && (
        <div className="absolute inset-0 bg-black/50 z-50 flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-white rounded-t-2xl p-5 space-y-4 max-h-[85%] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <OfficialAccountAvatar className="w-14 h-14 rounded-xl" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">点点速豹</h3>
                  <p className="text-xs text-slate-500 font-mono">微信号：diandian_subao_h5</p>
                  <div className="flex items-center space-x-1 text-[11px] text-emerald-600 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>微信官方认证 · 台中市网信办</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex">
                <span className="text-slate-400 w-16 shrink-0">功能介绍</span>
                <span className="text-slate-800 leading-relaxed">
                  台中市网信办“吹哨报到·点点速豹”移动端官方工作台。为全市上报员、基层瞭望员、审核员提供突发事件速报、网络谣言核实、民生诉求直报与流转审批服务。
                </span>
              </div>
              <div className="flex">
                <span className="text-slate-400 w-16 shrink-0">主体信息</span>
                <span className="text-slate-800">台中市委网络安全和信息化委员会办公室</span>
              </div>
              <div className="flex">
                <span className="text-slate-400 w-16 shrink-0">服务端口</span>
                <span className="text-slate-800">移动端微信公众号H5 v8.2 审核协同专版</span>
              </div>
            </div>

            <div className="pt-3 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  onEnterWorkbench('上报员');
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center space-x-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>进入工作台</span>
              </button>
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  onEnterReport();
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>页面上报</span>
              </button>
            </div>
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
