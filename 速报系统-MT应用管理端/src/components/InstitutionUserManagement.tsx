import React, { useMemo, useState } from 'react';

type UserRole = 'super_admin' | 'admin' | 'member';
type UserSegment = 'active' | 'unopened' | 'unfollowed';

interface InstitutionUser {
  id: string;
  avatar: string;
  nickname: string;
  name: string;
  orgNode: string;
  role: UserRole;
  phone: string;
  enabled: boolean;
  segment: UserSegment;
}

type ListView = UserSegment | 'all';

const avatarUrl = (id: string) => `https://images.unsplash.com/${id}?w=100&h=100&auto=format&fit=crop&q=80`;

const INITIAL_USERS: InstitutionUser[] = [
  { id: 'u1', avatar: avatarUrl('photo-1500648767791-00dcc994a43e'), nickname: '小頻警长官', name: '罗科长', orgNode: '宣传处', role: 'super_admin', phone: '13812343456', enabled: true, segment: 'active' },
  { id: 'u2', avatar: avatarUrl('photo-1494790108377-be9c29b29330'), nickname: 'Shaw', name: '史科长', orgNode: '宣传处', role: 'super_admin', phone: '13956784321', enabled: true, segment: 'active' },
  { id: 'u3', avatar: avatarUrl('photo-1506794778202-cad84cf45f1d'), nickname: 'domo', name: '小海', orgNode: '融媒中心', role: 'admin', phone: '13600001111', enabled: true, segment: 'active' },
  { id: 'u4', avatar: avatarUrl('photo-1438761681033-6461ffad8d80'), nickname: 'THIS', name: '肖海峰', orgNode: '技术运维科', role: 'member', phone: '13700003333', enabled: true, segment: 'active' },
  { id: 'u5', avatar: avatarUrl('photo-1507003211169-0a1dd7228f2d'), nickname: '阿强不熬夜', name: '王强', orgNode: '综合协调科', role: 'member', phone: '15800005555', enabled: true, segment: 'active' },
  { id: 'u6', avatar: avatarUrl('photo-1472099645785-5658abf4ff4e'), nickname: '周周', name: '周明', orgNode: '舆情监测组', role: 'member', phone: '13500009999', enabled: false, segment: 'active' },
  { id: 'u7', avatar: avatarUrl('photo-1519085360753-af0119f7cbe7'), nickname: '小北', name: '陈北', orgNode: '综合协调科', role: 'member', phone: '13100001234', enabled: false, segment: 'active' },
  { id: 'u8', avatar: avatarUrl('photo-1544005313-94ddf0286df2'), nickname: '阿木', name: '木子', orgNode: '融媒中心', role: 'admin', phone: '13200002222', enabled: true, segment: 'active' },
  { id: 'u9', avatar: avatarUrl('photo-1463453091185-61582044d556'), nickname: '橙子', name: '橙子', orgNode: '内容编辑组', role: 'member', phone: '13300004444', enabled: true, segment: 'active' },
  { id: 'u10', avatar: avatarUrl('photo-1534528741775-53994a69daeb'), nickname: '石头', name: '石磊', orgNode: '技术运维科', role: 'member', phone: '13400006666', enabled: true, segment: 'active' },
  { id: 'u11', avatar: avatarUrl('photo-1507003211169-0a1dd7228f2d'), nickname: '待开通A', name: '张未开', orgNode: '宣传处', role: 'member', phone: '13512348888', enabled: false, segment: 'unopened' },
  { id: 'u12', avatar: avatarUrl('photo-1544005313-94ddf0286df2'), nickname: '待开通B', name: '李未开', orgNode: '融媒中心', role: 'member', phone: '13612340000', enabled: false, segment: 'unopened' },
  { id: 'u13', avatar: avatarUrl('photo-1500648767791-00dcc994a43e'), nickname: '待开通C', name: '王未开', orgNode: '综合协调科', role: 'member', phone: '13712343434', enabled: false, segment: 'unopened' },
  { id: 'u14', avatar: avatarUrl('photo-1506794778202-cad84cf45f1d'), nickname: '未关注甲', name: '赵未关', orgNode: '舆情监测组', role: 'member', phone: '13812345656', enabled: false, segment: 'unfollowed' },
  { id: 'u15', avatar: avatarUrl('photo-1438761681033-6461ffad8d80'), nickname: '未关注乙', name: '钱未关', orgNode: '内容编辑组', role: 'member', phone: '13912347878', enabled: false, segment: 'unfollowed' },
];

