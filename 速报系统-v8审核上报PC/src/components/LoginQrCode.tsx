import React from 'react';

interface LoginQrCodeProps {
  size?: number;
  className?: string;
  onClick?: () => void;
  isScanning?: boolean;
  clickable?: boolean;
}

export const LoginQrCode: React.FC<LoginQrCodeProps> = ({
  size = 196,
  className = '',
  onClick,
  isScanning = false,
  clickable = true,
}) => {
  // 29x29 high-contrast QR code module matrix
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
  const cellSize = 100 / cols;

  return (
    <div
      onClick={onClick}
      className={`relative select-none ${clickable ? 'cursor-pointer group' : 'cursor-default'} ${className}`}
      style={{ width: size, height: size }}
      title={clickable ? '点击模拟扫码登录' : ''}
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
                  width={cellSize + 0.08}
                  height={cellSize + 0.08}
                />
              );
            }
            return null;
          })
        )}
      </svg>

      {/* Cyan horizontal scanning laser beam across QR code as in reference */}
      <div className="absolute left-[-2px] right-[-2px] top-[48%] h-[2.5px] bg-sky-400 shadow-[0_0_8px_#38bdf8,0_0_15px_#0284c7] pointer-events-none rounded-full animate-pulse" />

      {/* Center Circular Leopard / Network Logo Badge */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[28%] h-[28%] bg-white rounded-xl p-[2px] shadow-sm flex items-center justify-center border border-slate-200">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#163868]" fill="none">
            {/* Outer Geodesic Network Polygon */}
            <polygon
              points="50,8 86,28 86,72 50,92 14,72 14,28"
              stroke="#163868"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <polygon
              points="50,22 74,36 74,64 50,78 26,64 26,36"
              stroke="#163868"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="50" r="10" fill="#163868" />
            <circle cx="50" cy="50" r="4" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* Hover scanner beam / overlay */}
      {clickable && (
        <div className="absolute inset-0 bg-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none" />
      )}
    </div>
  );
};

