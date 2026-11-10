import React, { useState, useEffect } from 'react';
import {
  SpeedReport,
  UserProfile,
  AppNotification,
  AppTab,
  UserRole,
} from './types';
import {
  INITIAL_USER,
  INITIAL_REPORTS,
  INITIAL_NOTIFICATIONS,
  REPORT_TEMPLATES,
} from './data/mockData';

import { WeChatPhoneShell } from './components/WeChatPhoneShell';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { ReportView } from './components/ReportView';
import { AuditView } from './components/AuditView';
import { NotificationView } from './components/NotificationView';
import { ProfileView } from './components/ProfileView';
import { DetailModal } from './components/DetailModal';
import { ActionSheet } from './components/ActionSheet';
import { Toast, ToastMessage } from './components/Toast';
import { OfficialAccountEntryView } from './components/OfficialAccountEntryView';
import { ActivationH5View } from './components/ActivationH5View';
import { AnnouncementDetailView } from './components/AnnouncementDetailView';
import { calculatePreJudgment, IDENTIFICATION_CONFIG, resolveOfficialTag } from './utils/identification';
import {
  getExternalAuditModuleTip,
  isExternalAuditEnabled,
  isTemplateBlockedByExternalAudit,
} from './shared/valueAddedAccess';
import { alertDialog, ConfirmDialogHost } from './components/ConfirmDialog';