const ROLE_META: Record<UserRole, { label: string }> = {
  super_admin: { label: '超级管理员' },
  admin: { label: '管理员' },
  member: { label: '使用成员' },
};

const ORG_NODES = ['宣传处', '融媒中心', '技术运维科', '综合协调科', '舆情监测组', '内容编辑组'];

const SEGMENT_TITLES: Record<ListView, string> = {
  active: '已启用机构用户列表',
  unopened: '未开通人员列表',
  unfollowed: '未关注公众号人员列表',
  all: '全部人员列表',
};

const maskPhone = (phone: string) => `${phone.slice(0, 3)}****${phone.slice(-4)}`;

const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  if (role === 'super_admin') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-300 bg-amber-50 text-amber-700">
        <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
        超级管理员
      </span>
    );
  }
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border border-rose-200 bg-rose-50 text-rose-600">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        管理员
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600">
      <span className="material-symbols-outlined text-[14px]">person</span>
      使用成员
    </span>
  );
};

interface Props {
  institutionName: string;
  showToast: (message: string, type?: 'success' | 'warning') => void;
}

export const InstitutionUserManagement: React.FC<Props> = ({ institutionName, showToast }) => {
  const [users, setUsers] = useState<InstitutionUser[]>(INITIAL_USERS);
  const [segment, setSegment] = useState<ListView>('active');
  const [roleFilter, setRoleFilter] = useState<'' | UserRole>('');
  const [keyword, setKeyword] = useState('');
  const [revealedPhones, setRevealedPhones] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<InstitutionUser | null>(null);
  const [deleting, setDeleting] = useState<InstitutionUser | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const counts = useMemo(() => {
    const active = users.filter((u) => u.segment === 'active');
    return {
      active: active.length,
      superAdmins: active.filter((u) => u.role === 'super_admin').length,
      unopened: users.filter((u) => u.segment === 'unopened').length,
      unfollowed: users.filter((u) => u.segment === 'unfollowed').length,
    };
  }, [users]);

  const rows = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return users.filter((u) => {
      if (segment !== 'all' && u.segment !== segment) return false;
      if (roleFilter && u.role !== roleFilter) return false;
      if (q && ![u.name, u.nickname, u.phone].some((v) => v.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [keyword, roleFilter, segment, users]);

  const updateUser = (id: string, patch: Partial<InstitutionUser>) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const togglePhone = (id: string) =>
    setRevealedPhones((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleReset = () => {
    setRoleFilter('');
    setKeyword('');
  };

  const handleToggleEnabled = (user: InstitutionUser) => {
    if (user.segment === 'unfollowed') {
      showToast(`【${user.name}】尚未关注公众号，关注后方可开启`, 'warning');
      return;
    }
    if (user.segment === 'unopened') {
      handleOpenAccess(user);
      return;
    }
    if (user.role === 'super_admin') {
      showToast('超级管理员账号不可关闭', 'warning');
      return;
    }
    updateUser(user.id, { enabled: !user.enabled });
    showToast(`已${user.enabled ? '关闭' : '开启'}【${user.name}】的系统使用权限`);
  };

  const handleOpenAccess = (user: InstitutionUser) => {
    updateUser(user.id, { segment: 'active', enabled: true });
    showToast(`已为【${user.name}】开通系统使用权限`);
  };

  const statCards: {
    key: UserSegment;
    title: string;
    count: number;
    desc: string;
    icon: string;
    tone: string;
    activeBorder: string;
  }[] = [
    {
      key: 'active',
      title: '已激活已开通',
      count: counts.active,
      desc: '已开通本系统使用权限的人员名单',
      icon: 'group',
      tone: 'bg-emerald-50 text-emerald-600',
      activeBorder: 'border-emerald-400 shadow-[0_0_0_1px_#34d399]',
    },
    {
      key: 'unopened',
      title: '未开通',
      count: counts.unopened,
      desc: '未开通本系统使用权限的人员名单',
      icon: 'person_add',
      tone: 'bg-orange-50 text-orange-500',
      activeBorder: 'border-orange-400 shadow-[0_0_0_1px_#fb923c]',
    },
    {
      key: 'unfollowed',
      title: '未关注公众号',
      count: counts.unfollowed,
      desc: '尚未关注微信公众号【点点速报 - 清朗净网鉴谣速报系统服务号】，关注后方可授权',
      icon: 'person_remove',
      tone: 'bg-gray-100 text-gray-500',
      activeBorder: 'border-slate-400 shadow-[0_0_0_1px_#94a3b8]',
    },
  ];

  return (
    <div className="space-y-4">
      {/* 人数概览 */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((card) => {
          const active = segment === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setSegment(card.key)}
              className={`text-left bg-white rounded-md border px-5 py-4 flex items-start justify-between gap-3 transition-all cursor-pointer ${
                active ? card.activeBorder : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-700">{card.title}</div>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-gray-900 font-mono">{card.count}</span>
                  <span className="text-sm text-gray-600 ml-1">人</span>
                </div>
                <div className="text-xs text-gray-400 mt-2 leading-5">{card.desc}</div>
              </div>
              <div className="flex flex-col items-end gap-3 shrink-0">
                {card.key === 'active' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700">
                    <span className="material-symbols-outlined text-[13px]">workspace_premium</span>
                    超管 {counts.superAdmins} 人
                  </span>
                )}
                <span className={`w-9 h-9 rounded-md flex items-center justify-center ${card.tone}`}>
                  <span className="material-symbols-outlined text-[20px]">{card.icon}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 用户列表 */}
      <div className="bg-white rounded-md border border-gray-200">
        <div className="px-5 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-gray-900">
                {SEGMENT_TITLES[segment]}（共 {rows.length} 人）
              </h3>
              {segment !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSegment('all')}
                  className="text-sm font-bold text-[#1E3A6B] hover:underline cursor-pointer"
                >
                  查看全部人员
                </button>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1.5">{institutionName} · 点点速报 - 清朗净网鉴谣速报系统</div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">角色筛选</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as '' | UserRole)}
                className="h-9 border border-gray-200 rounded-md px-3 text-sm bg-white focus:outline-none focus:border-[#1E3A6B] cursor-pointer"
              >
                <option value="">全部角色</option>
                <option value="super_admin">超级管理员</option>
                <option value="admin">管理员</option>
                <option value="member">使用成员</option>
              </select>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">search</span>
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索姓名、昵称、手机号"
                  className="h-9 w-[210px] border border-gray-200 rounded-md pl-9 pr-3 text-sm focus:outline-none focus:border-[#1E3A6B]"
                />
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="h-9 px-3 inline-flex items-center gap-1 text-sm font-bold text-gray-700 border border-gray-200 rounded-md hover:border-gray-300 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                重置
              </button>
            </div>
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="h-9 px-4 inline-flex items-center gap-1.5 text-sm font-bold text-white bg-[#1E3A6B] rounded-md hover:bg-[#162d54] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              邀请用户
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px] whitespace-nowrap">
            <thead>
              <tr className="bg-[#f7f8fa] text-gray-600 text-sm border-y border-gray-100">
                <th className="py-3 px-4 font-medium w-[56px]">序号</th>
                <th className="py-3 px-3 font-medium w-[72px]">微信头像</th>
                <th className="py-3 px-3 font-medium">微信昵称</th>
                <th className="py-3 px-3 font-medium">姓名</th>
                <th className="py-3 px-3 font-medium">组织节点</th>
                <th className="py-3 px-3 font-medium">角色权限</th>
                <th className="py-3 px-3 font-medium">电话</th>
                <th className="py-3 px-3 font-medium text-center">启用状态</th>
                <th className="py-3 px-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800">
              {rows.map((user, index) => {
                const isSuper = user.role === 'super_admin';
                return (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50/70">
                    <td className="py-3 px-4 text-gray-500 font-mono">{index + 1}</td>
                    <td className="py-3 px-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.nickname} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <span className="w-9 h-9 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px]">person</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-gray-900">{user.nickname}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-bold text-gray-900">
                        {isSuper && <span className="material-symbols-outlined text-[16px] text-amber-500">workspace_premium</span>}
                        {user.name}
                        <span className="font-normal text-gray-400">（{user.orgNode}）</span>
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        <span className="material-symbols-outlined text-[14px] text-gray-400">corporate_fare</span>
                        {user.orgNode}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 font-mono text-gray-700">
                        {revealedPhones.has(user.id) ? user.phone : maskPhone(user.phone)}
                        <button
                          type="button"
                          onClick={() => togglePhone(user.id)}
                          className="material-symbols-outlined text-[16px] text-gray-400 hover:text-gray-600 cursor-pointer"
                          title={revealedPhones.has(user.id) ? '隐藏号码' : '查看完整号码'}
                        >
                          {revealedPhones.has(user.id) ? 'visibility_off' : 'visibility'}
                        </button>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleEnabled(user)}
                        className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full cursor-pointer transition-colors ${
                          user.enabled
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {user.enabled && <span className="material-symbols-outlined text-[14px]">check</span>}
                        {user.enabled ? '已开启' : '已关闭'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(user)}
                          className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded border border-blue-200 bg-blue-50 text-[#1E3A6B] hover:bg-blue-100 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">settings</span>
                          配置
                        </button>
                        <button
                          type="button"
                          disabled={isSuper}
                          onClick={() => setDeleting(user)}
                          title={isSuper ? '超级管理员不可删除' : '删除用户'}
                          className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-gray-400">
                    暂无符合条件的人员
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <UserConfigModal
          user={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            updateUser(editing.id, patch);
            showToast(`已更新【${patch.name || editing.name}】的配置`);
            setEditing(null);
          }}
        />
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={() => setDeleting(null)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-base font-bold text-gray-900">
              <span className="material-symbols-outlined text-rose-500">warning</span>
              删除机构用户
            </div>
            <p className="text-sm text-gray-600 mt-3">
              确定删除【{deleting.name}】吗？删除后该用户将无法登录本系统。
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="px-4 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsers((prev) => prev.filter((u) => u.id !== deleting.id));
                  showToast(`已删除用户【${deleting.name}】`);
                  setDeleting(null);
                }}
                className="px-4 py-1.5 text-sm font-bold text-white bg-rose-600 rounded-md hover:bg-rose-700 cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {inviteOpen && (
        <InviteUserModal
          institutionName={institutionName}
          onClose={() => setInviteOpen(false)}
          onInvite={(invite) => {
            const id = `u${Date.now()}`;
            setUsers((prev) => [
              ...prev,
              {
                id,
                avatar: '',
                nickname: '待关注',
                name: invite.name || '待认领',
                orgNode: invite.orgNode,
                role: invite.roles.includes('管理员') ? 'admin' : 'member',
                phone: invite.phone || '13800000000',
                enabled: false,
                segment: 'unfollowed',
              },
            ]);
            showToast(`已生成${invite.name ? `【${invite.name}】的` : ''}专属邀请凭证，被邀请人关注公众号后即可激活`);
            setInviteOpen(false);
          }}
        />
      )}
    </div>
  );
};

const UserConfigModal: React.FC<{
  user: InstitutionUser;
  onClose: () => void;
  onSave: (patch: Partial<InstitutionUser>) => void;
}> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [orgNode, setOrgNode] = useState(user.orgNode);
  const [role, setRole] = useState<UserRole>(user.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user.avatar && <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />}
            <div>
              <div className="text-base font-bold text-gray-900">配置用户</div>
              <div className="text-xs text-gray-400">微信昵称：{user.nickname}</div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="p-6 space-y-4 text-sm">
          <label className="block space-y-1.5">
            <span className="font-medium text-gray-700">姓名</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 border border-gray-200 rounded-md px-3 focus:outline-none focus:border-[#1E3A6B]"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="font-medium text-gray-700">组织节点</span>
            <select
              value={orgNode}
              onChange={(e) => setOrgNode(e.target.value)}
              className="w-full h-9 border border-gray-200 rounded-md px-3 bg-white focus:outline-none focus:border-[#1E3A6B] cursor-pointer"
            >
              {ORG_NODES.map((node) => (
                <option key={node} value={node}>
                  {node}
                </option>
              ))}
            </select>
          </label>
          <div className="space-y-1.5">
            <span className="font-medium text-gray-700">角色权限</span>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(ROLE_META) as UserRole[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRole(key)}
                  className={`h-9 rounded-md border text-xs font-bold cursor-pointer ${
                    role === key ? 'border-[#1E3A6B] bg-[#eef2f8] text-[#1E3A6B]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {ROLE_META[key].label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-3 border-t border-gray-100 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
            取消
          </button>
          <button
            type="button"
            disabled={!name.trim()}
            onClick={() => onSave({ name: name.trim(), orgNode, role })}
            className="px-4 py-1.5 text-sm font-bold text-white bg-[#1E3A6B] rounded-md hover:bg-[#162d54] disabled:bg-gray-300 cursor-pointer"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

const INVITE_ROLES = ['管理员', '审核员', '处置员', '协同成员'];

interface InviteResult {
  orgNode: string;
  name: string;
  phone: string;
  validDays: number;
  roles: string[];
}

const InviteUserModal: React.FC<{
  institutionName: string;
  onClose: () => void;
  onInvite: (invite: InviteResult) => void;
}> = ({ institutionName, onClose, onInvite }) => {
  const [orgNode, setOrgNode] = useState('');
  const [orgOpen, setOrgOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [validDays, setValidDays] = useState(7);
  const [roles, setRoles] = useState<string[]>(['协同成员']);

  const toggleRole = (role: string) =>
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));

  const canSubmit = Boolean(orgNode) && roles.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-[640px] max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-8 pt-6 pb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-md bg-blue-50 text-[#1E3A6B] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">person_add</span>
            </span>
            <div>
              <h3 className="text-lg font-bold text-gray-900">邀请内部用户加入「{institutionName}」</h3>
              <p className="text-sm text-gray-500 mt-0.5">选择应用与内部角色，生成专属内部员工邀请凭证（仅限内部用户）</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="px-8 pb-6 space-y-5 overflow-y-auto">
          <div className="border-t border-gray-100" />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-gray-800">1. 目标应用 *</span>
              <span className="text-[#1890ff]">关联服务号：点点速报 - 清朗净网鉴谣速报系统服务号</span>
            </div>
            <div className="px-4 py-3 rounded-md border border-gray-200 bg-[#f7f9fc] text-sm font-bold text-gray-900">
              点点速报 - 清朗净网鉴谣速报系统（V8-P-10）
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-gray-800">2. 选择用户所在组织节点 *</span>
              <span className="text-gray-400">点击选择组织树</span>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setOrgOpen((v) => !v)}
                className="w-full px-4 py-3 rounded-md border border-gray-200 bg-[#f7f9fc] text-sm flex items-center gap-2 text-left cursor-pointer hover:border-gray-300"
              >
                <span className="material-symbols-outlined text-[18px] text-gray-400">account_tree</span>
                <span className={`flex-1 ${orgNode ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                  {orgNode ? `${institutionName} / ${orgNode}` : '请选择用户所在组织节点'}
                </span>
                <span className={`material-symbols-outlined text-[18px] text-gray-400 transition-transform ${orgOpen ? 'rotate-90' : ''}`}>
                  chevron_right
                </span>
              </button>
              {orgOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-md shadow-xl py-2">
                  <div className="px-4 py-1.5 text-xs font-bold text-gray-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
                    {institutionName}
                  </div>
                  {ORG_NODES.map((node) => (
                    <button
                      key={node}
                      type="button"
                      onClick={() => {
                        setOrgNode(node);
                        setOrgOpen(false);
                      }}
                      className={`w-full text-left pl-10 pr-4 py-2 text-sm flex items-center gap-2 cursor-pointer ${
                        orgNode === node ? 'bg-blue-50 text-[#1E3A6B] font-bold' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px] text-gray-400">subdirectory_arrow_right</span>
                      {node}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-gray-800">3. 被邀请人姓名</span>
              <span className="text-gray-400">选填项</span>
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入被邀请人姓名"
              className="w-full px-4 py-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-[#1890ff]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-gray-800">4. 手机号与凭证有效期</span>
              <span className="text-gray-400">手机号选填</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="请输入被邀请人手机号"
                className="w-full px-4 py-3 rounded-md border border-gray-200 text-sm font-mono focus:outline-none focus:border-[#1890ff]"
              />
              <div className="grid grid-cols-3 gap-2">
                {[1, 7, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setValidDays(days)}
                    className={`rounded-md border text-sm cursor-pointer ${
                      validDays === days
                        ? 'border-[#1890ff] bg-blue-50 text-[#1E3A6B] font-bold'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {days} 天
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-gray-800">5. 应用角色 *</span>
              <span className="text-gray-400">可多选</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {INVITE_ROLES.map((role) => {
                const checked = roles.includes(role);
                return (
                  <label
                    key={role}
                    className={`px-4 py-3 rounded-md border flex items-center justify-between text-sm cursor-pointer transition-colors ${
                      checked ? 'border-[#1890ff] bg-blue-50/50 font-bold text-[#1E3A6B]' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {role}
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRole(role)}
                      className="w-4 h-4 accent-[#1677ff] cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onInvite({ orgNode, name: name.trim(), phone, validDays, roles })}
            className="w-full h-12 rounded-md bg-[#1677ff] text-white text-base font-bold inline-flex items-center justify-center gap-2 hover:bg-[#0f63d9] disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            立即邀请
          </button>
        </div>
      </div>
    </div>
  );
};
