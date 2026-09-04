import React, { useState, useMemo } from 'react';
import {
  Smartphone,
  QrCode,
  Share2,
  X,
  Maximize2,
  Minimize2,
  Plus,
  Search,
  Bell,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  RotateCw,
  ExternalLink,
  Home,
  Send,
  Award,
  Building2,
  User,
  Sparkles,
  Upload,
  Filter,
  Check,
  Flame,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Tag,
  MessageSquare,
  Save,
  Trash2,
  Edit,
  Shield,
  BookOpen,
  Layers,
  BellRing,
  UserCheck,
  CheckSquare
} from 'lucide-react';
import { ReportItem, AuditRecordItem, OrgItem, DraftReport, NewReportFormData } from '../types';
import {
  H5_REPORT_DRAFT_STORAGE_KEY,
  loadDrafts,
  removeDraft,
  upsertDraft
} from '../services/reportDraftStorage';

interface H5MobilePortalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: ReportItem[];
  auditRecords: AuditRecordItem[];
  orgs: OrgItem[];
  currentUser: string;
  onCreateReport: (newReport: NewReportFormData) => void;
  onApproveAudit: (id: number, score: number) => void;
  onBatchApprove: (ids: number[], score: number) => void;
  onRejectAudit: (id: number, reason: string, detail: string) => void;
  onTransferSubmit: (id: number, opinion: string) => void;
}

// Pre-defined templates for "模板上报"
const REPORT_TEMPLATES = [
  {
    id: 'tmpl-1',
    name: '民生突发事件模板',
    typeTag: '突发事件',
    icon: Flame,
    color: 'bg-rose-50 text-rose-600 border-rose-200',
    title: '[民生突发] 西屯区部分社区水管破裂供水受阻',
    source: '微信公众号',
    region: '西屯区',
    summary: '网民在微信公众号反映部分区域因管道施工破坏主干水管，造成附近3个小区约500户居民临时停水。现场有人员围观讨论，热度快速上升。',
    demands: '1. 联系自来水公司调配应急供水车；2. 社区微信群发布抢修进度告示；3. 安排专人引导居民秩序。'
  },
  {
    id: 'tmpl-2',
    name: '环保安监排查模板',
    typeTag: '舆情动态',
    icon: AlertTriangle,
    color: 'bg-amber-50 text-amber-600 border-amber-200',
    title: '[环保安监] 北屯区工业园夜间废气异常排放投诉',
    source: '抖音/短视频',
    region: '北屯区',
    summary: '多名网民发布短视频反映北屯工业园区某企业夜间排放刺鼻废气，影响周边居民正常作息，视频播放量增长较快。',
    demands: '1. 生态环境局夜间突击排查；2. 监测站点数据核对；3. 网信办密切跟踪视频扩散走势。'
  },
  {
    id: 'tmpl-3',
    name: '网格每日巡查模板',
    typeTag: '民生诉求',
    icon: Shield,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    title: '[网格巡查] 南屯区老旧小区楼道堆放隐患巡查',
    source: '群众举报告知',
    region: '南屯区',
    summary: '网格员走访发现3号楼楼道内堆放大量可燃废纸箱，占用消防通道，业主屡劝不改引致居民不满。',
    demands: '1. 联合物业开具限期整改单；2. 开展楼道安全宣传；3. 协助无力清理老人打包清理。'
  },
  {
    id: 'tmpl-4',
    name: '政策热点回应模板',
    typeTag: '政策解读',
    icon: BookOpen,
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    title: '[政策解读] 关于阶段性住房补贴政策网民咨询',
    source: '新闻网贴',
    region: '全市',
    summary: '网民就近期出台的住户补贴政策提出多项疑问，主要集中在申领门槛、审批周期与资料要求。',
    demands: '1. 制作“一图读懂”政策海报发布；2. 统一热线客服口径；3. 引导线上小程序快速办理。'
  }
];

