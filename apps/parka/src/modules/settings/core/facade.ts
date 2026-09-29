import type { Settings } from '../domain/models';
import type { Registry } from './registry';
import type { Store } from './store';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    load: () => trigger('[TRIGGER]_LOAD'),
    update: (settings: Settings) => trigger('[TRIGGER]_UPDATE', { settings }),
    signOut: () => trigger('[TRIGGER]_SIGN_OUT'),
    dismissNotice: () => trigger('[TRIGGER]_DISMISS_NOTICE'),
    useSettings: () => store.$settings.use(),
    useInitializing: () => store.$initializing.use(),
    useIsLoading: () => store.$isLoading.use(),
    useIsSigningOut: () => store.$isSigningOut.use(),
    useError: () => store.$error.use(),
    useNotice: () => store.$notice.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
