import { useMemo, useState } from 'react';
import { SystemLogCategory, SystemLogItem } from '../types';
import { initialSystemLogs } from '../components/system/systemData';
import { formatDateTime, getTodayStr } from '../shared/date';

type LogTab = 'login' | 'audit';
type TimeRange = 'today' | '7days' | '30days' | 'all';

export const useSystemLogsViewModel = (onShowToast?: (msg: string) => void) => {
  const [activeCategory, setActiveCategory] = useState<LogTab>('login');
  const [logs] = useState<SystemLogItem[]>(initialSystemLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [viewingLog, setViewingLog] = useState<SystemLogItem | null>(null);

  const filteredLogs = useMemo(() => {
    const keyword = searchTerm.toLowerCase();
    return logs.filter((log) => {
      const matchSearch =
        log.operator.toLowerCase().includes(keyword) ||
        Boolean(log.operatorUsername?.toLowerCase().includes(keyword)) ||
        Boolean(log.operatorJobNo?.toLowerCase().includes(keyword)) ||
        log.action.toLowerCase().includes(keyword) ||
        log.target.toLowerCase().includes(keyword) ||
        log.ip.includes(searchTerm) ||
        log.id.toLowerCase().includes(keyword);
      const today = new Date(`${getTodayStr()}T00:00:00`).getTime();
      const logTime = new Date(log.time.replace(' ', 'T')).getTime();
      const rangeStart =
        timeRange === 'today'
          ? today
          : timeRange === '7days'
          ? today - 6 * 24 * 60 * 60 * 1000
          : timeRange === '30days'
          ? today - 29 * 24 * 60 * 60 * 1000
          : Number.NEGATIVE_INFINITY;
      const matchTime = logTime >= rangeStart;
      return (
        log.category === activeCategory &&
        matchSearch &&
        matchTime &&
        (selectedModule === 'all' || log.module === selectedModule) &&
        (selectedStatus === 'all' || log.status === selectedStatus)
      );
    });
  }, [activeCategory, logs, searchTerm, selectedModule, selectedStatus, timeRange]);

  const categories = [
    {
      id: 'login' as const,
      name: '登录日志',
      icon: 'login',
      count: logs.filter((log) => log.category === 'login').length,
      desc: '用户与管理员登录、登出、MFA双因子核验、异地登录预警与高危爆破拦截记录',
    },
    {
      id: 'audit' as const,
      name: '操作日志',
      icon: 'manage_search',
      count: logs.filter((log) => log.category === 'audit').length,
      desc: '管理员业务配置、机构录入变更、规则调整、账号启禁与数据导出等操作行为轨迹',
    },
  ];

  const availableModules = Array.from(
    new Set(logs.filter((log) => log.category === activeCategory).map((log) => log.module))
  );

  const handleCategoryChange = (category: LogTab) => {
    setActiveCategory(category);
    setSelectedModule('all');
    setSelectedStatus('all');
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedModule('all');
    setSelectedStatus('all');
  };

  const handleExportLogs = () => {
    const headers =
      activeCategory === 'login'
        ? '日志编号,登录时间,账号/人员,工号,部门,角色,IP地址,归属地,操作系统,浏览器,执行结果\n'
        : '日志编号,操作时间,操作人,工号,部门,角色,业务模块,操作动作,操作目标,IP地址,归属地,执行结果,耗时(ms)\n';
    const rows = filteredLogs
      .map((log) =>
        activeCategory === 'login'
          ? `"${log.id}","${log.time}","${log.operator}","${log.operatorJobNo || '--'}","${log.department}","${log.role}","${log.ip}","${log.location}","${log.os || '--'}","${log.browser || '--'}","${log.status}"`
          : `"${log.id}","${log.time}","${log.operator}","${log.operatorJobNo || '--'}","${log.department}","${log.role}","${log.module}","${log.action}","${log.target.replace(/"/g, '""')}","${log.ip}","${log.location}","${log.status}","${log.durationMs || 0}"`
      )
      .join('\n');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MT_速报系统_${activeCategory === 'login' ? '登录日志' : '操作日志'}_${formatDateTime().substring(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast?.(`已成功导出 ${filteredLogs.length} 条【${categories.find((item) => item.id === activeCategory)?.name}】数据文件`);
  };

  return {
    state: {
      activeCategory,
      logs,
      searchTerm,
      selectedModule,
      selectedStatus,
      timeRange,
      viewingLog,
      filteredLogs,
      categories,
      availableModules,
    },
    actions: {
      setSearchTerm,
      setSelectedModule,
      setSelectedStatus,
      setTimeRange,
      setViewingLog,
      handleCategoryChange,
      handleResetFilters,
      handleExportLogs,
      notify: onShowToast || (() => undefined),
    },
  };
};
