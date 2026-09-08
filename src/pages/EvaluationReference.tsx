import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  FileCheck2,
  FileText,
  Globe2,
  Info,
  Percent,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  UsersRound,
  Zap,
} from 'lucide-react';
import { EvaluationProfileModal, ProfileDetailData } from '../components/EvaluationProfileModal';
import { PageId } from '../types';

interface EvaluationReferenceProps {
  onNavigate?: (page: PageId) => void;
}

type Scope = 'all' | 'mine';
type Period = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
type Perspective = 'report' | 'audit';

interface OrgRecord {
  rank: number;
  name: string;
  type: string;
  staff: number;
  reporters: number;
  auditors: number;
  total: number;
  adopted: number;
  rejected: number;
  pending: number;
  directRate: number;
  passRate: number;
  avgTime: number;
  perCapita: number;
  closedRate: number;
  grade: '卓越' | '优秀' | '良好' | '合格';
  score: number;
  isMine?: boolean;
}

interface ReporterRow {
  rank: number;
  rankChange: string;
  name: string;
  isLeader?: boolean;
  org: string;
  adoptedCount: number;
  firstCount: number;
  repeatCount: number;
  directRate: number;
  directRatioText: string;
  passRate: number;
  passRatioText: string;
  score: number;
  scoreText: string;
  scoreNote: string;
  avgScore: number;
  avgScoreText: string;
  avgScoreNote: string;
}

interface AuditorRow {
  rank: number;
  rankChange: string;
  name: string;
  org: string;
  totalAudited: number;
  processedCount: number;
  passedCount: number;
  rejectedCount: number;
  auditProcessRate: number;
  auditProcessRatioText: string;
  avgResponseMin: number;
}

const orgRecords: OrgRecord[] = [
  { rank: 1, name: '中共台中市委宣传部', type: '市级党政主体', staff: 45, reporters: 32, auditors: 13, total: 1580, adopted: 1520, rejected: 35, pending: 25, directRate: 88.6, passRate: 96.2, avgTime: 6.8, perCapita: 35.1, closedRate: 100, score: 98.5, grade: '卓越', isMine: true },
  { rank: 2, name: '台中市网信办', type: '网安指挥主管', staff: 38, reporters: 26, auditors: 12, total: 1350, adopted: 1280, rejected: 42, pending: 28, directRate: 86.4, passRate: 94.8, avgTime: 8.5, perCapita: 35.5, closedRate: 98.5, score: 95.8, grade: '卓越' },
  { rank: 3, name: '西屯区网信办', type: '区县直属单位', staff: 40, reporters: 28, auditors: 12, total: 1120, adopted: 1030, rejected: 58, pending: 32, directRate: 82.5, passRate: 92, avgTime: 10.8, perCapita: 28, closedRate: 97.8, score: 93.2, grade: '优秀' },
  { rank: 4, name: '台中市大数据中心', type: '独立直属单位', staff: 40, reporters: 29, auditors: 11, total: 980, adopted: 890, rejected: 60, pending: 30, directRate: 81, passRate: 90.8, avgTime: 12.2, perCapita: 24.5, closedRate: 96, score: 91.5, grade: '优秀' },
  { rank: 5, name: '东湖区委宣传部', type: '区县直属单位', staff: 38, reporters: 28, auditors: 10, total: 850, adopted: 750, rejected: 65, pending: 35, directRate: 77.8, passRate: 88.2, avgTime: 14.5, perCapita: 22.4, closedRate: 95, score: 89.4, grade: '良好' },
  { rank: 6, name: '北屯区宣传部', type: '区县直属单位', staff: 35, reporters: 25, auditors: 10, total: 720, adopted: 630, rejected: 55, pending: 35, directRate: 75, passRate: 87.5, avgTime: 15, perCapita: 20.6, closedRate: 94.2, score: 87.8, grade: '良好' },
  { rank: 7, name: '南屯区网信办', type: '区县直属单位', staff: 34, reporters: 24, auditors: 10, total: 680, adopted: 590, rejected: 52, pending: 38, directRate: 74.2, passRate: 86.8, avgTime: 15.5, perCapita: 20, closedRate: 93.5, score: 86.9, grade: '合格' },
  { rank: 8, name: '高新区管委会', type: '独立直属单位', staff: 30, reporters: 22, auditors: 8, total: 590, adopted: 510, rejected: 48, pending: 32, directRate: 73, passRate: 86.4, avgTime: 16, perCapita: 19.6, closedRate: 92, score: 85.7, grade: '合格' },
  { rank: 9, name: '市公安局网安支队', type: '市级党政主体', staff: 28, reporters: 20, auditors: 8, total: 562, adopted: 490, rejected: 44, pending: 28, directRate: 74.5, passRate: 87.2, avgTime: 13.8, perCapita: 20.1, closedRate: 97, score: 86.2, grade: '合格' },
  { rank: 10, name: '经开区网信办', type: '区县直属单位', staff: 26, reporters: 19, auditors: 7, total: 485, adopted: 420, rejected: 40, pending: 25, directRate: 72.1, passRate: 86.6, avgTime: 16.2, perCapita: 18.6, closedRate: 91.5, score: 85, grade: '合格' },
  { rank: 11, name: '市发改委政研室', type: '市级党政主体', staff: 24, reporters: 18, auditors: 6, total: 430, adopted: 375, rejected: 35, pending: 20, directRate: 71.8, passRate: 87.2, avgTime: 14.2, perCapita: 17.9, closedRate: 95, score: 84.6, grade: '合格' },
  { rank: 12, name: '新城区委网信办', type: '区县直属单位', staff: 22, reporters: 16, auditors: 6, total: 390, adopted: 335, rejected: 32, pending: 23, directRate: 70.5, passRate: 85.9, avgTime: 17, perCapita: 17.7, closedRate: 90, score: 83.5, grade: '合格' },
];

const orgParticipationCounts: Record<string, number> = {
  '中共台中市委宣传部': 42,
  '台中市网信办': 35,
  '西屯区网信办': 36,
  '台中市大数据中心': 35,
  '东湖区委宣传部': 33,
  '北屯区宣传部': 30,
  '南屯区网信办': 29,
  '高新区管委会': 25,
  '市公安局网安支队': 24,
  '经开区网信办': 21,
  '市发改委政研室': 20,
  '新城区委网信办': 18,
};

const orgOptions = [
  '统计主体: 全平台所有机构 (28家)',
  '机构穿透: 中共台中市委宣传部',
  '机构穿透: 台中市网信办',
  '机构穿透: 西屯区网信办',
];

const getParticipationCount = (record: OrgRecord) => orgParticipationCounts[record.name] ?? Math.max(record.reporters, record.auditors);
const getParticipationRate = (record: OrgRecord) => ((getParticipationCount(record) / record.staff) * 100).toFixed(1);

