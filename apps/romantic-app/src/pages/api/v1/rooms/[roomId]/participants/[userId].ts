import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { gamingRemoveParticipant } from '@/server/application/procedures/gaming-remove-participant';

export const prerender = false;

export const DELETE: APIRoute = astroAdapter(gamingRemoveParticipant);
