import React, { useState } from 'react';
import {
  TrendingUp,
  Building2,
  Calendar,
  Layers,
  Zap,
  Clock,
  Percent,
  CheckCircle2,
  Filter,
  BarChart2,
  Trophy,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { TimeDimension } from '../pages/Statistics';

interface AllOrgTrendSectionProps {
  timeDim?: TimeDimension;
  selectedOrgFilter?: string;
}

export const AllOrgTrendSection: React.FC<AllOrgTrendSectionProps> = ({
  timeDim = 'week',
  selectedOrgFilter = 'all'
}) => {
  // Mode: 全域综合走势 vs 重点机构对比走势
  const [chartMode, setChartMode] = useState<'macro' | 'org_compare'>('macro');

  // Toggle visible lines for Macro mode
  const [macroLines, setMacroLines] = useState({
    total: true,
    passed: true,
    rejected: false,
    directRate: true,
    passRate: true,
    avgScore: true,
    avgTime: false
  });

  // Toggle visible org lines for Top Org Compare mode
  const [orgLines, setOrgLines] = useState({
    org1: true, // 市委宣传部
    org2: true, // 市网信办
    org3: true, // 西屯网信办
    org4: true, // 大数据中心
    org5: false // 东湖宣传部
  });

  // Trend Metric for Org Comparison Mode
  const [compareMetric, setCompareMetric] = useState<'total' | 'passed' | 'directRate' | 'avgScore'>('total');

  // Realistic Macro trend data for 28 organizations (scale: ~10,480 total reports)
  const macroWeeklyData = [
    { label: '周一 (08-04)', total: 1280, passed: 1150, rejected: 85, directRate: 75.2, passRate: 89.8, avgScore: 86.5, avgTime: 14.8 },
    { label: '周二 (08-05)', total: 1420, passed: 1280, rejected: 92, directRate: 76.0, passRate: 90.1, avgScore: 87.2, avgTime: 14.2 },
    { label: '周三 (08-06)', total: 1650, passed: 1490, rejected: 110, directRate: 78.4, passRate: 90.3, avgScore: 88.6, avgTime: 13.5 },
    { label: '周四 (08-07)', total: 1560, passed: 1410, rejected: 98, directRate: 77.8, passRate: 90.4, avgScore: 88.2, avgTime: 13.6 },
    { label: '周五 (08-08)', total: 1820, passed: 1650, rejected: 125, directRate: 79.5, passRate: 90.7, avgScore: 89.5, avgTime: 12.9 },
    { label: '周六 (08-09)', total: 1320, passed: 1180, rejected: 90, directRate: 76.5, passRate: 89.4, avgScore: 87.8, avgTime: 14.5 },
    { label: '周日 (08-10)', total: 1430, passed: 1210, rejected: 180, directRate: 77.4, passRate: 89.4, avgScore: 88.5, avgTime: 13.8 }
  ];

  // Monthly aggregated trend data
  const macroMonthlyData = [
    { label: '第1周 (08/01-08/07)', total: 2450, passed: 2180, rejected: 180, directRate: 74.8, passRate: 89.0, avgScore: 86.8, avgTime: 14.9 },
    { label: '第2周 (08/08-08/14)', total: 2680, passed: 2410, rejected: 195, directRate: 76.5, passRate: 89.9, avgScore: 88.0, avgTime: 14.1 },
    { label: '第3周 (08/15-08/21)', total: 2720, passed: 2460, rejected: 190, directRate: 78.2, passRate: 90.4, avgScore: 89.2, avgTime: 13.4 },
    { label: '第4周 (08/22-08/28)', total: 2630, passed: 2320, rejected: 215, directRate: 77.4, passRate: 89.4, avgScore: 88.5, avgTime: 13.8 }
  ];

  // Top Org comparison trend data across time points
  const topOrgsTrendData = [
    {
      label: '周一',
      org1: { name: '市委宣传部', total: 210, passed: 202, directRate: 87.5, avgScore: 97.8 },
      org2: { name: '市网信办', total: 185, passed: 175, directRate: 85.0, avgScore: 95.2 },
      org3: { name: '西屯网信办', total: 150, passed: 138, directRate: 81.2, avgScore: 92.5 },
      org4: { name: '大数据中心', total: 130, passed: 118, directRate: 79.5, avgScore: 90.8 },
      org5: { name: '东湖宣传部', total: 115, passed: 101, directRate: 76.5, avgScore: 88.4 }
    },
    {
      label: '周二',
      org1: { name: '市委宣传部', total: 225, passed: 218, directRate: 88.2, avgScore: 98.0 },
      org2: { name: '市网信办', total: 190, passed: 181, directRate: 85.8, avgScore: 95.5 },
      org3: { name: '西屯网信办', total: 162, passed: 149, directRate: 82.0, avgScore: 93.0 },
      org4: { name: '大数据中心', total: 138, passed: 125, directRate: 80.5, avgScore: 91.2 },
      org5: { name: '东湖宣传部', total: 120, passed: 106, directRate: 77.0, avgScore: 88.8 }
    },
    {
      label: '周三',
      org1: { name: '市委宣传部', total: 250, passed: 242, directRate: 89.0, avgScore: 98.5 },
      org2: { name: '市网信办', total: 215, passed: 205, directRate: 86.5, avgScore: 96.0 },
      org3: { name: '西屯网信办', total: 178, passed: 165, directRate: 83.2, avgScore: 93.8 },
      org4: { name: '大数据中心', total: 155, passed: 142, directRate: 81.8, avgScore: 92.0 },
      org5: { name: '东湖宣传部', total: 135, passed: 120, directRate: 78.5, avgScore: 89.8 }
    },
    {
      label: '周四',
      org1: { name: '市委宣传部', total: 235, passed: 226, directRate: 88.4, avgScore: 98.2 },
      org2: { name: '市网信办', total: 200, passed: 190, directRate: 86.0, avgScore: 95.6 },
      org3: { name: '西屯网信办', total: 168, passed: 155, directRate: 82.4, avgScore: 93.1 },
      org4: { name: '大数据中心', total: 145, passed: 132, directRate: 80.8, avgScore: 91.4 },
      org5: { name: '东湖宣传部', total: 125, passed: 110, directRate: 77.2, avgScore: 89.0 }
    },
    {
      label: '周五',
      org1: { name: '市委宣传部', total: 270, passed: 262, directRate: 89.5, avgScore: 99.0 },
      org2: { name: '市网信办', total: 230, passed: 220, directRate: 87.2, avgScore: 96.5 },
      org3: { name: '西屯网信办', total: 195, passed: 180, directRate: 84.0, avgScore: 94.2 },
      org4: { name: '大数据中心', total: 170, passed: 156, directRate: 82.5, avgScore: 92.5 },
      org5: { name: '东湖宣传部', total: 148, passed: 132, directRate: 79.2, avgScore: 90.5 }
    },
    {
      label: '周六',
      org1: { name: '市委宣传部', total: 190, passed: 182, directRate: 88.0, avgScore: 98.1 },
      org2: { name: '市网信办', total: 160, passed: 151, directRate: 85.5, avgScore: 95.3 },
      org3: { name: '西屯网信办', total: 135, passed: 123, directRate: 81.5, avgScore: 92.6 },
      org4: { name: '大数据中心', total: 118, passed: 106, directRate: 80.0, avgScore: 90.9 },
      org5: { name: '东湖宣传部', total: 102, passed: 89, directRate: 76.8, avgScore: 88.5 }
    },
    {
      label: '周日',
      org1: { name: '市委宣传部', total: 200, passed: 188, directRate: 88.6, avgScore: 98.5 },
      org2: { name: '市网信办', total: 170, passed: 158, directRate: 86.4, avgScore: 95.8 },
      org3: { name: '西屯网信办', total: 132, passed: 120, directRate: 82.5, avgScore: 93.2 },
      org4: { name: '大数据中心', total: 124, passed: 111, directRate: 81.0, avgScore: 91.5 },
      org5: { name: '东湖宣传部', total: 105, passed: 92, directRate: 77.8, avgScore: 89.4 }
    }
  ];

  // Pick dataset based on timeDim
  const currentMacroData = (timeDim === 'month' || timeDim === 'quarter' || timeDim === 'year')
    ? macroMonthlyData
    : macroWeeklyData;

  // Flatten Top Org Data for easy Line rendering
  const formattedOrgCompareData = topOrgsTrendData.map((d) => ({
    label: d.label,
    org1: d.org1[compareMetric],
    org2: d.org2[compareMetric],
    org3: d.org3[compareMetric],
    org4: d.org4[compareMetric],
    org5: d.org5[compareMetric]
  }));

  const metricNames: Record<string, { label: string; unit: string; maxVal: number }> = {
    total: { label: '上报总量', unit: '件', maxVal: 300 },
    passed: { label: '有效采纳量', unit: '件', maxVal: 300 },
    directRate: { label: '首审直通率', unit: '%', maxVal: 100 },
    avgScore: { label: '综合考评得分', unit: '分', maxVal: 100 }
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
                全域机构指标趋势图
              </h3>
              <span className="bg-blue-100/80 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                全域 28 家机构全量走势
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              量化监测全域上报总量、有效采纳、首审直通率、响应时效及各直属/区县机构的动态效能走势
            </p>
          </div>
        </div>

        {/* View Mode Toggle & Comparison Metric Selectors */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Mode Switch: Macro Aggregated vs Top Orgs Compare */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setChartMode('macro')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-bold flex items-center space-x-1.5 ${
                chartMode === 'macro'
                  ? 'bg-[#1E5ABB] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>全域综合走势</span>
            </button>
            <button
              onClick={() => setChartMode('org_compare')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-bold flex items-center space-x-1.5 ${
                chartMode === 'org_compare'
                  ? 'bg-[#1E5ABB] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>重点机构对比走势</span>
            </button>
          </div>

          {/* Org Comparison Metric Selector (visible only when org_compare is active) */}
          {chartMode === 'org_compare' && (
            <select
              value={compareMetric}
              onChange={(e) => setCompareMetric(e.target.value as any)}
              className="bg-white border border-gray-300 text-gray-700 rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="total">对比指标: 上报总量</option>
              <option value="passed">对比指标: 有效采纳量</option>
              <option value="directRate">对比指标: 首审直通率 (%)</option>
              <option value="avgScore">对比指标: 综合考评得分</option>
            </select>
          )}
        </div>
      </div>

      {/* 2. Interactive Metric Filter Pills / Legends */}
      {chartMode === 'macro' ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="text-[11px] text-gray-500 font-medium flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>指标曲线开关:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setMacroLines(prev => ({ ...prev, total: !prev.total }))}
              className={`px-2.5 py-0.5 rounded-md border flex items-center space-x-1.5 font-medium transition-all cursor-pointer ${
                macroLines.total ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs font-bold' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#1E5ABB]"></span>
              <span>全域上报量</span>
            </button>

            <button
              onClick={() => setMacroLines(prev => ({ ...prev, passed: !prev.passed }))}
              className={`px-2.5 py-0.5 rounded-md border flex items-center space-x-1.5 font-medium transition-all cursor-pointer ${
                macroLines.passed ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs font-bold' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span>有效采纳量</span>
            </button>

            <button
              onClick={() => setMacroLines(prev => ({ ...prev, rejected: !prev.rejected }))}
              className={`px-2.5 py-0.5 rounded-md border flex items-center space-x-1.5 font-medium transition-all cursor-pointer ${
                macroLines.rejected ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-2xs font-bold' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
              <span>驳回整改量</span>
            </button>

            <button
              onClick={() => setMacroLines(prev => ({ ...prev, directRate: !prev.directRate }))}
              className={`px-2.5 py-0.5 rounded-md border flex items-center space-x-1.5 font-medium transition-all cursor-pointer ${
                macroLines.directRate ? 'bg-purple-50 text-purple-700 border-purple-300 shadow-2xs font-bold' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>
              <span>首审直通率(%)</span>
            </button>

            <button
              onClick={() => setMacroLines(prev => ({ ...prev, passRate: !prev.passRate }))}
              className={`px-2.5 py-0.5 rounded-md border flex items-center space-x-1.5 font-medium transition-all cursor-pointer ${
                macroLines.passRate ? 'bg-teal-50 text-teal-700 border-teal-300 shadow-2xs font-bold' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#0D9488]"></span>
              <span>整体采纳率(%)</span>
            </button>

            <button
              onClick={() => setMacroLines(prev => ({ ...prev, avgScore: !prev.avgScore }))}
              className={`px-2.5 py-0.5 rounded-md border flex items-center space-x-1.5 font-medium transition-all cursor-pointer ${
                macroLines.avgScore ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-2xs font-bold' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
              <span>综合考核均分</span>
            </button>

            <button
              onClick={() => setMacroLines(prev => ({ ...prev, avgTime: !prev.avgTime }))}
              className={`px-2.5 py-0.5 rounded-md border flex items-center space-x-1.5 font-medium transition-all cursor-pointer ${
                macroLines.avgTime ? 'bg-sky-50 text-sky-700 border-sky-300 shadow-2xs font-bold' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
              <span>审核响应均时(分)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="text-[11px] text-gray-500 font-medium flex items-center space-x-1">
            <Building2 className="w-3.5 h-3.5 text-gray-400" />
            <span>重点机构曲线开关:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setOrgLines(prev => ({ ...prev, org1: !prev.org1 }))}
              className={`px-2.5 py-0.5 rounded-md border flex items-center space-x-1.5 font-medium transition-all cursor-pointer ${
                orgLines.org1 ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs font-bold' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#1E5ABB]"></span>
              <span>市委宣传部 (本机构)</span>
            </button>

            <button
              onClick={() => setOrgLines(prev => ({ ...prev, org2: !prev.org2 }))}
              className={`px-2.5 py-0.5 rounded-md border flex items-center space-x-1.5 font-medium transition-all cursor-pointer ${
                orgLines.org2 ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs font-bold' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span>市网信办</span>
            </button>

            <button
              onClick={() => setOrgLines(prev => ({ ...prev, org3: !prev.org3 }))}
              className={`px-2.5 py-0.5 rounded-md border flex items-center space-x-1.5 font-medium transition-all cursor-pointer ${
                orgLines.org3 ? 'bg-purple-50 text-purple-700 border-purple-300 shadow-2xs font-bold' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>
              <span>西屯区网信办</span>
            </button>

            <button
              onClick={() => setOrgLines(prev => ({ ...prev, org4: !prev.org4 }))}
              className={`px-2.5 py-0.5 rounded-md border flex items-center space-x-1.5 font-medium transition-all cursor-pointer ${
                orgLines.org4 ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-2xs font-bold' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
              <span>市大数据中心</span>
            </button>

            <button
              onClick={() => setOrgLines(prev => ({ ...prev, org5: !prev.org5 }))}
              className={`px-2.5 py-0.5 rounded-md border flex items-center space-x-1.5 font-medium transition-all cursor-pointer ${
                orgLines.org5 ? 'bg-teal-50 text-teal-700 border-teal-300 shadow-2xs font-bold' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#0D9488]"></span>
              <span>东湖区委宣传部</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Recharts Line Chart Container */}
      <div className="h-68 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'macro' ? (
            <LineChart data={currentMacroData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="left"
                domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.25)]}
                tick={{ fontSize: 10, fill: '#64748b' }}
                unit="件"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#64748b' }}
                unit="%"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '10px',
                  fontSize: '11px',
                  boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0'
                }}
                formatter={(val: any, name: any) => {
                  if (name.includes('率') || name.includes('得分')) return [`${val}% / 分`, name];
                  if (name.includes('耗时')) return [`${val} 分钟`, name];
                  return [`${val} 件`, name];
                }}
              />
              {macroLines.total && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="total"
                  name="全域上报量"
                  stroke="#1E5ABB"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#1E5ABB', strokeWidth: 1, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              )}
              {macroLines.passed && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="passed"
                  name="有效采纳量"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10B981', strokeWidth: 1, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              )}
              {macroLines.rejected && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="rejected"
                  name="驳回整改量"
                  stroke="#EF4444"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  dot={{ r: 3, fill: '#EF4444' }}
                />
              )}
              {macroLines.directRate && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="directRate"
                  name="首审直通率"
                  stroke="#8B5CF6"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#8B5CF6' }}
                />
              )}
              {macroLines.passRate && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="passRate"
                  name="整体采纳率"
                  stroke="#0D9488"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#0D9488' }}
                />
              )}
              {macroLines.avgScore && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgScore"
                  name="综合考核均分"
                  stroke="#F59E0B"
                  strokeDasharray="3 2"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#F59E0B' }}
                />
              )}
              {macroLines.avgTime && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgTime"
                  name="审核响应均时(分)"
                  stroke="#0284C7"
                  strokeWidth={1.5}
                  dot={{ r: 3, fill: '#0284C7' }}
                />
              )}
            </LineChart>
          ) : (
            <LineChart data={formattedOrgCompareData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis
                domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]}
                tick={{ fontSize: 10, fill: '#64748b' }}
                unit={metricNames[compareMetric].unit}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '10px',
                  fontSize: '11px',
                  boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0'
                }}
                formatter={(val: any, name: any) => [`${val} ${metricNames[compareMetric].unit}`, name]}
              />
              {orgLines.org1 && (
                <Line
                  type="monotone"
                  dataKey="org1"
                  name="市委宣传部 (本机构)"
                  stroke="#1E5ABB"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#1E5ABB' }}
                  activeDot={{ r: 6 }}
                />
              )}
              {orgLines.org2 && (
                <Line
                  type="monotone"
                  dataKey="org2"
                  name="市网信办"
                  stroke="#10B981"
                  strokeWidth={2.2}
                  dot={{ r: 4, fill: '#10B981' }}
                />
              )}
              {orgLines.org3 && (
                <Line
                  type="monotone"
                  dataKey="org3"
                  name="西屯区网信办"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#8B5CF6' }}
                />
              )}
              {orgLines.org4 && (
                <Line
                  type="monotone"
                  dataKey="org4"
                  name="市大数据中心"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#F59E0B' }}
                />
              )}
              {orgLines.org5 && (
                <Line
                  type="monotone"
                  dataKey="org5"
                  name="东湖区委宣传部"
                  stroke="#0D9488"
                  strokeWidth={1.8}
                  dot={{ r: 3, fill: '#0D9488' }}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 4. Bottom Metric Insight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100">
        <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-[10px] text-gray-500 font-medium">周期峰值上报日</div>
            <div className="text-xs font-black text-blue-900 font-mono">周五 (1,820件)</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-700 font-bold flex items-center justify-end">
              <ArrowUpRight className="w-3 h-3" /> +16.7%
            </span>
            <span className="text-[9px] text-gray-400">环比增长</span>
          </div>
        </div>

        <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-[10px] text-gray-500 font-medium">全域首审直通均率</div>
            <div className="text-xs font-black text-emerald-800 font-mono">77.4%</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-700 font-bold flex items-center justify-end">
              <ArrowUpRight className="w-3 h-3" /> +2.2%
            </span>
            <span className="text-[9px] text-gray-400">质效持续攀升</span>
          </div>
        </div>

        <div className="bg-purple-50/60 p-2.5 rounded-lg border border-purple-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-[10px] text-gray-500 font-medium">平均审核流转耗时</div>
            <div className="text-xs font-black text-purple-800 font-mono">13.8 分钟/件</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-purple-700 font-bold flex items-center justify-end">
              <ArrowDownRight className="w-3 h-3" /> -1.2分
            </span>
            <span className="text-[9px] text-gray-400">响应提速</span>
          </div>
        </div>

        <div className="bg-amber-50/60 p-2.5 rounded-lg border border-amber-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-[10px] text-gray-500 font-medium">走势综合领跑主体</div>
            <div className="text-xs font-black text-amber-900 font-mono">市委宣传部</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-amber-700 font-bold font-mono">98.5分</span>
            <span className="text-[9px] text-gray-400 block">连续领跑</span>
          </div>
        </div>
      </div>
    </div>
  );
};
