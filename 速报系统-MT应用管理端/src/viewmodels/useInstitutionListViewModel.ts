import { useMemo, useState } from 'react';
import { alertDialog } from '../components/common/ConfirmDialog';
import { Institution } from '../types';
import { calculateDays, calculateRemainingDays, getFutureDateStr, getTodayStr } from '../shared/date';
import { adminShellStorage } from '../services/adminShellStorage';

export type InstitutionStatusTab = 'all' | 'official' | 'trial' | 'expired';
export type ProvisionStatus = '试用' | '正式';
export type VersionAuthFilter = '' | '正式' | '试用';
export type AppStatusFilter = '' | 'opened' | 'expired';

export interface InstitutionProvisionForm {
  status: ProvisionStatus;
  startDate: string;
  endDate: string;
}

export interface AuthorizeCandidate {
  id: string;
  shortName: string;
  fullName: string;
  creditCode: string;
  unitName: string;
  salesName: string;
  salesPhone: string;
  location: string;
  category: string;
  industry: string;
  customerCode?: string;
  /** 已开通时对应的机构 ID，可直达管理 */
  openedInstitutionId?: number;
}

const PROVINCE_CODES: Record<string, string> = {
  河南: 'HA',
  陕西: 'SN',
  甘肃: 'GS',
  江西: 'JX',
  广东: 'GD',
  湖北: 'HB',
  四川: 'SC',
  北京: 'BJ',
  上海: 'SH',
  浙江: 'ZJ',
};

export const buildCustomerCode = (location: string, seq: number) => {
  const province = location.split('/')[0] || '';
  return `CUST-${PROVINCE_CODES[province] || 'CN'}-${String(seq).padStart(3, '0')}`;
};

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

/** 尚未开通应用的客户机构（检索候选） */
export const UNAUTHORIZED_CANDIDATES: AuthorizeCandidate[] = [
  {
    id: 'c1',
    shortName: '中铁七局',
    fullName: '中铁七局集团有限公司',
    creditCode: '91410000170083437X',
    unitName: '康亲总部',
    salesName: '夏小花',
    salesPhone: '138****6621',
    location: '河南/郑州',
    category: '一类',
    industry: '工程建设',
  },
  {
    id: 'c2',
    shortName: '91610部队',
    fullName: '中国人民解放军91610部队',
    creditCode: '12100000400001234A',
    unitName: '洛阳网信办',
    salesName: '廖伟',
    salesPhone: '189****4954',
    location: '河南/洛阳',
    category: '一类',
    industry: '网信部门',
  },
  {
    id: 'c3',
    shortName: '西安高新',
    fullName: '西安高新技术产业开发区管理委员会',
    creditCode: '11610131016012345B',
    unitName: '康亲总部',
    salesName: '夏小花',
    salesPhone: '138****6621',
    location: '陕西/西安',
    category: '一类',
    industry: '政务',
  },
  {
    id: 'c4',
    shortName: '峡江网信',
    fullName: '峡江县网络安全和信息化委员会办公室',
    creditCode: '11360923005456789C',
    unitName: '峡江网信单元',
    salesName: '王凯',
    salesPhone: '155****8820',
    location: '江西/吉安',
    category: '二类',
    industry: '网信部门',
  },
  {
    id: 'c5',
    shortName: '佛山网信中心',
    fullName: '佛山市网络安全和信息化中心',
    creditCode: '11440600007890123D',
    unitName: '佛山网信中心',
    salesName: '陈静',
    salesPhone: '136****4412',
    location: '广东/佛山',
    category: '一类',
    industry: '网信部门',
  },
  {
    id: 'c6',
    shortName: '商丘分局',
    fullName: '商丘市公安局网安分局',
    creditCode: '11411400003214567E',
    unitName: '商丘分单元',
    salesName: '赵磊',
    salesPhone: '177****9033',
    location: '河南/商丘',
    category: '二类',
    industry: '网安部门',
  },
];

export const UNIT_OPTIONS = [
  '康亲总部',
  '商丘分单元',
  '城建大楼单元',
  '峡江网信单元',
  '佛山网信中心',
  '随州宣传单元',
  '洛阳网信办',
  '四川公安网安组',
];

export const yearEndDate = (year: number) => `${year}-12-31`;

export type ServiceSortOrder = 'none' | 'asc' | 'desc';

export interface InstitutionProfile {
  customerCode: string;
  fullName: string;
  creditCode: string;
  createdAt: string;
  region: string;
  level: string;
  unitName: string;
  customerClass: string;
  salesName: string;
}

const CREDIT_CODE_CHARS = '0123456789ABCDEFGHJKLMNPQRTUWXY';

const mockCreditCode = (seed: number) => {
  let code = '91';
  let value = Math.abs(seed * 7919 + 104729);
  for (let i = 0; i < 16; i += 1) {
    code += CREDIT_CODE_CHARS[value % CREDIT_CODE_CHARS.length];
    value = Math.floor(value / 3) + i * 131;
  }
  return code;
};

export const getInstitutionProfile = (institution: Institution): InstitutionProfile => {
  const regionParts = institution.location.split('/').filter(Boolean);
  const level = regionParts.length >= 3 ? '区县级' : regionParts.length === 2 ? '地市级' : '省级';
  return {
    customerCode: buildCustomerCode(institution.location, institution.id % 1000),
    fullName: institution.fullName || institution.name,
    creditCode: institution.creditCode || mockCreditCode(institution.id),
    createdAt: `${institution.createdAt || institution.startDate} 09:15:22`,
    region: regionParts.join(' · '),
    level,
    unitName: institution.unitName || '—',
    customerClass: `${institution.category}客户`,
    salesName: institution.salesName,
  };
};

