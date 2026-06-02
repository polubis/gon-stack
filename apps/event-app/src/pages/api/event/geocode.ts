import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { geocodeAddress } from '@/server/application/procedures/geocode-address';

export const prerender = false;

export const GET: APIRoute = astroAdapter(geocodeAddress);
