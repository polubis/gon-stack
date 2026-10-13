import { atom } from '@repo/react-kit/supa-store';
import type { Notice, Notification } from '../domain/models';

export const createStore = () => {
  const $notifications = atom<Notification[]>([]);
  /** Server total; the loaded pages may hold fewer unread rows. */
  const $unread = atom(0);
  const $nextCursor = atom<string | null>(null);
  const $initializing = atom(true);
  const $isLoading = atom(false);
  const $loadingMore = atom(false);
  const $moreError = atom<string | null>(null);
  const $error = atom<string | null>(null);
  const $notice = atom<Notice | null>(null);

  return {
    $notifications,
    $unread,
    $nextCursor,
    $initializing,
    $isLoading,
    $loadingMore,
    $moreError,
    $error,
    $notice,
  };
};

export type Store = ReturnType<typeof createStore>;
