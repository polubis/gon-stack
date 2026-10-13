import { atom } from '@repo/react-kit/supa-store';
import type { Avatar, Notice, Settings } from '../domain/models';

export const createStore = () => {
  const $settings = atom<Settings | null>(null);
  const $avatar = atom<Avatar | null>(null);
  const $isUploadingAvatar = atom(false);
  const $uploadingDeviceIds = atom<string[]>([]);
  const $initializing = atom(true);
  const $isLoading = atom(false);
  const $isSigningOut = atom(false);
  const $error = atom<string | null>(null);
  const $notice = atom<Notice | null>(null);

  return {
    $settings,
    $avatar,
    $isUploadingAvatar,
    $uploadingDeviceIds,
    $initializing,
    $isLoading,
    $isSigningOut,
    $error,
    $notice,
  };
};

export type Store = ReturnType<typeof createStore>;
