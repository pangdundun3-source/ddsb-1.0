import React, { useState, useEffect } from 'react';
import { AuditRecordItem, PageId, ReportItem, OriginTypeLabel } from '../types';
import { Search, RotateCcw, X, AlertCircle } from 'lucide-react';
import { PaginationBar } from '../components/PaginationBar';
import { OrgPathDisplay, getOrganizationPathText } from '../components/OrgPathDisplay';
import { StackedDateTime } from '../components/StackedDateTime';
import { ReportOriginBadge } from '../components/ReportOriginBadge';
import { AuditRecordDetail } from './AuditRecordDetail';
import { DateRangeField } from '../components/DateRangeField';
import { OrgFilterSelect } from '../components/OrgFilterSelect';
import { INITIAL_ORG_NODES, matchOrganizationByFilter } from '../data/externalOrgTree';

interface AuditRecordsProps {
  records: AuditRecordItem[];
  allReports: ReportItem[];
  initialDrawerRecord?: AuditRecordItem | null;
  onSelectAuditRecord: (record: AuditRecordItem) => void;
  onNavigate: (page: PageId) => void;
}

export const AuditRecords: React.FC<AuditRecordsProps> = ({
  records,
  allReports,
  initialDrawerRecord = null,
  onSelectAuditRecord,
  onNavigate
}) => {
  const [drawerRecord, setDrawerRecord] = useState<AuditRecordItem | null>(initialDrawerRecord || null);

  useEffect(() => {
    if (initialDrawerRecord) {
      setDrawerRecord(initialDrawerRecord);
    }
  }, [initialDrawerRecord]);
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

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

  /** 审核记录仅展示已采纳（已通过）数据 */
  const filtered = baseFiltered.filter((rec) => rec.auditResult === '已通过');

  const handleReset = () => {
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setSelectedOrgId(null);
  };

  // Pagination (页码管理 + 每页条数设置)
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, selectedOrgId, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedReports = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleDetail = (record: AuditRecordItem) => {
    onSelectAuditRecord(record);
    setDrawerRecord(record);
  };

  const handleCloseDrawer = () => {
    setDrawerRecord(null);
    onNavigate('audit-records');
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
          <div className="flex-1 min-w-0 max-w-[280px]">
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
            <label className="text-gray-700 font-semibold whitespace-nowrap shrink-0">组织节点</label>
            <OrgFilterSelect
              value={selectedOrgId}
              onChange={setSelectedOrgId}
              triggerClassName="min-w-[120px] max-w-[160px]"
            />
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
        <div className="px-5 py-2.5 bg-gray-50/70 border-b border-gray-100 text-xs text-gray-600">
          共 <strong className="text-[#1E5ABB] font-mono">{filtered.length}</strong> 条审核记录
        </div>
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
            const finalizedOrigin: OriginTypeLabel =
              item.originLabel === '重复' ||
              reportMatch?.originLabel === '重复' ||
              item.originLabel === '疑似重复' ||
              reportMatch?.originLabel === '疑似重复'
                ? '重复'
                : '首发';
            const metaParts = [
              { label: '报送人', person: submitterName, org: item.organization, time: submitTimeStr, fallbackOrg: undefined },
              { label: '审核人', person: auditorName, org: auditorOrgStr, time: item.auditTime, fallbackOrg: '市委网信办' }
            ];

            return (
              <div key={item.id} className="px-5 py-3.5 flex gap-3 transition-colors hover:bg-gray-50/70">
                <span className="w-6 shrink-0 text-center font-mono text-xs text-gray-400 mt-0.5">{(safePage - 1) * pageSize + index + 1}</span>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`shrink-0 px-1.5 py-px rounded text-[11px] font-medium ${
                          passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {passed ? '已通过' : '已驳回'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDetail(item)}
                        title={item.title}
                        className="text-sm font-semibold text-gray-900 hover:text-[#1E5ABB] text-left truncate min-w-0 cursor-pointer"
                      >
                        {item.title}
                      </button>
                      <ReportOriginBadge label={finalizedOrigin} size="sm" className="shrink-0" />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDetail(item)}
                      className="shrink-0 text-xs text-gray-500 hover:text-gray-800 hover:underline cursor-pointer"
                    >
                      详情
                    </button>
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

      {/* 审核记录详情右侧抽屉 (Drawer) */}
      {drawerRecord && (
        <AuditRecordDetail
          record={drawerRecord}
          allReports={allReports}
          isDrawer={true}
          onClose={handleCloseDrawer}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};
