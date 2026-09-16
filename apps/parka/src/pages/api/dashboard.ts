import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { getDashboard } from '@/server/application/procedures/get-dashboard';

export const prerender = false;

export const GET: APIRoute = astroAdapter(getDashboard);
