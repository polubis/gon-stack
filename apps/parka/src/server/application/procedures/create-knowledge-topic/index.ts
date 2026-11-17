import { createKnowledgeTopicSchema } from '@schemas/knowledge';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { loadTopic, requireOwned, syncTopicTags } from '../../shared/knowledge';

export const createKnowledgeTopic = privateProcedure({
  schema: withZodSchema({ schema: createKnowledgeTopicSchema }),
})({
  handler: async (input, { db, user }) => {
    await requireOwned(
      db,
      user.id,
      'knowledge_catalogs',
      input.catalogId,
      'Catalog not found',
    );

    const { data, error } = await db
      .from('knowledge_topics')
      .insert({
        user_id: user.id,
        catalog_id: input.catalogId,
        title: input.title,
        description: input.description,
        position: input.position,
      })
      .select('id')
      .single();
    if (error) throw fromSupabaseError(error);
    await syncTopicTags(db, user.id, data.id, input.tagIds ?? []);

    return {
      code: 201 as const,
      data: await loadTopic(db, user.id, data.id),
    };
  },
});
