import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Bell,
  Headphones,
  Settings,
  Globe,
  Search,
  ChevronDown,
  ExternalLink,
  Shield,
  Layers,
  FileText,
  AlertTriangle,
  Lock,
  X,
  Check,
  Sparkles,
  ArrowRight,
  LogOut,
  User,
  Building,
  Building2,
  Eye,
  Radio,
  Clock,
  Inbox,
  ArrowLeftRight,
  ShieldCheck,
  Phone,
  CheckCircle2
} from 'lucide-react';
import { PageId, ReportItem } from '../types';
import sunsetBg from '../assets/images/sunset_grassland.jpg';

interface PortalHomeProps {
  currentUser: string;
  reports: ReportItem[];
  onNavigate: (page: PageId, extraModule?: string) => void;
  onSelectReport: (report: ReportItem) => void;
  onLogout: () => void;
}

export const PortalHome: React.FC<PortalHomeProps> = ({
  currentUser,
  reports,
  onNavigate,
  onSelectReport,
  onLogout
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showSwitchOrgModal, setShowSwitchOrgModal] = useState(false);
  const [currentOrg, setCurrentOrg] = useState('台中市网信办');
  const [activeAppModal, setActiveAppModal] = useState<string | null>(null);

  // Search filter
  const filteredReports = searchQuery.trim()
    ? reports.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.org.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    }
  };

  const handleAppClick = (appName: string) => {
    if (appName === '指令流转' || appName === '点点速豹') {
      onNavigate('home');
    } else if (appName === '线索排查') {
      onNavigate('negative-info');
    } else {
      setActiveAppModal(appName);
    }
  };

  // Generate repeated watermark items
  const watermarks = Array.from({ length: 48 });

  return (
    <div className="relative min-h-screen w-full select-none overflow-x-hidden font-sans text-white bg-slate-900 flex flex-col justify-between">
      {/* 1. Full-bleed Sunset Grassland Landscape Wallpaper */}
      <div className="absolute inset-0 z-0">
        <img
          src={sunsetBg}
          alt="Sunset Grassland"
          className="w-full h-full object-cover object-center scale-[1.01]"
        />
        {/* Soft atmospheric sunset gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-transparent via-black/10 to-black/40 pointer-events-none" />
      </div>

      {/* 2. Security Floating Watermark Grid (1:1 with photo: "w . 9573 2026-09-04 16:03") */}
      <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden select-none">
        <div className="w-[140%] h-[140%] -top-[20%] -left-[20%] absolute grid grid-cols-4 sm:grid-cols-6 gap-x-12 gap-y-24 -rotate-[22deg]">
          {watermarks.map((_, i) => (
            <div
              key={i}
              className="text-[13px] font-mono tracking-widest text-white/10 whitespace-nowrap"
            >
              w . 9573 2026-09-04 16:03
            </div>
          ))}
        </div>
      </div>

      {/* 3. Top Navigation Bar (Header) */}
      <header className="relative z-20 w-full px-6 sm:px-10 lg:px-14 pt-4 pb-3 flex items-center justify-between">
        {/* Left Brand Area */}
        <div className="flex items-center space-x-4">
          {/* Logo box with network nodes */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg border border-white/80 bg-white/10 backdrop-blur-xs p-1 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-full h-full text-white" fill="none">
                <rect x="2" y="2" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2" />
                <circle cx="16" cy="8" r="2.5" fill="currentColor" />
                <circle cx="8" cy="20" r="2.5" fill="currentColor" />
                <circle cx="24" cy="20" r="2.5" fill="currentColor" />
                <line x1="16" y1="8" x2="8" y2="20" stroke="currentColor" strokeWidth="1.8" />
                <line x1="16" y1="8" x2="24" y2="20" stroke="currentColor" strokeWidth="1.8" />
                <line x1="8" y1="20" x2="24" y2="20" stroke="currentColor" strokeWidth="1.8" />
                <text x="16" y="17" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">正</text>
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5 leading-none">
                <span className="text-[14px] font-extrabold tracking-wide text-white">正管用</span>
                <span className="px-1 py-[1px] rounded bg-white/20 backdrop-blur-xs text-white text-[9px] font-bold leading-none border border-white/40">
                  V8
                </span>
              </div>
              <span className="text-[10px] font-normal leading-tight text-white/80 tracking-tight mt-0.5">
                wxb.cn
              </span>
            </div>
          </div>

          {/* Title and Org tag */}
          <div className="flex items-center space-x-3">
            <h1 className="text-[20px] sm:text-[22px] font-extrabold text-white tracking-wider drop-shadow-md">
              网络生态综合治理平台
            </h1>
            <div className="h-4 w-[1.5px] bg-white/40" />
            <div className="flex items-center space-x-2.5">
              <span className="text-[14px] font-normal text-white/90 tracking-wide drop-shadow-xs">
                {currentOrg}
              </span>
              <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded border border-white/20 text-[11px]">
                <span className="px-1.5 py-0.2 bg-[#1E5ABB] text-white font-bold rounded-xs text-[10px]">正式版</span>
                <span className="text-white/90 font-mono text-[10px]">2026-09-29</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Tools Area */}
        <div className="flex items-center space-x-3">
          {/* 1. Calendar Icon Button */}
          <button
            onClick={() => setShowCalendarModal(true)}
            className="w-8 h-8 rounded-full border border-white/50 bg-white/10 hover:bg-white/25 backdrop-blur-md flex items-center justify-center text-white transition-all cursor-pointer shadow-xs"
            title="查看系统工作日程"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>

          {/* 2. Notification Bell Icon Button */}
          <button
            onClick={() => setShowNotifModal(true)}
            className="relative w-8 h-8 rounded-full border border-white/50 bg-white/10 hover:bg-white/25 backdrop-blur-md flex items-center justify-center text-white transition-all cursor-pointer shadow-xs"
            title="通知中心"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white/60 animate-pulse" />
          </button>

          {/* 3. Customer Service Headphone Icon Button */}
          <button
            onClick={() => setShowContactModal(true)}
            className="w-8 h-8 rounded-full border border-white/50 bg-white/10 hover:bg-white/25 backdrop-blur-md flex items-center justify-center text-white transition-all cursor-pointer shadow-xs"
            title="技术支持 / 客服专线"
          >
            <Headphones className="w-4 h-4" />
          </button>

          {/* 4. User Profile & Avatar Menu (1:1 with screenshot: sunset circular avatar + .w. + ▼) */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-1.5 px-1.5 py-1 rounded-md hover:bg-white/10 transition-all cursor-pointer select-none"
            >
              {/* Circular Avatar matching sunset photo in screenshot */}
              <div className="w-7 h-7 rounded-full overflow-hidden border border-white/90 shadow-xs shrink-0">
                <img
                  src={sunsetBg}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[14px] font-bold text-white tracking-wider drop-shadow-xs">
                . w .
              </span>
              <ChevronDown className={`w-3 h-3 text-white/90 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu (1:1 with screenshot) */}
            {showUserMenu && (
              <>
                {/* Backdrop to close on outside click */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />

                <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-md shadow-2xl border border-gray-100 py-1 z-50 text-slate-700 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* 1. 个人中心 */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowUserProfileModal(true);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 hover:text-blue-600 flex items-center space-x-3 text-[13px] font-normal transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-500 stroke-[1.8]" />
                    <span>个人中心</span>
                  </button>

                  {/* 2. 切换机构 */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowSwitchOrgModal(true);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 hover:text-blue-600 flex items-center space-x-3 text-[13px] font-normal transition-colors cursor-pointer"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-slate-500 stroke-[1.8]" />
                    <span>切换机构</span>
                  </button>

                  {/* 3. 退出登录 */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 hover:text-rose-600 flex items-center space-x-3 text-[13px] font-normal transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-slate-500 stroke-[1.8]" />
                    <span>退出登录</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 4. Center Main Section (Slogan + Search + 9 Application Cards) */}
      <main className="relative z-10 flex-1 max-w-[1440px] w-full mx-auto px-6 sm:px-12 lg:px-16 flex flex-col justify-center py-6 sm:py-10">
        {/* Center Slogan with Green Hand-Drawn Doodle */}
        <div className="text-center mb-7 sm:mb-8">
          <div className="inline-flex items-center justify-center flex-wrap text-[30px] sm:text-[36px] lg:text-[40px] font-black tracking-wider text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            <span>监测处置全方位，网络生态</span>
            {/* "共守卫" with bright yellow text */}
            <span className="inline-block ml-1 text-[#FFD400]">
              <span>共守卫</span>
            </span>
          </div>
        </div>

        {/* Center Rounded Capsule Search Bar */}
        <div className="max-w-[760px] w-full mx-auto mb-12 sm:mb-14">
          <form
            onSubmit={handleSearchSubmit}
            className="relative bg-white rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.35)] p-2 pl-5 flex items-center transition-all hover:shadow-[0_16px_42px_rgba(0,0,0,0.45)]"
          >
            {/* Globe icon on the left */}
            <Globe className="w-5 h-5 text-[#8C6D55] mr-3 shrink-0 stroke-[2.2]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="请输入关键字进行检索"
              className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 text-sm sm:text-base focus:outline-none"
            />
            {/* Search Button (Warm earthy brown rounded button matching image) */}
            <button
              type="submit"
              className="px-7 py-2.5 bg-[#6D533E] hover:bg-[#5C4533] text-white text-sm font-semibold rounded-full shadow-md transition-all cursor-pointer active:scale-95 ml-2"
            >
              搜索
            </button>
          </form>

          {/* Quick search hints */}
          {searchQuery && (
            <div className="mt-2 text-center text-xs text-white/70">
              按回车或点击「搜索」检索涉网风险舆情及线索
            </div>
          )}
        </div>

        {/* 9 Applications Matrix Grid */}
        <div className="max-w-[1080px] w-full mx-auto">
          {/* Row 1: 6 Applications */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-6 gap-y-8 sm:gap-x-8 mb-8 sm:mb-10 place-items-center">
            {/* 1. 指令流转 (正式版 - Blue) */}
            <div
              onClick={() => handleAppClick('指令流转')}
              className="group flex flex-col items-center cursor-pointer transition-all active:scale-95"
            >
              <div className="relative w-20 h-20 sm:w-[92px] sm:h-[92px] bg-white rounded-[24px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] flex items-center justify-center p-3 group-hover:-translate-y-1.5 transition-transform duration-300">
                {/* Badge: 正式版 */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#1B7EF2] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm leading-none">
                  正式版
                </div>
                {/* Teal/Cyan Node Emblem */}
                <svg viewBox="0 0 36 36" className="w-12 h-12 text-[#1AA6A6]" fill="none">
                  <rect x="4" y="4" width="28" height="28" rx="7" stroke="#1AA6A6" strokeWidth="2.5" />
                  <circle cx="18" cy="10" r="2.5" fill="#1AA6A6" />
                  <circle cx="10" cy="24" r="2.5" fill="#1AA6A6" />
                  <circle cx="26" cy="24" r="2.5" fill="#1AA6A6" />
                  <line x1="18" y1="10" x2="10" y2="24" stroke="#1AA6A6" strokeWidth="2" />
                  <line x1="18" y1="10" x2="26" y2="24" stroke="#1AA6A6" strokeWidth="2" />
                  <line x1="10" y1="24" x2="26" y2="24" stroke="#1AA6A6" strokeWidth="2" />
                  <text x="18" y="20" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1AA6A6">正</text>
                </svg>
              </div>
              <span className="mt-2.5 text-sm sm:text-[15px] font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] group-hover:text-amber-200 transition-colors">
                指令流转
              </span>
            </div>

            {/* 2. 河图融媒体 (正式版 - Blue) */}
            <div
              onClick={() => handleAppClick('河图融媒体')}
              className="group flex flex-col items-center cursor-pointer transition-all active:scale-95"
            >
              <div className="relative w-20 h-20 sm:w-[92px] sm:h-[92px] bg-white rounded-[24px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] flex items-center justify-center p-3 group-hover:-translate-y-1.5 transition-transform duration-300">
                {/* Badge: 正式版 */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#1B7EF2] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm leading-none">
                  正式版
                </div>
                {/* Red RMT Circular Emblem */}
                <svg viewBox="0 0 40 40" className="w-12 h-12 text-[#E53E3E]" fill="none">
                  <circle cx="20" cy="20" r="16" stroke="#E53E3E" strokeWidth="2.5" />
                  <text x="20" y="22" textAnchor="middle" fontSize="9" fontWeight="900" fill="#E53E3E" letterSpacing="0.5">RMT</text>
                  <path d="M12,25 C16,28 24,28 28,25" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="mt-2.5 text-sm sm:text-[15px] font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] group-hover:text-amber-200 transition-colors">
                河图融媒体
              </span>
            </div>

            {/* 3. 线索排查 (正式版 - Blue) */}
            <div
              onClick={() => handleAppClick('线索排查')}
              className="group flex flex-col items-center cursor-pointer transition-all active:scale-95"
            >
              <div className="relative w-20 h-20 sm:w-[92px] sm:h-[92px] bg-white rounded-[24px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] flex items-center justify-center p-3 group-hover:-translate-y-1.5 transition-transform duration-300">
                {/* Badge: 正式版 */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#1B7EF2] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm leading-none">
                  正式版
                </div>
                {/* Red Circular Seal with Raised Fist Symbol */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-xs">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2v-5h2v5z" opacity="0.15" />
                    <path d="M14.5 9c-.83 0-1.5.67-1.5 1.5V11h-1V9.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5V11H8V9c0-.83-.67-1.5-1.5-1.5S5 8.17 5 9v5c0 2.21 1.79 4 4 4h4.5c1.93 0 3.5-1.57 3.5-3.5V10.5c0-.83-.67-1.5-1.5-1.5z" />
                  </svg>
                </div>
              </div>
              <span className="mt-2.5 text-sm sm:text-[15px] font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] group-hover:text-amber-200 transition-colors">
                线索排查
              </span>
            </div>

            {/* 4. 全网搜 (试用版 - Beige) */}
            <div
              onClick={() => handleAppClick('全网搜')}
              className="group flex flex-col items-center cursor-pointer transition-all active:scale-95"
            >
              <div className="relative w-20 h-20 sm:w-[92px] sm:h-[92px] bg-white rounded-[24px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] flex items-center justify-center p-3 group-hover:-translate-y-1.5 transition-transform duration-300">
                {/* Badge: 试用版 */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#C59265] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm leading-none">
                  试用版
                </div>
                {/* Purple Globe with Search Glass */}
                <div className="relative w-12 h-12 flex items-center justify-center text-[#7C3AED]">
                  <Globe className="w-10 h-10 stroke-[2] text-[#7C3AED]" />
                  <Search className="w-5 h-5 stroke-[2.5] text-[#9333EA] absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" />
                </div>
              </div>
              <span className="mt-2.5 text-sm sm:text-[15px] font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] group-hover:text-amber-200 transition-colors">
                全网搜
              </span>
            </div>

            {/* 5. 谛听预警 (已停用 - Red) */}
            <div
              onClick={() => handleAppClick('谛听预警')}
              className="group flex flex-col items-center cursor-pointer transition-all active:scale-95 opacity-90 hover:opacity-100"
            >
              <div className="relative w-20 h-20 sm:w-[92px] sm:h-[92px] bg-white rounded-[24px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] flex items-center justify-center p-3 group-hover:-translate-y-1.5 transition-transform duration-300">
                {/* Badge: 已停用 */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#EB4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm leading-none">
                  已停用
                </div>
                {/* Golden Di Ting creature / listening ear silhouette */}
                <div className="w-12 h-12 flex items-center justify-center text-[#B8860B]">
                  <svg viewBox="0 0 40 40" className="w-11 h-11 fill-[#B8860B]">
                    <path d="M20,6 C13.37,6 8,11.37 8,18 C8,21.5 9.5,24.5 12,26.5 L12,32 L16,30 C17.2,30.3 18.5,30.5 20,30.5 C26.63,30.5 32,25.13 32,18.5 C32,11.87 26.63,6 20,6 Z" opacity="0.15" />
                    <path d="M18,12 C14.7,12 12,14.7 12,18 C12,20.2 13.2,22.1 15,23.1 L15,26 L17.5,24.8 C18.3,25 19.1,25.1 20,25.1 C23.3,25.1 26,22.4 26,19 C26,15.7 23.3,12 18,12 Z" />
                    {/* Sound Waves */}
                    <path d="M28,14 C29.5,15.5 29.5,18.5 28,20" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <path d="M31,12 C33.5,14.5 33.5,20 31,22.5" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" fill="none" />
                  </svg>
                </div>
              </div>
              <span className="mt-2.5 text-sm sm:text-[15px] font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] group-hover:text-amber-200 transition-colors">
                谛听预警
              </span>
            </div>

            {/* 6. 点点密信 (未开通 - Gray) */}
            <div
              onClick={() => handleAppClick('点点密信')}
              className="group flex flex-col items-center cursor-pointer transition-all active:scale-95"
            >
              <div className="relative w-20 h-20 sm:w-[92px] sm:h-[92px] bg-white rounded-[24px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] flex items-center justify-center p-3 group-hover:-translate-y-1.5 transition-transform duration-300">
                {/* Badge: 未开通 */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#8FA1B4] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm leading-none">
                  未开通
                </div>
                {/* Blue "点" Character with micro dots */}
                <div className="flex flex-col items-center justify-center text-[#2563EB]">
                  <span className="text-[26px] font-black leading-none">点</span>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-1 h-1 rounded-full bg-[#2563EB]" />
                    <div className="w-1 h-1 rounded-full bg-[#2563EB]" />
                    <div className="w-1 h-1 rounded-full bg-[#2563EB]" />
                  </div>
                </div>
              </div>
              <span className="mt-2.5 text-sm sm:text-[15px] font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] group-hover:text-amber-200 transition-colors">
                点点密信
              </span>
            </div>
          </div>

          {/* Row 2: 3 Applications (Left-aligned under first 3 items, exactly matching screenshot) */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-6 gap-y-8 sm:gap-x-8 place-items-center">
            {/* 7. 全球眼 (未开通 - Gray) */}
            <div
              onClick={() => handleAppClick('全球眼')}
              className="group flex flex-col items-center cursor-pointer transition-all active:scale-95"
            >
              <div className="relative w-20 h-20 sm:w-[92px] sm:h-[92px] bg-white rounded-[24px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] flex items-center justify-center p-3 group-hover:-translate-y-1.5 transition-transform duration-300">
                {/* Badge: 未开通 */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#8FA1B4] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm leading-none">
                  未开通
                </div>
                {/* Teal swirling eye rings */}
                <div className="w-12 h-12 flex items-center justify-center text-[#0D9488]">
                  <svg viewBox="0 0 36 36" className="w-11 h-11" fill="none">
                    <circle cx="18" cy="18" r="14" stroke="#0D9488" strokeWidth="2" strokeDasharray="4 2" />
                    <circle cx="18" cy="18" r="9" stroke="#14B8A6" strokeWidth="2.5" />
                    <circle cx="18" cy="18" r="4" fill="#0D9488" />
                  </svg>
                </div>
              </div>
              <span className="mt-2.5 text-sm sm:text-[15px] font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] group-hover:text-amber-200 transition-colors">
                全球眼
              </span>
            </div>

            {/* 8. 属地系统 (未开通 - Gray) */}
            <div
              onClick={() => handleAppClick('属地系统')}
              className="group flex flex-col items-center cursor-pointer transition-all active:scale-95"
            >
              <div className="relative w-20 h-20 sm:w-[92px] sm:h-[92px] bg-white rounded-[24px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] flex items-center justify-center p-3 group-hover:-translate-y-1.5 transition-transform duration-300">
                {/* Badge: 未开通 */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#8FA1B4] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm leading-none">
                  未开通
                </div>
                {/* Orange hexagonal 3D shield cube */}
                <div className="w-12 h-12 flex items-center justify-center text-[#EA580C]">
                  <svg viewBox="0 0 36 36" className="w-11 h-11" fill="none">
                    <polygon points="18,4 30,11 30,25 18,32 6,25 6,11" stroke="#EA580C" strokeWidth="2.2" />
                    <line x1="18" y1="18" x2="18" y2="32" stroke="#EA580C" strokeWidth="1.8" />
                    <line x1="18" y1="18" x2="30" y2="11" stroke="#EA580C" strokeWidth="1.8" />
                    <line x1="18" y1="18" x2="6" y2="11" stroke="#EA580C" strokeWidth="1.8" />
                    <circle cx="18" cy="18" r="3" fill="#F97316" />
                  </svg>
                </div>
              </div>
              <span className="mt-2.5 text-sm sm:text-[15px] font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] group-hover:text-amber-200 transition-colors">
                属地系统
              </span>
            </div>

            {/* 9. 数解舆情 (未开通 - Gray) */}
            <div
              onClick={() => handleAppClick('数解舆情')}
              className="group flex flex-col items-center cursor-pointer transition-all active:scale-95"
            >
              <div className="relative w-20 h-20 sm:w-[92px] sm:h-[92px] bg-white rounded-[24px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] flex items-center justify-center p-3 group-hover:-translate-y-1.5 transition-transform duration-300">
                {/* Badge: 未开通 */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#8FA1B4] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm leading-none">
                  未开通
                </div>
                {/* Golden "S" Analytics Ribbon */}
                <div className="w-12 h-12 flex items-center justify-center text-[#CA8A04]">
                  <svg viewBox="0 0 36 36" className="w-11 h-11" fill="none">
                    <path
                      d="M26,10 C26,7 23,6 18,6 C13,6 10,8 10,12 C10,18 26,18 26,24 C26,28 23,30 18,30 C12,30 10,28 10,25"
                      stroke="#CA8A04"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <circle cx="26" cy="10" r="2.5" fill="#EAB308" />
                    <circle cx="10" cy="25" r="2.5" fill="#EAB308" />
                  </svg>
                </div>
              </div>
              <span className="mt-2.5 text-sm sm:text-[15px] font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] group-hover:text-amber-200 transition-colors">
                数解舆情
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* 5. Bottom Right Floating Settings Button (1:1 with photo) */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-30">
        <button
          onClick={() => setShowSettingsModal(true)}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/60 border border-white/40 backdrop-blur-md flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          title="系统与工作台设置"
        >
          <Settings className="w-5 h-5 text-white/90" />
        </button>
      </div>

      {/* MODAL 1: 全网全局检索结果浮层 */}
      {showSearchResults && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 text-slate-800">
            <div className="px-6 py-4 bg-gradient-to-r from-[#6D533E] to-[#8C6D55] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <h3 className="font-bold text-base">全网生态综合治理检索结果</h3>
              </div>
              <button
                onClick={() => setShowSearchResults(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
              <div className="text-xs text-slate-500 mb-2">
                包含关键字 “<span className="text-[#6D533E] font-bold">{searchQuery}</span>” 的相关舆情与指令 ({filteredReports.length} 条记录)
              </div>

              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => {
                      setShowSearchResults(false);
                      onSelectReport(report);
                      onNavigate('report-detail');
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-[#6D533E] hover:bg-amber-50/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                          {report.auditStatus}
                        </span>
                        <span className="font-bold text-sm text-slate-900 group-hover:text-[#6D533E]">
                          {report.title}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{report.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{report.summary}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>来源：{report.source}</span>
                      <span className="text-[#6D533E] font-medium flex items-center space-x-0.5">
                        <span>点击查看处置详情</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <Globe className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p>未在本地检索到匹配记录，可进入「指令流转」工作台进行全量深度检索</p>
                  <button
                    onClick={() => {
                      setShowSearchResults(false);
                      onNavigate('report-records');
                    }}
                    className="mt-3 px-4 py-1.5 bg-[#6D533E] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    进入全量档案检索
                  </button>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowSearchResults(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: 系统工作日程与日历 */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 text-slate-800">
            <div className="px-6 py-4 bg-[#1E5ABB] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5" />
                <h3 className="font-bold text-sm">网信值班日历与处置排期</h3>
              </div>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-blue-900">今日值班排班：2026年9月4日 星期五</div>
                  <div className="text-[11px] text-blue-700 mt-0.5">当班负责人：张三 (超级管理员) · 7x24应急保障</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">在岗</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex justify-between">
                  <span className="text-slate-600">09:00 - 10:30 全网早报研判巡查</span>
                  <span className="text-emerald-600 font-medium">已完成</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex justify-between">
                  <span className="text-slate-600">14:00 - 16:00 负面舆情督办指令抽查</span>
                  <span className="text-blue-600 font-medium">进行中</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex justify-between">
                  <span className="text-slate-600">18:00 - 19:30 重点线索综合日总结汇总</span>
                  <span className="text-slate-400">待开始</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowCalendarModal(false)}
                className="px-4 py-1.5 bg-[#1E5ABB] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: 通知中心 */}
      {showNotifModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 text-slate-800">
            <div className="px-6 py-4 bg-[#1E5ABB] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <h3 className="font-bold text-sm">系统通知与预警消息</h3>
              </div>
              <button
                onClick={() => setShowNotifModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-2.5 max-h-[60vh] overflow-y-auto">
              <div
                onClick={() => {
                  setShowNotifModal(false);
                  onNavigate('report-audit');
                }}
                className="p-3 bg-rose-50 border border-rose-100 rounded-xl cursor-pointer hover:bg-rose-100/70 transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-bold text-rose-800 mb-1">
                  <span>待审核指令提醒 (3条待处理)</span>
                  <span className="text-[10px] text-rose-500">刚刚</span>
                </div>
                <p className="text-[11px] text-rose-700">市应急管理局与市水利局提交了2篇涉汛应急速报，请及时完成二审与终审核定。</p>
              </div>

              <div
                onClick={() => {
                  setShowNotifModal(false);
                  onNavigate('negative-info');
                }}
                className="p-3 bg-amber-50 border border-amber-100 rounded-xl cursor-pointer hover:bg-amber-100/70 transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-bold text-amber-800 mb-1">
                  <span>线索转办督办进展更新</span>
                  <span className="text-[10px] text-amber-600">14:20</span>
                </div>
                <p className="text-[11px] text-amber-700">有关“某区自来水异味”舆情已由责任部门办结，请查阅处置反馈。</p>
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400">共 2 条未读预警</span>
              <button
                onClick={() => setShowNotifModal(false)}
                className="px-4 py-1.5 bg-[#1E5ABB] text-white font-bold rounded-lg cursor-pointer"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: 客服与支持专线 */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 text-slate-800">
            <div className="px-6 py-4 bg-gradient-to-r from-[#1A3860] to-[#24508A] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Headphones className="w-5 h-5 text-cyan-300" />
                <h3 className="font-bold text-sm">正管用技术支持中心</h3>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3.5 text-xs text-slate-700">
              <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-100 flex items-start space-x-3">
                <div className="p-2 bg-[#1A3860] text-white rounded-lg shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#1A3860]">全国统一客服专线</div>
                  <div className="text-base font-extrabold text-[#204E88] mt-0.5 font-mono">4000-999-363</div>
                  <p className="text-[11px] text-slate-500 mt-1">服务时间：周一至周日 8:30 - 18:00 (7x24小时应急保障)</p>
                </div>
              </div>
              <div className="space-y-1 text-slate-600">
                <div>运营单位：西安康奈网络科技有限公司</div>
                <div>门户网站：wxb.cn / knwl.cn</div>
                <div>技术备案：陕ICP备14007110号-14</div>
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowContactModal(false)}
                className="px-4 py-1.5 bg-[#1A3860] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: 业务应用状态/详情卡片 */}
      {activeAppModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 text-slate-800">
            <div className="px-6 py-4 bg-gradient-to-r from-[#1B3E6E] to-[#2B548B] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">{activeAppModal} · 业务模块说明</h3>
              </div>
              <button
                onClick={() => setActiveAppModal(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {activeAppModal === '河图融媒体' && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                    <strong>河图融媒体 (正式版)</strong>：面向全网多渠道融媒体矩阵，汇聚发布监测、正向宣传与舆论引导发布，与点点速豹舆情闭环全互通。
                  </div>
                  <button
                    onClick={() => {
                      setActiveAppModal(null);
                      onNavigate('statistics');
                    }}
                    className="w-full py-2.5 bg-[#1B7EF2] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    进入融媒体数据宏观总览
                  </button>
                </div>
              )}

              {activeAppModal === '全网搜' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-900 leading-relaxed">
                    <strong>全网搜 (试用版)</strong>：跨主流社交媒体、资讯门户与音视频平台的毫秒级全文检索与热度趋势溯源能力。
                  </div>
                  <button
                    onClick={() => {
                      setActiveAppModal(null);
                      setShowSearchResults(true);
                      setSearchQuery('热点');
                    }}
                    className="w-full py-2.5 bg-[#C59265] hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    启动跨平台热点试搜
                  </button>
                </div>
              )}

              {activeAppModal === '谛听预警' && (
                <div className="space-y-3">
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-900 leading-relaxed">
                    <strong>谛听预警 (已停用)</strong>：由于系统正在进行数据源通道升级与合规升级，该预警节点暂处停用状态，预计下周完成维护。
                  </div>
                  <div className="text-xs text-slate-500">如需紧急开通通道，请联系系统管理员或致电客服 4000-999-363。</div>
                </div>
              )}

              {['点点密信', '全球眼', '属地系统', '数解舆情'].includes(activeAppModal) && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
                    <strong>{activeAppModal} (未开通)</strong>：当前单位（台中市网信办）尚未开通该扩展组件的授权许可。
                  </div>
                  <div className="text-xs text-slate-500">可联系产品运营代表或通过管理员申请开通试用。</div>
                </div>
              )}
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setActiveAppModal(null)}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: 工作台与个性化设置 */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 text-slate-800">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-white" />
                <h3 className="font-bold text-sm">工作台个性化设置</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <div className="font-bold text-slate-800">安全防泄露水印</div>
                  <div className="text-slate-400 text-[11px]">按网信合规标准全天候浮现身份与时间印记</div>
                </div>
                <input type="checkbox" defaultChecked disabled className="rounded text-blue-600" />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <div className="font-bold text-slate-800">快捷进入速报工作台</div>
                  <div className="text-slate-400 text-[11px]">一键直达“点点速豹·指令流转”多级审核流</div>
                </div>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    onNavigate('home');
                  }}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md cursor-pointer"
                >
                  立即进入
                </button>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-bold text-slate-800">返回登录首页</div>
                  <div className="text-slate-400 text-[11px]">返回微信扫码登录封面页</div>
                </div>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    onNavigate('login');
                  }}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-md cursor-pointer"
                >
                  退出到登录页
                </button>
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: 个人中心 */}
      {showUserProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 text-slate-800">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#193B67] to-[#255594] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">个人中心</h3>
                  <p className="text-[11px] text-white/70 mt-1">管理员账号档案与安全鉴权凭据</p>
                </div>
              </div>
              <button
                onClick={() => setShowUserProfileModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-5 text-xs">
              {/* Profile Card Summary */}
              <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0">
                  <img src={sunsetBg} alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">. w .</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded-full text-[10px]">
                      超级管理员
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-1 flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentOrg}</span>
                  </div>
                  <div className="text-slate-400 text-[10px] mt-0.5">
                    工号：WX-20260904 · 职务：网信应急研判总调度
                  </div>
                </div>
              </div>

              {/* Detail fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[10px]">绑定微信</div>
                  <div className="font-bold text-slate-700 mt-0.5 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>wxid_2991024</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[10px]">联系手机</div>
                  <div className="font-bold text-slate-700 mt-0.5">138****8899</div>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[10px]">上次登录时间</div>
                  <div className="font-bold text-slate-700 mt-0.5">2026-09-04 16:52</div>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[10px]">安全等级</div>
                  <div className="font-bold text-emerald-600 mt-0.5 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>国密三级鉴权已启用</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">系统已全面开启防泄露水印审计</span>
              <button
                onClick={() => setShowUserProfileModal(false)}
                className="px-4 py-1.5 bg-[#193B67] hover:bg-[#204a80] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: 切换机构 */}
      {showSwitchOrgModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 text-slate-800">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#193B67] to-[#255594] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                  <ArrowLeftRight className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">切换机构</h3>
                  <p className="text-[11px] text-white/70 mt-1">选择您需协同办公的网信与治理业务主体</p>
                </div>
              </div>
              <button
                onClick={() => setShowSwitchOrgModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Organization Options List */}
            <div className="p-6 space-y-2.5 text-xs">
              {[
                { name: '台中市网信办', code: 'TC-WXB-01', desc: '直属综合网信治理中枢 · 指令流转总调中心' },
                { name: '市委宣传部舆情监测科', code: 'TC-XCB-04', desc: '新闻舆情监测预警与网络研判分析' },
                { name: '市公安局网安支队', code: 'TC-GA-WA02', desc: '涉网违法犯罪线索协查与处置打击' },
                { name: '市网络应急指挥中心', code: 'TC-YJ-ZH01', desc: '重大网络舆情与安全突发事件应急联调' },
                { name: '市互联网辟谣联动中心', code: 'TC-PY-001', desc: '涉台辟谣科普与涉假网络谣言溯源' },
              ].map((org) => {
                const isSelected = currentOrg === org.name;
                return (
                  <div
                    key={org.code}
                    onClick={() => {
                      setCurrentOrg(org.name);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${isSelected ? 'text-[#193B67]' : 'text-slate-800'}`}>
                            {org.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">({org.code})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{org.desc}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold shrink-0">
                        当前
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                当前选中：<strong className="text-slate-800">{currentOrg}</strong>
              </span>
              <button
                onClick={() => setShowSwitchOrgModal(false)}
                className="px-5 py-1.5 bg-[#193B67] hover:bg-[#204a80] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                确认切换
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
