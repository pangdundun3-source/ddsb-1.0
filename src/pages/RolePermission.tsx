import React, { useState } from 'react';
import { Plus, Edit3, Lock, ChevronDown, ChevronUp, Check, Trash2, Info } from 'lucide-react';

interface RoleItem {
  id: number;
  name: string;
  isDefault: boolean;
  description?: string;
}

export const RolePermission: React.FC = () => {
  const [roles, setRoles] = useState<RoleItem[]>([
    { id: 1, name: '超级管理员', isDefault: true, description: '拥有系统所有模块与数据的全量控制权限' },
    { id: 2, name: '机构管理员', isDefault: true, description: '具备本机构及下属单位节点的全量管理权限' },
    { id: 3, name: '上报员', isDefault: true, description: '负责基础事件、信息与数据的填报与提交' },
    { id: 4, name: '审核员', isDefault: true, description: '负责上报信息的核查、归档与退回评估' },
    { id: 5, name: '运营管理员', isDefault: true, description: '负责业务数据运营分析与模板规则维护' },
    { id: 6, name: '临时审核员', isDefault: false, description: '专项任务临时审核角色，支持灵活配置与修改' }
  ]);

  const [selectedRole, setSelectedRole] = useState<RoleItem>(roles[0]);

  // Accordion open/close state
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    home: false,
    report: true,
    stats: false,
    audit: false,
    system: false
  });

  // State of checked permissions
  const [checkedPerms, setCheckedPerms] = useState<Record<string, boolean>>({
    'home_all': true,
    'report_all': true,
    'report_summary_all': true,
    'report_summary_view': true,
    'report_summary_add': true,
    'report_summary_edit': true,
    'report_summary_delete': true,
    'report_summary_export': true,
    'report_audit_all': true,
    'report_audit_view': true,
    'report_audit_approve': true,
    'report_audit_reject': true,
    'report_record_all': true,
    'report_record_view': true,
    'report_record_export': true,
    'stats_all': true,
    'audit_all': true,
    'system_all': true
  });

  const [selectAll, setSelectAll] = useState(true);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Modal for new role
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // Modal for editing custom role (e.g. 临时审核员)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [editRoleDesc, setEditRoleDesc] = useState('');

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleToggleCheck = (key: string) => {
    if (selectedRole.isDefault) return; // Readonly for system default roles
    setCheckedPerms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAllToggle = () => {
    if (selectedRole.isDefault) return; // Readonly for default roles
    const nextVal = !selectAll;
    setSelectAll(nextVal);
    const updated: Record<string, boolean> = {};
    Object.keys(checkedPerms).forEach(k => {
      updated[k] = nextVal;
    });
    setCheckedPerms(updated);
  };

  const handleSaveConfig = () => {
    if (selectedRole.isDefault) return;
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleReset = () => {
    if (selectedRole.isDefault) return;
    const resetObj: Record<string, boolean> = {};
    Object.keys(checkedPerms).forEach(k => {
      resetObj[k] = true;
    });
    setCheckedPerms(resetObj);
    setSelectAll(true);
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const newR: RoleItem = {
      id: Date.now(),
      name: newRoleName.trim(),
      isDefault: false,
      description: newRoleDesc.trim() || '自定义角色'
    };
    setRoles([...roles, newR]);
    setSelectedRole(newR);
    setNewRoleName('');
    setNewRoleDesc('');
    setIsModalOpen(false);
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

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">角色权限配置</h2>
        <p className="text-xs text-gray-400 mt-0.5">管理系统内的角色以及权限分配，默认角色不可修改，自定义/临时角色支持编辑与配置</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Side: Role List Panel */}
        <div className="w-full lg:w-80 bg-white rounded-lg border border-gray-200/80 shadow-2xs p-4 flex flex-col space-y-3 shrink-0">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <span className="text-sm font-bold text-gray-800">角色列表</span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1 bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold rounded shadow-2xs flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增角色</span>
            </button>
          </div>

          <div className="text-[11px] text-gray-400 flex items-center space-x-1">
            <Lock className="w-3 h-3 text-gray-400 shrink-0" />
            <span>系统默认角色无编辑按钮，仅供查看</span>
          </div>

          {/* Role Item List */}
          <div className="space-y-1.5 pt-1">
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
        <div className="flex-1 bg-white rounded-lg border border-gray-200/80 shadow-2xs p-5 flex flex-col justify-between space-y-4">
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
                  『<strong>{selectedRole.name}</strong>』为系统默认角色，权限配置已被固化保护，只供查看。如需个性化权限配置，请使用『临时审核员』或点击左侧『新增角色』。
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
              {/* Group 1: 首页 */}
              <div className="border border-gray-200/80 rounded-lg overflow-hidden">
                <div
                  onClick={() => toggleGroup('home')}
                  className="p-3 bg-gray-50/70 hover:bg-gray-100/70 flex items-center justify-between cursor-pointer font-bold text-gray-800"
                >
                  <label className="flex items-center space-x-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      disabled={selectedRole.isDefault}
                      checked={!!checkedPerms['home_all']}
                      onChange={() => handleToggleCheck('home_all')}
                      className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 disabled:opacity-60"
                    />
                    <span>首页</span>
                  </label>
                  {openGroups['home'] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {/* Group 2: 报送管理 */}
              <div className="border border-gray-200/80 rounded-lg overflow-hidden">
                <div
                  onClick={() => toggleGroup('report')}
                  className="p-3 bg-gray-50/70 hover:bg-gray-100/70 flex items-center justify-between cursor-pointer font-bold text-gray-800"
                >
                  <label className="flex items-center space-x-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      disabled={selectedRole.isDefault}
                      checked={!!checkedPerms['report_all']}
                      onChange={() => handleToggleCheck('report_all')}
                      className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 disabled:opacity-60"
                    />
                    <span>报送管理</span>
                  </label>
                  {openGroups['report'] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>

                {openGroups['report'] && (
                  <div className="p-4 bg-white space-y-4 divide-y divide-gray-100">
                    {/* Sub 1: 报送审核 */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 font-bold text-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={selectedRole.isDefault}
                          checked={!!checkedPerms['report_audit_all']}
                          onChange={() => handleToggleCheck('report_audit_all')}
                          className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 disabled:opacity-60"
                        />
                        <span>报送审核</span>
                      </label>
                      <div className="pl-6 flex flex-wrap gap-x-6 gap-y-2 text-gray-700">
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={selectedRole.isDefault}
                            checked={!!checkedPerms['report_audit_view']}
                            onChange={() => handleToggleCheck('report_audit_view')}
                            className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 disabled:opacity-60"
                          />
                          <span>查看</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={selectedRole.isDefault}
                            checked={!!checkedPerms['report_audit_approve']}
                            onChange={() => handleToggleCheck('report_audit_approve')}
                            className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 disabled:opacity-60"
                          />
                          <span>审核通过</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={selectedRole.isDefault}
                            checked={!!checkedPerms['report_audit_reject']}
                            onChange={() => handleToggleCheck('report_audit_reject')}
                            className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 disabled:opacity-60"
                          />
                          <span>审核退回</span>
                        </label>
                      </div>
                    </div>

                    {/* Sub 2: 速报汇总 */}
                    <div className="space-y-2 pt-3">
                      <label className="flex items-center space-x-2 font-bold text-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={selectedRole.isDefault}
                          checked={!!checkedPerms['report_summary_all']}
                          onChange={() => handleToggleCheck('report_summary_all')}
                          className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 disabled:opacity-60"
                        />
                        <span>速报汇总</span>
                      </label>
                      <div className="pl-6 flex flex-wrap gap-x-6 gap-y-2 text-gray-700">
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={selectedRole.isDefault}
                            checked={!!checkedPerms['report_summary_view']}
                            onChange={() => handleToggleCheck('report_summary_view')}
                            className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 disabled:opacity-60"
                          />
                          <span>查看</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={selectedRole.isDefault}
                            checked={!!checkedPerms['report_summary_add']}
                            onChange={() => handleToggleCheck('report_summary_add')}
                            className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 disabled:opacity-60"
                          />
                          <span>新增</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={selectedRole.isDefault}
                            checked={!!checkedPerms['report_summary_edit']}
                            onChange={() => handleToggleCheck('report_summary_edit')}
                            className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 disabled:opacity-60"
                          />
                          <span>编辑</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={selectedRole.isDefault}
                            checked={!!checkedPerms['report_summary_delete']}
                            onChange={() => handleToggleCheck('report_summary_delete')}
                            className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 disabled:opacity-60"
                          />
                          <span>删除</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={selectedRole.isDefault}
                            checked={!!checkedPerms['report_summary_export']}
                            onChange={() => handleToggleCheck('report_summary_export')}
                            className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 disabled:opacity-60"
                          />
                          <span>导出</span>
                        </label>
                      </div>
                    </div>

                    {/* Sub 3: 不良信息库 */}
                    <div className="space-y-2 pt-3">
                      <label className="flex items-center space-x-2 font-bold text-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={selectedRole.isDefault}
                          checked={!!checkedPerms['negative_info_all']}
                          onChange={() => handleToggleCheck('negative_info_all')}
                          className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 disabled:opacity-60"
                        />
                        <span>不良信息库</span>
                      </label>
                      <div className="pl-6 flex flex-wrap gap-x-6 gap-y-2 text-gray-700">
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={selectedRole.isDefault}
                            checked={!!checkedPerms['negative_info_view']}
                            onChange={() => handleToggleCheck('negative_info_view')}
                            className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 disabled:opacity-60"
                          />
                          <span>查看</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={selectedRole.isDefault}
                            checked={!!checkedPerms['negative_info_export']}
                            onChange={() => handleToggleCheck('negative_info_export')}
                            className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 disabled:opacity-60"
                          />
                          <span>导出</span>
                        </label>
                      </div>
                    </div>

                    {/* Sub 4: 审核记录 */}
                    <div className="space-y-2 pt-3">
                      <label className="flex items-center space-x-2 font-bold text-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={selectedRole.isDefault}
                          checked={!!checkedPerms['report_record_all']}
                          onChange={() => handleToggleCheck('report_record_all')}
                          className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 disabled:opacity-60"
                        />
                        <span>审核记录</span>
                      </label>
                      <div className="pl-6 flex flex-wrap gap-x-6 gap-y-2 text-gray-700">
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={selectedRole.isDefault}
                            checked={!!checkedPerms['report_record_view']}
                            onChange={() => handleToggleCheck('report_record_view')}
                            className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 disabled:opacity-60"
                          />
                          <span>查看</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={selectedRole.isDefault}
                            checked={!!checkedPerms['report_record_export']}
                            onChange={() => handleToggleCheck('report_record_export')}
                            className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 disabled:opacity-60"
                          />
                          <span>导出</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Group 3: 统计管理 */}
              <div className="border border-gray-200/80 rounded-lg overflow-hidden">
                <div
                  onClick={() => toggleGroup('stats')}
                  className="p-3 bg-gray-50/70 hover:bg-gray-100/70 flex items-center justify-between cursor-pointer font-bold text-gray-800"
                >
                  <label className="flex items-center space-x-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      disabled={selectedRole.isDefault}
                      checked={!!checkedPerms['stats_all']}
                      onChange={() => handleToggleCheck('stats_all')}
                      className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 disabled:opacity-60"
                    />
                    <span>统计管理</span>
                  </label>
                  {openGroups['stats'] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {/* Group 4: 考核管理 */}
              <div className="border border-gray-200/80 rounded-lg overflow-hidden">
                <div
                  onClick={() => toggleGroup('audit')}
                  className="p-3 bg-gray-50/70 hover:bg-gray-100/70 flex items-center justify-between cursor-pointer font-bold text-gray-800"
                >
                  <label className="flex items-center space-x-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      disabled={selectedRole.isDefault}
                      checked={!!checkedPerms['audit_all']}
                      onChange={() => handleToggleCheck('audit_all')}
                      className="rounded text-[#1E5ABB] focus:ring-[#1E5ABB] w-3.5 h-3.5 disabled:opacity-60"
                    />
                    <span>考核管理</span>
                  </label>
                  {openGroups['audit'] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {/* Group 5: 系统管理 */}
              <div className="border border-gray-200/80 rounded-lg overflow-hidden">
                <div
                  onClick={() => toggleGroup('system')}
                  className="p-3 bg-gray-50/70 hover:bg-gray-100/70 flex items-center justify-between cursor-pointer font-bold text-gray-800"
                >
                  <label className="flex items-center space-x-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      disabled={selectedRole.isDefault}
                      checked={!!checkedPerms['system_all']}
                      onChange={() => handleToggleCheck('system_all')}
                      className="rounded text-[#1E5ABB] focus:ring-[#1E5ABB] w-3.5 h-3.5 disabled:opacity-60"
                    />
                    <span>系统管理</span>
                  </label>
                  {openGroups['system'] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
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

      {/* Add New Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-800">新增自定义角色</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRole} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">角色名称 *</label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="如: 临时审核员 / 专项监管员"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">角色描述</label>
                <textarea
                  rows={2}
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="请输入该角色的功能职责说明"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1E5ABB] hover:bg-[#134092] text-white rounded font-bold"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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


