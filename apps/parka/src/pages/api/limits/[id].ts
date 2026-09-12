import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { updateLimit } from '@/server/application/procedures/update-limit';
import { deleteLimit } from '@/server/application/procedures/delete-limit';

export const prerender = false;

export const PUT: APIRoute = astroAdapter(updateLimit);
export const DELETE: APIRoute = astroAdapter(deleteLimit);
