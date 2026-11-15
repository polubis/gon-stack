import { useSyncExternalStore } from 'react';

let current = 0;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

/** Notifications mirror their unread total here so the account area can show it. */
export const setUnreadSummary = (count: number): void => {
  if (count === current) return;
  current = count;
  listeners.forEach((listener) => listener());
};

export const useUnreadSummary = (): number =>
  useSyncExternalStore(
    subscribe,
    () => current,
    () => current,
  );
