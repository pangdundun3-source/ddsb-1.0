import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  UserPlus,
  Users,
  UserCheck,
  UserRoundCheck,
  UserX,
  RotateCcw,
  X,
  Send,
  Building2,
  ChevronDown,
  ChevronRight,
  Check,
  MessageCircle,
  MessageSquare,
  History,
  ShieldCheck,
  Clock3,
  CircleCheckBig
} from 'lucide-react';
import { InviteRecordModal } from './InviteRecordModal';
import { OrgCascadeSelect } from '../components/OrgCascadeSelect';
import { ExternalUserTable, getFollowStatus } from '../components/ExternalUserTable';
import { ReinviteModal } from '../components/ReinviteModal';
import { InviteUserModal, resolveInviteStatus } from '../components/InviteUserModal';
import { Field, MultiSelectDropdown } from '../components/FormControls';
import type { OrgNode, PersonnelItem } from './OrgManagement';
import {
  ACCOUNT_ROLE_OPTIONS,
  buildOrgIdPath,
  formatPersonOrgPaths,
  getDeepestOrgId,
  getOrgChildrenOf,
  EXTERNAL_APP,
  ORG_MAX_USER_COUNT,
  syncFollowersAfterDelete,
  type OfficialAccountFollower,
  type UserOrgSharedState
} from '../data/userOrgShared';
import {
  getPersonAvatarUrl,
  maskPhone,
  PersonAvatar
} from '../components/PersonAccountDisplay';

interface SystemAccountManagementProps {
  shared: UserOrgSharedState;
  currentOrg?: string;
}

const PAGE_SIZE = 8;

const createEmptyAccountQuery = () => ({
  search: '',
  orgs: [] as string[],
  roles: [] as string[],
  groups: [] as string[],
  statuses: [] as string[]
});

type AccountTab = 'activated' | 'pending';
const ACCOUNT_TAB_STORAGE_KEY = 'v8_account_tab';

const readStoredAccountTab = (): AccountTab =>
  localStorage.getItem(ACCOUNT_TAB_STORAGE_KEY) === 'pending' ? 'pending' : 'activated';

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

const STATUS_FILTER_OPTIONS = [
  { id: '已关注', label: '正常关注', dot: 'bg-emerald-500' },
  { id: '已取消关注', label: '取消关注', dot: 'bg-amber-500' },
  { id: '禁用', label: '禁用', dot: 'bg-rose-500' }
] as const;

const getAccountStatus = (item: PersonnelItem) => (item.status === '禁用' ? '禁用' : getFollowStatus(item));

