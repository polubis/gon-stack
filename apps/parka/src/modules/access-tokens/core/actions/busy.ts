import type { TokenId } from '../../domain/models';
import type { Store } from '../store';

export const markBusy = (store: Store, id: TokenId): void => {
  store.$busyIds.set([...store.$busyIds.get(), id]);
};

export const clearBusy = (store: Store, id: TokenId): void => {
  store.$busyIds.set(store.$busyIds.get().filter((busy) => busy !== id));
};
