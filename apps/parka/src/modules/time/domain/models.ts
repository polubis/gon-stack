import type { Brand } from '@repo/type-beast/brand';
import type { CategoryIconId } from '@/shared/ui/category-icon-ids';

export type TaskId = Brand<string, 'TaskId'>;
export type CategoryId = Brand<string, 'TimeCategoryId'>;
export type PriorityId = Brand<string, 'TimePriorityId'>;

export type Category = {
  id: CategoryId;
  name: string;
  icon: CategoryIconId;
  /** User-picked hex colour (data, not a theme token). */
  color: string;
};

/** A priority is a name plus a weight: 1 (least) .. 10 (most) important. */
export type Priority = { id: PriorityId; name: string; value: number };

export type Task = {
  id: TaskId;
  title: string;
  categoryId: CategoryId;
  priorityId: PriorityId;
  /** `YYYY-MM-DD`. */
  day: string;
  /** `HH:MM`; `null` lasts the whole day. */
  at: string | null;
  done: boolean;
};

export type TimeKind = 'day' | 'week' | 'month' | 'year';

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
