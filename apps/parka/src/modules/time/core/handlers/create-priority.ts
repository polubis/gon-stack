import { catchError, concatMap, EMPTY, from, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { write } from '../actions/pending';
import { sortPriorities } from '../../domain/priority';
import { postPriority } from '../../integration/repository';

export const createPriority = (store: Store, bus: Bus) => {
  const { ofType, emit } = bus;
  return ofType('[TRIGGER]_CREATE_PRIORITY').pipe(
    tap(({ priority }) => {
      store.$priorities.set(
        sortPriorities([...store.$priorities.get(), priority]),
      );
    }),
    concatMap(({ priority }) =>
      from(write(store, bus, () => postPriority(priority))).pipe(
        tap(() =>
          notify(store, { tone: 'success', message: 'Dodano priorytet.' }),
        ),
        catchError((error: unknown) => {
          store.$priorities.set(
            store.$priorities.get().filter((p) => p.id !== priority.id),
          );
          notify(store, {
            tone: 'error',
            title: 'Nie udało się dodać priorytetu',
            code: 'TASK_PRIORITY_CREATE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_CREATE_PRIORITY', { priority }),
          });
          return EMPTY;
        }),
      ),
    ),
  );
};
