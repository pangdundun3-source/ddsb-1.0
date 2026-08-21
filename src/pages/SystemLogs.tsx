import React, { useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Download,
  FileSearch,
  LogIn,
  MapPin,
  Monitor,
  RotateCcw,
  Search,
  UserRound,
  XCircle,
} from 'lucide-react';
import type { LogItem } from '../types';

type LogTab = 'operation' | 'login';
type LogResult = '成功' | '失败';

interface AuditLogRow {
  id: string;
  tab: LogTab;
  module: string;
  action: string;
  target: string;
  details: string;
  operator: string;
  organization: string;
  ip: string;
  location: string;
  browser: string;
  timestamp: string;
  result: LogResult;
  before?: string;
  after?: string;
  requestId?: string;
}

interface SystemLogsProps {
  logs?: LogItem[];
}

const seedLogs: AuditLogRow[] = [
  {
    id: 'LOG-20260814-001',
    tab: 'operation',
    module: '业务配置',
    action: '修改配置',
    target: '审核驳回理由',
    details: '调整审核驳回理由的展示名称和启用状态',
    operator: '张三',
    organization: '台中市网信办',
    ip: '192.168.1.102',
    location: '台中市',
    browser: 'Chrome 124',
    timestamp: '2026-08-14 10:26:18',
    result: '成功',
    before: '拒绝理由 / 审核驳回原由',
    after: '审核驳回理由',
    requestId: 'REQ-8A1026',
  },
  {
    id: 'LOG-20260814-002',
    tab: 'operation',
    module: '组织管理',
    action: '新增机构',
    target: '台中市网信办 / 企事业单位',
    details: '新增下级机构“的车次”并绑定机构负责人',
    operator: '张三',
    organization: '台中市网信办',
    ip: '192.168.1.102',
    location: '台中市',
    browser: 'Chrome 124',
    timestamp: '2026-08-14 09:48:05',
    result: '成功',
    requestId: 'REQ-8A0948',
  },
  {
    id: 'LOG-20260814-003',
    tab: 'operation',
    module: '审核流程',
    action: '启用流程',
    target: '标准二级复核流程',
    details: '将流程设置为当前机构审核流程',
    operator: '李明',
    organization: '中共台中市委宣传部',
    ip: '192.168.1.105',
    location: '台中市',
    browser: 'Edge 123',
    timestamp: '2026-08-14 09:12:44',
    result: '成功',
    before: '继承上级流程',
    after: '标准二级复核流程',
    requestId: 'REQ-8A0912',
  },
  {
    id: 'LOGIN-20260814-005',
    tab: 'login',
    module: '身份认证',
    action: '登录系统',
    target: '客户管理端',
    details: '账号密码登录成功',
    operator: '张三',
    organization: '台中市网信办',
    ip: '192.168.1.102',
    location: '台中市',
    browser: 'Chrome 124 / Windows',
    timestamp: '2026-08-14 08:42:10',
    result: '成功',
    requestId: 'REQ-8A0842',
  },
  {
    id: 'LOGIN-20260814-006',
    tab: 'login',
    module: '身份认证',
    action: '登录失败',
    target: '客户管理端',
    details: '密码错误，连续失败次数 2 次',
    operator: '赵强',
    organization: '西屯区宣传部',
    ip: '192.168.1.110',
    location: '台中市',
    browser: 'Chrome 124 / Windows',
    timestamp: '2026-08-14 08:12:01',
    result: '失败',
    requestId: 'REQ-8A0812',
  },
  {
    id: 'LOG-20260813-007',
    tab: 'operation',
    module: '模板配置',
    action: '删除配置',
    target: '测试图文报送模板',
    details: '删除停用状态的报送模板',
    operator: '陈主任',
    organization: '市级党政机关',
    ip: '192.168.1.115',
    location: '台中市',
    browser: 'Chrome 123',
    timestamp: '2026-08-13 17:32:40',
    result: '成功',
    requestId: 'REQ-8A1732',
  },
  {
    id: 'LOG-20260813-008',
    tab: 'operation',
    module: '报送管理',
    action: '审核驳回',
    target: '关于某社区突发停水事件的舆情上报',
    details: '驳回报送并要求补充现场图片凭证',
    operator: '王主任',
    organization: '市委宣传部舆情科',
    ip: '192.168.1.12',
    location: '台中市',
    browser: 'Edge 123',
    timestamp: '2026-08-13 16:18:22',
    result: '成功',
    requestId: 'REQ-8A1618',
  },
  {
    id: 'LOGIN-20260813-010',
    tab: 'login',
    module: '身份认证',
    action: '退出登录',
    target: '客户管理端',
    details: '用户主动退出当前会话',
    operator: '李明',
    organization: '中共台中市委宣传部',
    ip: '192.168.1.105',
    location: '台中市',
    browser: 'Edge 123 / Windows',
    timestamp: '2026-08-13 14:55:30',
    result: '成功',
    requestId: 'REQ-8A1455',
  },
];

