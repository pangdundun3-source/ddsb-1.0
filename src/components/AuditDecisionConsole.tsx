import React from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Send,
  Check,
  X,
} from 'lucide-react';
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
}

export const AuditDecisionConsole: React.FC<AuditDecisionConsoleProps> = ({
  report,
  allCluster,
  selectedBatchIds,
  scoreMap,
  identMap,
  auditMode,
  setAuditMode,
  rejectReason,
  setRejectReason,
  rejectDetail,
  setRejectDetail,
  handleSubmitAudit,
  selectedScore = 3,
  handleSetScore,
}) => {
  const selectedCount = selectedBatchIds.length;
  const isPass = auditMode === 'pass';
  const isReject = auditMode === 'reject';
  const currentScore = scoreMap[report.id] ?? selectedScore;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-5 space-y-4 text-xs"
      id="audit-decision-console"
    >
      {/* 1. Header: 审核操作 with green CheckCircle2 */}
      <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
        <CheckCircle2 className="w-4 h-4 text-[#059669] stroke-[2.2] shrink-0" />
        <h3 className="text-sm font-bold text-gray-900">审核操作</h3>
      </div>

      {/* 2. Audit Conclusion Controls */}
      <div className="space-y-3.5">
        {/* Title Label */}
        <div className="flex items-center space-x-1">
          <span className="font-bold text-gray-900 text-xs">审核结论</span>
        </div>

        {/* Radio Toggle Buttons Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* 批量通过 Radio Option */}
          <button
            type="button"
            onClick={() => setAuditMode('pass')}
            className={`w-full py-2.5 px-3 rounded-lg border transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              isPass
                ? 'bg-[#F0FDF4] border-[#10B981] text-[#065F46] font-bold shadow-2xs'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 font-medium'
            }`}
          >
            {/* Custom Radio Circle */}
            <span
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border ${
                isPass
                  ? 'border-[#059669] bg-[#059669]'
                  : 'border-gray-300 bg-white'
              }`}
            >
              {isPass && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>
            <Check className={`w-3.5 h-3.5 stroke-[2.5] ${isPass ? 'text-[#059669]' : 'text-gray-400'}`} />
            <span>批量通过</span>
          </button>

          {/* 批量驳回 Radio Option */}
          <button
            type="button"
            onClick={() => setAuditMode('reject')}
            className={`w-full py-2.5 px-3 rounded-lg border transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              isReject
                ? 'bg-[#FFF1F2] border-[#E11D48] text-[#9F1239] font-bold shadow-2xs'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 font-medium'
            }`}
          >
            {/* Custom Radio Circle */}
            <span
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border ${
                isReject
                  ? 'border-[#E11D48] bg-[#E11D48]'
                  : 'border-gray-300 bg-white'
              }`}
            >
              {isReject && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>
            <X className={`w-3.5 h-3.5 stroke-[2.5] ${isReject ? 'text-[#E11D48]' : 'text-gray-400'}`} />
            <span>批量驳回</span>
          </button>
        </div>

        {/* Dynamic Form Content */}
        {isPass ? (
          /* When "批量通过" is selected */
          <div className="space-y-3.5 pt-1">
            {/* 评分模块 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800">
                评分
              </label>
              <div className="flex items-center space-x-1.5">
                {[5, 3.5, 3, 1, 0].map((sc) => {
                  const isSelected = currentScore === sc;
                  return (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => {
                        if (handleSetScore) {
                          handleSetScore(report.id, sc);
                        }
                      }}
                      className={`flex-1 py-1.5 px-1 rounded-lg text-xs font-bold cursor-pointer transition-all border text-center ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {sc}分
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleSubmitAudit}
                disabled={selectedCount === 0}
                className="w-full py-2.5 px-4 bg-[#00875A] hover:bg-[#00704A] active:bg-[#006040] text-white font-bold text-xs sm:text-sm rounded-lg shadow-2xs transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5 -rotate-45 shrink-0" />
                <span>确认批量通过</span>
              </button>
            </div>
          </div>
        ) : (
          /* When "批量驳回" is selected */
          <div className="space-y-3 pt-1">
            {/* 驳回原因分类 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800">
                驳回原因分类
              </label>
              <div className="relative">
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2 rounded-lg border border-gray-300 text-xs text-gray-800 bg-white shadow-2xs focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none appearance-none cursor-pointer"
                >
                  <option value="信息不完整">信息不完整</option>
                  <option value="佐证不足">佐证不足（缺少现场照片/视音频材料）</option>
                  <option value="依据不充分">依据不充分（缺乏政策依据或通报文件）</option>
                  <option value="建议表述过于笼统">建议表述过于笼统（缺乏可操作性方案）</option>
                  <option value="涉及多部门职责需联动">涉及多部门职责需联动核实</option>
                  <option value="其他原因">其他原因</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 详细驳回意见与指引 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800">
                详细驳回意见与指引
              </label>
              <textarea
                rows={3}
                value={rejectDetail}
                onChange={(e) => setRejectDetail(e.target.value)}
                placeholder="请输入具体的修改建议和退回说明..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-800 bg-white placeholder:text-gray-400 shadow-2xs focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none resize-y min-h-[75px]"
              />
            </div>

            {/* Confirm Reject Button */}
            <button
              type="button"
              onClick={handleSubmitAudit}
              disabled={selectedCount === 0}
              className="w-full py-2.5 px-4 bg-[#E11D48] hover:bg-[#BE123C] active:bg-[#9F1239] text-white font-bold text-xs sm:text-sm rounded-lg shadow-2xs transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5 -rotate-45 shrink-0" />
              <span>确认批量驳回 ({selectedCount} 条)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
