import { tap } from 'rxjs';
import type { Bus } from '../bus';
import type { Store } from '../store';

export const updateSearch = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_UPDATE_SEARCH').pipe(
    tap(({ query }) => {
      store.$searchQuery.set(query);
    }),
  );
