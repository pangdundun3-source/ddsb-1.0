import React, { useState, useMemo } from 'react';
import { PageId, ReportItem, OrgItem } from '../types';
import { IdentificationBadge } from '../components/IdentificationBadge';
import { resolveIdentification } from '../services/identificationService';
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
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface HomeProps {
  reports: ReportItem[];
  orgs: OrgItem[];
  onNavigate: (page: PageId) => void;
  onSelectReport: (report: ReportItem) => void;
  onSelectAudit: (report: ReportItem) => void;
  currentUser?: string;
}

// 7-day trend chart data matching the screenshot bottom chart
const bottomChartData = [
  { day: '08-28', submitted: 64, passed: 53, passRate: 92.8, directRate: 76.5 },
  { day: '08-29', submitted: 71, passed: 63, passRate: 93.5, directRate: 77.2 },
  { day: '08-30', submitted: 76, passed: 70, passRate: 94.1, directRate: 78.0 },
  { day: '08-31', submitted: 54, passed: 49, passRate: 92.2, directRate: 75.8 },
  { day: '09-01', submitted: 79, passed: 73, passRate: 93.8, directRate: 79.1 },
  { day: '09-02', submitted: 75, passed: 69, passRate: 93.0, directRate: 78.4 },
  { day: '09-03', submitted: 78, passed: 72, passRate: 93.3, directRate: 78.6 }
];

// Sub-org run matrix data matching the screenshot
const subOrgMatrixData = [
  { name: '北屯区宣传部', subOrgType: '区县宣传', todaySubmitted: '2 件', pendingAudit: 11, rejectedResend: 4, reporterActive: '3/9', auditorActive: '1/3', avgTime: '2小时15分' },
  { name: '市市场监管局宣教科', subOrgType: '直属部门', todaySubmitted: '4 件', pendingAudit: 6, rejectedResend: 2, reporterActive: '4/6', auditorActive: '1/2', avgTime: '1小时10分' },
  { name: '中共台中市委宣传部(本级)', subOrgType: '市级机关', todaySubmitted: '14 件', pendingAudit: 5, rejectedResend: 0, reporterActive: '6/6', auditorActive: '3/3', avgTime: '9分钟' },
  { name: '南屯区宣传部', subOrgType: '区县宣传', todaySubmitted: '8 件', pendingAudit: 4, rejectedResend: 2, reporterActive: '5/7', auditorActive: '2/2', avgTime: '56分钟' },
  { name: '西区宣传部', subOrgType: '区县宣传', todaySubmitted: '12 件', pendingAudit: 3, rejectedResend: 1, reporterActive: '8/10', auditorActive: '2/2', avgTime: '18分钟' },
  { name: '高新区管委会舆情室', subOrgType: '功能区', todaySubmitted: '6 件', pendingAudit: 3, rejectedResend: 1, reporterActive: '2/5', auditorActive: '1/2', avgTime: '35分钟' },
  { name: '台中市网信办直属队', subOrgType: '直属中枢', todaySubmitted: '9 件', pendingAudit: 2, rejectedResend: 1, reporterActive: '7/8', auditorActive: '2/2', avgTime: '14分钟' },
  { name: '市卫健委宣传处', subOrgType: '直属部门', todaySubmitted: '2 件', pendingAudit: 2, rejectedResend: 1, reporterActive: '2/5', auditorActive: '1/2', avgTime: '40分钟' },
  { name: '东湖区宣传处', subOrgType: '区县宣传', todaySubmitted: '7 件', pendingAudit: 1, rejectedResend: 0, reporterActive: '6/6', auditorActive: '2/2', avgTime: '22分钟' },
  { name: '市教育局宣教科', subOrgType: '直属部门', todaySubmitted: '3 件', pendingAudit: 1, rejectedResend: 0, reporterActive: '3/4', auditorActive: '2/2', avgTime: '25分钟' },
  { name: '市政务服务局', subOrgType: '直属部门', todaySubmitted: '1 件', pendingAudit: 1, rejectedResend: 0, reporterActive: '1/3', auditorActive: '1/1', avgTime: '30分钟' }
];

