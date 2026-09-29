import { useMemo, useState } from 'react';
import { Institution } from '../types';
import { calculateDays, calculateRemainingDays, getFutureDateStr, getTodayStr } from '../shared/date';
import { adminShellStorage } from '../services/adminShellStorage';

export type InstitutionStatusTab = 'all' | 'official' | 'trial' | 'expired';
export type ProvisionStatus = '试用' | '正式';

export interface InstitutionProvisionForm {
  status: ProvisionStatus;
  startDate: string;
  endDate: string;
}

interface UseInstitutionListViewModelOptions {
  institutions: Institution[];
  onProvisionInstitution?: (
    id: number,
    provisionData: InstitutionProvisionForm & { daysRemaining: number }
  ) => void;
}

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

export const useInstitutionListViewModel = ({
  institutions,
  onProvisionInstitution,
}: UseInstitutionListViewModelOptions) => {
  const [filterName, setFilterName] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [activeTab, setActiveTab] = useState<InstitutionStatusTab>('all');
  const [filterUnit, setFilterUnit] = useState('');
  const [provisioningTarget, setProvisioningTarget] = useState<Institution | null>(null);
  const [provisionForm, setProvisionForm] = useState<InstitutionProvisionForm>({
    status: '正式',
    startDate: getTodayStr(),
    endDate: getFutureDateStr(365),
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [jumpPageInput, setJumpPageInput] = useState('1');

  const handleOpenProvisionModal = (institution: Institution) => {
    const status: ProvisionStatus = institution.status === '试用' ? '试用' : '正式';
    setProvisionForm({
      status,
      startDate: getTodayStr(),
      endDate: getFutureDateStr(status === '试用' ? 30 : 365),
    });
    setProvisioningTarget(institution);
  };

  const handleModalSwitchStatus = (status: ProvisionStatus) => {
    const defaultDays = status === '试用' ? 30 : 365;
    const startDate = provisionForm.startDate || getTodayStr();
    setProvisionForm({
      status,
      startDate,
      endDate: getFutureDateStr(defaultDays, new Date(startDate)),
    });
  };

  const handleModalQuickDuration = (days: number, forceStatus?: ProvisionStatus) => {
    const status = forceStatus || (days <= 30 ? '试用' : '正式');
    const startDate = provisionForm.startDate || getTodayStr();
    setProvisionForm({
      status,
      startDate,
      endDate: getFutureDateStr(days, new Date(startDate)),
    });
  };

  const handleConfirmProvision = () => {
    if (!provisioningTarget) return;
    const daysRemaining = calculateDays(provisionForm.startDate, provisionForm.endDate);
    if (daysRemaining <= 0) {
      alert('服务到期日期必须晚于生效日期！');
      return;
    }

    onProvisionInstitution?.(provisioningTarget.id, {
      ...provisionForm,
      daysRemaining,
    });
    setProvisioningTarget(null);
  };

  const handleReset = () => {
    setFilterName('');
    setFilterLocation('');
    setFilterCategory('');
    setFilterUnit('');
    setActiveTab('all');
    setCurrentPage(1);
    setJumpPageInput('1');
  };

  const tabCounts = useMemo(() => {
    let official = 0;
    let trial = 0;
    let expired = 0;

    institutions.forEach((institution) => {
      if (institution.daysRemaining <= 0) expired += 1;
      else if (institution.status === '正式') official += 1;
      else if (institution.status === '试用') trial += 1;
    });

    return { all: institutions.length, official, trial, expired };
  }, [institutions]);

  const tabs = [
    { key: 'all', label: '全部', count: tabCounts.all },
    { key: 'official', label: '正式', count: tabCounts.official },
    { key: 'trial', label: '试用', count: tabCounts.trial },
    { key: 'expired', label: '已到期', count: tabCounts.expired },
  ] as const;

  const filteredInstitutions = useMemo(
    () =>
      institutions.filter((institution) => {
        const keyword = filterName.trim().toLowerCase();
        if (keyword && !institution.name.toLowerCase().includes(keyword)) return false;
        if (filterLocation && !institution.location.includes(filterLocation)) return false;
        if (filterCategory && institution.category !== filterCategory) return false;
        if (filterUnit && institution.unitName !== filterUnit) return false;
        if (activeTab === 'expired') return institution.daysRemaining <= 0;
        if (activeTab === 'official') {
          return institution.status === '正式' && institution.daysRemaining > 0;
        }
        if (activeTab === 'trial') {
          return institution.status === '试用' && institution.daysRemaining > 0;
        }
        return true;
      }),
    [activeTab, filterCategory, filterLocation, filterName, filterUnit, institutions]
  );

  const totalCount = filteredInstitutions.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInstitutions.slice(start, start + pageSize);
  }, [currentPage, filteredInstitutions, pageSize]);

  const handlePageChange = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(nextPage);
    setJumpPageInput(String(nextPage));
  };

  const handleJumpPage = () => {
    const page = Number.parseInt(jumpPageInput, 10);
    if (!Number.isNaN(page)) handlePageChange(page);
  };

  const prepareBasicDetail = () => {
    adminShellStorage.saveInstitutionDetailTab('basic');
  };

  return {
    state: {
      filterName,
      filterLocation,
      filterCategory,
      activeTab,
      filterUnit,
      provisioningTarget,
      provisionForm,
      currentPage,
      pageSize,
      jumpPageInput,
      tabs,
      filteredInstitutions,
      totalCount,
      totalPages,
      pageData,
    },
    actions: {
      setFilterName,
      setFilterLocation,
      setFilterCategory,
      setActiveTab,
      setFilterUnit,
      setProvisionForm,
      setProvisioningTarget,
      setCurrentPage,
      setPageSize,
      setJumpPageInput,
      handleOpenProvisionModal,
      handleModalSwitchStatus,
      handleModalQuickDuration,
      handleConfirmProvision,
      handleReset,
      handlePageChange,
      handleJumpPage,
      prepareBasicDetail,
    },
    derived: {
      calculateDays,
      calculateRemainingDays,
    },
  };
};
