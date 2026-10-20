import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { createTimeTask } from '@/server/application/procedures/create-time-task';

export const prerender = false;

export const POST: APIRoute = astroAdapter(createTimeTask);
