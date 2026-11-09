import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { listTaskHistory } from '@/server/application/procedures/list-task-history';

export const prerender = false;

export const GET: APIRoute = astroAdapter(listTaskHistory);
