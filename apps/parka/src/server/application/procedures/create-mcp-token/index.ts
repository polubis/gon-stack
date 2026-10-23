import { createMcpTokenSchema } from '@schemas/mcp-tokens';
import { Conflict, InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { issueMcpToken, MCP_TOKEN_LIMIT } from '../../../domain/mcp-token';
import { MCP_TOKEN_COLUMNS, toMcpToken } from '../../shared/mcp-token';

/** The one place a secret is born: it goes to the response once, only its hash is stored. */
export const createMcpToken = privateProcedure({
  schema: withZodSchema({ schema: createMcpTokenSchema }),
})({
  handler: async (input, { db, user }) => {
    const { count, error: countError } = await db
      .from('mcp_tokens')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);
    if (countError) throw new InternalServer(countError);
    if ((count ?? 0) >= MCP_TOKEN_LIMIT)
      throw new Conflict(
        undefined,
        `You can have up to ${MCP_TOKEN_LIMIT} tokens. Delete an unused one first`,
      );

    const now = new Date();
    const issued = await issueMcpToken(input.ttlDays, now);
    const { data, error } = await db
      .from('mcp_tokens')
      .insert({
        user_id: user.id,
        name: input.name,
        token_hash: issued.hash,
        token_hint: issued.hint,
        token_tail: issued.tail,
        ttl_days: input.ttlDays,
        expires_at: issued.expiresAt,
      })
      .select(MCP_TOKEN_COLUMNS)
      .single();
    if (error) throw new InternalServer(error);

    return {
      code: 201 as const,
      data: { token: issued.token, item: toMcpToken(data, now) },
    };
  },
});
