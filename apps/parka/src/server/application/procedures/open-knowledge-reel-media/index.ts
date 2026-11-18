import { openKnowledgeReelMediaSchema } from '@schemas/knowledge';
import { NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { signMedia } from '../../shared/knowledge';

export const openKnowledgeReelMedia = privateProcedure({
  schema: withZodSchema({ schema: openKnowledgeReelMediaSchema }),
})({
  handler: async ({ id }, { db, user }) => {
    const { data, error } = await db
      .from('knowledge_reels')
      .select('media_path')
      .eq('user_id', user.id)
      .eq('id', id)
      .maybeSingle();
    if (error) throw fromSupabaseError(error);
    const path = data?.media_path;
    if (!path) throw new NotFound(undefined, 'Media not found');

    const url = (await signMedia(db, [{ media_path: path }])).get(path);
    if (!url) throw new NotFound(undefined, 'Media not found');

    return { code: 302 as const, location: url };
  },
});
