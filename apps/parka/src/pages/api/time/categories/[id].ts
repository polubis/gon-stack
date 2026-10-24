import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { updateTimeCategory } from '@/server/application/procedures/update-time-category';
import { deleteTimeCategory } from '@/server/application/procedures/delete-time-category';

export const prerender = false;

export const PUT: APIRoute = astroAdapter(updateTimeCategory);
export const DELETE: APIRoute = astroAdapter(deleteTimeCategory);
