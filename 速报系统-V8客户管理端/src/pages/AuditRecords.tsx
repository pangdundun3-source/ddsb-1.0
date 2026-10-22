import React, { useState, useEffect, useMemo } from 'react';
import { AuditRecordItem, PageId, ReportItem } from '../types';
import { Search, RotateCcw, X, AlertCircle, Database } from 'lucide-react';
import { AddToWarehouseModal } from '../components/AddToWarehouseModal';
import { loadWarehouses, saveWarehouses, warehouseNowText, type WarehouseItem } from '../data/warehouses';
import { addRecordsToWarehouses, isInWarehouse, resolveLibraryAssignments } from '../data/warehouseAssignments';
import { PaginationBar } from '../components/PaginationBar';
import { OrgPathDisplay, getOrganizationPathText } from '../components/OrgPathDisplay';
import { IdentificationBadge } from '../components/IdentificationBadge';
import { StackedDateTime } from '../components/StackedDateTime';
import { DateRangeField } from '../components/DateRangeField';
import { OrgFilterSelect } from '../components/OrgFilterSelect';
import { INITIAL_ORG_NODES, matchOrganizationByFilter } from '../data/userOrgShared';
import { resolveIdentification } from '../services/identificationService';

interface AuditRecordsProps {
  records: AuditRecordItem[];
  allReports: ReportItem[];
  onSelectAuditRecord: (record: AuditRecordItem) => void;
  onNavigate: (page: PageId) => void;
}

