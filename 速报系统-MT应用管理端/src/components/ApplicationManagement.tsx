import React, { useMemo, useState } from 'react';

type AppTopTab =
  | 'basic'
  | 'menu'
  | 'permission'
  | 'role'
  | 'dict'
  | 'external';

type BasicSub = 'info' | 'mp' | 'publish';
type ExternalSub = 'address' | 'invite' | 'ext_perm' | 'ext_role' | 'ext_user';

interface ApplicationManagementProps {
  onShowToast?: (msg: string, type?: 'success' | 'warning') => void;
}

const TOP_TABS: Array<{
  id: AppTopTab;
  label: string;
  icon: string;
  badge?: string;
}> = [
  { id: 'basic', label: '应用基本配置', icon: 'description' },
  { id: 'menu', label: '菜单管理', icon: 'grid_view' },
  { id: 'permission', label: '权限字典', icon: 'key' },
  { id: 'role', label: '角色管理', icon: 'verified_user' },
  { id: 'dict', label: '数据字典', icon: 'list_alt' },
  { id: 'external', label: '外部体系配置', icon: 'group', badge: '已启用' },
];

const BASIC_SUB: Array<{ id: BasicSub; label: string; icon: string }> = [
  { id: 'info', label: '基本信息', icon: 'draft' },
  { id: 'mp', label: '公众号设置', icon: 'chat' },
  { id: 'publish', label: '应用发布', icon: 'send' },
];

const EXTERNAL_SUB: Array<{ id: ExternalSub; label: string; icon: string }> = [
  { id: 'address', label: '外部系统地址', icon: 'open_in_new' },
  { id: 'invite', label: '默认邀请配置', icon: 'person_add' },
  { id: 'ext_perm', label: '外部权限管理', icon: 'key' },
  { id: 'ext_role', label: '外部角色管理', icon: 'verified_user' },
  { id: 'ext_user', label: '外部用户数据', icon: 'groups' },
];

const MENU_TREE = [
  {
    name: '首页',
    children: [] as string[],
  },
  {
    name: '审核管理',
    children: ['我的审核', '审核记录', '审核统计'],
  },
  { name: '数据仓库', children: [] },
  { name: '统计管理', children: [] },
  { name: '考核管理', children: [] },
  { name: '公告管理', children: [] },
  { name: '外部联系人', children: [] },
];

const PERM_TREE = [
  { name: '管理员权限', code: 'Admin' },
  { name: '机构审核员权限', code: 'Auditor' },
  { name: '统计考核员权限', code: 'Assessor' },
  { name: '基础管理员权限', code: 'BasicAdmin' },
];

const ROLES = [
  { name: '管理员', code: 'Admin', desc: '拥有应用全部配置与管理权限' },
  { name: '机构审核员', code: 'Auditor', desc: '负责审核流转与记录查看' },
  { name: '统计考核员', code: 'Assessor', desc: '负责统计与考核数据查看' },
  { name: '基础管理员', code: 'BasicAdmin', desc: '基础配置与账号维护' },
];

const EXT_ROLES = [
  { name: '网格员', code: 'Submitter', enabled: true },
  { name: '审核员', code: 'Reviewer', enabled: true },
  { name: '节点负责人', code: 'Principal', enabled: true },
  { name: '系统管理员', code: 'Admin', enabled: true },
];

const EXT_PERMS = [
  { name: '上报员权限', code: 'Submitter' },
  { name: '审核员权限', code: 'Reviewer' },
  { name: '节点管理员权限', code: 'Principal' },
  { name: '外部管理员权限', code: 'ExtAdmin' },
];

const CopyBtn: React.FC<{ text: string; label?: string; onCopied?: () => void }> = ({
  text,
  label = '复制网址',
  onCopied,
}) => (
  <button
    type="button"
    onClick={() => {
      void navigator.clipboard?.writeText(text).catch(() => undefined);
      onCopied?.();
    }}
    className="inline-flex items-center gap-1 h-7 px-2.5 rounded border border-gray-200 text-[11px] text-gray-600 hover:bg-gray-50 cursor-pointer"
  >
    <span className="material-symbols-outlined text-[14px]">content_copy</span>
    {label}
  </button>
);

