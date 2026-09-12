import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { updateCategory } from '@/server/application/procedures/update-category';
import { deleteCategory } from '@/server/application/procedures/delete-category';

export const prerender = false;

export const PUT: APIRoute = astroAdapter(updateCategory);
export const DELETE: APIRoute = astroAdapter(deleteCategory);
