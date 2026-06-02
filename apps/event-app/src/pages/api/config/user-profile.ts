import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { getUserProfile } from '@/server/application/procedures/get-user-profile';

export const prerender = false;

export const GET: APIRoute = astroAdapter(getUserProfile);
