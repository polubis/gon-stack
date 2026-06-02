import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { deleteEvent } from '@/server/application/procedures/delete-event';

export const prerender = false;

export const POST: APIRoute = astroAdapter(deleteEvent);
