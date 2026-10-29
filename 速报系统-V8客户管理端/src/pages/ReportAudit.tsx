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
  Check,
  X,
  ExternalLink,
  ChevronRight,
  MapPin,
  Sparkles,
  Copy,
  Trash2,
  Building2,
  TrendingUp,
  FileText
} from 'lucide-react';
import { DateRangeField } from '../components/DateRangeField';
import { OrgFilterSelect } from '../components/OrgFilterSelect';
import { INITIAL_ORG_NODES, matchOrganizationByFilter } from '../data/userOrgShared';
import { getAuditArrivedAt, getRejectTime } from '../services/reportWorkflowService';

interface ReportAuditProps {
  auditPendingList: ReportItem[];
  allReports?: ReportItem[];
  initialTab?: '待审核' | '已驳回';
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
  initialTab = '待审核',
  onSelectAudit,
  onApproveAudit,
  onRejectAudit,
  onDeleteReport,
  onNavigate
}) => {
  // Navigation tabs & Filter States
  const [activeTab, setActiveTab] = useState<'待审核' | '已驳回' | '已通过' | '全部'>(
    initialTab
  );
  const [keyword, setKeyword] = useState('');
  /** 上报机构：外部联系人组织树节点 id；null = 全部 */
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedAuditor, setSelectedAuditor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
  const auditorOptions = Array.from(
    new Set(sourceList.map((item) => item.auditor?.trim()).filter((name): name is string => Boolean(name)))
  ).sort((a, b) => a.localeCompare(b, 'zh-CN'));

  // KPI Calculations
  const pendingCount = sourceList.filter((r) => r.auditStatus === '待审核').length;
  const passedCount = sourceList.filter((r) => r.auditStatus === '已通过' || r.auditStatus === '已转办').length;
  const auditedCount = sourceList.filter((r) => r.auditStatus === '已通过' || r.auditStatus === '已转办' || r.auditStatus === '已采纳').length;
  const rejectedCount = sourceList.filter((r) => r.auditStatus === '被驳回' || r.auditStatus === '已驳回').length;
  const totalAuditPool = sourceList.length;
  const processedRate = totalAuditPool > 0 ? Math.round(((auditedCount + rejectedCount) / totalAuditPool) * 100) : 29;

  // Filtered List
  const filtered = sourceList.filter((item) => {
    // Tab Filter
    if (activeTab === '待审核' && item.auditStatus !== '待审核') return false;
    if (activeTab === '已驳回' && item.auditStatus !== '被驳回' && item.auditStatus !== '已驳回') return false;
    if (activeTab === '已通过' && item.auditStatus !== '已通过' && item.auditStatus !== '已转办') return false;

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

    if (selectedAuditor && (item.auditor || '') !== selectedAuditor) return false;

    const submitDate = (item.submitTime || '').slice(0, 10);
    if (startDate && submitDate < startDate) return false;
    if (endDate && submitDate > endDate) return false;

    return true;
  });

  const handleReset = () => {
    setKeyword('');
    setSelectedOrgId(null);
    setSelectedAuditor('');
    setStartDate('');
    setEndDate('');
    setActiveTab('待审核');
  };

  // Pagination (页码管理 + 每页条数设置)
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, keyword, selectedOrgId, selectedAuditor, startDate, endDate]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedReports = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

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

  const renderAuditRow = (item: ReportItem, seq: number) => {
    const isPending = item.auditStatus === '待审核';
    const isRejected = item.auditStatus === '被驳回' || item.auditStatus === '已驳回';
    const openDetail = () => {
      onSelectAudit(item);
      onNavigate('audit-detail');
    };
    return (
      <div key={`row-${item.id}`} className="px-5 py-3.5 flex gap-3 transition-colors hover:bg-gray-50/70">
        <span className="w-6 shrink-0 text-center font-mono text-xs mt-0.5 text-gray-400">{seq}</span>
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
            <span className="shrink-0 px-1 rounded bg-gray-100 text-gray-500">报送人</span>
            <span className="shrink-0 text-gray-600">{item.author}</span>
            <span className="shrink-0 text-gray-300">·</span>
            <span title={getOrganizationPathText(item.organization)} className="truncate">{item.organization}</span>
            <span className="shrink-0 text-gray-300">·</span>
            <span className="shrink-0 font-mono text-gray-500">{item.submitTime}</span>
            {isPending && (
              <>
                <span className="shrink-0 text-gray-300">·</span>
                <span className="shrink-0">
                  提交时间 <span className="font-mono text-gray-500">{getAuditArrivedAt(item)}</span>
                </span>
              </>
            )}
            {isRejected && (
              <>
                <span className="shrink-0 text-gray-300">·</span>
                <span className="shrink-0">
                  驳回时间 <span className="font-mono text-gray-500">{getRejectTime(item)}</span>
                </span>
                <span
                  className="ml-2 inline-flex items-center gap-1 min-w-0 text-rose-500 cursor-help"
                  title={`驳回原因：${item.rejectReason || '信息要素不全，请核实后补充提交。'}`}
                >
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span className="truncate">驳回原因：{item.rejectReason || '信息不完整'}</span>
                </span>
              </>
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
          <span className="text-[11px] text-blue-100/70 ml-1 truncate">集中处理审核待办及审核记录事项</span>
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
      <div className="bg-white rounded-xl px-5 py-4 border border-gray-200/80 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <div className="flex-1 min-w-[220px]">
            <div className="relative">
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
          <div className="flex items-center space-x-2">
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
          <div className="flex items-center space-x-2 min-w-0">
            <label className="text-gray-700 font-semibold whitespace-nowrap shrink-0">组织节点</label>
            <OrgFilterSelect value={selectedOrgId} onChange={setSelectedOrgId} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <label className="text-gray-700 font-semibold whitespace-nowrap shrink-0">审核人</label>
            <select
              value={selectedAuditor}
              onChange={(e) => setSelectedAuditor(e.target.value)}
              className="w-[140px] px-2.5 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#1E5ABB] rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15"
            >
              <option value="">全部审核人</option>
              {auditorOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-auto">
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
          <div className="px-5 flex items-center justify-between gap-3 border-b border-gray-100 text-sm">
            <div className="flex items-center gap-6 min-w-0">
              {(
                [
                  { value: '待审核' as const, label: '待审核', count: pendingCount },
                  { value: '已驳回' as const, label: '已驳回', count: rejectedCount }
                ] as const
              ).map((tab) => {
                const active = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={`relative py-3 flex items-center gap-1.5 cursor-pointer transition-colors ${
                      active ? 'text-[#1E5ABB] font-bold' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`min-w-[20px] px-1.5 rounded-full text-[11px] font-mono leading-[18px] text-center ${
                        active ? 'bg-[#1E5ABB] text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                    {active && (
                      <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-[#1E5ABB]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    {activeTab === '已驳回'
                      ? '当前筛选条件下暂无已驳回记录'
                      : '当前筛选条件下暂无待审核记录'}
                  </div>
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
