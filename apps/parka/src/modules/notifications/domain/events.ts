import type { TriggerEvent } from '@/libs/eda';
import type { NotificationId } from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_LOAD'>
  | TriggerEvent<'[TRIGGER]_LOAD_MORE'>
  | TriggerEvent<'[TRIGGER]_MARK_READ', { id: NotificationId }>
  | TriggerEvent<'[TRIGGER]_MARK_ALL_READ'>
  | TriggerEvent<'[TRIGGER]_TOGGLE_SELECTING'>
  | TriggerEvent<'[TRIGGER]_TOGGLE_SELECTED', { id: NotificationId }>
  | TriggerEvent<'[TRIGGER]_SELECT_ALL'>
  | TriggerEvent<'[TRIGGER]_DELETE_SELECTED'>
  | TriggerEvent<'[TRIGGER]_DISMISS_NOTICE'>;
