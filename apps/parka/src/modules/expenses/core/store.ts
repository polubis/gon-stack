import { atom } from '@repo/react-kit/supa-store';
import type { Category, Expense } from '../domain/models';

export const createStore = () => {
  const $expenses = atom<Expense[]>([]);
  const $categories = atom<Category[]>([]);
  const $initializing = atom(true);
  const $isLoading = atom(false);
  const $error = atom<string | null>(null);

  return { $expenses, $categories, $initializing, $isLoading, $error };
};

export type Store = ReturnType<typeof createStore>;