export const Home: React.FC<HomeProps> = ({
  reports,
  orgs,
  onNavigate,
  onSelectReport,
  onSelectAudit,
  currentUser = '张三'
}) => {
  const [currentTime, setCurrentTime] = useState('2026-09-04 17:25:00');
  const [subOrgSort, setSubOrgSort] = useState<'pending' | 'submitted'>('pending');
  const [todoTab, setTodoTab] = useState<'audit' | 'report'>('audit');

  const pendingAudits = useMemo(() => {
    return reports.filter((r) => r.auditStatus === '待审核');
  }, [reports]);

  const reportTodos = useMemo(() => {
    return reports.filter(
      (r) => r.auditStatus === '待审核' || r.auditStatus === '审核中' || r.auditStatus === '被驳回'
    );
  }, [reports]);

  const handleQuickAudit = (report: ReportItem) => {
    onSelectAudit(report);
    onNavigate('audit-detail');
  };

  const handleViewDetail = (report: ReportItem) => {
    onSelectReport(report);
    onNavigate('report-detail');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* 1. TOP DUAL CARDS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Card: 全域舆情调度办公台 (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1E5ABB]"></div>
              <h2 className="font-black text-slate-900 text-sm tracking-tight">全域舆情调度办公台</h2>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTime}</span>
              <button
                onClick={() => setCurrentTime(new Date().toISOString().replace('T', ' ').slice(0, 19))}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title="刷新时间"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 2x2 Quick Action Grid matching screenshot */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* 审核管理 */}
            <div
              onClick={() => onNavigate('report-audit')}
              className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1E5ABB] flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-blue-700 text-xs">审核管理</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">待审速报研判</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
            </div>

            {/* 机构人员 */}
            <div
              onClick={() => onNavigate('user-org-management')}
              className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-blue-700 text-xs">机构人员</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">11个分支节点</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
            </div>

            {/* 统计管理 */}
            <div
              onClick={() => onNavigate('statistics')}
              className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-blue-700 text-xs">统计管理</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">全域效能多维</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
            </div>

            {/* 考核管理 */}
            <div
              onClick={() => onNavigate('evaluation')}
              className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-blue-700 text-xs">考核管理</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">月度综合考评</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
            </div>
          </div>
        </div>

        {/* Right Card: 全域核心待办中心 (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
              <h2 className="font-black text-slate-900 text-sm tracking-tight">全域核心待办中心</h2>
            </div>
            <span className="text-[11px] text-slate-400">实时待办与闭环流转监控</span>
          </div>

          {/* 3 Status Summary Cards matching the screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Box 1: 待审核 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-700">待审核</div>
                  <div className="text-xl font-black text-[#1E5ABB] font-mono mt-0.5">
                    24 <span className="text-xs font-normal text-slate-500">件</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">各子机构内部初审流转中</p>
                </div>
                <button
                  onClick={() => onNavigate('report-audit')}
                  className="px-2.5 py-1 bg-[#1E5ABB] hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-all cursor-pointer"
                >
                  全域流转
                </button>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">查看子机构待办</span>
                <button
                  onClick={() => onNavigate('report-audit')}
                  className="text-[#1E5ABB] font-bold hover:underline flex items-center space-x-0.5 cursor-pointer"
                >
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Box 2: 驳回待重报 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-700">驳回待重报</div>
                  <div className="text-xl font-black text-amber-600 font-mono mt-0.5">
                    9 <span className="text-xs font-normal text-slate-500">件</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">被驳回后尚未重新报送</p>
                </div>
                <button
                  onClick={() => alert('已定位9件驳回待重报速报')}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-all cursor-pointer"
                >
                  整改跟进
                </button>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">催促重报</span>
                <button
                  onClick={() => alert('已向9家被驳回机构发送催促重报提醒通知。')}
                  className="text-amber-600 font-bold hover:underline flex items-center space-x-0.5 cursor-pointer"
                >
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Box 3: 已采纳待转办 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-700">已采纳待转办</div>
                  <div className="text-xl font-black text-purple-600 font-mono mt-0.5">
                    2 <span className="text-xs font-normal text-slate-500">件</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">采纳后需交办责任部门落实</p>
                </div>
                <button
                  onClick={() => onNavigate('negative-info')}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-all cursor-pointer"
                >
                  转办督办
                </button>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">去转办督办</span>
                <button
                  onClick={() => onNavigate('negative-info')}
                  className="text-purple-600 font-bold hover:underline flex items-center space-x-0.5 cursor-pointer"
                >
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE TWO-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: 子机构运行矩阵 (11个分支机构) (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
              <h3 className="font-black text-slate-900 text-sm tracking-tight">子机构运行矩阵</h3>
              <span className="px-2 py-0.2 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                11个分支机构
              </span>
            </div>
            <button
              onClick={() => setSubOrgSort(subOrgSort === 'pending' ? 'submitted' : 'pending')}
              className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
            >
              <span>按{subOrgSort === 'pending' ? '待审核量' : '今日上报'}排序</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/80 text-slate-600 text-[11px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">子机构名称</th>
                  <th className="py-2.5 px-3 text-center">今日上报</th>
                  <th className="py-2.5 px-3 text-center">待审核</th>
                  <th className="py-2.5 px-3 text-center">驳回待重报</th>
                  <th className="py-2.5 px-3 text-center">上报员活跃</th>
                  <th className="py-2.5 px-3 text-center">审核员活跃</th>
                  <th className="py-2.5 px-3 text-center">平均审核耗时</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {subOrgMatrixData.map((org, index) => (
                  <tr key={org.name} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center space-x-1.5 truncate max-w-[180px]">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate" title={org.name}>{org.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">{org.todaySubmitted}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 font-black rounded font-mono text-[11px]">
                        {org.pendingAudit}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-mono text-slate-600">{org.rejectedResend}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">{org.reporterActive}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">{org.auditorActive}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-rose-600 font-semibold">{org.avgTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: 审核待办列表 / 报送待办列表 (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 p-0.5 bg-slate-200/70 rounded-lg">
              <button
                onClick={() => setTodoTab('audit')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  todoTab === 'audit'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>审核待办列表</span>
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] rounded-full font-mono">
                  {pendingAudits.length}
                </span>
              </button>
              <button
                onClick={() => setTodoTab('report')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  todoTab === 'report'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>报送待办列表</span>
                <span className="px-1.5 py-0.2 bg-blue-100 text-[#1E5ABB] text-[10px] rounded-full font-mono">
                  {reportTodos.length}
                </span>
              </button>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">智能识别预判</span>
          </div>

          <div className="p-3 space-y-2.5 max-h-[460px] overflow-y-auto">
            {todoTab === 'audit' ? (
              pendingAudits.slice(0, 8).map((item) => {
                const ident = resolveIdentification(item, reports);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleQuickAudit(item)}
                    className="p-3 bg-slate-50/80 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center space-x-1.5 min-w-0 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                          {item.title}
                        </span>
                        <IdentificationBadge status={ident.status} size="xs" showIcon />
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {ident.detail?.matchReason || '该速报已提交，正等待核关研判审核批复。'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.organization} · {item.author} · {item.submitTime || '2026-09-04 10:20'}
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-1.5 shrink-0">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded border border-amber-200">
                        待审核
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAudit(item);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-blue-600 hover:text-white border border-slate-300 text-blue-700 font-bold text-[11px] rounded-lg shadow-2xs transition-all cursor-pointer flex items-center space-x-0.5"
                      >
                        <span>去审核</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              reportTodos.slice(0, 8).map((item) => {
                const ident = resolveIdentification(item, reports);
                const isRejected = item.auditStatus === '被驳回' || item.auditStatus === '已驳回';
                return (
                  <div
                    key={item.id}
                    onClick={() => handleViewDetail(item)}
                    className="p-3 bg-slate-50/80 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center space-x-1.5 min-w-0 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                          {item.title}
                        </span>
                        <IdentificationBadge status={ident.status} size="xs" showIcon />
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {isRejected
                          ? `驳回原因：${item.rejectReason || '需补充佐证材料'}`
                          : item.auditStatus === '草稿'
                          ? '草稿待编辑完善，暂未提交送审'
                          : ident.detail?.matchReason || '报送已录入，等待审核分流'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.organization} · {item.author} · {item.submitTime || '2026-09-04 10:20'}
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-1.5 shrink-0">
                      <span
                        className={`px-2 py-0.5 font-bold text-[10px] rounded border ${
                          isRejected
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        }`}
                      >
                        {item.auditStatus}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(item);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-[#1E5ABB] hover:text-white border border-slate-300 text-[#1E5ABB] font-bold text-[11px] rounded-lg shadow-2xs transition-all cursor-pointer flex items-center space-x-0.5"
                      >
                        <span>查看</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: 7-DAY BARS & LINES CHART */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">全域近7日业务流转与时效走势</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              上报与采纳规模保持平稳，整体通过率稳定在 92% 以上
            </p>
          </div>

          {/* Chart Legend matching screenshot */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 bg-[#1E5ABB] rounded-xs inline-block"></span>
              <span>上报量</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 bg-[#10B981] rounded-xs inline-block"></span>
              <span>采纳量</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-4 h-0.5 bg-[#1E5ABB] inline-block"></span>
              <span>整体通过率(%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-4 h-0.5 border-t border-dashed border-amber-500 inline-block"></span>
              <span>一次通过率(%)</span>
            </div>
          </div>
        </div>

        {/* Recharts Composed Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={bottomChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" domain={[60, 100]} tick={{ fontSize: 11, fill: '#10b981' }} unit="%" axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar yAxisId="left" dataKey="submitted" name="上报量" fill="#1E5ABB" barSize={18} radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="passed" name="采纳量" fill="#10B981" barSize={18} radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="passRate" name="整体通过率" stroke="#1E5ABB" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="directRate" name="一次通过率" stroke="#F59E0B" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Metrics Bar matching screenshot */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs font-bold text-slate-700 gap-3">
          <div className="flex items-center space-x-6">
            <span>近7日总上报: <strong className="text-slate-900 font-mono">447 件</strong></span>
            <span>近7日总采纳: <strong className="text-emerald-700 font-mono">397 件</strong></span>
            <span>近7日整体通过率: <strong className="text-blue-700 font-mono">92.9%</strong></span>
            <span>全域平均直通过率: <strong className="text-amber-600 font-mono">78.6%</strong></span>
          </div>
          <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg border border-emerald-200">
            <span>综合协同评级:</span>
            <strong className="font-black">健康良好</strong>
          </div>
        </div>
      </div>


    </div>
  );
};
