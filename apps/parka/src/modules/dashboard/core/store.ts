import { atom } from '@repo/react-kit/supa-store';
import type {
  Category,
  Expense,
  Goal,
  Limit,
  Notice,
  Recurring,
  Summary,
} from '../domain/models';

export const createStore = () => {
  /** Flips on the first load start; nothing is shown before it. */
  const $initialized = atom(false);
  /** One flag for the whole screen: all or nothing. */
  const $loading = atom(false);
  const $error = atom<string | null>(null);
  const $data = atom<Summary | null>(null);
  const $expenses = atom<Expense[]>([]);
  const $categories = atom<Category[]>([]);
  const $limits = atom<Limit[]>([]);
  const $goals = atom<Goal[]>([]);
  const $recurring = atom<Recurring[]>([]);
  const $notice = atom<Notice | null>(null);

  return {
    $initialized,
    $loading,
    $error,
    $data,
    $expenses,
    $categories,
    $limits,
    $goals,
    $recurring,
    $notice,
  };
};

export type Store = ReturnType<typeof createStore>;
