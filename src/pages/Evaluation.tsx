import React, { useState, useMemo } from 'react';
import { EvaluationItem, PageId } from '../types';
import {
  Search,
  RotateCcw,
  Calendar,
  Trophy,
  Award,
  TrendingUp,
  Building2,
  Users,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Info,
  Clock,
  Zap,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  Percent,
  FileText,
  User,
  UserCheck,
  Activity,
  ArrowUpRight,
  Filter,
  Download,
  Printer,
  Sparkles,
  Sliders,
  HelpCircle,
  Eye,
  AlertCircle,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { EvaluationProfileModal, ProfileDetailData } from '../components/EvaluationProfileModal';
import { AllOrgMacroSection, OrgMacroData } from '../components/AllOrgMacroSection';

interface EvaluationProps {
  evaluationList?: EvaluationItem[];
  onNavigate?: (page: PageId) => void;
}

export type EvalPerspective = 'org' | 'reporter' | 'auditor' | 'category' | 'negative';
export type PeriodType = 'month' | 'quarter' | 'year' | 'custom';

// 7-day trend data for Evaluation Intelligence Workbench
const evalTrendData = [
  { day: '08-19', total: 1280, passed: 1150, directRate: 75.2, score: 86.5 },
  { day: '08-20', total: 1420, passed: 1280, directRate: 76.0, score: 87.2 },
  { day: '08-21', total: 1650, passed: 1490, directRate: 78.4, score: 88.6 },
  { day: '08-22', total: 1560, passed: 1410, directRate: 77.8, score: 88.2 },
  { day: '08-23', total: 1820, passed: 1650, directRate: 79.5, score: 89.5 },
  { day: '08-24', total: 1320, passed: 1180, directRate: 76.5, score: 87.8 },
  { day: '08-25', total: 1430, passed: 1210, directRate: 77.4, score: 88.5 }
];

// Donut breakdown for quality distribution
const qualityBreakdownData = [
  { name: '一次性直通', value: 8110, rate: '77.4%', color: '#10B981' },
  { name: '返修通过', value: 1260, rate: '12.0%', color: '#1E5ABB' },
  { name: '驳回整改', value: 780, rate: '7.4%', color: '#EF4444' },
  { name: '待审流转', value: 330, rate: '3.2%', color: '#F59E0B' }
];

// Top 5 Organization Evaluation Rankings
const topEvalOrgs = [
  { rank: 1, name: '中共台中市委宣传部', score: 98.5, directRate: 88.6, passRate: 96.2, grade: '卓越', reports: 1580, isMyOrg: true },
  { rank: 2, name: '台中市网信办', score: 95.8, directRate: 86.4, passRate: 94.8, grade: '卓越', reports: 1350, isMyOrg: false },
  { rank: 3, name: '西屯区网信办', score: 93.2, directRate: 82.5, passRate: 92.0, grade: '优秀', reports: 1120, isMyOrg: false },
  { rank: 4, name: '台中市大数据中心', score: 91.5, directRate: 81.0, passRate: 90.8, grade: '优秀', reports: 980, isMyOrg: false },
  { rank: 5, name: '东湖区委宣传部', score: 89.4, directRate: 77.8, passRate: 88.2, grade: '良好', reports: 850, isMyOrg: false }
];

// Top Stars
const topReporters = [
  { rank: 1, name: '张三 (本机构)', org: '市委宣传部', score: 98.5, count: 68, directRate: '92.6%' },
  { rank: 2, name: '李思源', org: '市网信办', score: 96.2, count: 62, directRate: '88.7%' },
  { rank: 3, name: '赵宏博', org: '西屯区网信办', score: 94.5, count: 54, directRate: '85.2%' }
];

const topAuditors = [
  { rank: 1, name: '王主任 (本机构)', org: '市委宣传部', score: 99.0, audited: 142, avgTime: '5.6分' },
  { rank: 2, name: '陈建国', org: '市网信办', score: 97.4, audited: 128, avgTime: '7.2分' },
  { rank: 3, name: '刘晓琴', org: '西屯区网信办', score: 95.8, audited: 115, avgTime: '8.4分' }
];

// 1. 机构综合考核数据接口
interface OrgEvalRecord {
  id: string;
  rank: number;
  name: string;
  isMyOrg: boolean;
  type: string;
  totalReports: number;
  adoptedReports: number;
  rejectedReports: number;
  pendingReports: number;
  oneTimePassRate: number; // 一次性直通率 %
  overallPassRate: number; // 整体通过率 %
  avgResponseMin: number; // 平均响应耗时 分钟
  perCapitaReport: number; // 机构人均上报量 件
  registeredStaff: number; // 在册人员数
  totalScore: number;
  prevRank: number;
  grade: '卓越' | '优秀' | '良好' | '合格';
}

// 2. 上报员考核数据接口
interface ReporterEvalRecord {
  id: string;
  rank: number;
  name: string;
  isMyOrg: boolean;
  org: string;
  isLeader?: boolean;
  totalReports: number;
  adoptedReports: number;
  rejectedReports: number;
  pendingReports: number;
  oneTimePassRate: number;
  overallPassRate: number;
  totalScore: number;
  avgScore: number;
  momChange: string;
  grade: '卓越' | '优秀' | '良好' | '合格';
  rankChange: string;
}

// 3. 审核员考核数据接口
interface AuditorEvalRecord {
  id: string;
  rank: number;
  name: string;
  isMyOrg: boolean;
  org: string;
  isLeader?: boolean;
  totalAudited: number;
  passedAudits: number;
  rejectedAudits: number;
  pendingAudits: number;
  auditProcessRate: number; // 审核处理率 %
  avgResponseMin: number; // 平均响应时长 分钟
  totalScore: number;
  avgScore: number;
  momChange: string;
  grade: '卓越' | '优秀' | '良好' | '合格';
  rankChange: string;
}

// 4. 舆情分类条线考核数据接口
interface CategoryEvalRecord {
  id: string;
  rank: number;
  category: string;
  leadOrg: string;
  totalReports: number;
  adoptedCount: number;
  avgReviewMinutes: number;
  score: number;
  grade: '卓越' | '优秀' | '良好' | '合格';
}

// 5. 负面舆情交办闭环考核数据接口
interface NegativeEvalRecord {
  id: string;
  title: string;
  org: string;
  isMyOrg: boolean;
  time: string;
  status: '办理中' | '已办结' | '已逾期';
  deadline: string;
  level: '高风险' | '中风险' | '低风险';
  handler: string;
  disposalProgress: string;
  scoreDeduction: number;
}

export const Evaluation: React.FC<EvaluationProps> = ({ evaluationList, onNavigate }) => {
  // Global View & Persona Context
  const [currentOrg] = useState('中共台中市委宣传部');
  const [perspective, setPerspective] = useState<EvalPerspective>('org');
  const [period, setPeriod] = useState<PeriodType>('month');
  const [selectedPeriodLabel, setSelectedPeriodLabel] = useState('2026年8月考评 (本月)');
  
  // Staff Scope Filter in Reporter / Auditor view (平台全员 vs 仅本机构)
  const [staffScope, setStaffScope] = useState<'all' | 'my_org'>('all');
  
  // Organization Switcher
  const [selectedOrgName, setSelectedOrgName] = useState('中共台中市委宣传部');

  // Dashboard tab state
  const [intelTab, setIntelTab] = useState<'stats' | 'evaluation'>('stats');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'all' | '卓越' | '优秀' | '良好' | '合格'>('all');
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Profile Modal State
  const [selectedProfile, setSelectedProfile] = useState<ProfileDetailData | null>(null);

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Mock Data: 机构综合考核榜 (全域 28 家机构)
  const mockOrgRecords: OrgEvalRecord[] = [
    {
      id: 'org-1',
      rank: 1,
      name: '中共台中市委宣传部',
      isMyOrg: true,
      type: '市级党政主体',
      totalReports: 1580,
      adoptedReports: 1520,
      rejectedReports: 35,
      pendingReports: 25,
      oneTimePassRate: 88.6,
      overallPassRate: 96.2,
      avgResponseMin: 6.8,
      perCapitaReport: 35.1,
      registeredStaff: 45,
      totalScore: 98.5,
      prevRank: 1,
      grade: '卓越'
    },
    {
      id: 'org-2',
      rank: 2,
      name: '台中市网信办',
      isMyOrg: false,
      type: '网安指挥主管',
      totalReports: 1350,
      adoptedReports: 1280,
      rejectedReports: 42,
      pendingReports: 28,
      oneTimePassRate: 86.4,
      overallPassRate: 94.8,
      avgResponseMin: 8.5,
      perCapitaReport: 35.5,
      registeredStaff: 38,
      totalScore: 96.8,
      prevRank: 2,
      grade: '卓越'
    },
    {
      id: 'org-3',
      rank: 3,
      name: '西屯区网信办',
      isMyOrg: false,
      type: '区县直属局',
      totalReports: 1120,
      adoptedReports: 1030,
      rejectedReports: 58,
      pendingReports: 32,
      oneTimePassRate: 82.5,
      overallPassRate: 92.0,
      avgResponseMin: 10.8,
      perCapitaReport: 28.0,
      registeredStaff: 40,
      totalScore: 92.4,
      prevRank: 3,
      grade: '优秀'
    },
    {
      id: 'org-4',
      rank: 4,
      name: '台中市大数据中心',
      isMyOrg: false,
      type: '独立直属单位',
      totalReports: 980,
      adoptedReports: 890,
      rejectedReports: 60,
      pendingReports: 30,
      oneTimePassRate: 81.0,
      overallPassRate: 90.8,
      avgResponseMin: 12.2,
      perCapitaReport: 24.5,
      registeredStaff: 40,
      totalScore: 91.2,
      prevRank: 5,
      grade: '优秀'
    },
    {
      id: 'org-5',
      rank: 5,
      name: '东湖区委宣传部',
      isMyOrg: false,
      type: '区县直属局',
      totalReports: 850,
      adoptedReports: 750,
      rejectedReports: 65,
      pendingReports: 35,
      oneTimePassRate: 77.8,
      overallPassRate: 88.2,
      avgResponseMin: 14.5,
      perCapitaReport: 22.4,
      registeredStaff: 38,
      totalScore: 87.5,
      prevRank: 4,
      grade: '良好'
    },
    {
      id: 'org-6',
      rank: 6,
      name: '北屯区宣传部',
      isMyOrg: false,
      type: '区县直属局',
      totalReports: 720,
      adoptedReports: 630,
      rejectedReports: 55,
      pendingReports: 35,
      oneTimePassRate: 75.0,
      overallPassRate: 87.5,
      avgResponseMin: 15.0,
      perCapitaReport: 20.6,
      registeredStaff: 35,
      totalScore: 85.0,
      prevRank: 7,
      grade: '良好'
    },
    {
      id: 'org-7',
      rank: 7,
      name: '南屯区网信办',
      isMyOrg: false,
      type: '区县直属局',
      totalReports: 680,
      adoptedReports: 590,
      rejectedReports: 52,
      pendingReports: 38,
      oneTimePassRate: 74.2,
      overallPassRate: 86.8,
      avgResponseMin: 15.5,
      perCapitaReport: 20.0,
      registeredStaff: 34,
      totalScore: 83.2,
      prevRank: 6,
      grade: '合格'
    },
    {
      id: 'org-8',
      rank: 8,
      name: '高新区管委会',
      isMyOrg: false,
      type: '独立直属单位',
      totalReports: 590,
      adoptedReports: 510,
      rejectedReports: 48,
      pendingReports: 32,
      oneTimePassRate: 73.0,
      overallPassRate: 86.4,
      avgResponseMin: 16.0,
      perCapitaReport: 19.6,
      registeredStaff: 30,
      totalScore: 81.8,
      prevRank: 8,
      grade: '合格'
    }
  ];

  // Mock Data: 平台所有上报员考核榜 (含本机构上报员与全平台人员)
  const mockReporterRecords: ReporterEvalRecord[] = [
    {
      id: 'rep-1',
      rank: 1,
      name: '张三',
      isMyOrg: true,
      org: '中共台中市委宣传部',
      isLeader: true,
      totalReports: 42,
      adoptedReports: 36,
      rejectedReports: 3,
      pendingReports: 3,
      oneTimePassRate: 85.7,
      overallPassRate: 92.9,
      totalScore: 3986.5,
      avgScore: 94.9,
      momChange: '+3.2%',
      grade: '卓越',
      rankChange: '持平'
    },
    {
      id: 'rep-2',
      rank: 2,
      name: '王五',
      isMyOrg: false,
      org: '台中市大数据中心',
      totalReports: 38,
      adoptedReports: 32,
      rejectedReports: 3,
      pendingReports: 3,
      oneTimePassRate: 84.2,
      overallPassRate: 89.5,
      totalScore: 3560.0,
      avgScore: 93.7,
      momChange: '+2.5%',
      grade: '卓越',
      rankChange: '↑1'
    },
    {
      id: 'rep-3',
      rank: 3,
      name: '赵六',
      isMyOrg: false,
      org: '西屯区网信办',
      totalReports: 35,
      adoptedReports: 29,
      rejectedReports: 4,
      pendingReports: 2,
      oneTimePassRate: 80.0,
      overallPassRate: 85.7,
      totalScore: 3120.0,
      avgScore: 89.1,
      momChange: '+1.8%',
      grade: '优秀',
      rankChange: '↓1'
    },
    {
      id: 'rep-4',
      rank: 4,
      name: '孙七',
      isMyOrg: false,
      org: '东湖区委宣传部',
      totalReports: 31,
      adoptedReports: 25,
      rejectedReports: 4,
      pendingReports: 2,
      oneTimePassRate: 77.4,
      overallPassRate: 83.9,
      totalScore: 2680.0,
      avgScore: 86.5,
      momChange: '+1.2%',
      grade: '优秀',
      rankChange: '↑2'
    },
    {
      id: 'rep-5',
      rank: 5,
      name: '李四',
      isMyOrg: false,
      org: '台中市网信办',
      totalReports: 28,
      adoptedReports: 22,
      rejectedReports: 4,
      pendingReports: 2,
      oneTimePassRate: 75.0,
      overallPassRate: 82.1,
      totalScore: 2350.0,
      avgScore: 83.9,
      momChange: '-0.8%',
      grade: '良好',
      rankChange: '↓1'
    },
    {
      id: 'rep-6',
      rank: 6,
      name: '周志明',
      isMyOrg: true,
      org: '中共台中市委宣传部',
      totalReports: 26,
      adoptedReports: 21,
      rejectedReports: 3,
      pendingReports: 2,
      oneTimePassRate: 76.9,
      overallPassRate: 80.8,
      totalScore: 2180.0,
      avgScore: 83.8,
      momChange: '+1.4%',
      grade: '良好',
      rankChange: '↑1'
    },
    {
      id: 'rep-7',
      rank: 7,
      name: '刘芳',
      isMyOrg: true,
      org: '中共台中市委宣传部',
      totalReports: 24,
      adoptedReports: 19,
      rejectedReports: 3,
      pendingReports: 2,
      oneTimePassRate: 75.0,
      overallPassRate: 79.2,
      totalScore: 2010.0,
      avgScore: 83.7,
      momChange: '+0.5%',
      grade: '良好',
      rankChange: '持平'
    },
    {
      id: 'rep-8',
      rank: 8,
      name: '吴强',
      isMyOrg: false,
      org: '北屯区宣传部',
      totalReports: 22,
      adoptedReports: 17,
      rejectedReports: 3,
      pendingReports: 2,
      oneTimePassRate: 72.7,
      overallPassRate: 77.3,
      totalScore: 1820.0,
      avgScore: 82.7,
      momChange: '-1.2%',
      grade: '合格',
      rankChange: '↓1'
    }
  ];

  // Mock Data: 平台所有审核员考核榜 (含本机构审核员与全平台人员)
  const mockAuditorRecords: AuditorEvalRecord[] = [
    {
      id: 'aud-1',
      rank: 1,
      name: '王主任',
      isMyOrg: true,
      org: '中共台中市委宣传部',
      isLeader: true,
      totalAudited: 156,
      passedAudits: 142,
      rejectedAudits: 10,
      pendingAudits: 4,
      auditProcessRate: 97.5,
      avgResponseMin: 6.8,
      totalScore: 15210.0,
      avgScore: 97.5,
      momChange: '+1.5%',
      grade: '卓越',
      rankChange: '持平'
    },
    {
      id: 'aud-2',
      rank: 2,
      name: '李明',
      isMyOrg: false,
      org: '台中市网信办',
      totalAudited: 138,
      passedAudits: 124,
      rejectedAudits: 9,
      pendingAudits: 5,
      auditProcessRate: 96.4,
      avgResponseMin: 7.9,
      totalScore: 13248.0,
      avgScore: 96.0,
      momChange: '+2.1%',
      grade: '卓越',
      rankChange: '↑1'
    },
    {
      id: 'aud-3',
      rank: 3,
      name: '陈科长',
      isMyOrg: false,
      org: '台中市大数据中心',
      totalAudited: 120,
      passedAudits: 106,
      rejectedAudits: 8,
      pendingAudits: 6,
      auditProcessRate: 95.0,
      avgResponseMin: 8.8,
      totalScore: 11160.0,
      avgScore: 93.0,
      momChange: '+0.9%',
      grade: '优秀',
      rankChange: '↓1'
    },
    {
      id: 'aud-4',
      rank: 4,
      name: '周主管',
      isMyOrg: false,
      org: '西屯区网信办',
      totalAudited: 95,
      passedAudits: 82,
      rejectedAudits: 8,
      pendingAudits: 5,
      auditProcessRate: 94.7,
      avgResponseMin: 11.2,
      totalScore: 8455.0,
      avgScore: 89.0,
      momChange: '+1.1%',
      grade: '良好',
      rankChange: '持平'
    },
    {
      id: 'aud-5',
      rank: 5,
      name: '韩科长',
      isMyOrg: true,
      org: '中共台中市委宣传部',
      totalAudited: 92,
      passedAudits: 80,
      rejectedAudits: 7,
      pendingAudits: 5,
      auditProcessRate: 94.6,
      avgResponseMin: 9.2,
      totalScore: 8188.0,
      avgScore: 89.0,
      momChange: '+1.8%',
      grade: '良好',
      rankChange: '↑1'
    },
    {
      id: 'aud-6',
      rank: 6,
      name: '徐副主任',
      isMyOrg: false,
      org: '东湖区委宣传部',
      totalAudited: 78,
      passedAudits: 67,
      rejectedAudits: 6,
      pendingAudits: 5,
      auditProcessRate: 93.6,
      avgResponseMin: 12.5,
      totalScore: 6786.0,
      avgScore: 87.0,
      momChange: '-0.5%',
      grade: '合格',
      rankChange: '↓1'
    }
  ];

  // Mock Data: 舆情分类条线考评
  const mockCategoryRecords: CategoryEvalRecord[] = [
    { id: 'cat-1', rank: 1, category: '突发舆情事件速报', leadOrg: '台中市网信办', totalReports: 3420, adoptedCount: 3180, avgReviewMinutes: 8.5, score: 96.5, grade: '卓越' },
    { id: 'cat-2', rank: 2, category: '民生热点诉求核查', leadOrg: '中共台中市委宣传部', totalReports: 2850, adoptedCount: 2590, avgReviewMinutes: 11.2, score: 94.0, grade: '优秀' },
    { id: 'cat-3', rank: 3, category: '网络谣言与辟谣澄清', leadOrg: '市公安局网安支队', totalReports: 1420, adoptedCount: 1260, avgReviewMinutes: 12.0, score: 91.5, grade: '优秀' },
    { id: 'cat-4', rank: 4, category: '重大政策解读反响', leadOrg: '市发改委/政研室', totalReports: 742, adoptedCount: 630, avgReviewMinutes: 16.5, score: 86.0, grade: '良好' }
  ];

  // Mock Data: 负面舆情交办闭环考核台账 (从统计台账模块完整合并至考核管理)
  const mockNegativeRecords: NegativeEvalRecord[] = [
    {
      id: 'TS-20260811-01',
      title: '关于某大型小区二次供水管网破裂停水舆情',
      org: '市水务集团 / 西屯区网信办',
      isMyOrg: false,
      time: '2026-08-11 10:15',
      status: '办理中',
      deadline: '剩余 2 小时',
      level: '高风险',
      handler: '西屯区网信办-刘科长',
      disposalProgress: '已调派应急供水车并发布情况通报，正在管道抢修',
      scoreDeduction: 0
    },
    {
      id: 'TS-20260810-04',
      title: '东湖区部分高新技术园区晚高峰交通拥堵关切',
      org: '中共台中市委宣传部 / 市交警支队',
      isMyOrg: true,
      time: '2026-08-10 16:30',
      status: '已办结',
      deadline: '已按时办结',
      level: '中风险',
      handler: '市委宣传部-张三',
      disposalProgress: '联合交管部门完成动态信号灯调优并在政务微博发布疏导指南',
      scoreDeduction: 0
    },
    {
      id: 'TS-20260809-02',
      title: '网传“某生鲜市场物价异常上涨”不实辟谣',
      org: '中共台中市委宣传部 / 市网信办',
      isMyOrg: true,
      time: '2026-08-09 11:20',
      status: '已办结',
      deadline: '已发布通告',
      level: '高风险',
      handler: '市委宣传部-王主任',
      disposalProgress: '现场核实取证，市监局现场抽检合格，官方账号发布权威通告辟谣',
      scoreDeduction: 0
    },
    {
      id: 'TS-20260808-05',
      title: '某自媒体账号炒作暴雨积水历史旧视频',
      org: '台中市网信办',
      isMyOrg: false,
      time: '2026-08-08 09:40',
      status: '已办结',
      deadline: '已按时办结',
      level: '中风险',
      handler: '网信办-应急科',
      disposalProgress: '约谈自媒体运营主体并作下架处罚，全网通报辟谣',
      scoreDeduction: 0
    },
    {
      id: 'TS-20260807-03',
      title: '高新区某企业劳动纠纷言论发酵情况',
      org: '高新区管委会',
      isMyOrg: false,
      time: '2026-08-07 14:10',
      status: '已办结',
      deadline: '已按时办结',
      level: '中风险',
      handler: '高新区管委会-调解组',
      disposalProgress: '人社部门组织双方调解并达成和解协议，舆情平息',
      scoreDeduction: 0
    }
  ];

  // Open profile modal for any record
  const handleOpenProfile = (type: 'org' | 'reporter' | 'auditor', item: any) => {
    if (type === 'org') {
      const org = item as OrgEvalRecord;
      setSelectedProfile({
        id: org.id,
        name: org.name,
        type: 'org',
        subTitle: `${org.type} · 在册编制 ${org.registeredStaff} 人`,
        rank: org.rank,
        totalScore: org.totalScore,
        grade: org.grade,
        stats: [
          { label: '总上报量', value: `${org.totalReports} 件`, isHighlight: true },
          { label: '采纳通过量', value: `${org.adoptedReports} 件` },
          { label: '首审直通率', value: `${org.oneTimePassRate}%`, isHighlight: true },
          { label: '整体通过率', value: `${org.overallPassRate}%` },
          { label: '审核平均响应', value: `${org.avgResponseMin} 分钟` },
          { label: '人均贡献量', value: `${org.perCapitaReport} 件` }
        ],
        radarData: [
          { subject: '报送时效', value: 96, fullMark: 100 },
          { subject: '采纳质效', value: 98, fullMark: 100 },
          { subject: '首审直通', value: 92, fullMark: 100 },
          { subject: '审核响应', value: 95, fullMark: 100 },
          { subject: '负面闭环', value: 99, fullMark: 100 }
        ],
        historyScores: [
          { month: '4月', score: 95.0 },
          { month: '5月', score: 96.2 },
          { month: '6月', score: 97.0 },
          { month: '7月', score: 97.8 },
          { month: '8月', score: org.totalScore }
        ],
        breakdown: [
          { category: '基础报送', item: '累计采纳 1,520 件', points: '+60.8 分', desc: '按单件采纳 0.04 分计分' },
          { category: '直通激励', item: '首审直通率 88.6%', points: '+25.0 分', desc: '达到全域领先梯队激励' },
          { category: '审核提速', item: '平均响应 6.8 分钟', points: '+12.7 分', desc: '平均耗时大幅优于全域均值' }
        ],
        summaryEvaluation: `${org.name} 本考核周期内报送质效出众，一次性直通率位居全域第一，响应速度稳居第一梯队。`
      });
    } else if (type === 'reporter') {
      const rep = item as ReporterEvalRecord;
      setSelectedProfile({
        id: rep.id,
        name: rep.name,
        type: 'reporter',
        subTitle: `${rep.org} · 上报员岗位`,
        rank: rep.rank,
        totalScore: rep.totalScore,
        grade: rep.grade,
        stats: [
          { label: '累计上报', value: `${rep.totalReports} 件`, isHighlight: true },
          { label: '采纳通过', value: `${rep.adoptedReports} 件` },
          { label: '首审直通率', value: `${rep.oneTimePassRate}%`, isHighlight: true },
          { label: '整体通过率', value: `${rep.overallPassRate}%` },
          { label: '单条平均得分', value: `${rep.avgScore} 分` },
          { label: '环比得分增幅', value: rep.momChange }
        ],
        radarData: [
          { subject: '报送活跃', value: 95, fullMark: 100 },
          { subject: '采纳质量', value: 96, fullMark: 100 },
          { subject: '首审直通', value: 90, fullMark: 100 },
          { subject: '要素完整', value: 94, fullMark: 100 },
          { subject: '业务研判', value: 92, fullMark: 100 }
        ],
        historyScores: [
          { month: '4月', score: 3200 },
          { month: '5月', score: 3450 },
          { month: '6月', score: 3620 },
          { month: '7月', score: 3810 },
          { month: '8月', score: rep.totalScore }
        ],
        breakdown: [
          { category: '采纳积分', item: `采纳 ${rep.adoptedReports} 件`, points: `+${(rep.adoptedReports * 95).toFixed(1)} 分`, desc: '依据信息价值量加权核算' },
          { category: '直通加分', item: `首审直通率 ${rep.oneTimePassRate}%`, points: '+280.0 分', desc: '一次性直通专项质效奖励' },
          { category: '驳回扣分', item: `驳回 ${rep.rejectedReports} 件`, points: `-${(rep.rejectedReports * 15).toFixed(1)} 分`, desc: '格式或要素不全修正扣分' }
        ],
        summaryEvaluation: `${rep.name}（${rep.org}）工作扎实严谨，报送采纳率稳定在 90% 以上，综合考评表现卓越。`
      });
    } else if (type === 'auditor') {
      const aud = item as AuditorEvalRecord;
      setSelectedProfile({
        id: aud.id,
        name: aud.name,
        type: 'auditor',
        subTitle: `${aud.org} · 审核员岗位`,
        rank: aud.rank,
        totalScore: aud.totalScore,
        grade: aud.grade,
        stats: [
          { label: '累计审核', value: `${aud.totalAudited} 件`, isHighlight: true },
          { label: '审核通过', value: `${aud.passedAudits} 件` },
          { label: '审核处理率', value: `${aud.auditProcessRate}%`, isHighlight: true },
          { label: '平均响应时长', value: `${aud.avgResponseMin} 分钟` },
          { label: '单条均分', value: `${aud.avgScore} 分` },
          { label: '环比得分增幅', value: aud.momChange }
        ],
        radarData: [
          { subject: '响应时效', value: 98, fullMark: 100 },
          { subject: '把关严谨', value: 96, fullMark: 100 },
          { subject: '日均处理', value: 94, fullMark: 100 },
          { subject: '研判准确', value: 97, fullMark: 100 },
          { subject: '交办追踪', value: 95, fullMark: 100 }
        ],
        historyScores: [
          { month: '4月', score: 12100 },
          { month: '5月', score: 13400 },
          { month: '6月', score: 14200 },
          { month: '7月', score: 14800 },
          { month: '8月', score: aud.totalScore }
        ],
        breakdown: [
          { category: '审结基础分', item: `审结 ${aud.passedAudits + aud.rejectedAudits} 件`, points: `+${((aud.passedAudits + aud.rejectedAudits) * 98).toFixed(1)} 分`, desc: '完成舆情审核流转基础赋分' },
          { category: '极速响应分', item: `平均响应 ${aud.avgResponseMin} 分钟`, points: '+450.0 分', desc: '10分钟以内极速审核加分' }
        ],
        summaryEvaluation: `${aud.name}（${aud.org}）审核把关严密、流转极其高效，平均耗时仅 6.8 分钟，位居全域榜首。`
      });
    }
  };

  // Currently Active Selected Organization for benchmark cards
  const currentOrgRecord = useMemo(() => {
    return mockOrgRecords.find(o => o.name === selectedOrgName) || mockOrgRecords[0];
  }, [mockOrgRecords, selectedOrgName]);

  // Filtered Records
  const filteredOrgList = useMemo(() => {
    return mockOrgRecords.filter(item => {
      const matchSearch = item.name.includes(searchQuery) || item.type.includes(searchQuery);
      const matchGrade = gradeFilter === 'all' || item.grade === gradeFilter;
      return matchSearch && matchGrade;
    });
  }, [mockOrgRecords, searchQuery, gradeFilter]);

  const filteredReporterList = useMemo(() => {
    return mockReporterRecords.filter(item => {
      const matchSearch = item.name.includes(searchQuery) || item.org.includes(searchQuery);
      const matchGrade = gradeFilter === 'all' || item.grade === gradeFilter;
      if (staffScope === 'my_org') {
        return matchSearch && matchGrade && item.isMyOrg;
      }
      return matchSearch && matchGrade;
    });
  }, [mockReporterRecords, searchQuery, gradeFilter, staffScope]);

  const filteredAuditorList = useMemo(() => {
    return mockAuditorRecords.filter(item => {
      const matchSearch = item.name.includes(searchQuery) || item.org.includes(searchQuery);
      const matchGrade = gradeFilter === 'all' || item.grade === gradeFilter;
      if (staffScope === 'my_org') {
        return matchSearch && matchGrade && item.isMyOrg;
      }
      return matchSearch && matchGrade;
    });
  }, [mockAuditorRecords, searchQuery, gradeFilter, staffScope]);

  const filteredNegativeList = useMemo(() => {
    return mockNegativeRecords.filter(item => {
      const matchSearch = item.title.includes(searchQuery) || item.org.includes(searchQuery) || item.id.includes(searchQuery) || item.handler.includes(searchQuery);
      return matchSearch;
    });
  }, [mockNegativeRecords, searchQuery]);

  const handleSelectOrgMacro = (orgData: OrgMacroData) => {
    const matching = mockOrgRecords.find(o => o.name === orgData.name) || {
      id: `org-${orgData.rank}`,
      rank: orgData.rank,
      name: orgData.name,
      isMyOrg: !!orgData.isMyOrg,
      type: orgData.type,
      totalReports: orgData.total,
      adoptedReports: orgData.passed,
      rejectedReports: orgData.rejected,
      pendingReports: orgData.pending,
      oneTimePassRate: orgData.directRate,
      overallPassRate: orgData.passRate,
      avgResponseMin: orgData.avgTime,
      perCapitaReport: orgData.perCapita,
      totalScore: orgData.avgScore,
      grade: orgData.grade,
      registeredStaff: orgData.staff
    };
    handleOpenProfile('org', matching);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-[#1E5ABB] text-white px-4 py-2.5 rounded-xl shadow-xl border border-blue-400/30 flex items-center space-x-2 text-xs animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. 机构管理员考评全局控制台 (Executive Header & Identity & Perspective Bar) */}
      <div className="bg-white px-5 py-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-xl shadow-2xs flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-extrabold text-gray-900 tracking-tight">
                  考核管理与综合绩效评定
                </h1>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                对标全域 28 家机构及 186 名工作人员，实时量化机构综合考评得分、上报员及审核员个人绩效排行
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setShowRuleModal(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 shadow-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>考核赋分规则</span>
            </button>
            <button
              onClick={() => showToast('已生成并导出【2026年8月综合考核通报红头简报.xlsx】！')}
              className="px-3.5 py-1.5 bg-[#1E5ABB] hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出考评大表</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 shadow-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>打印简报</span>
            </button>
          </div>
        </div>

        {/* Global Toolbar: 考核视角切换 & 考核周期选择 & 搜索筛选 */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          {/* Left: Perspective Switch Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200/80">
            <button
              onClick={() => setPerspective('org')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                perspective === 'org' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>全域机构考核总榜</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${perspective === 'org' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'}`}>
                28家
              </span>
            </button>

            <button
              onClick={() => setPerspective('reporter')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                perspective === 'reporter' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>平台所有上报员考评</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${perspective === 'reporter' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'}`}>
                124人
              </span>
            </button>

            <button
              onClick={() => setPerspective('auditor')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                perspective === 'auditor' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>平台所有审核员考评</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${perspective === 'auditor' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'}`}>
                42人
              </span>
            </button>
          </div>

          {/* Right: 切换机构 & Period & Staff Scope & Grade & Search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 切换机构 Select Dropdown */}
            <div className="flex items-center space-x-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs shadow-2xs hover:border-blue-400 transition-colors">
              <Building2 className="w-3.5 h-3.5 text-[#1E5ABB] shrink-0" />
              <span className="text-slate-500 font-medium shrink-0">切换机构:</span>
              <select
                value={selectedOrgName}
                onChange={(e) => {
                  setSelectedOrgName(e.target.value);
                  showToast(`已切换至【${e.target.value}】考评视角`);
                }}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer pr-1 text-xs"
              >
                {mockOrgRecords.map(org => (
                  <option key={org.id} value={org.name}>
                    {org.name} {org.isMyOrg ? '(本机构)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Staff Scope Filter (仅在人员考评视角显示) */}
            {(perspective === 'reporter' || perspective === 'auditor') && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium border border-slate-200">
                <button
                  onClick={() => setStaffScope('all')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    staffScope === 'all' ? 'bg-white text-[#1E5ABB] shadow-2xs font-bold' : 'text-gray-600'
                  }`}
                >
                  平台全员
                </button>
                <button
                  onClick={() => setStaffScope('my_org')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    staffScope === 'my_org' ? 'bg-white text-[#1E5ABB] shadow-2xs font-bold' : 'text-gray-600'
                  }`}
                >
                  仅本机构人员
                </button>
              </div>
            )}

            {/* Period selector */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => { setPeriod('month'); setSelectedPeriodLabel('2026年8月考评 (本月)'); }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  period === 'month' ? 'bg-[#1E5ABB] text-white shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                月度
              </button>
              <button
                onClick={() => { setPeriod('quarter'); setSelectedPeriodLabel('2026年第3季度综合考评'); }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  period === 'quarter' ? 'bg-[#1E5ABB] text-white shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                季度
              </button>
              <button
                onClick={() => { setPeriod('year'); setSelectedPeriodLabel('2026年度总考评'); }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  period === 'year' ? 'bg-[#1E5ABB] text-white shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                年度
              </button>
            </div>

            {/* Grade filter */}
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value as any)}
              className="bg-white border border-gray-300 text-gray-700 rounded-lg px-2 py-1 text-xs focus:outline-none cursor-pointer font-medium"
            >
              <option value="all">全部等次</option>
              <option value="卓越">卓越等次</option>
              <option value="优秀">优秀等次</option>
              <option value="良好">良好等次</option>
              <option value="合格">合格等次</option>
            </select>

            {/* Search Input */}
            <div className="relative flex items-center bg-slate-50 border border-gray-300 rounded-xl px-2.5 py-1 text-xs">
              <Search className="w-3.5 h-3.5 text-gray-400 mr-1.5 shrink-0" />
              <input
                type="text"
                placeholder="搜索机构/人员姓名..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-36 focus:outline-none text-xs text-gray-800 bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. 机构管理员效能对标与考评全局画像看板 (Institutional Admin Benchmark & Intelligence Hub) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Column (lg:col-span-5): 3 Benchmark Cards + Score Structure */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          {/* Card 1: 机构考评总分与排位 (Hero Flagship Card - Dynamically Bound to selectedOrgName) */}
          <div className="bg-gradient-to-br from-white via-amber-50/20 to-orange-50/30 p-4 rounded-2xl border border-amber-200/80 shadow-2xs space-y-3 relative overflow-hidden flex-1 flex flex-col justify-between">
            {/* Top Row: Org Identity & Rank Pill */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl shadow-xs">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="text-xs font-black text-slate-900 tracking-tight">{currentOrgRecord.name}</h3>
                    {currentOrgRecord.isMyOrg ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded border border-blue-200">本机构</span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded border border-slate-200">{currentOrgRecord.type}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">全域综合绩效考核画像</p>
                </div>
              </div>

              <button
                onClick={() => handleOpenProfile('org', currentOrgRecord)}
                className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-900 text-[11px] font-bold rounded-lg border border-amber-200 shadow-2xs transition-all flex items-center space-x-1 cursor-pointer hover:border-amber-300 group"
              >
                <span>深度画像</span>
                <ChevronRight className="w-3 h-3 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Middle Row: Score Number & Highlights */}
            <div className="flex items-end justify-between pt-1">
              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-amber-800 font-mono tracking-tight">{currentOrgRecord.totalScore}</span>
                  <span className="text-xs text-slate-500 font-bold">/ 100 分</span>
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-amber-500 text-white rounded">{currentOrgRecord.grade}等次</span>
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    {currentOrgRecord.totalScore >= 87.3 ? `超均值 +${(currentOrgRecord.totalScore - 87.3).toFixed(1)}分` : `较均值 ${(currentOrgRecord.totalScore - 87.3).toFixed(1)}分`}
                  </span>
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <div className="text-[10px] text-slate-400 font-medium">全市综合排名</div>
                <div className="text-lg font-black text-slate-900 font-mono flex items-center justify-end">
                  <span className="text-xs text-amber-700 mr-1">TOP</span>
                  <span className="text-2xl text-amber-700 leading-none">{currentOrgRecord.rank}</span>
                  <span className="text-xs text-slate-400 ml-1">/ 28 家</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Micro Performance Tags */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-100/80 text-[10px]">
              <div className="bg-white/80 p-1.5 rounded-lg border border-amber-100/60">
                <span className="text-slate-400 block text-[9px]">直通采纳率</span>
                <strong className="text-slate-800 font-mono font-bold text-xs">{currentOrgRecord.oneTimePassRate}%</strong>
              </div>
              <div className="bg-white/80 p-1.5 rounded-lg border border-amber-100/60">
                <span className="text-slate-400 block text-[9px]">累计报送</span>
                <strong className="text-slate-800 font-mono font-bold text-xs">{currentOrgRecord.totalReports.toLocaleString()} 件</strong>
              </div>
              <div className="bg-white/80 p-1.5 rounded-lg border border-amber-100/60">
                <span className="text-slate-400 block text-[9px]">平均时效</span>
                <strong className="text-emerald-700 font-mono font-bold text-xs">{currentOrgRecord.avgResponseMin} 分钟</strong>
              </div>
            </div>
          </div>

          {/* 2 Subcards in Grid: Staff Teams */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Card 2: 上报员队伍 */}
            <div
              onClick={() => {
                setPerspective('reporter');
                setStaffScope('my_org');
              }}
              className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <div className="p-1 bg-blue-50 text-blue-600 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">上报员队伍</span>
                </div>
                <span className="text-[9px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.2 rounded border border-blue-100">
                  32 人在册
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-0.5">
                <div className="flex items-baseline space-x-1">
                  <span className="text-xl font-black text-blue-700 font-mono">94.9</span>
                  <span className="text-[10px] text-slate-400">均分</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold font-mono">88.6%直通</span>
              </div>

              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '94.9%' }}></div>
              </div>

              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                <span className="truncate">标兵: <strong className="text-slate-800">张三</strong> (98.5分)</span>
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Card 3: 审核员队伍 */}
            <div
              onClick={() => {
                setPerspective('auditor');
                setStaffScope('my_org');
              }}
              className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <div className="p-1 bg-emerald-50 text-emerald-600 rounded-md group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">审核员队伍</span>
                </div>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded border border-emerald-100">
                  13 人在册
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-0.5">
                <div className="flex items-baseline space-x-1">
                  <span className="text-xl font-black text-emerald-700 font-mono">97.5</span>
                  <span className="text-[10px] text-slate-400">均分</span>
                </div>
                <span className="text-[10px] text-purple-700 font-bold font-mono">均耗 5.6分</span>
              </div>

              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '97.5%' }}></div>
              </div>

              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                <span className="truncate">标兵: <strong className="text-slate-800">王主任</strong> (99.0分)</span>
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Quick Score Decomposition Bar (Card 4) */}
          <div className="p-3 bg-gradient-to-r from-slate-50 to-indigo-50/40 rounded-xl border border-indigo-100/90 shadow-2xs space-y-2">
            <div className="text-[11px] font-extrabold text-slate-800 flex justify-between items-center">
              <span className="flex items-center space-x-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                <span>考核维度权重分值拆解</span>
              </span>
              <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                综合得分 98.5
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px]">
              {/* Dim 1 */}
              <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex justify-between items-center text-[9px] text-slate-500">
                  <span>报送质量 (40分)</span>
                  <span className="font-mono font-bold text-indigo-700">98.8%</span>
                </div>
                <div className="text-sm font-black text-indigo-800 font-mono">39.5 <span className="text-[10px] text-slate-400 font-normal">分</span></div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '98.8%' }}></div>
                </div>
              </div>

              {/* Dim 2 */}
              <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex justify-between items-center text-[9px] text-slate-500">
                  <span>报送总量 (30分)</span>
                  <span className="font-mono font-bold text-blue-700">97.3%</span>
                </div>
                <div className="text-sm font-black text-blue-800 font-mono">29.2 <span className="text-[10px] text-slate-400 font-normal">分</span></div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '97.3%' }}></div>
                </div>
              </div>

              {/* Dim 3 */}
              <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex justify-between items-center text-[9px] text-slate-500">
                  <span>时效交办 (30分)</span>
                  <span className="font-mono font-bold text-emerald-700">99.3%</span>
                </div>
                <div className="text-sm font-black text-emerald-800 font-mono">29.8 <span className="text-[10px] text-slate-400 font-normal">分</span></div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '99.3%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (lg:col-span-7): 统计效能与考核风云看板 (Intel Hub) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3.5 flex flex-col justify-between">
          {/* Header & View Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-br from-[#1E5ABB] to-indigo-700 text-white rounded-lg shadow-2xs">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>考核效能与风云画像看板</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">实时计算</span>
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
              <button
                onClick={() => setIntelTab('stats')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center space-x-1 ${
                  intelTab === 'stats'
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>效能大盘 & 走势</span>
              </button>
              <button
                onClick={() => setIntelTab('evaluation')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center space-x-1 ${
                  intelTab === 'evaluation'
                    ? 'bg-[#1E5ABB] text-white shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Trophy className="w-3 h-3" />
                <span>考核风云 & 画像</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Statistics Trend & Quality Funnel & Realtime Operations */}
          {intelTab === 'stats' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {/* Top Row: Mini Trend Chart & Quality Funnel */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Left Trend Chart */}
                <div className="md:col-span-7 h-40">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-bold text-slate-700">近 7 日全域上报与直通率走势</span>
                    <span className="text-[10px] text-blue-600 font-mono">直通率均值 77.4%</span>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evalTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                      <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                      <YAxis yAxisId="right" orientation="right" domain={[60, 100]} tick={{ fontSize: 10 }} stroke="#94A3B8" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '8px', fontSize: '11px', border: 'none' }}
                        formatter={(val: any, name: string) => [
                          name === '直通率' ? `${val}%` : `${val} 件`,
                          name
                        ]}
                      />
                      <Line yAxisId="left" type="monotone" dataKey="total" name="上报总量" stroke="#1E5ABB" strokeWidth={2} dot={{ r: 2 }} />
                      <Line yAxisId="left" type="monotone" dataKey="passed" name="有效采纳" stroke="#10B981" strokeWidth={2} dot={{ r: 2 }} />
                      <Line yAxisId="right" type="monotone" dataKey="directRate" name="直通率" stroke="#F59E0B" strokeWidth={2} strokeDasharray="3 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Right Quality Breakdown Donut */}
                <div className="md:col-span-5 bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-1.5">
                  <div className="text-[11px] font-extrabold text-slate-700 flex justify-between items-center">
                    <span>品控漏斗结构</span>
                    <span className="text-[10px] text-emerald-600 font-bold">高质直通 77.4%</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-18 h-18 relative shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={qualityBreakdownData}
                            cx="50%"
                            cy="50%"
                            innerRadius={20}
                            outerRadius={34}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {qualityBreakdownData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex-1 space-y-0.5 text-[10px]">
                      {qualityBreakdownData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                            <span className="text-slate-600">{item.name}</span>
                          </div>
                          <span className="font-mono font-bold text-slate-800">{item.rate}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Row: Operational Health Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                <div className="p-2 bg-blue-50/60 rounded-xl border border-blue-100/80">
                  <div className="text-[10px] text-blue-800 font-bold flex items-center justify-between">
                    <span>月度报送目标</span>
                    <span className="font-mono">87.3%</span>
                  </div>
                  <div className="w-full bg-blue-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '87.3%' }}></div>
                  </div>
                  <div className="text-[9px] text-blue-600 mt-1 flex justify-between">
                    <span>已完成 10,480 件</span>
                    <span>目标 12,000</span>
                  </div>
                </div>

                <div className="p-2 bg-emerald-50/60 rounded-xl border border-emerald-100/80">
                  <div className="text-[10px] text-emerald-800 font-bold flex items-center justify-between">
                    <span>考核达标率</span>
                    <span className="font-mono">96.4%</span>
                  </div>
                  <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '96.4%' }}></div>
                  </div>
                  <div className="text-[9px] text-emerald-600 mt-1 flex justify-between">
                    <span>27 / 28 家达标</span>
                    <span>1 家预警</span>
                  </div>
                </div>

                <div className="p-2 bg-purple-50/60 rounded-xl border border-purple-100/80">
                  <div className="text-[10px] text-purple-800 font-bold flex items-center justify-between">
                    <span>审核时效指数</span>
                    <span className="font-mono">13.8分</span>
                  </div>
                  <div className="w-full bg-purple-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: '82%' }}></div>
                  </div>
                  <div className="text-[9px] text-purple-600 mt-1 flex justify-between">
                    <span>环比提效 47.3%</span>
                    <span>基准 ≤30分</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Realtime Dynamic Feed */}
              <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700">
                  <span className="flex items-center space-x-1">
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    <span>今日调度与采纳实时动态</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">10分钟前更新</span>
                </div>
                <div className="space-y-1 text-[10px] text-slate-600">
                  <div className="flex items-center justify-between py-0.5">
                    <span className="flex items-center space-x-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <strong className="text-slate-800">市网信办·李思源</strong>
                      <span className="truncate">报送《西屯路段道路施工民生反馈》，通过直通初审</span>
                    </span>
                    <span className="font-mono text-emerald-700 font-bold shrink-0 ml-2">直通+2分 · 09:32</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="flex items-center space-x-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                      <strong className="text-slate-800">市委宣传部·张三</strong>
                      <span className="truncate">完成《高校周边食品安全微舆情》研判流转</span>
                    </span>
                    <span className="font-mono text-blue-700 font-bold shrink-0 ml-2">时效6分 · 09:15</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Insight Bar */}
              <div className="bg-blue-50/60 p-2 rounded-lg border border-blue-100 flex items-center justify-between text-[11px] text-blue-900">
                <span className="flex items-center space-x-1.5 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate"><strong>效能洞察:</strong> 全域首审直通率攀升 <strong>+1.8%</strong>，平均耗时压降至 <strong>13.8分</strong>。</span>
                </span>
                <span className="text-[10px] text-blue-700 font-bold shrink-0 ml-2">
                  质量综合 96.5分
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: Evaluation Leaderboards & Detailed Star Profiles */}
          {intelTab === 'evaluation' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Left: Top 5 Orgs */}
                <div className="md:col-span-6 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700">
                    <span className="flex items-center space-x-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>机构综合考评 Top 5</span>
                    </span>
                    <span className="text-[10px] text-blue-600 font-bold">28 家受评</span>
                  </div>
                  <div className="space-y-1">
                    {topEvalOrgs.map((org) => {
                      const matchedRecord = mockOrgRecords.find(o => o.name === org.name);
                      return (
                        <div
                          key={org.name}
                          onClick={() => matchedRecord && handleOpenProfile('org', matchedRecord)}
                          className={`flex items-center justify-between p-1.5 rounded-lg border text-[11px] transition-all cursor-pointer ${
                            org.isMyOrg
                              ? 'bg-blue-50/90 border-blue-200 font-bold text-blue-950 shadow-2xs hover:bg-blue-100/90'
                              : 'bg-slate-50/70 border-slate-100 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center space-x-1.5 min-w-0">
                            <span className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                              org.rank === 1 ? 'bg-amber-400 text-slate-950' : org.rank === 2 ? 'bg-slate-300 text-slate-900' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {org.rank}
                            </span>
                            <span className="truncate">{org.name}</span>
                            {org.isMyOrg && (
                              <span className="text-[9px] px-1 bg-blue-600 text-white rounded shrink-0">本机构</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="text-[10px] text-emerald-600 font-mono font-bold">{org.directRate}%直通</span>
                            <span className="font-mono font-black text-amber-700">{org.score}分</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Star Reporters & Auditors */}
                <div className="md:col-span-6 space-y-2">
                  {/* Star Reporters */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 space-y-1">
                    <div className="text-[11px] font-extrabold text-slate-700 flex justify-between items-center">
                      <span className="flex items-center space-x-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>金牌上报员 (质量考评)</span>
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">最高98.5分</span>
                    </div>
                    <div className="space-y-1">
                      {topReporters.map((r) => {
                        const matchedRep = mockReporterRecords.find(item => item.name.includes(r.name.split(' ')[0]));
                        return (
                          <div
                            key={r.name}
                            onClick={() => matchedRep && handleOpenProfile('reporter', matchedRep)}
                            className="flex items-center justify-between text-[10px] py-0.5 border-b border-slate-100 last:border-0 hover:bg-slate-100/60 rounded px-1 cursor-pointer transition-colors"
                          >
                            <span className="text-slate-700 font-medium truncate">{r.name} ({r.org})</span>
                            <span className="font-mono font-bold text-blue-700 shrink-0 ml-1">{r.score}分 · {r.directRate}直通</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Star Auditors */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 space-y-1">
                    <div className="text-[11px] font-extrabold text-slate-700 flex justify-between items-center">
                      <span className="flex items-center space-x-1">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>金牌审核员 (时效考评)</span>
                      </span>
                      <span className="text-[10px] text-purple-600 font-bold">均耗5.6分</span>
                    </div>
                    <div className="space-y-1">
                      {topAuditors.map((a) => {
                        const matchedAud = mockAuditorRecords.find(item => item.name.includes(a.name.split(' ')[0]));
                        return (
                          <div
                            key={a.name}
                            onClick={() => matchedAud && handleOpenProfile('auditor', matchedAud)}
                            className="flex items-center justify-between text-[10px] py-0.5 border-b border-slate-100 last:border-0 hover:bg-slate-100/60 rounded px-1 cursor-pointer transition-colors"
                          >
                            <span className="text-slate-700 font-medium truncate">{a.name} ({a.org})</span>
                            <span className="font-mono font-bold text-emerald-700 shrink-0 ml-1">{a.score}分 · {a.avgTime}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: Score Dimension Breakdown Bar */}
              <div className="p-2 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-1.5">
                <div className="text-[10px] font-extrabold text-indigo-950 flex justify-between items-center">
                  <span>本机构考核得分构成 (总计 98.5 / 100 分 · 卓越)</span>
                  <span className="text-emerald-700 font-bold">全市第 1</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[9px]">
                  <div className="bg-white p-1.5 rounded-lg border border-indigo-100 text-center">
                    <div className="text-slate-500">报送质量 (40分)</div>
                    <div className="text-xs font-black text-indigo-700 font-mono mt-0.5">39.5 分</div>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-indigo-100 text-center">
                    <div className="text-slate-500">报送总量 (30分)</div>
                    <div className="text-xs font-black text-blue-700 font-mono mt-0.5">29.2 分</div>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-indigo-100 text-center">
                    <div className="text-slate-500">时效与交办 (30分)</div>
                    <div className="text-xs font-black text-emerald-700 font-mono mt-0.5">29.8 分</div>
                  </div>
                </div>
              </div>

              {/* Evaluation Link Bar */}
              <div className="bg-indigo-50/60 p-2 rounded-lg border border-indigo-100 flex items-center justify-between text-[11px] text-indigo-950">
                <span className="truncate">
                  🎯 <strong>考核画像:</strong> 报送质量与响应时效双维度满分领跑，无违规扣分项。
                </span>
                <span className="text-indigo-700 font-bold shrink-0 text-[10px] ml-2">
                  卓越等次
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. 主考核榜单大台账 (根据当前视角动态呈现) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-50 text-[#1E5ABB] rounded-lg">
              {perspective === 'org' && <Building2 className="w-4 h-4" />}
              {perspective === 'reporter' && <FileText className="w-4 h-4" />}
              {perspective === 'auditor' && <UserCheck className="w-4 h-4" />}
              {perspective === 'category' && <Layers className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-gray-900">
                {perspective === 'org' && '全域机构综合考核评分大榜 (28家机构)'}
                {perspective === 'reporter' && `平台所有上报员考评排行与量化明细 (${staffScope === 'my_org' ? '仅本机构人员' : '平台全员 124人'})`}
                {perspective === 'auditor' && `平台所有审核员考评排行与时效明细 (${staffScope === 'my_org' ? '仅本机构人员' : '平台全员 42人'})`}
                {perspective === 'category' && '舆情分类业务条线考评榜'}
              </h3>
              <p className="text-[10px] text-gray-400">
                点击任意机构或人员行可穿透查看【5维能力雷达图、历史考评趋势、加减分明细及考评意见】
              </p>
            </div>
          </div>

          <span className="text-[11px] text-gray-400 font-mono">
            考核周期：{selectedPeriodLabel}
          </span>
        </div>

        {/* View 1: 机构综合考评榜 */}
        {perspective === 'org' && (
          <div className="space-y-5">
            {/* 全域机构综合多维宏观研判与对标看板 */}
            <AllOrgMacroSection onSelectOrg={handleSelectOrgMacro} />

            {/* 机构综合考核总台账大表 */}
            <div className="overflow-x-auto rounded-lg border border-slate-200/80">
              <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-gray-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-3 text-center w-12">排名</th>
                  <th className="py-3 px-4">机构名称 / 机构属性</th>
                  <th className="py-3 px-3 text-center">在册编制</th>
                  <th className="py-3 px-4">累计报送 (采纳/驳回/待审)</th>
                  <th className="py-3 px-3 text-center">首审直通率</th>
                  <th className="py-3 px-3 text-center">整体通过率</th>
                  <th className="py-3 px-3 text-center">平均响应</th>
                  <th className="py-3 px-3 text-center">人均贡献</th>
                  <th className="py-3 px-3 text-center">综合考评得分</th>
                  <th className="py-3 px-3 text-center">等次评定</th>
                  <th className="py-3 px-3 text-center">画像剖析</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredOrgList.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => handleOpenProfile('org', row)}
                    className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${row.isMyOrg ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      {row.rank <= 3 ? (
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-bold text-xs ${
                          row.rank === 1 ? 'bg-amber-100 text-amber-800' : row.rank === 2 ? 'bg-slate-100 text-slate-800' : 'bg-amber-900/10 text-amber-900'
                        }`}>
                          {row.rank}
                        </span>
                      ) : (
                        <span className="text-gray-500">{row.rank}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-extrabold text-gray-900">{row.name}</span>
                        {row.isMyOrg && (
                          <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                            本机构
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{row.type}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-gray-700">
                      {row.registeredStaff} 人
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="font-extrabold text-gray-900">{row.totalReports} 件</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        <span className="text-emerald-600">采纳 {row.adoptedReports}</span> / <span className="text-rose-600">驳回 {row.rejectedReports}</span> / <span className="text-amber-600">待审 {row.pendingReports}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                      {row.oneTimePassRate}%
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-blue-700">
                      {row.overallPassRate}%
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-purple-700 font-bold">
                      {row.avgResponseMin} 分
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-gray-800">
                      {row.perCapitaReport} 件
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-black text-amber-600 text-sm">
                      {row.totalScore}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        row.grade === '卓越'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : row.grade === '优秀'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-purple-50 text-purple-800 border-purple-200'
                      }`}>
                        {row.grade}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProfile('org', row);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                        title="查看深度画像"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* View 2: 平台所有上报员考评榜 (含本机构上报员与全平台人员) */}
        {perspective === 'reporter' && (
          <div className="overflow-x-auto rounded-lg border border-slate-200/80">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-gray-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-3 text-center w-12">全域排名</th>
                  <th className="py-3 px-4">上报员姓名 / 所属机构</th>
                  <th className="py-3 px-4">累计上报 (采纳/驳回/待审)</th>
                  <th className="py-3 px-3 text-center">首审直通率</th>
                  <th className="py-3 px-3 text-center">整体通过率</th>
                  <th className="py-3 px-3 text-center">累加总积分</th>
                  <th className="py-3 px-3 text-center">单条均分</th>
                  <th className="py-3 px-3 text-center">环比升降</th>
                  <th className="py-3 px-3 text-center">等次评定</th>
                  <th className="py-3 px-3 text-center">画像剖析</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredReporterList.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => handleOpenProfile('reporter', row)}
                    className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${row.isMyOrg ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      {row.rank <= 3 ? (
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-bold text-xs ${
                          row.rank === 1 ? 'bg-amber-100 text-amber-800' : row.rank === 2 ? 'bg-slate-100 text-slate-800' : 'bg-amber-900/10 text-amber-900'
                        }`}>
                          #{row.rank}
                        </span>
                      ) : (
                        <span className="text-gray-500 font-mono">#{row.rank}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-extrabold text-gray-900">{row.name}</span>
                        {row.isLeader && (
                          <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                            标兵
                          </span>
                        )}
                        {row.isMyOrg && (
                          <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                            本机构
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{row.org}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="font-extrabold text-gray-900">{row.totalReports} 件</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        <span className="text-emerald-600">采纳 {row.adoptedReports}</span> / <span className="text-rose-600">驳回 {row.rejectedReports}</span> / <span className="text-amber-600">待审 {row.pendingReports}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                      {row.oneTimePassRate}%
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-blue-700">
                      {row.overallPassRate}%
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-black text-amber-600 text-sm">
                      {row.totalScore.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-gray-700 font-bold">
                      {row.avgScore}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-700 font-bold">
                      {row.momChange}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        row.grade === '卓越'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : row.grade === '优秀'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-purple-50 text-purple-800 border-purple-200'
                      }`}>
                        {row.grade}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProfile('reporter', row);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                        title="查看深度画像"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* View 3: 平台所有审核员考评榜 (含本机构审核员与全平台人员) */}
        {perspective === 'auditor' && (
          <div className="overflow-x-auto rounded-lg border border-slate-200/80">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-gray-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-3 text-center w-12">全域排名</th>
                  <th className="py-3 px-4">审核员姓名 / 所属机构</th>
                  <th className="py-3 px-4">累计审核 (通过/驳回/待审)</th>
                  <th className="py-3 px-3 text-center">审核处理率</th>
                  <th className="py-3 px-3 text-center">平均响应耗时</th>
                  <th className="py-3 px-3 text-center">累加总积分</th>
                  <th className="py-3 px-3 text-center">单条均分</th>
                  <th className="py-3 px-3 text-center">环比升降</th>
                  <th className="py-3 px-3 text-center">等次评定</th>
                  <th className="py-3 px-3 text-center">画像剖析</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredAuditorList.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => handleOpenProfile('auditor', row)}
                    className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${row.isMyOrg ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      {row.rank <= 3 ? (
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-bold text-xs ${
                          row.rank === 1 ? 'bg-amber-100 text-amber-800' : row.rank === 2 ? 'bg-slate-100 text-slate-800' : 'bg-amber-900/10 text-amber-900'
                        }`}>
                          #{row.rank}
                        </span>
                      ) : (
                        <span className="text-gray-500 font-mono">#{row.rank}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-extrabold text-gray-900">{row.name}</span>
                        {row.isLeader && (
                          <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                            标兵
                          </span>
                        )}
                        {row.isMyOrg && (
                          <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                            本机构
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{row.org}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="font-extrabold text-gray-900">{row.totalAudited} 件</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        <span className="text-emerald-600">通过 {row.passedAudits}</span> / <span className="text-rose-600">驳回 {row.rejectedAudits}</span> / <span className="text-amber-600">待审 {row.pendingAudits}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                      {row.auditProcessRate}%
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-purple-700 font-bold">
                      {row.avgResponseMin} 分钟
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-black text-amber-600 text-sm">
                      {row.totalScore.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-gray-700 font-bold">
                      {row.avgScore}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-700 font-bold">
                      {row.momChange}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        row.grade === '卓越'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : row.grade === '优秀'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-purple-50 text-purple-800 border-purple-200'
                      }`}>
                        {row.grade}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProfile('auditor', row);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                        title="查看深度画像"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 考核赋分规则 Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-[#1E5ABB] to-blue-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">全域舆情工作综合考核与量化赋分实施细则</h3>
              </div>
              <button
                onClick={() => setShowRuleModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs text-gray-600 leading-relaxed max-h-[70vh] overflow-y-auto">
              <div className="space-y-1.5">
                <h4 className="font-bold text-gray-900 text-sm flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span>一、机构综合考核赋分构成 (总权重大纲)</span>
                </h4>
                <p>1. <strong>报送采纳质效 (40%)</strong>：基础采纳量赋分，按信息评级（A级/B级/C级）加权计入。</p>
                <p>2. <strong>一次性直通激励 (25%)</strong>：首审一次性通过率超过 80% 的机构，享受阶梯式质效加分。</p>
                <p>3. <strong>审核与研判时效 (25%)</strong>：按审核员平均响应耗时考核，10分钟以内响应给予满分，超时按档扣减。</p>
                <p>4. <strong>负面交办闭环率 (10%)</strong>：交办任务按期办结并形成闭环报告者满分，逾期扣除对应分值。</p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-gray-900 text-sm flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>二、上报员个人积分与考核规则</span>
                </h4>
                <p>• <strong>采纳基础分</strong>：每条被采纳信息计 90~100 分；</p>
                <p>• <strong>首审直通奖励</strong>：一次性直通不返修加 10 分/件；</p>
                <p>• <strong>返修扣分</strong>：因格式不全或要素缺失被驳回返修，扣减 15 分/件。</p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-gray-900 text-sm flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  <span>三、审核员个人效能与考核规则</span>
                </h4>
                <p>• <strong>审结基础分</strong>：每审结一条舆情记录 95~100 分；</p>
                <p>• <strong>极速响应激励</strong>：平均耗时低于 10 分钟给予极速响应专项考评加分；</p>
                <p>• <strong>滞留预警惩戒</strong>：审核件滞留超 2 小时未处理触发系统预警并扣除考评分。</p>
              </div>
            </div>
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowRuleModal(false)}
                className="px-4 py-1.5 bg-[#1E5ABB] text-white rounded-lg text-xs font-bold hover:bg-blue-700"
              >
                已了解
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 深度画像剖析 Modal (EvaluationProfileModal) */}
      <EvaluationProfileModal
        data={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        periodText={selectedPeriodLabel}
      />
    </div>
  );
};
