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
import { calculatePreJudgment, resolveOfficialTag } from './utils/identification';

export default function App() {
  // Application State with LocalStorage Persistence
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Always land on the official account home when the link is opened
  const [isOfficialAccount, setIsOfficialAccount] = useState<boolean>(true);

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('wechat_v8_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [reports, setReports] = useState<SpeedReport[]>(() => {
    return INITIAL_REPORTS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    return INITIAL_NOTIFICATIONS;
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
    localStorage.setItem('wechat_v8_notifications', JSON.stringify(notifications));
  }, [notifications]);

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
  const handleLoginSuccess = (account: string, role: UserRole) => {
    setUser((prev) => ({
      ...prev,
      account,
      role,
    }));
    setIsLoggedIn(true);
    setIsOfficialAccount(false);
    setCurrentTab('home');
    setViewMode('main');
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

  const handleSaveReport = (reportPayload: Partial<SpeedReport>, isSubmit: boolean) => {
    setIsCreatingNewReport(false);
    setPendingTemplateId(null);
    const isNew = !reports.some((r) => r.id === reportPayload.id);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    let identificationTag = reportPayload.identificationTag;
    let identificationReason = reportPayload.identificationReason;
    let identificationTime = reportPayload.identificationTime;

    if (isSubmit) {
      if (!identificationTag) {
        const result = calculatePreJudgment(reportPayload, reports);
        identificationTag = result.tag;
        identificationReason = result.reason;
        identificationTime = now;
      }
    } else {
      // 草稿不算，不打标
      identificationTag = undefined;
      identificationReason = undefined;
      identificationTime = undefined;
    }

    if (isNew) {
      const newReport: SpeedReport = {
        ...(reportPayload as SpeedReport),
        status: isSubmit ? 'pending_audit' : 'draft',
        identificationTag,
        identificationReason,
        identificationTime,
        updateTime: now,
        createTime: reportPayload.createTime || now,
      };
      setReports((prev) => [newReport, ...prev]);

      if (isSubmit) {
        showToast('速报已成功提交审核');
        // Add notification for audit (提醒审核人审核)
        const newNotif: AppNotification = {
          id: `notif_${Date.now()}`,
          type: '待审核通知',
          title: `【待审核提醒】新提交速报待审核: ${newReport.title}`,
          content: `上报人 ${newReport.author} 已提交【${newReport.type}】类速报，系统已完成查重预判断打标，请审核人及时登录审查。`,
          time: now,
          isRead: false,
          relatedReportId: newReport.id,
        };
        setNotifications((prev) => [newNotif, ...prev]);
      } else {
        showToast('已保存至速报草稿箱');
      }
    } else {
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportPayload.id
            ? ({
                ...r,
                ...reportPayload,
                status: isSubmit ? 'pending_audit' : 'draft',
                identificationTag: isSubmit
                  ? (identificationTag || calculatePreJudgment({ ...r, ...reportPayload }, prev).tag)
                  : undefined,
                identificationReason: isSubmit
                  ? (identificationReason || calculatePreJudgment({ ...r, ...reportPayload }, prev).reason)
                  : undefined,
                identificationTime: isSubmit ? (identificationTime || now) : undefined,
                updateTime: now,
              } as SpeedReport)
            : r
        )
      );

      if (isSubmit) {
        showToast('已重新提交审核并完成查重打标');
      } else {
        showToast('草稿已更新');
      }
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

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setReports((prev) =>
      prev.map((report) =>
        report.id === id
          ? {
              ...report,
              status: 'draft',
              identificationTag: undefined,
              identificationReason: undefined,
              identificationTime: undefined,
              updateTime: now,
            }
          : report
      )
    );
    setNotifications((prev) =>
      prev.filter((notification) => !(notification.relatedReportId === id && notification.type === '待审核通知'))
    );
    if (selectedReport?.id === id) {
      setSelectedReport((prev) => (prev ? { ...prev, status: 'draft', identificationTag: undefined, identificationReason: undefined, updateTime: now } : prev));
    }
    showToast('已撤回到草稿，可继续修改后重新提交');
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
        type: '审核结果通知',
        title: `【审核结果通知】速报已采纳定标: ${target.title}`,
        content: `审核节点结果：审核通过并已采纳。定标结果：${officialTag === 'official_first' ? '【首发】' : '【重复】'}。您上报的《${target.title}》已完成正式定标归档。`,
        time: now,
        isRead: false,
        relatedReportId: target.id,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

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
        type: '审核结果通知',
        title: `【审核结果通知】速报被驳回重修: ${target.title}`,
        content: `审核节点结果：驳回重修。驳回原因：${reason}`,
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        isRead: false,
        relatedReportId: target.id,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

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
        type: '审核结果通知',
        title: `【审核结果通知】速报已转办至: ${dept}`,
        content: `审核节点结果：转办。《${target.title}》已转办至 ${dept} 进行专班处置。`,
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        isRead: false,
        relatedReportId: target.id,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

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
      type: '审核结果通知',
      title: `【审核结果通知】同地址速报已批量通过 (${idsToApprove.length}条)`,
      content: `审核节点结果：批量审核通过。系统已批量审核通过 ${idsToApprove.length} 条关联/同地址速报。`,
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

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
    showToast(`已成功批量驳回 ${ids.length} 条关联速报！`);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('所有通知消息已标记为已读');
  };

  const handleSelectNotification = (notif: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );

    if (notif.type === '平台公告') {
      setSelectedAnnouncement(notif);
      return;
    }

    if (notif.relatedReportId) {
      const target = reports.find((r) => r.id === notif.relatedReportId);
      if (target) {
        setSelectedReportEntry(
          notif.type === '待审核通知' && target.status === 'pending_audit'
            ? 'audit_pending'
            : null
        );
        setSelectedReport(target);
      }
    }
  };

  const handleOpenReportDetail = (
    report: SpeedReport,
    entry: 'report_pending' | 'audit_pending' | null = null
  ) => {
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
    const resolvedTemplateId = templateId ?? REPORT_TEMPLATES[0]?.id ?? null;
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
  const reportPendingCount = reports.filter((r) => r.status === 'draft' || r.status === 'rejected').length;

  // Header Title Determination
  const getPageTitle = () => {
    if (!isLoggedIn) return '网格员上报审核端';
    if (selectedAnnouncement) return '公告详情';
    if (selectedReport) return '审核报送详情';
    if (profileSubPage === 'report') return '我的报送';
    if (profileSubPage === 'audit') return '我的审核';
    if (profileSubPage === 'notifications') return '消息列表';
    if (viewMode === 'notifications') return '消息中心';
    if (isFormMode || isCreatingNewReport || editingReport) {
      return editingReport ? '编辑网格速报' : '一键网格速报';
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
          showToast('已返回“点点速报”公众号');
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
        pageTitle={isActivationH5View ? '哨兵系统' : isOfficialAccount ? '点点速报' : getPageTitle()}
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
                setCurrentTab('audit');
              } else {
                setCurrentTab('home');
              }
              setViewMode('main');
              showToast(`🎉 激活成功！已为您进入【${targetRole}】工作台`, 'success');
            }}
            onCancel={() => {
              setIsActivationH5View(false);
              setIsOfficialAccount(true);
              showToast('已取消激活并返回“点点速报”公众号');
            }}
            onToast={showToast}
          />
        ) : isOfficialAccount ? (
          <OfficialAccountEntryView
            onEnterReport={() => {
              setIsOfficialAccount(false);
              setIsLoggedIn(true);
              setCurrentTab('report');
              setIsCreatingNewReport(true);
              setViewMode('main');
              showToast('已进入“快速上报”通道');
            }}
            onEnterReportList={() => {
              setIsOfficialAccount(false);
              setIsLoggedIn(true);
              setCurrentTab('report');
              setIsCreatingNewReport(false);
              setViewMode('main');
              showToast('已打开快速上报列表');
            }}
            onEnterWorkbench={(targetRole) => {
              if (targetRole) {
                setUser((prev) => ({ ...prev, role: targetRole }));
              }
              setIsLoggedIn(true);
              setIsOfficialAccount(false);
              setCurrentTab('home');
              setViewMode('main');
              showToast('已进入工作台首页');
            }}
            onEnterAuditList={() => {
              setIsLoggedIn(true);
              setIsOfficialAccount(false);
              setCurrentTab('audit');
              setViewMode('main');
              showToast('已打开快速审核列表');
            }}
            onEnterProfile={() => {
              setIsLoggedIn(true);
              setIsOfficialAccount(false);
              setCurrentTab('profile');
              setViewMode('main');
              setProfileSubPage(null);
              setIsProfileDetail(false);
              setIsActivationDetail(false);
              showToast('已进入个人中心（我的）');
            }}
            onEnterLogin={() => {
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
            onMarkAllRead={handleMarkAllNotificationsRead}
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
                onMarkAllRead={handleMarkAllNotificationsRead}
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
