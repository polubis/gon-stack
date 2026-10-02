import {
  Bell,
  FileText,
  LayoutGrid,
  Repeat,
  ShieldCheck,
  Sparkles,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { APP_ROUTER } from '@/shared/router/routes';
import type { NotificationKey } from '../domain/models';

export const FEATURE_NAME = 'Settings';

export const ERROR_CODES = {
  load: 'SETTINGS_LOAD',
  render: 'SETTINGS_RENDER',
} as const;

export const LINKS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: 'RODO — Twoje dane', href: APP_ROUTER.privacy(), icon: ShieldCheck },
  { label: 'AI — jak to działa', href: APP_ROUTER.aiInfo(), icon: Sparkles },
  { label: 'Kategorie', href: APP_ROUTER.categories(), icon: LayoutGrid },
  { label: 'Limity i budżet', href: APP_ROUTER.limits(), icon: Target },
  { label: 'Cykliczne wydatki', href: APP_ROUTER.recurring(), icon: Repeat },
  { label: 'Powiadomienia', href: APP_ROUTER.notifications(), icon: Bell },
  { label: 'Raport miesięczny', href: APP_ROUTER.reports(), icon: FileText },
  { label: 'Eksport danych', href: APP_ROUTER.dataExport(), icon: FileText },
];

export const NOTIFICATION_OPTIONS: { key: NotificationKey; label: string }[] = [
  { key: 'limitWarnings', label: 'Ostrzeżenia o limitach' },
  { key: 'receiptConfirmations', label: 'Potwierdzenia paragonów' },
  { key: 'limitAlerts', label: 'Alerty limitów' },
  { key: 'push', label: 'Powiadomienia push' },
  { key: 'email', label: 'Powiadomienia e-mail' },
];
