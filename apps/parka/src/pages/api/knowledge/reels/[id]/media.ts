import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { deleteKnowledgeReelMedia } from '@/server/application/procedures/delete-knowledge-reel-media';
import { openKnowledgeReelMedia } from '@/server/application/procedures/open-knowledge-reel-media';
import { uploadKnowledgeReelMedia } from '@/server/application/procedures/upload-knowledge-reel-media';

export const prerender = false;

export const GET: APIRoute = astroAdapter(openKnowledgeReelMedia);
export const POST: APIRoute = astroAdapter(uploadKnowledgeReelMedia);
export const DELETE: APIRoute = astroAdapter(deleteKnowledgeReelMedia);
