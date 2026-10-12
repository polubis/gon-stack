import { http, HttpResponse } from 'msw';
import type {
  Suggestion,
  SuggestionField,
} from '@/shared/form-memory/domain/suggestions';

const same = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

type Body = { field: SuggestionField; value: string };

/**
 * In-memory stand-in for `/api/suggestions/`: lists and counts uses like the
 * real account store. `calls` records every write.
 */
export const fakeSuggestions = (seed: Suggestion[] = []) => {
  let items = structuredClone(seed);
  const calls: { method: string; body: unknown }[] = [];

  const touch = (
    body: Body,
    change: (item: Suggestion) => Suggestion,
    fresh: Suggestion,
  ) => {
    const matches = (i: Suggestion) =>
      i.field === body.field && same(i.value, body.value);
    items = items.some(matches)
      ? items.map((i) => (matches(i) ? change(i) : i))
      : [...items, fresh];
  };

  const handlers = [
    http.get('/api/suggestions/', () =>
      HttpResponse.json({ code: 200, data: items }),
    ),
    http.post('/api/suggestions/', async ({ request }) => {
      const body = (await request.json()) as Body;
      calls.push({ method: 'POST', body });
      const lastUsed = new Date().toISOString();
      touch(
        body,
        (i) => ({
          ...i,
          value: body.value,
          useCount: i.useCount + 1,
          lastUsed,
        }),
        { ...body, useCount: 1, lastUsed },
      );
      return HttpResponse.json({ code: 200, ok: true });
    }),
  ];

  return { handlers, calls, items: () => items };
};
