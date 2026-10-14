import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { subscribePush } from '@/server/application/procedures/subscribe-push';

export const prerender = false;

export const PUT: APIRoute = astroAdapter(subscribePush);
