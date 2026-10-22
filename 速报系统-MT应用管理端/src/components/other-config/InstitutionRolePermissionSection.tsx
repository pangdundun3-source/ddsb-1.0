import React, { useMemo, useState } from 'react';
import { confirmDialog } from '../common/ConfirmDialog';

interface PermissionModule {
  id: string;
  label: string;
  group: string;
  actions: { key: string; label: string }[];
}

/** 机构内：对应 V8 客户管理端的功能菜单 */
const INTERNAL_MODULES: PermissionModule[] = [
  { id: 'home', group: '首页', label: '首页工作台', actions: [{ key: 'view', label: '查看' }] },
  {
    id: 'audit',
    group: '审核管理',
    label: '审核管理',
    actions: [
      { key: 'view', label: '查看' },
      { key: 'approve', label: '审核通过' },
      { key: 'reject', label: '审核驳回' },
      { key: 'batch', label: '批量审核' },
      { key: 'export', label: '导出' },
    ],
  },
  {
    id: 'warehouse',
    group: '数据仓库',
    label: '数据仓库',
    actions: [
      { key: 'view', label: '查看' },
      { key: 'add', label: '入库' },
      { key: 'edit', label: '编辑' },
      { key: 'delete', label: '删除' },
      { key: 'export', label: '导出' },
    ],
  },
  {
    id: 'statistics',
    group: '统计管理',
    label: '统计管理',
    actions: [
      { key: 'view', label: '查看' },
      { key: 'export', label: '导出' },
    ],
  },
  {
    id: 'assessment',
    group: '考核管理',
    label: '考核管理',
    actions: [
      { key: 'view', label: '查看' },
      { key: 'config', label: '考核配置' },
      { key: 'export', label: '导出' },
    ],
  },
  {
    id: 'notice',
    group: '公告管理',
    label: '公告管理',
    actions: [
      { key: 'view', label: '查看' },
      { key: 'publish', label: '发布' },
      { key: 'edit', label: '编辑' },
      { key: 'delete', label: '删除' },
    ],
  },
  {
    id: 'contact_user',
    group: '外部联系人',
    label: '用户管理',
    actions: [
      { key: 'view', label: '查看' },
      { key: 'invite', label: '邀请用户' },
      { key: 'edit', label: '编辑' },
      { key: 'delete', label: '删除' },
    ],
  },
  {
    id: 'contact_org',
    group: '外部联系人',
    label: '组织管理',
    actions: [
      { key: 'view', label: '查看' },
      { key: 'edit', label: '维护组织' },
    ],
  },
  {
    id: 'contact_role',
    group: '外部联系人',
    label: '角色管理',
    actions: [
      { key: 'view', label: '查看' },
      { key: 'edit', label: '配置权限' },
    ],
  },
  {
    id: 'contact_group',
    group: '外部联系人',
    label: '用户群组管理',
    actions: [
      { key: 'view', label: '查看' },
      { key: 'edit', label: '维护分组' },
    ],
  },
  {
    id: 'contact_invite',
    group: '外部联系人',
    label: '激活码管理',
    actions: [
      { key: 'view', label: '查看' },
    ],
  },
  {
    id: 'business_config',
    group: '系统管理',
    label: '业务配置',
    actions: [
      { key: 'view', label: '查看' },
      { key: 'edit', label: '修改配置' },
    ],
  },
];

