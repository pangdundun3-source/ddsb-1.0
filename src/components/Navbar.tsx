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
  ChevronDown
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

  const isReportActive =
    ['report-summary', 'report-records'].includes(activePage) ||
    (activePage === 'report-detail' && !isFromAudit);

  const isAuditActive =
    [
      'report-audit',
      'audit-detail',
      'audit-records',
      'audit-record-detail',
      'negative-info',
      'negative-detail'
    ].includes(activePage) || isFromAudit;

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
              className={`px-4 sm:px-4.5 h-9 transition-all cursor-pointer rounded flex items-center space-x-2 ${
                isReportActive
                  ? 'bg-blue-600 font-bold text-white shadow-xs'
                  : 'hover:bg-white/12 text-white/90 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>报送管理</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${reportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {reportMenuOpen && (
              <div className="absolute left-0 top-full mt-0.5 w-48 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-100 py-1.5 z-50 text-sm animate-in fade-in duration-150">
                <button
                  onClick={() => {
                    onNavigate('report-summary');
                    setReportMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 hover:text-[#1E5ABB] cursor-pointer flex items-center justify-between ${
                    activePage === 'report-summary' || isFromReportSummary ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : ''
                  }`}
                >
                  <span>报送待办</span>
                  {(activePage === 'report-summary' || isFromReportSummary) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E5ABB]"></span>
                  )}
                </button>
                <button
                  onClick={() => {
                    onNavigate('report-records');
                    setReportMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 hover:text-[#1E5ABB] cursor-pointer flex items-center justify-between ${
                    activePage === 'report-records' || isFromReportRecords ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : ''
                  }`}
                >
                  <span>报送记录</span>
                  {(activePage === 'report-records' || isFromReportRecords) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E5ABB]"></span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* 审核管理 Dropdown */}
          <div
            className="relative h-full flex items-center"
            onMouseEnter={() => setAuditMenuOpen(true)}
            onMouseLeave={() => setAuditMenuOpen(false)}
          >
            <button
              onClick={() => onNavigate('report-audit')}
              className={`px-4 sm:px-4.5 h-9 transition-all cursor-pointer rounded flex items-center space-x-2 ${
                isAuditActive
                  ? 'bg-blue-600 font-bold text-white shadow-xs'
                  : 'hover:bg-white/12 text-white/90 hover:text-white'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>审核管理</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${auditMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {auditMenuOpen && (
              <div className="absolute left-0 top-full mt-0.5 w-48 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-100 py-1.5 z-50 text-sm animate-in fade-in duration-150">
                <button
                  onClick={() => {
                    onNavigate('report-audit');
                    setAuditMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 hover:text-[#1E5ABB] cursor-pointer flex items-center justify-between ${
                    ['report-audit', 'audit-detail'].includes(activePage) ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : ''
                  }`}
                >
                  <span>审核待办</span>
                  {['report-audit', 'audit-detail'].includes(activePage) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E5ABB]"></span>
                  )}
                </button>
                <button
                  onClick={() => {
                    onNavigate('audit-records');
                    setAuditMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 hover:text-[#1E5ABB] cursor-pointer flex items-center justify-between ${
                    activePage === 'audit-records' || activePage === 'audit-record-detail' || isFromAudit ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : ''
                  }`}
                >
                  <span>审核记录</span>
                  {(activePage === 'audit-records' || activePage === 'audit-record-detail' || isFromAudit) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E5ABB]"></span>
                  )}
                </button>
              </div>
            )}
          </div>

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
