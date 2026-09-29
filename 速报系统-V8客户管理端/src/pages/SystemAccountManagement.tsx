import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Trash2,
  RotateCcw,
  Edit3,
  X,
  RefreshCw,
  Copy,
  KeyRound,
  Download,
  Send,
  Building2,
  Circle,
  ChevronDown,
  ChevronRight,
  Check,
  MessageCircle
} from 'lucide-react';
import type { OrgNode, PersonnelItem } from './OrgManagement';
import {
  ACCOUNT_ROLE_OPTIONS,
  buildOrgIdPath,
  formatPersonOrgPaths,
  generateActivationCode,
  getDeepestOrgId,
  getOrgChildrenOf,
  getOrgFullPath,
  INITIAL_FOLLOWERS,
  type InviteCode,
  type OfficialAccountFollower,
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

interface SystemAccountManagementProps {
  shared: UserOrgSharedState;
}

const PAGE_SIZE = 8;

const createEmptyAccountQuery = () => ({
  search: '',
  orgs: [] as string[],
  roles: [] as string[],
  groups: [] as string[],
  statuses: [] as string[]
});

const INVITE_VALIDITY_OPTIONS = [
  { id: '1d', label: '24小时', hours: 24 },
  { id: '7d', label: '7天', hours: 168 },
  { id: '30d', label: '30天', hours: 720 },
  { id: 'custom', label: '自定义' }
] as const;

type InviteValidityId = (typeof INVITE_VALIDITY_OPTIONS)[number]['id'];

const padTime = (value: number) => String(value).padStart(2, '0');

const toLocalDateTimeValue = (date: Date) =>
  `${date.getFullYear()}-${padTime(date.getMonth() + 1)}-${padTime(date.getDate())}T${padTime(date.getHours())}:${padTime(date.getMinutes())}`;

const addHoursLocal = (hours: number) => toLocalDateTimeValue(new Date(Date.now() + hours * 3600 * 1000));

const formatDateTimeLabel = (value: string) => (value ? value.replace('T', ' ') : '—');

const INVITE_COUNT_OPTIONS = [1, 5, 10, 20, 50] as const;

type InviteListFilter = 'all' | '未使用' | '已使用' | '已过期';
type InviteMode = 'code' | 'active';
type FollowerInviteStatus = 'joined' | 'invited' | 'available' | 'selected';

interface ActiveInviteDraft {
  followerId: string;
  name: string;
  wechat: string;
  phone: string;
  code: string;
}

const FOLLOWER_AVATAR_COLORS = [
  'bg-emerald-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-orange-400',
  'bg-rose-500',
  'bg-fuchsia-500',
  'bg-teal-500',
  'bg-indigo-500'
];

const getFollowerAvatarColor = (id: string) => {
  const hash = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return FOLLOWER_AVATAR_COLORS[hash % FOLLOWER_AVATAR_COLORS.length];
};

const FollowerLetterAvatar: React.FC<{ id: string; name: string }> = ({ id, name }) => (
  <span
    className={`w-10 h-10 rounded-full text-white text-sm font-bold flex items-center justify-center shrink-0 ${getFollowerAvatarColor(id)}`}
  >
    {(name || '用').slice(0, 1)}
  </span>
);

const formatYmd = (date: Date) =>
  `${date.getFullYear()}${padTime(date.getMonth() + 1)}${padTime(date.getDate())}`;

const defaultInviteBatchName = () => `邀请批次-${formatYmd(new Date())}`;

const resolveInviteStatus = (item: InviteCode) => {
  if (item.status === '已使用') return '已使用' as const;
  if (item.expiresAt && new Date(item.expiresAt).getTime() <= Date.now()) return '已过期' as const;
  return '未使用' as const;
};

const STATUS_FILTER_OPTIONS = [
  { id: '启用', label: '正常启用', dot: 'bg-emerald-500' },
  { id: '禁用', label: '已停用', dot: 'bg-slate-400' }
] as const;

export const SystemAccountManagement: React.FC<SystemAccountManagementProps> = ({ shared }) => {
  const { orgNodes, personnelList, setPersonnelList, groups, inviteCodes, setInviteCodes } = shared;
  const [draftQuery, setDraftQuery] = useState(createEmptyAccountQuery);
  const [appliedQuery, setAppliedQuery] = useState(createEmptyAccountQuery);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<PersonnelItem | null>(null);
  const [viewing, setViewing] = useState<PersonnelItem | null>(null);

  const [pUsername, setPUsername] = useState('');
  const [pRealName, setPRealName] = useState('');
  const [pWechat, setPWechat] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pJobTitle, setPJobTitle] = useState('');
  const [pRoles, setPRoles] = useState<string[]>(['上报员']);
  const [orgPath, setOrgPath] = useState<string[]>([]);
  const [pGroupIds, setPGroupIds] = useState<string[]>([]);
  const [pStatus, setPStatus] = useState<'启用' | '禁用'>('启用');
  const [inviteBatchName, setInviteBatchName] = useState(defaultInviteBatchName);
  const [inviteCount, setInviteCount] = useState(10);
  const [inviteValidity, setInviteValidity] = useState<InviteValidityId>('7d');
  const [inviteExpiry, setInviteExpiry] = useState(() => addHoursLocal(168));
  const [inviteListFilter, setInviteListFilter] = useState<InviteListFilter>('all');
  const [freshCodeIds, setFreshCodeIds] = useState<string[]>([]);
  const [inviteMode, setInviteMode] = useState<InviteMode>('code');
  const [activeInviteDraft, setActiveInviteDraft] = useState<ActiveInviteDraft | null>(null);
  const [followerSearch, setFollowerSearch] = useState('');
  const [revealedPhoneIds, setRevealedPhoneIds] = useState<number[]>([]);
  const [openFilter, setOpenFilter] = useState<'org' | 'role' | 'group' | 'status' | null>(null);

  const triggerToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const syncOrgPath = (path: string[]) => {
    setOrgPath(path.filter(Boolean));
  };

  const getPersonOrgPath = (item: PersonnelItem) =>
    formatPersonOrgPaths(orgNodes, item.orgIds, undefined, item.primaryOrgId);

  const selectedLeafOrgId = orgPath[orgPath.length - 1];
  const getGroupName = (id: string) => groups.find((group) => group.id === id)?.name || id;

  const inRoster = personnelList.filter((item) => !item.recycled);
  const enabledCount = inRoster.filter((item) => item.status === '启用').length;
  const disabledCount = inRoster.filter((item) => item.status === '禁用').length;

  const filteredList = useMemo(() => {
    return inRoster.filter((item) => {
      if (appliedQuery.search) {
        const q = appliedQuery.search.trim().toLowerCase();
        const hit =
          item.realName.toLowerCase().includes(q) ||
          item.username.toLowerCase().includes(q) ||
          item.phone.toLowerCase().includes(q) ||
          item.wechat.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if ((appliedQuery.orgs || []).length > 0) {
        const belongsToOrg = item.orgIds.some((id) =>
          appliedQuery.orgs.some(
            (orgId) => id === orgId || buildOrgIdPath(orgNodes, id).includes(orgId)
          )
        );
        if (!belongsToOrg) return false;
      }
      if ((appliedQuery.roles || []).length > 0 && !(item.roles || []).some((role) => appliedQuery.roles.includes(role))) {
        return false;
      }
      if (
        (appliedQuery.groups || []).length > 0 &&
        !(item.groupIds || []).some((groupId) => appliedQuery.groups.includes(groupId))
      ) {
        return false;
      }
      if ((appliedQuery.statuses || []).length > 0 && !appliedQuery.statuses.includes(item.status)) return false;
      return true;
    });
  }, [inRoster, appliedQuery, orgNodes]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedList = filteredList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const updateDraftQuery = (patch: Partial<ReturnType<typeof createEmptyAccountQuery>>) => {
    setDraftQuery((prev) => ({ ...prev, ...patch }));
  };

  const orgPeopleCount = useMemo(() => {
    const map: Record<string, number> = {};
    orgNodes.forEach((org) => {
      map[org.id] = inRoster.filter((item) =>
        item.orgIds.some((id) => id === org.id || buildOrgIdPath(orgNodes, id).includes(org.id))
      ).length;
    });
    return map;
  }, [orgNodes, inRoster]);

  const rolePeopleCount = useMemo(() => {
    const map: Record<string, number> = {};
    ACCOUNT_ROLE_OPTIONS.forEach((role) => {
      map[role] = inRoster.filter((item) => (item.roles || []).includes(role)).length;
    });
    return map;
  }, [inRoster]);

  const groupPeopleCount = useMemo(() => {
    const map: Record<string, number> = {};
    groups.forEach((group) => {
      map[group.id] = inRoster.filter((item) => (item.groupIds || []).includes(group.id)).length;
    });
    return map;
  }, [groups, inRoster]);

  const handleQuery = () => {
    setOpenFilter(null);
    setAppliedQuery(draftQuery);
    setPage(1);
  };

  const handleResetFilters = () => {
    setOpenFilter(null);
    setDraftQuery(createEmptyAccountQuery());
    setAppliedQuery(createEmptyAccountQuery());
    setPage(1);
  };

  const copyText = async (text: string, success: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      triggerToast(success);
    } catch {
      triggerToast('复制失败，请手动复制');
    }
  };

  const applyValidityPreset = (id: InviteValidityId) => {
    setInviteValidity(id);
    if (id === 'custom') return;
    const option = INVITE_VALIDITY_OPTIONS.find((item) => item.id === id);
    const hours = option && 'hours' in option ? option.hours : 168;
    setInviteExpiry(addHoursLocal(hours));
  };

  const openCreateModal = () => {
    setEditing(null);
    setPRoles(['上报员']);
    syncOrgPath([]);
    setInviteBatchName(defaultInviteBatchName());
    setInviteCount(10);
    setInviteValidity('7d');
    setInviteExpiry(addHoursLocal(168));
    setInviteListFilter('all');
    setFreshCodeIds([]);
    setInviteMode('code');
    setActiveInviteDraft(null);
    setFollowerSearch('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: PersonnelItem) => {
    setEditing(item);
    setPUsername(item.username);
    setPRealName(item.realName);
    setPWechat(item.wechat);
    setPPhone(item.phone);
    setPJobTitle(item.jobTitle || '');
    setPRoles(item.roles?.length ? [...item.roles] : ['上报员']);
    syncOrgPath(buildOrgIdPath(orgNodes, getDeepestOrgId(orgNodes, item.orgIds, item.primaryOrgId)));
    setPGroupIds([...(item.groupIds || [])]);
    setPStatus(item.status);
    setIsModalOpen(true);
  };

  const toggleMulti = (value: string, list: string[], setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();

    if (editing) {
      if (!pUsername.trim() || !pRealName.trim()) return;
      if (orgPath.length === 0) {
        triggerToast('请选择所属机构');
        return;
      }
      if (pRoles.length === 0) {
        triggerToast('请至少选择一个角色');
        return;
      }
      setPersonnelList((prev) =>
        prev.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                username: pUsername.trim(),
                realName: pRealName.trim(),
                wechat: pWechat.trim() || item.wechat,
                phone: pPhone.trim() || item.phone,
                jobTitle: pJobTitle.trim(),
                roles: pRoles,
                orgIds: selectedLeafOrgId ? [selectedLeafOrgId] : [],
                primaryOrgId: selectedLeafOrgId,
                groupIds: pGroupIds,
                status: pStatus
              }
            : item
        )
      );
      triggerToast(`已保存账号【${pRealName.trim()}】`);
      setIsModalOpen(false);
      return;
    }
  };

  const handleGenerateBatch = () => {
    if (orgPath.length === 0) {
      triggerToast('请选择激活码所属机构');
      return;
    }
    if (pRoles.length === 0) {
      triggerToast('请选择激活码所属角色');
      return;
    }
    if (!inviteExpiry) {
      triggerToast('请设置激活码有效时间');
      return;
    }
    if (new Date(inviteExpiry).getTime() <= Date.now()) {
      triggerToast('有效时间必须晚于当前时间');
      return;
    }

    const existing = new Set(inviteCodes.map((item) => item.code));
    const codes: string[] = [];
    while (codes.length < inviteCount) {
      const next = generateActivationCode();
      if (!existing.has(next)) {
        existing.add(next);
        codes.push(next);
      }
    }

    const now = toLocalDateTimeValue(new Date());
    const batchId = `batch-${Date.now()}`;
    const batchName = inviteBatchName.trim() || defaultInviteBatchName();
    const created: InviteCode[] = codes.map((code, index) => ({
      id: `${batchId}-${index + 1}`,
      code,
      batchId,
      batchName,
      orgIds: selectedLeafOrgId ? [selectedLeafOrgId] : [],
      roles: [...pRoles],
      expiresAt: inviteExpiry,
      createdAt: now,
      status: '未使用',
      channel: 'activation_code'
    }));

    setInviteCodes((prev) => [...created, ...prev]);
    setFreshCodeIds(created.map((item) => item.id));
    setInviteListFilter('all');
    triggerToast(`已生成 ${created.length} 个激活码，有效期至 ${formatDateTimeLabel(inviteExpiry)}`);
  };

  const invitedFollowerIds = useMemo(
    () =>
      new Set(
        inviteCodes
          .filter((item) => item.sentToFollowerId && resolveInviteStatus(item) !== '已过期')
          .map((item) => item.sentToFollowerId as string)
      ),
    [inviteCodes]
  );

  const isFollowerInvited = (id: string) => invitedFollowerIds.has(id);

  const findRosterPerson = (follower: OfficialAccountFollower) =>
    personnelList.find(
      (person) =>
        !person.recycled &&
        ((follower.wechatAlias && person.wechat === follower.wechatAlias) ||
          (follower.phone && person.phone === follower.phone))
    );

  const getFollowerStatus = (follower: OfficialAccountFollower): FollowerInviteStatus => {
    if (findRosterPerson(follower)) return 'joined';
    if (isFollowerInvited(follower.id)) return 'invited';
    if (activeInviteDraft?.followerId === follower.id) return 'selected';
    return 'available';
  };

  const getFollowerOrgLabel = (follower: OfficialAccountFollower) => {
    const person = findRosterPerson(follower);
    if (!person) return '';
    const orgId = getDeepestOrgId(orgNodes, person.orgIds, person.primaryOrgId);
    return orgNodes.find((node) => node.id === orgId)?.name || formatPersonOrgPaths(orgNodes, person.orgIds);
  };

  const filteredFollowers = useMemo(() => {
    const q = followerSearch.trim().toLowerCase();
    return INITIAL_FOLLOWERS.filter((follower) => {
      if (!q) return true;
      return (
        follower.nickname.toLowerCase().includes(q) ||
        follower.wechatAlias.toLowerCase().includes(q) ||
        (follower.phone || '').includes(q) ||
        (follower.city || '').toLowerCase().includes(q)
      );
    });
  }, [followerSearch]);

  const resetActiveInviteForm = () => {
    setActiveInviteDraft(null);
  };

  const startActiveInvite = (follower: OfficialAccountFollower) => {
    const status = getFollowerStatus(follower);
    if (status === 'joined' || status === 'invited') return;
    if (activeInviteDraft?.followerId === follower.id) return;
    const existing = new Set(inviteCodes.map((item) => item.code));
    let code = generateActivationCode();
    while (existing.has(code)) {
      code = generateActivationCode();
    }
    setActiveInviteDraft({
      followerId: follower.id,
      name: follower.nickname,
      wechat: follower.wechatAlias,
      phone: follower.phone || '',
      code
    });
    setInviteBatchName(`公众号主动邀请-${formatYmd(new Date())}`);
  };

  const updateActiveInviteDraft = (patch: Partial<ActiveInviteDraft>) => {
    setActiveInviteDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleActiveInvite = () => {
    if (!activeInviteDraft) {
      triggerToast('请先选择要邀请的公众号关注用户');
      return;
    }
    if (!activeInviteDraft.name.trim()) {
      triggerToast('请填写真实姓名');
      return;
    }
    if (!/^1\d{10}$/.test(activeInviteDraft.phone.trim())) {
      triggerToast('请填写11位手机号码');
      return;
    }
    if (orgPath.length === 0) {
      triggerToast('请选择所属机构');
      return;
    }
    if (pRoles.length === 0) {
      triggerToast('请选择所属角色');
      return;
    }

    const now = toLocalDateTimeValue(new Date());
    const batchId = `oa-${Date.now()}`;
    const batchName = inviteBatchName.trim() || `公众号主动邀请-${formatYmd(new Date())}`;
    const created: InviteCode = {
      id: `${batchId}-1`,
      code: activeInviteDraft.code,
      batchId,
      batchName,
      orgIds: selectedLeafOrgId ? [selectedLeafOrgId] : [],
      roles: [...pRoles],
      expiresAt: inviteExpiry || addHoursLocal(168),
      createdAt: now,
      status: '未使用',
      channel: 'official_account',
      sentToName: activeInviteDraft.name.trim(),
      sentToWechat: activeInviteDraft.wechat,
      sentToPhone: activeInviteDraft.phone.trim(),
      sentToFollowerId: activeInviteDraft.followerId
    };

    setInviteCodes((prev) => [created, ...prev]);
    setFreshCodeIds([created.id]);
    setActiveInviteDraft(null);
    setInviteListFilter('all');
    triggerToast(`已向【${created.sentToName}】发送微信邀请`);
  };

  const unusedInviteCodes = inviteCodes.filter((item) => resolveInviteStatus(item) === '未使用');

  const visibleInviteCodes = inviteCodes.filter((item) => {
    if (inviteListFilter === 'all') return true;
    return resolveInviteStatus(item) === inviteListFilter;
  });

  const copyUnusedCodes = () => {
    if (!unusedInviteCodes.length) {
      triggerToast('当前没有未使用的激活码');
      return;
    }
    copyText(unusedInviteCodes.map((item) => item.code).join('\n'), `已复制 ${unusedInviteCodes.length} 个未使用激活码`);
  };

  const exportInviteCodes = () => {
    if (!inviteCodes.length) {
      triggerToast('暂无激活码可导出');
      return;
    }
    const header = ['批次名称', '激活码', '状态', '所属机构', '角色', '有效期至', '使用人', '手机号'];
    const rows = inviteCodes.map((item) => [
      item.batchName,
      item.code,
      resolveInviteStatus(item),
      formatPersonOrgPaths(orgNodes, item.orgIds),
      (item.roles || []).join('、'),
      formatDateTimeLabel(item.expiresAt),
      item.usedByName || '',
      item.usedByPhone || ''
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `激活码_${inviteBatchName || '批次'}_${formatYmd(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    triggerToast('激活码表格已导出');
  };

  const handleToggleStatus = (item: PersonnelItem) => {
    setPersonnelList((prev) =>
      prev.map((row) =>
        row.id === item.id ? { ...row, status: row.status === '启用' ? '禁用' : '启用' } : row
      )
    );
    triggerToast(item.status === '启用' ? `已停用【${item.realName}】` : `已启用【${item.realName}】`);
  };

  const handleDelete = (item: PersonnelItem) => {
    if (!confirm(`确定删除账号【${item.realName}】吗？此操作不可恢复。`)) return;
    setPersonnelList((prev) => prev.filter((row) => row.id !== item.id));
    triggerToast(`已删除【${item.realName}】`);
  };

  return (
    <div className="h-full min-h-[680px] flex flex-col min-w-0">
      {toast && (
        <div className="mx-5 mt-4 px-3 py-2 rounded-lg bg-[#1E5ABB] text-white text-xs font-bold">{toast}</div>
      )}

      <div className="px-5 pt-4 pb-3 grid grid-cols-3 gap-3">
        <StatCard icon={<Users className="w-4 h-4" />} label="在册账号总数" value={inRoster.length} tone="blue" />
        <StatCard icon={<UserCheck className="w-4 h-4" />} label="正常启用" value={enabledCount} tone="emerald" />
        <StatCard icon={<UserX className="w-4 h-4" />} label="已停用账号" value={disabledCount} tone="slate" />
      </div>

      <div className="px-5 flex items-center justify-end gap-3 border-b border-slate-100 pb-3">
        <button
          type="button"
          onClick={openCreateModal}
          className="px-3.5 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold rounded shadow-2xs flex items-center space-x-1 cursor-pointer whitespace-nowrap"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>邀请用户</span>
        </button>
      </div>

      <div className="px-5 py-3 space-y-2.5 min-w-0">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <div className="relative w-[168px] shrink-0">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              value={draftQuery.search}
              onChange={(event) => updateDraftQuery({ search: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleQuery();
              }}
              placeholder="搜索姓名 / 手机号"
              className="w-full h-8 pl-8 pr-7 text-xs border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-gray-50/50"
            />
            {draftQuery.search && (
              <button
                type="button"
                onClick={() => updateDraftQuery({ search: '' })}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                title="清空"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <AccountFilterShell
            open={openFilter === 'org'}
            onOpenChange={(open) => setOpenFilter(open ? 'org' : null)}
            value={draftQuery.orgs || []}
            onChange={(orgs) => updateDraftQuery({ orgs })}
            triggerIcon={<Building2 className="w-3.5 h-3.5" />}
            triggerText={(draftQuery.orgs || []).length ? `已选 ${draftQuery.orgs.length} 个机构` : '全部机构'}
            active={(draftQuery.orgs || []).length > 0}
            title="选择所属机构（可多选）"
            footerText={(count) => `已选中 ${count} 个机构`}
            confirmLabel="确定选择"
            widthClass="w-[320px]"
          >
            {({ pending, toggle }) => (
              <OrgFilterTree
                orgNodes={orgNodes}
                selected={pending}
                onToggle={toggle}
                counts={orgPeopleCount}
              />
            )}
          </AccountFilterShell>
          <AccountFilterShell
            open={openFilter === 'role'}
            onOpenChange={(open) => setOpenFilter(open ? 'role' : null)}
            value={draftQuery.roles || []}
            onChange={(roles) => updateDraftQuery({ roles })}
            triggerText={(draftQuery.roles || []).length ? `已选 ${draftQuery.roles.length} 个角色` : '全部角色'}
            active={(draftQuery.roles || []).length > 0}
            title="选择系统角色（可多选）"
            clearLabel="清空"
            footerText={(count) => `已选 ${count} 个角色`}
            confirmLabel="确定选择"
            widthClass="w-[280px]"
            align="right"
          >
            {({ pending, toggle }) => (
              <FilterOptionList
                options={ACCOUNT_ROLE_OPTIONS.map((role) => ({
                  id: role,
                  label: role,
                  countLabel: `${rolePeopleCount[role] || 0} 人`
                }))}
                selected={pending}
                onToggle={toggle}
                shape="square"
              />
            )}
          </AccountFilterShell>
          <AccountFilterShell
            open={openFilter === 'group'}
            onOpenChange={(open) => setOpenFilter(open ? 'group' : null)}
            value={draftQuery.groups || []}
            onChange={(groups) => updateDraftQuery({ groups })}
            triggerIcon={<Users className="w-3.5 h-3.5" />}
            triggerText={(draftQuery.groups || []).length ? `已选 ${draftQuery.groups.length} 个分组` : '全部分组'}
            active={(draftQuery.groups || []).length > 0}
            title="选择人员分组（可多选）"
            clearLabel="清空"
            footerText={(count) => `已选 ${count} 个分组`}
            confirmLabel="确定选择"
            widthClass="w-[280px]"
            align="right"
          >
            {({ pending, toggle }) => (
              <FilterOptionList
                options={groups.map((group) => ({
                  id: group.id,
                  label: group.name,
                  countLabel: `${groupPeopleCount[group.id] || 0} 人`
                }))}
                selected={pending}
                onToggle={toggle}
                shape="square"
              />
            )}
          </AccountFilterShell>
          <AccountFilterShell
            open={openFilter === 'status'}
            onOpenChange={(open) => setOpenFilter(open ? 'status' : null)}
            value={draftQuery.statuses || []}
            onChange={(statuses) => updateDraftQuery({ statuses })}
            triggerText={
              (draftQuery.statuses || []).length === 0
                ? '账号状态：全部状态'
                : draftQuery.statuses.length === 1
                  ? `账号状态：${draftQuery.statuses[0] === '启用' ? '正常启用' : '已停用'}`
                  : `账号状态：已选 ${draftQuery.statuses.length} 项`
            }
            active={(draftQuery.statuses || []).length > 0}
            title="账号状态选择（多选）"
            footerText={(count) => `已选 ${count} 项`}
            confirmLabel="确定"
            widthClass="w-[240px]"
            align="right"
          >
            {({ pending, toggle }) => (
              <FilterOptionList
                options={STATUS_FILTER_OPTIONS.map((item) => ({
                  id: item.id,
                  label: item.label,
                  dot: item.dot
                }))}
                selected={pending}
                onToggle={toggle}
                shape="circle"
              />
            )}
          </AccountFilterShell>
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              type="button"
              onClick={handleQuery}
              className="h-8 px-4 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>查询</span>
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-8 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg border border-gray-200 flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500 font-medium">
          共查询到 <strong className="text-[#1E5ABB] font-mono">{filteredList.length}</strong> 条账号
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto px-5 pb-4">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50/80 text-gray-500 border-y border-gray-200 font-medium">
              <th className="py-2.5 px-3 text-center w-12 whitespace-nowrap">序号</th>
              <th className="py-2.5 px-3 whitespace-nowrap">姓名 / 手机号</th>
              <th className="py-2.5 px-3 whitespace-nowrap w-[240px] max-w-[240px]">
                <span className="inline-flex items-center gap-1"><Building2 className="w-3 h-3" />所属机构</span>
              </th>
              <th className="py-2.5 px-3 whitespace-nowrap">
                <span className="inline-flex items-center gap-1"><Circle className="w-3 h-3" />角色名称</span>
              </th>
              <th className="py-2.5 px-3 whitespace-nowrap">
                <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />人员分组</span>
              </th>
              <th className="py-2.5 px-3 whitespace-nowrap">账号状态</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {pagedList.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-400">
                  暂无匹配的系统账号
                </td>
              </tr>
            ) : (
              pagedList.map((item, index) => {
                const orgPathText = getPersonOrgPath(item);
                const primaryRole = (item.roles || [])[0] || '未分配';
                const primaryGroupId = (item.groupIds || [])[0];
                const enabled = item.status === '启用';
                return (
                <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-2.5 px-3 text-center text-gray-400 font-mono whitespace-nowrap">
                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td className="py-2.5 px-3 min-w-[180px]">
                    <PersonIdentityCell
                      item={item}
                      revealed={revealedPhoneIds.includes(item.id)}
                      onToggleReveal={() =>
                        setRevealedPhoneIds((prev) =>
                          prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                        )
                      }
                      onAvatarClick={() => setViewing(item)}
                    />
                  </td>
                  <td className="py-2.5 px-3 w-[240px] max-w-[240px] overflow-hidden">
                    <PersonOrgPathCell path={orgPathText} />
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <PersonRoleBadges roles={[primaryRole]} />
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <PersonGroupCell groupName={primaryGroupId ? getGroupName(primaryGroupId) : undefined} />
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <StatusSwitch
                      enabled={enabled}
                      onToggle={() => handleToggleStatus(item)}
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                      <IconBtn title="编辑" onClick={() => openEditModal(item)}>
                        <Edit3 className="w-3.5 h-3.5" />
                      </IconBtn>
                      <IconBtn title="删除" onClick={() => handleDelete(item)}>
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3">
          <div>共 {filteredList.length} 条记录</div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="px-2 py-0.5 border border-gray-200 rounded disabled:opacity-40 cursor-pointer"
            >
              &lt;
            </button>
            <span className="px-2 py-0.5 bg-[#1E5ABB] text-white rounded font-bold">{currentPage}</span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-2 py-0.5 border border-gray-200 rounded disabled:opacity-40 cursor-pointer"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-visible animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col"
          >
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-800">编辑系统账号</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">绑定机构、角色与人员分组，字段沿用当前人员档案</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs overflow-visible">
              <div className="grid grid-cols-2 gap-3">
                <Field label="真实姓名 *" value={pRealName} onChange={setPRealName} placeholder="如：张三" />
                <Field label="账号名称 *" value={pUsername} onChange={setPUsername} placeholder="登录账号" />
                <Field label="职务岗位" value={pJobTitle} onChange={setPJobTitle} placeholder="如：网信指导处审核员" />
                <Field label="联系电话" value={pPhone} onChange={setPPhone} placeholder="如：138****0001" />
                <Field label="微信号" value={pWechat} onChange={setPWechat} placeholder="选填" />
              </div>
              <OrgCascadeSelect orgNodes={orgNodes} path={orgPath} onChange={syncOrgPath} />
              <div className="grid grid-cols-2 gap-3">
                <MultiSelectDropdown
                  label="分配系统角色 *"
                  placeholder="请选择系统角色"
                  options={ACCOUNT_ROLE_OPTIONS.map((role) => ({ id: role, label: role }))}
                  selected={pRoles}
                  onToggle={(id) => toggleMulti(id, pRoles, setPRoles)}
                />
                <MultiSelectDropdown
                  label="所属人员分组（可选）"
                  placeholder="-- 暂不归属任何分组 --"
                  options={groups.map((group) => ({ id: group.id, label: group.name }))}
                  selected={pGroupIds}
                  onToggle={(id) => toggleMulti(id, pGroupIds, setPGroupIds)}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1.5">账号状态</label>
                <div className="flex items-center gap-4">
                  {(['启用', '禁用'] as const).map((status) => (
                    <label key={status} className="flex items-center gap-1.5 cursor-pointer text-gray-700">
                      <input
                        type="radio"
                        checked={pStatus === status}
                        onChange={() => setPStatus(status)}
                        className="text-[#1E5ABB] focus:ring-[#1E5ABB]"
                      />
                      {status === '启用' ? '启用（允许登录）' : '停用（暂禁止登录）'}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-pointer text-xs"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#1E5ABB] text-white rounded font-bold hover:bg-[#134092] cursor-pointer text-xs"
              >
                保存修改
              </button>
            </div>
          </form>
        </div>
      )}

      {isModalOpen && !editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0 gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-800">邀请用户</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {inviteMode === 'code'
                    ? '按批次生成激活码，绑定所属机构、角色与有效时间'
                    : '从关注公众号用户中选择未在编人员，补充资料后发送微信邀请'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setInviteMode('code');
                    setActiveInviteDraft(null);
                  }}
                  className={`h-8 px-3 rounded-lg text-[11px] font-medium cursor-pointer ${
                    inviteMode === 'code'
                      ? 'bg-[#1E5ABB] text-white'
                      : 'border border-gray-200 bg-white text-gray-500 hover:text-[#1E5ABB]'
                  }`}
                >
                  激活码邀请
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInviteMode('active');
                    setActiveInviteDraft(null);
                    if (!pRoles.length) setPRoles(['上报员']);
                  }}
                  className={`h-8 px-3 rounded-lg text-[11px] font-medium cursor-pointer inline-flex items-center gap-1.5 ${
                    inviteMode === 'active'
                      ? 'border border-[#1E5ABB] bg-[#F4F8FE] text-[#1E5ABB]'
                      : 'border border-gray-200 bg-white text-gray-500 hover:text-[#1E5ABB]'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  主动邀请
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div
              className={`p-4 min-h-0 flex-1 text-xs overflow-hidden ${
                inviteMode === 'code'
                  ? 'grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-4'
                  : 'grid grid-cols-1 lg:grid-cols-[minmax(300px,0.95fr)_minmax(340px,1.05fr)] gap-4'
              }`}
            >
              {inviteMode === 'code' && (
              <div className="rounded-lg border border-blue-100 bg-[#F4F8FE] p-4 space-y-3 overflow-visible relative z-20">
                <div className="flex items-center gap-1.5 text-[#1E5ABB] font-bold">
                  <KeyRound className="w-3.5 h-3.5" />
                  激活码批次设置
                </div>
                <OrgCascadeSelect orgNodes={orgNodes} path={orgPath} onChange={syncOrgPath} />
                <MultiSelectDropdown
                  label="所属角色 *"
                  placeholder="请选择激活后归属的角色"
                  options={ACCOUNT_ROLE_OPTIONS.map((role) => ({ id: role, label: role }))}
                  selected={pRoles}
                  onToggle={(id) => toggleMulti(id, pRoles, setPRoles)}
                />
                <Field
                  label="批次名称"
                  value={inviteBatchName}
                  onChange={setInviteBatchName}
                  placeholder="如：办公室邀请-20260917"
                />
                <div>
                  <label className="block text-gray-700 font-medium mb-1.5">单次生成数量</label>
                  <div className="flex flex-wrap gap-1.5">
                    {INVITE_COUNT_OPTIONS.map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setInviteCount(count)}
                        className={`h-7 px-2.5 rounded-full text-[11px] cursor-pointer ${
                          inviteCount === count
                            ? 'bg-[#1E5ABB] text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1E5ABB]/40'
                        }`}
                      >
                        {count}个
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1.5">有效期至 *</label>
                  <input
                    type="datetime-local"
                    value={inviteExpiry}
                    onChange={(event) => {
                      setInviteExpiry(event.target.value);
                      setInviteValidity('custom');
                    }}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {INVITE_VALIDITY_OPTIONS.filter((option) => option.id !== 'custom').map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => applyValidityPreset(option.id)}
                        className={`h-7 px-2.5 rounded-full text-[11px] cursor-pointer ${
                          inviteValidity === option.id
                            ? 'bg-[#1E5ABB] text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1E5ABB]/40'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateBatch}
                  className="w-full h-9 rounded bg-[#1E5ABB] text-white font-bold hover:bg-[#134092] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  生成激活码批次
                </button>
              </div>
              )}

              {inviteMode === 'code' ? (
              <div className="rounded-lg border border-gray-200 bg-white flex flex-col min-h-[420px] min-w-0 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-gray-800">
                    激活码列表
                    <span className="ml-1.5 font-normal text-gray-400">
                      （共 {visibleInviteCodes.length} 条
                      {inviteListFilter === 'all' ? `，未使用 ${unusedInviteCodes.length}` : ''}）
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={copyUnusedCodes}
                      className="h-7 px-2.5 rounded border border-blue-100 bg-blue-50 text-[#1E5ABB] font-medium hover:bg-blue-100 cursor-pointer inline-flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      一键复制未用码
                    </button>
                    <button
                      type="button"
                      onClick={exportInviteCodes}
                      className="h-7 px-2.5 rounded border border-gray-200 text-gray-600 hover:border-[#1E5ABB]/40 hover:text-[#1E5ABB] cursor-pointer inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      导出表格
                    </button>
                  </div>
                </div>
                <div className="px-4 py-2 border-b border-gray-50 flex flex-wrap gap-1.5">
                  {([
                    { id: 'all', label: '全部' },
                    { id: '未使用', label: '未使用' },
                    { id: '已使用', label: '已使用' },
                    { id: '已过期', label: '已过期' }
                  ] as const).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setInviteListFilter(option.id)}
                      className={`h-6 px-2 rounded-full text-[11px] cursor-pointer ${
                        inviteListFilter === option.id
                          ? 'bg-[#1E5ABB] text-white'
                          : 'bg-gray-50 text-gray-500 hover:text-[#1E5ABB]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto px-2 py-1">
                  {visibleInviteCodes.length === 0 ? (
                    <div className="h-full min-h-[200px] flex items-center justify-center text-gray-400">
                      尚未生成激活码，请在左侧完成批次设置后生成
                    </div>
                  ) : (
                    visibleInviteCodes.map((item, index) => {
                      const status = resolveInviteStatus(item);
                      const unused = status === '未使用';
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 px-2 py-2.5 rounded-lg ${
                            freshCodeIds.includes(item.id) ? 'bg-blue-50/80' : 'hover:bg-slate-50'
                          }`}
                        >
                          <span className="w-5 text-right text-gray-400 shrink-0">{index + 1}.</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono font-bold text-gray-800 tracking-wide">{item.code}</span>
                              {unused ? (
                                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-[#1E5ABB]">
                                  {item.sentToName ? `已发给 ${item.sentToName}` : '未使用'}
                                </span>
                              ) : status === '已过期' ? (
                                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">已过期</span>
                              ) : (
                                <span className="text-[11px] text-gray-400 truncate">
                                  已使用
                                  {item.usedByName
                                    ? `：${item.usedByName}${item.usedByPhone ? `（${maskPhone(item.usedByPhone)}）` : ''}`
                                    : ''}
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 text-[10px] text-gray-400 truncate" title={`${formatPersonOrgPaths(orgNodes, item.orgIds)} · ${(item.roles || []).join('、')} · 至 ${formatDateTimeLabel(item.expiresAt)}`}>
                              {formatPersonOrgPaths(orgNodes, item.orgIds)} · {(item.roles || []).join('、')} · 至 {formatDateTimeLabel(item.expiresAt)}
                            </div>
                          </div>
                          {unused && (
                            <button
                              type="button"
                              title="复制激活码"
                              onClick={() => copyText(item.code, '激活码已复制')}
                              className="w-7 h-7 rounded text-gray-400 hover:text-[#1E5ABB] hover:bg-white flex items-center justify-center cursor-pointer shrink-0"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="px-4 py-3 bg-amber-50/70 border-t border-amber-100 text-[11px] text-amber-800/90 leading-relaxed">
                  激活码规则为一码一人。用户在登录/注册时选择「激活码绑定」，输入任意未过期激活码后，将自动归属该码绑定的机构与角色。
                </div>
              </div>
              ) : (
              <>
              <div className="rounded-xl border border-gray-200 bg-white flex flex-col min-h-[460px] min-w-0 overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <MessageCircle className="w-4 h-4 text-[#1E5ABB]" />
                    关注公众号用户列表
                  </div>
                  <span className="text-[11px] text-gray-400">共 {filteredFollowers.length} 位关注粉丝</span>
                </div>
                <div className="px-4 pb-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    <input
                      value={followerSearch}
                      onChange={(event) => setFollowerSearch(event.target.value)}
                      placeholder="输入关注公众号用户的微信昵称搜索..."
                      className="w-full h-8 pl-8 pr-3 border border-gray-200 rounded-lg bg-gray-50/70 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
                  {filteredFollowers.length === 0 ? (
                    <div className="h-full min-h-[200px] flex items-center justify-center text-gray-400">
                      没有匹配的关注用户
                    </div>
                  ) : (
                    filteredFollowers.map((follower) => {
                      const status = getFollowerStatus(follower);
                      const orgLabel = status === 'joined' ? getFollowerOrgLabel(follower) : '';
                      return (
                        <div
                          key={follower.id}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${
                            status === 'selected'
                              ? 'border-[#1E5ABB] bg-[#F4F8FE]'
                              : 'border-gray-100 bg-white'
                          }`}
                        >
                          <FollowerLetterAvatar id={follower.id} name={follower.nickname} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-bold text-gray-800 truncate">{follower.nickname}</span>
                              {status === 'selected' && (
                                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-[#1E5ABB] text-white">已选中</span>
                              )}
                            </div>
                            <div className="mt-0.5 text-[10px] text-gray-400">关注于 {follower.followTime}</div>
                          </div>
                          {status === 'joined' ? (
                            <div className="shrink-0 text-right">
                              <div className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                <UserCheck className="w-3 h-3" />
                                已加入机构
                              </div>
                              <div className="mt-0.5 text-[10px] text-gray-400">{orgLabel}</div>
                            </div>
                          ) : status === 'invited' ? (
                            <div className="shrink-0 text-right">
                              <div className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                                已邀请
                              </div>
                              <div className="mt-0.5 text-[10px] text-gray-400">待激活</div>
                            </div>
                          ) : status === 'selected' ? (
                            <button
                              type="button"
                              className="shrink-0 h-7 px-2.5 rounded-lg bg-[#1E5ABB] text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-default"
                            >
                              <Check className="w-3.5 h-3.5" />
                              填写资料
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startActiveInvite(follower)}
                              className="shrink-0 h-7 px-2.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] font-bold hover:bg-emerald-100 cursor-pointer inline-flex items-center gap-1"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              邀请入队
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white flex flex-col min-h-[460px] min-w-0 overflow-visible">
                <div className="px-4 py-3 flex items-center justify-between gap-2 border-b border-gray-50">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <Send className="w-4 h-4 text-[#1E5ABB]" />
                    邀请资料补充表单
                  </div>
                  {activeInviteDraft && (
                    <button
                      type="button"
                      onClick={resetActiveInviteForm}
                      className="text-[11px] text-gray-400 hover:text-[#1E5ABB] cursor-pointer"
                    >
                      重新选择
                    </button>
                  )}
                </div>
                {activeInviteDraft ? (
                  <div className="flex-1 overflow-visible p-4 space-y-3.5">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-3 flex items-center gap-3">
                      <FollowerLetterAvatar id={activeInviteDraft.followerId} name={activeInviteDraft.name || activeInviteDraft.wechat} />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-800">
                          微信昵称：{INITIAL_FOLLOWERS.find((item) => item.id === activeInviteDraft.followerId)?.nickname || activeInviteDraft.name}
                        </div>
                        <div className="mt-0.5 text-[11px] text-emerald-700">通过机构排查：未在编，允许邀请</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">真实姓名 *</label>
                      <input
                        value={activeInviteDraft.name}
                        onChange={(event) => updateActiveInviteDraft({ name: event.target.value })}
                        placeholder="请填写真实姓名"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">手机号码 *</label>
                      <input
                        value={activeInviteDraft.phone}
                        onChange={(event) => updateActiveInviteDraft({ phone: event.target.value.replace(/\D/g, '').slice(0, 11) })}
                        placeholder="请输入手机号（如：13812345678）"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <OrgCascadeSelect
                        orgNodes={orgNodes}
                        path={orgPath}
                        onChange={syncOrgPath}
                        label="所属机构 *"
                        hideHint
                      />
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">所属角色 *</label>
                        <select
                          value={pRoles[0] || ''}
                          onChange={(event) => setPRoles(event.target.value ? [event.target.value] : [])}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                        >
                          <option value="">请选择角色</option>
                          {ACCOUNT_ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleActiveInvite}
                      className="w-full h-10 rounded-lg bg-[#1E5ABB] text-white font-bold hover:bg-[#134092] cursor-pointer inline-flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-4 h-4" />
                      确认邀请
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2 px-6 text-center">
                    <UserPlus className="w-8 h-8 text-gray-300" />
                    <div>请从左侧点击「邀请入队」</div>
                    <div className="text-[11px]">补充姓名、手机号、所属机构与角色后发送微信邀请</div>
                  </div>
                )}
              </div>
              </>
              )}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-pointer text-xs"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden" onClick={(event) => event.stopPropagation()}>
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-1 ring-black/10">
                  <PersonAvatar name={viewing.realName} src={getPersonAvatarUrl(viewing)} size="md" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 truncate">账号详情 - {viewing.realName}</h3>
              </div>
              <button type="button" onClick={() => setViewing(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3 text-xs">
              <Detail label="账号名称" value={viewing.username} />
              <Detail label="真实姓名" value={viewing.realName} />
              <Detail label="职务岗位" value={viewing.jobTitle || '—'} />
              <Detail label="联系电话" value={viewing.phone} />
              <Detail label="微信号" value={viewing.wechat} />
              <Detail label="角色名称" value={(viewing.roles || []).join('、')} />
              <Detail label="账号状态" value={viewing.status === '启用' ? '正常启用' : '已停用'} />
              <div className="col-span-2">
                <Detail label="所属机构" value={formatPersonOrgPaths(orgNodes, viewing.orgIds, undefined, viewing.primaryOrgId)} />
              </div>
              <div className="col-span-2">
                <Detail
                  label="人员分组"
                  value={(viewing.groupIds || []).length ? viewing.groupIds!.map(getGroupName).join('、') : '未入组'}
                />
              </div>
              <Detail label="登记时间" value={viewing.registerDate} />
              <Detail label="标签" value={(viewing.labels || []).join('、') || '无'} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'blue' | 'emerald' | 'slate';
}> = ({ icon, label, value, tone }) => {
  const tones = {
    blue: 'bg-blue-50 text-[#1E5ABB] border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-200'
  };
  return (
    <div className={`rounded-lg border px-3 py-2.5 flex items-center justify-between ${tones[tone]}`}>
      <div>
        <div className="text-[11px] opacity-80 whitespace-nowrap">{label}</div>
        <div className="text-lg font-bold mt-0.5">{value}</div>
      </div>
      <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center">{icon}</div>
    </div>
  );
};

const IconBtn: React.FC<{ title: string; onClick: () => void; children: React.ReactNode }> = ({
  title,
  onClick,
  children
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="w-6 h-6 rounded border border-gray-200 text-gray-500 hover:text-[#1E5ABB] hover:border-blue-200 hover:bg-blue-50 flex items-center justify-center cursor-pointer"
  >
    {children}
  </button>
);

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1">{label}</label>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
    />
  </div>
);

const Detail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-gray-400 mb-0.5">{label}</div>
    <div className="font-medium text-gray-800">{value}</div>
  </div>
);

const OrgCascadeSelect: React.FC<{
  orgNodes: OrgNode[];
  path: string[];
  onChange: (path: string[]) => void;
  label?: string;
  hideHint?: boolean;
}> = ({ orgNodes, path, onChange, label = '所属机构 *', hideHint = false }) => {
  const [open, setOpen] = useState(false);
  const [drillPath, setDrillPath] = useState<string[]>(path);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setDrillPath(path);
  }, [open, path]);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const columns = useMemo(() => {
    const next: Array<{ level: number; options: OrgNode[] }> = [
      { level: 0, options: getOrgChildrenOf(orgNodes, null) }
    ];
    drillPath.forEach((id, index) => {
      const children = getOrgChildrenOf(orgNodes, id);
      if (children.length > 0) {
        next.push({ level: index + 1, options: children });
      }
    });
    return next;
  }, [orgNodes, drillPath]);

  const selectedPath = path.length ? getOrgFullPath(orgNodes, path[path.length - 1]) : '';
  const previewPath = drillPath.length ? getOrgFullPath(orgNodes, drillPath[drillPath.length - 1]) : '';

  const pickNode = (level: number, id: string) => {
    const next = [...drillPath.slice(0, level), id];
    setDrillPath(next);
    onChange(next);
    if (getOrgChildrenOf(orgNodes, id).length === 0) setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center justify-between mb-1">
        <label className="text-gray-700 font-medium">{label}</label>
        {!hideHint && <span className="text-[10px] text-gray-400">点击后在弹出层中逐级下钻</span>}
      </div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
      >
        <span className={`truncate ${selectedPath ? 'text-gray-800' : 'text-gray-400'}`}>
          {selectedPath || '请选择所属机构'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-40 mt-1 left-0 min-w-full max-w-[min(720px,calc(100vw-96px))] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xl">
          <div className="flex max-h-56 overflow-x-auto overflow-y-hidden">
            {columns.map((column) => (
              <div
                key={column.level}
                className="w-44 shrink-0 border-r last:border-r-0 border-gray-200 overflow-y-auto max-h-56"
              >
                {column.options.map((org) => {
                  const hasChildren = getOrgChildrenOf(orgNodes, org.id).length > 0;
                  const isActive = drillPath[column.level] === org.id;
                  return (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => pickNode(column.level, org.id)}
                      className={`w-full h-8 px-2 flex items-center justify-between gap-2 text-left text-xs hover:bg-blue-50 cursor-pointer ${
                        isActive ? 'bg-blue-50 text-[#1E5ABB] font-bold' : 'text-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        {isActive && <Check className="w-3 h-3 shrink-0" />}
                        <span className="truncate">{org.name}</span>
                      </span>
                      {hasChildren && <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
            <span className={`text-[11px] truncate ${previewPath ? 'text-[#1E5ABB] font-medium' : 'text-gray-400'}`}>
              {previewPath || '请先选择一级机构，有下级继续向右展开'}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-2.5 py-1 rounded bg-[#1E5ABB] text-white text-[11px] font-bold hover:bg-[#134092] cursor-pointer shrink-0"
            >
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const MultiSelectDropdown: React.FC<{
  label: string;
  hint?: string;
  placeholder: string;
  options: Array<{ id: string; label: string }>;
  selected: string[];
  onToggle: (id: string) => void;
}> = ({ label, hint, placeholder, options, selected, onToggle }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const summary =
    selected.length === 0
      ? placeholder
      : selected
          .map((id) => options.find((option) => option.id === id)?.label)
          .filter(Boolean)
          .join('、');

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center justify-between mb-1">
        <label className="text-gray-700 font-medium">{label}</label>
        {hint && <span className="text-[10px] text-gray-400">{hint}</span>}
      </div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
      >
        <span className={`truncate ${selected.length ? 'text-gray-800' : 'text-gray-400'}`}>{summary}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg p-1">
          {options.map((option) => {
            const checked = selected.includes(option.id);
            return (
              <label
                key={option.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ${
                  checked ? 'bg-blue-50 text-[#1E5ABB]' : 'hover:bg-slate-50 text-gray-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(option.id)}
                  className="rounded text-[#1E5ABB] focus:ring-[#1E5ABB] w-3.5 h-3.5"
                />
                <span className="truncate">{option.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CircleCheck: React.FC<{ checked: boolean; shape?: 'circle' | 'square' }> = ({ checked, shape = 'circle' }) => (
  <span
    className={`shrink-0 flex items-center justify-center ${
      shape === 'square' ? 'w-4 h-4 rounded' : 'w-4 h-4 rounded-full'
    } border ${
      checked ? 'bg-[#1E5ABB] border-[#1E5ABB] text-white' : 'bg-white border-gray-300 text-transparent'
    }`}
  >
    <Check className="w-2.5 h-2.5" strokeWidth={3} />
  </span>
);

const AccountFilterShell: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string[];
  onChange: (next: string[]) => void;
  triggerIcon?: React.ReactNode;
  triggerText: string;
  active: boolean;
  title: string;
  clearLabel?: string;
  footerText: (count: number) => string;
  confirmLabel?: string;
  widthClass?: string;
  align?: 'left' | 'right';
  children: (ctx: {
    pending: string[];
    toggle: (id: string) => void;
    setPending: React.Dispatch<React.SetStateAction<string[]>>;
  }) => React.ReactNode;
}> = ({
  open,
  onOpenChange,
  value,
  onChange,
  triggerIcon,
  triggerText,
  active,
  title,
  clearLabel = '清空已选',
  footerText,
  confirmLabel = '确定选择',
  widthClass = 'w-[300px]',
  align = 'left',
  children
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState<string[]>(() => [...value]);

  useEffect(() => {
    if (open) setPending([...value]);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open, onOpenChange]);

  const toggle = (id: string) => {
    setPending((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={`inline-flex items-center gap-1.5 max-w-full h-8 px-3 rounded-full border text-xs font-medium cursor-pointer transition-colors ${
          active || open
            ? 'bg-blue-50 border-blue-200 text-[#1E5ABB]'
            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
        }`}
      >
        {triggerIcon}
        <span className="truncate">{triggerText}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className={`absolute z-40 mt-1.5 ${align === 'right' ? 'right-0' : 'left-0'} ${widthClass} max-w-[min(320px,calc(100vw-48px))] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden`}
        >
          <div className="px-3 pt-3 pb-2 flex items-center justify-between gap-2">
            <div className="text-xs font-bold text-gray-800 truncate">{title}</div>
            <button
              type="button"
              onClick={() => setPending([])}
              className="text-[11px] font-medium text-rose-500 hover:text-rose-600 cursor-pointer shrink-0"
            >
              {clearLabel}
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto px-2 pb-1">{children({ pending, toggle, setPending })}</div>
          <div className="px-3 py-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
            <span className="text-[11px] text-gray-400">{footerText(pending.length)}</span>
            <button
              type="button"
              onClick={() => {
                onChange([...pending]);
                onOpenChange(false);
              }}
              className="px-3 py-1 rounded-lg bg-[#1E5ABB] hover:bg-[#134092] text-white text-[11px] font-bold cursor-pointer"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterOptionList: React.FC<{
  options: Array<{ id: string; label: string; countLabel?: string; dot?: string }>;
  selected: string[];
  onToggle: (id: string) => void;
  shape?: 'circle' | 'square';
}> = ({ options, selected, onToggle, shape = 'square' }) => (
  <div className="space-y-0.5">
    {options.map((option) => {
      const checked = selected.includes(option.id);
      return (
        <button
          key={option.id}
          type="button"
          onClick={() => onToggle(option.id)}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left cursor-pointer ${
            checked ? 'bg-blue-50 text-[#1E5ABB]' : 'text-gray-700 hover:bg-slate-50'
          }`}
        >
          <CircleCheck checked={checked} shape={shape} />
          {option.dot && <span className={`w-2 h-2 rounded-full shrink-0 ${option.dot}`} />}
          <span className="flex-1 min-w-0 truncate text-xs font-medium">{option.label}</span>
          {option.countLabel && (
            <span className={`text-[11px] shrink-0 ${checked ? 'text-[#1E5ABB]/70' : 'text-gray-400'}`}>
              {option.countLabel}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

const OrgFilterTree: React.FC<{
  orgNodes: OrgNode[];
  selected: string[];
  onToggle: (id: string) => void;
  counts: Record<string, number>;
}> = ({ orgNodes, selected, onToggle, counts }) => {
  const expandableIds = useMemo(
    () => orgNodes.filter((node) => getOrgChildrenOf(orgNodes, node.id).length > 0).map((node) => node.id),
    [orgNodes]
  );
  const [expanded, setExpanded] = useState<string[]>(expandableIds);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const renderNode = (node: OrgNode, depth: number): React.ReactNode => {
    const children = getOrgChildrenOf(orgNodes, node.id);
    const hasChildren = children.length > 0;
    const isExpanded = expanded.includes(node.id);
    const checked = selected.includes(node.id);
    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-1 rounded-lg ${checked ? 'bg-blue-50 text-[#1E5ABB]' : 'text-gray-700 hover:bg-slate-50'}`}
          style={{ paddingLeft: 4 + depth * 14 }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpand(node.id)}
              className="w-5 h-8 flex items-center justify-center text-gray-400 cursor-pointer shrink-0"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-5 h-8 shrink-0" />
          )}
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            className="flex-1 min-w-0 flex items-center gap-2 py-1.5 pr-2 cursor-pointer"
          >
            <CircleCheck checked={checked} shape="circle" />
            <span className="flex-1 min-w-0 truncate text-xs font-medium">{node.name}</span>
            <span className={`text-[11px] shrink-0 ${checked ? 'text-[#1E5ABB]/70' : 'text-gray-400'}`}>
              {counts[node.id] || 0} 人
            </span>
          </button>
        </div>
        {hasChildren && isExpanded && children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  return <div>{getOrgChildrenOf(orgNodes, null).map((node) => renderNode(node, 0))}</div>;
};

