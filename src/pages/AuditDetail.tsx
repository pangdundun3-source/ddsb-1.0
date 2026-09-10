import React, { useState, useEffect, useMemo } from 'react';
import { ReportItem, PageId, Attachment } from '../types';
import { IdentificationBadge } from '../components/IdentificationBadge';
import { resolveIdentification } from '../services/identificationService';
import {
  Info,
  FileText,
  Paperclip,
  CheckCircle2,
  Clock,
  ChevronRight,
  Send,
  AlertCircle,
  ExternalLink,
  FileSpreadsheet,
  Check,
  X,
  TrendingUp,
  User,
  Link as LinkIcon,
  MapPin,
  Building2,
  Copy,
  Layers,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  History,
  Download,
  Eye,
  SlidersHorizontal,
  Scale,
  CheckSquare,
  Square,
  BarChart2,
  Columns3,
  Columns2,
  Zap,
} from 'lucide-react';
import { AttachmentPreviewModal } from '../components/AttachmentPreviewModal';
import { MatchedReportDetailModal } from '../components/MatchedReportDetailModal';
import { MatchByUrlCard } from '../components/MatchByUrlCard';
import { AuditDecisionConsole } from '../components/AuditDecisionConsole';
import { AuditFlowTimeline } from '../components/AuditFlowTimeline';
import { ReportDetailCard } from '../components/ReportDetailCard';
import { getFinalAuditScore, isFinalAuditStage } from '../auditStage';

interface AuditDetailProps {
  report: ReportItem | null;
  allReports?: ReportItem[];
  onApprove: (
    id: number,
    score?: number,
    isBatch?: boolean,
    manualIdentification?: '首发' | '重复',
    batchIds?: number[],
    scoreMap?: Record<number, number>,
    identMap?: Record<number, '首发' | '重复'>
  ) => void;
  onReject: (id: number, reason: string, detail: string) => void;
  onNavigate: (page: PageId) => void;
}

