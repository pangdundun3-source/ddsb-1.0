import React, { useMemo, useState } from 'react';
import { RotateCw, CheckCircle2, Loader2 } from 'lucide-react';
import { LoginPhase } from '../viewmodels/useAppEntryViewModel';
import bgImage from '../assets/images/glass_geometric_bg_1788400700825.jpg';

interface WechatQrLoginProps {
  loginPhase: LoginPhase;
  qrRevision: number;
  onRefreshQr: () => void;
  onSimulateScan: () => void;
}

const QR_SIZE = 35; // Authentic high-density enterprise QR matrix

const hashSeed = (seed: string) => {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const createRandom = (seed: number) => {
  let value = seed || 1;
  return () => {
    value = Math.imul(value, 1664525) + 1013904223;
    return (value >>> 0) / 4294967296;
  };
};

const setFinderPattern = (
  matrix: boolean[][],
  xOffset: number,
  yOffset: number
) => {
  for (let y = 0; y < 7; y += 1) {
    for (let x = 0; x < 7; x += 1) {
      const isBorder = x === 0 || x === 6 || y === 0 || y === 6;
      const isCore = x >= 2 && x <= 4 && y >= 2 && y <= 4;
      matrix[yOffset + y][xOffset + x] = isBorder || isCore;
    }
  }
};

const createQrMatrix = (seedText: string) => {
  const matrix = Array.from({ length: QR_SIZE }, () =>
    Array.from({ length: QR_SIZE }, () => false)
  );
  const reserved = new Set<string>();

  const reserve = (x: number, y: number) => {
    reserved.add(`${x}:${y}`);
  };

  const markFinder = (xOffset: number, yOffset: number) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        reserve(xOffset + x, yOffset + y);
      }
    }
    setFinderPattern(matrix, xOffset, yOffset);
  };

  // 3 Corner Finders
  markFinder(0, 0);
  markFinder(QR_SIZE - 7, 0);
  markFinder(0, QR_SIZE - 7);

  // Timing lines
  for (let index = 0; index < QR_SIZE; index += 1) {
    reserve(6, index);
    reserve(index, 6);
    if (index !== 6) {
      matrix[6][index] = index % 2 === 0;
      matrix[index][6] = index % 2 === 0;
    }
  }

  // Alignment pattern in bottom right
  const alignX = QR_SIZE - 9;
  const alignY = QR_SIZE - 9;
  for (let dy = 0; dy < 5; dy += 1) {
    for (let dx = 0; dx < 5; dx += 1) {
      reserve(alignX + dx, alignY + dy);
      const isBorder = dx === 0 || dx === 4 || dy === 0 || dy === 4;
      const isCenter = dx === 2 && dy === 2;
      matrix[alignY + dy][alignX + dx] = isBorder || isCenter;
    }
  }

  const random = createRandom(hashSeed(seedText));

  for (let y = 0; y < QR_SIZE; y += 1) {
    for (let x = 0; x < QR_SIZE; x += 1) {
      if (reserved.has(`${x}:${y}`)) {
        continue;
      }
      matrix[y][x] = random() < 0.47;
    }
  }

  return matrix;
};

/**
 * 康奈网络 KN Origami Ribbon Logo (1:1 像素级还原)
 */
const KnRibbonLogo = () => (
  <svg
    width="44"
    height="32"
    viewBox="0 0 56 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-[0_1px_3px_rgba(0,118,255,0.25)]"
  >
    {/* K left rounded vertical stroke */}
    <rect x="2" y="5" width="8.5" height="30" rx="4.25" fill="#0076FF" />

    {/* K upper diagonal arm */}
    <path
      d="M10.5 21L21.5 5.5C22.2 4.5 23.6 4.2 24.6 4.9L27 6.6C27.9 7.3 28.1 8.6 27.4 9.6L16.5 24L10.5 21Z"
      fill="#0069E6"
    />

    {/* K lower diagonal arm */}
    <path
      d="M13.5 18.5L25.2 33.8C26 34.8 27.4 35.1 28.4 34.3L30.5 32.7C31.4 32 31.6 30.6 30.8 29.6L19 14.5L13.5 18.5Z"
      fill="#0080FF"
    />

    {/* N folded ribbon */}
    <path
      d="M33 5.5C33 4.4 33.9 3.5 35 3.5H38C39.1 3.5 40 4.4 40 5.5V18.5L47.2 5C47.8 3.9 49.1 3.3 50.3 3.7C51.5 4.1 52.3 5.2 52.3 6.5V34.5C52.3 35.6 51.4 36.5 50.3 36.5H47.3C46.2 36.5 45.3 35.6 45.3 34.5V21.5L38.1 35C37.5 36.1 36.2 36.7 35 36.3C33.8 35.9 33 34.8 33 33.5V5.5Z"
      fill="#0076FF"
    />
  </svg>
);

