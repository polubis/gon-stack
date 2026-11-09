import type { TriggerEvent } from '@/libs/eda';

export type Event =
  TriggerEvent<'[TRIGGER]_LOAD'> | TriggerEvent<'[TRIGGER]_REFRESH'>;
