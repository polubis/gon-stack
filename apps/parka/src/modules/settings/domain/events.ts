import type { TriggerEvent } from '@/libs/eda';
import type { Settings } from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_LOAD'>
  | TriggerEvent<'[TRIGGER]_UPDATE', { settings: Settings }>
  | TriggerEvent<'[TRIGGER]_UPLOAD_AVATAR', { file: File }>
  | TriggerEvent<
      '[TRIGGER]_UPLOAD_DEVICE_PHOTO',
      { deviceId: string; file: File }
    >
  | TriggerEvent<'[TRIGGER]_TOGGLE_PUSH', { enabled: boolean }>
  | TriggerEvent<'[TRIGGER]_SIGN_OUT'>
  | TriggerEvent<'[TRIGGER]_DISMISS_NOTICE'>;
