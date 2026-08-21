import React, { useState, useMemo } from 'react';
import {
  Users,
  FileText,
  CheckCircle2,
  Percent,
  Search,
  RotateCcw,
  Calendar,
  ShieldAlert,
  Clock,
  Activity,
  Building2,
  TrendingUp,
  Download,
  Filter,
  BarChart2,
  PieChart as PieChartIcon,
  Printer,
  ChevronRight,
  Layers,
  ArrowUpRight,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export type TimeDimension = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export const Statistics: React.FC = () => {
  const [timeDim, setTimeDim] = useState<TimeDimension>('week');
  const [startDate, setStartDate] = useState('2026-08-04');
  const [endDate, setEndDate] = useState('2026-08-11');
  const [selectedOrg, setSelectedOrg] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [pieTab, setPieTab] = useState<'category' | 'org' | 'channel'>('category');
  const [tableTab, setTableTab] = useState<'org' | 'category' | 'person' | 'negative'>('org');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle preset date switches
  const handleTimeDimChange = (dim: TimeDimension) => {
    setTimeDim(dim);
    if (dim === 'day') {
      setStartDate('2026-08-11');
      setEndDate('2026-08-11');
    } else if (dim === 'week') {
      setStartDate('2026-08-04');
      setEndDate('2026-08-11');
    } else if (dim === 'month') {
      setStartDate('2026-08-01');
      setEndDate('2026-08-31');
    } else if (dim === 'quarter') {
      setStartDate('2026-07-01');
      setEndDate('2026-09-30');
    } else if (dim === 'year') {
      setStartDate('2026-01-01');
      setEndDate('2026-12-31');
    }
  };

  const handleReset = () => {
    setTimeDim('week');
    setStartDate('2026-08-04');
    setEndDate('2026-08-11');
    setSelectedOrg('all');
    setSelectedCategory('all');
    setSearchQuery('');
  };

  // Mock data for different time dimensions
  const timeDimConfig = useMemo(() => {
    switch (timeDim) {
      case 'day':
        return {
          label: '今天 (2026-08-11)',
          total: 18,
          passed: 16,
          passRate: '88.9%',
          users: 42,
          orgs: 18,
          negatives: 3,
          avgTime: '12.4分钟',
          trend: [
            { label: '02:00', val: 1, passed: 1, negative: 0 },
            { label: '06:00', val: 2, passed: 2, negative: 0 },
            { label: '10:00', val: 7, passed: 6, negative: 1 },
            { label: '14:00', val: 5, passed: 4, negative: 1 },
            { label: '18:00', val: 2, passed: 2, negative: 1 },
            { label: '22:00', val: 1, passed: 1, negative: 0 }
          ],
          donut: [
            { name: '审核通过', value: 16, color: '#10B981' },
            { name: '待审核', value: 1, color: '#F59E0B' },
            { name: '审核驳回', value: 1, color: '#EF4444' }
          ]
        };
      case 'week':
        return {
          label: '本周 (08-04 至 08-11)',
          total: 142,
          passed: 128,
          passRate: '90.1%',
          users: 112,
          orgs: 26,
          negatives: 15,
          avgTime: '14.2分钟',
          trend: [
            { label: '周一', val: 18, passed: 16, negative: 2 },
            { label: '周二', val: 22, passed: 20, negative: 3 },
            { label: '周三', val: 25, passed: 23, negative: 2 },
            { label: '周四', val: 19, passed: 17, negative: 2 },
            { label: '周五', val: 28, passed: 25, negative: 4 },
            { label: '周六', val: 12, passed: 11, negative: 1 },
            { label: '周日', val: 18, passed: 16, negative: 1 }
          ],
          donut: [
            { name: '审核通过', value: 128, color: '#10B981' },
            { name: '待审核', value: 10, color: '#F59E0B' },
            { name: '审核驳回', value: 4, color: '#EF4444' }
          ]
        };
      case 'month':
        return {
          label: '本月 (2026年8月)',
          total: 580,
          passed: 522,
          passRate: '90.0%',
          users: 168,
          orgs: 28,
          negatives: 48,
          avgTime: '15.1分钟',
          trend: [
            { label: '第一周', val: 130, passed: 118, negative: 12 },
            { label: '第二周', val: 142, passed: 128, negative: 15 },
            { label: '第三周', val: 155, passed: 140, negative: 11 },
            { label: '第四周', val: 153, passed: 136, negative: 10 }
          ],
          donut: [
            { name: '审核通过', value: 522, color: '#10B981' },
            { name: '待审核', value: 38, color: '#F59E0B' },
            { name: '审核驳回', value: 20, color: '#EF4444' }
          ]
        };
      case 'quarter':
        return {
          label: '本季度 (2026年 Q3)',
          total: 1860,
          passed: 1680,
          passRate: '90.3%',
          users: 180,
          orgs: 28,
          negatives: 132,
          avgTime: '15.5分钟',
          trend: [
            { label: '7月', val: 620, passed: 560, negative: 45 },
            { label: '8月', val: 660, passed: 598, negative: 48 },
            { label: '9月(预测)', val: 580, passed: 522, negative: 39 }
          ],
          donut: [
            { name: '审核通过', value: 1680, color: '#10B981' },
            { name: '待审核', value: 110, color: '#F59E0B' },
            { name: '审核驳回', value: 70, color: '#EF4444' }
          ]
        };
      case 'year':
      case 'custom':
      default:
        return {
          label: '本年度/自定义',
          total: 8432,
          passed: 7460,
          passRate: '88.5%',
          users: 186,
          orgs: 28,
          negatives: 240,
          avgTime: '15.8分钟',
          trend: [
            { label: '1月', val: 600, passed: 530, negative: 30 },
            { label: '2月', val: 550, passed: 490, negative: 25 },
            { label: '3月', val: 750, passed: 670, negative: 38 },
            { label: '4月', val: 820, passed: 730, negative: 42 },
            { label: '5月', val: 910, passed: 810, negative: 46 },
            { label: '6月', val: 1050, passed: 930, negative: 50 },
            { label: '7月', val: 1150, passed: 1020, negative: 52 },
            { label: '8月', val: 1248, passed: 1100, negative: 55 }
          ],
          donut: [
            { name: '审核通过', value: 7460, color: '#10B981' },
            { name: '待审核', value: 580, color: '#F59E0B' },
            { name: '审核驳回', value: 392, color: '#EF4444' }
          ]
        };
    }
  }, [timeDim]);

  // Category & Org Distribution Pie Chart
  const pieData = useMemo(() => {
    if (pieTab === 'category') {
      return [
        { name: '政务与规章', value: 42, color: '#1E5ABB' },
        { name: '民生与社会热点', value: 28, color: '#10B981' },
        { name: '教育与科技', value: 18, color: '#F59E0B' },
        { name: '医疗与卫生应急', value: 12, color: '#8B5CF6' }
      ];
    } else if (pieTab === 'org') {
      return [
        { name: '市级党政部门', value: 38, color: '#1E5ABB' },
        { name: '28区县直属局', value: 45, color: '#10B981' },
        { name: '独立事业单位', value: 17, color: '#F59E0B' }
      ];
    } else {
      return [
        { name: '主流微信公众号', value: 35, color: '#10B981' },
        { name: '微博与短视频', value: 30, color: '#EF4444' },
        { name: '地方新闻网站', value: 25, color: '#1E5ABB' },
        { name: '社区与论坛', value: 10, color: '#8B5CF6' }
      ];
    }
  }, [pieTab]);

  // Sub-orgs detailed table
  const subOrgRows = [
    { rank: 1, name: '市发展改革委', class: '政务部门', total: 450, passed: 428, passRate: '95.1%', avgTime: '11.2分', status: '优秀' },
    { rank: 2, name: '台中市网信办', class: '网安指挥', total: 380, passed: 358, passRate: '94.2%', avgTime: '10.5分', status: '优秀' },
    { rank: 3, name: '市财政局', class: '政务部门', total: 310, passed: 285, passRate: '91.9%', avgTime: '13.8分', status: '良好' },
    { rank: 4, name: '市科技局', class: '政务部门', total: 290, passed: 261, passRate: '90.0%', avgTime: '14.5分', status: '良好' },
    { rank: 5, name: '西区网信局', class: '区县机构', total: 245, passed: 218, passRate: '88.9%', avgTime: '16.2分', status: '良好' },
    { rank: 6, name: '北区网信局', class: '区县机构', total: 210, passed: 182, passRate: '86.6%', avgTime: '18.0分', status: '合格' }
  ];

  // Categories detailed table
  const categoryRows = [
    { rank: 1, name: '突发网络舆情', total: 1420, passed: 1280, passRate: '90.1%', ratio: '32.5%', level: '高' },
    { rank: 2, name: '民生诉求关切', total: 1180, passed: 1062, passRate: '90.0%', ratio: '27.0%', level: '中' },
    { rank: 3, name: '涉稳风险预警', total: 950, passed: 845, passRate: '88.9%', ratio: '21.8%', level: '高' },
    { rank: 4, name: '网络安全防范', total: 810, passed: 730, passRate: '90.1%', ratio: '18.7%', level: '中' }
  ];

  // Personnel performance table
  const personRows = [
    { rank: 1, name: '张三', org: '市委宣传部', total: 156, passed: 148, passRate: '94.8%', active: '99.2%' },
    { rank: 2, name: '李四', org: '台中市网信办', total: 128, passed: 118, passRate: '92.2%', active: '98.5%' },
    { rank: 3, name: '王五', org: '市交通运输局', total: 110, passed: 98, passRate: '89.1%', active: '95.0%' },
    { rank: 4, name: '赵六', org: '市公安局', total: 95, passed: 84, passRate: '88.4%', active: '94.2%' }
  ];

  // Negative transfers table
  const negativeRows = [
    { id: 'TS-20260811-01', title: '关于某区水务管道维修改造噪音诉求', org: '市水务局', time: '2026-08-11 10:15', status: '办理中', level: '中风险' },
    { id: 'TS-20260810-04', title: '部分社区网速波动与通信保障问题反馈', org: '市通信管理局', time: '2026-08-10 16:30', status: '已办结', level: '低风险' },
    { id: 'TS-20260809-02', title: '市交通干线拥堵提示与信号灯优化建议', org: '市公安交警支队', time: '2026-08-09 11:20', status: '已办结', level: '中风险' }
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Header & Multi-Time Dimension Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-[#1E5ABB] text-white rounded-xl shadow-2xs">
                <BarChart2 className="w-5 h-5 text-blue-100" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">全域统计管理大屏</h2>
                <p className="text-xs text-gray-500 mt-0.5">多时间维度分析、机构报送效能监控与多维度交办台账</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => alert('已导出 Excel 格式数据统计报表！')}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 shadow-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>导出统计大表</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>打印分析简报</span>
            </button>
          </div>
        </div>

        {/* TIME DIMENSION TABS & FILTER CONTROLS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* Preset Time Dimension Buttons (日、周、月、季度、年、自定义) */}
          <div className="lg:col-span-6 flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 text-xs font-medium overflow-x-auto">
            <span className="text-gray-400 font-bold px-2.5 text-[11px] shrink-0 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>统计维度:</span>
            </span>
            <button
              onClick={() => handleTimeDimChange('day')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                timeDim === 'day' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-700'
              }`}
            >
              日 (今日)
            </button>
            <button
              onClick={() => handleTimeDimChange('week')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                timeDim === 'week' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-700'
              }`}
            >
              周 (本周)
            </button>
            <button
              onClick={() => handleTimeDimChange('month')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                timeDim === 'month' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-700'
              }`}
            >
              月 (本月)
            </button>
            <button
              onClick={() => handleTimeDimChange('quarter')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                timeDim === 'quarter' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-700'
              }`}
            >
              季度 (本季)
            </button>
            <button
              onClick={() => handleTimeDimChange('year')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                timeDim === 'year' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-700'
              }`}
            >
              年 (本年)
            </button>
            <button
              onClick={() => handleTimeDimChange('custom')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                timeDim === 'custom' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-700'
              }`}
            >
              自定义范围
            </button>
          </div>

          {/* Date Picker Input & Sub-org Filter */}
          <div className="lg:col-span-6 flex flex-wrap items-center justify-end gap-2 text-xs">
            {/* Custom Range Inputs */}
            <div className="flex items-center space-x-1.5 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setTimeDim('custom');
                }}
                className="w-28 focus:outline-none text-gray-700 font-mono text-[11px]"
              />
              <span className="text-gray-400">至</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setTimeDim('custom');
                }}
                className="w-28 focus:outline-none text-gray-700 font-mono text-[11px]"
              />
            </div>

            {/* Sub-org Select Dropdown */}
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-xs cursor-pointer shadow-2xs"
            >
              <option value="all">全部分析机构 (28家)</option>
              <option value="city">市级党政部门 (5家)</option>
              <option value="district">区县网络网信局 (18局)</option>
              <option value="other">独立直属单位 (5家)</option>
            </select>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-gray-600 font-bold rounded-lg border border-gray-200 flex items-center space-x-1 cursor-pointer transition-colors"
              title="重置筛选"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Unified KPI Cards Row (融合首页与统计管理指标 6 大维卡) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Metric 1: 舆情速报上报总量 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold text-gray-700 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>速报上报总量</span>
            </span>
            <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-bold border border-blue-100">
              {timeDimConfig.label.slice(0, 4)}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {timeDimConfig.total}
              <span className="text-xs font-normal text-slate-500 ml-1">件</span>
            </div>
            <span className="text-xs text-emerald-600 font-bold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              <span>+12.4%</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-1.5 flex items-center justify-between font-medium">
            <span>通过数: {timeDimConfig.passed}件</span>
            <span>通过率: {timeDimConfig.passRate}</span>
          </div>
        </div>

        {/* Metric 2: 审核通过率 (品控指标) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold text-gray-700 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>审核通过率</span>
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold border border-emerald-100">
              品控严密
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <div className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
              {timeDimConfig.passRate}
            </div>
            <span className="text-xs text-emerald-600 font-bold">
              准度极高
            </span>
          </div>
          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-1.5 flex items-center justify-between font-medium">
            <span>合格率: 98.8%</span>
            <span>驳回率: 4.8%</span>
          </div>
        </div>

        {/* Metric 3: 活跃上报人员与机构 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold text-gray-700 flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>参与人员/机构</span>
            </span>
            <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-bold border border-indigo-100">
              全域联动
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {timeDimConfig.users}
              <span className="text-xs font-normal text-slate-500 ml-1">人</span>
            </div>
            <span className="text-xs text-indigo-600 font-bold">
              {timeDimConfig.orgs} 家机构
            </span>
          </div>
          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-1.5 flex items-center justify-between font-medium">
            <span>在册: 186人</span>
            <span>覆盖率: 100%</span>
          </div>
        </div>

        {/* Metric 4: 负面舆情转办数 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold text-gray-700 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>负面舆情转办</span>
            </span>
            <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded font-bold border border-rose-100">
              闭环交办
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {timeDimConfig.negatives}
              <span className="text-xs font-normal text-slate-500 ml-1">件</span>
            </div>
            <span className="text-xs text-rose-600 font-bold">
              办结率 98.2%
            </span>
          </div>
          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-1.5 flex items-center justify-between font-medium">
            <span>待办: 3件</span>
            <span>按时交办率: 100%</span>
          </div>
        </div>

        {/* Metric 5: 平均审核响应 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold text-gray-700 flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-purple-600" />
              <span>平均审核响应</span>
            </span>
            <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded font-bold border border-purple-100">
              效能优异
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <div className="text-xl font-black text-purple-600 font-mono tracking-tight">
              {timeDimConfig.avgTime}
            </div>
            <span className="text-xs text-purple-600 font-bold">
              提效 47.3%
            </span>
          </div>
          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-1.5 flex items-center justify-between font-medium">
            <span>标准指标: 30min</span>
            <span>优于基准</span>
          </div>
        </div>

        {/* Metric 6: 子机构全域覆盖 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold text-gray-700 flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>全域覆盖机构</span>
            </span>
            <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded font-bold border border-amber-200">
              28区县局
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              28
              <span className="text-xs font-normal text-slate-500 ml-1">个</span>
            </div>
            <span className="text-xs text-amber-600 font-bold">
              100% 在线
            </span>
          </div>
          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-1.5 flex items-center justify-between font-medium">
            <span>市级: 5</span>
            <span>区县: 18</span>
            <span>其他: 5</span>
          </div>
        </div>
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Trend Area Chart (8 Columns) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center space-x-2">
                <div className="p-1 bg-blue-100 text-[#1E5ABB] rounded-md">
                  <Activity className="w-4 h-4" />
                </div>
                <span>舆情速报上报与通过趋势 ({timeDimConfig.label})</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">随时间维度（日/周/月/季/年）动态聚类呈现上报量与通过量</p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#1E5ABB]"></span>
                <span className="text-gray-600 font-medium">上报总量</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#10B981]"></span>
                <span className="text-gray-600 font-medium">审核通过</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeDimConfig.trend}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E5ABB" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#1E5ABB" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorPassed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                />
                <Area type="monotone" dataKey="val" name="上报总量" stroke="#1E5ABB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVal)" />
                <Area type="monotone" dataKey="passed" name="审核通过" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPassed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Stack: Donut + Category Pie Charts (4 Columns) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Donut Chart: Audit Status Distribution */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 flex items-center space-x-1.5">
                <PieChartIcon className="w-4 h-4 text-emerald-600" />
                <span>上报审核状态结构</span>
              </h3>
              <span className="text-[10px] text-gray-500 bg-slate-100 px-2 py-0.5 rounded font-bold">
                占比统计
              </span>
            </div>

            <div className="relative h-40 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeDimConfig.donut}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {timeDimConfig.donut.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-gray-900 font-mono">{timeDimConfig.total}</span>
                <span className="text-[10px] text-gray-400 font-bold">总件数</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 text-center text-xs pt-1 border-t border-gray-100">
              {timeDimConfig.donut.map((item) => (
                <div key={item.name} className="p-1 bg-slate-50 rounded-lg">
                  <div className="text-[10px] text-gray-500 truncate" title={item.name}>{item.name}</div>
                  <div className="font-extrabold font-mono text-xs mt-0.5" style={{ color: item.color }}>
                    {item.value}件
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart: Multi-perspective Distribution */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-gray-900">维度比例与构成</h3>
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  onClick={() => setPieTab('category')}
                  className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                    pieTab === 'category' ? 'bg-white text-blue-900 shadow-2xs' : 'text-gray-500'
                  }`}
                >
                  分类
                </button>
                <button
                  onClick={() => setPieTab('org')}
                  className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                    pieTab === 'org' ? 'bg-white text-blue-900 shadow-2xs' : 'text-gray-500'
                  }`}
                >
                  机构
                </button>
                <button
                  onClick={() => setPieTab('channel')}
                  className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                    pieTab === 'channel' ? 'bg-white text-blue-900 shadow-2xs' : 'text-gray-500'
                  }`}
                >
                  渠道
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs pt-1">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-none">
                  <div className="flex items-center space-x-2 truncate min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="text-gray-700 font-medium truncate">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-gray-900 ml-2 shrink-0">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Multi-Tab Detailed Data Tables */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-gray-900">数据统计多维报表明细</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Table Perspective Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setTableTab('org')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  tableTab === 'org' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-900'
                }`}
              >
                机构报送绩效
              </button>
              <button
                onClick={() => setTableTab('category')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  tableTab === 'category' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-900'
                }`}
              >
                舆情分类统计
              </button>
              <button
                onClick={() => setTableTab('person')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  tableTab === 'person' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-900'
                }`}
              >
                人员报送排行
              </button>
              <button
                onClick={() => setTableTab('negative')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  tableTab === 'negative' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-900'
                }`}
              >
                负面交办台账
              </button>
            </div>

            {/* Quick Filter Search */}
            <div className="relative flex items-center bg-slate-50 border border-gray-200 rounded-xl px-2.5 py-1">
              <Search className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
              <input
                type="text"
                placeholder="搜索名称或机构..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-36 focus:outline-none text-xs text-gray-700 bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Tab 1: 机构报送绩效明细 */}
        {tableTab === 'org' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-gray-500 border-b border-gray-100 font-semibold">
                  <th className="py-3 px-4 w-14">排名</th>
                  <th className="py-3 px-4">机构名称</th>
                  <th className="py-3 px-4">所属类型</th>
                  <th className="py-3 px-4">上报总量</th>
                  <th className="py-3 px-4">通过件数</th>
                  <th className="py-3 px-4 min-w-[160px]">审核通过率</th>
                  <th className="py-3 px-4">平均响应</th>
                  <th className="py-3 px-4 text-right">绩效评估</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subOrgRows
                  .filter(r => r.name.includes(searchQuery))
                  .map((row) => (
                    <tr key={row.rank} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">#{row.rank}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">{row.name}</td>
                      <td className="py-3 px-4 text-gray-500">{row.class}</td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-800">{row.total} 件</td>
                      <td className="py-3 px-4 font-mono text-emerald-700 font-bold">{row.passed} 件</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#1E5ABB] h-full rounded-full" style={{ width: row.passRate }}></div>
                          </div>
                          <span className="font-mono font-bold text-gray-800 w-12 text-right">{row.passRate}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-purple-700 font-bold">{row.avgTime}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: 舆情分类统计 */}
        {tableTab === 'category' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-gray-500 border-b border-gray-100 font-semibold">
                  <th className="py-3 px-4 w-14">序号</th>
                  <th className="py-3 px-4">舆情分类名称</th>
                  <th className="py-3 px-4">累计上报总量</th>
                  <th className="py-3 px-4">审核通过数</th>
                  <th className="py-3 px-4">占比份额</th>
                  <th className="py-3 px-4 min-w-[160px]">通过率</th>
                  <th className="py-3 px-4 text-right">风险等级</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categoryRows
                  .filter(r => r.name.includes(searchQuery))
                  .map((row) => (
                    <tr key={row.rank} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">{row.rank}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">{row.name}</td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-800">{row.total} 件</td>
                      <td className="py-3 px-4 font-mono text-emerald-700 font-bold">{row.passed} 件</td>
                      <td className="py-3 px-4 font-mono text-blue-700 font-bold">{row.ratio}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#10B981] h-full rounded-full" style={{ width: row.passRate }}></div>
                          </div>
                          <span className="font-mono font-bold text-gray-800 w-12 text-right">{row.passRate}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                          row.level === '高' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {row.level}风险
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: 人员报送排行 */}
        {tableTab === 'person' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-gray-500 border-b border-gray-100 font-semibold">
                  <th className="py-3 px-4 w-14">名次</th>
                  <th className="py-3 px-4">报送人员名称</th>
                  <th className="py-3 px-4">所属机构</th>
                  <th className="py-3 px-4">上报量</th>
                  <th className="py-3 px-4">通过量</th>
                  <th className="py-3 px-4">通过完成率</th>
                  <th className="py-3 px-4 text-right">账号活跃度</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {personRows
                  .filter(r => r.name.includes(searchQuery) || r.org.includes(searchQuery))
                  .map((row) => (
                    <tr key={row.rank} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">#{row.rank}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">{row.name}</td>
                      <td className="py-3 px-4 text-gray-600">{row.org}</td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-800">{row.total} 件</td>
                      <td className="py-3 px-4 font-mono text-emerald-700 font-bold">{row.passed} 件</td>
                      <td className="py-3 px-4 font-mono text-blue-700 font-bold">{row.passRate}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-200">
                          {row.active}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: 负面舆情交办台账 */}
        {tableTab === 'negative' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-gray-500 border-b border-gray-100 font-semibold">
                  <th className="py-3 px-4">交办编号</th>
                  <th className="py-3 px-4">转办舆情主题</th>
                  <th className="py-3 px-4">主办/责任机构</th>
                  <th className="py-3 px-4">交办时间</th>
                  <th className="py-3 px-4">风险等级</th>
                  <th className="py-3 px-4 text-right">处理状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {negativeRows
                  .filter(r => r.title.includes(searchQuery) || r.org.includes(searchQuery))
                  .map((row) => (
                    <tr key={row.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-gray-500">{row.id}</td>
                      <td className="py-3 px-4 font-bold text-gray-900 max-w-xs truncate" title={row.title}>{row.title}</td>
                      <td className="py-3 px-4 text-gray-700 font-medium">{row.org}</td>
                      <td className="py-3 px-4 font-mono text-gray-500">{row.time}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold rounded border border-amber-200">
                          {row.level}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                          row.status === '已办结'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