export const AuditDetail: React.FC<AuditDetailProps> = ({
  report,
  allReports = [],
  onApprove,
  onReject,
  onNavigate,
}) => {
  const defaultUrl = report?.matchUrl || 'https://news.example.com/topic-water';
  const [matchUrl, setMatchUrl] = useState(defaultUrl);
  const [isUrlMatched, setIsUrlMatched] = useState(true);
  const [auditMode, setAuditMode] = useState<'pass' | 'reject'>('pass');
  const [selectedScore, setSelectedScore] = useState<number>(5);
  const [rejectReason, setRejectReason] = useState('信息不完整');
  const [rejectDetail, setRejectDetail] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'detail' | 'timeline'>('detail');

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onNavigate('report-audit');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate]);

  // Matched co-report inspecting modal state
  const [inspectingReport, setInspectingReport] = useState<ReportItem | null>(null);

  // Batch selection IDs, Differentiated scores map, and Identification status map
  const [selectedBatchIds, setSelectedBatchIds] = useState<number[]>([]);
  const [scoreMap, setScoreMap] = useState<Record<number, number>>({});
  const [identMap, setIdentMap] = useState<Record<number, '首发' | '重复'>>({});
  const [smartMatchNotice, setSmartMatchNotice] = useState<string | null>(null);

  const ident = resolveIdentification(report, allReports);
  const defaultFormal: '首发' | '重复' = (ident.status === '重复' || ident.status === '疑似重复') ? '重复' : '首发';
  const [manualIdent, setManualIdent] = useState<'首发' | '重复'>(defaultFormal);

  // Find co-reports for the same provincial incident (matched by URL or provincial topic keywords)
  const rawMatchedCoReports = useMemo(() => {
    if (!report) return [];
    return allReports.filter((r) => {
      if (r.id === report.id) return false;
      // 1. Same matchUrl
      if (r.matchUrl && matchUrl && r.matchUrl.trim() === matchUrl.trim()) return true;
      if (r.matchUrl && report.matchUrl && r.matchUrl.trim() === report.matchUrl.trim()) return true;
      // 2. Or same provincial topic keywords
      const keywords = ['停水', '供水', '管网', '阳光花园', '明月居'];
      return keywords.some((kw) => report.title.includes(kw) && r.title.includes(kw));
    });
  }, [allReports, report, matchUrl]);

  // If rawMatchedCoReports is empty or has few items, supply realistic multi-agency companion reports sharing the same link
  const matchedCoReports = useMemo(() => {
    if (rawMatchedCoReports.length >= 3) return rawMatchedCoReports;
    if (!report) return [];
    const baseMock: ReportItem[] = [
      {
        id: 9901,
        title: `${report.title}（区水务局协同核查进展专报）`,
        source: '政务上报',
        region: report.region || '西屯区',
        infoType: report.infoType || '突发事件',
        author: '李四',
        organization: '西屯区水务局',
        submitTime: '2023-10-24 09:55',
        auditStatus: '待审核',
        auditStage: '初审',
        matchUrl: matchUrl,
        identificationStatus: '重复',
        detailContent: {
          summary: '区水务局针对该事件已派抢修队赶赴现场施工排查，已协调出动应急送水车进驻受影响小区保障居民用水。',
          coreDemands: '居民诉求聚焦抢修进度与临时用水保障。',
          publicOpinionTrend: '网民情绪相对平稳，暂未引发恶性舆情。',
          recommendations: ['按小时向社会通报抢修进度。']
        }
      } as ReportItem,
      {
        id: 9902,
        title: `${report.title}（属地融媒辟谣核实专报）`,
        source: '网络舆情监测',
        region: '全市',
        infoType: '网络谣言',
        author: '王五',
        organization: '市委宣传部融媒体中心',
        submitTime: '2023-10-24 10:20',
        auditStatus: '待审核',
        auditStage: '初审',
        matchUrl: matchUrl,
        identificationStatus: '重复',
        detailContent: {
          summary: '针对自媒体声称“管道大面积破裂需停水数日”等虚假不实传言已完成现场证据核对，联动公安网安部门对首发造谣账号进行取证。',
          coreDemands: '群众希望官方平台快速发布权威辟谣信息。',
          publicOpinionTrend: '需抢在晚高峰下班前发布正式官方澄清通报。',
          recommendations: ['发布辟谣短视频和权威说明。']
        }
      } as ReportItem,
      {
        id: 9903,
        title: `${report.title}（应急保障调度快报）`,
        source: '政务上报',
        region: '西坝区',
        infoType: '突发事件',
        author: '赵六',
        organization: '西坝区应急管理局',
        submitTime: '2023-10-24 10:45',
        auditStatus: '待审核',
        auditStage: '初审',
        matchUrl: matchUrl,
        identificationStatus: '重复',
        detailContent: {
          summary: '应急管理局已启动Ⅳ级应急供水保障机制，协调市自来水集团调配3辆大型蓄水车进驻阳光花园东门。',
          coreDemands: '重点保障老人及婴幼儿家庭生活饮水。',
          publicOpinionTrend: '现场秩序井然，居民情绪得到有效安抚。',
          recommendations: ['增派社区志愿者协助老年人提水。']
        }
      } as ReportItem,
      {
        id: 9904,
        title: `${report.title}（12345热线群众诉求监测）`,
        source: '热线工单',
        region: '西坝区',
        infoType: '民生诉求',
        author: '孙七',
        organization: '西坝区信访与政务服务局',
        submitTime: '2023-10-24 11:10',
        auditStatus: '待审核',
        auditStage: '初审',
        matchUrl: matchUrl,
        identificationStatus: '重复',
        detailContent: {
          summary: '今日上午共接到相关停水工单42件，主要集中于停水通知滞后、物业电话占线等问题。',
          coreDemands: '要求物业与供水公司畅通咨询热线。',
          publicOpinionTrend: '建议督促物业公司做好楼栋管家一对一通知。',
          recommendations: ['开通24小时专人接听应急服务热线。']
        }
      } as ReportItem,
      {
        id: 9905,
        title: `${report.title}（水质安全监测专报）`,
        source: '部门专报',
        region: '西坝区',
        infoType: '突发事件',
        author: '周八',
        organization: '西坝区生态环境局',
        submitTime: '2023-10-24 11:30',
        auditStatus: '待审核',
        auditStage: '初审',
        matchUrl: matchUrl,
        identificationStatus: '重复',
        detailContent: {
          summary: '已派环境监测站对供水管网末梢水样进行抽检，各项水质常规指标均处于正常安全范围。',
          coreDemands: '通报水质化验检测数据，防止谣言扩散。',
          publicOpinionTrend: '网民关注恢复供水后的二次污染问题。',
          recommendations: ['恢复供水后第一时间公布水质达标合格报告。']
        }
      } as ReportItem,
    ];
    return rawMatchedCoReports.length > 0
      ? [...rawMatchedCoReports, ...baseMock.slice(rawMatchedCoReports.length)]
      : baseMock;
  }, [rawMatchedCoReports, report, matchUrl]);

  // Full cluster: current main report + matched co-reports
  const allCluster = useMemo(() => {
    if (!report) return [];
    return [report, ...matchedCoReports];
  }, [report, matchedCoReports]);

  // Initialize batch IDs (for matched co-reports), differentiated scoreMap, and identMap
  useEffect(() => {
    if (!report) return;
    setSelectedBatchIds(matchedCoReports.map((r) => r.id));

    // Default differentiated scoring
    const initialScoreMap: Record<number, number> = {
      [report.id]: 5.0,
    };
    matchedCoReports.forEach((c, idx) => {
      if (idx === 0) initialScoreMap[c.id] = 3.5;
      else if (idx === 1) initialScoreMap[c.id] = 3.0;
      else initialScoreMap[c.id] = 1.0;
    });
    setScoreMap(initialScoreMap);

    // Default ident map (首发 for main report, 重复 for others)
    const initialIdentMap: Record<number, '首发' | '重复'> = {
      [report.id]: defaultFormal,
    };
    matchedCoReports.forEach((c) => {
      initialIdentMap[c.id] = '重复';
    });
    setIdentMap(initialIdentMap);
  }, [report, matchedCoReports, defaultFormal]);

  if (!report) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity cursor-pointer"
          onClick={() => onNavigate('report-audit')}
        />
        <div className="fixed inset-y-0 right-0 z-50 w-full md:w-1/2 lg:w-1/2 bg-white shadow-2xl flex flex-col border-l border-gray-200 p-8 text-center justify-center text-gray-500">
          <p className="text-sm">未找到相关审核记录</p>
          <button
            type="button"
            onClick={() => onNavigate('report-audit')}
            className="mt-4 px-4 py-2 bg-[#1E5ABB] text-white rounded-lg text-xs font-semibold mx-auto cursor-pointer"
          >
            返回审核待办
          </button>
        </div>
      </div>
    );
  }

  const finalScore = getFinalAuditScore(report);

  // Set score for specific report in cluster (上面的单个独立打分，不联动下面)
  const handleSetScore = (reportId: number, score: number) => {
    setScoreMap((prev) => ({ ...prev, [reportId]: score }));
  };

  // 底部审核评分：批量关联上面的每个打分
  const handleBatchSetScore = (score: number) => {
    setSelectedScore(score);
    setScoreMap((prev) => {
      const next = { ...prev };
      allCluster.forEach((item) => {
        next[item.id] = score;
      });
      return next;
    });
  };

  // Set ident for specific report in cluster
  const handleSetIdent = (reportId: number, ident: '首发' | '重复') => {
    setIdentMap((prev) => ({ ...prev, [reportId]: ident }));
    if (reportId === report.id) {
      setManualIdent(ident);
    }
  };

  // Toggle batch select checkbox
  const toggleBatchSelect = (id: number) => {
    setSelectedBatchIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Smart determine based on submitTime
  const handleSmartMatchDetermine = () => {
    const sorted = [...allCluster].sort((a, b) =>
      (a.submitTime || '').localeCompare(b.submitTime || '')
    );
    const earliest = sorted[0];

    const newIdentMap: Record<number, '首发' | '重复'> = {};
    const newScoreMap: Record<number, number> = {};

    sorted.forEach((item, index) => {
      if (index === 0) {
        newIdentMap[item.id] = '首发';
        newScoreMap[item.id] = 5.0;
      } else {
        newIdentMap[item.id] = '重复';
        newScoreMap[item.id] = index === 1 ? 3.5 : index === 2 ? 3.0 : 1.0;
      }
    });

    setIdentMap(newIdentMap);
    setScoreMap(newScoreMap);
    if (newScoreMap[report.id] !== undefined) {
      setSelectedScore(newScoreMap[report.id]);
    }
    if (newIdentMap[report.id] !== undefined) {
      setManualIdent(newIdentMap[report.id]);
    }

    setSmartMatchNotice(
      `智能比对完成！已按全省上报时间最早（${earliest.submitTime} ${earliest.organization}）判定为【首发】（5.0分），其余 ${
        sorted.length - 1
      } 家机构判定为【重复】并自动梯度赋分。`
    );
  };

  // Score presets
  const applyScorePreset = (preset: 'stepped' | 'all5' | 'all3') => {
    const newMap: Record<number, number> = {};
    allCluster.forEach((item, idx) => {
      if (preset === 'stepped') {
        const isFirst = identMap[item.id] === '首发' || idx === 0;
        newMap[item.id] = isFirst ? 5.0 : idx === 1 ? 3.5 : 3.0;
      } else if (preset === 'all5') {
        newMap[item.id] = 5.0;
      } else if (preset === 'all3') {
        newMap[item.id] = 3.0;
      }
    });
    setScoreMap(newMap);
    if (newMap[report.id] !== undefined) {
      setSelectedScore(newMap[report.id]);
    }
  };

  const handleSubmitAudit = () => {
    if (auditMode === 'pass') {
      const isBatchMode = isUrlMatched && selectedBatchIds.length > 0;
      const allApproveIds = isBatchMode ? [report.id, ...selectedBatchIds] : [report.id];
      onApprove(
        report.id,
        scoreMap[report.id] ?? selectedScore,
        isBatchMode,
        identMap[report.id] ?? manualIdent,
        allApproveIds,
        scoreMap,
        identMap
      );
    } else {
      if (isUrlMatched && selectedBatchIds.length > 0) {
        [report.id, ...selectedBatchIds].forEach((id) => onReject(id, rejectReason, rejectDetail));
      } else {
        onReject(report.id, rejectReason, rejectDetail);
      }
    }
    onNavigate('report-audit');
  };

  const detail = report.detailContent || {
    summary:
      '今日（8月13日）上午8时许，多名网民在微博、微信群反映西坝区阳光花园一期、明月居等5个小区突发停水，早高峰生活用水受到影响，涉及居民约3万人。',
    coreDemands:
      '网民普遍反映未接到停水通知，早高峰期间停水严重影响正常生活，部分网民情绪急躁，质疑供水部门应急处置能力。',
    publicOpinionTrend:
      '目前相关话题在本地区微博同城榜排名呈上升趋势，阅读量已突破10万。暂未发现大规模聚集性负面言论，但个别自媒体账号开始发布未经证实的“管道大面积破裂需要停水数日”的言论。',
    recommendations: [
      '1. 建议区政府立即协调水务集团查明停水原因，并明确预计恢复供水时间。',
      '2. 通过官方渠道（微博、微信公众号）紧急发布停水情况说明，澄清不实传言。',
      '3. 若短时间内无法恢复，建议安排应急送水车前往受影响小区，保障居民基本用水需求。',
    ],
  };

  const attachments = report.attachments || [
    {
      id: 'a1',
      name: '微博热点截图.png',
      size: '1.2 MB',
      type: 'image',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&auto=format&fit=crop',
    },
    {
      id: 'a2',
      name: '现场微信群反馈.jpg',
      size: '850 KB',
      type: 'image',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop',
    },
    { id: 'a3', name: '应急供水保障预案.pdf', size: '2.4 MB', type: 'pdf' },
  ];

  const handleCopySummary = () => {
    const text = `【舆情速报】${report.title}\n报送时间：${report.submitTime}\n上报单位：${
      report.organization
    }（${report.author}）\n所属区域：${report.region} | 类型：${
      report.infoType
    }\n发生地址：${report.occurAddress || '未填'}\n\n【内容摘要】\n${
      detail.summary
    }\n\n【核心诉求】\n${detail.coreDemands || '无'}\n\n【处置建议】\n${
      Array.isArray(detail.recommendations)
        ? detail.recommendations.join('\n')
        : detail.recommendations || '暂无'
    }`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const isPending = report.auditStatus === '待审核';
  const isInReview = report.auditStatus === '审核中';
  const isRejected = report.auditStatus === '被驳回' || report.auditStatus === '已驳回';
  const isAdopted = report.auditStatus === '已采纳' || report.auditStatus === '已通过';
  const isWaitingTransfer = report.auditStatus === '待转办';
  const isTransferred = report.auditStatus === '已转办';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="audit-detail-drawer-root">
      {/* 1. Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={() => onNavigate('report-audit')}
      />

      {/* 2. 50% Right-side Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full lg:w-1/2 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out border-l border-gray-200 animate-in slide-in-from-right duration-300"
        id="audit-detail-drawer"
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
              onClick={() => onNavigate('report-audit')}
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
              {/* Report Detail Card */}
              <ReportDetailCard
                report={report}
                allReports={allReports}
                matchUrl={matchUrl}
                onPreviewAttachment={(att) => setPreviewAttachment(att)}
              />

              {/* Matched Reports Cluster Panel (for co-agency reporting) */}
              {matchedCoReports.length > 0 && (
                <MatchByUrlCard
                  matchUrl={matchUrl}
                  matchedList={allCluster}
                  selectedIds={selectedBatchIds}
                  onSelectionChange={(ids) => setSelectedBatchIds(ids.map((id) => Number(id)))}
                  onInspectReport={(item) => setInspectingReport(item as ReportItem)}
                  scoreMap={scoreMap}
                  handleSetScore={handleSetScore}
                  identMap={identMap}
                  handleSetIdent={handleSetIdent}
                  selectedScore={selectedScore}
                  auditMode={auditMode}
                  currentReportId={report.id}
                />
              )}
            </div>
          ) : (
            /* 流转状态 Timeline View */
            <AuditFlowTimeline report={report} headerNote="实时 · 整体流程" />
          )}
        </div>

        {/* Drawer Footer: Audit Decision Console if pending, or Status Info if completed */}
        {isPending ? (
          <AuditDecisionConsole
            report={report}
            allCluster={allCluster}
            selectedBatchIds={selectedBatchIds}
            scoreMap={scoreMap}
            identMap={identMap}
            auditMode={auditMode}
            setAuditMode={setAuditMode}
            rejectReason={rejectReason}
            setRejectReason={setRejectReason}
            rejectDetail={rejectDetail}
            setRejectDetail={setRejectDetail}
            handleSubmitAudit={handleSubmitAudit}
            selectedScore={selectedScore}
            handleSetScore={handleSetScore}
            handleBatchSetScore={handleBatchSetScore}
            onClose={() => onNavigate('report-audit')}
          />
        ) : (
          <div className="shrink-0 bg-white border-t border-gray-200 px-5 sm:px-6 py-3.5 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] z-20 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isRejected
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                }`}
              >
                {isRejected ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-sm font-bold text-gray-900">
                    本节点审核结论记录：
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                      isRejected
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isRejected ? '已驳回' : '已通过'}
                  </span>
                  {!isRejected && (
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold">
                      评分：{finalScore !== undefined ? finalScore : (report.score ?? 92)}分
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 truncate mt-0.5">
                  审核人：{report.auditor || '李审核'} &nbsp;|&nbsp; 审核机构：{report.auditOrg || '台中市网信办'} &nbsp;|&nbsp; 审核时间：{report.auditTime || '2023-10-24 15:00'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('report-audit')}
                className="px-6 py-2 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded-lg text-sm font-medium cursor-pointer shadow-xs transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rich Attachment Preview Modal */}
      <AttachmentPreviewModal
        isOpen={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
        attachment={previewAttachment}
        attachments={attachments}
        onSelectAttachment={(att) => setPreviewAttachment(att)}
      />

      {/* Matched Report Detail Modal */}
      <MatchedReportDetailModal
        isOpen={!!inspectingReport}
        onClose={() => setInspectingReport(null)}
        matchedReport={inspectingReport}
        currentReport={report}
        currentScore={inspectingReport ? scoreMap[inspectingReport.id] ?? 3 : 3}
        onScoreChange={(newScore) => {
          if (inspectingReport) {
            handleSetScore(inspectingReport.id, newScore);
          }
        }}
        currentIdent={
          inspectingReport
            ? identMap[inspectingReport.id] ??
              (inspectingReport.identificationStatus === '首发' ? '首发' : '重复')
            : '重复'
        }
        onIdentChange={(newIdent) => {
          if (inspectingReport) {
            handleSetIdent(inspectingReport.id, newIdent);
          }
        }}
        isSelectedForBatch={
          inspectingReport ? selectedBatchIds.includes(inspectingReport.id) : false
        }
        onToggleBatchSelect={(selected) => {
          if (inspectingReport) {
            if (selected && !selectedBatchIds.includes(inspectingReport.id)) {
              setSelectedBatchIds((prev) => [...prev, inspectingReport.id]);
            } else if (!selected && selectedBatchIds.includes(inspectingReport.id)) {
              setSelectedBatchIds((prev) =>
                prev.filter((id) => id !== inspectingReport.id)
              );
            }
          }
        }}
      />
    </div>
  );
};
