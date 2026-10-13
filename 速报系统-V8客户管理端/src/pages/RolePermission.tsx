import React, { useState } from 'react';
import { Edit3, Lock, ChevronDown, ChevronUp, Check, Trash2, Info, X } from 'lucide-react';

interface RoleItem {
  id: number;
  name: string;
  isDefault: boolean;
  description?: string;
}

interface PermissionAction {
  key: string;
  label: string;
}

interface PermissionSubModule {
  id: string;
  label: string;
  section?: string;
  actions: PermissionAction[];
}

interface PermissionGroup {
  id: string;
  label: string;
  children: PermissionSubModule[];
}

/** 外部角色权限：对应审核上报 PC 端（H5 同步）的功能点 */
const permissionGroups: PermissionGroup[] = [
  {
    id: 'home',
    label: '首页',
    children: [
      {
        id: 'home_dashboard',
        label: '首页工作台',
        actions: [
          { key: 'view', label: '查看工作台' },
          { key: 'todo', label: '查看待办' },
          { key: 'notice', label: '查看公告通知' },
          { key: 'detail', label: '跳转详情' },
        ],
      },
    ],
  },
  {
    id: 'report',
    label: '报送管理',
    children: [
      {
        id: 'report_mine',
        label: '我的报送',
        actions: [
          { key: 'view', label: '查看' },
          { key: 'detail', label: '查看详情' },
          { key: 'add', label: '新建速报' },
          { key: 'draft', label: '编辑草稿' },
          { key: 'resubmit', label: '修改补充并重新提交' },
          { key: 'withdraw', label: '撤回报送' },
          { key: 'delete', label: '删除报送' },
        ],
      },
      {
        id: 'report_records',
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
        label: '报送统计',
        actions: [
          { key: 'view', label: '查看' },
          { key: 'export', label: '导出统计报表' },
        ],
      },
    ],
  },
  {
    id: 'audit',
    label: '审核管理',
    children: [
      {
        id: 'audit_mine',
        label: '我的审核',
        actions: [
          { key: 'view', label: '查看' },
          { key: 'detail', label: '查看详情' },
          { key: 'approve', label: '审核通过' },
          { key: 'reject', label: '审核驳回' },
          { key: 'score', label: '终审评分' },
          { key: 'batch', label: '批量审核' },
          { key: 'flow', label: '查看流转记录' },
        ],
      },
      {
        id: 'audit_records',
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
        label: '审核统计',
        actions: [
          { key: 'view', label: '查看' },
          { key: 'export', label: '导出统计报表' },
        ],
      },
    ],
  },
  {
    id: 'message',
    label: '消息中心',
    children: [
      {
        id: 'message_center',
        label: '消息通知',
        actions: [
          { key: 'view', label: '查看消息' },
          { key: 'search', label: '搜索消息' },
          { key: 'read', label: '标为已读' },
        ],
      },
    ],
  },
  {
    id: 'personal',
    label: '个人中心',
    children: [
      {
        id: 'personal_info',
        label: '个人信息',
        actions: [
          { key: 'view', label: '查看资料' },
          { key: 'phone', label: '更换绑定手机号' },
          { key: 'logout', label: '退出登录' },
        ],
      },
    ],
  },
];

/** 系统默认角色固定拥有的功能分组 */
const DEFAULT_ROLE_GROUPS: Record<string, string[]> = {
  上报员: ['home', 'report', 'message', 'personal'],
  审核员: ['home', 'audit', 'message', 'personal'],
};

const createRolePresetPermissions = (roleName: string) => {
  const groupIds = DEFAULT_ROLE_GROUPS[roleName] || [];
  const perms: Record<string, boolean> = {};
  permissionGroups.forEach((group) => {
    const enabled = groupIds.includes(group.id);
    perms[`${group.id}_all`] = enabled;
    group.children.forEach((child) => {
      perms[`${child.id}_all`] = enabled;
      child.actions.forEach((action) => {
        perms[`${child.id}_${action.key}`] = enabled;
      });
    });
  });
  return perms;
};

