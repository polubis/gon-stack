import type { FactEvent, TaskEvent, TriggerEvent } from '@/libs/eda';
import type {
  Expense,
  ExpenseId,
  Limit,
  LimitId,
  Month,
  Recurring,
  RecurringId,
} from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_LOAD', { month: Month }>
  | TriggerEvent<'[TRIGGER]_CREATE_EXPENSE', { expense: Expense; month: Month }>
  | TriggerEvent<'[TRIGGER]_UPDATE_EXPENSE', { expense: Expense; month: Month }>
  | TriggerEvent<'[TRIGGER]_DELETE_EXPENSE', { id: ExpenseId; month: Month }>
  | TriggerEvent<'[TRIGGER]_CREATE_LIMIT', { limit: Limit }>
  | TriggerEvent<'[TRIGGER]_UPDATE_LIMIT', { limit: Limit }>
  | TriggerEvent<'[TRIGGER]_DELETE_LIMIT', { id: LimitId }>
  | TriggerEvent<
      '[TRIGGER]_CREATE_RECURRING',
      { recurring: Recurring; month: Month }
    >
  | TriggerEvent<
      '[TRIGGER]_UPDATE_RECURRING',
      { recurring: Recurring; month: Month }
    >
  | TriggerEvent<
      '[TRIGGER]_DELETE_RECURRING',
      { id: RecurringId; month: Month }
    >
  | TriggerEvent<'[TRIGGER]_DISMISS_NOTICE'>
  | TaskEvent<'[TASK]_LOAD', { month: Month }>
  | TaskEvent<'[TASK]_REFRESH_SUMMARY', { month: Month }>
  | FactEvent<'[FACT]_RECURRING_CHANGED', { month: Month }>
  | FactEvent<'[FACT]_EXPENSE_CHANGED', { month: Month }>;
