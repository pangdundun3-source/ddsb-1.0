import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  FileText,
  History,
  Send,
  X,
} from 'lucide-react';
import { PageId, ReportItem } from '../types';
import { ReportDetailCard } from '../components/ReportDetailCard';
import { AuditFlowTimeline } from '../components/AuditFlowTimeline';
import { getFinalAuditScore } from '../auditStage';
import { TransferDirectiveModal } from '../components/TransferDirectiveModal';

interface NegativeDetailProps {
  report: ReportItem | null;
  onTransferSubmit: (id: number, opinion: string) => void;
  onNavigate: (page: PageId) => void;
}

export const NegativeDetail: React.FC<NegativeDetailProps> = ({
  report,
  onTransferSubmit,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'detail' | 'timeline'>('detail');
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [locallyTransferred, setLocallyTransferred] = useState(false);

  // Esc key listener to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !transferModalOpen) {
        onNavigate('negative-info');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, transferModalOpen]);

  if (!report) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-2xl max-w-sm w-full mx-4 space-y-4">
          <p className="text-sm font-medium">未选择不良信息记录。</p>
          <button
            onClick={() => onNavigate('negative-info')}
            className="rounded-lg bg-[#1E5ABB] hover:bg-[#134092] px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
          >
            返回不良信息库
          </button>
        </div>
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

  // 最后一轮审核评分：优先取真实终审分；库内已采纳记录若缺分，则生成确定性的模拟分
  const isAdoptedRecord = ['已通过', '已采纳', '待转办', '已转办'].includes(report.auditStatus);
  const finalRoundScore =
    isAdoptedRecord || hasRejectOrResubmit
      ? (getFinalAuditScore(report) ?? (82 + (report.id % 12)))
      : undefined;

  const displayReport: ReportItem = {
    ...report,
    auditStatus:
      isAdoptedRecord || hasRejectOrResubmit ? transferStatus : report.auditStatus,
    ...(finalRoundScore !== undefined ? { score: finalRoundScore } : { score: undefined }),
  };

  const flowReport: ReportItem = hasRejectOrResubmit
    ? displayReport
    : {
        ...displayReport,
        auditStatus: '已采纳',
        timeline: undefined,
      };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="negative-detail-drawer-root">
      {/* 1. Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={() => onNavigate('negative-info')}
      />

      {/* 2. 50% Right-side Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full lg:w-1/2 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out border-l border-gray-200 animate-in slide-in-from-right duration-300"
        id="negative-detail-drawer"
      >
        {/* Drawer Top Header with Tabs & Close Action */}
        <div className="h-14 px-5 sm:px-6 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-6 h-full">
            <button
              type="button"
              onClick={() => setActiveTab('detail')}
              className={`h-full flex items-center space-x-1.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'detail'
                  ? 'text-[#1E5ABB] border-[#1E5ABB]'
                  : 'text-gray-500 hover:text-gray-800 border-transparent'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>详情信息</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`h-full flex items-center space-x-1.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'timeline'
                  ? 'text-[#1E5ABB] border-[#1E5ABB]'
                  : 'text-gray-500 hover:text-gray-800 border-transparent'
              }`}
            >
              <History className="w-4 h-4" />
              <span>流转状态</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onNavigate('negative-info')}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="关闭抽屉 (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8FAFC] space-y-4">
          {activeTab === 'detail' ? (
            <div className="space-y-4">
              <ReportDetailCard report={displayReport} />
            </div>
          ) : (
            /* 流转状态 Timeline View */
            <AuditFlowTimeline report={flowReport} headerNote="审核完成 · 完整链路" />
          )}
        </div>

        {/* Drawer Bottom Footer */}
        <div className="border-t border-gray-200 bg-white p-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 shadow-lg">
          <div className="flex items-center space-x-2 text-xs">
            {isTransferred ? (
              <div className="flex items-center space-x-2 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">转办状态：已完成转办</p>
                  <p className="text-gray-500 text-[11px]">本条不良信息已转办至相关责任单位处置</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-amber-700">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">当前状态：待转办</p>
                  <p className="text-gray-500 text-[11px]">确认信息无误后可直接转办至责任单位处置</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('negative-info')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              关闭
            </button>

            {!isTransferred && (
              <button
                type="button"
                onClick={() => setTransferModalOpen(true)}
                className="px-5 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>确认转办</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Confirm Modal */}
      {transferModalOpen && (
        <TransferDirectiveModal
          key={report.id}
          report={report}
          onClose={() => setTransferModalOpen(false)}
          onSubmit={(opinion) => {
            onTransferSubmit(report.id, opinion);
            setLocallyTransferred(true);
            setTransferModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
