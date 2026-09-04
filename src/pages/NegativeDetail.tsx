import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronRight,
  Send,
  Undo2,
  X
} from 'lucide-react';
import { PageId, ReportItem } from '../types';
import { ReportContentDisplay } from '../components/ReportContentDisplay';
import { AuditFlowTimeline } from '../components/AuditFlowTimeline';
import { getFinalAuditScore } from '../auditStage';

interface NegativeDetailProps {
  report: ReportItem | null;
  onTransferSubmit: (id: number, opinion: string) => void;
  onNavigate: (page: PageId) => void;
}

export const NegativeDetail: React.FC<NegativeDetailProps> = ({
  report,
  onTransferSubmit,
  onNavigate
}) => {
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferOpinion, setTransferOpinion] = useState('');
  const [locallyTransferred, setLocallyTransferred] = useState(false);

  if (!report) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
        <p className="text-sm">未选择不良信息记录。</p>
        <button
          onClick={() => onNavigate('negative-info')}
          className="mt-4 rounded-lg bg-[#1E5ABB] px-4 py-2 text-xs font-bold text-white"
        >
          返回不良信息库
        </button>
      </div>
    );
  }

  const isTransferred = locallyTransferred || report.auditStatus === '已转办';
  const transferStatus: '待转办' | '已转办' = isTransferred ? '已转办' : '待转办';

  // 不良信息库内的记录已完成审核采纳：状态只需体现“是否已完成转办”
  const hasRejectOrResubmit =
    (report.timeline || []).some(
      (node) => node.status === 'rejected' || (node.title || '').includes('重新提交')
    ) || false;

  // 最后一轮审核评分：优先取真实终审分；库内已采纳记录若缺分，则生成确定性的模拟分，
  // 保证标题评分与流转状态最后一个环节展示的分数一致。
  const isAdoptedRecord = ['已通过', '已采纳', '待转办', '已转办'].includes(report.auditStatus);
  const finalRoundScore = isAdoptedRecord || hasRejectOrResubmit
    ? (getFinalAuditScore(report) ?? (82 + (report.id % 12)))
    : undefined;

  const displayReport: ReportItem = {
    ...report,
    auditStatus:
      isAdoptedRecord || hasRejectOrResubmit ? transferStatus : report.auditStatus,
    ...(finalRoundScore !== undefined ? { score: finalRoundScore } : { score: undefined })
  };

  const flowReport: ReportItem = hasRejectOrResubmit
    ? displayReport
    : {
        ...displayReport,
        auditStatus: '已采纳',
        timeline: undefined
      };

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <div className="flex w-full items-center space-x-1.5 rounded-lg border border-gray-200 bg-white px-5 py-3 text-xs text-gray-500 shadow-2xs">
        <button onClick={() => onNavigate('negative-info')} className="cursor-pointer hover:text-[#1E5ABB]">
          不良信息库
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="font-bold text-gray-800">详情</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Report Content */}
        <div className="lg:col-span-2 space-y-5">
          <ReportContentDisplay report={displayReport} />
        </div>

        {/* Right: Flow Records & Transfer Operation */}
        <div className="space-y-5">
          {/* Transfer Operation */}
          <div className="rounded-lg border border-gray-200/80 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <Undo2 className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-bold text-gray-800">转办操作</h3>
            </div>

            {isTransferred ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                <p className="font-bold">已完成转办</p>
                <p className="mt-1 leading-relaxed text-emerald-700">
                  本条不良信息已转办至相关责任单位，当前无需重复操作。
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start space-x-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="font-bold">当前状态：待转办</p>
                    <p className="mt-0.5 leading-relaxed">确认无误后可将该条不良信息转办至责任单位处置。</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTransferOpinion('');
                    setTransferModalOpen(true);
                  }}
                  className="w-full rounded-md bg-[#1E5ABB] py-2.5 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-[#134092] flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>确认转办</span>
                </button>
              </>
            )}
          </div>

          {/* 审核流转记录（进入不良信息库的均为审核完成已采纳数据，固定展示完整审核链路） */}
          <AuditFlowTimeline report={flowReport} headerNote="审核完成 · 完整链路" />
        </div>
      </div>

      {/* Transfer Confirm Modal */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2 text-amber-600">
                <Undo2 className="h-5 w-5" />
                <h3 className="text-base font-bold text-gray-900">确认转办</h3>
              </div>
              <button
                onClick={() => setTransferModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-3 text-xs text-gray-600">
              <span className="font-bold text-gray-800">转办对象：</span>
              <span>《{report.title}》</span>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">转办意见</label>
              <textarea
                rows={3}
                value={transferOpinion}
                onChange={(e) => setTransferOpinion(e.target.value)}
                placeholder="请输入转办说明或建议处理单位..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
              />
            </div>

            <div className="flex justify-end space-x-3 border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => setTransferModalOpen(false)}
                className="rounded-md bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  onTransferSubmit(report.id, transferOpinion);
                  setLocallyTransferred(true);
                  setTransferModalOpen(false);
                }}
                className="flex items-center space-x-1 rounded-md bg-[#1E5ABB] px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#134092] cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>确认转办</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
