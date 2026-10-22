import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  KeyRound,
  Layers,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import type { OrgNode, PersonnelItem } from './OrgManagement';
import {
  buildOrgIdPath,
  getDeepestOrgId,
  getOrgById,
  getOrgChildrenOf,
  getOrgFullPath,
  type UserOrgSharedState
} from '../data/userOrgShared';
import { maskPhone } from '../components/PersonAccountDisplay';

interface ExternalOrgManagementProps {
  shared: UserOrgSharedState;
}

const DEFAULT_ORG_TYPE = '外部协作联络站';

interface OrgForm {
  name: string;
  parentId: string;
  leaderPersonId?: number;
  leaderName: string;
  leaderPhone: string;
  orgType: string;
  duty: string;
}

const emptyOrgForm = (parentId = ''): OrgForm => ({
  name: '',
  parentId,
  leaderName: '',
  leaderPhone: '',
  orgType: DEFAULT_ORG_TYPE,
  duty: ''
});

const todayLabel = () => new Date().toLocaleDateString('sv-SE');

const generateOrgCode = (existing: Set<string>) => {
  let code = '';
  do {
    code = `WZ-GA-${Math.floor(1000 + Math.random() * 9000)}`;
  } while (existing.has(code));
  return code;
};

const personOrgId = (orgNodes: OrgNode[], person: PersonnelItem) =>
  getDeepestOrgId(orgNodes, person.orgIds, person.primaryOrgId);

const accountState = (person: PersonnelItem) => {
  if (person.locked) return { label: '锁定', className: 'bg-rose-50 text-rose-600 border-rose-200' };
  if (person.status === '禁用') return { label: '停用', className: 'bg-slate-100 text-slate-500 border-slate-200' };
  return { label: '正常', className: 'bg-blue-50 text-[#1E5ABB] border-blue-200' };
};

const LetterAvatar: React.FC<{ name: string; size?: 'sm' | 'md' }> = ({ name, size = 'md' }) => (
  <span
    className={`${size === 'sm' ? 'w-7 h-7 text-[11px]' : 'w-9 h-9 text-sm'} rounded-full bg-blue-100 text-[#1E3A8A] font-bold flex items-center justify-center shrink-0`}
  >
    {(name || '?').slice(0, 1)}
  </span>
);

const RoleTag: React.FC<{ person: PersonnelItem }> = ({ person }) =>
  person.isLeader ? (
    <span className="inline-block px-1.5 py-0.5 rounded bg-slate-900 text-white text-[11px] font-semibold">主管</span>
  ) : (
    <span className="inline-block px-1.5 py-0.5 rounded border border-amber-300 bg-amber-50 text-amber-700 text-[11px] font-semibold">
      {person.roles?.[0] || '普通成员'}
    </span>
  );

