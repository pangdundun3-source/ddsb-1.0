import React, { useState } from 'react';
import {
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  Edit3,
  Trash2,
  FolderPlus,
  Building2,
  UserCheck,
  Phone,
  Clock,
  Users,
  CheckSquare,
  Square,
  QrCode,
  Share2,
  Download,
  Copy,
  Check,
  Printer,
  ExternalLink,
  X,
  ChevronsUpDown,
  ChevronsDownUp,
  Award,
  Calendar,
  ShieldAlert,
  Building,
  Crown,
  ShieldCheck,
  Folder,
  KeyRound
} from 'lucide-react';

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
  systemVersion?: string;
  expireDate?: string;
}

export interface PersonnelItem {
  id: number;
  orgIds: string[]; // Multiple org nodes
  username: string;
  realName: string;
  wechat: string;
  phone: string;
  roles: string[]; // Multiple roles supported per account
  registerDate: string;
  status: '启用' | '禁用';
  isLeader?: boolean; // 是否节点负责人
}

export const OrgManagement: React.FC = () => {
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
      registerDate: '2023-10-01',
      status: '启用',
      isLeader: true,
    },
    {
      id: 2,
      orgIds: ['org-1', 'org-1-2', 'org-1-2-1'],
      username: 'lihua_bs',
      realName: '李华',
      wechat: 'lihua_work',
      phone: '139****8822',
      roles: ['报送员'],
      registerDate: '2023-10-15',
      status: '启用',
    },
    {
      id: 3,
      orgIds: ['org-1-1'],
      username: 'wangwei_old',
      realName: '王伟',
      wechat: 'ww_123',
      phone: '135****4455',
      roles: ['审核员'],
      registerDate: '2023-11-02',
      status: '禁用',
    },
    {
      id: 4,
      orgIds: ['org-1', 'org-2'],
      username: 'zhao_q',
      realName: '赵强',
      wechat: 'zq_work88',
      phone: '137****9911',
      roles: ['数据分析员', '报送员'],
      registerDate: '2023-12-05',
      status: '启用',
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
  const [orgLeaderNameInput, setOrgLeaderNameInput] = useState('');
  const [orgLeaderPhoneInput, setOrgLeaderPhoneInput] = useState('');

  // 3. Personnel Modal (Multiple Orgs Selection)
  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<PersonnelItem | null>(null);
  const [pUsername, setPUsername] = useState('');
  const [pRealName, setPRealName] = useState('');
  const [pWechat, setPWechat] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pRoles, setPRoles] = useState<string[]>(['报送员']);
  const [pOrgIds, setPOrgIds] = useState<string[]>([]);
  const [pIsLeader, setPIsLeader] = useState<boolean>(false);
  const [pLeaderOrgIds, setPLeaderOrgIds] = useState<string[]>([]);

  // 4. Universal QR Code Quantity Control State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrQuotaType, setQrQuotaType] = useState<'unlimited' | 'limit'>('limit');
  const [qrLimitCount, setQrLimitCount] = useState<number>(50);
  const [qrUsedCount, setQrUsedCount] = useState<number>(18);
  const [qrExpireOption, setQrExpireOption] = useState<string>('30d');

  // Root Platform Mode State
  const [isRootSelected, setIsRootSelected] = useState<boolean>(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetPassword = (person: PersonnelItem) => {
    triggerToast(`已成功将账号【${person.realName} (${person.username})】的密码重置为：123456`);
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
  };

  const currentCat = categories.find((c) => c.id === currentOrg.categoryId);

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

  const isOrgLedByPerson = (node: OrgNode, person: PersonnelItem | null) => {
    if (!person) return false;
    return node.leaderPersonId === person.id || node.leaderName === person.realName;
  };

  const getLeaderAssignableOrgIds = (orgIds: string[], person: PersonnelItem | null = editingPersonnel) =>
    orgIds.filter((orgId) => {
      const node = orgNodes.find((o) => o.id === orgId);
      if (!node) return false;
      return !node.leaderName || isOrgLedByPerson(node, person);
    });

  const selectedLeaderOrgs = pLeaderOrgIds
    .filter((orgId) => pOrgIds.includes(orgId))
    .map((orgId) => orgNodes.find((node) => node.id === orgId))
    .filter((node): node is OrgNode => !!node);

  const readdableLeaderOrgs = getLeaderAssignableOrgIds(pOrgIds)
    .filter((orgId) => !pLeaderOrgIds.includes(orgId))
    .map((orgId) => orgNodes.find((node) => node.id === orgId))
    .filter((node): node is OrgNode => !!node);

  // Helper: Count direct sub-nodes
  const getDirectSubNodes = (parentId: string) => orgNodes.filter((o) => o.parentId === parentId);

  // Helper: Get all descendant node IDs recursively
  const getAllDescendantIds = (parentId: string): string[] => {
    const children = orgNodes.filter((o) => o.parentId === parentId);
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
      const children = orgNodes.filter(
        (o) => o.categoryId === catId && o.parentId === parentId && !disabledIds.has(o.id)
      );
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
    setOrgLeaderNameInput('');
    setOrgLeaderPhoneInput('');
    setIsOrgModalOpen(true);
  };

  const openEditOrgModal = (node: OrgNode, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingOrgNode(node);
    setOrgNameInput(node.name);
    setOrgCategoryIdInput(node.categoryId);
    setOrgParentIdInput(node.parentId || '');
    setOrgCodeInput(node.code || '');
    setOrgLeaderNameInput(node.leaderName || '');
    setOrgLeaderPhoneInput(node.leaderPhone || '');
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
    if (!orgNameInput.trim() || !orgCategoryIdInput) return;

    if (editingOrgNode) {
      setOrgNodes((prev) =>
        prev.map((o) =>
          o.id === editingOrgNode.id
            ? {
                ...o,
                name: orgNameInput.trim(),
                categoryId: orgCategoryIdInput,
                parentId: orgParentIdInput || null,
                code: orgCodeInput.trim(),
                leaderName: orgLeaderNameInput.trim(),
                leaderPhone: orgLeaderPhoneInput.trim(),
              }
            : o
        )
      );
    } else {
      const newOrgId = 'org-' + Date.now();
      const newOrg: OrgNode = {
        id: newOrgId,
        categoryId: orgCategoryIdInput,
        parentId: orgParentIdInput || null,
        name: orgNameInput.trim(),
        code: orgCodeInput.trim() || `ORG-${Math.floor(100000 + Math.random() * 900000)}`,
        leaderName: orgLeaderNameInput.trim(),
        leaderPhone: orgLeaderPhoneInput.trim(),
        systemVersion: '正式版',
        expireDate: '2026-12-31',
      };
      setOrgNodes((prev) => [...prev, newOrg]);
      setSelectedOrgId(newOrgId);
      if (orgParentIdInput) {
        setExpandedNodes((prev) => ({ ...prev, [orgParentIdInput]: true }));
      }
      setExpandedCats((prev) => ({ ...prev, [orgCategoryIdInput]: true }));
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
    }
  };

  const openAddPersonnelModal = () => {
    setEditingPersonnel(null);
    setPUsername('');
    setPRealName('');
    setPWechat('');
    setPPhone('');
    setPRoles(['报送员']);
    setPOrgIds([currentOrg.id]); // Default to selected org
    setPIsLeader(false);
    setPLeaderOrgIds([]);
    setIsPersonnelModalOpen(true);
  };

  const openEditPersonnelModal = (item: PersonnelItem) => {
    setEditingPersonnel(item);
    setPUsername(item.username);
    setPRealName(item.realName);
    setPWechat(item.wechat);
    setPPhone(item.phone);
    setPRoles(item.roles && item.roles.length > 0 ? [...item.roles] : []);
    setPOrgIds([...item.orgIds]);
    setPIsLeader(!!item.isLeader);
    setPLeaderOrgIds(item.isLeader ? getLeaderAssignableOrgIds(item.orgIds, item) : []);
    setIsPersonnelModalOpen(true);
  };

  const toggleOrgSelectionForPerson = (orgId: string) => {
    const isSelected = pOrgIds.includes(orgId);
    const nextOrgIds = isSelected ? pOrgIds.filter((id) => id !== orgId) : [...pOrgIds, orgId];
    setPOrgIds(nextOrgIds);

    if (isSelected) {
      setPLeaderOrgIds((prev) => prev.filter((id) => id !== orgId));
      return;
    }

    const canSetAsLeader = getLeaderAssignableOrgIds([orgId]).includes(orgId);
    if (pIsLeader && canSetAsLeader) {
      setPLeaderOrgIds((prev) => (prev.includes(orgId) ? prev : [...prev, orgId]));
    }
  };

  const toggleRoleSelectionForPerson = (role: string) => {
    setPRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleLeaderToggleForPerson = (checked: boolean) => {
    setPIsLeader(checked);
    setPLeaderOrgIds(checked ? getLeaderAssignableOrgIds(pOrgIds) : []);
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

    const effectiveLeaderOrgIds = pIsLeader
      ? pLeaderOrgIds.filter((orgId) => pOrgIds.includes(orgId))
      : [];
    const nextIsLeader = effectiveLeaderOrgIds.length > 0;
    const savedPersonId = editingPersonnel?.id ?? Date.now();
    const savedPhone = editingPersonnel ? pPhone : pPhone || '138****' + Math.floor(1000 + Math.random() * 9000);

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
                isLeader: nextIsLeader,
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
        isLeader: nextIsLeader,
      };
      setPersonnelList((prev) => [...prev, newP]);
    }

    setOrgNodes((prev) =>
      prev.map((node) => {
        if (effectiveLeaderOrgIds.includes(node.id)) {
          return {
            ...node,
            leaderName: pRealName,
            leaderPhone: savedPhone,
            leaderPersonId: savedPersonId,
          };
        }

        if (editingPersonnel && isOrgLedByPerson(node, editingPersonnel)) {
          return {
            ...node,
            leaderName: '',
            leaderPhone: '',
            leaderPersonId: undefined,
          };
        }

        return node;
      })
    );

    setIsPersonnelModalOpen(false);
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case '管理员':
        return 'bg-blue-100/80 text-blue-700 border border-blue-200';
      case '数据分析员':
        return 'bg-purple-100/80 text-purple-700 border border-purple-200';
      case '审核员':
        return 'bg-amber-100/80 text-amber-700 border border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  // Helper function to render org tree recursively
  const renderOrgTreeNodes = (categoryId: string, parentId: string | null = null, depth = 0) => {
    const nodes = orgNodes.filter((o) => o.categoryId === categoryId && o.parentId === parentId);

    if (nodes.length === 0) return null;

    return (
      <div className={`space-y-0.5 ${depth > 0 ? 'pl-3.5 border-l border-gray-200/60 ml-2.5 my-0.5' : ''}`}>
        {nodes.map((node) => {
          const children = orgNodes.filter((o) => o.parentId === node.id);
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
              <div
                onClick={() => {
                  setSelectedOrgId(node.id);
                  setIsRootSelected(false);
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

                  <span className="truncate text-xs">{node.name}</span>

                  {node.leaderName && (
                    <span className="text-[10px] text-gray-400 font-normal shrink-0 bg-gray-100 px-1 rounded">
                      {node.leaderName}
                    </span>
                  )}
                </div>

                {/* Node Hover Actions */}
                <div className="opacity-0 group-hover/org:opacity-100 flex items-center space-x-1 transition-opacity shrink-0">
                  <button
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

              {/* Child Nodes */}
              {hasChildren && isNodeExpanded && renderOrgTreeNodes(categoryId, node.id, depth + 1)}
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
          支持多层级无限树节点架构、每个节点设置负责人及多机构人员关联绑定
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Side: Tree Navigation Card */}
        <div className="w-full lg:w-80 bg-white rounded-lg border border-gray-200/80 shadow-2xs p-4 flex flex-col space-y-3 shrink-0">
          {/* Top Search & Actions */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={treeSearch}
              onChange={(e) => setTreeSearch(e.target.value)}
              placeholder="搜索分类或各级机构..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-gray-50/50"
            />
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 pb-2 pt-1">
            <button
              onClick={() => setIsRootSelected(true)}
              className={`px-2 py-1 rounded text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                isRootSelected
                  ? 'bg-blue-100 text-[#1E5ABB] ring-1 ring-[#1E5ABB]/30 shadow-2xs'
                  : 'text-gray-800 hover:bg-gray-100 hover:text-[#1E5ABB]'
              }`}
              title="点击查看台中市网信办 (平台基础信息)"
            >
              <Building2 className={`w-3.5 h-3.5 ${isRootSelected ? 'text-[#1E5ABB]' : 'text-gray-500'}`} />
              <span>台中市网信办</span>
            </button>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={openAddCategoryModal}
                className="px-2 py-0.5 bg-blue-50 text-[#1E5ABB] hover:bg-blue-100 rounded text-[11px] font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                title="新增顶级分类"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>分类</span>
              </button>
              <button
                onClick={toggleAllExpand}
                className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                  isAllExpanded
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    : 'bg-blue-50 text-[#1E5ABB] hover:bg-blue-100 border border-blue-200'
                }`}
                title={isAllExpanded ? "收起所有节点 (只保留分类)" : "展开所有节点"}
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
            {categories.map((cat) => {
              const rootOrgs = orgNodes.filter((o) => o.categoryId === cat.id && !o.parentId);
              const isCatExpanded = expandedCats[cat.id] || !!treeSearch;

              return (
                <div key={cat.id} className="border-b border-gray-50 pb-1.5 last:border-b-0">
                  {/* Category Node Header */}
                  <div
                    onClick={() => toggleCategoryExpand(cat.id)}
                    className="group flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 rounded cursor-pointer font-bold text-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-1.5 min-w-0">
                      {isCatExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      )}
                      <span className="text-amber-500 shrink-0">📁</span>
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] text-gray-400 font-normal shrink-0">
                        ({rootOrgs.length})
                      </span>
                    </div>

                    {/* Category Operations */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity shrink-0">
                      <button
                        onClick={(e) => openAddOrgModal(cat.id, null, e)}
                        title="在此分类下增加一级机构"
                        className="p-1 hover:bg-blue-50 text-blue-600 rounded cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => openEditCategoryModal(cat, e)}
                        title="修改分类"
                        className="p-1 hover:bg-gray-200 text-gray-600 rounded cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteCategory(cat, e)}
                        title="删除分类"
                        className="p-1 hover:bg-rose-50 text-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Root and Sub-Org Nodes Tree */}
                  {isCatExpanded && (
                    <div className="pl-2">
                      {rootOrgs.length === 0 ? (
                        <div className="py-1 pl-6 text-[11px] text-gray-400 italic flex items-center justify-between">
                          <span>尚无机构</span>
                          <button
                            onClick={(e) => openAddOrgModal(cat.id, null, e)}
                            className="text-[#1E5ABB] hover:underline font-normal not-italic cursor-pointer"
                          >
                            + 一级机构
                          </button>
                        </div>
                      ) : (
                        renderOrgTreeNodes(cat.id, null, 0)
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side Main Area */}
        <div className="flex-1 space-y-4 min-w-0">
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
                    <span>服务区间：2024-01-01 ~ 2028-12-31</span>
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 shrink-0 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>剩余 872 天</span>
                  </span>
                </div>
              </div>

              {/* 4 Platform Basic Info Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                {/* 1. 二维码总数 */}
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

                {/* 2. 平台超级管理员 */}
                <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/30 p-3 rounded-lg border border-amber-100/90 space-y-1">
                  <div className="text-xs text-gray-500 flex items-center space-x-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>平台超级管理员</span>
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
                    <span className="text-xs text-gray-500">个架构节点</span>
                  </div>
                  <div className="text-[10px] text-gray-400">分布于 {categories.length} 个组织分类</div>
                </div>

                {/* 4. 平台人员总数 */}
                <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/30 p-3 rounded-lg border border-purple-100/90 space-y-1">
                  <div className="text-xs text-gray-500 flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>平台人员总数</span>
                  </div>
                  <div className="flex items-baseline space-x-1 pt-0.5">
                    <span className="text-xl font-bold text-purple-700">{personnelList.length}</span>
                    <span className="text-xs text-gray-500">在册人员</span>
                  </div>
                  <div className="text-[10px] text-purple-600 font-medium">包含管理员/审核员/报送员</div>
                </div>
              </div>
            </div>
          ) : (
            /* Selected Org Node Detail Header Card */
            <div className="bg-white rounded-lg border border-gray-200/80 shadow-2xs p-4 space-y-3">
            {/* Optimized Clean Breadcrumb Path */}
            <div className="flex items-center space-x-1 text-xs text-gray-500 overflow-x-auto pb-2 border-b border-gray-100">
              {currentCat && (
                <>
                  <span className="text-gray-400 font-medium shrink-0">{currentCat.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                </>
              )}
              {selectedOrgPath.map((node, index) => (
                <React.Fragment key={node.id}>
                  {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                  <button
                    onClick={() => setSelectedOrgId(node.id)}
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
                {currentOrg.code && (
                  <span className="text-xs font-mono font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded shrink-0">
                    {currentOrg.code}
                  </span>
                )}
                {currentOrg.parentId ? (
                  <span className="text-[11px] font-normal text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 shrink-0">
                    下级机构
                  </span>
                ) : (
                  <span className="text-[11px] font-normal text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 shrink-0">
                    一级机构
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => setIsQrModalOpen(true)}
                  className="px-3 py-1.5 text-xs bg-[#1E5ABB] hover:bg-[#134092] text-white rounded font-bold flex items-center space-x-1.5 cursor-pointer transition-colors shadow-2xs shrink-0"
                  title="生成与配置当前机构的通用二维码"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-300" />
                  <span>二维码配置</span>
                </button>
                <button
                  onClick={() => openAddOrgModal(currentOrg.categoryId, currentOrg.id)}
                  className="px-3 py-1.5 text-xs bg-blue-50 text-[#1E5ABB] border border-blue-200 rounded hover:bg-blue-100 font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                  title="在此节点下方新增子机构"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>新增子机构</span>
                </button>
                <button
                  onClick={() => openEditOrgModal(currentOrg)}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                  <span>编辑机构</span>
                </button>
              </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-1">
              {/* Leader Box */}
              <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-3 rounded-lg border border-blue-100/80 space-y-1">
                <div className="text-xs text-gray-500 flex items-center space-x-1">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>机构负责人</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-sm font-bold text-gray-900">
                    {currentOrg.leaderName || '未指定'}
                  </span>
                </div>
                {currentOrg.leaderPhone ? (
                  <div className="text-[11px] text-gray-500 font-mono flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span>{currentOrg.leaderPhone}</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-gray-400">暂无联系电话</div>
                )}
              </div>

              {/* Directly Belonging Personnel */}
              <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-100 space-y-1">
                <div className="text-xs text-gray-400 flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>直属关联账号</span>
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-xl font-bold text-[#1E5ABB]">{filteredPersonnel.length}</span>
                  <span className="text-xs text-gray-500">人</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-medium truncate">支持多机构兼属</div>
              </div>

              {/* Sub-node count */}
              <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-100 space-y-1">
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
              <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/30 p-3 rounded-lg border border-indigo-100/90 space-y-1.5">
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
              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  {isRootSelected
                    ? '『台中市网信办 (全平台)』在册人员账号'
                    : `『${currentOrg.name}』关联人员账号`}
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
                    <th className="py-2.5 px-3">多机构归属节点</th>
                    <th className="py-2.5 px-3">微信号</th>
                    <th className="py-2.5 px-3">手机号</th>
                    <th className="py-2.5 px-3">角色</th>
                    <th className="py-2.5 px-3">登记时间</th>
                    <th className="py-2.5 px-3 text-center">状态</th>
                    <th className="py-2.5 px-3 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredPersonnel.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-gray-400">
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
                            {item.isLeader && (
                              <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200/90 rounded text-[10px] font-bold shrink-0">
                                <Crown className="w-3 h-3 text-amber-500" />
                                <span>机构负责人</span>
                              </span>
                            )}
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
                                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                                    isCurrent
                                      ? 'bg-blue-100 text-[#1E5ABB] font-bold border border-blue-200'
                                      : 'bg-gray-100 text-gray-600 border border-gray-200'
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
                        <td className="py-2.5 px-3 font-mono text-gray-400">{item.registerDate}</td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {item.status === '启用' ? (
                            <span className="inline-flex items-center space-x-1 text-emerald-600 font-medium text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>启用</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-gray-400 font-medium text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                              <span>禁用</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => openEditPersonnelModal(item)}
                              title="编辑多机构归属及个人信息"
                              className="text-gray-400 hover:text-blue-600 cursor-pointer p-1 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleResetPassword(item)}
                              title="重置密码"
                              className="text-amber-600 hover:text-amber-700 cursor-pointer p-1 hover:bg-amber-50 rounded transition-colors"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleTogglePersonnelStatus(item.id)}
                              title={item.status === '启用' ? '停用账号' : '启用账号'}
                              className="cursor-pointer"
                            >
                              <div
                                className={`w-7 h-3.5 flex items-center rounded-full p-0.5 transition-colors ${
                                  item.status === '启用'
                                    ? 'bg-emerald-500 justify-end'
                                    : 'bg-gray-300 justify-start'
                                }`}
                              >
                                <div className="w-2.5 h-2.5 bg-white rounded-full shadow-2xs"></div>
                              </div>
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
        </div>
      </div>

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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-800">
                {editingOrgNode ? '编辑机构节点' : '新增子机构'}
              </h3>
              <button
                onClick={() => setIsOrgModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOrgNode} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">所属分类 *</label>
                  <select
                    value={orgCategoryIdInput}
                    onChange={(e) => setOrgCategoryIdInput(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1 flex items-center justify-between">
                    <span>父级机构节点 (树级结构)</span>
                    <span className="text-[10px] text-[#1E5ABB] font-normal">树状层级派生</span>
                  </label>
                  <select
                    value={orgParentIdInput}
                    onChange={(e) => setOrgParentIdInput(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white cursor-pointer"
                  >
                    <option value="">(无父节点 - 作为顶级一级机构)</option>
                    {getTreeOptionsForSelect(orgCategoryIdInput, editingOrgNode?.id).map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.prefix} {opt.name} {opt.depth === 0 ? ' [一级]' : ` [${opt.depth + 1}级节点]`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
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

              <div>
                <label className="block text-gray-700 font-medium mb-1">机构编码 / 代码</label>
                <input
                  type="text"
                  value={orgCodeInput}
                  onChange={(e) => setOrgCodeInput(e.target.value)}
                  placeholder="例如: XCB-340100"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                />
              </div>

              {/* Leader Settings Section */}
              <div className="p-3 bg-blue-50/50 rounded-md border border-blue-100 space-y-2">
                <div className="text-xs font-bold text-[#1E5ABB] flex items-center space-x-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>机构负责人信息设置</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">负责人姓名</label>
                    <input
                      type="text"
                      value={orgLeaderNameInput}
                      onChange={(e) => setOrgLeaderNameInput(e.target.value)}
                      placeholder="例如: 陈建国"
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">负责人联系电话</label>
                    <input
                      type="text"
                      value={orgLeaderPhoneInput}
                      onChange={(e) => setOrgLeaderPhoneInput(e.target.value)}
                      placeholder="例如: 13812345678"
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded font-mono focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOrgModalOpen(false)}
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
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
                        const allOrgIds = orgNodes.map((n) => n.id);
                        setPOrgIds(allOrgIds);
                        if (pIsLeader) {
                          setPLeaderOrgIds(getLeaderAssignableOrgIds(allOrgIds));
                        }
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
                        setPLeaderOrgIds([]);
                      }}
                      className="text-gray-500 hover:underline cursor-pointer font-medium"
                    >
                      清空
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg max-h-48 overflow-y-auto space-y-2">
                  {categories.map((cat) => {
                    const rootCatNodes = orgNodes.filter((o) => o.categoryId === cat.id && !o.parentId);
                    if (rootCatNodes.length === 0) return null;

                    const renderSelectionTreeNode = (node: OrgNode, depth: number) => {
                      const children = orgNodes.filter((o) => o.parentId === node.id);
                      const isChecked = pOrgIds.includes(node.id);

                      return (
                        <div key={node.id} className="space-y-1">
                          <div
                            onClick={() => toggleOrgSelectionForPerson(node.id)}
                            className={`flex items-center justify-between px-2 py-1.5 rounded transition-all cursor-pointer border ${
                              isChecked
                                ? 'bg-blue-50 text-[#1E5ABB] border-blue-300 font-bold shadow-2xs'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                            }`}
                            style={{ marginLeft: `${depth * 14}px` }}
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              {isChecked ? (
                                <CheckSquare className="w-3.5 h-3.5 text-[#1E5ABB] shrink-0" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                              )}
                              <Building2
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isChecked ? 'text-[#1E5ABB]' : depth === 0 ? 'text-gray-600' : 'text-gray-400'
                                }`}
                              />
                              <span className="truncate text-xs">{node.name}</span>
                              {node.code && (
                                <span className="text-[10px] font-mono text-gray-400 shrink-0">({node.code})</span>
                              )}
                            </div>
                            {node.leaderName && (
                              <span className="text-[10px] text-gray-400 font-normal shrink-0 bg-gray-100 px-1.5 py-0.2 rounded">
                                负责人: {node.leaderName}
                              </span>
                            )}
                          </div>

                          {/* Child Nodes */}
                          {children.length > 0 && (
                            <div className="space-y-1">
                              {children.map((child) => renderSelectionTreeNode(child, depth + 1))}
                            </div>
                          )}
                        </div>
                      );
                    };

                    return (
                      <div key={cat.id} className="space-y-1.5 pb-1 border-b border-gray-100 last:border-b-0">
                        <div className="text-[11px] font-bold text-gray-600 bg-gray-200/70 px-2 py-0.5 rounded flex items-center space-x-1">
                          <Folder className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          <span>{cat.name}</span>
                        </div>
                        <div className="space-y-1 pl-1">
                          {rootCatNodes.map((rootNode) => renderSelectionTreeNode(rootNode, 0))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Node Leader Setting Section */}
              <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-bold text-gray-800 text-xs">设置机构负责人</span>
                      <p className="text-[10px] text-gray-500 font-normal">勾选后将该人员指定为归属机构节点的负责人/主管</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={pIsLeader}
                      onChange={(e) => handleLeaderToggleForPerson(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
                {pIsLeader && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center space-x-1 text-amber-800 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>待设置负责人机构</span>
                      </div>
                      <span className="text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        {selectedLeaderOrgs.length} 个
                      </span>
                    </div>

                    {selectedLeaderOrgs.length > 0 ? (
                      <div className="max-h-28 overflow-y-auto space-y-1">
                        {selectedLeaderOrgs.map((node) => (
                          <div
                            key={node.id}
                            className="flex items-center justify-between gap-2 bg-white border border-amber-200 rounded px-2 py-1.5"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                                <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span className="truncate">{node.name}</span>
                                {node.code && (
                                  <span className="text-[10px] font-mono text-gray-400 shrink-0">({node.code})</span>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-500 truncate pl-5">
                                {getOrgPathText(node.id)}
                              </div>
                            </div>
                            <button
                              type="button"
                              title="从待设置负责人机构中移除"
                              onClick={() => setPLeaderOrgIds((prev) => prev.filter((id) => id !== node.id))}
                              className="w-6 h-6 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center shrink-0 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-700 bg-amber-100/80 px-2.5 py-2 rounded border border-amber-200">
                        已选机构中暂无可设置的空缺负责人机构
                      </div>
                    )}

                    {readdableLeaderOrgs.length > 0 && (
                      <div className="pt-1 border-t border-amber-200/80">
                        <div className="text-[10px] text-amber-700 mb-1">可重新添加</div>
                        <div className="flex flex-wrap gap-1.5">
                          {readdableLeaderOrgs.map((node) => (
                            <button
                              key={node.id}
                              type="button"
                              onClick={() => setPLeaderOrgIds((prev) => [...prev, node.id])}
                              className="flex items-center gap-1 px-2 py-1 bg-white border border-amber-200 rounded text-[11px] text-amber-800 hover:bg-amber-100 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span className="max-w-28 truncate">{node.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
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

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  系统角色 * (可多选角色)
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['管理员', '报送员', '审核员', '数据分析员'].map((role) => {
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

            {/* Quota Limit Control Header Panel */}
            <div className="bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/60 border border-blue-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-800 flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-[#1E5ABB]" />
                  <span>通用二维码名额/数量限制控制</span>
                </label>
                <div className="flex items-center space-x-1.5 text-xs bg-white p-1 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setQrQuotaType('limit')}
                    className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                      qrQuotaType === 'limit'
                        ? 'bg-[#1E5ABB] text-white font-bold shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    按数量限制
                  </button>
                  <button
                    onClick={() => setQrQuotaType('unlimited')}
                    className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                      qrQuotaType === 'unlimited'
                        ? 'bg-[#1E5ABB] text-white font-bold shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    不限数量
                  </button>
                </div>
              </div>

              {qrQuotaType === 'limit' ? (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-gray-500 font-medium">快速设置最大扫码注册名额:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[10, 30, 50, 100, 200].map((num) => (
                        <button
                          key={num}
                          onClick={() => setQrLimitCount(num)}
                          className={`px-2.5 py-1 text-xs rounded-md border transition-all cursor-pointer ${
                            qrLimitCount === num
                              ? 'bg-[#1E5ABB] text-white font-bold border-[#1E5ABB] shadow-2xs'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {num} 人名额
                        </button>
                      ))}
                    </div>
                  </div>

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
                  { label: '7天有效', val: '7d' },
                  { label: '30天有效', val: '30d' },
                  { label: '90天有效', val: '90d' },
                  { label: '长期有效', val: 'permanent' },
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
              </div>
            </div>

            {/* Bottom Export & Print Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  const svgElement = document.getElementById('org-qrcode-svg');
                  if (!svgElement) return;
                  const svgData = new XMLSerializer().serializeToString(svgElement);
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  const img = new Image();
                  img.onload = () => {
                    canvas.width = 400;
                    canvas.height = 400;
                    if (ctx) {
                      ctx.fillStyle = '#FFFFFF';
                      ctx.fillRect(0, 0, 400, 400);
                      ctx.drawImage(img, 0, 0, 400, 400);
                      const a = document.createElement('a');
                      a.download = `${currentOrg.name}_通用受控二维码_${
                        qrQuotaType === 'limit' ? qrLimitCount + '人名额' : '不限数量'
                      }.png`;
                      a.href = canvas.toDataURL('image/png');
                      a.click();
                    }
                  };
                  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                }}
                className="py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded border border-indigo-200 flex items-center justify-center space-x-1 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载通用二维码 PNG</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded border border-gray-200 flex items-center justify-center space-x-1 cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-gray-500" />
                <span>打印分发海报</span>
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
