import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { resetKnowledgeProgress } from '@/server/application/procedures/reset-knowledge-progress';

export const prerender = false;

export const DELETE: APIRoute = astroAdapter(resetKnowledgeProgress);