export default function App() {
  // Application State with LocalStorage Persistence
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Always land on the official account home when the link is opened
  const [isOfficialAccount, setIsOfficialAccount] = useState<boolean>(true);

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('wechat_v8_user');
    if (!saved) return INITIAL_USER;
    const parsed = JSON.parse(saved) as UserProfile;
    return parsed.role === '审核员' ? parsed : { ...parsed, role: '上报员' };
  });

  const [reports, setReports] = useState<SpeedReport[]>(() => {
    return INITIAL_REPORTS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      localStorage.removeItem('wechat_v8_notifications');
      localStorage.removeItem('wechat_v8_notifications_v3');
    } catch {
      // ignore
    }
    // 原型阶段每次刷新从实验种子恢复
    return INITIAL_NOTIFICATIONS.map((n) => ({ ...n }));
  });

  // UI Navigation State
  const [currentTab, setCurrentTab] = useState<AppTab>('home');
  const [viewMode, setViewMode] = useState<'main' | 'notifications'>('main');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AppNotification | null>(null);
  const [selectedReport, setSelectedReport] = useState<SpeedReport | null>(null);
  const [selectedReportEntry, setSelectedReportEntry] = useState<'report_pending' | 'audit_pending' | null>(null);
  const [editingReport, setEditingReport] = useState<SpeedReport | null>(null);
  const [isCreatingNewReport, setIsCreatingNewReport] = useState<boolean>(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [isFormMode, setIsFormMode] = useState<boolean>(false);
  const [isProfileDetail, setIsProfileDetail] = useState<boolean>(false);
  const [isActivationDetail, setIsActivationDetail] = useState<boolean>(false);
  const [isActivationH5View, setIsActivationH5View] = useState<boolean>(false);
  const [profileSubPage, setProfileSubPage] = useState<'report' | 'audit' | 'notifications' | null>(null);
  const [previousTab, setPreviousTab] = useState<AppTab | null>(null);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>([]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('wechat_v8_logged', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('wechat_v8_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('wechat_v8_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('wechat_v8_oa_screen', JSON.stringify(isOfficialAccount));
  }, [isOfficialAccount]);

  // Toast helper
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: `toast_${Date.now()}`,
      text,
      type,
    });
  };

  // Handlers
  const resetModuleViewState = () => {
    setIsActivationH5View(false);
    setViewMode('main');
    setIsFormMode(false);
    setIsCreatingNewReport(false);
    setEditingReport(null);
    setPendingTemplateId(null);
    setSelectedReport(null);
    setSelectedReportEntry(null);
    setSelectedAnnouncement(null);
    setProfileSubPage(null);
    setIsProfileDetail(false);
    setIsActivationDetail(false);
    setPreviousTab(null);
  };

  const handleLoginSuccess = (account: string, role: UserRole) => {
    setUser((prev) => ({
      ...prev,
      account,
      role,
    }));
    resetModuleViewState();
    setIsLoggedIn(true);
    setIsOfficialAccount(false);
    setCurrentTab('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsOfficialAccount(true);
    showToast('已安全退出工作台并返回“点点速豹”公众号');
  };

  const handleChangeRole = (newRole: UserRole) => {
    setUser((prev) => ({
      ...prev,
      role: newRole,
    }));
  };

  const handleChangeDepartment = (newDept: string) => {
    setUser((prev) => ({
      ...prev,
      department: newDept,
    }));
  };

  const handleUpdateUser = (patch: Partial<UserProfile>) => {
    setUser((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  const handleSaveReport = (reportPayload: Partial<SpeedReport>, isSubmit: boolean = true) => {
    setIsCreatingNewReport(false);
    setPendingTemplateId(null);
    const isNew = !reports.some((r) => r.id === reportPayload.id);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    let identificationTag = reportPayload.identificationTag;
    let identificationReason = reportPayload.identificationReason;
    let identificationTime = reportPayload.identificationTime;

    if (!identificationTag) {
      const result = calculatePreJudgment(reportPayload, reports);
      identificationTag = result.tag;
      identificationReason = result.reason;
      identificationTime = now;
    }

    if (isNew) {
      const newReport: SpeedReport = {
        ...(reportPayload as SpeedReport),
        status: 'pending_audit',
        identificationTag,
        identificationReason,
        identificationTime,
        updateTime: now,
        createTime: reportPayload.createTime || now,
      };
      setReports((prev) => [newReport, ...prev]);

      showToast(
        `操作成功\n速报已成功提交送审 (${IDENTIFICATION_CONFIG[identificationTag || 'identifying'].shortLabel}) !`
      );
      // Add notification for audit (提醒审核人审核)
      const newNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        type: '待办通知',
        title: newReport.title,
        content: `${newReport.author} · ${newReport.authorDept}`,
        time: now,
        isRead: false,
        relatedReportId: newReport.id,
        publisher: `${newReport.author} · ${newReport.authorDept}`,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    } else {
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportPayload.id
            ? ({
                ...r,
                ...reportPayload,
                status: 'pending_audit',
                identificationTag: identificationTag || calculatePreJudgment({ ...r, ...reportPayload }, prev).tag,
                identificationReason: identificationReason || calculatePreJudgment({ ...r, ...reportPayload }, prev).reason,
                identificationTime: identificationTime || now,
                updateTime: now,
              } as SpeedReport)
            : r
        )
      );

      showToast(
        `操作成功\n速报已成功提交送审 (${IDENTIFICATION_CONFIG[identificationTag || 'identifying'].shortLabel}) !`
      );
    }

    setEditingReport(null);
  };

  const handleDeleteReport = (id: string) => {
    setReports((prev) => prev.filter((report) => report.id !== id));
    setNotifications((prev) => prev.filter((notification) => notification.relatedReportId !== id));
    if (selectedReport?.id === id) {
      setSelectedReport(null);
      setSelectedReportEntry(null);
    }
    showToast('已删除该速报');
  };

  const handleRecallReport = (id: string) => {
    const current = reports.find((report) => report.id === id);
    if (!current) return;
    if (current.status !== 'pending_audit') {
      showToast('只有尚未进入审核流程的待审核速报才能撤回', 'error');
      return;
    }

    // 撤回：从列表中移除待审状态并进入编辑修改状态
    setReports((prev) => prev.filter((report) => report.id !== id));
    setNotifications((prev) =>
      prev.filter((notification) => !(notification.relatedReportId === id && notification.type === '待办通知'))
    );
    if (selectedReport?.id === id) {
      setSelectedReport(null);
      setSelectedReportEntry(null);
    }
    setEditingReport(current);
    setIsCreatingNewReport(false);
    setCurrentTab('report');
    showToast('已撤回待审速报，进入编辑状态');
  };

  const handleApproveReport = (id: string, score?: number) => {
    const target = reports.find((r) => r.id === id);
    const officialTag = target ? resolveOfficialTag(target.identificationTag) : 'official_first';
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const formalReason =
      officialTag === 'official_first'
        ? '经终审采纳定标：确认为首发报送线索，已正式录入不良信息库。'
        : '经终审采纳定标：确认为重复报送，已正式合并入库归档。';

    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'approved',
              score: score ?? r.score,
              identificationTag: officialTag,
              identificationReason: formalReason,
              identificationTime: now,
              updateTime: now,
            }
          : r
      )
    );

    if (target) {
      const newNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        type: '结果通知',
        title: target.title,
        content: `已采纳${score != null || target.score != null ? `，评分 ${score ?? target.score} 分` : ''}`,
        time: now,
        isRead: false,
        relatedReportId: target.id,
        resultKind: 'adopted',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
    resolvePendingNotifications([id]);

    showToast('已采纳通过，正式标识定标完成');
  };

  const handleRejectReport = (id: string, reason: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'rejected',
              rejectReason: reason,
              updateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : r
      )
    );

    const target = reports.find((r) => r.id === id);
    if (target) {
      const newNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        type: '结果通知',
        title: target.title,
        content: `审核已驳回，驳回原因：${reason.replace(/^驳回原因[:：]\s*/, '')}`,
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        isRead: false,
        relatedReportId: target.id,
        resultKind: 'rejected',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
    resolvePendingNotifications([id]);

    showToast('已驳回该速报请求');
  };

  const handleTransferReport = (id: string, dept: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'transferred',
              transferredDept: dept,
              updateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : r
      )
    );

    const target = reports.find((r) => r.id === id);
    if (target) {
      const newNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        type: '结果通知',
        title: target.title,
        content: `已转办至 ${dept}`,
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        isRead: false,
        relatedReportId: target.id,
        resultKind: 'transferred',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
    resolvePendingNotifications([id]);

    showToast(`已成功转办至 ${dept}`);
  };

  const handleBatchApproveSameLocation = (targetIds?: string[], score?: number, remarks?: string) => {
    let idsToApprove: string[] = [];

    if (targetIds && targetIds.length > 0) {
      idsToApprove = targetIds;
    } else {
      idsToApprove = reports
        .filter((r) => r.isSameLocationGroup && r.status === 'pending_audit')
        .map((r) => r.id);
    }

    if (idsToApprove.length === 0) {
      showToast('暂无待审核的同地址（同上报链接）速报');
      return;
    }

    const finalRemarks = remarks || '信息核实属实，同源内容批量通过归档。';
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setReports((prev) =>
      prev.map((r) => {
        if (idsToApprove.includes(r.id)) {
          const officialTag = resolveOfficialTag(r.identificationTag);
          const formalReason =
            officialTag === 'official_first'
              ? '批量采纳定标：首发报送线索，正式纳入不良信息库。'
              : '批量采纳定标：同源重复报送，已正式关联入库。';
          return {
            ...r,
            status: 'approved',
            score: score ?? r.score,
            auditRemarks: finalRemarks,
            identificationTag: officialTag,
            identificationReason: formalReason,
            identificationTime: now,
            updateTime: now,
          };
        }
        return r;
      })
    );

    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      type: '结果通知',
      title: `同地址速报已批量通过（${idsToApprove.length} 条）`,
      content: score != null ? `已采纳，评分 ${score} 分` : '审核已通过，进入下一审核节点',
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
      resultKind: score != null ? 'adopted' : 'mid_pass',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    resolvePendingNotifications(idsToApprove);

    showToast(`已成功批量通过 ${idsToApprove.length} 条同地址速报！`);
  };

  const handleBatchReject = (ids: string[], reason: string) => {
    setReports((prev) =>
      prev.map((r) =>
        ids.includes(r.id)
          ? {
              ...r,
              status: 'rejected',
              rejectReason: reason,
              updateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : r
      )
    );
    resolvePendingNotifications(ids);
    showToast(`已成功批量驳回 ${ids.length} 条关联速报！`);
  };

  const nowText = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleMarkNotificationsRead = (ids: string[]) => {
    const now = nowText();
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) && !n.isRead ? { ...n, isRead: true, readAt: now } : n))
    );
  };

  /** 速报审核完成后，对应的待审核提醒自动转为已读 */
  const resolvePendingNotifications = (reportIds: string[]) => {
    const now = nowText();
    setNotifications((prev) =>
      prev.map((n) =>
        n.type === '待办通知' && !n.isRead && n.relatedReportId && reportIds.includes(n.relatedReportId)
          ? { ...n, isRead: true, readAt: now }
          : n
      )
    );
  };

  const handleSelectNotification = (notif: AppNotification) => {
    handleMarkNotificationsRead([notif.id]);

    if (notif.type === '平台公告') {
      setSelectedAnnouncement(notif);
      return;
    }

    if (notif.relatedReportId) {
      const target = reports.find((r) => r.id === notif.relatedReportId);
      if (target) {
        const wantsAudit =
          notif.type === '待办通知' && target.status === 'pending_audit';
        if (wantsAudit && !isExternalAuditEnabled()) {
          void alertDialog(getExternalAuditModuleTip(), {
            title: '无法进入审核管理',
            okText: '知道了',
          });
          return;
        }
        setSelectedReportEntry(wantsAudit ? 'audit_pending' : null);
        setSelectedReport(target);
      }
    }
  };

  const handleOpenReportDetail = (
    report: SpeedReport,
    entry: 'report_pending' | 'audit_pending' | null = null
  ) => {
    if (entry === 'audit_pending' && !isExternalAuditEnabled()) {
      void alertDialog(getExternalAuditModuleTip(), {
        title: '无法进入审核管理',
        okText: '知道了',
      });
      return;
    }
    setSelectedReportEntry(entry);
    setSelectedReport(report);
  };

  const handleCloseReportDetail = () => {
    setSelectedReport(null);
    setSelectedReportEntry(null);
  };

  const handleResetDemoData = () => {
    setReports(INITIAL_REPORTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setUser(INITIAL_USER);
    showToast('已重置恢复初始演示数据');
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reports, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `speed_reports_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('速报数据文件导出完成');
  };

  // Helper to open new speed report form
  const handleOpenNewReport = (templateId?: string) => {
    const selectable = REPORT_TEMPLATES.filter(
      (item) => !isTemplateBlockedByExternalAudit(item.requiresExternalAudit)
    );
    const requested =
      templateId && selectable.some((item) => item.id === templateId) ? templateId : null;
    const resolvedTemplateId = requested ?? selectable[0]?.id ?? REPORT_TEMPLATES[0]?.id ?? null;
    if (currentTab !== 'report') {
      setPreviousTab(currentTab);
    }
    setProfileSubPage(null);
    setEditingReport(null);
    setPendingTemplateId(resolvedTemplateId);
    setIsCreatingNewReport(true);
    setCurrentTab('report');
    setViewMode('main');
  };

  // Helper to close speed report form
  const handleCloseForm = () => {
    setIsFormMode(false);
    setIsCreatingNewReport(false);
    setEditingReport(null);
    setPendingTemplateId(null);
    if (previousTab && previousTab !== 'report') {
      setCurrentTab(previousTab);
      setPreviousTab(null);
    }
  };

  // Counts for Badges
  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;
  const auditPendingCount = reports.filter((r) => r.status === 'pending_audit').length;
  const reportPendingCount = reports.filter((r) => r.status === 'rejected').length;

  // Header Title Determination
  const getPageTitle = () => {
    if (!isLoggedIn) return '点点速豹 · 上报审核端';
    if (selectedAnnouncement) return '公告详情';
    if (selectedReport) return '审核报送详情';
    if (profileSubPage === 'report') return '我的报送';
    if (profileSubPage === 'audit') return '我的审核';
    if (profileSubPage === 'notifications') return '消息列表';
    if (viewMode === 'notifications') return '消息中心';
    if (isFormMode || isCreatingNewReport || editingReport) {
      if (editingReport) return editingReport.status === 'rejected' ? '修改补充并重新提交' : '编辑网格速报';
      return '一键网格速报';
    }
    if (isProfileDetail) return '个人基础信息详情';
    if (isActivationDetail) return '激活上报信息';
    switch (currentTab) {
      case 'home':
        return '首页';
      case 'message':
        return '消息';
      case 'report':
        return '报送';
      case 'audit':
        return '审核';
      case 'profile':
        return '我的';
    }
  };

  return (
    <>
      <WeChatPhoneShell
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'audit' && !isExternalAuditEnabled()) {
            void alertDialog(getExternalAuditModuleTip(), {
              title: '无法进入审核管理',
              okText: '知道了',
            });
            return;
          }
          setCurrentTab(tab);
          setViewMode('main');
          setSelectedAnnouncement(null);
          setProfileSubPage(null);
          setIsProfileDetail(false);
          setIsActivationDetail(false);
          if (tab !== 'report') {
            handleCloseForm();
          }
        }}
        auditPendingCount={auditPendingCount}
        reportPendingCount={reportPendingCount}
        unreadNotifCount={unreadNotifCount}
        onOpenActionSheet={() => setIsActionSheetOpen(true)}
        onResetDemoData={handleResetDemoData}
        isOfficialAccount={!isActivationH5View && isOfficialAccount}
        onToggleOfficialAccount={() => {
          if (isActivationH5View) {
            setIsActivationH5View(false);
            setIsOfficialAccount(true);
          } else {
            setIsOfficialAccount((prev) => !prev);
          }
        }}
        onCloseH5={() => {
          if (isActivationH5View) {
            setIsActivationH5View(false);
          }
          setIsOfficialAccount(true);
          showToast('已返回“点点速豹”公众号');
        }}
        canGoBack={
          !!selectedAnnouncement ||
          viewMode === 'notifications' ||
          isFormMode ||
          isCreatingNewReport ||
          !!editingReport ||
          !!selectedReport ||
          !!profileSubPage ||
          isProfileDetail ||
          isActivationDetail
        }
        onBack={() => {
          if (selectedAnnouncement) {
            setSelectedAnnouncement(null);
          } else if (isActivationH5View) {
            setIsActivationH5View(false);
            setIsOfficialAccount(true);
          } else if (selectedReport) {
            handleCloseReportDetail();
          } else if (viewMode === 'notifications') {
            setViewMode('main');
            setProfileSubPage(null);
          } else if (profileSubPage === 'report' || profileSubPage === 'audit') {
            setCurrentTab('profile');
            setProfileSubPage(null);
          } else if (isFormMode || isCreatingNewReport || editingReport) {
            handleCloseForm();
          } else if (isProfileDetail) {
            setIsProfileDetail(false);
          } else if (isActivationDetail) {
            setIsActivationDetail(false);
          }
        }}
        pageTitle={isActivationH5View ? '哨兵系统' : isOfficialAccount ? '点点速豹' : getPageTitle()}
        pageSubtitle={isActivationH5View ? 'xyx.shaobingshangbao.konne.com.cn' : undefined}
        isLoggedIn={isLoggedIn}
        hideTabBar={
          !!selectedAnnouncement ||
          isActivationH5View ||
          isOfficialAccount ||
          viewMode === 'notifications' ||
          isFormMode ||
          isCreatingNewReport ||
          !!editingReport ||
          !!selectedReport ||
          !!profileSubPage ||
          isProfileDetail ||
          isActivationDetail
        }
        hideFAB={
          !!selectedAnnouncement ||
          isActivationH5View ||
          isOfficialAccount ||
          viewMode === 'notifications' ||
          isFormMode ||
          isCreatingNewReport ||
          !!editingReport ||
          !!selectedReport ||
          !!profileSubPage ||
          isProfileDetail ||
          isActivationDetail
        }
        overlay={
          <>
            <ActionSheet
              isOpen={isActionSheetOpen}
              onClose={() => setIsActionSheetOpen(false)}
              onRefresh={() => {
                handleResetDemoData();
              }}
              onResetData={handleResetDemoData}
              onToast={showToast}
            />
            <Toast toast={toast} onClose={() => setToast(null)} />
            <ConfirmDialogHost />
          </>
        }
      >
        {isActivationH5View ? (
          <ActivationH5View
            user={user}
            onCompleteActivation={(activatedData, targetRole) => {
              setUser((prev) => ({
                ...prev,
                ...activatedData,
                role: targetRole,
              }));
              setIsActivationH5View(false);
              setIsLoggedIn(true);
              setIsOfficialAccount(false);
              if (targetRole === '审核员') {
                if (isExternalAuditEnabled()) {
                  setCurrentTab('audit');
                } else {
                  setCurrentTab('home');
                  void alertDialog(getExternalAuditModuleTip(), {
                    title: '无法进入审核管理',
                    okText: '知道了',
                  });
                }
              } else {
                setCurrentTab('home');
              }
              setViewMode('main');
              showToast(`🎉 激活成功！已为您进入【${targetRole}】工作台`, 'success');
            }}
            onCancel={() => {
              setIsActivationH5View(false);
              setIsOfficialAccount(true);
              showToast('已取消激活并返回“点点速豹”公众号');
            }}
            onToast={showToast}
          />
        ) : isOfficialAccount ? (
          <OfficialAccountEntryView
            onEnterReport={() => {
              resetModuleViewState();
              setIsOfficialAccount(false);
              setIsLoggedIn(true);
              setCurrentTab('report');
              setIsCreatingNewReport(true);
              showToast('已进入“快速上报”通道');
            }}
            onEnterReportList={() => {
              resetModuleViewState();
              setIsOfficialAccount(false);
              setIsLoggedIn(true);
              setCurrentTab('report');
              showToast('已打开快速上报列表');
            }}
            onEnterWorkbench={(targetRole) => {
              if (targetRole) {
                setUser((prev) => ({ ...prev, role: targetRole }));
              }
              resetModuleViewState();
              setIsLoggedIn(true);
              setIsOfficialAccount(false);
              setCurrentTab('home');
              showToast('已进入工作台首页');
            }}
            onEnterAuditList={() => {
              if (!isExternalAuditEnabled()) {
                void alertDialog(getExternalAuditModuleTip(), {
                  title: '无法进入审核管理',
                  okText: '知道了',
                });
                return;
              }
              resetModuleViewState();
              setIsLoggedIn(true);
              setIsOfficialAccount(false);
              setCurrentTab('audit');
              showToast('已打开快速审核列表');
            }}
            onEnterProfile={() => {
              resetModuleViewState();
              setIsLoggedIn(true);
              setIsOfficialAccount(false);
              setCurrentTab('profile');
              showToast('已进入个人中心（我的）');
            }}
            onEnterLogin={() => {
              resetModuleViewState();
              setIsLoggedIn(false);
              setIsOfficialAccount(false);
            }}
            onEnterActivationH5={() => {
              setIsActivationH5View(true);
            }}
            onToast={showToast}
          />
        ) : !isLoggedIn ? (
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            onToast={showToast}
            onBackToOfficialAccount={() => setIsOfficialAccount(true)}
          />
        ) : viewMode === 'notifications' ? (
          <NotificationView
            notifications={notifications}
            reports={reports}
            onMarkRead={handleMarkNotificationsRead}
            onSelectNotification={handleSelectNotification}
          />
        ) : (
          <>
            {currentTab === 'home' && (() => {
              const activeNotifs = notifications.filter((n) => !dismissedNotificationIds.includes(n.id));
              const latestNotif = activeNotifs[0];
              return (
                <DashboardView
                  user={user}
                  onNewReport={handleOpenNewReport}
                  latestNotification={latestNotif}
                  notifications={notifications}
                  reports={reports}
                  onNavigateToMessages={() => {
                    setCurrentTab('message');
                    setViewMode('main');
                  }}
                  onSelectNotification={handleSelectNotification}
                  onDismissNotification={(id) => {
                    setDismissedNotificationIds((prev) => [...prev, id]);
                    showToast('已关闭该通知提醒');
                  }}
                />
              );
            })()}

            {currentTab === 'message' && (
              <NotificationView
                notifications={notifications}
                reports={reports}
                onMarkRead={handleMarkNotificationsRead}
                onSelectNotification={handleSelectNotification}
              />
            )}

            {currentTab === 'report' && (
                <ReportView
                  reports={reports}
                  user={user}
                  onSaveReport={handleSaveReport}
                  onDeleteReport={handleDeleteReport}
                  onRecallReport={handleRecallReport}
                  onSelectReport={(r) => {
                    setSelectedReportEntry(null);
                    setSelectedReport(r);
                  }}
                  onToast={showToast}
                  onEditReport={(r) => {
                    setEditingReport(r);
                    setIsCreatingNewReport(false);
                  }}
                  initialEditReport={editingReport}
                  isCreatingNew={isCreatingNewReport}
                  initialTemplateId={pendingTemplateId ?? undefined}
                  showAllStatuses
                  onFormModeChange={setIsFormMode}
                  onCloseForm={handleCloseForm}
              />
            )}

            {currentTab === 'audit' && (
                <AuditView
                  reports={reports}
                  user={user}
                  onSelectReport={(r) => {
                    setSelectedReportEntry(null);
                    setSelectedReport(r);
                  }}
                  onBatchApproveSameLocation={handleBatchApproveSameLocation}
                  onBatchReject={handleBatchReject}
                  onResetDemoData={handleResetDemoData}
                  showAllStatuses
                onToast={showToast}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileView
                user={user}
                onChangeRole={handleChangeRole}
                onChangeDepartment={handleChangeDepartment}
                onUpdateUser={handleUpdateUser}
                onLogout={handleLogout}
                onResetDemoData={handleResetDemoData}
                onExportData={handleExportData}
                onToast={showToast}
                reports={reports}
                showUserDetail={isProfileDetail}
                onToggleUserDetail={setIsProfileDetail}
                showActivationDetail={isActivationDetail}
                onToggleActivationDetail={setIsActivationDetail}
              />
            )}
          </>
        )}

        {/* Detail View Modal (contained in phone viewport) */}
        {(() => {
          const activeReport = selectedReport
            ? reports.find((r) => r.id === selectedReport.id) || selectedReport
            : null;
          return (
            <DetailModal
              report={activeReport}
              allReports={reports}
              onClose={handleCloseReportDetail}
              userRole={user.role}
              allowAuditActions={currentTab === 'audit' || selectedReportEntry === 'audit_pending'}
              auditOnlyPreview={
                (currentTab === 'audit' || selectedReportEntry === 'audit_pending')
                  ? activeReport?.status !== 'pending_audit'
                  : false
              }
              onApprove={handleApproveReport}
              onReject={handleRejectReport}
              onTransfer={handleTransferReport}
              onDeleteReport={handleDeleteReport}
              onRecallReport={handleRecallReport}
              onBatchApprove={handleBatchApproveSameLocation}
              onBatchReject={handleBatchReject}
              onEditDraft={(report) => {
                if (currentTab !== 'report') {
                  setPreviousTab(currentTab);
                }
                handleCloseReportDetail();
                setEditingReport(report);
                setIsCreatingNewReport(false);
                setCurrentTab('report');
              }}
              onSelectRelatedReport={(r) => {
                setSelectedReportEntry(null);
                setSelectedReport(r);
              }}
              onToast={showToast}
              rejectStatusLabel={
                currentTab === 'audit' || selectedReportEntry === 'audit_pending' ? '已驳回' : '被驳回'
              }
            />
          );
        })()}

        {/* Announcement Detail View (contained in phone viewport) */}
        {selectedAnnouncement && (
          <AnnouncementDetailView
            announcement={selectedAnnouncement}
            onClose={() => setSelectedAnnouncement(null)}
            onToast={showToast}
          />
        )}

      </WeChatPhoneShell>
    </>
  );
}
