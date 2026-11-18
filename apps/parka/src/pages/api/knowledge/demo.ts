import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { createKnowledgeDemo } from '@/server/application/procedures/create-knowledge-demo';

export const prerender = false;

export const POST: APIRoute = astroAdapter(createKnowledgeDemo);
