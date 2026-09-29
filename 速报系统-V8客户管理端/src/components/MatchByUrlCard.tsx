import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, ExternalLink, Ban } from 'lucide-react';
import { ReportItem } from '../types';

export interface MatchedItem {
  id: number | string;
  title?: string;
  author?: string;
  organization?: string;
  submitTime?: string;
  identificationStatus?: string;
  [key: string]: any;
}

export interface MatchByUrlCardProps {
  matchUrl?: string;                                               // 目标链接地址
  matchedList?: MatchedItem[];                                     // 匹配到的列表数据
  selectedIds?: (number | string)[];                               // 受控勾选 ID
  onSelectionChange?: (selectedIds: (number | string)[]) => void;  // 勾选变动回调
  onInspectReport?: (report: ReportItem | MatchedItem) => void;     // 查看详情回调
  scoreMap?: Record<number, number>;                               // 各条目得分 Map
  handleSetScore?: (reportId: number, score: number) => void;       // 设置打分回调
  identMap?: Record<number, '首发' | '重复'>;                        // 各条目首发/重复判定 Map
  handleSetIdent?: (reportId: number, ident: '首发' | '重复') => void; // 设置判定回调
  selectedScore?: number;                                          // 主评分默认值
  auditMode?: 'pass' | 'reject';                                   // 当前审核模式
  currentReportId?: number | string;                               // 当前主审报告 ID（过滤自身）
}

