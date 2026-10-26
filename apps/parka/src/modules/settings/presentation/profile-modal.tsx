import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { PROFILE_MODAL } from '@/shared/auth/configuration/constraints';
import { setProfileSummary } from '@/shared/auth/presentation/profile-summary';
import { fetchAvatar } from '@/shared/avatar/integration/fetch-avatar';
import {
  closeModal,
  useModal,
  useModalMounted,
} from '@/shared/router/modal-stack';
import { Button, Field } from '@/shared/ui/controls';
import { ClearableInput } from '@/shared/ui/clearable';
import { Skeleton } from '@/shared/ui/skeleton';
import { Toast } from '@/shared/ui/toast';
import { ERROR_CODES } from '../configuration/constraints';
import type { Avatar, Settings } from '../domain/models';
import { fetchSettings } from '../integration/repository';
import { Provider, useContext } from './context';
import { ProfileAvatar } from './profile-avatar';

/** Big enough for the drawer header, small enough for the nav icon. */
const pictureOf = (avatar: Avatar | null): string | null =>
  (avatar?.variants.find((v) => v.size >= 128) ?? avatar?.variants.at(-1))
    ?.url ?? null;

const ProfileForm = ({
  profile,
  onSave,
}: {
  profile: Settings['profile'];
  onSave: (profile: Settings['profile']) => void;
}) => {
  const [name, setName] = useState(profile.name);
  const next = { name: name.trim() };
  const canSave = next.name !== '' && next.name !== profile.name;

  return (
    <form
      className="flex flex-col gap-3"
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
      <Button
        type="submit"
        data-e2e="settings:save-profile"
        disabled={!canSave}
      >
        Zapisz
      </Button>
    </form>
  );
};

const ProfileDialog = () => {
  const ctx = useContext();
  const settings = ctx.useSettings();
  const avatar = ctx.useAvatar();
  const uploading = ctx.useIsUploadingAvatar();
  const error = ctx.useError();
  useModalMounted(PROFILE_MODAL);

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) closeModal(PROFILE_MODAL);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-(--z-modal) bg-overlay" />
        <Dialog.Content
          data-e2e="settings:profile-modal"
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            // Focus the dialog itself: no input grabs focus, so no mobile keyboard pops up.
            e.preventDefault();
            if (e.target instanceof HTMLElement) e.target.focus();
          }}
          className="fixed inset-x-4 bottom-[calc(var(--kb-inset,0rem)+1rem)] z-(--z-modal) mx-auto max-h-[calc(100dvh-var(--kb-inset,0rem)-2rem)] max-w-md animate-pop-in touch-pan-y overflow-y-auto overscroll-contain rounded-2xl bg-card p-4 shadow-popover focus:outline-none motion-reduce:animate-none lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
        >
          <div className="mb-3 flex items-center gap-3">
            <Dialog.Title className="min-w-0 flex-1 truncate text-base font-semibold">
              Edytuj profil
            </Dialog.Title>
            <Dialog.Close
              aria-label="Zamknij"
              className="grid size-8 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <X className="size-4" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="flex flex-col items-center gap-4">
            <ProfileAvatar
              avatar={avatar}
              uploading={uploading}
              onPick={ctx.uploadAvatar}
            />
            {settings ? (
              <div className="w-full">
                <ProfileForm
                  key={settings.profile.name}
                  profile={settings.profile}
                  onSave={(profile) => {
                    ctx.update({ ...settings, profile });
                    closeModal(PROFILE_MODAL);
                  }}
                />
              </div>
            ) : error ? (
              <p role="alert" className="text-sm text-danger">
                <span className="font-mono">{ERROR_CODES.load}</span> {error}
              </p>
            ) : (
              <div aria-hidden="true" className="flex w-full flex-col gap-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-11 w-full" />
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const ProfileEditor = () => {
  const ctx = useContext();
  const { isOpen } = useModal(PROFILE_MODAL);
  const settings = ctx.useSettings();
  const avatar = ctx.useAvatar();
  const notice = ctx.useNotice();

  useEffect(() => {
    if (isOpen) ctx.load();
  }, [isOpen, ctx]);

  // Keep the nav and drawer in step with every edit, saved or still in flight.
  const name = settings?.profile.name;
  const picture = pictureOf(avatar);
  useEffect(() => {
    if (name) setProfileSummary({ name });
  }, [name]);
  useEffect(() => {
    if (picture) setProfileSummary({ avatarUrl: picture });
  }, [picture]);

  return (
    <>
      {isOpen ? <ProfileDialog /> : null}
      {notice ? (
        <Toast
          key={notice.id}
          data-e2e="settings:toast"
          notice={notice}
          onClose={ctx.dismissNotice}
        />
      ) : null}
    </>
  );
};

/** Edits the signed-in user's picture and name. Opens from the account drawer. */
export const ProfileEditModal = () => (
  <Provider>
    <ProfileEditor />
  </Provider>
);

/** Fills in the name and picture the nav shows, once per app load. */
export const AccountProfileSync = () => {
  useEffect(() => {
    const abort = new AbortController();
    fetchSettings(abort.signal).then(
      ({ profile }) => setProfileSummary({ name: profile.name || null }),
      () => undefined,
    );
    fetchAvatar(abort.signal).then(
      (avatar) => setProfileSummary({ avatarUrl: pictureOf(avatar) }),
      () => undefined,
    );
    return () => abort.abort();
  }, []);

  return null;
};
