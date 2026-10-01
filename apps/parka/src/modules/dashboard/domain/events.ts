import type { TriggerEvent } from '@/libs/eda';
import type { Expense, ExpenseId, Month, Range } from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_LOAD', { month: Month; range: Range }>
  | TriggerEvent<'[TRIGGER]_LOAD_EXPENSES'>
  | TriggerEvent<'[TRIGGER]_UPDATE_EXPENSE', { expense: Expense }>
  | TriggerEvent<'[TRIGGER]_DELETE_EXPENSE', { id: ExpenseId }>
  | TriggerEvent<'[TRIGGER]_DISMISS_NOTICE'>;
