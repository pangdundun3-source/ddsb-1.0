import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { X, Award, CheckCircle2, TrendingUp, Building2, User, ShieldCheck, Zap, BarChart2 } from 'lucide-react';

export interface ProfileDetailData {
  id: string;
  name: string;
  type: 'org' | 'reporter' | 'auditor';
  subTitle: string;
  rank: number;
  totalScore: number;
  grade: string;
  stats: {
    label: string;
    value: string | number;
    subLabel?: string;
    isHighlight?: boolean;
  }[];
  radarData: { subject: string; value: number; fullMark: number }[];
  historyScores: { month: string; score: number }[];
  breakdown: {
    category: string;
    item: string;
    points: string;
    desc: string;
  }[];
  summaryEvaluation: string;
}

interface EvaluationProfileModalProps {
  data: ProfileDetailData | null;
  onClose: () => void;
  periodText?: string;
}

export const EvaluationProfileModal: React.FC<EvaluationProfileModalProps> = ({
  data,
  onClose,
  periodText = '本月'
}) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E5ABB] to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
              {data.type === 'org' ? (
                <Building2 className="w-6 h-6 text-amber-300" />
              ) : (
                <User className="w-6 h-6 text-amber-300" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h3 className="text-base font-extrabold text-white">{data.name}</h3>
                <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full shadow-2xs">
                  全域第 {data.rank} 名
                </span>
                <span className="bg-blue-500/60 text-white font-bold text-xs px-2 py-0.5 rounded border border-white/20">
                  {data.grade}等次
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1">
                {data.subTitle} · 考核周期: {periodText}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.stats.map((st, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200/90 text-center">
                <div className="text-[11px] text-gray-500 font-medium">{st.label}</div>
                <div className={`text-xl font-black font-mono mt-0.5 ${st.isHighlight ? 'text-[#1E5ABB]' : 'text-slate-900'}`}>
                  {st.value}
                </div>
                {st.subLabel && <div className="text-[10px] text-emerald-700 font-medium mt-0.5">{st.subLabel}</div>}
              </div>
            ))}
          </div>

          {/* Charts Row: Radar Chart + History Trend Line */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Radar Chart */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-xs font-extrabold text-gray-800 flex items-center space-x-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>综合能力多维剖析</span>
                </span>
                <span className="text-[10px] text-gray-400">满分基准 100</span>
              </div>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={data.radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar name={data.name} dataKey="value" stroke="#1E5ABB" fill="#1E5ABB" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* History Trend Line */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-xs font-extrabold text-gray-800 flex items-center space-x-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>近6期考评得分走势</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">持续攀升</span>
              </div>
              <div className="h-48 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.historyScores}>
                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="score" stroke="#1E5ABB" strokeWidth={2.5} dot={{ fill: '#1E5ABB', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Breakdown items */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-gray-800 flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>考评明细与加减分记录</span>
            </h4>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-gray-600 border-b border-slate-200">
                    <th className="py-2 px-3 font-semibold">考核项目</th>
                    <th className="py-2 px-3 font-semibold">量化指标</th>
                    <th className="py-2 px-3 font-semibold text-center">得分/增减</th>
                    <th className="py-2 px-3 font-semibold">说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.breakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-gray-800">{item.category}</td>
                      <td className="py-2 px-3 text-gray-600">{item.item}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold">
                        <span className={item.points.startsWith('+') ? 'text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded' : item.points.startsWith('-') ? 'text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded' : 'text-blue-700'}>
                          {item.points}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-500 text-[11px]">{item.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Evaluation */}
          <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
            <div className="font-extrabold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>管理研判与考评综述</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              {data.summaryEvaluation}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            关闭窗口
          </button>
        </div>
      </div>
    </div>
  );
};
