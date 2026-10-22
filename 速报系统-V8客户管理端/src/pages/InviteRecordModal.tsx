import React from 'react';
import { X } from 'lucide-react';
import type { OrgNode, PersonnelItem } from './OrgManagement';
import type { InviteCode } from '../data/userOrgShared';
import { InviteRecords } from './InviteRecords';

interface InviteRecordModalProps {
  inviteCodes: InviteCode[];
  setInviteCodes: React.Dispatch<React.SetStateAction<InviteCode[]>>;
  orgNodes: OrgNode[];
  personnelList?: PersonnelItem[];
  onClose?: () => void;
  onCopy?: (text: string, message: string) => void;
  /** 作为侧栏页面嵌入时不展示遮罩与关闭按钮 */
  embedded?: boolean;
}

export const InviteRecordModal: React.FC<InviteRecordModalProps> = ({
  inviteCodes,
  setInviteCodes,
  orgNodes,
  personnelList = [],
  onClose,
  embedded = false
}) => {
  const panel = (
    <div
      className={`relative bg-white flex flex-col overflow-hidden ${
        embedded ? 'h-full' : 'rounded-lg shadow-xl w-full max-w-6xl h-[min(860px,92vh)]'
      }`}
    >
      {!embedded && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-4 z-40 w-8 h-8 rounded border border-slate-200 bg-white text-gray-500 hover:text-gray-800 inline-flex items-center justify-center cursor-pointer shadow-sm"
          aria-label="关闭"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <InviteRecords
        shared={{
          orgNodes,
          inviteCodes,
          setInviteCodes,
          personnelList
        }}
      />
    </div>
  );

  if (embedded) return panel;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="relative w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
        {panel}
      </div>
    </div>
  );
};
