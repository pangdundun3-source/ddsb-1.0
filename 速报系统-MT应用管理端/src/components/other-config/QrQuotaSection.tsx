import React from 'react';
import {
  Institution,
  QrQuotaAddRecord,
  QrCodeUsageConfig,
} from '../../types';
import { useQrQuotaViewModel } from '../../viewmodels/useQrQuotaViewModel';

export const defaultQuotaHistory: QrQuotaAddRecord[] = [
  {
    id: 'REC-20260827-01',
    addAmount: 20,
    previousLimit: 30,
    newLimit: 50,
    reason: '下辖通讯员队伍扩容入驻',
    operator: '系统管理员 (李主任)',
    createdAt: '2026-08-25 14:30:22',
  },
  {
    id: 'REC-20260810-02',
    addAmount: 10,
    previousLimit: 20,
    newLimit: 30,
    reason: '新增应急速报网格员',
    operator: '机构管理员 (周建军)',
    createdAt: '2026-08-10 09:15:40',
  },
  {
    id: 'REC-20260701-03',
    addAmount: 20,
    previousLimit: 0,
    newLimit: 20,
    reason: '机构初始开通基础名额',
    operator: '平台开通专员 (张工)',
    createdAt: '2026-07-01 10:00:00',
  },
];

export interface BoundPersonnel {
  id: string;
  name: string;
  department: string;
  role: string;
  phone: string;
  bindTime: string;
  status: 'active' | 'suspended';
}

export const mockBoundPersonnelList: BoundPersonnel[] = [
  { id: 'U001', name: '王俊杰', department: '网信综合科', role: '首席采编员', phone: '138****5621', bindTime: '2026-08-26 16:42:10', status: 'active' },
  { id: 'U002', name: '刘晓丽', department: '曾都区融媒体中心', role: '应急速报员', phone: '139****8832', bindTime: '2026-08-26 14:15:05', status: 'active' },
  { id: 'U003', name: '张建国', department: '广水市网信办', role: '网格通讯员', phone: '137****9012', bindTime: '2026-08-25 11:30:40', status: 'active' },
  { id: 'U004', name: '陈思齐', department: '随县宣传报道组', role: '网格速报员', phone: '135****4423', bindTime: '2026-08-24 09:20:18', status: 'active' },
  { id: 'U005', name: '黄海波', department: '高新区网信网格', role: '采编干事', phone: '186****7719', bindTime: '2026-08-23 17:05:52', status: 'active' },
  { id: 'U006', name: '李梦瑶', department: '舆情监测指挥中心', role: '值班分析员', phone: '150****2234', bindTime: '2026-08-22 10:48:33', status: 'active' },
  { id: 'U007', name: '赵宏图', department: '大洪山管委会采编室', role: '通讯特派员', phone: '188****6651', bindTime: '2026-08-21 15:33:12', status: 'active' },
  { id: 'U008', name: '周婷婷', department: '融媒体政务分发部', role: '编辑记者', phone: '136****9910', bindTime: '2026-08-20 08:45:20', status: 'active' },
];

