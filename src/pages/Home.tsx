import React, { useState, useMemo } from 'react';
import { PageId, ReportItem, OrgItem } from '../types';
import {
  Building2,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
  RotateCcw,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Activity,
  Layers,
  Eye,
  ListOrdered,
  Zap,
  User,
  UserCheck,
  Trophy,
  Award,
  BarChart3,
  SlidersHorizontal,
  ShieldCheck,
  ArrowUpRight,
  Calendar,
  AlertCircle,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface HomeProps {
  reports: ReportItem[];
  orgs: OrgItem[];
  onNavigate: (page: PageId) => void;
  onSelectReport: (report: ReportItem) => void;
  onSelectAudit: (report: ReportItem) => void;
  currentUser?: string;
}

// 7-day trend data for Home Workbench
const homeTrendData = [
  { day: '08-19', total: 1280, passed: 1150, directRate: 75.2, score: 86.5 },
  { day: '08-20', total: 1420, passed: 1280, directRate: 76.0, score: 87.2 },
  { day: '08-21', total: 1650, passed: 1490, directRate: 78.4, score: 88.6 },
  { day: '08-22', total: 1560, passed: 1410, directRate: 77.8, score: 88.2 },
  { day: '08-23', total: 1820, passed: 1650, directRate: 79.5, score: 89.5 },
  { day: '08-24', total: 1320, passed: 1180, directRate: 76.5, score: 87.8 },
  { day: '08-25', total: 1430, passed: 1210, directRate: 77.4, score: 88.5 }
];

// Donut breakdown for quality distribution
const qualityBreakdownData = [
  { name: '一次性直通', value: 8110, rate: '77.4%', color: '#10B981' },
  { name: '返修通过', value: 1260, rate: '12.0%', color: '#1E5ABB' },
  { name: '驳回整改', value: 780, rate: '7.4%', color: '#EF4444' },
  { name: '待审流转', value: 330, rate: '3.2%', color: '#F59E0B' }
];

// Top 5 Organization Evaluation Rankings
const topEvalOrgs = [
  { rank: 1, name: '中共台中市委宣传部', score: 98.5, directRate: 88.6, passRate: 96.2, grade: '卓越', reports: 1580, isMyOrg: true },
  { rank: 2, name: '台中市网信办', score: 95.8, directRate: 86.4, passRate: 94.8, grade: '卓越', reports: 1350, isMyOrg: false },
  { rank: 3, name: '西屯区网信办', score: 93.2, directRate: 82.5, passRate: 92.0, grade: '优秀', reports: 1120, isMyOrg: false },
  { rank: 4, name: '台中市大数据中心', score: 91.5, directRate: 81.0, passRate: 90.8, grade: '优秀', reports: 980, isMyOrg: false },
  { rank: 5, name: '东湖区委宣传部', score: 89.4, directRate: 77.8, passRate: 88.2, grade: '良好', reports: 850, isMyOrg: false }
];

// Top Stars
const topReporters = [
  { rank: 1, name: '张三 (本账号)', org: '市委宣传部', score: 98.5, count: 68, directRate: '92.6%' },
  { rank: 2, name: '李思源', org: '市网信办', score: 96.2, count: 62, directRate: '88.7%' },
  { rank: 3, name: '赵宏博', org: '西屯区网信办', score: 94.5, count: 54, directRate: '85.2%' }
];

const topAuditors = [
  { rank: 1, name: '王主任', org: '市委宣传部', score: 99.0, audited: 142, avgTime: '5.6分' },
  { rank: 2, name: '陈建国', org: '市网信办', score: 97.4, audited: 128, avgTime: '7.2分' },
  { rank: 3, name: '刘晓琴', org: '西屯区网信办', score: 95.8, audited: 115, avgTime: '8.4分' }
];

export const Home: React.FC<HomeProps> = ({
  reports,
  orgs,
  onNavigate,
  onSelectReport,
  onSelectAudit,
  currentUser = '张三'
}) => {
  // Global / MyOrg Workbench Perspective
  const [workbenchScope, setWorkbenchScope] = useState<'all' | 'my_org'>('all');
  
  // Active Right Intelligence Tab
  const [intelTab, setIntelTab] = useState<'stats' | 'evaluation'>('stats');

  // Search & Filter States for Latest Reports Flow
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('全部');
  const [selectedSource, setSelectedSource] = useState('全部');
  const [selectedStatus, setSelectedStatus] = useState('待审核');

  // Computed Pending & Highlights
  const pendingAudits = useMemo(() => {
    return reports.filter((r) => r.auditStatus === '待审核');
  }, [reports]);

  const urgentNegativeTasks = useMemo(() => {
    return reports.filter(
      (r) => r.auditStatus === '待转办' || r.auditStatus === '已转办'
    );
  }, [reports]);

  // Filtered Top 15 Reports Flow
  const filteredReportsList = useMemo(() => {
    let result = reports.filter((r) => {
      if (selectedStatus !== '全部') {
        return r.auditStatus === selectedStatus;
      }
      return r.auditStatus === '待审核';
    });

    if (result.length < 15 && selectedStatus === '全部') {
      const pendingIds = new Set(result.map((r) => r.id));
      const rest = reports.filter((r) => !pendingIds.has(r.id));
      result = [...result, ...rest];
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(term) ||
          r.author.toLowerCase().includes(term) ||
          r.organization.toLowerCase().includes(term)
      );
    }

    if (selectedType !== '全部') {
      result = result.filter((r) => r.infoType === selectedType);
    }

    if (selectedSource !== '全部') {
      result = result.filter((r) => r.source === selectedSource);
    }

    result.sort((a, b) => {
      if (a.submitTime && b.submitTime) {
        return b.submitTime.localeCompare(a.submitTime);
      }
      return b.id - a.id;
    });

    return result.slice(0, 15);
  }, [reports, searchTerm, selectedType, selectedSource, selectedStatus]);

  const handleQuickAudit = (report: ReportItem) => {
    onSelectAudit(report);
    onNavigate('audit-detail');
  };

  const handleViewDetail = (report: ReportItem) => {
    onSelectReport(report);
    onNavigate('report-detail');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-8">
      {/* 1. 顶部工作台问候与全域/机构双重视角切换条 (Workbench Header & Persona Bar) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/5 via-white to-indigo-900/5">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-gradient-to-br from-[#1E5ABB] to-[#134092] text-white rounded-xl shadow-md flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-blue-100" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                舆情速报调度指挥工作台
              </h1>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-full border border-blue-200">
                统计与考核联动
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>当前值班: <strong>{currentUser}</strong> (市委宣传部·管理员)</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>2026年8月考评周期 · 距月度封板还剩 <strong>6</strong> 天</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action & Scope Switcher Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setWorkbenchScope('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                workbenchScope === 'all'
                  ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌐 全域大盘 (28家机构)
            </button>
            <button
              onClick={() => setWorkbenchScope('my_org')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                workbenchScope === 'my_org'
                  ? 'bg-[#1E5ABB] text-white shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏛️ 中共台中市委宣传部 (本机构)
            </button>
          </div>
        </div>
      </div>

      {/* 2. 统计与考核六大核心 KPI 矩阵 (Unified KPI Metrics Matrix) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: 报送与采纳效能 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-700 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>{workbenchScope === 'all' ? '全域报送总量' : '本机构报送量'}</span>
            </span>
            <span className="px-1 py-0.2 bg-blue-50 text-blue-700 text-[10px] font-extrabold rounded">
              采纳89.4%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-xl font-black text-slate-900 font-mono">
              {workbenchScope === 'all' ? '10,480' : '1,580'}
              <span className="text-[11px] font-normal text-slate-500 ml-1">件</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold">
              有效 {workbenchScope === 'all' ? '9,370' : '1,520'}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1.5 flex justify-between font-medium">
            <span>今日 +{workbenchScope === 'all' ? '18' : '6'} 件</span>
            <span className="text-blue-600">采纳率 {workbenchScope === 'all' ? '89.4%' : '96.2%'}</span>
          </div>
        </div>

        {/* KPI 2: 首审直通与品控指标 (考核重要维度) */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-700 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>首审直通率</span>
            </span>
            <span className="px-1 py-0.2 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded">
              考核加分项
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-xl font-black text-emerald-600 font-mono">
              {workbenchScope === 'all' ? '77.4%' : '88.6%'}
            </div>
            <span className="text-[11px] text-emerald-700 font-bold">
              {workbenchScope === 'all' ? '8,110件' : '1,400件'}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1.5 flex justify-between font-medium">
            <span>返修率: {workbenchScope === 'all' ? '12.0%' : '5.2%'}</span>
            <span className="text-rose-600">驳回: {workbenchScope === 'all' ? '780' : '35'}件</span>
          </div>
        </div>

        {/* KPI 3: 考核得分与城市排位 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-1.5 bg-gradient-to-br from-amber-50/20 to-white">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-700 flex items-center space-x-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>{workbenchScope === 'all' ? '全域考核均分' : '本机构考评'}</span>
            </span>
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[10px] font-black rounded">
              {workbenchScope === 'all' ? '28机构均值' : '全市第 1 名'}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-xl font-black text-amber-600 font-mono">
              {workbenchScope === 'all' ? '88.6' : '98.5'}
              <span className="text-[11px] font-normal text-slate-500 ml-1">分</span>
            </div>
            <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 px-1 rounded">
              {workbenchScope === 'all' ? '整体良好' : '卓越评级'}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1.5 flex justify-between font-medium">
            <span>质量得分: 39.5/40</span>
            <span className="text-emerald-600">环比 +1.2分</span>
          </div>
        </div>

        {/* KPI 4: 审核响应与流转时效 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-700 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>平均审核响应</span>
            </span>
            <span className="px-1 py-0.2 bg-purple-50 text-purple-700 text-[10px] font-extrabold rounded">
              提效47.3%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-xl font-black text-purple-600 font-mono">
              {workbenchScope === 'all' ? '13.8' : '6.8'}
              <span className="text-[11px] font-normal text-slate-500 ml-1">分钟</span>
            </div>
            <span className="text-[11px] text-purple-700 font-bold">
              处理率 98.8%
            </span>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1.5 flex justify-between font-medium">
            <span>考核基准: ≤30分</span>
            <span className="text-emerald-600">全达标</span>
          </div>
        </div>

        {/* KPI 5: 队伍规模与人均产出 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-700 flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>在册业务人员</span>
            </span>
            <span className="px-1 py-0.2 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold rounded">
              98.4% 活跃
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-xl font-black text-slate-900 font-mono">
              {workbenchScope === 'all' ? '654' : '45'}
              <span className="text-[11px] font-normal text-slate-500 ml-1">人</span>
            </div>
            <span className="text-[11px] text-indigo-600 font-bold">
              人均 {workbenchScope === 'all' ? '21.6' : '49.4'}件
            </span>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1.5 flex justify-between font-medium">
            <span>上报员: {workbenchScope === 'all' ? '486' : '32'}人</span>
            <span>审核员: {workbenchScope === 'all' ? '168' : '13'}人</span>
          </div>
        </div>

        {/* KPI 6: 负面交办与闭环质效 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-700 flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>负面交办闭环</span>
            </span>
            <span className="px-1 py-0.2 bg-rose-50 text-rose-700 text-[10px] font-extrabold rounded">
              办结率95%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-xl font-black text-rose-600 font-mono">
              20
              <span className="text-[11px] font-normal text-slate-500 ml-1">件</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold">
              已办结 19 件
            </span>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1.5 flex justify-between font-medium">
            <span>在办: 1件 (未超期)</span>
            <span className="text-emerald-600">0 逾期扣分</span>
          </div>
        </div>
      </div>

      {/* 3. 中层双翼工作矩阵 (Dual-Engine Workbench Hub) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 左翼：待办研判与协同快处通道 (Action Hub - lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col space-y-3.5">
          {/* Main Quick-Action Panel */}
          <div className="bg-white rounded-2xl p-4 border border-blue-200/90 shadow-2xs space-y-3 bg-gradient-to-br from-blue-50/20 via-white to-slate-50/50">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-[#1E5ABB] text-white rounded-lg shadow-2xs">
                  <Zap className="w-4 h-4" />
                </div>
                <h2 className="text-xs font-black text-slate-900 tracking-tight">待办速报极速审核流</h2>
              </div>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-full border border-amber-200">
                待审 {pendingAudits.length} 件
              </span>
            </div>

            {/* Quick Action Card for Next Pending Report */}
            {pendingAudits.length > 0 && (
              <div className="bg-gradient-to-r from-[#1E5ABB] to-[#143B80] p-3.5 rounded-xl text-white shadow-md flex items-center justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center space-x-1.5 text-[11px] text-blue-200">
                    <span className="px-1.5 py-0.2 bg-blue-500/40 rounded text-[10px] font-bold">优先处置</span>
                    <span className="truncate">{pendingAudits[0].organization} · {pendingAudits[0].author}</span>
                  </div>
                  <div className="text-xs font-bold text-white truncate max-w-xs sm:max-w-sm">
                    {pendingAudits[0].title}
                  </div>
                </div>
                <button
                  onClick={() => handleQuickAudit(pendingAudits[0])}
                  className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-lg shadow transition-all cursor-pointer flex items-center space-x-1 shrink-0 active:scale-95"
                >
                  <span>立即审核</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Top 3 Pending Fast Queue with Score & SLA Tags */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-bold text-slate-500 flex justify-between items-center">
                <span>待审速报线索待办队列:</span>
                <button
                  onClick={() => onNavigate('report-audit')}
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-0.5 text-[10px] font-bold cursor-pointer"
                >
                  <span>查看全部审核</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {pendingAudits.slice(0, 3).map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => handleQuickAudit(item)}
                  className="p-2.5 bg-slate-50/80 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-300 rounded-xl transition-all flex items-center justify-between gap-2.5 cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 group-hover:bg-[#1E5ABB] group-hover:text-white text-[10px] font-black flex items-center justify-center shrink-0 transition-colors">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-blue-900 truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span className="text-slate-600 font-medium">{item.organization}</span>
                        <span>•</span>
                        <span>{item.infoType}</span>
                        <span>•</span>
                        <span className="text-amber-600 font-semibold">{item.submitTime?.slice(11, 16) || '刚刚'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200">
                      直通+2
                    </span>
                    <button className="p-1 text-slate-400 group-hover:text-blue-600 transition-colors">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Negative Urgent Task Alert */}
            {urgentNegativeTasks.length > 0 && (
              <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[11px] font-extrabold text-rose-900 truncate">
                      重点负面舆情交办追踪 ({urgentNegativeTasks.length}件在办)
                    </div>
                    <div className="text-[10px] text-rose-700">时限倒计时正常，无逾期扣分风险</div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('negative-info')}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  去交办
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 右翼：统计管理与考核管理双核分析看板 (Intel Hub - lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3.5 flex flex-col justify-between">
          {/* Header & View Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-br from-[#1E5ABB] to-indigo-700 text-white rounded-lg shadow-2xs">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>统计效能与考核风云看板</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">实时计算</span>
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
              <button
                onClick={() => setIntelTab('stats')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center space-x-1 ${
                  intelTab === 'stats'
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>效能大盘 & 走势</span>
              </button>
              <button
                onClick={() => setIntelTab('evaluation')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center space-x-1 ${
                  intelTab === 'evaluation'
                    ? 'bg-[#1E5ABB] text-white shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Trophy className="w-3 h-3" />
                <span>考核风云 & 画像</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Statistics Trend & Quality Funnel & Realtime Operations */}
          {intelTab === 'stats' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {/* Top Row: Mini Trend Chart & Quality Funnel */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Left Trend Chart */}
                <div className="md:col-span-7 h-40">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-bold text-slate-700">近 7 日全域上报与直通率走势</span>
                    <span className="text-[10px] text-blue-600 font-mono">直通率均值 77.4%</span>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={homeTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" domain={[60, 100]} tick={{ fontSize: 9, fill: '#10b981' }} unit="%" axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(val: any, name: any) => {
                          if (name === '首审直通率') return [`${val}%`, name];
                          return [`${val} 件`, name];
                        }}
                      />
                      <Line yAxisId="left" type="monotone" dataKey="total" name="上报总量" stroke="#1E5ABB" strokeWidth={2} dot={{ r: 2 }} />
                      <Line yAxisId="left" type="monotone" dataKey="passed" name="有效采纳" stroke="#6366F1" strokeWidth={2} dot={{ r: 2 }} strokeDasharray="2 2" />
                      <Line yAxisId="right" type="monotone" dataKey="directRate" name="首审直通率" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Right Quality Breakdown Donut */}
                <div className="md:col-span-5 bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-1.5">
                  <div className="text-[11px] font-extrabold text-slate-700 flex justify-between items-center">
                    <span>品控漏斗结构</span>
                    <span className="text-[10px] text-emerald-600 font-bold">高质直通 77.4%</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="w-18 h-18 relative shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={qualityBreakdownData}
                            cx="50%"
                            cy="50%"
                            innerRadius={20}
                            outerRadius={34}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {qualityBreakdownData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex-1 space-y-0.5 text-[10px]">
                      {qualityBreakdownData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                            <span className="text-slate-600">{item.name}</span>
                          </div>
                          <span className="font-mono font-bold text-slate-800">{item.rate}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Row: Operational Health Grid (Eliminates empty feel) */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                <div className="p-2 bg-blue-50/60 rounded-xl border border-blue-100/80">
                  <div className="text-[10px] text-blue-800 font-bold flex items-center justify-between">
                    <span>月度报送目标</span>
                    <span className="font-mono">87.3%</span>
                  </div>
                  <div className="w-full bg-blue-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '87.3%' }}></div>
                  </div>
                  <div className="text-[9px] text-blue-600 mt-1 flex justify-between">
                    <span>已完成 10,480 件</span>
                    <span>目标 12,000</span>
                  </div>
                </div>

                <div className="p-2 bg-emerald-50/60 rounded-xl border border-emerald-100/80">
                  <div className="text-[10px] text-emerald-800 font-bold flex items-center justify-between">
                    <span>考核达标率</span>
                    <span className="font-mono">96.4%</span>
                  </div>
                  <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '96.4%' }}></div>
                  </div>
                  <div className="text-[9px] text-emerald-600 mt-1 flex justify-between">
                    <span>27 / 28 家达标</span>
                    <span>1 家预警</span>
                  </div>
                </div>

                <div className="p-2 bg-purple-50/60 rounded-xl border border-purple-100/80">
                  <div className="text-[10px] text-purple-800 font-bold flex items-center justify-between">
                    <span>审核时效指数</span>
                    <span className="font-mono">13.8分</span>
                  </div>
                  <div className="w-full bg-purple-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: '82%' }}></div>
                  </div>
                  <div className="text-[9px] text-purple-600 mt-1 flex justify-between">
                    <span>环比提效 47.3%</span>
                    <span>基准 ≤30分</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Realtime Dynamic Feed (Ensures fresh live feeling) */}
              <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700">
                  <span className="flex items-center space-x-1">
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    <span>今日调度与采纳实时动态</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">10分钟前更新</span>
                </div>
                <div className="space-y-1 text-[10px] text-slate-600">
                  <div className="flex items-center justify-between py-0.5">
                    <span className="flex items-center space-x-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <strong className="text-slate-800">市网信办·李思源</strong>
                      <span className="truncate">报送《西屯路段道路施工民生反馈》，通过直通初审</span>
                    </span>
                    <span className="font-mono text-emerald-700 font-bold shrink-0 ml-2">直通+2分 · 09:32</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="flex items-center space-x-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                      <strong className="text-slate-800">市委宣传部·张三</strong>
                      <span className="truncate">完成《高校周边食品安全微舆情》研判流转</span>
                    </span>
                    <span className="font-mono text-blue-700 font-bold shrink-0 ml-2">时效6分 · 09:15</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Insight Bar */}
              <div className="bg-blue-50/60 p-2 rounded-lg border border-blue-100 flex items-center justify-between text-[11px] text-blue-900">
                <span className="flex items-center space-x-1.5 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate"><strong>效能洞察:</strong> 全域首审直通率攀升 <strong>+1.8%</strong>，平均耗时压降至 <strong>13.8分</strong>。</span>
                </span>
                <button
                  onClick={() => onNavigate('statistics')}
                  className="text-blue-700 font-bold hover:underline shrink-0 text-[10px] cursor-pointer ml-2"
                >
                  统计大屏 →
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Evaluation Leaderboards & Detailed Star Profiles */}
          {intelTab === 'evaluation' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Left: Top 5 Orgs Evaluation */}
                <div className="md:col-span-6 space-y-1.5">
                  <div className="text-[11px] font-extrabold text-slate-700 flex justify-between items-center">
                    <span>机构综合考评 Top 5</span>
                    <span className="text-[10px] text-indigo-600 font-bold">2026年8月期</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    {topEvalOrgs.map((org) => (
                      <div
                        key={org.name}
                        className={`p-1.5 px-2 rounded-lg flex items-center justify-between text-[11px] border ${
                          org.isMyOrg
                            ? 'bg-blue-50/90 border-blue-200 font-extrabold text-blue-950'
                            : 'bg-slate-50 border-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <span className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                            org.rank === 1 ? 'bg-amber-400 text-slate-950' : org.rank === 2 ? 'bg-slate-300 text-slate-900' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {org.rank}
                          </span>
                          <span className="truncate">{org.name}</span>
                          {org.isMyOrg && (
                            <span className="text-[9px] px-1 bg-blue-600 text-white rounded shrink-0">本机构</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[10px] text-emerald-700 font-semibold">{org.directRate}% 直通</span>
                          <span className="font-mono font-black text-amber-600 text-xs">{org.score}分</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Star Reporters & Auditors & Score Decomposition */}
                <div className="md:col-span-6 space-y-2">
                  {/* Star Reporters */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 space-y-1">
                    <div className="text-[11px] font-extrabold text-slate-700 flex justify-between items-center">
                      <span className="flex items-center space-x-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>金牌上报员 (质量考评)</span>
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">最高98.5分</span>
                    </div>
                    <div className="space-y-1">
                      {topReporters.map((r) => (
                        <div key={r.name} className="flex items-center justify-between text-[10px] py-0.5 border-b border-slate-100 last:border-0">
                          <span className="text-slate-700 font-medium truncate">{r.name} ({r.org})</span>
                          <span className="font-mono font-bold text-blue-700 shrink-0 ml-1">{r.score}分 · {r.directRate}直通</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Star Auditors */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 space-y-1">
                    <div className="text-[11px] font-extrabold text-slate-700 flex justify-between items-center">
                      <span className="flex items-center space-x-1">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>金牌审核员 (时效考评)</span>
                      </span>
                      <span className="text-[10px] text-purple-600 font-bold">均耗5.6分</span>
                    </div>
                    <div className="space-y-1">
                      {topAuditors.map((a) => (
                        <div key={a.name} className="flex items-center justify-between text-[10px] py-0.5 border-b border-slate-100 last:border-0">
                          <span className="text-slate-700 font-medium truncate">{a.name} ({a.org})</span>
                          <span className="font-mono font-bold text-emerald-700 shrink-0 ml-1">{a.score}分 · {a.avgTime}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: Score Dimension Breakdown Bar */}
              <div className="p-2 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-1.5">
                <div className="text-[10px] font-extrabold text-indigo-950 flex justify-between items-center">
                  <span>本机构考核得分构成 (总计 98.5 / 100 分 · 卓越)</span>
                  <span className="text-emerald-700 font-bold">全市第 1</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[9px]">
                  <div className="bg-white p-1.5 rounded-lg border border-indigo-100 text-center">
                    <div className="text-slate-500">报送质量 (40分)</div>
                    <div className="text-xs font-black text-indigo-700 font-mono mt-0.5">39.5 分</div>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-indigo-100 text-center">
                    <div className="text-slate-500">报送总量 (30分)</div>
                    <div className="text-xs font-black text-blue-700 font-mono mt-0.5">29.2 分</div>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-indigo-100 text-center">
                    <div className="text-slate-500">时效与交办 (30分)</div>
                    <div className="text-xs font-black text-emerald-700 font-mono mt-0.5">29.8 分</div>
                  </div>
                </div>
              </div>

              {/* Evaluation Link Bar */}
              <div className="bg-indigo-50/60 p-2 rounded-lg border border-indigo-100 flex items-center justify-between text-[11px] text-indigo-950">
                <span className="truncate">
                  🎯 <strong>考核画像:</strong> 报送质量与响应时效双维度满分领跑，无违规扣分项。
                </span>
                <button
                  onClick={() => onNavigate('evaluation')}
                  className="text-indigo-700 font-bold hover:underline shrink-0 text-[10px] cursor-pointer ml-2"
                >
                  考核中心 →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. 底层数据流：最新上报信息与考核质效全景流 (Latest Reports & Quality Flow) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-0">
        {/* Table Header & Inline Search/Filter Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          <div className="flex items-center space-x-3 shrink-0">
            <div className="p-2 bg-[#1E5ABB] text-white rounded-xl shadow-2xs">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  最新上报信息流与质量调度表
                </h2>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                  展示最新 15 条
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                支持实时研判、首审直通校验、转办闭环及考评得分溯源
              </p>
            </div>
          </div>

          {/* Interactive Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Search Input */}
            <div className="relative min-w-[180px] sm:min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索标题、报送人、机构..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>

            {/* Audit Status Filter Tabs */}
            <div className="bg-slate-200/80 p-0.5 rounded-lg flex items-center font-medium text-[11px]">
              {['待审核', '已通过', '被驳回', '全部'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    selectedStatus === st
                      ? 'bg-white text-blue-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Info Type Select */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
            >
              <option value="全部">分类: 全部</option>
              <option value="突发事件">突发事件</option>
              <option value="民生诉求">民生诉求</option>
              <option value="舆情动态">舆情动态</option>
              <option value="政策解读">政策解读</option>
            </select>

            {/* Reset Button */}
            {(searchTerm || selectedType !== '全部' || selectedStatus !== '待审核') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('全部');
                  setSelectedStatus('待审核');
                }}
                className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="重置筛选"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/90 text-slate-600 text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 w-12 text-center">序号</th>
                <th className="py-2.5 px-4 min-w-[260px]">舆情速报标题</th>
                <th className="py-2.5 px-4 min-w-[130px]">报送机构 / 上报员</th>
                <th className="py-2.5 px-4 min-w-[90px]">类型 / 来源</th>
                <th className="py-2.5 px-4 min-w-[100px]">报送时间</th>
                <th className="py-2.5 px-4 min-w-[90px] text-center">流转状态</th>
                <th className="py-2.5 px-4 min-w-[90px] text-center">直通判定</th>
                <th className="py-2.5 px-4 min-w-[120px] text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredReportsList.length > 0 ? (
                filteredReportsList.map((item, index) => {
                  const isPending = item.auditStatus === '待审核';
                  const isPassed = item.auditStatus === '已通过';
                  const isRejected = item.auditStatus === '被驳回';
                  const isTransferred = item.auditStatus === '已转办' || item.auditStatus === '待转办';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                      onClick={() => handleViewDetail(item)}
                    >
                      {/* Index */}
                      <td className="py-3 px-4 text-center font-mono text-slate-400 font-medium">
                        {index + 1}
                      </td>

                      {/* Title & Preview */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                          {item.title}
                        </div>
                        {item.detailContent?.summary && (
                          <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {item.detailContent.summary}
                          </div>
                        )}
                      </td>

                      {/* Org & Reporter */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 text-[11px] truncate max-w-[140px]">
                          {item.organization}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{item.author}</span>
                        </div>
                      </td>

                      {/* Type & Source */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col space-y-1">
                          <span className={`w-fit px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            item.infoType === '突发事件'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : item.infoType === '民生诉求'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {item.infoType}
                          </span>
                          <span className="text-[10px] text-slate-400">{item.source}</span>
                        </div>
                      </td>

                      {/* Submit Time */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {item.submitTime || '2026-08-25 10:30'}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isPending && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold text-[10px] rounded-full border border-amber-200 flex items-center justify-center space-x-1 w-fit mx-auto">
                            <Clock className="w-3 h-3" />
                            <span>待审核</span>
                          </span>
                        )}
                        {isPassed && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full border border-emerald-200 flex items-center justify-center space-x-1 w-fit mx-auto">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>已采纳</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold text-[10px] rounded-full border border-rose-200 flex items-center justify-center space-x-1 w-fit mx-auto">
                            <AlertTriangle className="w-3 h-3" />
                            <span>被驳回</span>
                          </span>
                        )}
                        {isTransferred && (
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold text-[10px] rounded-full border border-purple-200 flex items-center justify-center space-x-1 w-fit mx-auto">
                            <ShieldAlert className="w-3 h-3" />
                            <span>已转办</span>
                          </span>
                        )}
                      </td>

                      {/* Direct Pass Rating */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isPassed ? (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded font-mono">
                            直通 +2
                          </span>
                        ) : isRejected ? (
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded font-mono">
                            驳回 -1
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[10px]">待定</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-1.5">
                          {isPending ? (
                            <button
                              onClick={() => handleQuickAudit(item)}
                              className="px-2.5 py-1 bg-[#1E5ABB] hover:bg-blue-700 text-white rounded text-[11px] font-bold transition-all shadow-2xs cursor-pointer flex items-center space-x-0.5 active:scale-95"
                            >
                              <span>快速审核</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleViewDetail(item)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              详情
                            </button>
                          )}

                          <button
                            onClick={() => {
                              onSelectReport(item);
                              onNavigate('negative-info');
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="不良线索交办"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-1.5">
                      <FileText className="w-8 h-8 text-slate-300" />
                      <div className="text-xs">暂无匹配的速报数据</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
