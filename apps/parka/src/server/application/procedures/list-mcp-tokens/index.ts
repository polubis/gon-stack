import { listMcpTokensSchema } from '@schemas/mcp-tokens';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { MCP_TOKEN_COLUMNS, toMcpToken } from '../../shared/mcp-token';

export const listMcpTokens = privateProcedure({
  schema: withZodSchema({ schema: listMcpTokensSchema }),
})({
  handler: async (_input, { db, user }) => {
    const { data, error } = await db
      .from('mcp_tokens')
      .select(MCP_TOKEN_COLUMNS)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw new InternalServer(error);

    const now = new Date();
    return {
      code: 200 as const,
      data: data.map((row) => toMcpToken(row, now)),
    };
  },
});
