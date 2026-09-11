import React, { useState, useMemo } from 'react';
import { NoticeItem, NoticePerson } from '../types';
import {
  Building2,
  Users,
  List,
  CheckCircle2,
  Check,
  Clock,
  X,
  FileCheck,
  AlertCircle,
  Maximize2,
  Minimize2,
  ShieldCheck,
  UserCheck,
  Phone,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  NOTICE_PERSONNEL,
  NOTICE_GROUPS,
  getPersonnelByIds,
  getDefaultPersonnelForOrgs,
  getPersonnelByOrg,
  getPersonnelByGroup
} from '../data/noticeRecipients';

interface NoticeReadStatusTrackerProps {
  notice: NoticeItem;
  currentUser: string;
  currentOrg: string;
  onConfirmRead: (notice: NoticeItem) => void;
  showToast: (msg: string) => void;
}

export interface ResolvedRecipientPerson extends NoticePerson {
  isRead: boolean;
  readTime?: string;
  isConfirmed: boolean;
  confirmedTime?: string;
  reminded?: boolean;
}

export const NoticeReadStatusTracker: React.FC<NoticeReadStatusTrackerProps> = ({
  notice,
  currentUser,
  currentOrg,
  onConfirmRead,
  showToast
}) => {
  // Bottom Module Personnel View Mode: 'list' (明细清单) | 'byOrg' (按机构) | 'byGroup' (按专班)
  const [viewMode, setViewMode] = useState<'list' | 'byOrg' | 'byGroup'>('list');
  // Filter tab: 'read' | 'unread' | 'all'
  const [filterTab, setFilterTab] = useState<'all' | 'read' | 'unread'>('read');
  // Expanded fullscreen modal state
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Collapsible org/group sections in grouped view
  const [collapsedKeys, setCollapsedKeys] = useState<Set<string>>(new Set());

  // 1. Resolve full recipient personnel roster with coherent read/sign statuses
  const allRecipients = useMemo<ResolvedRecipientPerson[]>(() => {
    // 1.1 Obtain base personnel roster for this notice
    let baseList: NoticePerson[] = [];
    if (notice.targetPersonnelIds && notice.targetPersonnelIds.length > 0) {
      baseList = getPersonnelByIds(notice.targetPersonnelIds);
    }
    if (baseList.length === 0 && notice.targetOrgs && notice.targetOrgs.length > 0) {
      const defaultIds = getDefaultPersonnelForOrgs(notice.targetOrgs);
      baseList = getPersonnelByIds(defaultIds);
      if (baseList.length === 0) {
        baseList = NOTICE_PERSONNEL.filter((p) => notice.targetOrgs.includes(p.org));
      }
    }
    if (baseList.length === 0) {
      baseList = NOTICE_PERSONNEL.slice(0, 16);
    }

    const readers = notice.readers || [];
    const totalTarget = notice.totalTargetCount || baseList.length;
    const targetReadCount = notice.readCount !== undefined ? notice.readCount : readers.length;
    const targetConfirmCount = notice.confirmCount !== undefined ? notice.confirmCount : 0;

    // Calculate how many items from baseList should be marked read
    const isDraft = notice.status === '草稿';
    const readRatio = isDraft || totalTarget === 0 ? 0 : targetReadCount / totalTarget;
    const countToMarkRead = isDraft
      ? 0
      : Math.min(baseList.length, Math.max(readers.length, Math.round(baseList.length * readRatio)));

    const confirmRatio = isDraft || totalTarget === 0 ? 0 : targetConfirmCount / totalTarget;
    const countToMarkConfirmed = notice.requireConfirm && !isDraft
      ? Math.min(countToMarkRead, Math.round(baseList.length * confirmRatio))
      : 0;

    return baseList.map((person, index) => {
      // Check if explicit reader record exists
      const explicitReader = readers.find(
        (r) => r.name === person.name || (r.name.includes(person.name) && r.org === person.org)
      );

      let isRead = false;
      let readTime: string | undefined = undefined;
      let isConfirmed = false;
      let confirmedTime: string | undefined = undefined;

      if (explicitReader) {
        isRead = true;
        readTime = explicitReader.readTime;
        isConfirmed = !!explicitReader.confirmed;
        confirmedTime = explicitReader.confirmed ? explicitReader.readTime : undefined;
      } else if (!isDraft && index < countToMarkRead) {
        // Deterministic simulated read status
        isRead = true;
        const baseDate = notice.publishTime || '2026-09-04 09:30';
        const minuteOffset = ((index * 7 + 4) % 180) + 5;
        const [datePart, timePart] = baseDate.split(' ');
        const [hourStr, minStr] = (timePart || '09:30').split(':');
        let totalMinutes = parseInt(hourStr || '9', 10) * 60 + parseInt(minStr || '30', 10) + minuteOffset;
        const readHour = String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0');
        const readMin = String(totalMinutes % 60).padStart(2, '0');
        readTime = `${datePart} ${readHour}:${readMin}`;

        if (notice.requireConfirm && index < countToMarkConfirmed) {
          isConfirmed = true;
          confirmedTime = readTime;
        }
      }

      return {
        ...person,
        isRead,
        readTime,
        isConfirmed,
        confirmedTime
      };
    });
  }, [notice]);

  // Overall read rate & metrics
  const stats = useMemo(() => {
    const total = allRecipients.length;
    const read = allRecipients.filter((r) => r.isRead).length;
    const unread = total - read;
    const readRate = total > 0 ? Math.round((read / total) * 100) : 0;
    const confirmed = allRecipients.filter((r) => r.isConfirmed).length;
    const unconfirmed = total - confirmed;
    const confirmRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;
    return { total, read, unread, readRate, confirmed, unconfirmed, confirmRate };
  }, [allRecipients]);

  // Filtered roster based on tab
  const filteredRecipients = useMemo(() => {
    let list = allRecipients;

    // Status Tab Filter
    if (filterTab === 'read') {
      list = list.filter((p) => p.isRead);
    } else if (filterTab === 'unread') {
      list = list.filter((p) => !p.isRead);
    }

    return list;
  }, [allRecipients, filterTab]);

  // Grouped by organization map
  const groupedByOrg = useMemo(() => {
    const map: Record<string, ResolvedRecipientPerson[]> = {};
    filteredRecipients.forEach((p) => {
      if (!map[p.org]) map[p.org] = [];
      map[p.org].push(p);
    });
    return map;
  }, [filteredRecipients]);

  // Grouped by special working group map
  const groupedBySpecialGroup = useMemo(() => {
    const map: Record<string, { groupTag?: string; members: ResolvedRecipientPerson[] }> = {};
    NOTICE_GROUPS.forEach((g) => {
      map[g.name] = { groupTag: g.tag, members: [] };
    });
    map['通用联络员组'] = { groupTag: '常规接收', members: [] };

    filteredRecipients.forEach((p) => {
      if (p.groups && p.groups.length > 0) {
        p.groups.forEach((gName) => {
          if (!map[gName]) map[gName] = { groupTag: '工作专班', members: [] };
          map[gName].members.push(p);
        });
      } else {
        map['通用联络员组'].members.push(p);
      }
    });

    // Clean up empty groups
    const result: Record<string, { groupTag?: string; members: ResolvedRecipientPerson[] }> = {};
    Object.entries(map).forEach(([key, val]) => {
      if (val.members.length > 0) result[key] = val;
    });
    return result;
  }, [filteredRecipients]);

  // Toggle collapse for org/group
  const toggleCollapse = (key: string) => {
    setCollapsedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // RENDER CONTENT BODY (Used both in sidebar card and expanded fullscreen dialog)
  const renderTrackerContent = (isModal = false) => {
    return (
      <div className="space-y-4">
        {/* ========================================================================= */}
        {/* MODULE 1: 进度与统计指标卡片 (仅保留核心进度卡片，去除外层冗余嵌套)       */}
        {/* ========================================================================= */}
        <div className="space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="text-slate-600">
                总送达：<strong className="text-slate-900 font-bold">{stats.total}</strong> 人
              </span>
              <span className="text-emerald-700">
                已阅：<strong className="font-bold">{stats.read}</strong> 人
              </span>
              <span className="text-amber-700">
                待查阅：<strong className="font-bold">{stats.unread}</strong> 人
              </span>
            </div>
            <div className="text-[11px] font-mono font-bold text-slate-600">
              {stats.read}/{stats.total}
            </div>
          </div>

          <div className="w-full h-2.5 bg-slate-200/60 rounded-full overflow-hidden p-0.5 flex border border-slate-200/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                stats.readRate >= 80
                  ? 'bg-emerald-500'
                  : stats.readRate >= 50
                  ? 'bg-[#1E5ABB]'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${stats.readRate}%` }}
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODULE 2: 受送达责任人员查阅明细                                          */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          {/* Module 2 Header & View Mode Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black text-slate-900">
                受送达责任人员查阅明细 ({filteredRecipients.length}人)
              </h3>
            </div>

            {/* Three View Modes: List vs byOrg vs byGroup (Identical to NoticeRecipientSelector) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-2 py-0.5 rounded flex items-center space-x-1 cursor-pointer transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="人员清单明细视图"
              >
                <List className="w-3 h-3" />
                <span className="text-[11px]">明细</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('byOrg')}
                className={`px-2 py-0.5 rounded flex items-center space-x-1 cursor-pointer transition-all ${
                  viewMode === 'byOrg'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="按所属机构归集展示"
              >
                <Building2 className="w-3 h-3" />
                <span className="text-[11px]">按机构</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('byGroup')}
                className={`px-2 py-0.5 rounded flex items-center space-x-1 cursor-pointer transition-all ${
                  viewMode === 'byGroup'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="按关联群组归集展示"
              >
                <Users className="w-3 h-3" />
                <span className="text-[11px]">按群组</span>
              </button>
            </div>
          </div>

          {/* Status Chips Filter & Export Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            {/* Filter Status Chips */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 text-xs no-scrollbar">
              <button
                type="button"
                onClick={() => setFilterTab((prev) => (prev === 'read' ? 'all' : 'read'))}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-colors cursor-pointer flex items-center space-x-1 ${
                  filterTab === 'read'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
                }`}
              >
                <Check className="w-2.5 h-2.5" />
                <span>已读 ({stats.read})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterTab((prev) => (prev === 'unread' ? 'all' : 'unread'))}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-colors cursor-pointer flex items-center space-x-1 ${
                  filterTab === 'unread'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Clock className="w-2.5 h-2.5" />
                <span>待查阅 ({stats.unread})</span>
              </button>
            </div>
          </div>

          {/* Personnel Cards Body */}
          <div className={`${isModal ? 'max-h-[560px]' : 'max-h-[380px]'} overflow-y-auto space-y-2 pr-1`}>
            {filteredRecipients.length === 0 ? (
              <div className="py-10 text-center text-slate-400 space-y-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <Users className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="text-xs font-medium text-slate-600">未检索到匹配的受送达责任人</p>
                <p className="text-[11px] text-slate-400">可尝试调整搜索关键字或重置上方筛选标签</p>
              </div>
            ) : viewMode === 'list' ? (
              /* ===================================================================== */
              /* VIEW MODE 1: 明细清单 (FLAT ROSTER LISTING - Same as Selector)         */
              /* ===================================================================== */
              <div className="space-y-1.5">
                {filteredRecipients.map((person) => {
                  const isUserCurrent = person.name === currentUser;

                  return (
                    <div
                      key={person.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        person.isRead
                          ? 'bg-slate-50/60 hover:bg-white border-slate-200/80 hover:shadow-2xs'
                          : 'bg-amber-50/30 hover:bg-amber-50/60 border-amber-200/80 shadow-2xs'
                      }`}
                    >
                      {/* Left: Avatar, Name, Role, Org, Phone */}
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <div
                          className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs ${
                            person.isRead
                              ? 'bg-blue-100 text-[#1E5ABB]'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {person.name.slice(0, 1)}
                        </div>

                        <div className="truncate min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5 truncate">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {person.name}
                            </span>
                            {isUserCurrent && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-1 py-0.2 rounded font-bold shrink-0">
                                我
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200 shrink-0">
                              {person.role}
                            </span>
                          </div>

                          {/* Org & Phone Linkage */}
                          <div className="text-[10px] text-slate-500 truncate flex items-center space-x-1.5 mt-0.5">
                            <span className="truncate text-slate-600 font-medium">{person.org}</span>
                            <span className="text-slate-300">·</span>
                            <span className="font-mono text-slate-400 shrink-0">{person.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Read Status Badge & Action */}
                      <div className="flex items-center space-x-2 shrink-0 ml-2">
                        {person.isRead ? (
                          <div className="flex flex-col items-end">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-md border border-emerald-200 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>已读</span>
                            </span>
                            {person.readTime && (
                              <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                                {person.readTime.split(' ')[1] || person.readTime}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5">
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-md border border-amber-200 flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-amber-500" />
                              <span>待查阅</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : viewMode === 'byOrg' ? (
              /* ===================================================================== */
              /* VIEW MODE 2: 按所属机构归集展示 (GROUPED BY ORGANIZATION)              */
              /* ===================================================================== */
              <div className="space-y-2.5">
                {(Object.entries(groupedByOrg) as [string, ResolvedRecipientPerson[]][]).map(([orgName, members]) => {
                  const orgReadCount = members.filter((m) => m.isRead).length;
                  const orgUnreadCount = members.length - orgReadCount;
                  const orgRate = members.length > 0 ? Math.round((orgReadCount / members.length) * 100) : 0;
                  const isCollapsed = collapsedKeys.has(`org-${orgName}`);

                  return (
                    <div
                      key={orgName}
                      className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2"
                    >
                      {/* Org Header Bar */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-1.5">
                        <button
                          type="button"
                          onClick={() => toggleCollapse(`org-${orgName}`)}
                          className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 text-left cursor-pointer truncate min-w-0"
                        >
                          <Building2 className="w-3.5 h-3.5 text-[#1E5ABB] shrink-0" />
                          <span className="truncate">{orgName}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold shrink-0 ${
                              orgUnreadCount === 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            已阅 {orgReadCount}/{members.length} ({orgRate}%)
                          </span>
                          {isCollapsed ? (
                            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronUp className="w-3 h-3 text-slate-400 shrink-0" />
                          )}
                        </button>
                      </div>

                      {/* Member Sub-grid (Same clean card design) */}
                      {!isCollapsed && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                          {members.map((m) => (
                            <div
                              key={m.id}
                              className={`border rounded-xl p-2 text-xs flex items-center justify-between shadow-2xs ${
                                m.isRead
                                  ? 'bg-white border-slate-200/80'
                                  : 'bg-amber-50/40 border-amber-200'
                              }`}
                            >
                              <div className="truncate min-w-0 pr-1">
                                <div className="flex items-center space-x-1 truncate">
                                  <span className="font-bold text-slate-900">{m.name}</span>
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    ({m.role})
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono truncate">{m.phone}</div>
                              </div>

                              <div className="shrink-0 flex items-center space-x-1">
                                {m.isRead ? (
                                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded flex items-center space-x-0.5 border border-emerald-200">
                                    <Check className="w-2.5 h-2.5" />
                                    <span>已阅</span>
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded flex items-center space-x-0.5 border border-amber-200">
                                    <Clock className="w-2.5 h-2.5 text-amber-500" />
                                    <span>待查阅</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ===================================================================== */
              /* VIEW MODE 3: 按关联专班归集展示 (GROUPED BY SPECIAL WORKING GROUP)     */
              /* ===================================================================== */
              <div className="space-y-2.5">
                {(Object.entries(groupedBySpecialGroup) as [string, { groupTag?: string; members: ResolvedRecipientPerson[] }][]).map(([groupName, groupData]) => {
                  const members = groupData.members;
                  const readCount = members.filter((m) => m.isRead).length;
                  const unreadCount = members.length - readCount;
                  const rate = members.length > 0 ? Math.round((readCount / members.length) * 100) : 0;
                  const isCollapsed = collapsedKeys.has(`grp-${groupName}`);

                  return (
                    <div
                      key={groupName}
                      className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2"
                    >
                      {/* Group Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-1.5">
                        <button
                          type="button"
                          onClick={() => toggleCollapse(`grp-${groupName}`)}
                          className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 text-left cursor-pointer truncate min-w-0"
                        >
                          <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate">{groupName}</span>
                          {groupData.groupTag && (
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-normal shrink-0 border border-indigo-200/60">
                              {groupData.groupTag}
                            </span>
                          )}
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold shrink-0 ${
                              unreadCount === 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            已阅 {readCount}/{members.length} ({rate}%)
                          </span>
                          {isCollapsed ? (
                            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronUp className="w-3 h-3 text-slate-400 shrink-0" />
                          )}
                        </button>
                      </div>

                      {/* Group Members Grid */}
                      {!isCollapsed && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                          {members.map((m) => (
                            <div
                              key={m.id}
                              className={`border rounded-xl p-2 text-xs flex items-center justify-between shadow-2xs ${
                                m.isRead
                                  ? 'bg-white border-slate-200/80'
                                  : 'bg-amber-50/40 border-amber-200'
                              }`}
                            >
                              <div className="truncate min-w-0 pr-1">
                                <div className="flex items-center space-x-1 truncate">
                                  <span className="font-bold text-slate-900">{m.name}</span>
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    ({m.role})
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">{m.org}</div>
                              </div>

                              <div className="shrink-0 flex items-center space-x-1">
                                {m.isRead ? (
                                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded flex items-center space-x-0.5 border border-emerald-200">
                                    <Check className="w-2.5 h-2.5" />
                                    <span>已阅</span>
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded flex items-center space-x-0.5 border border-amber-200">
                                    <Clock className="w-2.5 h-2.5 text-amber-500" />
                                    <span>待查阅</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Audit Summary */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>电子送达监督认证 · 责任落实至人</span>
            <span>查阅进度联动更新</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Default Sidebar Container in Detail View (Matching NoticeRecipientSelector aesthetic) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Module Master Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-[#1E5ABB]" />
            <h3 className="text-xs font-bold text-slate-900">受送达人员与查阅状态跟踪</h3>
          </div>
        </div>

        {renderTrackerContent(false)}
      </div>

      {/* Fullscreen Panoramic Modal (When user clicks Maximize button) */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#1E5ABB] text-white flex items-center justify-center shadow-xs">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    公文受送达人员查阅与签收全景明细看板
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    公文编号：{notice.id} · 标题：{notice.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto">
              {renderTrackerContent(true)}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>共覆盖 {stats.total} 名具体责任人员，当前查阅达成率 {stats.readRate}%</span>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="px-4 py-1.5 bg-[#1E5ABB] hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
              >
                完成浏览
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
