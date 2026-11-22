import { resetKnowledgeProgressSchema } from '@schemas/knowledge';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { requireOwned } from '../../shared/knowledge';

/** Forgets what was seen in a topic: every reel of it is unfinished again. */
export const resetKnowledgeProgress = privateProcedure({
  schema: withZodSchema({ schema: resetKnowledgeProgressSchema }),
})({
  handler: async (input, { db, user }) => {
    await requireOwned(
      db,
      user.id,
      'knowledge_topics',
      input.id,
      'Topic not found',
    );

    const { data, error } = await db
      .from('knowledge_reels')
      .select('id')
      .eq('user_id', user.id)
      .eq('topic_id', input.id);
    if (error) throw fromSupabaseError(error);

    const { error: deleteError } = await db
      .from('knowledge_reel_progress')
      .delete()
      .eq('user_id', user.id)
      .in(
        'reel_id',
        (data ?? []).map((r) => r.id),
      );
    if (deleteError) throw fromSupabaseError(deleteError);

    return { code: 200 as const, data: { topicId: input.id } };
  },
});
