import type { TriggerEvent } from '@/libs/eda';
import type { Recurring } from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_LOAD'>
  | TriggerEvent<'[TRIGGER]_UPDATE', { recurring: Recurring }>
  | TriggerEvent<'[TRIGGER]_DISMISS_NOTICE'>;
