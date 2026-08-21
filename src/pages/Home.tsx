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
  Flame,
  MessageSquare,
  Radio,
  CheckCircle2,
  Check,
  PlusCircle,
  BarChart3,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';

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

  const handleSelectTemplate = (type: 'emergency' | 'livelihood' | 'rumor') => {
    if (type === 'emergency') {
      onOpenNewReport?.({
        title: '【突发事件速报】关于辖区突发事件的核查情况报告',
        infoType: '突发事件',
        source: '群众举报',
        region: '西屯区',
        summary: '【突发事件速报】\n发生时间：2026年8月19日\n发生地点：西屯区主干道路段\n涉及人数：约30人\n现场影响情况：道路局部拥堵，现场已有交警到场处置，总体秩序受控。',
        demands: '请协调相关应急与公安部门联动处置，发布官方通告引导舆论。',
        recommendations: '建议持续跟进舆情走势，做好信息公开与辟谣准备。'
      });
    } else if (type === 'livelihood') {
      onOpenNewReport?.({
        title: '【民生诉求核查】关于社区网格居民反映民生事项核实报告',
        infoType: '民生诉求',
        source: '群众举报',
        region: '北屯区',
        summary: '【民生诉求核查】\n反映人员：社区网格居民代表\n诉求事项：关于小区公共绿化修剪及供水管道维护诉求\n调查核实细节：网格员现场核实情况属实，物业正在拟定维修改造方案。',
        demands: '建议街道办督促物业公司于3个工作日内出具施工进度计划表。',
        recommendations: '安排社区书记对接居民网格群，实时通报进展以平息疑虑。'
      });
    } else if (type === 'rumor') {
      onOpenNewReport?.({
        title: '【网络谣言线索】关于社交平台流传不实信息的研判报告',
        infoType: '舆情动态',
        source: '社交媒体',
        region: '全市',
        summary: '【网络谣言线索】\n谣言主要观点：网传某学校近期发生重大安全事故\n首发及传播平台：抖音、微博、微信群聊\n扩散路径：个别自媒体账号搬运二创，短时间内点赞转发达3000+\n传播危害：引发部分家长焦虑恐慌，已严重误导公众认知。',
        demands: '建议联合教育局与公安网安大队立即发布权威辟谣声明。',
        recommendations: '对造谣传谣账号依法依规依约从严处置。'
      });
    }
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

      {/* ================= 1. 顶部角色数据指标概览 (自适应排版) ================= */}
      <div
        className={`grid gap-4 sm:gap-5 ${
          showReporter && showAuditor ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* 1.1 【上报员】报送数据概览卡片 */}
        {showReporter && (
          <div className="bg-gradient-to-br from-[#185adb] via-[#1e60dc] to-[#0ea5e9] rounded-2xl p-5 text-white shadow-sm relative overflow-hidden flex flex-col justify-between border border-blue-400/30">
            <div className="absolute right-0 bottom-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-8 translate-y-8"></div>
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#38ef7d] shadow-sm animate-pulse"></div>
                  <h3 className="font-extrabold text-sm sm:text-base tracking-wide text-white drop-shadow-xs">
                    【上报员】报送数据概览
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('report-summary')}
                  className="text-xs text-white/90 hover:text-white bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center space-x-1 font-semibold transition-all border border-white/20 cursor-pointer"
                >
                  <span>报送管理</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
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
                  <div className="text-xs text-white/80 font-medium mb-0.5">整体通过率</div>
                  <div className="text-2xl sm:text-3xl font-black text-[#5CFFC6] leading-tight">
                    {currentStats.submitPassRate}
                  </div>
                  <div className="text-[11px] text-white/75 mt-0.5 truncate">
                    {currentStats.submitPassed}/{currentStats.submitTotal} 已通过
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1.2 【审核员】审核数据概览卡片 */}
        {showAuditor && (
          <div className="bg-gradient-to-br from-[#0f3b82] via-[#1d4ed8] to-[#2563eb] rounded-2xl p-5 text-white shadow-sm relative overflow-hidden flex flex-col justify-between border border-blue-500/30">
            <div className="absolute right-0 bottom-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-8 translate-y-8"></div>
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#fbbf24] shadow-sm animate-pulse"></div>
                  <h3 className="font-extrabold text-sm sm:text-base tracking-wide text-white drop-shadow-xs">
                    【审核员】审核数据概览
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('report-audit')}
                  className="text-xs text-white/90 hover:text-white bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center space-x-1 font-semibold transition-all border border-white/20 cursor-pointer"
                >
                  <span>审核管理</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  onClick={() => {
                    const el = document.getElementById('auditor-todo-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white/15 hover:bg-white/25 transition-all backdrop-blur-sm rounded-xl p-3 border border-white/25 cursor-pointer group shadow-2xs"
                >
                  <div className="text-xs text-white/80 font-medium mb-0.5">审核待办</div>
                  <div className="text-2xl sm:text-3xl font-black text-[#FFDF00] leading-tight group-hover:scale-105 transition-transform">
                    {currentStats.auditWait}
                  </div>
                  <div className="text-[11px] text-white/75 mt-0.5 truncate">待审速报</div>
                </div>

                <div
                  onClick={() => onNavigate('audit-records')}
                  className="bg-white/15 hover:bg-white/25 transition-all backdrop-blur-sm rounded-xl p-3 border border-white/25 cursor-pointer group shadow-2xs"
                >
                  <div className="text-xs text-white/80 font-medium mb-0.5">累计审核</div>
                  <div className="text-2xl sm:text-3xl font-black text-white leading-tight group-hover:scale-105 transition-transform">
                    {currentStats.auditTotal}
                  </div>
                  <div className="text-[11px] text-white/75 mt-0.5 truncate">已办结</div>
                </div>

                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/25 shadow-2xs">
                  <div className="text-xs text-white/80 font-medium mb-0.5">处理率</div>
                  <div className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {currentStats.auditProcessRate}
                  </div>
                  <div className="text-[11px] text-white/75 mt-0.5 truncate">
                    {currentStats.auditTotal}/{currentStats.auditTotalPool} 办结
                  </div>
                </div>

                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/25 shadow-2xs">
                  <div className="text-xs text-white/80 font-medium mb-0.5">平均响应</div>
                  <div className="text-2xl sm:text-3xl font-black text-[#96F0FF] leading-tight">
                    {currentStats.auditAvgResponse}
                  </div>
                  <div className="text-[11px] text-white/75 mt-0.5 truncate">审核耗时</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= 2. 标准化速报模板专区 (3列横向水平平衡网格) ================= */}
      {showReporter && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1E5ABB] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#1E5ABB]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">标准化上报模板专区</h3>
                <p className="text-[11px] text-slate-400">选择适用业务场景预置模板，一键快速填报</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Template 1: 突发事件 */}
            <div
              onClick={() => handleSelectTemplate('emergency')}
              className="bg-slate-50/70 hover:bg-red-50/40 border border-slate-200/90 hover:border-red-300 rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-sm group flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-red-100/90 text-red-600 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 group-hover:text-red-600 transition-colors">
                    突发事件速报模板
                  </h4>
                  <span className="text-[11px] text-slate-400">现场秩序、安全事故、应急研判</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
            </div>

            {/* Template 2: 民生诉求 */}
            <div
              onClick={() => handleSelectTemplate('livelihood')}
              className="bg-slate-50/70 hover:bg-amber-50/40 border border-slate-200/90 hover:border-amber-300 rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-sm group flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100/90 text-amber-600 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 group-hover:text-amber-700 transition-colors">
                    民生诉求核查模板
                  </h4>
                  <span className="text-[11px] text-slate-400">物业维权、水电气热、市政诉求</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
            </div>

            {/* Template 3: 网络谣言 */}
            <div
              onClick={() => handleSelectTemplate('rumor')}
              className="bg-slate-50/70 hover:bg-emerald-50/40 border border-slate-200/90 hover:border-emerald-300 rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-sm group flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100/90 text-emerald-600 flex items-center justify-center shrink-0">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 group-hover:text-emerald-700 transition-colors">
                    网络谣言线索模板
                  </h4>
                  <span className="text-[11px] text-slate-400">网络不实信息、虚假炒作辟谣</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      )}

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

                <button
                  onClick={() => onNavigate('report-summary')}
                  className="text-xs text-[#1E5ABB] hover:text-blue-700 font-bold flex items-center space-x-0.5 cursor-pointer"
                >
                  <span>报送管理</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
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
                    <span className="text-[11px] text-slate-400">待研判批复的速报线索</span>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                    {allPendingAudits.length}
                  </span>
                </div>

                <button
                  onClick={() => onNavigate('report-audit')}
                  className="text-xs text-[#1E5ABB] hover:text-blue-700 font-bold flex items-center space-x-0.5 cursor-pointer"
                >
                  <span>审核管理</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
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

      {/* ================= 4. 统计图放在一起 (统一综合统计分析大板块) ================= */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-5">
        {/* Header with Time Capsule */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">舆情速报数据统计分析看板</h3>
              <p className="text-[11px] text-slate-400">统计周期内报送效能与审核履职情况综合分析</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs self-start sm:self-auto">
            {(['本周', '本月', '本季度', '本年', '自定义区间'] as TimeRange[]).map((tab) => {
              const isActive = timeRange === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setTimeRange(tab)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#1E5ABB] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Charts Grid: 报送统计 + 审核统计 紧凑合并放在一起 */}
        <div
          className={`grid gap-5 ${
            showReporter && showAuditor ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {/* 4.1 报送统计卡片 */}
          {showReporter && (
            <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-200/70 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1E5ABB]"></div>
                  <h4 className="font-bold text-sm text-slate-900">报送成效统计</h4>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">按上报任务</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="relative flex items-center justify-center py-2">
                  <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="46" className="stroke-slate-200/70" strokeWidth="12" fill="transparent" />
                    <circle cx="60" cy="60" r="46" stroke="#94A3B8" strokeWidth="12" fill="transparent" strokeDasharray="289" strokeDashoffset="70" strokeLinecap="round" />
                    <circle cx="60" cy="60" r="46" stroke="#0091FF" strokeWidth="12" fill="transparent" strokeDasharray="289" strokeDashoffset="245" strokeLinecap="round" />
                    <circle cx="60" cy="60" r="46" stroke="#FF4D4F" strokeWidth="12" fill="transparent" strokeDasharray="289" strokeDashoffset="265" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-[11px] text-slate-400 font-medium">累计上报</span>
                    <span className="text-2xl font-black text-slate-900 leading-tight">{currentStats.submitTotal}</span>
                    <span className="text-[10px] text-slate-400">件</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00C288]"></span>
                      <span className="text-slate-700 font-medium">一次性通过</span>
                    </div>
                    <span className="font-bold text-slate-900">{currentStats.submitDirectPass} 件</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0091FF]"></span>
                      <span className="text-slate-700 font-medium">返修通过</span>
                    </div>
                    <span className="font-bold text-slate-900">{currentStats.submitRepairPass} 件</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]"></span>
                      <span className="text-slate-700 font-medium">待审核</span>
                    </div>
                    <span className="font-bold text-slate-900">{currentStats.submitPending} 件</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D4F]"></span>
                      <span className="text-slate-700 font-medium">已驳回</span>
                    </div>
                    <span className="font-bold text-slate-900">{currentStats.submitReject} 件</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-200/60 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
                  <span className="text-slate-600 font-medium">整体通过率</span>
                  <span className="text-xs font-bold text-emerald-600">{currentStats.submitPassRate}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/70 border border-blue-100">
                  <span className="text-slate-600 font-medium">一次性通过率</span>
                  <span className="text-xs font-bold text-blue-600">{currentStats.submitOncePassRate}</span>
                </div>
              </div>
            </div>
          )}

          {/* 4.2 审核统计卡片 */}
          {showAuditor && (
            <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-200/70 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0052D9]"></div>
                  <h4 className="font-bold text-sm text-slate-900">审核履职统计</h4>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">按审核任务</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="relative flex items-center justify-center py-2">
                  <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="46" className="stroke-slate-200/70" strokeWidth="12" fill="transparent" />
                    <circle cx="60" cy="60" r="46" stroke="#94A3B8" strokeWidth="12" fill="transparent" strokeDasharray="289" strokeDashoffset="100" strokeLinecap="round" />
                    <circle cx="60" cy="60" r="46" stroke="#00C288" strokeWidth="12" fill="transparent" strokeDasharray="289" strokeDashoffset="245" strokeLinecap="round" />
                    <circle cx="60" cy="60" r="46" stroke="#FF4D4F" strokeWidth="12" fill="transparent" strokeDasharray="289" strokeDashoffset="270" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-[11px] text-slate-400 font-medium">待审总数</span>
                    <span className="text-2xl font-black text-slate-900 leading-tight">{currentStats.auditTotalPool}</span>
                    <span className="text-[10px] text-slate-400">件</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00C288]"></span>
                      <span className="text-slate-700 font-medium">审核通过</span>
                    </div>
                    <span className="font-bold text-slate-900">{currentStats.auditPassed} 件</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D4F]"></span>
                      <span className="text-slate-700 font-medium">审核驳回</span>
                    </div>
                    <span className="font-bold text-slate-900">{currentStats.auditRejected} 件</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]"></span>
                      <span className="text-slate-700 font-medium">待审核</span>
                    </div>
                    <span className="font-bold text-slate-900">{currentStats.auditPending} 件</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-200/60 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
                  <span className="text-slate-600 font-medium">平均响应时间</span>
                  <span className="text-xs font-bold text-emerald-600">{currentStats.auditAvgResponse}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/70 border border-blue-100">
                  <span className="text-slate-600 font-medium">审核办结率</span>
                  <span className="text-xs font-bold text-blue-600">{currentStats.auditProcessRate}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
