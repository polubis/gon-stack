import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { deleteTaskAttachment } from '@/server/application/procedures/delete-task-attachment';
import { openTaskAttachment } from '@/server/application/procedures/open-task-attachment';

export const prerender = false;

export const GET: APIRoute = astroAdapter(openTaskAttachment);
export const DELETE: APIRoute = astroAdapter(deleteTaskAttachment);
