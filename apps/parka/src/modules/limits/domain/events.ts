import type { TriggerEvent } from '@/libs/eda';
import type { Goal, Limit } from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_LOAD'>
  | TriggerEvent<'[TRIGGER]_CREATE_LIMIT', { limit: Limit }>
  | TriggerEvent<'[TRIGGER]_UPDATE_LIMIT', { limit: Limit }>
  | TriggerEvent<'[TRIGGER]_CREATE_GOAL', { goal: Goal }>
  | TriggerEvent<'[TRIGGER]_DISMISS_NOTICE'>;
