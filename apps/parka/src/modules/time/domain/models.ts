import type { Brand } from '@repo/type-beast/brand';
import type { Device } from '@/shared/device/domain/models';
import type { RecurringInterval } from '@/shared/recurring/occurrences';
import type { CategoryIconId } from '@/shared/ui/category-icon-ids';

export type TaskId = Brand<string, 'TaskId'>;
export type RecurringId = Brand<string, 'TimeRecurringId'>;
export type CategoryId = Brand<string, 'TimeCategoryId'>;
export type PriorityId = Brand<string, 'TimePriorityId'>;
export type StatusId = Brand<string, 'TimeStatusId'>;

export type Category = {
  id: CategoryId;
  name: string;
  icon: CategoryIconId;
  /** User-picked hex colour (data, not a theme token). */
  color: string;
};

/** A priority is a name plus a weight: 1 (least) .. 10 (most) important. */
export type Priority = { id: PriorityId; name: string; value: number };

/** A step of the task workflow between open and done (`in_progress` is built in). */
export type Status = { id: StatusId; name: string };

export type Task = {
  id: TaskId;
  /** Unique readable key (`ABC-7`) set by the server; `null` until it answers. */
  key: string | null;
  title: string;
  /** Longer notes; `null` when there are none. */
  description: string | null;
  categoryId: CategoryId;
  priorityId: PriorityId;
  /** `YYYY-MM-DD`. */
  day: string;
  /** `HH:MM`; `null` lasts the whole day. */
  at: string | null;
  done: boolean;
  /** Being worked on now; never together with `done`. */
  inProgress: boolean;
  /** Custom step of a started task; `null` is the built-in `in_progress` step. */
  statusId: StatusId | null;
  /** Browser the task was created in; `null` for older tasks and rule occurrences. */
  device: Device | null;
  /** Rule the task came from; `null` for an ordinary one. */
  recurringId: RecurringId | null;
};

/** File kept with a task (the bytes stay on the server). */
export type Attachment = {
  id: string;
  name: string;
  /** Bytes. */
  size: number;
  mime: string;
  /** A video is stored after the upload response. */
  status: 'uploading' | 'ready' | 'failed';
};

/** Note under a task. `bot` names the MCP token that wrote it (never the secret). */
export type TaskComment = {
  id: string;
  body: string;
  /** ISO time it was written. */
  createdAt: string;
  /** ISO time the text last changed; `null` when it never did. */
  editedAt: string | null;
  bot: { name: string; ref: string } | null;
};

/** One immutable fact about a task. `bot` names the MCP token behind it; `null` is the owner. */
export type TaskHistoryEntry = {
  id: string;
  kind:
    | 'created'
    | 'updated'
    | 'attachment_added'
    | 'attachment_removed'
    | 'comment_added'
    | 'comment_edited'
    | 'comment_removed';
  /** Only for `updated`. */
  field:
    | 'title'
    | 'description'
    | 'category'
    | 'priority'
    | 'day'
    | 'at'
    | 'done'
    | 'in_progress'
    | 'status'
    | null;
  from: string | null;
  to: string | null;
  /** ISO time it happened. */
  at: string;
  bot: { name: string; ref: string } | null;
};

/** The account owner: the human side of every comment. */
export type CommentOwner = { name: string; avatarUrl: string | null };

/** A task waiting for a day: same data as a task, nothing about time. */
export type BacklogTask = Pick<
  Task,
  | 'id'
  | 'key'
  | 'title'
  | 'description'
  | 'categoryId'
  | 'priorityId'
  | 'device'
>;

/** Instruction that makes a task on each day of its series. */
export type Recurring = {
  id: RecurringId;
  title: string;
  description: string | null;
  categoryId: CategoryId;
  priorityId: PriorityId;
  /** `HH:MM`; `null` lasts the whole day. */
  at: string | null;
  interval: RecurringInterval;
  /** `YYYY-MM-DD`, first occurrence. */
  startDate: string;
  /** `YYYY-MM-DD`; `null` never ends. */
  endDate: string | null;
};

export type TimeKind = 'day' | 'week' | 'month' | 'year';

export type NoticeBody =
  | {
      tone: 'success';
      message: string;
      /** Navigates on from the toast. */
      action?: { label: string; run: () => void };
    }
  | {
      tone: 'error';
      title: string;
      code: string;
      description: string;
      /** Re-runs the failed action. */
      retry?: () => void;
    };

export type Notice = { id: number } & NoticeBody;
