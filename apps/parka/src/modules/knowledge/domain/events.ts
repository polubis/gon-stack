import type { TriggerEvent } from '@/libs/eda';
import type { KnowledgeFilters } from './filters';
import type {
  Catalog,
  CatalogId,
  Category,
  CategoryId,
  Reel,
  ReelId,
  Tag,
  TagId,
  Topic,
  TopicId,
} from './models';

/** What the lists show: the period of study days plus the filters. */
export type View = { from: string; to: string; filters: KnowledgeFilters };

export type Event =
  | TriggerEvent<'[TRIGGER]_LOAD', { view: View }>
  | TriggerEvent<'[TRIGGER]_CREATE_CATEGORY', { category: Category }>
  | TriggerEvent<'[TRIGGER]_UPDATE_CATEGORY', { category: Category }>
  | TriggerEvent<'[TRIGGER]_DELETE_CATEGORY', { id: CategoryId }>
  | TriggerEvent<'[TRIGGER]_CREATE_CATALOG', { catalog: Catalog }>
  | TriggerEvent<'[TRIGGER]_UPDATE_CATALOG', { catalog: Catalog }>
  | TriggerEvent<'[TRIGGER]_DELETE_CATALOG', { id: CatalogId }>
  | TriggerEvent<'[TRIGGER]_CREATE_TAG', { tag: Tag }>
  | TriggerEvent<'[TRIGGER]_UPDATE_TAG', { tag: Tag }>
  | TriggerEvent<'[TRIGGER]_DELETE_TAG', { id: TagId }>
  | TriggerEvent<'[TRIGGER]_CREATE_TOPIC', { topic: Topic }>
  | TriggerEvent<'[TRIGGER]_UPDATE_TOPIC', { topic: Topic }>
  | TriggerEvent<'[TRIGGER]_DELETE_TOPIC', { id: TopicId }>
  | TriggerEvent<'[TRIGGER]_LOAD_REELS', { topicId: TopicId }>
  | TriggerEvent<'[TRIGGER]_CREATE_REEL', { reel: Reel }>
  | TriggerEvent<'[TRIGGER]_UPDATE_REEL', { reel: Reel }>
  | TriggerEvent<'[TRIGGER]_DELETE_REEL', { id: ReelId }>
  | TriggerEvent<'[TRIGGER]_UPLOAD_REEL_MEDIA', { reelId: ReelId; file: File }>
  | TriggerEvent<'[TRIGGER]_REMOVE_REEL_MEDIA', { reelId: ReelId }>
  | TriggerEvent<'[TRIGGER]_SET_PROGRESS', { reelId: ReelId; done: boolean }>
  | TriggerEvent<'[TRIGGER]_LOAD_DEMO'>
  | TriggerEvent<'[TRIGGER]_DISMISS_NOTICE'>;
