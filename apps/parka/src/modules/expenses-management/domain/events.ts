import type { TriggerEvent } from '@/libs/eda';
import type { RecurringScope } from '@/shared/recurring/occurrences';
import type { NewExpense, NewRecurring, StoredExpense } from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_LOAD'>
  | TriggerEvent<'[TRIGGER]_REFRESH'>
  | TriggerEvent<'[TRIGGER]_CREATE_EXPENSE', { expense: NewExpense }>
  | TriggerEvent<'[TRIGGER]_LOAD_EXPENSE', { id: string }>
  | TriggerEvent<
      '[TRIGGER]_UPDATE_EXPENSE',
      { expense: StoredExpense; scope: RecurringScope }
    >
  | TriggerEvent<'[TRIGGER]_CREATE_RECURRING', { recurring: NewRecurring }>
  | TriggerEvent<'[TRIGGER]_SCAN_RECEIPT', { file: File }>
  | TriggerEvent<'[TRIGGER]_DISMISS_SCAN'>
  | TriggerEvent<'[TRIGGER]_DISMISS_NOTICE'>;
