import React, { useState, useEffect } from 'react';
import { Shield, Phone, X, Check, RefreshCw } from 'lucide-react';
import { LoginQrCode } from '../components/LoginQrCode';
import loginBgImage from '../assets/images/login_bg.jpg';
import type { PageId } from '../types';

interface LoginProps {
  onLoginSuccess: (userRole?: string) => void;
  onNavigate?: (page: PageId) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [loginMethod, setLoginMethod] = useState<'qrcode' | 'account'>('qrcode');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [countdown, setCountdown] = useState(180);
  const [isExpired, setIsExpired] = useState(false);
  const [showProductMatrix, setShowProductMatrix] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Account form state for optional toggle
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('••••••••');
  const [selectedRole, setSelectedRole] = useState<'上报员' | '审核员' | '管理员'>('上报员');

  useEffect(() => {
    if (loginMethod !== 'qrcode') return;
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
  }, [loginMethod]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSimulateScan = () => {
    if (isExpired) {
      setCountdown(180);
      setIsExpired(false);
      return;
    }
    setIsScanning(true);
    showToast('📱 已检测到微信客户端扫码，等待确认授权...');
    setTimeout(() => {
      setScanSuccess(true);
      showToast('✓ 微信授权成功，正在进入速报工作台...');
      setTimeout(() => {
        onLoginSuccess('上报员 + 审核员');
      }, 900);
    }, 1000);
  };

  const handleAccountLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      showToast('请输入登录账号');
      return;
    }
    showToast(`✓ 验证通过（身份：${selectedRole}），正在进入系统...`);
    setTimeout(() => {
      onLoginSuccess(selectedRole);
    }, 800);
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
    <div className="relative min-h-screen w-full bg-[#d6e3f2] text-slate-800 flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#163868] text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center space-x-2.5 animate-in fade-in slide-in-from-top-4 border border-white/20">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Atmospheric Background & Center Tech Visual */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Render base background image */}
        <img
          src={loginBgImage}
          alt="点点速豹背景"
          className="w-full h-full object-cover object-center opacity-85"
        />

        {/* Ambient radial gradients matching the ice-blue silver tone */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#d6e3f2]/25 to-[#bfd3e9]/65 mix-blend-multiply" />

        {/* Vertical Beam of Light shooting up from center */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-[38%] w-28 bg-gradient-to-t from-white/70 via-white/20 to-transparent blur-xl" />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-[38%] w-1.5 bg-gradient-to-t from-white via-white/80 to-transparent blur-[0.8px]" />

        {/* Center Perspective Rings & Optical Rays SVG */}
        <svg
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full opacity-60"
        >
          <defs>
            <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="40%" stopColor="#98c3f3" stopOpacity="0.7" />
              <stop offset="80%" stopColor="#4f8bd3" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#4f8bd3" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="35%" stopColor="#c5e0ff" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#639ee3" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#639ee3" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Perspective Concentric Elliptical Orbit Rings centered at (800, 520) */}
          <g transform="translate(800, 520)">
            <ellipse rx="520" ry="155" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.45" strokeDasharray="6 4" />
            <ellipse rx="400" ry="120" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.6" />
            <ellipse rx="280" ry="85" fill="none" stroke="#ffffff" strokeWidth="1.4" strokeOpacity="0.75" />
            <ellipse rx="160" ry="50" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeOpacity="0.9" />
            <ellipse rx="70" ry="22" fill="url(#hubGlow)" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.95" />

            {/* Radial Spoke Lines */}
            {[0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const x1 = Math.cos(rad) * 60;
              const y1 = Math.sin(rad) * 19;
              const x2 = Math.cos(rad) * 480;
              const y2 = Math.sin(rad) * 145;
              return (
                <line
                  key={deg}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  strokeOpacity="0.4"
                />
              );
            })}

            {/* Glowing nodes distributed on concentric perspective orbits */}
            {[
              { rx: 520, ry: 155, deg: 15, size: 7 },
              { rx: 520, ry: 155, deg: 65, size: 8 },
              { rx: 520, ry: 155, deg: 125, size: 6 },
              { rx: 520, ry: 155, deg: 195, size: 8 },
              { rx: 520, ry: 155, deg: 245, size: 7 },
              { rx: 520, ry: 155, deg: 305, size: 7 },
              { rx: 400, ry: 120, deg: 35, size: 9 },
              { rx: 400, ry: 120, deg: 95, size: 8 },
              { rx: 400, ry: 120, deg: 155, size: 8 },
              { rx: 400, ry: 120, deg: 215, size: 9 },
              { rx: 400, ry: 120, deg: 275, size: 8 },
              { rx: 400, ry: 120, deg: 335, size: 8 },
              { rx: 280, ry: 85, deg: 50, size: 10 },
              { rx: 280, ry: 85, deg: 110, size: 10 },
              { rx: 280, ry: 85, deg: 170, size: 9 },
              { rx: 280, ry: 85, deg: 230, size: 10 },
              { rx: 280, ry: 85, deg: 290, size: 9 },
              { rx: 280, ry: 85, deg: 350, size: 10 },
              { rx: 160, ry: 50, deg: 70, size: 11 },
              { rx: 160, ry: 50, deg: 190, size: 11 },
              { rx: 160, ry: 50, deg: 310, size: 11 }
            ].map((node, i) => {
              const rad = (node.deg * Math.PI) / 180;
              const x = Math.cos(rad) * node.rx;
              const y = Math.sin(rad) * node.ry;
              return (
                <g key={i} transform={`translate(${x}, ${y})`}>
                  <circle r={node.size * 2} fill="url(#nodeGlow)" />
                  <circle r={node.size * 0.55} fill="#ffffff" />
                </g>
              );
            })}

            {/* Central hub luminous core */}
            <g transform="translate(0, -5)">
              <circle r="22" fill="url(#hubGlow)" />
              <circle r="9" fill="#ffffff" />
            </g>
          </g>
        </svg>

        {/* Ambient floating square dust bokeh particles matching original graphic */}
        <div className="absolute top-[28%] left-[28%] w-3 h-3 bg-white/40 rotate-12 blur-[0.5px]" />
        <div className="absolute top-[35%] left-[34%] w-2 h-2 bg-white/30 -rotate-45" />
        <div className="absolute top-[48%] left-[22%] w-2.5 h-2.5 bg-white/35 rotate-45" />
        <div className="absolute top-[30%] right-[32%] w-3 h-3 bg-white/30 rotate-12" />
        <div className="absolute top-[22%] right-[42%] w-2 h-2 bg-white/40 -rotate-12" />
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
              <span className="text-[13px] font-bold text-slate-800 tracking-wider leading-none">
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

          <button
            onClick={() => setShowProductMatrix(true)}
            className="hover:text-[#163868] transition-colors cursor-pointer py-1"
          >
            产品矩阵
          </button>
        </div>
      </header>

      {/* Main Section: Left Hero Text + Right 1:1 Login Card */}
      <main className="relative z-20 flex-1 max-w-[1580px] w-full mx-auto px-6 sm:px-12 lg:px-24 flex flex-col lg:flex-row items-center justify-between py-6 lg:py-0">
        {/* Left Section */}
        <div className="w-full lg:w-1/2 flex flex-col items-start justify-center pt-2 lg:pt-0 pl-2 sm:pl-6 lg:pl-10">
          {/* Top domain: subao.cn */}
          <span className="text-[#6587b6] text-[18px] sm:text-[20px] font-semibold tracking-[0.05em] font-sans mb-1.5 select-none">
            subao.cn
          </span>

          {/* Main Display Title: 点点速豹 */}
          <h1 className="text-5xl sm:text-[54px] lg:text-[60px] font-black text-[#15386a] tracking-tight leading-tight mb-2.5 select-none drop-shadow-[0_1px_2px_rgba(20,50,90,0.06)]">
            点点速豹
          </h1>

          {/* Subtitle: 清朗净网鉴谣速报系统 */}
          <h2 className="text-2xl sm:text-[26px] lg:text-[29px] font-bold text-[#163a6e] tracking-tight mb-4 select-none">
            清朗净网鉴谣速报系统
          </h2>

          {/* Divider line under subtitle */}
          <div className="w-64 sm:w-80 h-[1.5px] bg-[#97b3d6] mb-4 opacity-85" />

          {/* Slogan */}
          <div className="flex items-center space-x-2 text-[#1c4075] text-sm sm:text-[15px] font-medium tracking-wider select-none">
            <Shield className="w-4 h-4 text-[#163a6e] fill-[#163a6e]/15 shrink-0" />
            <span>网格鸣哨示警 讯息秒达中枢</span>
          </div>
        </div>

        {/* Right Section: 1:1 Login Card */}
        <div className="w-full lg:w-auto mt-8 lg:mt-0 flex justify-center lg:justify-end pr-0 lg:pr-12">
          <div className="w-full max-w-[380px] sm:w-[380px] bg-white/75 backdrop-blur-xl rounded-[28px] border border-white/90 shadow-[0_20px_50px_rgba(20,50,95,0.08)] p-8 pt-9 pb-8 flex flex-col items-center text-center transition-all duration-300 relative group/card">
            {/* Card Header: 欢迎登录 */}
            <h3 className="text-[23px] font-bold text-[#163868] tracking-tight">
              欢迎登录
            </h3>
            {/* Subtitle: 清朗净网鉴谣速报系统 */}
            <p className="text-xs text-[#5e7492] mt-1.5 mb-7">
              清朗净网鉴谣速报系统
            </p>

            {loginMethod === 'qrcode' ? (
              /* 1:1 Exact WeChat QR Code Display */
              <div className="flex flex-col items-center w-full">
                {/* White Container Box for QR code */}
                <div
                  onClick={handleSimulateScan}
                  className="relative p-3.5 bg-white rounded-2xl shadow-xs border border-slate-100/90 transition-transform duration-200 hover:scale-[1.01] hover:shadow-md cursor-pointer group"
                >
                  <LoginQrCode
                    size={192}
                    isScanning={isScanning}
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

                  {/* Quick Click Hint Hover Pill */}
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#163868] text-white text-[10px] font-medium rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none whitespace-nowrap">
                    点击快速模拟扫码登录
                  </div>
                </div>

                {/* Subtext: —— 请使用微信扫码登录 —— */}
                <div className="mt-7 flex items-center justify-center w-full text-xs text-[#788da6] select-none tracking-wide">
                  <span className="h-[1px] w-6 bg-slate-300 mr-2" />
                  <span>请使用微信扫码登录</span>
                  <span className="h-[1px] w-6 bg-slate-300 ml-2" />
                </div>
              </div>
            ) : (
              /* Account & Password Login Form */
              <form onSubmit={handleAccountLogin} className="w-full flex flex-col space-y-3.5">
                <div className="text-left">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    系统账号
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名/手机号"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#163868] focus:border-transparent"
                  />
                </div>

                <div className="text-left">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    登录密码
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#163868] focus:border-transparent"
                  />
                </div>

                <div className="text-left">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    身份视角
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['上报员', '审核员', '管理员'] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          selectedRole === role
                            ? 'bg-[#163868] text-white border-[#163868]'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#163868] hover:bg-[#1f4b8a] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  立即登录
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('qrcode')}
                    className="text-xs text-[#163868] hover:underline cursor-pointer"
                  >
                    返回微信扫码登录
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Footer: 1:1 Match */}
      <footer className="relative z-20 w-full pb-6 pt-4 text-center px-4">
        <p className="text-xs text-[#6d829e] tracking-tight font-normal select-none">
          © 2013–2026 西安康奈网络科技有限公司.保留所有权利 | 陕ICP备14007110号-14
        </p>
      </footer>

      {/* Product Matrix Modal */}
      {showProductMatrix && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-[#163868] text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base">康奈网络 · 清朗数智产品矩阵</h4>
                <p className="text-xs text-blue-200 mt-0.5">面向网信部门与政务单位的专业舆情治理中枢矩阵</p>
              </div>
              <button
                onClick={() => setShowProductMatrix(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border-2 border-[#163868] bg-blue-50/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-[#163868]">点点速豹</span>
                  <span className="text-[10px] bg-[#163868] text-white px-2 py-0.5 rounded-full font-bold">当前系统</span>
                </div>
                <p className="text-xs text-slate-600">清朗净网鉴谣速报系统，实现基层网格员鸣哨示警与信息秒级流转。</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-slate-800">康奈数智舆情云</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">监测中台</span>
                </div>
                <p className="text-xs text-slate-500">全网多源大数据全天候监测，智能情感研判与态势预警大屏。</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-slate-800">清朗网信鉴谣库</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">溯源治理</span>
                </div>
                <p className="text-xs text-slate-500">权威辟谣知识库与网络谣言溯源比对中枢，支持跨机构联合办案。</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-slate-800">网格鸣哨联动中心</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">协同治理</span>
                </div>
                <p className="text-xs text-slate-500">市、区、街道、社区四级联动，舆情线索派单督办与闭环核销。</p>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowProductMatrix(false)}
                className="px-4 py-1.5 rounded-lg bg-[#163868] text-white text-xs font-bold hover:bg-[#1f4b8a] cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

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
