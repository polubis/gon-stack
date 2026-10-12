import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { listSuggestions } from '@/server/application/procedures/list-suggestions';
import { recordSuggestionUse } from '@/server/application/procedures/record-suggestion-use';

export const prerender = false;

export const GET: APIRoute = astroAdapter(listSuggestions);
export const POST: APIRoute = astroAdapter(recordSuggestionUse);
