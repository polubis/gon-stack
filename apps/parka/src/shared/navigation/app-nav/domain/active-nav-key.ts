import { normalizePath, APP_ROUTER } from '@/shared/router/routes';
import type { NavKey } from './models';

export const activeNavKeyFromPathname = (pathname: string): NavKey | null => {
  const p = normalizePath(pathname);

  // Dashboard lives at the `/app/` root, so it must match exactly — every
  // other `/app/*` page is a prefix-match of it.
  if (p === APP_ROUTER.dashboard()) return 'finances';

  if (p.startsWith(APP_ROUTER.time())) return 'time';

  if (p.startsWith(APP_ROUTER.knowledge())) return 'knowledge';

  return null;
};
