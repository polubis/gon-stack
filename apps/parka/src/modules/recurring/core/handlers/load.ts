import { catchError, EMPTY, finalize, from, map, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { fetchCategories, fetchRecurring } from '../../integration/repository';

export const load = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_LOAD').pipe(
    tap(() => {
      store.$isLoading.set(true);
      store.$error.reset();
    }),
    map(() => new AbortController()),
    switchMap((ctrl) =>
      from(
        Promise.all([
          fetchRecurring(ctrl.signal),
          fetchCategories(ctrl.signal),
        ]),
      ).pipe(
        tap(([recurring, categories]) => {
          store.$recurring.set(recurring);
          store.$categories.set(categories);
        }),
        catchError((error) => {
          const isAbort =
            error instanceof DOMException && error.name === 'AbortError';

          if (!isAbort) {
            store.$error.set(
              error instanceof Error
                ? error.message
                : 'Failed to load recurring expenses.',
            );
          }

          return EMPTY;
        }),
        finalize(() => {
          store.$initializing.set(false);
          store.$isLoading.reset();
          ctrl.abort();
        }),
      ),
    ),
  );
