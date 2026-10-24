import React, { useEffect, useRef, useState } from 'react';
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
  Calendar,
  ShieldAlert,
  Building,
  Folder,
  ArrowUpDown,
  KeyRound,
  Circle,
  IdCard,
  MapPin,
  CheckCircle2,
  Lock,
  Sparkles,
  Download,
  UserPlus,
  RotateCcw
} from 'lucide-react';
import type { PageId } from '../types';
import {
  ACCOUNT_ROLE_OPTIONS,
  formatPersonOrgPaths,
  getDeepestOrgId,
  INITIAL_CATEGORIES,
  INITIAL_ORG_NODES,
  INITIAL_PERSONNEL,
  syncFollowersAfterDelete,
  type InviteCode,
  type UserOrgSharedState
} from '../data/userOrgShared';
import {
  getPersonAvatarUrl,
  maskPhone,
  PersonAvatar,
  PersonGroupCell,
  PersonIdentityCell,
  PersonOrgPathCell,
  PersonRoleBadges,
  StatusSwitch
} from '../components/PersonAccountDisplay';
import { ExternalUserTable, FollowStatusBadges } from '../components/ExternalUserTable';
import { OrgCascadeSelect } from '../components/OrgCascadeSelect';
import { InviteUserModal } from '../components/InviteUserModal';
import { PaginationBar } from '../components/PaginationBar';
import { InviteRecordModal } from './InviteRecordModal';

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
  /** 外部组织管理 */
  orgType?: string;
  duty?: string;
  /** 人员配额，含下级节点；未设置时共享上级配额 */
  quota?: number;
  /** 本节点邀请时可勾选的角色；未设置时向上继承 / 默认网格员+上报员 */
  inviteRoles?: string[];
  disabled?: boolean;
}

export interface PersonnelItem {
  id: number;
  orgIds: string[]; // 单机构，仅存所属节点 id
  primaryOrgId?: string;
  username: string;
  realName: string;
  gender?: '男' | '女';
  wechat: string;
  phone: string;
  roles: string[]; // Multiple roles supported per account
  registerDate: string;
  status: '启用' | '禁用';
  isLeader?: boolean; // 是否节点负责人
  labels?: string[];
  groupIds?: string[];
  recycled?: boolean;
  jobTitle?: string;
  lastLogin?: string;
  avatarUrl?: string;
  /** 外部用户数据：公众号侧身份 */
  nickname?: string;
  openId?: string;
  followStatus?: '已关注' | '已取消关注';
  /** 已解除与微信（公众号 openId）的绑定，需重新邀请激活后才能登录 */
  wechatUnbound?: boolean;
  /** 解绑后重新发送邀请的时间 */
  reinvitedAt?: string;
  locked?: boolean;
  /** 加入当前所属组织的日期，缺省取 registerDate */
  joinedOrgAt?: string;
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
  embedded?: boolean;
  shared?: UserOrgSharedState;
}

const PERSONNEL_LABEL_OPTIONS: Array<{
  name: string;
  group: '网格员' | '审核员';
}> = [
  { name: '骨干网格员', group: '网格员' },
  { name: '普通网格员', group: '网格员' },
  { name: '核心网格员', group: '网格员' },
  { name: '一级审核员', group: '审核员' },
  { name: '二级审核员', group: '审核员' },
  { name: '三级审核员', group: '审核员' },
];

const EXTERNAL_QUOTA_LIMIT = 500;

const getPersonnelLabelOptionsByRoles = (roles: string[] = []) => {
  const normalized = roles.map((role) => (role === '上报员' ? '网格员' : role));
  return PERSONNEL_LABEL_OPTIONS.filter((option) => normalized.includes(option.group));
};

const getPersonnelDisplayLabels = (person: PersonnelItem) => {
  const allowedNames = new Set(getPersonnelLabelOptionsByRoles(person.roles).map((option) => option.name));
  return (person.labels || []).filter((label) => allowedNames.has(label));
};

