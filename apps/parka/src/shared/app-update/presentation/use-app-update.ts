import { useEffect, useEffectEvent, useState } from 'react';
import { CHECK_INTERVAL_MS } from '../configuration/constraints';
import { fetchLatestVersion } from '../integration/repository';

/**
 * Whether a newer deploy than the running bundle exists. Re-checked on an
 * interval and when the tab becomes visible; a dismissed notice returns on the
 * next check that still finds a newer version.
 */
export const useAppUpdate = () => {
  const [outdated, setOutdated] = useState(false);

  const check = useEffectEvent(async () => {
    const latest = await fetchLatestVersion();
    if (latest !== null && latest !== import.meta.env.PUBLIC_PARKA_APP_VERSION)
      setOutdated(true);
  });

  useEffect(() => {
    // Deferred: the first check is async work, not a state sync on mount.
    const first = setTimeout(() => void check(), 0);
    const timer = setInterval(() => void check(), CHECK_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void check();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return { outdated, dismiss: () => setOutdated(false) };
};
