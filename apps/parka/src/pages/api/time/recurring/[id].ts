import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { deleteTimeRecurring } from '@/server/application/procedures/delete-time-recurring';

export const prerender = false;

export const DELETE: APIRoute = astroAdapter(deleteTimeRecurring);
