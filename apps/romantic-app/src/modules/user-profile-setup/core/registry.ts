import { eda } from '../../../libs/eda';
import { from, switchMap, tap } from 'rxjs';
import { getConfig } from '../integration/get-config';
import { type Store } from './store';
import { Event } from '../contracts/events';

export const createRegistry = (store: Store) => {
  const { ofType, trigger, createRegistry } = eda<Event>();

  const registry = createRegistry(
    ofType('[TRIGGER]_INIT').pipe(
      switchMap(() =>
        from(getConfig()).pipe(
          tap(({ groups }) => store.$groups.set(groups)),
        ),
      ),
    ),
  );

  return { trigger, registry };
};

export type Registry = ReturnType<typeof createRegistry>;