import { listTaskAttachmentsSchema } from '@schemas/time';

import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { toTaskAttachment } from '../../shared/task-attachment';
import { fromSupabaseError } from '../../adapter/supabase';

export const listTaskAttachments = privateProcedure({
  schema: withZodSchema({ schema: listTaskAttachmentsSchema }),
})({
  handler: async (input, { db, user }) => {
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
