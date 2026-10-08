import React from 'react';
import { Megaphone, X } from 'lucide-react';
import type { NotificationItem } from '../types';

interface AnnouncementModalProps {
  notice: NotificationItem | null;
  onClose: () => void;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ notice, onClose }) => {
  if (!notice) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF]">
              <Megaphone className="w-3 h-3" />
              <span>平台公告</span>
            </span>
            <span className="text-xs text-slate-400 tabular-nums">{notice.time}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <h3 className="font-bold text-base text-slate-900 leading-snug">{notice.title}</h3>
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/80 text-xs text-slate-700 leading-relaxed space-y-2 whitespace-pre-line">
            {notice.announcementContent || notice.content}
          </div>
          <div className="pt-2 text-right">
            <p className="text-xs font-medium text-slate-500">发布单位：市委网信办 舆情速报协同指挥中心</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{notice.time}</p>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50/60 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1E5ABB] hover:bg-[#15386a] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
};
