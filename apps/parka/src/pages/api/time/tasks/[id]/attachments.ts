import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { listTaskAttachments } from '@/server/application/procedures/list-task-attachments';
import { uploadTaskAttachment } from '@/server/application/procedures/upload-task-attachment';

export const prerender = false;

export const GET: APIRoute = astroAdapter(listTaskAttachments);
export const POST: APIRoute = astroAdapter(uploadTaskAttachment);
