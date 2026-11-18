import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { deleteKnowledgeCategory } from '@/server/application/procedures/delete-knowledge-category';
import { updateKnowledgeCategory } from '@/server/application/procedures/update-knowledge-category';

export const prerender = false;

export const PUT: APIRoute = astroAdapter(updateKnowledgeCategory);
export const DELETE: APIRoute = astroAdapter(deleteKnowledgeCategory);
