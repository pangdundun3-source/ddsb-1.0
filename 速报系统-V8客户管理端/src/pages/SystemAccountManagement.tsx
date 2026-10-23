import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  UserPlus,
  Users,
  UserRoundCheck,
  RotateCcw,
  X,
  Building2,
  ChevronDown,
  ChevronRight,
  Check,
  CircleCheckBig,
  Tags,
  Shield,
  Download,
  SlidersHorizontal,
  Trash2,
  AlertTriangle,
  IdCard
} from 'lucide-react';
import { InviteRecordModal } from './InviteRecordModal';
import { OrgCascadeSelect } from '../components/OrgCascadeSelect';
import { ExternalUserTable, getFollowStatus } from '../components/ExternalUserTable';
import { InviteUserModal } from '../components/InviteUserModal';
import { Field, MultiSelectDropdown } from '../components/FormControls';
import { PaginationBar } from '../components/PaginationBar';
import type { OrgNode, PersonnelItem } from './OrgManagement';
import {
  ACCOUNT_ROLE_OPTIONS,
  buildOrgIdPath,
  formatPersonOrgPaths,
  getDeepestOrgId,
  getOrgChildrenOf,
  ORG_MAX_USER_COUNT,
  syncFollowersAfterDelete,
  type UserOrgSharedState
} from '../data/userOrgShared';
import {
  getPersonAvatarUrl,
  isRealNameVerified,
  PersonAvatar
} from '../components/PersonAccountDisplay';

interface SystemAccountManagementProps {
  shared: UserOrgSharedState;
  currentOrg?: string;
  onOpenInviteRecords?: () => void;
}


const createEmptyAccountQuery = () => ({
  search: '',
  orgs: [] as string[],
  roles: [] as string[],
  groups: [] as string[],
  statuses: [] as string[],
  realNameStatuses: [] as string[]
});

const STATUS_FILTER_OPTIONS = [
  { id: '已关注', label: '正常', dot: 'bg-blue-500' },
  { id: '已取消关注', label: '取消关注', dot: 'bg-orange-500' },
  { id: '禁用', label: '已停用', dot: 'bg-red-500' }
] as const;

const REAL_NAME_FILTER_OPTIONS = [
  { id: '已实名', label: '已实名', dot: 'bg-emerald-500' },
  { id: '未实名', label: '未实名', dot: 'bg-slate-400' }
] as const;

/** 多选筛选项全选时等价于「全部」，回填为空数组以显示默认「全部」文案 */
const normalizeAllSelected = (selected: string[], allIds: readonly string[]) =>
  allIds.length > 0 && selected.length === allIds.length && allIds.every((id) => selected.includes(id))
    ? []
    : selected;

const getAccountStatus = (item: PersonnelItem) => (item.status === '禁用' ? '禁用' : getFollowStatus(item));
const getRealNameStatus = (item: PersonnelItem) => (isRealNameVerified(item) ? '已实名' : '未实名');

