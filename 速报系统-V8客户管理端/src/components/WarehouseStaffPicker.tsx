import React, { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { PaginationBar } from './PaginationBar';
import { WAREHOUSE_ORG_NAME, WAREHOUSE_STAFF, staffAvatarColor, type WarehouseStaff } from '../data/warehouseStaff';

interface WarehouseStaffPickerProps {
  value: string[];
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
}

const StaffAvatar: React.FC<{ staff: WarehouseStaff; size?: 'sm' | 'md' }> = ({ staff, size = 'md' }) => (
  <span
    className={`shrink-0 rounded-full text-white font-bold flex items-center justify-center ${size === 'sm' ? 'w-5 h-5 text-[10px]' : 'w-7 h-7 text-[11px]'}`}
    style={{ backgroundColor: staffAvatarColor(staff.id) }}
  >
    {staff.name.slice(0, 1)}
  </span>
);

export const WarehouseStaffPicker: React.FC<WarehouseStaffPickerProps> = ({ value, onClose, onConfirm }) => {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selected, setSelected] = useState<string[]>(value);

  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return WAREHOUSE_STAFF;
    return WAREHOUSE_STAFF.filter(
      (item) => item.name.toLowerCase().includes(query) || item.nickname.toLowerCase().includes(query)
    );
  }, [keyword]);

  useEffect(() => {
    setPage(1);
  }, [keyword, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const pageIds = pageRows.map((item) => item.id);
  const allPageChecked = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const togglePage = () => {
    setSelected((prev) =>
      allPageChecked ? prev.filter((id) => !pageIds.includes(id)) : Array.from(new Set([...prev, ...pageIds]))
    );
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/45 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white w-full max-w-3xl max-h-[88vh] rounded-2xl shadow-2xl border border-gray-200 flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">选择【{WAREHOUSE_ORG_NAME}】的可见人员</h3>
            <p className="text-xs text-gray-500 mt-1">请多选专属可见用户，配置完成后仅该用户有权使用此数据仓库</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer" title="关闭">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pb-3">
          <div className="relative">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="请输入姓名进行搜索"
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1E5ABB]/15 focus:border-[#1E5ABB]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-white">
              <tr className="border-y border-gray-200 text-gray-500">
                <th className="py-2.5 w-10 text-center">
                  <input type="checkbox" checked={allPageChecked} onChange={togglePage} className="accent-[#1E5ABB] cursor-pointer" />
                </th>
                <th className="py-2.5 font-semibold">用户姓名</th>
                <th className="py-2.5 font-semibold">微信昵称</th>
                <th className="py-2.5 font-semibold">联系手机</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">
                    未找到匹配人员
                  </td>
                </tr>
              ) : (
                pageRows.map((staff) => {
                  const checked = selected.includes(staff.id);
                  return (
                    <tr
                      key={staff.id}
                      onClick={() => toggle(staff.id)}
                      className={`border-b border-gray-100 cursor-pointer ${checked ? 'bg-blue-50/70' : 'hover:bg-gray-50'}`}
                    >
                      <td className="py-2.5 text-center" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(staff.id)}
                          className="accent-[#1E5ABB] cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-2 font-semibold text-gray-800">
                          <StaffAvatar staff={staff} />
                          {staff.name}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-600">{staff.nickname}</td>
                      <td className="py-2.5 font-mono text-gray-600">{staff.phone}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <PaginationBar
          total={filtered.length}
          page={safePage}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
          <span className="text-xs text-gray-600">
            已选 <strong className="text-[#1E5ABB] font-bold">{selected.length}</strong> 人
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold cursor-pointer">
              取消
            </button>
            <button
              type="button"
              onClick={() => onConfirm(selected)}
              className="px-4 py-2 rounded-lg bg-[#1E5ABB] hover:bg-[#184996] text-white text-xs font-bold cursor-pointer"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WarehouseStaffChip: React.FC<{ staff: WarehouseStaff; onRemove: () => void }> = ({ staff, onRemove }) => (
  <span className="inline-flex items-center gap-1 pl-1 pr-1.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-gray-700">
    <StaffAvatar staff={staff} size="sm" />
    <span className="max-w-[8rem] truncate">{staff.name}</span>
    <button type="button" onClick={onRemove} className="text-gray-400 hover:text-rose-600 cursor-pointer" title={`移除${staff.name}`}>
      <X className="w-3 h-3" />
    </button>
  </span>
);
