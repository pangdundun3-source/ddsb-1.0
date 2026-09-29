import { useMemo, useState } from 'react';
import { ActiveTab, ExpiringInstitution } from '../types';
import { formatDateTime } from '../shared/date';

interface UseDashboardHomeViewModelOptions {
  expiringInstitutions: ExpiringInstitution[];
  setActiveTab: (tab: ActiveTab) => void;
}

export const useDashboardHomeViewModel = ({
  expiringInstitutions,
}: UseDashboardHomeViewModelOptions) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [jumpPage, setJumpPage] = useState('1');
  const [isExporting, setIsExporting] = useState(false);

  const total = expiringInstitutions.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentList = useMemo(() => {
    return expiringInstitutions.slice(startIndex, startIndex + pageSize);
  }, [expiringInstitutions, pageSize, startIndex]);

  const handleExport = () => {
    setIsExporting(true);
    try {
      const headers = [
        '序号',
        '机构名称',
        '机构状态',
        '所属区域',
        '机构类别',
        '行业类别',
        '销售负责人',
        '销售电话',
        '服务开始日期',
        '服务结束日期',
        '到期倒计时',
      ];
      const rows = expiringInstitutions.map((item, index) => [
        index + 1,
        `"${item.name.replace(/"/g, '""')}"`,
        item.status,
        `"${item.region}"`,
        item.category,
        item.industry,
        item.salesName,
        item.salesPhone,
        item.startDate || '2026-08-24',
        item.endDate || item.expireTime.slice(0, 10),
        item.isExpired || item.countdownText === '已到期' || item.countdownText === '已过期'
          ? '已到期'
          : item.countdownText || `${item.daysRemaining}天`,
      ]);
      const csv = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `近1个月到期机构数据_${formatDateTime().substring(0, 10).replace(/-/g, '')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      window.setTimeout(() => setIsExporting(false), 1500);
    }
  };

  const handlePageChange = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(nextPage);
    setJumpPage(String(nextPage));
  };

  const handleJumpPage = () => {
    const page = Number.parseInt(jumpPage, 10);
    if (!Number.isNaN(page)) handlePageChange(page);
  };

  return {
    state: { currentPage, pageSize, jumpPage, isExporting, total, totalPages, startIndex, currentList },
    actions: {
      setPageSize: (size: number) => {
        setPageSize(size);
        handlePageChange(1);
      },
      setJumpPage,
      handleExport,
      handlePageChange,
      handleJumpPage,
    },
  };
};
