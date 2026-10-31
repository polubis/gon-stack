import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { createTaskComment } from '@/server/application/procedures/create-task-comment';
import { listTaskComments } from '@/server/application/procedures/list-task-comments';

export const prerender = false;

export const GET: APIRoute = astroAdapter(listTaskComments);
export const POST: APIRoute = astroAdapter(createTaskComment);