export const AuditRecords: React.FC<AuditRecordsProps> = ({
  records,
  allReports,
  onSelectAuditRecord,
  onNavigate
}) => {
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState('通过');
  const [selectedIdent, setSelectedIdent] = useState('全部');
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>(loadWarehouses);
  const [assignmentVersion, setAssignmentVersion] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [joinTargets, setJoinTargets] = useState<AuditRecordItem[] | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const warehouseReports = useMemo(
    () => allReports.filter((r) => r.auditStatus === '待转办' || r.auditStatus === '已转办' || r.auditStatus === '已通过'),
    [allReports]
  );
  const assignment = useMemo(
    () => resolveLibraryAssignments(warehouseReports.map((r) => r.id), warehouses.map((w) => w.id)),
    [warehouseReports, warehouses, assignmentVersion]
  );
  const countOf = (warehouseId: string) => warehouseReports.filter((r) => isInWarehouse(assignment, r.id, warehouseId)).length;

  /** 已通过且报送在数据仓库范围内的记录才能加入，可重复加入。 */
  const canJoin = (rec: AuditRecordItem) =>
    rec.auditResult === '已通过' && warehouseReports.some((r) => r.id === rec.reportId);

  const baseFiltered = records.filter((rec) => {
    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      const matchTitle = rec.title?.toLowerCase().includes(q);
      const matchAuditor = rec.auditor?.toLowerCase().includes(q);
      const submitterName = rec.submitter || allReports.find((r) => r.id === rec.reportId)?.author;
      const matchSubmitter = submitterName?.toLowerCase().includes(q);
      const matchOrg = rec.organization?.toLowerCase().includes(q);
      const matchOrgPath = getOrganizationPathText(rec.organization).toLowerCase().includes(q);
      const matchAuditorOrgPath = getOrganizationPathText(rec.auditorOrg, '市委网信办').toLowerCase().includes(q);
      const matchReason = rec.rejectReason?.toLowerCase().includes(q);
      if (!matchTitle && !matchAuditor && !matchSubmitter && !matchOrg && !matchOrgPath && !matchAuditorOrgPath && !matchReason) return false;
    }
    if (!matchOrganizationByFilter(rec.organization, selectedOrgId, INITIAL_ORG_NODES)) {
      return false;
    }
    if (selectedIdent !== '全部') {
      const reportMatch = allReports.find((r) => r.id === rec.reportId);
      const status = rec.identificationStatus || reportMatch?.identificationStatus || '首发';
      if (!status.includes(selectedIdent)) return false;
    }
    if (startDate) {
      const recDate = rec.auditTime.split(' ')[0];
      if (recDate < startDate) return false;
    }
    if (endDate) {
      const recDate = rec.auditTime.split(' ')[0];
      if (recDate > endDate) return false;
    }
    return true;
  });

  const resultTabs = [
    { value: '通过', label: '已采纳', count: baseFiltered.filter((rec) => rec.auditResult === '已通过').length },
    { value: '驳回', label: '已驳回', count: baseFiltered.filter((rec) => rec.auditResult === '被驳回').length }
  ];
  const rejectedTab = selectedResult === '驳回';
  const filtered = baseFiltered.filter((rec) => {
    return selectedResult === '驳回' ? rec.auditResult === '被驳回' : rec.auditResult === '已通过';
  });

  const handleReset = () => {
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setSelectedOrgId(null);
    setSelectedResult('通过');
    setSelectedIdent('全部');
  };

  // Pagination (页码管理 + 每页条数设置)
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, selectedOrgId, selectedResult, selectedIdent, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedReports = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleDetail = (record: AuditRecordItem) => {
    onSelectAuditRecord(record);
    onNavigate('audit-record-detail');
  };

  const selectablePageIds = pagedReports.filter(canJoin).map((rec) => rec.id);
  const allPageSelected = selectablePageIds.length > 0 && selectablePageIds.every((id) => selectedIds.includes(id));
  const toggleSelect = (id: number) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  const togglePage = () =>
    setSelectedIds((prev) =>
      allPageSelected ? prev.filter((id) => !selectablePageIds.includes(id)) : Array.from(new Set([...prev, ...selectablePageIds]))
    );

  const persistWarehouses = (next: WarehouseItem[]) => {
    setWarehouses(next);
    saveWarehouses(next);
  };

  const confirmJoin = (targets: WarehouseItem[]) => {
    if (!joinTargets || targets.length === 0) return;
    const targetIds = targets.map((w) => w.id);
    addRecordsToWarehouses(joinTargets.map((rec) => rec.reportId), targetIds);
    persistWarehouses(warehouses.map((w) => (targetIds.includes(w.id) ? { ...w, updatedAt: warehouseNowText() } : w)));
    setAssignmentVersion((v) => v + 1);
    const joinedIds = joinTargets.map((rec) => rec.id);
    setSelectedIds((prev) => prev.filter((id) => !joinedIds.includes(id)));
    setNotice(`已将 ${joinTargets.length} 条数据加入${targets.map((w) => `「${w.name}」`).join('、')}`);
    setJoinTargets(null);
  };

  const openBatchJoin = () => {
    const targets = records.filter((rec) => selectedIds.includes(rec.id) && canJoin(rec));
    if (targets.length > 0) setJoinTargets(targets);
  };

  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">审核记录</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">显示账号已处理的速报审核流水记录</p>
        </div>
      </div>

      {/* Filter Card - 筛选项与操作同一行 */}
      <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs">
        <div className="flex items-center gap-2.5 text-xs w-full min-w-0">
          <div className="flex-1 min-w-0 max-w-[240px]">
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="请输入事件标题、审核人、所属机构"
                title="请输入事件标题名称、审核人员姓名、所属机构进行检索"
                className="w-full min-w-0 pl-8 pr-8 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#1E5ABB] rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 transition-all shadow-2xs"
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

          <div className="flex items-center space-x-1.5 shrink-0">
            <label className="text-gray-700 font-semibold whitespace-nowrap shrink-0">审核时间</label>
            <DateRangeField
              startValue={startDate}
              endValue={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
              title="审核时间区间"
              startTitle="审核开始日期"
              endTitle="审核结束日期"
              inputClassName="w-[100px] flex-none"
            />
          </div>

          <div className="flex items-center space-x-1.5 shrink-0 min-w-0">
            <label className="text-gray-700 font-semibold whitespace-nowrap shrink-0">报送机构</label>
            <OrgFilterSelect
              value={selectedOrgId}
              onChange={setSelectedOrgId}
              triggerClassName="min-w-[120px] max-w-[150px]"
            />
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <label className="text-gray-700 font-semibold whitespace-nowrap shrink-0">研判打标</label>
            <select
              value={selectedIdent}
              onChange={(e) => setSelectedIdent(e.target.value)}
              className="w-[100px] px-2.5 py-2 border border-gray-300 hover:border-gray-400 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] bg-white text-gray-700 cursor-pointer"
            >
              <option value="全部">全部标识</option>
              <option value="首发">首发</option>
              <option value="重复">重复</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 shrink-0 ml-auto">
            <button
              onClick={() => {}}
              className="px-3.5 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>查询</span>
            </button>
            <button
              onClick={handleReset}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg border border-gray-200 flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 flex items-center gap-6 border-b border-gray-100 text-sm">
          {resultTabs.map((tab) => {
            const active = selectedResult === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setSelectedResult(tab.value);
                  setSelectedIds([]);
                }}
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
        {!rejectedTab && (
        <div className="px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 bg-gray-50/70 border-b border-gray-100 text-xs">
          <label className="inline-flex items-center gap-2 text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allPageSelected}
              disabled={selectablePageIds.length === 0}
              onChange={togglePage}
              aria-label="全选本页"
              className="accent-[#1E5ABB] cursor-pointer disabled:cursor-not-allowed"
            />
            <span>
              共 <strong className="text-[#1E5ABB] font-mono">{filtered.length}</strong> 条审核记录
              <span className="mx-2 text-gray-300">|</span>
              已选 <strong className="text-[#1E5ABB] font-mono">{selectedIds.length}</strong> 条
              <span className="ml-2 text-gray-400">（仅已采纳的数据可加入仓库）</span>
            </span>
          </label>
          <button
            type="button"
            onClick={openBatchJoin}
            disabled={selectedIds.length === 0}
            title={selectedIds.length === 0 ? '请先勾选已采纳的数据' : undefined}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border font-semibold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          >
            <Database className="w-3.5 h-3.5" />
            批量加入仓库
          </button>
        </div>
        )}
        <div className="divide-y divide-gray-100">
          {pagedReports.length === 0 && <div className="py-12 text-center text-xs text-gray-400">暂无审核记录</div>}
          {pagedReports.map((item, index) => {
            const reportMatch = allReports.find((r) => r.id === item.reportId);
            const submitterName = item.submitter || reportMatch?.author || '网格员';
            const submitTimeStr = item.submitTime || reportMatch?.submitTime || '--';
            const auditorName = item.auditor || '王主任';
            const auditorOrgStr = item.auditorOrg || '市委网信办';
            const rejectReasonText = item.rejectReason || reportMatch?.rejectReason || '信息不完整';
            const rejectDetailText = item.rejectDetail || reportMatch?.rejectDetail;
            const passed = item.auditResult === '已通过';
            const metaParts = [
              { label: '上报人', person: submitterName, org: item.organization, time: submitTimeStr, fallbackOrg: undefined },
              { label: '审核人', person: auditorName, org: auditorOrgStr, time: item.auditTime, fallbackOrg: '市委网信办' }
            ];

            const joinable = canJoin(item);
            const checked = selectedIds.includes(item.id);
            return (
              <div key={item.id} className={`px-5 py-3.5 flex gap-3 transition-colors ${checked ? 'bg-blue-50/50' : 'hover:bg-gray-50/70'}`}>
                {!rejectedTab && (
                  <span className="w-[17px] shrink-0">
                    {joinable && (
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelect(item.id)}
                        aria-label={`选择${item.title}`}
                        className="mt-1 accent-[#1E5ABB] cursor-pointer"
                      />
                    )}
                  </span>
                )}
                <span className="w-6 shrink-0 text-center font-mono text-xs text-gray-400 mt-0.5">{(safePage - 1) * pageSize + index + 1}</span>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`shrink-0 px-1.5 py-px rounded text-[11px] font-medium ${
                          passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {passed ? '已采纳' : '已驳回'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDetail(item)}
                        title={item.title}
                        className="text-sm font-semibold text-gray-900 hover:text-[#1E5ABB] text-left truncate min-w-0 cursor-pointer"
                      >
                        {item.title}
                      </button>
                      <IdentificationBadge
                        status={item.identificationStatus || (reportMatch ? resolveIdentification(reportMatch, allReports).status : '首发')}
                        size="xs"
                        className="shrink-0"
                      />
                    </div>
                    <div className="shrink-0 flex items-center gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => handleDetail(item)}
                        className="text-gray-500 hover:text-gray-800 hover:underline cursor-pointer"
                      >
                        详情
                      </button>
                      {joinable ? (
                        <button
                          type="button"
                          onClick={() => setJoinTargets([item])}
                          className="text-emerald-600 hover:text-emerald-800 font-semibold hover:underline cursor-pointer"
                        >
                          加入仓库
                        </button>
                      ) : (
                        passed && (
                          <span
                            className="text-gray-300 cursor-not-allowed"
                            title={`该报送当前状态为「${reportMatch?.auditStatus ?? '未知'}」，暂不能加入仓库`}
                          >
                            加入仓库
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 truncate" title={reportMatch?.detailContent?.summary || '暂无内容描述'}>
                    {reportMatch?.detailContent?.summary || '暂无内容描述'}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[11px] text-gray-400">
                    {metaParts.map((part, partIndex) => (
                      <span key={part.label} className={`inline-flex items-center gap-1.5 min-w-0 whitespace-nowrap ${partIndex === 0 ? 'sm:w-[270px]' : ''}`}>
                        <span className="shrink-0 px-1 rounded bg-gray-100 text-gray-500">{part.label}</span>
                        <span className="shrink-0 text-gray-600">{part.person}</span>
                        <span className="shrink-0 text-gray-300">·</span>
                        <span title={getOrganizationPathText(part.org, part.fallbackOrg)} className="truncate">{part.org}</span>
                        <span className="shrink-0 text-gray-300">·</span>
                        <span className="shrink-0 font-mono">{part.time}</span>
                      </span>
                    ))}
                    {!passed && rejectReasonText && (
                      <span
                        className="inline-flex items-center gap-1 min-w-0 text-rose-500 cursor-help"
                        title={`驳回原因：${rejectReasonText}${rejectDetailText ? ` (${rejectDetailText})` : ''}`}
                      >
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[260px]">驳回原因：{rejectReasonText}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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

      {joinTargets && (
        <AddToWarehouseModal
          titles={joinTargets.map((rec) => rec.title)}
          warehouses={warehouses}
          countOf={countOf}
          isJoined={(warehouseId) => joinTargets.every((rec) => isInWarehouse(assignment, rec.reportId, warehouseId))}
          onWarehousesChange={persistWarehouses}
          onClose={() => setJoinTargets(null)}
          onConfirm={confirmJoin}
        />
      )}

      {notice && (
        <div className="fixed top-4 right-4 z-[60] bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold">
          {notice}
        </div>
      )}
    </div>
  );
};
