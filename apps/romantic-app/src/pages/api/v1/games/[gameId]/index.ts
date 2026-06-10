import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { gamingUpdateGame } from '@/server/application/procedures/gaming-update-game';

export const prerender = false;

export const PATCH: APIRoute = astroAdapter(gamingUpdateGame);
