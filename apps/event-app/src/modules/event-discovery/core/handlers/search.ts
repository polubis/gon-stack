import { catchError, EMPTY, finalize, from, switchMap, tap } from 'rxjs';
import { searchEvents } from '../../integration/repository';
import type { OfType } from '../registry';
import type { Store } from '../store';

export const searchHandler = (store: Store, ofType: OfType) =>
  ofType('[TRIGGER]_SEARCH').pipe(
    tap((filters) => {
      store.$isLoading.set(true);
      store.$error.reset();
      store.$filters.set(filters);
    }),
    switchMap((filters) => {
      const ctrl = new AbortController();

      return from(searchEvents(filters, ctrl.signal)).pipe(
        tap(({ events, total }) => {
          store.$results.set(events);
          store.$total.set(total);
        }),
        catchError((error) => {
          if (error instanceof DOMException && error.name === 'AbortError')
            return EMPTY;
          store.$error.set(
            error instanceof Error ? error.message : 'Coś poszło nie tak.',
          );
          return EMPTY;
        }),
        finalize(() => {
          store.$isLoading.set(false);
          ctrl.abort();
        }),
      );
    }),
  );
