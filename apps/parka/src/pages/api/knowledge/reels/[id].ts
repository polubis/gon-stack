import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { deleteKnowledgeReel } from '@/server/application/procedures/delete-knowledge-reel';
import { updateKnowledgeReel } from '@/server/application/procedures/update-knowledge-reel';

export const prerender = false;

export const PUT: APIRoute = astroAdapter(updateKnowledgeReel);
export const DELETE: APIRoute = astroAdapter(deleteKnowledgeReel);
