import type { Notice } from '../../domain/models';
import type { Store } from '../store';

export const notify = (
  store: Store,
  tone: Notice['tone'],
  message: string,
): void => {
  store.$notice.set({
    id: (store.$notice.get()?.id ?? 0) + 1,
    tone,
    message,
  });
};