const tabMeta: Array<{ id: LogTab; label: string; icon: React.ReactNode }> = [
  { id: 'operation', label: '操作日志', icon: <Activity className="w-3.5 h-3.5" /> },
  { id: 'login', label: '登录日志', icon: <LogIn className="w-3.5 h-3.5" /> },
];

const getDateValue = (timestamp: string) => timestamp.slice(0, 10);

export const SystemLogs: React.FC<SystemLogsProps> = ({ logs = [] }) => {
  const [activeTab, setActiveTab] = useState<LogTab>('operation');
  const [keyword, setKeyword] = useState('');
  const [moduleFilter, setModuleFilter] = useState('全部模块');
  const [actionFilter, setActionFilter] = useState('全部动作');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const incomingLogs = useMemo<AuditLogRow[]>(
    () =>
      logs.map((log) => ({
        id: `LIVE-${log.id}`,
        tab: log.logType === '登录日志' ? 'login' : 'operation',
        module: log.logType === '登录日志' ? '身份认证' : '业务操作',
        action: log.actionType || '系统操作',
        target: log.organization || '未指定对象',
        details: log.details || log.content || '暂无操作详情',
        operator: log.operator || '未知用户',
        organization: log.organization || '未归属机构',
        ip: log.ipAddress || '未知 IP',
        location: '未知地点',
        browser: '未知终端',
        timestamp: log.timestamp || log.time || '暂无时间',
        result: log.result || '成功',
        requestId: `LIVE-${log.id}`,
      })),
    [logs]
  );

  const allLogs = useMemo(() => [...incomingLogs, ...seedLogs], [incomingLogs]);
  const moduleOptions = Array.from(new Set(allLogs.filter((log) => log.tab === activeTab).map((log) => log.module)));
  const actionOptions = Array.from(new Set(allLogs.filter((log) => log.tab === activeTab).map((log) => log.action)));

  const filteredLogs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return allLogs
      .filter((log) => log.tab === activeTab)
      .filter((log) => moduleFilter === '全部模块' || log.module === moduleFilter)
      .filter((log) => actionFilter === '全部动作' || log.action === actionFilter)
      .filter((log) => !startDate || getDateValue(log.timestamp) >= startDate)
      .filter((log) => !endDate || getDateValue(log.timestamp) <= endDate)
      .filter((log) => {
        if (!normalizedKeyword) return true;
        return [log.id, log.operator, log.organization, log.target, log.details, log.ip]
          .join(' ')
          .toLowerCase()
          .includes(normalizedKeyword);
      });
  }, [actionFilter, activeTab, allLogs, endDate, keyword, moduleFilter, startDate]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const visibleLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetFilters = () => {
    setKeyword('');
    setModuleFilter('全部模块');
    setActionFilter('全部动作');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const changeTab = (tab: LogTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setModuleFilter('全部模块');
    setActionFilter('全部动作');
  };

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const exportLogs = () => {
    const headers = ['日志ID', '模块', '动作', '对象', '操作人', '所属机构', '结果', 'IP', '时间'];
    const rows = filteredLogs.map((log) => [
      log.id,
      log.module,
      log.action,
      log.target,
      log.operator,
      log.organization,
      log.result,
      log.ip,
      log.timestamp,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `系统审计日志-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">系统审计日志</h2>
          <p className="text-xs text-gray-400 mt-0.5">统一查看系统操作与登录行为，支持按条件追溯和导出</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#1E5ABB] hover:bg-[#134092] rounded cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            导出当前结果
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-5 border border-gray-200/80 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div className="lg:col-span-2">
            <label className="block text-gray-600 mb-1 font-medium">关键词</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              <input
                value={keyword}
                onChange={(event) => updateFilter(setKeyword, event.target.value)}
                placeholder="日志ID、操作人、对象、IP"
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1 font-medium">模块</label>
            <select
              value={moduleFilter}
              onChange={(event) => updateFilter(setModuleFilter, event.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
            >
              <option>全部模块</option>
              {moduleOptions.map((module) => <option key={module}>{module}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-600 mb-1 font-medium">动作</label>
            <select
              value={actionFilter}
              onChange={(event) => updateFilter(setActionFilter, event.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
            >
              <option>全部动作</option>
              {actionOptions.map((action) => <option key={action}>{action}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-600 mb-1 font-medium">日志时间</label>
            <div className="flex items-center space-x-1">
              <input
                type="date"
                value={startDate}
                onChange={(event) => updateFilter(setStartDate, event.target.value)}
                className="w-1/2 min-w-0 px-2 py-1.5 border border-gray-300 rounded bg-white text-gray-700 text-[11px] focus:outline-none"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => updateFilter(setEndDate, event.target.value)}
                className="w-1/2 min-w-0 px-2 py-1.5 border border-gray-300 rounded bg-white text-gray-700 text-[11px] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-1 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            className="px-4 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-medium rounded shadow-2xs transition-colors cursor-pointer flex items-center space-x-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span>查询</span>
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded border border-gray-200 transition-colors cursor-pointer flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 pt-4 border-b border-gray-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-5 overflow-x-auto">
              {tabMeta.map((tab) => {
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => changeTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 pb-3 text-xs font-bold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                      active ? 'text-[#1E5ABB] border-[#1E5ABB]' : 'text-gray-500 border-transparent hover:text-gray-800'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-gray-400 shrink-0">
              <FileSearch className="w-3.5 h-3.5" />
              记录不可编辑
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'login' ? (
            <table className="w-full min-w-[980px] text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-4 font-mono font-medium">日志ID</th>
                  <th className="py-2.5 px-4 font-medium">账号 / 机构</th>
                  <th className="py-2.5 px-4 font-medium">登录动作</th>
                  <th className="py-2.5 px-4 font-medium">IP / 地点</th>
                  <th className="py-2.5 px-4 font-medium">终端</th>
                  <th className="py-2.5 px-4 font-mono font-medium">时间</th>
                  <th className="py-2.5 px-4 text-center font-medium">结果</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3 px-4 font-mono text-gray-500">{log.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-50 text-[#1E5ABB] flex items-center justify-center font-bold">
                          {log.operator.slice(0, 1)}
                        </span>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900">{log.operator}</div>
                          <div className="text-[10px] text-gray-400 truncate max-w-44">{log.organization}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-800">{log.action}</div>
                      <div className="text-[10px] text-gray-400">{log.target}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-gray-600">{log.ip}</div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{log.location}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600"><span className="inline-flex items-center gap-1"><Monitor className="w-3 h-3 text-gray-400" />{log.browser}</span></td>
                    <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-4 text-center"><ResultBadge result={log.result} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[1080px] text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-4 font-mono font-medium">日志ID</th>
                  <th className="py-2.5 px-4 font-medium">模块 / 动作</th>
                  <th className="py-2.5 px-4 font-medium">操作对象</th>
                  <th className="py-2.5 px-4 font-medium">操作人 / 机构</th>
                  <th className="py-2.5 px-4 font-medium">结果</th>
                  <th className="py-2.5 px-4 font-mono font-medium">时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3 px-4 font-mono text-gray-500">{log.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-800">{log.module}</div>
                      <div className="text-[10px] text-gray-400">{log.action}</div>
                    </td>
                    <td className="py-3 px-4 max-w-64">
                      <div className="font-medium text-gray-800 truncate" title={log.target}>{log.target}</div>
                      <div className="text-[10px] text-gray-400 truncate" title={log.details}>{log.details}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <UserRound className="w-3.5 h-3.5 text-gray-400" />
                        <div>
                          <div className="font-bold text-gray-800">{log.operator}</div>
                          <div className="text-[10px] text-gray-400">{log.organization}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><ResultBadge result={log.result} /></td>
                    <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {visibleLogs.length === 0 && (
            <div className="py-16 text-center text-xs text-gray-400">没有符合条件的日志记录</div>
          )}
        </div>

        <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>共 {filteredLogs.length} 条记录</div>
          <div className="flex items-center space-x-2">
            <button type="button" disabled={currentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="px-2 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">&lt;</button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 5).map((page) => (
              <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`px-2.5 py-1 rounded cursor-pointer ${page === currentPage ? 'bg-[#1E5ABB] text-white font-bold' : 'border border-gray-200 hover:bg-gray-50'}`}>{page}</button>
            ))}
            <button type="button" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="px-2 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">&gt;</button>
            <span className="ml-2 text-gray-400">跳转至</span>
            <input
              type="text"
              value={currentPage}
              onChange={(event) => {
                const nextPage = Number(event.target.value);
                if (Number.isInteger(nextPage) && nextPage >= 1 && nextPage <= totalPages) {
                  setCurrentPage(nextPage);
                }
              }}
              className="w-8 px-1.5 py-0.5 border border-gray-300 rounded text-center focus:outline-none"
            />
          </div>
        </div>
      </div>

    </div>
  );
};

const ResultBadge: React.FC<{ result: LogResult }> = ({ result }) => (
  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
    result === '成功' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
  }`}>
    {result === '成功' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
    {result}
  </span>
);
