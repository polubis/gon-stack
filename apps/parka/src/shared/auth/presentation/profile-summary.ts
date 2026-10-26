import { useSyncExternalStore } from 'react';

/** What the signed-in user chose to show: set by the profile, not by login. */
export type ProfileSummary = { name: string | null; avatarUrl: string | null };

let current: ProfileSummary = { name: null, avatarUrl: null };
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

export const setProfileSummary = (patch: Partial<ProfileSummary>): void => {
  const next = { ...current, ...patch };
  if (next.name === current.name && next.avatarUrl === current.avatarUrl)
    return;
  current = next;
  listeners.forEach((listener) => listener());
};

export const useProfileSummary = (): ProfileSummary =>
  useSyncExternalStore(
    subscribe,
    () => current,
    () => current,
  );
