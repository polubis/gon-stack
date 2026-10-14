import { ClearableInput } from '@/shared/ui/clearable';
import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button, Field, Toggle } from '@/shared/ui/controls';
import { Card, ScreenHeader } from '@/shared/ui/layout';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingBanner } from '@/shared/ui/loading-banner';
import { Toast } from '@/shared/ui/toast';
import { UnreadLink } from '@/modules/notifications/presentation/unread-link';
import type { Device } from '@/shared/device/domain/models';
import { useDarkTheme } from '@/shared/theme/use-dark-theme';
import {
  ERROR_CODES,
  LINKS,
  NOTIFICATION_OPTIONS,
  PUSH_HINTS,
} from '../configuration/constraints';
import type { Avatar, Settings } from '../domain/models';
import { DevicesCard } from './devices-card';
import { ProfileAvatar } from './profile-avatar';
import { Provider, useContext } from './context';
import { SettingsSkeleton } from './settings-skeleton';

const ProfileCard = ({
  profile,
  avatar,
  uploading,
  onPickAvatar,
  onSave,
}: {
  profile: Settings['profile'];
  avatar: Avatar | null;
  uploading: boolean;
  onPickAvatar: (file: File) => void;
  onSave: (profile: Settings['profile']) => void;
}) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const next = { name: name.trim(), email: email.trim() };
  const canSave =
    next.name !== '' &&
    next.email !== '' &&
    (next.name !== profile.name || next.email !== profile.email);

  return (
    <Card className="flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-8 lg:col-span-2">
      <ProfileAvatar
        avatar={avatar}
        uploading={uploading}
        onPick={onPickAvatar}
      />
      <form
        className="grid w-full min-w-0 flex-1 gap-3 md:grid-cols-2 md:gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSave) onSave(next);
        }}
      >
        <Field label="Imię i nazwisko">
          <ClearableInput
            value={name}
            autoComplete="name"
            data-e2e="settings:profile-name"
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="E-mail">
          <ClearableInput
            type="email"
            value={email}
            autoComplete="email"
            data-e2e="settings:profile-email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <div className="md:col-span-2 md:flex md:justify-end">
          <Button
            type="submit"
            className="md:w-auto md:min-w-40"
            data-e2e="settings:save-profile"
            disabled={!canSave}
          >
            Zapisz
          </Button>
        </div>
      </form>
    </Card>
  );
};

const SettingsContent = ({ settings }: { settings: Settings }) => {
  const ctx = useContext();
  const avatar = ctx.useAvatar();
  const isUploadingAvatar = ctx.useIsUploadingAvatar();
  const uploadingDeviceIds = ctx.useUploadingDeviceIds();
  const push = ctx.usePush();
  const isPushBusy = ctx.useIsPushBusy();
  const [dark, setDark] = useDarkTheme();
  const setDevice = (
    id: string,
    patch: Partial<Pick<Device, 'avatar' | 'customName'>>,
  ) =>
    ctx.update({
      ...settings,
      devices: settings.devices.map((d) =>
        d.id === id ? { ...d, ...patch } : d,
      ),
    });

  return (
    <div className="flex flex-col gap-4 md:gap-6 lg:grid lg:grid-cols-2">
      <ProfileCard
        key={`${settings.profile.name}\n${settings.profile.email}`}
        profile={settings.profile}
        avatar={avatar}
        uploading={isUploadingAvatar}
        onPickAvatar={ctx.uploadAvatar}
        onSave={(profile) => ctx.update({ ...settings, profile })}
      />

      <Card as="section" className="space-y-2" data-e2e="settings:appearance">
        <h2 className="text-sm font-semibold text-ink-soft">Wygląd</h2>
        <div className="flex items-center justify-between py-2 text-sm">
          <span>Ciemny motyw</span>
          <Toggle checked={dark} onChange={setDark} label="Ciemny motyw" />
        </div>
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
        <ul className="divide-y divide-line" data-e2e="settings:notifications">
          {NOTIFICATION_OPTIONS.map(({ key, label }) => {
            const hint = PUSH_HINTS[push];
            return (
              <li key={key} className="py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>{label}</span>
                  <Toggle
                    checked={push === 'on' && settings.notifications.push}
                    onChange={ctx.togglePush}
                    disabled={(push !== 'on' && push !== 'off') || isPushBusy}
                    label={label}
                  />
                </div>
                {hint ? (
                  <p
                    className="mt-1 text-xs text-ink-soft"
                    data-e2e="settings:push-hint"
                  >
                    {hint}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Card>

      <nav aria-label="Ustawienia szczegółowe">
        <ul className="h-full overflow-hidden rounded-2xl border border-line bg-card">
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

      <DevicesCard
        devices={settings.devices}
        uploadingIds={uploadingDeviceIds}
        onChange={setDevice}
        onPhoto={ctx.uploadDevicePhoto}
      />
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
    <div
      data-e2e="settings:main"
      className="relative mx-auto flex w-full max-w-6xl flex-1 animate-view-enter flex-col motion-reduce:animate-none"
    >
      <LoadingBanner active={isLoading && !initializing} />
      <div className="md:px-4 lg:px-6 xl:px-12">
        <ScreenHeader title="Ustawienia" action={<UnreadLink />} />
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
