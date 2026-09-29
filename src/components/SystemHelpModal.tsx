import React from 'react';
import { X, Network, ArrowRight, ShieldCheck, Zap, Monitor, Smartphone, LayoutGrid, Server } from 'lucide-react';

interface SystemHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemHelpModal: React.FC<SystemHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                速报业务系统 · 四端协同业务全景与定位指南
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                深入了解四大终端在业务流转中的职责划分与数据互通
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600 dark:text-slate-300">
          {/* Architecture Flow Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-blue-100 dark:border-slate-700">
            <div className="font-bold text-slate-900 dark:text-white text-sm mb-3">
              ⚡ 四端闭环业务数据流
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-600">
                  <Monitor className="w-4 h-4" />
                  <span>1. 客户建档与配额</span>
                </div>
                <div className="text-[11px] text-slate-500">【V8-客户管理端】客户准入、分配日速报限额</div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                  <Smartphone className="w-4 h-4" />
                  <span>2. 移动现场速报</span>
                </div>
                <div className="text-[11px] text-slate-500">【V8-审核上报H5】现场水印拍照、GPS打卡提报</div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-violet-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-violet-600">
                  <LayoutGrid className="w-4 h-4" />
                  <span>3. 集中风控秒审</span>
                </div>
                <div className="text-[11px] text-slate-500">【V8-审核上报PC】双联大图比对、按键秒级裁决</div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-600">
                  <Server className="w-4 h-4" />
                  <span>4. 底层中枢保障</span>
                </div>
                <div className="text-[11px] text-slate-500">【MT-应用管理端】API密钥生命周期、RBAC与监控</div>
              </div>
            </div>
          </div>

          {/* Terminal Detail Breakdown */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              各端核心技术特征与场景匹配
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="font-bold text-blue-600 dark:text-blue-400 text-xs flex items-center gap-1.5">
                  <Monitor className="w-4 h-4" />
                  <span>V8-客户管理端 (CRM Portal)</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  聚焦于客户关系、准入资质审查与速报配额池管理。客户经理可实时掌握客户履约健康分，动态申请调增额度。
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span>V8-审核上报H5 (Field Mobile H5)</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  专为一线巡检与移动现场作业打造，支持企业微信/微信扫码免密直达，具备卫星防伪时间戳水印与断网离线暂存。
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="font-bold text-violet-600 dark:text-violet-400 text-xs flex items-center gap-1.5">
                  <LayoutGrid className="w-4 h-4" />
                  <span>V8-审核上报PC (High-Throughput Audit PC)</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  专职审核员高频作业平台，宽屏双联分屏显示原图与OCR提取结果，支持纯键盘盲打操作（1通过/2驳回/3退补）。
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="font-bold text-amber-600 dark:text-amber-400 text-xs flex items-center gap-1.5">
                  <Server className="w-4 h-4" />
                  <span>MT-应用管理端 (Master Ops Console)</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  速报系统的底层技术中枢，负责管理微服务拓扑编排、API密钥、统一RBAC权限树配置及全量操作审计日志。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs hover:opacity-90"
          >
            我已了解架构
          </button>
        </div>
      </div>
    </div>
  );
};
