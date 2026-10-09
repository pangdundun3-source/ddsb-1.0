import React, { useState } from 'react';
import { Check, CheckCircle2, Database, Globe, Lock, PlusCircle, Users, X } from 'lucide-react';
import { WAREHOUSE_CATEGORIES, WarehouseEditorModal } from './WarehouseEditorModal';
import {
  isWarehouseEnabled,
  upsertWarehouse,
  type WarehouseCategory,
  type WarehouseItem,
  type WarehouseShareScope
} from '../data/warehouses';

const SHARE_ICON: Record<WarehouseShareScope, React.ElementType> = {
  全机构可见: Globe,
  指定人员可见: Users,
  仅本人可见: Lock
};

interface AddToWarehouseModalProps {
  titles: string[];
  warehouses: WarehouseItem[];
  countOf: (warehouseId: string) => number;
  /** 所选数据是否都已在该仓库中；一条数据可以同时属于多个仓库。 */
  isJoined?: (warehouseId: string) => boolean;
  onWarehousesChange: (next: WarehouseItem[]) => void;
  onClose: () => void;
  onConfirm: (warehouses: WarehouseItem[]) => void;
}

export const AddToWarehouseModal: React.FC<AddToWarehouseModalProps> = ({
  titles,
  warehouses,
  countOf,
  isJoined = (_warehouseId: string) => false,
  onWarehousesChange,
  onClose,
  onConfirm
}) => {
  const enabled = warehouses.filter(isWarehouseEnabled);
  const [category, setCategory] = useState<WarehouseCategory>('舆情类');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const list = enabled.filter((item) => item.category === category);
  const selected = enabled.filter((item) => selectedIds.includes(item.id));
  const toggleSelected = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  const objectText = titles.length === 1 ? titles[0] : `共 ${titles.length} 条：${titles.join('、')}`;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border border-gray-200"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">加入数据仓库</h3>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-1.5 text-xs text-gray-500 truncate" title={titles.join('\n')}>
              <span className="font-semibold text-gray-700">已选对象：</span>
              {objectText}
            </p>
          </div>

          <div className="px-5 py-4 space-y-4 text-xs overflow-y-auto flex-1 min-h-[320px]">
            <section>
              <h4 className="font-bold text-gray-800 mb-2 border-l-2 border-[#1E5ABB] pl-2">
                数据仓库主分类<span className="ml-1 font-normal text-gray-400">（点击快速切换）</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {WAREHOUSE_CATEGORIES.map((item) => {
                  const count = enabled.filter((entry) => entry.category === item).length;
                  const picked = selected.filter((entry) => entry.category === item).length;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className={`px-3 py-1.5 rounded-lg border cursor-pointer ${
                        category === item
                          ? 'border-[#1E5ABB] bg-blue-50 text-[#1E5ABB] font-bold'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {item}
                      <span className="ml-1 text-[11px] opacity-70">{count}</span>
                      {picked > 0 && (
                        <span className="ml-1 px-1 rounded-full bg-[#1E5ABB] text-white text-[10px] font-mono">已选{picked}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h4 className="font-bold text-gray-800 mb-2 border-l-2 border-[#1E5ABB] pl-2">
                数据仓库列表<span className="ml-1 font-normal text-gray-400">（{list.length} 个可用，已停用的仓库不显示）</span>
              </h4>
              {list.length === 0 ? (
                <div className="py-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl">
                  该分类下暂无可用仓库，可在下方新建
                </div>
              ) : (
                <div className="space-y-2">
                  {list.map((item) => {
                    const joined = isJoined(item.id);
                    const active = joined || selectedIds.includes(item.id);
                    const ShareIcon = SHARE_ICON[item.shareScope];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={joined}
                        title={joined ? '所选数据已在该仓库中' : undefined}
                        onClick={() => toggleSelected(item.id)}
                        className={`w-full rounded-xl border px-3.5 py-3 text-left flex items-start gap-3 transition-colors ${
                          joined
                            ? 'border-gray-100 bg-gray-50/80 opacity-60 cursor-not-allowed'
                            : active
                              ? 'border-[#1E5ABB] bg-blue-50/60 cursor-pointer'
                              : 'border-gray-200 hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        <span
                          className={`mt-0.5 w-3.5 h-3.5 shrink-0 rounded border flex items-center justify-center ${
                            active ? 'border-[#1E5ABB] bg-[#1E5ABB]' : 'border-gray-300 bg-white'
                          }`}
                        >
                          {active && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                        </span>
                        <Database className="w-4 h-4 mt-px shrink-0 text-[#1E5ABB]" />
                        <span className="flex-1 min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 truncate">{item.name}</span>
                            {joined && (
                              <span className="shrink-0 px-1.5 py-px rounded bg-emerald-50 text-emerald-700 text-[11px]">已加入</span>
                            )}
                          </span>
                          <span className="block mt-1 text-gray-500 truncate">{item.remark || '暂无仓库说明'}</span>
                        </span>
                        <span className="shrink-0 flex flex-col items-end gap-1 text-[11px] text-gray-500">
                          <span className="inline-flex items-center gap-1 px-1.5 py-px rounded bg-gray-100">
                            <ShareIcon className="w-3 h-3" />
                            {item.shareScope}
                          </span>
                          <span>共 {countOf(item.id)} 条数据</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <button
              type="button"
              onClick={() => setCreating(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-[#1E5ABB]/50 bg-blue-50/40 text-[#1E5ABB] font-semibold flex items-center justify-center gap-1.5 hover:bg-blue-50 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              新建数据仓库
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 text-xs">
            <span
              className={`truncate ${selected.length > 0 ? 'text-gray-700' : 'text-gray-400'}`}
              title={selected.map((item) => item.name).join('、')}
            >
              {selected.length > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  将加入 {selected.length} 个仓库：{selected.map((item) => `「${item.name}」`).join('、')}
                </span>
              ) : (
                '未选择仓库（可多选需要加入的数据仓库）'
              )}
            </span>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold cursor-pointer">
                取消
              </button>
              <button
                type="button"
                disabled={selected.length === 0}
                onClick={() => selected.length > 0 && onConfirm(selected)}
                className="px-4 py-2 rounded-lg bg-[#1E5ABB] hover:bg-[#184996] text-white font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      </div>

      {creating && (
        <WarehouseEditorModal
          existing={warehouses}
          defaultCategory={category}
          onClose={() => setCreating(false)}
          onSubmit={(values) => {
            const next = upsertWarehouse(warehouses, values);
            onWarehousesChange(next);
            setCategory(values.category);
            setSelectedIds((prev) => [...prev, next[0].id]);
            setCreating(false);
          }}
        />
      )}
    </>
  );
};
