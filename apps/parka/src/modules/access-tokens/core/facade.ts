import type { TokenId } from '../domain/models';
import type { Registry } from './registry';
import type { Store } from './store';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    load: () => trigger('[TRIGGER]_LOAD'),
    create: (name: string, ttlDays: number | null) =>
      trigger('[TRIGGER]_CREATE', { name, ttlDays }),
    rename: (id: TokenId, name: string) =>
      trigger('[TRIGGER]_RENAME', { id, name }),
    rotate: (id: TokenId) => trigger('[TRIGGER]_ROTATE', { id }),
    revoke: (id: TokenId) => trigger('[TRIGGER]_REVOKE', { id }),
    remove: (id: TokenId) => trigger('[TRIGGER]_REMOVE', { id }),
    dismissSecret: () => trigger('[TRIGGER]_DISMISS_SECRET'),
    dismissNotice: () => trigger('[TRIGGER]_DISMISS_NOTICE'),
    useTokens: () => store.$tokens.use(),
    useSecret: () => store.$secret.use(),
    useBusyIds: () => store.$busyIds.use(),
    useIsCreating: () => store.$isCreating.use(),
    useInitializing: () => store.$initializing.use(),
    useIsLoading: () => store.$isLoading.use(),
    useError: () => store.$error.use(),
    useNotice: () => store.$notice.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