/** 机构外：对应审核上报 PC / H5 端的功能点（与客户管理端「外部角色管理」一致） */
const EXTERNAL_MODULES: PermissionModule[] = [
  {
    id: 'home_dashboard',
    group: '首页',
    label: '首页工作台',
    actions: [
      { key: 'view', label: '查看工作台' },
      { key: 'todo', label: '查看待办' },
      { key: 'notice', label: '查看公告通知' },
      { key: 'detail', label: '跳转详情' },
    ],
  },
  {
    id: 'report_mine',
    group: '报送管理',
    label: '我的报送',
    actions: [
      { key: 'view', label: '查看' },
      { key: 'detail', label: '查看详情' },
      { key: 'add', label: '新建速报' },
      { key: 'resubmit', label: '修改补充并重新提交' },
      { key: 'delete', label: '删除报送' },
    ],
  },
  {
    id: 'report_records',
    group: '报送管理',
    label: '报送记录',
    actions: [
      { key: 'view', label: '查看' },
      { key: 'filter', label: '查询筛选' },
      { key: 'detail', label: '查看详情' },
      { key: 'edit', label: '编辑' },
      { key: 'delete', label: '删除' },
      { key: 'export', label: '导出台账' },
    ],
  },
  {
    id: 'report_statistics',
    group: '报送管理',
    label: '报送统计',
    actions: [
      { key: 'view', label: '查看' },
      { key: 'export', label: '导出统计报表' },
    ],
  },
  {
    id: 'audit_mine',
    group: '审核管理',
    label: '我的审核',
    actions: [
      { key: 'view', label: '查看' },
      { key: 'detail', label: '查看详情' },
      { key: 'approve', label: '审核通过' },
      { key: 'reject', label: '审核驳回' },
      { key: 'batch', label: '批量审核' },
      { key: 'flow', label: '查看流转记录' },
    ],
  },
  {
    id: 'audit_records',
    group: '审核管理',
    label: '审核记录',
    actions: [
      { key: 'view', label: '查看' },
      { key: 'filter', label: '查询筛选' },
      { key: 'detail', label: '查看详情' },
      { key: 'flow', label: '查看流转记录' },
    ],
  },
  {
    id: 'audit_statistics',
    group: '审核管理',
    label: '审核统计',
    actions: [
      { key: 'view', label: '查看' },
      { key: 'export', label: '导出统计报表' },
    ],
  },
  {
    id: 'org_manage',
    group: '组织管理',
    label: '组织节点管理',
    actions: [
      { key: 'view', label: '查看本节点组织' },
      { key: 'child', label: '维护自建子级' },
      { key: 'invite', label: '邀请人员入驻' },
      { key: 'personnel', label: '查看节点人员' },
    ],
  },
  {
    id: 'message_center',
    group: '消息中心',
    label: '消息通知',
    actions: [
      { key: 'view', label: '查看消息' },
      { key: 'search', label: '搜索消息' },
      { key: 'read', label: '标为已读' },
    ],
  },
  {
    id: 'personal_info',
    group: '个人中心',
    label: '个人信息',
    actions: [
      { key: 'view', label: '查看资料' },
      { key: 'phone', label: '更换绑定手机号' },
      { key: 'logout', label: '退出登录' },
    ],
  },
];

interface InstitutionRole {
  id: string;
  name: string;
  description: string;
  preset: boolean;
  locked?: boolean;
  permissions: string[];
}

interface PermissionCatalog {
  modules: PermissionModule[];
  allKeys: string[];
  groups: { group: string; modules: PermissionModule[] }[];
  buildDefaults: () => InstitutionRole[];
}

const keysOf = (modules: PermissionModule[], moduleIds: string[], actionKeys?: string[]) =>
  modules
    .filter((module) => moduleIds.includes(module.id))
    .flatMap((module) =>
      module.actions.filter((action) => !actionKeys || actionKeys.includes(action.key)).map((action) => `${module.id}.${action.key}`)
    );

type PickKeys = (moduleIds: string[], actionKeys?: string[]) => string[];

const createCatalog = (
  modules: PermissionModule[],
  buildDefaults: (pick: PickKeys, allKeys: string[]) => InstitutionRole[]
): PermissionCatalog => {
  const allKeys = modules.flatMap((module) => module.actions.map((action) => `${module.id}.${action.key}`));
  const groups = modules.reduce<{ group: string; modules: PermissionModule[] }[]>((acc, module) => {
    const last = acc[acc.length - 1];
    if (last && last.group === module.group) last.modules.push(module);
    else acc.push({ group: module.group, modules: [module] });
    return acc;
  }, []);
  const pick: PickKeys = (moduleIds, actionKeys) => keysOf(modules, moduleIds, actionKeys);
  return { modules, allKeys, groups, buildDefaults: () => buildDefaults(pick, allKeys) };
};

