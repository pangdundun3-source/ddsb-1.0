import React, { useState } from 'react';
import { Institution } from '../types';
import { getTodayStr } from '../shared/date';
import { getInstitutionProfile, ProvisionStatus, yearEndDate } from '../viewmodels/useInstitutionListViewModel';
import { VERSION_OPTIONS } from './AuthorizeInstitutionModal';

const APP_NAME = '点点速报 - 清朗净网鉴谣速报系统';

const daysUntil = (endDate: string) => {
  const today = new Date(getTodayStr()).getTime();
  return Math.ceil((new Date(endDate).getTime() - today) / (1000 * 60 * 60 * 24));
};

export interface ChangeAuthorizationResult {
  status: ProvisionStatus;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  remark: string;
}

interface Props {
  institution: Institution;
  onClose: () => void;
  onConfirm: (data: ChangeAuthorizationResult) => void;
}

export const ChangeAuthorizationModal: React.FC<Props> = ({ institution, onClose, onConfirm }) => {
  const profile = getInstitutionProfile(institution);
  const [status, setStatus] = useState<ProvisionStatus>(institution.status);
  const [startDate, setStartDate] = useState(institution.startDate);
  const [endDate, setEndDate] = useState(institution.endDate);
  const [remark, setRemark] = useState('');

  const currentYear = new Date().getFullYear();
  const yearEnds = [currentYear, currentYear + 1, currentYear + 2];
  const canSubmit = Boolean(startDate) && Boolean(endDate) && endDate > startDate;

  const archiveMeta = [profile.creditCode, [profile.unitName, institution.location].filter(Boolean).join(' / '), `销售：${institution.salesName}`]
    .filter(Boolean)
    .join(' · ');

  const handleConfirm = () => {
    if (!canSubmit) return;
    onConfirm({ status, startDate, endDate, daysRemaining: daysUntil(endDate), remark: remark.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 pt-6 pb-4 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-md bg-[#eef2f8] text-[#1E3A6B] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900 leading-tight">变更机构授权</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                调整「{institution.name}」在「{APP_NAME}」的开通版本与服务时间
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer" aria-label="关闭">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="px-8 pb-5 space-y-4 overflow-y-auto flex-1">
          <div className="border-t border-gray-100" />

          <div className="rounded-md border border-[#dbe4f0] bg-[#f5f8fc] px-4 py-3 flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] text-[#1890ff] mt-0.5">domain</span>
            <div className="min-w-0">
              <div className="text-[11px] text-gray-400">机构档案</div>
              <div className="text-sm font-bold text-gray-900 mt-0.5">{profile.fullName}</div>
              <div className="text-[11px] text-gray-500 mt-1 font-mono">{archiveMeta}</div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
              <span className="material-symbols-outlined text-[18px] text-[#1E3A6B]">tune</span>
              应用授权配置参数
            </div>

            <div className="space-y-2">
              <div className="text-sm font-bold text-gray-800">开通的版本 *</div>
              <div className="grid grid-cols-2 gap-3">
                {VERSION_OPTIONS.map((option) => {
                  const active = status === option.value;
                  const formal = option.value === '正式';
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatus(option.value)}
                      className={`text-left px-4 py-3 rounded-md border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        active
                          ? formal
                            ? 'border-violet-400 bg-violet-50/60'
                            : 'border-amber-400 bg-amber-50/60'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className={`text-sm font-bold ${formal ? 'text-violet-700' : 'text-amber-800'}`}>
                          {option.title}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{option.desc}</p>
                      </div>
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          active ? (formal ? 'border-violet-600' : 'border-amber-600') : 'border-gray-400'
                        }`}
                      >
                        {active && (
                          <span className={`w-2.5 h-2.5 rounded-full ${formal ? 'bg-violet-600' : 'bg-amber-600'}`} />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                  <span className="material-symbols-outlined text-[18px] text-gray-500">calendar_today</span>
                  服务时间 *
                </div>
                <div className="flex items-center gap-1.5">
                  {yearEnds.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setEndDate(yearEndDate(year))}
                      className={`px-2.5 py-1 text-[11px] rounded cursor-pointer transition-colors ${
                        endDate === yearEndDate(year)
                          ? 'bg-[#1E3A6B] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {year}年底
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 block">
                  <span className="text-xs font-bold text-gray-700">开始日期</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#1890ff]"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-xs font-bold text-gray-700">结束日期</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#1890ff]"
                  />
                </label>
              </div>
              {!canSubmit && startDate && endDate && (
                <p className="text-[11px] text-rose-500">结束日期需晚于开始日期</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                <span className="material-symbols-outlined text-[18px] text-gray-500">description</span>
                开通备注（可选）
              </div>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value.slice(0, 200))}
                rows={2}
                placeholder="请输入变更原因、项目审批单号或特殊要求说明..."
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#1890ff]"
              />
            </div>
          </div>
        </div>

        <div className="mx-8 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-[#1E3A6B] rounded-md hover:bg-[#162d54] disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            确认变更授权
          </button>
        </div>
      </div>
    </div>
  );
};
