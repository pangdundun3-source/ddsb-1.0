import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  FileText,
  Globe2,
  RefreshCcw,
  Send,
  ShieldCheck,
  Target,
  Trophy,
  UserRound,
  UsersRound,
  Zap,
} from 'lucide-react';
import { EvaluationProfileModal, ProfileDetailData } from '../components/EvaluationProfileModal';
import { PaginationBar } from '../components/PaginationBar';
import { DateRangeField } from '../components/DateRangeField';
import { OrgFilterSelect } from '../components/OrgFilterSelect';
import {
  INITIAL_ORG_NODES,
  matchOrganizationByFilter,
} from '../data/userOrgShared';
import { PageId } from '../types';

interface EvaluationReferenceProps {
  onNavigate?: (page: PageId) => void;
}

type EvalTab = 'org' | 'group' | 'person';
type Period = 'day' | 'week' | 'month' | 'quarter' | 'year';

const EVAL_MAX_DATE = '2026-11-09';

/** 考核周期：按日默认近 7 日；周/月/季/年默认当前周期（结束日不超过锚定日） */
const PERIOD_DEFAULTS: Record<Period, { start: string; end: string }> = {
  day: { start: '2026-11-03', end: '2026-11-09' }, // 近 7 日
  week: { start: '2026-11-09', end: '2026-11-09' }, // 本周（周一为锚定日）
  month: { start: '2026-11-01', end: '2026-11-09' }, // 本月
  quarter: { start: '2026-10-01', end: '2026-11-09' }, // 本季度（Q4）
  year: { start: '2026-01-01', end: '2026-11-09' }, // 本年
};
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
  otherCount: number;
  rejected: number;
  auditing: number;
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
  group: string;
  total: number;
  adoptedCount: number;
  firstCount: number;
  repeatCount: number;
  otherCount: number;
  directCount: number;
  directRate: number;
  passRate: number;
  score: number;
  avgScore: number;
  grade: Grade;
}

interface AuditorRow {
  id: string;
  name: string;
  org: string;
  group: string;
  totalAudited: number;
  reportedCount: number;
  passedCount: number;
  rejectedCount: number;
  auditProcessRate: number;
  avgResponseMin: number;
  avgScore: number;
  grade: Grade;
}

type Ranked<T> = T & { rank: number };

/** 将累计采纳量拆成 重复 / 首发 / 其他（合计等于采纳量） */
const splitAdoptBreakdown = (adopted: number, firstHint: number, repeatHint: number) => {
  const otherCount = Math.max(0, Math.round(adopted * 0.08));
  const remain = Math.max(0, adopted - otherCount);
  const hintTotal = Math.max(firstHint + repeatHint, 1);
  const firstCount = Math.round((remain * firstHint) / hintTotal);
  const repeatCount = remain - firstCount;
  return { firstCount, repeatCount, otherCount };
};

const withAdoptBreakdown = <T extends { adopted: number; firstCount: number; repeatCount: number }>(
  rows: T[],
): Array<T & { otherCount: number }> =>
  rows.map((row) => ({
    ...row,
    ...splitAdoptBreakdown(row.adopted, row.firstCount, row.repeatCount),
  }));

const orgRecords: OrgRecord[] = withAdoptBreakdown([
  { rank: 1, name: '中共台中市委宣传部', type: '市级党政主体', staff: 45, reporters: 32, auditors: 13, total: 1580, adopted: 1520, firstCount: 1180, repeatCount: 340, rejected: 35, auditing: 10, pending: 15, directRate: 88.6, passRate: 96.2, avgTime: 6.8, perCapita: 35.1, closedRate: 100, score: 98.5, grade: '卓越', isMine: true },
  { rank: 2, name: '台中市网信办', type: '网安指挥主管', staff: 38, reporters: 26, auditors: 12, total: 1350, adopted: 1280, firstCount: 990, repeatCount: 290, rejected: 42, auditing: 12, pending: 16, directRate: 86.4, passRate: 94.8, avgTime: 8.5, perCapita: 35.5, closedRate: 98.5, score: 95.8, grade: '卓越' },
  { rank: 3, name: '西屯区网信办', type: '区县直属单位', staff: 40, reporters: 28, auditors: 12, total: 1120, adopted: 1030, firstCount: 780, repeatCount: 250, rejected: 58, auditing: 14, pending: 18, directRate: 82.5, passRate: 92, avgTime: 10.8, perCapita: 28, closedRate: 97.8, score: 93.2, grade: '优秀' },
  { rank: 4, name: '台中市大数据中心', type: '独立直属单位', staff: 40, reporters: 29, auditors: 11, total: 980, adopted: 890, firstCount: 660, repeatCount: 230, rejected: 60, auditing: 12, pending: 18, directRate: 81, passRate: 90.8, avgTime: 12.2, perCapita: 24.5, closedRate: 96, score: 91.5, grade: '优秀' },
  { rank: 5, name: '东湖区委宣传部', type: '区县直属单位', staff: 38, reporters: 28, auditors: 10, total: 850, adopted: 750, firstCount: 560, repeatCount: 190, rejected: 65, auditing: 15, pending: 20, directRate: 77.8, passRate: 88.2, avgTime: 14.5, perCapita: 22.4, closedRate: 95, score: 89.4, grade: '良好' },
  { rank: 6, name: '北屯区宣传部', type: '区县直属单位', staff: 35, reporters: 25, auditors: 10, total: 720, adopted: 630, firstCount: 460, repeatCount: 170, rejected: 55, auditing: 14, pending: 21, directRate: 75, passRate: 87.5, avgTime: 15, perCapita: 20.6, closedRate: 94.2, score: 87.8, grade: '良好' },
  { rank: 7, name: '南屯区网信办', type: '区县直属单位', staff: 34, reporters: 24, auditors: 10, total: 680, adopted: 590, firstCount: 430, repeatCount: 160, rejected: 52, auditing: 16, pending: 22, directRate: 74.2, passRate: 86.8, avgTime: 15.5, perCapita: 20, closedRate: 93.5, score: 86.9, grade: '合格' },
  { rank: 8, name: '高新区管委会', type: '独立直属单位', staff: 30, reporters: 22, auditors: 8, total: 590, adopted: 510, firstCount: 380, repeatCount: 130, rejected: 48, auditing: 13, pending: 19, directRate: 73, passRate: 86.4, avgTime: 16, perCapita: 19.6, closedRate: 92, score: 85.7, grade: '合格' },
  { rank: 9, name: '市公安局网安支队', type: '市级党政主体', staff: 28, reporters: 20, auditors: 8, total: 562, adopted: 490, firstCount: 370, repeatCount: 120, rejected: 44, auditing: 11, pending: 17, directRate: 74.5, passRate: 87.2, avgTime: 13.8, perCapita: 20.1, closedRate: 97, score: 86.2, grade: '合格' },
  { rank: 10, name: '经开区网信办', type: '区县直属单位', staff: 26, reporters: 19, auditors: 7, total: 485, adopted: 420, firstCount: 310, repeatCount: 110, rejected: 40, auditing: 10, pending: 15, directRate: 72.1, passRate: 86.6, avgTime: 16.2, perCapita: 18.6, closedRate: 91.5, score: 85, grade: '合格' },
  { rank: 11, name: '市发改委政研室', type: '市级党政主体', staff: 24, reporters: 18, auditors: 6, total: 430, adopted: 375, firstCount: 280, repeatCount: 95, rejected: 35, auditing: 8, pending: 12, directRate: 71.8, passRate: 87.2, avgTime: 14.2, perCapita: 17.9, closedRate: 95, score: 84.6, grade: '合格' },
  { rank: 12, name: '新城区委网信办', type: '区县直属单位', staff: 22, reporters: 16, auditors: 6, total: 390, adopted: 335, firstCount: 250, repeatCount: 85, rejected: 32, auditing: 9, pending: 14, directRate: 70.5, passRate: 85.9, avgTime: 17, perCapita: 17.7, closedRate: 90, score: 83.5, grade: '合格' },
]);

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

