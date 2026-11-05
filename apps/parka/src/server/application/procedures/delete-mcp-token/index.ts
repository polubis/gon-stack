import { deleteMcpTokenSchema } from '@schemas/mcp-tokens';
import { NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { fromSupabaseError } from '../../adapter/supabase';

export const deleteMcpToken = privateProcedure({
  schema: withZodSchema({ schema: deleteMcpTokenSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('mcp_tokens')
      .delete()
      .eq('id', input.id)
      .eq('user_id', user.id)
      .select('id');
    if (error) throw fromSupabaseError(error);
    if (data.length === 0) throw new NotFound(undefined, 'Token not found');

    return { code: 200 as const, ok: true as const };
  },
});
