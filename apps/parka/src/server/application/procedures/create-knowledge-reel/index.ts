import { createKnowledgeReelSchema } from '@schemas/knowledge';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { REEL_COLUMNS, requireOwned, toReel } from '../../shared/knowledge';

export const createKnowledgeReel = privateProcedure({
  schema: withZodSchema({ schema: createKnowledgeReelSchema }),
})({
  handler: async (input, { db, user }) => {
    await requireOwned(
      db,
      user.id,
      'knowledge_topics',
      input.topicId,
      'Topic not found',
    );

    const { data, error } = await db
      .from('knowledge_reels')
      .insert({
        user_id: user.id,
        topic_id: input.topicId,
        body: input.body,
        position: input.position,
      })
      .select(REEL_COLUMNS)
      .single();
    if (error) throw fromSupabaseError(error);

    return { code: 201 as const, data: toReel(data, new Map()) };
  },
});
