import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { deleteKnowledgeTag } from '@/server/application/procedures/delete-knowledge-tag';
import { updateKnowledgeTag } from '@/server/application/procedures/update-knowledge-tag';

export const prerender = false;

export const PUT: APIRoute = astroAdapter(updateKnowledgeTag);
export const DELETE: APIRoute = astroAdapter(deleteKnowledgeTag);
