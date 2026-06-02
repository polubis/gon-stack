import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { loginUser } from '@/server/application/procedures/login-user';

export const prerender = false;

export const POST: APIRoute = astroAdapter(loginUser);
