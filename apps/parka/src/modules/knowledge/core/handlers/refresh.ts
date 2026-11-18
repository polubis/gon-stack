import { catchError, EMPTY, from, map, switchMap, tap } from 'rxjs';
import { resetKnowledgeReads } from '../../integration/repository';
import type { Bus } from '../bus';
import type { Store } from '../store';
import { applyView, fetchView } from './load';

/** Reads the view again after an outside change: no loading state, no error. */
export const refresh = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_REFRESH').pipe(
    map(() => store.$view.get()),
    switchMap((view) => {
      if (!view) return EMPTY;
      const seq = store.$writeSeq.get();
      resetKnowledgeReads();
      return from(fetchView(view)).pipe(
        tap((data) => applyView(store, data, seq)),
        catchError(() => EMPTY),
      );
    }),
  );
