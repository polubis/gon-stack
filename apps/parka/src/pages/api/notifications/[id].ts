import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { deleteNotification } from '@/server/application/procedures/delete-notification';
import { markNotificationRead } from '@/server/application/procedures/mark-notification-read';

export const prerender = false;

export const PUT: APIRoute = astroAdapter(markNotificationRead);
export const DELETE: APIRoute = astroAdapter(deleteNotification);
