import { type TriggerEvent } from '../../../libs/eda';
import { type Answers } from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_INIT'>
  | TriggerEvent<'[TRIGGER]_START'>
  | TriggerEvent<'[TRIGGER]_PREV'>
  | TriggerEvent<'[TRIGGER]_NEXT', Answers>
  | TriggerEvent<'[TRIGGER]_EDIT_ANSWERS'>
  | TriggerEvent<'[TRIGGER]_SAVE_ANSWERS'>;
