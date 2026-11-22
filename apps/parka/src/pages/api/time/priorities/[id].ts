import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { updateTimePriority } from '@/server/application/procedures/update-time-priority';
import { deleteTimePriority } from '@/server/application/procedures/delete-time-priority';

export const prerender = false;

export const PUT: APIRoute = astroAdapter(updateTimePriority);
export const DELETE: APIRoute = astroAdapter(deleteTimePriority);
