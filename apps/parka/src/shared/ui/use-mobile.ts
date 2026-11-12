import { useSyncExternalStore } from 'react';

/** Phone-sized screen, or a touch-first device up to tablet size. */
const MOBILE =
  '(max-width: 39.99rem), (pointer: coarse) and (max-width: 63.99rem)';

const subscribe = (notify: () => void) => {
  const query = window.matchMedia?.(MOBILE);
  query?.addEventListener('change', notify);
  return () => query?.removeEventListener('change', notify);
};

const isMobile = () => window.matchMedia?.(MOBILE).matches ?? false;

/** True on mobile devices (screen size plus pointer type), live on resize. */
export const useIsMobile = (): boolean =>
  useSyncExternalStore(subscribe, isMobile, () => false);
