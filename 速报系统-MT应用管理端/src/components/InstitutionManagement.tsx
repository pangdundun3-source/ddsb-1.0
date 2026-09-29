import React from 'react';
import { Institution } from '../types';
import {
  FORMAL_DURATION_PRESETS,
  TRIAL_DURATION_PRESETS,
  useInstitutionListViewModel,
} from '../viewmodels/useInstitutionListViewModel';

interface InstitutionManagementProps {
  institutions: Institution[];
  onAddClick: () => void;
  onEditClick: (institution: Institution) => void;
  onDetailClick: (institution: Institution) => void;
  onDeleteClick: (institution: Institution) => void;
  onToggleStatus: (id: number) => void;
  onProvisionInstitution?: (
    id: number,
    provisionData: {
      status: '正式' | '试用';
      startDate: string;
      endDate: string;
      daysRemaining: number;
    }
  ) => void;
}

export const InstitutionManagement: React.FC<InstitutionManagementProps> = ({
  institutions,
  onAddClick,
  onEditClick,
  onDetailClick,
  onDeleteClick,
  onToggleStatus,
  onProvisionInstitution,
}) => {
  const { state, actions, derived } = useInstitutionListViewModel({
    institutions,
    onProvisionInstitution,
  });
  const {
    filterName,
    filterLocation,
    filterCategory,
    activeTab,
    filterUnit,
    provisioningTarget,
    provisionForm,
    currentPage,
    pageSize,
    jumpPageInput,
    tabs,
    totalCount,
    totalPages,
    pageData,
  } = state;
  const {
    setFilterName,
    setFilterLocation,
    setFilterCategory,
    setActiveTab,
    setFilterUnit,
    setProvisionForm,
    setProvisioningTarget,
    setCurrentPage,
    setPageSize,
    setJumpPageInput,
    handleOpenProvisionModal,
    handleModalSwitchStatus,
    handleModalQuickDuration,
    handleConfirmProvision,
    handleReset,
    handlePageChange,
    handleJumpPage,
    prepareBasicDetail,
  } = actions;
  const { calculateDays, calculateRemainingDays } = derived;

  return (
    <div className="p-6 flex-1 flex flex-col gap-4 min-w-[1024px]">
      {/* Top Filter Card */}
      <div className="bg-white rounded border border-gray-100 p-4 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)]">
        {/* Card Header Title + Button */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center text-[#666666]">
            <span className="material-symbols-outlined text-[20px] mr-2 text-[#1890ff]">
              corporate_fare
            </span>
            <span className="text-[16px] font-medium text-[#333333]">
              机构管理
            </span>
          </div>
          <button
            onClick={onAddClick}
            className="bg-[#1890ff] text-white font-medium px-4 py-2 rounded flex items-center hover:bg-blue-600 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] mr-1">
              add
            </span>
            新增机构
          </button>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center flex-1 min-w-[200px]">
            <span className="text-[#333333] font-medium w-[70px] shrink-0 text-sm">
              机构名称
            </span>
            <div className="relative flex-1">
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value.slice(0, 100))}
                placeholder="请输入机构名称"
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff] placeholder-gray-400 transition-shadow"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs select-none">
                {filterName.length} / 100
              </span>
            </div>
          </div>

          <div className="flex items-center flex-1 min-w-[180px]">
            <span className="text-[#333333] font-medium w-[70px] shrink-0 text-sm">
              所在地区
            </span>
            <div className="relative flex-1">
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff] text-gray-700 bg-white cursor-pointer"
              >
                <option value="">请选择所在地区</option>
                <option value="河南">河南</option>
                <option value="陕西">陕西</option>
                <option value="甘肃">甘肃</option>
                <option value="江西">江西</option>
                <option value="广东">广东</option>
                <option value="湖北">湖北</option>
                <option value="四川">四川</option>
                <option value="北京">北京</option>
                <option value="上海">上海</option>
                <option value="浙江">浙江</option>
              </select>
            </div>
          </div>

          <div className="flex items-center flex-1 min-w-[180px]">
            <span className="text-[#333333] font-medium w-[70px] shrink-0 text-sm">
              机构类别
            </span>
            <div className="relative flex-1">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff] text-gray-700 bg-white cursor-pointer"
              >
                <option value="">请选择机构类别</option>
                <option value="一类">一类</option>
                <option value="二类">二类</option>
                <option value="三类">三类</option>
              </select>
            </div>
          </div>

          <div className="flex items-center flex-1 min-w-[180px]">
            <span className="text-[#333333] font-medium w-[70px] shrink-0 text-sm">
              统计单元
            </span>
            <div className="relative flex-1">
              <select
                value={filterUnit}
                onChange={(e) => setFilterUnit(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff] text-gray-700 bg-white cursor-pointer"
              >
                <option value="">请选择统计单元名称</option>
                <option value="商丘分单元">商丘分单元</option>
                <option value="城建大楼单元">城建大楼单元</option>
                <option value="峡江网信单元">峡江网信单元</option>
                <option value="佛山网信中心">佛山网信中心</option>
                <option value="随州宣传单元">随州宣传单元</option>
                <option value="洛阳网信办">洛阳网信办</option>
                <option value="四川公安网安组">四川公安网安组</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCurrentPage(1)}
              className="bg-[#1890ff] text-white font-medium px-4 py-1.5 rounded flex items-center hover:bg-blue-600 transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] mr-1">
                search
              </span>
              查询
            </button>
            <button
              onClick={handleReset}
              className="bg-white border border-gray-300 text-[#333333] font-medium px-4 py-1.5 rounded flex items-center hover:border-[#1890ff] hover:text-[#1890ff] transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] mr-1">
                refresh
              </span>
              重置
            </button>
          </div>
        </div>
      </div>

      {/* Data Table Container with Top Status Tabs */}
      <div className="bg-white rounded border border-gray-100 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] overflow-hidden flex-1 flex flex-col justify-between">
        {/* Ant Design Style Top Segmented Status Tabs - Flush left and top */}
        <div className="border-b border-[#f0f0f0] bg-[#fafafa] flex items-center justify-start">
          <div className="flex items-center -mb-px">
            {tabs.map((tab, idx) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`group relative h-11 px-5 text-sm font-medium transition-all cursor-pointer flex items-center gap-2 border-b-2 select-none ${
                    idx === 0 ? 'border-l-0' : ''
                  } ${
                    isActive
                      ? 'text-[#1890ff] border-b-[#1890ff] bg-white shadow-xs font-semibold'
                      : 'text-[#595959] border-b-transparent hover:text-[#1890ff] hover:bg-white/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                      isActive
                        ? 'bg-[#e6f7ff] text-[#1890ff] font-semibold'
                        : 'bg-gray-200/80 text-gray-600 group-hover:bg-[#e6f7ff] group-hover:text-[#1890ff]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#edf4fc] text-[#4a5568] border-b border-[#e2e8f0] text-sm">
                <th className="py-3 px-4 font-medium w-[60px] text-center">
                  序号
                </th>
                <th className="py-3 px-4 font-medium w-[280px]">机构信息</th>
                <th className="py-3 px-4 font-medium w-[120px]">机构类别</th>
                <th className="py-3 px-4 font-medium w-[140px]">销售</th>
                <th className="py-3 px-4 font-medium w-[100px]">机构状态</th>
                <th className="py-3 px-4 font-medium w-[150px]">服务周期</th>
                <th className="py-3 px-4 font-medium w-[140px]">创建时间</th>
                <th className="py-3 px-4 font-medium w-[150px]">操作</th>
              </tr>
            </thead>
            <tbody className="text-[#333333] text-sm">
              {pageData.map((row, index) => {
                const globalIndex = (currentPage - 1) * pageSize + index + 1;
                return (
                  <tr
                    key={row.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 text-center text-gray-500 font-medium">
                      {globalIndex}
                    </td>

                    {/* 机构信息 */}
                    <td className="py-3.5 px-4 pr-6">
                      <div className="flex items-center">
                        <div className="w-[38px] shrink-0 flex justify-end mr-2.5">
                          {row.daysRemaining <= 0 ? (
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
                          onClick={() => onDetailClick(row)}
                          className="font-bold text-[14px] text-[#262626] hover:text-[#1890ff] cursor-pointer text-left truncate flex-1 block transition-colors"
                          title={row.name}
                        >
                          {row.name}
                        </button>
                      </div>
                      <div className="text-[#8c8c8c] text-[12px] mt-1 pl-[48px] truncate leading-tight">
                        {row.location}
                      </div>
                    </td>

                    {/* 机构类别 */}
                    <td className="py-3.5 px-4 text-[#666666]">
                      <div className="font-medium text-gray-700">
                        {row.category}
                      </div>
                      <div className="text-[#999999] text-xs mt-1">
                        {row.industry}
                      </div>
                    </td>

                    {/* 销售 */}
                    <td className="py-3.5 px-4 text-[#666666]">
                      <div className="font-medium text-gray-700">
                        {row.salesName}
                      </div>
                      <div className="text-[#999999] text-xs mt-1">
                        {row.salesPhone}
                      </div>
                    </td>

                    {/* 机构状态 (Toggle switch) */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        disabled={row.enabled}
                        onClick={() => {
                          if (!row.enabled) {
                            if (row.daysRemaining <= 0) {
                              // 已到期的机构开启时给出开通服务弹窗，操作确认后方可开启成功
                              handleOpenProvisionModal(row);
                            } else {
                              onToggleStatus(row.id);
                            }
                          }
                        }}
                        className={`relative inline-flex h-[22px] w-[46px] items-center rounded-full transition-colors focus:outline-none select-none px-[3px] ${
                          row.enabled
                            ? 'bg-[#1890ff] cursor-not-allowed opacity-90'
                            : 'bg-[#bfbfbf] cursor-pointer hover:bg-[#a6a6a6]'
                        }`}
                        title={
                          row.enabled
                            ? '机构启用状态下不支持停用操作'
                            : row.daysRemaining <= 0
                            ? '该机构服务已到期，点击开通服务后方可开启成功'
                            : '点击手动开启机构'
                        }
                      >
                        {/* 内嵌文字：启 / 停 */}
                        <span
                          className={`text-[12px] font-normal text-white leading-none transition-all duration-200 ${
                            row.enabled ? 'pl-1.5 mr-auto' : 'pr-1.5 ml-auto'
                          }`}
                        >
                          {row.enabled ? '启' : '停'}
                        </span>

                        {/* 圆形滑块 */}
                        <span
                          className={`absolute top-[2.5px] h-[17px] w-[17px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all duration-200 ${
                            row.enabled ? 'right-[2.5px]' : 'left-[2.5px]'
                          }`}
                        />
                      </button>
                    </td>

                    {/* 服务周期 */}
                    <td className="py-3.5 px-4 text-[#666666] text-xs">
                      {row.daysRemaining <= 0 ? (
                        <span className="text-[#8c8c8c] text-base font-normal">-</span>
                      ) : (
                        <>
                          <div className="font-medium">始: {row.startDate}</div>
                          <div className="mt-1 font-medium">止: {row.endDate}</div>
                        </>
                      )}
                    </td>

                    {/* 创建时间 */}
                    <td className="py-3.5 px-4 text-[#595959] text-xs whitespace-nowrap">
                      <div className="font-medium text-[#262626]">{row.createdAt || row.startDate}</div>
                      <div className="text-gray-400 text-[11px] mt-0.5">09:30:00</div>
                    </td>

                    {/* 操作 */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3 font-medium text-sm">
                        <button
                          id={`btn-table-detail-${row.id}`}
                          type="button"
                          onClick={() => {
                            prepareBasicDetail();
                            onDetailClick(row);
                          }}
                          className="text-[#1890ff] hover:text-blue-700 hover:underline transition-colors cursor-pointer"
                        >
                          详情
                        </button>
                        <button
                          id={`btn-table-delete-${row.id}`}
                          type="button"
                          disabled={row.enabled}
                          onClick={() => {
                            if (!row.enabled) {
                              onDeleteClick(row);
                            }
                          }}
                          className={
                            row.enabled
                              ? 'text-[#bfbfbf] cursor-not-allowed select-none'
                              : 'text-red-500 hover:text-red-600 hover:underline transition-colors cursor-pointer'
                          }
                          title={
                            row.enabled
                              ? '机构启用状态下不支持删除操作'
                              : '删除机构'
                          }
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {pageData.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-gray-400 text-sm"
                  >
                    暂无相关机构数据，请调整筛选条件或点击“新增机构”
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-gray-100 flex justify-end items-center gap-2.5 text-[#666666] text-sm select-none bg-white">
          <span className="mr-1">共 {totalCount} 条</span>

          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setPageSize(newSize);
              setCurrentPage(1);
              setJumpPageInput('1');
            }}
            className="border border-gray-300 rounded px-2 h-8 text-sm focus:outline-none focus:border-[#1890ff] cursor-pointer bg-white mr-1"
          >
            <option value={10}>10 条/页</option>
            <option value={20}>20 条/页</option>
            <option value={30}>30 条/页</option>
            <option value={50}>50 条/页</option>
          </select>

          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:border-[#1890ff] hover:text-[#1890ff] disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-[#666666] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              chevron_left
            </span>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-8 h-8 flex items-center justify-center border rounded font-medium cursor-pointer transition-colors ${
                page === currentPage
                  ? 'border-[#1890ff] text-[#1890ff] bg-blue-50'
                  : 'border-gray-300 hover:border-[#1890ff] hover:text-[#1890ff]'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:border-[#1890ff] hover:text-[#1890ff] disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-[#666666] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              chevron_right
            </span>
          </button>

          <div className="flex items-center ml-2 gap-2">
            <span>跳至</span>
            <input
              type="text"
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJumpPage()}
              className="w-12 h-8 border border-gray-300 rounded text-center focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff] text-sm"
            />
            <span>页</span>
          </div>
        </div>
      </div>

      {/* Provisioning Modal (Triggered when enabling an expired institution) */}
      {provisioningTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 animate-scale-in flex flex-col">
            {/* Header */}
            <div className="bg-[#f8fafd] px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1890ff]">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1890ff] border border-blue-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">
                    bolt
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">开通服务</h3>
                    <span className="text-xs text-gray-500 font-normal truncate max-w-[200px]" title={provisioningTarget.name}>
                      ({provisioningTarget.name})
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-600 flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[13px]">info</span>
                    该机构已到期处于停用状态，需重新配置开通服务后方可开启成功
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProvisioningTarget(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4 text-xs text-gray-700">
              {/* Service Type Selection */}
              <div className="space-y-1.5">
                <div className="text-gray-700 font-medium flex items-center">
                  <span>服务模式</span>
                  <span className="text-red-500 font-bold ml-0.5">*</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => handleModalSwitchStatus('试用')}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      provisionForm.status === '试用'
                        ? 'border-[#d97724] bg-[#fffaf0] text-[#d97724] ring-2 ring-[#d97724]/20 shadow-xs'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">
                        hourglass_top
                      </span>
                      <div className="font-bold text-sm">试用</div>
                    </div>
                    <input
                      type="radio"
                      name="list_prov_status"
                      checked={provisionForm.status === '试用'}
                      onChange={() => {}}
                      className="accent-[#d97724]"
                    />
                  </label>

                  <label
                    onClick={() => handleModalSwitchStatus('正式')}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      provisionForm.status === '正式'
                        ? 'border-[#1890ff] bg-blue-50 text-[#1890ff] ring-2 ring-[#1890ff]/20 shadow-xs'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">
                        verified
                      </span>
                      <div className="font-bold text-sm">正式</div>
                    </div>
                    <input
                      type="radio"
                      name="list_prov_status"
                      checked={provisionForm.status === '正式'}
                      onChange={() => {}}
                      className="accent-[#1890ff]"
                    />
                  </label>
                </div>
              </div>

              {/* Service Time Range */}
              <div className="grid grid-cols-2 gap-3">
                {/* Start Date */}
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                  <div className="text-gray-700 text-xs font-medium mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>服务生效日期</span>
                      <span className="text-red-500 font-bold">*</span>
                    </span>
                    <span className="material-symbols-outlined text-[15px] text-gray-400">
                      calendar_today
                    </span>
                  </div>
                  <input
                    type="date"
                    value={provisionForm.startDate}
                    onChange={(e) => setProvisionForm({ ...provisionForm, startDate: e.target.value })}
                    className="w-full border border-gray-200 hover:border-[#1890ff] focus:border-[#1890ff] rounded px-2.5 py-1.5 text-xs font-mono text-gray-800 focus:outline-none transition-colors"
                  />
                </div>

                {/* End Date */}
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                  <div className="text-gray-700 text-xs font-medium mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>服务到期日期</span>
                      <span className="text-red-500 font-bold">*</span>
                    </span>
                    <span className="material-symbols-outlined text-[15px] text-gray-400">
                      event_busy
                    </span>
                  </div>
                  <input
                    type="date"
                    value={provisionForm.endDate}
                    onChange={(e) => setProvisionForm({ ...provisionForm, endDate: e.target.value })}
                    className="w-full border border-gray-200 hover:border-[#1890ff] focus:border-[#1890ff] rounded px-2.5 py-1.5 text-xs font-mono text-gray-800 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5 pt-1">
                <div className="text-xs text-gray-500 font-medium flex items-center">
                  <span className="material-symbols-outlined text-[15px] mr-1 text-[#1890ff]">
                    bolt
                  </span>
                  快捷设置时长
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(provisionForm.status === '试用' ? TRIAL_DURATION_PRESETS : FORMAL_DURATION_PRESETS).map((preset) => {
                    const modalDays = calculateDays(provisionForm.startDate, provisionForm.endDate);
                    const isSelected = modalDays === preset.days;
                    return (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => handleModalQuickDuration(preset.days, provisionForm.status)}
                        className={`text-xs px-3 py-1 rounded border transition-all cursor-pointer font-medium flex items-center gap-1 ${
                          isSelected
                            ? provisionForm.status === '试用'
                              ? 'border-[#d97724] bg-[#fffaf0] text-[#d97724] ring-1 ring-[#d97724]/20 shadow-2xs font-semibold'
                              : 'border-[#1890ff] bg-blue-50 text-[#1890ff] ring-1 ring-[#1890ff]/20 shadow-2xs font-semibold'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
                        }`}
                      >
                        {isSelected && (
                          <span className="material-symbols-outlined text-[13px]">check</span>
                        )}
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Service Duration Calculation Display */}
              <div className="bg-[#f8faff] border border-[#d6e4ff] rounded-lg p-3.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#1890ff] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">
                      timer
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 font-medium">服务有效时长</span>
                      <span className="text-[10px] text-gray-400 bg-white px-1.5 py-0.2 rounded border border-gray-200">
                        自动核算
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5 text-gray-800">
                      <span className="text-xs font-medium text-gray-600">剩</span>
                      <span className={`text-xl font-bold font-mono ${calculateRemainingDays(provisionForm.endDate) <= 0 ? 'text-red-500' : calculateRemainingDays(provisionForm.endDate) <= 7 ? 'text-orange-500' : 'text-[#1890ff]'}`}>
                        {calculateRemainingDays(provisionForm.endDate)}
                      </span>
                      <span className="text-xs font-medium text-gray-600">天</span>
                      <span className="text-gray-300 mx-1">/</span>
                      <span className="text-xs font-medium text-gray-500">共</span>
                      <span className="text-sm font-bold font-mono text-gray-700">
                        {calculateDays(provisionForm.startDate, provisionForm.endDate)}
                      </span>
                      <span className="text-xs font-medium text-gray-500">天</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs px-2.5 py-1 rounded font-medium border inline-flex items-center gap-1 ${
                      calculateRemainingDays(provisionForm.endDate) <= 0
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : calculateRemainingDays(provisionForm.endDate) <= 7
                        ? 'bg-orange-50 text-orange-600 border-orange-200'
                        : 'bg-green-50 text-green-600 border-green-200'
                    }`}
                  >
                    {calculateRemainingDays(provisionForm.endDate) <= 0
                      ? '已到期'
                      : calculateRemainingDays(provisionForm.endDate) <= 7
                      ? '即将到期'
                      : '期限充足'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setProvisioningTarget(null)}
                className="px-4 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmProvision}
                className="px-5 py-1.5 rounded text-sm font-medium bg-[#1890ff] text-white hover:bg-blue-600 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span>确认生效并开启</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
