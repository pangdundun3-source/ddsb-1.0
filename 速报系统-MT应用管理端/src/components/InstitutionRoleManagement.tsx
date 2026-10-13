import React, { useEffect, useMemo, useState } from 'react';
import { CopyIconButton } from './common/CopyIconButton';

interface PermissionItem {
  code: string;
  name: string;
  desc: string;
  /** 授予后在客户管理端前台可见的菜单 */
  menu?: string;
}

interface PermissionModule {
  code: string;
  name: string;
  desc: string;
  permissions: PermissionItem[];
}

interface MenuNode {
  code: string;
  name: string;
  alwaysVisible?: boolean;
  children?: MenuNode[];
}

type RoleScope = 'PC' | 'H5' | '通用';

interface OrgRole {
  id: string;
  code: string;
  name: string;
  desc: string;
  builtIn: boolean;
  permissions: string[];
  enabled?: boolean;
  scope?: RoleScope;
  sort?: number;
}

interface NewRoleDraft {
  name: string;
  code: string;
  desc: string;
  enabled: boolean;
  scope: RoleScope;
  sort: number;
}

const p = (code: string, name: string, desc: string, menu?: string): PermissionItem => ({ code, name, desc, menu });

/** 对应速豹客户管理端（V8）的一级导航与功能点 */
const MODULES: PermissionModule[] = [
  {
    code: 'V8_HOME',
    name: '首页',
    desc: '机构工作台、待办提醒与业务概览',
    permissions: [
      p('V8_HOME_VIEW', '查看首页工作台', '查看待办、业务概览与快捷入口', 'V8_HOME'),
      p('V8_HOME_PORTAL', '切换应用门户', '从首页进入应用门户切换系统', 'V8_HOME'),
    ],
  },
  {
    code: 'V8_AUDIT',
    name: '审核管理',
    desc: '我的审核、审核记录与审核统计',
    permissions: [
      p('V8_AUDIT_VIEW', '查看待审线索', '查看分配给本人的待审批速报线索', 'V8_AUDIT_MINE'),
      p('V8_AUDIT_DECIDE', '审核通过 / 驳回', '对线索执行通过、驳回并打分', 'V8_AUDIT_MINE'),
      p('V8_AUDIT_BATCH', '批量审核', '一次处理多条待审线索'),
      p('V8_AUDIT_RECORD_VIEW', '查看审核记录', '检索已审核台账与审核详情', 'V8_AUDIT_RECORDS'),
      p('V8_AUDIT_STATS_VIEW', '查看审核统计', '查看审核趋势与处理率', 'V8_AUDIT_STATS'),
      p('V8_AUDIT_EXPORT', '导出审核数据', '导出审核记录与统计报表'),
    ],
  },
  {
    code: 'V8_WAREHOUSE',
    name: '数据仓库',
    desc: '不良信息库与仓库分类、可见范围、迁移管理',
    permissions: [
      p('V8_NEGATIVE_VIEW', '查看不良信息库', '按仓库查看已审核通过的线索', 'V8_WAREHOUSE_NEGATIVE'),
      p('V8_NEGATIVE_ADD', '线索入库', '将审核通过的线索加入指定仓库', 'V8_WAREHOUSE_NEGATIVE'),
      p('V8_NEGATIVE_EDIT', '编辑 / 移除入库线索', '修改入库线索信息或移出仓库'),
      p('V8_NEGATIVE_EXPORT', '导出仓库数据', '导出仓库内线索明细'),
      p('V8_WAREHOUSE_MANAGE', '仓库分类与可见范围', '新建仓库、调整分类与可见范围', 'V8_WAREHOUSE_MANAGE'),
      p('V8_WAREHOUSE_MIGRATE', '仓库数据迁移', '在仓库之间迁移线索数据', 'V8_WAREHOUSE_MANAGE'),
    ],
  },
  {
    code: 'V8_STATISTICS',
    name: '统计管理',
    desc: '上报、审核、采纳等多维统计报表',
    permissions: [
      p('V8_STAT_VIEW', '查看统计报表', '查看机构与人员的多维统计', 'V8_STATISTICS'),
      p('V8_STAT_EXPORT', '导出统计报表', '导出统计数据与图表'),
    ],
  },
  {
    code: 'V8_EVALUATION',
    name: '考核管理',
    desc: '人员考核结果、考核规则与排名',
    permissions: [
      p('V8_EVAL_VIEW', '查看考核结果', '查看考核排名与得分明细', 'V8_EVALUATION'),
      p('V8_EVAL_CONFIG', '考核规则配置', '设置考核周期、指标与权重'),
      p('V8_EVAL_EXPORT', '导出考核结果', '导出考核排名与明细'),
    ],
  },
  {
    code: 'V8_NOTICE',
    name: '公告管理',
    desc: '面向上报员、审核员的公告通知',
    permissions: [
      p('V8_NOTICE_VIEW', '查看公告', '查看已发布与草稿公告', 'V8_NOTICE'),
      p('V8_NOTICE_PUBLISH', '发布公告', '新建并发布公告通知'),
      p('V8_NOTICE_EDIT', '编辑 / 撤回公告', '修改、置顶或撤回已发布公告'),
    ],
  },
  {
    code: 'V8_CONTACTS',
    name: '外部联系人',
    desc: '外部用户、外部组织、外部角色与人员分组',
    permissions: [
      p('V8_CONTACT_USER_VIEW', '查看外部用户数据', '查看外部上报员、审核员名单', 'V8_CONTACT_USER'),
      p('V8_CONTACT_USER_EDIT', '邀请 / 编辑外部用户', '邀请注册、编辑或停用外部用户', 'V8_CONTACT_USER'),
      p('V8_CONTACT_ORG_MANAGE', '外部组织管理', '维护外部组织架构与成员', 'V8_CONTACT_ORG'),
      p('V8_CONTACT_ROLE_MANAGE', '外部角色管理', '配置外部角色及其 PC / H5 功能权限', 'V8_CONTACT_ROLE'),
      p('V8_CONTACT_GROUP_MANAGE', '人员分组管理', '维护人员分组与分组成员', 'V8_CONTACT_GROUP'),
    ],
  },
  {
    code: 'V8_SYSTEM',
    name: '系统管理',
    desc: '模板、审核流程、打分规则、字典等业务配置',
    permissions: [
      p('V8_SYS_TEMPLATE', '模板配置', '报送 / 激活模版与动态表单', 'V8_SYS_TEMPLATE'),
      p('V8_SYS_AUDIT_FLOW', '审核流程配置', '多级流转节点与审批链路', 'V8_SYS_AUDIT_FLOW'),
      p('V8_SYS_AUDIT_SCORE', '审核打分规则', '五级打分标准与评分规则', 'V8_SYS_AUDIT_SCORE'),
      p('V8_SYS_DICT', '数据字典管理', '驳回原由 / 信息分类 / 来源渠道', 'V8_SYS_DICT'),
      p('V8_SYS_INVITE_FIELDS', '邀请注册字段', '上报员 / 审核员邀请注册填写项', 'V8_SYS_INVITE_FIELDS'),
      p('V8_SYS_VALUE_ADDED', '增值业务申请', '扩展服务能力与业务开通', 'V8_SYS_VALUE_ADDED'),
    ],
  },
];

