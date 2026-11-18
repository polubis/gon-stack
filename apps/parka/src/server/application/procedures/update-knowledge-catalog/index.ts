import { updateKnowledgeCatalogSchema } from '@schemas/knowledge';
import { Conflict, NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  CATALOG_COLUMNS,
  UNIQUE_VIOLATION,
  requireOwned,
  toCatalog,
} from '../../shared/knowledge';

export const updateKnowledgeCatalog = privateProcedure({
  schema: withZodSchema({ schema: updateKnowledgeCatalogSchema }),
})({
  handler: async (input, { db, user }) => {
    if (input.categoryId)
      await requireOwned(
        db,
        user.id,
        'knowledge_categories',
        input.categoryId,
        'Category not found',
      );
    const { data, error } = await db
      .from('knowledge_catalogs')
      .update({
        name: input.name,
        category_id: input.categoryId,
        description: input.description,
        position: input.position,
      })
      .eq('user_id', user.id)
      .eq('id', input.id)
      .select(CATALOG_COLUMNS)
      .maybeSingle();
    if (error?.code === UNIQUE_VIOLATION)
      throw new Conflict(error, 'Catalog name already used');
    if (error) throw fromSupabaseError(error);
    if (!data) throw new NotFound(undefined, 'Catalog not found');

    return { code: 200 as const, data: toCatalog(data) };
  },
});
