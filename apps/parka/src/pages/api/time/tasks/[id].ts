import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { updateTimeTask } from '@/server/application/procedures/update-time-task';
import { deleteTimeTask } from '@/server/application/procedures/delete-time-task';

export const prerender = false;

export const PUT: APIRoute = astroAdapter(updateTimeTask);
export const DELETE: APIRoute = astroAdapter(deleteTimeTask);
