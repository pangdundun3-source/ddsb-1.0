import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface BackNavigationBarProps {
  onBack: () => void;
  label?: string;
}

export const BackNavigationBar: React.FC<BackNavigationBarProps> = ({
  onBack,
  label = '返回上一级',
}) => {
  return (
    <div className="w-full border-b border-slate-200/80 pb-2">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex w-full items-center justify-start gap-1.5 px-0 text-[12px] font-semibold text-slate-700 cursor-pointer hover:text-slate-900 active:text-slate-950"
      >
        <ChevronLeft className="w-4 h-4 shrink-0" />
        <span>{label}</span>
      </button>
    </div>
  );
};
