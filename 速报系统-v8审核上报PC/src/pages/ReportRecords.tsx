import React, { useState, useMemo, useEffect } from 'react';
import { PaginationBar } from '../components/PaginationBar';
import { OrgPathDisplay, getOrganizationPathText } from '../components/OrgPathDisplay';
import { AuditStatusBadge } from '../components/AuditStatusBadge';
import { ReportOriginBadge } from '../components/ReportOriginBadge';
import { ReportDetail } from './ReportDetail';
import { ReportItem, PageId, AuditStatus } from '../types';
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
  MapPin,
  LayoutGrid,
  List,
  Check,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  User,
  X,
  Download,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Info
} from 'lucide-react';
interface OrgAccount {
  name?: string;
  role?: string;
}

interface ReportRecordsProps {
  reports: ReportItem[];
  currentUser?: string;
  currentOrg?: OrgAccount;
  onSelectReport: (report: ReportItem) => void;
  onDeleteReport?: (id: number) => void;
  onWithdrawReport?: (id: number) => void;
  onOpenEditReport?: (report: ReportItem) => void;
  onOpenNewReport?: (templateData?: any) => void;
  onNavigate: (page: PageId) => void;
}

export const ReportRecords: React.FC<ReportRecordsProps> = ({
  reports,
  currentUser = '张三',
  currentOrg,
  onSelectReport,
  onDeleteReport,
  onWithdrawReport,
  onOpenEditReport,
  onOpenNewReport,
  onNavigate
}) => {
  // Filter States
  const [scopeFilter, setScopeFilter] = useState<'my' | 'all'>('my');
  const [activeTab, setActiveTab] = useState<AuditStatus | '全部'>('已采纳');
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'time-desc' | 'time-asc'>('time-desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals
  const [withdrawTarget, setWithdrawTarget] = useState<ReportItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReportItem | null>(null);
  const [drawerReport, setDrawerReport] = useState<ReportItem | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportSuccessToast, setExportSuccessToast] = useState<string | null>(null);

  // 1. Account Scope Data Filter
  const scopedReports = useMemo(() => {
    const base = reports.filter((r) => r.auditStatus === '已采纳');
    if (scopeFilter === 'my') {
      return base.filter(
        (r) =>
          r.author === currentUser ||
          r.author?.includes(currentUser) ||
          (currentOrg?.name && r.organization?.includes(currentOrg.name))
      );
    }
    return base;
  }, [reports, scopeFilter, currentUser, currentOrg]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return scopedReports
      .filter((item) => {
        // Tab Status Filter
        if (activeTab !== '全部') {
          if (activeTab === '已驳回') {
            if (item.auditStatus !== '被驳回' && item.auditStatus !== '已驳回') return false;
          } else if (item.auditStatus !== activeTab) {
            return false;
          }
        }

        // Search Query (模糊多字段搜索)
        if (keyword.trim()) {
          const q = keyword.trim().toLowerCase();
          const matchTitle = item.title?.toLowerCase().includes(q);
          const matchAuthor = item.author?.toLowerCase().includes(q);
          const matchSource = item.source?.toLowerCase().includes(q);
          const matchOrg = item.organization?.toLowerCase().includes(q);
          const matchOrgPath = getOrganizationPathText(item.organization, currentOrg?.name).toLowerCase().includes(q);
          const matchAddress = item.occurAddress?.toLowerCase().includes(q);
          const matchRegion = item.region?.toLowerCase().includes(q);
          const matchInfoType = item.infoType?.toLowerCase().includes(q);
          const matchSummary = item.detailContent?.summary?.toLowerCase().includes(q);
          const matchDemands = item.detailContent?.coreDemands?.toLowerCase().includes(q);
          const matchReason = item.rejectReason?.toLowerCase().includes(q);

          if (
            !matchTitle &&
            !matchAuthor &&
            !matchSource &&
            !matchOrg &&
            !matchOrgPath &&
            !matchAddress &&
            !matchRegion &&
            !matchInfoType &&
            !matchSummary &&
            !matchDemands &&
            !matchReason
          ) {
            return false;
          }
        }

        // Date Range
        if (startDate && item.submitTime < startDate) return false;
        if (endDate && item.submitTime > endDate) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'time-desc') {
          return (b.submitTime || '').localeCompare(a.submitTime || '');
        }
        if (sortBy === 'time-asc') {
          return (a.submitTime || '').localeCompare(b.submitTime || '');
        }
        return 0;
      });
  }, [scopedReports, activeTab, keyword, startDate, endDate, sortBy]);

  // Pagination (页码管理 + 每页条数设置)
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedReports = filteredReports.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [scopeFilter, activeTab, keyword, startDate, endDate, sortBy]);

  const handleReset = () => {
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setActiveTab('已采纳');
    setSortBy('time-desc');
  };

  // Export handler
  const handleExportData = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      ['序号,事件标题,信息类型,来源渠道,所属区域,发生地址,报送人,报送机构,报送时间,审核状态,评分,驳回原因']
        .concat(
          filteredReports.map((r, i) =>
            [
              i + 1,
              `"${(r.title || '').replace(/"/g, '""')}"`,
              `"${r.infoType || ''}"`,
              `"${r.source || ''}"`,
              `"${r.region || ''}"`,
              `"${(r.occurAddress || '').replace(/"/g, '""')}"`,
              `"${r.author || ''}"`,
              `"${r.organization || ''}"`,
              `"${r.submitTime || ''}"`,
              `"${r.auditStatus || ''}"`,
              `"${r.score || '--'}"`,
              `"${(r.rejectReason || '').replace(/"/g, '""')}"`
            ].join(',')
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `报送记录台账_${currentUser}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExportModalOpen(false);
    setExportSuccessToast('报送台账导出成功！文件已开始下载。');
    setTimeout(() => setExportSuccessToast(null), 3000);
  };

  return (
    <div className="space-y-5" id="report-records-view">
      {/* Toast Notification */}
      {exportSuccessToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{exportSuccessToast}</span>
        </div>
      )}

      {/* 1. Clean Title Header - Aligned with AuditRecords */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">报送记录</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">显示当前账号在该机构提交的全部报送记录</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Switch to Report Todo */}
          <button
            onClick={() => onNavigate('report-summary')}
            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 transition-all flex items-center space-x-1.5 cursor-pointer"
            title="前往报送待办处理草稿与驳回事项"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>报送待办</span>
          </button>

          {/* Export Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
            id="btn-export-records"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出台账</span>
          </button>

          {/* New Report Button */}
          <button
            onClick={() => onOpenNewReport && onOpenNewReport()}
            className="px-3.5 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
            id="btn-create-new-report-records"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建速报</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Area */}
      <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 text-xs">
          {/* 关键词搜索 */}
          <div className="flex-1 min-w-[260px]">
            <div className="relative flex-1">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="请输入事件标题、发生地址、诉求等关键词进行检索"
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
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
          <div className="text-xs text-gray-500 font-medium">
            共查询到 <strong className="text-[#1E5ABB] font-mono">{filteredReports.length}</strong> 条报送记录
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {}}
              className="px-4 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>查询</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg border border-gray-200 flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Data Presentation Area */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 space-y-3">
          <FileText className="w-12 h-12 mx-auto opacity-30 text-gray-400" />
          <div>
            <p className="text-sm font-bold text-gray-600">未找到符合条件的报送记录</p>
            <p className="text-xs text-gray-400 mt-1">您可以调整检索关键字或日期区间重试</p>
          </div>
          <div className="pt-2 flex items-center justify-center space-x-3">
            <button
              onClick={handleReset}
              className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              清空搜索条件
            </button>
            <button
              onClick={() => onOpenNewReport && onOpenNewReport()}
              className="px-3.5 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>立即新建上报</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/90 border-b border-gray-200/90 text-gray-600 font-bold">
                  <th className="py-3 px-3.5 w-12 text-center">序号</th>
                  <th className="py-3 px-3.5 min-w-[320px]">事件标题</th>
                  <th className="py-3 px-3.5 min-w-[240px]">内容描述</th>
                  <th className="py-3 px-3 w-40">报送人员 / 机构</th>
                  <th className="py-3 px-3 w-36">报送时间</th>
                  <th className="py-3 px-3 w-28 text-center whitespace-nowrap">审核状态</th>
                  <th className="py-3 px-3.5 w-40 text-center sticky right-0 bg-gray-50/95 shadow-xs">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedReports.map((item, index) => {
                  const isAdopted = ['已采纳', '已通过', '待转办', '已转办'].includes(item.auditStatus);
                  const isPending = item.auditStatus === '待审核';
                  const isRejected = item.auditStatus === '被驳回' || item.auditStatus === '已驳回';
                  const isDraft = item.auditStatus === '草稿';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* Index */}
                      <td className="py-3 px-3.5 text-center text-gray-400 font-mono text-[11px]">
                        {(safePage - 1) * pageSize + index + 1}
                      </td>

                      {/* Title & Location */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              onSelectReport(item);
                              setDrawerReport(item);
                            }}
                            className="font-bold text-gray-900 group-hover:text-[#1E5ABB] transition-colors text-left text-xs line-clamp-2 cursor-pointer hover:underline flex items-start space-x-1.5"
                          >
                            <span className="leading-snug">{item.title}</span>
                          </button>
                          <ReportOriginBadge report={item} size="sm" className="shrink-0" />
                        </div>
                      </td>

                      {/* Content Summary */}
                      <td className="py-3 px-3.5 text-gray-500 text-[11px]">
                        <span
                          className="line-clamp-2 leading-relaxed"
                          title={item.detailContent?.summary || '暂无内容描述'}
                        >
                          {item.detailContent?.summary || '暂无内容描述'}
                        </span>
                      </td>

                      {/* Author & Org */}
                      <td className="py-3 px-3">
                        <div className="text-[11px] text-gray-800 font-medium">
                          {item.author || currentUser}
                        </div>
                        <OrgPathDisplay organization={item.organization} fallback={currentOrg?.name} className="max-w-[220px]" />
                      </td>

                      {/* Submit Time */}
                      <td className="py-3 px-3 text-gray-500 font-mono text-[11px]">
                        {item.submitTime || '2026-08-13 10:00'}
                      </td>

                      {/* Audit Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center gap-1">
                        <AuditStatusBadge status={item.auditStatus} />
                        {isRejected && (
                          <span
                            className="inline-flex items-center gap-1 max-w-[160px] px-1.5 py-0.5 rounded bg-rose-50/80 hover:bg-rose-100 text-rose-600 border border-rose-200/70 text-[11px] cursor-help transition-colors"
                            title={`驳回原因：${item.rejectReason || '信息不完整'}`}
                          >
                            <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                            <span className="truncate">{item.rejectReason || '信息不完整'}</span>
                          </span>
                        )}
                        {isAdopted && (
                          <span
                            className="inline-flex items-center max-w-[160px] px-1.5 py-0.5 rounded bg-amber-50/90 text-amber-700 border border-amber-200/70 text-[11px] font-semibold cursor-default transition-colors"
                            title={`本次审核评分：${item.score ?? '--'} 分`}
                          >
                            <span className="truncate">评分：{item.score ?? '--'} 分</span>
                          </span>
                        )}
                        </div>
                      </td>

                      {/* Operations */}
                      <td className="py-3 px-3.5 text-center sticky right-0 bg-white/95 group-hover:bg-blue-50/60 shadow-xs">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* View Detail */}
                          {!isDraft && (
                            <button
                              onClick={() => {
                                onSelectReport(item);
                                setDrawerReport(item);
                              }}
                              className="px-2 py-1 text-[#1E5ABB] hover:bg-blue-100/70 rounded transition-colors font-semibold flex items-center space-x-0.5 cursor-pointer"
                              title="查看速报详情"
                            >
                              <span>详情</span>
                            </button>
                          )}

                          {/* If Draft or Rejected: Edit & Resubmit */}
                          {(isDraft || isRejected) && (
                            <button
                              onClick={() => onOpenEditReport && onOpenEditReport(item)}
                              className="px-2 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors text-[11px] font-semibold cursor-pointer flex items-center space-x-0.5"
                              title="重新编辑并提交"
                            >
                              <FileEdit className="w-3 h-3" />
                              <span>编辑</span>
                            </button>
                          )}

                          {/* If Pending, Draft or Rejected: Delete */}
                          {(isPending || isDraft || isRejected) && onDeleteReport && (
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="px-2 py-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors text-[11px] font-semibold cursor-pointer flex items-center space-x-0.5"
                              title="删除记录"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>删除</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="bg-gray-50/80 border-t border-gray-200">
            <PaginationBar
              total={filteredReports.length}
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
        /* CARDS VIEW */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pagedReports.map((item) => {
            const isAdopted = ['已采纳', '已通过', '待转办', '已转办'].includes(item.auditStatus);
            const isPending = item.auditStatus === '待审核';
            const isRejected = item.auditStatus === '被驳回' || item.auditStatus === '已驳回';
            const isDraft = item.auditStatus === '草稿';

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all duration-200 p-4.5 flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2.5">
                  {/* Top location & status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1 text-[11px] text-gray-400 truncate">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate">{item.occurAddress || item.region || '全市范围'}</span>
                    </div>

                    {/* Status Badge & Sub Info */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                    <AuditStatusBadge status={item.auditStatus} />
                    {isRejected && (
                      <span
                        className="inline-flex items-center gap-1 max-w-[160px] px-1.5 py-0.5 rounded bg-rose-50/80 hover:bg-rose-100 text-rose-600 border border-rose-200/70 text-[11px] cursor-help transition-colors"
                        title={`驳回原因：${item.rejectReason || '信息不完整'}`}
                      >
                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                        <span className="truncate">{item.rejectReason || '信息不完整'}</span>
                      </span>
                    )}
                    {isAdopted && (
                      <span
                        className="inline-flex items-center max-w-[160px] px-1.5 py-0.5 rounded bg-amber-50/90 text-amber-700 border border-amber-200/70 text-[11px] font-semibold cursor-default transition-colors"
                        title={`本次审核评分：${item.score ?? '--'} 分`}
                      >
                        <span className="truncate">评分：{item.score ?? '--'} 分</span>
                      </span>
                    )}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="flex items-center gap-2">
                    <h3
                      onClick={() => {
                        onSelectReport(item);
                        setDrawerReport(item);
                      }}
                      className="font-bold text-sm text-gray-900 group-hover:text-[#1E5ABB] transition-colors leading-snug cursor-pointer line-clamp-2 flex-1"
                    >
                      {item.title}
                    </h3>
                    <ReportOriginBadge report={item} size="sm" className="shrink-0" />
                  </div>

                  {/* Time */}
                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
                    <span className="font-mono">{item.submitTime}</span>
                  </div>

                  {/* Content snippet */}
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed bg-gray-50/60 p-2 rounded-lg border border-gray-100">
                    {item.detailContent?.summary || item.title}
                  </p>
                </div>

                {/* Footer and Actions */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex min-w-0 flex-col text-[11px] text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-gray-400" />
                      <span>{item.author || currentUser}</span>
                    </div>
                    <OrgPathDisplay organization={item.organization} fallback={currentOrg?.name} compact className="max-w-[210px]" />
                  </div>

                      <div className="flex items-center space-x-2">
                    {(isPending || isDraft || isRejected) && onDeleteReport && (
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-md border border-rose-200 transition-colors flex items-center space-x-1 cursor-pointer"
                        title="删除记录"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>删除</span>
                      </button>
                    )}

                    {(isDraft || isRejected) && (
                      <button
                        onClick={() => onOpenEditReport && onOpenEditReport(item)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-md transition-colors flex items-center space-x-1"
                      >
                        <FileEdit className="w-3 h-3" />
                        <span>编辑</span>
                      </button>
                    )}

                    {!isDraft && (
                      <button
                        onClick={() => {
                          onSelectReport(item);
                          setDrawerReport(item);
                        }}
                        className="px-3 py-1 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-semibold rounded-md transition-colors flex items-center space-x-0.5 cursor-pointer"
                      >
                        <span>详情</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

          {/* Cards Footer / Pagination */}
          <div className="mt-4 rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden bg-gray-50/80">
            <PaginationBar
              total={filteredReports.length}
              page={safePage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </div>
        </>
      )}

      {/* ================= MODALS ================= */}

      {/* 2. Withdraw Confirmation Modal */}
      {withdrawTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-gray-100 animate-in fade-in duration-200 space-y-4">
            <div className="flex items-center space-x-3 text-amber-600">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Undo2 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">确认撤回报送？</h3>
                <p className="text-xs text-gray-500">撤回后该速报将转入草稿箱，审核员将暂停审核流程。</p>
              </div>
            </div>
            <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200/80 text-xs text-amber-900">
              <span className="font-bold">撤回对象：</span>
              <span>《{withdrawTarget.title}》</span>
            </div>
            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                onClick={() => setWithdrawTarget(null)}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (onWithdrawReport) onWithdrawReport(withdrawTarget.id);
                  setWithdrawTarget(null);
                }}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                确认撤回
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-gray-100 animate-in fade-in duration-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">确认删除该报送记录？</h3>
                <p className="text-xs text-gray-500">删除后无法恢复，请谨慎操作。</p>
              </div>
            </div>
            <div className="p-3 bg-rose-50/80 rounded-lg border border-rose-200/80 text-xs text-rose-900">
              <span className="font-bold">删除对象：</span>
              <span>《{deleteTarget.title}》</span>
            </div>
            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (onDeleteReport) onDeleteReport(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Export Report 台账 Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-gray-900">导出报送台账记录</h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-600">
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 space-y-1.5">
                <div className="font-bold text-gray-900 flex items-center space-x-1.5">
                  <Info className="w-4 h-4 text-[#1E5ABB]" />
                  <span>导出数据摘要</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-gray-500">报送账号：</span>
                    <strong className="text-gray-800">{currentUser}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">所属机构：</span>
                    <strong className="text-gray-800">{currentOrg?.name || '台中市网信办'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">当前筛选记录数：</span>
                    <strong className="text-[#1E5ABB]">{filteredReports.length} 篇</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">导出格式：</span>
                    <strong className="text-emerald-700">标准 CSV / Excel 表格</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-gray-700">包含导出字段说明：</label>
                <div className="grid grid-cols-3 gap-1.5 text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <span>✓ 序号与事件标题</span>
                  <span>✓ 信息类型及来源</span>
                  <span>✓ 发生地址与区域</span>
                  <span>✓ 报送人与机构</span>
                  <span>✓ 报送提交时间</span>
                  <span>✓ 审核状态与得分</span>
                  <span>✓ 审核反馈意见</span>
                  <span>✓ 驳回详细说明</span>
                  <span>✓ 流程流转记录</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg cursor-pointer text-xs"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleExportData}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm cursor-pointer text-xs flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>确认导出并下载</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Right Drawer Detail View */}
      {drawerReport && (
        <ReportDetail
          report={drawerReport}
          sourcePage="report-records"
          isDrawer={true}
          onClose={() => setDrawerReport(null)}
          onNavigate={onNavigate}
          onWithdrawReport={onWithdrawReport}
          onOpenEditReport={onOpenEditReport}
          onDeleteReport={onDeleteReport}
        />
      )}
    </div>
  );
};
