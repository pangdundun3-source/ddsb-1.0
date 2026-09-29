import React from 'react';
import { LogOut, ChevronRight, User } from 'lucide-react';

interface MtPortalWorkspaceProps {
  onEnterDiandian: () => void;
  onLogout: () => void;
}

/**
 * 康奈网络 KN 折纸色带矢量 Logo
 */
const KnRibbonLogo = () => (
  <svg
    width="38"
    height="28"
    viewBox="0 0 56 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-xs"
  >
    <rect x="2" y="5" width="8.5" height="30" rx="4.25" fill="#0076FF" />
    <path
      d="M10.5 21L21.5 5.5C22.2 4.5 23.6 4.2 24.6 4.9L27 6.6C27.9 7.3 28.1 8.6 27.4 9.6L16.5 24L10.5 21Z"
      fill="#0069E6"
    />
    <path
      d="M13.5 18.5L25.2 33.8C26 34.8 27.4 35.1 28.4 34.3L30.5 32.7C31.4 32 31.6 30.6 30.8 29.6L19 14.5L13.5 18.5Z"
      fill="#0080FF"
    />
    <path
      d="M33 5.5C33 4.4 33.9 3.5 35 3.5H38C39.1 3.5 40 4.4 40 5.5V18.5L47.2 5C47.8 3.9 49.1 3.3 50.3 3.7C51.5 4.1 52.3 5.2 52.3 6.5V34.5C52.3 35.6 51.4 36.5 50.3 36.5H47.3C46.2 36.5 45.3 35.6 45.3 34.5V21.5L38.1 35C37.5 36.1 36.2 36.7 35 36.3C33.8 35.9 33 34.8 33 33.5V5.5Z"
      fill="#0076FF"
    />
  </svg>
);

/**
 * 3D 放大镜和文件图标 (应用中心标题旁)
 */
const AppCenterIcon = () => (
  <div className="w-12 h-12 relative flex-shrink-0 flex items-center justify-center">
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 drop-shadow-md"
    >
      {/* Back document folder */}
      <rect
        x="10"
        y="14"
        width="28"
        height="36"
        rx="4"
        transform="rotate(-10 10 14)"
        fill="#93C5FD"
        opacity="0.85"
      />
      <rect
        x="18"
        y="16"
        width="28"
        height="36"
        rx="4"
        transform="rotate(6 18 16)"
        fill="#BFDBFE"
        opacity="0.9"
      />
      {/* 3D Magnifying glass ring */}
      <ellipse
        cx="34"
        cy="30"
        rx="16"
        ry="16"
        stroke="#2563EB"
        strokeWidth="6"
        fill="white"
        fillOpacity="0.4"
      />
      {/* Glass reflection */}
      <path
        d="M26 22 C29 18 36 18 41 22"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Magnifier 3D Handle */}
      <path
        d="M45 41 L56 52 C57.5 53.5 57.5 56 56 57.5 C54.5 59 52 59 50.5 57.5 L39.5 46.5"
        stroke="#1D4ED8"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

/**
 * 左侧边缘悬浮AI脑图小标 (1:1 匹配左边缘小胶囊)
 */
const LeftEdgeAiPill = () => (
  <div
    className="fixed left-0 top-[62%] -translate-y-1/2 z-30 bg-white/95 backdrop-blur-md rounded-r-full py-2 pl-1.5 pr-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-l-0 border-white/90 flex items-center cursor-pointer hover:pr-3 transition-all duration-300"
    title="智能助手"
  >
    <div className="w-5 h-5 rounded-full flex items-center justify-center">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="portalBrainGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F43F5E" />
            <stop offset="0.5" stopColor="#A855F7" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <path
          d="M9.5 5C8.5 4.2 7 4.2 6 5.2C4.8 6.4 4.5 8.2 5.2 9.7C4.2 10.5 3.8 12 4.3 13.3C4.8 14.5 6 15.2 7.2 15C7.2 16.5 8.5 17.8 10 17.8C10.5 17.8 10.8 17.2 10.8 17.2M14.5 5C15.5 4.2 17 4.2 18 5.2C19.2 6.4 19.5 8.2 18.8 9.7C19.8 10.5 20.2 12 19.7 13.3C19.2 14.5 18 15.2 16.8 15C16.8 16.5 15.5 17.8 14 17.8C13.5 17.8 13.2 17.2 13.2 17.2"
          stroke="url(#portalBrainGrad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 4V18"
          stroke="url(#portalBrainGrad)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="12" cy="2" r="1.2" fill="#EAB308" />
      </svg>
    </div>
  </div>
);

