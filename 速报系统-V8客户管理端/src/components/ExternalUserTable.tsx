import React, { useState } from 'react';
import { Building2, Circle, Edit3, Trash2, Users } from 'lucide-react';
import type { OrgNode, PersonnelItem } from '../pages/OrgManagement';
import { formatPersonOrgPaths } from '../data/userOrgShared';
import {
  PersonGroupCell,
  PersonIdentityCell,
  PersonOrgPathCell,
  PersonRoleBadges,
  StatusSwitch
} from './PersonAccountDisplay';

export const getFollowStatus = (item: PersonnelItem) => item.followStatus || '已关注';

export const FollowStatusBadges: React.FC<{ item: PersonnelItem }> = ({ item }) => (
  <>
    {item.status === '禁用' ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-red-200 bg-red-50 text-red-600 text-[11px] font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        停用
      </span>
    ) : getFollowStatus(item) === '已关注' ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-[11px] font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        正常
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-orange-200 bg-orange-50 text-orange-600 text-[11px] font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
        取消关注
      </span>
    )}
  </>
);

const ActionBtn: React.FC<{ title: string; onClick: () => void; children: React.ReactNode }> = ({
  title,
  onClick,
  children
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="w-6 h-6 rounded border border-gray-200 text-gray-500 hover:text-[#1E5ABB] hover:border-blue-200 hover:bg-blue-50 flex items-center justify-center cursor-pointer"
  >
    {children}
  </button>
);

interface ExternalUserTableProps {
  items: PersonnelItem[];
  orgNodes: OrgNode[];
  getGroupName: (id: string) => string;
  startIndex?: number;
  emptyText: string;
  onAvatarClick?: (item: PersonnelItem) => void;
  onToggleStatus?: (item: PersonnelItem) => void;
  onEdit?: (item: PersonnelItem) => void;
  onDelete?: (item: PersonnelItem) => void;
  /** 追加在操作列末尾的按钮，如分组「移出」 */
  renderExtraActions?: (item: PersonnelItem) => React.ReactNode;
  /** 姓名后的标识，如节点负责人 */
  renderNameBadge?: (item: PersonnelItem) => React.ReactNode;
  /** 行多选 */
  selectable?: boolean;
  selectedIds?: number[];
  onToggleSelect?: (id: number) => void;
  onToggleSelectAll?: () => void;
}

/** 外部用户管理 / 外部组织管理 / 用户群组管理共用的人员列表 */
export const ExternalUserTable: React.FC<ExternalUserTableProps> = ({
  items,
  orgNodes,
  getGroupName,
  startIndex = 0,
  emptyText,
  onAvatarClick,
  onToggleStatus,
  onEdit,
  onDelete,
  renderExtraActions,
  renderNameBadge,
  selectable = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll
}) => {
  const [revealedPhoneIds, setRevealedPhoneIds] = useState<number[]>([]);
  const allSelected = selectable && items.length > 0 && items.every((item) => selectedIds.includes(item.id));
  const colSpan = selectable ? 8 : 7;

  return (
    <table className="w-full text-left border-collapse text-xs">
      <thead>
        <tr className="bg-gray-50/80 text-gray-500 border-y border-gray-200 font-medium">
          {selectable && (
            <th className="py-2.5 px-2 text-center w-10 whitespace-nowrap">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => onToggleSelectAll?.()}
                className="rounded border-gray-300 text-[#1E5ABB] focus:ring-[#1E5ABB] cursor-pointer"
                title="全选当前页"
              />
            </th>
          )}
          <th className="py-2.5 px-3 text-center w-12 whitespace-nowrap">序号</th>
          <th className="py-2.5 px-3 whitespace-nowrap">姓名 / 手机号</th>
          <th className="py-2.5 px-3 whitespace-nowrap w-[240px] max-w-[240px]">
            <span className="inline-flex items-center gap-1"><Building2 className="w-3 h-3" />组织节点</span>
          </th>
          <th className="py-2.5 px-3 whitespace-nowrap">
            <span className="inline-flex items-center gap-1"><Circle className="w-3 h-3" />角色名称</span>
          </th>
          <th className="py-2.5 px-3 whitespace-nowrap">
            <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />用户群组</span>
          </th>
          <th className="py-2.5 px-3 whitespace-nowrap">账号状态</th>
          <th className="py-2.5 px-3 text-center whitespace-nowrap">操作</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 text-gray-700">
        {items.length === 0 ? (
          <tr>
            <td colSpan={colSpan} className="py-10 text-center text-gray-400">
              {emptyText}
            </td>
          </tr>
        ) : (
          items.map((item, index) => {
            const orgPathText = formatPersonOrgPaths(orgNodes, item.orgIds, undefined, item.primaryOrgId);
            const primaryRole = (item.roles || [])[0] || '未分配';
            const groupNames = (item.groupIds || []).map((id) => getGroupName(id)).filter(Boolean);
            const enabled = item.status === '启用';
            const muted = enabled ? '' : 'opacity-45 grayscale';
            const checked = selectedIds.includes(item.id);
            return (
              <tr
                key={item.id}
                className={`transition-colors ${checked ? 'bg-blue-50/40' : enabled ? 'hover:bg-blue-50/20' : 'bg-slate-100/70'}`}
                title={enabled ? undefined : '该账号已停用'}
              >
                {selectable && (
                  <td className="py-2.5 px-2 text-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleSelect?.(item.id)}
                      className="rounded border-gray-300 text-[#1E5ABB] focus:ring-[#1E5ABB] cursor-pointer"
                    />
                  </td>
                )}
                <td className={`py-2.5 px-3 text-center text-gray-400 font-mono whitespace-nowrap ${muted}`}>
                  {startIndex + index + 1}
                </td>
                <td className={`py-2.5 px-3 min-w-[160px] ${muted}`}>
                  <PersonIdentityCell
                    item={item}
                    revealed={revealedPhoneIds.includes(item.id)}
                    onToggleReveal={() =>
                      setRevealedPhoneIds((prev) =>
                        prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                      )
                    }
                    onAvatarClick={onAvatarClick ? () => onAvatarClick(item) : undefined}
                    nameBadge={renderNameBadge?.(item)}
                  />
                </td>
                <td className={`py-2.5 px-3 w-[240px] max-w-[240px] overflow-hidden ${muted}`}>
                  <PersonOrgPathCell path={orgPathText} />
                </td>
                <td className={`py-2.5 px-3 whitespace-nowrap ${muted}`}>
                  <PersonRoleBadges roles={[primaryRole]} />
                </td>
                <td className={`py-2.5 px-3 whitespace-nowrap ${muted}`}>
                  <PersonGroupCell groupNames={groupNames} />
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <FollowStatusBadges item={item} />
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                    {onToggleStatus && <StatusSwitch enabled={enabled} onToggle={() => onToggleStatus(item)} />}
                    {onEdit && (
                      <ActionBtn title="编辑" onClick={() => onEdit(item)}>
                        <Edit3 className="w-3.5 h-3.5" />
                      </ActionBtn>
                    )}
                    {onDelete && (
                      <ActionBtn title="删除" onClick={() => onDelete(item)}>
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      </ActionBtn>
                    )}
                    {renderExtraActions?.(item)}
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
};
