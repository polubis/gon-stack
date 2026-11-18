import { catchError, EMPTY, from, tap, type Observable } from 'rxjs';
import { errorMessage } from '@/shared/errors/error-message';
import type { Bus } from '../bus';
import type { Store } from '../store';
import { notify } from './notify';
import { write } from './pending';

type Mutation<R> = {
  /** The server call, run in the write queue. */
  run: () => Promise<R>;
  /** Puts the answer into the store; runs inside the write queue, before the next write starts. */
  saved: (result: R) => void;
  /** Undoes the optimistic change. */
  rollback: () => void;
  /** Plain success toast; omitted = silent. */
  success?: string;
  failure: { title: string; code: string };
  retry: () => void;
};

/** One optimistic write: the change is already in the store; sync, toast, roll back on failure. */
export const mutate = <R>(
  store: Store,
  bus: Bus,
  { run, saved, rollback, success, failure, retry }: Mutation<R>,
): Observable<unknown> =>
  from(
    write(store, bus, async () => {
      const result = await run();
      saved(result);
      return result;
    }),
  ).pipe(
    tap(() => {
      if (success) notify(store, { tone: 'success', message: success });
    }),
    catchError((error: unknown) => {
      rollback();
      notify(store, {
        tone: 'error',
        ...failure,
        description: errorMessage(error),
        retry,
      });
      return EMPTY;
    }),
  );