const MENU_TREE: MenuNode[] = [
  { code: 'V8_HOME', name: '首页' },
  {
    code: 'V8_AUDIT',
    name: '审核管理',
    children: [
      { code: 'V8_AUDIT_MINE', name: '我的审核' },
      { code: 'V8_AUDIT_RECORDS', name: '审核记录' },
      { code: 'V8_AUDIT_STATS', name: '审核统计' },
    ],
  },
  {
    code: 'V8_WAREHOUSE',
    name: '数据仓库',
    children: [
      { code: 'V8_WAREHOUSE_NEGATIVE', name: '不良信息库' },
      { code: 'V8_WAREHOUSE_MANAGE', name: '仓库管理' },
    ],
  },
  { code: 'V8_STATISTICS', name: '统计管理' },
  { code: 'V8_EVALUATION', name: '考核管理' },
  { code: 'V8_NOTICE', name: '公告管理' },
  {
    code: 'V8_CONTACTS',
    name: '外部联系人',
    children: [
      { code: 'V8_CONTACT_USER', name: '外部用户数据' },
      { code: 'V8_CONTACT_ORG', name: '外部组织管理' },
      { code: 'V8_CONTACT_ROLE', name: '外部角色管理' },
      { code: 'V8_CONTACT_GROUP', name: '人员分组管理' },
    ],
  },
  {
    code: 'V8_SYSTEM',
    name: '系统管理',
    children: [
      { code: 'V8_SYS_TEMPLATE', name: '模板配置' },
      { code: 'V8_SYS_AUDIT_FLOW', name: '审核流程配置' },
      { code: 'V8_SYS_AUDIT_SCORE', name: '审核打分规则' },
      { code: 'V8_SYS_DICT', name: '数据字典管理' },
      { code: 'V8_SYS_INVITE_FIELDS', name: '邀请注册字段' },
      { code: 'V8_SYS_VALUE_ADDED', name: '增值业务申请' },
    ],
  },
];

