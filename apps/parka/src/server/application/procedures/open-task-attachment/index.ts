import { openTaskAttachmentSchema } from '@schemas/time';
import { InternalServer, NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  TASK_ATTACHMENT_BUCKET,
  taskAttachmentPath,
} from '../../shared/task-attachment';

const LINK_SECONDS = 60;

export const openTaskAttachment = privateProcedure({
  schema: withZodSchema({ schema: openTaskAttachmentSchema }),
})({
  handler: async (input, { db, user }) => {
    const row = await db
      .from('time_task_attachments')
      .select('id')
      .eq('user_id', user.id)
      .eq('id', input.id)
      .maybeSingle();
    if (row.error) throw fromSupabaseError(row.error);
    if (!row.data) throw new NotFound(undefined, 'Attachment not found');

    const { data, error } = await db.storage
      .from(TASK_ATTACHMENT_BUCKET)
      .createSignedUrl(taskAttachmentPath(user.id, row.data.id), LINK_SECONDS);
    if (error) throw new InternalServer(error);

    return { code: 302 as const, location: data.signedUrl };
  },
});
