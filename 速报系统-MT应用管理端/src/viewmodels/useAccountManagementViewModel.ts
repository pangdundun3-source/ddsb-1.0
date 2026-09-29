import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { SystemAccountUser, SystemRoleType } from '../types';
import {
  initialSystemAccounts,
  systemDepartmentOptions,
  systemRoleOptions,
} from '../components/system/systemData';

export interface AccountFormState {
  name: string;
  username: string;
  wechat: string;
  gender: 'male' | 'female';
  phone: string;
  email: string;
  dept: string;
  roleId: SystemRoleType;
  dataScope: 'all' | 'formal_only' | 'regional' | 'custom';
  mfaEnabled: boolean;
  ipWhitelist: string;
  remarks: string;
}

const emptyFormState = (): AccountFormState => ({
  name: '',
  username: '',
  wechat: '',
  gender: 'male',
  phone: '',
  email: '',
  dept: systemDepartmentOptions[0],
  roleId: 'ops_admin',
  dataScope: 'all',
  mfaEnabled: true,
  ipWhitelist: '',
  remarks: '',
});

const getDataScopeDesc = (scope: AccountFormState['dataScope']) => {
  if (scope === 'formal_only') return '仅限正式签约生效机构数据';
  if (scope === 'regional') return '所属大区及指定省市机构数据';
  if (scope === 'custom') return '自定义指定机构白名单权限';
  return '全网所有机构与系统设置 (无限制)';
};

