import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { listTimeMoves } from '@/server/application/procedures/list-time-moves';

export const prerender = false;

export const GET: APIRoute = astroAdapter(listTimeMoves);
