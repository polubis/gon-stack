import { getKnowledgeTopicSchema } from '@schemas/knowledge';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { REEL_COLUMNS, loadTopic, toReel } from '../../shared/knowledge';

export const getKnowledgeTopic = privateProcedure({
  schema: withZodSchema({ schema: getKnowledgeTopicSchema }),
})({
  handler: async (input, { db, user }) => {
    // Independent reads start together; a missing topic still answers 404.
    const [topic, reels] = await Promise.all([
      loadTopic(db, user.id, input.id),
      db
        .from('knowledge_reels')
        .select(REEL_COLUMNS)
        .eq('user_id', user.id)
        .eq('topic_id', input.id)
        .order('position')
        .order('created_at')
        .order('id'),
    ]);
    if (reels.error) throw fromSupabaseError(reels.error);

    return {
      code: 200 as const,
      data: { topic, reels: reels.data.map(toReel) },
    };
  },
});
