import { catchError, EMPTY, from, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { fetchCategories } from '../../integration/repository';

/** Reloads the categories after an outside change: no loading state, no error. */
export const refresh = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_REFRESH').pipe(
    switchMap(() =>
      from(fetchCategories(new AbortController().signal)).pipe(
        tap((categories) => store.$categories.set(categories)),
        catchError(() => EMPTY),
      ),
    ),
  );
