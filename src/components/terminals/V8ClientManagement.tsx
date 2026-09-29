import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  ArrowUpDown, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Download, 
  PieChart, 
  TrendingUp, 
  FileText, 
  MoreHorizontal,
  ChevronRight,
  ShieldAlert,
  Send,
  Zap,
  Users,
  CreditCard
} from 'lucide-react';

interface ClientRecord {
  id: string;
  name: string;
  legalPerson: string;
  level: 'VIP-钻石' | 'VIP-白金' | '标准客户';
  quotaDaily: string;
  quotaUsed: string;
  status: 'active' | 'warning' | 'audit_pending';
  lastReportTime: string;
  riskScore: number;
  channel: string;
}

export const V8ClientManagement: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'clients' | 'quota' | 'statements' | 'warning'>('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);

  const [clients, setClients] = useState<ClientRecord[]>([
    {
      id: 'CL-90412',
      name: '中通智能供应链科技 (上海) 有限公司',
      legalPerson: '陈大伟',
      level: 'VIP-钻石',
      quotaDaily: '5,000,000 元',
      quotaUsed: '3,842,000 元 (76.8%)',
      status: 'active',
      lastReportTime: '2026-08-25 10:24',
      riskScore: 98,
      channel: '华东自营大区',
    },
    {
      id: 'CL-90415',
      name: '速迈物联智运 (杭州) 科技有限公司',
      legalPerson: '陆小明',
      level: 'VIP-白金',
      quotaDaily: '2,000,000 元',
      quotaUsed: '1,920,000 元 (96.0%)',
      status: 'warning',
      lastReportTime: '2026-08-25 10:15',
      riskScore: 82,
      channel: '浙江一级渠道',
    },
    {
      id: 'CL-90420',
      name: '国恒联运能源物流股份有限公司',
      legalPerson: '王建宏',
      level: 'VIP-钻石',
      quotaDaily: '10,000,000 元',
      quotaUsed: '4,210,000 元 (42.1%)',
      status: 'active',
      lastReportTime: '2026-08-25 09:58',
      riskScore: 96,
      channel: '直属大客户部',
    },
    {
      id: 'CL-90428',
      name: '万通融汇通达电子商贸有限公司',
      legalPerson: '赵雪梅',
      level: '标准客户',
      quotaDaily: '500,000 元',
      quotaUsed: '480,000 元 (96.0%)',
      status: 'audit_pending',
      lastReportTime: '2026-08-24 18:30',
      riskScore: 74,
      channel: '华南二级渠道',
    },
    {
      id: 'CL-90433',
      name: '德邦兴业保理供应链管理中心',
      legalPerson: '黄德邦',
      level: 'VIP-白金',
      quotaDaily: '3,000,000 元',
      quotaUsed: '1,120,000 元 (37.3%)',
      status: 'active',
      lastReportTime: '2026-08-25 08:40',
      riskScore: 92,
      channel: '华北自营大区',
    },
  ]);

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.includes(searchTerm) || c.id.includes(searchTerm) || c.legalPerson.includes(searchTerm);
    const matchesLevel = filterLevel === 'all' || c.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Terminal Sub-header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  V8-客户管理端
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                  CRM Core v8.4.2
                </span>
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  CRM服务在线
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                企业全生命周期建档、速报配额池动态调配、商户风险监控
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>新建客户建档</span>
            </button>
            <button
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              返回门户主页
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          {[
            { id: 'clients', label: '客户全景档案', icon: Users, badge: '58 家' },
            { id: 'quota', label: '速报配额划拨池', icon: PieChart, badge: '¥ 6,800万' },
            { id: 'statements', label: '商户对账中心', icon: CreditCard },
            { id: 'warning', label: '风险客户预警', icon: ShieldAlert, badge: '6条预警', badgeColor: 'bg-amber-100 text-amber-700' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${tab.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
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
        {/* Metric KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="text-xs text-slate-500 dark:text-slate-400">今日速报承载总量</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">¥ 24,890,000</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 较昨日同期增长 14.2%
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="text-xs text-slate-500 dark:text-slate-400">在册客户主体数</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">1,280 家</div>
            <div className="text-[11px] text-blue-600 font-medium mt-1">
              VIP占比 34.6% · 优质合规
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="text-xs text-slate-500 dark:text-slate-400">待审批配额突发申请</div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">4 笔</div>
            <div className="text-[11px] text-slate-400 mt-1">
              平均审批时效 2.8 分钟
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="text-xs text-slate-500 dark:text-slate-400">客户履约健康度平均分</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">94.8 分</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              风控模型评定：极低违规率
            </div>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索企业全称、客户ID、法人代表..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              <option value="all">全部分级</option>
              <option value="VIP-钻石">VIP-钻石</option>
              <option value="VIP-白金">VIP-白金</option>
              <option value="标准客户">标准客户</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>导出客户花名册</span>
            </button>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
                <tr>
                  <th className="px-4 py-3">客户编码 / 企业主体全称</th>
                  <th className="px-4 py-3">客户级别</th>
                  <th className="px-4 py-3">所属大区 / 渠道</th>
                  <th className="px-4 py-3">今日速报限额 / 已用占比</th>
                  <th className="px-4 py-3">风控健康分</th>
                  <th className="px-4 py-3">运行状态</th>
                  <th className="px-4 py-3">最近速报时间</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredClients.map((client) => (
                  <tr 
                    key={client.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {client.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{client.id}</span>
                        <span>·</span>
                        <span>法人: {client.legalPerson}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        client.level === 'VIP-钻石'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300'
                          : client.level === 'VIP-白金'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {client.level}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {client.channel}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {client.quotaDaily}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {client.quotaUsed}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`font-bold font-mono ${
                        client.riskScore >= 90 ? 'text-emerald-600' : client.riskScore >= 80 ? 'text-blue-600' : 'text-amber-600'
                      }`}>
                        {client.riskScore} 分
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {client.status === 'active' && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> 正常速报中
                        </span>
                      )}
                      {client.status === 'warning' && (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" /> 限额预警(95%+)
                        </span>
                      )}
                      {client.status === 'audit_pending' && (
                        <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                          <Clock className="w-3.5 h-3.5" /> 待资质年审
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {client.lastReportTime}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-[11px] font-medium"
                        >
                          配额调拨
                        </button>
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              新建客户入驻与速报建档
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">企业主体全称 (三证合一)</label>
                <input
                  type="text"
                  placeholder="例如: 浙江德邦智能仓储科技有限公司"
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">统一社会信用代码</label>
                  <input
                    type="text"
                    placeholder="91310000XXXXXXXXXX"
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">法定代表人</label>
                  <input
                    type="text"
                    placeholder="法人姓名"
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">初始日速报额度 (元)</label>
                  <input
                    type="text"
                    defaultValue="1,000,000"
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">所属销售/渠道大区</label>
                  <select className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <option>华东自营大区</option>
                    <option>华北自营大区</option>
                    <option>华南二级渠道</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                取消
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
              >
                确认提交并触发风控预审
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
