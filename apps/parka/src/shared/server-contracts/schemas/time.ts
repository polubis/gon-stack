import z from 'zod';
import { attachmentRejection } from '../../attachments/rules';
import { isTimeZone } from '../../date/date';
import { daysBetween, isDay } from '../../period/period';
import {
  conflictOut,
  errorOut,
  notFoundOut,
  timeBacklogTask,
  timeCategory,
  timeCategoryInput,
  timePriority,
  timeRecurring,
  timeStatus,
  timeTask,
} from './general';

/** A year view plus slack. */
const MAX_RANGE_DAYS = 400;

const writeErrors = z.union([errorOut(), notFoundOut()]);

/**
 * Categories, priorities and the tasks with a day. Without `from` all of them
 * come back; `to` is how far recurring rules are turned into tasks.
 */
export const listTimeSchema = () =>
  z.object({
    in: z
      .object({
        from: z.string().refine(isDay, 'Invalid day').optional(),
        to: z.string().refine(isDay, 'Invalid day'),
        /** Zone whose clock decides when today is over. */
        tz: z.string().refine(isTimeZone, 'Unknown time zone').optional(),
      })
      .refine(
        ({ from, to }) =>
          from === undefined ||
          (from <= to && daysBetween(from, to) <= MAX_RANGE_DAYS),
        'Invalid range',
      ),
    out: z.union([
      z.object({
        code: z.literal(200),
        data: z.object({
          categories: z.array(timeCategory()),
          priorities: z.array(timePriority()),
          /** The steps between open and done, in order. */
          statuses: z.array(timeStatus()),
          tasks: z.array(timeTask()),
          /** Tasks without a day, whatever the range. */
          backlog: z.array(timeBacklogTask()),
        }),
      }),
      errorOut(),
    ]),
  });

export const createTimeTaskSchema = () =>
  z.object({
    in: timeTask(),
    out: z.union([
      z.object({ code: z.literal(201), data: timeTask() }),
      errorOut(),
    ]),
  });

export const createTimeBacklogTaskSchema = () =>
  z.object({
    in: timeBacklogTask(),
    out: z.union([
      z.object({ code: z.literal(201), data: timeBacklogTask() }),
      errorOut(),
    ]),
  });

export const updateTimeBacklogTaskSchema = () =>
  z.object({
    in: timeBacklogTask(),
    out: z.union([
      z.object({ code: z.literal(200), data: timeBacklogTask() }),
      writeErrors,
    ]),
  });

export const sendTimeTaskToBacklogSchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1) }),
    out: z.union([
      z.object({ code: z.literal(200), data: timeBacklogTask() }),
      writeErrors,
    ]),
  });

export const updateTimeTaskSchema = () =>
  z.object({
    in: timeTask(),
    out: z.union([
      z.object({ code: z.literal(200), data: timeTask() }),
      writeErrors,
    ]),
  });

export const deleteTimeTaskSchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1) }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      writeErrors,
    ]),
  });

export const createTimeRecurringSchema = () =>
  z.object({
    in: timeRecurring(),
    out: z.union([
      z.object({ code: z.literal(201), data: timeRecurring() }),
      errorOut(),
    ]),
  });

export const deleteTimeRecurringSchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1) }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      writeErrors,
    ]),
  });

export const createTimeCategorySchema = () =>
  z.object({
    in: timeCategoryInput(),
    out: z.union([
      z.object({ code: z.literal(201), data: timeCategory() }),
      errorOut(),
    ]),
  });

export const updateTimeCategorySchema = () =>
  z.object({
    in: timeCategoryInput(),
    out: z.union([
      z.object({ code: z.literal(200), data: timeCategory() }),
      writeErrors,
    ]),
  });

export const deleteTimeCategorySchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1) }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      writeErrors,
      conflictOut(),
    ]),
  });

export const createTimePrioritySchema = () =>
  z.object({
    in: timePriority(),
    out: z.union([
      z.object({ code: z.literal(201), data: timePriority() }),
      errorOut(),
    ]),
  });

/** The whole ordered list of steps between open and done replaces the stored one. */
export const saveTimeStatusesSchema = () =>
  z.object({
    in: z.object({
      statuses: z
        .array(timeStatus())
        .min(1)
        .max(10)
        .superRefine((list, ctx) => {
          const ids = new Set(list.map((s) => s.id));
          const names = new Set(list.map((s) => s.name.toLowerCase()));
          if (ids.size !== list.length)
            ctx.addIssue({ code: 'custom', message: 'Duplicate status id' });
          if (names.size !== list.length)
            ctx.addIssue({ code: 'custom', message: 'Duplicate status name' });
          if (!ids.has('in_progress'))
            ctx.addIssue({
              code: 'custom',
              message: 'The in_progress step stays',
            });
          if (ids.has('open') || ids.has('done'))
            ctx.addIssue({ code: 'custom', message: 'Reserved status id' });
        }),
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        data: z.object({ statuses: z.array(timeStatus()) }),
      }),
      errorOut(),
    ]),
  });