export const SystemAccountManagement: React.FC<SystemAccountManagementProps> = ({
  shared,
  onOpenInviteRecords
}) => {
  const { orgNodes, personnelList, setPersonnelList, groups, inviteCodes, setInviteCodes, setFollowers } = shared;
  const [draftQuery, setDraftQuery] = useState(createEmptyAccountQuery);
  const [appliedQuery, setAppliedQuery] = useState(createEmptyAccountQuery);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<PersonnelItem | null>(null);
  const [viewing, setViewing] = useState<PersonnelItem | null>(null);
  const [isInviteRecordOpen, setIsInviteRecordOpen] = useState(false);
  const [pUsername, setPUsername] = useState('');
  const [pRealName, setPRealName] = useState('');
  const [pWechat, setPWechat] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pJobTitle, setPJobTitle] = useState('');
  const [pRoles, setPRoles] = useState<string[]>(['网格员']);
  const [orgPath, setOrgPath] = useState<string[]>([]);
  const [pGroupIds, setPGroupIds] = useState<string[]>([]);
  const [pStatus, setPStatus] = useState<'启用' | '禁用'>('启用');
  const [openFilter, setOpenFilter] = useState<'org' | 'role' | 'group' | 'status' | 'realName' | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [batchModifyOpen, setBatchModifyOpen] = useState(false);
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);
  const [batchChangeOrg, setBatchChangeOrg] = useState(false);
  const [batchChangeGroup, setBatchChangeGroup] = useState(false);
  const [batchOrgPath, setBatchOrgPath] = useState<string[]>([]);
  const [batchGroupIds, setBatchGroupIds] = useState<string[]>([]);

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
  const disabledCount = inRoster.filter((item) => item.status === '禁用').length;
  const normalCount = inRoster.filter(
    (item) => item.status !== '禁用' && getFollowStatus(item) === '已关注'
  ).length;
  const unfollowedCount = inRoster.filter(
    (item) => item.status !== '禁用' && getFollowStatus(item) === '已取消关注'
  ).length;
  const remainingSeats = Math.max(0, ORG_MAX_USER_COUNT - inRoster.length);

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
      if ((appliedQuery.statuses || []).length > 0 && !appliedQuery.statuses.includes(getAccountStatus(item))) {
        return false;
      }
      if (
        (appliedQuery.realNameStatuses || []).length > 0 &&
        !appliedQuery.realNameStatuses.includes(getRealNameStatus(item))
      ) {
        return false;
      }
      return true;
    });
  }, [inRoster, appliedQuery, orgNodes]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedList = filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
    setSelectedIds([]);
  };

  const handleResetFilters = () => {
    setOpenFilter(null);
    setDraftQuery(createEmptyAccountQuery());
    setAppliedQuery(createEmptyAccountQuery());
    setPage(1);
    setSelectedIds([]);
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

  const openCreateModal = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: PersonnelItem) => {
    setEditing(item);
    setPUsername(item.username);
    setPRealName(item.realName);
    setPWechat(item.wechat);
    setPPhone(item.phone);
    setPJobTitle(item.jobTitle || '');
    setPRoles(item.roles?.length ? [...item.roles] : ['网格员']);
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

  const handleToggleStatus = (item: PersonnelItem) => {
    setPersonnelList((prev) =>
      prev.map((row) =>
        row.id === item.id ? { ...row, status: row.status === '启用' ? '禁用' : '启用' } : row
      )
    );
    triggerToast(item.status === '启用' ? `已停用【${item.realName}】` : `已启用【${item.realName}】`);
  };

  const handleDelete = (item: PersonnelItem) => {
    const stillFollowing = getFollowStatus(item) === '已关注';
    const tip = stillFollowing
      ? '该用户仍关注公众号，删除后将回到「已关注未激活」列表。'
      : '该用户已取消关注公众号，删除后将不再显示。';
    if (!confirm(`确定删除账号【${item.realName}】吗？\n${tip}`)) return;
    setPersonnelList((prev) => prev.filter((row) => row.id !== item.id));
    syncFollowersAfterDelete(item, setFollowers);
    setSelectedIds((prev) => prev.filter((id) => id !== item.id));
    triggerToast(stillFollowing ? `已删除【${item.realName}】，已移至已关注未激活` : `已删除【${item.realName}】`);
  };

  const selectedItems = useMemo(
    () => filteredList.filter((item) => selectedIds.includes(item.id)),
    [filteredList, selectedIds]
  );

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAllPage = () => {
    const pageIds = pagedList.map((item) => item.id);
    const allOnPage = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allOnPage ? prev.filter((id) => !pageIds.includes(id)) : Array.from(new Set([...prev, ...pageIds]))
    );
  };

  const openBatchModify = () => {
    if (selectedItems.length === 0) {
      triggerToast('请先勾选要修改的账号');
      return;
    }
    setBatchChangeOrg(false);
    setBatchChangeGroup(false);
    setBatchOrgPath([]);
    setBatchGroupIds([]);
    setBatchModifyOpen(true);
  };

  const openBatchDelete = () => {
    if (selectedItems.length === 0) {
      triggerToast('请先勾选要删除的账号');
      return;
    }
    setBatchDeleteOpen(true);
  };

  const handleBatchExport = () => {
    const count = selectedItems.length || filteredList.length;
    triggerToast(`已导出 ${count} 条账号（演示）`);
  };

  const handleConfirmBatchModify = () => {
    if (!batchChangeOrg && !batchChangeGroup) {
      triggerToast('请至少勾选一项变更内容');
      return;
    }
    if (batchChangeOrg && batchOrgPath.length === 0) {
      triggerToast('请选择目标组织节点');
      return;
    }
    if (batchChangeGroup && batchGroupIds.length === 0) {
      triggerToast('请选择目标用户群组');
      return;
    }
    const leafOrgId = batchOrgPath[batchOrgPath.length - 1];
    const ids = new Set(selectedIds);
    setPersonnelList((prev) =>
      prev.map((item) => {
        if (!ids.has(item.id)) return item;
        return {
          ...item,
          ...(batchChangeOrg && leafOrgId
            ? { orgIds: [leafOrgId], primaryOrgId: leafOrgId }
            : {}),
          ...(batchChangeGroup ? { groupIds: [...batchGroupIds] } : {})
        };
      })
    );
    setBatchModifyOpen(false);
    setSelectedIds([]);
    triggerToast(`已批量修改 ${ids.size} 个账号`);
  };

  const handleConfirmBatchDelete = () => {
    const targets = selectedItems;
    if (targets.length === 0) return;
    setPersonnelList((prev) => prev.filter((row) => !selectedIds.includes(row.id)));
    targets.forEach((item) => syncFollowersAfterDelete(item, setFollowers));
    const count = targets.length;
    setBatchDeleteOpen(false);
    setSelectedIds([]);
    triggerToast(`已批量删除 ${count} 个账号，名额已退回配额池`);
  };

  return (
    <div className="space-y-4 min-w-0">
      {toast && (
        <div className="px-3 py-2 rounded-lg bg-[#1E5ABB] text-white text-xs font-bold">{toast}</div>
      )}

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs px-4 py-3.5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/40 px-4 py-3.5 flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-500">本机构外部联系人最大配额</div>
            <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-3xl font-black text-slate-900 leading-none tracking-tight">{ORG_MAX_USER_COUNT}</span>
              <span className="text-sm text-slate-500">人</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/40 px-4 py-3.5 flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-[#E8F1FF] text-[#1E5ABB] flex items-center justify-center shrink-0">
            <UserRoundCheck className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-500">已激活用户</div>
            <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-3xl font-black text-slate-900 leading-none tracking-tight">{inRoster.length}</span>
              <span className="text-sm text-slate-500">人</span>
              <div className="inline-flex items-center gap-1.5 flex-wrap">
                <div className="px-2 py-0.5 rounded-[5px] bg-blue-50 border border-blue-100 text-[11px] font-bold text-blue-600">
                  正常 {normalCount}
                </div>
                <div className="px-2 py-0.5 rounded-[5px] bg-orange-50 border border-orange-100 text-[11px] font-bold text-orange-500">
                  取关 {unfollowedCount}
                </div>
                <div className="px-2 py-0.5 rounded-[5px] bg-red-50 border border-red-100 text-[11px] font-bold text-red-600">
                  停用 {disabledCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/40 px-4 py-3.5 flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CircleCheckBig className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-500">剩余可激活数</div>
            <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-3xl font-black text-emerald-700 leading-none tracking-tight">{remainingSeats}</span>
              <span className="text-sm text-slate-500">人可用</span>
            </div>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="h-9 px-3 rounded-lg bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            邀请用户
          </button>
        </div>
      </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs px-5 py-3 min-w-0">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <div className="relative w-[200px] shrink-0">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              value={draftQuery.search}
              onChange={(event) => updateDraftQuery({ search: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleQuery();
              }}
              placeholder="搜索姓名、手机号..."
              className="w-full h-8 pl-8 pr-7 text-xs border border-gray-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white"
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
            triggerText={(draftQuery.orgs || []).length ? `已选 ${draftQuery.orgs.length} 个节点` : '全部组织节点'}
            active={(draftQuery.orgs || []).length > 0}
            title="选择组织节点架构"
            footerText={(count) => `已选中 ${count} 个节点`}
            confirmLabel="确定选择"
            widthClass="w-[340px]"
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
            onChange={(roles) =>
              updateDraftQuery({ roles: normalizeAllSelected(roles, ACCOUNT_ROLE_OPTIONS) })
            }
            triggerText={(draftQuery.roles || []).length ? `已选 ${draftQuery.roles.length} 个角色` : '全部角色'}
            active={(draftQuery.roles || []).length > 0}
            title="选择系统角色"
            clearLabel="清空"
            footerText={(count) => `已选 ${count} 个角色`}
            confirmLabel="确定选择"
            widthClass="w-[280px]"
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
            onChange={(selectedGroups) =>
              updateDraftQuery({
                groups: normalizeAllSelected(
                  selectedGroups,
                  groups.map((group) => group.id)
                )
              })
            }
            triggerIcon={<Tags className="w-3.5 h-3.5 text-violet-500" />}
            triggerText={(draftQuery.groups || []).length ? `已选 ${draftQuery.groups.length} 个群组` : '全部用户群组'}
            active={(draftQuery.groups || []).length > 0}
            title="选择用户群组标签"
            titleIcon={<Tags className="w-3.5 h-3.5 text-violet-500" />}
            clearLabel="清空"
            footerText={(count) => `已选 ${count} 个群组`}
            confirmLabel="确定选择"
            widthClass="w-[300px]"
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
                countAsBadge
              />
            )}
          </AccountFilterShell>
          <AccountFilterShell
            open={openFilter === 'status'}
            onOpenChange={(open) => setOpenFilter(open ? 'status' : null)}
            value={draftQuery.statuses || []}
            onChange={(statuses) =>
              updateDraftQuery({
                statuses: normalizeAllSelected(
                  statuses,
                  STATUS_FILTER_OPTIONS.map((item) => item.id)
                )
              })
            }
            triggerIcon={<Shield className="w-3.5 h-3.5" />}
            triggerText={
              (draftQuery.statuses || []).length === 0
                ? '账号状态: 全部状态'
                : draftQuery.statuses.length === 1
                  ? `账号状态: ${STATUS_FILTER_OPTIONS.find((option) => option.id === draftQuery.statuses[0])?.label || draftQuery.statuses[0]}`
                  : `账号状态: 已选 ${draftQuery.statuses.length} 项`
            }
            active={(draftQuery.statuses || []).length > 0}
            title="账号状态选择"
            footerText={(count) => `已选 ${count} 项`}
            confirmLabel="确定"
            widthClass="w-[240px]"
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
                shape="square"
              />
            )}
          </AccountFilterShell>
          <AccountFilterShell
            open={openFilter === 'realName'}
            onOpenChange={(open) => setOpenFilter(open ? 'realName' : null)}
            value={draftQuery.realNameStatuses || []}
            onChange={(realNameStatuses) =>
              updateDraftQuery({
                realNameStatuses: normalizeAllSelected(
                  realNameStatuses,
                  REAL_NAME_FILTER_OPTIONS.map((item) => item.id)
                )
              })
            }
            triggerIcon={<IdCard className="w-3.5 h-3.5" />}
            triggerText={
              (draftQuery.realNameStatuses || []).length === 0
                ? '实名状态: 全部'
                : draftQuery.realNameStatuses.length === 1
                  ? `实名状态: ${REAL_NAME_FILTER_OPTIONS.find((option) => option.id === draftQuery.realNameStatuses[0])?.label || draftQuery.realNameStatuses[0]}`
                  : `实名状态: 已选 ${draftQuery.realNameStatuses.length} 项`
            }
            active={(draftQuery.realNameStatuses || []).length > 0}
            title="实名状态选择"
            footerText={(count) => `已选 ${count} 项`}
            confirmLabel="确定"
            widthClass="w-[240px]"
          >
            {({ pending, toggle }) => (
              <FilterOptionList
                options={REAL_NAME_FILTER_OPTIONS.map((item) => ({
                  id: item.id,
                  label: item.label,
                  dot: item.dot
                }))}
                selected={pending}
                onToggle={toggle}
                shape="square"
              />
            )}
          </AccountFilterShell>
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              type="button"
              onClick={handleQuery}
              className="h-8 px-4 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-semibold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>查询</span>
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-8 px-3 bg-white hover:bg-gray-50 text-gray-500 text-xs font-medium rounded-[5px] border border-gray-200 inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重置
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden min-h-[560px] flex flex-col">
        <div className="px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 bg-gray-50/70 border-b border-gray-100 text-xs">
          <span className="text-gray-600">
            共 <strong className="text-[#1E5ABB] font-mono">{filteredList.length}</strong> 条账号
            {selectedIds.length > 0 && (
              <>
                <span className="mx-2 text-gray-300">|</span>
                已选 <strong className="text-[#1E5ABB] font-mono">{selectedIds.length}</strong> 条
              </>
            )}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={openBatchModify}
              className={`h-8 px-2.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1 cursor-pointer transition-colors ${
                selectedIds.length
                  ? 'bg-white border-blue-200 text-[#1E5ABB] hover:bg-blue-50'
                  : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              批量修改{selectedIds.length ? ` (${selectedIds.length})` : ''}
            </button>
            <button
              type="button"
              onClick={handleBatchExport}
              className="h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-emerald-600 text-xs font-medium inline-flex items-center gap-1 cursor-pointer hover:bg-emerald-50"
            >
              <Download className="w-3.5 h-3.5" />
              导出 ({selectedIds.length || filteredList.length})
            </button>
            <button
              type="button"
              onClick={openBatchDelete}
              className={`h-8 px-2.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1 cursor-pointer transition-colors ${
                selectedIds.length
                  ? 'bg-white border-rose-200 text-rose-600 hover:bg-rose-50'
                  : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              批量删除{selectedIds.length ? ` (${selectedIds.length})` : ''}
            </button>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="h-8 px-2 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                取消勾选
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-auto px-5 py-3 pb-4">
          <ExternalUserTable
            items={pagedList}
            orgNodes={orgNodes}
            getGroupName={getGroupName}
            startIndex={(currentPage - 1) * pageSize}
            emptyText="暂无匹配的系统账号"
            onAvatarClick={setViewing}
            onToggleStatus={handleToggleStatus}
            onEdit={openEditModal}
            onDelete={handleDelete}
            selectable
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAllPage}
          />
        </div>
        <div className="bg-gray-50/80 border-t border-gray-100">
          <PaginationBar
            total={filteredList.length}
            page={currentPage}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
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
                <p className="text-[11px] text-gray-400 mt-0.5">绑定机构、角色与用户群组，字段沿用当前人员档案</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs overflow-visible">
              <div className="grid grid-cols-2 gap-3">
                <Field label="真实姓名 *" value={pRealName} onChange={setPRealName} placeholder="如：张三" />
                <Field
                  label="账号名称 *"
                  value={pUsername}
                  onChange={setPUsername}
                  placeholder="登录账号"
                  disabled
                  hint="账号名称不支持修改"
                />
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
                  label="所属用户群组（可选）"
                  placeholder="-- 暂不归属任何分组 --"
                  options={groups.map((group) => ({ id: group.id, label: group.name }))}
                  selected={pGroupIds}
                  onToggle={(id) => toggleMulti(id, pGroupIds, setPGroupIds)}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1.5">启用状态</label>
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
        <InviteUserModal
          orgNodes={orgNodes}
          inviteCodes={inviteCodes}
          setInviteCodes={setInviteCodes}
          activatedCount={inRoster.length}
          onClose={() => setIsModalOpen(false)}
          onToast={triggerToast}
          onOpenRecords={() => {
            setIsModalOpen(false);
            if (onOpenInviteRecords) onOpenInviteRecords();
            else setIsInviteRecordOpen(true);
          }}
        />
      )}

      {!onOpenInviteRecords && isInviteRecordOpen && (
        <InviteRecordModal
          inviteCodes={inviteCodes}
          setInviteCodes={setInviteCodes}
          orgNodes={orgNodes}
          personnelList={personnelList}
          onClose={() => setIsInviteRecordOpen(false)}
          onCopy={copyText}
        />
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
              <Detail
                label="账号状态"
                value={
                  viewing.status === '禁用'
                    ? '已停用'
                    : getFollowStatus(viewing) === '已关注'
                      ? '正常'
                      : '取消关注'
                }
              />
              <Detail label="启用状态" value={viewing.status === '启用' ? '已启用' : '已停用'} />
              <div className="col-span-2">
                <Detail label="所属机构" value={formatPersonOrgPaths(orgNodes, viewing.orgIds, undefined, viewing.primaryOrgId)} />
              </div>
              <div className="col-span-2">
                <Detail
                  label="用户群组"
                  value={(viewing.groupIds || []).length ? viewing.groupIds!.map(getGroupName).join('、') : '未入组'}
                />
              </div>
              <Detail label="登记时间" value={viewing.registerDate} />
              <Detail label="标签" value={(viewing.labels || []).join('、') || '无'} />
            </div>
          </div>
        </div>
      )}

      {batchModifyOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">批量修改外部用户信息</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">已选中 {selectedItems.length} 名账号</p>
              </div>
              <button type="button" onClick={() => setBatchModifyOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-3">
                <div className="text-[11px] text-slate-600 mb-2">
                  将对以下选中的人员统一批量应用新的组织节点与群组归属：共{' '}
                  <b className="text-[#1E5ABB]">{selectedItems.length}</b> 人
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white border border-blue-100"
                    >
                      <span className="w-5 h-5 rounded-full overflow-hidden shrink-0">
                        <PersonAvatar name={item.realName} src={getPersonAvatarUrl(item)} size="sm" />
                      </span>
                      <span className="font-medium text-gray-700">{item.realName}</span>
                    </span>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={batchChangeOrg}
                  onChange={(event) => setBatchChangeOrg(event.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[#1E5ABB] focus:ring-[#1E5ABB]"
                />
                <span className="font-bold text-gray-800">批量变更【所在组织（组织节点）】</span>
              </label>
              {batchChangeOrg && (
                <div className="pl-6 space-y-1.5">
                  <OrgCascadeSelect
                    orgNodes={orgNodes}
                    path={batchOrgPath}
                    onChange={(path) => setBatchOrgPath(path.filter(Boolean))}
                  />
                  <p className="text-[11px] text-gray-400">选中的所有人员将被指派到该组织节点</p>
                </div>
              )}

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={batchChangeGroup}
                  onChange={(event) => setBatchChangeGroup(event.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[#1E5ABB] focus:ring-[#1E5ABB]"
                />
                <span className="font-bold text-gray-800">批量变更【所在群组（用户群组）】</span>
              </label>
              {batchChangeGroup && (
                <div className="pl-6 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {groups.map((group) => {
                      const active = batchGroupIds.includes(group.id);
                      return (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() =>
                            setBatchGroupIds((prev) =>
                              prev.includes(group.id) ? prev.filter((id) => id !== group.id) : [...prev, group.id]
                            )
                          }
                          className={`px-2.5 py-1 rounded-full border text-[11px] font-medium cursor-pointer ${
                            active
                              ? 'bg-[#1E5ABB] border-[#1E5ABB] text-white'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-blue-200'
                          }`}
                        >
                          {active && <Check className="w-3 h-3 inline mr-0.5" />}
                          {group.name}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-gray-400">选中的所有人员将被统一归入选中的群组（多选批量绑定）</p>
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBatchModifyOpen(false)}
                className="px-4 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer text-xs"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchModify}
                className="px-4 py-1.5 bg-[#1E5ABB] text-white rounded-lg font-bold hover:bg-[#134092] cursor-pointer text-xs inline-flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                确认批量修改
              </button>
            </div>
          </div>
        </div>
      )}

      {batchDeleteOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden">
            <div className="px-5 py-4 flex items-start gap-3">
              <span className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900">批量删除外部用户账号确认</h3>
                <p className="text-xs text-rose-600 font-medium mt-0.5">
                  本次将批量删除 {selectedItems.length} 名账号
                </p>
              </div>
            </div>
            <div className="px-5 pb-4 space-y-3 text-xs">
              <div className="rounded-xl border border-gray-200 bg-slate-50/80 px-3.5 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500">待删除的人员名单：</span>
                  <span className="text-gray-400">共 {selectedItems.length} 人</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                  {selectedItems.map((item) => (
                    <span
                      key={item.id}
                      className="px-2 py-1 rounded-md border border-gray-200 bg-white text-gray-700"
                    >
                      {item.realName} ({(item.phone || '').replace(/\D/g, '').slice(-4) || '—'})
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-rose-700">
                <div className="font-bold inline-flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  重要提示与免责声明
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] leading-relaxed">
                  <li>人员将从系统台账、分组列表中移除。</li>
                  <li>删除后占用的激活名额将退回机构配额池。</li>
                  <li>此操作不可撤销，请确认是否执行？</li>
                </ul>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBatchDeleteOpen(false)}
                className="px-4 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer text-xs"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchDelete}
                className="px-4 py-1.5 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 cursor-pointer text-xs inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                确认批量删除 ({selectedItems.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  iconClass?: string;
  value: React.ReactNode;
  valueClass?: string;
  unit?: string;
  badge?: string;
  compact?: boolean;
  tone?: string;
  footer: React.ReactNode;
  onClick?: () => void;
}> = ({
  title,
  icon,
  iconClass = 'text-slate-400',
  value,
  valueClass = 'text-slate-900',
  unit = '人',
  badge,
  compact,
  tone = 'border-slate-200 bg-white',
  footer,
  onClick
}) => {
  const clickable = Boolean(onClick);
  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (clickable && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick?.();
        }
      }}
      className={`group rounded-lg border px-3.5 py-3 flex flex-col min-w-0 min-h-[104px] transition-colors ${tone} ${
        clickable ? 'cursor-pointer hover:border-[#1E5ABB]/40 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs text-slate-600 font-semibold truncate">{title}</div>
        <span className={`shrink-0 ${iconClass}`}>{icon}</span>
      </div>
      <div className="mt-1.5 flex items-baseline gap-1 min-w-0">
        <span className={`font-black leading-tight truncate ${compact ? 'text-base py-1' : 'text-2xl'} ${valueClass}`}>
          {value}
        </span>
        {!compact && <span className="text-xs text-slate-500 shrink-0">{unit}</span>}
        {badge && (
          <span className="ml-1 px-1.5 py-px rounded bg-slate-100 text-[10px] font-bold text-slate-500 shrink-0">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-auto pt-2 flex items-center gap-3 text-[11px] min-w-0">
        <div className="flex-1 min-w-0 flex items-center gap-3">{footer}</div>
        {clickable && (
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#1E5ABB] shrink-0" />
        )}
      </div>
    </div>
  );
};

const MetricItem: React.FC<{ dot: string; label: string; value: number }> = ({ dot, label, value }) => (
  <span className="inline-flex items-center gap-1 text-slate-500 whitespace-nowrap">
    <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
    {label}
    <span className="font-bold text-slate-800">{value}</span>人
  </span>
);

const Detail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-gray-400 mb-0.5">{label}</div>
    <div className="font-medium text-gray-800">{value}</div>
  </div>
);

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
  titleIcon?: React.ReactNode;
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
  titleIcon,
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
        className={`inline-flex items-center gap-1.5 max-w-full h-8 px-3 rounded-[5px] border text-xs font-medium cursor-pointer transition-colors ${
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
            <div className="text-xs font-bold text-gray-800 truncate inline-flex items-center gap-1.5 min-w-0">
              {titleIcon}
              <span className="truncate">{title}</span>
            </div>
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
  countAsBadge?: boolean;
}> = ({ options, selected, onToggle, shape = 'square', countAsBadge = false }) => (
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
          {option.countLabel &&
            (countAsBadge ? (
              <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 shrink-0">
                {option.countLabel}
              </span>
            ) : (
              <span className={`text-[11px] shrink-0 ${checked ? 'text-[#1E5ABB]/70' : 'text-gray-400'}`}>
                {option.countLabel}
              </span>
            ))}
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
    const used = counts[node.id] || 0;
    const quota = node.quota;
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
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${node.disabled ? 'bg-orange-400' : 'bg-emerald-500'}`} />
            <CircleCheck checked={checked} shape="square" />
            <span className="flex-1 min-w-0 truncate text-xs font-medium">{node.name}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 shrink-0 tabular-nums">
              {quota !== undefined ? `${used} | ${quota}` : `${used} 人`}
            </span>
          </button>
        </div>
        {hasChildren && isExpanded && children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  return <div>{getOrgChildrenOf(orgNodes, null).map((node) => renderNode(node, 0))}</div>;
};

