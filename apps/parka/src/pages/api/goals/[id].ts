import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { updateGoal } from '@/server/application/procedures/update-goal';
import { deleteGoal } from '@/server/application/procedures/delete-goal';

export const prerender = false;

export const PUT: APIRoute = astroAdapter(updateGoal);
export const DELETE: APIRoute = astroAdapter(deleteGoal);
