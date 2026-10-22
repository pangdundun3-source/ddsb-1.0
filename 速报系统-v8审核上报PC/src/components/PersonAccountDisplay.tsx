import React, { useState } from 'react';
import { Circle, Eye, EyeOff, User } from 'lucide-react';
import type { PersonnelItem } from '../pages/ExternalOrgManagement';
import { getRoleBadgeClass, normalizeAccountRoles } from '../data/userOrgShared';

const PERSON_AVATAR_POOL = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=128&h=128&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=128&h=128&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=128&h=128&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&h=128&fit=crop&crop=face'
];

const PERSON_AVATARS_BY_ID: Record<number, string> = {
  1: PERSON_AVATAR_POOL[0],
  2: PERSON_AVATAR_POOL[1],
  3: PERSON_AVATAR_POOL[2],
  4: PERSON_AVATAR_POOL[3],
  5: PERSON_AVATAR_POOL[4],
  6: PERSON_AVATAR_POOL[6],
  7: PERSON_AVATAR_POOL[5],
  8: PERSON_AVATAR_POOL[7]
};

export const getPersonAvatarUrl = (item: Pick<PersonnelItem, 'id' | 'avatarUrl'>) =>
  PERSON_AVATARS_BY_ID[item.id] ||
  item.avatarUrl ||
  PERSON_AVATAR_POOL[Math.abs(item.id) % PERSON_AVATAR_POOL.length];

export const maskPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 7) {
    return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
  }
  return phone || '—';
};

export const formatOrgPathDisplay = (path: string) => path.replaceAll('/', ' / ');

