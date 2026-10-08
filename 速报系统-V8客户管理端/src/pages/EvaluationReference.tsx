import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  FileText,
  Globe2,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Target,
  Trophy,
  UsersRound,
  Zap,
} from 'lucide-react';
import { EvaluationProfileModal, ProfileDetailData } from '../components/EvaluationProfileModal';
import { PaginationBar } from '../components/PaginationBar';
import { PageId } from '../types';

interface EvaluationReferenceProps {
  onNavigate?: (page: PageId) => void;
}

type EvalTab = 'org' | 'person';
type Period = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
type Perspective = 'report' | 'audit';
type Grade = '卓越' | '优秀' | '良好' | '合格';

interface OrgRecord {
  rank: number;
  name: string;
  type: string;
  staff: number;
  reporters: number;
  auditors: number;
  total: number;
  adopted: number;
  firstCount: number;
  repeatCount: number;
  rejected: number;
  pending: number;
  directRate: number;
  passRate: number;
  avgTime: number;
  perCapita: number;
  closedRate: number;
  grade: Grade;
  score: number;
  isMine?: boolean;
}

interface ReporterRow {
  id: string;
  name: string;
  org: string;
  total: number;
  adoptedCount: number;
  firstCount: number;
  repeatCount: number;
  directCount: number;
  directRate: number;
  passRate: number;
  score: number;
  avgScore: number;
  grade: Grade;
  rankChange: string;
}

interface AuditorRow {
  id: string;
  name: string;
  org: string;
  totalAudited: number;
  reportedCount: number;
  passedCount: number;
  rejectedCount: number;
  auditProcessRate: number;
  avgResponseMin: number;
  avgScore: number;
  grade: Grade;
  rankChange: string;
}

type Ranked<T> = T & { rank: number };

