import React, { useState } from 'react';
import { PageId } from '../types';
import { List, ChevronDown } from 'lucide-react';

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
  const [systemMenuOpen, setSystemMenuOpen] = useState(false);

  const isReportActive = ['report-summary', 'report-records', 'report-detail'].includes(activePage);
  const isFromReportRecords =
    activePage === 'report-detail' && reportDetailSourcePage === 'report-records';
  const isFromReportSummary =
    activePage === 'report-detail' &&
    (reportDetailSourcePage === 'report-summary' || !reportDetailSourcePage);

  const isAuditActive = [
    'report-audit',
    'audit-detail',
    'audit-records',
    'audit-record-detail'
  ].includes(activePage);

  const isSystemActive = [
    'org-management',
    'business-config',
    'system-logs'
  ].includes(activePage);

  return (
    <nav className="bg-[#1E5ABB] text-white shadow-sm relative z-20 border-t border-white/10">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 flex items-center h-10 text-xs font-semibold">
        {/* Navigation Items Bar */}
        <div className="flex items-center space-x-1.5">
          {/* 首页 */}
          <button
            onClick={() => onNavigate('home')}
            className={`px-4 py-2 transition-all cursor-pointer rounded flex items-center space-x-1 ${
              activePage === 'home'
                ? 'bg-blue-600/90 font-bold text-white shadow-xs'
                : 'hover:bg-white/10 text-white/90'
            }`}
          >
            <span>首页</span>
          </button>

          {/* 报送管理 Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setReportMenuOpen(true)}
            onMouseLeave={() => setReportMenuOpen(false)}
          >
            <button
              onClick={() => onNavigate('report-summary')}
              className={`px-4 py-2 transition-all cursor-pointer rounded flex items-center space-x-1 ${
                isReportActive
                  ? 'bg-blue-600/90 font-bold text-white shadow-xs'
                  : 'hover:bg-white/10 text-white/90'
              }`}
            >
              <span>报送管理</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${reportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {reportMenuOpen && (
              <div className="absolute left-0 top-full w-44 bg-white text-gray-800 rounded-md shadow-xl border border-gray-100 py-1 z-50 text-xs animate-in fade-in duration-150">
                {/* 1. 报送待办 */}
                <button
                  onClick={() => {
                    onNavigate('report-summary');
                    setReportMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 hover:bg-blue-50 hover:text-[#1E5ABB] flex items-center justify-between cursor-pointer ${
                    activePage === 'report-summary' || isFromReportSummary ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : ''
                  }`}
                >
                  <span>报送待办</span>
                </button>
                {/* 2. 报送记录 */}
                <button
                  onClick={() => {
                    onNavigate('report-records');
                    setReportMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 hover:bg-blue-50 hover:text-[#1E5ABB] cursor-pointer ${
                    activePage === 'report-records' || isFromReportRecords ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : ''
                  }`}
                >
                  <span>报送记录</span>
                </button>
              </div>
            )}
          </div>

          {/* 审核管理 Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setAuditMenuOpen(true)}
            onMouseLeave={() => setAuditMenuOpen(false)}
          >
            <button
              onClick={() => onNavigate('report-audit')}
              className={`px-4 py-2 transition-all cursor-pointer rounded flex items-center space-x-1 ${
                isAuditActive
                  ? 'bg-blue-600/90 font-bold text-white shadow-xs'
                  : 'hover:bg-white/10 text-white/90'
              }`}
            >
              <span>审核管理</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${auditMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {auditMenuOpen && (
              <div className="absolute left-0 top-full w-44 bg-white text-gray-800 rounded-md shadow-xl border border-gray-100 py-1 z-50 text-xs animate-in fade-in duration-150">
                {/* 1. 审核待办 */}
                <button
                  onClick={() => {
                    onNavigate('report-audit');
                    setAuditMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 hover:bg-blue-50 hover:text-[#1E5ABB] flex items-center justify-between cursor-pointer ${
                    activePage === 'report-audit' || activePage === 'audit-detail' ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : ''
                  }`}
                >
                  <span>审核待办</span>
                </button>
                {/* 2. 审核记录 */}
                <button
                  onClick={() => {
                    onNavigate('audit-records');
                    setAuditMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 hover:bg-blue-50 hover:text-[#1E5ABB] cursor-pointer ${
                    ['audit-records', 'audit-record-detail'].includes(activePage) ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : ''
                  }`}
                >
                  <span>审核记录</span>
                </button>
              </div>
            )}
          </div>

          {/* 不良信息库 */}
          <button
            onClick={() => onNavigate('negative-info')}
            className={`px-4 py-2 transition-all cursor-pointer rounded flex items-center space-x-1 ${
              activePage === 'negative-info' || activePage === 'negative-detail'
                ? 'bg-blue-600/90 font-bold text-white shadow-xs'
                : 'hover:bg-white/10 text-white/90'
            }`}
          >
            <span>不良信息库</span>
          </button>

          {/* 统计管理 */}
          <button
            onClick={() => onNavigate('statistics')}
            className={`px-4 py-2 transition-all cursor-pointer rounded flex items-center space-x-1 ${
              activePage === 'statistics'
                ? 'bg-blue-600/90 font-bold text-white shadow-xs'
                : 'hover:bg-white/10 text-white/90'
            }`}
          >
            <span>统计管理</span>
          </button>

          {/* 考核管理 */}
          <button
            onClick={() => onNavigate('evaluation')}
            className={`px-4 py-2 transition-all cursor-pointer rounded flex items-center space-x-1 ${
              activePage === 'evaluation'
                ? 'bg-blue-600/90 font-bold text-white shadow-xs'
                : 'hover:bg-white/10 text-white/90'
            }`}
          >
            <span>考核管理</span>
          </button>

          {/* 系统管理 Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setSystemMenuOpen(true)}
            onMouseLeave={() => setSystemMenuOpen(false)}
          >
            <button
              onClick={() => onNavigate('org-management')}
              className={`px-4 py-2 transition-all cursor-pointer rounded flex items-center space-x-1 ${
                isSystemActive
                  ? 'bg-blue-600/90 font-bold text-white shadow-xs'
                  : 'hover:bg-white/10 text-white/90'
              }`}
            >
              <span>系统管理</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${systemMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {systemMenuOpen && (
              <div className="absolute left-0 top-full w-48 bg-white text-gray-800 rounded-md shadow-xl border border-gray-100 py-1 z-50 text-xs animate-in fade-in duration-150">
                <button
                  onClick={() => {
                    onNavigate('org-management');
                    setSystemMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 hover:bg-blue-50 hover:text-[#1E5ABB] cursor-pointer ${
                    activePage === 'org-management' ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : ''
                  }`}
                >
                  <span>组织架构管理</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('business-config');
                    setSystemMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 hover:bg-blue-50 hover:text-[#1E5ABB] cursor-pointer ${
                    activePage === 'business-config' ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : ''
                  }`}
                >
                  <span>业务配置维护</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('system-logs');
                    setSystemMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 hover:bg-blue-50 hover:text-[#1E5ABB] cursor-pointer ${
                    activePage === 'system-logs' ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : ''
                  }`}
                >
                  <span>系统审计日志</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
