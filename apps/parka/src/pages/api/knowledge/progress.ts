import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { setKnowledgeProgress } from '@/server/application/procedures/set-knowledge-progress';

export const prerender = false;

export const PUT: APIRoute = astroAdapter(setKnowledgeProgress);
