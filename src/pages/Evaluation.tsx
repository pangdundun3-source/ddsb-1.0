import React, { useState, useMemo } from 'react';
import { EvaluationItem, PageId } from '../types';
import {
  Search,
  RotateCcw,
  Calendar,
  Download,
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Building2,
  Users,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Info,
  Clock,
  Zap,
  ShieldCheck,
  BarChart3,
  ExternalLink
} from 'lucide-react';

interface EvaluationProps {
  evaluationList: EvaluationItem[];
  onNavigate?: (page: PageId) => void;
}

// Extended evaluation record interface for rich display
export interface ExtendedEvaluationRecord {
  id: string;
  rank: number;
  name: string;
  subTitle?: string; // e.g. 所属机构/角色
  dimension: 'category' | 'org' | 'person';
  totalReports: number;
  passedReports: number;
  passRate: number; // percentage value e.g. 95.2
  avgResponseMin: number; // minutes e.g. 8.5
  participants: number;
  participationRate: number; // e.g. 98.0
  bonusPoints: number; // e.g. +8
  deductPoints: number; // e.g. -2
  totalScore: number;
  grade: '卓越' | '优秀' | '良好' | '合格' | '待提升';
  trend: string; // e.g. "↑ 1", "- 持平", "↓ 1", "🥇 第1名"
  monthlyScores: number[]; // 6 months score history e.g. [92, 94, 91, 95, 96, 98]
}

// Mock extended evaluation data for the three tabs
const MOCK_CATEGORY_EVALUATION: ExtendedEvaluationRecord[] = [
  {
    id: 'cat-1',
    rank: 1,
    name: '城东区',
    subTitle: '下辖 14 个属地党政及直属机构',
    dimension: 'category',
    totalReports: 1680,
    passedReports: 1610,
    passRate: 95.8,
    avgResponseMin: 7.2,
    participants: 185,
    participationRate: 99.2,
    bonusPoints: 8,
    deductPoints: 0,
    totalScore: 97.2,
    grade: '卓越',
    trend: '↑ 1',
    monthlyScores: [93, 94, 95, 96, 96.8, 97.2]
  },
  {
    id: 'cat-2',
    rank: 2,
    name: '公安部',
    subTitle: '下辖 网安、治安、交警等 12 个支队机构',
    dimension: 'category',
    totalReports: 1520,
    passedReports: 1440,
    passRate: 94.7,
    avgResponseMin: 8.0,
    participants: 160,
    participationRate: 98.0,
    bonusPoints: 7,
    deductPoints: 0,
    totalScore: 95.8,
    grade: '卓越',
    trend: '- 持平',
    monthlyScores: [92, 93, 94, 94.5, 95, 95.8]
  },
  {
    id: 'cat-3',
    rank: 3,
    name: '城南区',
    subTitle: '下辖 11 个属地街道及职能部门',
    dimension: 'category',
    totalReports: 1340,
    passedReports: 1240,
    passRate: 92.5,
    avgResponseMin: 10.5,
    participants: 145,
    participationRate: 95.5,
    bonusPoints: 5,
    deductPoints: 1,
    totalScore: 92.6,
    grade: '优秀',
    trend: '↑ 1',
    monthlyScores: [88, 89, 90, 91, 92, 92.6]
  },
  {
    id: 'cat-4',
    rank: 4,
    name: '教育部',
    subTitle: '下辖 市属各大中专院校及宣教单位',
    dimension: 'category',
    totalReports: 1180,
    passedReports: 1070,
    passRate: 90.6,
    avgResponseMin: 12.8,
    participants: 130,
    participationRate: 92.0,
    bonusPoints: 3,
    deductPoints: 1,
    totalScore: 89.8,
    grade: '良好',
    trend: '↓ 1',
    monthlyScores: [91, 90.5, 90, 89.5, 89.8, 89.8]
  },
  {
    id: 'cat-5',
    rank: 5,
    name: '西屯区',
    subTitle: '下辖 10 个直属单位与园区管委会',
    dimension: 'category',
    totalReports: 980,
    passedReports: 875,
    passRate: 89.2,
    avgResponseMin: 14.2,
    participants: 110,
    participationRate: 88.5,
    bonusPoints: 2,
    deductPoints: 2,
    totalScore: 87.5,
    grade: '良好',
    trend: '- 持平',
    monthlyScores: [85, 86, 86.5, 87, 87.2, 87.5]
  },
  {
    id: 'cat-6',
    rank: 6,
    name: '北屯区',
    subTitle: '下辖 8 个属地乡镇与公共服务机构',
    dimension: 'category',
    totalReports: 820,
    passedReports: 710,
    passRate: 86.5,
    avgResponseMin: 16.5,
    participants: 90,
    participationRate: 84.0,
    bonusPoints: 1,
    deductPoints: 3,
    totalScore: 83.8,
    grade: '合格',
    trend: '↓ 1',
    monthlyScores: [82, 82.5, 83, 83.2, 83.5, 83.8]
  },
  {
    id: 'cat-7',
    rank: 7,
    name: '海东区',
    subTitle: '下辖 7 个属地社区与联勤综合机构',
    dimension: 'category',
    totalReports: 650,
    passedReports: 545,
    passRate: 83.8,
    avgResponseMin: 19.0,
    participants: 75,
    participationRate: 81.0,
    bonusPoints: 0,
    deductPoints: 4,
    totalScore: 81.2,
    grade: '合格',
    trend: '- 持平',
    monthlyScores: [79, 80, 80.5, 81, 81.0, 81.2]
  }
];

