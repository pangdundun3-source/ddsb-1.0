import React from 'react';
import { useSystemLogsViewModel } from '../../viewmodels/useSystemLogsViewModel';

interface SystemLogsProps {
  onShowToast?: (msg: string) => void;
}

export const SystemLogs: React.FC<SystemLogsProps> = ({ onShowToast }) => {
  const { state, actions } = useSystemLogsViewModel(onShowToast);
  const {
    activeCategory,
    logs,
    searchTerm,
    selectedModule,
    selectedStatus,
    timeRange,
    viewingLog,
    filteredLogs,
    categories,
    availableModules,
  } = state;
  const {
    setSearchTerm,
    setSelectedModule,
    setSelectedStatus,
    setTimeRange,
    setViewingLog,
    handleCategoryChange,
    handleResetFilters,
    handleExportLogs,
    notify,
  } = actions;

  return (
    <div className="space-y-6">
      {/* 1. Main Container */}
      <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-4 overflow-x-auto">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1890ff] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">
                  {cat.icon}
                </span>
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索日志编号 / 操作人 / IP / 动作"
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Module Filter */}
            <div className="flex items-center text-xs text-gray-600">
              <span className="mr-1.5 text-gray-500">业务模块:</span>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="border border-gray-200 rounded-md px-2.5 py-2 text-xs focus:outline-none focus:border-[#1890ff] bg-white cursor-pointer"
              >
                <option value="all">全部模块</option>
                {availableModules.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center text-xs text-gray-600">
              <span className="mr-1.5 text-gray-500">执行结果:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-200 rounded-md px-2.5 py-2 text-xs focus:outline-none focus:border-[#1890ff] bg-white cursor-pointer"
              >
                <option value="all">全部结果</option>
                <option value="成功">成功</option>
                <option value="警告">警告</option>
                <option value="拦截">拦截</option>
                <option value="失败">失败</option>
              </select>
            </div>

            {/* Time range buttons */}
            <div className="flex items-center bg-gray-100 p-1 rounded-md text-xs">
              <button
                onClick={() => setTimeRange('today')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  timeRange === 'today'
                    ? 'bg-white text-[#1890ff] font-semibold shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                今日
              </button>
              <button
                onClick={() => setTimeRange('7days')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  timeRange === '7days'
                    ? 'bg-white text-[#1890ff] font-semibold shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                近7天
              </button>
              <button
                onClick={() => setTimeRange('30days')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  timeRange === '30days'
                    ? 'bg-white text-[#1890ff] font-semibold shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                近30天
              </button>
            </div>

            {(searchTerm || selectedModule !== 'all' || selectedStatus !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#1890ff] hover:underline px-2 py-1"
              >
                重置
              </button>
            )}
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExportLogs}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-md text-xs font-medium transition-colors flex items-center shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] mr-1 text-gray-500">
                download
              </span>
              导出日志 (CSV)
            </button>
          </div>
        </div>

        {/* Info banner for compliance */}
        <div className="mt-3 mb-4 bg-blue-50/70 border border-blue-100 text-[#1890ff] px-4 py-2 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>
              <strong>等保合规归档：</strong>日志记录包含操作人真实身份、源IP及上下文报文，加密保存至少 90 天，支持审计溯源。
            </span>
          </div>
          <span className="text-[11px] text-blue-600/80">日志存储容量：已用 2.8 MB / 配额 50 GB</span>
        </div>

        {/* 4. Logs Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f8fafd] text-[#666666] border-b border-gray-200">
                <th className="py-3 px-4 font-semibold text-gray-700">日志流水号</th>
                <th className="py-3 px-4 font-semibold text-gray-700">
                  {activeCategory === 'login' ? '登录人员 / 账号' : '操作人 / 身份'}
                </th>
                {activeCategory === 'login' ? (
                  <>
                    <th className="py-3 px-4 font-semibold text-gray-700">客户端 IP / 归属地</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">操作系统 / 浏览器</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">登录状态</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">登录时间</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-4 font-semibold text-gray-700">所属模块</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">操作动作与目标</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">客户端 IP / 归属地</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">执行结果与耗时</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">操作时间</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={activeCategory === 'login' ? 6 : 7} className="py-12 text-center text-gray-400">
                    <span className="material-symbols-outlined text-[40px] text-gray-300 mb-2">
                      event_busy
                    </span>
                    <p>暂无符合条件的{activeCategory === 'login' ? '登录' : '操作'}日志记录</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded text-[11px] font-medium border border-green-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      成功
                    </span>
                  );
                  if (log.status === '拦截' || log.status === '失败') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded text-[11px] font-medium border border-red-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        {log.status}
                      </span>
                    );
                  } else if (log.status === '警告') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        警告
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      {/* Log ID */}
                      <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setViewingLog(log)}
                          className="font-medium text-gray-600 hover:text-[#1890ff] hover:underline cursor-pointer flex items-center gap-1 text-left"
                          title="点击查看日志详情"
                        >
                          {log.id}
                        </button>
                      </td>

                      {/* Operator */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-800 text-[13px]">
                            {log.operator}
                          </span>
                          {log.operatorJobNo && (
                            <span className="text-[10px] text-gray-400 font-mono">
                              ({log.operatorJobNo})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {log.department} · {log.role}
                        </div>
                      </td>

                      {activeCategory === 'login' ? (
                        <>
                          {/* IP & Location */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-gray-600">
                            <div>{log.ip}</div>
                            <div className="text-[11px] text-gray-400 font-sans mt-0.5">
                              {log.location}
                            </div>
                          </td>

                          {/* OS & Browser */}
                          <td className="py-3.5 px-4 text-[11px] text-gray-600 font-mono">
                            <div>{log.os || '--'}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              {log.browser || '--'}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {statusBadge}
                          </td>

                          {/* Time */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                            {log.time}
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Module */}
                          <td className="py-3.5 px-4">
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap">
                              {log.module}
                            </span>
                          </td>

                          {/* Action & Target */}
                          <td className="py-3.5 px-4 max-w-[280px]">
                            <div className="font-medium text-gray-800 text-[12px]">
                              {log.action}
                            </div>
                            <div
                              className="text-[11px] text-gray-500 mt-0.5 truncate"
                              title={log.target}
                            >
                              {log.target}
                            </div>
                          </td>

                          {/* IP & Location */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-gray-600">
                            <div>{log.ip}</div>
                            <div className="text-[11px] text-gray-400 font-sans mt-0.5">
                              {log.location}
                            </div>
                          </td>

                          {/* Status & Duration */}
                          <td className="py-3.5 px-4">
                            <div>{statusBadge}</div>
                            {log.durationMs && (
                              <div className="text-[10px] text-gray-400 mt-1 font-mono">
                                耗时 {log.durationMs}ms
                              </div>
                            )}
                          </td>

                          {/* Time */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                            {log.time}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <div>
            共检索出 <span className="font-semibold text-gray-800">{filteredLogs.length}</span>{' '}
            条日志记录
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">第 1 / 1 页</span>
            <div className="flex items-center gap-1">
              <button
                disabled
                className="px-2.5 py-1 border border-gray-200 rounded text-gray-400 bg-gray-50 cursor-not-allowed"
              >
                ‹ 上一页
              </button>
              <button className="px-2.5 py-1 bg-[#1890ff] text-white rounded font-medium">
                1
              </button>
              <button
                disabled
                className="px-2.5 py-1 border border-gray-200 rounded text-gray-400 bg-gray-50 cursor-not-allowed"
              >
                下一页 ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Detailed Log Modal / Drawer */}
      {viewingLog && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1890ff] text-[22px]">
                  {viewingLog.category === 'login' ? 'badge' : 'wysiwyg'}
                </span>
                <h3 className="text-base font-bold text-gray-800">
                  {viewingLog.category === 'login'
                    ? '登录认证与终端访问详情'
                    : '操作审计报文与快照详情'}
                </h3>
              </div>
              <button
                onClick={() => setViewingLog(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Basic Info Grid */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-lg">
              <div>
                <span className="text-gray-400 block">日志编号：</span>
                <span className="font-mono font-semibold text-gray-800">
                  {viewingLog.id}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">发生时间：</span>
                <span className="font-mono text-gray-800">{viewingLog.time}</span>
              </div>
              <div>
                <span className="text-gray-400 block">
                  {viewingLog.category === 'login' ? '登录人员：' : '操作人员：'}
                </span>
                <span className="font-semibold text-gray-800">
                  {viewingLog.operator} ({viewingLog.department} · {viewingLog.role})
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">客户端环境：</span>
                <span className="text-gray-800 font-mono">
                  {viewingLog.ip} ({viewingLog.location})
                </span>
              </div>
              {viewingLog.browser && (
                <div className="col-span-2">
                  <span className="text-gray-400 block">User-Agent 终端环境：</span>
                  <span className="text-gray-700 font-mono text-[11px]">
                    {viewingLog.os} · {viewingLog.browser}
                  </span>
                </div>
              )}
            </div>

            {/* Action Details */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-700">
                  {viewingLog.category === 'login' ? '认证动作与会话：' : '操作动作与目标：'}
                </span>
                <span className="bg-blue-50 text-[#1890ff] px-2 py-0.5 rounded text-[11px] font-medium">
                  {viewingLog.module}
                </span>
              </div>
              <div className="bg-blue-50/40 p-3 rounded-lg border border-blue-100">
                <p className="font-semibold text-gray-800 text-[13px]">{viewingLog.action}</p>
                <p className="text-gray-600 mt-1">{viewingLog.target}</p>
              </div>
            </div>

            {/* Response Summary */}
            {viewingLog.responseSummary && (
              <div className="bg-emerald-50/60 border border-emerald-200 text-emerald-800 p-3 rounded-lg">
                <div className="font-semibold mb-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                  响应与会话状态：
                </div>
                <div className="text-[11px] text-emerald-900 font-mono">{viewingLog.responseSummary}</div>
              </div>
            )}

            {/* HTTP API Details if available */}
            {viewingLog.apiUrl && (
              <div>
                <span className="font-bold text-gray-700 block mb-1">请求接口与方法：</span>
                <div className="bg-gray-900 text-green-400 p-2.5 rounded font-mono text-[11px] flex items-center justify-between">
                  <span>
                    <span className="text-amber-400 font-bold mr-2">
                      {viewingLog.httpMethod}
                    </span>
                    {viewingLog.apiUrl}
                  </span>
                  <span className="text-gray-400">{viewingLog.durationMs}ms</span>
                </div>
              </div>
            )}

            {/* Error Message if intercepted/failed */}
            {viewingLog.errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                <div className="font-bold mb-0.5">拦截原因 [{viewingLog.errorCode}]：</div>
                <div>{viewingLog.errorMessage}</div>
              </div>
            )}

            {/* Data Diff (Before vs After) */}
            {(viewingLog.beforeChange || viewingLog.afterChange) && (
              <div>
                <span className="font-bold text-gray-700 block mb-1">
                  变更前 vs 变更后 快照对比 (Diff)：
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-red-50/60 border border-red-200 rounded p-2.5">
                    <span className="text-red-700 font-semibold block mb-1">
                      - 变更前 (Before)
                    </span>
                    <pre className="font-mono text-[11px] text-gray-700 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(viewingLog.beforeChange, null, 2)}
                    </pre>
                  </div>
                  <div className="bg-green-50/60 border border-green-200 rounded p-2.5">
                    <span className="text-green-700 font-semibold block mb-1">
                      + 变更后 (After)
                    </span>
                    <pre className="font-mono text-[11px] text-gray-700 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(viewingLog.afterChange, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Request Payload */}
            {viewingLog.requestPayload && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-700">请求 Payload 报文：</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        JSON.stringify(viewingLog.requestPayload, null, 2)
                      );
                      notify('已复制 JSON 报文到剪贴板！');
                    }}
                    className="text-[#1890ff] hover:underline text-[11px] flex items-center gap-0.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[13px]">content_copy</span>
                    复制 JSON
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-[11px] overflow-x-auto max-h-[160px]">
                  {JSON.stringify(viewingLog.requestPayload, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                onClick={() => setViewingLog(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
