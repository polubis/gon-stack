import { catchError, concatMap, EMPTY, finalize, from, tap } from 'rxjs';
import { errorMessage } from '@/shared/errors/error-message';
import { postDemo } from '../../integration/repository';
import { notify } from '../actions/notify';
import { write } from '../actions/pending';
import type { Bus } from '../bus';
import type { Store } from '../store';

/** Creates the sample course, then reads the lists again. */
export const loadDemo = (store: Store, bus: Bus) =>
  bus.ofType('[TRIGGER]_LOAD_DEMO').pipe(
    tap(() => store.$demoBusy.set(true)),
    concatMap(() =>
      from(write(store, bus, postDemo)).pipe(
        tap(() => {
          notify(store, { tone: 'success', message: 'Dodano kurs demo.' });
          const view = store.$view.get();
          if (view) bus.emit('[TRIGGER]_LOAD', { view });
        }),
        catchError((error: unknown) => {
          notify(store, {
            tone: 'error',
            title: 'Nie udało się dodać kursu demo',
            code: 'KNOWLEDGE_DEMO_FAILED',
            description: errorMessage(error),
            retry: () => bus.emit('[TRIGGER]_LOAD_DEMO'),
          });
          return EMPTY;
        }),
        finalize(() => store.$demoBusy.set(false)),
      ),
    ),
  );
