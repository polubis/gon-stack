import { Brain, Clock, Wallet } from 'lucide-react';
import { APP_ROUTER } from '@/shared/router/routes';
import type { NavKey } from '../domain/models';

type NavItem = {
  key: NavKey;
  label: string;
  href: string;
  icon: typeof Wallet;
  /** Shown in the bottom bar. */
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
    key: 'time',
    label: 'Czas',
    href: APP_ROUTER.time(),
    icon: Clock,
    mobile: true,
  },
  {
    key: 'knowledge',
    label: 'Wiedza',
    href: APP_ROUTER.knowledge(),
    icon: Brain,
    mobile: true,
  },
];
