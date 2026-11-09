import { env } from 'cloudflare:workers';
import { uploadTaskAttachmentSchema } from '@schemas/time';
import { ATTACHMENT_MAX_COUNT, isVideoMime } from '@/shared/attachments/rules';
import { Conflict, NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  prepareAttachment,
  type AttachmentImages,
} from '../../shared/attachment-image';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import {
  TASK_ATTACHMENT_BUCKET,
  taskAttachmentPath,
  toTaskAttachment,
} from '../../shared/task-attachment';

/** Stores a video after the response went out and flips the row for the live feed. */
const storeLater = (
  waitUntil: (work: Promise<unknown>) => void,
  db: SupabaseServer,
  userId: string,
  attachmentId: string,
  body: ArrayBuffer,
  mime: string,
) =>
  waitUntil(
    (async () => {
      const path = taskAttachmentPath(userId, attachmentId);
      const upload = await db.storage
        .from(TASK_ATTACHMENT_BUCKET)
        .upload(path, body, { contentType: mime });
      const updated = await db
        .from('time_task_attachments')
        .update({ status: upload.error ? 'failed' : 'ready' })
        .eq('user_id', userId)
        .eq('id', attachmentId)
        .select('id');
      // Deleted (cancelled) while saving: never leave a file nobody points at.
      if (!upload.error && updated.data?.length === 0)
        await db.storage.from(TASK_ATTACHMENT_BUCKET).remove([path]);
    })().catch(() =>
      db
        .from('time_task_attachments')
        .update({ status: 'failed' })
        .eq('user_id', userId)
        .eq('id', attachmentId),
    ),
  );

export const uploadTaskAttachment = privateProcedure({
  schema: withZodSchema({ schema: uploadTaskAttachmentSchema }),
})({
  handler: async ({ id: taskId, file }, { db, user, waitUntil, signal }) => {
    signal.throwIfAborted();
    const task = await db
      .from('time_tasks')
      .select('id')
      .eq('user_id', user.id)
      .eq('id', taskId)
      .maybeSingle();
    if (task.error) throw fromSupabaseError(task.error);
    if (!task.data) throw new NotFound(undefined, 'Task not found');

    const count = await db
      .from('time_task_attachments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('task_id', taskId);
    if (count.error) throw fromSupabaseError(count.error);
    if ((count.count ?? 0) >= ATTACHMENT_MAX_COUNT)
      throw new Conflict(
        undefined,
        `A task takes at most ${ATTACHMENT_MAX_COUNT} attachments`,
      );

    // Photos shrink first: the size limit is checked on what gets stored.
    const prepared = await prepareAttachment(env.IMAGES as AttachmentImages, {
      bytes: await file.arrayBuffer(),
      name: file.name,
      mime: file.type,
    });

    // The client gave up while the bytes were still being handled.
    signal.throwIfAborted();
    const attachmentId = crypto.randomUUID();
    const later = isVideoMime(prepared.mime);
    const path = taskAttachmentPath(user.id, attachmentId);
    if (!later) {
      const upload = await db.storage
        .from(TASK_ATTACHMENT_BUCKET)
        .upload(path, prepared.bytes, { contentType: prepared.mime });
      if (upload.error) throw fromSupabaseError(upload.error);
    }

    const { data, error } = await db
      .from('time_task_attachments')
      .insert({
        user_id: user.id,
        id: attachmentId,
        task_id: taskId,
        name: prepared.name,
        size: prepared.bytes.byteLength,
        mime: prepared.mime,
        status: later ? 'uploading' : 'ready',
      })
      .select()
      .single();
    if (error) {
      if (later) throw fromSupabaseError(error);
      // Never leave a file nobody points at.
      await db.storage.from(TASK_ATTACHMENT_BUCKET).remove([path]);
      throw fromSupabaseError(error);
    }

    if (later)
      storeLater(
        waitUntil,
        db,
        user.id,
        attachmentId,
        prepared.bytes,
        prepared.mime,
      );

    return {
      code: 201 as const,
      data: { ...toTaskAttachment(data), originalSize: prepared.originalSize },
    };
  },
});
