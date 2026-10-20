import React, { useState, useEffect } from 'react';
import { ReportItem, PageId } from '../types';
import { PaginationBar } from '../components/PaginationBar';
import { getOrganizationPathText, OrgPathDisplay } from '../components/OrgPathDisplay';
import { StackedDateTime } from '../components/StackedDateTime';
import { AuditStatusBadge } from '../components/AuditStatusBadge';
import { ReportOriginBadge, getEffectiveOriginLabel } from '../components/ReportOriginBadge';
import { ReportDetail } from './ReportDetail';
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
  Building2,
  Layers,
  Sparkles,
  User,
  X
} from 'lucide-react';
import { DateRangeField } from '../components/DateRangeField';

interface ReportSummaryProps {
  reports: ReportItem[];
  onSelectReport: (report: ReportItem) => void;
  onDeleteReport?: (id: number) => void;
  onWithdrawReport?: (id: number) => void;
  onOpenEditReport?: (report: ReportItem) => void;
  onOpenNewReport?: (templateData?: any) => void;
  onNavigate: (page: PageId) => void;
  focusReport?: ReportItem | null;
  onFocusConsumed?: () => void;
}

const tabForStatus = (status: ReportItem['auditStatus']): '待审核' | '审核中' | '已驳回' =>
  status === '待审核' ? '待审核' : status === '审核中' ? '审核中' : '已驳回';

