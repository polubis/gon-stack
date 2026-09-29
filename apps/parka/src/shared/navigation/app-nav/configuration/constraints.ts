import { Home, Wallet, ChartColumn, LayoutGrid } from 'lucide-react';
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
    key: 'expenses',
    label: 'Wydatki',
    href: APP_ROUTER.expenses(),
    icon: Wallet,
  },
  {
    key: 'stats',
    label: 'Statystyki',
    href: APP_ROUTER.statistics(),
    icon: ChartColumn,
  },
  {
    key: 'more',
    label: 'Więcej',
    href: APP_ROUTER.settings(),
    icon: LayoutGrid,
  },
];

/** Routes that highlight the “Więcej” tab (href still `/settings/`). */
export const MORE_SECTION_PATHS = moreSectionPaths();