interface QrQuotaSectionProps {
  institution?: Institution | null;
  qrConfig?: QrCodeUsageConfig;
  onChangeQrConfig: (config: QrCodeUsageConfig) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const QrQuotaSection: React.FC<QrQuotaSectionProps> = ({
  institution,
  qrConfig,
  onChangeQrConfig,
  showToast,
}) => {
  const { state, actions } = useQrQuotaViewModel({
    institution,
    qrConfig,
    defaultHistory: defaultQuotaHistory,
    defaultPersonnel: mockBoundPersonnelList,
    onChangeQrConfig,
    showToast,
  });

  const {
    initialQuota,
    totalLimit,
    usedCount,
    history,
    activeSubTab,
    personnelSearch,
    boundPersonnel,
    showAddModal,
    addAmount,
    addReason,
    operatorName,
    remainingCount,
    usagePercentage,
    filteredPersonnel,
  } = state;

  const {
    setActiveSubTab,
    setPersonnelSearch,
    setShowAddModal,
    setAddAmount,
    setAddReason,
    setOperatorName,
    handleUnbindPersonnel,
    handleConfirmAddQuota,
  } = actions;

  return (
    <div className="space-y-5 animate-fade-in text-gray-800">
      {/* 顶部核心信息与概览统计：功能 1 (初始化名额) + 功能 2 (使用情况) + 功能 3 (快捷追加) */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1890ff] text-[22px]">key</span>
              <span>激活码的名额与管理</span>
            </h3>
          </div>

          {/* 功能 3：新增激活码 入口 */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-[#1890ff] text-white hover:bg-blue-600 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>新增激活码</span>
          </button>
        </div>

        {/* 核心指标卡片：清晰一目了然 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-4">
          {/* 功能 1：显示给机构配置的初始化二维码名额 */}
          <div className="bg-gray-50/90 rounded-lg p-3.5 border border-gray-200/80">
            <div className="text-xs text-gray-500 font-medium flex items-center justify-between">
              <span>初始化基础名额</span>
              <span className="material-symbols-outlined text-[16px] text-gray-400">flag</span>
            </div>
            <div className="text-xl font-bold font-mono text-gray-800 mt-1">
              {initialQuota} <span className="text-xs font-normal text-gray-500">个</span>
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              开通时初始分配配额
            </div>
          </div>

          {/* 功能 2：当前总名额 (含追加) */}
          <div className="bg-blue-50/60 rounded-lg p-3.5 border border-blue-100">
            <div className="text-xs text-blue-800 font-medium flex items-center justify-between">
              <span>当前总名额</span>
              <span className="material-symbols-outlined text-[16px] text-[#1890ff]">confirmation_number</span>
            </div>
            <div className="text-xl font-bold font-mono text-[#1890ff] mt-1">
              {totalLimit} <span className="text-xs font-normal text-blue-600">个</span>
            </div>
            <div className="text-[11px] text-blue-600 mt-1">
              含初始化与累计追加名额
            </div>
          </div>

          {/* 功能 2：已绑定占用 */}
          <div className="bg-amber-50/60 rounded-lg p-3.5 border border-amber-100">
            <div className="text-xs text-amber-800 font-medium flex items-center justify-between">
              <span>已绑定使用</span>
              <span className="material-symbols-outlined text-[16px] text-amber-600">how_to_reg</span>
            </div>
            <div className="text-xl font-bold font-mono text-amber-700 mt-1">
              {usedCount} <span className="text-xs font-normal text-amber-600">人 ({usagePercentage}%)</span>
            </div>
            <div className="text-[11px] text-amber-600 mt-1">
              已扫码绑定的在册采编人员
            </div>
          </div>

          {/* 功能 2：剩余可用名额 */}
          <div className="bg-emerald-50/60 rounded-lg p-3.5 border border-emerald-100">
            <div className="text-xs text-emerald-800 font-medium flex items-center justify-between">
              <span>剩余可用名额</span>
              <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
              {remainingCount} <span className="text-xs font-normal text-emerald-600">个</span>
            </div>
            <div className="text-[11px] text-emerald-600 mt-1">
              可继续提供给人员扫码绑定
            </div>
          </div>
        </div>
      </div>

      {/* 下方切换卡片：功能 5 (查看绑定的人员名单) 与 功能 4 (查看调整和增发记录) */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          {/* 一级功能切换：已绑定名单 vs 调整增发记录 */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setActiveSubTab('personnel')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'personnel'
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">groups</span>
              <span>已绑定人员名单</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-50 text-[#1890ff] font-mono font-semibold">
                {boundPersonnel.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('records')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'records'
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">history</span>
              <span>名额调整与增发记录</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-200 text-gray-700 font-mono font-semibold">
                {history.length}
              </span>
            </button>
          </div>

          {/* 搜索框：仅在人员名单时出现，简单实用 */}
          {activeSubTab === 'personnel' && (
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-gray-400 text-[16px]">
                search
              </span>
              <input
                type="text"
                value={personnelSearch}
                onChange={(e) => setPersonnelSearch(e.target.value)}
                placeholder="搜索姓名、部门、角色或手机号..."
                className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#1890ff] w-60"
              />
            </div>
          )}
        </div>

        {/* 功能 5：查看绑定的人员名单表格 */}
        {activeSubTab === 'personnel' && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold select-none">
                <tr>
                  <th className="py-2.5 px-3.5">姓名</th>
                  <th className="py-2.5 px-3.5">部门 / 科室</th>
                  <th className="py-2.5 px-3.5">角色身份</th>
                  <th className="py-2.5 px-3.5">手机号码</th>
                  <th className="py-2.5 px-3.5">绑定时间</th>
                  <th className="py-2.5 px-3.5 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredPersonnel.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      暂无符合条件的已绑定人员
                    </td>
                  </tr>
                ) : (
                  filteredPersonnel.map((person) => (
                    <tr key={person.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-2.5 px-3.5 font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-[#1890ff] flex items-center justify-center text-[11px] font-bold">
                          {person.name.slice(0, 1)}
                        </div>
                        <span>{person.name}</span>
                      </td>
                      <td className="py-2.5 px-3.5 text-gray-700">{person.department}</td>
                      <td className="py-2.5 px-3.5">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-[#1890ff] font-medium text-[11px] border border-blue-100">
                          {person.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-gray-600">{person.phone}</td>
                      <td className="py-2.5 px-3.5 font-mono text-gray-400 text-[11px]">{person.bindTime}</td>
                      <td className="py-2.5 px-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleUnbindPersonnel(person.id, person.name)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                        >
                          解绑 (释放名额)
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 功能 4：查看二维码的调整和增发记录表格 */}
        {activeSubTab === 'records' && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold select-none">
                <tr>
                  <th className="py-2.5 px-3.5">单号</th>
                  <th className="py-2.5 px-3.5">追加名额</th>
                  <th className="py-2.5 px-3.5">调整前 → 调整后</th>
                  <th className="py-2.5 px-3.5">事由说明</th>
                  <th className="py-2.5 px-3.5">经办人</th>
                  <th className="py-2.5 px-3.5 text-right">经办时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      暂无名额调整记录
                    </td>
                  </tr>
                ) : (
                  history.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono text-gray-500">{record.id}</td>
                      <td className="py-2.5 px-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                          +{record.addAmount}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-xs">
                        <span className="text-gray-500">{record.previousLimit}</span>
                        <span className="text-gray-400 mx-1.5">→</span>
                        <span className="font-bold text-[#1890ff]">{record.newLimit} 个</span>
                      </td>
                      <td className="py-2.5 px-3.5 text-gray-800">{record.reason}</td>
                      <td className="py-2.5 px-3.5 text-gray-700">{record.operator}</td>
                      <td className="py-2.5 px-3.5 text-right text-gray-400 font-mono text-[11px]">
                        {record.createdAt}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 功能 3：新增激活码 弹窗 (轻量简单设计) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-sm overflow-hidden animate-scale-in">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#1890ff] text-[18px]">add_circle</span>
                <span>新增激活码</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmAddQuota();
              }}
              className="p-5 space-y-3.5 text-xs"
            >
              {/* 计算示意 */}
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-500">当前名额</span>
                  <div className="font-bold font-mono text-gray-800 text-sm">{totalLimit} 个</div>
                </div>
                <div className="text-gray-400 font-bold">+</div>
                <div>
                  <span className="text-gray-500">本次新增</span>
                  <div className="font-bold font-mono text-emerald-600 text-sm">+{Number(addAmount) || 0} 个</div>
                </div>
                <div className="text-gray-400 font-bold">=</div>
                <div>
                  <span className="text-gray-500">调整后总数</span>
                  <div className="font-bold font-mono text-[#1890ff] text-sm">
                    {totalLimit + (Number(addAmount) || 0)} 个
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  新增激活码数量 <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={500}
                    required
                    value={addAmount}
                    onChange={(e) => setAddAmount(Number(e.target.value))}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-[#1890ff]"
                  />
                  {/* 常用快捷新增量 */}
                  {[10, 20, 50].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAddAmount(preset)}
                      className={`px-2 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                        addAmount === preset
                          ? 'bg-[#1890ff] text-white border-[#1890ff]'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  经办人姓名
                </label>
                <input
                  type="text"
                  required
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-[#1890ff]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  新增事由说明
                </label>
                <input
                  type="text"
                  required
                  value={addReason}
                  onChange={(e) => setAddReason(e.target.value)}
                  placeholder="例如：新增采编通讯员入驻"
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-[#1890ff]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#1890ff] text-white hover:bg-blue-600 shadow-2xs cursor-pointer"
                >
                  确认新增
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