const ALL_PERMISSIONS = MODULES.flatMap((m) => m.permissions.map((perm) => perm.code));
const VIEW_PERMISSIONS = ALL_PERMISSIONS.filter((code) => code.endsWith('_VIEW'));
const modulePermissions = (...codes: string[]) =>
  MODULES.filter((m) => codes.includes(m.code)).flatMap((m) => m.permissions.map((perm) => perm.code));

const BUILT_IN_ROLES: OrgRole[] = [
  {
    id: 'r_org_admin',
    code: 'ROLE_ORG_ADMIN',
    name: '机构管理员（最高权限）',
    desc: '机构最高权限，拥有客户管理端全部功能菜单与操作权限',
    builtIn: true,
    permissions: ALL_PERMISSIONS,
  },
  {
    id: 'r_audit_admin',
    code: 'ROLE_AUDIT_ADMIN',
    name: '审核管理员',
    desc: '负责速报线索审核、审核统计查看与考核管理',
    builtIn: true,
    permissions: [
      ...modulePermissions('V8_HOME', 'V8_AUDIT', 'V8_STATISTICS', 'V8_EVALUATION'),
      'V8_NEGATIVE_VIEW',
      'V8_NOTICE_VIEW',
      'V8_CONTACT_USER_VIEW',
    ],
  },
  {
    id: 'r_data_admin',
    code: 'ROLE_DATA_ADMIN',
    name: '数据管理员',
    desc: '负责数据仓库维护、统计导出与公告发布',
    builtIn: true,
    permissions: [...modulePermissions('V8_HOME', 'V8_WAREHOUSE', 'V8_STATISTICS', 'V8_NOTICE'), 'V8_AUDIT_VIEW', 'V8_AUDIT_RECORD_VIEW'],
  },
  {
    id: 'r_readonly',
    code: 'ROLE_READONLY_VIEWER',
    name: '只读观察员',
    desc: '仅可查看各模块数据，不具备任何新增、修改或导出权限',
    builtIn: true,
    permissions: VIEW_PERMISSIONS,
  },
];

const storageKey = (institutionName: string) => `mt_org_roles_${institutionName}`;

const readCustomRoles = (institutionName: string): OrgRole[] => {
  try {
    const raw = localStorage.getItem(storageKey(institutionName));
    return raw ? (JSON.parse(raw) as OrgRole[]) : [];
  } catch {
    return [];
  }
};

const CheckIcon: React.FC<{ checked: boolean; partial?: boolean; disabled?: boolean }> = ({ checked, partial, disabled }) => (
  <span
    className={`material-symbols-outlined text-[20px] ${
      checked || partial ? (disabled ? 'text-indigo-300' : 'text-indigo-600') : 'text-gray-300'
    }`}
  >
    {checked ? 'check_box' : partial ? 'indeterminate_check_box' : 'check_box_outline_blank'}
  </span>
);

interface Props {
  institutionName: string;
  showToast: (message: string, type?: 'success' | 'warning') => void;
}

