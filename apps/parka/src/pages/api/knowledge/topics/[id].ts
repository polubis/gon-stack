import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { deleteKnowledgeTopic } from '@/server/application/procedures/delete-knowledge-topic';
import { getKnowledgeTopic } from '@/server/application/procedures/get-knowledge-topic';
import { updateKnowledgeTopic } from '@/server/application/procedures/update-knowledge-topic';

export const prerender = false;

export const GET: APIRoute = astroAdapter(getKnowledgeTopic);
export const PUT: APIRoute = astroAdapter(updateKnowledgeTopic);
export const DELETE: APIRoute = astroAdapter(deleteKnowledgeTopic);
