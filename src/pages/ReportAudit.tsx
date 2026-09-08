import React, { useState, useEffect } from 'react';
import { PaginationBar } from '../components/PaginationBar';
import { OrgPathDisplay, getOrganizationPathText } from '../components/OrgPathDisplay';
import { AuditStatusBadge } from '../components/AuditStatusBadge';
import { ReportOriginBadge } from '../components/ReportOriginBadge';
import { ReportItem, PageId } from '../types';
import { isFinalAuditStage } from '../auditStage';
import { AuditDetail } from './AuditDetail';
import {
  Search,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Link as LinkIcon,
  Layers,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  List,
  LayoutGrid,
  MapPin,
  Calendar,
  Sparkles,
  Zap,
  Copy,
  Trash2,
  Building2,
  TrendingUp,
  FileText
} from 'lucide-react';

interface ReportAuditProps {
  auditPendingList: ReportItem[];
  allReports?: ReportItem[];
  initialDrawerReport?: ReportItem | null;
  onSelectAudit: (report: ReportItem) => void;
  onApproveAudit?: (id: number, score?: number, isBatch?: boolean) => void;
  onRejectAudit?: (id: number, reason: string, detail: string) => void;
  onBatchApprove?: (ids: number[], score?: number) => void;
  onBatchReject?: (ids: number[], reason: string, detail: string) => void;
  onDeleteReport: (id: number) => void;
  onNavigate: (page: PageId) => void;
}

