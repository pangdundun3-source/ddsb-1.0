import React, { useState } from 'react';
import { X } from 'lucide-react';
import { WarehouseStaffChip, WarehouseStaffPicker } from './WarehouseStaffPicker';
import { resolveWarehouseStaff } from '../data/warehouseStaff';
import type { WarehouseCategory, WarehouseFormValues, WarehouseItem, WarehouseShareScope } from '../data/warehouses';

export const WAREHOUSE_CATEGORIES: WarehouseCategory[] = ['舆情类', '融媒体类', '境外类'];

const SHARE_OPTIONS: { value: WarehouseShareScope; desc: string }[] = [
  { value: '全机构可见', desc: '全机构内人员均可见' },
  { value: '指定人员可见', desc: '多选本机构人员' },
  { value: '仅本人可见', desc: '当前仓库仅本人可见' }
];

interface WarehouseEditorModalProps {
  initial?: WarehouseItem | null;
  existing: WarehouseItem[];
  defaultCategory?: WarehouseCategory;
  onClose: () => void;
  onSubmit: (values: WarehouseFormValues) => void;
}

export const WarehouseEditorModal: React.FC<WarehouseEditorModalProps> = ({ initial, existing, defaultCategory = '舆情类', onClose, onSubmit }) => {
  const [form, setForm] = useState<WarehouseFormValues>(() =>
    initial
      ? {
          name: initial.name,
          category: initial.category,
          remark: initial.remark,
          shareScope: initial.shareScope,
          members: initial.members
        }
      : { name: '', category: defaultCategory, remark: '', shareScope: '全机构可见', members: [] }
  );
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedStaff = form.members.map((id) => resolveWarehouseStaff(id)).filter((item) => item != null);

  const submit = () => {
    const name = form.name.trim();
    if (!name) {
      setError('请输入数据仓库名称');
      return;
    }
    if (existing.some((item) => item.name === name && item.id !== initial?.id)) {
      setError('已存在同名仓库');
      return;
    }
    if (form.shareScope === '指定人员可见' && form.members.length === 0) {
      setError('请选择可见人员');
      return;
    }
    onSubmit({
      ...form,
      name,
      remark: form.remark.trim(),
      members: form.shareScope === '指定人员可见' ? form.members : []
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-200"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900">{initial ? '编辑数据仓库' : '新建数据仓库'}</h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-5 py-4 space-y-4 text-xs">
            <section>
              <h4 className="font-bold text-gray-800 mb-2 border-l-2 border-[#1E5ABB] pl-2">主分类</h4>
              <div className="flex flex-wrap gap-2">
                {WAREHOUSE_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, category }))}
                    className={`px-3 py-1.5 rounded-lg border cursor-pointer ${
                      form.category === category
                        ? 'border-[#1E5ABB] bg-blue-50 text-[#1E5ABB] font-bold'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h4 className="font-bold text-gray-800 mb-2 border-l-2 border-[#1E5ABB] pl-2">数据仓库名称</h4>
              <input
                value={form.name}
                maxLength={15}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="请输入数据仓库名称（最多 15 个字）"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB]"
              />
            </section>

            <section>
              <h4 className="font-bold text-gray-800 mb-2 border-l-2 border-[#1E5ABB] pl-2">仓库说明</h4>
              <textarea
                value={form.remark}
                onChange={(event) => setForm((prev) => ({ ...prev, remark: event.target.value }))}
                placeholder="请输入仓库说明，便于其他人员理解收录范畴"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB] resize-none"
              />
            </section>

            <section>
              <h4 className="font-bold text-gray-800 mb-2 border-l-2 border-[#1E5ABB] pl-2">可见范围</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SHARE_OPTIONS.map((option) => {
                  const active = form.shareScope === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, shareScope: option.value }))}
                      className={`rounded-xl border px-3 py-3 text-left cursor-pointer ${
                        active ? 'border-[#1E5ABB] bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center gap-2 font-bold text-gray-800">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            active ? 'border-[#1E5ABB]' : 'border-gray-300'
                          }`}
                        >
                          {active && <span className="w-2 h-2 rounded-full bg-[#1E5ABB]" />}
                        </span>
                        {option.value}
                      </span>
                      <span className="block text-[11px] text-gray-500 mt-1 pl-5">{option.desc}</span>
                    </button>
                  );
                })}
              </div>
              {form.shareScope === '指定人员可见' && (
                <div className="mt-3">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-gray-700">已选可见人员（{selectedStaff.length}人）：</span>
                    <button type="button" onClick={() => setPickerOpen(true)} className="text-[#1E5ABB] font-bold cursor-pointer hover:underline">
                      修改人员
                    </button>
                  </div>
                  {selectedStaff.length === 0 ? (
                    <p className="text-gray-400">暂未选择人员，请点击右侧「修改人员」添加可见用户</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedStaff.map((staff) => (
                        <WarehouseStaffChip
                          key={staff.id}
                          staff={staff}
                          onRemove={() => setForm((prev) => ({ ...prev, members: prev.members.filter((id) => id !== staff.id) }))}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            {error && <p className="text-rose-600">{error}</p>}
          </div>
          <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold cursor-pointer">
              取消
            </button>
            <button type="button" onClick={submit} className="px-4 py-2 rounded-lg bg-[#1E5ABB] hover:bg-[#184996] text-white text-xs font-bold cursor-pointer">
              保存
            </button>
          </div>
        </div>
      </div>

      {pickerOpen && (
        <WarehouseStaffPicker
          value={form.members}
          onClose={() => setPickerOpen(false)}
          onConfirm={(ids) => {
            setForm((prev) => ({ ...prev, members: ids }));
            setError('');
            setPickerOpen(false);
          }}
        />
      )}
    </>
  );
};
