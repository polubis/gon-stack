import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { refreshSummary } from '../actions/refresh-summary';
import { postRecurring } from '../../integration/repository';

export const createRecurring = (store: Store, { ofType, trigger }: Bus) =>
  ofType('[TRIGGER]_CREATE_RECURRING').pipe(
    map(({ recurring }) => ({ recurring, previous: store.$recurring.get() })),
    tap(({ recurring }) => {
      store.$recurring.set([...store.$recurring.get(), recurring]);
    }),
    concatMap(({ recurring, previous }) =>
      from(postRecurring(recurring)).pipe(
        tap(() => {
          notify(store, 'success', 'Dodano wydatek cykliczny.');
          refreshSummary(store, trigger);
        }),
        catchError(() => {
          store.$recurring.set(previous);
          notify(store, 'error', 'Nie udało się dodać wydatku cyklicznego.');
          return EMPTY;
        }),
      ),
    ),
  );