/** 群组考核榜：结构与组织节点考核对齐，便于复用指标与排行展示 */
const groupRecords: OrgRecord[] = withAdoptBreakdown([
  { rank: 1, name: '突发舆情应急响应专班', type: '应急专班', staff: 42, reporters: 30, auditors: 12, total: 1860, adopted: 1688, firstCount: 1280, repeatCount: 408, rejected: 98, auditing: 30, pending: 44, directRate: 82.6, passRate: 90.8, avgTime: 11.4, perCapita: 44.3, closedRate: 98.6, score: 91.2, grade: '卓越' },
  { rank: 2, name: '区县宣传舆情快报群', type: '区县联络群', staff: 86, reporters: 68, auditors: 18, total: 2420, adopted: 2145, firstCount: 1620, repeatCount: 525, rejected: 165, auditing: 45, pending: 65, directRate: 79.8, passRate: 88.6, avgTime: 13.2, perCapita: 28.1, closedRate: 97.9, score: 87.8, grade: '优秀' },
  { rank: 3, name: '重点网络安全联络员组', type: '专项联络组', staff: 38, reporters: 26, auditors: 12, total: 1520, adopted: 1398, firstCount: 1080, repeatCount: 318, rejected: 72, auditing: 20, pending: 30, directRate: 84.2, passRate: 92.0, avgTime: 12.1, perCapita: 40.0, closedRate: 98.2, score: 90.4, grade: '卓越' },
  { rank: 4, name: '融媒联合宣发协同群', type: '宣发协同群', staff: 54, reporters: 40, auditors: 14, total: 1280, adopted: 1164, firstCount: 860, repeatCount: 304, rejected: 70, auditing: 18, pending: 28, directRate: 80.5, passRate: 90.9, avgTime: 12.8, perCapita: 23.7, closedRate: 97.4, score: 89.6, grade: '优秀' },
  { rank: 5, name: '政务民生热点导控专班', type: '应急专班', staff: 47, reporters: 34, auditors: 13, total: 1180, adopted: 1042, firstCount: 760, repeatCount: 282, rejected: 88, auditing: 20, pending: 30, directRate: 76.8, passRate: 88.3, avgTime: 14.6, perCapita: 25.1, closedRate: 96.8, score: 86.9, grade: '良好' },
  { rank: 6, name: '节假日24小时值守专班', type: '值守专班', staff: 28, reporters: 18, auditors: 10, total: 860, adopted: 792, firstCount: 610, repeatCount: 182, rejected: 38, auditing: 12, pending: 18, directRate: 85.1, passRate: 92.1, avgTime: 9.8, perCapita: 30.7, closedRate: 99.1, score: 91.8, grade: '卓越' },
  { rank: 7, name: '西坝区环保舆情联动组', type: '区县联络群', staff: 22, reporters: 16, auditors: 6, total: 640, adopted: 568, firstCount: 420, repeatCount: 148, rejected: 42, auditing: 12, pending: 18, directRate: 74.5, passRate: 88.8, avgTime: 15.2, perCapita: 29.1, closedRate: 96.2, score: 85.4, grade: '良好' },
  { rank: 8, name: '河长制速报联络群', type: '专项联络组', staff: 18, reporters: 13, auditors: 5, total: 420, adopted: 378, firstCount: 280, repeatCount: 98, rejected: 26, auditing: 6, pending: 10, directRate: 78.2, passRate: 90.0, avgTime: 14.0, perCapita: 23.3, closedRate: 97.1, score: 86.2, grade: '良好' },
  { rank: 9, name: '西坝夜间值班备勤组', type: '值守专班', staff: 16, reporters: 11, auditors: 5, total: 300, adopted: 255, firstCount: 180, repeatCount: 75, rejected: 28, auditing: 7, pending: 10, directRate: 71.0, passRate: 85.0, avgTime: 16.5, perCapita: 18.8, closedRate: 95.4, score: 84.1, grade: '合格' },
]);

const groupParticipationCounts: Record<string, number> = {
  '突发舆情应急响应专班': 40,
  '区县宣传舆情快报群': 78,
  '重点网络安全联络员组': 36,
  '融媒联合宣发协同群': 50,
  '政务民生热点导控专班': 43,
  '节假日24小时值守专班': 27,
  '西坝区环保舆情联动组': 20,
  '河长制速报联络群': 16,
  '西坝夜间值班备勤组': 14,
};

const EVAL_PERIOD_DAYS = 30;
const getParticipationCount = (record: OrgRecord) =>
  orgParticipationCounts[record.name] ??
  groupParticipationCounts[record.name] ??
  Math.max(record.reporters, record.auditors);
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
const getDailyAvg = (record: OrgRecord) => round1(record.total / EVAL_PERIOD_DAYS);
const getProcessRate = (record: OrgRecord) =>
  round1(((record.adopted + record.rejected) / Math.max(record.total, 1)) * 100);
/** 转办总量约占总报送 15%，办结数按闭环率反推 */
const getTransferCounts = (record: OrgRecord) => {
  const transferTotal = Math.max(1, Math.round(record.total * 0.15));
  const closedCount = Math.round((transferTotal * record.closedRate) / 100);
  return { transferTotal, closedCount };
};

const gradeForScore = (score: number): Grade =>
  score >= 95 ? '卓越' : score >= 92 ? '优秀' : score >= 88 ? '良好' : '合格';

const escapeCsvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

const downloadCsv = (filename: string, headers: string[], rows: Array<Array<string | number>>) => {
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const formatExportDate = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
};

/** 人员考核挂靠组织树节点，便于组织节点层级下钻筛选 */
const PERSON_ORG_POOL = INITIAL_ORG_NODES.map((node) => node.name);

