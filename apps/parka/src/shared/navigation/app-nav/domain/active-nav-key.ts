import { MORE_SECTION_PATHS } from '../configuration/constraints';
import { normalizePath, routes } from '@/shared/router';
import type { NavKey } from './models';

export const activeNavKeyFromPathname = (pathname: string): NavKey | null => {
  const p = normalizePath(pathname);

  if (p === routes.dashboard() || p.startsWith(routes.dashboard()))
    return 'start';
  if (p === routes.expenses() || p.startsWith(routes.expenses()))
    return 'expenses';
  if (p === routes.statistics() || p.startsWith(routes.statistics()))
    return 'stats';

  if (MORE_SECTION_PATHS.some((m) => p === m || p.startsWith(m))) {
    return 'more';
  }

  return null;
};
