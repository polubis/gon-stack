import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { gamingGetRoom } from '@/server/application/procedures/gaming-get-room';

export const prerender = false;

export const GET: APIRoute = astroAdapter(gamingGetRoom);
