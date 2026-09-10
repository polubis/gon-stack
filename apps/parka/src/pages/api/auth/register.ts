import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { registerUser } from '@/server/application/procedures/register-user';

export const prerender = false;

export const POST: APIRoute = astroAdapter(registerUser);
