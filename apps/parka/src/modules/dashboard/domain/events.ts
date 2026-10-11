import type { FactEvent, TaskEvent, TriggerEvent } from '@/libs/eda';
import type {
  Expense,
  ExpenseId,
  Limit,
  LimitId,
  Period,
  Recurring,
  RecurringId,
} from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_LOAD', { period: Period }>
  | TriggerEvent<
      '[TRIGGER]_UPDATE_EXPENSE',
      { expense: Expense; period: Period }
    >
  | TriggerEvent<'[TRIGGER]_DELETE_EXPENSE', { id: ExpenseId; period: Period }>
  | TriggerEvent<'[TRIGGER]_CREATE_LIMIT', { limit: Limit }>
  | TriggerEvent<'[TRIGGER]_UPDATE_LIMIT', { limit: Limit }>
  | TriggerEvent<'[TRIGGER]_DELETE_LIMIT', { id: LimitId }>
  | TriggerEvent<
      '[TRIGGER]_UPDATE_RECURRING',
      { recurring: Recurring; period: Period }
    >
  | TriggerEvent<
      '[TRIGGER]_DELETE_RECURRING',
      { id: RecurringId; period: Period }
    >
  | TriggerEvent<'[TRIGGER]_DISMISS_NOTICE'>
  | TaskEvent<'[TASK]_LOAD', { period: Period }>
  | FactEvent<'[FACT]_RECURRING_CHANGED', { period: Period }>
  | FactEvent<'[FACT]_EXPENSE_CHANGED', { period: Period }>;
