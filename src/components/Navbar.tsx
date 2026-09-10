import React, { useState } from 'react';
import { PageId } from '../types';
import {
  ChevronDown,
  LayoutGrid,
  ArrowLeft,
  ChevronRight,
  Radio,
  Globe,
  ShieldAlert,
  Search,
  Home,
  FileEdit,
  ShieldCheck,
  BarChart3,
  Award,
  Megaphone,
  Settings,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  Building2,
  FileText,
  GitFork,
  ListFilter,
  Sparkles
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
  const [systemMenuOpen, setSystemMenuOpen] = useState(false);
  const [appGridOpen, setAppGridOpen] = useState(false);

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
    'notice-management',
    'org-management',
    'role-permission',
    'template-management',
    'audit-flow-config',
    'audit-score-config',
    'dict-management',
    'value-added-services',
    'business-config',
    'system-logs'
  ].includes(activePage);

  return (
    <nav className="bg-[#1E5ABB] text-white shadow-md relative z-20 border-t border-white/10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-12 text-[15px] font-medium select-none">
        {/* Navigation Items Bar */}
        <div className="flex items-center space-x-1.5 relative">
          {/* App Grid Launcher Button (Left of 首页) */}
          <div className="relative">
            <button
              onClick={() => setAppGridOpen(!appGridOpen)}
              className={`px-3 py-2 transition-all duration-150 cursor-pointer rounded-lg flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 ${
                appGridOpen ? 'bg-blue-700/90 text-white shadow-inner' : ''
              }`}
              title="应用导航与工作台矩阵"
            >
              <LayoutGrid className="w-4.5 h-4.5" />
            </button>

            {/* Application Drawer / Popup Panel */}
            {appGridOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setAppGridOpen(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-[1180px] max-w-[calc(100vw-2rem)] bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-6 z-50 animate-in fade-in slide-in-from-top-2">
                  {/* Top bar inside panel: 返回工作台 */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <button
                      onClick={() => {
                        setAppGridOpen(false);
                        onNavigate('portal');
                      }}
                      className="flex items-center space-x-2 px-3.5 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#1E5ABB] rounded-lg font-bold text-xs transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>返回工作台</span>
                    </button>
                    <span className="text-[11px] text-slate-400 font-medium">
                      正管用网络生态综合治理平台 · 应用矩阵
                    </span>
                  </div>

                  {/* Product Application Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {/* 1. 指令流转 */}
                    <div
                      onClick={() => {
                        setAppGridOpen(false);
                        onNavigate('home');
                      }}
                      className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1E5ABB] flex items-center justify-center font-bold">
                          <Radio className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 group-hover:text-[#1E5ABB] text-sm">
                            指令流转
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">速报审核与指令下达中心</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E5ABB] group-hover:translate-x-0.5 transition-all" />
                    </div>

                    {/* 2. 河图融媒体 */}
                    <div
                      onClick={() => {
                        setAppGridOpen(false);
                        alert('河图融媒体中枢：新闻资讯、分析方案、人员管理已与当前网信平台无缝联通。');
                      }}
                      className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 group-hover:text-[#1E5ABB] text-sm">
                            河图融媒体
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            新闻资讯 | 分析方案 | 人员管理
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E5ABB] group-hover:translate-x-0.5 transition-all" />
                    </div>

                    {/* 3. 线索排查 */}
                    <div
                      onClick={() => {
                        setAppGridOpen(false);
                        onNavigate('negative-info');
                      }}
                      className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 group-hover:text-[#1E5ABB] text-sm">
                            线索排查
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            负面有害线索排查与协同处置
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E5ABB] group-hover:translate-x-0.5 transition-all" />
                    </div>

                    {/* 4. 全网搜 */}
                    <div
                      onClick={() => {
                        setAppGridOpen(false);
                        alert('全网搜智能搜索引擎：正在联通全网舆情舆论大数据。');
                      }}
                      className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                          <Search className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 group-hover:text-[#1E5ABB] text-sm">
                            全网搜
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            跨平台舆情全网深度检索与聚合
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E5ABB] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="h-4 w-[1px] bg-white/20 mx-1"></div>

          {/* 首页 */}
          <button
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-1.5 transition-all duration-150 cursor-pointer rounded-lg flex items-center space-x-1.5 ${
              activePage === 'home'
                ? 'bg-blue-700/95 font-bold text-white shadow-xs'
                : 'hover:bg-white/15 text-white/90'
            }`}
          >
            <Home className="w-4 h-4 stroke-[2.2]" />
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
              className={`px-3.5 py-1.5 transition-all duration-150 cursor-pointer rounded-lg flex items-center space-x-1.5 ${
                isReportActive
                  ? 'bg-blue-700/95 font-bold text-white shadow-xs'
                  : 'hover:bg-white/15 text-white/90'
              }`}
            >
              <FileEdit className="w-4 h-4 stroke-[2.2]" />
              <span>报送管理</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 opacity-80 ${reportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {reportMenuOpen && (
              <div className="absolute left-0 top-full mt-0.5 w-48 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100 p-1.5 z-50 text-sm animate-in fade-in duration-150">
                {/* 1. 报送待办 */}
                <button
                  onClick={() => {
                    onNavigate('report-summary');
                    setReportMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg hover:bg-blue-50 hover:text-[#1E5ABB] flex items-center justify-between cursor-pointer transition-colors ${
                    activePage === 'report-summary' || isFromReportSummary ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>报送待办</span>
                  </div>
                  {(activePage === 'report-summary' || isFromReportSummary) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E5ABB]"></span>
                  )}
                </button>
                {/* 2. 报送记录 */}
                <button
                  onClick={() => {
                    onNavigate('report-records');
                    setReportMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg hover:bg-blue-50 hover:text-[#1E5ABB] flex items-center justify-between cursor-pointer transition-colors ${
                    activePage === 'report-records' || isFromReportRecords ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>报送记录</span>
                  </div>
                  {(activePage === 'report-records' || isFromReportRecords) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E5ABB]"></span>
                  )}
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
              className={`px-3.5 py-1.5 transition-all duration-150 cursor-pointer rounded-lg flex items-center space-x-1.5 ${
                isAuditActive
                  ? 'bg-blue-700/95 font-bold text-white shadow-xs'
                  : 'hover:bg-white/15 text-white/90'
              }`}
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
              <span>审核管理</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 opacity-80 ${auditMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {auditMenuOpen && (
              <div className="absolute left-0 top-full mt-0.5 w-48 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100 p-1.5 z-50 text-sm animate-in fade-in duration-150">
                {/* 1. 审核待办 */}
                <button
                  onClick={() => {
                    onNavigate('report-audit');
                    setAuditMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg hover:bg-blue-50 hover:text-[#1E5ABB] flex items-center justify-between cursor-pointer transition-colors ${
                    activePage === 'report-audit' || activePage === 'audit-detail' ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>审核待办</span>
                  </div>
                  {(activePage === 'report-audit' || activePage === 'audit-detail') && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E5ABB]"></span>
                  )}
                </button>
                {/* 2. 审核记录 */}
                <button
                  onClick={() => {
                    onNavigate('audit-records');
                    setAuditMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg hover:bg-blue-50 hover:text-[#1E5ABB] flex items-center justify-between cursor-pointer transition-colors ${
                    ['audit-records', 'audit-record-detail'].includes(activePage) ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>审核记录</span>
                  </div>
                  {['audit-records', 'audit-record-detail'].includes(activePage) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E5ABB]"></span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* 不良信息库 */}
          <button
            onClick={() => onNavigate('negative-info')}
            className={`px-3.5 py-1.5 transition-all duration-150 cursor-pointer rounded-lg flex items-center space-x-1.5 ${
              activePage === 'negative-info' || activePage === 'negative-detail'
                ? 'bg-blue-700/95 font-bold text-white shadow-xs'
                : 'hover:bg-white/15 text-white/90'
            }`}
          >
            <ShieldAlert className="w-4 h-4 stroke-[2.2]" />
            <span>不良信息库</span>
          </button>

          {/* 统计管理 */}
          <button
            onClick={() => onNavigate('statistics')}
            className={`px-3.5 py-1.5 transition-all duration-150 cursor-pointer rounded-lg flex items-center space-x-1.5 ${
              activePage === 'statistics'
                ? 'bg-blue-700/95 font-bold text-white shadow-xs'
                : 'hover:bg-white/15 text-white/90'
            }`}
          >
            <BarChart3 className="w-4 h-4 stroke-[2.2]" />
            <span>统计管理</span>
          </button>

          {/* 考核管理 */}
          <button
            onClick={() => onNavigate('evaluation')}
            className={`px-3.5 py-1.5 transition-all duration-150 cursor-pointer rounded-lg flex items-center space-x-1.5 ${
              activePage === 'evaluation'
                ? 'bg-blue-700/95 font-bold text-white shadow-xs'
                : 'hover:bg-white/15 text-white/90'
            }`}
          >
            <Award className="w-4 h-4 stroke-[2.2]" />
            <span>考核管理</span>
          </button>

          {/* 系统管理 Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setSystemMenuOpen(true)}
            onMouseLeave={() => setSystemMenuOpen(false)}
          >
            <button
              onClick={() => onNavigate('notice-management')}
              className={`px-3.5 py-1.5 transition-all duration-150 cursor-pointer rounded-lg flex items-center space-x-1.5 ${
                isSystemActive
                  ? 'bg-blue-700/95 font-bold text-white shadow-xs'
                  : 'hover:bg-white/15 text-white/90'
              }`}
            >
              <Settings className="w-4 h-4 stroke-[2.2]" />
              <span>系统管理</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 opacity-80 ${systemMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {systemMenuOpen && (
              <div className="absolute left-0 top-full mt-0.5 w-52 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100 p-1.5 z-50 text-sm animate-in fade-in duration-150">
                <button
                  onClick={() => {
                    onNavigate('org-management');
                    setSystemMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg hover:bg-blue-50 hover:text-[#1E5ABB] flex items-center space-x-2.5 cursor-pointer transition-colors ${
                    activePage === 'org-management' ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : 'text-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>组织架构管理</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('role-permission');
                    setSystemMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg hover:bg-blue-50 hover:text-[#1E5ABB] flex items-center space-x-2.5 cursor-pointer transition-colors ${
                    activePage === 'role-permission' ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : 'text-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>角色权限配置</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('template-management');
                    setSystemMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg hover:bg-blue-50 hover:text-[#1E5ABB] flex items-center space-x-2.5 cursor-pointer transition-colors ${
                    activePage === 'template-management' ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : 'text-slate-700'
                  }`}
                >
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>模板管理</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('audit-flow-config');
                    setSystemMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg hover:bg-blue-50 hover:text-[#1E5ABB] flex items-center space-x-2.5 cursor-pointer transition-colors ${
                    activePage === 'audit-flow-config' ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : 'text-slate-700'
                  }`}
                >
                  <GitFork className="w-4 h-4 text-purple-600" />
                  <span>审核流程配置</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('audit-score-config');
                    setSystemMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg hover:bg-blue-50 hover:text-[#1E5ABB] flex items-center space-x-2.5 cursor-pointer transition-colors ${
                    activePage === 'audit-score-config' ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : 'text-slate-700'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>审核打分配置</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('dict-management');
                    setSystemMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg hover:bg-blue-50 hover:text-[#1E5ABB] flex items-center space-x-2.5 cursor-pointer transition-colors ${
                    activePage === 'dict-management' ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : 'text-slate-700'
                  }`}
                >
                  <ListFilter className="w-4 h-4 text-teal-600" />
                  <span>数据字典管理</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('notice-management');
                    setSystemMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg hover:bg-blue-50 hover:text-[#1E5ABB] flex items-center space-x-2.5 cursor-pointer transition-colors ${
                    activePage === 'notice-management' ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : 'text-slate-700'
                  }`}
                >
                  <Megaphone className="w-4 h-4 text-[#1E5ABB]" />
                  <span>公告管理</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('value-added-services');
                    setSystemMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg hover:bg-blue-50 hover:text-[#1E5ABB] flex items-center space-x-2.5 cursor-pointer transition-colors ${
                    activePage === 'value-added-services' ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : 'text-slate-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>增值业务申请</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('system-logs');
                    setSystemMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg hover:bg-blue-50 hover:text-[#1E5ABB] flex items-center space-x-2.5 cursor-pointer transition-colors ${
                    activePage === 'system-logs' ? 'text-[#1E5ABB] font-bold bg-blue-50/80' : 'text-slate-700'
                  }`}
                >
                  <Clock className="w-4 h-4 text-emerald-600" />
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

