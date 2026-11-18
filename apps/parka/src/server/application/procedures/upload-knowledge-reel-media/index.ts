import { uploadKnowledgeReelMediaSchema } from '@schemas/knowledge';
import { knowledgeMediaKind } from '@/shared/attachments/knowledge-media';
import { NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  KNOWLEDGE_MEDIA_BUCKET,
  REEL_COLUMNS,
  knowledgeMediaPath,
  removeMedia,
  signMedia,
  toReel,
} from '../../shared/knowledge';

/** Stores the file, points the reel at it, then drops the file it replaced. */
export const uploadKnowledgeReelMedia = privateProcedure({
  schema: withZodSchema({ schema: uploadKnowledgeReelMediaSchema }),
})({
  handler: async ({ id, file }, { db, user, signal }) => {
    const current = await db
      .from('knowledge_reels')
      .select('media_path')
      .eq('user_id', user.id)
      .eq('id', id)
      .maybeSingle();
    if (current.error) throw fromSupabaseError(current.error);
    if (!current.data) throw new NotFound(undefined, 'Reel not found');

    // The schema accepted the type, so the kind is known.
    const kind = knowledgeMediaKind(file.type) ?? 'image';
    const path = knowledgeMediaPath(user.id, id);
    const bytes = await file.arrayBuffer();
    signal.throwIfAborted();

    const upload = await db.storage
      .from(KNOWLEDGE_MEDIA_BUCKET)
      .upload(path, bytes, { contentType: file.type });
    if (upload.error) throw fromSupabaseError(upload.error);

    const { data, error } = await db
      .from('knowledge_reels')
      .update({ media_path: path, media_kind: kind })
      .eq('user_id', user.id)
      .eq('id', id)
      .select(REEL_COLUMNS)
      .maybeSingle();
    if (error || !data) {
      // Never leave a file nobody points at.
      await removeMedia(db, [path]);
      if (error) throw fromSupabaseError(error);
      throw new NotFound(undefined, 'Reel not found');
    }

    if (current.data.media_path)
      await removeMedia(db, [current.data.media_path]);

    return {
      code: 201 as const,
      data: toReel(data, await signMedia(db, [data])),
    };
  },
});