const MOCK_ORG_EVALUATION: ExtendedEvaluationRecord[] = [
  {
    id: 'org-1',
    rank: 1,
    name: '中共台中市委宣传部',
    subTitle: '市级党政主体',
    dimension: 'org',
    totalReports: 1580,
    passedReports: 1520,
    passRate: 96.2,
    avgResponseMin: 6.8,
    participants: 45,
    participationRate: 99.0,
    bonusPoints: 10,
    deductPoints: 0,
    totalScore: 98.0,
    grade: '卓越',
    trend: '- 持平',
    monthlyScores: [95, 96, 96.5, 97, 97.5, 98.0]
  },
  {
    id: 'org-2',
    rank: 2,
    name: '台中市网信办',
    subTitle: '网络安全与信息化主管',
    dimension: 'org',
    totalReports: 1350,
    passedReports: 1280,
    passRate: 94.8,
    avgResponseMin: 9.1,
    participants: 38,
    participationRate: 97.5,
    bonusPoints: 8,
    deductPoints: 0,
    totalScore: 95.2,
    grade: '卓越',
    trend: '↑ 1',
    monthlyScores: [92, 93, 93.5, 94, 94.8, 95.2]
  },
  {
    id: 'org-3',
    rank: 3,
    name: '西屯区宣传部',
    subTitle: '区县级网信单位',
    dimension: 'org',
    totalReports: 1120,
    passedReports: 1030,
    passRate: 92.0,
    avgResponseMin: 11.4,
    participants: 28,
    participationRate: 94.0,
    bonusPoints: 5,
    deductPoints: 1,
    totalScore: 91.6,
    grade: '优秀',
    trend: '↓ 1',
    monthlyScores: [93, 92.5, 92, 91.8, 91.5, 91.6]
  },
  {
    id: 'org-4',
    rank: 4,
    name: '北屯区宣传部',
    subTitle: '区县级网信单位',
    dimension: 'org',
    totalReports: 980,
    passedReports: 890,
    passRate: 90.8,
    avgResponseMin: 13.5,
    participants: 25,
    participationRate: 91.0,
    bonusPoints: 3,
    deductPoints: 2,
    totalScore: 88.9,
    grade: '良好',
    trend: '↑ 1',
    monthlyScores: [85, 86, 87, 87.5, 88.2, 88.9]
  },
  {
    id: 'org-5',
    rank: 5,
    name: '南屯区宣传部',
    subTitle: '区县级网信单位',
    dimension: 'org',
    totalReports: 850,
    passedReports: 750,
    passRate: 88.2,
    avgResponseMin: 16.0,
    participants: 22,
    participationRate: 88.0,
    bonusPoints: 2,
    deductPoints: 3,
    totalScore: 85.5,
    grade: '良好',
    trend: '↓ 1',
    monthlyScores: [88, 87, 86.5, 86, 85.8, 85.5]
  },
  {
    id: 'org-6',
    rank: 6,
    name: '市公安局网安支队',
    subTitle: '直属协同部门',
    dimension: 'org',
    totalReports: 720,
    passedReports: 630,
    passRate: 87.5,
    avgResponseMin: 14.2,
    participants: 18,
    participationRate: 85.0,
    bonusPoints: 1,
    deductPoints: 2,
    totalScore: 84.0,
    grade: '合格',
    trend: '- 持平',
    monthlyScores: [82, 82.5, 83, 83.2, 83.8, 84.0]
  }
];

