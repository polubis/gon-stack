import { atom } from '@repo/react-kit/supa-store';
import type { Category, Notice } from '../domain/models';

export const createStore = () => {
  const $categories = atom<Category[]>([]);
  const $initializing = atom(true);
  const $isLoading = atom(false);
  const $error = atom<string | null>(null);
  const $notice = atom<Notice | null>(null);

  return { $categories, $initializing, $isLoading, $error, $notice };
};

export type Store = ReturnType<typeof createStore>;
