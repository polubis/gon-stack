import type { Database } from '@/shared/data-sources/db-schema';
import { mcpTokenStatus } from '../../domain/mcp-token';

type Row = Database['public']['Tables']['mcp_tokens']['Row'];

/** Every readable column; the hash is not one of them. */
export const MCP_TOKEN_COLUMNS =
  'id, name, token_hint, token_tail, ttl_days, expires_at, revoked_at, rotated_at, last_used_at, created_at';

export type McpTokenRow = Pick<
  Row,
  | 'id'
  | 'name'
  | 'token_hint'
  | 'token_tail'
  | 'ttl_days'
  | 'expires_at'
  | 'revoked_at'
  | 'rotated_at'
  | 'last_used_at'
  | 'created_at'
>;

const toTtl = (days: number | null): 1 | 7 | 30 | 90 | 365 | null =>
  days === 1 || days === 7 || days === 30 || days === 90 || days === 365
    ? days
    : null;

export const toMcpToken = (row: McpTokenRow, now = new Date()) => ({
  id: row.id,
  name: row.name,
  hint: row.token_hint,
  tail: row.token_tail,
  status: mcpTokenStatus(
    { revokedAt: row.revoked_at, expiresAt: row.expires_at },
    now,
  ),
  ttlDays: toTtl(row.ttl_days),
  expiresAt: row.expires_at,
  lastUsedAt: row.last_used_at,
  rotatedAt: row.rotated_at,
  createdAt: row.created_at,
});
