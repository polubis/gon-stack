import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { gamingGetParticipants } from '@/server/application/procedures/gaming-get-participants';
import { gamingJoinRoom } from '@/server/application/procedures/gaming-join-room';

export const prerender = false;

export const GET: APIRoute = astroAdapter(gamingGetParticipants);
export const POST: APIRoute = astroAdapter(gamingJoinRoom);
