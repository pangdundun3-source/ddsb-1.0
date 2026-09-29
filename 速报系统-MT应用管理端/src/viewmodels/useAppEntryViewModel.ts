import { useCallback, useEffect, useRef, useState } from 'react';
import { authStorage } from '../services/authStorage';
import { hashRouter } from '../services/hashRouter';
import { adminShellStorage } from '../services/adminShellStorage';

export type LoginPhase = 'waiting' | 'scanning' | 'authenticated';
export type AppActiveView = 'portal' | 'operation';

const getInitialEntryState = () => {
  const parsed = hashRouter.parseRoute();
  if (parsed.routeType === 'login') {
    return { isAuthenticated: false, activeView: 'portal' as AppActiveView };
  }
  if (parsed.routeType === 'portal') {
    return { isAuthenticated: true, activeView: 'portal' as AppActiveView };
  }
  if (parsed.activeTab) {
    return { isAuthenticated: true, activeView: 'operation' as AppActiveView };
  }

  // Fallback to storage or default
  const savedAuth = authStorage.readIsAuthenticated();
  const savedView = authStorage.readActiveView();
  return {
    isAuthenticated: savedAuth ?? true,
    activeView: (savedView || 'operation') as AppActiveView,
  };
};

export const useAppEntryViewModel = () => {
  const [entryState, setEntryState] = useState(getInitialEntryState);
  const { isAuthenticated, activeView } = entryState;
  const [loginPhase, setLoginPhase] = useState<LoginPhase>('waiting');
  const [qrRevision, setQrRevision] = useState(() => Date.now());

  const scanTimerRef = useRef<number | null>(null);
  const confirmTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (scanTimerRef.current) {
      window.clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }

    if (confirmTimerRef.current) {
      window.clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = null;
    }
  }, []);

  const refreshQr = useCallback(() => {
    clearTimers();
    setLoginPhase('waiting');
    setQrRevision(Date.now());
  }, [clearTimers]);

  const finalizeLogin = useCallback(() => {
    setEntryState({ isAuthenticated: true, activeView: 'portal' });
    authStorage.saveIsAuthenticated(true);
    authStorage.saveActiveView('portal');
    hashRouter.navigate('#/portal');
    scanTimerRef.current = null;
    confirmTimerRef.current = null;
  }, []);

  const simulateScan = useCallback(() => {
    clearTimers();
    setLoginPhase('scanning');

    scanTimerRef.current = window.setTimeout(() => {
      setLoginPhase('authenticated');

      confirmTimerRef.current = window.setTimeout(() => {
        finalizeLogin();
      }, 600);
    }, 900);
  }, [clearTimers, finalizeLogin]);

  const enterOperationInterface = useCallback(() => {
    setEntryState((prev) => ({ ...prev, isAuthenticated: true, activeView: 'operation' }));
    authStorage.saveIsAuthenticated(true);
    authStorage.saveActiveView('operation');
    const activeTab = adminShellStorage.readActiveTab() || 'institutions';
    const targetHash = hashRouter.buildHash({
      isAuthenticated: true,
      activeView: 'operation',
      activeTab,
      systemSubTab: adminShellStorage.readSystemSubTab(),
      selectedInstitutionId: adminShellStorage.readSelectedInstitutionId(),
      isCreatingInstitution: adminShellStorage.readIsCreatingInstitution(),
      isEditingInstitution: adminShellStorage.readIsEditingInstitution(),
    });
    hashRouter.navigate(targetHash);
  }, []);

  const backToPortal = useCallback(() => {
    setEntryState((prev) => ({ ...prev, activeView: 'portal' }));
    authStorage.saveActiveView('portal');
    hashRouter.navigate('#/portal');
  }, []);

  const handleLogout = useCallback(() => {
    clearTimers();
    setEntryState({ isAuthenticated: false, activeView: 'portal' });
    setLoginPhase('waiting');
    setQrRevision(Date.now());
    authStorage.clear();
    hashRouter.navigate('#/login');
  }, [clearTimers]);

  useEffect(() => {
    const handleHashChange = () => {
      const parsed = hashRouter.parseRoute();
      if (parsed.routeType === 'login') {
        setEntryState({ isAuthenticated: false, activeView: 'portal' });
      } else if (parsed.routeType === 'portal') {
        setEntryState({ isAuthenticated: true, activeView: 'portal' });
        authStorage.saveIsAuthenticated(true);
        authStorage.saveActiveView('portal');
      } else if (parsed.activeTab) {
        setEntryState({ isAuthenticated: true, activeView: 'operation' });
        authStorage.saveIsAuthenticated(true);
        authStorage.saveActiveView('operation');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      clearTimers();
    };
  }, [clearTimers]);

  return {
    isAuthenticated,
    activeView,
    loginPhase,
    qrRevision,
    actions: {
      refreshQr,
      simulateScan,
      enterOperationInterface,
      backToPortal,
      handleLogout,
    },
  };
};
