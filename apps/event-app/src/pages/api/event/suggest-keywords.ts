import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { suggestEventKeywords } from '@/server/application/procedures/suggest-event-keywords';

export const prerender = false;

export const POST: APIRoute = astroAdapter(suggestEventKeywords);
