import z from 'zod';
import { logger } from '../application/core/logger';
import { McpAuthError, type McpGateway } from './gateway';
import { MCP_TOOLS, type RegisteredTool } from './tools';

export const MCP_PROTOCOL_VERSIONS = [
  '2025-11-25',
  '2025-06-18',
  '2025-03-26',
] as const;

const SERVER_INFO = { name: 'parka', title: 'Parka', version: '1.0.0' };

const INSTRUCTIONS =
  'Parka personal finance and tasks. Read tasks and expenses; the only change you can make is setting a task open, in progress or done.';

const ERROR = {
  parse: -32700,
  invalidRequest: -32600,
  methodNotFound: -32601,
  invalidParams: -32602,
  internal: -32603,
} as const;

type JsonRpcId = string | number | null;

type JsonRpcResponse =
  | { jsonrpc: '2.0'; id: JsonRpcId; result: unknown }
  | {
      jsonrpc: '2.0';
      id: JsonRpcId;
      error: { code: number; message: string };
    };

export type McpOutcome =
  | { kind: 'accepted' }
  | { kind: 'response'; status: number; body: JsonRpcResponse }
  | { kind: 'unauthorized' };

const requestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number()]).optional(),
  method: z.string().min(1),
  params: z.record(z.string(), z.unknown()).optional(),
});

const initializeParams = z.object({
  protocolVersion: z.string(),
});

const callParams = z.object({
  name: z.string().min(1).max(100),
  arguments: z.record(z.string(), z.unknown()).optional(),
});

const ok = (id: JsonRpcId, result: unknown): McpOutcome => ({
  kind: 'response',
  status: 200,
  body: { jsonrpc: '2.0', id, result },
});

const fail = (
  id: JsonRpcId,
  code: number,
  message: string,
  status = 200,
): McpOutcome => ({
  kind: 'response',
  status,
  body: { jsonrpc: '2.0', id, error: { code, message } },
});

const describeTool = (tool: RegisteredTool) => ({
  name: tool.name,
  title: tool.title,
  description: tool.description,
  inputSchema: tool.inputSchema,
  outputSchema: tool.outputSchema,
  annotations: tool.annotations,
});

const negotiate = (requested: string): string =>
  (MCP_PROTOCOL_VERSIONS as readonly string[]).includes(requested)
    ? requested
    : MCP_PROTOCOL_VERSIONS[0];

/**
 * Handles one JSON-RPC 2.0 message of the MCP Streamable HTTP transport
 * (stateless: no sessions, every call is authorised on its own). Transport
 * concerns (headers, origin, limits) live in `http.ts`.
 */
export const handleMcpMessage = async (
  message: unknown,
  gateway: McpGateway,
): Promise<McpOutcome> => {
  if (Array.isArray(message))
    return fail(null, ERROR.invalidRequest, 'Batching is not supported', 400);

  const parsed = requestSchema.safeParse(message);
  if (!parsed.success) {
    // A response or notification-shaped message from the client needs no answer.
    const looksLikeResponse =
      typeof message === 'object' &&
      message !== null &&
      'jsonrpc' in message &&
      !('method' in message) &&
      ('result' in message || 'error' in message);
    return looksLikeResponse
      ? { kind: 'accepted' }
      : fail(null, ERROR.invalidRequest, 'Invalid JSON-RPC request', 400);
  }

  const { id, method, params } = parsed.data;
  if (id === undefined) return { kind: 'accepted' };

  try {
    if (method === 'ping') {
      await gateway.authenticate();
      return ok(id, {});
    }

    if (method === 'initialize') {
      const init = initializeParams.safeParse(params);
      if (!init.success)
        return fail(id, ERROR.invalidParams, 'protocolVersion is required');
      await gateway.authenticate();
      return ok(id, {
        protocolVersion: negotiate(init.data.protocolVersion),
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      });
    }

    if (method === 'tools/list') {
      await gateway.authenticate();
      return ok(id, { tools: MCP_TOOLS.map(describeTool) });
    }

    if (method === 'tools/call') {
      const call = callParams.safeParse(params);
      if (!call.success)
        return fail(id, ERROR.invalidParams, 'Tool name is required');
      const tool = MCP_TOOLS.find((t) => t.name === call.data.name);
      if (!tool) {
        await gateway.authenticate();
        return fail(id, ERROR.invalidParams, `Unknown tool: ${call.data.name}`);
      }
      return ok(id, await tool.call(call.data.arguments, gateway));
    }

    return fail(id, ERROR.methodNotFound, `Method not found: ${method}`);
  } catch (error) {
    if (error instanceof McpAuthError) return { kind: 'unauthorized' };
    // The message may carry data: log the error object, never the request.
    logger(error, 'error');
    return fail(id, ERROR.internal, 'Internal error');
  }
};

export const MCP_ERROR = ERROR;
