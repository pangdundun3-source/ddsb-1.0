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
} from 'lucide-react';
import { UserRole } from '../types';

interface OfficialAccountEntryViewProps {
  onEnterReport: () => void;
  onEnterReportList: () => void;
  onEnterWorkbench: (role?: UserRole) => void;
  onEnterAuditList: () => void;
  onEnterProfile: () => void;
  onEnterLogin: () => void;
  onEnterActivationH5?: () => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
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
}) => {
  // Mode: custom menu vs text chat input
  const [inputMode, setInputMode] = useState<'menu' | 'chat'>('menu');
  const [inputText, setInputText] = useState<string>('');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showPlusDrawer, setShowPlusDrawer] = useState<boolean>(false);
  const [showActivationModal, setShowActivationModal] = useState<boolean>(false);

  // New follower activation state (User must activate after following before using platform functions)
  const [isActivated, setIsActivated] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('wechat_v8_user_activated', JSON.stringify(isActivated));
  }, [isActivated]);

  // Open H5 Activation flow
  const handleOpenActivation = () => {
    if (onEnterActivationH5) {
      onEnterActivationH5();
    } else {
      setShowActivationModal(true);
    }
  };

  // Chat conversation messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'account',
      text: '欢迎关注“点点速豹”微信公众号！',
    },
  ]);

  // Handle send chat message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsgText = inputText.trim();
    const newMsgId = `user_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: newMsgId,
      sender: 'user',
      text: userMsgText,
      time: '刚刚',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Automated smart reply
    setTimeout(() => {
      let replyText = '您好！我是“点点速豹”智能助手。您可以点击底部菜单直接进入【工作台】、【快速上报】、【快速审核】或【个人中心】。';
      let cardAction: { label: string; action: () => void } | undefined = undefined;

      if (userMsgText.includes('工作台') || userMsgText.includes('首页') || userMsgText.includes('瞭望')) {
        replyText = '您可以直接进入工作台首页：';
        cardAction = {
          label: '进入 工作台首页',
          action: () => onEnterWorkbench(),
        };
      } else if (userMsgText.includes('上报') || userMsgText.includes('快报') || userMsgText.includes('事件') || userMsgText.includes('列表')) {
        replyText = '已为您匹配【快速上报】入口，点击下方卡片即可进入上报列表：';
        cardAction = {
          label: '进入 快速上报 (上报列表)',
          action: () => onEnterReportList(),
        };
      } else if (userMsgText.includes('审核') || userMsgText.includes('审查') || userMsgText.includes('批复')) {
        replyText = '已为您匹配【快速审核】入口，点击下方卡片即可进入审核列表：';
        cardAction = {
          label: '进入 快速审核 (审核列表)',
          action: () => onEnterAuditList(),
        };
      } else if (userMsgText.includes('个人') || userMsgText.includes('中心') || userMsgText.includes('我的') || userMsgText.includes('资料') || userMsgText.includes('账号')) {
        replyText = '已为您匹配【个人中心】入口，点击下方卡片即可进入我的列表主页：';
        cardAction = {
          label: '进入 个人中心 (我的)',
          action: () => onEnterProfile(),
        };
      } else if (userMsgText.includes('激活') || userMsgText.includes('开通') || userMsgText.includes('认证')) {
        replyText = '系统检测到您有一条待处理的【账号激活与实名认证】通知。请点击下方卡片进入激活流程，验证您的业务激活码后系统将自动匹配对应工作岗位与权限：';
        cardAction = {
          label: '前往 账号激活认证',
          action: () => handleOpenActivation(),
        };
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
            {msg.sender === 'account' && (
              <div className="w-10 h-10 rounded-[8px] overflow-hidden shrink-0 shadow-xs bg-[#2458a6] relative flex items-center justify-center p-1">
                {/* 4 Blue grid squares pattern */}
                <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-[1.5px] p-0.5">
                  <div className="bg-[#1f4e96] rounded-[2px]"></div>
                  <div className="bg-[#2a63b8] rounded-[2px]"></div>
                  <div className="bg-[#2a63b8] rounded-[2px]"></div>
                  <div className="bg-[#1f4e96] rounded-[2px]"></div>
                </div>

                {/* Overlaid Whistle (哨子) with radiating soundwaves */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white filter drop-shadow-xs"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* Whistle loop and body */}
                    <circle cx="7" cy="14" r="3.5" fill="rgba(255,255,255,0.2)" />
                    <path d="M10.5 14h7l2-5H9a5 5 0 0 0-2 0" />
                    <path d="M14 9v5" />
                    {/* Radiating sound arcs */}
                    <path d="M18 6a4 4 0 0 1 3 3" strokeWidth="2" />
                    <path d="M19.5 3.5a7 7 0 0 1 4 4" strokeWidth="1.6" />
                  </svg>
                </div>
              </div>
            )}

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

              <div>{msg.text}</div>

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

        {/* 激活通知 - 由公众号发出的微信服务通知/卡片消息 */}
        <div className="flex items-start gap-2.5 justify-start">
          {/* Account Avatar */}
          <div className="w-10 h-10 rounded-[8px] overflow-hidden shrink-0 shadow-xs bg-[#2458a6] relative flex items-center justify-center p-1">
            {/* 4 Blue grid squares pattern */}
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-[1.5px] p-0.5">
              <div className="bg-[#1f4e96] rounded-[2px]"></div>
              <div className="bg-[#2a63b8] rounded-[2px]"></div>
              <div className="bg-[#2a63b8] rounded-[2px]"></div>
              <div className="bg-[#1f4e96] rounded-[2px]"></div>
            </div>

            {/* Overlaid Whistle (哨子) with radiating soundwaves */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white filter drop-shadow-xs"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="7" cy="14" r="3.5" fill="rgba(255,255,255,0.2)" />
                <path d="M10.5 14h7l2-5H9a5 5 0 0 0-2 0" />
                <path d="M14 9v5" />
                <path d="M18 6a4 4 0 0 1 3 3" strokeWidth="2" />
                <path d="M19.5 3.5a7 7 0 0 1 4 4" strokeWidth="1.6" />
              </svg>
            </div>
          </div>

          {/* Message Card Bubble with Pointer */}
          <div className="relative max-w-[82%]">
            {/* Triangular Pointer Tail */}
            <div className="absolute top-3 -left-[6px] w-0 h-0 border-t-[5px] border-t-transparent border-r-[6px] border-r-white border-b-[5px] border-b-transparent z-10" />

            <div
              id="activation-login-notification-card"
              className="bg-white rounded-xl p-3.5 border border-black/[0.06] shadow-xs text-xs text-slate-700 cursor-pointer hover:shadow-md transition-all active:scale-[0.99] group"
              onClick={() => {
                handleOpenActivation();
              }}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                  <h3 className="text-[14.5px] font-bold text-slate-900 tracking-tight">
                    账号激活与实名认证通知
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${
                    isActivated
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-amber-700 bg-amber-50 border-amber-300'
                  }`}
                >
                  {isActivated ? '认证已生效' : '待激活认证'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2 font-normal">
                9月9日 09:23
              </p>

              <p className="text-[12.5px] text-slate-700 leading-relaxed mb-3">
                {isActivated
                  ? '您的身份与岗位认证已生效，已为您开通对应的工作权限，可直接进入工作台协同办公。'
                  : '您有一条待激活的认证通知。具体的所属机构与岗位身份将在完成激活验证后生效，验证通过后即可开通并使用平台相关功能。'}
              </p>

              {/* Card Action Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-800 font-medium text-[12px]">
                <span className="font-semibold flex items-center text-blue-600 group-hover:text-blue-700">
                  {isActivated ? '查看账号认证档案及详情' : '前往验证激活'}
                </span>
                <div className="flex items-center text-slate-400 text-xs group-hover:text-blue-600 transition-colors">
                  <span className="mr-0.5">{isActivated ? '查看档案' : '去激活'}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. WeChat Bottom Bar - Custom Menu or Chat Input Mode */}
      {inputMode === 'menu' ? (
        /* 1:1 Authentic WeChat Custom Menu Bar */
        <div className="bg-[#f7f7f7] border-t border-[#dcdcdc] h-[52px] flex items-stretch z-30 shrink-0 select-none">
          {/* Keyboard / Switcher Button */}
          <button
            onClick={() => {
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

          {/* Menu Button 1: 工作台 🔗 */}
          <button
            id="menu-btn-workbench"
            onClick={() => onEnterWorkbench()}
            className="flex-1 flex items-center justify-center space-x-0.5 border-l border-[#e5e5e5] text-[#222222] text-[13.5px] font-normal hover:bg-black/5 active:bg-black/10 transition-colors px-0.5 whitespace-nowrap overflow-hidden"
            title="进入工作台首页"
          >
            <span>工作台</span>
            <svg className="w-3 h-3 text-[#9e9e9e] inline-block -mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>

          {/* Menu Button 2: 快速上报 🔗 */}
          <button
            id="menu-btn-fast-report"
            onClick={() => onEnterReportList()}
            className="flex-1 flex items-center justify-center space-x-0.5 border-l border-[#e5e5e5] text-[#222222] text-[13.5px] font-normal hover:bg-black/5 active:bg-black/10 transition-colors px-0.5 whitespace-nowrap overflow-hidden"
            title="进入上报列表"
          >
            <span>快速上报</span>
            <svg className="w-3 h-3 text-[#9e9e9e] inline-block -mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>

          {/* Menu Button 3: 快速审核 🔗 */}
          <button
            id="menu-btn-fast-audit"
            onClick={() => onEnterAuditList()}
            className="flex-1 flex items-center justify-center space-x-0.5 border-l border-[#e5e5e5] text-[#222222] text-[13.5px] font-normal hover:bg-black/5 active:bg-black/10 transition-colors px-0.5 whitespace-nowrap overflow-hidden"
            title="进入审核列表"
          >
            <span>快速审核</span>
            <svg className="w-3 h-3 text-[#9e9e9e] inline-block -mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>

          {/* Menu Button 4: 个人中心 🔗 */}
          <button
            id="menu-btn-profile"
            onClick={() => onEnterProfile()}
            className="flex-1 flex items-center justify-center space-x-0.5 border-l border-[#e5e5e5] text-[#222222] text-[13.5px] font-normal hover:bg-black/5 active:bg-black/10 transition-colors px-0.5 whitespace-nowrap overflow-hidden"
            title="进入个人中心（我的列表页）"
          >
            <span>个人中心</span>
            <svg className="w-3 h-3 text-[#9e9e9e] inline-block -mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
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

          {/* Mic Button */}
          <button
            onClick={() => onToast('长按说话功能已就绪', 'info')}
            className="p-1 text-slate-700 hover:text-black"
            title="语音"
          >
            <Mic className="w-6 h-6 stroke-[1.8]" />
          </button>

          {/* Text Input */}
          <form onSubmit={handleSendMessage} className="flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="发消息..."
              className="w-full bg-white border border-[#e0e0e0] rounded-md px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
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

      {/* Drawer for Plus button in chat mode */}
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
            onClick={() => onToast('已模拟唤起手机相册上传凭证', 'info')}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-xs border border-slate-200">
              <ImageIcon className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-slate-600">照片</span>
          </button>
          <button
            onClick={() => onToast('已模拟打开相机现场拍照', 'info')}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-xs border border-slate-200">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-slate-600">拍照拍摄</span>
          </button>
          <button
            onClick={() => onToast('已获取当前网格位置：台中市西坝区阳光花园', 'success')}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-xs border border-slate-200">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-slate-600">位置上报</span>
          </button>
        </div>
      )}

      {/* 6. Official Account Profile Card Modal */}
      {showProfileModal && (
        <div className="absolute inset-0 bg-black/50 z-50 flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-white rounded-t-2xl p-5 space-y-4 max-h-[85%] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden shadow-xs bg-[#2458a6] relative flex items-center justify-center p-1 shrink-0">
                  <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-[1.5px] p-0.5">
                    <div className="bg-[#1f4e96] rounded-[2px]"></div>
                    <div className="bg-[#2a63b8] rounded-[2px]"></div>
                    <div className="bg-[#2a63b8] rounded-[2px]"></div>
                    <div className="bg-[#1f4e96] rounded-[2px]"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="7" cy="14" r="3.5" />
                      <path d="M10.5 14h7l2-5H9a5 5 0 0 0-2 0" />
                      <path d="M14 9v5" />
                      <path d="M18 6a4 4 0 0 1 3 3" strokeWidth="2" />
                      <path d="M19.5 3.5a7 7 0 0 1 4 4" strokeWidth="1.6" />
                    </svg>
                  </div>
                </div>
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
                  台中市网信办“吹哨报到·点点速豹”移动端官方工作台。为全市综合网格员、基层瞭望员、审核员提供突发事件速报、网络谣言核实、民生诉求直报与流转审批服务。
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
                  onEnterWorkbench('综合网格员');
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
                <span>快速上报</span>
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
              新关注用户账号激活
            </h4>
            <p className="text-[12px] text-slate-500 mb-4 px-1 leading-relaxed">
              欢迎关注“点点速报”官方公众号！新关注微信用户须先完成身份激活，激活后方可正常使用平台所有功能。
            </p>

            {/* Unlocked Capabilities Preview */}
            <div className="w-full bg-slate-50 rounded-xl p-3 text-left space-y-2 mb-4 text-[11.5px] border border-slate-100">
              <div className="flex items-center space-x-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>开通突发事件“快速上报”直连通道</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>查询历史速报记录及流转处置进度</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>解锁综合网格员 / 瞭望员协同工作台</span>
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
                <span>进入激活认证 H5</span>
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
