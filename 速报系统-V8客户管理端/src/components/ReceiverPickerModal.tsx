import React, { useMemo, useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';

export interface Receiver {
  id: string;
  name: string;
  sub: string;
  org: string;
  external?: boolean;
}

interface ReceiverGroup {
  id: string;
  name: string;
  members: Receiver[];
}

const group = (id: string, name: string, members: [string, string, string][]): ReceiverGroup => ({
  id,
  name,
  members: members.map(([mid, mname, sub]) => ({ id: mid, name: mname, sub, org: name }))
});

export const INTERNAL_GROUPS: ReceiverGroup[] = [
  group('g-cac', '台中市网信办', [
    ['wangxulong', '王旭龙', '网安处置科'],
    ['zhaoli', '赵力', '舆情科'],
    ['qizhongbiao', '戚中彪', '综合科'],
    ['wangxiao', '王晓', '舆情监测中心'],
    ['chenyang', '晨阳', '网络传播科'],
    ['zhanghua', '张华', '法规科'],
    ['yangfubin', '杨福宾', '网安处置科'],
    ['paopao', '泡泡', '网信值班']
  ]),
  group('g-test', '测试分组062401', [
    ['ceshi01', '测试用户01', '测试岗'],
    ['ceshi02', '测试用户02', '测试岗']
  ]),
  group('g-yq1', '舆情处置科1', [
    ['liming', '李明', '处置一组'],
    ['chenjing', '陈静', '处置一组'],
    ['zhoutao', '周涛', '处置二组']
  ]),
  group('g-sec', '网络安全处', [
    ['liuyang', '刘洋', '网络监管'],
    ['wujie', '吴杰', '等保测评']
  ]),
  group('g-emg', '应急指挥中心', [
    ['sunyue', '孙悦', '热线运行'],
    ['heqian', '何倩', '应急值守'],
    ['gaofeng', '高峰', '调度室']
  ])
];

const INITIAL_EXTERNAL: Receiver[] = [
  { id: 'ext-1', name: '林峰', sub: '市教育局 / 校园安全科', org: '外部联系人', external: true },
  { id: 'ext-2', name: '郑凯', sub: '市市场监管局 / 网络监管处', org: '外部联系人', external: true },
  { id: 'ext-3', name: '吴倩', sub: '市文旅局 / 宣传推广科', org: '外部联系人', external: true },
  { id: 'ext-4', name: '周婷', sub: '西屯区环保局', org: '外部联系人', external: true }
];

const AVATAR_COLORS = [
  'bg-blue-50 text-blue-600 border-blue-100',
  'bg-amber-50 text-amber-600 border-amber-100',
  'bg-violet-50 text-violet-600 border-violet-100',
  'bg-emerald-50 text-emerald-600 border-emerald-100',
  'bg-rose-50 text-rose-600 border-rose-100',
  'bg-sky-50 text-sky-600 border-sky-100'
];

const avatarColor = (id: string) =>
  AVATAR_COLORS[[...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % AVATAR_COLORS.length];

export const ReceiverAvatar: React.FC<{ receiver: Receiver; size?: 'sm' | 'md' }> = ({ receiver, size = 'md' }) => (
  <span
    className={`shrink-0 rounded-full border flex items-center justify-center font-bold ${avatarColor(receiver.id)} ${
      size === 'sm' ? 'w-6 h-6 text-[11px]' : 'w-8 h-8 text-xs'
    }`}
  >
    {receiver.name.slice(0, 1)}
  </span>
);

const SEARCH_MAX = 100;

interface ReceiverPickerModalProps {
  value: Receiver[];
  onClose: () => void;
  onConfirm: (receivers: Receiver[]) => void;
}

export const ReceiverPickerModal: React.FC<ReceiverPickerModalProps> = ({ value, onClose, onConfirm }) => {
  const [tab, setTab] = useState<'internal' | 'external'>('internal');
  const [groupId, setGroupId] = useState(INTERNAL_GROUPS[0].id);
  const [keyword, setKeyword] = useState('');
  const [externals, setExternals] = useState<Receiver[]>(() => {
    const extra = value.filter((r) => r.external && !INITIAL_EXTERNAL.some((e) => e.id === r.id));
    return [...INITIAL_EXTERNAL, ...extra];
  });
  const [selected, setSelected] = useState<Receiver[]>(value);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteUnit, setInviteUnit] = useState('');

  const kw = keyword.trim();
  const activeGroup = INTERNAL_GROUPS.find((g) => g.id === groupId) ?? INTERNAL_GROUPS[0];

  const visible = useMemo(() => {
    const pool =
      tab === 'external' ? externals : kw ? INTERNAL_GROUPS.flatMap((g) => g.members) : activeGroup.members;
    return kw ? pool.filter((r) => r.name.includes(kw)) : pool;
  }, [tab, externals, kw, activeGroup]);

  const listTitle = kw ? `搜索结果 (${visible.length})` : tab === 'external' ? '外部联系人' : activeGroup.name;

  const isSelected = (id: string) => selected.some((r) => r.id === id);
  const visibleSelectedCount = visible.filter((r) => isSelected(r.id)).length;
  const allVisibleSelected = visible.length > 0 && visibleSelectedCount === visible.length;

  const toggle = (r: Receiver) =>
    setSelected((prev) => (prev.some((x) => x.id === r.id) ? prev.filter((x) => x.id !== r.id) : [...prev, r]));

  const toggleAll = () =>
    setSelected((prev) =>
      allVisibleSelected
        ? prev.filter((x) => !visible.some((v) => v.id === x.id))
        : [...prev, ...visible.filter((v) => !prev.some((x) => x.id === v.id))]
    );

  const submitInvite = () => {
    const name = inviteName.trim();
    if (!name) return;
    const contact: Receiver = {
      id: `ext-${Date.now()}`,
      name,
      sub: inviteUnit.trim() || '外部联系人',
      org: '外部联系人',
      external: true
    };
    setExternals((prev) => [...prev, contact]);
    setSelected((prev) => [...prev, contact]);
    setTab('external');
    setInviteOpen(false);
    setInviteName('');
    setInviteUnit('');
  };

  const tabClass = (active: boolean) =>
    `relative px-4 py-3 text-xs font-bold cursor-pointer transition-colors ${
      active ? 'text-[#1E5ABB]' : 'text-slate-500 hover:text-gray-800'
    }`;

  return (
    <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[82vh] flex flex-col overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <h3 className="text-base font-bold text-gray-900">选择接收人</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-4 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={keyword}
              maxLength={SEARCH_MAX}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="请输入人员姓名"
              className="w-full pl-10 pr-20 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#1E5ABB] focus:ring-2 focus:ring-[#1E5ABB]/15 transition-all"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400">
              {keyword.length} / {SEARCH_MAX}
            </span>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col min-w-0 border-r border-slate-100">
            <div className="flex px-4 border-b border-slate-100">
              <button onClick={() => setTab('internal')} className={tabClass(tab === 'internal')}>
                内部用户
                {tab === 'internal' && <span className="absolute left-2 right-2 bottom-0 h-0.5 rounded-full bg-[#1E5ABB]" />}
              </button>
              <button onClick={() => setTab('external')} className={tabClass(tab === 'external')}>
                外部联系人 ({externals.length})
                {tab === 'external' && <span className="absolute left-2 right-2 bottom-0 h-0.5 rounded-full bg-[#1E5ABB]" />}
              </button>
            </div>

            <div className="flex-1 flex min-h-0">
              {tab === 'internal' && (
                <nav className="w-44 shrink-0 border-r border-slate-100 bg-slate-50/50 p-2 space-y-1 overflow-y-auto">
                  {INTERNAL_GROUPS.map((g) => {
                    const active = !kw && g.id === groupId;
                    const count = g.members.filter((m) => isSelected(m.id)).length;
                    return (
                      <button
                        key={g.id}
                        onClick={() => {
                          setGroupId(g.id);
                          setKeyword('');
                        }}
                        className={`w-full flex items-center justify-between gap-1 px-3 py-2.5 rounded-lg text-left text-xs cursor-pointer transition-colors ${
                          active ? 'bg-white text-[#1E5ABB] font-bold shadow-2xs' : 'text-gray-700 hover:bg-white/70'
                        }`}
                      >
                        <span className="truncate" title={g.name}>{g.name}</span>
                        {count > 0 && (
                          <span className="shrink-0 min-w-4 h-4 px-1 rounded-full bg-[#1E5ABB] text-white text-[10px] leading-4 text-center">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              )}

              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                  <span className="text-xs font-bold text-[#1E5ABB] truncate">{listTitle}</span>
                  <label className="shrink-0 flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
                    全选 (已选 {visibleSelectedCount} 人)
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      disabled={visible.length === 0}
                      onChange={toggleAll}
                      className="w-4 h-4 accent-[#1E5ABB] cursor-pointer"
                    />
                  </label>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {visible.length === 0 && (
                    <div className="py-16 text-center text-xs text-slate-400">暂无匹配人员</div>
                  )}
                  {visible.map((r) => {
                    const checked = isSelected(r.id);
                    return (
                      <label
                        key={r.id}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                          checked ? 'border-blue-200 bg-blue-50/70' : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/30'
                        }`}
                      >
                        <ReceiverAvatar receiver={r} />
                        <span className="flex-1 min-w-0">
                          <span className="block text-xs font-bold text-gray-900 truncate">{r.name}</span>
                          <span className="block text-[11px] text-slate-400 truncate">
                            {kw && !r.external ? `${r.org} · ${r.sub}` : r.sub}
                          </span>
                        </span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(r)}
                          className="w-4 h-4 accent-[#1E5ABB] cursor-pointer"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <aside className="w-72 shrink-0 flex flex-col min-h-0">
            <div className="flex items-center justify-between mx-4 py-3 border-b border-slate-100">
              <span className="text-xs font-bold text-gray-900">已选择 ({selected.length})</span>
              <button
                onClick={() => setSelected([])}
                disabled={selected.length === 0}
                className="text-[11px] text-slate-400 hover:text-[#1E5ABB] disabled:hover:text-slate-400 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                清空列表
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {selected.length === 0 && <div className="py-16 text-center text-xs text-slate-400">暂未选择接收人</div>}
              {selected.map((r) => (
                <div key={r.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white">
                  <ReceiverAvatar receiver={r} size="sm" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-bold text-gray-800 truncate">{r.name}</span>
                    <span className="block text-[10px] text-slate-400 truncate">{r.external ? r.sub : r.org}</span>
                  </span>
                  <button
                    onClick={() => toggle(r)}
                    className="p-0.5 rounded text-slate-300 hover:text-rose-500 cursor-pointer transition-colors"
                    title="移除"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/40">
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#1E5ABB] text-[#1E5ABB] bg-white hover:bg-blue-50 text-xs font-bold cursor-pointer transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            邀请联系人
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-gray-700 text-xs font-bold cursor-pointer transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => onConfirm(selected)}
              className="px-6 py-2 rounded-xl bg-[#1E5ABB] hover:bg-[#134092] text-white text-xs font-bold cursor-pointer shadow-2xs transition-colors"
            >
              提交
            </button>
          </div>
        </div>
      </div>

      {inviteOpen && (
        <div className="fixed inset-0 z-[80] bg-black/30 flex items-center justify-center p-4" onClick={() => setInviteOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <span className="text-sm font-bold text-gray-900">邀请联系人</span>
              <button onClick={() => setInviteOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-700">
                  <span className="text-rose-500 mr-0.5">*</span>姓名
                </label>
                <input
                  value={inviteName}
                  maxLength={20}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="请输入联系人姓名"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-[#1E5ABB] focus:ring-2 focus:ring-[#1E5ABB]/15"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-700">所属单位</label>
                <input
                  value={inviteUnit}
                  maxLength={50}
                  onChange={(e) => setInviteUnit(e.target.value)}
                  placeholder="请输入所属单位 / 部门"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-[#1E5ABB] focus:ring-2 focus:ring-[#1E5ABB]/15"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 px-5 py-3.5 border-t border-slate-100">
              <button
                onClick={() => setInviteOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 text-gray-600 text-xs font-bold cursor-pointer hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={submitInvite}
                disabled={!inviteName.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#1E5ABB] hover:bg-[#134092] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold cursor-pointer"
              >
                添加并选中
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
