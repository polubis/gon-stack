import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { authCallback } from '@/server/application/procedures/auth-callback';

export const prerender = false;

export const GET: APIRoute = astroAdapter(authCallback);
