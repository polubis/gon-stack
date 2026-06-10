import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { gamingJoinGame } from '@/server/application/procedures/gaming-join-game';

export const prerender = false;

export const POST: APIRoute = astroAdapter(gamingJoinGame);
