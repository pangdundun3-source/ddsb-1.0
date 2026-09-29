import React from 'react';
import { Institution } from '../types';

interface DeleteConfirmModalProps {
  institution: Institution | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  institution,
  onClose,
  onConfirm,
}) => {
  if (!institution) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-3 text-red-500">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">
              warning
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">确认删除机构</h3>
            <p className="text-xs text-gray-500">此操作不可撤销，请谨慎操作！</p>
          </div>
        </div>

        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
          确定要从管理端中删除机构{' '}
          <strong className="text-gray-900">{institution.name}</strong> 吗？
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="border border-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-50 transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
};
