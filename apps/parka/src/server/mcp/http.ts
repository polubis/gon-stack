import { looksLikeMcpToken } from '../domain/mcp-token';
import type { McpGateway } from './gateway';
import { handleMcpMessage, MCP_ERROR, MCP_PROTOCOL_VERSIONS } from './protocol';
import { createRateLimiter, type RateLimiter } from './rate-limit';

const MAX_BODY_BYTES = 64 * 1024;
const WINDOW_MS = 60_000;
const REQUESTS_PER_TOKEN = 120;
const FAILURES_PER_CLIENT = 20;

const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

export type McpHttpDeps = {
  gatewayFor: (token: string) => McpGateway;
  tokenLimiter?: RateLimiter;
  failureLimiter?: RateLimiter;
};

const defaultTokenLimiter = createRateLimiter({
  limit: REQUESTS_PER_TOKEN,
  windowMs: WINDOW_MS,
});
const defaultFailureLimiter = createRateLimiter({
  limit: FAILURES_PER_CLIENT,
  windowMs: WINDOW_MS,
});

const json = (
  status: number,
  body: unknown,
  extra: Record<string, string> = {},
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...HEADERS, ...extra },
  });

const rpcError = (
  status: number,
  code: number,
  message: string,
  extra: Record<string, string> = {},
): Response =>
  json(status, { jsonrpc: '2.0', id: null, error: { code, message } }, extra);

const unauthorized = (): Response =>
  rpcError(401, -32001, 'Unauthorized', {
    'WWW-Authenticate': 'Bearer realm="parka-mcp"',
  });

const bearerToken = (request: Request): string | null => {
  const match = /^Bearer\s+(\S+)$/i.exec(
    request.headers.get('authorization') ?? '',
  );
  return match?.[1] ?? null;
};

/** Browsers send `Origin`; DNS rebinding is stopped by accepting only this site's own. */
const originAllowed = (request: Request): boolean => {
  const origin = request.headers.get('origin');
  return origin === null || origin === new URL(request.url).origin;
};

/** Only the edge-set header: `X-Forwarded-For` is client-controlled, so it would dodge the limit. */
const clientKey = (request: Request): string =>
  request.headers.get('cf-connecting-ip') ?? 'unknown';

const tooMany = (retryAfterSeconds: number): Response =>
  rpcError(429, MCP_ERROR.internal, 'Too many requests', {
    'Retry-After': String(retryAfterSeconds),
  });

// Chunked bodies declare no length: stop reading at the cap, not after it.
const readChunks = async (
  body: ReadableStream<Uint8Array>,
): Promise<Uint8Array<ArrayBuffer>[] | null> => {
  const reader = body.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value as Uint8Array<ArrayBuffer>);
  }
  return chunks;
};

const readBody = async (request: Request): Promise<string | null> => {
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES)
    return null;
  if (!request.body) return '';

  const chunks = await readChunks(request.body);
  return chunks === null ? null : new Blob(chunks).text();
};

/**
 * A response sent while the request body is still unread makes the runtime drop
 * a kept-alive connection (`Network connection lost`, surfaced as a 500 on the
 * next request), so every path consumes what the client sent before replying.
 */
const discardBody = async (request: Request): Promise<void> => {
  if (request.body && !request.bodyUsed) await readChunks(request.body);
};

const respond = async (
  request: Request,
  {
    gatewayFor,
    tokenLimiter = defaultTokenLimiter,
    failureLimiter = defaultFailureLimiter,
  }: McpHttpDeps,
): Promise<Response> => {
  if (request.method !== 'POST')
    return rpcError(405, MCP_ERROR.invalidRequest, 'Use POST', {
      Allow: 'POST',
    });

  if (!originAllowed(request))
    return rpcError(403, MCP_ERROR.invalidRequest, 'Origin not allowed');

  const version = request.headers.get('mcp-protocol-version');
  if (
    version !== null &&
    !(MCP_PROTOCOL_VERSIONS as readonly string[]).includes(version)
  )
    return rpcError(
      400,
      MCP_ERROR.invalidRequest,
      'Unsupported protocol version',
    );

  if (!(request.headers.get('content-type') ?? '').includes('application/json'))
    return rpcError(415, MCP_ERROR.invalidRequest, 'Send application/json');

  const client = clientKey(request);
  // Checked before any database call: a client that keeps failing gets no more guesses.
  const standing = failureLimiter.peek(client);
  if (!standing.allowed) return tooMany(standing.retryAfterSeconds);

  const token = bearerToken(request);
  if (token === null || !looksLikeMcpToken(token)) {
    const failed = failureLimiter.hit(client);
    return failed.allowed ? unauthorized() : tooMany(failed.retryAfterSeconds);
  }

  // Keyed by a slice of the token so the map never holds the whole secret.
  const used = tokenLimiter.hit(token.slice(0, 24));
  if (!used.allowed) return tooMany(used.retryAfterSeconds);

  const raw = await readBody(request);
  if (raw === null)
    return rpcError(413, MCP_ERROR.invalidRequest, 'Request too large');

  let message: unknown;
  try {
    message = JSON.parse(raw);
  } catch {
    return rpcError(400, MCP_ERROR.parse, 'Parse error');
  }

  const outcome = await handleMcpMessage(message, gatewayFor(token));

  if (outcome.kind === 'accepted')
    return new Response(null, { status: 202, headers: HEADERS });
  if (outcome.kind === 'unauthorized') {
    const failed = failureLimiter.hit(client);
    return failed.allowed ? unauthorized() : tooMany(failed.retryAfterSeconds);
  }
  return json(outcome.status, outcome.body);
};

/**
 * MCP Streamable HTTP endpoint, stateless JSON mode: `POST` carries one
 * JSON-RPC message and is answered with `application/json`. There is no
 * server-initiated stream, so `GET` is refused with 405 as the spec allows.
 */
export const handleMcpRequest = async (
  request: Request,
  deps: McpHttpDeps,
): Promise<Response> => {
  const response = await respond(request, deps);
  await discardBody(request);
  return response;
};
