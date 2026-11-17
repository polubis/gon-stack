import { deleteKnowledgeTagSchema } from '@schemas/knowledge';
import { NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

/** Topics only lose the label. */
export const deleteKnowledgeTag = privateProcedure({
  schema: withZodSchema({ schema: deleteKnowledgeTagSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('knowledge_tags')
      .delete()
      .eq('user_id', user.id)
      .eq('id', input.id)
      .select('id');
    if (error) throw fromSupabaseError(error);
    if (!data || data.length === 0)
      throw new NotFound(undefined, 'Tag not found');

    return { code: 200 as const, ok: true as const };
  },
});
