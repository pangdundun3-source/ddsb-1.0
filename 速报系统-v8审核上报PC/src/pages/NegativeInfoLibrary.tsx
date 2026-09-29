import React, { useState } from 'react';
import { ReportItem, PageId } from '../types';
import { Search, RotateCcw } from 'lucide-react';

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
  const [source, setSource] = useState('全部');
  const [region, setRegion] = useState('全部');
  const [status, setStatus] = useState('全部');

  const filtered = negativeList.filter((item) => {
    if (keyword && !item.title.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (source !== '全部' && item.source !== source) return false;
    if (region !== '全部' && item.region !== region) return false;
    if (status !== '全部' && item.auditStatus !== status) return false;
    return true;
  });

  const handleReset = () => {
    setKeyword('');
    setSource('全部');
    setRegion('全部');
    setStatus('全部');
  };

  return (
    <div className="space-y-4">
      {/* Title Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">审核管理 · 不良信息库</h2>
          <p className="text-xs text-gray-400 mt-1">展示本机构的所有已审核通过的上报信息，支持一键研判转办</p>
        </div>
        <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto">
          <button
            onClick={() => onNavigate('report-audit')}
            className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            待我审核
          </button>
          <button
            onClick={() => onNavigate('audit-records')}
            className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            审核记录
          </button>
          <button
            onClick={() => onNavigate('negative-info')}
            className="px-3.5 py-1.5 rounded-lg bg-white text-[#1E5ABB] shadow-2xs cursor-pointer flex items-center space-x-1.5"
          >
            <span>不良信息库</span>
            <span className="bg-indigo-100 text-indigo-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {negativeList.length}
            </span>
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-lg p-5 border border-gray-200/80 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
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
            <label className="block text-gray-600 mb-1 font-medium">上报时间</label>
            <div className="flex items-center space-x-1">
              <input type="text" placeholder="年/月/日" className="w-1/2 px-2 py-1.5 border border-gray-300 rounded text-[11px]" />
              <span className="text-gray-400">-</span>
              <input type="text" placeholder="年/月/日" className="w-1/2 px-2 py-1.5 border border-gray-300 rounded text-[11px]" />
            </div>
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">事件来源</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-gray-700"
            >
              <option value="全部">全部</option>
              <option value="群众举报">群众举报</option>
              <option value="新闻网站">新闻网站</option>
              <option value="社交媒体">社交媒体</option>
              <option value="政府官网">政府官网</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">涉及区域</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-gray-700"
            >
              <option value="全部">全部</option>
              <option value="西屯区">西屯区</option>
              <option value="全市">全市</option>
              <option value="北屯区">北屯区</option>
              <option value="南屯区">南屯区</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">信息类型</label>
            <select className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-gray-700">
              <option value="全部">全部</option>
              <option value="突发事件">突发事件</option>
              <option value="舆情动态">舆情动态</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">状态</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-gray-700"
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
                <th className="py-3 px-4 min-w-[220px]">事件标题</th>
                <th className="py-3 px-4">事件来源</th>
                <th className="py-3 px-4">涉及区域</th>
                <th className="py-3 px-4">信息类型</th>
                <th className="py-3 px-4">上报人员</th>
                <th className="py-3 px-4">所属机构</th>
                <th className="py-3 px-4">上报时间</th>
                <th className="py-3 px-4 text-center">状态</th>
                <th className="py-3 px-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filtered.map((item, index) => (
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
                  <td className="py-3 px-4 text-gray-600">{item.source}</td>
                  <td className="py-3 px-4 text-gray-600">{item.region}</td>
                  <td className="py-3 px-4 text-gray-600">{item.infoType}</td>
                  <td className="py-3 px-4 text-gray-800 font-medium">{item.author}</td>
                  <td className="py-3 px-4 text-gray-600">{item.organization}</td>
                  <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">{item.submitTime}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {item.auditStatus === '待转办' ? (
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
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
