import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { getSettings } from '@/server/application/procedures/get-settings';
import { updateSettings } from '@/server/application/procedures/update-settings';

export const prerender = false;

export const GET: APIRoute = astroAdapter(getSettings);
export const PUT: APIRoute = astroAdapter(updateSettings);
