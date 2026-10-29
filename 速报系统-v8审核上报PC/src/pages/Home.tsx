import React, { useState } from 'react';
import { PageId, ReportItem, OrgItem, ReportTemplateInput, NotificationItem } from '../types';
import {
  ChevronRight,
  ChevronLeft,
  Trash2,
  FileEdit,
  Inbox,
  CheckCircle2,
  AlertCircle,
  Plus,
  Flame,
  MessageSquare,
  Radio,
  FileText,
  BarChart3,
  ClipboardCheck,
  PieChart,
  ShieldAlert,
  RotateCw
} from 'lucide-react';
import { AuditStatusBadge } from '../components/AuditStatusBadge';
import { ReportOriginBadge } from '../components/ReportOriginBadge';
import { getOrganizationPathText } from '../components/OrgPathDisplay';
import { HomeNotificationPanel } from '../components/HomeNotificationPanel';
import { getAuditArrivedAt, getRejectTime } from '../services/reportWorkflowService';
import { AuditDetail } from './AuditDetail';
import { ReportDetail } from './ReportDetail';

export type SystemRoleMode = 'all' | 'reporter' | 'auditor';

interface HomeProps {
  reports: ReportItem[];
  orgs?: OrgItem[];
  onNavigate: (page: PageId, extra?: string) => void;
  currentUser?: string;
  currentRoleTitle?: string;
  currentOrgName?: string;
  userRole?: SystemRoleMode;
  onOpenNewReport?: (templateData?: ReportTemplateInput) => void;
  onOpenEditReport?: (report: ReportItem) => void;
  onDeleteReport?: (id: number) => void;
  onApproveAudit?: (id: number, score?: number, isBatch?: boolean, batchIds?: number[]) => void;
  onRejectAudit?: (
    id: number,
    reason: string,
    detail: string,
    isBatch?: boolean,
    batchIds?: number[]
  ) => void;
  notifications: NotificationItem[];
  onMarkNotificationsRead: (ids: string[]) => void;
  onOpenNotification: (item: NotificationItem) => void;
  onOpenMessageCenter: (tab?: 'unread' | 'read') => void;
}

type TodoTab = 'audit' | 'submit';

const PAGE_SIZE = 6;

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

interface TemplateShortcut {
  id: string;
  name: string;
  scope: string;
  icon: React.ElementType;
  tone: string;
  build: () => ReportTemplateInput;
}

const TEMPLATE_SHORTCUTS: TemplateShortcut[] = [
  {
    id: 'emergency',
    name: '突发事件速报',
    scope: '现场秩序、安全事故、应急研判',
    icon: Flame,
    tone: 'bg-rose-50 text-rose-500',
    build: () => ({ templateId: '突发事件速报模板' })
  },
  {
    id: 'livelihood',
    name: '民生诉求核查',
    scope: '物业维修、水电气热、市政诉求',
    icon: MessageSquare,
    tone: 'bg-amber-50 text-amber-500',
    build: () => ({ templateId: '民生诉求核查模板' })
  },
  {
    id: 'rumor',
    name: '网络谣言线索',
    scope: '网络不实信息、虚假炒作辟谣',
    icon: Radio,
    tone: 'bg-emerald-50 text-emerald-500',
    build: () => ({ templateId: '网络谣言线索模板' })
  },
  {
    id: 'risk',
    name: '专项风险线索',
    scope: '重点场所、生产经营、公共安全',
    icon: ShieldAlert,
    tone: 'bg-violet-50 text-violet-500',
    build: () => ({ templateId: '专项风险线索模板' })
  }
];

const formatDateTime = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return '凌晨好';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
};

const resolveRoleMode = (roleTitle: string): SystemRoleMode => {
  const isReporter =
    roleTitle.includes('上报') ||
    roleTitle.includes('填报') ||
    roleTitle.includes('速报') ||
    roleTitle.includes('网格员') ||
    roleTitle.includes('报送员');
  const isAuditor = roleTitle.includes('审核');
  if (roleTitle.includes('管理员') || roleTitle.includes('超级') || roleTitle.includes('全权')) return 'all';
  if (isReporter && isAuditor) return 'all';
  if (isAuditor) return 'auditor';
  if (isReporter) return 'reporter';
  return 'all';
};

