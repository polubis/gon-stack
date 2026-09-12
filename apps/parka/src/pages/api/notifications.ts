import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { listNotifications } from '@/server/application/procedures/list-notifications';
import { createNotification } from '@/server/application/procedures/create-notification';

export const prerender = false;

export const GET: APIRoute = astroAdapter(listNotifications);
export const POST: APIRoute = astroAdapter(createNotification);