export const SystemAccountManagement: React.FC<SystemAccountManagementProps> = ({ shared, currentOrg }) => {
  const { orgNodes, personnelList, setPersonnelList, groups, inviteCodes, setInviteCodes, followers, setFollowers } = shared;
  const [draftQuery, setDraftQuery] = useState(createEmptyAccountQuery);
  const [appliedQuery, setAppliedQuery] = useState(createEmptyAccountQuery);
  const [page, setPage] = useState(1);
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
  const [pRoles, setPRoles] = useState<string[]>(['上报员']);
  const [orgPath, setOrgPath] = useState<string[]>([]);
  const [pGroupIds, setPGroupIds] = useState<string[]>([]);
  const [pStatus, setPStatus] = useState<'启用' | '禁用'>('启用');
  const [accountTab, setAccountTab] = useState<AccountTab>(readStoredAccountTab);
  const [pendingSearch, setPendingSearch] = useState('');
  const [invitingFollower, setInvitingFollower] = useState<OfficialAccountFollower | null>(null);
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
  const disabledCount = inRoster.filter((item) => item.status === '禁用').length;
  const enabledCount = inRoster.length - disabledCount;
  const pendingInvites = inviteCodes.filter(
    (item) => item.channel !== 'qrcode' && item.channel !== 'link' && resolveInviteStatus(item) === '未使用'
  );
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

  const inactiveFollowers = followers.filter((follower) => !findRosterPerson(follower));

  const filteredInactiveFollowers = useMemo(() => {
    const q = pendingSearch.trim().toLowerCase();
    return inactiveFollowers.filter((follower) => {
      if (!q) return true;
      return (
        follower.nickname.toLowerCase().includes(q) ||
        follower.wechatAlias.toLowerCase().includes(q) ||
        (follower.phone || '').includes(q)
      );
    });
  }, [inactiveFollowers, pendingSearch]);

  const switchAccountTab = (tab: AccountTab) => {
    setAccountTab(tab);
    localStorage.setItem(ACCOUNT_TAB_STORAGE_KEY, tab);
  };

  const inviteFollowerFromList = (follower: OfficialAccountFollower) => {
    if (remainingSeats <= 0) {
      triggerToast('本机构可用名额已满，无法继续邀请');
      return;
    }
    setInvitingFollower(follower);
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
    triggerToast(stillFollowing ? `已删除【${item.realName}】，已移至已关注未激活` : `已删除【${item.realName}】`);
  };

  return (
    <div className="h-full min-h-[680px] flex flex-col min-w-0">
      {toast && (
        <div className="mx-5 mt-4 px-3 py-2 rounded-lg bg-[#1E5ABB] text-white text-xs font-bold">{toast}</div>
      )}

      <div className="px-5 pt-4 pb-3 grid grid-cols-5 gap-3">
        <StatCard
          title="机构关联服务号"
          icon={<MessageSquare className="w-4 h-4" />}
          iconClass="text-teal-600"
          value={EXTERNAL_APP.officialAccount}
          valueClass="text-[#1E3A8A]"
          compact
          footer={
            <span className="text-slate-500 truncate" title={currentOrg}>
              专属机构：{currentOrg || '未设置'}
            </span>
          }
        />
        <StatCard
          title="最大平台用户数"
          icon={<ShieldCheck className="w-4 h-4" />}
          value={ORG_MAX_USER_COUNT}
          footer={<span className="text-slate-400">机构授权编制上限</span>}
        />
        <StatCard
          title="已激活用户"
          icon={<UserRoundCheck className="w-4 h-4" />}
          value={inRoster.length}
          badge="全部"
          footer={
            <>
              <MetricItem dot="bg-emerald-500" label="启用" value={enabledCount} />
              <MetricItem dot="bg-slate-300" label="停用" value={disabledCount} />
            </>
          }
        />
        <StatCard
          title="待激活用户数"
          icon={<Clock3 className="w-4 h-4" />}
          iconClass="text-amber-500"
          value={pendingInvites.length}
          valueClass="text-amber-600"
          footer={
            <button
              type="button"
              onClick={() => setIsInviteRecordOpen(true)}
              className="w-full h-8 rounded-md border border-[#1E5ABB]/40 bg-white hover:bg-blue-50 text-[#1E5ABB] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              查看邀请记录
            </button>
          }
        />
        <StatCard
          title="剩余可用激活数"
          icon={<CircleCheckBig className="w-4 h-4" />}
          iconClass="text-emerald-600"
          value={remainingSeats}
          valueClass="text-emerald-700"
          tone="border-emerald-200 bg-emerald-50/60"
          footer={
            <button
              type="button"
              onClick={openCreateModal}
              className="w-full h-8 rounded-md bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              邀请用户
            </button>
          }
        />
      </div>

      <div className="mx-5 border-b border-slate-200 flex items-end gap-6">
        {(
          [
            { id: 'activated', label: '已关注已激活', count: inRoster.length },
            { id: 'pending', label: '已关注未激活', count: inactiveFollowers.length }
          ] as const
        ).map((tab) => {
          const active = accountTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => switchAccountTab(tab.id)}
              className={`relative -mb-px pb-2.5 pt-1 text-sm font-bold flex items-center gap-1.5 cursor-pointer border-b-2 transition-colors ${
                active ? 'border-[#1E5ABB] text-[#1E5ABB]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
              <span
                className={`min-w-[20px] px-1.5 py-px rounded-full text-[11px] font-bold text-center ${
                  active ? 'bg-[#1E5ABB] text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {accountTab === 'pending' ? (
        <div className="flex-1 min-h-0 flex flex-col min-w-0">
          <div className="px-5 py-3 flex flex-wrap items-center gap-2">
            <div className="relative w-[220px] shrink-0">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              <input
                value={pendingSearch}
                onChange={(event) => setPendingSearch(event.target.value)}
                placeholder="搜索微信昵称 / 微信号 / 手机号"
                className="w-full h-8 pl-8 pr-3 text-xs border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-gray-50/50"
              />
            </div>
            <div className="ml-auto text-xs text-gray-500">
              关注公众号但尚未激活账号的用户，可直接发起邀请
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-auto px-5 pb-4">
            <table className="w-full text-xs border border-slate-100 rounded-lg overflow-hidden">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3 py-2.5 text-left font-semibold w-14">序号</th>
                  <th className="px-3 py-2.5 text-left font-semibold">微信昵称</th>
                  <th className="px-3 py-2.5 text-left font-semibold">微信号</th>
                  <th className="px-3 py-2.5 text-left font-semibold">手机号</th>
                  <th className="px-3 py-2.5 text-left font-semibold">地区</th>
                  <th className="px-3 py-2.5 text-left font-semibold">关注时间</th>
                  <th className="px-3 py-2.5 text-left font-semibold">邀请状态</th>
                  <th className="px-3 py-2.5 text-right font-semibold">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInactiveFollowers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-14 text-center text-slate-400">
                      暂无已关注未激活的用户
                    </td>
                  </tr>
                ) : (
                  filteredInactiveFollowers.map((follower, index) => {
                    const invited = isFollowerInvited(follower.id);
                    return (
                      <tr key={follower.id} className="hover:bg-slate-50/60">
                        <td className="px-3 py-2.5 text-slate-400">{index + 1}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <FollowerLetterAvatar id={follower.id} name={follower.nickname} />
                            <span className="font-bold text-slate-800">{follower.nickname}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">{follower.wechatAlias || '—'}</td>
                        <td className="px-3 py-2.5 text-slate-600">
                          {follower.phone ? follower.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">{follower.city || '—'}</td>
                        <td className="px-3 py-2.5 text-slate-500">{follower.followTime}</td>
                        <td className="px-3 py-2.5">
                          {invited ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              已邀请待激活
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              未邀请
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {invited ? (
                            <button
                              type="button"
                              onClick={() => setIsInviteRecordOpen(true)}
                              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-slate-200 text-slate-600 hover:border-[#1E5ABB] hover:text-[#1E5ABB] font-semibold cursor-pointer"
                            >
                              <History className="w-3.5 h-3.5" />
                              邀请记录
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => inviteFollowerFromList(follower)}
                              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md bg-[#1E5ABB] hover:bg-[#134092] text-white font-semibold cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              邀请激活
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="text-[11px] text-gray-400 mt-3">共 {filteredInactiveFollowers.length} 条记录</div>
          </div>
        </div>
      ) : (
      <>
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
                  ? `账号状态：${STATUS_FILTER_OPTIONS.find((option) => option.id === draftQuery.statuses[0])?.label || draftQuery.statuses[0]}`
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
        <ExternalUserTable
          items={pagedList}
          orgNodes={orgNodes}
          getGroupName={getGroupName}
          startIndex={(currentPage - 1) * PAGE_SIZE}
          emptyText="暂无匹配的系统账号"
          onAvatarClick={setViewing}
          onToggleStatus={handleToggleStatus}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
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
      </>
      )}

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
            setIsInviteRecordOpen(true);
          }}
        />
      )}

      {invitingFollower && (
        <ReinviteModal
          follower={invitingFollower}
          orgNodes={orgNodes}
          inviteCodes={inviteCodes}
          setInviteCodes={setInviteCodes}
          setPersonnelList={setPersonnelList}
          onClose={() => setInvitingFollower(null)}
          onSuccess={triggerToast}
        />
      )}

      {isInviteRecordOpen && (
        <InviteRecordModal
          inviteCodes={inviteCodes}
          orgNodes={orgNodes}
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
              <Detail label="账号状态" value={getFollowStatus(viewing) === '已关注' ? '正常关注' : '取消关注'} />
              <Detail label="启用状态" value={viewing.status === '启用' ? '已启用' : '已停用'} />
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

