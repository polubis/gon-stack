import type { TriggerEvent } from '@/libs/eda';
import type { Category, CategoryId } from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_LOAD'>
  | TriggerEvent<'[TRIGGER]_CREATE', { category: Category }>
  | TriggerEvent<'[TRIGGER]_UPDATE', { category: Category }>
  | TriggerEvent<'[TRIGGER]_REMOVE', { id: CategoryId }>
  | TriggerEvent<'[TRIGGER]_DISMISS_NOTICE'>;
