import { atom } from '@/libs/supa-store';
import type { SearchFilters } from '../contracts/events';

export type EventCategory =
  | 'Concert'
  | 'Festival'
  | 'Sports'
  | 'Culture'
  | 'Theatre'
  | 'Food & Drink';

export type EventCard = {
  id: string;
  name: string;
  category: EventCategory;
  startDateTime: string;
  city: string;
};

export const createStore = () => {
  const $filters = atom<SearchFilters>({});
  const $results = atom<EventCard[]>([]);
  const $total = atom(0);
  const $isLoading = atom(false);
  const $error = atom<string | null>(null);

  return { $filters, $results, $total, $isLoading, $error };
};

export type Store = ReturnType<typeof createStore>;
