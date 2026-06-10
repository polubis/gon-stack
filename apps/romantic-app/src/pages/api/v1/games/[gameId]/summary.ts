import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { gamingGetGameSummary } from '@/server/application/procedures/gaming-get-game-summary';

export const prerender = false;

export const GET: APIRoute = astroAdapter(gamingGetGameSummary);
