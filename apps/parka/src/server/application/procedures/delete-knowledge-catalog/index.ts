import { deleteKnowledgeCatalogSchema } from '@schemas/knowledge';
import { NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

/** Topics, reels and progress of the catalog go with it. */
export const deleteKnowledgeCatalog = privateProcedure({
  schema: withZodSchema({ schema: deleteKnowledgeCatalogSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('knowledge_catalogs')
      .delete()
      .eq('user_id', user.id)
      .eq('id', input.id)
      .select('id');
    if (error) throw fromSupabaseError(error);
    if (!data || data.length === 0)
      throw new NotFound(undefined, 'Catalog not found');

    return { code: 200 as const, ok: true as const };
  },
});
