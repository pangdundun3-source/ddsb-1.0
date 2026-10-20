import React, { useState, useEffect } from 'react';
import { PaginationBar } from '../components/PaginationBar';
import { OrgPathDisplay, getOrganizationPathText } from '../components/OrgPathDisplay';
import { AuditStatusBadge } from '../components/AuditStatusBadge';
import { IdentificationBadge } from '../components/IdentificationBadge';
import { resolveIdentification } from '../services/identificationService';
import { ReportItem, PageId } from '../types';
import { isFinalAuditStage } from '../auditStage';
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
  MapPin,
  Sparkles,
  Zap,
  Copy,
  Trash2,
  Building2,
  TrendingUp,
  FileText
} from 'lucide-react';
import { DateRangeField } from '../components/DateRangeField';
import { OrgFilterSelect } from '../components/OrgFilterSelect';
import { INITIAL_ORG_NODES, matchOrganizationByFilter } from '../data/userOrgShared';

interface ReportAuditProps {
  auditPendingList: ReportItem[];
  allReports?: ReportItem[];
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
  /** 上报机构：外部联系人组织树节点 id；null = 全部 */
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isBatchMatchActive, setIsBatchMatchActive] = useState(false);

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

    // 上报机构：外部联系人组织树，选中节点含下级
    if (!matchOrganizationByFilter(item.organization, selectedOrgId, INITIAL_ORG_NODES)) return false;

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
    setSelectedOrgId(null);
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
  }, [activeTab, keyword, selectedOrgId, startDate, endDate, isBatchMatchActive]);

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

  const renderStatusChip = (item: ReportItem) => {
    const isPending = item.auditStatus === '待审核';
    const isRejected = item.auditStatus === '被驳回' || item.auditStatus === '已驳回';
    const isAdopted = item.auditStatus === '已采纳' || item.auditStatus === '已通过';
    const tone = isPending
      ? 'bg-amber-50 text-amber-700'
      : isRejected
        ? 'bg-rose-50 text-rose-700'
        : isAdopted
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-blue-50 text-blue-700';
    return (
      <span className={`shrink-0 px-1.5 py-px rounded text-[11px] font-medium ${tone}`}>
        {isPending ? '待审核' : isRejected ? '已驳回' : item.auditStatus}
      </span>
    );
  };

  const renderAuditRow = (item: ReportItem, seq: number, matched = false) => {
    const isPending = item.auditStatus === '待审核';
    const isRejected = item.auditStatus === '被驳回' || item.auditStatus === '已驳回';
    const openDetail = () => {
      onSelectAudit(item);
      onNavigate('audit-detail');
    };
    return (
      <div key={`${matched ? 'cluster' : 'row'}-${item.id}`} className={`px-5 py-3.5 flex gap-3 transition-colors ${matched ? 'hover:bg-amber-50/40' : 'hover:bg-gray-50/70'}`}>
        <span className={`w-6 shrink-0 text-center font-mono text-xs mt-0.5 ${matched ? 'text-amber-700/70' : 'text-gray-400'}`}>{seq}</span>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              {renderStatusChip(item)}
              <button
                type="button"
                onClick={openDetail}
                title={item.title}
                className="text-sm font-semibold text-gray-900 hover:text-[#1E5ABB] text-left truncate min-w-0 cursor-pointer"
              >
                {item.title}
              </button>
              <IdentificationBadge
                status={resolveIdentification(item, allReports.length > 0 ? allReports : auditPendingList).status}
                size="xs"
                className="shrink-0"
              />
            </div>
            <div className="flex items-center gap-3 text-xs shrink-0">
              {matched && <span className="text-[#F26522] font-semibold bg-amber-50 px-1.5 py-px rounded">已匹配</span>}
              <button
                type="button"
                onClick={openDetail}
                className={`hover:underline cursor-pointer ${isPending ? 'text-[#1E5ABB] font-semibold' : 'text-gray-500 hover:text-gray-800'}`}
              >
                {isPending ? '审核' : '详情'}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 truncate" title={item.detailContent?.summary || item.title}>
            {item.detailContent?.summary || '暂无内容描述'}
          </p>
          <div className="flex items-center gap-1.5 min-w-0 whitespace-nowrap text-[11px] text-gray-400">
            <span className="shrink-0 px-1 rounded bg-gray-100 text-gray-500">上报人</span>
            <span className="shrink-0 text-gray-600">{item.author}</span>
            <span className="shrink-0 text-gray-300">·</span>
            <span title={getOrganizationPathText(item.organization)} className="truncate">{item.organization}</span>
            <span className="shrink-0 text-gray-300">·</span>
            <span className="shrink-0 font-mono">{item.submitTime}</span>
            {isRejected && (
              <span
                className="ml-2 inline-flex items-center gap-1 min-w-0 text-rose-500 cursor-help"
                title={`驳回原因：${item.rejectReason || '信息要素不全，请核实后补充提交。'}`}
              >
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span className="truncate">驳回原因：{item.rejectReason || '信息不完整'}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5" id="report-audit-view">
      {/* 1. Header & KPI Cards Area (Harmonized with ReportSummary Workbench) */}
      <div className="bg-gradient-to-r from-blue-700 via-[#1E5ABB] to-blue-800 rounded-xl px-5 py-4 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <h2 className="text-base font-bold tracking-tight">【审核员】审核数据统计</h2>
          <span className="text-[11px] text-blue-100/70 ml-1 truncate">集中处理审核待办、同源批量匹配及审核记录事项</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 relative z-10">
          <div
            onClick={() => setActiveTab('待审核')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3.5 py-2.5 transition-all cursor-pointer backdrop-blur-sm"
            id="kpi-audit-pending"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-100">审核待办</span>
              <span className="text-[10px] px-1.5 py-px rounded bg-amber-400/30 text-amber-200 font-bold border border-amber-400/40">待办事项</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-white">{pendingCount}</span>
              <span className="text-[11px] text-blue-200">
                同源待合审 <strong className="text-amber-300">{matchedClusters.reduce((acc, c) => acc + c.items.length, 0)}</strong>
              </span>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('全部')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3.5 py-2.5 transition-all cursor-pointer backdrop-blur-sm"
            id="kpi-audit-completed"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-100">累计审核</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-white">{passedCount + rejectedCount}</span>
              <span className="text-[11px] text-blue-200">
                通过 <strong className="text-emerald-300">{passedCount}</strong> · 驳回 <strong className="text-rose-300">{rejectedCount}</strong>
              </span>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-lg px-3.5 py-2.5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-100">审核处理率</span>
              <span className="text-[10px] px-1.5 py-px rounded bg-emerald-400/30 text-emerald-200 font-bold border border-emerald-400/40">
                {auditedCount + rejectedCount}/{totalAuditPool}
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-emerald-300">{processedRate}%</span>
              <span className="text-[11px] text-blue-200">审核流转高效敏捷</span>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-lg px-3.5 py-2.5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-100">平均响应</span>
              <span className="text-[10px] px-1.5 py-px rounded bg-cyan-400/30 text-cyan-200 font-bold border border-cyan-400/40">优于标准</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-cyan-300 whitespace-nowrap">&lt; 1 小时</span>
              <span className="text-[11px] text-blue-200 truncate ml-2">满足突发响应指标</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Unified Search & Filter Bar with Screenshot Style + Smart Matching */}
      <div className="bg-white rounded-xl px-5 py-4 border border-gray-200/80 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 text-xs">
          {/* 事件标题 */}
          <div className="flex-1 min-w-[160px]">
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
            <DateRangeField
              startValue={startDate}
              endValue={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
              title="报送时间区间"
              startTitle="报送开始日期"
              endTitle="报送结束日期"
            />
          </div>

          {/* 报送机构：外部联系人组织树，默认全部，支持下钻含子级 */}
          <div className="flex items-center space-x-2 min-w-0 shrink-0">
            <label className="text-gray-700 font-semibold whitespace-nowrap shrink-0">报送机构</label>
            <OrgFilterSelect value={selectedOrgId} onChange={setSelectedOrgId} />
          </div>

          <div className="flex items-center gap-2 shrink-0 lg:ml-auto">
            <button
              onClick={() => {}}
              className="px-3.5 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center space-x-1.5 active:scale-98"
            >
              <Search className="w-3.5 h-3.5" />
              <span>查询</span>
            </button>
            <button
              onClick={handleReset}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 transition-colors cursor-pointer flex items-center space-x-1.5 active:scale-98"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Content: In-Table Clustered View or Cards */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
          <div className="px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 bg-gray-50/70 border-b border-gray-100 text-xs">
            <span className="text-gray-600">
              共 <strong className="text-[#1E5ABB] font-mono">{filtered.length}</strong> 条报送
              {isBatchMatchActive && (
                <>
                  <span className="mx-2 text-gray-300">|</span>
                  已匹配 <strong className="text-[#F26522] font-mono">{matchedClusters.length}</strong> 组同源报送
                </>
              )}
            </span>
            <button
              type="button"
              onClick={() => setIsBatchMatchActive(!isBatchMatchActive)}
              title="智能识别并聚合来自相同链接/同地址的多条网格员速报"
              id="btn-batch-match-toggle"
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border font-semibold cursor-pointer transition-colors ${
                isBatchMatchActive
                  ? 'border-orange-200 bg-orange-50 text-[#F26522] hover:bg-orange-100'
                  : 'border-blue-200 bg-blue-50 text-[#1E5ABB] hover:bg-blue-100'
              }`}
            >
              {isBatchMatchActive ? <X className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
              {isBatchMatchActive ? '取消匹配' : '批量匹配'}
            </button>
          </div>
          <div className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    当前筛选条件下暂无待审核记录
                  </div>
                ) : isBatchMatchActive && matchedClusters.length > 0 ? (
                  <>
                    {/* Render Each Matched Cluster Group as In-Table Section */}
                    {matchedClusters.map((cluster, cIdx) => (
                      <React.Fragment key={`cluster-${cIdx}`}>
                        {/* Cluster Header Row */}
                        <div className="bg-amber-50/90 border-y border-amber-200 py-2.5 px-5 text-xs">
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
                                onClick={() => {
                                  const first = cluster.items[0];
                                  if (!first) return;
                                  onSelectAudit(first);
                                  onNavigate('audit-detail');
                                }}
                                className="px-3.5 py-1.5 bg-[#F26522] hover:bg-[#D9531E] text-white text-xs font-bold rounded-lg shadow-2xs transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer active:scale-98"
                                title="进入首条详情，在详情页勾选同源报送继续批量审核"
                              >
                                <Layers className="w-3.5 h-3.5" />
                                <span>批量审核</span>
                              </button>
                            </div>
                        </div>

                        {cluster.items.map((item, itemIdx) => renderAuditRow(item, itemIdx + 1, true))}
                      </React.Fragment>
                    ))}

                    {/* Section Header for Other Pending Items */}
                    {otherPendingItems.length > 0 && (
                      <div className="bg-gray-50/80 border-y border-gray-200 py-2.5 px-5 font-bold text-gray-700 text-xs">
                        <div className="flex items-center justify-between">
                          <span>其他待审核报送 ({otherPendingItems.length} 条)</span>
                          <span className="text-[11px] text-gray-400 font-normal">支持单独逐条进行详细审核或快捷处置</span>
                        </div>
                      </div>
                    )}

                    {otherPendingItems.map((item, itemIdx) => renderAuditRow(item, itemIdx + 1))}
                  </>
                ) : (
                  pagedReports.map((item, index) => renderAuditRow(item, (safePage - 1) * pageSize + index + 1))
                )}
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
    </div>
  );
};
