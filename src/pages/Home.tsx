import React, { useState } from 'react';
import { PageId, ReportItem, OrgItem } from '../types';
import {
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Trash2,
  ArrowRight,
  FileEdit,
  Inbox,
  CheckCircle2,
  Check,
  PlusCircle,
  ChevronLeft,
  AlertCircle,
  Zap,
  FileText,
  HelpCircle,
  ShieldAlert,
  BookOpen,
  FileSpreadsheet,
  Settings2,
  Send,
  SlidersHorizontal,
  Flame,
  MessageSquare,
  Radio
} from 'lucide-react';
import { PRESET_TEMPLATES, ReportTemplateDef } from '../components/NewReportModal';

export type SystemRoleMode = 'all' | 'reporter' | 'auditor';

interface HomeProps {
  reports: ReportItem[];
  orgs?: OrgItem[];
  onNavigate: (page: PageId) => void;
  onSelectReport?: (report: ReportItem) => void;
  onSelectAudit?: (report: ReportItem) => void;
  currentUser?: string;
  currentRoleTitle?: string;
  userRole?: SystemRoleMode;
  onOpenNewReport?: (templateData?: {
    title?: string;
    source?: string;
    region?: string;
    infoType?: string;
    summary?: string;
    demands?: string;
    recommendations?: string;
  }) => void;
}

type TimeRange = '本周' | '本月' | '本季度' | '本年' | '自定义区间';

interface DraftOrRejectedItem {
  id: string;
  title: string;
  summary: string;
  time: string;
  status: '草稿' | '已驳回';
  type: string;
  source?: string;
  region?: string;
  demands?: string;
  recommendations?: string;
  rejectReason?: string;
}

const INITIAL_SUBMIT_TODOS: DraftOrRejectedItem[] = [
  {
    id: 'draft-1',
    title: '公办幼儿园托育服务收费民意调查',
    summary: '家长群中出现关于托育服务收费标准的咨询和争议，正在补充政策依据与周边私立园对比数据。',
    time: '2026-08-13 07:50',
    status: '草稿',
    type: '民生诉求',
    source: '群众举报',
    region: '西屯区',
    demands: '建议联合物价局与教育局适时公布公办托育收费公示明细。',
    recommendations: '安排社区幼教联络员在家长群予以政策释疑。'
  },
  {
    id: 'draft-2',
    title: '关于辖区内老旧电梯故障频发的专项排查草稿',
    summary: '金地家园居民反映4号楼客梯近一月困人3次，物业维修后仍频繁停运，正在补充特种设备安检报告。',
    time: '2026-08-13 10:40',
    status: '草稿',
    type: '突发事件',
    source: '网格巡查',
    region: '北屯区',
    demands: '督促市场监管局特种设备科协调电梯原厂维保单位进场彻查。',
    recommendations: '在各单元公示维保日志与检修方案，消除恐慌。'
  },
  {
    id: 'rejected-1',
    title: '老旧小区改造政策解读及反馈收集',
    summary: '老旧小区加装电梯政策解读发布后，居民对出资比例和采光补偿提出疑问。',
    time: '2026-08-12 10:20',
    status: '已驳回',
    type: '民生诉求',
    source: '群众举报',
    region: '西屯区',
    rejectReason: '信息要素不完整，缺少加装电梯出资比例官方细则及低楼层补偿依据，请补充佐证材料后重新报送。',
    demands: '需补充加装电梯采光与低楼层补偿官方参考计算细则。',
    recommendations: '建议补充相关物权法条文依据后重新提交审核。'
  },
  {
    id: 'draft-3',
    title: '关于南坝商业街夜市噪音扰民的网格排查记录',
    summary: '周边小区业主多次拨打12345热线反映烧烤摊占道经营与音响扰民，拟补充城管执法队联合巡查处置方案。',
    time: '2026-08-11 18:30',
    status: '草稿',
    type: '民生诉求',
    source: '网格巡查',
    region: '南屯区'
  },
  {
    id: 'rejected-2',
    title: '关于主干道早高峰红绿灯配时优化的建议报送',
    summary: '交警支队反馈需补充早晚高峰车流量测算图与路口监控实录佐证，已退回重新核实后提交。',
    time: '2026-08-10 14:15',
    status: '已驳回',
    type: '政策解读',
    source: '群众举报',
    region: '西屯区',
    rejectReason: '缺少早晚高峰实测车流量比对数据与路口监控实录佐证，请核实后补充提交。'
  }
];

