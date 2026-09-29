import type { TriggerEvent } from '@/libs/eda';
import type { Settings } from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_LOAD'>
  | TriggerEvent<'[TRIGGER]_UPDATE', { settings: Settings }>
  | TriggerEvent<'[TRIGGER]_SIGN_OUT'>
  | TriggerEvent<'[TRIGGER]_DISMISS_NOTICE'>;