const taskAttachment = () =>
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    size: z.number().int().positive(),
    mime: z.string().min(1),
    /** A video is stored after the response: `uploading` until it is `ready`. */
    status: z.enum(['uploading', 'ready', 'failed']),
  });

/** Live change of one attachment row, streamed to the browser. */
export const attachmentEventSchema = z.object({
  type: z.enum(['INSERT', 'UPDATE', 'DELETE']),
  taskId: z.string().min(1).optional(),
  attachment: taskAttachment().optional(),
  id: z.string().min(1).optional(),
});

const attachmentFile = () =>
  z.instanceof(File).superRefine((file, ctx) => {
    const reason = attachmentRejection(file);
    if (reason) ctx.addIssue({ code: 'custom', message: reason });
  });

export const listTaskAttachmentsSchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1) }),
    out: z.union([
      z.object({ code: z.literal(200), data: z.array(taskAttachment()) }),
      writeErrors,
    ]),
  });

export const uploadTaskAttachmentSchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1), file: attachmentFile() }),
    out: z.union([
      z.object({
        code: z.literal(201),
        data: taskAttachment().extend({
          /** Bytes the user sent, before images were reduced. */
          originalSize: z.number().int().positive(),
        }),
      }),
      conflictOut(),
      writeErrors,
    ]),
  });

/** Sends the browser on to a short-lived link of the stored file. */
export const openTaskAttachmentSchema = () =>
  z.object({
    in: z.object({ id: z.uuid() }),
    out: z.union([
      z.object({ code: z.literal(302), location: z.string().min(1) }),
      writeErrors,
    ]),
  });

export const deleteTaskAttachmentSchema = () =>
  z.object({
    in: z.object({ id: z.uuid() }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      writeErrors,
    ]),
  });

export const COMMENT_MAX_LENGTH = 2000;

const commentBody = () => z.string().trim().min(1).max(COMMENT_MAX_LENGTH);

/** `bot` names the MCP token that wrote it (never the secret); `null` is the owner. */
const taskComment = () =>
  z.object({
    id: z.string().min(1),
    body: z.string().min(1),
    createdAt: z.string(),
    /** Set when the text was changed after it was written. */
    editedAt: z.string().nullable(),
    bot: z
      .object({ name: z.string().min(1), ref: z.string().min(1) })
      .nullable(),
  });

export const listTaskCommentsSchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1) }),
    out: z.union([
      z.object({
        code: z.literal(200),
        data: z.object({
          /** Account owner: who the human side of every comment is. */
          owner: z.object({
            name: z.string().min(1),
            avatarUrl: z.string().nullable(),
          }),
          items: z.array(taskComment()),
        }),
      }),
      writeErrors,
    ]),
  });

export const createTaskCommentSchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1), body: commentBody() }),
    out: z.union([
      z.object({ code: z.literal(201), data: taskComment() }),
      conflictOut(),
      writeErrors,
    ]),
  });

export const updateTaskCommentSchema = () =>
  z.object({
    in: z.object({ id: z.uuid(), body: commentBody() }),
    out: z.union([
      z.object({ code: z.literal(200), data: taskComment() }),
      writeErrors,
    ]),
  });

export const deleteTaskCommentSchema = () =>
  z.object({
    in: z.object({ id: z.uuid() }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      writeErrors,
    ]),
  });

export const TASK_HISTORY_KINDS = [
  'created',
  'updated',
  'attachment_added',
  'attachment_removed',
  'comment_added',
  'comment_edited',
  'comment_removed',
] as const;

export const TASK_HISTORY_FIELDS = [
  'title',
  'description',
  'category',
  'priority',
  'day',
  'at',
  'done',
  'in_progress',
] as const;

/** One immutable fact about a task; `bot` names the MCP token behind it (never the secret). */
const taskHistoryEntry = () =>
  z.object({
    id: z.uuid(),
    kind: z.enum(TASK_HISTORY_KINDS),
    /** Only for `updated`: which field changed. */
    field: z.enum(TASK_HISTORY_FIELDS).nullable(),
    from: z.string().nullable(),
    to: z.string().nullable(),
    at: z.string(),
    bot: z
      .object({ name: z.string().min(1), ref: z.string().min(1) })
      .nullable(),
  });

/** Read only: history is written by the database, never through the API. */
export const listTaskHistorySchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1) }),
    out: z.union([
      z.object({
        code: z.literal(200),
        data: z.object({ items: z.array(taskHistoryEntry()) }),
      }),
      writeErrors,
    ]),
  });
