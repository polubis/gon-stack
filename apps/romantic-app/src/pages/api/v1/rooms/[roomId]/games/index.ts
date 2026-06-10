import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { gamingGetGames } from '@/server/application/procedures/gaming-get-games';
import { gamingCreateGame } from '@/server/application/procedures/gaming-create-game';

export const prerender = false;

export const GET: APIRoute = astroAdapter(gamingGetGames);
export const POST: APIRoute = astroAdapter(gamingCreateGame);
