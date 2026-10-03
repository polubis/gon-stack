import type { Store } from '../store';
import type { Bus } from '../bus';

/** The facade asks for a load; the load itself runs as a task. */
export const requestLoad = (_store: Store, { ofType, forwardAs }: Bus) =>
  ofType('[TRIGGER]_LOAD').pipe(forwardAs('[TASK]_LOAD'));
