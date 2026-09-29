import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Smartphone,
  User,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  RefreshCw,
  ScanLine,
  QrCode,
  Upload,
  CheckCircle2,
  Check,
  KeyRound,
  Building2,
  BadgeCheck,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface ActivationH5ViewProps {
  user: UserProfile;
  onCompleteActivation: (activatedUser: Partial<UserProfile>, targetRole: UserRole) => void;
  onCancel: () => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ActivationH5View: React.FC<ActivationH5ViewProps> = ({
  user,
  onCompleteActivation,
  onCancel,
  onToast,
}) => {
  // Step State: 1 = Activation Code Verification, 2 = Information Supplementation
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Form States
  const [realName, setRealName] = useState<string>(user.name || '张三');
  const [activationCode, setActivationCode] = useState<string>('JH-2026-8899');
  const [assignedRole, setAssignedRole] = useState<UserRole>(user.role || '综合网格员');
  const [assignedRoleDesc, setAssignedRoleDesc] = useState<string>('兼具一线事件巡查上报与网格工单审核流转权限');
  const [selectedRoleTypes, setSelectedRoleTypes] = useState<('上报员' | '审核员')[]>(() => {
    if (user.role === '审核员') return ['审核员'];
    if (user.role === '网格员') return ['上报员'];
    return ['上报员', '审核员'];
  });
  const [phone, setPhone] = useState<string>(user.phone?.replace(/\*/g, '8') || '13800138000');
  const [verifyCode, setVerifyCode] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [department, setDepartment] = useState<string>(user.department || '台中市网信办 · 网格化治理中心');
  const [gridCode, setGridCode] = useState<string>(user.gridCode || 'XBA-03-018');
  const [gridName, setGridName] = useState<string>('台中网格04区（西坝-阳光花园）');
  const [ticketNo, setTicketNo] = useState<string>(user.ticketNo || 'WB-2026-0813');
  const [idCard, setIdCard] = useState<string>('440106199003071234');
  const [showIdCard, setShowIdCard] = useState<boolean>(false);
  const [bankName, setBankName] = useState<string>('中国工商银行台中市西坝支行');
  const [bankCard, setBankCard] = useState<string>('6222021001083921882');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Mask helper for ID card (matching exact 440106*********1234 format)
  const formatIdCardDisplay = (val: string) => {
    if (!val || showIdCard) return val;
    if (val.length >= 14) {
      return `${val.slice(0, 6)}*********${val.slice(-4)}`;
    }
    return val;
  };

  // Activation Code to Organization mapping
  const CODE_DEPT_MAP: Record<string, string> = {
    'JH-2026-8899': '台中市网信办 · 网格化治理中心',
    'JH-2026-9866': '台中市西坝区街道办事处',
    'JH-2026-5521': '西坝区网格化综合治理中心',
    'JH-2026-1188': '东坝区大数据监管中心',
  };

  // Helper to parse profile info from activation code as incoming parameters
  const getProfileByCode = (code: string) => {
    const trimmed = code.trim();
    const matched = mockQrProfiles.find((p) => p.code.toLowerCase() === trimmed.toLowerCase());
    if (matched) {
      return {
        department: matched.department,
        role: matched.role,
        roleDesc:
          matched.role === '综合网格员'
            ? '兼具一线事件巡查上报与网格工单审核流转权限'
            : matched.role === '审核员'
            ? '网格监督治理 · 负责上报事件复核与工单转办'
            : '基层网格化治理 · 负责日常巡查与事件现场上报',
        roles:
          matched.role === '综合网格员'
            ? (['上报员', '审核员'] as ('上报员' | '审核员')[])
            : matched.role === '审核员'
            ? (['审核员'] as ('上报员' | '审核员')[])
            : (['上报员'] as ('上报员' | '审核员')[]),
        gridCode: matched.gridCode,
        gridName: matched.gridName,
        ticketNo: matched.ticketNo,
        idCard: matched.idCard,
        bankCard: matched.bankCard,
        bankName: matched.bankName,
        name: matched.name,
        phone: matched.phone,
      };
    }
    const dept = CODE_DEPT_MAP[trimmed] || '台中市网信办 · 网格化治理中心';
    return {
      department: dept,
      role: '综合网格员' as UserRole,
      roleDesc: '兼具一线事件巡查上报与网格工单审核流转权限',
      roles: ['上报员', '审核员'] as ('上报员' | '审核员')[],
      gridCode: 'XBA-03-018',
      gridName: '台中网格04区（西坝-阳光花园）',
      ticketNo: 'WB-2026-0813',
      idCard: '440106199003071234',
      bankCard: '6222021001083921882',
      bankName: '中国工商银行台中市西坝支行',
      name: realName,
      phone: phone,
    };
  };

  // Toggle role selection: supports single select or both selected
  const handleToggleRole = (role: '上报员' | '审核员') => {
    setSelectedRoleTypes((prev) => {
      if (prev.includes(role)) {
        if (prev.length === 1) {
          onToast('请至少选择一种身份权限（上报员或审核员）', 'info');
          return prev;
        }
        return prev.filter((r) => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  // Scanner & Image Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [scannedImagePreview, setScannedImagePreview] = useState<string | null>(null);
  const [scanResultTag, setScanResultTag] = useState<string | null>(null);

  // Preset mock profiles for scanned QR codes
  const mockQrProfiles = [
    {
      code: 'JH-2026-9866',
      name: '张建国',
      role: '综合网格员' as UserRole,
      phone: '13892108888',
      department: '台中市西坝区街道办事处',
      gridCode: 'XBA-03-018',
      gridName: '台中网格04区（西坝-阳光花园）',
      ticketNo: 'WB-2026-0813',
      idCard: '420106199208151234',
      bankCard: '6222021402008888912',
      bankName: '中国工商银行台中市西坝支行',
      label: '西坝街道 04区综合网格员',
    },
    {
      code: 'JH-2026-5521',
      name: '李敏',
      role: '网格员' as UserRole,
      phone: '13971236655',
      department: '西坝区网格化综合治理中心',
      gridCode: 'XBA-01-002',
      gridName: '西坝一区（商业街核心片区）',
      ticketNo: 'WB-2026-0922',
      idCard: '420106199504128833',
      bankCard: '6217002010098273611',
      bankName: '中国建设银行台中西坝支行',
      label: '西坝一区 一线巡查网格员',
    },
    {
      code: 'JH-2026-1188',
      name: '王芳',
      role: '审核员' as UserRole,
      phone: '13600188992',
      department: '东坝区大数据监管中心',
      gridCode: 'DBA-05-021',
      gridName: '东坝五区（大数据园区片区）',
      ticketNo: 'WB-2026-0311',
      idCard: '420106198811239921',
      bankCard: '6228480402019928371',
      bankName: '中国农业银行台中分行',
      label: '大数据中心 审核转办专员',
    },
    {
      code: 'JH-2026-8899',
      name: '张三',
      role: '综合网格员' as UserRole,
      phone: '13800138000',
      department: '台中市网信办 · 网格化治理中心',
      gridCode: 'WH-02-14',
      gridName: '台中网格02区（网信治理中心）',
      ticketNo: 'WB-2026-0102',
      idCard: '440106199003071234',
      bankCard: '6222021001083921882',
      bankName: '中国工商银行台中市西坝支行',
      label: '市网信办 网格化治理中心专员',
    },
  ];

  // Perform Scanning & Parameter Auto-population
  const executeScanRecognition = (imageSrc: string | null, targetProfile?: typeof mockQrProfiles[0]) => {
    const matchedProfile = targetProfile || mockQrProfiles[0];
    setScanStatus('scanning');
    setIsScanModalOpen(true);
    if (imageSrc) {
      setScannedImagePreview(imageSrc);
    }

    // Simulate optical scan & QR decoding
    setTimeout(() => {
      setScanStatus('success');
      const profile = getProfileByCode(matchedProfile.code);
      setActivationCode(matchedProfile.code);
      setRealName(matchedProfile.name);
      setAssignedRole(profile.role);
      setAssignedRoleDesc(profile.roleDesc);
      setSelectedRoleTypes(profile.roles);
      setPhone(matchedProfile.phone);
      setDepartment(profile.department);
      setGridCode(profile.gridCode || matchedProfile.gridCode);
      setGridName(profile.gridName || matchedProfile.gridName);
      setTicketNo(profile.ticketNo || matchedProfile.ticketNo);
      if (matchedProfile.idCard) setIdCard(matchedProfile.idCard);
      if (matchedProfile.bankCard) setBankCard(matchedProfile.bankCard);
      if (matchedProfile.bankName) setBankName(matchedProfile.bankName);
      setScanResultTag(`已核验【${matchedProfile.name} · ${profile.role}】`);

      onToast(`✅ 扫码识别成功！机构与【${profile.role}】角色已代入，请完善信息`, 'success');

      // Auto advance to Step 2 after brief scan feedback
      setTimeout(() => {
        setIsScanModalOpen(false);
        setScanStatus('idle');
        setCurrentStep(2);
      }, 700);
    }, 700);
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      executeScanRecognition(dataUrl, mockQrProfiles[0]);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  // Handle Step 1 Verification
  const handleVerifyStep1 = () => {
    const trimmedCode = activationCode.trim();
    if (!trimmedCode) {
      onToast('请输入单位配发的激活码', 'error');
      return;
    }

    const profile = getProfileByCode(trimmedCode);
    setDepartment(profile.department);
    setAssignedRole(profile.role);
    setAssignedRoleDesc(profile.roleDesc);
    setSelectedRoleTypes(profile.roles);
    if (profile.gridCode) setGridCode(profile.gridCode);
    if (profile.gridName) setGridName(profile.gridName);
    if (profile.ticketNo) setTicketNo(profile.ticketNo);
    if (profile.name && profile.name !== '张三') setRealName(profile.name);
    if (profile.phone && profile.phone !== '13800138000') setPhone(profile.phone);
    if (profile.idCard) setIdCard(profile.idCard);
    if (profile.bankCard) setBankCard(profile.bankCard);
    if (profile.bankName) setBankName(profile.bankName);

    onToast(`✅ 激活码核验通过！机构【${profile.department.split('·')[0].trim()}】与【${profile.role}】角色已代入`, 'success');
    setCurrentStep(2);
  };

  // Handle send SMS verification code
  const handleSendCode = () => {
    if (!phone || phone.length < 11) {
      onToast('请输入有效的11位手机号码', 'error');
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedCode(code);
    setCountdown(60);
    onToast(`【模拟验证码】短信已发送至 ${phone}，验证码：${code}`, 'info');

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

  // One-click quick fill demo code
  const handleQuickFillCode = () => {
    const code = generatedCode || '886622';
    setVerifyCode(code);
    setGeneratedCode(code);
    onToast(`已自动为您填入验证码：${code}`, 'success');
  };

  // Submit Step 2 Information and Complete Activation
  const handleSubmit = () => {
    if (!realName.trim()) {
      onToast('请填写真实姓名', 'error');
      return;
    }
    if (!phone.trim() || phone.trim().length < 11) {
      onToast('请填写有效的11位手机号码', 'error');
      return;
    }
    if (!verifyCode.trim()) {
      onToast('请输入短信验证码（可点击“填入”）', 'error');
      return;
    }

    setIsSubmitting(true);
    onToast(`正在以【${assignedRole}】身份核验并激活权限...`, 'info');

    setTimeout(() => {
      setIsSubmitting(false);
      onCompleteActivation(
        {
          name: realName.trim(),
          account: user.account || 'grid_zhangsan',
          role: assignedRole,
          phone: phone.trim(),
          department,
          gridCode,
          ticketNo,
          idCard: idCard.trim(),
          bankCard: bankCard.trim(),
          bankName: bankName.trim(),
        },
        assignedRole
      );
    }, 700);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f5f6f8] text-slate-800 overflow-hidden select-none">
      {/* Scrollable Body Content */}
      <main className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3 pb-24">
        {/* Hidden File Input for local QR code image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* 2-Step Stepper Progress Bar */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            {/* Step 1 Indicator */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                  currentStep === 1
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30 ring-4 ring-blue-100'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {currentStep > 1 ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : '1'}
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-bold leading-tight ${currentStep === 1 ? 'text-blue-600' : 'text-slate-800'}`}>
                  第一步: 验证激活码
                </div>
              </div>
            </div>

            {/* Connecting Divider */}
            <div className="flex-1 h-0.5 bg-slate-200 mx-3 relative">
              <div
                className={`h-full transition-all duration-300 ${
                  currentStep === 2 ? 'bg-blue-600 w-full' : 'w-0'
                }`}
              />
            </div>

            {/* Step 2 Indicator */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                  currentStep === 2
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30 ring-4 ring-blue-100'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                2
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-bold leading-tight ${currentStep === 2 ? 'text-blue-600' : 'text-slate-400'}`}>
                  第二步: 补充信息
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 1: Activation Code Verification View */}
        {currentStep === 1 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-200">
            {/* Step 1 Title & Description Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 rounded-2xl p-4 text-white shadow-md shadow-blue-500/20 relative overflow-hidden">
              <div className="absolute -right-6 -top-8 w-24 h-24 rounded-full border border-white/15" />
              <div className="absolute right-8 -bottom-10 w-20 h-20 rounded-full bg-white/10" />

              <div className="relative z-10 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-black tracking-tight">填写单位专属激活码</h2>
                  <p className="text-[11px] text-blue-50/90 mt-1 leading-relaxed">
                    请输入单位配发的履职专属激活码，系统将自动核验所属机构并代入身份角色。
                  </p>
                </div>
              </div>
            </div>

            {/* Activation Code Input Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
              <div className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                    <span>单位激活码</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsScanModalOpen(true)}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 border border-blue-200 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                    title="上传本地激活码图片自动扫描识别"
                  >
                    <ScanLine className="w-3.5 h-3.5 text-blue-600" />
                    <span>扫码识别</span>
                  </button>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={activationCode}
                    onChange={(e) => {
                      const val = e.target.value;
                      setActivationCode(val);
                      if (CODE_DEPT_MAP[val.trim()]) {
                        setDepartment(CODE_DEPT_MAP[val.trim()]);
                      }
                    }}
                    placeholder="请输入单位配发的激活码，例如: JH-2026-8899"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2.5 font-mono font-bold text-xs text-slate-900 focus:outline-none placeholder:text-slate-400 placeholder:font-normal transition-all"
                  />
                  {activationCode && (
                    <button
                      type="button"
                      onClick={() => setActivationCode('')}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-600 text-xs p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* System Security Notice (Synchronized Style) */}
            <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100/70 text-[11px] text-slate-600 flex items-start gap-2 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                工作激活码由所属治理中心统一配发，核验后将确认所属机构与履职角色，进入第二步完善个人信息。
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: Information Supplementation View */}
        {currentStep === 2 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-200">
            {/* Step 2 Title & Description Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 rounded-2xl p-4 text-white shadow-md shadow-blue-500/20 relative overflow-hidden">
              <div className="absolute -right-6 -top-8 w-24 h-24 rounded-full border border-white/15" />
              <div className="absolute right-8 -bottom-10 w-20 h-20 rounded-full bg-white/10" />

              <div className="relative z-10">
                <h2 className="text-sm font-black tracking-tight">补充实名信息</h2>
                <p className="text-[11px] text-blue-50/90 mt-1 leading-relaxed">
                  请完善姓名与手机号码，确认无误后即可完成激活。
                </p>
              </div>
            </div>

            {/* Card 1: 激活信息 (所属机构、角色由激活信息带入展示) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
              <div className="px-3.5 py-2.5 bg-slate-50/70 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center space-x-1.5 text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-bold">激活信息</span>
                </div>
              </div>

              {/* Row: 所属机构 */}
              <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                <span className="w-20 shrink-0 text-xs font-medium text-slate-500">
                  所属机构
                </span>
                <div className="flex-1 min-w-0 text-right">
                  <span className="text-xs font-bold text-slate-800 truncate block">
                    {department}
                  </span>
                </div>
              </div>

              {/* Row: 角色 */}
              <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                <span className="w-20 shrink-0 text-xs font-medium text-slate-500">
                  角色
                </span>
                <div className="flex-1 min-w-0 text-right">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 inline-block">
                    {assignedRole}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: 补充个人信息 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
              <div className="px-3.5 py-2.5 bg-slate-50/70 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center space-x-1.5 text-slate-700">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-bold">补充个人信息</span>
                </div>
              </div>

              {/* Row: 真实姓名 */}
              <div className="px-3.5 py-2.5 flex items-center justify-between">
                <span className="w-20 shrink-0 text-xs font-medium text-slate-700 flex items-center gap-1">
                  <span>真实姓名</span>
                  <span className="text-rose-500">*</span>
                </span>
                <input
                  type="text"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  placeholder="请输入真实姓名"
                  className="flex-1 min-w-0 bg-transparent font-semibold text-xs text-slate-900 focus:outline-none placeholder:text-slate-400 text-right"
                />
              </div>

              {/* Row: 联系手机 */}
              <div className="px-3.5 py-2.5 flex items-center justify-between">
                <span className="w-20 shrink-0 text-xs font-medium text-slate-700 flex items-center gap-1">
                  <span>手机号码</span>
                  <span className="text-rose-500">*</span>
                </span>
                <div className="flex-1 flex items-center justify-end">
                  <span className="text-xs text-slate-400 font-mono mr-2">+86</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="请输入11位手机号"
                    className="w-32 bg-transparent font-mono font-bold text-xs text-slate-900 focus:outline-none placeholder:text-slate-400 text-right"
                  />
                </div>
              </div>

              {/* Row: 短信验证码 */}
              <div className="px-3.5 py-2.5 flex items-center justify-between">
                <span className="w-20 shrink-0 text-xs font-medium text-slate-700">
                  验证码 <span className="text-rose-500">*</span>
                </span>
                <div className="flex-1 flex items-center justify-end space-x-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    placeholder="6位验证码"
                    className="w-24 bg-transparent font-mono font-bold tracking-wider text-xs text-slate-900 focus:outline-none placeholder:text-slate-400 text-right"
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0}
                    className="shrink-0 text-[11px] font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer px-2 py-1"
                  >
                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickFillCode}
                    className="shrink-0 text-[10px] text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/70 px-1.5 py-0.5 rounded font-medium cursor-pointer"
                    title="演示快速填入"
                  >
                    填入
                  </button>
                </div>
              </div>

              {/* Row: 身份证号 */}
              <div className="px-3.5 py-2.5 flex items-center justify-between">
                <span className="w-20 shrink-0 text-xs font-medium text-slate-700">
                  身份证号
                </span>
                <div className="flex-1 flex items-center justify-between ml-2">
                  <input
                    type="text"
                    value={showIdCard ? idCard : formatIdCardDisplay(idCard)}
                    onChange={(e) => setIdCard(e.target.value)}
                    placeholder="请输入18位身份证号"
                    className="flex-1 min-w-0 bg-transparent font-mono font-bold text-xs text-slate-900 focus:outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowIdCard(!showIdCard)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer shrink-0 ml-2"
                    title={showIdCard ? '隐藏' : '显示'}
                  >
                    {showIdCard ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>

              {/* Row: 开户银行 */}
              <div className="px-3.5 py-2.5 flex items-center">
                <span className="w-20 shrink-0 text-xs font-medium text-slate-700">
                  开户银行
                </span>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="请输入开户银行"
                  className="flex-1 min-w-0 bg-transparent text-xs text-slate-900 font-medium focus:outline-none placeholder:text-slate-400 ml-2"
                />
              </div>

              {/* Row: 银行卡号 */}
              <div className="px-3.5 py-2.5 flex items-center">
                <span className="w-20 shrink-0 text-xs font-medium text-slate-700">
                  银行卡号
                </span>
                <input
                  type="text"
                  value={bankCard}
                  onChange={(e) => setBankCard(e.target.value)}
                  placeholder="请输入银行卡号"
                  className="flex-1 min-w-0 bg-transparent font-mono font-bold text-xs text-slate-900 focus:outline-none placeholder:text-slate-400 ml-2"
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100/70 text-[11px] text-slate-600 flex items-start gap-2 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                政务系统已开启信息安全保护，激活成功后即可进入工作台。
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Fixed Action Navigation Bar */}
      <footer className="bg-white border-t border-slate-200/90 px-4 py-3 shrink-0 shadow-lg z-30 flex flex-col space-y-2">
        {currentStep === 1 ? (
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              暂不激活 · 返回
            </button>

            <button
              type="button"
              onClick={handleVerifyStep1}
              className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <span>核验激活码 · 下一步</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        ) : (
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
              <span>上一步</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                  <span>正在提交激活...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>补充完毕 · 确认激活</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>
          </div>
        )}
      </footer>

      {/* Scan QR / Local Image Upload Modal */}
      {isScanModalOpen && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3.5 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-sm flex flex-col p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ScanLine className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">激活码扫码识别</h3>
                  <p className="text-[10.5px] text-slate-500">上传本地激活码图片识别并自动填入</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsScanModalOpen(false);
                  setScanStatus('idle');
                }}
                className="text-slate-400 hover:text-slate-700 p-1 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-3.5">
              {/* Scan Animation / Viewport */}
              <div className="relative w-full h-44 bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-800 flex flex-col items-center justify-center shadow-inner">
                {scannedImagePreview ? (
                  <img
                    src={scannedImagePreview}
                    alt="Scanned Code"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 space-y-2 p-4 text-center">
                    <div className="relative">
                      <QrCode className="w-16 h-16 text-slate-500 stroke-[1.5]" />
                      <div className="absolute inset-0 border border-blue-500/40 rounded-lg animate-pulse"></div>
                    </div>
                    <span className="text-[11px] text-slate-300">
                      请上传配发的激活二维码或条码图片
                    </span>
                  </div>
                )}

                {/* Corner Markers */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-400 pointer-events-none"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-400 pointer-events-none"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-400 pointer-events-none"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-400 pointer-events-none"></div>

                {/* Laser Scanning Bar */}
                {scanStatus === 'scanning' && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-bounce top-1/2 -translate-y-1/2"></div>
                )}

                {/* Status Overlay */}
                {scanStatus === 'scanning' && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs flex flex-col items-center justify-center text-white space-y-1.5">
                    <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                    <span className="text-xs font-bold text-cyan-200">正在解析激活码...</span>
                  </div>
                )}

                {scanStatus === 'success' && (
                  <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-2xs flex flex-col items-center justify-center text-white space-y-1 animate-in zoom-in-95">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-200">识别成功！已自动核验激活码</span>
                  </div>
                )}
              </div>

              {/* Action Button 1: Upload from local */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 active:scale-[0.99] border border-blue-200 text-blue-700 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-blue-600" />
                <span>从本地相册 / 文件选择激活码图片</span>
              </button>

              {/* Preset Sample Fast Select */}
              <div className="pt-1 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center justify-between">
                  <span>演示快速识别（无需本地图片）：</span>
                  <span className="text-[10px] text-blue-600 font-normal">点击即刻核验并进入第二步</span>
                </div>

                <div className="space-y-1.5">
                  {mockQrProfiles.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => executeScanRecognition(null, item)}
                      className="w-full p-2 bg-slate-50 hover:bg-blue-50/80 active:bg-blue-100/80 border border-slate-200 hover:border-blue-300 rounded-xl flex items-center justify-between text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-slate-200/80 group-hover:bg-blue-100 text-slate-700 group-hover:text-blue-700 flex items-center justify-center shrink-0 text-[10px] font-mono font-bold">
                          QR
                        </div>
                        <div className="truncate">
                          <div className="text-[11.5px] font-bold text-slate-800 group-hover:text-blue-900 truncate">
                            {item.name} · <span className="font-mono">{item.code}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {item.department}（{item.gridName.split('（')[0]}）
                          </div>
                        </div>
                      </div>
                      <span className="text-[10.5px] text-blue-600 font-bold shrink-0 ml-1">
                        识别
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

