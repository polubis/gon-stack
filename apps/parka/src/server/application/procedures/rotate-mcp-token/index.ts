import { rotateMcpTokenSchema } from '@schemas/mcp-tokens';
import { Conflict, InternalServer, NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { issueMcpToken } from '../../../domain/mcp-token';
import { MCP_TOKEN_COLUMNS, toMcpToken } from '../../shared/mcp-token';

/** New secret for the same token: the old one stops working at once, the lifetime restarts. */
export const rotateMcpToken = privateProcedure({
  schema: withZodSchema({ schema: rotateMcpTokenSchema }),
})({
  handler: async (input, { db, user }) => {
    const current = await db
      .from('mcp_tokens')
      .select('ttl_days, revoked_at')
      .eq('id', input.id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (current.error) throw new InternalServer(current.error);
    if (!current.data) throw new NotFound(undefined, 'Token not found');
    if (current.data.revoked_at)
      throw new Conflict(undefined, 'A disabled token cannot be rotated');

    const now = new Date();
    const issued = await issueMcpToken(current.data.ttl_days, now);
    const { data, error } = await db
      .from('mcp_tokens')
      .update({
        token_hash: issued.hash,
        token_hint: issued.hint,
        token_tail: issued.tail,
        expires_at: issued.expiresAt,
        rotated_at: now.toISOString(),
        last_used_at: null,
      })
      .eq('id', input.id)
      .eq('user_id', user.id)
      .is('revoked_at', null)
      .select(MCP_TOKEN_COLUMNS)
      .maybeSingle();
    if (error) throw new InternalServer(error);
    if (!data)
      throw new Conflict(undefined, 'The token changed. Reload and retry');

    return {
      code: 200 as const,
      data: { token: issued.token, item: toMcpToken(data, now) },
    };
  },
});
