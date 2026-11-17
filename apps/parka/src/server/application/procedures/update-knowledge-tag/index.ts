import { updateKnowledgeTagSchema } from '@schemas/knowledge';
import { Conflict, NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { TAG_COLUMNS, UNIQUE_VIOLATION, toTag } from '../../shared/knowledge';

export const updateKnowledgeTag = privateProcedure({
  schema: withZodSchema({ schema: updateKnowledgeTagSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('knowledge_tags')
      .update({ name: input.name })
      .eq('user_id', user.id)
      .eq('id', input.id)
      .select(TAG_COLUMNS)
      .maybeSingle();
    if (error?.code === UNIQUE_VIOLATION)
      throw new Conflict(error, 'Tag name already used');
    if (error) throw fromSupabaseError(error);
    if (!data) throw new NotFound(undefined, 'Tag not found');

    return { code: 200 as const, data: toTag(data) };
  },
});
