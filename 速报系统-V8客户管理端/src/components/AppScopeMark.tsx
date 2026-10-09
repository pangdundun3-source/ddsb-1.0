import React from 'react';

const frame = 'w-5 h-5 shrink-0';

export const AppScopeMark: React.FC<{ name: string }> = ({ name }) => {
  switch (name) {
    case '全平台（全域）':
      return (
        <svg viewBox="0 0 24 24" className={frame} aria-hidden>
          <circle cx="12" cy="12" r="8" fill="none" stroke="#E11D48" strokeWidth="1.7" />
          <ellipse cx="12" cy="12" rx="3.3" ry="8" fill="none" stroke="#E11D48" strokeWidth="1.4" />
          <path d="M4.2 12h15.6M5.4 8.4h13.2M5.4 15.6h13.2" fill="none" stroke="#E11D48" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case '点点速豹':
      return (
        <svg viewBox="0 0 100 100" className={frame} aria-hidden>
          <polygon points="50,8 86,28 86,72 50,92 14,72 14,28" fill="none" stroke="#1E5ABB" strokeWidth="6" strokeLinejoin="round" />
          <circle cx="50" cy="50" r="22" fill="#1E5ABB" />
          <path
            d="M40 38 C46 34 55 37 59 44 C61 47 60 51 57 54 C54 56 50 55 46 52 C48 57 47 62 42 64 C37 67 32 64 33 58 C34 52 37 43 40 38 Z"
            fill="#FFFFFF"
          />
          <circle cx="54" cy="44" r="2" fill="#1E5ABB" />
        </svg>
      );
    case '全球眼V8':
      return (
        <svg viewBox="0 0 24 24" className={frame} aria-hidden>
          <circle cx="12" cy="12" r="9" fill="#2DD4BF" />
          <path
            d="M12 3.2a8.8 8.8 0 0 1 0 17.6c-2.3 0-4.1-1.7-4.1-4.1 0-2 1.5-3.4 3.4-3.4 1.3 0 2.1-.8 2.1-1.8 0-2.3-2.6-3.8-5.5-3.3A8.8 8.8 0 0 1 12 3.2z"
            fill="#0F766E"
          />
          <circle cx="9.1" cy="8.3" r="1.15" fill="#FFFFFF" />
          <circle cx="15" cy="15.6" r="1.15" fill="#FFFFFF" />
        </svg>
      );
    case '新数解舆情':
      return (
        <svg viewBox="0 0 24 24" className={frame} aria-hidden>
          <circle cx="12" cy="12" r="9" fill="#F59E0B" />
          <path
            d="M15.6 8.1c-.9-1.2-2.4-1.8-3.9-1.4-1.9.4-3.1 1.8-3.1 3.4 0 1.5 1.1 2.3 2.8 2.7l1.1.3c.9.2 1.3.6 1.3 1.2 0 .8-.8 1.3-1.9 1.3-1.1 0-2-.5-2.4-1.3"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path d="M8.6 16.2c.7 1 2 1.6 3.5 1.4 1.8-.3 3-1.5 3.2-3" fill="none" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case '全网搜':
      return (
        <svg viewBox="0 0 24 24" className={frame} aria-hidden>
          <circle cx="12" cy="12" r="8" fill="none" stroke="#7C3AED" strokeWidth="1.7" />
          <ellipse cx="12" cy="12" rx="3.2" ry="8" fill="none" stroke="#7C3AED" strokeWidth="1.4" />
          <path d="M4.2 12h15.6M5.6 8.5h12.8M5.6 15.5h12.8" fill="none" stroke="#7C3AED" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case '谛听预警':
      return (
        <svg viewBox="0 0 24 24" className={frame} aria-hidden>
          <path
            d="M14.2 4.8c-3.6-1-6.8.8-7.2 4.2-.3 2.6.3 4.5 1.6 5.8.7.7.9 1.6.6 2.5-.3 1.2.5 2.2 1.8 2.2h1.3"
            fill="none"
            stroke="#D97706"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path d="M13.2 8.2c1.5.4 2.5 1.6 2.4 3.2" fill="none" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M15.6 6.4c2.4 1.2 3.6 3.4 3.2 5.8" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="11.2" cy="10.2" r="1.1" fill="#D97706" />
        </svg>
      );
    case '河图融媒体':
      return (
        <svg viewBox="0 0 24 24" className={frame} aria-hidden>
          <text x="12" y="15.5" textAnchor="middle" fill="#E11D48" fontSize="7.2" fontWeight="800" fontFamily="Arial, sans-serif">
            RMT
          </text>
        </svg>
      );
    default:
      return <span className={`${frame} rounded-full bg-slate-200`} />;
  }
};