const reporterRecords: ReporterRow[] = orgRecords.flatMap((org, i) =>
  Array.from({ length: REPORTERS_PER_ORG }, (_, j) => {
    const k = i * REPORTERS_PER_ORG + j;
    const r = seeded(k + 1);
    const total = Math.max(10, Math.round(48 - i * 2.2 - j * 6 + r * 8));
    const directRate = round1(Math.min(96, 88 - i * 1.2 - j * 3 + r * 4));
    const passRate = round1(Math.min(99, directRate + 6 + r * 3));
    const directCount = Math.round((total * directRate) / 100);
    const adoptedCount = Math.round((total * passRate) / 100);
    const { firstCount, repeatCount, otherCount } = splitAdoptBreakdown(
      adoptedCount,
      Math.round(adoptedCount * 0.76),
      Math.round(adoptedCount * 0.24),
    );
    const avgScore = round1(97 - i * 0.6 - j * 1.5 - r * 2);
    return {
      id: `reporter-${k}`,
      name: REPORTER_NAMES[k],
      org: PERSON_ORG_POOL[k % PERSON_ORG_POOL.length] || org.name,
      group: groupRecords[Math.floor(seeded(k + 31) * groupRecords.length)].name,
      total,
      adoptedCount,
      firstCount,
      repeatCount,
      otherCount,
      directCount,
      directRate,
      passRate,
      score: round1(adoptedCount * avgScore),
      avgScore,
      grade: gradeForScore(avgScore),
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
      org: PERSON_ORG_POOL[k % PERSON_ORG_POOL.length] || org.name,
      group: groupRecords[Math.floor(seeded(k + 131) * groupRecords.length)].name,
      totalAudited,
      reportedCount,
      passedCount: totalAudited - rejectedCount,
      rejectedCount,
      auditProcessRate: round1((totalAudited / reportedCount) * 100),
      avgResponseMin: round1(6.5 + i * 0.7 + j * 1.8 + r * 2),
      avgScore,
      grade: gradeForScore(avgScore),
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

interface GlobalKpiCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  value: string;
  unit?: string;
  hint?: string;
}

const GlobalKpiCard: React.FC<GlobalKpiCardProps> = ({ title, icon, color, value, unit, hint }) => (
  <div className="flex min-h-[96px] flex-col justify-between rounded-xl border border-slate-200/90 bg-white px-3.5 py-3 shadow-2xs transition hover:border-slate-300 hover:shadow-xs">
    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
      <span style={{ color }}>{icon}</span>
      {title}
    </span>
    <div className="mt-2 flex items-baseline gap-1">
      <strong className="font-mono text-[26px] font-bold leading-none tracking-tight" style={{ color }}>
        {value}
      </strong>
      {unit && <span className="text-xs text-slate-400">{unit}</span>}
    </div>
    {hint ? <p className="mt-2 truncate text-[11px] text-slate-400">{hint}</p> : <span className="mt-2 h-[15px]" />}
  </div>
);

const MultiFilterSelect: React.FC<{
  ariaLabel: string;
  placeholder: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}> = ({ ariaLabel, placeholder, options, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const summary =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? selected[0]
        : `已选 ${selected.length} 项`;

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        title={selected.length ? selected.join('、') : placeholder}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex min-h-8 max-w-[12rem] cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none shadow-xs transition hover:border-slate-300 focus:border-[#1D58C9]"
      >
        <span className={`truncate ${selected.length ? 'text-slate-700' : 'text-slate-500'}`}>{summary}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-56 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          <button
            type="button"
            onClick={() => onChange([])}
            className={`mb-0.5 flex w-full cursor-pointer items-center rounded-lg px-2.5 py-1.5 text-left text-xs ${
              selected.length === 0 ? 'bg-blue-50 font-semibold text-[#1D58C9]' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {placeholder}
          </button>
          {options.map((option) => {
            const checked = selected.includes(option);
            return (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
                  checked ? 'bg-blue-50 text-[#1D58C9]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(option)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-[#1D58C9] focus:ring-[#1D58C9]"
                />
                <span className="truncate">{option}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

const readEvalHash = (): { tab: EvalTab; perspective: Perspective } => {
  const query = window.location.hash.split('?')[1] || '';
  const params = new URLSearchParams(query);
  const tabParam = params.get('tab');
  // 群组考核本期暂缓：deep link 到 tab=group 时回落到组织节点考核
  const tab: EvalTab = tabParam === 'person' ? 'person' : 'org';
  return {
    tab,
    perspective: params.get('role') === 'auditor' ? 'audit' : 'report',
  };
};

const buildEvalHash = (tab: EvalTab, perspective: Perspective) => {
  if (tab === 'person') {
    return `#/evaluation?tab=person&role=${perspective === 'audit' ? 'auditor' : 'reporter'}`;
  }
  if (tab === 'group') return '#/evaluation?tab=group';
  return '#/evaluation?tab=org';
};

const sectionClass = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-4';

export const EvaluationReference: React.FC<EvaluationReferenceProps> = () => {
  const [tab, setTab] = useState<EvalTab>(() => readEvalHash().tab);
  const [perspective, setPerspective] = useState<Perspective>(() => readEvalHash().perspective);
  const [period, setPeriod] = useState<Period>('day');
  const [startDate, setStartDate] = useState(PERIOD_DEFAULTS.day.start.replaceAll('-', '/'));
  const [endDate, setEndDate] = useState(PERIOD_DEFAULTS.day.end.replaceAll('-', '/'));
  const [personOrgFilter, setPersonOrgFilter] = useState<string | null>(null);
  const [personGroupFilter, setPersonGroupFilter] = useState<string[]>([]);
  const [personPage, setPersonPage] = useState(1);
  const [personPageSize, setPersonPageSize] = useState(10);
  const [orgSort, setOrgSort] = useState<string>('total');
  const [groupSort, setGroupSort] = useState<string>('total');
  const [reporterSort, setReporterSort] = useState<string>('adopted');
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
  }, [perspective, personOrgFilter, personGroupFilter, reporterSort, auditorSort]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const resetFilters = () => {
    setPeriod('day');
    setStartDate(PERIOD_DEFAULTS.day.start.replaceAll('-', '/'));
    setEndDate(PERIOD_DEFAULTS.day.end.replaceAll('-', '/'));
    setPersonOrgFilter(null);
    setPersonGroupFilter([]);
    setReporterSort('adopted');
    setAuditorSort('audited');
    setOrgSort('total');
    setGroupSort('total');
    showToast('筛选条件已重置');
  };

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
    const next = PERIOD_DEFAULTS[p];
    setStartDate(next.start.replaceAll('-', '/'));
    setEndDate(next.end.replaceAll('-', '/'));
  };

  const sortOrgLikeRecords = (list: OrgRecord[], sortKey: string) => {
    const next = [...list];
    const byDesc = (get: (row: OrgRecord) => number) => next.sort((a, b) => get(b) - get(a));
    if (sortKey === 'total') byDesc((r) => r.total);
    else if (sortKey === 'adopted') byDesc((r) => r.adopted);
    else if (sortKey === 'firstCount') byDesc((r) => r.firstCount);
    else if (sortKey === 'directRate') byDesc((r) => r.directRate);
    else if (sortKey === 'passRate') byDesc((r) => r.passRate);
    else if (sortKey === 'avgTime') next.sort((a, b) => a.avgTime - b.avgTime);
    else if (sortKey === 'perCapita') byDesc((r) => r.perCapita);
    else if (sortKey === 'closedRate') byDesc((r) => r.closedRate);
    else if (sortKey === 'participation') byDesc((r) => Number(getParticipationRate(r)));
    else next.sort((a, b) => a.rank - b.rank);
    return next;
  };

  const sortedOrgs = useMemo(() => sortOrgLikeRecords(orgRecords, orgSort), [orgSort]);

  const sortedGroups = useMemo(() => sortOrgLikeRecords(groupRecords, groupSort), [groupSort]);

  const matchesPerson = (row: { org: string; group: string }) =>
    matchOrganizationByFilter(row.org, personOrgFilter, INITIAL_ORG_NODES) &&
    (personGroupFilter.length === 0 || personGroupFilter.includes(row.group));

  const rankedReporters = useMemo<Ranked<ReporterRow>[]>(() => {
    const list = [...reporterRecords];
    const byDesc = (get: (row: ReporterRow) => number) => list.sort((a, b) => get(b) - get(a));
    if (reporterSort === 'total') byDesc((r) => r.total);
    else if (reporterSort === 'adopted') byDesc((r) => r.adoptedCount);
    else if (reporterSort === 'firstCount') byDesc((r) => r.firstCount);
    else if (reporterSort === 'directRate') byDesc((r) => r.directRate);
    else if (reporterSort === 'passRate') byDesc((r) => r.passRate);
    else if (reporterSort === 'avgScore') byDesc((r) => r.avgScore);
    else byDesc((r) => r.score);
    return list.map((row, index) => ({ ...row, rank: index + 1 }));
  }, [reporterSort]);

  const rankedAuditors = useMemo<Ranked<AuditorRow>[]>(() => {
    const list = [...auditorRecords];
    const byDesc = (get: (row: AuditorRow) => number) => list.sort((a, b) => get(b) - get(a));
    if (auditorSort === 'rate') byDesc((r) => r.auditProcessRate);
    else if (auditorSort === 'time') list.sort((a, b) => a.avgResponseMin - b.avgResponseMin);
    else byDesc((r) => r.totalAudited);
    return list.map((row, index) => ({ ...row, rank: index + 1 }));
  }, [auditorSort]);

  const visibleReporters = rankedReporters.filter(matchesPerson);
  const visibleAuditors = rankedAuditors.filter(matchesPerson);
  const personTotal = perspective === 'report' ? visibleReporters.length : visibleAuditors.length;
  const pageStart = (personPage - 1) * personPageSize;
  const pagedReporters = visibleReporters.slice(pageStart, pageStart + personPageSize);
  const pagedAuditors = visibleAuditors.slice(pageStart, pageStart + personPageSize);

  const openOrgLikeProfile = (row: OrgRecord, kind: 'org' | 'group') => {
    const isGroup = kind === 'group';
    setSelectedProfile({
      id: `${kind}-${row.rank}`,
      name: row.name,
      type: 'org',
      subTitle: row.type,
      rank: row.rank,
      totalScore: row.score,
      grade: row.grade,
      stats: [
        {
          label: isGroup ? '群组成员数' : '在册总人数',
          value: `${row.staff} 人`,
          subLabel: `上报 ${row.reporters} / 审核 ${row.auditors}`,
        },
        { label: '累计采纳量', value: `${row.adopted.toLocaleString()} 件`, subLabel: `重复 ${row.repeatCount.toLocaleString()} / 首发 ${row.firstCount.toLocaleString()} / 其他 ${row.otherCount.toLocaleString()}`, isHighlight: true },
        { label: '累计报送量', value: `${row.total.toLocaleString()} 件`, subLabel: `采纳 ${row.adopted.toLocaleString()} 件` },
        { label: '首审直通率', value: `${row.directRate}%`, isHighlight: true },
        { label: '平均审核耗时', value: `${row.avgTime} 分钟` },
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
        { category: '报送质量', item: '首审直通达标', points: '+28.0', desc: '首审直通率处于全域领先梯队' },
        { category: '报送贡献', item: '有效采纳加分', points: '+38.5', desc: '高质效完成周期内报送与采纳目标' },
        { category: '响应时效', item: '流转时效达标', points: '+22.0', desc: '平均审核流转响应耗时优于基准' },
        {
          category: '综合表现',
          item: isGroup ? '群组协同加分' : '组织协同加分',
          points: '+10.0',
          desc: isGroup ? '群组成员活跃度与协同闭环表现优异' : '人员在册活跃度与协同闭环表现优异',
        },
      ],
      summaryEvaluation: `${row.name} 本考核周期综合考核表现${row.grade === '卓越' || row.grade === '优秀' ? '突出' : '稳定'}，位居全域${isGroup ? '群组' : ''}第 ${row.rank} 名，建议继续保持高质效上报与高效闭环机制。`,
    });
  };

  const openOrgProfile = (row: OrgRecord) => openOrgLikeProfile(row, 'org');
  const openGroupProfile = (row: OrgRecord) => openOrgLikeProfile(row, 'group');

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
        { label: '累计报送量', value: `${row.total} 件`, subLabel: `日均 ${round1(row.total / EVAL_PERIOD_DAYS)} 件 · 采纳 ${row.adoptedCount} 件`, isHighlight: true },
        { label: '累计采纳量', value: `${row.adoptedCount} 件`, subLabel: `重复 ${row.repeatCount} / 首发 ${row.firstCount} / 其他 ${row.otherCount}`, isHighlight: true },
        { label: '首审直通率', value: `${row.directRate}%`, isHighlight: true },
        { label: '整体采纳率', value: `${row.passRate}%` },
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
        { category: '报送质量', item: '首审直通激励', points: '+25.0', desc: '首审直通率达到考核要求' },
        { category: '报送贡献', item: '有效采纳得分', points: '+40.0', desc: '完成周期内有效报送与采纳目标' },
        { category: '响应时效', item: '高效响应奖励', points: '+24.5', desc: '平均响应耗时优于考核基准' },
        { category: '综合表现', item: '综合绩效加分', points: '+9.0', desc: '人员活跃与业务闭环表现良好' },
      ],
      summaryEvaluation: `${row.name}（${row.org}）本考核周期考核等次为「${row.grade}」，全域报送考核排名第 ${row.rank} 名。`,
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
        { label: '累计处理', value: `${row.totalAudited} 次`, subLabel: `通过处理 ${row.passedCount} / 驳回处理 ${row.rejectedCount}`, isHighlight: true },
        { label: '审核处理率', value: `${row.auditProcessRate}%`, isHighlight: true },
        { label: '平均审核耗时', value: `${row.avgResponseMin} 分钟` },
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
      summaryEvaluation: `${row.name}（${row.org}）本考核周期考核等次为「${row.grade}」，全域审核考核排名第 ${row.rank} 名。`,
    });
  };

  const evalTabs: { id: EvalTab; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'org', label: '组织节点考核', desc: '按组织节点排行', icon: <Building2 className="h-4 w-4" /> },
    // 群组考核本期暂缓，入口隐藏，后期再加
    { id: 'person', label: '人员考核', desc: '报送考核与审核考核', icon: <UserRound className="h-4 w-4" /> },
  ];

  const activeTabMeta = evalTabs.find((item) => item.id === tab) ?? evalTabs[0];

  const handleExportData = () => {
    const stamp = formatExportDate();
    if (tab === 'org') {
      if (sortedOrgs.length === 0) {
        showToast('暂无可导出的组织节点数据');
        return;
      }
      const headers = [
        '排名',
        '组织节点名称',
        '参与人数',
        '在册人数',
        '参与率(%)',
        '累计报送量',
        '日均报送量',
        '人均报送量',
        '累计采纳量',
        '重复采纳量',
        '首发采纳量',
        '其他采纳量',
        '首审直通率(%)',
        '首审直通通过件数',
        '整体采纳率(%)',
        '平均审核耗时',
        '审核处理率(%)',
        '转办闭环率(%)',
        '办结件数',
        '转办件数',
        '综合得分',
      ];
      const rows = sortedOrgs.map((row, index) => {
        const directCount = Math.round((row.total * row.directRate) / 100);
        const { transferTotal, closedCount } = getTransferCounts(row);
        return [
          index + 1,
          row.name,
          getParticipationCount(row),
          row.staff,
          getParticipationRate(row),
          row.total,
          getDailyAvg(row),
          row.perCapita,
          row.adopted,
          row.repeatCount,
          row.firstCount,
          row.otherCount,
          row.directRate,
          directCount,
          row.passRate,
          `${row.avgTime} 分钟`,
          getProcessRate(row),
          row.closedRate,
          closedCount,
          transferTotal,
          row.score,
        ];
      });
      downloadCsv(`组织节点考核_${stamp}.csv`, headers, rows);
      showToast(`已导出组织节点考核数据（${sortedOrgs.length} 条）`);
      return;
    }

    if (perspective === 'report') {
      if (visibleReporters.length === 0) {
        showToast('暂无可导出的报送考核数据');
        return;
      }
      const headers = [
        '全域排名',
        '人员',
        '组织节点',
        '群组',
        '累计报送量',
        '日均报送量',
        '累计采纳量',
        '重复采纳量',
        '首发采纳量',
        '其他采纳量',
        '首审直通率(%)',
        '首审直通通过件数',
        '整体采纳率(%)',
        '整体采纳通过件数',
        '综合得分',
        '平均得分',
      ];
      const rows = visibleReporters.map((row) => [
        row.rank,
        row.name,
        row.org,
        row.group,
        row.total,
        round1(row.total / EVAL_PERIOD_DAYS),
        row.adoptedCount,
        row.repeatCount,
        row.firstCount,
        row.otherCount,
        row.directRate,
        row.directCount,
        row.passRate,
        row.adoptedCount,
        row.score,
        row.avgScore,
      ]);
      downloadCsv(`报送考核_${stamp}.csv`, headers, rows);
      showToast(`已导出报送考核数据（${visibleReporters.length} 条）`);
      return;
    }

    if (visibleAuditors.length === 0) {
      showToast('暂无可导出的审核考核数据');
      return;
    }
    const headers = [
      '全域排名',
      '人员',
      '组织节点',
      '群组',
      '累计处理',
      '通过处理',
      '驳回处理',
      '审核处理率',
      '已办',
      '待办',
      '平均审核耗时',
    ];
    const rows = visibleAuditors.map((row) => [
      row.rank,
      row.name,
      row.org,
      row.group,
      `${row.totalAudited} 次`,
      `${row.passedCount} 次`,
      `${row.rejectedCount} 次`,
      `${row.auditProcessRate}%`,
      `${row.totalAudited} 次`,
      `${Math.max(0, row.reportedCount - row.totalAudited)} 次`,
      `${row.avgResponseMin} 分钟`,
    ]);
    downloadCsv(`审核考核_${stamp}.csv`, headers, rows);
    showToast(`已导出审核考核数据（${visibleAuditors.length} 条）`);
  };

  const renderExportButton = () => (
    <button
      type="button"
      onClick={handleExportData}
      className="inline-flex min-h-8 items-center gap-1.5 rounded-xl bg-[#1D58C9] px-3.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
    >
      <Download className="h-3.5 w-3.5" />
      导出数据
    </button>
  );

  const renderPageFilters = () => (
    <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-5">
      <div className="flex min-w-0 items-center gap-3 border-b border-slate-100 pb-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
          <Trophy className="h-5 w-5" />
        </span>
        <h1 className="truncate text-base font-bold text-slate-900">{activeTabMeta.label}</h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-[#E4EDF7] bg-[#F0F5FA] p-1 text-xs">
            <div className="flex items-center gap-1.5 pl-2.5 pr-1.5 text-slate-500">
              <Clock className="h-3.5 w-3.5 shrink-0 text-[#2F74FF]" />
              <span className="font-normal text-slate-500">统计周期:</span>
            </div>
            {(
              [
                ['day', '按日'],
                ['week', '按周'],
                ['month', '按月'],
                ['quarter', '按季度'],
                ['year', '按年'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => handlePeriodChange(key)}
                className={`min-h-7 cursor-pointer rounded-xl px-3 py-1 text-xs transition select-none ${
                  period === key
                    ? 'bg-white font-semibold text-[#1B5BD6] shadow-xs'
                    : 'font-normal text-slate-700 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <DateRangeField
            startValue={startDate.replaceAll('/', '-')}
            endValue={endDate.replaceAll('/', '-')}
            lockedMode={period === 'day' ? 'range' : period}
            maxDate={EVAL_MAX_DATE}
            onStartChange={(value) => setStartDate(value.replaceAll('-', '/'))}
            onEndChange={(value) => setEndDate(value.replaceAll('-', '/'))}
            title={
              period === 'day'
                ? '选择起止日期'
                : period === 'week'
                  ? '选择自然周'
                  : period === 'month'
                    ? '选择自然月'
                    : period === 'quarter'
                      ? '选择自然季度'
                      : '选择自然年'
            }
            className="min-w-[260px]"
          />

        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex min-h-8 cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-xs transition hover:text-slate-800"
          title="重置筛选"
        >
          重置
        </button>
      </div>
    </section>
  );

  return (
    <div className="relative min-w-0 pb-10 text-slate-700">
      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-start">
      {/* 左侧整页 Tab：切换三个完整界面 */}
      <aside className="w-full shrink-0 md:sticky md:top-5 md:w-44 md:self-start">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xs">
          <nav className="flex gap-1 overflow-x-auto md:flex-col md:space-y-1 md:overflow-visible" role="tablist" aria-label="考核页面">
            {evalTabs.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(item.id)}
                  className={`relative flex min-w-[9.5rem] flex-shrink-0 cursor-pointer items-start gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-all md:w-full md:min-w-0 ${
                    active ? 'bg-blue-50 text-[#1E5ABB]' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {active && (
                    <span className="absolute bottom-2.5 left-0 top-2.5 hidden w-1 rounded-r-full bg-[#1E5ABB] md:block" />
                  )}
                  <span className={`mt-0.5 shrink-0 ${active ? 'text-[#1E5ABB]' : 'text-slate-400'}`}>{item.icon}</span>
                  <span className="min-w-0">
                    <span className={`block text-[13px] ${active ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-slate-400">{item.desc}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1 space-y-4">
      {tab === 'org' ? (
        <>
          {renderPageFilters()}
          {/* 组织节点考核指标 */}
          <section className={sectionClass}>
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1D58C9] text-white shadow-xs">
                  <Target className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-bold text-slate-800">考核指标</h2>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
                  <Globe2 className="h-3.5 w-3.5 text-[#1D58C9]" />
                  <span className="font-semibold text-slate-800">全域参评组织节点</span>
                  <strong className="font-mono text-sm font-bold text-[#1D58C9]">28</strong>
                  <span className="text-slate-400">个</span>
                  <span className="mx-0.5 text-slate-300">·</span>
                  <span className="text-slate-500">在册 654 · 参与 569 · 参与率 87.0%</span>
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <GlobalKpiCard
                title="累计报送量"
                icon={<FileText className="h-4 w-4" />}
                color="#1D58C9"
                value="10,480"
                unit="件"
                hint="日均 349 件 · 人均 23.3 件"
              />
              <GlobalKpiCard
                title="累计采纳量"
                icon={<CheckCircle2 className="h-4 w-4" />}
                color="#08B889"
                value="9,370"
                unit="件"
                hint="重复 2,066 · 首发 6,554 · 其他 750"
              />
              <GlobalKpiCard
                title="首审直通率"
                icon={<Target className="h-4 w-4" />}
                color="#08B889"
                value="77.4%"
                hint="通过 8,111/10,480 件"
              />
              <GlobalKpiCard
                title="整体采纳率"
                icon={<Zap className="h-4 w-4" />}
                color="#2F74FF"
                value="89.4%"
                hint="通过 9,370/10,480 件"
              />
              <GlobalKpiCard
                title="平均审核耗时"
                icon={<Clock className="h-4 w-4" />}
                color="#8656F4"
                value="13.8"
                unit="分钟"
                hint="审核处理率 98.8%"
              />
              <GlobalKpiCard
                title="转办闭环率"
                icon={<RefreshCcw className="h-4 w-4" />}
                color="#08A69A"
                value="95.4%"
                hint={`办结 ${orgRecords.reduce((s, r) => s + getTransferCounts(r).closedCount, 0).toLocaleString()}/${orgRecords.reduce((s, r) => s + getTransferCounts(r).transferTotal, 0).toLocaleString()} 件`}
              />
            </div>
          </section>

          {/* 组织节点考核明细榜 */}
          <section className={sectionClass}>
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1D58C9] text-white shadow-xs">
                  <Target className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-bold text-slate-800">考核明细榜</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">排序维度:</span>
                <select
                  aria-label="组织节点排名排序"
                  value={orgSort}
                  onChange={(e) => setOrgSort(e.target.value)}
                  className="min-h-8 cursor-pointer rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none shadow-xs transition hover:border-slate-300 focus:border-[#1D58C9]"
                >
                  <option value="total">按累计报送量排名</option>
                  <option value="adopted">按累计采纳量排名</option>
                  <option value="passRate">按整体采纳率排名</option>
                  <option value="directRate">按首审直通率排名</option>
                  <option value="avgTime">按平均审核耗时 (最快)</option>
                  <option value="closedRate">按转办闭环率排名</option>
                  <option value="participation">按参与率排名</option>
                </select>
                {renderExportButton()}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1380px] text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-500 select-none border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-3.5 text-center font-semibold text-slate-700">排名</th>
                    <th className="px-3 py-3.5 font-semibold text-slate-700">组织节点名称</th>
                    <th className="px-3 py-3.5 text-center font-semibold text-slate-700">人员参与 (参与/在册)</th>
                    <th className="px-3 py-3.5 text-center font-semibold text-slate-700">累计报送量 (日均/人均)</th>
                    <th className="px-3 py-3.5 text-center font-semibold text-slate-700">累计采纳量 (重复/首发/其他)</th>
                    <th className="px-3 py-3.5 text-center font-semibold text-slate-700">首审直通率 (通过/总件数)</th>
                    <th className="px-3 py-3.5 text-center font-semibold text-slate-700">整体采纳率 (通过/总件数)</th>
                    <th className="px-3 py-3.5 text-center font-semibold text-slate-700">平均审核耗时</th>
                    <th className="px-3 py-3.5 text-center font-semibold text-slate-700">转办闭环率 (办结/转办)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedOrgs.map((row, index) => {
                    const directCount = Math.round((row.total * row.directRate) / 100);
                    const { transferTotal, closedCount } = getTransferCounts(row);
                    return (
                    <tr key={row.name} onClick={() => openOrgProfile(row)} className="cursor-pointer transition hover:bg-blue-50/40">
                      <td className="px-3 py-3.5 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <RankBadge rank={index + 1} />
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="font-bold text-slate-900">{row.name}</div>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${orgSort === 'participation' ? 'bg-blue-50/40' : ''}`}>
                        <div className="flex flex-col items-center gap-1 whitespace-nowrap">
                          <span className="text-xs">
                            <strong className="text-slate-900">{getParticipationCount(row)}</strong>
                            <span className="text-slate-400"> / {row.staff}</span>
                          </span>
                          <span className="inline-flex items-center rounded-md border border-blue-100/60 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-[#1D58C9]">
                            {getParticipationRate(row)}%
                          </span>
                        </div>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${orgSort === 'total' ? 'bg-blue-50/40' : ''}`}>
                        <strong className="text-slate-900 text-xs">{row.total.toLocaleString()}</strong>
                        <span className="text-[10px] text-slate-400 ml-0.5">件</span>
                        <div className="mt-1 text-[10px] text-slate-500">
                          日均 {getDailyAvg(row)}
                          <span className="mx-1 text-slate-300">·</span>
                          人均 {row.perCapita}
                        </div>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${orgSort === 'adopted' ? 'bg-emerald-50/40' : ''}`}>
                        <div>
                          <strong className="font-bold text-[#08B889] text-xs">{row.adopted.toLocaleString()}</strong>
                          <span className="ml-0.5 text-[10px] text-slate-400">件</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center justify-center gap-1 text-[10px]">
                          <span className="rounded bg-blue-50 px-1.5 py-0.5 font-semibold text-[#2F74FF]">重复 {row.repeatCount.toLocaleString()}</span>
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-semibold text-[#08B889]">首发 {row.firstCount.toLocaleString()}</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">其他 {row.otherCount.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${orgSort === 'directRate' ? 'bg-emerald-50/40' : ''}`}>
                        <div className="font-mono text-xs font-bold text-[#08B889]">{row.directRate}%</div>
                        <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                          通过 {directCount}/{row.total} 件
                        </div>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${orgSort === 'passRate' ? 'bg-blue-50/40' : ''}`}>
                        <div className="font-mono text-xs font-bold text-[#2F74FF]">{row.passRate}%</div>
                        <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                          通过 {row.adopted}/{row.total} 件
                        </div>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${orgSort === 'avgTime' ? 'bg-purple-50/40' : ''}`}>
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center justify-center rounded-lg border border-purple-100 bg-purple-50 px-2 py-0.5 text-xs font-bold text-[#8656F4]">
                            {row.avgTime} 分钟
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">
                            处理率 {getProcessRate(row)}%
                          </span>
                        </div>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${orgSort === 'closedRate' ? 'bg-teal-50/40' : ''}`}>
                        <div className="font-mono text-xs font-bold text-teal-700">{row.closedRate}%</div>
                        <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                          办结 {closedCount}/{transferTotal} 件
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : tab === 'group' ? (
        <>
          {renderPageFilters()}
          {/* 群组考核指标 */}
          <section className={sectionClass}>
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1D58C9] text-white shadow-xs">
                  <Target className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-bold text-slate-800">考核指标</h2>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
                  <UsersRound className="h-3.5 w-3.5 text-[#1D58C9]" />
                  <span className="font-semibold text-slate-800">全域参评群组</span>
                  <strong className="font-mono text-sm font-bold text-[#1D58C9]">{groupRecords.length}</strong>
                  <span className="text-slate-400">个</span>
                  <span className="mx-0.5 text-slate-300">·</span>
                  <span className="text-slate-500">
                    在册 {groupRecords.reduce((s, g) => s + g.staff, 0)} · 参与{' '}
                    {groupRecords.reduce((s, g) => s + getParticipationCount(g), 0)} · 参与率{' '}
                    {round1(
                      (groupRecords.reduce((s, g) => s + getParticipationCount(g), 0) /
                        Math.max(groupRecords.reduce((s, g) => s + g.staff, 0), 1)) *
                        100,
                    )}
                    %
                  </span>
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <GlobalKpiCard
                title="累计报送量"
                icon={<FileText className="h-4 w-4" />}
                color="#1D58C9"
                value={groupRecords.reduce((s, g) => s + g.total, 0).toLocaleString()}
                unit="件"
                hint={`日均 ${round1(groupRecords.reduce((s, g) => s + g.total, 0) / EVAL_PERIOD_DAYS)} 件 · 人均 ${round1(groupRecords.reduce((s, g) => s + g.total, 0) / Math.max(groupRecords.reduce((s, g) => s + g.staff, 0), 1))} 件`}
              />
              <GlobalKpiCard
                title="累计采纳量"
                icon={<CheckCircle2 className="h-4 w-4" />}
                color="#08B889"
                value={groupRecords.reduce((s, g) => s + g.adopted, 0).toLocaleString()}
                unit="件"
                hint={`重复 ${groupRecords.reduce((s, g) => s + g.repeatCount, 0).toLocaleString()} · 首发 ${groupRecords.reduce((s, g) => s + g.firstCount, 0).toLocaleString()} · 其他 ${groupRecords.reduce((s, g) => s + g.otherCount, 0).toLocaleString()}`}
              />
              <GlobalKpiCard
                title="首审直通率"
                icon={<Target className="h-4 w-4" />}
                color="#08B889"
                value={`${round1(groupRecords.reduce((s, g) => s + g.directRate, 0) / groupRecords.length)}%`}
                hint={`通过 ${groupRecords.reduce((s, g) => s + Math.round((g.total * g.directRate) / 100), 0).toLocaleString()}/${groupRecords.reduce((s, g) => s + g.total, 0).toLocaleString()} 件`}
              />
              <GlobalKpiCard
                title="整体采纳率"
                icon={<Zap className="h-4 w-4" />}
                color="#2F74FF"
                value={`${round1((groupRecords.reduce((s, g) => s + g.adopted, 0) / Math.max(groupRecords.reduce((s, g) => s + g.total, 0), 1)) * 100)}%`}
                hint={`通过 ${groupRecords.reduce((s, g) => s + g.adopted, 0).toLocaleString()}/${groupRecords.reduce((s, g) => s + g.total, 0).toLocaleString()} 件`}
              />
              <GlobalKpiCard
                title="平均审核耗时"
                icon={<Clock className="h-4 w-4" />}
                color="#8656F4"
                value={`${round1(groupRecords.reduce((s, g) => s + g.avgTime, 0) / groupRecords.length)}`}
                unit="分钟"
                hint={`审核处理率 ${round1(groupRecords.reduce((s, g) => s + getProcessRate(g), 0) / groupRecords.length)}%`}
              />
              <GlobalKpiCard
                title="转办闭环率"
                icon={<RefreshCcw className="h-4 w-4" />}
                color="#08A69A"
                value={`${round1(groupRecords.reduce((s, r) => s + r.closedRate, 0) / groupRecords.length)}%`}
                hint={`办结 ${groupRecords.reduce((s, r) => s + getTransferCounts(r).closedCount, 0).toLocaleString()}/${groupRecords.reduce((s, r) => s + getTransferCounts(r).transferTotal, 0).toLocaleString()} 件`}
              />
            </div>
          </section>

          {/* 群组考核明细榜 */}
          <section className={sectionClass}>
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1D58C9] text-white shadow-xs">
                  <Target className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-bold text-slate-800">考核明细榜</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">排序维度:</span>
                <select
                  aria-label="群组排名排序"
                  value={groupSort}
                  onChange={(e) => setGroupSort(e.target.value)}
                  className="min-h-8 cursor-pointer rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none shadow-xs transition hover:border-slate-300 focus:border-[#1D58C9]"
                >
                  <option value="total">按累计报送量排名</option>
                  <option value="adopted">按累计采纳量排名</option>
                  <option value="passRate">按整体采纳率排名</option>
                  <option value="directRate">按首审直通率排名</option>
                  <option value="avgTime">按平均审核耗时 (最快)</option>
                  <option value="closedRate">按转办闭环率排名</option>
                  <option value="participation">按参与率排名</option>
                </select>
                {renderExportButton()}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1380px] text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-500 select-none border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-3.5 text-center font-semibold text-slate-700">排名</th>
                    <th className="px-3 py-3.5 font-semibold text-slate-700">群组名称</th>
                    <th className="px-3 py-3.5 text-center font-semibold text-slate-700">成员参与 (参与/在册)</th>
                    <th className="px-3 py-3.5 text-center font-semibold text-slate-700">累计报送量 (日均/人均)</th>
                    <th className="px-3 py-3.5 text-center font-semibold text-slate-700">累计采纳量 (重复/首发/其他)</th>
                    <th className="px-3 py-3.5 text-center font-semibold text-slate-700">首审直通率 (通过/总件数)</th>
                    <th className="px-3 py-3.5 text-center font-semibold text-slate-700">整体采纳率 (通过/总件数)</th>
                    <th className="px-3 py-3.5 text-center font-semibold text-slate-700">平均审核耗时</th>
                    <th className="px-3 py-3.5 text-center font-semibold text-slate-700">转办闭环率 (办结/转办)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedGroups.map((row, index) => {
                    const directCount = Math.round((row.total * row.directRate) / 100);
                    const { transferTotal, closedCount } = getTransferCounts(row);
                    return (
                    <tr key={row.name} onClick={() => openGroupProfile(row)} className="cursor-pointer transition hover:bg-blue-50/40">
                      <td className="px-3 py-3.5 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <RankBadge rank={index + 1} />
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="font-bold text-slate-900">{row.name}</div>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${groupSort === 'participation' ? 'bg-blue-50/40' : ''}`}>
                        <div className="flex flex-col items-center gap-1 whitespace-nowrap">
                          <span className="text-xs">
                            <strong className="text-slate-900">{getParticipationCount(row)}</strong>
                            <span className="text-slate-400"> / {row.staff}</span>
                          </span>
                          <span className="inline-flex items-center rounded-md border border-blue-100/60 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-[#1D58C9]">
                            {getParticipationRate(row)}%
                          </span>
                        </div>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${groupSort === 'total' ? 'bg-blue-50/40' : ''}`}>
                        <strong className="text-slate-900 text-xs">{row.total.toLocaleString()}</strong>
                        <span className="text-[10px] text-slate-400 ml-0.5">件</span>
                        <div className="mt-1 text-[10px] text-slate-500">
                          日均 {getDailyAvg(row)}
                          <span className="mx-1 text-slate-300">·</span>
                          人均 {row.perCapita}
                        </div>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${groupSort === 'adopted' ? 'bg-emerald-50/40' : ''}`}>
                        <div>
                          <strong className="font-bold text-[#08B889] text-xs">{row.adopted.toLocaleString()}</strong>
                          <span className="ml-0.5 text-[10px] text-slate-400">件</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center justify-center gap-1 text-[10px]">
                          <span className="rounded bg-blue-50 px-1.5 py-0.5 font-semibold text-[#2F74FF]">重复 {row.repeatCount.toLocaleString()}</span>
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-semibold text-[#08B889]">首发 {row.firstCount.toLocaleString()}</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">其他 {row.otherCount.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${groupSort === 'directRate' ? 'bg-emerald-50/40' : ''}`}>
                        <div className="font-mono text-xs font-bold text-[#08B889]">{row.directRate}%</div>
                        <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                          通过 {directCount}/{row.total} 件
                        </div>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${groupSort === 'passRate' ? 'bg-blue-50/40' : ''}`}>
                        <div className="font-mono text-xs font-bold text-[#2F74FF]">{row.passRate}%</div>
                        <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                          通过 {row.adopted}/{row.total} 件
                        </div>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${groupSort === 'avgTime' ? 'bg-purple-50/40' : ''}`}>
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center justify-center rounded-lg border border-purple-100 bg-purple-50 px-2 py-0.5 text-xs font-bold text-[#8656F4]">
                            {row.avgTime} 分钟
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">
                            处理率 {getProcessRate(row)}%
                          </span>
                        </div>
                      </td>
                      <td className={`px-3 py-3.5 text-center font-mono ${groupSort === 'closedRate' ? 'bg-teal-50/40' : ''}`}>
                        <div className="font-mono text-xs font-bold text-teal-700">{row.closedRate}%</div>
                        <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                          办结 {closedCount}/{transferTotal} 件
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <>
          {renderPageFilters()}
          {/* 人员考核明细榜 */}
          <section className={sectionClass}>
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
                <button
                  type="button"
                  onClick={() => setPerspective('report')}
                  className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all ${
                    perspective === 'report' ? 'bg-[#1B5BD6] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Send className="h-3.5 w-3.5 -rotate-12" />
                  报送考核
                  <span
                    className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                      perspective === 'report' ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {visibleReporters.length}人
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPerspective('audit')}
                  className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all ${
                    perspective === 'audit' ? 'bg-[#08B889] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  审核考核
                  <span
                    className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                      perspective === 'audit' ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {visibleAuditors.length}人
                  </span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <OrgFilterSelect
                  value={personOrgFilter}
                  onChange={setPersonOrgFilter}
                  allLabel="全部组织节点"
                  title="按组织树逐级下钻筛选（含下级）"
                  triggerClassName="!min-h-8 !h-8 !rounded-xl !border-slate-200 !shadow-xs !text-xs !min-w-[168px] !max-w-[220px]"
                />
                <MultiFilterSelect
                  ariaLabel="按群组筛选"
                  placeholder="全部群组"
                  options={groupRecords.map((group) => group.name)}
                  selected={personGroupFilter}
                  onChange={setPersonGroupFilter}
                />
                <span className="text-xs font-medium text-slate-500">排序维度:</span>
                {perspective === 'report' ? (
                  <select
                    aria-label="报送考核排名排序"
                    value={reporterSort}
                    onChange={(e) => setReporterSort(e.target.value)}
                    className="min-h-8 cursor-pointer rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none shadow-xs transition hover:border-slate-300 focus:border-[#1D58C9]"
                  >
                    <option value="adopted">按累计采纳量排名</option>
                    <option value="total">按累计报送量排名</option>
                    <option value="directRate">按首审直通率排名</option>
                    <option value="passRate">按整体采纳率排名</option>
                    <option value="score">按综合得分排名</option>
                    <option value="avgScore">按平均得分排名</option>
                  </select>
                ) : (
                  <select
                    aria-label="审核考核排名排序"
                    value={auditorSort}
                    onChange={(e) => setAuditorSort(e.target.value)}
                    className="min-h-8 cursor-pointer rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none shadow-xs transition hover:border-slate-300 focus:border-[#1D58C9]"
                  >
                    <option value="audited">按累计处理次数排名</option>
                    <option value="rate">按审核处理率排名</option>
                    <option value="time">按平均审核耗时 (最快)</option>
                  </select>
                )}
                {renderExportButton()}
              </div>
            </div>

            <div className="overflow-x-auto">
              {perspective === 'report' ? (
                <table className="w-full min-w-[1180px] text-left text-xs">
                  <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="w-24 px-3 py-3.5 text-center font-semibold">全域排名</th>
                      <th className="px-3 py-3.5 font-semibold">人员 / 组织节点 / 群组</th>
                      <th className="px-3 py-3.5 text-center font-semibold">累计报送量 (日均)</th>
                      <th className="px-3 py-3.5 text-center font-semibold">累计采纳量 (重复/首发/其他)</th>
                      <th className="px-3 py-3.5 text-center font-semibold">首审直通率 (通过/总件数)</th>
                      <th className="px-3 py-3.5 text-center font-semibold">整体采纳率 (通过/总件数)</th>
                      <th className="px-3 py-3.5 text-center font-semibold">综合得分</th>
                      <th className="px-3 py-3.5 text-center font-semibold">平均得分</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedReporters.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">没有符合条件的报送考核人员</td>
                      </tr>
                    ) : (
                      pagedReporters.map((row) => (
                        <tr key={row.id} onClick={() => openReporterProfile(row)} className="cursor-pointer transition hover:bg-blue-50/40">
                          <td className="px-3 py-3.5 text-center">
                            <RankBadge rank={row.rank} />
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="text-xs font-bold text-slate-900">{row.name}</div>
                            <div className="mt-0.5 text-[11px] text-slate-400">{row.org}</div>
                            <div className="mt-0.5 text-[11px] text-slate-400">{row.group}</div>
                          </td>
                          <td className={`px-3 py-3.5 text-center font-mono ${reporterSort === 'total' ? 'bg-blue-50/40' : ''}`}>
                            <div className="font-mono text-xs font-bold text-slate-800">{row.total} 件</div>
                            <div className="mt-0.5 text-[11px] text-slate-400">日均 {round1(row.total / EVAL_PERIOD_DAYS)}</div>
                          </td>
                          <td className={`px-3 py-3.5 text-center ${reporterSort === 'adopted' ? 'bg-emerald-50/40' : ''}`}>
                            <div className="font-mono text-xs font-bold text-[#08B889]">{row.adoptedCount} 件</div>
                          <div className="mt-0.5 text-[11px]">
                            <span className="font-medium text-[#2F74FF]">重复 {row.repeatCount}</span>
                            <span className="mx-1 text-slate-300">/</span>
                            <span className="font-medium text-[#08B889]">首发 {row.firstCount}</span>
                            <span className="mx-1 text-slate-300">/</span>
                            <span className="font-medium text-slate-600">其他 {row.otherCount}</span>
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
                      <th className="px-3 py-3.5 font-semibold">人员 / 组织节点 / 群组</th>
                      <th className="px-3 py-3.5 text-center font-semibold">累计处理 (通过处理/驳回处理)</th>
                      <th className="px-3 py-3.5 text-center font-semibold">审核处理率 (已办/待办)</th>
                      <th className="px-3 py-3.5 text-center font-semibold">平均审核耗时</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedAuditors.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">没有符合条件的审核考核人员</td>
                      </tr>
                    ) : (
                      pagedAuditors.map((row) => (
                        <tr key={row.id} onClick={() => openAuditorProfile(row)} className="cursor-pointer transition hover:bg-emerald-50/30">
                          <td className="px-3 py-3.5 text-center">
                            <RankBadge rank={row.rank} />
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="text-xs font-bold text-slate-900">{row.name}</div>
                            <div className="mt-0.5 text-[11px] text-slate-400">{row.org}</div>
                            <div className="mt-0.5 text-[11px] text-slate-400">{row.group}</div>
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <div className="font-mono text-xs font-bold text-slate-800">{row.totalAudited} 次</div>
                          <div className="mt-0.5 text-[11px]">
                            <span className="font-medium text-[#08B889]">通过处理 {row.passedCount}</span>
                            <span className="mx-1 text-slate-300">/</span>
                            <span className="font-medium text-[#E11D48]">驳回处理 {row.rejectedCount}</span>
                          </div>
                        </td>
                          <td className="px-3 py-3.5 text-center">
                            <div className="font-mono text-xs font-bold text-[#08B889]">{row.auditProcessRate}%</div>
                          <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                              已办 {row.totalAudited} / 待办 {Math.max(0, row.reportedCount - row.totalAudited)} 次
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
      </div>
      </div>

      <EvaluationProfileModal
        data={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        periodText={`${startDate} - ${endDate}`}
      />
    </div>
  );
};
