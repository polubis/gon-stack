import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { deleteMcpToken } from '@/server/application/procedures/delete-mcp-token';

export const prerender = false;

export const DELETE: APIRoute = astroAdapter(deleteMcpToken);