const INITIAL_PENDING_AUDITS = [
  {
    id: 101,
    title: '关于某社区突发停水事件的舆情上报',
    organization: '台中市网信办',
    author: '张三',
    submitTime: '2026-08-13 09:30',
    auditStatus: '待审核',
    source: '群众举报',
    region: '西屯区',
    infoType: '突发事件',
    detailContent: {
      summary: '多名居民在微信群和短视频平台反映西坝区阳光花园一期、明月居等小区突发停水，早高峰生活用水受到影响。'
    }
  },
  {
    id: 102,
    title: '短视频平台涉及虚假宣传的群众举报核查',
    organization: '台中市网信办',
    author: '张三',
    submitTime: '2026-08-13 08:45',
    auditStatus: '待审核',
    source: '群众举报',
    region: '西屯区',
    infoType: '网络谣言',
    detailContent: {
      summary: '网民举报某直播账号夸大保健产品疗效，评论区存在集中投诉与维权诉求。'
    }
  },
  {
    id: 103,
    title: '某万达广场商户集体维权引发网络关注',
    organization: '南坝区商务局',
    author: '王强',
    submitTime: '2026-08-13 09:15',
    auditStatus: '待审核',
    source: '网格巡查',
    region: '南屯区',
    infoType: '突发事件',
    detailContent: {
      summary: '多名商户在抖音发布视频，反映万达广场管理方擅自调高租金及公摊水电费，现场有拉横幅现象。'
    }
  },
  {
    id: 104,
    title: '万达广场物业拉横幅纠纷核查速报',
    organization: '南坝区网信办',
    author: '李明',
    submitTime: '2026-08-13 08:20',
    auditStatus: '待审核',
    source: '网格巡查',
    region: '南屯区',
    infoType: '突发事件',
    detailContent: {
      summary: '网格员巡查发现万达广场门口聚集约15名商户，现场民警已在维持秩序，正在协调商管处介入。'
    }
  },
  {
    id: 105,
    title: '关于北屯区自来水管道突发破裂抢修进展报送',
    organization: '北屯区网信办',
    author: '周敏',
    submitTime: '2026-08-12 16:40',
    auditStatus: '待审核',
    source: '群众举报',
    region: '北屯区',
    infoType: '突发事件',
    detailContent: {
      summary: '北屯北路与青年街路口主管道渗漏，水务抢修车辆已到场，预计当晚21点前恢复供水。'
    }
  }
];

