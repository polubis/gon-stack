import { catchError, EMPTY, exhaustMap, finalize, from, tap } from 'rxjs';
import { createEvent } from '../../integration/repository';
import type { OfType } from '../registry';
import type { Store } from '../store';

export const submitCreateEventHandler = (store: Store, ofType: OfType) =>
  ofType('[TRIGGER]_SUBMIT_CREATE_EVENT').pipe(
    tap(() => {
      store.$isSubmitting.set(true);
      store.$submitError.reset();
      store.$submitSuccess.set(null);
    }),
    exhaustMap(({ data }) => {
      const ctrl = new AbortController();

      return from(createEvent(data, ctrl.signal)).pipe(
        tap(() =>
          store.$submitSuccess.set('Udało się utworzyć nowe wydarzenie'),
        ),
        catchError((error) => {
          if (error instanceof DOMException && error.name === 'AbortError')
            return EMPTY;
          store.$submitError.set(
            error instanceof Error ? error.message : 'Coś poszło nie tak.',
          );
          return EMPTY;
        }),
        finalize(() => {
          store.$isSubmitting.set(false);
          ctrl.abort();
        }),
      );
    }),
  );
