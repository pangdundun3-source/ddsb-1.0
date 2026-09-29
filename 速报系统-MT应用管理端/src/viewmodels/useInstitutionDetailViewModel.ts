import { useEffect, useMemo, useRef, useState } from 'react';
import { AuditLog, DetailTab, Institution } from '../types';
import {
  calculateDays,
  calculateRemainingDays,
  formatDateTime,
  getFutureDateStr,
  getTodayStr,
} from '../shared/date';
import { adminShellStorage } from '../services/adminShellStorage';

export interface InstitutionPersonnel {
  id: number;
  avatar: string;
  nickname: string;
  name: string;
  role?: string;
  followTime: string;
  configTime?: string;
  lastLoginTime?: string;
}

export const REGION_OPTIONS = [
  '湖北/随州市',
  '湖北/武汉市',
  '湖北/襄阳市',
  '湖北/宜昌市',
  '河南/郑州市',
  '河南/商丘',
  '河南/平顶山',
  '河南/洛阳',
  '江西/吉安市/峡江县',
  '广东/佛山市',
  '广东/广州市',
  '浙江/杭州市',
  '江苏/南京市',
  '北京/北京市',
  '上海/上海市',
];

export const MT_INSTITUTION_CANDIDATES = [
  {
    name: '随州市网信中心（随州市网络安全应急指挥中心）',
    shortName: '随州市网信中心',
    category: '一类',
    industry: '网信部门',
    location: '湖北/随州市',
    salesName: '廖伟',
    salesPhone: '189****4954',
  },
  {
    name: '中共峡江县委宣传部',
    shortName: '峡江县委宣传部',
    category: '一类',
    industry: '网信部门',
    location: '江西/吉安市/峡江县',
    salesName: '张锐',
    salesPhone: '158****2653',
  },
  {
    name: '国网河南省电力公司商丘供电公司',
    shortName: '商丘供电公司',
    category: '二类',
    industry: '电力',
    location: '河南/商丘',
    salesName: '李鹏飞',
    salesPhone: '187****8601',
  },
  {
    name: '河南城建学院融媒体中心',
    shortName: '河南城建学院',
    category: '三类',
    industry: '职校高校',
    location: '河南/平顶山',
    salesName: '郭凯',
    salesPhone: '166****9070',
  },
  {
    name: '中共佛山市委网络安全和信息化委员会办公室',
    shortName: '佛山市委网信办',
    category: '一类',
    industry: '网信部门',
    location: '广东/佛山市',
    salesName: '李学坚',
    salesPhone: '186****8245',
  },
  {
    name: '中共洛阳市委网络安全和信息化委员会办公室',
    shortName: '洛阳市委网信办',
    category: '一类',
    industry: '网信部门',
    location: '河南/洛阳',
    salesName: '李龙锐',
    salesPhone: '176****3418',
  },
  {
    name: '武汉市融媒体调度指挥中心',
    shortName: '武汉融媒调度中心',
    category: '一类',
    industry: '媒体发布',
    location: '湖北/武汉市',
    salesName: '陈建国',
    salesPhone: '139****1122',
  },
  {
    name: '襄阳市融媒体传播管理中心',
    shortName: '襄阳融媒中心',
    category: '二类',
    industry: '媒体发布',
    location: '湖北/襄阳市',
    salesName: '黄立新',
    salesPhone: '137****6678',
  },
] as const;

