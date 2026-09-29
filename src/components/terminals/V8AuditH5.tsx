import React, { useState } from 'react';
import { 
  Camera, 
  MapPin, 
  CheckCircle2, 
  Upload, 
  Smartphone, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  Send, 
  ChevronLeft, 
  FileText, 
  Sparkles,
  AlertTriangle,
  History,
  Check,
  Maximize2,
  Minimize2
} from 'lucide-react';

export const V8AuditH5: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(true);
  const [gpsLocked, setGpsLocked] = useState(true);
  const [activeTab, setActiveTab] = useState<'report' | 'tasks' | 'offline'>('report');

  const [formData, setFormData] = useState({
    merchantName: '永利商贸供应链中心 (上海普陀店)',
    checkType: '常规巡检速报',
    riskLevel: '低风险 (正常经营)',
    note: '现场货物码放整齐，出入库单据齐全，营业执照与现场法人核验一致。',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');
    }, 900);
  };

  const phoneContent = (
    <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto">
      {/* Mobile Top App Bar */}
      <div className="sticky top-0 z-30 bg-emerald-600 text-white px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 -ml-1 text-white/80 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-bold text-sm leading-tight">V8 现场审核速报</h3>
            <p className="text-[10px] text-emerald-100">移动端现场终端 · v8.4.0</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-700/80 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
          <span>网络正常</span>
        </div>
      </div>

      {/* GPS & Time Watermark Strip */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200/60 dark:border-emerald-800 px-4 py-2 flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>已锁定GPS: 上海市普陀区真北路 (误差&lt;3米)</span>
        </div>
        <span className="font-mono text-[10px]">2026-08-25 10:35</span>
      </div>

      {/* Content Form or Success view */}
      <div className="p-4 flex-1 space-y-4">
        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Camera / Photo preview area */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  现场防作弊水印拍照 (必拍)
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">已开启OCR秒级验真</span>
              </div>

              <div className="relative rounded-lg overflow-hidden border border-emerald-500/30 bg-slate-900 text-white aspect-video flex flex-col justify-end p-3">
                {/* Simulated photo background image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-80"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Watermark overlay */}
                <div className="relative z-10 text-[10px] space-y-0.5 font-mono text-emerald-200">
                  <div className="font-bold text-white flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>速报系统防伪水印 #SB-20260825-9921</span>
                  </div>
                  <div>经纬度: 31.2304° N, 121.4737° E</div>
                  <div>拍摄时间: 2026-08-25 10:34:18 (已校准卫星时钟)</div>
                  <div>特派核验员: 陈晓峰 (工号 90812)</div>
                </div>

                <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>OCR已识别商户门头</span>
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => alert('已重新触发动态现场拍摄并校准水印')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>重新抓拍</span>
                </button>
                <button
                  type="button"
                  className="py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                >
                  + 加拍单据凭据
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 space-y-3 shadow-xs text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  核验商户主体
                </label>
                <input
                  type="text"
                  value={formData.merchantName}
                  onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    速报上报类型
                  </label>
                  <select
                    value={formData.checkType}
                    onChange={(e) => setFormData({ ...formData, checkType: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option>常规巡检速报</option>
                    <option>突发异常提报</option>
                    <option>大额配额核验</option>
                    <option>现场整改复核</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    现场初步评级
                  </label>
                  <select
                    value={formData.riskLevel}
                    onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option>低风险 (正常经营)</option>
                    <option>中风险 (需补充说明)</option>
                    <option>高风险 (暂停额度)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  核验纪要与现场情况记录
                </label>
                <textarea
                  rows={2}
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Electronic signature preview */}
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  <span>核验专员电子手写签名：</span>
                  <span className="font-serif italic font-bold text-slate-900 dark:text-white ml-2">陈晓峰</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-medium">已生物指纹确认</span>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>正在加密上传并同步PC审核端...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>立即提交速报 (直通PC风控端)</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Success Screen */
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 p-6 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                速报上报成功！
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                单号：<span className="font-mono font-bold text-slate-700 dark:text-slate-300">SB-20260825-9921</span>
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-left text-xs space-y-1.5 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">流转节点：</span>
                <span className="font-semibold text-blue-600">已自动推送到【V8-审核上报PC端】</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">当前排队：</span>
                <span className="font-mono font-bold">第 1 位 · 预计秒审通过</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep('form')}
                className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-200"
              >
                继续下一笔巡检
              </button>
              <button
                onClick={onBack}
                className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700"
              >
                返回门户
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Mobile Tabbar */}
      <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 py-2 text-center text-[10px] text-slate-500">
        <button 
          onClick={() => setActiveTab('report')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'report' ? 'text-emerald-600 font-bold' : ''}`}
        >
          <Camera className="w-4 h-4" />
          <span>现场速报</span>
        </button>
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'tasks' ? 'text-emerald-600 font-bold' : ''}`}
        >
          <Clock className="w-4 h-4" />
          <span>我的待办 (2)</span>
        </button>
        <button 
          onClick={() => setActiveTab('offline')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'offline' ? 'text-emerald-600 font-bold' : ''}`}
        >
          <History className="w-4 h-4" />
          <span>上报记录</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 flex flex-col items-center">
      {/* Top controls bar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium hover:bg-slate-50 text-slate-700 dark:text-slate-300"
          >
            ← 返回门户选择
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              V8-审核上报H5 模拟运行环境
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              适配 iOS / Android / 微信浏览器 / 企业微信工作台
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs"
          >
            {isPhoneFrame ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            <span>{isPhoneFrame ? '切换全宽视图' : '切换手机模型'}</span>
          </button>
        </div>
      </div>

      {/* Simulator Device Frame or Full Screen */}
      {isPhoneFrame ? (
        <div className="w-full max-w-[390px] h-[780px] bg-slate-900 rounded-[44px] p-3 shadow-2xl ring-8 ring-slate-800/80 border-4 border-slate-700 flex flex-col overflow-hidden relative">
          {/* Speaker / Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-center">
            <div className="w-10 h-1 bg-slate-800 rounded-full" />
            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full ml-2 border border-slate-800" />
          </div>

          <div className="w-full h-full rounded-[34px] overflow-hidden flex flex-col pt-4">
            {phoneContent}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl h-[700px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
          {phoneContent}
        </div>
      )}
    </div>
  );
};
