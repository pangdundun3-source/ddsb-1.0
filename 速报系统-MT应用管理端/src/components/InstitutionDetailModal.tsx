import React from 'react';
import { Institution, ExpiringInstitution } from '../types';

interface DetailModalProps {
  institution: Institution | ExpiringInstitution | null;
  onClose: () => void;
}

export const InstitutionDetailModal: React.FC<DetailModalProps> = ({
  institution,
  onClose,
}) => {
  if (!institution) return null;

  const isFullInst = 'salesName' in institution;
  const full = isFullInst ? (institution as Institution) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#f8fafd]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1890ff] text-[22px]">
              corporate_fare
            </span>
            <h3 className="text-lg font-bold text-[#333333]">
              机构详细信息档案
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-200/50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main Badge & Title */}
          <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {full ? (
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium border ${
                      full.status === '正式'
                        ? 'bg-blue-100 text-[#1890ff] border-blue-200'
                        : 'bg-orange-100 text-[#ff7043] border-orange-200'
                    }`}
                  >
                    {full.status}机构
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded font-medium bg-red-100 text-red-600 border border-red-200">
                    预警机构
                  </span>
                )}
                <h4 className="text-base font-bold text-gray-900">
                  {institution.name}
                </h4>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                系统编号：INST-{String(institution.id).padStart(6, '0')}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-gray-500 block">到期倒计时</span>
              <span
                className={`text-lg font-bold ${
                  institution.daysRemaining <= 0
                    ? 'text-red-500'
                    : 'text-[#1890ff]'
                }`}
              >
                {institution.daysRemaining <= 0
                  ? '已到期'
                  : `${institution.daysRemaining} 天`}
              </span>
            </div>
          </div>

          {/* Key Value Details Grid */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <span className="text-gray-400 block text-xs mb-1">所属区域</span>
              <span className="font-medium text-gray-800">
                {'location' in institution
                  ? institution.location
                  : (institution as ExpiringInstitution).region}
              </span>
            </div>

            <div>
              <span className="text-gray-400 block text-xs mb-1">机构类别</span>
              <span className="font-medium text-gray-800">
                {institution.category}
              </span>
            </div>

            {full && (
              <>
                <div>
                  <span className="text-gray-400 block text-xs mb-1">
                    所属行业领域
                  </span>
                  <span className="font-medium text-gray-800">
                    {full.industry}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-xs mb-1">
                    统计单元名称
                  </span>
                  <span className="font-medium text-gray-800">
                    {full.unitName || '通用速报单元'}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-xs mb-1">
                    负责销售对接人
                  </span>
                  <span className="font-medium text-gray-800">
                    {full.salesName} ({full.salesPhone})
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-xs mb-1">
                    接口及服务状态
                  </span>
                  <span
                    className={`font-medium text-xs px-2 py-0.5 rounded ${
                      full.enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {full.enabled ? '正常接入 (启用)' : '已人工停用 (禁用)'}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-xs mb-1">
                    服务生效起始时间
                  </span>
                  <span className="font-medium text-gray-800">
                    {full.startDate}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-xs mb-1">
                    服务到期截止时间
                  </span>
                  <span className="font-medium text-gray-800">
                    {full.endDate}
                  </span>
                </div>
              </>
            )}

            {!full && (
              <div className="col-span-2">
                <span className="text-gray-400 block text-xs mb-1">
                  精准到期时间
                </span>
                <span className="font-medium text-gray-800">
                  {(institution as ExpiringInstitution).expireTime}
                </span>
              </div>
            )}
          </div>

          {/* Platform Capability Notes */}
          <div className="border-t border-gray-100 pt-4">
            <h5 className="text-xs font-bold text-gray-600 mb-2">
              已开通媒体速报功能包
            </h5>
            <div className="flex flex-wrap gap-2">
              <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded">
                全量媒体推送
              </span>
              <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded">
                舆情智能分析
              </span>
              <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded">
                7x24小时速报看板
              </span>
              <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded">
                数据导出(Excel/PDF)
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#1890ff] text-white px-5 py-1.5 rounded text-sm font-medium hover:bg-blue-600 transition-colors cursor-pointer"
          >
            关闭详情
          </button>
        </div>
      </div>
    </div>
  );
};
