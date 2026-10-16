import React, { useMemo, useState } from 'react';
import { getTodayStr } from '../shared/date';
import {
  AuthorizeCandidate,
  ProvisionStatus,
  yearEndDate,
} from '../viewmodels/useInstitutionListViewModel';

export interface AuthorizeFormResult {
  name: string;
  fullName: string;
  creditCode: string;
  status: ProvisionStatus;
  startDate: string;
  endDate: string;
  remark: string;
  unitName: string;
  salesName: string;
  salesPhone: string;
  location: string;
  category: string;
  industry: string;
}

interface Props {
  candidates: AuthorizeCandidate[];
  onClose: () => void;
  onConfirm: (data: AuthorizeFormResult) => void;
  onManage?: (institutionId: number) => void;
}

export const VERSION_OPTIONS = [
  { value: '正式' as const, title: '正式版', desc: '全功能开放与长周期服务' },
  { value: '试用' as const, title: '试用版', desc: '短期测试评估与限额体验' },
];

export const AuthorizeInstitutionModal: React.FC<Props> = ({ candidates, onClose, onConfirm, onManage }) => {
  const [keyword, setKeyword] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<ProvisionStatus>('正式');
  const [startDate, setStartDate] = useState(getTodayStr());
  const [endDate, setEndDate] = useState(yearEndDate(new Date().getFullYear() + 1));
  const [remark, setRemark] = useState('');
  const [showRemarkTip, setShowRemarkTip] = useState(false);

  const currentYear = new Date().getFullYear();
  const yearEnds = [currentYear, currentYear + 1, currentYear + 2];

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(
      (item) =>
        item.shortName.toLowerCase().includes(q) ||
        item.fullName.toLowerCase().includes(q) ||
        item.creditCode.toLowerCase().includes(q)
    );
  }, [candidates, keyword]);

  const selected = candidates.find((item) => item.id === selectedId) ?? null;
  const canSubmit = Boolean(selected) && Boolean(startDate) && Boolean(endDate) && endDate > startDate;

  const handleSelect = (item: AuthorizeCandidate) => {
    if (item.openedInstitutionId !== undefined) {
      onManage?.(item.openedInstitutionId);
      return;
    }
    setSelectedId(item.id);
    setKeyword(item.shortName);
    setDropdownOpen(false);
  };

  const handleClear = () => {
    setKeyword('');
    setSelectedId(null);
    setDropdownOpen(true);
  };

  const handleConfirm = () => {
    if (!selected || !canSubmit) return;
    onConfirm({
      name: selected.shortName,
      fullName: selected.fullName,
      creditCode: selected.creditCode,
      status,
      startDate,
      endDate,
      remark: remark.trim(),
      unitName: selected.unitName,
      salesName: selected.salesName,
      salesPhone: selected.salesPhone,
      location: selected.location,
      category: selected.category,
      industry: selected.industry,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 pt-6 pb-4 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-md bg-[#eef2f8] text-[#1E3A6B] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900 leading-tight">授权开通新机构</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                为未授权的客户机构开通「点点速报 - 清朗净网鉴谣速报系统」应用访问权限
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer" aria-label="关闭">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="px-8 pb-5 space-y-4 overflow-y-auto flex-1">
          <div className="border-t border-gray-100" />

          {/* 选择客户机构 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-[13px] font-bold text-gray-800">
                选择客户机构 <span className="text-gray-800">*</span>
              </label>
              <span className="text-[11px] text-gray-400">支持输入客户简称、全称、信用代码检索</span>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[17px]">
                search
              </span>
              <input
                value={keyword}
                onFocus={() => !selected && setDropdownOpen(true)}
                onBlur={() => setDropdownOpen(false)}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setSelectedId(null);
                  setDropdownOpen(true);
                }}
                placeholder="搜索机构（例如：中铁七局、91610...、西安高新）"
                className={`w-full h-10 pl-9 pr-9 border rounded-md text-[13px] placeholder:text-gray-400 focus:outline-none transition-colors ${
                  selected
                    ? 'bg-[#f7f9fc] border-gray-200'
                    : 'bg-[#fafbfc] border-gray-200 focus:bg-white focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]'
                }`}
              />
              {keyword && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label="清除"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}

              {dropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-md shadow-xl max-h-72 overflow-y-auto p-1.5 space-y-1">
                  {filtered.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-gray-400">未找到匹配的客户机构</div>
                  ) : (
                    filtered.map((item) => {
                      const opened = item.openedInstitutionId !== undefined;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelect(item)}
                          className={`w-full text-left px-3 py-2.5 rounded flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                            opened ? 'bg-rose-50 hover:bg-rose-100/70' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-gray-900">
                              {item.shortName}
                              {item.customerCode && (
                                <span className="ml-1.5 text-xs font-normal text-gray-400">({item.customerCode})</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5 truncate">{item.fullName}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5 font-mono">
                              {item.creditCode} · {item.salesName}
                            </div>
                          </div>
                          {opened ? (
                            <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-white bg-rose-500 px-2 py-0.5 rounded">
                              <span className="material-symbols-outlined text-[13px]">error</span>
                              已开通（点击直达管理）→
                            </span>
                          ) : (
                            <span className="shrink-0 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              未开通
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {!selected && (
              <div className="mt-1 flex flex-col items-center justify-center gap-2 py-6 rounded-md border border-dashed border-gray-200 bg-[#fafbfc]">
                <span className="material-symbols-outlined text-[24px] text-gray-300">domain</span>
                <p className="text-xs text-gray-400">请先在上方搜索框中检索并选定未开通的客户机构</p>
              </div>
            )}

            {selected && (
              <div className="rounded-md border border-[#dbe4f0] bg-[#f5f8fc] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#dbe4f0]">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                    <span className="material-symbols-outlined text-[18px] text-[#1890ff]">domain</span>
                    已选定机构档案详情
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                    <span className="material-symbols-outlined text-[13px]">check</span>
                    系统已匹配
                  </span>
                </div>
                <div className="bg-white border border-gray-100 rounded px-3 py-2.5">
                  <div className="text-[11px] text-gray-400">客户机构全称</div>
                  <div className="text-sm font-bold text-gray-900 mt-1">{selected.fullName}</div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-white border border-gray-100 rounded px-3 py-2.5">
                    <div className="text-[11px] text-gray-400">客户统一社会信用代码</div>
                    <div className="text-sm font-bold text-gray-900 mt-1 font-mono">{selected.creditCode}</div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded px-3 py-2.5">
                    <div className="text-[11px] text-gray-400">所属客户经理（销售）</div>
                    <div className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-gray-400">person</span>
                      {selected.salesName}
                      <span className="text-xs font-normal text-gray-400">（{selected.salesPhone}）</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded px-3 py-2.5">
                  <div className="text-[11px] text-gray-400">所属统计单元</div>
                  <div className="text-sm font-bold text-gray-900 mt-1">{selected.unitName || '—'}</div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100" />

          {/* 应用授权配置参数 */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
              <span className="material-symbols-outlined text-[18px] text-[#1E3A6B]">tune</span>
              应用授权配置参数
            </div>

            <div className="space-y-2">
              <div className="text-sm font-bold text-gray-800">开通的版本 *</div>
              <div className="grid grid-cols-2 gap-3">
                {VERSION_OPTIONS.map((option) => {
                  const active = status === option.value;
                  const formal = option.value === '正式';
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatus(option.value)}
                      className={`text-left px-4 py-3 rounded-md border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        active
                          ? formal
                            ? 'border-violet-400 bg-violet-50/60'
                            : 'border-amber-400 bg-amber-50/60'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className={`text-sm font-bold ${formal ? 'text-violet-700' : 'text-amber-800'}`}>
                          {option.title}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{option.desc}</p>
                      </div>
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          active ? (formal ? 'border-violet-600' : 'border-amber-600') : 'border-gray-400'
                        }`}
                      >
                        {active && (
                          <span className={`w-2.5 h-2.5 rounded-full ${formal ? 'bg-violet-600' : 'bg-amber-600'}`} />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                  <span className="material-symbols-outlined text-[18px] text-gray-500">calendar_today</span>
                  服务时间 *
                </div>
                <div className="flex items-center gap-1.5">
                  {yearEnds.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setEndDate(yearEndDate(year))}
                      className={`px-2.5 py-1 text-[11px] rounded cursor-pointer transition-colors ${
                        endDate === yearEndDate(year)
                          ? 'bg-[#1E3A6B] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {year}年底
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 block">
                  <span className="text-xs font-bold text-gray-700">开始日期</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#1890ff]"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-xs font-bold text-gray-700">结束日期</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#1890ff]"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                  <span className="material-symbols-outlined text-[18px] text-gray-500">description</span>
                  开通备注（可选）
                </div>
                <button
                  type="button"
                  onClick={() => setShowRemarkTip((v) => !v)}
                  className="text-[11px] text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  选填说明
                </button>
              </div>
              {showRemarkTip && (
                <p className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 rounded px-3 py-2">
                  可填写项目审批单号、特殊开通要求或内部备注，便于后续审计追溯。
                </p>
              )}
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value.slice(0, 200))}
                rows={2}
                placeholder="请输入开通备注、项目审批单号或特殊要求说明..."
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#1890ff]"
              />
            </div>
          </div>
        </div>

        <div className="mx-8 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-[#1E3A6B] rounded-md hover:bg-[#162d54] disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            确认授权开通机构
          </button>
        </div>
      </div>
    </div>
  );
};
