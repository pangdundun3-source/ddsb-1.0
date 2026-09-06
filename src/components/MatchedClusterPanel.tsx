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
  allCluster,
  matchUrl,
  scoreMap,
  handleSetScore,
  identMap,
  handleSetIdent,
  selectedScore,
  onInspectReport,
  compact = false,
  auditMode = 'pass',
}) => {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-4.5 border border-gray-200/80 shadow-2xs space-y-3.5">
      {/* 1. Header: 按链接地址精准匹配 + 匹配条数 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5">
          <LinkIcon className="w-4 h-4 text-[#1E5ABB] shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold text-gray-900">按链接地址精准匹配</h3>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-[#1E5ABB] border border-blue-100">
          共 <strong className="mx-0.5 font-bold">{allCluster.length}</strong> 条匹配数据
        </span>
      </div>

      {/* 2. URL Display Box */}
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center justify-between text-xs shadow-2xs">
        <span className="font-mono text-xs text-gray-700 truncate pr-2" title={matchUrl || 'https://news.example.com/'}>
          {matchUrl || 'https://news.example.com/'}
        </span>
        <a
          href={matchUrl || 'https://news.example.com/'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1E5ABB] hover:text-blue-700 transition-colors shrink-0 p-0.5 cursor-pointer"
          title="在新窗口打开链接"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 3. Card List View */}
      <div className="overflow-hidden">
        {allCluster.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs">
            <p>暂无关联机构数据</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {allCluster.map((item) => {
              const isCurrent = item.id === report.id;
              const itemScore = scoreMap[item.id] ?? (isCurrent ? selectedScore : 3);
              const itemIdent = identMap[item.id] ?? (item.identificationStatus === '首发' ? '首发' : '重复');

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-3 transition-all space-y-2 bg-white ${
                    isCurrent
                      ? 'border-[#1E5ABB]/40 shadow-2xs ring-1 ring-[#1E5ABB]/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => onInspectReport(item)}
                        className="text-left font-bold text-[#1E5ABB] hover:text-[#164895] hover:underline text-xs truncate transition-colors cursor-pointer flex-1"
                        title={`点击查看「${item.title}」详情`}
                      >
                        {item.title}
                      </button>
                      {isCurrent && (
                        <span className="bg-[#1E5ABB] text-white text-[9px] font-bold px-1 py-0.2 rounded shrink-0">
                          主审
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                    <span>
                      <strong className="text-gray-700 font-medium">{item.author}</strong>（{item.organization || '属地机构'}）
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="font-mono text-gray-400">{item.submitTime}</span>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 text-xs">
                    <div className="flex items-center space-x-1">
                      <span className="text-[11px] text-gray-400">判定:</span>
                      <div className="inline-flex rounded border border-gray-200 bg-gray-100 p-0.5">
                        <button
                          type="button"
                          onClick={() => handleSetIdent(item.id, '首发')}
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
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
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                            itemIdent === '重复'
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          重复
                        </button>
                      </div>
                    </div>

                    {auditMode === 'reject' ? (
                      <div className="flex items-center space-x-1">
                        <span className="text-[11px] text-gray-400">评分:</span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-rose-600 bg-rose-50 border border-rose-200/80">
                          <Ban className="w-2.5 h-2.5 text-rose-500" />
                          驳回不赋分
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <span className="text-[11px] text-gray-400">评分:</span>
                        <div className="flex items-center space-x-0.5">
                          {[5, 3.5, 3, 1, 0].map((sc) => (
                            <button
                              key={sc}
                              type="button"
                              onClick={() => handleSetScore(item.id, sc)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all border ${
                                itemScore === sc
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {sc}
                            </button>
                          ))}
                          <span className="text-[10px] text-gray-400 font-normal pl-0.5">分</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
