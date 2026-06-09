import { type TriggerEvent } from '@/libs/eda';

export type Event =
  | TriggerEvent<'[TRIGGER]_BOOTSTRAP'>
  | TriggerEvent<'[TRIGGER]_SELECT_THREAD', { threadId: string }>
  | TriggerEvent<'[TRIGGER]_UPDATE_DRAFT', { body: string }>
  | TriggerEvent<'[TRIGGER]_SEND_MESSAGE'>
  | TriggerEvent<'[TRIGGER]_RETRY_CONNECTION'>
  | TriggerEvent<'[TRIGGER]_UPDATE_SEARCH', { query: string }>;
