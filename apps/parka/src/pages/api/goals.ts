import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { listGoals } from '@/server/application/procedures/list-goals';
import { createGoal } from '@/server/application/procedures/create-goal';

export const prerender = false;

export const GET: APIRoute = astroAdapter(listGoals);
export const POST: APIRoute = astroAdapter(createGoal);
