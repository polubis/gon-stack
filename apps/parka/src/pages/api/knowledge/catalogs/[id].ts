import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { deleteKnowledgeCatalog } from '@/server/application/procedures/delete-knowledge-catalog';
import { updateKnowledgeCatalog } from '@/server/application/procedures/update-knowledge-catalog';

export const prerender = false;

export const PUT: APIRoute = astroAdapter(updateKnowledgeCatalog);
export const DELETE: APIRoute = astroAdapter(deleteKnowledgeCatalog);
