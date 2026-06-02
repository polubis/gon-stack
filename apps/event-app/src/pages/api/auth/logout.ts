import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { logoutUser } from '@/server/application/procedures/logout-user';

export const prerender = false;

export const POST: APIRoute = astroAdapter(logoutUser);
