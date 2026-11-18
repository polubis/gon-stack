import { updateKnowledgeCategorySchema } from '@schemas/knowledge';
import { Conflict, NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  CATEGORY_COLUMNS,
  UNIQUE_VIOLATION,
  toCategory,
} from '../../shared/knowledge';

export const updateKnowledgeCategory = privateProcedure({
  schema: withZodSchema({ schema: updateKnowledgeCategorySchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('knowledge_categories')
      .update({
        name: input.name,
        color: input.color,
        position: input.position,
      })
      .eq('user_id', user.id)
      .eq('id', input.id)
      .select(CATEGORY_COLUMNS)
      .maybeSingle();
    if (error?.code === UNIQUE_VIOLATION)
      throw new Conflict(error, 'Category name already used');
    if (error) throw fromSupabaseError(error);
    if (!data) throw new NotFound(undefined, 'Category not found');

    return { code: 200 as const, data: toCategory(data) };
  },
});
