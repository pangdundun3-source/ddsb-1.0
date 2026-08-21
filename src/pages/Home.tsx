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
  ExternalLink,
  Activity,
  Layers,
  Eye,
  ListOrdered,
  Zap,
  Info,
  User,
  UserCheck
} from 'lucide-react';

interface HomeProps {
  reports: ReportItem[];
  orgs: OrgItem[];
  onNavigate: (page: PageId) => void;
  onSelectReport: (report: ReportItem) => void;
  onSelectAudit: (report: ReportItem) => void;
  currentUser?: string;
}

export const Home: React.FC<HomeProps> = ({
  reports,
  orgs,
  onNavigate,
  onSelectReport,
  onSelectAudit,
  currentUser = '张三'
}) => {
  // Search & Filter States for the Top 15 Reports Table
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('全部');
  const [selectedSource, setSelectedSource] = useState('全部');
  const [selectedStatus, setSelectedStatus] = useState('待审核');

  // Dynamic Statistics Calculations
  const subOrgsCount = useMemo(() => {
    return orgs.length > 0 ? orgs.length + 23 : 28;
  }, [orgs]);

  const platformUsersCount = useMemo(() => {
    return 186;
  }, []);

  const totalReportsCount = useMemo(() => {
    return reports.length;
  }, [reports]);

  const pendingAudits = useMemo(() => {
    return reports.filter((r) => r.auditStatus === '待审核');
  }, [reports]);

  const passedReports = useMemo(() => {
    return reports.filter((r) => r.auditStatus === '已通过');
  }, [reports]);

  const negativeTransfers = useMemo(() => {
    return reports.filter(
      (r) => r.auditStatus === '待转办' || r.auditStatus === '已转办'
    );
  }, [reports]);

  const passRate = useMemo(() => {
    if (reports.length === 0) return '95.0%';
    const count = passedReports.length;
    return `${((count / reports.length) * 100).toFixed(1)}%`;
  }, [reports, passedReports]);

  // Filtered Top 15 Pending Reports (最新上报信息列表 - 展示最新上报的待审核数据前15条)
  const top15PendingReports = useMemo(() => {
    // Primary Filter by Audit Status ('待审核' by default or selected status)
    let result = reports.filter((r) => {
      if (selectedStatus !== '全部') {
        return r.auditStatus === selectedStatus;
      }
      return r.auditStatus === '待审核';
    });

    // If there are fewer than 15 pending items and selectedStatus is '全部', supplement with rest
    if (result.length < 15 && selectedStatus === '全部') {
      const pendingIds = new Set(result.map((r) => r.id));
      const rest = reports.filter((r) => !pendingIds.has(r.id));
      result = [...result, ...rest];
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(term) ||
          r.author.toLowerCase().includes(term) ||
          r.organization.toLowerCase().includes(term)
      );
    }

    // Info type filter
    if (selectedType !== '全部') {
      result = result.filter((r) => r.infoType === selectedType);
    }

    // Source channel filter
    if (selectedSource !== '全部') {
      result = result.filter((r) => r.source === selectedSource);
    }

    // Sort by submit time (latest first) or ID
    result.sort((a, b) => {
      if (a.submitTime && b.submitTime) {
        return b.submitTime.localeCompare(a.submitTime);
      }
      return b.id - a.id;
    });

    // Strictly take top 15 items
    return result.slice(0, 15);
  }, [reports, searchTerm, selectedType, selectedSource, selectedStatus]);

  // Handle Quick Audit Click
  const handleQuickAudit = (report: ReportItem) => {
    onSelectAudit(report);
    onNavigate('audit-detail');
  };

  // Handle View Detail Click
  const handleViewDetail = (report: ReportItem) => {
    onSelectReport(report);
    onNavigate('report-detail');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Main Dashboard Split Grid: Left 7 Metric Cards + Right Product Info & Quick Entrance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT SECTION: 7 Statistic Modules (左侧：平台核心数据指标 7个模块) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200/80">
            <h2 className="text-sm font-extrabold text-[#1E5ABB] flex items-center space-x-2">
              <div className="p-1.5 bg-[#1E5ABB] text-white rounded-lg shadow-2xs">
                <Activity className="w-4 h-4 text-blue-200" />
              </div>
              <span>平台核心数据指标</span>
            </h2>
            <span className="text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold border border-blue-100">
              实时动态监控 · 7大模块
            </span>
          </div>

          {/* 7 Statistic Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 flex-1">
            {/* 1. 当前平台子机构总数 */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span className="font-bold text-gray-700 flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">子机构总数</span>
                </span>
                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-100 shrink-0">
                  全域
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-0.5">
                <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  28
                  <span className="text-xs font-normal text-slate-500 ml-1">个</span>
                </div>
                <span className="text-xs text-emerald-600 font-bold">
                  ↑ 28区县
                </span>
              </div>
              <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between font-medium">
                <span>市级: 5</span>
                <span>区县: 18</span>
                <span>其他: 5</span>
              </div>
            </div>

            {/* 2. 平台人员总数 */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span className="font-bold text-gray-700 flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="truncate">平台人员总数</span>
                </span>
                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded border border-indigo-100 shrink-0">
                  在册
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-0.5">
                <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  186
                  <span className="text-xs font-normal text-slate-500 ml-1">名</span>
                </div>
                <span className="text-xs text-indigo-600 font-bold">
                  98.4% 活跃
                </span>
              </div>
              <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between font-medium">
                <span>报送: 124人</span>
                <span>审核: 42人</span>
                <span>管理: 20人</span>
              </div>
            </div>

            {/* 3. 舆情速报上报总量 */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span className="font-bold text-gray-700 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">速报上报总量</span>
                </span>
                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-100 shrink-0">
                  累计
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-0.5">
                <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  35
                  <span className="text-xs font-normal text-slate-500 ml-1">件</span>
                </div>
                <span className="text-xs text-emerald-600 font-bold">
                  今日 +18 件
                </span>
              </div>
              <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between font-medium">
                <span>本周: 142</span>
                <span>通过率: 42.9%</span>
              </div>
            </div>

            {/* 4. 负面舆情转办数 */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span className="font-bold text-gray-700 flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="truncate">负面舆情转办数</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] text-rose-600 bg-rose-50 rounded font-bold border border-rose-100 shrink-0">
                  交办
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-0.5">
                <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  20
                  <span className="text-xs font-normal text-slate-500 ml-1">件</span>
                </div>
                <span className="text-xs text-rose-600 font-extrabold">
                  已办结 12 件
                </span>
              </div>
              <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between font-medium">
                <span>待办: 8件</span>
                <span>按时办结率: 98.2%</span>
              </div>
            </div>

            {/* 5. 审核通过率 */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span className="font-bold text-gray-700 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">审核通过率</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] text-emerald-600 bg-emerald-50 rounded font-bold border border-emerald-100 shrink-0">
                  品控
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-0.5">
                <div className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
                  42.9%
                </div>
                <span className="text-xs text-emerald-600 font-bold">
                  准度高
                </span>
              </div>
              <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between font-medium">
                <span>驳回率: 4.8%</span>
                <span>质量符合率: 99.1%</span>
              </div>
            </div>

            {/* 6. 今日新增上报 */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span className="font-bold text-gray-700 flex items-center space-x-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">今日新增上报</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] text-blue-600 bg-blue-50 rounded font-bold border border-blue-100 shrink-0">
                  24H
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-0.5">
                <div className="text-2xl font-black text-blue-600 font-mono tracking-tight">
                  18
                  <span className="text-xs font-normal text-slate-500 ml-1">件</span>
                </div>
                <span className="text-xs text-emerald-600 font-bold">
                  ↑ 12.5%
                </span>
              </div>
              <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between font-medium">
                <span>早高峰: 7件</span>
                <span>午后: 11件</span>
              </div>
            </div>

            {/* 7. 平均审核响应 (全宽横向卡片) */}
            <div className="col-span-1 sm:col-span-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5 shrink-0">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg border border-purple-100">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-800 text-xs sm:text-sm">平均审核响应</span>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-full border border-purple-100">
                      效能优异
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">全天候平均处置速度</div>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-purple-600 font-mono">15.8</span>
                  <span className="text-xs text-slate-500 font-medium">分钟</span>
                </div>
                <div className="text-xs text-slate-500 border-l border-slate-200 pl-3 font-medium hidden sm:flex items-center space-x-3">
                  <span>指标: 30min</span>
                  <span>提效: <strong className="text-purple-700">47.3%</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Stacked Right Column (右侧：代办快速入口) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between space-y-3">
          {/* 1. 代办快速入口 */}
          <div className="bg-white p-4 rounded-xl border border-amber-200/90 shadow-2xs space-y-3 bg-gradient-to-br from-amber-50/10 via-white to-slate-50/30 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-amber-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-amber-500 text-white rounded-md shadow-2xs">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xs font-extrabold text-gray-900">代办快速入口</h3>
              </div>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full border border-amber-300">
                待办 15 件
              </span>
            </div>

            {/* Main Action Banner */}
            <div className="bg-gradient-to-r from-[#1E5ABB] to-[#134092] p-3.5 rounded-xl text-white flex items-center justify-between gap-3 shadow-2xs">
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs text-blue-100 font-medium">快捷协同签发</div>
                <div className="text-sm font-extrabold text-white truncate">
                  待审核速报线索 <span className="text-amber-300 font-mono text-base ml-1">15</span> 件
                </div>
              </div>
              <button
                onClick={() => onNavigate('report-audit')}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-lg shadow-2xs transition-all cursor-pointer flex items-center space-x-1 shrink-0 active:scale-95"
              >
                <span>进入审核</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Jump Shortcuts Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
              <button
                onClick={() => onNavigate('report-summary')}
                className="p-2.5 bg-slate-50/90 hover:bg-blue-50/80 rounded-xl text-left border border-slate-200/80 hover:border-blue-300 transition-all flex items-center space-x-2.5 cursor-pointer group"
              >
                <div className="p-2 bg-blue-100 text-blue-800 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-gray-800 group-hover:text-blue-900 truncate">报送记录</div>
                  <div className="text-[10px] text-gray-500 truncate">全量检索</div>
                </div>
              </button>

              <button
                onClick={() => onNavigate('negative-info')}
                className="p-2.5 bg-slate-50/90 hover:bg-rose-50/80 rounded-xl text-left border border-slate-200/80 hover:border-rose-300 transition-all flex items-center space-x-2.5 cursor-pointer group"
              >
                <div className="p-2 bg-rose-100 text-rose-800 rounded-lg group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-gray-800 group-hover:text-rose-900 truncate">不良信息库</div>
                  <div className="text-[10px] text-gray-500 truncate">交办研判</div>
                </div>
              </button>

              <button
                onClick={() => onNavigate('business-config')}
                className="p-2.5 bg-slate-50/90 hover:bg-purple-50/80 rounded-xl text-left border border-slate-200/80 hover:border-purple-300 transition-all flex items-center space-x-2.5 cursor-pointer group"
              >
                <div className="p-2 bg-purple-100 text-purple-800 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-gray-800 group-hover:text-purple-900 truncate">业务配置维护</div>
                  <div className="text-[10px] text-gray-500 truncate">字典维护</div>
                </div>
              </button>

              <button
                onClick={() => onNavigate('system-logs')}
                className="p-2.5 bg-slate-50/90 hover:bg-amber-50/80 rounded-xl text-left border border-slate-200/80 hover:border-amber-300 transition-all flex items-center space-x-2.5 cursor-pointer group"
              >
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-gray-800 group-hover:text-amber-900 truncate">系统审计日志</div>
                  <div className="text-[10px] text-gray-500 truncate">日志审计</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: 最新上报信息列表 - 展示最新上报的待审核数据前15条 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Header & Inline Search/Filter Controls */}
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/60 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* List Title & Subtitle */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="p-2 bg-[#1E5ABB] text-white rounded-lg shadow-2xs">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
                <span>最新上报信息列表</span>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold rounded-full shadow-2xs">
                  待审核数据（前 15 条）
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                实时提取各节点最新提交且待审核签发的速报线索，按提交时间倒序展示
              </p>
            </div>
          </div>

          {/* Quick Filter & Search Tools on the Same Line */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索标题、报送人、单位..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
              />
            </div>

            {/* Category Select */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] cursor-pointer"
            >
              <option value="全部">全部信息类别</option>
              <option value="突发事件">突发事件</option>
              <option value="舆情动态">舆情动态</option>
              <option value="政策解读">政策解读</option>
              <option value="民生诉求">民生诉求</option>
            </select>

            {/* Source Select */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] cursor-pointer"
            >
              <option value="全部">全部来源渠道</option>
              <option value="群众举报">群众举报</option>
              <option value="新闻网站">新闻网站</option>
              <option value="社交媒体">社交媒体</option>
              <option value="政府官网">政府官网</option>
              <option value="内部系统">内部系统</option>
            </select>

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] cursor-pointer"
            >
              <option value="待审核">待审核数据（默认前15条）</option>
              <option value="已通过">已通过</option>
              <option value="被驳回">被驳回</option>
              <option value="待转办">待转办</option>
              <option value="全部">全部状态</option>
            </select>

            {/* Reset Filter Button */}
            {(searchTerm ||
              selectedType !== '全部' ||
              selectedSource !== '全部' ||
              selectedStatus !== '待审核') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('全部');
                  setSelectedSource('全部');
                  setSelectedStatus('待审核');
                }}
                className="px-2.5 py-1.5 text-xs text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                title="重置刷选"
              >
                <RotateCcw className="w-3 h-3" />
                <span>重置</span>
              </button>
            )}
          </div>
        </div>

        {/* Top 15 Reports Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100/70 text-gray-600 font-semibold border-b border-gray-200">
                <th className="py-3 px-4 w-12 text-center">序号</th>
                <th className="py-3 px-4 min-w-[280px]">速报标题 / 信息类别</th>
                <th className="py-3 px-4 min-w-[160px]">上报单位 / 报送人</th>
                <th className="py-3 px-4 min-w-[140px]">来源渠道 / 区域</th>
                <th className="py-3 px-4 min-w-[130px]">上报时间</th>
                <th className="py-3 px-4 min-w-[100px]">审核状态</th>
                <th className="py-3 px-4 w-20 text-center">质量评分</th>
                <th className="py-3 px-4 min-w-[160px] text-right">快捷操作入口</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {top15PendingReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="w-8 h-8 text-gray-300" />
                      <span>未找到符合条件的待审核上报信息</span>
                    </div>
                  </td>
                </tr>
              ) : (
                top15PendingReports.map((item, index) => {
                  const isPending = item.auditStatus === '待审核';
                  const isPassed = item.auditStatus === '已通过';
                  const isRejected = item.auditStatus === '被驳回';
                  const isTransfer =
                    item.auditStatus === '待转办' || item.auditStatus === '已转办';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-blue-50/50 transition-colors group ${
                        isPending ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Index #1 to #15 */}
                      <td className="py-3 px-4 text-center font-bold text-gray-400 font-mono text-xs">
                        {index + 1}
                      </td>

                      {/* Title & Category Badge */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <button
                            onClick={() => handleViewDetail(item)}
                            className="font-bold text-gray-900 hover:text-[#1E5ABB] text-left line-clamp-1 transition-colors cursor-pointer flex items-center space-x-1.5"
                          >
                            <span>{item.title}</span>
                          </button>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-1.5 py-0.2 text-[10px] font-bold rounded ${
                                item.infoType === '突发事件'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : item.infoType === '民生诉求'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : item.infoType === '政策解读'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {item.infoType || '突发事件'}
                            </span>
                            {item.matchUrl && (
                              <span className="text-[10px] text-blue-600 bg-blue-50 px-1 py-0.2 rounded flex items-center space-x-0.5">
                                <ExternalLink className="w-2.5 h-2.5" />
                                <span>包含外部链接</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Submitting Org & Author */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-800 truncate max-w-[150px]">
                          {item.organization || '台中市网信办'}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center space-x-1 mt-0.5">
                          <span>报送人:</span>
                          <span className="text-gray-600 font-semibold">{item.author}</span>
                        </div>
                      </td>

                      {/* Source Channel & Region */}
                      <td className="py-3 px-4">
                        <div className="text-gray-700 font-medium">{item.source}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          区域: <span className="text-gray-600">{item.region || '全市'}</span>
                        </div>
                      </td>

                      {/* Submit Time */}
                      <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                        {item.submitTime}
                      </td>

                      {/* Audit Status */}
                      <td className="py-3 px-4">
                        {isPending ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full border border-amber-300 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            <span>待审核</span>
                          </span>
                        ) : isPassed ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>已通过</span>
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-full border border-rose-200">
                            <span>被驳回</span>
                          </span>
                        ) : isTransfer ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[11px] font-bold rounded-full border border-indigo-200">
                            <span>{item.auditStatus}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-medium rounded-full">
                            {item.auditStatus}
                          </span>
                        )}
                      </td>

                      {/* Score */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold text-gray-800">
                          {item.score !== undefined ? item.score : '--'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {isPending ? (
                            <button
                              onClick={() => handleQuickAudit(item)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded shadow-2xs transition-all flex items-center space-x-1 cursor-pointer transform active:scale-95"
                            >
                              <span>⚡ 快捷审核</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleViewDetail(item)}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-[#1E5ABB] font-bold text-[11px] rounded transition-colors flex items-center space-x-1 cursor-pointer border border-gray-200"
                            >
                              <Eye className="w-3 h-3" />
                              <span>查看详情</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info banner */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <div>
            当前展示最新待审核数据前 <strong className="text-amber-800 font-bold">{top15PendingReports.length}</strong> 条（共 {pendingAudits.length} 条待审核速报线索）
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('report-audit')}
              className="text-amber-700 hover:underline font-bold flex items-center space-x-1 cursor-pointer"
            >
              <span>进入报送审核大厅全部处理</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => onNavigate('report-summary')}
              className="text-[#1E5ABB] hover:underline font-bold flex items-center space-x-1 cursor-pointer"
            >
              <span>查看全量 {reports.length} 条报送数据</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
