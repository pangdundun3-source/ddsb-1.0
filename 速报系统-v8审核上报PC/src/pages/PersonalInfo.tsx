import React, { useState } from 'react';
import { PageId, UserProfileData } from '../types';
import { loadUserProfile, saveUserProfile } from '../services/userProfileStorage';
import {
  Smartphone,
  Edit,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Lock,
  IdCard,
  X
} from 'lucide-react';

interface PersonalInfoProps {
  onNavigate: (page: PageId) => void;
  currentUser?: string;
}

const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 px-5 py-3.5">
    <dt className="text-xs text-slate-500 shrink-0">{label}</dt>
    <dd className="text-[13px] font-medium text-slate-900 flex items-center gap-1.5 min-w-0">{children}</dd>
  </div>
);

const SectionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}> = ({ icon, title, extra, children }) => (
  <section className="bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
    <header className="flex items-center justify-between gap-3 px-5 h-12 border-b border-slate-100">
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
        {icon}
        {title}
      </h3>
      {extra}
    </header>
    {children}
  </section>
);

const IconButton: React.FC<{ title: string; onClick: () => void; children: React.ReactNode }> = ({
  title,
  onClick,
  children
}) => (
  <button
    onClick={onClick}
    title={title}
    className="p-1 rounded text-slate-400 hover:text-[#1E5ABB] hover:bg-blue-50 transition-colors cursor-pointer"
  >
    {children}
  </button>
);

