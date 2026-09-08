import React, { useState } from 'react';
import { PageId } from '../types';
import {
  Home,
  FileText,
  ClipboardCheck,
  BarChart3,
  Award,
  User,
  LayoutGrid,
  ChevronDown,
  Clock,
  CheckCircle2,
  Shield
} from 'lucide-react';

interface NavbarProps {
  activePage: PageId;
  reportDetailSourcePage?: PageId;
  onNavigate: (page: PageId, extra?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  reportDetailSourcePage = 'report-summary',
  onNavigate
}) => {
  const [reportMenuOpen, setReportMenuOpen] = useState(false);
  const [auditMenuOpen, setAuditMenuOpen] = useState(false);

  // If on report-detail, determine parent module based on entry source
  const isFromAudit =
    activePage === 'report-detail' && reportDetailSourcePage === 'audit-records';
  const isFromReportRecords =
    activePage === 'report-detail' && reportDetailSourcePage === 'report-records';
  const isFromReportSummary =
    activePage === 'report-detail' && (reportDetailSourcePage === 'report-summary' || !reportDetailSourcePage);

  const isReportSummaryActive =
    activePage === 'report-summary' || isFromReportSummary;
  const isReportRecordsActive =
    activePage === 'report-records' || isFromReportRecords;

  const isReportActive =
    ['report-summary', 'report-records'].includes(activePage) ||
    (activePage === 'report-detail' && !isFromAudit);

  const isAuditPendingActive =
    ['report-audit', 'audit-detail'].includes(activePage);
  const isAuditRecordsActive =
    ['audit-records', 'audit-record-detail'].includes(activePage) || isFromAudit;

  const isAuditActive =
    [
      'report-audit',
      'audit-detail',
      'audit-records',
      'audit-record-detail'
    ].includes(activePage) || isFromAudit;

  const isNegativeActive = ['negative-info', 'negative-detail'].includes(activePage);

  return (
    <nav className="bg-[#1E5ABB] text-white shadow-sm relative z-20 border-t border-white/15">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-12 text-[14px] sm:text-[15px] font-medium sm:font-semibold">
        {/* Navigation Items Bar */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 h-full py-1">
          {/* Grid Quick App Switcher Icon */}
          <button
            onClick={() => onNavigate('home')}
            className="px-2.5 h-9 rounded flex items-center justify-center hover:bg-white/12 text-white/90 hover:text-white transition-colors cursor-pointer mr-0.5"
            title="功能导航"
          >
            <LayoutGrid className="w-4.5 h-4.5" />
          </button>

          {/* 首页 */}
          <button
            onClick={() => onNavigate('home')}
            className={`px-4 sm:px-4.5 h-9 transition-all cursor-pointer rounded flex items-center space-x-2 ${
              activePage === 'home'
                ? 'bg-blue-600 font-bold text-white shadow-xs'
                : 'hover:bg-white/12 text-white/90 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>首页</span>
          </button>

          {/* 报送管理 Dropdown (含 报送待办 与 报送记录) */}
          <div
            className="relative h-full flex items-center"
            onMouseEnter={() => setReportMenuOpen(true)}
            onMouseLeave={() => setReportMenuOpen(false)}
          >
            <button
              onClick={() => onNavigate('report-summary')}
              className={`px-4 sm:px-4.5 h-9 transition-all cursor-pointer rounded flex items-center space-x-1.5 ${
                isReportActive
                  ? 'bg-blue-600 font-bold text-white shadow-xs'
                  : 'hover:bg-white/12 text-white/90 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>报送管理</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${reportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {reportMenuOpen && (
              <div className="absolute left-0 top-full mt-0.5 w-44 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100/90 p-1.5 z-50 text-[14px] animate-in fade-in duration-150">
                {/* 报送待办 */}
                <button
                  onClick={() => {
                    onNavigate('report-summary');
                    setReportMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between transition-all ${
                    isReportSummaryActive
                      ? 'bg-blue-50/90 text-[#1E5ABB] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-normal'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>报送待办</span>
                  </div>
                  {isReportSummaryActive && (
                    <span className="w-2 h-2 rounded-full bg-[#1E5ABB]"></span>
                  )}
                </button>

                {/* 报送记录 */}
                <button
                  onClick={() => {
                    onNavigate('report-records');
                    setReportMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between transition-all ${
                    isReportRecordsActive
                      ? 'bg-blue-50/90 text-[#1E5ABB] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-normal'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>报送记录</span>
                  </div>
                  {isReportRecordsActive && (
                    <span className="w-2 h-2 rounded-full bg-[#1E5ABB]"></span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* 审核管理 Dropdown (含 审核待办 与 审核记录) */}
          <div
            className="relative h-full flex items-center"
            onMouseEnter={() => setAuditMenuOpen(true)}
            onMouseLeave={() => setAuditMenuOpen(false)}
          >
            <button
              onClick={() => onNavigate('report-audit')}
              className={`px-4 sm:px-4.5 h-9 transition-all cursor-pointer rounded flex items-center space-x-1.5 ${
                isAuditActive
                  ? 'bg-blue-600 font-bold text-white shadow-xs'
                  : 'hover:bg-white/12 text-white/90 hover:text-white'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>审核管理</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${auditMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {auditMenuOpen && (
              <div className="absolute left-0 top-full mt-0.5 w-44 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100/90 p-1.5 z-50 text-[14px] animate-in fade-in duration-150">
                {/* 审核待办 */}
                <button
                  onClick={() => {
                    onNavigate('report-audit');
                    setAuditMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between transition-all ${
                    isAuditPendingActive
                      ? 'bg-blue-50/90 text-[#1E5ABB] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-normal'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>审核待办</span>
                  </div>
                  {isAuditPendingActive && (
                    <span className="w-2 h-2 rounded-full bg-[#1E5ABB]"></span>
                  )}
                </button>

                {/* 审核记录 */}
                <button
                  onClick={() => {
                    onNavigate('audit-records');
                    setAuditMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between transition-all ${
                    isAuditRecordsActive
                      ? 'bg-blue-50/90 text-[#1E5ABB] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-normal'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>审核记录</span>
                  </div>
                  {isAuditRecordsActive && (
                    <span className="w-2 h-2 rounded-full bg-[#1E5ABB]"></span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* 不良信息库 */}
          <button
            onClick={() => onNavigate('negative-info')}
            className={`px-4 sm:px-4.5 h-9 transition-all cursor-pointer rounded flex items-center space-x-2 ${
              isNegativeActive
                ? 'bg-blue-600 font-bold text-white shadow-xs'
                : 'hover:bg-white/12 text-white/90 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>不良信息库</span>
          </button>

          {/* 统计管理 */}
          <button
            onClick={() => onNavigate('statistics')}
            className={`px-4 sm:px-4.5 h-9 transition-all cursor-pointer rounded flex items-center space-x-2 ${
              activePage === 'statistics'
                ? 'bg-blue-600 font-bold text-white shadow-xs'
                : 'hover:bg-white/12 text-white/90 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>统计管理</span>
          </button>

          {/* 考核管理 */}
          <button
            onClick={() => onNavigate('evaluation')}
            className={`px-4 sm:px-4.5 h-9 transition-all cursor-pointer rounded flex items-center space-x-2 ${
              activePage === 'evaluation'
                ? 'bg-blue-600 font-bold text-white shadow-xs'
                : 'hover:bg-white/12 text-white/90 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>考核管理</span>
          </button>

          {/* 个人中心 */}
          <button
            onClick={() => onNavigate('personal-info')}
            className={`px-4 sm:px-4.5 h-9 transition-all cursor-pointer rounded flex items-center space-x-2 ${
              activePage === 'personal-info'
                ? 'bg-blue-600 font-bold text-white shadow-xs'
                : 'hover:bg-white/12 text-white/90 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>个人中心</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
