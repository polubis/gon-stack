import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { scanReceipt } from '@/server/application/procedures/scan-receipt';

export const prerender = false;

export const POST: APIRoute = astroAdapter(scanReceipt);
