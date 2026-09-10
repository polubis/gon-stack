import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { getState } from '@/server/application/procedures/get-state';
import { syncState } from '@/server/application/procedures/sync-state';

export const prerender = false;

export const GET: APIRoute = astroAdapter(getState);
export const PUT: APIRoute = astroAdapter(syncState);
