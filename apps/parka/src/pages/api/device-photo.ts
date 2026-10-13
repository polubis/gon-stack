import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { uploadDevicePhoto } from '@/server/application/procedures/upload-device-photo';

export const prerender = false;

export const POST: APIRoute = astroAdapter(uploadDevicePhoto);