export const useAccountManagementViewModel = (onShowToast?: (msg: string) => void) => {
  const [accounts, setAccounts] = useState<SystemAccountUser[]>(initialSystemAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SystemAccountUser | null>(null);
  const [resettingAccount, setResettingAccount] = useState<SystemAccountUser | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<SystemAccountUser | null>(null);
  const [batchDeleteModalOpen, setBatchDeleteModalOpen] = useState(false);
  const [viewingPermissionsAccount, setViewingPermissionsAccount] = useState<SystemAccountUser | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [mustChangePasswordOnLogin, setMustChangePasswordOnLogin] = useState(true);
  const [formState, setFormState] = useState<AccountFormState>(emptyFormState);

  const notify = (message: string) => onShowToast?.(message);

  const filteredAccounts = useMemo(() => {
    const keyword = searchTerm.toLowerCase();
    return accounts.filter((account) => {
      const matchSearch =
        account.name.toLowerCase().includes(keyword) ||
        account.username.toLowerCase().includes(keyword) ||
        Boolean(account.wechat?.toLowerCase().includes(keyword)) ||
        Boolean(account.jobNumber?.toLowerCase().includes(keyword)) ||
        account.phone.includes(searchTerm);
      return (
        matchSearch &&
        (selectedRole === 'all' || account.roleId === selectedRole) &&
        (selectedDept === 'all' || account.dept === selectedDept) &&
        (selectedStatus === 'all' || account.status === selectedStatus)
      );
    });
  }, [accounts, searchTerm, selectedRole, selectedDept, selectedStatus]);

  const metrics = {
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter((account) => account.status === 'active').length,
    disabledAccounts: accounts.filter((account) => account.status === 'disabled').length,
    mfaCount: accounts.filter((account) => account.mfaEnabled).length,
  };

  const handleOpenCreateModal = () => {
    setEditingAccount(null);
    setFormState(emptyFormState());
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (account: SystemAccountUser) => {
    setEditingAccount(account);
    setFormState({
      name: account.name,
      username: account.username,
      wechat: account.wechat || '',
      gender: account.gender,
      phone: account.phone,
      email: account.email,
      dept: account.dept,
      roleId: account.roleId,
      dataScope: account.dataScope,
      mfaEnabled: account.mfaEnabled,
      ipWhitelist: account.ipWhitelist || '',
      remarks: account.remarks || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveAccount = (event: FormEvent) => {
    event.preventDefault();
    if (!formState.name.trim() || !formState.username.trim()) {
      notify('请完整填写姓名与登录账号');
      return;
    }
    const role = systemRoleOptions.find((item) => item.id === formState.roleId);
    const accountFields = {
      ...formState,
      roleName: role?.name || '管理人员',
      roleBadgeColor: role?.color || 'bg-gray-50 text-gray-700 border-gray-200',
      dataScopeDesc: getDataScopeDesc(formState.dataScope),
    };

    if (editingAccount) {
      setAccounts((prev) =>
        prev.map((account) =>
          account.id === editingAccount.id ? { ...account, ...accountFields } : account
        )
      );
      notify(`已成功更新账号【${formState.name} (${formState.username})】信息`);
    } else {
      const newAccount: SystemAccountUser = {
        id: `ACC-${String(accounts.length + 1).padStart(3, '0')}`,
        ...accountFields,
        status: 'active',
        lastLoginTime: '从未登录',
        lastLoginIp: '--',
        lastLoginLocation: '--',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        permissions: ['基础业务查看', '本部门报表检索'],
      };
      setAccounts((prev) => [newAccount, ...prev]);
      notify(`已成功创建新管理账号【${newAccount.name} (${newAccount.username})】`);
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (account: SystemAccountUser) => {
    const nextStatus = account.status === 'active' ? 'disabled' : 'active';
    setAccounts((prev) =>
      prev.map((item) => (item.id === account.id ? { ...item, status: nextStatus } : item))
    );
    notify(`已将账号【${account.name}】状态更改为：${nextStatus === 'active' ? '正常启用' : '已冻结禁用'}`);
  };

  const handleDeleteAccount = (account: SystemAccountUser) => {
    if (account.roleId === 'super_admin') return notify('超级管理员账号受系统核心保护，不可删除！');
    if (account.status === 'active') return notify('启用状态的账号不支持删除，请先在状态开关中将其禁用！');
    setDeletingAccount(account);
  };

  const handleConfirmDeleteAccount = () => {
    if (!deletingAccount) return;
    const target = deletingAccount;
    setAccounts((prev) => prev.filter((account) => account.id !== target.id));
    setSelectedAccountIds((prev) => prev.filter((id) => id !== target.id));
    notify(`已成功永久删除账号【${target.name} (${target.username})】`);
    setDeletingAccount(null);
  };

  const handleBatchDeleteDisabled = () => setBatchDeleteModalOpen(true);

  const handleConfirmBatchDelete = () => {
    const targets = accounts.filter(
      (account) =>
        selectedAccountIds.includes(account.id) &&
        account.status === 'disabled' &&
        account.roleId !== 'super_admin'
    );
    if (!targets.length) return setBatchDeleteModalOpen(false);
    const ids = new Set(targets.map((account) => account.id));
    setAccounts((prev) => prev.filter((account) => !ids.has(account.id)));
    setSelectedAccountIds((prev) => prev.filter((id) => !ids.has(id)));
    notify(`已成功批量删除 ${targets.length} 个已禁用账号`);
    setBatchDeleteModalOpen(false);
  };

  const handleOpenResetPassword = (account: SystemAccountUser) => {
    setResettingAccount(account);
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = 'Mt#';
    for (let index = 0; index < 7; index += 1) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(`${password}@2026`);
    setMustChangePasswordOnLogin(true);
  };

  const handleConfirmResetPassword = () => {
    if (!resettingAccount) return;
    notify(`已成功重置【${resettingAccount.name}】的登录密码为：${generatedPassword}`);
    setResettingAccount(null);
  };

  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedAccountIds(event.target.checked ? filteredAccounts.map((account) => account.id) : []);
  };

  const handleSelectOne = (id: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchEnable = () => {
    if (!selectedAccountIds.length) return;
    const ids = new Set(selectedAccountIds);
    setAccounts((prev) => prev.map((account) => (ids.has(account.id) ? { ...account, status: 'active' } : account)));
    notify(`已批量启用 ${selectedAccountIds.length} 个账号`);
    setSelectedAccountIds([]);
  };

  const handleBatchDisable = () => {
    if (!selectedAccountIds.length) return;
    const ids = new Set(selectedAccountIds);
    setAccounts((prev) =>
      prev.map((account) =>
        ids.has(account.id) && account.roleId !== 'super_admin'
          ? { ...account, status: 'disabled' }
          : account
      )
    );
    notify('已批量冻结选中的账号');
    setSelectedAccountIds([]);
  };

  return {
    state: {
      accounts,
      searchTerm,
      selectedRole,
      selectedDept,
      selectedStatus,
      selectedAccountIds,
      isModalOpen,
      editingAccount,
      resettingAccount,
      deletingAccount,
      batchDeleteModalOpen,
      viewingPermissionsAccount,
      generatedPassword,
      mustChangePasswordOnLogin,
      formState,
      filteredAccounts,
      ...metrics,
    },
    actions: {
      setSearchTerm,
      setSelectedRole,
      setSelectedDept,
      setSelectedStatus,
      setSelectedAccountIds,
      setIsModalOpen,
      setResettingAccount,
      setDeletingAccount,
      setBatchDeleteModalOpen,
      setViewingPermissionsAccount,
      setMustChangePasswordOnLogin,
      setFormState,
      handleOpenCreateModal,
      handleOpenEditModal,
      handleSaveAccount,
      handleToggleStatus,
      handleDeleteAccount,
      handleConfirmDeleteAccount,
      handleBatchDeleteDisabled,
      handleConfirmBatchDelete,
      handleOpenResetPassword,
      handleConfirmResetPassword,
      handleSelectAll,
      handleSelectOne,
      handleBatchEnable,
      handleBatchDisable,
      notify,
    },
  };
};
