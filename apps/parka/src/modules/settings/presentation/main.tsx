import { useState } from 'react';
import {
  ChevronRight,
  ShieldCheck,
  Sparkles,
  LayoutGrid,
  Target,
  Repeat,
  Bell,
  FileText,
  CircleUser,
  type LucideIcon,
} from 'lucide-react';
import {
  AppShell,
  Card,
  Button,
  Field,
  Toggle,
  inputClass,
} from '@/modules/shared/ui';
import { useParkaState, setState, whenSynced } from '@/modules/shared/data';

const signOut = async () => {
  await whenSynced();
  await fetch('/api/auth/logout/', {
    method: 'POST',
    redirect: 'manual',
  }).catch(() => undefined);
  window.location.href = '/sign-in/';
};

const LINKS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: 'RODO — Twoje dane', href: '/privacy/', icon: ShieldCheck },
  { label: 'AI — jak to działa', href: '/ai-info/', icon: Sparkles },
  { label: 'Kategorie', href: '/categories/', icon: LayoutGrid },
  { label: 'Limity i budżet', href: '/limits/', icon: Target },
  { label: 'Cykliczne wydatki', href: '/recurring/', icon: Repeat },
  { label: 'Powiadomienia', href: '/notifications/', icon: Bell },
  { label: 'Raport miesięczny', href: '/reports/', icon: FileText },
  { label: 'Eksport danych', href: '/data-export/', icon: FileText },
];

const NOTIF_KEYS = [
  ['limitWarnings', 'Ostrzeżenia o limitach'],
  ['receiptConfirmations', 'Potwierdzenia paragonów'],
  ['limitAlerts', 'Alerty limitów'],
  ['push', 'Powiadomienia push'],
  ['email', 'Powiadomienia e-mail'],
] as const;

export const Main = () => {
  const state = useParkaState();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(state.settings.profile.name);
  const [email, setEmail] = useState(state.settings.profile.email);

  const saveProfile = () => {
    setState((p) => ({
      ...p,
      settings: { ...p.settings, profile: { name, email } },
    }));
    setEditing(false);
  };

  const setNotif = (key: (typeof NOTIF_KEYS)[number][0], value: boolean) =>
    setState((p) => ({
      ...p,
      settings: {
        ...p.settings,
        notifications: { ...p.settings.notifications, [key]: value },
      },
    }));

  return (
    <AppShell e2e="settings:main" nav="more" title="Ustawienia">
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2">
        <Card className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand">
              <CircleUser className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <p className="text-base font-semibold" data-e2e="settings:name">
                {state.settings.profile.name}
              </p>
              <p className="text-xs text-ink-soft">
                {state.settings.profile.email}
              </p>
            </div>
            {!editing ? (
              <Button
                variant="ghost"
                className="w-auto px-3 py-1.5"
                data-e2e="settings:edit-profile"
                onClick={() => setEditing(true)}
              >
                Edytuj
              </Button>
            ) : null}
          </div>

          {editing ? (
            <div className="space-y-3">
              <Field label="Imię i nazwisko">
                <input
                  className={inputClass}
                  value={name}
                  data-e2e="settings:profile-name"
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field label="E-mail">
                <input
                  type="email"
                  className={inputClass}
                  value={email}
                  data-e2e="settings:profile-email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Button data-e2e="settings:save-profile" onClick={saveProfile}>
                Zapisz
              </Button>
            </div>
          ) : null}
        </Card>

        <Card as="section" className="space-y-1">
          <h2 className="mb-1 text-sm font-semibold text-ink-soft">
            Bezpieczeństwo i prywatność
          </h2>
          <p className="text-sm text-ink-soft">
            Dane przechowywane w UE i szyfrowane w spoczynku oraz podczas
            przesyłania.
          </p>
        </Card>

        <Card as="section" className="space-y-2">
          <h2 className="text-sm font-semibold text-ink-soft">Powiadomienia</h2>
          <ul
            className="divide-y divide-black/5"
            data-e2e="settings:notifications"
          >
            {NOTIF_KEYS.map(([key, label]) => (
              <li
                key={key}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span>{label}</span>
                <Toggle
                  checked={state.settings.notifications[key]}
                  onChange={(v) => setNotif(key, v)}
                  label={label}
                />
              </li>
            ))}
          </ul>
        </Card>

        <nav aria-label="Ustawienia szczegółowe">
          <ul className="overflow-hidden rounded-2xl border border-black/5 bg-white">
            {LINKS.map(({ label, href, icon: Icon }) => (
              <li key={href} className="border-b border-black/5 last:border-0">
                <a
                  href={href}
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-black/[0.02]"
                >
                  <Icon className="h-4.5 w-4.5 text-brand" aria-hidden="true" />
                  <span className="flex-1">{label}</span>
                  <ChevronRight
                    className="h-4 w-4 text-ink-soft"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Button variant="ghost" data-e2e="settings:sign-out" onClick={signOut}>
          Wyloguj się
        </Button>
      </main>
    </AppShell>
  );
};
