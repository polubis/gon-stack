import { useEffect } from 'react';

type ScreenLock = {
  release: () => Promise<void>;
  addEventListener: (type: 'release', listener: () => void) => void;
};
type WakeLockApi = { request: (type: 'screen') => Promise<ScreenLock> };

/**
 * Keeps the screen awake while `active` (Screen Wake Lock API). The browser
 * drops the lock when the page is hidden, so it is taken again when the page
 * is visible. Where the API is missing or refused, nothing happens.
 */
export const useWakeLock = (active: boolean) => {
  useEffect(() => {
    const api = (navigator as Navigator & { wakeLock?: WakeLockApi }).wakeLock;
    if (!active || !api) return;
    let lock: ScreenLock | null = null;
    let cancelled = false;

    const acquire = () => {
      if (lock || document.visibilityState !== 'visible') return;
      api
        .request('screen')
        .then((next) => {
          if (cancelled) {
            void next.release();
            return;
          }
          lock = next;
          next.addEventListener('release', () => {
            if (lock === next) lock = null;
          });
        })
        .catch(() => {});
    };
    const onVisibility = () => acquire();

    acquire();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      void lock?.release();
      lock = null;
    };
  }, [active]);
};
