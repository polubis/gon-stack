import { MORE_SECTION_PATHS } from '../configuration/constraints';
import { normalizePath, APP_ROUTER } from '@/shared/router';
import type { NavKey } from './models';

export const activeNavKeyFromPathname = (pathname: string): NavKey | null => {
  const p = normalizePath(pathname);

  // Dashboard lives at the `/app/` root, so it must match exactly — every
  // other `/app/*` page is a prefix-match of it.
  if (p === APP_ROUTER.dashboard()) return 'start';
  if (p === APP_ROUTER.expenses() || p.startsWith(APP_ROUTER.expenses()))
    return 'expenses';
  if (p === APP_ROUTER.statistics() || p.startsWith(APP_ROUTER.statistics()))
    return 'stats';

  if (MORE_SECTION_PATHS.some((m) => p === m || p.startsWith(m))) {
    return 'more';
  }

  return null;
};
