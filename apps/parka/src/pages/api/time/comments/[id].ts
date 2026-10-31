import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { deleteTaskComment } from '@/server/application/procedures/delete-task-comment';
import { updateTaskComment } from '@/server/application/procedures/update-task-comment';

export const prerender = false;

export const PUT: APIRoute = astroAdapter(updateTaskComment);
export const DELETE: APIRoute = astroAdapter(deleteTaskComment);