const Pager: React.FC<{
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}> = ({ page, totalPages, total, onChange }) => (
  <div className="flex items-center gap-2 text-[11px] text-slate-500">
    <span className="tabular-nums">
      第 {page}/{totalPages} 页，共 {total} 条
    </span>
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        title="上一页"
      >
        <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
      </button>
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        title="下一页"
      >
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
      </button>
    </div>
  </div>
);

export const Home: React.FC<HomeProps> = ({
  reports,
  onNavigate,
  onOpenNewReport,
  onOpenEditReport,
  onDeleteReport,
  onApproveAudit,
  onRejectAudit,
  currentUser = '张三',
  currentRoleTitle = '超级管理员',
  currentOrgName,
  userRole,
  notifications,
  onMarkNotificationsRead,
  onOpenNotification,
  onOpenMessageCenter
}) => {
  const roleMode = userRole ?? resolveRoleMode(currentRoleTitle);
  const showReporter = roleMode === 'all' || roleMode === 'reporter';
  const showAuditor = roleMode === 'all' || roleMode === 'auditor';

  const [activeTab, setActiveTab] = useState<TodoTab>(showAuditor ? 'audit' : 'submit');
  const [auditPage, setAuditPage] = useState(1);
  const [submitPage, setSubmitPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ReportItem | null>(null);
  const [drawerReport, setDrawerReport] = useState<ReportItem | null>(null);
  const [drawerAuditReport, setDrawerAuditReport] = useState<ReportItem | null>(null);
  const [updatedAt, setUpdatedAt] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    window.setTimeout(() => {
      setUpdatedAt(new Date());
      setRefreshing(false);
    }, 600);
  };

  const rejectedReports = reports.filter(
    (r) => r.auditStatus === '被驳回' || r.auditStatus === '已驳回'
  );
  const realPendingAudits = reports.filter((r) => r.auditStatus === '待审核');
  const pendingAudits =
    realPendingAudits.length > 0 ? realPendingAudits : (INITIAL_PENDING_AUDITS as unknown as ReportItem[]);
  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const auditTotalPages = Math.ceil(pendingAudits.length / PAGE_SIZE) || 1;
  const submitTotalPages = Math.ceil(rejectedReports.length / PAGE_SIZE) || 1;
  const pagedAudits = pendingAudits.slice((auditPage - 1) * PAGE_SIZE, auditPage * PAGE_SIZE);
  const pagedRejected = rejectedReports.slice((submitPage - 1) * PAGE_SIZE, submitPage * PAGE_SIZE);

  const tabs: { id: TodoTab; label: string; count: number }[] = [
    ...(showAuditor ? [{ id: 'audit' as const, label: '待我审核', count: pendingAudits.length }] : []),
    ...(showReporter ? [{ id: 'submit' as const, label: '被驳回待修改', count: rejectedReports.length }] : [])
  ];
  const currentTab = tabs.some((t) => t.id === activeTab) ? activeTab : tabs[0]?.id;

  const openReportDetail = (item: ReportItem) => {
    setDrawerReport(item);
  };

  const openAuditDetail = (item: ReportItem) => {
    setDrawerAuditReport(item);
  };

  const summaryCounts = [
    ...(showAuditor
      ? [{ key: 'audit', label: '待我审核', value: pendingAudits.length, tone: 'text-[#1E5ABB]', onClick: () => onNavigate('report-audit') }]
      : []),
    ...(showReporter
      ? [{ key: 'submit', label: '被驳回待修改', value: rejectedReports.length, tone: 'text-rose-600', onClick: () => onNavigate('report-summary', 'rejected') }]
      : []),
    {
      key: 'unread',
      label: '未读消息',
      value: unreadCount,
      tone: 'text-amber-500',
      onClick: () => onOpenMessageCenter('unread')
    }
  ];

  const shortcuts: { key: PageId; label: string; icon: React.ElementType; tone: string }[] = [
    ...(showReporter
      ? [
          { key: 'report-records' as const, label: '报送记录', icon: FileText, tone: 'bg-blue-50 text-[#1E5ABB]' },
          { key: 'report-statistics' as const, label: '报送统计', icon: BarChart3, tone: 'bg-indigo-50 text-indigo-500' }
        ]
      : []),
    ...(showAuditor
      ? [
          { key: 'audit-records' as const, label: '审核记录', icon: ClipboardCheck, tone: 'bg-teal-50 text-teal-600' },
          { key: 'audit-statistics' as const, label: '审核统计', icon: PieChart, tone: 'bg-violet-50 text-violet-500' }
        ]
      : [])
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* 顶部状态条 */}
      <section className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex flex-col md:flex-row md:items-center gap-4 md:gap-5">
        <div className="min-w-0 md:max-w-[260px]">
          <h2 className="text-lg font-bold text-slate-900 truncate">
            {currentUser}，{getGreeting()}
          </h2>
          <p className="mt-1 text-xs text-slate-500 truncate" title={`${currentRoleTitle}${currentOrgName ? `，${currentOrgName}` : ''}`}>
            {currentRoleTitle}
            {currentOrgName ? `，${currentOrgName}` : ''}
          </p>
        </div>

        <div className="flex-1 min-w-0 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 md:border-l md:border-slate-100 md:pl-5">
          <div className="flex items-stretch gap-x-8">
            {summaryCounts.map((item) => (
              <button
                key={item.key}
                onClick={item.onClick}
                className="text-left cursor-pointer group"
              >
                <span
                  className={`block text-2xl font-bold leading-none tabular-nums transition-colors ${
                    item.value > 0 ? `${item.tone} group-hover:opacity-80` : 'text-slate-300'
                  }`}
                >
                  {item.value}
                </span>
                <span className="block mt-1.5 text-xs text-slate-500 group-hover:text-slate-800 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
          <span className="inline-flex items-center gap-0.5 text-[11px] leading-4 text-slate-400 whitespace-nowrap">
            <span className="tabular-nums">数据更新于 {formatDateTime(updatedAt)}</span>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="刷新数据"
              aria-label="刷新数据"
              className="p-0.5 rounded hover:bg-slate-100 hover:text-[#1E5ABB] disabled:pointer-events-none cursor-pointer"
            >
              <RotateCw className={`w-3 h-3 ${refreshing ? 'animate-spin text-[#1E5ABB]' : ''}`} />
            </button>
          </span>
        </div>

        <nav
          aria-label="常用功能"
          className="shrink-0 flex items-center gap-0.5 md:border-l md:border-slate-100 md:pl-3"
        >
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className="w-16 py-1.5 rounded-lg flex flex-col items-center gap-1.5 hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.tone}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-[11px] text-slate-600 group-hover:text-[#1E5ABB] whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] gap-5 items-stretch">
        {/* 待办 */}
        <section
          id="home-todo-section"
          className="bg-white rounded-xl border border-slate-200 flex flex-col scroll-mt-4"
        >
          <div className="flex items-center justify-between px-5 border-b border-slate-100">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex min-w-0 items-center gap-6" role="tablist">
                {tabs.map((tab) => {
                  const active = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative py-3.5 text-sm transition-colors cursor-pointer ${
                        active ? 'font-bold text-slate-900' : 'font-medium text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.label}
                      <span
                        className={`ml-1.5 text-xs tabular-nums ${
                          active ? 'text-[#1E5ABB]' : 'text-slate-400'
                        }`}
                      >
                        {tab.count}
                      </span>
                      {active && (
                        <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#1E5ABB] rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() =>
                currentTab === 'audit'
                  ? onNavigate('report-audit')
                  : onNavigate('report-summary', 'rejected')
              }
              className="text-xs text-slate-500 hover:text-[#1E5ABB] inline-flex items-center gap-0.5 cursor-pointer"
            >
              查看全部
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 min-h-[432px]">
            {currentTab === 'audit' &&
              (pendingAudits.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                  <p>审核任务已全部处理</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {pagedAudits.map((item, index) => (
                    <li key={item.id}>
                      <div className="flex gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50/70">
                        <span className="mt-0.5 w-6 shrink-0 text-center font-mono text-xs text-gray-400">
                          {(auditPage - 1) * PAGE_SIZE + index + 1}
                        </span>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="shrink-0 rounded bg-amber-50 px-1.5 py-px text-[11px] font-medium text-amber-700">
                                待审核
                              </span>
                              <button
                                type="button"
                                onClick={() => openAuditDetail(item)}
                                title={item.title}
                                className="min-w-0 cursor-pointer truncate text-left text-sm font-semibold text-gray-900 hover:text-[#1E5ABB]"
                              >
                                {item.title}
                              </button>
                              <ReportOriginBadge report={item} size="sm" className="shrink-0" />
                            </div>
                            <button
                              type="button"
                              onClick={() => openAuditDetail(item)}
                              className="shrink-0 cursor-pointer text-xs font-semibold text-[#1E5ABB] hover:underline"
                            >
                              审核
                            </button>
                          </div>
                          <p className="truncate text-xs text-gray-500" title={item.detailContent?.summary || item.title}>
                            {item.detailContent?.summary || '暂无内容描述'}
                          </p>
                          <div className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[11px] text-gray-400">
                            <span className="shrink-0 rounded bg-gray-100 px-1 text-gray-500">报送人</span>
                            <span className="shrink-0 text-gray-600">{item.author || '—'}</span>
                            <span className="shrink-0 text-gray-300">·</span>
                            <span title={getOrganizationPathText(item.organization)} className="truncate">
                              {item.organization}
                            </span>
                            <span className="shrink-0 text-gray-300">·</span>
                            <span className="shrink-0 font-mono text-gray-500">{item.submitTime}</span>
                            <span className="shrink-0 text-gray-300">·</span>
                            <span className="shrink-0">
                              提交时间 <span className="font-mono text-gray-500">{getAuditArrivedAt(item)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ))}

            {currentTab === 'submit' &&
              (rejectedReports.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-xs">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>没有需要修改的报送</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {pagedRejected.map((item, index) => (
                    <li key={item.id}>
                      <div className="flex gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50/70">
                        <span className="mt-0.5 w-6 shrink-0 text-center font-mono text-xs text-gray-400">
                          {(submitPage - 1) * PAGE_SIZE + index + 1}
                        </span>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-2">
                              <AuditStatusBadge
                                status={item.auditStatus}
                                audience="report"
                                variant="chip"
                              />
                              <button
                                type="button"
                                onClick={() => openReportDetail(item)}
                                title={item.title}
                                className="min-w-0 cursor-pointer truncate text-left text-sm font-semibold text-gray-900 hover:text-[#1E5ABB]"
                              >
                                {item.title}
                              </button>
                              <ReportOriginBadge report={item} size="sm" className="shrink-0" />
                            </div>
                            <div className="flex shrink-0 items-center gap-3 text-xs">
                              <button
                                type="button"
                                onClick={() => openReportDetail(item)}
                                className="cursor-pointer text-gray-500 hover:text-gray-800 hover:underline"
                              >
                                详情
                              </button>
                              {onOpenEditReport && (
                                <button
                                  type="button"
                                  onClick={() => onOpenEditReport(item)}
                                  className="inline-flex cursor-pointer items-center gap-0.5 font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                                >
                                  <FileEdit className="h-3 w-3" />
                                  编辑
                                </button>
                              )}
                              {onDeleteReport && (
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(item)}
                                  className="inline-flex cursor-pointer items-center gap-0.5 text-rose-600 hover:text-rose-800 hover:underline"
                                  title="删除此记录"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  删除
                                </button>
                              )}
                            </div>
                          </div>
                          <p
                            className="truncate text-xs text-gray-500"
                            title={item.detailContent?.summary || item.occurAddress || ''}
                          >
                            {item.detailContent?.summary || item.occurAddress || '暂无详细描述'}
                          </p>
                          <div className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[11px] text-gray-400">
                            <span className="shrink-0 rounded bg-gray-100 px-1 text-gray-500">报送人</span>
                            <span className="shrink-0 text-gray-600">{item.author || '—'}</span>
                            <span className="shrink-0 text-gray-300">·</span>
                            <span title={getOrganizationPathText(item.organization)} className="truncate">
                              {item.organization}
                            </span>
                            <span className="shrink-0 text-gray-300">·</span>
                            <span className="shrink-0 font-mono text-gray-500">{item.submitTime}</span>
                            <span className="shrink-0 text-gray-300">·</span>
                            <span className="shrink-0">
                              驳回时间 <span className="font-mono text-gray-500">{getRejectTime(item)}</span>
                            </span>
                            <span
                              className="ml-2 inline-flex min-w-0 cursor-help items-center gap-1 text-rose-500"
                              title={`驳回原因：${item.rejectReason || '信息要素不完整，请补充政策依据与证明材料后重新提交。'}`}
                            >
                              <AlertCircle className="h-3 w-3 shrink-0" />
                              <span className="truncate">
                                驳回原因：{item.rejectReason || '信息不完整'}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ))}
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">显示近三个月数据</span>
            {currentTab === 'audit' ? (
              <Pager page={auditPage} totalPages={auditTotalPages} total={pendingAudits.length} onChange={setAuditPage} />
            ) : (
              <Pager page={submitPage} totalPages={submitTotalPages} total={rejectedReports.length} onChange={setSubmitPage} />
            )}
          </div>
        </section>

        {/* 右侧栏 */}
        <div className="flex flex-col gap-5">
          {showReporter && (
            <section className="bg-white rounded-xl border border-slate-200 shrink-0">
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 shrink-0">快速上报</h3>
                <button
                  onClick={() => onOpenNewReport?.()}
                  className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-[#1E5ABB] hover:bg-[#164A9E] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E5ABB]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新建报送
                </button>
              </div>
              <ul className="divide-y divide-slate-100">
                {TEMPLATE_SHORTCUTS.map((tpl) => {
                  const Icon = tpl.icon;
                  return (
                    <li key={tpl.id}>
                      <button
                        onClick={() => onOpenNewReport?.(tpl.build())}
                        className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tpl.tone}`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-slate-800 group-hover:text-[#1E5ABB]">
                            {tpl.name}
                          </span>
                          <span className="block text-[11px] text-slate-400 truncate">{tpl.scope}</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#1E5ABB] shrink-0" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <HomeNotificationPanel
            notifications={notifications}
            onMarkRead={onMarkNotificationsRead}
            onOpenTarget={onOpenNotification}
            onViewAll={onOpenMessageCenter}
            className="flex-1"
          />
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-gray-200">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-gray-900">确认删除记录？</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              确定要删除《<strong className="text-gray-900">{deleteTarget.title}</strong>》吗？此操作无法撤销。
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onDeleteReport?.(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {drawerReport && (
        <ReportDetail
          report={drawerReport}
          sourcePage="report-summary"
          isDrawer
          onClose={() => setDrawerReport(null)}
          onNavigate={onNavigate}
          onOpenEditReport={onOpenEditReport}
          onDeleteReport={(id) => {
            onDeleteReport?.(id);
            setDrawerReport(null);
          }}
        />
      )}

      {drawerAuditReport && (
        <AuditDetail
          report={drawerAuditReport}
          allReports={pendingAudits}
          isDrawer
          onClose={() => setDrawerAuditReport(null)}
          onNavigate={onNavigate}
          onApprove={(id, score, isBatch, batchIds) => {
            onApproveAudit?.(id, score, isBatch, batchIds);
            setDrawerAuditReport(null);
          }}
          onReject={(id, reason, detail, isBatch, batchIds) => {
            onRejectAudit?.(id, reason, detail, isBatch, batchIds);
            setDrawerAuditReport(null);
          }}
        />
      )}
    </div>
  );
};
