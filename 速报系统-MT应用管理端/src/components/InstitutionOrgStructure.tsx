import React, { useMemo, useState } from 'react';

interface OrgNode {
  id: string;
  name: string;
  children?: OrgNode[];
}

interface OrgMember {
  name: string;
  role: string;
  phone: string;
  status: 'normal' | 'locked';
}

interface OrgDetail {
  code: string;
  parentName: string;
  contact: string;
  tel: string;
  members: OrgMember[];
  total: number;
  opened: number;
  locked: number;
}

const ORG_CHILDREN: OrgNode[] = [
  { id: 'n1', name: '情报指挥中心' },
  { id: 'n2', name: '警务督察审计支队' },
  { id: 'n3', name: '人事训练科' },
  { id: 'n4', name: '新闻宣传科' },
  { id: 'n5', name: '机关党委' },
  { id: 'n6', name: '经济犯罪侦查支队' },
  { id: 'n7', name: '治安管理支队' },
  {
    id: 'n8',
    name: '刑事侦查支队',
    children: [
      { id: 'n8-1', name: '刑侦一大队（重案）' },
      { id: 'n8-2', name: '反电信网络诈骗大队' },
    ],
  },
  { id: 'n9', name: '特警支队' },
  { id: 'n10', name: '环境资源和食品药品犯罪侦查支队' },
  {
    id: 'n11',
    name: '网络安全保卫支队',
    children: [
      { id: 'n11-1', name: '网络情报研判大队' },
      { id: 'n11-2', name: '网络犯罪侦查大队' },
    ],
  },
  { id: 'n12', name: '交通管理支队' },
  { id: 'n13', name: '法制支队' },
  { id: 'n14', name: '出入境管理支队' },
];

const SURNAMES = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙'];
const ROLES = ['机构主管', '审核员', '处置员', '协同成员'];

const hashOf = (text: string) =>
  Array.from(text).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);

const maskName = (name: string) => (name.length <= 1 ? name : `${name[0]}***${name.length > 2 ? name[name.length - 1] : '人'}`);

const buildDetail = (node: OrgNode, parentName: string, index: number): OrgDetail => {
  const h = hashOf(node.id + node.name);
  const count = node.id === 'root' ? 12 : 1 + (h % 6);
  const members: OrgMember[] = Array.from({ length: count }, (_, i) => {
    const mh = hashOf(`${node.id}-${i}`);
    return {
      name: `${SURNAMES[mh % SURNAMES.length]}${i === 0 ? '主管' : '成员'}`,
      role: i === 0 ? ROLES[0] : ROLES[1 + (mh % 3)],
      phone: `13${mh % 10}${String(mh % 100000000).padStart(8, '0')}`,
      status: i > 0 && mh % 9 === 0 ? 'locked' : 'normal',
    };
  });
  const locked = members.filter((m) => m.status === 'locked').length;
  return {
    code: `WZ-GA-${String(3900 + index * 7 + (h % 7)).padStart(4, '0')}`,
    parentName,
    contact: `${SURNAMES[h % SURNAMES.length]}主任`,
    tel: `0953-${String(2018000 + (h % 1000)).padStart(7, '0')}`,
    members,
    total: count,
    opened: count,
    locked,
  };
};

const filterTree = (nodes: OrgNode[], keyword: string): OrgNode[] => {
  if (!keyword) return nodes;
  return nodes.flatMap((node) => {
    const children = node.children ? filterTree(node.children, keyword) : [];
    if (node.name.includes(keyword) || children.length > 0) {
      return [{ ...node, children: children.length > 0 ? children : node.children }];
    }
    return [];
  });
};

interface InstitutionOrgStructureProps {
  institutionName: string;
}

