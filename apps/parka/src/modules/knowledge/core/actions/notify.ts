import type { NoticeBody } from '../../domain/models';
import type { Store } from '../store';

export const notify = (store: Store, notice: NoticeBody): void => {
  store.$notice.set({
    id: (store.$notice.get()?.id ?? 0) + 1,
    ...notice,
  });
};
