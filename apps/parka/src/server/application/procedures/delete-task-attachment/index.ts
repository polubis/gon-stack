import { deleteTaskAttachmentSchema } from '@schemas/time';
import { InternalServer, NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  TASK_ATTACHMENT_BUCKET,
  taskAttachmentPath,
} from '../../shared/task-attachment';

export const deleteTaskAttachment = privateProcedure({
  schema: withZodSchema({ schema: deleteTaskAttachmentSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('time_task_attachments')
      .delete()
      .eq('user_id', user.id)
      .eq('id', input.id)
      .select();
    if (error) throw fromSupabaseError(error);
    if (!data || data.length === 0)
      throw new NotFound(undefined, 'Attachment not found');

    const removed = await db.storage
      .from(TASK_ATTACHMENT_BUCKET)
      .remove([taskAttachmentPath(user.id, input.id)]);
    if (removed.error) throw new InternalServer(removed.error);

    return { code: 200 as const, ok: true as const };
  },
});
