import { atom } from '@repo/react-kit/supa-store';
import type { Notification } from '../domain/models';

export const createStore = () => {
  const $notifications = atom<Notification[]>([]);
  const $initializing = atom(true);
  const $isLoading = atom(false);
  const $error = atom<string | null>(null);

  return { $notifications, $initializing, $isLoading, $error };
};

export type Store = ReturnType<typeof createStore>;
