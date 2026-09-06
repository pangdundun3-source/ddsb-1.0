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
import { MatchedClusterPanel } from '../components/MatchedClusterPanel';
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
  const [layoutMode, setLayoutMode] = useState<'three-column' | 'two-column'>('three-column');

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

  // Initialize batch IDs, differentiated scoreMap, and identMap whenever report or matchedCoReports change
  useEffect(() => {
    if (!report) return;
    setSelectedBatchIds(allCluster.map((r) => r.id));

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
      <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
        未找到相关审核记录
      </div>
    );
  }

  const finalScore = getFinalAuditScore(report);

  // Set score for specific report in cluster
  const handleSetScore = (reportId: number, score: number) => {
    setScoreMap((prev) => ({ ...prev, [reportId]: score }));
    if (reportId === report.id) {
      setSelectedScore(score);
    }
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
      const isBatchMode = isUrlMatched && selectedBatchIds.length > 1;
      onApprove(
        report.id,
        scoreMap[report.id] ?? selectedScore,
        isBatchMode,
        identMap[report.id] ?? manualIdent,
        selectedBatchIds,
        scoreMap,
        identMap
      );
    } else {
      if (isUrlMatched && selectedBatchIds.length > 1) {
        selectedBatchIds.forEach((id) => onReject(id, rejectReason, rejectDetail));
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
    <div className="space-y-4" id="audit-detail-view">
      {/* 1. Top Breadcrumbs & Layout Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-2xs">
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-500 font-medium">审核管理</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <button
            onClick={() => onNavigate('report-audit')}
            className="text-gray-600 hover:text-[#1E5ABB] hover:underline font-medium flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <span>审核待办</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-gray-900 font-bold">审核详情</span>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Layout Mode Toggle */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
            <button
              type="button"
              onClick={() => setLayoutMode('three-column')}
              className={`px-2.5 py-1 rounded flex items-center space-x-1 text-xs font-semibold cursor-pointer transition-all ${
                layoutMode === 'three-column'
                  ? 'bg-white text-[#1E5ABB] shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="三栏协同工作台（左：速报正文，中：机构清单与打分，右：审核决策控制台）"
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>三栏协同视图</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('two-column')}
              className={`px-2.5 py-1 rounded flex items-center space-x-1 text-xs font-semibold cursor-pointer transition-all ${
                layoutMode === 'two-column'
                  ? 'bg-white text-[#1E5ABB] shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="经典双栏视图"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>经典双栏</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopySummary}
            className="px-3 py-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium transition-colors shadow-2xs flex items-center space-x-1 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-gray-500" />
            <span>{copySuccess ? '已复制汇报文稿' : '复制速报全文'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Layout Grid (Responsive Three-Column Workbench or Two-Column Layout) */}
      <div
        className={`grid grid-cols-1 ${
          layoutMode === 'three-column'
            ? 'xl:grid-cols-12 lg:grid-cols-12'
            : 'lg:grid-cols-3'
        } gap-5 items-start`}
      >
        {/* ================= COLUMN 1: Main Report Content & Attachments ================= */}
        <div
          className={`${
            layoutMode === 'three-column'
              ? 'xl:col-span-6 lg:col-span-6'
              : 'lg:col-span-2'
          }`}
        >
          <ReportDetailCard
            report={report}
            allReports={allReports}
            matchUrl={matchUrl}
            onPreviewAttachment={(att) => setPreviewAttachment(att)}
          />
        </div>

        {/* ================= COLUMN 2: Matched Cluster & Organizations List ================= */}
        <div
          className={`${
            layoutMode === 'three-column'
              ? 'xl:col-span-3 lg:col-span-3'
              : 'lg:col-span-1'
          } space-y-5`}
        >
          <MatchedClusterPanel
            report={report}
            allCluster={allCluster}
            matchUrl={matchUrl}
            selectedBatchIds={selectedBatchIds}
            setSelectedBatchIds={setSelectedBatchIds}
            scoreMap={scoreMap}
            handleSetScore={handleSetScore}
            identMap={identMap}
            handleSetIdent={handleSetIdent}
            selectedScore={selectedScore}
            toggleBatchSelect={toggleBatchSelect}
            handleSmartMatchDetermine={handleSmartMatchDetermine}
            smartMatchNotice={smartMatchNotice}
            setSmartMatchNotice={setSmartMatchNotice}
            applyScorePreset={applyScorePreset}
            onInspectReport={(item) => setInspectingReport(item)}
          />

          {/* In 2-column mode, render Decision Console & Timeline below the list */}
          {layoutMode === 'two-column' && (
            <>
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
                />
              ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
                  <div className="flex items-start space-x-2">
                    {isRejected ? (
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                    ) : (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    )}
                    <div className="space-y-1">
                      <p className="font-bold text-gray-900">
                        {isRejected ? '当前记录已驳回' : '当前记录已完成审核'}
                      </p>
                      <p className="leading-relaxed">
                        该状态不需要当前账号继续审核。请在下方流转状态中查看具体处理节点。
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <AuditFlowTimeline report={report} />
            </>
          )}
        </div>

        {/* ================= COLUMN 3: Sticky Audit Decision Console & Timeline (In 3-Column Mode) ================= */}
        {layoutMode === 'three-column' && (
          <div className="xl:col-span-3 lg:col-span-3 space-y-5 sticky top-4">
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
              />
            ) : (
              <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
                <div className="flex items-start space-x-2">
                  {isRejected ? (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  )}
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-gray-900">
                      {isRejected
                        ? '当前记录已驳回'
                        : isAdopted
                        ? report.auditStatus === '已通过'
                          ? '当前记录已通过初审'
                          : '当前记录已完成审核'
                        : isWaitingTransfer
                        ? '当前记录待转办'
                        : isTransferred
                        ? '当前记录已转办'
                        : isInReview
                        ? '当前记录正在复核'
                        : '当前记录正在流转中'}
                    </p>
                    <p className="leading-relaxed text-gray-500">
                      该状态不需要当前账号继续审核。请在下方流转状态中查看具体处理节点、评分和驳回意见。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Workflow Status Timeline in a separate card below audit console */}
            <AuditFlowTimeline report={report} />
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
