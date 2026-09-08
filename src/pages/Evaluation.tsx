import React, { useState, useMemo } from 'react';
import { EvaluationItem, PageId } from '../types';
import {
  RotateCcw,
  Calendar,
  Download,
  Trophy,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
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
  BarChart3,
  ExternalLink,
  Percent,
  Timer,
  Send,
  Sparkles,
  AlertTriangle,
  FileText,
  Flame,
  Check,
  HelpCircle,
  FileEdit,
  CheckSquare,
  Target,
  XCircle,
  ChevronDown,
  Search
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

interface EvaluationProps {
  evaluationList?: EvaluationItem[];
  onNavigate?: (page: PageId) => void;
}

export type EvaluationDimension = 'category' | 'org' | 'person';
export type PersonSubRole = 'submitter' | 'auditor';
export type EvaluationTimeDimension = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface DetailedEvaluationRecord {
  id: string;
  rank: number;
  name: string;
  subTitle: string;
  orgName: string;
  roleType: '上报员' | '审核员' | '部门/分类';
  dimension: EvaluationDimension;
  // 核心指标
  totalReports: number; // 本期累计上报数
  adoptedNum?: number; // 采纳数
  adoptedFirstNum?: number; // 采纳中的首发数
  adoptedRepeatNum?: number; // 采纳中的重复数
  rejectedNum?: number; // 驳回数
  pendingNum?: number; // 待审数
  oncePassNum: number; // 一次性通过分子
  oncePassTotal: number; // 一次性通过分母
  oncePassRate: number; // 一次性通过率 %
  overallPassNum: number; // 整体通过分子
  overallPassTotal: number; // 整体通过分母
  overallPassRate: number; // 整体通过率 %
  auditTotal: number; // 累计审核数
  auditBreakdown?: { passed: number; rejected: number; pending: number };
  auditProcessRate: number; // 审核处理率 %
  avgAuditTimeMin: number; // 平均审核时长(分)
  totalScore: number; // 综合总分
  avgScore: number; // 篇均/单项平均得分
  momDelta: string; // 环比升降 e.g. "+3.2%"
  momType: 'up' | 'down' | 'flat';
  bonusPoints: number; // 加分项
  deductPoints: number; // 扣分项
  grade: '卓越' | '优秀' | '良好' | '合格' | '待提升';
  rankChange: string; // e.g. "↑ 提升 2 位", "↑ 提升 1 位", "持平", "↓ 下降 1 位"
  mainRejectReason?: string; // 主要驳回原因
  auditWarningDiff?: string; // 审核对标 (超出/落后平均数)
  radarData: { subject: string; value: number; fullMark: number }[];
}

const MOCK_EVALUATION_DATA: DetailedEvaluationRecord[] = [
  // 上报员标杆与明细 (与卡片5大指标 100% 呼应)
  {
    id: 'eval-p-1',
    rank: 1,
    name: '张三',
    subTitle: '市委宣传部舆情科 · 首席上报员',
    orgName: '中共台中市委宣传部',
    roleType: '上报员',
    dimension: 'person',
    totalReports: 42,
    adoptedNum: 36,
    adoptedFirstNum: 28,
    adoptedRepeatNum: 8,
    rejectedNum: 3,
    pendingNum: 3,
    oncePassNum: 36,
    oncePassTotal: 42,
    oncePassRate: 85.7,
    overallPassNum: 39,
    overallPassTotal: 42,
    overallPassRate: 92.9,
    auditTotal: 0,
    auditProcessRate: 100,
    avgAuditTimeMin: 0,
    totalScore: 3986.5,
    avgScore: 94.9,
    momDelta: '+12.4%',
    momType: 'up',
    bonusPoints: 120,
    deductPoints: 0,
    grade: '卓越',
    rankChange: '↑ 提升 2 位',
    mainRejectReason: '缺少现场水印佐证(已整改完善)',
    radarData: [
      { subject: '报送质效', value: 96, fullMark: 100 },
      { subject: '一次性通过', value: 86, fullMark: 100 },
      { subject: '响应时效', value: 95, fullMark: 100 },
      { subject: '采纳质量', value: 98, fullMark: 100 },
      { subject: '综合得分', value: 97.5, fullMark: 100 }
    ]
  },
  {
    id: 'eval-p-2',
    rank: 2,
    name: '王五',
    subTitle: '市大数据中心 · 数据分析专员',
    orgName: '台中市大数据中心',
    roleType: '上报员',
    dimension: 'person',
    totalReports: 38,
    adoptedNum: 33,
    adoptedFirstNum: 25,
    adoptedRepeatNum: 8,
    rejectedNum: 3,
    pendingNum: 2,
    oncePassNum: 32,
    oncePassTotal: 38,
    oncePassRate: 84.2,
    overallPassNum: 34,
    overallPassTotal: 38,
    overallPassRate: 89.5,
    auditTotal: 0,
    auditProcessRate: 100,
    avgAuditTimeMin: 0,
    totalScore: 3540.0,
    avgScore: 93.2,
    momDelta: '+8.6%',
    momType: 'up',
    bonusPoints: 90,
    deductPoints: 0,
    grade: '卓越',
    rankChange: '↑ 提升 1 位',
    mainRejectReason: '要素偶有缺少',
    radarData: [
      { subject: '报送质效', value: 94, fullMark: 100 },
      { subject: '一次性通过', value: 84, fullMark: 100 },
      { subject: '响应时效', value: 92, fullMark: 100 },
      { subject: '采纳质量', value: 95, fullMark: 100 },
      { subject: '综合得分', value: 93.2, fullMark: 100 }
    ]
  },
  {
    id: 'eval-p-5',
    rank: 3,
    name: '赵六',
    subTitle: '西坝区网信办 · 基层舆情直报员',
    orgName: '西坝区网信办',
    roleType: '上报员',
    dimension: 'person',
    totalReports: 35,
    adoptedNum: 29,
    adoptedFirstNum: 22,
    adoptedRepeatNum: 7,
    rejectedNum: 4,
    pendingNum: 2,
    oncePassNum: 28,
    oncePassTotal: 35,
    oncePassRate: 80.0,
    overallPassNum: 30,
    overallPassTotal: 35,
    overallPassRate: 85.7,
    auditTotal: 0,
    auditProcessRate: 100,
    avgAuditTimeMin: 0,
    totalScore: 3215.0,
    avgScore: 91.8,
    momDelta: '+5.2%',
    momType: 'up',
    bonusPoints: 60,
    deductPoints: 0,
    grade: '优秀',
    rankChange: '持平',
    mainRejectReason: '现场初核佐证不完整',
    radarData: [
      { subject: '报送质效', value: 90, fullMark: 100 },
      { subject: '一次性通过', value: 80, fullMark: 100 },
      { subject: '响应时效', value: 88, fullMark: 100 },
      { subject: '采纳质量', value: 91, fullMark: 100 },
      { subject: '综合得分', value: 91.8, fullMark: 100 }
    ]
  },
  {
    id: 'eval-p-6',
    rank: 4,
    name: '孙七',
    subTitle: '东湖区融媒体中心 · 信息采编专员',
    orgName: '东湖区委宣传部',
    roleType: '上报员',
    dimension: 'person',
    totalReports: 31,
    adoptedNum: 25,
    adoptedFirstNum: 19,
    adoptedRepeatNum: 6,
    rejectedNum: 4,
    pendingNum: 2,
    oncePassNum: 24,
    oncePassTotal: 31,
    oncePassRate: 77.4,
    overallPassNum: 26,
    overallPassTotal: 31,
    overallPassRate: 83.9,
    auditTotal: 0,
    auditProcessRate: 100,
    avgAuditTimeMin: 0,
    totalScore: 2820.0,
    avgScore: 91.0,
    momDelta: '+3.1%',
    momType: 'up',
    bonusPoints: 45,
    deductPoints: 0,
    grade: '优秀',
    rankChange: '↑ 提升 1 位',
    mainRejectReason: '格式排版不规范',
    radarData: [
      { subject: '报送质效', value: 86, fullMark: 100 },
      { subject: '一次性通过', value: 77, fullMark: 100 },
      { subject: '响应时效', value: 85, fullMark: 100 },
      { subject: '采纳质量', value: 89, fullMark: 100 },
      { subject: '综合得分', value: 91.0, fullMark: 100 }
    ]
  },
  {
    id: 'eval-p-7',
    rank: 5,
    name: '周八',
    subTitle: '市应急管理局 · 应急值班信息员',
    orgName: '台中市应急管理局',
    roleType: '上报员',
    dimension: 'person',
    totalReports: 28,
    adoptedNum: 22,
    adoptedFirstNum: 17,
    adoptedRepeatNum: 5,
    rejectedNum: 4,
    pendingNum: 2,
    oncePassNum: 21,
    oncePassTotal: 28,
    oncePassRate: 75.0,
    overallPassNum: 23,
    overallPassTotal: 28,
    overallPassRate: 82.1,
    auditTotal: 0,
    auditProcessRate: 100,
    avgAuditTimeMin: 0,
    totalScore: 2510.0,
    avgScore: 89.6,
    momDelta: '+1.8%',
    momType: 'up',
    bonusPoints: 30,
    deductPoints: 0,
    grade: '良好',
    rankChange: '↓ 下降 1 位',
    mainRejectReason: '首报未带清晰位置坐标',
    radarData: [
      { subject: '报送质效', value: 82, fullMark: 100 },
      { subject: '一次性通过', value: 75, fullMark: 100 },
      { subject: '响应时效', value: 83, fullMark: 100 },
      { subject: '采纳质量', value: 85, fullMark: 100 },
      { subject: '综合得分', value: 89.6, fullMark: 100 }
    ]
  },
  {
    id: 'eval-p-8',
    rank: 6,
    name: '吴九',
    subTitle: '市交通局综治办 · 交通舆情专报员',
    orgName: '台中市交通运输局',
    roleType: '上报员',
    dimension: 'person',
    totalReports: 24,
    adoptedNum: 18,
    adoptedFirstNum: 14,
    adoptedRepeatNum: 4,
    rejectedNum: 4,
    pendingNum: 2,
    oncePassNum: 17,
    oncePassTotal: 24,
    oncePassRate: 70.8,
    overallPassNum: 19,
    overallPassTotal: 24,
    overallPassRate: 79.2,
    auditTotal: 0,
    auditProcessRate: 100,
    avgAuditTimeMin: 0,
    totalScore: 2100.0,
    avgScore: 87.5,
    momDelta: '-0.5%',
    momType: 'down',
    bonusPoints: 15,
    deductPoints: 5,
    grade: '良好',
    rankChange: '持平',
    mainRejectReason: '交通拥堵处置反馈偶有滞后',
    radarData: [
      { subject: '报送质效', value: 78, fullMark: 100 },
      { subject: '一次性通过', value: 71, fullMark: 100 },
      { subject: '响应时效', value: 80, fullMark: 100 },
      { subject: '采纳质量', value: 82, fullMark: 100 },
      { subject: '综合得分', value: 87.5, fullMark: 100 }
    ]
  },
  {
    id: 'eval-p-9',
    rank: 7,
    name: '郑十',
    subTitle: '南山区网格中心 · 社区巡查员',
    orgName: '南山区网格治理中心',
    roleType: '上报员',
    dimension: 'person',
    totalReports: 20,
    adoptedNum: 14,
    adoptedFirstNum: 11,
    adoptedRepeatNum: 3,
    rejectedNum: 4,
    pendingNum: 2,
    oncePassNum: 13,
    oncePassTotal: 20,
    oncePassRate: 65.0,
    overallPassNum: 15,
    overallPassTotal: 20,
    overallPassRate: 75.0,
    auditTotal: 0,
    auditProcessRate: 100,
    avgAuditTimeMin: 0,
    totalScore: 1720.0,
    avgScore: 86.0,
    momDelta: '-1.2%',
    momType: 'down',
    bonusPoints: 0,
    deductPoints: 10,
    grade: '合格',
    rankChange: '↓ 下降 2 位',
    mainRejectReason: '多次出现重复上报同类事件',
    radarData: [
      { subject: '报送质效', value: 72, fullMark: 100 },
      { subject: '一次性通过', value: 65, fullMark: 100 },
      { subject: '响应时效', value: 76, fullMark: 100 },
      { subject: '采纳质量', value: 78, fullMark: 100 },
      { subject: '综合得分', value: 86.0, fullMark: 100 }
    ]
  },

  // 审核员标杆与明细
  {
    id: 'eval-p-3',
    rank: 1,
    name: '王主任',
    subTitle: '市委宣传部舆情科 · 资深主任审核员',
    orgName: '中共台中市委宣传部',
    roleType: '审核员',
    dimension: 'person',
    totalReports: 0,
    oncePassNum: 0,
    oncePassTotal: 0,
    oncePassRate: 0,
    overallPassNum: 0,
    overallPassTotal: 0,
    overallPassRate: 0,
    auditTotal: 156,
    auditBreakdown: { passed: 142, rejected: 10, pending: 4 },
    auditProcessRate: 97.5,
    avgAuditTimeMin: 6.8,
    totalScore: 15210.0,
    avgScore: 97.5,
    momDelta: '+18.5%',
    momType: 'up',
    bonusPoints: 150,
    deductPoints: 0,
    grade: '卓越',
    rankChange: '↑ 提升 2 位',
    auditWarningDiff: '超出平均审核数 42 件 / 比平均审核耗时快 4.4 分钟',
    radarData: [
      { subject: '审核把关', value: 99, fullMark: 100 },
      { subject: '时效响应', value: 98, fullMark: 100 },
      { subject: '处置处理率', value: 98, fullMark: 100 },
      { subject: '规范研判', value: 97, fullMark: 100 },
      { subject: '综合得分', value: 99.0, fullMark: 100 }
    ]
  },
  {
    id: 'eval-p-4',
    rank: 2,
    name: '李明',
    subTitle: '市网信办复核组 · 复审专员',
    orgName: '台中市网信办',
    roleType: '审核员',
    dimension: 'person',
    totalReports: 0,
    oncePassNum: 0,
    oncePassTotal: 0,
    oncePassRate: 0,
    overallPassNum: 0,
    overallPassTotal: 0,
    overallPassRate: 0,
    auditTotal: 138,
    auditBreakdown: { passed: 124, rejected: 9, pending: 5 },
    auditProcessRate: 96.4,
    avgAuditTimeMin: 7.9,
    totalScore: 13248.0,
    avgScore: 96.0,
    momDelta: '+12.0%',
    momType: 'up',
    bonusPoints: 100,
    deductPoints: 0,
    grade: '卓越',
    rankChange: '↑ 提升 1 位',
    auditWarningDiff: '超出平均数 24 件 / 比平均耗时快 3.3 分钟',
    radarData: [
      { subject: '审核把关', value: 95, fullMark: 100 },
      { subject: '时效响应', value: 94, fullMark: 100 },
      { subject: '处置处理率', value: 96, fullMark: 100 },
      { subject: '规范研判', value: 95, fullMark: 100 },
      { subject: '综合得分', value: 96.0, fullMark: 100 }
    ]
  },
  {
    id: 'eval-p-10',
    rank: 3,
    name: '陈科长',
    subTitle: '市大数据中心 · 质检审核组长',
    orgName: '台中市大数据中心',
    roleType: '审核员',
    dimension: 'person',
    totalReports: 0,
    oncePassNum: 0,
    oncePassTotal: 0,
    oncePassRate: 0,
    overallPassNum: 0,
    overallPassTotal: 0,
    overallPassRate: 0,
    auditTotal: 120,
    auditBreakdown: { passed: 106, rejected: 8, pending: 6 },
    auditProcessRate: 95.0,
    avgAuditTimeMin: 8.8,
    totalScore: 11160.0,
    avgScore: 93.0,
    momDelta: '+6.5%',
    momType: 'up',
    bonusPoints: 60,
    deductPoints: 0,
    grade: '优秀',
    rankChange: '持平',
    auditWarningDiff: '超出平均数 6 件 / 比平均耗时快 2.4 分钟',
    radarData: [
      { subject: '审核把关', value: 92, fullMark: 100 },
      { subject: '时效响应', value: 90, fullMark: 100 },
      { subject: '处置处理率', value: 95, fullMark: 100 },
      { subject: '规范研判', value: 93, fullMark: 100 },
      { subject: '综合得分', value: 93.0, fullMark: 100 }
    ]
  },
  // 机构考核
  {
    id: 'eval-org-1',
    rank: 1,
    name: '中共台中市委宣传部',
    subTitle: '下辖舆情科、宣教科等 6 个直属科室',
    orgName: '中共台中市委宣传部',
    roleType: '部门/分类',
    dimension: 'org',
    totalReports: 148,
    oncePassNum: 132,
    oncePassTotal: 148,
    oncePassRate: 89.2,
    overallPassNum: 142,
    overallPassTotal: 148,
    overallPassRate: 95.9,
    auditTotal: 210,
    auditProcessRate: 98.2,
    avgAuditTimeMin: 7.5,
    totalScore: 98.2,
    avgScore: 95.0,
    momDelta: '+2.8%',
    momType: 'up',
    bonusPoints: 12,
    deductPoints: 0,
    grade: '卓越',
    rankChange: '🥇 标杆第一',
    auditWarningDiff: '全域审核履约率第一，处理无积压',
    radarData: [
      { subject: '报送质效', value: 96, fullMark: 100 },
      { subject: '一次性通过', value: 90, fullMark: 100 },
      { subject: '处置时效', value: 97, fullMark: 100 },
      { subject: '机构协同', value: 98, fullMark: 100 },
      { subject: '综合得分', value: 98.2, fullMark: 100 }
    ]
  },
  {
    id: 'eval-org-2',
    rank: 2,
    name: '台中市网信办',
    subTitle: '全域网安与网络舆情指挥中枢',
    orgName: '台中市网信办',
    roleType: '部门/分类',
    dimension: 'org',
    totalReports: 135,
    oncePassNum: 118,
    oncePassTotal: 135,
    oncePassRate: 87.4,
    overallPassNum: 128,
    overallPassTotal: 135,
    overallPassRate: 94.8,
    auditTotal: 185,
    auditProcessRate: 96.5,
    avgAuditTimeMin: 8.2,
    totalScore: 96.5,
    avgScore: 93.8,
    momDelta: '+1.6%',
    momType: 'up',
    bonusPoints: 9,
    deductPoints: 0,
    grade: '卓越',
    rankChange: '持平',
    auditWarningDiff: '响应速度领先全域 42%',
    radarData: [
      { subject: '报送质效', value: 94, fullMark: 100 },
      { subject: '一次性通过', value: 88, fullMark: 100 },
      { subject: '处置时效', value: 95, fullMark: 100 },
      { subject: '机构协同', value: 96, fullMark: 100 },
      { subject: '综合得分', value: 96.5, fullMark: 100 }
    ]
  },
  {
    id: 'eval-org-3',
    rank: 3,
    name: '西坝区网格化治理中心',
    subTitle: '下辖 12 个街道网格巡查工作站',
    orgName: '西坝区网信办/网格中心',
    roleType: '部门/分类',
    dimension: 'org',
    totalReports: 96,
    oncePassNum: 79,
    oncePassTotal: 96,
    oncePassRate: 82.3,
    overallPassNum: 88,
    overallPassTotal: 96,
    overallPassRate: 91.7,
    auditTotal: 65,
    auditProcessRate: 89.0,
    avgAuditTimeMin: 12.0,
    totalScore: 91.8,
    avgScore: 89.5,
    momDelta: '+0.5%',
    momType: 'up',
    bonusPoints: 4,
    deductPoints: 1,
    grade: '优秀',
    rankChange: '↑ 提升 1 位',
    mainRejectReason: '现场水印或施工图缺失',
    radarData: [
      { subject: '报送质效', value: 88, fullMark: 100 },
      { subject: '一次性通过', value: 83, fullMark: 100 },
      { subject: '处置时效', value: 89, fullMark: 100 },
      { subject: '机构协同', value: 92, fullMark: 100 },
      { subject: '综合得分', value: 91.8, fullMark: 100 }
    ]
  },
  // 分类考核
  {
    id: 'eval-cat-1',
    rank: 1,
    name: '突发网络舆情类',
    subTitle: '涉及突发公共事件、应急抢险、民意预警等',
    orgName: '全域协同',
    roleType: '部门/分类',
    dimension: 'category',
    totalReports: 280,
    oncePassNum: 248,
    oncePassTotal: 280,
    oncePassRate: 88.6,
    overallPassNum: 268,
    overallPassTotal: 280,
    overallPassRate: 95.7,
    auditTotal: 280,
    auditProcessRate: 98.5,
    avgAuditTimeMin: 5.4,
    totalScore: 97.8,
    avgScore: 95.2,
    momDelta: '+3.1%',
    momType: 'up',
    bonusPoints: 10,
    deductPoints: 0,
    grade: '卓越',
    rankChange: '🥇 分类第一',
    auditWarningDiff: '急件平均 5.4 分钟极速办结',
    radarData: [
      { subject: '报送质效', value: 97, fullMark: 100 },
      { subject: '一次性通过', value: 90, fullMark: 100 },
      { subject: '应急时效', value: 99, fullMark: 100 },
      { subject: '采纳价值', value: 98, fullMark: 100 },
      { subject: '综合得分', value: 97.8, fullMark: 100 }
    ]
  },
  {
    id: 'eval-cat-2',
    rank: 2,
    name: '民生诉求关切类',
    subTitle: '交通出行、物价民生、教育医疗等市民集中诉求',
    orgName: '各职能委办局',
    roleType: '部门/分类',
    dimension: 'category',
    totalReports: 340,
    oncePassNum: 286,
    oncePassTotal: 340,
    oncePassRate: 84.1,
    overallPassNum: 312,
    overallPassTotal: 340,
    overallPassRate: 91.8,
    auditTotal: 340,
    auditProcessRate: 94.0,
    avgAuditTimeMin: 9.8,
    totalScore: 93.4,
    avgScore: 91.0,
    momDelta: '+1.4%',
    momType: 'up',
    bonusPoints: 6,
    deductPoints: 0,
    grade: '优秀',
    rankChange: '持平',
    mainRejectReason: '建议措施缺乏部门联动细则',
    radarData: [
      { subject: '报送质效', value: 91, fullMark: 100 },
      { subject: '一次性通过', value: 85, fullMark: 100 },
      { subject: '应急时效', value: 92, fullMark: 100 },
      { subject: '采纳价值', value: 93, fullMark: 100 },
      { subject: '综合得分', value: 93.4, fullMark: 100 }
    ]
  }
];

export const Evaluation: React.FC<EvaluationProps> = ({ onNavigate }) => {
  const [activeDimension, setActiveDimension] = useState<EvaluationDimension>('person');
  const [personSubRole, setPersonSubRole] = useState<PersonSubRole>('submitter');
  const [cardPerspective, setCardPerspective] = useState<'submitter' | 'auditor'>('submitter');
  const [selectedPersonName, setSelectedPersonName] = useState<string>('张三');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('adoptedNum');
  const [selectedRecord, setSelectedRecord] = useState<DetailedEvaluationRecord | null>(null);
  const [timePeriod, setTimePeriod] = useState<EvaluationTimeDimension>('week');
  const [startDate, setStartDate] = useState('2026-08-04');
  const [endDate, setEndDate] = useState('2026-08-11');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleTimePeriodChange = (period: EvaluationTimeDimension) => {
    setTimePeriod(period);
    if (period === 'day') {
      setStartDate('2026-08-11');
      setEndDate('2026-08-11');
    } else if (period === 'week') {
      setStartDate('2026-08-04');
      setEndDate('2026-08-11');
    } else if (period === 'month') {
      setStartDate('2026-08-01');
      setEndDate('2026-08-31');
    } else if (period === 'quarter') {
      setStartDate('2026-07-01');
      setEndDate('2026-09-30');
    } else if (period === 'year') {
      setStartDate('2026-01-01');
      setEndDate('2026-12-31');
    }
  };

  const handleResetFilters = () => {
    setTimePeriod('week');
    setStartDate('2026-08-04');
    setEndDate('2026-08-11');
    setSearchQuery('');
    setSortBy('adoptedNum');
  };

  // Submitter Evaluation Metrics by Time Period
  const submitterMetrics = useMemo(() => {
    switch (timePeriod) {
      case 'day':
        return {
          personName: selectedPersonName === '张三' || selectedPersonName === '王五' || selectedPersonName === '赵六' ? selectedPersonName : '张三',
          totalSubmit: 4,
          totalSubmitMoM: '+33.3%',
          breakdown: { adopted: 2, rejected: 1, pending: 1 },
          adoptedFirst: 2,
          adoptedRepeat: 0,
          submitRank: 2,
          submitRankTotal: 28,
          submitRankMoM: '↑ 提升 1 位',
          oncePassNumerator: 3,
          oncePassDenominator: 4,
          oncePassRate: '75.0%',
          oncePassRateMoM: '+12.5%',
          oncePassRank: 2,
          oncePassRankMoM: '↑ 提升 1 位',
          overallPassNumerator: 3,
          overallPassDenominator: 4,
          overallPassRate: '75.0%',
          overallPassRateMoM: '+8.3%',
          overallPassRank: 2,
          overallPassRankMoM: '↑ 提升 1 位',
          rejectNumerator: 1,
          rejectDenominator: 4,
          rejectRate: '25.0%',
          rejectRateMoM: '-8.3%',
          rejectRank: 2,
          rejectRankMoM: '↓ 优化 1 位',
          totalScore: 364.8,
          totalScoreMoM: '+32.1%',
          totalScoreRank: 2,
          totalScoreRankMoM: '↑ 提升 1 位',
          avgScore: 91.2,
          avgScoreMoM: '+1.7%',
          avgScoreRank: 3,
          avgScoreRankMoM: '↑ 提升 1 位',
          warnings: {
            submitTotalDiff: { personal: '4 件', orgAvg: '2 件', value: '+2 件', percentage: '+100%', text: '超出机构平均日均报送量 2 件 (机构平均 2 件)' },
            passRateDiff: { personal: '75.0%', orgAvg: '66.7%', value: '+8.3%', percentage: '+8.3%', text: '高于机构平均整体通过率 8.3 个百分点 (机构平均 66.7%)' },
            rejectRateDiff: { personal: '25.0%', orgAvg: '33.3%', value: '-8.3%', percentage: '-8.3%', text: '优于机构平均日均驳回率 8.3 个百分点 (机构平均 33.3%)' },
            scoreDiff: { personal: '91.2 分', orgAvg: '87.7 分', value: '+3.5 分', percentage: '+4.0%', text: '优于机构平均得分 3.5 分 (机构平均 87.7 分)' }
          }
        };
      case 'week':
      case 'custom':
        return {
          personName: selectedPersonName === '张三' || selectedPersonName === '王五' || selectedPersonName === '赵六' ? selectedPersonName : '张三',
          totalSubmit: 11,
          totalSubmitMoM: '+15.8%',
          breakdown: { adopted: 9, rejected: 1, pending: 1 },
          adoptedFirst: 7,
          adoptedRepeat: 2,
          submitRank: 3,
          submitRankTotal: 28,
          submitRankMoM: '↑ 提升 1 位',
          oncePassNumerator: 9,
          oncePassDenominator: 11,
          oncePassRate: '81.8%',
          oncePassRateMoM: '+6.5%',
          oncePassRank: 2,
          oncePassRankMoM: '↑ 提升 1 位',
          overallPassNumerator: 10,
          overallPassDenominator: 11,
          overallPassRate: '90.9%',
          overallPassRateMoM: '+4.2%',
          overallPassRank: 1,
          overallPassRankMoM: '↑ 提升 2 位',
          rejectNumerator: 2,
          rejectDenominator: 11,
          rejectRate: '18.2%',
          rejectRateMoM: '-4.5%',
          rejectRank: 2,
          rejectRankMoM: '↓ 优化 1 位',
          totalScore: 1020.8,
          totalScoreMoM: '+22.1%',
          totalScoreRank: 2,
          totalScoreRankMoM: '↑ 提升 1 位',
          avgScore: 92.8,
          avgScoreMoM: '+1.8%',
          avgScoreRank: 3,
          avgScoreRankMoM: '↑ 提升 1 位',
          warnings: {
            submitTotalDiff: { personal: '9 件', orgAvg: '5 件', value: '+4 件', percentage: '+80.0%', text: '大幅超出机构采纳平均数 4 件 (机构平均 5 件)' },
            passRateDiff: { personal: '90.9%', orgAvg: '80.0%', value: '+10.9%', percentage: '+10.9%', text: '高出机构平均整体通过率 10.9 个百分点 (机构平均 80.0%)' },
            rejectRateDiff: { personal: '18.2%', orgAvg: '22.7%', value: '-4.5%', percentage: '-4.5%', text: '优于机构平均驳回率 4.5 个百分点 (机构平均 22.7%)' },
            scoreDiff: { personal: '92.8 分', orgAvg: '88.6 分', value: '+4.2 分', percentage: '+4.7%', text: '优于机构平均得分 4.2 分 (机构平均 88.6 分)' }
          }
        };
      case 'year':
        return {
          personName: selectedPersonName === '张三' || selectedPersonName === '王五' || selectedPersonName === '赵六' ? selectedPersonName : '张三',
          totalSubmit: 512,
          totalSubmitMoM: '+28.4%',
          breakdown: { adopted: 468, rejected: 32, pending: 12 },
          adoptedFirst: 372,
          adoptedRepeat: 96,
          submitRank: 1,
          submitRankTotal: 28,
          submitRankMoM: '↑ 提升 2 位',
          oncePassNumerator: 442,
          oncePassDenominator: 512,
          oncePassRate: '86.3%',
          oncePassRateMoM: '+6.5%',
          oncePassRank: 1,
          oncePassRankMoM: '↑ 提升 1 位',
          overallPassNumerator: 478,
          overallPassDenominator: 512,
          overallPassRate: '93.4%',
          overallPassRateMoM: '+4.2%',
          overallPassRank: 1,
          overallPassRankMoM: '↑ 提升 1 位',
          rejectNumerator: 32,
          rejectDenominator: 512,
          rejectRate: '6.3%',
          rejectRateMoM: '-3.8%',
          rejectRank: 1,
          rejectRankMoM: '↓ 优化 2 位',
          totalScore: 48920.0,
          totalScoreMoM: '+26.8%',
          totalScoreRank: 1,
          totalScoreRankMoM: '↑ 提升 2 位',
          avgScore: 95.5,
          avgScoreMoM: '+1.9%',
          avgScoreRank: 1,
          avgScoreRankMoM: '↑ 提升 1 位',
          warnings: {
            submitTotalDiff: { personal: '512 件', orgAvg: '286 件', value: '+226 件', percentage: '+79.0%', text: '超出机构年均报送量 226 件 (机构年均 286 件)' },
            passRateDiff: { personal: '93.4%', orgAvg: '81.2%', value: '+12.2%', percentage: '+12.2%', text: '高于机构年均整体通过率 12.2 个百分点 (机构年均 81.2%)' },
            rejectRateDiff: { personal: '6.3%', orgAvg: '18.8%', value: '-12.5%', percentage: '-12.5%', text: '大幅优于机构年均驳回率 12.5 个百分点 (机构年均 18.8%)' },
            scoreDiff: { personal: '95.5 分', orgAvg: '87.4 分', value: '+8.1 分', percentage: '+9.3%', text: '优于机构年均得分 8.1 分 (机构年均 87.4 分)' }
          }
        };
      case 'quarter':
        return {
          personName: selectedPersonName === '张三' || selectedPersonName === '王五' || selectedPersonName === '赵六' ? selectedPersonName : '张三',
          totalSubmit: 128,
          totalSubmitMoM: '+18.5%',
          breakdown: { adopted: 116, rejected: 8, pending: 4 },
          adoptedFirst: 92,
          adoptedRepeat: 24,
          submitRank: 1,
          submitRankTotal: 28,
          submitRankMoM: '↑ 提升 2 位',
          oncePassNumerator: 109,
          oncePassDenominator: 128,
          oncePassRate: '85.2%',
          oncePassRateMoM: '+5.1%',
          oncePassRank: 1,
          oncePassRankMoM: '↑ 提升 1 位',
          overallPassNumerator: 119,
          overallPassDenominator: 128,
          overallPassRate: '93.0%',
          overallPassRateMoM: '+3.8%',
          overallPassRank: 1,
          overallPassRankMoM: '↑ 提升 1 位',
          rejectNumerator: 8,
          rejectDenominator: 128,
          rejectRate: '6.3%',
          rejectRateMoM: '-2.5%',
          rejectRank: 1,
          rejectRankMoM: '↓ 优化 1 位',
          totalScore: 12224.0,
          totalScoreMoM: '+16.5%',
          totalScoreRank: 1,
          totalScoreRankMoM: '↑ 提升 2 位',
          avgScore: 95.5,
          avgScoreMoM: '+1.7%',
          avgScoreRank: 1,
          avgScoreRankMoM: '↑ 提升 1 位',
          warnings: {
            submitTotalDiff: { personal: '128 件', orgAvg: '72 件', value: '+56 件', percentage: '+77.8%', text: '超出机构季均报送量 56 件 (机构季均 72 件)' },
            passRateDiff: { personal: '93.0%', orgAvg: '80.5%', value: '+12.5%', percentage: '+12.5%', text: '高于机构季均整体通过率 12.5 个百分点 (机构季均 80.5%)' },
            rejectRateDiff: { personal: '6.3%', orgAvg: '19.5%', value: '-13.2%', percentage: '-13.2%', text: '大幅优于机构季均驳回率 13.2 个百分点 (机构季均 19.5%)' },
            scoreDiff: { personal: '95.5 分', orgAvg: '87.1 分', value: '+8.4 分', percentage: '+9.6%', text: '优于机构季均得分 8.4 分 (机构季均 87.1 分)' }
          }
        };
      case 'month':
      default:
        return {
          personName: selectedPersonName === '张三' || selectedPersonName === '王五' || selectedPersonName === '赵六' ? selectedPersonName : '张三',
          totalSubmit: 42,
          totalSubmitMoM: '+16.7%',
          breakdown: { adopted: 36, rejected: 3, pending: 3 },
          adoptedFirst: 28,
          adoptedRepeat: 8,
          submitRank: 1,
          submitRankTotal: 28,
          submitRankMoM: '↑ 提升 2 位',
          oncePassNumerator: 36,
          oncePassDenominator: 42,
          oncePassRate: '85.7%',
          oncePassRateMoM: '+5.7%',
          oncePassRank: 1,
          oncePassRankMoM: '↑ 提升 1 位',
          overallPassNumerator: 39,
          overallPassDenominator: 42,
          overallPassRate: '92.9%',
          overallPassRateMoM: '+4.8%',
          overallPassRank: 1,
          overallPassRankMoM: '↑ 提升 1 位',
          rejectNumerator: 3,
          rejectDenominator: 42,
          rejectRate: '7.1%',
          rejectRateMoM: '-3.2%',
          rejectRank: 1,
          rejectRankMoM: '↓ 优化 1 位',
          totalScore: 3986.5,
          totalScoreMoM: '+12.4%',
          totalScoreRank: 1,
          totalScoreRankMoM: '↑ 提升 2 位',
          avgScore: 94.9,
          avgScoreMoM: '+2.3%',
          avgScoreRank: 1,
          avgScoreRankMoM: '↑ 提升 1 位',
          warnings: {
            submitTotalDiff: { personal: '42 件', orgAvg: '24 件', value: '+18 件', percentage: '+75.0%', text: '超出机构平均月均报送量 18 件 (机构平均 24 件)' },
            passRateDiff: { personal: '92.9%', orgAvg: '78.5%', value: '+14.4%', percentage: '+14.4%', text: '高于机构平均整体通过率 14.4 个百分点 (机构平均 78.5%)' },
            rejectRateDiff: { personal: '7.1%', orgAvg: '21.5%', value: '-14.4%', percentage: '-14.4%', text: '大幅优于机构平均月均驳回率 14.4 个百分点 (机构平均 21.5%)' },
            scoreDiff: { personal: '94.9 分', orgAvg: '86.2 分', value: '+8.7 分', percentage: '+10.1%', text: '优于机构平均得分 8.7 分 (机构平均 86.2 分)' }
          }
        };
    }
  }, [timePeriod, selectedPersonName]);

  // Auditor Evaluation Metrics by Time Period
  const auditorMetrics = useMemo(() => {
    switch (timePeriod) {
      case 'day':
        return {
          personName: selectedPersonName === '王主任' || selectedPersonName === '李明' || selectedPersonName === '孙七' ? selectedPersonName : '王主任',
          auditTotal: 12,
          auditTotalMoM: '+20.0%',
          auditBreakdown: { passed: 11, rejected: 1 },
          auditPendingCount: 3,
          auditRank: 2,
          auditRankTotal: 16,
          auditRankMoM: '↑ 提升 1 位',
          processRateNumerator: 12,
          processRateDenominator: 15,
          processRate: '80.0%',
          processRateMoM: '+5.0%',
          processRateRank: 2,
          processRateRankMoM: '↑ 提升 1 位',
          avgTimeMin: 7.2,
          avgTimeMoM: '-10.0%',
          avgTimeRank: 1,
          avgTimeRankMoM: '↑ 提升 1 位',
          warnings: {
            auditTotalDiff: { personal: '12 件', orgAvg: '8 件', value: '+4 件', percentage: '+50.0%', text: '超出全市审核员平均数 4 件 (机构平均 8 件)' },
            processRateDiff: { personal: '80.0%', orgAvg: '71.5%', value: '+8.5%', percentage: '+8.5%', text: '超出平均处理率 8.5 个百分点 (机构平均 71.5%)' },
            avgTimeDiff: { personal: '7.2 分钟', orgAvg: '12.4 分钟', value: '-5.2 分钟', percentage: '-41.9%', text: '审核耗时比机构平均用时(12.4分)快 5.2 分钟' }
          }
        };
      case 'week':
      case 'custom':
        return {
          personName: selectedPersonName === '王主任' || selectedPersonName === '李明' || selectedPersonName === '孙七' ? selectedPersonName : '王主任',
          auditTotal: 86,
          auditTotalMoM: '+18.2%',
          auditBreakdown: { passed: 78, rejected: 8 },
          auditPendingCount: 5,
          auditRank: 2,
          auditRankTotal: 16,
          auditRankMoM: '↑ 提升 1 位',
          processRateNumerator: 86,
          processRateDenominator: 91,
          processRate: '94.5%',
          processRateMoM: '+3.8%',
          processRateRank: 1,
          processRateRankMoM: '↑ 提升 1 位',
          avgTimeMin: 6.8,
          avgTimeMoM: '-17.1%',
          avgTimeRank: 1,
          avgTimeRankMoM: '↑ 提升 1 位',
          warnings: {
            auditTotalDiff: { personal: '86 件', orgAvg: '54 件', value: '+32 件', percentage: '+59.3%', text: '大幅超出机构平均数 32 件 (机构平均 54 件)' },
            processRateDiff: { personal: '94.5%', orgAvg: '82.1%', value: '+12.4%', percentage: '+12.4%', text: '高出机构平均处理率 12.4 个百分点 (机构平均 82.1%)' },
            avgTimeDiff: { personal: '6.8 分钟', orgAvg: '14.5 分钟', value: '-7.7 分钟', percentage: '-53.1%', text: '优于机构平均审核用时 7.7 分钟 (机构平均 14.5 分钟)' }
          }
        };
      case 'year':
        return {
          personName: selectedPersonName === '王主任' || selectedPersonName === '李明' || selectedPersonName === '孙七' ? selectedPersonName : '王主任',
          auditTotal: 1840,
          auditTotalMoM: '+22.5%',
          auditBreakdown: { passed: 1720, rejected: 120 },
          auditPendingCount: 8,
          auditRank: 1,
          auditRankTotal: 16,
          auditRankMoM: '↑ 提升 2 位',
          processRateNumerator: 1840,
          processRateDenominator: 1848,
          processRate: '99.6%',
          processRateMoM: '+1.5%',
          processRateRank: 1,
          processRateRankMoM: '↑ 提升 1 位',
          avgTimeMin: 6.2,
          avgTimeMoM: '-24.0%',
          avgTimeRank: 1,
          avgTimeRankMoM: '↑ 提升 1 位',
          warnings: {
            auditTotalDiff: { personal: '1,840 件', orgAvg: '1,120 件', value: '+720 件', percentage: '+64.3%', text: '超出全市审核员年均总数 720 件 (机构平均 1,120 件)' },
            processRateDiff: { personal: '99.6%', orgAvg: '89.5%', value: '+10.1%', percentage: '+10.1%', text: '超出平均处理率 10.1 个百分点 (机构平均 89.5%)' },
            avgTimeDiff: { personal: '6.2 分钟', orgAvg: '15.2 分钟', value: '-9.0 分钟', percentage: '-59.2%', text: '审核耗时比机构平均用时(15.2分)快 9.0 分钟' }
          }
        };
      case 'quarter':
        return {
          personName: selectedPersonName === '王主任' || selectedPersonName === '李明' || selectedPersonName === '孙七' ? selectedPersonName : '王主任',
          auditTotal: 468,
          auditTotalMoM: '+16.2%',
          auditBreakdown: { passed: 436, rejected: 32 },
          auditPendingCount: 6,
          auditRank: 1,
          auditRankTotal: 16,
          auditRankMoM: '↑ 提升 2 位',
          processRateNumerator: 468,
          processRateDenominator: 474,
          processRate: '98.7%',
          processRateMoM: '+2.4%',
          processRateRank: 1,
          processRateRankMoM: '↑ 提升 1 位',
          avgTimeMin: 6.5,
          avgTimeMoM: '-21.0%',
          avgTimeRank: 1,
          avgTimeRankMoM: '↑ 提升 1 位',
          warnings: {
            auditTotalDiff: { personal: '468 件', orgAvg: '294 件', value: '+174 件', percentage: '+59.2%', text: '超出全市审核员季均总数 174 件 (机构平均 294 件)' },
            processRateDiff: { personal: '98.7%', orgAvg: '88.0%', value: '+10.7%', percentage: '+10.7%', text: '超出平均处理率 10.7 个百分点 (机构平均 88.0%)' },
            avgTimeDiff: { personal: '6.5 分钟', orgAvg: '14.8 分钟', value: '-8.3 分钟', percentage: '-56.1%', text: '审核耗时比机构平均用时(14.8分)快 8.3 分钟' }
          }
        };
      case 'month':
      default:
        return {
          personName: selectedPersonName === '王主任' || selectedPersonName === '李明' || selectedPersonName === '孙七' ? selectedPersonName : '王主任',
          auditTotal: 156,
          auditTotalMoM: '+14.7%',
          auditBreakdown: { passed: 142, rejected: 14 },
          auditPendingCount: 4,
          auditRank: 1,
          auditRankTotal: 16,
          auditRankMoM: '↑ 提升 2 位',
          processRateNumerator: 156,
          processRateDenominator: 160,
          processRate: '97.5%',
          processRateMoM: '+3.2%',
          processRateRank: 1,
          processRateRankMoM: '↑ 提升 1 位',
          avgTimeMin: 6.8,
          avgTimeMoM: '-18.5%',
          avgTimeRank: 1,
          avgTimeRankMoM: '↑ 提升 1 位',
          warnings: {
            auditTotalDiff: { personal: '156 件', orgAvg: '98 件', value: '+58 件', percentage: '+59.2%', text: '超出全市审核员平均数 58 件 (机构平均 98 件)' },
            processRateDiff: { personal: '97.5%', orgAvg: '86.0%', value: '+11.5%', percentage: '+11.5%', text: '超出平均处理率 11.5 个百分点 (机构平均 86.0%)' },
            avgTimeDiff: { personal: '6.8 分钟', orgAvg: '14.5 分钟', value: '-7.7 分钟', percentage: '-53.1%', text: '审核耗时比机构平均用时(14.5分)快 7.7 分钟' }
          }
        };
    }
  }, [timePeriod, selectedPersonName]);

  // Active perspective for metric cards
  const effectiveCardPerspective = useMemo(() => {
    if (personSubRole === 'submitter') return 'submitter';
    if (personSubRole === 'auditor') return 'auditor';
    return cardPerspective;
  }, [personSubRole, cardPerspective]);

  // Filter list
  const filteredList = useMemo(() => {
    return MOCK_EVALUATION_DATA.filter((item) => {
      // Dimension
      if (item.dimension !== activeDimension) return false;
      // Person Sub Role
      if (activeDimension === 'person') {
        if (personSubRole === 'submitter' && item.roleType !== '上报员') return false;
        if (personSubRole === 'auditor' && item.roleType !== '审核员') return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.orgName.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'totalReports') return b.totalReports - a.totalReports;
      if (sortBy === 'adoptedNum') {
        const getAdopted = (item: DetailedEvaluationRecord) => item.adoptedNum ?? item.oncePassNum ?? 0;
        return getAdopted(b) - getAdopted(a);
      }
      if (sortBy === 'adoptedFirstNum') {
        const getAdoptedFirst = (item: DetailedEvaluationRecord) => {
          if (item.adoptedFirstNum !== undefined) return item.adoptedFirstNum;
          const adopted = item.adoptedNum ?? item.oncePassNum ?? 0;
          return Math.round(adopted * 0.78);
        };
        return getAdoptedFirst(b) - getAdoptedFirst(a);
      }
      if (sortBy === 'oncePassRate') return b.oncePassRate - a.oncePassRate;
      if (sortBy === 'overallPassRate') return b.overallPassRate - a.overallPassRate;
      if (sortBy === 'totalScore') return b.totalScore - a.totalScore;
      if (sortBy === 'avgScore') return b.avgScore - a.avgScore;
      if (sortBy === 'auditTotal') return b.auditTotal - a.auditTotal;
      if (sortBy === 'auditProcessRate') return b.auditProcessRate - a.auditProcessRate;
      if (sortBy === 'avgAuditTimeMin') return a.avgAuditTimeMin - b.avgAuditTimeMin;
      return a.rank - b.rank;
    });
  }, [activeDimension, personSubRole, searchQuery, sortBy]);

  // Podium top 3
  const topThree = useMemo(() => {
    return filteredList.slice(0, 3);
  }, [filteredList]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-[#1E5ABB] text-white px-4 py-2.5 rounded-lg shadow-lg border border-blue-400/30 flex items-center space-x-2 text-xs animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header & Dimension Selector Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-2xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">绩效考核与对标评价中心</h2>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => showToast('已成功导出【2026年度多维量化考核与荣誉档案.xlsx】！')}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 shadow-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>导出考核台账</span>
            </button>
          </div>
        </div>

        {/* Filter Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          {/* Person Sub-role tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
            <button
              onClick={() => {
                setPersonSubRole('submitter');
                setCardPerspective('submitter');
              }}
              className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                personSubRole === 'submitter' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>上报员榜</span>
            </button>
            <button
              onClick={() => {
                setPersonSubRole('auditor');
                setCardPerspective('auditor');
              }}
              className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                personSubRole === 'auditor' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>审核员榜</span>
            </button>
          </div>

          {/* Sub Filters & Search */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Time Period */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 font-bold">
              <span className="text-gray-400 px-1.5 text-[11px] flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>考核周期:</span>
              </span>
              {(['day', 'week', 'month', 'quarter', 'year', 'custom'] as EvaluationTimeDimension[]).map((period) => (
                <button
                  key={period}
                  onClick={() => handleTimePeriodChange(period)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    timePeriod === period
                      ? 'bg-white text-[#1E5ABB] shadow-2xs'
                      : 'text-gray-600 hover:text-blue-700'
                  }`}
                >
                  {period === 'day' ? '日(今日)' : period === 'week' ? '周(本周)' : period === 'month' ? '月(本月)' : period === 'quarter' ? '季度' : period === 'year' ? '年度' : '自定义'}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-1 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setTimePeriod('custom');
                }}
                className="w-24 focus:outline-none text-gray-700 font-mono text-[11px]"
              />
              <span className="text-gray-400">至</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setTimePeriod('custom');
                }}
                className="w-24 focus:outline-none text-gray-700 font-mono text-[11px]"
              />
            </div>

            <button
              onClick={handleResetFilters}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-gray-600 font-bold rounded-lg border border-gray-200 cursor-pointer transition-colors"
              title="重置筛选"
              aria-label="重置筛选"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>



      {/* ========================================================================= */}
      {/* 3. 考评对象量化指标统计与机构效能对比 (上报员 / 审核员 统计卡片与行业对标) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* 3.1 上报员考评卡片组 */}
        {effectiveCardPerspective === 'submitter' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
            {/* 模块一：考评效能指标 */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-2xs">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">考评效能指标</h3>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                {submitterMetrics.personName}
              </span>
            </div>

            {/* 5 张核心指标卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {/* 卡片 1: 累计采纳数 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-all group">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="font-semibold text-slate-600 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>累计采纳数</span>
                    </span>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-bold flex items-center">
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      <span>环比 {submitterMetrics.totalSubmitMoM}</span>
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
                      {submitterMetrics.breakdown.adopted}
                      <span className="text-xs font-normal text-slate-400 ml-1">件</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center space-x-1">
                      <span className="text-emerald-700 font-semibold">首发 {(submitterMetrics as any).adoptedFirst ?? Math.round(submitterMetrics.breakdown.adopted * 0.78)}</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-slate-600 font-medium">重复 {(submitterMetrics as any).adoptedRepeat ?? (submitterMetrics.breakdown.adopted - Math.round(submitterMetrics.breakdown.adopted * 0.78))}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">
                    第 <b className="text-emerald-700 font-mono font-bold">{submitterMetrics.submitRank}</b> 名 <span className="text-slate-400 font-normal">/ {submitterMetrics.submitRankTotal}人</span>
                  </span>
                  <span className="text-emerald-600 font-medium">{submitterMetrics.submitRankMoM}</span>
                </div>
              </div>

              {/* 卡片 2: 一次性通过率 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-all group">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="font-semibold text-slate-600 flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>一次性通过率</span>
                    </span>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-bold">
                      环比 {submitterMetrics.overallPassRateMoM}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
                      {submitterMetrics.oncePassRate}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      通过 <b className="text-emerald-700 font-mono">{submitterMetrics.oncePassNumerator}/{submitterMetrics.oncePassDenominator}</b> 件
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">
                    第 <b className="text-emerald-700 font-mono font-bold">{submitterMetrics.oncePassRank}</b> 名 <span className="text-slate-400 font-normal">/ {submitterMetrics.submitRankTotal}人</span>
                  </span>
                  <span className="text-emerald-600 font-medium">{submitterMetrics.oncePassRankMoM}</span>
                </div>
              </div>

              {/* 卡片 3: 整体通过率 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-all group">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="font-semibold text-slate-600 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>整体通过率</span>
                    </span>
                    <span className="text-[11px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md font-bold">
                      环比 {submitterMetrics.overallPassRateMoM}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="text-2xl font-black text-teal-700 font-mono tracking-tight">
                      {submitterMetrics.overallPassRate}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      通过 <b className="text-teal-700 font-mono">{submitterMetrics.overallPassNumerator}/{submitterMetrics.overallPassDenominator}</b> 件
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">
                    第 <b className="text-teal-700 font-mono font-bold">{submitterMetrics.overallPassRank}</b> 名 <span className="text-slate-400 font-normal">/ {submitterMetrics.submitRankTotal}人</span>
                  </span>
                  <span className="text-teal-600 font-medium">{submitterMetrics.overallPassRankMoM}</span>
                </div>
              </div>

              {/* 卡片 4: 综合得分 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-all group">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="font-semibold text-slate-600 flex items-center space-x-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>综合得分</span>
                    </span>
                    <span className="text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md font-bold">
                      环比 {submitterMetrics.totalScoreMoM}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="text-2xl font-black text-amber-600 font-mono tracking-tight">
                      {typeof submitterMetrics.totalScore === 'number' ? submitterMetrics.totalScore.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : submitterMetrics.totalScore}
                      <span className="text-xs font-normal text-slate-400 ml-1">分</span>
                    </div>
                    <span className="text-[11px] text-amber-700 font-medium bg-amber-50/70 px-1.5 py-0.5 rounded">
                      累加得分
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">
                    第 <b className="text-amber-700 font-mono font-bold">{submitterMetrics.totalScoreRank}</b> 名 <span className="text-slate-400 font-normal">/ {submitterMetrics.submitRankTotal}人</span>
                  </span>
                  <span className="text-amber-600 font-medium">{submitterMetrics.totalScoreRankMoM}</span>
                </div>
              </div>

              {/* 卡片 5: 平均得分 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-all group">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="font-semibold text-slate-600 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>平均得分</span>
                    </span>
                    <span className="text-[11px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md font-bold">
                      环比 {submitterMetrics.avgScoreMoM}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="text-2xl font-black text-purple-600 font-mono tracking-tight">
                      {submitterMetrics.avgScore}
                      <span className="text-xs font-normal text-slate-400 ml-1">分</span>
                    </div>
                    <span className="text-[11px] text-purple-700 font-medium bg-purple-50/70 px-1.5 py-0.5 rounded">
                      每条均分
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">
                    第 <b className="text-purple-700 font-mono font-bold">{submitterMetrics.avgScoreRank}</b> 名 <span className="text-slate-400 font-normal">/ {submitterMetrics.submitRankTotal}人</span>
                  </span>
                  <span className="text-purple-600 font-medium">{submitterMetrics.avgScoreRankMoM}</span>
                </div>
              </div>
            </div>

            {/* 平均效能对比 (简化内嵌) */}
            <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3.5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-amber-500 text-white rounded-lg shadow-xs">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-extrabold text-gray-900">平均效能对比</h3>
                </div>
                <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full shrink-0">
                  个人 vs 机构平均 · {submitterMetrics.personName}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="bg-white/80 rounded-lg px-3 py-2 border border-amber-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-700">累计采纳数</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      {submitterMetrics.warnings.submitTotalDiff.value}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-center justify-between gap-2">
                    <span>个人 <b className="text-emerald-700">{submitterMetrics.warnings.submitTotalDiff.personal}</b></span>
                    <span className="text-gray-300">|</span>
                    <span>机构平均 <b className="text-gray-700">{submitterMetrics.warnings.submitTotalDiff.orgAvg}</b></span>
                  </div>
                </div>
                <div className="bg-white/80 rounded-lg px-3 py-2 border border-amber-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-700">整体通过率</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                      {submitterMetrics.warnings.passRateDiff.value}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-center justify-between gap-2">
                    <span>个人 <b className="text-blue-700">{submitterMetrics.warnings.passRateDiff.personal}</b></span>
                    <span className="text-gray-300">|</span>
                    <span>机构平均 <b className="text-gray-700">{submitterMetrics.warnings.passRateDiff.orgAvg}</b></span>
                  </div>
                </div>
                <div className="bg-white/80 rounded-lg px-3 py-2 border border-amber-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-700">平均得分</span>
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md">
                      {submitterMetrics.warnings.scoreDiff.value}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-center justify-between gap-2">
                    <span>个人 <b className="text-purple-700">{submitterMetrics.warnings.scoreDiff.personal}</b></span>
                    <span className="text-gray-300">|</span>
                    <span>机构平均 <b className="text-gray-700">{submitterMetrics.warnings.scoreDiff.orgAvg}</b></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3.2 审核员考评卡片组 */}
        {effectiveCardPerspective === 'auditor' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
            {/* 模块一：考评效能指标 */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-2xs">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">考评效能指标</h3>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                {auditorMetrics.personName}
              </span>
            </div>

            {/* 3 张核心指标卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {/* 卡片 1: 累计审核数 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-all group">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="font-semibold text-slate-600 flex items-center space-x-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>累计审核数</span>
                    </span>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-bold flex items-center">
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      <span>环比 {auditorMetrics.auditTotalMoM}</span>
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                      {auditorMetrics.auditTotal}
                      <span className="text-xs font-normal text-slate-400 ml-1">件</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-1.5">
                      <span className="text-blue-600 font-semibold">已办 {auditorMetrics.auditTotal}</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-emerald-600 font-semibold">通过 {auditorMetrics.auditBreakdown.passed}</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-rose-500 font-semibold">驳回 {auditorMetrics.auditBreakdown.rejected}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">
                    第 <b className="text-blue-700 font-mono font-bold">{auditorMetrics.auditRank}</b> 名 <span className="text-slate-400 font-normal">/ {auditorMetrics.auditRankTotal}人</span>
                  </span>
                  <span className="text-blue-600 font-medium">{auditorMetrics.auditRankMoM}</span>
                </div>
              </div>

              {/* 卡片 2: 审核处理率 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-all group">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="font-semibold text-slate-600 flex items-center space-x-1.5">
                      <Percent className="w-3.5 h-3.5 text-teal-600" />
                      <span>审核处理率</span>
                    </span>
                    <span className="text-[11px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md font-bold">
                      环比 {auditorMetrics.processRateMoM}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="text-2xl font-black text-teal-700 font-mono tracking-tight">
                      {auditorMetrics.processRate}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      <span className="text-teal-700 font-semibold">已办 {auditorMetrics.processRateNumerator}</span>
                      <span className="mx-1.5 text-slate-300">/</span>
                      <span className="text-slate-600 font-semibold">上报 {auditorMetrics.processRateDenominator}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">
                    第 <b className="text-teal-700 font-mono font-bold">{auditorMetrics.processRateRank}</b> 名 <span className="text-slate-400 font-normal">/ {auditorMetrics.auditRankTotal}人</span>
                  </span>
                  <span className="text-teal-600 font-medium">{auditorMetrics.processRateRankMoM}</span>
                </div>
              </div>

              {/* 卡片 3: 平均审核响应时长 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-all group">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="font-semibold text-slate-600 flex items-center space-x-1.5" title="计算口径：指从系统派发任务至审核员完成审核结论所耗费时长的平均值">
                      <Timer className="w-3.5 h-3.5 text-purple-600" />
                      <span>平均审核响应时长</span>
                      <Info className="w-3 h-3 text-slate-400 group-hover:text-purple-600 transition-colors cursor-help" />
                    </span>
                    <span className="text-[11px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md font-bold">
                      环比 {auditorMetrics.avgTimeMoM}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="text-2xl font-black text-purple-600 font-mono tracking-tight">
                      {auditorMetrics.avgTimeMin}
                      <span className="text-xs font-normal text-slate-400 ml-1">分钟</span>
                    </div>
                    <span
                      className="text-[11px] text-purple-700 bg-purple-50/80 px-2 py-0.5 rounded-md font-medium flex items-center gap-1 border border-purple-100/80"
                      title="从工单派发至审核员完成审核结论的平均耗时"
                    >
                      <span>派发至审核完成耗时</span>
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">
                    第 <b className="text-purple-700 font-mono font-bold">{auditorMetrics.avgTimeRank}</b> 名 <span className="text-slate-400 font-normal">/ {auditorMetrics.auditRankTotal}人</span>
                  </span>
                  <span className="text-purple-600 font-medium">{auditorMetrics.avgTimeRankMoM}</span>
                </div>
              </div>
            </div>

            {/* 平均效能对比 (简化内嵌) */}
            <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3.5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-amber-500 text-white rounded-lg shadow-xs">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-extrabold text-gray-900">平均效能对比</h3>
                </div>
                <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full shrink-0">
                  个人 vs 机构平均 · {auditorMetrics.personName}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="bg-white/80 rounded-lg px-3 py-2 border border-amber-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-700">累计审核数</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      {auditorMetrics.warnings.auditTotalDiff.value}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-center justify-between gap-2">
                    <span>个人 <b className="text-emerald-700">{auditorMetrics.warnings.auditTotalDiff.personal}</b></span>
                    <span className="text-gray-300">|</span>
                    <span>机构平均 <b className="text-gray-700">{auditorMetrics.warnings.auditTotalDiff.orgAvg}</b></span>
                  </div>
                </div>
                <div className="bg-white/80 rounded-lg px-3 py-2 border border-amber-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-700">审核处理率</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                      {auditorMetrics.warnings.processRateDiff.value}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-center justify-between gap-2">
                    <span>个人 <b className="text-blue-700">{auditorMetrics.warnings.processRateDiff.personal}</b></span>
                    <span className="text-gray-300">|</span>
                    <span>机构平均 <b className="text-gray-700">{auditorMetrics.warnings.processRateDiff.orgAvg}</b></span>
                  </div>
                </div>
                <div className="bg-white/80 rounded-lg px-3 py-2 border border-amber-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-700">平均审核响应时长</span>
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md">
                      {auditorMetrics.warnings.avgTimeDiff.value}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-center justify-between gap-2">
                    <span>个人 <b className="text-purple-700">{auditorMetrics.warnings.avgTimeDiff.personal}</b></span>
                    <span className="text-gray-300">|</span>
                    <span>机构平均 <b className="text-gray-700">{auditorMetrics.warnings.avgTimeDiff.orgAvg}</b></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Comprehensive Evaluation Indicators Table (明细表区分上报员和审核员) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3.5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <h3 className="font-extrabold text-base text-gray-900 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>
                  {activeDimension === 'person'
                    ? personSubRole === 'submitter'
                      ? '上报员考核量化明细总表'
                      : personSubRole === 'auditor'
                      ? '审核员考核量化明细总表'
                      : '全员考核指标量化考评明细总表'
                    : activeDimension === 'org'
                    ? '各部门/机构量化考核明细总表'
                    : '各业务分类量化考核明细总表'}
                </span>
              </h3>
            </div>
          </div>

          {/* 右侧排序选择框 */}
          <div className="flex items-center self-end sm:self-auto">
            <div className="relative">
              <select
                id="evaluation-table-sort-select"
                value={
                  activeDimension === 'person' && personSubRole === 'auditor'
                    ? (['auditTotal', 'auditProcessRate', 'avgAuditTimeMin'].includes(sortBy) ? sortBy : 'auditTotal')
                    : sortBy
                }
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-slate-200 hover:border-blue-400 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-2xs transition-all"
                title="选择排序方式"
              >
                {activeDimension === 'person' && personSubRole === 'submitter' ? (
                  <>
                    <option value="adoptedNum">按采纳数排名</option>
                    <option value="adoptedFirstNum">按首发数排名</option>
                    <option value="oncePassRate">按一次性通过率排名</option>
                    <option value="overallPassRate">按整体通过率排名</option>
                    <option value="totalScore">按综合得分排名</option>
                    <option value="avgScore">按平均得分排名</option>
                  </>
                ) : activeDimension === 'person' && personSubRole === 'auditor' ? (
                  <>
                    <option value="auditTotal">按累计审核数排名</option>
                    <option value="auditProcessRate">按审核处理率排名</option>
                    <option value="avgAuditTimeMin">按平均审核响应时长排名</option>
                  </>
                ) : (
                  <>
                    <option value="adoptedNum">按采纳数排名</option>
                    <option value="overallPassRate">按整体通过率排名</option>
                    <option value="totalScore">按综合得分排名</option>
                    <option value="avgScore">按平均得分排名</option>
                  </>
                )}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              {/* 当为上报员专属榜单时的表头 */}
              {activeDimension === 'person' && personSubRole === 'submitter' ? (
                <tr className="bg-slate-50 text-gray-700 font-bold border-b border-gray-200 text-[11px]">
                  <th className="py-3 px-3 text-center">排名</th>
                  <th className="py-3 px-4">上报员 / 所属机构</th>
                  <th className="py-3 px-3 text-center">累计采纳数（首发/重复）</th>
                  <th className="py-3 px-3 text-center">一次性通过率 (通过/总件数)</th>
                  <th className="py-3 px-3 text-center">整体通过率 (通过/总件数)</th>
                  <th className="py-3 px-3 text-center">综合得分</th>
                  <th className="py-3 px-3 text-center">平均得分</th>
                </tr>
              ) : activeDimension === 'person' && personSubRole === 'auditor' ? (
                <tr className="bg-slate-50 text-gray-700 font-bold border-b border-gray-200 text-[11px]">
                  <th className="py-3 px-3 text-center">排名</th>
                  <th className="py-3 px-4">审核员 / 所属机构</th>
                  <th className="py-3 px-3 text-center">累计审核数 (已办/通过/驳回)</th>
                  <th className="py-3 px-3 text-center">审核处理率 (已办/上报)</th>
                  <th className="py-3 px-3 text-center">平均审核响应时长</th>
                </tr>
              ) : (
                <tr className="bg-slate-50 text-gray-700 font-bold border-b border-gray-200 text-[11px]">
                  <th className="py-3 px-3 text-center">排名</th>
                  <th className="py-3 px-4">考评对象 / 所属机构</th>
                  <th className="py-3 px-3 text-center">角色身份</th>
                  <th className="py-3 px-3 text-center">累计上报数</th>
                  <th className="py-3 px-3 text-center">一次性通过率</th>
                  <th className="py-3 px-3 text-center">整体通过率</th>
                  <th className="py-3 px-3 text-center">审核总数 / 处理率</th>
                  <th className="py-3 px-3 text-center">平均审核时长</th>
                  <th className="py-3 px-3 text-center">综合总分</th>
                  <th className="py-3 px-3 text-center">平均得分</th>
                  <th className="py-3 px-3 text-center">环比</th>
                  <th className="py-3 px-3 text-center">等次</th>
                  <th className="py-3 px-3 text-center">操作</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredList.map((row, idx) => {
                const currentRank = idx + 1;
                // 上报员专属行展示
                if (activeDimension === 'person' && personSubRole === 'submitter') {
                  const adopted = row.adoptedNum ?? row.oncePassNum ?? 0;
                  const adoptedFirst = row.adoptedFirstNum ?? Math.round(adopted * 0.78);
                  const adoptedRepeat = row.adoptedRepeatNum ?? Math.max(0, adopted - adoptedFirst);
                  const rejected = row.rejectedNum ?? Math.max(0, row.totalReports - (row.overallPassNum ?? row.totalReports));
                  const pending = row.pendingNum ?? Math.max(0, row.totalReports - adopted - rejected);

                  return (
                    <tr key={row.id} className="hover:bg-blue-50/40 transition-colors">
                      {/* 排名与升降 */}
                      <td className="py-3.5 px-3 text-center font-mono">
                        <div className="flex flex-col items-center justify-center">
                          {currentRank === 1 ? (
                            <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-black text-xs">🥇 1</span>
                          ) : currentRank === 2 ? (
                            <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-black text-xs">🥈 2</span>
                          ) : currentRank === 3 ? (
                            <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-black text-xs">🥉 3</span>
                          ) : (
                            <span className="text-gray-700 font-bold font-mono text-sm">{currentRank}</span>
                          )}
                          <span className="text-[10px] text-blue-600 font-medium mt-0.5">{row.rankChange}</span>
                        </div>
                      </td>

                      {/* 上报员 / 所属机构 */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-gray-900 text-sm flex items-center space-x-1.5">
                          <span>{row.name}</span>
                          {currentRank === 1 && (
                            <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.2 rounded font-bold">领跑者</span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{row.orgName}</div>
                      </td>

                      {/* 1. 采纳量 (首发/重复) */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="font-mono font-black text-emerald-700 text-sm">
                          {adopted} <span className="text-[11px] font-normal text-slate-400">件</span>
                        </div>
                        <div className="text-[10px] font-mono flex items-center justify-center space-x-1 mt-0.5">
                          <span className="text-emerald-700 font-bold">首发 {adoptedFirst}</span>
                          <span className="text-slate-300">/</span>
                          <span className="text-blue-600 font-bold">重复 {adoptedRepeat}</span>
                        </div>
                      </td>

                      {/* 3. 一次性通过率 (分子/分母) */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="font-mono font-black text-emerald-700 text-sm">
                          {row.oncePassRate}%
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          通过 <span className="text-emerald-700 font-bold">{row.oncePassNum}</span>/{row.oncePassTotal} 件
                        </div>
                      </td>

                      {/* 3. 整体通过率 (分子/分母) */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="font-mono font-black text-teal-700 text-sm">
                          {row.overallPassRate}%
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          通过 <span className="text-teal-700 font-bold">{row.overallPassNum}</span>/{row.overallPassTotal} 件
                        </div>
                      </td>

                      {/* 4. 综合得分 */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="font-mono font-black text-amber-600 text-sm">
                          {row.totalScore.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                          <span className="text-[10px] font-normal text-slate-400 ml-0.5">分</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">累加得分</div>
                      </td>

                      {/* 5. 平均得分 */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="font-mono font-black text-gray-800 text-sm">
                          {row.avgScore}
                          <span className="text-[10px] font-normal text-slate-400 ml-0.5">分</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">每条均分</div>
                      </td>
                    </tr>
                  );
                }

                // 审核员专属行展示
                if (activeDimension === 'person' && personSubRole === 'auditor') {
                  const completed = row.auditTotal;
                  const passed = row.auditBreakdown?.passed ?? Math.round(completed * 0.9);
                  const rejected = Math.max(0, completed - passed);
                  const pending = row.auditBreakdown?.pending ?? 0;
                  const processTotal = completed + pending;

                  return (
                    <tr key={row.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-3 text-center font-mono">
                        <div className="flex flex-col items-center justify-center">
                          {currentRank === 1 ? (
                            <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-black text-xs">🥇 1</span>
                          ) : currentRank === 2 ? (
                            <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-black text-xs">🥈 2</span>
                          ) : currentRank === 3 ? (
                            <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-black text-xs">🥉 3</span>
                          ) : (
                            <span className="text-gray-700 font-bold font-mono text-sm">{currentRank}</span>
                          )}
                          <span className="text-[10px] text-teal-600 font-medium mt-0.5">{row.rankChange}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-gray-900 text-sm">{row.name}</div>
                        <div className="text-[11px] text-gray-500">{row.orgName}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="font-mono font-black text-slate-900 text-sm">
                          {completed} <span className="text-[11px] font-normal text-slate-400">件</span>
                        </div>
                        <div className="text-[10px] font-mono flex items-center justify-center space-x-1 mt-0.5">
                          <span className="text-blue-700 font-bold">已办 {completed}</span>
                          <span className="text-slate-300">/</span>
                          <span className="text-emerald-700 font-bold">通过 {passed}</span>
                          <span className="text-slate-300">/</span>
                          <span className="text-rose-600 font-bold">驳回 {rejected}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="font-mono font-black text-teal-700 text-sm">{row.auditProcessRate}%</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          已办 {completed} / 上报 {processTotal} 件
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-purple-700 text-sm">
                        {row.avgAuditTimeMin} <span className="text-[11px] font-normal text-purple-600">分钟</span>
                      </td>
                    </tr>
                  );
                }

                // 全员/分类/机构默认行
                return (
                  <tr key={row.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-3 text-center font-mono font-bold">
                      {currentRank === 1 ? (
                        <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-black text-xs">🥇 1</span>
                      ) : currentRank === 2 ? (
                        <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-black text-xs">🥈 2</span>
                      ) : currentRank === 3 ? (
                        <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-black text-xs">🥉 3</span>
                      ) : (
                        <span className="text-gray-500 font-mono">{currentRank}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-gray-900">{row.name}</div>
                      <div className="text-[11px] text-gray-400">{row.orgName}</div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.roleType === '上报员'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : row.roleType === '审核员'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {row.roleType}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-gray-800">
                      {row.totalReports > 0 ? `${row.totalReports}件` : '--'}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {row.oncePassTotal > 0 ? (
                        <div>
                          <span className="font-mono font-bold text-emerald-600">{row.oncePassRate}%</span>
                          <div className="text-[10px] font-mono text-gray-400">({row.oncePassNum}/{row.oncePassTotal})</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {row.overallPassTotal > 0 ? (
                        <div>
                          <span className="font-mono font-bold text-teal-700">{row.overallPassRate}%</span>
                          <div className="text-[10px] font-mono text-gray-400">({row.overallPassNum}/{row.overallPassTotal})</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono">
                      {row.auditTotal > 0 ? (
                        <div>
                          <span className="font-bold text-gray-800">{row.auditTotal}件</span>
                          <div className="text-[10px] text-blue-600 font-bold">处理率 {row.auditProcessRate}%</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-purple-700 font-bold">
                      {row.avgAuditTimeMin > 0 ? `${row.avgAuditTimeMin}分` : '--'}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-black text-amber-600 text-sm">
                      {row.totalScore.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-gray-800">
                      {row.avgScore}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-[11px]">
                      <span className="text-emerald-700 font-bold">{row.momDelta}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.grade === '卓越'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : row.grade === '优秀'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {row.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedRecord(row)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1E5ABB] font-bold rounded-md transition-colors cursor-pointer text-[11px]"
                      >
                        画像剖析
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Detailed Evaluation Profile Modal / Drawer */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-white/15 rounded-xl backdrop-blur-xs">
                  <Award className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">{selectedRecord.name} · 量化考核评价报告</h3>
                  <p className="text-xs text-blue-100">{selectedRecord.orgName} | 考评等次: {selectedRecord.grade}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Core Score Header */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">综合考评总分</div>
                  <div className="text-3xl font-black text-[#1E5ABB] font-mono">{selectedRecord.totalScore} <span className="text-sm font-normal text-gray-500">分</span></div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">全域排名 / 环比</div>
                  <div className="text-lg font-bold text-gray-900 font-mono">第 {selectedRecord.rank} 名 ({selectedRecord.momDelta})</div>
                </div>
              </div>

              {/* Radar Chart Section */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <h4 className="font-bold text-xs text-gray-800 flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>五维量化考核雷达画像</span>
                </h4>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={selectedRecord.radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="得分" dataKey="value" stroke="#1E5ABB" fill="#3B82F6" fillOpacity={0.4} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* All Indicator Breakdown Grid */}
              {selectedRecord.roleType === '上报员' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-gray-500 text-[11px]">累计上报总数</span>
                    <div className="font-mono font-bold text-gray-900 text-sm mt-0.5">{selectedRecord.totalReports} 件</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      采纳 {selectedRecord.adoptedNum ?? selectedRecord.oncePassNum} / 驳回 {selectedRecord.rejectedNum ?? 0} / 待审 {selectedRecord.pendingNum ?? 0}
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
                    <span className="text-emerald-800 text-[11px] font-bold">一次性通过率</span>
                    <div className="font-mono font-black text-emerald-700 text-sm mt-0.5">{selectedRecord.oncePassRate}%</div>
                    <div className="text-[10px] text-emerald-700/80 font-mono mt-1">通过 {selectedRecord.oncePassNum}/{selectedRecord.oncePassTotal} 件</div>
                  </div>
                  <div className="p-3 bg-teal-50/50 rounded-lg border border-teal-200">
                    <span className="text-teal-800 text-[11px] font-bold">整体通过率</span>
                    <div className="font-mono font-black text-teal-700 text-sm mt-0.5">{selectedRecord.overallPassRate}%</div>
                    <div className="text-[10px] text-teal-700/80 font-mono mt-1">通过 {selectedRecord.overallPassNum}/{selectedRecord.overallPassTotal} 件</div>
                  </div>
                  <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-200">
                    <span className="text-rose-800 text-[11px] font-bold">驳回率</span>
                    <div className="font-mono font-black text-rose-700 text-sm mt-0.5">
                      {(( (selectedRecord.rejectedNum ?? (selectedRecord.totalReports > selectedRecord.overallPassNum ? selectedRecord.totalReports - selectedRecord.overallPassNum : 0)) / Math.max(1, selectedRecord.totalReports)) * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-rose-700/80 font-mono mt-1">
                      驳回 {selectedRecord.rejectedNum ?? (selectedRecord.totalReports > selectedRecord.overallPassNum ? selectedRecord.totalReports - selectedRecord.overallPassNum : 0)}/{selectedRecord.totalReports} 件
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                    <span className="text-amber-800 text-[11px] font-bold">综合得分 (累加)</span>
                    <div className="font-mono font-black text-amber-600 text-sm mt-0.5">{selectedRecord.totalScore.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} 分</div>
                    <div className="text-[10px] text-amber-700/80 mt-1">含加分 {selectedRecord.bonusPoints} 分</div>
                  </div>
                  <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200">
                    <span className="text-purple-800 text-[11px] font-bold">平均得分 (每条均分)</span>
                    <div className="font-mono font-black text-purple-600 text-sm mt-0.5">{selectedRecord.avgScore.toFixed(1)} 分</div>
                    <div className="text-[10px] text-purple-700/80 mt-1">质效均分领先</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-gray-500 text-[11px]">累计审核数</span>
                    <div className="font-mono font-bold text-gray-900 text-sm mt-0.5">{selectedRecord.auditTotal || '--'} 件</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-gray-500 text-[11px]">审核处理率</span>
                    <div className="font-mono font-bold text-teal-700 text-sm mt-0.5">{selectedRecord.auditProcessRate ? `${selectedRecord.auditProcessRate}%` : '--'}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-gray-500 text-[11px]">平均审核响应时长</span>
                    <div className="font-mono font-bold text-purple-700 text-sm mt-0.5">{selectedRecord.avgAuditTimeMin ? `${selectedRecord.avgAuditTimeMin} 分钟` : '--'}</div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  showToast(`已生成并下载《${selectedRecord.name}的单项绩效考核证明表.pdf》`);
                  setSelectedRecord(null);
                }}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-gray-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>导出考核档案证明 (PDF)</span>
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-[#1E5ABB] hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
