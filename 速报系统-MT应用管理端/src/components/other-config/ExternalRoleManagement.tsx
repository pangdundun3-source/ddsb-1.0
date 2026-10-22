import React, { useMemo, useState } from 'react';
import { CopyIconButton } from '../common/CopyIconButton';

interface ExtPermission {
  code: string;
  name: string;
  desc: string;
}

interface ExtModule {
  code: string;
  name: string;
  desc: string;
  permissions: ExtPermission[];
}

interface ExtRole {
  id: string;
  code: string;
  name: string;
  desc: string;
}

/** 与「审核上报 PC」顶部菜单及左侧子导航保持一致 */
const MODULES: ExtModule[] = [
  {
    code: 'EXT:HOME',
    name: '工作台首页',
    desc: '登录后的工作台概览、待办提醒与平台公告。',
    permissions: [
      { code: 'home:overview', name: '工作台概览', desc: '查看个人待办、近期报送与审核概况。' },
      { code: 'home:notice', name: '平台公告', desc: '查看机构发布的通知公告与制度规范。' },
    ],
  },
  {
    code: 'EXT:REPORT',
    name: '报送管理',
    desc: '新建速报、跟踪本人报送进度及查看报送台账与统计。',
    permissions: [
      { code: 'report:create', name: '新建速报', desc: '填写并提交速报线索，系统自动查重打标。' },
      { code: 'report:summary', name: '我的报送', desc: '查看待审核、审核中、被驳回的速报，支持撤回与重新提交。' },
      { code: 'report:records', name: '报送记录', desc: '查看本人全部报送台账及审核结果。' },
      { code: 'report:stats', name: '报送统计', desc: '查看本人上报趋势与通过率。' },
    ],
  },
  {
    code: 'EXT:AUDIT',
    name: '审核管理',
    desc: '审核外部上报的速报线索，处理通过、驳回与转办。',
    permissions: [
      { code: 'audit:handle', name: '我的审核', desc: '处理待审批线索，执行通过、驳回、转办。' },
      { code: 'audit:batch', name: '同地址批量通过', desc: '对同一上报链接的多条速报一键批量审核通过。' },
      { code: 'audit:records', name: '审核记录', desc: '查看已审核台账与定标结果。' },
      { code: 'audit:stats', name: '审核统计', desc: '查看审核趋势与处理率。' },
    ],
  },
  {
    code: 'EXT:MESSAGE',
    name: '消息中心',
    desc: '接收待审核提醒与审核结果通知。',
    permissions: [
      { code: 'message:view', name: '查看消息', desc: '查看待审核提醒、审核结果通知并标记已读。' },
    ],
  },
  {
    code: 'EXT:ORG',
    name: '组织管理',
    desc: '查看本节点组织、维护自建子级并邀请人员入驻。',
    permissions: [
      { code: 'org:view', name: '查看本节点组织', desc: '查看当前所属组织节点及下级结构。' },
      { code: 'org:child', name: '维护自建子级', desc: '新增、重命名、删除自行创建的下级节点。' },
      { code: 'org:invite', name: '邀请人员入驻', desc: '邀请外部人员加入本节点或自建子级。' },
      { code: 'org:personnel', name: '查看节点人员', desc: '查看本节点及下级的人员名单。' },
    ],
  },
  {
    code: 'EXT:PROFILE',
    name: '个人中心',
    desc: '个人资料与账号信息维护。',
    permissions: [
      { code: 'profile:view', name: '查看个人信息', desc: '查看本人账号、所属组织与角色。' },
      { code: 'profile:edit', name: '修改个人资料', desc: '修改昵称、头像等个人资料。' },
    ],
  },
];

