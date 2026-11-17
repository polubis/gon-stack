import { deleteKnowledgeCategorySchema } from '@schemas/knowledge';
import { NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

/** Catalogs keep their category (`on delete restrict`): a used one answers 409. */
export const deleteKnowledgeCategory = privateProcedure({
  schema: withZodSchema({ schema: deleteKnowledgeCategorySchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('knowledge_categories')
      .delete()
      .eq('user_id', user.id)
      .eq('id', input.id)
      .select('id');
    if (error) throw fromSupabaseError(error);
    if (!data || data.length === 0)
      throw new NotFound(undefined, 'Category not found');

    return { code: 200 as const, ok: true as const };
  },
});
