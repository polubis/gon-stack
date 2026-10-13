import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { listNotifications } from '@/server/application/procedures/list-notifications';

export const prerender = false;

export const GET: APIRoute = astroAdapter(listNotifications);
