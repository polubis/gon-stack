import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { getBootstrap } from '@/server/application/procedures/get-bootstrap';

export const prerender = false;

export const GET: APIRoute = astroAdapter(getBootstrap);
