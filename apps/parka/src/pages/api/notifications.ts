import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { deleteNotifications } from '@/server/application/procedures/delete-notifications';
import { listNotifications } from '@/server/application/procedures/list-notifications';

export const prerender = false;

export const GET: APIRoute = astroAdapter(listNotifications);
export const DELETE: APIRoute = astroAdapter(deleteNotifications);
