import type { TriggerEvent } from '@/libs/eda';
import type { Expense, ExpenseId } from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_LOAD'>
  | TriggerEvent<'[TRIGGER]_UPDATE', { expense: Expense }>
  | TriggerEvent<'[TRIGGER]_DELETE', { id: ExpenseId }>
  | TriggerEvent<'[TRIGGER]_DISMISS_NOTICE'>;
