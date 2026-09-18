import React, { useMemo, useRef, useState } from 'react';
import { Search, Plus, Users, UserPlus, Pencil, Trash2, X, Building2, Circle, GripVertical } from 'lucide-react';
import type { PersonnelItem } from './OrgManagement';
import { buildOrgIdPath, formatPersonOrgPaths, getOrgFullPath, type PersonnelGroup, type UserOrgSharedState } from '../data/userOrgShared';
import {
  getPersonAvatarUrl,
  maskPhone,
  PersonAvatar,
  PersonIdentityCell,
  PersonOrgPathCell,
  PersonRoleBadges,
  StatusSwitch
} from '../components/PersonAccountDisplay';

interface PersonnelGroupManagementProps {
  shared: UserOrgSharedState;
}

export const PersonnelGroupManagement: React.FC<PersonnelGroupManagementProps> = ({ shared }) => {
  const { orgNodes, personnelList, setPersonnelList, groups, setGroups } = shared;
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || '');
  const [groupSearch, setGroupSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [toast, setToast] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<PersonnelGroup | null>(null);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [inlineGroupName, setInlineGroupName] = useState('');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [orgFilter, setOrgFilter] = useState('all');
  const [pickedIds, setPickedIds] = useState<number[]>([]);
  const [revealedPhoneIds, setRevealedPhoneIds] = useState<number[]>([]);

  const [gName, setGName] = useState('');
  const [gDesc, setGDesc] = useState('');
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

  const openCreate = () => {
    if (createGroupByName(groupSearch)) {
      setGroupSearch('');
      return;
    }
    setIsAddingGroup(true);
    setInlineGroupName('');
  };

  const confirmInlineGroup = () => {
    if (createGroupByName(inlineGroupName) || !inlineGroupName.trim()) {
      setIsAddingGroup(false);
      setInlineGroupName('');
    }
  };

  const openEdit = (group: PersonnelGroup) => {
    setEditingGroup(group);
    setGName(group.name);
    setGDesc(group.description);
    setIsCreateOpen(true);
  };

  const handleSaveGroup = (event: React.FormEvent) => {
    event.preventDefault();
    if (!gName.trim()) return;

    if (editingGroup) {
      setGroups((prev) =>
        prev.map((group) =>
          group.id === editingGroup.id
            ? { ...group, name: gName.trim(), description: gDesc.trim() }
            : group
        )
      );
      triggerToast(`已保存分组【${gName.trim()}】`);
    }
    setIsCreateOpen(false);
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
    setIsAddMemberOpen(true);
  };

  const candidatePeople = activePeople.filter((item) => {
    if (!selectedGroup) return false;
    if ((item.groupIds || []).includes(selectedGroup.id)) return false;
    if (orgFilter !== 'all') {
      const belongsToOrg = item.orgIds.some(
        (id) => id === orgFilter || buildOrgIdPath(orgNodes, id).includes(orgFilter)
      );
      if (!belongsToOrg) return false;
    }
    return true;
  });

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

  const handleToggleMemberStatus = (id: number) => {
    setPersonnelList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: item.status === '启用' ? '禁用' : '启用' } : item
      )
    );
  };

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
            <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2 pointer-events-none" />
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
            <div className="flex items-center gap-1 px-1 py-1">
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
                    setIsAddingGroup(false);
                    setInlineGroupName('');
                  }
                }}
                placeholder="输入分组名称，回车保存"
                className="flex-1 min-w-0 px-2 py-1.5 text-xs border border-[#1E5ABB] rounded focus:outline-none"
              />
            </div>
          )}
          {filteredGroups.length === 0 && !isAddingGroup ? (
            <div className="py-8 text-center text-xs text-gray-400">暂无匹配分组</div>
          ) : (
            filteredGroups.map((group) => {
              const isActive = selectedGroup?.id === group.id;
              const isDragging = draggingGroupId === group.id;
              const canDropHere = Boolean(
                (draggingGroupIdRef.current || draggingGroupId) &&
                  (draggingGroupIdRef.current || draggingGroupId) !== group.id
              );
              const hintHere = dropHint?.id === group.id ? dropHint.position : null;
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
                    <GripVertical className="w-3.5 h-3.5" />
                  </button>
                  <span className="min-w-0 flex-1 truncate text-xs font-medium">{group.name}</span>
                  {isActive && (
                    <span className="flex items-center shrink-0">
                      <button
                        type="button"
                        title="编辑分组"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEdit(group);
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
                <p className="text-[11px] text-gray-400 mt-1">{selectedGroup.description}</p>
                <div className="text-[11px] text-gray-500 mt-2">共 {members.length} 名在册成员</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(selectedGroup)}
                  className="px-2.5 py-1 text-xs border border-gray-200 rounded text-gray-600 hover:border-blue-200 hover:text-[#1E5ABB] cursor-pointer flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" />
                  编辑
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

            <div className="px-5 py-3 flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-gray-800 whitespace-nowrap">分组成员花名册明细</span>
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                <input
                  value={memberSearch}
                  onChange={(event) => setMemberSearch(event.target.value)}
                  placeholder="搜索姓名 / 手机号"
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-5 pb-4">
              <table className="w-full table-fixed text-left border-collapse text-xs">
                <colgroup>
                  <col className="w-11" />
                  <col className="w-[26%]" />
                  <col className="w-[30%]" />
                  <col className="w-[20%]" />
                  <col className="w-[80px]" />
                  <col className="w-14" />
                </colgroup>
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 border-y border-gray-200 font-medium">
                    <th className="py-2 px-2 text-center">序号</th>
                    <th className="py-2 px-2">姓名 / 手机号</th>
                    <th className="py-2 px-2">
                      <span className="inline-flex items-center gap-1"><Building2 className="w-3 h-3 shrink-0" />所属机构</span>
                    </th>
                    <th className="py-2 px-2">
                      <span className="inline-flex items-center gap-1"><Circle className="w-3 h-3 shrink-0" />角色</span>
                    </th>
                    <th className="py-2 px-1.5">状态</th>
                    <th className="py-2 px-1.5 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-400">
                        当前分组暂无成员，点击右上角添加
                      </td>
                    </tr>
                  ) : (
                    members.map((item, index) => (
                      <tr key={item.id} className="hover:bg-blue-50/20">
                        <td className="py-2 px-2 text-center text-gray-400 font-mono">{index + 1}</td>
                        <td className="py-2 px-2 overflow-hidden">
                          <PersonIdentityCell
                            item={item}
                            revealed={revealedPhoneIds.includes(item.id)}
                            onToggleReveal={() =>
                              setRevealedPhoneIds((prev) =>
                                prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                              )
                            }
                          />
                        </td>
                        <td className="py-2 px-2 overflow-hidden">
                          <PersonOrgPathCell path={formatPersonOrgPaths(orgNodes, item.orgIds, undefined, item.primaryOrgId)} />
                        </td>
                        <td className="py-2 px-2 overflow-hidden">
                          <PersonRoleBadges roles={item.roles} />
                        </td>
                        <td className="py-2 px-1.5 overflow-hidden">
                          <StatusSwitch
                            enabled={item.status === '启用'}
                            onToggle={() => handleToggleMemberStatus(item.id)}
                          />
                        </td>
                        <td className="py-2 px-1.5 text-center overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(item)}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            移出
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">请先新建一个人员分组</div>
        )}
      </div>

      {isCreateOpen && editingGroup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveGroup}
            className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95"
          >
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-800">编辑人员分组</h3>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">分组名称 *</label>
                <input
                  value={gName}
                  onChange={(event) => setGName(event.target.value)}
                  placeholder="例如：突发舆情应急响应专班"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                />
              </div>
              <div>
                  <label className="block text-gray-700 font-medium mb-1">专班职责说明</label>
                <textarea
                  value={gDesc}
                  onChange={(event) => setGDesc(event.target.value)}
                  rows={3}
                  placeholder="请写入该分组在业务协同中的定位与处置职责"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] resize-none"
                />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-pointer text-xs"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#1E5ABB] text-white rounded font-bold hover:bg-[#134092] cursor-pointer text-xs"
              >
                确认保存
              </button>
            </div>
          </form>
        </div>
      )}

      {isAddMemberOpen && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[86vh] flex flex-col">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-800">选派人员加入【{selectedGroup.name}】</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">从在册账号中勾选后加入本组</p>
              </div>
              <button type="button" onClick={() => setIsAddMemberOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-3 flex items-center justify-between gap-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 whitespace-nowrap">机构筛选</span>
                <select
                  value={orgFilter}
                  onChange={(event) => setOrgFilter(event.target.value)}
                  className="border border-gray-200 rounded px-2 py-1 bg-white"
                >
                  <option value="all">全部所属机构</option>
                  {orgNodes.map((org) => (
                    <option key={org.id} value={org.id}>
                      {getOrgFullPath(orgNodes, org.id)}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-xs text-[#1E5ABB] font-bold">已选中：{pickedIds.length} 人</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {candidatePeople.length === 0 ? (
                <div className="py-10 text-center text-xs text-gray-400">没有可加入的在册账号</div>
              ) : (
                candidatePeople.map((person) => {
                  const checked = pickedIds.includes(person.id);
                  return (
                    <label
                      key={person.id}
                      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 cursor-pointer ${
                        checked ? 'border-blue-200 bg-blue-50/70' : 'border-gray-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setPickedIds((prev) =>
                              checked ? prev.filter((id) => id !== person.id) : [...prev, person.id]
                            )
                          }
                          className="rounded text-[#1E5ABB] focus:ring-[#1E5ABB] w-3.5 h-3.5"
                        />
                        <span className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-black/10">
                          <PersonAvatar name={person.realName} src={getPersonAvatarUrl(person)} size="sm" />
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-gray-800">{person.realName}</div>
                          <div className="font-mono text-[11px] text-gray-500">{maskPhone(person.phone)}</div>
                          <div className="text-[11px] text-gray-400 truncate">
                            {formatPersonOrgPaths(orgNodes, person.orgIds, undefined, person.primaryOrgId).replaceAll('/', ' / ')}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddMemberOpen(false)}
                className="px-4 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-pointer text-xs"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmAddMembers}
                disabled={pickedIds.length === 0}
                className="px-4 py-1.5 bg-[#1E5ABB] text-white rounded font-bold hover:bg-[#134092] cursor-pointer text-xs disabled:opacity-50"
              >
                确认加入（{pickedIds.length}）
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
