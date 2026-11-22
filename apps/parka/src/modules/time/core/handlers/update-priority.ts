import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { write } from '../actions/pending';
import { sortPriorities } from '../../domain/priority';
import { putPriority } from '../../integration/repository';

export const updatePriority = (store: Store, bus: Bus) => {
  const { ofType, emit } = bus;
  return ofType('[TRIGGER]_UPDATE_PRIORITY').pipe(
    map(({ priority }) => ({ priority, previous: store.$priorities.get() })),
    tap(({ priority, previous }) => {
      store.$priorities.set(
        sortPriorities(
          previous.map((p) => (p.id === priority.id ? priority : p)),
        ),
      );
    }),
    concatMap(({ priority, previous }) =>
      from(write(store, bus, () => putPriority(priority))).pipe(
        tap(() =>
          notify(store, { tone: 'success', message: 'Zapisano zmiany.' }),
        ),
        catchError((error: unknown) => {
          store.$priorities.set(previous);
          notify(store, {
            tone: 'error',
            title: 'Nie udało się zapisać zmian',
            code: 'TASK_PRIORITY_UPDATE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_UPDATE_PRIORITY', { priority }),
          });
          return EMPTY;
        }),
      ),
    ),
  );
};
