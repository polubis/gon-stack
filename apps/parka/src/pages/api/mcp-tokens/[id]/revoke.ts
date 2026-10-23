import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { revokeMcpToken } from '@/server/application/procedures/revoke-mcp-token';

export const prerender = false;

export const POST: APIRoute = astroAdapter(revokeMcpToken);
