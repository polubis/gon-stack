import { deleteKnowledgeTopicSchema } from '@schemas/knowledge';
import { NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { mediaPathsOfTopics, removeMedia } from '../../shared/knowledge';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

/** Reels, progress and stored media of the topic go with it. */
export const deleteKnowledgeTopic = privateProcedure({
  schema: withZodSchema({ schema: deleteKnowledgeTopicSchema }),
})({
  handler: async (input, { db, user }) => {
    const files = await mediaPathsOfTopics(db, user.id, [input.id]);
    const { data, error } = await db
      .from('knowledge_topics')
      .delete()
      .eq('user_id', user.id)
      .eq('id', input.id)
      .select('id');
    if (error) throw fromSupabaseError(error);
    if (!data || data.length === 0)
      throw new NotFound(undefined, 'Topic not found');

    await removeMedia(db, files);

    return { code: 200 as const, ok: true as const };
  },
});
