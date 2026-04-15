import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { quizInit } from '@/server/application/procedures/quiz-init';

export const prerender = false;

export const GET: APIRoute = astroAdapter(quizInit);