const reporterRecords: ReporterRow[] = [
  {
    rank: 1,
    rankChange: '↑ 提升 2 位',
    name: '张三',
    isLeader: true,
    org: '中共台中市委宣传部',
    adoptedCount: 36,
    firstCount: 28,
    repeatCount: 8,
    directRate: 85.7,
    directRatioText: '通过 36/42 件',
    passRate: 92.9,
    passRatioText: '通过 39/42 件',
    score: 3986.5,
    scoreText: '3,986.5 分',
    scoreNote: '累加得分',
    avgScore: 94.9,
    avgScoreText: '94.9 分',
    avgScoreNote: '每条均分',
  },
  {
    rank: 2,
    rankChange: '↑ 提升 1 位',
    name: '王五',
    org: '台中市大数据中心',
    adoptedCount: 33,
    firstCount: 25,
    repeatCount: 8,
    directRate: 84.2,
    directRatioText: '通过 32/38 件',
    passRate: 89.5,
    passRatioText: '通过 34/38 件',
    score: 3540.0,
    scoreText: '3,540.0 分',
    scoreNote: '累加得分',
    avgScore: 93.2,
    avgScoreText: '93.2 分',
    avgScoreNote: '每条均分',
  },
  {
    rank: 3,
    rankChange: '持平',
    name: '赵六',
    org: '西屯区网信办',
    adoptedCount: 29,
    firstCount: 22,
    repeatCount: 7,
    directRate: 80,
    directRatioText: '通过 28/35 件',
    passRate: 85.7,
    passRatioText: '通过 30/35 件',
    score: 3215.0,
    scoreText: '3,215.0 分',
    scoreNote: '累加得分',
    avgScore: 91.8,
    avgScoreText: '91.8 分',
    avgScoreNote: '每条均分',
  },
  {
    rank: 4,
    rankChange: '↑ 提升 1 位',
    name: '孙七',
    org: '东湖区委宣传部',
    adoptedCount: 25,
    firstCount: 19,
    repeatCount: 6,
    directRate: 77.4,
    directRatioText: '通过 24/31 件',
    passRate: 83.9,
    passRatioText: '通过 26/31 件',
    score: 2820.0,
    scoreText: '2,820.0 分',
    scoreNote: '累加得分',
    avgScore: 91,
    avgScoreText: '91 分',
    avgScoreNote: '每条均分',
  },
  {
    rank: 5,
    rankChange: '↓ 下降 1 位',
    name: '周八',
    org: '台中市应急管理局',
    adoptedCount: 22,
    firstCount: 17,
    repeatCount: 5,
    directRate: 75,
    directRatioText: '通过 21/28 件',
    passRate: 82.1,
    passRatioText: '通过 23/28 件',
    score: 2510.0,
    scoreText: '2,510.0 分',
    scoreNote: '累加得分',
    avgScore: 89.6,
    avgScoreText: '89.6 分',
    avgScoreNote: '每条均分',
  },
  {
    rank: 6,
    rankChange: '持平',
    name: '吴九',
    org: '台中市交通运输局',
    adoptedCount: 18,
    firstCount: 14,
    repeatCount: 4,
    directRate: 70.8,
    directRatioText: '通过 17/24 件',
    passRate: 79.2,
    passRatioText: '通过 19/24 件',
    score: 2100.0,
    scoreText: '2,100.0 分',
    scoreNote: '累加得分',
    avgScore: 87.5,
    avgScoreText: '87.5 分',
    avgScoreNote: '每条均分',
  },
  {
    rank: 7,
    rankChange: '↓ 下降 2 位',
    name: '郑十',
    org: '南山区网格治理中心',
    adoptedCount: 14,
    firstCount: 11,
    repeatCount: 3,
    directRate: 65,
    directRatioText: '通过 13/20 件',
    passRate: 75,
    passRatioText: '通过 15/20 件',
    score: 1720.0,
    scoreText: '1,720.0 分',
    scoreNote: '累加得分',
    avgScore: 86,
    avgScoreText: '86 分',
    avgScoreNote: '每条均分',
  },
];

const auditorRecords: AuditorRow[] = [
  {
    rank: 1,
    rankChange: '↑ 提升 2 位',
    name: '王主任',
    org: '中共台中市委宣传部',
    totalAudited: 156,
    processedCount: 156,
    passedCount: 142,
    rejectedCount: 14,
    auditProcessRate: 97.5,
    auditProcessRatioText: '已办 156 / 上报 160 件',
    avgResponseMin: 6.8,
  },
  {
    rank: 2,
    rankChange: '↑ 提升 1 位',
    name: '李明',
    org: '台中市网信办',
    totalAudited: 138,
    processedCount: 138,
    passedCount: 124,
    rejectedCount: 14,
    auditProcessRate: 96.4,
    auditProcessRatioText: '已办 138 / 上报 143 件',
    avgResponseMin: 7.9,
  },
  {
    rank: 3,
    rankChange: '持平',
    name: '陈科长',
    org: '台中市大数据中心',
    totalAudited: 120,
    processedCount: 120,
    passedCount: 106,
    rejectedCount: 14,
    auditProcessRate: 95.0,
    auditProcessRatioText: '已办 120 / 上报 126 件',
    avgResponseMin: 8.8,
  },
  {
    rank: 4,
    rankChange: '↑ 提升 1 位',
    name: '周主管',
    org: '西屯区网信办',
    totalAudited: 108,
    processedCount: 108,
    passedCount: 96,
    rejectedCount: 12,
    auditProcessRate: 93.9,
    auditProcessRatioText: '已办 108 / 上报 115 件',
    avgResponseMin: 9.5,
  },
  {
    rank: 5,
    rankChange: '↓ 下降 1 位',
    name: '韩科长',
    org: '东湖区委宣传部',
    totalAudited: 95,
    processedCount: 95,
    passedCount: 84,
    rejectedCount: 11,
    auditProcessRate: 91.3,
    auditProcessRatioText: '已办 95 / 上报 104 件',
    avgResponseMin: 11.2,
  },
  {
    rank: 6,
    rankChange: '持平',
    name: '徐副主任',
    org: '南屯区网信办',
    totalAudited: 82,
    processedCount: 82,
    passedCount: 71,
    rejectedCount: 11,
    auditProcessRate: 88.5,
    auditProcessRatioText: '已办 82 / 上报 93 件',
    avgResponseMin: 13.6,
  },
];

const rankClass = (rank: number) =>
  rank === 1
    ? 'bg-amber-100 text-amber-800'
    : rank === 2
      ? 'bg-slate-200 text-slate-700'
      : rank === 3
        ? 'bg-orange-100 text-orange-800'
        : 'text-slate-500';

const MacroMetricCard: React.FC<{
  title: string;
  value: string;
  unit?: string;
  note: string;
  footer: string | React.ReactNode;
  color: string;
  icon: React.ReactNode;
}> = ({ title, value, unit, note, footer, color, icon }) => (
  <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
    <div className="flex items-center justify-between gap-2">
      <span className="flex min-w-0 items-center gap-1.5 truncate text-xs font-bold text-slate-700">
        <span style={{ color }}>{icon}</span>
        {title}
      </span>
      <span className="shrink-0 rounded bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">{note}</span>
    </div>
    <div className="mt-2 flex items-baseline gap-1">
      <strong className="font-mono text-xl tracking-tight" style={{ color }}>{value}</strong>
      {unit && <span className="text-[11px] text-slate-400">{unit}</span>}
    </div>
    <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[11px] text-slate-400">
      {footer}
    </div>
  </div>
);

