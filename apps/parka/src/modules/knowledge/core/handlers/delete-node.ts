import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { removeNode } from '../../integration/repository';
import { notify } from '../actions/notify';

export const deleteNode = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_DELETE_NODE').pipe(
    map(({ id }) => ({
      id,
      previous: store.$nodes.get().find((n) => n.id === id),
    })),
    tap(({ id }) =>
      store.$nodes.set(store.$nodes.get().filter((n) => n.id !== id)),
    ),
    concatMap(({ id, previous }) =>
      from(store.enqueue(() => removeNode(id))).pipe(
        tap(() =>
          notify(store, { tone: 'success', message: 'Usunięto węzeł.' }),
        ),
        catchError((error: unknown) => {
          if (previous) store.$nodes.set([...store.$nodes.get(), previous]);
          notify(store, {
            tone: 'error',
            title: 'Nie udało się usunąć węzła',
            code: 'NODE_DELETE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_DELETE_NODE', { id }),
          });
          return EMPTY;
        }),
      ),
    ),
  );
