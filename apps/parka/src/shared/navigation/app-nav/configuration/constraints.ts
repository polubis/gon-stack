import { Home, Wallet, ChartColumn, LayoutGrid } from 'lucide-react';
import { moreSectionPaths, routes } from '@/shared/router';
import type { NavKey } from '../domain/models';

export const NAV_ITEMS: {
  key: NavKey;
  label: string;
  href: string;
  icon: typeof Home;
}[] = [
  { key: 'start', label: 'Start', href: routes.dashboard(), icon: Home },
  { key: 'expenses', label: 'Wydatki', href: routes.expenses(), icon: Wallet },
  {
    key: 'stats',
    label: 'Statystyki',
    href: routes.statistics(),
    icon: ChartColumn,
  },
  { key: 'more', label: 'Więcej', href: routes.settings(), icon: LayoutGrid },
];

/** Routes that highlight the “Więcej” tab (href still `/settings/`). */
export const MORE_SECTION_PATHS = moreSectionPaths();
