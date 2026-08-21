import React, { useState } from 'react';
import { ReportItem, PageId } from '../types';
import { ChevronDown, Search, RotateCcw } from 'lucide-react';

interface NegativeInfoLibraryProps {
  negativeList: ReportItem[];
  onSelectNegative: (item: ReportItem) => void;
  onNavigate: (page: PageId) => void;
}

export const NegativeInfoLibrary: React.FC<NegativeInfoLibraryProps> = ({
  negativeList,
  onSelectNegative,
  onNavigate
}) => {
  const [keyword, setKeyword] = useState('');
  const [timeFilterType, setTimeFilterType] = useState<'submit' | 'auditComplete'>('submit');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState('全部');
  const [auditorName, setAuditorName] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部');
  const organizationOptions = Array.from(new Set(negativeList.map((item) => item.organization)));

  const getAuditNode = (item: ReportItem) =>
    [...(item.timeline || [])]
      .reverse()
      .find((node) => (node.title.includes('审核') || node.title.includes('审')) && node.status !== 'pending');

  const getAuditor = (item: ReportItem) => {
    const operator = item.auditor || getAuditNode(item)?.operator || '系统审核';
    return operator.split('·')[0].trim();
  };

  const getAuditCompleteTime = (item: ReportItem) => item.auditTime || getAuditNode(item)?.time || item.submitTime;

  const getTransferStatus = (item: ReportItem) => (item.auditStatus === '已转办' ? '已转办' : '待转办');

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
    if (keyword && !item.title.toLowerCase().includes(keyword.toLowerCase())) return false;
    const itemDate = normalizeDate(getTimeFilterValue(item));
    if (startDateFilter && (!itemDate || itemDate < startDateFilter)) return false;
    if (endDateFilter && (!itemDate || itemDate > endDateFilter)) return false;
    if (organizationFilter !== '全部' && item.organization !== organizationFilter) return false;
    if (auditorName && !getAuditor(item).toLowerCase().includes(auditorName.toLowerCase())) return false;
    if (statusFilter !== '全部' && getTransferStatus(item) !== statusFilter) return false;
    return true;
  });
  const displayList = filtered.slice(0, 15);

  const handleReset = () => {
    setKeyword('');
    setTimeFilterType('submit');
    setStartDate('');
    setEndDate('');
    setOrganizationFilter('全部');
    setAuditorName('');
    setStatusFilter('全部');
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          <div>
            <label className="block text-gray-600 mb-1 font-medium">事件标题</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="标题关键字"
              className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="block text-gray-600 font-medium">
                {timeFilterType === 'submit' ? '上报时间区间' : '审核完成时间区间'}
              </label>
              <div className="relative w-28 shrink-0">
                <select
                  value={timeFilterType}
                  onChange={(e) => setTimeFilterType(e.target.value as 'submit' | 'auditComplete')}
                  className="w-full appearance-none rounded border border-gray-300 bg-white px-2.5 py-1.5 pr-7 text-[11px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                >
                  <option value="submit">上报</option>
                  <option value="auditComplete">审核完成</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="年/月/日"
                className="w-1/2 px-2 py-1.5 border border-gray-300 rounded text-[11px]"
              />
              <span className="text-gray-400">-</span>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="年/月/日"
                className="w-1/2 px-2 py-1.5 border border-gray-300 rounded text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">所属机构</label>
            <select
              value={organizationFilter}
              onChange={(e) => setOrganizationFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
            >
              <option value="全部">全部</option>
              {organizationOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">审核人员</label>
            <input
              type="text"
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              placeholder="请输入姓名"
              className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">状态</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
            >
              <option value="全部">全部</option>
              <option value="待转办">待转办</option>
              <option value="已转办">已转办</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-1 border-t border-gray-100">
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

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold">
                <th className="py-3 px-4 w-12 text-center">序号</th>
                <th className="py-3 px-4 min-w-[240px]">事件标题</th>
                <th className="py-3 px-4">所属机构</th>
                <th className="py-3 px-4">审核人员</th>
                <th className="py-3 px-4">上报时间</th>
                <th className="py-3 px-4">审核完成时间</th>
                <th className="py-3 px-4 text-center">状态</th>
                <th className="py-3 px-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {displayList.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-400 font-mono">{index + 1}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        onSelectNegative(item);
                        onNavigate('negative-detail');
                      }}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left cursor-pointer"
                    >
                      {item.title}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{item.organization}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">{getAuditor(item)}</td>
                  <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">{item.submitTime}</td>
                  <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">{getAuditCompleteTime(item)}</td>
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
                            onSelectNegative(item);
                            onNavigate('negative-detail');
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>共 {displayList.length} 条记录</div>
          <div className="flex items-center space-x-2">
            <button className="px-2 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50">&lt;</button>
            <span className="px-2.5 py-1 bg-[#1E5ABB] text-white rounded font-bold">1</span>
            <button className="px-2 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50">&gt;</button>
            <span className="ml-2 text-gray-400">跳转至</span>
            <input type="text" defaultValue="1" className="w-8 px-1.5 py-0.5 border border-gray-300 rounded text-center" />
          </div>
        </div>
      </div>
    </div>
  );
};
