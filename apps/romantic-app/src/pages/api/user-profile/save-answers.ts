import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { saveUserProfileAnswers } from '@/server/application/procedures/save-user-profile-answers';

export const prerender = false;

export const POST: APIRoute = astroAdapter(saveUserProfileAnswers);
