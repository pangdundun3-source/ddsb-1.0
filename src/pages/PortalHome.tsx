import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Bell,
  Headphones,
  Settings,
  Globe,
  Search,
  ChevronDown,
  ExternalLink,
  Shield,
  Layers,
  FileText,
  AlertTriangle,
  Lock,
  X,
  Check,
  Sparkles,
  ArrowRight,
  Home,
  LogOut,
  User,
  Building,
  Building2,
  Eye,
  Radio,
  Clock,
  Inbox,
  ArrowLeftRight,
  ShieldCheck,
  Phone,
  CheckCircle2,
  LayoutGrid,
  SquarePen,
  CreditCard,
  BookOpen,
  MapPin,
  MessageSquare,
  RefreshCw,
  SlidersHorizontal,
  CheckCheck,
  Download,
  Upload,
  UserPlus,
  KeyRound,
  Trash2,
  Plus,
  Filter,
  Power,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { PageId, ReportItem } from '../types';
import sunsetBg from '../assets/images/sunset_grassland.jpg';

interface PortalHomeProps {
  currentUser: string;
  reports: ReportItem[];
  onNavigate: (page: PageId, extraModule?: string) => void;
  onSelectReport: (report: ReportItem) => void;
  onLogout: () => void;
  currentOrg?: string;
  onSwitchOrg?: (org: string) => void;
  userName?: string;
  onUpdateUserName?: (name: string) => void;
  userPhone?: string;
  onUpdateUserPhone?: (phone: string) => void;
  initialTab?: 'grid' | 'profile' | 'notifications' | 'org-users' | 'org-apps';
  onTabChange?: (tab: 'grid' | 'profile' | 'notifications' | 'org-users' | 'org-apps') => void;
}

const ORG_OPTIONS = [
  { name: '禁用-测试机构 (台湾省)', code: 'TEST-TW-01' },
  { name: '台中市网信办', code: 'TC-WXB-01' },
  { name: '西区网络网信局', code: 'TC-XQ-01' },
];

// Initial mock data for Notifications Table
interface SystemNotification {
  id: string;
  title: string;
  category: '特急处置' | '预警督办' | '机构动态' | '系统维护';
  sourceOrg: string;
  time: string;
  isRead: boolean;
  content: string;
}

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'NOTIF-01',
    title: '【特急处置】关于涉台突发涉稳虚假舆情多级流转与快速核处通报',
    category: '特急处置',
    sourceOrg: '台中市网信办',
    time: '2026-09-04 16:30',
    isRead: false,
    content: '监测发现部分境外社媒账号发布涉台民生领域不实煽动言论，已完成首轮事实核验与矩阵阻断，请各联动单位持续跟踪落地核处。'
  },
  {
    id: 'NOTIF-02',
    title: '【预警督办】境外虚假账号定向炒作涉农补贴谣言处置研判报告已下发',
    category: '预警督办',
    sourceOrg: '省委宣传部',
    time: '2026-09-04 14:15',
    isRead: false,
    content: '指令编号 ZL-20260904-001 已流转至台中市网信办处置专班，需于2小时内完成初审与辟谣口径上报。'
  },
  {
    id: 'NOTIF-03',
    title: '【机构动态】西区网络网信局正式接入“点点速豹”多级协同处置专网',
    category: '机构动态',
    sourceOrg: '运维调度中心',
    time: '2026-09-04 11:20',
    isRead: true,
    content: '西区网络网信局已完成专网CA证书颁发与国密三级鉴权互联，支持全量指令一键跨级直办。'
  },
  {
    id: 'NOTIF-04',
    title: '【系统维护】网络生态治理平台国密鉴权证书月度例行安全轮换提醒',
    category: '系统维护',
    sourceOrg: '系统安全中心',
    time: '2026-09-03 09:00',
    isRead: true,
    content: '平台将于2026年9月5日凌晨02:00-04:00进行网信CA数字证书升级，期间单点登录通道将保持双轨冗余备用。'
  },
  {
    id: 'NOTIF-05',
    title: '【预警督办】关于涉及“食安谣言”线索移送市场监管部门联合协查进展',
    category: '预警督办',
    sourceOrg: '市应急指挥中心',
    time: '2026-09-02 17:40',
    isRead: true,
    content: '协同协查函已转送市场监管与公安网安大队，经查涉事视频为移花接木剪辑，已生成官方辟谣澄清文稿。'
  },
  {
    id: 'NOTIF-06',
    title: '【机构动态】本季度舆情处置特急响应平均时效缩短至12.5分钟通报表扬',
    category: '机构动态',
    sourceOrg: '台中市网信办',
    time: '2026-09-01 10:00',
    isRead: true,
    content: '各部门通过“点点速豹”流转审核效率大幅提升，应急直报与多级研判闭环率达到99.2%。'
  }
];

// Initial mock data for Organization Users Table
interface OrgUser {
  id: string;
  name: string;
  phone: string;
  dept: string;
  role: string;
  authLevel: string;
  status: '正常' | '停用';
  lastLogin: string;
}

const INITIAL_ORG_USERS: OrgUser[] = [
  {
    id: 'USR-01',
    name: '张三 (. w .)',
    phone: '178****9573',
    dept: '舆情速报与研判处置科',
    role: '平台超级管理员',
    authLevel: '国密三级鉴权',
    status: '正常',
    lastLogin: '2026-09-04 16:52'
  },
  {
    id: 'USR-02',
    name: '李四 (李科长)',
    phone: '139****1122',
    dept: '应急处置联络专班',
    role: '终审签发员',
    authLevel: '国密三级鉴权',
    status: '正常',
    lastLogin: '2026-09-04 15:30'
  },
  {
    id: 'USR-03',
    name: '王五 (监测专员)',
    phone: '137****3344',
    dept: '涉网舆情巡查一室',
    role: '舆情速报员',
    authLevel: '动态令牌认证',
    status: '正常',
    lastLogin: '2026-09-04 14:10'
  },
  {
    id: 'USR-04',
    name: '赵六 (网安协查)',
    phone: '186****5566',
    dept: '警网联合督办组',
    role: '跨机构协查专员',
    authLevel: '专网CA证书',
    status: '正常',
    lastLogin: '2026-09-03 18:20'
  },
  {
    id: 'USR-05',
    name: '钱七 (辟谣中心)',
    phone: '150****7788',
    dept: '涉台网络辟谣专班',
    role: '辟谣发布专员',
    authLevel: '动态令牌认证',
    status: '正常',
    lastLogin: '2026-09-02 16:45'
  },
  {
    id: 'USR-06',
    name: '孙八 (技术测试)',
    phone: '135****9900',
    dept: '综合技术运维科',
    role: '系统安全审计员',
    authLevel: '专网CA证书',
    status: '停用',
    lastLogin: '2026-08-28 10:12'
  }
];

// Initial mock data for Organization Apps Table
interface OrgAppItem {
  id: string;
  name: string;
  code: string;
  version: string;
  badge: '正式版' | '试用版' | '已停用' | '未开通';
  badgeColor: string;
  desc: string;
  authorizedDepts: string;
  authUsersCount: number;
  runStatus: '运行正常' | '试用中 (剩25天)' | '暂停维护' | '待开通审批';
  isCore: boolean;
}

const INITIAL_ORG_APPS: OrgAppItem[] = [
  {
    id: 'APP-01',
    name: '点点速豹',
    code: 'DDSB-SPEED',
    version: 'V8.6.2',
    badge: '正式版',
    badgeColor: 'bg-[#EA580C]',
    desc: '舆情极速直报、多级跨域审核、处置指令实时下达与全链条闭环调度',
    authorizedDepts: '台中市网信办全员、应急指挥中心',
    authUsersCount: 38,
    runStatus: '运行正常',
    isCore: true
  },
  {
    id: 'APP-02',
    name: '指令流转',
    code: 'ZL-DISPATCH',
    version: 'V5.1.0',
    badge: '正式版',
    badgeColor: 'bg-[#1E5ABB]',
    desc: '涉网高危突发线索专项研判、督办处置与部门协同办结中枢',
    authorizedDepts: '涉网应急值班室、联络专班',
    authUsersCount: 26,
    runStatus: '运行正常',
    isCore: true
  },
  {
    id: 'APP-03',
    name: '线索排查',
    code: 'XS-TRACE',
    version: 'V3.2.0',
    badge: '正式版',
    badgeColor: 'bg-[#1B7EF2]',
    desc: '全网涉不良信息及虚假有害线索多维筛查、证据保全与溯源分析',
    authorizedDepts: '网安巡查室、法制核查专班',
    authUsersCount: 24,
    runStatus: '运行正常',
    isCore: true
  },
  {
    id: 'APP-04',
    name: '全网搜',
    code: 'QWS-SEARCH',
    version: 'V2.0.1',
    badge: '试用版',
    badgeColor: 'bg-[#C59265]',
    desc: '跨域全网多源网络生态社情民意聚合检索与语义聚类分析',
    authorizedDepts: '综合调研科、舆情监测室',
    authUsersCount: 15,
    runStatus: '试用中 (剩25天)',
    isCore: false
  },
  {
    id: 'APP-05',
    name: '谛听预警',
    code: 'DT-LISTEN',
    version: 'V1.8.0',
    badge: '已停用',
    badgeColor: 'bg-[#EB4444]',
    desc: '社情声量异动波动听诊感知模型（正进行全国产化信创架构重构升级）',
    authorizedDepts: '系统运维保障组',
    authUsersCount: 0,
    runStatus: '暂停维护',
    isCore: false
  },
  {
    id: 'APP-06',
    name: '点点密信',
    code: 'DDMX-SECRET',
    version: 'V1.0.0',
    badge: '未开通',
    badgeColor: 'bg-[#8FA1B4]',
    desc: '政务内网量子防泄密端到端高安全加密协同工作通信组件',
    authorizedDepts: '机要保密室',
    authUsersCount: 0,
    runStatus: '待开通审批',
    isCore: false
  },
  {
    id: 'APP-07',
    name: '全球眼',
    code: 'QQY-EYE',
    version: 'V1.0.0',
    badge: '未开通',
    badgeColor: 'bg-[#8FA1B4]',
    desc: '境外主流社交网络平台涉台重点话题态势感知看板',
    authorizedDepts: '涉外网信调研室',
    authUsersCount: 0,
    runStatus: '待开通审批',
    isCore: false
  },
  {
    id: 'APP-08',
    name: '属地系统',
    code: 'SD-TERRITORY',
    version: 'V1.0.0',
    badge: '未开通',
    badgeColor: 'bg-[#8FA1B4]',
    desc: '区县级网信机构纵向贯通专线、属地化网格快速联处终端',
    authorizedDepts: '属地区县联络办',
    authUsersCount: 0,
    runStatus: '待开通审批',
    isCore: false
  },
  {
    id: 'APP-09',
    name: '数解舆情',
    code: 'SJ-ANALYTICS',
    version: 'V1.0.0',
    badge: '未开通',
    badgeColor: 'bg-[#8FA1B4]',
    desc: 'AI大模型辅助舆情走势多阶段态势推演与量化评估系统',
    authorizedDepts: '数据智能研判实验室',
    authUsersCount: 0,
    runStatus: '待开通审批',
    isCore: false
  }
];

