import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { quizSubmitAnswer } from '@/server/application/procedures/quiz-submit-answer';

export const prerender = false;

export const POST: APIRoute = astroAdapter(quizSubmitAnswer);
