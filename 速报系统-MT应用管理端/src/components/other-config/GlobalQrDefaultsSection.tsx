import React, { useState } from 'react';
import { QrCodeUsageConfig } from '../../types';

interface GlobalQrDefaultsSectionProps {
  qrDefaults?: QrCodeUsageConfig;
  onSaveDefaults: (config: QrCodeUsageConfig) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const GlobalQrDefaultsSection: React.FC<GlobalQrDefaultsSectionProps> = ({
  qrDefaults,
  onSaveDefaults,
  showToast,
}) => {
  const [defaultTotalLimit, setDefaultTotalLimit] = useState(
    qrDefaults?.totalLimit ?? 50
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(defaultTotalLimit);
    if (!Number.isFinite(value) || value <= 0) {
      showToast('请输入有效的二维码默认总额度（大于 0）', 'warning');
      return;
    }

    onSaveDefaults({
      totalLimit: value,
      usedCount: qrDefaults?.usedCount ?? 18,
      historyRecords: qrDefaults?.historyRecords ?? [],
      warningThreshold: qrDefaults?.warningThreshold ?? 10,
      allowSelfApply: qrDefaults?.allowSelfApply ?? true,
    });
    setSavedSuccess(true);
    showToast(`已保存平台通用配置：所有机构默认二维码总额度为 ${value} 个`, 'success');
    window.setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 animate-fade-in text-gray-800">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-xs">
        <div className="flex items-center gap-3.5 pb-5 border-b border-gray-100">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-[#1890ff] shadow-2xs">
            <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-gray-900">全平台激活码配置通用项</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1890ff] border border-blue-200 font-semibold">
                平台通用配置
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              此处配置所有机构通用的激活码参数，保存后各机构详情页的激活码配置初始化界面将统一调用该默认值
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            平台二维码通用配置已成功保存，新建/未初始化机构将按新默认额度创建！
          </div>
        )}

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200/70">
            <div className="text-xs text-blue-800 font-medium flex items-center justify-between">
              <span>机构默认二维码总额度（上限）</span>
              <span className="material-symbols-outlined text-[18px] text-[#1890ff]">confirmation_number</span>
            </div>
            <div className="text-2xl font-black font-mono text-[#1890ff] mt-1.5">
              {defaultTotalLimit} <span className="text-xs font-normal text-blue-600">个 / 机构</span>
            </div>
            <div className="text-[11px] text-blue-600 mt-1">
              机构详情页初始化名额库时的最高扫码激活上限
            </div>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/70">
            <div className="text-xs text-emerald-800 font-medium flex items-center justify-between">
              <span>生效范围</span>
              <span className="material-symbols-outlined text-[18px] text-emerald-600">domain</span>
            </div>
            <div className="text-xl font-black text-emerald-700 mt-1.5">全部机构</div>
            <div className="text-[11px] text-emerald-600 mt-1">
              新建机构及尚未单独调整额度的机构生效
            </div>
          </div>

          <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200/70">
            <div className="text-xs text-purple-800 font-medium flex items-center justify-between">
              <span>初始化调用</span>
              <span className="material-symbols-outlined text-[18px] text-purple-600">auto_awesome</span>
            </div>
            <div className="text-xl font-black text-purple-700 mt-1.5">自动生效</div>
            <div className="text-[11px] text-purple-700 mt-1">
              机构二维码配置页首次进入时按此默认额度创建名额库
            </div>
          </div>
        </div>
      </div>

      {/* Config Form Card */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
          <span className="material-symbols-outlined text-[#1890ff] text-[20px]">tune</span>
          <div>
            <h4 className="text-sm font-bold text-gray-900">机构默认额度通用参数</h4>
            <p className="text-[11px] text-gray-400 mt-0.5">
              设置所有机构二维码名额库的统一初始化上限，保存后立即作为平台母版参数生效
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5 max-w-2xl">
          <div className="grid grid-cols-3 gap-4 items-start">
            <label className="text-xs font-semibold text-gray-700 pt-2">
              所有机构默认二维码总额度 / 上限（个）
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            <div className="col-span-2">
              <input
                type="number"
                min={1}
                max={10000}
                required
                value={defaultTotalLimit}
                onChange={(e) => setDefaultTotalLimit(Number(e.target.value))}
                className="w-full max-w-xs border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-[#1890ff] bg-white"
              />
              <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                该值为每个机构二维码名额库的初始上限。机构详情页「业务规则配置 → 二维码配置」首次进入时，
                将按此默认额度自动初始化名额库；机构侧已绑定占用与增发台账由机构自身的二维码配置页单独维护。
              </p>
              <div className="flex items-center gap-2 mt-2.5">
                {[50, 100, 200, 500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDefaultTotalLimit(preset)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      defaultTotalLimit === preset
                        ? 'bg-[#1890ff] text-white border-[#1890ff]'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#1890ff] hover:text-[#1890ff]'
                    }`}
                  >
                    {preset} 个
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              className="bg-[#1890ff] text-white px-6 py-2 rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[17px]">save</span>
              保存平台通用配置
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
