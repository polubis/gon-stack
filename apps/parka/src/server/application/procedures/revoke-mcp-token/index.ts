import { revokeMcpTokenSchema } from '@schemas/mcp-tokens';
import { InternalServer, NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { MCP_TOKEN_COLUMNS, toMcpToken } from '../../shared/mcp-token';

/** Disables a token for good; idempotent, the first revocation time is kept. */
export const revokeMcpToken = privateProcedure({
  schema: withZodSchema({ schema: revokeMcpTokenSchema }),
})({
  handler: async (input, { db, user }) => {
    const found = await db
      .from('mcp_tokens')
      .select(MCP_TOKEN_COLUMNS)
      .eq('id', input.id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (found.error) throw new InternalServer(found.error);
    if (!found.data) throw new NotFound(undefined, 'Token not found');
    if (found.data.revoked_at)
      return { code: 200 as const, data: toMcpToken(found.data) };

    const { data, error } = await db
      .from('mcp_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', input.id)
      .eq('user_id', user.id)
      .select(MCP_TOKEN_COLUMNS)
      .single();
    if (error) throw new InternalServer(error);

    return { code: 200 as const, data: toMcpToken(data) };
  },
});
