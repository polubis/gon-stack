import { useRouterState } from '@tanstack/react-router';
import { activeNavKeyFromPathname } from '../domain/active-nav-key';
import type { NavKey } from '../domain/models';

/** Keeps nav in sync with the client-side router location. */
export const useSyncedNavKey = (): NavKey => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return activeNavKeyFromPathname(pathname) ?? 'finances';
};
