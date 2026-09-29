import type { TriggerEvent } from '@/libs/eda';
import type { NewReceipt } from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_LOAD'>
  | TriggerEvent<'[TRIGGER]_SAVE', { receipt: NewReceipt }>
  | TriggerEvent<'[TRIGGER]_DISMISS_NOTICE'>;
