import type { TriggerEvent } from '@/libs/eda';
import type {
  Expense,
  ExpenseId,
  Goal,
  GoalId,
  Limit,
  LimitId,
  Month,
  Recurring,
  RecurringId,
} from './models';

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
  | TriggerEvent<'[TRIGGER]_UPDATE_GOAL', { goal: Goal }>
  | TriggerEvent<'[TRIGGER]_DELETE_GOAL', { id: GoalId }>
  | TriggerEvent<'[TRIGGER]_LOAD_RECURRING'>
  | TriggerEvent<'[TRIGGER]_CREATE_RECURRING', { recurring: Recurring }>
  | TriggerEvent<'[TRIGGER]_UPDATE_RECURRING', { recurring: Recurring }>
  | TriggerEvent<'[TRIGGER]_DELETE_RECURRING', { id: RecurringId }>
  | TriggerEvent<'[TRIGGER]_DISMISS_NOTICE'>;