export const ExternalOrgManagement: React.FC<ExternalOrgManagementProps> = ({ shared }) => {
  const { orgNodes, setOrgNodes, personnelList, setPersonnelList } = shared;
  const roster = useMemo(() => personnelList.filter((person) => !person.recycled), [personnelList]);

  const [selectedId, setSelectedId] = useState<string>(() => getOrgChildrenOf(orgNodes, null)[0]?.id || '');
  const [treeSearch, setTreeSearch] = useState('');
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);
  const [toast, setToast] = useState('');
  const [orgModal, setOrgModal] = useState<'create' | 'edit' | null>(null);
  const [orgForm, setOrgForm] = useState<OrgForm>(emptyOrgForm);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [viewingPerson, setViewingPerson] = useState<PersonnelItem | null>(null);

  const selected = getOrgById(orgNodes, selectedId) || getOrgChildrenOf(orgNodes, null)[0];
  const parent = selected?.parentId ? getOrgById(orgNodes, selected.parentId) : undefined;
  const rootOrg = selected ? getOrgById(orgNodes, buildOrgIdPath(orgNodes, selected.id)[0]) : undefined;
  const members = useMemo(
    () => (selected ? roster.filter((person) => personOrgId(orgNodes, person) === selected.id) : []),
    [roster, orgNodes, selected]
  );
  const leader = selected
    ? roster.find((person) => person.id === selected.leaderPersonId) ||
      roster.find((person) => person.realName === selected.leaderName)
    : undefined;

  const triggerToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const treeMatches = useMemo(() => {
    const q = treeSearch.trim().toLowerCase();
    if (!q) return null;
    const visible = new Set<string>();
    orgNodes.forEach((node) => {
      if (node.name.toLowerCase().includes(q) || (node.leaderName || '').toLowerCase().includes(q)) {
        buildOrgIdPath(orgNodes, node.id).forEach((id) => visible.add(id));
      }
    });
    return visible;
  }, [treeSearch, orgNodes]);

  const expandableIds = orgNodes.filter((node) => getOrgChildrenOf(orgNodes, node.id).length > 0).map((node) => node.id);
  const allCollapsed = expandableIds.length > 0 && expandableIds.every((id) => collapsedIds.includes(id));

  const openCreate = () => {
    setOrgForm(emptyOrgForm(selected?.id || ''));
    setOrgModal('create');
  };

  const openEditFor = (node: OrgNode) => {
    setSelectedId(node.id);
    setOrgForm({
      name: node.name,
      parentId: node.parentId || '',
      leaderPersonId: node.leaderPersonId,
      leaderName: node.leaderName || '',
      leaderPhone: node.leaderPhone || '',
      orgType: node.orgType || DEFAULT_ORG_TYPE,
      duty: node.duty || ''
    });
    setOrgModal('edit');
  };

  const openEdit = () => {
    if (selected) openEditFor(selected);
  };

  const saveOrg = () => {
    const name = orgForm.name.trim();
    if (!name) {
      triggerToast('请填写组织全称');
      return;
    }
    const fields = {
      name,
      leaderPersonId: orgForm.leaderPersonId,
      leaderName: orgForm.leaderName.trim(),
      leaderPhone: orgForm.leaderPhone.trim(),
      orgType: orgForm.orgType.trim(),
      duty: orgForm.duty.trim()
    };
    if (orgModal === 'edit' && selected) {
      setOrgNodes((prev) => prev.map((node) => (node.id === selected.id ? { ...node, ...fields } : node)));
      triggerToast(`已保存组织【${name}】`);
    } else {
      const parentNode = getOrgById(orgNodes, orgForm.parentId);
      if (!parentNode) {
        triggerToast('请选择上级组织');
        return;
      }
      const id = `org-ext-${Date.now()}`;
      const created: OrgNode = {
        id,
        categoryId: parentNode.categoryId,
        parentId: parentNode.id,
        code: generateOrgCode(new Set(orgNodes.map((node) => node.code || ''))),
        systemVersion: parentNode.systemVersion,
        expireDate: parentNode.expireDate,
        sortOrder: 100,
        allowSubOrgCreation: true,
        ...fields
      };
      setOrgNodes((prev) => [...prev, created]);
      setCollapsedIds((prev) => prev.filter((item) => item !== parentNode.id));
      setSelectedId(id);
      triggerToast(`已新增组织【${name}】`);
    }
    setOrgModal(null);
  };

  const addMembers = (ids: number[]) => {
    if (!selected || ids.length === 0) return;
    const joinedOrgAt = todayLabel();
    setPersonnelList((prev) =>
      prev.map((person) =>
        ids.includes(person.id) ? { ...person, orgIds: [selected.id], primaryOrgId: selected.id, joinedOrgAt } : person
      )
    );
    triggerToast(`已将 ${ids.length} 人加入【${selected.name}】`);
  };

  const removeMember = (person: PersonnelItem) => {
    if (!selected) return;
    if (!window.confirm(`确定将【${person.realName}】移出「${selected.name}」吗？`)) return;
    setPersonnelList((prev) =>
      prev.map((item) =>
        item.id === person.id ? { ...item, orgIds: [], primaryOrgId: undefined, joinedOrgAt: undefined, isLeader: false } : item
      )
    );
    triggerToast(`已将【${person.realName}】移出组织`);
  };

  const renderTreeNode = (node: OrgNode, depth: number): React.ReactNode => {
    if (treeMatches && !treeMatches.has(node.id)) return null;
    const children = getOrgChildrenOf(orgNodes, node.id);
    const isCollapsed = !treeMatches && collapsedIds.includes(node.id);
    const isSelected = node.id === selected?.id;
    const NodeIcon = depth === 0 ? Building2 : isSelected ? Layers : Circle;
    return (
      <div key={node.id}>
        <div
          className={`group flex items-center gap-1 h-8 pr-2 rounded cursor-pointer ${
            isSelected ? 'bg-blue-50 text-[#1E3A8A] font-semibold' : 'text-slate-700 hover:bg-slate-50'
          }`}
          style={{ paddingLeft: 4 + depth * 18 }}
          onClick={() => setSelectedId(node.id)}
        >
          {children.length > 0 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setCollapsedIds((prev) => (prev.includes(node.id) ? prev.filter((id) => id !== node.id) : [...prev, node.id]));
              }}
              className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-5 shrink-0" />
          )}
          <NodeIcon className={`w-3.5 h-3.5 shrink-0 ${depth === 0 || isSelected ? 'text-[#1E5ABB]' : 'text-[#1E5ABB]/70'}`} />
          <span className="flex-1 min-w-0 truncate text-xs ml-1">{node.name}</span>
          <button
            type="button"
            title="编辑组织"
            onClick={(event) => {
              event.stopPropagation();
              openEditFor(node);
            }}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#1E5ABB] cursor-pointer shrink-0"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </div>
        {!isCollapsed && children.map((child) => renderTreeNode(child, depth + 1))}
      </div>
    );
  };

  const openedCount = members.filter((person) => !!person.openId).length;
  const normalCount = members.filter((person) => person.status === '启用' && !person.locked).length;
  const lockedCount = members.filter((person) => person.locked).length;
  const realNameCount = members.filter((person) => person.realName && person.phone).length;
  const bindRate = members.length ? Math.round((realNameCount / members.length) * 100) : 100;

  return (
    <div className="h-full min-h-[680px] p-4 bg-slate-50/40 flex gap-4 min-w-0">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-lg bg-[#1E5ABB] text-white text-xs font-bold shadow-lg">
          {toast}
        </div>
      )}

      <aside className="w-[300px] shrink-0 rounded-lg border border-slate-200 bg-white flex flex-col min-h-0">
        <div className="px-3 pt-3 pb-2 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 min-w-0">
            <Building2 className="w-3.5 h-3.5 text-[#1E5ABB] shrink-0" />
            <span className="truncate">外部组织拓扑树</span>
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setCollapsedIds(allCollapsed ? [] : expandableIds)}
              className="h-6 px-2 rounded border border-slate-200 text-[11px] text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              {allCollapsed ? '展开' : '折叠'}
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="h-6 px-2 rounded bg-[#1E3A8A] hover:bg-[#172f70] text-white text-[11px] font-semibold inline-flex items-center gap-0.5 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              加组织
            </button>
          </span>
        </div>
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              value={treeSearch}
              onChange={(event) => setTreeSearch(event.target.value)}
              placeholder="搜索机构名称、负责人..."
              className="w-full h-8 pl-8 pr-2 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
            />
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-3">
          {getOrgChildrenOf(orgNodes, null).map((node) => renderTreeNode(node, 0))}
          {treeMatches && treeMatches.size === 0 && <div className="py-8 text-center text-xs text-slate-400">没有匹配的组织</div>}
        </div>
      </aside>

      {selected ? (
        <section className="flex-1 min-w-0 space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 flex items-center gap-3">
            <span className="w-11 h-11 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-900 truncate">{selected.name}</h3>
              <div className="mt-0.5 flex items-center gap-3 text-[11px] text-slate-500">
                <span>
                  编码：<span className="font-mono text-slate-600">{selected.code || '—'}</span>
                </span>
                <span className="w-px h-3 bg-slate-200" />
                <span>上级机构：{parent?.name || '—（一级组织）'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMembersOpen(true)}
              className="h-8 px-3.5 rounded bg-[#1E3A8A] hover:bg-[#172f70] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              组织人员
            </button>
            <button
              type="button"
              onClick={openEdit}
              className="h-8 px-3.5 rounded bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              编辑组织
            </button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <Building2 className="w-4 h-4 text-[#1E5ABB]" />
                组织基本信息维护
              </span>
              <button
                type="button"
                onClick={openEdit}
                className="text-xs text-[#1E5ABB] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Pencil className="w-3 h-3" />
                快捷修改
              </button>
            </div>
            <div className="p-4 grid grid-cols-3 gap-3">
              <InfoTile icon={<Building2 className="w-4 h-4" />} label="组织全称" value={selected.name} />
              <InfoTile
                icon={<User className="w-4 h-4" />}
                label="组织负责人 / 联系人"
                value={selected.leaderName || leader?.realName || '未设置'}
              />
              <InfoTile
                icon={<Phone className="w-4 h-4" />}
                label="联系电话 / 值班专线"
                value={selected.leaderPhone || leader?.phone || '未设置'}
                mono
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <KeyRound className="w-4 h-4 text-[#1E5ABB]" />
                该组织账号统计与权限状态
              </span>
              <span className="text-[11px] text-slate-500">
                实名账号绑定率 <strong className="text-emerald-600 font-mono">{bindRate}%</strong>
              </span>
            </div>
            <div className="p-4 grid grid-cols-4 gap-3">
              <StatTile label="账号总数" value={members.length} tone="slate" />
              <StatTile label="已开通账号数" value={openedCount} tone="blue" />
              <StatTile label="正常状态账号" value={normalCount} tone="blue" />
              <StatTile label="锁定账号" value={lockedCount} tone="rose" />
            </div>
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">直属人员及账号列表</span>
                <span className="text-[11px] text-slate-400">共 {members.length} 名成员</span>
              </div>
              <table className="w-full text-left text-xs border border-slate-100">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="py-2 px-3 font-semibold">姓名</th>
                    <th className="py-2 px-3 font-semibold">角色</th>
                    <th className="py-2 px-3 font-semibold">联系手机</th>
                    <th className="py-2 px-3 font-semibold">账号状态</th>
                    <th className="py-2 px-3 font-semibold text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        该组织暂无直属人员，可点击「组织人员」添加
                      </td>
                    </tr>
                  ) : (
                    members.map((person) => {
                      const state = accountState(person);
                      return (
                        <tr key={person.id} className="hover:bg-blue-50/20">
                          <td className="py-2.5 px-3 font-bold text-slate-800">{person.realName}</td>
                          <td className="py-2.5 px-3">
                            <RoleTag person={person} />
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{maskPhone(person.phone)}</td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[11px] ${state.className}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {state.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => setViewingPerson(person)}
                              className="text-[#1E5ABB] font-semibold hover:underline cursor-pointer"
                            >
                              查看详情
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : (
        <section className="flex-1 flex items-center justify-center text-sm text-slate-400">请先在左侧新增组织</section>
      )}

      {orgModal && (
        <OrgFormModal
          mode={orgModal}
          form={orgForm}
          onChange={(patch) => setOrgForm((prev) => ({ ...prev, ...patch }))}
          orgNodes={orgNodes}
          roster={roster}
          onCancel={() => setOrgModal(null)}
          onSubmit={saveOrg}
        />
      )}

      {isMembersOpen && selected && (
        <MembersModal
          org={selected}
          rootName={rootOrg?.name || selected.name}
          members={members}
          onAdd={() => setIsPickerOpen(true)}
          onRemove={removeMember}
          onClose={() => setIsMembersOpen(false)}
        />
      )}

      {isPickerOpen && selected && (
        <MemberPickerModal
          org={selected}
          candidates={roster.filter((person) => personOrgId(orgNodes, person) !== selected.id)}
          orgNodes={orgNodes}
          onCancel={() => setIsPickerOpen(false)}
          onConfirm={(ids) => {
            addMembers(ids);
            setIsPickerOpen(false);
          }}
        />
      )}

      {viewingPerson && (
        <PersonDetailModal
          person={viewingPerson}
          orgName={getOrgById(orgNodes, personOrgId(orgNodes, viewingPerson))?.name || '未分配组织'}
          onClose={() => setViewingPerson(null)}
        />
      )}
    </div>
  );
};

const InfoTile: React.FC<{ icon: React.ReactNode; label: string; value: string; mono?: boolean }> = ({
  icon,
  label,
  value,
  mono
}) => (
  <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-3 flex items-center gap-3 min-w-0">
    <span className="w-8 h-8 rounded-md bg-white border border-slate-200 text-[#1E5ABB] flex items-center justify-center shrink-0">
      {icon}
    </span>
    <span className="min-w-0">
      <span className="block text-[11px] text-slate-400">{label}</span>
      <span className={`block text-xs font-bold text-slate-800 truncate ${mono ? 'font-mono' : ''}`}>{value}</span>
    </span>
  </div>
);

const StatTile: React.FC<{ label: string; value: number; tone: 'slate' | 'blue' | 'rose' }> = ({ label, value, tone }) => {
  const tones = {
    slate: 'border-slate-200 bg-white text-slate-800',
    blue: 'border-blue-100 bg-blue-50/40 text-[#1E5ABB]',
    rose: 'border-rose-200 bg-rose-50/50 text-rose-600'
  };
  return (
    <div className={`rounded-lg border px-4 py-3 ${tones[tone]}`}>
      <div className="text-[11px] opacity-80">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="text-2xl font-bold font-mono">{value}</span>
        <span className="text-[11px] opacity-70">人</span>
      </div>
    </div>
  );
};

const DetailTile: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="rounded-lg bg-slate-50 px-3 py-2.5 min-w-0">
    <div className="text-[11px] text-slate-400">{label}</div>
    <div className={`mt-0.5 text-xs font-bold text-slate-800 truncate ${mono ? 'font-mono' : ''}`} title={value}>
      {value}
    </div>
  </div>
);

const PersonDetailModal: React.FC<{ person: PersonnelItem; orgName: string; onClose: () => void }> = ({
  person,
  orgName,
  onClose
}) => {
  const state = accountState(person);
  return (
    <ModalShell onClose={onClose} widthClass="max-w-[400px]">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
        <User className="w-4 h-4 text-[#1E5ABB]" />
        <h3 className="flex-1 text-sm font-bold text-slate-800">外部人员账号详情</h3>
        <CloseButton onClick={onClose} />
      </div>
      <div className="px-5 pt-4 pb-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <span className="w-12 h-12 rounded-full bg-[#1E3A8A] text-white text-lg font-bold flex items-center justify-center shrink-0">
            {person.realName.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <div className="text-base font-bold text-slate-900">{person.realName}</div>
            <div className="text-xs text-slate-400 font-mono">EXT-{String(person.id).padStart(4, '0')}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <DetailTile label="所属外部组织" value={orgName} />
          <DetailTile label="职务 / 职责" value={person.jobTitle || '未填写'} />
          <DetailTile label="性别" value={person.gender || '未填写'} />
          <DetailTile label="联系手机" value={maskPhone(person.phone)} mono />
        </div>
        <div className="mt-2.5 px-3 py-3 rounded-lg border border-blue-100 bg-blue-50/40 flex items-center justify-between">
          <span className="text-xs text-slate-600">外部账号状态</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${state.className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {state.label}
          </span>
        </div>
      </div>
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end rounded-b-lg">
        <button
          type="button"
          onClick={onClose}
          className="h-8 px-4 rounded bg-slate-200/70 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
        >
          关闭
        </button>
      </div>
    </ModalShell>
  );
};

const ModalShell: React.FC<{ onClose: () => void; widthClass: string; children: React.ReactNode; z?: string }> = ({
  onClose,
  widthClass,
  children,
  z = 'z-50'
}) => (
  <div className={`fixed inset-0 bg-black/50 ${z} flex items-center justify-center p-4`} onClick={onClose}>
    <div
      className={`bg-white rounded-lg shadow-xl w-full ${widthClass} max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95`}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

const CloseButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button type="button" onClick={onClick} className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0" aria-label="关闭">
    <X className="w-4 h-4" />
  </button>
);

const FormLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-xs font-bold text-slate-700 mb-1.5">
    {children}
    {required && <span className="text-rose-500 ml-0.5">*</span>}
  </label>
);

const inputClass =
  'w-full h-9 px-3 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] bg-white';

const OrgFormModal: React.FC<{
  mode: 'create' | 'edit';
  form: OrgForm;
  onChange: (patch: Partial<OrgForm>) => void;
  orgNodes: OrgNode[];
  roster: PersonnelItem[];
  onCancel: () => void;
  onSubmit: () => void;
}> = ({ mode, form, onChange, orgNodes, roster, onCancel, onSubmit }) => {
  const parentOptions = useMemo(() => {
    const list: Array<{ id: string; label: string }> = [];
    const walk = (parentId: string | null, depth: number) => {
      getOrgChildrenOf(orgNodes, parentId).forEach((node) => {
        list.push({ id: node.id, label: `${'\u3000'.repeat(depth)}${node.name}` });
        walk(node.id, depth + 1);
      });
    };
    walk(null, 0);
    return list;
  }, [orgNodes]);

  return (
    <ModalShell onClose={onCancel} widthClass="max-w-[480px]">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        {mode === 'create' ? (
          <Building2 className="w-4 h-4 text-[#1E3A8A]" />
        ) : (
          <Pencil className="w-4 h-4 text-emerald-700" />
        )}
        <h3 className="flex-1 text-sm font-bold text-slate-800">{mode === 'create' ? '新增外部组织节点' : '编辑外部组织信息'}</h3>
        <CloseButton onClick={onCancel} />
      </div>
      <div className="p-5 space-y-4 overflow-y-auto">
        <div>
          <FormLabel required>组织全称</FormLabel>
          <input
            value={form.name}
            onChange={(event) => onChange({ name: event.target.value })}
            placeholder="例如：高新第四网宣协作联络站"
            className={inputClass}
          />
        </div>
        {mode === 'create' && (
          <div>
            <FormLabel required>上级组织</FormLabel>
            <select value={form.parentId} onChange={(event) => onChange({ parentId: event.target.value })} className={inputClass}>
              <option value="">请选择上级组织</option>
              {parentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {form.parentId && (
              <p className="mt-1 text-[11px] text-[#1E5ABB]">当前层级：{getOrgFullPath(orgNodes, form.parentId, ' / ')}</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FormLabel>组织负责人 / 联系人</FormLabel>
            <LeaderPicker
              roster={roster}
              orgNodes={orgNodes}
              value={form.leaderName}
              onPick={(person) => onChange({ leaderPersonId: person.id, leaderName: person.realName, leaderPhone: person.phone })}
            />
          </div>
          <div>
            <FormLabel>联系电话 / 值班专线</FormLabel>
            <input
              value={form.leaderPhone}
              onChange={(event) => onChange({ leaderPhone: event.target.value })}
              placeholder="选人后自动回填，可修改"
              className={`${inputClass} font-mono`}
            />
          </div>
        </div>
        <div>
          <FormLabel>组织类型</FormLabel>
          <input value={form.orgType} onChange={(event) => onChange({ orgType: event.target.value })} className={inputClass} />
        </div>
        <div>
          <FormLabel>主要职责职能说明</FormLabel>
          <textarea
            value={form.duty}
            onChange={(event) => onChange({ duty: event.target.value })}
            rows={3}
            placeholder="可填写该外部组织协同范围、职责说明..."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] resize-none"
          />
        </div>
      </div>
      <div className="px-5 py-3.5 border-t border-slate-100 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer text-xs"
        >
          取消
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="h-9 px-5 bg-[#1E3A8A] hover:bg-[#172f70] text-white rounded font-bold cursor-pointer text-xs"
        >
          {mode === 'create' ? '确认添加' : '保存修改'}
        </button>
      </div>
    </ModalShell>
  );
};

const LeaderPicker: React.FC<{
  roster: PersonnelItem[];
  orgNodes: OrgNode[];
  value: string;
  onPick: (person: PersonnelItem) => void;
}> = ({ roster, orgNodes, value, onPick }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const q = query.trim().toLowerCase();
  const options = roster.filter(
    (person) => !q || person.realName.toLowerCase().includes(q) || (person.nickname || '').toLowerCase().includes(q)
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`${inputClass} flex items-center gap-2 text-left cursor-pointer`}
      >
        <User className={`w-3.5 h-3.5 shrink-0 ${value ? 'text-[#1E5ABB]' : 'text-slate-400'}`} />
        <span className={`flex-1 truncate ${value ? 'font-semibold text-slate-800' : 'text-slate-400'}`}>
          {value || '点击从组织架构选择人员'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-[260px] rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索姓名或昵称"
              className="w-full h-7 px-2 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
            />
          </div>
          <div className="max-h-52 overflow-y-auto p-1">
            {options.length === 0 ? (
              <div className="py-4 text-center text-[11px] text-slate-400">没有匹配的人员</div>
            ) : (
              options.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => {
                    onPick(person);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left cursor-pointer hover:bg-blue-50 ${
                    person.realName === value ? 'bg-blue-50' : ''
                  }`}
                >
                  <LetterAvatar name={person.realName} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-slate-800">{person.realName}</span>
                    <span className="block text-[10px] text-slate-400 truncate">
                      {getOrgById(orgNodes, personOrgId(orgNodes, person))?.name || '未分配组织'}
                    </span>
                  </span>
                  {person.realName === value && <Check className="w-3.5 h-3.5 text-[#1E5ABB]" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MembersModal: React.FC<{
  org: OrgNode;
  rootName: string;
  members: PersonnelItem[];
  onAdd: () => void;
  onRemove: (person: PersonnelItem) => void;
  onClose: () => void;
}> = ({ org, rootName, members, onAdd, onRemove, onClose }) => {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const visible = members.filter(
    (person) =>
      !q ||
      [person.realName, person.nickname || '', person.jobTitle || ''].some((text) => text.toLowerCase().includes(q))
  );

  return (
    <ModalShell onClose={onClose} widthClass="max-w-[640px]">
      <div className="px-5 py-4 border-b border-slate-100 flex items-start gap-3">
        <span className="w-10 h-10 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 truncate">组内成员管理 - {org.name}</h3>
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-blue-50 text-[#1E5ABB] text-[11px] font-semibold">
              当前共 {members.length} 人
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">
            编码：<span className="font-mono">{org.code || '—'}</span>
            <span className="mx-2">|</span>
            所属机构：{rootName}
          </div>
        </div>
        <CloseButton onClick={onClose} />
      </div>
      <div className="px-5 py-3 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索组内人员姓名、昵称、所属处室..."
            className="w-full h-9 pl-8 pr-3 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
          />
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="h-9 px-4 rounded bg-[#1E3A8A] hover:bg-[#172f70] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          添加人员
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-5">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-slate-100">
              <th className="py-2 pr-2 font-semibold">姓名 / 微信昵称</th>
              <th className="py-2 px-2 font-semibold">所属处室/部门</th>
              <th className="py-2 px-2 font-semibold">系统角色</th>
              <th className="py-2 px-2 font-semibold">联系手机</th>
              <th className="py-2 px-2 font-semibold">入组时间</th>
              <th className="py-2 pl-2 font-semibold text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  {members.length ? '没有匹配的组内人员' : '暂无组内成员，点击「添加人员」从外部用户管理中选择'}
                </td>
              </tr>
            ) : (
              visible.map((person) => (
                <tr key={person.id}>
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2">
                      <LetterAvatar name={person.realName} size="sm" />
                      <span>
                        <span className="block font-bold text-slate-800">{person.realName}</span>
                        <span className="block text-[11px] text-slate-400">@{person.nickname || person.username}</span>
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-slate-600">{person.jobTitle || org.name}</td>
                  <td className="py-2.5 px-2">
                    {person.isLeader ? (
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[11px] font-semibold">主管</span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded border border-slate-300 text-slate-600 text-[11px]">
                        {person.roles?.[0] || '普通成员'}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 font-mono text-slate-600">{maskPhone(person.phone)}</td>
                  <td className="py-2.5 px-2 font-mono text-slate-400">{person.joinedOrgAt || person.registerDate}</td>
                  <td className="py-2.5 pl-2 text-center">
                    <button
                      type="button"
                      onClick={() => onRemove(person)}
                      title="移出组织"
                      className="text-rose-500 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3.5 mt-2 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between rounded-b-lg">
        <span className="text-[11px] text-slate-500">组内人员调整后将实时生效于业务协同和群组指令派发</span>
        <button
          type="button"
          onClick={onClose}
          className="h-8 px-4 border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-50 cursor-pointer text-xs"
        >
          完成关闭
        </button>
      </div>
    </ModalShell>
  );
};

const MemberPickerModal: React.FC<{
  org: OrgNode;
  candidates: PersonnelItem[];
  orgNodes: OrgNode[];
  onCancel: () => void;
  onConfirm: (ids: number[]) => void;
}> = ({ org, candidates, orgNodes, onCancel, onConfirm }) => {
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<number[]>([]);
  const orgNameOf = (person: PersonnelItem) => getOrgById(orgNodes, personOrgId(orgNodes, person))?.name || '未分配组织';
  const q = query.trim().toLowerCase();
  const visible = candidates.filter(
    (person) =>
      !q ||
      [person.realName, person.nickname || '', orgNameOf(person), ...(person.roles || []), person.phone].some((text) =>
        text.toLowerCase().includes(q)
      )
  );

  const toggle = (id: number) => setPicked((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  return (
    <ModalShell onClose={onCancel} widthClass="max-w-[600px]" z="z-[55]">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <UserPlus className="w-4 h-4 text-[#1E3A8A]" />
        <h3 className="text-sm font-bold text-slate-800 truncate">选择外部人员加入「{org.name}」</h3>
        <span className="shrink-0 px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-[#1E5ABB] text-[10px] font-semibold">
          数据源：外部用户管理
        </span>
        <span className="flex-1" />
        <CloseButton onClick={onCancel} />
      </div>
      <div className="px-5 py-3 border-b border-slate-100">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="检索外部候选人员姓名、处室、角色、手机号..."
            className="w-full h-9 pl-8 pr-3 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
          />
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2">
        {visible.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            {candidates.length ? '没有匹配的外部人员' : '外部用户管理中的人员都已在该组织内'}
          </div>
        ) : (
          visible.map((person) => {
            const checked = picked.includes(person.id);
            return (
              <label
                key={person.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer border-b border-slate-50 ${
                  checked ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(person.id)}
                  className="w-4 h-4 rounded border-slate-300 text-[#1E5ABB] focus:ring-[#1E5ABB]"
                />
                <LetterAvatar name={person.realName} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-bold text-slate-800">{person.realName}</span>
                    <span className="text-[11px] text-slate-400 truncate">@{person.nickname || person.username}</span>
                    <span className="shrink-0 px-1.5 py-px rounded border border-slate-200 bg-slate-50 text-[10px] text-slate-600 font-semibold">
                      {person.roles?.[0] || '普通成员'}
                    </span>
                  </span>
                  <span className="block mt-0.5 text-[11px] text-slate-500">
                    {orgNameOf(person)}
                    <span className="mx-1.5 text-slate-300">|</span>
                    <span className="font-mono">{maskPhone(person.phone)}</span>
                  </span>
                </span>
              </label>
            );
          })
        )}
      </div>
      <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">已选中 {picked.length} 人</span>
        <span className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="h-8 px-4 text-xs text-slate-600 hover:text-slate-800 cursor-pointer">
            取消
          </button>
          <button
            type="button"
            disabled={picked.length === 0}
            onClick={() => onConfirm(picked)}
            className="h-8 px-4 rounded bg-[#1E3A8A] hover:bg-[#172f70] text-white text-xs font-semibold cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            确认加入
          </button>
        </span>
      </div>
    </ModalShell>
  );
};
