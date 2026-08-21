import React, { useState } from 'react';
import { ReportItem, PageId } from '../types';
import {
  Search,
  RotateCcw,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileEdit,
  Trash2,
  Undo2,
  Copy,
  MapPin,
  LayoutGrid,
  List,
  Check,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  User,
  X
} from 'lucide-react';

interface ReportSummaryProps {
  reports: ReportItem[];
  onSelectReport: (report: ReportItem) => void;
  onDeleteReport?: (id: number) => void;
  onWithdrawReport?: (id: number) => void;
  onResubmitReport?: (report: ReportItem) => void;
  onOpenNewReport?: (templateData?: any) => void;
  onNavigate: (page: PageId) => void;
}

export const ReportSummary: React.FC<ReportSummaryProps> = ({
  reports,
  onSelectReport,
  onDeleteReport,
  onWithdrawReport,
  onResubmitReport,
  onOpenNewReport,
  onNavigate
}) => {
  // Filter States
  const [activeTab, setActiveTab] = useState<'待审核' | '已驳回' | '草稿' | '已采纳'>('待审核');
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Modals
  const [withdrawTarget, setWithdrawTarget] = useState<ReportItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReportItem | null>(null);
  const [editTarget, setEditTarget] = useState<ReportItem | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editCoreDemands, setEditCoreDemands] = useState('');
  const [editSource, setEditSource] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editInfoType, setEditInfoType] = useState('');

  // Statistics calculation
  const totalCount = reports.length;
  const draftCount = reports.filter((r) => r.auditStatus === '草稿').length;
  const rejectedCount = reports.filter((r) => r.auditStatus === '被驳回' || r.auditStatus === '已驳回').length;
  const pendingCount = reports.filter((r) => r.auditStatus === '待审核').length;
  const adoptedCount = reports.filter((r) => r.auditStatus === '已采纳' || r.auditStatus === '已通过').length;
  const todoCount = draftCount + rejectedCount;
  const passRate = totalCount > 0 ? Math.round((adoptedCount / totalCount) * 100) : 0;
  // 一次性通过率 (无驳回历史直接通过的比例)
  const firstTimePassRate = totalCount > 0 ? Math.round(((totalCount - rejectedCount) / totalCount) * 100) : 0;

  // Tab Filtering
  const filtered = reports.filter((item) => {
    // Tab filter
    if (activeTab === '待审核' && item.auditStatus !== '待审核') return false;
    if (activeTab === '已采纳' && item.auditStatus !== '已采纳' && item.auditStatus !== '已通过') return false;
    if (activeTab === '已驳回' && item.auditStatus !== '被驳回' && item.auditStatus !== '已驳回') return false;
    if (activeTab === '草稿' && item.auditStatus !== '草稿') return false;

    // Search filters (智能综合模糊检索: 标题、上报人员、事件来源、所属机构、发生地址)
    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchAuthor = item.author?.toLowerCase().includes(q);
      const matchSource = item.source?.toLowerCase().includes(q);
      const matchOrg = item.organization?.toLowerCase().includes(q);
      const matchAddress = item.occurAddress?.toLowerCase().includes(q);
      const matchRegion = item.region?.toLowerCase().includes(q);
      const matchInfoType = item.infoType?.toLowerCase().includes(q);
      const matchSummary = item.detailContent?.summary?.toLowerCase().includes(q);
      const matchDemands = item.detailContent?.coreDemands?.toLowerCase().includes(q);
      if (
        !matchTitle &&
        !matchAuthor &&
        !matchSource &&
        !matchOrg &&
        !matchAddress &&
        !matchRegion &&
        !matchInfoType &&
        !matchSummary &&
        !matchDemands
      ) {
        return false;
      }
    }
    if (startDate && item.submitTime < startDate) return false;
    if (endDate && item.submitTime > endDate) return false;

    return true;
  });

  const handleReset = () => {
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setActiveTab('全部');
  };

  const handleCopySummary = (item: ReportItem) => {
    const text = `【速报内容】${item.title}\n【发生地址】${item.occurAddress || item.region}\n【信息类型】${item.infoType} | ${item.source}\n【详情摘要】${item.detailContent?.summary || item.title}\n【核心诉求】${item.detailContent?.coreDemands || '无'}\n【上报机构】${item.organization} (${item.author})`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const openEditModal = (item: ReportItem) => {
    setEditTarget(item);
    setEditTitle(item.title);
    setEditAddress(item.occurAddress || '');
    setEditSummary(item.detailContent?.summary || '');
    setEditCoreDemands(item.detailContent?.coreDemands || '');
    setEditSource(item.source);
    setEditRegion(item.region);
    setEditInfoType(item.infoType);
  };

  const handleSaveAndResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    const updated: ReportItem = {
      ...editTarget,
      title: editTitle,
      occurAddress: editAddress,
      source: editSource,
      region: editRegion,
      infoType: editInfoType,
      detailContent: {
        ...editTarget.detailContent,
        summary: editSummary,
        coreDemands: editCoreDemands,
        publicOpinionTrend: editTarget.detailContent?.publicOpinionTrend || '暂无明显外溢',
        recommendations: editTarget.detailContent?.recommendations || []
      }
    };

    if (onResubmitReport) {
      onResubmitReport(updated);
    }
    setEditTarget(null);
  };

  return (
    <div className="space-y-5" id="report-summary-view">
      {/* 1. Header & KPI Cards Area (Harmonized Gradient Banner matching Audit Workbench) */}
      <div className="bg-gradient-to-r from-blue-700 via-[#1E5ABB] to-blue-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        {/* Background ambient accents */}
        <div className="absolute right-0 top-0 w-96 h-full bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/15">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <h2 className="text-xl font-bold tracking-tight">【报送待办】报送管理工作台</h2>
            </div>
            <p className="text-xs text-blue-100/80 mt-1 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>集中处理待审核、被驳回修改及草稿箱舆情速报事项 · 报送待办</span>
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => onNavigate('report-records')}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-lg border border-white/20 transition-all flex items-center space-x-1.5 cursor-pointer"
              title="查看当前账号的历史全部报送记录台账"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>报送记录台账</span>
            </button>
            <button
              onClick={() => onOpenNewReport && onOpenNewReport()}
              className="px-4 py-2 bg-white hover:bg-blue-50 text-[#1E5ABB] text-xs font-bold rounded-lg shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
              id="btn-create-new-report"
            >
              <Plus className="w-4 h-4" />
              <span>新建速报</span>
            </button>
          </div>
        </div>

        {/* 4 Large Translucent Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-5 relative z-10">
          {/* Card 1: 报送待办 */}
          <div
            className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-sm"
            id="kpi-todo-box"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-100">报送待办</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/30 text-amber-200 font-bold border border-amber-400/40">
                待办事项
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-white">{todoCount}</span>
              <span className="text-xs text-blue-200">
                草稿 <strong className="text-white">{draftCount}</strong> · 驳回 <strong className="text-rose-300">{rejectedCount}</strong>
              </span>
            </div>
          </div>

          {/* Card 2: 累计上报 */}
          <div
            onClick={() => onNavigate('report-records')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 transition-all cursor-pointer group backdrop-blur-sm"
            id="kpi-total-box"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-100">累计上报</span>
              <span className="text-[11px] text-blue-200 font-medium group-hover:underline">查看台账 &gt;</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-white">{totalCount}</span>
              <span className="text-xs text-blue-200">
                通过 <strong className="text-emerald-300">{adoptedCount}</strong> · 待审 <strong className="text-amber-300">{pendingCount}</strong>
              </span>
            </div>
          </div>

          {/* Card 3: 整体通过率 */}
          <div className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-100">整体通过率</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/30 text-emerald-200 font-bold border border-emerald-400/40">
                {adoptedCount}/{totalCount}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-emerald-300">{passRate}%</span>
              <span className="text-xs text-blue-200">
                采纳得分领先全市平均
              </span>
            </div>
          </div>

          {/* Card 4: 一次性通过率 */}
          <div className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-100">一次性通过率</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-400/30 text-cyan-200 font-bold border border-cyan-400/40">
                无驳回重修
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-cyan-300">{firstTimePassRate}%</span>
              <span className="text-xs text-blue-200">
                速报质量评级优秀
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Status Segment Tabs (胶囊导航栏) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-gray-200/80 shadow-2xs">
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {[
            { id: '待审核', label: '待审核', count: pendingCount, color: 'text-amber-600 bg-amber-50' },
            { id: '已驳回', label: '已驳回', count: rejectedCount, color: 'text-rose-600 bg-rose-50' },
            { id: '草稿', label: '草稿', count: draftCount, color: 'text-gray-600 bg-gray-100' },
            { id: '已采纳', label: '已采纳', count: adoptedCount, color: 'text-emerald-700 bg-emerald-50' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#1E5ABB] text-white shadow-2xs'
                    : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-white/20 text-white' : tab.color || 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 border border-gray-200 p-0.5 rounded-lg bg-gray-50 text-xs">
          <button
            onClick={() => setViewMode('table')}
            className={`px-2.5 py-1 rounded flex items-center space-x-1 transition-colors cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-[#1E5ABB] font-bold shadow-2xs' : 'text-gray-500 hover:text-gray-800'
            }`}
            title="表格视图"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">表格视图</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-2.5 py-1 rounded flex items-center space-x-1 transition-colors cursor-pointer ${
              viewMode === 'cards' ? 'bg-white text-[#1E5ABB] font-bold shadow-2xs' : 'text-gray-500 hover:text-gray-800'
            }`}
            title="卡片看板"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">卡片看板</span>
          </button>
        </div>
      </div>

      {/* 3. Unified Filter Card */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200/80 shadow-2xs space-y-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* 综合检索框: 类似截图的全字段模糊检索 */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索上报标题、上报人姓名..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 hover:border-gray-300 focus:border-[#1E5ABB] rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 transition-all shadow-2xs"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer transition-colors"
                title="清空检索词"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 上报时间区间 */}
          <div className="flex items-center space-x-2 text-xs shrink-0">
            <span className="text-gray-500 whitespace-nowrap hidden sm:inline">上报时间:</span>
            <div className="flex items-center space-x-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-2 border border-gray-200 hover:border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] bg-white text-gray-700 shadow-2xs"
              />
              <span className="text-gray-400 font-bold">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-2 border border-gray-200 hover:border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] bg-white text-gray-700 shadow-2xs"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {}}
              className="px-4 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center space-x-1.5 active:scale-98"
            >
              <Search className="w-3.5 h-3.5" />
              <span>查询</span>
            </button>
            <button
              onClick={handleReset}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 transition-colors cursor-pointer flex items-center space-x-1.5 active:scale-98"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置条件</span>
            </button>
          </div>
        </div>

      </div>

      {/* 4. Main Content: Table View OR Card Grid View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/90 border-b border-gray-200 text-gray-600 font-semibold">
                  <th className="py-3.5 px-4 w-12 text-center">序号</th>
                  <th className="py-3.5 px-4 min-w-[220px]">事件标题</th>
                  <th className="py-3.5 px-4 min-w-[280px]">内容描述</th>
                  <th className="py-3.5 px-4 min-w-[160px]">上报人员 / 机构</th>
                  <th className="py-3.5 px-4">上报时间</th>
                  <th className="py-3.5 px-4 text-center">状态</th>
                  <th className="py-3.5 px-4 text-center min-w-[160px]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      未查找到匹配的上报记录
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, index) => {
                    const isDraft = item.auditStatus === '草稿';
                    const isPending = item.auditStatus === '待审核';
                    const isRejected = item.auditStatus === '被驳回' || item.auditStatus === '已驳回';
                    const isAdopted = item.auditStatus === '已采纳' || item.auditStatus === '已通过';

                    return (
                      <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="py-3.5 px-4 text-center text-gray-400 font-mono">{index + 1}</td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => {
                              onSelectReport(item);
                              onNavigate('report-detail');
                            }}
                            className="text-blue-700 hover:text-blue-900 hover:underline font-bold text-left cursor-pointer block leading-snug"
                          >
                            {item.title}
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <div
                            className="text-gray-600 text-xs line-clamp-2 leading-relaxed max-w-[360px]"
                            title={item.detailContent?.summary || item.occurAddress || ''}
                          >
                            {item.detailContent?.summary || item.occurAddress || '暂无详细描述'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-900 leading-snug">{item.author}</div>
                          <div className="text-gray-500 text-[11px] truncate max-w-[200px] mt-0.5" title={item.organization}>
                            {item.organization}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-500 whitespace-nowrap text-xs">
                          {item.submitTime}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isDraft && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              草稿
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              待审核
                            </span>
                          )}
                          {isRejected && (
                            <div className="inline-flex flex-col items-center gap-1 group relative">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                已驳回
                              </span>
                              <div
                                className="inline-flex items-center gap-1 max-w-[130px] px-1.5 py-0.5 rounded bg-rose-50/80 hover:bg-rose-100 text-rose-600 border border-rose-200/70 text-[11px] cursor-help transition-colors"
                                title={`驳回原因：${item.rejectReason || '信息不完整，请补充相关佐证材料'}`}
                              >
                                <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                <span className="truncate">{item.rejectReason || '信息不完整'}</span>
                              </div>
                              {/* Hover Floating Tooltip */}
                              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 w-56 p-2.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl border border-slate-800 text-left">
                                <div className="flex items-center gap-1 text-rose-400 font-semibold mb-1 text-[11px]">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>驳回具体原因</span>
                                </div>
                                <p className="text-[11px] text-slate-200 leading-relaxed break-words font-normal">
                                  {item.rejectReason || '信息要素不完整，请补充政策依据与证明材料后重新提交。'}
                                </p>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                              </div>
                            </div>
                          )}
                          {isAdopted && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              已采纳
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-2">
                            {/* View Detail */}
                            <button
                              onClick={() => {
                                onSelectReport(item);
                                onNavigate('report-detail');
                              }}
                              className="text-[#1E5ABB] hover:underline font-semibold cursor-pointer text-xs"
                            >
                              详情
                            </button>

                            {/* Withdraw (if Pending) */}
                            {isPending && onWithdrawReport && (
                              <button
                                onClick={() => setWithdrawTarget(item)}
                                className="text-amber-600 hover:text-amber-800 hover:underline font-medium cursor-pointer flex items-center space-x-0.5 text-xs"
                                title="撤回转为草稿"
                              >
                                <Undo2 className="w-3 h-3" />
                                <span>撤回</span>
                              </button>
                            )}

                            {/* Edit / Resubmit (if Draft or Rejected) */}
                            {(isDraft || isRejected) && (
                              <button
                                onClick={() => openEditModal(item)}
                                className="text-indigo-600 hover:text-indigo-800 hover:underline font-semibold cursor-pointer flex items-center space-x-0.5 text-xs"
                              >
                                <FileEdit className="w-3 h-3" />
                                <span>{isRejected ? '修改重报' : '编辑'}</span>
                              </button>
                            )}

                            {/* Copy Summary (if Adopted or any) */}
                            {isAdopted && (
                              <button
                                onClick={() => handleCopySummary(item)}
                                className="text-emerald-700 hover:text-emerald-900 hover:underline font-medium cursor-pointer flex items-center space-x-0.5 text-xs"
                                title="复制标准化通报文稿"
                              >
                                {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedId === item.id ? '已复制' : '复制'}</span>
                              </button>
                            )}

                            {/* Delete (if Draft or Rejected) */}
                            {(isDraft || isRejected) && onDeleteReport && (
                              <button
                                onClick={() => setDeleteTarget(item)}
                                className="text-rose-600 hover:text-rose-800 hover:underline font-medium cursor-pointer p-1"
                                title="删除此记录"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

          {/* Table Footer / Pagination */}
          <div className="px-6 py-3 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div>共 {filtered.length} 条记录</div>
            <div className="flex items-center space-x-2">
              <button className="px-2.5 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50">&lt;</button>
              <span className="px-3 py-1 bg-[#1E5ABB] text-white rounded font-bold">1</span>
              <button className="px-2.5 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50">&gt;</button>
              <span className="ml-2 text-gray-400">跳转至</span>
              <input
                type="text"
                defaultValue="1"
                className="w-8 px-1.5 py-0.5 border border-gray-300 rounded text-center focus:outline-none"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Card Grid View (PC Optimized 3-Column Bento Cards) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              未查找到匹配的上报记录
            </div>
          ) : (
            filtered.map((item) => {
              const isDraft = item.auditStatus === '草稿';
              const isPending = item.auditStatus === '待审核';
              const isRejected = item.auditStatus === '被驳回' || item.auditStatus === '已驳回';
              const isAdopted = item.auditStatus === '已采纳' || item.auditStatus === '已通过';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-all p-4.5 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        onClick={() => {
                          onSelectReport(item);
                          onNavigate('report-detail');
                        }}
                        className="text-xs font-bold text-gray-900 hover:text-[#1E5ABB] cursor-pointer line-clamp-2 leading-snug"
                      >
                        {item.title}
                      </h4>
                      <span
                        className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isDraft
                            ? 'bg-gray-100 text-gray-700 border-gray-300'
                            : isPending
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : isRejected
                            ? 'bg-rose-100 text-rose-700 border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {item.auditStatus}
                      </span>
                    </div>

                    {/* Rejection Banner */}
                    {isRejected && (
                      <div className="p-2.5 bg-rose-50/90 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start space-x-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <div className="leading-tight">
                          <span className="font-bold text-rose-900">驳回说明：</span>
                          <span>{item.rejectReason || '信息不完整，请补充相关材料后重新提交。'}</span>
                        </div>
                      </div>
                    )}

                    {/* Content snippet */}
                    {item.detailContent?.summary && (
                      <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed bg-gray-50/50 p-2 rounded">
                        {item.detailContent.summary}
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex flex-col text-[11px]">
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-900 font-semibold">{item.author}</span>
                        <span>·</span>
                        <span className="font-mono text-gray-500">{item.submitTime.slice(5)}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 truncate max-w-[170px]">{item.organization}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isPending && onWithdrawReport && (
                        <button
                          onClick={() => setWithdrawTarget(item)}
                          className="text-amber-600 hover:underline font-semibold cursor-pointer"
                        >
                          撤回
                        </button>
                      )}
                      {(isDraft || isRejected) && (
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-indigo-600 hover:underline font-semibold cursor-pointer"
                        >
                          {isRejected ? '修改重报' : '编辑'}
                        </button>
                      )}
                      {isAdopted && (
                        <button
                          onClick={() => handleCopySummary(item)}
                          className="text-emerald-700 hover:underline font-semibold cursor-pointer"
                        >
                          {copiedId === item.id ? '已复制' : '复制文稿'}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onSelectReport(item);
                          onNavigate('report-detail');
                        }}
                        className="text-[#1E5ABB] hover:underline font-semibold cursor-pointer"
                      >
                        详情 &gt;
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Withdraw Modal */}
      {withdrawTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-gray-200">
            <div className="flex items-center space-x-3 text-amber-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-gray-900">确认撤回报送？</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              您正在撤回《<strong className="text-gray-900">{withdrawTarget.title}</strong>》。撤回后将转存为<strong>草稿</strong>状态，您可以补充资料后重新提交。
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setWithdrawTarget(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (onWithdrawReport) {
                    onWithdrawReport(withdrawTarget.id);
                  }
                  setWithdrawTarget(null);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                确认撤回
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-gray-200">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-gray-900">确认删除记录？</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              确定要删除《<strong className="text-gray-900">{deleteTarget.title}</strong>》吗？此操作无法撤销。
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (onDeleteReport) {
                    onDeleteReport(deleteTarget.id);
                  }
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-edit & Resubmit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <FileEdit className="w-5 h-5 text-[#1E5ABB]" />
                <h3 className="text-base font-bold text-gray-900">
                  {editTarget.auditStatus === '被驳回' || editTarget.auditStatus === '已驳回' ? '修改补充并重新提交' : '编辑草稿速报'}
                </h3>
              </div>
              <button
                onClick={() => setEditTarget(null)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer font-mono"
              >
                ✕
              </button>
            </div>

            {editTarget.rejectReason && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                <p className="font-bold flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>原审核驳回意见：</span>
                </p>
                <p className="mt-1 pl-4.5">{editTarget.rejectReason}</p>
              </div>
            )}

            <form onSubmit={handleSaveAndResubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">事件标题 *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1E5ABB] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">发生地址 *</label>
                  <input
                    type="text"
                    required
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="如：西坝区建设路38号"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1E5ABB] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">涉及区域 *</label>
                  <select
                    value={editRegion}
                    onChange={(e) => setEditRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none"
                  >
                    <option value="西坝区">西坝区</option>
                    <option value="南坝区">南坝区</option>
                    <option value="北屯区">北屯区</option>
                    <option value="全市">全市</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">信息类型 *</label>
                  <select
                    value={editInfoType}
                    onChange={(e) => setEditInfoType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none"
                  >
                    <option value="突发事件">突发事件</option>
                    <option value="舆情动态">舆情动态</option>
                    <option value="政策解读">政策解读</option>
                    <option value="民生诉求">民生诉求</option>
                    <option value="网络谣言">网络谣言</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">内容摘要 *</label>
                <textarea
                  rows={3}
                  required
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1E5ABB] outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">核心诉求 / 关键信息</label>
                <textarea
                  rows={2}
                  value={editCoreDemands}
                  onChange={(e) => setEditCoreDemands(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1E5ABB] outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg font-semibold shadow-sm flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>提交审核</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
