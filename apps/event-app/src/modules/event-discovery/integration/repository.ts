import type { Schema as SearchEventsSchema } from '@/shared/server-contracts/schemas/search-events';
import type { InferOut } from '@/shared/server-contracts/extraction';
import type { EventCard } from '../core/store';
import type { SearchFilters } from '../contracts/events';

const CATEGORY_MAP: Record<string, string> = {
  koncerty: 'Concert',
  festiwale: 'Festival',
  sport: 'Sports',
  teatr: 'Theatre',
  wystawy: 'Culture',
};

export const searchEvents = async (
  filters: SearchFilters,
  signal: AbortSignal,
): Promise<{ events: EventCard[]; total: number }> => {
  const params = new URLSearchParams();
  if (filters.name) params.set('name', filters.name);
  if (filters.category) {
    const mapped = CATEGORY_MAP[filters.category];
    if (mapped) params.set('category', mapped);
  }
  if (filters.city) params.set('city', filters.city);
  if (filters.dateLabel) params.set('dateLabel', filters.dateLabel);

  const res = await fetch(`/api/event/search?${params}`, { signal });
  if (!res.ok) {
    throw new Error('Coś poszło nie tak. Spróbuj ponownie później.');
  }

  const data = (await res.json()) as InferOut<SearchEventsSchema['out']>;
  if (data.code !== 200) {
    throw new Error(data.message);
  }

  return { events: data.events, total: data.total };
};