export const H5MobilePortal: React.FC<H5MobilePortalProps> = ({
  isOpen,
  onClose,
  reports,
  auditRecords,
  orgs,
  currentUser,
  onCreateReport,
  onApproveAudit,
  onBatchApprove,
  onRejectAudit,
  onTransferSubmit
}) => {
  // Simulator Display Mode: 'device' (phone frame) or 'fullscreen' (full mobile preview)
  const [viewMode, setViewMode] = useState<'device' | 'fullscreen'>('device');
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showWechatMenu, setShowWechatMenu] = useState(false);

  // Level 1 Tabs matching the checklist:
  // 'report' (报送管理) | 'audit' (审核处理) | 'messages' (消息中心) | 'profile' (个人中心)
  const [activeTab, setActiveTab] = useState<'report' | 'audit' | 'messages' | 'profile'>('report');

  // Global Back / Return Handler for WeChat H5
  const handleNavBack = () => {
    if (mobileDetailReport) {
      setMobileDetailReport(null);
      triggerH5Toast('已返回速报列表');
      return;
    }
    if (selectedAnnouncement) {
      setSelectedAnnouncement(null);
      triggerH5Toast('已返回消息列表');
      return;
    }
    if (auditTarget) {
      setAuditTarget(null);
      triggerH5Toast('已退出审核');
      return;
    }
    if (batchAddressTarget) {
      setBatchAddressTarget(null);
      triggerH5Toast('已退出合并审核');
      return;
    }
    if (showH5DraftModal) {
      setShowH5DraftModal(false);
      return;
    }
    if (showProfileModal) {
      setShowProfileModal(false);
      return;
    }
    if (showQrVerifyModal) {
      setShowQrVerifyModal(false);
      return;
    }

    // Sub-tab / Level-1 tab level back logic
    if (activeTab === 'report') {
      if (reportSubTab !== 'record') {
        setReportSubTab('record');
        triggerH5Toast('已返回【报送记录】主页');
        return;
      }
    } else if (activeTab === 'audit') {
      if (auditSubTab !== 'pending') {
        setAuditSubTab('pending');
        triggerH5Toast('已返回【待我审核】队列');
        return;
      }
      setActiveTab('report');
      triggerH5Toast('已返回【报送管理】主页');
      return;
    } else if (activeTab === 'messages') {
      if (msgCategory !== 'all') {
        setMsgCategory('all');
        triggerH5Toast('已重置消息分类');
        return;
      }
      setActiveTab('report');
      triggerH5Toast('已返回【报送管理】主页');
      return;
    } else if (activeTab === 'profile') {
      setActiveTab('report');
      triggerH5Toast('已返回【报送管理】主页');
      return;
    }

    triggerH5Toast('已处于微信公众号内嵌H5首页');
  };

  // Sub-tabs for "报送管理": 'template' (模板上报) | 'draft' (报送草稿) | 'record' (报送记录) | 'form' (填报表单)
  const [reportSubTab, setReportSubTab] = useState<'template' | 'form' | 'draft' | 'record'>('record');

  // Sub-tabs for "审核处理": 'pending' (待审核列表) | 'batch' (批量审核/同地址标记) | 'history' (审核记录)
  const [auditSubTab, setAuditSubTab] = useState<'pending' | 'batch' | 'history'>('pending');

  // Sub-category filter for "消息中心": 'all' | 'announcement' | 'audit_remind' | 'report_notice'
  const [msgCategory, setMsgCategory] = useState<'all' | 'announcement' | 'audit_remind' | 'report_notice'>('all');
  const [announcementReadFilter, setAnnouncementReadFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Selected system announcement for detail modal
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<{
    id: number;
    title: string;
    time: string;
    publisher: string;
    content: string;
    isRead: boolean;
  } | null>(null);

  // Profile Edit Modal & User State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showQrVerifyModal, setShowQrVerifyModal] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: currentUser || '张三',
    phone: '138****8899',
    gridName: '西屯区第03号网格单元',
    orgName: '台中市网信办 · 基层治理组',
    code: 'WX-8802',
    isQrVerified: true,
    verifyTime: '2026-08-12 18:30'
  });

  // System Announcements State
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: '【系统公告】关于开展网格员舆情报送攻坚月活动的通知',
      time: '2026-08-10 09:00',
      publisher: '台中市网信办',
      content: '为进一步提升网格舆情感知与极速反应能力，市网信办决定开展舆情报送攻坚月活动，对高分采报赋予双倍绩效积分。',
      isRead: false
    },
    {
      id: 2,
      title: '【规范指引】网格员突发事件现场图像上传与要素填写规范 (v2.0)',
      time: '2026-08-08 14:30',
      publisher: '舆情监测处置中心',
      content: '请各位网格员在上报突发类舆情时，务必附带清晰现场照片，并明确“三要素”：时间、具体地点、涉事主体。',
      isRead: true
    },
    {
      id: 3,
      title: '【平台升级】H5掌上端更新：新增同地址重复标记与批量合并审核',
      time: '2026-08-05 11:20',
      publisher: '系统运维组',
      content: '移动端现已支持对同地址多条舆情速报进行智能归类与一键批量审核，极大提升掌上审核办理效率。',
      isRead: true
    }
  ]);

  // Messages Center List
  const [h5Messages, setH5Messages] = useState([
    {
      id: 101,
      title: '【待办提醒】分配给您的待审核速报《西屯区突发水管破裂》请及时处理',
      category: 'audit_remind',
      sender: '市网信办派发组',
      time: '10分钟前',
      content: '检测到网格员提交新的民生突发类速报，请点击下方【快速跳转处理】按钮进行审核打分。',
      isRead: false,
      targetReportId: 1
    },
    {
      id: 102,
      title: '【审核结果通知】您的速报《西屯区南一路积水情况》通过审核（打分95分）',
      category: 'audit_remind',
      sender: '市委宣传部 · 王主任',
      time: '1小时前',
      content: '您提交的速报经过研判综合得分95分，对应15分采报绩效积分已自动发放至您的账户。',
      isRead: false
    },
    {
      id: 103,
      title: '【报送状态通知】您提交的《环保安监异常排放》已完成市级归档并抄送相关部门',
      category: 'report_notice',
      sender: '舆情归档中心',
      time: '3小时前',
      content: '该速报已被标记为高价值舆情，全流程已归档并呈报领导决策参考。',
      isRead: false
    },
    {
      id: 104,
      title: '【待办提醒】《北屯区垃圾分类违规堆放》等待审核打分',
      category: 'audit_remind',
      sender: '网格监测组',
      time: '09:15',
      content: '请尽快核实网格员反馈的居民诉求事项。',
      isRead: true,
      targetReportId: 2
    }
  ]);

  // Detail Modal Report
  const [mobileDetailReport, setMobileDetailReport] = useState<ReportItem | null>(null);

  // Search & Status Filters in Report Record list
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mobile Toast State inside H5
  const [h5Toast, setH5Toast] = useState<string | null>(null);
  const triggerH5Toast = (msg: string) => {
    setH5Toast(msg);
    setTimeout(() => {
      setH5Toast(null);
    }, 2500);
  };

  // Quick Report Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSource, setNewSource] = useState('微信公众号');
  const [newRegion, setNewRegion] = useState('西屯区');
  const [newInfoType, setNewInfoType] = useState('民生诉求');
  const [newSummary, setNewSummary] = useState('');
  const [newDemands, setNewDemands] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);

  // Draft States
  const [h5Drafts, setH5Drafts] = useState<DraftReport[]>(() => {
    return loadDrafts(H5_REPORT_DRAFT_STORAGE_KEY);
  });
  const [showH5DraftModal, setShowH5DraftModal] = useState(false);
  const [activeH5DraftId, setActiveH5DraftId] = useState<string | null>(null);

  // Single Audit Modal State
  const [auditTarget, setAuditTarget] = useState<ReportItem | null>(null);
  const [auditScore, setAuditScore] = useState<number>(90);
  const [rejectReason, setRejectReason] = useState('信息要素不全');
  const [rejectDetail, setRejectDetail] = useState('');

  // Batch Audit Modal State (同地址合并审核)
  const [batchAddressTarget, setBatchAddressTarget] = useState<string | null>(null);
  const [batchAuditScore, setBatchAuditScore] = useState<number>(90);
  const [batchAuditOpinion, setBatchAuditOpinion] = useState('同一地址诉求属实，予以合并合并审核通过');

  // Group pending reports by Region/Address for "同地址标记"
  const pendingReportsByRegion = useMemo<Record<string, ReportItem[]>>(() => {
    const pendings = reports.filter((r) => r.auditStatus === '待审核');
    const groups: Record<string, ReportItem[]> = {};
    pendings.forEach((item) => {
      const key = item.region || '其他区域';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [reports]);

  // Save Draft
  const handleSaveH5Draft = () => {
    if (!newTitle.trim() && !newSummary.trim() && !newDemands.trim()) {
      triggerH5Toast('请至少填写标题或摘要内容再保存草稿');
      return;
    }

    const draftId = activeH5DraftId || `h5-draft-${Date.now()}`;
    const newDraft: DraftReport = {
      id: draftId,
      title: newTitle.trim() || '未命名草稿',
      source: newSource,
      region: newRegion,
      infoType: newInfoType,
      author: userProfile.name,
      organization: userProfile.orgName,
      summary: newSummary,
      demands: newDemands,
      recommendations: '',
      saveTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updated = upsertDraft(newDraft, H5_REPORT_DRAFT_STORAGE_KEY);
    setH5Drafts(updated);
    setActiveH5DraftId(draftId);
    triggerH5Toast('草稿已成功暂存至草稿箱！');
  };

  // Load Draft
  const handleLoadH5Draft = (draft: DraftReport) => {
    setNewTitle(draft.title === '未命名草稿' ? '' : draft.title);
    setNewSource(draft.source || '微信公众号');
    setNewRegion(draft.region || '西屯区');
    setNewInfoType(draft.infoType || '民生诉求');
    setNewSummary(draft.summary || '');
    setNewDemands(draft.demands || '');
    setActiveH5DraftId(draft.id);
    setShowH5DraftModal(false);
    setReportSubTab('form');
    triggerH5Toast(`已重载草稿: ${draft.title}`);
  };

  // Delete Draft
  const handleDeleteH5Draft = (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeDraft(draftId, H5_REPORT_DRAFT_STORAGE_KEY);
    setH5Drafts(updated);
    if (activeH5DraftId === draftId) setActiveH5DraftId(null);
    triggerH5Toast('草稿已删除');
  };

  // AI Polish
  const handleAiPolish = () => {
    if (!newTitle) {
      triggerH5Toast('请先输入舆情标题');
      return;
    }
    setIsPolishing(true);
    setTimeout(() => {
      setIsPolishing(false);
      setNewSummary(`【AI自动凝练】关于“${newTitle}”的网络舆情反映，事件引发多方网民讨论关注。核心诉求集中在现场设施修复与官方回应速度。`);
      setNewDemands('1. 建议责任部门1小时内进行现场核实；2. 编制第一版正面回应口径；3. 持续跟踪网络热度走向。');
      triggerH5Toast('AI已自动生成摘要与应对建议！');
    }, 1000);
  };

  // Apply template
  const handleApplyTemplate = (tmpl: typeof REPORT_TEMPLATES[0]) => {
    setNewTitle(tmpl.title);
    setNewSource(tmpl.source);
    setNewRegion(tmpl.region);
    setNewInfoType(tmpl.typeTag);
    setNewSummary(tmpl.summary);
    setNewDemands(tmpl.demands);
    setReportSubTab('form');
    triggerH5Toast(`已成功使用“${tmpl.name}”，请确认后提交！`);
  };

  // Submit Mobile Report
  const handleSubmitMobileReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      triggerH5Toast('请输入速报标题');
      return;
    }

    onCreateReport({
      title: newTitle,
      source: newSource,
      region: newRegion,
      infoType: newInfoType,
      author: userProfile.name,
      organization: userProfile.orgName,
      summary: newSummary || `网民反映${newTitle}相关情况。`,
      demands: newDemands || '请相关部门核实处理并及时回应。',
      recommendations: ''
    });

    triggerH5Toast('🎉 移动速报提交成功！已进入审核队列');
    if (activeH5DraftId) {
      const updated = removeDraft(activeH5DraftId, H5_REPORT_DRAFT_STORAGE_KEY);
      setH5Drafts(updated);
    }
    setNewTitle('');
    setNewSummary('');
    setNewDemands('');
    setActiveH5DraftId(null);
    setReportSubTab('record');
  };

  // Batch Audit Approval Action (批量合并审核)
  const handleBatchAuditSubmit = () => {
    if (!batchAddressTarget) return;
    const targetItems = pendingReportsByRegion[batchAddressTarget] || [];
    onBatchApprove(
      targetItems.map((item) => item.id),
      batchAuditScore
    );
    triggerH5Toast(`已成功对同地址【${batchAddressTarget}】下 ${targetItems.length} 条速报合并通过审核（打分: ${batchAuditScore}分）！`);
    setBatchAddressTarget(null);
  };

  // Copy share link
  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Pending and Approved counts
  const pendingCount = reports.filter((r) => r.auditStatus === '待审核').length;
  const passedCount = reports.filter((r) => r.auditStatus === '已通过' || r.auditStatus === '已转办').length;
  const unreadMsgCount = h5Messages.filter((m) => !m.isRead).length + announcements.filter((a) => !a.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Top Simulator Controls Toolbar */}
      <div className="w-full max-w-4xl bg-slate-800 text-white rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between border border-slate-700 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-sm text-white">v8 网格员上报审核端 · H5掌上应用</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                双向联动中
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">网格员掌上速报、同地址合并审核、消息提醒与个人中心</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
            title="手机扫码预览"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">手机扫码</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-indigo-400" />}
            <span className="hidden sm:inline">{copiedLink ? '已复制' : '分享链接'}</span>
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'device' ? 'fullscreen' : 'device')}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer shadow-sm"
          >
            {viewMode === 'device' ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">全屏模式</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">手机框模式</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white transition-colors cursor-pointer ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main H5 Frame Container */}
      <div
        className={`relative transition-all duration-300 flex justify-center items-center ${
          viewMode === 'fullscreen'
            ? 'w-full max-w-md h-[calc(100vh-100px)]'
            : 'w-[375px] h-[750px] max-h-[85vh]'
        }`}
      >
        {/* Phone Outer Shell */}
        <div
          className={`w-full h-full bg-slate-950 flex flex-col overflow-hidden shadow-2xl relative ${
            viewMode === 'device'
              ? 'rounded-[44px] border-[10px] border-slate-800 ring-1 ring-slate-700/50'
              : 'rounded-3xl border border-slate-800'
          }`}
        >
          {/* Dynamic Island Notch */}
          {viewMode === 'device' && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-40 flex items-center justify-center space-x-2 px-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60"></div>
            </div>
          )}

          {/* Status Bar */}
          <div className="pt-3 px-5 pb-1 bg-[#191919] text-white flex justify-between items-center text-[10px] font-bold z-30 shrink-0 border-b border-slate-800">
            <span>09:41</span>
            <div className="flex items-center space-x-1.5">
              <span className="text-[9px] bg-white/20 px-1 rounded">5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* WeChat Official Account Embedded H5 Navigation Header */}
          <div className="bg-[#191919] text-white px-3 py-2 flex items-center justify-between shadow-md z-30 shrink-0 border-b border-slate-800 relative">
            {/* Left: Back / Return Arrow & Official Account Title */}
            <div className="flex items-center space-x-1.5 min-w-0">
              <button
                onClick={handleNavBack}
                className="p-1 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer flex items-center space-x-0.5 active:scale-95 shrink-0"
                title="返回上一页"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={() => {
                  setActiveTab('report');
                  setReportSubTab('record');
                  setMobileDetailReport(null);
                  setSelectedAnnouncement(null);
                  triggerH5Toast('已返回微信公众号H5首页');
                }}
                className="p-1 rounded-full hover:bg-white/10 text-slate-300 transition-colors cursor-pointer shrink-0"
                title="返回微信H5首页"
              >
                <Home className="w-4 h-4" />
              </button>

              <div className="h-3.5 w-px bg-slate-700 mx-0.5"></div>

              <div className="flex flex-col leading-tight min-w-0">
                <span className="font-bold text-xs text-white tracking-wide truncate max-w-[150px]">
                  {mobileDetailReport
                    ? '速报详情'
                    : selectedAnnouncement
                    ? '公告详情'
                    : activeTab === 'report'
                    ? '报送管理'
                    : activeTab === 'audit'
                    ? '审核处理'
                    : activeTab === 'messages'
                    ? '消息中心'
                    : '个人中心'}
                </span>
                <span className="text-[9px] text-slate-400">台中网信 · 掌上网格通</span>
              </div>
            </div>

            {/* Right: WeChat Capsule Buttons (微信公众号右侧胶囊导航) */}
            <div className="flex items-center bg-black/40 border border-white/20 rounded-full px-2 py-0.5 space-x-1.5 text-white shrink-0">
              <button
                onClick={() => setShowWechatMenu(true)}
                className="p-1 hover:text-amber-400 transition-colors cursor-pointer"
                title="微信公众号更多功能"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-3 bg-white/20"></div>
              <button
                onClick={onClose}
                className="p-1 hover:text-rose-400 transition-colors cursor-pointer"
                title="退出H5网页"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* H5 Internal Toast */}
          {h5Toast && (
            <div className="absolute top-16 left-4 right-4 z-50 bg-slate-900/95 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-2 animate-in fade-in slide-in-from-top-3">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-medium text-[11px] leading-tight flex-1">{h5Toast}</span>
            </div>
          )}

          {/* H5 Body Area */}
          <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-800 relative text-xs pb-16 scrollbar-none">
            
            {/* ================= 1. 报送管理 (Reporting Management) ================= */}
            {activeTab === 'report' && (
              <div className="p-3.5 space-y-3 animate-in fade-in duration-150">
                {/* Sub Segmented Controls */}
                <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-[11px] font-bold">
                  {[
                    { id: 'record', label: '报送记录' },
                    { id: 'template', label: '模板上报' },
                    { id: 'draft', label: `报送草稿 (${h5Drafts.length})` },
                    { id: 'form', label: '新建填报' }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setReportSubTab(sub.id as any)}
                      className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                        reportSubTab === sub.id ? 'bg-white text-[#1E5ABB] shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {/* Sub-View 1: 模板上报 (Template Selection) */}
                {reportSubTab === 'template' && (
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-3.5 shadow-md">
                      <div className="flex items-center space-x-2 mb-1">
                        <BookOpen className="w-4 h-4 text-amber-300" />
                        <h3 className="font-black text-sm text-white">标准化速报模板填报</h3>
                      </div>
                      <p className="text-[10px] text-blue-200">选择预置高频事件模板，一键套用结构化提纲，极速完成上报</p>
                    </div>

                    <div className="space-y-2.5">
                      {REPORT_TEMPLATES.map((tmpl) => {
                        const Icon = tmpl.icon;
                        return (
                          <div
                            key={tmpl.id}
                            className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs hover:border-blue-300 transition-all space-y-2"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${tmpl.color}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-xs text-slate-800">{tmpl.name}</span>
                              </div>
                              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                                {tmpl.typeTag}
                              </span>
                            </div>

                            <p className="text-[11px] font-bold text-slate-900 line-clamp-1">{tmpl.title}</p>
                            <p className="text-[10px] text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded-xl">
                              {tmpl.summary}
                            </p>

                            <button
                              onClick={() => handleApplyTemplate(tmpl)}
                              className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-[#1E5ABB] font-bold text-xs rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#1E5ABB]" />
                              <span>套用此模板填报</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sub-View 2: 报送草稿 (Draft Box) */}
                {reportSubTab === 'draft' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <span className="font-bold text-xs text-slate-800 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>草稿箱暂存列表 ({h5Drafts.length})</span>
                      </span>
                      <button
                        onClick={() => {
                          setReportSubTab('form');
                          setActiveH5DraftId(null);
                        }}
                        className="text-[10px] text-blue-600 font-bold hover:underline"
                      >
                        + 新建空白草稿
                      </button>
                    </div>

                    {h5Drafts.length === 0 ? (
                      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
                        <Save className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-bold text-xs text-slate-600">草稿箱为空</p>
                        <p className="text-[10px] text-slate-400">填报未完成速报时点击“存为草稿”，随时在此恢复编辑</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {h5Drafts.map((d) => (
                          <div
                            key={d.id}
                            className={`p-3 bg-white rounded-2xl border transition-all space-y-2 ${
                              activeH5DraftId === d.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                                草稿
                              </span>
                              <span className="text-[10px] text-slate-400">{d.saveTime}</span>
                            </div>

                            <h4 className="font-bold text-xs text-slate-900 truncate">{d.title}</h4>
                            <p className="text-[10px] text-slate-500 truncate">{d.summary || '无摘要内容'}</p>

                            <div className="flex justify-end space-x-2 pt-1 border-t border-slate-100">
                              <button
                                onClick={(e) => handleDeleteH5Draft(d.id, e)}
                                className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 font-bold rounded-lg text-[10px] flex items-center space-x-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>删除</span>
                              </button>
                              <button
                                onClick={() => handleLoadH5Draft(d)}
                                className="px-3 py-1 bg-[#1E5ABB] text-white font-bold rounded-lg text-[10px] flex items-center space-x-1"
                              >
                                <Edit className="w-3 h-3" />
                                <span>继续编辑</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-View 3: 报送记录 (Report Records) */}
                {reportSubTab === 'record' && (
                  <div className="space-y-3">
                    {/* Search & Filter */}
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-2">
                      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜索我的报送标题、分类..."
                        className="w-full text-[11px] bg-transparent focus:outline-none text-slate-700"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="p-0.5 text-slate-400">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[10px]">
                      {[
                        { id: 'all', label: '全部记录' },
                        { id: '待审核', label: `待审核 (${pendingCount})` },
                        { id: '已通过', label: `已通过 (${passedCount})` },
                        { id: '已驳回', label: '已驳回' }
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setStatusFilter(f.id)}
                          className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
                            statusFilter === f.id ? 'bg-[#1E5ABB] text-white' : 'bg-slate-200/70 text-slate-600'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {/* Records List */}
                    <div className="space-y-2">
                      {reports
                        .filter((r) => {
                          if (statusFilter !== 'all' && r.auditStatus !== statusFilter) return false;
                          if (searchQuery && !r.title.includes(searchQuery)) return false;
                          return true;
                        })
                        .map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setMobileDetailReport(item)}
                            className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs hover:border-blue-300 transition-all cursor-pointer space-y-1.5"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-1.5">
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                    item.auditStatus === '待审核'
                                      ? 'bg-amber-100 text-amber-800'
                                      : item.auditStatus === '已通过'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {item.auditStatus}
                                </span>
                                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                                  {item.infoType}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">{item.submitTime.slice(-5)}</span>
                            </div>

                            <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{item.title}</h4>
                            <p className="text-[10px] text-slate-500 line-clamp-2 bg-slate-50 p-1.5 rounded-lg">
                              {item.detailContent?.summary || '无细节描述'}
                            </p>

                            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                              <span>作者: {item.author} ({item.region})</span>
                              <span className="text-blue-600 font-bold flex items-center space-x-0.5">
                                <span>查看详情</span>
                                <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Sub-View 4: 新建填报 (New Form) */}
                {reportSubTab === 'form' && (
                  <form onSubmit={handleSubmitMobileReport} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <h4 className="font-bold text-xs text-slate-800">舆情极速填报表单</h4>
                      <button
                        type="button"
                        onClick={handleSaveH5Draft}
                        className="text-[10px] bg-amber-100 text-amber-900 px-2 py-1 rounded-lg font-bold flex items-center space-x-1"
                      >
                        <Save className="w-3 h-3 text-amber-700" />
                        <span>存草稿</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        舆情标题 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="例：网民反映西屯区南一路突发水管破裂造成积水"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">来源渠道</label>
                        <select
                          value={newSource}
                          onChange={(e) => setNewSource(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                        >
                          <option value="微信公众号">微信公众号</option>
                          <option value="新浪微博">新浪微博</option>
                          <option value="抖音/短视频">抖音/短视频</option>
                          <option value="群众举报告知">群众举报告知</option>
                          <option value="新闻网贴">新闻网贴</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">涉事区域</label>
                        <select
                          value={newRegion}
                          onChange={(e) => setNewRegion(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                        >
                          <option value="西屯区">西屯区</option>
                          <option value="北屯区">北屯区</option>
                          <option value="南屯区">南屯区</option>
                          <option value="全市">全市</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">舆情类型</label>
                      <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                        {['突发事件', '民生诉求', '舆情动态', '政策解读'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setNewInfoType(t)}
                            className={`py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                              newInfoType === t
                                ? 'bg-blue-50 border-blue-600 text-[#1E5ABB]'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAiPolish}
                      disabled={isPolishing}
                      className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm active:scale-98 transition-all cursor-pointer"
                    >
                      <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isPolishing ? 'animate-spin' : ''}`} />
                      <span>{isPolishing ? 'AI整理中...' : '一键AI生成事件摘要与应对建议'}</span>
                    </button>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">核心摘要内容</label>
                      <textarea
                        rows={3}
                        value={newSummary}
                        onChange={(e) => setNewSummary(e.target.value)}
                        placeholder="概述主要事实、传播范围及网民反应..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">网民诉求与处置建议</label>
                      <textarea
                        rows={2}
                        value={newDemands}
                        onChange={(e) => setNewDemands(e.target.value)}
                        placeholder="拟采取的核实处置或回应措施..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleSaveH5Draft}
                        className="col-span-1 py-3 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <Save className="w-3.5 h-3.5 text-amber-800" />
                        <span>存草稿</span>
                      </button>
                      <button
                        type="submit"
                        className="col-span-2 py-3 bg-[#1E5ABB] hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>提交审核</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ================= 2. 审核处理 (Audit Processing) ================= */}
            {activeTab === 'audit' && (
              <div className="p-3.5 space-y-3 animate-in fade-in duration-150">
                {/* Sub-tabs for Audit */}
                <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-[11px] font-bold">
                  {[
                    { id: 'pending', label: `待我审核 (${pendingCount})` },
                    { id: 'batch', label: '同地址合并审核' },
                    { id: 'history', label: '审核历史' }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setAuditSubTab(sub.id as any)}
                      className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                        auditSubTab === sub.id ? 'bg-white text-[#1E5ABB] shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {/* Sub-View 1: 报送审核 (Pending List) */}
                {auditSubTab === 'pending' && (
                  <div className="space-y-3">
                    {reports.filter((r) => r.auditStatus === '待审核').length === 0 ? (
                      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                        <p className="font-bold text-xs text-slate-700">暂无待审核速报</p>
                        <p className="text-[10px] text-slate-400">您名下的待审核队列已全部处理完毕</p>
                      </div>
                    ) : (
                      reports
                        .filter((r) => r.auditStatus === '待审核')
                        .map((item) => (
                          <div key={item.id} className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                                待审核
                              </span>
                              <span className="text-[10px] text-slate-400">{item.submitTime}</span>
                            </div>

                            <h4 className="font-bold text-xs text-slate-900 leading-snug">{item.title}</h4>
                            <div className="bg-slate-50 p-2 rounded-xl text-[11px] text-slate-600 line-clamp-2">
                              {item.detailContent?.summary || '无摘要内容'}
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>单位: {item.organization}</span>
                              <span>作者: {item.author} ({item.region})</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                              <button
                                onClick={() => {
                                  setAuditTarget(item);
                                  setAuditScore(90);
                                }}
                                className="py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>通过打分</span>
                              </button>

                              <button
                                onClick={() => {
                                  setAuditTarget(item);
                                  setAuditScore(0);
                                }}
                                className="py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>驳回速报</span>
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}

                {/* Sub-View 2: 批量审核 & 同地址标记 (Batch Audit / Same Address Identification) */}
                {auditSubTab === 'batch' && (
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl p-3.5 shadow-md space-y-1">
                      <div className="flex items-center space-x-1.5 font-black text-sm">
                        <MapPin className="w-4 h-4 text-amber-200" />
                        <span>同地址舆情智能标记与批量审核</span>
                      </div>
                      <p className="text-[10px] text-amber-100">
                        系统按地理位置舆情地址精准识别，汇总同一地址关联的多条速报，支持一键合并审核办理。
                      </p>
                    </div>

                    {Object.keys(pendingReportsByRegion).length === 0 ? (
                      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400">
                        目前无待审核的同地址聚合速报。
                      </div>
                    ) : (
                      (Object.entries(pendingReportsByRegion) as [string, ReportItem[]][]).map(([reg, list]) => (
                        <div key={reg} className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
                          <div className="flex justify-between items-center bg-amber-50 p-2 rounded-xl border border-amber-200">
                            <div className="flex items-center space-x-1.5">
                              <MapPin className="w-4 h-4 text-amber-600" />
                              <span className="font-bold text-xs text-amber-900">地址标注: {reg}</span>
                            </div>
                            <span className="text-[10px] bg-amber-200 text-amber-900 font-black px-2 py-0.5 rounded-full">
                              同地址包含 {list.length} 条速报
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {list.map((r) => (
                              <div key={r.id} className="p-2 bg-slate-50 rounded-xl text-[11px] text-slate-700 flex justify-between">
                                <span className="truncate font-medium">{r.title}</span>
                                <span className="text-[10px] text-slate-400 shrink-0 ml-2">{r.submitTime.slice(-5)}</span>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => {
                              setBatchAddressTarget(reg);
                              setBatchAuditScore(90);
                            }}
                            className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer shadow-sm"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>对该地址上报一键合并批量审核</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Sub-View 3: 审核记录 (Audit History) */}
                {auditSubTab === 'history' && (
                  <div className="space-y-2">
                    <p className="font-bold text-xs text-slate-700 px-1">全流程审核历史记录与日志</p>
                    {auditRecords.length === 0 ? (
                      <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-400">
                        暂无处理完毕的审核历史记录。
                      </div>
                    ) : (
                      auditRecords.map((rec) => (
                        <div key={rec.id} className="bg-white p-3 rounded-2xl border border-slate-200 space-y-1">
                          <div className="flex justify-between items-center">
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                rec.action === '审核通过'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {rec.action}
                            </span>
                            <span className="text-[10px] text-slate-400">{rec.time}</span>
                          </div>
                          <p className="font-bold text-xs text-slate-800">{rec.reportTitle}</p>
                          <p className="text-[10px] text-slate-500">
                            审核人: {rec.auditor} | 意见: {rec.opinion} {rec.score ? `(${rec.score}分)` : ''}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ================= 3. 消息中心 (Message Center) ================= */}
            {activeTab === 'messages' && (
              <div className="p-3.5 space-y-3 animate-in fade-in duration-150">
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-3.5 shadow-md flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2 mb-0.5">
                      <h3 className="font-black text-sm text-white">消息中心</h3>
                      <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                        {unreadMsgCount}条未读
                      </span>
                    </div>
                    <p className="text-[10px] text-blue-200">全流程状态通知、系统公告与待办审核提醒</p>
                  </div>
                  <button
                    onClick={() => {
                      setH5Messages((prev) => prev.map((m) => ({ ...m, isRead: true })));
                      setAnnouncements((prev) => prev.map((a) => ({ ...a, isRead: true })));
                      triggerH5Toast('已标记全部消息为已读');
                    }}
                    className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-lg border border-white/20 shrink-0 cursor-pointer"
                  >
                    全部已读
                  </button>
                </div>

                {/* Sub-Category Bar */}
                <div className="flex items-center space-x-1 text-[10px] bg-slate-200/80 p-1 rounded-xl font-bold">
                  {[
                    { id: 'all', label: '全部' },
                    { id: 'announcement', label: '系统公告' },
                    { id: 'audit_remind', label: '审核提醒' },
                    { id: 'report_notice', label: '报送通知' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setMsgCategory(cat.id as any)}
                      className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                        msgCategory === cat.id ? 'bg-white text-[#1E5ABB] shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Section 1: 系统公告 (Announcements) */}
                {(msgCategory === 'all' || msgCategory === 'announcement') && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="font-bold text-xs text-slate-800 flex items-center space-x-1">
                        <Bell className="w-3.5 h-3.5 text-blue-600" />
                        <span>系统公告</span>
                      </span>

                      {/* Announcement Read Filter */}
                      <div className="flex space-x-1 text-[9px]">
                        {['all', 'unread', 'read'].map((f) => (
                          <button
                            key={f}
                            onClick={() => setAnnouncementReadFilter(f as any)}
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              announcementReadFilter === f ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {f === 'all' ? '全部' : f === 'unread' ? '未读' : '已读'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {announcements
                      .filter((a) => {
                        if (announcementReadFilter === 'unread' && a.isRead) return false;
                        if (announcementReadFilter === 'read' && !a.isRead) return false;
                        return true;
                      })
                      .map((anc) => (
                        <div
                          key={anc.id}
                          onClick={() => {
                            setSelectedAnnouncement(anc);
                            setAnnouncements((prev) => prev.map((item) => (item.id === anc.id ? { ...item, isRead: true } : item)));
                          }}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                            !anc.isRead ? 'bg-white border-blue-200 shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}
                        >
                          {!anc.isRead && (
                            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          )}
                          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                            <span className="bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">系统公告</span>
                            <span>{anc.time}</span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-900">{anc.title}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{anc.content}</p>
                        </div>
                      ))}
                  </div>
                )}

                {/* Section 2: 审核提醒 & 报送结果通知 */}
                {(msgCategory === 'all' || msgCategory === 'audit_remind' || msgCategory === 'report_notice') && (
                  <div className="space-y-2 pt-1">
                    <span className="font-bold text-xs text-slate-800 px-1">消息与提醒通知</span>
                    {h5Messages
                      .filter((m) => {
                        if (msgCategory !== 'all' && m.category !== msgCategory) return false;
                        return true;
                      })
                      .map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-2xl border transition-all space-y-1.5 relative ${
                            !msg.isRead ? 'bg-white border-blue-200 shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}
                        >
                          {!msg.isRead && (
                            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-500"></span>
                          )}
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                              {msg.category === 'audit_remind' ? '审核提醒' : '报送结果通知'}
                            </span>
                            <span className="text-slate-400">{msg.time}</span>
                          </div>

                          <h4 className="font-bold text-xs text-slate-900">{msg.title}</h4>
                          <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl">{msg.content}</p>

                          {/* Quick Jump Handler for Todo Reminder */}
                          {msg.category === 'audit_remind' && (
                            <div className="pt-1 flex justify-end">
                              <button
                                onClick={() => {
                                  setActiveTab('audit');
                                  setAuditSubTab('pending');
                                  setH5Messages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m)));
                                  triggerH5Toast('已快捷跳转至待审核页面处理！');
                                }}
                                className="px-3 py-1 bg-[#1E5ABB] text-white text-[10px] font-bold rounded-lg flex items-center space-x-1 cursor-pointer"
                              >
                                <span>快速跳转处理</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* ================= 4. 个人中心 (Personal Center) ================= */}
            {activeTab === 'profile' && (
              <div className="p-3.5 space-y-3.5 animate-in fade-in duration-150">
                {/* 1. 登录校验 & 身份信息卡片 */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-md space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-blue-600 border-2 border-white/20 text-white font-black text-lg flex items-center justify-center shadow-inner">
                      {userProfile.name.slice(0, 1)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-black text-sm text-white">{userProfile.name}</h3>
                        <span className="px-2 py-0.2 bg-amber-400 text-slate-900 text-[9px] font-black rounded-full">
                          网格员
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">{userProfile.orgName}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">编号: {userProfile.code} | 责任: {userProfile.gridName}</p>
                    </div>
                  </div>

                  {/* 登录校验标志 (对应清单: 登录认证 / 登录校验) */}
                  <div className="bg-white/10 rounded-xl p-2.5 flex items-center justify-between text-[10px] border border-white/15">
                    <div className="flex items-center space-x-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="font-bold text-white">二维码身份已校验通过</p>
                        <p className="text-slate-300 text-[9px]">后台生成二维码已成功同步验证 ({userProfile.verifyTime})</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowQrVerifyModal(true)}
                      className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg text-[9px] shrink-0"
                    >
                      补充校验
                    </button>
                  </div>
                </div>

                {/* 2. 个人基础信息 (信息查看 / 信息编辑) */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="font-bold text-xs text-slate-800 flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>个人基础信息</span>
                    </span>
                    <button
                      onClick={() => setShowProfileModal(true)}
                      className="text-[10px] bg-blue-50 text-[#1E5ABB] px-2 py-1 rounded-lg font-bold flex items-center space-x-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span>编辑基础信息</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-slate-400 text-[10px] block">账号/工号</span>
                      <span className="font-bold text-slate-800">{userProfile.code}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-slate-400 text-[10px] block">联系电话</span>
                      <span className="font-bold text-slate-800">{userProfile.phone}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl col-span-2">
                      <span className="text-slate-400 text-[10px] block">责任网格区域</span>
                      <span className="font-bold text-slate-800">{userProfile.gridName}</span>
                    </div>
                  </div>
                </div>

                {/* 3. 报送、审核统计 (双卡片视角) */}
                <div className="space-y-2">
                  <span className="font-bold text-xs text-slate-800 px-1">报送与审核统计面板</span>
                  <div className="grid grid-cols-2 gap-2">
                    {/* 报送统计 */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                      <p className="font-bold text-xs text-[#1E5ABB] border-b pb-1">报送统计</p>
                      <div className="grid grid-cols-2 gap-1.5 text-center text-[10px]">
                        <div className="bg-blue-50/80 p-1.5 rounded-lg">
                          <p className="text-slate-400">报送总量</p>
                          <p className="font-black text-sm text-blue-900">{reports.length}</p>
                        </div>
                        <div className="bg-emerald-50/80 p-1.5 rounded-lg">
                          <p className="text-slate-400">采纳通过</p>
                          <p className="font-black text-sm text-emerald-600">{passedCount}</p>
                        </div>
                        <div className="bg-rose-50/80 p-1.5 rounded-lg">
                          <p className="text-slate-400">驳回量</p>
                          <p className="font-black text-sm text-rose-600">2</p>
                        </div>
                        <div className="bg-amber-50/80 p-1.5 rounded-lg">
                          <p className="text-slate-400">草稿箱</p>
                          <p className="font-black text-sm text-amber-600">{h5Drafts.length}</p>
                        </div>
                      </div>
                    </div>

                    {/* 审核统计 */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                      <p className="font-bold text-xs text-amber-700 border-b pb-1">审核统计</p>
                      <div className="grid grid-cols-2 gap-1.5 text-center text-[10px]">
                        <div className="bg-amber-50/80 p-1.5 rounded-lg">
                          <p className="text-slate-400">审核总量</p>
                          <p className="font-black text-sm text-amber-800">{auditRecords.length + pendingCount}</p>
                        </div>
                        <div className="bg-emerald-50/80 p-1.5 rounded-lg">
                          <p className="text-slate-400">打分通过</p>
                          <p className="font-black text-sm text-emerald-600">{auditRecords.filter((a) => a.action === '审核通过').length}</p>
                        </div>
                        <div className="bg-rose-50/80 p-1.5 rounded-lg">
                          <p className="text-slate-400">驳回量</p>
                          <p className="font-black text-sm text-rose-600">{auditRecords.filter((a) => a.action === '驳回上报').length}</p>
                        </div>
                        <div className="bg-indigo-50/80 p-1.5 rounded-lg">
                          <p className="text-slate-400">合并审核</p>
                          <p className="font-black text-sm text-indigo-600">3</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. 数据权限 (权限查看) */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="font-bold text-xs text-slate-800 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>数据访问与功能权限清单</span>
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                      正常生效中
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-600">
                    <div className="p-2 bg-slate-50 rounded-xl flex items-center justify-between">
                      <span className="font-medium">1. 网格数据权限</span>
                      <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded border">
                        当前责任网格查阅与速报
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl flex items-center justify-between">
                      <span className="font-medium">2. 极速上报与草稿暂存</span>
                      <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded border">
                        完全支持
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl flex items-center justify-between">
                      <span className="font-medium">3. 掌上打分审核与驳回</span>
                      <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded border">
                        完全支持
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl flex items-center justify-between">
                      <span className="font-medium">4. 同地址重复识别与合并</span>
                      <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded border">
                        已开通
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Floating Action Button */}
          <button
            onClick={() => {
              setActiveTab('report');
              setReportSubTab('form');
              triggerH5Toast('已准备好新建填报');
            }}
            className="absolute bottom-16 right-3.5 z-40 bg-gradient-to-r from-[#1E5ABB] to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full px-3.5 py-2.5 font-black text-xs shadow-xl flex items-center space-x-1.5 active:scale-95 transition-all border border-white/30 cursor-pointer ring-4 ring-blue-500/20"
            title="快速上报"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>快速上报</span>
          </button>

          {/* H5 Mobile Bottom Navigation Bar: Matching the 4 Level-1 Checklist Modules */}
          <div className="absolute bottom-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-t border-slate-200/90 grid grid-cols-4 z-40 text-[10px] font-bold">
            {[
              { id: 'report', label: '报送管理', icon: FileText },
              { id: 'audit', label: '审核处理', icon: ShieldCheck, badge: pendingCount },
              { id: 'messages', label: '消息中心', icon: MessageSquare, badge: unreadMsgCount },
              { id: 'profile', label: '个人中心', icon: User }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center justify-center space-y-0.5 relative transition-colors cursor-pointer ${
                    isActive ? 'text-[#1E5ABB]' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''} transition-transform`} />
                    {tab.badge && tab.badge > 0 ? (
                      <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                        {tab.badge}
                      </span>
                    ) : null}
                  </div>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Home Indicator */}
          {viewMode === 'device' && (
            <div className="w-32 h-1 bg-slate-300 rounded-full mx-auto my-1 z-40 pointer-events-none"></div>
          )}
        </div>
      </div>

      {/* ================= MODAL: 编辑个人信息 (Personal Info Edit Modal) ================= */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-sm p-4 space-y-3 text-xs border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-slate-800 text-sm">修改个人基础信息</span>
              <button onClick={() => setShowProfileModal(false)} className="p-1 rounded-lg bg-slate-100 text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">网格员昵称</label>
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">联系电话</label>
                <input
                  type="text"
                  value={userProfile.phone}
                  onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">责任网格区域</label>
                <input
                  type="text"
                  value={userProfile.gridName}
                  onChange={(e) => setUserProfile({ ...userProfile, gridName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setShowProfileModal(false);
                triggerH5Toast('个人基础信息已成功更新！');
              }}
              className="w-full py-2.5 bg-[#1E5ABB] text-white font-bold rounded-xl"
            >
              保存修改
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: 扫码补充验证 (QR Code Login Verification) ================= */}
      {showQrVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-sm p-4 text-center space-y-3 text-xs border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-slate-800 text-sm">二维码登录校验与信息补充</span>
              <button onClick={() => setShowQrVerifyModal(false)} className="p-1 rounded-lg bg-slate-100 text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <QrCode className="w-16 h-16 text-[#1E5ABB] mx-auto" />
              <p className="font-bold text-slate-800">使用后台生成二维码扫描验证</p>
              <p className="text-[10px] text-slate-400">已完成 H5 登录验证和网格工号信息绑核</p>
            </div>

            <button
              onClick={() => {
                setShowQrVerifyModal(false);
                setUserProfile({
                  ...userProfile,
                  isQrVerified: true,
                  verifyTime: new Date().toLocaleString()
                });
                triggerH5Toast('二维码登录校验刷新成功！');
              }}
              className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl"
            >
              模拟扫码补充验证成功
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: 系统公告详情 (Announcement Detail) ================= */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-sm p-4 space-y-3 text-xs border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-slate-800 text-sm">系统公告详情</span>
              <button onClick={() => setSelectedAnnouncement(null)} className="p-1 rounded-lg bg-slate-100 text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-bold text-xs text-slate-900 leading-snug">{selectedAnnouncement.title}</h3>
            <p className="text-[10px] text-slate-400">
              发布单位: {selectedAnnouncement.publisher} · 时间: {selectedAnnouncement.time}
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
              {selectedAnnouncement.content}
            </div>

            <button
              onClick={() => {
                setSelectedAnnouncement(null);
                triggerH5Toast('公告已标记已读');
              }}
              className="w-full py-2.5 bg-[#1E5ABB] text-white font-bold rounded-xl"
            >
              确认已阅读
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: 同地址合并审核 (Batch Audit Modal) ================= */}
      {batchAddressTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-sm p-4 space-y-3 text-xs border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-amber-900 text-sm">同地址一键合并审核</span>
              <button onClick={() => setBatchAddressTarget(null)} className="p-1 rounded-lg bg-slate-100 text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 space-y-1">
              <p className="font-bold text-amber-900">涉事地址: {batchAddressTarget}</p>
              <p className="text-[10px] text-amber-800">
                该地址下共包含 <strong>{(batchAddressTarget && pendingReportsByRegion[batchAddressTarget]) ? pendingReportsByRegion[batchAddressTarget].length : 0}</strong> 条待审核速报
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">统一通过打分</label>
              <div className="flex space-x-1.5">
                {[80, 85, 90, 95, 100].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setBatchAuditScore(s)}
                    className={`flex-1 py-1.5 rounded-xl font-bold border ${
                      batchAuditScore === s ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {s}分
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">合并审核意见</label>
              <textarea
                rows={2}
                value={batchAuditOpinion}
                onChange={(e) => setBatchAuditOpinion(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              ></textarea>
            </div>

            <button
              onClick={handleBatchAuditSubmit}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
            >
              一键合并并批量打分通过
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: 速报记录详情 (Report Detail Modal) ================= */}
      {mobileDetailReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto p-4 space-y-3 text-xs border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-slate-800 text-sm">速报详情 (H5预览)</span>
              <button
                onClick={() => setMobileDetailReport(null)}
                className="p-1 rounded-lg bg-slate-100 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] bg-blue-100 text-[#1E5ABB] font-bold px-2 py-0.5 rounded">
                  {mobileDetailReport.infoType}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                  {mobileDetailReport.region}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  {mobileDetailReport.auditStatus}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 leading-snug">{mobileDetailReport.title}</h3>
              <p className="text-[10px] text-slate-400">
                来源: {mobileDetailReport.source} | 上报时间: {mobileDetailReport.submitTime}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5">
              <p className="font-bold text-slate-700 text-[11px]">【核心摘要】</p>
              <p className="text-slate-600 leading-relaxed">
                {mobileDetailReport.detailContent?.summary || '暂无摘要'}
              </p>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200/80 space-y-1.5">
              <p className="font-bold text-amber-900 text-[11px]">【网民诉求与处置建议】</p>
              <p className="text-amber-800 leading-relaxed">
                {mobileDetailReport.detailContent?.coreDemands || '暂无处置建议'}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setMobileDetailReport(null)}
                className="w-full py-2 bg-[#1E5ABB] text-white rounded-xl font-bold cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: 掌上单条审核弹窗 (Audit Modal) ================= */}
      {auditTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-sm p-4 space-y-3 text-xs border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-slate-800 text-sm">
                {auditScore > 0 ? '通过审阅并打分' : '驳回该速报上报'}
              </span>
              <button
                onClick={() => setAuditTarget(null)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-bold text-slate-800 text-xs line-clamp-2">{auditTarget.title}</p>

            {auditScore > 0 ? (
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    给予评分: <span className="text-emerald-600 font-black text-sm">{auditScore} 分</span>
                  </label>
                  <div className="flex space-x-1.5">
                    {[80, 85, 90, 95, 100].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setAuditScore(s)}
                        className={`flex-1 py-1.5 rounded-xl font-bold text-xs border cursor-pointer ${
                          auditScore === s
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {s}分
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    onApproveAudit(auditTarget.id, auditScore);
                    triggerH5Toast(`审核成功，已给予 ${auditScore} 分！`);
                    setAuditTarget(null);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  确认通过并打分
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">驳回原因分类</label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="信息要素不全">信息要素不全</option>
                    <option value="重复上报">重复上报</option>
                    <option value="非本辖区事件">非本辖区事件</option>
                    <option value="不符合采报标准">不符合采报标准</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">具体修改说明</label>
                  <textarea
                    rows={2}
                    value={rejectDetail}
                    onChange={(e) => setRejectDetail(e.target.value)}
                    placeholder="请输入驳回修改指导意见..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  ></textarea>
                </div>

                <button
                  onClick={() => {
                    onRejectAudit(auditTarget.id, rejectReason, rejectDetail);
                    triggerH5Toast('已驳回该速报上报');
                    setAuditTarget(null);
                  }}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  确认驳回速报
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: 手机扫码预览 (QR Code Simulator) ================= */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center space-y-3 shadow-2xl">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 text-sm">手机扫码体验 H5 移动端</span>
              <button onClick={() => setShowQrModal(false)} className="p-1 rounded-lg bg-slate-100 text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
              <div className="w-36 h-36 bg-white p-2 rounded-lg border shadow-inner flex items-center justify-center relative">
                <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-slate-900 rounded">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`${
                        (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35
                          ? 'bg-white'
                          : 'bg-transparent'
                      } rounded-[1px]`}
                    ></div>
                  ))}
                </div>
                <div className="absolute w-8 h-8 rounded-full bg-[#1E5ABB] border-2 border-white flex items-center justify-center font-black text-white text-[10px]">
                  网
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-700 mt-2">支持微信 / 浏览器一键扫码</p>
              <p className="text-[10px] text-slate-400">已自动适配各类智能手机屏幕</p>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: 微信公众号菜单弹窗 (WeChat Official Account Menu) ================= */}
      {showWechatMenu && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 text-white rounded-t-3xl sm:rounded-2xl w-full max-w-sm p-4 space-y-3 text-xs border border-slate-800 shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#07C160] flex items-center justify-center font-black text-xs text-white">
                  微
                </div>
                <span className="font-bold text-sm text-white">微信公众号内嵌网页功能菜单</span>
              </div>
              <button
                onClick={() => setShowWechatMenu(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-[10px] py-1">
              <button
                onClick={() => {
                  setShowWechatMenu(false);
                  triggerH5Toast('已发送给微信好友！');
                }}
                className="p-2 bg-slate-800/80 hover:bg-slate-800 rounded-xl flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <span>发送给朋友</span>
              </button>

              <button
                onClick={() => {
                  setShowWechatMenu(false);
                  triggerH5Toast('已成功分享至微信朋友圈！');
                }}
                className="p-2 bg-slate-800/80 hover:bg-slate-800 rounded-xl flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <span>分享到朋友圈</span>
              </button>

              <button
                onClick={() => {
                  setShowWechatMenu(false);
                  handleCopyLink();
                  triggerH5Toast('已复制微信公众号H5网页链接！');
                }}
                className="p-2 bg-slate-800/80 hover:bg-slate-800 rounded-xl flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <span>复制链接</span>
              </button>

              <button
                onClick={() => {
                  setShowWechatMenu(false);
                  triggerH5Toast('网页已成功刷新！');
                }}
                className="p-2 bg-slate-800/80 hover:bg-slate-800 rounded-xl flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <RotateCw className="w-4 h-4" />
                </div>
                <span>刷新网页</span>
              </button>
            </div>

            <div className="bg-slate-800 p-2.5 rounded-xl flex items-center justify-between text-[10px]">
              <span className="text-slate-300">公众号: 台中网信网格通 (已认证)</span>
              <span className="text-[#07C160] font-bold">微信公众号H5场景</span>
            </div>

            <button
              onClick={() => setShowWechatMenu(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
