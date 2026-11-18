import { updateKnowledgeTopicSchema } from '@schemas/knowledge';
import { NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { loadTopic, requireOwned, syncTopicTags } from '../../shared/knowledge';

/** Replaces the topic's tags with the given ones; `studyDay: null` moves it to the backlog. */
export const updateKnowledgeTopic = privateProcedure({
  schema: withZodSchema({ schema: updateKnowledgeTopicSchema }),
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
      .update({
        catalog_id: input.catalogId,
        title: input.title,
        description: input.description,
        position: input.position,
        study_day: input.studyDay,
      })
      .eq('user_id', user.id)
      .eq('id', input.id)
      .select('id')
      .maybeSingle();
    if (error) throw fromSupabaseError(error);
    if (!data) throw new NotFound(undefined, 'Topic not found');
    await syncTopicTags(db, user.id, input.id, input.tagIds);

    return {
      code: 200 as const,
      data: await loadTopic(db, user.id, input.id),
    };
  },
});
