import type { SavedMedia, UserState } from '@/types';

const STORAGE_KEYS = {
  SAVED_MEDIA: 'gifage_saved_media',
  USER_STATE: 'gifage_user_state',
} as const;

export async function getSavedMedia(): Promise<SavedMedia[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SAVED_MEDIA);
  return result[STORAGE_KEYS.SAVED_MEDIA] ?? [];
}

export async function addSavedMedia(media: SavedMedia): Promise<void> {
  const existing = await getSavedMedia();
  existing.unshift(media);
  await chrome.storage.local.set({ [STORAGE_KEYS.SAVED_MEDIA]: existing });
}

export async function removeSavedMedia(id: string): Promise<void> {
  const existing = await getSavedMedia();
  const filtered = existing.filter((m) => m.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEYS.SAVED_MEDIA]: filtered });
}

export async function getUserState(): Promise<UserState> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.USER_STATE);
  return result[STORAGE_KEYS.USER_STATE] ?? { isLoggedIn: false };
}

export async function setUserState(state: UserState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.USER_STATE]: state });
}
