import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { createTimeRecurring } from '@/server/application/procedures/create-time-recurring';

export const prerender = false;

export const POST: APIRoute = astroAdapter(createTimeRecurring);
