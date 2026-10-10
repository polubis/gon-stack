import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { putSettings } from '../../integration/repository';

export const update = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_UPDATE').pipe(
    map(({ settings }) => ({ settings, previous: store.$settings.get() })),
    tap(({ settings }) => {
      store.$settings.set(settings);
    }),
    concatMap(({ settings, previous }) =>
      from(putSettings(settings)).pipe(
        tap(() =>
          notify(store, { tone: 'success', message: 'Zapisano ustawienia.' }),
        ),
        catchError((error: unknown) => {
          store.$settings.set(previous);
          notify(store, {
            tone: 'error',
            title: 'Nie udało się zapisać ustawień',
            code: 'SETTINGS_UPDATE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_UPDATE', { settings }),
          });
          return EMPTY;
        }),
      ),
    ),
  );
