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
  Check,
  UserCheck,
  Send,
  ShieldCheck,
  Award,
  Coins,
  AlertTriangle,
  XCircle,
  Timer,
  CheckSquare,
  Trophy,
  Flame,
  Zap,
  Medal,
  Sparkles,
  ArrowRight
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
  Legend,
  LineChart,
  Line
} from 'recharts';

export type TimeDimension = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
export type ViewPerspective = 'all_personal' | 'submitter' | 'auditor' | 'global_org';

export const Statistics: React.FC = () => {
  // View mode: 'all_personal' (综合个人), 'submitter' (报送员身份), 'auditor' (审核员身份), 'global_org' (全域宏观大盘)
  const [viewPerspective, setViewPerspective] = useState<ViewPerspective>('all_personal');
  const [timeDim, setTimeDim] = useState<TimeDimension>('week');
  const [startDate, setStartDate] = useState('2026-08-04');
  const [endDate, setEndDate] = useState('2026-08-11');
  const [selectedOrg, setSelectedOrg] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [pieTab, setPieTab] = useState<'category' | 'org' | 'channel'>('category');
  const [tableTab, setTableTab] = useState<'my_submit' | 'my_audit' | 'org' | 'category' | 'person' | 'negative'>('my_submit');
  const [searchQuery, setSearchQuery] = useState('');
  const [rankViewTab, setRankViewTab] = useState<'submitter' | 'auditor'>('submitter');
  const [submitterSearch, setSubmitterSearch] = useState('');
  const [auditorSearch, setAuditorSearch] = useState('');

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

  // Mock data for Global & Personal stats by Time Dimension
  const timeDimConfig = useMemo(() => {
    switch (timeDim) {
      case 'day':
        return {
          label: '今日 (2026-08-11)',
          // Personal Submitter
          mySubmitTotal: 4,
          mySubmitPassed: 4,
          mySubmitPending: 0,
          mySubmitRejected: 0,
          mySubmitPassRate: '100%',
          mySubmitAllowance: '¥120',
          // Personal Auditor
          myAuditTotal: 12,
          myAuditPassed: 11,
          myAuditRejected: 1,
          myAuditPending: 1,
          myAuditPassRate: '91.7%',
          myAuditAvgTime: '7.2分钟',
          myAuditTransferred: 2,
          // Global
          total: 18,
          passed: 16,
          passRate: '88.9%',
          users: 42,
          orgs: 18,
          negatives: 3,
          avgTime: '12.4分钟',
          trend: [
            { label: '02:00', val: 1, passed: 1, mySubmit: 0, myAudit: 0 },
            { label: '06:00', val: 2, passed: 2, mySubmit: 0, myAudit: 1 },
            { label: '10:00', val: 7, passed: 6, mySubmit: 2, myAudit: 5 },
            { label: '14:00', val: 5, passed: 4, mySubmit: 1, myAudit: 4 },
            { label: '18:00', val: 2, passed: 2, mySubmit: 1, myAudit: 2 },
            { label: '22:00', val: 1, passed: 1, mySubmit: 0, myAudit: 0 }
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
          // Personal Submitter
          mySubmitTotal: 28,
          mySubmitPassed: 26,
          mySubmitPending: 1,
          mySubmitRejected: 1,
          mySubmitPassRate: '92.9%',
          mySubmitAllowance: '¥780',
          // Personal Auditor
          myAuditTotal: 84,
          myAuditPassed: 78,
          myAuditRejected: 6,
          myAuditPending: 2,
          myAuditPassRate: '92.8%',
          myAuditAvgTime: '8.6分钟',
          myAuditTransferred: 5,
          // Global
          total: 142,
          passed: 128,
          passRate: '90.1%',
          users: 112,
          orgs: 26,
          negatives: 15,
          avgTime: '14.2分钟',
          trend: [
            { label: '周一', val: 18, passed: 16, mySubmit: 3, myAudit: 11 },
            { label: '周二', val: 22, passed: 20, mySubmit: 5, myAudit: 14 },
            { label: '周三', val: 25, passed: 23, mySubmit: 4, myAudit: 16 },
            { label: '周四', val: 19, passed: 17, mySubmit: 3, myAudit: 10 },
            { label: '周五', val: 28, passed: 25, mySubmit: 6, myAudit: 18 },
            { label: '周六', val: 12, passed: 11, mySubmit: 3, myAudit: 7 },
            { label: '周日', val: 18, passed: 16, mySubmit: 4, myAudit: 8 }
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
          // Personal Submitter
          mySubmitTotal: 112,
          mySubmitPassed: 106,
          mySubmitPending: 4,
          mySubmitRejected: 2,
          mySubmitPassRate: '94.6%',
          mySubmitAllowance: '¥3,180',
          // Personal Auditor
          myAuditTotal: 326,
          myAuditPassed: 304,
          myAuditRejected: 22,
          myAuditPending: 2,
          myAuditPassRate: '93.3%',
          myAuditAvgTime: '8.4分钟',
          myAuditTransferred: 14,
          // Global
          total: 580,
          passed: 522,
          passRate: '90.0%',
          users: 168,
          orgs: 28,
          negatives: 48,
          avgTime: '15.1分钟',
          trend: [
            { label: '第一周', val: 130, passed: 118, mySubmit: 24, myAudit: 75 },
            { label: '第二周', val: 142, passed: 128, mySubmit: 28, myAudit: 84 },
            { label: '第三周', val: 155, passed: 140, mySubmit: 32, myAudit: 88 },
            { label: '第四周', val: 153, passed: 136, mySubmit: 28, myAudit: 79 }
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
          // Personal Submitter
          mySubmitTotal: 340,
          mySubmitPassed: 322,
          mySubmitPending: 10,
          mySubmitRejected: 8,
          mySubmitPassRate: '94.7%',
          mySubmitAllowance: '¥9,660',
          // Personal Auditor
          myAuditTotal: 980,
          myAuditPassed: 915,
          myAuditRejected: 65,
          myAuditPending: 2,
          myAuditPassRate: '93.4%',
          myAuditAvgTime: '8.8分钟',
          myAuditTransferred: 38,
          // Global
          total: 1860,
          passed: 1680,
          passRate: '90.3%',
          users: 180,
          orgs: 28,
          negatives: 132,
          avgTime: '15.5分钟',
          trend: [
            { label: '7月', val: 620, passed: 560, mySubmit: 115, myAudit: 330 },
            { label: '8月', val: 660, passed: 598, mySubmit: 120, myAudit: 350 },
            { label: '9月(预测)', val: 580, passed: 522, mySubmit: 105, myAudit: 300 }
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
          // Personal Submitter
          mySubmitTotal: 156,
          mySubmitPassed: 148,
          mySubmitPending: 5,
          mySubmitRejected: 3,
          mySubmitPassRate: '94.8%',
          mySubmitAllowance: '¥4,440',
          // Personal Auditor
          myAuditTotal: 428,
          myAuditPassed: 398,
          myAuditRejected: 30,
          myAuditPending: 2,
          myAuditPassRate: '93.0%',
          myAuditAvgTime: '8.6分钟',
          myAuditTransferred: 18,
          // Global
          total: 8432,
          passed: 7460,
          passRate: '88.5%',
          users: 186,
          orgs: 28,
          negatives: 240,
          avgTime: '15.8分钟',
          trend: [
            { label: '1月', val: 600, passed: 530, mySubmit: 12, myAudit: 35 },
            { label: '2月', val: 550, passed: 490, mySubmit: 10, myAudit: 30 },
            { label: '3月', val: 750, passed: 670, mySubmit: 15, myAudit: 42 },
            { label: '4月', val: 820, passed: 730, mySubmit: 18, myAudit: 46 },
            { label: '5月', val: 910, passed: 810, mySubmit: 20, myAudit: 52 },
            { label: '6月', val: 1050, passed: 930, mySubmit: 24, myAudit: 60 },
            { label: '7月', val: 1150, passed: 1020, mySubmit: 27, myAudit: 75 },
            { label: '8月', val: 1248, passed: 1100, mySubmit: 30, myAudit: 88 }
          ],
          donut: [
            { name: '审核通过', value: 7460, color: '#10B981' },
            { name: '待审核', value: 580, color: '#F59E0B' },
            { name: '审核驳回', value: 392, color: '#EF4444' }
          ]
        };
    }
  }, [timeDim]);

  // Submitter Categories Breakdown
  const submitterCategoryData = [
    { name: '突发网络舆情', value: 45, color: '#1E5ABB' },
    { name: '民生诉求关切', value: 35, color: '#10B981' },
    { name: '涉稳风险预警', value: 12, color: '#F59E0B' },
    { name: '政务与规章', value: 8, color: '#8B5CF6' }
  ];

  // Auditor Decision Breakdown
  const auditorDecisionData = [
    { name: '直接审核通过', value: 76, color: '#10B981' },
    { name: '退回修改驳回', value: 7, color: '#EF4444' },
    { name: '转交主办单位', value: 12, color: '#3B82F6' },
    { name: '上报领导研判', value: 5, color: '#F59E0B' }
  ];

  // Category & Org Distribution Pie Chart for Global View
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

  // My Submit Records
  const mySubmitRows = [
    { id: 'SB-20260811-01', title: '关于某区水务改造噪音扰民问题舆情线索', category: '民生诉求', time: '2026-08-11 10:15', status: '已采纳', score: 95, allowance: '¥50', auditor: '李四 (市委宣传部)' },
    { id: 'SB-20260810-03', title: '西城区部分住宅小区光纤网络突发故障反馈', category: '突发事件', time: '2026-08-10 14:20', status: '已采纳', score: 90, allowance: '¥30', auditor: '系统自动/管理员' },
    { id: 'SB-20260809-02', title: '西坝大道高峰期交通信号灯配时优化诉求', category: '民生诉求', time: '2026-08-09 11:30', status: '已采纳', score: 88, allowance: '¥30', auditor: '王五 (市交警支队)' },
    { id: 'SB-20260808-05', title: '网络某短视频虚假夸大商超物价谣言查证', category: '突发事件', time: '2026-08-08 16:45', status: '已采纳', score: 98, allowance: '¥100', auditor: '赵六 (网信办)' },
    { id: 'SB-20260807-01', title: '某小区业主群内部违建投诉情况反映', category: '民生诉求', time: '2026-08-07 09:10', status: '被驳回', score: '--', allowance: '¥0', auditor: '张三 (经办审核)', rejectReason: '线索材料缺少关键现场佐证，建议补充图片后重报' }
  ];

  // My Audit Records
  const myAuditRows = [
    { id: 'AD-20260811-09', reportTitle: '东湖区某重点高中教师补课网络不实发帖核查', submitter: '王建国 (区教育局)', submitOrg: '东湖区教育局', auditResult: '已通过', auditTime: '2026-08-11 11:05', costTime: '6.2分', action: '采纳并归档' },
    { id: 'AD-20260810-14', reportTitle: '滨江路下穿隧道暴雨积水应急疏导情况通报', submitter: '陈小明 (交管局)', submitOrg: '市公安交管局', auditResult: '已通过', auditTime: '2026-08-10 16:12', costTime: '8.5分', action: '采纳并转办' },
    { id: 'AD-20260809-08', reportTitle: '关于某品牌牛奶质量抽检不合格网络传言', submitter: '刘伟 (市监局)', submitOrg: '市市场监管局', auditResult: '已通过', auditTime: '2026-08-09 10:40', costTime: '9.1分', action: '加急研判' },
    { id: 'AD-20260808-12', reportTitle: '某社区老年人食堂饭菜定价合理性网民讨论', submitter: '张丽 (民政局)', submitOrg: '市民政局', auditResult: '被驳回', auditTime: '2026-08-08 15:30', costTime: '5.4分', action: '退回补充证据', rejectReason: '未附发帖原文链接及网络传播量数据' },
    { id: 'AD-20260807-04', reportTitle: '市第一医院门诊预约系统升级维护网络提醒', submitter: '周强 (卫健委)', submitOrg: '市卫生健康委', auditResult: '已通过', auditTime: '2026-08-07 14:15', costTime: '7.8分', action: '审核通过' }
  ];

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

  // Submitter Ranking Data
  const submitterRankRows = [
    { rank: 1, name: '张三 (当前账号)', avatar: 'ZS', org: '市委宣传部/网信办', total: 156, passed: 148, passRate: '94.8%', allowance: '¥4,440', active: '99.8%', level: '标兵' },
    { rank: 2, name: '李红梅', avatar: 'LM', org: '台中市网信办', total: 142, passed: 132, passRate: '93.0%', allowance: '¥3,960', active: '98.5%', level: '标兵' },
    { rank: 3, name: '王建国', avatar: 'WG', org: '市公安交管局', total: 128, passed: 118, passRate: '92.2%', allowance: '¥3,540', active: '97.2%', level: '优秀' },
    { rank: 4, name: '陈小明', avatar: 'CM', org: '西区网信局', total: 110, passed: 98, passRate: '89.1%', allowance: '¥2,940', active: '95.0%', level: '良好' },
    { rank: 5, name: '赵六', avatar: 'ZL', org: '市市场监管局', total: 95, passed: 84, passRate: '88.4%', allowance: '¥2,520', active: '94.2%', level: '良好' },
    { rank: 6, name: '孙晓丽', avatar: 'SL', org: '市教育局', total: 88, passed: 78, passRate: '88.6%', allowance: '¥2,340', active: '93.5%', level: '良好' },
    { rank: 7, name: '周强', avatar: 'ZQ', org: '市卫生健康委', total: 76, passed: 68, passRate: '89.5%', allowance: '¥2,040', active: '92.0%', level: '合格' }
  ];

  // Auditor Ranking Data
  const auditorRankRows = [
    { rank: 1, name: '李四', avatar: 'LS', org: '台中市网信办', total: 460, passed: 435, rejected: 25, passRate: '94.6%', avgTime: '7.2分钟', transferCount: 22, level: '卓越' },
    { rank: 2, name: '张三 (当前账号)', avatar: 'ZS', org: '市委宣传部/网信办', total: 428, passed: 398, rejected: 30, passRate: '93.0%', avgTime: '8.6分钟', transferCount: 18, level: '优秀' },
    { rank: 3, name: '刘伟', avatar: 'LW', org: '市委督查室', total: 385, passed: 352, rejected: 33, passRate: '91.4%', avgTime: '9.1分钟', transferCount: 15, level: '良好' },
    { rank: 4, name: '王五', avatar: 'WW', org: '市应急指挥中心', total: 340, passed: 312, rejected: 28, passRate: '91.8%', avgTime: '9.8分钟', transferCount: 12, level: '良好' },
    { rank: 5, name: '钱进', avatar: 'QJ', org: '市委政法委', total: 295, passed: 270, rejected: 25, passRate: '91.5%', avgTime: '11.2分钟', transferCount: 9, level: '良好' },
    { rank: 6, name: '吴敏', avatar: 'WM', org: '西区网信办', total: 260, passed: 232, rejected: 28, passRate: '89.2%', avgTime: '12.5分钟', transferCount: 8, level: '合格' },
    { rank: 7, name: '郑华', avatar: 'ZH', org: '市纪委监委信息室', total: 220, passed: 198, rejected: 22, passRate: '90.0%', avgTime: '13.0分钟', transferCount: 6, level: '合格' }
  ];

  // Personnel performance table
  const personRows = [
    { rank: 1, name: '张三 (当前账号)', org: '市委宣传部/网信办', total: 156, passed: 148, passRate: '94.8%', active: '99.8%', role: '报送员/审核员' },
    { rank: 2, name: '李四', org: '台中市网信办', total: 128, passed: 118, passRate: '92.2%', active: '98.5%', role: '审核员' },
    { rank: 3, name: '王五', org: '市交通运输局', total: 110, passed: 98, passRate: '89.1%', active: '95.0%', role: '报送员' },
    { rank: 4, name: '赵六', org: '市公安局', total: 95, passed: 84, passRate: '88.4%', active: '94.2%', role: '报送员' }
  ];

  // Negative transfers table
  const negativeRows = [
    { id: 'TS-20260811-01', title: '关于某区水务管道维修改造噪音诉求', org: '市水务局', time: '2026-08-11 10:15', status: '办理中', level: '中风险' },
    { id: 'TS-20260810-04', title: '部分社区网速波动与通信保障问题反馈', org: '市通信管理局', time: '2026-08-10 16:30', status: '已办结', level: '低风险' },
    { id: 'TS-20260809-02', title: '市交通干线拥堵提示与信号灯优化建议', org: '市公安交警支队', time: '2026-08-09 11:20', status: '已办结', level: '中风险' }
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Header & Time Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-[#1E5ABB] text-white rounded-xl shadow-2xs">
                <BarChart2 className="w-5 h-5 text-blue-100" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">统计分析与效能管理</h2>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => alert('已生成并导出个人工作量与全域数据统计 Excel 报表！')}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 shadow-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>导出统计报表</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>打印统计报告</span>
            </button>
          </div>
        </div>

        {/* TIME DIMENSION TABS & FILTER CONTROLS */}
        <div className="flex flex-nowrap items-center gap-2 pt-1 overflow-hidden">
          {/* Preset Time Dimension Buttons (日、周、月、季度、年、自定义) */}
          <div className="min-w-0 flex-1 flex flex-nowrap items-center gap-0.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 text-xs font-medium overflow-hidden">
            <span className="text-gray-400 font-bold px-1.5 text-[11px] shrink-0 flex items-center space-x-1 h-7">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>时间维度:</span>
            </span>
            <button
              onClick={() => handleTimeDimChange('day')}
              className={`px-2 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                timeDim === 'day' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-700 hover:bg-white/70'
              }`}
            >
              日 (今日)
            </button>
            <button
              onClick={() => handleTimeDimChange('week')}
              className={`px-2 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                timeDim === 'week' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-700 hover:bg-white/70'
              }`}
            >
              周 (本周)
            </button>
            <button
              onClick={() => handleTimeDimChange('month')}
              className={`px-2 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                timeDim === 'month' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-700 hover:bg-white/70'
              }`}
            >
              月 (本月)
            </button>
            <button
              onClick={() => handleTimeDimChange('quarter')}
              className={`px-2 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                timeDim === 'quarter' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-700 hover:bg-white/70'
              }`}
            >
              季度 (本季)
            </button>
            <button
              onClick={() => handleTimeDimChange('year')}
              className={`px-2 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                timeDim === 'year' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-700 hover:bg-white/70'
              }`}
            >
              年 (本年)
            </button>
            <button
              onClick={() => handleTimeDimChange('custom')}
              className={`px-2 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                timeDim === 'custom' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-700 hover:bg-white/70'
              }`}
            >
              自定义
            </button>
          </div>

          {/* Date Picker Input & Sub-org Filter */}
          <div className="shrink-0 flex flex-nowrap items-center justify-end gap-1.5 text-xs">
            {/* Custom Range Inputs */}
            <div className="shrink-0 flex flex-nowrap items-center gap-1 bg-white border border-gray-300 rounded-lg px-2 py-1.5 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setTimeDim('custom');
                }}
                className="w-[6.6rem] focus:outline-none text-gray-700 font-mono text-[11px]"
              />
              <span className="text-gray-400">至</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setTimeDim('custom');
                }}
                className="w-[6.6rem] focus:outline-none text-gray-700 font-mono text-[11px]"
              />
            </div>

            {/* Sub-org Select Dropdown */}
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="w-48 bg-white border border-gray-300 text-gray-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-xs cursor-pointer shadow-2xs truncate"
            >
              <option value="all">关联所属机构 (全部4家)</option>
              <option value="dept1">台中市网信办-西坝区环保局</option>
              <option value="dept2">台中市西坝区街道办事处</option>
              <option value="dept3">西坝区应急管理局</option>
              <option value="dept4">西坝区网格化综合治理中心</option>
            </select>

            <button
              onClick={handleReset}
              className="shrink-0 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-gray-600 font-bold rounded-lg border border-gray-200 flex items-center space-x-1 cursor-pointer transition-colors"
              title="重置筛选"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. DUAL-ROLE PERSONAL METRIC CARDS (当选择个人综合或单独身份时展示) */}
      {(viewPerspective === 'all_personal' || viewPerspective === 'submitter' || viewPerspective === 'auditor') && (
        <div className="space-y-4">
          {/* SECTION A: 作为报送员数据卡片 (Submitter Cards) */}
          {(viewPerspective === 'all_personal' || viewPerspective === 'submitter') && (
            <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-4 sm:p-5 rounded-2xl border border-blue-200/80 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1E5ABB] text-white flex items-center justify-center font-bold shadow-2xs">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm flex items-center space-x-2">
                      <span>报送数据统计</span>
                      <span className="bg-blue-100 text-[#1E5ABB] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        报送履历与采纳绩效
                      </span>
                    </h3>
                    <p className="text-gray-500 text-xs mt-0.5">反映您作为信息报送员的上报总量、采纳通过率等贡献排行情况</p>
                  </div>
                </div>
              </div>

              {/* Submitter 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. 个人上报总量 */}
                <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-bold text-gray-700 flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>个人累计上报</span>
                    </span>
                    <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-bold">
                      {timeDimConfig.label.slice(0, 4)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-black text-gray-900 font-mono tracking-tight">
                      {timeDimConfig.mySubmitTotal}
                      <span className="text-xs font-normal text-gray-500 ml-1">件</span>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center">
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      <span>+14.2%</span>
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 border-t border-gray-100 pt-1 flex items-center justify-between">
                    <span>通过: {timeDimConfig.mySubmitPassed}件</span>
                    <span>待审: {timeDimConfig.mySubmitPending}件</span>
                  </div>
                </div>

                {/* 2. 采纳/审核通过率 */}
                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-bold text-gray-700 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>线索采纳通过率</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
                      优质供稿
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
                      {timeDimConfig.mySubmitPassRate}
                    </div>
                    <span className="text-[11px] text-emerald-600 font-bold">
                      高质高效
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 border-t border-gray-100 pt-1 flex items-center justify-between">
                    <span>采纳数: {timeDimConfig.mySubmitPassed}件</span>
                    <span>驳回: {timeDimConfig.mySubmitRejected}件</span>
                  </div>
                </div>

                {/* 3. 待审核与流转 */}
                <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-bold text-gray-700 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>审核流转中</span>
                    </span>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-bold">
                      正在研判
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-black text-amber-600 font-mono tracking-tight">
                      {timeDimConfig.mySubmitPending}
                      <span className="text-xs font-normal text-gray-500 ml-1">件</span>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      流转顺畅
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 border-t border-gray-100 pt-1 flex items-center justify-between">
                    <span>初审中: 1件</span>
                    <span>待交办: 0件</span>
                  </div>
                </div>


              </div>
            </div>
          )}

          {/* SECTION B: 作为审核员数据卡片 (Auditor Cards) */}
          {(viewPerspective === 'all_personal' || viewPerspective === 'auditor') && (
            <div className="bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm flex items-center space-x-2">
                      <span>审核数据统计</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        把关效能与审批时效
                      </span>
                    </h3>
                    <p className="text-gray-500 text-xs mt-0.5">反映您作为审核员的经办审批量、平均响应耗时、把关驳回率及待审核任务情况</p>
                  </div>
                </div>
              </div>

              {/* Auditor 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. 经办审核总量 */}
                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-bold text-gray-700 flex items-center space-x-1">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>经办审核总量</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
                      {timeDimConfig.label.slice(0, 4)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-black text-gray-900 font-mono tracking-tight">
                      {timeDimConfig.myAuditTotal}
                      <span className="text-xs font-normal text-gray-500 ml-1">件</span>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center">
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      <span>+18.6%</span>
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 border-t border-gray-100 pt-1 flex items-center justify-between">
                    <span>通过: {timeDimConfig.myAuditPassed}件</span>
                    <span>驳回: {timeDimConfig.myAuditRejected}件</span>
                  </div>
                </div>

                {/* 2. 审核通过把关率 */}
                <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-bold text-gray-700 flex items-center space-x-1">
                      <Percent className="w-3.5 h-3.5 text-blue-600" />
                      <span>审核通过率</span>
                    </span>
                    <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-bold">
                      合规严密
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-black text-[#1E5ABB] font-mono tracking-tight">
                      {timeDimConfig.myAuditPassRate}
                    </div>
                    <span className="text-[11px] text-gray-500">
                      严守底线
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 border-t border-gray-100 pt-1 flex items-center justify-between">
                    <span>通过: {timeDimConfig.myAuditPassed}件</span>
                    <span>把关驳回: {timeDimConfig.myAuditRejected}件</span>
                  </div>
                </div>

                {/* 3. 平均审核响应耗时 */}
                <div className="bg-white p-3.5 rounded-xl border border-purple-100 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-bold text-gray-700 flex items-center space-x-1">
                      <Timer className="w-3.5 h-3.5 text-purple-600" />
                      <span>平均审核响应耗时</span>
                    </span>
                    <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded font-bold">
                      极速响应
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-black text-purple-600 font-mono tracking-tight">
                      {timeDimConfig.myAuditAvgTime}
                    </div>
                    <span className="text-[11px] text-purple-600 font-bold">
                      优于基准 45%
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 border-t border-gray-100 pt-1 flex items-center justify-between">
                    <span>标准要求: 30分钟</span>
                    <span>履约率: 99.4%</span>
                  </div>
                </div>


                {/* 4. 待我处理审核 */}
                <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-bold text-gray-700 flex items-center space-x-1">
                      <Activity className="w-3.5 h-3.5 text-amber-600" />
                      <span>待我审核任务</span>
                    </span>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-bold">
                      待办待审
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-black text-amber-600 font-mono tracking-tight">
                      {timeDimConfig.myAuditPending}
                      <span className="text-xs font-normal text-gray-500 ml-1">件</span>
                    </div>
                    <span className="text-[11px] text-amber-600 font-bold animate-pulse">
                      建议即时处理
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 border-t border-gray-100 pt-1 flex items-center justify-between">
                    <span>紧急: 0件</span>
                    <span>普通: 2件</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION C: 全域宏观大盘指标 (当选择全域大盘视角时展示) */}
      {viewPerspective === 'global_org' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* Metric 1: 舆情速报上报总量 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-bold text-gray-700 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>全域速报上报总量</span>
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

          {/* Metric 2: 审核通过率 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-bold text-gray-700 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>全网审核通过率</span>
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
      )}

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
                <span>
                  {viewPerspective === 'submitter'
                    ? `个人信息报送趋势统计 (${timeDimConfig.label})`
                    : viewPerspective === 'auditor'
                    ? `个人经办审核趋势统计 (${timeDimConfig.label})`
                    : viewPerspective === 'global_org'
                    ? `全域舆情速报上报与通过趋势 (${timeDimConfig.label})`
                    : `个人报送与经办审核综合趋势 (${timeDimConfig.label})`}
                </span>
              </h3>

            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {viewPerspective !== 'auditor' && (
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#1E5ABB]"></span>
                  <span className="text-gray-600 font-medium">
                    {viewPerspective === 'submitter' || viewPerspective === 'all_personal' ? '我的报送量' : '全网报送总量'}
                  </span>
                </div>
              )}

              {viewPerspective !== 'submitter' && (
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#10B981]"></span>
                  <span className="text-gray-600 font-medium">
                    {viewPerspective === 'auditor' || viewPerspective === 'all_personal' ? '我的审核量' : '审核通过总量'}
                  </span>
                </div>
              )}
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
                {(viewPerspective === 'all_personal' || viewPerspective === 'submitter') && (
                  <Area
                    type="monotone"
                    dataKey="mySubmit"
                    name="我的报送量"
                    stroke="#1E5ABB"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorVal)"
                  />
                )}
                {(viewPerspective === 'all_personal' || viewPerspective === 'auditor') && (
                  <Area
                    type="monotone"
                    dataKey="myAudit"
                    name="我的审核量"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorPassed)"
                  />
                )}
                {viewPerspective === 'global_org' && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="val"
                      name="全网报送总量"
                      stroke="#1E5ABB"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorVal)"
                    />
                    <Area
                      type="monotone"
                      dataKey="passed"
                      name="审核通过总量"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorPassed)"
                    />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Stack: Report + Audit Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center space-x-1.5">
                <BarChart2 className="w-4 h-4 text-[#1E5ABB]" />
                <span>数据分析统计看板</span>
              </h3>

            </div>

            {/* 报送统计 */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/25 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center space-x-1.5">
                  <Send className="w-4 h-4 text-[#1E5ABB]" />
                  <span>报送统计</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-bold">按上报任务统计</span>
              </div>

              <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 items-center">
                <div className="relative h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: '一次性通过', value: 0, color: '#10B981' },
                          { name: '返修通过', value: 1, color: '#06B6D4' },
                          { name: '待审核', value: 9, color: '#94A3B8' },
                          { name: '驳回', value: 1, color: '#F43F5E' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={34}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {['#10B981', '#06B6D4', '#94A3B8', '#F43F5E'].map((color, index) => (
                          <Cell key={`report-cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-slate-500 font-bold">累计上报</span>
                    <span className="text-2xl leading-none font-black text-slate-900 font-mono mt-0.5">11</span>
                    <span className="text-[10px] text-slate-400 font-bold mt-0.5">件</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs min-w-0">
                  {[
                    { name: '一次性通过', value: '0件', color: '#10B981', valueClass: 'text-emerald-600' },
                    { name: '返修通过', value: '1件', color: '#06B6D4', valueClass: 'text-cyan-600' },
                    { name: '待审核', value: '9件', color: '#94A3B8', valueClass: 'text-slate-700' },
                    { name: '驳回', value: '1件', color: '#F43F5E', valueClass: 'text-rose-600' }
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-lg bg-white border border-slate-100 px-2.5 py-1.5 shadow-2xs">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                        <span className="font-bold text-slate-700 truncate">{item.name}</span>
                      </div>
                      <span className={`font-black font-mono ${item.valueClass}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-white border border-slate-100 px-3 py-2 flex items-center justify-between">
                  <span className="font-bold text-slate-600">整体通过率</span>
                  <span className="font-black text-emerald-600 font-mono text-sm">9%</span>
                </div>
                <div className="rounded-xl bg-white border border-slate-100 px-3 py-2 flex items-center justify-between">
                  <span className="font-bold text-slate-600">一次性通过率</span>
                  <span className="font-black text-blue-600 font-mono text-sm">0%</span>
                </div>
              </div>
            </div>

            {/* 审核统计 */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/25 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>审核统计</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-bold">按审核任务统计</span>
              </div>

              <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 items-center">
                <div className="relative h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: '审核通过', value: 1, color: '#10B981' },
                          { name: '审核驳回', value: 1, color: '#F43F5E' },
                          { name: '待审核', value: 5, color: '#94A3B8' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={34}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {['#10B981', '#F43F5E', '#94A3B8'].map((color, index) => (
                          <Cell key={`audit-cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-slate-500 font-bold">累计审核</span>
                    <span className="text-2xl leading-none font-black text-slate-900 font-mono mt-0.5">7</span>
                    <span className="text-[10px] text-slate-400 font-bold mt-0.5">件</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs min-w-0">
                  {[
                    { name: '审核通过', value: '1件', color: '#10B981', valueClass: 'text-emerald-600' },
                    { name: '审核驳回', value: '1件', color: '#F43F5E', valueClass: 'text-rose-600' },
                    { name: '待审核', value: '5件', color: '#94A3B8', valueClass: 'text-slate-700' }
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-lg bg-white border border-slate-100 px-2.5 py-1.5 shadow-2xs">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                        <span className="font-bold text-slate-700 truncate">{item.name}</span>
                      </div>
                      <span className={`font-black font-mono ${item.valueClass}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-white border border-slate-100 px-3 py-2 flex items-center justify-between">
                  <span className="font-bold text-slate-600">平均审核响应时间</span>
                  <span className="font-black text-emerald-600 font-mono text-sm">1 h</span>
                </div>
                <div className="rounded-xl bg-white border border-slate-100 px-3 py-2 flex items-center justify-between">
                  <span className="font-bold text-slate-600">审核处理率</span>
                  <span className="font-black text-blue-600 font-mono text-sm">29%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 双轨排行榜: 人员报送排行榜 与 人员审核排行榜 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
        {/* Header & Leaderboard Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl shadow-2xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-gray-900">人员效能排行榜</h3>
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  双轨考核与先锋标兵
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setRankViewTab('submitter')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                rankViewTab === 'submitter' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-900'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-amber-500" />
              <span>人员报送排行榜</span>
            </button>
            <button
              onClick={() => setRankViewTab('auditor')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                rankViewTab === 'auditor' ? 'bg-[#1E5ABB] text-white shadow-2xs' : 'text-gray-600 hover:text-blue-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>人员审核排行榜</span>
            </button>
          </div>
        </div>

        {/* Dual Leaderboards Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* ===================== 排行榜 1: 人员报送排行榜 ===================== */}
          {rankViewTab === 'submitter' && (
            <div className="bg-slate-50/50 rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-4">


              {/* Submitter Top 3 Podium Highlights */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
                {/* Silver #2 */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-1.5 left-1.5 text-base">🥈</div>
                  <div className="w-9 h-9 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs shadow-inner mt-1">
                    {submitterRankRows[1].avatar}
                  </div>
                  <div className="font-bold text-gray-900 text-xs mt-1.5 truncate max-w-full">{submitterRankRows[1].name}</div>
                  <div className="text-[10px] text-gray-400 truncate max-w-full">{submitterRankRows[1].org}</div>
                  <div className="mt-2 text-xs font-black text-[#1E5ABB] font-mono">{submitterRankRows[1].passed}件采纳</div>
                  <div className="text-[10px] text-emerald-600 font-bold">采纳率 {submitterRankRows[1].passRate}</div>
                </div>

                {/* Gold #1 */}
                <div className="bg-gradient-to-b from-amber-50 to-white p-3 rounded-xl border-2 border-amber-300 shadow-xs flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-1 left-1.5 text-lg">🥇</div>
                  <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 text-[9px] font-black px-1.5 py-0.5 rounded-bl">
                    榜首
                  </div>
                  <div className="w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center font-bold text-amber-800 text-xs shadow-inner mt-0.5">
                    {submitterRankRows[0].avatar}
                  </div>
                  <div className="font-black text-gray-900 text-xs mt-1.5 flex items-center space-x-1 truncate max-w-full">
                    <span>{submitterRankRows[0].name.split(' ')[0]}</span>
                    <span className="text-[9px] bg-[#1E5ABB] text-white px-1 rounded font-normal">我</span>
                  </div>
                  <div className="text-[10px] text-gray-500 truncate max-w-full">{submitterRankRows[0].org}</div>
                  <div className="mt-1.5 text-xs font-black text-amber-700 font-mono">{submitterRankRows[0].passed}件采纳</div>
                  <div className="text-[10px] text-emerald-600 font-black">采纳率 {submitterRankRows[0].passRate}</div>
                </div>

                {/* Bronze #3 */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-1.5 left-1.5 text-base">🥉</div>
                  <div className="w-9 h-9 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center font-bold text-amber-700 text-xs shadow-inner mt-1">
                    {submitterRankRows[2].avatar}
                  </div>
                  <div className="font-bold text-gray-900 text-xs mt-1.5 truncate max-w-full">{submitterRankRows[2].name}</div>
                  <div className="text-[10px] text-gray-400 truncate max-w-full">{submitterRankRows[2].org}</div>
                  <div className="mt-2 text-xs font-black text-[#1E5ABB] font-mono">{submitterRankRows[2].passed}件采纳</div>
                  <div className="text-[10px] text-emerald-600 font-bold">采纳率 {submitterRankRows[2].passRate}</div>
                </div>
              </div>

              {/* Submitter Ranking Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-blue-50/70 text-gray-700 border-b border-blue-100 font-semibold">
                        <th className="py-2.5 px-3 w-14 text-center">排名</th>
                        <th className="py-2.5 px-3">报送人员</th>
                        <th className="py-2.5 px-3">所属单位</th>
                        <th className="py-2.5 px-3 text-right">上报/采纳</th>
                        <th className="py-2.5 px-3 min-w-[120px]">采纳率</th>
                        <th className="py-2.5 px-3 text-center">评级</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {submitterRankRows
                        .filter(r => r.name.includes(submitterSearch) || r.org.includes(submitterSearch))
                        .map((row) => (
                          <tr
                            key={row.rank}
                            className={`transition-colors ${
                              row.name.includes('当前账号') ? 'bg-blue-50/80 ring-1 ring-blue-200 shadow-[inset_0_0_0_1px_rgba(30,90,187,0.06)] font-semibold' : 'hover:bg-slate-50/80'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center font-mono font-bold">
                              {row.rank === 1 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black border border-amber-300">
                                  1
                                </span>
                              ) : row.rank === 2 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black border border-slate-300">
                                  2
                                </span>
                              ) : row.rank === 3 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-700 text-[11px] font-black border border-amber-200">
                                  3
                                </span>
                              ) : (
                                <span className="text-gray-400 font-mono">#{row.rank}</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center space-x-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                                  row.rank === 1 ? 'bg-amber-500' : row.rank === 2 ? 'bg-slate-500' : row.rank === 3 ? 'bg-amber-600' : 'bg-blue-500'
                                }`}>
                                  {row.avatar}
                                </div>
                                <div className="truncate flex items-center gap-1.5">
                                  <span className="font-bold text-gray-900">{row.name}</span>
                                  {row.name.includes('当前账号') && (
                                    <span className="inline-flex items-center rounded-full bg-[#1E5ABB] px-1.5 py-0.5 text-[9px] font-bold text-white shrink-0">当前账号</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-gray-500 text-[11px] truncate max-w-[120px]" title={row.org}>
                              {row.org}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              <span className="font-bold text-emerald-700">{row.passed}</span>
                              <span className="text-gray-400 text-[11px]">/{row.total}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-emerald-500 h-full rounded-full"
                                    style={{ width: row.passRate }}
                                  ></div>
                                </div>
                                <span className="font-mono font-bold text-emerald-700 w-11 text-right text-[11px]">
                                  {row.passRate}
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                                row.level === '标兵'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : row.level === '优秀'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-slate-100 text-gray-600 border-slate-200'
                              }`}>
                                {row.level}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== 排行榜 2: 人员审核排行榜 ===================== */}
          {rankViewTab === 'auditor' && (
            <div className="bg-slate-50/50 rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-4">
              {/* Board Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200/60">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 flex items-center space-x-1.5">
                      <span>人员审核排行榜</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-bold">
                        把关质效与响应
                      </span>
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">考核经办审核员把关审核总量、响应时效与督促转办闭环质效</p>
                  </div>
                </div>

                {/* Auditor Search Filter */}
                <div className="relative flex items-center bg-white border border-gray-200 rounded-lg px-2.5 py-1 shadow-2xs">
                  <Search className="w-3.5 h-3.5 text-gray-400 mr-1.5 shrink-0" />
                  <input
                    type="text"
                    placeholder="搜索审核员或单位..."
                    value={auditorSearch}
                    onChange={(e) => setAuditorSearch(e.target.value)}
                    className="w-28 sm:w-36 focus:outline-none text-xs text-gray-700 bg-transparent"
                  />
                </div>
              </div>

              {/* Auditor Top 3 Podium Highlights */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
                {/* Gold #1 */}
                <div className="bg-gradient-to-b from-emerald-50 to-white p-3 rounded-xl border-2 border-emerald-400 shadow-xs flex flex-col items-center text-center relative overflow-hidden order-2 sm:order-1">
                  <div className="absolute top-1 left-1.5 text-lg">🥇</div>
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-bl">
                    把关标兵
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center font-bold text-emerald-800 text-xs shadow-inner mt-0.5">
                    {auditorRankRows[0].avatar}
                  </div>
                  <div className="font-black text-gray-900 text-xs mt-1.5 truncate max-w-full">{auditorRankRows[0].name}</div>
                  <div className="text-[10px] text-gray-500 truncate max-w-full">{auditorRankRows[0].org}</div>
                  <div className="mt-1.5 text-xs font-black text-emerald-700 font-mono">{auditorRankRows[0].total}件经办</div>
                  <div className="text-[10px] text-purple-700 font-black">时效 {auditorRankRows[0].avgTime}</div>
                </div>

                {/* Silver #2 (Zhang San) */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col items-center text-center relative overflow-hidden order-1 sm:order-2">
                  <div className="absolute top-1.5 left-1.5 text-base">🥈</div>
                  <div className="w-9 h-9 rounded-full bg-blue-50 border-2 border-blue-300 flex items-center justify-center font-bold text-blue-700 text-xs shadow-inner mt-1">
                    {auditorRankRows[1].avatar}
                  </div>
                  <div className="font-bold text-gray-900 text-xs mt-1.5 flex items-center space-x-1 truncate max-w-full">
                    <span>{auditorRankRows[1].name.split(' ')[0]}</span>
                    <span className="text-[9px] bg-[#1E5ABB] text-white px-1 rounded font-normal">我</span>
                  </div>
                  <div className="text-[10px] text-gray-400 truncate max-w-full">{auditorRankRows[1].org}</div>
                  <div className="mt-2 text-xs font-black text-emerald-600 font-mono">{auditorRankRows[1].total}件经办</div>
                  <div className="text-[10px] text-purple-700 font-bold">时效 {auditorRankRows[1].avgTime}</div>
                </div>

                {/* Bronze #3 */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col items-center text-center relative overflow-hidden order-3">
                  <div className="absolute top-1.5 left-1.5 text-base">🥉</div>
                  <div className="w-9 h-9 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs shadow-inner mt-1">
                    {auditorRankRows[2].avatar}
                  </div>
                  <div className="font-bold text-gray-900 text-xs mt-1.5 truncate max-w-full">{auditorRankRows[2].name}</div>
                  <div className="text-[10px] text-gray-400 truncate max-w-full">{auditorRankRows[2].org}</div>
                  <div className="mt-2 text-xs font-black text-emerald-600 font-mono">{auditorRankRows[2].total}件经办</div>
                  <div className="text-[10px] text-purple-700 font-bold">时效 {auditorRankRows[2].avgTime}</div>
                </div>
              </div>

              {/* Auditor Ranking Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-emerald-50/70 text-gray-700 border-b border-emerald-100 font-semibold">
                        <th className="py-2.5 px-3 w-14 text-center">排名</th>
                        <th className="py-2.5 px-3">审核专员</th>
                        <th className="py-2.5 px-3">所属单位</th>
                        <th className="py-2.5 px-3 text-right">经办总量</th>
                        <th className="py-2.5 px-3 text-right font-mono">通过/驳回</th>
                        <th className="py-2.5 px-3 text-center">平均响应时效</th>
                        <th className="py-2.5 px-3 text-right">转办督办</th>
                        <th className="py-2.5 px-3 text-center">评级</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {auditorRankRows
                        .filter(r => r.name.includes(auditorSearch) || r.org.includes(auditorSearch))
                        .map((row) => (
                          <tr
                            key={row.rank}
                            className={`transition-colors ${
                              row.name.includes('当前账号') ? 'bg-emerald-50/80 ring-1 ring-emerald-200 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.06)] font-semibold' : 'hover:bg-slate-50/80'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center font-mono font-bold">
                              {row.rank === 1 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black border border-emerald-300">
                                  1
                                </span>
                              ) : row.rank === 2 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black border border-slate-300">
                                  2
                                </span>
                              ) : row.rank === 3 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-700 text-[11px] font-black border border-amber-200">
                                  3
                                </span>
                              ) : (
                                <span className="text-gray-400 font-mono">#{row.rank}</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center space-x-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                                  row.rank === 1 ? 'bg-emerald-600' : row.rank === 2 ? 'bg-[#1E5ABB]' : row.rank === 3 ? 'bg-indigo-600' : 'bg-slate-500'
                                }`}>
                                  {row.avatar}
                                </div>
                                <div className="truncate flex items-center gap-1.5">
                                  <span className="font-bold text-gray-900">{row.name}</span>
                                  {row.name.includes('当前账号') && (
                                    <span className="inline-flex items-center rounded-full bg-[#1E5ABB] px-1.5 py-0.5 text-[9px] font-bold text-white shrink-0">当前账号</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-gray-500 text-[11px] truncate max-w-[120px]" title={row.org}>
                              {row.org}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-800">
                              {row.total} 件
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-[11px]">
                              <span className="text-emerald-700 font-bold">{row.passed}</span>
                              <span className="text-gray-300 mx-1">/</span>
                              <span className="text-rose-600 font-bold">{row.rejected}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-mono font-bold text-[11px] border border-purple-200">
                                <Timer className="w-3 h-3 text-purple-500" />
                                <span>{row.avgTime}</span>
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                              {row.transferCount} 件
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                                row.level === '卓越'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : row.level === '优秀'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-slate-100 text-gray-600 border-slate-200'
                              }`}>
                                {row.level}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};













