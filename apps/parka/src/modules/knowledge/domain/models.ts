import type { Brand } from '@repo/type-beast/brand';
import type { CategoryIconId } from '@/shared/ui/category-icon-ids';
import type { BrainAreaId } from './brain-area';

export type NodeId = Brand<string, 'KnowledgeNodeId'>;
export type FolderId = Brand<string, 'KnowledgeFolderId'>;
export type CategoryId = Brand<string, 'KnowledgeCategoryId'>;
export type PriorityId = Brand<string, 'KnowledgePriorityId'>;

export type Category = {
  id: CategoryId;
  name: string;
  icon: CategoryIconId;
  /** User-picked hex colour (data, not a theme token). */
  color: string;
};

/** A priority is a name plus a weight: 1 (least) .. 10 (most) urgent to learn. */
export type Priority = { id: PriorityId; name: string; value: number };

/** Groups knowledge and points at the brain area it lives in. */
export type Folder = { id: FolderId; name: string; areaId: BrainAreaId };

/** Where a piece of knowledge stands: not touched, in study, mastered. */
export type LearnStatus = 'to-learn' | 'learning' | 'learned';

export type KnowledgeNode = {
  id: NodeId;
  folderId: FolderId;
  title: string;
  /** Longer notes; `null` when there are none. */
  notes: string | null;
  categoryId: CategoryId;
  priorityId: PriorityId;
  tags: string[];
  status: LearnStatus;
};

export type NoticeBody =
  | { tone: 'success'; message: string }
  | {
      tone: 'error';
      title: string;
      code: string;
      description: string;
      /** Re-runs the failed action. */
      retry?: () => void;
    };

export type Notice = { id: number } & NoticeBody;
