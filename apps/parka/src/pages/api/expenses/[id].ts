import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { updateExpense } from '@/server/application/procedures/update-expense';
import { deleteExpense } from '@/server/application/procedures/delete-expense';

export const prerender = false;

export const PUT: APIRoute = astroAdapter(updateExpense);
export const DELETE: APIRoute = astroAdapter(deleteExpense);
