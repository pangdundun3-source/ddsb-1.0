import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Institution,
  QrCodeUsageConfig,
  QrQuotaAddRecord,
} from '../types';
import { formatDateTime } from '../shared/date';

export interface BoundPersonnel {
  id: string;
  name: string;
  department: string;
  role: string;
  phone: string;
  bindTime: string;
  status: 'active' | 'suspended';
}

interface UseQrQuotaViewModelOptions {
  institution?: Institution | null;
  qrConfig?: QrCodeUsageConfig;
  defaultHistory: QrQuotaAddRecord[];
  defaultPersonnel: BoundPersonnel[];
  onChangeQrConfig: (config: QrCodeUsageConfig) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const useQrQuotaViewModel = ({
  institution,
  qrConfig,
  defaultHistory,
  defaultPersonnel,
  onChangeQrConfig,
  showToast,
}: UseQrQuotaViewModelOptions) => {
  const initialQuota = qrConfig?.initialQuota ?? 20;
  const [totalLimit, setTotalLimit] = useState(qrConfig?.totalLimit ?? 50);
  const [usedCount, setUsedCount] = useState(qrConfig?.usedCount ?? 18);
  const [history, setHistory] = useState<QrQuotaAddRecord[]>(
    qrConfig?.historyRecords?.length ? qrConfig.historyRecords : defaultHistory
  );
  const [activeSubTab, setActiveSubTab] = useState<'personnel' | 'records'>('personnel');
  const [personnelSearch, setPersonnelSearch] = useState('');
  const [boundPersonnel, setBoundPersonnel] = useState(defaultPersonnel);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addAmount, setAddAmount] = useState(20);
  const [addReason, setAddReason] = useState('机构采编通讯团队扩充');
  const [operatorName, setOperatorName] = useState('系统管理员');

  const remainingCount = Math.max(0, totalLimit - usedCount);
  const usagePercentage =
    totalLimit > 0 ? (Math.round((usedCount / totalLimit) * 1000) / 10).toFixed(1) : '0.0';

  const filteredPersonnel = useMemo(() => {
    if (!personnelSearch.trim()) return boundPersonnel;
    const query = personnelSearch.toLowerCase();
    return boundPersonnel.filter(
      (person) =>
        person.name.toLowerCase().includes(query) ||
        person.department.toLowerCase().includes(query) ||
        person.role.toLowerCase().includes(query) ||
        person.phone.includes(query)
    );
  }, [boundPersonnel, personnelSearch]);

  const handleUnbindPersonnel = (id: string, name: string) => {
    const newUsed = Math.max(0, usedCount - 1);
    const updatedPersonnel = boundPersonnel.filter((person) => person.id !== id);
    setBoundPersonnel(updatedPersonnel);
    setUsedCount(newUsed);
    onChangeQrConfig({ initialQuota, totalLimit, usedCount: newUsed, historyRecords: history });
    showToast(`已成功解绑人员【${name}】，名额已释放并恢复可用`, 'success');
  };

  const handleConfirmAddQuota = (event?: FormEvent) => {
    if (event) event.preventDefault();
    const amount = Number(addAmount);
    if (!amount || amount <= 0) {
      showToast('请输入有效的增加额度数量（必须大于0）', 'warning');
      return;
    }

    const previousLimit = totalLimit;
    const newTotal = previousLimit + amount;
    const newRecord: QrQuotaAddRecord = {
      id: `REC-${Date.now().toString().slice(-8)}`,
      addAmount: amount,
      previousLimit,
      newLimit: newTotal,
      reason: addReason.trim() || '机构日常扩充追加',
      operator: operatorName.trim() || '系统管理员',
      createdAt: formatDateTime(),
    };
    const updatedHistory = [newRecord, ...history];

    setTotalLimit(newTotal);
    setHistory(updatedHistory);
    onChangeQrConfig({ initialQuota, totalLimit: newTotal, usedCount, historyRecords: updatedHistory });
    setShowAddModal(false);
    showToast(
      `已成功新增 ${amount} 个激活码名额！当前总名额为 ${newTotal} 个。`,
      'success'
    );
  };

  return {
    state: {
      initialQuota,
      totalLimit,
      usedCount,
      history,
      activeSubTab,
      personnelSearch,
      boundPersonnel,
      showAddModal,
      addAmount,
      addReason,
      operatorName,
      remainingCount,
      usagePercentage,
      filteredPersonnel,
    },
    actions: {
      setActiveSubTab,
      setPersonnelSearch,
      setShowAddModal,
      setAddAmount,
      setAddReason,
      setOperatorName,
      handleUnbindPersonnel,
      handleConfirmAddQuota,
    },
  };
};
