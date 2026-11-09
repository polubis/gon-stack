import { listTaskAttachmentsSchema } from '@schemas/time';

import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  UPLOAD_STALE_MS,
  toTaskAttachment,
} from '../../shared/task-attachment';
import { fromSupabaseError } from '../../adapter/supabase';

export const listTaskAttachments = privateProcedure({
  schema: withZodSchema({ schema: listTaskAttachmentsSchema }),
})({
  handler: async (input, { db, user }) => {
    // A save that never finished (worker gone) must not read "saving" forever.
    const stale = await db
      .from('time_task_attachments')
      .update({ status: 'failed' })
      .eq('user_id', user.id)
      .eq('task_id', input.id)
      .eq('status', 'uploading')
      .lt('created_at', new Date(Date.now() - UPLOAD_STALE_MS).toISOString());
    if (stale.error) throw fromSupabaseError(stale.error);

    const { data, error } = await db
      .from('time_task_attachments')
      .select('*')
      .eq('user_id', user.id)
      .eq('task_id', input.id)
      .order('created_at')
      .order('id');
    if (error) throw fromSupabaseError(error);

    return { code: 200 as const, data: data.map(toTaskAttachment) };
  },
});
