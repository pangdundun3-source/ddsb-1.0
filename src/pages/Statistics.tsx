import React, { useState, useMemo } from 'react';
import {
  Users,
  FileText,
  CheckCircle2,
  Percent,
  Search,
  RotateCcw,
  Calendar,
  ShieldAlert,
  Clock,
  Activity,
  Building2,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  BarChart2,
  BarChart3,
  PieChart as PieChartIcon,
  Printer,
  ChevronRight,
  Layers,
  ArrowUpRight,
  Check,
  UserCheck,
  Send,
  ShieldCheck,
  Award,
  Coins,
  AlertTriangle,
  XCircle,
  Timer,
  CheckSquare,
  Trophy,
  Flame,
  Zap,
  Medal,
  Sparkles,
  ArrowRight,
  Info,
  SlidersHorizontal,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  FileEdit,
  Trash2,
  ExternalLink,
  Target,
  LineChart as LineChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

export type TimeDimension = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
export type ViewPerspective = 'submitter' | 'auditor' | 'global_org';

export const Statistics: React.FC = () => {
  // View mode: 'submitter' (上报员看板), 'auditor' (审核员看板), 'global_org' (全域大盘)
  const [viewPerspective, setViewPerspective] = useState<ViewPerspective>('submitter');
  const [timeDim, setTimeDim] = useState<TimeDimension>('week');
  const [startDate, setStartDate] = useState('2026-08-04');
  const [endDate, setEndDate] = useState('2026-08-11');
  const [selectedOrg, setSelectedOrg] = useState('all');
  const [pieTab, setPieTab] = useState<'category' | 'org' | 'channel'>('category');
  const [tableTab, setTableTab] = useState<'my_submit' | 'my_audit' | 'org' | 'category' | 'person'>('my_submit');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Submitter Trend Active Metrics Toggle
  const [submitterTrendMetrics, setSubmitterTrendMetrics] = useState({
    total: true,
    passed: true,
    rejected: true,
    onceRate: true,
    totalRate: true,
    score: true
  });

  // Auditor Trend Active Metrics Toggle
  const [auditorTrendMetrics, setAuditorTrendMetrics] = useState({
    total: true,
    passed: true,
    rejected: true,
    processRate: true,
    avgTime: true
  });

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Handle preset date switches
  const handleTimeDimChange = (dim: TimeDimension) => {
    setTimeDim(dim);
    if (dim === 'day') {
      setStartDate('2026-08-11');
      setEndDate('2026-08-11');
    } else if (dim === 'week') {
      setStartDate('2026-08-04');
      setEndDate('2026-08-11');
    } else if (dim === 'month') {
      setStartDate('2026-08-01');
      setEndDate('2026-08-31');
    } else if (dim === 'quarter') {
      setStartDate('2026-07-01');
      setEndDate('2026-09-30');
    } else if (dim === 'year') {
      setStartDate('2026-01-01');
      setEndDate('2026-12-31');
    }
  };

  const handleReset = () => {
    setTimeDim('week');
    setStartDate('2026-08-04');
    setEndDate('2026-08-11');
    setSelectedOrg('all');
    setSearchQuery('');
  };

  // Rich metrics database configured by time dimension with complete indicators from screenshot
  const metricsData = useMemo(() => {
    switch (timeDim) {
      case 'day':
        return {
          timeLabel: '今日 (2026-08-11)',
          // 上报员指标
          submitter: {
            // 待办提醒
            todoTotal: 2,
            draftCount: 1,
            rejectCount: 1,
            pendingAuditCount: 2,
            // 统计概览卡片 (含环比 MoM)
            totalSubmit: 4,
            totalSubmitMoM: '+33.3%',
            totalSubmitMoMType: 'up' as const,
            breakdown: {
              adopted: 2, // 已采纳
              rejected: 1, // 被驳回
              passedInProcess: 1, // 已通过 (流程未走完)
              pending: 0 // 待审核
            },
            submitRank: 2,
            submitRankTotal: 28,
            submitRankMoM: '↑ 提升 1 位',
            // 一次性通过率
            oncePassNumerator: 3,
            oncePassDenominator: 4,
            oncePassRate: '75.0%',
            oncePassRateMoM: '+12.5%',
            oncePassRank: 2,
            oncePassRankMoM: '↑ 提升 1 位',
            // 整体通过率
            overallPassNumerator: 3,
            overallPassDenominator: 4,
            overallPassRate: '75.0%',
            overallPassRateMoM: '+8.3%',
            overallPassRank: 2,
            overallPassRankMoM: '↑ 提升 1 位',
            // 综合总分 (所有上报总得分累加)
            totalScore: 364.8,
            totalScoreMoM: '+88.5 分',
            totalScoreRank: 2,
            totalScoreRankMoM: '↑ 提升 1 位',
            // 平均得分
            avgScore: 91.2,
            avgScoreMoM: '+1.5 分',
            avgScoreRank: 3,
            avgScoreRankMoM: '↑ 提升 1 位',
            // 趋势数据
            trend: [
              { label: '08:00', total: 1, passed: 1, rejected: 0, onceRate: 100, totalRate: 100, totalScore: 92.0, avgScore: 92.0 },
              { label: '11:00', total: 2, passed: 1, rejected: 1, onceRate: 50, totalRate: 50, totalScore: 176.0, avgScore: 88.0 },
              { label: '14:00', total: 3, passed: 2, rejected: 1, onceRate: 66.7, totalRate: 66.7, totalScore: 270.0, avgScore: 90.0 },
              { label: '17:00', total: 4, passed: 3, rejected: 1, onceRate: 75, totalRate: 75, totalScore: 364.8, avgScore: 91.2 }
            ],
            // 质效预警对标 (对标行业与全域平均数)
            warnings: {
              submitTotalDiff: { personal: '4 件', orgAvg: '2 件', value: '+2 件', percentage: '+100%', status: 'exceed', text: '超出机构平均日均报送量 2 件 (机构平均 2 件)' },
              passRateDiff: { personal: '75.0%', orgAvg: '66.7%', value: '+8.3%', percentage: '+8.3%', status: 'exceed', text: '高于机构平均整体通过率 8.3 个百分点 (机构平均 66.7%)' },
              scoreDiff: { personal: '91.2 分', orgAvg: '87.7 分', value: '+3.5 分', percentage: '+4.0%', status: 'better', text: '优于机构平均得分 3.5 分 (机构平均 87.7 分)' }
            },
            // 按上报任务统计分布 (截图标准环状图指标)
            taskDistribution: [
              { name: '一次性通过', value: 2, color: '#10B981', textColor: 'text-emerald-600' },
              { name: '返修通过', value: 1, color: '#06B6D4', textColor: 'text-cyan-600' },
              { name: '待审核', value: 0, color: '#94A3B8', textColor: 'text-slate-500' },
              { name: '驳回', value: 1, color: '#F43F5E', textColor: 'text-rose-600' }
            ],
            // 主要驳回原因
            rejectionReasons: [
              { reason: '现场图片缺少时间水印与位置佐证', count: 1, ratio: '100%', suggestion: '上报突发事件时建议使用带防伪水印的原图。' }
            ],
            rejectionDistribution: [
              { name: '佐证材料缺失', value: 50, color: '#EF4444' },
              { name: '诉求要点未归纳', value: 30, color: '#F59E0B' },
              { name: '政策依据不充分', value: 20, color: '#3B82F6' }
            ],
            todos: [
              { id: 't-1', title: '西坝区某主干道路灯突发故障排查', type: '草稿', reason: '等待交警部门补充现场车流影响说明', time: '10:30' },
              { id: 't-2', title: '关于商户违规占道经营网格巡查记录', type: '已驳回', reason: '缺少现场清理整改前后的对比图片', time: '14:20' }
            ]
          },
          // 审核员指标
          auditor: {
            // 待办提醒
            auditPendingCount: 3,
            // 统计概览卡片 (含环比)
            auditTotal: 12,
            auditTotalMoM: '+20.0%',
            auditBreakdown: {
              passed: 11,
              rejected: 1
            },
            auditRank: 2,
            auditRankTotal: 16,
            auditRankMoM: '↑ 提升 1 位',
            // 审核处理率
            processRateNumerator: 12,
            processRateDenominator: 15,
            processRate: '80.0%',
            processRateMoM: '+5.0%',
            processRateRank: 2,
            processRateRankMoM: '↑ 提升 1 位',
            // 平均审核时长
            avgTimeMin: 7.2,
            avgTimeMoM: '-10.0%',
            avgTimeRank: 1,
            avgTimeRankMoM: '↑ 提升 1 位',
            // 按审核任务统计分布 (截图标准环状图指标)
            taskDistribution: [
              { name: '审核通过', value: 11, color: '#10B981', textColor: 'text-emerald-600' },
              { name: '审核驳回', value: 1, color: '#F43F5E', textColor: 'text-rose-600' },
              { name: '待审核', value: 3, color: '#94A3B8', textColor: 'text-slate-500' }
            ],
            // 审核预警 (对标平均数)
            warnings: {
              auditTotalDiff: { personal: '12 件', orgAvg: '8 件', value: '+4 件', percentage: '+50.0%', status: 'exceed', text: '超出全市审核员平均数 4 件 (机构平均 8 件)' },
              processRateDiff: { personal: '80.0%', orgAvg: '71.5%', value: '+8.5%', percentage: '+8.5%', status: 'exceed', text: '超出平均处理率 8.5 个百分点 (机构平均 71.5%)' },
              avgTimeDiff: { personal: '7.2 分钟', orgAvg: '12.4 分钟', value: '-5.2 分钟', percentage: '-41.9%', status: 'better', text: '审核耗时比机构平均用时(12.4分)快 5.2 分钟' }
            },
            trend: [
              { label: '08:00', total: 2, passed: 2, rejected: 0, processRate: 100, avgTime: 6.5 },
              { label: '11:00', total: 6, passed: 5, rejected: 1, processRate: 85.7, avgTime: 7.0 },
              { label: '14:00', total: 9, passed: 8, rejected: 1, processRate: 90, avgTime: 7.5 },
              { label: '17:00', total: 12, passed: 11, rejected: 1, processRate: 80, avgTime: 7.2 }
            ]
          }
        };

      case 'week':
      default:
        return {
          timeLabel: '本周 (08-04 至 08-11)',
          // 上报员指标 (与截图 1/11、11件等高度吻合)
          submitter: {
            // 待办提醒
            todoTotal: 5,
            draftCount: 3,
            rejectCount: 2,
            pendingAuditCount: 7,
            // 统计概览卡片 (含环比 MoM)
            totalSubmit: 11,
            totalSubmitMoM: '+15.8%',
            totalSubmitMoMType: 'up' as const,
            breakdown: {
              adopted: 1, // 已采纳
              rejected: 2, // 被驳回
              passedInProcess: 1, // 已通过 (流程未走完)
              pending: 7 // 待审核
            },
            submitRank: 3,
            submitRankTotal: 28,
            submitRankMoM: '↑ 提升 1 位',
            // 一次性通过率 (1/11 为样例，实际本期为 9/11 = 81.8%)
            oncePassNumerator: 9,
            oncePassDenominator: 11,
            oncePassRate: '81.8%',
            oncePassRateMoM: '+6.5%',
            oncePassRank: 2,
            oncePassRankMoM: '↑ 提升 1 位',
            // 整体通过率
            overallPassNumerator: 10,
            overallPassDenominator: 11,
            overallPassRate: '90.9%',
            overallPassRateMoM: '+4.2%',
            overallPassRank: 1,
            overallPassRankMoM: '↑ 提升 2 位',
            // 综合总分 (所有上报总得分累加: 11件 x 均分92.8)
            totalScore: 1020.8,
            totalScoreMoM: '+185.0 分',
            totalScoreRank: 2,
            totalScoreRankMoM: '↑ 提升 1 位',
            // 平均得分
            avgScore: 92.8,
            avgScoreMoM: '+1.6 分',
            avgScoreRank: 3,
            avgScoreRankMoM: '↑ 提升 1 位',
            // 趋势数据
            trend: [
              { label: '周一', total: 2, passed: 2, rejected: 0, onceRate: 100, totalRate: 100, totalScore: 190.0, avgScore: 95.0 },
              { label: '周二', total: 4, passed: 3, rejected: 1, onceRate: 75, totalRate: 75, totalScore: 364.0, avgScore: 91.0 },
              { label: '周三', total: 6, passed: 5, rejected: 1, onceRate: 83.3, totalRate: 83.3, totalScore: 552.0, avgScore: 92.0 },
              { label: '周四', total: 8, passed: 7, rejected: 1, onceRate: 87.5, totalRate: 87.5, totalScore: 744.0, avgScore: 93.0 },
              { label: '周五', total: 9, passed: 8, rejected: 1, onceRate: 88.9, totalRate: 88.9, totalScore: 846.0, avgScore: 94.0 },
              { label: '周六', total: 10, passed: 9, rejected: 1, onceRate: 80.0, totalRate: 90.0, totalScore: 925.0, avgScore: 92.5 },
              { label: '周日', total: 11, passed: 10, rejected: 2, onceRate: 81.8, totalRate: 90.9, totalScore: 1020.8, avgScore: 92.8 }
            ],
            // 质效预警对标 (对标行业与全域平均数)
            warnings: {
              submitTotalDiff: { personal: '11 件', orgAvg: '6 件', value: '+5 件', percentage: '+83.3%', status: 'exceed', text: '大幅超出机构平均数 5 件 (机构平均 6 件)' },
              passRateDiff: { personal: '90.9%', orgAvg: '80.0%', value: '+10.9%', percentage: '+10.9%', status: 'exceed', text: '高出机构平均整体通过率 10.9 个百分点 (机构平均 80.0%)' },
              scoreDiff: { personal: '92.8 分', orgAvg: '88.6 分', value: '+4.2 分', percentage: '+4.7%', status: 'better', text: '优于机构平均得分 4.2 分 (机构平均 88.6 分)' }
            },
            // 按上报任务统计分布 (截图标准环状图指标: 一次性通过 0件/返修通过 1件/待审核 9件/驳回 1件)
            taskDistribution: [
              { name: '一次性通过', value: 0, color: '#10B981', textColor: 'text-emerald-600' },
              { name: '返修通过', value: 1, color: '#06B6D4', textColor: 'text-cyan-600' },
              { name: '待审核', value: 9, color: '#94A3B8', textColor: 'text-slate-500' },
              { name: '驳回', value: 1, color: '#F43F5E', textColor: 'text-rose-600' }
            ],
            // 风险建议与主要驳回原因展示
            rejectionReasons: [
              { reason: '材料缺少权威出处与关键现场佐证', count: 4, ratio: '44.4%', suggestion: '建议报送突发类及网络谣言线索时，附带首发链接及现场核查工单。' },
              { reason: '信息要素不完整，缺少涉及主体或时间轴', count: 3, ratio: '33.3%', suggestion: '需按照标准化模板填齐发生时间、地点、影响面及现场应急处置措施。' },
              { reason: '处置建议针对性不足，缺乏部门协同机制', count: 2, ratio: '22.3%', suggestion: '建议在“研判及对策建议”中明确责任委办局与具体限时响应举措。' }
            ],
            rejectionDistribution: [
              { name: '佐证材料缺失', value: 50, color: '#EF4444' },
              { name: '诉求要点未归纳', value: 30, color: '#F59E0B' },
              { name: '政策依据不充分', value: 20, color: '#3B82F6' }
            ],
            todos: [
              { id: 't-1', title: '公办幼儿园托育服务收费民意调查', type: '草稿', reason: '正在补充政策依据与周边私立园对比数据', time: '2026-08-11 09:15' },
              { id: 't-2', title: '关于辖区内老旧电梯故障频发的排查草稿', type: '草稿', reason: '正在等待特种设备安检报告', time: '2026-08-10 16:40' },
              { id: 't-3', title: '老旧小区改造政策解读及反馈收集', type: '已驳回', reason: '信息不完整，请补充政策出资比例及群众诉求原图', time: '2026-08-09 11:20' },
              { id: 't-4', title: '关于南坝商业街夜市噪音扰民的网格排查', type: '草稿', reason: '拟补充城管执法队联合巡查方案', time: '2026-08-08 14:00' },
              { id: 't-5', title: '主干道早高峰红绿灯配时优化建议报送', type: '已驳回', reason: '缺少早晚高峰车流量测算图与路口监控佐证', time: '2026-08-07 10:30' }
            ]
          },
          // 审核员指标
          auditor: {
            // 待办提醒
            auditPendingCount: 5,
            // 统计概览卡片 (含环比)
            auditTotal: 86,
            auditTotalMoM: '+18.2%',
            auditBreakdown: {
              passed: 78,
              rejected: 8
            },
            auditRank: 2,
            auditRankTotal: 16,
            auditRankMoM: '↑ 提升 1 位',
            // 审核处理率 (如 86/91)
            processRateNumerator: 86,
            processRateDenominator: 91,
            processRate: '94.5%',
            processRateMoM: '+3.8%',
            processRateRank: 1,
            processRateRankMoM: '↑ 提升 1 位',
            // 平均审核时长
            avgTimeMin: 6.8,
            avgTimeMoM: '-17.1%',
            avgTimeRank: 1,
            avgTimeRankMoM: '↑ 提升 1 位',
            // 按审核任务统计分布 (截图标准环状图指标: 通过 78件/驳回 8件/待审核 5件)
            taskDistribution: [
              { name: '审核通过', value: 78, color: '#10B981', textColor: 'text-emerald-600' },
              { name: '审核驳回', value: 8, color: '#F43F5E', textColor: 'text-rose-600' },
              { name: '待审核', value: 5, color: '#94A3B8', textColor: 'text-slate-500' }
            ],
            // 审核预警 (对标平均数)
            warnings: {
              auditTotalDiff: { personal: '86 件', orgAvg: '54 件', value: '+32 件', percentage: '+59.3%', status: 'exceed', text: '大幅超出机构平均数 32 件 (机构平均 54 件)' },
              processRateDiff: { personal: '94.5%', orgAvg: '82.1%', value: '+12.4%', percentage: '+12.4%', status: 'exceed', text: '高出机构平均处理率 12.4 个百分点 (机构平均 82.1%)' },
              avgTimeDiff: { personal: '6.8 分钟', orgAvg: '14.5 分钟', value: '-7.7 分钟', percentage: '-53.1%', status: 'better', text: '优于机构平均审核用时 7.7 分钟 (机构平均 14.5 分钟)' }
            },
            trend: [
              { label: '周一', total: 11, passed: 10, rejected: 1, processRate: 100, avgTime: 6.2 },
              { label: '周二', total: 14, passed: 13, rejected: 1, processRate: 93.3, avgTime: 6.5 },
              { label: '周三', total: 16, passed: 15, rejected: 1, processRate: 94.1, avgTime: 6.8 },
              { label: '周四', total: 10, passed: 9, rejected: 1, processRate: 90.9, avgTime: 7.1 },
              { label: '周五', total: 18, passed: 16, rejected: 2, processRate: 94.7, avgTime: 6.9 },
              { label: '周六', total: 7, passed: 6, rejected: 1, processRate: 87.5, avgTime: 7.4 },
              { label: '周日', total: 10, passed: 9, rejected: 1, processRate: 100, avgTime: 6.8 }
            ]
          }
        };

      case 'month':
        return {
          timeLabel: '本月 (2026年8月)',
          submitter: {
            todoTotal: 7,
            draftCount: 4,
            rejectCount: 3,
            pendingAuditCount: 16,
            totalSubmit: 38,
            totalSubmitMoM: '+22.5%',
            totalSubmitMoMType: 'up' as const,
            breakdown: {
              adopted: 19,
              rejected: 5,
              passedInProcess: 4,
              pending: 10
            },
            submitRank: 2,
            submitRankTotal: 28,
            submitRankMoM: '↑ 提升 1 位',
            oncePassNumerator: 32,
            oncePassDenominator: 38,
            oncePassRate: '84.2%',
            oncePassRateMoM: '+4.8%',
            oncePassRank: 2,
            oncePassRankMoM: '↑ 提升 1 位',
            overallPassNumerator: 35,
            overallPassDenominator: 38,
            overallPassRate: '92.1%',
            overallPassRateMoM: '+3.5%',
            overallPassRank: 1,
            overallPassRankMoM: '↑ 提升 1 位',
            totalScore: 3553.0,
            totalScoreMoM: '+650.0 分',
            totalScoreRank: 1,
            totalScoreRankMoM: '↑ 登顶第 1',
            avgScore: 93.5,
            avgScoreMoM: '+1.2 分',
            avgScoreRank: 2,
            avgScoreRankMoM: '↑ 提升 1 位',
            trend: [
              { label: '第1周', total: 8, passed: 7, rejected: 1, onceRate: 87.5, totalRate: 87.5, totalScore: 744.0, avgScore: 93.0 },
              { label: '第2周', total: 10, passed: 9, rejected: 1, onceRate: 80.0, totalRate: 90.0, totalScore: 925.0, avgScore: 92.5 },
              { label: '第3周', total: 11, passed: 10, rejected: 1, onceRate: 81.8, totalRate: 90.9, totalScore: 1031.8, avgScore: 93.8 },
              { label: '第4周', total: 9, passed: 9, rejected: 0, onceRate: 100, totalRate: 100, totalScore: 851.4, avgScore: 94.6 }
            ],
            // 质效预警对标 (对标行业与全域平均数)
            warnings: {
              submitTotalDiff: { personal: '38 件', orgAvg: '24 件', value: '+14 件', percentage: '+58.3%', status: 'exceed', text: '大幅超出机构平均上报数 14 件 (机构平均 24 件)' },
              passRateDiff: { personal: '92.1%', orgAvg: '82.5%', value: '+9.6%', percentage: '+9.6%', status: 'exceed', text: '高于机构平均整体通过率 9.6 个百分点 (机构平均 82.5%)' },
              scoreDiff: { personal: '95.0 分', orgAvg: '91.2 分', value: '+3.8 分', percentage: '+4.2%', status: 'better', text: '优于机构平均得分 3.8 分 (机构平均 91.2 分)' }
            },
            // 按上报任务统计分布
            taskDistribution: [
              { name: '一次性通过', value: 25, color: '#10B981', textColor: 'text-emerald-600' },
              { name: '返修通过', value: 7, color: '#06B6D4', textColor: 'text-cyan-600' },
              { name: '待审核', value: 3, color: '#94A3B8', textColor: 'text-slate-500' },
              { name: '驳回', value: 3, color: '#F43F5E', textColor: 'text-rose-600' }
            ],
            rejectionReasons: [
              { reason: '材料缺少权威出处与关键现场佐证', count: 12, ratio: '46.1%', suggestion: '持续加强现场水印证据链与第一信源核验。' },
              { reason: '信息要素不全，缺少涉及主体或时间轴', count: 8, ratio: '30.8%', suggestion: '严格把关五要素（何时、何地、何人、何事、何因）。' },
              { reason: '处置建议针对性不足', count: 6, ratio: '23.1%', suggestion: '强化多部门协同闭环机制。' }
            ],
            rejectionDistribution: [
              { name: '佐证材料缺失', value: 50, color: '#EF4444' },
              { name: '诉求要点未归纳', value: 30, color: '#F59E0B' },
              { name: '政策依据不充分', value: 20, color: '#3B82F6' }
            ],
            todos: [
              { id: 't-1', title: '公办幼儿园托育服务收费民意调查', type: '草稿', reason: '补充物价政策对比', time: '08-11' },
              { id: 't-2', title: '老旧电梯故障频发排查', type: '草稿', reason: '等待维保合格证', time: '08-10' },
              { id: 't-3', title: '老旧小区改造加装电梯矛盾', type: '已驳回', reason: '缺少出资比例细则', time: '08-09' }
            ]
          },
          auditor: {
            auditPendingCount: 12,
            auditTotal: 326,
            auditTotalMoM: '+16.4%',
            auditBreakdown: {
              passed: 304,
              rejected: 22
            },
            auditRank: 2,
            auditRankTotal: 16,
            auditRankMoM: '↑ 提升 1 位',
            processRateNumerator: 326,
            processRateDenominator: 338,
            processRate: '96.4%',
            processRateMoM: '+2.1%',
            processRateRank: 1,
            processRateRankMoM: '↑ 提升 1 位',
            avgTimeMin: 7.1,
            avgTimeMoM: '-7.8%',
            avgTimeRank: 1,
            avgTimeRankMoM: '↑ 提升 1 位',
            // 按审核任务统计分布
            taskDistribution: [
              { name: '审核通过', value: 304, color: '#10B981', textColor: 'text-emerald-600' },
              { name: '审核驳回', value: 22, color: '#F43F5E', textColor: 'text-rose-600' },
              { name: '待审核', value: 12, color: '#94A3B8', textColor: 'text-slate-500' }
            ],
            // 审核预警 (对标平均数)
            warnings: {
              auditTotalDiff: { personal: '326 件', orgAvg: '214 件', value: '+112 件', percentage: '+52.3%', status: 'exceed', text: '大幅超出机构平均审核总量 (机构平均 214 件)' },
              processRateDiff: { personal: '96.4%', orgAvg: '84.6%', value: '+11.8%', percentage: '+11.8%', status: 'exceed', text: '高于机构平均处理率 (机构平均 84.6%)' },
              avgTimeDiff: { personal: '7.1 分钟', orgAvg: '15.0 分钟', value: '-7.9 分钟', percentage: '-52.6%', status: 'better', text: '耗时比机构平均值(15.0分)提速超 50%' }
            },
            trend: [
              { label: '第1周', total: 75, passed: 70, rejected: 5, processRate: 96.2, avgTime: 7.4 },
              { label: '第2周', total: 84, passed: 78, rejected: 6, processRate: 96.6, avgTime: 6.8 },
              { label: '第3周', total: 88, passed: 82, rejected: 6, processRate: 96.7, avgTime: 7.0 },
              { label: '第4周', total: 79, passed: 74, rejected: 5, processRate: 96.3, avgTime: 7.2 }
            ]
          }
        };

      case 'quarter':
      case 'year':
      case 'custom':
        return {
          timeLabel: '季度/年度累计 (2026年)',
          submitter: {
            todoTotal: 14,
            draftCount: 9,
            rejectCount: 5,
            pendingAuditCount: 21,
            totalSubmit: 112,
            totalSubmitMoM: '+28.4%',
            totalSubmitMoMType: 'up' as const,
            breakdown: {
              adopted: 86,
              rejected: 12,
              passedInProcess: 8,
              pending: 6
            },
            submitRank: 1,
            submitRankTotal: 28,
            submitRankMoM: '🥇 稳居第 1',
            oncePassNumerator: 96,
            oncePassDenominator: 112,
            oncePassRate: '85.7%',
            oncePassRateMoM: '+5.2%',
            oncePassRank: 1,
            oncePassRankMoM: '↑ 提升 2 位',
            overallPassNumerator: 104,
            overallPassDenominator: 112,
            overallPassRate: '92.8%',
            overallPassRateMoM: '+3.1%',
            overallPassRank: 1,
            overallPassRankMoM: '↑ 提升 1 位',
            totalScore: 10550.0,
            totalScoreMoM: '+2340.0 分',
            totalScoreRank: 1,
            totalScoreRankMoM: '🥇 标兵第一',
            avgScore: 94.2,
            avgScoreMoM: '+1.8 分',
            avgScoreRank: 1,
            avgScoreRankMoM: '↑ 提升 1 位',
            trend: [
              { label: '5月', total: 28, passed: 26, rejected: 2, onceRate: 85.7, totalRate: 92.8, totalScore: 2618.0, avgScore: 93.5 },
              { label: '6月', total: 34, passed: 31, rejected: 3, onceRate: 82.3, totalRate: 91.1, totalScore: 3189.2, avgScore: 93.8 },
              { label: '7月', total: 32, passed: 30, rejected: 2, onceRate: 87.5, totalRate: 93.7, totalScore: 3024.0, avgScore: 94.5 },
              { label: '8月', total: 38, passed: 35, rejected: 3, onceRate: 86.8, totalRate: 92.1, totalScore: 3610.0, avgScore: 95.0 }
            ],
            // 质效预警对标 (对标行业与全域平均数)
            warnings: {
              submitTotalDiff: { personal: '112 件', orgAvg: '70 件', value: '+42 件', percentage: '+60.0%', status: 'exceed', text: '大幅领跑机构平均上报量 42 件 (机构平均 70 件)' },
              passRateDiff: { personal: '92.9%', orgAvg: '84.0%', value: '+8.8%', percentage: '+8.8%', status: 'exceed', text: '持续保持 90%+ 高水平采纳通过率 (机构平均 84.0%)' },
              scoreDiff: { personal: '94.2 分', orgAvg: '89.7 分', value: '+4.5 分', percentage: '+5.0%', status: 'better', text: '综合平均分优于机构平均得分 4.5 分 (机构平均 89.7 分)' }
            },
            // 按上报任务统计分布
            taskDistribution: [
              { name: '一次性通过', value: 78, color: '#10B981', textColor: 'text-emerald-600' },
              { name: '返修通过', value: 18, color: '#06B6D4', textColor: 'text-cyan-600' },
              { name: '待审核', value: 8, color: '#94A3B8', textColor: 'text-slate-500' },
              { name: '驳回', value: 8, color: '#F43F5E', textColor: 'text-rose-600' }
            ],
            rejectionReasons: [
              { reason: '材料缺少权威出处与关键现场佐证', count: 35, ratio: '43.7%', suggestion: '建议报送突发类及网络谣言线索时强化多角度核验。' },
              { reason: '信息要素不完整，缺少涉及主体', count: 26, ratio: '32.5%', suggestion: '规范要素报送规范。' },
              { reason: '处置建议针对性不足', count: 19, ratio: '23.8%', suggestion: '健全与业务部门沟通联动。' }
            ],
            rejectionDistribution: [
              { name: '佐证材料缺失', value: 50, color: '#EF4444' },
              { name: '诉求要点未归纳', value: 30, color: '#F59E0B' },
              { name: '政策依据不充分', value: 20, color: '#3B82F6' }
            ],
            todos: [
              { id: 't-1', title: '公办幼儿园托育服务收费民意调查', type: '草稿', reason: '补充物价政策对比', time: '08-11' },
              { id: 't-2', title: '老旧电梯故障频发排查', type: '草稿', reason: '等待维保合格证', time: '08-10' }
            ]
          },
          auditor: {
            auditPendingCount: 18,
            auditTotal: 980,
            auditTotalMoM: '+21.5%',
            auditBreakdown: {
              passed: 915,
              rejected: 65
            },
            auditRank: 1,
            auditRankTotal: 16,
            auditRankMoM: '🥇 榜首第一',
            processRateNumerator: 980,
            processRateDenominator: 998,
            processRate: '98.2%',
            processRateMoM: '+1.5%',
            processRateRank: 1,
            processRateRankMoM: '↑ 提升 1 位',
            avgTimeMin: 6.9,
            avgTimeMoM: '-11.5%',
            avgTimeRank: 1,
            avgTimeRankMoM: '↑ 提升 2 位',
            // 按审核任务统计分布
            taskDistribution: [
              { name: '审核通过', value: 915, color: '#10B981', textColor: 'text-emerald-600' },
              { name: '审核驳回', value: 65, color: '#F43F5E', textColor: 'text-rose-600' },
              { name: '待审核', value: 18, color: '#94A3B8', textColor: 'text-slate-500' }
            ],
            // 审核预警 (对标平均数)
            warnings: {
              auditTotalDiff: { personal: '980 件', orgAvg: '640 件', value: '+340 件', percentage: '+53.1%', status: 'exceed', text: '大幅领先全员平均审核总量 (机构平均 640 件)' },
              processRateDiff: { personal: '98.2%', orgAvg: '88.0%', value: '+10.2%', percentage: '+10.2%', status: 'exceed', text: '高于机构平均处理率 (机构平均 88.0%)' },
              avgTimeDiff: { personal: '6.9 分钟', orgAvg: '15.4 分钟', value: '-8.5 分钟', percentage: '-55.2%', status: 'better', text: '响应用时比机构平均用时(15.4分)缩短过半' }
            },
            trend: [
              { label: '5月', total: 210, passed: 195, rejected: 15, processRate: 98.1, avgTime: 7.2 },
              { label: '6月', total: 245, passed: 230, rejected: 15, processRate: 98.4, avgTime: 7.0 },
              { label: '7月', total: 265, passed: 248, rejected: 17, processRate: 98.1, avgTime: 6.8 },
              { label: '8月', total: 260, passed: 242, rejected: 18, processRate: 98.1, avgTime: 6.7 }
            ]
          }
        };
    }
  }, [timeDim]);

  const currentSubmitter = metricsData.submitter;
  const currentAuditor = metricsData.auditor;

  // Submitter Category Distribution
  const submitterCategories = [
    { name: '突发网络舆情', value: 45, color: '#1E5ABB' },
    { name: '民生诉求关切', value: 35, color: '#10B981' },
    { name: '涉稳风险预警', value: 12, color: '#F59E0B' },
    { name: '政策与规章', value: 8, color: '#8B5CF6' }
  ];

  // My Submit Records Data
  const mySubmitRows = [
    { id: 'SB-20260811-01', title: '关于某区水务改造噪音扰民问题舆情线索', category: '民生诉求', time: '2026-08-11 10:15', status: '已采纳', score: 95, allowance: '¥50', auditor: '李四 (市委宣传部)' },
    { id: 'SB-20260810-03', title: '西城区部分住宅小区光纤网络突发故障反馈', category: '突发事件', time: '2026-08-10 14:20', status: '已采纳', score: 90, allowance: '¥30', auditor: '系统自动/管理员' },
    { id: 'SB-20260809-02', title: '西坝大道高峰期交通信号灯配时优化诉求', category: '民生诉求', time: '2026-08-09 11:30', status: '已采纳', score: 88, allowance: '¥30', auditor: '王五 (市交警支队)' },
    { id: 'SB-20260808-05', title: '网络某短视频虚假夸大商超物价谣言查证', category: '突发事件', time: '2026-08-08 16:45', status: '已采纳', score: 98, allowance: '¥100', auditor: '赵六 (网信办)' },
    { id: 'SB-20260807-01', title: '某小区业主群内部违建投诉情况反映', category: '民生诉求', time: '2026-08-07 09:10', status: '被驳回', score: '--', allowance: '¥0', auditor: '张三 (经办审核)', rejectReason: '线索材料缺少关键现场佐证，建议补充图片后重报' }
  ];

  // My Audit Records Data
  const myAuditRows = [
    { id: 'AD-20260811-09', reportTitle: '东湖区某重点高中教师补课网络不实发帖核查', submitter: '王建国 (区教育局)', submitOrg: '东湖区教育局', auditResult: '已通过', auditTime: '2026-08-11 11:05', costTime: '6.2分', action: '采纳并归档' },
    { id: 'AD-20260810-14', reportTitle: '滨江路下穿隧道暴雨积水应急疏导情况通报', submitter: '陈小明 (交管局)', submitOrg: '市公安交管局', auditResult: '已通过', auditTime: '2026-08-10 16:12', costTime: '8.5分', action: '采纳并转办' },
    { id: 'AD-20260809-08', reportTitle: '关于某品牌牛奶质量抽检不合格网络传言', submitter: '刘伟 (市监局)', submitOrg: '市市场监管局', auditResult: '已通过', auditTime: '2026-08-09 10:40', costTime: '9.1分', action: '加急研判' },
    { id: 'AD-20260808-12', reportTitle: '某社区老年人食堂饭菜定价合理性网民讨论', submitter: '张丽 (民政局)', submitOrg: '市民政局', auditResult: '被驳回', auditTime: '2026-08-08 15:30', costTime: '5.4分', action: '退回补充证据', rejectReason: '未附发帖原文链接及网络传播量数据' },
    { id: 'AD-20260807-04', reportTitle: '市第一医院门诊预约系统升级维护网络提醒', submitter: '周强 (卫健委)', submitOrg: '市卫生健康委', auditResult: '已通过', auditTime: '2026-08-07 14:15', costTime: '7.8分', action: '审核通过' }
  ];

  // Sub-orgs detailed table
  const subOrgRows = [
    { rank: 1, name: '市发展改革委', class: '政务部门', total: 450, onceRate: '92.4%', totalRate: '95.1%', avgTime: '11.2分', score: 98.2, status: '卓越' },
    { rank: 2, name: '台中市网信办', class: '网安指挥', total: 380, onceRate: '91.8%', totalRate: '94.2%', avgTime: '10.5分', score: 96.5, status: '卓越' },
    { rank: 3, name: '市财政局', class: '政务部门', total: 310, onceRate: '88.5%', totalRate: '91.9%', avgTime: '13.8分', score: 92.4, status: '优秀' },
    { rank: 4, name: '市科技局', class: '政务部门', total: 290, onceRate: '86.2%', totalRate: '90.0%', avgTime: '14.5分', score: 89.8, status: '良好' },
    { rank: 5, name: '西区网信局', class: '区县机构', total: 245, onceRate: '84.0%', totalRate: '88.9%', avgTime: '16.2分', score: 87.5, status: '良好' }
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-lg border border-blue-400/30 flex items-center space-x-2 text-xs animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header & Unified Perspective + Time Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#1E5ABB] text-white rounded-xl shadow-2xs">
              <BarChart2 className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">统计管理与效能分析</h2>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => showToast('已成功导出【统计管理与多维效能分析报表.xlsx】！')}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 shadow-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>导出统计报表</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>打印统计报告</span>
            </button>
          </div>
        </div>

        {/* TIME DIMENSION & FILTER CONTROLS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          {/* Quick Time Presets & Range */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Quick Time Presets */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <span className="text-gray-400 font-bold px-1.5 text-[11px] flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>统计周期:</span>
              </span>
              {(['day', 'week', 'month', 'quarter', 'year', 'custom'] as TimeDimension[]).map((dim) => (
                <button
                  key={dim}
                  onClick={() => handleTimeDimChange(dim)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    timeDim === dim
                      ? 'bg-white text-[#1E5ABB] shadow-2xs'
                      : 'text-gray-600 hover:text-blue-700'
                  }`}
                >
                  {dim === 'day' ? '日(今日)' : dim === 'week' ? '周(本周)' : dim === 'month' ? '月(本月)' : dim === 'quarter' ? '季度' : dim === 'year' ? '年度' : '自定义'}
                </button>
              ))}
            </div>

            {/* Custom Range Picker */}
            <div className="flex items-center space-x-1 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setTimeDim('custom');
                }}
                className="w-24 focus:outline-none text-gray-700 font-mono text-[11px]"
              />
              <span className="text-gray-400">至</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setTimeDim('custom');
                }}
                className="w-24 focus:outline-none text-gray-700 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Reset */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleReset}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-gray-600 font-bold rounded-lg border border-gray-200 cursor-pointer transition-colors"
              title="重置筛选"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 上报员趋势图与报送统计 */}
      {/* ========================================================================= */}
      <div className="space-y-5 animate-in fade-in duration-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 左侧 2 列: 上报员趋势图 (包含全部6大指标) */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center space-x-2">
                  <Send className="w-4 h-4 text-[#1E5ABB]" />
                  <span>上报员趋势图</span>
                  <span className="bg-blue-50 text-[#1E5ABB] text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                    上报质效走势
                  </span>
                </h3>
              </div>

                {/* Metric Checkboxes Filter */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    onClick={() => setSubmitterTrendMetrics((p) => ({ ...p, total: !p.total }))}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                      submitterTrendMetrics.total ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-slate-50 text-gray-400 border-gray-200'
                    }`}
                  >
                    ● 上报总量
                  </button>
                  <button
                    onClick={() => setSubmitterTrendMetrics((p) => ({ ...p, passed: !p.passed }))}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                      submitterTrendMetrics.passed ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-50 text-gray-400 border-gray-200'
                    }`}
                  >
                    ● 通过量
                  </button>
                  <button
                    onClick={() => setSubmitterTrendMetrics((p) => ({ ...p, rejected: !p.rejected }))}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                      submitterTrendMetrics.rejected ? 'bg-rose-50 text-rose-700 border-rose-300' : 'bg-slate-50 text-gray-400 border-gray-200'
                    }`}
                  >
                    ● 驳回量
                  </button>
                  <button
                    onClick={() => setSubmitterTrendMetrics((p) => ({ ...p, onceRate: !p.onceRate }))}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                      submitterTrendMetrics.onceRate ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-slate-50 text-gray-400 border-gray-200'
                    }`}
                  >
                    ● 一次性通过率
                  </button>
                  <button
                    onClick={() => setSubmitterTrendMetrics((p) => ({ ...p, totalRate: !p.totalRate }))}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                      submitterTrendMetrics.totalRate ? 'bg-teal-50 text-teal-700 border-teal-300' : 'bg-slate-50 text-gray-400 border-gray-200'
                    }`}
                  >
                    ● 整体通过率
                  </button>
                  <button
                    onClick={() => setSubmitterTrendMetrics((p) => ({ ...p, score: !p.score }))}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                      submitterTrendMetrics.score ? 'bg-orange-50 text-orange-700 border-orange-300' : 'bg-slate-50 text-gray-400 border-gray-200'
                    }`}
                  >
                    ● 平均得分
                  </button>
                </div>
              </div>

              {/* Chart */}
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentSubmitter.trend} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                    <YAxis yAxisId="left" stroke="#64748b" fontSize={11} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#64748b" fontSize={11} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                      labelStyle={{ color: '#93c5fd', fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    {submitterTrendMetrics.total && (
                      <Line yAxisId="left" type="monotone" dataKey="total" name="上报总量" stroke="#1E5ABB" strokeWidth={2.5} dot={{ r: 4 }} />
                    )}
                    {submitterTrendMetrics.passed && (
                      <Line yAxisId="left" type="monotone" dataKey="passed" name="通过量" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                    )}
                    {submitterTrendMetrics.rejected && (
                      <Line yAxisId="left" type="monotone" dataKey="rejected" name="驳回量" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
                    )}
                    {submitterTrendMetrics.onceRate && (
                      <Line yAxisId="right" type="monotone" dataKey="onceRate" name="一次性通过率(%)" stroke="#8B5CF6" strokeDasharray="4 4" strokeWidth={2} />
                    )}
                    {submitterTrendMetrics.totalRate && (
                      <Line yAxisId="right" type="monotone" dataKey="totalRate" name="整体通过率(%)" stroke="#0D9488" strokeWidth={2} />
                    )}
                    {submitterTrendMetrics.score && (
                      <Line yAxisId="right" type="monotone" dataKey="avgScore" name="平均得分" stroke="#EA580C" strokeDasharray="3 3" strokeWidth={2} dot={{ r: 3 }} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 右侧 1 列: 报送统计 (严格对标截图规范，含环状图与全量质效得分) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                {/* 标题区域: 包含角色名称与图标 */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-extrabold text-sm text-gray-900 tracking-tight flex items-center space-x-2">
                    <PieChartIcon className="w-4 h-4 text-[#1E5ABB]" />
                    <span>上报员报送统计</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-normal">
                    统计时间范围 {startDate.replace(/-/g, '/')} - {endDate.replace(/-/g, '/')}
                  </span>
                </div>

                {/* 环状图与4项状态列表卡片: 左环右列表 */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                  {/* 左侧环状图 */}
                  <div className="w-36 h-36 relative shrink-0 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={currentSubmitter.taskDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={42}
                          outerRadius={62}
                          startAngle={90}
                          endAngle={-270}
                          paddingAngle={currentSubmitter.taskDistribution.filter(i => i.value > 0).length > 1 ? 2 : 0}
                          dataKey="value"
                        >
                          {currentSubmitter.taskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val, name) => [`${val} 件`, name]} />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* 环状图中心文字: 累计上报 X 件 */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-[11px] text-gray-500 font-medium leading-none">累计上报</span>
                      <span className="text-2xl font-black text-gray-900 font-mono tracking-tight my-0.5">
                        {currentSubmitter.totalSubmit}
                      </span>
                      <span className="text-[10px] text-gray-400 leading-none">件</span>
                    </div>
                  </div>

                  {/* 右侧4项状态卡片列表: 严格对标截图 */}
                  <div className="flex-1 w-full space-y-2">
                    {currentSubmitter.taskDistribution.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-slate-50/80 hover:bg-slate-100/80 transition-colors px-3 py-2 rounded-xl border border-slate-100/90 text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-gray-700 font-medium">{item.name}</span>
                        </div>
                        <span className={`font-mono font-bold text-xs ${item.textColor || 'text-gray-900'}`}>
                          {item.value} 件
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 底部指标卡片: 整体通过率、一次性通过率、综合总分、平均得分 */}
                <div className="bg-slate-50/70 rounded-2xl p-3.5 border border-slate-200/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="flex flex-col justify-between space-y-1">
                    <span className="text-gray-500 text-[11px]">整体通过率</span>
                    <span className="text-sm font-black font-mono text-emerald-600">
                      {currentSubmitter.overallPassRate}
                    </span>
                  </div>
                  <div className="flex flex-col justify-between space-y-1 border-l border-slate-200/60 pl-3">
                    <span className="text-gray-500 text-[11px]">一次性通过率</span>
                    <span className="text-sm font-black font-mono text-blue-600">
                      {currentSubmitter.oncePassRate}
                    </span>
                  </div>
                  <div className="flex flex-col justify-between space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200/60 pt-2 sm:pt-0 sm:pl-3">
                    <span className="text-gray-500 text-[11px]">综合总分</span>
                    <span className="text-sm font-black font-mono text-amber-600">
                      {typeof currentSubmitter.totalScore === 'number' ? currentSubmitter.totalScore.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : currentSubmitter.totalScore} <span className="text-[10px] font-normal text-gray-500">分</span>
                    </span>
                  </div>
                  <div className="flex flex-col justify-between space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200/60 pt-2 sm:pt-0 sm:pl-3">
                    <span className="text-gray-500 text-[11px]">平均得分</span>
                    <span className="text-sm font-black font-mono text-purple-600">
                      {currentSubmitter.avgScore} <span className="text-[10px] font-normal text-gray-500">分</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* ========================================================================= */}
      {/* 3. 审核员趋势图与审核统计 */}
      {/* ========================================================================= */}
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* 3.1 审核员趋势图与审核统计环状图 (并排置于同一行展示) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 左侧 2 列: 审核员趋势图 (审核总量、通过量、驳回量、平均审核时长) */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>审核员趋势图</span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    审核效能走势
                  </span>
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  onClick={() => setAuditorTrendMetrics((p) => ({ ...p, total: !p.total }))}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                    auditorTrendMetrics.total ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-50 text-gray-400 border-gray-200'
                  }`}
                >
                  ● 审核总量
                </button>
                <button
                  onClick={() => setAuditorTrendMetrics((p) => ({ ...p, passed: !p.passed }))}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                    auditorTrendMetrics.passed ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-slate-50 text-gray-400 border-gray-200'
                  }`}
                >
                  ● 通过量
                </button>
                <button
                  onClick={() => setAuditorTrendMetrics((p) => ({ ...p, rejected: !p.rejected }))}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                    auditorTrendMetrics.rejected ? 'bg-rose-50 text-rose-700 border-rose-300' : 'bg-slate-50 text-gray-400 border-gray-200'
                  }`}
                >
                  ● 驳回量
                </button>
                <button
                  onClick={() => setAuditorTrendMetrics((p) => ({ ...p, processRate: !p.processRate }))}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                    auditorTrendMetrics.processRate ? 'bg-cyan-50 text-cyan-700 border-cyan-300' : 'bg-slate-50 text-gray-400 border-gray-200'
                  }`}
                >
                  ● 审核处理率
                </button>
                <button
                  onClick={() => setAuditorTrendMetrics((p) => ({ ...p, avgTime: !p.avgTime }))}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                    auditorTrendMetrics.avgTime ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-slate-50 text-gray-400 border-gray-200'
                  }`}
                >
                  ● 平均时长
                </button>
              </div>
            </div>

            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentAuditor.trend} margin={{ top: 10, right: 25, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#64748b" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                  {auditorTrendMetrics.total && (
                    <Line yAxisId="left" type="monotone" dataKey="total" name="审核总量" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
                  )}
                  {auditorTrendMetrics.passed && (
                    <Line yAxisId="left" type="monotone" dataKey="passed" name="通过量" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                  )}
                  {auditorTrendMetrics.rejected && (
                    <Line yAxisId="left" type="monotone" dataKey="rejected" name="驳回量" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
                  )}
                  {auditorTrendMetrics.processRate && (
                    <Line yAxisId="right" type="monotone" dataKey="processRate" name="审核处理率(%)" stroke="#06B6D4" strokeDasharray="4 4" strokeWidth={2} dot={{ r: 3 }} />
                  )}
                  {auditorTrendMetrics.avgTime && (
                    <Line yAxisId="left" type="monotone" dataKey="avgTime" name="平均时长(分)" stroke="#8B5CF6" strokeDasharray="4 4" strokeWidth={2} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 右侧 1 列: 审核统计 (严格对标截图规范，含环状图与审核任务统计) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              {/* 标题区域: 包含角色名称与图标 */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-extrabold text-sm text-gray-900 tracking-tight flex items-center space-x-2">
                    <PieChartIcon className="w-4 h-4 text-emerald-600" />
                    <span>审核员审核统计</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-normal">
                    统计时间范围 {startDate.replace(/-/g, '/')} - {endDate.replace(/-/g, '/')}
                  </span>
              </div>

              {/* 环状图与3项状态列表卡片: 左环右列表 */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                {/* 左侧环状图 */}
                <div className="w-36 h-36 relative shrink-0 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={currentAuditor.taskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={62}
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={currentAuditor.taskDistribution.filter(i => i.value > 0).length > 1 ? 2 : 0}
                        dataKey="value"
                      >
                        {currentAuditor.taskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val, name) => [`${val} 件`, name]} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* 环状图中心文字: 累计审核 X 件 */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[11px] text-gray-500 font-medium leading-none">累计审核</span>
                    <span className="text-2xl font-black text-gray-900 font-mono tracking-tight my-0.5">
                      {currentAuditor.auditTotal}
                    </span>
                    <span className="text-[10px] text-gray-400 leading-none">件</span>
                  </div>
                </div>

                {/* 右侧3项状态卡片列表: 严格对标截图 */}
                <div className="flex-1 w-full space-y-2">
                  {currentAuditor.taskDistribution.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-slate-50/80 hover:bg-slate-100/80 transition-colors px-3 py-2 rounded-xl border border-slate-100/90 text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-gray-700 font-medium">{item.name}</span>
                      </div>
                      <span className={`font-mono font-bold text-xs ${item.textColor || 'text-gray-900'}`}>
                        {item.value} 件
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 底部指标卡片: 平均审核响应时间、审核处理率 (严格对标截图) */}
              <div className="bg-slate-50/70 rounded-2xl p-3.5 border border-slate-200/70 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center justify-between px-1">
                  <span className="text-gray-600 text-xs font-medium">平均审核响应时间</span>
                  <span className="text-sm font-black font-mono text-emerald-600 flex items-baseline space-x-1">
                    <span>{currentAuditor.avgTimeMin}</span>
                    <span className="text-[10px] font-normal text-gray-500">分钟</span>
                  </span>
                </div>
                <div className="flex items-center justify-between border-l border-slate-200/60 pl-3 px-1">
                  <span className="text-gray-600 text-xs font-medium">审核处理率</span>
                  <span className="text-sm font-black font-mono text-blue-600">
                    {currentAuditor.processRate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. 全域机构综合总览 (Global Perspective) */}
      {/* ========================================================================= */}
      {viewPerspective === 'global_org' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
              <div className="text-xs text-gray-500 font-bold">全域上报总量</div>
              <div className="text-2xl font-black text-gray-900 font-mono">1,420 <span className="text-xs font-normal">件</span></div>
              <div className="text-[11px] text-emerald-600 font-bold">环比 ↑ +14.2%</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs space-y-1.5">
              <div className="text-xs text-gray-500 font-bold">全域一次性通过率</div>
              <div className="text-2xl font-black text-emerald-600 font-mono">88.4%</div>
              <div className="text-[11px] text-gray-500">采纳 1,280 件</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-2xs space-y-1.5">
              <div className="text-xs text-gray-500 font-bold">全域整体通过率</div>
              <div className="text-2xl font-black text-blue-600 font-mono">92.6%</div>
              <div className="text-[11px] text-blue-600 font-bold">环比 ↑ +3.1%</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-2xs space-y-1.5">
              <div className="text-xs text-gray-500 font-bold">全域平均审核耗时</div>
              <div className="text-2xl font-black text-purple-600 font-mono">11.5 <span className="text-xs font-normal">分钟</span></div>
              <div className="text-[11px] text-purple-600 font-bold">提速 28.5%</div>
            </div>
          </div>

          {/* Org Ranking Table */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>全域各机构报送质效与考核对标大盘</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-gray-600 font-bold border-b border-gray-200">
                    <th className="py-3 px-3 text-center">排名</th>
                    <th className="py-3 px-4">机构名称</th>
                    <th className="py-3 px-3 text-center">类别</th>
                    <th className="py-3 px-3 text-center">上报总量</th>
                    <th className="py-3 px-3 text-center">一次性通过率</th>
                    <th className="py-3 px-3 text-center">整体通过率</th>
                    <th className="py-3 px-3 text-center">平均响应时效</th>
                    <th className="py-3 px-3 text-center">综合总分</th>
                    <th className="py-3 px-3 text-center">考评等次</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {subOrgRows.map((row) => (
                    <tr key={row.rank} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-3 text-center font-bold font-mono">
                        {row.rank === 1 ? '🥇 1' : row.rank === 2 ? '🥈 2' : row.rank === 3 ? '🥉 3' : row.rank}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">{row.name}</td>
                      <td className="py-3 px-3 text-center text-gray-500">{row.class}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-gray-800">{row.total}</td>
                      <td className="py-3 px-3 text-center font-mono text-emerald-700 font-bold">{row.onceRate}</td>
                      <td className="py-3 px-3 text-center font-mono text-blue-700 font-bold">{row.totalRate}</td>
                      <td className="py-3 px-3 text-center font-mono text-purple-700">{row.avgTime}</td>
                      <td className="py-3 px-3 text-center font-mono font-black text-amber-600">{row.score}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

