import { Home, LayoutGrid, RefreshCw, Target } from 'lucide-react';
import { moreSectionPaths, APP_ROUTER } from '@/shared/router';
import type { NavKey } from '../domain/models';

type NavItem = {
  key: NavKey;
  label: string;
  href: string;
  icon: typeof Home;
  /** Shown in the bottom bar; otherwise it is reachable via “Więcej”. */
  mobile: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'start',
    label: 'Start',
    href: APP_ROUTER.dashboard(),
    icon: Home,
    mobile: true,
  },
  {
    key: 'limits',
    label: 'Limity i budżet',
    href: APP_ROUTER.limits(),
    icon: Target,
    mobile: false,
  },
  {
    key: 'recurring',
    label: 'Cykliczne',
    href: APP_ROUTER.recurring(),
    icon: RefreshCw,
    mobile: false,
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
