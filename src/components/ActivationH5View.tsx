import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Smartphone,
  User,
  Building2,
  ChevronRight,
  CreditCard,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff,
  FileText,
  ScanLine,
  QrCode,
  Upload,
  CheckCircle2,
  Camera,
  Check,
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
  // Form States
  const [realName, setRealName] = useState<string>(user.name || '张三');
  const [activationCode, setActivationCode] = useState<string>('JH-2026-8899');
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role || '综合网格员');
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
  const [bankCard, setBankCard] = useState<string>('6222021001083921882');
  const [bankName, setBankName] = useState<string>('中国工商银行台中市西坝支行');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAgreementModal, setShowAgreementModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'org' | 'realname'>('basic');

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
      setActivationCode(matchedProfile.code);
      setRealName(matchedProfile.name);
      setSelectedRole(matchedProfile.role);
      setPhone(matchedProfile.phone);
      setDepartment(matchedProfile.department);
      setGridCode(matchedProfile.gridCode);
      setGridName(matchedProfile.gridName);
      setTicketNo(matchedProfile.ticketNo);
      setIdCard(matchedProfile.idCard);
      setBankCard(matchedProfile.bankCard);
      setBankName(matchedProfile.bankName);
      setScanResultTag(`已识别【${matchedProfile.name} · ${matchedProfile.code}】`);

      onToast(`✅ 扫码识别成功！已自动代入【${matchedProfile.name}】的激活码及网格身份参数`, 'success');

      // Auto close scan modal after brief confirmation
      setTimeout(() => {
        setIsScanModalOpen(false);
        setScanStatus('idle');
      }, 900);
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

  // Submit Activation
  const handleSubmit = () => {
    if (!realName.trim()) {
      onToast('请填写真实姓名', 'error');
      return;
    }
    if (!activationCode.trim()) {
      onToast('请输入单位配发的激活码', 'error');
      return;
    }
    if (!phone.trim()) {
      onToast('请填写手机号码', 'error');
      return;
    }
    if (!verifyCode.trim()) {
      onToast('请输入短信验证码（可点击“一键填入”）', 'error');
      return;
    }
    if (!agreeTerms) {
      onToast('请先勾选并同意服务协议与网格保密承诺', 'error');
      return;
    }

    setIsSubmitting(true);
    onToast('正在为您核验身份并激活工作台权限...', 'info');

    setTimeout(() => {
      setIsSubmitting(false);
      onCompleteActivation(
        {
          name: realName.trim(),
          account: user.account || 'grid_zhangsan',
          role: selectedRole,
          phone: phone.trim(),
          department,
          gridCode,
          ticketNo,
        },
        selectedRole
      );
    }, 800);
  };

  // Mask helper for ID card
  const formatIdCardDisplay = (val: string) => {
    if (!val || showIdCard) return val;
    if (val.length >= 14) {
      return `${val.slice(0, 6)}********${val.slice(-4)}`;
    }
    return val;
  };

  const departmentsList = [
    '台中市网信办 · 网格化治理中心',
    '台中市西坝区街道办事处',
    '西坝区应急管理局',
    '西坝区网格化综合治理中心',
    '东坝区大数据监管中心',
  ];

  const gridList = [
    { code: 'XBA-03-018', name: '台中网格04区（西坝-阳光花园）' },
    { code: 'XBA-01-002', name: '西坝一区（商业街核心片区）' },
    { code: 'XBA-02-009', name: '西坝二区（明月居社区片区）' },
    { code: 'DBA-05-021', name: '东坝五区（大数据园区片区）' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#f7f8fa] text-slate-800 overflow-hidden select-none">
      {/* Scrollable Body Content */}
      <main className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3.5 pb-24">
        {/* Section 1: 身份与登录信息 */}
        <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-200/80 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span>身份与登录信息</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* 真实姓名 */}
            <div>
              <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                真实姓名 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  placeholder="请输入您的真实姓名"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all text-xs"
                />
              </div>
            </div>

            {/* 激活码与扫码识别 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11.5px] font-semibold text-slate-700">
                  激活码 <span className="text-rose-500">*</span>
                </label>
                {scanResultTag && (
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/80 flex items-center">
                    <Check className="w-3 h-3 mr-0.5 text-emerald-600" />
                    {scanResultTag}
                  </span>
                )}
              </div>

              {/* Hidden File Input for local QR code image upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={activationCode}
                    onChange={(e) => setActivationCode(e.target.value)}
                    placeholder="输入单位激活码或点击右侧扫码"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all text-xs tracking-wider"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsScanModalOpen(true)}
                  className="shrink-0 flex items-center space-x-1.5 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs shadow-blue-500/20 cursor-pointer"
                  title="上传本地激活码图片自动扫描识别"
                >
                  <ScanLine className="w-4 h-4" />
                  <span>扫码识别</span>
                </button>
              </div>

              <p className="text-[10.5px] text-slate-500 mt-1 flex items-center">
                <QrCode className="w-3 h-3 text-slate-400 mr-1 shrink-0" />
                支持上传单位配发专属激活码图片，系统将自动识别并代入个人与网格参数
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: 手机号码与短信验证 */}
        <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <span>手机号码与安全验证</span>
            </div>
            <button
              type="button"
              onClick={handleQuickFillCode}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-bold bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition-colors flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>一键填入验证码</span>
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* 手机号 */}
            <div>
              <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                联系手机号码 <span className="text-rose-500">*</span>
              </label>
              <div className="flex rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
                <span className="px-3 py-2.5 text-slate-500 font-mono font-medium border-r border-slate-200 bg-slate-100/80 flex items-center text-xs">
                  +86
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入11位手机号码"
                  className="flex-1 px-3 py-2.5 bg-transparent font-mono font-bold text-slate-900 focus:outline-none text-xs"
                />
              </div>
            </div>

            {/* 验证码 */}
            <div>
              <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                短信验证码 <span className="text-rose-500">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="输入6位验证码"
                  className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all text-xs text-center"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                  className="px-3.5 py-2.5 rounded-xl font-bold text-xs shrink-0 transition-all bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-xs"
                >
                  {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: 所属组织与责任网格 */}
        <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-200/80 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
            <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <span>所属机构与责任网格</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* 所属机构 */}
            <div>
              <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                所属机构 / 治理单位 <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  onToast(`已选机构：${e.target.value}`);
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs"
              >
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* 责任网格 */}
            <div>
              <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                责任网格编号与名称 <span className="text-rose-500">*</span>
              </label>
              <select
                value={gridCode}
                onChange={(e) => {
                  const target = gridList.find((g) => g.code === e.target.value);
                  if (target) {
                    setGridCode(target.code);
                    setGridName(target.name);
                    onToast(`已分配至网格：${target.name}`);
                  }
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs"
              >
                {gridList.map((g) => (
                  <option key={g.code} value={g.code}>
                    [{g.code}] {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 备案工号 */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-slate-500 font-medium">预核发工号/编号</span>
              <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                {ticketNo}
              </span>
            </div>
          </div>
        </div>

        {/* Section 5: 实名认证与结算津贴备案 (可编辑) */}
        <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
              <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <span>实名认证与津贴结算</span>
            </div>
            <span className="text-[10px] text-slate-400">用于履职津贴与实名核验</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* 身份证号 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11.5px] font-semibold text-slate-700">
                  身份证号码 <span className="text-slate-400 font-normal">（国密脱敏加密）</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowIdCard(!showIdCard)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center space-x-1"
                >
                  {showIdCard ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showIdCard ? '隐藏' : '显示'}</span>
                </button>
              </div>
              <input
                type="text"
                value={showIdCard ? idCard : formatIdCardDisplay(idCard)}
                onChange={(e) => setIdCard(e.target.value)}
                placeholder="请输入18位身份证号码"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs"
              />
            </div>

            {/* 开户银行与卡号 */}
            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                  结算开户银行
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="开户银行名称"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs"
                />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                  结算银行卡号
                </label>
                <input
                  type="text"
                  value={bankCard}
                  onChange={(e) => setBankCard(e.target.value)}
                  placeholder="个人结算银行卡号"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: 服务协议与网格承诺 */}
        <div className="bg-white rounded-2xl p-3 shadow-2xs border border-slate-200/80">
          <label className="flex items-start space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
            />
            <div className="text-[11.5px] text-slate-600 leading-relaxed">
              我已阅读并同意
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowAgreementModal(true);
                }}
                className="text-blue-600 font-bold hover:underline mx-0.5"
              >
                《点点速豹平台用户服务协议》
              </button>
              及
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowAgreementModal(true);
                }}
                className="text-blue-600 font-bold hover:underline mx-0.5"
              >
                《网格化信息安全保密承诺》
              </button>
              ，保证所填报个人资料与网格履职身份真实有效。
            </div>
          </label>
        </div>

        {/* Footnote reassurance */}
        <div className="text-center text-[11px] text-slate-400 space-y-1 pt-1 pb-4">
          <div className="flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-slate-600">国家信息安全等级保护三级认证</span>
          </div>
          <p>台中市网信办 · 官方网络安全与信息化综合管理平台</p>
        </div>
      </main>

      {/* 3. Bottom Fixed Action Navigation Bar */}
      <footer className="bg-white border-t border-slate-200 px-4 py-3 shrink-0 shadow-lg z-30 flex flex-col space-y-2">
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            暂不激活 · 返回
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                <span>正在激活认证...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>确认激活并进入工作台</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </>
            )}
          </button>
        </div>
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
                  <p className="text-[10.5px] text-slate-500">上传本地激活码图片识别并自动代入参数</p>
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
                    <span className="text-xs font-bold text-cyan-200">正在光学解析激活码与参数...</span>
                  </div>
                )}

                {scanStatus === 'success' && (
                  <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-2xs flex flex-col items-center justify-center text-white space-y-1 animate-in zoom-in-95">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-200">识别成功！已自动代入参数</span>
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
                  <span className="text-[10px] text-blue-600 font-normal">点击即刻代入</span>
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

      {/* Terms and Privacy Modal */}
      {showAgreementModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-sm max-h-[80vh] flex flex-col p-5 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">服务协议与保密承诺</h3>
              </div>
              <button
                onClick={() => setShowAgreementModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs text-slate-600 leading-relaxed">
              <h4 className="font-bold text-slate-800">一、服务范围与规范</h4>
              <p>
                本平台为台中市网信办官方速报及网格化协同治理平台。用户激活后须严格依照国家法律法规及网格治理规范开展巡查与线索上报。
              </p>
              <h4 className="font-bold text-slate-800">二、信息安全与保密承诺</h4>
              <p>
                网格员与审核员在履行速报采集、审核、转办等职务过程中获悉的公民个人隐私、突发事件研判信息等属于保密范畴，严禁擅自截图、泄露或用于非职务用途。
              </p>
              <h4 className="font-bold text-slate-800">三、账号与真实身份</h4>
              <p>
                用户承诺填报的身份、手机号及网格归属真实无误。经实名核验激活后，账号与微信服务号绑定，不得转借他人使用。
              </p>
            </div>

            <button
              onClick={() => {
                setAgreeTerms(true);
                setShowAgreementModal(false);
                onToast('已同意服务协议与保密承诺');
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/20"
            >
              我已阅读并同意
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
