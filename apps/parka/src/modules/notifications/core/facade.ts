import type { NotificationId } from '../domain/models';
import type { Registry } from './registry';
import type { Store } from './store';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    load: () => trigger('[TRIGGER]_LOAD'),
    loadMore: () => trigger('[TRIGGER]_LOAD_MORE'),
    markRead: (id: NotificationId) => trigger('[TRIGGER]_MARK_READ', { id }),
    markAllRead: () => trigger('[TRIGGER]_MARK_ALL_READ'),
    dismissNotice: () => trigger('[TRIGGER]_DISMISS_NOTICE'),
    useNotifications: () => store.$notifications.use(),
    useUnreadCount: () => store.$unread.use(),
    useHasMore: () => store.$nextCursor.use() !== null,
    useInitializing: () => store.$initializing.use(),
    useIsLoading: () => store.$isLoading.use(),
    useLoadingMore: () => store.$loadingMore.use(),
    useMoreError: () => store.$moreError.use(),
    useError: () => store.$error.use(),
    useNotice: () => store.$notice.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
