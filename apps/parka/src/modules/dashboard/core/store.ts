import { atom } from '@repo/react-kit/supa-store';
import type { Category, Expense, Notice, Summary } from '../domain/models';

export const createStore = () => {
  const $data = atom<Summary | null>(null);
  const $initializing = atom(true);
  const $isLoading = atom(false);
  const $error = atom<string | null>(null);
  const $expenses = atom<Expense[]>([]);
  const $categories = atom<Category[]>([]);
  const $expensesInitializing = atom(true);
  const $expensesLoading = atom(false);
  const $expensesError = atom<string | null>(null);
  const $notice = atom<Notice | null>(null);

  return {
    $data,
    $initializing,
    $isLoading,
    $error,
    $expenses,
    $categories,
    $expensesInitializing,
    $expensesLoading,
    $expensesError,
    $notice,
  };
};

export type Store = ReturnType<typeof createStore>;
