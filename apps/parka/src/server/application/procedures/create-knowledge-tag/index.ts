import { createKnowledgeTagSchema } from '@schemas/knowledge';
import { Conflict } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { TAG_COLUMNS, UNIQUE_VIOLATION, toTag } from '../../shared/knowledge';

export const createKnowledgeTag = privateProcedure({
  schema: withZodSchema({ schema: createKnowledgeTagSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('knowledge_tags')
      .insert({ user_id: user.id, name: input.name })
      .select(TAG_COLUMNS)
      .single();
    if (error?.code === UNIQUE_VIOLATION)
      throw new Conflict(error, 'Tag name already used');
    if (error) throw fromSupabaseError(error);

    return { code: 201 as const, data: toTag(data) };
  },
});
