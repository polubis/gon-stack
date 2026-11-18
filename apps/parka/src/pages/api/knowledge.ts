import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { listKnowledge } from '@/server/application/procedures/list-knowledge';

export const prerender = false;

export const GET: APIRoute = astroAdapter(listKnowledge);
