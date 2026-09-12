import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { listExpenses } from '@/server/application/procedures/list-expenses';
import { createExpense } from '@/server/application/procedures/create-expense';

export const prerender = false;

export const GET: APIRoute = astroAdapter(listExpenses);
export const POST: APIRoute = astroAdapter(createExpense);
