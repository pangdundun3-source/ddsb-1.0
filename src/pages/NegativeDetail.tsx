import React from 'react';
import { ChevronRight } from 'lucide-react';
import { PageId, ReportItem } from '../types';
import { ReportContentDisplay } from '../components/ReportContentDisplay';

interface NegativeDetailProps {
  report: ReportItem | null;
  onTransferSubmit: (id: number, opinion: string) => void;
  onNavigate: (page: PageId) => void;
}

export const NegativeDetail: React.FC<NegativeDetailProps> = ({ report, onNavigate }) => {
  if (!report) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
        <p className="text-sm">未选择不良信息记录。</p>
        <button
          onClick={() => onNavigate('negative-info')}
          className="mt-4 rounded-lg bg-[#1E5ABB] px-4 py-2 text-xs font-bold text-white"
        >
          返回不良信息库
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center space-x-1.5 rounded-lg border border-gray-200 bg-white px-5 py-3 text-xs text-gray-500 shadow-2xs">
        <button onClick={() => onNavigate('negative-info')} className="cursor-pointer hover:text-[#1E5ABB]">
          报送管理
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <button onClick={() => onNavigate('negative-info')} className="cursor-pointer hover:text-[#1E5ABB]">
          不良信息库
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="font-bold text-gray-800">详情</span>
      </div>

      <ReportContentDisplay report={report} />
    </div>
  );
};
