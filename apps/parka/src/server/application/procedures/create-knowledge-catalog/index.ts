import { createKnowledgeCatalogSchema } from '@schemas/knowledge';
import { Conflict } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  CATALOG_COLUMNS,
  UNIQUE_VIOLATION,
  requireOwned,
  toCatalog,
} from '../../shared/knowledge';

export const createKnowledgeCatalog = privateProcedure({
  schema: withZodSchema({ schema: createKnowledgeCatalogSchema }),
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
      .insert({
        user_id: user.id,
        name: input.name,
        category_id: input.categoryId,
        description: input.description,
        position: input.position,
      })
      .select(CATALOG_COLUMNS)
      .single();
    if (error?.code === UNIQUE_VIOLATION)
      throw new Conflict(error, 'Catalog name already used');
    if (error) throw fromSupabaseError(error);

    return { code: 201 as const, data: toCatalog(data) };
  },
});
