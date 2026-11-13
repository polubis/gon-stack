import { atom } from '@repo/react-kit/supa-store';
import type { Notice, Notification, NotificationId } from '../domain/models';

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
  /** Select mode: rows show a checkbox and the header offers the bulk menu. */
  const $selecting = atom(false);
  const $selected = atom<NotificationId[]>([]);

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
    $selecting,
    $selected,
  };
};

export type Store = ReturnType<typeof createStore>;
