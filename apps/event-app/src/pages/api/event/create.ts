import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { createEvent } from '@/server/application/procedures/create-event';

export const prerender = false;

export const POST: APIRoute = astroAdapter(createEvent);
