import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { listTime } from '@/server/application/procedures/list-time';

export const prerender = false;

export const GET: APIRoute = astroAdapter(listTime);