const SideNav: React.FC<{
  items: Array<{ id: string; label: string; icon: string; dot?: boolean }>;
  activeId: string;
  onChange: (id: string) => void;
}> = ({ items, activeId, onChange }) => (
  <aside className="w-[180px] shrink-0 bg-[#f5f8fc] border-r border-gray-100 py-3 space-y-0.5">
    {items.map((item) => {
      const active = item.id === activeId;
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-[13px] cursor-pointer relative ${
            active
              ? 'bg-[#e8f3ff] text-[#1677ff] font-semibold'
              : 'text-gray-600 hover:bg-white/80'
          }`}
        >
          {active && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#1677ff]" />}
          <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
          <span className="flex-1 truncate">{item.label}</span>
          {item.dot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
        </button>
      );
    })}
  </aside>
);

const InfoRow: React.FC<{
  label: string;
  tip?: string;
  children: React.ReactNode;
}> = ({ label, tip, children }) => (
  <div className="flex items-start gap-4 py-3.5 border-b border-gray-100 last:border-b-0">
    <div className="w-[140px] shrink-0 pt-0.5">
      <div className="text-[13px] font-medium text-gray-700 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1677ff] shrink-0" />
        {label}
      </div>
      {tip && <div className="text-[11px] text-gray-400 mt-1 pl-3 leading-snug">{tip}</div>}
    </div>
    <div className="flex-1 min-w-0 text-[13px] text-gray-800">{children}</div>
  </div>
);

export const ApplicationManagement: React.FC<ApplicationManagementProps> = ({
  onShowToast,
}) => {
  const [topTab, setTopTab] = useState<AppTopTab>('basic');
  const [basicSub, setBasicSub] = useState<BasicSub>('info');
  const [externalSub, setExternalSub] = useState<ExternalSub>('address');
  const [publishStatus, setPublishStatus] = useState<'published' | 'disabled'>('published');
  const [selectedMenu, setSelectedMenu] = useState('首页');
  const [selectedRole, setSelectedRole] = useState(ROLES[0].name);
  const [selectedExtRole, setSelectedExtRole] = useState(EXT_ROLES[0].name);
  const [inviteBatch, setInviteBatch] = useState(true);
  const [inviteMethods, setInviteMethods] = useState({
    code: true,
    qr: true,
    link: true,
  });

  const toast = (msg: string) => onShowToast?.(msg, 'success');

  const basicSideItems = useMemo(
    () =>
      BASIC_SUB.map((item) => ({
        ...item,
        dot: item.id === 'publish' && publishStatus === 'published',
      })),
    [publishStatus]
  );

  return (
    <div className="min-h-[calc(100vh-74px)] bg-[#f7f9fc] flex flex-col">
      {/* App header */}
      <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] flex items-center justify-center text-white text-[13px] font-bold shrink-0 shadow-sm">
            点
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[15px] font-bold text-gray-900">点点速豹</span>
              <span className="text-[11px] text-gray-500 font-mono">V8-P-14</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                产品级应用
              </span>
            </div>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-[#1677ff] border border-blue-100 shrink-0">
          有角色应用
        </span>
      </div>

      {/* Top tabs */}
      <div className="bg-white border-b border-gray-100 px-3 overflow-x-auto shrink-0">
        <div className="flex items-center gap-0.5 min-w-max">
          {TOP_TABS.map((tab) => {
            const active = topTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTopTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3.5 py-3 text-[13px] cursor-pointer whitespace-nowrap transition-colors ${
                  active
                    ? 'text-[#1677ff] font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-0.5 px-1.5 py-px rounded text-[10px] font-bold bg-rose-500 text-white leading-none">
                    {tab.badge}
                  </span>
                )}
                {active && (
                  <span className="absolute left-2 right-2 bottom-0 h-0.5 bg-[#1677ff] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex min-h-0">
        {topTab === 'basic' && (
          <>
            <SideNav
              items={basicSideItems}
              activeId={basicSub}
              onChange={(id) => setBasicSub(id as BasicSub)}
            />
            <div className="flex-1 min-w-0 p-5 overflow-auto">
              {basicSub === 'info' && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#1677ff] text-[20px]">
                        draft
                      </span>
                      <h2 className="text-sm font-bold text-gray-900">基本信息总览</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast('已进入基本信息编辑（演示）')}
                      className="inline-flex items-center gap-1 h-8 px-3 rounded-md bg-[#1677ff] text-white text-[12px] font-semibold hover:bg-[#0958d9] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      编辑
                    </button>
                  </div>
                  <div className="px-5 py-2 text-[12px] text-gray-500">
                    以下为已创建入库的应用基础档案信息，采用单行条目形式呈现核对：
                  </div>
                  <div className="px-5 pb-4">
                    <InfoRow label="应用唯一 ID">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">V8-P-14</span>
                        <CopyBtn text="V8-P-14" label="复制ID" onCopied={() => toast('已复制应用 ID')} />
                      </div>
                    </InfoRow>
                    <InfoRow label="应用简称" tip="用于系统导航与图标底部徽标 (1-6字)">
                      点点速豹
                    </InfoRow>
                    <InfoRow label="应用全称" tip="对外展示与单点登录授权全名">
                      点点速豹
                    </InfoRow>
                    <InfoRow label="应用描述">
                      <span className="text-gray-400">—</span>
                    </InfoRow>
                    <InfoRow label="V8客户端入口网址">
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href="https://subao.cn"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#1677ff] hover:underline inline-flex items-center gap-1"
                        >
                          https://subao.cn
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => window.open('https://subao.cn', '_blank')}
                          className="h-7 px-2.5 rounded border border-gray-200 text-[11px] text-gray-600 hover:bg-gray-50 cursor-pointer"
                        >
                          独立窗口打开
                        </button>
                        <CopyBtn text="https://subao.cn" onCopied={() => toast('已复制网址')} />
                      </div>
                    </InfoRow>
                    <InfoRow label="MT管理端入口网址">
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href="https://mt2.knwl.cn/subao"
                          target="_blank"
                          rel="noreferrer"
                          className="text-violet-600 hover:underline inline-flex items-center gap-1"
                        >
                          https://mt2.knwl.cn/subao
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </a>
                        <CopyBtn
                          text="https://mt2.knwl.cn/subao"
                          onCopied={() => toast('已复制网址')}
                        />
                      </div>
                    </InfoRow>
                    <InfoRow label="H5 配置">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
                          <span className="material-symbols-outlined text-[14px]">smartphone</span>
                          已开启 H5
                        </span>
                        <span className="text-gray-700">https://subao.cn/ddsbh5</span>
                        <CopyBtn
                          text="https://subao.cn/ddsbh5"
                          onCopied={() => toast('已复制网址')}
                        />
                      </div>
                    </InfoRow>
                    <InfoRow
                      label="应用图标修改"
                      tip="未上传自定义文件时，系统将使用应用简称自动生成默认色块图标"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] shadow-sm" />
                        <span className="text-[12px] text-gray-600">已上传图标</span>
                      </div>
                    </InfoRow>
                    <InfoRow label="应用级别分类" tip="面向终端用户完整业务工作台">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                        <span className="material-symbols-outlined text-[14px]">category</span>
                        产品级应用
                      </span>
                    </InfoRow>
                    <InfoRow label="角色类型模式" tip="支持配置默认角色与权限字典">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-semibold bg-blue-50 text-[#1677ff] border border-blue-100">
                        <span className="material-symbols-outlined text-[14px]">shield</span>
                        有角色应用
                      </span>
                    </InfoRow>
                    <InfoRow label="所属产品经理" tip="负责业务规划、功能演进与版本验收">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-medium bg-gray-50 text-gray-700 border border-gray-200">
                        <span className="material-symbols-outlined text-[14px]">person</span>
                        王飞飞
                      </span>
                    </InfoRow>
                  </div>
                </div>
              )}

              {basicSub === 'mp' && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">应用默认服务号配置</h2>
                      <p className="text-[12px] text-gray-500 mt-0.5">
                        配置应用级默认公众号/服务号，供机构侧接入与消息推送使用
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast('服务号配置已保存')}
                      className="h-8 px-3 rounded-md bg-[#1677ff] text-white text-[12px] font-semibold hover:bg-[#0958d9] cursor-pointer shrink-0"
                    >
                      保存服务号配置
                    </button>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { name: '点点速报 (平台统配)', id: 'gh_platform_default', selected: true },
                        { name: '康奈网络政务服务号', id: 'gh_knwl_gov', selected: false },
                      ].map((mp) => (
                        <button
                          key={mp.id}
                          type="button"
                          onClick={() => toast(`已选用「${mp.name}」`)}
                          className={`text-left p-4 rounded-xl border cursor-pointer transition-colors ${
                            mp.selected
                              ? 'border-[#1677ff] bg-blue-50/50 ring-1 ring-[#1677ff]/20'
                              : 'border-gray-200 hover:border-blue-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-semibold text-[13px] text-gray-900">{mp.name}</div>
                            <span
                              className={`text-[11px] font-bold ${
                                mp.selected ? 'text-[#1677ff]' : 'text-gray-400'
                              }`}
                            >
                              {mp.selected ? '已选中' : '点击选用'}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500 mt-1 font-mono">{mp.id}</div>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="搜索服务号名称 / 原始 ID"
                        className="h-9 flex-1 px-3 border border-gray-200 rounded-md text-[13px] focus:outline-none focus:border-[#1677ff]"
                      />
                      <button
                        type="button"
                        className="h-9 px-4 rounded-md bg-[#1677ff] text-white text-[12px] font-semibold cursor-pointer"
                      >
                        搜索
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {basicSub === 'publish' && (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-bold text-gray-900">应用发布</h2>
                        <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
                          控制应用对外可访问状态。发布后机构可正常开通使用；停用后将阻断新访问入口。
                        </p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          publishStatus === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {publishStatus === 'published' ? '已发布 · 正常对外' : '已停用 · 停止访问'}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setPublishStatus('published');
                        toast('应用已发布');
                      }}
                      className={`text-left p-5 rounded-xl border-2 cursor-pointer transition-all ${
                        publishStatus === 'published'
                          ? 'border-emerald-400 bg-emerald-50/40'
                          : 'border-gray-200 bg-white hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <span className="material-symbols-outlined">check_circle</span>
                        </span>
                        <div>
                          <div className="text-[14px] font-bold text-gray-900">已发布</div>
                          <div className="text-[12px] text-gray-500 mt-0.5">对外可访问，机构可开通</div>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPublishStatus('disabled');
                        toast('应用已停用');
                      }}
                      className={`text-left p-5 rounded-xl border-2 cursor-pointer transition-all ${
                        publishStatus === 'disabled'
                          ? 'border-rose-400 bg-rose-50/40'
                          : 'border-gray-200 bg-white hover:border-rose-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                          <span className="material-symbols-outlined">block</span>
                        </span>
                        <div>
                          <div className="text-[14px] font-bold text-gray-900">停用</div>
                          <div className="text-[12px] text-gray-500 mt-0.5">停止对外访问入口</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {topTab === 'menu' && (
          <div className="flex-1 min-w-0 p-5 overflow-auto">
            <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4 min-h-[520px]">
              <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">菜单列表</span>
                  <button
                    type="button"
                    onClick={() => toast('已打开添加菜单（演示）')}
                    className="h-8 px-3 rounded-md bg-[#1677ff] text-white text-[12px] font-semibold cursor-pointer"
                  >
                    + 添加菜单
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-2 space-y-0.5">
                  {MENU_TREE.map((item) => (
                    <div key={item.name}>
                      <button
                        type="button"
                        onClick={() => setSelectedMenu(item.name)}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-left text-[13px] cursor-pointer ${
                          selectedMenu === item.name
                            ? 'bg-blue-50 text-[#1677ff] font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px] text-gray-400">
                          drag_indicator
                        </span>
                        <span className="material-symbols-outlined text-[18px]">folder</span>
                        <span className="flex-1">{item.name}</span>
                        <span className="material-symbols-outlined text-[16px] text-gray-400">
                          edit
                        </span>
                        <span className="material-symbols-outlined text-[16px] text-gray-400">
                          visibility
                        </span>
                      </button>
                      {item.children.map((child) => (
                        <button
                          key={child}
                          type="button"
                          onClick={() => setSelectedMenu(child)}
                          className={`w-full flex items-center gap-2 pl-10 pr-3 py-2 rounded-md text-left text-[12px] cursor-pointer ${
                            selectedMenu === child
                              ? 'bg-blue-50 text-[#1677ff] font-semibold'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">draft</span>
                          <span className="flex-1">{child}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="text-sm font-bold text-gray-900">按钮列表</div>
                  <div className="text-[12px] text-gray-500 mt-0.5">
                    当前菜单：{selectedMenu}
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-16">
                  <span className="material-symbols-outlined text-[48px] text-gray-300 mb-2">
                    folder_open
                  </span>
                  <div className="text-[13px]">当前菜单暂无按钮</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {topTab === 'permission' && (
          <div className="flex-1 min-w-0 p-5 overflow-auto">
            <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toast('新建主权限（演示）')}
                    className="h-8 px-3 rounded-md bg-[#1677ff] text-white text-[12px] font-semibold cursor-pointer"
                  >
                    + 新建主权限
                  </button>
                  <button
                    type="button"
                    className="h-8 px-3 rounded-md border border-gray-200 text-[12px] text-gray-600 cursor-pointer"
                  >
                    全部展开
                  </button>
                  <button
                    type="button"
                    className="h-8 px-3 rounded-md border border-gray-200 text-[12px] text-gray-600 cursor-pointer"
                  >
                    全部收起
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => toast('静态发布成功')}
                  className="h-8 px-3 rounded-md bg-[#1677ff] text-white text-[12px] font-semibold cursor-pointer"
                >
                  静态发布
                </button>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr_0.7fr] min-h-[480px]">
                <div className="border-r border-gray-100 p-3">
                  <div className="text-[12px] font-bold text-gray-500 mb-2 px-1">
                    权限信息（名称 / 权限字符 / 权限说明）
                  </div>
                  <div className="space-y-1">
                    {PERM_TREE.map((item, idx) => (
                      <div
                        key={item.code}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-gray-100 hover:bg-gray-50"
                      >
                        <span className="text-[12px] text-gray-400 w-4">{idx + 1}</span>
                        <span className="text-[13px] font-medium text-gray-800 flex-1">
                          {item.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-100 text-gray-600">
                          {item.code}
                        </span>
                        <span className="material-symbols-outlined text-[16px] text-gray-400 cursor-pointer">
                          edit
                        </span>
                        <span className="material-symbols-outlined text-[16px] text-gray-400 cursor-pointer">
                          add
                        </span>
                        <span className="material-symbols-outlined text-[16px] text-rose-400 cursor-pointer">
                          delete
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-r border-gray-100 p-3">
                  <div className="text-[12px] font-bold text-gray-700 mb-1">菜单</div>
                  <div className="text-[11px] text-gray-400 mb-3">
                    点选菜单后，在右侧查看它的按钮
                  </div>
                  <div className="space-y-1 text-[12px]">
                    {MENU_TREE.map((item) => (
                      <div key={item.name} className="space-y-0.5">
                        <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                          <span>{item.name}</span>
                          <span className="text-gray-400 font-mono text-[10px]">
                            {item.name === '首页' ? 'home' : 'auditManage'}
                          </span>
                        </label>
                        {item.children.map((child) => (
                          <label
                            key={child}
                            className="flex items-center gap-2 pl-7 pr-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
                          >
                            <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                            <span>{child}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3 flex flex-col">
                  <div className="text-[12px] font-bold text-gray-700 mb-1">按钮</div>
                  <div className="text-[11px] text-gray-400 mb-3">当前菜单：首页</div>
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <span className="material-symbols-outlined text-[40px] text-gray-300 mb-1">
                      inbox
                    </span>
                    <div className="text-[12px]">该菜单暂无按钮</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {topTab === 'role' && (
          <div className="flex-1 min-w-0 p-5 overflow-auto">
            <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden min-h-[520px]">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="text-sm font-bold text-gray-900">
                  「点点速豹」应用角色列表 ({ROLES.length})
                </div>
                <button
                  type="button"
                  onClick={() => toast('添加新角色（演示）')}
                  className="h-8 px-3 rounded-md bg-[#1677ff] text-white text-[12px] font-semibold cursor-pointer"
                >
                  + 添加新角色
                </button>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-[240px_1fr_220px] min-h-[460px]">
                <div className="border-r border-gray-100 p-3 space-y-2">
                  {ROLES.map((role) => (
                    <button
                      key={role.code}
                      type="button"
                      onClick={() => setSelectedRole(role.name)}
                      className={`w-full text-left p-3 rounded-lg border cursor-pointer ${
                        selectedRole === role.name
                          ? 'border-[#1677ff] bg-blue-50/60'
                          : 'border-gray-100 hover:border-blue-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-bold text-gray-900">{role.name}</span>
                        <span className="text-[10px] font-bold text-emerald-600">启用</span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">{role.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="border-r border-gray-100 p-4">
                  <div className="text-[13px] font-bold text-gray-800 mb-3">
                    模块权限选择（支持多选）
                  </div>
                  <div className="space-y-2">
                    {PERM_TREE.map((item) => (
                      <label
                        key={item.code}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer"
                      >
                        <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                        <span className="text-[13px] text-gray-800 flex-1">{item.name}</span>
                        <span className="text-[11px] text-gray-400">全选子项 0/0</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-gray-50/50">
                  <div className="text-[12px] font-bold text-gray-700 mb-2">菜单与按钮预览</div>
                  <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                    {MENU_TREE.map((item) => (
                      <div key={item.name} className="border-b border-gray-50 last:border-b-0">
                        <div className="px-3 py-2.5 text-[12px] font-medium text-gray-800 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-gray-400">
                            apps
                          </span>
                          {item.name}
                        </div>
                        {item.children.map((child) => (
                          <div
                            key={child}
                            className="pl-9 pr-3 py-1.5 text-[11px] text-gray-500 border-t border-gray-50"
                          >
                            {child}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {topTab === 'dict' && (
          <div className="flex-1 min-w-0 p-5 overflow-auto">
            <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-4 min-h-[520px]">
              <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 text-sm font-bold text-gray-900">
                  字典分类目录
                </div>
                <div className="p-3">
                  <input
                    type="text"
                    placeholder="搜索分类"
                    className="w-full h-8 px-2.5 mb-3 border border-gray-200 rounded-md text-[12px] focus:outline-none focus:border-[#1677ff]"
                  />
                  <div className="space-y-1">
                    <div className="px-2 py-1.5 text-[13px] font-semibold text-gray-800">点点速豹</div>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 rounded-md bg-blue-50 text-[#1677ff] text-[12px] font-semibold cursor-pointer"
                    >
                      应用级字典
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="text-sm font-bold text-gray-900">点点速豹</div>
                  <a
                    href="https://v8center.mt.knwl.cn/dictionaryPublic?appCode=V8-P-14"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] text-[#1677ff] hover:underline break-all"
                  >
                    https://v8center.mt.knwl.cn/dictionaryPublic?appCode=V8-P-14
                  </a>
                </div>
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="搜索字典名称 / 编码"
                    className="h-8 flex-1 px-2.5 border border-gray-200 rounded-md text-[12px] focus:outline-none focus:border-[#1677ff]"
                  />
                  <button
                    type="button"
                    className="h-8 px-3 rounded-md bg-[#1677ff] text-white text-[12px] font-semibold cursor-pointer"
                  >
                    搜索
                  </button>
                  <button
                    type="button"
                    className="h-8 px-3 rounded-md border border-gray-200 text-[12px] text-gray-600 cursor-pointer"
                  >
                    重置
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between px-3 py-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                    <div>
                      <div className="text-[13px] font-semibold text-gray-900">审核驳回理由</div>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                        audit_rejection_reason
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {topTab === 'external' && (
          <>
            <SideNav
              items={EXTERNAL_SUB}
              activeId={externalSub}
              onChange={(id) => setExternalSub(id as ExternalSub)}
            />
            <div className="flex-1 min-w-0 p-5 overflow-auto">
              {externalSub === 'address' && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-5 space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">外部系统地址</h2>
                    <p className="text-[12px] text-gray-500 mt-1">
                      配置外部协同系统回调与接入地址，供邀请注册与权限同步使用
                    </p>
                  </div>
                  {[
                    { label: '外部注册回调地址', value: 'https://subao.cn/ext/callback' },
                    { label: '外部用户同步地址', value: 'https://subao.cn/ext/sync' },
                    { label: '单点登录入口', value: 'https://subao.cn/sso' },
                  ].map((row) => (
                    <div key={row.label}>
                      <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
                        {row.label}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          defaultValue={row.value}
                          className="h-9 flex-1 px-3 border border-gray-200 rounded-md text-[13px] focus:outline-none focus:border-[#1677ff]"
                        />
                        <CopyBtn text={row.value} onCopied={() => toast('已复制网址')} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => toast('外部系统地址已保存')}
                      className="h-8 px-4 rounded-md bg-[#1677ff] text-white text-[12px] font-semibold cursor-pointer"
                    >
                      保存
                    </button>
                  </div>
                </div>
              )}

              {externalSub === 'invite' && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-5 space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">默认邀请配置</h2>
                      <p className="text-[12px] text-gray-500 mt-1">
                        配置外部人员默认邀请方式与注册页展示信息
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast('邀请配置已保存')}
                      className="h-8 px-3 rounded-md bg-[#1677ff] text-white text-[12px] font-semibold cursor-pointer shrink-0"
                    >
                      保存
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(
                      [
                        { key: 'code' as const, label: '激活码' },
                        { key: 'qr' as const, label: '动态二维码' },
                        { key: 'link' as const, label: '邀请链接' },
                      ] as const
                    ).map((item) => (
                      <label
                        key={item.key}
                        className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer ${
                          inviteMethods[item.key]
                            ? 'border-[#1677ff] bg-blue-50/40'
                            : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={inviteMethods[item.key]}
                          onChange={(e) =>
                            setInviteMethods((prev) => ({ ...prev, [item.key]: e.target.checked }))
                          }
                          className="rounded border-gray-300"
                        />
                        <span className="text-[13px] font-medium text-gray-800">{item.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100">
                    <span className="text-[13px] text-gray-700">批量邀请</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={inviteBatch}
                      onClick={() => setInviteBatch((v) => !v)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer ${
                        inviteBatch ? 'bg-[#1677ff]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                          inviteBatch ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
                        标题
                      </label>
                      <input
                        type="text"
                        defaultValue="点点速豹 · 外部人员邀请注册"
                        className="w-full h-9 px-3 border border-gray-200 rounded-md text-[13px] focus:outline-none focus:border-[#1677ff]"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
                        描述
                      </label>
                      <input
                        type="text"
                        defaultValue="请完善资料完成激活，加入协同报送"
                        className="w-full h-9 px-3 border border-gray-200 rounded-md text-[13px] focus:outline-none focus:border-[#1677ff]"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-[12px] font-medium text-gray-700 mb-1.5">
                      * 注册页 Logo
                    </div>
                    <p className="text-[11px] text-gray-400 mb-2">
                      展示在激活注册页标题左侧，建议正方形透明底图
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8]" />
                      <button
                        type="button"
                        className="h-8 px-3 rounded-md border border-[#1677ff] text-[#1677ff] text-[12px] font-semibold cursor-pointer"
                      >
                        更换图片
                      </button>
                      <button
                        type="button"
                        className="h-8 px-3 rounded-md border border-gray-200 text-gray-600 text-[12px] cursor-pointer"
                      >
                        移除
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-[13px] font-bold text-gray-800">邀请注册字段</div>
                        <div className="text-[11px] text-gray-400">
                          应用字段固定，预留字段设置别名后即可使用
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 border-b border-gray-100 mb-3 overflow-x-auto">
                      {['通用默认', '网格员', '审核员', '节点负责人', '系统管理员'].map(
                        (tab, idx) => (
                          <button
                            key={tab}
                            type="button"
                            className={`px-3 py-2 text-[12px] whitespace-nowrap cursor-pointer ${
                              idx === 0
                                ? 'text-[#1677ff] font-semibold border-b-2 border-[#1677ff]'
                                : 'text-gray-500'
                            }`}
                          >
                            {tab}
                          </button>
                        )
                      )}
                    </div>
                    <div className="overflow-x-auto border border-gray-100 rounded-lg">
                      <table className="w-full text-left text-[12px]">
                        <thead className="bg-gray-50 text-gray-500">
                          <tr>
                            <th className="px-3 py-2 font-medium">#</th>
                            <th className="px-3 py-2 font-medium">字段名称</th>
                            <th className="px-3 py-2 font-medium">别名</th>
                            <th className="px-3 py-2 font-medium">是否填写</th>
                            <th className="px-3 py-2 font-medium">是否必填</th>
                            <th className="px-3 py-2 font-medium">扩展配置</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {[
                            { name: '姓名', code: 'real_name', required: true, extra: '' },
                            {
                              name: '手机',
                              code: 'phone_number',
                              required: true,
                              extra: '验证码校验',
                            },
                            { name: '身份证', code: 'id_card_no', required: false, extra: '' },
                            {
                              name: '政治面貌',
                              code: 'political_status',
                              required: false,
                              extra: '',
                            },
                          ].map((row, idx) => (
                            <tr key={row.code}>
                              <td className="px-3 py-2.5 text-gray-400">{idx + 1}</td>
                              <td className="px-3 py-2.5">
                                <div className="font-medium text-gray-800">
                                  {row.name}{' '}
                                  <span className="text-[10px] text-blue-500 font-bold">预置</span>
                                </div>
                                <div className="text-[10px] text-gray-400 font-mono">{row.code}</div>
                              </td>
                              <td className="px-3 py-2.5 text-gray-400">—</td>
                              <td className="px-3 py-2.5">
                                <input type="checkbox" defaultChecked className="rounded" />
                              </td>
                              <td className="px-3 py-2.5">
                                {row.required ? (
                                  <input type="checkbox" defaultChecked className="rounded" />
                                ) : (
                                  <span className="text-gray-400">选填</span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-gray-500">{row.extra || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {externalSub === 'ext_perm' && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toast('新建主权限（演示）')}
                      className="h-8 px-3 rounded-md bg-[#1677ff] text-white text-[12px] font-semibold cursor-pointer"
                    >
                      + 新建主权限
                    </button>
                    <button
                      type="button"
                      className="h-8 px-3 rounded-md border border-gray-200 text-[12px] text-gray-600 cursor-pointer"
                    >
                      全部展开
                    </button>
                    <button
                      type="button"
                      className="h-8 px-3 rounded-md border border-gray-200 text-[12px] text-gray-600 cursor-pointer"
                    >
                      全部收起
                    </button>
                  </div>
                  <div className="p-3 space-y-1">
                    {EXT_PERMS.map((item, idx) => (
                      <div
                        key={item.code}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-gray-100"
                      >
                        <span className="text-[12px] text-gray-400 w-4">{idx + 1}</span>
                        <span className="text-[13px] font-medium text-gray-800 flex-1">
                          {item.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-100 text-gray-600">
                          {item.code}
                        </span>
                        <span className="material-symbols-outlined text-[16px] text-gray-400">
                          edit
                        </span>
                        <span className="material-symbols-outlined text-[16px] text-gray-400">
                          add
                        </span>
                        <span className="material-symbols-outlined text-[16px] text-rose-400">
                          delete
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {externalSub === 'ext_role' && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden min-h-[480px]">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="text-sm font-bold text-gray-900">
                      「点点速豹」外部角色列表 ({EXT_ROLES.length})
                    </div>
                    <button
                      type="button"
                      onClick={() => toast('添加新角色（演示）')}
                      className="h-8 px-3 rounded-md bg-[#1677ff] text-white text-[12px] font-semibold cursor-pointer"
                    >
                      + 添加新角色
                    </button>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] min-h-[420px]">
                    <div className="border-r border-gray-100 p-3 space-y-2">
                      {EXT_ROLES.map((role) => (
                        <button
                          key={role.code}
                          type="button"
                          onClick={() => setSelectedExtRole(role.name)}
                          className={`w-full text-left p-3 rounded-lg border cursor-pointer ${
                            selectedExtRole === role.name
                              ? 'border-[#1677ff] bg-blue-50/60'
                              : 'border-gray-100 hover:border-blue-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-bold text-gray-900">{role.name}</span>
                            <span className="text-[10px] font-bold text-emerald-600">启用</span>
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono mt-1">{role.code}</div>
                        </button>
                      ))}
                    </div>
                    <div className="p-4">
                      <div className="text-[13px] font-bold text-gray-800 mb-3">
                        模块权限选择（当前角色：{selectedExtRole}）
                      </div>
                      <div className="space-y-2">
                        {EXT_PERMS.map((item) => (
                          <label
                            key={item.code}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer"
                          >
                            <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                            <span className="text-[13px] text-gray-800 flex-1">{item.name}</span>
                            <span className="text-[11px] text-gray-400">全选子项 0/0</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {externalSub === 'ext_user' && (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-2xs p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <select className="h-8 px-2 border border-gray-200 rounded-md text-[12px] bg-white">
                        <option>所属应用：点点速豹</option>
                      </select>
                      <select className="h-8 px-2 border border-gray-200 rounded-md text-[12px] bg-white">
                        <option>所属机构：全部</option>
                      </select>
                      <select className="h-8 px-2 border border-gray-200 rounded-md text-[12px] bg-white">
                        <option>状态：全部</option>
                      </select>
                      <input
                        type="text"
                        placeholder="昵称 / 姓名 / OpenID"
                        className="h-8 px-2.5 border border-gray-200 rounded-md text-[12px] w-48 focus:outline-none focus:border-[#1677ff]"
                      />
                      <button
                        type="button"
                        className="h-8 px-3 rounded-md bg-[#1677ff] text-white text-[12px] font-semibold cursor-pointer"
                      >
                        搜索
                      </button>
                      <button
                        type="button"
                        className="h-8 px-3 rounded-md border border-gray-200 text-[12px] text-gray-600 cursor-pointer"
                      >
                        重置
                      </button>
                      <button
                        type="button"
                        onClick={() => toast('已打开邀请用户（演示）')}
                        className="h-8 px-3 rounded-md border border-[#1677ff] text-[#1677ff] text-[12px] font-semibold cursor-pointer ml-auto"
                      >
                        邀请用户
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: '外部用户总数', value: 14, color: 'text-[#1677ff]' },
                      { label: '启用用户', value: 14, color: 'text-emerald-600' },
                      { label: '停用用户', value: 0, color: 'text-rose-500' },
                    ].map((card) => (
                      <div
                        key={card.label}
                        className="bg-white rounded-xl border border-gray-100 shadow-2xs px-4 py-3"
                      >
                        <div className="text-[12px] text-gray-500">{card.label}</div>
                        <div className={`text-[22px] font-bold mt-1 ${card.color}`}>{card.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[12px]">
                        <thead className="bg-gray-50 text-gray-500">
                          <tr>
                            <th className="px-3 py-2.5 font-medium">所属应用</th>
                            <th className="px-3 py-2.5 font-medium">所属机构</th>
                            <th className="px-3 py-2.5 font-medium">用户信息</th>
                            <th className="px-3 py-2.5 font-medium">外部角色</th>
                            <th className="px-3 py-2.5 font-medium">状态</th>
                            <th className="px-3 py-2.5 font-medium">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {[
                            {
                              org: '台湾省网信办',
                              name: '陈小明',
                              nick: '网格员小明',
                              roles: ['网格员'],
                            },
                            {
                              org: '台中市网信办',
                              name: '李审核',
                              nick: '审核李',
                              roles: ['审核员', '网格员'],
                            },
                          ].map((row) => (
                            <tr key={row.name} className="hover:bg-gray-50/60">
                              <td className="px-3 py-3">点点速豹</td>
                              <td className="px-3 py-3">{row.org}</td>
                              <td className="px-3 py-3">
                                <div className="font-medium text-gray-900">{row.nick}</div>
                                <div className="text-[11px] text-gray-400">
                                  {row.name} · openid_****
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {row.roles.map((r) => (
                                    <span
                                      key={r}
                                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#1677ff] border border-blue-100"
                                    >
                                      {r}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <span className="inline-flex h-5 w-9 items-center rounded-full bg-emerald-500 relative">
                                  <span className="absolute right-0.5 w-4 h-4 rounded-full bg-white shadow" />
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <button
                                  type="button"
                                  className="text-[#1677ff] hover:underline cursor-pointer mr-2"
                                >
                                  配置
                                </button>
                                <button
                                  type="button"
                                  className="text-rose-500 hover:underline cursor-pointer"
                                >
                                  删除
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};
