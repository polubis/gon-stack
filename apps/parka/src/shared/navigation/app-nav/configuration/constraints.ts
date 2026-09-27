import { Home, Wallet, ChartColumn, LayoutGrid } from 'lucide-react';
import type { NavKey } from '../domain/models';

export const NAV_ITEMS: {
  key: NavKey;
  label: string;
  href: string;
  icon: typeof Home;
}[] = [
  { key: 'start', label: 'Start', href: '/dashboard/', icon: Home },
  { key: 'expenses', label: 'Wydatki', href: '/expenses/', icon: Wallet },
  {
    key: 'stats',
    label: 'Statystyki',
    href: '/statistics/',
    icon: ChartColumn,
  },
  { key: 'more', label: 'Więcej', href: '/settings/', icon: LayoutGrid },
];

/** Routes that highlight the “Więcej” tab (href still `/settings/`). */
export const MORE_SECTION_PATHS = [
  '/settings/',
  '/categories/',
  '/limits/',
  '/recurring/',
  '/reports/',
  '/notifications/',
  '/privacy/',
  '/ai-info/',
  '/data-export/',
] as const;
