import { eda } from '@/libs/eda';
import { type Store } from './store';
import { type Event } from '../contracts/events';
import { searchHandler } from './handlers/search';

export type OfType = ReturnType<typeof eda<Event>>['ofType'];

export const createRegistry = (store: Store) => {
  const { ofType, trigger, createRegistry: register } = eda<Event>();

  const registry = register(searchHandler(store, ofType));

  return { trigger, registry };
};

export type Registry = ReturnType<typeof createRegistry>;
