import { createKnowledgeCategorySchema } from '@schemas/knowledge';
import { Conflict } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  CATEGORY_COLUMNS,
  UNIQUE_VIOLATION,
  toCategory,
} from '../../shared/knowledge';

export const createKnowledgeCategory = privateProcedure({
  schema: withZodSchema({ schema: createKnowledgeCategorySchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('knowledge_categories')
      .insert({
        user_id: user.id,
        name: input.name,
        color: input.color,
        position: input.position,
      })
      .select(CATEGORY_COLUMNS)
      .single();
    if (error?.code === UNIQUE_VIOLATION)
      throw new Conflict(error, 'Category name already used');
    if (error) throw fromSupabaseError(error);

    return { code: 201 as const, data: toCategory(data) };
  },
});
