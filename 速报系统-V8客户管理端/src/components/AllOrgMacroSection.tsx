import React from 'react';
import {
  TrendingUp,
  FileCheck,
  Zap,
  Clock,
  Percent,
} from 'lucide-react';

export interface OrgMacroData {
  rank: number;
  name: string;
  shortName: string;
  type: '市级党政主体' | '区县直属局' | '独立直属单位';
  isMyOrg?: boolean;
  staff: number;
  reporters: number;
  auditors: number;
  total: number;
  passed: number;
  rejected: number;
  pending: number;
  directRate: number; // e.g. 88.6%
  passRate: number;   // e.g. 96.2%
  avgScore: number;   // e.g. 98.5分
  avgTime: number;    // minutes e.g. 6.8
  perCapita: number;
  negatives: number;
  closedRate: number;
  grade: '卓越' | '优秀' | '良好' | '合格';
}

interface AllOrgMacroSectionProps {
  onSelectOrg?: (org: OrgMacroData) => void;
}

export const ALL_ORGS_DATA: OrgMacroData[] = [
  { rank: 1, name: '中共台中市委宣传部', shortName: '市委宣传部', isMyOrg: true, type: '市级党政主体', staff: 45, reporters: 32, auditors: 13, total: 1580, passed: 1520, rejected: 35, pending: 25, directRate: 88.6, passRate: 96.2, avgScore: 98.5, avgTime: 6.8, perCapita: 35.1, negatives: 18, closedRate: 100, grade: '卓越' },
  { rank: 2, name: '台中市网信办', shortName: '市网信办', isMyOrg: false, type: '市级党政主体', staff: 38, reporters: 26, auditors: 12, total: 1350, passed: 1280, rejected: 42, pending: 28, directRate: 86.4, passRate: 94.8, avgScore: 95.8, avgTime: 8.5, perCapita: 35.5, negatives: 24, closedRate: 98.5, grade: '卓越' },
  { rank: 3, name: '西屯区网信办', shortName: '西屯网信办', isMyOrg: false, type: '区县直属局', staff: 40, reporters: 28, auditors: 12, total: 1120, passed: 1030, rejected: 58, pending: 32, directRate: 82.5, passRate: 92.0, avgScore: 93.2, avgTime: 10.8, perCapita: 28.0, negatives: 15, closedRate: 97.8, grade: '优秀' },
  { rank: 4, name: '台中市大数据中心', shortName: '大数据中心', isMyOrg: false, type: '独立直属单位', staff: 40, reporters: 29, auditors: 11, total: 980, passed: 890, rejected: 60, pending: 30, directRate: 81.0, passRate: 90.8, avgScore: 91.5, avgTime: 12.2, perCapita: 24.5, negatives: 12, closedRate: 96.0, grade: '良好' },
  { rank: 5, name: '东湖区委宣传部', shortName: '东湖宣传部', isMyOrg: false, type: '区县直属局', staff: 38, reporters: 28, auditors: 10, total: 850, passed: 750, rejected: 65, pending: 35, directRate: 77.8, passRate: 88.2, avgScore: 89.4, avgTime: 14.5, perCapita: 22.4, negatives: 10, closedRate: 95.0, grade: '良好' },
  { rank: 6, name: '北屯区宣传部', shortName: '北屯宣传部', isMyOrg: false, type: '区县直属局', staff: 35, reporters: 25, auditors: 10, total: 720, passed: 630, rejected: 55, pending: 35, directRate: 75.0, passRate: 87.5, avgScore: 87.8, avgTime: 15.0, perCapita: 20.6, negatives: 8, closedRate: 94.2, grade: '合格' },
  { rank: 7, name: '南屯区网信办', shortName: '南屯宣传部', isMyOrg: false, type: '区县直属局', staff: 34, reporters: 24, auditors: 10, total: 680, passed: 590, rejected: 52, pending: 38, directRate: 74.2, passRate: 86.8, avgScore: 86.9, avgTime: 15.5, perCapita: 20.0, negatives: 6, closedRate: 93.5, grade: '合格' },
  { rank: 8, name: '高新区管委会', shortName: '高新区管委会', isMyOrg: false, type: '独立直属单位', staff: 30, reporters: 22, auditors: 8, total: 590, passed: 510, rejected: 48, pending: 32, directRate: 73.0, passRate: 86.4, avgScore: 85.7, avgTime: 16.0, perCapita: 19.6, negatives: 5, closedRate: 92.0, grade: '合格' },
  { rank: 9, name: '市公安局网安支队', shortName: '市公安局网安', isMyOrg: false, type: '市级党政主体', staff: 28, reporters: 20, auditors: 8, total: 562, passed: 490, rejected: 44, pending: 28, directRate: 74.5, passRate: 87.2, avgScore: 86.2, avgTime: 13.8, perCapita: 20.1, negatives: 9, closedRate: 97.0, grade: '合格' },
  { rank: 10, name: '经开区网信办', shortName: '经开区网信', isMyOrg: false, type: '区县直属局', staff: 26, reporters: 19, auditors: 7, total: 485, passed: 420, rejected: 40, pending: 25, directRate: 72.1, passRate: 86.6, avgScore: 85.0, avgTime: 16.2, perCapita: 18.6, negatives: 4, closedRate: 91.5, grade: '合格' },
  { rank: 11, name: '市发改委政研室', shortName: '市发改委', isMyOrg: false, type: '市级党政主体', staff: 24, reporters: 18, auditors: 6, total: 430, passed: 375, rejected: 35, pending: 20, directRate: 71.8, passRate: 87.2, avgScore: 84.6, avgTime: 14.2, perCapita: 17.9, negatives: 3, closedRate: 95.0, grade: '合格' },
  { rank: 12, name: '新城区委网信办', shortName: '新城区网信', isMyOrg: false, type: '区县直属局', staff: 22, reporters: 16, auditors: 6, total: 390, passed: 335, rejected: 32, pending: 23, directRate: 70.5, passRate: 85.9, avgScore: 83.5, avgTime: 17.0, perCapita: 17.7, negatives: 3, closedRate: 90.0, grade: '合格' }
];

