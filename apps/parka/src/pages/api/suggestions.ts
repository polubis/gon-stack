import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { listSuggestions } from '@/server/application/procedures/list-suggestions';
import { recordSuggestionUse } from '@/server/application/procedures/record-suggestion-use';
import { renameSuggestion } from '@/server/application/procedures/rename-suggestion';
import { deleteSuggestion } from '@/server/application/procedures/delete-suggestion';

export const prerender = false;

export const GET: APIRoute = astroAdapter(listSuggestions);
export const POST: APIRoute = astroAdapter(recordSuggestionUse);
export const PUT: APIRoute = astroAdapter(renameSuggestion);
export const DELETE: APIRoute = astroAdapter(deleteSuggestion);