const MOCK_PERSON_EVALUATION: ExtendedEvaluationRecord[] = [
  {
    id: 'per-1',
    rank: 1,
    name: '张建国',
    subTitle: '管理员 · 市委宣传部',
    dimension: 'person',
    totalReports: 320,
    passedReports: 312,
    passRate: 97.5,
    avgResponseMin: 5.2,
    participants: 1,
    participationRate: 100,
    bonusPoints: 8,
    deductPoints: 0,
    totalScore: 98.5,
    grade: '卓越',
    trend: '🥇 榜首',
    monthlyScores: [96, 96.5, 97, 97.8, 98, 98.5]
  },
  {
    id: 'per-2',
    rank: 2,
    name: '李华',
    subTitle: '上报员 · 市网信办',
    dimension: 'person',
    totalReports: 285,
    passedReports: 272,
    passRate: 95.4,
    avgResponseMin: 7.1,
    participants: 1,
    participationRate: 100,
    bonusPoints: 6,
    deductPoints: 0,
    totalScore: 96.2,
    grade: '卓越',
    trend: '🥈 榜眼',
    monthlyScores: [93, 94, 94.5, 95, 95.8, 96.2]
  },
  {
    id: 'per-3',
    rank: 3,
    name: '王伟',
    subTitle: '审核员 · 市委宣传部',
    dimension: 'person',
    totalReports: 260,
    passedReports: 244,
    passRate: 93.8,
    avgResponseMin: 8.5,
    participants: 1,
    participationRate: 100,
    bonusPoints: 4,
    deductPoints: 1,
    totalScore: 93.8,
    grade: '优秀',
    trend: '🥉 探花',
    monthlyScores: [90, 91, 92, 92.5, 93, 93.8]
  },
  {
    id: 'per-4',
    rank: 4,
    name: '赵强',
    subTitle: '上报员 · 西屯区',
    dimension: 'person',
    totalReports: 210,
    passedReports: 192,
    passRate: 91.4,
    avgResponseMin: 10.2,
    participants: 1,
    participationRate: 98,
    bonusPoints: 3,
    deductPoints: 1,
    totalScore: 90.5,
    grade: '优秀',
    trend: '↑ 2',
    monthlyScores: [86, 87.5, 88, 89, 89.8, 90.5]
  },
  {
    id: 'per-5',
    rank: 5,
    name: '陈明',
    subTitle: '上报员 · 南屯区宣传部',
    dimension: 'person',
    totalReports: 180,
    passedReports: 160,
    passRate: 88.9,
    avgResponseMin: 12.0,
    participants: 1,
    participationRate: 95,
    bonusPoints: 2,
    deductPoints: 2,
    totalScore: 86.8,
    grade: '良好',
    trend: '↓ 1',
    monthlyScores: [89, 88.5, 88, 87.5, 87, 86.8]
  },
  {
    id: 'per-6',
    rank: 6,
    name: '林十二',
    subTitle: '信息员 · 北屯区宣传部',
    dimension: 'person',
    totalReports: 155,
    passedReports: 136,
    passRate: 87.7,
    avgResponseMin: 14.5,
    participants: 1,
    participationRate: 92,
    bonusPoints: 1,
    deductPoints: 2,
    totalScore: 84.2,
    grade: '合格',
    trend: '- 持平',
    monthlyScores: [82, 82.5, 83, 83.5, 83.8, 84.2]
  }
];

