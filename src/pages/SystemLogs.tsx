import React, { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';

interface OpLogItem {
  id: string;
  module: string;
  content: string;
  operator: string;
  ip: string;
  timestamp: string;
  status: '成功' | '失败';
}

interface LoginLogItem {
  id: string;
  username: string;
  ip: string;
  location: string;
  browser: string;
  timestamp: string;
  status: '成功' | '失败';
}

export const SystemLogs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'op' | 'login'>('op');

  // Filter States
  const [moduleFilter, setModuleFilter] = useState('全部');
  const [typeFilter, setTypeFilter] = useState('全部');
  const [operatorFilter, setOperatorFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Initial Op Logs matching image 4
  const [opLogs] = useState<OpLogItem[]>([
    {
      id: 'LOG-10024',
      module: '机构管理',
      content: '新增机构【市委宣传部】',
      operator: '张建国',
      ip: '192.168.1.102',
      timestamp: '2025-05-20 14:32:10',
      status: '成功'
    },
    {
      id: 'LOG-10023',
      module: '角色权限',
      content: '修改角色【审核员】权限配置',
      operator: '李明',
      ip: '192.168.1.105',
      timestamp: '2025-05-20 11:15:22',
      status: '成功'
    },
    {
      id: 'LOG-10022',
      module: '速报管理',
      content: '审核通过速报【关于某社区民生事项...】',
      operator: '王芳',
      ip: '192.168.1.88',
      timestamp: '2025-05-20 09:40:05',
      status: '成功'
    },
    {
      id: 'LOG-10021',
      module: '业务配置',
      content: '禁用来源【快手】',
      operator: '张建国',
      ip: '192.168.1.102',
      timestamp: '2025-05-19 16:20:45',
      status: '成功'
    },
    {
      id: 'LOG-10020',
      module: '系统登录',
      content: '用户登录系统失败（密码错误）',
      operator: '赵强',
      ip: '192.168.1.110',
      timestamp: '2025-05-19 08:12:01',
      status: '失败'
    }
  ]);

  // Initial Login Logs
  const [loginLogs] = useState<LoginLogItem[]>([
    {
      id: 'LOGIN-8001',
      username: '张建国',
      ip: '192.168.1.102',
      location: '台中市',
      browser: 'Chrome 124.0',
      timestamp: '2025-05-20 14:00:12',
      status: '成功'
    },
    {
      id: 'LOGIN-8000',
      username: '李明',
      ip: '192.168.1.105',
      location: '台中市',
      browser: 'Edge 123.0',
      timestamp: '2025-05-20 09:12:00',
      status: '成功'
    },
    {
      id: 'LOGIN-7999',
      username: '赵强',
      ip: '192.168.1.110',
      location: '台中市',
      browser: 'Chrome 124.0',
      timestamp: '2025-05-19 08:12:01',
      status: '失败'
    }
  ]);

  const [currentPage, setCurrentPage] = useState(1);

  const handleReset = () => {
    setModuleFilter('全部');
    setTypeFilter('全部');
    setOperatorFilter('');
    setStartDate('');
    setEndDate('');
  };

  const filteredOpLogs = opLogs.filter((log) => {
    if (moduleFilter !== '全部' && log.module !== moduleFilter) return false;
    if (operatorFilter && !log.operator.includes(operatorFilter)) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">系统审计日志</h2>
        <p className="text-xs text-gray-400 mt-0.5">查看系统的操作日志与安全审计记录</p>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-lg border border-gray-200/80 shadow-2xs p-5 space-y-5">
        {/* Top Tabs */}
        <div className="flex space-x-8 border-b border-gray-100 text-xs font-bold">
          <button
            onClick={() => setActiveTab('op')}
            className={`pb-3 cursor-pointer border-b-2 transition-colors ${
              activeTab === 'op' ? 'border-[#1E5ABB] text-[#1E5ABB]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            操作日志
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={`pb-3 cursor-pointer border-b-2 transition-colors ${
              activeTab === 'login' ? 'border-[#1E5ABB] text-[#1E5ABB]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            登录日志
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {activeTab === 'op' && (
              <div>
                <label className="block text-gray-600 mb-1 font-medium">操作模块</label>
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                >
                  <option value="全部">全部</option>
                  <option value="机构管理">机构管理</option>
                  <option value="角色权限">角色权限</option>
                  <option value="速报管理">速报管理</option>
                  <option value="业务配置">业务配置</option>
                  <option value="系统登录">系统登录</option>
                </select>
              </div>
            )}

            {activeTab === 'op' && (
              <div>
                <label className="block text-gray-600 mb-1 font-medium">操作类型</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                >
                  <option value="全部">全部</option>
                  <option value="新增">新增</option>
                  <option value="修改">修改</option>
                  <option value="删除">删除</option>
                  <option value="审核">审核</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-gray-600 mb-1 font-medium">操作人</label>
              <input
                type="text"
                value={operatorFilter}
                onChange={(e) => setOperatorFilter(e.target.value)}
                placeholder="请输入操作人姓名"
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1 font-medium">操作时间</label>
              <div className="flex items-center space-x-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-1/2 px-1.5 py-1 border border-gray-200 rounded bg-white text-[11px] text-gray-700"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-1/2 px-1.5 py-1 border border-gray-200 rounded bg-white text-[11px] text-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button className="px-4 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold rounded shadow-2xs flex items-center space-x-1 cursor-pointer">
              <Search className="w-3.5 h-3.5" />
              <span>搜索</span>
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-600 text-xs font-medium rounded flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>
          </div>
        </div>

        {/* Log Table */}
        <div className="overflow-x-auto border border-gray-100 rounded-lg">
          {activeTab === 'op' ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 border-b border-gray-200 font-medium">
                  <th className="py-2.5 px-4 font-mono">日志ID</th>
                  <th className="py-2.5 px-4">操作模块</th>
                  <th className="py-2.5 px-4">操作内容</th>
                  <th className="py-2.5 px-4">操作人</th>
                  <th className="py-2.5 px-4 font-mono">请求IP</th>
                  <th className="py-2.5 px-4 font-mono">操作时间</th>
                  <th className="py-2.5 px-4 text-center">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredOpLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3 px-4 font-mono text-gray-500">{log.id}</td>
                    <td className="py-3 px-4 font-bold text-gray-800">{log.module}</td>
                    <td className="py-3 px-4 text-gray-700">{log.content}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{log.operator}</td>
                    <td className="py-3 px-4 font-mono text-gray-500">{log.ip}</td>
                    <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {log.status === '成功' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-600 font-bold">
                          成功
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-600 font-bold">
                          失败
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 border-b border-gray-200 font-medium">
                  <th className="py-2.5 px-4 font-mono">日志ID</th>
                  <th className="py-2.5 px-4">登录账号</th>
                  <th className="py-2.5 px-4 font-mono">IP地址</th>
                  <th className="py-2.5 px-4">登录地点</th>
                  <th className="py-2.5 px-4">浏览器</th>
                  <th className="py-2.5 px-4 font-mono">登录时间</th>
                  <th className="py-2.5 px-4 text-center">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {loginLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3 px-4 font-mono text-gray-500">{log.id}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{log.username}</td>
                    <td className="py-3 px-4 font-mono text-gray-500">{log.ip}</td>
                    <td className="py-3 px-4 text-gray-600">{log.location}</td>
                    <td className="py-3 px-4 text-gray-600">{log.browser}</td>
                    <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {log.status === '成功' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-600 font-bold">
                          成功
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-600 font-bold">
                          失败
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 pt-2 gap-2">
          <span>共 128 条记录</span>
          <div className="flex items-center space-x-1 font-mono">
            <button className="px-2.5 py-1 border border-gray-200 rounded bg-white hover:bg-gray-50 disabled:opacity-40">
              &lt;
            </button>
            <button className="px-2.5 py-1 bg-[#1E5ABB] text-white font-bold rounded">1</button>
            <button className="px-2.5 py-1 border border-gray-200 rounded bg-white hover:bg-gray-50">2</button>
            <button className="px-2.5 py-1 border border-gray-200 rounded bg-white hover:bg-gray-50">3</button>
            <button className="px-2.5 py-1 border border-gray-200 rounded bg-white hover:bg-gray-50">4</button>
            <span className="px-1 text-gray-400">...</span>
            <button className="px-2.5 py-1 border border-gray-200 rounded bg-white hover:bg-gray-50">13</button>
            <button className="px-2.5 py-1 border border-gray-200 rounded bg-white hover:bg-gray-50">
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

