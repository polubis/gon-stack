import type { TriggerEvent } from '@/libs/eda';
import type { TokenId } from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_LOAD'>
  | TriggerEvent<'[TRIGGER]_CREATE', { name: string; ttlDays: number | null }>
  | TriggerEvent<'[TRIGGER]_RENAME', { id: TokenId; name: string }>
  | TriggerEvent<'[TRIGGER]_ROTATE', { id: TokenId }>
  | TriggerEvent<'[TRIGGER]_REVOKE', { id: TokenId }>
  | TriggerEvent<'[TRIGGER]_REMOVE', { id: TokenId }>
  | TriggerEvent<'[TRIGGER]_DISMISS_SECRET'>
  | TriggerEvent<'[TRIGGER]_DISMISS_NOTICE'>;
