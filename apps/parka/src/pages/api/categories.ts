import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { listCategories } from '@/server/application/procedures/list-categories';
import { createCategory } from '@/server/application/procedures/create-category';

export const prerender = false;

export const GET: APIRoute = astroAdapter(listCategories);
export const POST: APIRoute = astroAdapter(createCategory);