export const InstitutionOrgStructure: React.FC<InstitutionOrgStructureProps> = ({ institutionName }) => {
  const rootName = institutionName || '本机构';
  const tree = useMemo<OrgNode[]>(
    () => [{ id: 'root', name: rootName, children: ORG_CHILDREN }],
    [rootName],
  );

  const detailMap = useMemo(() => {
    const map = new Map<string, { node: OrgNode; detail: OrgDetail }>();
    let index = 0;
    const walk = (nodes: OrgNode[], parentName: string) => {
      nodes.forEach((node) => {
        map.set(node.id, { node, detail: buildDetail(node, parentName, index++) });
        if (node.children) walk(node.children, node.name);
      });
    };
    walk(tree, '—');
    return map;
  }, [tree]);

  const [keyword, setKeyword] = useState('');
  const [selectedId, setSelectedId] = useState('root');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [revealPhones, setRevealPhones] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const visibleTree = useMemo(() => filterTree(tree, keyword.trim()), [tree, keyword]);
  const selected = detailMap.get(selectedId) ?? detailMap.get('root')!;
  const { node, detail } = selected;
  const normalCount = detail.total - detail.locked;

  const allParentIds = useMemo(
    () => Array.from(detailMap.values()).filter((v) => v.node.children?.length).map((v) => v.node.id),
    [detailMap],
  );
  const isAllCollapsed = allParentIds.every((id) => id === 'root' || collapsed.has(id));

  const toggleNode = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderNodes = (nodes: OrgNode[], depth: number): React.ReactNode =>
    nodes.map((item) => {
      const hasChildren = Boolean(item.children?.length);
      const isOpen = hasChildren && (keyword.trim() ? true : !collapsed.has(item.id));
      const isActive = item.id === selectedId;
      const isRoot = item.id === 'root';
      return (
        <div key={item.id}>
          <div
            className={`group flex items-center gap-1.5 h-8 pr-2 rounded-md cursor-pointer text-[13px] transition-colors ${
              isActive ? 'bg-blue-50 text-[#1E3A6B] font-bold' : 'text-gray-700 hover:bg-gray-50'
            }`}
            style={{ paddingLeft: depth * 22 + 6 }}
            onClick={() => {
              setSelectedId(item.id);
              setExpandedIndex(null);
            }}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(item.id);
                }}
                className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-700"
              >
                <span className={`material-symbols-outlined text-[16px] transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                  chevron_right
                </span>
              </button>
            ) : (
              <span className="w-4" />
            )}
            <span
              className={`material-symbols-outlined text-[16px] ${
                isRoot ? 'text-[#1E3A6B]' : isActive ? 'text-[#1890ff]' : 'text-indigo-400'
              }`}
            >
              {isRoot ? 'apartment' : isActive ? 'layers' : 'hexagon'}
            </span>
            <span className="truncate" title={item.name}>
              {item.name}
            </span>
          </div>
          {isOpen && item.children && renderNodes(item.children, depth + 1)}
        </div>
      );
    });

  return (
    <div className="flex gap-4 items-start">
      {/* 左侧：组织拓扑树 */}
      <aside className="w-[320px] shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col max-h-[680px]">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-900 min-w-0">
            <span className="material-symbols-outlined text-[18px] text-gray-700">explore</span>
            <span className="truncate">{rootName}机构拓扑树</span>
          </h3>
          <button
            type="button"
            onClick={() => setCollapsed(isAllCollapsed ? new Set() : new Set(allParentIds.filter((id) => id !== 'root')))}
            className="shrink-0 px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
          >
            {isAllCollapsed ? '展开' : '折叠'}
          </button>
        </div>
        <div className="px-4 py-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
              search
            </span>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索机构名称、负责人..."
              className="w-full h-9 pl-8 pr-3 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-[#1890ff] focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {visibleTree.length > 0 ? (
            renderNodes(visibleTree, 0)
          ) : (
            <div className="py-10 text-center text-xs text-gray-400">未找到匹配的组织节点</div>
          )}
        </div>
      </aside>

      {/* 右侧：组织详情（只读） */}
      <section className="flex-1 min-w-0 space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-[#1E3A6B] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px] text-sky-300">corporate_fare</span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-gray-900 truncate">{node.name}</h2>
            <p className="mt-1 text-xs text-gray-500">
              编码：<span className="font-mono font-semibold text-gray-700">{detail.code}</span>
              <span className="mx-2 text-gray-300">·</span>
              上级机构：<span className="font-semibold text-gray-700">{detail.parentName}</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md">
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            仅供查看
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h3 className="flex items-center gap-1.5 pb-3 mb-4 border-b border-gray-100 text-sm font-bold text-gray-900">
            <span className="material-symbols-outlined text-[18px] text-[#1890ff]">domain</span>
            组织基本信息
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { icon: 'corporate_fare', label: '组织全称', value: node.name, mono: false },
              { icon: 'person', label: '组织联系人', value: maskName(detail.contact), mono: false },
              { icon: 'call', label: '联系电话 / 值班专线', value: detail.tel, mono: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 bg-slate-50 border border-gray-100 rounded-lg min-w-0">
                <div className="w-9 h-9 rounded-md bg-white border border-gray-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px] text-[#1890ff]">{item.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400">{item.label}</p>
                  <p className={`text-[13px] font-bold text-gray-900 truncate ${item.mono ? 'font-mono' : ''}`} title={item.value}>
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
              <span className="material-symbols-outlined text-[18px] text-[#1890ff]">key</span>
              该组织账号统计与权限状态
            </h3>
            <span className="text-xs text-gray-500">
              实名账号绑定率 <span className="font-bold text-emerald-600">100%</span>
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: '账号总数', value: detail.total, box: 'bg-white border-gray-200', text: 'text-gray-900', labelText: 'text-gray-500' },
              { label: '已开通账号数', value: detail.opened, box: 'bg-blue-50/60 border-blue-100', text: 'text-[#1890ff]', labelText: 'text-gray-600' },
              { label: '正常状态账号', value: normalCount, box: 'bg-slate-50 border-slate-200', text: 'text-gray-900', labelText: 'text-gray-600' },
              { label: '锁定账号', value: detail.locked, box: 'bg-rose-50/60 border-rose-100', text: 'text-rose-600', labelText: 'text-rose-500' },
            ].map((card) => (
              <div key={card.label} className={`p-4 border rounded-lg ${card.box}`}>
                <p className={`text-xs ${card.labelText}`}>{card.label}</p>
                <p className={`mt-2 text-2xl font-bold font-mono ${card.text}`}>
                  {card.value}
                  <span className="ml-1 text-xs font-normal text-gray-400">人</span>
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-5 mb-2">
            <p className="text-xs font-bold text-gray-700">直属人员及账号列表（示例）</p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <button
                type="button"
                onClick={() => setRevealPhones((v) => !v)}
                className="inline-flex items-center gap-1 text-gray-500 hover:text-[#1890ff]"
              >
                <span className="material-symbols-outlined text-[16px]">{revealPhones ? 'visibility_off' : 'visibility'}</span>
                {revealPhones ? '隐藏号码' : '显示号码'}
              </button>
              <span>
                共 <span className="font-bold text-gray-900">{detail.members.length}</span> 名成员
              </span>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-[13px] whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5">姓名</th>
                  <th className="text-left font-medium px-4 py-2.5">角色</th>
                  <th className="text-left font-medium px-4 py-2.5">联系手机</th>
                  <th className="text-left font-medium px-4 py-2.5">账号状态</th>                  <th className="text-right font-medium px-4 py-2.5">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {detail.members.map((member, i) => (
                  <React.Fragment key={i}>
                  <tr className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-bold text-gray-900">{maskName(member.name)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 text-xs rounded border ${
                          member.role === '机构主管'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-600">
                      {revealPhones ? member.phone : `${member.phone.slice(0, 3)}*******${member.phone.slice(-2)}`}
                    </td>
                    <td className="px-4 py-3">
                      {member.status === 'normal' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-[#1E3A6B] bg-blue-50 border border-blue-100 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1890ff]" />
                          正常
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          锁定
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                        className="text-xs font-bold text-[#1E3A6B] hover:text-[#1890ff]"
                      >
                        {expandedIndex === i ? '收起详情' : '查看详情'}
                      </button>
                    </td>
                  </tr>
                  {expandedIndex === i && (
                    <tr className="bg-slate-50/70">
                      <td colSpan={5} className="px-4 py-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-gray-400">所属组织</p>
                            <p className="mt-0.5 font-semibold text-gray-800">{detail.parentName === '—' ? node.name : `${detail.parentName} / ${node.name}`}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">实名认证</p>
                            <p className="mt-0.5 font-semibold text-emerald-600">已实名绑定</p>
                          </div>
                          <div>
                            <p className="text-gray-400">公众号关注</p>
                            <p className="mt-0.5 font-semibold text-gray-800">已关注</p>
                          </div>
                          <div>
                            <p className="text-gray-400">说明</p>
                            <p className="mt-0.5 text-gray-500">仅供查看，账号操作请前往「机构用户管理」</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
