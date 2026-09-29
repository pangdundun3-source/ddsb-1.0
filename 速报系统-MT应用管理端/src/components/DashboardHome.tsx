import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Download, Check } from 'lucide-react';
import { ExpiringInstitution, ActiveTab } from '../types';
import { useDashboardHomeViewModel } from '../viewmodels/useDashboardHomeViewModel';

interface DashboardHomeProps {
  expiringInstitutions: ExpiringInstitution[];
  onSelectInstitution: (inst: ExpiringInstitution) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  expiringInstitutions,
  onSelectInstitution,
  setActiveTab,
}) => {
  const { state, actions } = useDashboardHomeViewModel({
    expiringInstitutions,
    setActiveTab,
  });
  const { currentPage, pageSize, jumpPage, isExporting, total, totalPages, startIndex, currentList } = state;
  const { setPageSize, setJumpPage, handleExport, handlePageChange, handleJumpPage } = actions;

  // Bar Chart Option
  const barChartOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '8%', containLabel: true },
    xAxis: [
      {
        type: 'category',
        data: [
          '北京',
          '天津',
          '河北',
          '山西',
          '内蒙古',
          '辽宁',
          '吉林',
          '黑龙江',
          '上海',
          '江苏',
          '浙江',
          '安徽',
          '福建',
          '江西',
          '山东',
          '河南',
          '湖北',
          '湖南',
          '广东',
          '广西',
        ],
        axisTick: { alignWithLabel: true },
        axisLabel: { color: '#666', interval: 0, rotate: 40, fontSize: 11 },
        axisLine: { lineStyle: { color: '#dcdfe6' } },
      },
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: { color: '#666' },
        splitLine: { lineStyle: { type: 'dashed', color: '#e8e8e8' } },
      },
    ],
    series: [
      {
        name: '机构数量',
        type: 'bar',
        barWidth: '55%',
        itemStyle: { color: '#1890ff', borderRadius: [2, 2, 0, 0] },
        data: [
          120, 200, 150, 80, 70, 110, 130, 90, 220, 180, 190, 160, 140, 100, 210,
          170, 150, 130, 250, 120,
        ],
      },
    ],
  };

  // Pie Chart Option
  const pieChartOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      icon: 'circle',
      textStyle: { color: '#666', fontSize: 13 },
      itemGap: 16,
    },
    series: [
      {
        name: '机构占比',
        type: 'pie',
        radius: ['52%', '72%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false, position: 'center' },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#333',
            formatter: '{b}\n{d}%',
          },
        },
        labelLine: { show: false },
        data: [
          { value: 12, name: '正式机构', itemStyle: { color: '#1890ff' } },
          { value: 18, name: '试用机构', itemStyle: { color: '#4ecbca' } },
        ],
      },
    ],
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-w-[1024px]">
      {/* Top Section: Stat Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div
          onClick={() => setActiveTab('institutions')}
          className="bg-white rounded border border-gray-100 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] p-6 flex items-center justify-between cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div>
            <div className="text-[#666666] mb-2 text-sm">机构总数</div>
            <div className="text-[28px] font-bold text-[#333333] leading-none">
              31
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#1890ff]">
            <span className="material-symbols-outlined text-[24px]">
              corporate_fare
            </span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('institutions')}
          className="bg-white rounded border border-gray-100 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] p-6 flex items-center justify-between cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div>
            <div className="text-[#666666] mb-2 text-sm">正式/试用机构</div>
            <div className="text-[28px] font-bold text-[#333333] leading-none">
              <span className="text-[#1890ff]">12</span>{' '}
              <span className="text-[20px] text-gray-300 mx-1">/</span>{' '}
              <span className="text-[#333333]">18</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-500">
            <span className="material-symbols-outlined text-[24px]">
              assignment_ind
            </span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('institutions')}
          className="bg-white rounded border border-gray-100 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] p-6 flex items-center justify-between cursor-pointer hover:border-orange-300 hover:shadow-md transition-all"
        >
          <div>
            <div className="text-[#666666] mb-2 text-sm">
              30天内即将到期机构
            </div>
            <div className="text-[28px] font-bold text-[#333333] leading-none">
              11
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-[#ff7043]">
            <span className="material-symbols-outlined text-[24px]">
              event_busy
            </span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('institutions')}
          className="bg-white rounded border border-gray-100 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] p-6 flex items-center justify-between cursor-pointer hover:border-gray-300 hover:shadow-md transition-all"
        >
          <div>
            <div className="text-[#666666] mb-2 text-sm">已到期关闭机构</div>
            <div className="text-[28px] font-bold text-[#666666] leading-none">
              3
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-[#8c8c8c]">
            <span className="material-symbols-outlined text-[24px]">
              domain_disabled
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: Charts */}
      <div className="grid grid-cols-2 gap-6 min-h-[380px]">
        {/* Bar Chart Card */}
        <div className="bg-white rounded border border-gray-100 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-1 h-4 bg-[#1890ff] mr-2 rounded-sm"></div>
              <h2 className="text-[16px] font-bold text-[#333333]">
                平台机构统计
              </h2>
            </div>
            <span className="text-xs text-gray-400">更新时间：今日 18:00</span>
          </div>
          <div className="flex-1 w-full h-[300px]">
            <ReactECharts
              option={barChartOption}
              style={{ height: '100%', width: '100%' }}
            />
          </div>
        </div>

        {/* Pie Chart Card */}
        <div className="bg-white rounded border border-gray-100 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-1 h-4 bg-[#1890ff] mr-2 rounded-sm"></div>
              <h2 className="text-[16px] font-bold text-[#333333]">
                平台机构占比
              </h2>
            </div>
            <span className="text-xs text-gray-400">总计：30 家机构</span>
          </div>
          <div className="flex-1 w-full h-[300px]">
            <ReactECharts
              option={pieChartOption}
              style={{ height: '100%', width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Section: Table */}
      <div className="bg-white rounded border border-gray-100 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-1 h-4 bg-[#1890ff] mr-2 rounded-sm"></div>
            <h2 className="text-[16px] font-bold text-[#333333]">
              近1个月到期机构
            </h2>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#1890ff] bg-white border border-[#91d5ff] rounded hover:bg-[#e6f7ff] active:bg-[#bae7ff] transition-all cursor-pointer shadow-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            title="导出当前列表为CSV文件"
          >
            {isExporting ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-green-600">已导出</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-[#1890ff]" />
                <span>导出数据</span>
              </>
            )}
          </button>
        </div>

        <div className="overflow-hidden rounded border border-gray-100">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-[#edf4fc] text-[#4a5568] border-b border-[#e2e8f0] text-sm">
                <th className="py-3.5 px-4 font-medium w-[60px] text-center">序号</th>
                <th className="py-3.5 px-4 font-medium w-[32%]">机构信息</th>
                <th className="py-3.5 px-4 font-medium w-[16%]">机构类别</th>
                <th className="py-3.5 px-4 font-medium w-[16%]">销售</th>
                <th className="py-3.5 px-4 font-medium w-[18%]">服务周期</th>
                <th className="py-3.5 px-4 font-medium w-[18%]">到期倒计时</th>
              </tr>
            </thead>
            <tbody className="text-[#333333]">
              {currentList.map((row, index) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors"
                >
                  <td className="py-3.5 px-4 text-center text-gray-400 text-xs">
                    {startIndex + index + 1}
                  </td>
                  <td className="py-3.5 px-4 pr-6">
                    <div className="flex items-center">
                      <div className="w-[38px] shrink-0 flex justify-end mr-2.5">
                        {row.isExpired || row.countdownText === '已到期' || row.countdownText === '已过期' ? (
                          <span className="inline-block text-[12px] px-1.5 py-[1.5px] rounded-[3px] font-normal leading-none shrink-0 border border-[#d9d9d9] text-[#8c8c8c] bg-[#fafafa] -ml-3">
                            已到期
                          </span>
                        ) : (
                          <span
                            className={`inline-block text-[12px] px-1.5 py-[1.5px] rounded-[3px] font-normal leading-none shrink-0 ${
                              row.status === '正式'
                                ? 'border border-[#91d5ff] text-[#1890ff] bg-[#e6f7ff]'
                                : 'border border-[#ffd591] text-[#fa8c16] bg-[#fffbe6]'
                            }`}
                          >
                            {row.status || '试用'}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => onSelectInstitution(row)}
                        className="font-bold text-[14px] text-[#262626] hover:text-[#1890ff] cursor-pointer text-left truncate flex-1 block transition-colors"
                        title={row.name}
                      >
                        {row.name}
                      </button>
                    </div>
                    <div className="text-[#8c8c8c] text-[12px] mt-1 pl-[48px] truncate leading-tight">
                      {row.region}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-[#262626] text-sm">{row.category}</div>
                    <div className="text-gray-400 text-xs mt-1">{row.industry}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-[#262626] text-sm font-medium">
                      {row.salesName}
                    </div>
                    <div className="text-gray-400 text-xs mt-1 font-mono">
                      {row.salesPhone}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 font-mono text-xs whitespace-nowrap">
                    <div>始:{row.startDate || '2026-08-24'}</div>
                    <div className="mt-1">止:{row.endDate || row.expireTime.slice(0, 10)}</div>
                  </td>
                  <td className="py-3.5 px-4 text-sm whitespace-nowrap">
                    {row.isExpired || row.countdownText === '已到期' || row.countdownText === '已过期' ? (
                      <span className="text-[#8c8c8c] font-medium inline-flex items-center">
                        已到期
                      </span>
                    ) : row.status === '正式' ? (
                      <span className="text-[#1890ff] font-medium inline-flex items-center">
                        {row.countdownText || `${row.daysRemaining}天`}
                      </span>
                    ) : (
                      <span className="text-[#fa8c16] font-medium inline-flex items-center">
                        {row.countdownText || `${row.daysRemaining}天`}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {currentList.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-gray-400 text-sm"
                  >
                    暂无到期机构数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Right Pagination Matching Screenshot */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-[#666666] select-none">
          {/* Total Count */}
          <span className="mr-1">共 {total} 条</span>

          {/* Prev Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="w-7 h-7 border border-gray-200 rounded flex items-center justify-center text-gray-600 hover:border-[#1890ff] hover:text-[#1890ff] disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-600 disabled:cursor-not-allowed cursor-pointer bg-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`w-7 h-7 rounded flex items-center justify-center font-medium cursor-pointer transition-colors text-xs ${
                currentPage === pageNum
                  ? 'border border-[#1890ff] bg-[#e6f7ff] text-[#1890ff]'
                  : 'border border-gray-200 bg-white text-gray-700 hover:border-[#1890ff] hover:text-[#1890ff]'
              }`}
            >
              {pageNum}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="w-7 h-7 border border-gray-200 rounded flex items-center justify-center text-gray-600 hover:border-[#1890ff] hover:text-[#1890ff] disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-600 disabled:cursor-not-allowed cursor-pointer bg-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>

          {/* Page Size Select */}
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setPageSize(newSize);
            }}
            className="border border-gray-200 rounded px-2 h-7 text-xs text-gray-700 bg-white focus:outline-none focus:border-[#1890ff] cursor-pointer"
          >
            <option value={10}>10条/页</option>
            <option value={20}>20条/页</option>
            <option value={50}>50条/页</option>
            <option value={100}>100条/页</option>
          </select>

          {/* Quick Jumper (前往 X 页) */}
          <div className="flex items-center gap-1.5 ml-1 text-gray-600 border border-gray-200 rounded px-2 py-1 bg-white h-7">
            <span>前往</span>
            <input
              type="text"
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleJumpPage();
                }
              }}
              onBlur={handleJumpPage}
              className="w-5 text-center text-xs text-gray-800 focus:outline-none border-b border-transparent focus:border-[#1890ff]"
            />
            <span>页</span>
          </div>
        </div>
      </div>
    </div>
  );
};