const orgRecords: OrgRecord[] = [
  { rank: 1, name: '中共台中市委宣传部', type: '市级党政主体', staff: 45, reporters: 32, auditors: 13, total: 1580, adopted: 1520, firstCount: 1180, repeatCount: 340, rejected: 35, pending: 25, directRate: 88.6, passRate: 96.2, avgTime: 6.8, perCapita: 35.1, closedRate: 100, score: 98.5, grade: '卓越', isMine: true },
  { rank: 2, name: '台中市网信办', type: '网安指挥主管', staff: 38, reporters: 26, auditors: 12, total: 1350, adopted: 1280, firstCount: 990, repeatCount: 290, rejected: 42, pending: 28, directRate: 86.4, passRate: 94.8, avgTime: 8.5, perCapita: 35.5, closedRate: 98.5, score: 95.8, grade: '卓越' },
  { rank: 3, name: '西屯区网信办', type: '区县直属单位', staff: 40, reporters: 28, auditors: 12, total: 1120, adopted: 1030, firstCount: 780, repeatCount: 250, rejected: 58, pending: 32, directRate: 82.5, passRate: 92, avgTime: 10.8, perCapita: 28, closedRate: 97.8, score: 93.2, grade: '优秀' },
  { rank: 4, name: '台中市大数据中心', type: '独立直属单位', staff: 40, reporters: 29, auditors: 11, total: 980, adopted: 890, firstCount: 660, repeatCount: 230, rejected: 60, pending: 30, directRate: 81, passRate: 90.8, avgTime: 12.2, perCapita: 24.5, closedRate: 96, score: 91.5, grade: '优秀' },
  { rank: 5, name: '东湖区委宣传部', type: '区县直属单位', staff: 38, reporters: 28, auditors: 10, total: 850, adopted: 750, firstCount: 560, repeatCount: 190, rejected: 65, pending: 35, directRate: 77.8, passRate: 88.2, avgTime: 14.5, perCapita: 22.4, closedRate: 95, score: 89.4, grade: '良好' },
  { rank: 6, name: '北屯区宣传部', type: '区县直属单位', staff: 35, reporters: 25, auditors: 10, total: 720, adopted: 630, firstCount: 460, repeatCount: 170, rejected: 55, pending: 35, directRate: 75, passRate: 87.5, avgTime: 15, perCapita: 20.6, closedRate: 94.2, score: 87.8, grade: '良好' },
  { rank: 7, name: '南屯区网信办', type: '区县直属单位', staff: 34, reporters: 24, auditors: 10, total: 680, adopted: 590, firstCount: 430, repeatCount: 160, rejected: 52, pending: 38, directRate: 74.2, passRate: 86.8, avgTime: 15.5, perCapita: 20, closedRate: 93.5, score: 86.9, grade: '合格' },
  { rank: 8, name: '高新区管委会', type: '独立直属单位', staff: 30, reporters: 22, auditors: 8, total: 590, adopted: 510, firstCount: 380, repeatCount: 130, rejected: 48, pending: 32, directRate: 73, passRate: 86.4, avgTime: 16, perCapita: 19.6, closedRate: 92, score: 85.7, grade: '合格' },
  { rank: 9, name: '市公安局网安支队', type: '市级党政主体', staff: 28, reporters: 20, auditors: 8, total: 562, adopted: 490, firstCount: 370, repeatCount: 120, rejected: 44, pending: 28, directRate: 74.5, passRate: 87.2, avgTime: 13.8, perCapita: 20.1, closedRate: 97, score: 86.2, grade: '合格' },
  { rank: 10, name: '经开区网信办', type: '区县直属单位', staff: 26, reporters: 19, auditors: 7, total: 485, adopted: 420, firstCount: 310, repeatCount: 110, rejected: 40, pending: 25, directRate: 72.1, passRate: 86.6, avgTime: 16.2, perCapita: 18.6, closedRate: 91.5, score: 85, grade: '合格' },
  { rank: 11, name: '市发改委政研室', type: '市级党政主体', staff: 24, reporters: 18, auditors: 6, total: 430, adopted: 375, firstCount: 280, repeatCount: 95, rejected: 35, pending: 20, directRate: 71.8, passRate: 87.2, avgTime: 14.2, perCapita: 17.9, closedRate: 95, score: 84.6, grade: '合格' },
  { rank: 12, name: '新城区委网信办', type: '区县直属单位', staff: 22, reporters: 16, auditors: 6, total: 390, adopted: 335, firstCount: 250, repeatCount: 85, rejected: 32, pending: 23, directRate: 70.5, passRate: 85.9, avgTime: 17, perCapita: 17.7, closedRate: 90, score: 83.5, grade: '合格' },
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

const getParticipationCount = (record: OrgRecord) => orgParticipationCounts[record.name] ?? Math.max(record.reporters, record.auditors);
const getParticipationRate = (record: OrgRecord) => ((getParticipationCount(record) / record.staff) * 100).toFixed(1);

const REPORTER_NAMES = [
  '张三', '李晓峰', '陈思远', '王五', '刘雨桐', '黄志强', '赵六', '周婷', '吴浩然', '孙七', '徐静怡', '马俊杰',
  '朱丽娜', '胡建国', '郭子涵', '何文博', '林雪', '罗明轩', '高嘉怡', '梁宇航', '宋佳琪', '郑十', '谢晨阳', '韩梦瑶',
  '唐志远', '冯晓燕', '于海涛', '董欣然', '程立伟', '曹雅婷', '袁浩宇', '邓思琪', '许俊辉', '傅佳慧', '沈宏伟', '曾晓琳',
];

const AUDITOR_NAMES = [
  '王主任', '李明', '陈科长', '周主管', '韩科长', '徐副主任', '杨处长', '秦主任', '蒋科长', '蔡主管', '贾副处长', '丁主任',
  '魏科长', '薛主管', '叶副主任', '阎科长', '余主任', '潘主管', '杜科长', '戴副主任', '夏主任', '钟科长', '汪主管', '田副处长',
];

const REPORTERS_PER_ORG = 3;
const AUDITORS_PER_ORG = 2;

const seeded = (n: number) => {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};
const round1 = (n: number) => Math.round(n * 10) / 10;

const gradeForScore = (score: number): Grade =>
  score >= 95 ? '卓越' : score >= 92 ? '优秀' : score >= 88 ? '良好' : '合格';

const rankChangeFor = (r: number) => {
  if (r > 0.66) return `↑ 提升 ${1 + Math.floor(r * 3)} 位`;
  if (r < 0.33) return `↓ 下降 ${1 + Math.floor(r * 6)} 位`;
  return '持平';
};

const reporterRecords: ReporterRow[] = orgRecords.flatMap((org, i) =>
  Array.from({ length: REPORTERS_PER_ORG }, (_, j) => {
    const k = i * REPORTERS_PER_ORG + j;
    const r = seeded(k + 1);
    const total = Math.max(10, Math.round(48 - i * 2.2 - j * 6 + r * 8));
    const directRate = round1(Math.min(96, 88 - i * 1.2 - j * 3 + r * 4));
    const passRate = round1(Math.min(99, directRate + 6 + r * 3));
    const directCount = Math.round((total * directRate) / 100);
    const adoptedCount = Math.round((total * passRate) / 100);
    const firstCount = Math.round(adoptedCount * 0.76);
    const avgScore = round1(97 - i * 0.6 - j * 1.5 - r * 2);
    return {
      id: `reporter-${k}`,
      name: REPORTER_NAMES[k],
      org: org.name,
      total,
      adoptedCount,
      firstCount,
      repeatCount: adoptedCount - firstCount,
      directCount,
      directRate,
      passRate,
      score: round1(adoptedCount * avgScore),
      avgScore,
      grade: gradeForScore(avgScore),
      rankChange: rankChangeFor(r),
    };
  }),
);

const auditorRecords: AuditorRow[] = orgRecords.flatMap((org, i) =>
  Array.from({ length: AUDITORS_PER_ORG }, (_, j) => {
    const k = i * AUDITORS_PER_ORG + j;
    const r = seeded(k + 101);
    const totalAudited = Math.max(20, Math.round(150 - i * 7 - j * 20 + r * 15));
    const rejectedCount = Math.round(totalAudited * (0.08 + r * 0.04));
    const reportedCount = totalAudited + Math.round(2 + r * 10);
    const avgScore = round1(97.5 - i * 0.5 - j * 1.2 - r * 1.5);
    return {
      id: `auditor-${k}`,
      name: AUDITOR_NAMES[k],
      org: org.name,
      totalAudited,
      reportedCount,
      passedCount: totalAudited - rejectedCount,
      rejectedCount,
      auditProcessRate: round1((totalAudited / reportedCount) * 100),
      avgResponseMin: round1(6.5 + i * 0.7 + j * 1.8 + r * 2),
      avgScore,
      grade: gradeForScore(avgScore),
      rankChange: rankChangeFor(r),
    };
  }),
);

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1)
    return <span className="inline-flex items-center gap-1 rounded-md border border-[#FDE68A] bg-[#FFF7E8] px-2 py-0.5 text-xs font-bold text-[#D97706]">🥇 1</span>;
  if (rank === 2)
    return <span className="inline-flex items-center gap-1 rounded-md border border-[#CBD5E1] bg-[#F1F5F9] px-2 py-0.5 text-xs font-bold text-[#475569]">🥈 2</span>;
  if (rank === 3)
    return <span className="inline-flex items-center gap-1 rounded-md border border-[#FDBA74] bg-[#FFF3EB] px-2 py-0.5 text-xs font-bold text-[#C2410C]">🥉 3</span>;
  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1 font-mono text-xs font-semibold text-slate-600">
      {rank}
    </span>
  );
};

const rankChangeClass = (text: string) =>
  text.startsWith('↑') ? 'text-[#08B889]' : text.startsWith('↓') ? 'text-[#E11D48]' : 'text-slate-400';

interface GlobalKpiCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  value: string;
  unit?: string;
  subDetail: React.ReactNode;
  footerLeft: React.ReactNode;
  footerRight: React.ReactNode;
  footerRightColor?: string;
}

const GlobalKpiCard: React.FC<GlobalKpiCardProps> = ({
  title,
  icon,
  color,
  badge,
  badgeBg,
  badgeColor,
  value,
  unit,
  subDetail,
  footerLeft,
  footerRight,
  footerRightColor,
}) => (
  <div className="flex min-h-[124px] flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:shadow-xs hover:border-slate-300 transition">
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        <span style={{ color }}>{icon}</span>
        {title}
      </span>
      <span
        className="flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[11px] font-semibold"
        style={{ backgroundColor: badgeBg, color: badgeColor }}
      >
        {badge}
      </span>
    </div>
    <div className="my-1.5 flex flex-wrap items-baseline justify-between gap-1">
      <div className="flex items-baseline gap-1 shrink-0">
        <strong className="font-mono text-2xl font-bold" style={{ color }}>
          {value}
        </strong>
        {unit && <span className="text-xs text-slate-400">{unit}</span>}
      </div>
      <div className="text-[11px]">{subDetail}</div>
    </div>
    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
      <span className="font-medium text-slate-600">{footerLeft}</span>
      <span className="font-medium" style={{ color: footerRightColor || color }}>
        {footerRight}
      </span>
    </div>
  </div>
);

