import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { searchEvents } from '@/server/application/procedures/search-events';

export const prerender = false;

export const GET: APIRoute = astroAdapter(searchEvents);