/**
 * 铃铛图标（我的消息）
 */
const BlueBellIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="#0076FF"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path d="M12 2C10.3431 2 9 3.34315 9 5V5.29C6.72 6.17 5 8.38 5 11V16L3 18V19H21V18L19 16V11C19 8.38 17.28 6.17 15 5.29V5C15 3.34315 13.6569 2 12 2ZM10 20C10 21.1 10.9 22 12 22C13.1 22 14 21.1 14 20H10Z" />
  </svg>
);

/**
 * 卡片 1 图标: MT-融媒体管理端 (红底 RMT 弧线徽标)
 */
const RmtIcon = () => (
  <div className="w-12 h-12 rounded-[14px] bg-[#f24130] flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-xs">
    {/* Concentric subtle soundwave orbit arcs */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-10 h-10 rounded-full border border-white/20" />
      <div className="w-7 h-7 rounded-full border border-white/25" />
    </div>
    <span className="text-white font-black text-[13px] tracking-wider relative z-10 font-sans">
      RMT
    </span>
  </div>
);

/**
 * 卡片 2 图标: 牧网守正后台管理系统 (橙色原子轨道/盾牌徽标)
 */
const MuwangIcon = () => (
  <div className="w-12 h-12 rounded-[14px] bg-[#ff7a22] flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-xs">
    <svg
      viewBox="0 0 48 48"
      className="w-8 h-8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Central Star / Spark */}
      <polygon
        points="24,14 26.5,21.5 34,24 26.5,26.5 24,34 21.5,26.5 14,24 21.5,21.5"
        fill="#FFFFFF"
      />
      {/* Elliptical Atomic Orbit 1 */}
      <ellipse
        cx="24"
        cy="24"
        rx="17"
        ry="6.5"
        transform="rotate(-28 24 24)"
        stroke="#FFFFFF"
        strokeWidth="1.8"
      />
      {/* Elliptical Atomic Orbit 2 */}
      <ellipse
        cx="24"
        cy="24"
        rx="17"
        ry="6.5"
        transform="rotate(32 24 24)"
        stroke="#FFFFFF"
        strokeWidth="1.8"
      />
      {/* Electron dots */}
      <circle cx="10" cy="18" r="1.8" fill="#FFFFFF" />
      <circle cx="38" cy="30" r="1.8" fill="#FFFFFF" />
    </svg>
  </div>
);

/**
 * 卡片 3 图标: MT互联网台账中台 (蓝色地球/网格徽标)
 */
const TaizhangIcon = () => (
  <div className="w-12 h-12 rounded-[14px] bg-[#1677ff] flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-xs">
    <svg
      viewBox="0 0 48 48"
      className="w-8 h-8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Globe outline */}
      <circle cx="20" cy="24" r="13" stroke="#FFFFFF" strokeWidth="2" />
      {/* Globe Lat/Long grid lines */}
      <ellipse cx="20" cy="24" rx="6" ry="13" stroke="#FFFFFF" strokeWidth="1.6" />
      <line x1="7" y1="24" x2="33" y2="24" stroke="#FFFFFF" strokeWidth="1.6" />
      {/* Ledger / Table overlay in bottom right */}
      <rect
        x="24"
        y="22"
        width="15"
        height="15"
        rx="2.5"
        fill="#1677ff"
        stroke="#FFFFFF"
        strokeWidth="1.8"
      />
      <line x1="28" y1="26" x2="35" y2="26" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="28" y1="30" x2="35" y2="30" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="28" y1="34" x2="32" y2="34" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  </div>
);

/**
 * 卡片 4 图标: 点点速报 (清朗净网鉴谣速报系统)
 */
const DiandianIcon = () => (
  <div className="w-12 h-12 rounded-[14px] bg-[#0066eb] flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-xs">
    <svg
      viewBox="0 0 120 120"
      className="w-8 h-8 drop-shadow-xs"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon
        points="60,8 104,33 104,87 60,112 16,87 16,33"
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="60" r="28" fill="#ffffff" />
      <path
        d="M38 76 C38 63 44 52 54 46 C53 43 54 38 58 37 C61 37 63 40 64 43 C68 43 74 46 80 51 C85 55 90 58 89 63 C88 66 84 67 79 68 C76 68 74 70 72 74 C69 77 67 82 60 83 C55 84 43 84 38 76 Z"
        fill="#0066eb"
      />
      <circle cx="75" cy="55" r="2.5" fill="#ffffff" />
    </svg>
  </div>
);

interface AppCardData {
  id: string;
  name: string;
  sub: string;
  tag: string;
  manager: string;
  icon: React.ReactNode;
  onEnter?: () => void;
}

export const MtPortalWorkspace: React.FC<MtPortalWorkspaceProps> = ({
  onEnterDiandian,
  onLogout,
}) => {
  const appList: AppCardData[] = [
    {
      id: 'rmt',
      name: 'MT-融媒体管理端',
      tag: 'pc端',
      sub: 'MT-融媒体管理端',
      manager: '史乐乐',
      icon: <RmtIcon />,
      onEnter: () => {
        // 进入业务界面
        onEnterDiandian();
      },
    },
    {
      id: 'muwang',
      name: '牧网守正后台管理系统',
      tag: 'pc端',
      sub: '牧网守正后台管理系统',
      manager: '邓东升',
      icon: <MuwangIcon />,
      onEnter: () => {
        onEnterDiandian();
      },
    },
    {
      id: 'taizhang',
      name: 'MT互联网台账中台',
      tag: 'pc端',
      sub: '-',
      manager: '陈耿',
      icon: <TaizhangIcon />,
      onEnter: () => {
        onEnterDiandian();
      },
    },
    {
      id: 'diandian',
      name: '点点速报',
      tag: 'pc端',
      sub: '清朗净网鉴谣速报系统',
      manager: '王飞飞',
      icon: <DiandianIcon />,
      onEnter: onEnterDiandian,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f4f7fc] flex flex-col font-sans select-none text-[#333333] relative overflow-x-hidden">
      {/* 左侧贴边 AI 悬浮小标 */}
      <LeftEdgeAiPill />

      {/* 顶部背景微淡蓝色透亮氛围光 */}
      <div className="absolute top-0 left-0 right-0 h-[180px] bg-gradient-to-b from-[#e3effd] via-[#edf4fd] to-transparent pointer-events-none" />

      {/* 1. 顶部全局导航栏 (1:1 对齐截图) */}
      <header className="h-[60px] w-full px-6 sm:px-8 flex items-center justify-between relative z-20 bg-transparent">
        {/* 左侧：康奈网络 MT + MT康奈工作台 */}
        <div className="flex items-center">
          {/* 康奈网络 Logo 组合 */}
          <div className="flex items-center gap-2">
            <KnRibbonLogo />
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span className="text-[17px] font-bold text-[#0076FF] tracking-tight leading-none">
                  康奈网络
                </span>
                <span className="px-1 py-[1.5px] rounded-[3px] bg-[#0076FF] text-white text-[10px] font-bold leading-none">
                  MT
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#0076FF] tracking-tight leading-none mt-0.5">
                Kanne.cn
              </span>
            </div>
          </div>

          {/* 细灰竖线分割 */}
          <div className="h-[18px] w-px bg-[#d0d7e2] mx-5" />

          {/* 系统台名称: MT康奈工作台 */}
          <span className="text-[15px] font-semibold text-[#262626] tracking-wide">
            MT康奈工作台
          </span>
        </div>

        {/* 右侧：用户名 + 头像 + 退出登录 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[14px] text-[#333333] font-normal">王飞飞</span>
            {/* 头像：圆形浅蓝底 + 浅蓝白简易用户头像 */}
            <div className="w-8 h-8 rounded-full bg-[#dbeafe] flex items-center justify-center text-[#60a5fa] border border-[#bfdbfe]">
              <User className="w-4 h-4 fill-current" />
            </div>
          </div>

          {/* 退出按钮: 退出方框带箭头图标 + "退出" */}
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1 text-[14px] text-[#333333] hover:text-[#0076FF] transition-colors ml-2 cursor-pointer"
            title="退出登录"
          >
            <LogOut className="w-[15px] h-[15px]" />
            <span>退出</span>
          </button>
        </div>
      </header>

      {/* 2. 主体工作区 (1:1 左右分栏布局) */}
      <div className="w-full flex-1 px-6 sm:px-8 pt-4 pb-12 flex items-start gap-6 max-w-[1920px] mx-auto relative z-10">
        {/* 左侧主视区: 应用中心卡片网格 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 应用中心 标题头 (带 3D 放大镜图标) */}
          <div className="flex items-center gap-3 mb-6">
            <AppCenterIcon />
            <div className="flex flex-col">
              <h2 className="text-[18px] font-bold text-[#1f2329] tracking-normal leading-tight">
                应用中心
              </h2>
              <p className="text-[12px] text-[#8c8c8c] mt-1 tracking-normal">
                聚合应用，高效管控
              </p>
            </div>
          </div>

          {/* 应用卡片网格 (1:1 对齐截图中纯白卡片样式与间距) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {appList.map((app) => (
              <div
                key={app.id}
                onClick={app.onEnter}
                className="bg-white rounded-[10px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#f0f2f5] hover:shadow-[0_6px_20px_rgba(0,118,255,0.08)] hover:border-[#bae0ff] transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer group"
              >
                {/* 卡片上半部分: 图标 + 标题 + 标签 + 描述 */}
                <div>
                  <div className="flex items-start gap-3.5">
                    {/* 应用图标 */}
                    {app.icon}

                    <div className="flex-1 min-w-0 pt-0.5">
                      {/* 第一行: 应用名 + pc端浅蓝小药丸 */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[14px] font-bold text-[#262626] group-hover:text-[#0076FF] transition-colors truncate">
                          {app.name}
                        </span>
                        <span className="px-1.5 py-[1px] rounded-full bg-[#e6f4ff] text-[#1677ff] text-[11px] font-normal leading-none border border-[#91caff]/40">
                          {app.tag}
                        </span>
                      </div>

                      {/* 第二行: 次级文案 */}
                      <div className="text-[12px] text-[#8c8c8c] mt-2.5 truncate">
                        {app.sub}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 卡片下半部分: 分割线 + 负责人 + 进入应用 */}
                <div className="mt-5 pt-3.5 border-t border-[#f0f2f5] flex items-center justify-between text-[12px]">
                  {/* 负责人 */}
                  <div className="flex items-center gap-1.5 text-[#595959]">
                    <User className="w-3.5 h-3.5 text-[#8c8c8c]" />
                    <span>{app.manager}</span>
                  </div>

                  {/* 进入应用 */}
                  <div className="flex items-center gap-0.5 text-[#1677ff] font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>进入应用</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧面板: 我的消息 (1:1 独立纯白竖长卡片) */}
        <div className="w-[360px] lg:w-[400px] flex-shrink-0 bg-white rounded-[10px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#f0f2f5] p-5 min-h-[580px] flex flex-col justify-between self-stretch">
          <div>
            {/* 消息卡片顶部栏 */}
            <div className="flex items-center justify-between pb-4 border-b border-[#f5f5f5]">
              <div className="flex items-center gap-2">
                <BlueBellIcon />
                <span className="text-[14px] font-bold text-[#262626]">
                  我的消息
                </span>
              </div>
              <button
                type="button"
                className="text-[12px] text-[#1677ff] hover:text-[#0958d9] transition-colors cursor-pointer"
              >
                查看全部
              </button>
            </div>

            {/* 消息列表区 (轻量空状态/近期通知占位，整体保持截图中干练留白) */}
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#f5f7fa] flex items-center justify-center text-gray-300 mb-3">
                <BlueBellIcon />
              </div>
              <span className="text-[13px] text-gray-400">暂无未读消息</span>
              <span className="text-[11px] text-gray-300 mt-1">
                业务提醒与审批通知将在此处实时送达
              </span>
            </div>
          </div>

          {/* 底部微信息 */}
          <div className="pt-3 border-t border-[#f5f5f5] text-[11px] text-[#bfbfbf] text-center">
            康奈网络MT统一消息服务中枢
          </div>
        </div>
      </div>
    </div>
  );
};
