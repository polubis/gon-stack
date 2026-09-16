import type { QuickAction } from '../domain/models';

export const FEATURE_NAME = 'Dashboard';
export const TREND_MONTHS = 8;

export const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Dodaj paragon', href: '/receipt-scan/', iconId: 'add' },
  { label: 'Zrób zdjęcie', href: '/receipt-scan/', iconId: 'camera' },
  { label: 'Limity', href: '/limits/', iconId: 'target' },
  { label: 'Cykliczne', href: '/recurring/', iconId: 'repeat' },
];