export const PortalHome: React.FC<PortalHomeProps> = ({
  currentUser,
  reports,
  onNavigate,
  onSelectReport,
  onLogout,
  currentOrg: propCurrentOrg,
  onSwitchOrg,
  userName: propUserName,
  onUpdateUserName,
  userPhone: propUserPhone,
  onUpdateUserPhone,
  initialTab,
  onTabChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSwitchOrgModal, setShowSwitchOrgModal] = useState(false);
  const [currentOrg, setCurrentOrg] = useState(propCurrentOrg || '台中市网信办');
  const [selectedTempOrg, setSelectedTempOrg] = useState(propCurrentOrg || '台中市网信办');
  const [switchToast, setSwitchToast] = useState<string | null>(null);
  const [activeAppModal, setActiveAppModal] = useState<string | null>(null);
  const [activePortalTab, setActivePortalTab] = useState<'grid' | 'profile' | 'notifications' | 'org-users' | 'org-apps'>(initialTab || 'grid');
  const [showAppNavPopover, setShowAppNavPopover] = useState(false);

  // User Profile Basic Info editable states (matching screenshot)
  const [userName, setUserName] = useState(propUserName || '. w .');
  const [userPhone, setUserPhone] = useState(propUserPhone || '178****9573');
  const [userWechat] = useState('· W ·');
  const [editFieldModal, setEditFieldModal] = useState<'name' | 'phone' | null>(null);
  const [editInputValue, setEditInputValue] = useState('');

  // Synchronize incoming props
  React.useEffect(() => {
    if (propCurrentOrg) {
      setCurrentOrg(propCurrentOrg);
      setSelectedTempOrg(propCurrentOrg);
    }
  }, [propCurrentOrg]);

  React.useEffect(() => {
    if (propUserName) {
      setUserName(propUserName);
    }
  }, [propUserName]);

  React.useEffect(() => {
    if (propUserPhone) {
      setUserPhone(propUserPhone);
    }
  }, [propUserPhone]);

  React.useEffect(() => {
    if (initialTab) {
      setActivePortalTab(initialTab);
    }
  }, [initialTab]);

  const handleTabSelect = (tab: 'grid' | 'profile' | 'notifications' | 'org-users' | 'org-apps') => {
    setShowAppNavPopover(false);
    setActivePortalTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Notifications State & Filters
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [notifSearch, setNotifSearch] = useState('');
  const [notifCategoryFilter, setNotifCategoryFilter] = useState('全部');
  const [notifStatusFilter, setNotifStatusFilter] = useState('全部');
  const [selectedNotifDetail, setSelectedNotifDetail] = useState<SystemNotification | null>(null);

  // Organization Users State & Filters
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>(INITIAL_ORG_USERS);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('全部');
  const [userStatusFilter, setUserStatusFilter] = useState('全部');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: '', phone: '', dept: '舆情速报与研判处置科', role: '舆情速报员' });

  // Organization Apps State & Filters
  const [orgApps, setOrgApps] = useState<OrgAppItem[]>(INITIAL_ORG_APPS);
  const [appSearch, setAppSearch] = useState('');
  const [appBadgeFilter, setAppBadgeFilter] = useState('全部');

  const handleConfirmSwitchOrg = () => {
    setCurrentOrg(selectedTempOrg);
    if (onSwitchOrg) {
      onSwitchOrg(selectedTempOrg);
    }
    setShowSwitchOrgModal(false);
    setShowUserMenu(false);
    setSwitchToast(`已成功切换当前管理机构为：${selectedTempOrg}`);
    setTimeout(() => {
      setSwitchToast(null);
    }, 3000);
  };

  // Profile Edit Save
  const handleSaveProfileEdit = () => {
    if (editFieldModal === 'name') {
      if (editInputValue.trim()) {
        const val = editInputValue.trim();
        setUserName(val);
        if (onUpdateUserName) {
          onUpdateUserName(val);
        }
        setSwitchToast('个人昵称修改成功');
      }
    } else if (editFieldModal === 'phone') {
      if (editInputValue.trim()) {
        const val = editInputValue.trim();
        setUserPhone(val);
        if (onUpdateUserPhone) {
          onUpdateUserPhone(val);
        }
        setSwitchToast('联系电话修改成功');
      }
    }
    setEditFieldModal(null);
    setTimeout(() => setSwitchToast(null), 2500);
  };

  // Notification actions
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setSwitchToast('已全部标记为已读');
    setTimeout(() => setSwitchToast(null), 2500);
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const handleDeleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setSwitchToast('通知已删除');
    setTimeout(() => setSwitchToast(null), 2000);
  };

  // Org Users actions
  const handleToggleUserStatus = (id: string) => {
    setOrgUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === '正常' ? '停用' : '正常' } : u
      )
    );
    setSwitchToast('用户状态已更新');
    setTimeout(() => setSwitchToast(null), 2000);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.phone) return;
    const newUser: OrgUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: newUserData.name,
      phone: newUserData.phone,
      dept: newUserData.dept,
      role: newUserData.role,
      authLevel: '动态令牌认证',
      status: '正常',
      lastLogin: '刚刚'
    };
    setOrgUsers([newUser, ...orgUsers]);
    setShowAddUserModal(false);
    setNewUserData({ name: '', phone: '', dept: '舆情速报与研判处置科', role: '舆情速报员' });
    setSwitchToast(`已成功添加机构用户：${newUserData.name}`);
    setTimeout(() => setSwitchToast(null), 2500);
  };

  // App Matrix Launch
  const handleAppLaunch = (appName: string) => {
    if (appName === '点点速豹' || appName === '指令流转') {
      onNavigate('home');
    } else if (appName === '线索排查') {
      onNavigate('negative-info');
    } else {
      setActiveAppModal(appName);
    }
  };

  // Search filter for 9-grid
  const filteredReports = searchQuery.trim()
    ? reports.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.org.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    }
  };

  const handleAppClick = (appName: string) => {
    if (appName === '指令流转' || appName === '点点速豹') {
      onNavigate('home');
    } else if (appName === '线索排查') {
      onNavigate('negative-info');
    } else {
      setActiveAppModal(appName);
    }
  };

  // Generate repeated watermark items
  const watermarks = Array.from({ length: 48 });

  return (
    <div className={`relative min-h-screen w-full select-none overflow-x-hidden font-sans flex flex-col justify-between ${
      activePortalTab === 'grid' ? 'text-white bg-slate-900' : 'text-slate-800 bg-[#F8F6F2]'
    }`}>
      {/* 1. Full-bleed Sunset Grassland Landscape Wallpaper (Shown on 9-Grid Portal Home) */}
      {activePortalTab === 'grid' && (
        <div className="absolute inset-0 z-0">
          <img
            src={sunsetBg}
            alt="Sunset Grassland"
            className="w-full h-full object-cover object-center scale-[1.01]"
          />
          {/* Soft atmospheric sunset gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/60 pointer-events-none" />
          <div className="absolute inset-0 bg-radial from-transparent via-black/10 to-black/40 pointer-events-none" />
        </div>
      )}

      {/* 2. Security Floating Watermark Grid (1:1 with photo: ". w . 9573 2026-09-05 12:47") */}
      <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden select-none">
        <div className="w-[140%] h-[140%] -top-[20%] -left-[20%] absolute grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-x-12 gap-y-24 -rotate-[22deg]">
          {watermarks.map((_, i) => (
            <div
              key={i}
              className={`text-[13px] font-mono tracking-widest whitespace-nowrap ${
                activePortalTab === 'grid' ? 'text-white/10' : 'text-[#5C3D23]/[0.07]'
              }`}
            >
              <div>. w . 9573</div>
              <div className="text-[11px] opacity-80">2026-09-05 12:47</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Top Navigation Bar (Header) - 1:1 Adaptive: White background on Profile/Subtabs, Glassmorphism on Grid */}
      <header
        className={`relative z-40 w-full px-6 sm:px-10 lg:px-12 py-3 flex items-center justify-between transition-colors ${
          activePortalTab === 'grid'
            ? 'pt-4 pb-3'
            : 'bg-white border-b border-gray-200 shadow-2xs'
        }`}
      >
        {/* Left Brand Area */}
        <div className="flex items-center space-x-4">
          {/* Logo box with network nodes (1:1 with photo) */}
          <div
            onClick={() => setActivePortalTab('grid')}
            className="flex items-center space-x-2.5 cursor-pointer select-none"
            title="点击返回应用门户"
          >
            <div
              className={`w-8 h-8 rounded-lg p-1 flex items-center justify-center shadow-xs transition-all ${
                activePortalTab === 'grid'
                  ? 'border border-white/80 bg-white/10 backdrop-blur-xs'
                  : 'border border-[#7A4B23] bg-[#5C3D23]'
              }`}
            >
              <svg viewBox="0 0 32 32" className="w-full h-full text-white" fill="none">
                <rect x="2" y="2" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2" />
                <circle cx="16" cy="8" r="2.5" fill="currentColor" />
                <circle cx="8" cy="20" r="2.5" fill="currentColor" />
                <circle cx="24" cy="20" r="2.5" fill="currentColor" />
                <line x1="16" y1="8" x2="8" y2="20" stroke="currentColor" strokeWidth="1.8" />
                <line x1="16" y1="8" x2="24" y2="20" stroke="currentColor" strokeWidth="1.8" />
                <line x1="8" y1="20" x2="24" y2="20" stroke="currentColor" strokeWidth="1.8" />
                <text x="16" y="17" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">正</text>
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5 leading-none">
                <span
                  className={`text-[15px] font-extrabold tracking-wide ${
                    activePortalTab === 'grid' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  正管用
                </span>
                <span
                  className={`px-1 py-[1px] rounded text-[9px] font-bold leading-none border ${
                    activePortalTab === 'grid'
                      ? 'bg-white/20 backdrop-blur-xs text-white border-white/40'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  V8
                </span>
              </div>
              <span
                className={`text-[10px] font-normal leading-tight tracking-tight mt-0.5 ${
                  activePortalTab === 'grid' ? 'text-white/80' : 'text-slate-400'
                }`}
              >
                wxb.cn
              </span>
            </div>
          </div>

          {/* Title and Org tag */}
          <div className="flex items-center space-x-3">
            <h1
              className={`text-[19px] sm:text-[21px] font-bold tracking-wide ${
                activePortalTab === 'grid'
                  ? 'text-white drop-shadow-md'
                  : 'text-slate-900'
              }`}
            >
              网络生态综合治理平台
            </h1>
            <div
              className={`h-4 w-[1px] ${
                activePortalTab === 'grid' ? 'bg-white/40' : 'bg-slate-300'
              }`}
            />
            <div className="flex items-center space-x-2.5">
              <span
                className={`text-[13px] sm:text-[14px] font-normal tracking-wide ${
                  activePortalTab === 'grid'
                    ? 'text-white/90 drop-shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                {currentOrg}
              </span>
              {activePortalTab === 'grid' && (
                <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded border border-white/20 text-[11px]">
                  <span className="px-1.5 py-0.2 bg-[#1E5ABB] text-white font-bold rounded-xs text-[10px]">正式版</span>
                  <span className="text-white/90 font-mono text-[10px]">2026-09-29</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Tools Area (1:1 with photo) */}
        <div className="flex items-center space-x-3">
          {/* 1. Calendar Icon Button */}
          <button
            onClick={() => setShowCalendarModal(true)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
              activePortalTab === 'grid'
                ? 'border border-white/50 bg-white/10 hover:bg-white/25 backdrop-blur-md text-white'
                : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
            }`}
            title="查看系统工作日程"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>

          {/* 2. Notification Bell Icon Button */}
          <button
            onClick={() => {
              if (activePortalTab !== 'notifications') {
                setActivePortalTab('notifications');
              } else {
                setShowNotifModal(true);
              }
            }}
            className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
              activePortalTab === 'grid'
                ? 'border border-white/50 bg-white/10 hover:bg-white/25 backdrop-blur-md text-white'
                : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
            }`}
            title="通知中心"
          >
            <Bell className="w-4 h-4" />
            {notifications.some((n) => !n.isRead) && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* 3. Customer Service Headphone Icon Button (Hotline Support - 1:1 with Screenshot Image 1 & 2) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowContactModal(!showContactModal);
                setShowUserMenu(false);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                showContactModal
                  ? 'border border-blue-400 bg-blue-50 text-[#1E5ABB]'
                  : activePortalTab === 'grid'
                  ? 'border border-white/50 bg-white/10 hover:bg-white/25 backdrop-blur-md text-white'
                  : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
              title="技术支持热线"
            >
              <Headphones className="w-4 h-4" />
            </button>

            {/* Hotline Popover Dropdown - Exact 1:1 matching Image 2 */}
            {showContactModal && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowContactModal(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-[330px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-100/90 pt-7 pb-6 px-6 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-center text-slate-800">
                  {/* Circular Phone Icon with Light Blue Background */}
                  <div className="w-14 h-14 bg-[#EEF5FD] rounded-full flex items-center justify-center mx-auto mb-3.5">
                    <Phone className="w-6 h-6 text-[#1A457D] stroke-[2.2]" />
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-800 tracking-tight">
                    技术支持热线
                  </h3>

                  {/* Phone Number */}
                  <div className="text-[25px] font-extrabold text-[#173F80] tracking-wide my-2.5 font-sans">
                    4000-999-363
                  </div>

                  {/* Service Hours */}
                  <div className="text-xs text-slate-500 font-normal">
                    服务时间：工作日 08:30 - 18:00
                  </div>

                  {/* Description */}
                  <div className="text-[11px] text-slate-400 mt-1 mb-5 leading-relaxed">
                    提供系统运维、突发舆情应急支援与技术指导
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="w-full py-2.5 px-4 bg-[#1E4E8C] hover:bg-[#163E72] active:bg-[#12315B] text-white font-medium text-sm rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    我知道了
                  </button>
                </div>
              </>
            )}
          </div>

          {/* 4. User Profile & Avatar Menu (1:1 with screenshot: sunset circular avatar + .w. + ▼) */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center space-x-1.5 px-2 py-1 rounded-md transition-all cursor-pointer select-none ${
                activePortalTab === 'grid'
                  ? 'hover:bg-white/10 text-white'
                  : 'hover:bg-slate-100 text-slate-800'
              }`}
            >
              {/* Circular Avatar matching sunset photo in screenshot */}
              <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-300/80 shadow-2xs shrink-0">
                <img
                  src={sunsetBg}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[14px] font-bold tracking-wider">
                {userName}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 opacity-75 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu (1:1 with screenshot) */}
            {showUserMenu && (
              <>
                {/* Backdrop to close on outside click */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />

                <div className="absolute right-0 top-full mt-1.5 w-40 bg-white rounded-md shadow-2xl border border-gray-100 py-1 z-50 text-slate-700 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* 1. 个人中心 */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleTabSelect('profile');
                    }}
                    className={`w-full text-left px-4 py-2.5 flex items-center space-x-3 text-[13px] font-normal transition-colors cursor-pointer ${
                      activePortalTab === 'profile'
                        ? 'bg-amber-50 text-[#5C3D23] font-bold'
                        : 'hover:bg-slate-50 hover:text-blue-600'
                    }`}
                  >
                    <User className="w-4 h-4 text-slate-500 stroke-[1.8]" />
                    <span>个人中心</span>
                  </button>

                  {/* 2. 切换机构 */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setSelectedTempOrg(currentOrg);
                      setShowSwitchOrgModal(true);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 hover:text-blue-600 flex items-center space-x-3 text-[13px] font-normal transition-colors cursor-pointer"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-slate-500 stroke-[1.8]" />
                    <span>切换机构</span>
                  </button>

                  {/* 3. 退出登录 */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 hover:text-rose-600 flex items-center space-x-3 text-[13px] font-normal transition-colors cursor-pointer border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4 text-slate-500 stroke-[1.8]" />
                    <span>退出登录</span>
                  </button>
                </div>
              </>
            )}

            {/* SWITCH ORG POPOVER (exact 1:1 matching Header.tsx in 点点速豹) */}
            {showSwitchOrgModal && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSwitchOrgModal(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-[310px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 text-slate-800 animate-in fade-in zoom-in-95 overflow-hidden">
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">切换机构</h3>
                    <button
                      onClick={() => setShowSwitchOrgModal(false)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Organization Options List */}
                  <div className="p-5 space-y-2.5">
                    {ORG_OPTIONS.map((org) => {
                      const isSelected = selectedTempOrg === org.name;
                      return (
                        <div
                          key={org.code}
                          onClick={() => setSelectedTempOrg(org.name)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                            isSelected
                              ? 'border-[#1E5ABB] bg-blue-50/10 shadow-2xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">{org.name}</div>
                          
                          {/* Bottom-right blue checkmark badge matching screenshot & Header.tsx */}
                          {isSelected && (
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#1E5ABB] text-white rounded-tl-xl flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer Buttons matching screenshot & Header.tsx */}
                  <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end space-x-2.5">
                    <button
                      onClick={() => setShowSwitchOrgModal(false)}
                      className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleConfirmSwitchOrg}
                      className="px-4 py-1.5 bg-[#1E5ABB] hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs"
                    >
                      确定
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Sub-navigation bar: Brown bar with 4 Tabs: 基本信息 | 消息通知 | 机构用户 | 机构应用 */}
      {activePortalTab !== 'grid' && (
        <div className="relative z-30 w-full bg-[#5D3D22] border-b border-[#4A301A] px-6 sm:px-10 lg:px-12 flex items-center text-sm shadow-md">
          <div className="flex items-center overflow-x-auto">
            {/* 4-Grid Navigation Icon Button (1:1 with user screenshot: directly left of 基本信息) */}
            <button
              onClick={() => setShowAppNavPopover(!showAppNavPopover)}
              className={`px-3.5 py-2.5 transition-colors cursor-pointer select-none flex items-center justify-center shrink-0 ${
                showAppNavPopover
                  ? 'bg-[#3A2312] text-white shadow-inner'
                  : 'text-[#EAD8C7] hover:text-white hover:bg-white/5'
              }`}
              title="应用导航与返回工作台"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleTabSelect('profile')}
              className={`px-6 py-2.5 font-bold text-xs sm:text-[13px] transition-colors cursor-pointer select-none ${
                activePortalTab === 'profile'
                  ? 'bg-[#3A2312] text-white shadow-inner'
                  : 'text-[#EAD8C7] hover:text-white hover:bg-white/5'
              }`}
            >
              基本信息
            </button>
            <button
              onClick={() => handleTabSelect('notifications')}
              className={`px-6 py-2.5 font-bold text-xs sm:text-[13px] transition-colors cursor-pointer select-none flex items-center space-x-1.5 ${
                activePortalTab === 'notifications'
                  ? 'bg-[#3A2312] text-white shadow-inner'
                  : 'text-[#EAD8C7] hover:text-white hover:bg-white/5'
              }`}
            >
              <span>消息通知</span>
              {notifications.some((n) => !n.isRead) && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-bold">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabSelect('org-users')}
              className={`px-6 py-2.5 font-bold text-xs sm:text-[13px] transition-colors cursor-pointer select-none ${
                activePortalTab === 'org-users'
                  ? 'bg-[#3A2312] text-white shadow-inner'
                  : 'text-[#EAD8C7] hover:text-white hover:bg-white/5'
              }`}
            >
              机构用户
            </button>
            <button
              onClick={() => handleTabSelect('org-apps')}
              className={`px-6 py-2.5 font-bold text-xs sm:text-[13px] transition-colors cursor-pointer select-none ${
                activePortalTab === 'org-apps'
                  ? 'bg-[#3A2312] text-white shadow-inner'
                  : 'text-[#EAD8C7] hover:text-white hover:bg-white/5'
              }`}
            >
              机构应用
            </button>
          </div>

          {/* Dropdown Popover Panel: 1:1 with user screenshot */}
          {showAppNavPopover && (
            <>
              {/* Invisible backdrop to dismiss popover when clicking outside */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowAppNavPopover(false)}
              />

              {/* Popover Card floating over the page */}
              <div className="absolute left-6 sm:left-10 lg:left-12 top-full mt-0 w-[calc(100vw-3rem)] sm:w-[calc(100vw-5rem)] lg:w-[calc(100%-6rem)] max-w-[1240px] bg-white text-slate-800 rounded-b-2xl shadow-2xl border-x border-b border-slate-200/90 p-6 sm:p-7 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* 1. Top left action button: 返回工作台 */}
                <div className="flex items-center justify-start pb-5">
                  <button
                    onClick={() => {
                      setShowAppNavPopover(false);
                      handleTabSelect('grid');
                    }}
                    className="flex items-center space-x-2 px-3.5 py-1.5 bg-[#F2F4F7] hover:bg-[#E4E7EC] text-[#344054] hover:text-slate-900 rounded-md font-medium text-xs sm:text-[13px] transition-colors cursor-pointer border border-[#E4E7EC] shadow-2xs"
                  >
                    <Home className="w-3.5 h-3.5 text-[#475467]" />
                    <span>返回工作台</span>
                  </button>
                </div>

                {/* 2. 3-Column Applications Grid (1:1 with user screenshot) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-7 pt-1">
                  {/* Item 1: 指令流转 */}
                  <div
                    onClick={() => {
                      setShowAppNavPopover(false);
                      onNavigate('home');
                    }}
                    className="flex items-center justify-between py-1.5 px-2 hover:bg-slate-50/90 rounded-xl transition-all cursor-pointer group select-none"
                  >
                    <div className="flex items-center space-x-3.5">
                      {/* Teal-cyan badge with '正管' & network branches */}
                      <div className="w-11 h-11 rounded-lg bg-[#E6F4F2] border border-[#B2E2DB] text-[#00897B] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <Radio className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span className="font-bold text-slate-900 text-[15px] group-hover:text-[#1E5ABB] transition-colors">
                        指令流转
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E5ABB] group-hover:translate-x-0.5 transition-all" />
                  </div>

                  {/* Item 2: 河图融媒体 */}
                  <div
                    onClick={() => {
                      setShowAppNavPopover(false);
                      setActiveAppModal('河图融媒体');
                    }}
                    className="flex items-center justify-between py-1.5 px-2 hover:bg-slate-50/90 rounded-xl transition-all cursor-pointer group select-none"
                  >
                    <div className="flex items-center space-x-3.5">
                      {/* Red circular badge with swirl / Globe */}
                      <div className="w-11 h-11 rounded-full bg-[#FEE4E2] border border-[#FECDCA] text-[#D92D20] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <Globe className="w-5 h-5 stroke-[2]" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-[15px] group-hover:text-[#1E5ABB] transition-colors leading-tight">
                          河图融媒体
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-normal tracking-tight">
                          新闻资讯 | 分析方案 | 人员管理
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E5ABB] group-hover:translate-x-0.5 transition-all" />
                  </div>

                  {/* Item 3: 线索排查 */}
                  <div
                    onClick={() => {
                      setShowAppNavPopover(false);
                      onNavigate('negative-info');
                    }}
                    className="flex items-center justify-between py-1.5 px-2 hover:bg-slate-50/90 rounded-xl transition-all cursor-pointer group select-none"
                  >
                    <div className="flex items-center space-x-3.5">
                      {/* Orange/Red circular badge */}
                      <div className="w-11 h-11 rounded-full bg-[#FFECE5] border border-[#FFCCB8] text-[#E04F16] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <Shield className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span className="font-bold text-slate-900 text-[15px] group-hover:text-[#1E5ABB] transition-colors">
                        线索排查
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E5ABB] group-hover:translate-x-0.5 transition-all" />
                  </div>

                  {/* Item 4: 全网搜 */}
                  <div
                    onClick={() => {
                      setShowAppNavPopover(false);
                      setActiveAppModal('全网搜');
                    }}
                    className="flex items-center justify-between py-1.5 px-2 hover:bg-slate-50/90 rounded-xl transition-all cursor-pointer group select-none"
                  >
                    <div className="flex items-center space-x-3.5">
                      {/* Purple circular icon with search */}
                      <div className="w-11 h-11 rounded-full bg-[#F4EBFF] border border-[#E9D7FE] text-[#7F56D9] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <Search className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span className="font-bold text-slate-900 text-[15px] group-hover:text-[#1E5ABB] transition-colors">
                        全网搜
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E5ABB] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 4. Center Main Section */}
      {activePortalTab === 'grid' ? (
        <main className="relative z-10 flex-1 max-w-[1440px] w-full mx-auto px-6 sm:px-12 lg:px-16 flex flex-col justify-center py-6 sm:py-10">
        {/* Center Slogan with Green Hand-Drawn Doodle */}
        <div className="text-center mb-7 sm:mb-8">
          <div className="inline-flex items-center justify-center flex-wrap text-[30px] sm:text-[36px] lg:text-[40px] font-black tracking-wider text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            <span>监测处置全方位，网络生态</span>
            {/* "共守卫" with bright yellow text */}
            <span className="inline-block ml-1 text-[#FFD400]">
              <span>共守卫</span>
            </span>
          </div>
        </div>

        {/* Center Rounded Capsule Search Bar */}
        <div className="max-w-[760px] w-full mx-auto mb-12 sm:mb-14">
          <form
            onSubmit={handleSearchSubmit}
            className="relative bg-white rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.35)] p-2 pl-5 flex items-center transition-all hover:shadow-[0_16px_42px_rgba(0,0,0,0.45)]"
          >
            {/* Globe icon on the left */}
            <Globe className="w-5 h-5 text-[#8C6D55] mr-3 shrink-0 stroke-[2.2]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="请输入关键字进行检索"
              className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 text-sm sm:text-base focus:outline-none"
            />
            {/* Search Button (Warm earthy brown rounded button matching image) */}
            <button
              type="submit"
              className="px-7 py-2.5 bg-[#6D533E] hover:bg-[#5C4533] text-white text-sm font-semibold rounded-full shadow-md transition-all cursor-pointer active:scale-95 ml-2"
            >
              搜索
            </button>
          </form>

          {/* Quick search hints */}
          {searchQuery && (
            <div className="mt-2 text-center text-xs text-white/70">
              按回车或点击「搜索」检索涉网风险舆情及线索
            </div>
          )}
        </div>

        {/* 9 Applications Matrix Grid */}
        <div className="max-w-[1080px] w-full mx-auto">
          {/* Row 1: 6 Applications */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-6 gap-y-8 sm:gap-x-8 mb-8 sm:mb-10 place-items-center">
            {/* 1. 指令流转 (正式版 - Blue) */}
            <div
              onClick={() => handleAppClick('指令流转')}
              className="group flex flex-col items-center cursor-pointer transition-all active:scale-95"
            >
              <div className="relative w-20 h-20 sm:w-[92px] sm:h-[92px] bg-white rounded-[24px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] flex items-center justify-center p-3 group-hover:-translate-y-1.5 transition-transform duration-300">
                {/* Badge: 正式版 */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#1B7EF2] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm leading-none">
                  正式版
                </div>
                {/* Teal/Cyan Node Emblem */}
                <svg viewBox="0 0 36 36" className="w-12 h-12 text-[#1AA6A6]" fill="none">
                  <rect x="4" y="4" width="28" height="28" rx="7" stroke="#1AA6A6" strokeWidth="2.5" />
                  <circle cx="18" cy="10" r="2.5" fill="#1AA6A6" />
                  <circle cx="10" cy="24" r="2.5" fill="#1AA6A6" />
                  <circle cx="26" cy="24" r="2.5" fill="#1AA6A6" />
                  <line x1="18" y1="10" x2="10" y2="24" stroke="#1AA6A6" strokeWidth="2" />
                  <line x1="18" y1="10" x2="26" y2="24" stroke="#1AA6A6" strokeWidth="2" />
                  <line x1="10" y1="24" x2="26" y2="24" stroke="#1AA6A6" strokeWidth="2" />
                  <text x="18" y="20" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1AA6A6">正</text>
                </svg>
              </div>
              <span className="mt-2.5 text-sm sm:text-[15px] font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] group-hover:text-amber-200 transition-colors">
                指令流转
              </span>
            </div>

            {/* 2. 河图融媒体 (正式版 - Blue) */}
            <div
              onClick={() => handleAppClick('河图融媒体')}
              className="group flex flex-col items-center cursor-pointer transition-all active:scale-95"
            >
              <div className="relative w-20 h-20 sm:w-[92px] sm:h-[92px] bg-white rounded-[24px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] flex items-center justify-center p-3 group-hover:-translate-y-1.5 transition-transform duration-300">
                {/* Badge: 正式版 */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#1B7EF2] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm leading-none">
                  正式版
                </div>
                {/* Red RMT Circular Emblem */}
                <svg viewBox="0 0 40 40" className="w-12 h-12 text-[#E53E3E]" fill="none">
                  <circle cx="20" cy="20" r="16" stroke="#E53E3E" strokeWidth="2.5" />
                  <text x="20" y="22" textAnchor="middle" fontSize="9" fontWeight="900" fill="#E53E3E" letterSpacing="0.5">RMT</text>
                  <path d="M12,25 C16,28 24,28 28,25" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="mt-2.5 text-sm sm:text-[15px] font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] group-hover:text-amber-200 transition-colors">
                河图融媒体
              </span>
            </div>

            {/* 3. 线索排查 (正式版 - Blue) */}
            <div
              onClick={() => handleAppClick('线索排查')}
              className="group flex flex-col items-center cursor-pointer transition-all active:scale-95"
            >
              <div className="relative w-20 h-20 sm:w-[92px] sm:h-[92px] bg-white rounded-[24px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] flex items-center justify-center p-3 group-hover:-translate-y-1.5 transition-transform duration-300">
                {/* Badge: 正式版 */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#1B7EF2] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm leading-none">
                  正式版
                </div>
                {/* Red Circular Seal with Raised Fist Symbol */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-xs">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2v-5h2v5z" opacity="0.15" />
                    <path d="M14.5 9c-.83 0-1.5.67-1.5 1.5V11h-1V9.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5V11H8V9c0-.83-.67-1.5-1.5-1.5S5 8.17 5 9v5c0 2.21 1.79 4 4 4h4.5c1.93 0 3.5-1.57 3.5-3.5V10.5c0-.83-.67-1.5-1.5-1.5z" />
                  </svg>
                </div>
              </div>
              <span className="mt-2.5 text-sm sm:text-[15px] font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] group-hover:text-amber-200 transition-colors">
                线索排查
              </span>
            </div>

            {/* 4. 全网搜 (试用版 - Beige) */}
            <div
              onClick={() => handleAppClick('全网搜')}
              className="group flex flex-col items-center cursor-pointer transition-all active:scale-95"
            >
              <div className="relative w-20 h-20 sm:w-[92px] sm:h-[92px] bg-white rounded-[24px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] flex items-center justify-center p-3 group-hover:-translate-y-1.5 transition-transform duration-300">
                {/* Badge: 试用版 */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#C59265] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm leading-none">
                  试用版
                </div>
                {/* Purple Globe with Search Glass */}
                <div className="relative w-12 h-12 flex items-center justify-center text-[#7C3AED]">
                  <Globe className="w-10 h-10 stroke-[2] text-[#7C3AED]" />
                  <Search className="w-5 h-5 stroke-[2.5] text-[#9333EA] absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" />
                </div>
              </div>
              <span className="mt-2.5 text-sm sm:text-[15px] font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] group-hover:text-amber-200 transition-colors">
                全网搜
              </span>
            </div>

            {/* 5. 谛听预警 (已停用 - Red) */}
            <div
              onClick={() => handleAppClick('谛听预警')}
              className="group flex flex-col items-center cursor-pointer transition-all active:scale-95 opacity-90 hover:opacity-100"
            >
              <div className="relative w-20 h-20 sm:w-[92px] sm:h-[92px] bg-white rounded-[24px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] flex items-center justify-center p-3 group-hover:-translate-y-1.5 transition-transform duration-300">
                {/* Badge: 已停用 */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#EB4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm leading-none">
                  已停用
                </div>
                {/* Golden Di Ting creature / listening ear silhouette */}
                <div className="w-12 h-12 flex items-center justify-center text-[#B8860B]">
                  <svg viewBox="0 0 40 40" className="w-11 h-11 fill-[#B8860B]">
                    <path d="M20,6 C13.37,6 8,11.37 8,18 C8,21.5 9.5,24.5 12,26.5 L12,32 L16,30 C17.2,30.3 18.5,30.5 20,30.5 C26.63,30.5 32,25.13 32,18.5 C32,11.87 26.63,6 20,6 Z" opacity="0.15" />
                    <path d="M18,12 C14.7,12 12,14.7 12,18 C12,20.2 13.2,22.1 15,23.1 L15,26 L17.5,24.8 C18.3,25 19.1,25.1 20,25.1 C23.3,25.1 26,22.4 26,19 C26,15.7 23.3,12 18,12 Z" />
                    {/* Sound Waves */}
                    <path d="M28,14 C29.5,15.5 29.5,18.5 28,20" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <path d="M31,12 C33.5,14.5 33.5,20 31,22.5" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" fill="none" />
                  </svg>
                </div>
              </div>
              <span className="mt-2.5 text-sm sm:text-[15px] font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] group-hover:text-amber-200 transition-colors">
                谛听预警
              </span>
            </div>

            {/* 6. 点点密信 (未开通 - Gray) */}
            <div
              onClick={() => handleAppClick('点点密信')}
              className="group flex flex-col items-center cursor-pointer transition-all active:scale-95"
            >
              <div className="relative w-20 h-20 sm:w-[92px] sm:h-[92px] bg-white rounded-[24px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] flex items-center justify-center p-3 group-hover:-translate-y-1.5 transition-transform duration-300">
                {/* Badge: 未开通 */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#8FA1B4] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm leading-none">
                  未开通
                </div>
                {/* Blue "点" Character with micro dots */}
                <div className="flex flex-col items-center justify-center text-[#2563EB]">
                  <span className="text-[26px] font-black leading-none">点</span>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-1 h-1 rounded-full bg-[#2563EB]" />
                    <div className="w-1 h-1 rounded-full bg-[#2563EB]" />
                    <div className="w-1 h-1 rounded-full bg-[#2563EB]" />
                  </div>
                </div>
              </div>
              <span className="mt-2.5 text-sm sm:text-[15px] font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] group-hover:text-amber-200 transition-colors">
                点点密信
              </span>
            </div>
          </div>

          {/* Row 2: 3 Applications (Left-aligned under first 3 items, exactly matching screenshot) */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-6 gap-y-8 sm:gap-x-8 place-items-center">
            {/* 7. 全球眼 (未开通 - Gray) */}
            <div
              onClick={() => handleAppClick('全球眼')}
              className="group flex flex-col items-center cursor-pointer transition-all active:scale-95"
            >
              <div className="relative w-20 h-20 sm:w-[92px] sm:h-[92px] bg-white rounded-[24px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] flex items-center justify-center p-3 group-hover:-translate-y-1.5 transition-transform duration-300">
                {/* Badge: 未开通 */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#8FA1B4] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm leading-none">
                  未开通
                </div>
                {/* Teal swirling eye rings */}
                <div className="w-12 h-12 flex items-center justify-center text-[#0D9488]">
                  <svg viewBox="0 0 36 36" className="w-11 h-11" fill="none">
                    <circle cx="18" cy="18" r="14" stroke="#0D9488" strokeWidth="2" strokeDasharray="4 2" />
                    <circle cx="18" cy="18" r="9" stroke="#14B8A6" strokeWidth="2.5" />
                    <circle cx="18" cy="18" r="4" fill="#0D9488" />
                  </svg>
                </div>
              </div>
              <span className="mt-2.5 text-sm sm:text-[15px] font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] group-hover:text-amber-200 transition-colors">
                全球眼
              </span>
            </div>

            {/* 8. 属地系统 (未开通 - Gray) */}
            <div
              onClick={() => handleAppClick('属地系统')}
              className="group flex flex-col items-center cursor-pointer transition-all active:scale-95"
            >
              <div className="relative w-20 h-20 sm:w-[92px] sm:h-[92px] bg-white rounded-[24px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] flex items-center justify-center p-3 group-hover:-translate-y-1.5 transition-transform duration-300">
                {/* Badge: 未开通 */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#8FA1B4] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm leading-none">
                  未开通
                </div>
                {/* Orange hexagonal 3D shield cube */}
                <div className="w-12 h-12 flex items-center justify-center text-[#EA580C]">
                  <svg viewBox="0 0 36 36" className="w-11 h-11" fill="none">
                    <polygon points="18,4 30,11 30,25 18,32 6,25 6,11" stroke="#EA580C" strokeWidth="2.2" />
                    <line x1="18" y1="18" x2="18" y2="32" stroke="#EA580C" strokeWidth="1.8" />
                    <line x1="18" y1="18" x2="30" y2="11" stroke="#EA580C" strokeWidth="1.8" />
                    <line x1="18" y1="18" x2="6" y2="11" stroke="#EA580C" strokeWidth="1.8" />
                    <circle cx="18" cy="18" r="3" fill="#F97316" />
                  </svg>
                </div>
              </div>
              <span className="mt-2.5 text-sm sm:text-[15px] font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] group-hover:text-amber-200 transition-colors">
                属地系统
              </span>
            </div>

            {/* 9. 数解舆情 (未开通 - Gray) */}
            <div
              onClick={() => handleAppClick('数解舆情')}
              className="group flex flex-col items-center cursor-pointer transition-all active:scale-95"
            >
              <div className="relative w-20 h-20 sm:w-[92px] sm:h-[92px] bg-white rounded-[24px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] flex items-center justify-center p-3 group-hover:-translate-y-1.5 transition-transform duration-300">
                {/* Badge: 未开通 */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#8FA1B4] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm leading-none">
                  未开通
                </div>
                {/* Golden "S" Analytics Ribbon */}
                <div className="w-12 h-12 flex items-center justify-center text-[#CA8A04]">
                  <svg viewBox="0 0 36 36" className="w-11 h-11" fill="none">
                    <path
                      d="M26,10 C26,7 23,6 18,6 C13,6 10,8 10,12 C10,18 26,18 26,24 C26,28 23,30 18,30 C12,30 10,28 10,25"
                      stroke="#CA8A04"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <circle cx="26" cy="10" r="2.5" fill="#EAB308" />
                    <circle cx="10" cy="25" r="2.5" fill="#EAB308" />
                  </svg>
                </div>
              </div>
              <span className="mt-2.5 text-sm sm:text-[15px] font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] group-hover:text-amber-200 transition-colors">
                数解舆情
              </span>
            </div>

            {/* 10. 点点速豹 (正式版 - Orange/Amber) */}
            <div
              onClick={() => handleAppClick('点点速豹')}
              className="group flex flex-col items-center cursor-pointer transition-all active:scale-95"
            >
              <div className="relative w-20 h-20 sm:w-[92px] sm:h-[92px] bg-white rounded-[24px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] flex items-center justify-center p-3 group-hover:-translate-y-1.5 transition-transform duration-300 ring-2 ring-amber-400/50">
                {/* Badge: 正式版 */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#EA580C] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm leading-none">
                  正式版
                </div>
                {/* Cheetah / Speed Leopard Vector Emblem */}
                <div className="w-12 h-12 flex items-center justify-center text-[#EA580C]">
                  <svg viewBox="0 0 36 36" className="w-11 h-11" fill="none">
                    <path
                      d="M6,22 C9,17 14,14 20,14 C22.5,14 25,15 27,16.5 L31,13 L29,19 C31,21 32,23.5 32,26 C32,27 31,28 30,28 C26,28 23,24 20,24 C16,24 12,27 8,27 C6.5,27 6,25 6,22 Z"
                      fill="#EA580C"
                      opacity="0.2"
                    />
                    <path
                      d="M7,20 C10,15 15,13 21,13 C24,13 27,14.5 29,16.5 L32,13 L30.5,19 C32,21 32.5,23 32,25 C31,26.5 29,26.5 27.5,25.5 C24.5,23.5 21.5,23 18.5,23 C14.5,23 11,26 7.5,26 C6,26 5.5,24 7,20 Z"
                      stroke="#EA580C"
                      strokeWidth="2.2"
                      strokeLinejoin="round"
                    />
                    <circle cx="28" cy="18" r="1.8" fill="#EA580C" />
                    <path
                      d="M13,7 L7,15 L14,15 L10,22"
                      stroke="#D97706"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <span className="mt-2.5 text-sm sm:text-[15px] font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] group-hover:text-amber-200 transition-colors">
                点点速豹
              </span>
            </div>
          </div>
        </div>
      </main>
      ) : activePortalTab === 'profile' ? (
        <main className="relative z-10 flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-[#E9E4DE] p-6 sm:p-10 text-slate-800 animate-in fade-in duration-200">
            {/* 1:1 Title matching photo */}
            <div className="text-[16px] font-bold text-slate-800 mb-6 tracking-wide">
              基本信息
            </div>

            {/* 1:1 Golden Gradient Banner matching photo */}
            <div className="rounded-xl p-6 sm:p-8 bg-gradient-to-r from-[#FDE8B5] via-[#FCE3A1] to-[#FCEECB] border border-[#F4D994] relative overflow-hidden shadow-2xs flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Circular Avatar matching sunset photo */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0">
                <img src={sunsetBg} alt="User Avatar" className="w-full h-full object-cover" />
              </div>

              {/* Text info inside banner */}
              <div className="flex flex-col space-y-2.5">
                {/* User Name + Edit icon button */}
                <div className="flex items-center space-x-2">
                  <span className="text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-wide">
                    {userName}
                  </span>
                  <button
                    onClick={() => {
                      setEditFieldModal('name');
                      setEditInputValue(userName);
                    }}
                    className="text-[#5D3D22]/80 hover:text-[#5D3D22] transition-colors cursor-pointer p-0.5"
                    title="修改个人昵称"
                  >
                    <SquarePen className="w-4 h-4" />
                  </button>
                </div>

                {/* Phone & WeChat info row with icons and divider */}
                <div className="flex items-center space-x-4 text-[13px] text-[#4E341E] flex-wrap gap-y-2">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-4 h-4 rounded bg-[#4E341E] text-white flex items-center justify-center shrink-0">
                      <Phone className="w-2.5 h-2.5 fill-white" />
                    </div>
                    <span>联系电话：{userPhone}</span>
                    <button
                      onClick={() => {
                        setEditFieldModal('phone');
                        setEditInputValue(userPhone);
                      }}
                      className="text-[#4E341E]/70 hover:text-[#4E341E] transition-colors cursor-pointer ml-0.5 p-0.5"
                      title="修改联系电话"
                    >
                      <SquarePen className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[#8C6D55]/60">|</span>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-4 h-4 rounded bg-[#4E341E] text-white flex items-center justify-center shrink-0">
                      <MessageSquare className="w-2.5 h-2.5 fill-white" />
                    </div>
                    <span>微信昵称：{userWechat}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 1:1 Info Details Grid (2 rows x 3 columns matching photo) */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12">
              {/* Row 1 Col 1: 机构名称 */}
              <div>
                <div className="flex items-center space-x-2 text-[13px] text-[#5D3D22] font-medium">
                  <Building2 className="w-4 h-4 text-[#5D3D22]" />
                  <span>机构名称</span>
                </div>
                <div className="mt-2 text-[14px] font-bold text-slate-900">
                  {currentOrg}
                </div>
              </div>

              {/* Row 1 Col 2: 机构简称 */}
              <div>
                <div className="flex items-center space-x-2 text-[13px] text-[#5D3D22] font-medium">
                  <CreditCard className="w-4 h-4 text-[#5D3D22]" />
                  <span>机构简称</span>
                </div>
                <div className="mt-2 text-[14px] font-bold text-slate-900">
                  {currentOrg}
                </div>
              </div>

              {/* Row 1 Col 3: 机构类型 */}
              <div>
                <div className="flex items-center space-x-2 text-[13px] text-[#5D3D22] font-medium">
                  <Shield className="w-4 h-4 text-[#5D3D22]" />
                  <span>机构类型</span>
                </div>
                <div className="mt-2 text-[14px] font-bold text-slate-900">
                  网安部门
                </div>
              </div>

              {/* Row 2 Col 1: 所属地区 */}
              <div>
                <div className="flex items-center space-x-2 text-[13px] text-[#5D3D22] font-medium">
                  <BookOpen className="w-4 h-4 text-[#5D3D22]" />
                  <span>所属地区</span>
                </div>
                <div className="mt-2 text-[14px] font-bold text-slate-900">
                  陕西
                </div>
              </div>

              {/* Row 2 Col 2: 详细地址 */}
              <div>
                <div className="flex items-center space-x-2 text-[13px] text-[#5D3D22] font-medium">
                  <MapPin className="w-4 h-4 text-[#5D3D22]" />
                  <span>详细地址</span>
                </div>
                <div className="mt-2 text-[14px] font-bold text-slate-900 min-h-[20px]">
                  &nbsp;
                </div>
              </div>

              {/* Row 2 Col 3: Empty space matching photo */}
              <div />
            </div>

            {/* Bottom Copyright Text (1:1 with photo) */}
            <div className="mt-24 pt-6 text-center text-[12px] text-slate-400">
              © 2013–2026 康奈网络. 保留所有权利
            </div>
          </div>
        </main>
      ) : activePortalTab === 'notifications' ? (
        <main className="relative z-10 flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-[#E9E4DE] p-6 sm:p-8 text-slate-800 animate-in fade-in duration-200">
            {/* Table Header & Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <h2 className="text-[16px] font-bold text-slate-900 tracking-wide">
                  消息通知中心
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-[#5D3D22] border border-amber-200">
                  共 {notifications.length} 条
                </span>
                {notifications.some((n) => !n.isRead) && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                    {notifications.filter((n) => !n.isRead).length} 条未读
                  </span>
                )}
              </div>

              {/* Toolbar Action Icons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMarkAllRead}
                  className="px-3 py-1.5 bg-[#5D3D22] hover:bg-[#4E341E] text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="标记全部通知为已读"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>全部标为已读</span>
                </button>
                <button
                  onClick={() => {
                    setNotifications([...notifications]);
                    setSwitchToast('已刷新通知列表');
                    setTimeout(() => setSwitchToast(null), 2000);
                  }}
                  className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer"
                  title="刷新"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSwitchToast('通知清单导出就绪');
                    setTimeout(() => setSwitchToast(null), 2000);
                  }}
                  className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer"
                  title="导出列表"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer"
                  title="自定义表格列"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <div className="relative w-64 sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={notifSearch}
                    onChange={(e) => setNotifSearch(e.target.value)}
                    placeholder="检索通知标题 / 来源机构..."
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#5D3D22] bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
                {['全部', '特急处置', '预警督办', '机构动态', '系统维护'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNotifCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                      notifCategoryFilter === cat
                        ? 'bg-[#5D3D22] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg mt-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold">
                    <th className="py-3 px-3 w-10 text-center">
                      <input type="checkbox" className="rounded border-slate-300 text-[#5D3D22]" />
                    </th>
                    <th className="py-3 px-3 w-12 text-center">序号</th>
                    <th className="py-3 px-4 min-w-[280px]">通知标题</th>
                    <th className="py-3 px-3 w-28">分类</th>
                    <th className="py-3 px-3 w-32">来源机构</th>
                    <th className="py-3 px-3 w-36">接收时间</th>
                    <th className="py-3 px-3 w-20 text-center">状态</th>
                    <th className="py-3 px-4 w-32 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notifications
                    .filter((n) => {
                      if (notifCategoryFilter !== '全部' && n.category !== notifCategoryFilter) return false;
                      if (notifStatusFilter === '未读' && n.isRead) return false;
                      if (notifStatusFilter === '已读' && !n.isRead) return false;
                      if (
                        notifSearch &&
                        !n.title.toLowerCase().includes(notifSearch.toLowerCase()) &&
                        !n.sourceOrg.toLowerCase().includes(notifSearch.toLowerCase())
                      ) {
                        return false;
                      }
                      return true;
                    })
                    .map((notif, index) => (
                      <tr
                        key={notif.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          !notif.isRead ? 'bg-amber-50/20 font-medium' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center">
                          <input type="checkbox" className="rounded border-slate-300 text-[#5D3D22]" />
                        </td>
                        <td className="py-3 px-3 text-center text-slate-400 font-mono">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                            )}
                            <button
                              onClick={() => setSelectedNotifDetail(notif)}
                              className="text-slate-800 hover:text-[#5D3D22] text-left hover:underline line-clamp-1 cursor-pointer"
                            >
                              {notif.title}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              notif.category === '特急处置'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : notif.category === '预警督办'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : notif.category === '机构动态'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {notif.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-medium">{notif.sourceOrg}</td>
                        <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                          {notif.time}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              notif.isRead
                                ? 'bg-slate-100 text-slate-500'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {notif.isRead ? '已读' : '未读'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => setSelectedNotifDetail(notif)}
                              className="text-[#5D3D22] hover:underline font-bold cursor-pointer"
                            >
                              详情
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              onClick={() => handleToggleRead(notif.id)}
                              className="text-slate-500 hover:text-slate-800 cursor-pointer"
                            >
                              {notif.isRead ? '标为未读' : '标为已读'}
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              onClick={() => handleDeleteNotif(notif.id)}
                              className="text-rose-500 hover:text-rose-700 cursor-pointer"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Pagination & Footer */}
            <div className="flex items-center justify-between pt-4 text-xs text-slate-500">
              <div>显示第 1 至 {notifications.length} 项，共 {notifications.length} 条记录</div>
              <div className="flex items-center space-x-1">
                <button className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer disabled:opacity-40" disabled>
                  上一页
                </button>
                <button className="px-2.5 py-1 bg-[#5D3D22] text-white rounded font-bold">1</button>
                <button className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer disabled:opacity-40" disabled>
                  下一页
                </button>
              </div>
            </div>

            {/* Bottom Copyright Text */}
            <div className="mt-16 pt-6 text-center text-[12px] text-slate-400">
              © 2013–2026 康奈网络. 保留所有权利
            </div>
          </div>
        </main>
      ) : activePortalTab === 'org-users' ? (
        <main className="relative z-10 flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-[#E9E4DE] p-6 sm:p-8 text-slate-800 animate-in fade-in duration-200">
            {/* Table Header & Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <h2 className="text-[16px] font-bold text-slate-900 tracking-wide">
                  机构用户管理
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-[#5D3D22] border border-amber-200">
                  当前机构：{currentOrg}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                  在册成员 {orgUsers.length} 人
                </span>
              </div>

              {/* Toolbar Action Icons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-3.5 py-1.5 bg-[#5D3D22] hover:bg-[#4E341E] text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>添加用户</span>
                </button>
                <button
                  onClick={() => {
                    setSwitchToast('支持导入政务微信/统一身份认证通讯录');
                    setTimeout(() => setSwitchToast(null), 2500);
                  }}
                  className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer"
                  title="批量导入通讯录"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSwitchToast('用户权限花名册已导出');
                    setTimeout(() => setSwitchToast(null), 2000);
                  }}
                  className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer"
                  title="导出用户列表"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setOrgUsers([...orgUsers]);
                    setSwitchToast('已同步最新机构鉴权状态');
                    setTimeout(() => setSwitchToast(null), 2000);
                  }}
                  className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer"
                  title="刷新"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer"
                  title="批量分配权限"
                >
                  <KeyRound className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="relative w-64 sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="检索姓名 / 手机 / 科室 / 角色..."
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#5D3D22] bg-slate-50/50"
                />
              </div>

              {/* Role filter */}
              <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
                {['全部', '平台超级管理员', '终审签发员', '舆情速报员', '跨机构协查专员'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setUserRoleFilter(role)}
                    className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                      userRoleFilter === role
                        ? 'bg-[#5D3D22] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg mt-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold">
                    <th className="py-3 px-3 w-10 text-center">
                      <input type="checkbox" className="rounded border-slate-300 text-[#5D3D22]" />
                    </th>
                    <th className="py-3 px-3 w-12 text-center">序号</th>
                    <th className="py-3 px-4 min-w-[160px]">用户姓名</th>
                    <th className="py-3 px-3 w-32">登录手机 / 账号</th>
                    <th className="py-3 px-4 min-w-[180px]">所属科室</th>
                    <th className="py-3 px-3 w-32">系统角色</th>
                    <th className="py-3 px-3 w-32">鉴权认证</th>
                    <th className="py-3 px-3 w-20 text-center">状态</th>
                    <th className="py-3 px-3 w-32">最近登录</th>
                    <th className="py-3 px-4 w-36 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orgUsers
                    .filter((u) => {
                      if (userRoleFilter !== '全部' && u.role !== userRoleFilter) return false;
                      if (userStatusFilter !== '全部' && u.status !== userStatusFilter) return false;
                      if (
                        userSearch &&
                        !u.name.toLowerCase().includes(userSearch.toLowerCase()) &&
                        !u.phone.includes(userSearch) &&
                        !u.dept.toLowerCase().includes(userSearch.toLowerCase()) &&
                        !u.role.toLowerCase().includes(userSearch.toLowerCase())
                      ) {
                        return false;
                      }
                      return true;
                    })
                    .map((user, index) => (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center">
                          <input type="checkbox" className="rounded border-slate-300 text-[#5D3D22]" />
                        </td>
                        <td className="py-3 px-3 text-center text-slate-400 font-mono">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#5D3D22]/15 text-[#5D3D22] font-bold flex items-center justify-center shrink-0 text-xs">
                              {user.name.slice(0, 1)}
                            </div>
                            <span className="font-bold text-slate-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-mono">{user.phone}</td>
                        <td className="py-3 px-4 text-slate-700">{user.dept}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px]">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 flex items-center space-x-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{user.authLevel}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleToggleUserStatus(user.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              user.status === '正常'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {user.status}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                          {user.lastLogin}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => {
                                setSwitchToast(`已打开用户「${user.name}」权限面板`);
                                setTimeout(() => setSwitchToast(null), 2000);
                              }}
                              className="text-[#5D3D22] hover:underline font-bold cursor-pointer"
                            >
                              权限
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              onClick={() => {
                                setSwitchToast(`已向「${user.name}」重置并下发临时密码`);
                                setTimeout(() => setSwitchToast(null), 2500);
                              }}
                              className="text-slate-500 hover:text-slate-800 cursor-pointer"
                            >
                              重置
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              className={user.status === '正常' ? 'text-amber-600 hover:text-amber-800' : 'text-emerald-600 hover:text-emerald-800'}
                            >
                              {user.status === '正常' ? '停用' : '启用'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Pagination & Footer */}
            <div className="flex items-center justify-between pt-4 text-xs text-slate-500">
              <div>显示第 1 至 {orgUsers.length} 项，共 {orgUsers.length} 位在册用户</div>
              <div className="flex items-center space-x-1">
                <button className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer disabled:opacity-40" disabled>
                  上一页
                </button>
                <button className="px-2.5 py-1 bg-[#5D3D22] text-white rounded font-bold">1</button>
                <button className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer disabled:opacity-40" disabled>
                  下一页
                </button>
              </div>
            </div>

            {/* Bottom Copyright Text */}
            <div className="mt-16 pt-6 text-center text-[12px] text-slate-400">
              © 2013–2026 康奈网络. 保留所有权利
            </div>
          </div>
        </main>
      ) : (
        /* activePortalTab === 'org-apps' */
        <main className="relative z-10 flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-[#E9E4DE] p-6 sm:p-8 text-slate-800 animate-in fade-in duration-200">
            {/* Table Header & Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <h2 className="text-[16px] font-bold text-slate-900 tracking-wide">
                  机构应用矩阵与授权清单
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-[#5D3D22] border border-amber-200">
                  已部署 {orgApps.length} 款治理系统
                </span>
              </div>

              {/* Toolbar Action Icons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSwitchToast('请联系网信上级或平台管理员提交新应用接入申请');
                    setTimeout(() => setSwitchToast(null), 3000);
                  }}
                  className="px-3.5 py-1.5 bg-[#5D3D22] hover:bg-[#4E341E] text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>接入新应用</span>
                </button>
                <button
                  onClick={() => {
                    setSwitchToast('已同步全量应用接口与CA网关健康度');
                    setTimeout(() => setSwitchToast(null), 2000);
                  }}
                  className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer"
                  title="同步应用状态"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSwitchToast('应用矩阵授权清单已导出');
                    setTimeout(() => setSwitchToast(null), 2000);
                  }}
                  className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer"
                  title="导出清单"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer"
                  title="权限拓扑"
                >
                  <Layers className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="relative w-64 sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  placeholder="检索应用名称 / 代码 / 授权科室..."
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#5D3D22] bg-slate-50/50"
                />
              </div>

              {/* Version filter */}
              <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
                {['全部', '正式版', '试用版', '已停用', '未开通'].map((badge) => (
                  <button
                    key={badge}
                    onClick={() => setAppBadgeFilter(badge)}
                    className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                      appBadgeFilter === badge
                        ? 'bg-[#5D3D22] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {badge}
                  </button>
                ))}
              </div>
            </div>

            {/* Apps Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg mt-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold">
                    <th className="py-3 px-3 w-12 text-center">序号</th>
                    <th className="py-3 px-4 min-w-[200px]">应用系统名称</th>
                    <th className="py-3 px-3 w-28">系统标识代码</th>
                    <th className="py-3 px-3 w-24">版本</th>
                    <th className="py-3 px-4 min-w-[240px]">授权使用科室</th>
                    <th className="py-3 px-3 w-24 text-center">授权人数</th>
                    <th className="py-3 px-3 w-32 text-center">运行状态</th>
                    <th className="py-3 px-4 w-36 text-center">快捷操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orgApps
                    .filter((a) => {
                      if (appBadgeFilter !== '全部' && a.badge !== appBadgeFilter) return false;
                      if (
                        appSearch &&
                        !a.name.toLowerCase().includes(appSearch.toLowerCase()) &&
                        !a.code.toLowerCase().includes(appSearch.toLowerCase()) &&
                        !a.authorizedDepts.toLowerCase().includes(appSearch.toLowerCase())
                      ) {
                        return false;
                      }
                      return true;
                    })
                    .map((app, index) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 text-center text-slate-400 font-mono">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center font-bold text-[#5D3D22] text-sm shrink-0">
                              {app.name.slice(0, 1)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                                <span>{app.name}</span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold text-white ${app.badgeColor}`}
                                >
                                  {app.badge}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                {app.desc}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-600">{app.code}</td>
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-700">{app.version}</td>
                        <td className="py-3.5 px-4 text-slate-600">{app.authorizedDepts}</td>
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800">
                          {app.authUsersCount} 人
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              app.runStatus === '运行正常'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : app.runStatus.includes('试用中')
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : app.runStatus === '暂停维护'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {app.runStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleAppLaunch(app.name)}
                              className="px-2.5 py-1 bg-[#5D3D22] hover:bg-[#4E341E] text-white rounded font-bold text-[11px] transition-colors cursor-pointer shadow-2xs"
                            >
                              进入系统
                            </button>
                            <button
                              onClick={() => {
                                setSwitchToast(`已打开「${app.name}」授权矩阵设置`);
                                setTimeout(() => setSwitchToast(null), 2000);
                              }}
                              className="text-slate-500 hover:text-slate-800 font-medium text-[11px] cursor-pointer"
                            >
                              配置
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Pagination & Footer */}
            <div className="flex items-center justify-between pt-4 text-xs text-slate-500">
              <div>显示第 1 至 {orgApps.length} 项，共 {orgApps.length} 款业务应用</div>
              <div className="flex items-center space-x-1">
                <button className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer disabled:opacity-40" disabled>
                  上一页
                </button>
                <button className="px-2.5 py-1 bg-[#5D3D22] text-white rounded font-bold">1</button>
                <button className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer disabled:opacity-40" disabled>
                  下一页
                </button>
              </div>
            </div>

            {/* Bottom Copyright Text */}
            <div className="mt-16 pt-6 text-center text-[12px] text-slate-400">
              © 2013–2026 康奈网络. 保留所有权利
            </div>
          </div>
        </main>
      )}

      {/* 5. Bottom Right Floating Settings Button (1:1 with photo) */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-30">
        <button
          onClick={() => setShowSettingsModal(true)}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/60 border border-white/40 backdrop-blur-md flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          title="系统与工作台设置"
        >
          <Settings className="w-5 h-5 text-white/90" />
        </button>
      </div>

      {/* MODAL 1: 全网全局检索结果浮层 */}
      {showSearchResults && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 text-slate-800">
            <div className="px-6 py-4 bg-gradient-to-r from-[#6D533E] to-[#8C6D55] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <h3 className="font-bold text-base">全网生态综合治理检索结果</h3>
              </div>
              <button
                onClick={() => setShowSearchResults(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
              <div className="text-xs text-slate-500 mb-2">
                包含关键字 “<span className="text-[#6D533E] font-bold">{searchQuery}</span>” 的相关舆情与指令 ({filteredReports.length} 条记录)
              </div>

              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => {
                      setShowSearchResults(false);
                      onSelectReport(report);
                      onNavigate('report-detail');
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-[#6D533E] hover:bg-amber-50/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                          {report.auditStatus}
                        </span>
                        <span className="font-bold text-sm text-slate-900 group-hover:text-[#6D533E]">
                          {report.title}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{report.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{report.summary}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>来源：{report.source}</span>
                      <span className="text-[#6D533E] font-medium flex items-center space-x-0.5">
                        <span>点击查看处置详情</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <Globe className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p>未在本地检索到匹配记录，可进入「指令流转」工作台进行全量深度检索</p>
                  <button
                    onClick={() => {
                      setShowSearchResults(false);
                      onNavigate('report-records');
                    }}
                    className="mt-3 px-4 py-1.5 bg-[#6D533E] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    进入全量档案检索
                  </button>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowSearchResults(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: 系统工作日程与日历 */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 text-slate-800">
            <div className="px-6 py-4 bg-[#1E5ABB] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5" />
                <h3 className="font-bold text-sm">网信值班日历与处置排期</h3>
              </div>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-blue-900">今日值班排班：2026年9月4日 星期五</div>
                  <div className="text-[11px] text-blue-700 mt-0.5">当班负责人：张三 (超级管理员) · 7x24应急保障</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">在岗</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex justify-between">
                  <span className="text-slate-600">09:00 - 10:30 全网早报研判巡查</span>
                  <span className="text-emerald-600 font-medium">已完成</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex justify-between">
                  <span className="text-slate-600">14:00 - 16:00 负面舆情督办指令抽查</span>
                  <span className="text-blue-600 font-medium">进行中</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex justify-between">
                  <span className="text-slate-600">18:00 - 19:30 重点线索综合日总结汇总</span>
                  <span className="text-slate-400">待开始</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowCalendarModal(false)}
                className="px-4 py-1.5 bg-[#1E5ABB] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: 通知中心 */}
      {showNotifModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 text-slate-800">
            <div className="px-6 py-4 bg-[#1E5ABB] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <h3 className="font-bold text-sm">系统通知与预警消息</h3>
              </div>
              <button
                onClick={() => setShowNotifModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-2.5 max-h-[60vh] overflow-y-auto">
              <div
                onClick={() => {
                  setShowNotifModal(false);
                  onNavigate('report-audit');
                }}
                className="p-3 bg-rose-50 border border-rose-100 rounded-xl cursor-pointer hover:bg-rose-100/70 transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-bold text-rose-800 mb-1">
                  <span>待审核指令提醒 (3条待处理)</span>
                  <span className="text-[10px] text-rose-500">刚刚</span>
                </div>
                <p className="text-[11px] text-rose-700">市应急管理局与市水利局提交了2篇涉汛应急速报，请及时完成二审与终审核定。</p>
              </div>

              <div
                onClick={() => {
                  setShowNotifModal(false);
                  onNavigate('negative-info');
                }}
                className="p-3 bg-amber-50 border border-amber-100 rounded-xl cursor-pointer hover:bg-amber-100/70 transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-bold text-amber-800 mb-1">
                  <span>线索转办督办进展更新</span>
                  <span className="text-[10px] text-amber-600">14:20</span>
                </div>
                <p className="text-[11px] text-amber-700">有关“某区自来水异味”舆情已由责任部门办结，请查阅处置反馈。</p>
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400">共 2 条未读预警</span>
              <button
                onClick={() => setShowNotifModal(false)}
                className="px-4 py-1.5 bg-[#1E5ABB] text-white font-bold rounded-lg cursor-pointer"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}



      {/* MODAL 5: 业务应用状态/详情卡片 */}
      {activeAppModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 text-slate-800">
            <div className="px-6 py-4 bg-gradient-to-r from-[#1B3E6E] to-[#2B548B] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">{activeAppModal} · 业务模块说明</h3>
              </div>
              <button
                onClick={() => setActiveAppModal(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {activeAppModal === '河图融媒体' && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                    <strong>河图融媒体 (正式版)</strong>：面向全网多渠道融媒体矩阵，汇聚发布监测、正向宣传与舆论引导发布，与点点速豹舆情闭环全互通。
                  </div>
                  <button
                    onClick={() => {
                      setActiveAppModal(null);
                      onNavigate('statistics');
                    }}
                    className="w-full py-2.5 bg-[#1B7EF2] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    进入融媒体数据宏观总览
                  </button>
                </div>
              )}

              {activeAppModal === '全网搜' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-900 leading-relaxed">
                    <strong>全网搜 (试用版)</strong>：跨主流社交媒体、资讯门户与音视频平台的毫秒级全文检索与热度趋势溯源能力。
                  </div>
                  <button
                    onClick={() => {
                      setActiveAppModal(null);
                      setShowSearchResults(true);
                      setSearchQuery('热点');
                    }}
                    className="w-full py-2.5 bg-[#C59265] hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    启动跨平台热点试搜
                  </button>
                </div>
              )}

              {activeAppModal === '谛听预警' && (
                <div className="space-y-3">
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-900 leading-relaxed">
                    <strong>谛听预警 (已停用)</strong>：由于系统正在进行数据源通道升级与合规升级，该预警节点暂处停用状态，预计下周完成维护。
                  </div>
                  <div className="text-xs text-slate-500">如需紧急开通通道，请联系系统管理员或致电客服 4000-999-363。</div>
                </div>
              )}

              {['点点密信', '全球眼', '属地系统', '数解舆情'].includes(activeAppModal) && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
                    <strong>{activeAppModal} (未开通)</strong>：当前单位（台中市网信办）尚未开通该扩展组件的授权许可。
                  </div>
                  <div className="text-xs text-slate-500">可联系产品运营代表或通过管理员申请开通试用。</div>
                </div>
              )}
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setActiveAppModal(null)}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: 工作台与个性化设置 */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 text-slate-800">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-white" />
                <h3 className="font-bold text-sm">工作台个性化设置</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <div className="font-bold text-slate-800">安全防泄露水印</div>
                  <div className="text-slate-400 text-[11px]">按网信合规标准全天候浮现身份与时间印记</div>
                </div>
                <input type="checkbox" defaultChecked disabled className="rounded text-blue-600" />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <div className="font-bold text-slate-800">快捷进入速报工作台</div>
                  <div className="text-slate-400 text-[11px]">一键直达“点点速豹·指令流转”多级审核流</div>
                </div>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    onNavigate('home');
                  }}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md cursor-pointer"
                >
                  立即进入
                </button>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-bold text-slate-800">返回登录首页</div>
                  <div className="text-slate-400 text-[11px]">返回微信扫码登录封面页</div>
                </div>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    onNavigate('login');
                  }}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-md cursor-pointer"
                >
                  退出到登录页
                </button>
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: 修改个人信息 (昵称 / 手机) */}
      {editFieldModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 text-slate-800">
            <div className="px-5 py-4 bg-[#5D3D22] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editFieldModal === 'name' ? '修改个人昵称' : '修改联系电话'}
              </h3>
              <button
                onClick={() => setEditFieldModal(null)}
                className="p-1 rounded hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1.5">
                  {editFieldModal === 'name' ? '用户昵称' : '联系手机'}
                </label>
                <input
                  type="text"
                  value={editInputValue}
                  onChange={(e) => setEditInputValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#5D3D22] bg-slate-50"
                  placeholder={editFieldModal === 'name' ? '请输入个人昵称' : '请输入11位手机号码'}
                />
              </div>
            </div>
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => setEditFieldModal(null)}
                className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSaveProfileEdit}
                className="px-4 py-1.5 bg-[#5D3D22] hover:bg-[#4E341E] text-white text-xs font-bold rounded-lg cursor-pointer shadow-2xs"
              >
                保存变更
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: 消息通知详情 */}
      {selectedNotifDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 text-slate-800">
            <div className="px-6 py-4 bg-[#5D3D22] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <h3 className="font-bold text-sm">通知详情</h3>
              </div>
              <button
                onClick={() => setSelectedNotifDetail(null)}
                className="p-1 rounded hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedNotifDetail.title}
                </h4>
                <div className="flex items-center space-x-3 mt-2 text-slate-500 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-[#5D3D22] font-bold border border-amber-200">
                    {selectedNotifDetail.category}
                  </span>
                  <span>来源：{selectedNotifDetail.sourceOrg}</span>
                  <span className="font-mono">{selectedNotifDetail.time}</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed text-sm">
                {selectedNotifDetail.content}
              </div>
            </div>
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">网络生态综合治理平台 · 安全督办流</span>
              <button
                onClick={() => setSelectedNotifDetail(null)}
                className="px-4 py-1.5 bg-[#5D3D22] hover:bg-[#4E341E] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: 添加机构用户 */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 text-slate-800">
            <div className="px-6 py-4 bg-[#5D3D22] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <h3 className="font-bold text-sm">新增机构在册人员</h3>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1 rounded hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddUserSubmit}>
              <div className="p-6 space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">姓名 *</label>
                  <input
                    type="text"
                    required
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    placeholder="请输入真实姓名"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#5D3D22]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">手机号码 *</label>
                  <input
                    type="text"
                    required
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    placeholder="请输入11位手机号"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#5D3D22]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">所属科室 *</label>
                  <input
                    type="text"
                    required
                    value={newUserData.dept}
                    onChange={(e) => setNewUserData({ ...newUserData, dept: e.target.value })}
                    placeholder="如：台中市网信办·综合科"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#5D3D22]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">系统角色 *</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#5D3D22] bg-white"
                  >
                    <option value="舆情速报员">舆情速报员</option>
                    <option value="跨机构协查专员">跨机构协查专员</option>
                    <option value="终审签发员">终审签发员</option>
                    <option value="平台超级管理员">平台超级管理员</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#5D3D22] hover:bg-[#4E341E] text-white text-xs font-bold rounded-lg cursor-pointer shadow-2xs"
                >
                  确认添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Switch Toast Notification */}
      {switchToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{switchToast}</span>
        </div>
      )}
    </div>
  );
};
