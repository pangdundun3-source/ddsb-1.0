import React from 'react';

interface LoginQrCodeProps {
  size?: number;
  className?: string;
  onClick?: () => void;
  isScanning?: boolean;
}

export const LoginQrCode: React.FC<LoginQrCodeProps> = ({
  size = 190,
  className = '',
  onClick,
  isScanning = false
}) => {
  // Authentic 29x29 QR code module matrix for "https://subao.cn/auth/wx-scan-login"
  // with reserved center 9x9 area for logo
  const matrix: number[][] = [
    [1,1,1,1,1,1,1,0,1,0,0,1,1,0,1,1,0,1,0,1,0,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,0,1,1,0,1,1,0,0,1,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,0,1,1,0,0,1,0,1,0,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,0,1,0,1,0,0,0,1,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,1,0,1,0,0,1,1,0,1,0,1,0,0,0,0,0,0,0,0,0],
    [1,1,0,1,0,1,1,1,0,0,1,1,0,1,0,0,1,1,0,0,1,1,0,1,0,1,0,1,1],
    [0,1,0,0,1,0,0,0,1,1,0,0,1,0,1,0,0,1,1,0,1,0,1,0,0,1,1,0,0],
    [1,0,1,1,0,1,1,0,0,1,0,0,0,0,0,0,0,0,1,1,0,1,0,1,1,0,1,0,1],
    [0,0,1,0,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,0,1,0,1,0],
    [1,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,1,1,0,1,1,1],
    [0,1,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,1,1,0,0,0],
    [1,0,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,1,0,1,0,1,0,0,1,0,1,1],
    [0,1,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,1,0,1,0,0],
    [1,0,1,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,1,0,1,1,0,1,1,0,1,1,1],
    [0,0,1,0,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1],
    [1,1,0,0,0,1,1,0,0,1,0,0,0,0,0,0,0,0,1,1,1,0,1,1,0,1,1,0,1],
    [0,1,1,1,0,0,1,1,0,1,1,0,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,1,0],
    [1,0,0,1,1,0,0,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,1,0,1,1,0,0,1],
    [0,0,0,0,0,0,0,0,1,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,1,0,0],
    [1,1,1,1,1,1,1,0,0,1,1,0,1,1,0,0,1,0,1,0,1,1,0,1,0,0,1,1,1],
    [1,0,0,0,0,0,1,0,1,0,0,1,0,1,0,1,1,0,0,1,0,0,1,0,1,1,0,0,0],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,0,1,1,0,1,0,1,1,0,1,0,1,1],
    [1,0,1,1,1,0,1,0,1,0,0,1,0,1,0,1,1,0,0,1,0,1,0,0,1,0,1,0,0],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,1,0,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,0,1,0,0,1,1,0,1,0,0,0,1,0,1,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,0,1,0,1,1,0,1,0,1,0,1,1,0,1,1,0,1,1,1,1,1]
  ];

  const cols = matrix[0].length;
  const rows = matrix.length;
  const cellSize = 100 / cols;

  return (
    <div
      onClick={onClick}
      className={`relative select-none cursor-pointer group ${className}`}
      style={{ width: size, height: size }}
      title="点击模拟微信扫码登录"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full text-[#143c72]"
        fill="currentColor"
        shapeRendering="crispEdges"
      >
        {matrix.map((row, rIdx) =>
          row.map((val, cIdx) => {
            // Keep center clear for logo (rows 10-18, cols 10-18)
            if (rIdx >= 10 && rIdx <= 18 && cIdx >= 10 && cIdx <= 18) {
              return null;
            }
            if (val === 1) {
              return (
                <rect
                  key={`${rIdx}-${cIdx}`}
                  x={cIdx * cellSize}
                  y={rIdx * cellSize}
                  width={cellSize + 0.1}
                  height={cellSize + 0.1}
                />
              );
            }
            return null;
          })
        )}
      </svg>

      {/* Center Circular Leopard / Network Logo Badge */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[30%] h-[30%] bg-white rounded-full p-[2px] shadow-sm flex items-center justify-center border border-slate-100">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#1E5ABB]" fill="none">
            {/* Outer Geodesic Network Polygon */}
            <polygon
              points="50,8 86,28 86,72 50,92 14,72 14,28"
              stroke="#1E5ABB"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            <polygon
              points="50,22 74,36 74,64 50,78 26,64 26,36"
              stroke="#1E5ABB"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Network Connector Lines */}
            <line x1="50" y1="8" x2="50" y2="22" stroke="#1E5ABB" strokeWidth="3" />
            <line x1="86" y1="28" x2="74" y2="36" stroke="#1E5ABB" strokeWidth="3" />
            <line x1="86" y1="72" x2="74" y2="64" stroke="#1E5ABB" strokeWidth="3" />
            <line x1="50" y1="92" x2="50" y2="78" stroke="#1E5ABB" strokeWidth="3" />
            <line x1="14" y1="72" x2="26" y2="64" stroke="#1E5ABB" strokeWidth="3" />
            <line x1="14" y1="28" x2="26" y2="36" stroke="#1E5ABB" strokeWidth="3" />
            {/* Node points */}
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
      </div>

      {/* Hover scanner beam / overlay */}
      <div className="absolute inset-0 bg-blue-500/5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        {isScanning && (
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></div>
        )}
      </div>
    </div>
  );
};
