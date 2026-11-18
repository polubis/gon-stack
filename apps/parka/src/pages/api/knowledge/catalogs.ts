import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { createKnowledgeCatalog } from '@/server/application/procedures/create-knowledge-catalog';

export const prerender = false;

export const POST: APIRoute = astroAdapter(createKnowledgeCatalog);
