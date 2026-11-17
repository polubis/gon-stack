import { setKnowledgeProgressSchema } from '@schemas/knowledge';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { requireOwned } from '../../shared/knowledge';

export const setKnowledgeProgress = privateProcedure({
  schema: withZodSchema({ schema: setKnowledgeProgressSchema }),
})({
  handler: async (input, { db, user }) => {
    await requireOwned(
      db,
      user.id,
      'knowledge_reels',
      input.reelId,
      'Reel not found',
    );

    const { error } = input.done
      ? await db
          .from('knowledge_reel_progress')
          .upsert(
            { user_id: user.id, reel_id: input.reelId },
            { onConflict: 'user_id,reel_id', ignoreDuplicates: true },
          )
      : await db
          .from('knowledge_reel_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('reel_id', input.reelId);
    if (error) throw fromSupabaseError(error);

    return {
      code: 200 as const,
      data: { reelId: input.reelId, done: input.done },
    };
  },
});
