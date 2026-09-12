import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { listRecurring } from '@/server/application/procedures/list-recurring';
import { createRecurring } from '@/server/application/procedures/create-recurring';

export const prerender = false;

export const GET: APIRoute = astroAdapter(listRecurring);
export const POST: APIRoute = astroAdapter(createRecurring);
