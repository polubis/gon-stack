import { atom } from '@repo/react-kit/supa-store';
import type {
  Category,
  Expense,
  Goal,
  Limit,
  Month,
  Notice,
  Recurring,
  Summary,
} from '../domain/models';

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
  const $limits = atom<Limit[]>([]);
  const $goals = atom<Goal[]>([]);
  const $limitsInitializing = atom(true);
  const $limitsLoading = atom(false);
  const $limitsError = atom<string | null>(null);
  const $recurring = atom<Recurring[]>([]);
  const $recurringInitializing = atom(true);
  const $recurringError = atom<string | null>(null);
  /** Month the summary was last asked for; re-asked after recurring edits. */
  const $month = atom<Month | null>(null);
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
    $limits,
    $goals,
    $limitsInitializing,
    $limitsLoading,
    $limitsError,
    $recurring,
    $recurringInitializing,
    $recurringError,
    $month,
    $notice,
  };
};

export type Store = ReturnType<typeof createStore>;
