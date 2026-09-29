import React from 'react';

export function BrandLogo({ className = "h-11 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 点点速豹 几何豹头矢量图形 */}
      <div className="relative w-11 h-11 shrink-0">
        <svg viewBox="0 0 160 160" className="w-full h-full">
          {/* 外围多面体网络节点与连线 */}
          <g stroke="#1d61d6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* 外圈八边形框架 */}
            <polygon points="80,12 128,32 148,80 128,128 80,148 32,128 12,80 32,32" />
            
            {/* 内部交叉支撑线 */}
            <line x1="80" y1="12" x2="80" y2="148" />
            <line x1="12" y1="80" x2="148" y2="80" />
            <line x1="32" y1="32" x2="128" y2="128" />
            <line x1="32" y1="128" x2="128" y2="32" />
            
            {/* 内聚网格多边形 */}
            <polygon points="80,28 116,44 132,80 116,116 80,132 44,116 28,80 44,44" />
          </g>

          {/* 外圈与关键交点圆圈 */}
          <g fill="#1d61d6">
            <circle cx="80" cy="12" r="7" />
            <circle cx="128" cy="32" r="7" />
            <circle cx="148" cy="80" r="7" />
            <circle cx="128" cy="128" r="7" />
            <circle cx="80" cy="148" r="7" />
            <circle cx="32" cy="128" r="7" />
            <circle cx="12" cy="80" r="7" />
            <circle cx="32" cy="32" r="7" />

            <circle cx="116" cy="44" r="5" />
            <circle cx="116" cy="116" r="5" />
            <circle cx="44" cy="116" r="5" />
            <circle cx="44" cy="44" r="5" />
          </g>

          {/* 中心蓝色背景圆 */}
          <circle cx="80" cy="80" r="42" fill="#1d61d6" />

          {/* 纯白猎豹头部剪影 */}
          <path
            d="M 60 96 C 58 84 62 72 70 62 C 74 57 82 54 94 56 C 100 57 105 63 107 70 C 109 75 114 77 118 79 C 123 82 122 90 117 95 C 112 99 104 102 96 103 C 86 104 70 104 60 96 Z"
            fill="#ffffff"
          />
          {/* 猎豹眼部细节 */}
          <circle cx="98" cy="72" r="3" fill="#1d61d6" />
          {/* 耳朵与下颚线条 */}
          <path d="M 76 66 Q 80 61 86 64" stroke="#1d61d6" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 84 90 Q 92 92 98 89" stroke="#1d61d6" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* 竖线分割 */}
      <div className="h-8 w-[1.5px] bg-[#1d61d6]/50 rounded-full" />

      {/* 品牌文字 */}
      <div className="flex flex-col justify-center leading-none tracking-tight">
        <span className="text-xl font-black text-[#1d61d6] tracking-wider">
          点点速豹
        </span>
        <span className="text-sm font-extrabold text-[#1d61d6] tracking-normal font-sans pt-0.5">
          subao.cn
        </span>
      </div>
    </div>
  );
}
