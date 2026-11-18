import { deleteKnowledgeReelMediaSchema } from '@schemas/knowledge';
import { NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { REEL_COLUMNS, removeMedia, toReel } from '../../shared/knowledge';

/** Clears the reel's media and removes the file; the reel itself stays. */
export const deleteKnowledgeReelMedia = privateProcedure({
  schema: withZodSchema({ schema: deleteKnowledgeReelMediaSchema }),
})({
  handler: async ({ id }, { db, user }) => {
    const current = await db
      .from('knowledge_reels')
      .select('media_path')
      .eq('user_id', user.id)
      .eq('id', id)
      .maybeSingle();
    if (current.error) throw fromSupabaseError(current.error);
    if (!current.data) throw new NotFound(undefined, 'Reel not found');

    const { data, error } = await db
      .from('knowledge_reels')
      .update({ media_path: null, media_kind: null })
      .eq('user_id', user.id)
      .eq('id', id)
      .select(REEL_COLUMNS)
      .single();
    if (error) throw fromSupabaseError(error);
    if (current.data.media_path)
      await removeMedia(db, [current.data.media_path]);

    return { code: 200 as const, data: toReel(data, new Map()) };
  },
});
