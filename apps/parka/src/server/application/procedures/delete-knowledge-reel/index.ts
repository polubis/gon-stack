import { deleteKnowledgeReelSchema } from '@schemas/knowledge';
import { NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { removeMedia } from '../../shared/knowledge';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

/** Its progress and stored media go with it. */
export const deleteKnowledgeReel = privateProcedure({
  schema: withZodSchema({ schema: deleteKnowledgeReelSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('knowledge_reels')
      .delete()
      .eq('user_id', user.id)
      .eq('id', input.id)
      .select('media_path');
    if (error) throw fromSupabaseError(error);
    if (!data || data.length === 0)
      throw new NotFound(undefined, 'Reel not found');

    await removeMedia(
      db,
      data.flatMap((r) => (r.media_path ? [r.media_path] : [])),
    );

    return { code: 200 as const, ok: true as const };
  },
});
