import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Edit3,
  Trash2,
  Building2,
  UserCheck,
  Phone,
  Clock,
  Users,
  CheckSquare,
  Square,
  QrCode,
  Share2,
  Copy,
  Check,
  ExternalLink,
  X,
  ChevronsUpDown,
  ChevronsDownUp,
  Award,
  Calendar,
  ShieldAlert,
  Building,
  ShieldCheck,
  Folder,
  KeyRound,
  Eye,
  IdCard,
  MapPin,
  Activity,
  GitBranch,
  CheckCircle2,
  Lock,
  Sparkles,
  Download
} from 'lucide-react';
import type { PageId } from '../types';

export interface CategoryItem {
  id: string;
  name: string;
}

export interface OrgNode {
  id: string;
  categoryId: string;
  parentId?: string | null; // null for first-level org
  name: string;
  code?: string;
  leaderName?: string;
  leaderPhone?: string;
  leaderPersonId?: number;
  leaderPersonIds?: number[];
  systemVersion?: string;
  expireDate?: string;
  sortOrder: number;
  allowSubOrgCreation: boolean;
}

export interface PersonnelItem {
  id: number;
  orgIds: string[]; // Multiple org nodes
  primaryOrgId?: string;
  username: string;
  realName: string;
  wechat: string;
  phone: string;
  roles: string[]; // Multiple roles supported per account
  registerDate: string;
  status: '启用' | '禁用';
  isLeader?: boolean; // 是否节点负责人
  labels?: string[];
  activationFields?: {
    idCardNo?: string;
    bankCardNo?: string;
    bankName?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
  };
}

interface OrgManagementProps {
  onNavigate?: (page: PageId, extraModule?: string) => void;
  orgList?: unknown;
  onAddOrg?: unknown;
  onUpdateOrg?: unknown;
  onDeleteOrg?: unknown;
}

type OrgAuditFlowStatus = 'configured' | 'inherited' | 'default';
type NodeAuditSetting = 'enabled' | 'disabled';
type NodeAuditDisplayStatus = NodeAuditSetting | 'inherited';
type FlowTreePreviewNode = {
  id: string;
  title: string;
  description: string;
  isRoot?: boolean;
  children: FlowTreePreviewNode[];
};

const PERSONNEL_LABEL_OPTIONS: Array<{
  name: string;
  group: '上报员' | '审核员';
}> = [
  { name: '骨干上报员', group: '上报员' },
  { name: '普通上报员', group: '上报员' },
  { name: '核心上报员', group: '上报员' },
  { name: '一级审核员', group: '审核员' },
  { name: '二级审核员', group: '审核员' },
  { name: '三级审核员', group: '审核员' },
];

const getPersonnelLabelOptionsByRoles = (roles: string[] = []) =>
  PERSONNEL_LABEL_OPTIONS.filter((option) => roles.includes(option.group));

const getPersonnelDisplayLabels = (person: PersonnelItem) => {
  const allowedNames = new Set(getPersonnelLabelOptionsByRoles(person.roles).map((option) => option.name));
  return (person.labels || []).filter((label) => allowedNames.has(label));
};

