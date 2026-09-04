import React, { useState, useEffect } from 'react';
import { Shield, UserCheck, Phone, X, Check, RefreshCw } from 'lucide-react';
import { LoginQrCode } from '../components/LoginQrCode';
import type { PageId } from '../types';

interface LoginProps {
  onLoginSuccess: (userRole?: string) => void;
  onNavigate?: (page: PageId) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  // Role switcher: 'admin' (管理员) or 'reviewer' (审核上报员)
  const [activeRole, setActiveRole] = useState<'admin' | 'reviewer'>('reviewer');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [countdown, setCountdown] = useState(180);
  const [isExpired, setIsExpired] = useState(false);
  const [showProductMatrix, setShowProductMatrix] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Click QR code handler
  const handleQrClick = () => {
    if (activeRole === 'reviewer') {
      // 审核上报员: 点击二维码进入系统操作
      if (isExpired) {
        setCountdown(180);
        setIsExpired(false);
        return;
      }
      setIsScanning(true);
      showToast('📱 已检测到微信扫码，正在授权审核上报员账号...');
      setTimeout(() => {
        setScanSuccess(true);
        showToast('✓ 审核上报员微信授权成功，正在进入工作台...');
        setTimeout(() => {
          onLoginSuccess('审核上报员');
        }, 800);
      }, 900);
    } else {
      // 管理员: 切换管理员 点击二维码不要绑定操作链接 (无任何跳转操作)
      showToast('管理员微信通道暂未绑定快捷模拟操作，请切换至审核上报员');
    }
  };

