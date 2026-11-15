import { catchError, concatMap, EMPTY, from, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { postNode } from '../../integration/repository';
import { notify } from '../actions/notify';

export const createNode = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_CREATE_NODE').pipe(
    tap(({ node }) => store.$nodes.set([...store.$nodes.get(), node])),
    concatMap(({ node }) =>
      from(store.enqueue(() => postNode(node))).pipe(
        tap(() => notify(store, { tone: 'success', message: 'Dodano węzeł.' })),
        catchError((error: unknown) => {
          store.$nodes.set(store.$nodes.get().filter((n) => n.id !== node.id));
          notify(store, {
            tone: 'error',
            title: 'Nie udało się dodać węzła',
            code: 'NODE_CREATE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_CREATE_NODE', { node }),
          });
          return EMPTY;
        }),
      ),
    ),
  );