export const useInstitutionListViewModel = ({
  institutions,
  onProvisionInstitution,
}: UseInstitutionListViewModelOptions) => {
  const [filterName, setFilterName] = useState('');
  const [filterManager, setFilterManager] = useState('');
  const [filterVersion, setFilterVersion] = useState<VersionAuthFilter>('');
  const [filterAppStatus, setFilterAppStatus] = useState<AppStatusFilter>('');
  const [filterUnit, setFilterUnit] = useState('');
  const [filterCreditCode, setFilterCreditCode] = useState('');
  const [sortOrder, setSortOrder] = useState<ServiceSortOrder>('none');
  const [provisioningTarget, setProvisioningTarget] = useState<Institution | null>(null);
  const [provisionForm, setProvisionForm] = useState<InstitutionProvisionForm>({
    status: '正式',
    startDate: getTodayStr(),
    endDate: getFutureDateStr(365),
  });
  const [authorizeOpen, setAuthorizeOpen] = useState(false);
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
      alertDialog('服务到期日期必须晚于生效日期！');
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
    setFilterManager('');
    setFilterVersion('');
    setFilterAppStatus('');
    setFilterUnit('');
    setFilterCreditCode('');
    setSortOrder('none');
    setCurrentPage(1);
    setJumpPageInput('1');
  };

  const summary = useMemo(() => {
    let official = 0;
    let trial = 0;
    let expired = 0;
    let opened = 0;

    institutions.forEach((institution) => {
      if (institution.daysRemaining <= 0) {
        expired += 1;
      } else {
        opened += 1;
        if (institution.status === '正式') official += 1;
        else trial += 1;
      }
    });

    return { total: institutions.length, opened, official, trial, expired };
  }, [institutions]);

  const unitOptions = useMemo(() => {
    const fromData = institutions.map((item) => item.unitName).filter(Boolean) as string[];
    return Array.from(new Set([...UNIT_OPTIONS, ...fromData]));
  }, [institutions]);

  const availableCandidates = useMemo(() => {
    const openedNames = new Set(institutions.map((item) => item.name));
    return UNAUTHORIZED_CANDIDATES.filter(
      (item) => !openedNames.has(item.shortName) && !openedNames.has(item.fullName)
    ).map((item, index) => ({
      ...item,
      customerCode: item.customerCode || buildCustomerCode(item.location, institutions.length + index + 1),
    }));
  }, [institutions]);

  const authorizeOptions = useMemo<AuthorizeCandidate[]>(() => {
    const opened = institutions.map((institution) => {
      const profile = getInstitutionProfile(institution);
      return {
        id: `inst-${institution.id}`,
        shortName: institution.name,
        fullName: profile.fullName,
        creditCode: profile.creditCode,
        unitName: institution.unitName || '',
        salesName: institution.salesName,
        salesPhone: institution.salesPhone,
        location: institution.location,
        category: institution.category,
        industry: institution.industry,
        customerCode: profile.customerCode,
        openedInstitutionId: institution.id,
      };
    });
    return [...availableCandidates, ...opened];
  }, [availableCandidates, institutions]);

  const filteredInstitutions = useMemo(
    () =>
      institutions.filter((institution) => {
        const keyword = filterName.trim().toLowerCase();
        if (
          keyword &&
          !institution.name.toLowerCase().includes(keyword) &&
          !(institution.unitName || '').toLowerCase().includes(keyword)
        ) {
          return false;
        }
        if (filterManager.trim() && !institution.salesName.includes(filterManager.trim())) {
          return false;
        }
        if (filterUnit.trim() && !(institution.unitName || '').includes(filterUnit.trim())) return false;
        if (
          filterCreditCode.trim() &&
          !getInstitutionProfile(institution).creditCode.toUpperCase().includes(filterCreditCode.trim().toUpperCase())
        ) {
          return false;
        }
        if (filterVersion && institution.status !== filterVersion) return false;
        if (filterAppStatus === 'opened' && institution.daysRemaining <= 0) return false;
        if (filterAppStatus === 'expired' && institution.daysRemaining > 0) return false;
        return true;
      }).sort((a, b) => {
        if (sortOrder === 'none') return 0;
        const diff = a.endDate.localeCompare(b.endDate);
        return sortOrder === 'asc' ? diff : -diff;
      }),
    [filterAppStatus, filterCreditCode, filterManager, filterName, filterUnit, filterVersion, institutions, sortOrder]
  );

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none'));
  };

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
      filterManager,
      filterVersion,
      filterAppStatus,
      filterUnit,
      filterCreditCode,
      sortOrder,
      provisioningTarget,
      provisionForm,
      authorizeOpen,
      currentPage,
      pageSize,
      jumpPageInput,
      summary,
      unitOptions,
      availableCandidates,
      authorizeOptions,
      filteredInstitutions,
      totalCount,
      totalPages,
      pageData,
    },
    actions: {
      setFilterName,
      setFilterManager,
      setFilterVersion,
      setFilterAppStatus,
      setFilterUnit,
      setFilterCreditCode,
      toggleSortOrder,
      setProvisionForm,
      setProvisioningTarget,
      setAuthorizeOpen,
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
