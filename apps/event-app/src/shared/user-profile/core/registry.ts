import { eda } from '@/libs/eda';
import { onGetUserProfile } from './handlers/get-user-profile';
import { onLogout } from './handlers/logout';
import { type Store } from './store';
import { type Event } from '../domain/events';

export type OfType = ReturnType<typeof eda<Event>>['ofType'];

export const createRegistry = (store: Store) => {
  const { ofType, trigger, createRegistry } = eda<Event>();

  const registry = createRegistry(
    onGetUserProfile(store, ofType),
    onLogout(store, ofType),
  );

  return { trigger, registry };
};

export type Registry = ReturnType<typeof createRegistry>;