export const MatchByUrlCard: React.FC<MatchByUrlCardProps> = ({
  matchUrl = '',
  matchedList = [],
  selectedIds,
  onSelectionChange,
  onInspectReport,
  scoreMap = {},
  handleSetScore,
  identMap = {},
  handleSetIdent,
  selectedScore = 5,
  auditMode = 'pass',
  currentReportId,
}) => {
  // 过滤掉主审自身的记录，仅展示同源关联的其他速报
  const displayList = currentReportId !== undefined
    ? matchedList.filter((item) => String(item.id) !== String(currentReportId))
    : matchedList;

  // 已勾选的列表项 ID 数组（支持外部受控与内部自管）
  const [internalSelectedBatchIds, setInternalSelectedBatchIds] = useState<(number | string)[]>(
    selectedIds ?? displayList.map((item) => item.id)
  );

  // 如果外部传入了受控 selectedIds，同步更新
  useEffect(() => {
    if (selectedIds !== undefined) {
      setInternalSelectedBatchIds(selectedIds);
    }
  }, [selectedIds]);

  const currentSelectedBatchIds = selectedIds !== undefined ? selectedIds : internalSelectedBatchIds;

  // 计算当前显示列表中被勾选的 ID
  const checkedInDisplay = displayList.filter((item) =>
    currentSelectedBatchIds.includes(item.id)
  );

  // 是否在当前列表中全部勾选
  const isAllBatchSelected =
    displayList.length > 0 && checkedInDisplay.length === displayList.length;

  // 单项切换勾选
  const toggleBatchItem = (id: number | string) => {
    const next = currentSelectedBatchIds.includes(id)
      ? currentSelectedBatchIds.filter((itemId) => itemId !== id)
      : [...currentSelectedBatchIds, id];
    setInternalSelectedBatchIds(next);
    onSelectionChange?.(next);
  };

  // 全选 / 取消全选切换
  const toggleSelectAllBatch = () => {
    let next: (number | string)[];
    if (isAllBatchSelected) {
      // 从已选列表中剔除 displayList 中的所有 ID
      const displayIds = new Set(displayList.map((item) => item.id));
      next = currentSelectedBatchIds.filter((id) => !displayIds.has(id));
    } else {
      // 合并 displayList 中的所有 ID
      const displayIds = displayList.map((item) => item.id);
      next = Array.from(new Set([...currentSelectedBatchIds, ...displayIds]));
    }
    setInternalSelectedBatchIds(next);
    onSelectionChange?.(next);
  };

  return (
    /* 1. 外层主卡片容器 */
    <div
      className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-3.5 w-full"
      id="match-by-url-card"
    >
      {/* 2. 标题与外链展示栏 */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 gap-2">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <LinkIcon className="w-4 h-4 text-[#2563EB] shrink-0" />
          <h3 className="text-sm font-bold text-gray-900 shrink-0">按链接地址精准匹配</h3>
          <span className="text-gray-300 shrink-0 text-xs">：</span>
          {matchUrl ? (
            <a
              href={matchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs font-mono text-[#1E5ABB] hover:text-[#134092] transition-colors truncate min-w-0 max-w-[460px] group cursor-pointer"
              title={`点击在新窗口跳转访问原文：\n${matchUrl}`}
            >
              <span className="truncate underline underline-offset-2 decoration-blue-300 group-hover:decoration-blue-600">
                {matchUrl}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-[#2563EB] shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </a>
          ) : (
            <span className="text-xs text-gray-400 font-mono italic">暂无同源匹配链接</span>
          )}
        </div>
      </div>

      {/* 3. 匹配列表及批量控制条 */}
      {displayList.length > 0 ? (
        <div className="space-y-2 pt-1">
          {/* 顶部批量操作栏：左侧总控勾选 + 右侧统计与快捷按钮 */}
          <div className="flex items-center justify-between bg-[#EBF3FE] border border-blue-100/90 rounded-md px-3 py-2 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer font-bold text-[#1E3A8A] hover:text-blue-900 select-none">
              <input
                type="checkbox"
                checked={isAllBatchSelected}
                onChange={toggleSelectAllBatch}
                className="w-4 h-4 rounded text-[#1E5ABB] focus:ring-[#1E5ABB] border-slate-300 cursor-pointer accent-[#1E5ABB]"
              />
              <span>勾选是否一起批量审核</span>
            </label>

            <div className="flex items-center space-x-2 text-xs">
              <span
                className={
                  checkedInDisplay.length > 0
                    ? 'text-blue-600 font-medium'
                    : 'text-slate-500 font-medium'
                }
              >
                已勾选 {checkedInDisplay.length}/{displayList.length} 条待审
              </span>
              <button
                type="button"
                onClick={toggleSelectAllBatch}
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer transition-colors"
              >
                {isAllBatchSelected ? '取消全选' : '全选'}
              </button>
            </div>
          </div>

          {/* 可滚动的列表容器 (最大高度 380px，超出出现细滚动条) */}
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-0.5">
            {displayList.map((item) => {
              const itemIdNum = Number(item.id);
              const isChecked = currentSelectedBatchIds.includes(item.id);

              // 判定状态：优先从 identMap 获取，否则取 item.identificationStatus
              const itemIdent =
                identMap[itemIdNum] ??
                (item.identificationStatus === '首发' ? '首发' : '重复');

              // 打分状态：优先从 scoreMap 获取
              const itemScore = scoreMap[itemIdNum] ?? 3.0;

              return (
                <div
                  key={item.id}
                  className={`rounded-lg p-3.5 border transition-all space-y-2.5 ${
                    isChecked
                      ? 'bg-blue-50/40 border-blue-300 shadow-2xs ring-1 ring-blue-400/20'
                      : 'bg-[#F8FAFC] border-gray-200/80 hover:border-gray-300 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                      {/* 单项复选框 */}
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleBatchItem(item.id)}
                        className="w-4 h-4 mt-0.5 rounded text-[#1E5ABB] focus:ring-[#1E5ABB] border-slate-300 cursor-pointer shrink-0 accent-[#1E5ABB]"
                        title={isChecked ? '取消联动批量审核' : '勾选加入批量审核'}
                      />

                      {/* 内容展示插槽区域 */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          {/* 标题插槽 */}
                          <div className="font-bold text-[#1E5ABB] text-xs leading-snug truncate">
                            {onInspectReport ? (
                              <button
                                type="button"
                                onClick={() => onInspectReport(item)}
                                className="text-left font-bold text-[#1E5ABB] hover:text-[#134092] hover:underline truncate transition-colors cursor-pointer"
                                title={`点击查看详情：${item.title || '速报详情'}`}
                              >
                                {item.title || `速报 #${item.id}`}
                              </button>
                            ) : (
                              <span>{item.title || `速报 #${item.id}`}</span>
                            )}
                          </div>

                          {/* 状态徽章：勾选联动显示「同步审核」，未勾选显示「待审核」 */}
                          {isChecked ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-blue-100 text-[#1E5ABB] border border-blue-200/80 shrink-0 whitespace-nowrap">
                              同步审核
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shrink-0 whitespace-nowrap">
                              待审核
                            </span>
                          )}
                        </div>

                        {/* 元信息插槽 (如上报人、机构、时间等) */}
                        <div className="text-[11px] text-gray-500 flex items-center flex-wrap gap-x-2 gap-y-0.5">
                          {item.author && (
                            <span>
                              上报人：
                              <strong className="text-gray-700 font-medium">
                                {item.author}
                              </strong>
                              {item.organization ? `（${item.organization}）` : ''}
                            </span>
                          )}
                          {item.submitTime && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="font-mono text-gray-500">
                                报送时间：{item.submitTime}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. 底部设置区：首发 / 重复 判定打标 + 单个上报打分 */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5 border-t border-gray-100/90 text-xs pl-6.5">
                    {/* 判定: 首发 / 重复 打标 */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] text-gray-500 font-medium">判定打标:</span>
                      <div className="inline-flex rounded-md border border-gray-200 bg-gray-100 p-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleSetIdent?.(itemIdNum, '首发')}
                          className={`px-2.5 py-0.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                            itemIdent === '首发'
                              ? 'bg-[#1E5ABB] text-white shadow-xs'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                          }`}
                        >
                          首发
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetIdent?.(itemIdNum, '重复')}
                          className={`px-2.5 py-0.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                            itemIdent === '重复'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                          }`}
                        >
                          重复
                        </button>
                      </div>
                    </div>

                    {/* 单个上报时间的打分设置 */}
                    {auditMode === 'reject' ? (
                      <div className="flex items-center space-x-1">
                        <span className="text-[11px] text-gray-500 font-medium">打分:</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-rose-600 bg-rose-50 border border-rose-200/80">
                          <Ban className="w-3 h-3 text-rose-500 shrink-0" />
                          驳回不赋分
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[11px] text-gray-500 font-medium">打分:</span>
                        <div className="flex items-center space-x-1">
                          {[5, 3.5, 3, 1, 0].map((sc) => (
                            <button
                              key={sc}
                              type="button"
                              onClick={() => handleSetScore?.(itemIdNum, sc)}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all border ${
                                itemScore === sc
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs scale-105'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {sc}分
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 空状态占位 */
        <div className="py-2 text-center text-xs text-gray-400 bg-gray-50/60 rounded-lg border border-dashed border-gray-200">
          暂无其他关联同源链接的速报
        </div>
      )}
    </div>
  );
};
