import { catchError, EMPTY, exhaustMap, finalize, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { saveReceipt } from '../../integration/repository';

/** Ignores extra saves while one is in flight (no duplicate expenses). */
export const save = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_SAVE').pipe(
    map(({ receipt }) => receipt),
    exhaustMap((receipt) => {
      store.$saving.set(true);

      return from(saveReceipt(receipt)).pipe(
        tap(() => store.$saved.set(true)),
        catchError(() => {
          notify(store, 'error', 'Nie udało się zapisać paragonu.');
          return EMPTY;
        }),
        finalize(() => store.$saving.reset()),
      );
    }),
  );
