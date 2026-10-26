import {
  Download,
  FileText,
  KeyRound,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { APP_ROUTER } from '@/shared/router/routes';
import type { NotificationKey, PushState } from '../domain/models';

export const FEATURE_NAME = 'Settings';

export const ERROR_CODES = {
  load: 'SETTINGS_LOAD',
  render: 'SETTINGS_RENDER',
} as const;

export const LINKS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: 'RODO — Twoje dane', href: APP_ROUTER.privacy(), icon: ShieldCheck },
  { label: 'AI — jak to działa', href: APP_ROUTER.aiInfo(), icon: Sparkles },
  { label: 'Raport miesięczny', href: APP_ROUTER.reports(), icon: FileText },
  { label: 'Eksport danych', href: APP_ROUTER.dataExport(), icon: Download },
  { label: 'Tokeny MCP', href: APP_ROUTER.accessTokens(), icon: KeyRound },
];

/** Why push cannot be switched on in this browser; absent when it can. */
export const PUSH_HINTS: Partial<Record<PushState, string>> = {
  unsupported:
    'Ta przeglądarka nie obsługuje powiadomień push. Na iPhonie dodaj Parkę do ekranu początkowego i otwórz ją stamtąd.',
  unconfigured: 'Powiadomienia push nie są skonfigurowane na serwerze.',
  blocked:
    'Powiadomienia są zablokowane w przeglądarce. Zezwól na nie w ustawieniach strony i odśwież widok.',
};

export const NOTIFICATION_OPTIONS: { key: NotificationKey; label: string }[] = [
  { key: 'push', label: 'Powiadomienia push' },
];
