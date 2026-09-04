import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  Globe2,
  RefreshCw,
  Send,
  ShieldCheck,
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

interface ReporterRecord {
  rank: number;
  name: string;
  org: string;
  total: number;
  adopted: number;
  rejected: number;
  pending: number;
  directRate: number;
  passRate: number;
  score: number;
  avgScore: number;
  change: string;
  grade: '卓越' | '优秀' | '良好' | '合格';
  isMine?: boolean;
  isLeader?: boolean;
}

interface AuditorRecord {
  rank: number;
  name: string;
  org: string;
  totalAudited: number;
  passedAudits: number;
  rejectedAudits: number;
  pendingAudits: number;
  auditProcessRate: number;
  avgResponseMin: number;
  score: number;
  avgScore: number;
  change: string;
  grade: '卓越' | '优秀' | '良好' | '合格';
  isMine?: boolean;
  isLeader?: boolean;
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

const reporterRecords: ReporterRecord[] = [
  { rank: 1, name: '张三', org: '中共台中市委宣传部', total: 42, adopted: 36, rejected: 3, pending: 3, directRate: 85.7, passRate: 92.9, score: 3986.5, avgScore: 94.9, change: '+15.8%', grade: '卓越', isMine: true, isLeader: true },
  { rank: 2, name: '王五', org: '台中市大数据中心', total: 38, adopted: 32, rejected: 3, pending: 3, directRate: 84.2, passRate: 89.5, score: 3540, avgScore: 93.2, change: '+12.4%', grade: '卓越' },
  { rank: 3, name: '赵六', org: '西屯区网信办', total: 35, adopted: 29, rejected: 4, pending: 2, directRate: 80, passRate: 85.7, score: 3215, avgScore: 91.8, change: '+10.1%', grade: '优秀' },
  { rank: 4, name: '孙七', org: '东湖区委宣传部', total: 31, adopted: 25, rejected: 4, pending: 2, directRate: 77.4, passRate: 83.9, score: 2820, avgScore: 91, change: '+8.6%', grade: '优秀' },
  { rank: 5, name: '李四', org: '台中市网信办', total: 28, adopted: 22, rejected: 4, pending: 2, directRate: 75, passRate: 82.1, score: 2510, avgScore: 89.6, change: '+5.2%', grade: '良好' },
  { rank: 6, name: '吴九', org: '台中市交通运输局', total: 24, adopted: 18, rejected: 4, pending: 2, directRate: 70.8, passRate: 79.2, score: 2100, avgScore: 87.5, change: '+3.1%', grade: '良好' },
  { rank: 7, name: '郑十', org: '南屯区网络信息中心', total: 20, adopted: 14, rejected: 4, pending: 2, directRate: 65, passRate: 75, score: 1720, avgScore: 86, change: '+1.4%', grade: '合格' },
];

const auditorRecords: AuditorRecord[] = [
  { rank: 1, name: '李明', org: '台中市网信办', totalAudited: 96, passedAudits: 88, rejectedAudits: 8, pendingAudits: 4, auditProcessRate: 96.2, avgResponseMin: 7.4, score: 4320, avgScore: 96.8, change: '+12.6%', grade: '卓越' },
  { rank: 2, name: '王主任', org: '中共台中市委宣传部', totalAudited: 86, passedAudits: 78, rejectedAudits: 8, pendingAudits: 5, auditProcessRate: 94.5, avgResponseMin: 6.8, score: 3960, avgScore: 95.2, change: '+18.2%', grade: '卓越', isMine: true, isLeader: true },
  { rank: 3, name: '陈科长', org: '台中市大数据中心', totalAudited: 82, passedAudits: 74, rejectedAudits: 8, pendingAudits: 6, auditProcessRate: 93.8, avgResponseMin: 8.6, score: 3520, avgScore: 92.8, change: '+9.5%', grade: '优秀' },
  { rank: 4, name: '周主管', org: '西屯区网信办', totalAudited: 75, passedAudits: 68, rejectedAudits: 7, pendingAudits: 5, auditProcessRate: 92.7, avgResponseMin: 10.2, score: 3160, avgScore: 90.6, change: '+6.4%', grade: '优秀' },
  { rank: 5, name: '韩科长', org: '东湖区委宣传部', totalAudited: 68, passedAudits: 60, rejectedAudits: 8, pendingAudits: 7, auditProcessRate: 90.7, avgResponseMin: 12.4, score: 2780, avgScore: 88.9, change: '+3.8%', grade: '良好' },
  { rank: 6, name: '徐副主任', org: '南屯区网信办', totalAudited: 58, passedAudits: 51, rejectedAudits: 7, pendingAudits: 8, auditProcessRate: 87.9, avgResponseMin: 14.8, score: 2320, avgScore: 85.6, change: '+1.6%', grade: '合格' },
];

const rankClass = (rank: number) =>
  rank === 1
    ? 'bg-amber-100 text-amber-800'
    : rank === 2
      ? 'bg-slate-200 text-slate-700'
      : rank === 3
        ? 'bg-orange-100 text-orange-800'
        : 'text-slate-500';

const gradeClass = (grade: OrgRecord['grade']) =>
  grade === '卓越'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : grade === '优秀'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : grade === '良好'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-slate-100 text-slate-600 border-slate-200';

const MetricCard: React.FC<{
  title: string;
  value: string;
  unit?: string;
  note: string;
  footer: string;
  color: string;
  icon: React.ReactNode;
}> = ({ title, value, unit, note, footer, color, icon }) => (
  <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
    <div className="flex items-center justify-between gap-2">
      <span className="flex min-w-0 items-center gap-1.5 truncate text-[11px] font-bold text-slate-700">
        <span style={{ color }}>{icon}</span>
        {title}
      </span>
      <span className="shrink-0 rounded bg-slate-50 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500">{note}</span>
    </div>
    <div className="mt-2 flex items-baseline gap-1">
      <strong className="font-mono text-xl tracking-tight" style={{ color }}>{value}</strong>
      {unit && <span className="text-[10px] text-slate-400">{unit}</span>}
    </div>
    <div className="mt-1 flex items-center justify-between gap-2 border-t border-slate-100 pt-1.5 text-[10px] text-slate-400">
      {footer}
    </div>
  </div>
);

const Header: React.FC<{
  scope: Scope;
  perspective: Perspective;
  period: Period;
  startDate: string;
  endDate: string;
  onScope: (scope: Scope) => void;
  onPerspective: (perspective: Perspective) => void;
  onPeriod: (period: Period) => void;
  onStartDate: (value: string) => void;
  onEndDate: (value: string) => void;
  selectedOrg: string;
  onSelectedOrg: (value: string) => void;
  onReset: () => void;
  onExport: () => void;
}> = ({ scope, perspective, period, startDate, endDate, onScope, onPerspective, onPeriod, onStartDate, onEndDate, selectedOrg, onSelectedOrg, onReset, onExport }) => (
  <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-5">
    <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
          <Trophy className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-slate-900">考核管理与综合绩效评定</h1>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button type="button" onClick={() => onScope('all')} className={`inline-flex min-h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold ${scope === 'all' ? 'bg-[#1D58C9] text-white shadow-sm' : 'text-slate-500'}`}>
            <Globe2 className="h-3.5 w-3.5" /> 全域
          </button>
          <button type="button" onClick={() => onScope('mine')} className={`inline-flex min-h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold ${scope === 'mine' ? 'bg-[#1D58C9] text-white shadow-sm' : 'text-slate-500'}`}>
            <UserRound className="h-3.5 w-3.5" /> 我的
          </button>
        </div>
        <button type="button" onClick={onExport} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-[#1D58C9] px-3 text-xs font-semibold text-white">
          <Download className="h-3.5 w-3.5" /> 导出考核数据
        </button>
      </div>
    </div>

    <div className="flex flex-col gap-3 pt-3 xl:flex-row xl:items-center xl:justify-between">
      {scope === 'mine' && (
        <div className="flex w-fit items-center rounded-xl border border-slate-200 bg-slate-100 p-1 text-[11px]">
          <button
            type="button"
            aria-pressed={perspective === 'report'}
            onClick={() => onPerspective('report')}
            className={`inline-flex min-h-7 items-center gap-1.5 rounded-lg px-3 font-semibold transition-colors ${perspective === 'report' ? 'bg-[#1D58C9] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Send className="h-3.5 w-3.5" /> 上报员榜
          </button>
          <button
            type="button"
            aria-pressed={perspective === 'audit'}
            onClick={() => onPerspective('audit')}
            className={`inline-flex min-h-7 items-center gap-1.5 rounded-lg px-3 font-semibold transition-colors ${perspective === 'audit' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> 审核员榜
          </button>
        </div>
      )}
      <div className={`flex flex-wrap items-center gap-2 ${scope === 'all' ? 'w-full justify-between' : 'justify-end'}`}>
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 text-[11px]">
          <span className="inline-flex min-h-7 items-center gap-1.5 px-2 font-medium text-slate-500">
            <Clock3 className="h-3.5 w-3.5 text-[#1D58C9]" /> 考核周期：
          </span>
          {[
            ['day', '日(今日)'],
            ['week', '周(本周)'],
            ['month', '月(本月)'],
            ['quarter', '季度'],
            ['year', '年度'],
            ['custom', '自定义'],
          ].map(([key, label]) => (
            <button key={key} type="button" onClick={() => onPeriod(key as Period)} className={`min-h-7 rounded-lg px-2.5 font-semibold transition-colors ${period === key ? 'bg-white text-[#1D58C9] shadow-sm' : 'text-slate-700 hover:bg-white/70'}`}>
              {label}
            </button>
          ))}
        </div>
        <label className="flex min-h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-500">
          <CalendarDays className="h-3.5 w-3.5 text-[#1D58C9]" />
          <input type="date" value={startDate} onChange={(event) => onStartDate(event.target.value)} className="w-[104px] bg-transparent font-mono text-[11px] outline-none" />
          <span>至</span>
          <input type="date" value={endDate} onChange={(event) => onEndDate(event.target.value)} className="w-[104px] bg-transparent font-mono text-[11px] outline-none" />
        </label>
        {scope === 'all' ? (
          <select
            aria-label="统计主体"
            value={selectedOrg}
            onChange={(event) => onSelectedOrg(event.target.value)}
            className="min-h-8 max-w-full rounded-lg border border-blue-200 bg-white px-2.5 text-[11px] font-semibold text-blue-800 outline-none"
          >
            {orgOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        ) : (
          <span className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg border bg-white px-2.5 text-[11px] font-semibold ${perspective === 'report' ? 'border-blue-200 text-blue-800' : 'border-emerald-200 text-emerald-800'}`}>
            <ShieldCheck className="h-3.5 w-3.5" /> {`${perspective === 'report' ? '上报员榜' : '审核员榜'} · 考评主体: 本人`}
          </span>
        )}
        <button type="button" onClick={onReset} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500" title="重置筛选">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </section>
);

export const EvaluationReference: React.FC<EvaluationReferenceProps> = () => {
  const [scope, setScope] = useState<Scope>('all');
  const [perspective, setPerspective] = useState<Perspective>('report');
  const [period, setPeriod] = useState<Period>('week');
  const [startDate, setStartDate] = useState('2026-08-04');
  const [endDate, setEndDate] = useState('2026-08-11');
  const [selectedOrg, setSelectedOrg] = useState(orgOptions[0]);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<ProfileDetailData | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const reset = () => {
    setScope('all');
    setPerspective('report');
    setPeriod('week');
    setStartDate('2026-08-04');
    setEndDate('2026-08-11');
    setSelectedOrg(orgOptions[0]);
  };

  const openProfile = (record: OrgRecord | ReporterRecord | AuditorRecord) => {
    const isOrg = 'staff' in record;
    const isAuditor = 'totalAudited' in record;
    setSelectedProfile({
      id: `${isOrg ? 'org' : isAuditor ? 'auditor' : 'reporter'}-${record.rank}`,
      name: record.name,
      type: isOrg ? 'org' : isAuditor ? 'auditor' : 'reporter',
      subTitle: isOrg ? record.type : record.org,
      rank: record.rank,
      totalScore: record.score,
      grade: record.grade,
      stats: isOrg
        ? [
            { label: '在册总人数', value: `${record.staff} 人`, subLabel: `上报 ${record.reporters} / 审核 ${record.auditors}` },
            { label: '累计报送量', value: `${record.total} 件`, subLabel: `采纳 ${record.adopted} 件`, isHighlight: true },
            { label: '一次性通过率', value: `${record.directRate}%`, isHighlight: true },
            { label: '平均响应耗时', value: `${record.avgTime} 分钟` },
          ]
        : isAuditor
          ? [
              { label: '累计审核量', value: `${record.totalAudited} 件`, subLabel: `通过 ${record.passedAudits} / 驳回 ${record.rejectedAudits}`, isHighlight: true },
              { label: '审核处理率', value: `${record.auditProcessRate}%`, isHighlight: true },
              { label: '平均响应耗时', value: `${record.avgResponseMin} 分钟` },
              { label: '单条平均得分', value: `${record.avgScore} 分` },
            ]
        : [
            { label: '累计上报量', value: `${record.total} 件`, subLabel: `采纳 ${record.adopted} 件`, isHighlight: true },
            { label: '一次性通过率', value: `${record.directRate}%`, isHighlight: true },
            { label: '整体通过率', value: `${record.passRate}%` },
            { label: '单条平均得分', value: `${record.avgScore} 分` },
          ],
      radarData: [
        { subject: isAuditor ? '审核效率' : '报送活跃', value: isAuditor ? record.auditProcessRate : 95, fullMark: 100 },
        { subject: isAuditor ? '审核质量' : '采纳质量', value: isAuditor ? 94 : 93, fullMark: 100 },
        { subject: isAuditor ? '审核完成' : '一次通过', value: isAuditor ? record.auditProcessRate : record.directRate, fullMark: 100 },
        { subject: '响应时效', value: isAuditor ? 96 : isOrg ? 94 : 91, fullMark: 100 },
        { subject: isAuditor ? '闭环成效' : '闭环成效', value: isAuditor ? 92 : isOrg ? record.closedRate : 92, fullMark: 100 },
      ],
      historyScores: [
        { month: '4月', score: Math.max(78, record.score - 6) },
        { month: '5月', score: Math.max(80, record.score - 4) },
        { month: '6月', score: Math.max(82, record.score - 2) },
        { month: '7月', score: Math.max(84, record.score - 1) },
        { month: '8月', score: record.score },
      ],
      breakdown: [
        { category: isAuditor ? '审核效率' : '报送质量', item: isAuditor ? '审核处理达标' : '一次性通过激励', points: isAuditor ? '+32.0' : '+25.0', desc: isAuditor ? '周期内审核处理率达到考核要求' : '一次性通过率处于全域领先梯队' },
        { category: isAuditor ? '审核质量' : '报送贡献', item: isAuditor ? '审核通过质量' : '有效采纳得分', points: isAuditor ? '+36.0' : '+40.0', desc: isAuditor ? '审核结论准确，驳回意见清晰' : '完成周期内有效报送与采纳目标' },
        { category: '响应时效', item: isAuditor ? '快速审核响应' : '高效响应奖励', points: isAuditor ? '+24.5' : '+24.5', desc: isAuditor ? '平均响应耗时优于审核基准' : '平均响应耗时优于考核基准' },
        { category: '综合表现', item: '综合绩效加分', points: '+9.0', desc: isAuditor ? '审核活跃与处理闭环表现良好' : '人员活跃与业务闭环表现良好' },
      ],
      summaryEvaluation: `${record.name} 本考核周期综合表现良好，当前排名第 ${record.rank}，建议持续保持${isAuditor ? '审核质量与响应时效' : '报送质量与处理时效'}。`,
    });
  };

  const periodLabel = `${startDate.replaceAll('-', '/')} - ${endDate.replaceAll('-', '/')}`;

  return (
    <div className="relative min-w-0 space-y-4 pb-10 text-slate-700">
      {toast && <div className="fixed right-5 top-5 z-50 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl">{toast}</div>}
      <Header
        scope={scope}
        perspective={perspective}
        period={period}
        startDate={startDate}
        endDate={endDate}
        onScope={setScope}
        onPerspective={setPerspective}
        onPeriod={(next) => {
          setPeriod(next);
          if (next === 'day') { setStartDate('2026-08-11'); setEndDate('2026-08-11'); }
          if (next === 'week') { setStartDate('2026-08-04'); setEndDate('2026-08-11'); }
          if (next === 'month') { setStartDate('2026-08-01'); setEndDate('2026-08-31'); }
          if (next === 'quarter') { setStartDate('2026-07-01'); setEndDate('2026-09-30'); }
          if (next === 'year') { setStartDate('2026-01-01'); setEndDate('2026-12-31'); }
        }}
        onStartDate={(value) => { setStartDate(value); setPeriod('custom'); }}
        onEndDate={(value) => { setEndDate(value); setPeriod('custom'); }}
        selectedOrg={selectedOrg}
        onSelectedOrg={setSelectedOrg}
        onReset={reset}
        onExport={() => showToast('考核数据导出成功')}
      />

      {scope === 'all' ? (
        <>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            <MetricCard title="全域参评机构" value="28" unit="家" note="全域覆盖" footer={<><span>在册人员 654人</span><strong className="text-emerald-600">达标率 100%</strong></>} color="#1D58C9" icon={<Globe2 className="h-3.5 w-3.5" />} />
            <MetricCard title="累计上报" value="10,480" unit="件" note="提交总量" footer={<><span>日均报送 349件</span><strong className="text-blue-600">环比 +6.8%</strong></>} color="#1D58C9" icon={<FileText className="h-3.5 w-3.5" />} />
            <MetricCard title="采纳量/采纳率" value="9,370" unit="件" note="有效采纳" footer={<><span>驳回 780件</span><strong className="text-emerald-600">通过率 89.4%</strong></>} color="#08B889" icon={<FileCheck2 className="h-3.5 w-3.5" />} />
            <MetricCard title="机构考核均分" value="88.5" unit="分" note="全域考评" footer={<><span>最高得分 98.5</span><strong className="text-amber-600">环比 +1.2分</strong></>} color="#F5A400" icon={<Trophy className="h-3.5 w-3.5" />} />
            <MetricCard title="全域首审直通率" value="77.4" unit="%" note="质效核心" footer={<><span>标兵 市委宣传部</span><strong className="text-emerald-600">88.6%</strong></>} color="#08B889" icon={<Zap className="h-3.5 w-3.5" />} />
            <MetricCard title="审核响应均时" value="13.8" unit="分钟" note="流转时效" footer={<><span>最快 市委宣传部</span><strong className="text-purple-600">6.8分</strong></>} color="#8656F4" icon={<RefreshCw className="h-3.5 w-3.5" />} />
            <MetricCard title="转办闭环率" value="96.8" unit="%" note="履约评价" footer={<><span>转办 112 / 采纳 120件</span><strong className="text-emerald-600">按期率 98%</strong></>} color="#08A69A" icon={<CheckCircle2 className="h-3.5 w-3.5" />} />
            <MetricCard title="人均报送量" value="23.3" unit="件/人" note="活跃贡献" footer={<><span>标兵 市委宣传部</span><strong className="text-blue-600">35.5件</strong></>} color="#7659EA" icon={<UsersRound className="h-3.5 w-3.5" />} />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-700"><BarChart3 className="h-3.5 w-3.5" /></span>
                <h2 className="text-sm font-bold text-slate-900">全域 28 家机构综合考核评榜</h2>
                <span className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">共 12 家展示</span>
              </div>
              <div className="flex items-center gap-2">
                <select className="min-h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] text-slate-600 outline-none">
                  <option>按综合排名</option>
                  <option>按上报量</option>
                  <option>按一次性通过率</option>
                </select>
                <button type="button" onClick={() => showToast('考核数据已刷新')} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white"><RefreshCw className="h-3.5 w-3.5" /> 刷新</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] text-left text-[11px]">
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
                    <th className="px-3 py-3 text-center">等次</th>
                    <th className="px-3 py-3 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orgRecords.map((row) => (
                    <tr key={row.name} className={`transition hover:bg-blue-50/40 ${row.isMine ? 'bg-blue-50/20' : ''}`}>
                      <td className="px-2 py-3 text-center"><span className={`inline-flex h-5 w-5 items-center justify-center rounded-full font-mono font-bold ${rankClass(row.rank)}`}>{row.rank}</span></td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">{row.name}{row.isMine && <span className="rounded bg-amber-100 px-1 py-0.5 text-[9px] text-amber-700">本机构</span>}</div>
                        <div className="mt-0.5 text-[10px] text-slate-400">{row.type}</div>
                      </td>
                      <td className="px-3 py-3 text-center font-mono text-slate-700"><strong>{row.staff} 人</strong><div className="mt-0.5 text-[9px] text-slate-400">上报 {row.reporters} / 审核 {row.auditors}</div></td>
                      <td className="px-3 py-3 text-center font-mono">
                        <div className="flex items-center justify-center gap-1.5">
                          <strong>{getParticipationCount(row)} 人</strong>
                          <span className="rounded bg-blue-50 px-1 py-0.5 text-[10px] font-bold text-blue-700">{getParticipationRate(row)}%</span>
                        </div>
                        <div className="mx-auto mt-1.5 h-1.5 w-14 rounded-full bg-slate-100">
                          <span className="block h-1.5 rounded-full bg-[#1D58C9]" style={{ width: `${getParticipationRate(row)}%` }} />
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center font-mono"><strong className="text-slate-800">{row.total.toLocaleString()} 件</strong><div className="mt-0.5 text-[9px]"><span className="text-emerald-600">采 {row.adopted}</span> / <span className="text-rose-500">驳 {row.rejected}</span> / <span className="text-amber-600">待 {row.pending}</span></div></td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-emerald-600"><span>{row.directRate}%</span><div className="mx-auto mt-1 h-1.5 w-10 rounded-full bg-slate-100"><span className="block h-1.5 rounded-full bg-emerald-500" style={{ width: `${row.directRate}%` }} /></div></td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-blue-600">{row.passRate}%</td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-purple-600">{row.avgTime} 分钟</td>
                      <td className="px-3 py-3 text-center font-mono">{row.perCapita} 件/人</td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-emerald-600"><span>{row.closedRate}%</span><div className="mx-auto mt-1 h-1.5 w-10 rounded-full bg-slate-100"><span className="block h-1.5 rounded-full bg-emerald-500" style={{ width: `${row.closedRate}%` }} /></div></td>
                      <td className="px-3 py-3 text-center"><span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${gradeClass(row.grade)}`}>{row.grade}</span></td>
                      <td className="px-3 py-3 text-center"><button type="button" onClick={() => openProfile(row)} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-blue-200 px-2 text-[10px] font-semibold text-blue-600" title="查看机构画像">画像分析<ChevronRight className="h-3 w-3" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-md ${perspective === 'report' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {perspective === 'report' ? <Award className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">考评效能指标</h2>
                  <p className="text-[10px] text-slate-400">个人量化指标、排名与环比走势</p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${perspective === 'report' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {perspective === 'report' ? '张三' : '王主任'}
              </span>
            </div>

            {perspective === 'report' ? (
              <>
                <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-5">
                  <MetricCard title="累计上报" value="11" unit="件" note="环比 +15.8%" footer={<><span>采 1 / 驳 2 / 待 8</span><strong className="text-amber-600">第 3 名 / 28人</strong></>} color="#1D58C9" icon={<FileText className="h-3.5 w-3.5" />} />
                  <MetricCard title="一次性通过率" value="81.8" unit="%" note="环比 +4.2%" footer={<><span>通过 9/11 件</span><strong className="text-blue-600">第 2 名 / 28人</strong></>} color="#008E88" icon={<Zap className="h-3.5 w-3.5" />} />
                  <MetricCard title="整体通过率" value="90.9" unit="%" note="环比 +4.2%" footer={<><span>通过 10/11 件</span><strong className="text-blue-600">第 1 名 / 28人</strong></>} color="#1D58C9" icon={<CheckCircle2 className="h-3.5 w-3.5" />} />
                  <MetricCard title="综合得分" value="1,020.8" unit="分" note="环比 +185.0分" footer={<><span>累计得分</span><strong className="text-amber-600">第 2 名 / 28人</strong></>} color="#F07800" icon={<Trophy className="h-3.5 w-3.5" />} />
                  <MetricCard title="平均得分" value="92.8" unit="分" note="环比 +1.6分" footer={<><span>每条均分</span><strong className="text-emerald-600">第 3 名 / 28人</strong></>} color="#7C19E6" icon={<Award className="h-3.5 w-3.5" />} />
                </div>
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/40 p-3 sm:p-4">
                  <div className="flex flex-col gap-2 border-b border-amber-200/70 pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white"><AlertTriangle className="h-3.5 w-3.5" /></span>
                      <h2 className="text-sm font-bold text-slate-900">平均数据对比</h2>
                    </div>
                    <span className="self-start rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800 sm:self-auto">个人 vs 机构平均 · 张三</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 pt-3 md:grid-cols-3">
                    {[
                      ['上报总数', '个人 11 件', '机构平均 6 件', '+5 件', '#1D58C9'],
                      ['整体通过率', '个人 90.9%', '机构平均 80.0%', '+10.9%', '#08B889'],
                      ['平均得分', '个人 92.8 分', '机构平均 88.6 分', '+4.2 分', '#8656F4'],
                    ].map(([label, mine, average, change, color]) => (
                      <div key={label} className="grid grid-cols-[minmax(0,1fr)_1px_auto] items-center gap-3 rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-[11px]">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-700">{label}</div>
                          <div className="mt-1 text-slate-400">{mine}</div>
                        </div>
                        <div className="h-6 w-px bg-slate-200" />
                        <div className="text-right">
                          <strong style={{ color }}>{change}</strong>
                          <div className="mt-1 text-[10px] text-slate-400">{average}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                  <MetricCard title="累计审核" value="86" unit="件" note="环比 +18.2%" footer={<><span>已办 86 / 通过 78 / 驳回 8</span><strong className="text-blue-600">第 2 名 / 16人</strong></>} color="#1D58C9" icon={<FileCheck2 className="h-3.5 w-3.5" />} />
                  <MetricCard title="审核处理率" value="94.5" unit="%" note="环比 +3.8%" footer={<><span>已办 86 / 待办 5</span><strong className="text-emerald-600">第 1 名 / 16人</strong></>} color="#008E88" icon={<CheckCircle2 className="h-3.5 w-3.5" />} />
                  <MetricCard title="平均审核响应时长" value="6.8" unit="分钟" note="环比 -17.1%" footer={<><span>涵盖全部审核完成耗时</span><strong className="text-purple-600">第 1 名 / 16人</strong></>} color="#8656F4" icon={<Clock3 className="h-3.5 w-3.5" />} />
                </div>
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/40 p-3 sm:p-4">
                  <div className="flex flex-col gap-2 border-b border-amber-200/70 pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white"><AlertTriangle className="h-3.5 w-3.5" /></span>
                      <h2 className="text-sm font-bold text-slate-900">平均数据对比</h2>
                    </div>
                    <span className="self-start rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800 sm:self-auto">个人 vs 机构平均 · 王主任</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 pt-3 md:grid-cols-3">
                    {[
                      ['审核总数', '个人 86 件', '机构平均 54 件', '+32 件', '#08B889'],
                      ['审核处理率', '个人 94.5%', '机构平均 82.1%', '+12.4%', '#1D58C9'],
                      ['审核时长', '个人 6.8 分钟', '机构平均 14.5 分钟', '-7.7 分钟', '#7C19E6'],
                    ].map(([label, mine, average, change, color]) => (
                      <div key={label} className="grid grid-cols-[minmax(0,1fr)_1px_auto] items-center gap-3 rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-[11px]">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-700">{label}</div>
                          <div className="mt-1 text-slate-400">{mine}</div>
                        </div>
                        <div className="h-6 w-px bg-slate-200" />
                        <div className="text-right">
                          <strong style={{ color }}>{change}</strong>
                          <div className="mt-1 text-[10px] text-slate-400">{average}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
            <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-md ${perspective === 'report' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {perspective === 'report' ? <FileText className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{perspective === 'report' ? '上报员考核数据明细表' : '审核员考核数据明细表'}</h2>
                  <p className="text-[10px] text-slate-400">{perspective === 'report' ? '深度展现上报绩效、质量、活跃度与积分能力，支持画像分析' : '深度展现审核处理量、处理率、响应时效与积分能力，支持画像分析'}</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400">统计周期 {periodLabel}</span>
            </div>
            <div className="overflow-x-auto">
              {perspective === 'report' ? (
                <table className="w-full min-w-[980px] text-left text-[11px]">
                  <thead className="border-b border-slate-100 text-slate-400">
                    <tr>
                      <th className="px-2 py-3 text-center">排名</th><th className="px-3 py-3">上报员 / 所属机构</th><th className="px-3 py-3 text-center">累计上报</th><th className="px-3 py-3 text-center">一次性通过率</th><th className="px-3 py-3 text-center">整体通过率</th><th className="px-3 py-3 text-center">综合总分</th><th className="px-3 py-3 text-center">平均得分</th><th className="px-3 py-3 text-center">环比升降</th><th className="px-3 py-3 text-center">等次</th><th className="px-3 py-3 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reporterRecords.map((row) => (
                      <tr key={row.name} className={`transition hover:bg-blue-50/40 ${row.isMine ? 'bg-blue-50/20' : ''}`}>
                        <td className="px-2 py-3 text-center"><span className={`inline-flex h-5 w-5 items-center justify-center rounded-full font-mono font-bold ${rankClass(row.rank)}`}>{row.rank}</span></td>
                        <td className="px-3 py-3"><div className="flex items-center gap-1.5 font-bold text-slate-900">{row.name}{row.isLeader && <span className="rounded bg-amber-100 px-1 py-0.5 text-[9px] text-amber-700">标兵</span>}</div><div className="mt-0.5 text-[10px] text-slate-400">{row.org}</div></td>
                        <td className="px-3 py-3 text-center font-mono"><strong>{row.total} 件</strong><div className="mt-0.5 text-[9px]"><span className="text-emerald-600">采 {row.adopted}</span> / <span className="text-rose-500">驳 {row.rejected}</span> / <span className="text-amber-600">待 {row.pending}</span></div></td>
                        <td className="px-3 py-3 text-center font-mono font-bold text-emerald-600">{row.directRate}%</td>
                        <td className="px-3 py-3 text-center font-mono font-bold text-blue-600">{row.passRate}%</td>
                        <td className="px-3 py-3 text-center font-mono font-bold text-amber-600">{row.score.toLocaleString()} 分</td>
                        <td className="px-3 py-3 text-center font-mono font-bold text-purple-600">{row.avgScore} 分</td>
                        <td className="px-3 py-3 text-center font-mono font-bold text-emerald-600">{row.change}</td>
                        <td className="px-3 py-3 text-center"><span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${gradeClass(row.grade)}`}>{row.grade}</span></td>
                        <td className="px-3 py-3 text-center"><button type="button" onClick={() => openProfile(row)} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-blue-200 px-2 text-[10px] font-semibold text-blue-600" title="查看人员画像">画像分析<ChevronRight className="h-3 w-3" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full min-w-[930px] text-left text-[11px]">
                  <thead className="border-b border-slate-100 text-slate-400">
                    <tr>
                      <th className="px-2 py-3 text-center">排名</th><th className="px-3 py-3">审核员 / 所属机构</th><th className="px-3 py-3 text-center">累计审核 (通过/驳回/待办)</th><th className="px-3 py-3 text-center">审核处理率</th><th className="px-3 py-3 text-center">平均响应耗时</th><th className="px-3 py-3 text-center">综合总分</th><th className="px-3 py-3 text-center">平均得分</th><th className="px-3 py-3 text-center">环比升降</th><th className="px-3 py-3 text-center">等次</th><th className="px-3 py-3 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditorRecords.map((row) => (
                      <tr key={row.name} className={`transition hover:bg-emerald-50/40 ${row.isMine ? 'bg-emerald-50/20' : ''}`}>
                        <td className="px-2 py-3 text-center"><span className={`inline-flex h-5 w-5 items-center justify-center rounded-full font-mono font-bold ${rankClass(row.rank)}`}>{row.rank}</span></td>
                        <td className="px-3 py-3"><div className="flex items-center gap-1.5 font-bold text-slate-900">{row.name}{row.isLeader && <span className="rounded bg-emerald-100 px-1 py-0.5 text-[9px] text-emerald-700">标兵</span>}</div><div className="mt-0.5 text-[10px] text-slate-400">{row.org}</div></td>
                        <td className="px-3 py-3 text-center font-mono"><strong>{row.totalAudited} 件</strong><div className="mt-0.5 text-[9px]"><span className="text-emerald-600">过 {row.passedAudits}</span> / <span className="text-rose-500">驳 {row.rejectedAudits}</span> / <span className="text-amber-600">待 {row.pendingAudits}</span></div></td>
                        <td className="px-3 py-3 text-center font-mono font-bold text-emerald-600">{row.auditProcessRate}%</td>
                        <td className="px-3 py-3 text-center font-mono font-bold text-purple-600">{row.avgResponseMin} 分钟</td>
                        <td className="px-3 py-3 text-center font-mono font-bold text-amber-600">{row.score.toLocaleString()} 分</td>
                        <td className="px-3 py-3 text-center font-mono font-bold text-purple-600">{row.avgScore} 分</td>
                        <td className="px-3 py-3 text-center font-mono font-bold text-emerald-600">{row.change}</td>
                        <td className="px-3 py-3 text-center"><span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${gradeClass(row.grade)}`}>{row.grade}</span></td>
                        <td className="px-3 py-3 text-center"><button type="button" onClick={() => openProfile(row)} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-blue-200 px-2 text-[10px] font-semibold text-blue-600" title="查看人员画像">画像分析<ChevronRight className="h-3 w-3" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </>
      )}

      <EvaluationProfileModal data={selectedProfile} onClose={() => setSelectedProfile(null)} periodText={periodLabel} />
    </div>
  );
};
