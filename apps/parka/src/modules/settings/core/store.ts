import { atom } from '@repo/react-kit/supa-store';
import type { Notice, Settings } from '../domain/models';

export const createStore = () => {
  const $settings = atom<Settings | null>(null);
  const $initializing = atom(true);
  const $isLoading = atom(false);
  const $isSigningOut = atom(false);
  const $error = atom<string | null>(null);
  const $notice = atom<Notice | null>(null);

  return {
    $settings,
    $initializing,
    $isLoading,
    $isSigningOut,
    $error,
    $notice,
  };
};

export type Store = ReturnType<typeof createStore>;
