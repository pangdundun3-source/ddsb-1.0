import React, { useState } from 'react';
import { AuditRecordItem, PageId, ReportItem } from '../types';
import { Search, RotateCcw } from 'lucide-react';

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
  const [auditorName, setAuditorName] = useState('');

  const filtered = records.filter((rec) => {
    if (keyword && !rec.title.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (auditorName && !rec.auditor.toLowerCase().includes(auditorName.toLowerCase())) return false;
    return true;
  });

  const handleReset = () => {
    setKeyword('');
    setAuditorName('');
  };

  const handleDetail = (item: AuditRecordItem) => {
    onSelectAuditRecord(item);
    onNavigate('audit-record-detail');
  };

  const getRelatedReport = (item: AuditRecordItem) =>
    allReports.find((report) => report.id === item.reportId || report.title === item.title);

  const formatScore = (score?: number | string) => {
    if (score === undefined || score === '--') return '--';
    return `${score}`.includes('分') ? `${score}` : `${score}分`;
  };

  const getAuditResultDescription = (item: AuditRecordItem) => {
    const relatedReport = getRelatedReport(item);

    if (item.auditResult === '已通过') {
      return formatScore(item.score ?? relatedReport?.score);
    }

    const rejectedNode = relatedReport?.timeline?.find(
      (node) => node.status === 'rejected' || node.title.includes('驳回')
    );
    return (
      item.rejectReason ||
      item.rejectDetail ||
      rejectedNode?.note ||
      rejectedNode?.operator ||
      '信息不完整，请补充相关证明材料后重新提交。'
    );
  };

  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">审核记录</h2>
        <p className="text-xs text-gray-400 mt-1">展示本机构的所有已处理的审核记录</p>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-lg p-5 border border-gray-200/80 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
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
            <label className="block text-gray-600 mb-1 font-medium">审核时间区间</label>
            <div className="flex items-center space-x-1">
              <input type="text" placeholder="年/月/日" className="w-1/2 px-2 py-1.5 border border-gray-300 rounded text-[11px]" />
              <span className="text-gray-400">-</span>
              <input type="text" placeholder="年/月/日" className="w-1/2 px-2 py-1.5 border border-gray-300 rounded text-[11px]" />
            </div>
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

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold">
                <th className="py-3 px-4 w-12 text-center">序号</th>
                <th className="py-3 px-4 min-w-[240px]">事件标题</th>
                <th className="py-3 px-4">所属机构</th>
                <th className="py-3 px-4">审核人员</th>
                <th className="py-3 px-4 text-center">审核结果</th>
                <th className="py-3 px-4 min-w-[180px]">审核结果描述</th>
                <th className="py-3 px-4">审核时间</th>
                <th className="py-3 px-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filtered.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-400 font-mono">{index + 1}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDetail(item)}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left cursor-pointer"
                    >
                      {item.title}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{item.organization}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">{item.auditor}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {item.auditResult === '已通过' ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                        已通过
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 text-rose-600 border border-rose-200">
                        被驳回
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <div className="max-w-[240px] truncate" title={getAuditResultDescription(item)}>
                      {getAuditResultDescription(item)}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">{item.auditTime}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleDetail(item)}
                      className="text-[#1E5ABB] hover:underline font-medium cursor-pointer"
                    >
                      详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>共 {filtered.length} 条记录</div>
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
