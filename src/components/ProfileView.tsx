import React, { useState } from 'react';
import { UserProfile, UserRole, SpeedReport } from '../types';
import { DEPARTMENT_OPTIONS } from '../data/mockData';
import { BackNavigationBar } from './BackNavigationBar';
import {
  User,
  QrCode,
  Database,
  Download,
  Calendar,
  Award,
  Clock,
  TrendingUp,
  Filter,
  BarChart2,
  RotateCcw,
  Building2,
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  Edit3,
  Smartphone,
  X,
  Save,
} from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  onChangeRole: (newRole: UserRole) => void;
  onChangeDepartment: (newDept: string) => void;
  onUpdateUser?: (patch: Partial<UserProfile>) => void;
  onLogout: () => void;
  onResetDemoData: () => void;
  onExportData: () => void;
  onToast: (msg: string) => void;
  reports: SpeedReport[];
  onActivateReport?: () => void;
  showUserDetail?: boolean;
  onToggleUserDetail?: (show: boolean) => void;
  showActivationDetail?: boolean;
  onToggleActivationDetail?: (show: boolean) => void;
}

type TimeFilter = '本周' | '本月' | '本季度' | '本年' | '自定义区间';

const formatAuditDuration = (minutes: number) => {
  const formatNumber = (value: number) => {
    const rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
  };
  const hours = minutes / 60;
  if (hours < 24) {
    return `${formatNumber(hours)} h`;
  }
  const days = hours / 24;
  if (days < 7) {
    return `${formatNumber(days)} 天`;
  }
  return `${formatNumber(days / 7)} 周`;
};

const maskIdCard = (value: string) => {
  const text = value.replace(/\s+/g, '');
  if (text.length <= 8) return '*'.repeat(text.length);
  return `${text.slice(0, 6)}${'*'.repeat(text.length - 10)}${text.slice(-4)}`;
};

