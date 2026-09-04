import React, { useState } from 'react';
import { PageId, UserProfileData } from '../types';
import { loadUserProfile, saveUserProfile } from '../services/userProfileStorage';
import {
  Building2,
  Smartphone,
  User,
  Edit,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Lock,
  Calendar,
  CreditCard,
  Building,
  KeyRound,
  FileText,
  CheckSquare,
  Award,
  ChevronRight,
  Shield,
  Activity,
  Phone,
  Mail,
  MapPin,
  Clock,
  X,
  Sparkles,
  Laptop,
  Check
} from 'lucide-react';

interface PersonalInfoProps {
  onNavigate: (page: PageId) => void;
  currentUser?: string;
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({
  onNavigate,
  currentUser = '张三'
}) => {
  // State for user profile data (with localStorage persistence)
  const [profile, setProfile] = useState<UserProfileData>(() => {
    return loadUserProfile({
      name: '张三',
      username: 'grid_zhangsan',
      avatarText: '张',
      roles: ['上报员', '审核员'],
      associatedOrgs: [
        '台中市网信办-西坝区环保局',
        '台中市西坝区街道办事处',
        '西坝区应急管理局',
        '西坝区网格化综合治理中心'
      ],
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

  // UI States
  const [showIdMasked, setShowIdMasked] = useState(true);
  const [showBankMasked, setShowBankMasked] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit form states
  const [editForm, setEditForm] = useState({
    realName: profile.realName,
    idCard: profile.rawIdCard || '420106199208151234',
    bankCard: profile.rawBankCard || '6222021000123458912',
    bankName: profile.bankName
  });

  // Phone form states
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
        : editForm.bankCard;

    const now = new Date().toLocaleString('zh-CN', { hour12: false });

    const updatedProfile: UserProfileData = {
      ...profile,
      name: editForm.realName,
      realName: editForm.realName,
      idCard: maskedId,
      rawIdCard: editForm.idCard,
      bankCard: maskedBank,
      rawBankCard: rawBank,
      bankName: editForm.bankName,
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

  // Mock Security Login Logs
  const securityLogs = [
    {
      id: 'log-1',
      action: '账号登录成功',
      ip: '119.130.24.89',
      location: '台中市西坝区政务专网',
      device: 'Chrome 128 / Windows 11 (PC工作站)',
      time: '2026-08-20 09:12:30',
      status: '正常'
    },
    {
      id: 'log-2',
      action: '实名身份核验比对',
      ip: '10.22.108.4',
      location: '台中市政务数据中心内网',
      device: '省一体化政务服务系统接口',
      time: '2026-08-13 09:15:00',
      status: '认证通过'
    },
    {
      id: 'log-3',
      action: '多机构权限同步更新',
      ip: '119.130.24.89',
      location: '台中市西坝区政务专网',
      device: 'Chrome 128 / Windows 11',
      time: '2026-08-10 14:22:18',
      status: '同步完成'
    },
    {
      id: 'log-4',
      action: '津贴结算卡账户绑定',
      ip: '119.130.24.89',
      location: '台中市西坝区政务专网',
      device: '工行银企互联认证通道',
      time: '2026-07-28 11:05:42',
      status: '核验绑定'
    }
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-12" id="personal-center-pc-view">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#1E5ABB] text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center space-x-2 animate-in slide-in-from-top-2 border border-white/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Grid: Left Overview (4/12) + Right Tabs & Details (8/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ================= LEFT COLUMN: User Profile & Quick Actions ================= */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card: User Identity & Roles */}
          <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden">
            {/* Header Gradient */}
            <div className="bg-gradient-to-r from-[#0284C7] via-[#1E5ABB] to-[#2563EB] p-6 text-white relative">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-white text-[#1E5ABB] flex items-center justify-center font-bold text-2xl shadow-md shrink-0 border-2 border-white/80">
                  {profile.avatarText || profile.realName.slice(0, 1) || '张'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">{profile.realName}</h2>
                    <span className="bg-emerald-500/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>已实名</span>
                    </span>
                  </div>
                  <div className="text-blue-100 text-xs font-mono mt-1">
                    账号ID: {profile.username}
                  </div>
                </div>
              </div>

              {/* Roles Badge List */}
              <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-white/15">
                <span className="text-xs text-blue-100 font-medium">当前权限:</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.roles.map((r, i) => (
                    <span
                      key={i}
                      className="bg-white/20 hover:bg-white/25 text-white text-xs px-2.5 py-0.5 rounded-md font-medium backdrop-blur-xs border border-white/20"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Fast Facts */}
            <div className="p-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>绑定手机</span>
                </span>
                <div className="flex items-center space-x-2 font-mono font-bold text-gray-800">
                  <span>{profile.phone}</span>
                  <button
                    onClick={() => {
                      setNewPhone('');
                      setSmsCode('');
                      setIsPhoneModalOpen(true);
                    }}
                    className="text-[#1E5ABB] hover:underline text-[11px] font-medium"
                  >
                    更换
                  </button>
                </div>
              </div>





              {/* 关联机构 (文字展示) */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
                  <span className="flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#1E5ABB]" />
                    <span>关联机构 ({profile.associatedOrgs.length})</span>
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    权限生效中
                  </span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {profile.associatedOrgs.map((org, i) => (
                    <div
                      key={i}
                      className="flex items-start space-x-2 p-2 rounded-lg bg-gray-50/80 text-xs text-gray-700 hover:bg-blue-50/50 transition-colors"
                    >
                      <span className="w-4 h-4 rounded bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-snug text-gray-800 flex-1 font-medium">{org}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: All Information Sections Displayed Directly ================= */}
        <div className="lg:col-span-8 space-y-5">
          {/* ================= SECTION 1: 基础信息与档案 ================= */}
          <div className="bg-white rounded-xl border border-gray-200/90 p-6 shadow-2xs space-y-5">
            <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-4 gap-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E5ABB] flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">个人基础信息详情</h3>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditForm({
                      realName: profile.realName,
                      idCard: profile.rawIdCard || '420106199208151234',
                      bankCard: profile.rawBankCard || '6222021000123458912',
                      bankName: profile.bankName
                    });
                    setIsEditModalOpen(true);
                  }}
                  className="flex items-center space-x-1.5 text-xs font-bold text-[#1E5ABB] hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>编辑基础信息</span>
                </button>
              </div>
            </div>

            {/* Grid of Key-Value data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1">
                <span className="text-gray-500 font-medium">真实姓名</span>
                <p className="text-sm font-bold text-gray-900">{profile.realName}</p>
              </div>

              <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1">
                <span className="text-gray-500 font-medium">身份证号 (二代居民身份证)</span>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold font-mono text-gray-900 tracking-wider">
                    {showIdMasked ? profile.idCard : (profile.rawIdCard || '420106199208151234')}
                  </p>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setShowIdMasked(!showIdMasked);
                        showToast(showIdMasked ? '已展示身份证明文' : '已隐藏身份证号');
                      }}
                      className="p-1 text-gray-400 hover:text-[#1E5ABB] hover:bg-blue-50 rounded cursor-pointer transition-colors"
                      title={showIdMasked ? '显示明文' : '隐藏明文'}
                    >
                      {showIdMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-[#1E5ABB]" />}
                    </button>
                    <button
                      onClick={() => handleCopy(profile.rawIdCard || profile.idCard, '身份证号')}
                      className="p-1 text-gray-400 hover:text-[#1E5ABB] hover:bg-blue-50 rounded cursor-pointer transition-colors"
                      title="复制身份证号"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1">
                <span className="text-gray-500 font-medium">性别 / 民族</span>
                <p className="text-sm font-bold text-gray-900">男 / 汉族</p>
              </div>

              <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1">
                <span className="text-gray-500 font-medium">政治面貌</span>
                <p className="text-sm font-bold text-gray-900">中共党员</p>
              </div>

              <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1">
                <span className="text-gray-500 font-medium">开户银行</span>
                <p className="text-sm font-bold text-gray-900">{profile.bankName}</p>
              </div>

              <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1">
                <span className="text-gray-500 font-medium">银行卡号 (报销与津贴)</span>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold font-mono text-gray-900 tracking-wider">
                    {showBankMasked ? profile.bankCard : (profile.rawBankCard || '6222021000123458912')}
                  </p>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setShowBankMasked(!showBankMasked);
                        showToast(showBankMasked ? '已展示银行卡明文' : '已隐藏银行卡号');
                      }}
                      className="p-1 text-gray-400 hover:text-[#1E5ABB] hover:bg-blue-50 rounded cursor-pointer transition-colors"
                      title={showBankMasked ? '显示明文' : '隐藏明文'}
                    >
                      {showBankMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-[#1E5ABB]" />}
                    </button>
                    <button
                      onClick={() => handleCopy(profile.rawBankCard || profile.bankCard, '银行卡号')}
                      className="p-1 text-gray-400 hover:text-[#1E5ABB] hover:bg-blue-50 rounded cursor-pointer transition-colors"
                      title="复制银行卡号"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* End of Right Column */}
        </div>
      </div>

      {/* ================= MODAL: 编辑个人基础信息 (PC Desktop Dialog) ================= */}
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
                  开户银行支行全称 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.bankName}
                  onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                  placeholder="例如：中国工商银行台中西坝支行"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1E5ABB]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  银行卡号 (津贴/报销发放) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
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

      {/* ================= MODAL: 更换手机号 (PC Desktop Dialog) ================= */}
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
