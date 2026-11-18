import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { createKnowledgeTag } from '@/server/application/procedures/create-knowledge-tag';

export const prerender = false;

export const POST: APIRoute = astroAdapter(createKnowledgeTag);