export const InstitutionRoleManagement: React.FC<Props> = ({ institutionName, showToast }) => {
  const [customRoles, setCustomRoles] = useState<OrgRole[]>(() => readCustomRoles(institutionName));
  const [selectedId, setSelectedId] = useState(BUILT_IN_ROLES[0].id);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    localStorage.setItem(storageKey(institutionName), JSON.stringify(customRoles));
  }, [customRoles, institutionName]);

  const roles = useMemo(
    () => [...BUILT_IN_ROLES, ...[...customRoles].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))],
    [customRoles]
  );
  const role = roles.find((r) => r.id === selectedId) ?? roles[0];
  const readOnly = role.builtIn;
  const granted = useMemo(() => new Set(role.permissions), [role]);

  const updatePermissions = (next: string[]) => {
    setCustomRoles((prev) => prev.map((r) => (r.id === role.id ? { ...r, permissions: next } : r)));
  };

  const togglePermission = (code: string) => {
    if (readOnly) return;
    updatePermissions(granted.has(code) ? role.permissions.filter((c) => c !== code) : [...role.permissions, code]);
  };

  const toggleModule = (module: PermissionModule) => {
    if (readOnly) return;
    const codes = module.permissions.map((p) => p.code);
    const allChecked = codes.every((c) => granted.has(c));
    updatePermissions(
      allChecked ? role.permissions.filter((c) => !codes.includes(c)) : Array.from(new Set([...role.permissions, ...codes]))
    );
  };

  const copy = (code: string) => {
    navigator.clipboard?.writeText(code);
    showToast(`已复制权限标识：${code}`);
  };

  const visibleMenus = useMemo(() => {
    const visible = new Set<string>();
    MODULES.forEach((module) => {
      module.permissions.forEach((perm) => {
        if (perm.menu && granted.has(perm.code)) visible.add(perm.menu);
      });
    });
    MENU_TREE.forEach((node) => {
      if (node.alwaysVisible || node.children?.some((child) => visible.has(child.code))) visible.add(node.code);
    });
    return visible;
  }, [granted]);

  const handleDeleteRole = (target: OrgRole) => {
    setCustomRoles((prev) => prev.filter((r) => r.id !== target.id));
    if (selectedId === target.id) setSelectedId(BUILT_IN_ROLES[0].id);
    showToast(`已删除角色「${target.name}」`);
  };

  return (
    <div className="grid grid-cols-[260px_minmax(0,1fr)_300px] gap-5 items-start">
      {/* 角色列表 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800 min-w-0">
            <span className="material-symbols-outlined text-[18px] text-gray-500">group</span>
            <span className="leading-snug">「{institutionName}」角色列表（{roles.length}）</span>
          </div>
          <button
            type="button"
            disabled={creating}
            onClick={() => setCreating(true)}
            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            添加新角色
          </button>
        </div>

        {creating && (
          <NewRoleForm
            defaultSort={roles.length + 1}
            existingCodes={roles.map((r) => r.code)}
            onCancel={() => setCreating(false)}
            onSave={(draft) => {
              const id = `r_custom_${Date.now()}`;
              setCustomRoles((prev) => [
                ...prev,
                {
                  id,
                  code: draft.code,
                  name: draft.name,
                  desc: draft.desc || '机构自定义角色',
                  builtIn: false,
                  permissions: [],
                  enabled: draft.enabled,
                  scope: draft.scope,
                  sort: draft.sort,
                },
              ]);
              setSelectedId(id);
              setCreating(false);
              showToast(`已新增角色「${draft.name}」，请勾选其模块权限`);
            }}
          />
        )}

        {roles.map((item) => {
          const active = item.id === role.id;
          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(item.id)}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedId(item.id)}
              className={`rounded-md border p-4 cursor-pointer transition-all ${
                active ? 'border-indigo-500 bg-indigo-50/50 shadow-[0_0_0_1px_#6366f1]' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-bold text-gray-900">{item.name}</div>
                {!item.builtIn && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRole(item);
                    }}
                    className="material-symbols-outlined text-[16px] text-gray-400 hover:text-rose-500 cursor-pointer"
                    title="删除角色"
                  >
                    delete
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                {item.builtIn ? (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-700">
                    <span className="material-symbols-outlined text-[12px]">lock</span>
                    应用内置
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-600">
                    机构自定义
                  </span>
                )}
                <span className="text-[11px] px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-500">
                  {item.scope || '通用'}
                </span>
                {item.enabled === false && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded border border-gray-200 bg-gray-100 text-gray-400">已停用</span>
                )}
              </div>
              <div className="text-xs font-mono text-gray-500 mt-2.5 break-all">ID: {item.code}</div>
              <p className="text-xs text-gray-500 mt-1.5 leading-5">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* 模块权限 */}
      <div className="space-y-4 min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">模块权限选择（支持多选）</span>
            {readOnly ? (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-700">
                应用内置 · 仅可查看
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-600">
                勾选即时生效
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            正在查看角色<span className="font-bold text-indigo-600">【{role.name}】</span>的功能权限
            {readOnly ? '（不可修改）' : '（可编辑）'}：
          </p>
        </div>

        {MODULES.map((module) => {
          const checkedCount = module.permissions.filter((p) => granted.has(p.code)).length;
          const allChecked = checkedCount === module.permissions.length;
          return (
            <div key={module.code} className="bg-white rounded-md border border-gray-200 p-4 space-y-3">
              <div className="space-y-1.5">
                <div className="text-sm font-bold text-gray-900 pl-8">{module.name}</div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      disabled={readOnly}
                      onClick={() => toggleModule(module)}
                      className="shrink-0 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <CheckIcon checked={allChecked} partial={checkedCount > 0 && !allChecked} disabled={readOnly} />
                    </button>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 truncate">
                      {module.code}
                    </span>
                    <CopyIconButton onClick={() => copy(module.code)} title="复制模块编码" />
                  </div>
                  <span className="shrink-0 text-xs font-mono text-gray-500">
                    {checkedCount} / {module.permissions.length} 子权限已选
                  </span>
                </div>
                <p className="text-xs text-gray-500 pl-8 truncate">{module.desc}</p>
              </div>

              <div className="rounded-md bg-gray-50/80 border border-gray-100 divide-y divide-gray-100">
                {module.permissions.map((perm) => (
                  <div
                    key={perm.code}
                    onClick={() => togglePermission(perm.code)}
                    className={`flex items-start gap-2 px-3 py-2.5 ${readOnly ? 'cursor-default' : 'cursor-pointer hover:bg-white'}`}
                  >
                    <CheckIcon checked={granted.has(perm.code)} disabled={readOnly} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-gray-800">{perm.name}</span>
                        <span className="flex items-center gap-1 shrink-0">
                          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded border border-gray-200 bg-white text-gray-500">
                            {perm.code}
                          </span>
                          <CopyIconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              copy(perm.code);
                            }}
                            title="复制权限编码"
                          />
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{perm.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 菜单模拟 */}
      <div className="sticky top-4 bg-white rounded-md border border-gray-200 overflow-hidden">
        <div className="p-4 bg-[#f7f8fc] border-b border-gray-100">
          <div className="flex items-start gap-2.5">
            <span className="w-9 h-9 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">list_alt</span>
            </span>
            <div className="min-w-0">
              <div className="text-sm font-bold text-gray-900">菜单模拟列表</div>
              <div className="text-xs text-gray-500 truncate">角色：{role.name}</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 leading-5">
            根据已选权限实时推算速豹客户管理端前台可展示的菜单入口（已绑定权限的菜单）。
          </p>
        </div>
        <div className="p-3 space-y-2 max-h-[70vh] overflow-y-auto">
          {MENU_TREE.map((node) => (
            <div key={node.code} className="space-y-2">
              <MenuItem node={node} visible={visibleMenus.has(node.code)} />
              {node.children && (
                <div className="pl-4 space-y-2">
                  {node.children.map((child) => (
                    <MenuItem key={child.code} node={child} visible={visibleMenus.has(child.code)} child />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

const MenuItem: React.FC<{ node: MenuNode; visible: boolean; child?: boolean }> = ({ node, visible, child }) => (
  <div
    className={`flex items-start gap-2 px-3 py-2.5 rounded-md border transition-colors ${
      visible
        ? child
          ? 'border-gray-200 bg-white'
          : 'border-emerald-200 bg-emerald-50/70'
        : 'border-dashed border-gray-200 bg-gray-50 opacity-60'
    }`}
  >
    <span className={`material-symbols-outlined text-[16px] mt-0.5 ${visible ? 'text-emerald-600' : 'text-gray-400'}`}>
      {visible ? 'visibility' : 'visibility_off'}
    </span>
    <div className="min-w-0">
      <div className={`text-sm font-bold ${visible ? 'text-gray-900' : 'text-gray-400 line-through'}`}>{node.name}</div>
      <div className="text-[11px] font-mono text-gray-400 mt-0.5">{node.code}</div>
    </div>
  </div>
);

const ROLE_SCOPES: RoleScope[] = ['PC', 'H5', '通用'];
const ROLE_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;

const NewRoleForm: React.FC<{
  defaultSort: number;
  existingCodes: string[];
  onCancel: () => void;
  onSave: (draft: NewRoleDraft) => void;
}> = ({ defaultSort, existingCodes, onCancel, onSave }) => {
  const [draft, setDraft] = useState<NewRoleDraft>({
    name: '',
    code: '',
    desc: '',
    enabled: false,
    scope: '通用',
    sort: defaultSort,
  });
  const [error, setError] = useState('');

  const update = (patch: Partial<NewRoleDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setError('');
  };

  const handleSave = () => {
    if (!draft.name.trim()) return setError('请输入角色名称');
    const code = draft.code.trim();
    if (!ROLE_CODE_PATTERN.test(code)) return setError('角色 ID 须为大写字母开头，仅含大写字母、数字与下划线');
    if (existingCodes.includes(code)) return setError('角色 ID 已存在，请更换');
    onSave({ ...draft, name: draft.name.trim(), code, desc: draft.desc.trim() });
  };

  const inputClass =
    'w-full h-10 border border-gray-200 rounded-md px-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';

  return (
    <div className="rounded-md border-2 border-dashed border-indigo-400 bg-white p-4 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <span className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600">
          <span className="material-symbols-outlined text-[18px]">add</span>
          新增角色
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-2.5 py-1 text-xs font-bold text-gray-700 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">check</span>
            保存
          </button>
        </div>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-bold text-gray-800">
          角色名称 <span className="text-rose-500">*</span>
        </span>
        <input
          autoFocus
          value={draft.name}
          onChange={(e) => update({ name: e.target.value.slice(0, 30) })}
          placeholder="例如：业务研判与处置审核员"
          className={inputClass}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-bold text-gray-800">
          角色唯一 ID <span className="text-rose-500">*</span>
        </span>
        <input
          value={draft.code}
          onChange={(e) => update({ code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') })}
          placeholder="例如：ROLE_BIZ_AUDITOR"
          className={`${inputClass} font-mono`}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-bold text-gray-800">角色说明</span>
        <textarea
          value={draft.desc}
          onChange={(e) => update({ desc: e.target.value.slice(0, 120) })}
          rows={2}
          placeholder="输入此角色的职责边界及业务操作范围..."
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </label>

      <div className="space-y-1.5">
        <span className="text-sm font-bold text-gray-800">角色启用或停用</span>
        <button
          type="button"
          onClick={() => update({ enabled: !draft.enabled })}
          className="w-full h-10 border border-gray-200 rounded-md px-3 flex items-center justify-between cursor-pointer hover:border-gray-300"
        >
          <span className="text-sm font-bold text-gray-800">{draft.enabled ? '启用' : '停用'}</span>
          <span
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              draft.enabled ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute h-4 w-4 rounded-full bg-white shadow transition-all ${draft.enabled ? 'left-[18px]' : 'left-0.5'}`}
            />
          </span>
        </button>
      </div>

      <div className="space-y-1.5">
        <span className="text-sm font-bold text-gray-800">适用范围</span>
        <div className="grid grid-cols-3 gap-2">
          {ROLE_SCOPES.map((scope) => (
            <button
              key={scope}
              type="button"
              onClick={() => update({ scope })}
              className={`h-10 rounded-md border text-sm font-bold cursor-pointer ${
                draft.scope === scope
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {scope}
            </button>
          ))}
        </div>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-bold text-gray-800">排序序号</span>
        <input
          type="number"
          min={1}
          value={draft.sort}
          onChange={(e) => update({ sort: Math.max(1, Number(e.target.value) || 1) })}
          className={`${inputClass} font-mono`}
        />
      </label>

      {error && (
        <p className="text-xs text-rose-600 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
};

