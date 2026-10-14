import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { listAccounts } from '@/server/application/procedures/list-accounts';

export const prerender = false;

export const GET: APIRoute = astroAdapter(listAccounts);
