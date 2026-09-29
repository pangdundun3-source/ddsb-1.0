import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationBarProps {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const getPageNumbers = (totalPages: number, page: number): (number | string)[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const items: (number | string)[] = [1];
  if (page > 3) items.push('ellipsis-left');
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p += 1) items.push(p);
  if (page < totalPages - 2) items.push('ellipsis-right');
  items.push(totalPages);
  return items;
};

export const PaginationBar: React.FC<PaginationBarProps> = ({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const [jumpPage, setJumpPage] = useState(String(safePage));

  useEffect(() => {
    setJumpPage(String(safePage));
  }, [safePage]);

  const go = (p: number) => onPageChange(Math.min(totalPages, Math.max(1, p)));
  const commitJump = () => {
    const val = parseInt(jumpPage, 10);
    if (!Number.isNaN(val)) go(val);
    setJumpPage(String(Math.min(totalPages, Math.max(1, Number.isNaN(val) ? safePage : val))));
  };

  return (
    <div className="flex flex-col gap-3 px-4 py-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>
          共 <strong className="text-[#1E5ABB] font-bold">{total}</strong> 条记录
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <div className="flex min-h-11 items-center space-x-1.5 sm:min-h-8">
          <span className="text-gray-400 whitespace-nowrap">每页</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="min-h-11 rounded border border-gray-300 bg-white px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] cursor-pointer sm:min-h-8"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-gray-400 whitespace-nowrap">条</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => go(safePage - 1)}
            disabled={safePage <= 1}
            aria-label="上一页"
            title="上一页"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded border border-gray-200 bg-white px-2 py-1 font-semibold text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-8 sm:min-w-8"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          {getPageNumbers(totalPages, safePage).map((p) =>
            p === 'ellipsis-left' || p === 'ellipsis-right' ? (
              <span key={p} className="flex min-h-11 items-center px-1 text-gray-400 sm:min-h-8">
                ...
              </span>
            ) : (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => go(Number(p))}
                aria-current={Number(p) === safePage ? 'page' : undefined}
                className={`min-h-11 min-w-11 rounded border px-2 py-1 font-bold transition-colors sm:min-h-8 sm:min-w-8 ${
                  Number(p) === safePage
                    ? 'bg-[#1E5ABB] text-white border-[#1E5ABB] shadow-2xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-[#1E5ABB]'
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => go(safePage + 1)}
            disabled={safePage >= totalPages}
            aria-label="下一页"
            title="下一页"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded border border-gray-200 bg-white px-2 py-1 font-semibold text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-8 sm:min-w-8"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <label className="ml-0 flex min-h-11 items-center gap-1.5 text-gray-400 sm:ml-1.5 sm:min-h-8">
            <span className="whitespace-nowrap">跳转至</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              onBlur={commitJump}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitJump();
                }
              }}
              className="min-h-11 w-14 rounded border border-gray-300 px-1.5 py-1 text-center text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] sm:min-h-8"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
