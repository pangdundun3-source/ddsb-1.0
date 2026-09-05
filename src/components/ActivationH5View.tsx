import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Smartphone,
  User,
  Building2,
  CreditCard,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff,
  ScanLine,
  QrCode,
  Upload,
  CheckCircle2,
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
  const [bankCard, setBankCard] = useState<string>('6222021001083921882');
  const [bankName, setBankName] = useState<string>('中国工商银行台中市西坝支行');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Activation Code to Organization mapping
  const CODE_DEPT_MAP: Record<string, string> = {
    'JH-2026-8899': '台中市网信办 · 网格化治理中心',
    'JH-2026-9866': '台中市西坝区街道办事处',
    'JH-2026-5521': '西坝区网格化综合治理中心',
    'JH-2026-1188': '东坝区大数据监管中心',
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
      if (matchedProfile.role === '审核员') {
        setSelectedRoleTypes(['审核员']);
      } else if (matchedProfile.role === '综合网格员') {
        setSelectedRoleTypes(['上报员', '审核员']);
      } else {
        setSelectedRoleTypes(['上报员']);
      }
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
    if (selectedRoleTypes.length === 0) {
      onToast('请至少选择一种身份权限：上报员或审核员', 'error');
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

    const hasReporter = selectedRoleTypes.includes('上报员');
    const hasAuditor = selectedRoleTypes.includes('审核员');
    const computedRole: UserRole = hasReporter && hasAuditor ? '综合网格员' : hasAuditor ? '审核员' : '网格员';

    setIsSubmitting(true);
    onToast('正在为您核验身份并激活权限...', 'info');

    setTimeout(() => {
      setIsSubmitting(false);
      onCompleteActivation(
        {
          name: realName.trim(),
          account: user.account || 'grid_zhangsan',
          role: computedRole,
          phone: phone.trim(),
          department,
          gridCode,
          ticketNo,
        },
        computedRole
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

        {/* Header summary */}
        <div className="pt-1 pb-0.5 px-0.5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">身份激活与认证</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">请确认单位配发信息并绑定履职身份</p>
          </div>
          {scanResultTag && (
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center shadow-2xs">
              <Check className="w-3 h-3 mr-0.5 text-emerald-600" />
              {scanResultTag}
            </span>
          )}
        </div>

        {/* Card 1: 账号与身份信息 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {/* Row 1: 激活码 */}
          <div className="px-3.5 py-2.5 flex items-center justify-between">
            <span className="w-20 shrink-0 text-xs font-semibold text-slate-700">
              激活码 <span className="text-rose-500">*</span>
            </span>
            <div className="flex-1 flex items-center space-x-2">
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
                placeholder="请输入激活码"
                className="flex-1 min-w-0 bg-transparent font-mono font-bold text-xs text-slate-900 focus:outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setIsScanModalOpen(true)}
                className="shrink-0 flex items-center space-x-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                title="上传本地激活码图片自动扫描识别"
              >
                <ScanLine className="w-3.5 h-3.5 text-blue-600" />
                <span>扫码</span>
              </button>
            </div>
          </div>

          {/* Row 2: 所属机构 */}
          <div className="px-3.5 py-2.5 flex items-center justify-between">
            <span className="w-20 shrink-0 text-xs font-semibold text-slate-700">
              所属机构
            </span>
            <div className="flex-1 flex items-center text-xs text-slate-800 font-medium truncate">
              <Building2 className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
              <span className="truncate">{department || '台中市网信办 · 网格化治理中心'}</span>
            </div>
          </div>

          {/* Row 3: 真实姓名 */}
          <div className="px-3.5 py-2.5 flex items-center justify-between">
            <span className="w-20 shrink-0 text-xs font-semibold text-slate-700">
              真实姓名 <span className="text-rose-500">*</span>
            </span>
            <input
              type="text"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              placeholder="请输入姓名"
              className="flex-1 min-w-0 bg-transparent font-semibold text-xs text-slate-900 focus:outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Row 4: 身份 */}
          <div className="px-3.5 py-2.5 flex items-center justify-between">
            <span className="w-20 shrink-0 text-xs font-semibold text-slate-700">
              身份 <span className="text-rose-500">*</span>
            </span>
            <div className="flex-1 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleToggleRole('上报员')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                  selectedRoleTypes.includes('上报员')
                    ? 'bg-blue-50 text-blue-700 border-blue-400/80 shadow-2xs'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {selectedRoleTypes.includes('上报员') && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                <span>上报员</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleRole('审核员')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                  selectedRoleTypes.includes('审核员')
                    ? 'bg-blue-50 text-blue-700 border-blue-400/80 shadow-2xs'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {selectedRoleTypes.includes('审核员') && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                <span>审核员</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: 手机号码与短信验证 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {/* Row 1: 联系手机 */}
          <div className="px-3.5 py-2.5 flex items-center justify-between">
            <span className="w-20 shrink-0 text-xs font-semibold text-slate-700">
              手机号码 <span className="text-rose-500">*</span>
            </span>
            <div className="flex-1 flex items-center">
              <span className="text-xs text-slate-400 font-mono mr-2">+86</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                className="flex-1 min-w-0 bg-transparent font-mono font-bold text-xs text-slate-900 focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Row 2: 短信验证码 */}
          <div className="px-3.5 py-2.5 flex items-center justify-between">
            <span className="w-20 shrink-0 text-xs font-semibold text-slate-700">
              验证码 <span className="text-rose-500">*</span>
            </span>
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="请输入6位验证码"
                className="flex-1 min-w-0 bg-transparent font-mono font-bold tracking-wider text-xs text-slate-900 focus:outline-none placeholder:text-slate-400"
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
        </div>

        {/* Card 3: 实名与结算津贴 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {/* Row 1: 身份证号码 */}
          <div className="px-3.5 py-2.5 flex items-center justify-between">
            <span className="w-20 shrink-0 text-xs font-semibold text-slate-700">
              身份证号
            </span>
            <div className="flex-1 flex items-center space-x-2">
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
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title={showIdCard ? '隐藏' : '显示'}
              >
                {showIdCard ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Row 2: 开户银行 */}
          <div className="px-3.5 py-2.5 flex items-center justify-between">
            <span className="w-20 shrink-0 text-xs font-semibold text-slate-700">
              开户银行
            </span>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="请输入开户银行"
              className="flex-1 min-w-0 bg-transparent text-xs text-slate-800 font-medium focus:outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Row 3: 银行卡号 */}
          <div className="px-3.5 py-2.5 flex items-center justify-between">
            <span className="w-20 shrink-0 text-xs font-semibold text-slate-700">
              银行卡号
            </span>
            <input
              type="text"
              value={bankCard}
              onChange={(e) => setBankCard(e.target.value)}
              placeholder="请输入银行卡号"
              className="flex-1 min-w-0 bg-transparent font-mono font-bold text-xs text-slate-900 focus:outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Footnote reassurance */}
        <div className="flex items-center justify-center space-x-1 text-[11px] text-slate-400 pt-1 pb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600/70 shrink-0" />
          <span>政务数据加密传输 · 仅用于职务履职备案</span>
        </div>
      </main>

      {/* 3. Bottom Fixed Action Navigation Bar */}
      <footer className="bg-white border-t border-slate-200/90 px-4 py-3 shrink-0 shadow-lg z-30 flex flex-col space-y-2">
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
                <span>确认激活</span>
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
    </div>
  );
};
