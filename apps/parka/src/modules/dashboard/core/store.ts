import { atom } from '@repo/react-kit/supa-store';
import type { Avatar } from '@/shared/avatar/domain/models';
import type {
  Category,
  Expense,
  Limit,
  Notice,
  Period,
  Recurring,
} from '../domain/models';

export const createStore = () => {
  /** Flips on the first load start; nothing is shown before it. */
  const $initialized = atom(false);
  /** One flag for the whole screen: all or nothing. */
  const $loading = atom(false);
  const $error = atom<string | null>(null);
  /** Set once the reads landed: moving between periods needs no more. */
  const $ready = atom(false);
  const $expenses = atom<Expense[]>([]);
  const $categories = atom<Category[]>([]);
  const $limits = atom<Limit[]>([]);
  const $recurring = atom<Recurring[]>([]);
  const $notice = atom<Notice | null>(null);
  /** Period asked for last; a silent refresh reloads it. */
  const $period = atom<Period | null>(null);
  const $avatar = atom<Avatar | null>(null);

  return {
    $initialized,
    $loading,
    $error,
    $ready,
    $expenses,
    $categories,
    $limits,
    $recurring,
    $notice,
    $period,
    $avatar,
  };
};

export type Store = ReturnType<typeof createStore>;