export const OrgManagement: React.FC<OrgManagementProps> = ({ onNavigate, embedded = false, shared }) => {
  const [localCategories, setLocalCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [localOrgNodes, setLocalOrgNodes] = useState<OrgNode[]>(INITIAL_ORG_NODES);
  const [localPersonnelList, setLocalPersonnelList] = useState<PersonnelItem[]>(INITIAL_PERSONNEL);

  const categories = shared?.categories ?? localCategories;
  const setCategories = shared?.setCategories ?? setLocalCategories;
  const orgNodes = shared?.orgNodes ?? localOrgNodes;
  const setOrgNodes = shared?.setOrgNodes ?? setLocalOrgNodes;
  const personnelList = shared?.personnelList ?? localPersonnelList;
  const setPersonnelList = shared?.setPersonnelList ?? setLocalPersonnelList;
  const groups = shared?.groups ?? [];
  const [selectedOrgId, setSelectedOrgId] = useState<string>('org-1');
  const [moveOrgTarget, setMoveOrgTarget] = useState<PersonnelItem | null>(null);
  const [moveOrgPath, setMoveOrgPath] = useState<string[]>([]);
  const [renamingOrgId, setRenamingOrgId] = useState<string | null>(null);
  const [renamingOrgName, setRenamingOrgName] = useState('');
  const [isPickPersonOpen, setIsPickPersonOpen] = useState(false);
  const [pickPersonSearch, setPickPersonSearch] = useState('');
  const [pickPersonRole, setPickPersonRole] = useState('all');
  const [pickOnlyUnassigned, setPickOnlyUnassigned] = useState(false);
  const [pickPersonIds, setPickPersonIds] = useState<number[]>([]);

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
  const [personnelSearchDraft, setPersonnelSearchDraft] = useState('');
  const [personnelSearch, setPersonnelSearch] = useState('');
  const [personnelPage, setPersonnelPage] = useState(1);
  const [personnelPageSize, setPersonnelPageSize] = useState(10);
  const [revealedPhoneIds, setRevealedPhoneIds] = useState<number[]>([]);
  const [viewingPersonnelId, setViewingPersonnelId] = useState<number | null>(null);

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

  // 3. Personnel Modal (Multiple Orgs Selection)
  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [isLeaderPickerOpen, setIsLeaderPickerOpen] = useState(false);
  const [isLeaderActionMenuOpen, setIsLeaderActionMenuOpen] = useState(false);
  const [leaderPickerSearch, setLeaderPickerSearch] = useState('');
  const [leaderPickerPage, setLeaderPickerPage] = useState(1);
  const [inviteTarget, setInviteTarget] = useState<{ orgId?: string } | null>(null);
  const [isInviteRecordOpen, setIsInviteRecordOpen] = useState(false);
  const [quotaModalOrgId, setQuotaModalOrgId] = useState<string | null>(null);
  const [quotaInput, setQuotaInput] = useState('');
  const [quotaUnlimited, setQuotaUnlimited] = useState(true);
  const [localInviteCodes, setLocalInviteCodes] = useState<InviteCode[]>([]);
  const inviteCodes = shared?.inviteCodes ?? localInviteCodes;
  const setInviteCodes = shared?.setInviteCodes ?? setLocalInviteCodes;
  const [leaderModalOrgId, setLeaderModalOrgId] = useState<string | null>(null);
  const [leaderDraftIds, setLeaderDraftIds] = useState<number[]>([]);
  const [leaderModalSearch, setLeaderModalSearch] = useState('');
  const [editingPersonnel, setEditingPersonnel] = useState<PersonnelItem | null>(null);
  const [pUsername, setPUsername] = useState('');
  const [pRealName, setPRealName] = useState('');
  const [pWechat, setPWechat] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pRoles, setPRoles] = useState<string[]>(['网格员']);
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
  const [draggingOrgId, setDraggingOrgId] = useState<string | null>(null);
  const [dropHint, setDropHint] = useState<{ id: string; position: 'before' | 'after' } | null>(null);
  const orgDragMovedRef = useRef(false);
  const draggingOrgIdRef = useRef<string | null>(null);
  const [addingOrgTarget, setAddingOrgTarget] = useState<{ parentId: string | null; categoryId: string } | null>(null);
  const [addingOrgName, setAddingOrgName] = useState('');

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
    const svg = document.getElementById('org-qrcode-svg') as unknown as SVGSVGElement | null;
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
    return siblingNodes.length > 0 ? maxSortOrder + 10 : 10;
  };

  const sameOrgParent = (a: OrgNode, b: OrgNode) => (a.parentId ?? null) === (b.parentId ?? null);

  const reorderSiblingOrgs = (dragId: string, targetId: string, position: 'before' | 'after') => {
    const dragNode = orgNodes.find((node) => node.id === dragId);
    const targetNode = orgNodes.find((node) => node.id === targetId);
    if (!dragNode || !targetNode || dragId === targetId || !sameOrgParent(dragNode, targetNode)) return;

    const siblings = getSortedOrgChildren(dragNode.parentId ?? null);
    const withoutDrag = siblings.filter((node) => node.id !== dragId);
    let insertAt = withoutDrag.findIndex((node) => node.id === targetId);
    if (insertAt < 0) return;
    if (position === 'after') insertAt += 1;

    const nextSiblings = [...withoutDrag.slice(0, insertAt), dragNode, ...withoutDrag.slice(insertAt)];
    const orderMap = new Map(nextSiblings.map((node, index) => [node.id, (index + 1) * 10]));
    setOrgNodes((prev) =>
      prev.map((node) => (orderMap.has(node.id) ? { ...node, sortOrder: orderMap.get(node.id)! } : node))
    );
    triggerToast('已调整同级排序');
  };

  const clearOrgDragState = () => {
    draggingOrgIdRef.current = null;
    setDraggingOrgId(null);
    setDropHint(null);
  };

  const startAddOrg = (parentId: string | null, categoryId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAddingOrgTarget({ parentId, categoryId });
    setAddingOrgName('');
    setViewingPersonnelId(null);
    if (parentId) {
      setExpandedNodes((prev) => ({ ...prev, [parentId]: true }));
      setSelectedOrgId(parentId);
      setIsRootSelected(false);
    } else {
      setIsRootSelected(true);
    }
  };

  const cancelAddOrg = () => {
    setAddingOrgTarget(null);
    setAddingOrgName('');
  };

  const isOrgNameDuplicated = (name: string, excludeId?: string) =>
    orgNodes.some((node) => node.id !== excludeId && node.name.trim() === name);

  const confirmAddOrg = () => {
    const name = addingOrgName.trim();
    if (!addingOrgTarget) return;
    if (!name) {
      cancelAddOrg();
      return;
    }
    if (isOrgNameDuplicated(name)) {
      triggerToast('组织节点名称已存在，请更换名称');
      return;
    }
    const parentOrg = addingOrgTarget.parentId
      ? orgNodes.find((node) => node.id === addingOrgTarget.parentId)
      : undefined;
    const newOrgId = 'org-' + Date.now();
    const newOrg: OrgNode = {
      id: newOrgId,
      categoryId: parentOrg?.categoryId || addingOrgTarget.categoryId || categories[0]?.id || 'cat-1',
      parentId: addingOrgTarget.parentId,
      name,
      code: `ORG-${Math.floor(100000 + Math.random() * 900000)}`,
      sortOrder: getDefaultOrgSortOrder(addingOrgTarget.parentId),
      allowSubOrgCreation: true,
      systemVersion: '正式版',
      expireDate: '2026-12-31',
    };
    setOrgNodes((prev) => [...prev, newOrg]);
    setSelectedOrgId(newOrgId);
    setIsRootSelected(false);
    cancelAddOrg();
    triggerToast(`已新增组织节点『${name}』`);
  };

  const renderInlineOrgInput = () => (
    <div className="flex items-center gap-1 py-1 pl-2 pr-1">
      <input
        autoFocus
        value={addingOrgName}
        onChange={(event) => setAddingOrgName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            confirmAddOrg();
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            cancelAddOrg();
          }
        }}
        placeholder="输入组织节点名称，回车保存"
        className="flex-1 min-w-0 px-2 py-1 text-xs border border-[#1E5ABB] rounded bg-white text-gray-800 font-normal focus:outline-none"
      />
      <button
        type="button"
        title="保存"
        onMouseDown={(event) => event.preventDefault()}
        onClick={(event) => {
          event.stopPropagation();
          confirmAddOrg();
        }}
        className="p-1 rounded text-[#1E5ABB] hover:bg-blue-50 cursor-pointer"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="取消"
        onMouseDown={(event) => event.preventDefault()}
        onClick={(event) => {
          event.stopPropagation();
          cancelAddOrg();
        }}
        className="p-1 rounded text-gray-400 hover:bg-gray-50 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  const startRenameOrg = (node: OrgNode, e?: React.MouseEvent) => {
    e?.stopPropagation();
    cancelAddOrg();
    setRenamingOrgId(node.id);
    setRenamingOrgName(node.name);
  };

  const cancelRenameOrg = () => {
    setRenamingOrgId(null);
    setRenamingOrgName('');
  };

  const confirmRenameOrg = () => {
    const name = renamingOrgName.trim();
    const node = orgNodes.find((item) => item.id === renamingOrgId);
    if (!node || !name || name === node.name) {
      cancelRenameOrg();
      return;
    }
    if (isOrgNameDuplicated(name, node.id)) {
      triggerToast('组织节点名称已存在，请更换名称');
      return;
    }
    setOrgNodes((prev) => prev.map((item) => (item.id === node.id ? { ...item, name } : item)));
    cancelRenameOrg();
    triggerToast(`已将『${node.name}』重命名为『${name}』`);
  };

  const renderRenameOrgInput = () => (
    <div className="flex items-center gap-1 flex-1 min-w-0" onClick={(event) => event.stopPropagation()}>
      <input
        autoFocus
        value={renamingOrgName}
        onChange={(event) => setRenamingOrgName(event.target.value)}
        onFocus={(event) => event.target.select()}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            confirmRenameOrg();
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            cancelRenameOrg();
          }
        }}
        placeholder="输入组织节点名称，回车保存"
        className="flex-1 min-w-0 px-2 py-0.5 text-xs border border-[#1E5ABB] rounded bg-white text-gray-800 font-normal focus:outline-none"
      />
      <button
        type="button"
        title="保存"
        onMouseDown={(event) => event.preventDefault()}
        onClick={confirmRenameOrg}
        className="p-1 rounded text-[#1E5ABB] hover:bg-blue-50 cursor-pointer"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="取消"
        onMouseDown={(event) => event.preventDefault()}
        onClick={cancelRenameOrg}
        className="p-1 rounded text-gray-400 hover:bg-gray-50 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );

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
    (node.leaderName || '').split('、').filter(Boolean).forEach((name) => {
      if (!names.includes(name)) names.push(name);
    });
    return names;
  };

  const getOrgLeaderSummary = (node: OrgNode) => {
    const names = getOrgLeaderNames(node);
    if (names.length <= 1) return names[0] || '';
    return `${names[0]}等${names.length}人`;
  };

  const getOrgLeaderPhoneSummary = (node: OrgNode) => {
    const phones = getOrgLeaderPeople(node).map((person) => person.phone);
    (node.leaderPhone || '').split('、').filter(Boolean).forEach((phone) => {
      if (!phones.includes(phone)) phones.push(phone);
    });
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

  const getOrgPathText = (orgId: string) => getOrgPath(orgId).map((node) => node.name).join('/');
  const getOrgAncestorIds = (orgId: string) => getOrgPath(orgId).map((node) => node.id);
  const getGroupName = (groupId?: string) => groups.find((group) => group.id === groupId)?.name;

  const isOrgLedByPerson = (node: OrgNode, person: PersonnelItem | null) => {
    if (!person) return false;
    return isPersonLeaderOfOrg(node, person);
  };

  const viewingPersonnel = viewingPersonnelId
    ? personnelList.find((person) => person.id === viewingPersonnelId && !person.recycled) || null
    : null;
  const viewingPersonnelOrgId = viewingPersonnel
    ? getDeepestOrgId(orgNodes, viewingPersonnel.orgIds, viewingPersonnel.primaryOrgId)
    : undefined;
  const viewingPersonnelOrg = viewingPersonnelOrgId
    ? orgNodes.find((node) => node.id === viewingPersonnelOrgId)
    : undefined;
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
  const openEditOrgModal = (node: OrgNode, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingOrgNode(node);
    setOrgNameInput(node.name);
    setOrgCategoryIdInput(node.categoryId);
    setOrgParentIdInput(node.parentId || '');
    setOrgCodeInput(node.code || '');
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
      ? `确定要删除组织节点『${node.name}』及其下的 ${descendantIds.length} 个子节点吗？`
      : `确定要删除组织节点『${node.name}』吗？`;

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
    const nextName = orgNameInput.trim();
    if (!nextName || !nextCategoryId) return;
    if (isOrgNameDuplicated(nextName, editingOrgNode?.id)) {
      triggerToast('组织节点名称已存在，请更换名称');
      return;
    }

    const selectedLeaderPerson = orgLeaderPersonIdInput
      ? personnelList.find((person) => person.id === orgLeaderPersonIdInput)
      : undefined;
    const nextLeaderName = selectedLeaderPerson?.realName || orgLeaderNameInput.trim();
    const nextLeaderPhone = selectedLeaderPerson?.phone || orgLeaderPhoneInput.trim();
    const nextLeaderPersonId = selectedLeaderPerson?.id;

    if (editingOrgNode) {
      const nextParentId = orgParentIdInput || null;
      const parentChanged = (editingOrgNode.parentId ?? null) !== nextParentId;
      setOrgNodes((prev) =>
        prev.map((o) =>
          o.id === editingOrgNode.id
            ? {
                ...o,
                name: nextName,
                categoryId: nextCategoryId,
                parentId: nextParentId,
                code: orgCodeInput.trim(),
                sortOrder: parentChanged ? getDefaultOrgSortOrder(nextParentId) : o.sortOrder,
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
        name: nextName,
        code: orgCodeInput.trim() || `ORG-${Math.floor(100000 + Math.random() * 900000)}`,
        sortOrder: getDefaultOrgSortOrder(orgParentIdInput || null),
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
    if (confirm('确定删除该人员账号吗？仍关注公众号的用户将回到「已关注未激活」列表。')) {
      const removed = personnelList.find((item) => item.id === id);
      setPersonnelList((prev) => prev.filter((item) => item.id !== id));
      if (removed && shared) syncFollowersAfterDelete(removed, shared.setFollowers);
      if (viewingPersonnelId === id) {
        setViewingPersonnelId(null);
      }
      triggerToast('账号已删除');
    }
  };

  const openAddPersonnelModal = () => {
    setEditingPersonnel(null);
    setPUsername('');
    setPRealName('');
    setPWechat('');
    setPPhone('');
    setPRoles(['网格员']);
    setPOrgIds([currentOrg.id]); // Default to selected org
    setPPrimaryOrgId(currentOrg.id);
    setPLeaderOrgIds([]);
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

  const getCurrentLeaderIds = (node: OrgNode) =>
    Array.from(
      new Set([
        ...getOrgLeaderIds(node),
        ...personnelList.filter((person) => !person.recycled && isPersonLeaderOfOrg(node, person)).map((person) => person.id),
      ])
    );

  const openLeaderModal = (node: OrgNode, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLeaderModalOrgId(node.id);
    setLeaderDraftIds(getCurrentLeaderIds(node).slice(0, 1));
    setLeaderModalSearch('');
  };

  const closeLeaderModal = () => setLeaderModalOrgId(null);

  const toggleLeaderDraft = (personId: number) => {
    setLeaderDraftIds((prev) => (prev.includes(personId) ? [] : [personId]));
  };

  const saveOrgLeaders = () => {
    const target = orgNodes.find((node) => node.id === leaderModalOrgId);
    if (!target) return;
    const prevIds = getCurrentLeaderIds(target);
    const leaderMeta = getLeaderMetaByIds(leaderDraftIds);
    const nextOrgNodes = orgNodes.map((node) => (node.id === target.id ? { ...node, ...leaderMeta } : node));
    setOrgNodes(nextOrgNodes);
    setPersonnelList((prev) =>
      prev.map((person) => {
        if (leaderDraftIds.includes(person.id)) return { ...person, isLeader: true };
        if (prevIds.includes(person.id) && !personLeadsAnyOrg(person.id, nextOrgNodes)) {
          return { ...person, isLeader: false };
        }
        return person;
      })
    );
    setLeaderModalOrgId(null);
    triggerToast(
      leaderDraftIds.length > 0
        ? `已设置「${target.name}」负责人：${leaderMeta.leaderName}`
        : `已清空「${target.name}」的负责人`
    );
  };

  const getPersonOwnOrg = (person: PersonnelItem) => {
    const orgId = getDeepestOrgId(orgNodes, person.orgIds, person.primaryOrgId);
    return orgId ? orgNodes.find((node) => node.id === orgId) : undefined;
  };

  const getLedOrgs = (person: PersonnelItem) => orgNodes.filter((node) => isPersonLeaderOfOrg(node, person));

  const getLeaderActionOrg = (person: PersonnelItem) =>
    isRootSelected ? getPersonOwnOrg(person) : currentOrg;

  const toggleLeaderInOwnOrg = (person: PersonnelItem) => {
    const ownOrg = getLeaderActionOrg(person);
    if (!ownOrg) {
      triggerToast(`${person.realName}尚未归属任何组织节点`);
      return;
    }
    const leading = isPersonLeaderOfOrg(ownOrg, person);
    const prevIds = getCurrentLeaderIds(ownOrg);
    const prevNames = getOrgLeaderNames(ownOrg);
    if (
      !leading &&
      prevNames.length > 0 &&
      !confirm(`「${ownOrg.name}」当前负责人为${prevNames.join('、')}，每个节点仅一名负责人，确定替换为${person.realName}吗？`)
    ) {
      return;
    }
    const leaderMeta = getLeaderMetaByIds(leading ? [] : [person.id]);
    const nextOrgNodes = orgNodes.map((node) => (node.id === ownOrg.id ? { ...node, ...leaderMeta } : node));
    setOrgNodes(nextOrgNodes);
    setPersonnelList((prev) =>
      prev.map((item) => {
        if (item.id === person.id) return { ...item, isLeader: !leading || personLeadsAnyOrg(item.id, nextOrgNodes) };
        if (prevIds.includes(item.id)) return { ...item, isLeader: personLeadsAnyOrg(item.id, nextOrgNodes) };
        return item;
      })
    );
    triggerToast(
      leading
        ? `已取消${person.realName}的「${ownOrg.name}」负责人身份`
        : `已将${person.realName}设为「${ownOrg.name}」负责人${prevNames.length > 0 ? `，替换原负责人${prevNames.join('、')}` : ''}`
    );
  };

  const handleTogglePersonnelLeader = (person: PersonnelItem) => {
    if (isRootSelected) {
      triggerToast('平台根节点不支持直接设置组织联系人');
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
    setPRoles(item.roles && item.roles.length > 0 ? item.roles.filter((role) => ['管理员', ...ACCOUNT_ROLE_OPTIONS].includes(role)) : []);
    const initialOrgId = getDeepestOrgId(orgNodes, item.orgIds, item.primaryOrgId) || item.orgIds[0] || '';
    setPOrgIds(initialOrgId ? [initialOrgId] : []);
    setPPrimaryOrgId(initialOrgId);
    const leaderOrgIds = orgNodes
      .filter((node) => isPersonLeaderOfOrg(node, item))
      .map((node) => node.id);
    setPLeaderOrgIds(leaderOrgIds.includes(initialOrgId) ? [initialOrgId] : []);
    setPOrgSearch('');
    setPOrgPickerOpen(false);
    const initialOrg = getOrgById(initialOrgId);
    setPCascaderCategoryId(initialOrg?.categoryId || 'cat-1');
    setPCascaderPath(initialOrgId ? getOrgAncestorIds(initialOrgId) : []);
    setIsPersonnelModalOpen(true);
  };

  const selectOrgForPerson = (orgId: string) => {
    setPOrgIds([orgId]);
    setPPrimaryOrgId(orgId);
    setPLeaderOrgIds((prev) => (prev.includes(orgId) ? [orgId] : []));
  };

  const toggleRoleSelectionForPerson = (role: string) => {
    if (!['管理员', ...ACCOUNT_ROLE_OPTIONS].includes(role)) return;
    setPRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSavePersonnel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pUsername || !pRealName) return;
    if (pOrgIds.length === 0) {
      alert('请选择所属机构');
      return;
    }
    if (pRoles.length === 0) {
      alert('请至少选择一个账号角色');
      return;
    }
    const nextPrimaryOrgId = pOrgIds[0];
    const nextLeaderOrgIds = pLeaderOrgIds.filter((orgId) => orgId === nextPrimaryOrgId);
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
                orgIds: [nextPrimaryOrgId],
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
        orgIds: [nextPrimaryOrgId],
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
        groupIds: [],
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
          nextLeaderIds = [savedPersonId];
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

  const isInSelectedOrg = (orgId: string) => isRootSelected || getOrgAncestorIds(orgId).includes(selectedOrgId);

  const reassignPersonOrg = (person: PersonnelItem, nextOrgId?: string) => {
    setPersonnelList((prev) =>
      prev.map((item) => {
        if (item.id !== person.id) return item;
        const kept = item.orgIds.filter((id) => !isInSelectedOrg(id));
        const orgIds = nextOrgId ? Array.from(new Set([...kept, nextOrgId])) : kept;
        const primaryOrgId =
          nextOrgId || (item.primaryOrgId && orgIds.includes(item.primaryOrgId) ? item.primaryOrgId : orgIds[0]);
        return { ...item, orgIds, primaryOrgId };
      })
    );
  };

  const handleRemoveFromOrg = (person: PersonnelItem) => {
    const nodeName = isRootSelected ? '全部组织节点' : orgNodes.find((node) => node.id === selectedOrgId)?.name || '当前节点';
    if (!confirm(`确定将【${person.realName}】移出「${nodeName}」吗？账号本身保留，可在外部用户管理中重新分配。`)) return;
    reassignPersonOrg(person);
    triggerToast(`已将【${person.realName}】移出「${nodeName}」`);
  };

  const openMoveOrg = (person: PersonnelItem) => {
    const current = getDeepestOrgId(orgNodes, person.orgIds, person.primaryOrgId);
    setMoveOrgTarget(person);
    setMoveOrgPath(current ? getOrgAncestorIds(current) : []);
  };

  const handleMoveOrg = () => {
    if (!moveOrgTarget) return;
    const nextOrgId = moveOrgPath[moveOrgPath.length - 1];
    if (!nextOrgId) {
      triggerToast('请选择组织节点');
      return;
    }
    if (isOrgDisabled(nextOrgId)) {
      triggerToast('目标节点已停用，不能调入人员');
      return;
    }
    const currentOrgId = getDeepestOrgId(orgNodes, moveOrgTarget.orgIds, moveOrgTarget.primaryOrgId);
    const currentPathIds = new Set(currentOrgId ? getOrgAncestorIds(currentOrgId) : []);
    const fullNode = getOrgPath(nextOrgId).find(
      (node) => node.quota !== undefined && !currentPathIds.has(node.id) && (orgHeadcount[node.id] || 0) >= node.quota
    );
    if (fullNode) {
      triggerToast(`「${fullNode.name}」人员配额已满（${orgHeadcount[fullNode.id] || 0}/${fullNode.quota}），请先调整配额`);
      return;
    }
    reassignPersonOrg(moveOrgTarget, nextOrgId);
    triggerToast(`已将【${moveOrgTarget.realName}】调整到「${getOrgPathText(nextOrgId)}」`);
    setMoveOrgTarget(null);
  };

  const openPickPersonModal = () => {
    if (isRootSelected) {
      triggerToast('请先在左侧选择要加入的组织节点');
      return;
    }
    setPickPersonSearch('');
    setPickPersonRole('all');
    setPickOnlyUnassigned(false);
    setPickPersonIds([]);
    setIsPickPersonOpen(true);
  };

  const pickPersonCandidates = personnelList.filter((person) => {
    if (person.recycled) return false;
    const personOrgId = getDeepestOrgId(orgNodes, person.orgIds, person.primaryOrgId);
    if (personOrgId && getOrgAncestorIds(personOrgId).includes(selectedOrgId)) return false;
    if (pickOnlyUnassigned && personOrgId) return false;
    if (pickPersonRole !== 'all' && !(person.roles || []).includes(pickPersonRole)) return false;
    const q = pickPersonSearch.trim().toLowerCase();
    if (q && !person.realName.toLowerCase().includes(q) && !person.phone.includes(q)) return false;
    return true;
  });
  const allPickCandidatesChecked =
    pickPersonCandidates.length > 0 && pickPersonCandidates.every((person) => pickPersonIds.includes(person.id));

  const togglePickPerson = (id: number) =>
    setPickPersonIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const toggleAllPickCandidates = () => {
    const ids = pickPersonCandidates.map((person) => person.id);
    setPickPersonIds((prev) =>
      allPickCandidatesChecked ? prev.filter((id) => !ids.includes(id)) : Array.from(new Set([...prev, ...ids]))
    );
  };

  const confirmPickPersons = () => {
    if (pickPersonIds.length === 0) return;
    setPersonnelList((prev) =>
      prev.map((person) =>
        pickPersonIds.includes(person.id) ? { ...person, orgIds: [selectedOrgId], primaryOrgId: selectedOrgId } : person
      )
    );
    triggerToast(`已将 ${pickPersonIds.length} 人加入「${currentOrg.name}」`);
    setIsPickPersonOpen(false);
  };

  /** 无归属机构的人员挂到一级根节点（优先「台中市网信办」） */
  const unassignedHomeRootId =
    orgNodes.find((node) => !node.parentId && node.name === '台中市网信办')?.id ||
    orgNodes.find((node) => !node.parentId)?.id;

  const isPersonUnassigned = (person: PersonnelItem) =>
    !getDeepestOrgId(orgNodes, person.orgIds, person.primaryOrgId);

  // Personnel Filtered for Selected Org or Root Platform
  const filteredPersonnel = personnelList.filter((p) => {
    if (p.recycled) return false;
    if (!isRootSelected) {
      const personOrgId = getDeepestOrgId(orgNodes, p.orgIds, p.primaryOrgId);
      if (!personOrgId) {
        // 无组织节点人员归在根节点下
        if (selectedOrgId !== unassignedHomeRootId) return false;
      } else {
        const belongsToSelected =
          personOrgId === selectedOrgId || getOrgAncestorIds(personOrgId).includes(selectedOrgId);
        if (!belongsToSelected) return false;
      }
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

  useEffect(() => {
    setPersonnelPage(1);
  }, [selectedOrgId, personnelSearch, isRootSelected]);

  const personnelTotalPages = Math.max(1, Math.ceil(filteredPersonnel.length / personnelPageSize));
  const safePersonnelPage = Math.min(personnelPage, personnelTotalPages);
  const pagedPersonnel = filteredPersonnel.slice(
    (safePersonnelPage - 1) * personnelPageSize,
    safePersonnelPage * personnelPageSize
  );

  const filteredLeaderCandidates = personnelList.filter((person) => {
    if (person.recycled) return false;
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
    if (person.recycled) return false;
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

  const getNodeCapacity = (orgId: string | null | undefined): number => {
    if (!orgId) return EXTERNAL_QUOTA_LIMIT;
    const node = orgNodes.find((item) => item.id === orgId);
    if (!node) return EXTERNAL_QUOTA_LIMIT;
    return node.quota ?? getNodeCapacity(node.parentId);
  };

  const getAllocatedQuota = (parentId: string | null, excludeId?: string) =>
    orgNodes
      .filter((node) => (node.parentId ?? null) === parentId && node.id !== excludeId)
      .reduce((sum, node) => sum + (node.quota ?? 0), 0);

  const isOrgDisabled = (orgId: string) => getOrgPath(orgId).some((node) => node.disabled);

  const openQuotaModal = (node: OrgNode) => {
    setQuotaModalOrgId(node.id);
    setQuotaUnlimited(node.quota === undefined);
    setQuotaInput(node.quota !== undefined ? String(node.quota) : '');
  };

  const saveOrgQuota = () => {
    const node = orgNodes.find((item) => item.id === quotaModalOrgId);
    if (!node) return;
    let nextQuota: number | undefined;
    if (!quotaUnlimited) {
      const value = Number(quotaInput);
      const used = orgHeadcount[node.id] || 0;
      const minQuota = used;
      const maxQuota = EXTERNAL_QUOTA_LIMIT;
      const message = !Number.isInteger(value)
        ? '请输入整数配额'
        : value < minQuota
          ? `配额不能少于已邀请用户数（${minQuota} 人）`
          : value > maxQuota
            ? `配额不能超过平台最大额度（${maxQuota} 人）`
            : '';
      if (message) {
        triggerToast(message);
        return;
      }
      nextQuota = value;
    }
    setOrgNodes((prev) =>
      prev.map((item) => (item.id === node.id ? { ...item, quota: nextQuota } : item))
    );
    setQuotaModalOrgId(null);
    triggerToast(
      nextQuota === undefined
        ? `「${node.name}」已改为共享上级配额`
        : `已将「${node.name}」人员配额设为 ${nextQuota} 人`
    );
  };

  const toggleOrgDisabled = (node: OrgNode) => {
    const descendantIds = getAllDescendantIds(node.id);
    if (node.disabled) {
      const disabledAncestor = getOrgPath(node.id).slice(0, -1).find((item) => item.disabled);
      if (disabledAncestor) {
        triggerToast(`上级节点「${disabledAncestor.name}」已停用，请先启用上级节点`);
        return;
      }
    } else if (
      !confirm(
        `确定停用「${node.name}」吗？${descendantIds.length ? `下级 ${descendantIds.length} 个节点将同时停用，` : ''}停用后节点内人员无法登录，也不能继续邀请用户。`
      )
    ) {
      return;
    }
    const affected = new Set([node.id, ...descendantIds]);
    const nextDisabled = !node.disabled;
    setOrgNodes((prev) => prev.map((item) => (affected.has(item.id) ? { ...item, disabled: nextDisabled } : item)));
    triggerToast(nextDisabled ? `已停用「${node.name}」${descendantIds.length ? `及下级 ${descendantIds.length} 个节点` : ''}` : `已启用「${node.name}」${descendantIds.length ? `及下级 ${descendantIds.length} 个节点` : ''}`);
  };

  const openInviteForOrg = (node: OrgNode) => {
    if (isOrgDisabled(node.id)) {
      triggerToast(`「${node.name}」已停用，启用后才能邀请用户`);
      return;
    }
    const used = orgHeadcount[node.id] || 0;
    const capacity = getNodeCapacity(node.id);
    if (used >= capacity) {
      triggerToast(`「${node.name}」人员配额已满（${used}/${capacity}），请先调整配额`);
      return;
    }
    setInviteTarget({ orgId: node.id });
  };

  const orgHeadcount = personnelList.reduce<Record<string, number>>((acc, person) => {
    if (person.recycled) return acc;
    const personOrgId = getDeepestOrgId(orgNodes, person.orgIds, person.primaryOrgId);
    if (!personOrgId) {
      if (unassignedHomeRootId) {
        acc[unassignedHomeRootId] = (acc[unassignedHomeRootId] || 0) + 1;
      }
      return acc;
    }
    getOrgAncestorIds(personOrgId).forEach((id) => {
      acc[id] = (acc[id] || 0) + 1;
    });
    return acc;
  }, {});

  // Helper function to render org tree recursively
  const renderOrgTreeNodes = (parentId: string | null = null, depth = 0) => {
    const nodes = getSortedOrgChildren(parentId, undefined);
    const isAddingHere = addingOrgTarget?.parentId === parentId;

    if (nodes.length === 0 && !isAddingHere) return null;

    return (
      <div className={`space-y-0.5 ${depth > 0 ? 'pl-3.5 border-l border-gray-200/60 ml-2.5 my-0.5' : ''}`}>
        {isAddingHere && renderInlineOrgInput()}
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

          const isDragging = draggingOrgId === node.id;
          const dragNode = orgNodes.find((item) => item.id === (draggingOrgIdRef.current || draggingOrgId));
          const canDropHere = Boolean(dragNode && dragNode.id !== node.id && sameOrgParent(dragNode, node));
          const hintHere = dropHint?.id === node.id ? dropHint.position : null;
          const nodeLeaderNames = getOrgLeaderNames(node);
          const nodeDisabled = isOrgDisabled(node.id);

          return (
            <div key={node.id}>
              <div
                onClick={() => {
                  if (orgDragMovedRef.current) {
                    orgDragMovedRef.current = false;
                    return;
                  }
                  setSelectedOrgId(node.id);
                  setIsRootSelected(false);
                  setViewingPersonnelId(null);
                }}
                onDragOver={(e) => {
                  if (!canDropHere) return;
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = 'move';
                  const rect = e.currentTarget.getBoundingClientRect();
                  const position = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
                  if (dropHint?.id !== node.id || dropHint.position !== position) {
                    setDropHint({ id: node.id, position });
                  }
                }}
                onDrop={(e) => {
                  if (!canDropHere || !draggingOrgId) return;
                  e.preventDefault();
                  e.stopPropagation();
                  const position = dropHint?.id === node.id ? dropHint.position : 'before';
                  reorderSiblingOrgs(draggingOrgId, node.id, position);
                  clearOrgDragState();
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    if (dropHint?.id === node.id) setDropHint(null);
                  }
                }}
                className={`group/org relative flex items-center justify-between py-1.5 px-2 rounded cursor-pointer transition-colors ${
                  isSelected && !isRootSelected
                    ? 'bg-blue-50 text-[#1E5ABB] font-bold shadow-2xs'
                    : 'hover:bg-gray-50 text-gray-700'
                } ${isDragging ? 'opacity-50' : ''} ${
                  hintHere === 'before' ? 'before:absolute before:left-2 before:right-2 before:top-0 before:h-0.5 before:bg-[#1E5ABB] before:rounded-full' : ''
                } ${
                  hintHere === 'after' ? 'after:absolute after:left-2 after:right-2 after:bottom-0 after:h-0.5 after:bg-[#1E5ABB] after:rounded-full' : ''
                }`}
              >
                <div className="flex items-center space-x-1 min-w-0 flex-1">
                  <button
                    type="button"
                    draggable
                    title="拖拽调整同级顺序"
                    aria-label={`拖拽调整「${node.name}」的同级顺序`}
                    onDragStart={(e) => {
                      e.stopPropagation();
                      orgDragMovedRef.current = true;
                      draggingOrgIdRef.current = node.id;
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', node.id);
                      setDraggingOrgId(node.id);
                    }}
                    onDragEnd={clearOrgDragState}
                    onClick={(e) => e.stopPropagation()}
                    className="p-0.5 rounded text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0"
                  >
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
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

                  {renamingOrgId === node.id ? (
                    renderRenameOrgInput()
                  ) : (
                    <>
                      <span
                        className={`truncate min-w-[2em] text-xs ${nodeDisabled ? 'text-gray-400 line-through' : ''}`}
                        title={nodeDisabled ? `${node.name}（已停用）` : node.name}
                      >
                        {node.name}
                      </span>
                      <span
                        className={`shrink-0 inline-flex items-center gap-0.5 text-[10px] font-normal tabular-nums ${
                          node.quota !== undefined && (orgHeadcount[node.id] || 0) >= node.quota
                            ? 'text-rose-500'
                            : isSelected && !isRootSelected
                              ? 'text-[#1E5ABB]/70'
                              : 'text-gray-400'
                        }`}
                        title={node.quota !== undefined ? '本节点及下级人数 / 人员配额' : '本节点及下级人数（共享上级配额）'}
                      >
                        <Users className="w-3 h-3" />
                        {orgHeadcount[node.id] || 0}
                        {node.quota !== undefined && `/${node.quota}`}
                      </span>
                      {node.disabled && (
                        <span className="shrink-0 px-1 rounded bg-rose-50 border border-rose-100 text-[10px] font-normal text-rose-500">停用</span>
                      )}
                      {nodeLeaderNames.length > 0 && (
                        <span
                          className={`${isSelected ? 'hidden' : 'inline-flex group-hover/org:hidden'} shrink-[3] min-w-[22px] items-center gap-0.5 max-w-[64px] px-1 rounded bg-amber-50 border border-amber-100 text-[10px] font-normal text-amber-700`}
                          title={`组织联系人：${nodeLeaderNames.join('、')}`}
                        >
                          <UserCheck className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate min-w-0">
                            {nodeLeaderNames.length > 1 ? `${nodeLeaderNames[0]}等${nodeLeaderNames.length}人` : nodeLeaderNames[0]}
                          </span>
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Node Hover Actions */}
                <div className={`${renamingOrgId === node.id ? 'hidden' : isSelected ? 'flex' : 'hidden group-hover/org:flex'} items-center space-x-1 shrink-0 pl-1`}>
                  <button
                    type="button"
                    onClick={(e) => openLeaderModal(node, e)}
                    title="设置组织联系人"
                    className="p-0.5 hover:bg-amber-100 text-amber-600 rounded cursor-pointer"
                  >
                    <UserCheck className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => startAddOrg(node.id, node.categoryId, e)}
                    title="添加子节点"
                    className="p-0.5 hover:bg-blue-100 text-blue-700 rounded cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => startRenameOrg(node, e)}
                    title="重命名此组织节点"
                    className="p-0.5 hover:bg-gray-200 text-gray-600 rounded cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteOrgNode(node, e)}
                    title="删除此组织节点"
                    className="p-0.5 hover:bg-rose-100 text-rose-600 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Child Nodes */}
              {((hasChildren && isNodeExpanded) || addingOrgTarget?.parentId === node.id) &&
                renderOrgTreeNodes(node.id, depth + 1)}
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
    <div className={embedded ? 'h-full min-h-[680px]' : 'space-y-4'}>
      {!embedded && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">组织机构设置</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            支持多层级无限树节点架构，人员仅归属单一机构节点
          </p>
        </div>
      )}

      <div className={embedded ? 'flex h-full min-h-0' : 'flex flex-col lg:flex-row gap-5'}>
        {/* Left Side: Tree Navigation Card */}
        <div className={embedded
          ? 'w-[300px] shrink-0 border-r border-slate-100 p-3 flex flex-col gap-3 min-h-0 bg-slate-50/30'
          : 'w-full lg:w-80 bg-white rounded-lg border border-gray-200/80 shadow-2xs p-4 flex flex-col space-y-3 shrink-0'}>
          {/* Search filter and tree actions */}
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <div className="relative flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={treeSearch}
                onChange={(e) => setTreeSearch(e.target.value)}
                placeholder="搜索组织节点"
                className={`w-full pl-8 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-gray-50/50 ${
                  treeSearch ? 'pr-7' : 'pr-3'
                }`}
              />
              {treeSearch && (
                <button
                  type="button"
                  onClick={() => setTreeSearch('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
                  title="清除"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
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
          <div className="space-y-1.5 text-xs text-gray-700 min-h-0 flex-1 overflow-y-auto pr-1">
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
                <span
                  className={`shrink-0 inline-flex items-center gap-0.5 text-[10px] font-normal tabular-nums ${isRootSelected ? 'text-[#1E5ABB]/70' : 'text-gray-400'}`}
                  title="平台总人数"
                >
                  <Users className="w-3 h-3" />
                  {personnelList.filter((person) => !person.recycled).length}
                </span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  startAddOrg(null, categories[0]?.id || 'cat-1', e);
                }}
                className={`ml-1 p-0.5 rounded text-blue-700 hover:bg-blue-100 cursor-pointer shrink-0 transition-opacity ${
                  isRootSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
                title="新增一级组织节点"
                aria-label="新增一级组织节点"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="ml-2 border-l border-gray-100 pl-2 space-y-1.5">
              {orgNodes.some((o) => !o.parentId) || addingOrgTarget?.parentId === null ? (
                renderOrgTreeNodes(null, 0)
              ) : (
                <div className="py-1 pl-2 text-[11px] text-gray-400 italic">尚无组织节点</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Main Area */}
        <div className={embedded ? 'flex-1 min-w-0 flex flex-col min-h-0' : 'flex-1 space-y-4 min-w-0'}>
          {viewingPersonnel ? (
          <div className={embedded
            ? 'flex-1 min-h-0 flex flex-col'
            : 'bg-white rounded-lg border border-gray-200/80 shadow-2xs overflow-hidden min-h-[calc(100vh-220px)] flex flex-col'}>
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
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-1 ring-black/10">
                  <PersonAvatar name={viewingPersonnel.realName} src={getPersonAvatarUrl(viewingPersonnel)} size="md" />
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
                      <span>所属机构</span>
                    </div>
                    <div className="p-4">
                      {viewingPersonnelOrg ? (
                        <div className="rounded-md border border-gray-200 p-3 text-xs flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-bold text-gray-800 truncate">{getOrgPathText(viewingPersonnelOrg.id)}</div>
                            <div className="mt-1 text-[11px] text-gray-400 font-mono">{viewingPersonnelOrg.code || '暂无编码'}</div>
                          </div>
                          <div className="text-[10px] text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded shrink-0">
                            {viewingPersonnelOrg.parentId ? '下级机构' : '一级机构'}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">未分配机构</div>
                      )}
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
            <div className={embedded ? 'px-5 py-4 space-y-3.5' : 'bg-white rounded-lg border border-gray-200/80 shadow-2xs p-4 space-y-3.5'}>
              {/* Title Header */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex items-center gap-2 text-base font-bold text-gray-800 min-w-0 whitespace-nowrap">
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
                  onClick={() => setInviteTarget({ orgId: undefined })}
                  className="inline-flex items-center gap-1 rounded bg-[#1E5ABB] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#134092] cursor-pointer shrink-0 whitespace-nowrap"
                  title="邀请外部人员加入"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>邀请用户</span>
                </button>
              </div>
            </div>
          ) : (
            /* Selected Org Node Detail Header Card */
            <div className={embedded ? 'px-5 py-4 space-y-3' : 'bg-white rounded-lg border border-gray-200/80 shadow-2xs p-4 space-y-3'}>
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
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center space-x-2 text-base font-bold text-gray-800 min-w-0 whitespace-nowrap">
                <Building2 className="w-5 h-5 text-[#1E5ABB] shrink-0" />
                <span className={`truncate ${isOrgDisabled(currentOrg.id) ? 'text-gray-400' : ''}`}>{currentOrg.name}</span>
                {isOrgDisabled(currentOrg.id) && (
                  <span className="shrink-0 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    {currentOrg.disabled ? '已停用' : '上级已停用'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => openLeaderModal(currentOrg)}
                  title="点击更换组织联系人"
                  className="inline-flex items-center gap-1 text-xs font-normal text-gray-500 pl-2 ml-1 border-l border-gray-200 hover:text-amber-700 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                  组织联系人：
                  {getOrgLeaderNames(currentOrg).length > 0 ? (
                    <span className="text-gray-800 font-bold" title={getOrgLeaderPhoneSummary(currentOrg)}>
                      {getOrgLeaderNames(currentOrg).join('、')}
                    </span>
                  ) : (
                    <span className="text-gray-400">未设置</span>
                  )}
                </button>
                {(() => {
                  const used = orgHeadcount[currentOrg.id] || 0;
                  const capacity = getNodeCapacity(currentOrg.id);
                  const full = used >= capacity;
                  const isShared = currentOrg.quota === undefined;
                  return (
                    <button
                      type="button"
                      onClick={() => openQuotaModal(currentOrg)}
                      title={isShared ? '共享上级配额，点击设置' : '单独配额，点击调整'}
                      className="inline-flex items-center gap-1.5 text-xs font-normal text-gray-500 pl-2 ml-1 border-l border-gray-200 hover:text-[#1E5ABB] cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-[#1E5ABB]" />
                      {isShared ? '共享配额：' : '单独配额：'}
                      <span className={`font-bold font-mono ${full ? 'text-rose-600' : 'text-gray-800'}`}>
                        {used} / {capacity}
                      </span>
                      <Edit3 className="w-3 h-3" />
                    </button>
                  );
                })()}
              </div>

              <div className="flex items-center space-x-2 shrink-0 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                  节点状态
                  <StatusSwitch enabled={!currentOrg.disabled} onToggle={() => toggleOrgDisabled(currentOrg)} />
                </span>
                <button
                  type="button"
                  onClick={() => openInviteForOrg(currentOrg)}
                  className="px-3 py-1.5 text-xs bg-[#1E5ABB] text-white rounded hover:bg-[#134092] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                  title={`邀请外部人员直接加入「${currentOrg.name}」`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>邀请用户</span>
                </button>
              </div>
            </div>
          </div>
        )}

          {/* Personnel Table Card */}
          <div className={embedded ? 'px-5 py-4 flex-1 min-w-0 border-t border-slate-100 space-y-4' : 'bg-white rounded-lg border border-gray-200/80 shadow-2xs p-5 space-y-4'}>
            <div className="flex items-center justify-between gap-3">
              <div className="relative min-w-0">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 whitespace-nowrap">
                  <span>
                    {isRootSelected
                      ? '『台中市网信办 (全平台)』在册人员账号'
                      : `『${currentOrg.name}』所属人员账号`}
                  </span>
                  <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-[#1E5ABB]">
                    {filteredPersonnel.length} 人
                  </span>
                </h3>
              </div>

              <div className="flex items-center space-x-2 shrink-0 whitespace-nowrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={personnelSearchDraft}
                    onChange={(e) => setPersonnelSearchDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setPersonnelSearch(personnelSearchDraft);
                        setPersonnelPage(1);
                      }
                    }}
                    placeholder="搜索姓名 / 手机号"
                    className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded w-48 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPersonnelSearch(personnelSearchDraft);
                    setPersonnelPage(1);
                  }}
                  className="h-8 px-3 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-semibold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  查询
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPersonnelSearchDraft('');
                    setPersonnelSearch('');
                    setPersonnelPage(1);
                  }}
                  className="h-8 px-3 bg-white hover:bg-gray-50 text-gray-500 text-xs font-medium rounded-[5px] border border-gray-200 inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  重置
                </button>
              </div>
            </div>

            {/* Personnel Table */}
            <div className="overflow-x-auto">
              <ExternalUserTable
                items={pagedPersonnel}
                orgNodes={orgNodes}
                getGroupName={(id) => getGroupName(id) || id}
                emptyText="当前节点暂无所属人员，点击右上角“新增人员”添加或调整归属"
                onAvatarClick={openPersonnelDetail}
                renderNameBadge={(item) => {
                  const ledOrgs = getLedOrgs(item);
                  if (ledOrgs.length === 0) return null;
                  return (
                    <span
                      className="shrink-0 inline-flex items-center justify-center text-amber-500"
                      title={`组织联系人：${ledOrgs.map((node) => getOrgPath(node.id).map((n) => n.name).join(' / ')).join('；')}`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                    </span>
                  );
                }}
                renderExtraActions={(item) => (
                  <>
                    <button
                      type="button"
                      onClick={() => openMoveOrg(item)}
                      className="h-6 px-2 rounded border border-blue-100 text-[11px] font-bold text-[#1E5ABB] hover:bg-blue-50 cursor-pointer"
                    >
                      修改节点
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromOrg(item)}
                      className="h-6 px-2 rounded border border-rose-100 text-[11px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      移出
                    </button>
                  </>
                )}
              />
            </div>

            {/* Pagination Footer */}
            <div className="border-t border-gray-100">
              <PaginationBar
                total={filteredPersonnel.length}
                page={safePersonnelPage}
                pageSize={personnelPageSize}
                onPageChange={setPersonnelPage}
                onPageSizeChange={(size) => {
                  setPersonnelPageSize(size);
                  setPersonnelPage(1);
                }}
              />
            </div>
          </div>
          </>
          )}
        </div>
      </div>

      {quotaModalOrgId && (() => {
        const node = orgNodes.find((item) => item.id === quotaModalOrgId);
        if (!node) return null;
        const used = orgHeadcount[node.id] || 0;
        const parentCapacity = getNodeCapacity(node.parentId);
        const minQuota = used;
        const maxQuota = EXTERNAL_QUOTA_LIMIT;
        const clampQuotaInput = (raw: string) => {
          if (raw === '') return '';
          const value = Number(raw);
          if (!Number.isFinite(value)) return String(minQuota);
          return String(Math.min(maxQuota, Math.max(minQuota, Math.round(value))));
        };
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setQuotaModalOrgId(null)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg text-xs" onClick={(event) => event.stopPropagation()}>
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#1E5ABB]" />
                    人员配额设置
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                    {getOrgPath(node.id).map((item) => item.name).join(' / ')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuotaModalOrgId(null)}
                  className="w-7 h-7 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-5 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '已邀请用户数', value: used, tone: 'text-gray-800' },
                    { label: '平台最大额度', value: maxQuota, tone: 'text-[#1E5ABB]' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-2">
                      <div className="text-[11px] text-gray-400 truncate" title={stat.label}>{stat.label}</div>
                      <div className={`text-base font-bold font-mono ${stat.tone}`}>
                        {stat.value}
                        <span className="text-[11px] font-normal text-gray-400 ml-0.5">人</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={quotaUnlimited}
                      onChange={() => setQuotaUnlimited(true)}
                      className="accent-[#1E5ABB]"
                    />
                    <span className="font-bold text-gray-800">共享上级配额</span>
                    <span className="text-gray-400">不单独限制，占用上级节点配额（当前上限 {parentCapacity} 人）</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!quotaUnlimited}
                      onChange={() => {
                        setQuotaUnlimited(false);
                        if (!quotaInput) {
                          setQuotaInput(String(Math.min(maxQuota, Math.max(minQuota, 10))));
                        } else {
                          setQuotaInput(clampQuotaInput(quotaInput));
                        }
                      }}
                      className="accent-[#1E5ABB]"
                    />
                    <span className="font-bold text-gray-800">单独设置配额</span>
                  </label>
                  {!quotaUnlimited && (
                    <div className="pl-6 space-y-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={minQuota}
                          max={maxQuota}
                          value={quotaInput}
                          onChange={(event) => setQuotaInput(event.target.value)}
                          onBlur={() => setQuotaInput((prev) => clampQuotaInput(prev))}
                          className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] font-mono"
                        />
                        <span className="text-gray-500">人</span>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        可设置范围 {minQuota} ~ {maxQuota} 人（已邀请用户数 ~ 平台最大额度），不可超出该范围
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuotaModalOrgId(null)}
                  className="px-4 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={saveOrgQuota}
                  className="px-4 py-1.5 bg-[#1E5ABB] text-white rounded font-bold hover:bg-[#174a9c] cursor-pointer"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {inviteTarget && (
        <InviteUserModal
          key={inviteTarget.orgId || 'root'}
          orgNodes={orgNodes}
          groups={groups}
          inviteCodes={inviteCodes}
          setInviteCodes={setInviteCodes}
          activatedCount={personnelList.filter((person) => !person.recycled).length}
          personnelList={personnelList}
          initialOrgId={inviteTarget.orgId}
          onClose={() => setInviteTarget(null)}
          onToast={triggerToast}
          onOpenRecords={() => {
            setInviteTarget(null);
            if (onNavigate) {
              onNavigate('user-org-management', 'invite');
              return;
            }
            setIsInviteRecordOpen(true);
          }}
        />
      )}

      {isInviteRecordOpen && (
        <InviteRecordModal
          inviteCodes={inviteCodes}
          setInviteCodes={setInviteCodes}
          orgNodes={orgNodes}
          personnelList={personnelList}
          onClose={() => setIsInviteRecordOpen(false)}
          onCopy={async (text, message) => {
            try {
              await navigator.clipboard.writeText(text);
              triggerToast(message);
            } catch {
              triggerToast('复制失败，请手动复制');
            }
          }}
        />
      )}

      {leaderModalOrgId && (() => {
        const target = orgNodes.find((node) => node.id === leaderModalOrgId);
        if (!target) return null;
        const scopeOrgIds = new Set([target.id, ...getAllDescendantIds(target.id)]);
        const query = leaderModalSearch.trim().toLowerCase();
        const candidates = personnelList.filter((person) => {
          if (person.recycled) return false;
          const inSubtree = person.orgIds.some((id) => scopeOrgIds.has(id));
          const unassignedUnderRoot =
            target.id === unassignedHomeRootId && isPersonUnassigned(person);
          if (!inSubtree && !unassignedUnderRoot) return false;
          if (!query) return true;
          return person.realName.toLowerCase().includes(query) || person.phone.includes(query);
        });
        const draftPeople = leaderDraftIds
          .map((id) => personnelList.find((person) => person.id === id))
          .filter((person): person is PersonnelItem => !!person);
        const originalIds = getCurrentLeaderIds(target);
        const unlinkedLeaderNames = getOrgLeaderNames(target).filter(
          (name) => !personnelList.some((person) => originalIds.includes(person.id) && person.realName === name)
        );

        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeLeaderModal}>
            <div
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col text-xs"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-amber-500" />
                    设置组织联系人
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                    {getOrgPath(target.id).map((node) => node.name).join(' / ')}，仅可选本节点及下级人员，每个节点仅一名
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeLeaderModal}
                  className="w-7 h-7 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 py-3 border-b border-gray-50 space-y-2.5">
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 shrink-0 pt-1">选定组织联系人</span>
                  <div className="flex flex-wrap gap-1.5 min-h-[26px]">
                    {draftPeople.length === 0 ? (
                      <span className="text-gray-400 pt-1">暂未选择，确认后将清空该节点负责人</span>
                    ) : (
                      draftPeople.map((person) => (
                        <span
                          key={person.id}
                          className="inline-flex items-center gap-1 h-6 pl-2 pr-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold"
                        >
                          {person.realName}
                          <button
                            type="button"
                            onClick={() => toggleLeaderDraft(person.id)}
                            className="w-4 h-4 rounded-full hover:bg-amber-200 flex items-center justify-center cursor-pointer"
                            title="移除"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
                {unlinkedLeaderNames.length > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-amber-50/70 border border-amber-100 text-amber-700">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    原负责人「{unlinkedLeaderNames.join('、')}」未关联人员账号，确认后将以本次选择为准
                  </div>
                )}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={leaderModalSearch}
                    onChange={(e) => setLeaderModalSearch(e.target.value)}
                    placeholder="在本节点及下级人员中搜索姓名 / 手机号"
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                  />
                </div>
              </div>

              <div className="flex-1 min-h-[240px] overflow-y-auto px-3 py-2">
                {candidates.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">本节点及下级暂无可选人员</div>
                ) : (
                  candidates.map((person) => {
                    const checked = leaderDraftIds.includes(person.id);
                    const personOrgId = getDeepestOrgId(orgNodes, person.orgIds, person.primaryOrgId);
                    const orgPath = personOrgId ? getOrgPath(personOrgId).map((node) => node.name).join(' / ') : '未分配组织';
                    return (
                      <label
                        key={person.id}
                        className={`flex items-center gap-3 px-2.5 py-2 rounded cursor-pointer transition-colors ${
                          checked ? 'bg-amber-50/70' : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="org-leader"
                          checked={checked}
                          onChange={() => setLeaderDraftIds([person.id])}
                          onClick={() => checked && setLeaderDraftIds([])}
                          className="w-3.5 h-3.5 accent-amber-500 cursor-pointer"
                        />
                        <span className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-slate-100">
                          <PersonAvatar name={person.realName} src={getPersonAvatarUrl(person)} size="sm" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-800">{person.realName}</span>
                            <span className="text-gray-400 tabular-nums">{maskPhone(person.phone)}</span>
                            {originalIds.includes(person.id) && (
                              <span className="px-1.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">当前负责人</span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate" title={orgPath}>{orgPath}</div>
                        </div>
                        <span className="text-[11px] text-gray-400 shrink-0">{person.roles.join('、')}</span>
                      </label>
                    );
                  })
                )}
              </div>

              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setLeaderDraftIds([])}
                  disabled={leaderDraftIds.length === 0}
                  className="text-rose-600 font-bold hover:underline disabled:text-gray-300 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                >
                  清空组织联系人
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeLeaderModal}
                    className="px-4 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={saveOrgLeaders}
                    className="px-4 py-1.5 bg-[#1E5ABB] text-white rounded font-bold hover:bg-[#174a9c] cursor-pointer"
                  >
                    确认设置
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {isPickPersonOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsPickPersonOpen(false)}>
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col text-xs"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-800 text-sm">新增人员至【{currentOrg.name}】</div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  从外部用户管理中勾选人员加入本节点；每人仅归属一个机构节点，已在本节点及下级的人员不再展示
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPickPersonOpen(false)}
                className="w-7 h-7 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-3 flex flex-wrap items-center gap-2 border-b border-gray-50">
              <div className="relative w-[200px]">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                <input
                  value={pickPersonSearch}
                  onChange={(event) => setPickPersonSearch(event.target.value)}
                  placeholder="搜索姓名 / 手机号"
                  className="w-full h-7 pl-8 pr-3 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                />
              </div>
              <select
                value={pickPersonRole}
                onChange={(event) => setPickPersonRole(event.target.value)}
                className="h-7 px-2 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
              >
                <option value="all">全部角色</option>
                {ACCOUNT_ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <label className="inline-flex items-center gap-1.5 text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pickOnlyUnassigned}
                  onChange={(event) => setPickOnlyUnassigned(event.target.checked)}
                  className="rounded text-[#1E5ABB] w-3.5 h-3.5"
                />
                仅看未分配机构
              </label>
              <span className="ml-auto text-gray-400">共 {pickPersonCandidates.length} 位可选</span>
            </div>
            <div className="flex-1 min-h-[320px] overflow-auto px-5 py-2">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50 text-gray-500">
                  <tr>
                    <th className="py-2 px-3 w-10">
                      <input
                        type="checkbox"
                        checked={allPickCandidatesChecked}
                        onChange={toggleAllPickCandidates}
                        className="rounded text-[#1E5ABB] w-3.5 h-3.5 cursor-pointer"
                      />
                    </th>
                    <th className="py-2 px-3 font-medium">姓名 / 手机号</th>
                    <th className="py-2 px-3 font-medium">当前机构</th>
                    <th className="py-2 px-3 font-medium">角色名称</th>
                    <th className="py-2 px-3 font-medium">账号状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pickPersonCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400">
                        暂无可加入的外部用户
                      </td>
                    </tr>
                  ) : (
                    pickPersonCandidates.map((person) => {
                      const checked = pickPersonIds.includes(person.id);
                      const orgPath = formatPersonOrgPaths(orgNodes, person.orgIds, undefined, person.primaryOrgId);
                      return (
                        <tr
                          key={person.id}
                          onClick={() => togglePickPerson(person.id)}
                          className={`cursor-pointer ${checked ? 'bg-blue-50/60' : 'hover:bg-gray-50'}`}
                        >
                          <td className="py-2.5 px-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePickPerson(person.id)}
                              onClick={(event) => event.stopPropagation()}
                              className="rounded text-[#1E5ABB] w-3.5 h-3.5 cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-black/10">
                                <PersonAvatar name={person.realName} src={getPersonAvatarUrl(person)} size="sm" />
                              </span>
                              <div className="min-w-0">
                                <div className="font-bold text-gray-800">{person.realName}</div>
                                <div className="font-mono text-[11px] text-gray-500">{maskPhone(person.phone)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 max-w-[240px]">
                            {orgPath ? <PersonOrgPathCell path={orgPath} /> : <span className="text-gray-300">未分配</span>}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <PersonRoleBadges roles={[(person.roles || [])[0] || '未分配']} />
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <FollowStatusBadges item={person} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <div className="text-gray-500">
                已选 <b className="text-[#1E5ABB]">{pickPersonIds.length}</b> 人
                {pickPersonIds.length > 0 && (
                  <button type="button" onClick={() => setPickPersonIds([])} className="ml-2 text-gray-400 hover:text-[#1E5ABB] cursor-pointer">
                    清空
                  </button>
                )}
                <span className="ml-3 text-[11px] text-gray-400">已归属其他机构的人员加入后将调整到本节点</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPickPersonOpen(false)}
                  className="h-8 px-4 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={confirmPickPersons}
                  disabled={pickPersonIds.length === 0}
                  className="h-8 px-4 rounded bg-[#1E5ABB] text-white font-bold hover:bg-[#134092] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  确认加入（{pickPersonIds.length}）
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {moveOrgTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setMoveOrgTarget(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md text-xs" onClick={(event) => event.stopPropagation()}>
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
              <div className="font-bold text-gray-800 text-sm">修改组织节点</div>
              <button
                type="button"
                onClick={() => setMoveOrgTarget(null)}
                className="w-7 h-7 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-gray-500">
                当前：<b className="text-gray-800">{moveOrgTarget.realName}</b>
                <span className="ml-2">
                  {formatPersonOrgPaths(orgNodes, moveOrgTarget.orgIds, undefined, moveOrgTarget.primaryOrgId) || '未分配'}
                </span>
              </div>
              <OrgCascadeSelect
                orgNodes={orgNodes}
                path={moveOrgPath}
                onChange={(path) => setMoveOrgPath(path.filter(Boolean))}
                label="调整到 *"
                hideHint
              />
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMoveOrgTarget(null)}
                className="h-8 px-4 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleMoveOrg}
                className="h-8 px-4 rounded bg-[#1E5ABB] text-white font-bold hover:bg-[#134092] cursor-pointer"
              >
                确认调整
              </button>
            </div>
          </div>
        </div>
      )}

      {isPersonnelLabelPickerOpen && personnelLabelPickerPersonId !== null && typeof document !== 'undefined' && (() => {
        const pickerPerson = personnelList.find((person) => person.id === personnelLabelPickerPersonId);
        if (!pickerPerson) return null;
        const selectedLabels = getPersonnelDisplayLabels(pickerPerson);
        const labelGroups = (['网格员', '审核员'] as Array<'网格员' | '审核员'>).filter((group) =>
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
                    当前账号角色未包含网格员或审核员
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {/* ----------------- MODALS ----------------- */}

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

              <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3 space-y-2" onClick={() => setOrgParentPickerOpen(false)}>
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

      {/* 3. Personnel Modal (Add / Edit with Single-Org Selection) */}
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
                    disabled={Boolean(editingPersonnel)}
                    readOnly={Boolean(editingPersonnel)}
                    title={editingPersonnel ? '账号名称不支持修改' : undefined}
                    className={`w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] font-mono ${
                      editingPersonnel ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'
                    }`}
                  />
                  {editingPersonnel && (
                    <div className="mt-1 text-[10px] text-gray-400">账号名称不支持修改</div>
                  )}
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

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-gray-700 font-medium">
                    所属机构 * <span className="text-gray-400 font-normal text-[11px]">(仅可选一个机构节点)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setPOrgIds([]);
                      setPPrimaryOrgId('');
                      setPLeaderOrgIds([]);
                      setPOrgPickerOpen(false);
                    }}
                    className="text-[11px] text-gray-500 hover:underline cursor-pointer font-medium"
                  >
                    清空
                  </button>
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
                    placeholder={pOrgIds[0] ? getOrgPathText(pOrgIds[0]) : '点击选择所属机构，可输入名称或编码检索'}
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
                            selectOrgForPerson(node.id);
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
                        <span className="text-[11px] text-gray-500 truncate">
                          {pOrgIds[0] ? `已选：${getOrgPathText(pOrgIds[0])}` : '请选择一个机构'}
                        </span>
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
                  {['管理员', ...ACCOUNT_ROLE_OPTIONS].map((role) => {
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