const INTERNAL_CATALOG = createCatalog(INTERNAL_MODULES, (pick, allKeys) => [
  {
    id: 'org_admin',
    name: '机构管理员',
    description: '机构最高权限，拥有全部功能菜单与操作权限',
    preset: true,
    locked: true,
    permissions: [...allKeys],
  },
  {
    id: 'audit_admin',
    name: '审核管理员',
    description: '负责报送审核、统计查看与考核管理',
    preset: true,
    permissions: [
      ...pick(['home', 'audit', 'statistics', 'assessment']),
      ...pick(['warehouse', 'notice', 'contact_user', 'contact_org'], ['view']),
    ],
  },
  {
    id: 'data_admin',
    name: '数据管理员',
    description: '负责数据仓库维护、统计导出与公告发布',
    preset: true,
    permissions: [...pick(['home', 'warehouse', 'statistics', 'notice']), ...pick(['audit'], ['view'])],
  },
]);

const EXTERNAL_CATALOG = createCatalog(EXTERNAL_MODULES, (pick, allKeys) => [
  {
    id: 'reporter',
    name: '网格员',
    description: '负责基础事件、信息与数据的填报与提交',
    preset: true,
    permissions: pick(['home_dashboard', 'report_mine', 'report_records', 'report_statistics', 'message_center', 'personal_info']),
  },
  {
    id: 'auditor',
    name: '审核员',
    description: '负责上报信息的核查、归档与退回评估',
    preset: true,
    permissions: pick(['home_dashboard', 'audit_mine', 'audit_records', 'audit_statistics', 'message_center', 'personal_info']),
  },
  {
    id: 'org_leader',
    name: '节点负责人',
    description: '组织节点负责人，开通首页、消息中心、个人中心与组织管理，并负责本节点及自建子级维护',
    preset: true,
    permissions: pick(['home_dashboard', 'org_manage', 'message_center', 'personal_info']),
  },
  {
    id: 'sys_admin',
    name: '系统管理员',
    description: '外部系统管理员，拥有审核上报端全部功能与组织管理权限',
    preset: true,
    permissions: [...allKeys],
  },
]);

type RoleScope = 'internal' | 'external';

const ROLE_SCOPES: { key: RoleScope; label: string; icon: string; hint: string; catalog: PermissionCatalog; storageSuffix: string }[] = [
  {
    key: 'internal',
    label: '内部角色权限',
    icon: 'badge',
    hint: '机构工作人员在客户管理端内的角色及功能菜单、操作权限',
    catalog: INTERNAL_CATALOG,
    storageSuffix: '',
  },
  {
    key: 'external',
    label: '外部角色权限',
    icon: 'group',
    hint: '外部人员（网格员、审核员、节点负责人、系统管理员等）在审核上报 PC / H5 端的角色及功能权限',
    catalog: EXTERNAL_CATALOG,
    storageSuffix: '_external',
  },
];

const mergeWithPresetRoles = (catalog: PermissionCatalog, stored: InstitutionRole[]): InstitutionRole[] => {
  const defaults = catalog.buildDefaults();
  const storedById = new Map(stored.map((role) => [role.id, role]));
  const defaultIds = new Set(defaults.map((role) => role.id));
  const merged = [
    ...defaults.map((def) => {
      const storedRole = storedById.get(def.id);
      if (!storedRole) return def;
      return {
        ...storedRole,
        name: def.name,
        description: def.description,
        preset: def.preset,
        locked: def.locked,
        // 系统预设角色权限以代码默认为准；自定义角色保留本地已存权限
        permissions: def.locked || def.preset
          ? [...def.permissions]
          : (storedRole.permissions || []).filter((key) => catalog.allKeys.includes(key)),
      };
    }),
    ...stored.filter((role) => !defaultIds.has(role.id)),
  ];
  return merged.map((role) => ({
    ...role,
    permissions: role.locked ? [...catalog.allKeys] : (role.permissions || []).filter((key) => catalog.allKeys.includes(key)),
  }));
};