export const AVAILABLE_ROLES = [
  { key: '机构管理员', label: '机构管理员', desc: '拥有本机构所有数据查看、配置、速报下发与成员管理最高权限', color: 'bg-blue-50 text-[#1890ff] border-blue-200' },
  { key: '速报采编员', label: '速报采编员', desc: '拥有采编速报内容、查收舆情预警、推送速报模板权限', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  { key: '舆情监测员', label: '舆情监测员', desc: '拥有查看实时舆情数据、预警提醒、生成研判简报权限', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { key: '普通成员', label: '普通成员 (仅查收)', desc: '仅可通过公众号接收速报信息推送与已授权模块查看', color: 'bg-gray-50 text-gray-600 border-gray-200' },
];

export const TRIAL_DURATION_PRESETS = [
  { label: '7天试用', days: 7 },
  { label: '15天', days: 15 },
  { label: '1个月 (30天)', days: 30 },
];

export const FORMAL_DURATION_PRESETS = [
  { label: '3个月 (季度)', days: 90 },
  { label: '半年 (180天)', days: 180 },
  { label: '1年 (365天)', days: 365 },
  { label: '2年 (730天)', days: 730 },
];

export interface DetailTabItem {
  key: DetailTab;
  label: string;
  icon: string;
}

export const INSTITUTION_DETAIL_TABS: DetailTabItem[] = [
  { key: 'basic', label: '基础信息与服务', icon: 'corporate_fare' },
  { key: 'business_rules', label: '其他业务配置', icon: 'tune' },
];

type ToastType = 'success' | 'warning';
type ServiceStatus = '试用' | '正式';

interface DetailForm {
  name: string;
  shortName: string;
  category: string;
  industry: string;
  location: string;
  salesName: string;
  salesPhone: string;
  systemName: string;
  status: ServiceStatus;
  startDate: string;
  endDate: string;
  unitName: string;
  adminName?: string;
  adminPhone?: string;
}

interface ProvisionForm {
  status: ServiceStatus;
  startDate: string;
  endDate: string;
  remark: string;
}

interface ProvisionHistory {
  id: number;
  type: ServiceStatus;
  title?: string;
  startDate: string;
  endDate: string;
  days?: number;
  operator: string;
  approver?: string;
  time: string;
  remark: string;
  status: string;
}

interface UseInstitutionDetailViewModelOptions {
  institution?: Institution | null;
  isCreateMode: boolean;
  initialIsEditing: boolean;
  onEditModeChange?: (editing: boolean) => void;
  onSave: (updatedData: Partial<Institution>) => void;
}

export const useInstitutionDetailViewModel = ({
  institution,
  isCreateMode,
  initialIsEditing,
  onEditModeChange,
  onSave,
}: UseInstitutionDetailViewModelOptions) => {
  const [isEditing, setIsEditing] = useState(isCreateMode || initialIsEditing);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: ToastType } | null>(null);
  const [personnelList, setPersonnelList] = useState<InstitutionPersonnel[]>(() =>
    isCreateMode
      ? []
      : [
          {
            id: 1,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            nickname: institution?.name ? `${institution.name.slice(0, 4)}管理` : '随州市委',
            name: '',
            role: '',
            followTime: '2026-08-20 14:34:49',
            configTime: '',
            lastLoginTime: '',
          },
          {
            id: 2,
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
            nickname: '清风随行',
            name: '李鹏程',
            role: '速报采编员',
            followTime: '2026-08-18 10:15:30',
            configTime: '2026-08-19 11:20:00',
            lastLoginTime: '2026-08-25 18:42:15',
          },
          {
            id: 3,
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
            nickname: '小舟从此逝',
            name: '张雅丽',
            role: '舆情监测员',
            followTime: '2026-08-16 09:05:12',
            configTime: '2026-08-17 14:10:45',
            lastLoginTime: '2026-08-24 09:30:18',
          },
        ]
  );
  const [isSyncingPersonnel, setIsSyncingPersonnel] = useState(false);
  const [roleModalTarget, setRoleModalTarget] = useState<InstitutionPersonnel | null>(null);
  const [editPersonnelName, setEditPersonnelName] = useState('');
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState('机构管理员');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLDivElement>(null);

  const defaultCreateData = useMemo<DetailForm>(
    () => ({
      name: '',
      shortName: '',
      category: '',
      industry: '',
      location: '',
      salesName: '',
      salesPhone: '',
      systemName: '',
      status: '试用',
      startDate: getTodayStr(),
      endDate: getFutureDateStr(30),
      unitName: '新建统筹单元',
      adminName: '',
      adminPhone: '',
    }),
    []
  );

  const createFormData = (): DetailForm =>
    institution
      ? {
          name: institution.name || '',
          shortName: institution.name || '',
          category: institution.category || '一类',
          industry: institution.industry || '网信部门',
          location: institution.location || '湖北/随州市',
          salesName: institution.salesName || '廖伟',
          salesPhone: institution.salesPhone || '189****4954',
          systemName: '融媒体速报系统',
          status: institution.status || '试用',
          startDate: institution.startDate || getTodayStr(),
          endDate: institution.endDate || getFutureDateStr(30),
          unitName: institution.unitName || '新建统筹单元',
          adminName: '',
          adminPhone: '',
        }
      : defaultCreateData;

  const [formData, setFormData] = useState<DetailForm>(createFormData);
  const [detailTab, setDetailTab] = useState<DetailTab>(() => {
    if (isCreateMode) return 'basic';
    return adminShellStorage.readInstitutionDetailTab();
  });
  const [isBasicInfoEditing, setIsBasicInfoEditing] = useState(false);
  const [provisionForm, setProvisionForm] = useState<ProvisionForm>(() => ({
    status: institution?.status || '试用',
    startDate: institution?.startDate || getTodayStr(),
    endDate: institution?.endDate || getFutureDateStr(30),
    remark: isCreateMode ? '初始化机构开通服务' : '例行开通服务授权',
  }));
  const [provisionHistory, setProvisionHistory] = useState<ProvisionHistory[]>([
    {
      id: 1,
      type: institution?.status || '正式',
      title: institution?.status === '正式' ? '正式签约年度授权' : '试用服务授权',
      startDate: institution?.startDate || '2025-09-01',
      endDate: institution?.endDate || '2026-08-31',
      days: 365,
      operator: institution?.salesName ? `${institution.salesName} (销售人员)` : '廖伟 (销售经理)',
      approver: '系统管理员 (张工)',
      time: '2025-09-01 10:24:18',
      remark: '正式客户签订年度服务合同，开通全功能授权与融媒体速报推送服务。',
      status: '生效中',
    },
    {
      id: 2,
      type: '试用',
      title: '试用延期申请',
      startDate: '2025-08-16',
      endDate: '2025-08-31',
      days: 16,
      operator: institution?.salesName ? `${institution.salesName} (销售人员)` : '廖伟 (销售经理)',
      approver: '销售总监 (王总)',
      time: '2025-08-15 16:45:12',
      remark: '客户PoC测试满意，申请延期两周走商务采购与立项审批流程。',
      status: '已到期',
    },
    {
      id: 3,
      type: '试用',
      title: '首次试用开通',
      startDate: '2025-08-01',
      endDate: '2025-08-15',
      days: 15,
      operator: '运营管理员 (李工)',
      approver: '系统管理员 (张工)',
      time: '2025-08-01 09:30:00',
      remark: '从MT系统同步线索，开通15天标准试用服务。',
      status: '已到期',
    },
  ]);

  useEffect(() => {
    setIsEditing(isCreateMode || initialIsEditing);
  }, [initialIsEditing, institution?.id, isCreateMode]);

  useEffect(() => {
    if (isCreateMode) {
      setDetailTab('basic');
      setIsEditing(true);
      setFormData(defaultCreateData);
      setProvisionForm({
        status: '试用',
        startDate: getTodayStr(),
        endDate: getFutureDateStr(30),
        remark: '初始化机构开通服务',
      });
      return;
    }
    if (institution) {
      setIsEditing(initialIsEditing);
      setFormData(createFormData());
      setProvisionForm({
        status: institution.status || '试用',
        startDate: institution.startDate || getTodayStr(),
        endDate: institution.endDate || getFutureDateStr(30),
        remark: '',
      });
    }
  }, [defaultCreateData, initialIsEditing, institution, isCreateMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (text: string, type: ToastType = 'success') => {
    setToastMsg({ text, type });
    window.setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSyncFromMT = () => {
    setIsSyncingPersonnel(true);
    showToast('正在向MT系统发起微信人员数据同步请求...', 'warning');
    window.setTimeout(() => {
      setIsSyncingPersonnel(false);
      const now = formatDateTime();
      const syncedMembers: InstitutionPersonnel[] = [
        {
          id: 1,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          nickname: formData.name ? `${formData.name.slice(0, 4)}管理` : '随州市委',
          name: '',
          role: '',
          followTime: '2026-08-20 14:34:49',
          configTime: '',
          lastLoginTime: '',
        },
        {
          id: 2,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
          nickname: '清风随行',
          name: '',
          role: '',
          followTime: now,
          configTime: '',
          lastLoginTime: '',
        },
        {
          id: 3,
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
          nickname: '小舟从此逝',
          name: '',
          role: '',
          followTime: now,
          configTime: '',
          lastLoginTime: '',
        },
      ];
      setPersonnelList(syncedMembers);
      showToast(`同步成功！已获取 ${syncedMembers.length} 位绑定微信人员，请点击【立即配置】分配角色`);
    }, 900);
  };

  const handleOpenRoleModal = (person: InstitutionPersonnel) => {
    setRoleModalTarget(person);
    setEditPersonnelName(person.name || '');
    setSelectedRoleForEdit(person.role || '机构管理员');
  };

  const handleSaveRole = () => {
    if (!roleModalTarget) return;
    setPersonnelList((prev) =>
      prev.map((item) =>
        item.id === roleModalTarget.id
          ? { ...item, name: editPersonnelName.trim() || item.name, role: selectedRoleForEdit, configTime: formatDateTime() }
          : item
      )
    );
    showToast(`已成功将【${editPersonnelName || roleModalTarget.nickname}】的角色配置为「${selectedRoleForEdit}」`);
    setRoleModalTarget(null);
  };

  const handleQuickDuration = (days: number, forceStatus?: ServiceStatus) => {
    const status = forceStatus || (days <= 30 ? '试用' : '正式');
    const startDate = formData.startDate || getTodayStr();
    const endDate = getFutureDateStr(days, new Date(startDate));
    setFormData((prev) => ({ ...prev, status, endDate }));
    setProvisionForm((prev) => ({ ...prev, status, endDate }));
  };

  const handleSwitchServiceMode = (status: ServiceStatus) => {
    const currentDays = calculateDays(formData.startDate, formData.endDate);
    if ((status === '试用' && (currentDays > 30 || currentDays === 0)) || (status === '正式' && currentDays <= 30)) {
      handleQuickDuration(status === '试用' ? 30 : 365, status);
      return;
    }
    setFormData((prev) => ({ ...prev, status }));
    setProvisionForm((prev) => ({ ...prev, status }));
  };

  const handleModalQuickDuration = (days: number, forceStatus?: ServiceStatus) => {
    const status = forceStatus || (days <= 30 ? '试用' : '正式');
    const startDate = provisionForm.startDate || getTodayStr();
    setProvisionForm((prev) => ({
      ...prev,
      status,
      startDate,
      endDate: getFutureDateStr(days, new Date(startDate)),
    }));
  };

  const handleModalSwitchStatus = (status: ServiceStatus) => {
    const currentDays = calculateDays(provisionForm.startDate, provisionForm.endDate);
    if ((status === '试用' && (currentDays > 30 || currentDays === 0)) || (status === '正式' && currentDays <= 30)) {
      handleModalQuickDuration(status === '试用' ? 30 : 365, status);
      return;
    }
    setProvisionForm((prev) => ({ ...prev, status }));
  };

  const handleSelectMTCandidate = (candidate: (typeof MT_INSTITUTION_CANDIDATES)[number]) => {
    setFormData((prev) => ({
      ...prev,
      name: candidate.name,
      shortName: candidate.shortName,
      category: candidate.category,
      industry: candidate.industry,
      location: candidate.location,
      salesName: candidate.salesName,
      salesPhone: candidate.salesPhone,
    }));
    setSearchDropdownOpen(false);
    showToast(`已从MT系统自动同步【${candidate.shortName}】的机构信息及销售对接人！`);
  };

  const filteredCandidates = MT_INSTITUTION_CANDIDATES.filter(
    (item) =>
      item.name.toLowerCase().includes(formData.name.toLowerCase()) ||
      item.shortName.toLowerCase().includes(formData.name.toLowerCase())
  );

  const handleSubmitForm = () => {
    if (!formData.name.trim()) return showToast('【基本信息】请输入或选择机构名称', 'warning');
    if (!formData.location.trim()) return showToast('【基本信息】请选择所在地区', 'warning');
    if (!formData.status) return showToast('【配置服务】请选定开通服务类型（试用服务 或 正式签约服务）', 'warning');
    if (!formData.startDate.trim()) return showToast('【配置服务】请选择服务生效日期', 'warning');
    if (!formData.endDate.trim()) return showToast('【配置服务】请选择服务到期日期', 'warning');

    const days = calculateDays(formData.startDate, formData.endDate);
    if (days <= 0) return showToast('【配置服务】服务到期日期必须晚于服务生效日期（有效天数须大于 0 天）', 'warning');
    if (formData.status === '试用' && days > 180) return showToast('【配置服务】试用服务时长过长，请核对或切换为「正式签约服务」', 'warning');

    onSave({
      ...(institution || {}),
      name: formData.name.trim(),
      category: formData.category || '一类',
      industry: formData.industry || '网信部门',
      location: formData.location.trim(),
      salesName: formData.salesName || '廖伟',
      salesPhone: formData.salesPhone || '189****4954',
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
      daysRemaining: days,
      unitName: formData.unitName || '新建统筹单元',
      enabled: institution?.enabled ?? true,
    });
    if (!isCreateMode) {
      setIsEditing(false);
      onEditModeChange?.(false);
    }
  };

  const handleConfirmProvision = () => {
    const days = calculateDays(provisionForm.startDate, provisionForm.endDate);
    if (days <= 0) return showToast('服务到期日期必须晚于生效日期！', 'warning');
    if (institution) {
      onSave({
        ...institution,
        status: provisionForm.status,
        startDate: provisionForm.startDate,
        endDate: provisionForm.endDate,
        daysRemaining: days,
        enabled: true,
      });
      setFormData((prev) => ({
        ...prev,
        status: provisionForm.status,
        startDate: provisionForm.startDate,
        endDate: provisionForm.endDate,
      }));
    }
    setProvisionHistory((prev) => [
      {
        id: Date.now(),
        type: provisionForm.status,
        startDate: provisionForm.startDate,
        endDate: provisionForm.endDate,
        operator: formData.salesName || '廖伟',
        time: formatDateTime(),
        remark: provisionForm.remark || `开通【${provisionForm.status}】服务，时间区间：${provisionForm.startDate} 至 ${provisionForm.endDate}`,
        status: '生效中',
      },
      ...prev,
    ]);
    setIsProvisioning(false);
    showToast(`成功更新机构【${provisionForm.status}】服务！有效区间：${provisionForm.startDate} 至 ${provisionForm.endDate}`);
  };

  const handleOpenProvisionModal = () => {
    setProvisionForm({
      status: formData.status || '正式',
      startDate: formData.startDate || getTodayStr(),
      endDate: formData.endDate || getFutureDateStr(formData.status === '试用' ? 30 : 365),
      remark: `为【${formData.name || '当前机构'}】办理${formData.status || '正式'}服务开通/续期授权`,
    });
    setIsProvisioning(true);
  };

  const handleDetailTabChange = (tab: DetailTab) => {
    setDetailTab(tab);
    adminShellStorage.saveInstitutionDetailTab(tab);
  };

  const mockPersonnel = [
    {
      id: 1,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      nickname: formData.shortName ? `${formData.shortName.slice(0, 4)}管理` : '随州市委',
      name: formData.shortName ? `${formData.shortName.slice(0, 4)}宣传专班` : '随州市委',
      phone: formData.salesPhone || '189****4954',
      mpName: '融媒体速报中心',
      bindTime: '2026-08-11 14:03:40',
      lastLogin: '刚刚',
    },
    {
      id: 2,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      nickname: '应急指挥岗',
      name: '周照阳',
      phone: '13297272226',
      mpName: '融媒体速报中心',
      bindTime: '2026-08-21 21:34:37',
      lastLogin: '1小时前',
    },
    {
      id: 3,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      nickname: '舆情专员-李峰',
      name: '李峰',
      phone: '138****9921',
      mpName: '融媒体速报中心',
      bindTime: '2026-08-22 09:12:00',
      lastLogin: '昨天 17:30',
    },
  ];

  const daysTotal = calculateDays(formData.startDate, formData.endDate);
  const daysRemaining = calculateRemainingDays(formData.endDate);
  const isExpired =
    !isCreateMode &&
    Boolean(
      (institution && (institution.daysRemaining <= 0 || (institution as Institution & { isExpired?: boolean }).isExpired)) ||
        (formData.endDate && new Date(formData.endDate).getTime() < new Date(getTodayStr()).getTime())
    );

  return {
    state: {
      isEditing,
      isProvisioning,
      showHistoryModal,
      toastMsg,
      personnelList,
      isSyncingPersonnel,
      roleModalTarget,
      editPersonnelName,
      selectedRoleForEdit,
      searchDropdownOpen,
      formData,
      detailTab,
      isBasicInfoEditing,
      provisionForm,
      provisionHistory,
      mockPersonnel,
      filteredCandidates,
      daysTotal,
      daysRemaining,
      isExpired,
    },
    actions: {
      setIsEditing,
      setIsProvisioning,
      setShowHistoryModal,
      setPersonnelList,
      setEditPersonnelName,
      setSelectedRoleForEdit,
      setSearchDropdownOpen,
      setFormData,
      setDetailTab,
      setIsBasicInfoEditing,
      setProvisionForm,
      setRoleModalTarget,
      handleSyncFromMT,
      handleOpenRoleModal,
      handleSaveRole,
      handleQuickDuration,
      handleSwitchServiceMode,
      handleModalQuickDuration,
      handleModalSwitchStatus,
      handleSelectMTCandidate,
      handleSubmitForm,
      handleConfirmProvision,
      handleOpenProvisionModal,
      handleDetailTabChange,
      showToast,
    },
    refs: {
      searchInputRef,
    },
    constants: {
      REGION_OPTIONS,
      AVAILABLE_ROLES,
      TRIAL_DURATION_PRESETS,
      FORMAL_DURATION_PRESETS,
    },
    derived: {
      calculateDays,
      calculateRemainingDays,
    },
  };
};
