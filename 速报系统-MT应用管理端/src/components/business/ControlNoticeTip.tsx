import React from 'react';
import { Info } from 'lucide-react';

interface ControlNoticeTipProps {
  title: string;
  content: React.ReactNode;
}

export const ControlNoticeTip: React.FC<ControlNoticeTipProps> = ({ title, content }) => (
  <span className="relative inline-flex group">
    <button
      type="button"
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-normal text-gray-500 hover:text-[#1890ff] hover:bg-blue-50 focus:text-[#1890ff] focus:bg-blue-50 focus:outline-none transition-colors cursor-pointer"
    >
      <Info className="w-3.5 h-3.5" />
      <span>管控说明</span>
    </button>
    <span className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity absolute left-0 top-full mt-1.5 z-30 w-80 rounded-lg border border-blue-200/80 bg-white p-3 shadow-lg text-left">
      <span className="flex items-start gap-2">
        <Info className="w-4 h-4 text-[#1890ff] shrink-0 mt-0.5" />
        <span className="min-w-0">
          <span className="block text-xs font-bold text-blue-900">{title}</span>
          <span className="block mt-1 text-[11px] leading-relaxed text-gray-600">{content}</span>
        </span>
      </span>
    </span>
  </span>
);
