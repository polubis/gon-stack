import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { getFriendsAttendance } from '@/server/application/procedures/get-friends-attendance';

export const prerender = false;

export const GET: APIRoute = astroAdapter(getFriendsAttendance);
