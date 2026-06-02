import { type TriggerEvent } from '@/libs/eda';

export type SearchFilters = {
  name?: string;
  category?: string;
  city?: string;
  dateLabel?: string;
};

export type Event = TriggerEvent<'[TRIGGER]_SEARCH', SearchFilters>;
