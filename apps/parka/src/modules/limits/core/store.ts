import { atom } from '@repo/react-kit/supa-store';
import type { Category, Expense, Goal, Limit, Notice } from '../domain/models';

export const createStore = () => {
  const $limits = atom<Limit[]>([]);
  const $goals = atom<Goal[]>([]);
  const $categories = atom<Category[]>([]);
  const $expenses = atom<Expense[]>([]);
  const $initializing = atom(true);
  const $isLoading = atom(false);
  const $error = atom<string | null>(null);
  const $notice = atom<Notice | null>(null);

  return {
    $limits,
    $goals,
    $categories,
    $expenses,
    $initializing,
    $isLoading,
    $error,
    $notice,
  };
};

export type Store = ReturnType<typeof createStore>;
