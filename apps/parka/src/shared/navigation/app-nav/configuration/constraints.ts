import { Wallet, LayoutGrid } from 'lucide-react';
import { moreSectionPaths, APP_ROUTER } from '@/shared/router/routes';
import type { NavKey } from '../domain/models';

type NavItem = {
  key: NavKey;
  label: string;
  href: string;
  icon: typeof Wallet;
  /** Shown in the bottom bar; otherwise it is reachable via “Więcej”. */
  mobile: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'finances',
    label: 'Finanse',
    href: APP_ROUTER.dashboard(),
    icon: Wallet,
    mobile: true,
  },
  {
    key: 'more',
    label: 'Więcej',
    href: APP_ROUTER.settings(),
    icon: LayoutGrid,
    mobile: true,
  },
];

/** Routes that highlight the “Więcej” tab (href still `/app/settings/`). */
export const MORE_SECTION_PATHS = moreSectionPaths();
