import React from 'react';
import { ReportItem } from '../types';
import {
  Link as LinkIcon,
  ExternalLink,
  Ban,
} from 'lucide-react';

interface MatchedClusterPanelProps {
  report: ReportItem;
  allCluster: ReportItem[];
  matchUrl: string;
  selectedBatchIds?: number[];
  setSelectedBatchIds?: React.Dispatch<React.SetStateAction<number[]>>;
  scoreMap: Record<number, number>;
  handleSetScore: (reportId: number, score: number) => void;
  identMap: Record<number, '首发' | '重复'>;
  handleSetIdent: (reportId: number, ident: '首发' | '重复') => void;
  selectedScore: number;
  toggleBatchSelect?: (id: number) => void;
  handleSmartMatchDetermine?: () => void;
  smartMatchNotice?: string | null;
  setSmartMatchNotice?: (val: string | null) => void;
  applyScorePreset?: (preset: 'stepped' | 'all5' | 'all3') => void;
  onInspectReport: (report: ReportItem) => void;
  compact?: boolean;
  auditMode?: 'pass' | 'reject';
}

export const MatchedClusterPanel: React.FC<MatchedClusterPanelProps> = ({
  report,
  allCluster = [],
  matchUrl,
  selectedBatchIds = [],
  setSelectedBatchIds,
  scoreMap,
  handleSetScore,
  identMap,
  handleSetIdent,
  selectedScore,
  toggleBatchSelect,
  onInspectReport,
  auditMode = 'pass',
}) => {
  const currentUrl = matchUrl || report.matchUrl || 'https://news.example.com/';
  const totalCount = allCluster.length;
  const currentSelectedCount = selectedBatchIds.length;
  const isAllSelected = totalCount > 0 && currentSelectedCount === totalCount;
  const isIndeterminate = currentSelectedCount > 0 && currentSelectedCount < totalCount;

  const handleToggleItem = (id: number) => {
    if (toggleBatchSelect) {
      toggleBatchSelect(id);
    } else if (setSelectedBatchIds) {
      setSelectedBatchIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    }
  };

  const handleToggleAll = () => {
    if (!setSelectedBatchIds) return;
    if (isAllSelected) {
      setSelectedBatchIds([]);
    } else {
      setSelectedBatchIds(allCluster.map((item) => item.id));
    }
  };

  return (
    <div
      className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-2xs space-y-3.5"
      id="matched-cluster-panel"
    >
      {/* 1. Header: 🔗 按链接地址精准匹配 ： url ↗ */}
      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-900 flex-wrap gap-y-1">
        <LinkIcon className="w-4 h-4 text-[#1E5ABB] shrink-0 -rotate-45" />
        <span className="font-bold text-gray-900 shrink-0">按链接地址精准匹配 ：</span>
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1E5ABB] hover:underline font-mono truncate max-w-[280px] sm:max-w-md inline-flex items-center space-x-1"
          title={currentUrl}
        >
          <span>{currentUrl}</span>
          <ExternalLink className="w-3.5 h-3.5 ml-1 shrink-0" />
        </a>
      </div>

      <div className="border-t border-gray-100" />

      {/* 2. Checkbox Banner: [☑] 勾选是否一起批量审核      已勾选 4/4 条待审 取消全选 */}
      <div className="bg-[#EFF6FF] border border-[#BFDBFE]/80 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-xs">
        {/* Left: Master Checkbox & Label */}
        <label className="flex items-center space-x-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={(input) => {
              if (input) {
                input.indeterminate = isIndeterminate;
              }
            }}
            onChange={handleToggleAll}
            className="w-4 h-4 rounded border-gray-300 text-[#1E5ABB] focus:ring-blue-500 cursor-pointer accent-[#1E5ABB]"
          />
          <span className="font-bold text-gray-900 text-xs sm:text-sm">
            勾选是否一起批量审核
          </span>
        </label>

        {/* Right: Count & Toggle All Action */}
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-[#1E5ABB] font-medium">
            已勾选 <strong className="font-bold">{currentSelectedCount}/{totalCount}</strong> 条待审
          </span>
          <button
            type="button"
            onClick={handleToggleAll}
            className="text-[#1E5ABB] hover:text-blue-800 hover:underline font-semibold cursor-pointer transition-colors"
          >
            {isAllSelected ? '取消全选' : '全选'}
          </button>
        </div>
      </div>

      {/* 3. Cards List for Cluster Items */}
      <div className="space-y-3 pt-1">
        {allCluster.map((item) => {
          const isCurrent = item.id === report.id;
          const isSelected = selectedBatchIds.includes(item.id);
          const itemScore = scoreMap[item.id] ?? (isCurrent ? selectedScore : 3);
          const itemIdent = identMap[item.id] ?? (item.identificationStatus === '首发' ? '首发' : '重复');

          return (
            <div
              key={item.id}
              className={`rounded-xl border p-3.5 transition-all space-y-2.5 bg-white ${
                isSelected
                  ? 'border-[#1E5ABB]/40 bg-blue-50/10 shadow-2xs ring-1 ring-[#1E5ABB]/20'
                  : 'border-gray-200 opacity-75 hover:opacity-100 hover:border-gray-300'
              }`}
            >
              {/* Card Title & Checkbox */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleItem(item.id)}
                    className="w-4 h-4 rounded border-gray-300 text-[#1E5ABB] focus:ring-blue-500 cursor-pointer accent-[#1E5ABB] shrink-0 mt-0.5"
                    title={isSelected ? '取消勾选' : '勾选批量审核'}
                  />
                  <button
                    type="button"
                    onClick={() => onInspectReport(item)}
                    className="text-left font-bold text-[#1E5ABB] hover:text-[#164895] hover:underline text-xs sm:text-sm truncate transition-colors cursor-pointer flex-1"
                    title={`点击查看「${item.title}」详情`}
                  >
                    {item.title}
                  </button>
                  {isCurrent && (
                    <span className="bg-[#1E5ABB] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
                      主审
                    </span>
                  )}
                </div>
              </div>

              {/* Author, Organization & Submit Time */}
              <div className="text-[11px] text-gray-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 pl-6.5">
                <span>
                  <strong className="text-gray-700 font-medium">{item.author}</strong>（{item.organization || '属地机构'}）
                </span>
                <span className="text-gray-300">•</span>
                <span className="font-mono text-gray-400">{item.submitTime}</span>
              </div>

              {/* Card Footer: 判定 & 评分 */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 text-xs pl-6.5">
                {/* 判定: 首发 / 重复 */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] text-gray-400">判定:</span>
                  <div className="inline-flex rounded-md border border-gray-200 bg-gray-100 p-0.5">
                    <button
                      type="button"
                      onClick={() => handleSetIdent(item.id, '首发')}
                      className={`px-2 py-0.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                        itemIdent === '首发'
                          ? 'bg-[#1E5ABB] text-white shadow-2xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      首发
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetIdent(item.id, '重复')}
                      className={`px-2 py-0.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                        itemIdent === '重复'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      重复
                    </button>
                  </div>
                </div>

                {/* 评分模块 */}
                {auditMode === 'reject' ? (
                  <div className="flex items-center space-x-1">
                    <span className="text-[11px] text-gray-400">评分:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-rose-600 bg-rose-50 border border-rose-200/80">
                      <Ban className="w-3 h-3 text-rose-500" />
                      驳回不赋分
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] text-gray-400">评分:</span>
                    <div className="flex items-center space-x-1">
                      {[5, 3.5, 3, 1, 0].map((sc) => (
                        <button
                          key={sc}
                          type="button"
                          onClick={() => handleSetScore(item.id, sc)}
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all border ${
                            itemScore === sc
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {sc}
                        </button>
                      ))}
                      <span className="text-[11px] text-gray-400 font-normal pl-0.5">分</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
