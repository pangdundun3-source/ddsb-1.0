import React, { useState } from 'react';
import { 
  Server, 
  Activity, 
  Key, 
  ShieldCheck, 
  Users, 
  Cpu, 
  Database, 
  HardDrive, 
  Lock, 
  RefreshCw, 
  Plus, 
  Copy, 
  Check, 
  ExternalLink,
  SlidersHorizontal,
  FileCode,
  Terminal,
  AlertTriangle
} from 'lucide-react';

export const MTAppManagement: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'topology' | 'api_keys' | 'rbac' | 'audit_logs'>('topology');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const services = [
    { name: 'Gateway 统一API网关集群', status: 'healthy', load: '18.4%', qps: '14,200', latency: '4ms', instances: '8/8 Pods' },
    { name: 'OCR 智能图文特征推理引擎', status: 'healthy', load: '42.1%', qps: '3,800', latency: '28ms', instances: '12/12 Pods (GPU)' },
    { name: 'Kafka 异步速报消息分发总线', status: 'healthy', load: '12.0%', qps: '48,000', latency: '2ms', instances: '6/6 Brokers' },
    { name: 'SpeedReport 业务核心微服务', status: 'healthy', load: '26.8%', qps: '9,400', latency: '8ms', instances: '16/16 Pods' },
    { name: 'PostgreSQL & Redis 极速缓存集群', status: 'healthy', load: '31.5%', qps: '62,000', latency: '1ms', instances: 'Master-Slave Active' },
  ];

  const apiKeys = [
    { id: 'key-1', appName: 'V8-CRM 客户管理端对接密钥', key: 'sk_live_v8crm_994827103948', env: '生产环境 (PRD)', qpsLimit: '10,000 / min', status: '正常运行' },
    { id: 'key-2', appName: 'V8-H5 移动现场端鉴权凭据', key: 'sk_live_v8h5_772910482910', env: '生产环境 (PRD)', qpsLimit: '25,000 / min', status: '正常运行' },
    { id: 'key-3', appName: 'V8-PC 集中风控端专用专线Key', key: 'sk_live_v8pc_448291047192', env: '生产环境 (PRD)', qpsLimit: '50,000 / min', status: '正常运行' },
    { id: 'key-4', appName: '开放银行与外部渠道商接入Gateway', key: 'sk_live_ext_118294719284', env: '预发环境 (STG)', qpsLimit: '5,000 / min', status: '正常运行' },
  ];

  const auditLogs = [
    { time: '10:34:20', operator: '陈晓峰 (现场专员)', terminal: 'V8-审核上报H5', action: '提交速报工单 SB-20260825-9921', ip: '116.228.89.12 (普陀专网)' },
    { time: '10:32:10', operator: '王建国 (风控审核)', terminal: 'V8-审核上报PC', action: '执行快捷键 [1] 批量通过 4 笔工单', ip: '10.24.18.99 (集中风控专线)' },
    { time: '10:25:44', operator: '张云鹏 (SuperAdmin)', terminal: 'MT-应用管理端', action: '动态扩容 OCR 推理服务 Pod 节点至 12 台', ip: '10.24.0.1 (运维堡垒机)' },
    { time: '10:14:02', operator: '李雅婷 (客户经理)', terminal: 'V8-客户管理端', action: '调拨中通供应链今日限额至 500 万元', ip: '180.168.1.45 (华东区办)' },
  ];

  const handleCopy = (keyText: string, id: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-md shadow-amber-500/20">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  MT-应用管理端
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  Master Ops v4.1.0
                </span>
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  微服务集群可用率 99.999%
                </span>
              </div>
              <p className="text-xs text-slate-400">
                速报四端底层中枢 · 微服务拓扑、API网关安全鉴权、统一RBAC权限树
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('已触发全集群健康巡检，所有 Pods 状态正常！')}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>全集群快速体检</span>
            </button>
            <button
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              返回门户主页
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-4 pt-2 border-t border-slate-800">
          {[
            { id: 'topology', label: '微服务与拓扑监控', icon: Activity, badge: '5组服务' },
            { id: 'api_keys', label: '四端API密钥管理', icon: Key, badge: '4个活跃' },
            { id: 'rbac', label: '四端统一RBAC权限', icon: Users },
            { id: 'audit_logs', label: '安全审计流水', icon: ShieldCheck, badge: '实时流' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-amber-950/60 text-amber-300 font-semibold border border-amber-700'
                    : 'text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-800 text-slate-300">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex-1 w-full space-y-6">
        {/* Topology and Services Tab */}
        {activeTab === 'topology' && (
          <div className="space-y-6">
            {/* Top summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400">总计在线微服务实例</div>
                <div className="text-xl font-bold text-white font-mono mt-1">42 Pods</div>
                <div className="text-[11px] text-emerald-400 mt-1">自动水平扩缩容已就绪 (HPA)</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400">当前全局并发吞吐 QPS</div>
                <div className="text-xl font-bold text-amber-400 font-mono mt-1">89,400 req/s</div>
                <div className="text-[11px] text-slate-400 mt-1">网关熔断阈值: 200,000 QPS</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400">核心数据库写入时延</div>
                <div className="text-xl font-bold text-emerald-400 font-mono mt-1">0.8 ms</div>
                <div className="text-[11px] text-emerald-400 mt-1">只读从库负载正常</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400">四端互联安全拦截 (今日)</div>
                <div className="text-xl font-bold text-blue-400 font-mono mt-1">128 次</div>
                <div className="text-[11px] text-slate-400 mt-1">WAF防作弊与防刷规则有效</div>
              </div>
            </div>

            {/* Service Instances Table */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-500" />
                  <span>速报四端微服务集群状态监视面板</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">采集周期：3秒/次</span>
              </div>

              <div className="space-y-2.5">
                {services.map((svc, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <div>
                        <div className="font-bold text-white">{svc.name}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5 font-mono">部署实例: {svc.instances}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 font-mono text-slate-300">
                      <div>
                        <span className="text-slate-500 text-[10px] block">CPU/内存负载</span>
                        <span className="font-semibold text-emerald-400">{svc.load}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">实时吞吐</span>
                        <span className="font-semibold">{svc.qps}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">P99响应时延</span>
                        <span className="font-semibold text-blue-400">{svc.latency}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'api_keys' && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">四端通信与外部接入 API 密钥</h3>
                <p className="text-xs text-slate-400">管理各端鉴权令牌与网关调用限额</p>
              </div>
              <button
                onClick={() => alert('已生成新的客户端安全对接凭据！')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>生成新 AppKey</span>
              </button>
            </div>

            <div className="space-y-3">
              {apiKeys.map((k) => (
                <div key={k.id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{k.appName}</span>
                      <span className="px-2 py-0.2 rounded text-[10px] bg-slate-700 text-slate-300 font-mono">
                        {k.env}
                      </span>
                    </div>
                    <div className="font-mono text-slate-400 text-xs mt-1.5 flex items-center gap-2 bg-slate-900/80 px-2 py-1 rounded w-fit">
                      <Key className="w-3 h-3 text-amber-500" />
                      <span>{k.key}</span>
                      <button
                        onClick={() => handleCopy(k.key, k.id)}
                        className="text-slate-400 hover:text-white p-0.5"
                        title="复制密钥"
                      >
                        {copiedKey === k.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <div>限流配额: <span className="text-white font-bold">{k.qpsLimit}</span></div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold">
                      {k.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RBAC Matrix Tab */}
        {activeTab === 'rbac' && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
            <h3 className="font-bold text-white text-sm">速报四端统一 RBAC 角色权限控制矩阵</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="p-3">角色分组</th>
                    <th className="p-3">V8-客户管理端</th>
                    <th className="p-3">V8-审核上报H5</th>
                    <th className="p-3">V8-审核上报PC</th>
                    <th className="p-3">MT-应用管理端</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="p-3 font-semibold text-white">超级管理员 (SuperAdmin)</td>
                    <td className="p-3 text-emerald-400">✅ 完全读写与审批</td>
                    <td className="p-3 text-emerald-400">✅ 免密扫码测试</td>
                    <td className="p-3 text-emerald-400">✅ 高通量终审裁决</td>
                    <td className="p-3 text-emerald-400">✅ 核心运维最高权</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">专职风控审核员</td>
                    <td className="p-3 text-slate-500">🚫 无权限</td>
                    <td className="p-3 text-emerald-400">✅ 移动端抽检查看</td>
                    <td className="p-3 text-emerald-400">✅ 专注秒审工作台</td>
                    <td className="p-3 text-slate-500">🚫 无权限</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">客户经理 / 商务专员</td>
                    <td className="p-3 text-emerald-400">✅ 客户建档与配额调拨</td>
                    <td className="p-3 text-slate-500">🚫 无权限</td>
                    <td className="p-3 text-slate-500">🚫 无权限</td>
                    <td className="p-3 text-slate-500">🚫 无权限</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">现场核验专员 (特派员)</td>
                    <td className="p-3 text-slate-500">🚫 无权限</td>
                    <td className="p-3 text-emerald-400">✅ 拍照水印现场速报</td>
                    <td className="p-3 text-slate-500">🚫 无权限</td>
                    <td className="p-3 text-slate-500">🚫 无权限</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit_logs' && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
            <h3 className="font-bold text-white text-sm">四端统一敏感操作安全审计轨迹 (不可篡改)</h3>
            <div className="space-y-2">
              {auditLogs.map((log, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{log.time}</span>
                    <span className="font-semibold text-white">{log.operator}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 text-[11px] font-sans">
                      {log.terminal}
                    </span>
                    <span className="text-emerald-400 font-sans">{log.action}</span>
                  </div>
                  <span className="text-slate-500 text-[11px]">{log.ip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
