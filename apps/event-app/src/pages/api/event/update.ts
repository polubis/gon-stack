import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { updateEvent } from '@/server/application/procedures/update-event';

export const prerender = false;

export const POST: APIRoute = astroAdapter(updateEvent);
