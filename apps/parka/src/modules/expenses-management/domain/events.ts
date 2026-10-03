import type { TriggerEvent } from '@/libs/eda';
import type { NewExpense, NewRecurring } from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_LOAD'>
  | TriggerEvent<'[TRIGGER]_CREATE_EXPENSE', { expense: NewExpense }>
  | TriggerEvent<'[TRIGGER]_CREATE_RECURRING', { recurring: NewRecurring }>
  | TriggerEvent<'[TRIGGER]_SCAN_RECEIPT', { file: File }>
  | TriggerEvent<'[TRIGGER]_DISMISS_SCAN'>
  | TriggerEvent<'[TRIGGER]_DISMISS_NOTICE'>;
