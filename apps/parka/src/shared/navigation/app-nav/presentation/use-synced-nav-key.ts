import { useRouterState } from '@tanstack/react-router';
import { activeNavKeyFromPathname } from '../domain/active-nav-key';
import type { NavKey } from '../domain/models';

/** Keeps nav in sync with the client-side router location. */
/** `null` on pages outside the two sections (settings, notifications...): nothing is highlighted. */
export const useSyncedNavKey = (): NavKey | null => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return activeNavKeyFromPathname(pathname);
};
