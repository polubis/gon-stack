import type { Bus } from '../bus';
import type { Store } from '../store';

/**
 * Runs a write through the store queue and counts it as pending. When the
 * last one ends and a load was dropped meanwhile, the load is repeated.
 */
export const write = <T>(
  store: Store,
  { emit }: Bus,
  run: () => Promise<T>,
): Promise<T> => {
  store.$pending.set(store.$pending.get() + 1);
  store.$writeSeq.set(store.$writeSeq.get() + 1);
  return store.enqueue(run).finally(() => {
    store.$pending.set(store.$pending.get() - 1);
    store.$writeSeq.set(store.$writeSeq.get() + 1);
    const view = store.$view.get();
    if (store.$pending.get() === 0 && store.$stale.get() && view) {
      emit('[TRIGGER]_LOAD', { view });
    }
  });
};

/** Id the server knows: a placeholder resolves once its create has answered. */
export const resolveId = <T extends string>(store: Store, id: T): T =>
  (store.ids.get(id) as T | undefined) ?? id;
