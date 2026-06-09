import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { startChat } from '@/server/application/procedures/start-chat';

export const prerender = false;

export const POST: APIRoute = astroAdapter(startChat);