const ROLES: ExtRole[] = [
  {
    id: 'reporter',
    code: 'ROLE_EXT_REPORTER',
    name: '网格员',
    desc: '外部单位信息报送人员，负责新建速报、跟踪本人报送进度与审核结果。',
  },
  {
    id: 'auditor',
    code: 'ROLE_EXT_AUDITOR',
    name: '审核员',
    desc: '外部单位审核人员，负责核查上报线索，执行通过、驳回、转办与批量审核。',
  },
  {
    id: 'org_leader',
    code: 'ROLE_EXT_ORG_LEADER',
    name: '节点负责人',
    desc: '外部组织节点负责人，开通首页、消息中心、个人中心与组织管理，并负责本节点及自建子级维护。',
  },
  {
    id: 'sys_admin',
    code: 'ROLE_EXT_SYS_ADMIN',
    name: '系统管理员',
    desc: '外部系统管理员，拥有审核上报端全部功能与组织管理权限。',
  },
];

const COMMON_CODES = ['home:overview', 'home:notice', 'message:view', 'profile:view', 'profile:edit'];

const ALL_EXT_CODES = MODULES.flatMap((module) => module.permissions.map((perm) => perm.code));

const DEFAULT_GRANTS: Record<string, string[]> = {
  reporter: [...COMMON_CODES, 'report:create', 'report:summary', 'report:records', 'report:stats'],
  auditor: [...COMMON_CODES, 'audit:handle', 'audit:batch', 'audit:records', 'audit:stats'],
  org_leader: [...COMMON_CODES, 'org:view', 'org:child', 'org:invite', 'org:personnel'],
  sys_admin: [...ALL_EXT_CODES],
};

const readGrants = (storageKey: string): Record<string, string[]> => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const stored = JSON.parse(raw) as Record<string, string[]>;
      // 固定预设角色始终用代码默认权限，避免旧缓存盖住新配置
      return {
        ...stored,
        reporter: DEFAULT_GRANTS.reporter,
        auditor: DEFAULT_GRANTS.auditor,
        org_leader: DEFAULT_GRANTS.org_leader,
        sys_admin: DEFAULT_GRANTS.sys_admin,
      };
    }
  } catch {
    // Ignore malformed storage and fall back to defaults.
  }
  return DEFAULT_GRANTS;
};

const CheckBox: React.FC<{ checked: boolean; partial?: boolean }> = ({ checked, partial }) => (
  <span
    className={`w-[18px] h-[18px] shrink-0 rounded-sm border flex items-center justify-center ${
      checked || partial ? 'border-[#4f46e5] bg-white' : 'border-gray-300 bg-white'
    }`}
  >
    {checked && <span className="material-symbols-outlined text-[15px] text-[#4f46e5] font-bold">check</span>}
    {!checked && partial && <span className="w-2 h-0.5 bg-[#4f46e5]" />}
  </span>
);

interface Props {
  storageKey: string;
  showToast: (msg: string, type?: 'success' | 'warning') => void;
}

