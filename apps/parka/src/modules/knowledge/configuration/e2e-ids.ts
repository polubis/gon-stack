export const KNOWLEDGE_E2E_IDS = [
  'knowledge:main',
  'knowledge:toast',
  'knowledge:load-error',
  'knowledge:skeleton',
  'knowledge:summary',
  'knowledge:progress',
  'knowledge:total',
  'knowledge:done',
  'knowledge:unfinished',
  'knowledge:catalog-prev',
  'knowledge:catalog-next',
  'knowledge:catalog-picker',
  'knowledge:catalog-label',
  'knowledge:list',
  'knowledge:empty',
  'knowledge:empty-demo',
  'knowledge:empty-catalog',
  'knowledge:empty-filters',
  'knowledge:empty-clear-filters',
  'knowledge:demo',
  'knowledge:add-trigger',
  'knowledge:add-fab',
  'knowledge:add-menu',
  'knowledge:filters-open',
  'knowledge:filters-drawer',
  'knowledge:filters-clear',
  'knowledge:filters-apply',
  'knowledge:filter-query',
  'knowledge:backlog-open',
  'knowledge:backlog-dialog',
  'knowledge:structure-open',
  'knowledge:list-dialog',
  'knowledge:list-add',
  'knowledge:topic-dialog',
  'knowledge:topic-title',
  'knowledge:topic-description',
  'knowledge:topic-catalog',
  'knowledge:catalog-manage',
  'knowledge:tag-manage',
  'knowledge:topic-day',
  'knowledge:topic-save',
  'knowledge:topic-cancel',
  'knowledge:topic-delete',
  'knowledge:category-dialog',
  'knowledge:category-name',
  'knowledge:category-save',
  'knowledge:category-cancel',
  'knowledge:category-delete',
  'knowledge:catalog-dialog',
  'knowledge:catalog-name',
  'knowledge:catalog-description',
  'knowledge:catalog-category',
  'knowledge:catalog-save',
  'knowledge:catalog-cancel',
  'knowledge:catalog-delete',
  'knowledge:tag-dialog',
  'knowledge:tag-name',
  'knowledge:tag-save',
  'knowledge:tag-cancel',
  'knowledge:tag-delete',
  'knowledge:form-color',
  'knowledge:delete-dialog',
  'knowledge:delete-confirm',
  'knowledge:delete-cancel',
  'knowledge:reels-dialog',
  'knowledge:reel-body',
  'knowledge:reel-add',
  'knowledge:reel-viewer',
  'knowledge:viewer-title',
  'knowledge:viewer-status',
  'knowledge:viewer-stage',
  'knowledge:viewer-skeleton',
  'knowledge:viewer-error',
  'knowledge:viewer-complete',
  'knowledge:viewer-prev',
  'knowledge:viewer-reset',
  'knowledge:viewer-next',
  'knowledge:viewer-prev-lesson-cta',
  'knowledge:viewer-next-lesson-cta',
] as const;

export type KnowledgeDynamicE2eId =
  | `knowledge:category:${string}`
  | `knowledge:catalog:${string}`
  | `knowledge:catalog-option:${string}`
  | `knowledge:topic:${string}`
  | `knowledge:topic-toggle:${string}`
  | `knowledge:topic-play:${string}`
  | `knowledge:topic-edit:${string}`
  | `knowledge:topic-reels:${string}`
  | `knowledge:topic-delete:${string}`
  | `knowledge:topic-reset:${string}`
  | `knowledge:topic-more:${string}`
  | `knowledge:structure-open:${string}`
  | `knowledge:list-edit:${string}`
  | `knowledge:reel:${string}`
  | `knowledge:viewer-reel:${string}`
  | `knowledge:viewer-segment:${string}`
  | `knowledge:reel-upload:${string}`
  | `knowledge:reel-media-remove:${string}`
  | `knowledge:reel-media:${string}`
  | `knowledge:reel-preview:${string}`
  | `knowledge:reel-save:${string}`
  | `knowledge:reel-up:${string}`
  | `knowledge:reel-down:${string}`
  | `knowledge:reel-delete:${string}`
  | `knowledge:reel-body:${string}`
  | `knowledge:add-option:${string}`
  | `knowledge:form-color-option:${string}`
  | `knowledge:tag-chip:${string}`
  | `knowledge:modal-close:${string}`;

export type KnowledgeE2eId =
  (typeof KNOWLEDGE_E2E_IDS)[number] | KnowledgeDynamicE2eId;