export const ReportAudit: React.FC<ReportAuditProps> = ({
  auditPendingList,
  allReports = [],
  initialDrawerReport,
  onSelectAudit,
  onApproveAudit,
  onRejectAudit,
  onBatchApprove,
  onBatchReject,
  onDeleteReport,
  onNavigate
}) => {
  // Navigation tabs & Filter States
  const [activeTab, setActiveTab] = useState<'待审核' | '已驳回' | '已通过' | '已采纳' | '全部'>('待审核');
  const [keyword, setKeyword] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('全部');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isBatchMatchActive, setIsBatchMatchActive] = useState(false);

  // 50% Right Drawer State
  const [drawerReport, setDrawerReport] = useState<ReportItem | null>(initialDrawerReport || null);

  useEffect(() => {
    if (initialDrawerReport) {
      setDrawerReport(initialDrawerReport);
    }
  }, [initialDrawerReport]);

  const handleOpenAuditDrawer = (item: ReportItem) => {
    onSelectAudit(item);
    setDrawerReport(item);
  };

  const handleCloseAuditDrawer = () => {
    setDrawerReport(null);
    onNavigate('report-audit');
  };

  // Modal States
  const [batchModalGroup, setBatchModalGroup] = useState<{ url: string; items: ReportItem[] } | null>(null);
  const [batchActionMode, setBatchActionMode] = useState<'reject' | 'pass'>('reject');
  const [batchRejectReason, setBatchRejectReason] = useState('内容重复/同源');
  const [batchRejectDetail, setBatchRejectDetail] = useState('属于相同来源链接/同地址重复表达，要素存在遗漏，批量予以驳回。');
  const [batchScore, setBatchScore] = useState(5);

  // URL Jump Live Preview Modal
  const [previewUrlItem, setPreviewUrlItem] = useState<ReportItem | null>(null);

  // Single Quick Audit Modal
  const [quickAuditItem, setQuickAuditItem] = useState<ReportItem | null>(null);
  const [quickAuditMode, setQuickAuditMode] = useState<'pass' | 'reject'>('pass');
  const [quickScore, setQuickScore] = useState(5);
  const [quickRejectReason, setQuickRejectReason] = useState('信息不完整');
  const [quickRejectDetail, setQuickRejectDetail] = useState('');

  // Source list for auditing
  const sourceList = allReports.length > 0 ? allReports : auditPendingList;

  // Extract all distinct organizations for the dropdown filter
  const orgOptions = ['全部', ...Array.from(new Set(sourceList.map((r) => r.organization).filter(Boolean)))];

  // KPI Calculations
  const pendingCount = sourceList.filter((r) => r.auditStatus === '待审核').length;
  const passedCount = sourceList.filter((r) => r.auditStatus === '已通过' || r.auditStatus === '已转办').length;
  const auditedCount = sourceList.filter((r) => r.auditStatus === '已通过' || r.auditStatus === '已转办' || r.auditStatus === '已采纳').length;
  const rejectedCount = sourceList.filter((r) => r.auditStatus === '被驳回' || r.auditStatus === '已驳回').length;
  const adoptedCount = sourceList.filter((r) => r.auditStatus === '已采纳').length;
  const totalAuditPool = sourceList.length;
  const processedRate = totalAuditPool > 0 ? Math.round(((auditedCount + rejectedCount) / totalAuditPool) * 100) : 29;

  // Filtered List
  const filtered = sourceList.filter((item) => {
    // Tab Filter
    if (activeTab === '待审核' && item.auditStatus !== '待审核') return false;
    if (activeTab === '已驳回' && item.auditStatus !== '被驳回' && item.auditStatus !== '已驳回') return false;
    if (activeTab === '已通过' && item.auditStatus !== '已通过' && item.auditStatus !== '已转办') return false;
    if (activeTab === '已采纳' && item.auditStatus !== '已采纳') return false;

    // Search filters (智能综合模糊检索: 标题、内容描述、上报人、机构、地址等)
    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchAuthor = item.author?.toLowerCase().includes(q);
      const matchSummary = item.detailContent?.summary?.toLowerCase().includes(q);
      const matchSource = item.source?.toLowerCase().includes(q);
      const matchOrg = item.organization?.toLowerCase().includes(q);
      const matchOrgPath = getOrganizationPathText(item.organization).toLowerCase().includes(q);
      const matchAddress = item.occurAddress?.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchSummary && !matchSource && !matchOrg && !matchOrgPath && !matchAddress) {
        return false;
      }
    }

    // Organization filter
    if (selectedOrg !== '全部' && item.organization !== selectedOrg) return false;

    if (startDate && item.submitTime < startDate) return false;
    if (endDate && item.submitTime > endDate) return false;

    return true;
  });

  // Calculate URL Clusters for Batch Matching (Group by matchUrl for pending items in filtered)
  const pendingFiltered = filtered.filter((r) => r.auditStatus === '待审核');
  const urlGroups: { [url: string]: ReportItem[] } = {};
  pendingFiltered.forEach((item) => {
    if (item.matchUrl) {
      if (!urlGroups[item.matchUrl]) {
        urlGroups[item.matchUrl] = [];
      }
      urlGroups[item.matchUrl].push(item);
    }
  });

  // Groups with >= 2 items
  const matchedClusters = Object.entries(urlGroups)
    .filter(([_, items]) => items.length >= 2)
    .map(([url, items]) => ({ url, items }));

  // Set of item IDs that are included in matched clusters
  const clusteredItemIds = new Set<number>();
  matchedClusters.forEach((cluster) => {
    cluster.items.forEach((item) => clusteredItemIds.add(item.id));
  });

  // Non-clustered pending reports or other remaining reports
  const otherPendingItems = filtered.filter((item) => !clusteredItemIds.has(item.id));

  const handleReset = () => {
    setKeyword('');
    setSelectedOrg('全部');
    setStartDate('');
    setEndDate('');
    setActiveTab('待审核');
    setIsBatchMatchActive(false);
  };

  // Pagination (页码管理 + 每页条数设置)
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, keyword, selectedOrg, startDate, endDate, isBatchMatchActive]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedReports = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const openBatchModal = (cluster: { url: string; items: ReportItem[] }) => {
    setBatchModalGroup(cluster);
    setBatchActionMode('reject');
    setBatchRejectReason('内容重复/同源');
    setBatchRejectDetail('属于相同来源链接/同地址重复表达，要素存在遗漏，批量予以驳回。');
    setBatchScore(5);
  };

  const handleExecuteBatchAudit = () => {
    if (!batchModalGroup) return;
    const ids = batchModalGroup.items.map((i) => i.id);

    if (batchActionMode === 'reject') {
      if (onBatchReject) {
        onBatchReject(ids, batchRejectReason, batchRejectDetail);
      } else if (onRejectAudit) {
        ids.forEach((id) => onRejectAudit(id, batchRejectReason, batchRejectDetail));
      }
    } else {
      const canScore = batchModalGroup.items.every((item) => isFinalAuditStage(item));
      if (onBatchApprove) {
        onBatchApprove(ids, canScore ? batchScore : undefined);
      } else if (onApproveAudit) {
        ids.forEach((id) => {
          const item = batchModalGroup.items.find((candidate) => candidate.id === id);
          onApproveAudit(id, item && isFinalAuditStage(item) ? batchScore : undefined, true);
        });
      }
    }
    setBatchModalGroup(null);
  };

  const handleExecuteQuickAudit = () => {
    if (!quickAuditItem) return;
    if (quickAuditMode === 'pass') {
      if (onApproveAudit) {
        onApproveAudit(
          quickAuditItem.id,
          isFinalAuditStage(quickAuditItem) ? quickScore : undefined,
          false
        );
      }
    } else {
      if (onRejectAudit) onRejectAudit(quickAuditItem.id, quickRejectReason, quickRejectDetail);
    }
    setQuickAuditItem(null);
  };

  return (
    <div className="space-y-5" id="report-audit-view">
      {/* 1. Header & KPI Cards Area (Harmonized with ReportSummary Workbench) */}
      <div className="bg-gradient-to-r from-blue-700 via-[#1E5ABB] to-blue-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        {/* Background ambient accents */}
        <div className="absolute right-0 top-0 w-96 h-full bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/15">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <h2 className="text-xl font-bold tracking-tight">【审核员】审核数据统计</h2>
            </div>
            <p className="text-xs text-blue-100/80 mt-1 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>集中处理审核待办、同源批量匹配及审核记录事项 · 审核待办</span>
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => onNavigate('audit-records')}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-lg border border-white/20 transition-all flex items-center space-x-1.5 cursor-pointer"
              title="查看历史审核记录台账"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>审核记录台账</span>
            </button>
          </div>
        </div>

        {/* 4 Large Translucent Metric Cards (Matching ReportSummary Exactly) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-5 relative z-10">
          {/* Card 1: 审核待办 */}
          <div
            onClick={() => setActiveTab('待审核')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 transition-all cursor-pointer backdrop-blur-sm"
            id="kpi-audit-pending"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-100">审核待办</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/30 text-amber-200 font-bold border border-amber-400/40">
                待办事项
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-white">{pendingCount}</span>
              <span className="text-xs text-blue-200">
                同源待合审 <strong className="text-amber-300">{matchedClusters.reduce((acc, c) => acc + c.items.length, 0)}</strong>
              </span>
            </div>
          </div>

          {/* Card 2: 累计审核 */}
          <div
            onClick={() => setActiveTab('全部')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 transition-all cursor-pointer group backdrop-blur-sm"
            id="kpi-audit-completed"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-100">累计审核</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-white">{passedCount + rejectedCount}</span>
              <span className="text-xs text-blue-200">
                通过 <strong className="text-emerald-300">{passedCount}</strong> · 驳回 <strong className="text-rose-300">{rejectedCount}</strong>
              </span>
            </div>
          </div>

          {/* Card 3: 审核处理率 */}
          <div className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-100">审核处理率</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/30 text-emerald-200 font-bold border border-emerald-400/40">
                {auditedCount + rejectedCount}/{totalAuditPool}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-emerald-300">{processedRate}%</span>
              <span className="text-xs text-blue-200">
                审核流转高效敏捷
              </span>
            </div>
          </div>

          {/* Card 4: 平均响应时长 */}
          <div className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-100">平均响应</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-400/30 text-cyan-200 font-bold border border-cyan-400/40">
                优于标准
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-cyan-300">&lt; 1 小时</span>
              <span className="text-xs text-blue-200">
                满足突发响应指标
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Unified Search & Filter Bar with Screenshot Style + Smart Matching */}
      <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
        {/* Filter items with inline label and input */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 text-xs">
          {/* 事件标题 */}
          <div className="flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="请输入事件标题名称、内容描述关键词、上报人员姓名进行检索"
                className="w-full pl-8 pr-8 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#1E5ABB] rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 transition-all shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                  title="清空"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 报送时间 */}
          <div className="flex items-center space-x-2 shrink-0">
            <label className="text-gray-700 font-semibold whitespace-nowrap shrink-0">报送时间</label>
            <div className="flex items-center space-x-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-32 px-2.5 py-2 border border-gray-300 hover:border-gray-400 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] bg-white text-gray-700 shadow-2xs"
              />
              <span className="text-gray-400 font-bold">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-32 px-2.5 py-2 border border-gray-300 hover:border-gray-400 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] bg-white text-gray-700 shadow-2xs"
              />
            </div>
          </div>

          {/* 上报机构 */}
          <div className="flex items-center space-x-2 shrink-0 min-w-[200px]">
            <label className="text-gray-700 font-semibold whitespace-nowrap shrink-0">上报机构</label>
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 hover:border-gray-400 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] bg-white text-gray-700 shadow-2xs cursor-pointer"
            >
              {orgOptions.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          {/* Batch Match Toggle Button */}
          <div>
            <button
              onClick={() => setIsBatchMatchActive(!isBatchMatchActive)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs ${
                isBatchMatchActive
                  ? 'bg-[#F26522] hover:bg-[#D9531E] text-white border border-[#D9531E]/30'
                  : 'bg-[#1E5ABB] hover:bg-[#134092] text-white border border-[#134092]/30'
              }`}
              title="智能识别并聚合来自相同链接/同地址的多条网格员速报"
              id="btn-batch-match-toggle"
            >
              {isBatchMatchActive ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>取消匹配</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>批量匹配</span>
                </>
              )}
              {isBatchMatchActive && matchedClusters.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-mono ml-1">
                  {matchedClusters.length}组
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 border border-gray-200 p-0.5 rounded-lg bg-gray-50 text-xs mr-2">
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

            <button
              onClick={() => {}}
              className="px-5 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center space-x-1.5 active:scale-98"
            >
              <Search className="w-3.5 h-3.5" />
              <span>查询</span>
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 transition-colors cursor-pointer flex items-center space-x-1.5 active:scale-98"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Content: In-Table Clustered View or Cards */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/90 border-b border-gray-200 text-gray-600 font-semibold">
                  <th className="py-3.5 px-4 w-12 text-center">序号</th>
                  <th className="py-3.5 px-4 min-w-[240px]">事件标题</th>
                  <th className="py-3.5 px-4 min-w-[200px]">内容描述</th>
                  <th className="py-3.5 px-4 min-w-[170px] whitespace-nowrap">上报人员 / 机构</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">报送时间</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">审核状态</th>
                  <th className="py-3.5 px-4 text-center min-w-[140px] whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      当前筛选条件下暂无待审核记录
                    </td>
                  </tr>
                ) : isBatchMatchActive && matchedClusters.length > 0 ? (
                  <>
                    {/* Render Each Matched Cluster Group as In-Table Section */}
                    {matchedClusters.map((cluster, cIdx) => (
                      <React.Fragment key={`cluster-${cIdx}`}>
                        {/* Cluster Header Row */}
                        <tr className="bg-amber-50/90 border-t border-b border-amber-200">
                          <td colSpan={7} className="py-2.5 px-4">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center space-x-2.5 min-w-0">
                                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                  <LinkIcon className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-bold text-gray-900 text-xs shrink-0">相同的上报链接</span>
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-amber-900 shrink-0">
                                  {cluster.items.length} 条关联
                                </span>
                                <span className="text-[11px] text-amber-800/80 font-mono truncate max-w-md" title={cluster.url}>
                                  链接: {cluster.url}
                                </span>
                                {cluster.items[0] && (
                                  <button
                                    onClick={() => setPreviewUrlItem(cluster.items[0])}
                                    className="text-[#1E5ABB] hover:underline text-[11px] shrink-0 font-medium inline-flex items-center space-x-0.5 cursor-pointer ml-1"
                                    title="预览该链接内容"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>预览链接</span>
                                  </button>
                                )}
                              </div>

                              <button
                                onClick={() => openBatchModal(cluster)}
                                className="px-3.5 py-1.5 bg-[#F26522] hover:bg-[#D9531E] text-white text-xs font-bold rounded-lg shadow-2xs transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer active:scale-98"
                              >
                                <Layers className="w-3.5 h-3.5" />
                                <span>批量审核</span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Cluster Child Rows */}
                        {cluster.items.map((item, itemIdx) => {
                          const isPending = item.auditStatus === '待审核';
                          const isRejected = item.auditStatus === '被驳回' || item.auditStatus === '已驳回';
                          const isAdopted = item.auditStatus === '已采纳' || item.auditStatus === '已通过';

                          return (
                            <tr key={`cluster-item-${item.id}`} className="hover:bg-amber-50/30 transition-colors">
                              <td className="py-3 px-4 text-center text-amber-800/70 font-mono text-xs">{itemIdx + 1}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleOpenAuditDrawer(item)}
                                    className="text-blue-700 hover:text-blue-900 hover:underline font-bold text-left cursor-pointer block leading-snug"
                                  >
                                    {item.title}
                                  </button>
                                  <ReportOriginBadge report={item} size="sm" className="shrink-0" />
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-500 text-xs">
                                <span className="line-clamp-2" title={item.detailContent?.summary || item.title}>
                                  {item.detailContent?.summary || '暂无内容描述'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-gray-900 leading-snug">{item.author}</div>
                                <OrgPathDisplay organization={item.organization} className="max-w-[220px]" />
                              </td>
                              <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap text-xs">
                                {item.submitTime}
                              </td>
                              <td className="py-3 px-4 text-center">
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
                                      title={`驳回原因：${item.rejectReason || '信息要素不全，请核实后补充提交。'}`}
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
                                        {item.rejectReason || '信息要素不全，请核实后补充提交。'}
                                      </p>
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                    </div>
                                  </div>
                                )}
                                {isAdopted && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    {item.auditStatus}
                                  </span>
                                )}
                                {!isPending && !isRejected && !isAdopted && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                    {item.auditStatus}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center space-x-2">
                                  <span className="text-[#F26522] font-semibold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    已匹配
                                  </span>
                                  <button
                                    onClick={() => handleOpenAuditDrawer(item)}
                                    className="text-[#1E5ABB] hover:underline font-bold text-xs cursor-pointer"
                                  >
                                    {isPending ? '审核' : '详情'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}

                    {/* Section Header for Other Pending Items */}
                    {otherPendingItems.length > 0 && (
                      <tr className="bg-gray-50/80 border-t-2 border-b border-gray-200">
                        <td colSpan={7} className="py-2.5 px-4 font-bold text-gray-700 text-xs">
                          <div className="flex items-center justify-between">
                            <span>其他待审核报送 ({otherPendingItems.length} 条)</span>
                            <span className="text-[11px] text-gray-400 font-normal">支持单独逐条进行详细审核或快捷处置</span>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Render Other Items */}
                    {otherPendingItems.map((item, itemIdx) => {
                      const isPending = item.auditStatus === '待审核';
                      const isRejected = item.auditStatus === '被驳回' || item.auditStatus === '已驳回';
                      const isAdopted = item.auditStatus === '已采纳' || item.auditStatus === '已通过';

                      return (
                        <tr key={`other-item-${item.id}`} className="hover:bg-blue-50/20 transition-colors">
                          <td className="py-3 px-4 text-center text-gray-400 font-mono text-xs">{itemIdx + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenAuditDrawer(item)}
                                className="text-blue-700 hover:text-blue-900 hover:underline font-bold text-left cursor-pointer block leading-snug"
                              >
                                {item.title}
                              </button>
                              <ReportOriginBadge report={item} size="sm" className="shrink-0" />
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-500 text-xs">
                            <span className="line-clamp-2" title={item.detailContent?.summary || item.title}>
                              {item.detailContent?.summary || '暂无内容描述'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-900 leading-snug">{item.author}</div>
                            <OrgPathDisplay organization={item.organization} className="max-w-[220px]" />
                          </td>
                          <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap text-xs">
                            {item.submitTime}
                          </td>
                          <td className="py-3 px-4 text-center">
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
                                  title={`驳回原因：${item.rejectReason || '信息要素不全，请核实后补充提交。'}`}
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
                                    {item.rejectReason || '信息要素不全，请核实后补充提交。'}
                                  </p>
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                </div>
                              </div>
                            )}
                            {isAdopted && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  {item.auditStatus}
                              </span>
                            )}
                            {!isPending && !isRejected && !isAdopted && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                {item.auditStatus}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleOpenAuditDrawer(item)}
                                className="text-[#1E5ABB] hover:text-[#134092] hover:underline font-bold text-xs cursor-pointer"
                              >
                                {isPending ? '审核' : '详情'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </>
                ) : (
                  /* Flat table when matching is disabled or no clusters */
                  pagedReports.map((item, index) => {
                    const isPending = item.auditStatus === '待审核';
                    const isRejected = item.auditStatus === '被驳回' || item.auditStatus === '已驳回';
                    const isAdopted = item.auditStatus === '已采纳' || item.auditStatus === '已通过';

                    return (
                      <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="py-3 px-4 text-center text-gray-400 font-mono text-xs">{(safePage - 1) * pageSize + index + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenAuditDrawer(item)}
                              className="text-blue-700 hover:text-blue-900 hover:underline font-bold text-left cursor-pointer block leading-snug"
                            >
                              {item.title}
                            </button>
                            <ReportOriginBadge report={item} size="sm" className="shrink-0" />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs">
                          <span className="line-clamp-2" title={item.detailContent?.summary || item.title}>
                            {item.detailContent?.summary || '暂无内容描述'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900 leading-snug">{item.author}</div>
                          <OrgPathDisplay organization={item.organization} className="max-w-[220px]" />
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap text-xs">
                          {item.submitTime}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
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
                                title={`驳回原因：${item.rejectReason || '信息要素不全，请核实后补充提交。'}`}
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
                                  {item.rejectReason || '信息要素不全，请核实后补充提交。'}
                                </p>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                              </div>
                            </div>
                          )}
                          {isAdopted && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {item.auditStatus}
                            </span>
                          )}
                          {!isPending && !isRejected && !isAdopted && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              {item.auditStatus}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleOpenAuditDrawer(item)}
                              className="text-[#1E5ABB] hover:text-[#134092] hover:underline font-bold text-xs cursor-pointer"
                            >
                                {isPending ? '审核' : '详情'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          <div className="bg-gray-50/80 border-t border-gray-100">
            <PaginationBar
              total={filtered.length}
              page={safePage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      ) : (
        /* Card Grid View (PC Adapted Responsive Cards) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              当前分类下暂无待处理记录
            </div>
          ) : (
            pagedReports.map((item) => {
              const isPending = item.auditStatus === '待审核';
              const isRejected = item.auditStatus === '被驳回' || item.auditStatus === '已驳回';
              const isAdopted = item.auditStatus === '已采纳' || item.auditStatus === '已通过';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-all p-4.5 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <h4
                          onClick={() => handleOpenAuditDrawer(item)}
                          className="text-xs font-bold text-gray-900 hover:text-[#1E5ABB] cursor-pointer line-clamp-2 leading-snug"
                        >
                          {item.title}
                        </h4>
                        <ReportOriginBadge report={item} size="sm" className="shrink-0" />
                      </div>
                      <AuditStatusBadge status={item.auditStatus} className="shrink-0" />
                    </div>

                    {/* Match URL Link tag */}
                    {item.matchUrl && (
                      <div
                        onClick={() => setPreviewUrlItem(item)}
                        className="p-1.5 bg-blue-50/80 rounded border border-blue-200/80 text-[11px] text-[#1E5ABB] hover:underline cursor-pointer flex items-center justify-between"
                      >
                        <span className="truncate font-mono">{item.matchUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 ml-1" />
                      </div>
                    )}

                    {/* Summary */}
                    {item.detailContent?.summary && (
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed bg-gray-50/50 p-2 rounded">
                        {item.detailContent.summary}
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex min-w-0 flex-col text-[11px]">
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-800 font-medium">{item.author}</span>
                        <span>·</span>
                        <span className="font-mono">{item.submitTime.slice(5)}</span>
                      </div>
                      <OrgPathDisplay organization={item.organization} compact className="max-w-[210px]" />
                    </div>

                    <button
                      onClick={() => handleOpenAuditDrawer(item)}
                      className="px-3 py-1 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg font-bold text-xs flex items-center space-x-0.5 cursor-pointer shadow-2xs"
                    >
                      <span>{isPending ? '审核' : '详情'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
          {/* Cards Footer / Pagination */}
          <div className="col-span-full mt-4 rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden bg-gray-50/80">
            <PaginationBar
              total={filtered.length}
              page={safePage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      )}

      {/* 6. Batch Audit Modal (Matching mobile screenshots 3, 4, 5) */}
      {batchModalGroup && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div className="bg-amber-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5" />
                <h3 className="text-base font-bold">批量审核</h3>
              </div>
              <button
                onClick={() => setBatchModalGroup(null)}
                className="text-white/80 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Linked URL box */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center space-x-1.5 text-amber-900 font-bold">
                  <LinkIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">相同上报链接: {batchModalGroup.url}</span>
                </div>
                <p className="text-[11px] text-amber-800 font-medium">
                  统一处理下列 {batchModalGroup.items.length} 条由不同网格员提交的相关速报:
                </p>

                <div className="space-y-1.5 pt-1">
                  {batchModalGroup.items.map((item, idx) => (
                    <div key={item.id} className="p-2 bg-white rounded-lg border border-amber-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-800 truncate">{idx + 1}. {item.title}</span>
                      <span className="text-[10px] text-gray-400 shrink-0 ml-2" title={getOrganizationPathText(item.organization)}>
                        {getOrganizationPathText(item.organization)} · {item.author}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mode Toggle: Reject vs Pass */}
              {batchActionMode === 'reject' ? (
                /* Mode: Reject (驳回重修) */
                <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl space-y-3 animate-in fade-in">
                  <div className="flex items-center space-x-1.5 text-rose-700 font-bold">
                    <X className="w-4 h-4" />
                    <span>驳回重修</span>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">驳回原因</label>
                    <select
                      value={batchRejectReason}
                      onChange={(e) => setBatchRejectReason(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-white outline-none"
                    >
                      <option value="内容重复/同源">内容重复/同源</option>
                      <option value="信息不完整">信息不完整</option>
                      <option value="非本辖区职责">非本辖区职责</option>
                      <option value="佐证不足">佐证不足</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">详细驳回意见及修改指引</label>
                    <textarea
                      rows={3}
                      value={batchRejectDetail}
                      onChange={(e) => setBatchRejectDetail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none text-gray-700"
                    />
                  </div>
                </div>
              ) : (
                /* Mode: Pass (审核通过) */
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3 animate-in fade-in">
                  <div className="flex items-center space-x-1.5 text-emerald-700 font-bold">
                    <Check className="w-4 h-4" />
                    <span>{batchModalGroup.items.every((item) => isFinalAuditStage(item)) ? '审核通过并评分' : '审核通过'}</span>
                  </div>

                  <p className="text-[11px] text-emerald-800 bg-white p-2.5 rounded-lg border border-emerald-100">
                    确认后将批量审核通过这 {batchModalGroup.items.length} 条速报，并合并流转进入下一处理节点。
                  </p>

                  {batchModalGroup.items.every((item) => isFinalAuditStage(item)) && (
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">终审评分</label>
                      <div className="flex flex-wrap gap-2">
                        {[5, 3, 1, 0.5, 0].map((score) => (
                          <button
                            key={score}
                            type="button"
                            onClick={() => setBatchScore(score)}
                            className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
                              batchScore === score ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {score}分
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {batchActionMode === 'reject' ? (
                  <>
                    <button
                      type="button"
                      onClick={handleExecuteBatchAudit}
                      className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>确认驳回 ({batchModalGroup.items.length}条)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBatchActionMode('pass')}
                      className="py-2.5 bg-white border border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>改为通过</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setBatchActionMode('reject')}
                      className="py-2.5 bg-white border border-rose-500 text-rose-700 hover:bg-rose-50 font-bold rounded-xl flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>改为驳回</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteBatchAudit}
                      className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>确认通过 ({batchModalGroup.items.length}条)</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. URL Jump & Live Web Preview Modal (Matching Screenshot 6) */}
      {previewUrlItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <LinkIcon className="w-5 h-5" />
                <h3 className="text-sm font-bold">链接跳转详情页</h3>
              </div>
              <button
                onClick={() => setPreviewUrlItem(null)}
                className="text-white/80 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-gray-500 font-mono truncate">
                {previewUrlItem.matchUrl}
              </div>

              {/* Live Preview Card */}
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="h-44 bg-gray-200 relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop"
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-white rounded text-[10px]">
                    跳转链接: {new URL(previewUrlItem.matchUrl || 'https://news.example.com').hostname}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span className="font-bold text-amber-600">{previewUrlItem.source}</span>
                    <span>{previewUrlItem.submitTime}</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 leading-snug">{previewUrlItem.title}</h4>
                  <p className="text-gray-500 text-[11px]">{getOrganizationPathText(previewUrlItem.organization)} · {previewUrlItem.author}</p>
                  <p className="text-gray-600 leading-relaxed pt-1 border-t border-gray-100">
                    {previewUrlItem.detailContent?.summary || previewUrlItem.title}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setPreviewUrlItem(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold"
                >
                  关闭
                </button>
                <a
                  href={previewUrlItem.matchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg font-semibold flex items-center space-x-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>浏览器直接打开</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Single Quick Audit Modal */}
      {quickAuditItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">
                {quickAuditMode === 'pass' ? '快速审核通过' : '快速驳回速报'}
              </h3>
              <button
                onClick={() => setQuickAuditItem(null)}
                className="text-gray-400 hover:text-gray-600 font-mono"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-700 font-bold truncate">
              《{quickAuditItem.title}》
            </p>

            {quickAuditMode === 'pass' ? (
              <div className="space-y-3 text-xs">
                {isFinalAuditStage(quickAuditItem) ? (
                  <>
                    <label className="block text-gray-600 font-medium">终审评分</label>
                    <div className="flex flex-wrap gap-2">
                      {[5, 3, 1, 0.5, 0].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setQuickScore(s)}
                          className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
                            quickScore === s ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {s}分
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="rounded-lg border border-blue-100 bg-blue-50 p-2.5 text-blue-700">
                    当前为前置审核，通过后进入下一审核节点。
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">驳回原因</label>
                  <select
                    value={quickRejectReason}
                    onChange={(e) => setQuickRejectReason(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-white outline-none"
                  >
                    <option value="信息不完整">信息不完整</option>
                    <option value="内容重复/同源">内容重复/同源</option>
                    <option value="非本辖区职责">非本辖区职责</option>
                    <option value="佐证材料缺失">佐证材料缺失</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">详细修改指引</label>
                  <textarea
                    rows={2}
                    value={quickRejectDetail}
                    onChange={(e) => setQuickRejectDetail(e.target.value)}
                    placeholder="请输入修改意见..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setQuickAuditItem(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-xs"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleExecuteQuickAudit}
                className={`px-4 py-2 text-white rounded-lg font-semibold text-xs shadow-sm flex items-center space-x-1 ${
                  quickAuditMode === 'pass' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {quickAuditMode === 'pass' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>确认{quickAuditMode === 'pass' ? '通过' : '驳回'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 50% 占屏右侧抽屉展示审核详情 */}
      {drawerReport && (
        <AuditDetail
          report={drawerReport}
          allReports={allReports}
          isDrawer={true}
          onClose={handleCloseAuditDrawer}
          onApprove={(id, score, isBatch) => {
            onApproveAudit?.(id, score, isBatch);
            handleCloseAuditDrawer();
          }}
          onReject={(id, reason, detail) => {
            onRejectAudit?.(id, reason, detail);
            handleCloseAuditDrawer();
          }}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};