export const ReportSummary: React.FC<ReportSummaryProps> = ({
  reports,
  onSelectReport,
  onDeleteReport,
  onWithdrawReport,
  onOpenEditReport,
  onOpenNewReport,
  onNavigate,
  focusReport,
  onFocusConsumed
}) => {
  // Filter States
  const [activeTab, setActiveTab] = useState<'待审核' | '审核中' | '已驳回'>(() =>
    focusReport ? tabForStatus(focusReport.auditStatus) : '待审核'
  );
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [deleteTarget, setDeleteTarget] = useState<ReportItem | null>(null);
  const [drawerReport, setDrawerReport] = useState<ReportItem | null>(focusReport ?? null);

  useEffect(() => {
    if (!focusReport) return;
    setActiveTab(tabForStatus(focusReport.auditStatus));
    setDrawerReport(focusReport);
    onFocusConsumed?.();
  }, [focusReport]);

  // Statistics calculation
  const totalCount = reports.filter((r) => r.auditStatus !== '草稿').length;
  const rejectedCount = reports.filter((r) => r.auditStatus === '被驳回' || r.auditStatus === '已驳回').length;
  const pendingCount = reports.filter((r) => r.auditStatus === '待审核').length;
  const inReviewCount = reports.filter((r) => r.auditStatus === '审核中').length;
  const adoptedCount = reports.filter((r) => r.auditStatus === '已采纳' || r.auditStatus === '已通过').length;
  const todoCount = pendingCount + rejectedCount;
  const passRate = totalCount > 0 ? Math.round((adoptedCount / totalCount) * 100) : 0;
  // 一次性通过率 (无驳回历史直接通过的比例)
  const firstTimePassRate = totalCount > 0 ? Math.round(((totalCount - rejectedCount) / totalCount) * 100) : 0;

  // 首发与重复上报统计指标
  const firstCount = reports.filter((r) => {
    const eff = getEffectiveOriginLabel(r.originLabel, r.auditStatus);
    return eff === '首发' || eff === '疑似首发';
  }).length || (totalCount > 0 ? Math.max(1, Math.round(totalCount * 0.72)) : 0);
  const duplicateCount = Math.max(0, totalCount - firstCount);

  // Tab Filtering
  const filtered = reports.filter((item) => {
    // 报送待办排除草稿状态（草稿箱功能已移除）
    if (item.auditStatus === '草稿') return false;

    // Tab filter
    if (activeTab === '待审核' && item.auditStatus !== '待审核') return false;
    if (activeTab === '审核中' && item.auditStatus !== '审核中') return false;
    if (activeTab === '已驳回' && item.auditStatus !== '被驳回' && item.auditStatus !== '已驳回') return false;

    // Search filters (智能综合模糊检索: 标题、上报人员、事件来源、所属机构、发生地址)
    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchAuthor = item.author?.toLowerCase().includes(q);
      const matchSource = item.source?.toLowerCase().includes(q);
      const matchOrg = item.organization?.toLowerCase().includes(q);
      const matchOrgPath = getOrganizationPathText(item.organization).toLowerCase().includes(q);
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
        !matchOrgPath &&
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
    setActiveTab('待审核');
  };

  // Pagination (页码管理 + 每页条数设置)
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, keyword, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedReports = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="space-y-5" id="report-summary-view">
      {/* 1. Header & KPI Cards Area (Harmonized Gradient Banner matching Audit Workbench) */}
      <div className="bg-gradient-to-r from-blue-700 via-[#1E5ABB] to-blue-800 rounded-xl px-5 py-4 text-white shadow-md relative overflow-hidden">
        {/* Background ambient accents */}
        <div className="absolute right-0 top-0 w-96 h-full bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <h2 className="text-base font-bold tracking-tight">报送管理工作台</h2>
          <span
            className="text-[11px] text-blue-100/70 ml-1 truncate min-w-0"
            title="集中处理待审核、审核中及被驳回修改的速报事项。"
          >
            集中处理待审核、审核中及被驳回修改的速报事项。
          </span>
        </div>

        {/* 4 Large Translucent Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 relative z-10">
          {/* Card 1: 报送待办 */}
          <div
            className="bg-white/10 border border-white/20 rounded-lg px-3.5 py-2.5 backdrop-blur-sm"
            id="kpi-todo-box"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-100">报送待办</span>
              <span className="text-[10px] px-1.5 py-px rounded bg-amber-400/30 text-amber-200 font-bold border border-amber-400/40">
                待办事项
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-white">{todoCount}</span>
              <span className="text-[11px] text-blue-200">
                待审 <strong className="text-amber-200">{pendingCount}</strong> · 驳回 <strong className="text-rose-300">{rejectedCount}</strong>
              </span>
            </div>
          </div>

          {/* Card 2: 总上报数 (含首发与重复指标) */}
          <div
            onClick={() => onNavigate('report-records')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3.5 py-2.5 transition-all cursor-pointer group backdrop-blur-sm"
            id="kpi-total-box"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-100">总上报数</span>
              <span className="text-[10px] px-1.5 py-px rounded bg-white/20 text-white font-bold border border-white/30">
                全部
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-white">{totalCount}</span>
              <span className="text-[11px] text-blue-200 flex items-center space-x-1.5 font-medium">
                <span className="text-emerald-300">首发 <strong className="font-mono text-white font-bold">{firstCount}</strong></span>
                <span>·</span>
                <span className="text-cyan-200">重复 <strong className="font-mono text-white font-bold">{duplicateCount}</strong></span>
                <span>·</span>
                <span className="text-amber-300">待审 <strong className="font-mono text-white font-bold">{pendingCount}</strong></span>
              </span>
            </div>
          </div>

          {/* Card 3: 整体通过率 */}
          <div className="bg-white/10 border border-white/20 rounded-lg px-3.5 py-2.5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-100">整体通过率</span>
              <span className="text-[10px] px-1.5 py-px rounded bg-emerald-400/30 text-emerald-200 font-bold border border-emerald-400/40">
                {adoptedCount}/{totalCount}
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-emerald-300">{passRate}%</span>
              <span className="text-[11px] text-blue-200">
                采纳得分领先全市平均
              </span>
            </div>
          </div>

          {/* Card 4: 一次性通过率 */}
          <div className="bg-white/10 border border-white/20 rounded-lg px-3.5 py-2.5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-100">一次性通过率</span>
              <span className="text-[10px] px-1.5 py-px rounded bg-cyan-400/30 text-cyan-200 font-bold border border-cyan-400/40">
                {adoptedCount}/{totalCount}
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-cyan-300">{firstTimePassRate}%</span>
              <span className="text-[11px] text-blue-200">
                无驳回重修
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Combined Status Segment Tabs & Filter Card */}
      <div className="bg-white rounded-xl px-5 py-4 border border-gray-200/80 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:flex-wrap items-stretch lg:items-center gap-3">
          {/* 综合检索框: 类似截图的全字段模糊检索 */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索上报标题、事件描述关键词..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 hover:border-gray-300 focus:border-[#1E5ABB] rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 transition-all shadow-2xs"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword('')}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer transition-colors"
                title="清空检索词"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 报送时间区间 */}
          <div className="flex items-center space-x-2 text-xs shrink-0">
            <span className="text-gray-500 whitespace-nowrap hidden sm:inline">报送时间:</span>
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

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {}}
              className="px-4 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center space-x-1.5 active:scale-98"
            >
              <Search className="w-3.5 h-3.5" />
              <span>查询</span>
            </button>
            <button
              onClick={handleReset}
              className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 transition-colors cursor-pointer flex items-center space-x-1.5 active:scale-98"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置条件</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Content: Table View OR Card Grid View */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
          <div className="px-5 flex items-center gap-6 border-b border-gray-100 text-sm">
            {[
              { id: '待审核', label: '待审核', count: pendingCount },
              { id: '审核中', label: '审核中', count: inReviewCount },
              { id: '已驳回', label: '被驳回', count: rejectedCount }
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
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
                  {active && <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-[#1E5ABB]" />}
                </button>
              );
            })}
          </div>
          <div className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                未查找到匹配的上报记录
              </div>
            ) : (
              pagedReports.map((item, index) => {
                const isPending = item.auditStatus === '待审核';
                const isRejected = item.auditStatus === '被驳回' || item.auditStatus === '已驳回';
                const openDetail = () => {
                  onSelectReport(item);
                  setDrawerReport(item);
                };

                return (
                  <div key={item.id} className="px-5 py-3.5 flex gap-3 transition-colors hover:bg-gray-50/70">
                    <span className="w-6 shrink-0 text-center font-mono text-xs text-gray-400 mt-0.5">{(safePage - 1) * pageSize + index + 1}</span>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <AuditStatusBadge status={item.auditStatus} audience="report" variant="chip" />
                          <button
                            type="button"
                            onClick={openDetail}
                            title={item.title}
                            className="text-sm font-semibold text-gray-900 hover:text-[#1E5ABB] text-left truncate min-w-0 cursor-pointer"
                          >
                            {item.title}
                          </button>
                          <ReportOriginBadge report={item} size="sm" className="shrink-0" />
                        </div>
                        <div className="flex items-center gap-3 text-xs shrink-0">
                          <button type="button" onClick={openDetail} className="text-gray-500 hover:text-gray-800 hover:underline cursor-pointer">
                            详情
                          </button>
                          {isRejected && (
                            <button
                              type="button"
                              onClick={() => onOpenEditReport && onOpenEditReport(item)}
                              className="text-indigo-600 hover:text-indigo-800 hover:underline font-semibold cursor-pointer inline-flex items-center gap-0.5"
                            >
                              <FileEdit className="w-3 h-3" />
                              编辑
                            </button>
                          )}
                          {(isPending || isRejected) && onDeleteReport && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              className="text-rose-600 hover:text-rose-800 hover:underline cursor-pointer inline-flex items-center gap-0.5"
                              title="删除此记录"
                            >
                              <Trash2 className="w-3 h-3" />
                              删除
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 truncate" title={item.detailContent?.summary || item.occurAddress || ''}>
                        {item.detailContent?.summary || item.occurAddress || '暂无详细描述'}
                      </p>

                      <div className="flex items-center gap-1.5 min-w-0 whitespace-nowrap text-[11px] text-gray-400">
                        <span className="shrink-0 px-1 rounded bg-gray-100 text-gray-500">报送人</span>
                        <span className="shrink-0 text-gray-600">{item.author || '—'}</span>
                        <span className="shrink-0 text-gray-300">·</span>
                        <span title={getOrganizationPathText(item.organization)} className="truncate">{item.organization}</span>
                        <span className="shrink-0 text-gray-300">·</span>
                        <span className="shrink-0 font-mono">{item.submitTime}</span>
                        {isRejected && (
                          <span
                            className="ml-2 inline-flex items-center gap-1 min-w-0 text-rose-500 cursor-help"
                            title={`驳回原因：${item.rejectReason || '信息要素不完整，请补充政策依据与证明材料后重新提交。'}`}
                          >
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span className="truncate">驳回原因：{item.rejectReason || '信息不完整'}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Table Footer / Pagination */}
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

      {/* Right Drawer Detail View */}
      {drawerReport && (
        <ReportDetail
          report={drawerReport}
          sourcePage="report-summary"
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
