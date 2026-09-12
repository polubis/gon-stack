import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { updateRecurring } from '@/server/application/procedures/update-recurring';
import { deleteRecurring } from '@/server/application/procedures/delete-recurring';

export const prerender = false;

export const PUT: APIRoute = astroAdapter(updateRecurring);
export const DELETE: APIRoute = astroAdapter(deleteRecurring);