export const PersonalInfo: React.FC<PersonalInfoProps> = () => {
  const [profile, setProfile] = useState<UserProfileData>(() => {
    return loadUserProfile({
      name: '张三',
      username: 'grid_zhangsan',
      avatarText: '张',
      roles: ['网格员', '审核员'],
      associatedOrgs: ['西坝区环保局'],
      phone: '138****9210',
      rawPhone: '13888889210',
      realName: '张三',
      idCard: '420106*********1234',
      rawIdCard: '420106199208151234',
      bankCard: '6222 **** **** *** 8912',
      rawBankCard: '6222021000123458912',
      bankName: '中国工商银行台中西坝支行',
      verifiedStatus: '已实名认证',
      updateTime: '2026-08-13 09:15:00'
    });
  });

  const [showIdMasked, setShowIdMasked] = useState(true);
  const [showBankMasked, setShowBankMasked] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getEditForm = () => ({
    realName: profile.realName,
    idCard: profile.rawIdCard || '',
    bankCard: profile.rawBankCard || '',
    bankName: profile.bankName || ''
  });

  const [editForm, setEditForm] = useState(getEditForm);

  const [newPhone, setNewPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`已复制 ${label} 到剪贴板`);
  };

  const openEditModal = () => {
    setEditForm(getEditForm());
    setIsEditModalOpen(true);
  };

  const openPhoneModal = () => {
    setNewPhone('');
    setSmsCode('');
    setIsPhoneModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.realName.trim()) {
      showToast('请输入真实姓名');
      return;
    }
    if (!editForm.idCard.trim()) {
      showToast('请输入身份证号');
      return;
    }

    const maskedId =
      editForm.idCard.length >= 10
        ? `${editForm.idCard.slice(0, 6)}*********${editForm.idCard.slice(-4)}`
        : editForm.idCard;

    const rawBank = editForm.bankCard.replace(/\s+/g, '');
    const maskedBank =
      rawBank.length >= 8
        ? `${rawBank.slice(0, 4)} **** **** *** ${rawBank.slice(-4)}`
        : rawBank;

    const now = new Date().toLocaleString('zh-CN', { hour12: false });

    const updatedProfile: UserProfileData = {
      ...profile,
      name: editForm.realName,
      realName: editForm.realName,
      idCard: maskedId,
      rawIdCard: editForm.idCard,
      bankCard: maskedBank,
      rawBankCard: rawBank,
      bankName: editForm.bankName.trim(),
      avatarText: editForm.realName.slice(0, 1) || '张',
      updateTime: now
    };

    setProfile(saveUserProfile(updatedProfile));

    setIsEditModalOpen(false);
    showToast('个人基础信息修改保存成功！');
  };

  const handleSendSms = () => {
    if (!newPhone.trim() || newPhone.length !== 11) {
      showToast('请输入正确的11位新手机号码');
      return;
    }
    setCountdown(60);
    showToast('验证码已发送至您的手机（模拟验证码：8866）');
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone.trim() || newPhone.length !== 11) {
      showToast('请输入合法的11位手机号码');
      return;
    }
    if (smsCode !== '8866' && smsCode !== '123456') {
      showToast('验证码不正确，请填写模拟验证码：8866');
      return;
    }

    const masked = `${newPhone.slice(0, 3)}****${newPhone.slice(-4)}`;
    const now = new Date().toLocaleString('zh-CN', { hour12: false });

    const updated: UserProfileData = {
      ...profile,
      phone: masked,
      rawPhone: newPhone,
      updateTime: now
    };

    setProfile(saveUserProfile(updated));

    setIsPhoneModalOpen(false);
    setNewPhone('');
    setSmsCode('');
    showToast('手机号码更换成功！');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-12" id="personal-center-pc-view">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#1E5ABB] text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center space-x-2 animate-in slide-in-from-top-2 border border-white/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      <section className="bg-white rounded-xl border border-slate-200 px-6 py-5 flex flex-wrap items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-[#1E5ABB] text-white flex items-center justify-center text-2xl font-bold shrink-0">
          {profile.avatarText || profile.realName.slice(0, 1) || '张'}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{profile.realName}</h2>
            {profile.roles.map((role) => (
              <span key={role} className="text-[11px] font-semibold text-[#1E5ABB] bg-blue-50 px-2 py-0.5 rounded-full">
                {role}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
            <span>
              微信号 <span className="font-mono text-slate-700">{profile.username}</span>
            </span>
            <span>
              手机 <span className="font-mono text-slate-700">{profile.phone}</span>
            </span>
            {profile.associatedOrgs[0] && (
              <span>
                所属机构 <span className="text-slate-700">{profile.associatedOrgs[0]}</span>
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={openEditModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E5ABB] hover:bg-[#184996] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            编辑资料
          </button>
          <span className="text-[11px] text-slate-400 tabular-nums">资料更新于 {profile.updateTime}</span>
        </div>
      </section>

      <SectionCard icon={<IdCard className="w-4 h-4 text-[#1E5ABB]" />} title="基础信息">
        <dl className="-mb-px grid grid-cols-1 md:grid-cols-2 [&>div]:border-b [&>div]:border-slate-100 md:[&>div:nth-child(odd)]:border-r">
          <InfoRow label="真实姓名">{profile.realName}</InfoRow>
          <InfoRow label="绑定手机">
            <span className="font-mono">{profile.phone}</span>
            <button onClick={openPhoneModal} className="ml-1 text-xs text-[#1E5ABB] hover:underline cursor-pointer">
              更换
            </button>
          </InfoRow>
          <InfoRow label="性别 / 民族">男 / 汉族</InfoRow>
          <InfoRow label="政治面貌">中共党员</InfoRow>
          {profile.idCard && (
            <InfoRow label="身份证号">
              <span className="font-mono whitespace-nowrap">
                {showIdMasked ? profile.idCard : profile.rawIdCard || profile.idCard}
              </span>
              <IconButton title={showIdMasked ? '显示完整号码' : '隐藏号码'} onClick={() => setShowIdMasked(!showIdMasked)}>
                {showIdMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-[#1E5ABB]" />}
              </IconButton>
              <IconButton title="复制身份证号" onClick={() => handleCopy(profile.rawIdCard || profile.idCard, '身份证号')}>
                <Copy className="w-3.5 h-3.5" />
              </IconButton>
            </InfoRow>
          )}
          {profile.bankName && (
            <InfoRow label="开户银行">
              <span className="truncate">{profile.bankName}</span>
            </InfoRow>
          )}
          {profile.bankCard && (
            <InfoRow label="银行卡号">
              <span className="font-mono whitespace-nowrap">
                {showBankMasked ? profile.bankCard : profile.rawBankCard || profile.bankCard}
              </span>
              <IconButton title={showBankMasked ? '显示完整卡号' : '隐藏卡号'} onClick={() => setShowBankMasked(!showBankMasked)}>
                {showBankMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-[#1E5ABB]" />}
              </IconButton>
              <IconButton title="复制银行卡号" onClick={() => handleCopy(profile.rawBankCard || profile.bankCard, '银行卡号')}>
                <Copy className="w-3.5 h-3.5" />
              </IconButton>
            </InfoRow>
          )}
        </dl>
      </SectionCard>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E5ABB] flex items-center justify-center font-bold">
                  <Edit className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">编辑个人基础信息</h3>
                  <p className="text-gray-500 text-xs">更新您的真实姓名、证件号码与开户银行信息</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    真实姓名 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.realName}
                    onChange={(e) => setEditForm({ ...editForm, realName: e.target.value })}
                    placeholder="例如：张三"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1E5ABB]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    身份证号 (18位) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={18}
                    value={editForm.idCard}
                    onChange={(e) => setEditForm({ ...editForm, idCard: e.target.value.toUpperCase() })}
                    placeholder="请输入18位身份证号"
                    className="w-full px-3 py-2 font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1E5ABB]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  开户银行支行全称 <span className="font-normal text-gray-400">（选填）</span>
                </label>
                <input
                  type="text"
                  value={editForm.bankName}
                  onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                  placeholder="例如：中国工商银行台中西坝支行"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1E5ABB]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  银行卡号 (津贴/报销发放) <span className="font-normal text-gray-400">（选填）</span>
                </label>
                <input
                  type="text"
                  value={editForm.bankCard}
                  onChange={(e) => setEditForm({ ...editForm, bankCard: e.target.value })}
                  placeholder="请输入银行借记卡卡号"
                  className="w-full px-3 py-2 font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1E5ABB]"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start space-x-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>保存后将自动更新至用户中心，并与财政及内控补贴核发系统进行数据绑定。</span>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E5ABB] hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  保存更新
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E5ABB] flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">更换绑定手机号码</h3>
              </div>
              <button
                onClick={() => setIsPhoneModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhone} className="space-y-3.5 text-xs">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-600 flex justify-between items-center">
                <span>当前绑定手机：</span>
                <span className="font-mono font-bold text-gray-900">{profile.phone}</span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  新手机号码 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={11}
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="请输入11位新手机号码"
                  className="w-full px-3 py-2 font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1E5ABB]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  短信验证码 <span className="text-rose-500">*</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    placeholder="验证码 (模拟: 8866)"
                    className="flex-1 px-3 py-2 font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1E5ABB]"
                  />
                  <button
                    type="button"
                    disabled={countdown > 0}
                    onClick={handleSendSms}
                    className={`px-3.5 py-2 rounded-lg font-bold whitespace-nowrap text-xs transition-colors cursor-pointer ${
                      countdown > 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-50 text-[#1E5ABB] hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsPhoneModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E5ABB] hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  确认更换
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