/**
 * 企业微信 WeCom Logo Icon (1:1 像素级还原)
 */
const WeComIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    {/* Blue loop chat bubble */}
    <path
      d="M12 3C6.753 3 2.5 6.918 2.5 11.75C2.5 14.398 3.773 16.764 5.79 18.35L5.1 21.4C5.01 21.8 5.4 22.15 5.78 21.96L9.36 20.25C10.2 20.42 11.08 20.5 12 20.5C17.247 20.5 21.5 16.582 21.5 11.75C21.5 6.918 17.247 3 12 3Z"
      stroke="#0082EF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Inner small yellow/orange indicator circle */}
    <circle cx="15.5" cy="9.5" r="2.2" fill="#FA8C16" />
    {/* Connected green accent arc */}
    <path
      d="M9 13.5C9 13.5 10.5 15.5 13.5 15.5"
      stroke="#52C41A"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * AI Brain Capsule Pill on Left Screen Edge (1:1 还原截图中左侧边缘悬浮AI小标)
 */
const LeftEdgeAiPill = () => (
  <div
    className="absolute left-0 top-[52%] -translate-y-1/2 z-30 bg-white/95 backdrop-blur-md rounded-r-full py-2 pl-2 pr-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-l-0 border-white/90 flex items-center gap-1 cursor-pointer hover:pr-4 transition-all duration-300 group"
    title="MT智能助手"
  >
    {/* Gradient Brain Icon */}
    <div className="w-6 h-6 rounded-full flex items-center justify-center relative">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="brainGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F43F5E" />
            <stop offset="0.5" stopColor="#A855F7" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        {/* Brain Left & Right Hemispheres */}
        <path
          d="M9.5 5C8.5 4.2 7 4.2 6 5.2C4.8 6.4 4.5 8.2 5.2 9.7C4.2 10.5 3.8 12 4.3 13.3C4.8 14.5 6 15.2 7.2 15C7.2 16.5 8.5 17.8 10 17.8C10.5 17.8 10.8 17.2 10.8 17.2M14.5 5C15.5 4.2 17 4.2 18 5.2C19.2 6.4 19.5 8.2 18.8 9.7C19.8 10.5 20.2 12 19.7 13.3C19.2 14.5 18 15.2 16.8 15C16.8 16.5 15.5 17.8 14 17.8C13.5 17.8 13.2 17.2 13.2 17.2"
          stroke="url(#brainGrad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 4V18"
          stroke="url(#brainGrad)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Sparkle antenna */}
        <circle cx="12" cy="2" r="1.2" fill="#EAB308" />
      </svg>
    </div>
  </div>
);

/**
 * Enterprise QR Code Matrix Component
 */
