import { type TriggerEvent } from '@/libs/eda';
import type { CreateEventData } from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_GEOCODE_ADDRESS', { query: string }>
  | TriggerEvent<
      '[TRIGGER]_SUGGEST_KEYWORDS',
      { name: string; description?: string; category?: string }
    >
  | TriggerEvent<'[TRIGGER]_SUBMIT_CREATE_EVENT', { data: CreateEventData }>
  | TriggerEvent<'[TRIGGER]_SET_KEYWORD_INPUT', { value: string }>
  | TriggerEvent<'[TRIGGER]_ADD_KEYWORD', { keyword: string }>
  | TriggerEvent<'[TRIGGER]_REMOVE_KEYWORD', { keyword: string }>
  | TriggerEvent<'[TRIGGER]_ACCEPT_SUGGESTION', { keyword: string }>
  | TriggerEvent<'[TRIGGER]_DISMISS_SUGGESTION', { keyword: string }>;