export const ExternalRoleManagement: React.FC<Props> = ({ storageKey, showToast }) => {
  const [saved, setSaved] = useState(() => readGrants(storageKey));
  const [grants, setGrants] = useState(saved);
  const [selectedId, setSelectedId] = useState(ROLES[0].id);

  const role = ROLES.find((r) => r.id === selectedId) ?? ROLES[0];
  const granted = useMemo(() => new Set(grants[role.id] || []), [grants, role.id]);
  const dirty = JSON.stringify(grants) !== JSON.stringify(saved);

  const setRoleGrants = (codes: string[]) => setGrants((prev) => ({ ...prev, [role.id]: codes }));

  const togglePermission = (code: string) =>
    setRoleGrants(granted.has(code) ? [...granted].filter((c) => c !== code) : [...granted, code]);

  const toggleModule = (module: ExtModule) => {
    const codes = module.permissions.map((p) => p.code);
    const allOn = codes.every((c) => granted.has(c));
    setRoleGrants(allOn ? [...granted].filter((c) => !codes.includes(c)) : Array.from(new Set([...granted, ...codes])));
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    showToast(`已复制：${text}`);
  };

  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify(grants));
    setSaved(grants);
    showToast('外部角色权限已保存并生效');
  };

  const handleReset = () => {
    setGrants((prev) => ({ ...prev, [role.id]: DEFAULT_GRANTS[role.id] }));
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-lg shadow-2xs p-6">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)] gap-8">
        {/* 角色列表 */}
        <div>
          <div className="flex items-center justify-between mb-4 min-h-9">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <span className="material-symbols-outlined text-[18px] text-gray-500">group</span>
              「点点速报」外部角色列表 ({ROLES.length})
            </h3>
            <span className="text-[11px] text-gray-400">固定角色，不可增删</span>
          </div>
          <div className="space-y-3">
            {ROLES.map((item) => {
              const active = item.id === selectedId;
              const count = (grants[item.id] || []).length;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left p-4 rounded-sm border transition-all cursor-pointer ${
                    active ? 'border-[#4f46e5] border-2 bg-indigo-50/40 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{item.name}</span>
                      <span className="px-1.5 py-0.5 text-[11px] text-gray-600 bg-gray-50 border border-gray-200 rounded-sm">内置</span>
                    </div>
                    <span className="text-[11px] text-gray-400">{count} 项权限</span>
                  </div>
                  <p className="mt-2.5 text-xs font-mono text-gray-500">ID: {item.code}</p>
                  <p className="mt-2.5 text-xs text-gray-600 leading-5">{item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 模块权限 */}
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3 pb-4 mb-5 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">模块权限选择（支持多选）</h3>
              <p className="mt-1 text-xs text-gray-500">
                当前正在为角色 <span className="font-bold text-[#4f46e5]">【{role.name}】</span> 分配「审核上报 PC」可使用的功能权限：
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-sm hover:bg-gray-50"
              >
                恢复默认
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!dirty}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#4f46e5] rounded-sm hover:bg-[#4338ca] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                保存权限
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {MODULES.map((module) => {
              const selectedCount = module.permissions.filter((p) => granted.has(p.code)).length;
              const allOn = selectedCount === module.permissions.length;
              return (
                <div key={module.code} className="border border-gray-200 rounded-sm">
                  <div className="flex items-start gap-3 px-4 py-4">
                    <button type="button" onClick={() => toggleModule(module)} className="mt-0.5 cursor-pointer">
                      <CheckBox checked={allOn} partial={selectedCount > 0} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">{module.name}</span>
                        <span className="px-1.5 py-0.5 text-[11px] font-mono font-bold text-[#4f46e5] bg-indigo-50 border border-indigo-100 rounded-sm">
                          {module.code}
                        </span>
                        <CopyIconButton onClick={() => copy(module.code)} title="复制模块编码" />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 truncate" title={module.desc}>
                        {module.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-gray-500 font-mono">
                        {selectedCount} / {module.permissions.length} 子权限已选
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleModule(module)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-sm border ${
                          allOn
                            ? 'text-[#4f46e5] bg-indigo-50 border-indigo-200'
                            : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {allOn ? '取消全部' : '全选子项'}
                      </button>
                    </div>
                  </div>
                  <div className="mx-4 mb-4 bg-slate-50/80 rounded-sm divide-y divide-gray-100">
                    {module.permissions.map((perm) => {
                      const on = granted.has(perm.code);
                      return (
                        <div
                          key={perm.code}
                          onClick={() => togglePermission(perm.code)}
                          className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-100/70"
                        >
                          <span className="mt-0.5">
                            <CheckBox checked={on} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={`text-[13px] font-bold ${on ? 'text-gray-900' : 'text-gray-500'}`}>{perm.name}</p>
                            <p className="mt-0.5 text-xs text-gray-500">{perm.desc}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="px-1.5 py-0.5 text-[11px] font-mono text-gray-600 bg-white border border-gray-200 rounded-sm">
                              {perm.code}
                            </span>
                            <CopyIconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                copy(perm.code);
                              }}
                              title="复制权限编码"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
