import { updateKnowledgeReelSchema } from '@schemas/knowledge';
import { NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { REEL_COLUMNS, signMedia, toReel } from '../../shared/knowledge';

/** Changes the text and optionally the place; the database stamps the edit time. */
export const updateKnowledgeReel = privateProcedure({
  schema: withZodSchema({ schema: updateKnowledgeReelSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('knowledge_reels')
      .update({ body: input.body, position: input.position })
      .eq('user_id', user.id)
      .eq('id', input.id)
      .select(REEL_COLUMNS)
      .maybeSingle();
    if (error) throw fromSupabaseError(error);
    if (!data) throw new NotFound(undefined, 'Reel not found');

    return {
      code: 200 as const,
      data: toReel(data, await signMedia(db, [data])),
    };
  },
});