export const EvaluationReference: React.FC<EvaluationReferenceProps> = () => {
  const [scope, setScope] = useState<Scope>('mine');
  const [perspective, setPerspective] = useState<Perspective>('report');
  const [period, setPeriod] = useState<Period>('week');
  const [startDate, setStartDate] = useState('2026/08/04');
  const [endDate, setEndDate] = useState('2026/08/11');
  const [selectedOrg, setSelectedOrg] = useState(orgOptions[0]);
  const [orgSort, setOrgSort] = useState<string>('rank');
  const [reporterSort, setReporterSort] = useState<string>('adopted');
  const [auditorSort, setAuditorSort] = useState<string>('audited');
  const [toast, setToast] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<ProfileDetailData | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const resetFilters = () => {
    setPeriod('week');
    setStartDate('2026/08/04');
    setEndDate('2026/08/11');
    setSelectedOrg(orgOptions[0]);
    setReporterSort('adopted');
    setAuditorSort('audited');
    setOrgSort('rank');
    showToast('筛选条件已重置');
  };

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
    if (p === 'day') {
      setStartDate('2026/08/11');
      setEndDate('2026/08/11');
    } else if (p === 'week') {
      setStartDate('2026/08/04');
      setEndDate('2026/08/11');
    } else if (p === 'month') {
      setStartDate('2026/08/01');
      setEndDate('2026/08/31');
    } else if (p === 'quarter') {
      setStartDate('2026/07/01');
      setEndDate('2026/09/30');
    } else if (p === 'year') {
      setStartDate('2026/01/01');
      setEndDate('2026/12/31');
    }
  };

  const sortedOrgs = useMemo(() => {
    const list = [...orgRecords];
    if (orgSort === 'total') return list.sort((a, b) => b.total - a.total);
    if (orgSort === 'directRate') return list.sort((a, b) => b.directRate - a.directRate);
    if (orgSort === 'passRate') return list.sort((a, b) => b.passRate - a.passRate);
    return list.sort((a, b) => a.rank - b.rank);
  }, [orgSort]);

  const sortedReporters = useMemo(() => {
    const list = [...reporterRecords];
    if (reporterSort === 'adopted') return list.sort((a, b) => b.adoptedCount - a.adoptedCount);
    if (reporterSort === 'score') return list.sort((a, b) => b.score - a.score);
    if (reporterSort === 'directRate') return list.sort((a, b) => b.directRate - a.directRate);
    if (reporterSort === 'passRate') return list.sort((a, b) => b.passRate - a.passRate);
    return list;
  }, [reporterSort]);

  const sortedAuditors = useMemo(() => {
    const list = [...auditorRecords];
    if (auditorSort === 'audited') return list.sort((a, b) => b.totalAudited - a.totalAudited);
    if (auditorSort === 'rate') return list.sort((a, b) => b.auditProcessRate - a.auditProcessRate);
    if (auditorSort === 'time') return list.sort((a, b) => a.avgResponseMin - b.avgResponseMin);
    return list;
  }, [auditorSort]);

  const openOrgProfile = (row: OrgRecord) => {
    setSelectedProfile({
      id: `org-${row.rank}`,
      name: row.name,
      type: 'org',
      subTitle: row.type,
      rank: row.rank,
      totalScore: row.score,
      grade: row.grade,
      stats: [
        { label: '在册总人数', value: `${row.staff} 人`, subLabel: `上报 ${row.reporters} / 审核 ${row.auditors}` },
        { label: '累计报送量', value: `${row.total} 件`, subLabel: `采纳 ${row.adopted} 件`, isHighlight: true },
        { label: '一次性通过率', value: `${row.directRate}%`, isHighlight: true },
        { label: '平均响应耗时', value: `${row.avgTime} 分钟` },
      ],
      radarData: [
        { subject: '报送活跃', value: 95, fullMark: 100 },
        { subject: '采纳质量', value: 93, fullMark: 100 },
        { subject: '一次通过', value: row.directRate, fullMark: 100 },
        { subject: '响应时效', value: 94, fullMark: 100 },
        { subject: '闭环成效', value: row.closedRate, fullMark: 100 },
      ],
      historyScores: [
        { month: '4月', score: 88 },
        { month: '5月', score: 90 },
        { month: '6月', score: 92 },
        { month: '7月', score: 95 },
        { month: '8月', score: row.score },
      ],
      breakdown: [
        { category: '报送质量', item: '一次性通过达标', points: '+28.0', desc: '一次性通过率处于全域领先梯队' },
        { category: '报送贡献', item: '有效采纳加分', points: '+38.5', desc: '高质效完成周期内报送与采纳目标' },
        { category: '响应时效', item: '流转时效达标', points: '+22.0', desc: '平均审核流转响应耗时优于基准' },
        { category: '综合表现', item: '组织协同加分', points: '+10.0', desc: '人员在册活跃度与协同闭环表现优异' },
      ],
      summaryEvaluation: `${row.name} 本考核周期综合考核表现卓越，位居全域第 ${row.rank} 名，建议继续保持高质效上报与高效闭环机制。`,
    });
  };

  const openReporterProfile = (row: ReporterRow) => {
    setSelectedProfile({
      id: `reporter-${row.rank}`,
      name: row.name,
      type: 'reporter',
      subTitle: row.org,
      rank: row.rank,
      totalScore: row.score,
      grade: row.rank <= 2 ? '卓越' : row.rank <= 4 ? '优秀' : '良好',
      stats: [
        { label: '累计采纳量', value: `${row.adoptedCount} 件`, subLabel: `首发 ${row.firstCount} / 重复 ${row.repeatCount}`, isHighlight: true },
        { label: '一次性通过率', value: `${row.directRate}%`, isHighlight: true },
        { label: '整体通过率', value: `${row.passRate}%` },
        { label: '单条平均得分', value: `${row.avgScore} 分` },
      ],
      radarData: [
        { subject: '报送活跃', value: 95, fullMark: 100 },
        { subject: '采纳质量', value: 93, fullMark: 100 },
        { subject: '一次通过', value: row.directRate, fullMark: 100 },
        { subject: '响应时效', value: 91, fullMark: 100 },
        { subject: '闭环成效', value: 92, fullMark: 100 },
      ],
      historyScores: [
        { month: '4月', score: Math.max(78, row.avgScore - 6) },
        { month: '5月', score: Math.max(80, row.avgScore - 4) },
        { month: '6月', score: Math.max(82, row.avgScore - 2) },
        { month: '7月', score: Math.max(84, row.avgScore - 1) },
        { month: '8月', score: row.avgScore },
      ],
      breakdown: [
        { category: '报送质量', item: '一次性通过激励', points: '+25.0', desc: '一次性通过率处于全域领先梯队' },
        { category: '报送贡献', item: '有效采纳得分', points: '+40.0', desc: '完成周期内有效报送与采纳目标' },
        { category: '响应时效', item: '高效响应奖励', points: '+24.5', desc: '平均响应耗时优于考核基准' },
        { category: '综合表现', item: '综合绩效加分', points: '+9.0', desc: '人员活跃与业务闭环表现良好' },
      ],
      summaryEvaluation: `${row.name} 本考核周期综合表现良好，当前排名第 ${row.rank}，建议持续保持报送质量与处理时效。`,
    });
  };

  const openAuditorProfile = (row: AuditorRow) => {
    setSelectedProfile({
      id: `auditor-${row.rank}`,
      name: row.name,
      type: 'auditor',
      subTitle: row.org,
      rank: row.rank,
      totalScore: row.totalAudited * 25,
      grade: row.rank <= 2 ? '卓越' : row.rank <= 4 ? '优秀' : '良好',
      stats: [
        { label: '累计审核量', value: `${row.totalAudited} 件`, subLabel: `通过 ${row.passedCount} / 驳回 ${row.rejectedCount}`, isHighlight: true },
        { label: '审核处理率', value: `${row.auditProcessRate}%`, isHighlight: true },
        { label: '平均响应耗时', value: `${row.avgResponseMin} 分钟` },
        { label: '单条平均得分', value: '95.2 分' },
      ],
      radarData: [
        { subject: '审核效率', value: row.auditProcessRate, fullMark: 100 },
        { subject: '审核质量', value: 94, fullMark: 100 },
        { subject: '审核完成', value: row.auditProcessRate, fullMark: 100 },
        { subject: '响应时效', value: 96, fullMark: 100 },
        { subject: '闭环成效', value: 92, fullMark: 100 },
      ],
      historyScores: [
        { month: '4月', score: 88 },
        { month: '5月', score: 90 },
        { month: '6月', score: 92 },
        { month: '7月', score: 94 },
        { month: '8月', score: 96 },
      ],
      breakdown: [
        { category: '审核效率', item: '审核处理达标', points: '+32.0', desc: '周期内审核处理率达到考核要求' },
        { category: '审核质量', item: '审核通过质量', points: '+36.0', desc: '审核结论准确，驳回意见清晰' },
        { category: '响应时效', item: '快速审核响应', points: '+24.5', desc: '平均响应耗时优于审核基准' },
        { category: '综合表现', item: '综合绩效加分', points: '+9.0', desc: '审核活跃与处理闭环表现良好' },
      ],
      summaryEvaluation: `${row.name} 本考核周期综合表现优异，当前排名第 ${row.rank}，建议持续保持审核质量与响应时效。`,
    });
  };

  return (
    <div className="relative min-w-0 space-y-4 pb-10 text-slate-700">
      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}

      {/* TOP HEADER SECTION: TITLE + SCOPE SWITCH (全域 / 我的) + EXPORT */}
      <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-5">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <Trophy className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-900">考核管理与综合绩效评定</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Global / Mine Switch */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all ${
                  scope === 'all'
                    ? 'bg-[#1D58C9] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Globe2 className="h-3.5 w-3.5" />
                全域
              </button>
              <button
                type="button"
                onClick={() => setScope('mine')}
                className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all ${
                  scope === 'mine'
                    ? 'bg-[#1D58C9] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <UserRound className="h-3.5 w-3.5" />
                我的
              </button>
            </div>

            <button
              type="button"
              onClick={() => showToast('考核数据导出成功')}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-xl bg-[#1D58C9] px-3.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
            >
              <Download className="h-3.5 w-3.5" />
              导出考核数据
            </button>
          </div>
        </div>

        {/* SUB FILTER ROW */}
        {scope === 'all' ? (
          <div className="flex flex-wrap items-center gap-2.5 pt-3">
            {/* Period Capsule */}
            <div className="flex items-center rounded-2xl border border-[#E4EDF7] bg-[#F0F5FA] p-1 text-xs">
              <span className="flex items-center gap-1 pl-2.5 pr-1.5 text-slate-500 select-none">
                <Clock className="h-3.5 w-3.5 text-[#2F74FF]" />
                <span>统计周期:</span>
              </span>
              {[
                ['day', '日(今日)'],
                ['week', '周(本周)'],
                ['month', '月(本月)'],
                ['quarter', '季度'],
                ['year', '年度'],
                ['custom', '自定义'],
              ].map(([key, label]) => {
                const active = period === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePeriodChange(key as Period)}
                    className={`rounded-xl px-3 py-1 text-xs transition-all ${
                      active
                        ? 'bg-white font-semibold text-[#1B5BD6] shadow-xs'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Date Range Card */}
            <div className="relative flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-700 shadow-xs">
              <Calendar className="h-3.5 w-3.5 text-[#2F74FF] shrink-0" />
              <span className="font-mono text-xs text-slate-700">{startDate}</span>
              <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="text-slate-400 select-none">至</span>
              <span className="font-mono text-xs text-slate-700">{endDate}</span>
              <Calendar className="h-3 w-3 text-slate-400 shrink-0" />

              <input
                type="date"
                className="absolute left-6 top-0 h-full w-20 cursor-pointer opacity-0"
                title="选择开始日期"
                value={startDate.replaceAll('/', '-')}
                onChange={(e) => {
                  setStartDate(e.target.value.replaceAll('-', '/'));
                  setPeriod('custom');
                }}
              />
              <input
                type="date"
                className="absolute right-4 top-0 h-full w-20 cursor-pointer opacity-0"
                title="选择结束日期"
                value={endDate.replaceAll('/', '-')}
                onChange={(e) => {
                  setEndDate(e.target.value.replaceAll('-', '/'));
                  setPeriod('custom');
                }}
              />
            </div>

            {/* Org select in 'All' scope */}
            <div className="relative flex items-center">
              <select
                aria-label="统计主体"
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="appearance-none cursor-pointer rounded-2xl border border-blue-200 bg-white pl-3.5 pr-8 py-1.5 text-xs font-semibold text-[#1D58C9] outline-none shadow-xs"
              >
                {orgOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#1D58C9]" />
            </div>

            {/* Reset Button at the end */}
            <button
              type="button"
              onClick={resetFilters}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-xs transition hover:text-slate-800"
              title="重置筛选"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-3 xl:flex-row xl:items-center xl:justify-between">
            {/* Left Role Perspective for 'Mine' */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPerspective('report')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-semibold transition-all ${
                  perspective === 'report'
                    ? 'bg-[#1B5BD6] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Send className="h-3.5 w-3.5 -rotate-12" />
                上报员榜
              </button>
              <button
                type="button"
                onClick={() => setPerspective('audit')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-semibold transition-all ${
                  perspective === 'audit'
                    ? 'bg-[#08B889] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                审核员榜
              </button>
            </div>

            {/* Right Filter Controls for 'Mine' */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Period Capsule */}
              <div className="flex items-center rounded-2xl border border-[#E4EDF7] bg-[#F0F5FA] p-1 text-xs">
                <span className="flex items-center gap-1 pl-2.5 pr-1.5 text-slate-500 select-none">
                  <Clock className="h-3.5 w-3.5 text-[#2F74FF]" />
                  <span>考核周期:</span>
                </span>
                {[
                  ['day', '日(今日)'],
                  ['week', '周(本周)'],
                  ['month', '月(本月)'],
                  ['quarter', '季度'],
                  ['year', '年度'],
                  ['custom', '自定义'],
                ].map(([key, label]) => {
                  const active = period === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handlePeriodChange(key as Period)}
                      className={`rounded-xl px-3 py-1 text-xs transition-all ${
                        active
                          ? 'bg-white font-semibold text-[#1B5BD6] shadow-xs'
                          : 'text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Date Range Card */}
              <div className="relative flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-700 shadow-xs">
                <Calendar className="h-3.5 w-3.5 text-[#2F74FF] shrink-0" />
                <span className="font-mono text-xs text-slate-700">{startDate}</span>
                <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="text-slate-400 select-none">至</span>
                <span className="font-mono text-xs text-slate-700">{endDate}</span>
                <Calendar className="h-3 w-3 text-slate-400 shrink-0" />

                <input
                  type="date"
                  className="absolute left-6 top-0 h-full w-20 cursor-pointer opacity-0"
                  title="选择开始日期"
                  value={startDate.replaceAll('/', '-')}
                  onChange={(e) => {
                    setStartDate(e.target.value.replaceAll('-', '/'));
                    setPeriod('custom');
                  }}
                />
                <input
                  type="date"
                  className="absolute right-4 top-0 h-full w-20 cursor-pointer opacity-0"
                  title="选择结束日期"
                  value={endDate.replaceAll('/', '-')}
                  onChange={(e) => {
                    setEndDate(e.target.value.replaceAll('-', '/'));
                    setPeriod('custom');
                  }}
                />
              </div>

              {/* Reset Button */}
              <button
                type="button"
                onClick={resetFilters}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-xs transition hover:text-slate-800"
                title="重置筛选"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* VIEW BODY: 'ALL' (全域视角) vs 'MINE' (我的视角) */}
      {scope === 'all' ? (
        <>
          {/* 全域 8 项宏观指标卡片 */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            <MacroMetricCard
              title="全域参评机构"
              value="28"
              unit="家"
              note="全域覆盖"
              footer={<><span>在册人员 654人</span><strong className="text-emerald-600">达标率 100%</strong></>}
              color="#1D58C9"
              icon={<Globe2 className="h-3.5 w-3.5" />}
            />
            <MacroMetricCard
              title="累计上报"
              value="10,480"
              unit="件"
              note="提交总量"
              footer={<><span>日均报送 349件</span><strong className="text-blue-600">环比 +6.8%</strong></>}
              color="#1D58C9"
              icon={<FileText className="h-3.5 w-3.5" />}
            />
            <MacroMetricCard
              title="采纳量/采纳率"
              value="9,370"
              unit="件"
              note="有效采纳"
              footer={<><span>累计报送 10,480件</span><strong className="text-emerald-600">采纳率 89.4%</strong></>}
              color="#08B889"
              icon={<FileCheck2 className="h-3.5 w-3.5" />}
            />
            <MacroMetricCard
              title="机构考核均分"
              value="88.5"
              unit="分"
              note="全域考评"
              footer={<><span>最高得分 98.5</span><strong className="text-amber-600">环比 +1.2分</strong></>}
              color="#F5A400"
              icon={<Trophy className="h-3.5 w-3.5" />}
            />
            <MacroMetricCard
              title="全域首审直通率"
              value="77.4"
              unit="%"
              note="质效核心"
              footer={<><span>整体通过率</span><strong className="text-emerald-600">89.4%</strong></>}
              color="#08B889"
              icon={<Zap className="h-3.5 w-3.5" />}
            />
            <MacroMetricCard
              title="全域审核响应时长"
              value="13.8"
              unit="分钟"
              note="流转时效"
              footer={<><span>最快 市委宣传部</span><strong className="text-purple-600">6.8分</strong></>}
              color="#8656F4"
              icon={<RefreshCw className="h-3.5 w-3.5" />}
            />
            <MacroMetricCard
              title="转办闭环率"
              value="96.8"
              unit="%"
              note="履约评价"
              footer={<><span>转办 112 / 采纳 120件</span><strong className="text-emerald-600">按期率 98%</strong></>}
              color="#08A69A"
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            />
            <MacroMetricCard
              title="人均报送量"
              value="23.3"
              unit="件/人"
              note="活跃贡献"
              footer={<><span>标兵 市委宣传部</span><strong className="text-blue-600">35.5件</strong></>}
              color="#7659EA"
              icon={<UsersRound className="h-3.5 w-3.5" />}
            />
          </section>

          {/* 全域 28 家机构综合考核评榜 Table */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-4">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <BarChart3 className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-sm font-bold text-slate-900">全域 28 家机构综合考核评榜</h2>
                <span className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                  共 12 家展示
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  aria-label="机构排名排序"
                  value={orgSort}
                  onChange={(e) => setOrgSort(e.target.value)}
                  className="min-h-8 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-600 outline-none shadow-xs"
                >
                  <option value="rank">按综合排名</option>
                  <option value="total">按上报量</option>
                  <option value="directRate">按一次性通过率</option>
                  <option value="passRate">按整体通过率</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] text-left text-xs">
                <thead className="border-b border-slate-100 text-slate-400">
                  <tr>
                    <th className="px-2 py-3 text-center">排名</th>
                    <th className="px-3 py-3">机构名称 / 所属类型</th>
                    <th className="px-3 py-3 text-center">在册人员 (上报/审核)</th>
                    <th className="px-3 py-3 text-center">参与人员 / 参与率</th>
                    <th className="px-3 py-3 text-center">累计报送 (采纳/驳回/待审)</th>
                    <th className="px-3 py-3 text-center">首审直通率</th>
                    <th className="px-3 py-3 text-center">整体通过率</th>
                    <th className="px-3 py-3 text-center">平均响应</th>
                    <th className="px-3 py-3 text-center">人均报送量</th>
                    <th className="px-3 py-3 text-center">转办闭环率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedOrgs.map((row) => (
                    <tr
                      key={row.name}
                      onClick={() => openOrgProfile(row)}
                      className={`cursor-pointer transition hover:bg-blue-50/40 ${row.isMine ? 'bg-blue-50/20' : ''}`}
                    >
                      <td className="px-2 py-3.5 text-center">
                        <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full font-mono font-bold ${rankClass(row.rank)}`}>
                          {row.rank}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          {row.name}
                          {row.isMine && (
                            <span className="rounded bg-amber-100 px-1 py-0.5 text-[9px] text-amber-700">
                              本机构
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-400">{row.type}</div>
                      </td>
                      <td className="px-3 py-3.5 text-center font-mono text-slate-700">
                        <strong>{row.staff} 人</strong>
                        <div className="mt-0.5 text-[10px] text-slate-400">上报 {row.reporters} / 审核 {row.auditors}</div>
                      </td>
                      <td className="px-3 py-3.5 text-center font-mono">
                        <div className="flex items-center justify-center gap-1.5">
                          <strong>{getParticipationCount(row)} 人</strong>
                          <span className="rounded bg-blue-50 px-1 py-0.5 text-[10px] font-bold text-blue-700">{getParticipationRate(row)}%</span>
                        </div>
                        <div className="mx-auto mt-1.5 h-1.5 w-14 rounded-full bg-slate-100">
                          <span className="block h-1.5 rounded-full bg-[#1D58C9]" style={{ width: `${getParticipationRate(row)}%` }} />
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-center font-mono">
                        <strong className="text-slate-800">{row.total.toLocaleString()} 件</strong>
                        <div className="mt-0.5 text-[10px]">
                          <span className="text-emerald-600">采 {row.adopted}</span> / <span className="text-rose-500">驳 {row.rejected}</span> / <span className="text-amber-600">待 {row.pending}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-center font-mono font-bold text-emerald-600">
                        <span>{row.directRate}%</span>
                        <div className="mx-auto mt-1 h-1.5 w-10 rounded-full bg-slate-100">
                          <span className="block h-1.5 rounded-full bg-emerald-500" style={{ width: `${row.directRate}%` }} />
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-center font-mono font-bold text-blue-600">{row.passRate}%</td>
                      <td className="px-3 py-3.5 text-center font-mono font-bold text-purple-600">{row.avgTime} 分钟</td>
                      <td className="px-3 py-3.5 text-center font-mono">{row.perCapita} 件/人</td>
                      <td className="px-3 py-3.5 text-center font-mono font-bold text-emerald-600">
                        <span>{row.closedRate}%</span>
                        <div className="mx-auto mt-1 h-1.5 w-10 rounded-full bg-slate-100">
                          <span className="block h-1.5 rounded-full bg-emerald-500" style={{ width: `${row.closedRate}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        /* 我的视角 (1:1 RESTORED FROM SCREENSHOTS) */
        <>
          {/* SECTION 2: 考评效能指标 & 平均效能对比 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-white shadow-xs ${
                    perspective === 'report' ? 'bg-[#1B5BD6]' : 'bg-[#08B889]'
                  }`}
                >
                  <Target className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-bold text-slate-800">考评效能指标</h2>
              </div>
              <span
                className={`rounded-xl px-3.5 py-1 text-xs font-semibold ${
                  perspective === 'report'
                    ? 'bg-[#EBF3FF] text-[#1B5BD6]'
                    : 'bg-[#EDFAF5] text-[#08B889]'
                }`}
              >
                {perspective === 'report' ? '张三' : '王主任'}
              </span>
            </div>

            {/* 考评效能指标 Cards */}
            {perspective === 'report' ? (
              <>
                {/* 5 KPI Cards for 上报员 */}
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
                  {/* Card 1: 累计采纳数 */}
                  <div className="flex min-h-[124px] flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-[#08B889]" />
                        累计采纳数
                      </span>
                      <span className="flex items-center gap-0.5 rounded-md bg-[#EDFAF5] px-2 py-0.5 text-[11px] font-semibold text-[#08B889]">
                        <span>~</span>
                        <span>环比 +15.8%</span>
                      </span>
                    </div>
                    <div className="my-1.5 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1">
                        <strong className="font-mono text-2xl font-bold text-[#08B889]">9</strong>
                        <span className="text-xs text-slate-400">件</span>
                      </div>
                      <div className="text-[11px]">
                        <span className="font-medium text-[#08B889]">首发 7</span>
                        <span className="mx-1 text-slate-300">/</span>
                        <span className="font-medium text-[#2F74FF]">重复 2</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                      <span className="font-medium text-slate-600">第 3 名 / 28人</span>
                      <span className="font-medium text-[#08B889]">↑ 提升 1 位</span>
                    </div>
                  </div>

                  {/* Card 2: 一次性通过率 */}
                  <div className="flex min-h-[124px] flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <Zap className="h-4 w-4 text-[#08B889]" />
                        一次性通过率
                      </span>
                      <span className="rounded-md bg-[#EDFAF5] px-2 py-0.5 text-[11px] font-semibold text-[#08B889]">
                        环比 +4.2%
                      </span>
                    </div>
                    <div className="my-1.5 flex items-baseline justify-between">
                      <strong className="font-mono text-2xl font-bold text-[#08B889]">81.8%</strong>
                      <span className="font-mono text-xs text-slate-500">通过 9/11 件</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                      <span className="font-medium text-slate-600">第 2 名 / 28人</span>
                      <span className="font-medium text-[#08B889]">↑ 提升 1 位</span>
                    </div>
                  </div>

                  {/* Card 3: 整体通过率 */}
                  <div className="flex min-h-[124px] flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-[#08B889]" />
                        整体通过率
                      </span>
                      <span className="rounded-md bg-[#EDFAF5] px-2 py-0.5 text-[11px] font-semibold text-[#08B889]">
                        环比 +4.2%
                      </span>
                    </div>
                    <div className="my-1.5 flex items-baseline justify-between">
                      <strong className="font-mono text-2xl font-bold text-[#08B889]">90.9%</strong>
                      <span className="font-mono text-xs text-slate-500">通过 10/11 件</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                      <span className="font-medium text-slate-600">第 1 名 / 28人</span>
                      <span className="font-medium text-[#08B889]">↑ 提升 2 位</span>
                    </div>
                  </div>

                  {/* Card 4: 综合得分 */}
                  <div className="flex min-h-[124px] flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <Award className="h-4 w-4 text-[#ED7B11]" />
                        综合得分
                      </span>
                      <span className="rounded-md bg-[#FFF7EB] px-2 py-0.5 text-[11px] font-semibold text-[#ED7B11]">
                        环比 +22.1%
                      </span>
                    </div>
                    <div className="my-1.5 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1">
                        <strong className="font-mono text-2xl font-bold text-[#ED7B11]">1,020.8</strong>
                        <span className="text-xs text-slate-400">分</span>
                      </div>
                      <span className="rounded bg-[#FFF4E5] px-2 py-0.5 text-[11px] font-medium text-[#ED7B11]">
                        累加得分
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                      <span className="font-medium text-slate-600">第 2 名 / 28人</span>
                      <span className="font-medium text-[#ED7B11]">↑ 提升 1 位</span>
                    </div>
                  </div>

                  {/* Card 5: 平均得分 */}
                  <div className="flex min-h-[124px] flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <Sparkles className="h-4 w-4 text-[#8C3BE0]" />
                        平均得分
                      </span>
                      <span className="rounded-md bg-[#F9F2FF] px-2 py-0.5 text-[11px] font-semibold text-[#8C3BE0]">
                        环比 +1.8%
                      </span>
                    </div>
                    <div className="my-1.5 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1">
                        <strong className="font-mono text-2xl font-bold text-[#8C3BE0]">92.8</strong>
                        <span className="text-xs text-slate-400">分</span>
                      </div>
                      <span className="rounded bg-[#F6EDFF] px-2 py-0.5 text-[11px] font-medium text-[#8C3BE0]">
                        每条均分
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                      <span className="font-medium text-slate-600">第 3 名 / 28人</span>
                      <span className="font-medium text-[#8C3BE0]">↑ 提升 1 位</span>
                    </div>
                  </div>
                </div>

                {/* 平均效能对比 Card */}
                <div className="rounded-xl border border-[#FEEBD0] bg-[#FFFDF7] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F59E0B] text-white">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </span>
                      <h3 className="text-xs font-bold text-slate-800">平均效能对比</h3>
                    </div>
                    <span className="rounded-full bg-[#FFF3DC] px-3 py-1 text-xs font-medium text-[#B45309]">
                      个人 vs 机构平均 · 张三
                    </span>
                  </div>

                  <div className="grid grid-cols-1 divide-y divide-slate-100/80 md:grid-cols-3 md:divide-y-0 md:divide-x">
                    {/* Col 1 */}
                    <div className="space-y-2 py-2 md:py-0 md:pr-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">累计采纳数</span>
                        <span className="rounded-md bg-[#EDFAF5] px-2 py-0.5 text-[11px] font-bold text-[#08B889]">
                          +4 件
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          个人 <strong className="font-bold text-[#08B889]">9 件</strong>
                        </span>
                        <span className="text-slate-500">
                          机构平均 <strong className="font-bold text-slate-700">5 件</strong>
                        </span>
                      </div>
                    </div>

                    {/* Col 2 */}
                    <div className="space-y-2 py-2 md:py-0 md:px-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">整体通过率</span>
                        <span className="rounded-md bg-[#EBF3FF] px-2 py-0.5 text-[11px] font-bold text-[#2F74FF]">
                          +10.9%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          个人 <strong className="font-bold text-[#2F74FF]">90.9%</strong>
                        </span>
                        <span className="text-slate-500">
                          机构平均 <strong className="font-bold text-slate-700">80.0%</strong>
                        </span>
                      </div>
                    </div>

                    {/* Col 3 */}
                    <div className="space-y-2 py-2 md:py-0 md:pl-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">平均得分</span>
                        <span className="rounded-md bg-[#F9F2FF] px-2 py-0.5 text-[11px] font-bold text-[#8C3BE0]">
                          +4.2 分
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          个人 <strong className="font-bold text-[#8C3BE0]">92.8</strong>
                        </span>
                        <span className="text-slate-500">
                          机构平均 <strong className="font-bold text-slate-700">88.6 分</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* 3 KPI Cards for 审核员 */}
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                  {/* Card 1: 累计审核数 */}
                  <div className="flex min-h-[124px] flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <CheckSquare className="h-4 w-4 text-[#1B5BD6]" />
                        累计审核数
                      </span>
                      <span className="flex items-center gap-0.5 rounded-md bg-[#EDFAF5] px-2 py-0.5 text-[11px] font-semibold text-[#08B889]">
                        <span>~</span>
                        <span>环比 +18.2%</span>
                      </span>
                    </div>
                    <div className="my-1.5 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1">
                        <strong className="font-mono text-2xl font-bold text-[#1B5BD6]">86</strong>
                        <span className="text-xs text-slate-400">件</span>
                      </div>
                      <div className="text-[11px]">
                        <span className="font-medium text-[#1B5BD6]">已办 86</span>
                        <span className="mx-1 text-slate-300">/</span>
                        <span className="font-medium text-[#08B889]">通过 78</span>
                        <span className="mx-1 text-slate-300">/</span>
                        <span className="font-medium text-[#E11D48]">驳回 8</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                      <span className="font-medium text-slate-600">第 2 名 / 16人</span>
                      <span className="font-medium text-[#1B5BD6]">↑ 提升 1 位</span>
                    </div>
                  </div>

                  {/* Card 2: 审核处理率 */}
                  <div className="flex min-h-[124px] flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <Percent className="h-4 w-4 text-[#08B889]" />
                        审核处理率
                      </span>
                      <span className="rounded-md bg-[#EDFAF5] px-2 py-0.5 text-[11px] font-semibold text-[#08B889]">
                        环比 +3.8%
                      </span>
                    </div>
                    <div className="my-1.5 flex items-baseline justify-between">
                      <strong className="font-mono text-2xl font-bold text-[#08B889]">94.5%</strong>
                      <div className="text-[11px]">
                        <span className="font-medium text-[#1B5BD6]">已办 86</span>
                        <span className="mx-1 text-slate-300">/</span>
                        <span className="font-medium text-slate-500">上报 91</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                      <span className="font-medium text-slate-600">第 1 名 / 16人</span>
                      <span className="font-medium text-[#08B889]">↑ 提升 1 位</span>
                    </div>
                  </div>

                  {/* Card 3: 平均审核响应时长 */}
                  <div className="flex min-h-[124px] flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <Clock className="h-4 w-4 text-[#8C3BE0]" />
                        平均审核响应时长
                        <span title="派发至审核完成耗时">
                          <Info className="h-3 w-3 text-slate-400 cursor-pointer" />
                        </span>
                      </span>
                      <span className="rounded-md bg-[#F9F2FF] px-2 py-0.5 text-[11px] font-semibold text-[#8C3BE0]">
                        环比 -17.1%
                      </span>
                    </div>
                    <div className="my-1.5 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1">
                        <strong className="font-mono text-2xl font-bold text-[#8C3BE0]">6.8</strong>
                        <span className="text-xs text-slate-400">分钟</span>
                      </div>
                      <span className="rounded bg-[#F6EDFF] px-2 py-0.5 text-[11px] font-medium text-[#8C3BE0]">
                        派发至审核完成耗时
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                      <span className="font-medium text-slate-600">第 1 名 / 16人</span>
                      <span className="font-medium text-[#8C3BE0]">↑ 提升 1 位</span>
                    </div>
                  </div>
                </div>

                {/* 平均效能对比 Card for 审核员 */}
                <div className="rounded-xl border border-[#FEEBD0] bg-[#FFFDF7] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F59E0B] text-white">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </span>
                      <h3 className="text-xs font-bold text-slate-800">平均效能对比</h3>
                    </div>
                    <span className="rounded-full bg-[#FFF3DC] px-3 py-1 text-xs font-medium text-[#B45309]">
                      个人 vs 机构平均 · 王主任
                    </span>
                  </div>

                  <div className="grid grid-cols-1 divide-y divide-slate-100/80 md:grid-cols-3 md:divide-y-0 md:divide-x">
                    {/* Col 1 */}
                    <div className="space-y-2 py-2 md:py-0 md:pr-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">累计审核数</span>
                        <span className="rounded-md bg-[#EDFAF5] px-2 py-0.5 text-[11px] font-bold text-[#08B889]">
                          +32 件
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          个人 <strong className="font-bold text-[#08B889]">86 件</strong>
                        </span>
                        <span className="text-slate-500">
                          机构平均 <strong className="font-bold text-slate-700">54 件</strong>
                        </span>
                      </div>
                    </div>

                    {/* Col 2 */}
                    <div className="space-y-2 py-2 md:py-0 md:px-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">审核处理率</span>
                        <span className="rounded-md bg-[#EBF3FF] px-2 py-0.5 text-[11px] font-bold text-[#2F74FF]">
                          +12.4%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          个人 <strong className="font-bold text-[#2F74FF]">94.5%</strong>
                        </span>
                        <span className="text-slate-500">
                          机构平均 <strong className="font-bold text-slate-700">82.1%</strong>
                        </span>
                      </div>
                    </div>

                    {/* Col 3 */}
                    <div className="space-y-2 py-2 md:py-0 md:pl-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">平均审核响应时长</span>
                        <span className="rounded-md bg-[#F9F2FF] px-2 py-0.5 text-[11px] font-bold text-[#8C3BE0]">
                          -7.7 分钟
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          个人 <strong className="font-bold text-[#8C3BE0]">6.8 分钟</strong>
                        </span>
                        <span className="text-slate-500">
                          机构平均 <strong className="font-bold text-slate-700">14.5 分钟</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* SECTION 3: 考核量化明细总表 - 1:1 RESTORED */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-4">
            {/* Table Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#1B5BD6]" />
                <h2 className="text-sm font-bold text-slate-800">
                  {perspective === 'report' ? '上报员考核量化明细总表' : '审核员考核量化明细总表'}
                </h2>
              </div>

              <div>
                {perspective === 'report' ? (
                  <select
                    aria-label="上报员排名排序"
                    value={reporterSort}
                    onChange={(e) => setReporterSort(e.target.value)}
                    className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none shadow-xs"
                  >
                    <option value="adopted">按采纳数排名</option>
                    <option value="score">按综合得分排名</option>
                    <option value="directRate">按一次性通过率排名</option>
                    <option value="passRate">按整体通过率排名</option>
                  </select>
                ) : (
                  <select
                    aria-label="审核员排名排序"
                    value={auditorSort}
                    onChange={(e) => setAuditorSort(e.target.value)}
                    className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none shadow-xs"
                  >
                    <option value="audited">按累计审核数排名</option>
                    <option value="rate">按审核处理率排名</option>
                    <option value="time">按平均响应时长排名</option>
                  </select>
                )}
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              {perspective === 'report' ? (
                <table className="w-full min-w-[980px] text-left text-xs">
                  <thead className="border-b border-slate-100 text-slate-400">
                    <tr>
                      <th className="w-24 py-3 text-center font-medium">排名</th>
                      <th className="py-3 font-medium">上报员 / 所属机构</th>
                      <th className="py-3 text-center font-medium">累计采纳数 (首发/重复)</th>
                      <th className="py-3 text-center font-medium">一次性通过率 (通过/总件数)</th>
                      <th className="py-3 text-center font-medium">整体通过率 (通过/总件数)</th>
                      <th className="py-3 text-center font-medium">综合得分</th>
                      <th className="py-3 text-center font-medium">平均得分</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedReporters.map((row) => (
                      <tr
                        key={row.name}
                        onClick={() => openReporterProfile(row)}
                        className="cursor-pointer transition hover:bg-slate-50/70"
                      >
                        {/* 排名 */}
                        <td className="py-3.5 text-center">
                          <div className="flex flex-col items-center justify-center">
                            {row.rank === 1 ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#FFF7E8] px-2 py-0.5 text-xs font-bold text-[#D97706]">
                                🥇 1
                              </span>
                            ) : row.rank === 2 ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#F1F5F9] px-2 py-0.5 text-xs font-bold text-[#475569]">
                                🥈 2
                              </span>
                            ) : row.rank === 3 ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#FFF3EB] px-2 py-0.5 text-xs font-bold text-[#C2410C]">
                                🥉 3
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-slate-600">{row.rank}</span>
                            )}
                            <span className="mt-1 text-[10px] font-medium text-[#1B5BD6]">
                              {row.rankChange}
                            </span>
                          </div>
                        </td>

                        {/* 上报员 / 所属机构 */}
                        <td className="py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs">{row.name}</span>
                            {row.isLeader && (
                              <span className="rounded bg-[#FFF4E5] px-1.5 py-0.5 text-[10px] font-semibold text-[#ED7B11]">
                                领跑者
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-400">{row.org}</div>
                        </td>

                        {/* 累计采纳数 */}
                        <td className="py-3.5 text-center">
                          <div className="font-mono text-xs font-bold text-[#08B889]">
                            {row.adoptedCount} 件
                          </div>
                          <div className="mt-0.5 text-[11px]">
                            <span className="font-medium text-[#08B889]">首发 {row.firstCount}</span>
                            <span className="mx-1 text-slate-300">/</span>
                            <span className="font-medium text-[#2F74FF]">重复 {row.repeatCount}</span>
                          </div>
                        </td>

                        {/* 一次性通过率 */}
                        <td className="py-3.5 text-center">
                          <div className="font-mono text-xs font-bold text-[#08B889]">
                            {row.directRate}%
                          </div>
                          <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                            {row.directRatioText}
                          </div>
                        </td>

                        {/* 整体通过率 */}
                        <td className="py-3.5 text-center">
                          <div className="font-mono text-xs font-bold text-[#08B889]">
                            {row.passRate}%
                          </div>
                          <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                            {row.passRatioText}
                          </div>
                        </td>

                        {/* 综合得分 */}
                        <td className="py-3.5 text-center">
                          <div className="font-mono text-xs font-bold text-[#ED7B11]">
                            {row.scoreText}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-400">{row.scoreNote}</div>
                        </td>

                        {/* 平均得分 */}
                        <td className="py-3.5 text-center">
                          <div className="font-mono text-xs font-bold text-[#8C3BE0]">
                            {row.avgScoreText}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-400">{row.avgScoreNote}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full min-w-[900px] text-left text-xs">
                  <thead className="border-b border-slate-100 text-slate-400">
                    <tr>
                      <th className="w-24 py-3 text-center font-medium">排名</th>
                      <th className="py-3 font-medium">审核员 / 所属机构</th>
                      <th className="py-3 text-center font-medium">累计审核数 (已办/通过/驳回)</th>
                      <th className="py-3 text-center font-medium">审核处理率 (已办/上报)</th>
                      <th className="py-3 text-center font-medium">平均审核响应时长</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedAuditors.map((row) => (
                      <tr
                        key={row.name}
                        onClick={() => openAuditorProfile(row)}
                        className="cursor-pointer transition hover:bg-slate-50/70"
                      >
                        {/* 排名 */}
                        <td className="py-3.5 text-center">
                          <div className="flex flex-col items-center justify-center">
                            {row.rank === 1 ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#FFF7E8] px-2 py-0.5 text-xs font-bold text-[#D97706]">
                                🥇 1
                              </span>
                            ) : row.rank === 2 ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#F1F5F9] px-2 py-0.5 text-xs font-bold text-[#475569]">
                                🥈 2
                              </span>
                            ) : row.rank === 3 ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#FFF3EB] px-2 py-0.5 text-xs font-bold text-[#C2410C]">
                                🥉 3
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-slate-600">{row.rank}</span>
                            )}
                            <span className="mt-1 text-[10px] font-medium text-[#1B5BD6]">
                              {row.rankChange}
                            </span>
                          </div>
                        </td>

                        {/* 审核员 / 所属机构 */}
                        <td className="py-3.5">
                          <div className="font-bold text-slate-900 text-xs">{row.name}</div>
                          <div className="mt-0.5 text-[11px] text-slate-400">{row.org}</div>
                        </td>

                        {/* 累计审核数 */}
                        <td className="py-3.5 text-center">
                          <div className="font-mono text-xs font-bold text-slate-800">
                            {row.totalAudited} 件
                          </div>
                          <div className="mt-0.5 text-[11px]">
                            <span className="font-medium text-[#1B5BD6]">已办 {row.processedCount}</span>
                            <span className="mx-1 text-slate-300">/</span>
                            <span className="font-medium text-[#08B889]">通过 {row.passedCount}</span>
                            <span className="mx-1 text-slate-300">/</span>
                            <span className="font-medium text-[#E11D48]">驳回 {row.rejectedCount}</span>
                          </div>
                        </td>

                        {/* 审核处理率 */}
                        <td className="py-3.5 text-center">
                          <div className="font-mono text-xs font-bold text-[#08B889]">
                            {row.auditProcessRate}%
                          </div>
                          <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                            {row.auditProcessRatioText}
                          </div>
                        </td>

                        {/* 平均审核响应时长 */}
                        <td className="py-3.5 text-center">
                          <div className="font-mono text-xs font-bold text-[#8C3BE0]">
                            {row.avgResponseMin} 分钟
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </>
      )}

      {/* Profile Modal */}
      <EvaluationProfileModal
        data={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        periodText={`${startDate} - ${endDate}`}
      />
    </div>
  );
};
