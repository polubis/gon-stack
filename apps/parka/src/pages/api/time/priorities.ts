import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { createTimePriority } from '@/server/application/procedures/create-time-priority';

export const prerender = false;

export const POST: APIRoute = astroAdapter(createTimePriority);