const readEvalHash = (): { tab: EvalTab; perspective: Perspective } => {
  const query = window.location.hash.split('?')[1] || '';
  const params = new URLSearchParams(query);
  return {
    tab: params.get('tab') === 'person' ? 'person' : 'org',
    perspective: params.get('role') === 'auditor' ? 'audit' : 'report',
  };
};

const buildEvalHash = (tab: EvalTab, perspective: Perspective) =>
  tab === 'person'
    ? `#/evaluation?tab=person&role=${perspective === 'audit' ? 'auditor' : 'reporter'}`
    : '#/evaluation?tab=org';

const sectionClass = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-4';

export const EvaluationReference: React.FC<EvaluationReferenceProps> = () => {
  const [tab, setTab] = useState<EvalTab>(() => readEvalHash().tab);
  const [perspective, setPerspective] = useState<Perspective>(() => readEvalHash().perspective);
  const [period, setPeriod] = useState<Period>('week');
  const [startDate, setStartDate] = useState('2026/08/04');
  const [endDate, setEndDate] = useState('2026/08/11');
  const [orgFilter, setOrgFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [personPage, setPersonPage] = useState(1);
  const [personPageSize, setPersonPageSize] = useState(10);
  const [orgSort, setOrgSort] = useState<string>('total');
  const [reporterSort, setReporterSort] = useState<string>('score');
  const [auditorSort, setAuditorSort] = useState<string>('audited');
  const [toast, setToast] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<ProfileDetailData | null>(null);

  useEffect(() => {
    const next = buildEvalHash(tab, perspective);
    if (window.location.hash !== next) window.location.replace(next);
  }, [tab, perspective]);

  useEffect(() => {
    const sync = () => {
      if (!window.location.hash.startsWith('#/evaluation')) return;
      const next = readEvalHash();
      setTab(next.tab);
      setPerspective(next.perspective);
    };
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  useEffect(() => {
    setPersonPage(1);
  }, [perspective, orgFilter, keyword, reporterSort, auditorSort]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const resetFilters = () => {
    setPeriod('week');
    setStartDate('2026/08/04');
    setEndDate('2026/08/11');
    setOrgFilter('');
    setKeyword('');
    setReporterSort('score');
    setAuditorSort('audited');
    setOrgSort('total');
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
    if (orgSort === 'total') list.sort((a, b) => b.total - a.total);
    else if (orgSort === 'adopted') list.sort((a, b) => b.adopted - a.adopted);
    else if (orgSort === 'firstCount') list.sort((a, b) => b.firstCount - a.firstCount);
    else if (orgSort === 'directRate') list.sort((a, b) => b.directRate - a.directRate);
    else if (orgSort === 'passRate') list.sort((a, b) => b.passRate - a.passRate);
    else if (orgSort === 'avgTime') list.sort((a, b) => a.avgTime - b.avgTime);
    else if (orgSort === 'perCapita') list.sort((a, b) => b.perCapita - a.perCapita);
    else if (orgSort === 'closedRate') list.sort((a, b) => b.closedRate - a.closedRate);
    else if (orgSort === 'participation')
      list.sort((a, b) => Number(getParticipationRate(b)) - Number(getParticipationRate(a)));
    else list.sort((a, b) => a.rank - b.rank);
    return orgFilter ? list.filter((o) => o.name === orgFilter) : list;
  }, [orgSort, orgFilter]);

  const matchesPerson = (row: { name: string; org: string }) =>
    (!orgFilter || row.org === orgFilter) && (!keyword.trim() || row.name.includes(keyword.trim()));

  const rankedReporters = useMemo<Ranked<ReporterRow>[]>(() => {
    const list = [...reporterRecords];
    if (reporterSort === 'adopted') list.sort((a, b) => b.adoptedCount - a.adoptedCount);
    else if (reporterSort === 'firstCount') list.sort((a, b) => b.firstCount - a.firstCount);
    else if (reporterSort === 'directRate') list.sort((a, b) => b.directRate - a.directRate);
    else if (reporterSort === 'passRate') list.sort((a, b) => b.passRate - a.passRate);
    else if (reporterSort === 'avgScore') list.sort((a, b) => b.avgScore - a.avgScore);
    else list.sort((a, b) => b.score - a.score);
    return list.map((row, index) => ({ ...row, rank: index + 1 }));
  }, [reporterSort]);

  const rankedAuditors = useMemo<Ranked<AuditorRow>[]>(() => {
    const list = [...auditorRecords];
    if (auditorSort === 'rate') list.sort((a, b) => b.auditProcessRate - a.auditProcessRate);
    else if (auditorSort === 'time') list.sort((a, b) => a.avgResponseMin - b.avgResponseMin);
    else list.sort((a, b) => b.totalAudited - a.totalAudited);
    return list.map((row, index) => ({ ...row, rank: index + 1 }));
  }, [auditorSort]);

  const visibleReporters = rankedReporters.filter(matchesPerson);
  const visibleAuditors = rankedAuditors.filter(matchesPerson);
  const personTotal = perspective === 'report' ? visibleReporters.length : visibleAuditors.length;
  const pageStart = (personPage - 1) * personPageSize;
  const pagedReporters = visibleReporters.slice(pageStart, pageStart + personPageSize);
  const pagedAuditors = visibleAuditors.slice(pageStart, pageStart + personPageSize);

  const scopedReporters = reporterRecords.filter((r) => !orgFilter || r.org === orgFilter);
  const scopedAuditors = auditorRecords.filter((r) => !orgFilter || r.org === orgFilter);
  const scopeLabel = orgFilter || `全域 ${orgRecords.length} 家机构`;

  const reporterStats = useMemo(() => {
    const list = scopedReporters;
    const sum = (fn: (r: ReporterRow) => number) => list.reduce((acc, r) => acc + fn(r), 0);
    const total = sum((r) => r.total);
    const adopted = sum((r) => r.adoptedCount);
    const first = sum((r) => r.firstCount);
    const direct = sum((r) => r.directCount);
    const best = [...list].sort((a, b) => b.avgScore - a.avgScore)[0];
    return {
      count: list.length,
      orgCount: new Set(list.map((r) => r.org)).size,
      total,
      adopted,
      first,
      repeat: adopted - first,
      direct,
      directRate: total ? round1((direct / total) * 100) : 0,
      passRate: total ? round1((adopted / total) * 100) : 0,
      avgScore: list.length ? round1(sum((r) => r.avgScore) / list.length) : 0,
      perCapita: list.length ? round1(adopted / list.length) : 0,
      best,
    };
  }, [orgFilter]);

  const auditorStats = useMemo(() => {
    const list = scopedAuditors;
    const sum = (fn: (r: AuditorRow) => number) => list.reduce((acc, r) => acc + fn(r), 0);
    const audited = sum((r) => r.totalAudited);
    const reported = sum((r) => r.reportedCount);
    const passed = sum((r) => r.passedCount);
    const fastest = [...list].sort((a, b) => a.avgResponseMin - b.avgResponseMin)[0];
    const best = [...list].sort((a, b) => b.avgScore - a.avgScore)[0];
    return {
      count: list.length,
      orgCount: new Set(list.map((r) => r.org)).size,
      audited,
      passed,
      rejected: audited - passed,
      reported,
      processRate: reported ? round1((audited / reported) * 100) : 0,
      avgResponse: list.length ? round1(sum((r) => r.avgResponseMin) / list.length) : 0,
      avgScore: list.length ? round1(sum((r) => r.avgScore) / list.length) : 0,
      perCapita: list.length ? Math.round(audited / list.length) : 0,
      fastest,
      best,
    };
  }, [orgFilter]);

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
        { label: '累计采纳数', value: `${row.adopted.toLocaleString()} 件`, subLabel: `首发 ${row.firstCount.toLocaleString()} / 重复 ${row.repeatCount.toLocaleString()}`, isHighlight: true },
        { label: '累计报送量', value: `${row.total.toLocaleString()} 件`, subLabel: `采纳 ${row.adopted.toLocaleString()} 件` },
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

  const openReporterProfile = (row: Ranked<ReporterRow>) => {
    setSelectedProfile({
      id: row.id,
      name: row.name,
      type: 'reporter',
      subTitle: row.org,
      rank: row.rank,
      totalScore: row.score,
      grade: row.grade,
      stats: [
        { label: '累计采纳量', value: `${row.adoptedCount} 件`, subLabel: `首发 ${row.firstCount} / 重复 ${row.repeatCount}`, isHighlight: true },
        { label: '一次性通过率', value: `${row.directRate}%`, isHighlight: true },
        { label: '整体通过率', value: `${row.passRate}%` },
        { label: '单条平均得分', value: `${row.avgScore} 分` },
      ],
      radarData: [
        { subject: '报送活跃', value: Math.min(100, 60 + row.total), fullMark: 100 },
        { subject: '采纳质量', value: row.passRate, fullMark: 100 },
        { subject: '一次通过', value: row.directRate, fullMark: 100 },
        { subject: '响应时效', value: 91, fullMark: 100 },
        { subject: '闭环成效', value: 92, fullMark: 100 },
      ],
      historyScores: [
        { month: '4月', score: round1(Math.max(78, row.avgScore - 6)) },
        { month: '5月', score: round1(Math.max(80, row.avgScore - 4)) },
        { month: '6月', score: round1(Math.max(82, row.avgScore - 2)) },
        { month: '7月', score: round1(Math.max(84, row.avgScore - 1)) },
        { month: '8月', score: row.avgScore },
      ],
      breakdown: [
        { category: '报送质量', item: '一次性通过激励', points: '+25.0', desc: '一次性通过率达到考核要求' },
        { category: '报送贡献', item: '有效采纳得分', points: '+40.0', desc: '完成周期内有效报送与采纳目标' },
        { category: '响应时效', item: '高效响应奖励', points: '+24.5', desc: '平均响应耗时优于考核基准' },
        { category: '综合表现', item: '综合绩效加分', points: '+9.0', desc: '人员活跃与业务闭环表现良好' },
      ],
      summaryEvaluation: `${row.name}（${row.org}）本考核周期考核等次为「${row.grade}」，全域上报员排名第 ${row.rank} 名。`,
    });
  };

  const openAuditorProfile = (row: Ranked<AuditorRow>) => {
    setSelectedProfile({
      id: row.id,
      name: row.name,
      type: 'auditor',
      subTitle: row.org,
      rank: row.rank,
      totalScore: row.avgScore,
      grade: row.grade,
      stats: [
        { label: '累计审核量', value: `${row.totalAudited} 件`, subLabel: `通过 ${row.passedCount} / 驳回 ${row.rejectedCount}`, isHighlight: true },
        { label: '审核处理率', value: `${row.auditProcessRate}%`, isHighlight: true },
        { label: '平均响应耗时', value: `${row.avgResponseMin} 分钟` },
        { label: '单条平均得分', value: `${row.avgScore} 分` },
      ],
      radarData: [
        { subject: '审核效率', value: row.auditProcessRate, fullMark: 100 },
        { subject: '审核质量', value: row.avgScore, fullMark: 100 },
        { subject: '审核完成', value: row.auditProcessRate, fullMark: 100 },
        { subject: '响应时效', value: Math.max(60, round1(100 - row.avgResponseMin * 2)), fullMark: 100 },
        { subject: '闭环成效', value: 92, fullMark: 100 },
      ],
      historyScores: [
        { month: '4月', score: round1(row.avgScore - 4) },
        { month: '5月', score: round1(row.avgScore - 3) },
        { month: '6月', score: round1(row.avgScore - 2) },
        { month: '7月', score: round1(row.avgScore - 1) },
        { month: '8月', score: row.avgScore },
      ],
      breakdown: [
        { category: '审核效率', item: '审核处理达标', points: '+32.0', desc: '周期内审核处理率达到考核要求' },
        { category: '审核质量', item: '审核通过质量', points: '+36.0', desc: '审核结论准确，驳回意见清晰' },
        { category: '响应时效', item: '快速审核响应', points: '+24.5', desc: '平均响应耗时优于审核基准' },
        { category: '综合表现', item: '综合绩效加分', points: '+9.0', desc: '审核活跃与处理闭环表现良好' },
      ],
      summaryEvaluation: `${row.name}（${row.org}）本考核周期考核等次为「${row.grade}」，全域审核员排名第 ${row.rank} 名。`,
    });
  };

  const tabButtonClass = (active: boolean) =>
    `inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all ${
      active ? 'bg-[#1D58C9] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
    }`;

  return (
    <div className="relative min-w-0 space-y-4 pb-10 text-slate-700">
      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}

      {/* 页头：标题 + 机构考核 / 人员考核 + 导出 */}
      <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-5">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <Trophy className="h-5 w-5" />
            </span>
            <h1 className="truncate text-base font-bold text-slate-900">考核管理与综合绩效评定</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5" role="tablist">
              <button type="button" role="tab" aria-selected={tab === 'org'} onClick={() => setTab('org')} className={tabButtonClass(tab === 'org')}>
                <Building2 className="h-3.5 w-3.5" />
                机构考核
              </button>
              <button type="button" role="tab" aria-selected={tab === 'person'} onClick={() => setTab('person')} className={tabButtonClass(tab === 'person')}>
                <UsersRound className="h-3.5 w-3.5" />
                人员考核
              </button>
            </div>

            <button
              type="button"
              onClick={() => showToast(`${tab === 'org' ? '机构' : '人员'}考核数据导出成功`)}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-xl bg-[#1D58C9] px-3.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
            >
              <Download className="h-3.5 w-3.5" />
              导出考核数据
            </button>
          </div>
        </div>

        {/* 筛选栏（两个页签共用） */}
        <div className="flex flex-wrap items-center gap-2.5 pt-3">
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
                    active ? 'bg-white font-semibold text-[#1B5BD6] shadow-xs' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

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

          <div className="relative flex items-center">
            <select
              aria-label="机构范围"
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="appearance-none cursor-pointer rounded-2xl border border-blue-200 bg-white pl-3.5 pr-8 py-1.5 text-xs font-semibold text-[#1D58C9] outline-none shadow-xs"
            >
              <option value="">机构范围: 全部机构 ({orgRecords.length}家)</option>
              {orgRecords.map((o) => (
                <option key={o.name} value={o.name}>
                  机构范围: {o.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#1D58C9]" />
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-xs transition hover:text-slate-800"
            title="重置筛选"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      {tab === 'org' ? (
        <>
          {/* 全域机构考核指标 */}
          <section className={sectionClass}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1D58C9] text-white shadow-xs">
                  <Target className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-bold text-slate-800">全域机构考核指标</h2>
              </div>
              <span className="rounded-xl bg-[#EBF3FF] px-3.5 py-1 text-xs font-semibold text-[#1D58C9]">
                全域 28 家参评机构 · 654 名在册人员
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-6 lg:[&>*]:col-span-2 lg:[&>*:nth-child(n+4)]:col-span-3 xl:grid-cols-5 xl:[&>*]:col-span-1 xl:[&>*:nth-child(n+4)]:col-span-1">
              <GlobalKpiCard
                title="全域参评机构"
                icon={<Globe2 className="h-4 w-4" />}
                color="#1D58C9"
                badge="达标率 100%"
                badgeBg="#EDFAF5"
                badgeColor="#08B889"
                value="28"
                unit="家"
                subDetail={
                  <div className="font-mono">
                    <span className="font-medium text-[#1D58C9]">上报 486</span>
                    <span className="mx-1 text-slate-300">/</span>
                    <span className="font-medium text-[#8656F4]">审核 168</span>
                  </div>
                }
                footerLeft="在册人员 654 人"
                footerRight="全域覆盖 100%"
                footerRightColor="#08B889"
              />
              <GlobalKpiCard
                title="累计报送量"
                icon={<FileText className="h-4 w-4" />}
                color="#1D58C9"
                badge="日均 349件"
                badgeBg="#EBF3FF"
                badgeColor="#1D58C9"
                value="10,480"
                unit="件"
                subDetail={
                  <div>
                    <span className="font-medium text-[#08B889]">采 9,370</span>
                    <span className="mx-1 text-slate-300">/</span>
                    <span className="font-medium text-[#E11D48]">驳 680</span>
                    <span className="mx-1 text-slate-300">/</span>
                    <span className="font-medium text-[#F5A400]">待 430</span>
                  </div>
                }
                footerLeft="人均报送 23.3 件/人"
                footerRight="↑ 环比 +6.8%"
                footerRightColor="#1D58C9"
              />
              <GlobalKpiCard
                title="累计采纳数"
                icon={<CheckCircle2 className="h-4 w-4" />}
                color="#08B889"
                badge="采纳率 89.4%"
                badgeBg="#EDFAF5"
                badgeColor="#08B889"
                value="9,370"
                unit="件"
                subDetail={
                  <div>
                    <span className="font-medium text-[#08B889]">首发 7,220</span>
                    <span className="mx-1 text-slate-300">/</span>
                    <span className="font-medium text-[#2F74FF]">重复 2,150</span>
                  </div>
                }
                footerLeft="有效采纳 9,370 件"
                footerRight="↑ 环比 +15.8%"
                footerRightColor="#08B889"
              />
              <GlobalKpiCard
                title="首审直通率"
                icon={<Zap className="h-4 w-4" />}
                color="#08B889"
                badge="质效核心"
                badgeBg="#EDFAF5"
                badgeColor="#08B889"
                value="77.4%"
                subDetail={<span className="font-mono text-xs text-slate-500">直通 8,110 / 10,480 件</span>}
                footerLeft="整体通过率 89.4%"
                footerRight="↑ 环比 +4.2%"
                footerRightColor="#08B889"
              />
              <GlobalKpiCard
                title="平均审核响应"
                icon={<Clock className="h-4 w-4" />}
                color="#8656F4"
                badge="流转提速"
                badgeBg="#F9F2FF"
                badgeColor="#8656F4"
                value="13.8"
                unit="分钟"
                subDetail={
                  <span className="rounded bg-[#F6EDFF] px-2 py-0.5 text-[11px] font-medium text-[#8656F4]">最快 6.8分 (宣传部)</span>
                }
                footerLeft="审核处理率 98.8%"
                footerRight="↓ 耗时 -17.1%"
                footerRightColor="#8656F4"
              />
            </div>

          </section>

          {/* 机构考核榜 */}
          <section className={sectionClass}>
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <BarChart3 className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-sm font-bold text-slate-900">全域机构考核榜</h2>
                <span className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                  {orgFilter ? '已筛选 1 家' : `共 ${orgRecords.length} 家展示`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">排序维度:</span>
                <select
                  aria-label="机构排名排序"
                  value={orgSort}
                  onChange={(e) => setOrgSort(e.target.value)}
                  className="min-h-8 cursor-pointer rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none shadow-xs hover:border-slate-300 focus:border-[#1D58C9] transition"
                >
                  <option value="total">按累计报送量排名</option>
                  <option value="adopted">按累计采纳数排名</option>
                  <option value="firstCount">按首发采纳数排名</option>
                  <option value="directRate">按首审直通率排名</option>
                  <option value="passRate">按整体通过率排名</option>
                  <option value="avgTime">按平均响应时长 (最快)</option>
                  <option value="perCapita">按人均报送量排名</option>
                  <option value="closedRate">按转办闭环率排名</option>
                  <option value="participation">按参与率排名</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px] text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-500 select-none border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-3.5 text-center font-semibold text-slate-700">排名</th>
                    <th className="px-3 py-3.5 font-semibold text-slate-700">机构名称 / 所属类型</th>
                    {[
                      ['participation', '人员参与 (参与/在册)', 'text-[#1D58C9]', '↓'],
                      ['total', '累计报送 (采纳/驳回/待审)', 'text-[#1D58C9]', '↓'],
                      ['adopted', '累计采纳数 (首发/重复)', 'text-[#08B889]', '↓'],
                      ['directRate', '首审直通率', 'text-[#08B889]', '↓'],
                      ['passRate', '整体通过率', 'text-[#2F74FF]', '↓'],
                      ['avgTime', '平均响应', 'text-[#8656F4]', '↑'],
                      ['perCapita', '人均报送量', 'text-[#1D58C9]', '↓'],
                      ['closedRate', '转办闭环率', 'text-[#08A69A]', '↓'],
                    ].map(([key, label, color, arrow]) => {
                      const active = orgSort === key || (key === 'adopted' && orgSort === 'firstCount');
                      return (
                        <th
                          key={key}
                          className={`px-3 py-3.5 text-center font-semibold cursor-pointer transition hover:text-slate-800 ${active ? `${color} font-bold` : ''}`}
                          onClick={() => setOrgSort(key === 'adopted' && orgSort === 'adopted' ? 'firstCount' : key)}
                          title={`点击按${label}排序`}
                        >
                          {label} {active && (orgSort === 'firstCount' ? '(首发)↓' : arrow)}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedOrgs.map((row, index) => (
                    <tr key={row.name} onClick={() => openOrgProfile(row)} className="cursor-pointer transition hover:bg-blue-50/40">
                      <td className="px-3 py-3.5 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <RankBadge rank={orgFilter ? row.rank : index + 1} />
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          {row.name}
                          {row.isMine && (
                            <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                              本机构
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-400">{row.type}</div>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${orgSort === 'participation' ? 'bg-blue-50/40' : ''}`}>
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          <span className="text-xs">
                            <strong className="text-slate-900">{getParticipationCount(row)}</strong>
                            <span className="text-slate-400"> / {row.staff} 人</span>
                          </span>
                          <span className="inline-flex items-center rounded-md border border-blue-100/60 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-[#1D58C9]">
                            {getParticipationRate(row)}%
                          </span>
                        </div>
                        <div className="mt-1 text-[10px] text-slate-500">
                          <span className="text-[#1D58C9] font-medium">报 {row.reporters}</span>
                          <span className="mx-1 text-slate-300">·</span>
                          <span className="text-[#8656F4] font-medium">审 {row.auditors}</span>
                        </div>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${orgSort === 'total' ? 'bg-blue-50/40' : ''}`}>
                        <strong className="text-slate-900 text-xs">{row.total.toLocaleString()}</strong>
                        <span className="text-[10px] text-slate-400 ml-0.5">件</span>
                        <div className="mt-1 flex items-center justify-center gap-1 text-[10px]">
                          <span className="rounded bg-emerald-50 px-1 py-0.5 font-medium text-emerald-700">采 {row.adopted}</span>
                          <span className="rounded bg-rose-50 px-1 py-0.5 font-medium text-rose-700">驳 {row.rejected}</span>
                          <span className="rounded bg-amber-50 px-1 py-0.5 font-medium text-amber-700">待 {row.pending}</span>
                        </div>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${orgSort === 'adopted' || orgSort === 'firstCount' ? 'bg-emerald-50/40' : ''}`}>
                        <div>
                          <strong className="font-bold text-[#08B889] text-xs">{row.adopted.toLocaleString()}</strong>
                          <span className="ml-0.5 text-[10px] text-slate-400">件</span>
                        </div>
                        <div className="mt-1 flex items-center justify-center gap-1 text-[10px]">
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-semibold text-[#08B889]">首发 {row.firstCount.toLocaleString()}</span>
                          <span className="rounded bg-blue-50 px-1.5 py-0.5 font-semibold text-[#2F74FF]">重复 {row.repeatCount.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${orgSort === 'directRate' ? 'bg-emerald-50/40' : ''}`}>
                        <span className="inline-flex items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                          {row.directRate}%
                        </span>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${orgSort === 'passRate' ? 'bg-blue-50/40' : ''}`}>
                        <span className="inline-flex items-center justify-center rounded-lg border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-bold text-[#2F74FF]">
                          {row.passRate}%
                        </span>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${orgSort === 'avgTime' ? 'bg-purple-50/40' : ''}`}>
                        <span className="inline-flex items-center justify-center rounded-lg border border-purple-100 bg-purple-50 px-2 py-0.5 text-xs font-bold text-[#8656F4]">
                          {row.avgTime} 分钟
                        </span>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${orgSort === 'perCapita' ? 'bg-blue-50/40' : ''}`}>
                        <strong className="text-slate-800 text-xs">{row.perCapita}</strong>
                        <span className="text-[10px] text-slate-400 ml-0.5">件/人</span>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${orgSort === 'closedRate' ? 'bg-teal-50/40' : ''}`}>
                        <span className="inline-flex items-center justify-center rounded-lg border border-teal-100 bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-700">
                          {row.closedRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* 全域人员考核指标 */}
          <section className={sectionClass}>
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-white shadow-xs ${
                    perspective === 'report' ? 'bg-[#1B5BD6]' : 'bg-[#08B889]'
                  }`}
                >
                  <Target className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-bold text-slate-800">
                  {orgFilter ? '机构' : '全域'}
                  {perspective === 'report' ? '上报员' : '审核员'}考核指标
                </h2>
                <span className="rounded-xl bg-[#EBF3FF] px-3 py-1 text-xs font-semibold text-[#1D58C9]">
                  {scopeLabel} · {perspective === 'report' ? reporterStats.count : auditorStats.count} 名
                  {perspective === 'report' ? '上报员' : '审核员'}
                </span>
              </div>

              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
                <button
                  type="button"
                  onClick={() => setPerspective('report')}
                  className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition-all ${
                    perspective === 'report' ? 'bg-[#1B5BD6] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Send className="h-3.5 w-3.5 -rotate-12" />
                  上报员
                </button>
                <button
                  type="button"
                  onClick={() => setPerspective('audit')}
                  className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition-all ${
                    perspective === 'audit' ? 'bg-[#08B889] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  审核员
                </button>
              </div>
            </div>

            {perspective === 'report' ? (
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-6 lg:[&>*]:col-span-2 lg:[&>*:nth-child(n+4)]:col-span-3 xl:grid-cols-5 xl:[&>*]:col-span-1 xl:[&>*:nth-child(n+4)]:col-span-1">
                <GlobalKpiCard
                  title="参评上报员"
                  icon={<UsersRound className="h-4 w-4" />}
                  color="#1D58C9"
                  badge={`覆盖 ${reporterStats.orgCount} 家机构`}
                  badgeBg="#EBF3FF"
                  badgeColor="#1D58C9"
                  value={String(reporterStats.count)}
                  unit="人"
                  subDetail={<span className="font-mono text-slate-500">报送 {reporterStats.total.toLocaleString()} 件</span>}
                  footerLeft={`人均采纳 ${reporterStats.perCapita} 件`}
                  footerRight={`人均报送 ${reporterStats.count ? round1(reporterStats.total / reporterStats.count) : 0} 件`}
                  footerRightColor="#D97706"
                />
                <GlobalKpiCard
                  title="累计采纳数"
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  color="#08B889"
                  badge={`采纳率 ${reporterStats.passRate}%`}
                  badgeBg="#EDFAF5"
                  badgeColor="#08B889"
                  value={reporterStats.adopted.toLocaleString()}
                  unit="件"
                  subDetail={
                    <div>
                      <span className="font-medium text-[#08B889]">首发 {reporterStats.first.toLocaleString()}</span>
                      <span className="mx-1 text-slate-300">/</span>
                      <span className="font-medium text-[#2F74FF]">重复 {reporterStats.repeat.toLocaleString()}</span>
                    </div>
                  }
                  footerLeft="首发占比"
                  footerRight={`${reporterStats.adopted ? round1((reporterStats.first / reporterStats.adopted) * 100) : 0}%`}
                />
                <GlobalKpiCard
                  title="一次性通过率"
                  icon={<Zap className="h-4 w-4" />}
                  color="#08B889"
                  badge="质效核心"
                  badgeBg="#EDFAF5"
                  badgeColor="#08B889"
                  value={`${reporterStats.directRate}%`}
                  subDetail={
                    <span className="font-mono text-xs text-slate-500">
                      通过 {reporterStats.direct.toLocaleString()} / {reporterStats.total.toLocaleString()} 件
                    </span>
                  }
                  footerLeft="按报送件数加权"
                  footerRight="全员平均"
                />
                <GlobalKpiCard
                  title="整体通过率"
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  color="#2F74FF"
                  badge="含修改后通过"
                  badgeBg="#EBF3FF"
                  badgeColor="#2F74FF"
                  value={`${reporterStats.passRate}%`}
                  subDetail={
                    <span className="font-mono text-xs text-slate-500">
                      通过 {reporterStats.adopted.toLocaleString()} / {reporterStats.total.toLocaleString()} 件
                    </span>
                  }
                  footerLeft="按报送件数加权"
                  footerRight="全员平均"
                />
                <GlobalKpiCard
                  title="平均得分"
                  icon={<Trophy className="h-4 w-4" />}
                  color="#ED7B11"
                  badge="单条均分"
                  badgeBg="#FFF7EB"
                  badgeColor="#ED7B11"
                  value={String(reporterStats.avgScore)}
                  unit="分"
                  subDetail={
                    reporterStats.best && (
                      <span className="rounded bg-[#FFF4E5] px-2 py-0.5 text-[11px] font-medium text-[#ED7B11]">
                        最高 {reporterStats.best.avgScore}分 ({reporterStats.best.name})
                      </span>
                    )
                  }
                  footerLeft="全员单条均分"
                  footerRight="全员平均"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                <GlobalKpiCard
                  title="参评审核员"
                  icon={<UsersRound className="h-4 w-4" />}
                  color="#08B889"
                  badge={`覆盖 ${auditorStats.orgCount} 家机构`}
                  badgeBg="#EDFAF5"
                  badgeColor="#08B889"
                  value={String(auditorStats.count)}
                  unit="人"
                  subDetail={<span className="font-mono text-slate-500">待审 {auditorStats.reported.toLocaleString()} 件</span>}
                  footerLeft={`人均审核 ${auditorStats.perCapita} 件`}
                  footerRight={`未办 ${Math.max(auditorStats.reported - auditorStats.audited, 0).toLocaleString()} 件`}
                  footerRightColor="#D97706"
                />
                <GlobalKpiCard
                  title="累计审核量"
                  icon={<ShieldCheck className="h-4 w-4" />}
                  color="#1D58C9"
                  badge="已采纳"
                  badgeBg="#EBF3FF"
                  badgeColor="#1D58C9"
                  value={auditorStats.audited.toLocaleString()}
                  unit="件"
                  subDetail={
                    <div>
                      <span className="font-medium text-[#08B889]">通过 {auditorStats.passed.toLocaleString()}</span>
                      <span className="mx-1 text-slate-300">/</span>
                      <span className="font-medium text-[#E11D48]">驳回 {auditorStats.rejected.toLocaleString()}</span>
                    </div>
                  }
                  footerLeft="驳回占比"
                  footerRight={`${auditorStats.audited ? round1((auditorStats.rejected / auditorStats.audited) * 100) : 0}%`}
                  footerRightColor="#E11D48"
                />
                <GlobalKpiCard
                  title="审核处理率"
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  color="#08B889"
                  badge="办结效率"
                  badgeBg="#EDFAF5"
                  badgeColor="#08B889"
                  value={`${auditorStats.processRate}%`}
                  subDetail={
                    <span className="font-mono text-xs text-slate-500">
                      已办 {auditorStats.audited.toLocaleString()} / {auditorStats.reported.toLocaleString()} 件
                    </span>
                  }
                  footerLeft="按待审件数加权"
                  footerRight="全员平均"
                />
                <GlobalKpiCard
                  title="平均审核响应"
                  icon={<Clock className="h-4 w-4" />}
                  color="#8656F4"
                  badge="流转时效"
                  badgeBg="#F9F2FF"
                  badgeColor="#8656F4"
                  value={String(auditorStats.avgResponse)}
                  unit="分钟"
                  subDetail={
                    auditorStats.fastest && (
                      <span className="rounded bg-[#F6EDFF] px-2 py-0.5 text-[11px] font-medium text-[#8656F4]">
                        最快 {auditorStats.fastest.avgResponseMin}分 ({auditorStats.fastest.name})
                      </span>
                    )
                  }
                  footerLeft="派发至审核完成"
                  footerRight="全员平均"
                />
              </div>
            )}
          </section>

          {/* 人员考核榜 */}
          <section className={sectionClass}>
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <BarChart3 className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  全域{perspective === 'report' ? '上报员' : '审核员'}考核榜
                </h2>
                {orgFilter && (
                  <button
                    type="button"
                    onClick={() => setOrgFilter('')}
                    className="inline-flex items-center gap-1 rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-100"
                    title="清除机构筛选"
                  >
                    {orgFilter} ×
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="搜索姓名"
                    className="min-h-8 w-40 rounded-xl border border-slate-200 bg-white pl-8 pr-2.5 text-xs text-slate-700 outline-none shadow-xs focus:border-[#1D58C9]"
                  />
                </div>
                <span className="text-xs text-slate-500 font-medium">排序维度:</span>
                {perspective === 'report' ? (
                  <select
                    aria-label="上报员排名排序"
                    value={reporterSort}
                    onChange={(e) => setReporterSort(e.target.value)}
                    className="min-h-8 cursor-pointer rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none shadow-xs hover:border-slate-300 focus:border-[#1D58C9] transition"
                  >
                    <option value="score">按综合得分排名</option>
                    <option value="adopted">按采纳数排名</option>
                    <option value="firstCount">按首发数排名</option>
                    <option value="directRate">按一次性通过率排名</option>
                    <option value="passRate">按整体通过率排名</option>
                    <option value="avgScore">按平均得分排名</option>
                  </select>
                ) : (
                  <select
                    aria-label="审核员排名排序"
                    value={auditorSort}
                    onChange={(e) => setAuditorSort(e.target.value)}
                    className="min-h-8 cursor-pointer rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none shadow-xs hover:border-slate-300 focus:border-[#1D58C9] transition"
                  >
                    <option value="audited">按累计审核数排名</option>
                    <option value="rate">按审核处理率排名</option>
                    <option value="time">按平均响应时长 (最快)</option>
                  </select>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              {perspective === 'report' ? (
                <table className="w-full min-w-[1080px] text-left text-xs">
                  <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="w-24 px-3 py-3.5 text-center font-semibold">全域排名</th>
                      <th className="px-3 py-3.5 font-semibold">上报员 / 所属机构</th>
                      <th className="px-3 py-3.5 text-center font-semibold">累计采纳数 (首发/重复)</th>
                      <th className="px-3 py-3.5 text-center font-semibold">一次性通过率 (通过/总件数)</th>
                      <th className="px-3 py-3.5 text-center font-semibold">整体通过率 (通过/总件数)</th>
                      <th className="px-3 py-3.5 text-center font-semibold">综合得分</th>
                      <th className="px-3 py-3.5 text-center font-semibold">平均得分</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedReporters.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">没有符合条件的上报员</td>
                      </tr>
                    ) : (
                      pagedReporters.map((row) => (
                        <tr key={row.id} onClick={() => openReporterProfile(row)} className="cursor-pointer transition hover:bg-blue-50/40">
                          <td className="px-3 py-3.5 text-center">
                            <div className="flex flex-col items-center">
                              <RankBadge rank={row.rank} />
                              <span className={`mt-1 text-[10px] font-medium ${rankChangeClass(row.rankChange)}`}>{row.rankChange}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900">{row.name}</span>
                              {row.rank === 1 && (
                                <span className="rounded bg-[#FFF4E5] px-1.5 py-0.5 text-[10px] font-semibold text-[#ED7B11]">领跑者</span>
                              )}
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-400">{row.org}</div>
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <div className="font-mono text-xs font-bold text-[#08B889]">{row.adoptedCount} 件</div>
                            <div className="mt-0.5 text-[11px]">
                              <span className="font-medium text-[#08B889]">首发 {row.firstCount}</span>
                              <span className="mx-1 text-slate-300">/</span>
                              <span className="font-medium text-[#2F74FF]">重复 {row.repeatCount}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <div className="font-mono text-xs font-bold text-[#08B889]">{row.directRate}%</div>
                            <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                              通过 {row.directCount}/{row.total} 件
                            </div>
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <div className="font-mono text-xs font-bold text-[#2F74FF]">{row.passRate}%</div>
                            <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                              通过 {row.adoptedCount}/{row.total} 件
                            </div>
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <div className="font-mono text-xs font-bold text-[#ED7B11]">{row.score.toLocaleString()} 分</div>
                            <div className="mt-0.5 text-[11px] text-slate-400">累加得分</div>
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <div className="font-mono text-xs font-bold text-[#8C3BE0]">{row.avgScore} 分</div>
                            <div className="mt-0.5 text-[11px] text-slate-400">每条均分</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full min-w-[1000px] text-left text-xs">
                  <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="w-24 px-3 py-3.5 text-center font-semibold">全域排名</th>
                      <th className="px-3 py-3.5 font-semibold">审核员 / 所属机构</th>
                      <th className="px-3 py-3.5 text-center font-semibold">累计审核数 (通过/驳回)</th>
                      <th className="px-3 py-3.5 text-center font-semibold">审核处理率 (已办/待审)</th>
                      <th className="px-3 py-3.5 text-center font-semibold">平均审核响应时长</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedAuditors.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">没有符合条件的审核员</td>
                      </tr>
                    ) : (
                      pagedAuditors.map((row) => (
                        <tr key={row.id} onClick={() => openAuditorProfile(row)} className="cursor-pointer transition hover:bg-emerald-50/30">
                          <td className="px-3 py-3.5 text-center">
                            <div className="flex flex-col items-center">
                              <RankBadge rank={row.rank} />
                              <span className={`mt-1 text-[10px] font-medium ${rankChangeClass(row.rankChange)}`}>{row.rankChange}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="text-xs font-bold text-slate-900">{row.name}</div>
                            <div className="mt-0.5 text-[11px] text-slate-400">{row.org}</div>
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <div className="font-mono text-xs font-bold text-slate-800">{row.totalAudited} 件</div>
                            <div className="mt-0.5 text-[11px]">
                              <span className="font-medium text-[#08B889]">通过 {row.passedCount}</span>
                              <span className="mx-1 text-slate-300">/</span>
                              <span className="font-medium text-[#E11D48]">驳回 {row.rejectedCount}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <div className="font-mono text-xs font-bold text-[#08B889]">{row.auditProcessRate}%</div>
                            <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                              已办 {row.totalAudited} / 待审 {row.reportedCount} 件
                            </div>
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <div className="font-mono text-xs font-bold text-[#8C3BE0]">{row.avgResponseMin} 分钟</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="-mx-5 -mb-5 border-t border-slate-100">
              <PaginationBar
                total={personTotal}
                page={personPage}
                pageSize={personPageSize}
                onPageChange={setPersonPage}
                onPageSizeChange={(size) => {
                  setPersonPageSize(size);
                  setPersonPage(1);
                }}
              />
            </div>
          </section>
        </>
      )}

      <EvaluationProfileModal
        data={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        periodText={`${startDate} - ${endDate}`}
      />
    </div>
  );
};
