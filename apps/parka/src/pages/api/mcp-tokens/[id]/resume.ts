import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { resumeMcpToken } from '@/server/application/procedures/resume-mcp-token';

export const prerender = false;

export const POST: APIRoute = astroAdapter(resumeMcpToken);
