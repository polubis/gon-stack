import type { TriggerEvent } from '@/libs/eda';
import type { Expense, ExpenseId, Month } from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_LOAD', { month: Month }>
  | TriggerEvent<'[TRIGGER]_LOAD_EXPENSES'>
  | TriggerEvent<'[TRIGGER]_UPDATE_EXPENSE', { expense: Expense }>
  | TriggerEvent<'[TRIGGER]_DELETE_EXPENSE', { id: ExpenseId }>
  | TriggerEvent<'[TRIGGER]_DISMISS_NOTICE'>;
