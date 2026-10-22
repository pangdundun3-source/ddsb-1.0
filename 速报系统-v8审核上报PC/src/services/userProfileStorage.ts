import type { UserProfileData } from '../types';

export const USER_PROFILE_STORAGE_KEY = 'ddsb_user_personal_info_v2';

export const loadUserProfile = (
  fallback: UserProfileData
): UserProfileData => {
  try {
    const saved = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object') return fallback;
    // 一人一机构：仅保留所属机构名称
    const orgs = Array.isArray(parsed.associatedOrgs) ? parsed.associatedOrgs.filter(Boolean) : [];
    return {
      ...fallback,
      ...parsed,
      associatedOrgs: orgs.length > 0 ? [orgs[0]] : fallback.associatedOrgs
    };
  } catch {
    return fallback;
  }
};

export const saveUserProfile = (profile: UserProfileData): UserProfileData => {
  try {
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage failures in restricted browser contexts.
  }
  return profile;
};
