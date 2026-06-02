import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { getEventById } from '@/server/application/procedures/get-event-by-id';

export const prerender = false;

export const GET: APIRoute = astroAdapter(getEventById);