export const Evaluation: React.FC<EvaluationProps> = ({ onNavigate }) => {
  // State variables
  const [activeTab, setActiveTab] = useState<'category' | 'org' | 'person'>('category');
  const [dateRangePreset, setDateRangePreset] = useState<'month' | 'quarter' | 'year' | 'custom'>('month');
  const [dateRangeText, setDateRangeText] = useState('2026-08-01 至 2026-08-31');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('全部');
  const [sortByScore, setSortByScore] = useState<'desc' | 'asc'>('desc');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Detail Modal State
  const [selectedDetailRecord, setSelectedDetailRecord] = useState<ExtendedEvaluationRecord | null>(null);

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Get raw records based on current tab
  const currentTabRecords = useMemo(() => {
    if (activeTab === 'category') return MOCK_CATEGORY_EVALUATION;
    if (activeTab === 'org') return MOCK_ORG_EVALUATION;
    return MOCK_PERSON_EVALUATION;
  }, [activeTab]);

  // Filter & Sort
  const filteredRecords = useMemo(() => {
    return currentTabRecords
      .filter((rec) => {
        const matchesKey =
          !searchKeyword ||
          rec.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          (rec.subTitle && rec.subTitle.toLowerCase().includes(searchKeyword.toLowerCase()));
        const matchesGrade = selectedGradeFilter === '全部' || rec.grade === selectedGradeFilter;
        return matchesKey && matchesGrade;
      })
      .sort((a, b) => {
        return sortByScore === 'desc' ? b.totalScore - a.totalScore : a.totalScore - b.totalScore;
      });
  }, [currentTabRecords, searchKeyword, selectedGradeFilter, sortByScore]);

  // KPI Summary stats
  const kpiStats = useMemo(() => {
    const totalReportsSum = currentTabRecords.reduce((acc, r) => acc + r.totalReports, 0);
    const passedReportsSum = currentTabRecords.reduce((acc, r) => acc + r.passedReports, 0);
    const avgScore = (
      currentTabRecords.reduce((acc, r) => acc + r.totalScore, 0) / currentTabRecords.length
    ).toFixed(1);
    const overallPassRate = ((passedReportsSum / (totalReportsSum || 1)) * 100).toFixed(1);
    const topPerformer = currentTabRecords[0];

    return {
      totalReportsSum,
      passedReportsSum,
      avgScore,
      overallPassRate,
      topPerformerName: topPerformer?.name || '中共台中市委宣传部',
      topPerformerScore: topPerformer?.totalScore || 98.0
    };
  }, [currentTabRecords]);

  // Handle Export report
  const handleExport = () => {
    const tabLabel = activeTab === 'category' ? '分类' : activeTab === 'org' ? '机构' : '人员';
    showToast(`成功导出【${tabLabel}考核统计分析表_${dateRangeText.slice(0, 7)}.xlsx】`);
  };

  // Handle Date Preset Click
  const handlePresetDate = (preset: 'month' | 'quarter' | 'year') => {
    setDateRangePreset(preset);
    if (preset === 'month') setDateRangeText('2026-08-01 至 2026-08-31');
    if (preset === 'quarter') setDateRangeText('2026-07-01 至 2026-09-30');
    if (preset === 'year') setDateRangeText('2026-01-01 至 2026-12-31');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-10">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-lg border border-blue-400/30 flex items-center space-x-2 text-xs animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* FILTER & EXPORT BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200/90 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Quick Date Presets & Date Range Box */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-gray-600 font-bold flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>考核统计时间:</span>
            </span>

            {/* Quick Date Presets */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-gray-600 font-medium">
              <button
                onClick={() => handlePresetDate('month')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  dateRangePreset === 'month' ? 'bg-white text-[#1E5ABB] font-bold shadow-2xs' : 'hover:text-gray-900'
                }`}
              >
                本月
              </button>
              <button
                onClick={() => handlePresetDate('quarter')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  dateRangePreset === 'quarter' ? 'bg-white text-[#1E5ABB] font-bold shadow-2xs' : 'hover:text-gray-900'
                }`}
              >
                本季度
              </button>
              <button
                onClick={() => handlePresetDate('year')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  dateRangePreset === 'year' ? 'bg-white text-[#1E5ABB] font-bold shadow-2xs' : 'hover:text-gray-900'
                }`}
              >
                年度
              </button>
            </div>

            {/* Date Range Box */}
            <div className="relative flex items-center bg-white border border-gray-300 rounded-lg px-3 py-1.5 shadow-2xs text-gray-700">
              <input
                type="text"
                value={dateRangeText}
                onChange={(e) => {
                  setDateRangeText(e.target.value);
                  setDateRangePreset('custom');
                }}
                className="w-44 focus:outline-none font-mono text-xs text-gray-800"
              />
            </div>
          </div>

          {/* Export Report Button */}
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-lg shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>导出考核报表</span>
          </button>
        </div>

        {/* TOP 4 EXECUTIVE KPI SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1 border-t border-gray-100">
          {/* Card 1: 综合考评平均分 */}
          <div className="bg-gradient-to-br from-blue-50/60 via-white to-blue-50/20 p-3.5 rounded-xl border border-blue-100/90 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span className="flex items-center space-x-1.5 text-blue-900 font-bold">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>综合考评平均分</span>
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold border border-emerald-200">
                ↑ 较上期 +3.2%
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-[#1E5ABB] font-mono tracking-tight">
                {kpiStats.avgScore}
                <span className="text-xs font-normal text-gray-500 ml-1">分</span>
              </div>
              <span className="text-xs text-blue-700 font-extrabold bg-blue-100/80 px-2 py-0.5 rounded">
                达标评级 A+
              </span>
            </div>
            <div className="w-full bg-blue-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Number(kpiStats.avgScore))}%` }}
              ></div>
            </div>
          </div>

          {/* Card 2: 本期榜首榜魁 */}
          <div className="bg-gradient-to-br from-amber-50/60 via-white to-amber-50/20 p-3.5 rounded-xl border border-amber-200/80 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span className="flex items-center space-x-1.5 text-amber-900 font-bold">
                <Award className="w-4 h-4 text-amber-600" />
                <span>榜首最高考评</span>
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold border border-amber-200">
                🥇 领跑单位
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-base font-extrabold text-gray-900 truncate max-w-[170px]" title={kpiStats.topPerformerName}>
                {kpiStats.topPerformerName}
              </div>
              <span className="text-lg font-black text-amber-700 font-mono">
                {kpiStats.topPerformerScore}分
              </span>
            </div>
            <div className="text-[11px] text-amber-800/80 flex items-center justify-between font-medium pt-0.5">
              <span>通过率: 96.2%</span>
              <span>响应耗时: 6.8分</span>
            </div>
          </div>

          {/* Card 3: 上报采纳总量 */}
          <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50/50 p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span className="flex items-center space-x-1.5 text-gray-800 font-bold">
                <Zap className="w-4 h-4 text-purple-600" />
                <span>上报与采纳总量</span>
              </span>
              <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded font-bold border border-purple-200">
                通过率 {kpiStats.overallPassRate}%
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-gray-900 font-mono tracking-tight">
                {kpiStats.totalReportsSum.toLocaleString()}
                <span className="text-xs font-normal text-gray-500 ml-1">件</span>
              </div>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                已采纳 {kpiStats.passedReportsSum.toLocaleString()}
              </span>
            </div>
            <div className="text-[11px] text-gray-500 flex items-center justify-between font-medium pt-0.5">
              <span>有效率: 92.4%</span>
              <span>无损剔除: 218件</span>
            </div>
          </div>

          {/* Card 4: 机构全员参与率 */}
          <div className="bg-gradient-to-br from-indigo-50/50 via-white to-indigo-50/20 p-3.5 rounded-xl border border-indigo-100/90 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span className="flex items-center space-x-1.5 text-indigo-900 font-bold">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>全员参与覆盖度</span>
              </span>
              <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-bold border border-indigo-200">
                活跃度高
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-indigo-950 font-mono tracking-tight">
                96.5%
              </div>
              <span className="text-xs text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                在册 285 人
              </span>
            </div>
            <div className="text-[11px] text-indigo-900/80 flex items-center justify-between font-medium pt-0.5">
              <span>全勤单位: 12个</span>
              <span>满分信息员: 8人</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER WITH THREE DIMENSION TABS & SEARCH CONTROLS */}
      <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs p-5 space-y-5">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-3 gap-3">
          <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg border border-slate-200/80 text-xs font-bold">
            <button
              onClick={() => setActiveTab('category')}
              className={`px-4 py-2 rounded-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'category'
                  ? 'bg-[#1E5ABB] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-slate-200/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>分类考核统计</span>
            </button>
            <button
              onClick={() => setActiveTab('org')}
              className={`px-4 py-2 rounded-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'org'
                  ? 'bg-[#1E5ABB] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-slate-200/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>机构考核统计</span>
            </button>
            <button
              onClick={() => setActiveTab('person')}
              className={`px-4 py-2 rounded-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'person'
                  ? 'bg-[#1E5ABB] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>人员考核统计</span>
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center space-x-2 text-xs">
            {/* Keyword Search Input */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder={
                  activeTab === 'category'
                    ? '搜索分类名称...'
                    : activeTab === 'org'
                    ? '搜索机构名称...'
                    : '搜索人员姓名/角色...'
                }
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-gray-300 rounded-lg text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white w-48 transition-all"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Grade Filter Dropdown */}
            <select
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-gray-300 rounded-lg text-gray-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
            >
              <option value="全部">全部考评等次</option>
              <option value="卓越">卓越</option>
              <option value="优秀">优秀</option>
              <option value="良好">良好</option>
              <option value="合格">合格</option>
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortByScore(sortByScore === 'desc' ? 'asc' : 'desc')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-gray-700 font-medium rounded-lg border border-slate-200 flex items-center space-x-1 cursor-pointer transition-colors"
              title="切换总分高低排序"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>{sortByScore === 'desc' ? '得分从高到低' : '得分从低到高'}</span>
            </button>

            {/* Reset Filters */}
            {(searchKeyword || selectedGradeFilter !== '全部' || sortByScore !== 'desc') && (
              <button
                onClick={() => {
                  setSearchKeyword('');
                  setSelectedGradeFilter('全部');
                  setSortByScore('desc');
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="重置筛选"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* TOP 3 PODIUM / LEADERBOARD HIGHLIGHT BANNER */}
        {filteredRecords.length >= 3 && !searchKeyword && selectedGradeFilter === '全部' && (
          <div className="bg-gradient-to-r from-slate-900 via-[#1E5ABB] to-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 text-xs">
              <div className="flex items-center space-x-2 font-extrabold text-amber-300">
                <Trophy className="w-4 h-4" />
                <span>
                  【{activeTab === 'category' ? '分类考核' : activeTab === 'org' ? '机构考核' : '人员考核'}】本期前三强领跑荣誉榜
                </span>
              </div>
              <span className="text-[11px] text-slate-300 font-mono">考核计算时间: {dateRangeText}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/* Gold Medalist (#1) */}
              <div className="bg-slate-800/90 rounded-lg p-3 border border-amber-500/40 relative overflow-hidden flex items-center space-x-3 shadow-inner">
                <div className="absolute -right-2 -bottom-2 text-amber-500/10 pointer-events-none">
                  <Trophy className="w-20 h-20" />
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 font-black text-base flex items-center justify-center shadow shrink-0">
                  🥇
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-amber-300 font-bold flex items-center space-x-1">
                    <span>第 1 名 · 冠军</span>
                  </div>
                  <div className="font-extrabold text-white text-sm truncate" title={filteredRecords[0].name}>
                    {filteredRecords[0].name}
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono mt-0.5 flex items-center justify-between">
                    <span>通过率 {filteredRecords[0].passRate}%</span>
                    <span className="font-bold text-amber-300 text-xs">{filteredRecords[0].totalScore}分</span>
                  </div>
                </div>
              </div>

              {/* Silver Medalist (#2) */}
              <div className="bg-slate-800/90 rounded-lg p-3 border border-slate-400/40 relative overflow-hidden flex items-center space-x-3 shadow-inner">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 font-black text-base flex items-center justify-center shadow shrink-0">
                  🥈
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-slate-300 font-bold">第 2 名 · 亚军</div>
                  <div className="font-extrabold text-white text-sm truncate" title={filteredRecords[1].name}>
                    {filteredRecords[1].name}
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono mt-0.5 flex items-center justify-between">
                    <span>通过率 {filteredRecords[1].passRate}%</span>
                    <span className="font-bold text-slate-200 text-xs">{filteredRecords[1].totalScore}分</span>
                  </div>
                </div>
              </div>

              {/* Bronze Medalist (#3) */}
              <div className="bg-slate-800/90 rounded-lg p-3 border border-amber-700/40 relative overflow-hidden flex items-center space-x-3 shadow-inner">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white font-black text-base flex items-center justify-center shadow shrink-0">
                  🥉
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-amber-200/90 font-bold">第 3 名 · 季军</div>
                  <div className="font-extrabold text-white text-sm truncate" title={filteredRecords[2].name}>
                    {filteredRecords[2].name}
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono mt-0.5 flex items-center justify-between">
                    <span>通过率 {filteredRecords[2].passRate}%</span>
                    <span className="font-bold text-amber-200 text-xs">{filteredRecords[2].totalScore}分</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAIN DATA TABLE */}
        <div className="overflow-x-auto rounded-lg border border-gray-200/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 text-gray-600 font-bold border-b border-gray-200/80">
                <th className="py-3 px-3 w-16 text-center">排名</th>
                <th className="py-3 px-4">
                  {activeTab === 'category' ? '分类名称' : activeTab === 'org' ? '机构名称' : '人员姓名 / 岗位'}
                </th>
                <th className="py-3 px-3 text-center">上报总数</th>
                <th className="py-3 px-3 text-center">采纳通过数</th>
                <th className="py-3 px-4">通过率 (质效)</th>
                <th className="py-3 px-3 text-center">平均响应时效</th>
                <th className="py-3 px-3 text-center">
                  {activeTab === 'person' ? '勤勉出勤率' : '全员参与率'}
                </th>
                <th className="py-3 px-3 text-center">加/扣分项</th>
                <th className="py-3 px-4 text-center">综合总分</th>
                <th className="py-3 px-3 text-center">考评等次</th>
                <th className="py-3 px-4 text-right pr-4">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-gray-400 space-y-2">
                    <Info className="w-8 h-8 mx-auto text-gray-300" />
                    <div>未找到匹配的考核记录</div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => {
                  const isTop1 = item.rank === 1;
                  const isTop2 = item.rank === 2;
                  const isTop3 = item.rank === 3;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* Rank Badge */}
                      <td className="py-3.5 px-3 text-center font-bold">
                        {isTop1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-mono text-xs">
                            🥇
                          </span>
                        ) : isTop2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-800 border border-slate-300 font-mono text-xs">
                            🥈
                          </span>
                        ) : isTop3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-900/10 text-amber-900 border border-amber-700/30 font-mono text-xs">
                            🥉
                          </span>
                        ) : (
                          <span className="font-mono text-gray-500">{item.rank}</span>
                        )}
                      </td>

                      {/* Name & Subtitle */}
                      <td className="py-3.5 px-4 font-medium text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-gray-900 text-xs group-hover:text-blue-900 transition-colors">
                            {item.name}
                          </span>
                          {item.subTitle && (
                            <span className="text-[10px] text-gray-500 bg-slate-100 px-1.5 py-0.2 rounded font-normal">
                              {item.subTitle}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Reports */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-gray-800">
                        {item.totalReports.toLocaleString()}
                      </td>

                      {/* Passed Reports */}
                      <td className="py-3.5 px-3 text-center font-mono text-emerald-700 font-bold">
                        {item.passedReports.toLocaleString()}
                      </td>

                      {/* Pass Rate Bar */}
                      <td className="py-3.5 px-4 min-w-[130px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-mono font-bold text-gray-800">{item.passRate}%</span>
                            <span className="text-[10px] text-gray-400">率值</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.passRate >= 95
                                  ? 'bg-emerald-500'
                                  : item.passRate >= 90
                                  ? 'bg-blue-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${item.passRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Avg Response Time */}
                      <td className="py-3.5 px-3 text-center font-mono text-gray-700">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold text-[11px]">
                          {item.avgResponseMin} 分钟
                        </span>
                      </td>

                      {/* Participation Rate */}
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-gray-700">
                        {item.participationRate}%
                      </td>

                      {/* Bonus/Deduction */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center space-x-1 text-[10px]">
                          {item.bonusPoints > 0 && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-mono font-bold">
                              +{item.bonusPoints}
                            </span>
                          )}
                          {item.deductPoints > 0 ? (
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded font-mono font-bold">
                              -{item.deductPoints}
                            </span>
                          ) : (
                            item.bonusPoints === 0 && <span className="text-gray-400 font-mono">0</span>
                          )}
                        </div>
                      </td>

                      {/* Total Score */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-black text-sm text-[#1E5ABB]">
                          {item.totalScore}
                        </span>
                      </td>

                      {/* Grade Badge */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${
                            item.grade === '卓越'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : item.grade === '优秀'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : item.grade === '良好'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-slate-100 text-slate-800 border-slate-300'
                          }`}
                        >
                          {item.grade}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right pr-4">
                        <button
                          onClick={() => setSelectedDetailRecord(item)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1E5ABB] font-bold rounded text-xs transition-colors cursor-pointer flex items-center space-x-1 ml-auto"
                        >
                          <span>查看详情</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* BOTTOM FOOTNOTE BANNER */}
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-gray-500 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>考评统计说明：</strong> 本表汇总展示各区域、部门辖下机构的上报通过率、平均响应时效及勤勉参与度综合量化指标。
          </span>
        </div>
      </div>

      {/* EVALUATION DETAIL & DRILLDOWN MODAL */}
      {selectedDetailRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-150 space-y-0">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#1E5ABB] to-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
                  <Trophy className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-extrabold text-white">
                      {selectedDetailRecord.name}
                    </h3>
                    <span className="bg-amber-400 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full shadow-2xs">
                      第 {selectedDetailRecord.rank} 名
                    </span>
                  </div>
                  <p className="text-xs text-blue-200 mt-0.5">
                    {selectedDetailRecord.subTitle || '考核研判与得分明细拆解'} · 考评区间 {dateRangeText}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetailRecord(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-xs text-gray-700 max-h-[75vh] overflow-y-auto">
              {/* Score Highlight Box */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                <div>
                  <div className="text-gray-400 text-[11px]">综合最终得分</div>
                  <div className="text-2xl font-black text-[#1E5ABB] font-mono mt-0.5">
                    {selectedDetailRecord.totalScore} <span className="text-xs font-normal">分</span>
                  </div>
                </div>
                <div className="border-x border-slate-200">
                  <div className="text-gray-400 text-[11px]">综合采纳通过率</div>
                  <div className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
                    {selectedDetailRecord.passRate}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-[11px]">考评最终等次</div>
                  <div className="mt-1">
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 text-xs">
                      {selectedDetailRecord.grade}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scoring Parameter Breakdown Bars */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-gray-900 border-b border-gray-100 pb-1.5 flex items-center space-x-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span>考核量化指标得分明细拆解</span>
                </h4>

                <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-gray-200/80">
                  {/* Parameter 1: 基础上报量分值 */}
                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span>1. 基础报送量得分 (权重 40%)</span>
                      <span className="font-mono font-bold text-gray-800">
                        {Math.min(40, (selectedDetailRecord.totalReports / 1600) * 40).toFixed(1)} / 40.0分
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (selectedDetailRecord.totalReports / 1600) * 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Parameter 2: 采纳精度与通过率 */}
                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span>2. 采纳精度与通过率 (权重 40%)</span>
                      <span className="font-mono font-bold text-gray-800">
                        {((selectedDetailRecord.passRate / 100) * 40).toFixed(1)} / 40.0分
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${selectedDetailRecord.passRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Parameter 3: 响应时效加分 */}
                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span>3. 响应时效与出勤率 (权重 20%)</span>
                      <span className="font-mono font-bold text-gray-800">
                        {((selectedDetailRecord.participationRate / 100) * 20).toFixed(1)} / 20.0分
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full"
                        style={{ width: `${selectedDetailRecord.participationRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Bonus & Deduction */}
                  <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-500">专项加减分修正：</span>
                    <div className="flex space-x-2">
                      <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold border border-emerald-200">
                        专项突发加分 +{selectedDetailRecord.bonusPoints}分
                      </span>
                      {selectedDetailRecord.deductPoints > 0 && (
                        <span className="bg-rose-50 text-rose-800 px-2 py-0.5 rounded font-mono font-bold border border-rose-200">
                          逾期驳回扣分 -{selectedDetailRecord.deductPoints}分
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Score Trend Chart */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-gray-900 border-b border-gray-100 pb-1.5 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>近 6 个月历史考评得分走势</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal">单位: 分</span>
                </h4>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-end justify-between h-32 pt-6">
                  {['3月', '4月', '5月', '6月', '7月', '8月'].map((month, idx) => {
                    const score = selectedDetailRecord.monthlyScores[idx] || 90;
                    const heightPercent = Math.max(20, ((score - 70) / 30) * 100);

                    return (
                      <div key={month} className="flex flex-col items-center flex-1 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-blue-900">{score}</span>
                        <div className="w-6 bg-blue-100 rounded-t-md overflow-hidden relative flex items-end h-20">
                          <div
                            className="w-full bg-gradient-to-t from-[#1E5ABB] to-blue-600 rounded-t-md transition-all duration-300"
                            style={{ height: `${heightPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-gray-500">{month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedDetailRecord(null)}
                className="px-5 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white font-medium rounded-lg text-xs shadow-2xs transition-colors cursor-pointer"
              >
                关闭详情
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
