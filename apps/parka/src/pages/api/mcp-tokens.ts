import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { listMcpTokens } from '@/server/application/procedures/list-mcp-tokens';
import { createMcpToken } from '@/server/application/procedures/create-mcp-token';

export const prerender = false;

export const GET: APIRoute = astroAdapter(listMcpTokens);
export const POST: APIRoute = astroAdapter(createMcpToken);
