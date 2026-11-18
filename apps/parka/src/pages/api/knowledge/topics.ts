import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { createKnowledgeTopic } from '@/server/application/procedures/create-knowledge-topic';

export const prerender = false;

export const POST: APIRoute = astroAdapter(createKnowledgeTopic);
