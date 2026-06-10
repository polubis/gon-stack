import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { gamingLeaveGame } from '@/server/application/procedures/gaming-leave-game';

export const prerender = false;

export const DELETE: APIRoute = astroAdapter(gamingLeaveGame);
