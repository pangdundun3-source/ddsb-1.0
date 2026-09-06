import React, { useState } from 'react';
import { ReportItem } from '../types';
import { IdentificationBadge } from './IdentificationBadge';
import {
  X,
  User,
  Clock,
  MapPin,
  Building2,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Eye,
  ArrowRightLeft,
  Columns3,
  Sliders,
  Sparkles,
  ExternalLink,
  Check
} from 'lucide-react';

interface MatchedReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedReport: ReportItem | null;
  currentReport: ReportItem | null;
  currentScore?: number;
  onScoreChange?: (score: number) => void;
  currentIdent?: '首发' | '重复';
  onIdentChange?: (ident: '首发' | '重复') => void;
  isSelectedForBatch?: boolean;
  onToggleBatchSelect?: (selected: boolean) => void;
  onSetAsPrimary?: (report: ReportItem) => void;
}

export const MatchedReportDetailModal: React.FC<MatchedReportDetailModalProps> = ({
  isOpen,
  onClose,
  matchedReport,
  currentReport,
  currentScore = 3,
  onScoreChange,
  currentIdent = '重复',
  onIdentChange,
  isSelectedForBatch = true,
  onToggleBatchSelect,
  onSetAsPrimary
}) => {
  const [viewMode, setViewMode] = useState<'detail' | 'compare'>('detail');

  if (!isOpen || !matchedReport) return null;

  const detail = matchedReport.detailContent || {
    summary: '暂无摘要描述。',
    coreDemands: '暂无核心诉求记录。',
    publicOpinionTrend: '暂无舆情态势研判。',
    recommendations: ['建议持续关注事件发展。']
  };

  const currentDetail = currentReport?.detailContent || {
    summary: '暂无摘要描述。',
    coreDemands: '暂无核心诉求记录。',
    publicOpinionTrend: '暂无舆情态势研判。',
    recommendations: ['建议持续关注事件发展。']
  };

  const attachments = matchedReport.attachments || [
    { id: 'm-att-1', name: '现场核查抢修照片.jpg', size: '1.4 MB', type: 'image' as const },
    { id: 'm-att-2', name: '供水调度与送水车台账.pdf', size: '2.1 MB', type: 'pdf' as const }
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      id="matched-report-detail-modal"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* 1. Modal Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-50 via-white to-blue-50 border-b border-gray-200 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-gray-900 truncate">
                  同省疑似重复报送 · 详情与对比
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  同一省事件
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                  相似度 94%
                </span>
              </div>
            </div>
          </div>

          {/* Mode Tabs Switcher */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="bg-gray-100 p-0.5 rounded-lg flex items-center text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('detail')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                  viewMode === 'detail'
                    ? 'bg-white text-gray-900 shadow-2xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>完整详情</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compare')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                  viewMode === 'compare'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span>双栏比对</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="关闭详情"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-gray-700">
          {viewMode === 'detail' ? (
            /* Detail Mode */
            <div className="space-y-5">
              {/* Report Header Card */}
              <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-gray-900 leading-snug">
                        {matchedReport.title}
                      </h3>
                      <IdentificationBadge
                        status={matchedReport.identificationStatus || '疑似重复'}
                        size="xs"
                        showIcon
                      />
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-amber-800 border border-amber-200 shrink-0">
                    状态: {matchedReport.auditStatus}
                  </span>
                </div>

                {/* Sub Metadata */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-600 pt-1 border-t border-amber-200/60">
                  <div>
                    <span className="text-gray-400 block text-[11px]">上报人 / 机构</span>
                    <span className="font-semibold text-gray-800">
                      {matchedReport.author} · {matchedReport.organization}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">所属区域 / 类型</span>
                    <span className="font-semibold text-gray-800">
                      {matchedReport.region} · {matchedReport.infoType}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">报送时间</span>
                    <span className="font-mono text-gray-800">{matchedReport.submitTime}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">发生地址</span>
                    <span className="font-semibold text-gray-800 truncate block" title={matchedReport.occurAddress}>
                      {matchedReport.occurAddress || '西屯区管网涉事街道'}
                    </span>
                  </div>
                </div>

                {/* Incremental Analysis Notice */}
                <div className="bg-white/90 border border-amber-200/80 rounded-lg p-2.5 flex items-center justify-between gap-3 text-[11px]">
                  <div className="flex items-center space-x-2 text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>智能时序比对:</strong> 相比当前首发件晚约 25 分钟报送，但包含现场抢修管网阀门工单及应急送水车点位，具备增量参考价值。
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800 shrink-0">
                    建议打分: 3.0分
                  </span>
                </div>
              </div>

              {/* Detail Sections */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="font-bold text-gray-900 text-xs flex items-center space-x-1.5">
                    <span className="w-1.5 h-3.5 bg-[#1E5ABB] rounded-full inline-block"></span>
                    <span>【内容摘要】</span>
                  </span>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 leading-relaxed text-gray-800 font-normal">
                    {detail.summary}
                  </div>
                </div>

                {detail.coreDemands && (
                  <div className="space-y-1.5">
                    <span className="font-bold text-gray-900 text-xs flex items-center space-x-1.5">
                      <span className="w-1.5 h-3.5 bg-[#1E5ABB] rounded-full inline-block"></span>
                      <span>【核心诉求】</span>
                    </span>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 leading-relaxed text-gray-800 font-normal">
                      {detail.coreDemands}
                    </div>
                  </div>
                )}

                {detail.publicOpinionTrend && (
                  <div className="space-y-1.5">
                    <span className="font-bold text-gray-900 text-xs flex items-center space-x-1.5">
                      <span className="w-1.5 h-3.5 bg-[#1E5ABB] rounded-full inline-block"></span>
                      <span>【舆情态势】</span>
                    </span>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 leading-relaxed text-gray-800 font-normal">
                      {detail.publicOpinionTrend}
                    </div>
                  </div>
                )}

                {detail.recommendations && (
                  <div className="space-y-1.5">
                    <span className="font-bold text-gray-900 text-xs flex items-center space-x-1.5">
                      <span className="w-1.5 h-3.5 bg-[#1E5ABB] rounded-full inline-block"></span>
                      <span>【建议举措 / 处置建议】</span>
                    </span>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-1 text-gray-800 leading-relaxed font-normal">
                      {Array.isArray(detail.recommendations) ? (
                        detail.recommendations.map((r, idx) => (
                          <div key={idx} className="flex items-start space-x-1.5">
                            <span className="text-[#1E5ABB] font-bold">{idx + 1}.</span>
                            <span>{r}</span>
                          </div>
                        ))
                      ) : (
                        <p>{detail.recommendations}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Attachments Section */}
                <div className="space-y-2">
                  <span className="font-bold text-gray-900 text-xs flex items-center space-x-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#1E5ABB]" />
                    <span>佐证材料清单 ({attachments.length}份)</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:border-blue-400 transition-colors shadow-2xs"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E5ABB] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate" title={att.name}>
                              {att.name}
                            </p>
                            <span className="text-[11px] text-gray-400">{att.size}</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-blue-600 font-medium shrink-0 cursor-pointer hover:underline">
                          预览
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Comparison Mode (Side by Side) */
            <div className="space-y-5">
              {/* Comparative Matrix Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Current Report */}
                <div className="bg-blue-50/40 border border-blue-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                    <span className="font-bold text-blue-900 text-xs flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span>当前审核主件（首发报送）</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      首发
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 text-xs leading-snug">
                      {currentReport?.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {currentReport?.author} · {currentReport?.organization}（{currentReport?.submitTime}）
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-600">【内容摘要】</span>
                    <div className="bg-white border border-blue-100 rounded-lg p-2.5 text-xs text-gray-700 leading-relaxed max-h-36 overflow-y-auto">
                      {currentDetail.summary}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-600">【核心诉求】</span>
                    <div className="bg-white border border-blue-100 rounded-lg p-2.5 text-xs text-gray-700 leading-relaxed">
                      {currentDetail.coreDemands}
                    </div>
                  </div>

                  <div className="text-[11px] bg-blue-100/60 text-blue-900 p-2 rounded-lg font-medium">
                    评定依据: 首发预警，受影响居民面广（3万人），建议评分 5.0 分
                  </div>
                </div>

                {/* Right: Matched Report */}
                <div className="bg-amber-50/40 border border-amber-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                    <span className="font-bold text-amber-900 text-xs flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span>匹配到的同省报送（疑似重复件）</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      疑似重复 94%
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 text-xs leading-snug">
                      {matchedReport.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {matchedReport.author} · {matchedReport.organization}（{matchedReport.submitTime}）
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-600">【内容摘要】</span>
                    <div className="bg-white border border-amber-100 rounded-lg p-2.5 text-xs text-gray-700 leading-relaxed max-h-36 overflow-y-auto">
                      {detail.summary}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-600">【核心诉求】</span>
                    <div className="bg-white border border-amber-100 rounded-lg p-2.5 text-xs text-gray-700 leading-relaxed">
                      {detail.coreDemands}
                    </div>
                  </div>

                  <div className="text-[11px] bg-amber-100/60 text-amber-900 p-2 rounded-lg font-medium">
                    评定依据: 补充现场阀门抢修与送水车调度数据，建议评分 3.0 分
                  </div>
                </div>
              </div>

              {/* Comparative Highlights Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <span className="font-bold text-gray-900 text-xs flex items-center space-x-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#1E5ABB]" />
                  <span>同省同一事件 · 差异对比深度研判</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                    <span className="text-gray-400 block text-[11px] font-medium">报送时序差异</span>
                    <span className="font-bold text-gray-800">晚 25~45 分钟</span>
                    <p className="text-[11px] text-gray-500">
                      首发件先达预警；本件为辖区单位跟进调查
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                    <span className="text-gray-400 block text-[11px] font-medium">共同反映事实</span>
                    <span className="font-bold text-emerald-700">突发供水管网故障</span>
                    <p className="text-[11px] text-gray-500">
                      均反映阳光花园明月居等小区停水及生活影响
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                    <span className="text-gray-400 block text-[11px] font-medium">差异化增量价值</span>
                    <span className="font-bold text-amber-700">含现场抢修及通水时间</span>
                    <p className="text-[11px] text-gray-500">
                      补充了抢修工单与4台临时送水车调度信息
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Modal Footer Bar with Individual Scoring & Identification */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-4 shrink-0">
          {/* Left: Identification & Scoring */}
          <div className="flex flex-wrap items-center gap-4 w-full">
            {/* Identification Toggle */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-gray-700 shrink-0">判定:</span>
              <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => onIdentChange && onIdentChange('首发')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    currentIdent === '首发'
                      ? 'bg-[#1E5ABB] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  首发
                </button>
                <button
                  type="button"
                  onClick={() => onIdentChange && onIdentChange('重复')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    currentIdent === '重复'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  重复
                </button>
              </div>
            </div>

            {/* Individual Scoring Pill for this specific report */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-gray-700 shrink-0 flex items-center space-x-1">
                <Sliders className="w-3.5 h-3.5 text-[#1E5ABB]" />
                <span>独立评分:</span>
              </span>
              <div className="flex items-center space-x-1 flex-wrap">
                {[5, 3.5, 3, 1, 0].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => onScoreChange && onScoreChange(score)}
                    className={`px-2 py-1 rounded-md text-xs font-bold cursor-pointer transition-all border ${
                      currentScore === score
                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50'
                    }`}
                  >
                    {score}分
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
