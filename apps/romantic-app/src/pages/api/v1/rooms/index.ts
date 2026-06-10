import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { gamingGetRooms } from '@/server/application/procedures/gaming-get-rooms';
import { gamingCreateRoom } from '@/server/application/procedures/gaming-create-room';

export const prerender = false;

export const GET: APIRoute = astroAdapter(gamingGetRooms);
export const POST: APIRoute = astroAdapter(gamingCreateRoom);
