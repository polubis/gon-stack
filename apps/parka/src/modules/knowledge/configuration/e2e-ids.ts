export const KNOWLEDGE_E2E_IDS = [
  'knowledge:main',
  'knowledge:toast',
  'knowledge:load-error',
  'knowledge:skeleton',
  'knowledge:hero',
  'knowledge:brain',
  'knowledge:progress',
  'knowledge:cortex',
  'knowledge:folders',
  'knowledge:empty',
  'knowledge:empty-search',
  'knowledge:search',
  'knowledge:add-trigger',
  'knowledge:add-fab',
  'knowledge:folder-add',
  'knowledge:stats',
  'knowledge:stats-empty',
  'knowledge:node-dialog',
  'knowledge:node-form',
  'knowledge:node-title',
  'knowledge:node-notes',
  'knowledge:node-tags',
  'knowledge:node-folder',
  'knowledge:node-category',
  'knowledge:node-priority',
  'knowledge:node-status',
  'knowledge:node-save',
  'knowledge:node-cancel',
  'knowledge:folder-dialog',
  'knowledge:folder-form',
  'knowledge:folder-name',
  'knowledge:folder-area',
  'knowledge:folder-save',
  'knowledge:folder-cancel',
  'knowledge:delete-dialog',
  'knowledge:delete-confirm',
  'knowledge:delete-cancel',
] as const;

export type KnowledgeDynamicE2eId =
  | `knowledge:folder:${string}`
  | `knowledge:folder-toggle:${string}`
  | `knowledge:folder-new-node:${string}`
  | `knowledge:node:${string}`
  | `knowledge:node-status:${string}`
  | `knowledge:node-edit:${string}`
  | `knowledge:node-delete:${string}`
  | `knowledge:modal-close:${string}`;

export type KnowledgeE2eId =
  (typeof KNOWLEDGE_E2E_IDS)[number] | KnowledgeDynamicE2eId;