export const AllOrgMacroSection: React.FC<AllOrgMacroSectionProps> = ({ onSelectOrg }) => {
  return (
    <div className="space-y-4">
      {/* 1. 全域机构宏观运营大盘总览指标卡 (5 Key Metric Cards for All 28 Organizations) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Metric 1: 全域累计报送 */}
        <div className="bg-gradient-to-br from-blue-50/80 to-white p-3.5 rounded-xl border border-blue-100/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>全域累计报送</span>
            </span>
            <span className="text-[9px] bg-blue-100/70 text-blue-700 font-bold px-1.5 py-0.2 rounded font-mono">
              28家
            </span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-black text-gray-900 font-mono tracking-tight">10,480</span>
            <span className="text-[10px] text-gray-500 font-medium">件</span>
          </div>
          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-blue-50">
            <span className="text-gray-500">采纳率: <strong className="text-emerald-700 font-mono font-bold">89.4%</strong></span>
            <span className="text-blue-700 font-bold">环比 +6.8%</span>
          </div>
        </div>

        {/* Metric 2: 全域有效采纳 */}
        <div className="bg-gradient-to-br from-emerald-50/80 to-white p-3.5 rounded-xl border border-emerald-100/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold flex items-center space-x-1">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>全域有效采纳</span>
            </span>
            <span className="text-[9px] bg-emerald-100/70 text-emerald-700 font-bold px-1.5 py-0.2 rounded">
              采纳率
            </span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-black text-emerald-800 font-mono tracking-tight">9,370</span>
            <span className="text-[10px] text-gray-500 font-medium">件</span>
          </div>
          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-emerald-50">
            <span className="text-gray-500">驳回: <strong className="text-rose-700 font-mono font-bold">780件</strong></span>
            <span className="text-emerald-700 font-bold">通过率 89.4%</span>
          </div>
        </div>

        {/* Metric 3: 全域首审直通率 */}
        <div className="bg-gradient-to-br from-purple-50/80 to-white p-3.5 rounded-xl border border-purple-100/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-purple-600" />
              <span>首审直通率</span>
            </span>
            <span className="text-[9px] bg-purple-100/70 text-purple-700 font-bold px-1.5 py-0.2 rounded">
              质效高地
            </span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-black text-purple-800 font-mono tracking-tight">77.4</span>
            <span className="text-[10px] text-gray-500 font-medium">%</span>
          </div>
          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-purple-50">
            <span className="text-gray-500">直通标兵: <strong className="text-gray-800 font-bold">市委宣传部</strong></span>
            <span className="text-purple-700 font-bold">88.6%</span>
          </div>
        </div>

        {/* Metric 4: 审核响应均时 */}
        <div className="bg-gradient-to-br from-amber-50/80 to-white p-3.5 rounded-xl border border-amber-100/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>全域审核响应</span>
            </span>
            <span className="text-[9px] bg-amber-100/70 text-amber-800 font-bold px-1.5 py-0.2 rounded">
              流转时效
            </span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-black text-amber-800 font-mono tracking-tight">13.8</span>
            <span className="text-[10px] text-gray-500 font-medium">分钟</span>
          </div>
          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-amber-50">
            <span className="text-gray-500">最快响应: <strong className="text-gray-800 font-bold">市委宣传部</strong></span>
            <span className="text-emerald-700 font-bold">6.8分</span>
          </div>
        </div>

        {/* Metric 5: 综合考核均分 */}
        <div className="bg-gradient-to-br from-indigo-50/80 to-white p-3.5 rounded-xl border border-indigo-100/90 shadow-2xs space-y-1.5 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold flex items-center space-x-1">
              <Percent className="w-3.5 h-3.5 text-indigo-600" />
              <span>综合考核均分</span>
            </span>
            <span className="text-[9px] bg-indigo-100/70 text-indigo-700 font-bold px-1.5 py-0.2 rounded">
              全域考评
            </span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-black text-indigo-800 font-mono tracking-tight">88.5</span>
            <span className="text-[10px] text-gray-500 font-medium">分</span>
          </div>
          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-indigo-50">
            <span className="text-gray-500">达标率: <strong className="text-emerald-700 font-mono font-bold">100%</strong></span>
            <span className="text-indigo-700 font-bold">28家全评</span>
          </div>
        </div>
      </div>
    </div>
  );
};
