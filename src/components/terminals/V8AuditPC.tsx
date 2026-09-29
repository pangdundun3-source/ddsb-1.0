import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  Check, 
  X, 
  RotateCcw, 
  ChevronRight, 
  ShieldAlert, 
  ZoomIn, 
  ZoomOut, 
  Cpu, 
  Zap, 
  Clock, 
  Sparkles, 
  Layers, 
  Sliders, 
  FileCheck,
  AlertTriangle,
  ArrowRight,
  Maximize2
} from 'lucide-react';

interface AuditItem {
  id: string;
  source: string;
  merchantName: string;
  reporter: string;
  submitTime: string;
  riskScore: number;
  ocrConfidence: string;
  category: string;
  image: string;
  formData: {
    address: string;
    registeredCapital: string;
    licenseCode: string;
    anomalyNotes: string;
  };
}

export const V8AuditPC: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [auditQueue, setAuditQueue] = useState<AuditItem[]>([
    {
      id: 'SB-20260825-9921',
      source: 'V8-审核上报H5 (现场特派)',
      merchantName: '永利商贸供应链中心 (上海普陀店)',
      reporter: '陈晓峰 (特派员)',
      submitTime: '10:34:18 (2分钟前)',
      riskScore: 98,
      ocrConfidence: '99.4%',
      category: '常规巡检速报',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000&auto=format&fit=crop&q=80',
      formData: {
        address: '上海市普陀区真北路 1288 号 2 栋',
        registeredCapital: '1,000 万元人民币',
        licenseCode: '91310107MA1GXXXXXX (三证合一无误)',
        anomalyNotes: '现场库房整洁，消防设施完好，无经营异常。',
      },
    },
    {
      id: 'SB-20260825-9918',
      source: 'V8-审核上报H5 (渠道提交)',
      merchantName: '易通达大件物流仓储服务部',
      reporter: '林浩然 (渠道业务员)',
      submitTime: '10:28:40 (8分钟前)',
      riskScore: 78,
      ocrConfidence: '92.1%',
      category: '大额配额核验',
      image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1000&auto=format&fit=crop&q=80',
      formData: {
        address: '江苏省苏州市工业园区东环路 88 号',
        registeredCapital: '500 万元人民币',
        licenseCode: '91320500MA23XXXXXX',
        anomalyNotes: '现场有部分单据未加盖公章，需核验原件合同。',
      },
    },
    {
      id: 'SB-20260825-9912',
      source: 'API自动接入/OCR初筛',
      merchantName: '顺风扬冷链物流科技股份有限公司',
      reporter: '系统自动提报',
      submitTime: '10:15:02 (21分钟前)',
      riskScore: 95,
      ocrConfidence: '98.8%',
      category: '突发异常提报',
      image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1000&auto=format&fit=crop&q=80',
      formData: {
        address: '浙江省杭州市萧山区物流港 A 区',
        registeredCapital: '2,500 万元人民币',
        licenseCode: '91330109MA0FXXXXXX',
        anomalyNotes: '冷库温控系统升级，申报临时温控报备单。',
      },
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [todayAuditedCount, setTodayAuditedCount] = useState(148);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const currentItem = auditQueue[currentIndex];

  const handleDecision = (type: 'approve' | 'reject' | 'supplement') => {
    if (!currentItem) return;

    let message = '';
    if (type === 'approve') message = `✅ 已通过单号: ${currentItem.id}，配额已实时解锁！`;
    if (type === 'reject') message = `❌ 已驳回单号: ${currentItem.id}，原因已推送至H5现场端`;
    if (type === 'supplement') message = `⚠️ 已退回补充单号: ${currentItem.id}，等待现场补传照片`;

    setFeedbackToast(message);
    setTodayAuditedCount((prev) => prev + 1);

    setTimeout(() => {
      setFeedbackToast(null);
      if (currentIndex < auditQueue.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        alert('🎉 恭喜！当前抢单队列中的所有速报已全部完成复核！');
      }
    }, 800);
  };

  // Keyboard shortcut listener for fast blind auditing (1: Pass, 2: Reject, 3: Supplement)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid hotkeys when typing in inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === '1') {
        handleDecision('approve');
      } else if (e.key === '2') {
        handleDecision('reject');
      } else if (e.key === '3') {
        handleDecision('supplement');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, auditQueue]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* PC Dual-Screen Topbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-600 text-white shadow-md shadow-violet-500/20">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                V8-审核上报PC端 · 集中高通量复核工作台
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-900/60 text-violet-300 border border-violet-700">
                双联比对引擎 v8.4.2
              </span>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                低延迟队列 (12ms)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              宽屏双联图文差分核验、快捷键盲审流 (按键: 1通过 / 2驳回 / 3退补)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Metrics */}
          <div className="flex items-center gap-4 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
            <div>
              <span className="text-slate-400">今日已审：</span>
              <span className="font-bold text-emerald-400 font-mono">{todayAuditedCount} 笔</span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div>
              <span className="text-slate-400">当前排队：</span>
              <span className="font-bold text-amber-400 font-mono">{auditQueue.length - currentIndex} 笔待处理</span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div>
              <span className="text-slate-400">平均单笔用时：</span>
              <span className="font-bold text-blue-400 font-mono">2.4 秒</span>
            </div>
          </div>

          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            返回门户
          </button>
        </div>
      </div>

      {/* Decision feedback alert toast */}
      {feedbackToast && (
        <div className="bg-emerald-600 text-white text-center py-2 text-xs font-bold animate-in fade-in slide-in-from-top duration-200">
          {feedbackToast}
        </div>
      )}

      {/* Main Dual-Screen Split Pane Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 max-w-[1700px] mx-auto w-full">
        {/* Left Column: Queue List & Inspection Form (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Queue Selector Bar */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-3">
            <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
              <span>待审工单实时队列</span>
              <span className="text-[10px] text-slate-500 font-mono">自动刷新中</span>
            </div>
            <div className="space-y-1.5">
              {auditQueue.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-full p-2.5 rounded-lg text-left text-xs transition-all flex items-center justify-between border ${
                    idx === currentIndex
                      ? 'bg-violet-950/60 border-violet-500/80 text-white shadow-xs'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="truncate">
                    <div className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
                      <span>{item.merchantName}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {item.id} · {item.reporter}
                    </div>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                    item.riskScore >= 90 ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                  }`}>
                    健康分 {item.riskScore}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Form comparison & OCR Field Extraction */}
          {currentItem && (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {currentItem.merchantName}
                    </h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      来源：{currentItem.source}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-violet-400">
                      OCR置信度: {currentItem.ocrConfidence}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{currentItem.submitTime}</div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-1">
                    <div className="text-slate-400 font-medium">现场申报经营地址 (OCR比对结果)</div>
                    <div className="text-slate-100 font-semibold flex items-center justify-between">
                      <span>{currentItem.formData.address}</span>
                      <span className="text-[10px] px-1 rounded bg-emerald-900 text-emerald-300 font-mono">100% 匹配</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                      <div className="text-slate-400 font-medium">注册资本核验</div>
                      <div className="text-slate-100 font-semibold mt-0.5">
                        {currentItem.formData.registeredCapital}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                      <div className="text-slate-400 font-medium">营业执照信用代码</div>
                      <div className="text-slate-100 font-semibold font-mono text-[11px] mt-0.5">
                        {currentItem.formData.licenseCode}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <div className="text-slate-400 font-medium">现场特派员核查纪要</div>
                    <div className="text-slate-200 mt-1 leading-relaxed">
                      {currentItem.formData.anomalyNotes}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Decision Action Bar with Keyboard shortcut keys */}
              <div className="pt-4 border-t border-slate-800 mt-4">
                <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-between">
                  <span>支持全键盘流秒级盲审：</span>
                  <span className="text-[10px] text-violet-400 font-mono">按键 [1] [2] [3] 直达</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleDecision('approve')}
                    className="py-3 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/40 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group"
                  >
                    <div className="flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      <span>通过审核</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-800 text-emerald-100 group-hover:bg-emerald-700">
                      快捷键 [1]
                    </span>
                  </button>

                  <button
                    onClick={() => handleDecision('reject')}
                    className="py-3 px-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-900/40 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group"
                  >
                    <div className="flex items-center gap-1">
                      <X className="w-4 h-4" />
                      <span>驳回工单</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-800 text-rose-100 group-hover:bg-rose-700">
                      快捷键 [2]
                    </span>
                  </button>

                  <button
                    onClick={() => handleDecision('supplement')}
                    className="py-3 px-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-900/40 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group"
                  >
                    <div className="flex items-center gap-1">
                      <RotateCcw className="w-4 h-4" />
                      <span>退回补充</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-800 text-amber-100 group-hover:bg-amber-700">
                      快捷键 [3]
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: High-Res Image Inspection & Difference Comparison (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-xl border border-slate-800 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">现场高清原图与防伪水印核验</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                卫星防作弊时钟校验 PASS
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2.5))}
                className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700"
                title="放大影像"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
                className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700"
                title="缩小影像"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setZoomLevel(1)}
                className="px-2 py-1 text-slate-400 hover:text-white text-xs rounded bg-slate-800"
              >
                复位
              </button>
            </div>
          </div>

          {/* Image Display Canvas Container */}
          <div className="flex-1 relative bg-black/60 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-2 min-h-[420px]">
            {currentItem && (
              <div 
                className="relative transition-transform duration-150 max-w-full max-h-full flex items-center justify-center"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={currentItem.image}
                  alt="现场核验影像"
                  className="rounded-lg object-contain max-h-[500px] w-auto shadow-2xl border border-slate-700"
                />

                {/* Simulated OCR Detection bounding boxes */}
                <div className="absolute top-10 left-12 border-2 border-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded text-[11px] font-mono text-emerald-300 font-bold backdrop-blur-xs">
                  [OCR] 门头主体识别准确 (99.8%)
                </div>
                <div className="absolute bottom-12 right-12 border-2 border-blue-400 bg-blue-500/20 px-2 py-0.5 rounded text-[11px] font-mono text-blue-300 font-bold backdrop-blur-xs">
                  [GPS防作弊] 电子围栏核验一致
                </div>
              </div>
            )}
          </div>

          {/* Bottom comparison status strip */}
          <div className="mt-3 p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>AI规则引擎初筛建议：资质合格，无不良借贷及工商经营异常，建议直接通过。</span>
            </div>
            <div className="text-slate-400 font-mono text-[11px]">
              质检留痕已开启
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