  const refreshQrCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCountdown(180);
    setIsExpired(false);
    setIsScanning(false);
    setScanSuccess(false);
    showToast('二维码已刷新');
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#f0f6fc] via-[#e5f0fa] to-[#f4f8fd] text-slate-800 flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#163868] text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center space-x-2.5 animate-in fade-in slide-in-from-top-4 border border-white/20">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================
          1:1 High-Fidelity Vector & Gradient Background System
          ======================================================== */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Ambient Center Glow */}
        <div className="absolute left-[47%] top-[48%] -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-radial from-white/95 via-[#dbeafe]/40 to-transparent blur-3xl" />
        <div className="absolute left-[20%] top-[30%] w-[500px] h-[500px] rounded-full bg-radial from-[#e0f2fe]/50 to-transparent blur-2xl" />

        {/* Top-Left Dot Matrix (Point Grid) */}
        <div className="absolute top-12 left-10 sm:left-24 w-72 h-64 opacity-45">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dotGrid" width="18" height="18" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.1" fill="#7194bf" opacity="0.65" />
              </pattern>
              <linearGradient id="gridFade" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                <stop offset="70%" stopColor="#fff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
              <mask id="gridMask">
                <rect width="100%" height="100%" fill="url(#gridFade)" />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotGrid)" mask="url(#gridMask)" />
          </svg>
        </div>

        {/* SVG Orbital Track Rings & Glowing Cyan Nodes & Bottom Waves */}
        <svg
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            <radialGradient id="nodeCyanGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00f5ff" stopOpacity="1" />
              <stop offset="30%" stopColor="#00d2ff" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#0284c7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hubHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#dbeafe" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#dbeafe" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Concentric Orbit Rings centered behind shield badge at (750, 460) */}
          <g transform="translate(750, 460)">
            {/* Center soft circular glow backdrop */}
            <circle r="260" fill="url(#hubHalo)" />

            {/* Outer Orbit Circle */}
            <circle
              r="285"
              fill="none"
              stroke="#7da7dc"
              strokeWidth="1.2"
              strokeOpacity="0.35"
              strokeDasharray="6 6"
            />

            {/* Middle Orbit Circle */}
            <circle
              r="215"
              fill="none"
              stroke="#95bce8"
              strokeWidth="1.4"
              strokeOpacity="0.45"
            />

            {/* Inner Orbit Circle */}
            <circle
              r="145"
              fill="none"
              stroke="#b5d4f6"
              strokeWidth="1.2"
              strokeOpacity="0.6"
            />

            {/* 1:1 Glowing Cyan Accent Nodes matching reference image */}
            {/* 1. Upper-Left node (~11 o'clock on middle circle) */}
            <g transform="translate(-105, -188)">
              <circle r="20" fill="url(#nodeCyanGlow)" />
              <circle r="5.5" fill="#00e5ff" />
              <circle r="2" fill="#ffffff" />
            </g>

            {/* 2. Lower-Right node (~4:30 o'clock on outer circle) */}
            <g transform="translate(235, 160)">
              <circle r="22" fill="url(#nodeCyanGlow)" />
              <circle r="6" fill="#00e5ff" />
              <circle r="2.2" fill="#ffffff" />
            </g>

            {/* 3. Lower-Left node (~6:30 o'clock on middle circle) */}
            <g transform="translate(-75, 202)">
              <circle r="15" fill="url(#nodeCyanGlow)" />
              <circle r="4.5" fill="#00e5ff" />
              <circle r="1.5" fill="#ffffff" />
            </g>

            {/* 4. Bottom faint node (~6 o'clock) */}
            <g transform="translate(15, 285)">
              <circle r="12" fill="url(#nodeCyanGlow)" />
              <circle r="3.5" fill="#00e5ff" />
            </g>
          </g>

          {/* Bottom Wave Lines across the bottom */}
          <path
            d="M -50 840 C 350 815, 750 845, 1150 830 C 1350 822, 1500 840, 1680 835"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="1.6"
            strokeOpacity="0.7"
          />
          <path
            d="M -50 870 C 400 835, 900 875, 1350 850 C 1500 840, 1600 860, 1680 855"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.2"
            strokeOpacity="0.75"
          />
        </svg>

        {/* Floating colored glowing dot nodes near the bottom waves */}
        {/* Violet / Purple Dot at ~21% */}
        <div className="absolute bottom-20 left-[21%] w-2.5 h-2.5 rounded-full bg-[#a855f7] shadow-[0_0_10px_#a855f7,0_0_16px_#c084fc]" />
        {/* Cyan Dot at ~8% */}
        <div className="absolute bottom-14 left-[8%] w-2 h-2 rounded-full bg-[#06b6d4] shadow-[0_0_8px_#06b6d4]" />
        {/* Cyan Dot at ~49% */}
        <div className="absolute bottom-16 left-[49%] w-2 h-2 rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]" />
        {/* Blue Dot at ~68% */}
        <div className="absolute bottom-12 left-[68%] w-1.5 h-1.5 rounded-full bg-[#60a5fa] shadow-[0_0_6px_#60a5fa]" />
      </div>

      {/* Top Header Bar: 1:1 match */}
      <header className="relative z-20 w-full px-6 sm:px-12 pt-6 sm:pt-7 flex items-center justify-between">
        {/* Left Double Branding: KN 康奈网络 | 点点速豹 subao.cn */}
        <div className="flex items-center space-x-6 sm:space-x-8">
          {/* Brand 1: KN 康奈网络 knwl.cn */}
          <div className="flex items-center space-x-2 select-none">
            {/* KN Monogram */}
            <div className="w-8 h-8 flex items-center justify-center font-black text-[#163868]">
              <svg viewBox="0 0 40 32" className="w-8 h-7 text-[#163868]" fill="currentColor">
                <path d="M0 0 H8 V12 L18 0 H26 L14 14 L27 32 H17 L8 18 V32 H0 Z" />
                <path d="M29 0 H37 V32 H29 Z" />
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[13px] font-bold text-[#163868] tracking-wider leading-none">
                康奈网络
              </span>
              <span className="text-[10px] text-slate-500 font-sans tracking-tight leading-tight mt-0.5">
                knwl.cn
              </span>
            </div>
          </div>

          {/* Brand 2: 点点速豹 subao.cn */}
          <div className="flex items-center space-x-2 select-none">
            {/* Geodesic Leopard Emblem */}
            <div className="w-8 h-8 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#163868]" fill="none">
                <polygon
                  points="50,8 86,28 86,72 50,92 14,72 14,28"
                  stroke="#163868"
                  strokeWidth="4.5"
                  strokeLinejoin="round"
                />
                <polygon
                  points="50,22 74,36 74,64 50,78 26,64 26,36"
                  stroke="#163868"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                <line x1="50" y1="8" x2="50" y2="22" stroke="#163868" strokeWidth="3" />
                <line x1="86" y1="28" x2="74" y2="36" stroke="#163868" strokeWidth="3" />
                <line x1="86" y1="72" x2="74" y2="64" stroke="#163868" strokeWidth="3" />
                <line x1="50" y1="92" x2="50" y2="78" stroke="#163868" strokeWidth="3" />
                <line x1="14" y1="72" x2="26" y2="64" stroke="#163868" strokeWidth="3" />
                <line x1="14" y1="28" x2="26" y2="36" stroke="#163868" strokeWidth="3" />
                <circle cx="50" cy="8" r="4.5" fill="#163868" />
                <circle cx="86" cy="28" r="4.5" fill="#163868" />
                <circle cx="86" cy="72" r="4.5" fill="#163868" />
                <circle cx="50" cy="92" r="4.5" fill="#163868" />
                <circle cx="14" cy="72" r="4.5" fill="#163868" />
                <circle cx="14" cy="28" r="4.5" fill="#163868" />
                <circle cx="50" cy="50" r="23" fill="#163868" />
                <path
                  d="M38 36 C45 32 55 35 60 43 C62 46 61 50 58 53 C55 55 50 54 46 51 C48 56 47 61 41 63 C36 66 30 63 31 57 C32 50 35 41 38 36 Z"
                  fill="#FFFFFF"
                />
                <circle cx="53" cy="42" r="1.8" fill="#163868" />
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[13px] font-bold text-[#163868] tracking-wider leading-none">
                点点速豹
              </span>
              <span className="text-[10px] text-[#2c538a] font-sans tracking-tight leading-tight mt-0.5">
                subao.cn
              </span>
            </div>
          </div>
        </div>

        {/* Right Tools: 联系我们 4000-999-363 | 产品矩阵 */}
        <div className="flex items-center space-x-3 text-xs text-slate-600 font-normal">
          <button
            onClick={() => setShowContactModal(true)}
            className="flex items-center space-x-1.5 hover:text-[#163868] transition-colors cursor-pointer py-1"
          >
            <Phone className="w-3.5 h-3.5 text-slate-500" />
            <span>联系我们 4000-999-363</span>
          </button>

          <span className="text-slate-300 select-none">|</span>

          {/* 产品矩阵 Popover Trigger & Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProductMatrix(!showProductMatrix)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                showProductMatrix
                  ? 'bg-[#dce7f5] text-[#15386a]'
                  : 'text-slate-600 hover:text-[#163868] hover:bg-slate-200/40'
              }`}
            >
              产品矩阵
            </button>

            {/* Click outside overlay */}
            {showProductMatrix && (
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setShowProductMatrix(false)}
              />
            )}

            {/* 1:1 Product Matrix Popover Menu */}
            {showProductMatrix && (
              <div className="absolute right-0 top-full mt-2 w-[210px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(20,50,90,0.14)] border border-slate-100/90 py-2.5 px-2 z-50 flex flex-col space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                {/* 1. 正管用 V8 */}
                <div
                  onClick={() => {
                    setShowProductMatrix(false);
                    showToast('已跳转切换至「正管用 V8」网信业务平台');
                  }}
                  className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg border-[1.5px] border-[#15386a] flex items-center justify-center p-1 bg-white shrink-0 group-hover:scale-105 transition-transform">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#15386a]" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <polygon points="12 4 4 19 20 19" />
                      <circle cx="12" cy="13" r="2.5" />
                      <line x1="12" y1="4" x2="12" y2="10.5" />
                    </svg>
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center">
                      <span className="text-xs font-bold text-slate-800 leading-tight">正管用</span>
                      <span className="ml-1.5 bg-[#15386a] text-white text-[9px] font-bold px-1.5 py-[1px] rounded leading-none">
                        V8
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-sans leading-tight mt-0.5">wxb.cn</span>
                  </div>
                </div>

                {/* 2. 点点速豹 当前 (Active Highlighted) */}
                <div className="flex items-center space-x-2.5 p-1.5 rounded-xl bg-[#edf5fd] border border-[#d6e7f8] cursor-default">
                  <div className="w-8 h-8 rounded-lg border-[1.5px] border-[#ea580c] flex items-center justify-center p-1 bg-white shrink-0 shadow-2xs">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#ea580c]" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 14 C4 11 7 8 12 8 C16 8 19 10 20 13 C20 15 18 16 16 15.5 C15 17 13 18 9 17 C6 18 4 16 4 14 Z" />
                      <circle cx="15" cy="12" r="1" fill="#ea580c" />
                    </svg>
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center">
                      <span className="text-xs font-bold text-[#15386a] leading-tight">点点速豹</span>
                      <span className="ml-1.5 bg-[#ea580c] text-white text-[9px] font-bold px-1.5 py-[1px] rounded leading-none">
                        当前
                      </span>
                    </div>
                    <span className="text-[10px] text-[#2c538a] font-sans leading-tight mt-0.5">subao.cn</span>
                  </div>
                </div>

                {/* 3. 谛听预警 */}
                <div
                  onClick={() => {
                    setShowProductMatrix(false);
                    showToast('已跳转切换至「谛听预警」大数据态势平台');
                  }}
                  className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#15386a]" fill="currentColor">
                      <path d="M3 8 C1.8 9.8 1.8 14.2 3 16" fill="none" stroke="#15386a" strokeWidth="2" strokeLinecap="round" />
                      <path d="M6 6 C4 9 4 15 6 18" fill="none" stroke="#15386a" strokeWidth="2" strokeLinecap="round" />
                      <path d="M9 12 C9 8.5 12 6 16 6 C20 6 23 8.5 23 12 C23 15.5 20 18 16 18 C14.5 18 13.5 17.5 12.5 16.8 L10 18 L10.8 15.5 C9.8 14.5 9 13.3 9 12 Z" />
                    </svg>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight">谛听预警</span>
                    <span className="text-[10px] text-slate-400 font-sans leading-tight mt-0.5">yuqing.cn</span>
                  </div>
                </div>

                {/* 4. 数解舆情 */}
                <div
                  onClick={() => {
                    setShowProductMatrix(false);
                    showToast('已跳转切换至「数解舆情」深度研判系统');
                  }}
                  className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#15386a]" fill="none" stroke="#15386a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 6 L7 6 C5 6 4 7.5 4 9 C4 10.5 5 12 7 12 L17 12 C19 12 20 13.5 20 15 C20 16.5 19 18 17 18 L5 18" />
                      <polyline points="16 4 19 6 16 8" />
                    </svg>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight">数解舆情</span>
                    <span className="text-[10px] text-slate-400 font-sans leading-tight mt-0.5">yuqing.pro</span>
                  </div>
                </div>

                {/* 5. 河图融媒体 */}
                <div
                  onClick={() => {
                    setShowProductMatrix(false);
                    showToast('已跳转切换至「河图融媒体」矩阵中枢');
                  }}
                  className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    <div className="w-6 h-6 rounded-full border-[1.5px] border-dashed border-[#15386a] flex items-center justify-center">
                      <span className="text-[7.5px] font-black text-[#15386a] tracking-tighter">KMT</span>
                    </div>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight">河图融媒体</span>
                    <span className="text-[10px] text-slate-400 font-sans leading-tight mt-0.5">rmt.cn</span>
                  </div>
                </div>

                {/* 6. 小极视讯 */}
                <div
                  onClick={() => {
                    setShowProductMatrix(false);
                    showToast('已跳转切换至「小极视讯」短视频监测中枢');
                  }}
                  className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#15386a]" fill="currentColor">
                      <path d="M3 8 C3 6.9 3.9 6 5 6 L15 6 C16.1 6 17 6.9 17 8 L17 16 C17 17.1 16.1 18 15 18 L5 18 C3.9 18 3 17.1 3 16 Z" />
                      <path d="M18 10 L22 7.5 L22 16.5 L18 14 Z" />
                      <polygon points="9 10 13 12 9 14" fill="#ffffff" />
                    </svg>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight">小极视讯</span>
                    <span className="text-[10px] text-slate-400 font-sans leading-tight mt-0.5">shipin.yuqing.cn</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Section: Left Hero Text + Center Shield Badge + Right 1:1 Login Card */}
      <main className="relative z-20 flex-1 max-w-[1580px] w-full mx-auto px-6 sm:px-12 lg:px-20 flex flex-col lg:flex-row items-center justify-between py-6 lg:py-0">
        {/* Left Hero Section */}
        <div className="w-full lg:w-4/12 flex flex-col items-start justify-center pt-2 lg:pt-0 pl-2 sm:pl-6 lg:pl-10">
          {/* Top domain: subao.cn */}
          <span className="text-[#587fae] text-[18px] sm:text-[20px] font-semibold tracking-[0.05em] font-sans mb-1.5 select-none">
            subao.cn
          </span>

          {/* Main Display Title: 点点速豹 */}
          <h1 className="text-5xl sm:text-[54px] lg:text-[58px] font-black text-[#15386a] tracking-tight leading-tight mb-2.5 select-none drop-shadow-[0_1px_2px_rgba(20,50,90,0.06)]">
            点点速豹
          </h1>

          {/* Subtitle: 清朗净网鉴谣速报系统 */}
          <h2 className="text-2xl sm:text-[26px] lg:text-[28px] font-bold text-[#163a6e] tracking-tight mb-4 select-none">
            清朗净网鉴谣速报系统
          </h2>

          {/* Slogan */}
          <div className="flex items-center space-x-2 text-[#1c4075] text-sm sm:text-[15px] font-medium tracking-wider select-none mt-2">
            <Shield className="w-4 h-4 text-[#163a6e] fill-[#163a6e]/15 shrink-0" />
            <span>网格鸣哨示警 讯息秒达中枢</span>
          </div>
        </div>

        {/* Center Tech Shield Emblem (1:1 with reference image) */}
        <div className="hidden lg:flex flex-col items-center justify-center pointer-events-none select-none my-6 lg:my-0">
          {/* Frosted hexagonal shield badge */}
          <div className="relative w-64 h-72 flex flex-col items-center justify-center">
            {/* Hexagonal Shield SVG Frame */}
            <svg viewBox="0 0 220 250" className="absolute inset-0 w-full h-full drop-shadow-[0_12px_35px_rgba(56,189,248,0.2)]">
              <defs>
                <linearGradient id="shieldGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#dbeafe" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0.25" />
                </linearGradient>
                <linearGradient id="shieldRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="45%" stopColor="#93c5fd" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* Outer Hexagon Shield */}
              <polygon
                points="110,12 205,62 205,178 110,238 15,178 15,62"
                fill="url(#shieldGlassGrad)"
                stroke="url(#shieldRimGrad)"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Inner Inset Hexagon Border */}
              <polygon
                points="110,24 193,68 193,172 110,224 27,172 27,68"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeOpacity="0.65"
                strokeLinejoin="round"
              />
            </svg>

            {/* Leopard silhouette + 3D Frosted "速 豹" Text inside shield */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              {/* Silhouette head */}
              <div className="w-24 h-16 opacity-35 mb-[-10px]">
                <svg viewBox="0 0 100 60" className="w-full h-full fill-[#38bdf8]">
                  <path d="M15 35 C25 20 60 15 85 30 C75 32 68 40 55 42 C40 44 25 45 15 35 Z" />
                </svg>
              </div>

              {/* Large Frosted Text: 速 豹 */}
              <span className="text-[46px] font-black tracking-[0.2em] pl-[0.2em] text-white drop-shadow-[0_2px_12px_rgba(56,189,248,0.45)] select-none opacity-90">
                速 豹
              </span>
            </div>
          </div>

          {/* Subtitle below shield */}
          <div className="text-xs text-[#8ca4c2] font-medium tracking-[0.35em] pl-[0.35em] mt-3 select-none">
            鉴 谣 速 报 · 清 朗 净 网
          </div>
        </div>

        {/* Right Section: 1:1 Login Card */}
        <div className="w-full lg:w-auto mt-8 lg:mt-0 flex justify-center lg:justify-end pr-0 lg:pr-10">
          <div className="w-full max-w-[360px] sm:w-[360px] bg-white/85 backdrop-blur-xl rounded-[28px] border border-white/90 shadow-[0_20px_50px_rgba(20,50,95,0.08)] p-7 pt-8 pb-7 flex flex-col items-center text-center transition-all duration-300 relative group/card">
            {/* Card Header: 欢迎登录 */}
            <h3 className="text-[22px] font-bold text-[#163868] tracking-tight">
              欢迎登录
            </h3>
            {/* Subtitle: 清朗净网鉴谣速报系统 */}
            <p className="text-xs text-[#6e85a0] mt-1 mb-5">
              清朗净网鉴谣速报系统
            </p>

            {/* Role Switcher Tab (1:1 segmented control) */}
            <div className="w-full bg-[#ebf2fa] p-1 rounded-xl flex items-center mb-6 border border-[#e2ecf7]">
              {/* Option 1: 管理员 */}
              <button
                type="button"
                onClick={() => {
                  setActiveRole('admin');
                  setIsScanning(false);
                  setScanSuccess(false);
                }}
                className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                  activeRole === 'admin'
                    ? 'bg-white text-[#163868] font-bold shadow-xs'
                    : 'text-[#657d99] hover:text-[#163868]'
                }`}
              >
                <Shield className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                <span>管理员</span>
              </button>

              {/* Option 2: 审核上报员 (Default Active) */}
              <button
                type="button"
                onClick={() => {
                  setActiveRole('reviewer');
                  setIsScanning(false);
                  setScanSuccess(false);
                }}
                className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                  activeRole === 'reviewer'
                    ? 'bg-white text-[#163868] font-bold shadow-xs'
                    : 'text-[#657d99] hover:text-[#163868]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                <span>审核上报员</span>
              </button>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center w-full">
              {/* White Container Box for QR code */}
              <div
                onClick={handleQrClick}
                className={`relative p-3.5 bg-white rounded-2xl shadow-xs border border-slate-100/90 transition-transform duration-200 ${
                  activeRole === 'reviewer'
                    ? 'hover:scale-[1.01] hover:shadow-md cursor-pointer group'
                    : 'cursor-default'
                }`}
              >
                <LoginQrCode
                  size={192}
                  isScanning={isScanning}
                  clickable={activeRole === 'reviewer'}
                />

                {/* QR Expired Overlay */}
                {isExpired && (
                  <div
                    onClick={refreshQrCode}
                    className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer z-10"
                  >
                    <RefreshCw className="w-8 h-8 text-[#163868] mb-2 animate-spin-once" />
                    <span className="text-xs font-bold text-slate-800">二维码已失效</span>
                    <span className="text-[11px] text-[#1E5ABB] mt-1 hover:underline">点击重新刷新</span>
                  </div>
                )}

                {/* Scanning Status Animation */}
                {isScanning && !scanSuccess && (
                  <div className="absolute inset-0 bg-[#163868]/75 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-white p-4 z-10 animate-in fade-in">
                    <div className="w-9 h-9 border-2 border-white/30 border-t-white rounded-full animate-spin mb-2" />
                    <span className="text-xs font-bold">扫码成功</span>
                    <span className="text-[10px] text-blue-100 mt-1">请在手机微信确认授权</span>
                  </div>
                )}

                {/* Authorized Success */}
                {scanSuccess && (
                  <div className="absolute inset-0 bg-emerald-700/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-white p-4 z-10 animate-in zoom-in-95">
                    <Check className="w-10 h-10 text-white mb-2" />
                    <span className="text-xs font-bold">授权通过</span>
                    <span className="text-[10px] text-emerald-100 mt-1">正在载入系统...</span>
                  </div>
                )}

                {/* Quick Click Hint Hover Pill only for 审核上报员 */}
                {activeRole === 'reviewer' && (
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#163868] text-white text-[10px] font-medium rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none whitespace-nowrap">
                    点击快速模拟扫码登录
                  </div>
                )}
              </div>

              {/* Subtext: —— 请使用审核上报员微信扫码 —— / —— 请使用管理员微信扫码 —— */}
              <div className="mt-6 flex items-center justify-center w-full text-xs text-[#788da6] select-none tracking-wide">
                <span className="h-[1px] w-6 bg-slate-300 mr-2" />
                <span>
                  {activeRole === 'reviewer'
                    ? '请使用审核上报员微信扫码'
                    : '请使用管理员微信扫码'}
                </span>
                <span className="h-[1px] w-6 bg-slate-300 ml-2" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer: 1:1 Match */}
      <footer className="relative z-20 w-full pb-6 pt-4 text-center px-4">
        <p className="text-xs text-[#6d829e] tracking-tight font-normal select-none">
          © 2013–2026 西安康奈网络科技有限公司. 保留所有权利 | 陕ICP备14007110号-14
        </p>
      </footer>

      {/* Contact Hotline Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 text-center p-6">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#163868] flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-slate-800">西安康奈网络客服热线</h4>
            <p className="text-xl font-black text-[#163868] mt-2 tracking-wider">4000-999-363</p>
            <p className="text-xs text-slate-500 mt-2">服务时间：工作日 08:30 - 18:00</p>
            <p className="text-[11px] text-slate-400 mt-0.5">提供系统部署接入、账号权限开通及技术支撑</p>

            <button
              onClick={() => setShowContactModal(false)}
              className="mt-6 w-full py-2 rounded-xl bg-[#163868] text-white text-xs font-bold hover:bg-[#1f4b8a] cursor-pointer"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
