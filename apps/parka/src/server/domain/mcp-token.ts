const PREFIX = 'parka_mcp_';
const SECRET_BYTES = 32;
const DAY_MS = 86_400_000;

export const MCP_TOKEN_LIMIT = 10;

export type McpTokenStatus = 'active' | 'expired' | 'revoked';

const toBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const toHex = (bytes: ArrayBuffer): string =>
  Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');

/** SHA-256 hex digest; the same function the database applies to a presented token. */
export const hashMcpToken = async (token: string): Promise<string> =>
  toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)));

/** Cheap shape check, so obvious garbage never reaches the database. */
export const looksLikeMcpToken = (value: string): boolean =>
  value.startsWith(PREFIX) && value.length >= 20 && value.length <= 200;

/** A fresh secret (256 bits of entropy) with what is stored about it. */
export const issueMcpToken = async (
  ttlDays: number | null,
  now: Date,
): Promise<{
  token: string;
  hash: string;
  hint: string;
  tail: string;
  expiresAt: string | null;
}> => {
  const secret = toBase64Url(
    crypto.getRandomValues(new Uint8Array(SECRET_BYTES)),
  );
  const token = `${PREFIX}${secret}`;
  return {
    token,
    hash: await hashMcpToken(token),
    hint: secret.slice(0, 4),
    tail: secret.slice(-4),
    expiresAt:
      ttlDays === null
        ? null
        : new Date(now.getTime() + ttlDays * DAY_MS).toISOString(),
  };
};

export const mcpTokenStatus = (
  token: { revokedAt: string | null; expiresAt: string | null },
  now: Date,
): McpTokenStatus => {
  if (token.revokedAt) return 'revoked';
  if (token.expiresAt && new Date(token.expiresAt).getTime() <= now.getTime())
    return 'expired';
  return 'active';
};
