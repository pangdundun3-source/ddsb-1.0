import { AppTab, UserRole } from '../types';

export interface RouteState {
  path: string;
  tab?: AppTab;
  isOfficialAccount?: boolean;
  isActivationH5View?: boolean;
  isLogin?: boolean;
  viewMode?: 'main' | 'notifications';
  reportId?: string;
  reportAction?: 'new' | 'edit' | 'detail';
  profileSub?: 'report' | 'audit' | 'user' | 'activation';
  auditEntry?: boolean;
}

/**
 * Parses the current window.location.hash into a structured RouteState
 */
export function parseHash(hashString?: string): RouteState {
  const rawHash = hashString !== undefined ? hashString : (typeof window !== 'undefined' ? window.location.hash : '');
  const cleanHash = rawHash.replace(/^#\/?/, '').trim();

  if (!cleanHash || cleanHash === 'oa' || cleanHash === 'official-account') {
    return { path: 'oa', isOfficialAccount: true };
  }

  if (cleanHash === 'activation' || cleanHash === 'h5-activation') {
    return { path: 'activation', isActivationH5View: true, isOfficialAccount: false };
  }

  if (cleanHash === 'login') {
    return { path: 'login', isLogin: true, isOfficialAccount: false, isActivationH5View: false };
  }

  if (cleanHash === 'notifications' || cleanHash === 'message') {
    return { path: 'notifications', viewMode: 'notifications', isOfficialAccount: false, isActivationH5View: false };
  }

  // Dashboard / Home
  if (cleanHash === 'home' || cleanHash === 'dashboard') {
    return { path: 'home', tab: 'home', isOfficialAccount: false, isActivationH5View: false };
  }

  // Report routes
  if (cleanHash === 'report') {
    return { path: 'report', tab: 'report', isOfficialAccount: false, isActivationH5View: false };
  }

  if (cleanHash === 'report/new') {
    return {
      path: 'report/new',
      tab: 'report',
      reportAction: 'new',
      isOfficialAccount: false,
      isActivationH5View: false,
    };
  }

  if (cleanHash.startsWith('report/edit/')) {
    const reportId = cleanHash.replace('report/edit/', '');
    return {
      path: cleanHash,
      tab: 'report',
      reportAction: 'edit',
      reportId,
      isOfficialAccount: false,
      isActivationH5View: false,
    };
  }

  if (cleanHash.startsWith('report/detail/')) {
    const reportId = cleanHash.replace('report/detail/', '');
    return {
      path: cleanHash,
      tab: 'report',
      reportAction: 'detail',
      reportId,
      isOfficialAccount: false,
      isActivationH5View: false,
    };
  }

  // Audit routes
  if (cleanHash === 'audit') {
    return { path: 'audit', tab: 'audit', isOfficialAccount: false, isActivationH5View: false };
  }

  if (cleanHash.startsWith('audit/detail/')) {
    const reportId = cleanHash.replace('audit/detail/', '');
    return {
      path: cleanHash,
      tab: 'audit',
      reportAction: 'detail',
      reportId,
      auditEntry: true,
      isOfficialAccount: false,
      isActivationH5View: false,
    };
  }

  // Profile routes
  if (cleanHash === 'profile') {
    return { path: 'profile', tab: 'profile', isOfficialAccount: false, isActivationH5View: false };
  }

  if (cleanHash === 'profile/user') {
    return { path: 'profile/user', tab: 'profile', profileSub: 'user', isOfficialAccount: false, isActivationH5View: false };
  }

  if (cleanHash === 'profile/activation') {
    return { path: 'profile/activation', tab: 'profile', profileSub: 'activation', isOfficialAccount: false, isActivationH5View: false };
  }

  if (cleanHash === 'profile/report') {
    return { path: 'profile/report', tab: 'profile', profileSub: 'report', isOfficialAccount: false, isActivationH5View: false };
  }

  if (cleanHash === 'profile/audit') {
    return { path: 'profile/audit', tab: 'profile', profileSub: 'audit', isOfficialAccount: false, isActivationH5View: false };
  }

  // Fallback to home if unknown route
  return { path: 'home', tab: 'home', isOfficialAccount: false, isActivationH5View: false };
}

/**
 * Builds a hash string for a state
 */
export function buildHash(state: {
  isOfficialAccount?: boolean;
  isActivationH5View?: boolean;
  isLoggedIn?: boolean;
  viewMode?: 'main' | 'notifications';
  currentTab?: AppTab;
  isCreatingNewReport?: boolean;
  editingReportId?: string | null;
  selectedReportId?: string | null;
  selectedReportEntry?: 'report_pending' | 'audit_pending' | null;
  isProfileDetail?: boolean;
  isActivationDetail?: boolean;
  profileSubPage?: 'report' | 'audit' | 'notifications' | null;
}): string {
  if (state.isActivationH5View) {
    return '#/activation';
  }
  if (state.isOfficialAccount) {
    return '#/';
  }
  if (state.isLoggedIn === false) {
    return '#/login';
  }
  if (state.viewMode === 'notifications' || state.profileSubPage === 'notifications') {
    return '#/notifications';
  }
  if (state.selectedReportId) {
    if (state.currentTab === 'audit' || state.selectedReportEntry === 'audit_pending') {
      return `#/audit/detail/${state.selectedReportId}`;
    }
    return `#/report/detail/${state.selectedReportId}`;
  }
  if (state.isCreatingNewReport) {
    return '#/report/new';
  }
  if (state.editingReportId) {
    return `#/report/edit/${state.editingReportId}`;
  }
  if (state.currentTab === 'profile') {
    if (state.isProfileDetail) return '#/profile/user';
    if (state.isActivationDetail) return '#/profile/activation';
    if (state.profileSubPage === 'report') return '#/profile/report';
    if (state.profileSubPage === 'audit') return '#/profile/audit';
    return '#/profile';
  }
  if (state.currentTab === 'audit') {
    return '#/audit';
  }
  if (state.currentTab === 'report') {
    return '#/report';
  }
  return '#/home';
}
