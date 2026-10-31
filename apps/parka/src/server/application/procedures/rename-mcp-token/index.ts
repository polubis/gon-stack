import { renameMcpTokenSchema } from '@schemas/mcp-tokens';
import { InternalServer, NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { MCP_TOKEN_COLUMNS, toMcpToken } from '../../shared/mcp-token';

/** Only the label changes; the secret and its lifetime stay as they were. */
export const renameMcpToken = privateProcedure({
  schema: withZodSchema({ schema: renameMcpTokenSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('mcp_tokens')
      .update({ name: input.name })
      .eq('id', input.id)
      .eq('user_id', user.id)
      .select(MCP_TOKEN_COLUMNS)
      .maybeSingle();
    if (error) throw new InternalServer(error);
    if (!data) throw new NotFound(undefined, 'Token not found');

    return { code: 200 as const, data: toMcpToken(data) };
  },
});
