import { catchError, EMPTY, finalize, from, switchMap, tap } from 'rxjs';
import { geocodeAddress } from '../../integration/repository';
import type { OfType } from '../registry';
import type { Store } from '../store';

export const geocodeAddressHandler = (store: Store, ofType: OfType) =>
  ofType('[TRIGGER]_GEOCODE_ADDRESS').pipe(
    tap(() => {
      store.$geoStatus.set('loading');
      store.$coordinates.set(null);
    }),
    switchMap(({ query }) => {
      const ctrl = new AbortController();

      return from(geocodeAddress(query, ctrl.signal)).pipe(
        tap((result) => {
          if (result) {
            store.$coordinates.set(result);
            store.$geoStatus.set('success');
          } else {
            store.$geoStatus.set('error');
          }
        }),
        catchError((error) => {
          if (error instanceof DOMException && error.name === 'AbortError')
            return EMPTY;
          store.$geoStatus.set('error');
          return EMPTY;
        }),
        finalize(() => ctrl.abort()),
      );
    }),
  );
