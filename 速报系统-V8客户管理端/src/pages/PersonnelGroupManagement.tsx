import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Plus, Users, UserPlus, Pencil, Trash2, X, Check, Building2, Circle, ArrowUpDown, RotateCcw } from 'lucide-react';
import type { PersonnelItem } from './OrgManagement';
import {
  ACCOUNT_ROLE_OPTIONS,
  buildOrgIdPath,
  formatPersonOrgPaths,
  getOrgFullPath,
  type PersonnelGroup,
  type UserOrgSharedState
} from '../data/userOrgShared';
import {
  getPersonAvatarUrl,
  maskPhone,
  PersonAvatar,
  PersonGroupCell,
  PersonOrgPathCell,
  PersonRoleBadges
} from '../components/PersonAccountDisplay';
import { ExternalUserTable, FollowStatusBadges } from '../components/ExternalUserTable';
import { PaginationBar } from '../components/PaginationBar';

interface PersonnelGroupManagementProps {
  shared: UserOrgSharedState;
}

export const PersonnelGroupManagement: React.FC<PersonnelGroupManagementProps> = ({ shared }) => {
  const { orgNodes, personnelList, setPersonnelList, groups, setGroups, inviteCodes, setInviteCodes } = shared;
  const [pickSearch, setPickSearch] = useState('');
  const [pickRole, setPickRole] = useState('all');
  const [onlyUngrouped, setOnlyUngrouped] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || '');
  const [groupSearch, setGroupSearch] = useState('');
  const [memberSearchDraft, setMemberSearchDraft] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [memberPage, setMemberPage] = useState(1);
  const [memberPageSize, setMemberPageSize] = useState(10);
  const [toast, setToast] = useState('');
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [inlineGroupName, setInlineGroupName] = useState('');
  const [renamingGroupId, setRenamingGroupId] = useState<string | null>(null);
  const [renamingGroupName, setRenamingGroupName] = useState('');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [orgFilter, setOrgFilter] = useState('all');
  const [pickedIds, setPickedIds] = useState<number[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [changeGroupTargets, setChangeGroupTargets] = useState<PersonnelItem[] | null>(null);
  const [changeGroupTo, setChangeGroupTo] = useState('');
  const [draggingGroupId, setDraggingGroupId] = useState<string | null>(null);
  const [dropHint, setDropHint] = useState<{ id: string; position: 'before' | 'after' } | null>(null);
  const groupDragMovedRef = useRef(false);
  const draggingGroupIdRef = useRef<string | null>(null);

  const triggerToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  };

  const activePeople = personnelList.filter((item) => !item.recycled);

  const filteredGroups = groups.filter((group) => {
    const q = groupSearch.trim();
    if (!q) return true;
    return group.name.includes(q);
  });

  const selectedGroup = groups.find((group) => group.id === selectedGroupId) || filteredGroups[0] || groups[0];

  const clearGroupDragState = () => {
    draggingGroupIdRef.current = null;
    setDraggingGroupId(null);
    setDropHint(null);
  };

  const reorderGroups = (dragId: string, targetId: string, position: 'before' | 'after') => {
    if (dragId === targetId) return;
    setGroups((prev) => {
      const from = prev.findIndex((group) => group.id === dragId);
      const targetIndex = prev.findIndex((group) => group.id === targetId);
      if (from < 0 || targetIndex < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      let insertAt = next.findIndex((group) => group.id === targetId);
      if (insertAt < 0) return prev;
      if (position === 'after') insertAt += 1;
      next.splice(insertAt, 0, moved);
      return next;
    });
  };

  const members = useMemo(() => {
    if (!selectedGroup) return [];
    return activePeople
      .filter((item) => (item.groupIds || []).includes(selectedGroup.id))
      .filter((item) => {
        if (!memberSearch.trim()) return true;
        const q = memberSearch.trim().toLowerCase();
        return (
          item.realName.toLowerCase().includes(q) ||
          item.username.toLowerCase().includes(q) ||
          item.phone.toLowerCase().includes(q)
        );
      });
  }, [activePeople, selectedGroup, memberSearch]);

  useEffect(() => {
    setMemberPage(1);
  }, [selectedGroupId, memberSearch]);

  const memberTotalPages = Math.max(1, Math.ceil(members.length / memberPageSize));
  const safeMemberPage = Math.min(memberPage, memberTotalPages);
  const pagedMembers = members.slice(
    (safeMemberPage - 1) * memberPageSize,
    safeMemberPage * memberPageSize
  );

  const createGroupByName = (rawName: string) => {
    const name = rawName.trim();
    if (!name) return false;
    if (groups.some((group) => group.name === name)) {
      triggerToast('已存在同名分组');
      return false;
    }
    const newGroup: PersonnelGroup = {
      id: `grp-${Date.now()}`,
      name,
      description: ''
    };
    setGroups((prev) => [...prev, newGroup]);
    setSelectedGroupId(newGroup.id);
    triggerToast(`已创建分组【${newGroup.name}】`);
    return true;
  };

  const cancelAddGroup = () => {
    setIsAddingGroup(false);
    setInlineGroupName('');
  };

  const openCreate = () => {
    cancelRenameGroup();
    setIsAddingGroup(true);
    setInlineGroupName(groupSearch.trim());
  };

  const confirmInlineGroup = () => {
    const name = inlineGroupName.trim();
    if (!name) {
      cancelAddGroup();
      return;
    }
    if (createGroupByName(name)) {
      cancelAddGroup();
      setGroupSearch('');
    }
  };

  const startRenameGroup = (group: PersonnelGroup) => {
    cancelAddGroup();
    setRenamingGroupId(group.id);
    setRenamingGroupName(group.name);
  };

  const cancelRenameGroup = () => {
    setRenamingGroupId(null);
    setRenamingGroupName('');
  };

  const confirmRenameGroup = () => {
    const name = renamingGroupName.trim();
    const group = groups.find((item) => item.id === renamingGroupId);
    if (!group || !name || name === group.name) {
      cancelRenameGroup();
      return;
    }
    if (groups.some((item) => item.id !== group.id && item.name === name)) {
      triggerToast('已存在同名分组');
      return;
    }
    setGroups((prev) => prev.map((item) => (item.id === group.id ? { ...item, name } : item)));
    cancelRenameGroup();
    triggerToast(`已将分组重命名为【${name}】`);
  };

  const handleDeleteGroup = (group: PersonnelGroup) => {
    if (!confirm(`确定删除分组【${group.name}】吗？成员仅移出该组，账号本身保留。`)) return;
    setGroups((prev) => prev.filter((item) => item.id !== group.id));
    setPersonnelList((prev) =>
      prev.map((item) => ({
        ...item,
        groupIds: (item.groupIds || []).filter((groupId) => groupId !== group.id)
      }))
    );
    if (selectedGroupId === group.id) {
      const next = groups.find((item) => item.id !== group.id);
      setSelectedGroupId(next?.id || '');
    }
    triggerToast(`已删除分组【${group.name}】`);
  };

  const openAddMembers = () => {
    setOrgFilter('all');
    setPickedIds([]);
    setPickSearch('');
    setPickRole('all');
    setOnlyUngrouped(false);
    setIsAddMemberOpen(true);
  };

  const getGroupName = (id: string) => groups.find((group) => group.id === id)?.name || id;

  const candidatePeople = activePeople.filter((item) => {
    if (!selectedGroup) return false;
    if ((item.groupIds || []).includes(selectedGroup.id)) return false;
    if (orgFilter !== 'all') {
      const belongsToOrg = item.orgIds.some(
        (id) => id === orgFilter || buildOrgIdPath(orgNodes, id).includes(orgFilter)
      );
      if (!belongsToOrg) return false;
    }
    if (pickRole !== 'all' && !(item.roles || []).includes(pickRole)) return false;
    if (onlyUngrouped && (item.groupIds || []).length > 0) return false;
    const q = pickSearch.trim().toLowerCase();
    if (q && !item.realName.toLowerCase().includes(q) && !item.phone.includes(q)) return false;
    return true;
  });

  const allCandidatesPicked =
    candidatePeople.length > 0 && candidatePeople.every((item) => pickedIds.includes(item.id));

  const togglePicked = (id: number) => {
    setPickedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleAllCandidates = () => {
    const ids = candidatePeople.map((item) => item.id);
    setPickedIds((prev) =>
      allCandidatesPicked ? prev.filter((id) => !ids.includes(id)) : Array.from(new Set([...prev, ...ids]))
    );
  };

  const handleConfirmAddMembers = () => {
    if (!selectedGroup || pickedIds.length === 0) return;
    setPersonnelList((prev) =>
      prev.map((item) =>
        pickedIds.includes(item.id)
          ? { ...item, groupIds: Array.from(new Set([...(item.groupIds || []), selectedGroup.id])) }
          : item
      )
    );
    triggerToast(`已将 ${pickedIds.length} 人加入【${selectedGroup.name}】`);
    setIsAddMemberOpen(false);
  };

  const handleRemoveMember = (person: PersonnelItem) => {
    if (!selectedGroup) return;
    setPersonnelList((prev) =>
      prev.map((item) =>
        item.id === person.id
          ? { ...item, groupIds: (item.groupIds || []).filter((groupId) => groupId !== selectedGroup.id) }
          : item
      )
    );
    triggerToast(`已将【${person.realName}】移出分组`);
  };

  const openChangeGroup = (person: PersonnelItem) => {
    setChangeGroupTargets([person]);
    setChangeGroupTo(selectedGroup?.id || '');
  };

  const openBatchChangeGroup = () => {
    if (!selectedGroup) return;
    if (selectedMemberIds.length === 0) {
      triggerToast('请先勾选要调整的成员');
      return;
    }
    const targets = members.filter((item) => selectedMemberIds.includes(item.id));
    if (!targets.length) {
      triggerToast('请先勾选要调整的成员');
      return;
    }
    setChangeGroupTargets(targets);
    setChangeGroupTo(selectedGroup.id);
  };

  const toggleSelectMember = (id: number) => {
    setSelectedMemberIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAllMembers = () => {
    const pageIds = pagedMembers.map((item) => item.id);
    const allOnPage = pageIds.length > 0 && pageIds.every((id) => selectedMemberIds.includes(id));
    setSelectedMemberIds((prev) =>
      allOnPage ? prev.filter((id) => !pageIds.includes(id)) : Array.from(new Set([...prev, ...pageIds]))
    );
  };

  const handleChangeGroup = () => {
    if (!changeGroupTargets?.length || !selectedGroup) return;
    if (!changeGroupTo || changeGroupTo === selectedGroup.id) {
      setChangeGroupTargets(null);
      return;
    }
    const targetName = getGroupName(changeGroupTo);
    const ids = new Set(changeGroupTargets.map((item) => item.id));
    setPersonnelList((prev) =>
      prev.map((item) =>
        ids.has(item.id)
          ? {
              ...item,
              groupIds: Array.from(
                new Set([...(item.groupIds || []).filter((groupId) => groupId !== selectedGroup.id), changeGroupTo])
              )
            }
          : item
      )
    );
    triggerToast(
      changeGroupTargets.length === 1
        ? `已将【${changeGroupTargets[0].realName}】调整到「${targetName}」`
        : `已将 ${changeGroupTargets.length} 人调整到「${targetName}」`
    );
    setSelectedMemberIds((prev) => prev.filter((id) => !ids.has(id)));
    setChangeGroupTargets(null);
  };

  useEffect(() => {
    setSelectedMemberIds([]);
    setChangeGroupTargets(null);
  }, [selectedGroupId]);

  return (
    <div className="h-full min-h-[680px] flex min-w-0">
      <aside className="w-[240px] shrink-0 border-r border-slate-100 p-3 flex flex-col gap-3 min-h-0 bg-slate-50/30">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <input
              value={groupSearch}
              onChange={(event) => setGroupSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  openCreate();
                }
              }}
              placeholder="输入分组名称"
              className="w-full pl-3 pr-8 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white"
            />
            {groupSearch ? (
              <button
                type="button"
                onClick={() => setGroupSearch('')}
                title="清除"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2 pointer-events-none" />
            )}
          </div>
          <button
            type="button"
            onClick={openCreate}
            title="新建分组"
            className="w-8 h-8 shrink-0 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded flex items-center justify-center cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
          {isAddingGroup && (
            <div className="flex items-center gap-1 px-2 py-2">
              <input
                autoFocus
                value={inlineGroupName}
                onChange={(event) => setInlineGroupName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    confirmInlineGroup();
                  }
                  if (event.key === 'Escape') {
                    event.preventDefault();
                    cancelAddGroup();
                  }
                }}
                placeholder="输入分组名称，回车保存"
                className="flex-1 min-w-0 px-2 py-1 text-xs border border-[#1E5ABB] rounded bg-white text-gray-800 font-normal focus:outline-none"
              />
              <button
                type="button"
                title="保存"
                onMouseDown={(event) => event.preventDefault()}
                onClick={confirmInlineGroup}
                className="p-1 rounded text-[#1E5ABB] hover:bg-blue-50 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="取消"
                onMouseDown={(event) => event.preventDefault()}
                onClick={cancelAddGroup}
                className="p-1 rounded text-gray-400 hover:bg-gray-50 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {filteredGroups.length === 0 && !isAddingGroup ? (
            <div className="py-8 text-center text-xs text-gray-400">暂无匹配分组</div>
          ) : (
            filteredGroups.map((group) => {
              const isActive = selectedGroup?.id === group.id;
              const isRenaming = renamingGroupId === group.id;
              const isDragging = draggingGroupId === group.id;
              const canDropHere = Boolean(
                (draggingGroupIdRef.current || draggingGroupId) &&
                  (draggingGroupIdRef.current || draggingGroupId) !== group.id
              );
              const hintHere = dropHint?.id === group.id ? dropHint.position : null;
              if (isRenaming) {
                return (
                  <div key={group.id} className="flex items-center gap-1 px-2 py-2" onClick={(event) => event.stopPropagation()}>
                    <input
                      autoFocus
                      value={renamingGroupName}
                      onChange={(event) => setRenamingGroupName(event.target.value)}
                      onFocus={(event) => event.target.select()}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          confirmRenameGroup();
                        }
                        if (event.key === 'Escape') {
                          event.preventDefault();
                          cancelRenameGroup();
                        }
                      }}
                      placeholder="输入分组名称，回车保存"
                      className="flex-1 min-w-0 px-2 py-1 text-xs border border-[#1E5ABB] rounded bg-white text-gray-800 font-normal focus:outline-none"
                    />
                    <button
                      type="button"
                      title="保存"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={confirmRenameGroup}
                      className="p-1 rounded text-[#1E5ABB] hover:bg-blue-50 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="取消"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={cancelRenameGroup}
                      className="p-1 rounded text-gray-400 hover:bg-gray-50 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              }
              return (
                <div
                  key={group.id}
                  onClick={() => {
                    if (groupDragMovedRef.current) {
                      groupDragMovedRef.current = false;
                      return;
                    }
                    setSelectedGroupId(group.id);
                  }}
                  onDragOver={(event) => {
                    if (!canDropHere) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                    const rect = event.currentTarget.getBoundingClientRect();
                    const position = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
                    if (dropHint?.id !== group.id || dropHint.position !== position) {
                      setDropHint({ id: group.id, position });
                    }
                  }}
                  onDrop={(event) => {
                    const dragId = draggingGroupIdRef.current || draggingGroupId;
                    if (!dragId || dragId === group.id) return;
                    event.preventDefault();
                    const position = dropHint?.id === group.id ? dropHint.position : 'before';
                    reorderGroups(dragId, group.id, position);
                    clearGroupDragState();
                  }}
                  className={`relative flex items-center gap-1.5 rounded-md px-2 py-2 cursor-pointer transition-colors ${
                    isActive ? 'bg-[#1E5ABB] text-white' : 'text-gray-700 hover:bg-white'
                  } ${isDragging ? 'opacity-50' : ''} ${
                    hintHere === 'before' ? 'before:absolute before:left-2 before:right-2 before:top-0 before:h-0.5 before:bg-[#1E5ABB] before:rounded-full' : ''
                  } ${
                    hintHere === 'after' ? 'after:absolute after:left-2 after:right-2 after:bottom-0 after:h-0.5 after:bg-[#1E5ABB] after:rounded-full' : ''
                  }`}
                >
                  <button
                    type="button"
                    draggable
                    title="拖拽调整分组顺序"
                    aria-label={`拖拽调整「${group.name}」的顺序`}
                    onDragStart={(event) => {
                      event.stopPropagation();
                      groupDragMovedRef.current = true;
                      draggingGroupIdRef.current = group.id;
                      event.dataTransfer.effectAllowed = 'move';
                      event.dataTransfer.setData('text/plain', group.id);
                      setDraggingGroupId(group.id);
                    }}
                    onDragEnd={clearGroupDragState}
                    onClick={(event) => event.stopPropagation()}
                    className={`p-0.5 rounded shrink-0 cursor-grab active:cursor-grabbing ${
                      isActive ? 'text-white/70 hover:text-white' : 'text-gray-300 hover:text-gray-500'
                    }`}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                  <span className="min-w-0 flex-1 truncate text-xs font-medium">{group.name}</span>
                  {isActive && (
                    <span className="flex items-center shrink-0">
                      <button
                        type="button"
                        title="重命名分组"
                        onClick={(event) => {
                          event.stopPropagation();
                          startRenameGroup(group);
                        }}
                        className="p-1 rounded hover:bg-white/15 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="删除分组"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteGroup(group);
                        }}
                        className="p-1 rounded hover:bg-white/15 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {toast && (
          <div className="mx-5 mt-4 px-3 py-2 rounded-lg bg-[#1E5ABB] text-white text-xs font-bold">{toast}</div>
        )}
        {selectedGroup ? (
          <>
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1E5ABB] shrink-0" />
                  <h3 className="text-sm font-bold text-gray-800 truncate">{selectedGroup.name}</h3>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={openBatchChangeGroup}
                  className={`px-2.5 py-1 text-xs border rounded inline-flex items-center gap-1 cursor-pointer transition-colors ${
                    selectedMemberIds.length
                      ? 'border-blue-200 text-[#1E5ABB] bg-white hover:bg-blue-50'
                      : 'border-gray-200 text-gray-400 bg-white hover:border-gray-300'
                  }`}
                >
                  <ArrowUpDown className="w-3 h-3" />
                  批量修改分组{selectedMemberIds.length ? ` (${selectedMemberIds.length})` : ''}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteGroup(selectedGroup)}
                  className="px-2.5 py-1 text-xs border border-rose-200 rounded text-rose-600 hover:bg-rose-50 cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  删除
                </button>
                <button
                  type="button"
                  onClick={openAddMembers}
                  className="px-3 py-1 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold rounded flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  添加成员至本组
                </button>
              </div>
            </div>

            <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-bold text-gray-800 whitespace-nowrap">分组成员花名册明细</span>
                {selectedMemberIds.length > 0 && (
                  <span className="text-[11px] text-gray-500 whitespace-nowrap">
                    已选 <strong className="text-[#1E5ABB] font-mono">{selectedMemberIds.length}</strong> 人
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                  <input
                    value={memberSearchDraft}
                    onChange={(event) => setMemberSearchDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        setMemberSearch(memberSearchDraft);
                        setMemberPage(1);
                      }
                    }}
                    placeholder="搜索姓名 / 手机号"
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMemberSearch(memberSearchDraft);
                    setMemberPage(1);
                  }}
                  className="h-8 px-3 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-semibold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  查询
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMemberSearchDraft('');
                    setMemberSearch('');
                    setMemberPage(1);
                  }}
                  className="h-8 px-3 bg-white hover:bg-gray-50 text-gray-500 text-xs font-medium rounded-[5px] border border-gray-200 inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  重置
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto px-5 pb-4">
              <ExternalUserTable
                items={pagedMembers}
                orgNodes={orgNodes}
                getGroupName={getGroupName}
                startIndex={(safeMemberPage - 1) * memberPageSize}
                emptyText="当前分组暂无成员，点击右上角添加"
                selectable
                selectedIds={selectedMemberIds}
                onToggleSelect={toggleSelectMember}
                onToggleSelectAll={toggleSelectAllMembers}
                renderExtraActions={(item) => (
                  <>
                    <button
                      type="button"
                      onClick={() => openChangeGroup(item)}
                      className="h-6 px-2 rounded border border-blue-100 text-[11px] font-bold text-[#1E5ABB] hover:bg-blue-50 cursor-pointer"
                    >
                      修改分组
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(item)}
                      className="h-6 px-2 rounded border border-rose-100 text-[11px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      移出
                    </button>
                  </>
                )}
              />
            </div>
            <div className="bg-gray-50/80 border-t border-gray-100">
              <PaginationBar
                total={members.length}
                page={safeMemberPage}
                pageSize={memberPageSize}
                onPageChange={setMemberPage}
                onPageSizeChange={(size) => {
                  setMemberPageSize(size);
                  setMemberPage(1);
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">请先新建一个用户群组</div>
        )}
      </div>

      {changeGroupTargets && changeGroupTargets.length > 0 && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setChangeGroupTargets(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md text-xs" onClick={(event) => event.stopPropagation()}>
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
              <div className="font-bold text-gray-800 text-sm">
                {changeGroupTargets.length > 1 ? '批量修改分组' : '修改分组'}
              </div>
              <button
                type="button"
                onClick={() => setChangeGroupTargets(null)}
                className="w-7 h-7 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-gray-700 font-medium mb-1.5">调整人员</label>
                <div className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-gray-700 leading-5 max-h-24 overflow-y-auto">
                  {changeGroupTargets.map((item) => item.realName).join('、')}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1.5">
                  目标分组
                  <span className="ml-1.5 font-normal text-gray-400">从「{selectedGroup.name}」调整到</span>
                </label>
                <select
                  value={changeGroupTo}
                  onChange={(event) => setChangeGroupTo(event.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] cursor-pointer"
                >
                  {groups.map((group) => {
                    const isCurrent = group.id === selectedGroup.id;
                    const alreadyInCount = changeGroupTargets.filter(
                      (person) => !isCurrent && (person.groupIds || []).includes(group.id)
                    ).length;
                    const suffix = isCurrent
                      ? '（当前分组）'
                      : alreadyInCount > 0
                        ? changeGroupTargets.length === 1
                          ? '（已在该组）'
                          : `（${alreadyInCount} 人已在该组）`
                        : '';
                    return (
                      <option key={group.id} value={group.id}>
                        {group.name}
                        {suffix}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setChangeGroupTargets(null)}
                className="h-8 px-4 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleChangeGroup}
                disabled={!changeGroupTo || changeGroupTo === selectedGroup.id}
                className="h-8 px-4 rounded bg-[#1E5ABB] text-white font-bold hover:bg-[#134092] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                确认调整
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddMemberOpen && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsAddMemberOpen(false)}>
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden h-[80vh] max-h-[720px] flex flex-col text-xs"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-800">添加成员至【{selectedGroup.name}】</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  从外部用户管理中勾选人员加入本组，已在本组的成员不再显示
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddMemberOpen(false)}
                className="w-7 h-7 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-3 flex flex-wrap items-center gap-2 border-b border-gray-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  value={pickSearch}
                  onChange={(event) => setPickSearch(event.target.value)}
                  placeholder="搜索姓名 / 手机号"
                  className="h-8 w-52 pl-8 pr-2 border border-gray-200 rounded focus:outline-none focus:border-[#1E5ABB]"
                />
              </div>
              <select
                value={orgFilter}
                onChange={(event) => setOrgFilter(event.target.value)}
                className="h-8 max-w-[260px] border border-gray-200 rounded px-2 bg-white focus:outline-none focus:border-[#1E5ABB]"
              >
                <option value="all">全部组织节点</option>
                {orgNodes.map((org) => (
                  <option key={org.id} value={org.id}>
                    {getOrgFullPath(orgNodes, org.id)}
                  </option>
                ))}
              </select>
              <select
                value={pickRole}
                onChange={(event) => setPickRole(event.target.value)}
                className="h-8 border border-gray-200 rounded px-2 bg-white focus:outline-none focus:border-[#1E5ABB]"
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
                  checked={onlyUngrouped}
                  onChange={(event) => setOnlyUngrouped(event.target.checked)}
                  className="rounded text-[#1E5ABB] focus:ring-[#1E5ABB] w-3.5 h-3.5"
                />
                仅看未分组
              </label>
              <span className="ml-auto text-gray-400">
                共 <b className="text-gray-700">{candidatePeople.length}</b> 位可选
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-auto px-5 py-2">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50 text-gray-500 border-y border-gray-200 font-medium">
                    <th className="py-2.5 px-3 w-10">
                      <input
                        type="checkbox"
                        checked={allCandidatesPicked}
                        disabled={candidatePeople.length === 0}
                        onChange={toggleAllCandidates}
                        className="rounded text-[#1E5ABB] focus:ring-[#1E5ABB] w-3.5 h-3.5 cursor-pointer"
                      />
                    </th>
                    <th className="py-2.5 px-3 whitespace-nowrap">姓名 / 手机号</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1"><Building2 className="w-3 h-3" />组织节点</span>
                    </th>
                    <th className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1"><Circle className="w-3 h-3" />角色名称</span>
                    </th>
                    <th className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />当前分组</span>
                    </th>
                    <th className="py-2.5 px-3 whitespace-nowrap">账号状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {candidatePeople.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        没有符合条件的外部用户
                      </td>
                    </tr>
                  ) : (
                    candidatePeople.map((person) => {
                      const checked = pickedIds.includes(person.id);
                      const enabled = person.status === '启用';
                      const currentGroupId = (person.groupIds || [])[0];
                      return (
                        <tr
                          key={person.id}
                          onClick={() => togglePicked(person.id)}
                          className={`cursor-pointer transition-colors ${
                            checked ? 'bg-blue-50/70' : enabled ? 'hover:bg-slate-50' : 'bg-slate-50/80 hover:bg-slate-100/70'
                          }`}
                        >
                          <td className="py-2.5 px-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePicked(person.id)}
                              onClick={(event) => event.stopPropagation()}
                              className="rounded text-[#1E5ABB] focus:ring-[#1E5ABB] w-3.5 h-3.5 cursor-pointer"
                            />
                          </td>
                          <td className={`py-2.5 px-3 ${enabled ? '' : 'opacity-50 grayscale'}`}>
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
                          <td className="py-2.5 px-3 max-w-[220px]">
                            <PersonOrgPathCell path={formatPersonOrgPaths(orgNodes, person.orgIds, undefined, person.primaryOrgId)} />
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <PersonRoleBadges roles={[(person.roles || [])[0] || '未分配']} />
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <PersonGroupCell groupName={currentGroupId ? getGroupName(currentGroupId) : undefined} />
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

            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <div className="text-gray-500">
                已选 <b className="text-[#1E5ABB]">{pickedIds.length}</b> 人
                {pickedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPickedIds([])}
                    className="ml-2 text-gray-400 hover:text-[#1E5ABB] cursor-pointer"
                  >
                    清空
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddMembers}
                  disabled={pickedIds.length === 0}
                  className="px-4 py-1.5 bg-[#1E5ABB] text-white rounded font-bold hover:bg-[#134092] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确认加入（{pickedIds.length}）
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
