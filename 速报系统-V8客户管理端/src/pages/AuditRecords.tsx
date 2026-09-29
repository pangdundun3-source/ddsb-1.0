import React, { useState, useEffect } from 'react';
import { AuditRecordItem, PageId, ReportItem } from '../types';
import { Search, RotateCcw, X, AlertCircle } from 'lucide-react';
import { PaginationBar } from '../components/PaginationBar';
import { OrgPathDisplay, getOrganizationPathText } from '../components/OrgPathDisplay';
import { IdentificationBadge } from '../components/IdentificationBadge';
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
  const [selectedOrg, setSelectedOrg] = useState('全部机构');
  const [selectedResult, setSelectedResult] = useState('全部');
  const [selectedIdent, setSelectedIdent] = useState('全部');

  const orgOptions = [
    '全部机构',
    '市委网信办',
    '台中市网信办',
    '台东区网信办',
    '花莲区网信办',
    '高新区宣传部',
    '西城区网信办',
    '东城区网信办',
  ];

  const filtered = records.filter((rec) => {
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
    if (selectedOrg !== '全部机构' && rec.organization !== selectedOrg) {
      return false;
    }
    if (selectedResult !== '全部') {
      if (selectedResult === '通过' && rec.auditResult !== '已通过') return false;
      if (selectedResult === '驳回' && rec.auditResult !== '被驳回') return false;
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

  const handleReset = () => {
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setSelectedOrg('全部机构');
    setSelectedResult('全部');
    setSelectedIdent('全部');
  };

  // Pagination (页码管理 + 每页条数设置)
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, selectedOrg, selectedResult, selectedIdent, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedReports = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleDetail = (record: AuditRecordItem) => {
    onSelectAuditRecord(record);
    onNavigate('audit-record-detail');
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

      {/* Filter Card - Aligned with ReportAudit.tsx */}
      <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
        {/* Filter items with inline label and input */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 text-xs">
          {/* 关键字搜索 */}
          <div className="flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="请输入事件标题名称、审核人员姓名、所属机构进行检索"
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

          {/* 审核时间 */}
          <div className="flex items-center space-x-2 shrink-0">
            <label className="text-gray-700 font-semibold whitespace-nowrap shrink-0">审核时间</label>
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
          <div className="flex items-center space-x-2 shrink-0 min-w-[180px]">
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

          {/* 审核状态 */}
          <div className="flex items-center space-x-2 shrink-0 min-w-[150px]">
            <label className="text-gray-700 font-semibold whitespace-nowrap shrink-0">审核状态</label>
            <select
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 hover:border-gray-400 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] bg-white text-gray-700 shadow-2xs cursor-pointer"
            >
              <option value="全部">全部结论</option>
              <option value="通过">已通过</option>
              <option value="驳回">已驳回</option>
            </select>
          </div>

          {/* 打标类型 */}
          <div className="flex items-center space-x-2 shrink-0 min-w-[140px]">
            <label className="text-gray-700 font-semibold whitespace-nowrap shrink-0">研判打标</label>
            <select
              value={selectedIdent}
              onChange={(e) => setSelectedIdent(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 hover:border-gray-400 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] bg-white text-gray-700 shadow-2xs cursor-pointer"
            >
              <option value="全部">全部标识</option>
              <option value="首发">首发</option>
              <option value="重复">重复</option>
            </select>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <div className="text-xs text-gray-500 font-medium">
            共查询到 <strong className="text-[#1E5ABB] font-mono">{filtered.length}</strong> 条审核历史记录
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {}}
              className="px-4 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>查询</span>
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg border border-gray-200 flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/90 border-b border-gray-200 text-gray-600 font-semibold">
                <th className="py-3.5 px-4 w-12 text-center">序号</th>
                <th className="py-3.5 px-4 min-w-[220px]">事件标题</th>
                <th className="py-3.5 px-4 min-w-[160px]">上报人员 / 机构</th>
                <th className="py-3.5 px-4">报送时间</th>
                <th className="py-3.5 px-4 min-w-[160px]">审核人员 / 机构</th>
                <th className="py-3.5 px-4 text-center">审核状态</th>
                <th className="py-3.5 px-4">审核时间</th>
                <th className="py-3.5 px-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {pagedReports.map((item, index) => {
                const reportMatch = allReports.find((r) => r.id === item.reportId);
                const submitterName = item.submitter || reportMatch?.author || '网格员';
                const submitTimeStr = item.submitTime || reportMatch?.submitTime || '--';
                const auditorName = item.auditor || '王主任';
                const auditorOrgStr = item.auditorOrg || '市委网信办';
                // 评分只在该条审核记录本身是最后一轮（终审）时写入；中间环节不展示评分
                const recordScore = item.score;
                const rejectReasonText = item.rejectReason || reportMatch?.rejectReason || '信息不完整';
                const rejectDetailText = item.rejectDetail || reportMatch?.rejectDetail;

                return (
                  <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3.5 px-4 text-center text-gray-400 font-mono">{(safePage - 1) * pageSize + index + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleDetail(item)}
                          className="text-blue-700 hover:text-blue-900 hover:underline font-bold text-left cursor-pointer leading-snug"
                        >
                          {item.title}
                        </button>
                        <IdentificationBadge
                          status={item.identificationStatus || (reportMatch ? resolveIdentification(reportMatch, allReports).status : '首发')}
                          size="xs"
                          showIcon
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900 leading-snug">{submitterName}</div>
                      <OrgPathDisplay organization={item.organization} className="max-w-[220px]" />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-500 whitespace-nowrap text-[11px]">
                      {submitTimeStr}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900 leading-snug">{auditorName}</div>
                      <OrgPathDisplay organization={auditorOrgStr} className="max-w-[220px]" />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.auditResult === '已通过' ? (
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            已通过
                          </span>
                          {recordScore !== undefined && recordScore !== null && (
                            <span
                              className="inline-flex items-center gap-1 max-w-[150px] px-1.5 py-0.5 rounded bg-amber-50/90 hover:bg-amber-100 text-amber-700 border border-amber-200/70 text-[11px] font-semibold cursor-default transition-colors"
                              title={`本次审核评分：${recordScore} 分`}
                            >
                              <span className="truncate">评分：{recordScore} 分</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="inline-flex flex-col items-center gap-1 group relative">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            已驳回
                          </span>
                          {rejectReasonText && (
                            <>
                              <div
                                className="inline-flex items-center gap-1 max-w-[130px] px-1.5 py-0.5 rounded bg-rose-50/80 hover:bg-rose-100 text-rose-600 border border-rose-200/70 text-[11px] cursor-help transition-colors"
                                title={`驳回原因：${rejectReasonText}${rejectDetailText ? ` (${rejectDetailText})` : ''}`}
                              >
                                <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                <span className="truncate">{rejectReasonText}</span>
                              </div>
                              {/* Hover Floating Tooltip */}
                              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 w-56 p-2.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl border border-slate-800 text-left">
                                <div className="flex items-center gap-1 text-rose-400 font-semibold mb-1 text-[11px]">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>驳回具体原因</span>
                                </div>
                                <p className="text-[11px] text-slate-200 leading-relaxed break-words font-normal">
                                  {rejectReasonText}{rejectDetailText ? ` - ${rejectDetailText}` : ''}
                                </p>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-500 whitespace-nowrap text-[11px]">
                      {item.auditTime}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDetail(item)}
                        className="px-3 py-1 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                );
              })}
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
    </div>
  );
};
