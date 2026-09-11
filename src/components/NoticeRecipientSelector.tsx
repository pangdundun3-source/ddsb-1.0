import React, { useState, useMemo } from 'react';
import { NoticePerson, NoticeGroup } from '../types';
import {
  Building2,
  Users,
  Check,
  X,
  Trash2,
  UserCheck,
  CheckSquare,
  Square,
  MinusSquare,
  Layers,
  List,
  Tag
} from 'lucide-react';
import {
  NOTICE_AVAILABLE_ORGS,
  NOTICE_GROUPS,
  NOTICE_PERSONNEL,
  getPersonnelByIds,
  getPersonnelByOrg,
  getPersonnelByGroup,
  getOrgsFromPersonnelIds,
  getGroupsFromPersonnelIds
} from '../data/noticeRecipients';

interface NoticeRecipientSelectorProps {
  targetOrgs: string[];
  targetPersonnelIds: string[];
  onChange: (targetOrgs: string[], targetPersonnelIds: string[]) => void;
  primaryPersonnelIds?: string[];
  onPrimaryChange?: (primaryIds: string[]) => void;
}

export const NoticeRecipientSelector: React.FC<NoticeRecipientSelectorProps> = ({
  targetOrgs,
  targetPersonnelIds,
  onChange,
  primaryPersonnelIds = [],
  onPrimaryChange
}) => {
  // Top Selector Tab: 'org' (按机构) | 'group' (按群组)
  const [filterMode, setFilterMode] = useState<'org' | 'group'>('org');
  const [filterKeyword, setFilterKeyword] = useState('');

  // Secondary operation states for Selected Personnel Module
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [selectedViewMode, setSelectedViewMode] = useState<'list' | 'byOrg' | 'byGroup'>('list');
  const [batchSelectedIds, setBatchSelectedIds] = useState<Set<string>>(new Set());

  // Memoized selected personnel list
  const selectedPersonnelList = useMemo(() => {
    return getPersonnelByIds(targetPersonnelIds);
  }, [targetPersonnelIds]);

  // Set of selected IDs for instant O(1) lookup
  const selectedIdSet = useMemo(() => {
    return new Set(targetPersonnelIds);
  }, [targetPersonnelIds]);

  // Set of primary personnel IDs
  const primaryIdSet = useMemo(() => {
    return new Set(primaryPersonnelIds);
  }, [primaryPersonnelIds]);

  // Involved groups count derived from selected personnel
  const involvedGroups = useMemo(() => {
    return getGroupsFromPersonnelIds(targetPersonnelIds);
  }, [targetPersonnelIds]);

  // Helper to update selection and synchronize targetOrgs automatically
  const updatePersonnelSelection = (newIds: string[]) => {
    const uniqueIds = Array.from(new Set(newIds));
    const newOrgs = getOrgsFromPersonnelIds(uniqueIds);
    onChange(newOrgs, uniqueIds);
    // Cleanup batch selection of removed IDs
    setBatchSelectedIds((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => {
        if (uniqueIds.includes(id)) next.add(id);
      });
      return next;
    });
    // Cleanup primary personnel
    if (onPrimaryChange) {
      onPrimaryChange(primaryPersonnelIds.filter((id) => uniqueIds.includes(id)));
    }
  };

  // Toggle entire organization (No individual personnel shown above, pure org selection)
  const handleToggleOrg = (orgName: string) => {
    const orgMembers = getPersonnelByOrg(orgName);
    const orgMemberIds = orgMembers.map((m) => m.id);
    const allSelected = orgMemberIds.length > 0 && orgMemberIds.every((id) => selectedIdSet.has(id));

    if (allSelected) {
      const next = targetPersonnelIds.filter((id) => !orgMemberIds.includes(id));
      updatePersonnelSelection(next);
    } else {
      const next = Array.from(new Set([...targetPersonnelIds, ...orgMemberIds]));
      updatePersonnelSelection(next);
    }
  };

  // Toggle entire group (No individual personnel shown above, pure group selection)
  const handleToggleGroup = (groupName: string) => {
    const groupMembers = getPersonnelByGroup(groupName);
    const groupMemberIds = groupMembers.map((m) => m.id);
    const allSelected = groupMemberIds.length > 0 && groupMemberIds.every((id) => selectedIdSet.has(id));

    if (allSelected) {
      const next = targetPersonnelIds.filter((id) => !groupMemberIds.includes(id));
      updatePersonnelSelection(next);
    } else {
      const next = Array.from(new Set([...targetPersonnelIds, ...groupMemberIds]));
      updatePersonnelSelection(next);
    }
  };

  // Quick shortcuts for top selection
  const handleSelectAll = () => {
    const allIds = NOTICE_PERSONNEL.map((p) => p.id);
    updatePersonnelSelection(allIds);
  };

  const handleSelectDistricts = () => {
    const districtOrgs = ['西屯区宣传部', '北屯区宣传部', '南屯区宣传部', '东湖区宣传处'];
    const districtMemberIds = NOTICE_PERSONNEL.filter((p) => districtOrgs.includes(p.org)).map((p) => p.id);
    updatePersonnelSelection(districtMemberIds);
  };

  const handleClearAll = () => {
    onChange([], []);
    setBatchSelectedIds(new Set());
    if (onPrimaryChange) onPrimaryChange([]);
  };

  // Filtered orgs for top search
  const filteredOrgs = useMemo(() => {
    if (!filterKeyword.trim()) return NOTICE_AVAILABLE_ORGS;
    const q = filterKeyword.toLowerCase();
    return NOTICE_AVAILABLE_ORGS.filter((org) => org.toLowerCase().includes(q));
  }, [filterKeyword]);

  // Filtered groups for top search
  const filteredGroups = useMemo(() => {
    if (!filterKeyword.trim()) return NOTICE_GROUPS;
    const q = filterKeyword.toLowerCase();
    return NOTICE_GROUPS.filter(
      (grp) =>
        grp.name.toLowerCase().includes(q) ||
        grp.description.toLowerCase().includes(q) ||
        grp.tag.toLowerCase().includes(q)
    );
  }, [filterKeyword]);

  // Filtered list inside Selected Personnel module (Secondary search)
  const filteredSelectedList = useMemo(() => {
    if (!selectedKeyword.trim()) return selectedPersonnelList;
    const q = selectedKeyword.toLowerCase();
    return selectedPersonnelList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.org.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.groups.some((g) => g.toLowerCase().includes(q))
    );
  }, [selectedPersonnelList, selectedKeyword]);

  // Grouped by organization for the Selected module
  const selectedByOrgMap = useMemo(() => {
    const map: Record<string, NoticePerson[]> = {};
    filteredSelectedList.forEach((person) => {
      if (!map[person.org]) map[person.org] = [];
      map[person.org].push(person);
    });
    return map;
  }, [filteredSelectedList]);

  // Grouped by group for the Selected module
  const selectedByGroupMap = useMemo(() => {
    const map: Record<string, NoticePerson[]> = {};
    filteredSelectedList.forEach((person) => {
      if (person.groups && person.groups.length > 0) {
        person.groups.forEach((grp) => {
          if (!map[grp]) map[grp] = [];
          map[grp].push(person);
        });
      } else {
        if (!map['其他人员']) map['其他人员'] = [];
        map['其他人员'].push(person);
      }
    });
    return map;
  }, [filteredSelectedList]);

  // Secondary operation: Remove single person
  const handleRemoveSinglePerson = (personId: string) => {
    const next = targetPersonnelIds.filter((id) => id !== personId);
    updatePersonnelSelection(next);
  };

  // Secondary operation: Remove all members of an organization
  const handleRemoveOrgMembers = (orgName: string) => {
    const orgMembers = getPersonnelByOrg(orgName);
    const orgMemberIds = new Set(orgMembers.map((m) => m.id));
    const next = targetPersonnelIds.filter((id) => !orgMemberIds.has(id));
    updatePersonnelSelection(next);
  };

  // Secondary operation: Remove all members of a group
  const handleRemoveGroupMembers = (groupName: string) => {
    const groupMembers = getPersonnelByGroup(groupName);
    const groupMemberIds = new Set(groupMembers.map((m) => m.id));
    const next = targetPersonnelIds.filter((id) => !groupMemberIds.has(id));
    updatePersonnelSelection(next);
  };

  // Secondary Batch Operations
  const handleToggleBatchItem = (id: string) => {
    setBatchSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAllFiltered = () => {
    const allFilteredIds = filteredSelectedList.map((p) => p.id);
    const areAllSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => batchSelectedIds.has(id));

    setBatchSelectedIds((prev) => {
      const next = new Set(prev);
      if (areAllSelected) {
        allFilteredIds.forEach((id) => next.delete(id));
      } else {
        allFilteredIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleBatchRemove = () => {
    if (batchSelectedIds.size === 0) return;
    const next = targetPersonnelIds.filter((id) => !batchSelectedIds.has(id));
    updatePersonnelSelection(next);
    setBatchSelectedIds(new Set());
  };

  const isAllFilteredBatchSelected =
    filteredSelectedList.length > 0 && filteredSelectedList.every((p) => batchSelectedIds.has(p.id));

  return (
    <div className="space-y-5">
      {/* ========================================================================= */}
      {/* MODULE 1: 机构与群组筛选列表 (只展示机构和群组列表，不展开显示具体人员)  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
        {/* Module 1 Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-[#1E5ABB]" />
            <h3 className="text-xs font-bold text-slate-800">接收条件筛选（机构 / 群组）</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            勾选即联动下方人员
          </span>
        </div>

        {/* Tab Switcher: 按机构选 vs 按群组选 */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilterMode('org')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              filterMode === 'org'
                ? 'bg-white text-[#1E5ABB] shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>按机构筛选 ({NOTICE_AVAILABLE_ORGS.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('group')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              filterMode === 'group'
                ? 'bg-white text-[#1E5ABB] shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>按群组筛选 ({NOTICE_GROUPS.length})</span>
          </button>
        </div>

        {/* Quick Shortcuts */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5 pt-0.5">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[#1E5ABB] hover:underline cursor-pointer font-bold"
            >
              全选所有条件
            </button>
            <span className="text-slate-200">|</span>
            <button
              type="button"
              onClick={handleSelectDistricts}
              className="text-[#1E5ABB] hover:underline cursor-pointer"
            >
              仅区县网信
            </button>
          </div>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
          >
            清空已选条件
          </button>
        </div>

        {/* Clean Condition List (Pure Org / Group cards, NO nested personnel trees) */}
        <div className="max-h-[260px] overflow-y-auto space-y-1.5 pr-1 border-t border-slate-100 pt-2">
          {/* ================= MODE A: ORGANIZATIONS LIST ================= */}
          {filterMode === 'org' && (
            <>
              {filteredOrgs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">无匹配的机构单位</div>
              ) : (
                filteredOrgs.map((orgName) => {
                  const members = getPersonnelByOrg(orgName);
                  const memberIds = members.map((m) => m.id);
                  const selectedCount = memberIds.filter((id) => selectedIdSet.has(id)).length;
                  const isAllSelected = memberIds.length > 0 && selectedCount === memberIds.length;
                  const isPartial = selectedCount > 0 && selectedCount < memberIds.length;

                  return (
                    <div
                      key={orgName}
                      onClick={() => handleToggleOrg(orgName)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                        isAllSelected
                          ? 'bg-blue-50/60 border-blue-200/90 shadow-2xs'
                          : isPartial
                          ? 'bg-blue-50/20 border-blue-200/50'
                          : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                        <button
                          type="button"
                          className="text-[#1E5ABB] cursor-pointer shrink-0 focus:outline-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleOrg(orgName);
                          }}
                        >
                          {isAllSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#1E5ABB]" />
                          ) : isPartial ? (
                            <MinusSquare className="w-4 h-4 text-[#1E5ABB]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                          )}
                        </button>
                        <span
                          className={`text-xs truncate ${
                            isAllSelected
                              ? 'font-bold text-slate-900'
                              : isPartial
                              ? 'font-semibold text-slate-800'
                              : 'text-slate-700'
                          }`}
                        >
                          {orgName}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 ml-2">
                        <span
                          className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                            isAllSelected
                              ? 'bg-[#1E5ABB] text-white font-bold'
                              : isPartial
                              ? 'bg-blue-100 text-[#1E5ABB] font-bold'
                              : 'bg-slate-200/70 text-slate-500'
                          }`}
                        >
                          {selectedCount > 0 ? `${selectedCount}/${members.length}人` : `${members.length}人`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* ================= MODE B: GROUPS LIST ================= */}
          {filterMode === 'group' && (
            <>
              {filteredGroups.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">无匹配的工作专班/群组</div>
              ) : (
                filteredGroups.map((group) => {
                  const members = getPersonnelByGroup(group.name);
                  const memberIds = members.map((m) => m.id);
                  const selectedCount = memberIds.filter((id) => selectedIdSet.has(id)).length;
                  const isAllSelected = memberIds.length > 0 && selectedCount === memberIds.length;
                  const isPartial = selectedCount > 0 && selectedCount < memberIds.length;

                  return (
                    <div
                      key={group.id}
                      onClick={() => handleToggleGroup(group.name)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                        isAllSelected
                          ? 'bg-indigo-50/60 border-indigo-200/90 shadow-2xs'
                          : isPartial
                          ? 'bg-indigo-50/20 border-indigo-200/50'
                          : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                        <button
                          type="button"
                          className="text-indigo-600 cursor-pointer shrink-0 focus:outline-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleGroup(group.name);
                          }}
                        >
                          {isAllSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : isPartial ? (
                            <MinusSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                          )}
                        </button>
                        <div className="truncate min-w-0">
                          <div className="flex items-center space-x-1.5 truncate">
                            <span
                              className={`text-xs truncate ${
                                isAllSelected
                                  ? 'font-bold text-slate-900'
                                  : isPartial
                                  ? 'font-semibold text-slate-800'
                                  : 'text-slate-700'
                              }`}
                            >
                              {group.name}
                            </span>
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-medium shrink-0">
                              {group.tag}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{group.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 ml-2">
                        <span
                          className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                            isAllSelected
                              ? 'bg-indigo-600 text-white font-bold'
                              : isPartial
                              ? 'bg-indigo-100 text-indigo-700 font-bold'
                              : 'bg-slate-200/70 text-slate-500'
                          }`}
                        >
                          {selectedCount > 0 ? `${selectedCount}/${members.length}人` : `${members.length}人`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODULE 2: 下方展示具体条件选中的人员情况 (含二次操作)                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
        {/* Module 2 Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800">
              已选中具体人员情况（{targetPersonnelIds.length}人）
            </h3>
          </div>

          {/* View Mode Toggle: List vs Grouped by Org vs Grouped by Group */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setSelectedViewMode('list')}
              className={`px-2 py-0.5 rounded flex items-center space-x-1 cursor-pointer transition-all ${
                selectedViewMode === 'list'
                  ? 'bg-white text-slate-800 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="人员清单明细"
            >
              <List className="w-3 h-3" />
              <span className="text-[11px]">明细</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedViewMode('byOrg')}
              className={`px-2 py-0.5 rounded flex items-center space-x-1 cursor-pointer transition-all ${
                selectedViewMode === 'byOrg'
                  ? 'bg-white text-slate-800 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="按所属机构归集展示"
            >
              <Building2 className="w-3 h-3" />
              <span className="text-[11px]">按机构</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedViewMode('byGroup')}
              className={`px-2 py-0.5 rounded flex items-center space-x-1 cursor-pointer transition-all ${
                selectedViewMode === 'byGroup'
                  ? 'bg-white text-slate-800 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="按关联专班群组归集展示"
            >
              <Users className="w-3 h-3" />
              <span className="text-[11px]">按专班</span>
            </button>
          </div>
        </div>

        {/* Secondary Batch Actions Bar */}
        {targetPersonnelIds.length > 0 && (
            <div className="flex items-center justify-between bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-200/70 text-xs flex-wrap gap-1.5">
              <div className="flex items-center space-x-2">
                {/* Batch select checkbox */}
                <button
                  type="button"
                  onClick={handleToggleSelectAllFiltered}
                  className="flex items-center space-x-1 text-slate-700 hover:text-slate-900 cursor-pointer select-none text-[11px]"
                >
                  {isAllFilteredBatchSelected ? (
                    <CheckSquare className="w-3.5 h-3.5 text-[#1E5ABB]" />
                  ) : batchSelectedIds.size > 0 ? (
                    <MinusSquare className="w-3.5 h-3.5 text-[#1E5ABB]" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>勾选本表 ({batchSelectedIds.size}/{filteredSelectedList.length})</span>
                </button>

                {/* Batch remove button */}
                {batchSelectedIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleBatchRemove}
                    className="flex items-center space-x-1 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-md font-bold text-[11px] cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>移出已选 ({batchSelectedIds.size})</span>
                  </button>
                )}
              </div>

              {/* Utility actions: Clear all */}
              <div className="flex items-center space-x-2 ml-auto">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-rose-500 hover:text-rose-700 text-[11px] flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>清空全部</span>
                </button>
              </div>
            </div>
          )}

        {/* Selected Personnel Detailed Situation Display */}
        <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
          {targetPersonnelIds.length === 0 ? (
            <div className="py-10 text-center text-slate-400 space-y-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <Users className="w-7 h-7 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-600">暂无选中的接收人员</p>
              <p className="text-[11px] text-slate-400">
                请在上方勾选相应机构或群组，系统将自动联动解析并在此展示具体的送达人员情况。
              </p>
            </div>
          ) : filteredSelectedList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              未找到匹配的已选人员，可尝试更换搜索关键词
            </div>
          ) : selectedViewMode === 'list' ? (
            /* ================= VIEW 1: FLAT LIST OF PERSONS ================= */
            <div className="space-y-1.5">
              {filteredSelectedList.map((person) => {
                const isBatchChecked = batchSelectedIds.has(person.id);

                return (
                  <div
                    key={person.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isBatchChecked
                        ? 'bg-blue-50/60 border-blue-200'
                        : 'bg-slate-50/70 hover:bg-white border-slate-200/70 hover:shadow-2xs'
                    }`}
                  >
                    {/* Checkbox, Avatar, Personal info */}
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleBatchItem(person.id)}
                        className="cursor-pointer text-slate-400 hover:text-[#1E5ABB] shrink-0"
                      >
                        {isBatchChecked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-[#1E5ABB]" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </button>

                      <div className="w-7 h-7 rounded-full bg-blue-100 text-[#1E5ABB] font-bold text-xs flex items-center justify-center shrink-0">
                        {person.name.slice(0, 1)}
                      </div>

                      <div className="truncate min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5 truncate">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {person.name}
                          </span>
                          <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200 shrink-0">
                            {person.role}
                          </span>
                        </div>

                        {/* Org & Phone linkage labels */}
                        <div className="text-[10px] text-slate-500 truncate flex items-center space-x-1.5 mt-0.5">
                          <span className="truncate text-slate-600 font-medium">{person.org}</span>
                          <span className="text-slate-300">·</span>
                          <span className="font-mono text-slate-400 shrink-0">{person.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Secondary Actions: Remove Single (X) */}
                    <div className="flex items-center space-x-1 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveSinglePerson(person.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="从已选名单移除此人"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : selectedViewMode === 'byOrg' ? (
            /* ================= VIEW 2: GROUPED BY ORGANIZATION ================= */
            <div className="space-y-2.5">
              {(Object.entries(selectedByOrgMap) as [string, NoticePerson[]][]).map(
                ([orgName, persons]) => (
                  <div
                    key={orgName}
                    className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-200/60 pb-1.5">
                      <div className="flex items-center space-x-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-[#1E5ABB]" />
                        <span className="truncate">{orgName}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          （选出 {persons.length} 人）
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveOrgMembers(orgName)}
                        className="text-[10px] text-rose-500 hover:text-rose-700 hover:underline cursor-pointer shrink-0"
                      >
                        移出此单位人员
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {persons.map((p) => {
                        return (
                          <div
                            key={p.id}
                            className="bg-white border border-slate-200/80 rounded-xl p-2 text-xs flex items-center justify-between shadow-2xs"
                          >
                            <div className="truncate min-w-0 pr-1">
                              <div className="flex items-center space-x-1 truncate">
                                <span className="font-bold text-slate-800">{p.name}</span>
                                <span className="text-[10px] text-slate-400 font-normal">({p.role})</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate">{p.phone}</div>
                            </div>

                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleRemoveSinglePerson(p.id)}
                                className="text-slate-300 hover:text-rose-600 p-0.5 cursor-pointer"
                                title="移出此人"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            /* ================= VIEW 3: GROUPED BY SPECIAL WORK GROUP ================= */
            <div className="space-y-2.5">
              {(Object.entries(selectedByGroupMap) as [string, NoticePerson[]][]).map(
                ([groupName, persons]) => (
                  <div
                    key={groupName}
                    className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-200/60 pb-1.5">
                      <div className="flex items-center space-x-1.5 truncate">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="truncate">{groupName}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          （选出 {persons.length} 人）
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveGroupMembers(groupName)}
                        className="text-[10px] text-rose-500 hover:text-rose-700 hover:underline cursor-pointer shrink-0"
                      >
                        移出此专班人员
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {persons.map((p) => {
                        return (
                          <div
                            key={p.id}
                            className="bg-white border border-slate-200/80 rounded-xl p-2 text-xs flex items-center justify-between shadow-2xs"
                          >
                            <div className="truncate min-w-0 pr-1">
                              <div className="flex items-center space-x-1 truncate">
                                <span className="font-bold text-slate-800">{p.name}</span>
                                <span className="text-[10px] text-slate-400 font-normal">({p.role})</span>
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">{p.org}</div>
                            </div>

                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleRemoveSinglePerson(p.id)}
                                className="text-slate-300 hover:text-rose-600 p-0.5 cursor-pointer"
                                title="移出此人"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Selected List Summary Footer */}
        {targetPersonnelIds.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              已选定责任人共 <strong className="text-[#1E5ABB] font-bold">{targetPersonnelIds.length}</strong> 名
            </span>
            <span className="text-slate-400">将按人员所属单位与专班下发通知</span>
          </div>
        )}
      </div>
    </div>
  );
};
