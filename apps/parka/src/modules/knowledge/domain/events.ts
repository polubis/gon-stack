import type { TriggerEvent } from '@/libs/eda';
import type { Folder, KnowledgeNode, NodeId } from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_LOAD'>
  | TriggerEvent<'[TRIGGER]_CREATE_NODE', { node: KnowledgeNode }>
  | TriggerEvent<
      '[TRIGGER]_UPDATE_NODE',
      { node: KnowledgeNode; message?: string }
    >
  | TriggerEvent<'[TRIGGER]_DELETE_NODE', { id: NodeId }>
  | TriggerEvent<'[TRIGGER]_CREATE_FOLDER', { folder: Folder }>
  | TriggerEvent<'[TRIGGER]_DISMISS_NOTICE'>;
