import type { z } from 'zod';
import type {
  listSuggestionsSchema,
  recordSuggestionUseSchema,
} from '@schemas/suggestions';
import { API_ROUTER } from '@/shared/router/routes';
import type { Suggestion, SuggestionField } from '../domain/suggestions';

type ListOut = z.infer<ReturnType<typeof listSuggestionsSchema>>['out'];
type RecordOut = z.infer<ReturnType<typeof recordSuggestionUseSchema>>['out'];

/** The only place in this module that talks to the backend. */
export const fetchSuggestions = async (
  signal: AbortSignal,
): Promise<Suggestion[]> => {
  const response = await fetch(API_ROUTER.suggestions(), {
    headers: { Accept: 'application/json' },
    signal,
  });
  const json = (await response.json()) as ListOut;
  if (json.code !== 200) throw new Error(json.message);
  return json.data;
};

export const postSuggestionUse = async (
  field: SuggestionField,
  value: string,
): Promise<void> => {
  const response = await fetch(API_ROUTER.suggestions(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field, value }),
  });
  const json = (await response.json()) as RecordOut;
  if (json.code !== 200) throw new Error(json.message);
};
