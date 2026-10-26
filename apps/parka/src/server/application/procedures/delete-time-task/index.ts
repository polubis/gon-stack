import { deleteTimeTaskSchema } from '@schemas/time';
import { InternalServer, NotFound } from '../../core/error-handling';
import {
  TASK_ATTACHMENT_BUCKET,
  taskAttachmentPath,
} from '../../shared/task-attachment';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const deleteTimeTask = privateProcedure({
  schema: withZodSchema({ schema: deleteTimeTaskSchema }),
})({
  handler: async (input, { db, user }) => {
    // The rows go with the task; the files do not, so they leave first.
    const attachments = await db
      .from('time_task_attachments')
      .select('id')
      .eq('user_id', user.id)
      .eq('task_id', input.id);
    if (attachments.error) throw new InternalServer(attachments.error);
    if (attachments.data.length > 0) {
      const removed = await db.storage
        .from(TASK_ATTACHMENT_BUCKET)
        .remove(
          attachments.data.map((row) => taskAttachmentPath(user.id, row.id)),
        );
      if (removed.error) throw new InternalServer(removed.error);
    }

    const { data, error } = await db
      .from('time_tasks')
      .delete()
      .eq('id', input.id)
      .eq('user_id', user.id)
      .select();
    if (error) throw fromSupabaseError(error);
    if (!data || data.length === 0)
      throw new NotFound(undefined, 'Task not found');

    return { code: 200 as const, ok: true as const };
  },
});
