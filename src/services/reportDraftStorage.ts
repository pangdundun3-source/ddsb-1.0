import type { DraftReport } from '../types';

export const REPORT_DRAFT_STORAGE_KEY = 'ddsb_report_drafts';
export const H5_REPORT_DRAFT_STORAGE_KEY = 'ddsb_h5_report_drafts';

const readStoredDrafts = (storageKey: string): DraftReport[] => {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const loadDrafts = (storageKey: string): DraftReport[] =>
  readStoredDrafts(storageKey);

export const saveDrafts = (
  drafts: DraftReport[],
  storageKey: string
): DraftReport[] => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(drafts));
  } catch {
    // Ignore storage failures in restricted browser contexts.
  }
  return drafts;
};

export const upsertDraft = (
  draft: DraftReport,
  storageKey: string
): DraftReport[] => {
  const drafts = readStoredDrafts(storageKey);
  return saveDrafts(
    [draft, ...drafts.filter((item) => item.id !== draft.id)],
    storageKey
  );
};

export const removeDraft = (
  draftId: string,
  storageKey: string
): DraftReport[] => {
  const drafts = readStoredDrafts(storageKey);
  return saveDrafts(
    drafts.filter((item) => item.id !== draftId),
    storageKey
  );
};
