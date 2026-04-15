import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { quizNextQuestion } from '@/server/application/procedures/quiz-next-question';

export const prerender = false;

export const POST: APIRoute = astroAdapter(quizNextQuestion);
