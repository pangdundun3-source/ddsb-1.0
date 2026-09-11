import { NoticeItem, NewNoticeFormData, NoticeReader } from '../types';
import { INITIAL_NOTICES } from '../data/mockNotices';

const NOTICE_STORAGE_KEY = 'ddsb_system_notices_v1';

export const getStoredNotices = (): NoticeItem[] => {
  try {
    const raw = localStorage.getItem(NOTICE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load notices from storage:', error);
  }
  return INITIAL_NOTICES;
};

export const saveStoredNotices = (notices: NoticeItem[]): void => {
  try {
    localStorage.setItem(NOTICE_STORAGE_KEY, JSON.stringify(notices));
  } catch (error) {
    console.error('Failed to save notices to storage:', error);
  }
};

export const createNoticeItem = (
  formData: NewNoticeFormData,
  publisher: string = '张建国',
  publishOrg: string = '台中市网信办',
  isDraft: boolean = false
): NoticeItem => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const idSuffix = Math.floor(100 + Math.random() * 900);
  const dateCompact = dateStr.replace(/-/g, '');

  const id = isDraft
    ? `NTC-${dateCompact}-DRAFT-${idSuffix}`
    : `NTC-${dateCompact}-${idSuffix}`;

  return {
    id,
    title: formData.title.trim(),
    category: formData.category,
    priority: formData.priority,
    scope: formData.scope,
    targetOrgs: formData.targetOrgs.length > 0 ? formData.targetOrgs : ['全网信系统各单位'],
    targetPersonnelIds: formData.targetPersonnelIds || [],
    primaryPersonnelIds: formData.primaryPersonnelIds || [],
    publisher,
    publishOrg,
    publishTime: `${dateStr} ${timeStr}`,
    status: isDraft ? '草稿' : (formData.status || '已发布'),
    isPinned: formData.isPinned,
    content: formData.content.trim(),
    summary: formData.summary?.trim() || formData.content.slice(0, 90) + '...',
    attachments: formData.attachments || [],
    readCount: isDraft ? 0 : 1,
    totalTargetCount:
      formData.targetPersonnelIds && formData.targetPersonnelIds.length > 0
        ? formData.targetPersonnelIds.length
        : formData.scope === '全网信系统'
        ? 156
        : formData.targetOrgs.length * 15 || 45,
    requireConfirm: formData.requireConfirm,
    confirmCount: isDraft ? 0 : (formData.requireConfirm ? 1 : 0),
    expireTime: formData.expireTime,
    readers: isDraft
      ? []
      : [
          {
            name: publisher.split(' ')[0] || '系统操作员',
            org: publishOrg,
            readTime: `${dateStr} ${timeStr}`,
            confirmed: formData.requireConfirm
          }
        ]
  };
};