export const OrgManagement: React.FC<OrgManagementProps> = ({ onNavigate }) => {
  // Categories State
  const [categories, setCategories] = useState<CategoryItem[]>([
    { id: 'cat-1', name: '市级党政机关' },
    { id: 'cat-2', name: '区县级单位' },
    { id: 'cat-3', name: '市属新闻媒体' },
    { id: 'cat-4', name: '企事业单位' },
  ]);

  // Org Nodes State (Multi-level)
  const [orgNodes, setOrgNodes] = useState<OrgNode[]>([
    // First level orgs under cat-1
    {
      id: 'org-1',
      categoryId: 'cat-1',
      parentId: null,
      name: '中共台中市委宣传部',
      code: 'XCB-340100',
      leaderName: '陈建国',
      leaderPhone: '13812345678',
      systemVersion: '正式版',
      expireDate: '2026-12-31',
      sortOrder: 100,
      allowSubOrgCreation: true,
    },
    // Sub-orgs under org-1
    {
      id: 'org-1-1',
      categoryId: 'cat-1',
      parentId: 'org-1',
      name: '办公室',
      code: 'XCB-OFFICE',
      leaderName: '张主任',
      leaderPhone: '13800001111',
      systemVersion: '正式版',
      expireDate: '2026-12-31',
      sortOrder: 100,
      allowSubOrgCreation: true,
    },
    {
      id: 'org-1-2',
      categoryId: 'cat-1',
      parentId: 'org-1',
      name: '网信指导处',
      code: 'XCB-WX',
      leaderName: '李处长',
      leaderPhone: '13800002222',
      systemVersion: '正式版',
      expireDate: '2026-12-31',
      sortOrder: 90,
      allowSubOrgCreation: true,
    },
    {
      id: 'org-1-2-1',
      categoryId: 'cat-1',
      parentId: 'org-1-2',
      name: '网络安全应急响应组',
      code: 'XCB-WX-CERT',
      leaderName: '王组长',
      leaderPhone: '13800003333',
      systemVersion: '正式版',
      expireDate: '2026-12-31',
      sortOrder: 100,
      allowSubOrgCreation: false,
    },
    {
      id: 'org-2',
      categoryId: 'cat-1',
      parentId: null,
      name: '台中市网信办',
      code: 'WXB-340100',
      leaderName: '刘立业',
      leaderPhone: '13988889999',
      systemVersion: '正式版',
      expireDate: '2026-12-31',
      sortOrder: 90,
      allowSubOrgCreation: true,
    },
    {
      id: 'org-2-1',
      categoryId: 'cat-1',
      parentId: 'org-2',
      name: '舆情监测科',
      code: 'WXB-YQ',
      leaderName: '赵科长',
      leaderPhone: '13977776666',
      systemVersion: '正式版',
      expireDate: '2026-12-31',
      sortOrder: 100,
      allowSubOrgCreation: false,
    },
    {
      id: 'org-3',
      categoryId: 'cat-2',
      parentId: null,
      name: '蜀山区委网信办',
      code: 'SSQ-340104',
      leaderName: '周局长',
      leaderPhone: '13655554444',
      systemVersion: '正式版',
      expireDate: '2026-12-31',
      sortOrder: 100,
      allowSubOrgCreation: true,
    },
    {
      id: 'org-4',
      categoryId: 'cat-3',
      parentId: null,
      name: '台中日报社',
      code: 'RBS-340100',
      leaderName: '钱总编',
      leaderPhone: '13533332222',
      systemVersion: '正式版',
      expireDate: '2026-12-31',
      sortOrder: 100,
      allowSubOrgCreation: false,
    },
  ]);

  // Selected Org Node ID
  const [selectedOrgId, setSelectedOrgId] = useState<string>('org-1');

  // Expanded Categories & Org Nodes in Tree
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    'cat-1': true,
    'cat-2': true,
    'cat-3': true,
  });

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'org-1': true,
    'org-1-2': true,
    'org-2': true,
  });

  const [treeSearch, setTreeSearch] = useState('');
  const [personnelSearch, setPersonnelSearch] = useState('');
  const [viewingPersonnelId, setViewingPersonnelId] = useState<number | null>(null);

  // Personnel List (Support multiple org assignment & multiple roles)
  const [personnelList, setPersonnelList] = useState<PersonnelItem[]>([
    {
      id: 1,
      orgIds: ['org-1', 'org-1-1'],
      username: 'admin_xcb',
      realName: '张建国',
      wechat: 'zjg1980',
      phone: '138****0001',
      roles: ['管理员', '审核员'],
      labels: ['一级审核员'],
      registerDate: '2023-10-01',
      status: '启用',
      isLeader: true,
      primaryOrgId: 'org-1',
      activationFields: {
        idCardNo: '3401041980****0018',
        bankCardNo: '6222 **** **** 1028',
        bankName: '台中市政务服务银行',
        emergencyContact: '王敏',
        emergencyPhone: '136****9211',
      },
    },
    {
      id: 2,
      orgIds: ['org-1', 'org-1-2', 'org-1-2-1'],
      username: 'lihua_bs',
      realName: '李华',
      wechat: 'lihua_work',
      phone: '139****8822',
      roles: ['上报员'],
      labels: ['骨干上报员'],
      registerDate: '2023-10-15',
      status: '启用',
      primaryOrgId: 'org-1',
      activationFields: {
        idCardNo: '3401041991****2236',
        bankCardNo: '6217 **** **** 8830',
        bankName: '台中市建设银行',
        emergencyContact: '李明',
        emergencyPhone: '139****0216',
      },
    },
    {
      id: 3,
      orgIds: ['org-1-1'],
      username: 'wangwei_old',
      realName: '王伟',
      wechat: 'ww_123',
      phone: '135****4455',
      roles: ['审核员'],
      labels: ['二级审核员'],
      registerDate: '2023-11-02',
      status: '禁用',
      primaryOrgId: 'org-1-1',
      activationFields: {
        idCardNo: '3401041988****4455',
        bankCardNo: '6228 **** **** 4412',
        bankName: '台中市工商银行',
        emergencyContact: '刘婷',
        emergencyPhone: '135****8702',
      },
    },
    {
      id: 4,
      orgIds: ['org-1', 'org-2'],
      username: 'zhao_q',
      realName: '赵强',
      wechat: 'zq_work88',
      phone: '137****9911',
      roles: ['上报员'],
      labels: ['核心上报员'],
      registerDate: '2023-12-05',
      status: '启用',
      primaryOrgId: 'org-1',
      activationFields: {
        idCardNo: '3401041993****9911',
        bankCardNo: '6214 **** **** 6609',
        bankName: '台中市农业银行',
        emergencyContact: '赵宁',
        emergencyPhone: '137****3488',
      },
    },
  ]);

  // Modals state
  // 1. Category Modal (Add / Edit)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState('');

  // 2. Org Node Modal (Add / Edit Node with Leader)
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [editingOrgNode, setEditingOrgNode] = useState<OrgNode | null>(null);
  const [orgNameInput, setOrgNameInput] = useState('');
  const [orgCategoryIdInput, setOrgCategoryIdInput] = useState('');
  const [orgParentIdInput, setOrgParentIdInput] = useState<string>(''); // '' means root level org
  const [orgCodeInput, setOrgCodeInput] = useState('');
  const [orgSortOrderInput, setOrgSortOrderInput] = useState(100);
  const [orgAllowSubOrgCreationInput, setOrgAllowSubOrgCreationInput] = useState(true);
  const [orgLeaderNameInput, setOrgLeaderNameInput] = useState('');
  const [orgLeaderPhoneInput, setOrgLeaderPhoneInput] = useState('');
  const [orgLeaderPersonIdInput, setOrgLeaderPersonIdInput] = useState<number | undefined>(undefined);
  const [isOrgLeaderSelectorOpen, setIsOrgLeaderSelectorOpen] = useState(false);
  const [orgLeaderSelectorSearch, setOrgLeaderSelectorSearch] = useState('');
  const [orgLeaderSelectorPage, setOrgLeaderSelectorPage] = useState(1);
  const [orgParentSearch, setOrgParentSearch] = useState('');
  const [orgParentPickerOpen, setOrgParentPickerOpen] = useState(false);
  const [orgParentCascaderPath, setOrgParentCascaderPath] = useState<string[]>([]);
  const [inlineSortEditingOrgId, setInlineSortEditingOrgId] = useState<string | null>(null);
  const [inlineSortOrderInput, setInlineSortOrderInput] = useState('');

  // 3. Personnel Modal (Multiple Orgs Selection)
  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [isLeaderPickerOpen, setIsLeaderPickerOpen] = useState(false);
  const [isLeaderActionMenuOpen, setIsLeaderActionMenuOpen] = useState(false);
  const [leaderPickerSearch, setLeaderPickerSearch] = useState('');
  const [leaderPickerPage, setLeaderPickerPage] = useState(1);
  const [editingPersonnel, setEditingPersonnel] = useState<PersonnelItem | null>(null);
  const [pUsername, setPUsername] = useState('');
  const [pRealName, setPRealName] = useState('');
  const [pWechat, setPWechat] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pRoles, setPRoles] = useState<string[]>(['上报员']);
  const [pOrgIds, setPOrgIds] = useState<string[]>([]);
  const [pPrimaryOrgId, setPPrimaryOrgId] = useState<string>('');
  const [pLeaderOrgIds, setPLeaderOrgIds] = useState<string[]>([]);
  const [pOrgSearch, setPOrgSearch] = useState('');
  const [pCascaderCategoryId, setPCascaderCategoryId] = useState('cat-1');
  const [pCascaderPath, setPCascaderPath] = useState<string[]>([]);
  const [pOrgPickerOpen, setPOrgPickerOpen] = useState(false);
  const [isPersonnelLabelPickerOpen, setIsPersonnelLabelPickerOpen] = useState(false);
  const [personnelLabelPickerPersonId, setPersonnelLabelPickerPersonId] = useState<number | null>(null);
  const [personnelLabelPickerPosition, setPersonnelLabelPickerPosition] = useState({ top: 0, left: 0 });

  // 4. Universal QR Code Quantity Control State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isQrGenerateConfirmOpen, setIsQrGenerateConfirmOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrQuotaType] = useState<'unlimited' | 'limit'>('limit');
  const [qrLimitCount, setQrLimitCount] = useState<number>(50);
  const [qrUsedCount, setQrUsedCount] = useState<number>(18);
  const [qrExpireOption, setQrExpireOption] = useState<string>('30d');

  // Root Platform Mode State
  const [isRootSelected, setIsRootSelected] = useState<boolean>(false);
  const [isAuditFlowPreviewOpen, setIsAuditFlowPreviewOpen] = useState(false);
  const [nodeAuditSettingMap, setNodeAuditSettingMap] = useState<Record<string, NodeAuditSetting>>({});

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openPersonnelLabelPicker = (person: PersonnelItem, anchorEl: HTMLElement) => {
    const rect = anchorEl.getBoundingClientRect();
    const panelWidth = 320;
    const panelHeight = 260;
    const top = rect.bottom + 8 + panelHeight > window.innerHeight
      ? Math.max(16, rect.top - panelHeight - 8)
      : rect.bottom + 8;
    const left = Math.min(Math.max(16, rect.left), Math.max(16, window.innerWidth - panelWidth - 16));
    setPersonnelLabelPickerPersonId(person.id);
    setPersonnelLabelPickerPosition({ top, left });
    setIsPersonnelLabelPickerOpen(true);
  };

  const closePersonnelLabelPicker = () => {
    setIsPersonnelLabelPickerOpen(false);
    setPersonnelLabelPickerPersonId(null);
  };

  const togglePersonnelLabel = (personId: number, label: string) => {
    setPersonnelList((prev) =>
      prev.map((item) => {
        if (item.id !== personId) return item;
        const allowedNames = new Set(getPersonnelLabelOptionsByRoles(item.roles).map((option) => option.name));
        if (!allowedNames.has(label)) return item;
        const currentLabels = (item.labels || []).filter((name) => allowedNames.has(name));
        const nextLabels = currentLabels.includes(label)
          ? currentLabels.filter((name) => name !== label)
          : [...currentLabels, label];
        return { ...item, labels: nextLabels };
      })
    );
  };

  const handleDownloadOrgQrCode = () => {
    const svg = document.getElementById('org-qrcode-svg') as SVGSVGElement | null;
    if (!svg) {
      triggerToast('未找到二维码');
      return;
    }

    try {
      const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

      const serializer = new XMLSerializer();
      const svgText = serializer.serializeToString(clonedSvg);
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const viewBox = svg.viewBox.baseVal;
        const baseWidth = viewBox?.width || 200;
        const baseHeight = viewBox?.height || 200;
        const scale = 4;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(baseWidth * scale);
        canvas.height = Math.round(baseHeight * scale);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(svgUrl);
          triggerToast('二维码下载失败');
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, baseWidth, baseHeight);
        URL.revokeObjectURL(svgUrl);

        const downloadLink = document.createElement('a');
        downloadLink.href = canvas.toDataURL('image/png');
        downloadLink.download = `${currentOrg.name}-通用节点二维码.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        triggerToast('二维码已下载');
      };
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        triggerToast('二维码下载失败');
      };
      img.src = svgUrl;
    } catch {
      triggerToast('二维码下载失败');
    }
  };

  const handleResetPassword = (person: PersonnelItem) => {
    triggerToast(`已成功将账号【${person.realName} (${person.username})】的密码重置为：123456`);
  };

  const getOrgById = (orgId?: string) => orgNodes.find((node) => node.id === orgId);
  const compareOrgPriority = (a: OrgNode, b: OrgNode) => {
    const orderDiff = (a.sortOrder || 0) - (b.sortOrder || 0);
    if (orderDiff !== 0) return orderDiff;
    return a.name.localeCompare(b.name, 'zh-Hans-CN');
  };
  const getSortedOrgChildren = (parentId: string | null, categoryId?: string, excludeId?: string) =>
    orgNodes
      .filter(
        (node) =>
          node.parentId === parentId &&
          (!categoryId || node.categoryId === categoryId) &&
          node.id !== excludeId
      )
      .sort(compareOrgPriority);
  const getDefaultOrgSortOrder = (parentId: string | null) => {
    const siblingNodes = getSortedOrgChildren(parentId, undefined);
    const maxSortOrder = siblingNodes.reduce((max, node) => Math.max(max, node.sortOrder || 0), 0);
    return siblingNodes.length > 0 ? maxSortOrder + 10 : 100;
  };

  const openInlineSortEditor = (node: OrgNode) => {
    setInlineSortEditingOrgId(node.id);
    setInlineSortOrderInput(String(node.sortOrder ?? 0));
  };

  const saveInlineSortEditor = () => {
    if (!inlineSortEditingOrgId) return;
    const nextSortOrder = Number(inlineSortOrderInput);
    if (!Number.isFinite(nextSortOrder)) {
      setInlineSortEditingOrgId(null);
      return;
    }

    setOrgNodes((prev) =>
      prev.map((node) =>
        node.id === inlineSortEditingOrgId
          ? { ...node, sortOrder: nextSortOrder }
          : node
      )
    );
    setInlineSortEditingOrgId(null);
    triggerToast('排序值已更新');
  };

  const openPersonnelDetail = (person: PersonnelItem) => {
    setViewingPersonnelId(person.id);
  };

  const closePersonnelDetail = () => {
    setViewingPersonnelId(null);
  };

  // Selected Org Node
  const currentOrg = orgNodes.find((o) => o.id === selectedOrgId) || orgNodes[0] || {
    id: 'org-1',
    categoryId: 'cat-1',
    parentId: null,
    name: '中共台中市委宣传部',
    code: 'XCB-340100',
    leaderName: '陈建国',
    leaderPhone: '13812345678',
    systemVersion: '正式版',
    expireDate: '2026-12-31',
    sortOrder: 100,
    allowSubOrgCreation: true,
  };

  const orgAuditFlowStatusMap: Record<string, OrgAuditFlowStatus> = {
    'org-1': 'configured',
    'org-1-1': 'inherited',
    'org-1-2': 'configured',
    'org-1-2-1': 'inherited',
    'org-2': 'default',
    'org-2-1': 'default',
    'org-3': 'default',
    'org-4': 'inherited',
  };

  const currentOrgAuditFlowStatus = orgAuditFlowStatusMap[currentOrg.id] || (currentOrg.parentId ? 'inherited' : 'default');
  const currentOrgAuditFlow = {
    statusKey: currentOrgAuditFlowStatus,
    name: currentOrgAuditFlowStatus === 'default'
        ? '标准二级复核流程'
        : '标准二级复核流程',
    fallback: '跳过该节点',
    status: currentOrgAuditFlowStatus === 'configured'
      ? '已配置'
      : currentOrgAuditFlowStatus === 'inherited'
        ? '继承中'
        : '默认兜底',
    statusHint: currentOrgAuditFlowStatus === 'configured'
      ? '当前机构已配置专属审核流程'
      : currentOrgAuditFlowStatus === 'inherited'
        ? '当前机构继承上级机构审核流程'
        : '当前机构使用系统默认兜底流程',
  };

  const nodeAuditStatus: NodeAuditDisplayStatus =
    nodeAuditSettingMap[currentOrg.id] ||
    (currentOrgAuditFlowStatus === 'configured'
      ? 'enabled'
      : currentOrgAuditFlowStatus === 'inherited'
        ? 'inherited'
        : 'disabled');

  const nodeAuditStatusConfigMap = {
    enabled: {
      label: '已开启节点审核',
      hint: '本机构参与下级提交的速报事件审核',
      badge: '已开启',
      dotClassName: 'bg-emerald-500',
      textClassName: 'text-emerald-700',
      panelClassName: 'from-emerald-50/60 to-green-50/30 border-emerald-100/90',
    },
    disabled: {
      label: '未开启节点审核',
      hint: '本机构不参与审核，下级提交将自动流转至上级机构',
      badge: '未开启',
      dotClassName: 'bg-gray-400',
      textClassName: 'text-gray-700',
      panelClassName: 'from-gray-50/80 to-slate-50/40 border-gray-200/80',
    },
    inherited: {
      label: '跟随上级审核',
      hint: '当前节点未单独启用审核，按上级机构规则流转',
      badge: '继承上级',
      dotClassName: 'bg-blue-500',
      textClassName: 'text-blue-700',
      panelClassName: 'from-blue-50/60 to-indigo-50/30 border-blue-100/90',
    },
  };

  const nodeAuditConfig = nodeAuditStatusConfigMap[nodeAuditStatus];
  const rootNodeAuditStatus: NodeAuditSetting = nodeAuditSettingMap['root-flow'] || 'disabled';
  const rootNodeAuditConfig = nodeAuditStatusConfigMap[rootNodeAuditStatus];
  const rootNodeAuditHint = rootNodeAuditStatus === 'enabled'
    ? '平台根节点已启用，所有下级机构提交的速报事件均需审核'
    : '平台根节点已停用，下级机构按各自节点审核设置流转';

  const handleToggleNodeAudit = () => {
    const nextStatus: NodeAuditSetting = nodeAuditStatus === 'enabled' ? 'disabled' : 'enabled';
    setNodeAuditSettingMap((prev) => ({ ...prev, [currentOrg.id]: nextStatus }));
    triggerToast(
      nextStatus === 'enabled'
        ? '已启用节点审核，本机构参与下级提交的速报事件审核'
        : '已停用节点审核，本机构不参与审核，下级提交将自动流转至上级机构'
    );
  };

  const handleToggleRootNodeAudit = () => {
    const nextStatus: NodeAuditSetting = rootNodeAuditStatus === 'enabled' ? 'disabled' : 'enabled';
    setNodeAuditSettingMap((prev) => ({ ...prev, 'root-flow': nextStatus }));
    triggerToast(
      nextStatus === 'enabled'
        ? '平台根节点已启用，所有下级机构提交的速报事件均需审核'
        : '平台根节点已停用，下级机构按各自节点审核设置流转'
    );
  };

  const getOrgLeaderIds = (node: OrgNode) =>
    Array.from(
      new Set([...(node.leaderPersonIds || []), node.leaderPersonId].filter((id): id is number => typeof id === 'number'))
    );

  const isPersonLeaderOfOrg = (node: OrgNode, person: PersonnelItem) =>
    getOrgLeaderIds(node).includes(person.id) || node.leaderName === person.realName;

  const getOrgLeaderPeople = (node: OrgNode) =>
    getOrgLeaderIds(node)
      .map((leaderId) => personnelList.find((person) => person.id === leaderId))
      .filter((person): person is PersonnelItem => !!person);

  const getOrgLeaderNames = (node: OrgNode) => {
    const names = getOrgLeaderPeople(node).map((person) => person.realName);
    if (node.leaderName && !names.includes(node.leaderName)) names.push(node.leaderName);
    return names;
  };

  const getOrgLeaderSummary = (node: OrgNode) => {
    const names = getOrgLeaderNames(node);
    if (names.length <= 1) return names[0] || '';
    return `${names[0]}等${names.length}人`;
  };

  const getOrgLeaderPhoneSummary = (node: OrgNode) => {
    const phones = getOrgLeaderPeople(node).map((person) => person.phone);
    if (node.leaderPhone && !phones.includes(node.leaderPhone)) phones.push(node.leaderPhone);
    if (phones.length <= 1) return phones[0] || '';
    return `${phones[0]}等${phones.length}个电话`;
  };

  const getLeaderMetaByIds = (leaderIds: number[]) => {
    const people = leaderIds
      .map((leaderId) => personnelList.find((person) => person.id === leaderId))
      .filter((person): person is PersonnelItem => !!person);

    return {
      leaderName: people.map((person) => person.realName).join('、'),
      leaderPhone: people.map((person) => person.phone).join('、'),
      leaderPersonId: leaderIds[0],
      leaderPersonIds: leaderIds,
    };
  };

  const personLeadsAnyOrg = (personId: number, nodes: OrgNode[]) =>
    nodes.some((node) => getOrgLeaderIds(node).includes(personId) || node.leaderPersonId === personId);
  const rootAuditFlow = {
    statusKey: 'default' as const,
    name: '标准二级复核流程',
    fallback: '跳过该节点',
    status: '默认兜底',
    statusHint: '平台根部机构使用系统默认兜底流程',
  };
  const activeAuditFlow = isRootSelected ? rootAuditFlow : currentOrgAuditFlow;
  const auditFlowDisplayOrgName = isRootSelected ? '台中市网信办' : currentOrg.name;
  const auditFlowDetailNodes = [
    {
      id: 'node-1',
      nodeName: '一级基础初审',
      assigneeSource: '按角色',
      assigneeName: '初审员',
      timeLimit: '15 分钟',
      rejectStrategy: '退回上报人修改',
    },
    {
      id: 'node-2',
      nodeName: '二级研判复核',
      assigneeSource: '按组织负责人',
      assigneeName: '归属机构负责人',
      timeLimit: '30 分钟',
      rejectStrategy: '退回上一节点',
    },
  ];

  const buildAuditFlowDetailData = () => {
    const getTopTreeNode = (startNode: OrgNode) => {
      let cursor: OrgNode | undefined = startNode;
      let topNode = startNode;
      while (cursor) {
        topNode = cursor;
        cursor = orgNodes.find((node) => node.id === cursor?.parentId);
      }
      return topNode;
    };
    const isNodeInsideTree = (node: OrgNode, treeRoot: OrgNode) => {
      let cursor: OrgNode | undefined = node;
      while (cursor) {
        if (cursor.id === treeRoot.id) return true;
        cursor = orgNodes.find((item) => item.id === cursor?.parentId);
      }
      return false;
    };
    const buildLowerToUpperOrgPath = (startNode: OrgNode, stopNode?: OrgNode, includePlatformRoot = false) => {
      const path: Array<{ id: string; title: string; description: string }> = [];
      let cursor: OrgNode | undefined = startNode;
      while (cursor) {
        const isTreeRoot = stopNode?.id === cursor.id;
        path.push({
          id: cursor.id,
          title: cursor.name,
          description: isTreeRoot ? '机构树根节点' : path.length === 0 ? '下级机构' : '上级机构',
        });
        if (isTreeRoot) break;
        cursor = orgNodes.find((node) => node.id === cursor?.parentId);
      }
      if (includePlatformRoot) {
        path.push({
          id: 'root-flow',
          title: '台中市网信办',
          description: '平台根节点',
        });
      }
      return path;
    };
    const currentTreeRoot = getTopTreeNode(currentOrg);
    const flowPathRows = isRootSelected
      ? orgNodes
          .filter((node) => !orgNodes.some((child) => child.parentId === node.id))
          .sort(compareOrgPriority)
          .map((leafNode) => buildLowerToUpperOrgPath(leafNode, undefined, true))
      : orgNodes
          .filter((node) => isNodeInsideTree(node, currentTreeRoot))
          .filter((node) => !orgNodes.some((child) => child.parentId === node.id))
          .sort(compareOrgPriority)
          .map((leafNode) => buildLowerToUpperOrgPath(leafNode, currentTreeRoot));
    const levelNames = ['一级', '二级', '三级', '四级', '五级', '六级'];
    const flowTreeLevels: Array<Array<{ id: string; title: string; description: string; isRoot?: boolean }>> = [
      [
        isRootSelected
          ? {
              id: 'root-flow',
              title: '台中市网信办',
              description: '平台根节点',
              isRoot: true,
            }
          : {
              id: currentTreeRoot.id,
              title: currentTreeRoot.name,
              description: '机构树根节点',
              isRoot: true,
            },
      ],
    ];
    let parentIds: Array<string | null> = isRootSelected ? [null] : [currentTreeRoot.id];
    let levelIndex = 0;
    while (parentIds.length > 0) {
      const children = orgNodes
        .filter((node) => parentIds.includes(node.parentId ?? null))
        .sort(compareOrgPriority);
      if (children.length === 0) break;
      flowTreeLevels.push(
        children.map((node) => ({
          id: node.id,
          title: node.name,
          description: `${levelNames[levelIndex] || `${levelIndex + 1}级`}子机构`,
        }))
      );
      parentIds = children.map((node) => node.id);
      levelIndex += 1;
    }
    const buildFlowTreeNode = (node: OrgNode, depth: number, isTreeRoot = false, rootDescription = '机构树根节点'): FlowTreePreviewNode => ({
      id: node.id,
      title: node.name,
      description: isTreeRoot ? rootDescription : `${levelNames[depth - 1] || `${depth}级`}子机构`,
      isRoot: isTreeRoot,
      children: orgNodes
        .filter((child) => child.parentId === node.id)
        .sort(compareOrgPriority)
        .map((child) => buildFlowTreeNode(child, depth + 1)),
    });
    const currentOrgPathTopDown = (() => {
      const path: OrgNode[] = [];
      let cursor: OrgNode | undefined = currentOrg;
      while (cursor) {
        path.unshift(cursor);
        cursor = orgNodes.find((node) => node.id === cursor?.parentId);
      }
      return path;
    })();
    const buildSinglePathFlowTree = (pathNodes: OrgNode[], depth = 0): FlowTreePreviewNode => {
      const node = pathNodes[depth];
      return {
        id: node.id,
        title: node.name,
        description: depth === 0 ? '机构树根节点' : `${levelNames[depth - 1] || `${depth}级`}子机构`,
        isRoot: depth === 0,
        children: depth < pathNodes.length - 1 ? [buildSinglePathFlowTree(pathNodes, depth + 1)] : [],
      };
    };
    const hasCurrentOrgChildren = orgNodes.some((node) => node.parentId === currentOrg.id);
    const buildCurrentScopeFlowTree = (pathNodes: OrgNode[], depth = 0): FlowTreePreviewNode => {
      const node = pathNodes[depth];
      const isCurrentNode = node.id === currentOrg.id;
      return {
        id: node.id,
        title: node.name,
        description: depth === 0
          ? '机构树根节点'
          : isCurrentNode && hasCurrentOrgChildren
            ? '当前上级机构'
            : isCurrentNode
              ? '当前机构'
              : `${levelNames[depth - 1] || `${depth}级`}子机构`,
        isRoot: depth === 0,
        children: isCurrentNode
          ? orgNodes
              .filter((child) => child.parentId === node.id)
              .sort(compareOrgPriority)
              .map((child) => buildFlowTreeNode(child, depth + 1))
          : depth < pathNodes.length - 1
            ? [buildCurrentScopeFlowTree(pathNodes, depth + 1)]
            : [],
      };
    };
    const flowTreeRoot: FlowTreePreviewNode = isRootSelected
      ? {
          id: 'root-flow',
          title: '台中市网信办',
          description: '平台根节点',
          isRoot: true,
          children: orgNodes
            .filter((node) => !node.parentId)
            .sort(compareOrgPriority)
            .map((node) => buildFlowTreeNode(node, 1)),
        }
      : buildCurrentScopeFlowTree(currentOrgPathTopDown);
    const orgFlowNodes = isRootSelected
      ? [{ id: 'root-flow', name: '台中市网信办' }]
      : (() => {
          const path: Array<Pick<OrgNode, 'id' | 'name'>> = [];
          let cursor: OrgNode | undefined = currentOrg;
          while (cursor) {
            path.push({ id: cursor.id, name: cursor.name });
            cursor = orgNodes.find((node) => node.id === cursor?.parentId);
          }
          return path;
        })();
    const flowSteps = orgFlowNodes.map((node, index) => ({
      id: node.id,
      type: 'org' as const,
      title: node.name,
      description: index === 0
        ? '当前机构'
        : index === orgFlowNodes.length - 1
          ? '上级根机构'
          : '上级机构',
    }));
    const stepsPerRow = flowSteps.length <= 5 ? flowSteps.length : 4;
    const flowRows = flowSteps.reduce<Array<typeof flowSteps>>((rows, step, index) => {
      if (index % stepsPerRow === 0) rows.push([]);
      rows[rows.length - 1].push(step);
      return rows;
    }, []);
    const longestRowLength = Math.max(...flowRows.map(row => row.length), 1);
    const longestFlowPathLength = Math.max(...flowPathRows.map((path) => path.length), 1);
    const widestTreeLevelLength = Math.max(...flowTreeLevels.map((level) => level.length), 1);
    const panelWidth = Math.min(
      1240,
      Math.max(
        920,
        Math.max(longestFlowPathLength * 148 + (longestFlowPathLength - 1) * 36, widestTreeLevelLength * 150 + (widestTreeLevelLength - 1) * 12) + 64
      )
    );
    const inheritedOrgName = orgFlowNodes[1]?.name || '上级机构';
    const scopeLabel = activeAuditFlow.statusKey === 'inherited'
      ? '继承机构'
      : activeAuditFlow.statusKey === 'configured'
        ? '适用机构'
        : '兜底范围';
    const scopeValue = activeAuditFlow.statusKey === 'inherited'
      ? inheritedOrgName
      : activeAuditFlow.statusKey === 'configured'
        ? auditFlowDisplayOrgName
        : '未配置专属流程机构';
    const description = activeAuditFlow.statusKey === 'inherited'
      ? `${auditFlowDisplayOrgName} 当前继承${inheritedOrgName}审核流程，提交后按以下机构顺序由下级向上级流转。`
      : activeAuditFlow.statusKey === 'configured'
        ? `${auditFlowDisplayOrgName} 当前已配置专属审核流程，提交后按以下机构顺序由下级向上级流转。`
        : `${auditFlowDisplayOrgName} 当前使用系统默认兜底审核流程，提交后按以下机构顺序由下级向上级流转。`;

    return {
      flowSteps,
      flowRows,
      flowPathRows,
      flowTreeLevels,
      flowTreeRoot,
      stepsPerRow,
      panelWidth,
      inheritedOrgName,
      summaryItems: [
        { label: '模板范围', value: '全部报送模板通用' },
        { label: scopeLabel, value: scopeValue },
        { label: '无负责人时', value: activeAuditFlow.fallback },
      ],
      description,
    };
  };

  const renderAuditFlowLinearRows = (
    flowSteps: ReturnType<typeof buildAuditFlowDetailData>['flowSteps'],
    flowRows: ReturnType<typeof buildAuditFlowDetailData>['flowRows'],
    stepsPerRow: number
  ) => (
    <div className="max-w-full overflow-hidden">
      <div className="flex flex-wrap items-center gap-2">
        {flowSteps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="min-w-[132px] max-w-[180px] rounded-md border border-blue-100 bg-blue-50/60 px-3 py-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Building2 className="w-3.5 h-3.5 text-[#1E5ABB] shrink-0" />
                <span className="text-xs font-bold text-gray-900 truncate" title={step.title}>
                  {step.title}
                </span>
              </div>
              <div className="mt-1 text-[10px] text-gray-500">{step.description}</div>
            </div>
            {index < flowSteps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderRootAuditFlowPaths = (
    flowPaths: ReturnType<typeof buildAuditFlowDetailData>['flowPathRows']
  ) => (
    <div className="space-y-3 max-w-full overflow-hidden">
      {flowPaths.map((path, pathIndex) => (
        <div
          key={`root-path-${pathIndex}`}
          className="rounded-md border border-gray-100 bg-gray-50/60 px-3 py-3 overflow-x-auto"
        >
          <div className="flex items-center gap-2 min-w-max">
            {path.map((step, index) => {
              const isRoot = index === path.length - 1;

              return (
                <React.Fragment key={`${step.id}-${pathIndex}-${index}`}>
                  <div
                    className={`min-w-[132px] max-w-[180px] rounded-md border px-3 py-2 ${
                      isRoot
                        ? 'border-emerald-100 bg-emerald-50/70'
                        : 'border-blue-100 bg-blue-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Building2 className={`w-3.5 h-3.5 shrink-0 ${isRoot ? 'text-emerald-600' : 'text-[#1E5ABB]'}`} />
                      <span className="text-xs font-bold text-gray-900 truncate" title={step.title}>
                        {step.title}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] text-gray-500">{step.description}</div>
                  </div>
                  {index < path.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const renderAuditFlowTreeNode = (node: FlowTreePreviewNode) => (
    <div className="flex flex-col items-center min-w-max">
      <div
        className={`min-w-[142px] max-w-[180px] rounded-md border px-3 py-2 ${
          node.isRoot ? 'border-emerald-100 bg-emerald-50/70' : 'border-blue-100 bg-blue-50/60'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Building2 className={`w-3.5 h-3.5 shrink-0 ${node.isRoot ? 'text-emerald-600' : 'text-[#1E5ABB]'}`} />
          <span className="text-xs font-bold text-gray-900 truncate" title={node.title}>
            {node.title}
          </span>
        </div>
        <div className="mt-1 text-[10px] text-gray-500">{node.description}</div>
      </div>

      {node.children.length > 0 && (
        <div className="relative mt-3 flex flex-col items-center">
          <div className="h-5 w-px bg-gray-200" />
          <div className="relative flex items-start justify-center gap-4 pt-5">
            {node.children.map((child) => (
              <div key={child.id} className="relative flex flex-col items-center">
                <div className="absolute -top-5 left-1/2 h-5 w-px -translate-x-1/2 bg-gray-200" />
                <ChevronDown className="absolute -top-3 left-1/2 w-4 h-4 -translate-x-1/2 text-gray-300 bg-white" />
                {renderAuditFlowTreeNode(child)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderAuditFlowTree = (flowTreeRoot: ReturnType<typeof buildAuditFlowDetailData>['flowTreeRoot']) => (
    (() => {
      const cardWidth = 152;
      const cardHeight = 50;
      const gapX = 28;
      const gapY = 78;

      type MeasuredTreeNode = {
        node: FlowTreePreviewNode;
        width: number;
        children: MeasuredTreeNode[];
      };
      type PlacedTreeNode = {
        node: FlowTreePreviewNode;
        x: number;
        y: number;
      };
      type TreeEdge = {
        fromX: number;
        fromY: number;
        toX: number;
        toY: number;
      };

      const measureTree = (node: FlowTreePreviewNode): MeasuredTreeNode => {
        const children = node.children.map(measureTree);
        const childrenWidth = children.reduce((sum, child, index) => sum + child.width + (index > 0 ? gapX : 0), 0);
        return {
          node,
          width: Math.max(cardWidth, childrenWidth),
          children,
        };
      };

      const measuredRoot = measureTree(flowTreeRoot);
      const placedNodes: PlacedTreeNode[] = [];
      const edges: TreeEdge[] = [];

      const placeTree = (treeNode: MeasuredTreeNode, left: number, depth: number, parentCenter?: { x: number; y: number }) => {
        const centerX = left + treeNode.width / 2;
        const y = depth * (cardHeight + gapY);
        placedNodes.push({
          node: treeNode.node,
          x: centerX - cardWidth / 2,
          y,
        });

        if (parentCenter) {
          edges.push({
            fromX: parentCenter.x,
            fromY: parentCenter.y,
            toX: centerX,
            toY: y,
          });
        }

        const childrenTotalWidth = treeNode.children.reduce((sum, child, index) => sum + child.width + (index > 0 ? gapX : 0), 0);
        let childLeft = left + (treeNode.width - childrenTotalWidth) / 2;
        treeNode.children.forEach((child) => {
          placeTree(child, childLeft, depth + 1, { x: centerX, y: y + cardHeight });
          childLeft += child.width + gapX;
        });
      };

      placeTree(measuredRoot, 0, 0);
      const treeWidth = Math.max(cardWidth, measuredRoot.width);
      const treeHeight = Math.max(...placedNodes.map((node) => node.y + cardHeight), cardHeight);

      return (
        <div className="max-w-full overflow-visible pb-1">
          <div className="relative mx-auto" style={{ width: treeWidth, height: treeHeight }}>
            <svg
              className="absolute inset-0 overflow-visible pointer-events-none"
              width={treeWidth}
              height={treeHeight}
              aria-hidden="true"
            >
              {edges.map((edge, index) => {
                const midY = edge.fromY + (edge.toY - edge.fromY) / 2;
                return (
                  <path
                    key={`flow-edge-${index}`}
                    d={`M ${edge.fromX} ${edge.fromY} V ${midY} H ${edge.toX} V ${edge.toY}`}
                    fill="none"
                    stroke="#dbe4f0"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}
            </svg>

            {placedNodes.map(({ node, x, y }) => (
              <div
                key={node.id}
                className={`absolute rounded-md border px-3 py-2 ${
                  node.isRoot ? 'border-emerald-100 bg-emerald-50/70' : 'border-blue-100 bg-blue-50/60'
                }`}
                style={{ left: x, top: y, width: cardWidth, height: cardHeight }}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Building2 className={`w-3.5 h-3.5 shrink-0 ${node.isRoot ? 'text-emerald-600' : 'text-[#1E5ABB]'}`} />
                  <span className="text-xs font-bold text-gray-900 truncate" title={node.title}>
                    {node.title}
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-gray-500">{node.description}</div>
              </div>
            ))}
          </div>
        </div>
      );
    })()
  );

  const getOrgAuditFlowStatus = (node: OrgNode) => {
    const isAuditEnabled =
      nodeAuditSettingMap[node.id] === 'enabled' ||
      (!nodeAuditSettingMap[node.id] && orgAuditFlowStatusMap[node.id] === 'configured');

    return isAuditEnabled
      ? {
          title: '已开启节点审核',
          dotClassName: 'bg-emerald-500',
        }
      : {
          title: '未开启节点审核',
          dotClassName: 'bg-gray-400',
        };
  };

  // Helper: Get ancestor chain for selected org
  const getOrgPath = (orgId: string): OrgNode[] => {
    const path: OrgNode[] = [];
    let curr: OrgNode | undefined = orgNodes.find((o) => o.id === orgId);
    while (curr) {
      path.unshift(curr);
      curr = orgNodes.find((o) => o.id === curr?.parentId);
    }
    return path;
  };

  const getOrgPathText = (orgId: string) => getOrgPath(orgId).map((node) => node.name).join(' / ');
  const getOrgAncestorIds = (orgId: string) => getOrgPath(orgId).map((node) => node.id);

  const isOrgLedByPerson = (node: OrgNode, person: PersonnelItem | null) => {
    if (!person) return false;
    return isPersonLeaderOfOrg(node, person);
  };

  const viewingPersonnel = viewingPersonnelId
    ? personnelList.find((person) => person.id === viewingPersonnelId) || null
    : null;
  const viewingPersonnelOrgs = viewingPersonnel
    ? viewingPersonnel.orgIds.map((orgId) => orgNodes.find((node) => node.id === orgId)).filter((node): node is OrgNode => !!node)
    : [];
  const viewingLeaderOrgs = viewingPersonnel
    ? orgNodes.filter((node) => isPersonLeaderOfOrg(node, viewingPersonnel))
    : [];
  const viewingActivationFields = viewingPersonnel
    ? [
        { label: '身份证号', value: viewingPersonnel.activationFields?.idCardNo },
        { label: '银行卡号', value: viewingPersonnel.activationFields?.bankCardNo },
        { label: '开户银行', value: viewingPersonnel.activationFields?.bankName },
        { label: '紧急联系人', value: viewingPersonnel.activationFields?.emergencyContact },
        { label: '联系人电话', value: viewingPersonnel.activationFields?.emergencyPhone },
      ]
    : [];

  // Helper: Count direct sub-nodes
  const getDirectSubNodes = (parentId: string) => getSortedOrgChildren(parentId, undefined);

  // Helper: Get all descendant node IDs recursively
  const getAllDescendantIds = (parentId: string): string[] => {
    const children = getSortedOrgChildren(parentId, undefined);
    let ids: string[] = [];
    for (const child of children) {
      ids.push(child.id);
      ids = ids.concat(getAllDescendantIds(child.id));
    }
    return ids;
  };

  // Helper: Get flattened tree options with indentation and tree branches for selects
  const getTreeOptionsForSelect = (catId: string, excludeId?: string) => {
    const disabledIds = new Set<string>();
    if (excludeId) {
      disabledIds.add(excludeId);
      getAllDescendantIds(excludeId).forEach((id) => disabledIds.add(id));
    }

    interface TreeOpt {
      id: string;
      name: string;
      prefix: string;
      depth: number;
    }

    const result: TreeOpt[] = [];

    const build = (parentId: string | null = null, depth = 0, indentStr = '') => {
      const children = getSortedOrgChildren(parentId, catId).filter((o) => !disabledIds.has(o.id));
      children.forEach((node, index) => {
        const isLast = index === children.length - 1;
        const branch = depth === 0 ? '📁 ' : (isLast ? '└─ ' : '├─ ');
        const nextIndent = depth === 0 ? '' : indentStr + (isLast ? '    ' : '│   ');

        result.push({
          id: node.id,
          name: node.name,
          prefix: depth === 0 ? '📁 ' : indentStr + branch,
          depth,
        });

        build(node.id, depth + 1, nextIndent);
      });
    };

    build(null, 0, '');
    return result;
  };

  const [isAllExpanded, setIsAllExpanded] = useState<boolean>(true);

  // Expand / Collapse Toggles
  const toggleCategoryExpand = (catId: string) => {
    setExpandedCats((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const toggleNodeExpand = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const toggleAllExpand = () => {
    if (isAllExpanded) {
      setExpandedCats({});
      setExpandedNodes({});
      setIsAllExpanded(false);
    } else {
      const allCats: Record<string, boolean> = {};
      categories.forEach((c) => (allCats[c.id] = true));
      setExpandedCats(allCats);

      const allNodes: Record<string, boolean> = {};
      orgNodes.forEach((n) => (allNodes[n.id] = true));
      setExpandedNodes(allNodes);
      setIsAllExpanded(true);
    }
  };

  // Category CRUD
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryNameInput('');
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: CategoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategory(cat);
    setCategoryNameInput(cat.name);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (cat: CategoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const childOrgs = orgNodes.filter((o) => o.categoryId === cat.id);
    const msg = childOrgs.length > 0
      ? `确定要删除分类『${cat.name}』及其下的 ${childOrgs.length} 个机构节点吗？`
      : `确定要删除分类『${cat.name}』吗？`;

    if (confirm(msg)) {
      const removedOrgIds = childOrgs.map((o) => o.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      setOrgNodes((prev) => prev.filter((o) => o.categoryId !== cat.id));
      // Clean up personnel org bindings
      setPersonnelList((prev) =>
        prev.map((p) => ({
          ...p,
          orgIds: p.orgIds.filter((id) => !removedOrgIds.includes(id)),
        }))
      );
    }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryNameInput.trim()) return;

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? { ...c, name: categoryNameInput.trim() } : c))
      );
    } else {
      const newCat: CategoryItem = {
        id: 'cat-' + Date.now(),
        name: categoryNameInput.trim(),
      };
      setCategories((prev) => [...prev, newCat]);
      setExpandedCats((prev) => ({ ...prev, [newCat.id]: true }));
    }
    setIsCategoryModalOpen(false);
  };

  // Org Node CRUD (Root or Sub-Node)
  const openAddOrgModal = (presetCatId: string, parentId?: string | null, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingOrgNode(null);
    setOrgNameInput('');
    setOrgCategoryIdInput(presetCatId || categories[0]?.id || 'cat-1');
    setOrgParentIdInput(parentId || '');
    setOrgCodeInput('');
    setOrgSortOrderInput(getDefaultOrgSortOrder(parentId || null));
    setOrgAllowSubOrgCreationInput(true);
    setOrgLeaderNameInput('');
    setOrgLeaderPhoneInput('');
    setOrgLeaderPersonIdInput(undefined);
    setIsOrgLeaderSelectorOpen(false);
    setOrgLeaderSelectorSearch('');
    setOrgLeaderSelectorPage(1);
    setOrgParentSearch('');
    setOrgParentPickerOpen(false);
    setOrgParentCascaderPath(parentId ? getOrgAncestorIds(parentId) : []);
    setIsOrgModalOpen(true);
  };

  const openEditOrgModal = (node: OrgNode, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingOrgNode(node);
    setOrgNameInput(node.name);
    setOrgCategoryIdInput(node.categoryId);
    setOrgParentIdInput(node.parentId || '');
    setOrgCodeInput(node.code || '');
    setOrgSortOrderInput(node.sortOrder ?? 100);
    setOrgAllowSubOrgCreationInput(node.allowSubOrgCreation ?? true);
    setOrgLeaderNameInput(node.leaderName || '');
    setOrgLeaderPhoneInput(node.leaderPhone || '');
    setOrgLeaderPersonIdInput(node.leaderPersonId);
    setIsOrgLeaderSelectorOpen(false);
    setOrgLeaderSelectorSearch('');
    setOrgLeaderSelectorPage(1);
    setOrgParentSearch('');
    setOrgParentPickerOpen(false);
    setOrgParentCascaderPath(node.parentId ? getOrgAncestorIds(node.parentId) : []);
    setIsOrgModalOpen(true);
  };

  const handleDeleteOrgNode = (node: OrgNode, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const descendantIds = getAllDescendantIds(node.id);
    const totalToDelete = [node.id, ...descendantIds];

    const msg = descendantIds.length > 0
      ? `确定要删除机构节点『${node.name}』及其下的 ${descendantIds.length} 个子机构吗？`
      : `确定要删除机构节点『${node.name}』吗？`;

    if (confirm(msg)) {
      setOrgNodes((prev) => prev.filter((o) => !totalToDelete.includes(o.id)));
      if (totalToDelete.includes(selectedOrgId)) {
        const remaining = orgNodes.filter((o) => !totalToDelete.includes(o.id));
        if (remaining.length > 0) {
          setSelectedOrgId(remaining[0].id);
        }
      }
      // Clean up personnel org bindings
      setPersonnelList((prev) =>
        prev.map((p) => ({
          ...p,
          orgIds: p.orgIds.filter((id) => !totalToDelete.includes(id)),
        }))
      );
    }
  };

  const handleSaveOrgNode = (e: React.FormEvent) => {
    e.preventDefault();
    const parentOrg = orgParentIdInput ? orgNodes.find((node) => node.id === orgParentIdInput) : undefined;
    const nextCategoryId = parentOrg?.categoryId || orgCategoryIdInput || categories[0]?.id;
    if (!orgNameInput.trim() || !nextCategoryId) return;

    const selectedLeaderPerson = orgLeaderPersonIdInput
      ? personnelList.find((person) => person.id === orgLeaderPersonIdInput)
      : undefined;
    const nextLeaderName = selectedLeaderPerson?.realName || orgLeaderNameInput.trim();
    const nextLeaderPhone = selectedLeaderPerson?.phone || orgLeaderPhoneInput.trim();
    const nextLeaderPersonId = selectedLeaderPerson?.id;

    if (editingOrgNode) {
      setOrgNodes((prev) =>
        prev.map((o) =>
          o.id === editingOrgNode.id
            ? {
                ...o,
                name: orgNameInput.trim(),
                categoryId: nextCategoryId,
                parentId: orgParentIdInput || null,
                code: orgCodeInput.trim(),
                sortOrder: Number.isFinite(orgSortOrderInput) ? orgSortOrderInput : 0,
                allowSubOrgCreation: orgAllowSubOrgCreationInput,
                leaderName: nextLeaderName,
                leaderPhone: nextLeaderPhone,
                leaderPersonId: nextLeaderPersonId,
              }
            : o
        )
      );
    } else {
      const newOrgId = 'org-' + Date.now();
      const newOrg: OrgNode = {
        id: newOrgId,
        categoryId: nextCategoryId,
        parentId: orgParentIdInput || null,
        name: orgNameInput.trim(),
        code: orgCodeInput.trim() || `ORG-${Math.floor(100000 + Math.random() * 900000)}`,
        sortOrder: Number.isFinite(orgSortOrderInput) ? orgSortOrderInput : 0,
        allowSubOrgCreation: orgAllowSubOrgCreationInput,
        leaderName: nextLeaderName,
        leaderPhone: nextLeaderPhone,
        leaderPersonId: nextLeaderPersonId,
        systemVersion: '正式版',
        expireDate: '2026-12-31',
      };
      setOrgNodes((prev) => [...prev, newOrg]);
      setSelectedOrgId(newOrgId);
      if (orgParentIdInput) {
        setExpandedNodes((prev) => ({ ...prev, [orgParentIdInput]: true }));
      }
      setExpandedCats((prev) => ({ ...prev, [nextCategoryId]: true }));
    }

    if (nextLeaderPersonId) {
      setPersonnelList((prev) =>
        prev.map((person) => (person.id === nextLeaderPersonId ? { ...person, isLeader: true } : person))
      );
    }
    setIsOrgModalOpen(false);
  };

  // Personnel Handlers
  const handleTogglePersonnelStatus = (id: number) => {
    setPersonnelList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: item.status === '启用' ? '禁用' : '启用' } : item
      )
    );
  };

  const handleDeletePersonnel = (id: number) => {
    if (confirm('确定要删除该人员账号吗？')) {
      setPersonnelList((prev) => prev.filter((item) => item.id !== id));
      if (viewingPersonnelId === id) {
        setViewingPersonnelId(null);
      }
    }
  };

  const openAddPersonnelModal = () => {
    setEditingPersonnel(null);
    setPUsername('');
    setPRealName('');
    setPWechat('');
    setPPhone('');
    setPRoles(['上报员']);
    setPOrgIds([currentOrg.id]); // Default to selected org
    setPPrimaryOrgId(currentOrg.id);
    setPLeaderOrgIds([currentOrg.id]);
    setPOrgSearch('');
    setPOrgPickerOpen(false);
    setPCascaderCategoryId(currentOrg.categoryId);
    setPCascaderPath(getOrgAncestorIds(currentOrg.id));
    setIsPersonnelModalOpen(true);
  };

  const openAddLeaderPersonnelModal = () => {
    setLeaderPickerSearch('');
    setLeaderPickerPage(1);
    setIsLeaderActionMenuOpen(false);
    setIsLeaderPickerOpen(true);
  };

  const handleAssignExistingLeader = (person: PersonnelItem) => {
    if (isPersonLeaderOfOrg(currentOrg, person)) {
      triggerToast(`${person.realName}已是${currentOrg.name}的机构负责人`);
      setIsLeaderPickerOpen(false);
      return;
    }

    const currentLeaderIds = getOrgLeaderIds(currentOrg);
    const nextLeaderIds = Array.from(new Set([...currentLeaderIds, person.id]));
    const nextLeaderMeta = getLeaderMetaByIds(nextLeaderIds);

    setOrgNodes((prev) =>
      prev.map((node) =>
        node.id === currentOrg.id
          ? {
              ...node,
              ...nextLeaderMeta,
            }
          : node
      )
    );
    setPersonnelList((prev) =>
      prev.map((item) => (item.id === person.id ? { ...item, isLeader: true } : item))
    );
    setIsLeaderPickerOpen(false);
    triggerToast(`已将${person.realName}添加为${currentOrg.name}的机构负责人`);
  };

  const handleRemoveCurrentLeader = (skipConfirm = false) => {
    const removedLeaderIds = getOrgLeaderIds(currentOrg);
    if (removedLeaderIds.length === 0 && !currentOrg.leaderName) return;
    const leaderSummary = getOrgLeaderSummary(currentOrg) || currentOrg.leaderName;
    if (!skipConfirm && !confirm(`确定要取消「${currentOrg.name}」的机构负责人${leaderSummary}吗？人员账号不会被删除。`)) {
      return;
    }

    const nextOrgNodes = orgNodes.map((node) =>
      node.id === currentOrg.id
        ? { ...node, leaderName: '', leaderPhone: '', leaderPersonId: undefined, leaderPersonIds: [] }
        : node
    );
    setOrgNodes(nextOrgNodes);
    if (removedLeaderIds.length > 0) {
      setPersonnelList((prev) =>
        prev.map((person) =>
          removedLeaderIds.includes(person.id) && !personLeadsAnyOrg(person.id, nextOrgNodes)
            ? { ...person, isLeader: false }
            : person
        )
      );
    }
    setIsLeaderActionMenuOpen(false);
    triggerToast(`已取消${currentOrg.name}的全部机构负责人设置`);
  };

  const handleRemovePersonnelLeader = (person: PersonnelItem) => {
    const nextOrgNodes = orgNodes.map((node) => {
      if (node.id !== currentOrg.id) return node;
      const nextLeaderIds = getOrgLeaderIds(node).filter((leaderId) => leaderId !== person.id);
      const nextLeaderMeta = getLeaderMetaByIds(nextLeaderIds);
      return {
        ...node,
        ...nextLeaderMeta,
        leaderName: nextLeaderMeta.leaderName,
        leaderPhone: nextLeaderMeta.leaderPhone,
        leaderPersonId: nextLeaderMeta.leaderPersonId,
        leaderPersonIds: nextLeaderMeta.leaderPersonIds,
      };
    });

    setOrgNodes(nextOrgNodes);
    setPersonnelList((prev) =>
      prev.map((item) =>
        item.id === person.id && !personLeadsAnyOrg(person.id, nextOrgNodes)
          ? { ...item, isLeader: false }
          : item
      )
    );
    triggerToast(`已取消${person.realName}在${currentOrg.name}的负责人身份`);
  };

  const handleTogglePersonnelLeader = (person: PersonnelItem) => {
    if (isRootSelected) {
      triggerToast('平台根节点不支持直接设置负责人');
      return;
    }

    const isCurrentLeader = isPersonLeaderOfOrg(currentOrg, person);

    if (isCurrentLeader) {
      handleRemovePersonnelLeader(person);
    } else {
      handleAssignExistingLeader(person);
    }
  };

  const openOrgLeaderSelector = () => {
    setOrgLeaderSelectorSearch('');
    setOrgLeaderSelectorPage(1);
    setIsOrgLeaderSelectorOpen(true);
  };

  const closeOrgLeaderSelector = () => {
    setIsOrgLeaderSelectorOpen(false);
  };

  const selectOrgLeader = (person: PersonnelItem) => {
    setOrgLeaderPersonIdInput(person.id);
    setOrgLeaderNameInput(person.realName);
    setOrgLeaderPhoneInput(person.phone);
    setIsOrgLeaderSelectorOpen(false);
  };

  const clearOrgLeader = () => {
    setOrgLeaderPersonIdInput(undefined);
    setOrgLeaderNameInput('');
    setOrgLeaderPhoneInput('');
  };

  const openEditPersonnelModal = (item: PersonnelItem) => {
    setEditingPersonnel(item);
    setPUsername(item.username);
    setPRealName(item.realName);
    setPWechat(item.wechat);
    setPPhone(item.phone);
    setPRoles(item.roles && item.roles.length > 0 ? item.roles.filter((role) => ['管理员', '审核员', '上报员'].includes(role)) : []);
    setPOrgIds([...item.orgIds]);
    const initialPrimaryOrgId = item.primaryOrgId || item.orgIds[0] || '';
    setPPrimaryOrgId(initialPrimaryOrgId);
    const leaderOrgIds = orgNodes
      .filter((node) => isPersonLeaderOfOrg(node, item))
      .map((node) => node.id);
    setPLeaderOrgIds(leaderOrgIds.length > 0 ? leaderOrgIds : initialPrimaryOrgId ? [initialPrimaryOrgId] : []);
    setPOrgSearch('');
    setPOrgPickerOpen(false);
    const initialPrimaryOrg = getOrgById(initialPrimaryOrgId);
    setPCascaderCategoryId(initialPrimaryOrg?.categoryId || item.orgIds.map((id) => getOrgById(id)).find(Boolean)?.categoryId || 'cat-1');
    setPCascaderPath(initialPrimaryOrgId ? getOrgAncestorIds(initialPrimaryOrgId) : []);
    setIsPersonnelModalOpen(true);
  };

  const toggleOrgSelectionForPerson = (orgId: string) => {
    const isSelected = pOrgIds.includes(orgId);
    const nextOrgIds = isSelected ? pOrgIds.filter((id) => id !== orgId) : [...pOrgIds, orgId];
    setPOrgIds(nextOrgIds);
    if (isSelected && pPrimaryOrgId === orgId) {
      const nextPrimaryId = nextOrgIds[0] || '';
      setPPrimaryOrgId(nextPrimaryId);
      if (!nextPrimaryId) {
        setPLeaderOrgIds([]);
      }
      if (pLeaderOrgIds.includes(orgId)) {
        setPLeaderOrgIds((prev) => prev.filter((id) => id !== orgId));
      }
      return;
    }
    if (!isSelected && !pPrimaryOrgId) {
      setPPrimaryOrgId(nextOrgIds[0] || '');
    }
  };

  const toggleRoleSelectionForPerson = (role: string) => {
    if (!['管理员', '审核员', '上报员'].includes(role)) return;
    setPRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSavePersonnel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pUsername || !pRealName) return;
    if (pOrgIds.length === 0) {
      alert('请至少选择一个所属机构节点');
      return;
    }
    if (pRoles.length === 0) {
      alert('请至少选择一个账号角色');
      return;
    }
    const nextPrimaryOrgId = pPrimaryOrgId && pOrgIds.includes(pPrimaryOrgId) ? pPrimaryOrgId : pOrgIds[0];
    const nextLeaderOrgIds = pLeaderOrgIds.filter((orgId) => pOrgIds.includes(orgId));
    const allowedLabelNames = new Set(getPersonnelLabelOptionsByRoles(pRoles).map((option) => option.name));
    const nextLabels = (editingPersonnel?.labels || []).filter((label) => allowedLabelNames.has(label));

    const savedPersonId = editingPersonnel?.id ?? Date.now();
    const savedPhone = editingPersonnel ? pPhone : pPhone || '138****' + Math.floor(1000 + Math.random() * 9000);
    const nextIsLeader = nextLeaderOrgIds.length > 0;

    if (editingPersonnel) {
      setPersonnelList((prev) =>
        prev.map((p) =>
          p.id === editingPersonnel.id
            ? {
                ...p,
                username: pUsername,
                realName: pRealName,
                wechat: pWechat,
                phone: savedPhone,
                roles: pRoles,
                orgIds: pOrgIds,
                primaryOrgId: nextPrimaryOrgId,
                isLeader: nextIsLeader,
                labels: nextLabels,
              }
            : p
        )
      );
    } else {
      const newP: PersonnelItem = {
        id: savedPersonId,
        orgIds: pOrgIds,
        username: pUsername,
        realName: pRealName,
        wechat: pWechat || 'wx_' + Math.floor(Math.random() * 1000),
        phone: savedPhone,
        roles: pRoles,
        registerDate: new Date().toISOString().split('T')[0],
        status: '启用',
        primaryOrgId: nextPrimaryOrgId,
        isLeader: nextIsLeader,
        labels: [],
      };
      setPersonnelList((prev) => [...prev, newP]);
    }

    setOrgNodes((prev) =>
      prev.map((node) => {
        const wasLeaderOfNode = editingPersonnel ? isPersonLeaderOfOrg(node, editingPersonnel) : false;
        const shouldBeLeaderOfNode = nextLeaderOrgIds.includes(node.id);
        if (!wasLeaderOfNode && !shouldBeLeaderOfNode) return node;

        let nextLeaderIds = getOrgLeaderIds(node);
        if (editingPersonnel) {
          nextLeaderIds = nextLeaderIds.filter((leaderId) => leaderId !== editingPersonnel.id);
        }
        if (shouldBeLeaderOfNode) {
          nextLeaderIds = Array.from(new Set([...nextLeaderIds, savedPersonId]));
        }
        const nextLeaderMeta = getLeaderMetaByIds(nextLeaderIds);

        if (nextLeaderIds.length > 0) {
          return {
            ...node,
            ...nextLeaderMeta,
          };
        }

        return {
          ...node,
          leaderName: '',
          leaderPhone: '',
          leaderPersonId: undefined,
          leaderPersonIds: [],
        };
      })
    );

    setIsPersonnelModalOpen(false);
    triggerToast(editingPersonnel ? `已保存${pRealName}的信息` : `已新建人员${pRealName}`);
  };

  // Personnel Filtered for Selected Org or Root Platform
  const filteredPersonnel = personnelList.filter((p) => {
    if (!isRootSelected) {
      const belongsToSelected = p.orgIds.includes(selectedOrgId);
      if (!belongsToSelected) return false;
    }

    if (personnelSearch) {
      const q = personnelSearch.toLowerCase();
      return (
        p.realName.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.roles && p.roles.some((r) => r.toLowerCase().includes(q)))
      );
    }
    return true;
  });

  const filteredLeaderCandidates = personnelList.filter((person) => {
    const query = leaderPickerSearch.trim().toLowerCase();
    if (!query) return true;
    return person.realName.toLowerCase().includes(query) || person.phone.toLowerCase().includes(query);
  });
  const leaderPickerPageSize = 5;
  const leaderPickerTotalPages = Math.max(1, Math.ceil(filteredLeaderCandidates.length / leaderPickerPageSize));
  const currentLeaderPickerPage = Math.min(leaderPickerPage, leaderPickerTotalPages);
  const pagedLeaderCandidates = filteredLeaderCandidates.slice(
    (currentLeaderPickerPage - 1) * leaderPickerPageSize,
    currentLeaderPickerPage * leaderPickerPageSize
  );
  const filteredOrgLeaderCandidates = personnelList.filter((person) => {
    const query = orgLeaderSelectorSearch.trim().toLowerCase();
    if (!query) return true;
    return person.realName.toLowerCase().includes(query) || person.phone.toLowerCase().includes(query);
  });
  const orgLeaderSelectorPageSize = 4;
  const orgLeaderSelectorTotalPages = Math.max(
    1,
    Math.ceil(filteredOrgLeaderCandidates.length / orgLeaderSelectorPageSize)
  );
  const currentOrgLeaderSelectorPage = Math.min(orgLeaderSelectorPage, orgLeaderSelectorTotalPages);
  const pagedOrgLeaderCandidates = filteredOrgLeaderCandidates.slice(
    (currentOrgLeaderSelectorPage - 1) * orgLeaderSelectorPageSize,
    currentOrgLeaderSelectorPage * orgLeaderSelectorPageSize
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case '管理员':
        return 'bg-blue-100/80 text-blue-700 border border-blue-200';
      case '审核员':
        return 'bg-amber-100/80 text-amber-700 border border-amber-200';
      case '上报员':
        return 'bg-emerald-100/80 text-emerald-700 border border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  // Helper function to render org tree recursively
  const renderOrgTreeNodes = (parentId: string | null = null, depth = 0) => {
    const nodes = getSortedOrgChildren(parentId, undefined);

    if (nodes.length === 0) return null;

    return (
      <div className={`space-y-0.5 ${depth > 0 ? 'pl-3.5 border-l border-gray-200/60 ml-2.5 my-0.5' : ''}`}>
        {nodes.map((node) => {
          const children = getSortedOrgChildren(node.id, undefined);
          const hasChildren = children.length > 0;
          const isNodeExpanded = expandedNodes[node.id] || !!treeSearch;
          const isSelected = selectedOrgId === node.id;

          // Search match logic
          if (
            treeSearch &&
            !node.name.toLowerCase().includes(treeSearch.toLowerCase()) &&
            !children.some((c) => c.name.toLowerCase().includes(treeSearch.toLowerCase()))
          ) {
            return null;
          }

          return (
            <div key={node.id}>
              {(() => {
                const flowStatus = getOrgAuditFlowStatus(node);
                return (
              <div
                onClick={() => {
                  setSelectedOrgId(node.id);
                  setIsRootSelected(false);
                  setViewingPersonnelId(null);
                }}
                className={`group/org flex items-center justify-between py-1.5 px-2 rounded cursor-pointer transition-colors ${
                  isSelected && !isRootSelected
                    ? 'bg-blue-50 text-[#1E5ABB] font-bold shadow-2xs'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                  {hasChildren ? (
                    <button
                      onClick={(e) => toggleNodeExpand(node.id, e)}
                      className="p-0.5 hover:bg-gray-200/60 rounded text-gray-400"
                    >
                      {isNodeExpanded ? (
                        <ChevronDown className="w-3 h-3 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-gray-500" />
                      )}
                    </button>
                  ) : (
                    <span className="w-4 shrink-0" />
                  )}

                  <Building2
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-[#1E5ABB]' : depth === 0 ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  />

                  <span className="truncate text-xs" title={node.name}>{node.name}</span>

                  <span
                    title={`${flowStatus.title} / 排序 ${node.sortOrder}`}
                    aria-label={`${flowStatus.title} / 排序 ${node.sortOrder}`}
                    className="inline-flex items-center gap-1 shrink-0"
                  >
                    <span className={`w-2 h-2 rounded-full ${flowStatus.dotClassName}`} />
                    <span className="text-[10px] font-mono font-bold text-gray-400 leading-none">
                      {node.sortOrder}
                    </span>
                  </span>

                </div>

                {/* Node Hover Actions */}
                <div className={`${isSelected ? 'opacity-100' : 'opacity-0 group-hover/org:opacity-100'} flex items-center space-x-1 transition-opacity shrink-0`}>
                  <button
                    type="button"
                    onClick={(e) => openAddOrgModal(node.categoryId, node.id, e)}
                    title="添加下级子机构"
                    className="p-0.5 hover:bg-blue-100 text-blue-700 rounded cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => openEditOrgModal(node, e)}
                    title="编辑此机构节点"
                    className="p-0.5 hover:bg-gray-200 text-gray-600 rounded cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteOrgNode(node, e)}
                    title="删除此机构节点"
                    className="p-0.5 hover:bg-rose-100 text-rose-600 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
                );
              })()}

              {/* Child Nodes */}
              {hasChildren && isNodeExpanded && renderOrgTreeNodes(node.id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  const selectedOrgPath = getOrgPath(currentOrg.id);
  const directSubCount = getDirectSubNodes(currentOrg.id).length;
  const allSubCount = getAllDescendantIds(currentOrg.id).length;

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">组织架构管理</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          支持多层级无限树节点架构、每个节点支持多机构人员关联绑定
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Side: Tree Navigation Card */}
        <div className="w-full lg:w-80 bg-white rounded-lg border border-gray-200/80 shadow-2xs p-4 flex flex-col space-y-3 shrink-0">
          {/* Search filter and tree actions */}
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <div className="relative flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={treeSearch}
                onChange={(e) => setTreeSearch(e.target.value)}
                placeholder="搜索各级机构..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-gray-50/50"
              />
            </div>
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                onClick={toggleAllExpand}
                className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                  isAllExpanded
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    : 'bg-blue-50 text-[#1E5ABB] hover:bg-blue-100 border border-blue-200'
                }`}
                title={isAllExpanded ? "收起所有节点" : "展开所有节点"}
              >
                {isAllExpanded ? (
                  <>
                    <ChevronsDownUp className="w-3.5 h-3.5 text-slate-600" />
                    <span>收起</span>
                  </>
                ) : (
                  <>
                    <ChevronsUpDown className="w-3.5 h-3.5 text-[#1E5ABB]" />
                    <span>展开</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dynamic Tree List */}
          <div className="space-y-1.5 text-xs text-gray-700 max-h-[640px] overflow-y-auto pr-1">
            <div
              role="button"
              tabIndex={0}
              onMouseEnter={() => setIsAllExpanded(true)}
              onClick={() => {
                setIsRootSelected(true);
                setViewingPersonnelId(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setIsRootSelected(true);
                  setViewingPersonnelId(null);
                }
              }}
              className={`group w-full px-2 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                isRootSelected
                  ? 'bg-blue-100 text-[#1E5ABB] ring-1 ring-[#1E5ABB]/30 shadow-2xs'
                  : 'text-gray-800 hover:bg-gray-100 hover:text-[#1E5ABB]'
              }`}
              title="点击查看台中市网信办 (平台基础信息)"
            >
              <span className="flex min-w-0 flex-1 items-center space-x-1.5">
                <Building2 className={`w-3.5 h-3.5 ${isRootSelected ? 'text-[#1E5ABB]' : 'text-gray-500'}`} />
                <span className="truncate">台中市网信办</span>
                <span title={rootNodeAuditConfig.label} aria-label={rootNodeAuditConfig.label} className="inline-flex items-center shrink-0">
                  <span className={`w-2 h-2 rounded-full ${rootNodeAuditConfig.dotClassName}`} />
                </span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openAddOrgModal(categories[0]?.id || 'cat-1', null, e);
                }}
                className={`ml-1 p-0.5 rounded text-blue-700 hover:bg-blue-100 cursor-pointer shrink-0 transition-opacity ${
                  isRootSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
                title="新增一级机构"
                aria-label="新增一级机构"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="ml-2 border-l border-gray-100 pl-2 space-y-1.5">
              {orgNodes.some((o) => !o.parentId) ? (
                renderOrgTreeNodes(null, 0)
              ) : (
                <div className="py-1 pl-2 text-[11px] text-gray-400 italic">尚无机构</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Main Area */}
        <div className="flex-1 space-y-4 min-w-0">
          {viewingPersonnel ? (
          <div className="bg-white rounded-lg border border-gray-200/80 shadow-2xs overflow-hidden min-h-[calc(100vh-220px)] flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={closePersonnelDetail}
                  className="h-8 w-8 rounded-md border border-gray-200 bg-white text-gray-500 hover:text-[#1E5ABB] hover:border-blue-200 hover:bg-blue-50 flex items-center justify-center cursor-pointer transition-colors"
                  title="返回人员列表"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#1E5ABB] flex items-center justify-center text-sm font-bold shrink-0">
                  {viewingPersonnel.realName.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{viewingPersonnel.realName}</h3>
                    <span className="text-[11px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded shrink-0">
                      {viewingPersonnel.roles.length > 0 ? viewingPersonnel.roles.join('、') : '未设置角色'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] font-bold shrink-0 ${
                        viewingPersonnel.status === '启用'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          viewingPersonnel.status === '启用' ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}
                      />
                      {viewingPersonnel.status}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-gray-500 flex items-center gap-3">
                    <span className="font-mono">{viewingPersonnel.phone}</span>
                    <span>登记于 {viewingPersonnel.registerDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openEditPersonnelModal(viewingPersonnel)}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                  <span>编辑人员</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleResetPassword(viewingPersonnel)}
                  className="px-3 py-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded hover:bg-amber-100 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>重置密码</span>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4 flex-1">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 space-y-4">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-800 flex items-center gap-1">
                      <IdCard className="w-3.5 h-3.5 text-[#1E5ABB]" />
                      <span>基本信息</span>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
                      <div>
                        <div className="text-gray-400 mb-1">账号名称</div>
                        <div className="font-mono text-gray-800">{viewingPersonnel.username}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 mb-1">真实姓名</div>
                        <div className="font-bold text-gray-900">{viewingPersonnel.realName}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 mb-1">手机号</div>
                        <div className="font-mono text-gray-800">{viewingPersonnel.phone}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 mb-1">微信号</div>
                        <div className="font-mono text-gray-800">{viewingPersonnel.wechat}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 mb-1">登记时间</div>
                        <div className="font-mono text-gray-800">{viewingPersonnel.registerDate}</div>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-3">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="text-xs font-bold text-gray-800">其他信息</div>
                        <div className="text-[10px] text-gray-400">激活采集字段</div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
                        {viewingActivationFields.map((field) => (
                          <div key={field.label}>
                            <div className="text-gray-400 mb-1">{field.label}</div>
                            <div className="text-gray-800 font-mono truncate">{field.value || '未采集'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>关联机构</span>
                    </div>
                    <div className="p-4 space-y-2">
                      {viewingPersonnelOrgs.map((org) => (
                        <div key={org.id} className="rounded-md border border-gray-200 p-3 text-xs flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-bold text-gray-800 truncate">{org.name}</div>
                            <div className="mt-1 text-[11px] text-gray-400 font-mono">{org.code || '暂无编码'}</div>
                          </div>
                          <div className="text-[10px] text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded shrink-0">
                            {org.parentId ? '下级机构' : '一级机构'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          ) : (
          <>
          {/* Selected Org Node Detail or Root Platform Basic Info Header Card */}
          {isRootSelected ? (
            <div className="bg-white rounded-lg border border-gray-200/80 shadow-2xs p-4 space-y-3.5">
              {/* Title Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-base font-bold text-gray-800 min-w-0">
                  <Building2 className="w-5 h-5 text-[#1E5ABB] shrink-0" />
                  <span className="truncate">台中市网信办</span>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>正式版</span>
                  </span>
                  <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 shrink-0 flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-[#1E5ABB]" />
                    <span>服务时间：2024-01-01 ~ 2028-12-31</span>
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 shrink-0 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>剩余 872 天</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openAddOrgModal(categories[0]?.id || 'cat-1', null)}
                  className="inline-flex items-center gap-1 rounded border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#1E5ABB] hover:bg-blue-100 cursor-pointer"
                  title="在根节点下新增一级机构"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>新增一级机构</span>
                </button>
              </div>

              {/* Platform Basic Info Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                {/* 1. 节点审核 */}
                <div className={`bg-gradient-to-br p-3 rounded-lg border space-y-2 min-w-0 ${rootNodeAuditConfig.panelClassName}`}>
                  <div className="text-xs text-gray-500 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1 min-w-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#1E5ABB] shrink-0" />
                      <span className="truncate">节点审核</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleRootNodeAudit}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 transition-colors cursor-pointer shrink-0 ${
                        rootNodeAuditStatus === 'enabled'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-[#1E5ABB] hover:border-blue-200'
                      }`}
                      title={rootNodeAuditStatus === 'enabled' ? '关闭节点审核' : '开启节点审核'}
                      aria-label={rootNodeAuditStatus === 'enabled' ? '关闭节点审核' : '开启节点审核'}
                    >
                      <span className="text-[10px] font-bold">{rootNodeAuditStatus === 'enabled' ? '启用' : '停用'}</span>
                      <div
                        className={`w-7 h-3.5 flex items-center rounded-full p-0.5 transition-colors ${
                          rootNodeAuditStatus === 'enabled' ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 bg-white rounded-full shadow-2xs"></div>
                      </div>
                    </button>
                  </div>
                  <div className="text-[11px] leading-snug text-gray-500 truncate" title={rootNodeAuditHint}>
                    {rootNodeAuditHint}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAuditFlowPreviewOpen(true)}
                    title="展示该系列结构的审核流程"
                    aria-label="展示该系列结构的审核流程"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1E5ABB] hover:text-[#134092] cursor-pointer"
                  >
                    流程详情
                  </button>
                </div>

                {/* 2. 平台运营联系人 */}
                <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/30 p-3 rounded-lg border border-amber-100/90 space-y-1">
                  <div className="text-xs text-gray-500 flex items-center space-x-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>平台运营联系人</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 pt-0.5">张三</div>
                  <div className="text-[11px] text-gray-500 font-mono flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span>13800138000</span>
                  </div>
                </div>

                {/* 3. 子机构总数 */}
                <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-3 rounded-lg border border-blue-100/90 space-y-1">
                  <div className="text-xs text-gray-500 flex items-center space-x-1">
                    <Building className="w-3.5 h-3.5 text-[#1E5ABB]" />
                    <span>子机构总数</span>
                  </div>
                  <div className="flex items-baseline space-x-1 pt-0.5">
                    <span className="text-xl font-bold text-[#1E5ABB]">{orgNodes.length}</span>
                    <span className="text-xs text-gray-500">个机构节点</span>
                  </div>
                  <div className="text-[10px] text-gray-400">按机构层级直接展示</div>
                </div>

                {/* 4. 二维码总数 */}
                <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/30 p-3 rounded-lg border border-indigo-100/90 space-y-1.5">
                  <div className="text-xs text-gray-500 flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                      <span>二维码总数</span>
                    </div>
                    <span className="text-[10px] text-indigo-600 font-bold font-mono">
                      {((qrUsedCount / 10000) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xl font-bold text-indigo-950">10,000</span>
                    <span className="text-xs text-gray-500">个</span>
                  </div>
                  <div className="space-y-1 pt-0.5">
                    <div className="w-full bg-indigo-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0.2, (qrUsedCount / 10000) * 100))}%` }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-indigo-600 font-medium font-mono flex justify-between">
                      <span>已用 {qrUsedCount} 个</span>
                      <span>剩余 {10000 - qrUsedCount} 个</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Selected Org Node Detail Header Card */
            <div className="bg-white rounded-lg border border-gray-200/80 shadow-2xs p-4 space-y-3">
            {/* Optimized Clean Breadcrumb Path */}
            <div className="flex items-center space-x-1 text-xs text-gray-500 overflow-x-auto pb-2 border-b border-gray-100">
              {selectedOrgPath.map((node, index) => (
                <React.Fragment key={node.id}>
                  {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                  <button
                    onClick={() => {
                      setViewingPersonnelId(null);
                      setSelectedOrgId(node.id);
                    }}
                    className={`hover:text-[#1E5ABB] cursor-pointer whitespace-nowrap transition-colors ${
                      node.id === currentOrg.id
                        ? 'text-[#1E5ABB] font-bold bg-blue-50/70 px-1.5 py-0.5 rounded'
                        : 'text-gray-600 hover:underline'
                    }`}
                  >
                    {node.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Header Main Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center space-x-2 text-base font-bold text-gray-800 min-w-0">
                <Building2 className="w-5 h-5 text-[#1E5ABB] shrink-0" />
                <span className="truncate">{currentOrg.name}</span>
                {currentOrg.parentId ? (
                  <span className="text-[11px] font-normal text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 shrink-0">
                    下级机构
                  </span>
                ) : (
                  <span className="text-[11px] font-normal text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 shrink-0">
                    一级机构
                  </span>
                )}
                {inlineSortEditingOrgId === currentOrg.id ? (
                  <span className="text-[11px] font-medium text-slate-700 bg-white px-2 py-0.5 rounded-full border border-[#1E5ABB]/40 shrink-0 flex items-center space-x-1">
                    <ChevronsUpDown className="w-3 h-3 text-[#1E5ABB]" />
                    <span>排序</span>
                    <input
                      type="number"
                      autoFocus
                      value={inlineSortOrderInput}
                      onChange={(e) => setInlineSortOrderInput(e.target.value)}
                      onBlur={saveInlineSortEditor}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                        if (e.key === 'Escape') {
                          setInlineSortEditingOrgId(null);
                        }
                      }}
                      className="w-12 bg-transparent text-center font-mono font-bold text-[#1E5ABB] outline-none"
                    />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => openInlineSortEditor(currentOrg)}
                    className="text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-[#1E5ABB] px-2.5 py-0.5 rounded-full border border-slate-200 hover:border-blue-200 shrink-0 flex items-center space-x-1 cursor-pointer transition-colors"
                    title="点击修改排序值"
                  >
                    <ChevronsUpDown className="w-3 h-3 text-slate-500" />
                    <span>排序 {currentOrg.sortOrder}</span>
                  </button>
                )}
                <span
                  className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border shrink-0 flex items-center space-x-1 ${
                    currentOrg.allowSubOrgCreation
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-gray-500 bg-gray-100 border-gray-200'
                  }`}
                >
                  {currentOrg.allowSubOrgCreation ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Lock className="w-3 h-3 text-gray-400" />
                  )}
                  <span>{currentOrg.allowSubOrgCreation ? '下级可新增' : '禁止下级新增'}</span>
                </span>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => {
                    setIsQrGenerateConfirmOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs bg-[#1E5ABB] hover:bg-[#134092] text-white rounded font-bold flex items-center space-x-1.5 cursor-pointer transition-colors shadow-2xs shrink-0"
                  title="下发当前机构的二维码"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-300" />
                  <span>下发二维码</span>
                </button>
                <button
                  onClick={() => {
                    openAddOrgModal(currentOrg.categoryId, currentOrg.id);
                  }}
                  className="px-3 py-1.5 text-xs bg-blue-50 text-[#1E5ABB] border border-blue-200 rounded hover:bg-blue-100 font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                  title="在此节点下方新增子机构"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>新增子机构</span>
                </button>
                <button
                  onClick={() => {
                    openEditOrgModal(currentOrg);
                  }}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                  <span>编辑机构</span>
                </button>
              </div>
            </div>

            {/* Stat Cards Grid */}
              <div className="grid grid-cols-3 gap-3.5 pt-1 min-w-0">

              {/* Node Audit Switch */}
              <div className={`bg-gradient-to-br p-3 rounded-lg border space-y-2 ${nodeAuditConfig.panelClassName}`}>
                <div className="text-xs text-gray-500 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1 min-w-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1E5ABB] shrink-0" />
                    <span>节点审核</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleNodeAudit}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 transition-colors cursor-pointer ${
                      nodeAuditStatus === 'enabled'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-[#1E5ABB] hover:border-blue-200'
                    }`}
                    title={nodeAuditStatus === 'enabled' ? '关闭节点审核' : '开启节点审核'}
                    aria-label={nodeAuditStatus === 'enabled' ? '关闭节点审核' : '开启节点审核'}
                  >
                    <span className="text-[10px] font-bold">{nodeAuditStatus === 'enabled' ? '启用' : '停用'}</span>
                    <div
                      className={`w-7 h-3.5 flex items-center rounded-full p-0.5 transition-colors ${
                        nodeAuditStatus === 'enabled' ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'
                      }`}
                    >
                      <div className="w-2.5 h-2.5 bg-white rounded-full shadow-2xs"></div>
                    </div>
                  </button>
                </div>
                <div className="text-[11px] leading-snug text-gray-500 truncate" title={nodeAuditConfig.hint}>
                  {nodeAuditConfig.hint}
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuditFlowPreviewOpen(true)}
                  title="展示该系列结构的审核流程"
                  aria-label="展示该系列结构的审核流程"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1E5ABB] hover:text-[#134092] cursor-pointer"
                >
                  流程详情
                </button>
              </div>

              {/* Sub-node count */}
              <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-100 space-y-1 min-w-0">
                <div className="text-xs text-gray-400">下级子机构</div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-lg font-bold text-gray-800">{directSubCount}</span>
                  <span className="text-xs text-gray-500">个直属</span>
                  {allSubCount > directSubCount && (
                    <span className="text-[11px] text-gray-400 ml-1">
                      (共{allSubCount}个)
                    </span>
                  )}
                </div>
              </div>

              {/* Current Org Node QR Stat Card & Usage Progress */}
              <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/30 p-3 rounded-lg border border-indigo-100/90 space-y-1.5 min-w-0">
                <div className="text-xs text-gray-500 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <QrCode className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>二维码总数</span>
                  </div>
                  <span className="text-[10px] text-indigo-600 font-bold font-mono">
                    {qrQuotaType === 'limit'
                      ? `${((qrUsedCount / qrLimitCount) * 100).toFixed(1)}%`
                      : '100%'}
                  </span>
                </div>

                <div className="flex items-baseline space-x-1">
                  <span className="text-xl font-bold text-indigo-950">
                    {qrQuotaType === 'limit' ? qrLimitCount.toLocaleString() : '不限'}
                  </span>
                  {qrQuotaType === 'limit' && <span className="text-xs text-gray-500">个</span>}
                </div>

                <div className="space-y-1 pt-0.5">
                  <div className="w-full bg-indigo-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          qrQuotaType === 'limit'
                            ? Math.min(100, Math.max(0.2, (qrUsedCount / qrLimitCount) * 100))
                            : 100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-indigo-600 font-medium font-mono flex justify-between">
                    <span>已用 {qrUsedCount} 个</span>
                    <span>
                      {qrQuotaType === 'limit'
                        ? `剩余 ${Math.max(0, qrLimitCount - qrUsedCount)} 个`
                        : '剩余 不限'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* Personnel Table Card */}
          <div className="bg-white rounded-lg border border-gray-200/80 shadow-2xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800">
                  <span>
                    {isRootSelected
                      ? '『台中市网信办 (全平台)』在册人员账号'
                      : `『${currentOrg.name}』关联人员账号`}
                  </span>
                  <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-[#1E5ABB]">
                    {filteredPersonnel.length} 人
                  </span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {isRootSelected
                    ? '（全平台人员汇总列表，人员可跨多机构兼属管理）'
                    : '（提示：人员可兼属多个机构节点，编辑人员可跨机构多选关联）'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={personnelSearch}
                    onChange={(e) => setPersonnelSearch(e.target.value)}
                    placeholder="搜索姓名/账号/手机号"
                    className="pl-8 pr-3 py-1 text-xs border border-gray-300 rounded w-48 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                  />
                </div>
                <button
                  onClick={openAddPersonnelModal}
                  className="px-3.5 py-1 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold rounded shadow-2xs flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>新增人员</span>
                </button>
              </div>
            </div>

            {/* Personnel Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 border-y border-gray-200 font-medium">
                    <th className="py-2.5 px-3 text-center w-12">序号</th>
                    <th className="py-2.5 px-3">账号名称</th>
                    <th className="py-2.5 px-3">真实姓名</th>
                    <th className="py-2.5 px-3">所属机构</th>
                    <th className="py-2.5 px-3">微信号</th>
                    <th className="py-2.5 px-3">手机号</th>
                    <th className="py-2.5 px-3">角色</th>
                    <th className="py-2.5 px-3">标签</th>
                    <th className="py-2.5 px-3">登记时间</th>
                    <th className="py-2.5 px-3 text-center">状态</th>
                    <th className="py-2.5 px-3 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredPersonnel.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-gray-400">
                        当前节点暂无绑定的关联账号，点击右上角“新增人员”添加或调整归属
                      </td>
                    </tr>
                  ) : (
                    filteredPersonnel.map((item, index) => (
                      <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="py-2.5 px-3 text-center text-gray-400 font-mono">
                          {index + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-800 font-medium">
                          {item.username}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col items-start space-y-0.5">
                            <span className="font-bold text-gray-900">{item.realName}</span>
                          </div>
                        </td>
                        {/* Multiple Orgs Badges */}
                        <td className="py-2.5 px-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {item.orgIds.map((oId) => {
                              const oNode = orgNodes.find((n) => n.id === oId);
                              const isCurrent = oId === selectedOrgId;
                              return (
                                <span
                                  key={oId}
                                  className={`px-1.5 py-0.5 rounded text-[10px] border ${
                                    isCurrent
                                      ? 'bg-blue-50 text-[#1E5ABB] border-blue-200 font-semibold'
                                      : 'bg-gray-100 text-gray-600 border-gray-200'
                                  }`}
                                >
                                  {oNode ? oNode.name : oId}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-500">{item.wechat}</td>
                        <td className="py-2.5 px-3 font-mono text-gray-600">{item.phone}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-wrap gap-1">
                            {(item.roles || []).map((r) => (
                              <span
                                key={r}
                                className={`px-2 py-0.5 rounded text-[10px] font-medium ${getRoleBadge(
                                  r
                                )}`}
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {getPersonnelDisplayLabels(item).length > 0 ? (
                              getPersonnelDisplayLabels(item).map((label) => (
                                <button
                                  key={label}
                                  type="button"
                                  onClick={(e) => openPersonnelLabelPicker(item, e.currentTarget)}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer transition-colors"
                                  title={`点击修改标签：${label}`}
                                >
                                  {label}
                                </button>
                              ))
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => openPersonnelLabelPicker(item, e.currentTarget)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-white text-[#1E5ABB] border border-blue-200 hover:bg-blue-50 cursor-pointer transition-colors font-bold"
                                title="新增标签"
                              >
                                <Plus className="w-3 h-3" />
                                <span>新增标签</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-400">{item.registerDate}</td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleTogglePersonnelStatus(item.id)}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 transition-colors cursor-pointer ${
                              item.status === '启用'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-[#1E5ABB] hover:border-blue-200'
                            }`}
                            title={item.status === '启用' ? '停用账号' : '启用账号'}
                          >
                            <span className="text-[10px] font-bold">{item.status}</span>
                            <div
                              className={`w-7 h-3.5 flex items-center rounded-full p-0.5 transition-colors ${
                                item.status === '启用' ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'
                              }`}
                            >
                              <div className="w-2.5 h-2.5 bg-white rounded-full shadow-2xs"></div>
                            </div>
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => openPersonnelDetail(item)}
                              title="查看人员详情"
                              className="text-[#1E5ABB] hover:text-[#134092] cursor-pointer p-1 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditPersonnelModal(item)}
                              title="编辑多机构归属及个人信息"
                              className="text-gray-400 hover:text-blue-600 cursor-pointer p-1 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePersonnel(item.id)}
                              title="删除账号"
                              className="text-gray-400 hover:text-rose-600 cursor-pointer p-1 hover:bg-rose-50 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2 border-t border-gray-100">
              <div>共 {filteredPersonnel.length} 条记录</div>
              <div className="flex items-center space-x-1">
                <button className="px-2 py-0.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 text-gray-400">
                  &lt;
                </button>
                <button className="px-2.5 py-0.5 bg-[#1E5ABB] text-white font-bold rounded">1</button>
                <button className="px-2 py-0.5 border border-gray-200 rounded hover:bg-gray-50 text-gray-600">
                  &gt;
                </button>
              </div>
            </div>
          </div>
          </>
          )}
        </div>
      </div>

      {isPersonnelLabelPickerOpen && personnelLabelPickerPersonId !== null && typeof document !== 'undefined' && (() => {
        const pickerPerson = personnelList.find((person) => person.id === personnelLabelPickerPersonId);
        if (!pickerPerson) return null;
        const selectedLabels = getPersonnelDisplayLabels(pickerPerson);
        const labelGroups = (['上报员', '审核员'] as Array<'上报员' | '审核员'>).filter((group) =>
          pickerPerson.roles.includes(group)
        );

        return createPortal(
          <div
            className="fixed inset-0 z-[80]"
            onClick={closePersonnelLabelPicker}
          >
            <div
              className="fixed w-80 rounded-lg border border-gray-200 bg-white shadow-2xl overflow-hidden"
              style={{
                top: `${personnelLabelPickerPosition.top}px`,
                left: `${personnelLabelPickerPosition.left}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-800">人员标签</div>
                  <div className="text-[10px] text-gray-400 truncate">{pickerPerson.realName}</div>
                </div>
                <button
                  type="button"
                  onClick={closePersonnelLabelPicker}
                  className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-white cursor-pointer"
                  title="关闭"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-3 space-y-3 max-h-72 overflow-y-auto">
                {labelGroups.length > 0 ? labelGroups.map((group) => {
                  const groupOptions = PERSONNEL_LABEL_OPTIONS.filter((option) => option.group === group);
                  return (
                    <div key={group} className="space-y-1.5">
                      <div className="text-[10px] font-bold text-gray-400">{group}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {groupOptions.map((option) => {
                          const isSelected = selectedLabels.includes(option.name);
                          return (
                            <button
                              key={option.name}
                              type="button"
                              onClick={() => togglePersonnelLabel(pickerPerson.id, option.name)}
                              className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] border transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                                  : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-[#1E5ABB] hover:border-blue-200'
                              }`}
                              title={isSelected ? '再次点击取消该标签' : '点击选中该标签'}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                              <span>{option.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="rounded border border-gray-100 bg-gray-50 px-3 py-4 text-center text-xs text-gray-400">
                    当前账号角色未包含上报员或审核员
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {/* ----------------- MODALS ----------------- */}

      {isAuditFlowPreviewOpen && (
        (() => {
          const previewData = buildAuditFlowDetailData();

          return (
            <div
              className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
              onClick={() => setIsAuditFlowPreviewOpen(false)}
            >
              <div
                className="bg-white max-w-[calc(100vw-16px)] max-h-[86vh] rounded-lg shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col overflow-hidden"
                style={{ width: previewData.panelWidth }}
                onClick={e => e.stopPropagation()}
              >
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
                  <h3 className="text-sm font-bold text-gray-800">该系列结构审核流程</h3>
                  <button
                    type="button"
                    onClick={() => setIsAuditFlowPreviewOpen(false)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    title="关闭"
                    aria-label="关闭"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 text-xs overflow-y-auto">
                  <div className="space-y-2">
                    {renderAuditFlowTree(previewData.flowTreeRoot)}
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAuditFlowPreviewOpen(false)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 border border-gray-300 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>关闭</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* 1. Category Modal (Add / Edit) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-800">
                {editingCategory ? '修改组织分类名称' : '新增组织分类'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">分类名称 *</label>
                <input
                  type="text"
                  required
                  value={categoryNameInput}
                  onChange={(e) => setCategoryNameInput(e.target.value)}
                  placeholder="例如: 党委系统、高等院校、重点企业"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1E5ABB] text-white rounded font-bold hover:bg-[#134092] cursor-pointer"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Org Node Modal (Add / Edit Node with Leader & Unlimited Parent) */}
      {isOrgModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-visible animate-in fade-in zoom-in-95">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-800">
                {editingOrgNode ? '编辑机构节点' : '新增子机构'}
              </h3>
              <button
                onClick={() => {
                  setIsOrgLeaderSelectorOpen(false);
                  setIsOrgModalOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOrgNode} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 gap-3">
                <div className="relative">
                  <label className="block text-gray-700 font-medium mb-1">父级机构节点</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={orgParentSearch}
                      onFocus={() => setOrgParentPickerOpen(true)}
                      onClick={() => setOrgParentPickerOpen(true)}
                      onChange={(e) => {
                        setOrgParentSearch(e.target.value);
                        setOrgParentPickerOpen(true);
                      }}
                      placeholder={
                        orgParentIdInput
                          ? getOrgPathText(orgParentIdInput)
                          : '(无父节点 - 作为顶级一级机构)'
                      }
                      className="w-full pl-8 pr-8 py-1.5 border border-gray-300 rounded font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white"
                    />
                    {(orgParentSearch || orgParentIdInput) && (
                      <button
                        type="button"
                        onClick={() => {
                          setOrgParentSearch('');
                          setOrgParentIdInput('');
                          setOrgParentCascaderPath([]);
                          setOrgParentPickerOpen(false);
                        }}
                        className="absolute right-2 top-1.5 h-5 w-5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
                        title="清空父级机构"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {orgParentPickerOpen && (
                      <div className="absolute z-[70] left-0 top-full mt-1 w-max max-w-[min(760px,calc(100vw-96px))] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xl">
                        {(() => {
                          const parentSearchQuery = orgParentSearch.trim().toLowerCase();
                          const disabledOrgId = editingOrgNode?.id;
                          const nodeMatchesSearch = (node: OrgNode) =>
                            !parentSearchQuery ||
                            node.name.toLowerCase().includes(parentSearchQuery) ||
                            (node.code || '').toLowerCase().includes(parentSearchQuery);
                          const hasMatchingDescendant = (node: OrgNode): boolean =>
                            orgNodes
                              .filter((o) => o.parentId === node.id && o.id !== disabledOrgId)
                              .some((child) => nodeMatchesSearch(child) || hasMatchingDescendant(child));
                          const shouldShowNode = (node: OrgNode) =>
                            node.id !== disabledOrgId &&
                            (!parentSearchQuery || nodeMatchesSearch(node) || hasMatchingDescendant(node));
                          const pathNodes = orgParentCascaderPath
                            .map((id) => getOrgById(id))
                            .filter((node): node is OrgNode => !!node && shouldShowNode(node));
                          const cascaderColumns: Array<{ key: string; nodes: OrgNode[] }> = [
                            {
                              key: 'root',
                              nodes: getSortedOrgChildren(null, undefined, disabledOrgId),
                            },
                            ...pathNodes.map((node) => ({
                              key: node.id,
                              nodes: getSortedOrgChildren(node.id, undefined, disabledOrgId),
                            })),
                          ].filter((column) => column.nodes.some(shouldShowNode));
                        const hasAnyMatch = orgNodes.some((node) => shouldShowNode(node));
                        const renderParentOrgRow = (node: OrgNode, level: number) => {
                          if (!shouldShowNode(node)) return null;
                          const hasChildren = getSortedOrgChildren(node.id, undefined).some((child) => shouldShowNode(child));
                          const isSelected = orgParentIdInput === node.id;
                          const isExpanded = orgParentCascaderPath[level] === node.id;
                            return (
                              <button
                                key={node.id}
                                type="button"
                                onClick={() => {
                                  setOrgParentIdInput(node.id);
                                  setOrgParentSearch('');
                                  setOrgParentCascaderPath((prev) => [...prev.slice(0, level), node.id]);
                                }}
                                className={`w-full h-8 px-2 flex items-center justify-between gap-2 text-left text-xs hover:bg-blue-50 cursor-pointer ${
                                  isExpanded || isSelected ? 'bg-blue-50 text-[#1E5ABB] font-bold' : 'text-gray-700'
                                }`}
                              >
                                <span className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                      isSelected ? 'border-[#1E5ABB] bg-[#1E5ABB]' : 'border-gray-300 bg-white'
                                    }`}
                                  >
                                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </span>
                                  <Building2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#1E5ABB]' : 'text-gray-400'}`} />
                                  <span className="truncate">{node.name}</span>
                                </span>
                                <span className="flex items-center gap-1 shrink-0">
                                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1E5ABB]" />}
                                  {hasChildren && <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                                </span>
                              </button>
                            );
                          };

                          return hasAnyMatch ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setOrgParentIdInput('');
                                  setOrgParentSearch('');
                                  setOrgParentCascaderPath([]);
                                  setOrgParentPickerOpen(false);
                                }}
                                className={`w-full h-8 px-2 flex items-center justify-between text-left text-xs border-b border-gray-100 hover:bg-blue-50 cursor-pointer ${
                                  !orgParentIdInput ? 'text-[#1E5ABB] font-bold bg-blue-50' : 'text-gray-700'
                                }`}
                              >
                                <span>(无父节点 - 作为顶级一级机构)</span>
                                {!orgParentIdInput && <Check className="w-3.5 h-3.5 text-[#1E5ABB]" />}
                              </button>
                              <div className="flex max-h-44 overflow-x-auto overflow-y-hidden">
                                {cascaderColumns.slice(0, 4).map((column, index) => (
                                  <div key={column.key} className="w-44 shrink-0 border-r last:border-r-0 border-gray-200 overflow-y-auto">
                                    {column.nodes.map((node) => renderParentOrgRow(node, index))}
                                  </div>
                                ))}
                              </div>
                              <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                                <span className="text-[11px] text-gray-500 truncate">
                                  {orgParentIdInput ? getOrgPathText(orgParentIdInput) : '当前作为顶级机构'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setOrgParentPickerOpen(false)}
                                  className="px-2.5 py-1 rounded bg-[#1E5ABB] text-white text-[11px] font-bold hover:bg-[#134092] cursor-pointer"
                                >
                                  完成
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="py-6 text-center text-xs text-gray-400">未找到匹配机构</div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div onClick={() => setOrgParentPickerOpen(false)}>
                <label className="block text-gray-700 font-medium mb-1">机构名称 *</label>
                <input
                  type="text"
                  required
                  value={orgNameInput}
                  onChange={(e) => setOrgNameInput(e.target.value)}
                  placeholder="例如: 中共台中市委宣传部 或 办公室"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" onClick={() => setOrgParentPickerOpen(false)}>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">排序值 *</label>
                  <input
                    type="number"
                    step="1"
                    value={orgSortOrderInput}
                    onChange={(e) => setOrgSortOrderInput(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] font-mono"
                  />
                  <p className="mt-1 text-[10px] text-gray-400">同级机构中，数字越小越靠前</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <label className="block text-gray-700 font-medium">允许下级机构新增子节点</label>
                      <p className="mt-0.5 text-[10px] text-gray-400">开启后，下级机构可自主新增下属子机构</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOrgAllowSubOrgCreationInput((prev) => !prev)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 transition-colors cursor-pointer shrink-0 ${
                        orgAllowSubOrgCreationInput
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-[#1E5ABB] hover:border-blue-200'
                      }`}
                      title={orgAllowSubOrgCreationInput ? '关闭下级新增权限' : '开启下级新增权限'}
                      aria-label={orgAllowSubOrgCreationInput ? '关闭下级新增权限' : '开启下级新增权限'}
                    >
                      <span className="text-[10px] font-bold">{orgAllowSubOrgCreationInput ? '允许' : '禁止'}</span>
                      <div
                        className={`w-7 h-3.5 flex items-center rounded-full p-0.5 transition-colors ${
                          orgAllowSubOrgCreationInput ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 bg-white rounded-full shadow-2xs"></div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsOrgLeaderSelectorOpen(false);
                    setIsOrgModalOpen(false);
                  }}
                  className="px-4 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1E5ABB] text-white rounded font-bold hover:bg-[#134092] cursor-pointer"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Personnel Modal (Add / Edit with Multi-Org Selection & Tree Structure) */}
      {isPersonnelModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-visible animate-in fade-in zoom-in-95">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-800">
                {editingPersonnel ? '编辑人员' : '新增人员'}
              </h3>
              <button
                onClick={() => setIsPersonnelModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePersonnel} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">账号名称 *</label>
                  <input
                    type="text"
                    required
                    value={pUsername}
                    onChange={(e) => setPUsername(e.target.value)}
                    placeholder="如: zhangsan_01"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">真实姓名 *</label>
                  <input
                    type="text"
                    required
                    value={pRealName}
                    onChange={(e) => setPRealName(e.target.value)}
                    placeholder="姓名"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                  />
                </div>
              </div>

              {/* Multi-Org Selection Area with Tree Structure */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-gray-700 font-medium">
                    所属机构节点 * <span className="text-gray-400 font-normal text-[11px]">(树级结构展现，支持多选)</span>
                  </label>
                  <div className="flex items-center space-x-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        const allOrgIds = [...orgNodes].sort(compareOrgPriority).map((n) => n.id);
                        setPOrgIds(allOrgIds);
                        setPPrimaryOrgId(allOrgIds[0] || '');
                        setPLeaderOrgIds(allOrgIds[0] ? [allOrgIds[0]] : []);
                        setPOrgPickerOpen(true);
                      }}
                      className="text-[#1E5ABB] hover:underline cursor-pointer font-medium"
                    >
                      全选
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPOrgIds([]);
                        setPPrimaryOrgId('');
                        setPLeaderOrgIds([]);
                        setPOrgPickerOpen(false);
                      }}
                      className="text-gray-500 hover:underline cursor-pointer font-medium"
                    >
                      清空
                    </button>
                  </div>
                </div>
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={pOrgSearch}
                    onFocus={() => setPOrgPickerOpen(true)}
                    onClick={() => setPOrgPickerOpen(true)}
                    onChange={(e) => {
                      setPOrgSearch(e.target.value);
                      setPOrgPickerOpen(true);
                    }}
                    placeholder={pOrgIds.length > 0 ? `已选 ${pOrgIds.length} 个机构，可输入名称或编码检索` : '输入机构名称或编码检索，点击展开机构选择'}
                    className="w-full pl-8 pr-8 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white"
                  />
                  {pOrgSearch && (
                    <button
                      type="button"
                      onClick={() => setPOrgSearch('')}
                      className="absolute right-2 top-1.5 h-5 w-5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
                      title="清空检索"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {pOrgPickerOpen && (
                  <div className="absolute z-[70] left-0 top-full mt-1 w-max max-w-[min(900px,calc(100vw-96px))] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xl">
                  {(() => {
                    const orgSearchQuery = pOrgSearch.trim().toLowerCase();
                    const nodeMatchesSearch = (node: OrgNode) =>
                      !orgSearchQuery ||
                      node.name.toLowerCase().includes(orgSearchQuery) ||
                      (node.code || '').toLowerCase().includes(orgSearchQuery);
                    const hasMatchingDescendant = (node: OrgNode): boolean =>
                      orgNodes
                        .filter((o) => o.parentId === node.id)
                        .some((child) => nodeMatchesSearch(child) || hasMatchingDescendant(child));
                    const shouldShowNode = (node: OrgNode) =>
                      !orgSearchQuery || nodeMatchesSearch(node) || hasMatchingDescendant(node);
                    const selectedCategory = categories.find((cat) => cat.id === pCascaderCategoryId) || categories[0];
                    const pathNodes = pCascaderPath
                      .map((id) => getOrgById(id))
                      .filter((node): node is OrgNode => !!node);
                    const cascaderColumns: Array<{ key: string; title: string; nodes: OrgNode[] }> = [
                      {
                        key: 'root',
                        title: selectedCategory?.name || '机构',
                        nodes: getSortedOrgChildren(null, selectedCategory?.id),
                      },
                      ...pathNodes.map((node) => ({
                        key: node.id,
                        title: node.name,
                        nodes: getSortedOrgChildren(node.id, undefined),
                      })),
                    ].filter((column) => column.nodes.some(shouldShowNode));
                    const hasAnyMatch = categories.some((cat) =>
                      orgNodes.some((node) => node.categoryId === cat.id && shouldShowNode(node))
                    );
                    const renderCascaderOrgRow = (node: OrgNode, level: number) => {
                      const children = getSortedOrgChildren(node.id, undefined);
                      const hasChildren = children.some(shouldShowNode);
                      const isChecked = pOrgIds.includes(node.id);
                      const isExpanded = pCascaderPath[level] === node.id;
                      if (!shouldShowNode(node)) return null;

                      return (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => {
                            toggleOrgSelectionForPerson(node.id);
                            setPCascaderCategoryId(node.categoryId);
                            setPCascaderPath((prev) => [...prev.slice(0, level), node.id]);
                          }}
                          className={`w-full h-8 px-2 flex items-center justify-between gap-2 text-left text-xs hover:bg-blue-50 cursor-pointer ${
                            isExpanded ? 'bg-blue-50 text-[#1E5ABB] font-bold' : 'text-gray-700'
                          }`}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                isChecked ? 'border-[#1E5ABB] bg-[#1E5ABB]' : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isChecked && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                            <Building2 className={`w-3.5 h-3.5 shrink-0 ${isChecked ? 'text-[#1E5ABB]' : 'text-gray-400'}`} />
                            <span className="truncate">{node.name}</span>
                          </span>
                          <span className="flex items-center gap-1 shrink-0">
                            {isChecked && <Check className="w-3.5 h-3.5 text-[#1E5ABB]" />}
                            {hasChildren && <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                          </span>
                        </button>
                      );
                    };

                    return hasAnyMatch ? (
                      <>
                      <div className="flex max-h-52 overflow-x-auto overflow-y-hidden">
                        <div className="w-40 shrink-0 border-r border-gray-200 overflow-y-auto">
                          {categories.map((cat) => {
                            const hasCatMatch = orgNodes.some((node) => node.categoryId === cat.id && shouldShowNode(node));
                            if (!hasCatMatch) return null;
                            const isActive = pCascaderCategoryId === cat.id;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  setPCascaderCategoryId(cat.id);
                                  setPCascaderPath([]);
                                }}
                                className={`w-full h-8 px-2 flex items-center justify-between gap-2 text-left text-xs hover:bg-blue-50 cursor-pointer ${
                                  isActive ? 'bg-blue-50 text-[#1E5ABB] font-bold' : 'text-gray-700'
                                }`}
                              >
                                <span className="flex items-center gap-2 min-w-0">
                                  <Folder className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#1E5ABB]' : 'text-gray-400'}`} />
                                  <span className="truncate">{cat.name}</span>
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              </button>
                            );
                          })}
                        </div>
                        {cascaderColumns.slice(0, 4).map((column, index) => (
                          <div key={column.key} className="w-44 shrink-0 border-r last:border-r-0 border-gray-200 overflow-y-auto">
                            {column.nodes.length > 0 ? (
                              column.nodes.map((node) => renderCascaderOrgRow(node, index))
                            ) : (
                              <div className="py-6 text-center text-xs text-gray-400">暂无下级机构</div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-[11px] text-gray-500">已选 {pOrgIds.length} 个机构</span>
                        <button
                          type="button"
                          onClick={() => setPOrgPickerOpen(false)}
                          className="px-2.5 py-1 rounded bg-[#1E5ABB] text-white text-[11px] font-bold hover:bg-[#134092] cursor-pointer"
                        >
                          完成
                        </button>
                      </div>
                      </>
                    ) : (
                      <div className="py-6 text-center text-xs text-gray-400">未找到匹配机构</div>
                    );
                  })()}
                  </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3" onClick={() => setPOrgPickerOpen(false)}>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">微信号</label>
                  <input
                    type="text"
                    value={pWechat}
                    onChange={(e) => setPWechat(e.target.value)}
                    placeholder="微信号"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">手机号</label>
                  <input
                    type="text"
                    value={pPhone}
                    onChange={(e) => setPPhone(e.target.value)}
                    placeholder="138****0000"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono"
                  />
                </div>
              </div>

              <div onClick={() => setPOrgPickerOpen(false)}>
                <label className="block text-gray-700 font-medium mb-1">
                  系统角色 * (可多选角色)
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['管理员', '审核员', '上报员'].map((role) => {
                    const isSelected = pRoles.includes(role);
                    return (
                      <button
                        type="button"
                        key={role}
                        onClick={() => toggleRoleSelectionForPerson(role)}
                        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#1E5ABB] text-white font-bold shadow-2xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-white shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        )}
                        <span>{role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsPersonnelModalOpen(false)}
                  className="px-4 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1E5ABB] text-white rounded font-bold hover:bg-[#134092] cursor-pointer"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. QR Code Distribution Modal - Universal QR Code with Quantity Control */}
      {isQrModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-[#1E5ABB]" />
                <div>
                  <h3 className="font-bold text-gray-800 text-base">二维码配置</h3>
                </div>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Platform QR Code Statistics Overview Bar */}
            <div className="grid grid-cols-3 gap-3 bg-gradient-to-r from-slate-800 via-[#1E5ABB] to-slate-900 text-white p-3.5 rounded-xl shadow-md border border-slate-700">
              <div className="space-y-0.5 border-r border-white/10 pr-2">
                <div className="text-[11px] text-slate-300 font-medium flex items-center space-x-1">
                  <span>平台二维码总量</span>
                </div>
                <div className="text-lg font-extrabold font-mono text-white">
                  {qrQuotaType === 'limit' ? `${qrLimitCount} 人次` : '不限数量'}
                </div>
              </div>
              <div className="space-y-0.5 border-r border-white/10 px-2">
                <div className="text-[11px] text-blue-200 font-medium flex items-center space-x-1">
                  <span>已用数量</span>
                </div>
                <div className="text-lg font-extrabold font-mono text-cyan-300">
                  {qrUsedCount} 人次
                </div>
              </div>
              <div className="space-y-0.5 pl-2">
                <div className="text-[11px] text-emerald-200 font-medium flex items-center space-x-1">
                  <span>可用数量</span>
                </div>
                <div className="text-lg font-extrabold font-mono text-emerald-400">
                  {qrQuotaType === 'limit' ? `${Math.max(0, qrLimitCount - qrUsedCount)} 人次` : '不限/充沛'}
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>生成新二维码后，当前节点下所有未过期旧二维码将自动失效。</span>
            </div>

            {/* Quota Limit Control Header Panel */}
            <div className="bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/60 border border-blue-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-800 flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-[#1E5ABB]" />
                  <span>通用二维码名额/数量限制控制</span>
                </label>
              </div>

              {qrQuotaType === 'limit' ? (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-700 font-bold">自定义限制人次:</span>
                      <input
                        type="number"
                        min="1"
                        max="50000"
                        value={qrLimitCount}
                        onChange={(e) => setQrLimitCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-28 px-2.5 py-1 bg-white border border-gray-300 rounded-md text-xs font-bold font-mono text-gray-800 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                      <span className="text-xs text-gray-500">人次上限</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>已开启不限数量模式，任何拥有该通用二维码的用户均可顺畅扫码进行报送与注册。</span>
                </div>
              )}
            </div>

            {/* Expiry selection */}
            <div className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-200">
              <span className="text-gray-700 font-bold flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span>二维码生效时限:</span>
              </span>
              <div className="flex gap-1.5">
                {[
                  { label: '1天有效', val: '1d' },
                  { label: '7天有效', val: '7d' },
                  { label: '30天有效', val: '30d' },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setQrExpireOption(item.val)}
                    className={`px-2.5 py-1 rounded border text-xs cursor-pointer transition-colors ${
                      qrExpireOption === item.val
                        ? 'bg-gray-800 text-white font-bold border-gray-800 shadow-2xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Universal QR Poster Card */}
            <div className="bg-gradient-to-b from-slate-50 to-blue-50/40 border border-blue-100 rounded-xl p-4 text-center space-y-2.5 shadow-inner">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white rounded-full text-xs font-bold text-[#1E5ABB] shadow-2xs border border-gray-200">
                <Building2 className="w-3.5 h-3.5" />
                <span>{currentOrg.name} 通用节点二维码</span>
              </div>

              <div className="flex items-center justify-center gap-2">
                {currentOrg.code && (
                  <span className="text-[11px] font-mono text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                    机构编码: {currentOrg.code}
                  </span>
                )}
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {qrQuotaType === 'limit' ? `受控上限: ${qrLimitCount}人次` : '不限注册名额'}
                </span>
              </div>

              {/* Universal QR SVG */}
              <div className="flex justify-center my-1">
                <svg
                  id="org-qrcode-svg"
                  viewBox="0 0 200 200"
                  className="w-44 h-44 bg-white p-2.5 border border-gray-200 rounded-xl shadow-xs"
                >
                  <rect width="200" height="200" fill="#ffffff" />
                  <rect x="15" y="15" width="45" height="45" fill="#1E5ABB" rx="6" />
                  <rect x="23" y="23" width="29" height="29" fill="#ffffff" rx="3" />
                  <rect x="30" y="30" width="15" height="15" fill="#1E5ABB" rx="2" />

                  <rect x="140" y="15" width="45" height="45" fill="#1E5ABB" rx="6" />
                  <rect x="148" y="23" width="29" height="29" fill="#ffffff" rx="3" />
                  <rect x="155" y="30" width="15" height="15" fill="#1E5ABB" rx="2" />

                  <rect x="15" y="140" width="45" height="45" fill="#1E5ABB" rx="6" />
                  <rect x="23" y="148" width="29" height="29" fill="#ffffff" rx="3" />
                  <rect x="30" y="155" width="15" height="15" fill="#1E5ABB" rx="2" />

                  <g fill="#1E5ABB">
                    <rect x="70" y="20" width="8" height="8" rx="1.5" />
                    <rect x="82" y="20" width="8" height="8" rx="1.5" />
                    <rect x="106" y="20" width="8" height="8" rx="1.5" />
                    <rect x="118" y="20" width="8" height="8" rx="1.5" />
                    <rect x="70" y="32" width="8" height="8" rx="1.5" />
                    <rect x="94" y="32" width="8" height="8" rx="1.5" />
                    <rect x="118" y="32" width="8" height="8" rx="1.5" />
                    <rect x="82" y="44" width="8" height="8" rx="1.5" />
                    <rect x="106" y="44" width="8" height="8" rx="1.5" />

                    <rect x="20" y="70" width="8" height="8" rx="1.5" />
                    <rect x="32" y="70" width="8" height="8" rx="1.5" />
                    <rect x="44" y="70" width="8" height="8" rx="1.5" />
                    <rect x="70" y="70" width="8" height="8" rx="1.5" />
                    <rect x="82" y="70" width="8" height="8" rx="1.5" />
                    <rect x="94" y="70" width="8" height="8" rx="1.5" />
                    <rect x="118" y="70" width="8" height="8" rx="1.5" />
                    <rect x="142" y="70" width="8" height="8" rx="1.5" />
                    <rect x="166" y="70" width="8" height="8" rx="1.5" />

                    <rect x="20" y="82" width="8" height="8" rx="1.5" />
                    <rect x="44" y="82" width="8" height="8" rx="1.5" />
                    <rect x="56" y="82" width="8" height="8" rx="1.5" />
                    <rect x="82" y="82" width="8" height="8" rx="1.5" />
                    <rect x="106" y="82" width="8" height="8" rx="1.5" />
                    <rect x="130" y="82" width="8" height="8" rx="1.5" />
                    <rect x="154" y="82" width="8" height="8" rx="1.5" />

                    <rect x="32" y="94" width="8" height="8" rx="1.5" />
                    <rect x="70" y="94" width="8" height="8" rx="1.5" />
                    <rect x="94" y="94" width="8" height="8" rx="1.5" />
                    <rect x="118" y="94" width="8" height="8" rx="1.5" />
                    <rect x="142" y="94" width="8" height="8" rx="1.5" />
                    <rect x="166" y="94" width="8" height="8" rx="1.5" />

                    <rect x="20" y="106" width="8" height="8" rx="1.5" />
                    <rect x="44" y="106" width="8" height="8" rx="1.5" />
                    <rect x="82" y="106" width="8" height="8" rx="1.5" />
                    <rect x="106" y="106" width="8" height="8" rx="1.5" />
                    <rect x="130" y="106" width="8" height="8" rx="1.5" />
                    <rect x="154" y="106" width="8" height="8" rx="1.5" />

                    <rect x="32" y="118" width="8" height="8" rx="1.5" />
                    <rect x="56" y="118" width="8" height="8" rx="1.5" />
                    <rect x="70" y="118" width="8" height="8" rx="1.5" />
                    <rect x="94" y="118" width="8" height="8" rx="1.5" />
                    <rect x="118" y="118" width="8" height="8" rx="1.5" />
                    <rect x="142" y="118" width="8" height="8" rx="1.5" />
                    <rect x="166" y="118" width="8" height="8" rx="1.5" />

                    <rect x="70" y="142" width="8" height="8" rx="1.5" />
                    <rect x="94" y="142" width="8" height="8" rx="1.5" />
                    <rect x="106" y="142" width="8" height="8" rx="1.5" />
                    <rect x="130" y="142" width="8" height="8" rx="1.5" />

                    <rect x="82" y="154" width="8" height="8" rx="1.5" />
                    <rect x="118" y="154" width="8" height="8" rx="1.5" />
                    <rect x="142" y="154" width="8" height="8" rx="1.5" />
                    <rect x="166" y="154" width="8" height="8" rx="1.5" />

                    <rect x="70" y="166" width="8" height="8" rx="1.5" />
                    <rect x="94" y="166" width="8" height="8" rx="1.5" />
                    <rect x="106" y="166" width="8" height="8" rx="1.5" />
                    <rect x="130" y="166" width="8" height="8" rx="1.5" />
                    <rect x="154" y="166" width="8" height="8" rx="1.5" />
                  </g>

                  <rect x="80" y="80" width="40" height="40" fill="#ffffff" rx="8" stroke="#cbd5e1" strokeWidth="1.5" />
                  <circle cx="100" cy="100" r="13" fill="#1E5ABB" />
                  <path d="M94 97 h12 v6 h-12 z M97 94 v12 h6 v-12 z" fill="#ffffff" />
                </svg>
              </div>

              <div className="text-xs text-gray-500 font-medium">
                扫此通用二维码进入『{currentOrg.name}』专属报送通道
              </div>
            </div>

            {/* Distribution Link Box */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">受控通用分发链接</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={`https://app.gov.cn/org/register?code=${currentOrg.code || currentOrg.id}&maxQuota=${
                    qrQuotaType === 'limit' ? qrLimitCount : 'unlimited'
                  }&exp=${qrExpireOption}`}
                  className="flex-1 bg-gray-50 border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono text-gray-600 focus:outline-none select-all"
                />
                <button
                  onClick={() => {
                    const link = `https://app.gov.cn/org/register?code=${currentOrg.code || currentOrg.id}&maxQuota=${
                      qrQuotaType === 'limit' ? qrLimitCount : 'unlimited'
                    }&exp=${qrExpireOption}`;
                    navigator.clipboard?.writeText(link);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-[#1E5ABB] text-white text-xs font-bold rounded hover:bg-[#134092] flex items-center space-x-1 cursor-pointer shrink-0 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>已复制链接</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制链接</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadOrgQrCode}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded hover:bg-gray-50 flex items-center space-x-1 cursor-pointer shrink-0 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载二维码</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      {isQrGenerateConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-2">
                <ShieldAlert className="mt-0.5 h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-gray-800">生成新二维码</h3>
                  <p className="mt-1 text-sm text-gray-600 leading-6">
                    生成新二维码后，当前节点下所有未过期旧二维码将自动失效。
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsQrGenerateConfirmOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsQrGenerateConfirmOpen(false)}
                className="px-4 py-2 text-sm font-bold rounded border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsQrGenerateConfirmOpen(false);
                  setIsQrModalOpen(true);
                }}
                className="px-4 py-2 text-sm font-bold rounded bg-[#1E5ABB] text-white hover:bg-[#134092] cursor-pointer"
              >
                继续生成
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900/95 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 border border-gray-700">
          <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
