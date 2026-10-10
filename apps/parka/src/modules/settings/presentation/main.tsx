import { useEffect, useState } from 'react';
import { ChevronRight, CircleUser } from 'lucide-react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button, Field, inputClass, Toggle } from '@/shared/ui/controls';
import { Card, ScreenHeader } from '@/shared/ui/layout';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingBanner } from '@/shared/ui/loading-banner';
import { Toast } from '@/shared/ui/toast';
import {
  ERROR_CODES,
  LINKS,
  NOTIFICATION_OPTIONS,
} from '../configuration/constraints';
import type { NotificationKey, Settings } from '../domain/models';
import { Provider, useContext } from './context';
import { SettingsSkeleton } from './settings-skeleton';

const SettingsContent = ({ settings }: { settings: Settings }) => {
  const ctx = useContext();
  const isSigningOut = ctx.useIsSigningOut();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const startEditing = () => {
    setName(settings.profile.name);
    setEmail(settings.profile.email);
    setEditing(true);
  };

  const saveProfile = () => {
    ctx.update({ ...settings, profile: { name, email } });
    setEditing(false);
  };

  const setNotification = (key: NotificationKey, value: boolean) =>
    ctx.update({
      ...settings,
      notifications: { ...settings.notifications, [key]: value },
    });

  return (
    <div className="flex flex-col gap-4 md:gap-6 lg:grid lg:grid-cols-3">
      <Card className="space-y-3 lg:col-span-2">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand">
            <CircleUser className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <p className="text-base font-semibold" data-e2e="settings:name">
              {settings.profile.name}
            </p>
            <p className="text-xs text-ink-soft">{settings.profile.email}</p>
          </div>
          {!editing ? (
            <Button
              variant="ghost"
              className="w-auto px-3 py-1.5"
              data-e2e="settings:edit-profile"
              onClick={startEditing}
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

      <Card as="section" className="space-y-2 lg:col-span-2">
        <h2 className="text-sm font-semibold text-ink-soft">Powiadomienia</h2>
        <ul className="divide-y divide-line" data-e2e="settings:notifications">
          {NOTIFICATION_OPTIONS.map(({ key, label }) => (
            <li
              key={key}
              className="flex items-center justify-between py-2 text-sm"
            >
              <span>{label}</span>
              <Toggle
                checked={settings.notifications[key]}
                onChange={(value) => setNotification(key, value)}
                label={label}
              />
            </li>
          ))}
        </ul>
      </Card>

      <nav aria-label="Ustawienia szczegółowe">
        <ul className="overflow-hidden rounded-2xl border border-line bg-card">
          {LINKS.map(({ label, href, icon: Icon }) => (
            <li key={href} className="border-b border-line last:border-0">
              <a
                href={href}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-hover-soft"
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

      <Button
        variant="ghost"
        className="lg:col-start-3"
        data-e2e="settings:sign-out"
        disabled={isSigningOut}
        onClick={ctx.signOut}
      >
        Wyloguj się
      </Button>
    </div>
  );
};

const SettingsView = () => {
  const ctx = useContext();
  const settings = ctx.useSettings();
  const error = ctx.useError();
  const notice = ctx.useNotice();
  const initializing = ctx.useInitializing();
  const isLoading = ctx.useIsLoading();

  useEffect(() => {
    ctx.load();
  }, [ctx]);

  return (
    <div data-e2e="settings:main" className="relative flex flex-1 flex-col">
      <LoadingBanner active={isLoading && !initializing} />
      <div className="md:px-4 lg:px-6 xl:px-12">
        <ScreenHeader title="Ustawienia" />
      </div>
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2 md:gap-6 md:px-8 lg:px-10 xl:px-16">
        {error ? (
          <ErrorState
            data-e2e="settings:load-error"
            title="Nie udało się wczytać ustawień"
            code={ERROR_CODES.load}
            description={error}
            onRetry={ctx.load}
            backHref={APP_ROUTER.dashboard()}
          />
        ) : null}

        {initializing ? <SettingsSkeleton /> : null}
        {settings ? <SettingsContent settings={settings} /> : null}
      </main>

      {notice ? (
        <Toast
          key={notice.id}
          data-e2e="settings:toast"
          notice={notice}
          onClose={ctx.dismissNotice}
        />
      ) : null}
    </div>
  );
};

export const Main = () => (
  <ErrorBoundary
    fallback={({ error, reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku ustawień"
        code={ERROR_CODES.render}
        description={error.message}
        onRetry={reset}
        backHref={APP_ROUTER.dashboard()}
      />
    )}
  >
    <Provider>
      <SettingsView />
    </Provider>
  </ErrorBoundary>
);
