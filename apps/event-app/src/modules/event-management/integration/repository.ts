import type { Schema as CreateEventSchema } from '@/shared/server-contracts/schemas/create-event';
import type { Schema as GeocodeSchema } from '@/shared/server-contracts/schemas/geocode-address';
import type { Schema as SuggestKeywordsSchema } from '@/shared/server-contracts/schemas/suggest-event-keywords';
import type { InferOut } from '@/shared/server-contracts/extraction';

export type CreateEventInput = CreateEventSchema['in'];

export const createEvent = async (
  data: CreateEventInput,
  signal: AbortSignal,
): Promise<void> => {
  const res = await fetch('/api/event/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    signal,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.message ?? 'Coś poszło nie tak. Spróbuj ponownie później.';
    throw new Error(message);
  }
};

export const suggestKeywords = async (
  data: { name: string; description?: string; category?: string },
  signal: AbortSignal,
): Promise<InferOut<SuggestKeywordsSchema['out'], 200>> => {
  const res = await fetch('/api/event/suggest-keywords', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    signal,
  });
  if (!res.ok) {
    throw new Error('Coś poszło nie tak. Spróbuj ponownie później.');
  }

  return await res.json();
};

export const geocodeAddress = async (
  query: string,
  signal: AbortSignal,
): Promise<{ lat: number; lng: number } | null> => {
  const res = await fetch(`/api/event/geocode?q=${encodeURIComponent(query)}`, {
    signal,
  });

  if (!res.ok) {
    throw new Error('Coś poszło nie tak. Spróbuj ponownie później.');
  }

  const data = (await res.json()) as InferOut<GeocodeSchema['out']>;

  if (data.code !== 200) {
    throw new Error('Coś poszło nie tak. Spróbuj ponownie później.');
  }

  return { lat: data.lat, lng: data.lng };
};
