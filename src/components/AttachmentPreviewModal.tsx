import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle2,
  ShieldCheck,
  Printer,
  Search,
  ExternalLink,
  Layers,
  Info
} from 'lucide-react';
import { Attachment } from '../types';

interface AttachmentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: Attachment | null;
  attachments?: Attachment[];
  onSelectAttachment?: (att: Attachment) => void;
}

export const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({
  isOpen,
  onClose,
  attachment,
  attachments = [],
  onSelectAttachment
}) => {
  const [currentAtt, setCurrentAtt] = useState<Attachment | null>(attachment);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfPage, setPdfPage] = useState(1);
  const totalPdfPages = 3;
  const [searchQuery, setSearchQuery] = useState('');
  const [showMeta, setShowMeta] = useState(true);

  useEffect(() => {
    setCurrentAtt(attachment);
    setZoomLevel(100);
    setRotation(0);
    setPdfPage(1);
    setSearchQuery('');
  }, [attachment, isOpen]);

  // Keyboard navigation & ESC handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentAtt, attachments]);

  if (!isOpen || !currentAtt) return null;

  const currentIndex = attachments.findIndex((a) => a.id === currentAtt.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < attachments.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      const prev = attachments[currentIndex - 1];
      setCurrentAtt(prev);
      if (onSelectAttachment) onSelectAttachment(prev);
      setZoomLevel(100);
      setRotation(0);
      setPdfPage(1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const next = attachments[currentIndex + 1];
      setCurrentAtt(next);
      if (onSelectAttachment) onSelectAttachment(next);
      setZoomLevel(100);
      setRotation(0);
      setPdfPage(1);
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleRotateLeft = () => setRotation((prev) => (prev - 90) % 360);
  const handleRotateRight = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoomLevel(100);
    setRotation(0);
  };

  const handleDownload = () => {
    alert(`正在安全下载附件：${currentAtt.name} (${currentAtt.size})`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Determine detected media type
  const isPdf =
    currentAtt.type === 'pdf' ||
    currentAtt.name.toLowerCase().endsWith('.pdf');
  const isImage =
    currentAtt.type === 'image' ||
    ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].some((ext) =>
      currentAtt.name.toLowerCase().endsWith(ext)
    );
  const isSpreadsheet =
    ['.xlsx', '.xls', '.csv'].some((ext) =>
      currentAtt.name.toLowerCase().endsWith(ext)
    ) || currentAtt.name.includes('表') || currentAtt.name.includes('统计');

  return (
    <div
      id="attachment-preview-modal-root"
      className="fixed inset-0 z-[70] flex flex-col bg-black/85 backdrop-blur-xs animate-in fade-in duration-200 select-none"
    >
      {/* Top Header Bar */}
      <div className="h-14 px-4 sm:px-6 bg-gray-900/90 border-b border-gray-800 text-white flex items-center justify-between shrink-0 z-10">
        {/* Left: File Name & Type Badge */}
        <div className="flex items-center space-x-3 min-w-0 pr-4">
          <div className="p-2 rounded-lg bg-gray-800 text-[#3B82F6] shrink-0">
            {isImage ? (
              <ImageIcon className="w-5 h-5" />
            ) : isPdf ? (
              <FileText className="w-5 h-5 text-rose-400" />
            ) : isSpreadsheet ? (
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            ) : (
              <ExternalLink className="w-5 h-5 text-blue-400" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                {currentAtt.name}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase shrink-0">
                {isImage ? '图片预览' : isPdf ? 'PDF 文档' : isSpreadsheet ? '数据表格' : '附件'}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-gray-400 mt-0.5">
              <span>大小：{currentAtt.size}</span>
              <span className="hidden sm:inline text-gray-600">|</span>
              <span className="hidden sm:inline-flex items-center space-x-1 text-emerald-400 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>安全扫描通过</span>
              </span>
              {attachments.length > 1 && (
                <>
                  <span className="text-gray-600">|</span>
                  <span className="text-blue-400">
                    第 {currentIndex + 1} / {attachments.length} 个附件
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center: Interactive Toolbar */}
        <div className="hidden md:flex items-center space-x-1.5 bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-700/60 shadow-inner">
          {/* Zoom controls */}
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            title="缩小 (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-gray-200 px-1 min-w-[44px] text-center font-bold">
            {zoomLevel}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            title="放大 (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Reset Zoom */}
          <button
            type="button"
            onClick={handleReset}
            className="px-2 py-1 text-[11px] text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors cursor-pointer"
          >
            适中
          </button>

          <div className="w-px h-4 bg-gray-700 mx-1" />

          {/* Rotate controls (Images) */}
          {isImage && (
            <>
              <button
                type="button"
                onClick={handleRotateLeft}
                className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                title="向左旋转 90°"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRotateRight}
                className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                title="向右旋转 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-gray-700 mx-1" />
            </>
          )}

          {/* PDF Page Navigation */}
          {isPdf && (
            <>
              <button
                type="button"
                disabled={pdfPage <= 1}
                onClick={() => setPdfPage((p) => Math.max(1, p - 1))}
                className="p-1.5 text-gray-300 hover:text-white disabled:opacity-30 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                title="上一页"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-gray-300 px-1">
                {pdfPage} / {totalPdfPages}
              </span>
              <button
                type="button"
                disabled={pdfPage >= totalPdfPages}
                onClick={() => setPdfPage((p) => Math.min(totalPdfPages, p + 1))}
                className="p-1.5 text-gray-300 hover:text-white disabled:opacity-30 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                title="下一页"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-gray-700 mx-1" />
            </>
          )}

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            title="打印"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Actions (Download & Close) */}
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handleDownload}
            className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-600 text-white rounded-lg font-semibold text-xs flex items-center space-x-1.5 shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">下载原文件</span>
            <span className="sm:hidden">下载</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
            title="关闭 (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Canvas / Viewer Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
        {/* Left Arrow Navigation Button */}
        {hasPrev && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 cursor-pointer shadow-xl"
            title="上一个附件 (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Right Arrow Navigation Button */}
        {hasNext && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 cursor-pointer shadow-xl"
            title="下一个附件 (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Content Viewer based on attachment type */}
        <div className="w-full h-full flex items-center justify-center overflow-auto">
          {isImage ? (
            /* Image Viewer */
            <div
              className="transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full"
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`
              }}
            >
              <img
                src={
                  currentAtt.thumbnailUrl ||
                  currentAtt.url ||
                  'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&auto=format&fit=crop'
                }
                alt={currentAtt.name}
                className="max-h-[82vh] max-w-[85vw] object-contain rounded-lg shadow-2xl border border-white/10 ring-1 ring-black/40"
              />
            </div>
          ) : isPdf ? (
            /* PDF Document Reader Simulation (High-res Government Public Opinion Report) */
            <div
              className="bg-white text-gray-900 rounded-xl shadow-2xl overflow-y-auto max-h-[82vh] w-full max-w-3xl p-8 sm:p-12 border border-gray-300 transition-all duration-150"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              {/* Document Header with Red Border & Emblem */}
              <div className="border-b-2 border-red-600 pb-4 mb-6 text-center">
                <div className="text-red-600 font-serif font-black text-xl sm:text-2xl tracking-widest mb-1">
                  中共台中市委宣传部 · 市网信办
                </div>
                <div className="text-red-700 font-bold text-xs tracking-wider uppercase">
                  舆情核查处置与网络研判专报（内部明电）
                </div>
                <div className="flex justify-between items-center text-[11px] text-gray-500 mt-4 font-mono">
                  <span>发文字号：〔2026〕网信舆字第0824号</span>
                  <span>密级：内部工作材料</span>
                </div>
              </div>

              {/* Document Body depending on Page */}
              {pdfPage === 1 && (
                <div className="space-y-4 text-xs leading-relaxed text-gray-800">
                  <h3 className="text-base font-bold text-gray-900 text-center mb-4">
                    {currentAtt.name.replace('.pdf', '')}
                  </h3>

                  <div className="bg-amber-50/70 border-l-4 border-amber-500 p-3 rounded-r text-gray-700 text-xs">
                    <strong>【核查结论与处置概览】</strong>
                    <p className="mt-1">
                      经市委宣传部舆情科会同市水务局、城市运行管理中心现场调阅管网监测数据与监控核实，本次上报反映情况基本属实。涉及辖区内供水主干管破损导致水压异常，已启动应急响应机制。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1.5">一、基本情况与网络发酵路径</h4>
                    <p className="indent-6 leading-relaxed">
                      8月12日上午，本地社交平台陆续出现居民求助与反映停水帖文，集中在西屯区及明月居、阳光花园等高层小区。经大数据热度监测，上午9:30起话题讨论量出现脉冲式上升，10:00达到峰值，累计转发讨论量1.2万次。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1.5">二、涉事单位现场排查与抢修进展</h4>
                    <p className="indent-6 leading-relaxed">
                      供水抢修队于8:45抵达现场开展开挖探伤作业，发现DN600铸铁主干管因地基沉降发生微裂缝。现场已于11:30完成阀门关断与旁路切换供水，并调派8台应急送水车进驻重点社区提供饮用水保障。
                    </p>
                  </div>
                </div>
              )}

              {pdfPage === 2 && (
                <div className="space-y-4 text-xs leading-relaxed text-gray-800">
                  <h3 className="text-base font-bold text-gray-900 text-center mb-4">
                    第二部分：网民情绪画像与典型言论摘录
                  </h3>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                        <tr>
                          <th className="p-2.5">监测渠道</th>
                          <th className="p-2.5">发帖量</th>
                          <th className="p-2.5">网民核心诉求 / 情绪倾向</th>
                          <th className="p-2.5">风险等级</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-600">
                        <tr>
                          <td className="p-2.5 font-semibold text-gray-800">微博本地同城</td>
                          <td className="p-2.5">1,420 条</td>
                          <td className="p-2.5">询问具体恢复供水时间，要求保障早晚生活用水</td>
                          <td className="p-2.5 text-amber-600 font-bold">中等风险</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-semibold text-gray-800">政务便民留言</td>
                          <td className="p-2.5">380 条</td>
                          <td className="p-2.5">建议提前发布停水停气预警，完善短讯通告机制</td>
                          <td className="p-2.5 text-blue-600 font-bold">低风险</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-semibold text-gray-800">短视频平台</td>
                          <td className="p-2.5">650 条</td>
                          <td className="p-2.5">现场应急送水排队短视频，整体氛围理性互助</td>
                          <td className="p-2.5 text-emerald-600 font-bold">可控稳定</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1.5">三、关联衍生风险研判</h4>
                    <p className="indent-6 leading-relaxed">
                      目前暂未发现境外账号或恶意推手介入炒作。主要风险点在于若夜间供水未能如期恢复，可能引发次生负面舆论。
                    </p>
                  </div>
                </div>
              )}

              {pdfPage === 3 && (
                <div className="space-y-4 text-xs leading-relaxed text-gray-800">
                  <h3 className="text-base font-bold text-gray-900 text-center mb-4">
                    第三部分：建议处置举措与长效工作机制
                  </h3>

                  <div className="space-y-2">
                    <p className="font-bold text-gray-900">1. 加强信息透明度与滚动发布：</p>
                    <p className="text-gray-700 pl-4">
                      官方政务微博及各小区微信网格群每隔2小时滚动播报抢修进度与预计复水时间节点，消除网民恐慌心理。
                    </p>
                    <p className="font-bold text-gray-900 mt-3">2. 健全应急物资与生活保障联动：</p>
                    <p className="text-gray-700 pl-4">
                      由街道应急办牵头，组织社区志愿者为独居老人、行动不便家庭提供“送水上门”关爱服务。
                    </p>
                  </div>

                  {/* Stamp & Signature Footer */}
                  <div className="mt-12 pt-6 border-t border-gray-200 flex justify-end">
                    <div className="text-right space-y-1 relative pr-6">
                      <p className="font-bold text-gray-800">报告单位：台中市网信办舆情分析室</p>
                      <p className="text-gray-500">主审人：王主任 / 复核：李明</p>
                      <p className="text-gray-400 font-mono">日期：2026年8月13日</p>
                      {/* Red Stamp Seal Mockup */}
                      <div className="absolute right-0 top-[-10px] w-20 h-20 rounded-full border-2 border-red-500/80 text-red-500/80 flex flex-col items-center justify-center text-[10px] font-bold rotate-[-15deg] pointer-events-none uppercase tracking-tighter">
                        <span>台中网信</span>
                        <span>★ 专用章 ★</span>
                        <span>2026.08.13</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom PDF Page Indicator */}
              <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                <span>《{currentAtt.name}》</span>
                <span className="font-mono">
                  第 {pdfPage} 页 / 共 {totalPdfPages} 页
                </span>
              </div>
            </div>
          ) : isSpreadsheet ? (
            /* Spreadsheet / Table Previewer */
            <div
              className="bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden max-h-[82vh] w-full max-w-4xl border border-gray-300 flex flex-col"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              {/* Spreadsheet Toolbar */}
              <div className="bg-emerald-700 text-white p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  <span className="font-bold text-xs">{currentAtt.name}</span>
                </div>
                <span className="text-[11px] bg-emerald-800 px-2.5 py-0.5 rounded font-mono">
                  工作表1 · 128 行数据
                </span>
              </div>

              {/* Table Body */}
              <div className="overflow-auto max-h-[60vh] p-4">
                <table className="w-full text-left text-xs border-collapse border border-gray-200">
                  <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0">
                    <tr>
                      <th className="border border-gray-300 p-2 text-center w-12 bg-gray-200">#</th>
                      <th className="border border-gray-300 p-2">反馈编号</th>
                      <th className="border border-gray-300 p-2">反映渠道</th>
                      <th className="border border-gray-300 p-2">发生区域</th>
                      <th className="border border-gray-300 p-2">核心诉求要点</th>
                      <th className="border border-gray-300 p-2">当前处置状态</th>
                      <th className="border border-gray-300 p-2">核实时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {[
                      {
                        code: 'FK-20260812-001',
                        src: '智慧停车 App',
                        loc: '西屯区万达广场地下车库',
                        issue: '寻车指引导航漂移，建议增加地砖蓝牙定位',
                        stat: '已转办研发',
                        time: '2026-08-12 14:20'
                      },
                      {
                        code: 'FK-20260812-002',
                        src: '热线12345',
                        loc: '北屯区政务中心地面停车场',
                        issue: '老年卡优惠自动扣款失败，需人工干预',
                        stat: '已修复上线',
                        time: '2026-08-12 15:10'
                      },
                      {
                        code: 'FK-20260812-003',
                        src: '政务留言板',
                        loc: '南坝区高铁站P2停车场',
                        issue: '出场高峰期抬杆识别缓慢，易造成拥堵',
                        stat: '算法调优中',
                        time: '2026-08-12 16:05'
                      },
                      {
                        code: 'FK-20260812-004',
                        src: '网格微信群',
                        loc: '全市各公共车位',
                        issue: '建议增加无感支付开票一键发送微信卡包功能',
                        stat: '已列入规划',
                        time: '2026-08-12 17:00'
                      },
                      {
                        code: 'FK-20260812-005',
                        src: '现场巡查',
                        loc: '东屯区体育中心停车场',
                        issue: '新能源充电桩车位被燃油车占用投诉',
                        stat: '加装地锁监控',
                        time: '2026-08-12 17:45'
                      }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50">
                        <td className="border border-gray-300 p-2 text-center text-gray-400 font-mono bg-gray-50">
                          {idx + 1}
                        </td>
                        <td className="border border-gray-300 p-2 font-mono text-[#1E5ABB] font-semibold">
                          {row.code}
                        </td>
                        <td className="border border-gray-300 p-2">{row.src}</td>
                        <td className="border border-gray-300 p-2">{row.loc}</td>
                        <td className="border border-gray-300 p-2 text-gray-800 font-medium">
                          {row.issue}
                        </td>
                        <td className="border border-gray-300 p-2 text-emerald-600 font-semibold">
                          {row.stat}
                        </td>
                        <td className="border border-gray-300 p-2 text-gray-500 font-mono">
                          {row.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* General File Preview */
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl border border-gray-200">
              <div className="w-16 h-16 bg-blue-50 text-[#1E5ABB] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">{currentAtt.name}</h3>
                <p className="text-xs text-gray-500 mt-1">文件大小：{currentAtt.size}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 text-left space-y-1 font-mono">
                <p>文件格式：通用数据文件</p>
                <p>安全校验：MD5 / SHA-256 校验正常</p>
                <p>状态：已完成云端备份</p>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="w-full py-2.5 bg-[#1E5ABB] hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>立即下载该文件</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Thumbnail Strip (if multiple attachments exist) */}
      {attachments.length > 1 && (
        <div className="h-20 bg-gray-950/90 border-t border-gray-800/80 px-4 flex items-center justify-center space-x-3 shrink-0 overflow-x-auto z-10">
          <span className="text-[11px] text-gray-400 font-medium shrink-0 mr-2 flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5" />
            <span>所有附件清单：</span>
          </span>
          {attachments.map((att, idx) => {
            const isSelected = att.id === currentAtt.id;
            return (
              <button
                key={att.id || idx}
                type="button"
                onClick={() => {
                  setCurrentAtt(att);
                  if (onSelectAttachment) onSelectAttachment(att);
                  setZoomLevel(100);
                  setRotation(0);
                  setPdfPage(1);
                }}
                className={`h-14 px-3 rounded-lg border flex items-center space-x-2 transition-all cursor-pointer shrink-0 max-w-[200px] text-left ${
                  isSelected
                    ? 'bg-blue-600/30 border-[#3B82F6] ring-2 ring-blue-500/50 text-white'
                    : 'bg-gray-900 border-gray-700/80 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                <div className="w-8 h-8 rounded bg-gray-800 shrink-0 overflow-hidden flex items-center justify-center">
                  {att.type === 'image' && att.thumbnailUrl ? (
                    <img src={att.thumbnailUrl} alt={att.name} className="w-full h-full object-cover" />
                  ) : att.type === 'pdf' ? (
                    <FileText className="w-4 h-4 text-rose-400" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{att.name}</p>
                  <p className="text-[10px] text-gray-400">{att.size}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