const maskBankCard = (value: string) => {
  const digits = value.replace(/\s+/g, '');
  if (digits.length <= 8) return '*'.repeat(digits.length);
  const middleLen = digits.length - 8;
  const fullGroups = Math.floor(middleLen / 4);
  const remainder = middleLen % 4;
  const middleParts = Array.from({ length: fullGroups }, () => '****');
  if (remainder) middleParts.push('*'.repeat(remainder));
  return `${digits.slice(0, 4)} ${middleParts.join(' ')} ${digits.slice(-4)}`.replace(/\s+/g, ' ').trim();
};

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onChangeRole,
  onChangeDepartment,
  onUpdateUser,
  onLogout,
  onResetDemoData,
  onExportData,
  onToast,
  reports,
  onActivateReport,
  showUserDetail: externalShowDetail,
  onToggleUserDetail,
  showActivationDetail: externalShowActivationDetail,
  onToggleActivationDetail,
}) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('本周');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-08-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-08-13');
  const [internalShowDetail, setInternalShowDetail] = useState<boolean>(false);
  const [internalShowActivationDetail, setInternalShowActivationDetail] = useState<boolean>(false);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState<boolean>(false);

  const [activationData, setActivationData] = useState({
    phone: user.phone || '13892108888',
    idCard: '420106199208151234',
    bankCard: '6222 0214 0200 8888 912',
    bankName: '中国工商银行台中西坝支行',
  });

  const [editForm, setEditForm] = useState({ ...activationData });
  const [isProfileEditing, setIsProfileEditing] = useState<boolean>(false);
  const [showPhoneVerifyModal, setShowPhoneVerifyModal] = useState<boolean>(false);
  const [phoneVerifyCode, setPhoneVerifyCode] = useState<string>('');
  const [phoneVerifyInput, setPhoneVerifyInput] = useState<string>('');
  const [phoneVerifyCountdown, setPhoneVerifyCountdown] = useState<number>(0);
  const [phoneChangeInput, setPhoneChangeInput] = useState<string>('');
  const [pendingPhoneChange, setPendingPhoneChange] = useState<string | null>(null);
  const [profileEditForm, setProfileEditForm] = useState({
    account: user.account,
    name: user.name,
    phone: user.phone,
    idCard: activationData.idCard,
    bankCard: activationData.bankCard,
    bankName: activationData.bankName,
  });

  const isDetailActive = externalShowDetail !== undefined ? externalShowDetail : internalShowDetail;
  const isActivationDetailActive = externalShowActivationDetail !== undefined ? externalShowActivationDetail : internalShowActivationDetail;

  const setShowUserDetail = (show: boolean) => {
    if (onToggleUserDetail) {
      onToggleUserDetail(show);
    } else {
      setInternalShowDetail(show);
    }
  };

  const setShowActivationDetail = (show: boolean) => {
    if (show) {
      setEditForm({ ...activationData });
    }
    if (onToggleActivationDetail) {
      onToggleActivationDetail(show);
    } else {
      setInternalShowActivationDetail(show);
    }
  };

  const resetProfileEditForm = () => {
    setProfileEditForm({
      account: user.account,
      name: user.name,
      phone: user.phone,
      idCard: activationData.idCard,
      bankCard: activationData.bankCard,
      bankName: activationData.bankName,
    });
  };

  const maskPhone = (value: string) => {
    const digits = value.replace(/\s+/g, '');
    if (digits.length < 7) return value;
    return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
  };

  const createVerifyCode = () => String(Math.floor(100000 + Math.random() * 900000));

  const closePhoneVerifyModal = () => {
    setShowPhoneVerifyModal(false);
    setPhoneVerifyCode('');
    setPhoneVerifyInput('');
    setPhoneVerifyCountdown(0);
    setPhoneChangeInput('');
    setPendingPhoneChange(null);
  };

  const openPhoneVerifyModal = () => {
    setPhoneChangeInput('');
    setPendingPhoneChange(null);
    setPhoneVerifyCode('');
    setPhoneVerifyInput('');
    setPhoneVerifyCountdown(0);
    setShowPhoneVerifyModal(true);
  };

  const sendPhoneVerifyCode = () => {
    const digits = phoneChangeInput.replace(/\D/g, '');
    if (!/^1\d{10}$/.test(digits)) {
      onToast('请输入正确的新手机号', 'error');
      return;
    }
    if (maskPhone(digits) === user.phone) {
      onToast('新手机号不能与当前手机号相同', 'error');
      return;
    }
    const code = createVerifyCode();
    setPendingPhoneChange(digits);
    setPhoneVerifyCode(code);
    setPhoneVerifyInput('');
    setPhoneVerifyCountdown(60);
    onToast(`验证码已发送至 ${maskPhone(digits)}`);
  };

  const applyProfileDetailSave = (nextSave: { account: string; name: string }) => {
    onUpdateUser?.({
      account: nextSave.account,
      name: nextSave.name,
    });
    setIsProfileEditing(false);
    onToast('个人基础信息已保存');
  };

  const handleSaveProfileDetail = () => {
    const nextSave = {
      account: profileEditForm.account.trim() || user.account,
      name: profileEditForm.name.trim() || user.name,
    };

    applyProfileDetailSave(nextSave);
    setEditForm({
      phone: user.phone,
      idCard: profileEditForm.idCard.trim(),
      bankCard: profileEditForm.bankCard.trim(),
      bankName: profileEditForm.bankName.trim(),
    });
  };

  const handleConfirmPhoneVerify = () => {
    if (!pendingPhoneChange) {
      onToast('请先发送短信验证码', 'error');
      return;
    }
    if (phoneVerifyInput.trim() !== phoneVerifyCode) {
      onToast('验证码错误，请重新输入', 'error');
      return;
    }
    const maskedPhone = maskPhone(pendingPhoneChange);
    onUpdateUser?.({
      phone: maskedPhone,
    });
    setActivationData((current) => ({
      ...current,
      phone: maskedPhone,
    }));
    setEditForm((current) => ({
      ...current,
      phone: maskedPhone,
    }));
    closePhoneVerifyModal();
    onToast('手机号更换成功');
  };

  const handleResendPhoneVerify = () => {
    if (!pendingPhoneChange) {
      sendPhoneVerifyCode();
      return;
    }
    const code = createVerifyCode();
    setPhoneVerifyCode(code);
    setPhoneVerifyCountdown(60);
    onToast(`验证码已重新发送至 ${maskPhone(pendingPhoneChange)}`);
  };

  React.useEffect(() => {
    if (!isProfileEditing) {
      resetProfileEditForm();
    }
  }, [user, activationData, isProfileEditing]);

  React.useEffect(() => {
    if (!showPhoneVerifyModal || phoneVerifyCountdown <= 0) return;
    const timer = window.setTimeout(() => {
      setPhoneVerifyCountdown((value) => Math.max(value - 1, 0));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [showPhoneVerifyModal, phoneVerifyCountdown]);

  const timeOptions: TimeFilter[] = ['本周', '本月', '本季度', '本年', '自定义区间'];

  // Filter reports based on selected time
  const filteredReports = reports.filter((r) => {
    if (!r.createTime) return true;

    if (timeFilter === '自定义区间') {
      const rDay = r.createTime.substring(0, 10);
      if (customStartDate && rDay < customStartDate) return false;
      if (customEndDate && rDay > customEndDate) return false;
      return true;
    }

    const dateStr = r.createTime.replace(' ', 'T');
    const rDate = new Date(dateStr);
    if (isNaN(rDate.getTime())) return true;

    // Simulated base date 2026-08-13 (Thursday)
    const baseDate = new Date('2026-08-13T23:59:59');
    const diffDays = (baseDate.getTime() - rDate.getTime()) / (1000 * 3600 * 24);

    switch (timeFilter) {
      case '本周':
        return diffDays >= -3.5 && diffDays <= 7;
      case '本月':
        return r.createTime.startsWith('2026-08');
      case '本季度':
        return (
          r.createTime.startsWith('2026-07') ||
          r.createTime.startsWith('2026-08') ||
          r.createTime.startsWith('2026-09')
        );
      case '本年':
        return r.createTime.startsWith('2026');
      default:
        return true;
    }
  });

  const getElapsedMinutes = (report: SpeedReport) => {
    const cTime = new Date(report.createTime.replace(' ', 'T')).getTime();
    const uTime = new Date(report.updateTime.replace(' ', 'T')).getTime();
    if (isNaN(cTime) || isNaN(uTime) || uTime < cTime) return 0;
    return (uTime - cTime) / (1000 * 60);
  };

  // --- 1. 速报员角色统计数据 (Reporter Stats) ---
  const submittedReports = filteredReports.filter((r) => r.status !== 'draft');
  const hasRepairTrace = (report: SpeedReport) =>
    Boolean(report.rejectReason) || (report.status === 'approved' && getElapsedMinutes(report) > 60);
  const reporterSubmittedTotal = submittedReports.length;
  const reporterApproved = submittedReports.filter((r) => r.status === 'approved').length;
  const reporterRepairPassed = submittedReports.filter((r) => r.status === 'approved' && hasRepairTrace(r)).length;
  const reporterFirstPass = Math.max(reporterApproved - reporterRepairPassed, 0);
  const reporterOverallPassRate =
    reporterSubmittedTotal > 0 ? Math.round((reporterApproved / reporterSubmittedTotal) * 100) : 0;
  const reporterFirstPassRate =
    reporterSubmittedTotal > 0 ? Math.round((reporterFirstPass / reporterSubmittedTotal) * 100) : 0;
  const reporterRejectedTodo = submittedReports.filter((r) => r.status === 'rejected').length;
  const reporterPendingAudit = Math.max(
    reporterSubmittedTotal - reporterFirstPass - reporterRepairPassed - reporterRejectedTodo,
    0
  );
  const reportComposition = [
    { label: '一次性通过', value: reporterFirstPass, color: '#10b981', textClass: 'text-emerald-700' },
    { label: '返修通过', value: reporterRepairPassed, color: '#06b6d4', textClass: 'text-cyan-700' },
    { label: '待审核', value: reporterPendingAudit, color: '#94a3b8', textClass: 'text-slate-600' },
    { label: '驳回', value: reporterRejectedTodo, color: '#f43f5e', textClass: 'text-rose-700' },
  ];
  let reportCompositionCursor = 0;
  const reportDonutGradient =
    reporterSubmittedTotal > 0
      ? `conic-gradient(${reportComposition
          .map((item) => {
            const start = reportCompositionCursor;
            const end = reportCompositionCursor + (item.value / reporterSubmittedTotal) * 100;
            reportCompositionCursor = end;
            return `${item.color} ${start}% ${end}%`;
          })
          .join(', ')})`
      : 'conic-gradient(#e2e8f0 0% 100%)';

  // --- 2. 审核员角色统计数据 (Auditor Stats) ---
  const auditorApproved = filteredReports.filter((r) => r.status === 'approved').length;
  const auditorRejected = filteredReports.filter((r) => r.status === 'rejected').length;
  const auditorPending = filteredReports.filter((r) => r.status === 'pending_audit').length;
  const auditorAudited = auditorApproved + auditorRejected;
  const auditorTotal = auditorAudited + auditorPending;
  const auditorProcessRate = auditorTotal > 0 ? Math.round((auditorAudited / auditorTotal) * 100) : 0;
  const auditorHandledReports = filteredReports.filter(
    (r) => r.status === 'approved' || r.status === 'rejected'
  );
  const auditorAvgResponseMinutes =
    auditorHandledReports.length > 0
      ? Math.round(
          (auditorHandledReports.reduce((total, report) => total + getElapsedMinutes(report), 0) /
            auditorHandledReports.length) *
            10
        ) / 10
      : 0;
  const auditorAvgResponseTimeStr = formatAuditDuration(auditorAvgResponseMinutes);
  const auditComposition = [
    { label: '审核通过', value: auditorApproved, color: '#10b981', textClass: 'text-emerald-700' },
    { label: '审核驳回', value: auditorRejected, color: '#f43f5e', textClass: 'text-rose-700' },
    { label: '待审核', value: auditorPending, color: '#94a3b8', textClass: 'text-slate-600' },
  ];
  let auditCompositionCursor = 0;
  const auditDonutGradient =
    auditorTotal > 0
      ? `conic-gradient(${auditComposition
          .map((item) => {
            const start = auditCompositionCursor;
            const end = auditCompositionCursor + (item.value / auditorTotal) * 100;
            auditCompositionCursor = end;
            return `${item.color} ${start}% ${end}%`;
          })
          .join(', ')})`
      : 'conic-gradient(#e2e8f0 0% 100%)';

  const renderRoleBadges = () => {
    const roles =
      user.role === '综合网格员'
        ? ['上报员', '审核员']
        : [user.role === '网格员' ? '上报员' : '审核员'];

    return (
      <div className="flex items-center gap-1 shrink-0">
        {roles.map((role) => (
          <span
            key={role}
            className="px-2 py-0.5 rounded-full bg-white/20 text-sky-50 text-[10px] font-semibold border border-white/25 whitespace-nowrap"
          >
            {role}
          </span>
        ))}
      </div>
    );
  };

  if (isDetailActive) {
    const detailName = isProfileEditing ? profileEditForm.name || user.name : user.name;
    const detailAccount = user.account;
    const currentInstitution = `${user.department}·${user.subDepartment && user.subDepartment !== '西坝区网格03' ? user.subDepartment : '西坝区环保局'}`;
    const relatedInstitutions = user.associatedDepts && user.associatedDepts.length > 0 ? user.associatedDepts : [];
    const institutionPills = [
      currentInstitution,
      ...relatedInstitutions.filter((dept) => dept !== currentInstitution),
    ];
    const visibleInstitutionPills = institutionPills.slice(0, 4);
    const extraInstitutionCount = Math.max(institutionPills.length - visibleInstitutionPills.length, 0);

    return (
      <div className="relative flex-1 p-3.5 space-y-3 overflow-y-auto bg-slate-50 min-h-full">
        <BackNavigationBar onBack={() => setShowUserDetail(false)} />

        {/* User Badge Profile Header Card */}
        <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 px-4 py-4 text-white">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-full border-2 border-white/45 overflow-hidden shrink-0 bg-white/95 flex items-center justify-center text-xl font-black text-blue-600 shadow-inner">
                {detailName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-extrabold text-white leading-tight truncate">{detailName}</h2>
                  <span className="inline-flex items-center rounded-full border border-white/25 bg-white/12 px-2 py-0.5 text-[10px] font-semibold text-sky-50 shadow-2xs">
                    {detailAccount}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {renderRoleBadges()}
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-3">
            <div className="rounded-2xl bg-slate-50 border border-slate-200/70 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  <Building2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>关联机构</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{institutionPills.length} 个</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {visibleInstitutionPills.map((dept) => (
                  <span
                    key={dept}
                    className="inline-flex max-w-full items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700 shadow-sm"
                    title={dept}
                  >
                    <span className="min-w-0 truncate">{dept}</span>
                  </span>
                ))}
                {extraInstitutionCount > 0 && (
                  <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-600">
                    +{extraInstitutionCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Phone Group */}
        <div className="relative bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-200/90 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 min-w-0">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>手机号</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
            <span className="font-mono font-bold text-slate-800">{user.phone}</span>
            <button
              type="button"
              onClick={openPhoneVerifyModal}
              className="shrink-0 rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600 border border-blue-100 hover:bg-blue-100"
            >
              更换手机号
            </button>
          </div>
        </div>

        {/* Basic Information Group */}
        <div className="relative bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-200/90 space-y-3">
          <div className="flex items-center gap-2 pr-16 pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 min-w-0">
              <User className="w-4 h-4 text-blue-600" />
              <span>个人基础信息</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (isProfileEditing) {
                  resetProfileEditForm();
                  setIsProfileEditing(false);
                } else {
                  resetProfileEditForm();
                  setIsProfileEditing(true);
                }
              }}
              className="absolute right-3 top-3 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold flex items-center gap-1"
            >
              {isProfileEditing ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span>{isProfileEditing ? '取消' : '编辑'}</span>
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-slate-500 font-medium">真实姓名</span>
              {isProfileEditing ? (
                <input
                  type="text"
                  value={profileEditForm.name}
                  onChange={(e) => setProfileEditForm({ ...profileEditForm, name: e.target.value })}
                  className="ml-3 min-w-0 flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-right font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <span className="font-bold text-slate-900">{user.name}</span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-500 font-medium shrink-0">身份证号</span>
                {isProfileEditing ? (
                  <input
                    type="text"
                    value={profileEditForm.idCard}
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, idCard: e.target.value })}
                    className="min-w-0 flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-right font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="font-mono font-bold text-slate-800 truncate">{maskIdCard(activationData.idCard)}</span>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-500 font-medium shrink-0">银行卡号</span>
                {isProfileEditing ? (
                  <input
                    type="text"
                    value={profileEditForm.bankCard}
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, bankCard: e.target.value })}
                    className="min-w-0 flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-right font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="font-mono font-bold text-slate-800 truncate">{maskBankCard(activationData.bankCard)}</span>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-slate-500 font-medium shrink-0">开户银行</span>
                {isProfileEditing ? (
                  <input
                    type="text"
                    value={profileEditForm.bankName}
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, bankName: e.target.value })}
                    className="min-w-0 flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-right font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="font-bold text-slate-800 text-right leading-snug">{activationData.bankName}</span>
                )}
              </div>
            </div>
          </div>

          {isProfileEditing && (
            <button
              type="button"
              onClick={handleSaveProfileDetail}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl font-bold transition-all flex items-center justify-center space-x-1.5 text-xs shadow-2xs"
            >
              <Save className="w-4 h-4" />
              <span>保存基础信息</span>
            </button>
          )}
        </div>

        {showPhoneVerifyModal && (
          <div
            className="absolute inset-0 z-[60] bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) closePhoneVerifyModal();
            }}
          >
            <div className="relative w-[calc(100%-2rem)] max-w-[22rem] rounded-3xl bg-white p-4 shadow-2xl border border-slate-200 space-y-4">
              <button
                type="button"
                onClick={closePhoneVerifyModal}
                className="absolute right-3 top-3 h-8 w-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label="关闭"
                title="关闭"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 pr-10">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Smartphone className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">短信验证码验证</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    当前手机号 {user.phone}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-600">新手机号</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phoneChangeInput}
                  onChange={(e) => {
                    setPhoneChangeInput(e.target.value);
                    setPendingPhoneChange(null);
                    setPhoneVerifyCode('');
                    setPhoneVerifyInput('');
                    setPhoneVerifyCountdown(0);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  placeholder="请输入新的11位手机号"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-600">验证码</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={phoneVerifyInput}
                  onChange={(e) => setPhoneVerifyInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-mono tracking-[0.2em] text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  placeholder="请输入6位验证码"
                  disabled={!pendingPhoneChange}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (phoneVerifyCountdown > 0) return;
                    handleResendPhoneVerify();
                  }}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-50"
                  disabled={phoneVerifyCountdown > 0}
                >
                  {phoneVerifyCountdown > 0
                    ? `重新发送(${phoneVerifyCountdown}s)`
                    : pendingPhoneChange
                    ? '重新发送验证码'
                    : '发送验证码'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPhoneVerify}
                  className="flex-1 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm disabled:opacity-50"
                  disabled={!pendingPhoneChange}
                >
                  确认更换
                </button>
              </div>

            </div>
          </div>
        )}

        <div className="text-center text-[10px] text-slate-400 pt-2 space-y-0.5">
          <p className="font-semibold">台中市网信办 · 个人基础信息服务</p>
          <p className="font-mono">更新时间：2026-08-13 09:15:00</p>
        </div>
      </div>
    );
  }

  if (isActivationDetailActive) {
    return (
      <div className="flex-1 p-3.5 space-y-4 overflow-y-auto bg-slate-50 min-h-full">
        {/* 可编辑表单卡片 */}
        <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/90 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900">激活上报备案信息</h3>
            </div>
            <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
              信息已备案
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1 text-[11px]">个人电话</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs"
                placeholder="请输入个人电话"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1 text-[11px]">身份证号</label>
              <input
                type="text"
                value={editForm.idCard}
                onChange={(e) => setEditForm({ ...editForm, idCard: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs"
                placeholder="请输入18位身份证号"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1 text-[11px]">银行卡号</label>
              <input
                type="text"
                value={editForm.bankCard}
                onChange={(e) => setEditForm({ ...editForm, bankCard: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs"
                placeholder="请输入银行卡号"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1 text-[11px]">开户银行</label>
              <input
                type="text"
                value={editForm.bankName}
                onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs"
                placeholder="请输入开户银行名称"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setActivationData({ ...editForm });
                onToast('激活上报信息修改成功');
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl font-bold transition-all flex items-center justify-center space-x-1.5 text-xs shadow-2xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>保存修改</span>
            </button>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-400 pt-2 space-y-0.5">
          <p className="font-semibold">台中市网信办 · 激活上报直连通道服务</p>
          <p className="font-mono">更新时间：2026-08-13 09:15:00</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3 space-y-3 overflow-y-auto">
      {/* User Card Header */}
      <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 rounded-2xl p-4 text-white shadow-md shadow-blue-500/20 space-y-3">
        <div
          onClick={() => {
            setShowUserDetail(true);
            onToast('进入个人基础信息详情');
          }}
          className="flex items-center justify-between space-x-3 cursor-pointer group hover:opacity-95 transition-all p-1 -m-1 rounded-xl"
          title="点击查看个人基础信息详情"
        >
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-full border-2 border-white/45 overflow-hidden shrink-0 bg-white/95 flex items-center justify-center text-lg font-black text-blue-600 shadow-inner group-hover:scale-105 transition-transform">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white truncate">{user.name}</h2>
                {renderRoleBadges()}
              </div>
            </div>
          </div>

          <div className="text-sky-300 group-hover:text-white transition-colors shrink-0 p-1">
            <ChevronRight className="w-5 h-5 text-sky-300/80 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Quick Identity Summary Banner */}
        <div className="pt-2.5 border-t border-white/10 text-xs">
          <div className="bg-white/5 p-2.5 rounded-xl flex items-center space-x-2.5 min-w-0">
            <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-300">当前所在机构</div>
                <div className="text-xs font-bold text-sky-100 truncate mt-0.5" title={user.department}>
                  {user.department}
                </div>
              </div>
              <div className="relative shrink-0 flex items-center ml-2">
                <select
                  value={user.department}
                  onChange={(e) => {
                    onChangeDepartment(e.target.value);
                    onToast(`已切换所在机构为：${e.target.value}`);
                  }}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                  title="点击选择切换机构"
                >
                  {DEPARTMENT_OPTIONS.map((dept) => (
                    <option key={dept} value={dept} className="bg-slate-900 text-white">
                      {dept}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="px-2 py-1 rounded-lg bg-sky-500/30 hover:bg-sky-500/50 border border-sky-400/30 text-sky-200 text-xs font-medium flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <span>切换机构</span>
                  <ChevronDown className="w-3.5 h-3.5 text-sky-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 统计数据模块 */}
      <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-200/90 space-y-3">
        <div className="space-y-2 rounded-xl bg-slate-50/90 border border-slate-200/80 p-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>统计时间范围</span>
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-0.5">
            {timeOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setTimeFilter(opt);
                  onToast(`已筛选统计时间：${opt}`);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  timeFilter === opt
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {timeFilter === '自定义区间' && (
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>自定义统计起止区间：</span>
                <span className="font-mono text-blue-600 text-[10px] font-bold">
                  {customStartDate || '未设定'} 至 {customEndDate || '未设定'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <div className="flex-1 flex items-center space-x-1.5 bg-white border border-slate-200/90 rounded-xl px-2.5 py-1.5 focus-within:border-blue-500 transition-all">
                  <span className="text-[10px] text-slate-400 font-bold shrink-0">从</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => {
                      setCustomStartDate(e.target.value);
                      onToast(`起始日期: ${e.target.value}`);
                    }}
                    className="w-full bg-transparent text-xs text-slate-800 font-mono font-medium outline-none cursor-pointer"
                  />
                </div>
                <span className="text-slate-400 font-bold text-xs shrink-0">至</span>
                <div className="flex-1 flex items-center space-x-1.5 bg-white border border-slate-200/90 rounded-xl px-2.5 py-1.5 focus-within:border-blue-500 transition-all">
                  <span className="text-[10px] text-slate-400 font-bold shrink-0">到</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => {
                      setCustomEndDate(e.target.value);
                      onToast(`结束日期: ${e.target.value}`);
                    }}
                    className="w-full bg-transparent text-xs text-slate-800 font-mono font-medium outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">报送统计</span>
            <span className="text-[10px] text-slate-400">按上报任务统计</span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="relative w-28 h-28 rounded-full shrink-0 shadow-2xs"
              style={{ background: reportDonutGradient }}
            >
              <div className="absolute inset-3 rounded-full bg-white border border-slate-100 shadow-inner flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-slate-400">累计上报</span>
                <span className="text-2xl font-black font-mono text-slate-900 leading-none mt-1">
                  {reporterSubmittedTotal}
                </span>
                <span className="text-[10px] font-bold text-slate-400 mt-0.5">件</span>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 gap-1.5 min-w-0">
              {reportComposition.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg bg-white border border-slate-100 px-2 py-1.5 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[10px] font-bold text-slate-600 truncate">{item.label}</span>
                  </div>
                  <div className={`text-xs font-black font-mono shrink-0 ${item.textClass}`}>
                    {item.value}
                    <span className="ml-0.5 text-[9px] font-bold font-sans">件</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white border border-slate-100 p-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">整体通过率</span>
              <span className="text-base font-black font-mono text-emerald-600">{reporterOverallPassRate}%</span>
            </div>
            <div className="rounded-xl bg-white border border-slate-100 p-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">一次性通过率</span>
              <span className="text-base font-black font-mono text-blue-600">{reporterFirstPassRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">审核统计</span>
            <span className="text-[10px] text-slate-400">按审核任务统计</span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="relative w-28 h-28 rounded-full shrink-0 shadow-2xs"
              style={{ background: auditDonutGradient }}
            >
              <div className="absolute inset-3 rounded-full bg-white border border-slate-100 shadow-inner flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-slate-400">累计审核</span>
                <span className="text-2xl font-black font-mono text-slate-900 leading-none mt-1">
                  {auditorTotal}
                </span>
                <span className="text-[10px] font-bold text-slate-400 mt-0.5">件</span>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 gap-1.5 min-w-0">
              {auditComposition.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg bg-white border border-slate-100 px-2 py-1.5 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[10px] font-bold text-slate-600 truncate">{item.label}</span>
                  </div>
                  <div className={`text-xs font-black font-mono shrink-0 ${item.textClass}`}>
                    {item.value}
                    <span className="ml-0.5 text-[9px] font-bold font-sans">件</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(92px,1fr)] gap-2">
            <div className="rounded-xl bg-white border border-slate-100 p-2 flex items-center justify-between gap-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">平均审核响应时间</span>
              <span className="text-sm font-black font-mono text-emerald-600 whitespace-nowrap shrink-0">{auditorAvgResponseTimeStr}</span>
            </div>
            <div className="rounded-xl bg-white border border-slate-100 p-2 flex items-center justify-between gap-1 min-w-0">
              <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">审核处理率</span>
              <span className="text-base font-black font-mono text-blue-600 whitespace-nowrap shrink-0">{auditorProcessRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 激活模板信息修改弹窗 */}
      {isActivationModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900">修改激活上报模板信息</h3>
              </div>
              <button
                onClick={() => setIsActivationModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">个人电话</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  placeholder="请输入个人电话"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">身份证号</label>
                <input
                  type="text"
                  value={editForm.idCard}
                  onChange={(e) => setEditForm({ ...editForm, idCard: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  placeholder="请输入18位身份证号"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">银行卡号</label>
                <input
                  type="text"
                  value={editForm.bankCard}
                  onChange={(e) => setEditForm({ ...editForm, bankCard: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  placeholder="请输入银行卡号"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">开户银行</label>
                <input
                  type="text"
                  value={editForm.bankName}
                  onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                  placeholder="请输入开户银行名称"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsActivationModalOpen(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors text-xs"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setActivationData({ ...editForm });
                  setIsActivationModalOpen(false);
                  onToast('激活模板信息保存成功');
                }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center space-x-1 text-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>保存</span>
              </button>
            </div>
          </div>
        </div>
      )}



      {/* System info */}
      <div className="text-center text-[10px] text-slate-400 pt-2 space-y-0.5">
        <p className="font-semibold">台中市网信办 · 移动网格速报审核端 V8.5</p>
        <p className="font-mono text-slate-400">系统票据：{user.ticketNo}</p>
      </div>
    </div>
  );
};
