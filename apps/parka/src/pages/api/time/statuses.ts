import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { saveTimeStatuses } from '@/server/application/procedures/save-time-statuses';

export const prerender = false;

export const PUT: APIRoute = astroAdapter(saveTimeStatuses);
