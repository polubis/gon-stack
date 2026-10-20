import type { TriggerEvent } from '@/libs/eda';
import type {
  Category,
  Priority,
  Recurring,
  RecurringId,
  Task,
  TaskId,
} from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_LOAD', { from: string; to: string }>
  | TriggerEvent<'[TRIGGER]_CREATE_TASK', { task: Task }>
  | TriggerEvent<'[TRIGGER]_UPDATE_TASK', { task: Task }>
  | TriggerEvent<'[TRIGGER]_DELETE_TASK', { id: TaskId }>
  | TriggerEvent<'[TRIGGER]_CREATE_RECURRING', { recurring: Recurring }>
  | TriggerEvent<'[TRIGGER]_STOP_RECURRING', { id: RecurringId }>
  | TriggerEvent<'[TRIGGER]_CREATE_CATEGORY', { category: Category }>
  | TriggerEvent<'[TRIGGER]_CREATE_PRIORITY', { priority: Priority }>
  | TriggerEvent<'[TRIGGER]_DISMISS_NOTICE'>;
