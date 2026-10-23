import type { APIRoute } from 'astro';
import { createSupabaseGateway } from '@/server/mcp/gateway';
import { handleMcpRequest } from '@/server/mcp/http';

export const prerender = false;

const handle: APIRoute = ({ request }) =>
  handleMcpRequest(request, { gatewayFor: createSupabaseGateway });

export const POST: APIRoute = handle;
export const GET: APIRoute = handle;
export const DELETE: APIRoute = handle;
