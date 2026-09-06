import React, { useState, useEffect } from 'react';
import { ReportItem, PageId } from '../types';
import { ChevronDown, Search, RotateCcw, X } from 'lucide-react';
import { PaginationBar } from '../components/PaginationBar';
import { OrgPathDisplay, getOrganizationPathText } from '../components/OrgPathDisplay';
import { IdentificationBadge } from '../components/IdentificationBadge';
import { resolveIdentification } from '../services/identificationService';

interface NegativeInfoLibraryProps {
  negativeList: ReportItem[];
  onSelectNegative: (item: ReportItem) => void;
  onTransferSubmit?: (id: number, opinion: string) => void;
  onNavigate: (page: PageId) => void;
}

export const NegativeInfoLibrary: React.FC<NegativeInfoLibraryProps> = ({
  negativeList,
  onSelectNegative,
  onTransferSubmit,
  onNavigate
}) => {
  const [keyword, setKeyword] = useState('');
  const [timeFilterType, setTimeFilterType] = useState<'submit' | 'auditComplete'>('submit');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [orgFilterType, setOrgFilterType] = useState<'submit' | 'audit'>('submit');
  const [orgFilter, setOrgFilter] = useState('全部');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [identFilter, setIdentFilter] = useState<'全部' | '首发' | '重复'>('全部');
  const [transferTarget, setTransferTarget] = useState<ReportItem | null>(null);
  const [transferOpinion, setTransferOpinion] = useState('');

  const getAuditNode = (item: ReportItem) =>
    [...(item.timeline || [])]
      .reverse()
      .find((node) => (node.title.includes('审核') || node.title.includes('审')) && node.status !== 'pending');

  const getAuditor = (item: ReportItem) => {
    const operator = item.auditor || getAuditNode(item)?.operator || '系统审核';
    return operator.split('·')[0].trim();
  };

  const getAuditorOrg = (item: ReportItem) => {
    const operator = item.auditor || getAuditNode(item)?.operator || '';
    const parts = operator.split('·');
    return (parts[1] || '').trim() || '市委宣传部舆情科';
  };

  const getAuditCompleteTime = (item: ReportItem) => item.auditTime || getAuditNode(item)?.time || item.submitTime;

  const getTransferStatus = (item: ReportItem) => (item.auditStatus === '已转办' ? '已转办' : '待转办');

  const submitOrgOptions = Array.from(new Set(negativeList.map((item) => item.organization)));
  const auditOrgOptions = Array.from(new Set(negativeList.map((item) => getAuditorOrg(item))));
  const activeOrgOptions = orgFilterType === 'submit' ? submitOrgOptions : auditOrgOptions;

  const normalizeDate = (value?: string) => {
    const dateText = (value || '').trim();
    if (!dateText || dateText === '--') return '';
    return dateText.replace(/\//g, '-').slice(0, 10);
  };

  const startDateFilter = normalizeDate(startDate);
  const endDateFilter = normalizeDate(endDate);
  const getTimeFilterValue = (item: ReportItem) =>
    timeFilterType === 'submit' ? item.submitTime : getAuditCompleteTime(item);

  const filtered = negativeList.filter((item) => {
    if (keyword) {
      const q = keyword.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchAuthor = (item.author || '').toLowerCase().includes(q);
      const matchAuditor = getAuditor(item).toLowerCase().includes(q);
      const matchOrg = (item.organization || '').toLowerCase().includes(q);
      const matchOrgPath = getOrganizationPathText(item.organization).toLowerCase().includes(q);
      const matchAuditorOrgPath = getOrganizationPathText(getAuditorOrg(item)).toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchAuditor && !matchOrg && !matchOrgPath && !matchAuditorOrgPath) {
        return false;
      }
    }
    const itemDate = normalizeDate(getTimeFilterValue(item));
    if (startDateFilter && (!itemDate || itemDate < startDateFilter)) return false;
    if (endDateFilter && (!itemDate || itemDate > endDateFilter)) return false;
    if (statusFilter !== '全部' && getTransferStatus(item) !== statusFilter) return false;
    if (orgFilter !== '全部') {
      const itemOrg = orgFilterType === 'submit' ? item.organization : getAuditorOrg(item);
      if (itemOrg !== orgFilter) return false;
    }
    if (identFilter !== '全部') {
      const identStatus = resolveIdentification(item, negativeList).status;
      if (identFilter === '首发' && identStatus !== '首发' && identStatus !== '疑似首发' && identStatus !== '首发报送') {
        return false;
      }
      if (identFilter === '重复' && identStatus !== '重复' && identStatus !== '疑似重复' && identStatus !== '重复报送') {
        return false;
      }
    }
    return true;
  });
  // Pagination (页码管理 + 每页条数设置)
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, orgFilterType, orgFilter, statusFilter, identFilter, timeFilterType, startDateFilter, endDateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  // 按审核完成时间倒序，让新入库(含中途驳回演示)记录优先展示
  const sortedByAuditTime = [...filtered].sort((a, b) =>
    (getAuditCompleteTime(b) || '').localeCompare(getAuditCompleteTime(a) || '')
  );
  const displayList = sortedByAuditTime.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleReset = () => {
    setKeyword('');
    setTimeFilterType('submit');
    setStartDate('');
    setEndDate('');
    setOrgFilterType('submit');
    setOrgFilter('全部');
    setStatusFilter('全部');
    setIdentFilter('全部');
  };

  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">不良信息库</h2>
        <p className="text-xs text-gray-400 mt-1">展示本机构的所有已审核通过的上报信息，支持一键转办</p>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-lg p-5 border border-gray-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center flex-wrap gap-3 text-xs">
          {/* 检索框 */}
          <div className="flex-1 min-w-[280px]">
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="请输入事件标题、上报人员、审核人员姓名、机构名称进行检索"
                className="w-full pl-9 pr-8 py-2 border border-gray-300 hover:border-gray-400 focus:border-[#1E5ABB] rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 transition-all shadow-2xs"
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

          {/* 时间区间（报送时间 / 审核时间 下拉切换） */}
          <div className="flex items-center space-x-2 shrink-0">
            <select
              value={timeFilterType}
              onChange={(e) => setTimeFilterType(e.target.value as 'submit' | 'auditComplete')}
              aria-label="时间类型"
              className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] shadow-2xs cursor-pointer"
            >
              <option value="submit">报送时间</option>
              <option value="auditComplete">审核时间</option>
            </select>
            <div className="flex items-center space-x-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-32 px-2.5 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB]"
              />
              <span className="text-gray-400 font-bold">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-32 px-2.5 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB]"
              />
            </div>
          </div>

          {/* 机构（报送机构 / 审核机构 下拉切换） */}
          <div className="flex items-center space-x-2 shrink-0">
            <select
              value={orgFilterType}
              onChange={(e) => {
                setOrgFilterType(e.target.value as 'submit' | 'audit');
                setOrgFilter('全部');
              }}
              aria-label="机构类型"
              className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] shadow-2xs cursor-pointer"
            >
              <option value="submit">报送机构</option>
              <option value="audit">审核机构</option>
            </select>
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="min-w-[150px] max-w-[240px] px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] shadow-2xs cursor-pointer"
            >
              <option value="全部">全部</option>
              {activeOrgOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* 状态 */}
          <div className="flex items-center space-x-2 shrink-0">
            <label className="text-gray-700 font-semibold whitespace-nowrap shrink-0">状态</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] shadow-2xs cursor-pointer"
            >
              <option value="全部">全部</option>
              <option value="待转办">待转办</option>
              <option value="已转办">已转办</option>
            </select>
          </div>

          {/* 识别标识 */}
          <div className="flex items-center space-x-2 shrink-0">
            <label className="text-gray-700 font-semibold whitespace-nowrap shrink-0">识别标识</label>
            <select
              value={identFilter}
              onChange={(e) => setIdentFilter(e.target.value as '全部' | '首发' | '重复')}
              className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] shadow-2xs cursor-pointer"
            >
              <option value="全部">全部</option>
              <option value="首发">首发</option>
              <option value="重复">重复</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
          <div className="text-gray-500 font-medium">
            共查询到 <strong className="text-[#1E5ABB] font-mono">{filtered.length}</strong> 条不良信息
          </div>
          <div className="flex items-center space-x-2">
          <button className="px-4 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-medium rounded shadow-2xs flex items-center space-x-1 cursor-pointer">
            <Search className="w-3.5 h-3.5" />
            <span>查询</span>
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded border border-gray-200 flex items-center space-x-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置</span>
          </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold">
                <th className="py-3 px-4 w-12 text-center">序号</th>
                <th className="py-3 px-4 min-w-[260px]">事件标题</th>
                <th className="py-3 px-4 min-w-[160px]">上报人员 / 机构</th>
                <th className="py-3 px-4">报送时间</th>
                <th className="py-3 px-4 min-w-[160px]">审核人员 / 机构</th>
                <th className="py-3 px-4 text-center">状态</th>
                <th className="py-3 px-4">审核时间</th>
                <th className="py-3 px-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {displayList.map((item, index) => {
                const ident = resolveIdentification(item, negativeList);
                return (
                  <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3 px-4 text-center text-gray-400 font-mono">{(safePage - 1) * pageSize + index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => {
                            onSelectNegative(item);
                            onNavigate('negative-detail');
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left cursor-pointer"
                        >
                          {item.title}
                        </button>
                        <IdentificationBadge status={ident.status} size="xs" showIcon />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900 leading-snug">{item.author}</div>
                      <OrgPathDisplay organization={item.organization} className="max-w-[220px]" />
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">{item.submitTime}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900 leading-snug">{getAuditor(item)}</div>
                      <OrgPathDisplay organization={getAuditorOrg(item)} className="max-w-[220px]" />
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {getTransferStatus(item) === '待转办' ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-700 border border-amber-200">
                          待转办
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-700 border border-blue-200">
                          已转办
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">{getAuditCompleteTime(item)}</td>
                    <td className="py-3 px-4 text-center whitespace-nowrap space-x-2">
                      <button
                        onClick={() => {
                          onSelectNegative(item);
                          onNavigate('negative-detail');
                        }}
                        className="text-[#1E5ABB] hover:underline font-medium cursor-pointer"
                      >
                        详情
                      </button>
                      {getTransferStatus(item) === '待转办' ? (
                        <>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => {
                              setTransferTarget(item);
                              setTransferOpinion('');
                            }}
                            className="text-[#1E5ABB] hover:underline font-medium cursor-pointer"
                          >
                            转办
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400">已转办</span>
                      )}
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

      {/* Transfer Modal */}
      {transferTarget && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2 text-rose-600">
                <ChevronDown className="w-4 h-4" />
                <h3 className="text-sm font-bold text-gray-900">确认转办</h3>
              </div>
              <button
                onClick={() => setTransferTarget(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-lg border border-gray-200 text-xs text-gray-600">
              <span className="font-bold text-gray-800">转办对象：</span>
              <span>《{transferTarget.title}》</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">转办意见（选填）</label>
              <textarea
                rows={3}
                value={transferOpinion}
                onChange={(e) => setTransferOpinion(e.target.value)}
                placeholder="请输入转办说明或建议处理单位..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setTransferTarget(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onTransferSubmit) {
                    onTransferSubmit(transferTarget.id, transferOpinion);
                  }
                  setTransferTarget(null);
                  setTransferOpinion('');
                }}
                className="px-4 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
              >
                确认转办
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
