import { atom } from '@/libs/supa-store';
import type { UserProfile } from '../domain/models';

export const createStore = () => {
  const $userProfile = atom<UserProfile | null>(null);
  const $profileLoading = atom(false);
  const $profileError = atom<string | null>(null);

  const $logoutLoading = atom(false);
  const $logoutError = atom<string | null>(null);

  return {
    $userProfile,
    $profileLoading,
    $profileError,
    $logoutLoading,
    $logoutError,
  };
};

export type Store = ReturnType<typeof createStore>;
