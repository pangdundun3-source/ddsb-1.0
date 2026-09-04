import type { UserProfileData } from '../types';

export const USER_PROFILE_STORAGE_KEY = 'ddsb_user_personal_info';

export const loadUserProfile = (
  fallback: UserProfileData
): UserProfileData => {
  try {
    const saved = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
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
