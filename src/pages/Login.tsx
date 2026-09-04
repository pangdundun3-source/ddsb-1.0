import React, { useState } from 'react';
import {
  Phone,
  ShieldCheck,
  ThumbsUp,
  RefreshCw,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Layers,
  Lock,
  Shield,
  UserCheck,
  Info
} from 'lucide-react';

import { PageId } from '../types';

interface LoginProps {
  onLogin: (username?: string, targetPage?: PageId) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loginTheme, setLoginTheme] = useState<'zhengguanyong' | 'diandiansubao'>(() => {
    try {
      return (localStorage.getItem('ddsb_login_theme') as any) || 'zhengguanyong';
    } catch {
      return 'zhengguanyong';
    }
  });

  const [roleTab, setRoleTab] = useState<'admin' | 'reporter'>('admin');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [reporterFeedback, setReporterFeedback] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showProductMatrixModal, setShowProductMatrixModal] = useState(false);

  const handleSimulateScan = () => {
    if (isScanning || scanSuccess) return;
    setIsScanning(true);
    setReporterFeedback(null);

    if (roleTab === 'admin') {
      setTimeout(() => {
        setIsScanning(false);
        setScanSuccess(true);
        setTimeout(() => {
          onLogin('张三 (系统管理员)', 'home');
        }, 400);
      }, 500);
    } else {
      // 审核上报员：扫码后不跳转系统后台
      setTimeout(() => {
        setIsScanning(false);
        setScanSuccess(true);
        setTimeout(() => {
          setScanSuccess(false);
          setReporterFeedback('审核上报员微信扫码鉴权已完成！该角色为移动端专属上报通道，暂不跳转PC管理中枢后台。');
        }, 800);
      }, 600);
    }
  };

  const handleDirectAdminLogin = () => {
    if (loginTheme === 'zhengguanyong') {
      setIsScanning(true);
      setScanSuccess(false);
      setTimeout(() => {
        setIsScanning(false);
        setScanSuccess(true);
        setTimeout(() => {
          onLogin('张三 (系统管理员)', 'portal');
        }, 300);
      }, 400);
      return;
    }

    if (roleTab === 'admin') {
      setIsScanning(false);
      setScanSuccess(true);
      setTimeout(() => {
        onLogin('张三 (系统管理员)', 'home');
      }, 250);
    } else {
      setReporterFeedback('审核上报员微信扫码鉴权已完成！该角色为移动端专属上报通道，暂不跳转PC管理中枢后台。');
    }
  };

  const handleSelectProductTheme = (theme: 'zhengguanyong' | 'diandiansubao') => {
    setLoginTheme(theme);
    try {
      localStorage.setItem('ddsb_login_theme', theme);
    } catch {
      // ignore
    }
    setShowProductMatrixModal(false);
  };

  // ==========================================
  // RENDER: DIANDIAN SUBAO (点点速豹 · 清朗净网鉴谣速报系统)
  // Clean, high-contrast light theme matching 正管用 with 速豹 branding
  // ==========================================
  if (loginTheme === 'diandiansubao') {
    return (
      <div className="relative min-h-screen w-full bg-[#EAF3FD] select-none overflow-x-hidden flex flex-col justify-between text-[#1F3D68]">
        {/* Dynamic Background Gradients & Tech Mesh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Soft radial highlights */}
          <div className="absolute -top-[20%] left-[8%] w-[820px] h-[820px] bg-gradient-to-br from-white/85 via-sky-100/40 to-transparent rounded-full blur-3xl opacity-75" />
          <div className="absolute top-[25%] -left-[10%] w-[620px] h-[620px] bg-gradient-to-tr from-cyan-100/40 via-blue-100/40 to-transparent rounded-full blur-3xl opacity-60" />
          <div className="absolute -bottom-[20%] right-[5%] w-[820px] h-[820px] bg-gradient-to-tl from-sky-200/45 via-blue-100/35 to-transparent rounded-full blur-3xl opacity-80" />

          {/* Top-Left Subtle Tech Speed Mesh / Hexagon Dot Matrix */}
          <svg
            className="absolute top-10 left-6 w-[720px] h-[420px] text-blue-900/10 opacity-40 pointer-events-none"
            viewBox="0 0 720 420"
            fill="currentColor"
          >
            <defs>
              <pattern id="subao-dot-matrix" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
                <circle cx="2.5" cy="2.5" r="1.5" />
              </pattern>
            </defs>
            <path
              d="M 40,30 Q 140,20 220,55 T 380,80 T 510,65 T 580,105 Q 610,175 520,235 T 380,255 T 230,215 T 110,175 Z"
              fill="url(#subao-dot-matrix)"
            />
            <path
              d="M 200,150 Q 300,140 400,170 T 500,230 T 380,310 T 240,270 Z"
              fill="url(#subao-dot-matrix)"
              opacity="0.65"
            />
          </svg>

          {/* Center Concentric Orbital Speed Rings with Glowing Satellite Particles */}
          <div className="absolute top-1/2 left-[50%] -translate-x-[50%] -translate-y-[52%] w-[860px] h-[860px] pointer-events-none flex items-center justify-center">
            <div className="absolute w-[450px] h-[450px] rounded-full border border-sky-200/50" />
            <div className="absolute w-[640px] h-[640px] rounded-full border border-cyan-200/40" />
            <div className="absolute w-[820px] h-[820px] rounded-full border border-blue-200/25" />
            <div className="absolute top-[150px] left-[250px] w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#38BDF8]" />
            <div className="absolute bottom-[190px] right-[230px] w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_12px_#38BDF8]" />
            <div className="absolute top-[330px] right-[90px] w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60A5FA]" />
            <div className="absolute bottom-[130px] left-[270px] w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#38BDF8]" />
          </div>

          {/* Center 3D Frosted Embossed Glass Hexagonal Speed Shield (速豹) */}
          <div className="absolute top-1/2 left-[48%] -translate-x-[50%] -translate-y-[50%] w-[400px] h-[460px] pointer-events-none flex items-center justify-center opacity-90">
            <svg
              viewBox="0 0 400 460"
              className="w-full h-full drop-shadow-[0_20px_35px_rgba(40,90,170,0.12)]"
              fill="none"
            >
              {/* Outer Hexagon Shield Silhouette */}
              <polygon
                points="200,18 360,95 360,285 200,435 40,285 40,95"
                fill="url(#subao-shield-grad)"
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth="4"
                className="backdrop-blur-sm"
              />
              <polygon
                points="200,36 342,105 342,274 200,410 58,274 58,105"
                fill="none"
                stroke="rgba(186, 230, 253, 0.5)"
                strokeWidth="2.5"
              />

              <defs>
                <linearGradient id="subao-shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.75)" />
                  <stop offset="60%" stopColor="rgba(224, 242, 254, 0.45)" />
                  <stop offset="100%" stopColor="rgba(186, 230, 253, 0.25)" />
                </linearGradient>
                <filter id="subao-relief-filter" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="2" dy="2" stdDeviation="1.5" floodColor="rgba(255,255,255,0.95)" />
                  <feDropShadow dx="-2" dy="-2" stdDeviation="2" floodColor="rgba(35,75,135,0.22)" />
                </filter>
              </defs>

              {/* Speed Leopard Vector Emblem Outline inside Shield */}
              <path
                d="M 120,135 C 150,105 210,100 270,120 C 295,128 315,145 320,165 L 340,150 L 325,185 C 335,200 338,215 330,225 C 320,235 305,232 290,225 C 265,212 240,210 215,210 C 180,210 150,230 120,230 C 105,230 100,215 110,185 Z"
                fill="rgba(191, 219, 254, 0.3)"
                stroke="rgba(186, 230, 253, 0.6)"
                strokeWidth="2"
              />

              {/* 3D Embossed Relief Characters "速 豹" */}
              <g
                filter="url(#subao-relief-filter)"
                className="font-sans font-black select-none text-[#BED6F2]"
                style={{
                  fill: '#BED6F2',
                  fillOpacity: 0.85,
                  fontSize: '84px',
                  letterSpacing: '14px',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                <text x="135" y="275" textAnchor="middle" fontWeight="bold">速</text>
                <text x="265" y="275" textAnchor="middle" fontWeight="bold">豹</text>
              </g>

              {/* Tagline relief */}
              <text
                x="200"
                y="350"
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                letterSpacing="6"
                fill="#94A3B8"
                fillOpacity="0.6"
              >
                鉴谣速报 · 清朗净网
              </text>
            </svg>
          </div>

          {/* Ambient bottom sweeping light fiber curves */}
          <svg
            className="absolute bottom-0 left-0 w-full h-[180px] pointer-events-none opacity-70"
            viewBox="0 0 1440 180"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M -100,180 C 300,150 500,40 1000,120 C 1200,150 1350,110 1540,160"
              stroke="url(#subao-wave-grad-1)"
              strokeWidth="3.5"
              fill="none"
            />
            <path
              d="M -50,170 C 250,160 600,60 1100,140 C 1300,170 1420,130 1520,150"
              stroke="url(#subao-wave-grad-2)"
              strokeWidth="1.5"
              fill="none"
            />
            <circle cx="120" cy="165" r="2.5" fill="#38BDF8" />
            <circle cx="280" cy="150" r="1.5" fill="#7DD3FC" />
            <circle cx="450" cy="95" r="2" fill="#BAE6FD" />
            <circle cx="720" cy="80" r="2.5" fill="#38BDF8" />
            <circle cx="1080" cy="130" r="2" fill="#7DD3FC" />
            <circle cx="1320" cy="120" r="3" fill="#E0F2FE" />

            <defs>
              <linearGradient id="subao-wave-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.1" />
                <stop offset="35%" stopColor="#0EA5E9" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#0284C7" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="subao-wave-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Top Header Bar */}
        <header className="relative z-20 w-full px-6 sm:px-12 lg:px-16 pt-5 pb-3 flex items-center justify-between">
          {/* Left: KI 康奈网络 | 点点速豹 Logo Group */}
          <div className="flex items-center space-x-5">
            {/* 1. KI 康奈网络 Logo */}
            <div className="flex items-center space-x-2.5">
              {/* KI Monogram */}
              <div className="w-8 h-8 flex items-center justify-center font-black tracking-tighter text-[#1C4173]">
                <svg viewBox="0 0 36 36" className="w-full h-full fill-current">
                  <path d="M4,6 L10,6 L10,30 L4,30 Z" />
                  <path d="M10,18 L20,6 L26,6 L15,19 L27,30 L20,30 Z" />
                  <path d="M25,6 L31,6 L31,30 L25,30 Z" opacity="0.35" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold leading-tight tracking-wide text-[#1A3860]">
                  康奈网络
                </span>
                <span className="text-[10px] font-medium leading-tight text-[#5A7DA9] tracking-tight">
                  knwl.cn
                </span>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] h-6 bg-[#BCD2ED]/80" />

            {/* 2. 点点速豹 Brand Logo */}
            <div className="flex items-center space-x-2.5">
              {/* Geometric Hexagon Shield Emblem */}
              <div className="w-8 h-8 rounded-lg border border-[#2B548B] bg-white/80 backdrop-blur-xs shadow-xs p-1 flex items-center justify-center text-[#1C4173]">
                <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
                  {/* Hexagon Outline */}
                  <polygon
                    points="16,3 28,9.5 28,22.5 16,29 4,22.5 4,9.5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  />
                  {/* Inner Speed Nodes */}
                  <circle cx="16" cy="16" r="4.5" fill="currentColor" />
                  <path d="M11,16 L21,16" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M16,11 L16,21" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-extrabold tracking-wide text-[#173760]">
                  点点速豹
                </span>
                <span className="text-[10px] font-medium leading-tight text-[#5A7DA9] tracking-tight">
                  subao.cn
                </span>
              </div>
            </div>
          </div>

          {/* Right Tools Section */}
          <div className="flex items-center space-x-4 text-xs sm:text-sm font-medium text-[#305584]">
            {/* Contact Us Hotline */}
            <button
              onClick={() => setShowContactModal(true)}
              className="flex items-center space-x-1.5 hover:text-[#184888] transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-[#305584]" />
              <span>联系我们 4000-999-363</span>
            </button>

            {/* Vertical Divider */}
            <div className="w-[1px] h-3.5 bg-[#BCD2ED]" />

            {/* Product Matrix with 1:1 Dropdown Popup */}
            <div className="relative">
              <button
                onClick={() => setShowProductMatrixModal(!showProductMatrixModal)}
                className={`transition-all cursor-pointer flex items-center space-x-1 ${
                  showProductMatrixModal
                    ? 'bg-[#CAD8EC] text-[#1C4173] px-3 py-1 rounded-lg font-bold shadow-xs'
                    : 'hover:text-[#184888] font-semibold text-[#305584] px-1 py-1'
                }`}
              >
                <span>产品矩阵</span>
              </button>

              {/* 1:1 Product Matrix Floating Popup Menu */}
              {showProductMatrixModal && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProductMatrixModal(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-[218px] bg-white rounded-2xl shadow-[0_12px_36px_rgba(20,50,90,0.18)] border border-slate-100/80 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 select-none">
                    <div className="space-y-4">
                      {/* 1. 正管用 (V8) / wxb.cn -> Switch to 正管用 Login */}
                      <div
                        onClick={() => handleSelectProductTheme('zhengguanyong')}
                        className="flex items-center space-x-3 cursor-pointer group p-1 -m-1 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg border border-[#2B548B] bg-white shadow-xs p-1 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <svg viewBox="0 0 32 32" className="w-full h-full text-[#1C4376]" fill="none">
                            <rect x="2" y="2" width="28" height="28" rx="6" stroke="#224E85" strokeWidth="2" />
                            <circle cx="16" cy="8" r="2.2" fill="#224E85" />
                            <circle cx="8" cy="20" r="2.2" fill="#224E85" />
                            <circle cx="24" cy="20" r="2.2" fill="#224E85" />
                            <line x1="16" y1="8" x2="8" y2="20" stroke="#224E85" strokeWidth="1.8" />
                            <line x1="16" y1="8" x2="24" y2="20" stroke="#224E85" strokeWidth="1.8" />
                            <line x1="8" y1="20" x2="24" y2="20" stroke="#224E85" strokeWidth="1.8" />
                            <text x="16" y="16.5" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#224E85">正</text>
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-1">
                            <span className="text-[13px] font-bold text-[#1C3D68] leading-tight">正管用</span>
                            <span className="px-1 py-[1px] rounded bg-[#20497E] text-white text-[9px] font-bold leading-none">
                              V8
                            </span>
                          </div>
                          <span className="text-[11px] text-[#6985A9] font-normal leading-tight mt-0.5">
                            wxb.cn
                          </span>
                        </div>
                      </div>

                      {/* 2. 点点速豹 / subao.cn (Current Active) */}
                      <div
                        onClick={() => handleSelectProductTheme('diandiansubao')}
                        className="flex items-center space-x-3 cursor-pointer group p-1 -m-1 rounded-lg bg-blue-50/80 border border-blue-100/60"
                      >
                        <div className="w-8 h-8 rounded-lg border border-[#EA580C] bg-white shadow-xs p-1 flex items-center justify-center shrink-0 text-[#EA580C] group-hover:scale-105 transition-transform">
                          <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
                            <path
                              d="M6,22 C9,17 14,14 20,14 C22.5,14 25,15 27,16.5 L31,13 L29,19 C31,21 32,23.5 32,26 C32,27 31,28 30,28 C26,28 23,24 20,24 C16,24 12,27 8,27 C6.5,27 6,25 6,22 Z"
                              fill="currentColor"
                              opacity="0.2"
                            />
                            <path
                              d="M7,20 C10,15 15,13 21,13 C24,13 27,14.5 29,16.5 L32,13 L30.5,19 C32,21 32.5,23 32,25 C31,26.5 29,26.5 27.5,25.5 C24.5,23.5 21.5,23 18.5,23 C14.5,23 11,26 7.5,26 C6,26 5.5,24 7,20 Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinejoin="round"
                            />
                            <circle cx="28" cy="18" r="1.5" fill="currentColor" />
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-1">
                            <span className="text-[13px] font-bold text-[#1C3D68] leading-tight">点点速豹</span>
                            <span className="px-1 py-[1px] rounded bg-[#EA580C] text-white text-[9px] font-bold leading-none">
                              当前
                            </span>
                          </div>
                          <span className="text-[11px] text-[#6985A9] font-normal leading-tight mt-0.5">
                            subao.cn
                          </span>
                        </div>
                      </div>

                      {/* 3. 谛听预警 / yuqing.cn */}
                      <div className="flex items-center space-x-3 cursor-pointer group p-1 -m-1 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="w-8 h-8 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <svg viewBox="0 0 36 36" className="w-7 h-7 text-[#1C4173]" fill="none">
                            <path d="M22,6 C16,6 12,10.5 12,16.5 C12,19.5 13.5,22 15.5,23.8 L15.5,29 L19,27.5 C20,27.8 21,28 22,28 C28,28 32,23 32,17 C32,10.5 28,6 22,6 Z" opacity="0.15" fill="currentColor" />
                            <path d="M20,10 C16.5,10 14,12.8 14,16.2 C14,18.5 15.2,20.4 17,21.3 L17,24.5 L19.2,23.2 C20,23.4 20.8,23.5 21.6,23.5 C24.8,23.5 27.5,21 27.5,17.5 C27.5,14 24.8,10 20,10 Z" fill="currentColor" />
                            <path d="M8,12 C6,14.5 6,18.5 8,21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M5,9 C2,13 2,20 5,24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-[#1C3D68] leading-tight">谛听预警</span>
                          <span className="text-[11px] text-[#6985A9] font-normal leading-tight mt-0.5">
                            yuqing.cn
                          </span>
                        </div>
                      </div>

                      {/* 4. 数解舆情 / yuqing.pro */}
                      <div className="flex items-center space-x-3 cursor-pointer group p-1 -m-1 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="w-8 h-8 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <svg viewBox="0 0 36 36" className="w-7 h-7 text-[#1C4173]" fill="none">
                            <path
                              d="M26,9 L13,9 C9.5,9 7,11.5 7,15 C7,18 9.5,20 14,20.5 L22,21.5 C26.5,22 29,24 29,27.5 C29,31 26.5,33 23,33 L9,33"
                              stroke="currentColor"
                              strokeWidth="3.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <polygon points="26,6 30,10 26,14" fill="currentColor" />
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-[#1C3D68] leading-tight">数解舆情</span>
                          <span className="text-[11px] text-[#6985A9] font-normal leading-tight mt-0.5">
                            yuqing.pro
                          </span>
                        </div>
                      </div>

                      {/* 5. 河图融媒体 / rmt.cn */}
                      <div className="flex items-center space-x-3 cursor-pointer group p-1 -m-1 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="w-8 h-8 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <svg viewBox="0 0 36 36" className="w-7 h-7 text-[#1C4173]" fill="none">
                            <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="2" />
                            <circle cx="18" cy="18" r="11" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                            <text x="18" y="20.5" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="currentColor" letterSpacing="0.5">RMT</text>
                            <path d="M10,23 C14,26 22,26 26,23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-[#1C3D68] leading-tight">河图融媒体</span>
                          <span className="text-[11px] text-[#6985A9] font-normal leading-tight mt-0.5">
                            rmt.cn
                          </span>
                        </div>
                      </div>

                      {/* 6. 小极视讯 / shipin.yuqing.cn */}
                      <div className="flex items-center space-x-3 cursor-pointer group p-1 -m-1 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="w-8 h-8 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <svg viewBox="0 0 36 36" className="w-7 h-7 text-[#1C4173]" fill="none">
                            <rect x="8" y="10" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
                            <path d="M24,14 L30,11 L30,25 L24,22 Z" fill="currentColor" />
                            <path d="M8,14 L5,16 L5,20 L8,22 Z" fill="currentColor" />
                            <polygon points="14,14 20,18 14,22" fill="currentColor" />
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-[#1C3D68] leading-tight">小极视讯</span>
                          <span className="text-[11px] text-[#6985A9] font-normal leading-tight mt-0.5">
                            shipin.yuqing.cn
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Center Content Section */}
        <main className="relative z-10 flex-1 max-w-[1440px] w-full mx-auto px-6 sm:px-12 lg:px-16 flex items-center justify-between py-6">
          {/* Left Text Presentation (1:1 with user image) */}
          <div className="max-w-[560px] w-full space-y-4">
            {/* Domain Tag */}
            <div className="text-[20px] font-medium text-[#48719E] tracking-wide">
              subao.cn
            </div>

            {/* Giant Title & Subtitle */}
            <div>
              <h1 className="text-[56px] sm:text-[68px] font-black text-[#153863] tracking-[0.08em] leading-tight select-none">
                点点速豹
              </h1>
              <p className="text-[26px] sm:text-[32px] font-bold text-[#153863] tracking-[0.06em] mt-1">
                清朗净网鉴谣速报系统
              </p>
            </div>

            {/* Micro Feature Bullet Line */}
            <div className="pt-2 flex items-center space-x-2 text-[#244E82] text-sm sm:text-[15px] font-semibold">
              <Shield className="w-4 h-4 text-[#20497E] stroke-[2.4]" />
              <span>网格鸣哨示警 讯息秒达中枢</span>
            </div>
          </div>

          {/* Right Floating White Glass Login Card (1:1 with user image) */}
          <div className="w-[350px] sm:w-[370px] shrink-0">
            <div className="relative bg-white/95 backdrop-blur-xl border border-white/90 rounded-[28px] shadow-[0_25px_60px_-15px_rgba(20,50,90,0.18)] p-7 sm:p-8 transition-all">
              {/* Card Header Titles */}
              <div className="text-center mb-4">
                <h2 className="text-[22px] font-extrabold text-[#153863] tracking-wide">
                  欢迎登录
                </h2>
                <p className="text-[12px] font-medium text-[#5E7FA9] mt-1 tracking-wide">
                  清朗净网鉴谣速报系统
                </p>
              </div>

              {/* 身份切换导航 (管理员 / 审核上报员) */}
              <div className="w-full bg-[#EDF3FA] p-1 rounded-xl flex items-center mb-4 border border-[#D5E3F3]">
                <button
                  type="button"
                  onClick={() => {
                    setRoleTab('admin');
                    setReporterFeedback(null);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                    roleTab === 'admin'
                      ? 'bg-white text-[#153863] shadow-xs border border-slate-200/80'
                      : 'text-[#5E7FA9] hover:text-[#153863]'
                  }`}
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${roleTab === 'admin' ? 'text-[#153863]' : 'text-slate-400'}`} />
                  <span>管理员</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRoleTab('reporter');
                    setReporterFeedback(null);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                    roleTab === 'reporter'
                      ? 'bg-white text-[#153863] shadow-xs border border-slate-200/80'
                      : 'text-[#5E7FA9] hover:text-[#153863]'
                  }`}
                >
                  <UserCheck className={`w-3.5 h-3.5 ${roleTab === 'reporter' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>审核上报员</span>
                </button>
              </div>

              {/* WeChat QR Code Scan Container */}
              <div className="flex flex-col items-center">
                <div
                  onClick={handleSimulateScan}
                  className="relative group cursor-pointer p-3.5 bg-white rounded-2xl shadow-[0_4px_20px_rgba(30,70,130,0.08)] border border-slate-100/90 transition-transform duration-300 hover:scale-[1.02]"
                  title={roleTab === 'admin' ? '点击微信扫码登录后台' : '点击微信扫码 (审核上报员)'}
                >
                  {/* High-Fidelity SVG QR Code */}
                  <svg
                    viewBox="0 0 240 240"
                    className="w-48 h-48 sm:w-52 sm:h-52 text-[#103D75]"
                    fill="currentColor"
                  >
                    {/* Outer corner position marks */}
                    <rect x="15" y="15" width="55" height="55" rx="8" fill="none" stroke="currentColor" strokeWidth="8" />
                    <rect x="27" y="27" width="31" height="31" rx="4" fill="currentColor" />

                    <rect x="170" y="15" width="55" height="55" rx="8" fill="none" stroke="currentColor" strokeWidth="8" />
                    <rect x="182" y="27" width="31" height="31" rx="4" fill="currentColor" />

                    <rect x="15" y="170" width="55" height="55" rx="8" fill="none" stroke="currentColor" strokeWidth="8" />
                    <rect x="27" y="182" width="31" height="31" rx="4" fill="currentColor" />

                    {/* QR Code Blocks */}
                    <rect x="85" y="15" width="10" height="10" rx="2" />
                    <rect x="105" y="15" width="18" height="10" rx="2" />
                    <rect x="135" y="15" width="12" height="10" rx="2" />
                    <rect x="85" y="35" width="16" height="12" rx="2" />
                    <rect x="120" y="35" width="12" height="12" rx="2" />
                    <rect x="145" y="35" width="10" height="25" rx="2" />

                    <rect x="15" y="85" width="12" height="18" rx="2" />
                    <rect x="35" y="85" width="10" height="10" rx="2" />
                    <rect x="55" y="85" width="15" height="12" rx="2" />
                    <rect x="15" y="115" width="10" height="10" rx="2" />
                    <rect x="35" y="115" width="15" height="12" rx="2" />
                    <rect x="55" y="135" width="15" height="15" rx="2" />

                    <rect x="175" y="85" width="15" height="12" rx="2" />
                    <rect x="200" y="85" width="12" height="10" rx="2" />
                    <rect x="220" y="85" width="10" height="20" rx="2" />
                    <rect x="175" y="115" width="25" height="10" rx="2" />
                    <rect x="210" y="115" width="15" height="15" rx="2" />
                    <rect x="185" y="135" width="15" height="15" rx="2" />

                    <rect x="85" y="175" width="20" height="10" rx="2" />
                    <rect x="115" y="175" width="12" height="20" rx="2" />
                    <rect x="135" y="175" width="15" height="10" rx="2" />
                    <rect x="85" y="195" width="10" height="20" rx="2" />
                    <rect x="135" y="195" width="20" height="15" rx="2" />
                    <rect x="170" y="175" width="10" height="10" rx="2" />
                    <rect x="190" y="175" width="25" height="12" rx="2" />
                    <rect x="170" y="200" width="20" height="12" rx="2" />
                    <rect x="200" y="200" width="15" height="18" rx="2" />

                    <circle cx="88" cy="65" r="4" />
                    <circle cx="108" cy="70" r="4" />
                    <circle cx="128" cy="60" r="4" />
                    <circle cx="95" cy="115" r="4.5" />
                    <circle cx="145" cy="115" r="4.5" />
                    <circle cx="85" cy="145" r="4.5" />
                    <circle cx="150" cy="145" r="4" />
                    <circle cx="100" cy="220" r="4" />
                    <circle cx="125" cy="220" r="4" />
                  </svg>

                  {/* Center Dot-Leopard / Hexagon Emblem Inside QR (1:1 with photo) */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-xl border border-[#2B548B] shadow-md flex items-center justify-center p-1">
                    <svg viewBox="0 0 32 32" className="w-full h-full text-[#1C4376]" fill="none">
                      <polygon
                        points="16,2 29,9.5 29,22.5 16,30 3,22.5 3,9.5"
                        stroke="currentColor"
                        strokeWidth="2.2"
                      />
                      <circle cx="16" cy="16" r="4" fill="currentColor" />
                      <circle cx="16" cy="16" r="1.5" fill="#FFFFFF" />
                    </svg>
                  </div>

                  {/* Scanning Animation */}
                  <div className="absolute inset-x-4 top-4 bottom-4 overflow-hidden pointer-events-none rounded-xl">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-pulse absolute top-1/3" />
                  </div>

                  {/* Scanning States */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center space-y-2 text-[#1C4376] animate-in fade-in">
                      <RefreshCw className="w-7 h-7 animate-spin text-[#1C5ABB]" />
                      <span className="text-xs font-bold">微信已扫码，正在确认...</span>
                    </div>
                  )}

                  {scanSuccess && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center space-y-2 text-emerald-600 animate-in zoom-in-95">
                      <CheckCircle2 className="w-9 h-9 text-emerald-600 animate-bounce" />
                      <span className="text-xs font-bold text-slate-800">
                        {roleTab === 'admin' ? '扫码成功，正在进入系统...' : '扫码成功（审核上报员身份）'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Micro Subtext (1:1 with photo) */}
                <div className="mt-4 text-[12px] text-[#6985A9] font-medium tracking-wide">
                  {roleTab === 'admin' ? '—— 请使用管理员微信扫码登录 ——' : '—— 请使用审核上报员微信扫码 ——'}
                </div>

                {/* Reporter Notice Box */}
                {reporterFeedback && (
                  <div className="mt-3.5 w-full p-2.5 bg-blue-50/90 border border-blue-200/80 rounded-xl text-[11px] text-[#1B406E] flex items-start space-x-2 animate-in fade-in slide-in-from-top-1">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="leading-tight">{reporterFeedback}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Footer (1:1 with photo) */}
        <footer className="relative z-10 w-full text-center py-4 px-4 text-[12px] text-[#86A3C4] tracking-wider font-normal">
          <span>
            © 2013–2026 西安康奈网络科技有限公司. 保留所有权利 | 陕ICP备14007110号-14
          </span>
        </footer>

        {/* Modal: 联系我们 4000-999-363 */}
        {showContactModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
              <div className="px-6 py-4 bg-gradient-to-r from-[#1A3860] to-[#24508A] text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-cyan-300" />
                  <h3 className="font-bold text-sm">联系我们 · 技术与服务支持</h3>
                </div>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4 text-xs text-slate-700">
                <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-100 flex items-start space-x-3">
                  <div className="p-2 bg-[#1A3860] text-white rounded-lg shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#1A3860]">全国统一客服专线</div>
                    <div className="text-base font-extrabold text-[#204E88] mt-0.5 font-mono">4000-999-363</div>
                    <p className="text-[11px] text-slate-500 mt-1">服务时间：周一至周日 8:30 - 18:00 (7x24小时应急保障)</p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">平台研发运营</span>
                    <span className="font-semibold text-slate-800">西安康奈网络科技有限公司</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">官方门户网站</span>
                    <span className="font-semibold text-[#1E5ABB]">knwl.cn / subao.cn</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">技术支持邮箱</span>
                    <span className="font-semibold text-slate-800">support@knwl.cn</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">ICP备案号</span>
                    <span className="font-semibold text-slate-800">陕ICP备14007110号-14</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-1.5 bg-[#1A3860] hover:bg-[#20497E] text-white font-bold rounded-lg transition-colors cursor-pointer text-xs"
                >
                  我知道了
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER: ZHENGGUANYONG (正管用 · 网络生态综合治理平台)
  // ==========================================
  return (
    <div className="relative min-h-screen w-full bg-[#EBF2FC] overflow-x-hidden flex flex-col justify-between select-none text-[#1F3D68]">
      {/* Dynamic Background Gradients & Mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft radial highlights */}
        <div className="absolute -top-[20%] left-[10%] w-[800px] h-[800px] bg-gradient-to-br from-white/80 via-blue-100/40 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-[25%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-200/30 via-sky-100/40 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-[20%] right-[5%] w-[800px] h-[800px] bg-gradient-to-tl from-sky-200/40 via-blue-100/30 to-transparent rounded-full blur-3xl opacity-80" />

        {/* Top-Left Subtle World Map / Tech Dot Matrix */}
        <svg
          className="absolute top-12 left-6 w-[700px] h-[400px] text-blue-900/10 opacity-40 pointer-events-none"
          viewBox="0 0 700 400"
          fill="currentColor"
        >
          <defs>
            <pattern id="dot-matrix" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" />
            </pattern>
          </defs>
          <path
            d="M 50,40 Q 120,30 200,60 T 350,90 T 480,70 T 550,110 Q 580,180 500,240 T 360,260 T 220,220 T 120,180 Z"
            fill="url(#dot-matrix)"
          />
          <path
            d="M 220,160 Q 320,150 420,180 T 520,240 T 400,320 T 260,280 Z"
            fill="url(#dot-matrix)"
            opacity="0.7"
          />
        </svg>

        {/* Center Concentric Orbital Rings with Glowing Particles */}
        <div className="absolute top-1/2 left-[50%] -translate-x-[50%] -translate-y-[52%] w-[850px] h-[850px] pointer-events-none flex items-center justify-center">
          <div className="absolute w-[440px] h-[440px] rounded-full border border-blue-200/50" />
          <div className="absolute w-[620px] h-[620px] rounded-full border border-blue-200/35" />
          <div className="absolute w-[800px] h-[800px] rounded-full border border-blue-200/20" />
          <div className="absolute top-[160px] left-[260px] w-2 h-2 rounded-full bg-blue-300 shadow-[0_0_8px_#38BDF8]" />
          <div className="absolute bottom-[200px] right-[240px] w-2.5 h-2.5 rounded-full bg-cyan-200 shadow-[0_0_10px_#38BDF8]" />
          <div className="absolute top-[340px] right-[100px] w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#60A5FA]" />
          <div className="absolute bottom-[140px] left-[280px] w-2 h-2 rounded-full bg-sky-300 shadow-[0_0_8px_#38BDF8]" />
        </div>

        {/* Center 3D Frosted Embossed Glass Shield */}
        <div className="absolute top-1/2 left-[48%] -translate-x-[50%] -translate-y-[50%] w-[380px] h-[450px] pointer-events-none flex items-center justify-center opacity-90">
          <svg
            viewBox="0 0 380 450"
            className="w-full h-full drop-shadow-[0_20px_35px_rgba(40,90,170,0.12)]"
            fill="none"
          >
            <path
              d="M 190,16 C 275,70 345,72 345,160 C 345,280 270,360 190,430 C 110,360 35,280 35,160 C 35,72 105,70 190,16 Z"
              fill="url(#shield-grad)"
              stroke="rgba(255, 255, 255, 0.85)"
              strokeWidth="4"
              className="backdrop-blur-sm"
            />
            <path
              d="M 190,32 C 265,82 328,84 328,162 C 328,268 260,344 190,408 C 120,344 52,268 52,162 C 52,84 115,82 190,32 Z"
              fill="none"
              stroke="rgba(215, 233, 255, 0.45)"
              strokeWidth="2.5"
            />
            <defs>
              <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.7)" />
                <stop offset="60%" stopColor="rgba(235, 244, 255, 0.45)" />
                <stop offset="100%" stopColor="rgba(210, 230, 255, 0.25)" />
              </linearGradient>
              <filter id="relief-filter" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="2" stdDeviation="1.5" floodColor="rgba(255,255,255,0.95)" />
                <feDropShadow dx="-2" dy="-2" stdDeviation="2" floodColor="rgba(45,85,145,0.25)" />
              </filter>
            </defs>

            <g
              filter="url(#relief-filter)"
              className="font-sans font-black select-none text-[#C1D8F4]"
              style={{
                fill: '#BED6F2',
                fillOpacity: 0.85,
                fontSize: '92px',
                letterSpacing: '12px',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              <text x="110" y="215" textAnchor="middle" fontWeight="bold">正</text>
              <text x="260" y="215" textAnchor="middle" fontWeight="bold">管</text>
              <text x="185" y="325" textAnchor="middle" fontWeight="bold">用</text>
            </g>
          </svg>
        </div>

        {/* Ambient bottom sweeping light fiber curves */}
        <svg
          className="absolute bottom-0 left-0 w-full h-[180px] pointer-events-none opacity-65"
          viewBox="0 0 1440 180"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M -100,180 C 300,150 500,40 1000,120 C 1200,150 1350,110 1540,160"
            stroke="url(#wave-grad-1)"
            strokeWidth="3.5"
            fill="none"
          />
          <path
            d="M -50,170 C 250,160 600,60 1100,140 C 1300,170 1420,130 1520,150"
            stroke="url(#wave-grad-2)"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="120" cy="165" r="2.5" fill="#93C5FD" />
          <circle cx="280" cy="150" r="1.5" fill="#BFDBFE" />
          <circle cx="450" cy="95" r="2" fill="#E0F2FE" />
          <circle cx="720" cy="80" r="2.5" fill="#93C5FD" />
          <circle cx="1080" cy="130" r="2" fill="#BAE6FD" />
          <circle cx="1320" cy="120" r="3" fill="#E0F2FE" />

          <defs>
            <linearGradient id="wave-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.1" />
              <stop offset="35%" stopColor="#60A5FA" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#BFDBFE" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="wave-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#93C5FD" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Top Navigation Bar (Header) */}
      <header className="relative z-20 w-full px-6 sm:px-12 lg:px-16 pt-5 pb-3 flex items-center justify-between">
        {/* Left Logos Section */}
        <div className="flex items-center space-x-5">
          {/* 1. KN 康奈网络 Logo */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 flex items-center justify-center font-black tracking-tighter text-[#1C4173]">
              <svg viewBox="0 0 36 36" className="w-full h-full fill-current">
                <path d="M4,6 L10,6 L10,30 L4,30 Z" />
                <path d="M10,18 L20,6 L26,6 L15,19 L27,30 L20,30 Z" />
                <path d="M25,6 L31,6 L31,30 L25,30 Z" opacity="0.35" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold leading-tight tracking-wide text-[#1A3860]">
                康奈网络
              </span>
              <span className="text-[10px] font-medium leading-tight text-[#5A7DA9] tracking-tight">
                knwl.cn
              </span>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="w-[1px] h-6 bg-[#BCD2ED]" />

          {/* 2. 正管用 Brand Logo */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg border border-[#305C94] bg-white/70 backdrop-blur-xs shadow-xs p-1 flex items-center justify-center relative">
              <svg viewBox="0 0 32 32" className="w-full h-full text-[#234F86]" fill="none">
                <rect x="2" y="2" width="28" height="28" rx="6" stroke="#265691" strokeWidth="2" />
                <circle cx="16" cy="8" r="2.5" fill="#265691" />
                <circle cx="8" cy="20" r="2.5" fill="#265691" />
                <circle cx="24" cy="20" r="2.5" fill="#265691" />
                <line x1="16" y1="8" x2="8" y2="20" stroke="#265691" strokeWidth="1.8" />
                <line x1="16" y1="8" x2="24" y2="20" stroke="#265691" strokeWidth="1.8" />
                <line x1="8" y1="20" x2="24" y2="20" stroke="#265691" strokeWidth="1.8" />
                <text x="16" y="17" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#265691">正</text>
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-[14px] font-extrabold tracking-wide text-[#173760]">
                  正管用
                </span>
                <span className="px-1 py-[1px] rounded bg-[#20497E] text-white text-[9px] font-bold leading-none">
                  V8
                </span>
              </div>
              <span className="text-[10px] font-medium leading-tight text-[#5A7DA9] tracking-tight">
                wxb.cn
              </span>
            </div>
          </div>
        </div>

        {/* Right Tools Section */}
        <div className="flex items-center space-x-4 text-xs sm:text-sm font-medium text-[#305584]">
          {/* Contact Us Hotline */}
          <button
            onClick={() => setShowContactModal(true)}
            className="flex items-center space-x-1.5 hover:text-[#184888] transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-[#305584]" />
            <span>联系我们 4000-999-363</span>
          </button>

          {/* Vertical Divider */}
          <div className="w-[1px] h-3.5 bg-[#BCD2ED]" />

          {/* Product Matrix with 1:1 Dropdown Popup */}
          <div className="relative">
            <button
              onClick={() => setShowProductMatrixModal(!showProductMatrixModal)}
              className={`transition-all cursor-pointer flex items-center space-x-1 ${
                showProductMatrixModal
                  ? 'bg-[#CAD8EC] text-[#1C4173] px-3 py-1 rounded-lg font-bold shadow-xs'
                  : 'hover:text-[#184888] font-semibold text-[#305584] px-1 py-1'
              }`}
            >
              <span>产品矩阵</span>
            </button>

            {/* 1:1 Product Matrix Floating Popup Menu */}
            {showProductMatrixModal && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProductMatrixModal(false)}
                />

                <div className="absolute right-0 top-full mt-2 w-[218px] bg-white rounded-2xl shadow-[0_12px_36px_rgba(20,50,90,0.18)] border border-slate-100/80 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 select-none">
                  <div className="space-y-4">
                    {/* 1. 正管用 (V8) / wxb.cn */}
                    <div
                      onClick={() => handleSelectProductTheme('zhengguanyong')}
                      className="flex items-center space-x-3 cursor-pointer group p-1 -m-1 rounded-lg bg-blue-50/80 border border-blue-100/60"
                    >
                      <div className="w-8 h-8 rounded-lg border border-[#2B548B] bg-white shadow-xs p-1 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <svg viewBox="0 0 32 32" className="w-full h-full text-[#1C4376]" fill="none">
                          <rect x="2" y="2" width="28" height="28" rx="6" stroke="#224E85" strokeWidth="2" />
                          <circle cx="16" cy="8" r="2.2" fill="#224E85" />
                          <circle cx="8" cy="20" r="2.2" fill="#224E85" />
                          <circle cx="24" cy="20" r="2.2" fill="#224E85" />
                          <line x1="16" y1="8" x2="8" y2="20" stroke="#224E85" strokeWidth="1.8" />
                          <line x1="16" y1="8" x2="24" y2="20" stroke="#224E85" strokeWidth="1.8" />
                          <line x1="8" y1="20" x2="24" y2="20" stroke="#224E85" strokeWidth="1.8" />
                          <text x="16" y="16.5" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#224E85">正</text>
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-1">
                          <span className="text-[13px] font-bold text-[#1C3D68] leading-tight">正管用</span>
                          <span className="px-1 py-[1px] rounded bg-[#20497E] text-white text-[9px] font-bold leading-none">
                            V8
                          </span>
                        </div>
                        <span className="text-[11px] text-[#6985A9] font-normal leading-tight mt-0.5">
                          wxb.cn
                        </span>
                      </div>
                    </div>

                    {/* 2. 点点速豹 / subao.cn -> Switch to 点点速豹 Login */}
                    <div
                      onClick={() => handleSelectProductTheme('diandiansubao')}
                      className="flex items-center space-x-3 cursor-pointer group p-1 -m-1 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg border border-[#EA580C] bg-white shadow-xs p-1 flex items-center justify-center shrink-0 text-[#EA580C] group-hover:scale-105 transition-transform">
                        <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
                          <path
                            d="M6,22 C9,17 14,14 20,14 C22.5,14 25,15 27,16.5 L31,13 L29,19 C31,21 32,23.5 32,26 C32,27 31,28 30,28 C26,28 23,24 20,24 C16,24 12,27 8,27 C6.5,27 6,25 6,22 Z"
                            fill="currentColor"
                            opacity="0.2"
                          />
                          <path
                            d="M7,20 C10,15 15,13 21,13 C24,13 27,14.5 29,16.5 L32,13 L30.5,19 C32,21 32.5,23 32,25 C31,26.5 29,26.5 27.5,25.5 C24.5,23.5 21.5,23 18.5,23 C14.5,23 11,26 7.5,26 C6,26 5.5,24 7,20 Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                          <circle cx="28" cy="18" r="1.5" fill="currentColor" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-1">
                          <span className="text-[13px] font-bold text-[#1C3D68] leading-tight">点点速豹</span>
                          <span className="px-1 py-[1px] rounded bg-[#EA580C] text-white text-[9px] font-bold leading-none">
                            PRO
                          </span>
                        </div>
                        <span className="text-[11px] text-[#6985A9] font-normal leading-tight mt-0.5">
                          subao.cn
                        </span>
                      </div>
                    </div>

                    {/* 3. 谛听预警 / yuqing.cn */}
                    <div className="flex items-center space-x-3 cursor-pointer group p-1 -m-1 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <svg viewBox="0 0 36 36" className="w-7 h-7 text-[#1C4173]" fill="none">
                          <path d="M22,6 C16,6 12,10.5 12,16.5 C12,19.5 13.5,22 15.5,23.8 L15.5,29 L19,27.5 C20,27.8 21,28 22,28 C28,28 32,23 32,17 C32,10.5 28,6 22,6 Z" opacity="0.15" fill="currentColor" />
                          <path d="M20,10 C16.5,10 14,12.8 14,16.2 C14,18.5 15.2,20.4 17,21.3 L17,24.5 L19.2,23.2 C20,23.4 20.8,23.5 21.6,23.5 C24.8,23.5 27.5,21 27.5,17.5 C27.5,14 24.8,10 20,10 Z" fill="currentColor" />
                          <path d="M8,12 C6,14.5 6,18.5 8,21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M5,9 C2,13 2,20 5,24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-[#1C3D68] leading-tight">谛听预警</span>
                        <span className="text-[11px] text-[#6985A9] font-normal leading-tight mt-0.5">
                          yuqing.cn
                        </span>
                      </div>
                    </div>

                    {/* 4. 数解舆情 / yuqing.pro */}
                    <div className="flex items-center space-x-3 cursor-pointer group p-1 -m-1 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <svg viewBox="0 0 36 36" className="w-7 h-7 text-[#1C4173]" fill="none">
                          <path
                            d="M26,9 L13,9 C9.5,9 7,11.5 7,15 C7,18 9.5,20 14,20.5 L22,21.5 C26.5,22 29,24 29,27.5 C29,31 26.5,33 23,33 L9,33"
                            stroke="currentColor"
                            strokeWidth="3.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <polygon points="26,6 30,10 26,14" fill="currentColor" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-[#1C3D68] leading-tight">数解舆情</span>
                        <span className="text-[11px] text-[#6985A9] font-normal leading-tight mt-0.5">
                          yuqing.pro
                        </span>
                      </div>
                    </div>

                    {/* 5. 河图融媒体 / rmt.cn */}
                    <div className="flex items-center space-x-3 cursor-pointer group p-1 -m-1 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <svg viewBox="0 0 36 36" className="w-7 h-7 text-[#1C4173]" fill="none">
                          <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="2" />
                          <circle cx="18" cy="18" r="11" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                          <text x="18" y="20.5" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="currentColor" letterSpacing="0.5">RMT</text>
                          <path d="M10,23 C14,26 22,26 26,23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-[#1C3D68] leading-tight">河图融媒体</span>
                        <span className="text-[11px] text-[#6985A9] font-normal leading-tight mt-0.5">
                          rmt.cn
                        </span>
                      </div>
                    </div>

                    {/* 6. 小极视讯 / shipin.yuqing.cn */}
                    <div className="flex items-center space-x-3 cursor-pointer group p-1 -m-1 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <svg viewBox="0 0 36 36" className="w-7 h-7 text-[#1C4173]" fill="none">
                          <rect x="8" y="10" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
                          <path d="M24,14 L30,11 L30,25 L24,22 Z" fill="currentColor" />
                          <path d="M8,14 L5,16 L5,20 L8,22 Z" fill="currentColor" />
                          <polygon points="14,14 20,18 14,22" fill="currentColor" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-[#1C3D68] leading-tight">小极视讯</span>
                        <span className="text-[11px] text-[#6985A9] font-normal leading-tight mt-0.5">
                          shipin.yuqing.cn
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Center Content Grid */}
      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-6 sm:px-12 lg:px-16 flex items-center justify-between py-6">
        {/* Left Hero Text Section */}
        <div className="max-w-[560px] w-full space-y-6">
          {/* Domain Tag */}
          <div className="text-[26px] font-bold text-[#4B73A7] tracking-wide">
            wxb.cn
          </div>

          {/* Giant Title */}
          <div>
            <h1 className="text-[70px] sm:text-[82px] font-black text-[#1D3E6E] tracking-[0.18em] leading-none drop-shadow-xs select-none">
              正 管 用
            </h1>
            <p className="text-[26px] sm:text-[30px] font-bold text-[#2A5184] tracking-[0.12em] mt-3.5">
              网络生态综合治理平台
            </p>
          </div>

          {/* Thin Horizontal Divider */}
          <div className="w-[300px] h-[1.5px] bg-gradient-to-r from-[#8FB6E6] via-[#B8D3F3] to-transparent" />

          {/* 4 Feature Statements with Exact Icons */}
          <div className="space-y-4 pt-1">
            {/* 1. AI */}
            <div className="flex items-center space-x-3.5 group">
              <div className="w-6 h-6 flex items-center justify-center font-bold text-sm text-[#274E82]">
                <span className="font-extrabold tracking-tighter italic">Ai</span>
                <span className="text-[9px] align-top text-sky-600 ml-[1px]">⁺</span>
              </div>
              <span className="text-[16px] font-semibold text-[#2D5385] tracking-wide">
                人工智能+网络生态综合治理
              </span>
            </div>

            {/* 2. 正能量是总要求 */}
            <div className="flex items-center space-x-3.5 group">
              <div className="w-6 h-6 flex items-center justify-center text-[#274E82]">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[16px] font-semibold text-[#2D5385] tracking-wide">
                正能量是总要求
              </span>
            </div>

            {/* 3. 管得住是硬道理 */}
            <div className="flex items-center space-x-3.5 group">
              <div className="w-6 h-6 flex items-center justify-center text-[#274E82]">
                <Lock className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[16px] font-semibold text-[#2D5385] tracking-wide">
                管得住是硬道理
              </span>
            </div>

            {/* 4. 用得好是真本事 */}
            <div className="flex items-center space-x-3.5 group">
              <div className="w-6 h-6 flex items-center justify-center text-[#274E82]">
                <ThumbsUp className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[16px] font-semibold text-[#2D5385] tracking-wide">
                用得好是真本事
              </span>
            </div>
          </div>


        </div>

        {/* Right 1:1 Floating Glass Login Card */}
        <div className="w-[380px] sm:w-[400px] shrink-0">
          <div className="relative bg-white/90 backdrop-blur-xl border border-white/90 rounded-[28px] shadow-[0_25px_60px_-15px_rgba(25,65,125,0.15),0_0_0_1px_rgba(255,255,255,0.7)] p-8 sm:p-10 transition-all">
            {/* Card Titles */}
            <div className="text-center mb-6">
              <h2 className="text-[26px] font-black text-[#1D3E6E] tracking-wider">
                欢迎登录
              </h2>
              <p className="text-[14px] font-medium text-[#4D6F9C] mt-2 tracking-wider">
                网络生态综合治理平台
              </p>
            </div>

            {/* 1:1 WeChat QR Code Login */}
            <div className="flex flex-col items-center">
              {/* QR Code Container */}
              <div
                onClick={handleDirectAdminLogin}
                className="relative group cursor-pointer p-4 bg-white rounded-2xl shadow-[0_4px_24px_rgba(30,70,130,0.08)] border border-slate-100/90 transition-transform duration-300 hover:scale-[1.02]"
                title="点击微信扫码登录平台"
              >
                {/* High-Fidelity SVG QR Code */}
                <svg
                  viewBox="0 0 240 240"
                  className="w-52 h-52 sm:w-56 sm:h-56 text-[#1D4478]"
                  fill="currentColor"
                >
                  {/* Outer corner position marks */}
                  <rect x="15" y="15" width="55" height="55" rx="8" fill="none" stroke="currentColor" strokeWidth="8" />
                  <rect x="27" y="27" width="31" height="31" rx="4" fill="currentColor" />

                  <rect x="170" y="15" width="55" height="55" rx="8" fill="none" stroke="currentColor" strokeWidth="8" />
                  <rect x="182" y="27" width="31" height="31" rx="4" fill="currentColor" />

                  <rect x="15" y="170" width="55" height="55" rx="8" fill="none" stroke="currentColor" strokeWidth="8" />
                  <rect x="27" y="182" width="31" height="31" rx="4" fill="currentColor" />

                  {/* Matrix Data Blocks & Patterns */}
                  <rect x="85" y="15" width="10" height="10" rx="2" />
                  <rect x="105" y="15" width="18" height="10" rx="2" />
                  <rect x="135" y="15" width="12" height="10" rx="2" />
                  <rect x="85" y="35" width="16" height="12" rx="2" />
                  <rect x="120" y="35" width="12" height="12" rx="2" />
                  <rect x="145" y="35" width="10" height="25" rx="2" />

                  <rect x="15" y="85" width="12" height="18" rx="2" />
                  <rect x="35" y="85" width="10" height="10" rx="2" />
                  <rect x="55" y="85" width="15" height="12" rx="2" />
                  <rect x="15" y="115" width="10" height="10" rx="2" />
                  <rect x="35" y="115" width="15" height="12" rx="2" />
                  <rect x="55" y="135" width="15" height="15" rx="2" />

                  <rect x="175" y="85" width="15" height="12" rx="2" />
                  <rect x="200" y="85" width="12" height="10" rx="2" />
                  <rect x="220" y="85" width="10" height="20" rx="2" />
                  <rect x="175" y="115" width="25" height="10" rx="2" />
                  <rect x="210" y="115" width="15" height="15" rx="2" />
                  <rect x="185" y="135" width="15" height="15" rx="2" />

                  <rect x="85" y="175" width="20" height="10" rx="2" />
                  <rect x="115" y="175" width="12" height="20" rx="2" />
                  <rect x="135" y="175" width="15" height="10" rx="2" />
                  <rect x="85" y="195" width="10" height="20" rx="2" />
                  <rect x="135" y="195" width="20" height="15" rx="2" />
                  <rect x="170" y="175" width="10" height="10" rx="2" />
                  <rect x="190" y="175" width="25" height="12" rx="2" />
                  <rect x="170" y="200" width="20" height="12" rx="2" />
                  <rect x="200" y="200" width="15" height="18" rx="2" />

                  <circle cx="88" cy="65" r="4" />
                  <circle cx="108" cy="70" r="4" />
                  <circle cx="128" cy="60" r="4" />
                  <circle cx="95" cy="115" r="4.5" />
                  <circle cx="145" cy="115" r="4.5" />
                  <circle cx="85" cy="145" r="4.5" />
                  <circle cx="150" cy="145" r="4" />
                  <circle cx="100" cy="220" r="4" />
                  <circle cx="125" cy="220" r="4" />
                </svg>

                {/* Central "正管" Brand Badge Inside QR Code */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-xl border-2 border-[#1D4478] shadow-md flex flex-col items-center justify-center p-1">
                  <div className="flex items-center space-x-0.5 text-[10px] font-black text-[#1D4478] leading-none">
                    <span>正</span>
                    <span>管</span>
                  </div>
                  <div className="text-[10px] font-black text-[#1D4478] leading-none mt-0.5">
                    用
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1D4478]" />
                    <div className="w-3.5 h-[1px] bg-[#1D4478]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1D4478]" />
                  </div>
                </div>

                {/* Laser Scanning Beam Animation */}
                <div className="absolute inset-x-4 top-4 bottom-4 overflow-hidden pointer-events-none rounded-xl">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_12px_#06b6d4] animate-pulse absolute top-1/3" />
                </div>

                {/* Scanning Overlay State */}
                {isScanning && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center space-y-2 text-[#1C4376] animate-in fade-in">
                    <RefreshCw className="w-7 h-7 animate-spin text-[#1C5ABB]" />
                    <span className="text-xs font-bold">微信已扫码，正在进入平台...</span>
                  </div>
                )}

                {/* Scan Success State */}
                {scanSuccess && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center space-y-2 text-emerald-600 animate-in zoom-in-95">
                    <CheckCircle2 className="w-9 h-9 text-emerald-600 animate-bounce" />
                    <span className="text-xs font-bold text-slate-800">
                      扫码成功，正在进入正管用平台...
                    </span>
                  </div>
                )}
              </div>

              {/* Micro Subtext matching screenshot: —— 请使用微信扫码登录 —— */}
              <div className="mt-6 text-[13px] text-[#4D6F9C] font-semibold tracking-wider">
                —— 请使用微信扫码登录 ——
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-4 px-4 text-[12px] text-[#6986AC] tracking-wider font-normal">
        <span>
          © 2013–2026 西安康奈网络科技有限公司. 保留所有权利。| 陕ICP备14007110号-14
        </span>
      </footer>

      {/* Modal: 联系我们 4000-999-363 */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-gradient-to-r from-[#1A3860] to-[#24508A] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-cyan-300" />
                <h3 className="font-bold text-sm">联系我们 · 技术与服务支持</h3>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-100 flex items-start space-x-3">
                <div className="p-2 bg-[#1A3860] text-white rounded-lg shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#1A3860]">全国统一客服专线</div>
                  <div className="text-base font-extrabold text-[#204E88] mt-0.5 font-mono">4000-999-363</div>
                  <p className="text-[11px] text-slate-500 mt-1">服务时间：周一至周日 8:30 - 18:00 (7x24小时应急保障)</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">平台研发运营</span>
                  <span className="font-semibold text-slate-800">西安康奈网络科技有限公司</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">官方门户网站</span>
                  <span className="font-semibold text-[#1E5ABB]">knwl.cn / wxb.cn</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">技术支持邮箱</span>
                  <span className="font-semibold text-slate-800">support@knwl.cn</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">ICP备案号</span>
                  <span className="font-semibold text-slate-800">陕ICP备14007110号-14</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowContactModal(false)}
                className="px-4 py-1.5 bg-[#1A3860] hover:bg-[#20497E] text-white font-bold rounded-lg transition-colors cursor-pointer text-xs"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
