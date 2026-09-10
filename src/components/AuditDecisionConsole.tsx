import React from 'react';
import { ReportItem } from '../types';

interface AuditDecisionConsoleProps {
  report: ReportItem;
  allCluster: ReportItem[];
  selectedBatchIds: number[];
  scoreMap: Record<number, number>;
  identMap: Record<number, '首发' | '重复'>;
  auditMode: 'pass' | 'reject';
  setAuditMode: (mode: 'pass' | 'reject') => void;
  rejectReason: string;
  setRejectReason: (reason: string) => void;
  rejectDetail: string;
  setRejectDetail: (detail: string) => void;
  handleSubmitAudit: () => void;
  selectedScore?: number;
  handleSetScore?: (reportId: number, score: number) => void;
  handleBatchSetScore?: (score: number) => void;
  onClose?: () => void;
  operatorName?: string;
}

export const AuditDecisionConsole: React.FC<AuditDecisionConsoleProps> = ({
  report,
  allCluster = [],
  selectedBatchIds = [],
  scoreMap,
  identMap,
  auditMode,
  setAuditMode,
  rejectReason,
  setRejectReason,
  rejectDetail,
  setRejectDetail,
  handleSubmitAudit,
  selectedScore = 5,
  handleSetScore,
  handleBatchSetScore,
  onClose,
  operatorName = '张三',
}) => {
  const clusterCount = allCluster && allCluster.length > 0 ? allCluster.length : (report ? 1 : 0);
  const selectedCount = selectedBatchIds ? selectedBatchIds.length : 0;
  const currentScore = selectedScore;

  return (
    /* 底部固定操作栏主容器 */
    <div
      className="shrink-0 bg-white border-t border-slate-200/90 p-4 sm:p-5 shadow-[0_-8px_25px_rgba(15,23,42,0.06)] z-20 space-y-3.5 w-full"
      id="audit-action-bottom-bar"
    >
      {/* 1. 控制区主卡片：审核结论模式切换 + 评分 / 驳回配置项 */}
      <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-3 sm:p-3.5 space-y-3">
        {/* 第一行：审核模式分段选择器 + 右侧快捷设置 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* 审核结论切换器 */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700 shrink-0">审核结论：</span>
            <div className="inline-flex p-1 bg-slate-200/70 rounded-xl space-x-1">
              <button
                type="button"
                onClick={() => setAuditMode('pass')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  auditMode === 'pass'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <span>✓ 审核通过</span>
              </button>
              <button
                type="button"
                onClick={() => setAuditMode('reject')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  auditMode === 'reject'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <span>✕ 审核驳回</span>
              </button>
            </div>
          </div>

          {/* 右侧：通过模式评分 / 驳回模式分类 */}
          {auditMode === 'pass' ? (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-amber-900 font-bold shrink-0">审核评分：</span>
              <div className="flex items-center space-x-1 bg-amber-50/80 p-1 rounded-lg border border-amber-200/80">
                {[5, 3.5, 3, 1, 0].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => {
                      if (handleBatchSetScore) {
                        handleBatchSetScore(score);
                      } else if (handleSetScore) {
                        handleSetScore(report.id, score);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold cursor-pointer transition-all ${
                      currentScore === score
                        ? 'bg-emerald-600 text-white shadow-xs scale-105'
                        : 'bg-white text-slate-700 hover:bg-amber-100/70 border border-amber-100'
                    }`}
                  >
                    {score}分
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-rose-900 font-bold shrink-0">驳回类型：</span>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="px-3 py-1.5 border border-rose-200 rounded-lg bg-white text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-2xs cursor-pointer"
              >
                <option value="信息不完整">信息不完整</option>
                <option value="内容重复/同源">内容重复/同源</option>
                <option value="属虚假误报">属虚假误报</option>
                <option value="非本辖区职责">非本辖区职责</option>
                <option value="佐证不足">佐证不足</option>
              </select>
            </div>
          )}
        </div>

        {/* 驳回模式下的详细意见说明输入框 */}
        {auditMode === 'reject' && (
          <div className="space-y-1.5 pt-1">
            <label className="block text-[11px] font-medium text-slate-500">
              驳回指引与整改说明（将同步通知上报单位与作者）：
            </label>
            <textarea
              rows={2}
              value={rejectDetail}
              onChange={(e) => setRejectDetail(e.target.value)}
              placeholder="请输入详细的驳回原因、需要补充的佐证材料或修改建议..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none shadow-2xs"
            />
          </div>
        )}
      </div>

      {/* 2. 底部动作条：左侧状态提示与经办人 + 右侧操作按钮 */}
      <div className="flex items-center justify-between gap-3 pt-0.5">
        <div className="flex items-center space-x-2.5 text-xs text-slate-500 min-w-0 flex-wrap">
          {/* 同源匹配与已勾选联动数胶囊 */}
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-[#1E5ABB] border border-blue-200/80 text-xs font-medium shrink-0">
            <span>同源匹配 <strong className="font-bold text-[#1E5ABB]">{clusterCount}</strong> 条</span>
            <span className="text-blue-300">·</span>
            <span className="text-emerald-700 font-semibold">已勾选联动 <strong>{selectedCount}</strong> 条</span>
          </span>

          <span className="text-slate-300">|</span>

          <span className="text-xs text-slate-600 flex items-center space-x-1 font-medium">
            <span className="text-slate-400 text-[11px]">经办人：</span>
            <span className="font-bold text-slate-800">{operatorName}</span>
          </span>
        </div>

        {/* 右侧动作按钮组 */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
          >
            关闭
          </button>

          {auditMode === 'pass' ? (
            <button
              type="button"
              onClick={handleSubmitAudit}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <span>{selectedCount > 0 ? `确认批量通过 (${selectedCount}条)` : '确认审核通过'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitAudit}
              className="px-6 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <span>{selectedCount > 0 ? `确认批量驳回 (${selectedCount}条)` : '确认审核驳回'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
