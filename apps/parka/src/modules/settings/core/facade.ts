import type { Settings } from '../domain/models';
import type { Registry } from './registry';
import type { Store } from './store';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    load: () => trigger('[TRIGGER]_LOAD'),
    update: (settings: Settings) => trigger('[TRIGGER]_UPDATE', { settings }),
    uploadAvatar: (file: File) => trigger('[TRIGGER]_UPLOAD_AVATAR', { file }),
    uploadDevicePhoto: (deviceId: string, file: File) =>
      trigger('[TRIGGER]_UPLOAD_DEVICE_PHOTO', { deviceId, file }),
    togglePush: (enabled: boolean) =>
      trigger('[TRIGGER]_TOGGLE_PUSH', { enabled }),
    dismissNotice: () => trigger('[TRIGGER]_DISMISS_NOTICE'),
    useSettings: () => store.$settings.use(),
    useAvatar: () => store.$avatar.use(),
    useIsUploadingAvatar: () => store.$isUploadingAvatar.use(),
    useUploadingDeviceIds: () => store.$uploadingDeviceIds.use(),
    usePush: () => store.$push.use(),
    useIsPushBusy: () => store.$isPushBusy.use(),
    useInitializing: () => store.$initializing.use(),
    useIsLoading: () => store.$isLoading.use(),
    useError: () => store.$error.use(),
    useNotice: () => store.$notice.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