export const Home: React.FC<HomeProps> = ({
  reports,
  onNavigate,
  onSelectReport,
  onSelectAudit,
  onOpenNewReport,
  currentUser = '张三',
  currentRoleTitle = '超级管理员',
  userRole
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('本周');
  const [submitTodos, setSubmitTodos] = useState<DraftOrRejectedItem[]>(INITIAL_SUBMIT_TODOS);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Pagination states for fixed regions (3 items per page)
  const [submitPageIndex, setSubmitPageIndex] = useState(1);
  const [auditPageIndex, setAuditPageIndex] = useState(1);
  const PAGE_SIZE = 3;

  // Automatically determine the active role mode matched by the system
  const effectiveRoleMode: SystemRoleMode = (() => {
    if (userRole) return userRole;
    if (
      (currentRoleTitle.includes('上报') || currentRoleTitle.includes('填报')) &&
      currentRoleTitle.includes('审核')
    ) {
      return 'all';
    }
    if (currentRoleTitle.includes('管理员') || currentRoleTitle.includes('超级') || currentRoleTitle.includes('全权')) {
      return 'all';
    }
    if (currentRoleTitle.includes('审核')) {
      return 'auditor';
    }
    if (currentRoleTitle.includes('上报') || currentRoleTitle.includes('填报') || currentRoleTitle.includes('速报')) {
      return 'reporter';
    }
    return 'all';
  })();

  const showReporter = effectiveRoleMode === 'all' || effectiveRoleMode === 'reporter';
  const showAuditor = effectiveRoleMode === 'all' || effectiveRoleMode === 'auditor';

  // Multi-range stats configuration
  const statsConfig = {
    本周: {
      submitWait: submitTodos.length,
      submitDraft: submitTodos.filter((t) => t.status === '草稿').length,
      submitReject: submitTodos.filter((t) => t.status === '已驳回').length,
      submitTotal: 11,
      submitPassed: 1,
      submitPending: 9,
      submitPassRate: '9%',
      submitDirectPass: 0,
      submitRepairPass: 1,
      submitOncePassRate: '0%',

      auditWait: 5,
      auditTotal: 2,
      auditTotalPool: 7,
      auditProcessRate: '29%',
      auditAvgResponse: '1 h',
      auditPassed: 1,
      auditRejected: 1,
      auditPending: 5
    },
    本月: {
      submitWait: 7,
      submitDraft: 4,
      submitReject: 3,
      submitTotal: 38,
      submitPassed: 19,
      submitPending: 16,
      submitPassRate: '50%',
      submitDirectPass: 12,
      submitRepairPass: 7,
      submitOncePassRate: '31%',

      auditWait: 12,
      auditTotal: 24,
      auditTotalPool: 36,
      auditProcessRate: '67%',
      auditAvgResponse: '45 min',
      auditPassed: 19,
      auditRejected: 5,
      auditPending: 12
    },
    本季度: {
      submitWait: 14,
      submitDraft: 9,
      submitReject: 5,
      submitTotal: 112,
      submitPassed: 86,
      submitPending: 21,
      submitPassRate: '77%',
      submitDirectPass: 68,
      submitRepairPass: 18,
      submitOncePassRate: '60%',

      auditWait: 18,
      auditTotal: 98,
      auditTotalPool: 116,
      auditProcessRate: '84%',
      auditAvgResponse: '35 min',
      auditPassed: 86,
      auditRejected: 12,
      auditPending: 18
    },
    本年: {
      submitWait: 22,
      submitDraft: 15,
      submitReject: 7,
      submitTotal: 345,
      submitPassed: 302,
      submitPending: 36,
      submitPassRate: '87%',
      submitDirectPass: 254,
      submitRepairPass: 48,
      submitOncePassRate: '73%',

      auditWait: 26,
      auditTotal: 328,
      auditTotalPool: 354,
      auditProcessRate: '92%',
      auditAvgResponse: '28 min',
      auditPassed: 302,
      auditRejected: 26,
      auditPending: 26
    },
    自定义区间: {
      submitWait: 5,
      submitDraft: 3,
      submitReject: 2,
      submitTotal: 20,
      submitPassed: 8,
      submitPending: 10,
      submitPassRate: '40%',
      submitDirectPass: 5,
      submitRepairPass: 3,
      submitOncePassRate: '25%',

      auditWait: 8,
      auditTotal: 12,
      auditTotalPool: 20,
      auditProcessRate: '60%',
      auditAvgResponse: '50 min',
      auditPassed: 8,
      auditRejected: 4,
      auditPending: 8
    }
  };

  const currentStats = statsConfig[timeRange];

  // Merge reports with status 待审核 or fallback
  const realPendingAudits = reports.filter((r) => r.auditStatus === '待审核');
  const allPendingAudits = realPendingAudits.length > 0 ? realPendingAudits : (INITIAL_PENDING_AUDITS as unknown as ReportItem[]);

  // Pagination slicing
  const submitTotalPages = Math.ceil(submitTodos.length / PAGE_SIZE) || 1;
  const currentSubmitTodos = submitTodos.slice(
    (submitPageIndex - 1) * PAGE_SIZE,
    submitPageIndex * PAGE_SIZE
  );

  const auditTotalPages = Math.ceil(allPendingAudits.length / PAGE_SIZE) || 1;
  const currentPendingAudits = allPendingAudits.slice(
    (auditPageIndex - 1) * PAGE_SIZE,
    auditPageIndex * PAGE_SIZE
  );

  const handleDeleteSubmitTodo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSubmitTodos((prev) => {
      const next = prev.filter((item) => item.id !== id);
      const newTotalPages = Math.ceil(next.length / PAGE_SIZE) || 1;
      if (submitPageIndex > newTotalPages) {
        setSubmitPageIndex(newTotalPages);
      }
      return next;
    });
    setActionToast('已成功删除该记录');
    setTimeout(() => setActionToast(null), 2500);
  };

  const handleOpenDraftEdit = (item: DraftOrRejectedItem) => {
    onOpenNewReport?.({
      title: item.title,
      source: item.source || '群众举报',
      region: item.region || '西屯区',
      infoType: item.type || '民生诉求',
      summary: item.summary,
      demands: item.demands || '',
      recommendations: item.recommendations || ''
    });
  };

  return (
    <div className="space-y-6 pb-12 max-w-[1720px] mx-auto">
      {/* Toast Notification */}
      {actionToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center space-x-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* ================= 1. 顶部双重视角指标概览卡片 (上报员 + 审核员 并存) ================= */}
      <div
        className={`grid gap-5 ${
          showReporter && showAuditor ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* 1.1 上报员视角指标卡片 (蓝色系) */}
        {showReporter && (
          <div className="bg-gradient-to-br from-[#185adb] via-[#1e60dc] to-[#0ea5e9] rounded-2xl p-4.5 sm:p-5 text-white shadow-sm relative overflow-hidden flex flex-col justify-between border border-blue-400/30">
            <div className="absolute right-0 bottom-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-8 translate-y-8"></div>
            <div className="relative z-10 space-y-3.5">
              {/* 待办提醒通告条（作为卡片头部） */}
              <div className="bg-white/95 backdrop-blur-md rounded-xl p-3.5 border border-white/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-[#1E5ABB] text-white flex items-center justify-center shadow-xs shrink-0">
                    <FileEdit className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight">
                        今日报送待办：共有 <strong className="text-blue-600 font-mono font-black text-sm sm:text-base">{submitTodos.length || 5}</strong> 项待处理
                      </span>
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        上报员
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-medium">
                      <span className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"></span>
                        <span>草稿: <strong className="text-slate-800 font-bold font-mono">{submitTodos.filter(t => t.status === '草稿').length || 3}</strong></span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                        <span>驳回: <strong className="text-rose-600 font-bold font-mono">{submitTodos.filter(t => t.status === '已驳回').length || 2}</strong></span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                        <span>待审核: <strong className="text-amber-700 font-bold font-mono">{currentStats.submitPending || 7}</strong></span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => {
                      const el = document.getElementById('reporter-todo-section');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        onNavigate('report-summary');
                      }
                    }}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1E5ABB] font-bold text-xs rounded-lg border border-blue-200 shadow-2xs hover:shadow-xs flex items-center space-x-1 transition-all cursor-pointer group"
                  >
                    <span>立即处理 ({submitTodos.length || 5})</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#1E5ABB] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* 核心指标 4 列网格 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div
                  onClick={() => {
                    const el = document.getElementById('reporter-todo-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white/15 hover:bg-white/25 transition-all backdrop-blur-sm rounded-xl p-3 border border-white/25 cursor-pointer group shadow-2xs"
                >
                  <div className="text-xs text-white/80 font-medium mb-0.5">报送待办</div>
                  <div className="text-2xl sm:text-3xl font-black text-white leading-tight group-hover:scale-105 transition-transform">
                    {currentStats.submitWait}
                  </div>
                  <div className="text-[11px] text-white/75 mt-0.5 truncate">
                    草稿 {currentStats.submitDraft} · 驳回 {currentStats.submitReject}
                  </div>
                </div>

                <div
                  onClick={() => onNavigate('report-summary')}
                  className="bg-white/15 hover:bg-white/25 transition-all backdrop-blur-sm rounded-xl p-3 border border-white/25 cursor-pointer group shadow-2xs"
                >
                  <div className="text-xs text-white/80 font-medium mb-0.5">累计上报</div>
                  <div className="text-2xl sm:text-3xl font-black text-white leading-tight group-hover:scale-105 transition-transform">
                    {currentStats.submitTotal}
                  </div>
                  <div className="text-[11px] text-white/75 mt-0.5 truncate">
                    通过 {currentStats.submitPassed} · 待审 {currentStats.submitPending}
                  </div>
                </div>

                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/25 shadow-2xs">
                  <div className="text-xs text-white/80 font-medium mb-0.5">一次性通过率</div>
                  <div className="text-2xl sm:text-3xl font-black text-[#5CFFC6] leading-tight">
                    {currentStats.submitOncePassRate || (currentStats.submitTotal ? `${Math.round(((currentStats.submitDirectPass || 0) / currentStats.submitTotal) * 100)}%` : '0%')}
                  </div>
                  <div className="text-[11px] text-white/75 mt-0.5 truncate">
                    {currentStats.submitDirectPass || 0}/{currentStats.submitTotal} 首审直通
                  </div>
                </div>

                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/25 shadow-2xs">
                  <div className="text-xs text-white/80 font-medium mb-0.5">整体通过率</div>
                  <div className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {currentStats.submitPassRate}
                  </div>
                  <div className="text-[11px] text-white/75 mt-0.5 truncate">
                    {currentStats.submitPassed}/{currentStats.submitTotal} 终审已过
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1.2 审核员视角指标卡片 (靛青/琥珀色系) */}
        {showAuditor && (
          <div className="bg-gradient-to-br from-[#1E293B] via-[#1E3A8A] to-[#2563EB] rounded-2xl p-4.5 sm:p-5 text-white shadow-sm relative overflow-hidden flex flex-col justify-between border border-blue-400/30">
            <div className="absolute right-0 bottom-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none transform translate-x-8 translate-y-8"></div>
            <div className="relative z-10 space-y-3.5">
              {/* 审核提醒通告条（作为卡片头部） */}
              <div className="bg-white/95 backdrop-blur-md rounded-xl p-3.5 border border-white/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight">
                        今日审核待办：共有 <strong className="text-amber-600 font-mono font-black text-sm sm:text-base">{allPendingAudits.length}</strong> 条线索待审批
                      </span>
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        审核员
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-medium">
                      <span className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                        <span>待审批: <strong className="text-amber-800 font-bold font-mono">{allPendingAudits.length}</strong> 条</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                        <span>已通过: <strong className="text-emerald-700 font-bold font-mono">{currentStats.auditPassed}</strong> 条</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                        <span>已驳回: <strong className="text-rose-700 font-bold font-mono">{currentStats.auditRejected}</strong> 条</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => {
                      const el = document.getElementById('auditor-todo-section');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        onNavigate('report-audit');
                      }
                    }}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-lg border border-amber-200 shadow-2xs hover:shadow-xs flex items-center space-x-1 transition-all cursor-pointer group"
                  >
                    <span>立即审批</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-900 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* 核心指标 4 列网格 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* 1. 审核待办 */}
                <div
                  onClick={() => {
                    const el = document.getElementById('auditor-todo-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white/15 hover:bg-white/25 transition-all backdrop-blur-sm rounded-xl p-3 border border-white/25 cursor-pointer group shadow-2xs"
                >
                  <div className="text-xs text-white/90 font-medium mb-0.5">审核待办</div>
                  <div className="text-2xl sm:text-3xl font-black text-yellow-400 leading-tight group-hover:scale-105 transition-transform">
                    {allPendingAudits.length || currentStats.auditWait || 5}
                  </div>
                  <div className="text-[11px] text-white/80 mt-0.5 truncate">
                    待审核
                  </div>
                </div>

                {/* 2. 累计审核 */}
                <div
                  onClick={() => onNavigate('audit-records')}
                  className="bg-white/15 hover:bg-white/25 transition-all backdrop-blur-sm rounded-xl p-3 border border-white/25 cursor-pointer group shadow-2xs"
                >
                  <div className="text-xs text-white/90 font-medium mb-0.5">累计审核</div>
                  <div className="text-2xl sm:text-3xl font-black text-white leading-tight group-hover:scale-105 transition-transform">
                    {currentStats.auditTotal}
                  </div>
                  <div className="text-[11px] text-white/80 mt-0.5 truncate flex items-center space-x-1.5 font-medium">
                    <span className="text-emerald-300">通过:{currentStats.auditPassed}</span>
                    <span className="text-rose-300">驳回:{currentStats.auditRejected}</span>
                  </div>
                </div>

                {/* 3. 审核处理率 */}
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/25 shadow-2xs">
                  <div className="text-xs text-white/90 font-medium mb-0.5">审核处理率</div>
                  <div className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {currentStats.auditProcessRate}
                  </div>
                  <div className="text-[11px] text-white/80 mt-0.5 truncate">
                    {currentStats.auditTotal}/{currentStats.auditTotalPool || 7}
                  </div>
                </div>

                {/* 4. 平均响应 */}
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/25 shadow-2xs">
                  <div className="text-xs text-white/90 font-medium mb-0.5">平均响应</div>
                  <div className="text-2xl sm:text-3xl font-black text-cyan-300 leading-tight">
                    {currentStats.auditAvgResponse}
                  </div>
                  <div className="text-[11px] text-white/80 mt-0.5 truncate">
                    审核耗时
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= 2. 各模版快捷上报入口 (标准化上报模板专区) ================= */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
        {/* Section Header */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">标准化上报模板专区</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              选择适用业务场景预置模板，一键快速填报
            </p>
          </div>
        </div>

        {/* 3 列标准化模板卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          {/* 卡片 1: 突发事件速报模板 */}
          <div
            onClick={() => {
              onOpenNewReport?.({
                title: '【紧急】关于某路段突发管网故障抢修进展的快报',
                source: '网格巡查',
                region: '西屯区',
                infoType: '突发事件',
                summary: `【突发时间】：${new Date().toLocaleDateString('zh-CN')} ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}\n【事发精准地点】：西屯区XX路与XX街交叉口\n【事件简述】：现场因市政施工突发管网渗漏，造成路面局部积水并影响早高峰通行。\n【伤亡及损失情况】：现场无人员伤亡，周边已设立安全警戒线。\n【当前处置进展】：抢修工程车辆及应急处置组已进场作业，正在进行分流抢修。`,
                demands: '周边居民及过往车主高度关注积水排除与恢复通行的预计时间。',
                recommendations: '1. 联动交警支队实施临时交通分流与道路交通疏导。\n2. 属地融媒体中心通过微信公众号发布临时通行提示，回应群众关切。'
              });
            }}
            className="bg-white rounded-xl border border-slate-200/90 p-4 flex items-center justify-between hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0 group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-slate-800 group-hover:text-rose-600 transition-colors truncate">
                  突发事件速报模板
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  现场秩序、安全事故、应急研判
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </div>

          {/* 卡片 2: 民生诉求核查模板 */}
          <div
            onClick={() => {
              onOpenNewReport?.({
                title: '关于某小区业主反映物业擅自调高公摊费用的诉求专报',
                source: '热线12345',
                region: '北屯区',
                infoType: '民生诉求',
                summary: `一、诉求来源与规模：\n12345热线近3日内累计收到相关工单12件，涉及业主超过50户。\n\n二、诉求核心事实：\n业主反映物业管理处未履行公示与表决程序，直接在月度物业费账单中增列地下车库公共能耗费用。\n\n三、初步调解情况：\n社区居委会已介入搭建沟通平台，督促物业做好账目核算。`,
                demands: '业主普遍要求物业撤回不合理收费项目，退还已代扣款项，并公开年度公摊水电账目。',
                recommendations: '1. 建议街道城管科联合房管局约谈物业负责人，限期3日内自查自纠并出具整改说明。\n2. 社区居委会指导业主委员会依法召开业主代表沟通会。'
              });
            }}
            className="bg-white rounded-xl border border-slate-200/90 p-4 flex items-center justify-between hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-slate-800 group-hover:text-amber-600 transition-colors truncate">
                  民生诉求核查模板
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  物业维修、水电气热、市政诉求
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </div>

          {/* 卡片 3: 网络谣言线索模板 */}
          <div
            onClick={() => {
              onOpenNewReport?.({
                title: '关于短视频平台流传“某小区突发不明气体泄漏”虚假信息的核查澄清报送',
                source: '网络巡查',
                region: '南屯区',
                infoType: '网络谣言',
                summary: `一、谣言源头与传播特征：\n抖音账号“XX市民热心事”于今晨发布15秒短视频，配文称“某小区疑似发生危化品气体泄漏”，截至目前点赞量达1.2万次，转发3500余次。\n\n二、官方部门实地核查：\n属地应急管理局与生态环境执法大队第一时间赶赴现场排查，实为周边市政自来水管道例行冲洗排放水雾，未检出任何有害气体。\n\n三、当前发酵态势：\n评论区存在个别恐慌情绪蔓延，急需权威声音辟谣。`,
                demands: '网民关注官方权威调查结论与是否存在安全隐患。',
                recommendations: '1. 建议网信办联合应急管理局在官方微博与抖音号发布权威辟谣通报。\n2. 对首发造谣账号予以限流并固定电子证据，移交公安部门进一步处理。'
              });
            }}
            className="bg-white rounded-xl border border-slate-200/90 p-4 flex items-center justify-between hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-105 transition-transform">
                <Radio className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-slate-800 group-hover:text-emerald-600 transition-colors truncate">
                  网络谣言线索模板
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  网络不实信息、虚假炒作辟谣
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </div>
        </div>
      </div>

      {/* ================= 3. 待办任务专区 (固定区域展示 · 支持翻页与滚动) ================= */}
      <div
        className={`grid gap-5 ${
          showReporter && showAuditor ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* 3.1 【报送待办列表：草稿与已驳回】 */}
        {showReporter && (
          <div
            id="reporter-todo-section"
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between h-[510px]"
          >
            {/* Top: Header */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3.5">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1E5ABB] flex items-center justify-center">
                    <FileEdit className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">报送待办列表</h3>
                    <span className="text-[11px] text-slate-400">草稿与已驳回待修改事项</span>
                  </div>
                  <span className="bg-blue-100 text-[#1E5ABB] text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                    {submitTodos.length}
                  </span>
                </div>
              </div>

              {/* Scrollable / Paged Item Container (Fixed Height) */}
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {submitTodos.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    <Inbox className="w-9 h-9 mx-auto mb-2 opacity-40" />
                    <p>暂无待办或草稿事项</p>
                  </div>
                ) : (
                  currentSubmitTodos.map((item) => {
                    const isDraft = item.status === '草稿';
                    const isRejected = item.status === '已驳回';
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleOpenDraftEdit(item)}
                        className="bg-slate-50/80 hover:bg-blue-50/40 border border-slate-200/80 hover:border-blue-300 rounded-xl p-3.5 transition-all duration-150 cursor-pointer group space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-slate-800 group-hover:text-[#1E5ABB] transition-colors leading-snug truncate">
                            {item.title}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                              isDraft
                                ? 'bg-slate-200/80 text-slate-700 border border-slate-300/80'
                                : 'bg-rose-100/90 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        {/* Rejection notice */}
                        {isRejected && (
                          <div className="p-2 bg-rose-50/90 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start space-x-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                            <div className="leading-tight">
                              <span className="font-bold text-rose-900">驳回原因：</span>
                              <span>{item.rejectReason || '信息要素不完整，请补充相关佐证材料后重新提交。'}</span>
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {item.summary}
                        </p>

                        <div className="flex items-center justify-between pt-1 text-xs text-slate-400 border-t border-slate-100/80">
                          <span className="text-[11px]">{item.time}</span>
                          <div className="flex items-center space-x-2.5">
                            <button
                              onClick={(e) => handleDeleteSubmitTodo(item.id, e)}
                              title="删除记录"
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[#1E5ABB] font-bold text-xs flex items-center space-x-0.5 group-hover:translate-x-0.5 transition-transform">
                              <span>详情</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom: Pagination Controls & Hint */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 mt-2">
              <span className="text-[11px] text-slate-400">默认显示近三个月数据</span>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-500 font-medium">
                  第 {submitPageIndex}/{submitTotalPages} 页 (共{submitTodos.length}条)
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setSubmitPageIndex((p) => Math.max(1, p - 1))}
                    disabled={submitPageIndex <= 1}
                    className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                    title="上一页"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => setSubmitPageIndex((p) => Math.min(submitTotalPages, p + 1))}
                    disabled={submitPageIndex >= submitTotalPages}
                    className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                    title="下一页"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3.2 【审核待审核数据列表】 */}
        {showAuditor && (
          <div
            id="auditor-todo-section"
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between h-[510px]"
          >
            {/* Top: Header */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3.5">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">审核待审核列表</h3>
                    <span className="text-[11px] text-slate-400">待审批批复的速报线索</span>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                    {allPendingAudits.length}
                  </span>
                </div>
              </div>

              {/* Scrollable / Paged Item Container (Fixed Height) */}
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {allPendingAudits.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    <CheckCircle2 className="w-9 h-9 mx-auto mb-2 text-emerald-500 opacity-60" />
                    <p>暂无待审核任务</p>
                  </div>
                ) : (
                  currentPendingAudits.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectAudit?.(item);
                        onNavigate('audit-detail');
                      }}
                      className="bg-slate-50/80 hover:bg-blue-50/40 border border-slate-200/80 hover:border-blue-300 rounded-xl p-3.5 transition-all duration-150 cursor-pointer group space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-slate-800 group-hover:text-[#1E5ABB] transition-colors leading-snug truncate">
                          {item.title}
                        </h4>
                        <span className="bg-[#FFF7E6] text-[#D46B08] border border-[#FFD591] text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0">
                          待审核
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {item.detailContent?.summary || '该速报已提交，正等待审核员研判审核批复。'}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-xs text-slate-500 border-t border-slate-100/80">
                        <div className="flex items-center space-x-1.5 truncate max-w-[280px] text-[11px]">
                          <span className="font-medium text-slate-700">{item.organization}</span>
                          <span>·</span>
                          <span>{item.author}</span>
                          <span>·</span>
                          <span className="text-slate-400">{item.submitTime}</span>
                        </div>

                        <span className="text-[#1E5ABB] font-bold text-xs flex items-center space-x-0.5 group-hover:translate-x-0.5 transition-transform shrink-0">
                          <span>详情</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom: Pagination Controls & Hint */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 mt-2">
              <span className="text-[11px] text-slate-400">默认显示近三个月待审数据</span>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-500 font-medium">
                  第 {auditPageIndex}/{auditTotalPages} 页 (共{allPendingAudits.length}条)
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setAuditPageIndex((p) => Math.max(1, p - 1))}
                    disabled={auditPageIndex <= 1}
                    className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                    title="上一页"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => setAuditPageIndex((p) => Math.min(auditTotalPages, p + 1))}
                    disabled={auditPageIndex >= auditTotalPages}
                    className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                    title="下一页"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