const EnterpriseQrCode = ({
  seed,
  loginPhase,
  onRefresh,
  onClick,
}: {
  seed: number;
  loginPhase: LoginPhase;
  onRefresh: () => void;
  onClick: () => void;
}) => {
  const matrix = useMemo(() => createQrMatrix(String(seed)), [seed]);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative cursor-pointer group select-none transition-transform duration-200 hover:scale-[1.01]"
      title="点击快速模拟扫码登录"
    >
      {/* QR Code Container matching 1:1 reference */}
      <div className="w-[200px] h-[200px] p-2 bg-white rounded-lg flex items-center justify-center relative overflow-hidden border border-[#f0f0f0]">
        {/* QR Code Grid */}
        <div
          className="grid w-full h-full gap-[1.2px]"
          style={{
            gridTemplateColumns: `repeat(${QR_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {matrix.map((row, rowIndex) =>
            row.map((cell, columnIndex) => (
              <span
                key={`${rowIndex}-${columnIndex}`}
                className={`w-full h-full rounded-[0.4px] ${
                  cell ? 'bg-[#000000]' : 'bg-transparent'
                }`}
              />
            ))
          )}
        </div>

        {/* Laser scan line on hover */}
        {isHovered && loginPhase === 'waiting' && (
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#0076FF] to-transparent opacity-80 shadow-[0_0_8px_#0076FF] animate-bounce pointer-events-none" />
        )}

        {/* Phase Overlays */}
        {loginPhase !== 'waiting' && (
          <div className="absolute inset-0 bg-white/92 backdrop-blur-[2px] rounded-lg flex flex-col items-center justify-center p-3 text-center transition-all duration-300">
            {loginPhase === 'scanning' ? (
              <>
                <Loader2 className="w-9 h-9 text-[#0076FF] animate-spin mb-2" />
                <div className="text-[13.5px] font-semibold text-[#1f2329]">
                  已扫码，请在手机上确认
                </div>
                <div className="text-[11.5px] text-[#8f959e] mt-1">
                  等待移动端授权确认...
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-10 h-10 text-[#52c41a] mb-2 animate-pulse" />
                <div className="text-[14px] font-bold text-[#1f2329]">
                  登录成功
                </div>
                <div className="text-[11.5px] text-[#8f959e] mt-1">
                  正在进入系统...
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Quick Refresh Icon */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRefresh();
        }}
        className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-white border border-[#e5e7eb] text-[#8f959e] shadow-sm flex items-center justify-center hover:text-[#0076FF] hover:border-[#0076FF] transition-colors"
        title="刷新二维码"
      >
        <RotateCw className="w-3 h-3" />
      </button>
    </div>
  );
};

export const WechatQrLogin: React.FC<WechatQrLoginProps> = ({
  loginPhase,
  qrRevision,
  onRefreshQr,
  onSimulateScan,
}) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#eef4fb] flex flex-col justify-between select-none">
      {/* 1. Photorealistic 3D Glass Geometric Background Base */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: `url(${bgImage})`,
          filter: 'brightness(1.04) contrast(0.98)',
        }}
      />

      {/* 2. Soft Ambient Lighting & Glass Perspective Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#dce8f7]/50 via-white/30 to-[#eaf2fb]/60 pointer-events-none" />

      {/* 3. 3D Translucent Cyan/Blue Glass Slab in bottom-left corner (matching screenshot) */}
      <div className="absolute -bottom-16 -left-12 w-[420px] h-[320px] bg-gradient-to-tr from-[#0084ff]/30 to-[#60a5fa]/15 backdrop-blur-[2px] border-t border-r border-white/60 shadow-[0_20px_50px_rgba(0,100,220,0.12)] -rotate-12 rounded-2xl pointer-events-none hidden sm:block" />
      <div className="absolute -bottom-8 left-16 w-[340px] h-[220px] bg-gradient-to-tr from-[#0076ff]/25 to-transparent border-t border-l border-white/40 -rotate-6 rounded-xl pointer-events-none hidden sm:block" />

      {/* 4. Left Edge Floating AI Pill */}
      <LeftEdgeAiPill />

      {/* 5. Main Body Content: Left Branding & Headline, Right QR Login Card */}
      <div className="relative z-20 flex-1 w-full max-w-[1440px] mx-auto px-8 sm:px-14 lg:px-24 flex items-center justify-between">
        {/* Left Section: Logo & Headline */}
        <div className="flex flex-col justify-center">
          {/* Logo Group */}
          <div className="flex items-center gap-3.5 mb-9">
            <KnRibbonLogo />

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="text-[23px] font-bold text-[#0076FF] tracking-tight leading-none">
                  康奈网络
                </span>
                <span className="px-1.5 py-[2px] rounded-[4px] bg-[#0076FF] text-white text-[12px] font-bold tracking-wide leading-none">
                  MT
                </span>
              </div>
              <span className="text-[14px] font-medium text-[#0076FF] tracking-normal leading-none mt-1 font-sans">
                Kanne.cn
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[50px] font-bold text-[#262626] tracking-tight leading-tight">
            康奈网络MT管理系统
          </h1>
        </div>

        {/* Right Section: White Floating Enterprise Login Card */}
        <div className="flex-shrink-0">
          <div className="w-[360px] sm:w-[380px] h-[520px] bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,40,90,0.08),0_2px_10px_rgba(0,40,90,0.03)] flex flex-col items-center justify-between pt-12 pb-10 px-8 transition-all">
            {/* Header: Enterprise WeChat Icon & Title */}
            <div className="flex items-center gap-2 text-[#1f2329]">
              <WeComIcon />
              <span className="text-[16px] font-medium tracking-normal text-[#1f2329]">
                企业微信扫码登录
              </span>
            </div>

            {/* QR Code Container */}
            <div className="my-auto flex flex-col items-center">
              <EnterpriseQrCode
                seed={qrRevision}
                loginPhase={loginPhase}
                onRefresh={onRefreshQr}
                onClick={onSimulateScan}
              />
            </div>

            {/* Bottom Footer Hint */}
            <div className="text-[13px] text-[#8f959e] tracking-normal text-center">
              请使用企业微信扫描二维码登录
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
