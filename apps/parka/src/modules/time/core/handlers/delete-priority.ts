import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { write } from '../actions/pending';
import {
  PriorityInUseError,
  removePriority,
} from '../../integration/repository';

export const deletePriority = (store: Store, bus: Bus) => {
  const { ofType, emit } = bus;
  return ofType('[TRIGGER]_DELETE_PRIORITY').pipe(
    map(({ id }) => ({ id, previous: store.$priorities.get() })),
    tap(({ id, previous }) => {
      store.$priorities.set(previous.filter((p) => p.id !== id));
    }),
    concatMap(({ id, previous }) =>
      from(write(store, bus, () => removePriority(id))).pipe(
        tap(() =>
          notify(store, { tone: 'success', message: 'Usunięto priorytet.' }),
        ),
        catchError((error: unknown) => {
          store.$priorities.set(previous);
          notify(
            store,
            error instanceof PriorityInUseError
              ? {
                  tone: 'error',
                  title: 'Priorytet jest używany',
                  code: 'TASK_PRIORITY_IN_USE',
                  description:
                    'Zadania lub cykle nadal używają tego priorytetu. Najpierw przepnij je na inny.',
                }
              : {
                  tone: 'error',
                  title: 'Nie udało się usunąć priorytetu',
                  code: 'TASK_PRIORITY_DELETE_FAILED',
                  description: errorMessage(error),
                  retry: () => emit('[TRIGGER]_DELETE_PRIORITY', { id }),
                },
          );
          return EMPTY;
        }),
      ),
    ),
  );
};
