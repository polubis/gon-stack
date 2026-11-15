import { catchError, EMPTY, finalize, from, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { fetchKnowledge } from '../../integration/repository';

/** Reads the whole knowledge base; a newer load cancels an older one. */
export const load = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_LOAD').pipe(
    tap(() => {
      store.$error.reset();
      store.$isLoading.set(true);
    }),
    switchMap(() =>
      from(fetchKnowledge()).pipe(
        tap((data) => {
          store.$categories.set(data.categories);
          store.$priorities.set(data.priorities);
          store.$folders.set(data.folders);
          store.$nodes.set(data.nodes);
        }),
        catchError((error: unknown) => {
          store.$error.set(
            error instanceof Error
              ? error.message
              : 'Failed to load knowledge.',
          );
          return EMPTY;
        }),
        finalize(() => {
          store.$initializing.set(false);
          store.$isLoading.reset();
        }),
      ),
    ),
  );
