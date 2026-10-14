import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { switchAccount } from '@/server/application/procedures/switch-account';

export const prerender = false;

export const POST: APIRoute = astroAdapter(switchAccount);
