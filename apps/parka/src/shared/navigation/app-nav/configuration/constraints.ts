import { Home, LayoutGrid } from 'lucide-react';
import { moreSectionPaths, APP_ROUTER } from '@/shared/router';
import type { NavKey } from '../domain/models';

export const NAV_ITEMS: {
  key: NavKey;
  label: string;
  href: string;
  icon: typeof Home;
}[] = [
  { key: 'start', label: 'Start', href: APP_ROUTER.dashboard(), icon: Home },
  {
    key: 'more',
    label: 'Więcej',
    href: APP_ROUTER.settings(),
    icon: LayoutGrid,
  },
];

/** Routes that highlight the “Więcej” tab (href still `/app/settings/`). */
export const MORE_SECTION_PATHS = moreSectionPaths();
