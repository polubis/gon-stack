import type { TriggerEvent } from '@/libs/eda';

export type Event =
  | TriggerEvent<'[TRIGGER]_GET_USER_PROFILE'>
  | TriggerEvent<'[TRIGGER]_LOGOUT'>;
