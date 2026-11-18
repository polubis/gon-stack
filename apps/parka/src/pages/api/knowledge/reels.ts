import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { createKnowledgeReel } from '@/server/application/procedures/create-knowledge-reel';

export const prerender = false;

export const POST: APIRoute = astroAdapter(createKnowledgeReel);
