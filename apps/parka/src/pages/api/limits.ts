import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { listLimits } from '@/server/application/procedures/list-limits';
import { createLimit } from '@/server/application/procedures/create-limit';

export const prerender = false;

export const GET: APIRoute = astroAdapter(listLimits);
export const POST: APIRoute = astroAdapter(createLimit);
