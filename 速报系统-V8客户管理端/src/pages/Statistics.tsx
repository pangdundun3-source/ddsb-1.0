import React, { useState, useMemo } from 'react';
import { PageId } from '../types';
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
  Download,
  Filter,
  BarChart2,
  PieChart as PieChartIcon,
  Printer,
  ChevronRight,
  Layers,
  ArrowUpRight,
  Check,
  UserCheck,
  Zap,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  BadgeAlert,
  Sparkles,
  SlidersHorizontal,
  FileCheck,
  Eye,
  Sliders,
  ChevronDown,
  Globe,
  Trophy
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  CartesianGrid
} from 'recharts';
import { AllOrgMacroSection, OrgMacroData } from '../components/AllOrgMacroSection';
import { AllOrgTrendSection } from '../components/AllOrgTrendSection';
import { EvaluationProfileModal, ProfileDetailData } from '../components/EvaluationProfileModal';

export type TimeDimension = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
export type ViewScope = 'all_orgs' | 'current_org';

// Pre-defined Organization Options & Metadata
export const ORG_OPTIONS = [
  { id: 'all', name: '全域所有机构 (28家)', shortName: '全域大盘', isGlobal: true, staff: 654, reporters: 486, auditors: 168, total: 10480, passed: 9370, rejected: 780, pending: 330, directRate: 77.4, passRate: 89.4, avgTime: 13.8, avgScore: 88.6, perCapita: 21.6 },
  { id: '中共台中市委宣传部', name: '中共台中市委宣传部 (本机构)', shortName: '市委宣传部', isMyOrg: true, staff: 45, reporters: 32, auditors: 13, total: 1580, passed: 1520, rejected: 35, pending: 25, directRate: 88.6, passRate: 96.2, avgTime: 6.8, avgScore: 98.5, perCapita: 49.4 },
  { id: '台中市网信办', name: '台中市网信办', shortName: '市网信办', isMyOrg: false, staff: 38, reporters: 26, auditors: 12, total: 1350, passed: 1280, rejected: 42, pending: 28, directRate: 86.4, passRate: 94.8, avgTime: 8.5, avgScore: 95.8, perCapita: 51.9 },
  { id: '西屯区网信办', name: '西屯区网信办', shortName: '西屯网信办', isMyOrg: false, staff: 40, reporters: 28, auditors: 12, total: 1120, passed: 1030, rejected: 58, pending: 32, directRate: 82.5, passRate: 92.0, avgTime: 10.8, avgScore: 93.2, perCapita: 40.0 },
  { id: '台中市大数据中心', name: '台中市大数据中心', shortName: '大数据中心', isMyOrg: false, staff: 40, reporters: 29, auditors: 11, total: 980, passed: 890, rejected: 60, pending: 30, directRate: 81.0, passRate: 90.8, avgTime: 12.2, avgScore: 91.5, perCapita: 33.8 },
  { id: '东湖区委宣传部', name: '东湖区委宣传部', shortName: '东湖宣传部', isMyOrg: false, staff: 38, reporters: 28, auditors: 10, total: 850, passed: 750, rejected: 65, pending: 35, directRate: 77.8, passRate: 88.2, avgTime: 14.5, avgScore: 89.4, perCapita: 30.4 },
  { id: '北屯区宣传部', name: '北屯区宣传部', shortName: '北屯宣传部', isMyOrg: false, staff: 35, reporters: 25, auditors: 10, total: 720, passed: 630, rejected: 55, pending: 35, directRate: 75.0, passRate: 87.5, avgTime: 15.0, avgScore: 87.8, perCapita: 28.8 },
  { id: '南屯区网信办', name: '南屯区网信办', shortName: '南屯网信办', isMyOrg: false, staff: 34, reporters: 24, auditors: 10, total: 680, passed: 590, rejected: 52, pending: 38, directRate: 74.2, passRate: 86.8, avgTime: 15.5, avgScore: 86.9, perCapita: 28.3 },
  { id: '高新区管委会', name: '高新区管委会', shortName: '高新区管委会', isMyOrg: false, staff: 30, reporters: 22, auditors: 8, total: 590, passed: 510, rejected: 48, pending: 32, directRate: 73.0, passRate: 86.4, avgTime: 16.0, avgScore: 85.7, perCapita: 26.8 },
  { id: '市公安局网安支队', name: '市公安局网安支队', shortName: '市公安局网安', isMyOrg: false, staff: 28, reporters: 20, auditors: 8, total: 562, passed: 490, rejected: 44, pending: 28, directRate: 74.5, passRate: 87.2, avgTime: 13.8, avgScore: 86.2, perCapita: 28.1 }
];

export interface StatisticsProps {
  onNavigate?: (page: PageId) => void;
}

