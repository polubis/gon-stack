import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { markAllNotificationsRead } from '@/server/application/procedures/mark-all-notifications-read';

export const prerender = false;

export const PUT: APIRoute = astroAdapter(markAllNotificationsRead);
