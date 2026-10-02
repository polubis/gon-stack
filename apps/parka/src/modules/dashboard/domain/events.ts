import type { TriggerEvent } from '@/libs/eda';
import type { Expense, ExpenseId, Goal, Limit, LimitId, Month } from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_LOAD', { month: Month }>
  | TriggerEvent<'[TRIGGER]_LOAD_EXPENSES'>
  | TriggerEvent<'[TRIGGER]_UPDATE_EXPENSE', { expense: Expense }>
  | TriggerEvent<'[TRIGGER]_DELETE_EXPENSE', { id: ExpenseId }>
  | TriggerEvent<'[TRIGGER]_LOAD_LIMITS'>
  | TriggerEvent<'[TRIGGER]_CREATE_LIMIT', { limit: Limit }>
  | TriggerEvent<'[TRIGGER]_UPDATE_LIMIT', { limit: Limit }>
  | TriggerEvent<'[TRIGGER]_DELETE_LIMIT', { id: LimitId }>
  | TriggerEvent<'[TRIGGER]_CREATE_GOAL', { goal: Goal }>
  | TriggerEvent<'[TRIGGER]_DISMISS_NOTICE'>;
