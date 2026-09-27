import { useEffect, useState } from 'react';
import { activeNavKeyFromPathname } from '../domain/active-nav-key';
import type { NavKey } from '../domain/models';

const readNavKey = (): NavKey =>
  activeNavKeyFromPathname(window.location.pathname) ?? 'start';

/** Keeps bottom nav in sync with Astro view transitions. Client-only. */
export const useSyncedNavKey = (): NavKey => {
  const [active, setActive] = useState<NavKey>('start');

  useEffect(() => {
    const sync = () => setActive(readNavKey());
    sync();
    document.addEventListener('astro:page-load', sync);
    return () => document.removeEventListener('astro:page-load', sync);
  }, []);

  return active;
};
