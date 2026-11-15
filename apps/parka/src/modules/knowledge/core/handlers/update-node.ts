import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { putNode } from '../../integration/repository';
import { notify } from '../actions/notify';

export const updateNode = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_UPDATE_NODE').pipe(
    map(({ node, message }) => ({
      node,
      message,
      previous: store.$nodes.get().find((n) => n.id === node.id),
    })),
    tap(({ node }) =>
      store.$nodes.set(
        store.$nodes.get().map((n) => (n.id === node.id ? node : n)),
      ),
    ),
    concatMap(({ node, previous, message }) =>
      from(store.enqueue(() => putNode(node))).pipe(
        tap(() =>
          notify(store, {
            tone: 'success',
            message: message ?? 'Zapisano zmiany.',
          }),
        ),
        catchError((error: unknown) => {
          const current = store.$nodes.get().find((n) => n.id === node.id);
          // Only undo our own change, not a newer one.
          if (previous && current === node)
            store.$nodes.set(
              store.$nodes.get().map((n) => (n.id === node.id ? previous : n)),
            );
          notify(store, {
            tone: 'error',
            title: 'Nie udało się zapisać węzła',
            code: 'NODE_UPDATE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_UPDATE_NODE', { node, message }),
          });
          return EMPTY;
        }),
      ),
    ),
  );
