import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { deleteNotification } from '@/server/application/procedures/delete-notification';

export const prerender = false;

export const DELETE: APIRoute = astroAdapter(deleteNotification);
