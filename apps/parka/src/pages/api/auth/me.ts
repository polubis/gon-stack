import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { getMe } from '@/server/application/procedures/get-me';

export const prerender = false;

export const GET: APIRoute = astroAdapter(getMe);
