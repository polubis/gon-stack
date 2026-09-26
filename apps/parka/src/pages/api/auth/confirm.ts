import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { confirmRegistration } from '@/server/application/procedures/confirm-registration';

export const prerender = false;

export const GET: APIRoute = astroAdapter(confirmRegistration);
