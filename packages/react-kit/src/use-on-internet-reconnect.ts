import { useEffect, useEffectEvent } from 'react';

/**
 * Subscribes to the browser `online` event and invokes `onReconnect` whenever
 * connectivity is restored. The listener is registered once on mount and
 * removed on unmount; `onReconnect` always refers to the latest closure via
 * `useEffectEvent`, so stale callbacks are never invoked after re-renders.
 *
 * Does not run `onReconnect` on mount — only when the browser fires `online`
 * after a prior disconnect.
 *
 * @param onReconnect Callback invoked when the browser regains connectivity.
 */
export const useOnInternetReconnect = (onReconnect: () => void): void => {
  const handleReconnect = useEffectEvent(() => {
    onReconnect();
  });

  useEffect(() => {
    window.addEventListener('online', handleReconnect);

    return () => {
      window.removeEventListener('online', handleReconnect);
    };
  }, []);
};