export const PersonAvatar: React.FC<{ name: string; src: string; size?: 'sm' | 'md' }> = ({
  name,
  src,
  size = 'sm'
}) => {
  const [broken, setBroken] = useState(false);
  const iconSize = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  if (broken) {
    return (
      <span className="w-full h-full bg-slate-400 text-white flex items-center justify-center">
        <User className={iconSize} />
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      className="w-full h-full object-cover"
      onError={() => setBroken(true)}
    />
  );
};

export const StatusSwitch: React.FC<{
  enabled: boolean;
  onToggle?: () => void;
}> = ({ enabled, onToggle }) => {
  const className = `inline-flex items-center h-[22px] w-[58px] rounded-full text-[11px] font-medium select-none ${
    enabled ? 'bg-[#1E5ABB] text-white' : 'bg-white text-slate-400 border border-slate-200'
  } ${onToggle ? 'cursor-pointer' : ''}`;
  const content = (
    <>
      <span className={`w-[14px] h-[14px] rounded-full shrink-0 ml-[3px] ${enabled ? 'bg-white' : 'bg-slate-300'}`} />
      <span className="flex-1 text-center pr-1 leading-none">{enabled ? '启用' : '停用'}</span>
    </>
  );
  if (onToggle) {
    return (
      <button
        type="button"
        title={enabled ? '点击停用该账号' : '点击启用该账号'}
        onClick={onToggle}
        className={className}
      >
        {content}
      </button>
    );
  }
  return <span className={className}>{content}</span>;
};

/** 有身份证号视为已完成实名核验 */
export const isRealNameVerified = (item: PersonnelItem) =>
  Boolean(item.activationFields?.idCardNo?.trim());

export const RealNameStatusBadge: React.FC<{ item: PersonnelItem }> = ({ item }) => {
  const verified = isRealNameVerified(item);
  return (
    <span
      className={`shrink-0 inline-flex items-center px-1.5 py-px rounded text-[10px] font-bold border ${
        verified
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-slate-50 text-slate-500 border-slate-200'
      }`}
      title={verified ? '已完成实名核验' : '尚未完成实名核验'}
    >
      {verified ? '已实名' : '未实名'}
    </span>
  );
};

export const PersonIdentityCell: React.FC<{
  item: PersonnelItem;
  revealed: boolean;
  onToggleReveal: () => void;
  onAvatarClick?: () => void;
  nameBadge?: React.ReactNode;
}> = ({ item, revealed, onToggleReveal, onAvatarClick, nameBadge }) => {
  const avatar = <PersonAvatar name={item.realName} src={getPersonAvatarUrl(item)} size="sm" />;
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      {onAvatarClick ? (
        <button
          type="button"
          title="查看账号详情"
          onClick={onAvatarClick}
          className="w-7 h-7 rounded-full overflow-hidden shrink-0 cursor-pointer ring-1 ring-black/10 hover:ring-[#1E5ABB]/50"
        >
          {avatar}
        </button>
      ) : (
        <span className="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-1 ring-black/10">{avatar}</span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 min-w-0">
          <span className="font-bold text-gray-900 leading-tight truncate" title={item.realName}>{item.realName}</span>
          <RealNameStatusBadge item={item} />
          {nameBadge}
        </div>
        <div className="flex items-center gap-0.5 mt-0.5 min-w-0">
          <span className="font-mono text-[11px] text-gray-500 truncate">{revealed ? item.phone : maskPhone(item.phone)}</span>
          <button
            type="button"
            title={revealed ? '隐藏手机号' : '显示手机号'}
            onClick={onToggleReveal}
            className="p-0.5 rounded text-gray-400 hover:text-[#1E5ABB] hover:bg-blue-50 cursor-pointer shrink-0"
          >
            {revealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export const PersonOrgPathCell: React.FC<{ path: string }> = ({ path }) => {
  const text = formatOrgPathDisplay(path);
  return (
    <span className="block truncate min-w-0 text-gray-800" title={path}>
      {text}
    </span>
  );
};

const ROLE_VISIBLE_LIMIT = 2;

export const PersonRoleBadges: React.FC<{ roles?: string[] }> = ({ roles }) => {
  const [expanded, setExpanded] = useState(false);
  const list = normalizeAccountRoles(roles);
  const display = list.length ? list : ['未分配'];
  const hidden = Math.max(0, display.length - ROLE_VISIBLE_LIMIT);
  const visible = expanded ? display : display.slice(0, ROLE_VISIBLE_LIMIT);
  return (
    <div className="flex flex-col items-start gap-1 min-w-0 max-w-full" title={display.join('、')}>
      {visible.map((role, index) => (
        <span
          key={`${role}-${index}`}
          className={`inline-flex max-w-full items-center gap-1 px-1.5 py-0.5 rounded-none text-[11px] font-medium ${getRoleBadgeClass(role)}`}
          title={role}
        >
          <Circle className="w-2 h-2 fill-current shrink-0" />
          <span className="truncate">{role}</span>
        </span>
      ))}
      {!expanded && hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex items-center px-1.5 py-0.5 rounded-none border border-slate-200 bg-slate-50 text-slate-500 text-[11px] font-bold cursor-pointer hover:bg-slate-100"
          title={`展开剩余 ${hidden} 个角色`}
        >
          +{hidden}
        </button>
      )}
      {expanded && hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-[10px] text-slate-400 hover:text-[#1E5ABB] cursor-pointer"
        >
          收起
        </button>
      )}
    </div>
  );
};

const GROUP_TAG_TONES = [
  'bg-rose-50 text-rose-700 border-rose-200',
  'bg-amber-50 text-amber-800 border-amber-200',
  'bg-sky-50 text-sky-700 border-sky-200',
  'bg-violet-50 text-violet-700 border-violet-200',
  'bg-emerald-50 text-emerald-700 border-emerald-200'
];

const GROUP_VISIBLE_LIMIT = 2;

export const PersonGroupCell: React.FC<{ groupName?: string; groupNames?: string[] }> = ({
  groupName,
  groupNames
}) => {
  const [expanded, setExpanded] = useState(false);
  const names = (groupNames && groupNames.length ? groupNames : groupName ? [groupName] : []).filter(Boolean);
  if (!names.length) {
    return <span className="text-gray-400">未入组</span>;
  }
  const hidden = Math.max(0, names.length - GROUP_VISIBLE_LIMIT);
  const visible = expanded ? names : names.slice(0, GROUP_VISIBLE_LIMIT);
  return (
    <div className="flex flex-col items-start gap-1 min-w-0 max-w-full">
      {visible.map((name, index) => (
        <span
          key={`${name}-${index}`}
          className={`inline-flex max-w-full items-center px-1.5 py-0.5 rounded-[5px] border text-[11px] font-medium truncate ${
            GROUP_TAG_TONES[index % GROUP_TAG_TONES.length]
          }`}
          title={name}
        >
          {name}
        </span>
      ))}
      {!expanded && hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex items-center px-1.5 py-0.5 rounded-[5px] border border-slate-200 bg-slate-50 text-slate-500 text-[11px] font-bold cursor-pointer hover:bg-slate-100"
          title={`展开剩余 ${hidden} 个群组`}
        >
          +{hidden}
        </button>
      )}
      {expanded && hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-[10px] text-slate-400 hover:text-[#1E5ABB] cursor-pointer"
        >
          收起
        </button>
      )}
    </div>
  );
};
