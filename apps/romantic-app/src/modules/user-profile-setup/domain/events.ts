import { type TriggerEvent, type TaskEvent, type FactEvent, type EffectEvent } from '@/libs/eda';
import { type Answers, type Step } from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_INIT'>
  | TriggerEvent<'[TRIGGER]_START'>
  | TriggerEvent<'[TRIGGER]_PREV'>
  | TriggerEvent<'[TRIGGER]_NEXT', Answers>
  | TriggerEvent<'[TRIGGER]_EDIT_ANSWERS'>
  | TriggerEvent<'[TRIGGER]_SAVE_ANSWERS'>
  | TaskEvent<'[TASK]_FETCH_CONFIG'>
  | FactEvent<'[FACT]_CONFIG_LOADED', { config: Step[] }>
  | EffectEvent<'[EFFECT]_LOG_ERROR', { error: Error }>;
