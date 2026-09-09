import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'header';
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md'
}) => {
  // Size mapping
  const heightClass = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-10' : 'h-8';

  if (variant === 'icon') {
    // Brand blue rounded square icon with speed "速" text
    return (
      <div
        className={`relative flex items-center justify-center rounded-lg bg-[#1E5ABB] text-white font-black shadow-xs select-none overflow-hidden shrink-0 ${
          size === 'sm' ? 'w-6 h-6 text-xs' : size === 'lg' ? 'w-9 h-9 text-base' : 'w-7.5 h-7.5 text-sm'
        } ${className}`}
      >
        <div className="relative z-10 font-sans tracking-tighter drop-shadow-xs">速</div>
        {/* Speed glow effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-transparent to-cyan-400/20"></div>
      </div>
    );
  }

  if (variant === 'header') {
    // Optimized header layout: 点点速豹 Logo + system title
    return (
      <div className={`flex items-center space-x-3.5 sm:space-x-4 select-none ${className}`}>
        {/* 点点速豹 Full Logo */}
        <div className="flex items-center space-x-3">
          {/* Leopard + Geodesic Network Emblem SVG - Scaled to w-10 h-10 */}
          <div className="relative w-10 h-10 shrink-0 drop-shadow-2xs">
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#1E5ABB]" fill="none">
              {/* Outer Geodesic Network Polygon */}
              <polygon
                points="50,8 86,28 86,72 50,92 14,72 14,28"
                stroke="#1E5ABB"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <polygon
                points="50,22 74,36 74,64 50,78 26,64 26,36"
                stroke="#1E5ABB"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Network Connector Lines */}
              <line x1="50" y1="8" x2="50" y2="22" stroke="#1E5ABB" strokeWidth="3" />
              <line x1="86" y1="28" x2="74" y2="36" stroke="#1E5ABB" strokeWidth="3" />
              <line x1="86" y1="72" x2="74" y2="64" stroke="#1E5ABB" strokeWidth="3" />
              <line x1="50" y1="92" x2="50" y2="78" stroke="#1E5ABB" strokeWidth="3" />
              <line x1="14" y1="72" x2="26" y2="64" stroke="#1E5ABB" strokeWidth="3" />
              <line x1="14" y1="28" x2="26" y2="36" stroke="#1E5ABB" strokeWidth="3" />

              {/* Network Node Dots */}
              <circle cx="50" cy="8" r="4.5" fill="#1E5ABB" />
              <circle cx="86" cy="28" r="4.5" fill="#1E5ABB" />
              <circle cx="86" cy="72" r="4.5" fill="#1E5ABB" />
              <circle cx="50" cy="92" r="4.5" fill="#1E5ABB" />
              <circle cx="14" cy="72" r="4.5" fill="#1E5ABB" />
              <circle cx="14" cy="28" r="4.5" fill="#1E5ABB" />

              {/* Center Circle with Leopard */}
              <circle cx="50" cy="50" r="23" fill="#1E5ABB" />
              {/* White Leopard Head */}
              <path
                d="M38 36 C45 32 55 35 60 43 C62 46 61 50 58 53 C55 55 50 54 46 51 C48 56 47 61 41 63 C36 66 30 63 31 57 C32 50 35 41 38 36 Z"
                fill="#FFFFFF"
              />
              <circle cx="53" cy="42" r="1.8" fill="#1E5ABB" />
            </svg>
          </div>

          {/* Vertical Divider */}
          <div className="h-7 w-[1.5px] bg-[#1E5ABB]/30"></div>

          {/* Brand Text - Scaled to 18px font-bold */}
          <div className="flex flex-col justify-center">
            <span className="text-[18px] font-black text-[#1E5ABB] tracking-tight leading-none font-sans">
              点点速豹
            </span>
            <span className="text-xs font-bold text-[#1E5ABB]/80 font-mono tracking-wider leading-tight mt-0.5">
              subao.cn
            </span>
          </div>
        </div>

        {/* Vertical Divider separating system title */}
        <div className="h-6 w-[1.5px] bg-slate-200 ml-1"></div>

        {/* Sub-system Title - Scaled to 19px-20px font-bold */}
        <div className="flex items-center space-x-2.5">
          <h1 className="text-[19px] sm:text-[20px] font-bold text-[#1E5ABB] tracking-tight">
            舆情速报系统
          </h1>
          <span className="hidden sm:inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-md border border-slate-200">
            台中市网信办
          </span>
          <div className="hidden md:flex items-center gap-1.5 ml-1 px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-md border border-slate-200">
            <span className="px-1.5 py-0.5 bg-[#1E5ABB] text-white font-semibold rounded text-[11px] leading-tight">正式版</span>
            <span className="text-slate-700 font-mono text-xs font-medium tracking-tight">2026-09-29</span>
          </div>
        </div>
      </div>
    );
  }

  // Full brand logo (Standalone)
  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* Leopard + Network Graphic */}
      <div className={`relative shrink-0 ${heightClass} aspect-square`}>
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#1E5ABB]" fill="none">
          {/* Outer Geodesic Network Polygon */}
          <polygon
            points="50,8 86,28 86,72 50,92 14,72 14,28"
            stroke="#1E5ABB"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <polygon
            points="50,22 74,36 74,64 50,78 26,64 26,36"
            stroke="#1E5ABB"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Network Lines */}
          <line x1="50" y1="8" x2="50" y2="22" stroke="#1E5ABB" strokeWidth="3" />
          <line x1="86" y1="28" x2="74" y2="36" stroke="#1E5ABB" strokeWidth="3" />
          <line x1="86" y1="72" x2="74" y2="64" stroke="#1E5ABB" strokeWidth="3" />
          <line x1="50" y1="92" x2="50" y2="78" stroke="#1E5ABB" strokeWidth="3" />
          <line x1="14" y1="72" x2="26" y2="64" stroke="#1E5ABB" strokeWidth="3" />
          <line x1="14" y1="28" x2="26" y2="36" stroke="#1E5ABB" strokeWidth="3" />

          {/* Network Node Dots */}
          <circle cx="50" cy="8" r="4.5" fill="#1E5ABB" />
          <circle cx="86" cy="28" r="4.5" fill="#1E5ABB" />
          <circle cx="86" cy="72" r="4.5" fill="#1E5ABB" />
          <circle cx="50" cy="92" r="4.5" fill="#1E5ABB" />
          <circle cx="14" cy="72" r="4.5" fill="#1E5ABB" />
          <circle cx="14" cy="28" r="4.5" fill="#1E5ABB" />

          {/* Center Circle with Leopard */}
          <circle cx="50" cy="50" r="23" fill="#1E5ABB" />
          <path
            d="M38 36 C45 32 55 35 60 43 C62 46 61 50 58 53 C55 55 50 54 46 51 C48 56 47 61 41 63 C36 66 30 63 31 57 C32 50 35 41 38 36 Z"
            fill="#FFFFFF"
          />
          <circle cx="53" cy="42" r="1.8" fill="#1E5ABB" />
        </svg>
      </div>

      {/* Vertical Divider */}
      <div className="h-7 w-[1.5px] bg-[#1E5ABB]/35"></div>

      {/* Text Brand Section */}
      <div className="flex flex-col justify-center">
        <span className="text-base font-black text-[#1E5ABB] tracking-tight leading-none font-sans">
          点点速豹
        </span>
        <span className="text-xs font-bold text-[#1E5ABB]/80 font-mono tracking-wider leading-tight mt-0.5">
          subao.cn
        </span>
      </div>
    </div>
  );
};
