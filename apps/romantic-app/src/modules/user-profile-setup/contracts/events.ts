import { TriggerEvent } from '../../../libs/eda';
import type { Answers } from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_INIT'>
  | TriggerEvent<'[TRIGGER]_START'>
  | TriggerEvent<'[TRIGGER]_PREV'>
  | TriggerEvent<'[TRIGGER]_NEXT', Partial<Answers>>
  | TriggerEvent<'[TRIGGER]_EDIT_ANSWERS'>;