const readStoredRoles = (catalog: PermissionCatalog, storageKey: string, fallbackKey?: string): InstitutionRole[] => {
  for (const key of [storageKey, fallbackKey]) {
    if (!key) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return mergeWithPresetRoles(catalog, parsed as InstitutionRole[]);
      }
    } catch {
      // Ignore malformed storage and fall back to defaults.
    }
  }
  return catalog.buildDefaults();
};

interface PanelProps {
  catalog: PermissionCatalog;
  hint: string;
  storageKey: string;
  fallbackStorageKey?: string;
  isGlobalScope: boolean;
  hidden: boolean;
  scopeTabs: React.ReactNode;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

const RolePermissionPanel: React.FC<PanelProps> = ({
  catalog,
  hint,
  storageKey,
  fallbackStorageKey,
  isGlobalScope,
  hidden,
  scopeTabs,
  showToast,
}) => {
  const [roles, setRoles] = useState<InstitutionRole[]>(() => readStoredRoles(catalog, storageKey, fallbackStorageKey));
  const [platformRoles] = useState<InstitutionRole[]>(() => (isGlobalScope ? [] : readStoredRoles(catalog, fallbackStorageKey ?? '')));
  const [selectedId, setSelectedId] = useState<string>(() => roles[0]?.id ?? '');
  const [dirty, setDirty] = useState(false);
  const [roleModal, setRoleModal] = useState<{ mode: 'create' | 'edit'; name: string; description: string } | null>(null);
  const [roleNameError, setRoleNameError] = useState('');

  const editableKey = `${isGlobalScope ? storageKey : fallbackStorageKey ?? storageKey}_editable`;
  const [allowInstitutionEdit, setAllowInstitutionEdit] = useState<boolean>(() => {
    try {
      return localStorage.getItem(editableKey) !== 'false';
    } catch {
      return true;
    }
  });
  const institutionLocked = !isGlobalScope && !allowInstitutionEdit;

  const builtInIds = useMemo(() => new Set(platformRoles.map((role) => role.id)), [platformRoles]);
  const isBuiltIn = (role: InstitutionRole) => builtInIds.has(role.id);
  const visibleRoles = institutionLocked ? platformRoles : roles;
  const selectedRole = visibleRoles.find((role) => role.id === selectedId) ?? visibleRoles[0];
  const granted = useMemo(() => new Set(selectedRole?.permissions ?? []), [selectedRole]);
  const readOnly = !selectedRole || Boolean(selectedRole.locked) || isBuiltIn(selectedRole) || institutionLocked;

  const updatePermissions = (updater: (current: Set<string>) => void) => {
    if (!selectedRole || readOnly) return;
    const next = new Set(selectedRole.permissions);
    updater(next);
    setRoles((prev) =>
      prev.map((role) => (role.id === selectedRole.id ? { ...role, permissions: catalog.allKeys.filter((key) => next.has(key)) } : role))
    );
    setDirty(true);
  };

  const toggleAction = (module: PermissionModule, actionKey: string) =>
    updatePermissions((set) => {
      const key = `${module.id}.${actionKey}`;
      const viewKey = `${module.id}.view`;
      if (set.has(key)) {
        set.delete(key);
        if (actionKey === 'view') module.actions.forEach((action) => set.delete(`${module.id}.${action.key}`));
      } else {
        set.add(key);
        set.add(viewKey);
      }
    });

  const toggleModule = (module: PermissionModule) =>
    updatePermissions((set) => {
      const keys = module.actions.map((action) => `${module.id}.${action.key}`);
      const allOn = keys.every((key) => set.has(key));
      keys.forEach((key) => (allOn ? set.delete(key) : set.add(key)));
    });

  const toggleAll = (checked: boolean) => updatePermissions((set) => catalog.allKeys.forEach((key) => (checked ? set.add(key) : set.delete(key))));

  const openRoleModal = (mode: 'create' | 'edit') => {
    setRoleNameError('');
    setRoleModal(
      mode === 'create'
        ? { mode, name: '', description: '' }
        : { mode, name: selectedRole?.name ?? '', description: selectedRole?.description ?? '' }
    );
  };

  const submitRoleModal = () => {
    if (!roleModal) return;
    const name = roleModal.name.trim();
    if (!name) return setRoleNameError('请填写角色名称');
    const editingId = roleModal.mode === 'edit' ? selectedRole?.id : undefined;
    if (roles.some((role) => role.name === name && role.id !== editingId)) return setRoleNameError('角色名称已存在');
    const description = roleModal.description.trim();
    if (roleModal.mode === 'create') {
      const id = `custom_${Date.now()}`;
      const firstModule = catalog.modules[0];
      setRoles((prev) => [...prev, { id, name, description, preset: false, permissions: [`${firstModule.id}.view`] }]);
      setSelectedId(id);
      showToast(`已新增角色「${name}」，请勾选其功能权限`, 'success');
    } else {
      setRoles((prev) => prev.map((role) => (role.id === editingId ? { ...role, name, description } : role)));
    }
    setDirty(true);
    setRoleModal(null);
  };

  const deleteRole = async (role: InstitutionRole) => {
    if (!(await confirmDialog(`确定删除角色「${role.name}」吗？`, { title: '删除角色', okText: '确认删除', danger: true }))) return;
    const next = roles.filter((item) => item.id !== role.id);
    setRoles(next);
    if (selectedId === role.id) setSelectedId(next[0]?.id ?? '');
    setDirty(true);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(roles));
      if (isGlobalScope) localStorage.setItem(editableKey, String(allowInstitutionEdit));
    } catch {
      // Storage may be unavailable in private or restricted browser contexts.
    }
    setDirty(false);
    showToast(isGlobalScope ? '平台角色权限配置已保存' : '角色权限配置已保存并实时生效', 'success');
  };

  const handleReset = async () => {
    if (!(await confirmDialog('确定恢复默认角色权限吗？自定义角色将被清空。', { title: '恢复默认', okText: '确认恢复' }))) return;
    const defaults = isGlobalScope ? catalog.buildDefaults() : platformRoles.map((role) => ({ ...role, permissions: [...role.permissions] }));
    setRoles(defaults);
    setSelectedId(defaults[0].id);
    setDirty(true);
  };

  const checkboxClass = 'w-3.5 h-3.5 rounded accent-[#1890ff] cursor-pointer disabled:cursor-not-allowed';
  const grantedCount = selectedRole?.permissions.length ?? 0;

  return (
    <div className={hidden ? 'hidden' : 'space-y-4'}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-800">{isGlobalScope ? '平台角色权限配置' : '机构角色权限配置'}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {isGlobalScope
              ? '分别配置内部、外部角色及权限；保存后作为全平台机构的默认角色模板'
              : '分别配置本机构的内部、外部角色及权限；「系统默认」角色来自平台全局配置，仅供查看；新增的角色支持增删改'}
          </p>
        </div>
        <div className={`flex items-center gap-2 shrink-0 ${institutionLocked ? 'invisible' : ''}`}>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
          >
            恢复默认
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#1890ff] rounded hover:bg-[#1677d9] disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
          >
            保存配置
          </button>
        </div>
      </div>

      {scopeTabs}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 -mt-1">
        <p className="text-[11px] text-gray-500">{hint}</p>
        {isGlobalScope && (
          <label className="inline-flex items-center gap-2 shrink-0 cursor-pointer select-none">
            <span className="text-xs font-bold text-gray-700">允许机构自行增删改角色及权限</span>
            <button
              type="button"
              role="switch"
              aria-checked={allowInstitutionEdit}
              onClick={() => {
                setAllowInstitutionEdit((prev) => !prev);
                setDirty(true);
              }}
              className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${allowInstitutionEdit ? 'bg-[#1890ff]' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  allowInstitutionEdit ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </label>
        )}
      </div>
      {institutionLocked && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <span className="material-symbols-outlined text-[16px]">lock</span>
          平台未开放机构自行增删改此类角色，以下为平台统一配置，仅供查看
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="w-full lg:w-56 shrink-0 border border-gray-100 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50/80 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-700">角色列表（{visibleRoles.length}）</span>
            {!institutionLocked && (
              <button
                type="button"
                onClick={() => openRoleModal('create')}
                className="inline-flex items-center gap-0.5 text-xs font-bold text-[#1890ff] hover:text-blue-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                新增角色
              </button>
            )}
          </div>
          <div className="p-1.5 space-y-1">
            {visibleRoles.map((role) => {
              const isActive = role.id === selectedRole?.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedId(role.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-md border transition-colors cursor-pointer ${
                    isActive ? 'bg-blue-50 border-blue-200' : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold ${isActive ? 'text-[#1890ff]' : 'text-gray-800'}`}>{role.name}</span>
                    {isBuiltIn(role) && (
                      <span className="text-[10px] px-1.5 py-px rounded border bg-gray-50 text-gray-500 border-gray-200">系统默认</span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1 line-clamp-1">{role.description || '暂无描述'}</div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedRole && (
          <div className="flex-1 min-w-0 w-full space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 rounded-lg bg-slate-50 border border-gray-100">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800">{selectedRole.name}</span>
                  <span className="text-[11px] text-gray-500">
                    已授权 <span className="font-bold text-[#1890ff]">{grantedCount}</span> / {catalog.allKeys.length} 项
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {selectedRole.locked ? `${selectedRole.name}固定拥有全部权限，不可修改` : isBuiltIn(selectedRole) ? '系统默认角色，权限仅供查看，不支持修改' : selectedRole.description || '暂无描述'}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold shrink-0">
                {!readOnly && (
                  <>
                    <button type="button" onClick={() => toggleAll(true)} className="text-[#1890ff] hover:text-blue-700 cursor-pointer">
                      全部授权
                    </button>
                    <button type="button" onClick={() => toggleAll(false)} className="text-gray-500 hover:text-gray-700 cursor-pointer">
                      全部清空
                    </button>
                  </>
                )}
                {!selectedRole.locked && !isBuiltIn(selectedRole) && !institutionLocked && (
                  <button type="button" onClick={() => openRoleModal('edit')} className="text-[#1890ff] hover:text-blue-700 cursor-pointer">
                    编辑角色
                  </button>
                )}
                {!selectedRole.preset && !isBuiltIn(selectedRole) && !institutionLocked && (
                  <button type="button" onClick={() => deleteRole(selectedRole)} className="text-gray-400 hover:text-red-600 cursor-pointer">
                    删除
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-100 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 border-b border-gray-200 font-medium">
                    <th className="px-4 py-3 w-28">功能菜单</th>
                    <th className="px-3 py-3 w-40">功能模块</th>
                    <th className="px-3 py-3">操作权限</th>
                  </tr>
                </thead>
                <tbody>
                  {catalog.groups.map(({ group, modules }) =>
                    modules.map((module, index) => {
                      const moduleKeys = module.actions.map((action) => `${module.id}.${action.key}`);
                      const grantedInModule = moduleKeys.filter((key) => granted.has(key)).length;
                      const allOn = grantedInModule === moduleKeys.length;
                      return (
                        <tr key={module.id} className="border-b border-gray-100 last:border-b-0">
                          {index === 0 && (
                            <td rowSpan={modules.length} className="px-4 py-3 align-top font-bold text-gray-800 bg-gray-50/40 border-r border-gray-100">
                              {group}
                            </td>
                          )}
                          <td className="px-3 py-3">
                            <label className={`inline-flex items-center gap-2 select-none ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                              <input
                                type="checkbox"
                                checked={allOn}
                                ref={(el) => {
                                  if (el) el.indeterminate = grantedInModule > 0 && !allOn;
                                }}
                                disabled={readOnly}
                                onChange={() => toggleModule(module)}
                                className={checkboxClass}
                              />
                              <span className="font-medium text-gray-700">{module.label}</span>
                            </label>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-x-5 gap-y-2">
                              {module.actions.map((action) => (
                                <label
                                  key={action.key}
                                  className={`inline-flex items-center gap-1.5 select-none text-gray-600 ${
                                    readOnly ? 'cursor-not-allowed' : 'cursor-pointer'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={granted.has(`${module.id}.${action.key}`)}
                                    disabled={readOnly}
                                    onChange={() => toggleAction(module, action.key)}
                                    className={checkboxClass}
                                  />
                                  {action.label}
                                </label>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-gray-400">勾选任一操作权限会自动开启该模块的「查看」；取消「查看」会同时收回该模块的全部操作权限</p>
          </div>
        )}
      </div>

      {roleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setRoleModal(null)}>
          <div role="dialog" aria-modal="true" className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-gray-100">
              <h4 className="text-base font-bold text-gray-900">{roleModal.mode === 'create' ? '新增角色' : '编辑角色'}</h4>
              <button type="button" onClick={() => setRoleModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer" aria-label="关闭">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  角色名称 <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  value={roleModal.name}
                  maxLength={20}
                  onChange={(e) => {
                    setRoleModal({ ...roleModal, name: e.target.value });
                    setRoleNameError('');
                  }}
                  placeholder="如：信息员"
                  className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#1890ff] ${
                    roleNameError ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {roleNameError && <p className="text-xs text-red-500 mt-1">{roleNameError}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">角色描述</label>
                <textarea
                  value={roleModal.description}
                  maxLength={60}
                  rows={3}
                  onChange={(e) => setRoleModal({ ...roleModal, description: e.target.value })}
                  placeholder="简要说明该角色的职责"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#1890ff] resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setRoleModal(null)}
                className="px-5 py-2 text-sm font-bold text-gray-700 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={submitRoleModal}
                className="px-6 py-2 text-sm font-bold text-white bg-[#1890ff] rounded hover:bg-[#1677d9] cursor-pointer"
              >
                {roleModal.mode === 'create' ? '确认新增' : '保存修改'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface Props {
  storageKey: string;
  fallbackStorageKey?: string;
  isGlobalScope?: boolean;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const InstitutionRolePermissionSection: React.FC<Props> = ({
  storageKey,
  fallbackStorageKey,
  isGlobalScope = false,
  showToast,
}) => {
  const [scope, setScope] = useState<RoleScope>('internal');

  const scopeTabs = (
    <div className="flex items-center gap-1 border-b border-gray-200">
      {ROLE_SCOPES.map((item) => {
        const isActive = scope === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => setScope(item.key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 -mb-px text-sm border-b-2 transition-colors cursor-pointer ${
              isActive ? 'border-[#1890ff] text-[#1890ff] font-bold' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200/80 shadow-2xs">
      {ROLE_SCOPES.map((item) => (
        <RolePermissionPanel
          key={item.key}
          catalog={item.catalog}
          hint={item.hint}
          storageKey={`${storageKey}${item.storageSuffix}`}
          fallbackStorageKey={fallbackStorageKey ? `${fallbackStorageKey}${item.storageSuffix}` : undefined}
          isGlobalScope={isGlobalScope}
          hidden={scope !== item.key}
          scopeTabs={scopeTabs}
          showToast={showToast}
        />
      ))}
    </div>
  );
};
