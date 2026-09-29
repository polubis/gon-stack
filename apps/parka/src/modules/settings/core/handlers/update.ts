import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { putSettings } from '../../integration/repository';

export const update = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_UPDATE').pipe(
    map(({ settings }) => ({ settings, previous: store.$settings.get() })),
    tap(({ settings }) => {
      store.$settings.set(settings);
    }),
    concatMap(({ settings, previous }) =>
      from(putSettings(settings)).pipe(
        tap(() => notify(store, 'success', 'Zapisano ustawienia.')),
        catchError(() => {
          store.$settings.set(previous);
          notify(store, 'error', 'Nie udało się zapisać ustawień.');
          return EMPTY;
        }),
      ),
    ),
  );