export const Statistics: React.FC<StatisticsProps> = ({ onNavigate }) => {
  // Global View Scope (机构管理员视角: 本机构 vs 平台全域)
  const [viewScope, setViewScope] = useState<ViewScope>('all_orgs');
  const [currentOrg] = useState('中共台中市委宣传部');
  
  // Time and Filter States
  const [timeDim, setTimeDim] = useState<TimeDimension>('week');
  const [startDate, setStartDate] = useState('2026-08-04');
  const [endDate, setEndDate] = useState('2026-08-11');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState('all');

  // Staff Sub-filter in Tables (平台所有人 vs 本机构人员)
  const [staffScopeFilter, setStaffScopeFilter] = useState<'all' | 'my_org'>('all');

  // Active Main Section Tab in Page
  const [activeTab, setActiveTab] = useState<'overview' | 'reporters' | 'auditors' | 'data_tables'>('overview');

  // Active Line Toggle States for Reporter Trend Chart
  const [reporterLines, setReporterLines] = useState({
    total: true,
    passed: true,
    rejected: true,
    directRate: true,
    passRate: true,
    score: true
  });

  // Active Line Toggle States for Auditor Trend Chart
  const [auditorLines, setAuditorLines] = useState({
    total: true,
    passed: true,
    rejected: true,
    avgTime: true
  });

  // Table Tab inside Master Records
  const [tableTab, setTableTab] = useState<'org' | 'reporter' | 'auditor' | 'category' | 'negative'>('org');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Selected Profile for Drilldown Modal
  const [selectedProfile, setSelectedProfile] = useState<ProfileDetailData | null>(null);

  const handleOpenOrgProfile = (org: any) => {
    setSelectedProfile({
      id: `org-${org.rank}`,
      name: org.name,
      type: 'org',
      subTitle: org.type || '市级直属单位',
      rank: org.rank,
      totalScore: org.passRate ? parseFloat(org.passRate) : 96.2,
      grade: org.grade || '卓越',
      stats: [
        { label: '在册总人数', value: `${org.staff || 40} 人`, subLabel: `上报${org.reporters || 28} / 审核${org.auditors || 12}` },
        { label: '累计上报量', value: `${org.total} 件`, subLabel: `采纳 ${org.passed} 件`, isHighlight: true },
        { label: '首审直通率', value: org.directRate ? (typeof org.directRate === 'number' ? `${org.directRate}%` : org.directRate) : '85.0%', isHighlight: true },
        { label: '审核响应时长', value: org.avgTime ? (typeof org.avgTime === 'number' ? `${org.avgTime} 分钟` : org.avgTime) : '10.5 分钟' }
      ],
      radarData: [
        { subject: '报送活跃', value: 95, fullMark: 100 },
        { subject: '采纳质量', value: 96, fullMark: 100 },
        { subject: '首审直通', value: 88, fullMark: 100 },
        { subject: '响应时效', value: 92, fullMark: 100 },
        { subject: '闭环成效', value: 98, fullMark: 100 }
      ],
      historyScores: [
        { month: '4月', score: 92.5 },
        { month: '5月', score: 94.0 },
        { month: '6月', score: 95.8 },
        { month: '7月', score: 96.2 },
        { month: '8月', score: 98.0 }
      ],
      breakdown: [
        { category: '报送采纳', item: '基础采纳得分', points: '+40.0', desc: `完成 ${org.passed} 件采纳有效上报` },
        { category: '首审直通', item: '一次性过审激励', points: '+25.0', desc: '一次性过审率位列前茅' },
        { category: '响应时效', item: '极速审核奖励', points: '+24.5', desc: '平均审核时效优于全域基准' },
        { category: '负面闭环', item: '闭环履约率', points: '+9.8', desc: '负面交办单 100% 按期闭环' }
      ],
      summaryEvaluation: `该机构在全域 ${org.rank} 名，报送体量与过审质量兼优，人员编制在册活跃率高，是全域重点示范标杆单位。`
    });
  };

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
    setSelectedOrgFilter('all');
    setStaffScopeFilter('all');
    setSearchQuery('');
    setReporterLines({
      total: true,
      passed: true,
      rejected: true,
      directRate: true,
      passRate: true,
      score: true
    });
    setAuditorLines({
      total: true,
      passed: true,
      rejected: true,
      avgTime: true
    });
  };

  // Current active organization profile
  const activeOrgInfo = useMemo(() => {
    return ORG_OPTIONS.find(o => o.id === selectedOrgFilter) || ORG_OPTIONS[0];
  }, [selectedOrgFilter]);

  const isGlobalView = selectedOrgFilter === 'all';

  // Dynamic Reporter Trend Data (Weekly / Daily reflecting Global vs Specific Org)
  const reporterTrendData = useMemo(() => {
    if (isGlobalView) {
      return [
        { label: '周一', total: 1280, passed: 1150, rejected: 85, directRate: 75.2, passRate: 89.8, score: 86.5 },
        { label: '周二', total: 1420, passed: 1280, rejected: 92, directRate: 76.0, passRate: 90.1, score: 87.2 },
        { label: '周三', total: 1650, passed: 1490, rejected: 110, directRate: 78.4, passRate: 90.3, score: 88.6 },
        { label: '周四', total: 1560, passed: 1410, rejected: 98, directRate: 77.8, passRate: 90.4, score: 88.2 },
        { label: '周五', total: 1820, passed: 1650, rejected: 125, directRate: 79.5, passRate: 90.7, score: 89.5 },
        { label: '周六', total: 1320, passed: 1180, rejected: 90, directRate: 76.5, passRate: 89.4, score: 87.8 },
        { label: '周日', total: 1430, passed: 1210, rejected: 180, directRate: 77.4, passRate: 89.4, score: 88.5 }
      ];
    }
    const scale = (activeOrgInfo.total || 1580) / 1580;
    return [
      { label: '周一', total: Math.round(210 * scale), passed: Math.round(202 * scale), rejected: Math.round(5 * scale), directRate: activeOrgInfo.directRate, passRate: activeOrgInfo.passRate, score: activeOrgInfo.avgScore },
      { label: '周二', total: Math.round(225 * scale), passed: Math.round(218 * scale), rejected: Math.round(4 * scale), directRate: Number((activeOrgInfo.directRate * 1.01).toFixed(1)), passRate: activeOrgInfo.passRate, score: activeOrgInfo.avgScore },
      { label: '周三', total: Math.round(250 * scale), passed: Math.round(242 * scale), rejected: Math.round(6 * scale), directRate: Number((activeOrgInfo.directRate * 1.02).toFixed(1)), passRate: activeOrgInfo.passRate, score: activeOrgInfo.avgScore },
      { label: '周四', total: Math.round(235 * scale), passed: Math.round(226 * scale), rejected: Math.round(5 * scale), directRate: activeOrgInfo.directRate, passRate: activeOrgInfo.passRate, score: activeOrgInfo.avgScore },
      { label: '周五', total: Math.round(270 * scale), passed: Math.round(262 * scale), rejected: Math.round(7 * scale), directRate: Number((activeOrgInfo.directRate * 1.03).toFixed(1)), passRate: activeOrgInfo.passRate, score: activeOrgInfo.avgScore },
      { label: '周六', total: Math.round(190 * scale), passed: Math.round(182 * scale), rejected: Math.round(4 * scale), directRate: activeOrgInfo.directRate, passRate: activeOrgInfo.passRate, score: activeOrgInfo.avgScore },
      { label: '周日', total: Math.round(200 * scale), passed: Math.round(188 * scale), rejected: Math.round(4 * scale), directRate: activeOrgInfo.directRate, passRate: activeOrgInfo.passRate, score: activeOrgInfo.avgScore }
    ];
  }, [isGlobalView, activeOrgInfo]);

  // Dynamic Auditor Trend Data (Weekly reflecting Global vs Specific Org)
  const auditorTrendData = useMemo(() => {
    if (isGlobalView) {
      return [
        { label: '周一', total: 1180, passed: 1090, rejected: 75, avgTime: 14.8 },
        { label: '周二', total: 1320, passed: 1220, rejected: 82, avgTime: 14.2 },
        { label: '周三', total: 1540, passed: 1440, rejected: 95, avgTime: 13.5 },
        { label: '周四', total: 1460, passed: 1360, rejected: 88, avgTime: 13.6 },
        { label: '周五', total: 1750, passed: 1630, rejected: 105, avgTime: 12.9 },
        { label: '周六', total: 1240, passed: 1150, rejected: 80, avgTime: 14.5 },
        { label: '周日', total: 1370, passed: 1260, rejected: 95, avgTime: 13.8 }
      ];
    }
    const scale = (activeOrgInfo.total || 1580) / 1580;
    return [
      { label: '周一', total: Math.round(205 * scale), passed: Math.round(195 * scale), rejected: Math.round(8 * scale), avgTime: Number((activeOrgInfo.avgTime * 1.05).toFixed(1)) },
      { label: '周二', total: Math.round(220 * scale), passed: Math.round(210 * scale), rejected: Math.round(7 * scale), avgTime: activeOrgInfo.avgTime },
      { label: '周三', total: Math.round(245 * scale), passed: Math.round(235 * scale), rejected: Math.round(9 * scale), avgTime: Number((activeOrgInfo.avgTime * 0.95).toFixed(1)) },
      { label: '周四', total: Math.round(230 * scale), passed: Math.round(220 * scale), rejected: Math.round(8 * scale), avgTime: activeOrgInfo.avgTime },
      { label: '周五', total: Math.round(265 * scale), passed: Math.round(252 * scale), rejected: Math.round(11 * scale), avgTime: Number((activeOrgInfo.avgTime * 0.92).toFixed(1)) },
      { label: '周六', total: Math.round(175 * scale), passed: Math.round(165 * scale), rejected: Math.round(6 * scale), avgTime: Number((activeOrgInfo.avgTime * 1.08).toFixed(1)) },
      { label: '周日', total: Math.round(180 * scale), passed: Math.round(170 * scale), rejected: Math.round(6 * scale), avgTime: activeOrgInfo.avgTime }
    ];
  }, [isGlobalView, activeOrgInfo]);

  // Reporter Donut Data
  const reporterDonutData = useMemo(() => {
    if (isGlobalView) {
      return [
        { name: '一次性通过', value: 8110, displayVal: '8,110 件', color: '#10B981' },
        { name: '返修通过', value: 1260, displayVal: '1,260 件', color: '#1E5ABB' },
        { name: '待审核', value: 660, displayVal: '660 件', color: '#94A3B8' },
        { name: '驳回', value: 450, displayVal: '450 件', color: '#EF4444' }
      ];
    }
    const direct = Math.round(activeOrgInfo.total * (activeOrgInfo.directRate / 100));
    const passed = activeOrgInfo.passed || 1520;
    const repaired = Math.max(0, passed - direct);
    const rejected = activeOrgInfo.rejected || 35;
    const pending = activeOrgInfo.pending || 25;
    return [
      { name: '一次性通过', value: direct, displayVal: `${direct.toLocaleString()} 件`, color: '#10B981' },
      { name: '返修通过', value: repaired, displayVal: `${repaired.toLocaleString()} 件`, color: '#1E5ABB' },
      { name: '待审核', value: pending, displayVal: `${pending.toLocaleString()} 件`, color: '#94A3B8' },
      { name: '驳回', value: rejected, displayVal: `${rejected.toLocaleString()} 件`, color: '#EF4444' }
    ];
  }, [isGlobalView, activeOrgInfo]);

  // Auditor Donut Data
  const auditorDonutData = useMemo(() => {
    if (isGlobalView) {
      return [
        { name: '审核通过', value: 9240, displayVal: '9,240 件', color: '#10B981' },
        { name: '审核驳回', value: 620, displayVal: '620 件', color: '#EF4444' },
        { name: '待审核', value: 120, displayVal: '120 件', color: '#94A3B8' }
      ];
    }
    const passed = activeOrgInfo.passed || 1420;
    const rejected = activeOrgInfo.rejected || 75;
    const pending = activeOrgInfo.pending || 25;
    return [
      { name: '审核通过', value: passed, displayVal: `${passed.toLocaleString()} 件`, color: '#10B981' },
      { name: '审核驳回', value: rejected, displayVal: `${rejected.toLocaleString()} 件`, color: '#EF4444' },
      { name: '待审核', value: pending, displayVal: `${pending.toLocaleString()} 件`, color: '#94A3B8' }
    ];
  }, [isGlobalView, activeOrgInfo]);

  const reporterTotalCount = useMemo(() => {
    return isGlobalView ? 10480 : (activeOrgInfo.total || 1580);
  }, [isGlobalView, activeOrgInfo]);

  const auditorTotalCount = useMemo(() => {
    return isGlobalView ? 9860 : ((activeOrgInfo.passed || 1520) + (activeOrgInfo.rejected || 75) + (activeOrgInfo.pending || 25));
  }, [isGlobalView, activeOrgInfo]);

  // Institutional Comparison Chart Data (28家机构总报送与采纳量排行对比)
  const orgComparisonData = [
    { name: '市委宣传部', total: 1580, passed: 1520, passRate: 96.2, isMyOrg: true },
    { name: '市网信办', total: 1350, passed: 1280, passRate: 94.8, isMyOrg: false },
    { name: '西屯网信办', total: 1120, passed: 1030, passRate: 92.0, isMyOrg: false },
    { name: '大数据中心', total: 980, passed: 890, passRate: 90.8, isMyOrg: false },
    { name: '东湖宣传部', total: 850, passed: 750, passRate: 88.2, isMyOrg: false },
    { name: '北屯宣传部', total: 720, passed: 630, passRate: 87.5, isMyOrg: false },
    { name: '南屯宣传部', total: 680, passed: 590, passRate: 86.8, isMyOrg: false },
    { name: '高新区管委会', total: 590, passed: 510, passRate: 86.4, isMyOrg: false },
    { name: '市公安局网安', total: 562, passed: 490, passRate: 87.2, isMyOrg: false }
  ];

  // 1. 全域机构总数据与报送效能台账
  const orgDetailTable = [
    { rank: 1, name: '中共台中市委宣传部', isMyOrg: true, type: '市级党政主体', staff: 45, reporters: 32, auditors: 13, total: 1580, passed: 1520, rejected: 35, pending: 25, directRate: '88.6%', passRate: '96.2%', avgTime: '6.8分', perCapita: 35.1, negatives: 18, closedRate: '100%', grade: '卓越' },
    { rank: 2, name: '台中市网信办', isMyOrg: false, type: '网安指挥主管', staff: 38, reporters: 26, auditors: 12, total: 1350, passed: 1280, rejected: 42, pending: 28, directRate: '86.4%', passRate: '94.8%', avgTime: '8.5分', perCapita: 35.5, negatives: 24, closedRate: '98.5%', grade: '卓越' },
    { rank: 3, name: '西屯区网信办', isMyOrg: false, type: '区县直属局', staff: 40, reporters: 28, auditors: 12, total: 1120, passed: 1030, rejected: 58, pending: 32, directRate: '82.5%', passRate: '92.0%', avgTime: '10.8分', perCapita: 28.0, negatives: 15, closedRate: '97.8%', grade: '优秀' },
    { rank: 4, name: '台中市大数据中心', isMyOrg: false, type: '独立直属单位', staff: 40, reporters: 29, auditors: 11, total: 980, passed: 890, rejected: 60, pending: 30, directRate: '81.0%', passRate: '90.8%', avgTime: '12.2分', perCapita: 24.5, negatives: 12, closedRate: '96.0%', grade: '良好' },
    { rank: 5, name: '东湖区委宣传部', isMyOrg: false, type: '区县直属局', staff: 38, reporters: 28, auditors: 10, total: 850, passed: 750, rejected: 65, pending: 35, directRate: '77.8%', passRate: '88.2%', avgTime: '14.5分', perCapita: 22.4, negatives: 10, closedRate: '95.0%', grade: '良好' },
    { rank: 6, name: '北屯区宣传部', isMyOrg: false, type: '区县直属局', staff: 35, reporters: 25, auditors: 10, total: 720, passed: 630, rejected: 55, pending: 35, directRate: '75.0%', passRate: '87.5%', avgTime: '15.0分', perCapita: 20.6, negatives: 8, closedRate: '94.2%', grade: '合格' },
    { rank: 7, name: '南屯区网信办', isMyOrg: false, type: '区县直属局', staff: 34, reporters: 24, auditors: 10, total: 680, passed: 590, rejected: 52, pending: 38, directRate: '74.2%', passRate: '86.8%', avgTime: '15.5分', perCapita: 20.0, negatives: 6, closedRate: '93.5%', grade: '合格' },
    { rank: 8, name: '高新区管委会', isMyOrg: false, type: '独立直属单位', staff: 30, reporters: 22, auditors: 8, total: 590, passed: 510, rejected: 48, pending: 32, directRate: '73.0%', passRate: '86.4%', avgTime: '16.0分', perCapita: 19.6, negatives: 5, closedRate: '92.0%', grade: '合格' }
  ];

  // 2. 平台所有上报员绩效统计台账 (含本机构上报员与全平台人员)
  const reporterDetailTable = [
    { rank: 1, name: '张三', isMyOrg: true, org: '中共台中市委宣传部', total: 42, passed: 36, rejected: 3, pending: 3, directRate: '85.7%', passRate: '92.9%', score: 3986.5, avgScore: 94.9, active: '99.8%', grade: '卓越', status: '在岗' },
    { rank: 2, name: '王五', isMyOrg: false, org: '台中市大数据中心', total: 38, passed: 32, rejected: 3, pending: 3, directRate: '84.2%', passRate: '89.5%', score: 3560.0, avgScore: 93.7, active: '98.5%', grade: '卓越', status: '在岗' },
    { rank: 3, name: '赵六', isMyOrg: false, org: '西屯区网信办', total: 35, passed: 29, rejected: 4, pending: 2, directRate: '80.0%', passRate: '85.7%', score: 3120.0, avgScore: 89.1, active: '96.2%', grade: '优秀', status: '在岗' },
    { rank: 4, name: '孙七', isMyOrg: false, org: '东湖区委宣传部', total: 31, passed: 25, rejected: 4, pending: 2, directRate: '77.4%', passRate: '83.9%', score: 2680.0, avgScore: 86.5, active: '95.0%', grade: '优秀', status: '在岗' },
    { rank: 5, name: '李四', isMyOrg: false, org: '台中市网信办', total: 28, passed: 22, rejected: 4, pending: 2, directRate: '75.0%', passRate: '82.1%', score: 2350.0, avgScore: 83.9, active: '94.0%', grade: '良好', status: '在岗' },
    { rank: 6, name: '周志明', isMyOrg: true, org: '中共台中市委宣传部', total: 26, passed: 21, rejected: 3, pending: 2, directRate: '76.9%', passRate: '80.8%', score: 2180.0, avgScore: 83.8, active: '93.5%', grade: '良好', status: '在岗' },
    { rank: 7, name: '刘芳', isMyOrg: true, org: '中共台中市委宣传部', total: 24, passed: 19, rejected: 3, pending: 2, directRate: '75.0%', passRate: '79.2%', score: 2010.0, avgScore: 83.7, active: '92.0%', grade: '良好', status: '在岗' },
    { rank: 8, name: '吴强', isMyOrg: false, org: '北屯区宣传部', total: 22, passed: 17, rejected: 3, pending: 2, directRate: '72.7%', passRate: '77.3%', score: 1820.0, avgScore: 82.7, active: '90.5%', grade: '合格', status: '在岗' }
  ];

  // 3. 平台所有审核员效能统计台账 (含本机构审核员与全平台人员)
  const auditorDetailTable = [
    { rank: 1, name: '王主任', isMyOrg: true, org: '中共台中市委宣传部', audited: 156, passed: 142, rejected: 10, pending: 4, processRate: '97.5%', avgTime: '6.8分钟', totalScore: 15210.0, avgScore: 97.5, grade: '卓越', status: '在岗' },
    { rank: 2, name: '李明', isMyOrg: false, org: '台中市网信办', audited: 138, passed: 124, rejected: 9, pending: 5, processRate: '96.4%', avgTime: '7.9分钟', totalScore: 13248.0, avgScore: 96.0, grade: '卓越', status: '在岗' },
    { rank: 3, name: '陈科长', isMyOrg: false, org: '台中市大数据中心', audited: 120, passed: 106, rejected: 8, pending: 6, processRate: '95.0%', avgTime: '8.8分钟', totalScore: 11160.0, avgScore: 93.0, grade: '优秀', status: '在岗' },
    { rank: 4, name: '周主管', isMyOrg: false, org: '西屯区网信办', audited: 95, passed: 82, rejected: 8, pending: 5, processRate: '94.7%', avgTime: '11.2分钟', totalScore: 8455.0, avgScore: 89.0, grade: '良好', status: '在岗' },
    { rank: 5, name: '韩科长', isMyOrg: true, org: '中共台中市委宣传部', audited: 92, passed: 80, rejected: 7, pending: 5, processRate: '94.6%', avgTime: '9.2分钟', totalScore: 8188.0, avgScore: 89.0, grade: '良好', status: '在岗' },
    { rank: 6, name: '徐副主任', isMyOrg: false, org: '东湖区委宣传部', audited: 78, passed: 67, rejected: 6, pending: 5, processRate: '93.6%', avgTime: '12.5分钟', totalScore: 6786.0, avgScore: 87.0, grade: '合格', status: '在岗' }
  ];

  // 4. 舆情分类台账
  const categoryDetailTable = [
    { rank: 1, name: '突发舆情事件速报', leadOrg: '台中市网信办', total: 3420, passed: 3180, passRate: '93.0%', avgTime: '8.5分', ratio: '40.5%', risk: '高风险' },
    { rank: 2, name: '民生热点诉求核查', leadOrg: '中共台中市委宣传部', total: 2850, passed: 2590, passRate: '90.9%', avgTime: '11.2分', ratio: '33.8%', risk: '中风险' },
    { rank: 3, name: '网络谣言与辟谣澄清', leadOrg: '市公安局网安支队', total: 1420, passed: 1260, passRate: '88.7%', avgTime: '12.0分', ratio: '16.8%', risk: '高风险' },
    { rank: 4, name: '重大政策解读反响', leadOrg: '市发改委/政研室', total: 742, passed: 630, passRate: '84.9%', avgTime: '16.5分', ratio: '8.9%', risk: '低风险' }
  ];

  // 5. 负面舆情转办台账
  const negativeDetailTable = [
    { id: 'TS-20260811-01', title: '关于某大型小区二次供水管网破裂停水舆情', org: '市水务集团 / 西屯区网信办', isMyOrg: false, time: '2026-08-11 10:15', status: '办理中', deadline: '剩余 2 小时', level: '高风险' },
    { id: 'TS-20260810-04', title: '东湖区部分高新技术园区晚高峰交通拥堵关切', org: '中共台中市委宣传部 / 市交警支队', isMyOrg: true, time: '2026-08-10 16:30', status: '已办结', deadline: '已按时办结', level: '中风险' },
    { id: 'TS-20260809-02', title: '网传“某生鲜市场物价异常上涨”不实辟谣', org: '中共台中市委宣传部 / 市网信办', isMyOrg: true, time: '2026-08-09 11:20', status: '已办结', deadline: '已发布通告', level: '高风险' }
  ];

  // Filtered Reporters & Auditors
  const filteredReporters = useMemo(() => {
    return reporterDetailTable.filter((item) => {
      const matchSearch = item.name.includes(searchQuery) || item.org.includes(searchQuery);
      if (staffScopeFilter === 'my_org') {
        return matchSearch && item.isMyOrg;
      }
      return matchSearch;
    });
  }, [reporterDetailTable, searchQuery, staffScopeFilter]);

  const filteredAuditors = useMemo(() => {
    return auditorDetailTable.filter((item) => {
      const matchSearch = item.name.includes(searchQuery) || item.org.includes(searchQuery);
      if (staffScopeFilter === 'my_org') {
        return matchSearch && item.isMyOrg;
      }
      return matchSearch;
    });
  }, [auditorDetailTable, searchQuery, staffScopeFilter]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-[#1E5ABB] text-white px-4 py-2.5 rounded-xl shadow-xl border border-blue-400/30 flex items-center space-x-2 text-xs animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. 机构管理员控制台全局头部 (Executive Header & Identity & Filter Bar) */}
      <div className="bg-white px-5 py-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-[#1E5ABB] to-blue-700 text-white rounded-xl shadow-2xs flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-extrabold text-gray-900 tracking-tight">
                  统计管理与效能分析
                </h1>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                实时穿透本机构与平台全域数据，全景量化机构总指标、上报员及审核员全员效能表现
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => showToast('已成功导出【全域统计管理宏观与机构总数据分析表_2026.xlsx】！')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg shadow-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出全景报表</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 shadow-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>打印统计报告</span>
            </button>
          </div>
        </div>

        {/* Global Toolbar: 统计周期 & 视角切换 & 机构选择 */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: View Scope & Time Dimension Tabs */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Scope Switcher */}
            <div className="flex items-center bg-blue-50/80 p-0.5 rounded-lg border border-blue-200">
              <button
                onClick={() => setViewScope('all_orgs')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                  viewScope === 'all_orgs'
                    ? 'bg-[#1E5ABB] text-white shadow-2xs font-bold'
                    : 'text-blue-900 hover:text-blue-950 font-medium'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>全域 28 家机构大盘</span>
              </button>
              <button
                onClick={() => setViewScope('current_org')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                  viewScope === 'current_org'
                    ? 'bg-[#1E5ABB] text-white shadow-2xs font-bold'
                    : 'text-blue-900 hover:text-blue-950 font-medium'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>本机构效能穿透</span>
              </button>
            </div>

            {/* Time Dimension Tabs */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => handleTimeDimChange('day')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  timeDim === 'day' ? 'bg-[#1E5ABB] text-white shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                日(今日)
              </button>
              <button
                onClick={() => handleTimeDimChange('week')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  timeDim === 'week' ? 'bg-[#1E5ABB] text-white shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                周(本周)
              </button>
              <button
                onClick={() => handleTimeDimChange('month')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  timeDim === 'month' ? 'bg-[#1E5ABB] text-white shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                月(本月)
              </button>
              <button
                onClick={() => handleTimeDimChange('quarter')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  timeDim === 'quarter' ? 'bg-[#1E5ABB] text-white shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                季度
              </button>
              <button
                onClick={() => handleTimeDimChange('year')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  timeDim === 'year' ? 'bg-[#1E5ABB] text-white shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                年度
              </button>
              <button
                onClick={() => handleTimeDimChange('custom')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  timeDim === 'custom' ? 'bg-[#1E5ABB] text-white shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                自定义
              </button>
            </div>
          </div>

          {/* Right: Date Picker & Org Filter & Perspective Switch */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-gray-700 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setTimeDim('custom');
                }}
                className="w-24 focus:outline-none text-[11px] font-mono"
              />
              <span className="text-gray-400 text-xs">至</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setTimeDim('custom');
                }}
                className="w-24 focus:outline-none text-[11px] font-mono"
              />
            </div>

            <select
              value={selectedOrgFilter}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedOrgFilter(val);
                if (val === 'all') {
                  setViewScope('all_orgs');
                } else {
                  setViewScope('current_org');
                }
              }}
              className="bg-white border border-blue-300 text-blue-950 font-bold rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs cursor-pointer shadow-2xs"
            >
              {ORG_OPTIONS.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.id === 'all' ? '🌐 统计范围: 全平台所有机构 (28家)' : `🏛️ 机构穿透: ${org.name}`}
                </option>
              ))}
            </select>

            <button
              onClick={handleReset}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-gray-600 rounded-lg border border-gray-200 transition-colors cursor-pointer"
              title="重置全部筛选条件"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. 全域 28 家机构宏观级别核心数据统计 (All Organizations Macro Statistics Suite) */}
      <AllOrgMacroSection onSelectOrg={(org) => handleOpenOrgProfile(org)} />

      {/* 3. 全域机构指标趋势图 (All Organizations Macro & Comparative Trend Chart) */}
      <AllOrgTrendSection timeDim={timeDim} selectedOrgFilter={selectedOrgFilter} />

      {/* 4. 本机构管理员核心效能精细驾驶舱 (Institutional Focus KPIs) */}
      {viewScope === 'current_org' && (
        <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-200/80 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold text-blue-950 flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>本机构精细化指标看板（{currentOrg}）</span>
              </span>
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                在册 45 人 (上报32 / 审核13)
              </span>
            </div>
            <span className="text-[11px] text-blue-700 font-medium">全域综合排名第 1 名</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* KPI 1 */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">机构总报送 / 采纳量</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded">全域第 1</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-slate-900 font-mono">1,580</span>
                <span className="text-xs text-gray-500">/ 采纳 1,520 件</span>
              </div>
              <div className="text-[11px] text-gray-500 pt-1 border-t border-slate-100 flex justify-between">
                <span>通过率: <strong className="text-emerald-700 font-bold">96.2%</strong></span>
                <span className="text-emerald-700 font-bold">超全域均值 +7.7%</span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">一次性直通质效</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">卓越</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-emerald-700 font-mono">88.6%</span>
                <span className="text-xs text-gray-500">首审直通</span>
              </div>
              <div className="text-[11px] text-gray-500 pt-1 border-t border-slate-100 flex justify-between">
                <span>全域基准: 82.4%</span>
                <span className="text-emerald-700 font-bold">+6.2%</span>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">审核平均响应耗时</span>
                <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded">极速</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-purple-700 font-mono">6.8</span>
                <span className="text-xs text-gray-500">分钟/件</span>
              </div>
              <div className="text-[11px] text-gray-500 pt-1 border-t border-slate-100 flex justify-between">
                <span>处理率: 97.5%</span>
                <span className="text-purple-700 font-bold">提速 39.3%</span>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">负面舆情转办闭环</span>
                <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded">100% 办结</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-slate-900 font-mono">18 / 18</span>
                <span className="text-xs text-gray-500">件全部办结</span>
              </div>
              <div className="text-[11px] text-gray-500 pt-1 border-t border-slate-100 flex justify-between">
                <span>平均处置耗时</span>
                <span className="text-emerald-700 font-bold font-mono">2.1 小时</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. 上报员效能专区 (上报员趋势图 + 上报员报送统计) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: 上报员趋势图 (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>上报员趋势图</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                isGlobalView ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {isGlobalView ? '🌐 全域 486名在册上报员走势' : `🏛️ ${activeOrgInfo.shortName} (${activeOrgInfo.reporters}名在册上报员)`}
              </span>
            </div>
            
            {/* Embedded Organization Switcher for Reporters */}
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-gray-400">切换机构:</span>
              <select
                value={selectedOrgFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedOrgFilter(val);
                  if (val === 'all') setViewScope('all_orgs');
                  else setViewScope('current_org');
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-md px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
              >
                {ORG_OPTIONS.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.id === 'all' ? '🌐 全域所有上报员 (486人)' : `🏛️ ${org.shortName} (${org.reporters}人)`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Metric Pills (Legend and Toggles) */}
          <div className="flex flex-wrap items-center justify-end gap-1.5 text-[11px]">
            <button
              onClick={() => setReporterLines(prev => ({ ...prev, total: !prev.total }))}
              className={`px-2 py-0.5 rounded-md border flex items-center space-x-1 font-medium transition-colors cursor-pointer ${
                reporterLines.total ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#1E5ABB]"></span>
              <span>上报总量</span>
            </button>

            <button
              onClick={() => setReporterLines(prev => ({ ...prev, passed: !prev.passed }))}
              className={`px-2 py-0.5 rounded-md border flex items-center space-x-1 font-medium transition-colors cursor-pointer ${
                reporterLines.passed ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span>通过量</span>
            </button>

            <button
              onClick={() => setReporterLines(prev => ({ ...prev, rejected: !prev.rejected }))}
              className={`px-2 py-0.5 rounded-md border flex items-center space-x-1 font-medium transition-colors cursor-pointer ${
                reporterLines.rejected ? 'bg-rose-50 text-rose-700 border-rose-300' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
              <span>驳回量</span>
            </button>

            <button
              onClick={() => setReporterLines(prev => ({ ...prev, directRate: !prev.directRate }))}
              className={`px-2 py-0.5 rounded-md border flex items-center space-x-1 font-medium transition-colors cursor-pointer ${
                reporterLines.directRate ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>
              <span>一次性通过率</span>
            </button>

            <button
              onClick={() => setReporterLines(prev => ({ ...prev, passRate: !prev.passRate }))}
              className={`px-2 py-0.5 rounded-md border flex items-center space-x-1 font-medium transition-colors cursor-pointer ${
                reporterLines.passRate ? 'bg-teal-50 text-teal-700 border-teal-300' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#0D9488]"></span>
              <span>整体通过率</span>
            </button>

            <button
              onClick={() => setReporterLines(prev => ({ ...prev, score: !prev.score }))}
              className={`px-2 py-0.5 rounded-md border flex items-center space-x-1 font-medium transition-colors cursor-pointer ${
                reporterLines.score ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
              <span>综合得分</span>
            </button>
          </div>

          {/* Line Chart */}
          <div className="h-60 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reporterTrendData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: any, name: any) => {
                    if (name.includes('率') || name.includes('得分')) return [`${val}%`, name];
                    return [`${Number(val).toLocaleString()} 件`, name];
                  }}
                />
                {reporterLines.total && (
                  <Line yAxisId="left" type="monotone" dataKey="total" name="上报总量" stroke="#1E5ABB" strokeWidth={2} dot={{ r: 3, fill: '#1E5ABB' }} />
                )}
                {reporterLines.passed && (
                  <Line yAxisId="left" type="monotone" dataKey="passed" name="通过量" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: '#10B981' }} />
                )}
                {reporterLines.rejected && (
                  <Line yAxisId="left" type="monotone" dataKey="rejected" name="驳回量" stroke="#EF4444" strokeWidth={2} dot={{ r: 3, fill: '#EF4444' }} />
                )}
                {reporterLines.directRate && (
                  <Line yAxisId="right" type="monotone" dataKey="directRate" name="一次性通过率(%)" stroke="#8B5CF6" strokeDasharray="3 3" strokeWidth={1.5} dot={{ r: 2 }} />
                )}
                {reporterLines.passRate && (
                  <Line yAxisId="right" type="monotone" dataKey="passRate" name="整体通过率(%)" stroke="#0D9488" strokeWidth={1.5} dot={{ r: 2 }} />
                )}
                {reporterLines.score && (
                  <Line yAxisId="right" type="monotone" dataKey="score" name="综合得分" stroke="#F59E0B" strokeDasharray="4 2" strokeWidth={1.5} dot={{ r: 2 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: 上报员报送统计 (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <PieChartIcon className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-extrabold text-gray-900">
                {isGlobalView ? '全域上报员报送统计' : `${activeOrgInfo.shortName} · 上报统计`}
              </h3>
            </div>
            <span className="text-[10px] text-gray-400 font-medium">
              {isGlobalView ? '全域汇总' : '机构汇总'}
            </span>
          </div>

          {/* Donut & Legend */}
          <div className="flex items-center justify-between gap-3 my-auto">
            {/* Donut Chart with Center Text */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reporterDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {reporterDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any, name: any) => [`${Number(val).toLocaleString()} 件`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] text-gray-400 font-medium">累计上报</span>
                <span className="text-base font-black text-gray-900 font-mono leading-tight">
                  {reporterTotalCount.toLocaleString()}
                </span>
                <span className="text-[9px] text-gray-400">件</span>
              </div>
            </div>

            {/* Right Legend Items */}
            <div className="flex-1 space-y-2 text-xs">
              {reporterDonutData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-gray-600 text-[11px]">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 text-xs">{item.displayVal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Bottom Metric Values */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
            <div className="bg-slate-50/80 p-2 rounded-lg">
              <div className="text-[10px] text-gray-500">整体通过率</div>
              <div className="text-xs font-black text-teal-600 font-mono mt-0.5">
                {isGlobalView ? '89.4%' : `${activeOrgInfo.passRate}%`}
              </div>
            </div>

            <div className="bg-slate-50/80 p-2 rounded-lg">
              <div className="text-[10px] text-gray-500">一次性通过率</div>
              <div className="text-xs font-black text-blue-600 font-mono mt-0.5">
                {isGlobalView ? '77.4%' : `${activeOrgInfo.directRate}%`}
              </div>
            </div>

            <div className="bg-slate-50/80 p-2 rounded-lg">
              <div className="text-[10px] text-gray-500">在册上报员</div>
              <div className="text-xs font-black text-purple-600 font-mono mt-0.5">
                {isGlobalView ? '486 人' : `${activeOrgInfo.reporters} 人`}
              </div>
            </div>

            <div className="bg-slate-50/80 p-2 rounded-lg">
              <div className="text-[10px] text-gray-500">人均上报量</div>
              <div className="text-xs font-black text-amber-600 font-mono mt-0.5">
                {isGlobalView ? '21.6 件' : `${activeOrgInfo.perCapita} 件`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. 审核员效能专区 (审核员趋势图 + 审核员审核统计) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: 审核员趋势图 (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>审核员趋势图</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                isGlobalView ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-purple-50 text-purple-700 border-purple-200'
              }`}>
                {isGlobalView ? '🌐 全域 168名在册审核员走势' : `🏛️ ${activeOrgInfo.shortName} (${activeOrgInfo.auditors}名在册审核员)`}
              </span>
            </div>

            {/* Embedded Organization Switcher for Auditors */}
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-gray-400">切换机构:</span>
              <select
                value={selectedOrgFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedOrgFilter(val);
                  if (val === 'all') setViewScope('all_orgs');
                  else setViewScope('current_org');
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-md px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
              >
                {ORG_OPTIONS.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.id === 'all' ? '🌐 全域所有审核员 (168人)' : `🏛️ ${org.shortName} (${org.auditors}人)`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Metric Pills (Legend and Toggles) */}
          <div className="flex flex-wrap items-center justify-end gap-1.5 text-[11px]">
            <button
              onClick={() => setAuditorLines(prev => ({ ...prev, total: !prev.total }))}
              className={`px-2 py-0.5 rounded-md border flex items-center space-x-1 font-medium transition-colors cursor-pointer ${
                auditorLines.total ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span>审核总量</span>
            </button>

            <button
              onClick={() => setAuditorLines(prev => ({ ...prev, passed: !prev.passed }))}
              className={`px-2 py-0.5 rounded-md border flex items-center space-x-1 font-medium transition-colors cursor-pointer ${
                auditorLines.passed ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#1E5ABB]"></span>
              <span>通过量</span>
            </button>

            <button
              onClick={() => setAuditorLines(prev => ({ ...prev, rejected: !prev.rejected }))}
              className={`px-2 py-0.5 rounded-md border flex items-center space-x-1 font-medium transition-colors cursor-pointer ${
                auditorLines.rejected ? 'bg-rose-50 text-rose-700 border-rose-300' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
              <span>驳回量</span>
            </button>

            <button
              onClick={() => setAuditorLines(prev => ({ ...prev, avgTime: !prev.avgTime }))}
              className={`px-2 py-0.5 rounded-md border flex items-center space-x-1 font-medium transition-colors cursor-pointer ${
                auditorLines.avgTime ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>
              <span>平均时长</span>
            </button>
          </div>

          {/* Line Chart */}
          <div className="h-60 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={auditorTrendData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 30]} tick={{ fontSize: 10, fill: '#64748b' }} unit="分" axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: any, name: any) => {
                    if (name.includes('时长')) return [`${val} 分钟`, name];
                    return [`${Number(val).toLocaleString()} 件`, name];
                  }}
                />
                {auditorLines.total && (
                  <Line yAxisId="left" type="monotone" dataKey="total" name="审核总量" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: '#10B981' }} />
                )}
                {auditorLines.passed && (
                  <Line yAxisId="left" type="monotone" dataKey="passed" name="通过量" stroke="#1E5ABB" strokeWidth={2} dot={{ r: 3, fill: '#1E5ABB' }} />
                )}
                {auditorLines.rejected && (
                  <Line yAxisId="left" type="monotone" dataKey="rejected" name="驳回量" stroke="#EF4444" strokeWidth={2} dot={{ r: 3, fill: '#EF4444' }} />
                )}
                {auditorLines.avgTime && (
                  <Line yAxisId="right" type="monotone" dataKey="avgTime" name="平均时长(分)" stroke="#8B5CF6" strokeDasharray="3 3" strokeWidth={1.5} dot={{ r: 2 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: 审核员审核统计 (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <PieChartIcon className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-extrabold text-gray-900">
                {isGlobalView ? '全域审核员审核统计' : `${activeOrgInfo.shortName} · 审核统计`}
              </h3>
            </div>
            <span className="text-[10px] text-gray-400 font-medium">
              {isGlobalView ? '全域汇总' : '机构汇总'}
            </span>
          </div>

          {/* Donut & Legend */}
          <div className="flex items-center justify-between gap-3 my-auto">
            {/* Donut Chart with Center Text */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={auditorDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {auditorDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any, name: any) => [`${Number(val).toLocaleString()} 件`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] text-gray-400 font-medium">累计审核</span>
                <span className="text-base font-black text-gray-900 font-mono leading-tight">
                  {auditorTotalCount.toLocaleString()}
                </span>
                <span className="text-[9px] text-gray-400">件</span>
              </div>
            </div>

            {/* Right Legend Items */}
            <div className="flex-1 space-y-2.5 text-xs">
              {auditorDonutData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-gray-600 text-[11px]">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 text-xs">{item.displayVal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Bottom Metric Values */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
            <div className="bg-slate-50/80 p-2 rounded-lg">
              <div className="text-[10px] text-gray-500">平均耗时</div>
              <div className="text-xs font-black text-emerald-600 font-mono mt-0.5">
                {isGlobalView ? '13.8分' : `${activeOrgInfo.avgTime}分`}
              </div>
            </div>

            <div className="bg-slate-50/80 p-2 rounded-lg">
              <div className="text-[10px] text-gray-500">审核处理率</div>
              <div className="text-xs font-black text-blue-600 font-mono mt-0.5">
                {isGlobalView ? '98.8%' : `${activeOrgInfo.passRate}%`}
              </div>
            </div>

            <div className="bg-slate-50/80 p-2 rounded-lg">
              <div className="text-[10px] text-gray-500">在册审核员</div>
              <div className="text-xs font-black text-purple-600 font-mono mt-0.5">
                {isGlobalView ? '168 人' : `${activeOrgInfo.auditors} 人`}
              </div>
            </div>

            <div className="bg-slate-50/80 p-2 rounded-lg">
              <div className="text-[10px] text-gray-500">人均负荷</div>
              <div className="text-xs font-black text-amber-600 font-mono mt-0.5">
                {isGlobalView ? '58.7 件' : `${(activeOrgInfo.total / activeOrgInfo.auditors).toFixed(1)} 件`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drill-down Modal for Organization Detailed Profile */}
      <EvaluationProfileModal
        data={selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />
    </div>
  );
};
