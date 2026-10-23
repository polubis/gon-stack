import { atom } from '@repo/react-kit/supa-store';
import type { AccessToken, Notice, Secret, TokenId } from '../domain/models';

export const createStore = () => {
  const $tokens = atom<AccessToken[]>([]);
  const $secret = atom<Secret | null>(null);
  /** Tokens a request is in flight for (rotation can not be optimistic). */
  const $busyIds = atom<TokenId[]>([]);
  const $isCreating = atom(false);
  const $initializing = atom(true);
  const $isLoading = atom(false);
  const $error = atom<string | null>(null);
  const $notice = atom<Notice | null>(null);

  return {
    $tokens,
    $secret,
    $busyIds,
    $isCreating,
    $initializing,
    $isLoading,
    $error,
    $notice,
  };
};

export type Store = ReturnType<typeof createStore>;
