import React, { useState } from 'react';
import { ReportItem, PageId } from '../types';
import { Search, RotateCcw } from 'lucide-react';

interface ReportSummaryProps {
  reports: ReportItem[];
  onSelectReport: (report: ReportItem) => void;
  onNavigate: (page: PageId) => void;
}

export const ReportSummary: React.FC<ReportSummaryProps> = ({ reports, onSelectReport, onNavigate }) => {
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState('全部');
  const [statusFilter, setStatusFilter] = useState('全部');
  const organizationOptions = Array.from(new Set(reports.map((item) => item.organization)));

  const getStatusLabel = (status: ReportItem['auditStatus']) => {
    switch (status) {
      case '被驳回':
        return '已驳回';
      case '待审核':
        return '待审核';
      case '审核中':
        return '审核中';
      case '已通过':
      case '待转办':
      case '已转办':
        return '已完成';
      default:
        return status;
    }
  };

  const statusOrder = ['待审核', '已驳回', '审核中', '已完成'];
  const getBalancedDisplayReports = (items: ReportItem[], maxCount = 15) => {
    const buckets = statusOrder.map((status) =>
      items.filter((item) => getStatusLabel(item.auditStatus) === status)
    );
    const display: ReportItem[] = [];
    let round = 0;

    while (display.length < maxCount && buckets.some((bucket) => bucket[round])) {
      for (const bucket of buckets) {
        if (display.length >= maxCount) break;
        if (bucket[round]) display.push(bucket[round]);
      }
      round += 1;
    }

    return display;
  };

  // Filtered reports
  const filtered = reports.filter((item) => {
    if (keyword && !item.title.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (organizationFilter !== '全部' && item.organization !== organizationFilter) return false;
    if (statusFilter !== '全部' && getStatusLabel(item.auditStatus) !== statusFilter) return false;
    return true;
  });
  const hasActiveFilter = Boolean(keyword || startDate || endDate || organizationFilter !== '全部' || statusFilter !== '全部');
  const displayReports = hasActiveFilter
    ? filtered.slice(0, 15)
    : getBalancedDisplayReports(filtered, 15);

  const handleReset = () => {
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setOrganizationFilter('全部');
    setStatusFilter('全部');
  };

  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">报送记录</h2>
        <p className="text-xs text-gray-400 mt-1">展示本机构的所有上报信息</p>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-lg p-5 border border-gray-200/80 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* 事件标题 */}
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

          {/* 上报时间 */}
          <div>
            <label className="block text-gray-600 mb-1 font-medium">上报时间</label>
            <div className="flex items-center space-x-1">
              <input
                type="text"
                placeholder="年/月/日"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-1/2 px-2 py-1.5 border border-gray-300 rounded text-[11px] focus:outline-none"
              />
              <span className="text-gray-400">-</span>
              <input
                type="text"
                placeholder="年/月/日"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-1/2 px-2 py-1.5 border border-gray-300 rounded text-[11px] focus:outline-none"
              />
            </div>
          </div>

          {/* 所属机构 */}
          <div>
            <label className="block text-gray-600 mb-1 font-medium">所属机构</label>
            <select
              value={organizationFilter}
              onChange={(e) => setOrganizationFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none bg-white text-gray-700"
            >
              <option value="全部">全部</option>
              {organizationOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* 状态 */}
          <div>
            <label className="block text-gray-600 mb-1 font-medium">状态</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none bg-white text-gray-700"
            >
              <option value="全部">全部</option>
              <option value="待审核">待审核</option>
              <option value="已驳回">已驳回</option>
              <option value="审核中">审核中</option>
              <option value="已完成">已完成</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-2 pt-1 border-t border-gray-100">
          <button
            onClick={() => {}}
            className="px-4 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-medium rounded shadow-2xs transition-colors cursor-pointer flex items-center space-x-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span>查询</span>
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded border border-gray-200 transition-colors cursor-pointer flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置</span>
          </button>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-white rounded-lg border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold">
                <th className="py-3 px-4 w-12 text-center">序号</th>
                <th className="py-3 px-4 min-w-[220px]">事件标题</th>
                <th className="py-3 px-4 min-w-[260px]">内容描述</th>
                <th className="py-3 px-4">上报人员</th>
                <th className="py-3 px-4">所属机构</th>
                <th className="py-3 px-4">上报时间</th>
                <th className="py-3 px-4 text-center">状态</th>
                <th className="py-3 px-4 text-center">分值</th>
                <th className="py-3 px-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {displayReports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    未查找到匹配的上报记录
                  </td>
                </tr>
              ) : (
                displayReports.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3 px-4 text-center text-gray-400 font-mono">{index + 1}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          onSelectReport(item);
                          onNavigate('report-detail');
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left cursor-pointer"
                      >
                        {item.title}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <div className="max-w-[320px] truncate" title={item.detailContent?.summary || '暂无内容描述'}>
                        {item.detailContent?.summary || '暂无内容描述'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-800 font-medium">{item.author}</td>
                    <td className="py-3 px-4 text-gray-600">{item.organization}</td>
                    <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">{item.submitTime}</td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {getStatusLabel(item.auditStatus) === '待审核' && (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-700 border border-amber-200">
                          待审核
                        </span>
                      )}
                      {getStatusLabel(item.auditStatus) === '已驳回' && (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 text-rose-600 border border-rose-200">
                          已驳回
                        </span>
                      )}
                      {getStatusLabel(item.auditStatus) === '审核中' && (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-700 border border-blue-200">
                          审核中
                        </span>
                      )}
                      {getStatusLabel(item.auditStatus) === '已完成' && (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          已完成
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-gray-700 font-mono">
                      {item.score ?? '--'}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          onSelectReport(item);
                          onNavigate('report-detail');
                        }}
                        className="text-[#1E5ABB] hover:underline font-medium cursor-pointer"
                      >
                        详情
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>共 {filtered.length} 条记录，本页展示 {displayReports.length} 条</div>
          <div className="flex items-center space-x-2">
            <button className="px-2 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50">&lt;</button>
            <span className="px-2.5 py-1 bg-[#1E5ABB] text-white rounded font-bold">1</span>
            <button className="px-2 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50">&gt;</button>
            <span className="ml-2 text-gray-400">跳转至</span>
            <input
              type="text"
              defaultValue="1"
              className="w-8 px-1.5 py-0.5 border border-gray-300 rounded text-center focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
