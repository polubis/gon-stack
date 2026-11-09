import { sortPriorities } from '../../domain/priority';
import { sortTasks } from '../../domain/schedule';
import type { TimeData } from '../../integration/repository';
import type { Range, Store } from '../store';

/** Puts a read into the store; `false` when a write meanwhile made it outdated. */
export const applyData = (
  store: Store,
  range: Range,
  data: TimeData,
  seq: number,
): boolean => {
  // Writes in flight would be overwritten by older data: ask again.
  if (store.$pending.get() > 0 || store.$writeSeq.get() !== seq) return false;
  store.$categories.set(data.categories);
  store.$priorities.set(sortPriorities(data.priorities));
  store.$statuses.set(data.statuses);
  store.$tasks.set(sortTasks(data.tasks));
  store.$backlog.set(data.backlog);
  store.$loaded.set({ from: range.from, to: range.to });
  return true;
};
