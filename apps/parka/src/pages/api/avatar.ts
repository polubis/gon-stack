import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { getAvatar } from '@/server/application/procedures/get-avatar';
import { uploadAvatar } from '@/server/application/procedures/upload-avatar';

export const prerender = false;

export const GET: APIRoute = astroAdapter(getAvatar);
export const POST: APIRoute = astroAdapter(uploadAvatar);
