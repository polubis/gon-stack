import type { CatalogId, ReelId, TopicId } from '../domain/models';

/** URL ids of the knowledge modals (see `shared/router/modal-stack`). */
export type Entity = 'category' | 'catalog' | 'tag' | 'topic' | 'reel';

/** Entities that have a browse list. */
export type ListEntity = 'category' | 'catalog' | 'tag';

const ENTITIES: readonly Entity[] = [
  'category',
  'catalog',
  'tag',
  'topic',
  'reel',
];

export const BACKLOG_MODAL = 'backlog';
export const FILTERS_MODAL = 'filters';
/** Add-topic form that starts without a study day. */
export const NEW_BACKLOG_TOPIC_MODAL = 'topic-new-backlog';

/** Browse lists of the structure (categories, catalogs, tags). */
export const LIST_MODAL: Record<ListEntity, string> = {
  category: 'categories',
  catalog: 'catalogs',
  tag: 'tags',
};

export const newModal = (entity: Entity): string => `${entity}-new`;
export const editModal = (entity: Entity, id: string): string =>
  `${entity}-edit:${id}`;
export const deleteModal = (entity: Entity, id: string): string =>
  `${entity}-delete:${id}`;

/** Add-topic form with the catalog already chosen. */
export const newTopicInModal = (id: CatalogId): string => `topic-new:${id}`;
export const newTopicCatalogOf = (modal: string): CatalogId | null =>
  modal.startsWith('topic-new:')
    ? (modal.slice('topic-new:'.length) as CatalogId)
    : null;

/** Editor of the reels of a topic. */
export const reelsModal = (id: TopicId): string => `topic-reels:${id}`;
export const reelsTopicOf = (modal: string): TopicId | null =>
  modal.startsWith('topic-reels:')
    ? (modal.slice('topic-reels:'.length) as TopicId)
    : null;

/** Confirmation of removing the picture or clip of a reel. */
export const reelMediaDeleteModal = (id: ReelId): string =>
  `reel-media-delete:${id}`;
export const reelMediaOf = (modal: string): ReelId | null =>
  modal.startsWith('reel-media-delete:')
    ? (modal.slice('reel-media-delete:'.length) as ReelId)
    : null;

/**
 * Entry point of the reel viewer (part 2 renders it): opened from a topic row,
 * lives in the URL stack so Back closes it.
 */
export const REEL_VIEWER_PREFIX = 'knowledge:reel-viewer?topic=';
export const reelViewerModal = (id: TopicId): string =>
  `${REEL_VIEWER_PREFIX}${id}`;
export const viewedTopicOf = (modal: string): TopicId | null =>
  modal.startsWith(REEL_VIEWER_PREFIX)
    ? (modal.slice(REEL_VIEWER_PREFIX.length) as TopicId)
    : null;

export type EntityModal = {
  entity: Entity;
  action: 'new' | 'edit' | 'delete';
  id: string | null;
};

/** `category-edit:<id>` -> its parts; `null` for any other modal. */
export const parseEntityModal = (modal: string): EntityModal | null => {
  for (const entity of ENTITIES) {
    if (modal === newModal(entity)) return { entity, action: 'new', id: null };
    for (const action of ['edit', 'delete'] as const) {
      const prefix = `${entity}-${action}:`;
      if (modal.startsWith(prefix))
        return { entity, action, id: modal.slice(prefix.length) };
    }
  }
  return null;
};
