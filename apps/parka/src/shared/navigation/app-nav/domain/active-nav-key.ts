import { MORE_SECTION_PATHS } from '../configuration/constraints';
import type { NavKey } from './models';

const normalizePath = (path: string) => {
  if (!path || path === '/') return '/';
  return path.endsWith('/') ? path : `${path}/`;
};

export const activeNavKeyFromPathname = (pathname: string): NavKey | null => {
  const p = normalizePath(pathname);

  if (p === '/dashboard/' || p.startsWith('/dashboard/')) return 'start';
  if (p === '/expenses/' || p.startsWith('/expenses/')) return 'expenses';
  if (p === '/statistics/' || p.startsWith('/statistics/')) return 'stats';

  if (MORE_SECTION_PATHS.some((m) => p === m || p.startsWith(m))) {
    return 'more';
  }

  return null;
};
