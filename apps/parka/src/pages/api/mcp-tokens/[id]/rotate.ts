import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { rotateMcpToken } from '@/server/application/procedures/rotate-mcp-token';

export const prerender = false;

export const POST: APIRoute = astroAdapter(rotateMcpToken);