const getAllPermissionKeys = () =>
  permissionGroups.flatMap((group) => [
    `${group.id}_all`,
    ...group.children.flatMap((child) => [
      `${child.id}_all`,
      ...child.actions.map((action) => `${child.id}_${action.key}`),
    ]),
  ]);

const createCheckedPermissions = (checked: boolean) =>
  getAllPermissionKeys().reduce<Record<string, boolean>>((acc, key) => {
    acc[key] = checked;
    return acc;
  }, {});

export const RolePermission: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const [roles, setRoles] = useState<RoleItem[]>([
    { id: 3, name: '上报员', isDefault: true, description: '负责基础事件、信息与数据的填报与提交' },
    { id: 4, name: '审核员', isDefault: true, description: '负责上报信息的核查、归档与退回评估' }
  ]);

  const [selectedRole, setSelectedRole] = useState<RoleItem>(roles[0]);

  // Accordion open/close state
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    home: true,
    report: true,
    audit: true,
    message: false,
    personal: false
  });

  // State of checked permissions
  const [checkedPerms, setCheckedPerms] = useState<Record<string, boolean>>(() => createCheckedPermissions(true));
  const viewPerms = selectedRole.isDefault ? createRolePresetPermissions(selectedRole.name) : checkedPerms;

  const [selectAll, setSelectAll] = useState(true);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const [newRoleName, setNewRoleName] = useState('');
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [inlineRoleName, setInlineRoleName] = useState('');
  const [toast, setToast] = useState('');

  // Modal for editing custom role (e.g. 临时审核员)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [editRoleDesc, setEditRoleDesc] = useState('');

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const syncParentCheckState = (perms: Record<string, boolean>) => {
    permissionGroups.forEach((group) => {
      group.children.forEach((child) => {
        const actionKeys = child.actions.map((action) => `${child.id}_${action.key}`);
        perms[`${child.id}_all`] = actionKeys.every((actionKey) => !!perms[actionKey]);
      });
      perms[`${group.id}_all`] = group.children.every((child) => !!perms[`${child.id}_all`]);
    });
    return perms;
  };

  const handleToggleCheck = (key: string) => {
    if (selectedRole.isDefault) return; // Readonly for system default roles
    setCheckedPerms(prev => {
      const updated = { ...prev };
      const nextVal = !updated[key];
      updated[key] = nextVal;

      const group = permissionGroups.find((item) => `${item.id}_all` === key);
      if (group) {
        group.children.forEach((child) => {
          updated[`${child.id}_all`] = nextVal;
          child.actions.forEach((action) => {
            updated[`${child.id}_${action.key}`] = nextVal;
          });
        });
      }

      permissionGroups.forEach((item) => {
        item.children.forEach((child) => {
          if (`${child.id}_all` === key) {
            child.actions.forEach((action) => {
              updated[`${child.id}_${action.key}`] = nextVal;
            });
          }
        });
      });

      const synced = syncParentCheckState(updated);
      setSelectAll(getAllPermissionKeys().every((permKey) => !!synced[permKey]));
      return synced;
    });
  };

  const handleSelectAllToggle = () => {
    if (selectedRole.isDefault) return; // Readonly for default roles
    const nextVal = !selectAll;
    setSelectAll(nextVal);
    setCheckedPerms(createCheckedPermissions(nextVal));
  };

  const handleSaveConfig = () => {
    if (selectedRole.isDefault) return;
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleReset = () => {
    if (selectedRole.isDefault) return;
    setCheckedPerms(createCheckedPermissions(true));
    setSelectAll(true);
  };

  const triggerToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const createRoleByName = (rawName: string) => {
    const name = rawName.trim();
    if (!name) return false;
    if (roles.some((role) => role.name === name)) {
      triggerToast('已存在同名角色');
      return false;
    }
    const newR: RoleItem = {
      id: Date.now(),
      name,
      isDefault: false,
      description: '自定义角色'
    };
    setRoles((prev) => [...prev, newR]);
    setSelectedRole(newR);
    triggerToast(`已新增角色【${name}】`);
    return true;
  };

  const handleAddRole = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (createRoleByName(newRoleName)) {
      setNewRoleName('');
      setIsAddingRole(false);
      setInlineRoleName('');
      return;
    }
    if (!newRoleName.trim()) {
      setIsAddingRole(true);
      setInlineRoleName('');
    }
  };

  const confirmInlineRole = () => {
    if (createRoleByName(inlineRoleName) || !inlineRoleName.trim()) {
      setIsAddingRole(false);
      setInlineRoleName('');
    }
  };

  const cancelInlineRole = () => {
    setIsAddingRole(false);
    setInlineRoleName('');
  };

  const handleOpenEditModal = (role: RoleItem) => {
    setEditingRole(role);
    setEditRoleName(role.name);
    setEditRoleDesc(role.description || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEditedRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole || !editRoleName.trim()) return;

    const updatedName = editRoleName.trim();
    const updatedDesc = editRoleDesc.trim();

    setRoles(prev =>
      prev.map(r => (r.id === editingRole.id ? { ...r, name: updatedName, description: updatedDesc } : r))
    );

    if (selectedRole.id === editingRole.id) {
      setSelectedRole(prev => ({ ...prev, name: updatedName, description: updatedDesc }));
    }

    setIsEditModalOpen(false);
    setEditingRole(null);
  };

  const handleDeleteRole = (roleId: number) => {
    if (confirm('确定要删除该角色吗？')) {
      const remaining = roles.filter(r => r.id !== roleId);
      setRoles(remaining);
      if (selectedRole.id === roleId && remaining.length > 0) {
        setSelectedRole(remaining[0]);
      }
      setIsEditModalOpen(false);
    }
  };

  const renderSubModule = (child: PermissionSubModule, extraClassName = '') => (
    <div key={child.id} className={`space-y-2 ${extraClassName}`}>
      <label className="flex items-center space-x-2 font-bold text-gray-800 cursor-pointer">
        <input
          type="checkbox"
          disabled={selectedRole.isDefault}
          checked={!!viewPerms[`${child.id}_all`]}
          onChange={() => handleToggleCheck(`${child.id}_all`)}
          className="rounded text-[#1E5ABB] focus:ring-[#1E5ABB] w-3.5 h-3.5 disabled:opacity-60"
        />
        <span>{child.label}</span>
      </label>
      <div className="pl-6 flex flex-wrap gap-x-6 gap-y-2 text-gray-700">
        {child.actions.map((action) => {
          const permKey = `${child.id}_${action.key}`;
          return (
            <label key={permKey} className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                disabled={selectedRole.isDefault}
                checked={!!viewPerms[permKey]}
                onChange={() => handleToggleCheck(permKey)}
                className="rounded text-[#1E5ABB] focus:ring-[#1E5ABB] w-3.5 h-3.5 disabled:opacity-60"
              />
              <span>{action.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  const renderGroupedChildren = (children: PermissionSubModule[]) => {
    const nodes: React.ReactNode[] = [];
    let index = 0;
    while (index < children.length) {
      const child = children[index];
      if (child.section) {
        const section = child.section;
        const bundled: PermissionSubModule[] = [];
        while (index < children.length && children[index].section === section) {
          bundled.push(children[index]);
          index += 1;
        }
        nodes.push(
          <div key={section} className={`space-y-3 ${nodes.length > 0 ? 'pt-3' : ''}`}>
            <div className="font-bold text-gray-800">{section}</div>
            <div className="pl-3 space-y-3 border-l-2 border-blue-100">
              {bundled.map(item => renderSubModule(item))}
            </div>
          </div>
        );
      } else {
        nodes.push(renderSubModule(child, nodes.length > 0 ? 'pt-3' : ''));
        index += 1;
      }
    }
    return nodes;
  };

  return (
    <div className={embedded ? 'h-full min-h-[680px] relative' : 'space-y-4'}>
      {toast && (
        <div className={`px-3 py-2 rounded-lg bg-[#1E5ABB] text-white text-xs font-bold ${embedded ? 'absolute left-4 right-4 top-3 z-20' : ''}`}>
          {toast}
        </div>
      )}
      {!embedded && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">外部角色管理</h2>
          <p className="text-xs text-gray-400 mt-0.5">外部人员在审核上报 PC / H5 端的角色与功能权限，上报员、审核员为系统默认角色，不可修改</p>
        </div>
      )}

      <div className={embedded ? 'flex h-full min-h-0' : 'flex flex-col lg:flex-row gap-5'}>
        {/* Left Side: Role List Panel */}
        <div className={embedded
          ? 'w-[260px] shrink-0 border-r border-slate-100 p-3 flex flex-col gap-3 min-h-0 bg-slate-50/30'
          : 'w-full lg:w-80 bg-white rounded-lg border border-gray-200/80 shadow-2xs p-4 flex flex-col space-y-3 shrink-0'}>
          <div className="border-b border-gray-100 pb-2.5">
            <div className="text-xs font-bold text-gray-800">外部角色</div>
            <div className="mt-1 text-[11px] text-gray-400 flex items-center space-x-1">
              <Lock className="w-3 h-3 text-gray-400 shrink-0" />
              <span>固定为系统默认角色，权限仅供查看</span>
            </div>
          </div>

          {/* Role Item List */}
          <div className="space-y-1.5 pt-1 flex-1 min-h-0 overflow-y-auto">
            {isAddingRole && (
              <div className="flex items-center gap-1 px-1 py-1">
                <input
                  autoFocus
                  value={inlineRoleName}
                  onChange={(e) => setInlineRoleName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      confirmInlineRole();
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      cancelInlineRole();
                    }
                  }}
                  placeholder="输入角色名称，回车保存"
                  className="flex-1 min-w-0 px-2 py-1.5 text-xs border border-[#1E5ABB] rounded bg-white text-gray-800 font-normal focus:outline-none"
                />
                <button
                  type="button"
                  title="保存"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmInlineRole();
                  }}
                  className="p-1 rounded text-[#1E5ABB] hover:bg-blue-50 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="取消"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelInlineRole();
                  }}
                  className="p-1 rounded text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {roles.map((role) => {
              const isSelected = selectedRole.id === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-200 text-[#1E5ABB] font-bold'
                      : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 min-w-0 pr-1">
                    <span className="text-xs truncate">{role.name}</span>
                    {role.isDefault ? (
                      <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.2 text-[10px] bg-gray-100 text-gray-500 rounded shrink-0">
                        <Lock className="w-2.5 h-2.5" />
                        <span>默认</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.2 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded shrink-0 font-medium">
                        可修改
                      </span>
                    )}
                  </div>

                  {/* ONLY show Edit Button for Non-Default / Custom Roles (e.g. 临时审核员) */}
                  {!role.isDefault ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRole(role);
                        handleOpenEditModal(role);
                      }}
                      className="px-2 py-1 text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-bold flex items-center space-x-1 cursor-pointer transition-colors shrink-0"
                      title="编辑修改角色名称与属性"
                    >
                      <Edit3 className="w-3 h-3 text-blue-600" />
                      <span>编辑</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-gray-400 font-normal px-1 shrink-0">只读</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Permissions Configuration Panel */}
        <div className={embedded
          ? 'flex-1 min-w-0 p-5 flex flex-col justify-between space-y-4'
          : 'flex-1 bg-white rounded-lg border border-gray-200/80 shadow-2xs p-5 flex flex-col justify-between space-y-4'}>
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-gray-800">
                    权限配置 - <span className="text-[#1E5ABB]">{selectedRole.name}</span>
                  </h3>
                  {selectedRole.isDefault ? (
                    <span className="px-2 py-0.5 text-[11px] bg-gray-100 text-gray-600 rounded font-medium flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>只读模式</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-bold flex items-center space-x-1">
                      <Edit3 className="w-3 h-3" />
                      <span>可编辑</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedRole.description || '管理该角色在系统中的操作权限'}
                </p>
              </div>

              {!selectedRole.isDefault && (
                <label className="flex items-center space-x-1.5 text-xs text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAllToggle}
                    className="rounded text-[#1E5ABB] focus:ring-[#1E5ABB] w-3.5 h-3.5"
                  />
                  <span className="font-bold">全选所有权限</span>
                </label>
              )}
            </div>

            {/* Readonly Alert Banner for System Default Roles */}
            {selectedRole.isDefault ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 flex items-center space-x-2">
                <Info className="w-4 h-4 text-gray-400 shrink-0" />
                <span>
                  『<strong>{selectedRole.name}</strong>』为系统默认角色，以下为该角色在审核上报 PC 端的功能权限，已固化保护，只供查看。
                </span>
              </div>
            ) : (
              <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-3 text-xs text-blue-900 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Edit3 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    正在修改『<strong>{selectedRole.name}</strong>』的权限。您可以勾选下方菜单项并保存修改。
                  </span>
                </div>
                <button
                  onClick={() => handleOpenEditModal(selectedRole)}
                  className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 font-bold rounded border border-blue-200 text-xs cursor-pointer shrink-0 transition-colors"
                >
                  修改角色名称
                </button>
              </div>
            )}

            {/* Accordion List */}
            <div className={`space-y-3 text-xs ${selectedRole.isDefault ? 'opacity-85' : ''}`}>
              {permissionGroups.map((group) => (
                <div key={group.id} className="border border-gray-200/80 rounded-lg overflow-hidden">
                  <div
                    onClick={() => toggleGroup(group.id)}
                    className="p-3 bg-gray-50/70 hover:bg-gray-100/70 flex items-center justify-between cursor-pointer font-bold text-gray-800"
                  >
                    <label className="flex items-center space-x-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        disabled={selectedRole.isDefault}
                        checked={!!viewPerms[`${group.id}_all`]}
                        onChange={() => handleToggleCheck(`${group.id}_all`)}
                        className="rounded text-[#1E5ABB] focus:ring-[#1E5ABB] w-3.5 h-3.5 disabled:opacity-60"
                      />
                      <span>{group.label}</span>
                    </label>
                    {openGroups[group.id] ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {openGroups[group.id] && (
                    <div className="p-4 bg-white space-y-4 divide-y divide-gray-100">
                      {renderGroupedChildren(group.children)}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>

          {/* Bottom Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              {showSavedToast && (
                <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
                  <Check className="w-4 h-4" />
                  <span>配置已成功保存！</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {!selectedRole.isDefault ? (
                <>
                  <button
                    onClick={handleReset}
                    className="px-5 py-1.5 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50 font-medium cursor-pointer"
                  >
                    重置
                  </button>
                  <button
                    onClick={handleSaveConfig}
                    className="px-5 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold rounded shadow-2xs cursor-pointer"
                  >
                    保存配置
                  </button>
                </>
              ) : (
                <span className="text-xs text-gray-400 italic font-medium">默认角色权限只可读取查看</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Custom Role Modal (e.g. 临时审核员) */}
      {isEditModalOpen && editingRole && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-800">编辑角色信息 - {editingRole.name}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedRole} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">角色名称 *</label>
                <input
                  type="text"
                  required
                  value={editRoleName}
                  onChange={(e) => setEditRoleName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB] font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">角色描述</label>
                <textarea
                  rows={2}
                  value={editRoleDesc}
                  onChange={(e) => setEditRoleDesc(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handleDeleteRole(editingRole.id)}
                  className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded border border-red-200 font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>删除此角色</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded font-bold cursor-pointer"
                  >
                    保存修改
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
