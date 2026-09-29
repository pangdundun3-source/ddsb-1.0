import React from 'react';

interface HeaderProps {
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  return (
    <header className="h-[74px] flex items-center justify-between px-6 border-b border-blue-100 z-30 w-full fixed top-0 left-0 bg-[#e6f4ff]">
      <div className="flex items-center h-full">
        {/* Logo Area */}
        <div className="flex items-center w-[213px]">
          <div className="relative w-full h-[74px] flex items-center">
            <img
              alt="康奈网络 Logo"
              className="h-[46px] w-auto object-contain object-left"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBH46JFThd15yQFAuZsnHfmaOtDoExuPqBfNL1fnQbnR3FM2Bj-w0dzSU6l2-j6GCLfH3eAu24GJU0M7EnJS5ckRrgRoUx9S2OHZUv5poeR2n-cYy8SULFXY56ug_xB3gaG04JGyjIJLmlCs6eEQ5RC0LRyOjGGcsDHmGNz0u5n0-VWv48Z3J-GK7WXk8lNWf65KE8UMFMRqVNwMj9Ro-j6TXy_9ThQWAeUbdyM0KZFDP1wawZXCR08HnL7wbSx9j6NRLA"
              onError={(e) => {
                // Fallback text logo if URL expires
                const target = e.target as HTMLElement;
                target.style.display = 'none';
              }}
            />
            <div className="hidden text-[#005faa] font-bold text-lg tracking-tight">
              康奈网络 <span className="text-xs px-1 bg-[#1890ff] text-white rounded">MT</span>
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-[28px] w-px bg-blue-200 mx-4"></div>

        {/* App Title */}
        <div className="flex items-center">
          <div
            id="app-header-logo-icon"
            className="w-8 h-8 mr-3 shrink-0 flex items-center justify-center"
          >
            <svg
              viewBox="0 0 120 120"
              className="w-full h-full drop-shadow-xs"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Hexagon Frame */}
              <polygon
                points="60,6 106,32 106,88 60,114 14,88 14,32"
                stroke="#1863dc"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />

              {/* Inner Hexagon Frame */}
              <polygon
                points="60,18 96,38 96,82 60,102 24,82 24,38"
                stroke="#1863dc"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Interconnecting Network Struts */}
              <line x1="60" y1="6" x2="60" y2="18" stroke="#1863dc" strokeWidth="2.5" />
              <line x1="106" y1="32" x2="96" y2="38" stroke="#1863dc" strokeWidth="2.5" />
              <line x1="106" y1="88" x2="96" y2="82" stroke="#1863dc" strokeWidth="2.5" />
              <line x1="60" y1="114" x2="60" y2="102" stroke="#1863dc" strokeWidth="2.5" />
              <line x1="14" y1="88" x2="24" y2="82" stroke="#1863dc" strokeWidth="2.5" />
              <line x1="14" y1="32" x2="24" y2="38" stroke="#1863dc" strokeWidth="2.5" />

              {/* Diagonal Network Bridges */}
              <line x1="60" y1="6" x2="96" y2="38" stroke="#1863dc" strokeWidth="2" />
              <line x1="106" y1="32" x2="60" y2="18" stroke="#1863dc" strokeWidth="2" />
              <line x1="106" y1="32" x2="96" y2="82" stroke="#1863dc" strokeWidth="2" />
              <line x1="106" y1="88" x2="96" y2="38" stroke="#1863dc" strokeWidth="2" />
              <line x1="106" y1="88" x2="60" y2="102" stroke="#1863dc" strokeWidth="2" />
              <line x1="60" y1="114" x2="96" y2="82" stroke="#1863dc" strokeWidth="2" />
              <line x1="60" y1="114" x2="24" y2="82" stroke="#1863dc" strokeWidth="2" />
              <line x1="14" y1="88" x2="60" y2="102" stroke="#1863dc" strokeWidth="2" />
              <line x1="14" y1="88" x2="24" y2="38" stroke="#1863dc" strokeWidth="2" />
              <line x1="14" y1="32" x2="24" y2="82" stroke="#1863dc" strokeWidth="2" />
              <line x1="14" y1="32" x2="60" y2="18" stroke="#1863dc" strokeWidth="2" />
              <line x1="60" y1="6" x2="24" y2="38" stroke="#1863dc" strokeWidth="2" />

              {/* Nodes / Joint Dots on outer vertices */}
              <circle cx="60" cy="6" r="5.5" fill="#1863dc" />
              <circle cx="106" cy="32" r="5.5" fill="#1863dc" />
              <circle cx="106" cy="88" r="5.5" fill="#1863dc" />
              <circle cx="60" cy="114" r="5.5" fill="#1863dc" />
              <circle cx="14" cy="88" r="5.5" fill="#1863dc" />
              <circle cx="14" cy="32" r="5.5" fill="#1863dc" />

              {/* Nodes / Joint Dots on inner vertices */}
              <circle cx="60" cy="18" r="4" fill="#1863dc" />
              <circle cx="96" cy="38" r="4" fill="#1863dc" />
              <circle cx="96" cy="82" r="4" fill="#1863dc" />
              <circle cx="60" cy="102" r="4" fill="#1863dc" />
              <circle cx="24" cy="82" r="4" fill="#1863dc" />
              <circle cx="24" cy="38" r="4" fill="#1863dc" />

              {/* Central Solid Circle Background for Cheetah */}
              <circle cx="60" cy="60" r="31" fill="#1863dc" />

              {/* Cheetah Head In White Silhouette Facing Right */}
              <path
                d="M36 78 C36 63 43 51 54 44 C53 41 54 36 58 35 C61 35 63 38 64 41 C68 41 74 44 80 50 C86 54 92 57 91 62 C90 65 85 66 80 67 C76 67 74 69 72 73 C69 77 67 82 60 84 C54 86 42 86 36 78 Z"
                fill="white"
              />
              {/* Cheetah Blue Eye Detail */}
              <path
                d="M74 54 C78 54 81 57 81 57 C81 57 77 58 73 58 C72 57 72 55 74 54 Z"
                fill="#1863dc"
              />
              {/* Cheetah Blue Ear Inner Cavity */}
              <path
                d="M57 38 C59 40 58 44 56 46 C55 43 55 40 57 38 Z"
                fill="#1863dc"
              />
              {/* Cheetah Muzzle / Nose Detail */}
              <path
                d="M89 60 C90 61 90 62 88 63 C86 63 87 61 89 60 Z"
                fill="#1863dc"
              />
            </svg>
          </div>
          <h1 className="text-[18px] font-bold text-[#333333] tracking-wide">
            点点速报后台管理系统
          </h1>
        </div>
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center space-x-6 h-full">
        <div className="flex items-center space-x-3 text-right">
          <div>
            <div className="text-[14px] text-[#333333] font-medium">王飞飞</div>
            <div className="text-[12px] text-[#999999]">产品二部</div>
          </div>
          <div className="w-[32px] h-[32px] rounded-full bg-white flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
            <span className="material-symbols-outlined text-gray-400 text-[20px]">
              person
            </span>
          </div>
        </div>

        <div className="h-[20px] w-px bg-gray-300"></div>

        <button
          onClick={onLogout}
          className="flex items-center text-[#666666] hover:text-[#1890ff] transition-colors text-[14px] font-medium cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] mr-1">
            logout
          </span>
          退出
        </button>
      </div>
    </header>
  );
};
