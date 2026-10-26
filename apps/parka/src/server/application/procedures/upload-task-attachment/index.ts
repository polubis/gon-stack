import { env } from 'cloudflare:workers';
import { uploadTaskAttachmentSchema } from '@schemas/time';
import { ATTACHMENT_MAX_COUNT } from '@/shared/attachments/rules';
import { Conflict, InternalServer, NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  prepareAttachment,
  type AttachmentImages,
} from '../../shared/attachment-image';
import {
  TASK_ATTACHMENT_BUCKET,
  taskAttachmentPath,
  toTaskAttachment,
} from '../../shared/task-attachment';

export const uploadTaskAttachment = privateProcedure({
  schema: withZodSchema({ schema: uploadTaskAttachmentSchema }),
})({
  handler: async ({ id: taskId, file }, { db, user }) => {
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
    if (count.error) throw new InternalServer(count.error);
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

    const attachmentId = crypto.randomUUID();
    const path = taskAttachmentPath(user.id, attachmentId);
    const upload = await db.storage
      .from(TASK_ATTACHMENT_BUCKET)
      .upload(path, prepared.bytes, { contentType: prepared.mime });
    if (upload.error) throw new InternalServer(upload.error);

    const { data, error } = await db
      .from('time_task_attachments')
      .insert({
        user_id: user.id,
        id: attachmentId,
        task_id: taskId,
        name: prepared.name,
        size: prepared.bytes.byteLength,
        mime: prepared.mime,
      })
      .select()
      .single();
    if (error) {
      // Never leave a file nobody points at.
      await db.storage.from(TASK_ATTACHMENT_BUCKET).remove([path]);
      throw fromSupabaseError(error);
    }

    return {
      code: 201 as const,
      data: { ...toTaskAttachment(data), originalSize: prepared.originalSize },
    };
  },
});
