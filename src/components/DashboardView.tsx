import React from 'react';
import { ChevronRight, FileText, Sparkles } from 'lucide-react';
import { REPORT_TEMPLATES } from '../data/mockData';
import { UserProfile } from '../types';

interface DashboardViewProps {
  user: UserProfile;
  onNewReport: (templateId: string) => void;
}

const cardToneClasses = [
  'from-blue-50 via-sky-50 to-cyan-50 border-blue-100 text-blue-700',
  'from-amber-50 via-orange-50 to-rose-50 border-amber-100 text-amber-700',
  'from-emerald-50 via-teal-50 to-cyan-50 border-emerald-100 text-emerald-700',
];

export const DashboardView: React.FC<DashboardViewProps> = ({ user, onNewReport }) => {
  const displayRole = user.role === '审核员' ? '审核员' : '上报员';

  return (
    <div className="flex-1 p-3 space-y-3 overflow-y-auto">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 p-4 text-white shadow-md shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute -right-6 -top-8 w-24 h-24 rounded-full border border-white/15" />
        <div className="absolute right-8 -bottom-10 w-20 h-20 rounded-full bg-white/10" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-100 shrink-0" />
              <h2 className="text-sm font-black tracking-tight truncate">选择上报模板</h2>
            </div>
            <p className="text-[11px] text-blue-50/90 mt-1 leading-relaxed">
              先选模板，再进入填报。不同场景一键直达，减少重复填写。
            </p>
          </div>
          <div className="shrink-0 rounded-full bg-white/18 border border-white/20 px-2.5 py-1">
            <span className="text-[10px] font-bold text-white/90">{displayRole}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {REPORT_TEMPLATES.map((tpl, index) => {
          const tone = cardToneClasses[index % cardToneClasses.length];
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onNewReport(tpl.id)}
              className={`w-full rounded-2xl border bg-gradient-to-r p-3.5 text-left shadow-2xs transition-all active:scale-[0.99] ${tone}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="shrink-0 rounded-xl bg-white/70 border border-white/70 p-1.5">
                      <FileText className="w-4 h-4 text-slate-700" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 truncate">{tpl.name}</h3>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-600 line-clamp-2">
                    {tpl.summaryPlaceholder.replace('例如：', '').replace('...', '')}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0 text-slate-400 mt-1" />
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-semibold text-slate-600">
                  {tpl.defaultType}
                </span>
                <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-semibold text-slate-600">
                  {tpl.defaultSource}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
