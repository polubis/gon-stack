import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { getFinanceTour } from '@/server/application/procedures/get-finance-tour';
import { finishFinanceTour } from '@/server/application/procedures/finish-finance-tour';

export const prerender = false;

export const GET: APIRoute = astroAdapter(getFinanceTour);
export const PUT: APIRoute = astroAdapter(finishFinanceTour);
